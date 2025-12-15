// owner/login.js — Email/Pass + Restaurant-ID Gate (no users/{uid}, no global queries)
import { db, auth } from "../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const ridEl = document.getElementById("rid");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("pass");
const btnEl = document.getElementById("loginBtn");
const statusEl = document.getElementById("status");

function setStatus(msg, kind="") {
  statusEl.textContent = msg || "";
  statusEl.className = "status " + (kind || "");
}

function adminUrl(rid) {
  const url = new URL("./admin.html", location.href);
  url.searchParams.set("r", rid);
  return url.toString();
}

function roleAllows(role) {
  const r = String(role || "").toLowerCase();
  return r === "owner" || r === "admin" || r === "manager";
}

setPersistence(auth, browserLocalPersistence).catch(() => {});

// prefill rid from URL
try {
  const p = new URLSearchParams(location.search);
  const rid = p.get("r") || "";
  if (rid && ridEl) ridEl.value = rid;
  const err = p.get("err");
  if (err) setStatus("Hinweis: " + err, "err");
} catch {}

btnEl?.addEventListener("click", async () => {
  const rid = String(ridEl?.value || "").trim();
  const email = String(emailEl?.value || "").trim();
  const pass = String(passEl?.value || "");

  if (!rid) return setStatus("Bitte Restaurant-ID eingeben.", "err");
  if (!email || !pass) return setStatus("Bitte Email & Passwort eingeben.", "err");

  btnEl.disabled = true;
  setStatus("Signing in…");

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);

    setStatus("Checking access…");
    const sRef = doc(db, "restaurants", rid, "staff", cred.user.uid);
    const sSnap = await getDoc(sRef);

    if (!sSnap.exists()) {
      setStatus("❌ Kein Zugriff: UID ist nicht im staff dieses Lokals.", "err");
      try { await signOut(auth); } catch {}
      return;
    }

    const role = (sSnap.data() || {}).role || "";
    if (!roleAllows(role)) {
      setStatus("❌ Rolle nicht erlaubt (nur owner/admin/manager).", "err");
      try { await signOut(auth); } catch {}
      return;
    }

    try { localStorage.setItem("menyra_owner_last_rid", rid); } catch {}
    setStatus("✅ OK…", "ok");
    location.replace(adminUrl(rid));
  } catch (e) {
    console.error(e);
    setStatus("❌ Login fehlgeschlagen: " + (e?.message || String(e)), "err");
  } finally {
    btnEl.disabled = false;
  }
});
