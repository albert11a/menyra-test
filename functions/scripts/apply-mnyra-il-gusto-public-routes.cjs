#!/usr/bin/env node
"use strict";

/*
  Narrow safe apply for the reviewed il-gusto duplicate route only.

  Allowed write:
    - publicRoutes/il-gusto for the duplicate restaurant with product/menu data
    - publicRoutes/il-gusto-2 plus restaurant slug fields only if the second duplicate has data

  Safety:
    - Requires --apply-il-gusto-routes.
    - Refuses plain --apply and write-like flags.
    - Re-reads publicRoutes docs before writing.
    - Does not hard-delete, archive, or touch owner/user/menu/order/QR/waiter data.
*/

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const DUPLICATE_IDS = Object.freeze([
  "9oBS9F8rFcSMZMs6Bq2v",
  "bHZ1j8slkC00tWhLczGF"
]);
const MAIN_SLUG = "il-gusto";
const SECONDARY_SLUG = "il-gusto-2";
const DEFAULT_OUT = "C:\\mnyra-secrets\\mnyra-public-routes-after-il-gusto-fix.json";
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
    applySafe: false,
    out: DEFAULT_OUT,
    refused: []
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = String(argv[index] || "");
    const [key, inlineValue] = arg.includes("=") ? arg.split(/=(.*)/s, 2) : [arg, ""];
    if (key === "--apply-il-gusto-routes") {
      args.applySafe = true;
      continue;
    }
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
    if (key === "--out") args.out = text(readValue()) || DEFAULT_OUT;
    else if (key.startsWith("--")) args.refused.push(key);
  }
  return args;
}

function refuseIfUnsafe(args) {
  if (!args.applySafe) {
    console.error("Refusing to run: pass --apply-il-gusto-routes for this narrow reviewed apply.");
    process.exit(1);
  }
  if (process.env.APPLY === "1" && !args.applySafe) {
    console.error("Refusing to run: APPLY=1 without --apply-il-gusto-routes.");
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

function maskEmail(value = "") {
  const email = text(value);
  if (!email) return "";
  const at = email.indexOf("@");
  if (at < 0) return email.length <= 2 ? "***" : `${email.slice(0, 2)}***`;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${local ? `${local[0]}***${local.slice(-1)}` : "***"}@${domain}`;
}

function maskUid(value = "") {
  const raw = text(value);
  if (!raw) return "";
  if (raw.length <= 8) return `${raw.slice(0, 2)}***`;
  return `${raw.slice(0, 4)}...${raw.slice(-4)}`;
}

function serializeTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value === "string") return value;
  if (value.seconds) return new Date(value.seconds * 1000).toISOString();
  return String(value);
}

function normalizeSlug(value = "") {
  let slug = lower(value);
  if (!slug) return "";
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

function routeStatusForRestaurantStatus(status = "") {
  const key = lower(status);
  if (key === "active" || key === "kunde" || key === "customer") return "active";
  if (key === "preview" || key === "demo" || key === "testphase") return "preview";
  if (key === "lead" || key === "prospect" || key === "registered" || key === "contacted" || key === "pending") return "lead";
  return "";
}

async function count(ref) {
  const snap = await ref.count().get();
  return Number(snap.data().count || 0) || 0;
}

async function publicItems(ref, docId) {
  const snap = await ref.collection("public").doc(docId).get();
  if (!snap.exists) return { exists: false, itemCount: 0 };
  const data = snap.data() || {};
  return { exists: true, itemCount: Array.isArray(data.items) ? data.items.length : 0 };
}

async function loadRestaurant(db, restaurantId) {
  const ref = db.collection("restaurants").doc(restaurantId);
  const snap = await ref.get();
  const data = snap.exists ? snap.data() || {} : {};
  const publicMenu = await publicItems(ref, "menu");
  const publicOffers = await publicItems(ref, "offers");
  const summary = {
    id: restaurantId,
    path: `restaurants/${restaurantId}`,
    exists: snap.exists,
    name: text(data.name),
    restaurantName: text(data.restaurantName),
    status: text(data.status),
    publicSlug: text(data.publicSlug),
    landingSlug: text(data.landingSlug),
    publicMenu,
    menuItemsCount: await count(ref.collection("menuItems")),
    publicOffers,
    socialPostsCount: await count(ref.collection("socialPosts")),
    ordersCount: await count(ref.collection("orders")),
    staffCount: await count(ref.collection("staff")),
    ownerUid: maskUid(data.ownerUid),
    ownerEmail: maskEmail(data.ownerEmail),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt)
  };
  summary.productItemCount = summary.publicMenu.itemCount + summary.menuItemsCount;
  summary.totalChildDataCount = summary.productItemCount
    + summary.publicOffers.itemCount
    + summary.socialPostsCount
    + summary.ordersCount
    + summary.staffCount;
  return { ref, data, summary };
}

function isDuplicateEmptyLead(summary = {}) {
  return summary.exists
    && lower(summary.status) === "lead"
    && summary.productItemCount === 0
    && summary.totalChildDataCount === 0;
}

function buildRoutePayload(slug, restaurant) {
  const routeStatus = routeStatusForRestaurantStatus(restaurant.summary.status);
  if (!routeStatus) return null;
  return {
    restaurantId: restaurant.summary.id,
    canonicalSlug: slug,
    status: routeStatus,
    restaurantStatus: restaurant.summary.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

function missingRouteMetadataPatch(existing = {}, payload = {}) {
  const patch = {};
  if (!text(existing.restaurantId)) patch.restaurantId = payload.restaurantId;
  if (!text(existing.canonicalSlug)) patch.canonicalSlug = payload.canonicalSlug;
  if (!text(existing.status)) patch.status = payload.status;
  if (!text(existing.restaurantStatus)) patch.restaurantStatus = payload.restaurantStatus;
  if (Object.keys(patch).length) patch.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  return patch;
}

async function createOrMergeRoute(db, slug, restaurant, report) {
  const routeRef = db.collection("publicRoutes").doc(slug);
  const routeSnap = await routeRef.get();
  const existing = routeSnap.exists ? routeSnap.data() || {} : null;
  const existingRestaurantId = text(existing?.restaurantId || existing?.canonicalRestaurantId || "");
  if (existingRestaurantId && existingRestaurantId !== restaurant.summary.id) {
    report.skipped.push({
      path: `publicRoutes/${slug}`,
      restaurantId: restaurant.summary.id,
      reason: "existing publicRoutes doc points to another restaurant",
      existingRestaurantId
    });
    return { action: "conflict" };
  }
  const payload = buildRoutePayload(slug, restaurant);
  if (!payload) {
    report.skipped.push({
      path: `publicRoutes/${slug}`,
      restaurantId: restaurant.summary.id,
      reason: "restaurant status is not routable"
    });
    return { action: "skipped" };
  }
  if (routeSnap.exists) {
    const patch = missingRouteMetadataPatch(existing, payload);
    if (!Object.keys(patch).length) {
      report.skipped.push({
        path: `publicRoutes/${slug}`,
        restaurantId: restaurant.summary.id,
        reason: "route already exists with metadata"
      });
      return { action: "unchanged" };
    }
    await routeRef.set(patch, { merge: true });
    report.updated.push({ path: `publicRoutes/${slug}`, restaurantId: restaurant.summary.id, fields: Object.keys(patch) });
    return { action: "updated" };
  }
  await routeRef.set({
    ...payload,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  report.created.push({ path: `publicRoutes/${slug}`, restaurantId: restaurant.summary.id });
  return { action: "created" };
}

async function loadRoute(db, slug) {
  const snap = await db.collection("publicRoutes").doc(slug).get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  return {
    path: `publicRoutes/${slug}`,
    restaurantId: text(data.restaurantId || data.canonicalRestaurantId),
    canonicalSlug: text(data.canonicalSlug),
    status: text(data.status),
    restaurantStatus: text(data.restaurantStatus),
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt)
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  refuseIfUnsafe(args);
  initializeAdmin();
  const db = admin.firestore();
  const restaurants = await Promise.all(DUPLICATE_IDS.map((id) => loadRestaurant(db, id)));
  const existingRoutes = {
    [MAIN_SLUG]: await loadRoute(db, MAIN_SLUG),
    [SECONDARY_SLUG]: await loadRoute(db, SECONDARY_SLUG)
  };
  const sorted = restaurants.slice().sort((a, b) => {
    const countDiff = b.summary.productItemCount - a.summary.productItemCount;
    if (countDiff) return countDiff;
    return a.summary.id.localeCompare(b.summary.id);
  });
  const primary = sorted[0];
  const secondary = sorted[1];
  const report = {
    generatedAt: new Date().toISOString(),
    scope: {
      duplicateSlug: MAIN_SLUG,
      duplicateRestaurantIds: DUPLICATE_IDS
    },
    decision: {
      primaryRestaurantId: primary.summary.id,
      primaryReason: "highest public/menu + menuItems product item count",
      secondaryRestaurantId: secondary.summary.id,
      secondaryClassification: isDuplicateEmptyLead(secondary.summary)
        ? "duplicate-empty-lead"
        : "numbered-route-candidate"
    },
    before: {
      routes: existingRoutes,
      restaurants: restaurants.map((entry) => entry.summary)
    },
    created: [],
    updated: [],
    skipped: [],
    restaurantUpdates: [],
    review: [],
    forbiddenWritesPerformed: {
      ownerUid: false,
      users: false,
      restaurantsExceptSecondarySlugIfNeeded: false,
      menuItems: false,
      publicMenu: false,
      publicOffers: false,
      ordersQrWaiterCart: false,
      hardDelete: false
    }
  };

  await createOrMergeRoute(db, MAIN_SLUG, primary, report);

  if (isDuplicateEmptyLead(secondary.summary)) {
    report.review.push({
      restaurantId: secondary.summary.id,
      path: secondary.summary.path,
      classification: "duplicate-empty-lead",
      proposedSlugIfKeptRoutable: SECONDARY_SLUG,
      action: "left untouched for manual review",
      safeOptions: [
        "leave unroutable as duplicate lead",
        "soft-disable/archive only if product has an approved archived/deleted status path",
        "make routable later as il-gusto-2 if this lead should remain public"
      ]
    });
  } else {
    const routeResult = await createOrMergeRoute(db, SECONDARY_SLUG, secondary, report);
    if (routeResult.action !== "conflict" && routeResult.action !== "skipped") {
      const patch = {};
      if (normalizeSlug(secondary.summary.publicSlug) !== SECONDARY_SLUG) patch.publicSlug = SECONDARY_SLUG;
      if (normalizeSlug(secondary.summary.landingSlug) !== SECONDARY_SLUG) patch.landingSlug = SECONDARY_SLUG;
      if (Object.keys(patch).length) {
        patch.canonicalPublicPath = `/${encodeURIComponent(SECONDARY_SLUG)}`;
        patch.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        await secondary.ref.set(patch, { merge: true });
        report.restaurantUpdates.push({
          path: secondary.summary.path,
          fields: Object.keys(patch)
        });
        report.forbiddenWritesPerformed.restaurantsExceptSecondarySlugIfNeeded = true;
      }
    }
  }

  report.after = {
    publicRoutesTotal: await count(db.collection("publicRoutes")),
    routes: {
      [MAIN_SLUG]: await loadRoute(db, MAIN_SLUG),
      [SECONDARY_SLUG]: await loadRoute(db, SECONDARY_SLUG)
    },
    remainingNeedsReview: report.review
  };
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`il-gusto route apply complete: created=${report.created.length}; updated=${report.updated.length}; skipped=${report.skipped.length}; review=${report.review.length}`);
  console.log(`Wrote report: ${args.out}`);
}

main().catch((error) => {
  console.error(error && error.message ? error.message : error);
  process.exit(1);
});
