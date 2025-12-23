// apps/menyra-restaurants/guest/_shared/guest-core.js
// =========================================================
// MENYRA System 1 – Guest App (Karte + Detajet + Porosia)
// Ziel: 1 Core-Logik für alle 3 Seiten (Karte/Detajet/Porosia), extrem wenige Reads.
// Jede Seite hat trotzdem eigene JS-Datei (Bootstraps).
// =========================================================
//
// PAGE-DETECTION:
// - Karte:   #menuList vorhanden
// - Detajet: #detailProductCard vorhanden
// - Porosia: #porosiaItems vorhanden
//
// COST-STRATEGIE (Reads):
// 1) Prefer: restaurants/{r}/public/meta   (1 doc)
// 2) Prefer: restaurants/{r}/public/menu   (1 doc, enthält items[])
// 3) Prefer: restaurants/{r}/public/offers (1 doc)
// Fallback (teuer): menuItems/offers Subcollection nur wenn public/* fehlt.
// Zusätzlich: localStorage Cache (TTL), damit Reloads 0 Reads sind.
//
// =========================================================

import { db } from "/shared/firebase-config.js";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// =========================================================
// ABSCHNITT 1: PARAMS / PAGE DETECTION
// =========================================================

const params = new URLSearchParams(window.location.search);
const restaurantId = params.get("r") || "test-restaurant";
const tableId = params.get("t") || "T1";
const itemId = params.get("item");

const isKarte = !!document.getElementById("menuList");
const isDetajet = !!document.getElementById("detailProductCard");
const isPorosia = !!document.getElementById("porosiaItems");

// =========================================================
// ABSCHNITT 2: CACHE HELPERS (localStorage TTL)
// =========================================================

function now() { return Date.now(); }

function cacheKey(prefix) {
  return `menyra_cache_${prefix}_${restaurantId}`;
}

function cacheGet(key, ttlMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.at !== "number") return null;
    if (ttlMs && now() - parsed.at > ttlMs) return null;
    return parsed.v ?? null;
  } catch {
    return null;
  }
}

function cacheSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: now(), v: value }));
  } catch {}
}

// =========================================================
// ABSCHNITT 3: CART (localStorage) – shared across pages
// =========================================================

function getCartStorageKey() {
  return `menyra_cart_${restaurantId}_${tableId}`;
}

function loadCart() {
  try {
    const raw = localStorage.getItem(getCartStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 0,
      }))
      .filter((i) => i.qty > 0);
  } catch {
    return [];
  }
}

function saveCart(cart) {
  try { localStorage.setItem(getCartStorageKey(), JSON.stringify(cart)); } catch {}
}

function updateFab(cart) {
  const cartFab = document.getElementById("cartFab");
  const cartFabLabel = document.getElementById("cartFabLabel");
  const cartBadgeEl = document.getElementById("cartBadge");
  if (!cartFab || !cartBadgeEl) return;

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
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

function changeCart(cart, item, deltaQty) {
  const index = cart.findIndex((c) => c.id === item.id);
  if (index === -1 && deltaQty > 0) {
    cart.push({ id: item.id, name: item.name, price: item.price, qty: deltaQty });
  } else if (index >= 0) {
    cart[index].qty += deltaQty;
    if (cart[index].qty <= 0) cart.splice(index, 1);
  }
  saveCart(cart);
  updateFab(cart);
  return cart;
}

// =========================================================
// ABSCHNITT 4: NAV HELPERS (robust relative navigation)
// =========================================================

function navToKarte() {
  const url = new URL("../karte/index.html", window.location.href);
  url.searchParams.set("r", restaurantId);
  url.searchParams.set("t", tableId);
  window.location.href = url.toString();
}

function navToPorosia() {
  const url = new URL("../porosia/index.html", window.location.href);
  url.searchParams.set("r", restaurantId);
  url.searchParams.set("t", tableId);
  window.location.href = url.toString();
}

function navToDetajet(itemId) {
  const url = new URL("../detajet/index.html", window.location.href);
  url.searchParams.set("r", restaurantId);
  url.searchParams.set("t", tableId);
  url.searchParams.set("item", itemId);
  window.location.href = url.toString();
}

// =========================================================
// ABSCHNITT 5: Firestore Reads (Cache-first)
// =========================================================

const TTL_REST_MS = 24 * 60 * 60 * 1000; // 24h
const TTL_MENU_MS = 5 * 60 * 1000;      // 5min
const TTL_OFFERS_MS = 2 * 60 * 1000;    // 2min

async function loadRestaurantMeta() {
  const key = cacheKey("restmeta");
  const cached = cacheGet(key, TTL_REST_MS);
  if (cached) return cached;

  // Prefer public/meta (1 read)
  try {
    const metaRef = doc(db, "restaurants", restaurantId, "public", "meta");
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const data = metaSnap.data() || {};
      cacheSet(key, data);
      return data;
    }
  } catch {}

  // Fallback: restaurants/{id} (1 read)
  const restRef = doc(db, "restaurants", restaurantId);
  const restSnap = await getDoc(restRef);
  if (restSnap.exists()) {
    const data = restSnap.data() || {};
    cacheSet(key, data);
    return data;
  }

  return null;
}

function normalizeMenuItem(raw, fallbackId) {
  const d = raw || {};
  const id = d.id || d._id || d.menuItemId || fallbackId || (crypto.randomUUID?.() || String(Math.random()).slice(2));
  const name = d.name || d.title || d.productName || "Produkt";
  const category = d.category || d.cat || d.categoryName || d.groupName || d.sectionName || "Sonstiges";
  const description = d.description || d.shortDesc || d.desc || "";
  const longDescription = d.longDescription || d.longDesc || d.details || "";
  const price = (d.price === "" || d.price === null || d.price === undefined) ? "" : (Number(d.price) || 0);
  const available = d.available !== false;
  const imageUrl = d.imageUrl || d.photoUrl || d.image || d.img || null;
  const imageUrls = Array.isArray(d.imageUrls) ? d.imageUrls : (Array.isArray(d.images) ? d.images : []);
  const type = d.type || d.menuType || d.kind || d.group || d.section || (d.isDrink ? "drink" : null);

  return {
    id,
    name,
    category,
    description,
    longDescription,
    price,
    available,
    imageUrl,
    imageUrls,
    type,
    likeCount: d.likeCount || 0,
    commentCount: d.commentCount || 0,
    ratingCount: d.ratingCount || 0,
    ratingSum: d.ratingSum || 0,
  };
}

async function loadMenuItems() {
  const key = cacheKey("menu");
  const cached = cacheGet(key, TTL_MENU_MS);
  if (cached && Array.isArray(cached)) return cached;

  // Prefer public/menu (1 read)
  try {
    const ref = doc(db, "restaurants", restaurantId, "public", "menu");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() || {};
      const arr = Array.isArray(data.items) ? data.items : [];
      const items = arr.map((x, idx) => normalizeMenuItem(x, x?.id || `pub_${idx}`))
        .filter((i) => i.available !== false);
      if (items.length) {
        cacheSet(key, items);
        return items;
      }
    }
  } catch (err) {
    console.warn("public/menu read failed:", err?.message || err);
  }

  // Fallback: restaurants/{id}/menuItems (legacy, more reads)
  try {
    const colRef = collection(db, "restaurants", restaurantId, "menuItems");
    const snap = await getDocs(colRef);
    const items = snap.docs
      .map((docu) => normalizeMenuItem(docu.data(), docu.id))
      .filter((i) => i.available !== false);

    cacheSet(key, items);
    return items;
  } catch (err) {
    console.error(err);
    return [];
  }
}


function normalizeOffer(raw, fallbackId) {
  const d = raw || {};
  const id = d.id || d._id || fallbackId || (crypto.randomUUID?.() || String(Math.random()).slice(2));
  return {
    id,
    title: d.title || d.name || "Sot në fokus",
    price: d.price ?? "",
    desc: d.desc || d.description || "",
    imageUrl: d.imageUrl || d.image || d.photoUrl || null,
    active: d.active !== false,
    menuItemId: d.menuItemId || d.menuItem || "",
  };
}

async function loadOffers() {
  const key = cacheKey("offers");
  const cached = cacheGet(key, TTL_OFFERS_MS);
  if (cached && Array.isArray(cached)) return cached;

  // Prefer public/offers (1 read)
  try {
    const ref = doc(db, "restaurants", restaurantId, "public", "offers");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() || {};
      const arr = Array.isArray(data.items) ? data.items : [];
      const offers = arr.map((x, idx) => normalizeOffer(x, x?.id || `pub_${idx}`))
        .filter(o => o.active !== false);
      if (offers.length) {
        cacheSet(key, offers);
        return offers;
      }
    }
  } catch (err) {
    console.warn("public/offers read failed:", err?.message || err);
  }

  // Fallback: restaurants/{id}/offers (legacy)
  try {
    const colRef = collection(db, "restaurants", restaurantId, "offers");
    const snap = await getDocs(colRef);
    const offers = snap.docs.map(d => normalizeOffer(d.data(), d.id)).filter(o => o.active !== false);
    cacheSet(key, offers);
    return offers;
  } catch (err) {
    console.error(err);
    return [];
  }
}


// =========================================================
// ABSCHNITT 6: Shared Render Helpers
// =========================================================

function foldText(s){
  try{
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }catch(_){
    return String(s || "").toLowerCase();
  }
}

function inferTypeForItem(item) {
  const explicit = item?.type ?? item?.menuType ?? item?.kind ?? item?.group ?? item?.section ?? null;
  if (explicit) {
    const t = foldText(explicit).trim();
    if (t === "drink" || t === "drinks" || t === "beverage" || t === "getranke" || t === "getraenke") return "drink";
    if (t === "food" || t === "speise" || t === "speisen") return "food";
  }

  if (item?.isDrink === true || item?.drink === true) return "drink";

  const cat = item?.category ?? item?.cat ?? item?.categoryName ?? item?.groupName ?? item?.sectionName ?? item?.tab ?? "";
  const name = item?.name ?? item?.title ?? "";
  const desc = item?.description ?? item?.shortDesc ?? "";
  const hay = foldText(`${cat} ${name} ${desc}`);

  const drinksWords = [
    "getranke","getraenke","drinks","drink","beverage","beverages",
    "pije","pijet","gazuze","gazuara","alkool","alkoolike","alkoolik",
    "kafe","cafe","coffee","espresso","cappuccino","latte","macchiato","mocha",
    "caj","çaj","tea",
    "uje","uj","water","mineral","sparkling","still",
    "leng","lengje","juice","sok","smoothie",
    "cola","coca","pepsi","fanta","sprite","tonic","soda","icetea","iced tea",
    "energy","energjike","red bull","monster",
    "birra","beer","bier","lager","pils",
    "vere","ver","verë","wine","wein","prosecco","champagne",
    "koktej","cocktail","mojito","margarita","spritz",
    "vodka","whiskey","whisky","gin","rum","tequila","raki","rakia","brandy","cognac","shot","likor","liqueur"
  ];

  if (drinksWords.some(w => hay.includes(w))) return "drink";
  return "food";
}


function money(v) {
  const n = Number(v) || 0;
  return n.toFixed(2) + " €";
}

// =========================================================
// ABSCHNITT 7: PAGE – KARTE
// =========================================================

export async function initKarte() {
  // DOM
  const restaurantLogoEl = document.getElementById("restaurantLogo");
  const restaurantNameEl = document.getElementById("restaurantName");
  const restaurantMetaEl = document.getElementById("restaurantMeta");

  const drinksSection = document.getElementById("drinksSection");
  const drinksTabsWrapper = document.getElementById("drinksTabsWrapper");
  const drinksTabsEl = document.getElementById("drinksTabs");
  const drinksListEl = document.getElementById("drinksList");

  const foodTabsWrapper = document.getElementById("foodTabsWrapper");
  const foodCategoryTabsEl = document.getElementById("foodCategoryTabs");
  const menuListEl = document.getElementById("menuList");

  const offersSection = document.getElementById("offersSection");
  const offersSliderEl = document.getElementById("offersSlider");
  const offersDotsEl = document.getElementById("offersDots");

  const searchInput = document.getElementById("searchInput");
  const cartFab = document.getElementById("cartFab");

  // State
  let cart = loadCart();
  updateFab(cart);

  let allMenuItems = [];
  let drinksItems = [];
  let foodItems = [];
  let activeFoodCategory = "Alle";
  let activeDrinksCategory = null;
  let searchTerm = "";

  // Offers Slider State
  let offersSlides = [];
  let offersCurrentIndex = 0;
  let offersTimer = null;

  function clearOffersTimer() {
    if (offersTimer) { clearInterval(offersTimer); offersTimer = null; }
  }

  function goToOffer(index) {
    if (!offersSlides.length || !offersSliderEl) return;
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

  function renderOffersSlider(offers) {
    if (!offersSection || !offersSliderEl || !offersDotsEl) return;

    // Normalize
    const normalized = Array.isArray(offers) ? offers : [];
    let list = normalized;

    // Wenn noch keine Offers existieren: Fallback aus Menü-Items (0 extra Reads)
    // => damit "Sot ne fokus" trotzdem immer sichtbar ist.
    if (!list.length) {
      // Always visible placeholder
      list = [{ id:"placeholder", title:"Sot në fokus", price:"", desc:"Aktualisht keine Angebote.", imageUrl:null, active:true, menuItemId:"" }];

      const fallback = (Array.isArray(allMenuItems) ? allMenuItems : [])
        .filter((m) => m && (m.imageUrl || m.image || m.photoUrl))
        .slice(0, 6)
        .map((m) => ({
          id: "focus-" + m.id,
          menuItemId: m.id,
          title: m.name,
          description: m.description || m.shortDesc || "",
          price: typeof m.price === "number" ? m.price : m.price,
          imageUrl: m.imageUrl || m.image || m.photoUrl,
          _fallback: true,
        }));
      if (fallback.length) list = fallback;
    }

    if (!list.length) {
      // Always visible placeholder
      list = [{ id:"placeholder", title:"Sot në fokus", price:"", desc:"Aktualisht keine Angebote.", imageUrl:null, active:true, menuItemId:"" }];

      offersSection.style.display = "none";
      clearOffersTimer();
      return;
    }

    offersSliderEl.innerHTML = "";
    offersDotsEl.innerHTML = "";
    offersSection.style.display = "block";

    const dotsFrag = document.createDocumentFragment();
    const slidesFrag = document.createDocumentFragment();

    list.forEach((offer, index) => {
      const linkedMenuItem = offer.menuItemId
        ? (allMenuItems.find((m) => m.id === offer.menuItemId) || null)
        : null;

      const title = offer.title || (linkedMenuItem ? linkedMenuItem.name : "Angebot");
      const description = offer.description || (linkedMenuItem ? linkedMenuItem.description : "");
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
        img.loading = "lazy";
        img.className = "offer-image";
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
      priceEl.textContent = typeof price === "number" ? money(price) : "";

      header.appendChild(titleEl);
      header.appendChild(priceEl);
      slide.appendChild(header);

      const descEl = document.createElement("div");
      descEl.className = "offer-desc";
      descEl.textContent = description || "";
      slide.appendChild(descEl);

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

        minusBtn.addEventListener("click", () => {
          cart = changeCart(cart, targetItem, -1);
        });
        plusBtn.addEventListener("click", () => {
          cart = changeCart(cart, targetItem, 1);
        });

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
    startOffersAutoSlide();

    // Scroll handler: update dot state
    let scrollTick = false;
    offersSliderEl.addEventListener("scroll", () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        scrollTick = false;
        if (!offersSlides.length) return;
        const center = offersSliderEl.scrollLeft + offersSliderEl.clientWidth / 2;
        let bestIndex = 0;
        let bestDist = Infinity;
        offersSlides.forEach((slide, i) => {
          const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          const dist = Math.abs(slideCenter - center);
          if (dist < bestDist) { bestDist = dist; bestIndex = i; }
        });
        offersCurrentIndex = bestIndex;
        const dots = offersDotsEl.querySelectorAll(".offers-dot");
        dots.forEach((d, i) => d.classList.toggle("active", i === bestIndex));
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearOffersTimer();
      else startOffersAutoSlide();
    });
  }

  // Drinks + Food Tabs
  function getDrinkCategories() {
    const set = new Set();
    drinksItems.forEach((i) => i.category && set.add(i.category));
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
    if (activeDrinksCategory) {
      items = drinksItems.filter((i) => i.category === activeDrinksCategory);
    }

    if (!items.length) {
      drinksListEl.innerHTML = "<p class='info'>Keine Getränke.</p>";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "drink-item";
      card.dataset.itemId = item.id;

      const topbar = document.createElement("div");
      topbar.className = "drink-topbar";

      // Like local-only visual (no reads)
      const liked = localStorage.getItem(`menyra_like_${restaurantId}_${item.id}`) === "1";

      const likeWrap = document.createElement("div");
      likeWrap.className = "like-wrap" + (liked ? " is-liked" : "");
      likeWrap.dataset.itemId = item.id;

      const likeBtn = document.createElement("button");
      likeBtn.type = "button";
      likeBtn.className = "icon-circle";
      likeBtn.setAttribute("aria-label", "Like");

      const iconInner = document.createElement("span");
      iconInner.className = "icon-circle__inner";
      iconInner.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path class="heart-path"
            d="M12.001 4.529c2.349-2.532 6.533-2.036 8.426.758 1.222 1.79 1.347 4.582-.835 7.086-1.803 2.08-4.822 4.403-7.296 5.876a1.25 1.25 0 0 1-1.292 0c-2.474-1.473-5.493-3.797-7.296-5.876-2.182-2.504-2.057-5.296-.835-7.086 1.893-2.794 6.077-3.29 8.428-.758z" />
        </svg>`;
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
        countSpan.textContent = String(item.likeCount || 0);
      });

      if (item.imageUrl) {
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.name;
        img.loading = "lazy";
        img.className = "drink-image";
        card.appendChild(img);
      }

      const header = document.createElement("div");
      header.className = "drink-header";

      const nameEl = document.createElement("div");
      nameEl.className = "drink-name";
      nameEl.textContent = item.name;

      const priceEl = document.createElement("div");
      priceEl.className = "drink-price";
      priceEl.textContent = money(item.price);

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
        cart = changeCart(cart, item, currentQty);
      });

      footer.appendChild(qtyControl);
      footer.appendChild(addBtn);
      card.appendChild(footer);

      drinksListEl.appendChild(card);
    });
  }

  function getFoodCategories() {
    const set = new Set();
    foodItems.forEach((i) => i.category && set.add(i.category));
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
    menuListEl.innerHTML = "";

    let items = foodItems;

    if (activeFoodCategory !== "Alle") {
      items = items.filter((i) => i.category === activeFoodCategory);
    }

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

    items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "menu-item";

      if (item.imageUrl) {
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.name;
        img.className = "menu-item-image";
        img.loading = "lazy";
        div.appendChild(img);
      }

      const header = document.createElement("div");
      header.className = "menu-item-header";

      const nameEl = document.createElement("div");
      nameEl.className = "menu-item-name";
      nameEl.textContent = item.name;

      const priceEl = document.createElement("div");
      priceEl.className = "menu-item-price";
      priceEl.textContent = money(item.price);

      header.appendChild(nameEl);
      header.appendChild(priceEl);
      div.appendChild(header);

      const descEl = document.createElement("div");
      descEl.className = "menu-item-desc";
      descEl.textContent = item.description || "";
      div.appendChild(descEl);

      const socialRow = document.createElement("div");
      socialRow.className = "menu-item-social";

      const liked = localStorage.getItem(`menyra_like_${restaurantId}_${item.id}`) === "1";

      const likeBtn = document.createElement("button");
      likeBtn.type = "button";
      likeBtn.className = "social-btn social-btn-like" + (liked ? " social-btn-like--active" : "");
      likeBtn.innerHTML = `
        <span class="social-icon">❤️</span>
        <span class="social-count">${item.likeCount || 0}</span>
      `;
      likeBtn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        await toggleItemLike(item);
        renderMenu();
        renderDrinks();
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
        navToDetajet(item.id);
      });

      socialRow.appendChild(likeBtn);
      socialRow.appendChild(commentBtn);
      div.appendChild(socialRow);

      const actions = document.createElement("div");
      actions.className = "menu-item-actions";

      const detailsBtn = document.createElement("button");
      detailsBtn.className = "btn btn-dark";
      detailsBtn.textContent = "Detajet";
      detailsBtn.addEventListener("click", () => navToDetajet(item.id));

      const plusBtn = document.createElement("button");
      plusBtn.className = "btn btn-primary";
      plusBtn.textContent = "Hinzufügen";
      plusBtn.addEventListener("click", () => {
        cart = changeCart(cart, item, 1);
      });

      actions.appendChild(detailsBtn);
      actions.appendChild(plusBtn);
      div.appendChild(actions);

      menuListEl.appendChild(div);
    });
  }

  async function toggleItemLike(item, likeWrapEl = null) {
    const key = `menyra_like_${restaurantId}_${item.id}`;
    const likedBefore = localStorage.getItem(key) === "1";
    const likedAfter = !likedBefore;

    if (likedAfter) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);

    // optimistic count
    item.likeCount = Number(item.likeCount || 0) + (likedAfter ? 1 : -1);
    if (item.likeCount < 0) item.likeCount = 0;

    if (likeWrapEl) {
      likeWrapEl.classList.remove("is-animating");
      void likeWrapEl.offsetWidth;
      likeWrapEl.classList.add("is-animating");
      likeWrapEl.classList.toggle("is-liked", likedAfter);
      const countEl = likeWrapEl.querySelector(".like-count");
      if (countEl) countEl.textContent = String(item.likeCount || 0);
      setTimeout(() => likeWrapEl.classList.remove("is-animating"), 280);
    }

    // Write only (no read). Works if you still have menuItems docs.
    try {
      const itemRef = doc(db, "restaurants", restaurantId, "menuItems", item.id);
      await updateDoc(itemRef, { likeCount: increment(likedAfter ? 1 : -1) });
    } catch (err) {
      // If you're on public/menu only, this may fail (no menuItems doc).
      // Still ok: like is saved locally for UX.
      console.warn("Like write skipped:", err?.message || err);
    }
  }

  // Header info (1 read max; cached 24h)
  const rest = await loadRestaurantMeta();
  if (!rest) {
    restaurantNameEl.textContent = "Lokal nicht gefunden";
    restaurantMetaEl.textContent = `ID: ${restaurantId}`;
    menuListEl.innerHTML = "<p class='info'>Bitte Personal informieren.</p>";
    if (offersSection) offersSection.style.display = "none";
    if (drinksSection) drinksSection.style.display = "none";
    if (drinksTabsWrapper) drinksTabsWrapper.style.display = "none";
    if (foodTabsWrapper) foodTabsWrapper.style.display = "none";
    return;
  }

  restaurantNameEl.textContent = rest.restaurantName || rest.name || "Unbenanntes Lokal";
  restaurantMetaEl.textContent = "Mirësevini në menynë digjitale";

  if (rest.logoUrl && restaurantLogoEl) {
    restaurantLogoEl.src = rest.logoUrl;
    restaurantLogoEl.style.display = "block";
  } else if (restaurantLogoEl) {
    restaurantLogoEl.style.display = "none";
  }

  // Load menu (prefer 1 read)
  const items = await loadMenuItems();
  allMenuItems = (items || []).map((i) => ({ ...i, type: inferTypeForItem(i) }));

  drinksItems = allMenuItems.filter((i) => i.type === "drink" && i.available !== false);
  foodItems = allMenuItems.filter((i) => i.type === "food" && i.available !== false);

  renderDrinksTabs();
  renderDrinks();
  renderFoodCategories();
  renderMenu();

  // Load offers (prefer 1 read)
  const offers = await loadOffers();
  renderOffersSlider(Array.isArray(offers) ? offers : []);

  // Search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = (searchInput.value || "").trim().toLowerCase();
      renderMenu();
    });
  }

  // FAB → Porosia
  if (cartFab) {
    cartFab.addEventListener("click", () => {
      if (!cart.length) return;
      navToPorosia();
    });
  }

  // BFCache – reload cart state only
  window.addEventListener("pageshow", () => {
    cart = loadCart();
    updateFab(cart);
  });
}

// =========================================================
// ABSCHNITT 8: PAGE – DETAJET
// =========================================================

export async function initDetajet() {
  // DOM
  const backBtn = document.getElementById("backBtn");
  const detailTableBadge = document.getElementById("detailTableBadge");

  const restNameEl = document.getElementById("detailRestaurantName");
  const restMetaEl = document.getElementById("detailRestaurantMeta");
  const restLogoEl = document.getElementById("detailRestaurantLogo");

  const detailNameEl = document.getElementById("detailName");
  const detailPriceEl = document.getElementById("detailPrice");
  const detailLongDescEl = document.getElementById("detailLongDesc");
  const detailZutatenEl = document.getElementById("detailZutaten");

  const detailQtyMinusBtn = document.getElementById("detailQtyMinus");
  const detailQtyPlusBtn = document.getElementById("detailQtyPlus");
  const detailQtyValueEl = document.getElementById("detailQtyValue");
  const detailAddBtn = document.getElementById("detailAddBtn");
  const detailViewCartBtn = document.getElementById("detailViewCartBtn");

  // Slider DOM
  const sliderWrapper = document.getElementById("detailSliderWrapper");
  const sliderViewport = document.getElementById("detailSliderViewport");
  const sliderTrack = document.getElementById("detailSliderTrack");
  const sliderPrevBtn = document.getElementById("detailSliderPrev");
  const sliderNextBtn = document.getElementById("detailSliderNext");

  // State
  let cart = loadCart();
  updateFab(cart);

  let currentItem = null;
  let currentQty = 1;

  let sliderImages = [];
  let sliderIndex = 0;

  function updateSliderPosition() {
    if (!sliderTrack || !sliderViewport) return;
    const viewportWidth = sliderViewport.getBoundingClientRect().width;
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

    sliderImages.forEach((url, idx) => {
      const slide = document.createElement("div");
      slide.className = "detail-slide";

      const img = document.createElement("img");
      img.src = url;
      img.alt = currentItem ? currentItem.name : "Produktbild";
      img.loading = idx === 0 ? "eager" : "lazy";

      slide.appendChild(img);
      sliderTrack.appendChild(slide);
    });

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
      if (deltaX > 50) goToSlide(sliderIndex - 1);
      else if (deltaX < -50) goToSlide(sliderIndex + 1);
      isDown = false; startX = 0; deltaX = 0;
    });
  }

  if (sliderPrevBtn) sliderPrevBtn.addEventListener("click", () => goToSlide(sliderIndex - 1));
  if (sliderNextBtn) sliderNextBtn.addEventListener("click", () => goToSlide(sliderIndex + 1));
  initSliderTouch();
  window.addEventListener("resize", updateSliderPosition);

  // Header
  if (detailTableBadge) detailTableBadge.textContent = `Tisch ${tableId}`;

  const rest = await loadRestaurantMeta();
  if (restNameEl) restNameEl.textContent = rest?.restaurantName || rest?.name || "Lokal";
  if (restMetaEl) restMetaEl.textContent = "Detajet e produktit";
  if (restLogoEl && rest?.logoUrl) { restLogoEl.src = rest.logoUrl; restLogoEl.style.display="block"; }

  // Load item (0 reads if cached menu exists)
  async function loadItem() {
    if (!itemId) {
      detailNameEl.textContent = "Produkt nicht gefunden";
      detailLongDescEl.textContent = "Keine ID in der URL.";
      return;
    }

    // Try cached menu first (0 reads)
    const cachedMenu = cacheGet(cacheKey("menu"), TTL_MENU_MS);
    if (Array.isArray(cachedMenu)) {
      const found = cachedMenu.find((i) => i && i.id === itemId);
      if (found) return normalizeItem(found);
    }

    // Read menu doc (1 read) and search
    const items = await loadMenuItems();
    const found = (items || []).find((i) => i && i.id === itemId);
    if (found) return normalizeItem(found);

    // Fallback: item doc (1 read)
    try {
      const itemRef = doc(db, "restaurants", restaurantId, "menuItems", itemId);
      const snap = await getDoc(itemRef);
      if (snap.exists()) return normalizeItem({ id: snap.id, ...(snap.data() || {}) });
    } catch {}

    return null;
  }

  function normalizeItem(d) {
    const gallery = Array.isArray(d.imageUrls) ? d.imageUrls.filter(Boolean) : [];
    if (!gallery.length && d.imageUrl) gallery.push(d.imageUrl);

    return {
      id: d.id,
      name: d.name || "Produkt",
      description: d.description || "",
      longDescription: d.longDescription || "",
      price: Number(d.price) || 0,
      imageUrl: d.imageUrl || null,
      imageUrls: gallery,
    };
  }

  currentItem = await loadItem();
  if (!currentItem) {
    detailNameEl.textContent = "Produkt nicht gefunden";
    detailLongDescEl.textContent = "Bitte Personal informieren.";
    return;
  }

  renderSliderImages(currentItem.imageUrls);
  detailNameEl.textContent = currentItem.name;
  detailPriceEl.textContent = money(currentItem.price);

  const longText = currentItem.longDescription || currentItem.description || "";
  detailLongDescEl.textContent = longText;
  detailZutatenEl.textContent = currentItem.description || "";

  currentQty = 1;
  detailQtyValueEl.textContent = String(currentQty);

  // Events
  if (backBtn) backBtn.addEventListener("click", () => navToKarte());
  detailQtyMinusBtn.addEventListener("click", () => {
    if (currentQty > 1) { currentQty -= 1; detailQtyValueEl.textContent = String(currentQty); }
  });
  detailQtyPlusBtn.addEventListener("click", () => {
    currentQty += 1; detailQtyValueEl.textContent = String(currentQty);
  });

  detailAddBtn.addEventListener("click", () => {
    if (!currentItem) return;
    cart = changeCart(cart, currentItem, currentQty);
  });

  detailViewCartBtn.addEventListener("click", () => {
    if (!cart.length) return;
    navToPorosia();
  });

  const cartFab = document.getElementById("cartFab");
  if (cartFab) cartFab.addEventListener("click", () => {
    if (!cart.length) return;
    navToPorosia();
  });

  window.addEventListener("pageshow", () => {
    cart = loadCart();
    updateFab(cart);
  });
}

// =========================================================
// ABSCHNITT 9: PAGE – POROSIA
// =========================================================

export async function initPorosia() {
  // DOM
  const restaurantNameEl = document.getElementById("porosiaRestaurantName");
  const tableLabelEl = document.getElementById("porosiaTableLabel");

  const itemsEl = document.getElementById("porosiaItems");
  const totalEl = document.getElementById("porosiaTotal");
  const noteEl = document.getElementById("porosiaNote");
  const clearBtn = document.getElementById("porosiaClearBtn");
  const sendBtn = document.getElementById("porosiaSendBtn");
  const statusEl = document.getElementById("porosiaStatus");
  const backBtn = document.getElementById("porosiaBackBtn");
  const cartFab = document.getElementById("cartFab");

  let cart = loadCart();
  updateFab(cart);

  // Header: cache-first (0 reads), else 1 read
  const cachedRest = cacheGet(cacheKey("restmeta"), TTL_REST_MS);
  if (cachedRest?.restaurantName) {
    restaurantNameEl.textContent = cachedRest.restaurantName;
  } else {
    const rest = await loadRestaurantMeta();
    restaurantNameEl.textContent = rest?.restaurantName || rest?.name || "Lokal";
  }
  tableLabelEl.textContent = `Tisch ${tableId}`;

  function renderCart() {
    itemsEl.innerHTML = "";
    let total = 0;

    if (!cart.length) {
      itemsEl.innerHTML = "<p class='info'>Nuk ke asnjë artikull në porosi.</p>";
      totalEl.textContent = "";
      updateFab(cart);
      saveCart(cart);
      return;
    }

    cart.forEach((item, idx) => {
      total += item.price * item.qty;

      const row = document.createElement("div");
      row.className = "cart-item-row";
      row.style.alignItems = "center";
      row.style.gap = "8px";

      const leftSpan = document.createElement("span");
      leftSpan.textContent = `${item.qty}× ${item.name}`;

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
      priceSpan.textContent = money(item.price * item.qty);

      rightWrap.appendChild(minusBtn);
      rightWrap.appendChild(plusBtn);
      rightWrap.appendChild(priceSpan);

      row.appendChild(leftSpan);
      row.appendChild(rightWrap);

      itemsEl.appendChild(row);
    });

    totalEl.textContent = `Summe: ${money(total)}`;
    updateFab(cart);
    saveCart(cart);
  }

  function changeCartQty(index, delta) {
    if (index < 0 || index >= cart.length) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    renderCart();
  }

  async function sendOrder() {
    statusEl.textContent = "";
    statusEl.className = "status-text";

    if (!cart.length) {
      statusEl.textContent = "Nuk ke asgjë në porosi.";
      statusEl.classList.add("status-err");
      return;
    }

    try {
      sendBtn.disabled = true;
      sendBtn.textContent = "Duke dërguar...";

      const ordersCol = collection(doc(db, "restaurants", restaurantId), "orders");

      const payload = {
        restaurantId,
        table: tableId,
        items: cart.map((c) => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
        note: noteEl.value || "",
        status: "new",
        createdAt: serverTimestamp(),
        source: "qr",
      };

      await addDoc(ordersCol, payload);

      cart = [];
      noteEl.value = "";
      renderCart();

      statusEl.textContent = "Porosia u dërgua. Faleminderit!";
      statusEl.classList.add("status-ok");
    } catch (err) {
      console.error(err);
      statusEl.textContent = "Gabim gjatë dërgimit: " + err.message;
      statusEl.classList.add("status-err");
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "Dërgo porosinë";
    }
  }

  // Events
  clearBtn.addEventListener("click", () => {
    cart = [];
    renderCart();
  });

  sendBtn.addEventListener("click", sendOrder);

  if (backBtn) backBtn.addEventListener("click", navToKarte);

  if (cartFab) cartFab.addEventListener("click", navToKarte);

  window.addEventListener("pageshow", () => {
    cart = loadCart();
    renderCart();
  });

  renderCart();
}

// =========================================================
// ABSCHNITT 10: INIT
// =========================================================

// =========================================================
// ABSCHNITT 10: BOOT (exported)
// =========================================================

export function bootCommon() {
  // Always update FAB once (safe)
  try { updateFab(loadCart()); } catch (_) {}
}
