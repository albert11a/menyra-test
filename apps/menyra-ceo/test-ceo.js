import { bootPlatformAdmin } from "../menyra-restaurants/_shared/admin/platform-admin-core.js";
import { auth } from "../../shared/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

bootPlatformAdmin({ role: "ceo", roleLabel: "CEO Platform" });

const showLoginFallback = () => {
  const overlay = document.getElementById("loginModalOverlay");
  if (!overlay || auth.currentUser) return;
  document.body.classList.add("m-login");
  document.documentElement.classList.add("m-login");
  overlay.classList.remove("is-hidden");
};

let loginFallbackTimer = setTimeout(showLoginFallback, 800);
onAuthStateChanged(auth, (user) => {
  if (loginFallbackTimer) {
    clearTimeout(loginFallbackTimer);
    loginFallbackTimer = null;
  }
  if (!user) {
    showLoginFallback();
  }
});
