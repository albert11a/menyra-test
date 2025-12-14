// owner/login.js — SIMPLE LOGIN (no ?r needed) + brute restaurant resolve

import { db, auth } from "../shared/firebase-config.js";
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const emailEl = document.getElementById("email");
const passEl  = document.getElementById("pass");
const btnEl   = document.getElementById("loginBtn");
const statusEl= document.getElementById("status");

const params = new URLSearchParams(location.search);

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function adminUrl(rid) {
  const url = new URL("./admin.html", location.href);
  url.searchParams.set("r", rid);
  return url.toString();
}

async function hasOwnerAccess(rid, uid) {
  const snap = await getDoc(doc(db, "restaurants", rid, "staff", uid));
  if (!snap.exists()) return false;
  const role = String((snap.data() || {}).role || "").toLowerCase();
  return role === "owner" || role === "admin" || role === "manager";
}

// ✅ SIMPLE: r from URL -> localStorage -> brute scan
async function resolveRestaurantId(uid) {
  const ridFromUrl = params.get("r");
  if (ridFromUrl) return ridFromUrl;

  const ridFromLocal = localStorage.getItem("menyra_owner_last_rid") || "";
  if (ridFromLocal) {
    const ok = await hasOwnerAccess(ridFromLocal, uid).catch(() => false);
    if (ok) return ridFromLocal;
  }

  // brute scan: restaurants/* -> check staff/{uid}
  const snap = await getDocs(collection(db, "restaurants"));
  for (const r of snap.docs) {
    const rid = r.id;
    const ok = await hasOwnerAccess(rid, uid).catch(() => false);
    if (ok) return rid;
  }
  return "";
}

setPersistence(auth, browserLocalPersistence).catch(() => {});

btnEl?.addEventListener("click", async () => {
  const email = String(emailEl?.value || "").trim();
  const pass  = String(passEl?.value || "");
  if (!email || !pass) return setStatus("Bitte Email & Passwort eingeben.");

  try {
    btnEl.disabled = true;
    setStatus("Signing in…");

    const cred = await signInWithEmailAndPassword(auth, email, pass);

    setStatus("Finding restaurant…");
    const rid = await resolveRestaurantId(cred.user.uid);

    if (!rid) {
      setStatus("❌ Kein Restaurant für diesen User gefunden (staff-doc nicht lesbar oder fehlt).");
      try { await signOut(auth); } catch {}
      return;
    }

    localStorage.setItem("menyra_owner_last_rid", rid);

    setStatus("✅ OK…");
    location.replace(adminUrl(rid));
  } catch (e) {
    console.error(e);
    setStatus("❌ " + (e?.message || String(e)));
  } finally {
    btnEl.disabled = false;
  }
});
