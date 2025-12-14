/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */

import { db } from "../shared/firebase-config.js";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

/* =========================================================
   ABSCHNITT 0.5 — AUTH GATE (Owner)
   ========================================================= */

const firebaseAuth = getAuth();                 // <-- umbenannt (kein "auth" mehr)
setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {});

const params = new URLSearchParams(location.search);
const restaurantId = params.get("r") || "";

// Anti-Loop (pro Tab)
const OWNER_LOCK = "menyra_owner_gate_lock_v1";

function goLogin(reason = "") {
  // verhindert refresh-loop
  if (sessionStorage.getItem(OWNER_LOCK) === "1") return;
  sessionStorage.setItem(OWNER_LOCK, "1");

  const url = new URL("./login.html", location.href);
  if (restaurantId) url.searchParams.set("r", restaurantId);
  if (reason) url.searchParams.set("err", reason);
  location.replace(url.toString());
}

async function hasOwnerAccess(uid) {
  if (!restaurantId) return false;
  const snap = await getDoc(doc(db, "restaurants", restaurantId, "staff", uid));
  if (!snap.exists()) return false;
  const role = String((snap.data() || {}).role || "").toLowerCase();
  return role === "owner" || role === "admin" || role === "manager";
}

let __gateDone = false;

onAuthStateChanged(firebaseAuth, async (user) => {
  if (__gateDone) return;
  __gateDone = true;

  // wir sind im admin -> lock weg
  sessionStorage.removeItem(OWNER_LOCK);

  if (!restaurantId) return goLogin("missing_r");
  if (!user) return goLogin("signed_out");

  try {
    const ok = await hasOwnerAccess(user.uid);
    if (!ok) {
      try { await signOut(firebaseAuth); } catch {}
      return goLogin("no_access");
    }

    // ✅ Gate OK — ab hier läuft dein normaler Code
    window.__MENYRA_OWNER__ = { restaurantId, uid: user.uid };

  } catch (err) {
    console.error(err);
    try { await signOut(firebaseAuth); } catch {}
    return goLogin("gate_error");
  }
});


/* =========================================================
   ABSCHNITT 1 — DOM
   ========================================================= */


// Gate
const appGate = document.getElementById("appGate");
const appGateMsg = document.getElementById("appGateMsg");

// Header
const ownerUserLabel = document.getElementById("ownerUserLabel");
const ownerLogoutBtn = document.getElementById("ownerLogoutBtn");

// Editor & Listen
const menuEditorCard = document.getElementById("menuEditorCard");
const menuListCard = document.getElementById("menuListCard");
const ordersCard = document.getElementById("ordersCard");
const adminRestLabel = document.getElementById("adminRestLabel");

// Typ-Umschalter
const typeFoodBtn = document.getElementById("typeFoodBtn");
const typeDrinkBtn = document.getElementById("typeDrinkBtn");
const typeToggleButtons = document.querySelectorAll(".type-toggle-btn");

// Formular-Felder
const itemCategorySelect = document.getElementById("itemCategorySelect");
const itemCategoryCustomInput = document.getElementById("itemCategoryCustomInput");
const itemNameInput = document.getElementById("itemNameInput");
const itemLongDescInput = document.getElementById("itemLongDescInput");
const itemDescInput = document.getElementById("itemDescInput");
const itemPriceInput = document.getElementById("itemPriceInput");
const itemImagesInput = document.getElementById("itemImagesInput");
const itemSaveBtn = document.getElementById("itemSaveBtn");
const itemResetBtn = document.getElementById("itemResetBtn");
const adminItemStatus = document.getElementById("adminItemStatus");

// Listen-Ausgabe
const itemList = document.getElementById("itemList");
const adminOrdersList = document.getElementById("adminOrdersList");

/* =========================================================
   ABSCHNITT 2 — STATE
   ========================================================= */

const auth = getAuth();
let currentUser = null;
let currentRestaurantId = null;
let currentItems = [];
let currentEditItemId = null;
let currentProductType = "food";

/* =========================================================
   ABSCHNITT 3 — GATE + STATUS
   ========================================================= */

function showGate(msg = "Checking session…") {
  if (appGate) appGate.style.display = "flex";
  if (appGateMsg) appGateMsg.textContent = msg;
}
function hideGate() {
  if (appGate) appGate.style.display = "none";
}

function setStatus(el, text, kind) {
  if (!el) return;
  el.textContent = text || "";
  el.className = "status-text";
  if (kind === "ok") el.classList.add("status-ok");
  if (kind === "err") el.classList.add("status-err");
}

/* =========================================================
   ABSCHNITT 4 — SESSION (Restaurant)
   ========================================================= */

function saveOwnerSession(restaurantId) {
  localStorage.setItem("menyra_owner_restaurantId", restaurantId);
}
function loadOwnerSession() {
  return localStorage.getItem("menyra_owner_restaurantId");
}
function clearOwnerSession() {
  localStorage.removeItem("menyra_owner_restaurantId");
}

async function resolveRestaurantIdForUser(user) {
  // 1) URL ?r=...
  const p = new URLSearchParams(window.location.search);
  const ridFromUrl = p.get("r");
  if (ridFromUrl) return ridFromUrl;

  // 2) alte Session
  const ridFromSession = loadOwnerSession();
  if (ridFromSession) return ridFromSession;

  // 3) users/{uid} mit restaurantId
  try {
    const uSnap = await getDoc(doc(db, "users", user.uid));
    if (uSnap.exists()) {
      const u = uSnap.data() || {};
      const rid = u.restaurantId || u.restaurant || u.assignedRestaurantId;
      if (rid) return rid;
    }
  } catch {}

  // 4) restaurants where ownerUid == uid
  try {
    const q1 = query(
      collection(db, "restaurants"),
      where("ownerUid", "==", user.uid),
      limit(1)
    );
    const s1 = await getDocs(q1);
    if (!s1.empty) return s1.docs[0].id;
  } catch {}

  // 5) restaurants where ownerEmail == email
  try {
    if (user.email) {
      const q2 = query(
        collection(db, "restaurants"),
        where("ownerEmail", "==", user.email),
        limit(1)
      );
      const s2 = await getDocs(q2);
      if (!s2.empty) return s2.docs[0].id;
    }
  } catch {}

  return null;
}


/* =========================================================
   ABSCHNITT 5 — LOGIN ROUTE
   ========================================================= */

function goLogin() {
  const loginUrl = new URL("./login.html", window.location.href);
  loginUrl.searchParams.set("next", window.location.pathname + window.location.search);
  location.replace(loginUrl.toString());
}

async function doLogout() {
  try { await signOut(auth); } catch {}
  clearOwnerSession();
  goLogin();
}

ownerLogoutBtn?.addEventListener("click", doLogout);

/* =========================================================
   ABSCHNITT 6 — AUTO: RestaurantId finden (NORMAL LOGIN FLOW)
   ========================================================= */

async function resolveRestaurantIdForOwner(user) {
  // 1) Session (fast, 0 reads)
  const ridSession = loadOwnerSession();
  if (ridSession) return ridSession;

  // 2) Mapping doc: owners/{uid} (NORMAL, 1 read)
  try {
    const snap = await getDoc(doc(db, "owners", user.uid));
    if (snap.exists()) {
      const d = snap.data() || {};
      if (d.restaurantId) return String(d.restaurantId);
    }
  } catch {}

  // 3) Fallback: restaurant has ownerUid / ownerEmail (Query = 1 read)
  try {
    const q1 = query(collection(db, "restaurants"), where("ownerUid", "==", user.uid), limit(1));
    const s1 = await getDocs(q1);
    if (!s1.empty) return s1.docs[0].id;
  } catch {}

  if (user.email) {
    try {
      const q2 = query(collection(db, "restaurants"), where("ownerEmail", "==", user.email), limit(1));
      const s2 = await getDocs(q2);
      if (!s2.empty) return s2.docs[0].id;
    } catch {}
  }

  return null;
}

/* =========================================================
   ABSCHNITT 7 — STANDARD-KATEGORIEN
   ========================================================= */

const defaultFoodCategories = [
  "Mengjesi","Supat","Paragjellat","Sandwich","Burger","Rizoto","Sallatat",
  "Pasta","Pizza","Tava","Mish Pule","Mishrat","Deti","Antipasta","Desert",
];

const defaultDrinkCategories = [
  "Kafe & Espresso","Cappuccino & Latte","Çaj i ngrohtë","Çaj i ftohtë","Ujë i thjeshtë",
  "Ujë i gazuar","Lëngje frutash","Pije të gazuara","Freskuese","Smoothie",
  "Milkshake","Birra","Verë e bardhë","Verë e kuqe","Rose","Koktej",
  "Pije alkoolike të forta","Energjike",
];

function fillCategorySelect() {
  const cats = currentProductType === "drink" ? defaultDrinkCategories : defaultFoodCategories;
  if (!itemCategorySelect) return;

  itemCategorySelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Kategorie wählen…";
  placeholder.disabled = true;
  placeholder.selected = true;
  itemCategorySelect.appendChild(placeholder);

  cats.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    itemCategorySelect.appendChild(opt);
  });
}

function setProductType(type) {
  if (type !== "food" && type !== "drink") return;
  currentProductType = type;
  typeToggleButtons.forEach((btn) => btn.classList.toggle("tab-btn-active", btn.dataset.type === type));
  fillCategorySelect();
}

/* =========================================================
   ABSCHNITT 8 — RESTAURANT ÖFFNEN (nur automatisch)
   ========================================================= */

async function openRestaurantById(rid) {
  const refRest = doc(db, "restaurants", rid);
  const snap = await getDoc(refRest);

  if (!snap.exists()) throw new Error("Restaurant nicht gefunden.");

  currentRestaurantId = rid;
  saveOwnerSession(rid);

  const data = snap.data() || {};
  if (adminRestLabel) adminRestLabel.textContent = data.restaurantName || rid;

  // UI an
  if (menuEditorCard) menuEditorCard.style.display = "block";
  if (menuListCard) menuListCard.style.display = "block";
  if (ordersCard) ordersCard.style.display = "block";

  await loadMenuItems();
  await loadTodayOrders();
}

/* =========================================================
   ABSCHNITT 9 — MENÜ LADEN & PUBLIC-MENU SYNC
   ========================================================= */

function inferTypeForItem(item) {
  if (item.type === "food" || item.type === "drink") return item.type;
  if (defaultDrinkCategories.includes(item.category)) return "drink";
  return "food";
}

function buildPublicMenuPayload(items) {
  const cleaned = (items || []).map((it) => {
    const type = inferTypeForItem(it);
    const imgs = Array.isArray(it.imageUrls) ? it.imageUrls : (it.imageUrl ? [it.imageUrl] : []);
    return {
      id: it.id,
      type,
      category: it.category || "",
      name: it.name || "",
      price: typeof it.price === "number" ? it.price : null,
      imageUrl: it.imageUrl || (imgs[0] || null),
      imageUrls: imgs.slice(0, 6),
      available: it.available !== false,
      description: it.description || "",
      longDescription: it.longDescription || "",
    };
  });

  return { version: 1, items: cleaned, updatedAt: serverTimestamp() };
}

async function syncPublicMenuFromCurrentItems() {
  if (!currentRestaurantId) return;
  try {
    const payload = buildPublicMenuPayload(currentItems);
    const publicMenuRef = doc(db, "restaurants", currentRestaurantId, "public", "menu");
    await setDoc(publicMenuRef, payload, { merge: true });
  } catch (err) {
    console.error("Public menu sync failed:", err);
  }
}

async function loadMenuItems() {
  if (!currentRestaurantId) return;

  const restRef = doc(db, "restaurants", currentRestaurantId);
  const menuCol = collection(restRef, "menuItems");
  const snap = await getDocs(menuCol);

  currentItems = [];
  snap.forEach((d) => currentItems.push({ id: d.id, ...(d.data() || {}) }));

  renderItemList();
  await syncPublicMenuFromCurrentItems();
}

function renderItemList() {
  if (!itemList) return;
  itemList.innerHTML = "";

  if (!currentItems.length) {
    const p = document.createElement("p");
    p.className = "info";
    p.textContent = "Noch keine Produkte angelegt.";
    itemList.appendChild(p);
    return;
  }

  const itemsWithType = currentItems.map((item) => ({ ...item, type: inferTypeForItem(item) }));

  const foodMap = new Map();
  const drinkMap = new Map();

  itemsWithType.forEach((item) => {
    const cat = item.category || "Ohne Kategorie";
    const map = item.type === "drink" ? drinkMap : foodMap;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(item);
  });

  function createRow(item) {
    const row = document.createElement("div");
    row.className = "menu-item";

    const header = document.createElement("div");
    header.className = "menu-item-header";

    const left = document.createElement("div");
    const nameEl = document.createElement("div");
    nameEl.className = "menu-item-name";
    nameEl.textContent = item.name || "Ohne Namen";

    const metaEl = document.createElement("div");
    metaEl.style.fontSize = "0.75rem";
    metaEl.style.color = "#64748b";
    metaEl.textContent = `${item.type === "drink" ? "Getränk" : "Speise"} · ${item.category || "ohne Kategorie"}`;

    left.appendChild(nameEl);
    left.appendChild(metaEl);

    const priceEl = document.createElement("div");
    priceEl.className = "menu-item-price";
    priceEl.textContent = typeof item.price === "number" ? item.price.toFixed(2) + " €" : "";

    header.appendChild(left);
    header.appendChild(priceEl);
    row.appendChild(header);

    const desc = item.longDescription || item.description || "";
    if (desc) {
      const descEl = document.createElement("div");
      descEl.className = "menu-item-desc";
      descEl.textContent = desc;
      row.appendChild(descEl);
    }

    const actions = document.createElement("div");
    actions.className = "menu-item-actions";

    const available = item.available !== false;

    const availBtn = document.createElement("button");
    availBtn.className = "btn btn-ghost btn-small";
    availBtn.textContent = available ? "Verfügbar" : "Ausgeblendet";
    availBtn.style.opacity = available ? "1" : "0.6";
    availBtn.addEventListener("click", () => toggleItemAvailability(item.id, available));

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-primary btn-small";
    editBtn.textContent = "Bearbeiten";
    editBtn.addEventListener("click", () => startEditItem(item));

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-ghost btn-small";
    delBtn.textContent = "Löschen";
    delBtn.addEventListener("click", () => deleteItem(item.id));

    actions.appendChild(availBtn);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    row.appendChild(actions);
    return row;
  }

  function renderGroup(label, map) {
    if (!map || map.size === 0) return;

    const groupTitle = document.createElement("div");
    groupTitle.className = "info";
    groupTitle.style.fontWeight = "600";
    groupTitle.style.marginTop = itemList.children.length ? "16px" : "0";
    groupTitle.textContent = label;
    itemList.appendChild(groupTitle);

    const sortedCats = Array.from(map.keys()).sort((a, b) => a.localeCompare(b, "de"));
    sortedCats.forEach((cat) => {
      const catLabel = document.createElement("div");
      catLabel.className = "info";
      catLabel.style.marginTop = "6px";
      catLabel.textContent = cat;
      itemList.appendChild(catLabel);

      map.get(cat).forEach((it) => itemList.appendChild(createRow(it)));
    });
  }

  renderGroup("Speisekarte", foodMap);
  renderGroup("Getränke", drinkMap);
}

function resetForm() {
  currentEditItemId = null;
  setStatus(adminItemStatus, "", null);

  itemCategoryCustomInput.value = "";
  itemNameInput.value = "";
  itemLongDescInput.value = "";
  itemDescInput.value = "";
  itemPriceInput.value = "";
  itemImagesInput.value = "";

  setProductType("food");
  itemSaveBtn.textContent = "Produkt speichern";
}

function startEditItem(item) {
  currentEditItemId = item.id;
  setStatus(adminItemStatus, "Bearbeitung eines Produkts.", null);

  const type = inferTypeForItem(item);
  setProductType(type);

  const categories = type === "drink" ? defaultDrinkCategories : defaultFoodCategories;

  if (item.category && categories.includes(item.category)) {
    itemCategorySelect.value = item.category;
    itemCategoryCustomInput.value = "";
  } else {
    itemCategorySelect.value = "";
    itemCategoryCustomInput.value = item.category || "";
  }

  itemNameInput.value = item.name || "";
  itemLongDescInput.value = item.longDescription || "";
  itemDescInput.value = item.description || "";
  itemPriceInput.value = typeof item.price === "number" ? String(item.price) : "";

  const images = Array.isArray(item.imageUrls) ? item.imageUrls : [];
  itemImagesInput.value = images.length ? images.join("\n") : (item.imageUrl || "");

  itemSaveBtn.textContent = "Produkt aktualisieren";
}

async function saveItem() {
  if (!currentRestaurantId) return;

  setStatus(adminItemStatus, "", null);

  const selectedCat = itemCategorySelect.value || "";
  const customCat = (itemCategoryCustomInput.value || "").trim();
  const category = customCat || selectedCat;

  const name = (itemNameInput.value || "").trim();
  const longDesc = (itemLongDescInput.value || "").trim();
  const desc = (itemDescInput.value || "").trim();
  const priceStr = (itemPriceInput.value || "").trim();
  const imagesRaw = (itemImagesInput.value || "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!category) return setStatus(adminItemStatus, "Bitte eine Kategorie wählen oder eingeben.", "err");
  if (!name) return setStatus(adminItemStatus, "Bitte Produktname eingeben.", "err");

  const price = parseFloat(priceStr.replace(",", "."));
  if (isNaN(price)) return setStatus(adminItemStatus, "Bitte einen gültigen Preis eingeben.", "err");

  const primaryImageUrl = imagesRaw[0] || "";
  const restRef = doc(db, "restaurants", currentRestaurantId);
  const menuCol = collection(restRef, "menuItems");

  const data = {
    type: currentProductType,
    category,
    name,
    description: desc,
    longDescription: longDesc,
    price,
    imageUrl: primaryImageUrl || null,
    imageUrls: imagesRaw.length ? imagesRaw : [],
    available: true,
  };

  try {
    itemSaveBtn.disabled = true;

    if (currentEditItemId) {
      await updateDoc(doc(menuCol, currentEditItemId), data);
      setStatus(adminItemStatus, "Produkt aktualisiert.", "ok");
    } else {
      await addDoc(menuCol, data);
      setStatus(adminItemStatus, "Produkt gespeichert.", "ok");
    }

    await loadMenuItems();
    resetForm();
  } catch (err) {
    console.error(err);
    setStatus(adminItemStatus, "Fehler: " + (err?.message || String(err)), "err");
  } finally {
    itemSaveBtn.disabled = false;
  }
}

async function toggleItemAvailability(itemId, currentlyAvailable) {
  if (!currentRestaurantId || !itemId) return;
  try {
    const restRef = doc(db, "restaurants", currentRestaurantId);
    const menuCol = collection(restRef, "menuItems");
    await updateDoc(doc(menuCol, itemId), { available: !currentlyAvailable });
    await loadMenuItems();
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(itemId) {
  if (!currentRestaurantId || !itemId) return;
  if (!window.confirm("Produkt wirklich löschen?")) return;

  try {
    const restRef = doc(db, "restaurants", currentRestaurantId);
    const menuCol = collection(restRef, "menuItems");
    await deleteDoc(doc(menuCol, itemId));
    await loadMenuItems();
  } catch (err) {
    console.error(err);
  }
}

/* =========================================================
   ABSCHNITT 10 — HEUTIGE BESTELLUNGEN
   ========================================================= */

async function loadTodayOrders() {
  if (!currentRestaurantId) return;
  if (adminOrdersList) adminOrdersList.innerHTML = "";

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const restRef = doc(db, "restaurants", currentRestaurantId);
  const ordersCol = collection(restRef, "orders");

  const qy = query(
    ordersCol,
    where("createdAt", ">=", start),
    where("createdAt", "<", end),
    orderBy("createdAt", "asc"),
    limit(200)
  );

  const snap = await getDocs(qy);

  const ordersToday = [];
  snap.forEach((d) => ordersToday.push({ id: d.id, ...(d.data() || {}) }));

  if (!ordersToday.length) {
    const p = document.createElement("p");
    p.className = "info";
    p.textContent = "Heute noch keine Bestellungen.";
    adminOrdersList.appendChild(p);
    return;
  }

  ordersToday.forEach((order) => {
    const row = document.createElement("div");
    row.className = "list-item-row";

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.flexDirection = "column";

    const title = document.createElement("span");
    title.style.fontSize = "0.85rem";
    title.style.fontWeight = "600";

    const timeStr =
      order.createdAt && order.createdAt.toDate
        ? order.createdAt.toDate().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })
        : "";

    title.textContent = `Tisch ${order.table || order.tableId || "?"} – ${timeStr}`;

    const itemsStr = (order.items || []).map((i) => `${i.qty}× ${i.name}`).join(", ") || "Keine Artikel";

    const itemsSpan = document.createElement("span");
    itemsSpan.style.fontSize = "0.78rem";
    itemsSpan.textContent = itemsStr;

    left.appendChild(title);
    left.appendChild(itemsSpan);

    const right = document.createElement("div");
    right.style.fontSize = "0.82rem";
    right.style.fontWeight = "600";

    const total = (order.items || []).reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);
    right.textContent = total.toFixed(2) + " €";

    row.appendChild(left);
    row.appendChild(right);

    adminOrdersList.appendChild(row);
  });
}

/* =========================================================
   ABSCHNITT 11 — EVENTS
   ========================================================= */

typeFoodBtn?.addEventListener("click", () => setProductType("food"));
typeDrinkBtn?.addEventListener("click", () => setProductType("drink"));

itemSaveBtn?.addEventListener("click", saveItem);
itemResetBtn?.addEventListener("click", resetForm);

/* =========================================================
   ABSCHNITT 12 — INIT (NORMAL LOGIN)
   ========================================================= */

setProductType("food");
showGate("Checking session…");

await setPersistence(auth, browserLocalPersistence);

onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) return goLogin();

    currentUser = user;

    if (ownerUserLabel) {
      ownerUserLabel.style.display = "inline-flex";
      ownerUserLabel.textContent = user.email || user.uid;
    }
    if (ownerLogoutBtn) ownerLogoutBtn.style.display = "inline-block";

    showGate("Loading restaurant…");

    const rid = await resolveRestaurantIdForOwner(user);
    if (!rid) {
      showGate("❌ Kein Restaurant zugeordnet. (owners/{uid}.restaurantId fehlt)");
      // optional: nach 2s logout, damit es sauber ist
      setTimeout(() => doLogout(), 1800);
      return;
    }

    await openRestaurantById(rid);

    hideGate();
  } catch (err) {
    console.error(err);
    showGate("❌ Fehler: " + (err?.message || String(err)));
  }
});

/* =========================================================
   ABSCHNITT 13 — INIT (Single Auth Check) — LOOP-SAFE + AUTO-REST
   ========================================================= */

setProductType("food");
showGate("Checking session…");
hideRestaurantArea();

await setPersistence(auth, browserLocalPersistence);

onAuthStateChanged(auth, async (user) => {
  try {
    // LOOP-SAFE: manchmal kommt kurz null -> wir warten kurz und prüfen nochmal
    if (!user) {
      await new Promise((r) => setTimeout(r, 400));
      if (!auth.currentUser) {
        goLogin();
        return;
      }
      user = auth.currentUser;
    }

    currentUser = user;

    if (ownerUserLabel) {
      ownerUserLabel.style.display = "inline-flex";
      ownerUserLabel.textContent = user.email || user.uid;
    }
    if (ownerLogoutBtn) ownerLogoutBtn.style.display = "inline-block";

    showGate("Loading…");

    // AUTO: Restaurant des Users finden (kein Restaurant-ID Formular)
    const rid = await resolveRestaurantIdForUser(user);

    if (rid) {
      if (adminRestIdInput) adminRestIdInput.value = rid;
      await openRestaurantById(rid);
      hideGate();
      return;
    }

    // Fallback: nur wenn wir wirklich nix finden
    showRestaurantPicker();
    hideGate();
    setStatus(adminOpenStatus, "⚠️ Kein Restaurant zugeordnet. Bitte Restaurant-ID setzen.", "err");
  } catch (err) {
    console.error(err);
    showGate("❌ Fehler: " + (err?.message || String(err)));
  }
});
