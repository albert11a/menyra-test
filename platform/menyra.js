// menyra.js – Superadmin (Kunden + Offers) – FIXED ROUTING
// Struktur-Regel: Wir arbeiten ab jetzt immer in GANZEN ABSCHNITTEN (START..END).

/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */
// --- START: ABSCHNITT 0 — IMPORTS ---
import { db } from "../shared/firebase-config.js";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
// --- END: ABSCHNITT 0 — IMPORTS ---

/* =========================================================
   ABSCHNITT 1 — DOM
   ========================================================= */
// --- START: ABSCHNITT 1 — DOM ---
// Kunden-Tab
const restNameInput = document.getElementById("restNameInput");
const ownerNameInput = document.getElementById("ownerNameInput");
const restCityInput = document.getElementById("restCityInput");
const tableCountInput = document.getElementById("tableCountInput");
const yearPriceInput = document.getElementById("yearPriceInput");
const phoneInput = document.getElementById("phoneInput");
const logoUrlInput = document.getElementById("logoUrlInput");

const createRestBtn = document.getElementById("createRestBtn");
const adminStatus = document.getElementById("adminStatus");
const restList = document.getElementById("restList");
const searchInput = document.getElementById("searchInput");
const filterActive = document.getElementById("filterActive");

// Tabs
const customersTab = document.getElementById("customersTab");
const offersTab = document.getElementById("offersTab");
const tabButtons = document.querySelectorAll(".tab-btn");

// Angebote-Tab
const offerRestaurantSelect = document.getElementById("offerRestaurantSelect");
const offersEnabledInput = document.getElementById("offersEnabledInput");

const offerEditorCard = document.getElementById("offerEditorCard");
const offerListCard = document.getElementById("offerListCard");

const offerTitleInput = document.getElementById("offerTitleInput");
const offerPriceInput = document.getElementById("offerPriceInput");
const offerImageInput = document.getElementById("offerImageInput");
const offerDescInput = document.getElementById("offerDescInput");
const offerActiveInput = document.getElementById("offerActiveInput");
const offerAddToCartInput = document.getElementById("offerAddToCartInput");
const offerMenuItemSelect = document.getElementById("offerMenuItemSelect");
const offerSaveBtn = document.getElementById("offerSaveBtn");
const offerNewBtn = document.getElementById("offerNewBtn");
const offerStatus = document.getElementById("offerStatus");
const offerList = document.getElementById("offerList");
// --- END: ABSCHNITT 1 — DOM ---

/* =========================================================
   ABSCHNITT 2 — ROUTING (✅ FIX für /platform/admin.html)
   ========================================================= */
// --- START: ABSCHNITT 2 — ROUTING (✅ FIX) ---
/**
 * Wichtig:
 * platform/ ist ein Ordner. Relative Links wie "admin.html" würden zu "/platform/admin.html".
 * Deine echten Seiten liegen aber in:
 *  - Guest:  ../guest/karte.html
 *  - Owner:  ../owner/admin.html
 *  - Staff:  ../staff/kamarieri.html
 */
const ROUTES = {
  guestCard: "../guest/karte.html",
  ownerAdmin: "../owner/admin.html",
  staffKamarieri: "../staff/kamarieri.html",
};

function buildUrl(relativePath, params = {}) {
  const url = new URL(relativePath, window.location.href);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });
  return url.toString();
}

const BASE_URL = window.location.origin;
// --- END: ABSCHNITT 2 — ROUTING (✅ FIX) ---

/* =========================================================
   ABSCHNITT 3 — GLOBAL STATE
   ========================================================= */
// --- START: ABSCHNITT 3 — GLOBAL STATE ---
let restaurantsCache = [];            // [{id, data}]
let currentOfferRestaurantId = null;  // Restaurant für Angebote
let currentOfferEditingId = null;     // Angebot im Edit-Modus
let currentOfferMenuItems = [];       // menuItems des aktuellen Restaurants
// --- END: ABSCHNITT 3 — GLOBAL STATE ---

/* =========================================================
   ABSCHNITT 4 — HELFER (Dates, Status, Codes)
   ========================================================= */
// --- START: ABSCHNITT 4 — HELFER ---
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-stellig
}

function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addOneYearISO() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysLeft(untilIso) {
  if (!untilIso) return null;
  const today = new Date(todayISO() + "T00:00:00");
  const until = new Date(untilIso + "T00:00:00");
  const diffMs = until - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function isSubscriptionValid(data) {
  if (!data?.subscriptionUntil) return true;
  return data.subscriptionUntil >= todayISO();
}

function getStatusLabel(data) {
  if (data?.active === false) return "Gesperrt";
  if (!isSubscriptionValid(data)) return "Abo abgelaufen";
  return "Aktiv";
}

function getStatusBadgeColor(label) {
  switch (label) {
    case "Aktiv":
      return { bg: "#dcfce7", fg: "#15803d" };
    case "Abo abgelaufen":
      return { bg: "#fee2e2", fg: "#b91c1c" };
    case "Gesperrt":
      return { bg: "#e5e7eb", fg: "#374151" };
    default:
      return { bg: "#e5e7eb", fg: "#374151" };
  }
}

function normalizeRestaurantId(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");
}

function parseEuroNumber(v) {
  const s = String(v || "").trim();
  if (!s) return 0;
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function parseIntSafe(v) {
  const s = String(v || "").trim();
  if (!s) return 0;
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}
// --- END: ABSCHNITT 4 — HELFER ---

/* =========================================================
   ABSCHNITT 5 — TABS
   ========================================================= */
// --- START: ABSCHNITT 5 — TABS ---
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tabTarget;
    tabButtons.forEach((b) => b.classList.remove("tab-btn-active"));
    btn.classList.add("tab-btn-active");

    if (target === "offersTab") {
      if (customersTab) customersTab.style.display = "none";
      if (offersTab) offersTab.style.display = "block";
    } else {
      if (customersTab) customersTab.style.display = "block";
      if (offersTab) offersTab.style.display = "none";
    }
  });
});
// --- END: ABSCHNITT 5 — TABS ---

/* =========================================================
   ABSCHNITT 6 — KUNDEN: CREATE
   ========================================================= */
// --- START: ABSCHNITT 6 — KUNDEN: CREATE ---
async function createRestaurant() {
  if (!adminStatus) return;

  adminStatus.textContent = "";
  adminStatus.className = "status-text";

  const restaurantName = (restNameInput?.value || "").trim();
  const ownerName = (ownerNameInput?.value || "").trim();
  const city = (restCityInput?.value || "").trim();
  const tableCount = parseIntSafe(tableCountInput?.value);
  const yearPrice = parseEuroNumber(yearPriceInput?.value);
  const phone = (phoneInput?.value || "").trim();
  const logoUrl = (logoUrlInput?.value || "").trim();

  if (!restaurantName) {
    adminStatus.textContent = "Bitte Restaurant-/Lokalname eingeben.";
    adminStatus.classList.add("status-err");
    return;
  }

  let idBase = normalizeRestaurantId(restaurantName);
  if (!idBase) idBase = `lokal-${Date.now()}`;

  const waiterCode = generateCode();
  const ownerCode = generateCode();

  const subscriptionStart = todayISO();
  const subscriptionUntil = addOneYearISO();

  try {
    if (createRestBtn) {
      createRestBtn.disabled = true;
      createRestBtn.textContent = "Speichere...";
    }

    // ✅ Kollisions-sicher (falls gleicher Name schon existiert)
    let id = idBase;
    const tryRef = doc(db, "restaurants", id);
    const trySnap = await getDoc(tryRef);
    if (trySnap.exists()) {
      const suffix = Math.random().toString(16).slice(2, 6);
      id = `${idBase}-${suffix}`;
    }

    const ref = doc(db, "restaurants", id);
    await setDoc(ref, {
      restaurantName,
      ownerName,
      city,
      tableCount,
      yearPrice,
      phone,
      logoUrl,
      waiterCode,
      ownerCode,
      active: true,
      offerActive: true,
      createdAt: serverTimestamp(),
      subscriptionStart,
      subscriptionUntil,
    });

    // ✅ Public Docs anlegen (damit Gäste später 1 Doc lesen können statt viele)
    // public/menu wird später vom Owner-Admin automatisch befüllt (admin.js sync)
    await setDoc(
      doc(db, "restaurants", id, "public", "menu"),
      { updatedAt: serverTimestamp(), version: 1, items: [] },
      { merge: true }
    );
    await setDoc(
      doc(db, "restaurants", id, "public", "offers"),
      { updatedAt: serverTimestamp(), version: 1, offers: [] },
      { merge: true }
    );

    adminStatus.textContent =
      `Kunde "${restaurantName}" angelegt. Kellner-Code: ${waiterCode}, Admin-Code: ${ownerCode}`;
    adminStatus.classList.add("status-ok");

    if (restNameInput) restNameInput.value = "";
    if (ownerNameInput) ownerNameInput.value = "";
    if (restCityInput) restCityInput.value = "";
    if (tableCountInput) tableCountInput.value = "";
    if (yearPriceInput) yearPriceInput.value = "";
    if (phoneInput) phoneInput.value = "";
    if (logoUrlInput) logoUrlInput.value = "";

    await loadRestaurants();
  } catch (err) {
    console.error(err);
    adminStatus.textContent = "Fehler: " + (err?.message || String(err));
    adminStatus.classList.add("status-err");
  } finally {
    if (createRestBtn) {
      createRestBtn.disabled = false;
      createRestBtn.textContent = "Kunden/Lokal erstellen";
    }
  }
}
// --- END: ABSCHNITT 6 — KUNDEN: CREATE ---

/* =========================================================
   ABSCHNITT 7 — KUNDEN: LOAD + RENDER (✅ Links gefixt)
   ========================================================= */
// --- START: ABSCHNITT 7 — KUNDEN: LOAD + RENDER ---
async function loadRestaurants() {
  if (!restList) return;

  restList.innerHTML = "<div class='info'>Lade...</div>";
  restaurantsCache = [];

  if (offerRestaurantSelect) {
    offerRestaurantSelect.innerHTML = '<option value="">Lokal wählen...</option>';
  }

  const snap = await getDocs(collection(db, "restaurants"));

  restList.innerHTML = "";

  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    const id = docSnap.id;

    restaurantsCache.push({ id, data });

    const tables = Number(data.tableCount || 0);

    const yearPriceNum =
      typeof data.yearPrice === "number" ? data.yearPrice : parseEuroNumber(data.yearPrice);

    const yearPriceDisplay = yearPriceNum > 0 ? ` • ${yearPriceNum.toFixed(2)} €/Jahr` : "";

    const statusLabel = getStatusLabel(data);
    const statusColors = getStatusBadgeColor(statusLabel);

    const aboText = data.subscriptionUntil
      ? (() => {
          const days = daysLeft(data.subscriptionUntil);
          const rest = days !== null
            ? ` (noch ${days} Tag${Math.abs(days) === 1 ? "" : "e"})`
            : "";
          return `Abo bis: ${data.subscriptionUntil}${rest}`;
        })()
      : "Abo bis: –";

    const card = document.createElement("div");
    card.className = "card";

    const searchText = [
      data.restaurantName || "",
      data.ownerName || "",
      data.city || "",
      data.phone || "",
      id || "",
    ].join(" ").toLowerCase();

    card.dataset.searchtext = searchText;
    card.dataset.active = statusLabel === "Aktiv" ? "1" : "0";

    // ✅ FIX: Speisekarte → ../owner/admin.html (nicht /platform/admin.html)
    const ownerAdminUrl = buildUrl(ROUTES.ownerAdmin, { r: id });

    card.innerHTML = `
      <div class="list-item-row">
        <span>
          <strong>${data.restaurantName || id}</strong><br/>
          <span class="info">
            Inhaber: ${data.ownerName || "-"}${data.phone ? " • " + data.phone : ""}<br/>
            Ort: ${data.city || "-"}<br/>
            ID: ${id}${tables ? " • Tische: " + tables : ""}${yearPriceDisplay}<br/>
            ${aboText}
          </span>
        </span>
        <span class="badge" style="background:${statusColors.bg}; color:${statusColors.fg};">
          ${statusLabel}
        </span>
      </div>

      <div class="info" style="margin-top:6px;">
        Kellner-Code: ${data.waiterCode || "-"} · Admin-Code: ${data.ownerCode || "-"}
      </div>

      <div class="list" style="margin-top:8px;">
        <button class="btn btn-ghost btn-small"
                data-action="show-qr"
                data-id="${id}"
                data-tables="${tables}">
          QR & Links
        </button>

        <a class="btn btn-primary btn-small" href="${ownerAdminUrl}">
          Speisekarte
        </a>

        <button class="btn btn-ghost btn-small"
                data-action="edit"
                data-id="${id}">
          Bearbeiten
        </button>

        <button class="btn btn-ghost btn-small"
                data-action="toggle-active"
                data-id="${id}">
          ${data.active === false ? "Aktivieren" : "Deaktivieren"}
        </button>
      </div>

      <div class="info" data-qr-block="${id}" style="display:none; margin-top:8px;"></div>
    `;

    restList.appendChild(card);

    // Dropdown im Angebote-Tab füllen
    if (offerRestaurantSelect) {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = data.restaurantName ? `${data.restaurantName} (${id})` : id;
      offerRestaurantSelect.appendChild(opt);
    }
  });

  if (!restList.hasChildNodes()) {
    restList.innerHTML = "<div class='info'>Noch keine Kunden/Lokale angelegt.</div>";
  }

  applyFilters();
}
// --- END: ABSCHNITT 7 — KUNDEN: LOAD + RENDER ---

/* =========================================================
   ABSCHNITT 8 — KUNDEN: QR / TOGGLE / EDIT (✅ QR Links gefixt)
   ========================================================= */
// --- START: ABSCHNITT 8 — KUNDEN: QR / TOGGLE / EDIT ---
if (restList) {
  restList.addEventListener("click", async (e) => {
    const qrBtn = e.target.closest("button[data-action='show-qr']");
    if (qrBtn) {
      const id = qrBtn.dataset.id;
      const tables = parseInt(qrBtn.dataset.tables || "0", 10);

      const block = restList.querySelector(`[data-qr-block="${id}"]`);
      if (!block) return;

      const isHidden = block.style.display === "none" || block.style.display === "";
      if (!isHidden) {
        block.style.display = "none";
        return;
      }

      if (!block.dataset.loaded) {
        let html = "";

        if (!tables) {
          html = "Keine Tische definiert.";
        } else {
          for (let i = 1; i <= tables; i++) {
            const t = `T${i}`;

            // ✅ FIX: QR Link muss auf ../guest/karte.html zeigen
            const guestUrl = buildUrl(ROUTES.guestCard, { r: id, t });

            html += `
              <div class="list-item-row" style="align-items:flex-start; margin-bottom:8px;">
                <span>
                  <strong>${t}</strong><br/>
                  <a href="${guestUrl}" target="_blank" class="info"
                     style="word-break:break-all; text-decoration:underline;">
                    ${guestUrl}
                  </a>
                </span>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(guestUrl)}"
                  alt="QR ${t}"
                />
              </div>
            `;
          }
        }

        block.innerHTML = html;
        block.dataset.loaded = "1";
      }

      block.style.display = "block";
      return;
    }

    const editBtn = e.target.closest("button[data-action='edit']");
    if (editBtn) {
      await editRestaurant(editBtn.dataset.id);
      return;
    }

    const toggleBtn = e.target.closest("button[data-action='toggle-active']");
    if (toggleBtn) {
      await toggleActive(toggleBtn.dataset.id, toggleBtn);
      return;
    }
  });
}

async function toggleActive(id, btn) {
  try {
    btn.disabled = true;
    btn.textContent = "Ändere...";

    const ref = doc(db, "restaurants", id);

    const card = btn.closest(".card");
    const cache = restaurantsCache.find((r) => r.id === id);
    const currentData = cache?.data || {};

    const isActiveNow = currentData.active !== false;
    const newActive = !isActiveNow;

    await updateDoc(ref, { active: newActive });

    // Cache + UI updaten
    if (cache) cache.data = { ...currentData, active: newActive };
    if (card) card.dataset.active = newActive && getStatusLabel({ ...currentData, active: newActive }) === "Aktiv" ? "1" : "0";

    const label = getStatusLabel({ ...currentData, active: newActive });
    const colors = getStatusBadgeColor(label);

    const badge = card?.querySelector(".badge");
    if (badge) {
      badge.textContent = label;
      badge.style.background = colors.bg;
      badge.style.color = colors.fg;
    }

    btn.textContent = newActive ? "Deaktivieren" : "Aktivieren";
    applyFilters();
  } catch (err) {
    console.error(err);
    alert("Fehler beim Aktualisieren: " + (err?.message || String(err)));
  } finally {
    btn.disabled = false;
  }
}

async function editRestaurant(id) {
  try {
    const ref = doc(db, "restaurants", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      alert("Kunde/Lokal nicht gefunden.");
      return;
    }
    const data = snap.data() || {};

    let restaurantName = prompt("Restaurant / Lokalname:", data.restaurantName || "");
    if (restaurantName === null) return;
    restaurantName = restaurantName.trim();
    if (!restaurantName) {
      alert("Name darf nicht leer sein.");
      return;
    }

    let ownerName = prompt("Inhaber / Kunde:", data.ownerName || "");
    if (ownerName === null) ownerName = data.ownerName || "";
    ownerName = ownerName.trim();

    let city = prompt("Stadt / Ort:", data.city || "");
    if (city === null) city = data.city || "";
    city = city.trim();

    let tableCountStr = prompt("Anzahl Tische:", data.tableCount != null ? String(data.tableCount) : "");
    if (tableCountStr === null) tableCountStr = data.tableCount != null ? String(data.tableCount) : "0";
    const tableCount = parseIntSafe(tableCountStr);

    let yearPriceStr = prompt("Preis pro Jahr (€):", data.yearPrice != null ? String(data.yearPrice) : "");
    if (yearPriceStr === null) yearPriceStr = data.yearPrice != null ? String(data.yearPrice) : "0";
    const yearPrice = parseEuroNumber(yearPriceStr);

    let phone = prompt("Telefon:", data.phone || "");
    if (phone === null) phone = data.phone || "";
    phone = phone.trim();

    let logoUrl = prompt("Logo-URL (optional):", data.logoUrl || "");
    if (logoUrl === null) logoUrl = data.logoUrl || "";
    logoUrl = logoUrl.trim();

    await updateDoc(ref, {
      restaurantName,
      ownerName,
      city,
      tableCount,
      yearPrice,
      phone,
      logoUrl,
    });

    await loadRestaurants();
    alert("Daten gespeichert.");
  } catch (err) {
    console.error(err);
    alert("Fehler beim Bearbeiten: " + (err?.message || String(err)));
  }
}
// --- END: ABSCHNITT 8 — KUNDEN: QR / TOGGLE / EDIT ---

/* =========================================================
   ABSCHNITT 9 — FILTER & SUCHE
   ========================================================= */
// --- START: ABSCHNITT 9 — FILTER & SUCHE ---
function applyFilters() {
  if (!restList) return;

  const queryStr = (searchInput?.value || "").toLowerCase();
  const onlyActive = !!filterActive?.checked;

  const cards = restList.querySelectorAll(".card");
  cards.forEach((card) => {
    const text = card.dataset.searchtext || "";
    const isActive = card.dataset.active !== "0";

    let visible = true;
    if (onlyActive && !isActive) visible = false;
    if (queryStr && !text.includes(queryStr)) visible = false;

    card.style.display = visible ? "block" : "none";
  });
}
// --- END: ABSCHNITT 9 — FILTER & SUCHE ---

/* =========================================================
   ABSCHNITT 10 — ANGEBOTE: HELPERS
   ========================================================= */
// --- START: ABSCHNITT 10 — ANGEBOTE: HELPERS ---
function resetOfferForm() {
  currentOfferEditingId = null;
  if (offerTitleInput) offerTitleInput.value = "";
  if (offerPriceInput) offerPriceInput.value = "";
  if (offerImageInput) offerImageInput.value = "";
  if (offerDescInput) offerDescInput.value = "";
  if (offerActiveInput) offerActiveInput.checked = true;
  if (offerAddToCartInput) offerAddToCartInput.checked = true;
  if (offerMenuItemSelect) offerMenuItemSelect.value = "";

  if (offerStatus) {
    offerStatus.textContent = "";
    offerStatus.className = "status-text";
  }
}

async function loadOfferMenuItems(restId) {
  currentOfferMenuItems = [];
  if (!offerMenuItemSelect) return;

  offerMenuItemSelect.innerHTML =
    '<option value="">Ohne Verknüpfung – freies Angebot / Werbung</option>';

  const menuCol = collection(doc(db, "restaurants", restId), "menuItems");
  const snap = await getDocs(menuCol);

  snap.forEach((docSnap) => {
    const d = docSnap.data() || {};
    const price = typeof d.price === "number" ? d.price.toFixed(2) + " €" : "";
    const label = `[${d.category || "Sonstiges"}] ${d.name || "Produkt"}${price ? " – " + price : ""}`;

    currentOfferMenuItems.push({ id: docSnap.id, ...d });

    const opt = document.createElement("option");
    opt.value = docSnap.id;
    opt.textContent = label;
    offerMenuItemSelect.appendChild(opt);
  });
}

async function loadOffersForRestaurant(restId) {
  if (!offerList) return;

  offerList.innerHTML = "<div class='info'>Lade...</div>";

  const offersCol = collection(doc(db, "restaurants", restId), "offers");
  const snap = await getDocs(offersCol);

  // ✅ Für Public-Doc Sync
  const offersForPublic = [];

  offerList.innerHTML = "";
  if (snap.empty) {
    offerList.innerHTML = "<div class='info'>Noch keine Angebote.</div>";
    if (offerListCard) offerListCard.style.display = "block";

    // Auch Public-Doc leeren (falls vorher etwas drin war)
    await syncPublicOffers(restId, []);
    return;
  }

  snap.forEach((docSnap) => {
    const d = docSnap.data() || {};
    const id = docSnap.id;

    offersForPublic.push({ id, ...d });

    const active = d.active !== false;
    const statusText = active ? "Aktiv" : "Inaktiv";
    const priceText = typeof d.price === "number" ? d.price.toFixed(2) + " €" : "";
    const addToCartText = d.addToCart ? "Bestellbar" : "Nur Info";
    const linkedText = d.menuItemId ? "Verknüpft mit Speisekarte" : "Eigenes Angebot";

    const row = document.createElement("div");
    row.className = "list-item-row";
    row.innerHTML = `
      <span>
        <strong>${d.title || "(ohne Titel)"}</strong><br/>
        <span class="info">
          ${priceText ? priceText + " • " : ""}${addToCartText} • ${linkedText}<br/>
          ${d.description || ""}
        </span>
      </span>
      <span style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
        <span class="badge" style="margin-bottom:4px;">${statusText}</span>
        <button class="btn btn-ghost btn-small" data-offer-action="edit" data-offer-id="${id}">
          Bearbeiten
        </button>
        <button class="btn btn-ghost btn-small" data-offer-action="toggle" data-offer-id="${id}">
          ${active ? "Deaktivieren" : "Aktivieren"}
        </button>
        <button class="btn btn-ghost btn-small" data-offer-action="delete" data-offer-id="${id}">
          Löschen
        </button>
      </span>
    `;
    offerList.appendChild(row);
  });

  // ✅ Public Offers Doc aktualisieren (Gäste lesen nur 1 Doc)
  await syncPublicOffers(restId, offersForPublic);

  if (offerListCard) offerListCard.style.display = "block";
}

async function syncPublicOffers(restId, offers) {
  try {
    const safe = (Array.isArray(offers) ? offers : [])
      .map((o) => ({
        id: o.id,
        title: o.title || "",
        description: o.description || "",
        imageUrl: o.imageUrl || "",
        active: o.active !== false,
        addToCart: o.addToCart === true,
        menuItemId: o.menuItemId || null,
        price: typeof o.price === "number" ? o.price : null,
      }))
      .slice(0, 10);

    await setDoc(
      doc(db, "restaurants", restId, "public", "offers"),
      { updatedAt: serverTimestamp(), version: 1, offers: safe },
      { merge: true }
    );
  } catch (err) {
    console.warn("Public offers sync failed:", err);
  }
}
// --- END: ABSCHNITT 10 — ANGEBOTE: HELPERS ---

/* =========================================================
   ABSCHNITT 11 — ANGEBOTE: EVENTS
   ========================================================= */
// --- START: ABSCHNITT 11 — ANGEBOTE: EVENTS ---
if (offerRestaurantSelect) {
  offerRestaurantSelect.addEventListener("change", async () => {
    const restId = offerRestaurantSelect.value || null;
    currentOfferRestaurantId = restId;
    resetOfferForm();

    if (offerEditorCard) offerEditorCard.style.display = restId ? "block" : "none";
    if (offerListCard) offerListCard.style.display = restId ? "block" : "none";
    if (!restId) return;

    const ref = doc(db, "restaurants", restId);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    if (offersEnabledInput) offersEnabledInput.checked = data.offerActive !== false;

    await loadOfferMenuItems(restId);
    await loadOffersForRestaurant(restId);
  });
}

if (offersEnabledInput) {
  offersEnabledInput.addEventListener("change", async () => {
    if (!currentOfferRestaurantId) return;
    try {
      const ref = doc(db, "restaurants", currentOfferRestaurantId);
      await updateDoc(ref, { offerActive: offersEnabledInput.checked });
    } catch (err) {
      console.error(err);
      alert("Fehler beim Aktualisieren des Angebots-Status: " + (err?.message || String(err)));
    }
  });
}

if (offerNewBtn) {
  offerNewBtn.addEventListener("click", () => resetOfferForm());
}

if (offerSaveBtn) {
  offerSaveBtn.addEventListener("click", async () => {
    if (!offerStatus) return;

    offerStatus.textContent = "";
    offerStatus.className = "status-text";

    if (!currentOfferRestaurantId) {
      offerStatus.textContent = "Bitte zuerst ein Lokal wählen.";
      offerStatus.classList.add("status-err");
      return;
    }

    const title = (offerTitleInput?.value || "").trim();
    const priceStr = (offerPriceInput?.value || "").trim();
    const imageUrl = (offerImageInput?.value || "").trim();
    const desc = (offerDescInput?.value || "").trim();
    const active = !!offerActiveInput?.checked;
    const addToCart = !!offerAddToCartInput?.checked;
    const menuItemId = offerMenuItemSelect?.value || "";

    if (!title) {
      offerStatus.textContent = "Titel ist Pflicht.";
      offerStatus.classList.add("status-err");
      return;
    }

    let price = null;
    if (priceStr) {
      const parsed = parseFloat(priceStr.replace(",", "."));
      if (isNaN(parsed)) {
        offerStatus.textContent = "Preis ist keine gültige Zahl.";
        offerStatus.classList.add("status-err");
        return;
      }
      price = parsed;
    }

    const data = {
      title,
      description: desc,
      imageUrl,
      active,
      addToCart,
      menuItemId: menuItemId || null,
      price: price !== null ? price : null,
    };

    try {
      offerSaveBtn.disabled = true;
      offerSaveBtn.textContent = "Speichere...";

      const offersCol = collection(doc(db, "restaurants", currentOfferRestaurantId), "offers");

      if (currentOfferEditingId) {
        await updateDoc(doc(offersCol, currentOfferEditingId), data);
      } else {
        const newRef = await addDoc(offersCol, data);
        currentOfferEditingId = newRef.id;
      }

      offerStatus.textContent = "Angebot gespeichert.";
      offerStatus.classList.add("status-ok");

      await loadOffersForRestaurant(currentOfferRestaurantId);
    } catch (err) {
      console.error(err);
      offerStatus.textContent = "Fehler: " + (err?.message || String(err));
      offerStatus.classList.add("status-err");
    } finally {
      offerSaveBtn.disabled = false;
      offerSaveBtn.textContent = "Angebot speichern";
    }
  });
}

if (offerList) {
  offerList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-offer-action]");
    if (!btn || !currentOfferRestaurantId) return;

    const action = btn.dataset.offerAction;
    const id = btn.dataset.offerId;
    const offerRef = doc(db, "restaurants", currentOfferRestaurantId, "offers", id);

    try {
      if (action === "delete") {
        if (!confirm("Dieses Angebot wirklich löschen?")) return;
        await deleteDoc(offerRef);
        await loadOffersForRestaurant(currentOfferRestaurantId);
      }

      if (action === "toggle") {
        const snap = await getDoc(offerRef);
        if (!snap.exists()) return;
        const d = snap.data() || {};
        const newActive = d.active === false;
        await updateDoc(offerRef, { active: newActive });
        await loadOffersForRestaurant(currentOfferRestaurantId);
      }

      if (action === "edit") {
        const snap = await getDoc(offerRef);
        if (!snap.exists()) return;
        const d = snap.data() || {};

        currentOfferEditingId = id;
        if (offerTitleInput) offerTitleInput.value = d.title || "";
        if (offerPriceInput) offerPriceInput.value = typeof d.price === "number" ? String(d.price) : "";
        if (offerImageInput) offerImageInput.value = d.imageUrl || "";
        if (offerDescInput) offerDescInput.value = d.description || "";
        if (offerActiveInput) offerActiveInput.checked = d.active !== false;
        if (offerAddToCartInput) offerAddToCartInput.checked = d.addToCart === true;
        if (offerMenuItemSelect) offerMenuItemSelect.value = d.menuItemId || "";

        if (offerStatus) {
          offerStatus.textContent = "Angebot im Bearbeitungsmodus.";
          offerStatus.className = "status-text";
        }
      }
    } catch (err) {
      console.error(err);
      alert("Fehler bei Angebot: " + (err?.message || String(err)));
    }
  });
}
// --- END: ABSCHNITT 11 — ANGEBOTE: EVENTS ---

/* =========================================================
   ABSCHNITT 12 — INIT
   ========================================================= */
// --- START: ABSCHNITT 12 — INIT ---
if (createRestBtn) createRestBtn.addEventListener("click", createRestaurant);
if (searchInput) searchInput.addEventListener("input", applyFilters);
if (filterActive) filterActive.addEventListener("change", applyFilters);

loadRestaurants();
// --- END: ABSCHNITT 12 — INIT ---
