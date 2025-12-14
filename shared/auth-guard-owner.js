/* =========================================================
   AUTH GUARD — OWNER/STAFF (Restaurant)
   Erwartet ?r=restaurantId
   ========================================================= */

import "./firebase-config.js";
import { getAuth, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

function getRid(){
  const p = new URLSearchParams(window.location.search);
  return (p.get("r") || "").trim();
}

function redirectToLogin(rid, msg){
  if (msg) localStorage.setItem("menyra_owner_login_msg", msg);
  const url = rid ? `./login.html?r=${encodeURIComponent(rid)}` : "./login.html";
  window.location.replace(url);
}

onAuthStateChanged(auth, async (user) => {
  const rid = getRid();
  if (!rid) return redirectToLogin("", "Fehlt: Restaurant-ID im Link (?r=...).");

  try {
    if (!user) return redirectToLogin(rid, "Bitte einloggen.");

    const staffSnap = await getDoc(doc(db, "restaurants", rid, "staff", user.uid));
    if (!staffSnap.exists()) {
      await signOut(auth);
      return redirectToLogin(rid, "Kein Zugriff für dieses Restaurant.");
    }

    // Optional Logout wiring (falls du einen Button hast)
    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn && !logoutBtn.dataset.wired) {
      logoutBtn.dataset.wired = "1";
      logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        redirectToLogin(rid, "Ausgeloggt.");
      });
    }
  } catch (e) {
    console.error(e);
    try { await signOut(auth); } catch {}
    redirectToLogin(rid, "Session Fehler – bitte neu einloggen.");
  }
});
