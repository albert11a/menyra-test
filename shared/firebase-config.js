// =========================================================
// MENYRA /shared/firebase-config.js
// Browser ES-Module Firebase setup (no bundler)
// Version aligned to firebasejs/11.0.0 (IMPORTANT: do not mix versions!)
// =========================================================
export const FIREBASE_WEB_SDK_VERSION = "11.0.0";

import { getApp, initializeApp } from "/shared/vendor/firebase/11.0.0/firebase-app.js";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "/shared/vendor/firebase/11.0.0/firebase-auth.js";

const firebaseConfig = Object.freeze({
  apiKey: "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",
  authDomain: "menyra-c0e68.firebaseapp.com",
  projectId: "menyra-c0e68",
  storageBucket: "menyra-c0e68.firebasestorage.app",
  messagingSenderId: "528471049588",
  appId: "1:528471049588:web:c507d87c0832562a855821",
  measurementId: "G-YLFKC8726B"
});

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

export { app, db, auth };
