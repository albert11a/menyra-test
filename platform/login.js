import { db } from "../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const auth = getAuth();

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const pass = document.getElementById("pass");
const statusEl = document.getElementById("status");
const logoutBtn = document.getElementById("logoutBtn");

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg || "";
}

function goAdmin() {
  location.replace("./menyra.html" + location.search);
}

async function isSuperadmin(uid) {
  const s = await getDoc(doc(db, "superadmins", uid));
  return s.exists();
}

// Wenn schon eingeloggt -> sofort weiter (ohne “Login kurz anzeigen”)
onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) {
      setStatus("");
      return;
    }
    setStatus("Checking access…");
    const ok = await isSuperadmin(user.uid);
    if (ok) return goAdmin();

    setStatus("❌ Kein Superadmin-Zugriff.");
    await signOut(auth);
  } catch (e) {
    console.error(e);
    setStatus("❌ Fehler: " + (e?.message || String(e)));
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
    setStatus("❌ " + (err?.message || String(err)));
  }
});

// Logout
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    setStatus("Ausgeloggt.");
  } catch (e) {
    setStatus("❌ Logout Fehler.");
  }
});
