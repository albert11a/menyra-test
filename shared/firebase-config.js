// =========================================================
// MENYRA /shared/firebase-config.js
// Browser ES-Module Firebase setup (no bundler)
// Version aligned to firebasejs/11.0.0 (IMPORTANT: do not mix versions!)
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getAuth,
  initializeAuth,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",
  authDomain: "menyra-c0e68.firebaseapp.com",
  projectId: "menyra-c0e68",
  storageBucket: "menyra-c0e68.firebasestorage.app",
  messagingSenderId: "528471049588",
  appId: "1:528471049588:web:c507d87c0832562a855821",
  measurementId: "G-YLFKC8726B"
};

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || String(fallback || "").trim();
}

function getWindowRuntime() {
  return typeof window !== "undefined" ? window : null;
}

function getRuntimeHost() {
  const runtime = getWindowRuntime();
  return asText(runtime?.location?.hostname).toLowerCase();
}

function isLocalRuntimeHost(hostname = "") {
  const safeHost = asText(hostname).toLowerCase();
  return safeHost === "127.0.0.1"
    || safeHost === "localhost"
    || safeHost === "::1"
    || safeHost === "0.0.0.0";
}

function readWindowValue(key, fallback = "") {
  const runtime = getWindowRuntime();
  if (!runtime || !key) return fallback;
  return runtime[key] ?? fallback;
}

function parseBooleanFlag(value, fallback = false) {
  if (typeof value === "boolean") return value;
  const text = asText(value).toLowerCase();
  if (!text) return fallback;
  if (["1", "true", "yes", "on"].includes(text)) return true;
  if (["0", "false", "no", "off"].includes(text)) return false;
  return fallback;
}

function parseHostPort(rawValue, fallbackHost, fallbackPort) {
  const safeValue = asText(rawValue);
  if (!safeValue) {
    return {
      host: fallbackHost,
      port: fallbackPort
    };
  }
  const [hostPart, portPart] = safeValue.split(":");
  const parsedPort = Number(portPart || fallbackPort);
  return {
    host: asText(hostPart, fallbackHost),
    port: Number.isFinite(parsedPort) ? parsedPort : fallbackPort
  };
}

function shouldUseFirebaseEmulators() {
  const explicit = readWindowValue("__MNYRA_USE_FIREBASE_EMULATORS__", "");
  if (asText(explicit)) {
    return parseBooleanFlag(explicit, false);
  }
  return isLocalRuntimeHost(getRuntimeHost());
}

function withProjectOverrides(firebaseConfig, projectId) {
  const safeProjectId = asText(projectId);
  if (!safeProjectId) return { ...firebaseConfig };
  return {
    ...firebaseConfig,
    authDomain: `${safeProjectId}.firebaseapp.com`,
    projectId: safeProjectId,
    storageBucket: `${safeProjectId}.firebasestorage.app`
  };
}

function resolveFirebaseConfig() {
  const explicitConfig = readWindowValue("__MNYRA_FIREBASE_CONFIG__", null);
  const baseConfig = explicitConfig && typeof explicitConfig === "object"
    ? { ...DEFAULT_FIREBASE_CONFIG, ...explicitConfig }
    : { ...DEFAULT_FIREBASE_CONFIG };
  if (!shouldUseFirebaseEmulators()) {
    return baseConfig;
  }
  const emulatorProjectId = asText(
    readWindowValue("__MNYRA_FIREBASE_PROJECT_ID__", "demo-mnyra-phase1")
  );
  return withProjectOverrides(baseConfig, emulatorProjectId);
}

function resolveEmulatorTargets() {
  const authTarget = parseHostPort(
    readWindowValue("__MNYRA_FIREBASE_AUTH_EMULATOR_HOST__", "127.0.0.1:9099"),
    "127.0.0.1",
    9099
  );
  const firestoreTarget = parseHostPort(
    readWindowValue("__MNYRA_FIRESTORE_EMULATOR_HOST__", "127.0.0.1:8080"),
    "127.0.0.1",
    8080
  );
  return {
    auth: authTarget,
    firestore: firestoreTarget
  };
}

const firebaseConfig = resolveFirebaseConfig();
const app = initializeApp(firebaseConfig);

let db;
try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  db = getFirestore(app);
}
let auth;
try {
  auth = initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence]
  });
} catch {
  auth = getAuth(app);
}

if (shouldUseFirebaseEmulators()) {
  const emulatorTargets = resolveEmulatorTargets();
  try {
    connectFirestoreEmulator(db, emulatorTargets.firestore.host, emulatorTargets.firestore.port);
  } catch {}
  try {
    connectAuthEmulator(
      auth,
      `http://${emulatorTargets.auth.host}:${emulatorTargets.auth.port}`,
      { disableWarnings: true }
    );
  } catch {}
}

export { app, db, auth };
