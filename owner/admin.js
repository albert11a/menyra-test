// admin.js – Restaurant Admin: Login, Speisekarte & Getränke, Bestellübersicht

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
  setDoc,
  deleteDoc,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

/* =========================
   PUBLIC DOCS (GUEST-OPTIMIERUNG)
   =========================

   Ziel: Gäste sollen nicht mehr N einzelne menuItems-Dokumente lesen müssen.
   Stattdessen schreiben wir für jedes Restaurant 1 Public-Dokument:

   restaurants/{restaurantId}/public/menu   -> { updatedAt, items:[...] }
   (optional später: restaurants/{restaurantId}/public/offers)

   Diese Datei aktualisiert public/menu automatisch nach jeder Änderung.
*/

const PUBLIC_MENU_DOC_ID = "menu";

function buildPublicMenuItems(items) {
  // 🔒 Doc-Size schützen: keep payload schlank
  // (du kannst Limits später anpassen)
  const MAX_IMAGES = 6;

  return (Array.isArray(items) ? items : [])
    .map((it) => {
      const imageUrls = Array.isArray(it.imageUrls) ? it.imageUrls : [];
      const safeImages = imageUrls
        .filter((u) => typeof u === "string" && u.trim() !== "")
        .slice(0, MAX_IMAGES);

      const primary =
        (typeof it.imageUrl === "string" && it.imageUrl.trim() !== ""
          ? it.imageUrl
          : safeImages[0]) || null;

      return {
        id: it.id,
        type: it.type || null,
        category: it.category || "Sonstiges",
        name: it.name || "Produkt",
        description: it.description || "",
        longDescription: it.longDescription || "",
        price: typeof it.price === "number" ? it.price : Number(it.price) || 0,
        available: it.available !== false,
        imageUrl: primary,
        imageUrls: safeImages,
        // Counts (optional) – Gäste-UI nutzt 0 als Default
        likeCount: Number(it.likeCount) || 0,
        commentCount: Number(it.commentCount) || 0,
        ratingCount: Number(it.ratingCount) || 0,
        ratingSum: Number(it.ratingSum) || 0,
      };
    })
    .filter((it) => it.available);
}

function computePublicMenuSig(items) {
  // Sehr leichte Signatur, um unnötige Writes zu vermeiden
  try {
    const stable = (Array.isArray(items) ? items : [])
      .slice()
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
      .map((it) =>
        [
          it.id,
          it.type,
          it.category,
          it.name,
          it.description,
          it.longDescription,
          it.price,
          it.available,
          it.imageUrl,
          Array.isArray(it.imageUrls) ? it.imageUrls.join("|") : "",
        ].join("::")
      )
      .join("\n");

    // simple hash
    let h = 0;
    for (let i = 0; i < stable.length; i++) {
      h = (h << 5) - h + stable.charCodeAt(i);
      h |= 0;
    }
    return String(h);
  } catch {
    return String(Date.now());
  }
}

async function syncPublicMenuIfChanged() {
  if (!currentRestaurantId) return;

  const publicItems = buildPublicMenuItems(currentItems);
  const sig = computePublicMenuSig(publicItems);
  const sigKey = `menyra_public_menu_sig_${currentRestaurantId}`;

  try {
    const prev = localStorage.getItem(sigKey);
    if (prev && prev === sig) return; // nichts geändert

    const publicMenuRef = doc(
      db,
      "restaurants",
      currentRestaurantId,
      "public",
      PUBLIC_MENU_DOC_ID
    );

    await setDoc(
      publicMenuRef,
      {
        updatedAt: serverTimestamp(),
        version: 1,
        items: publicItems,
      },
      { merge: true }
    );

    localStorage.setItem(sigKey, sig);
  } catch (err) {
    // Nicht blockieren – Admin soll trotzdem weiterarbeiten.
    console.warn("Public menu sync failed:", err);
  }
}

/* =========================
   DOM-REFERENZEN
   ========================= */

// Login
const adminLoginCard = document.getElementById("adminLoginCard");
const adminRestIdInput = document.getElementById("adminRestIdInput");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminCodeInput = document.getElementById("adminCodeInput");
const adminCodeLoginBtn = document.getElementById("adminCodeLoginBtn");
const adminLoginStatus = document.getElementById("adminLoginStatus");

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

/* =========================
   GLOBALER STATE
   ========================= */

let currentRestaurantId = null;
let currentItems = [];           // [{id, ...}]
let currentEditItemId = null;    // null = neues Produkt
let currentProductType = "food"; // "food" (Speisekarte) oder "drink" (Getränke)

/* =========================
   STANDARD-KATEGORIEN
   ========================= */

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

/* =========================
   SESSION-HILFSFUNKTIONEN
   ========================= */

function saveOwnerSession(restaurantId) {
  localStorage.setItem("menyra_owner_restaurantId", restaurantId);
}

function loadOwnerSession() {
  return localStorage.getItem("menyra_owner_restaurantId");
}

/* =========================
   TYP-UMSCHALTER & KATEGORIEN
   ========================= */

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

  // Buttons visuell updaten
  typeToggleButtons.forEach((btn) => {
    const t = btn.dataset.type;
    if (t === type) {
      btn.classList.add("tab-btn-active");
    } else {
      btn.classList.remove("tab-btn-active");
    }
  });

  fillCategorySelect();
}

/* =========================
   LOGIN / RESTAURANT LADEN
   ========================= */

async function setRestaurantBySnapshot(id, data) {
  currentRestaurantId = id;
  saveOwnerSession(currentRestaurantId);

  adminRestLabel.textContent = data.restaurantName || currentRestaurantId;
  adminLoginCard.style.display = "none";
  menuEditorCard.style.display = "block";
  menuListCard.style.display = "block";
  ordersCard.style.display = "block";

  adminLoginStatus.textContent = "";
  adminLoginStatus.className = "status-text";

  await loadMenuItems();
  await loadTodayOrders();
}

async function loginWithRestaurantId() {
  adminLoginStatus.textContent = "";
  adminLoginStatus.className = "status-text";

  const id = (adminRestIdInput.value || "").trim();
  if (!id) {
    adminLoginStatus.textContent = "Bitte Restaurant-ID eingeben.";
    adminLoginStatus.classList.add("status-err");
    return;
  }

  try {
    const refRest = doc(db, "restaurants", id);
    const snap = await getDoc(refRest);
    if (!snap.exists()) {
      adminLoginStatus.textContent = "Lokal mit dieser ID existiert nicht.";
      adminLoginStatus.classList.add("status-err");
      return;
    }
    await setRestaurantBySnapshot(id, snap.data());
  } catch (err) {
    console.error(err);
    adminLoginStatus.textContent = "Fehler: " + err.message;
    adminLoginStatus.classList.add("status-err");
  }
}

async function loginWithCode() {
  adminLoginStatus.textContent = "";
  adminLoginStatus.className = "status-text";

  const code = (adminCodeInput.value || "").trim();
  if (!code) {
    adminLoginStatus.textContent = "Bitte Besitzer-Code eingeben.";
    adminLoginStatus.classList.add("status-err");
    return;
  }

  try {
    const restCol = collection(db, "restaurants");
    const q = query(restCol, where("ownerCode", "==", code));
    const snap = await getDocs(q);

    if (snap.empty) {
      adminLoginStatus.textContent = "Kein Restaurant mit diesem Besitzer-Code gefunden.";
      adminLoginStatus.classList.add("status-err");
      return;
    }

    const docSnap = snap.docs[0];
    await setRestaurantBySnapshot(docSnap.id, docSnap.data());
  } catch (err) {
    console.error(err);
    adminLoginStatus.textContent = "Fehler: " + err.message;
    adminLoginStatus.classList.add("status-err");
  }
}

/* =========================
   MENÜ LADEN & RENDERN
   ========================= */

function inferTypeForItem(item) {
  if (item.type === "food" || item.type === "drink") return item.type;
  if (defaultDrinkCategories.includes(item.category)) return "drink";
  return "food";
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

  // ✅ Nach jedem Laden/Ändern: Public-Doc aktualisieren (für günstige Gäste-Reads)
  await syncPublicMenuIfChanged();
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

  // Alle Items mit sicherem type
  const itemsWithType = currentItems.map((item) => ({
    ...item,
    type: inferTypeForItem(item),
  }));

  const foodMap = new Map();   // category -> [items]
  const drinkMap = new Map();  // category -> [items]

  itemsWithType.forEach((item) => {
    const cat = item.category || "Ohne Kategorie";
    const map = item.type === "drink" ? drinkMap : foodMap;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(item);
  });

  // Helper zum Erzeugen einer Produktzeile (Card)
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
    if (typeof item.price === "number") {
      priceEl.textContent = item.price.toFixed(2) + " €";
    } else {
      priceEl.textContent = "";
    }

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
    availBtn.addEventListener("click", () =>
      toggleItemAvailability(item.id, available)
    );

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

    const sortedCats = Array.from(map.keys()).sort((a, b) =>
      a.localeCompare(b, "de")
    );

    sortedCats.forEach((cat) => {
      const catLabel = document.createElement("div");
      catLabel.className = "info";
      catLabel.style.marginTop = "6px";
      catLabel.textContent = cat;
      itemList.appendChild(catLabel);

      map.get(cat).forEach((item) => {
        const row = createRow(item);
        itemList.appendChild(row);
      });
    });
  }

  // Erst Speisekarte, dann Getränke
  renderGroup("Speisekarte", foodMap);
  renderGroup("Getränke", drinkMap);
}

/* =========================
   PRODUKT SPEICHERN / BEARBEITEN
   ========================= */

function resetForm() {
  currentEditItemId = null;
  adminItemStatus.textContent = "";
  adminItemStatus.className = "status-text";

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
  adminItemStatus.textContent = "Bearbeitung eines Produkts.";
  adminItemStatus.className = "status-text";

  const type = inferTypeForItem(item);
  setProductType(type);

  const categories =
    type === "drink" ? defaultDrinkCategories : defaultFoodCategories;

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
  itemPriceInput.value =
    typeof item.price === "number" ? item.price.toString() : "";

  // Bilder: imageUrls[] oder fallback auf imageUrl
  const images = Array.isArray(item.imageUrls) ? item.imageUrls : [];
  if (images.length) {
    itemImagesInput.value = images.join("\n");
  } else if (item.imageUrl) {
    itemImagesInput.value = item.imageUrl;
  } else {
    itemImagesInput.value = "";
  }

  itemSaveBtn.textContent = "Produkt aktualisieren";
}

async function saveItem() {
  if (!currentRestaurantId) return;

  adminItemStatus.textContent = "";
  adminItemStatus.className = "status-text";

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

  if (!category) {
    adminItemStatus.textContent = "Bitte eine Kategorie wählen oder eingeben.";
    adminItemStatus.classList.add("status-err");
    return;
  }
  if (!name) {
    adminItemStatus.textContent = "Bitte Produktname eingeben.";
    adminItemStatus.classList.add("status-err");
    return;
  }
  const price = parseFloat(priceStr.replace(",", "."));
  if (isNaN(price)) {
    adminItemStatus.textContent = "Bitte einen gültigen Preis eingeben.";
    adminItemStatus.classList.add("status-err");
    return;
  }

  const primaryImageUrl = imagesRaw[0] || "";

  const restRef = doc(db, "restaurants", currentRestaurantId);
  const menuCol = collection(restRef, "menuItems");

  const data = {
    type: currentProductType, // "food" oder "drink"
    category,
    name,
    description: desc,         // kurz = Zutaten
    longDescription: longDesc, // lang
    price,
    imageUrl: primaryImageUrl || null,
    imageUrls: imagesRaw.length ? imagesRaw : [],
    available: true,
  };

  try {
    itemSaveBtn.disabled = true;

    if (currentEditItemId) {
      await updateDoc(doc(menuCol, currentEditItemId), data);
      adminItemStatus.textContent = "Produkt aktualisiert.";
      adminItemStatus.classList.add("status-ok");
    } else {
      await addDoc(menuCol, data);
      adminItemStatus.textContent = "Produkt gespeichert.";
      adminItemStatus.classList.add("status-ok");
    }

    await loadMenuItems();
    resetForm();
  } catch (err) {
    console.error(err);
    adminItemStatus.textContent = "Fehler: " + err.message;
    adminItemStatus.classList.add("status-err");
  } finally {
    itemSaveBtn.disabled = false;
  }
}

async function toggleItemAvailability(itemId, currentlyAvailable) {
  if (!currentRestaurantId || !itemId) return;

  try {
    const restRef = doc(db, "restaurants", currentRestaurantId);
    const menuCol = collection(restRef, "menuItems");
    await updateDoc(doc(menuCol, itemId), {
      available: !currentlyAvailable,
    });
    await loadMenuItems();
  } catch (err) {
    console.error(err);
  }
}

async function deleteItem(itemId) {
  if (!currentRestaurantId || !itemId) return;
  const confirmDelete = window.confirm("Produkt wirklich löschen?");
  if (!confirmDelete) return;

  try {
    const restRef = doc(db, "restaurants", currentRestaurantId);
    const menuCol = collection(restRef, "menuItems");
    await deleteDoc(doc(menuCol, itemId));
    await loadMenuItems();
  } catch (err) {
    console.error(err);
  }
}

/* =========================
   HEUTIGE BESTELLUNGEN
   ========================= */

async function loadTodayOrders() {
  if (!currentRestaurantId) return;

  adminOrdersList.innerHTML = "";

  // Günstig: nur "heute" aus Firestore holen (nicht alle Orders laden)
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
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    ordersToday.push({ id: docSnap.id, ...data });
  });

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
      title.style.FontWeight = "600";
      const timeStr =
        order.createdAt && order.createdAt.toDate
          ? order.createdAt.toDate().toLocaleTimeString("de-AT", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
      title.textContent = `Tisch ${order.table || "?"} – ${timeStr}`;

      const itemsStr =
        (order.items || [])
          .map((i) => `${i.qty}× ${i.name}`)
          .join(", ") || "Keine Artikel";

      const itemsSpan = document.createElement("span");
      itemsSpan.style.fontSize = "0.78rem";
      itemsSpan.textContent = itemsStr;

      left.appendChild(title);
      left.appendChild(itemsSpan);

      const right = document.createElement("div");
      right.style.fontSize = "0.82rem";
      right.style.fontWeight = "600";

      const total = (order.items || []).reduce(
        (sum, i) => sum + (i.price || 0) * (i.qty || 0),
        0
      );
      right.textContent = total.toFixed(2) + " €";

      row.appendChild(left);
      row.appendChild(right);

      adminOrdersList.appendChild(row);
    });
}

/* =========================
   EVENTS
   ========================= */

// Login
adminLoginBtn.addEventListener("click", loginWithRestaurantId);
adminCodeLoginBtn.addEventListener("click", loginWithCode);

// Typ-Umschalter
typeFoodBtn.addEventListener("click", () => setProductType("food"));
typeDrinkBtn.addEventListener("click", () => setProductType("drink"));

// Speichern / Reset
itemSaveBtn.addEventListener("click", saveItem);
itemResetBtn.addEventListener("click", resetForm);

/* =========================
   INIT
   ========================= */

setProductType("food");

const savedId = loadOwnerSession();
if (savedId) {
  (async () => {
    try {
      const refRest = doc(db, "restaurants", savedId);
      const snap = await getDoc(refRest);
      if (snap.exists()) {
        await setRestaurantBySnapshot(savedId, snap.data());
      }
    } catch (err) {
      console.error(err);
    }
  })();
}