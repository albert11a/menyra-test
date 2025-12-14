/* =========================================================
   AUTH GUARD — PLATFORM (Superadmin)
   ========================================================= */

import "./firebase-config.js";
import { getAuth, onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

function redirectToLogin(msg){
  if (msg) localStorage.setItem("menyra_platform_login_msg", msg);
  window.location.replace("./login.html");
}

onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) return redirectToLogin("Bitte einloggen.");

    const sa = await getDoc(doc(db, "superadmins", user.uid));
    if (!sa.exists()) {
      await signOut(auth);
      return redirectToLogin("Kein Zugriff: Kein Superadmin.");
    }

    // Logout button wiring (falls vorhanden)
    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn && !logoutBtn.dataset.wired) {
      logoutBtn.dataset.wired = "1";
      logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        redirectToLogin("Ausgeloggt.");
      });
    }
  } catch (e) {
    console.error(e);
    try { await signOut(auth); } catch {}
    redirectToLogin("Session Fehler – bitte neu einloggen.");
  }
});
