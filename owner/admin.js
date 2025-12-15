/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */

import { db, auth } from "../shared/firebase-config.js";
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
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

/* =========================================================
   ABSCHNITT 1 — PARAMS & AUTH GATE (Owner/Admin/Manager)
   ========================================================= */

setPersistence(auth, browserLocalPersistence).catch(() => {});

const params = new URLSearchParams(location.search);
const restaurantId = params.get("r") || "";

// anti redirect loop (pro Tab)
const OWNER_LOCK = "menyra_owner_gate_lock_v2";

function goLogin(reason = "") {
  if (sessionStorage.getItem(OWNER_LOCK) === "1") return;
  sessionStorage.setItem(OWNER_LOCK, "1");

  const url = new URL("./login.html", location.href);
  // optional: nach Login zurück in dieses Admin
  url.searchParams.set("next", new URL("./admin.html", location.href).toString());
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

/* =========================================================
   ABSCHNITT 2 — DOM
   ========================================================= */

const appGate = document.getElementById("appGate");
const appGateMsg = document.getElementById("appGateMsg");

const ownerUserLabel = document.getElementById("ownerUserLabel");
const ownerLogoutBtn = document.getElementById("ownerLogoutBtn");

const menuEditorCard = document.getElementById("menuEditorCard");
const menuListCard = document.getElementById("menuListCard");
const ordersCard = document.getElementById("ordersCard");
const adminRestLabel = document.getElementById("adminRestLabel");

const typeFoodBtn = document.getElementById("typeFoodBtn");
const typeDrinkBtn = document.getElementById("typeDrinkBtn");

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

const itemList = document.getElementById("itemList");
const adminOrdersList = document.getElementById("adminOrdersList");

/* =========================================================
   ABSCHNITT 3 — UI HELPERS
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

function showCards(on) {
  const d = on ? "block" : "none";
  if (menuEditorCard) menuEditorCard.style.display = d;
  if (menuListCard) menuListCard.style.display = d;
  if (ordersCard) ordersCard.style.display = d;
}

/* =========================================================
   ABSCHNITT 4 — STATE
   ========================================================= */

let currentRestaurantId = restaurantId;
let currentItems = [];
let currentEditItemId = null;
let currentProductType = "food";

const defaultFoodCategories = [
  "Alle", "Burger", "Pizza", "Pasta", "Salate", "Dessert", "Beilagen", "Saucen"
];
const defaultDrinkCategories = [
  "Alle", "Kaffee", "Softdrinks", "Säfte", "Eistee", "Energy", "Wasser", "Bier", "Wein"
];

function setProductType(type) {
  currentProductType = type === "drink" ? "drink" : "food";

  if (typeFoodBtn && typeDrinkBtn) {
    typeFoodBtn.classList.toggle("tab-btn-active", currentProductType === "food");
    typeDrinkBtn.classList.toggle("tab-btn-active", currentProductType === "drink");
  }

  const cats = currentProductType === "drink" ? defaultDrinkCategories : defaultFoodCategories;

  if (itemCategorySelect) {
    itemCategorySelect.innerHTML = "";
    const optEmpty = document.createElement("option");
    optEmpty.value = "";
    optEmpty.textContent = "Kategorie wählen…";
    itemCategorySelect.appendChild(optEmpty);

    cats
      .filter((c) => c !== "Alle")
      .forEach((c) => {
        const o = document.createElement("option");
        o.value = c;
        o.textContent = c;
        itemCategorySelect.appendChild(o);
      });
  }
}

/* =========================================================
   ABSCHNITT 5 — RESTAURANT LADEN
   ========================================================= */

async function openRestaurantById(rid) {
  const refRest = doc(db, "restaurants", rid);
  const snap = await getDoc(refRest);
  if (!snap.exists()) throw new Error("Restaurant nicht gefunden.");

  const data = snap.data() || {};
  if (adminRestLabel) adminRestLabel.textContent = data.restaurantName || rid;

  showCards(true);
  await loadMenuItems();
  await loadTodayOrders();
}

/* =========================================================
   ABSCHNITT 6 — PUBLIC MENU SYNC
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

/* =========================================================
   ABSCHNITT 7 — MENÜ LADEN / RENDER
   ========================================================= */

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

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn btn-ghost";
    btnEdit.type = "button";
    btnEdit.textContent = "Bearbeiten";
    btnEdit.addEventListener("click", () => startEditItem(item));

    const btnAvail = document.createElement("button");
    btnAvail.className = "btn btn-ghost";
    btnAvail.type = "button";
    btnAvail.textContent = item.available === false ? "Nicht verfügbar" : "Verfügbar";
    btnAvail.addEventListener("click", () => toggleItemAvailability(item.id, item.available !== false));

    const btnDel = document.createElement("button");
    btnDel.className = "btn btn-ghost";
    btnDel.type = "button";
    btnDel.textContent = "Löschen";
    btnDel.addEventListener("click", () => deleteItem(item.id));

    actions.appendChild(btnEdit);
    actions.appendChild(btnAvail);
    actions.appendChild(btnDel);
    row.appendChild(actions);

    return row;
  }

  function renderGroup(title, map) {
    if (!map.size) return;

    const groupTitle = document.createElement("h3");
    groupTitle.style.margin = "14px 0 6px";
    groupTitle.textContent = title;
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

/* =========================================================
   ABSCHNITT 8 — CRUD
   ========================================================= */

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
   ABSCHNITT 9 — HEUTIGE BESTELLUNGEN
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
    adminOrdersList?.appendChild(p);
    return;
  }

  ordersToday.forEach((order) => {
    const row = document.createElement("div");
    row.className = "menu-item";

    const left = document.createElement("div");

    const title = document.createElement("div");
    title.className = "menu-item-name";

    const timeStr =
      order.createdAt?.toDate
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

    adminOrdersList?.appendChild(row);
  });
}

/* =========================================================
   ABSCHNITT 10 — LOGOUT
   ========================================================= */

async function doLogout() {
  try { await signOut(auth); } catch {}
  goLogin("signed_out");
}

/* =========================================================
   ABSCHNITT 11 — EVENTS
   ========================================================= */

typeFoodBtn?.addEventListener("click", () => setProductType("food"));
typeDrinkBtn?.addEventListener("click", () => setProductType("drink"));

itemSaveBtn?.addEventListener("click", saveItem);
itemResetBtn?.addEventListener("click", resetForm);

ownerLogoutBtn?.addEventListener("click", doLogout);

/* =========================================================
   ABSCHNITT 12 — BOOT (ein einziges Gate, kein Chaos)
   ========================================================= */

setProductType("food");
showCards(false);
showGate("Checking session…");

let gateDone = false;

onAuthStateChanged(auth, async (user) => {
  if (gateDone) return;
  gateDone = true;

  // wir sind im admin -> lock weg
  sessionStorage.removeItem(OWNER_LOCK);

  if (!currentRestaurantId) return goLogin("missing_r");
  if (!user) return goLogin("signed_out");

  try {
    showGate("Checking access…");
    const ok = await hasOwnerAccess(user.uid);
    if (!ok) {
      try { await signOut(auth); } catch {}
      return goLogin("no_access");
    }

    if (ownerUserLabel) {
      ownerUserLabel.style.display = "inline-flex";
      ownerUserLabel.textContent = user.email || user.uid;
    }
    if (ownerLogoutBtn) ownerLogoutBtn.style.display = "inline-block";

    showGate("Loading restaurant…");
    await openRestaurantById(currentRestaurantId);

    hideGate();
  } catch (err) {
    console.error(err);
    showGate("❌ Fehler: " + (err?.message || String(err)));
  }
});
