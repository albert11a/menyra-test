#!/usr/bin/env node
"use strict";

/*
  READ-ONLY Firebase data-contract audit for Mnyra.

  Example:
    GOOGLE_APPLICATION_CREDENTIALS=/path/to/read-only-service-account.json node functions/scripts/audit-mnyra-data-contract-readonly.cjs --limit 100 --out C:/mnyra-secrets/mnyra-full-data-contract-audit.json

  This script only reads Firestore and writes a local JSON report. It refuses
  APPLY=1 and write-like flags. It masks emails and summarizes document shapes;
  it does not print service account JSON or private key data.
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

const KNOWN_SAMPLE_RESTAURANT_IDS = Object.freeze([
  "vZOFF4pAyrCh6QNOo2ef",
  "RUb9gIPSGoYM2qT3xXxJ",
  "Lzm6RpNu3ErSDtGCHxpi",
  "shpija-e-vjetr",
  "0PkyaN3ua3kwBBU2OVs6"
]);

const ROLE_BUCKETS = Object.freeze(["business", "staff", "waiter", "user", "ceo"]);

function text(value = "") {
  return String(value || "").trim();
}

function lower(value = "") {
  return text(value).toLowerCase();
}

function parseArgs(argv = []) {
  const args = {
    limit: 100,
    out: "C:/mnyra-secrets/mnyra-full-data-contract-audit.json",
    restaurantIds: [],
    uids: [],
    slugs: [],
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
    if (key === "--limit") args.limit = Math.max(5, Math.min(500, Number(readValue()) || 100));
    else if (key === "--out") args.out = text(readValue()) || args.out;
    else if (key === "--restaurantId" || key === "--restaurant-id") addUnique(args.restaurantIds, readValue());
    else if (key === "--uid") addUnique(args.uids, readValue());
    else if (key === "--slug") addUnique(args.slugs, normalizeSlug(readValue()));
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

function addUnique(list, value = "") {
  const safe = text(value);
  if (safe && !list.includes(safe)) list.push(safe);
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

function sanitizeError(err) {
  const code = text(err?.code);
  let message = text(err?.message || err);
  message = message
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/g, "[redacted-key]")
    .replace(/private_key[^,\n}]*/gi, "private_key=[redacted]");
  return { code, message };
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

function timestampPresence(value) {
  return value !== undefined && value !== null;
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

function summarizeObjectShape(value, maxKeys = 30) {
  const type = fieldType(value);
  const summary = { type };
  if (Array.isArray(value)) {
    summary.count = value.length;
    summary.firstKeys = value[0] && typeof value[0] === "object" ? Object.keys(value[0]).slice(0, maxKeys) : [];
  } else if (value && typeof value === "object") {
    summary.keys = Object.keys(value).slice(0, maxKeys);
    summary.arrayFields = {};
    Object.entries(value).forEach(([key, val]) => {
      if (Array.isArray(val)) summary.arrayFields[key] = val.length;
    });
    if (!Object.keys(summary.arrayFields).length) delete summary.arrayFields;
  }
  return summary;
}

function sampleKeys(data = {}, maxKeys = 30) {
  if (!data || typeof data !== "object") return [];
  return Object.keys(data).slice(0, maxKeys);
}

function summarizeMenuItem(data = {}, fallbackId = "") {
  const item = data && typeof data === "object" ? data : {};
  const active = item.active !== undefined
    ? item.active
    : (item.available !== undefined ? item.available : (item.hidden === true || item.menuHidden === true ? false : null));
  return {
    id: text(item.id || item.itemId || item.menuItemId || item.productId || fallbackId),
    hasName: !!text(item.name),
    hasTitle: !!text(item.title),
    category: text(item.category || item.categoryName || item.cat || ""),
    priceType: fieldType(item.price),
    currency: text(item.currency),
    active,
    orderIndex: item.orderIndex ?? null,
    fieldKeys: sampleKeys(item, 24),
    imageFieldPresence: {
      imageUrl: !!text(item.imageUrl),
      image: !!text(item.image),
      photoUrl: !!text(item.photoUrl),
      imageUrls: Array.isArray(item.imageUrls) && item.imageUrls.length > 0
    }
  };
}

function summarizeFocusItem(data = {}, fallbackId = "") {
  const item = data && typeof data === "object" ? data : {};
  return {
    id: text(item.id || fallbackId),
    hasTitle: !!text(item.title),
    hasText: !!text(item.text || item.description),
    hasImageUrl: !!text(item.imageUrl || item.image || item.photoUrl),
    active: item.active !== false,
    fieldKeys: sampleKeys(item, 20)
  };
}

function summarizePostDoc(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    restaurantId: text(data.restaurantId || data.rid),
    ownerId: text(data.ownerId || data.uid),
    ownerType: text(data.ownerType),
    status: text(data.status),
    hasMedia: Array.isArray(data.media) ? data.media.length > 0 : !!text(data.mediaUrl || data.url),
    hasCaption: !!text(data.caption),
    fieldKeys: sampleKeys(data, 24)
  };
}

function summarizeOrderDoc(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    restaurantId: text(data.restaurantId),
    buyerUidPresent: !!text(data.buyerUid),
    status: text(data.status),
    tableNumberPresent: data.tableNumber !== undefined && data.tableNumber !== null,
    lookupTokenPresent: !!text(data.lookupToken || data.orderLookupToken),
    fieldKeys: sampleKeys(data, 24)
  };
}

function summarizeStaffDoc(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    uid: text(data.uid || docSnap.id),
    role: text(data.role || data.staffRole),
    status: text(data.status || data.staffStatus),
    businessAccess: data.businessAccess ?? data.permissions?.businessAccess ?? null,
    waiterAccess: data.waiterAccess ?? data.permissions?.waiterAccess ?? null,
    active: data.active ?? data.staffActive ?? null,
    emailMasked: maskEmail(data.email || "")
  };
}

function pickUserFields(id, data = {}) {
  return {
    path: `users/${id}`,
    id,
    uidField: text(data.uid),
    uidMatchesDocId: text(data.uid) ? text(data.uid) === id : null,
    role: text(data.role),
    roles: Array.isArray(data.roles) ? data.roles.map(text).filter(Boolean).slice(0, 8) : [],
    status: text(data.status),
    restaurantId: text(data.restaurantId),
    staffRestaurantId: text(data.staffRestaurantId),
    waiterRestaurantId: text(data.waiterRestaurantId),
    businessName: text(data.businessName),
    logoUrlPresent: !!text(data.logoUrl),
    publicSlug: text(data.publicSlug),
    landingSlug: text(data.landingSlug),
    emailMasked: maskEmail(data.email || data.ownerEmail || data.loginEmail || data.accountEmail || ""),
    createdAtPresent: timestampPresence(data.createdAt),
    updatedAtPresent: timestampPresence(data.updatedAt)
  };
}

function pickRestaurantFields(id, data = {}) {
  return {
    path: `restaurants/${id}`,
    id,
    idField: text(data.id),
    idFieldMatchesDocId: text(data.id) ? text(data.id) === id : null,
    ownerUid: text(data.ownerUid),
    ownerEmailMasked: maskEmail(data.ownerEmail || data.email || data.contactEmail || data.socialEmail || ""),
    name: text(data.name),
    restaurantName: text(data.restaurantName),
    logoPresent: !!text(data.logo),
    logoUrlPresent: !!text(data.logoUrl),
    publicSlug: text(data.publicSlug),
    landingSlug: text(data.landingSlug),
    cityPresent: !!text(data.city),
    addressPresent: !!text(data.address || data.streetAddress || data.location?.address),
    status: text(data.status),
    type: text(data.type),
    customerType: text(data.customerType),
    businessType: text(data.businessType),
    createdAtPresent: timestampPresence(data.createdAt),
    updatedAtPresent: timestampPresence(data.updatedAt),
    qrFields: {
      tableQrEnabled: data.tableQrEnabled ?? data.qrEnabled ?? null,
      tableQrCount: data.tableQrCount ?? data.tableCount ?? data.tableQrTables ?? data.tablesCount ?? null
    }
  };
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

async function auditUsers(db, report, args) {
  const usersRef = db.collection("users");
  report.users.totalCount = await safeCount(usersRef, report, "users");
  const docsById = new Map();

  const addDocs = (docs = []) => {
    docs.forEach((doc) => docsById.set(doc.id, doc));
  };

  const baseSample = await safeGetQuery(usersRef.limit(args.limit), report, `users limit ${args.limit}`);
  addDocs(baseSample.snap?.docs || []);

  for (const role of ROLE_BUCKETS) {
    const roleCount = await safeCount(usersRef.where("role", "==", role), report, `users where role == ${role}`);
    report.users.roleCounts[role] = roleCount;
    const roleSample = await safeGetQuery(usersRef.where("role", "==", role).limit(Math.min(args.limit, 50)), report, `users where role == ${role} limit ${Math.min(args.limit, 50)}`);
    addDocs(roleSample.snap?.docs || []);
  }

  for (const uid of args.uids) {
    const result = await safeGetDoc(usersRef.doc(uid), report, `users/${uid}`);
    if (result.snap?.exists) docsById.set(result.snap.id, result.snap);
  }

  report.users.sampled = Array.from(docsById.values()).slice(0, args.limit * 3).map((doc) => pickUserFields(doc.id, doc.data() || {}));
  report.users.sampleCount = report.users.sampled.length;
  report.users.withRoleCount = report.users.sampled.filter((user) => !!user.role).length;
  report.users.businessWithRestaurantIdCount = report.users.sampled.filter((user) => lower(user.role) === "business" && !!user.restaurantId).length;
  report.users.businessMissingRestaurantId = report.users.sampled.filter((user) => lower(user.role) === "business" && !user.restaurantId).map((user) => user.path);
  report.users.staffWithStaffRestaurantIdCount = report.users.sampled.filter((user) => lower(user.role) === "staff" && !!user.staffRestaurantId).length;
  report.users.staffWithWaiterRestaurantIdCount = report.users.sampled.filter((user) => lower(user.role) === "staff" && !!user.waiterRestaurantId).length;
  report.users.staffMissingRestaurantLink = report.users.sampled
    .filter((user) => lower(user.role) === "staff" && !user.staffRestaurantId && !user.waiterRestaurantId && !user.restaurantId)
    .map((user) => user.path);
  report.users.missingStatus = report.users.sampled.filter((user) => !user.status).map((user) => user.path);
  report.users.uidFieldMissingOrMismatch = report.users.sampled
    .filter((user) => user.uidMatchesDocId !== true)
    .map((user) => ({ path: user.path, uidField: user.uidField, uidMatchesDocId: user.uidMatchesDocId }));

  report.users.sampled.forEach((user) => {
    addUnique(args.restaurantIds, user.restaurantId);
    addUnique(args.restaurantIds, user.staffRestaurantId);
    addUnique(args.restaurantIds, user.waiterRestaurantId);
  });
}

async function auditRestaurants(db, report, args) {
  const restaurantsRef = db.collection("restaurants");
  report.restaurants.totalCount = await safeCount(restaurantsRef, report, "restaurants");
  const docsById = new Map();

  const addDocs = (docs = []) => docs.forEach((doc) => docsById.set(doc.id, doc));

  const baseSample = await safeGetQuery(restaurantsRef.limit(args.limit), report, `restaurants limit ${args.limit}`);
  addDocs(baseSample.snap?.docs || []);

  KNOWN_SAMPLE_RESTAURANT_IDS.forEach((id) => addUnique(args.restaurantIds, id));
  for (const restaurantId of args.restaurantIds) {
    const result = await safeGetDoc(restaurantsRef.doc(restaurantId), report, `restaurants/${restaurantId}`);
    if (result.snap?.exists) docsById.set(result.snap.id, result.snap);
    else if (restaurantId) report.restaurants.missingRestaurantDocs.push(`restaurants/${restaurantId}`);
  }

  report.restaurants.sampled = Array.from(docsById.values()).slice(0, args.limit + KNOWN_SAMPLE_RESTAURANT_IDS.length).map((doc) => ({
    restaurant: pickRestaurantFields(doc.id, doc.data() || {}),
    rawDataForAudit: doc.data() || {}
  }));
  report.restaurants.sampleCount = report.restaurants.sampled.length;

  for (const entry of report.restaurants.sampled) {
    const restaurant = entry.restaurant;
    if (!restaurant.ownerUid) report.restaurants.missingOwnerUid.push(restaurant.path);
    if ((restaurant.publicSlug || restaurant.landingSlug) === "") report.restaurants.missingSlug.push(restaurant.path);
    if (!restaurant.status) report.restaurants.missingStatus.push(restaurant.path);
    if (restaurant.ownerEmailMasked && !restaurant.ownerUid) report.restaurants.ownerEmailWithoutOwnerUid.push(restaurant.path);
    addUnique(args.slugs, restaurant.publicSlug);
    addUnique(args.slugs, restaurant.landingSlug);
  }
}

async function auditPublicRoutes(db, report, args) {
  const publicRoutesRef = db.collection("publicRoutes");
  report.publicRoutes.totalCount = await safeCount(publicRoutesRef, report, "publicRoutes");
  const routeDocsBySlug = new Map();

  const sample = await safeGetQuery(publicRoutesRef.limit(args.limit), report, `publicRoutes limit ${args.limit}`);
  (sample.snap?.docs || []).forEach((doc) => routeDocsBySlug.set(doc.id, doc));

  for (const slug of args.slugs) {
    const safeSlug = normalizeSlug(slug);
    if (!safeSlug) continue;
    const result = await safeGetDoc(publicRoutesRef.doc(safeSlug), report, `publicRoutes/${safeSlug}`);
    if (result.snap?.exists) routeDocsBySlug.set(result.snap.id, result.snap);
  }

  report.publicRoutes.sampled = [];
  for (const doc of routeDocsBySlug.values()) {
    const data = doc.data() || {};
    const route = {
      path: `publicRoutes/${doc.id}`,
      slug: doc.id,
      restaurantId: text(data.restaurantId || data.canonicalRestaurantId),
      canonicalSlug: normalizeSlug(data.canonicalSlug || data.slug || doc.id),
      status: text(data.status || "active"),
      targetExists: "unknown"
    };
    if (route.restaurantId) {
      const target = await safeGetDoc(db.collection("restaurants").doc(route.restaurantId), report, `restaurants/${route.restaurantId} route target`);
      route.targetExists = !!target.snap?.exists;
      if (!route.targetExists) report.publicRoutes.routesPointingToMissingRestaurants.push(route);
    }
    report.publicRoutes.sampled.push(route);
  }

  const routeBySlug = new Map(report.publicRoutes.sampled.map((route) => [normalizeSlug(route.slug), route]));
  report.restaurants.sampled.forEach((entry) => {
    const restaurant = entry.restaurant;
    const slugs = Array.from(new Set([normalizeSlug(restaurant.publicSlug), normalizeSlug(restaurant.landingSlug)].filter(Boolean)));
    slugs.forEach((slug) => {
      if (!routeBySlug.has(slug)) {
        report.publicRoutes.restaurantsWithSlugMissingPublicRoute.push({
          restaurantId: restaurant.id,
          slug,
          path: `publicRoutes/${slug}`
        });
      }
    });
  });

  args.slugs.forEach((slug) => {
    const safeSlug = normalizeSlug(slug);
    if (!safeSlug) return;
    const route = routeBySlug.get(safeSlug);
    if (route) return;
    report.publicRoutes.explicitSlugsMissingPublicRoute.push(safeSlug);
  });
}

async function auditMenuAndRestaurantSubcollections(db, report, args) {
  for (const entry of report.restaurants.sampled) {
    const restaurant = entry.restaurant;
    const restaurantId = restaurant.id;
    const restaurantRef = db.collection("restaurants").doc(restaurantId);
    const detail = {
      restaurantId,
      publicMenu: await auditPublicMenu(restaurantRef, restaurantId, report),
      menuItems: await auditMenuItems(restaurantRef, restaurantId, report),
      legacyMenuFields: auditLegacyMenuFields(entry.rawDataForAudit || {}),
      offers: await auditOffers(restaurantRef, restaurantId, report),
      socialPosts: await auditSocialPosts(restaurantRef, restaurantId, report),
      staff: await auditStaff(restaurantRef, restaurantId, report),
      orders: await auditOrders(restaurantRef, restaurantId, report),
      orderLookup: await auditOrderLookup(restaurantRef, restaurantId, report)
    };
    report.restaurantDetails.push(detail);
    computeRestaurantDetailFindings(report, restaurant, detail);
  }
  delete report.restaurants.sampled.rawDataForAudit;
  report.restaurants.sampled = report.restaurants.sampled.map((entry) => entry.restaurant);
}

async function auditPublicMenu(restaurantRef, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/public/menu`;
  const result = await safeGetDoc(restaurantRef.collection("public").doc("menu"), report, pathLabel);
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
    updatedAt: serializeTimestamp(data.updatedAt),
    fieldKeys: sampleKeys(data, 30)
  };
}

async function auditMenuItems(restaurantRef, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/menuItems`;
  const ref = restaurantRef.collection("menuItems");
  const count = await safeCount(ref, report, pathLabel);
  const sample = await safeGetQuery(ref.limit(5), report, `${pathLabel} limit 5`);
  const docs = sample.snap?.docs || [];
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
    "beverages",
    "products"
  ];
  const found = {};
  fields.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(restaurantData, field)) return;
    const value = restaurantData[field];
    if (value === undefined || value === null) return;
    found[field] = summarizeObjectShape(value);
  });
  return found;
}

async function auditOffers(restaurantRef, restaurantId, report) {
  const offersPath = `restaurants/${restaurantId}/public/offers`;
  const metaPath = `restaurants/${restaurantId}/public/meta`;
  const result = await safeGetDoc(restaurantRef.collection("public").doc("offers"), report, offersPath);
  const metaResult = await safeGetDoc(restaurantRef.collection("public").doc("meta"), report, metaPath);
  const metaData = metaResult.snap?.exists ? (metaResult.snap.data() || {}) : {};
  if (!result.ok) return { path: offersPath, exists: "error", itemsIsArray: false, itemCount: 0, metaExists: !!metaResult.snap?.exists };
  if (!result.snap.exists) {
    return {
      path: offersPath,
      exists: false,
      itemsIsArray: false,
      itemCount: 0,
      metaExists: !!metaResult.snap?.exists,
      offersEnabled: metaData.offersEnabled ?? null
    };
  }
  const data = result.snap.data() || {};
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    path: offersPath,
    exists: true,
    itemsIsArray: Array.isArray(data.items),
    itemCount: items.length,
    firstItems: items.slice(0, 5).map((item, idx) => summarizeFocusItem(item, `focus_${idx}`)),
    truthSource: text(data.truthSource),
    truthState: text(data.truthState),
    enabled: data.enabled ?? null,
    offersEnabled: metaData.offersEnabled ?? data.offersEnabled ?? null,
    metaExists: !!metaResult.snap?.exists,
    metaFieldKeys: sampleKeys(metaData, 24),
    updatedAt: serializeTimestamp(data.updatedAt)
  };
}

async function auditSocialPosts(restaurantRef, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/socialPosts`;
  const ref = restaurantRef.collection("socialPosts");
  const count = await safeCount(ref, report, pathLabel);
  const sample = await safeGetQuery(ref.limit(5), report, `${pathLabel} limit 5`);
  const docs = sample.snap?.docs || [];
  return {
    path: pathLabel,
    count,
    sampleCount: docs.length,
    firstPosts: docs.map(summarizePostDoc)
  };
}

async function auditStaff(restaurantRef, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/staff`;
  const ref = restaurantRef.collection("staff");
  const count = await safeCount(ref, report, pathLabel);
  const sample = await safeGetQuery(ref.limit(5), report, `${pathLabel} limit 5`);
  const docs = sample.snap?.docs || [];
  return {
    path: pathLabel,
    count,
    sampleCount: docs.length,
    firstStaff: docs.map(summarizeStaffDoc)
  };
}

async function auditOrders(restaurantRef, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/orders`;
  const ref = restaurantRef.collection("orders");
  const count = await safeCount(ref, report, pathLabel);
  const sample = await safeGetQuery(ref.limit(5), report, `${pathLabel} limit 5`);
  const docs = sample.snap?.docs || [];
  return {
    path: pathLabel,
    count,
    sampleCount: docs.length,
    firstOrders: docs.map(summarizeOrderDoc)
  };
}

async function auditOrderLookup(restaurantRef, restaurantId, report) {
  const pathLabel = `restaurants/${restaurantId}/orderLookup`;
  const ref = restaurantRef.collection("orderLookup");
  const count = await safeCount(ref, report, pathLabel);
  const sample = await safeGetQuery(ref.limit(5), report, `${pathLabel} limit 5`);
  const docs = sample.snap?.docs || [];
  return {
    path: pathLabel,
    count,
    sampleCount: docs.length,
    firstLookupIds: docs.map((doc) => doc.id)
  };
}

function computeRestaurantDetailFindings(report, restaurant, detail) {
  const publicCount = Number(detail.publicMenu.itemCount || 0);
  const menuItemsCount = Number(detail.menuItems.count ?? detail.menuItems.sampleCount ?? 0);
  const offersCount = Number(detail.offers.itemCount || 0);
  const hasLegacyFields = Object.keys(detail.legacyMenuFields || {}).length > 0;
  const publicMenuMissingOrEmpty = detail.publicMenu.exists !== true || publicCount === 0;

  if (detail.publicMenu.exists === true && publicCount > 0) {
    report.menu.publicMenuActiveGood.push({ restaurantId: restaurant.id, publicMenuItemCount: publicCount });
  }
  if (publicMenuMissingOrEmpty) {
    report.menu.publicMenuMissingOrEmpty.push({
      restaurantId: restaurant.id,
      exists: detail.publicMenu.exists,
      publicMenuItemCount: publicCount
    });
  }
  if (menuItemsCount > 0) {
    report.menu.menuItemsStillHasData.push({ restaurantId: restaurant.id, menuItemsCount });
  }
  if (publicMenuMissingOrEmpty && menuItemsCount > 0) {
    report.menu.needsBackfill.push({
      restaurantId: restaurant.id,
      reason: "public/menu missing or empty while menuItems has items",
      publicMenuItemCount: publicCount,
      menuItemsCount
    });
  }
  if (publicCount > 0 && menuItemsCount > 0 && publicCount !== menuItemsCount) {
    report.menu.publicVsMenuItemsCountDiff.push({
      restaurantId: restaurant.id,
      publicMenuItemCount: publicCount,
      menuItemsCount
    });
  }
  if (hasLegacyFields) {
    report.menu.legacyFieldsPresent.push({
      restaurantId: restaurant.id,
      fields: Object.keys(detail.legacyMenuFields)
    });
  }
  if (detail.publicMenu.exists === true && (!detail.publicMenu.menuTruthSource || !detail.publicMenu.menuTruthState)) {
    report.menu.publicMenuMissingTruthMetadata.push({
      restaurantId: restaurant.id,
      menuTruthSource: detail.publicMenu.menuTruthSource,
      menuTruthState: detail.publicMenu.menuTruthState
    });
  }
  if (offersCount > 0) {
    report.focus.offersWithItems.push({ restaurantId: restaurant.id, offersItemCount: offersCount });
  }
  if (offersCount > 0 && publicMenuMissingOrEmpty) {
    report.focus.focusWithoutMenu.push({
      restaurantId: restaurant.id,
      offersItemCount: offersCount,
      publicMenuItemCount: publicCount,
      publicMenuExists: detail.publicMenu.exists
    });
  }
  if (detail.offers.exists === true && (!detail.offers.truthSource || !detail.offers.truthState)) {
    report.focus.offersMissingTruthMetadata.push({
      restaurantId: restaurant.id,
      truthSource: detail.offers.truthSource,
      truthState: detail.offers.truthState
    });
  }
}

async function auditUserPostsAndGlobalFeeds(db, report) {
  for (const user of report.users.sampled.slice(0, 50)) {
    const pathLabel = `${user.path}/posts`;
    const ref = db.collection("users").doc(user.id).collection("posts");
    const count = await safeCount(ref, report, pathLabel);
    const sample = await safeGetQuery(ref.limit(5), report, `${pathLabel} limit 5`);
    const docs = sample.snap?.docs || [];
    if (count || docs.length) {
      report.userPosts.samples.push({
        uid: user.id,
        path: pathLabel,
        count,
        sampleCount: docs.length,
        firstPosts: docs.map(summarizePostDoc)
      });
    }
  }

  const socialFeedRef = db.collection("socialFeed");
  report.globalPosts.socialFeedCount = await safeCount(socialFeedRef, report, "socialFeed");
  const socialFeed = await safeGetQuery(socialFeedRef.limit(10), report, "socialFeed limit 10");
  report.globalPosts.socialFeedSample = (socialFeed.snap?.docs || []).map(summarizePostDoc);
}

function auditRelations(report) {
  const usersById = new Map(report.users.sampled.map((user) => [user.id, user]));
  const restaurantsById = new Map(report.restaurants.sampled.map((restaurant) => [restaurant.id, restaurant]));
  const publicRouteBySlug = new Map(report.publicRoutes.sampled.map((route) => [normalizeSlug(route.slug), route]));

  report.users.sampled.forEach((user) => {
    if (lower(user.role) === "business") {
      const target = user.restaurantId ? restaurantsById.get(user.restaurantId) : null;
      if (!user.restaurantId || !target) {
        report.relations.userRestaurantIssues.push({
          path: user.path,
          issue: user.restaurantId ? "restaurantId points outside audited/missing restaurant sample" : "business user missing restaurantId",
          restaurantId: user.restaurantId
        });
      } else if (target.ownerUid && target.ownerUid !== user.id) {
        report.relations.userRestaurantIssues.push({
          path: user.path,
          issue: "restaurant ownerUid differs from user id",
          restaurantId: user.restaurantId,
          restaurantOwnerUid: target.ownerUid
        });
      }
    }
  });

  report.restaurants.sampled.forEach((restaurant) => {
    if (restaurant.ownerUid) {
      const ownerUser = usersById.get(restaurant.ownerUid);
      if (!ownerUser) {
        report.relations.ownerUidIssues.push({
          restaurantId: restaurant.id,
          issue: "ownerUid not present in audited user sample",
          ownerUid: restaurant.ownerUid
        });
      } else if (ownerUser.restaurantId && ownerUser.restaurantId !== restaurant.id) {
        report.relations.ownerUidIssues.push({
          restaurantId: restaurant.id,
          issue: "owner user's restaurantId points elsewhere",
          ownerUid: restaurant.ownerUid,
          ownerUserRestaurantId: ownerUser.restaurantId
        });
      }
    }

    const slugs = Array.from(new Set([normalizeSlug(restaurant.publicSlug), normalizeSlug(restaurant.landingSlug)].filter(Boolean)));
    slugs.forEach((slug) => {
      const route = publicRouteBySlug.get(slug);
      if (route && route.restaurantId && route.restaurantId !== restaurant.id) {
        report.publicRoutes.slugRestaurantMismatches.push({
          restaurantId: restaurant.id,
          slug,
          publicRouteRestaurantId: route.restaurantId
        });
      }
    });
  });
}

function finalizeSummary(report) {
  report.summary = {
    usersTotalCount: report.users.totalCount,
    usersSampleCount: report.users.sampleCount,
    restaurantsTotalCount: report.restaurants.totalCount,
    restaurantsSampleCount: report.restaurants.sampleCount,
    publicRoutesTotalCount: report.publicRoutes.totalCount,
    restaurantDetailsCount: report.restaurantDetails.length,
    publicMenuActiveGoodCount: report.menu.publicMenuActiveGood.length,
    publicMenuMissingOrEmptyCount: report.menu.publicMenuMissingOrEmpty.length,
    menuItemsStillHasDataCount: report.menu.menuItemsStillHasData.length,
    publicMenuBackfillNeededCount: report.menu.needsBackfill.length,
    publicVsMenuItemsCountDiffCount: report.menu.publicVsMenuItemsCountDiff.length,
    focusWithoutMenuCount: report.focus.focusWithoutMenu.length,
    userRestaurantIssueCount: report.relations.userRestaurantIssues.length,
    ownerUidIssueCount: report.relations.ownerUidIssues.length,
    slugRestaurantMismatchCount: report.publicRoutes.slugRestaurantMismatches.length,
    restaurantsWithSlugMissingPublicRouteCount: report.publicRoutes.restaurantsWithSlugMissingPublicRoute.length,
    publicRoutesPointingToMissingRestaurantsCount: report.publicRoutes.routesPointingToMissingRestaurants.length,
    warningsCount: report.warnings.length
  };

  const cause = [];
  if (report.menu.needsBackfill.length) cause.push("public/menu missing or empty while legacy menuItems has items");
  if (report.publicRoutes.slugRestaurantMismatches.length) cause.push("slug mapping mismatch");
  if (report.relations.userRestaurantIssues.length) cause.push("users/{uid}.restaurantId issues");
  if (report.focus.focusWithoutMenu.length) cause.push("focus exists while menu is missing/empty");
  if (!cause.length) cause.push("no broad critical mismatch found in audited sample; inspect target restaurant if issue persists");
  report.summary.biggestRisks = cause;
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
      limit: args.limit,
      out: args.out,
      restaurantIds: args.restaurantIds,
      uids: args.uids,
      slugs: args.slugs
    },
    pathsRead: [],
    warnings: [],
    users: {
      totalCount: null,
      sampleCount: 0,
      roleCounts: {},
      withRoleCount: 0,
      businessWithRestaurantIdCount: 0,
      businessMissingRestaurantId: [],
      staffWithStaffRestaurantIdCount: 0,
      staffWithWaiterRestaurantIdCount: 0,
      staffMissingRestaurantLink: [],
      missingStatus: [],
      uidFieldMissingOrMismatch: [],
      sampled: []
    },
    restaurants: {
      totalCount: null,
      sampleCount: 0,
      sampled: [],
      missingRestaurantDocs: [],
      missingOwnerUid: [],
      missingSlug: [],
      missingStatus: [],
      ownerEmailWithoutOwnerUid: []
    },
    publicRoutes: {
      totalCount: null,
      sampled: [],
      restaurantsWithSlugMissingPublicRoute: [],
      explicitSlugsMissingPublicRoute: [],
      routesPointingToMissingRestaurants: [],
      slugRestaurantMismatches: []
    },
    restaurantDetails: [],
    menu: {
      publicMenuActiveGood: [],
      publicMenuMissingOrEmpty: [],
      menuItemsStillHasData: [],
      publicVsMenuItemsCountDiff: [],
      legacyFieldsPresent: [],
      publicMenuMissingTruthMetadata: [],
      needsBackfill: []
    },
    focus: {
      offersWithItems: [],
      focusWithoutMenu: [],
      offersMissingTruthMetadata: []
    },
    userPosts: {
      samples: []
    },
    globalPosts: {
      socialFeedCount: null,
      socialFeedSample: []
    },
    relations: {
      userRestaurantIssues: [],
      ownerUidIssues: []
    },
    summary: {}
  };

  await auditUsers(db, report, args);
  await auditRestaurants(db, report, args);
  await auditPublicRoutes(db, report, args);
  await auditMenuAndRestaurantSubcollections(db, report, args);
  await auditUserPostsAndGlobalFeeds(db, report);
  auditRelations(report);
  finalizeSummary(report);

  const outPath = path.resolve(process.cwd(), args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Wrote read-only data-contract audit report: ${outPath}`);
  console.log(`Users sampled: ${report.users.sampleCount}; restaurants audited: ${report.restaurantDetails.length}; warnings: ${report.warnings.length}`);
  console.log(`public/menu backfill candidates: ${report.menu.needsBackfill.length}; focusWithoutMenu: ${report.focus.focusWithoutMenu.length}; slug mismatches: ${report.publicRoutes.slugRestaurantMismatches.length}`);
}

main().catch((err) => {
  console.error("Read-only data-contract audit failed:", sanitizeError(err));
  process.exitCode = 1;
});
