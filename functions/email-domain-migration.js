"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");

const PAGE_SIZE = 1000;
const MAX_COLLISION_REPORT = 100;
const MAX_BATCH_WRITES = 400;
const DEFAULT_FROM_DOMAIN = "menyra.com";
const DEFAULT_TO_DOMAIN = "mnyra.com";

const EMAIL_FIELDS = Object.freeze([
  "email",
  "ownerEmail",
  "socialEmail",
  "contactEmail",
  "accountEmail",
  "loginEmail",
  "staffEmail"
]);

const UID_DOC_COLLECTIONS = Object.freeze([
  "users",
  "staffAdmins",
  "superadmins"
]);

const TOP_LEVEL_COLLECTIONS = Object.freeze([
  "users",
  "leads",
  "restaurants",
  "staffAdmins",
  "staffIndex",
  "staffRequests",
  "superadmins"
]);

const COLLECTION_GROUPS = Object.freeze([
  "staff"
]);

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function lower(value) {
  return asText(value).toLowerCase();
}

function splitEmail(email) {
  const safe = asText(email);
  const at = safe.lastIndexOf("@");
  if (at <= 0 || at === safe.length - 1) return null;
  return {
    localPart: safe.slice(0, at),
    domain: safe.slice(at + 1)
  };
}

function mapEmailDomain(email, fromDomain, toDomain) {
  const parsed = splitEmail(email);
  if (!parsed) return null;
  if (lower(parsed.domain) !== lower(fromDomain)) return null;
  return `${parsed.localPart}@${toDomain}`;
}

function pickConfigSecret() {
  const fromEnv = asText(process.env.MNYRA_MIGRATION_SECRET || process.env.MENYRA_MIGRATION_SECRET);
  if (fromEnv) return fromEnv;
  try {
    const cfg = functions.config() || {};
    return asText(
      cfg?.mnyra?.migration_secret
      || cfg?.menyra?.migration_secret
      || cfg?.migration?.secret
    );
  } catch (err) {
    return "";
  }
}

function readRequestSecret(req) {
  const headerToken = asText(req.get("x-migration-token"));
  if (headerToken) return headerToken;
  const queryToken = asText(req.query?.token);
  if (queryToken) return queryToken;
  const bodyToken = asText(req.body?.token);
  if (bodyToken) return bodyToken;

  const auth = asText(req.get("authorization"));
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
}

function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const norm = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(norm)) return true;
  if (["0", "false", "no", "n", "off"].includes(norm)) return false;
  return fallback;
}

function parseIntSafe(value, fallback = 0) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.floor(num));
}

function sameEmail(a, b) {
  return lower(a) === lower(b);
}

async function listAllUsers(auth, { limit = 0, pageToken = "", pageSize = PAGE_SIZE } = {}) {
  const safePageSize = Math.max(1, Math.min(PAGE_SIZE, parseIntSafe(pageSize, PAGE_SIZE) || PAGE_SIZE));
  const safeLimit = parseIntSafe(limit, 0);
  const users = [];
  let nextPageToken = asText(pageToken);
  do {
    const remaining = safeLimit > 0 ? Math.max(0, safeLimit - users.length) : 0;
    const fetchSize = safeLimit > 0 ? Math.max(1, Math.min(safePageSize, remaining)) : safePageSize;
    const page = await auth.listUsers(fetchSize, nextPageToken || undefined);
    for (const user of page.users || []) {
      users.push({
        uid: asText(user.uid),
        email: asText(user.email),
        emailVerified: !!user.emailVerified
      });
      if (safeLimit > 0 && users.length >= safeLimit) {
        return {
          users,
          nextPageToken: asText(page.pageToken)
        };
      }
    }
    nextPageToken = asText(page.pageToken);
  } while (nextPageToken);
  return {
    users,
    nextPageToken: ""
  };
}

function buildMigrationPlan(users, fromDomain, toDomain) {
  const existingByEmail = new Map();
  for (const user of users) {
    if (!user.email) continue;
    existingByEmail.set(lower(user.email), user.uid);
  }

  const candidates = [];
  for (const user of users) {
    if (!user.email) continue;
    const nextEmail = mapEmailDomain(user.email, fromDomain, toDomain);
    if (!nextEmail) continue;
    if (sameEmail(user.email, nextEmail)) continue;
    candidates.push({
      uid: user.uid,
      oldEmail: user.email,
      newEmail: nextEmail,
      emailVerified: user.emailVerified
    });
  }

  const duplicateTargets = [];
  const targetOwners = new Map();
  for (const row of candidates) {
    const key = lower(row.newEmail);
    if (!targetOwners.has(key)) targetOwners.set(key, []);
    targetOwners.get(key).push(row);
  }
  for (const [key, owners] of targetOwners.entries()) {
    if (owners.length <= 1) continue;
    duplicateTargets.push({
      targetEmail: owners[0].newEmail,
      uids: owners.map((x) => x.uid),
      sources: owners.map((x) => x.oldEmail)
    });
  }

  const externalCollisions = [];
  for (const row of candidates) {
    const targetKey = lower(row.newEmail);
    const existingUid = existingByEmail.get(targetKey);
    if (!existingUid) continue;
    if (existingUid === row.uid) continue;
    externalCollisions.push({
      uid: row.uid,
      oldEmail: row.oldEmail,
      newEmail: row.newEmail,
      collisionUid: existingUid
    });
  }

  const blocked = new Set();
  duplicateTargets.forEach((item) => item.uids.forEach((uid) => blocked.add(uid)));
  externalCollisions.forEach((item) => blocked.add(item.uid));

  const safeCandidates = candidates.filter((row) => !blocked.has(row.uid));

  return {
    candidates,
    safeCandidates,
    duplicateTargets,
    externalCollisions
  };
}

function buildFirestoreRepairRows(users, fromDomain, toDomain) {
  const rows = [];
  for (const user of users) {
    const parsed = splitEmail(user.email);
    if (!parsed) continue;
    if (lower(parsed.domain) !== lower(toDomain)) continue;
    const oldEmail = `${parsed.localPart}@${fromDomain}`;
    if (sameEmail(oldEmail, user.email)) continue;
    rows.push({
      uid: user.uid,
      oldEmail,
      newEmail: user.email,
      emailVerified: user.emailVerified
    });
  }
  return rows;
}

function ensurePatchEntry(patches, ref) {
  const key = ref.path;
  if (!patches.has(key)) {
    patches.set(key, { ref, data: {} });
  }
  return patches.get(key);
}

function addPatchIfChanged(patches, ref, field, oldEmail, newEmail, docData = null) {
  const data = docData || {};
  const current = asText(data[field]);
  if (!current) return false;
  if (!sameEmail(current, oldEmail)) return false;
  const entry = ensurePatchEntry(patches, ref);
  entry.data[field] = newEmail;
  return true;
}

function uniqueEmailVariants(email) {
  const raw = asText(email);
  const lowered = lower(email);
  if (!raw) return [];
  if (raw === lowered) return [raw];
  return [raw, lowered];
}

function compactError(err) {
  return asText(err?.message || err?.code || err, "unknown_error");
}

async function collectQueryPatches({ query, patches, field, oldEmail, newEmail, queryErrors, scope, value }) {
  try {
    const snap = await query.get();
    snap.forEach((docSnap) => {
      addPatchIfChanged(patches, docSnap.ref, field, oldEmail, newEmail, docSnap.data() || {});
    });
  } catch (err) {
    queryErrors.push({
      scope,
      field,
      value,
      error: compactError(err)
    });
  }
}

async function collectFirestorePatches(db, uid, oldEmail, newEmail) {
  const patches = new Map();
  const queryErrors = [];
  const variants = uniqueEmailVariants(oldEmail);

  for (const col of UID_DOC_COLLECTIONS) {
    try {
      const ref = db.collection(col).doc(uid);
      const snap = await ref.get();
      if (!snap.exists) continue;
      const data = snap.data() || {};
      for (const field of EMAIL_FIELDS) {
        addPatchIfChanged(patches, ref, field, oldEmail, newEmail, data);
      }
    } catch (err) {
      queryErrors.push({
        scope: `uid-doc:${col}`,
        field: "",
        value: uid,
        error: compactError(err)
      });
    }
  }

  for (const col of TOP_LEVEL_COLLECTIONS) {
    for (const field of EMAIL_FIELDS) {
      for (const value of variants) {
        await collectQueryPatches({
          query: db.collection(col).where(field, "==", value),
          patches,
          field,
          oldEmail,
          newEmail,
          queryErrors,
          scope: `top:${col}`,
          value
        });
      }
    }
  }

  for (const group of COLLECTION_GROUPS) {
    for (const field of EMAIL_FIELDS) {
      for (const value of variants) {
        await collectQueryPatches({
          query: db.collectionGroup(group).where(field, "==", value),
          patches,
          field,
          oldEmail,
          newEmail,
          queryErrors,
          scope: `group:${group}`,
          value
        });
      }
    }
  }

  return { patches, queryErrors };
}

async function commitPatches(patches) {
  const entries = Array.from(patches.values());
  let writes = 0;
  for (let i = 0; i < entries.length; i += MAX_BATCH_WRITES) {
    const chunk = entries.slice(i, i + MAX_BATCH_WRITES);
    const batch = admin.firestore().batch();
    chunk.forEach((entry) => {
      batch.set(entry.ref, entry.data, { merge: true });
      writes += 1;
    });
    await batch.commit();
  }
  return writes;
}

function rewriteEmailFieldValue(value, fromDomain, toDomain) {
  const current = asText(value);
  if (!current) return "";
  const next = mapEmailDomain(current, fromDomain, toDomain);
  if (!next) return "";
  if (sameEmail(current, next)) return "";
  return next;
}

async function rewriteLeadDomainPage(db, { fromDomain, toDomain, limit, pageToken }) {
  const pageSize = Math.max(1, Math.min(MAX_BATCH_WRITES, parseIntSafe(limit, 200) || 200));
  const startAfterId = asText(pageToken);
  let query = db.collection("leads")
    .orderBy(admin.firestore.FieldPath.documentId())
    .limit(pageSize);
  if (startAfterId) {
    query = query.startAfter(startAfterId);
  }

  const snap = await query.get();
  if (snap.empty) {
    return {
      nextPageToken: "",
      leadDocsScanned: 0,
      leadDocsUpdated: 0,
      leadFieldUpdates: 0
    };
  }

  const batch = admin.firestore().batch();
  let leadDocsScanned = 0;
  let leadDocsUpdated = 0;
  let leadFieldUpdates = 0;

  snap.forEach((docSnap) => {
    leadDocsScanned += 1;
    const data = docSnap.data() || {};
    const patch = {};
    for (const field of EMAIL_FIELDS) {
      const nextValue = rewriteEmailFieldValue(data[field], fromDomain, toDomain);
      if (!nextValue) continue;
      patch[field] = nextValue;
    }
    const changedFields = Object.keys(patch);
    if (!changedFields.length) return;
    leadDocsUpdated += 1;
    leadFieldUpdates += changedFields.length;
    batch.set(docSnap.ref, patch, { merge: true });
  });

  if (leadDocsUpdated > 0) {
    await batch.commit();
  }

  const lastDoc = snap.docs[snap.docs.length - 1];
  return {
    nextPageToken: asText(lastDoc?.id),
    leadDocsScanned,
    leadDocsUpdated,
    leadFieldUpdates
  };
}

async function runMigration({ mode, fromDomain, toDomain, limit, scanFirestore, pageToken, pageSize }) {
  const auth = admin.auth();
  const db = admin.firestore();

  if (mode === "leads-rewrite") {
    const leadPage = await rewriteLeadDomainPage(db, {
      fromDomain,
      toDomain,
      limit,
      pageToken
    });
    return {
      mode,
      fromDomain,
      toDomain,
      usersScanned: 0,
      nextPageToken: leadPage.nextPageToken,
      candidates: leadPage.leadDocsScanned,
      safeCandidates: leadPage.leadDocsScanned,
      blockedCandidates: 0,
      authUpdated: 0,
      firestoreDocsUpdated: leadPage.leadDocsUpdated,
      leadDocsScanned: leadPage.leadDocsScanned,
      leadDocsUpdated: leadPage.leadDocsUpdated,
      leadFieldUpdates: leadPage.leadFieldUpdates,
      duplicateTargets: [],
      externalCollisions: [],
      errors: [],
      perUser: []
    };
  }

  const userPage = await listAllUsers(auth, { limit, pageToken, pageSize });
  const users = userPage.users;
  const plan = buildMigrationPlan(users, fromDomain, toDomain);
  const executeAuth = mode === "execute";
  const executeFirestore = mode === "execute" || mode === "firestore-repair";
  const repairFirestoreOnly = mode === "firestore-repair";
  const rows = repairFirestoreOnly
    ? buildFirestoreRepairRows(users, fromDomain, toDomain)
    : plan.safeCandidates;

  const perUser = [];
  const errors = [];
  let authUpdated = 0;
  let firestoreDocsUpdated = 0;

  for (const row of rows) {
    const item = {
      uid: row.uid,
      oldEmail: row.oldEmail,
      newEmail: row.newEmail,
      auth: executeAuth ? "pending" : (repairFirestoreOnly ? "skipped" : "dry-run"),
      firestoreDocs: 0
    };

    if (executeAuth) {
      try {
        await auth.updateUser(row.uid, {
          email: row.newEmail,
          emailVerified: row.emailVerified
        });
        authUpdated += 1;
        item.auth = "updated";
      } catch (err) {
        item.auth = "failed";
        item.error = compactError(err);
        errors.push({ uid: row.uid, stage: "auth", error: compactError(err) });
        perUser.push(item);
        continue;
      }
    }

    if (scanFirestore) {
      try {
        const { patches, queryErrors } = await collectFirestorePatches(db, row.uid, row.oldEmail, row.newEmail);
        item.firestoreDocs = patches.size;
        if (queryErrors.length) {
          item.firestoreQueryErrors = queryErrors.slice(0, 3);
          errors.push({
            uid: row.uid,
            stage: "firestore_query",
            error: queryErrors[0].error
          });
        }
        if (executeFirestore && patches.size > 0) {
          const written = await commitPatches(patches);
          firestoreDocsUpdated += written;
          item.firestoreDocs = written;
        }
      } catch (err) {
        item.firestoreError = compactError(err);
        errors.push({ uid: row.uid, stage: "firestore", error: compactError(err) });
      }
    }

    perUser.push(item);
  }

  return {
    mode,
    fromDomain,
    toDomain,
    usersScanned: users.length,
    nextPageToken: userPage.nextPageToken,
    candidates: repairFirestoreOnly ? rows.length : plan.candidates.length,
    safeCandidates: repairFirestoreOnly ? rows.length : plan.safeCandidates.length,
    blockedCandidates: repairFirestoreOnly ? 0 : (plan.candidates.length - plan.safeCandidates.length),
    authUpdated,
    firestoreDocsUpdated,
    duplicateTargets: repairFirestoreOnly ? [] : plan.duplicateTargets.slice(0, MAX_COLLISION_REPORT),
    externalCollisions: repairFirestoreOnly ? [] : plan.externalCollisions.slice(0, MAX_COLLISION_REPORT),
    errors: errors.slice(0, MAX_COLLISION_REPORT),
    perUser: perUser.slice(0, MAX_COLLISION_REPORT)
  };
}

const migrateEmailsToMnyra = functions
  .region("us-central1")
  .runWith({ timeoutSeconds: 540, memory: "1GB" })
  .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const expectedSecret = pickConfigSecret();
    if (!expectedSecret) {
      return res.status(503).json({ ok: false, error: "migration_secret_not_configured" });
    }

    const providedSecret = readRequestSecret(req);
    if (!providedSecret || providedSecret !== expectedSecret) {
      return res.status(403).json({ ok: false, error: "forbidden" });
    }

    const modeRaw = lower(req.body?.mode || req.query?.mode || "dry-run");
    const mode = ["dry-run", "execute", "firestore-repair", "leads-rewrite"].includes(modeRaw)
      ? modeRaw
      : "dry-run";
    const fromDomain = lower(req.body?.fromDomain || req.query?.fromDomain || DEFAULT_FROM_DOMAIN);
    const toDomain = lower(req.body?.toDomain || req.query?.toDomain || DEFAULT_TO_DOMAIN);
    const limit = parseIntSafe(req.body?.limit || req.query?.limit || 0, 0);
    const pageToken = asText(req.body?.pageToken || req.query?.pageToken);
    const pageSize = parseIntSafe(req.body?.pageSize || req.query?.pageSize || PAGE_SIZE, PAGE_SIZE);
    const scanFirestoreDefault = mode !== "dry-run";
    const scanFirestore = parseBool(req.body?.scanFirestore || req.query?.scanFirestore, scanFirestoreDefault);

    try {
      const result = await runMigration({
        mode,
        fromDomain,
        toDomain,
        limit,
        scanFirestore,
        pageToken,
        pageSize
      });

      return res.status(200).json({
        ok: true,
        at: new Date().toISOString(),
        result
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: compactError(err)
      });
    }
  });

module.exports = {
  migrateEmailsToMnyra
};
