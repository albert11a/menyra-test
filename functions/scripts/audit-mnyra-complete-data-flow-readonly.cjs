#!/usr/bin/env node
"use strict";

/*
  COMPLETE READ-ONLY Firebase data-flow inventory for Mnyra.

  This script is intentionally read-only:
  - no Firestore writes
  - no deletes
  - no migrations
  - no rules/functions deploys
  - write-like flags and APPLY=1 are refused

  Example:
    GOOGLE_APPLICATION_CREDENTIALS=C:/mnyra-secrets/service-account.json node functions/scripts/audit-mnyra-complete-data-flow-readonly.cjs --out C:/mnyra-secrets/mnyra-complete-data-flow-audit.json
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

const CONVERTED_LEAD_STATUSES = new Set(["kunde", "customer", "converted", "active"]);
const PUBLIC_ROUTE_STATUS_ALLOWLIST = new Set(["active", "lead", "preview", "demo"]);

function text(value = "") {
  return String(value || "").trim();
}

function lower(value = "") {
  return text(value).toLowerCase();
}

function parseArgs(argv = []) {
  const args = {
    out: "C:/mnyra-secrets/mnyra-complete-data-flow-audit.json",
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
    if (key === "--out") args.out = text(readValue()) || args.out;
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

function serializeTimestamp(value) {
  if (!value) return "";
  if (typeof value.toDate === "function") {
    try { return value.toDate().toISOString(); } catch {}
  }
  if (typeof value.toMillis === "function") {
    try { return new Date(value.toMillis()).toISOString(); } catch {}
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

function sampleKeys(data = {}, max = 40) {
  return data && typeof data === "object" ? Object.keys(data).slice(0, max) : [];
}

function bump(map, key) {
  const safeKey = text(key) || "(missing)";
  map[safeKey] = (Number(map[safeKey]) || 0) + 1;
}

function addIssue(report, issue) {
  report.issues.push({
    severity: issue.severity || "P2",
    area: issue.area || "data",
    collection: issue.collection || "",
    path: issue.path || "",
    fields: Array.isArray(issue.fields) ? issue.fields : [],
    cause: issue.cause || "",
    visibleEffect: issue.visibleEffect || "",
    fix: issue.fix || ""
  });
}

async function safeGetCollection(ref, report, label) {
  report.pathsRead.push(label);
  try {
    const snap = await ref.get();
    return snap.docs || [];
  } catch (err) {
    report.warnings.push({ path: label, error: sanitizeError(err) });
    return [];
  }
}

async function safeListCollections(docRef, report, label) {
  report.pathsRead.push(`${label}#listCollections`);
  try {
    const collections = await docRef.listCollections();
    return collections.map((collectionRef) => collectionRef.id).filter(Boolean).sort();
  } catch (err) {
    report.warnings.push({ path: `${label}#listCollections`, error: sanitizeError(err) });
    return [];
  }
}

async function safeListTopCollections(db, report) {
  report.pathsRead.push("topLevelCollections#listCollections");
  try {
    const collections = await db.listCollections();
    return collections.map((collectionRef) => collectionRef.id).filter(Boolean).sort();
  } catch (err) {
    report.warnings.push({ path: "topLevelCollections#listCollections", error: sanitizeError(err) });
    return [];
  }
}

function summarizeLead(docSnap) {
  const data = docSnap.data() || {};
  const canonicalRestaurantId = text(data.restaurantId || data.landingRestaurantId || data.restaurantDocId || data.restaurant);
  const convertedRestaurantId = text(data.convertedRestaurantId);
  return {
    id: docSnap.id,
    path: `leads/${docSnap.id}`,
    status: text(data.status),
    businessName: text(data.businessName || data.restaurantName || data.name),
    customerType: text(data.customerType || data.type || data.businessType),
    restaurantId: canonicalRestaurantId || convertedRestaurantId,
    canonicalRestaurantId,
    convertedRestaurantId,
    publicSlug: normalizeSlug(data.publicSlug || data.landingSlug || data.slug),
    socialUid: text(data.socialUid || data.uid || data.ownerUid),
    createdByUid: text(data.createdByUid || data.creatorUid),
    ceoPath: text(data.ceoPath),
    emailMasked: maskEmail(data.email || data.ownerEmail || data.socialEmail || data.contactEmail || ""),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    convertedAt: serializeTimestamp(data.convertedAt),
    fieldKeys: sampleKeys(data)
  };
}

function summarizeRestaurant(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    path: `restaurants/${docSnap.id}`,
    idField: text(data.id),
    ownerUid: text(data.ownerUid),
    ownerEmailMasked: maskEmail(data.ownerEmail || data.email || data.contactEmail || data.socialEmail || ""),
    name: text(data.name || data.restaurantName || data.businessName),
    status: text(data.status),
    type: text(data.type || data.customerType || data.businessType),
    publicSlug: normalizeSlug(data.publicSlug),
    landingSlug: normalizeSlug(data.landingSlug),
    canonicalPublicPath: text(data.canonicalPublicPath || data.publicPath),
    leadId: text(data.leadId),
    city: text(data.city),
    hasLogo: !!text(data.logo || data.logoUrl || data.imageUrl),
    hasCover: !!text(data.cover || data.coverUrl || data.heroImage || data.titleImage),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    fieldKeys: sampleKeys(data)
  };
}

function summarizeUser(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    path: `users/${docSnap.id}`,
    uidField: text(data.uid),
    role: text(data.role),
    roles: Array.isArray(data.roles) ? data.roles.map(text).filter(Boolean) : [],
    status: text(data.status),
    restaurantId: text(data.restaurantId),
    staffRestaurantId: text(data.staffRestaurantId),
    waiterRestaurantId: text(data.waiterRestaurantId),
    publicSlug: normalizeSlug(data.publicSlug || data.landingSlug),
    emailMasked: maskEmail(data.email || data.ownerEmail || data.loginEmail || data.accountEmail || ""),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    fieldKeys: sampleKeys(data)
  };
}

function summarizePublicRoute(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    path: `publicRoutes/${docSnap.id}`,
    slugField: normalizeSlug(data.slug || data.publicSlug || data.landingSlug),
    restaurantId: text(data.restaurantId || data.canonicalRestaurantId || data.rid),
    status: text(data.status || "active"),
    routeType: text(data.routeType || data.type),
    hasBusinessSnapshot: !!(data.business || data.restaurant || data.businessSnapshot),
    hasMenuSnapshot: !!data.menu,
    menuCount: Number(data.menu?.count ?? data.menu?.itemCount ?? 0) || 0,
    updatedAt: serializeTimestamp(data.updatedAt),
    fieldKeys: sampleKeys(data)
  };
}

function summarizeMenuItem(item = {}, fallbackId = "") {
  const data = item && typeof item === "object" ? item : {};
  return {
    id: text(data.id || data.itemId || data.menuItemId || data.productId || fallbackId),
    hasName: !!text(data.name || data.title),
    category: text(data.category || data.categoryName || data.cat),
    priceType: fieldType(data.price),
    hasImage: !!text(data.imageUrl || data.image || data.photoUrl || data.url)
      || (Array.isArray(data.imageUrls) && data.imageUrls.length > 0),
    active: data.active !== undefined
      ? data.active
      : (data.available !== undefined ? data.available : (data.hidden === true || data.menuHidden === true ? false : null)),
    fieldKeys: sampleKeys(data, 28)
  };
}

function summarizePost(docSnap, fallbackRestaurantId = "") {
  const data = docSnap.data() || {};
  const restaurantId = text(data.restaurantId || data.rid || fallbackRestaurantId);
  const mediaCount = Array.isArray(data.media) ? data.media.length : 0;
  const hasMedia = mediaCount > 0
    || !!text(data.mediaUrl || data.url || data.imageUrl || data.photoUrl || data.videoUrl);
  const hasText = !!text(data.caption || data.text || data.body || data.title);
  return {
    id: docSnap.id,
    path: docSnap.ref.path,
    restaurantId,
    ownerUid: text(data.ownerUid || data.ownerId || data.uid),
    status: text(data.status),
    hasMedia,
    hasText,
    createdAt: serializeTimestamp(data.createdAt),
    fieldKeys: sampleKeys(data, 28)
  };
}

function summarizeStory(docSnap, fallbackRestaurantId = "") {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    path: docSnap.ref.path,
    restaurantId: text(data.restaurantId || data.rid || fallbackRestaurantId),
    status: text(data.status),
    hasMedia: !!text(data.mediaUrl || data.url || data.imageUrl || data.photoUrl || data.videoUrl)
      || (Array.isArray(data.media) && data.media.length > 0),
    expiresAt: serializeTimestamp(data.expiresAt || data.expireAt),
    createdAt: serializeTimestamp(data.createdAt),
    fieldKeys: sampleKeys(data, 28)
  };
}

function summarizeStaff(docSnap, fallbackRestaurantId = "") {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    path: docSnap.ref.path,
    uid: text(data.uid || docSnap.id),
    restaurantId: text(data.restaurantId || data.staffRestaurantId || fallbackRestaurantId),
    role: text(data.role || data.staffRole),
    status: text(data.status || data.staffStatus),
    active: data.active ?? data.staffActive ?? null,
    emailMasked: maskEmail(data.email || "")
  };
}

function summarizePublicMenuDoc(docSnap) {
  if (!docSnap) return { exists: false, itemCount: 0, itemsIsArray: false, truthState: "", truthSource: "", itemIssues: [] };
  const data = docSnap.data() || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const itemIssues = [];
  items.forEach((item, index) => {
    const summary = summarizeMenuItem(item, `public_${index}`);
    if (!summary.id) itemIssues.push({ index, issue: "missing item id" });
    if (!summary.hasName) itemIssues.push({ index, id: summary.id, issue: "missing name/title" });
  });
  return {
    exists: true,
    itemsIsArray: Array.isArray(data.items),
    itemCount: items.length,
    truthSource: text(data.menuTruthSource),
    truthState: text(data.menuTruthState),
    statusBadgeVisible: data.statusBadgeVisible ?? null,
    updatedAt: serializeTimestamp(data.updatedAt),
    fieldKeys: sampleKeys(data, 30),
    firstItems: items.slice(0, 5).map((item, index) => summarizeMenuItem(item, `public_${index}`)),
    itemIssues
  };
}

function summarizeOffersDoc(docSnap) {
  if (!docSnap) return { exists: false, itemCount: 0, itemsIsArray: false, truthState: "", truthSource: "" };
  const data = docSnap.data() || {};
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    exists: true,
    itemsIsArray: Array.isArray(data.items),
    itemCount: items.length,
    truthSource: text(data.truthSource),
    truthState: text(data.truthState),
    updatedAt: serializeTimestamp(data.updatedAt),
    fieldKeys: sampleKeys(data, 30)
  };
}

function summarizeMenuItemsDocs(docs = []) {
  const itemIssues = [];
  const firstItems = [];
  docs.forEach((docSnap, index) => {
    const summary = summarizeMenuItem({ id: docSnap.id, ...(docSnap.data() || {}) }, docSnap.id);
    if (index < 5) firstItems.push(summary);
    if (!summary.hasName) itemIssues.push({ path: docSnap.ref.path, issue: "missing name/title" });
  });
  return {
    count: docs.length,
    firstItems,
    itemIssues
  };
}

function addRequiredLeadIssues(report, lead, restaurantsById) {
  if (!lead.businessName) {
    addIssue(report, {
      severity: "P1",
      area: "leads",
      collection: "leads",
      path: lead.path,
      fields: ["businessName", "restaurantName", "name"],
      cause: "Lead has no usable business identity field.",
      visibleEffect: "CRM row or later restaurant conversion can miss the display name.",
      fix: "Manually enrich the lead before conversion or derive from a confirmed source."
    });
  }
  if (!lead.status) {
    addIssue(report, {
      severity: "P1",
      area: "leads",
      collection: "leads",
      path: lead.path,
      fields: ["status"],
      cause: "Lead uses an older or incomplete shape without status.",
      visibleEffect: "CRM filters and Lead -> Restaurant activation can classify it inconsistently.",
      fix: "Backfill status only after defining allowed lead statuses."
    });
  }
  if (!lead.createdByUid && !lead.ceoPath) {
    addIssue(report, {
      severity: "P2",
      area: "leads",
      collection: "leads",
      path: lead.path,
      fields: ["createdByUid", "ceoPath"],
      cause: "Lead is missing CEO/user scope fields.",
      visibleEffect: "Scoped CRM reads can miss or misclassify the lead.",
      fix: "Repair scope after checking who owns the lead."
    });
  }
  if (CONVERTED_LEAD_STATUSES.has(lower(lead.status)) && !lead.canonicalRestaurantId && lead.convertedRestaurantId) {
    addIssue(report, {
      severity: "P1",
      area: "lead-conversion",
      collection: "leads",
      path: lead.path,
      fields: ["convertedRestaurantId", "restaurantId"],
      cause: "Converted lead uses legacy convertedRestaurantId but lacks canonical restaurantId/landingRestaurantId.",
      visibleEffect: "Code paths that only read restaurantId/landingRestaurantId can miss the linked restaurant.",
      fix: "After backup, copy the confirmed convertedRestaurantId into the canonical restaurant link fields."
    });
  }
  if (CONVERTED_LEAD_STATUSES.has(lower(lead.status)) && !lead.restaurantId) {
    addIssue(report, {
      severity: "P1",
      area: "lead-conversion",
      collection: "leads",
      path: lead.path,
      fields: ["status", "restaurantId"],
      cause: "Lead looks converted but has no restaurant link.",
      visibleEffect: "CRM can show a customer without a resolvable public/business profile.",
      fix: "After backup, connect it to the intended restaurant or revert status."
    });
  }
  if (lead.restaurantId && !restaurantsById.has(lead.restaurantId)) {
    addIssue(report, {
      severity: "P1",
      area: "lead-conversion",
      collection: "leads",
      path: lead.path,
      fields: ["restaurantId"],
      cause: "Lead points to a missing restaurant document.",
      visibleEffect: "Conversion state can break profile/account resolution.",
      fix: "Manually confirm whether the restaurant was deleted or the ID is stale."
    });
  }
}

function addRestaurantIssues(report, restaurant, usersById, routesBySlug) {
  if (!restaurant.name) {
    addIssue(report, {
      severity: "P1",
      area: "restaurants",
      collection: "restaurants",
      path: restaurant.path,
      fields: ["name", "restaurantName", "businessName"],
      cause: "Restaurant has no usable public display name.",
      visibleEffect: "Lists, profile header and route snapshots can render incomplete data.",
      fix: "Manually enrich the restaurant identity before making it public."
    });
  }
  if (!restaurant.status) {
    addIssue(report, {
      severity: "P1",
      area: "restaurants",
      collection: "restaurants",
      path: restaurant.path,
      fields: ["status"],
      cause: "Restaurant has no status.",
      visibleEffect: "Public/admin visibility can diverge between loaders.",
      fix: "Backfill status after defining the restaurant status contract."
    });
  }
  if (!restaurant.publicSlug && !restaurant.landingSlug) {
    addIssue(report, {
      severity: "P1",
      area: "public-routes",
      collection: "restaurants",
      path: restaurant.path,
      fields: ["publicSlug", "landingSlug"],
      cause: "Restaurant has no public slug.",
      visibleEffect: "Direct public profile URL cannot be resolved by slug.",
      fix: "Assign a unique slug only after duplicate check."
    });
  }
  if (!restaurant.ownerUid) {
    addIssue(report, {
      severity: "P1",
      area: "business-accounts",
      collection: "restaurants",
      path: restaurant.path,
      fields: ["ownerUid"],
      cause: "Restaurant has no owner user link.",
      visibleEffect: "Owner dashboard, menu editor and account bootstrap can fail or fall back.",
      fix: "Manually confirm owner before setting ownerUid."
    });
  } else if (!usersById.has(restaurant.ownerUid)) {
    addIssue(report, {
      severity: "P1",
      area: "business-accounts",
      collection: "restaurants",
      path: restaurant.path,
      fields: ["ownerUid"],
      cause: "ownerUid does not match a users/{uid} document.",
      visibleEffect: "Business owner resolution can fail even if public profile works.",
      fix: "Check Auth/User export before repairing the owner link."
    });
  }

  const slugs = Array.from(new Set([restaurant.publicSlug, restaurant.landingSlug].filter(Boolean)));
  slugs.forEach((slug) => {
    const route = routesBySlug.get(slug);
    if (!route) {
      addIssue(report, {
        severity: "P1",
        area: "public-routes",
        collection: "publicRoutes",
        path: `publicRoutes/${slug}`,
        fields: ["restaurantId"],
        cause: "Restaurant slug has no publicRoutes document.",
        visibleEffect: "Public URL by slug will not resolve through the route index.",
        fix: "Create/update publicRoutes only after status and slug ownership are confirmed."
      });
    } else if (route.restaurantId && route.restaurantId !== restaurant.id) {
      addIssue(report, {
        severity: "P0",
        area: "public-routes",
        collection: "publicRoutes",
        path: route.path,
        fields: ["restaurantId"],
        cause: "Slug route points to a different restaurant than the restaurant slug fields.",
        visibleEffect: "Profile/Menu/Posts can load from the wrong restaurant.",
        fix: "Manually resolve slug ownership before changing data."
      });
    }
  });
}

function addPublicRouteIssues(report, route, restaurantsById) {
  if (!route.restaurantId) {
    addIssue(report, {
      severity: "P1",
      area: "public-routes",
      collection: "publicRoutes",
      path: route.path,
      fields: ["restaurantId"],
      cause: "Route has no target restaurantId.",
      visibleEffect: "Public resolver cannot load the restaurant profile.",
      fix: "Set restaurantId only after confirming slug ownership."
    });
  } else if (!restaurantsById.has(route.restaurantId)) {
    addIssue(report, {
      severity: "P1",
      area: "public-routes",
      collection: "publicRoutes",
      path: route.path,
      fields: ["restaurantId"],
      cause: "Route points to a missing restaurant.",
      visibleEffect: "Public URL resolves to a dead target.",
      fix: "Remove or retarget only after backup and business decision."
    });
  }
  if (route.slugField && route.slugField !== normalizeSlug(route.id)) {
    addIssue(report, {
      severity: "P2",
      area: "public-routes",
      collection: "publicRoutes",
      path: route.path,
      fields: ["slug"],
      cause: "Route document ID and slug field differ.",
      visibleEffect: "Snapshot/debug tooling can show a different slug than the actual URL.",
      fix: "Normalize route slug metadata after deciding canonical slug."
    });
  }
  if (route.status && !PUBLIC_ROUTE_STATUS_ALLOWLIST.has(lower(route.status))) {
    addIssue(report, {
      severity: "P2",
      area: "public-routes",
      collection: "publicRoutes",
      path: route.path,
      fields: ["status"],
      cause: "Route status is outside the known public route contract.",
      visibleEffect: "Resolver/admin tools can disagree about visibility.",
      fix: "Define allowed public route statuses before migration."
    });
  }
}

function addUserIssues(report, user, restaurantsById) {
  if (user.uidField && user.uidField !== user.id) {
    addIssue(report, {
      severity: "P1",
      area: "users",
      collection: "users",
      path: user.path,
      fields: ["uid"],
      cause: "users/{docId} does not match uid field.",
      visibleEffect: "Auth/profile resolution can attach the wrong account metadata.",
      fix: "Manually verify and repair or archive the malformed document."
    });
  }
  if (!user.status) {
    addIssue(report, {
      severity: "P2",
      area: "users",
      collection: "users",
      path: user.path,
      fields: ["status"],
      cause: "User has no status field.",
      visibleEffect: "Role and activation gates can behave differently across code paths.",
      fix: "Backfill only after defining user status defaults."
    });
  }
  if (lower(user.role) === "business") {
    if (!user.restaurantId) {
      addIssue(report, {
        severity: "P1",
        area: "business-accounts",
        collection: "users",
        path: user.path,
        fields: ["restaurantId"],
        cause: "Business user has no restaurantId.",
        visibleEffect: "Business dashboard/profile resolution cannot find the restaurant.",
        fix: "Link only after confirming ownership."
      });
    } else if (!restaurantsById.has(user.restaurantId)) {
      addIssue(report, {
        severity: "P1",
        area: "business-accounts",
        collection: "users",
        path: user.path,
        fields: ["restaurantId"],
        cause: "Business user points to a missing restaurant.",
        visibleEffect: "Account can log in but cannot resolve the business profile.",
        fix: "Manually confirm intended restaurant or remove stale link after backup."
      });
    }
  }
}

function addMenuIssues(report, restaurant, detail) {
  const publicCount = detail.publicMenu.itemCount;
  const menuItemsCount = detail.menuItems.count;
  if (detail.publicMenu.exists && detail.publicMenu.itemCount > 0 && (!detail.publicMenu.truthSource || !detail.publicMenu.truthState)) {
    addIssue(report, {
      severity: "P1",
      area: "menu",
      collection: "restaurants/*/public/menu",
      path: `${restaurant.path}/public/menu`,
      fields: ["menuTruthSource", "menuTruthState"],
      cause: "Public menu has items but lacks truth metadata.",
      visibleEffect: "Loader cannot reliably distinguish seeded, known-empty and unknown states.",
      fix: "Backfill truth metadata after backup."
    });
  }
  if (detail.publicMenu.exists && !detail.publicMenu.itemsIsArray) {
    addIssue(report, {
      severity: "P1",
      area: "menu",
      collection: "restaurants/*/public/menu",
      path: `${restaurant.path}/public/menu`,
      fields: ["items"],
      cause: "Public menu document exists but items is not an array.",
      visibleEffect: "Public menu loader treats it as empty or invalid.",
      fix: "Manually repair public/menu.items to an array."
    });
  }
  if (detail.publicMenu.itemIssues.length) {
    addIssue(report, {
      severity: "P2",
      area: "menu",
      collection: "restaurants/*/public/menu",
      path: `${restaurant.path}/public/menu`,
      fields: ["items"],
      cause: "Some public menu items miss id or name/title.",
      visibleEffect: "Menu rows can be unstable, blank or difficult to reconcile.",
      fix: "Repair affected item fields in a reviewed migration."
    });
  }
  if (publicCount === 0 && menuItemsCount > 0) {
    addIssue(report, {
      severity: "P1",
      area: "menu",
      collection: "restaurants/*/menuItems",
      path: `${restaurant.path}/menuItems`,
      fields: ["public/menu.items", "menuItems"],
      cause: "Legacy menuItems has data while public/menu is missing or empty.",
      visibleEffect: "Editor/legacy paths may show menu while public profile shows empty/error.",
      fix: "Manually decide whether to publish menuItems into public/menu."
    });
  }
  if (publicCount > 0 && menuItemsCount > 0 && publicCount !== menuItemsCount) {
    addIssue(report, {
      severity: "P1",
      area: "menu",
      collection: "restaurants/*/public/menu",
      path: `${restaurant.path}/public/menu`,
      fields: ["items", "menuItems"],
      cause: "Public menu count differs from legacy menuItems count.",
      visibleEffect: "Public profile and editor/legacy views can disagree.",
      fix: "Compare both sources manually and preserve the confirmed public truth."
    });
  }
}

function addOfferIssues(report, restaurant, detail) {
  if (detail.offers.exists && detail.offers.itemCount > 0 && (!detail.offers.truthSource || !detail.offers.truthState)) {
    addIssue(report, {
      severity: "P2",
      area: "offers",
      collection: "restaurants/*/public/offers",
      path: `${restaurant.path}/public/offers`,
      fields: ["truthSource", "truthState"],
      cause: "Public offers has items but lacks truth metadata.",
      visibleEffect: "Focus/Shopping/Travel can be harder to distinguish from unknown state.",
      fix: "Backfill truth metadata after backup."
    });
  }
  if (detail.offers.itemCount > 0 && detail.publicMenu.itemCount === 0) {
    addIssue(report, {
      severity: "P2",
      area: "offers-menu-alignment",
      collection: "restaurants/*/public",
      path: `${restaurant.path}/public`,
      fields: ["offers.items", "menu.items"],
      cause: "Restaurant has public offers but no public menu items.",
      visibleEffect: "Shopping/Focus can look active while Menu is empty.",
      fix: "Product decision: allow offers-only businesses or add known-empty menu metadata."
    });
  }
}

function addPostIssues(report, post, collectionLabel) {
  if (!post.restaurantId) {
    addIssue(report, {
      severity: "P1",
      area: "posts",
      collection: collectionLabel,
      path: post.path,
      fields: ["restaurantId", "rid"],
      cause: "Post has no restaurant link.",
      visibleEffect: "Feed/Profile reconciliation can lose this post.",
      fix: "Repair restaurantId only after confirming ownership."
    });
  }
  if (!post.hasMedia && !post.hasText) {
    addIssue(report, {
      severity: "P2",
      area: "posts",
      collection: collectionLabel,
      path: post.path,
      fields: ["media", "mediaUrl", "url", "caption", "text"],
      cause: "Post has no visible media or text fields.",
      visibleEffect: "Post can be filtered out or render blank.",
      fix: "Archive or repair after confirming whether it is intentional."
    });
  }
}

function addStoryIssues(report, story) {
  if (!story.restaurantId) {
    addIssue(report, {
      severity: "P1",
      area: "stories",
      collection: "restaurants/*/stories",
      path: story.path,
      fields: ["restaurantId", "rid"],
      cause: "Story has no restaurant link.",
      visibleEffect: "Story identity hydration can fail.",
      fix: "Repair after confirming restaurant ownership."
    });
  }
  if (!story.hasMedia) {
    addIssue(report, {
      severity: "P2",
      area: "stories",
      collection: "restaurants/*/stories",
      path: story.path,
      fields: ["mediaUrl", "url", "imageUrl", "photoUrl", "videoUrl", "media"],
      cause: "Story has no visible media field.",
      visibleEffect: "Story can render blank or be skipped.",
      fix: "Archive or repair after review."
    });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  refuseIfUnsafe(args);
  initializeAdmin();
  const db = admin.firestore();

  const report = {
    generatedAt: new Date().toISOString(),
    readOnly: true,
    completeInventory: true,
    projectId: readDefaultProjectId() || "",
    pathsRead: [],
    warnings: [],
    topLevelCollections: [],
    collectionPresence: {
      restaurantSubcollections: {},
      userSubcollections: {}
    },
    counts: {},
    distributions: {
      leadStatus: {},
      restaurantStatus: {},
      restaurantType: {},
      routeStatus: {},
      userRole: {},
      userStatus: {},
      publicMenuTruthState: {},
      offersTruthState: {}
    },
    leads: [],
    restaurants: [],
    publicRoutes: [],
    users: [],
    restaurantDetails: [],
    socialFeed: [],
    userPosts: [],
    issues: [],
    warningsSummary: {}
  };

  report.topLevelCollections = await safeListTopCollections(db, report);

  const [leadDocs, restaurantDocs, routeDocs, userDocs, socialFeedDocs] = await Promise.all([
    safeGetCollection(db.collection("leads"), report, "leads"),
    safeGetCollection(db.collection("restaurants"), report, "restaurants"),
    safeGetCollection(db.collection("publicRoutes"), report, "publicRoutes"),
    safeGetCollection(db.collection("users"), report, "users"),
    safeGetCollection(db.collection("socialFeed"), report, "socialFeed")
  ]);

  const leads = leadDocs.map(summarizeLead);
  const restaurants = restaurantDocs.map(summarizeRestaurant);
  const routes = routeDocs.map(summarizePublicRoute);
  const users = userDocs.map(summarizeUser);
  const socialFeed = socialFeedDocs.map((doc) => summarizePost(doc));

  const leadsById = new Map(leads.map((lead) => [lead.id, lead]));
  const restaurantsById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  const routesBySlug = new Map(routes.map((route) => [normalizeSlug(route.id), route]));
  const usersById = new Map(users.map((user) => [user.id, user]));

  leads.forEach((lead) => {
    bump(report.distributions.leadStatus, lead.status);
    addRequiredLeadIssues(report, lead, restaurantsById);
  });
  restaurants.forEach((restaurant) => {
    bump(report.distributions.restaurantStatus, restaurant.status);
    bump(report.distributions.restaurantType, restaurant.type);
    addRestaurantIssues(report, restaurant, usersById, routesBySlug);
  });
  routes.forEach((route) => {
    bump(report.distributions.routeStatus, route.status);
    addPublicRouteIssues(report, route, restaurantsById);
  });
  users.forEach((user) => {
    bump(report.distributions.userRole, user.role);
    bump(report.distributions.userStatus, user.status);
    addUserIssues(report, user, restaurantsById);
  });
  socialFeed.forEach((post) => addPostIssues(report, post, "socialFeed"));

  report.leads = leads;
  report.restaurants = restaurants;
  report.publicRoutes = routes;
  report.users = users;
  report.socialFeed = socialFeed;

  for (const restaurantDoc of restaurantDocs) {
    const restaurant = restaurantsById.get(restaurantDoc.id);
    const restaurantRef = restaurantDoc.ref;
    const restaurantPath = `restaurants/${restaurantDoc.id}`;
    const subcollections = await safeListCollections(restaurantRef, report, restaurantPath);
    subcollections.forEach((name) => bump(report.collectionPresence.restaurantSubcollections, name));

    const publicDocs = await safeGetCollection(restaurantRef.collection("public"), report, `${restaurantPath}/public`);
    const publicById = new Map(publicDocs.map((doc) => [doc.id, doc]));
    const menuItemsDocs = await safeGetCollection(restaurantRef.collection("menuItems"), report, `${restaurantPath}/menuItems`);
    const socialPostDocs = await safeGetCollection(restaurantRef.collection("socialPosts"), report, `${restaurantPath}/socialPosts`);
    const storyDocs = await safeGetCollection(restaurantRef.collection("stories"), report, `${restaurantPath}/stories`);
    const staffDocs = await safeGetCollection(restaurantRef.collection("staff"), report, `${restaurantPath}/staff`);

    const publicMenu = summarizePublicMenuDoc(publicById.get("menu") || null);
    const offers = summarizeOffersDoc(publicById.get("offers") || null);
    const metaDoc = publicById.get("meta");
    const menuItems = summarizeMenuItemsDocs(menuItemsDocs);
    const profilePosts = socialPostDocs.map((doc) => summarizePost(doc, restaurantDoc.id));
    const stories = storyDocs.map((doc) => summarizeStory(doc, restaurantDoc.id));
    const staff = staffDocs.map((doc) => summarizeStaff(doc, restaurantDoc.id));

    bump(report.distributions.publicMenuTruthState, publicMenu.truthState);
    bump(report.distributions.offersTruthState, offers.truthState);

    const detail = {
      restaurantId: restaurantDoc.id,
      path: restaurantPath,
      subcollections,
      publicDocs: publicDocs.map((doc) => doc.id).sort(),
      publicMenu,
      offers,
      publicMeta: {
        exists: !!metaDoc,
        fieldKeys: metaDoc ? sampleKeys(metaDoc.data() || {}, 30) : []
      },
      menuItems,
      socialPosts: {
        count: profilePosts.length,
        firstPosts: profilePosts.slice(0, 5)
      },
      stories: {
        count: stories.length,
        firstStories: stories.slice(0, 5)
      },
      staff: {
        count: staff.length,
        firstStaff: staff.slice(0, 5)
      }
    };

    addMenuIssues(report, restaurant, detail);
    addOfferIssues(report, restaurant, detail);
    profilePosts.forEach((post) => addPostIssues(report, post, "restaurants/*/socialPosts"));
    stories.forEach((story) => addStoryIssues(report, story));
    report.restaurantDetails.push(detail);
  }

  for (const userDoc of userDocs) {
    const userPath = `users/${userDoc.id}`;
    const subcollections = await safeListCollections(userDoc.ref, report, userPath);
    subcollections.forEach((name) => bump(report.collectionPresence.userSubcollections, name));
    const postDocs = await safeGetCollection(userDoc.ref.collection("posts"), report, `${userPath}/posts`);
    if (postDocs.length) {
      const posts = postDocs.map((doc) => summarizePost(doc));
      posts.forEach((post) => addPostIssues(report, post, "users/*/posts"));
      report.userPosts.push({
        uid: userDoc.id,
        path: `${userPath}/posts`,
        count: posts.length,
        firstPosts: posts.slice(0, 5)
      });
    }
  }

  restaurants.forEach((restaurant) => {
    if (restaurant.leadId && !leadsById.has(restaurant.leadId)) {
      addIssue(report, {
        severity: "P2",
        area: "lead-conversion",
        collection: "restaurants",
        path: restaurant.path,
        fields: ["leadId"],
        cause: "Restaurant points to a lead document that was not found.",
        visibleEffect: "CRM/customer history can be incomplete.",
        fix: "Confirm whether the lead was deleted or ID is stale before repairing."
      });
    }
  });

  const details = report.restaurantDetails;
  const publicMenuDocs = details.filter((detail) => detail.publicMenu.exists);
  const publicMenuWithItems = details.filter((detail) => detail.publicMenu.itemCount > 0);
  const legacyMenuWithItems = details.filter((detail) => detail.menuItems.count > 0);
  const publicMenuMissingOrEmpty = details.filter((detail) => detail.publicMenu.itemCount === 0);
  const legacyWithoutPublic = details.filter((detail) => detail.publicMenu.itemCount === 0 && detail.menuItems.count > 0);
  const menuCountMismatch = details.filter((detail) => (
    detail.publicMenu.itemCount > 0
    && detail.menuItems.count > 0
    && detail.publicMenu.itemCount !== detail.menuItems.count
  ));
  const offersWithItems = details.filter((detail) => detail.offers.itemCount > 0);
  const focusWithoutMenu = details.filter((detail) => detail.offers.itemCount > 0 && detail.publicMenu.itemCount === 0);
  const restaurantsWithSocialPosts = details.filter((detail) => detail.socialPosts.count > 0);
  const restaurantsWithStories = details.filter((detail) => detail.stories.count > 0);
  const restaurantsWithStaff = details.filter((detail) => detail.staff.count > 0);

  report.counts = {
    topLevelCollections: report.topLevelCollections.length,
    leads: leads.length,
    restaurants: restaurants.length,
    publicRoutes: routes.length,
    users: users.length,
    socialFeed: socialFeed.length,
    userPostCollectionsWithPosts: report.userPosts.length,
    userPosts: report.userPosts.reduce((sum, entry) => sum + entry.count, 0),
    restaurantDetails: details.length,
    publicMenuDocs: publicMenuDocs.length,
    publicMenuWithItems: publicMenuWithItems.length,
    publicMenuMissingOrEmpty: publicMenuMissingOrEmpty.length,
    legacyMenuWithItems: legacyMenuWithItems.length,
    legacyMenuItemsTotal: details.reduce((sum, detail) => sum + detail.menuItems.count, 0),
    legacyMenuWithoutPublicMenu: legacyWithoutPublic.length,
    publicVsLegacyMenuCountMismatch: menuCountMismatch.length,
    offersWithItems: offersWithItems.length,
    focusWithoutMenu: focusWithoutMenu.length,
    restaurantsWithSocialPosts: restaurantsWithSocialPosts.length,
    restaurantSocialPosts: details.reduce((sum, detail) => sum + detail.socialPosts.count, 0),
    restaurantsWithStories: restaurantsWithStories.length,
    restaurantStories: details.reduce((sum, detail) => sum + detail.stories.count, 0),
    restaurantsWithStaff: restaurantsWithStaff.length,
    staffAccounts: details.reduce((sum, detail) => sum + detail.staff.count, 0),
    issues: report.issues.length,
    warnings: report.warnings.length
  };

  report.findingIndexes = {
    restaurantsMissingOwnerUid: restaurants.filter((restaurant) => !restaurant.ownerUid).map((restaurant) => restaurant.id),
    restaurantsMissingSlug: restaurants.filter((restaurant) => !restaurant.publicSlug && !restaurant.landingSlug).map((restaurant) => restaurant.id),
    restaurantsMissingStatus: restaurants.filter((restaurant) => !restaurant.status).map((restaurant) => restaurant.id),
    routesPointingToMissingRestaurants: routes.filter((route) => route.restaurantId && !restaurantsById.has(route.restaurantId)).map((route) => route.path),
    restaurantsWithSlugMissingPublicRoute: restaurants.flatMap((restaurant) => {
      const slugs = Array.from(new Set([restaurant.publicSlug, restaurant.landingSlug].filter(Boolean)));
      return slugs.filter((slug) => !routesBySlug.has(slug)).map((slug) => ({ restaurantId: restaurant.id, slug, path: `publicRoutes/${slug}` }));
    }),
    legacyMenuWithoutPublicMenu: legacyWithoutPublic.map((detail) => ({
      restaurantId: detail.restaurantId,
      menuItemsCount: detail.menuItems.count,
      publicMenuItemCount: detail.publicMenu.itemCount
    })),
    publicVsLegacyMenuCountMismatch: menuCountMismatch.map((detail) => ({
      restaurantId: detail.restaurantId,
      publicMenuItemCount: detail.publicMenu.itemCount,
      menuItemsCount: detail.menuItems.count
    })),
    focusWithoutMenu: focusWithoutMenu.map((detail) => ({
      restaurantId: detail.restaurantId,
      offersItemCount: detail.offers.itemCount,
      publicMenuItemCount: detail.publicMenu.itemCount
    })),
    publicMenuMissingTruthMetadata: details
      .filter((detail) => detail.publicMenu.exists && (!detail.publicMenu.truthSource || !detail.publicMenu.truthState))
      .map((detail) => detail.restaurantId),
    offersMissingTruthMetadata: details
      .filter((detail) => detail.offers.exists && (!detail.offers.truthSource || !detail.offers.truthState))
      .map((detail) => detail.restaurantId),
    malformedUserDocs: users
      .filter((user) => user.id.startsWith(".") || user.id.includes("=") || (user.uidField && user.uidField !== user.id))
      .map((user) => ({ path: user.path, uidField: user.uidField })),
    usersMissingStatus: users.filter((user) => !user.status).map((user) => user.path),
    businessUsersMissingRestaurantId: users
      .filter((user) => lower(user.role) === "business" && !user.restaurantId)
      .map((user) => user.path)
  };

  const outPath = path.resolve(process.cwd(), args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Wrote complete read-only data-flow audit report: ${outPath}`);
  console.log(`Complete counts: leads=${report.counts.leads}, restaurants=${report.counts.restaurants}, publicRoutes=${report.counts.publicRoutes}, users=${report.counts.users}`);
  console.log(`Menu: publicWithItems=${report.counts.publicMenuWithItems}, publicMissingOrEmpty=${report.counts.publicMenuMissingOrEmpty}, legacyWithItems=${report.counts.legacyMenuWithItems}, legacyWithoutPublic=${report.counts.legacyMenuWithoutPublicMenu}, mismatches=${report.counts.publicVsLegacyMenuCountMismatch}`);
  console.log(`Posts/stories/staff: socialFeed=${report.counts.socialFeed}, restaurantSocialPosts=${report.counts.restaurantSocialPosts}, stories=${report.counts.restaurantStories}, staff=${report.counts.staffAccounts}`);
  console.log(`Issues=${report.counts.issues}; warnings=${report.counts.warnings}`);
}

main().catch((err) => {
  console.error("Complete read-only data-flow audit failed:", sanitizeError(err));
  process.exitCode = 1;
});
