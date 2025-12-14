// detajet.js — Detailansicht (MENYRA) (cache-first + fast images)

/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */

import { db } from "../shared/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

/* =========================================================
   ABSCHNITT 1 — PARAMS & GLOBAL STATE
   ========================================================= */

const params = new URLSearchParams(window.location.search);
const restaurantId = params.get("r") || "test-restaurant";
const tableId = params.get("t") || "T1";
const itemId = params.get("item");

let cart = [];
let currentItem = null;
let currentQty = 1;

let sliderImages = [];
let sliderIndex = 0;

/* =========================================================
   ABSCHNITT 1B — CACHE (REDUZIERT READS)
   ========================================================= */

const MENU_CACHE_KEY = `menyra_cache_menu_${restaurantId}`;
const MENU_CACHE_TTL_MS = 5 * 60 * 1000;

const ITEM_CACHE_KEY = `menyra_cache_item_${restaurantId}_${itemId || "noitem"}`;
const ITEM_CACHE_TTL_MS = 5 * 60 * 1000;

function safeReadCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeWriteCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function getCachedMenuItems() {
  const cached = safeReadCache(MENU_CACHE_KEY);
  if (!cached || !cached.ts || !Array.isArray(cached.items)) return null;
  if (Date.now() - cached.ts > MENU_CACHE_TTL_MS) return null;
  return cached.items;
}

function getCachedItem() {
  const cached = safeReadCache(ITEM_CACHE_KEY);
  if (!cached || !cached.ts || !cached.item) return null;
  if (Date.now() - cached.ts > ITEM_CACHE_TTL_MS) return null;
  return cached.item;
}

function setCachedItem(item) {
  if (!itemId) return;
  safeWriteCache(ITEM_CACHE_KEY, { ts: Date.now(), item });
}

/* =========================================================
   ABSCHNITT 2 — DOM ELEMENTS
   ========================================================= */

const backBtn = document.getElementById("backBtn");
const detailTableBadge = document.getElementById("detailTableBadge");

const detailNameEl = document.getElementById("detailName");
const detailPriceEl = document.getElementById("detailPrice");
const detailLongDescEl = document.getElementById("detailLongDesc");
const detailZutatenEl = document.getElementById("detailZutaten");

const detailQtyMinusBtn = document.getElementById("detailQtyMinus");
const detailQtyPlusBtn = document.getElementById("detailQtyPlus");
const detailQtyValueEl = document.getElementById("detailQtyValue");
const detailAddBtn = document.getElementById("detailAddBtn");
const detailViewCartBtn = document.getElementById("detailViewCartBtn");

const detailCartSection = document.getElementById("detailCartSection");
const detailCartItemsEl = document.getElementById("detailCartItems");
const detailCartTotalEl = document.getElementById("detailCartTotal");
const detailCartTableLabel = document.getElementById("detailCartTableLabel");

const cartFab = document.getElementById("cartFab");
const cartFabLabel = document.getElementById("cartFabLabel");
const cartBadgeEl = document.getElementById("cartBadge");

const sliderWrapper = document.getElementById("detailSliderWrapper");
const sliderViewport = document.getElementById("detailSliderViewport");
const sliderTrack = document.getElementById("detailSliderTrack");
const sliderPrevBtn = document.getElementById("detailSliderPrev");
const sliderNextBtn = document.getElementById("detailSliderNext");

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
   ABSCHNITT 4 — CART: LOCALSTORAGE + BADGE + MINI-CART
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

function renderMiniCart() {
  const hasMiniCartDom =
    detailCartSection &&
    detailCartItemsEl &&
    detailCartTotalEl &&
    detailCartTableLabel;

  if (!cart.length) {
    if (hasMiniCartDom) {
      detailCartSection.style.display = "none";
      detailCartItemsEl.innerHTML = "";
      detailCartTotalEl.textContent = "";
      detailCartTableLabel.textContent = "";
    }
    updateCartBadge();
    saveCartToStorage();
    return;
  }

  if (!hasMiniCartDom) {
    updateCartBadge();
    saveCartToStorage();
    return;
  }

  detailCartSection.style.display = "block";
  detailCartItemsEl.innerHTML = "";

  let total = 0;
  const frag = document.createDocumentFragment();

  cart.forEach((item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    total += price * qty;

    const row = document.createElement("div");
    row.className = "cart-item-row";

    const left = document.createElement("span");
    left.textContent = `${qty}× ${item.name}`;

    const right = document.createElement("span");
    right.textContent = `${(price * qty).toFixed(2)} €`;

    row.appendChild(left);
    row.appendChild(right);
    frag.appendChild(row);
  });

  detailCartItemsEl.appendChild(frag);
  detailCartTotalEl.textContent = `Summe: ${total.toFixed(2)} €`;
  detailCartTableLabel.textContent = `Tisch ${tableId}`;

  updateCartBadge();
  saveCartToStorage();
}

function changeCart(item, deltaQty) {
  const d = Number(deltaQty) || 0;
  if (!item || !item.id || d === 0) return;

  const index = cart.findIndex((c) => c.id === item.id);
  if (index === -1 && d > 0) {
    cart.push({
      id: item.id,
      name: String(item.name || "Produkt"),
      price: Number(item.price) || 0,
      qty: d,
    });
  } else if (index >= 0) {
    cart[index].qty = (Number(cart[index].qty) || 0) + d;
    if (cart[index].qty <= 0) cart.splice(index, 1);
  }

  renderMiniCart();
}

/* =========================================================
   ABSCHNITT 5 — BILD-SLIDER (RENDER + NAV + TOUCH)
   ========================================================= */

function updateSliderPosition() {
  if (!sliderTrack || !sliderViewport) return;
  const viewportWidth = sliderViewport.getBoundingClientRect().width || 0;
  sliderTrack.style.transform = `translateX(-${sliderIndex * viewportWidth}px)`;
}

function updateSliderArrows() {
  const visible = sliderImages.length > 1;
  if (sliderPrevBtn) sliderPrevBtn.style.display = visible ? "flex" : "none";
  if (sliderNextBtn) sliderNextBtn.style.display = visible ? "flex" : "none";
}

function renderSliderImages(urls) {
  if (!sliderWrapper || !sliderTrack) return;

  sliderImages = Array.isArray(urls)
    ? urls.filter((u) => typeof u === "string" && u.trim() !== "")
    : [];

  sliderTrack.innerHTML = "";

  if (!sliderImages.length) {
    sliderWrapper.style.display = "none";
    return;
  }

  sliderWrapper.style.display = "block";

  const frag = document.createDocumentFragment();
  sliderImages.forEach((url, idx) => {
    const slide = document.createElement("div");
    slide.className = "detail-slide";

    const img = document.createElement("img");
    img.src = url;
    img.alt = currentItem ? currentItem.name : "Produktbild";
    img.loading = idx === 0 ? "eager" : "lazy";
    img.decoding = "async";
    img.fetchPriority = idx === 0 ? "high" : "low";
    img.referrerPolicy = "no-referrer";

    img.onerror = () => {
      try { slide.remove(); } catch {}
    };

    slide.appendChild(img);
    frag.appendChild(slide);
  });

  sliderTrack.appendChild(frag);

  sliderIndex = 0;
  updateSliderPosition();
  updateSliderArrows();
}

function goToSlide(index) {
  if (!sliderImages.length) return;
  if (index < 0) index = sliderImages.length - 1;
  if (index >= sliderImages.length) index = 0;
  sliderIndex = index;
  updateSliderPosition();
}

function goPrevSlide() { goToSlide(sliderIndex - 1); }
function goNextSlide() { goToSlide(sliderIndex + 1); }

function initSliderTouch() {
  if (!sliderViewport) return;

  let startX = 0;
  let deltaX = 0;
  let isDown = false;

  sliderViewport.addEventListener("touchstart", (e) => {
    if (!sliderImages.length) return;
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    deltaX = 0;
    isDown = true;
  }, { passive: true });

  sliderViewport.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });

  sliderViewport.addEventListener("touchend", () => {
    if (!isDown) return;
    if (deltaX > 50) goPrevSlide();
    else if (deltaX < -50) goNextSlide();
    isDown = false;
    startX = 0;
    deltaX = 0;
  }, { passive: true });
}

if (sliderPrevBtn) sliderPrevBtn.addEventListener("click", goPrevSlide);
if (sliderNextBtn) sliderNextBtn.addEventListener("click", goNextSlide);
initSliderTouch();

window.addEventListener("resize", updateSliderPosition);

/* =========================================================
   ABSCHNITT 6 — ITEM RENDER (DOM)
   ========================================================= */

function renderItemToDom(item) {
  currentItem = item;

  const gallery = Array.isArray(item.imageUrls)
    ? item.imageUrls.filter((u) => typeof u === "string" && u.trim() !== "")
    : [];

  renderSliderImages(gallery);

  if (detailNameEl) detailNameEl.textContent = item.name || "Produkt";
  if (detailPriceEl) detailPriceEl.textContent = (Number(item.price) || 0).toFixed(2) + " €";

  const longText = item.longDescription || item.description || "";
  if (detailLongDescEl) detailLongDescEl.textContent = longText;

  if (detailZutatenEl) detailZutatenEl.textContent = item.description || "";

  currentQty = 1;
  if (detailQtyValueEl) detailQtyValueEl.textContent = String(currentQty);
}

/* =========================================================
   ABSCHNITT 7 — LOAD ITEM (CACHE-FIRST, FIRESTORE FALLBACK)
   ========================================================= */

async function loadItem() {
  if (!detailNameEl || !detailLongDescEl) return;

  if (!itemId) {
    detailNameEl.textContent = "Produkt nicht gefunden";
    detailLongDescEl.textContent = "Keine ID in der URL.";
    return;
  }

  if (detailTableBadge) detailTableBadge.textContent = `Tisch ${tableId}`;

  const cachedMenu = getCachedMenuItems();
  if (cachedMenu && cachedMenu.length) {
    const found = cachedMenu.find((x) => x && x.id === itemId);
    if (found) {
      const gallery = Array.isArray(found.imageUrls)
        ? found.imageUrls
        : found.imageUrl
        ? [found.imageUrl]
        : [];

      renderItemToDom({
        id: found.id,
        name: found.name || "Produkt",
        description: found.description || "",
        longDescription: found.longDescription || "",
        price: Number(found.price) || 0,
        imageUrl: found.imageUrl || null,
        imageUrls: gallery,
      });
      return;
    }
  }

  const cachedItem = getCachedItem();
  if (cachedItem && cachedItem.id === itemId) {
    renderItemToDom(cachedItem);
    return;
  }

  try {

    // ✅ Public-Menu (1 Doc) zuerst versuchen (günstiger als menuItems Read)
    try {
      const publicMenuRef = doc(db, "restaurants", restaurantId, "public", "menu");
      const publicMenuSnap = await getDoc(publicMenuRef);
      if (publicMenuSnap.exists()) {
        const pd = publicMenuSnap.data() || {};
        const list = Array.isArray(pd.items) ? pd.items : [];
        const found = list.find((x) => x && x.id === itemId && x.available !== false);
        if (found) {
          const gallery = Array.isArray(found.imageUrls)
            ? found.imageUrls.filter((u) => typeof u === "string" && u.trim() !== "")
            : [];
          if (!gallery.length && found.imageUrl) gallery.push(found.imageUrl);

          const item = {
            id: found.id,
            name: found.name || "Produkt",
            description: found.description || "",
            longDescription: found.longDescription || "",
            price: Number(found.price) || 0,
            imageUrl: found.imageUrl || null,
            imageUrls: gallery,
          };

          setCachedItem(item);
          renderItemToDom(item);
          return;
        }
      }
    } catch (err) {
      // Fallback auf menuItems
    }

    const itemRef = doc(db, "restaurants", restaurantId, "menuItems", itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      detailNameEl.textContent = "Produkt nicht gefunden";
      detailLongDescEl.textContent = "Bitte Personal informieren.";
      return;
    }

    const d = itemSnap.data() || {};

    const gallery = Array.isArray(d.imageUrls)
      ? d.imageUrls.filter((u) => typeof u === "string" && u.trim() !== "")
      : [];
    if (!gallery.length && d.imageUrl) gallery.push(d.imageUrl);

    const item = {
      id: itemSnap.id,
      name: d.name || "Produkt",
      description: d.description || "",
      longDescription: d.longDescription || "",
      price: Number(d.price) || 0,
      imageUrl: d.imageUrl || null,
      imageUrls: gallery,
    };

    setCachedItem(item);
    renderItemToDom(item);
  } catch (err) {
    console.error(err);
    detailNameEl.textContent = "Fehler";
    detailLongDescEl.textContent = err?.message || "Unbekannter Fehler";
  }
}

/* =========================================================
   ABSCHNITT 8 — EVENTS / UI HANDLERS
   ========================================================= */

if (backBtn) {
  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) history.back();
    else navTo("karte.html");
  });
}

if (detailQtyMinusBtn) {
  detailQtyMinusBtn.addEventListener("click", () => {
    if (currentQty > 1) {
      currentQty -= 1;
      if (detailQtyValueEl) detailQtyValueEl.textContent = String(currentQty);
    }
  });
}

if (detailQtyPlusBtn) {
  detailQtyPlusBtn.addEventListener("click", () => {
    currentQty += 1;
    if (detailQtyValueEl) detailQtyValueEl.textContent = String(currentQty);
  });
}

if (detailAddBtn) {
  detailAddBtn.addEventListener("click", () => {
    if (!currentItem) return;
    changeCart(currentItem, currentQty);
  });
}

if (detailViewCartBtn) {
  detailViewCartBtn.addEventListener("click", () => {
    if (!cart.length) return;
    navTo("porosia.html");
  });
}

if (cartFab) {
  cartFab.addEventListener("click", () => {
    if (!cart.length) return;
    navTo("porosia.html");
  });
}

window.addEventListener("pageshow", () => {
  cart = loadCartFromStorage();
  renderMiniCart();
});

/* =========================================================
   ABSCHNITT 9 — INIT
   ========================================================= */

cart = loadCartFromStorage();
renderMiniCart();
loadItem();
