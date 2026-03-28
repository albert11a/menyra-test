"use strict";

const path = require("path");

const DEFAULT_EMULATOR_PROJECT_ID = "demo-mnyra-phase1";
const DEFAULT_ISOLATED_PROJECT_ID = "testmnyramatrix";
const DEFAULT_FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
const DEFAULT_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
const BLOCKED_PROJECT_IDS = new Set(["menyra-c0e68"]);

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || String(fallback || "").trim();
}

function resolvePhase1TestWorldRuntime() {
  const rawTarget = asText(
    process.env.MNYRA_TESTWORLD_TARGET,
    process.env.FIRESTORE_EMULATOR_HOST ? "emulator" : "emulator"
  ).toLowerCase();
  if (!["emulator", "isolated"].includes(rawTarget)) {
    throw new Error(`Unsupported MNYRA_TESTWORLD_TARGET "${rawTarget}". Use "emulator" or "isolated".`);
  }

  const projectId = asText(
    process.env.MNYRA_TESTWORLD_FIREBASE_PROJECT_ID,
    rawTarget === "isolated" ? DEFAULT_ISOLATED_PROJECT_ID : DEFAULT_EMULATOR_PROJECT_ID
  );
  if (!projectId) {
    throw new Error("Missing Firebase project id for phase1 test world.");
  }
  if (BLOCKED_PROJECT_IDS.has(projectId)) {
    throw new Error(`Refusing to operate on blocked Firebase project "${projectId}".`);
  }

  if (rawTarget === "emulator") {
    process.env.FIRESTORE_EMULATOR_HOST = asText(
      process.env.FIRESTORE_EMULATOR_HOST,
      DEFAULT_FIRESTORE_EMULATOR_HOST
    );
    process.env.FIREBASE_AUTH_EMULATOR_HOST = asText(
      process.env.FIREBASE_AUTH_EMULATOR_HOST,
      DEFAULT_AUTH_EMULATOR_HOST
    );
  }

  return {
    target: rawTarget,
    projectId,
    useEmulators: rawTarget === "emulator",
    firestoreEmulatorHost: asText(process.env.FIRESTORE_EMULATOR_HOST),
    authEmulatorHost: asText(process.env.FIREBASE_AUTH_EMULATOR_HOST)
  };
}

function loadFirebaseAdmin() {
  try {
    return require(path.resolve(__dirname, "../../../functions/node_modules/firebase-admin"));
  } catch (error) {
    const detail = error && error.message ? ` ${error.message}` : "";
    throw new Error(
      `firebase-admin is required for phase1 testworld scripts. Install dependencies in /functions first.${detail}`
    );
  }
}

function initializePhase1TestWorldAdmin() {
  const runtime = resolvePhase1TestWorldRuntime();
  const admin = loadFirebaseAdmin();
  const appName = `phase1-testworld-${runtime.target}-${runtime.projectId}`;
  const existing = admin.apps.find((app) => app && app.name === appName);
  const app = existing || admin.initializeApp({ projectId: runtime.projectId }, appName);
  return {
    admin,
    app,
    db: app.firestore(),
    auth: app.auth(),
    runtime
  };
}

module.exports = {
  DEFAULT_EMULATOR_PROJECT_ID,
  DEFAULT_ISOLATED_PROJECT_ID,
  DEFAULT_FIRESTORE_EMULATOR_HOST,
  DEFAULT_AUTH_EMULATOR_HOST,
  resolvePhase1TestWorldRuntime,
  initializePhase1TestWorldAdmin
};
