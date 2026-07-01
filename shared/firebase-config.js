// =========================================================
// MENYRA /shared/firebase-config.js
// Browser ES-Module Firebase setup (no bundler)
// Version aligned to firebasejs/11.0.0 (IMPORTANT: do not mix versions!)
// =========================================================
export const FIREBASE_WEB_SDK_VERSION = "11.0.0";

import { getApp, initializeApp } from "/shared/vendor/firebase/11.0.0/firebase-app.js";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "/shared/vendor/firebase/11.0.0/firebase-auth.js";

const productionFirebaseConfig = Object.freeze({
  apiKey: "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",
  authDomain: "menyra-c0e68.firebaseapp.com",
  projectId: "menyra-c0e68",
  storageBucket: "menyra-c0e68.firebasestorage.app",
  messagingSenderId: "528471049588",
  appId: "1:528471049588:web:c507d87c0832562a855821",
  measurementId: "G-YLFKC8726B"
});

function readLocalFirebaseEmulatorSettings() {
  try {
    const hostname = String(globalThis?.location?.hostname || "").trim().toLowerCase();
    if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) return null;
    const runtime = globalThis?.__MENYRA_FIREBASE_EMULATORS__;
    const source = runtime && typeof runtime === "object" ? runtime : {};
    const queryEnabled = new URLSearchParams(globalThis?.location?.search || "").get("firebase-emulator") === "1";
    if (source.enabled !== true && !queryEnabled) return null;
    const projectId = String(source.projectId || "mnyra-local").trim();
    if (!/^(mnyra-local|demo-|test-|local-)/.test(projectId)) return null;
    return Object.freeze({
      projectId,
      host: String(source.host || "127.0.0.1").trim() || "127.0.0.1",
      firestorePort: Math.max(1, Number(source.firestorePort || 8080) || 8080),
      authPort: Math.max(1, Number(source.authPort || 9099) || 9099),
      functionsPort: Math.max(1, Number(source.functionsPort || 5001) || 5001)
    });
  } catch {
    return null;
  }
}

const localFirebaseEmulatorSettings = readLocalFirebaseEmulatorSettings();
const firebaseConfig = Object.freeze(localFirebaseEmulatorSettings
  ? {
    apiKey: "mnyra-local-api-key",
    authDomain: `${localFirebaseEmulatorSettings.projectId}.firebaseapp.com`,
    projectId: localFirebaseEmulatorSettings.projectId,
    storageBucket: `${localFirebaseEmulatorSettings.projectId}.appspot.com`,
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:mnyra-local"
  }
  : productionFirebaseConfig);
const connectedFirestoreInstances = new WeakSet();
const connectedAuthInstances = new WeakSet();

export function isLocalFirebaseEmulatorMode() {
  return !!localFirebaseEmulatorSettings;
}

export function getLocalFirebaseEmulatorSettings() {
  return localFirebaseEmulatorSettings;
}

export function connectLocalFirebaseEmulators({ firestore = null, authInstance = null } = {}) {
  if (!localFirebaseEmulatorSettings) return false;
  if (firestore && !connectedFirestoreInstances.has(firestore)) {
    connectFirestoreEmulator(
      firestore,
      localFirebaseEmulatorSettings.host,
      localFirebaseEmulatorSettings.firestorePort
    );
    connectedFirestoreInstances.add(firestore);
  }
  if (authInstance && !connectedAuthInstances.has(authInstance)) {
    connectAuthEmulator(
      authInstance,
      `http://${localFirebaseEmulatorSettings.host}:${localFirebaseEmulatorSettings.authPort}`,
      { disableWarnings: true }
    );
    connectedAuthInstances.add(authInstance);
  }
  return true;
}

function getOrInitializeDefaultApp() {
  try {
    const existingApp = getApp();
    if (
      existingApp?.options?.projectId === firebaseConfig.projectId
      && existingApp?.options?.appId === firebaseConfig.appId
    ) {
      return existingApp;
    }
  } catch {}
  return initializeApp(firebaseConfig);
}

const app = getOrInitializeDefaultApp();

function isPublicWebsiteStartup() {
  try {
    return globalThis?.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__ === true;
  } catch {
    return false;
  }
}

let db;
try {
  const usePublicMemoryCache = isPublicWebsiteStartup();
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    localCache: usePublicMemoryCache
      ? memoryLocalCache()
      : persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
  });
  try {
    globalThis.__MENYRA_FIRESTORE_LOCAL_CACHE_KIND__ = usePublicMemoryCache ? "memory-public-website" : "persistent-multitab";
  } catch {}
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
connectLocalFirebaseEmulators({ firestore: db, authInstance: auth });

export { app, db, auth };
