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
  setDoc,
  deleteDoc,
  updateDoc,
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

// Only these roles are allowed to be assigned from CEO UI
const ALLOWED_SOCIAL_ROLES = ["user", "staff", "owner", "ceo"];
const SYSTEM_ROLE_SET = new Set(["ceo", "staff", "owner"]);

function normalizeRoleList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v || "").trim().toLowerCase()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value.split(",").map((v) => String(v || "").trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

function resolveSystemRole(user) {
  const roles = normalizeRoleList(user?.roles);
  if (roles.includes("ceo")) return "ceo";
  if (roles.includes("staff")) return "staff";
  if (roles.includes("owner")) return "owner";
  return "user";
}

function mergeSystemRoles(existingRoles, nextRole) {
  const kept = normalizeRoleList(existingRoles).filter((r) => !SYSTEM_ROLE_SET.has(r));
  if (nextRole && nextRole !== "user") kept.push(nextRole);
  return Array.from(new Set(kept));
}

async function ensureOwnerRestaurantAccess({ uid, user, nextRole }) {
  if (!uid || nextRole !== "owner") return;
  const rid = user?.restaurantId || "";
  if (!rid) return;
  const name = user?.displayName || user?.name || "";
  const email = user?.email || "";
  try {
    await setDoc(doc(db, "restaurants", rid, "staff", uid), {
      uid,
      userId: uid,
      name,
      email,
      role: "owner",
      roles: ["owner"],
      status: "active",
      updatedAt: serverTimestamp()
    }, { merge: true });
    await setDoc(doc(db, "restaurants", rid), {
      ownerUid: uid,
      ownerEmail: email,
      ownerName: name,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("owner access sync failed", err);
  }
}

async function syncSystemRoleDocs({ uid, nextRole, user }) {
  if (!uid) return;
  const basePayload = {
    uid,
    userId: uid,
    email: user?.email || "",
    name: user?.displayName || user?.name || "",
    role: nextRole,
    roles: nextRole && nextRole !== "user" ? [nextRole] : [],
    updatedAt: serverTimestamp()
  };
  if (nextRole === "ceo") {
    await setDoc(doc(db, "superadmins", uid), basePayload, { merge: true });
    await deleteDoc(doc(db, "staffAdmins", uid)).catch(() => {});
  } else if (nextRole === "staff") {
    await setDoc(doc(db, "staffAdmins", uid), basePayload, { merge: true });
    await deleteDoc(doc(db, "superadmins", uid)).catch(() => {});
  } else {
    await deleteDoc(doc(db, "superadmins", uid)).catch(() => {});
    await deleteDoc(doc(db, "staffAdmins", uid)).catch(() => {});
  }
}

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
    const systemRole = resolveSystemRole(user);
    const accountType = String(user.role || "user").trim().toLowerCase();
    const avatarUrl = user.avatarUrl || "";
    const createdAt = formatRelative(toDateSafe(user.createdAt));
    const avatar = avatarUrl
      ? `<img src="${avatarUrl}" alt="${name}" />`
      : initials(name);
    const badges = [
      `<span class="m-badge">${systemRole || "-"}</span>`,
      `<span class="m-badge">${accountType}</span>`,
      `<span class="m-badge">${city}</span>`
    ].join("");

    const roleSelect = `
      <select class="lead-select user-role-select" data-id="${user.id}" aria-label="role">
        ${ALLOWED_SOCIAL_ROLES.map((r) => {
          const sel = (r === systemRole) ? "selected" : "";
          return `<option value="${r}" ${sel}>${r}</option>`;
        }).join("")}
      </select>
    `;

    const delLabel = user.disabled || String(user.status || "").toLowerCase() === "deleted"
      ? "Deaktiviert"
      : "Löschen";

    return `
      <div class="lead-row">
        <div class="lead-avatar">${avatar}</div>
        <div class="lead-details">
          <div class="lead-name">${name}</div>
          <div class="lead-labels">${badges}</div>
          <div class="small text-muted">${email}</div>
        </div>
        <div class="meta">
          <div class="small text-muted">${createdAt}</div>
          ${roleSelect}
          <button class="lead-danger user-softdelete-btn" data-id="${user.id}" type="button">${delLabel}</button>
        </div>
        <div class="lead-actions">
          <button class="btn btn-sm btn-outline-primary btn-edit-user" data-id="${user.id}" title="Bearbeiten"><i class="fas fa-edit"></i></button>
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
    items = items.filter((item) => resolveSystemRole(item) === role);
  }
  if (term) {
    items = items.filter((item) => {
      const haystack = [item.displayName, item.name, item.email, item.city, item.businessName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
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
  restaurant: document.getElementById("socialUserRestaurant"),
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
  loadSocialRestaurants().then(() => {
    renderSocialRestaurantOptions(String(socialUserModal.restaurant?.value || ""));
  });
}
function hideSocialUserModal() {
  if (!socialUserModal.overlay) return;
  socialUserModal.overlay.classList.add("is-hidden");
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
}

let _editingUserId = null;
let socialRestaurantsCache = [];
let socialRestaurantsLoading = false;

async function fetchSocialRestaurants() {
  const ref = collection(db, "restaurants");
  let snap = null;
  try {
    snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(300)));
  } catch (err) {
    console.warn("social restaurants query fallback", err);
    snap = await getDocs(ref);
  }
  return snap.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() || {}) }));
}

async function loadSocialRestaurants({ force = false } = {}) {
  if (socialRestaurantsLoading) return;
  if (!socialUserModal.restaurant) return;
  if (socialRestaurantsCache.length && !force) return;
  socialRestaurantsLoading = true;
  try {
    socialRestaurantsCache = await fetchSocialRestaurants();
  } catch (err) {
    console.error(err);
  } finally {
    socialRestaurantsLoading = false;
  }
}

function renderSocialRestaurantOptions(selectedId = "") {
  if (!socialUserModal.restaurant) return;
  const sel = socialUserModal.restaurant;
  const current = selectedId || sel.value || "";
  sel.innerHTML = `<option value="">- bitte waehlen -</option>`;
  socialRestaurantsCache.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.name || r.restaurantName || r.id;
    sel.appendChild(opt);
  });
  if (current && socialRestaurantsCache.some((r) => r.id === current)) {
    sel.value = current;
  }
}

function openSocialUserEditor(id) {
  _editingUserId = id;
  const u = socialUsersCache.find((x) => x.id === id) || null;
  if (!u) return;
  if (socialUserModal.name) socialUserModal.name.value = u.displayName || u.name || "";
  if (socialUserModal.city) socialUserModal.city.value = u.city || "";
  if (socialUserModal.role) {
    const r = resolveSystemRole(u);
    socialUserModal.role.value = ALLOWED_SOCIAL_ROLES.includes(r) ? r : "user";
  }
  if (socialUserModal.restaurant) {
    const rid = String(u.restaurantId || "").trim();
    loadSocialRestaurants().then(() => {
      renderSocialRestaurantOptions(rid);
    });
  }
  if (socialUserModal.idDisplay) socialUserModal.idDisplay.textContent = id;
  if (socialUserModal.status) socialUserModal.status.textContent = "";
  showSocialUserModal();
}

async function saveSocialUser() {
  if (!_editingUserId) return;
  try {
    if (socialUserModal.status) socialUserModal.status.textContent = "Speichere...";
    const ref = doc(db, "users", _editingUserId);
    const chosenRole = String(socialUserModal.role?.value || "").trim().toLowerCase();
    const safeRole = ALLOWED_SOCIAL_ROLES.includes(chosenRole) ? chosenRole : "user";
    const current = socialUsersCache.find((x) => x.id === _editingUserId) || {};
    const restaurantId = String(socialUserModal.restaurant?.value || "").trim();
    if (safeRole === "owner" && !restaurantId) {
      if (socialUserModal.status) socialUserModal.status.textContent = "Owner braucht ein Restaurant.";
      return;
    }
    const nextRoles = mergeSystemRoles(current.roles, safeRole);
    const payload = {
      displayName: (socialUserModal.name?.value || "").trim(),
      city: (socialUserModal.city?.value || "").trim(),
      restaurantId: restaurantId || "",
      roles: nextRoles,
      updatedAt: serverTimestamp()
    };
    const updatedUser = { ...current, ...payload };
    await updateDoc(ref, payload);
    await syncSystemRoleDocs({ uid: _editingUserId, nextRole: safeRole, user: updatedUser });
    await ensureOwnerRestaurantAccess({ uid: _editingUserId, user: updatedUser, nextRole: safeRole });
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
  if (!confirm("User wirklich endgueltig loeschen?")) return;
  const current = socialUsersCache.find((u) => u.id === id) || {};
  try {
    if (socialUserModal.status) socialUserModal.status.textContent = "Loesche...";
    await deleteDoc(doc(db, "users", id));
    await deleteDoc(doc(db, "staffAdmins", id)).catch(() => {});
    await deleteDoc(doc(db, "superadmins", id)).catch(() => {});
    if (current.restaurantId) {
      await deleteDoc(doc(db, "restaurants", current.restaurantId, "staff", id)).catch(() => {});
    }
    socialUsersCache = socialUsersCache.filter((u) => u.id !== id);
    applySocialFilters();
    if (socialUserModal.status) socialUserModal.status.textContent = "Geloescht.";
    hideSocialUserModal();
  } catch (err) {
    console.error(err);
    if (socialUserModal.status) socialUserModal.status.textContent = "Fehler beim Loeschen.";
  }
}

// delegation for list buttons
if (socialUsers.list) {
  // Inline role updates (low friction)
  socialUsers.list.addEventListener("change", async (ev) => {
    const sel = ev.target && ev.target.closest ? ev.target.closest("select.user-role-select") : null;
    if (!sel) return;
    const id = sel.dataset && sel.dataset.id;
    if (!id) return;
    const nextRole = String(sel.value || "").trim().toLowerCase();
    if (!ALLOWED_SOCIAL_ROLES.includes(nextRole)) return;
    try {
      const current = socialUsersCache.find((u) => u.id === id) || {};
      if (nextRole === "owner" && !current.restaurantId) {
        setSocialStatus("Owner braucht Restaurant (bitte im Edit setzen).");
        const fallbackRole = resolveSystemRole(current);
        sel.value = ALLOWED_SOCIAL_ROLES.includes(fallbackRole) ? fallbackRole : "user";
        return;
      }
      setSocialStatus("Speichere Rolle...");
      const nextRoles = mergeSystemRoles(current.roles, nextRole);
      const updatedUser = { ...current, roles: nextRoles, updatedAt: serverTimestamp() };
      await updateDoc(doc(db, "users", id), { roles: nextRoles, updatedAt: serverTimestamp() });
      await syncSystemRoleDocs({ uid: id, nextRole, user: updatedUser });
      await ensureOwnerRestaurantAccess({ uid: id, user: updatedUser, nextRole });
      socialUsersCache = socialUsersCache.map((u) => u.id === id ? { ...u, roles: nextRoles } : u);
      applySocialFilters();
      setSocialStatus("");
    } catch (err) {
      console.error(err);
      setSocialStatus("Fehler beim Speichern der Rolle.");
    }
  });

  socialUsers.list.addEventListener("click", (ev) => {
    const btn = ev.target.closest && ev.target.closest("button");
    if (!btn) return;
    const id = btn.dataset && btn.dataset.id;
    if (!id) return;
    if (btn.classList.contains("btn-edit-user")) {
      openSocialUserEditor(id);
    } else if (btn.classList.contains("user-softdelete-btn")) {
      deleteSocialUserById(id);
    }
  });
}

if (socialUserModal.saveBtn) socialUserModal.saveBtn.addEventListener("click", saveSocialUser);
if (socialUserModal.deleteBtn) socialUserModal.deleteBtn.addEventListener("click", () => deleteSocialUserById(_editingUserId));
if (socialUserModal.cancelBtn) socialUserModal.cancelBtn.addEventListener("click", hideSocialUserModal);
