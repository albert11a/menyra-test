import { db, auth } from "@shared/firebase-config.js";
import {
  collection,
  collectionGroup,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const params = new URLSearchParams(window.location.search);
let restaurantId = params.get("r") || "";

const restaurantNameEl = document.getElementById("restaurantName");
const authCard = document.getElementById("authCard");
const authStatus = document.getElementById("authStatus");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const appEl = document.getElementById("app");
const statusLine = document.getElementById("statusLine");
const statusFilter = document.getElementById("statusFilter");
const ordersList = document.getElementById("ordersList");

let unsubscribe = null;
let currentOrders = [];

const allowedRoles = new Set(["owner", "admin", "manager", "kitchen"]);

function normalizeRoleList(value) {
  const raw = Array.isArray(value) ? value : (value ? [value] : []);
  const out = [];
  const seen = new Set();
  raw.forEach((role) => {
    const keyRaw = String(role || "").trim().toLowerCase();
    const aliases = {
      kamarier: "waiter",
      kamarieri: "waiter",
      garson: "waiter",
      kuzhina: "kitchen",
      kuzhinier: "kitchen",
      kuzhinieri: "kitchen",
      chef: "kitchen",
      cook: "kitchen"
    };
    const key = aliases[keyRaw] || keyRaw;
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
  });
  return out;
}

function hasAllowedRole(data) {
  const roles = normalizeRoleList(data?.roles || data?.role || "");
  return roles.some(r => allowedRoles.has(r));
}

function setAuthStatus(text, isError = false) {
  if (!authStatus) return;
  authStatus.textContent = text || "";
  authStatus.style.color = isError ? "#b0433c" : "";
}

function setStatusLine(text) {
  if (statusLine) statusLine.textContent = text || "";
}

function formatTime(ts) {
  if (!ts) return "-";
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(status) {
  switch (status) {
    case "new": return "New";
    case "accepted": return "Accepted";
    case "cooking": return "Cooking";
    case "ready": return "Ready";
    case "done": return "Done";
    case "cancelled": return "Cancelled";
    default: return status || "New";
  }
}

async function collectStaffRestaurants(field, value, limitCount = 5) {
  if (!field || !value) return [];
  try {
    const snap = await getDocs(query(collectionGroup(db, "staff"), where(field, "==", value), limit(limitCount)));
    if (snap.empty) return [];
    const ids = [];
    snap.forEach((docSnap) => {
      const rid = docSnap.ref.parent?.parent?.id || "";
      if (rid) ids.push(rid);
    });
    return ids;
  } catch (err) {
    console.warn(err);
    return [];
  }
}

async function collectStaffIndexRestaurants(uid) {
  if (!uid) return [];
  try {
    const snap = await getDoc(doc(db, "staffIndex", uid));
    if (!snap.exists()) return [];
    const data = snap.data() || {};
    const ids = [];
    if (data.restaurantId) ids.push(data.restaurantId);
    if (Array.isArray(data.restaurantIds)) ids.push(...data.restaurantIds);
    return ids.filter(Boolean);
  } catch (err) {
    console.warn("staffIndex lookup failed", err);
    return [];
  }
}

async function resolveRestaurantIds(user) {
  if (!user) return [];
  const uid = user.uid || "";
  const email = user.email || "";
  const ids = new Set();
  (await collectStaffIndexRestaurants(uid)).forEach(id => ids.add(id));
  (await collectStaffRestaurants(documentId(), uid)).forEach(id => ids.add(id));
  (await collectStaffRestaurants("uid", uid)).forEach(id => ids.add(id));
  (await collectStaffRestaurants("userId", uid)).forEach(id => ids.add(id));
  (await collectStaffRestaurants("email", email)).forEach(id => ids.add(id));
  return Array.from(ids);
}

async function updateStatus(orderId, nextStatus) {
  if (!orderId || !nextStatus) return;
  const ref = doc(db, "restaurants", restaurantId, "orders", orderId);
  await updateDoc(ref, { status: nextStatus, updatedAt: serverTimestamp() });
}

function getKitchenItems(items) {
  return (items || []).filter((item) => item?.type !== "drink");
}

function renderOrders() {
  const filter = statusFilter?.value || "";
  const rows = currentOrders.filter((o) => !filter || (o.status || "new") === filter);

  const cards = rows.map((order) => {
    const items = getKitchenItems(order.items || []);
    if (!items.length) return "";
    const status = order.status || "new";
    const createdAt = formatTime(order.createdAt);
    const table = order.table ? `Table ${order.table}` : "Table -";

    const itemsHtml = items.map((item) => {
      const category = item.category ? ` · ${item.category}` : "";
      return `
        <div class="item-row">
          <div>
            <span class="item-name">${item.qty || 1}× ${item.name || "Item"}</span>
            <div class="item-meta">${category}</div>
          </div>
        </div>
      `;
    }).join("");

    const note = order.note ? `<div class="note">Note: ${order.note}</div>` : "";

    const actions = [];
    if (status === "new" || status === "accepted") {
      actions.push(`<button class="btn" data-action="start" data-order-id="${order.id}">Cooking</button>`);
    }
    if (status === "cooking") {
      actions.push(`<button class="btn btn--warn" data-action="ready" data-order-id="${order.id}">Ready</button>`);
    }
    if (status === "ready") {
      actions.push(`<button class="btn" data-action="done" data-order-id="${order.id}">Done</button>`);
    }

    return `
      <div class="order-card" data-order-id="${order.id}">
        <div class="order-header">
          <div class="order-title">${table}</div>
          <span class="badge status-${status}">${statusLabel(status)}</span>
        </div>
        <div class="order-meta">
          <span class="meta">${createdAt}</span>
          <span class="meta">#${order.id?.slice(0, 6) || "-"}</span>
        </div>
        <div class="item-list">${itemsHtml || "<div class='meta'>No kitchen items</div>"}</div>
        ${note}
        <div class="order-actions">${actions.join("")}</div>
      </div>
    `;
  }).filter(Boolean);

  if (!cards.length) {
    ordersList.innerHTML = "<div class='empty'>No kitchen orders.</div>";
    setStatusLine("Orders: 0");
    return;
  }

  ordersList.innerHTML = cards.join("");
  setStatusLine(`Orders: ${cards.length}`);
}

async function checkAccess(user) {
  if (!restaurantId) {
    setAuthStatus("Missing restaurant id.", true);
    return false;
  }

  const staffRef = doc(db, "restaurants", restaurantId, "staff", user.uid);
  const superRef = doc(db, "superadmins", user.uid);
  const staffAdminRef = doc(db, "staffAdmins", user.uid);

  const [staffSnap, superSnap, staffAdminSnap] = await Promise.all([
    getDoc(staffRef).catch(() => null),
    getDoc(superRef).catch(() => null),
    getDoc(staffAdminRef).catch(() => null)
  ]);

  if (superSnap?.exists?.() || staffAdminSnap?.exists?.()) return true;

  if (staffSnap?.exists?.()) {
    return hasAllowedRole(staffSnap.data());
  }

  const email = user.email || "";
  const candidates = [
    ["uid", user.uid],
    ["userId", user.uid],
    ["email", email]
  ];
  for (const [field, value] of candidates) {
    if (!value) continue;
    try {
      const qs = await getDocs(query(collection(db, "restaurants", restaurantId, "staff"), where(field, "==", value), limit(1)));
      if (!qs.empty) {
        return hasAllowedRole(qs.docs[0].data());
      }
    } catch (err) {
      console.warn(err);
    }
  }
  return false;
}

async function loadRestaurantName() {
  if (!restaurantId) return;
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId));
    if (snap.exists()) {
      const data = snap.data();
      restaurantNameEl.textContent = data?.name || data?.restaurantName || restaurantId;
    } else {
      restaurantNameEl.textContent = restaurantId;
    }
  } catch {
    restaurantNameEl.textContent = restaurantId;
  }
}

function startOrdersListener() {
  if (unsubscribe) unsubscribe();
  const ref = collection(db, "restaurants", restaurantId, "orders");
  const q = query(ref, orderBy("createdAt", "desc"), limit(100));
  unsubscribe = onSnapshot(q, (snap) => {
    currentOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderOrders();
  }, (err) => {
    console.error(err);
    setStatusLine("Failed to load orders.");
  });
}

ordersList.addEventListener("click", async (e) => {
  const btn = e.target?.closest?.("[data-action]");
  if (!btn) return;
  const orderId = btn.getAttribute("data-order-id");
  const action = btn.getAttribute("data-action");
  try {
    if (action === "start") await updateStatus(orderId, "cooking");
    if (action === "ready") await updateStatus(orderId, "ready");
    if (action === "done") await updateStatus(orderId, "done");
  } catch (err) {
    console.error(err);
    setStatusLine("Update failed.");
  }
});

statusFilter.addEventListener("change", renderOrders);
refreshBtn.addEventListener("click", renderOrders);

loginBtn.addEventListener("click", async () => {
  const email = emailInput?.value?.trim();
  const pass = passwordInput?.value || "";
  if (!email || !pass) {
    setAuthStatus("Email and password required.", true);
    return;
  }
  try {
    setAuthStatus("Logging in...");
    await signInWithEmailAndPassword(auth, email, pass);
    setAuthStatus("");
  } catch (err) {
    setAuthStatus("Login failed.", true);
    console.error(err);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    authCard.classList.remove("hidden");
    appEl.classList.add("hidden");
    setAuthStatus("Please login.");
    if (unsubscribe) unsubscribe();
    return;
  }

  if (!restaurantId) {
    const ids = await resolveRestaurantIds(user);
    if (!ids.length) {
      setAuthStatus("No restaurant assigned. Ask admin to assign.", true);
      return;
    }
    if (ids.length > 1) {
      setAuthStatus("Multiple restaurants found. Use ?r= in the link.", true);
      return;
    }
    restaurantId = ids[0];
  }

  const ok = await checkAccess(user);
  if (!ok) {
    authCard.classList.remove("hidden");
    appEl.classList.add("hidden");
    setAuthStatus("No access for this restaurant.", true);
    return;
  }

  authCard.classList.add("hidden");
  appEl.classList.remove("hidden");
  setAuthStatus("");
  await loadRestaurantName();
  startOrdersListener();
});
