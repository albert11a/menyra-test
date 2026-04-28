#!/usr/bin/env node
"use strict";

/*
  READ-ONLY Firebase audit for Mnyra menu truth.

  How to run locally after configuring credentials:
    GOOGLE_APPLICATION_CREDENTIALS=/path/to/read-only-service-account.json node functions/scripts/audit-mnyra-live-readonly.cjs --restaurantId xxx --out /tmp/mnyra-audit.json

  Optional targets:
    --uid <uid>
    --restaurantId <restaurantId>
    --slug <slug>
    --limit <n>
    --out <path>

  This script does not write, delete, migrate, or deploy anything. It refuses
  APPLY=1 and write-like flags. It prints only masked emails and summarized
  document data; it never reads or prints service account/private key contents.
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

function text(value = "") {
  return String(value || "").trim();
}

function lower(value = "") {
  return text(value).toLowerCase();
}

function parseArgs(argv = []) {
  const args = {
    uid: "",
    restaurantId: "",
    slug: "",
    limit: 5,
    out: "mnyra-live-readonly-audit.json",
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
    else if (key === "--limit") args.limit = Math.max(1, Math.min(50, Number(readValue()) || 5));
    else if (key === "--out") args.out = text(readValue()) || args.out;
    else if (key.startsWith("--")) args.refused.push(key);
  }
  return args;
}

function refuseIfUnsafe(args) {
  if (process.env.APPLY === "1") {
    console.error("Refusing to run: APPLY=1 was provided. This audit is read-only only.");
    process.exit(1);
  }
  if (args.refused.length) {
    console.error(`Refusing to run: unsupported/write-like flag(s): ${args.refused.join(", ")}`);
    process.exit(1);
  }
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
  if (projectId) {
    admin.initializeApp({ projectId });
  } else {
    admin.initializeApp();
  }
}

function maskEmail(value = "") {
  const email = text(value);
  if (!email) return "";
  const at = email.indexOf("@");
  if (at < 0) {
    return email.length <= 2 ? "***" : `${email.slice(0, 2)}***`;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const maskedLocal = local ? `${local[0]}***` : "***";
  const domainParts = domain.split(".");
  const domainName = domainParts.shift() || "";
  const suffix = domainParts.length ? `.${domainParts.join(".")}` : "";
  const maskedDomain = domainName ? `${domainName[0]}***${suffix}` : "***";
  return `${maskedLocal}@${maskedDomain}`;
}

function sanitizeError(err) {
  const code = text(err?.code);
  let message = text(err?.message || err);
  message = message
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g, "[redacted-key]")
    .replace(/private_key[^,\n}]*/gi, "private_key=[redacted]");
  return { code, message };
}

function serializeTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") {
    try {
      return value.toDate().toISOString();
    } catch {}
  }
  if (typeof value.toMillis === "function") {
    try {
      return new Date(value.toMillis()).toISOString();
    } catch {}
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString();
  return text(value);
}

function fieldType(value) {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") return "object";
  if (value === null) return "null";
  return typeof value;
}

function summarizeLegacyField(value) {
  const type = fieldType(value);
  const summary = { type };
  if (Array.isArray(value)) {
    summary.count = value.length;
  } else if (value && typeof value === "object") {
    summary.keys = Object.keys(value).slice(0, 20);
    Object.entries(value).forEach(([key, val]) => {
      if (Array.isArray(val)) {
        if (!summary.arrayFields) summary.arrayFields = {};
        summary.arrayFields[key] = val.length;
      }
    });
  }
  return summary;
}

function summarizeMenuItem(item = {}, fallbackId = "") {
  const data = item && typeof item === "object" ? item : {};
  const active = data.active !== undefined
    ? data.active
    : (data.available !== undefined ? data.available : (data.hidden === true || data.menuHidden === true ? false : null));
  return {
    id: text(data.id || data.itemId || data.menuItemId || data.productId || fallbackId),
    nameTitle: text(data.name || data.title || data.product || data.label || ""),
    category: text(data.category || data.categoryName || data.cat || ""),
    price: data.price ?? "",
    active,
    orderIndex: data.orderIndex ?? null
  };
}

function summarizePost(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    restaurantId: text(data.restaurantId),
    ownerId: text(data.ownerId)
  };
}

function pickUserFields(id, data = {}) {
  return {
    path: `users/${id}`,
    exists: true,
    uid: text(data.uid),
    role: text(data.role),
    status: text(data.status),
    restaurantId: text(data.restaurantId),
    staffRestaurantId: text(data.staffRestaurantId),
    waiterRestaurantId: text(data.waiterRestaurantId),
    businessName: text(data.businessName),
    logoUrl: text(data.logoUrl),
    publicSlug: text(data.publicSlug),
    landingSlug: text(data.landingSlug),
    emailMasked: maskEmail(data.email || data.ownerEmail || data.loginEmail || data.accountEmail || "")
  };
}

function pickRestaurantFields(id, data = {}) {
  return {
    path: `restaurants/${id}`,
    exists: true,
    id,
    ownerUid: text(data.ownerUid),
    ownerEmailMasked: maskEmail(data.ownerEmail || data.email || data.contactEmail || data.socialEmail || ""),
    name: text(data.name),
    restaurantName: text(data.restaurantName),
    logoUrl: text(data.logoUrl),
    logo: text(data.logo),
    publicSlug: text(data.publicSlug),
    landingSlug: text(data.landingSlug),
    status: text(data.status),
    type: text(data.type),
    customerType: text(data.customerType),
    businessType: text(data.businessType)
  };
}

function addUnique(list, value = "") {
  const safe = text(value);
  if (safe && !list.includes(safe)) list.push(safe);
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

async function safeCount(collectionRef, report, pathLabel) {
  try {
    if (collectionRef && typeof collectionRef.count === "function") {
      report.pathsRead.push(`${pathLabel}#count`);
      const snap = await collectionRef.count().get();
      return Number(snap.data().count || 0) || 0;
    }
  } catch (err) {
    report.warnings.push({ path: `${pathLabel}#count`, error: sanitizeError(err) });
  }
  return null;
}

function routeDocSummary(slug, snap) {
  if (!snap || !snap.exists) {
    return {
      path: `publicRoutes/${slug}`,
      slug,
      exists: false,
      restaurantId: "",
      canonicalRestaurantId: "",
      canonicalSlug: "",
      status: ""
    };
  }
  const data = snap.data() || {};
  return {
    path: `publicRoutes/${slug}`,
    slug,
    exists: true,
    restaurantId: text(data.restaurantId),
    canonicalRestaurantId: text(data.canonicalRestaurantId),
    canonicalSlug: normalizeSlug(data.canonicalSlug || data.slug || slug),
    status: text(data.status || "active")
  };
}

async function auditUser(db, uid, report) {
  const safeUid = text(uid);
  if (!safeUid) return null;
  const pathLabel = `users/${safeUid}`;
  const result = await safeGetDoc(db.collection("users").doc(safeUid), report, pathLabel);
  if (!result.ok) return { path: pathLabel, exists: "error" };
  if (!result.snap.exists) return { path: pathLabel, exists: false };
  return pickUserFields(result.snap.id, result.snap.data() || {});
}

async function auditPublicRoute(db, slug, report) {
  const safeSlug = normalizeSlug(slug);
  if (!safeSlug) return null;
  const routes = [];
  const publicRoute = await safeGetDoc(db.collection("publicRoutes").doc(safeSlug), report, `publicRoutes/${safeSlug}`);
  if (publicRoute.ok) routes.push(routeDocSummary(safeSlug, publicRoute.snap));

  const directRestaurant = await safeGetDoc(db.collection("restaurants").doc(safeSlug), report, `restaurants/${safeSlug}`);
  routes.push({
    path: `restaurants/${safeSlug}`,
    slug: safeSlug,
    mappingType: "restaurantDocId",
    exists: !!directRestaurant.snap?.exists,
    restaurantId: directRestaurant.snap?.exists ? directRestaurant.snap.id : ""
  });

  for (const field of ["publicSlug", "landingSlug", "handle"]) {
    const values = Array.from(new Set([safeSlug, text(slug)].filter(Boolean)));
    for (const value of values) {
      const queryLabel = `restaurants where ${field} == ${value}`;
      const queryResult = await safeGetQuery(
        db.collection("restaurants").where(field, "==", value).limit(3),
        report,
        queryLabel
      );
      const docs = queryResult.snap?.docs || [];
      routes.push({
        path: queryLabel,
        slug: value,
        mappingType: `restaurant.${field}`,
        exists: docs.length > 0,
        restaurantIds: docs.map((doc) => doc.id)
      });
    }
  }

  const mappedRestaurantIds = [];
  routes.forEach((route) => {
    addUnique(mappedRestaurantIds, route.restaurantId || route.canonicalRestaurantId);
    (route.restaurantIds || []).forEach((id) => addUnique(mappedRestaurantIds, id));
  });
  return {
    slug: safeSlug,
    mappings: routes,
    mappedRestaurantIds
  };
}

async function auditRestaurant(db, restaurantId, report) {
  const safeRestaurantId = text(restaurantId);
  if (!safeRestaurantId) return null;
  const restaurantPath = `restaurants/${safeRestaurantId}`;
  const restaurantResult = await safeGetDoc(db.collection("restaurants").doc(safeRestaurantId), report, restaurantPath);
  const exists = !!restaurantResult.snap?.exists;
  const data = exists ? (restaurantResult.snap.data() || {}) : {};
  const restaurant = exists
    ? pickRestaurantFields(safeRestaurantId, data)
    : { path: restaurantPath, exists: false, id: safeRestaurantId };

  const publicMenu = await auditPublicMenu(db, safeRestaurantId, report);
  const menuItems = await auditMenuItems(db, safeRestaurantId, report);
  const legacyMenuFields = exists ? auditLegacyMenuFields(data) : {};
  const offers = await auditOffers(db, safeRestaurantId, report);
  const socialPosts = await auditSocialPosts(db, safeRestaurantId, report);

  return {
    restaurant,
    publicMenu,
    menuItems,
    legacyMenuFields,
    offers,
    socialPosts
  };
}

async function auditPublicMenu(db, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/public/menu`;
  const result = await safeGetDoc(db.collection("restaurants").doc(restaurantId).collection("public").doc("menu"), report, pathLabel);
  if (!result.ok) return { path: pathLabel, exists: "error", itemsIsArray: false, itemCount: 0, firstItems: [] };
  if (!result.snap.exists) return { path: pathLabel, exists: false, itemsIsArray: false, itemCount: 0, firstItems: [] };
  const data = result.snap.data() || {};
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    path: pathLabel,
    exists: true,
    itemsIsArray: Array.isArray(data.items),
    itemCount: items.length,
    firstItems: items.slice(0, 5).map((item, idx) => summarizeMenuItem(item, `public_${idx}`)),
    menuTruthSource: text(data.menuTruthSource),
    menuTruthState: text(data.menuTruthState),
    statusBadgeVisible: data.statusBadgeVisible ?? null,
    updatedAt: serializeTimestamp(data.updatedAt)
  };
}

async function auditMenuItems(db, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/menuItems`;
  const ref = db.collection("restaurants").doc(restaurantId).collection("menuItems");
  const count = await safeCount(ref, report, pathLabel);
  const sampleResult = await safeGetQuery(ref.limit(5), report, `${pathLabel} limit 5`);
  const docs = sampleResult.snap?.docs || [];
  return {
    path: pathLabel,
    collectionExists: count !== null ? count > 0 : docs.length > 0,
    count,
    sampleCount: docs.length,
    firstItems: docs.map((doc) => summarizeMenuItem({ id: doc.id, ...(doc.data() || {}) }, doc.id))
  };
}

function auditLegacyMenuFields(restaurantData = {}) {
  const fields = [
    "menu",
    "menuItems",
    "items",
    "categories",
    "speisekarte",
    "food",
    "foodItems",
    "speisen",
    "drinks",
    "drinkItems",
    "getraenke",
    "beverages"
  ];
  const found = {};
  fields.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(restaurantData, field)) return;
    const value = restaurantData[field];
    if (value === undefined || value === null) return;
    found[field] = summarizeLegacyField(value);
  });
  return found;
}

async function auditOffers(db, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/public/offers`;
  const result = await safeGetDoc(db.collection("restaurants").doc(restaurantId).collection("public").doc("offers"), report, pathLabel);
  if (!result.ok) {
    return { path: pathLabel, exists: "error", itemsIsArray: false, itemCount: 0 };
  }
  if (!result.snap.exists) {
    return { path: pathLabel, exists: false, itemsIsArray: false, itemCount: 0 };
  }
  const data = result.snap.data() || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const meta = await safeGetDoc(db.collection("restaurants").doc(restaurantId).collection("public").doc("meta"), report, `restaurants/${restaurantId}/public/meta`);
  const metaData = meta.snap?.exists ? (meta.snap.data() || {}) : {};
  return {
    path: pathLabel,
    exists: true,
    itemsIsArray: Array.isArray(data.items),
    itemCount: items.length,
    truthSource: text(data.truthSource),
    truthState: text(data.truthState),
    enabled: data.enabled ?? null,
    offersEnabled: metaData.offersEnabled ?? data.offersEnabled ?? null,
    updatedAt: serializeTimestamp(data.updatedAt)
  };
}

async function auditSocialPosts(db, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/socialPosts`;
  const ref = db.collection("restaurants").doc(restaurantId).collection("socialPosts");
  const sampleResult = await safeGetQuery(ref.limit(5), report, `${pathLabel} limit 5`);
  const docs = sampleResult.snap?.docs || [];
  return {
    path: pathLabel,
    sampleCount: docs.length,
    firstPosts: docs.map(summarizePost)
  };
}

async function discoverSampleTargets(db, args, report) {
  const uids = [];
  const restaurantIds = [];
  const limit = args.limit;

  const businessUsers = await safeGetQuery(db.collection("users").where("role", "==", "business").limit(limit), report, `users where role == business limit ${limit}`);
  (businessUsers.snap?.docs || []).forEach((doc) => {
    addUnique(uids, doc.id);
    addUnique(restaurantIds, doc.data()?.restaurantId);
  });

  const restaurants = await safeGetQuery(db.collection("restaurants").limit(limit), report, `restaurants limit ${limit}`);
  (restaurants.snap?.docs || []).forEach((doc) => addUnique(restaurantIds, doc.id));

  try {
    const menuDocs = await db.collectionGroup("menuItems").limit(limit).get();
    report.pathsRead.push(`collectionGroup(menuItems) limit ${limit}`);
    menuDocs.docs.forEach((doc) => addUnique(restaurantIds, doc.ref.parent.parent?.id || ""));
  } catch (err) {
    report.warnings.push({ path: `collectionGroup(menuItems) limit ${limit}`, error: sanitizeError(err) });
  }

  try {
    const publicMenuDocs = await db.collectionGroup("public")
      .where(admin.firestore.FieldPath.documentId(), "==", "menu")
      .limit(limit)
      .get();
    report.pathsRead.push(`collectionGroup(public) docId == menu limit ${limit}`);
    publicMenuDocs.docs.forEach((doc) => addUnique(restaurantIds, doc.ref.parent.parent?.id || ""));
  } catch (err) {
    report.warnings.push({ path: `collectionGroup(public) docId == menu limit ${limit}`, error: sanitizeError(err) });
  }

  return {
    uids: uids.slice(0, limit),
    restaurantIds: restaurantIds.slice(0, limit)
  };
}

function computeDiagnosisForRestaurant({
  restaurantReport,
  users = [],
  slugAudit = null,
  requestedRestaurantId = "",
  requestedUid = ""
} = {}) {
  const restaurant = restaurantReport?.restaurant || {};
  const restaurantId = text(restaurant.id || requestedRestaurantId);
  const relatedUser = users.find((user) => {
    if (requestedUid && user.uid === requestedUid) return true;
    if (restaurant.ownerUid && user.path === `users/${restaurant.ownerUid}`) return true;
    return text(user.restaurantId) === restaurantId;
  }) || null;
  const publicMenuHasItems = !!restaurantReport?.publicMenu?.itemCount;
  const legacyMenuItemsHasItems = Number(restaurantReport?.menuItems?.count ?? restaurantReport?.menuItems?.sampleCount ?? 0) > 0;
  const offersHasItems = Number(restaurantReport?.offers?.itemCount || 0) > 0;
  const menuDataMismatch = !publicMenuHasItems && legacyMenuItemsHasItems;
  const focusWithoutMenu = offersHasItems && !publicMenuHasItems;
  const usersRestaurantIdMatchesRestaurant = relatedUser
    ? text(relatedUser.restaurantId) === restaurantId
    : "unknown";
  const ownerUidMatches = relatedUser && restaurant.ownerUid
    ? text(restaurant.ownerUid) === text(relatedUser.path || "").replace(/^users\//, "")
    : "unknown";
  let slugMapsToRestaurant = "unknown";
  if (slugAudit?.slug) {
    const mappedIds = slugAudit.mappedRestaurantIds || [];
    slugMapsToRestaurant = restaurantId ? mappedIds.includes(restaurantId) : mappedIds.length > 0;
  }

  let likelyCause = "insufficient data";
  if (usersRestaurantIdMatchesRestaurant === false || ownerUidMatches === false) {
    likelyCause = "restaurantId mismatch";
  } else if (slugMapsToRestaurant === false) {
    likelyCause = "slug mapping mismatch";
  } else if (menuDataMismatch) {
    likelyCause = "public/menu missing but menuItems has items";
  } else if (publicMenuHasItems) {
    likelyCause = "public/menu exists and has items";
  } else if (focusWithoutMenu) {
    likelyCause = "focus exists before menu";
  } else if (restaurantReport?.publicMenu?.exists === true && !publicMenuHasItems) {
    likelyCause = "public/menu exists but has no items";
  } else if (restaurantReport?.publicMenu?.exists === false) {
    likelyCause = "public/menu missing";
  }

  return {
    restaurantId,
    usersRestaurantIdMatchesRestaurant,
    ownerUidMatches,
    publicMenuHasItems,
    legacyMenuItemsHasItems,
    menuDataMismatch,
    focusWithoutMenu,
    slugMapsToRestaurant,
    likelyCause
  };
}

function buildHumanSummary(report) {
  const lines = [];
  lines.push(`Read-only Firebase audit generated at ${report.generatedAt}.`);
  lines.push(`Targets: uid=${report.inputs.uid || "-"}, restaurantId=${report.inputs.restaurantId || "-"}, slug=${report.inputs.slug || "-"}, limit=${report.inputs.limit}.`);
  if (report.publicRoute?.slug) {
    const mapped = report.publicRoute.mappedRestaurantIds.length
      ? report.publicRoute.mappedRestaurantIds.join(", ")
      : "none";
    lines.push(`Slug ${report.publicRoute.slug} mapped restaurant ids: ${mapped}.`);
  }
  report.diagnosis.perRestaurant.forEach((diag) => {
    const menu = diag.publicMenuHasItems ? "public/menu has items" : "public/menu has no items";
    const legacy = diag.legacyMenuItemsHasItems ? "menuItems has items" : "menuItems has no sampled/countable items";
    lines.push(`Restaurant ${diag.restaurantId || "-"}: ${menu}; ${legacy}; likelyCause=${diag.likelyCause}.`);
  });
  if (!report.diagnosis.perRestaurant.length) {
    lines.push("No restaurant target was audited; provide --restaurantId, --uid, --slug, or increase sample access.");
  }
  lines.push("No writes, deletes, migrations, or rule deployments were attempted.");
  return lines;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  refuseIfUnsafe(args);
  initializeAdmin();

  const db = admin.firestore();
  const report = {
    generatedAt: new Date().toISOString(),
    readOnly: true,
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
    users: [],
    restaurants: [],
    publicRoute: null,
    diagnosis: {
      usersRestaurantIdMatchesRestaurant: "unknown",
      ownerUidMatches: "unknown",
      publicMenuHasItems: false,
      legacyMenuItemsHasItems: false,
      menuDataMismatch: false,
      focusWithoutMenu: false,
      slugMapsToRestaurant: "unknown",
      likelyCause: "insufficient data",
      perRestaurant: []
    },
    humanSummary: []
  };

  const targetUids = [];
  const targetRestaurantIds = [];
  addUnique(targetUids, args.uid);
  addUnique(targetRestaurantIds, args.restaurantId);

  if (args.slug) {
    report.publicRoute = await auditPublicRoute(db, args.slug, report);
    (report.publicRoute?.mappedRestaurantIds || []).forEach((id) => addUnique(targetRestaurantIds, id));
  }

  if (!targetUids.length && !targetRestaurantIds.length && !args.slug) {
    const sampleTargets = await discoverSampleTargets(db, args, report);
    sampleTargets.uids.forEach((uid) => addUnique(targetUids, uid));
    sampleTargets.restaurantIds.forEach((id) => addUnique(targetRestaurantIds, id));
  }

  for (const uid of targetUids.slice(0, args.limit)) {
    const user = await auditUser(db, uid, report);
    if (user) {
      report.users.push(user);
      if (user.exists === true) {
        addUnique(targetRestaurantIds, user.restaurantId);
        addUnique(targetRestaurantIds, user.staffRestaurantId);
        addUnique(targetRestaurantIds, user.waiterRestaurantId);
      }
    }
  }

  for (const restaurantId of targetRestaurantIds.slice(0, args.limit)) {
    const restaurantReport = await auditRestaurant(db, restaurantId, report);
    if (!restaurantReport) continue;
    report.restaurants.push(restaurantReport);
    const ownerUid = text(restaurantReport.restaurant?.ownerUid);
    if (ownerUid && !report.users.some((user) => user.path === `users/${ownerUid}`)) {
      const ownerUser = await auditUser(db, ownerUid, report);
      if (ownerUser) report.users.push(ownerUser);
    }
  }

  report.diagnosis.perRestaurant = report.restaurants.map((restaurantReport) => computeDiagnosisForRestaurant({
    restaurantReport,
    users: report.users,
    slugAudit: report.publicRoute,
    requestedRestaurantId: args.restaurantId,
    requestedUid: args.uid
  }));

  if (report.diagnosis.perRestaurant.length === 1) {
    const only = report.diagnosis.perRestaurant[0];
    report.diagnosis.usersRestaurantIdMatchesRestaurant = only.usersRestaurantIdMatchesRestaurant;
    report.diagnosis.ownerUidMatches = only.ownerUidMatches;
    report.diagnosis.publicMenuHasItems = only.publicMenuHasItems;
    report.diagnosis.legacyMenuItemsHasItems = only.legacyMenuItemsHasItems;
    report.diagnosis.menuDataMismatch = only.menuDataMismatch;
    report.diagnosis.focusWithoutMenu = only.focusWithoutMenu;
    report.diagnosis.slugMapsToRestaurant = only.slugMapsToRestaurant;
    report.diagnosis.likelyCause = only.likelyCause;
  } else if (report.diagnosis.perRestaurant.length > 1) {
    report.diagnosis.publicMenuHasItems = report.diagnosis.perRestaurant.some((diag) => diag.publicMenuHasItems);
    report.diagnosis.legacyMenuItemsHasItems = report.diagnosis.perRestaurant.some((diag) => diag.legacyMenuItemsHasItems);
    report.diagnosis.menuDataMismatch = report.diagnosis.perRestaurant.some((diag) => diag.menuDataMismatch);
    report.diagnosis.focusWithoutMenu = report.diagnosis.perRestaurant.some((diag) => diag.focusWithoutMenu);
    const mismatch = report.diagnosis.perRestaurant.find((diag) => diag.menuDataMismatch);
    const publicOk = report.diagnosis.perRestaurant.find((diag) => diag.publicMenuHasItems);
    report.diagnosis.likelyCause = mismatch?.likelyCause || publicOk?.likelyCause || "sample contains mixed or insufficient data";
  }

  report.humanSummary = buildHumanSummary(report);
  const outPath = path.resolve(process.cwd(), args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Wrote read-only audit report: ${outPath}`);
  console.log("");
  console.log("Human-readable summary:");
  report.humanSummary.forEach((line) => console.log(`- ${line}`));
}

main().catch((err) => {
  console.error("Read-only audit failed:", sanitizeError(err));
  process.exitCode = 1;
});
