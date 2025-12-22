// =========================================================
// MENYRA v3 — Firebase Config (Web, modular)
// - Public config is OK to ship (apiKey etc.)
// - Secrets (Bunny keys, etc.) must NEVER be in the browser.
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

// --- Firebase public config (provided by Albert) ---
export const firebaseConfig = {
  apiKey: "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",
  authDomain: "menyra-c0e68.firebaseapp.com",
  projectId: "menyra-c0e68",
  storageBucket: "menyra-c0e68.firebasestorage.app",
  messagingSenderId: "528471049588",
  appId: "1:528471049588:web:c507d87c0832562a855821",
  measurementId: "G-YLFKC8726B",
};

// --- App singletons ---
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// --- Helpers ---
export function getQueryParam(name) {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  } catch {
    return null;
  }
}

export function nowMs() {
  return Date.now();
}
