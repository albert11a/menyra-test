#!/usr/bin/env node
"use strict";

/*
  SAFE APPLY helper for reviewed Mnyra publicRoutes candidates only.

  Example:
    node functions/scripts/apply-mnyra-public-routes-safe.cjs --apply-safe-routes --dryrun-report C:/mnyra-secrets/mnyra-public-routes-alignment-dryrun.json --out C:/mnyra-secrets/mnyra-public-routes-safe-apply-report.json

  Safety:
    - Requires explicit --apply-safe-routes.
    - Refuses plain --apply and other broad write-like flags.
    - APPLY=1 is only accepted together with --apply-safe-routes.
    - Reads the reviewed dry-run report and applies only routeAlignment.safeRouteCandidate.
    - Skips needsReview/doNotTouch entries, including duplicate slug review cases.
    - Re-reads publicRoutes/{slug} before every write.
    - Uses merge writes only.
    - Writes only publicRoutes route metadata fields.
*/

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const DEFAULT_DRYRUN_REPORT = "C:/mnyra-secrets/mnyra-public-routes-alignment-dryrun.json";
const DEFAULT_OUT = "C:/mnyra-secrets/mnyra-public-routes-safe-apply-report.json";

const REFUSED_FLAGS = new Set([
  "--apply",
  "--write",
  "--delete",
  "--migrate",
  "--migration",
  "--deploy",
  "--set",
  "--update",
  "--force",
  "--all",
  "--owner",
  "--ownerUid",
  "--restaurantId",
  "--users",
  "--restaurants",
  "--menuItems",
  "--public-menu",
  "--public-offers",
  "--orders",
  "--qr",
  "--waiter"
]);

const ALLOWED_FLAGS = new Set([
  "--apply-safe-routes",
  "--dryrun-report",
  "--report",
  "--out"
]);

const ROUTABLE_SAFE_STATUSES = new Set(["active", "preview", "lead"]);

function text(value = "") {
  return String(value || "").trim();
}

function lower(value = "") {
  return text(value).toLowerCase();
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

function parseArgs(argv = []) {
  const args = {
    applySafeRoutes: false,
    dryrunReport: DEFAULT_DRYRUN_REPORT,
    out: DEFAULT_OUT,
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

    if (key === "--apply-safe-routes") args.applySafeRoutes = true;
    else if (key === "--dryrun-report" || key === "--report") args.dryrunReport = text(readValue()) || args.dryrunReport;
    else if (key === "--out") args.out = text(readValue()) || args.out;
    else if (key.startsWith("--") && !ALLOWED_FLAGS.has(key)) args.refused.push(key);
  }

  return args;
}

function refuseIfUnsafe(args) {
  if (args.refused.length) {
    console.error(`Refusing to run: unsupported/dangerous flag(s): ${args.refused.join(", ")}`);
    process.exit(1);
  }
  if (!args.applySafeRoutes) {
    console.error("Refusing to run: Firestore writes require explicit --apply-safe-routes.");
    process.exit(1);
  }
  if (process.env.APPLY === "1" && !args.applySafeRoutes) {
    console.error("Refusing to run: APPLY=1 requires explicit --apply-safe-routes.");
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

function readJsonFile(filePath = "") {
  const resolved = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

function publicRouteSlugFromPath(pathLabel = "") {
  const raw = text(pathLabel);
  if (!raw.startsWith("publicRoutes/")) return "";
  const slug = raw.slice("publicRoutes/".length);
  if (!slug || slug.includes("/")) return "";
  return normalizeSlug(slug);
}

function routeKey(entry = {}) {
  return publicRouteSlugFromPath(entry.path || "") || normalizeSlug(entry.canonicalSlug || entry.slug || "");
}

function collectBlockedRoutes(dryrun = {}) {
  const blocked = new Set();
  const add = (entry = {}) => {
    const slug = routeKey(entry);
    if (slug) blocked.add(slug);
  };
  [
    ...(Array.isArray(dryrun?.routeAlignment?.needsReview) ? dryrun.routeAlignment.needsReview : []),
    ...(Array.isArray(dryrun?.routeAlignment?.doNotTouch) ? dryrun.routeAlignment.doNotTouch : []),
    ...(Array.isArray(dryrun?.review?.publicRoutesNeedsReview) ? dryrun.review.publicRoutesNeedsReview : []),
    ...(Array.isArray(dryrun?.conflicts?.duplicateSlugs) ? dryrun.conflicts.duplicateSlugs : []),
    ...(Array.isArray(dryrun?.conflicts?.publicRouteTargetConflicts) ? dryrun.conflicts.publicRouteTargetConflicts : [])
  ].forEach(add);
  return blocked;
}

function normalizeCandidate(entry = {}, blockedRoutes) {
  const pathSlug = publicRouteSlugFromPath(entry.path || "");
  const canonicalSlug = normalizeSlug(entry.canonicalSlug || pathSlug);
  const slug = pathSlug || canonicalSlug;
  const restaurantId = text(entry.restaurantId);
  const status = lower(entry.status);
  const restaurantStatus = lower(entry.restaurantStatus);
  const safeCategory = text(entry.category) === "safeRouteCandidate";
  const safeFlag = entry.safeToApplyLater === true;

  if (!slug || !canonicalSlug || slug !== canonicalSlug) {
    return { valid: false, slug, reason: "invalid or mismatching slug" };
  }
  if (blockedRoutes.has(slug)) {
    return { valid: false, slug, reason: "slug is blocked by needsReview/doNotTouch" };
  }
  if (!restaurantId) {
    return { valid: false, slug, reason: "missing restaurantId" };
  }
  if (!ROUTABLE_SAFE_STATUSES.has(status)) {
    return { valid: false, slug, reason: "unsupported route status for safe apply" };
  }
  if (!safeCategory || !safeFlag) {
    return { valid: false, slug, reason: "candidate is not marked safeRouteCandidate" };
  }

  return {
    valid: true,
    path: `publicRoutes/${slug}`,
    slug,
    restaurantId,
    canonicalSlug,
    status,
    restaurantStatus
  };
}

function hasField(data = {}, field = "") {
  return data[field] !== undefined && data[field] !== null && text(data[field]) !== "";
}

function buildPatchForExisting(existingData = {}, candidate = {}, serverTimestamp) {
  const patch = {};
  if (!hasField(existingData, "restaurantId")) patch.restaurantId = candidate.restaurantId;
  if (!hasField(existingData, "canonicalSlug")) patch.canonicalSlug = candidate.canonicalSlug;
  if (!hasField(existingData, "status")) patch.status = candidate.status;
  if (!hasField(existingData, "restaurantStatus")) patch.restaurantStatus = candidate.restaurantStatus;
  if (!hasField(existingData, "updatedAt")) patch.updatedAt = serverTimestamp;
  return patch;
}

function buildPatchForCreate(candidate = {}, serverTimestamp) {
  return {
    restaurantId: candidate.restaurantId,
    canonicalSlug: candidate.canonicalSlug,
    status: candidate.status,
    restaurantStatus: candidate.restaurantStatus,
    updatedAt: serverTimestamp
  };
}

function createApplyReport(args, dryrun = {}) {
  const needsReview = Array.isArray(dryrun?.routeAlignment?.needsReview) ? dryrun.routeAlignment.needsReview : [];
  const doNotTouch = Array.isArray(dryrun?.routeAlignment?.doNotTouch) ? dryrun.routeAlignment.doNotTouch : [];
  return {
    generatedAt: new Date().toISOString(),
    dryrunReport: path.resolve(process.cwd(), args.dryrunReport),
    applySupported: true,
    applyFlag: "--apply-safe-routes",
    writesAttempted: 0,
    deletesAttempted: 0,
    touchedCollections: ["publicRoutes"],
    untouched: [
      "users",
      "restaurants",
      "restaurants/*/public/menu",
      "restaurants/*/public/offers",
      "restaurants/*/menuItems",
      "restaurants/*/orders",
      "restaurants/*/staff",
      "ownerUid",
      "QR",
      "waiter",
      "cart"
    ],
    projectId: readDefaultProjectId() || "",
    dryrunSummary: {
      safeRouteCandidate: Array.isArray(dryrun?.routeAlignment?.safeRouteCandidate)
        ? dryrun.routeAlignment.safeRouteCandidate.length
        : 0,
      needsReview: needsReview.length,
      doNotTouch: doNotTouch.length
    },
    reviewSkipped: needsReview.map((entry) => ({
      path: text(entry.path),
      slug: routeKey(entry),
      reason: text(entry.reason),
      action: "not applied"
    })),
    doNotTouchSkipped: doNotTouch.map((entry) => ({
      path: text(entry.path),
      slug: routeKey(entry),
      reason: text(entry.reason),
      action: "not applied"
    })),
    created: [],
    updated: [],
    unchanged: [],
    skipped: [],
    conflicts: [],
    counts: {
      candidatesRead: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0,
      conflicts: 0,
      reviewSkipped: needsReview.length,
      doNotTouchSkipped: doNotTouch.length,
      writesCommitted: 0
    },
    confirmations: {
      ilGustoSkipped: needsReview.some((entry) => routeKey(entry) === "il-gusto")
        || doNotTouch.some((entry) => routeKey(entry) === "il-gusto"),
      onlyPublicRoutesWrites: true,
      mergeWritesOnly: true,
      noDeletes: true,
      noRulesDeploy: true
    }
  };
}

async function applyCandidate(db, candidate = {}, report) {
  const ref = db.collection("publicRoutes").doc(candidate.slug);
  const snap = await ref.get();
  const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

  if (!snap.exists) {
    const patch = buildPatchForCreate(candidate, serverTimestamp);
    report.writesAttempted += 1;
    await ref.set(patch, { merge: true });
    report.created.push({
      path: candidate.path,
      restaurantId: candidate.restaurantId,
      status: candidate.status,
      restaurantStatus: candidate.restaurantStatus,
      fieldsWritten: Object.keys(patch)
    });
    report.counts.created += 1;
    report.counts.writesCommitted += 1;
    return;
  }

  const data = snap.data() || {};
  const existingRestaurantId = text(data.restaurantId || data.canonicalRestaurantId || "");
  if (existingRestaurantId && existingRestaurantId !== candidate.restaurantId) {
    report.conflicts.push({
      path: candidate.path,
      existingRestaurantId,
      proposedRestaurantId: candidate.restaurantId,
      action: "skipped"
    });
    report.counts.conflicts += 1;
    return;
  }

  const patch = buildPatchForExisting(data, candidate, serverTimestamp);
  if (!Object.keys(patch).length) {
    report.unchanged.push({
      path: candidate.path,
      restaurantId: candidate.restaurantId,
      reason: "existing publicRoutes doc already has route metadata"
    });
    report.counts.unchanged += 1;
    return;
  }

  report.writesAttempted += 1;
  await ref.set(patch, { merge: true });
  report.updated.push({
    path: candidate.path,
    restaurantId: candidate.restaurantId,
    fieldsWritten: Object.keys(patch)
  });
  report.counts.updated += 1;
  report.counts.writesCommitted += 1;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  refuseIfUnsafe(args);
  const dryrun = readJsonFile(args.dryrunReport);
  const candidates = Array.isArray(dryrun?.routeAlignment?.safeRouteCandidate)
    ? dryrun.routeAlignment.safeRouteCandidate
    : [];
  const blockedRoutes = collectBlockedRoutes(dryrun);
  const report = createApplyReport(args, dryrun);
  report.counts.candidatesRead = candidates.length;

  initializeAdmin();
  const db = admin.firestore();

  for (const entry of candidates) {
    const candidate = normalizeCandidate(entry, blockedRoutes);
    if (!candidate.valid) {
      report.skipped.push({
        path: text(entry?.path),
        slug: candidate.slug || routeKey(entry),
        restaurantId: text(entry?.restaurantId),
        reason: candidate.reason,
        action: "skipped"
      });
      report.counts.skipped += 1;
      continue;
    }

    try {
      await applyCandidate(db, candidate, report);
    } catch (err) {
      report.skipped.push({
        path: candidate.path,
        slug: candidate.slug,
        restaurantId: candidate.restaurantId,
        reason: "write failed",
        error: sanitizeError(err),
        action: "skipped"
      });
      report.counts.skipped += 1;
    }
  }

  const outPath = path.resolve(process.cwd(), args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Wrote publicRoutes safe apply report: ${outPath}`);
  console.log("PublicRoutes safe apply summary:");
  console.log(`- candidates read: ${report.counts.candidatesRead}`);
  console.log(`- created: ${report.counts.created}`);
  console.log(`- updated: ${report.counts.updated}`);
  console.log(`- unchanged: ${report.counts.unchanged}`);
  console.log(`- skipped: ${report.counts.skipped}`);
  console.log(`- conflicts: ${report.counts.conflicts}`);
  console.log(`- review skipped: ${report.counts.reviewSkipped}`);
  console.log(`- doNotTouch skipped: ${report.counts.doNotTouchSkipped}`);
  console.log(`- writes committed: ${report.counts.writesCommitted}`);
  console.log(`- il-gusto skipped: ${report.confirmations.ilGustoSkipped ? "yes" : "no"}`);
}

main().catch((err) => {
  console.error("Safe publicRoutes apply failed:", sanitizeError(err));
  process.exitCode = 1;
});
