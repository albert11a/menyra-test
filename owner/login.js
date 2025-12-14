// owner/login.js — Auth Login + Owner Role Check (NO redirect loop)

import { db } from "../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const auth = getAuth();
setPersistence(auth, browserLocalPersistence).catch(() => {});

const form = document.getElementById("loginForm");
const emailEl = document.getElementById("emailInput");
const passEl = document.getElementById("passwordInput");
const statusEl = document.getElementById("loginStatus");

const params = new URLSearchParams(location.search);
const restaurantId = params.get("r") || "";

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function adminUrl() {
  const url = new URL("./admin.html", location.href);
  url.searchParams.set("r", restaurantId);
  return url.toString();
}

async function hasOwnerAccess(uid) {
  if (!restaurantId) return false;
  const snap = await getDoc(doc(db, "restaurants", restaurantId, "staff", uid));
  if (!snap.exists()) return false;
  const role = String((snap.data() || {}).role || "").toLowerCase();
  return role === "owner" || role === "admin" || role === "manager";
}

// Auto-check: wenn schon eingeloggt → prüfen → ggf. weiter
onAuthStateChanged(auth, async (user) => {
  if (!restaurantId) {
    setStatus("❌ Fehlender Parameter: ?r=restaurantId");
    return; // WICHTIG: kein redirect!
  }
  if (!user) return;

  setStatus("Checking access…");
  try {
    const ok = await hasOwnerAccess(user.uid);
    if (!ok) {
      setStatus("❌ Kein Owner-Zugriff für dieses Restaurant.");
      await signOut(auth);
      return; // WICHTIG: kein redirect → kein loop
    }
    location.replace(adminUrl());
  } catch (err) {
    console.error(err);
    setStatus("❌ Fehler (Rules/Permission?): " + (err?.message || String(err)));
    try { await signOut(auth); } catch {}
  }
});

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!restaurantId) {
      setStatus("❌ Fehlender Parameter: ?r=restaurantId");
      return;
    }

    const email = String(emailEl?.value || "").trim();
    const pass = String(passEl?.value || "");

    if (!email || !pass) {
      setStatus("Bitte Email & Passwort eingeben.");
      return;
    }

    setStatus("Signing in…");

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);

      const ok = await hasOwnerAccess(cred.user.uid);
      if (!ok) {
        setStatus("❌ Kein Owner-Zugriff für dieses Restaurant.");
        await signOut(auth);
        return;
      }

      location.replace(adminUrl());
    } catch (err) {
      console.error(err);
      setStatus("❌ Login fehlgeschlagen: " + (err?.message || String(err)));
    }
  });
}
