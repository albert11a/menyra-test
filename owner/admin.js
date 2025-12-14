// admin.js – Restaurant Admin: AUTH (Email/Pass) + Speisekarte + Bestellungen
// Hinweis: Dieses File ist kompatibel mit sicheren Firestore Rules (Staff/Owner müssen eingeloggt sein).

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
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

/* =========================================================
   ABSCHNITT 1 — DOM-REFERENZEN
   ========================================================= */

// AUTH
const authCard = document.getElementById("authCard");
const authForm = document.getElementById("authForm");
const authEmailInput = document.getElementById("authEmailInput");
const authPassInput = document.getElementById("authPassInput");
const authLoginBtn = document.getElementById("authLoginBtn");
const authLoggedIn = document.getElementById("authLoggedIn");
const authUserLabel = document.getElementById("authUserLabel");
const authLogoutBtn = document.getElementById("authLogoutBtn");
const authStatus = document.getElementById("authStatus");

// Restaurant öffnen
const openRestaurantCard = document.getElementById("openRestaurantCard");
const adminRestIdInput = document.getElementById("adminRestIdInput");
const adminOpenRestBtn = document.getElementById("adminOpenRestBtn");
const adminOpenStatus = document.getElementById("adminOpenStatus");

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
   ABSCHNITT 2 — GLOBALER STATE
   ========================================================= */

const auth = getAuth();
let currentUser = null;

let currentRestaurantId = null;
let currentItems = [];           // [{id, ...}]
let currentEditItemId = null;    // null = neues Produkt
let currentProductType = "food"; // "food" (Speisekarte) oder "drink" (Getränke)

/* =========================================================
   ABSCHNITT 3 — STANDARD-KATEGORIEN
   ========================================================= */

// Speisekarte – wie gewünscht
const defaultFoodCategories = [
  "Mengjesi",
  "Supat",
  "Paragjellat",
  "Sandwich",
  "Burger",
  "Rizoto",
  "Sallatat",
  "Pasta",
  "Pizza",
  "Tava",
  "Mish Pule",
  "Mishrat",
  "Deti",
  "Antipasta",
  "Desert",
];

// Getränke – auf Albanisch, möglichst viele Typen
const defaultDrinkCategories = [
  "Kafe & Espresso",
  "Cappuccino & Latte",
  "Çaj i ngrohtë",
  "Çaj i ftohtë",
  "Ujë i thjeshtë",
  "Ujë i gazuar",
  "Lëngje frutash",
  "Pije të gazuara",
  "Freskuese",
  "Smoothie",
  "Milkshake",
  "Birra",
  "Verë e bardhë",
  "Verë e kuqe",
  "Rose",
  "Koktej",
  "Pije alkoolike të forta",
  "Energjike",
];

/* =========================================================
   ABSCHNITT 4 — SESSION
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

/* =========================================================
   ABSCHNITT 5 — UI HELPERS
   ========================================================= */

function setStatus(el, text, kind) {
  if (!el) return;
  el.textContent = text || "";
  el.className = "status-text";
  if (kind === "ok") el.classList.add("status-ok");
  if (kind === "err") el.classList.add("status-err");
}

function hideRestaurantArea() {
  openRestaurantCard.style.display = "none";
  menuEditorCard.style.display = "none";
  menuListCard.style.display = "none";
  ordersCard.style.display = "none";
  currentRestaurantId = null;
}

function showRestaurantPicker() {
  openRestaurantCard.style.display = "block";
}

/* =========================================================
   ABSCHNITT 6 — AUTH FLOW
   ========================================================= */

async function doLogin() {
  const email = (authEmailInput.value || "").trim();
  const pass = (authPassInput.value || "").trim();

  setStatus(authStatus, "", null);

  if (!email || !pass) {
    setStatus(authStatus, "Bitte Email und Passwort eingeben.", "err");
    return;
  }

  try {
    authLoginBtn.disabled = true;
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged übernimmt UI
  } catch (err) {
    console.error(err);
    setStatus(authStatus, "Login fehlgeschlagen: " + (err?.message || err), "err");
  } finally {
    authLoginBtn.disabled = false;
  }
}

async function doLogout() {
  try {
    await signOut(auth);
    clearOwnerSession();
    hideRestaurantArea();
  } catch (err) {
    console.error(err);
  }
}

function applyAuthUI(user) {
  if (!user) {
    currentUser = null;
    authForm.style.display = "block";
    authLoggedIn.style.display = "none";
    hideRestaurantArea();
    showRestaurantPicker(); // bleibt verborgen bis login
    openRestaurantCard.style.display = "none";
    return;
  }

  currentUser = user;
  authForm.style.display = "none";
  authLoggedIn.style.display = "block";
  authUserLabel.textContent = user.email || user.uid;

  showRestaurantPicker();

  // Auto-fill Restaurant-ID (URL ?r=... oder Session)
  const params = new URLSearchParams(window.location.search);
  const ridFromUrl = params.get("r");
  const ridFromSession = loadOwnerSession();
  const rid = ridFromUrl || ridFromSession;

  if (rid) {
    adminRestIdInput.value = rid;
    // Auto-open
    openRestaurantById(rid);
  }
}

onAuthStateChanged(auth, (user) => {
  applyAuthUI(user);
});

/* =========================================================
   ABSCHNITT 7 — TYP / KATEGORIEN
   ========================================================= */

function fillCategorySelect() {
  const cats =
    currentProductType === "drink"
      ? defaultDrinkCategories
      : defaultFoodCategories;

  itemCategorySelect.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Kategorie wählen…";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  itemCategorySelect.appendChild(placeholderOption);

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

  typeToggleButtons.forEach((btn) => {
    const t = btn.dataset.type;
    if (t === type) btn.classList.add("tab-btn-active");
    else btn.classList.remove("tab-btn-active");
  });

  fillCategorySelect();
}

/* =========================================================
   ABSCHNITT 8 — RESTAURANT ÖFFNEN
   ========================================================= */

async function openRestaurantById(id) {
  setStatus(adminOpenStatus, "", null);

  if (!currentUser) {
    setStatus(adminOpenStatus, "Bitte zuerst einloggen.", "err");
    return;
  }

  const rid = (id || "").trim();
  if (!rid) {
    setStatus(adminOpenStatus, "Bitte Restaurant-ID eingeben.", "err");
    return;
  }

  try {
    adminOpenRestBtn.disabled = true;

    // Restaurant doc lesen (allow read: true)
    const refRest = doc(db, "restaurants", rid);
    const snap = await getDoc(refRest);

    if (!snap.exists()) {
      setStatus(adminOpenStatus, "Restaurant nicht gefunden.", "err");
      return;
    }

    currentRestaurantId = rid;
    saveOwnerSession(rid);

    const data = snap.data() || {};
    adminRestLabel.textContent = data.restaurantName || rid;

    openRestaurantCard.style.display = "none";
    menuEditorCard.style.display = "block";
    menuListCard.style.display = "block";
    ordersCard.style.display = "block";

    // Ab hier: Reads auf menuItems/orders erfordern Staff-Rechte.
    await loadMenuItems();      // wenn nicht freigeschaltet -> Permission denied
    await loadTodayOrders();

    setStatus(adminOpenStatus, "", null);
  } catch (err) {
    console.error(err);
    const msg = err?.message || String(err);

    if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("missing")) {
      setStatus(
        adminOpenStatus,
        "Keine Berechtigung. Dieser User ist noch nicht als Staff/Owner für dieses Restaurant freigeschaltet.",
        "err"
      );
    } else {
      setStatus(adminOpenStatus, "Fehler: " + msg, "err");
    }

    // UI zurück
    menuEditorCard.style.display = "none";
    menuListCard.style.display = "none";
    ordersCard.style.display = "none";
    openRestaurantCard.style.display = "block";
    currentRestaurantId = null;
  } finally {
    adminOpenRestBtn.disabled = false;
  }
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
  // Für Gäste nur das Nötigste – klein halten (Egress-Kosten!)
  // Struktur: { items: [...], updatedAt }
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
      // optional: short/long nur wenn du es brauchst:
      description: it.description || "",
      longDescription: it.longDescription || "",
    };
  });

  return {
    version: 1,
    items: cleaned,
    updatedAt: serverTimestamp(),
  };
}

async function syncPublicMenuFromCurrentItems() {
  if (!currentRestaurantId) return;

  try {
    const payload = buildPublicMenuPayload(currentItems);
    const publicMenuRef = doc(db, "restaurants", currentRestaurantId, "public", "menu");
    await setDoc(publicMenuRef, payload, { merge: true });
  } catch (err) {
    // Nicht blockieren – Admin soll weiter arbeiten können.
    console.error("Public menu sync failed:", err);
  }
}

async function loadMenuItems() {
  if (!currentRestaurantId) return;

  const restRef = doc(db, "restaurants", currentRestaurantId);
  const menuCol = collection(restRef, "menuItems");

  const snap = await getDocs(menuCol);

  currentItems = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    currentItems.push({
      id: docSnap.id,
      ...data,
    });
  });

  renderItemList();

  // Public Menu aktualisieren (1 Doc write)
  await syncPublicMenuFromCurrentItems();
}

function renderItemList() {
  itemList.innerHTML = "";

  if (!currentItems.length) {
    const p = document.createElement("p");
    p.className = "info";
    p.textContent = "Noch keine Produkte angelegt.";
    itemList.appendChild(p);
    return;
  }

  const itemsWithType = currentItems.map((item) => ({
    ...item,
    type: inferTypeForItem(item),
  }));

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
    const typeLabel = item.type === "drink" ? "Getränk" : "Speise";
    const catText = item.category ? item.category : "ohne Kategorie";
    metaEl.textContent = `${typeLabel} · ${catText}`;

    left.appendChild(nameEl);
    left.appendChild(metaEl);

    const priceEl = document.createElement("div");
    priceEl.className = "menu-item-price";
    if (typeof item.price === "number") priceEl.textContent = item.price.toFixed(2) + " €";
    else priceEl.textContent = "";

    header.appendChild(left);
    header.appendChild(priceEl);
    row.appendChild(header);

    if (item.longDescription) {
      const descEl = document.createElement("div");
      descEl.className = "menu-item-desc";
      descEl.textContent = item.longDescription;
      row.appendChild(descEl);
    } else if (item.description) {
      const descEl = document.createElement("div");
      descEl.className = "menu-item-desc";
      descEl.textContent = item.description;
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

      map.get(cat).forEach((item) => itemList.appendChild(createRow(item)));
    });
  }

  renderGroup("Speisekarte", foodMap);
  renderGroup("Getränke", drinkMap);
}

/* =========================================================
   ABSCHNITT 10 — PRODUKT SPEICHERN / BEARBEITEN
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
  itemPriceInput.value = typeof item.price === "number" ? item.price.toString() : "";

  const images = Array.isArray(item.imageUrls) ? item.imageUrls : [];
  if (images.length) itemImagesInput.value = images.join("\n");
  else if (item.imageUrl) itemImagesInput.value = item.imageUrl;
  else itemImagesInput.value = "";

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
  const imagesRaw = (itemImagesInput.value || "").split("\n").map((s) => s.trim()).filter((s) => s.length > 0);

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

    await loadMenuItems(); // lädt + synced public/menu
    resetForm();
  } catch (err) {
    console.error(err);
    const msg = err?.message || String(err);
    setStatus(adminItemStatus, "Fehler: " + msg, "err");
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
    await loadMenuItems(); // synced
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
    await loadMenuItems(); // synced
  } catch (err) {
    console.error(err);
  }
}

/* =========================================================
   ABSCHNITT 11 — HEUTIGE BESTELLUNGEN
   ========================================================= */

async function loadTodayOrders() {
  if (!currentRestaurantId) return;

  adminOrdersList.innerHTML = "";

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const restRef = doc(db, "restaurants", currentRestaurantId);
  const ordersCol = collection(restRef, "orders");

  const q = query(
    ordersCol,
    where("createdAt", ">=", start),
    where("createdAt", "<", end),
    orderBy("createdAt", "asc"),
    limit(200)
  );

  const snap = await getDocs(q);

  const ordersToday = [];
  snap.forEach((docSnap) => ordersToday.push({ id: docSnap.id, ...docSnap.data() }));

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
   ABSCHNITT 12 — EVENTS & INIT
   ========================================================= */

authLoginBtn.addEventListener("click", doLogin);
authLogoutBtn.addEventListener("click", doLogout);

adminOpenRestBtn.addEventListener("click", () => openRestaurantById(adminRestIdInput.value || ""));

typeFoodBtn.addEventListener("click", () => setProductType("food"));
typeDrinkBtn.addEventListener("click", () => setProductType("drink"));

itemSaveBtn.addEventListener("click", saveItem);
itemResetBtn.addEventListener("click", resetForm);

// init
setProductType("food");
