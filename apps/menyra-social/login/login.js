import { auth } from "@shared/firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { ensureUserProfile, qs } from "../_shared/social-core.js";

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const loginStatus = document.getElementById("loginStatus");

const ADMIN_LOGINS = {
  admin: {
    email: "admin@menyra.local",
    password: "admin",
    profile: {
      displayName: "Menyra HQ",
      city: "Prishtina",
      role: "business",
      avatarUrl: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    }
  },
  admin1: {
    email: "admin1@menyra.local",
    password: "admin1",
    profile: {
      displayName: "Max Mustermann",
      city: "Prishtina",
      role: "user",
      avatarUrl: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
    }
  }
};

function resolveAdminLogin(email, pass) {
  const key = String(email || "").trim().toLowerCase();
  if (!key || pass !== key) return null;
  return ADMIN_LOGINS[key] || null;
}

async function signInOrCreate(email, pass, profile) {
  try {
    return await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    try {
      const created = await createUserWithEmailAndPassword(auth, email, pass);
      if (profile?.displayName) {
        await updateProfile(created.user, { displayName: profile.displayName });
      }
      return created;
    } catch {
      throw err;
    }
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginStatus.textContent = "";
  try {
    const email = loginEmail.value.trim();
    const pass = loginPass.value;
    const adminLogin = resolveAdminLogin(email, pass);
    const cred = adminLogin
      ? await signInOrCreate(adminLogin.email, adminLogin.password, adminLogin.profile)
      : await signInWithEmailAndPassword(auth, email, pass);
    await ensureUserProfile(cred.user, adminLogin?.profile);
    const next = qs("next");
    window.location.href = next || "/apps/menyra-social/index.html";
  } catch (err) {
    console.error(err);
    loginStatus.textContent = err?.message || "Login failed.";
  }
});
