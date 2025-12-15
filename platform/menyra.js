/* =========================================================
   MENYRA — Platform Admin (menyra.js)
   Clean + Stable Auth Guard (Firebase)
   ========================================================= */

/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */
// --- START: ABSCHNITT 0 — IMPORTS ---
import { db, auth } from "../shared/firebase-config.js";

import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
// --- END: ABSCHNITT 0 — IMPORTS ---


/* =========================================================
   ABSCHNITT 1 — ROUTES (Guest/Owner/Staff)
   ========================================================= */
// --- START: ABSCHNITT 1 — ROUTES ---
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
// --- END: ABSCHNITT 1 — ROUTES ---

// --- START: ABSCHNITT 2 — DOM ---
const sidebarNav = document.getElementById("sidebarNav");
const mobileNav = document.getElementById("mobileNav");

const views = document.querySelectorAll(".m-view");

const topSearch = document.getElementById("topSearch");
const mobileTopSearch = document.getElementById("mobileTopSearch");

const burgerToggle = document.getElementById("burgerToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
const mobileMenuClose = document.getElementById("mobileMenuClose");

const themeToggle = document.getElementById("themeToggle");
const mobileThemeToggle = document.getElementById("mobileThemeToggle");

// ✅ APP GATE (NEU)
const appGate = document.getElementById("appGate");
const appGateMsg = document.getElementById("appGateMsg");

// Sidebar logout
const logoutButton = document.getElementById("logoutButton");

// Dashboard
const dashActiveCustomers = document.getElementById("dashActiveCustomers");
const dashCustomersHint = document.getElementById("dashCustomersHint");
const dashOpenLeads = document.getElementById("dashOpenLeads");
const dashLeadsHint = document.getElementById("dashLeadsHint");
const dashTotalCustomers = document.getElementById("dashTotalCustomers");
const dashTotalLeads = document.getElementById("dashTotalLeads");
const dashLastCustomersList = document.getElementById("dashLastCustomersList");
const dashLastCustomersMeta = document.getElementById("dashLastCustomersMeta");
const dashRestaurantQuickSelect = document.getElementById("dashRestaurantQuickSelect");
const dashGoOffers = document.getElementById("dashGoOffers");
const openNewCustomerFromDashboard = document.getElementById("openNewCustomerFromDashboard");
const openNewLeadFromDashboard = document.getElementById("openNewLeadFromDashboard");

// Customers
const newCustomerBtn = document.getElementById("newCustomerBtn");
const customerSearch = document.getElementById("customerSearch");
const customersOnlyActive = document.getElementById("customersOnlyActive");
const customersTableBody = document.getElementById("customersTableBody");
const customersMeta = document.getElementById("customersMeta");
const customersFooter = document.getElementById("customersFooter");

// Offers
const offersRestaurantSelect = document.getElementById("offersRestaurantSelect");
const offersEnabledToggle = document.getElementById("offersEnabledToggle");
const offersEnabledBadge = document.getElementById("offersEnabledBadge");
const offersSelectedBadge = document.getElementById("offersSelectedBadge");
const offersStatus = document.getElementById("offersStatus");

const offerNewBtn = document.getElementById("offerNewBtn");
const offerEditorCard = document.getElementById("offerEditorCard");
const offersListCard = document.getElementById("offersListCard");

const offerEditorTitle = document.getElementById("offerEditorTitle");
const offerTitle = document.getElementById("offerTitle");
const offerPrice = document.getElementById("offerPrice");
const offerImageUrl = document.getElementById("offerImageUrl");
const offerMenuItem = document.getElementById("offerMenuItem");
const offerDesc = document.getElementById("offerDesc");
const offerActive = document.getElementById("offerActive");
const offerAddToCart = document.getElementById("offerAddToCart");
const offerSaveBtn = document.getElementById("offerSaveBtn");
const offerCancelBtn = document.getElementById("offerCancelBtn");
const offerEditorStatus = document.getElementById("offerEditorStatus");
const offersTableBody = document.getElementById("offersTableBody");

// Leads
const newLeadBtn = document.getElementById("newLeadBtn");
const leadsSearch = document.getElementById("leadsSearch");
const leadsMeta = document.getElementById("leadsMeta");
const leadsTableBody = document.getElementById("leadsTableBody");

const leadsTotalBadge = document.getElementById("leadsTotalBadge");
const leadsStatNew = document.getElementById("leadsStatNew");
const leadsStatContacted = document.getElementById("leadsStatContacted");
const leadsStatInterested = document.getElementById("leadsStatInterested");
const leadsStatNoInterest = document.getElementById("leadsStatNoInterest");

// Customer Modal
const customerModalOverlay = document.getElementById("customerModalOverlay");
const customerModalClose = document.getElementById("customerModalClose");
const customerCancelBtn = document.getElementById("customerCancelBtn");
const customerForm = document.getElementById("customerForm");
const customerModalTitle = document.getElementById("customerModalTitle");
const customerModalStatus = document.getElementById("customerModalStatus");

const customerId = document.getElementById("customerId");
const customerName = document.getElementById("customerName");
const customerOwner = document.getElementById("customerOwner");
const customerCity = document.getElementById("customerCity");
const customerPhone = document.getElementById("customerPhone");
const customerTableCount = document.getElementById("customerTableCount");
const customerYearPrice = document.getElementById("customerYearPrice");
const customerLogoUrl = document.getElementById("customerLogoUrl");
const customerStatus = document.getElementById("customerStatus");

// QR Modal
const qrModalOverlay = document.getElementById("qrModalOverlay");
const qrModalClose = document.getElementById("qrModalClose");
const qrModalTitle = document.getElementById("qrModalTitle");
const qrModalStatus = document.getElementById("qrModalStatus");
const guestTemplateCode = document.getElementById("guestTemplateCode");
const guestLinksList = document.getElementById("guestLinksList");
const ownerAdminLink = document.getElementById("ownerAdminLink");
const staffLoginLink = document.getElementById("staffLoginLink");
const qrCodesBox = document.getElementById("qrCodesBox");
const copyGuestTemplateBtn = document.getElementById("copyGuestTemplateBtn");
const copyCodesBtn = document.getElementById("copyCodesBtn");

// Lead Modal
const leadModalOverlay = document.getElementById("leadModalOverlay");
const leadModalClose = document.getElementById("leadModalClose");
const leadCancelBtn = document.getElementById("leadCancelBtn");
const leadForm = document.getElementById("leadForm");
const leadModalTitle = document.getElementById("leadModalTitle");
const leadModalStatus = document.getElementById("leadModalStatus");

const leadId = document.getElementById("leadId");
const leadBusinessName = document.getElementById("leadBusinessName");
const leadCustomerType = document.getElementById("leadCustomerType");
const leadInstagram = document.getElementById("leadInstagram");
const leadPhone = document.getElementById("leadPhone");
const leadStatus = document.getElementById("leadStatus");
const leadNote = document.getElementById("leadNote");
// --- END: ABSCHNITT 2 — DOM ---


/* =========================================================
   ABSCHNITT 3 — GLOBAL STATE
   ========================================================= */
// --- START: ABSCHNITT 3 — GLOBAL STATE ---
let activeView = "dashboard";

let restaurantsCache = []; // [{id, data}]
let leadsCache = [];       // [{id, data}]

let currentOfferRestaurantId = null;
let currentOfferEditingId = null;
let currentOfferMenuItems = []; // [{id, ...}]
let currentOffersCache = [];    // [{id, ...}]
// --- END: ABSCHNITT 3 — GLOBAL STATE ---

/* =========================================================
   ABSCHNITT 4 — HELPERS (Dates, Parsing, Status)
   ========================================================= */
// --- START: ABSCHNITT 4 — HELPERS ---
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addOneYearISO() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysLeft(untilIso) {
  if (!untilIso) return null;
  const today = new Date(todayISO() + "T00:00:00");
  const until = new Date(untilIso + "T00:00:00");
  return Math.ceil((until - today) / (1000 * 60 * 60 * 24));
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

function statusClass(label) {
  if (label === "Aktiv") return "m-status--ok";
  if (label === "Abo abgelaufen") return "m-status--bad";
  if (label === "Gesperrt") return "m-status--muted";
  return "";
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

function safeText(v) {
  return String(v ?? "").replace(/[<>]/g, "");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
// --- END: ABSCHNITT 4 — HELPERS ---

/* =========================================================
   ABSCHNITT 5 — UI: THEME + NAV + DRAWER
   ========================================================= */
// --- START: ABSCHNITT 5 — UI: THEME + NAV + DRAWER ---
function setTheme(isDark) {
  document.documentElement.classList.toggle("is-dark", !!isDark);
  localStorage.setItem("menyra_platform_theme", isDark ? "dark" : "light");
}
function initTheme() {
  const saved = localStorage.getItem("menyra_platform_theme");
  if (saved === "dark") setTheme(true);
  if (saved === "light") setTheme(false);
}
function toggleTheme() {
  const isDark = document.documentElement.classList.contains("is-dark");
  setTheme(!isDark);
}

function setActiveView(viewName) {
  activeView = viewName;

  views.forEach((v) => {
    const name = v.getAttribute("data-view");
    v.style.display = name === viewName ? "block" : "none";
  });

  // Sidebar active
  if (sidebarNav) {
    sidebarNav.querySelectorAll("a[data-section]").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.section === viewName);
    });
  }
  // Mobile active
  if (mobileNav) {
    mobileNav.querySelectorAll("button[data-section]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.section === viewName);
    });
  }

  // Optional: on entering offers, show hint
  if (viewName === "offers") {
    offersStatus.textContent = currentOfferRestaurantId ? "" : "Wähle ein Lokal, um Offers zu laden.";
  }
}

function openMobileMenu() {
  if (!mobileMenu || !mobileMenuOverlay) return;
  mobileMenuOverlay.style.display = "block";
  mobileMenu.style.transform = "translateX(0)";
  mobileMenu.setAttribute("aria-hidden", "false");
}
function closeMobileMenu() {
  if (!mobileMenu || !mobileMenuOverlay) return;
  mobileMenuOverlay.style.display = "none";
  mobileMenu.style.transform = "translateX(-105%)";
  mobileMenu.setAttribute("aria-hidden", "true");
}

if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
if (mobileThemeToggle) mobileThemeToggle.addEventListener("click", toggleTheme);

if (burgerToggle) burgerToggle.addEventListener("click", openMobileMenu);
if (mobileMenuClose) mobileMenuClose.addEventListener("click", closeMobileMenu);
if (mobileMenuOverlay) mobileMenuOverlay.addEventListener("click", closeMobileMenu);

if (sidebarNav) {
  sidebarNav.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-section]");
    if (!a) return;
    e.preventDefault();
    setActiveView(a.dataset.section);
  });
}
if (mobileNav) {
  mobileNav.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-section]");
    if (!b) return;
    setActiveView(b.dataset.section);
    closeMobileMenu();
  });
}
// --- END: ABSCHNITT 5 — UI: THEME + NAV + DRAWER ---

/* =========================================================
   ABSCHNITT 6 — DATA: LOAD RESTAURANTS (1x) + DASHBOARD
   ========================================================= */
// --- START: ABSCHNITT 6 — DATA: LOAD RESTAURANTS (1x) + DASHBOARD ---
async function loadRestaurants() {
  restaurantsCache = [];

  const snap = await getDocs(collection(db, "restaurants"));
  snap.forEach((docSnap) => {
    restaurantsCache.push({ id: docSnap.id, data: docSnap.data() || {} });
  });

  // sort by createdAt desc if possible
  restaurantsCache.sort((a, b) => {
    const ta = a.data?.createdAt?.toMillis?.() ?? 0;
    const tb = b.data?.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });

  renderCustomersTable();
  fillRestaurantSelects();
  renderDashboard();
}

function fillRestaurantSelects() {
  // dashboard quick select
  if (dashRestaurantQuickSelect) {
    dashRestaurantQuickSelect.innerHTML = `<option value="">– wählen –</option>`;
    restaurantsCache.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.data.restaurantName ? `${r.data.restaurantName} (${r.id})` : r.id;
      dashRestaurantQuickSelect.appendChild(opt);
    });
  }

  // offers select
  if (offersRestaurantSelect) {
    offersRestaurantSelect.innerHTML = `<option value="">– Lokal wählen –</option>`;
    restaurantsCache.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.data.restaurantName ? `${r.data.restaurantName} (${r.id})` : r.id;
      offersRestaurantSelect.appendChild(opt);
    });
  }
}

function renderDashboard() {
  const total = restaurantsCache.length;
  const active = restaurantsCache.filter(({ data }) => getStatusLabel(data) === "Aktiv").length;

  if (dashTotalCustomers) dashTotalCustomers.textContent = String(total);
  if (dashActiveCustomers) dashActiveCustomers.textContent = String(active);

  if (dashCustomersHint) {
    dashCustomersHint.textContent = total
      ? `${active} aktiv • ${total - active} nicht aktiv/abgelaufen`
      : "Noch keine Kunden.";
  }

  // last customers list (max 6)
  if (dashLastCustomersList) {
    dashLastCustomersList.innerHTML = "";
    const last = restaurantsCache.slice(0, 6);
    last.forEach((r) => {
      const li = document.createElement("li");
      li.className = "m-activity-item";
      const name = r.data.restaurantName || r.id;
      const sub = `${r.data.city || "—"} • ${getStatusLabel(r.data)}`;
      li.innerHTML = `
        <div class="m-activity-title">${safeText(name)}</div>
        <div class="m-activity-sub">${safeText(sub)}</div>
      `;
      dashLastCustomersList.appendChild(li);
    });
  }
  if (dashLastCustomersMeta) dashLastCustomersMeta.textContent = `${Math.min(total, 6)} / ${total}`;

  // leads stats
  const totalLeads = leadsCache.length;
  const openLeads = leadsCache.filter((l) => (l.data?.status || "new") === "new").length;

  if (dashTotalLeads) dashTotalLeads.textContent = String(totalLeads);
  if (dashOpenLeads) dashOpenLeads.textContent = String(openLeads);
  if (dashLeadsHint) dashLeadsHint.textContent = totalLeads ? `${openLeads} offen` : "Noch keine Leads.";
}
// --- END: ABSCHNITT 6 — DATA: LOAD RESTAURANTS (1x) + DASHBOARD ---

/* =========================================================
   ABSCHNITT 7 — CUSTOMERS: RENDER + FILTER + ACTIONS
   ========================================================= */
// --- START: ABSCHNITT 7 — CUSTOMERS: RENDER + FILTER + ACTIONS ---
function applyCustomerFilters() {
  const q = (customerSearch?.value || "").toLowerCase().trim();
  const onlyActive = !!customersOnlyActive?.checked;

  const filtered = restaurantsCache.filter(({ id, data }) => {
    const s = [
      id,
      data.restaurantName,
      data.ownerName,
      data.city,
      data.phone,
    ].join(" ").toLowerCase();

    const label = getStatusLabel(data);
    const ok = !onlyActive || label === "Aktiv";
    const hit = !q || s.includes(q);
    return ok && hit;
  });

  return filtered;
}

function renderCustomersTable() {
  if (!customersTableBody) return;

  const filtered = applyCustomerFilters();

  customersTableBody.innerHTML = "";

  filtered.forEach(({ id, data }) => {
    const label = getStatusLabel(data);
    const tables = Number(data.tableCount || 0);
    const yearPriceNum = typeof data.yearPrice === "number" ? data.yearPrice : parseEuroNumber(data.yearPrice);
    const priceDisplay = yearPriceNum > 0 ? `${yearPriceNum.toFixed(2)} €/Jahr` : "—";
    const abo = data.subscriptionUntil
      ? (() => {
          const d = daysLeft(data.subscriptionUntil);
          const extra = d !== null ? ` (${d} T)` : "";
          return `${data.subscriptionUntil}${extra}`;
        })()
      : "—";

    const row = document.createElement("div");
    row.className = "m-table-row m-table-row--item";

    row.innerHTML = `
      <div>
        <div style="font-weight:800;">${safeText(data.restaurantName || id)}</div>
        <div class="m-muted" style="font-size:12px;">ID: ${safeText(id)}${tables ? " • Tische: "+tables : ""}</div>
      </div>
      <div>${safeText(data.ownerName || "—")}</div>
      <div>${safeText(data.city || "—")}</div>
      <div>
        <div style="font-weight:700; font-size:12px;">${safeText(abo)}</div>
        <div class="m-muted" style="font-size:12px;">${safeText(priceDisplay)}</div>
      </div>
      <div><span class="m-status ${statusClass(label)}">${safeText(label)}</span></div>
      <div class="m-table-col-actions">
        <div class="m-table-actions">
          <button class="m-mini-btn" data-c-action="qr" data-id="${id}">QR</button>
          <a class="m-mini-btn" href="${buildUrl(ROUTES.ownerAdmin, { r: id })}" target="_blank" rel="noopener">Owner</a>
          <button class="m-mini-btn" data-c-action="edit" data-id="${id}">Edit</button>
          <button class="m-mini-btn" data-c-action="toggle" data-id="${id}">
            ${data.active === false ? "Aktivieren" : "Sperren"}
          </button>
          <button class="m-mini-btn m-mini-btn--danger" data-c-action="delete" data-id="${id}">Löschen</button>
        </div>
      </div>
    `;

    customersTableBody.appendChild(row);
  });

  if (customersMeta) customersMeta.textContent = `${filtered.length} / ${restaurantsCache.length}`;
  if (customersFooter) customersFooter.textContent = `Angezeigt: ${filtered.length}`;

  // refresh dashboard numbers quickly
  renderDashboard();
  fillRestaurantSelects();
}

if (customerSearch) customerSearch.addEventListener("input", renderCustomersTable);
if (customersOnlyActive) customersOnlyActive.addEventListener("change", renderCustomersTable);

if (customersTableBody) {
  customersTableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-c-action]");
    if (!btn) return;

    const action = btn.dataset.cAction;
    const id = btn.dataset.id;
    const found = restaurantsCache.find((r) => r.id === id);
    if (!found) return;

    if (action === "qr") {
      openQrModal(id, found.data);
      return;
    }
    if (action === "edit") {
      openCustomerModal({ mode: "edit", id, data: found.data });
      return;
    }
    if (action === "toggle") {
      await toggleCustomerActive(id);
      return;
    }
    if (action === "delete") {
      if (!confirm("Kunde wirklich löschen? (restaurants/{id})")) return;
      await deleteCustomer(id);
      return;
    }
  });
}

async function toggleCustomerActive(id) {
  const ref = doc(db, "restaurants", id);
  const cache = restaurantsCache.find((r) => r.id === id);
  const current = cache?.data || {};

  const isActiveNow = current.active !== false;
  const newActive = !isActiveNow;

  await updateDoc(ref, { active: newActive });

  if (cache) cache.data = { ...current, active: newActive };
  renderCustomersTable();

  // if currently selected offers restaurant, reflect state
  if (currentOfferRestaurantId === id) {
    offersStatus.textContent = "Status aktualisiert.";
  }
}

async function deleteCustomer(id) {
  await deleteDoc(doc(db, "restaurants", id));
  restaurantsCache = restaurantsCache.filter((r) => r.id !== id);

  // clear offers selection if deleted
  if (currentOfferRestaurantId === id) {
    currentOfferRestaurantId = null;
    if (offersRestaurantSelect) offersRestaurantSelect.value = "";
    resetOffersUI();
  }
  renderCustomersTable();
}
// --- END: ABSCHNITT 7 — CUSTOMERS: RENDER + FILTER + ACTIONS ---

/* =========================================================
   ABSCHNITT 8 — MODAL: CUSTOMER (CREATE/EDIT)
   ========================================================= */
// --- START: ABSCHNITT 8 — MODAL: CUSTOMER (CREATE/EDIT) ---
let customerModalMode = "new"; // new | edit
let customerPrefillFromLeadId = null;

function openCustomerModal({ mode = "new", id = "", data = null, prefill = null, fromLeadId = null } = {}) {
  customerModalMode = mode;
  customerPrefillFromLeadId = fromLeadId || null;

  if (!customerModalOverlay) return;
  customerModalOverlay.classList.remove("is-hidden");

  if (customerModalStatus) customerModalStatus.textContent = "";
  if (customerId) customerId.value = id || "";

  // default
  const d = data || {};
  const p = prefill || {};

  if (customerName) customerName.value = p.restaurantName ?? d.restaurantName ?? "";
  if (customerOwner) customerOwner.value = p.ownerName ?? d.ownerName ?? "";
  if (customerCity) customerCity.value = p.city ?? d.city ?? "";
  if (customerPhone) customerPhone.value = p.phone ?? d.phone ?? "";
  if (customerTableCount) customerTableCount.value = String(p.tableCount ?? d.tableCount ?? "");
  if (customerYearPrice) customerYearPrice.value = String(p.yearPrice ?? d.yearPrice ?? "");
  if (customerLogoUrl) customerLogoUrl.value = p.logoUrl ?? d.logoUrl ?? "";

  // map active into status
  let statusVal = "active";
  if (d?.active === false) statusVal = "paused";
  if (d?.customerStatus) statusVal = d.customerStatus; // keep if exists
  if (customerStatus) customerStatus.value = statusVal;

  if (customerModalTitle) {
    customerModalTitle.textContent = mode === "edit" ? "Kunde bearbeiten" : "Neuer Kunde";
  }
}

function closeCustomerModal() {
  if (!customerModalOverlay) return;
  customerModalOverlay.classList.add("is-hidden");
  customerModalMode = "new";
  customerPrefillFromLeadId = null;
}

if (customerModalClose) customerModalClose.addEventListener("click", closeCustomerModal);
if (customerCancelBtn) customerCancelBtn.addEventListener("click", closeCustomerModal);
if (customerModalOverlay) {
  customerModalOverlay.addEventListener("click", (e) => {
    if (e.target === customerModalOverlay) closeCustomerModal();
  });
}

if (newCustomerBtn) newCustomerBtn.addEventListener("click", () => openCustomerModal({ mode: "new" }));
if (openNewCustomerFromDashboard) openNewCustomerFromDashboard.addEventListener("click", () => {
  setActiveView("customers");
  openCustomerModal({ mode: "new" });
});

async function createCustomerDoc(payload) {
  const restaurantName = (payload.restaurantName || "").trim();
  if (!restaurantName) throw new Error("Restaurantname ist Pflicht.");

  let idBase = normalizeRestaurantId(restaurantName);
  if (!idBase) idBase = `lokal-${Date.now()}`;

  // collision safe
  let id = idBase;
  const tryRef = doc(db, "restaurants", id);
  const trySnap = await getDoc(tryRef);
  if (trySnap.exists()) {
    const suffix = Math.random().toString(16).slice(2, 6);
    id = `${idBase}-${suffix}`;
  }

  const waiterCode = generateCode();
  const ownerCode = generateCode();
  const subscriptionStart = todayISO();
  const subscriptionUntil = addOneYearISO();

  const ref = doc(db, "restaurants", id);

  await setDoc(ref, {
    restaurantName,
    ownerName: payload.ownerName || "",
    city: payload.city || "",
    tableCount: payload.tableCount || 0,
    yearPrice: payload.yearPrice || 0,
    phone: payload.phone || "",
    logoUrl: payload.logoUrl || "",
    waiterCode,
    ownerCode,
    active: payload.active !== false,
    customerStatus: payload.customerStatus || "active",
    offerActive: true,
    createdAt: serverTimestamp(),
    subscriptionStart,
    subscriptionUntil,
  });

  // public docs (cost saver for guests)
  await setDoc(doc(db, "restaurants", id, "public", "menu"), { updatedAt: serverTimestamp(), version: 1, items: [] }, { merge: true });
  await setDoc(doc(db, "restaurants", id, "public", "offers"), { updatedAt: serverTimestamp(), version: 1, offers: [] }, { merge: true });

  return { id, waiterCode, ownerCode, subscriptionUntil };
}

async function updateCustomerDoc(id, payload) {
  const ref = doc(db, "restaurants", id);
  await updateDoc(ref, payload);
}

if (customerForm) {
  customerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (customerModalStatus) customerModalStatus.textContent = "Speichere…";

    try {
      const restaurantName = (customerName?.value || "").trim();
      const ownerName = (customerOwner?.value || "").trim();
      const city = (customerCity?.value || "").trim();
      const phone = (customerPhone?.value || "").trim();
      const tableCount = parseIntSafe(customerTableCount?.value);
      const yearPrice = parseEuroNumber(customerYearPrice?.value);
      const logoUrl = (customerLogoUrl?.value || "").trim();
      const st = customerStatus?.value || "active";

      const active = st !== "paused";

      if (customerModalMode === "new") {
        const created = await createCustomerDoc({
          restaurantName,
          ownerName,
          city,
          phone,
          tableCount,
          yearPrice,
          logoUrl,
          active,
          customerStatus: st,
        });

        if (customerModalStatus) {
          customerModalStatus.textContent =
            `✅ Kunde erstellt. Owner-Code: ${created.ownerCode} • Kellner-Code: ${created.waiterCode} • Abo bis: ${created.subscriptionUntil}`;
        }

        // refresh data
        await loadRestaurants();

        // if created from lead: mark lead converted
        if (customerPrefillFromLeadId) {
          await safeMarkLeadConverted(customerPrefillFromLeadId, created.id);
          customerPrefillFromLeadId = null;
          await loadLeads(); // refresh lead list
        }

        // open QR modal quickly
        const found = restaurantsCache.find((r) => r.id === created.id);
        if (found) openQrModal(created.id, found.data);

      } else {
        const id = customerId?.value || "";
        if (!id) throw new Error("Fehlende Customer ID.");

        await updateCustomerDoc(id, {
          restaurantName,
          ownerName,
          city,
          phone,
          tableCount,
          yearPrice,
          logoUrl,
          active,
          customerStatus: st,
        });

        if (customerModalStatus) customerModalStatus.textContent = "✅ Gespeichert.";
        await loadRestaurants();
      }

      // close after short moment
      setTimeout(() => closeCustomerModal(), 400);
    } catch (err) {
      console.error(err);
      if (customerModalStatus) customerModalStatus.textContent = "❌ Fehler: " + (err?.message || String(err));
    }
  });
}
// --- END: ABSCHNITT 8 — MODAL: CUSTOMER (CREATE/EDIT) ---

/* =========================================================
   ABSCHNITT 9 — MODAL: QR & LINKS
   ========================================================= */
// --- START: ABSCHNITT 9 — MODAL: QR & LINKS ---
function openQrModal(id, data) {
  if (!qrModalOverlay) return;
  qrModalOverlay.classList.remove("is-hidden");

  if (qrModalTitle) qrModalTitle.textContent = `QR & Links – ${data?.restaurantName || id}`;
  if (qrModalStatus) qrModalStatus.textContent = "";

  const tables = Number(data?.tableCount || 0);

  const guestTemplate = `../guest/karte.html?r=${id}&t=T1`;
  if (guestTemplateCode) guestTemplateCode.textContent = guestTemplate;

  const ownerLink = buildUrl(ROUTES.ownerAdmin, { r: id });
  const staffLink = ROUTES.staffKamarieri;

  if (ownerAdminLink) ownerAdminLink.textContent = ownerLink;
  if (staffLoginLink) staffLoginLink.textContent = staffLink;

  if (qrCodesBox) {
    qrCodesBox.innerHTML = `
      <div><b>Owner:</b> ${safeText(data?.ownerCode || "—")}</div>
      <div><b>Kellner:</b> ${safeText(data?.waiterCode || "—")}</div>
    `;
  }

  if (guestLinksList) {
    guestLinksList.innerHTML = "";

    const maxShow = Math.min(tables || 0, 6);
    if (!maxShow) {
      guestLinksList.innerHTML = `<div class="m-muted">Keine Tische definiert.</div>`;
    } else {
      for (let i = 1; i <= maxShow; i++) {
        const t = `T${i}`;
        const url = buildUrl(ROUTES.guestCard, { r: id, t });
        const div = document.createElement("div");
        div.className = "m-qr-item";
        div.innerHTML = `
          <div class="m-qr-item-top">
            <div>
              <div style="font-weight:900;">${t}</div>
              <div style="margin-top:6px;">
                <a href="${url}" target="_blank" rel="noopener">${url}</a>
              </div>
            </div>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}"
              alt="QR ${t}"
              style="width:120px; height:120px; border-radius:12px; border:1px solid rgba(148,163,184,0.25);"
            />
          </div>
        `;
        guestLinksList.appendChild(div);
      }

      if (tables > maxShow) {
        const more = document.createElement("div");
        more.className = "m-muted";
        more.textContent = `+ ${tables - maxShow} weitere Tische (werden auf Wunsch auch angezeigt)`;
        guestLinksList.appendChild(more);
      }
    }
  }
}

function closeQrModal() {
  if (!qrModalOverlay) return;
  qrModalOverlay.classList.add("is-hidden");
}
if (qrModalClose) qrModalClose.addEventListener("click", closeQrModal);
if (qrModalOverlay) {
  qrModalOverlay.addEventListener("click", (e) => {
    if (e.target === qrModalOverlay) closeQrModal();
  });
}

if (copyGuestTemplateBtn) {
  copyGuestTemplateBtn.addEventListener("click", async () => {
    const ok = await copyToClipboard(guestTemplateCode?.textContent || "");
    if (qrModalStatus) qrModalStatus.textContent = ok ? "✅ Kopiert." : "❌ Konnte nicht kopieren.";
  });
}

if (copyCodesBtn) {
  copyCodesBtn.addEventListener("click", async () => {
    const txt = [
      `Owner Admin: ${ownerAdminLink?.textContent || ""}`,
      `Staff Login: ${staffLoginLink?.textContent || ""}`,
      `Owner Code: ${restaurantsCache.find(r => r.id)?.data?.ownerCode || ""}`,
    ].join("\n");
    const ok = await copyToClipboard(txt);
    if (qrModalStatus) qrModalStatus.textContent = ok ? "✅ Kopiert." : "❌ Konnte nicht kopieren.";
  });
}
// --- END: ABSCHNITT 9 — MODAL: QR & LINKS ---

/* =========================================================
   ABSCHNITT 10 — OFFERS: LOAD/RENDER/EDIT (ON-DEMAND)
   ========================================================= */
// --- START: ABSCHNITT 10 — OFFERS: LOAD/RENDER/EDIT (ON-DEMAND) ---
function resetOffersUI() {
  currentOfferRestaurantId = null;
  currentOfferEditingId = null;
  currentOfferMenuItems = [];
  currentOffersCache = [];

  if (offersSelectedBadge) offersSelectedBadge.textContent = "Kein Lokal gewählt";
  if (offersEnabledToggle) offersEnabledToggle.checked = false;
  if (offersEnabledBadge) offersEnabledBadge.textContent = "Offers deaktiviert";

  if (offerNewBtn) offerNewBtn.disabled = true;

  if (offerEditorCard) offerEditorCard.style.display = "none";
  if (offersListCard) offersListCard.style.display = "none";

  if (offersTableBody) offersTableBody.innerHTML = "";
  if (offersStatus) offersStatus.textContent = "Wähle ein Lokal, um Offers zu laden.";

  resetOfferEditor();
}

function resetOfferEditor() {
  currentOfferEditingId = null;
  if (offerEditorTitle) offerEditorTitle.textContent = "Neues Angebot";
  if (offerTitle) offerTitle.value = "";
  if (offerPrice) offerPrice.value = "";
  if (offerImageUrl) offerImageUrl.value = "";
  if (offerDesc) offerDesc.value = "";
  if (offerActive) offerActive.checked = true;
  if (offerAddToCart) offerAddToCart.checked = true;
  if (offerMenuItem) offerMenuItem.value = "";
  if (offerEditorStatus) offerEditorStatus.textContent = "";
}

async function loadOfferMenuItems(restId) {
  currentOfferMenuItems = [];
  if (!offerMenuItem) return;

  offerMenuItem.innerHTML = `<option value="">Ohne Verknüpfung</option>`;

  const menuCol = collection(doc(db, "restaurants", restId), "menuItems");
  const snap = await getDocs(menuCol);

  snap.forEach((d) => {
    const data = d.data() || {};
    currentOfferMenuItems.push({ id: d.id, ...data });

    const price = typeof data.price === "number" ? ` – ${data.price.toFixed(2)} €` : "";
    const label = `[${data.category || "Sonstiges"}] ${data.name || "Produkt"}${price}`;

    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = label;
    offerMenuItem.appendChild(opt);
  });
}

async function loadOffersForRestaurant(restId) {
  currentOffersCache = [];

  if (!offersTableBody) return;
  offersTableBody.innerHTML = "";

  const offersCol = collection(doc(db, "restaurants", restId), "offers");
  const snap = await getDocs(offersCol);

  snap.forEach((docSnap) => {
    const d = docSnap.data() || {};
    currentOffersCache.push({ id: docSnap.id, ...d });
  });

  renderOffersTable();
  await syncPublicOffers(restId, currentOffersCache);
}

function renderOffersTable() {
  if (!offersTableBody) return;

  offersTableBody.innerHTML = "";

  if (!currentOffersCache.length) {
    offersTableBody.innerHTML = `<div class="m-muted" style="padding:10px 0;">Noch keine Angebote.</div>`;
    if (offersListCard) offersListCard.style.display = "block";
    return;
  }

  currentOffersCache.forEach((o) => {
    const active = o.active !== false;
    const statusText = active ? "Aktiv" : "Inaktiv";
    const priceText = typeof o.price === "number" ? `${o.price.toFixed(2)} €` : "—";

    const row = document.createElement("div");
    row.className = "m-table-row m-table-row--item";
    row.style.gridTemplateColumns = "2fr 1.2fr 1fr 0.9fr";

    row.innerHTML = `
      <div>
        <div style="font-weight:900;">${safeText(o.title || "(ohne Titel)")}</div>
        <div class="m-muted" style="font-size:12px; margin-top:4px;">
          ${safeText(o.menuItemId ? "Verknüpft" : "Eigenes Angebot")} • ${safeText(o.addToCart ? "Bestellbar" : "Nur Info")}
        </div>
      </div>
      <div><span class="m-status ${active ? "m-status--ok" : "m-status--muted"}">${statusText}</span></div>
      <div>${safeText(priceText)}</div>
      <div class="m-table-col-actions">
        <div class="m-table-actions">
          <button class="m-mini-btn" data-o-action="edit" data-o-id="${o.id}">Edit</button>
          <button class="m-mini-btn" data-o-action="toggle" data-o-id="${o.id}">${active ? "Off" : "On"}</button>
          <button class="m-mini-btn m-mini-btn--danger" data-o-action="delete" data-o-id="${o.id}">X</button>
        </div>
      </div>
    `;

    offersTableBody.appendChild(row);
  });

  if (offersListCard) offersListCard.style.display = "block";
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

function openOfferEditor({ mode = "new", offer = null } = {}) {
  if (!offerEditorCard) return;
  offerEditorCard.style.display = "block";

  if (mode === "new") {
    resetOfferEditor();
    if (offerEditorTitle) offerEditorTitle.textContent = "Neues Angebot";
    return;
  }

  // edit
  currentOfferEditingId = offer?.id || null;
  if (offerEditorTitle) offerEditorTitle.textContent = "Angebot bearbeiten";

  if (offerTitle) offerTitle.value = offer?.title || "";
  if (offerPrice) offerPrice.value = typeof offer?.price === "number" ? String(offer.price) : "";
  if (offerImageUrl) offerImageUrl.value = offer?.imageUrl || "";
  if (offerDesc) offerDesc.value = offer?.description || "";
  if (offerActive) offerActive.checked = offer?.active !== false;
  if (offerAddToCart) offerAddToCart.checked = offer?.addToCart === true;
  if (offerMenuItem) offerMenuItem.value = offer?.menuItemId || "";

  if (offerEditorStatus) offerEditorStatus.textContent = "Bearbeitungsmodus aktiv.";
}

function closeOfferEditor() {
  if (offerEditorCard) offerEditorCard.style.display = "none";
  resetOfferEditor();
}

if (offerCancelBtn) offerCancelBtn.addEventListener("click", closeOfferEditor);

if (offerNewBtn) {
  offerNewBtn.addEventListener("click", () => {
    if (!currentOfferRestaurantId) return;
    openOfferEditor({ mode: "new" });
  });
}

if (offersRestaurantSelect) {
  offersRestaurantSelect.addEventListener("change", async () => {
    const restId = offersRestaurantSelect.value || null;
    currentOfferRestaurantId = restId;
    closeOfferEditor();

    if (!restId) {
      resetOffersUI();
      return;
    }

    // UI enable
    if (offerNewBtn) offerNewBtn.disabled = false;
    if (offersSelectedBadge) {
      const r = restaurantsCache.find((x) => x.id === restId);
      offersSelectedBadge.textContent = r?.data?.restaurantName ? `Lokal: ${r.data.restaurantName}` : `Lokal: ${restId}`;
    }

    // load toggle state from restaurant doc (one read)
    try {
      const rs = await getDoc(doc(db, "restaurants", restId));
      const d = rs.exists() ? rs.data() : {};
      const enabled = d?.offerActive !== false;
      if (offersEnabledToggle) offersEnabledToggle.checked = enabled;
      if (offersEnabledBadge) offersEnabledBadge.textContent = enabled ? "Offers aktiviert" : "Offers deaktiviert";
    } catch {}

    if (offersStatus) offersStatus.textContent = "Lade Offers & MenuItems…";

    // load menu items + offers (on demand)
    await loadOfferMenuItems(restId);
    await loadOffersForRestaurant(restId);

    if (offersListCard) offersListCard.style.display = "block";
    if (offersStatus) offersStatus.textContent = "";
  });
}

if (offersEnabledToggle) {
  offersEnabledToggle.addEventListener("change", async () => {
    if (!currentOfferRestaurantId) return;
    try {
      await updateDoc(doc(db, "restaurants", currentOfferRestaurantId), { offerActive: !!offersEnabledToggle.checked });
      if (offersEnabledBadge) offersEnabledBadge.textContent = offersEnabledToggle.checked ? "Offers aktiviert" : "Offers deaktiviert";
    } catch (err) {
      console.error(err);
      alert("Fehler beim Aktualisieren: " + (err?.message || String(err)));
    }
  });
}

if (offersTableBody) {
  offersTableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-o-action]");
    if (!btn || !currentOfferRestaurantId) return;

    const action = btn.dataset.oAction;
    const id = btn.dataset.oId;

    const idx = currentOffersCache.findIndex((o) => o.id === id);
    if (idx < 0) return;

    if (action === "edit") {
      openOfferEditor({ mode: "edit", offer: currentOffersCache[idx] });
      return;
    }

    if (action === "toggle") {
      const cur = currentOffersCache[idx];
      const newActive = cur.active === false; // if false -> true, else -> false
      await updateDoc(doc(db, "restaurants", currentOfferRestaurantId, "offers", id), { active: newActive });
      currentOffersCache[idx] = { ...cur, active: newActive };
      renderOffersTable();
      await syncPublicOffers(currentOfferRestaurantId, currentOffersCache);
      return;
    }

    if (action === "delete") {
      if (!confirm("Dieses Angebot wirklich löschen?")) return;
      await deleteDoc(doc(db, "restaurants", currentOfferRestaurantId, "offers", id));
      currentOffersCache.splice(idx, 1);
      renderOffersTable();
      await syncPublicOffers(currentOfferRestaurantId, currentOffersCache);
      return;
    }
  });
}

if (offerSaveBtn) {
  offerSaveBtn.addEventListener("click", async () => {
    if (!currentOfferRestaurantId) return;

    if (offerEditorStatus) offerEditorStatus.textContent = "Speichere…";

    try {
      const title = (offerTitle?.value || "").trim();
      if (!title) throw new Error("Titel ist Pflicht.");

      const priceStr = (offerPrice?.value || "").trim();
      let price = null;
      if (priceStr) {
        const p = parseFloat(priceStr.replace(",", "."));
        if (isNaN(p)) throw new Error("Preis ist keine gültige Zahl.");
        price = p;
      }

      const data = {
        title,
        description: (offerDesc?.value || "").trim(),
        imageUrl: (offerImageUrl?.value || "").trim(),
        active: !!offerActive?.checked,
        addToCart: !!offerAddToCart?.checked,
        menuItemId: offerMenuItem?.value ? offerMenuItem.value : null,
        price: price !== null ? price : null,
      };

      if (currentOfferEditingId) {
        await updateDoc(doc(db, "restaurants", currentOfferRestaurantId, "offers", currentOfferEditingId), data);
        const i = currentOffersCache.findIndex((o) => o.id === currentOfferEditingId);
        if (i >= 0) currentOffersCache[i] = { ...currentOffersCache[i], ...data };
      } else {
        const newRef = await addDoc(collection(doc(db, "restaurants", currentOfferRestaurantId), "offers"), data);
        currentOfferEditingId = newRef.id;
        currentOffersCache.unshift({ id: newRef.id, ...data });
      }

      renderOffersTable();
      await syncPublicOffers(currentOfferRestaurantId, currentOffersCache);

      if (offerEditorStatus) offerEditorStatus.textContent = "✅ Gespeichert.";
      setTimeout(() => { closeOfferEditor(); }, 250);
    } catch (err) {
      console.error(err);
      if (offerEditorStatus) offerEditorStatus.textContent = "❌ Fehler: " + (err?.message || String(err));
    }
  });
}

if (dashGoOffers) {
  dashGoOffers.addEventListener("click", () => {
    setActiveView("offers");
    const id = dashRestaurantQuickSelect?.value || "";
    if (id && offersRestaurantSelect) {
      offersRestaurantSelect.value = id;
      offersRestaurantSelect.dispatchEvent(new Event("change"));
    }
  });
}

function ensureOffersDefaultsOnInit() {
  if (offersStatus) offersStatus.textContent = "Wähle ein Lokal, um Offers zu laden.";
  if (offerNewBtn) offerNewBtn.disabled = true;
  if (offersEnabledToggle) offersEnabledToggle.checked = false;
  if (offersEnabledBadge) offersEnabledBadge.textContent = "Offers deaktiviert";
}
// --- END: ABSCHNITT 10 — OFFERS: LOAD/RENDER/EDIT (ON-DEMAND) ---

/* =========================================================
   ABSCHNITT 11 — LEADS: LOAD/RENDER/CRUD + CONVERT
   ========================================================= */
// --- START: ABSCHNITT 11 — LEADS: LOAD/RENDER/CRUD + CONVERT ---
async function loadLeads() {
  leadsCache = [];

  try {
    const qy = query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(qy);
    snap.forEach((d) => leadsCache.push({ id: d.id, data: d.data() || {} }));
  } catch (err) {
    console.warn("Leads query fallback:", err);
    const snap = await getDocs(collection(db, "leads"));
    snap.forEach((d) => leadsCache.push({ id: d.id, data: d.data() || {} }));
    // sort + slice
    leadsCache.sort((a, b) => (b.data?.createdAt?.toMillis?.() ?? 0) - (a.data?.createdAt?.toMillis?.() ?? 0));
    leadsCache = leadsCache.slice(0, 200);
  }

  renderLeads();
  renderDashboard();
}

function applyLeadsFilter() {
  const q = (leadsSearch?.value || "").toLowerCase().trim();
  return leadsCache.filter(({ id, data }) => {
    const s = [
      id,
      data.businessName,
      data.instagram,
      data.phone,
      data.note,
    ].join(" ").toLowerCase();
    return !q || s.includes(q);
  });
}

function leadStatusLabel(v) {
  switch (v) {
    case "new": return "Offen";
    case "contacted": return "Kontaktiert";
    case "waiting": return "Warten";
    case "interested": return "Interesse";
    case "no_interest": return "Kein Interesse";
    case "converted": return "Converted";
    default: return "Offen";
  }
}

function renderLeads() {
  if (!leadsTableBody) return;

  const filtered = applyLeadsFilter();
  leadsTableBody.innerHTML = "";

  // stats
  const total = leadsCache.length;
  const sNew = leadsCache.filter((l) => (l.data?.status || "new") === "new").length;
  const sCont = leadsCache.filter((l) => ["contacted","waiting"].includes(l.data?.status)).length;
  const sInt = leadsCache.filter((l) => (l.data?.status || "") === "interested").length;
  const sNo = leadsCache.filter((l) => (l.data?.status || "") === "no_interest").length;

  if (leadsTotalBadge) leadsTotalBadge.textContent = String(total);
  if (leadsStatNew) leadsStatNew.textContent = `Offen: ${sNew}`;
  if (leadsStatContacted) leadsStatContacted.textContent = `Kontaktiert/Warten: ${sCont}`;
  if (leadsStatInterested) leadsStatInterested.textContent = `Interesse: ${sInt}`;
  if (leadsStatNoInterest) leadsStatNoInterest.textContent = `Kein Interesse: ${sNo}`;

  filtered.forEach(({ id, data }) => {
    const st = data.status || "new";
    const label = leadStatusLabel(st);

    const contact = [
      data.instagram ? `IG: ${data.instagram}` : "",
      data.phone ? `Tel: ${data.phone}` : "",
    ].filter(Boolean).join(" • ") || "—";

    const row = document.createElement("div");
    row.className = "m-table-row m-table-row--item";
    row.style.gridTemplateColumns = "2fr 1.4fr 1fr 1.4fr";

    row.innerHTML = `
      <div>
        <div style="font-weight:900;">${safeText(data.businessName || "(ohne Name)")}</div>
        <div class="m-muted" style="font-size:12px; margin-top:4px;">${safeText(data.customerType || "—")}</div>
      </div>
      <div>${safeText(contact)}</div>
      <div><span class="m-status ${st === "no_interest" ? "m-status--bad" : st === "interested" ? "m-status--ok" : "m-status--muted"}">${safeText(label)}</span></div>
      <div class="m-table-col-actions">
        <div class="m-table-actions">
          <button class="m-mini-btn" data-l-action="edit" data-l-id="${id}">Edit</button>
          <button class="m-mini-btn" data-l-action="cycle" data-l-id="${id}">Status</button>
          <button class="m-mini-btn" data-l-action="convert" data-l-id="${id}">Zu Kunde</button>
          <button class="m-mini-btn m-mini-btn--danger" data-l-action="delete" data-l-id="${id}">X</button>
        </div>
      </div>
    `;
    leadsTableBody.appendChild(row);
  });

  if (leadsMeta) leadsMeta.textContent = `${filtered.length} / ${leadsCache.length}`;
}

if (leadsSearch) leadsSearch.addEventListener("input", renderLeads);

function openLeadModal({ mode = "new", id = "", data = null } = {}) {
  if (!leadModalOverlay) return;
  leadModalOverlay.classList.remove("is-hidden");

  if (leadModalStatus) leadModalStatus.textContent = "";
  if (leadId) leadId.value = id || "";

  const d = data || {};
  if (leadBusinessName) leadBusinessName.value = d.businessName || "";
  if (leadCustomerType) leadCustomerType.value = d.customerType || "restaurant";
  if (leadInstagram) leadInstagram.value = d.instagram || "";
  if (leadPhone) leadPhone.value = d.phone || "";
  if (leadStatus) leadStatus.value = d.status || "new";
  if (leadNote) leadNote.value = d.note || "";

  if (leadModalTitle) leadModalTitle.textContent = mode === "edit" ? "Lead bearbeiten" : "Neuer Lead";
}

function closeLeadModal() {
  if (!leadModalOverlay) return;
  leadModalOverlay.classList.add("is-hidden");
}

if (newLeadBtn) newLeadBtn.addEventListener("click", () => openLeadModal({ mode: "new" }));
if (openNewLeadFromDashboard) openNewLeadFromDashboard.addEventListener("click", () => {
  setActiveView("leads");
  openLeadModal({ mode: "new" });
});
if (leadModalClose) leadModalClose.addEventListener("click", closeLeadModal);
if (leadCancelBtn) leadCancelBtn.addEventListener("click", closeLeadModal);
if (leadModalOverlay) {
  leadModalOverlay.addEventListener("click", (e) => {
    if (e.target === leadModalOverlay) closeLeadModal();
  });
}

if (leadForm) {
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (leadModalStatus) leadModalStatus.textContent = "Speichere…";

    try {
      const businessName = (leadBusinessName?.value || "").trim();
      if (!businessName) throw new Error("Betrieb ist Pflicht.");

      const data = {
        businessName,
        customerType: leadCustomerType?.value || "restaurant",
        instagram: (leadInstagram?.value || "").trim(),
        phone: (leadPhone?.value || "").trim(),
        status: leadStatus?.value || "new",
        note: (leadNote?.value || "").trim(),
        updatedAt: serverTimestamp(),
      };

      const id = (leadId?.value || "").trim();
      if (id) {
        await updateDoc(doc(db, "leads", id), data);
      } else {
        await addDoc(collection(db, "leads"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }

      if (leadModalStatus) leadModalStatus.textContent = "✅ Gespeichert.";
      closeLeadModal();
      await loadLeads();
    } catch (err) {
      console.error(err);
      if (leadModalStatus) leadModalStatus.textContent = "❌ Fehler: " + (err?.message || String(err));
    }
  });
}

function nextLeadStatus(cur) {
  const order = ["new", "contacted", "waiting", "interested", "no_interest"];
  const i = order.indexOf(cur);
  return order[(i + 1) % order.length];
}

async function safeMarkLeadConverted(leadIdValue, restaurantId) {
  try {
    await updateDoc(doc(db, "leads", leadIdValue), {
      status: "converted",
      convertedRestaurantId: restaurantId,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("Mark lead converted failed:", e);
  }
}

if (leadsTableBody) {
  leadsTableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-l-action]");
    if (!btn) return;

    const action = btn.dataset.lAction;
    const id = btn.dataset.lId;

    const entry = leadsCache.find((l) => l.id === id);
    if (!entry) return;

    if (action === "edit") {
      openLeadModal({ mode: "edit", id, data: entry.data });
      return;
    }

    if (action === "cycle") {
      const cur = entry.data.status || "new";
      const nxt = nextLeadStatus(cur);
      await updateDoc(doc(db, "leads", id), { status: nxt, updatedAt: serverTimestamp() });
      entry.data = { ...entry.data, status: nxt };
      renderLeads();
      renderDashboard();
      return;
    }

    if (action === "convert") {
      // open customer modal prefilled, and after create mark lead converted
      openCustomerModal({
        mode: "new",
        prefill: {
          restaurantName: entry.data.businessName || "",
          phone: entry.data.phone || "",
          ownerName: "",
          city: "",
          tableCount: 0,
          yearPrice: 0,
          logoUrl: "",
        },
        fromLeadId: id,
      });
      return;
    }

    if (action === "delete") {
      if (!confirm("Lead wirklich löschen?")) return;
      await deleteDoc(doc(db, "leads", id));
      leadsCache = leadsCache.filter((l) => l.id !== id);
      renderLeads();
      renderDashboard();
      return;
    }
  });
}
// --- END: ABSCHNITT 11 — LEADS: LOAD/RENDER/CRUD + CONVERT ---

/* =========================================================
   ABSCHNITT 12 — GLOBAL SEARCH (Topbar) → aktuell aktive View
   ========================================================= */
// --- START: ABSCHNITT 12 — GLOBAL SEARCH (Topbar) ---
function setGlobalSearchValue(v) {
  if (topSearch) topSearch.value = v;
  if (mobileTopSearch) mobileTopSearch.value = v;

  // Route into view inputs
  if (activeView === "customers" && customerSearch) {
    customerSearch.value = v;
    renderCustomersTable();
  }
  if (activeView === "leads" && leadsSearch) {
    leadsSearch.value = v;
    renderLeads();
  }
}

function handleGlobalSearchInput(e) {
  setGlobalSearchValue(e.target.value || "");
}

if (topSearch) topSearch.addEventListener("input", handleGlobalSearchInput);
if (mobileTopSearch) mobileTopSearch.addEventListener("input", handleGlobalSearchInput);
// --- END: ABSCHNITT 12 — GLOBAL SEARCH (Topbar) ---



/* =========================================================
   ABSCHNITT 13 — INIT + AUTH GUARD (Firebase Auth)
   ========================================================= */
// --- START: ABSCHNITT 13 — INIT + AUTH GUARD ---
initTheme();
ensureOffersDefaultsOnInit();
setActiveView("dashboard");

/**
 * Gate helpers
 */
function setGate(msg = "Checking session…") {
  if (appGateMsg) appGateMsg.textContent = msg;
}
function showGate(msg) {
  if (appGate) appGate.style.display = "flex";
  setGate(msg || "Checking session…");
}
function hideGate() {
  if (appGate) appGate.style.display = "none";
}

/**
 * Redirect to Platform Login and preserve current URL as ?next=
 */
function goLogin() {
  const u = new URL("./login.html", window.location.href);
  // return to the current page after login
  const next = window.location.pathname + window.location.search + window.location.hash;
  u.searchParams.set("next", next);
  window.location.replace(u.toString());
}

/**
 * Access check (1 read) – Platform/Superadmin
 */
async function isSuperadmin(uid) {
  const snap = await getDoc(doc(db, "superadmins", uid));
  return snap.exists();
}

// Gate sofort zeigen
showGate("Checking session…");

let __booted = false;

onAuthStateChanged(auth, async (user) => {
  try {
    if (!user) {
      goLogin();
      return;
    }

    showGate("Checking access…");
    const ok = await isSuperadmin(user.uid);

    if (!ok) {
      try { await signOut(auth); } catch {}
      goLogin();
      return;
    }

    if (__booted) {
      hideGate();
      return;
    }
    __booted = true;

    showGate("Loading data…");
    await Promise.all([loadRestaurants(), loadLeads()]);
    hideGate();
  } catch (err) {
    console.error(err);
    showGate("❌ Fehler: " + (err?.message || String(err)));
  }
});

// Logout (Sidebar)
async function doLogout() {
  try { await signOut(auth); } catch {}
  goLogin();
}
if (logoutButton) logoutButton.addEventListener("click", doLogout);
// --- END: ABSCHNITT 13 — INIT + AUTH GUARD ---
