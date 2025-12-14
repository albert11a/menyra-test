/* =========================================================
   OWNER ADMIN — CLEAN + LOOP-SAFE (Auth + staff-role)
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

/* =========================
   PARAMS
   ========================= */
const params = new URLSearchParams(location.search);
const restaurantId = params.get("r") || "";

/* =========================
   DOM
   ========================= */
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
const typeToggleButtons = document.querySelectorAll(".type-toggle-btn");

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

/* =========================
   UI HELPERS
   ========================= */
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
function goLogin(reason = "") {
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

/* =========================
   STATE
   ========================= */
let currentItems = [];
let currentEditItemId = null;
let currentProductType = "food";

/* =========================
   CATEGORIES
   ========================= */
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

/* =========================
   RESTAURANT OPEN
   ========================= */
async function openRestaurantById() {
  const restRef = doc(db, "restaurants", restaurantId);
  const snap = await getDoc(restRef);
  if (!snap.exists()) throw new Error("Restaurant nicht gefunden.");

  const data = snap.data() || {};
  if (adminRestLabel) adminRestLabel.textContent = data.restaurantName || restaurantId;

  if (menuEditorCard) menuEditorCard.style.display = "block";
  if (menuListCard) menuListCard.style.display = "block";
  if (ordersCard) ordersCard.style.display = "block";

  await loadMenuItems();
  await loadTodayOrders();
}

/* =========================
   MENU + PUBLIC SYNC
   ========================= */
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
  try {
    const payload = buildPublicMenuPayload(currentItems);
    await setDoc(doc(db, "restaurants", restaurantId, "public", "menu"), payload, { merge: true });
  } catch (err) {
    console.error("Public menu sync failed:", err);
  }
}

async function loadMenuItems() {
  const menuCol = collection(doc(db, "restaurants", restaurantId), "menuItems");
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

  if (itemCategoryCustomInput) itemCategoryCustomInput.value = "";
  if (itemNameInput) itemNameInput.value = "";
  if (itemLongDescInput) itemLongDescInput.value = "";
  if (itemDescInput) itemDescInput.value = "";
  if (itemPriceInput) itemPriceInput.value = "";
  if (itemImagesInput) itemImagesInput.value = "";

  setProductType("food");
  if (itemSaveBtn) itemSaveBtn.textContent = "Produkt speichern";
}

function startEditItem(item) {
  currentEditItemId = item.id;
  setStatus(adminItemStatus, "Bearbeitung eines Produkts.", null);

  const type = inferTypeForItem(item);
  setProductType(type);

  const categories = type === "drink" ? defaultDrinkCategories : defaultFoodCategories;

  if (item.category && categories.includes(item.category)) {
    if (itemCategorySelect) itemCategorySelect.value = item.category;
    if (itemCategoryCustomInput) itemCategoryCustomInput.value = "";
  } else {
    if (itemCategorySelect) itemCategorySelect.value = "";
    if (itemCategoryCustomInput) itemCategoryCustomInput.value = item.category || "";
  }

  if (itemNameInput) itemNameInput.value = item.name || "";
  if (itemLongDescInput) itemLongDescInput.value = item.longDescription || "";
  if (itemDescInput) itemDescInput.value = item.description || "";
  if (itemPriceInput) itemPriceInput.value = typeof item.price === "number" ? String(item.price) : "";

  const images = Array.isArray(item.imageUrls) ? item.imageUrls : [];
  if (itemImagesInput) itemImagesInput.value = images.length ? images.join("\n") : (item.imageUrl || "");

  if (itemSaveBtn) itemSaveBtn.textContent = "Produkt aktualisieren";
}

async function saveItem() {
  setStatus(adminItemStatus, "", null);

  const selectedCat = itemCategorySelect?.value || "";
  const customCat = (itemCategoryCustomInput?.value || "").trim();
  const category = customCat || selectedCat;

  const name = (itemNameInput?.value || "").trim();
  const longDesc = (itemLongDescInput?.value || "").trim();
  const desc = (itemDescInput?.value || "").trim();
  const priceStr = (itemPriceInput?.value || "").trim();

  const imagesRaw = (itemImagesInput?.value || "")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!category) return setStatus(adminItemStatus, "Bitte eine Kategorie wählen oder eingeben.", "err");
  if (!name) return setStatus(adminItemStatus, "Bitte Produktname eingeben.", "err");

  const price = parseFloat(priceStr.replace(",", "."));
  if (isNaN(price)) return setStatus(adminItemStatus, "Bitte einen gültigen Preis eingeben.", "err");

  const primaryImageUrl = imagesRaw[0] || "";

  const menuCol = collection(doc(db, "restaurants", restaurantId), "menuItems");
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
    if (itemSaveBtn) itemSaveBtn.disabled = true;

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
    if (itemSaveBtn) itemSaveBtn.disabled = false;
  }
}

async function toggleItemAvailability(itemId, currentlyAvailable) {
  try {
    const menuCol = collection(doc(db, "restaurants", restaurantId), "menuItems");
    await updateDoc(doc(menuCol, itemId), { available: !currentlyAvailable });
    await loadMenuItems();
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(itemId) {
  if (!window.confirm("Produkt wirklich löschen?")) return;
  try {
    const menuCol = collection(doc(db, "restaurants", restaurantId), "menuItems");
    await deleteDoc(doc(menuCol, itemId));
    await loadMenuItems();
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   TODAY ORDERS
   ========================= */
async function loadTodayOrders() {
  if (adminOrdersList) adminOrdersList.innerHTML = "";

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const ordersCol = collection(doc(db, "restaurants", restaurantId), "orders");
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
    adminOrdersList?.appendChild(row);
  });
}

/* =========================
   LOGOUT
   ========================= */
async function doLogout() {
  try { await signOut(auth); } catch {}
  goLogin("signed_out");
}
ownerLogoutBtn?.addEventListener("click", doLogout);

/* =========================
   EVENTS
   ========================= */
typeFoodBtn?.addEventListener("click", () => setProductType("food"));
typeDrinkBtn?.addEventListener("click", () => setProductType("drink"));
itemSaveBtn?.addEventListener("click", saveItem);
itemResetBtn?.addEventListener("click", resetForm);

/* =========================
   INIT (ONE SINGLE FLOW)
   ========================= */
setProductType("food");
showGate("Checking session…");

setPersistence(auth, browserLocalPersistence).catch(() => {});

onAuthStateChanged(auth, async (user) => {
  try {
    if (!restaurantId) return goLogin("missing_r");
    if (!user) return goLogin("signed_out");

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

    showGate("Loading…");
    await openRestaurantById();
    hideGate();
  } catch (err) {
    console.error(err);
    showGate("❌ Fehler: " + (err?.message || String(err)));
  }
});
