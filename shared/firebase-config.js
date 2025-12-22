  // =========================================================
  // MENYRA /shared/firebase-config.js
  // Browser ES-Module Firebase setup (no bundler)
  // =========================================================
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

  const firebaseConfig = {
  "apiKey": "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",
  "authDomain": "menyra-c0e68.firebaseapp.com",
  "projectId": "menyra-c0e68",
  "storageBucket": "menyra-c0e68.firebasestorage.app",
  "messagingSenderId": "528471049588",
  "appId": "1:528471049588:web:c507d87c0832562a855821",
  "measurementId": "G-YLFKC8726B"
};

  export const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app);

  // Analytics: avoid errors on unsupported environments
  export let analytics = null;
  try {
    if (typeof window !== "undefined") {
      isSupported().then((ok) => {
        if (ok) analytics = getAnalytics(app);
      }).catch(() => {});
    }
  } catch (_) {}
