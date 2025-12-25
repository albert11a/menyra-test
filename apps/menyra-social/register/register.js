import { auth, db } from "@shared/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const registerForm = document.getElementById("registerForm");
const regName = document.getElementById("regName");
const regCity = document.getElementById("regCity");
const regEmail = document.getElementById("regEmail");
const regPass = document.getElementById("regPass");
const regPass2 = document.getElementById("regPass2");
const registerStatus = document.getElementById("registerStatus");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerStatus.textContent = "";

  const name = regName.value.trim() || "User";
  const city = regCity.value.trim() || "Prishtina";
  const email = regEmail.value.trim();
  const pass = regPass.value;
  const pass2 = regPass2.value;

  if (!email || !pass) {
    registerStatus.textContent = "Email and password required.";
    return;
  }
  if (pass !== pass2) {
    registerStatus.textContent = "Passwords do not match.";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });

    await setDoc(
      doc(db, "users", cred.user.uid),
      {
        displayName: name,
        city,
        bio: "",
        score: 0,
        followersCount: 0,
        followingCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    window.location.href = "/apps/menyra-social/profile/index.html";
  } catch (err) {
    console.error(err);
    registerStatus.textContent = err?.message || "Register failed.";
  }
});
