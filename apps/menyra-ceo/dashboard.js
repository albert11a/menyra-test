import { bootPlatformAdmin } from "../menyra-restaurants/_shared/admin/platform-admin-core.js";
import { auth, db } from "../../shared/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

bootPlatformAdmin({ role: "ceo", roleLabel: "CEO Platform" });

const socialUsers = {
  list: document.getElementById("socialUsersList"),
  status: document.getElementById("socialUsersStatus"),
  meta: document.getElementById("socialUsersMeta"),
  search: document.getElementById("socialUsersSearch"),
  role: document.getElementById("socialUsersRole"),
  sort: document.getElementById("socialUsersSort"),
  reload: document.getElementById("socialUsersReload")
};

let socialUsersCache = [];
let socialUsersLoading = false;
let currentUser = null;

function toDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatRelative(date) {
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

function initials(name) {
  const safe = String(name || "?").trim();
  if (!safe) return "?";
  const parts = safe.split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
}

function setSocialStatus(text) {
  if (socialUsers.status) socialUsers.status.textContent = text || "";
}

function renderSocialUsers(items) {
  if (!socialUsers.list) return;
  if (!items.length) {
    socialUsers.list.innerHTML = "<div class=\"m-muted\">Keine User gefunden.</div>";
    if (socialUsers.meta) socialUsers.meta.textContent = "0 Users";
    return;
  }

  socialUsers.list.innerHTML = items.map((user) => {
    const name = user.displayName || user.name || "User";
    const email = user.email || "-";
    const city = user.city || "-";
    const role = user.role || "user";
    const avatarUrl = user.avatarUrl || "";
    const createdAt = formatRelative(toDateSafe(user.createdAt));
    const avatar = avatarUrl
      ? `<img src="${avatarUrl}" alt="${name}" />`
      : initials(name);
    const badges = [
      `<span class="m-badge">${role}</span>`,
      `<span class="m-badge">${city}</span>`
    ].join("");

    return `
      <div class="lead-row">
        <div class="lead-avatar">${avatar}</div>
        <div class="lead-details">
          <div class="lead-name">${name}</div>
          <div class="lead-labels">${badges}</div>
          <div class="small text-muted">${email}</div>
        </div>
        <div class="meta">${createdAt}</div>
      </div>
    `;
  }).join("");

  if (socialUsers.meta) socialUsers.meta.textContent = `Users: ${items.length}`;
}

function applySocialFilters() {
  if (!socialUsers.list) return;
  const term = String(socialUsers.search?.value || "").trim().toLowerCase();
  const role = String(socialUsers.role?.value || "").trim().toLowerCase();
  const sort = String(socialUsers.sort?.value || "created");

  let items = socialUsersCache.slice();
  if (role) {
    items = items.filter((item) => String(item.role || "user").toLowerCase() === role);
  }
  if (term) {
    items = items.filter((item) => {
      const haystack = [
        item.displayName,
        item.name,
        item.email,
        item.city
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }

  if (sort === "name") {
    items.sort((a, b) => String(a.displayName || a.name || "").localeCompare(String(b.displayName || b.name || "")));
  } else {
    items.sort((a, b) => {
      const ta = toDateSafe(a.createdAt)?.getTime() || 0;
      const tb = toDateSafe(b.createdAt)?.getTime() || 0;
      return tb - ta;
    });
  }

  renderSocialUsers(items);
}

async function fetchSocialUsers() {
  const ref = collection(db, "users");
  let snap = null;
  try {
    snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(300)));
  } catch (err) {
    console.warn("social users query fallback", err);
    snap = await getDocs(ref);
  }
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
}

async function loadSocialUsers({ force = false } = {}) {
  if (!socialUsers.list || socialUsersLoading) return;
  if (!currentUser) {
    setSocialStatus("Bitte einloggen.");
    return;
  }
  if (socialUsersCache.length && !force) {
    applySocialFilters();
    return;
  }

  socialUsersLoading = true;
  setSocialStatus("Lade User...");
  try {
    socialUsersCache = await fetchSocialUsers();
    applySocialFilters();
    setSocialStatus("");
  } catch (err) {
    console.error(err);
    setSocialStatus("Fehler beim Laden.");
  } finally {
    socialUsersLoading = false;
  }
}

if (socialUsers.search) socialUsers.search.addEventListener("input", applySocialFilters);
if (socialUsers.role) socialUsers.role.addEventListener("change", applySocialFilters);
if (socialUsers.sort) socialUsers.sort.addEventListener("change", applySocialFilters);
if (socialUsers.reload) socialUsers.reload.addEventListener("click", () => loadSocialUsers({ force: true }));

document.addEventListener("menyra:viewchange", (e) => {
  if (e?.detail?.view === "social-users") loadSocialUsers();
});

const showLoginFallback = () => {
  const overlay = document.getElementById("loginModalOverlay");
  if (!overlay || auth.currentUser) return;
  document.body.classList.add("m-login");
  document.documentElement.classList.add("m-login");
  document.body.classList.add("modal-open");
  document.documentElement.classList.add("modal-open");
  overlay.classList.remove("is-hidden");
};

let loginFallbackTimer = setTimeout(showLoginFallback, 800);
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (loginFallbackTimer) {
    clearTimeout(loginFallbackTimer);
    loginFallbackTimer = null;
  }
  if (!user) {
    showLoginFallback();
  } else {
    const active = document.querySelector(".m-view[data-view=\"social-users\"]");
    if (active && active.style.display !== "none") {
      loadSocialUsers();
    }
  }
});
