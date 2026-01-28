import { bootPlatformAdmin } from "../menyra-restaurants/_shared/admin/platform-admin-core.js";
import { auth, db } from "../../shared/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp
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

const ALLOWED_SOCIAL_ROLES = ["staff", "owner", "ceo"];


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

  const roleOptions = ALLOWED_SOCIAL_ROLES.map((r) => `<option value="${r}">${r.toUpperCase()}</option>`).join("");

  socialUsers.list.innerHTML = items.map((user) => {
    const name = user.displayName || user.name || "User";
    const email = user.email || "-";
    const city = user.city || "-";
    const role = String(user.role || "").toLowerCase();
    const avatarUrl = user.avatarUrl || "";
    const createdAt = formatRelative(toDateSafe(user.createdAt));
    const avatar = avatarUrl
      ? `<img src="${avatarUrl}" alt="${name}" loading="lazy" decoding="async" />`
      : `<div class="lead-initials">${initials(name)}</div>`;

    const badges = [
      `<span class="m-badge">${role || "-"}</span>`,
      `<span class="m-badge">${city}</span>`
    ].join("");

    const safeRole = ALLOWED_SOCIAL_ROLES.includes(role) ? role : "staff";

    return `
      <div class="lead-row" data-id="${user.id}">
        <div class="lead-avatar">${avatar}</div>
        <div class="lead-details">
          <div class="lead-name">${name}
            <button class="btn btn-sm btn-outline-primary btn-edit-user" data-id="${user.id}" title="Bearbeiten" style="margin-left:10px;">
              <i class="fas fa-edit"></i>
            </button>
          </div>
          <div class="lead-labels">${badges}</div>
          <div class="small text-muted">${email}</div>
        </div>
        <div class="meta">
          <div class="small text-muted">${createdAt}</div>
          <select class="lead-select user-role-select" data-id="${user.id}">
            ${roleOptions}
          </select>
          <button class="lead-danger user-soft-delete-btn" data-id="${user.id}" type="button">Soft delete</button>
        </div>
      </div>
    `;
  }).join("");

  // Set the current value for each select after render (avoid HTML injection edge cases)
  socialUsers.list.querySelectorAll('select.user-role-select').forEach((sel) => {
    const id = sel.getAttribute('data-id');
    const u = items.find((x) => x.id === id);
    const role = String(u?.role || '').toLowerCase();
    sel.value = ALLOWED_SOCIAL_ROLES.includes(role) ? role : 'staff';
  });

  if (socialUsers.meta) socialUsers.meta.textContent = `Users: ${items.length}`;
}

function applySocialFilters() {
  if (!socialUsers.list) return;

  const term = String(socialUsers.search?.value || "").trim().toLowerCase();
  const roleFilter = String(socialUsers.role?.value || "").trim().toLowerCase();
  const sort = String(socialUsers.sort?.value || "created");

  let items = socialUsersCache.slice();

  // Hide soft-deleted users by default
  items = items.filter((u) => !u.disabled && String(u.status || "").toLowerCase() !== "deleted");

  if (roleFilter) {
    items = items.filter((item) => String(item.role || "").toLowerCase() === roleFilter);
  }

  if (term) {
    items = items.filter((item) => {
      const haystack = [item.displayName, item.name, item.email, item.city, item.role].filter(Boolean).join(" ").toLowerCase();
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

// Clear button for search
const socialUsersClear = document.getElementById("socialUsersClear");
if (socialUsersClear && socialUsers.search) {
  const toggleClear = () => {
    const v = String(socialUsers.search.value || "").trim();
    socialUsersClear.classList.toggle("hidden", !v);
  };
  socialUsersClear.addEventListener("click", () => {
    if (!socialUsers.search) return;
    socialUsers.search.value = "";
    toggleClear();
    applySocialFilters();
    socialUsers.search.focus();
  });
  socialUsers.search.addEventListener("input", toggleClear);
  // init
  setTimeout(() => toggleClear(), 50);
}

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

// -------------------------
// Social user edit/delete modal + handlers
// -------------------------
const socialUserModal = {
  overlay: document.getElementById("socialUserModalOverlay"),
  name: document.getElementById("socialUserName"),
  city: document.getElementById("socialUserCity"),
  role: document.getElementById("socialUserRole"),
  idDisplay: document.getElementById("socialUserId"),
  status: document.getElementById("socialUserModalStatus"),
  saveBtn: document.getElementById("socialUserSaveBtn"),
  deleteBtn: document.getElementById("socialUserDeleteBtn"),
  cancelBtn: document.getElementById("socialUserCancelBtn")
};

function showSocialUserModal() {
  if (!socialUserModal.overlay) return;
  socialUserModal.overlay.classList.remove("is-hidden");
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
}
function hideSocialUserModal() {
  if (!socialUserModal.overlay) return;
  socialUserModal.overlay.classList.add("is-hidden");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
}

let _editingUserId = null;

function openSocialUserEditor(id) {
  _editingUserId = id;
  const u = socialUsersCache.find((x) => x.id === id) || null;
  if (!u) return;
  if (socialUserModal.name) socialUserModal.name.value = u.displayName || u.name || "";
  if (socialUserModal.city) socialUserModal.city.value = u.city || "";
  if (socialUserModal.role) socialUserModal.role.value = ALLOWED_SOCIAL_ROLES.includes(String(u.role||" ").toLowerCase()) ? String(u.role).toLowerCase() : "staff";
  if (socialUserModal.idDisplay) socialUserModal.idDisplay.textContent = id;
  if (socialUserModal.status) socialUserModal.status.textContent = "";
  showSocialUserModal();
}

async function saveSocialUser() {
  if (!_editingUserId) return;
  try {
    if (socialUserModal.status) socialUserModal.status.textContent = "Speichere...";
    const ref = doc(db, "users", _editingUserId);
    const payload = {
      displayName: (socialUserModal.name?.value || "").trim(),
      city: (socialUserModal.city?.value || "").trim(),
      role: (ALLOWED_SOCIAL_ROLES.includes(String(socialUserModal.role?.value||"staff").toLowerCase()) ? String(socialUserModal.role?.value||"staff").toLowerCase() : "staff")
    };
    await updateDoc(ref, payload);
    if (socialUserModal.status) socialUserModal.status.textContent = "Gespeichert.";
    socialUsersCache = socialUsersCache.map((u) => u.id === _editingUserId ? { ...u, ...payload } : u);
    applySocialFilters();
    setTimeout(() => { hideSocialUserModal(); }, 600);
  } catch (err) {
    console.error(err);
    if (socialUserModal.status) socialUserModal.status.textContent = "Fehler beim Speichern.";
  }
}

async function deleteSocialUserById(id) {
  if (!id) return;
  if (!confirm("User wirklich SOFT löschen? (disabled + status=deleted)")) return;
  try {
    if (socialUserModal.status) socialUserModal.status.textContent = "Soft delete...";
    const ref = doc(db, "users", id);
    const payload = {
      disabled: true,
      status: "deleted",
      deletedAt: serverTimestamp()
    };
    await updateDoc(ref, payload);

    socialUsersCache = socialUsersCache.map((u) => u.id === id ? { ...u, ...payload } : u);
    applySocialFilters();

    if (socialUserModal.status) socialUserModal.status.textContent = "Soft deleted.";
    hideSocialUserModal();
  } catch (err) {
    console.error(err);
    if (socialUserModal.status) socialUserModal.status.textContent = "Fehler beim Soft delete.";
  }
}

// delegation for list buttons + role select
if (socialUsers.list) {
  socialUsers.list.addEventListener("click", (ev) => {
    const btn = ev.target.closest && ev.target.closest("button");
    if (!btn) return;
    const id = btn.dataset && btn.dataset.id;
    if (!id) return;
    if (btn.classList.contains("btn-edit-user")) {
      openSocialUserEditor(id);
    } else if (btn.classList.contains("user-soft-delete-btn")) {
      deleteSocialUserById(id);
    }
  });

  socialUsers.list.addEventListener("change", async (ev) => {
    const sel = ev.target;
    if (!(sel && sel.classList && sel.classList.contains("user-role-select"))) return;
    const id = sel.getAttribute("data-id");
    const newRole = String(sel.value || "").toLowerCase();
    if (!id || !ALLOWED_SOCIAL_ROLES.includes(newRole)) {
      sel.value = "staff";
      return;
    }
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      socialUsersCache = socialUsersCache.map((u) => u.id === id ? { ...u, role: newRole } : u);
      applySocialFilters();
    } catch (err) {
      console.error(err);
      // revert
      const u = socialUsersCache.find((x) => x.id === id);
      const oldRole = ALLOWED_SOCIAL_ROLES.includes(String(u?.role || "").toLowerCase()) ? String(u.role).toLowerCase() : "staff";
      sel.value = oldRole;
      alert("Role update fehlgeschlagen.");
    }
  });
}

if (socialUserModal.saveBtn) socialUserModal.saveBtn.addEventListener("click", saveSocialUser);
if (socialUserModal.deleteBtn) socialUserModal.deleteBtn.addEventListener("click", () => deleteSocialUserById(_editingUserId));
if (socialUserModal.cancelBtn) socialUserModal.cancelBtn.addEventListener("click", hideSocialUserModal);

