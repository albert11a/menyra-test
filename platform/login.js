// platform/login.js — Firebase Auth Login (Platform/Superadmin) — clean & stable

import { auth, db } from "../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const emailEl = document.getElementById("emailInput");
const passEl = document.getElementById("passwordInput");
const btnEl = document.getElementById("loginBtn");
const statusEl = document.getElementById("loginStatus");

function setStatus(msg = "", type = "") {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.classList.remove("ok", "err");
  if (type) statusEl.classList.add(type);
}

function setBusy(busy) {
  if (btnEl) btnEl.disabled = !!busy;
  if (emailEl) emailEl.disabled = !!busy;
  if (passEl) passEl.disabled = !!busy;
}

function getNextUrl() {
  const p = new URLSearchParams(location.search);
  const next = p.get("next");
  const fallback = new URL("./menyra.html", location.href).toString();

  if (!next) return fallback;

  try {
    // allow relative next
    return new URL(next, location.href).toString();
  } catch {
    return fallback;
  }
}

async function isSuperadmin(uid) {
  const snap = await getDoc(doc(db, "superadmins", uid));
  return snap.exists();
}

// Already logged in → check access → redirect
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  setBusy(true);
  setStatus("Checking access…");

  try {
    const ok = await isSuperadmin(user.uid);
    if (!ok) {
      setStatus("❌ Kein Platform/Superadmin Zugriff.", "err");
      await signOut(auth);
      setBusy(false);
      return;
    }
    location.replace(getNextUrl());
  } catch (e) {
    console.error(e);
    setStatus("❌ Fehler: " + (e?.message || String(e)), "err");
    setBusy(false);
  }
});

// Normal login
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = String(emailEl?.value || "").trim();
    const pass = String(passEl?.value || "");

    if (!email || !pass) {
      setStatus("Bitte E-Mail & Passwort eingeben.", "err");
      return;
    }

    setBusy(true);
    setStatus("Signing in…");

    try {
      // Stay logged in (until logout)
      await setPersistence(auth, browserLocalPersistence);

      const cred = await signInWithEmailAndPassword(auth, email, pass);

      // Access check (1 read) so you don't land in the panel and get kicked out
      const ok = await isSuperadmin(cred.user.uid);
      if (!ok) {
        setStatus("❌ Kein Platform/Superadmin Zugriff.", "err");
        await signOut(auth);
        setBusy(false);
        return;
      }

      setStatus("✅ OK", "ok");
      location.replace(getNextUrl());
    } catch (err) {
      console.error(err);
      setStatus("❌ Login fehlgeschlagen: " + (err?.message || String(err)), "err");
      setBusy(false);
    }
  });
}
