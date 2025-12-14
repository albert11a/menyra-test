import { db } from "../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
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
  if (next) return next;
  // Standard: owner/admin.html
  return "./admin.html" + location.search.replace(/^\?/, "?");
}

function goAdmin() {
  const url = nextUrlOrDefault();
  location.replace(url);
}

// Optionaler Access-Check: wenn ?r=... vorhanden ist, probieren wir restaurants/{r} zu lesen.
// Wenn Firestore Rules den Zugriff verweigern -> kein Zugriff.
async function canAccessRestaurantFromUrl() {
  const p = new URLSearchParams(location.search);
  const rid = p.get("r");
  if (!rid) return true; // kein Restaurant gewählt -> ok, Admin öffnet dann per Input
  try {
    const snap = await getDoc(doc(db, "restaurants", rid));
    return snap.exists(); // exists + readable => Zugriff ok
  } catch {
    return false;
  }
}

await setPersistence(auth, browserLocalPersistence);

// Wenn schon eingeloggt: sofort weiter (kein Login-Flicker)
onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) {
      setStatus("");
      return;
    }

    setStatus("Checking access…");

    const ok = await canAccessRestaurantFromUrl();
    if (ok) return goAdmin();

    setStatus("❌ Kein Zugriff auf dieses Restaurant.", "err");
    await signOut(auth);
  } catch (e) {
    console.error(e);
    setStatus("❌ Fehler: " + (e?.message || String(e)), "err");
  }
});

// Login
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    setStatus("Login…");
    await signInWithEmailAndPassword(auth, (email.value || "").trim(), pass.value || "");
    // Redirect passiert über onAuthStateChanged
  } catch (err) {
    console.error(err);
    setStatus("❌ " + (err?.message || String(err)), "err");
  }
});

// Logout
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    setStatus("Ausgeloggt.", "ok");
  } catch (e) {
    setStatus("❌ Logout Fehler.", "err");
  }
});
