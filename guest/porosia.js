// porosia.js — Finale Bestellübersicht + Bestellung senden (cost-optimized & safe-retry)

/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */

import { db } from "../shared/firebase-config.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

/* =========================================================
   ABSCHNITT 1 — PARAMS & GLOBAL STATE
   ========================================================= */

const params = new URLSearchParams(window.location.search);
const restaurantId = params.get("r") || "test-restaurant";
const tableId = params.get("t") || "T1";

let cart = [];

/* =========================================================
   ABSCHNITT 2 — DOM ELEMENTS
   ========================================================= */

const restaurantNameEl = document.getElementById("porosiaRestaurantName");
const tableLabelEl = document.getElementById("porosiaTableLabel");

const itemsEl = document.getElementById("porosiaItems");
const totalEl = document.getElementById("porosiaTotal");
const noteEl = document.getElementById("porosiaNote");
const clearBtn = document.getElementById("porosiaClearBtn");
const sendBtn = document.getElementById("porosiaSendBtn");
const statusEl = document.getElementById("porosiaStatus");
const backBtn = document.getElementById("porosiaBackBtn");

// FAB
const cartFab = document.getElementById("cartFab");
const cartFabLabel = document.getElementById("cartFabLabel");
const cartBadgeEl = document.getElementById("cartBadge");

/* =========================================================
   ABSCHNITT 3 — NAV HELPERS (FOLDER-SAFE)
   ========================================================= */

function navTo(page, extra = {}) {
  const url = new URL(page, window.location.href);
  url.searchParams.set("r", restaurantId);
  url.searchParams.set("t", tableId);
  Object.entries(extra).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    url.searchParams.set(k, String(v));
  });
  window.location.href = url.toString();
}

/* =========================================================
   ABSCHNITT 4 — CART STORAGE (LocalStorage)
   ========================================================= */

function getCartStorageKey() {
  return `menyra_cart_${restaurantId}_${tableId}`;
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(getCartStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: item.id,
        name: String(item.name || ""),
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 0,
      }))
      .filter((i) => i.id && i.qty > 0);
  } catch {
    return [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
  } catch {
    // ignore
  }
}

/* =========================================================
   ABSCHNITT 5 — PENDING ORDER (No Loss + Idempotent)
   ========================================================= */

function getPendingKey() {
  return `menyra_pending_order_${restaurantId}_${tableId}`;
}

function loadPendingOrder() {
  try {
    const raw = localStorage.getItem(getPendingKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.id || !parsed.payload) return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePendingOrder(id, payload) {
  try {
    localStorage.setItem(getPendingKey(), JSON.stringify({ id, payload }));
  } catch {
    // ignore
  }
}

function clearPendingOrder() {
  try {
    localStorage.removeItem(getPendingKey());
  } catch {
    // ignore
  }
}

function generateClientOrderId() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    // ignore
  }
  return `o_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function cartSignature(items) {
  return JSON.stringify(
    (items || [])
      .map((i) => ({
        id: i.id,
        qty: Number(i.qty) || 0,
        price: Number(i.price) || 0,
        name: String(i.name || ""),
      }))
      .sort((a, b) => (a.id || "").localeCompare(b.id || ""))
  );
}

/* =========================================================
   ABSCHNITT 5B — RESTAURANT NAME CACHE (reduziert Reads)
   ========================================================= */

const REST_NAME_CACHE_KEY = `menyra_cache_restname_${restaurantId}`;
const REST_NAME_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function getCachedRestaurantName() {
  try {
    const raw = localStorage.getItem(REST_NAME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.ts) return null;
    if (Date.now() - parsed.ts > REST_NAME_CACHE_TTL_MS) return null;
    return String(parsed.name);
  } catch {
    return null;
  }
}

function setCachedRestaurantName(name) {
  try {
    localStorage.setItem(
      REST_NAME_CACHE_KEY,
      JSON.stringify({ name: String(name || "Lokal"), ts: Date.now() })
    );
  } catch {
    // ignore
  }
}

/* =========================================================
   ABSCHNITT 6 — CART UI (Render + Badge + Qty)
   ========================================================= */

function updateCartBadge() {
  if (!cartBadgeEl || !cartFab) return;

  const totalQty = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  if (totalQty > 0) {
    cartBadgeEl.textContent = String(totalQty);
    cartBadgeEl.style.display = "flex";
    cartFab.classList.add("visible", "cart-fab--has-items");
    if (cartFabLabel) {
      cartFabLabel.textContent = "Shiko porosin";
      cartFabLabel.style.display = "block";
    }
  } else {
    cartBadgeEl.style.display = "none";
    cartFab.classList.remove("visible", "cart-fab--has-items");
    if (cartFabLabel) cartFabLabel.style.display = "none";
  }
}

function renderCart() {
  if (!itemsEl || !totalEl) return;

  itemsEl.innerHTML = "";
  let total = 0;

  if (!cart.length) {
    itemsEl.innerHTML = "<p class='info'>Nuk ke asnjë artikull në porosi.</p>";
    totalEl.textContent = "";
    updateCartBadge();
    saveCartToStorage();
    return;
  }

  cart.forEach((item, idx) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    total += price * qty;

    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    const leftSpan = document.createElement("span");
    leftSpan.textContent = `${qty}× ${item.name}`;

    const rightWrap = document.createElement("div");
    rightWrap.style.display = "flex";
    rightWrap.style.alignItems = "center";
    rightWrap.style.gap = "6px";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "btn btn-ghost btn-small";
    minusBtn.textContent = "−";
    minusBtn.addEventListener("click", () => changeCartQty(idx, -1));

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "btn btn-primary btn-small";
    plusBtn.textContent = "+";
    plusBtn.addEventListener("click", () => changeCartQty(idx, +1));

    const priceSpan = document.createElement("span");
    priceSpan.textContent = (price * qty).toFixed(2) + " €";

    rightWrap.appendChild(minusBtn);
    rightWrap.appendChild(plusBtn);
    rightWrap.appendChild(priceSpan);

    row.appendChild(leftSpan);
    row.appendChild(rightWrap);

    itemsEl.appendChild(row);
  });

  totalEl.textContent = `Summe: ${total.toFixed(2)} €`;
  updateCartBadge();
  saveCartToStorage();
}

function changeCartQty(index, delta) {
  if (index < 0 || index >= cart.length) return;
  cart[index].qty = (Number(cart[index].qty) || 0) + (Number(delta) || 0);
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
}

/* =========================================================
   ABSCHNITT 7 — FIRESTORE: RESTAURANT HEADER (cache-first)
   ========================================================= */

async function loadRestaurantHeader() {
  if (tableLabelEl) tableLabelEl.textContent = `Tisch ${tableId}`;

  const cachedName = getCachedRestaurantName();
  if (cachedName && restaurantNameEl) {
    restaurantNameEl.textContent = cachedName;
    return;
  }

  try {
    const restRef = doc(db, "restaurants", restaurantId);
    const snap = await getDoc(restRef);
    if (snap.exists()) {
      const data = snap.data() || {};
      const name = data.restaurantName || "Lokal";
      if (restaurantNameEl) restaurantNameEl.textContent = name;
      setCachedRestaurantName(name);
    } else {
      if (restaurantNameEl) restaurantNameEl.textContent = "Lokal";
    }
  } catch (err) {
    console.error(err);
    if (restaurantNameEl) restaurantNameEl.textContent = "Lokal";
  }
}

/* =========================================================
   ABSCHNITT 8 — SEND ORDER (cost-optimized + safe retry)
   ========================================================= */

async function sendOrder() {
  if (!statusEl) return;

  statusEl.textContent = "";
  statusEl.className = "status-text";

  const pending = loadPendingOrder();

  if (!pending && !cart.length) {
    statusEl.textContent = "Nuk ke asgjë në porosi.";
    statusEl.classList.add("status-err");
    return;
  }

  const orderId = pending?.id || generateClientOrderId();

  const baseItems =
    pending?.payload?.items ||
    cart.map((c) => ({
      id: c.id,
      name: c.name,
      price: Number(c.price) || 0,
      qty: Number(c.qty) || 0,
    }));

  const baseNote = pending?.payload?.note ?? ((noteEl && noteEl.value) || "");
  const baseSig = pending?.payload?.clientCartSig || cartSignature(cart);

  const createPayload = {
    restaurantId,
    table: tableId,
    items: baseItems,
    note: baseNote,
    status: "new",
    createdAt: serverTimestamp(),
    source: "qr",
    clientOrderId: orderId,
    clientCartSig: baseSig,
  };

  const pendingPayloadForStorage = {
    restaurantId,
    table: tableId,
    items: baseItems,
    note: baseNote,
    source: "qr",
    clientOrderId: orderId,
    clientCartSig: baseSig,
  };

  try {
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = pending ? "Duke e ridërguar..." : "Duke dërguar...";
    }

    if (!pending) savePendingOrder(orderId, pendingPayloadForStorage);

    const orderRef = doc(db, "restaurants", restaurantId, "orders", orderId);

    if (pending) {
      try {
        await updateDoc(orderRef, {
          lastClientRetryAt: serverTimestamp(),
          clientOrderId: orderId,
          clientCartSig: baseSig,
        });
      } catch (err) {
        const msg = String(err?.message || "");
        const isNotFound =
          msg.toLowerCase().includes("no document") ||
          msg.toLowerCase().includes("not-found") ||
          msg.toLowerCase().includes("not found");

        if (isNotFound) {
          await setDoc(orderRef, createPayload);
        } else {
          throw err;
        }
      }
    } else {
      await setDoc(orderRef, createPayload);
    }

    clearPendingOrder();

    const matchesCart = baseSig === cartSignature(cart);
    if (matchesCart) {
      cart = [];
      renderCart();
      if (noteEl) noteEl.value = "";
    }

    statusEl.textContent = matchesCart
      ? "Porosia u dërgua. Faleminderit!"
      : "Porosia u dërgua. (Ke ende artikuj të rinj në shportë.)";
    statusEl.classList.add("status-ok");
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Gabim gjatë dërgimit: " + (err?.message || "Unknown error");
    statusEl.classList.add("status-err");
  } finally {
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = "Dërgo porosinë";
    }
  }
}

/* =========================================================
   ABSCHNITT 9 — EVENTS / UI HANDLERS
   ========================================================= */

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    clearPendingOrder();
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "status-text";
    }
    cart = [];
    renderCart();
    if (noteEl) noteEl.value = "";
  });
}

if (sendBtn) {
  sendBtn.addEventListener("click", sendOrder);
}

if (backBtn) {
  backBtn.addEventListener("click", () => navTo("karte.html"));
}

if (cartFab) {
  cartFab.addEventListener("click", () => navTo("karte.html"));
}

/* =========================================================
   ABSCHNITT 10 — INIT
   ========================================================= */

cart = loadCartFromStorage();
renderCart();
loadRestaurantHeader();

const pendingInit = loadPendingOrder();
if (pendingInit && statusEl) {
  try {
    if (pendingInit?.payload?.note && noteEl && !noteEl.value) {
      noteEl.value = pendingInit.payload.note;
    }
  } catch {
    // ignore
  }

  statusEl.textContent = "Ka një porosi që nuk u konfirmua. Shtyp ‘Dërgo porosinë’ përsëri.";
  statusEl.classList.add("status-err");
}

window.addEventListener("pageshow", () => {
  cart = loadCartFromStorage();
  renderCart();
});
