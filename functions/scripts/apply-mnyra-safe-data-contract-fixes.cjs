#!/usr/bin/env node
"use strict";

/*
  SAFE APPLY helper for the reviewed Mnyra Firebase data-contract dry-run.

  Example:
    GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json node functions/scripts/apply-mnyra-safe-data-contract-fixes.cjs --apply-safe --dryrun-report C:/mnyra-secrets/mnyra-dryrun-report.json --out C:/mnyra-secrets/mnyra-safe-apply-report.json

  Safety:
    - Requires explicit --apply-safe.
    - Refuses APPLY=1, --apply, and write-like/dangerous flags.
    - Applies only reviewed deterministic fields from the dry-run report:
      public/menu truth metadata, public/offers truth metadata, users/{uid}.uid
      when missing, and users/{uid}.status when missing.
    - Uses merge writes only.
    - Never creates publicRoutes, missing public/menu docs, missing public/offers
      docs, menuItems, ownerUid, restaurantId, orders, QR, or waiter data.
    - Does not print service account JSON, private keys, or raw emails.
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
  "--update",
  "--force",
  "--create-public-routes",
  "--owner",
  "--ownerUid",
  "--restaurantId",
  "--copy-menu-items",
  "--delete-menu-items"
]);

const ALLOWED_FLAGS = new Set([
  "--apply-safe",
  "--dryrun-report",
  "--out"
]);

const SAFE_USER_STATUS_VALUES = new Set(["active", "pending"]);

function text(value = "") {
  return String(value || "").trim();
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

function parseArgs(argv = []) {
  const args = {
    applySafe: false,
    dryrunReport: "C:/mnyra-secrets/mnyra-dryrun-report.json",
    out: "C:/mnyra-secrets/mnyra-safe-apply-report.json",
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

    if (key === "--apply-safe") args.applySafe = true;
    else if (key === "--dryrun-report") args.dryrunReport = text(readValue()) || args.dryrunReport;
    else if (key === "--out") args.out = text(readValue()) || args.out;
    else if (key.startsWith("--") && !ALLOWED_FLAGS.has(key)) args.refused.push(key);
  }

  return args;
}

function refuseIfUnsafe(args) {
  if (process.env.APPLY === "1") {
    console.error("Refusing to run: APPLY=1 is not accepted. Use explicit --apply-safe only.");
    process.exit(1);
  }
  if (args.refused.length) {
    console.error(`Refusing to run: unsupported/dangerous flag(s): ${args.refused.join(", ")}`);
    process.exit(1);
  }
  if (!args.applySafe) {
    console.error("Refusing to run: this tool writes Firestore and requires explicit --apply-safe.");
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

function safeReadJson(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  return {
    path: resolved,
    data: JSON.parse(fs.readFileSync(resolved, "utf8"))
  };
}

function safeWriteJson(filePath, payload) {
  const resolved = path.resolve(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return resolved;
}

function createReport(args, dryrunPath, dryrun) {
  return {
    generatedAt: new Date().toISOString(),
    applySafe: true,
    sourceDryRunReport: dryrunPath,
    projectId: readDefaultProjectId() || "",
    sourceSummary: dryrun?.summary || {},
    writesAttempted: 0,
    writesSucceeded: 0,
    deletesAttempted: 0,
    forbiddenGroupsApplied: {
      publicRoutes: 0,
      ownerUid: 0,
      restaurantId: 0,
      menuItems: 0,
      orders: 0,
      qr: 0,
      waiter: 0
    },
    counts: {
      publicMenuMetadataUpdated: 0,
      publicOffersMetadataUpdated: 0,
      usersUidFixed: 0,
      usersStatusFixed: 0,
      publicRoutesSkipped: Array.isArray(dryrun?.proposals?.publicRoutes) ? dryrun.proposals.publicRoutes.length : 0,
      ownerConflictsSkipped: countOwnerConflicts(dryrun),
      menuItemsComparisonsSkipped: Array.isArray(dryrun?.review?.menuItemsPresent) ? dryrun.review.menuItemsPresent.length : 0
    },
    writes: {
      publicMenuMetadata: [],
      publicOffersMetadata: [],
      usersUid: [],
      usersStatus: []
    },
    skipped: {
      publicMenuMetadata: [],
      publicOffersMetadata: [],
      usersUid: [],
      usersStatus: [],
      unsupportedUserPatchFields: [],
      publicRoutes: [],
      ownerRelations: [],
      menuItems: []
    },
    errors: [],
    outputRequested: args.out
  };
}

function countOwnerConflicts(dryrun) {
  const conflicts = dryrun?.conflicts || {};
  return [
    "ownerUidMissingUser",
    "ownerMultiplePossibleUsers",
    "ownerUidMultipleRestaurants",
    "ownerUserRestaurantMismatch"
  ].reduce((total, key) => total + (Array.isArray(conflicts[key]) ? conflicts[key].length : 0), 0);
}

function expectedTruthState(items = []) {
  return Array.isArray(items) && items.length > 0 ? "seeded" : "knownEmpty";
}

function isMissingValue(value) {
  return value === undefined || value === null || text(value) === "";
}

function isMalformedDocId(id = "") {
  const safe = text(id);
  return !safe || safe.startsWith(".") || safe.includes("=") || safe.includes("&") || safe.includes("?") || safe.includes("/");
}

function parseRestaurantPublicPath(pathLabel = "", expectedDocId = "") {
  const match = text(pathLabel).match(/^restaurants\/([^/]+)\/public\/([^/]+)$/);
  if (!match) return null;
  if (expectedDocId && match[2] !== expectedDocId) return null;
  return { restaurantId: match[1], publicDocId: match[2] };
}

function parseUserPath(pathLabel = "") {
  const match = text(pathLabel).match(/^users\/([^/]+)$/);
  if (!match) return null;
  return { uid: match[1] };
}

function patchKeys(patch = {}) {
  return Object.keys(patch).sort();
}

async function mergeWrite(ref, patch, logEntry, report, bucketName, counterName) {
  report.writesAttempted += 1;
  await ref.set(patch, { merge: true });
  report.writesSucceeded += 1;
  report.counts[counterName] += 1;
  report.writes[bucketName].push(logEntry);
  console.log(`WRITE ${logEntry.path} fields=${patchKeys(patch).join(",")}`);
}

async function applyMenuMetadata(db, dryrun, report) {
  const proposals = Array.isArray(dryrun?.proposals?.publicMenuMetadata) ? dryrun.proposals.publicMenuMetadata : [];
  for (const proposal of proposals) {
    const parsed = parseRestaurantPublicPath(proposal.path, "menu");
    if (!parsed || parsed.restaurantId !== proposal.restaurantId) {
      report.skipped.publicMenuMetadata.push({ path: text(proposal.path), reason: "invalid public/menu proposal path" });
      continue;
    }

    const ref = db.collection("restaurants").doc(parsed.restaurantId).collection("public").doc("menu");
    const snap = await ref.get();
    if (!snap.exists) {
      report.skipped.publicMenuMetadata.push({ path: proposal.path, reason: "doc missing; no automatic creation" });
      continue;
    }

    const data = snap.data() || {};
    if (!Array.isArray(data.items)) {
      report.skipped.publicMenuMetadata.push({ path: proposal.path, reason: "items is not an array" });
      continue;
    }

    const expectedState = expectedTruthState(data.items);
    const patch = {};
    if (isMissingValue(data.menuTruthSource)) patch.menuTruthSource = "public-menu";
    else if (text(data.menuTruthSource) !== "public-menu") {
      report.skipped.publicMenuMetadata.push({ path: proposal.path, reason: "menuTruthSource already has conflicting value" });
      continue;
    }

    if (isMissingValue(data.menuTruthState)) patch.menuTruthState = expectedState;
    else if (text(data.menuTruthState) !== expectedState) {
      report.skipped.publicMenuMetadata.push({ path: proposal.path, reason: "menuTruthState already has conflicting value" });
      continue;
    }

    if (!Object.keys(patch).length) {
      report.skipped.publicMenuMetadata.push({ path: proposal.path, reason: "metadata already present" });
      continue;
    }

    await mergeWrite(
      ref,
      patch,
      { path: proposal.path, restaurantId: parsed.restaurantId, itemCount: data.items.length, patch },
      report,
      "publicMenuMetadata",
      "publicMenuMetadataUpdated"
    );
  }
}

async function applyOffersMetadata(db, dryrun, report) {
  const proposals = Array.isArray(dryrun?.proposals?.publicOffersMetadata) ? dryrun.proposals.publicOffersMetadata : [];
  for (const proposal of proposals) {
    const parsed = parseRestaurantPublicPath(proposal.path, "offers");
    if (!parsed || parsed.restaurantId !== proposal.restaurantId) {
      report.skipped.publicOffersMetadata.push({ path: text(proposal.path), reason: "invalid public/offers proposal path" });
      continue;
    }

    const ref = db.collection("restaurants").doc(parsed.restaurantId).collection("public").doc("offers");
    const snap = await ref.get();
    if (!snap.exists) {
      report.skipped.publicOffersMetadata.push({ path: proposal.path, reason: "doc missing; no automatic creation" });
      continue;
    }

    const data = snap.data() || {};
    if (!Array.isArray(data.items)) {
      report.skipped.publicOffersMetadata.push({ path: proposal.path, reason: "items is not an array" });
      continue;
    }

    const expectedState = expectedTruthState(data.items);
    const patch = {};
    if (isMissingValue(data.truthSource)) patch.truthSource = "public-menu";
    else if (text(data.truthSource) !== "public-menu") {
      report.skipped.publicOffersMetadata.push({ path: proposal.path, reason: "truthSource already has conflicting value" });
      continue;
    }

    if (isMissingValue(data.truthState)) patch.truthState = expectedState;
    else if (text(data.truthState) !== expectedState) {
      report.skipped.publicOffersMetadata.push({ path: proposal.path, reason: "truthState already has conflicting value" });
      continue;
    }

    if (!Object.keys(patch).length) {
      report.skipped.publicOffersMetadata.push({ path: proposal.path, reason: "metadata already present" });
      continue;
    }

    await mergeWrite(
      ref,
      patch,
      { path: proposal.path, restaurantId: parsed.restaurantId, itemCount: data.items.length, patch },
      report,
      "publicOffersMetadata",
      "publicOffersMetadataUpdated"
    );
  }
}

async function applyUserRepairs(db, dryrun, report) {
  const proposals = Array.isArray(dryrun?.proposals?.users) ? dryrun.proposals.users : [];
  for (const proposal of proposals) {
    const parsed = parseUserPath(proposal.path);
    if (!parsed || isMalformedDocId(parsed.uid)) {
      report.skipped.usersUid.push({ path: text(proposal.path), reason: "invalid or malformed user doc id" });
      report.skipped.usersStatus.push({ path: text(proposal.path), reason: "invalid or malformed user doc id" });
      continue;
    }

    const proposedPatch = proposal.patch || {};
    const unsupported = patchKeys(proposedPatch).filter((key) => !["uid", "status", "updatedAt"].includes(key));
    if (unsupported.length) {
      report.skipped.unsupportedUserPatchFields.push({
        path: proposal.path,
        fields: unsupported,
        reason: "unsupported user patch field"
      });
      continue;
    }

    const ref = db.collection("users").doc(parsed.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      report.skipped.usersUid.push({ path: proposal.path, reason: "user doc missing" });
      report.skipped.usersStatus.push({ path: proposal.path, reason: "user doc missing" });
      continue;
    }

    const data = snap.data() || {};
    const patch = {};

    if (Object.prototype.hasOwnProperty.call(proposedPatch, "uid")) {
      if (isMissingValue(data.uid)) {
        if (text(proposedPatch.uid) === parsed.uid) {
          patch.uid = parsed.uid;
        } else {
          report.skipped.usersUid.push({ path: proposal.path, reason: "proposed uid does not equal doc id" });
        }
      } else if (text(data.uid) !== parsed.uid) {
        report.skipped.usersUid.push({ path: proposal.path, reason: "uid already mismatches doc id; manual review only" });
      } else {
        report.skipped.usersUid.push({ path: proposal.path, reason: "uid already present" });
      }
    }

    if (Object.prototype.hasOwnProperty.call(proposedPatch, "status")) {
      const status = text(proposedPatch.status);
      if (!SAFE_USER_STATUS_VALUES.has(status)) {
        report.skipped.usersStatus.push({ path: proposal.path, reason: "proposed status is not in safe allowlist" });
      } else if (isMissingValue(data.status)) {
        patch.status = status;
      } else {
        report.skipped.usersStatus.push({ path: proposal.path, reason: "status already present" });
      }
    }

    if (!Object.keys(patch).length) continue;

    const fieldsWritten = patchKeys(patch);
    report.writesAttempted += 1;
    await ref.set(patch, { merge: true });
    report.writesSucceeded += 1;
    console.log(`WRITE ${proposal.path} fields=${fieldsWritten.join(",")}`);

    if (Object.prototype.hasOwnProperty.call(patch, "uid")) {
      report.counts.usersUidFixed += 1;
      report.writes.usersUid.push({
        path: proposal.path,
        uid: parsed.uid,
        patch: { uid: patch.uid },
        reasons: ["uid missing"],
        writeFields: fieldsWritten
      });
    }

    if (Object.prototype.hasOwnProperty.call(patch, "status")) {
      report.counts.usersStatusFixed += 1;
      report.writes.usersStatus.push({
        path: proposal.path,
        uid: parsed.uid,
        patch: { status: patch.status },
        reasons: ["status missing"],
        writeFields: fieldsWritten
      });
    }
  }
}

function copyReviewSkips(dryrun, report) {
  const routeReview = Array.isArray(dryrun?.review?.publicRoutesNeedsReview) ? dryrun.review.publicRoutesNeedsReview : [];
  const routeProposals = Array.isArray(dryrun?.proposals?.publicRoutes) ? dryrun.proposals.publicRoutes : [];
  report.skipped.publicRoutes.push(...routeProposals.map((entry) => ({
    path: entry.path,
    restaurantId: entry.restaurantId,
    reason: "publicRoutes creation is forbidden in this apply"
  })));
  report.skipped.publicRoutes.push(...routeReview.map((entry) => ({
    path: entry.path,
    restaurantId: entry.restaurantId,
    reason: "publicRoutes are review-only in this apply"
  })));

  const conflicts = dryrun?.conflicts || {};
  for (const key of ["ownerUidMissingUser", "ownerMultiplePossibleUsers", "ownerUidMultipleRestaurants", "ownerUserRestaurantMismatch"]) {
    const entries = Array.isArray(conflicts[key]) ? conflicts[key] : [];
    report.skipped.ownerRelations.push(...entries.map((entry) => ({
      type: key,
      path: entry.path || entry.ownerUserPath || "",
      restaurantId: entry.restaurantId || "",
      ownerUid: entry.ownerUid || "",
      reason: "owner relation changes are manual-only"
    })));
  }

  const menuItemsPresent = Array.isArray(dryrun?.review?.menuItemsPresent) ? dryrun.review.menuItemsPresent : [];
  const menuItemMismatches = Array.isArray(dryrun?.conflicts?.menuItemsCountMismatches)
    ? dryrun.conflicts.menuItemsCountMismatches
    : [];
  report.skipped.menuItems.push(...menuItemsPresent.map((entry) => ({
    restaurantId: entry.restaurantId,
    menuItemsCount: entry.menuItemsCount,
    publicMenuCount: entry.publicMenuCount,
    reason: "menuItems copy/delete is forbidden in this apply"
  })));
  report.skipped.menuItems.push(...menuItemMismatches.map((entry) => ({
    restaurantId: entry.restaurantId,
    menuItemsCount: entry.menuItemsCount,
    publicMenuCount: entry.publicMenuCount,
    reason: "menuItems/public menu mismatch is manual-only"
  })));
}

function assertDryRunReportShape(dryrun) {
  if (!dryrun || dryrun.dryRunOnly !== true || dryrun.applySupported !== false) {
    throw new Error("Input report is not the expected dry-run-only report.");
  }
  if (Number(dryrun.writesAttempted || 0) !== 0 || Number(dryrun.deletesAttempted || 0) !== 0) {
    throw new Error("Input dry-run report is unsafe: writes/deletes were attempted.");
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  refuseIfUnsafe(args);

  const { path: dryrunPath, data: dryrun } = safeReadJson(args.dryrunReport);
  assertDryRunReportShape(dryrun);

  initializeAdmin();
  const db = admin.firestore();
  const report = createReport(args, dryrunPath, dryrun);

  try {
    copyReviewSkips(dryrun, report);
    await applyMenuMetadata(db, dryrun, report);
    await applyOffersMetadata(db, dryrun, report);
    await applyUserRepairs(db, dryrun, report);
  } catch (err) {
    report.errors.push(sanitizeError(err));
    const outPath = safeWriteJson(args.out, report);
    console.error(`Safe apply failed after report write: ${outPath}`);
    throw err;
  }

  const outPath = safeWriteJson(args.out, report);
  console.log(`Wrote safe apply report: ${outPath}`);
  console.log("Safe apply summary:");
  console.log(`- public/menu docs updated: ${report.counts.publicMenuMetadataUpdated}`);
  console.log(`- public/offers docs updated: ${report.counts.publicOffersMetadataUpdated}`);
  console.log(`- users uid fixed: ${report.counts.usersUidFixed}`);
  console.log(`- users status fixed: ${report.counts.usersStatusFixed}`);
  console.log(`- publicRoutes applied: ${report.forbiddenGroupsApplied.publicRoutes}`);
  console.log(`- ownerUid/restaurantId/menuItems applied: ${report.forbiddenGroupsApplied.ownerUid}/${report.forbiddenGroupsApplied.restaurantId}/${report.forbiddenGroupsApplied.menuItems}`);
}

main().catch((err) => {
  console.error("Safe apply failed:", sanitizeError(err));
  process.exit(1);
});
