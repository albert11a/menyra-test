#!/usr/bin/env node
"use strict";

/*
  DRY-RUN ONLY Firebase data-contract repair proposal tool for Mnyra.

  Example:
    GOOGLE_APPLICATION_CREDENTIALS=/path/to/read-only-service-account.json node functions/scripts/backfill-mnyra-data-contract-dryrun.cjs --restaurantId xxx --out C:/mnyra-secrets/mnyra-data-contract-dryrun.json

  Safety:
    - This script only reads Firestore.
    - It never writes, deletes, deploys rules, or runs migrations.
    - APPLY=1, --apply, and write-like flags are refused.
    - Ambiguous owner relations and conflicting data are reported, not fixed.
    - Emails are masked in output. Service account/private key data is never printed.
*/

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const REFUSED_FLAGS = new Set([
  "--apply",
  "--write",
  "--delete",
  "--migrate",
  "--migration",
  "--deploy",
  "--set",
  "--update"
]);

const ROUTE_SLUG_FIELDS = Object.freeze(["publicSlug", "landingSlug"]);
const ACTIVE_RESTAURANT_STATUSES = new Set(["active", "kunde", "customer"]);
const INACTIVE_RESTAURANT_STATUSES = new Set(["inactive", "disabled", "deleted", "blocked"]);
const REVIEW_RESTAURANT_STATUSES = new Set(["lead", "pending", "registered"]);
const LEAD_ROUTE_RESTAURANT_STATUSES = new Set(["lead", "prospect"]);
const PREVIEW_ROUTE_RESTAURANT_STATUSES = new Set(["preview", "demo"]);

function text(value = "") {
  return String(value || "").trim();
}

function lower(value = "") {
  return text(value).toLowerCase();
}

function addUnique(list, value = "") {
  const safe = text(value);
  if (safe && !list.includes(safe)) list.push(safe);
}

function parseArgs(argv = []) {
  const args = {
    uid: "",
    restaurantId: "",
    slug: "",
    limit: 250,
    out: "",
    refused: []
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = String(argv[index] || "");
    const [key, inlineValue] = arg.includes("=") ? arg.split(/=(.*)/s, 2) : [arg, ""];
    if (REFUSED_FLAGS.has(key)) {
      args.refused.push(key);
      continue;
    }
    const readValue = () => {
      if (inlineValue) return inlineValue;
      const next = argv[index + 1];
      if (next !== undefined && !String(next).startsWith("--")) {
        index += 1;
        return String(next);
      }
      return "";
    };
    if (key === "--uid") args.uid = text(readValue());
    else if (key === "--restaurantId" || key === "--restaurant-id") args.restaurantId = text(readValue());
    else if (key === "--slug") args.slug = normalizeSlug(readValue());
    else if (key === "--limit") args.limit = Math.max(1, Math.min(1000, Number(readValue()) || 250));
    else if (key === "--out") args.out = text(readValue());
    else if (key.startsWith("--")) args.refused.push(key);
  }
  return args;
}

function refuseIfUnsafe(args) {
  if (process.env.APPLY === "1") {
    console.error("Refusing to run: APPLY=1 was provided. This tool is dry-run only.");
    process.exit(1);
  }
  if (args.refused.length) {
    console.error(`Refusing to run: unsupported/write-like flag(s): ${args.refused.join(", ")}`);
    process.exit(1);
  }
}

function sanitizeError(err) {
  const code = text(err?.code);
  let message = text(err?.message || err);
  message = message
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g, "[redacted-key]")
    .replace(/private_key[^,\n}]*/gi, "private_key=[redacted]");
  return { code, message };
}

function maskEmail(value = "") {
  const email = text(value);
  if (!email) return "";
  const at = email.indexOf("@");
  if (at < 0) return email.length <= 2 ? "***" : `${email.slice(0, 2)}***`;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const maskedLocal = local ? `${local[0]}***` : "***";
  const domainParts = domain.split(".");
  const domainName = domainParts.shift() || "";
  const suffix = domainParts.length ? `.${domainParts.join(".")}` : "";
  const maskedDomain = domainName ? `${domainName[0]}***${suffix}` : "***";
  return `${maskedLocal}@${maskedDomain}`;
}

function normalizeSlug(value = "") {
  let slug = lower(value);
  if (!slug || slug.includes(".")) return "";
  try {
    if (typeof slug.normalize === "function") {
      slug = slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  return slug
    .replace(/^@+/, "")
    .replace(/&/g, " and ")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function readDefaultProjectId() {
  const envProject = text(process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID);
  if (envProject) return envProject;
  try {
    const rcPath = path.resolve(process.cwd(), ".firebaserc");
    const parsed = JSON.parse(fs.readFileSync(rcPath, "utf8"));
    return text(parsed?.projects?.default);
  } catch {
    return "";
  }
}

function initializeAdmin() {
  if (admin.apps.length) return;
  const projectId = readDefaultProjectId();
  if (projectId) admin.initializeApp({ projectId });
  else admin.initializeApp();
}

async function safeGetDoc(ref, report, pathLabel) {
  report.pathsRead.push(pathLabel);
  try {
    const snap = await ref.get();
    return { ok: true, snap };
  } catch (err) {
    report.warnings.push({ path: pathLabel, error: sanitizeError(err) });
    return { ok: false, snap: null };
  }
}

async function safeGetQuery(queryRef, report, pathLabel) {
  report.pathsRead.push(pathLabel);
  try {
    const snap = await queryRef.get();
    return { ok: true, snap };
  } catch (err) {
    report.warnings.push({ path: pathLabel, error: sanitizeError(err) });
    return { ok: false, snap: null };
  }
}

async function safeCount(ref, report, pathLabel) {
  try {
    if (ref && typeof ref.count === "function") {
      report.pathsRead.push(`${pathLabel}#count`);
      const snap = await ref.count().get();
      return Number(snap.data().count || 0) || 0;
    }
  } catch (err) {
    report.warnings.push({ path: `${pathLabel}#count`, error: sanitizeError(err) });
  }
  return null;
}

function isMalformedDocId(id = "") {
  const safe = text(id);
  return !safe || safe.startsWith(".") || safe.includes("=") || safe.includes("&") || safe.includes("?") || safe.includes("/");
}

function pickUser(docSnap) {
  const data = docSnap.data() || {};
  const emailRaw = text(data.email || data.ownerEmail || data.loginEmail || data.accountEmail || "");
  return {
    id: docSnap.id,
    path: `users/${docSnap.id}`,
    data,
    emailRaw,
    public: {
      path: `users/${docSnap.id}`,
      id: docSnap.id,
      uidField: text(data.uid),
      role: text(data.role),
      status: text(data.status),
      restaurantId: text(data.restaurantId),
      staffRestaurantId: text(data.staffRestaurantId),
      waiterRestaurantId: text(data.waiterRestaurantId),
      emailMasked: maskEmail(emailRaw),
      malformedDocId: isMalformedDocId(docSnap.id)
    }
  };
}

function pickRestaurant(docSnap) {
  const data = docSnap.data() || {};
  const ownerEmailRaw = text(data.ownerEmail || data.email || data.contactEmail || data.socialEmail || "");
  return {
    id: docSnap.id,
    path: `restaurants/${docSnap.id}`,
    data,
    ownerEmailRaw,
    public: {
      path: `restaurants/${docSnap.id}`,
      id: docSnap.id,
      ownerUid: text(data.ownerUid),
      ownerEmailMasked: maskEmail(ownerEmailRaw),
      name: text(data.name || data.restaurantName),
      publicSlug: text(data.publicSlug),
      landingSlug: text(data.landingSlug),
      status: text(data.status)
    }
  };
}

function routeStatusProposal(restaurantStatus = "") {
  const status = lower(restaurantStatus);
  if (ACTIVE_RESTAURANT_STATUSES.has(status)) {
    return { status: "active", safe: true, category: "safeRouteCandidate", reason: "restaurant status is active/customer" };
  }
  if (LEAD_ROUTE_RESTAURANT_STATUSES.has(status)) {
    return { status: "lead", safe: true, category: "safeRouteCandidate", reason: "lead restaurant is intentionally routable when slug is unique" };
  }
  if (PREVIEW_ROUTE_RESTAURANT_STATUSES.has(status)) {
    return { status: "preview", safe: true, category: "safeRouteCandidate", reason: "preview/demo restaurant is intentionally routable when slug is unique" };
  }
  if (INACTIVE_RESTAURANT_STATUSES.has(status)) {
    return { status: "inactive", safe: false, category: "needsReview", reason: "restaurant status is inactive/disabled/deleted/blocked; do not create route automatically" };
  }
  if (REVIEW_RESTAURANT_STATUSES.has(status)) {
    return {
      status: status || "needsReview",
      safe: false,
      category: "needsReview",
      reason: "restaurant status is not a confirmed route status; review route visibility before applying"
    };
  }
  return {
    status: status || "needsReview",
    safe: false,
    category: "needsReview",
    reason: "restaurant status is missing or not recognized; review before applying"
  };
}

function expectedTruthState(items = []) {
  return Array.isArray(items) && items.length > 0 ? "seeded" : "knownEmpty";
}

function truthMetadataProposal({
  pathLabel,
  data,
  sourceField,
  stateField,
  expectedSource,
  expectedState,
  targetKind,
  restaurantId
}) {
  const existingSource = text(data[sourceField]);
  const existingState = text(data[stateField]);
  const patch = {};
  const conflicts = [];

  if (!existingSource) patch[sourceField] = expectedSource;
  else if (existingSource !== expectedSource) {
    conflicts.push({
      path: pathLabel,
      restaurantId,
      targetKind,
      field: sourceField,
      existingValue: existingSource,
      expectedValue: expectedSource,
      action: "skip"
    });
  }

  if (!existingState) patch[stateField] = expectedState;
  else if (existingState !== expectedState) {
    conflicts.push({
      path: pathLabel,
      restaurantId,
      targetKind,
      field: stateField,
      existingValue: existingState,
      expectedValue: expectedState,
      action: "skip"
    });
  }

  if (!Object.keys(patch).length || conflicts.length) {
    return { patch: null, conflicts };
  }
  patch.updatedAt = "[serverTimestamp()]";
  return {
    patch,
    conflicts: []
  };
}

function conservativeStatusProposal(user, restaurantsById, staffDocsByKey) {
  const role = lower(user.public.role);
  if (!role) {
    return {
      value: "",
      safe: false,
      reason: "role is missing; do not invent status"
    };
  }

  if (role === "business") {
    const restaurant = restaurantsById.get(user.public.restaurantId);
    const restaurantStatus = lower(restaurant?.public?.status || "");
    if (restaurant && ACTIVE_RESTAURANT_STATUSES.has(restaurantStatus)) {
      return { value: "active", safe: true, reason: "business user has linked active restaurant" };
    }
    if (restaurant && (REVIEW_RESTAURANT_STATUSES.has(restaurantStatus) || !restaurantStatus)) {
      return { value: "pending", safe: true, reason: "business user has linked non-active or missing restaurant status" };
    }
    return { value: "needsReview", safe: false, reason: "business restaurant link missing or inactive/conflicting" };
  }

  if (role === "staff") {
    const staffRestaurantId = user.public.staffRestaurantId || user.public.waiterRestaurantId || user.public.restaurantId;
    const staffDoc = staffDocsByKey.get(`${staffRestaurantId}/${user.id}`);
    const staffStatus = lower(staffDoc?.status || staffDoc?.staffStatus || "");
    const staffActive = staffDoc
      ? staffDoc.active !== false && staffDoc.staffActive !== false && staffStatus !== "disabled"
      : false;
    if (staffRestaurantId && staffActive) {
      return { value: "active", safe: true, reason: "staff user has active restaurant staff doc" };
    }
    if (staffRestaurantId) {
      return { value: "pending", safe: true, reason: "staff user has restaurant link but staff doc is missing or not clearly active" };
    }
    return { value: "needsReview", safe: false, reason: "staff user has no restaurant link" };
  }

  if (role === "user" || role === "ceo") {
    return { value: "pending", safe: true, reason: "non-business account has role but no linked active account truth" };
  }

  return { value: "needsReview", safe: false, reason: "unrecognized role" };
}

async function loadUsers(db, args, report) {
  const usersById = new Map();
  const addDocs = (docs = []) => docs.forEach((doc) => usersById.set(doc.id, pickUser(doc)));
  if (args.uid) {
    const result = await safeGetDoc(db.collection("users").doc(args.uid), report, `users/${args.uid}`);
    if (result.snap?.exists) addDocs([result.snap]);
  }
  const sample = await safeGetQuery(db.collection("users").limit(args.limit), report, `users limit ${args.limit}`);
  addDocs(sample.snap?.docs || []);
  report.counts.usersTotal = await safeCount(db.collection("users"), report, "users");
  return usersById;
}

async function loadTargetRestaurants(db, args, usersById, report) {
  const restaurantIds = [];
  const addRestaurantId = (value = "") => addUnique(restaurantIds, value);
  const hasExplicitTarget = !!(args.uid || args.restaurantId || args.slug);

  addRestaurantId(args.restaurantId);
  if (args.uid) {
    usersById.forEach((user) => {
      if (user.id === args.uid) {
        addRestaurantId(user.public.restaurantId);
        addRestaurantId(user.public.staffRestaurantId);
        addRestaurantId(user.public.waiterRestaurantId);
      }
    });
  }

  if (args.slug) {
    const routeResult = await safeGetDoc(db.collection("publicRoutes").doc(args.slug), report, `publicRoutes/${args.slug}`);
    if (routeResult.snap?.exists) {
      const routeData = routeResult.snap.data() || {};
      addRestaurantId(routeData.restaurantId || routeData.canonicalRestaurantId);
    }
    for (const field of ["publicSlug", "landingSlug", "handle"]) {
      const queryResult = await safeGetQuery(
        db.collection("restaurants").where(field, "==", args.slug).limit(args.limit),
        report,
        `restaurants where ${field} == ${args.slug} limit ${args.limit}`
      );
      (queryResult.snap?.docs || []).forEach((doc) => addRestaurantId(doc.id));
    }
  }

  const restaurantsById = new Map();
  const addDocs = (docs = []) => docs.forEach((doc) => restaurantsById.set(doc.id, pickRestaurant(doc)));

  if (restaurantIds.length) {
    for (const restaurantId of restaurantIds.slice(0, args.limit)) {
      const result = await safeGetDoc(db.collection("restaurants").doc(restaurantId), report, `restaurants/${restaurantId}`);
      if (result.snap?.exists) addDocs([result.snap]);
      else if (restaurantId) {
        const missingTarget = { restaurantId, path: `restaurants/${restaurantId}` };
        report.review.missingRestaurantTargets.push(missingTarget);
        report.routeAlignment.needsReview.push({
          ...missingTarget,
          category: "needsReview",
          reason: "missing restaurant doc",
          action: "manual review"
        });
      }
    }
  } else if (!hasExplicitTarget) {
    const sample = await safeGetQuery(db.collection("restaurants").limit(args.limit), report, `restaurants limit ${args.limit}`);
    addDocs(sample.snap?.docs || []);
  }

  report.counts.restaurantsTotal = await safeCount(db.collection("restaurants"), report, "restaurants");
  return restaurantsById;
}

async function loadPublicRoutes(db, report, args, restaurantsById) {
  const routesBySlug = new Map();
  const slugs = new Set();
  if (args.slug) slugs.add(args.slug);
  restaurantsById.forEach((restaurant) => {
    ROUTE_SLUG_FIELDS.forEach((field) => {
      const slug = normalizeSlug(restaurant.data[field] || "");
      if (slug) slugs.add(slug);
    });
  });
  for (const slug of slugs) {
    const result = await safeGetDoc(db.collection("publicRoutes").doc(slug), report, `publicRoutes/${slug}`);
    if (result.snap?.exists) routesBySlug.set(slug, { id: result.snap.id, data: result.snap.data() || {} });
  }
  report.counts.publicRoutesTotal = await safeCount(db.collection("publicRoutes"), report, "publicRoutes");
  return routesBySlug;
}

async function loadStaffDocs(db, restaurantsById, report) {
  const staffDocsByKey = new Map();
  for (const restaurant of restaurantsById.values()) {
    const sample = await safeGetQuery(
      db.collection("restaurants").doc(restaurant.id).collection("staff").limit(25),
      report,
      `restaurants/${restaurant.id}/staff limit 25`
    );
    (sample.snap?.docs || []).forEach((doc) => {
      staffDocsByKey.set(`${restaurant.id}/${doc.id}`, { id: doc.id, ...(doc.data() || {}) });
    });
  }
  return staffDocsByKey;
}

function proposePublicRoutes(restaurantsById, routesBySlug, report) {
  const slugOwners = new Map();
  restaurantsById.forEach((restaurant) => {
    ROUTE_SLUG_FIELDS.forEach((field) => {
      const rawSlug = text(restaurant.data[field] || "");
      const slug = normalizeSlug(rawSlug);
      if (!slug) {
        if (rawSlug) {
          report.routeAlignment.needsReview.push({
            restaurantId: restaurant.id,
            path: restaurant.path,
            sourceSlugField: field,
            sourceSlugValue: rawSlug,
            category: "needsReview",
            reason: "malformed slug",
            action: "manual review"
          });
        }
        return;
      }
      if (!slugOwners.has(slug)) slugOwners.set(slug, []);
      slugOwners.get(slug).push({ restaurant, field });
    });
  });

  slugOwners.forEach((owners, slug) => {
    const uniqueRestaurantIds = Array.from(new Set(owners.map((entry) => entry.restaurant.id)));
    if (uniqueRestaurantIds.length > 1) {
      const duplicate = {
        slug,
        restaurantIds: uniqueRestaurantIds,
        action: "skip publicRoutes proposal"
      };
      report.conflicts.duplicateSlugs.push(duplicate);
      report.routeAlignment.needsReview.push({
        ...duplicate,
        category: "needsReview",
        reason: "duplicate slug"
      });
      return;
    }

    const restaurant = owners[0].restaurant;
    const route = routesBySlug.get(slug);
    const routeRestaurantId = text(route?.data?.restaurantId || route?.data?.canonicalRestaurantId || "");
    if (route && routeRestaurantId && routeRestaurantId !== restaurant.id) {
      const conflict = {
        path: `publicRoutes/${slug}`,
        slug,
        existingRestaurantId: routeRestaurantId,
        proposedRestaurantId: restaurant.id,
        action: "skip"
      };
      report.conflicts.publicRouteTargetConflicts.push(conflict);
      report.routeAlignment.doNotTouch.push({
        ...conflict,
        category: "doNotTouch",
        reason: "existing publicRoutes doc points to another restaurant"
      });
      return;
    }

    const status = routeStatusProposal(restaurant.public.status);
    const proposal = {
      path: `publicRoutes/${slug}`,
      operation: route ? "merge" : "create",
      restaurantId: restaurant.id,
      canonicalSlug: slug,
      status: status.status,
      restaurantStatus: restaurant.public.status,
      updatedAt: "[serverTimestamp()]",
      sourceRestaurantPath: restaurant.path,
      sourceSlugFields: owners.map((entry) => entry.field),
      safeToApplyLater: status.safe,
      category: status.category,
      reason: status.reason
    };
    if (status.safe) {
      report.proposals.publicRoutes.push(proposal);
      report.routeAlignment.safeRouteCandidate.push({
        ...proposal,
        slugClean: true,
        restaurantExists: true
      });
    } else {
      report.review.publicRoutesNeedsReview.push(proposal);
      report.routeAlignment.needsReview.push({
        ...proposal,
        slugClean: true,
        restaurantExists: true
      });
    }
  });
}

async function proposeMenuMetadata(db, restaurantsById, report) {
  for (const restaurant of restaurantsById.values()) {
    const pathLabel = `restaurants/${restaurant.id}/public/menu`;
    const result = await safeGetDoc(db.collection("restaurants").doc(restaurant.id).collection("public").doc("menu"), report, pathLabel);
    if (!result.ok) continue;
    if (!result.snap.exists) {
      report.review.missingPublicMenu.push({
        restaurantId: restaurant.id,
        path: pathLabel,
        action: "no automatic creation"
      });
      continue;
    }
    const data = result.snap.data() || {};
    if (!Array.isArray(data.items)) {
      report.conflicts.publicMenuShapeConflicts.push({
        restaurantId: restaurant.id,
        path: pathLabel,
        issue: "items is not an array",
        action: "skip"
      });
      continue;
    }
    const expectedState = expectedTruthState(data.items);
    const proposal = truthMetadataProposal({
      pathLabel,
      data,
      sourceField: "menuTruthSource",
      stateField: "menuTruthState",
      expectedSource: "public-menu",
      expectedState,
      targetKind: "public/menu",
      restaurantId: restaurant.id
    });
    report.conflicts.publicMenuMetadataConflicts.push(...proposal.conflicts);
    if (proposal.patch) {
      report.proposals.publicMenuMetadata.push({
        restaurantId: restaurant.id,
        path: pathLabel,
        itemCount: data.items.length,
        patch: proposal.patch
      });
    }
  }
}

async function proposeOffersMetadata(db, restaurantsById, report) {
  for (const restaurant of restaurantsById.values()) {
    const pathLabel = `restaurants/${restaurant.id}/public/offers`;
    const result = await safeGetDoc(db.collection("restaurants").doc(restaurant.id).collection("public").doc("offers"), report, pathLabel);
    if (!result.ok) continue;
    if (!result.snap.exists) {
      report.review.missingPublicOffers.push({
        restaurantId: restaurant.id,
        path: pathLabel,
        action: "no automatic creation"
      });
      continue;
    }
    const data = result.snap.data() || {};
    if (!Array.isArray(data.items)) {
      report.conflicts.publicOffersShapeConflicts.push({
        restaurantId: restaurant.id,
        path: pathLabel,
        issue: "items is not an array",
        action: "skip"
      });
      continue;
    }
    const expectedState = expectedTruthState(data.items);
    const proposal = truthMetadataProposal({
      pathLabel,
      data,
      sourceField: "truthSource",
      stateField: "truthState",
      expectedSource: "public-menu",
      expectedState,
      targetKind: "public/offers",
      restaurantId: restaurant.id
    });
    report.conflicts.publicOffersMetadataConflicts.push(...proposal.conflicts);
    if (proposal.patch) {
      report.proposals.publicOffersMetadata.push({
        restaurantId: restaurant.id,
        path: pathLabel,
        itemCount: data.items.length,
        patch: proposal.patch
      });
    }
  }
}

function proposeUsers(usersById, restaurantsById, staffDocsByKey, report) {
  usersById.forEach((user) => {
    if (user.public.malformedDocId) {
      report.conflicts.malformedUserDocs.push({
        path: user.public.path,
        uidField: user.public.uidField,
        emailMasked: user.public.emailMasked,
        action: "report only"
      });
      return;
    }

    const patch = {};
    if (!user.public.uidField) {
      patch.uid = user.id;
    } else if (user.public.uidField !== user.id) {
      report.conflicts.userUidMismatches.push({
        path: user.public.path,
        uidField: user.public.uidField,
        docId: user.id,
        action: "skip"
      });
    }

    if (!user.public.status) {
      const status = conservativeStatusProposal(user, restaurantsById, staffDocsByKey);
      if (status.safe && status.value && status.value !== "needsReview") {
        patch.status = status.value;
        report.review.userStatusProposalReasons.push({
          path: user.public.path,
          proposedStatus: status.value,
          reason: status.reason
        });
      } else {
        report.review.usersStatusNeedsReview.push({
          path: user.public.path,
          role: user.public.role,
          restaurantId: user.public.restaurantId,
          staffRestaurantId: user.public.staffRestaurantId,
          waiterRestaurantId: user.public.waiterRestaurantId,
          reason: status.reason
        });
      }
    }

    if (Object.keys(patch).length) {
      patch.updatedAt = "[serverTimestamp()]";
      report.proposals.users.push({
        path: user.public.path,
        patch
      });
    }
  });
}

function analyzeOwnerRelations(usersById, restaurantsById, report) {
  const usersByEmail = new Map();
  const restaurantsByOwnerUid = new Map();

  usersById.forEach((user) => {
    const email = lower(user.emailRaw);
    if (!email) return;
    if (!usersByEmail.has(email)) usersByEmail.set(email, []);
    usersByEmail.get(email).push(user);
  });

  restaurantsById.forEach((restaurant) => {
    const ownerUid = restaurant.public.ownerUid;
    if (ownerUid) {
      if (!restaurantsByOwnerUid.has(ownerUid)) restaurantsByOwnerUid.set(ownerUid, []);
      restaurantsByOwnerUid.get(ownerUid).push(restaurant.id);
      if (!usersById.has(ownerUid)) {
        const ownerEmail = lower(restaurant.ownerEmailRaw);
        const possibleUsers = ownerEmail ? (usersByEmail.get(ownerEmail) || []) : [];
        const base = {
          restaurantId: restaurant.id,
          path: restaurant.path,
          ownerUid,
          ownerEmailMasked: restaurant.public.ownerEmailMasked,
          action: "needs manual review; do not overwrite ownerUid"
        };
        report.conflicts.ownerUidMissingUser.push(base);
        if (possibleUsers.length === 1) {
          report.review.ownerPossibleMappings.push({
            ...base,
            possibleUid: possibleUsers[0].id,
            possibleUserPath: possibleUsers[0].path,
            reason: "ownerEmail exactly matches one user email"
          });
        } else if (possibleUsers.length > 1) {
          report.conflicts.ownerMultiplePossibleUsers.push({
            ...base,
            possibleUsers: possibleUsers.map((user) => ({ path: user.path, uid: user.id })),
            reason: "ownerEmail matches multiple users"
          });
        }
      }
    } else {
      report.review.restaurantsMissingOwnerUid.push({
        restaurantId: restaurant.id,
        path: restaurant.path,
        ownerEmailMasked: restaurant.public.ownerEmailMasked,
        action: "manual review"
      });
    }
  });

  restaurantsByOwnerUid.forEach((restaurantIds, ownerUid) => {
    if (restaurantIds.length <= 1) return;
    report.conflicts.ownerUidMultipleRestaurants.push({
      ownerUid,
      restaurantIds,
      action: "manual review"
    });
  });

  restaurantsById.forEach((restaurant) => {
    if (!restaurant.public.ownerUid) return;
    const ownerUser = usersById.get(restaurant.public.ownerUid);
    if (!ownerUser) return;
    if (ownerUser.public.restaurantId && ownerUser.public.restaurantId !== restaurant.id) {
      report.conflicts.ownerUserRestaurantMismatch.push({
        restaurantId: restaurant.id,
        restaurantPath: restaurant.path,
        ownerUid: restaurant.public.ownerUid,
        ownerUserPath: ownerUser.public.path,
        ownerUserRestaurantId: ownerUser.public.restaurantId,
        action: "manual review"
      });
    }
  });
}

async function compareMenuItems(db, restaurantsById, report) {
  for (const restaurant of restaurantsById.values()) {
    const publicMenuPath = `restaurants/${restaurant.id}/public/menu`;
    const publicMenu = await safeGetDoc(db.collection("restaurants").doc(restaurant.id).collection("public").doc("menu"), report, `${publicMenuPath} compare`);
    const menuItemsPath = `restaurants/${restaurant.id}/menuItems`;
    const menuItemsRef = db.collection("restaurants").doc(restaurant.id).collection("menuItems");
    const menuItemsCount = await safeCount(menuItemsRef, report, menuItemsPath);
    const publicItems = publicMenu.snap?.exists && Array.isArray(publicMenu.snap.data()?.items)
      ? publicMenu.snap.data().items
      : [];
    const safeMenuItemsCount = Number(menuItemsCount || 0);
    if (safeMenuItemsCount > 0) {
      const row = {
        restaurantId: restaurant.id,
        publicMenuPath,
        menuItemsPath,
        publicMenuCount: publicItems.length,
        menuItemsCount: safeMenuItemsCount,
        action: "report only; do not copy menuItems into public/menu"
      };
      report.review.menuItemsPresent.push(row);
      if (publicItems.length !== safeMenuItemsCount) {
        report.conflicts.menuItemsCountMismatches.push({
          ...row,
          knownFlag: restaurant.id === "CiLBuUs4R71wqFCyzCFu"
            ? "known audited mismatch: public/menu 2 vs menuItems 1"
            : ""
        });
      }
    }
  }
}

function summarize(report) {
  report.summary = {
    dryRunOnly: true,
    applySupported: false,
    usersRead: report.counts.usersRead,
    restaurantsRead: report.counts.restaurantsRead,
    publicRoutesProposals: report.proposals.publicRoutes.length,
    publicRoutesNeedsReview: report.review.publicRoutesNeedsReview.length,
    publicMenuMetadataProposals: report.proposals.publicMenuMetadata.length,
    publicOffersMetadataProposals: report.proposals.publicOffersMetadata.length,
    userContractProposals: report.proposals.users.length,
    ownerRelationConflicts: report.conflicts.ownerUidMissingUser.length
      + report.conflicts.ownerMultiplePossibleUsers.length
      + report.conflicts.ownerUidMultipleRestaurants.length
      + report.conflicts.ownerUserRestaurantMismatch.length,
    menuItemsMismatches: report.conflicts.menuItemsCountMismatches.length,
    duplicateSlugConflicts: report.conflicts.duplicateSlugs.length,
    publicRoutesCandidateCounts: {
      safeRouteCandidate: report.routeAlignment.safeRouteCandidate.length,
      needsReview: report.routeAlignment.needsReview.length,
      doNotTouch: report.routeAlignment.doNotTouch.length
    },
    warnings: report.warnings.length
  };
}

function createReport(args) {
  return {
    generatedAt: new Date().toISOString(),
    dryRunOnly: true,
    applySupported: false,
    writesAttempted: 0,
    deletesAttempted: 0,
    projectId: readDefaultProjectId() || "",
    inputs: {
      uid: args.uid,
      restaurantId: args.restaurantId,
      slug: args.slug,
      limit: args.limit,
      out: args.out
    },
    pathsRead: [],
    warnings: [],
    routeAlignment: {
      safeRouteCandidate: [],
      needsReview: [],
      doNotTouch: []
    },
    counts: {
      usersTotal: null,
      usersRead: 0,
      restaurantsTotal: null,
      restaurantsRead: 0,
      publicRoutesTotal: null
    },
    proposals: {
      publicRoutes: [],
      publicMenuMetadata: [],
      publicOffersMetadata: [],
      users: []
    },
    conflicts: {
      duplicateSlugs: [],
      publicRouteTargetConflicts: [],
      publicMenuShapeConflicts: [],
      publicMenuMetadataConflicts: [],
      publicOffersShapeConflicts: [],
      publicOffersMetadataConflicts: [],
      malformedUserDocs: [],
      userUidMismatches: [],
      ownerUidMissingUser: [],
      ownerMultiplePossibleUsers: [],
      ownerUidMultipleRestaurants: [],
      ownerUserRestaurantMismatch: [],
      menuItemsCountMismatches: []
    },
    review: {
      publicRoutesNeedsReview: [],
      missingPublicMenu: [],
      missingPublicOffers: [],
      usersStatusNeedsReview: [],
      userStatusProposalReasons: [],
      restaurantsMissingOwnerUid: [],
      ownerPossibleMappings: [],
      menuItemsPresent: [],
      missingRestaurantTargets: []
    },
    summary: {}
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  refuseIfUnsafe(args);
  initializeAdmin();
  const db = admin.firestore();
  const report = createReport(args);

  const usersById = await loadUsers(db, args, report);
  const restaurantsById = await loadTargetRestaurants(db, args, usersById, report);
  const routesBySlug = await loadPublicRoutes(db, report, args, restaurantsById);
  const staffDocsByKey = await loadStaffDocs(db, restaurantsById, report);

  report.counts.usersRead = usersById.size;
  report.counts.restaurantsRead = restaurantsById.size;

  proposePublicRoutes(restaurantsById, routesBySlug, report);
  await proposeMenuMetadata(db, restaurantsById, report);
  await proposeOffersMetadata(db, restaurantsById, report);
  proposeUsers(usersById, restaurantsById, staffDocsByKey, report);
  analyzeOwnerRelations(usersById, restaurantsById, report);
  await compareMenuItems(db, restaurantsById, report);
  summarize(report);

  if (args.out) {
    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`Wrote dry-run report: ${outPath}`);
  } else {
    console.log("No --out provided; JSON report was not written.");
  }

  console.log("Dry-run summary:");
  console.log(`- users read: ${report.counts.usersRead}`);
  console.log(`- restaurants read: ${report.counts.restaurantsRead}`);
  console.log(`- publicRoutes proposals: ${report.proposals.publicRoutes.length}`);
  console.log(`- publicRoutes safeRouteCandidate: ${report.routeAlignment.safeRouteCandidate.length}`);
  console.log(`- publicRoutes needsReview: ${report.routeAlignment.needsReview.length}`);
  console.log(`- publicRoutes doNotTouch: ${report.routeAlignment.doNotTouch.length}`);
  console.log(`- public/menu metadata proposals: ${report.proposals.publicMenuMetadata.length}`);
  console.log(`- public/offers metadata proposals: ${report.proposals.publicOffersMetadata.length}`);
  console.log(`- user contract proposals: ${report.proposals.users.length}`);
  console.log(`- owner relation conflicts/review items: ${report.summary.ownerRelationConflicts}`);
  console.log(`- menuItems count mismatches: ${report.conflicts.menuItemsCountMismatches.length}`);
  console.log("No writes, deletes, migrations, or rules deployments were attempted.");
}

main().catch((err) => {
  console.error("Dry-run data-contract proposal failed:", sanitizeError(err));
  process.exitCode = 1;
});
