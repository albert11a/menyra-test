// login.js (Owner) — normaler Login + Redirect
// Wichtig: Diese Zeile initialisiert Firebase App (auch wenn wir db hier nicht nutzen!)
import "../shared/firebase-config.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const auth = getAuth();

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const pass = document.getElementById("pass");
const statusEl = document.getElementById("status");
const logoutBtn = document.getElementById("logoutBtn");

function setStatus(msg, kind) {
  if (!statusEl) return;
  statusEl.textContent = msg || "";
  statusEl.className = "status-text login-status";
  if (kind === "ok") statusEl.classList.add("status-ok");
  if (kind === "err") statusEl.classList.add("status-err");
}

function nextUrlOrDefault() {
  const p = new URLSearchParams(location.search);
  const next = p.get("next");
  return next || "./admin.html";
}

function goAdmin() {
  location.replace(nextUrlOrDefault());
}

(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (e) {
    console.error(e);
    setStatus("❌ Persistence Fehler: " + (e?.message || String(e)), "err");
  }

  // Wenn schon eingeloggt -> direkt weiter
  onAuthStateChanged(auth, (user) => {
    if (user) return goAdmin();
    setStatus("");
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      setStatus("Login…");
      const mail = (email?.value || "").trim();
      const pw = pass?.value || "";
      await signInWithEmailAndPassword(auth, mail, pw);
      // Redirect passiert über onAuthStateChanged
    } catch (err) {
      console.error(err);
      setStatus("❌ " + (err?.message || String(err)), "err");
    }
  });

  logoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      setStatus("Ausgeloggt.", "ok");
    } catch (e) {
      console.error(e);
      setStatus("❌ Logout Fehler: " + (e?.message || String(e)), "err");
    }
  });
})();
