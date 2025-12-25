import { auth } from "@shared/firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { ensureUserProfile, qs } from "../_shared/social-core.js";

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const loginStatus = document.getElementById("loginStatus");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginStatus.textContent = "";
  try {
    const email = loginEmail.value.trim();
    const pass = loginPass.value;
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await ensureUserProfile(cred.user);
    const next = qs("next");
    window.location.href = next || "/apps/menyra-social/index.html";
  } catch (err) {
    console.error(err);
    loginStatus.textContent = err?.message || "Login failed.";
  }
});
