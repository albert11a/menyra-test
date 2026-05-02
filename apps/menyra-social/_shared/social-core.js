import { db, auth } from "/shared/firebase-config.js?v=2026-05-02-public-startup-diet-01";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "/shared/vendor/firebase/11.0.0/firebase-auth.js";

export function projectRoot() {
  const href = window.location.href;
  const idx = href.indexOf("/apps/");
  if (idx !== -1) return href.slice(0, idx + 1);
  return new URL("/", href).toString();
}

export function buildUrl(pathFromRoot, params = {}) {
  const root = projectRoot();
  const url = new URL(root + pathFromRoot.replace(/^\//, ""));
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) {
      url.searchParams.set(k, String(v));
    }
  });
  return url.toString();
}

export function qs(name) {
  const key = String(name || "").trim();
  if (!key) return null;
  const searchValue = new URLSearchParams(window.location.search || "").get(key);
  if (searchValue !== null && searchValue !== "") return searchValue;

  const hash = String(window.location.hash || "");
  if (!hash) return searchValue;
  const queryIndex = hash.indexOf("?");
  const hashQuery = queryIndex >= 0
    ? hash.slice(queryIndex + 1)
    : hash.replace(/^#\/?/, "");
  if (!hashQuery) return searchValue;
  const hashValue = new URLSearchParams(hashQuery).get(key);
  return hashValue ?? searchValue;
}

export function toDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "number") return new Date(value);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRelative(date) {
  if (!date) return "-";
  const ts = date instanceof Date ? date.getTime() : date;
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.round(diff / 1000);
  if (sec < 60) return sec + "s";
  const min = Math.round(sec / 60);
  if (min < 60) return min + "m";
  const hr = Math.round(min / 60);
  if (hr < 24) return hr + "h";
  const days = Math.round(hr / 24);
  return days + "d";
}

export function getGeo(item) {
  if (!item) return null;
  if (item.geo && typeof item.geo.lat === "number" && typeof item.geo.lng === "number") {
    return { lat: item.geo.lat, lng: item.geo.lng };
  }
  if (typeof item.lat === "number" && typeof item.lng === "number") {
    return { lat: item.lat, lng: item.lng };
  }
  return null;
}

export function haversineKm(a, b) {
  if (!a || !b) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return 6371 * c;
}

export function formatKm(km) {
  if (km === null || km === undefined) return "-";
  if (km < 1) return Math.round(km * 1000) + " m";
  return km.toFixed(1) + " km";
}

export function initials(name) {
  const safe = String(name || "?").trim();
  if (!safe) return "?";
  const parts = safe.split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

function runNonBlockingUserProfileWrite(task, scope = "ensureUserProfile") {
  try {
    const pending = typeof task === "function" ? task() : null;
    if (pending && typeof pending.then === "function") {
      pending.catch((err) => {
        console.warn(`[mnyra][${scope}]`, err);
      });
    }
  } catch (err) {
    console.warn(`[mnyra][${scope}]`, err);
  }
}

export async function ensureUserProfile(user, overrides = {}) {
  if (!user) return null;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  // --- EXISTING PROFILE: SELF-HEAL MISSING FIELDS (AVATAR) ---
  if (snap.exists()) {
    const existing = snap.data() || {};
    const patch = {};

    // If missing avatar fields but Firebase Auth has photoURL, write it back
    const hasAvatar = !!(existing.avatarUrl || existing.avatar);
    if (!hasAvatar && user?.photoURL) {
      patch.avatarUrl = user.photoURL;
    }

    if (!existing.displayName && user?.displayName) {
      patch.displayName = user.displayName;
    }

    if (!existing.uid) {
      patch.uid = user.uid;
    }

    if (!String(existing.status || "").trim()) {
      patch.status = "active";
    }

    if (
      !String(existing.role || "").trim()
      && !(Array.isArray(existing.roles) && existing.roles.length)
      && !String(existing.restaurantId || existing.staffRestaurantId || existing.waiterRestaurantId || "").trim()
      && !String(existing.ceoParentUid || existing.ceoRootUid || existing.createdByRole || "").trim()
    ) {
      patch.role = "user";
    }

    if (Object.keys(patch).length) {
      patch.updatedAt = serverTimestamp();
      runNonBlockingUserProfileWrite(
        () => setDoc(ref, patch, { merge: true }),
        "ensureUserProfile.selfHealPatch"
      );
      return { ...existing, ...patch };
    }

    return existing;
  }

  const displayName = overrides.displayName || user.displayName || user.email?.split("@")[0] || "User";
  const payload = {
    uid: user.uid,
    displayName,
    email: overrides.email || user.email || "",
    role: overrides.role || "user",
    status: overrides.status || "active",
    bio: "",
    city: overrides.city || "Prishtina",
    score: 0,
    followersCount: 0,
    followingCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  if (overrides.avatarUrl) payload.avatarUrl = overrides.avatarUrl;
  await setDoc(ref, payload, { merge: true });
  return payload;
}

export function attachAuthHeader({
  linkId = "authLink",
  userId = "authUser",
  onUser = null
} = {}) {
  const link = document.getElementById(linkId);
  const userLine = document.getElementById(userId);
  const loginHref = link?.getAttribute("data-login") || buildUrl("apps/menyra-social/index.html", { auth: "login" });

  onAuthStateChanged(auth, (user) => {
    if (userLine) userLine.textContent = user ? user.email : "guest";
    if (link) {
      if (user) {
        link.textContent = "Logout";
        link.href = "#";
        link.onclick = async (e) => {
          e.preventDefault();
          await signOut(auth);
        };
      } else {
        link.textContent = "Login";
        link.href = loginHref;
        link.onclick = null;
      }
    }
    if (typeof onUser === "function") onUser(user);
  });
}
