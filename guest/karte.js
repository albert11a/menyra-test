/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */

import { db } from "../shared/firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

/* =========================================================
   ABSCHNITT 1 — PARAMS & GLOBAL STATE
   ========================================================= */

const params = new URLSearchParams(window.location.search);
const restaurantId = params.get("r") || "test-restaurant";
const tableId = params.get("t") || "T1";

let allMenuItems = [];
let drinksItems = [];
let foodItems = [];

let activeFoodCategory = "Alle";
let activeDrinksCategory = null;
let searchTerm = "";
let cart = [];

// Offers Slider State
let offersSlides = [];
let offersCurrentIndex = 0;
let offersTimer = null;
let offersScrollHandler = null;

// ✅ Cache (reduziert Firestore Reads massiv)
const MENU_CACHE_KEY = `menyra_cache_menu_${restaurantId}`;
const OFFERS_CACHE_KEY = `menyra_cache_offers_${restaurantId}`;
const REST_CACHE_KEY = `menyra_cache_rest_${restaurantId}`;

// ✅ Public Docs (1 Read statt N Dokumente)
const PUBLIC_MENU_REF = doc(db, "restaurants", restaurantId, "public", "menu");
const PUBLIC_OFFERS_REF = doc(db, "restaurants", restaurantId, "public", "offers");

const MENU_CACHE_TTL_MS = 5 * 60 * 1000;   // 5 Minuten
const OFFERS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Minuten
const REST_CACHE_TTL_MS = 5 * 60 * 1000;   // 5 Minuten (für schnellere Header-Anzeige)

/* =========================================================
   ABSCHNITT 2 — DOM ELEMENTS
   ========================================================= */

const restaurantLogoEl = document.getElementById("restaurantLogo");
const restaurantNameEl = document.getElementById("restaurantName");
const restaurantMetaEl = document.getElementById("restaurantMeta");

// TABS & LISTEN
const drinksSection = document.getElementById("drinksSection");
const drinksTabsWrapper = document.getElementById("drinksTabsWrapper");
const drinksTabsEl = document.getElementById("drinksTabs");
const drinksListEl = document.getElementById("drinksList");

const foodTabsWrapper = document.getElementById("foodTabsWrapper");
const foodCategoryTabsEl = document.getElementById("foodCategoryTabs");
const menuListEl = document.getElementById("menuList");

// OFFERS
const offersSection = document.getElementById("offersSection");
const offersSliderEl = document.getElementById("offersSlider");
const offersDotsEl = document.getElementById("offersDots");

// SUCHE & FLOATING CART
const searchInput = document.getElementById("searchInput");
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
   ABSCHNITT 4 — CART: LOCALSTORAGE
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
   ABSCHNITT 5 — HELFER: STATUS/VALIDATION
   ========================================================= */

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSubscriptionValid(data) {
  if (!data.subscriptionUntil) return true;
  const today = todayISO();
  return data.subscriptionUntil >= today;
}

function isRestaurantOperational(data) {
  if (data.active === false) return false;
  if (!isSubscriptionValid(data)) return false;
  return true;
}

/* =========================================================
   ABSCHNITT 5B — CACHE HELPERS (WENIGER READS)
   ========================================================= */

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

function getCachedMenu() {
  const cached = safeReadCache(MENU_CACHE_KEY);
  if (!cached || !cached.ts || !Array.isArray(cached.items)) return null;
  if (Date.now() - cached.ts > MENU_CACHE_TTL_MS) return null;
  return cached.items;
}

function setCachedMenu(items) {
  safeWriteCache(MENU_CACHE_KEY, { ts: Date.now(), items });
}

function getCachedOffers() {
  const cached = safeReadCache(OFFERS_CACHE_KEY);
  if (!cached || !cached.ts || !Array.isArray(cached.offers)) return null;
  if (Date.now() - cached.ts > OFFERS_CACHE_TTL_MS) return null;
  return cached.offers;
}

function setCachedOffers(offers) {
  safeWriteCache(OFFERS_CACHE_KEY, { ts: Date.now(), offers });
}

function getCachedRestaurant() {
  const cached = safeReadCache(REST_CACHE_KEY);
  if (!cached || !cached.ts || !cached.data) return null;
  if (Date.now() - cached.ts > REST_CACHE_TTL_MS) return null;
  return cached.data;
}

function setCachedRestaurant(data) {
  safeWriteCache(REST_CACHE_KEY, { ts: Date.now(), data });
}

/* =========================================================
   ABSCHNITT 6 — LIKES: LOCALSTORAGE
   ========================================================= */

function likeKey(itemId) {
  return `menyra_like_${restaurantId}_${itemId}`;
}

function isItemLiked(itemId) {
  return localStorage.getItem(likeKey(itemId)) === "1";
}

function setItemLiked(itemId, liked) {
  if (liked) localStorage.setItem(likeKey(itemId), "1");
  else localStorage.removeItem(likeKey(itemId));
}

/* =========================================================
   ABSCHNITT 7 — OFFERS SLIDER
   ========================================================= */

function clearOffersTimer() {
  if (offersTimer) {
    clearInterval(offersTimer);
    offersTimer = null;
  }
}

function goToOffer(index) {
  if (!offersSlides.length || !offersSliderEl || !offersDotsEl) return;
  if (index < 0 || index >= offersSlides.length) return;

  const slide = offersSlides[index];
  const offset = slide.offsetLeft - offersSliderEl.offsetLeft;

  offersSliderEl.scrollTo({ left: offset, behavior: "smooth" });

  offersCurrentIndex = index;
  const dots = offersDotsEl.querySelectorAll(".offers-dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
}

function startOffersAutoSlide() {
  clearOffersTimer();
  if (offersSlides.length <= 1) return;
  offersTimer = setInterval(() => {
    const next = (offersCurrentIndex + 1) % offersSlides.length;
    goToOffer(next);
  }, 4000);
}

function bindOffersScrollOnce() {
  if (!offersSliderEl) return;

  if (offersScrollHandler) {
    offersSliderEl.removeEventListener("scroll", offersScrollHandler);
    offersScrollHandler = null;
  }

  offersScrollHandler = () => {
    if (!offersSlides.length) return;
    const center = offersSliderEl.scrollLeft + offersSliderEl.clientWidth / 2;
    let bestIndex = 0;
    let bestDist = Infinity;

    offersSlides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(slideCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    });

    offersCurrentIndex = bestIndex;
    const dots = offersDotsEl?.querySelectorAll(".offers-dot") || [];
    dots.forEach((d, i) => d.classList.toggle("active", i === bestIndex));
  };

  offersSliderEl.addEventListener("scroll", offersScrollHandler, { passive: true });
}

async function loadOffersForRestaurant(restaurantRef, restData) {
  if (!offersSection || !offersSliderEl || !offersDotsEl) return;

  if (restData.offerActive === false) {
    offersSection.style.display = "none";
    clearOffersTimer();
    return;
  }

  const cachedOffers = getCachedOffers();
  if (cachedOffers && cachedOffers.length) {
    renderOffersSlider(cachedOffers);
    return;
  }

  // ✅ 1) Erst versuchen: Public-Offers (1 Doc)
  try {
    const pubSnap = await getDoc(PUBLIC_OFFERS_REF);
    if (pubSnap.exists()) {
      const pd = pubSnap.data() || {};
      const offersArr = Array.isArray(pd.offers) ? pd.offers : [];
      const activeOffers = offersArr.filter((o) => o && o.active !== false).slice(0, 10);
      if (activeOffers.length) {
        setCachedOffers(activeOffers);
        renderOffersSlider(activeOffers);
        return;
      }
    }
  } catch (e) {
    // fallback unten
  }

  // ✅ 2) Fallback: alte Struktur (Subcollection offers)
  const offersCol = collection(restaurantRef, "offers");
  const snap = await getDocs(offersCol);

  const offers = [];
  snap.forEach((docSnap) => {
    const d = docSnap.data() || {};
    if (d.active === false) return;
    offers.push({ id: docSnap.id, ...d });
  });

  if (!offers.length) {
    offersSection.style.display = "none";
    clearOffersTimer();
    return;
  }

  const capped = offers.slice(0, 10);
  setCachedOffers(capped);
  renderOffersSlider(capped);
}

function renderOffersSlider(offers) {
  if (!offersSection || !offersSliderEl || !offersDotsEl) return;

  offersSliderEl.innerHTML = "";
  offersDotsEl.innerHTML = "";
  offersSection.style.display = "block";

  const dotsFrag = document.createDocumentFragment();
  const slidesFrag = document.createDocumentFragment();

  offers.forEach((offer, index) => {
    let linkedMenuItem = null;
    if (offer.menuItemId) {
      linkedMenuItem = allMenuItems.find((m) => m.id === offer.menuItemId) || null;
    }

    const title = offer.title || (linkedMenuItem ? linkedMenuItem.name : "Angebot");
    const description =
      offer.description || (linkedMenuItem ? linkedMenuItem.description : "");
    const imageUrl = offer.imageUrl || (linkedMenuItem ? linkedMenuItem.imageUrl : null);

    let price = null;
    if (typeof offer.price === "number") price = offer.price;
    else if (linkedMenuItem && typeof linkedMenuItem.price === "number") price = linkedMenuItem.price;

    const addToCart = offer.addToCart === true;

    const slide = document.createElement("div");
    slide.className = "offer-slide";

    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = title;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";
      img.fetchPriority = index === 0 ? "high" : "low";
      img.className = "offer-image";
      img.referrerPolicy = "no-referrer";

      img.onerror = () => {
        img.remove();
        const ph = document.createElement("div");
        ph.className = "offer-image";
        slide.insertBefore(ph, slide.firstChild);
      };

      slide.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "offer-image";
      slide.appendChild(placeholder);
    }

    const header = document.createElement("div");
    header.className = "offer-header";

    const titleEl = document.createElement("div");
    titleEl.className = "offer-title";
    titleEl.textContent = title;

    const priceEl = document.createElement("div");
    priceEl.className = "offer-price";
    priceEl.textContent = typeof price === "number" ? price.toFixed(2) + " €" : "";

    header.appendChild(titleEl);
    header.appendChild(priceEl);
    slide.appendChild(header);

    const descEl = document.createElement("div");
    descEl.className = "offer-desc";
    descEl.textContent = description || "";
    slide.appendChild(descEl);

    // ✅ offer kann direkt in cart (optional)
    if (addToCart && (linkedMenuItem || typeof price === "number")) {
      const actions = document.createElement("div");
      actions.className = "offer-actions";

      const minusBtn = document.createElement("button");
      minusBtn.className = "btn btn-ghost";
      minusBtn.textContent = "−";

      const plusBtn = document.createElement("button");
      plusBtn.className = "btn btn-primary";
      plusBtn.textContent = "Hinzufügen";

      const targetItem = linkedMenuItem
        ? linkedMenuItem
        : { id: "offer:" + offer.id, name: title, price: price || 0 };

      minusBtn.addEventListener("click", () => changeCart(targetItem, -1));
      plusBtn.addEventListener("click", () => changeCart(targetItem, 1));

      actions.appendChild(minusBtn);
      actions.appendChild(plusBtn);
      slide.appendChild(actions);
    } else {
      const infoOnly = document.createElement("div");
      infoOnly.className = "offer-info-only";
      infoOnly.textContent = "Vetëm informacion / reklamë – jo e porositshme direkt.";
      slide.appendChild(infoOnly);
    }

    slidesFrag.appendChild(slide);

    const dot = document.createElement("button");
    dot.className = "offers-dot" + (index === 0 ? " active" : "");
    dot.dataset.index = String(index);
    dot.setAttribute("aria-label", `Offer ${index + 1}`);
    dot.addEventListener("click", () => {
      goToOffer(index);
      startOffersAutoSlide();
    });
    dotsFrag.appendChild(dot);
  });

  offersSliderEl.appendChild(slidesFrag);
  offersDotsEl.appendChild(dotsFrag);

  offersSlides = Array.from(offersSliderEl.querySelectorAll(".offer-slide"));
  offersCurrentIndex = 0;

  bindOffersScrollOnce();
  startOffersAutoSlide();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearOffersTimer();
  else startOffersAutoSlide();
});

/* =========================================================
   ABSCHNITT 8 — RESTAURANT & MENÜ LADEN (cache-first)
   ========================================================= */

function inferTypeForItem(item) {
  if (item.type === "food" || item.type === "drink") return item.type;

  const cat = (item.category || "").toLowerCase();
  const drinksWords = [
    "getränke","getraenke","drinks","freskuese","cafe","kafe","kafe & espresso",
    "cappuccino","latte","çaj","caj","ujë","uje","lëngje","lengje",
    "birra","verë","vere","koktej","energjike",
  ];

  if (drinksWords.some((w) => cat.includes(w))) return "drink";
  return "food";
}

function applyRestaurantHeader(data) {
  if (!data) return;

  if (restaurantNameEl) restaurantNameEl.textContent = data.restaurantName || "Unbenanntes Lokal";
  if (restaurantMetaEl) restaurantMetaEl.textContent = "Mirësevini në menynë digjitale";

  if (restaurantLogoEl) {
    if (data.logoUrl) {
      restaurantLogoEl.src = data.logoUrl;
      restaurantLogoEl.width = 44;
      restaurantLogoEl.height = 44;
      restaurantLogoEl.referrerPolicy = "no-referrer";
      restaurantLogoEl.decoding = "async";
      restaurantLogoEl.fetchPriority = "high";
      restaurantLogoEl.style.display = "block";
    } else {
      restaurantLogoEl.style.display = "none";
    }
  }
}

async function loadRestaurantAndMenu() {
  try {
    // ✅ 1) Sofort aus Cache Header anzeigen (fühlt sich instant an)
    const cachedRest = getCachedRestaurant();
    if (cachedRest) applyRestaurantHeader(cachedRest);

    // ✅ 2) Menu cache-first rendern (instant Liste, wenn Cache vorhanden)
    const cachedMenu = getCachedMenu();
    if (cachedMenu && cachedMenu.length) {
      allMenuItems = cachedMenu.map((i) => ({ ...i, type: inferTypeForItem(i) }));
      drinksItems = allMenuItems.filter((i) => i.type === "drink");
      foodItems = allMenuItems.filter((i) => i.type === "food");

      renderDrinksTabs();
      renderDrinks();
      renderFoodCategories();
      renderMenu();
    }

    // ✅ 3) Danach Firestore freshen (aktuelle Daten)
    const restaurantRef = doc(db, "restaurants", restaurantId);
    const restaurantSnap = await getDoc(restaurantRef);

    if (!restaurantSnap.exists()) {
      if (restaurantNameEl) restaurantNameEl.textContent = "Lokal nicht gefunden";
      if (restaurantMetaEl) restaurantMetaEl.textContent = `ID: ${restaurantId}`;
      if (menuListEl) menuListEl.innerHTML = "<p class='info'>Bitte Personal informieren.</p>";
      if (offersSection) offersSection.style.display = "none";
      if (drinksSection) drinksSection.style.display = "none";
      if (drinksTabsWrapper) drinksTabsWrapper.style.display = "none";
      if (foodTabsWrapper) foodTabsWrapper.style.display = "none";
      return;
    }

    const data = restaurantSnap.data() || {};
    setCachedRestaurant(data);
    applyRestaurantHeader(data);

    if (!isRestaurantOperational(data)) {
      if (menuListEl) {
        menuListEl.innerHTML =
          "<p class='info'>Dieses MENYRA ist aktuell nicht aktiv. Bitte Personal informieren.</p>";
      }
      if (offersSection) offersSection.style.display = "none";
      if (drinksSection) drinksSection.style.display = "none";
      if (drinksTabsWrapper) drinksTabsWrapper.style.display = "none";
      if (foodTabsWrapper) foodTabsWrapper.style.display = "none";
      return;
    }

    // ✅ Wenn Cache frisch ist: keine Menü-Reads mehr (spart massiv bei Wiederaufrufen)
    const stillCachedMenu = getCachedMenu();
    if (stillCachedMenu && stillCachedMenu.length) {
      await loadOffersForRestaurant(restaurantRef, data);
      return;
    }

    let items = [];

    // ✅ 1) Erst versuchen: Public-Menu (1 Doc statt N docs)
    try {
      const pubMenuSnap = await getDoc(PUBLIC_MENU_REF);
      if (pubMenuSnap.exists()) {
        const pd = pubMenuSnap.data() || {};
        const arr = Array.isArray(pd.items) ? pd.items : [];
        items = arr
          .map((d) => ({
            id: d.id,
            name: d.name || "Produkt",
            description: d.description || "",
            longDescription: d.longDescription || "",
            price: Number(d.price) || 0,
            category: d.category || "Sonstiges",
            available: d.available !== false,
            imageUrl: d.imageUrl || null,
            imageUrls: Array.isArray(d.imageUrls) ? d.imageUrls : [],
            type: d.type || null,
            likeCount: Number(d.likeCount) || 0,
            commentCount: Number(d.commentCount) || 0,
            ratingCount: Number(d.ratingCount) || 0,
            ratingSum: Number(d.ratingSum) || 0,
          }))
          .filter((it) => it && it.id && it.available);
      }
    } catch (e) {
      // fallback unten
    }

    // ✅ 2) Fallback (wenn public/menu noch nicht existiert): alte Struktur lesen
    if (!items.length) {
      const menuCol = collection(restaurantRef, "menuItems");
      const snap = await getDocs(menuCol);

      items = snap.docs
        .map((docSnap) => {
          const d = docSnap.data() || {};
          return {
            id: docSnap.id,
            name: d.name || "Produkt",
            description: d.description || "",
            longDescription: d.longDescription || "",
            price: Number(d.price) || 0,
            category: d.category || "Sonstiges",
            available: d.available !== false,
            imageUrl: d.imageUrl || null,
            imageUrls: Array.isArray(d.imageUrls) ? d.imageUrls : [],
            type: d.type || null,
            likeCount: Number(d.likeCount) || 0,
            commentCount: Number(d.commentCount) || 0,
            ratingCount: Number(d.ratingCount) || 0,
            ratingSum: Number(d.ratingSum) || 0,
          };
        })
        .filter((item) => item.available);
    }

    items = items.map((item) => ({ ...item, type: inferTypeForItem(item) }));

    allMenuItems = items;
    drinksItems = allMenuItems.filter((i) => i.type === "drink");
    foodItems = allMenuItems.filter((i) => i.type === "food");

    setCachedMenu(allMenuItems);

    renderDrinksTabs();
    renderDrinks();
    renderFoodCategories();
    renderMenu();

    await loadOffersForRestaurant(restaurantRef, data);
  } catch (err) {
    console.error(err);
    if (restaurantNameEl) restaurantNameEl.textContent = "Fehler";
    if (restaurantMetaEl) restaurantMetaEl.textContent = err?.message || "Unbekannter Fehler";
    if (menuListEl) menuListEl.innerHTML = "<p class='info'>Fehler beim Laden der Speisekarte.</p>";
    if (offersSection) offersSection.style.display = "none";
    if (drinksSection) drinksSection.style.display = "none";
    if (drinksTabsWrapper) drinksTabsWrapper.style.display = "none";
    if (foodTabsWrapper) foodTabsWrapper.style.display = "none";
  }
}

/* =========================================================
   ABSCHNITT 9 — GETRÄNKE: TABS & LISTE
   ========================================================= */

function getDrinkCategories() {
  const set = new Set();
  drinksItems.forEach((i) => {
    if (i.category) set.add(i.category);
  });
  return Array.from(set);
}

function renderDrinksTabs() {
  if (!drinksTabsWrapper || !drinksTabsEl) return;

  const cats = getDrinkCategories();

  if (!cats.length) {
    drinksTabsWrapper.style.display = "none";
    if (drinksSection) drinksSection.style.display = "none";
    drinksTabsEl.innerHTML = "";
    return;
  }

  drinksTabsWrapper.style.display = "block";
  if (drinksSection) drinksSection.style.display = "block";
  drinksTabsEl.innerHTML = "";

  if (!activeDrinksCategory || !cats.includes(activeDrinksCategory)) {
    activeDrinksCategory = cats[0];
  }

  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "category-tab" + (activeDrinksCategory === cat ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeDrinksCategory = cat;
      renderDrinksTabs();
      renderDrinks();
    });
    drinksTabsEl.appendChild(btn);
  });
}

function renderDrinks() {
  if (!drinksSection || !drinksListEl) return;

  drinksListEl.innerHTML = "";

  if (!drinksItems.length) {
    drinksSection.style.display = "none";
    if (drinksTabsWrapper) drinksTabsWrapper.style.display = "none";
    return;
  }

  drinksSection.style.display = "block";
  if (drinksTabsWrapper) drinksTabsWrapper.style.display = "block";

  let items = drinksItems;
  if (activeDrinksCategory) items = drinksItems.filter((i) => i.category === activeDrinksCategory);

  if (!items.length) {
    drinksListEl.innerHTML = "<p class='info'>Keine Getränke.</p>";
    return;
  }

  const frag = document.createDocumentFragment();

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "drink-item";
    card.dataset.itemId = item.id;

    const topbar = document.createElement("div");
    topbar.className = "drink-topbar";

    const likeWrap = document.createElement("div");
    likeWrap.className = "like-wrap" + (isItemLiked(item.id) ? " is-liked" : "");
    likeWrap.dataset.itemId = item.id;

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className = "icon-circle";
    likeBtn.setAttribute("aria-label", "Like");

    const iconInner = document.createElement("span");
    iconInner.className = "icon-circle__inner";
    iconInner.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          class="heart-path"
          d="M12.001 4.529c2.349-2.532 6.533-2.036 8.426.758 1.222 1.79 1.347 4.582-.835 7.086-1.803 2.08-4.822 4.403-7.296 5.876a1.25 1.25 0 0 1-1.292 0c-2.474-1.473-5.493-3.797-7.296-5.876-2.182-2.504-2.057-5.296-.835-7.086 1.893-2.794 6.077-3.29 8.428-.758z"
        />
      </svg>
    `;
    likeBtn.appendChild(iconInner);

    const countSpan = document.createElement("span");
    countSpan.className = "like-count";
    countSpan.textContent = String(item.likeCount || 0);

    likeWrap.appendChild(likeBtn);
    likeWrap.appendChild(countSpan);
    topbar.appendChild(likeWrap);
    card.appendChild(topbar);

    likeBtn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      await toggleItemLike(item, likeWrap);
    });

    if (item.imageUrl) {
      const img = document.createElement("img");
      img.src = item.imageUrl;
      img.alt = item.name;
      img.loading = "lazy";
      img.decoding = "async";
      img.className = "drink-image";
      img.referrerPolicy = "no-referrer";
      img.onerror = () => img.remove();
      card.appendChild(img);
    }

    const header = document.createElement("div");
    header.className = "drink-header";

    const nameEl = document.createElement("div");
    nameEl.className = "drink-name";
    nameEl.textContent = item.name;

    const priceEl = document.createElement("div");
    priceEl.className = "drink-price";
    priceEl.textContent = (Number(item.price) || 0).toFixed(2) + " €";

    header.appendChild(nameEl);
    header.appendChild(priceEl);
    card.appendChild(header);

    if (item.description && item.description.trim() !== "") {
      const descEl = document.createElement("div");
      descEl.className = "drink-desc";
      descEl.textContent = item.description;
      card.appendChild(descEl);
    }

    const footer = document.createElement("div");
    footer.className = "drink-footer";

    const qtyControl = document.createElement("div");
    qtyControl.className = "qty-control";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "qty-btn";
    minusBtn.textContent = "−";

    const qtyValue = document.createElement("span");
    qtyValue.className = "qty-value";
    let currentQty = 1;
    qtyValue.textContent = "1";

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "qty-btn";
    plusBtn.textContent = "+";

    minusBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (currentQty > 1) {
        currentQty--;
        qtyValue.textContent = String(currentQty);
      }
    });

    plusBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      currentQty++;
      qtyValue.textContent = String(currentQty);
    });

    qtyControl.appendChild(minusBtn);
    qtyControl.appendChild(qtyValue);
    qtyControl.appendChild(plusBtn);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn-add-round";
    const addSpan = document.createElement("span");
    addSpan.textContent = "Wähle";
    addBtn.appendChild(addSpan);

    addBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      changeCart(item, currentQty);
    });

    footer.appendChild(qtyControl);
    footer.appendChild(addBtn);
    card.appendChild(footer);

    frag.appendChild(card);
  });

  drinksListEl.appendChild(frag);
}

/* =========================================================
   ABSCHNITT 10 — SPEISEKARTE: KATEGORIEN & RENDER
   ========================================================= */

function getFoodCategories() {
  const set = new Set();
  foodItems.forEach((i) => {
    if (i.category) set.add(i.category);
  });
  return Array.from(set);
}

function renderFoodCategories() {
  if (!foodCategoryTabsEl || !foodTabsWrapper) return;

  foodCategoryTabsEl.innerHTML = "";
  const cats = getFoodCategories();
  foodTabsWrapper.style.display = "block";

  const allBtn = document.createElement("button");
  allBtn.className = "category-tab" + (activeFoodCategory === "Alle" ? " active" : "");
  allBtn.textContent = "Alle";
  allBtn.addEventListener("click", () => {
    activeFoodCategory = "Alle";
    renderFoodCategories();
    renderMenu();
  });
  foodCategoryTabsEl.appendChild(allBtn);

  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "category-tab" + (activeFoodCategory === cat ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      activeFoodCategory = cat;
      renderFoodCategories();
      renderMenu();
    });
    foodCategoryTabsEl.appendChild(btn);
  });
}

function renderMenu() {
  if (!menuListEl) return;
  menuListEl.innerHTML = "";

  let items = foodItems;

  if (activeFoodCategory !== "Alle") items = items.filter((i) => i.category === activeFoodCategory);

  if (searchTerm) {
    const q = searchTerm;
    items = items.filter((i) => {
      const text = `${i.name} ${i.description} ${i.longDescription}`.toLowerCase();
      return text.includes(q);
    });
  }

  if (!items.length) {
    menuListEl.innerHTML = "<p class='info'>Keine Produkte.</p>";
    return;
  }

  const frag = document.createDocumentFragment();

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "menu-item";

    if (item.imageUrl) {
      const img = document.createElement("img");
      img.src = item.imageUrl;
      img.alt = item.name;
      img.className = "menu-item-image";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.onerror = () => img.remove();
      div.appendChild(img);
    }

    const header = document.createElement("div");
    header.className = "menu-item-header";

    const nameEl = document.createElement("div");
    nameEl.className = "menu-item-name";
    nameEl.textContent = item.name;

    const priceEl = document.createElement("div");
    priceEl.className = "menu-item-price";
    priceEl.textContent = (Number(item.price) || 0).toFixed(2) + " €";

    header.appendChild(nameEl);
    header.appendChild(priceEl);
    div.appendChild(header);

    const descEl = document.createElement("div");
    descEl.className = "menu-item-desc";
    descEl.textContent = item.description || "";
    div.appendChild(descEl);

    const socialRow = document.createElement("div");
    socialRow.className = "menu-item-social";

    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.className =
      "social-btn social-btn-like" + (isItemLiked(item.id) ? " social-btn-like--active" : "");
    likeBtn.innerHTML = `
      <span class="social-icon">❤️</span>
      <span class="social-count">${item.likeCount || 0}</span>
    `;
    likeBtn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      await toggleItemLike(item);
    });

    const commentBtn = document.createElement("button");
    commentBtn.type = "button";
    commentBtn.className = "social-btn social-btn-comment";
    commentBtn.innerHTML = `
      <span class="social-icon">💬</span>
      <span class="social-count">${item.commentCount || 0}</span>
    `;
    commentBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      navTo("detajet.html", { item: item.id });
    });

    socialRow.appendChild(likeBtn);
    socialRow.appendChild(commentBtn);
    div.appendChild(socialRow);

    const actions = document.createElement("div");
    actions.className = "menu-item-actions";

    const detailsBtn = document.createElement("button");
    detailsBtn.className = "btn btn-dark";
    detailsBtn.textContent = "Detajet";
    detailsBtn.addEventListener("click", () => navTo("detajet.html", { item: item.id }));

    const plusBtn = document.createElement("button");
    plusBtn.className = "btn btn-primary";
    plusBtn.textContent = "Hinzufügen";
    plusBtn.addEventListener("click", () => changeCart(item, 1));

    actions.appendChild(detailsBtn);
    actions.appendChild(plusBtn);
    div.appendChild(actions);

    frag.appendChild(div);
  });

  menuListEl.appendChild(frag);
}

/* =========================================================
   ABSCHNITT 11 — LIKES: FIRESTORE UPDATE (mit Rollback)
   ========================================================= */

async function toggleItemLike(item, likeWrapEl = null) {
  const likedBefore = isItemLiked(item.id);
  const likedAfter = !likedBefore;

  // optimistic
  setItemLiked(item.id, likedAfter);

  const modelItem = allMenuItems.find((i) => i.id === item.id);
  const beforeCount = Number(modelItem?.likeCount || item.likeCount || 0);

  if (modelItem) {
    modelItem.likeCount = Math.max(0, beforeCount + (likedAfter ? 1 : -1));
    item.likeCount = modelItem.likeCount;
  } else {
    item.likeCount = Math.max(0, beforeCount + (likedAfter ? 1 : -1));
  }

  if (likeWrapEl) {
    likeWrapEl.classList.remove("is-animating");
    void likeWrapEl.offsetWidth;
    likeWrapEl.classList.add("is-animating");

    if (likedAfter) likeWrapEl.classList.add("is-liked");
    else likeWrapEl.classList.remove("is-liked");

    const countEl = likeWrapEl.querySelector(".like-count");
    if (countEl) countEl.textContent = String(item.likeCount || 0);

    setTimeout(() => likeWrapEl.classList.remove("is-animating"), 280);
  }

  try {
    const itemRef = doc(db, "restaurants", restaurantId, "menuItems", item.id);
    await updateDoc(itemRef, { likeCount: increment(likedAfter ? 1 : -1) });
  } catch (err) {
    console.error(err);
    setItemLiked(item.id, likedBefore);

    if (modelItem) modelItem.likeCount = beforeCount;
    item.likeCount = beforeCount;

    if (likeWrapEl) {
      if (likedBefore) likeWrapEl.classList.add("is-liked");
      else likeWrapEl.classList.remove("is-liked");

      const countEl = likeWrapEl.querySelector(".like-count");
      if (countEl) countEl.textContent = String(beforeCount);
    }
  }

  renderMenu();
  renderDrinks();
}

/* =========================================================
   ABSCHNITT 12 — WARENKORB (FAB + BADGE)
   ========================================================= */

function updateCartBadge() {
  if (!cartBadgeEl || !cartFab) return;

  const totalQty = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  if (totalQty > 0) {
    cartBadgeEl.textContent = String(totalQty);
    cartBadgeEl.style.display = "flex";
    cartFab.classList.add("visible", "cart-fab--has-items");
    if (cartFabLabel) {
      cartFabLabel.textContent = "Shporta";
      cartFabLabel.style.display = "block";
    }
  } else {
    cartBadgeEl.style.display = "none";
    cartFab.classList.remove("visible", "cart-fab--has-items");
    if (cartFabLabel) cartFabLabel.style.display = "none";
  }
}

function renderCart() {
  updateCartBadge();
  saveCartToStorage();
}

function changeCart(item, delta) {
  const d = Number(delta) || 0;
  if (!item || !item.id || d === 0) return;

  const index = cart.findIndex((c) => c.id === item.id);

  if (index === -1 && d > 0) {
    cart.push({ id: item.id, name: item.name, price: Number(item.price) || 0, qty: d });
  } else if (index >= 0) {
    cart[index].qty = (Number(cart[index].qty) || 0) + d;
    if (cart[index].qty <= 0) cart.splice(index, 1);
  }

  renderCart();
}

/* =========================================================
   ABSCHNITT 13 — EVENTS / UI HANDLERS
   ========================================================= */

if (searchInput) {
  searchInput.addEventListener("input", () => {
    searchTerm = (searchInput.value || "").trim().toLowerCase();
    renderMenu();
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
  renderCart();
});

/* =========================================================
   ABSCHNITT 14 — INIT
   ========================================================= */

cart = loadCartFromStorage();
renderCart();
loadRestaurantAndMenu();
