#!/usr/bin/env node
"use strict";

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const DRY_RUN = !process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const MAX_DOCS = LIMIT_ARG ? Math.max(1, Number(LIMIT_ARG.split("=")[1]) || 0) : 0;
const RESTAURANT_SLUG_FIELDS = [
  "publicSlug",
  "landingSlug",
  "businessSlug",
  "routeSlug",
  "slug",
  "handle"
];
const RESTAURANT_ID_FIELDS = [
  "restaurantId",
  "landingRestaurantId",
  "canonicalRestaurantId",
  "businessId",
  "id"
];

function safeText(value = "") {
  return String(value || "").trim();
}

function normalizeSlug(value = "") {
  let slug = safeText(value).toLowerCase();
  if (!slug || slug.includes(".")) return "";
  try {
    if (typeof slug.normalize === "function") {
      slug = slug.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }
  } catch {}
  slug = slug
    .replace(/^@+/, "")
    .replace(/&/g, " and ")
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug;
}

function resolveRestaurantId(docSnap, data = {}) {
  for (const field of RESTAURANT_ID_FIELDS) {
    const candidate = safeText(data[field] || "");
    if (candidate) return candidate;
  }
  return safeText(docSnap.id);
}

function resolveExistingSlug(data = {}) {
  for (const field of RESTAURANT_SLUG_FIELDS) {
    const slug = normalizeSlug(data[field] || "");
    if (slug) return { slug, sourceField: field };
  }
  return { slug: "", sourceField: "" };
}

function resolveGeneratedSlug(docSnap, data = {}) {
  const existing = resolveExistingSlug(data);
  if (existing.slug) return existing;
  const nameSlug = normalizeSlug(
    data.name
    || data.restaurantName
    || data.businessName
    || data.displayName
    || ""
  );
  if (nameSlug) return { slug: nameSlug, sourceField: "generated:name" };
  const idSlug = normalizeSlug(resolveRestaurantId(docSnap, data));
  return { slug: idSlug, sourceField: "generated:id" };
}

function isPublicRestaurant(data = {}) {
  if (data.public === false) return false;
  if (data.isPublic === false) return false;
  if (data.hidden === true) return false;
  if (data.archived === true) return false;
  const status = safeText(data.status || data.publicStatus || "").toLowerCase();
  if (["inactive", "disabled", "archived", "draft", "private"].includes(status)) return false;
  return true;
}

async function main() {
  const restaurantsSnap = await db.collection("restaurants").get();
  const slugOwners = new Map();
  const rows = [];
  let processed = 0;

  for (const docSnap of restaurantsSnap.docs) {
    if (MAX_DOCS && processed >= MAX_DOCS) break;
    processed += 1;
    const data = docSnap.data() || {};
    const restaurantId = resolveRestaurantId(docSnap, data);
    const { slug, sourceField } = resolveGeneratedSlug(docSnap, data);
    const publicRestaurant = isPublicRestaurant(data);
    const problems = [];
    if (!restaurantId) problems.push("missing restaurantId");
    if (!slug) problems.push("missing slug");
    if (!publicRestaurant) problems.push("not public/active");
    if (slug) {
      const owner = slugOwners.get(slug);
      if (owner && owner !== restaurantId) problems.push(`duplicate slug owned by ${owner}`);
      else slugOwners.set(slug, restaurantId);
    }
    rows.push({ docSnap, data, restaurantId, slug, sourceField, publicRestaurant, problems });
  }

  let checked = 0;
  let writable = 0;
  let skipped = 0;
  let duplicate = 0;
  let written = 0;

  console.log(`Mode: ${DRY_RUN ? "DRY-RUN" : "WRITE"}`);
  console.log(`Restaurants scanned: ${rows.length}`);

  for (const row of rows) {
    checked += 1;
    const { docSnap, data, restaurantId, slug, sourceField, publicRestaurant, problems } = row;
    const hasDuplicate = problems.some((problem) => problem.startsWith("duplicate slug"));
    if (hasDuplicate) duplicate += 1;
    if (!restaurantId || !slug || !publicRestaurant || hasDuplicate) {
      skipped += 1;
      console.log(`[skip] ${docSnap.id} slug=${slug || "-"} id=${restaurantId || "-"} problems=${problems.join(", ") || "none"}`);
      continue;
    }

    writable += 1;
    const routePayload = {
      slug,
      canonicalSlug: slug,
      restaurantId,
      landingRestaurantId: data.landingRestaurantId || restaurantId,
      status: "active",
      type: "business",
      source: "restaurants-backfill",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const restaurantPatch = {
      publicSlug: slug,
      canonicalSlug: data.canonicalSlug || slug,
      restaurantId,
      landingRestaurantId: data.landingRestaurantId || restaurantId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log(`[ok] ${docSnap.id} -> /${slug} (${sourceField}) restaurantId=${restaurantId}`);
    if (!DRY_RUN) {
      const batch = db.batch();
      batch.set(db.collection("publicRoutes").doc(slug), routePayload, { merge: true });
      batch.set(docSnap.ref, restaurantPatch, { merge: true });
      await batch.commit();
      written += 1;
    }
  }

  console.log("--- summary ---");
  console.log(`checked=${checked}`);
  console.log(`writable=${writable}`);
  console.log(`skipped=${skipped}`);
  console.log(`duplicate=${duplicate}`);
  console.log(`written=${written}`);
  if (DRY_RUN) {
    console.log("No writes performed. Run with --write to apply publicSlug/publicRoutes backfill.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
