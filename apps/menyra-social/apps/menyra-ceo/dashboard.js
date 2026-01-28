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
  deleteDoc
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
        <div class="lead-actions">
          <button class="btn btn-sm btn-outline-primary btn-edit-user" data-id="${user.id}"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-delete-user" data-id="${user.id}"><i class="fas fa-trash"></i></button>
        </div>
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
    if (role) {
      items = items.filter((item) => {
        const haystack = [item.displayName, item.name, item.email, item.city].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(term);
      });
    } else {
      // role not selected: prefer role-specific matches
      const all = items.slice();
      const matchesBusiness = all.filter((item) => {
        if (String(item.role || "").toLowerCase() !== "business") return false;
        const hay = ((item.businessName || item.displayName || "") + " " + (item.city || "")).toLowerCase();
        return hay.includes(term);
      });
      const matchesUser = all.filter((item) => {
        if (String(item.role || "").toLowerCase() !== "user") return false;
        const hay = [item.displayName, item.name, item.email, item.city].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(term);
      });
      if (matchesBusiness.length > 0 && matchesUser.length === 0) {
        items = matchesBusiness;
      } else if (matchesUser.length > 0 && matchesBusiness.length === 0) {
        items = matchesUser;
      } else if (matchesBusiness.length > 0) {
        // both matched: prefer businesses to avoid mixing
        items = matchesBusiness;
      } else {
        items = matchesUser;
      }
    }
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
  if (socialUserModal.role) socialUserModal.role.value = u.role || "user";
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
      role: (socialUserModal.role?.value || "user").trim()
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
  if (!confirm("Benutzer wirklich löschen? Dies entfernt auch Social-Posts dieses Users.")) return;
  try {
    if (socialUserModal.status) socialUserModal.status.textContent = "Lösche...";
    // delete user doc
    await deleteDoc(doc(db, "users", id));
    // delete social posts authored by this user (collectionGroup search)
    try {
      const q = query(collectionGroup(db, "socialPosts"), where("authorId", "==", id));
      const snap = await getDocs(q);
      const deletes = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletes);
    } catch (err) {
      console.warn("Fehler beim Löschen der Social-Posts:", err);
    }
    socialUsersCache = socialUsersCache.filter((u) => u.id !== id);
    applySocialFilters();
    if (socialUserModal.status) socialUserModal.status.textContent = "Gelöscht.";
    hideSocialUserModal();
  } catch (err) {
    console.error(err);
    if (socialUserModal.status) socialUserModal.status.textContent = "Fehler beim Löschen.";
  }
}

// delegation for list buttons
if (socialUsers.list) {
  socialUsers.list.addEventListener("click", (ev) => {
    const btn = ev.target.closest && ev.target.closest("button");
    if (!btn) return;
    const id = btn.dataset && btn.dataset.id;
    if (!id) return;
    if (btn.classList.contains("btn-edit-user")) {
      openSocialUserEditor(id);
    } else if (btn.classList.contains("btn-delete-user")) {
      // quick delete from list
      deleteSocialUserById(id);
    }
  });
}

if (socialUserModal.saveBtn) socialUserModal.saveBtn.addEventListener("click", saveSocialUser);
if (socialUserModal.deleteBtn) socialUserModal.deleteBtn.addEventListener("click", () => deleteSocialUserById(_editingUserId));
if (socialUserModal.cancelBtn) socialUserModal.cancelBtn.addEventListener("click", hideSocialUserModal);

