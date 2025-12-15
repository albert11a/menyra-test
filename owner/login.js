// owner/login.js — Firebase Auth Login (Owner/Admin/Manager)
// Normaler Login: Email+Pass → Firebase Auth → 1x Access-Check → Redirect

/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */

import { db, auth } from "../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

/* =========================================================
   ABSCHNITT 1 — PARAMS
   ========================================================= */

const params = new URLSearchParams(location.search);
const restaurantId = params.get("r") || "";
const nextParam = params.get("next") || "";
const errParam = params.get("err") || "";

/* =========================================================
   ABSCHNITT 2 — DOM
   ========================================================= */

const form = document.getElementById("ownerLoginForm");
const emailEl = document.getElementById("ownerEmail");
const passEl = document.getElementById("ownerPass");
const btnEl = document.getElementById("ownerLoginBtn");
const statusEl = document.getElementById("ownerStatus");
const badgeEl = document.getElementById("ownerRestBadge");
const hintEl = document.getElementById("ownerHint");

/* =========================================================
   ABSCHNITT 3 — HELPERS
   ========================================================= */

function setStatus(msg = "", kind = "") {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = "m-status";
  if (kind === "ok") statusEl.classList.add("m-ok");
  if (kind === "err") statusEl.classList.add("m-err");
}

function setHint(msg = "") {
  if (!hintEl) return;
  hintEl.textContent = msg;
}

function getNextUrl() {
  const fallback = new URL("./admin.html", location.href);
  if (restaurantId) fallback.searchParams.set("r", restaurantId);

  if (!nextParam) return fallback.toString();

  // next darf relativ sein, aber wir härten ab:
  try {
    const u = new URL(nextParam, location.href);
    // wenn next ohne r kommt, r dazu
    if (restaurantId && !u.searchParams.get("r")) u.searchParams.set("r", restaurantId);
    return u.toString();
  } catch {
    return fallback.toString();
  }
}

async function hasOwnerAccess(uid) {
  if (!restaurantId) return false;
  const snap = await getDoc(doc(db, "restaurants", restaurantId, "staff", uid));
  if (!snap.exists()) return false;

  const role = String((snap.data() || {}).role || "").toLowerCase();
  return role === "owner" || role === "admin" || role === "manager";
}

async function hardDenyAndSignOut(message) {
  setStatus(message, "err");
  try { await signOut(auth); } catch {}
}

/* =========================================================
   ABSCHNITT 4 — BOOT / SESSION
   ========================================================= */

if (badgeEl && restaurantId) {
  badgeEl.style.display = "inline-flex";
  badgeEl.textContent = "r=" + restaurantId;
}

if (!restaurantId) {
  // Ohne restaurantId ist Owner-Login sinnlos – wir lassen aber UI sichtbar
  setStatus("❌ Dieser Link ist ungültig (fehlendes ?r=restaurantId).", "err");
  setHint("Bitte öffne den Restaurant-Admin Link aus deinem QR/Panel oder vom Superadmin.");
  if (btnEl) btnEl.disabled = true;
}

if (errParam) {
  // kleine, verständliche Fehlertexte
  const map = {
    signed_out: "Du wurdest ausgeloggt.",
    missing_r: "Restaurant-Link fehlt (?r=...).",
    no_access: "Kein Zugriff auf dieses Restaurant.",
  };
  setHint(map[errParam] || "");
}

// Bleibe eingeloggt (wie jede normale Seite)
setPersistence(auth, browserLocalPersistence).catch(() => {});

// Wenn schon eingeloggt → Access check → weiter
onAuthStateChanged(auth, async (user) => {
  if (!user || !restaurantId) return;

  setStatus("Checking access…");
  try {
    const ok = await hasOwnerAccess(user.uid);
    if (!ok) return hardDenyAndSignOut("❌ Kein Zugriff auf dieses Restaurant.");
    location.replace(getNextUrl());
  } catch (e) {
    console.error(e);
    setStatus("❌ Fehler: " + (e?.message || String(e)), "err");
  }
});

/* =========================================================
   ABSCHNITT 5 — SUBMIT
   ========================================================= */

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!restaurantId) return;

  const email = String(emailEl?.value || "").trim();
  const pass = String(passEl?.value || "");

  if (!email || !pass) {
    setStatus("Bitte E-Mail & Passwort eingeben.", "err");
    return;
  }

  setStatus("Signing in…");
  if (btnEl) btnEl.disabled = true;

  try {
    await setPersistence(auth, browserLocalPersistence);
    const cred = await signInWithEmailAndPassword(auth, email, pass);

    // 1 Read: Zugriff prüfen
    const ok = await hasOwnerAccess(cred.user.uid);
    if (!ok) {
      await hardDenyAndSignOut("❌ Kein Zugriff auf dieses Restaurant.");
      if (btnEl) btnEl.disabled = false;
      return;
    }

    setStatus("✅ OK", "ok");
    location.replace(getNextUrl());
  } catch (err) {
    console.error(err);
    setStatus("❌ Login fehlgeschlagen: " + (err?.message || String(err)), "err");
    if (btnEl) btnEl.disabled = false;
  }
});
