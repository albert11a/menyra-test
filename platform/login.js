import "../shared/firebase-config.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const ridEl = document.getElementById("rid");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("pass");
const btn = document.getElementById("loginBtn");
const statusEl = document.getElementById("status");

// optional: wenn du owner/login.html?r=XYZ öffnest
const params = new URLSearchParams(window.location.search);
const ridFromUrl = params.get("r");
if (ridFromUrl) ridEl.value = ridFromUrl;

btn.addEventListener("click", async () => {
  statusEl.textContent = "Login...";
  btn.disabled = true;

  try {
    const rid = (ridEl.value || "").trim();
    const email = (emailEl.value || "").trim();
    const pass = (passEl.value || "").trim();

    if (!rid) throw new Error("Restaurant ID fehlt.");
    if (!email || !pass) throw new Error("Email & Passwort eingeben.");

    const cred = await signInWithEmailAndPassword(auth, email, pass);

    // Zugriff prüfen: restaurants/{rid}/staff/{uid} muss existieren
    const uid = cred.user.uid;
    const staffSnap = await getDoc(doc(db, "restaurants", rid, "staff", uid));
    if (!staffSnap.exists()) throw new Error("Kein Zugriff für dieses Restaurant.");

    statusEl.textContent = "OK ✅";
    window.location.href = `./admin.html?r=${encodeURIComponent(rid)}`;
  } catch (e) {
    console.error(e);
    statusEl.textContent = "Fehler: " + (e?.message || String(e));
    btn.disabled = false;
  }
});
