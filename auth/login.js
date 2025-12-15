import { db, auth } from "../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

/* =========================================================
   KONFIG: Ziele (falls deine Pfade anders sind, nur hier ändern)
   ========================================================= */
const TARGETS = {
  platformDashboard: "../platform/dashboard.html", // Superadmin
  ownerAdmin: "../owner/admin.html",              // Owner/Admin/Manager
  staffUI: "../staff/kamarieri.html",             // Staff (falls vorhanden)
};

/* =========================================================
   DOM
   ========================================================= */
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const forgotBtn = document.getElementById("forgotBtn");
const statusEl = document.getElementById("status");
const hintBox = document.getElementById("hintBox");
const modeTag = document.getElementById("modeTag");
const modeText = document.getElementById("modeText");

/* =========================================================
   PARAMS
   ========================================================= */
const params = new URLSearchParams(location.search);
const restaurantId = params.get("r") || ""; // Owner/Staff Login-Link muss ?r=... haben

function setStatus(msg = "", kind = "") {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = "status";
  if (kind === "ok") statusEl.classList.add("ok");
  if (kind === "err") statusEl.classList.add("err");
}

function setHint(msg = "") {
  if (!hintBox) return;
  hintBox.textContent = msg;
}

function withRid(url) {
  const u = new URL(url, location.href);
  if (restaurantId) u.searchParams.set("r", restaurantId);
  return u.toString();
}

async function isSuperadmin(uid) {
  const snap = await getDoc(doc(db, "superadmins", uid));
  return snap.exists();
}

async function getStaffRole(uid, rid) {
  if (!rid) return null;
  const snap = await getDoc(doc(db, "restaurants", rid, "staff", uid));
  if (!snap.exists()) return null;
  const role = String((snap.data() || {}).role || "").toLowerCase();
  return role || null;
}

async function routeUser(user) {
  // 1) Superadmin?
  setStatus("Prüfe Zugang…");
  const superOk = await isSuperadmin(user.uid);
  if (superOk) {
    setStatus("✅ Superadmin erkannt – weiterleiten…", "ok");
    location.replace(TARGETS.platformDashboard);
    return;
  }

  // 2) Owner/Staff nur mit ?r=restaurantId (billig & eindeutig)
  if (!restaurantId) {
    setStatus("❌ Kein Platform-Zugriff.", "err");
    setHint("Owner/Staff: Bitte immer über den Restaurant-Link einloggen: auth/login.html?r=DEINE_RESTAURANT_ID");
    return;
  }

  const role = await getStaffRole(user.uid, restaurantId);
  if (!role) {
    setStatus("❌ Kein Zugriff auf dieses Restaurant.", "err");
    setHint("Du bist nicht in restaurants/{rid}/staff/{uid} eingetragen.");
    try { await signOut(auth); } catch {}
    return;
  }

  // 3) Redirect je Rolle
  if (role === "owner" || role === "admin" || role === "manager") {
    setStatus("✅ Owner/Admin erkannt – weiterleiten…", "ok");
    location.replace(withRid(TARGETS.ownerAdmin));
    return;
  }

  // Staff
  setStatus("✅ Staff erkannt – weiterleiten…", "ok");
  location.replace(withRid(TARGETS.staffUI));
}

/* =========================================================
   INIT
   ========================================================= */
setPersistence(auth, browserLocalPersistence).catch(() => {});

if (modeTag && modeText) {
  if (restaurantId) {
    modeTag.textContent = "Restaurant Login";
    modeText.textContent = "Owner/Staff Login für dieses Restaurant. Danach automatische Weiterleitung.";
  } else {
    modeTag.textContent = "Platform Login";
    modeText.textContent = "Superadmin Login. Danach automatische Weiterleitung.";
  }
}

// Auto-route wenn schon eingeloggt
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  try {
    await routeUser(user);
  } catch (e) {
    console.error(e);
    setStatus("❌ Fehler: " + (e?.message || String(e)), "err");
  }
});

// Submit
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = String(emailInput?.value || "").trim();
  const pass = String(passwordInput?.value || "");

  if (!email || !pass) {
    setStatus("Bitte E-Mail und Passwort eingeben.", "err");
    return;
  }

  loginBtn.disabled = true;
  setStatus("Login…");

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await routeUser(cred.user);
  } catch (err) {
    console.error(err);
    setStatus("❌ Login fehlgeschlagen: " + (err?.message || String(err)), "err");
  } finally {
    loginBtn.disabled = false;
  }
});

// Passwort reset
forgotBtn?.addEventListener("click", async () => {
  const email = String(emailInput?.value || "").trim();
  if (!email) {
    setStatus("Bitte zuerst E-Mail eingeben.", "err");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    setStatus("✅ Reset-Mail gesendet.", "ok");
  } catch (err) {
    console.error(err);
    setStatus("❌ Fehler: " + (err?.message || String(err)), "err");
  }
});
