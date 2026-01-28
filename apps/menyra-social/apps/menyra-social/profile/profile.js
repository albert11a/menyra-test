import { db, auth } from "@shared/firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  attachAuthHeader,
  ensureUserProfile,
  initials
} from "../_shared/social-core.js";

const profileEmpty = document.getElementById("profileEmpty");
const profileContent = document.getElementById("profileContent");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const profileScore = document.getElementById("profileScore");
const profileFollowers = document.getElementById("profileFollowers");
const profileFollowing = document.getElementById("profileFollowing");

const pfName = document.getElementById("pfName");
const pfCity = document.getElementById("pfCity");
const pfAvatar = document.getElementById("pfAvatar");
const pfBio = document.getElementById("pfBio");
const pfStatus = document.getElementById("pfStatus");
const profileForm = document.getElementById("profileForm");
const logoutBtn = document.getElementById("logoutBtn");

attachAuthHeader({ linkId: "authLink", userId: "authUser" });

let currentUser = null;

function renderAvatar(name, avatarUrl) {
  if (avatarUrl) {
    profileAvatar.style.backgroundImage = `url(${avatarUrl})`;
    profileAvatar.style.backgroundSize = "cover";
    profileAvatar.style.backgroundPosition = "center";
    profileAvatar.textContent = "";
    return;
  }
  profileAvatar.style.backgroundImage = "";
  profileAvatar.textContent = initials(name);
}

function renderProfile(data) {
  const name = data?.displayName || "User";
  profileName.textContent = name;
  profileBio.textContent = data?.bio || "";
  profileScore.textContent = data?.score ?? 0;
  profileFollowers.textContent = data?.followersCount ?? 0;
  profileFollowing.textContent = data?.followingCount ?? 0;
  renderAvatar(name, data?.avatarUrl || "");

  pfName.value = name;
  pfCity.value = data?.city || "Prishtina";
  pfAvatar.value = data?.avatarUrl || "";
  pfBio.value = data?.bio || "";
}

async function loadProfile(user) {
  if (!user) return;
  await ensureUserProfile(user, { city: "Prishtina" });
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    renderProfile(snap.data());
  }
}

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  pfStatus.textContent = "Saving...";

  const payload = {
    displayName: pfName.value.trim() || "User",
    city: pfCity.value.trim() || "Prishtina",
    avatarUrl: pfAvatar.value.trim(),
    bio: pfBio.value.trim(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(doc(db, "users", currentUser.uid), payload, { merge: true });
    await updateProfile(currentUser, { displayName: payload.displayName });
    renderProfile(payload);
    pfStatus.textContent = "Saved.";
  } catch (err) {
    console.error(err);
    pfStatus.textContent = "Failed to save.";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  profileEmpty.style.display = user ? "none" : "block";
  profileContent.style.display = user ? "block" : "none";
  if (user) loadProfile(user);
});
