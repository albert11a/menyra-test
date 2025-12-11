// 💠 ABSCHNITT 1 – Imports & globaler State (ANFANG) -----------------------

import {
  db,
  collection,
  collectionGroup,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "./firebase-config.js";

import {
  translations,
  loadSavedLang,
  applyTranslations,
  getCurrentLang,
  setCurrentLang
} from "./menyraadmin-sprachen.js";

// --- State ---------------------------------------------------------

let restaurants = [];
let restaurantStatusFilter = "all";
let customerTypeFilter = "all";
let restaurantSearchTerm = "";

let superadmins = [];
let leads = [];
let offers = [];      // 🔹 alle Angebote (collectionGroup)
let users = [];       // 🔹 registrierte User (Users-View)
let systemLogs = [];  // 🔹 System-Logs (Logs-View)

// Aktueller eingeloggter Superadmin (für ältere Teile im Code)
let currentSuperadminEmail = "";      // z.B. "albert.hoti@menyra.com"
let currentSuperadminRole = "admin";  // "ceo" oder "admin"
let currentSuperadminCountry = "";    // z.B. "Kosovo"

// Dashboard-Stats
let ordersTodayCount = 0;
let topRestaurantToday = null;

let usersTotalCount = 0;
let usersActiveCount = 0;

// Aktueller eingeloggter Superadmin (Token-basiert, neues System)
let currentSuperadmin = null;

// --- Auth & Superadmin-Helpers ------------------------------------

// Key für Token im localStorage (muss mit login.html identisch sein)
const SUPERADMIN_TOKEN_KEY = "menyraSuperadminToken";

/**
 * Aus E-Mail einen einfachen Anzeigenamen ableiten (Teil vor dem @)
 */
function deriveNameFromEmail(email) {
  if (!email) return "";
  const atIndex = String(email).indexOf("@");
  if (atIndex === -1) return String(email);
  return String(email).slice(0, atIndex);
}

/**
 * Superadmin-Token aus localStorage lesen und in ein sauberes Objekt mappen.
 * Erwartetes Format (siehe login.html):
 *   {
 *     email: string,
 *     name?: string,
 *     avatarUrl?: string,
 *     loginAt?: string,
 *     role?: string,
 *     country?: string
 *   }
 */
function loadCurrentSuperadminFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SUPERADMIN_TOKEN_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;

    const email =
      typeof data.email === "string" ? data.email.trim() : "";
    if (!email) return null;

    const nameRaw =
      typeof data.name === "string" ? data.name.trim() : "";
    const avatarRaw =
      typeof data.avatarUrl === "string" ? data.avatarUrl.trim() : "";
    const roleRaw =
      typeof data.role === "string" ? data.role.trim() : "";
    const countryRaw =
      typeof data.country === "string" ? data.country.trim() : "";

    return {
      email,
      name: nameRaw || deriveNameFromEmail(email),
      avatarUrl: avatarRaw,
      loginAt: data.loginAt || null,
      role: roleRaw || "",
      country: countryRaw || ""
    };
  } catch (err) {
    console.warn("Superadmin-Token konnte nicht gelesen werden:", err);
    return null;
  }
}

/**
 * Token mit den aktuellen Daten von currentSuperadmin zurück in localStorage schreiben
 */
function persistCurrentSuperadmin() {
  if (typeof window === "undefined" || !currentSuperadmin) return;
  try {
    const payload = {
      email: currentSuperadmin.email,
      name: currentSuperadmin.name || "",
      avatarUrl: currentSuperadmin.avatarUrl || "",
      loginAt: currentSuperadmin.loginAt || new Date().toISOString(),
      role: currentSuperadmin.role || "",
      country: currentSuperadmin.country || ""
    };
    window.localStorage.setItem(SUPERADMIN_TOKEN_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Superadmin-Token konnte nicht geschrieben werden:", err);
  }
}

/**
 * Stellt sicher, dass ein Superadmin eingeloggt ist.
 * Wenn kein gültiger Token existiert → Redirect zu login.html und Script-Abbruch.
 */
function ensureAuthenticatedSuperadmin() {
  if (typeof window === "undefined") return null;

  const user = loadCurrentSuperadminFromStorage();
  if (!user) {
    try {
      window.localStorage.removeItem(SUPERADMIN_TOKEN_KEY);
    } catch {
      // ignore
    }
    // 🔐 Kein Login → zurück zur Login-Seite
    window.location.href = "login.html";
    throw new Error("Nicht authentifiziert – Weiterleitung zum Login.");
  }

  console.log("MENYRA Superadmin – eingeloggt als:", user.email);
  return user;
}

// Direkt beim Laden des Moduls prüfen, ob ein Superadmin eingeloggt ist
currentSuperadmin = ensureAuthenticatedSuperadmin();

/**
 * True, wenn aktueller Superadmin der "Owner/CEO" ist (volle Rechte).
 * Zusätzlich Fallback über E-Mail, falls role noch nicht gesetzt ist.
 */
function isCurrentSuperadminOwner() {
  if (!currentSuperadmin) return false;

  const role = (currentSuperadmin.role || "").toString().toLowerCase();
  if (role === "owner" || role === "ceo") return true;

  const email = (currentSuperadmin.email || "").toString().toLowerCase();
  // Fallback: Albert ist immer Owner, egal was in Firestore steht
  if (email === "albert.hoti@menyra.com") return true;

  return false;
}

/**
 * Land, auf das der aktuelle Superadmin eingeschränkt ist.
 * Owner/CEO oder country = "ALL" → null = voller Zugriff (kein Filter).
 */
function getCurrentSuperadminCountry() {
  if (!currentSuperadmin) return null;

  if (isCurrentSuperadminOwner()) {
    return null;
  }

  const c = (currentSuperadmin.country || "").toString().trim();
  if (!c) return null;
  if (c.toUpperCase() === "ALL") return null;

  return c;
}

/**
 * Restaurants nach Sichtbarkeitsbereich des aktuellen Superadmins gefiltert.
 * Owner/CEO sieht alle, Country-Admins sehen nur ihr Land.
 */
function getScopedRestaurants() {
  const country = getCurrentSuperadminCountry();
  if (!country) {
    // Vollzugriff
    return restaurants;
  }
  const c = country.toLowerCase();
  return restaurants.filter((r) =>
    (r.country || "").toString().toLowerCase() === c
  );
}

/**
 * Aktuellen Superadmin (Name + Avatar) in Topbar/Mobile Menü eintragen.
 * Dafür müssen in dashboard.html Elemente mit .m-profile-name / .m-profile-avatar existieren.
 */
function applyCurrentSuperadminToUI() {
  if (typeof document === "undefined" || !currentSuperadmin) return;

  const profileNameEls = document.querySelectorAll(".m-profile-name");
  const profileAvatarEls = document.querySelectorAll(".m-profile-avatar");

  const displayName =
    currentSuperadmin.name ||
    currentSuperadmin.email ||
    "Superadmin";

  profileNameEls.forEach((el) => {
    el.textContent = displayName;
  });

  if (currentSuperadmin.avatarUrl) {
    profileAvatarEls.forEach((wrap) => {
      if (!wrap) return;
      // falls Wrapper: <div class="m-profile-avatar"><img ... /></div>
      const img = wrap.querySelector ? wrap.querySelector("img") : null;

      if (img) {
        img.src = currentSuperadmin.avatarUrl;
        img.alt = displayName;
      } else if (wrap.tagName === "IMG") {
        wrap.src = currentSuperadmin.avatarUrl;
        wrap.alt = displayName;
      }
    });
  }
}

// 💠 ABSCHNITT 1 – Imports & globaler State (ENDE) -------------------------




































































































// 💠 ABSCHNITT 2 – Mapping & Finanz-Basis (ANFANG) -------------------------

// --- Mapping: Restaurants ------------------------------------------

function mapRestaurantDoc(docSnap) {
  const data = docSnap.data() || {};
  const id = docSnap.id;

  const name = data.name || data.title || "Unbenannt";
  const ownerName = data.ownerName || data.owner || "";
  const ownerPhone = data.ownerPhone || data.phone || "";
  const city = data.city || "";
  const country = data.country || "";

  // Einheitliche Normalisierung
  const customerType = normalizeCustomerType(data.customerType || "restaurant");
  const billingModel = normalizeBillingModel(data.billingModel || "yearly");
  const status = normalizeStatus(data.status || "active");

  // Kandidaten für Jahrespreis:
  let rawYear =
    data.priceYear ??
    data.planPriceYear ??
    data.yearPrice ??
    data.jahresPreis ??
    data.jahrespreis ??
    null;

  // Kandidaten für Monatspreis:
  let rawMonth =
    data.priceMonth ??
    data.planPrice ??
    data.monthPrice ??
    data.monatspreis ??
    null;

  // Fallback: altes Feld "price"
  if (rawYear == null && rawMonth == null && data.price != null) {
    if (Number(data.price) > 1000) {
      rawYear = data.price;
    } else {
      rawMonth = data.price;
    }
  }

  let priceYear = 0;
  let priceMonth = 0;

  if (rawYear != null && rawYear !== "") {
    priceYear = Number(rawYear);
  }
  if (rawMonth != null && rawMonth !== "") {
    priceMonth = Number(rawMonth);
  }

  // ineinander ableiten
  if (!priceYear && priceMonth) {
    priceYear = priceMonth * 12;
  }
  if (!priceMonth && priceYear) {
    priceMonth = priceYear / 12;
  }

  if (!priceYear) priceYear = 0;
  if (!priceMonth) priceMonth = 0;

  const expensesYear = Number(data.expensesYear || 0);
  const planName = data.planName || data.plan || "Standard";

  return {
    id,
    name,
    ownerName,
    ownerPhone,
    city,
    country,
    status,        // "active" | "trial" | "demo" | "aufbauphase" | "contract_end" | "cancelled" | "paused"
    customerType,  // "restaurant" | "cafe" | "club" | "hotel" | "motel" | "onlineshop" | "service"
    billingModel,  // "yearly" | "monthly"
    planName,
    priceYear,
    priceMonth,
    expensesYear,
    raw: data
  };
}

// --- Mapping: Superadmins ------------------------------------------

function mapSuperadminDoc(docSnap) {
  const data = docSnap.data() || {};

  // Rolle: Standard = "admin", nur Albert bekommt "ceo"
  let roleRaw =
    (data.role || data.type || "").toString().toLowerCase().trim();
  if (!roleRaw) {
    const mail = (data.email || data.login || "").toString().toLowerCase().trim();
    if (mail === "albert.hoti@menyra.com") {
      roleRaw = "ceo";
    } else {
      roleRaw = "admin";
    }
  }
  const role = roleRaw === "ceo" ? "ceo" : "admin";

  // Land kann später für Filter verwendet werden
  const country =
    data.country ||
    data.countryCode ||
    data.region ||
    "";

  // Passwort / PIN (4-stellig) – im Klartext gespeichert (internes Tool!)
  const password =
    data.password ||
    data.passcode ||
    data.pin ||
    "";

  return {
    id: docSnap.id,
    name: data.name || "Unbenannt",
    email: (data.email || data.login || "").toString().toLowerCase().trim(),
    avatarUrl: data.avatarUrl || data.iconUrl || "",
    role,     // "ceo" | "admin"
    country,  // z.B. "Kosovo", "Albanien"
    password  // z.B. "1234"
  };
}


// --- Mapping: Leads ------------------------------------------------

function mapLeadDoc(docSnap) {
  const data = docSnap.data() || {};
  const id = docSnap.id;

  const rawCustomerType = data.customerType || data.type || "restaurant";
  const customerType = normalizeCustomerType(rawCustomerType);

  const businessName = data.businessName || data.name || "Unbenannt";
  const instagram = data.instagram || data.instagramHandle || "";
  const phone = data.phone || data.phoneNumber || "";
  const statusRaw = (data.status || "new").toLowerCase();
  const note = data.note || data.notes || "";

  const createdAt = data.createdAt || data.created_at || null;
  const updatedAt = data.updatedAt || data.updated_at || null;

  // NEU: Land & Besitzer des Leads (für Filter)
  const country =
    data.country ||
    data.countryCode ||
    data.region ||
    "";

  const ownerEmail =
    (data.ownerEmail || data.owner || "").toString().toLowerCase().trim() || "";

  return {
    id,
    customerType,
    businessName,
    instagram,
    phone,
    status: statusRaw,
    note,
    createdAt,
    updatedAt,
    country,
    ownerEmail,
    raw: data
  };
}

// --- Mapping: Users (Benutzer) -------------------------------------

function mapUserDoc(docSnap) {
  const data = docSnap.data() || {};
  const id = docSnap.id;

  const fullName =
    data.displayName ||
    data.name ||
    [data.firstName, data.lastName].filter(Boolean).join(" ") ||
    "Unbekannter Benutzer";

  const username =
    data.username ||
    data.handle ||
    data.nick ||
    "";

  const email = data.email || data.mail || "";
  const phone = data.phone || data.phoneNumber || "";

  const statusRaw = (data.status || "").toLowerCase();
  const activeFlag = data.active;

  // Gleiche Logik wie vorher in subscribeUsers
  const isActive =
    activeFlag === true ||
    (!activeFlag && statusRaw !== "inactive" && statusRaw !== "blocked");

  const createdAt =
    data.createdAt ||
    data.created_at ||
    data.signupAt ||
    null;

  const lastActiveAt =
    data.lastActiveAt ||
    data.last_active_at ||
    data.lastSeenAt ||
    data.last_seen_at ||
    data.lastLoginAt ||
    null;

  const restaurantId =
    data.restaurantId ||
    data.clientId ||
    data.customerId ||
    null;

  return {
    id,
    name: fullName,
    username,
    email,
    phone,
    status: statusRaw || (isActive ? "active" : "inactive"),
    isActive,
    createdAt,
    lastActiveAt,
    restaurantId,
    raw: data
  };
}


// --- Finanz-Berechnungen -------------------------------------------

// „Steuerprofil“ – später aus Firestore, vorerst fix
const TAX_RATE = 10;  // 10 % Steuer
const OTHER_RATE = 5; // 5 % sonstige Abgaben
const TRAVEL_YEAR = 0; // Reisekosten/Jahr – kannst du später dynamisch machen

function safeNumber(val) {
  const n = Number(val || 0);
  return Number.isNaN(n) ? 0 : n;
}

function computeFinanceTotals() {
  // Basis je nach Sichtbarkeit (Owner: alle, Country-Admins: nur eigenes Land)
  const scoped = getScopedRestaurants();

  // Nur Kunden in Umsetzung & aktiv gelten als Kundenbasis
  const customerBase = scoped.filter(
    (r) => r.status === "active" || r.status === "aufbauphase"
  );

  // Umsatz nur mit aktiven Kunden
  const active = customerBase.filter((r) => r.status === "active");
  const activeCount = active.length;
  const totalCount = customerBase.length;

  // Jahresumsatz = Summe aller Jahrespreise der aktiven Kunden
  const revenueYear = active.reduce((sum, r) => {
    return sum + safeNumber(r.priceYear);
  }, 0);

  // Monatlich & täglich daraus ableiten
  const revenueMonth = revenueYear / 12;
  const revenueDay = revenueYear / 365;

  // Jahresausgaben (manuell gepflegt pro Kunde – nur aktive)
  const expensesYear = active.reduce((sum, r) => {
    return sum + safeNumber(r.expensesYear);
  }, 0);

  const grossProfit = revenueYear - expensesYear;

  const taxAmount = (grossProfit * TAX_RATE) / 100;
  const otherAmount = (grossProfit * OTHER_RATE) / 100;
  const netProfit = grossProfit - taxAmount - otherAmount - TRAVEL_YEAR;

  // Breakdown nach Kundentyp
  const typeKeys = ["cafe", "restaurant", "hotel", "motel", "onlineshop", "service", "club"];

  const activeByType = {};
  const revenueYearByType = {};

  typeKeys.forEach((t) => {
    activeByType[t] = 0;
    revenueYearByType[t] = 0;
  });
  activeByType.other = 0;
  revenueYearByType.other = 0;

  // MRR (monatliche Einnahmen) für Kunden mit billingModel = "monthly"
  let mrrMonthly = 0;

  active.forEach((r) => {
    const tRaw = (r.customerType || "restaurant").toLowerCase();
    const typeKey = typeKeys.includes(tRaw) ? tRaw : "other";

    activeByType[typeKey] = (activeByType[typeKey] || 0) + 1;

    const y = safeNumber(r.priceYear);
    revenueYearByType[typeKey] = (revenueYearByType[typeKey] || 0) + y;

    if ((r.billingModel || "").toLowerCase() === "monthly") {
      // Bevorzugt priceMonth/planPrice, sonst aus Jahrespreis abgeleitet
      const m = safeNumber(r.priceMonth || r.planPrice || y / 12);
      mrrMonthly += m;
    }
  });

  return {
    activeCount,
    totalCount,
    revenueYear,
    revenueMonth,
    revenueDay,
    expensesYear,
    grossProfit,
    taxAmount,
    otherAmount,
    netProfit,
    activeByType,
    revenueYearByType,
    mrrMonthly
  };
}

// 💠 ABSCHNITT 2 – Mapping & Finanz-Basis (ENDE) ---------------------------





















































































































// 💠 ABSCHNITT 3 – Dashboard, Stat-Karten & Billing (ANFANG) ---------------

// --- Dashboard-Rendering -------------------------------------------

function updateDashboardFromRestaurants() {
  const totals = computeFinanceTotals();

  // Aktive Kunden
  const elActive = document.getElementById("statActiveCustomers");
  const elActiveHint = document.getElementById("statActiveCustomersHint");

  if (elActive) {
    elActive.textContent = String(totals.activeCount);
  }
  if (elActiveHint) {
    const t = totals;
    const byType = t.activeByType || {};

    const cafes = byType.cafe || 0;
    const restaurantsCount = byType.restaurant || 0;
    const hotels = byType.hotel || 0;
    const motels = byType.motel || 0;
    const onlineshop = byType.onlineshop || 0;
    const service = byType.service || 0;
    const clubs = byType.club || 0;
    const others = byType.other || 0;

    const gastro = cafes + restaurantsCount + clubs;
    const stay = hotels + motels;

    const parts = [];
    if (gastro) parts.push(`Gastro: ${gastro}`);
    if (stay) parts.push(`Hotels/Motels: ${stay}`);
    if (onlineshop) parts.push(`Online-Shops: ${onlineshop}`);
    if (service) parts.push(`Dienstleistung: ${service}`);
    if (others) parts.push(`Sonstige: ${others}`);

    const breakdown = parts.length ? ` · Verteilung: ${parts.join(" · ")}` : "";

    const mrrText =
      t.mrrMonthly && t.mrrMonthly > 0
        ? ` · Monatliche E-Commerce / Rent a Car Einnahmen: ${t.mrrMonthly.toFixed(
            2
          )} €`
        : "";

    elActiveHint.textContent =
      `Aktive Kunden: ${t.activeCount} von ${t.totalCount} gesamt. ` +
      `Jahresumsatz (brutto): ${t.revenueYear.toFixed(0)} €` +
      breakdown +
      mrrText;
  }

  // Jährlicher Umsatz (alle aktiven Kunden im Sichtbereich)
  const elYear = document.getElementById("statYearRevenue");
  if (elYear) {
    elYear.textContent = totals.revenueYear.toFixed(0);
  }

  // Monatliche Einnahmen = Jahresumsatz / 12
  const elMonth = document.getElementById("statMonthRevenue");
  if (elMonth) {
    elMonth.textContent = totals.revenueMonth.toFixed(0);
  }

  // Tägliche Einnahmen = Jahresumsatz / 365
  const elDay = document.getElementById("statDayRevenue");
  if (elDay) {
    elDay.textContent = totals.revenueDay.toFixed(1);
  }

  // Abrechnungs-View Kurzfassung (Subtitle im Billing-View)
  const billingSubtitle = document.querySelector(
    '.m-view[data-view="billing"] .m-page-subtitle'
  );
  if (billingSubtitle) {
    const t = totals;
    const baseText =
      `Jahresumsatz aktiv: ${t.revenueYear.toFixed(0)} € · ` +
      `Ausgaben: ${t.expensesYear.toFixed(0)} € · ` +
      `Netto: ca. ${t.netProfit.toFixed(0)} € / Jahr`;

    const mrrText =
      t.mrrMonthly && t.mrrMonthly > 0
        ? ` · MRR (E-Commerce / Rent a Car): ${t.mrrMonthly.toFixed(2)} €`
        : "";

    billingSubtitle.textContent = baseText + mrrText;
  }

  // Detail-Billing-View (Tab „Abrechnung“)
  renderBillingView(totals);
}

function renderBillingView(totals) {
  if (!totals) return;

  // --- Kennzahlen oben links im Billing-View -----------------------
  const activeEl = document.getElementById("billingActiveCustomers");
  const yearEl = document.getElementById("billingYearRevenue");
  const monthEl = document.getElementById("billingMonthRevenue");
  const dayEl = document.getElementById("billingDayRevenue");
  const expEl = document.getElementById("billingExpensesYear");
  const netEl = document.getElementById("billingNetProfit");
  const mrrEl = document.getElementById("billingMrrMonthly");

  if (activeEl) activeEl.textContent = String(totals.activeCount);
  if (yearEl) yearEl.textContent = `${totals.revenueYear.toFixed(0)} €`;
  if (monthEl) monthEl.textContent = `${totals.revenueMonth.toFixed(0)} €`;
  if (dayEl) dayEl.textContent = `${totals.revenueDay.toFixed(1)} €`;
  if (expEl) expEl.textContent = `${totals.expensesYear.toFixed(0)} €`;
  if (netEl) netEl.textContent = `${totals.netProfit.toFixed(0)} €`;
  if (mrrEl) mrrEl.textContent = `${totals.mrrMonthly.toFixed(2)} €`;

  // --- Verteilung nach Kundentyp ----------------------------------
  const breakdownContainer = document.getElementById("billingTypeBreakdown");
  if (breakdownContainer) {
    const byTypeActive = totals.activeByType || {};
    const byTypeRevenue = totals.revenueYearByType || {};

    const rows = [
      { key: "restaurant", label: "Restaurants" },
      { key: "cafe", label: "Cafés" },
      { key: "club", label: "Clubs / Nightlife" },
      { key: "hotel", label: "Hotels" },
      { key: "motel", label: "Motels" },
      { key: "onlineshop", label: "Online-Shops / E-Commerce / Rent a Car" },
      { key: "service", label: "Dienstleistung" },
      { key: "other", label: "Sonstige" }
    ];

    breakdownContainer.innerHTML = "";
    let hasRows = false;

    rows.forEach((row) => {
      const count = byTypeActive[row.key] || 0;
      const rev = byTypeRevenue[row.key] || 0;
      if (!count && !rev) return;

      hasRows = true;

      const div = document.createElement("div");
      div.className = "m-system-row";
      div.innerHTML = `
        <span>${row.label}</span>
        <span class="m-system-status">
          <span>${count} aktiv</span>
          <span>·</span>
          <span>${rev.toFixed(0)} € / Jahr</span>
        </span>
      `;
      breakdownContainer.appendChild(div);
    });

    if (!hasRows) {
      const empty = document.createElement("p");
      empty.className = "m-system-note";
      empty.textContent = "Noch keine aktiven Kunden mit Umsatz.";
      breakdownContainer.appendChild(empty);
    }
  }

  // --- Detail-Tabelle: Kunden & Abrechnungsmodelle ----------------
  const tableBody = document.getElementById("billingTableBody");
  const tableMeta = document.getElementById("billingTableMeta");
  const pageInfo = document.getElementById("billingTablePageInfo");

  if (tableBody) {
    tableBody.innerHTML = "";

    // Kundenbasis: In Umsetzung + Aktiv (wie in computeFinanceTotals),
    // aber auf den Sichtbereich des aktuellen Superadmins eingeschränkt.
    const scoped = getScopedRestaurants();
    const customerBase = scoped.filter(
      (r) => r.status === "active" || r.status === "aufbauphase"
    );

    customerBase.sort((a, b) => a.name.localeCompare(b.name));

    const lang = getCurrentLang();
    const dict = translations[lang] || translations.de;

    customerBase.forEach((r) => {
      const row = document.createElement("div");
      row.className = "m-table-row";

      const modelLabel = r.billingModel === "monthly" ? "Monatlich" : "Jährlich";
      const priceText =
        r.billingModel === "monthly"
          ? `${r.priceMonth.toFixed(2)} € / Monat`
          : `${r.priceYear.toFixed(2)} € / Jahr`;
      const yearText = `${r.priceYear.toFixed(2)} €`;

      // Status-Label & Badge-Farbe wie in der Kunden-Tabelle
      let statusKey = "status.active";
      if (r.status === "trial") statusKey = "status.trial";
      else if (r.status === "paused") statusKey = "status.paused";
      else if (r.status === "demo") statusKey = "status.demo";
      else if (r.status === "aufbauphase" || r.status === "setup") {
        statusKey = "status.setup";
      } else if (r.status === "contract_end") {
        statusKey = "filter.status.contract_end";
      } else if (r.status === "cancelled") {
        statusKey = "filter.status.cancelled";
      }
      const statusLabel = dict[statusKey] || r.status;

      let statusClass = "m-status-badge--paused";
      if (r.status === "active") statusClass = "m-status-badge--active";
      else if (r.status === "trial") statusClass = "m-status-badge--trial";

      const locationText = r.city
        ? r.country
          ? `${r.city} · ${r.country}`
          : r.city
        : r.country || "";

      row.innerHTML = `
        <div>
          <div class="m-table-main">${r.name}</div>
          <div class="m-table-sub">${locationText || ""}</div>
        </div>
        <div>
          <div class="m-table-main">${r.customerType || "-"}</div>
          <div class="m-table-sub">${r.planName || "Standard"}</div>
        </div>
        <div>${modelLabel}</div>
        <div>${priceText}</div>
        <div>${yearText}</div>
        <div>
          <span class="m-status-badge ${statusClass}">${statusLabel}</span>
        </div>
      `;

      tableBody.appendChild(row);
    });

    if (tableMeta) {
      tableMeta.textContent = `${customerBase.length} Kunden · nur „In Umsetzung“ & „Aktiv“`;
    }
    if (pageInfo) {
      pageInfo.textContent = "Seite 1 von 1";
    }
  }
}

// --- Orders- & User-UI ---------------------------------------------

function updateOrdersCardUI() {
  const valueEl = document.getElementById("statOrdersToday");
  const hintEl = document.getElementById("statOrdersTodayHint");

  if (valueEl) {
    valueEl.textContent = String(ordersTodayCount);
  }

  if (!hintEl) return;

  if (!ordersTodayCount) {
    hintEl.textContent = "Heute noch keine Bestellungen über MENYRA.";
    return;
  }

  if (topRestaurantToday) {
    const bestRestaurant = restaurants.find(
      (r) => r.id === topRestaurantToday.restaurantId
    );
    const name = bestRestaurant?.name || topRestaurantToday.restaurantId;
    hintEl.textContent = `Top-Lokal heute: ${name} mit ${topRestaurantToday.count} Bestellungen.`;
  } else {
    hintEl.textContent = `Heute bisher ${ordersTodayCount} Bestellungen.`;
  }
}

function updateUsersCardUI() {
  const valueEl = document.getElementById("statUsersTotal");
  const hintEl = document.getElementById("statUsersHint");

  if (valueEl) {
    valueEl.textContent = String(usersTotalCount);
  }

  if (!hintEl) return;

  if (!usersTotalCount) {
    hintEl.textContent = "Noch keine registrierten User.";
  } else {
    hintEl.textContent = `Aktive User: ${usersActiveCount} · Gesamt: ${usersTotalCount}`;
  }
}

// --- Dashboard-Aktivität („Letzte Aktivität“) ----------------------

function formatActivityTime(date) {
  if (!(date instanceof Date)) return "";
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function rebuildActivityList() {
  const listEl = document.getElementById("activityList");
  const metaEl = document.getElementById("activityMeta");
  if (!listEl) return; // Falls HTML noch nicht angepasst ist: nichts tun

  const events = [];

  // Sichtbar für aktuellen Superadmin nur die Kunden im eigenen Bereich
  const scopedRestaurants = getScopedRestaurants();

  // 1) Kunden (Restaurants) – nur wenn createdAt existiert
  scopedRestaurants.forEach((r) => {
    const raw = r.raw || {};
    const createdAt = raw.createdAt;
    if (createdAt && typeof createdAt.toDate === "function") {
      const d = createdAt.toDate();
      events.push({
        ts: d,
        type: "customer_created",
        title: `Neuer Kunde: ${r.name}`,
        sub: r.city ? `${r.city}${r.country ? " · " + r.country : ""}` : r.country || ""
      });
    }
  });

  // 2) Leads – Neu & Updates (jetzt mit Länder- / Rollen-Filter)
  const scopedLeads =
    typeof getScopedLeads === "function" ? getScopedLeads() : leads;

  scopedLeads.forEach((lead) => {
    // Neu
    const createdAt = lead.createdAt;
    if (createdAt && typeof createdAt.toDate === "function") {
      const d = createdAt.toDate();
      events.push({
        ts: d,
        type: "lead_created",
        title: `Neuer Lead: ${lead.businessName}`,
        sub: lead.instagram || lead.phone || ""
      });
    }

    // Update (wenn updatedAt vorhanden und später als createdAt)
    const updatedAt = lead.updatedAt;
    if (updatedAt && typeof updatedAt.toDate === "function") {
      const dUpdated = updatedAt.toDate();
      let dCreated = null;
      if (createdAt && typeof createdAt.toDate === "function") {
        dCreated = createdAt.toDate();
      }
      const isRealUpdate = !dCreated || dUpdated.getTime() > dCreated.getTime() + 1000;

      if (isRealUpdate) {
        events.push({
          ts: dUpdated,
          type: "lead_updated",
          title: `Lead aktualisiert: ${lead.businessName}`,
          sub: lead.status ? `Status: ${lead.status}` : ""
        });
      }
    }
  });

  // Sortieren: neueste zuerst
  events.sort((a, b) => b.ts.getTime() - a.ts.getTime());

  // Nur die letzten 10–12 Einträge anzeigen
  const limited = events.slice(0, 12);

  listEl.innerHTML = "";

  if (!limited.length) {
    const li = document.createElement("li");
    li.className = "m-activity-empty";
    li.textContent = "Noch keine Aktivität erfasst.";
    listEl.appendChild(li);

    if (metaEl) {
      metaEl.textContent = "";
    }
    return;
  }

  limited.forEach((event) => {
    const li = document.createElement("li");
    li.className = "m-activity-item";

    let dotClass = "m-activity-dot--gray";
    if (event.type === "customer_created") dotClass = "m-activity-dot--green";
    if (event.type === "lead_created") dotClass = "m-activity-dot--blue";
    if (event.type === "lead_updated") dotClass = "m-activity-dot--orange";

    const timeLabel = formatActivityTime(event.ts);

    li.innerHTML = `
      <span class="m-activity-dot ${dotClass}"></span>
      <div>
        <div class="m-activity-title">${event.title}</div>
        ${
          event.sub
            ? `<div class="m-activity-sub">${event.sub}</div>`
            : ""
        }
      </div>
      <div class="m-activity-time">${timeLabel}</div>
    `;

    listEl.appendChild(li);
  });

  if (metaEl) {
    metaEl.textContent = `${limited.length} Ereignisse · basierend auf Kunden & Leads`;
  }
}


// 💠 ABSCHNITT 3 – Dashboard, Stat-Karten & Billing (ENDE) ------------------




















// 💠 ABSCHNITT 4 – Leads-Dashboard, Tabelle & Akquise (ANFANG) --------------

// Leads im Sichtbereich des aktuellen Superadmins filtern
// CEO / Owner: alle Leads
// Admin mit Land: nur Leads mit passendem country / countryCode / region im raw-Objekt
function getScopedLeads() {
  const country = getCurrentSuperadminCountry();
  if (!country) {
    // Vollzugriff (CEO oder ALL)
    return leads;
  }

  const c = country.toLowerCase();
  return leads.filter((lead) => {
    const raw = lead.raw || {};
    const lc = (
      raw.country ||
      raw.countryCode ||
      raw.region ||
      ""
    )
      .toString()
      .toLowerCase()
      .trim();

    // Wenn kein Land im Lead hinterlegt ist → wird für Country-Admins ausgeblendet
    return lc === c;
  });
}

/**
 * Leads: Statistik, Cards & Tabelle
 */

// --- Leads-UI (Dashboard + Zusammenfassung) ------------------------

function computeLeadStats() {
  const scoped = getScopedLeads();
  const stats = {
    total: scoped.length,
    new: 0,
    contacted: 0,
    waiting: 0,
    interested: 0,
    noInterest: 0,
    other: 0
  };

  scoped.forEach((lead) => {
    const s = (lead.status || "").toLowerCase();

    if (s === "new") {
      stats.new++;
    } else if (s === "contacted") {
      stats.contacted++;
    } else if (s === "waiting") {
      stats.waiting++;
    } else if (s === "interested") {
      stats.interested++;
    } else if (s === "no_interest" || s === "no-interest" || s === "kein_interesse") {
      stats.noInterest++;
    } else {
      stats.other++;
    }
  });

  return stats;
}

function updateLeadsCardUI() {
  const totalEl = document.getElementById("statLeadsTotal");
  const hintEl = document.getElementById("statLeadsHint");

  // Wenn Dashboard-Card nicht existiert, trotzdem nichts crashen
  if (!totalEl && !hintEl) return;

  const s = computeLeadStats();

  if (totalEl) {
    totalEl.textContent = String(s.total);
  }

  if (!hintEl) return;

  if (!s.total) {
    hintEl.textContent = "Noch keine Leads erfasst.";
    return;
  }

  const parts = [];
  if (s.new) parts.push(`Offen: ${s.new}`);
  if (s.contacted || s.waiting) {
    parts.push(`Kontaktiert / Warten: ${s.contacted + s.waiting}`);
  }
  if (s.interested) parts.push(`Interesse: ${s.interested}`);
  if (s.noInterest) parts.push(`Kein Interesse: ${s.noInterest}`);
  if (s.other) parts.push(`Sonstige: ${s.other}`);

  hintEl.textContent =
    `Leads gesamt (dein Bereich): ${s.total}` +
    (parts.length ? " · " + parts.join(" · ") : "");
}

function renderLeadsSummary() {
  const stats = computeLeadStats();

  const openEl = document.getElementById("leadsSummaryOpen");
  const contactedEl = document.getElementById("leadsSummaryContacted");
  const interestedEl = document.getElementById("leadsSummaryInterested");
  const noInterestEl = document.getElementById("leadsSummaryNoInterest");

  if (openEl) {
    openEl.textContent = `Offen: ${stats.new}`;
  }
  if (contactedEl) {
    contactedEl.textContent = `Kontaktiert / Warten: ${stats.contacted + stats.waiting}`;
  }
  if (interestedEl) {
    interestedEl.textContent = `Interesse: ${stats.interested}`;
  }
  if (noInterestEl) {
    noInterestEl.textContent = `Kein Interesse: ${stats.noInterest}`;
  }
}

// --- Leads-Tabelle rendern ----------------------------------------

function renderLeadsTable() {
  const body = document.getElementById("leadsTableBody");
  const meta = document.getElementById("leadsMeta");
  const pageInfo = document.getElementById("leadsPageInfo");

  if (!body) return;

  body.innerHTML = "";

  const scopedLeads = getScopedLeads();

  // nach Datum sortieren (neueste zuerst)
  const sorted = [...scopedLeads].sort((a, b) => {
    const getTime = (l) => {
      const ts = l.createdAt;
      if (ts && typeof ts.toMillis === "function") return ts.toMillis();
      if (ts instanceof Date) return ts.getTime();
      return 0;
    };
    return getTime(b) - getTime(a);
  });

  const typeLabelMap = {
    restaurant: "Restaurant",
    cafe: "Café",
    club: "Club / Nightlife",
    hotel: "Hotel",
    motel: "Motel",
    onlineshop: "Online-Shop",
    service: "Dienstleistung"
  };

  const typeIconMap = {
    restaurant: "🍽",
    cafe: "☕",
    club: "🎧",
    hotel: "🏨",
    motel: "🏩",
    onlineshop: "🛒",
    service: "🛎️"
  };

  const statusLabelMap = {
    new: "Offen",
    contacted: "Kontaktiert",
    waiting: "Warten",
    interested: "Interesse",
    no_interest: "Kein Interesse",
    "no-interest": "Kein Interesse",
    kein_interesse: "Kein Interesse"
  };

  sorted.forEach((lead) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.setAttribute("data-lead-id", lead.id);

    const typeKey = normalizeCustomerType(lead.customerType || "restaurant");
    const typeLabel = typeLabelMap[typeKey] || "Sonstiges";
    const typeIcon = typeIconMap[typeKey] || "🏪";

    const sKey = (lead.status || "new").toLowerCase();
    const statusLabel = statusLabelMap[sKey] || "Sonstiges";

    const ts = lead.createdAt;
    let dateLabel = "";
    if (ts) {
      let d = ts;
      if (typeof ts.toDate === "function") d = ts.toDate();
      if (d instanceof Date) {
        dateLabel = d.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit"
        });
      }
    }

    const instagramDisplay = lead.instagram
      ? lead.instagram.startsWith("@")
        ? lead.instagram
        : "@" + lead.instagram
      : "-";

    let statusClass = "m-status-badge--paused";
    if (sKey === "new") statusClass = "m-status-badge--trial";
    if (sKey === "contacted" || sKey === "waiting") statusClass = "m-status-badge--paused";
    if (sKey === "interested") statusClass = "m-status-badge--active";
    if (sKey === "no_interest" || sKey === "no-interest" || sKey === "kein_interesse") {
      statusClass = "m-status-badge--paused";
    }

    const shortNote =
      (lead.note || "").length > 80 ? lead.note.slice(0, 77) + "…" : lead.note || "";

    row.innerHTML = `
      <div>
        <div class="m-table-main">
          <span class="m-table-main-type-icon">${typeIcon}</span>
          ${lead.businessName}
        </div>
        <div class="m-table-sub">
          ${typeLabel}${dateLabel ? " · " + dateLabel : ""}
        </div>
      </div>
      <div>
        <div class="m-table-main">Instagram: ${instagramDisplay}</div>
        <div class="m-table-sub">${lead.phone || ""}</div>
      </div>
      <div>
        <span class="m-status-badge ${statusClass}">${statusLabel}</span>
      </div>
      <div>
        <div class="m-table-sub">${shortNote || "-"}</div>
      </div>
      <div class="m-table-actions">
        <button class="m-icon-btn js-lead-to-customer" type="button" title="Zu Kunde machen">
          🏷
        </button>
        <button class="m-icon-btn js-lead-edit" type="button" title="Lead bearbeiten">
          ✏️
        </button>
        <button class="m-icon-btn js-lead-delete" type="button" title="Lead löschen">
          🗑
        </button>
      </div>
    `;

    body.appendChild(row);
  });

  if (meta) {
    meta.textContent = `${sorted.length} Leads (dein Bereich) · sortiert nach Datum (neueste zuerst)`;
  }
  if (pageInfo) {
    pageInfo.textContent = "Seite 1 von 1";
  }

  // 🔴 WICHTIG: hier wird die Funktion aufgerufen, die vorher gefehlt hat
  attachLeadActionHandlers();
}

function attachLeadActionHandlers() {
  const body = document.getElementById("leadsTableBody");
  if (!body) return;

  // Zu Kunde machen
  body.querySelectorAll(".js-lead-to-customer").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("[data-lead-id]");
      const id = row?.getAttribute("data-lead-id");
      if (!id) return;
      handleLeadToCustomer(id);
    });
  });

  // Edit
  body.querySelectorAll(".js-lead-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest("[data-lead-id]");
      const id = row?.getAttribute("data-lead-id");
      if (!id) return;
      const lead = leads.find((l) => l.id === id);
      if (!lead) return;
      openLeadForm(lead);
    });
  });

  // Delete
  body.querySelectorAll(".js-lead-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest("[data-lead-id]");
      const id = row?.getAttribute("data-lead-id");
      if (!id) return;

      const ok = window.confirm("Diesen Lead wirklich löschen?");
      if (!ok) return;

      try {
        await deleteDoc(doc(db, "leads", id));
      } catch (err) {
        console.error("Fehler beim Löschen des Leads:", err);
        alert("Fehler beim Löschen. Siehe Konsole.");
      }
    });
  });
}

// Lead → Kundenformular (vorbefüllt)
function handleLeadToCustomer(leadId) {
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) {
    alert("Lead nicht gefunden.");
    return;
  }

  // Kundentyp auf unsere 7 Standard-Typen normalisieren
  const customerType = normalizeCustomerType(lead.customerType || "restaurant");

  // Erst normales "Neuer Kunde"-Formular öffnen
  openRestaurantForm(null);

  // Danach Felder mit Daten aus Lead befüllen
  const customerTypeSelect = document.getElementById("customerType");
  const nameInput = document.getElementById("restaurantName");
  const ownerPhoneInput = document.getElementById("restaurantOwnerPhone");

  if (customerTypeSelect) {
    customerTypeSelect.value = customerType;
  }
  if (nameInput) {
    nameInput.value = lead.businessName || "";
  }
  if (ownerPhoneInput && lead.phone) {
    ownerPhoneInput.value = lead.phone;
  }

  // City/Country lassen wir absichtlich leer,
  // damit du das beim Kunden-Termin sauber einträgst.
}

// 💠 ABSCHNITT 4 – Leads-Dashboard, Tabelle & Akquise (ENDE) ----------------
























// 💠 ABSCHNITT 5 – Restaurant- & Superadmin-Tabellen + Actions (ANFANG) -----

// --- Restaurants-Tabelle rendern -----------------------------------

function renderRestaurantsTable() {
  const bodyContainer = document.getElementById("restaurantsTableBody");
  const meta = document.getElementById("restaurantsMeta");
  const pageInfo = document.getElementById("restaurantsPageInfo");
  if (!bodyContainer) return;

  bodyContainer.innerHTML = "";

  // Basis: alle Restaurants im Sichtbereich des aktuellen Superadmins
  // (CEO: alle, Country-Admin: nur eigenes Land)
  let filtered = [];
  try {
    if (typeof getScopedRestaurants === "function") {
      filtered = getScopedRestaurants().slice();
    } else {
      // Fallback, falls Helper nicht existiert
      filtered = [...restaurants];
    }
  } catch (err) {
    console.warn("getScopedRestaurants() nicht verfügbar, nutze alle Restaurants:", err);
    filtered = [...restaurants];
  }

  // Status-Filter (Select oben in der Kunden-View)
  if (restaurantStatusFilter !== "all") {
    filtered = filtered.filter((r) => r.status === restaurantStatusFilter);
  }

  // Typ-Filter (Restaurant, Café, Club, Hotel, Motel, Online-Shop, Dienstleistung)
  if (customerTypeFilter !== "all") {
    filtered = filtered.filter(
      (r) => (r.customerType || "restaurant") === customerTypeFilter
    );
  }

  // Textsuche (Name, Inhaber, Stadt, Land)
  if (restaurantSearchTerm) {
    const t = restaurantSearchTerm.toLowerCase();
    filtered = filtered.filter((r) => {
      const combined = `${r.name} ${r.ownerName} ${r.city} ${r.country}`.toLowerCase();
      return combined.includes(t);
    });
  }

  // Alphabetisch nach Name sortieren
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  const lang = getCurrentLang();
  const dict = translations[lang] || translations.de;

  // Hilfsfunktion für Typ-Icon & Label
  function getTypeConfig(customerType) {
    const type = customerType || "restaurant";
    const iconMap = {
      restaurant: "🍽",
      cafe: "☕",
      club: "🎧",
      hotel: "🏨",
      motel: "🏩",
      onlineshop: "🛒",
      service: "🛎️"
    };
    const icon = iconMap[type] || "🏪";
    const labelKey = "filter.type." + type; // z.B. filter.type.restaurant
    const label =
      dict[labelKey] ||
      dict["filter.type.restaurant"] ||
      type;
    return { icon, label };
  }

  filtered.forEach((r) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.setAttribute("data-restaurant-row", "");
    row.setAttribute("data-status", r.status);
    row.setAttribute("data-id", r.id);
    row.setAttribute("data-type", r.customerType || "restaurant");

    // Status-Label & Farbe
    let statusKey = "status.active";
    if (r.status === "trial") statusKey = "status.trial";
    else if (r.status === "paused") statusKey = "status.paused";
    else if (r.status === "demo") statusKey = "status.demo";
    else if (r.status === "aufbauphase" || r.status === "setup") {
      statusKey = "status.setup";
    } else if (r.status === "contract_end") {
      statusKey = "filter.status.contract_end"; // Fallback: Text aus Filter
    } else if (r.status === "cancelled") {
      statusKey = "filter.status.cancelled";
    }

    const statusLabel = dict[statusKey] || r.status;

    let statusClass = "m-status-badge--paused";
    if (r.status === "active") statusClass = "m-status-badge--active";
    else if (r.status === "trial") statusClass = "m-status-badge--trial";

    const planLabel = `${r.planName} · ${r.priceYear.toFixed(0)} €`;

    const typeConfig = getTypeConfig(r.customerType);
    const typeLabel = typeConfig.label;
    const typeIcon = typeConfig.icon;

    row.innerHTML = `
      <div>
        <div class="m-table-main">
          <span class="m-table-main-type-icon">${typeIcon}</span>
          ${r.name}
        </div>
        <div class="m-table-sub">
          ${typeLabel ? typeLabel + " · " : ""}#${r.id}
        </div>
      </div>
      <div>
        <div class="m-table-main">${r.ownerName || "-"}</div>
        <div class="m-table-sub">${r.ownerPhone || ""}</div>
      </div>
      <div>
        <div class="m-table-main">${r.city || "-"}</div>
        <div class="m-table-sub">${r.country || ""}</div>
      </div>
      <div>
        <span class="m-chip">${planLabel}</span>
      </div>
      <div>
        <span class="m-status-badge ${statusClass}">${statusLabel}</span>
      </div>
      <div class="m-table-actions">
        <button class="m-icon-btn js-restaurant-login" type="button" data-id="${r.id}" title="Superadmin Login">
          🔑
        </button>
        <button class="m-icon-btn js-restaurant-edit" type="button" data-id="${r.id}" title="Bearbeiten">
          ✏️
        </button>
        <button class="m-icon-btn js-restaurant-qr" type="button" data-id="${r.id}" title="QR-Links">
          🔗
        </button>
      </div>
    `;

    bodyContainer.appendChild(row);
  });

  // Meta-Text unten links
  if (meta) {
    const langDict = translations[getCurrentLang()] || translations.de;
    const template = langDict["table.meta"] || "0 Einträge · sortiert nach Name";
    meta.textContent = template.replace(/^0/, String(filtered.length));
  }

  // Seiten-Info unten rechts
  if (pageInfo) {
    const langDict = translations[getCurrentLang()] || translations.de;
    pageInfo.textContent = langDict["table.footer.pageInfo"] || "Seite 1 von 1";
  }

  attachRestaurantActionHandlers();
}

// --- Superadmins rendern -------------------------------------------

function renderSuperadminsTable() {
  const body = document.getElementById("superadminsTableBody");
  if (!body) return;

  body.innerHTML = "";

  // Wer ist eingeloggt?
  const mail = (currentSuperadminEmail || "").toLowerCase();
  const isCeo =
    currentSuperadminRole === "ceo" || mail === "albert.hoti@menyra.com";

  // CEO sieht alle, normale Superadmins nur ihren eigenen Eintrag
  let list = [...superadmins];
  if (!isCeo && mail) {
    list = list.filter((s) => (s.email || "").toLowerCase() === mail);
  }

  if (!list.length) {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.innerHTML = `
      <div class="m-table-main" style="padding:12px 0;">
        Keine Superadmins gefunden.
      </div>
    `;
    body.appendChild(row);
    return;
  }

  list.forEach((s) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.setAttribute("data-superadmin-id", s.id);

    const roleLabel = s.role === "ceo" ? "CEO" : "Admin";
    const countryLabel = s.country || "–";
    const passwordLabel = s.password || "";

    // Sub-Zeile: Land + (nur für CEO) die aktuelle PIN
    let subLine = countryLabel;
    if (isCeo && passwordLabel) {
      subLine = `${countryLabel} · PW: ${passwordLabel}`;
    }

    let actionsHtml = "";
    if (isCeo) {
      actionsHtml = `
        <button class="m-icon-btn js-superadmin-edit" type="button" data-id="${s.id}" title="Bearbeiten">
          ✏️
        </button>
        <button class="m-icon-btn js-superadmin-delete" type="button" data-id="${s.id}" title="Löschen">
          🗑
        </button>
      `;
    } else {
      actionsHtml = `
        <button class="m-icon-btn js-superadmin-edit" type="button" data-id="${s.id}" title="Profil bearbeiten">
          ✏️
        </button>
      `;
    }

    row.innerHTML = `
      <div>
        <div class="m-table-main">${s.name}</div>
      </div>
      <div>
        <div class="m-table-main">${s.email || "-"}</div>
      </div>
      <div>
        <div class="m-superadmin-icon">
          ${
            s.avatarUrl
              ? `<img src="${s.avatarUrl}" alt="${s.name}" />`
              : `<span>Kein Icon</span>`
          }
        </div>
      </div>
      <div>
        <div class="m-table-main">${roleLabel}</div>
        <div class="m-table-sub">${subLine}</div>
      </div>
      <div class="m-table-actions">
        ${actionsHtml}
      </div>
    `;

    body.appendChild(row);
  });

  attachSuperadminActionHandlers();
}


// --- Actions: Restaurants ------------------------------------------

function attachRestaurantActionHandlers() {
  const container = document.getElementById("restaurantsTableBody");
  if (!container) return;

  container.querySelectorAll(".js-restaurant-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (id) handleEditRestaurant(id);
    });
  });

  container.querySelectorAll(".js-restaurant-login").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      // Hier später echter Impersonation-Login
      alert(
        "Login als Kunden-Admin (Platzhalter) – später Weiterleitung zu Kunden-Admin mit Token für Restaurant-ID: " +
          id
      );
    });
  });

  container.querySelectorAll(".js-restaurant-qr").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      // Hier später echte QR-Link-Ansicht
      alert(
        "QR-Links für Restaurant " +
          id +
          " – später eigene Ansicht mit allen Tischen und QR-Codes."
      );
    });
  });
}

// --- Actions: Superadmins ------------------------------------------

function attachSuperadminActionHandlers() {
  const body = document.getElementById("superadminsTableBody");
  if (!body) return;

  const mail =
    currentSuperadmin && currentSuperadmin.email
      ? currentSuperadmin.email.toLowerCase()
      : (currentSuperadminEmail || "").toLowerCase();

  const isCeo = typeof isCurrentSuperadminOwner === "function"
    ? isCurrentSuperadminOwner()
    : (currentSuperadminRole === "ceo" || mail === "albert.hoti@menyra.com");

  body.querySelectorAll(".js-superadmin-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      const s = superadmins.find((x) => x.id === id);
      if (!s) return;

      // Nicht-CEOs dürfen nur ihren eigenen Eintrag bearbeiten
      if (!isCeo && (s.email || "").toLowerCase() !== mail) {
        alert("Du kannst nur dein eigenes Superadmin-Profil bearbeiten.");
        return;
      }

      openSuperadminForm(s);
    });
  });

  if (isCeo) {
    body.querySelectorAll(".js-superadmin-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;

        const s = superadmins.find((x) => x.id === id);
        if (s && (s.email || "").toLowerCase() === "albert.hoti@menyra.com") {
          alert("Der CEO-Account kann nicht gelöscht werden.");
          return;
        }

        const ok = window.confirm(
          "Diesen Superadmin wirklich löschen? Zugriff für diese Person wird damit entfernt."
        );
        if (!ok) return;
        try {
          await deleteDoc(doc(db, "superadmins", id));
        } catch (err) {
          console.error("Fehler beim Löschen des Superadmins:", err);
          alert("Fehler beim Löschen. Siehe Konsole.");
        }
      });
    });
  }
}

// 💠 ABSCHNITT 5 – Restaurant- & Superadmin-Tabellen + Actions (ENDE) ------





























// 💠 ABSCHNITT 6 – Restaurant-Formular & Speichern (ANFANG) -----------------

// --- Restaurant-Formular (UI) --------------------------------------

function openRestaurantForm(restaurant) {
  const overlay = document.getElementById("restaurantFormOverlay");
  const title = document.getElementById("restaurantFormTitle");

  const idInput = document.getElementById("restaurantId");
  const customerTypeSelect = document.getElementById("customerType");
  const nameInput = document.getElementById("restaurantName");

  const billingModelSelect = document.getElementById("billingModel");
  const priceGroup = document.getElementById("priceGroup");
  const priceInput = document.getElementById("priceValue");

  const statusSelect = document.getElementById("restaurantStatus");

  const ownerNameInput = document.getElementById("restaurantOwnerName");
  const ownerPhoneInput = document.getElementById("restaurantOwnerPhone");
  const cityInput = document.getElementById("restaurantCity");
  const countryInput = document.getElementById("restaurantCountry");
  const planNameInput = document.getElementById("restaurantPlanName");
  const expensesInput = document.getElementById("restaurantExpensesYear");

  const advancedBlock = document.getElementById("restaurantAdvancedBlock");

  if (!overlay) return;

  const isOwner = isCurrentSuperadminOwner();
  const scopedCountry = getCurrentSuperadminCountry();

  if (restaurant) {
    // === BEARBEITEN ================================================
    title.textContent = "Kunde bearbeiten";
    idInput.value = restaurant.id;

    if (customerTypeSelect) {
      customerTypeSelect.value = restaurant.customerType || "restaurant";
    }

    nameInput.value = restaurant.name || "";

    const billingModel = restaurant.billingModel || "yearly";
    if (billingModelSelect) {
      billingModelSelect.value = billingModel;
    }

    if (priceInput) {
      if (billingModel === "monthly") {
        priceInput.value =
          typeof restaurant.priceMonth === "number" && !Number.isNaN(restaurant.priceMonth)
            ? restaurant.priceMonth
            : "";
      } else {
        priceInput.value =
          typeof restaurant.priceYear === "number" && !Number.isNaN(restaurant.priceYear)
            ? restaurant.priceYear
            : "";
      }
    }

    if (statusSelect) {
      statusSelect.value = restaurant.status || "aufbauphase";
    }

    if (ownerNameInput) ownerNameInput.value = restaurant.ownerName || "";
    if (ownerPhoneInput) ownerPhoneInput.value = restaurant.ownerPhone || "";
    if (cityInput) cityInput.value = restaurant.city || "";
    if (countryInput) {
      countryInput.value = restaurant.country || "";
    }
    if (planNameInput) planNameInput.value = restaurant.planName || "Standard";

    if (expensesInput) {
      expensesInput.value =
        typeof restaurant.expensesYear === "number" && !Number.isNaN(restaurant.expensesYear)
          ? restaurant.expensesYear
          : 0;
    }

    if (advancedBlock) {
      // beim Bearbeiten: erweiterte Angaben anzeigen
      advancedBlock.style.display = "";
    }
    if (priceGroup && billingModelSelect) {
      if (
        billingModelSelect.value === "yearly" ||
        billingModelSelect.value === "monthly"
      ) {
        priceGroup.style.display = "";
      } else {
        priceGroup.style.display = "none";
      }
    }
  } else {
    // === NEUER KUNDE ===============================================
    title.textContent = "Neuer Kunde";
    idInput.value = "";

    if (customerTypeSelect) {
      customerTypeSelect.value = "restaurant";
    }

    nameInput.value = "";

    if (billingModelSelect) {
      billingModelSelect.value = "";
    }
    if (priceInput) {
      priceInput.value = "";
    }
    if (priceGroup) {
      priceGroup.style.display = "none";
    }

    if (statusSelect) {
      statusSelect.value = "aufbauphase";
    }

    if (ownerNameInput) ownerNameInput.value = "";
    if (ownerPhoneInput) ownerPhoneInput.value = "";
    if (cityInput) cityInput.value = "";
    if (countryInput) {
      // Standard: wenn Admin auf Land eingeschränkt → Land vorbefüllen
      if (!isOwner && scopedCountry) {
        countryInput.value = scopedCountry;
      } else {
        countryInput.value = "";
      }
    }
    if (planNameInput) planNameInput.value = "Standard";
    if (expensesInput) expensesInput.value = "";

    if (advancedBlock) {
      // beim Erstellen: erweiterte Angaben erstmal verstecken
      advancedBlock.style.display = "none";
    }
  }

  // Land-Feld für normale Country-Admins sperren,
  // damit sie das Land nicht ändern können
  if (countryInput) {
    if (!isOwner && scopedCountry) {
      countryInput.disabled = true;
    } else {
      countryInput.disabled = false;
    }
  }

  overlay.classList.remove("is-hidden");
}

function closeRestaurantForm() {
  const overlay = document.getElementById("restaurantFormOverlay");
  const form = document.getElementById("restaurantForm");
  const countryInput = document.getElementById("restaurantCountry");
  if (!overlay || !form) return;
  overlay.classList.add("is-hidden");
  form.reset();
  const idInput = document.getElementById("restaurantId");
  if (idInput) idInput.value = "";
  if (countryInput) {
    countryInput.disabled = false;
  }
}

/**
 * Hilfsfunktionen zur Normalisierung
 * ----------------------------------
 * Sorgt dafür, dass überall die gleichen Keys im Code ankommen.
 */

function normalizeCustomerType(value) {
  const v = (value || "").toString().toLowerCase().trim();
  if (!v) return "restaurant";

  // Gastro
  if (["restaurant", "resto"].includes(v)) return "restaurant";
  if (["cafe", "kafe", "coffee"].includes(v)) return "cafe";
  if (["club", "nightlife", "club/nightlife"].includes(v)) return "club";

  // Übernachtung
  if (["hotel"].includes(v)) return "hotel";
  if (["motel"].includes(v)) return "motel";

  // Online / digitale Kunden (E-Commerce, Rent a Car, etc.)
  if (
    [
      "ecommerce",
      "e-commerce",
      "shop",
      "online-shop",
      "onlineshop",
      "online_shop",
      "eshop",
      "e-shop",
      "rentacar",
      "rent-a-car",
      "rentalcar"
    ].includes(v)
  ) {
    // In Phase 1 fassen wir alles als Online-Shop zusammen
    return "onlineshop";
  }

  // Dienstleistung / Agentur / Sonstiges
  if (
    [
      "service",
      "dienstleistung",
      "agency",
      "agentur",
      "büro",
      "buero",
      "office",
      "studio",
      "salon"
    ].includes(v)
  ) {
    return "service";
  }

  // Fallback
  return "restaurant";
}

function normalizeBillingModel(value) {
  const v = (value || "").toString().toLowerCase().trim();
  if (["monthly", "monatlich", "month"].includes(v)) return "monthly";
  if (["yearly", "jährlich", "jaehrlich", "year", "jahr"].includes(v)) return "yearly";

  // Fallback: Jahresabo
  return "yearly";
}

function normalizeStatus(value) {
  const v = (value || "").toString().toLowerCase().trim();
  if (!v) return "active";

  if (["active", "aktiv"].includes(v)) return "active";
  if (["trial", "test", "testphase"].includes(v)) return "trial";
  if (["paused", "pause", "pausiert"].includes(v)) return "paused";
  if (["demo"].includes(v)) return "demo";
  if (["setup", "aufbauphase", "building", "in_umsetzung", "in-umsetzung"].includes(v))
    return "aufbauphase";
  if (
    [
      "contract_end",
      "contract-end",
      "vertragsende",
      "vertrag_ende",
      "vertrag-geendet"
    ].includes(v)
  )
    return "contract_end";
  if (
    ["cancelled", "canceled", "gekündigt", "gekuendigt", "kuendigung", "kündigung"].includes(
      v
    )
  )
    return "cancelled";

  return "active";
}

async function saveRestaurantFromForm(e) {
  e.preventDefault();

  const idInput = document.getElementById("restaurantId");
  const customerTypeSelect = document.getElementById("customerType");
  const nameInput = document.getElementById("restaurantName");

  const billingModelSelect = document.getElementById("billingModel");
  const priceInput = document.getElementById("priceValue");
  const statusSelect = document.getElementById("restaurantStatus");

  const ownerNameInput = document.getElementById("restaurantOwnerName");
  const ownerPhoneInput = document.getElementById("restaurantOwnerPhone");
  const cityInput = document.getElementById("restaurantCity");
  const countryInput = document.getElementById("restaurantCountry");
  const planNameInput = document.getElementById("restaurantPlanName");
  const expensesInput = document.getElementById("restaurantExpensesYear");

  const id = idInput.value || null;
  const customerType = normalizeCustomerType(customerTypeSelect.value);
  const name = nameInput.value.trim();

  const billingModel = normalizeBillingModel(billingModelSelect.value);
  const rawPrice = (priceInput.value || "").toString().replace(",", ".");

  let priceYear = 0;
  let priceMonth = 0;

  if (!name) {
    alert("Bitte einen Namen für den Betrieb eingeben.");
    return;
  }

  if (!billingModel || (billingModel !== "yearly" && billingModel !== "monthly")) {
    alert("Bitte ein Abrechnungsmodell wählen.");
    return;
  }

  const numericPrice = Number(rawPrice);
  if (!numericPrice || Number.isNaN(numericPrice)) {
    alert("Bitte einen gültigen Preis eingeben.");
    return;
  }

  if (billingModel === "yearly") {
    priceYear = numericPrice;
    priceMonth = numericPrice / 12;
  } else {
    priceMonth = numericPrice;
    priceYear = numericPrice * 12;
  }

  priceYear = Math.round(priceYear * 100) / 100;
  priceMonth = Math.round(priceMonth * 100) / 100;

  const status = normalizeStatus(statusSelect.value || "aufbauphase");

  const ownerName = (ownerNameInput?.value || "").trim();
  const ownerPhone = (ownerPhoneInput?.value || "").trim();
  const city = (cityInput?.value || "").trim();
  let country = (countryInput?.value || "").trim();
  const planName = (planNameInput?.value || "Standard").trim();

  const expensesYear = Number((expensesInput?.value || "0").toString().replace(",", "."));

  const isOwner = isCurrentSuperadminOwner();
  const scopedCountry = getCurrentSuperadminCountry();

  // Sicherheits-Check: normale Admins dürfen nur Kunden im eigenen Land bearbeiten
  if (id) {
    const scoped = getScopedRestaurants();
    const allowed = scoped.some((r) => r.id === id);
    if (!allowed && !isOwner) {
      alert("Du kannst diesen Kunden nicht bearbeiten (außerhalb deines Bereichs).");
      return;
    }
  }

  // Land für normale Country-Admins erzwingen
  if (!isOwner && scopedCountry) {
    country = scopedCountry;
  }

  try {
    const payload = {
      customerType, // "restaurant" | "cafe" | "club" | "hotel" | "motel" | "onlineshop" | "service"
      name,
      ownerName,
      ownerPhone,
      city,
      country,
      planName,
      billingModel, // "yearly" | "monthly"
      priceMonth,
      priceYear,
      expensesYear: Number.isNaN(expensesYear) ? 0 : expensesYear,
      status // "aufbauphase" | "demo" | "trial" | "active" | "contract_end" | "cancelled"
    };

    if (id) {
      const ref = doc(db, "restaurants", id);
      await updateDoc(ref, payload);
    } else {
      const createdBy = currentSuperadmin?.email || null;
      await addDoc(collection(db, "restaurants"), {
        ...payload,
        createdAt: serverTimestamp(),
        createdBy
      });
    }

    closeRestaurantForm();
  } catch (err) {
    console.error("Fehler beim Speichern des Kunden:", err);
    alert("Fehler beim Speichern. Siehe Konsole.");
  }
}

function handleEditRestaurant(id) {
  // Nur Kunden im eigenen Sichtbereich bearbeitbar
  const scoped = getScopedRestaurants();
  const r = scoped.find((x) => x.id === id);
  if (!r) {
    alert("Kunde nicht gefunden oder außerhalb deines Bereichs.");
    return;
  }
  openRestaurantForm(r);
}

// 💠 ABSCHNITT 6 – Restaurant-Formular & Speichern (ENDE) -------------------





























// 💠 ABSCHNITT 7 – Lead-Formular (UI & Speichern) (ANFANG) ------------------

// --- Lead-Formular (UI) --------------------------------------------

function openLeadForm(lead) {
  const overlay = document.getElementById("leadFormOverlay");
  const title = document.getElementById("leadFormTitle");

  const idInput = document.getElementById("leadId");
  const typeSelect = document.getElementById("leadCustomerType");
  const nameInput = document.getElementById("leadBusinessName");
  const instaInput = document.getElementById("leadInstagram");
  const phoneInput = document.getElementById("leadPhone");
  const statusSelect = document.getElementById("leadStatus");
  const noteInput = document.getElementById("leadNote");

  if (!overlay) return;

  if (lead) {
    // Bearbeiten
    title.textContent = "Lead bearbeiten";
    idInput.value = lead.id;

    if (typeSelect) {
      typeSelect.value = (lead.customerType || "restaurant").toLowerCase();
    }
    if (nameInput) nameInput.value = lead.businessName || "";
    if (instaInput) instaInput.value = lead.instagram || "";
    if (phoneInput) phoneInput.value = lead.phone || "";
    if (statusSelect) statusSelect.value = (lead.status || "new").toLowerCase();
    if (noteInput) noteInput.value = lead.note || "";
  } else {
    // Neuer Lead
    title.textContent = "Neuer Lead";
    if (idInput) idInput.value = "";
    if (typeSelect) typeSelect.value = "restaurant";
    if (nameInput) nameInput.value = "";
    if (instaInput) instaInput.value = ""; // ✅ FIX: richtiges Feld leeren
    if (phoneInput) phoneInput.value = "";
    if (statusSelect) statusSelect.value = "new";
    if (noteInput) noteInput.value = "";
  }

  overlay.classList.remove("is-hidden");
}

function closeLeadForm() {
  const overlay = document.getElementById("leadFormOverlay");
  const form = document.getElementById("leadForm");
  const idInput = document.getElementById("leadId");
  if (!overlay || !form) return;
  overlay.classList.add("is-hidden");
  form.reset();
  if (idInput) idInput.value = "";
}

async function saveLeadFromForm(e) {
  e.preventDefault();

  const idInput = document.getElementById("leadId");
  const typeSelect = document.getElementById("leadCustomerType");
  const nameInput = document.getElementById("leadBusinessName");
  const instaInput = document.getElementById("leadInstagram");
  const phoneInput = document.getElementById("leadPhone");
  const statusSelect = document.getElementById("leadStatus");
  const noteInput = document.getElementById("leadNote");

  const id = idInput.value || null;
  const customerType = normalizeCustomerType(
    (typeSelect.value || "restaurant").toLowerCase()
  );
  const businessName = (nameInput.value || "").trim();
  let instagram = (instaInput.value || "").trim();
  const phone = (phoneInput.value || "").trim();
  let status = (statusSelect.value || "new").toLowerCase();
  const note = (noteInput.value || "").trim();

  if (!businessName) {
    alert("Bitte einen Namen für den Betrieb eingeben.");
    return;
  }

  if (instagram.startsWith("https://") || instagram.startsWith("http://")) {
    // Link lassen wie er ist
  } else if (instagram && !instagram.startsWith("@")) {
    instagram = "@" + instagram;
  }

  // Status auf unsere Codes normalisieren
  if (status === "no-interest") status = "no_interest";
  if (status === "kein_interesse") status = "no_interest";

  // Land & Besitzer für Lead setzen (für Berechtigungen)
  const leadCountry =
    (currentSuperadminCountry || "").toString().trim() ||
    (typeof getCurrentSuperadminCountry === "function"
      ? (getCurrentSuperadminCountry() || "").toString().trim()
      : "");

  const ownerEmail =
    (currentSuperadmin && currentSuperadmin.email) ||
    currentSuperadminEmail ||
    "";

  try {
    const payload = {
      customerType,
      businessName,
      instagram,
      phone,
      status,
      note,
      country: leadCountry,
      ownerEmail,
      updatedAt: serverTimestamp()
    };

    if (id) {
      const ref = doc(db, "leads", id);
      await updateDoc(ref, payload);
    } else {
      await addDoc(collection(db, "leads"), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }

    closeLeadForm();
  } catch (err) {
    console.error("Fehler beim Speichern des Leads:", err);
    alert("Fehler beim Speichern. Siehe Konsole.");
  }
}

// 💠 ABSCHNITT 7 – Lead-Formular (UI & Speichern) (ENDE) --------------------

































// 💠 ABSCHNITT 8 – Superadmin-Formular (UI & Speichern) (ANFANG) -----------

// Hilfsfunktion: 4-stellige PIN generieren
function generateRandomPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// --- Superadmin-Formular (UI) --------------------------------------

function openSuperadminForm(superadmin) {
  const overlay = document.getElementById("superadminFormOverlay");
  const title = document.getElementById("superadminFormTitle");

  const idInput = document.getElementById("superadminId");
  const nameInput = document.getElementById("superadminName");
  const emailInput = document.getElementById("superadminEmail");
  const avatarInput = document.getElementById("superadminAvatarUrl");
  const roleSelect = document.getElementById("superadminRole");
  const countryInput = document.getElementById("superadminCountry");
  const passwordInput = document.getElementById("superadminPassword");

  if (!overlay) return;

  const mail = (currentSuperadminEmail || "").toLowerCase();
  const isCeo =
    currentSuperadminRole === "ceo" || mail === "albert.hoti@menyra.com";

  // Nur CEO darf neue Superadmins anlegen
  if (!superadmin && !isCeo) {
    alert("Nur der CEO kann neue Superadmins anlegen.");
    return;
  }

  if (superadmin) {
    // Bearbeiten
    title.textContent = "Superadmin bearbeiten";
    if (idInput) idInput.value = superadmin.id;
    if (nameInput) nameInput.value = superadmin.name || "";
    if (emailInput) emailInput.value = superadmin.email || "";
    if (avatarInput) avatarInput.value = superadmin.avatarUrl || "";

    if (roleSelect) {
      roleSelect.value = superadmin.role === "ceo" ? "ceo" : "admin";
    }
    if (countryInput) {
      countryInput.value = superadmin.country || "";
    }
    // PIN anzeigen, wenn vorhanden (damit du als CEO siehst, was aktuell gilt)
    if (passwordInput) {
      passwordInput.value = superadmin.password || "";
    }
  } else {
    // Neuer Superadmin
    title.textContent = "Neuer Superadmin";
    if (idInput) idInput.value = "";
    if (nameInput) nameInput.value = "";
    if (emailInput) emailInput.value = "";
    if (avatarInput) value = "";
    if (roleSelect) roleSelect.value = "admin";
    if (countryInput) countryInput.value = "";

    // Neue 4-stellige PIN automatisch generieren
    const pin = generateRandomPin();
    if (passwordInput) {
      passwordInput.value = pin;
    }
  }

  overlay.classList.remove("is-hidden");
}

function closeSuperadminForm() {
  const overlay = document.getElementById("superadminFormOverlay");
  const form = document.getElementById("superadminForm");
  if (!overlay || !form) return;
  overlay.classList.add("is-hidden");
  form.reset();
  const idInput = document.getElementById("superadminId");
  if (idInput) idInput.value = "";
}

async function saveSuperadminFromForm(e) {
  e.preventDefault();

  const idInput = document.getElementById("superadminId");
  const nameInput = document.getElementById("superadminName");
  const emailInput = document.getElementById("superadminEmail");
  const avatarInput = document.getElementById("superadminAvatarUrl");
  const roleSelect = document.getElementById("superadminRole");
  const countryInput = document.getElementById("superadminCountry");
  const passwordInput = document.getElementById("superadminPassword");

  const id = idInput?.value || null;
  const name = (nameInput?.value || "").trim();
  const email = (emailInput?.value || "").trim().toLowerCase();
  const avatarUrl = (avatarInput?.value || "").trim();
  const roleFromForm =
    (roleSelect?.value || "admin").toString().toLowerCase() === "ceo"
      ? "ceo"
      : "admin";
  const countryFromForm = (countryInput?.value || "").trim();

  let password = (passwordInput?.value || "").trim();

  if (!name) {
    alert("Bitte einen Namen eingeben.");
    return;
  }
  if (!email) {
    alert("Bitte eine Login/E-Mail eingeben.");
    return;
  }

  const mail = (currentSuperadminEmail || "").toLowerCase();
  const isCeo =
    currentSuperadminRole === "ceo" || mail === "albert.hoti@menyra.com";

  // Existierenden Datensatz holen (falls Edit)
  let existing = null;
  if (id) {
    existing = superadmins.find((s) => s.id === id) || null;
  }

  // Nur CEO darf Rolle/Land anderer Accounts ändern / neue anlegen
  const isOwn = existing && (existing.email || "").toLowerCase() === mail;

  if (id && !isCeo && !isOwn) {
    alert("Du kannst nur dein eigenes Superadmin-Profil bearbeiten.");
    return;
  }

  // PIN-Logik:
  // - Neuer Superadmin: falls leer → automatisch generieren
  // - Beim Bearbeiten: PIN muss 4-stellig sein, wenn etwas eingetragen ist
  if (!password) {
    // komplett leer gelassen → für neue Superadmins neue PIN generieren
    if (!id) {
      password = generateRandomPin();
      if (passwordInput) {
        passwordInput.value = password;
      }
    } else if (existing && existing.password) {
      // Beim Editieren nichts eingetragen → bestehende PIN behalten
      password = existing.password;
    }
  }

  if (!/^\d{4}$/.test(password)) {
    alert("Die PIN muss 4 Ziffern haben.");
    return;
  }

  // Rolle & Land final bestimmen:
  let finalRole = roleFromForm;
  let finalCountry = countryFromForm;

  if (id && !isCeo && existing) {
    // Normale Admins dürfen ihre Rolle/Land NICHT ändern
    finalRole = existing.role;
    finalCountry = existing.country;
  }

  try {
    const payload = {
      name,
      email,
      avatarUrl,
      role: finalRole,
      country: finalCountry,
      password
    };

    if (id) {
      const ref = doc(db, "superadmins", id);
      await updateDoc(ref, payload);
    } else {
      if (!isCeo) {
        alert("Nur der CEO kann neue Superadmins anlegen.");
        return;
      }
      await addDoc(collection(db, "superadmins"), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }

    closeSuperadminForm();
  } catch (err) {
    console.error("Fehler beim Speichern des Superadmins:", err);
    alert("Fehler beim Speichern. Siehe Konsole.");
  }
}

// 💠 ABSCHNITT 8 – Superadmin-Formular (UI & Speichern) (ENDE) -------------






























// 💠 ABSCHNITT 9 – CSV-Export (ANFANG) -------------------------------------

// --- CSV Export ----------------------------------------------------

function handleCsvExport() {
  // Basis: nur die Kunden im Sichtbereich des aktuellen Superadmins
  const base = getScopedRestaurants();

  if (!base || !base.length) {
    alert("Keine Restaurants zum Exportieren.");
    return;
  }

  const header = [
    "id",
    "name",
    "ownerName",
    "ownerPhone",
    "city",
    "country",
    "status",
    "planName",
    "billingModel",
    "priceMonth",
    "priceYear",
    "expensesYear"
  ];

  const rows = base.map((r) => [
    r.id,
    r.name,
    r.ownerName,
    r.ownerPhone,
    r.city,
    r.country,
    r.status,
    r.planName,
    r.billingModel,
    r.priceMonth,
    r.priceYear,
    r.expensesYear
  ]);

  const csvLines = [
    header.join(";"),
    ...rows.map((row) =>
      row
        .map((val) => {
          const s = String(val ?? "");
          if (s.includes(";") || s.includes('"')) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(";")
    )
  ];

  const blob = new Blob([csvLines.join("\r\n")], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "menyra-restaurants.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 💠 ABSCHNITT 9 – CSV-Export (ENDE) ---------------------------------------


























// 💠 ABSCHNITT 10 – Firestore-Subscriptions (ANFANG) -----------------------

// --- Firestore-Subscription: Restaurants ----------------------------

function subscribeRestaurants() {
  try {
    const colRef = collection(db, "restaurants");
    onSnapshot(
      colRef,
      (snapshot) => {
        restaurants = snapshot.docs.map(mapRestaurantDoc);
        updateDashboardFromRestaurants();
        renderRestaurantsTable();
        // Offers hängen am Restaurant-Namen/Ort → bei Änderungen neu rendern
        if (typeof renderOffersTable === "function") {
          renderOffersTable();
        }
        // Dashboard-Aktivität aktualisieren
        rebuildActivityList();
      },
      (err) => {
        console.error("Fehler beim Laden der Restaurants:", err);
      }
    );
    console.log("MENYRA Superadmin – Firestore verbunden (restaurants).");
  } catch (e) {
    console.error("Firestore-Verbindung (restaurants) fehlgeschlagen:", e);
  }
}

/**
 * Standard-Superadmins einmalig anlegen, falls Collection leer ist.
 * (Nur für deinen lokalen DEV-Account mit den drei festen Logins)
 */
async function seedDefaultSuperadmins() {
  const defaults = [
    {
      name: "Albert Hoti",
      email: "albert.hoti@menyra.com",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Albert+Hoti&background=4f46e5&color=ffffff",
      role: "ceo",
      country: "ALL",
      password: "1992"
    },
    {
      name: "Milan Nikolic",
      email: "milan.nikolic@menyra.com",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Milan+Nikolic&background=db2777&color=ffffff",
      role: "admin",
      country: "XK",   // kannst du im Dashboard / Firestore anpassen
      password: "1993"
    },
    {
      name: "Drilon Hoti",
      email: "drilon.hoti@menyra.com",
      avatarUrl:
        "https://ui-avatars.com/api/?name=Drilon+Hoti&background=059669&color=ffffff",
      role: "admin",
      country: "XK",   // kannst du im Dashboard / Firestore anpassen
      password: "1998"
    }
  ];

  try {
    for (const s of defaults) {
      await addDoc(collection(db, "superadmins"), {
        name: s.name,
        email: s.email,
        avatarUrl: s.avatarUrl,
        role: s.role,
        country: s.country,
        password: s.password,
        createdAt: serverTimestamp()
      });
    }
    console.log("Standard-Superadmins wurden angelegt.");
  } catch (err) {
    console.error("Fehler beim Anlegen der Standard-Superadmins:", err);
  }
}


/**
 * Falls ein Superadmin eingeloggt ist, seine Daten (Name/Avatar/Rolle/Land)
 * aus der Firestore-Collection "superadmins" übernehmen und UI + Token aktualisieren.
 */
function updateCurrentSuperadminFromCollection() {
  if (
    !currentSuperadmin ||
    !Array.isArray(superadmins) ||
    !superadmins.length
  ) {
    // ggf. trotzdem die aktuelle Info aus dem Token in die UI schreiben
    applyCurrentSuperadminToUI();
    return;
  }

  const email = (currentSuperadmin.email || "").toLowerCase();
  if (!email) {
    applyCurrentSuperadminToUI();
    return;
  }

  const match = superadmins.find(
    (s) => (s.email || "").toLowerCase() === email
  );
  if (!match) {
    // Kein passender Eintrag gefunden → nur Name aus Token verwenden
    applyCurrentSuperadminToUI();
    return;
  }

  let changed = false;

  if (match.name && match.name !== currentSuperadmin.name) {
    currentSuperadmin.name = match.name;
    changed = true;
  }
  if (match.avatarUrl && match.avatarUrl !== currentSuperadmin.avatarUrl) {
    currentSuperadmin.avatarUrl = match.avatarUrl;
    changed = true;
  }
  if (match.role && match.role !== currentSuperadmin.role) {
    currentSuperadmin.role = match.role;
    changed = true;
  }
  if (
    typeof match.country === "string" &&
    match.country !== currentSuperadmin.country
  ) {
    currentSuperadmin.country = match.country;
    changed = true;
  }

  if (changed) {
    persistCurrentSuperadmin();
  }

  applyCurrentSuperadminToUI();
}

// --- Firestore-Subscription: Superadmins --------------------------

function subscribeSuperadmins() {
  try {
    const colRef = collection(db, "superadmins");
    onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Collection ist noch leer → einmalig Standard-Accounts anlegen
          seedDefaultSuperadmins();
          superadmins = [];
          renderSuperadminsTable();
          // UI trotzdem mit Token-Infos füllen
          applyCurrentSuperadminToUI();
          return;
        }

        superadmins = snapshot.docs.map(mapSuperadminDoc);
        renderSuperadminsTable();
        // Falls ein Superadmin eingeloggt ist, Daten aus Firestore in UI spiegeln
        updateCurrentSuperadminFromCollection();
      },
      (err) => {
        console.error("Fehler beim Laden der Superadmins:", err);
      }
    );
    console.log("MENYRA Superadmin – Firestore verbunden (superadmins).");
  } catch (e) {
    console.error("Firestore-Verbindung (superadmins) fehlgeschlagen:", e);
  }
}

// Leads (Akquise / Vertrieb)
function subscribeLeads() {
  try {
    const colRef = collection(db, "leads");
    onSnapshot(
      colRef,
      (snapshot) => {
        leads = snapshot.docs.map(mapLeadDoc);
        updateLeadsCardUI();
        renderLeadsSummary();
        renderLeadsTable();
        // Dashboard-Aktivität aktualisieren
        rebuildActivityList();
        console.log("Leads geladen:", leads.length);
      },
      (err) => {
        console.error("Fehler beim Laden der Leads:", err);
      }
    );
    console.log("MENYRA Superadmin – Firestore verbunden (leads).");
  } catch (e) {
    console.error("Firestore-Verbindung (leads) fehlgeschlagen:", e);
  }
}

// Angebote (collectionGroup auf restaurants/{id}/offers)
function subscribeOffers() {
  try {
    const offersGroupRef = collectionGroup(db, "offers");
    onSnapshot(
      offersGroupRef,
      (snapshot) => {
        offers = snapshot.docs.map(mapOfferDoc);
        if (typeof renderOffersTable === "function") {
          renderOffersTable();
        }
        console.log("Offers geladen:", offers.length);
      },
      (err) => {
        console.error("Fehler beim Laden der Angebote:", err);
      }
    );
    console.log("MENYRA Superadmin – Firestore verbunden (offers).");
  } catch (e) {
    console.error("Firestore-Verbindung (offers) fehlgeschlagen:", e);
  }
}

// Bestellungen heute (alle restaurants/{id}/orders über collectionGroup)
function subscribeOrdersToday() {
  try {
    const ordersGroupRef = collectionGroup(db, "orders");

    onSnapshot(
      ordersGroupRef,
      (snapshot) => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );

        const perRestaurant = {};
        let count = 0;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const ts = data.createdAt || data.timestamp || data.created_at;
          if (!ts || typeof ts.toDate !== "function") return;

          const d = ts.toDate();
          if (d >= start && d < end) {
            count++;
            const parent = docSnap.ref.parent.parent;
            const restaurantId =
              data.restaurantId || (parent ? parent.id : "unknown");
            perRestaurant[restaurantId] = (perRestaurant[restaurantId] || 0) + 1;
          }
        });

        ordersTodayCount = count;

        let bestId = null;
        let bestCount = 0;
        Object.entries(perRestaurant).forEach(([rid, c]) => {
          if (c > bestCount) {
            bestId = rid;
            bestCount = c;
          }
        });

        topRestaurantToday = bestId
          ? { restaurantId: bestId, count: bestCount }
          : null;

        updateOrdersCardUI();
      },
      (err) => {
        console.error("Fehler beim Laden der Bestellungen:", err);
      }
    );

    console.log("MENYRA Superadmin – Firestore verbunden (orders).");
  } catch (e) {
    console.error("Firestore-Verbindung (orders) fehlgeschlagen:", e);
  }
}

// Registrierte User (für Social / Profile etc.)
function subscribeUsers() {
  try {
    const usersRef = collection(db, "users");

    onSnapshot(
      usersRef,
      (snapshot) => {
        // 🔹 Alle User mappen und in globales Array schreiben
        users = snapshot.docs.map(mapUserDoc);

        // Dashboard-Counts auf Basis der gemappten User
        usersTotalCount = users.length;
        usersActiveCount = users.filter((u) => u.isActive).length;

        // Dashboard-Karte aktualisieren
        updateUsersCardUI();
        // Users-View neu rendern
        if (typeof renderUsersTable === "function") {
          renderUsersTable();
        }
      },
      (err) => {
        console.error("Fehler beim Laden der User:", err);
      }
    );

    console.log("MENYRA Superadmin – Firestore verbunden (users).");
  } catch (e) {
    console.error("Firestore-Verbindung (users) fehlgeschlagen:", e);
  }
}

// 💠 ABSCHNITT 10 – Firestore-Subscriptions (ENDE) --------------------------


































// 💠 ABSCHNITT 11 – DOMContentLoaded & UI-Wiring (ANFANG) -------------------

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // --- Aktuellen Superadmin aus globalem State prüfen -------------
  // (ensureAuthenticatedSuperadmin() wurde bereits beim Laden des Moduls ausgeführt)
  if (!currentSuperadmin || !currentSuperadmin.email) {
    // Kein gültiger Login -> zurück zur Login-Seite
    window.location.href = "login.html";
    return;
  }

  // Legacy-Variablen weiterfüttern, damit ältere Code-Teile funktionieren
  currentSuperadminEmail = (currentSuperadmin.email || "").toLowerCase();
  currentSuperadminRole =
    (currentSuperadmin.role || "").toLowerCase() ||
    (currentSuperadminEmail === "albert.hoti@menyra.com" ? "ceo" : "admin");
  currentSuperadminCountry = currentSuperadmin.country || "";

  const isCeo =
    typeof isCurrentSuperadminOwner === "function"
      ? isCurrentSuperadminOwner()
      : (currentSuperadminRole === "ceo" ||
         currentSuperadminEmail === "albert.hoti@menyra.com");

  // Sprache laden & anwenden
  loadSavedLang();
  applyTranslations();

  // Direkt nach dem Laden: aktuellen Superadmin (aus Token/Firestore) im UI anzeigen
  applyCurrentSuperadminToUI();

  // --- Views -------------------------------------------------------
  const views = document.querySelectorAll(".m-view");
  function showView(name) {
    views.forEach((view) => {
      if (view.dataset.view === name) {
        view.style.display = "";
      } else {
        view.style.display = "none";
      }
    });
  }

  // --- Elemente Topbar / Suche / Sidebar --------------------------
  const topSearch = document.getElementById("topSearch");
  const restaurantSearch = document.getElementById("restaurantSearch");

  const sidebarNav = document.querySelector(".m-sidebar-nav");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const burgerToggle = document.getElementById("burgerToggle");
  const mobileMenuClose = document.getElementById("mobileMenuClose");
  const mobileTopSearch = document.getElementById("mobileTopSearch");
  const mobileMenuInner = document.querySelector(".m-mobile-menu-inner");

  const themeToggle = document.getElementById("themeToggle");
  const mobileThemeToggle = document.getElementById("mobileThemeToggle");

  const langSelect = document.getElementById("langSelect");
  const mobileLangSelect = document.getElementById("mobileLangSelect");

  const logoutButton = document.getElementById("logoutButton");

  // --- Navigation (Desktop + Mobile) -------------------------------
  let desktopNavLinks = [];
  let mobileNavLinks = [];
  let allNavLinks = [];

  if (sidebarNav) {
    desktopNavLinks = sidebarNav.querySelectorAll("a[data-section]");
    allNavLinks = [...desktopNavLinks];
  }

  // Sidebar-Navigation ins Mobile-Menü klonen
  if (sidebarNav && mobileMenuInner) {
    const mobileNavSection = document.createElement("div");
    mobileNavSection.className = "m-mobile-menu-section m-mobile-menu-nav";

    const clonedNav = sidebarNav.cloneNode(true);
    mobileNavSection.appendChild(clonedNav);
    mobileMenuInner.appendChild(mobileNavSection);

    mobileNavLinks = mobileNavSection.querySelectorAll("a[data-section]");
    allNavLinks = [...allNavLinks, ...mobileNavLinks];
  }

  function setActiveSection(name) {
    showView(name);
    allNavLinks.forEach((link) => {
      const section = link.dataset.section || "";
      if (section === name) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  function handleDesktopNavClick(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const sectionName = link.dataset.section || "dashboard";
    setActiveSection(sectionName);
  }

  function handleMobileNavClick(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const sectionName = link.dataset.section || "dashboard";
    setActiveSection(sectionName);
    closeMobileMenu();
  }

  desktopNavLinks.forEach((link) => {
    link.addEventListener("click", handleDesktopNavClick);
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", handleMobileNavClick);
  });

  // Default: Dashboard
  setActiveSection("dashboard");

  // --- Mobile Drawer Menü ------------------------------------------
  function openMobileMenu() {
    if (!mobileMenu || !mobileMenuOverlay) return;
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileMenuOverlay.classList.add("is-visible");

    // Suche synchronisieren
    if (topSearch && mobileTopSearch) {
      mobileTopSearch.value = topSearch.value || "";
    }

    // Sprache synchronisieren
    const lang = getCurrentLang();
    if (mobileLangSelect && translations[lang]) {
      mobileLangSelect.value = lang;
    }

    // Optional: Fokus ins Menü setzen (z.B. auf Schließen-Button)
    if (mobileMenuClose) {
      mobileMenuClose.focus();
    }
  }

  function closeMobileMenu() {
    if (!mobileMenu || !mobileMenuOverlay) return;

    // Fokus zuerst aus dem Menü raus holen
    if (burgerToggle) {
      burgerToggle.focus();
    } else if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenuOverlay.classList.remove("is-visible");
  }

  if (burgerToggle && mobileMenu && mobileMenuOverlay) {
    burgerToggle.addEventListener("click", openMobileMenu);
  }
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", closeMobileMenu);
  }
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener("click", (e) => {
      if (e.target === mobileMenuOverlay) {
        closeMobileMenu();
      }
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
    }
  });

  // --- Theme (Desktop + Mobile) -----------------------------------
  function toggleTheme() {
    const isDark = body.classList.toggle("theme-dark");
    try {
      window.localStorage.setItem("menyraTheme", isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener("click", toggleTheme);
  }

  try {
    const savedTheme = window.localStorage.getItem("menyraTheme");
    if (savedTheme === "dark") {
      body.classList.add("theme-dark");
    }
  } catch {
    // ignore
  }

  // --- Sprache (Desktop + Mobile) ---------------------------------
  function handleLanguageChange(value) {
    if (!translations[value]) return;
    setCurrentLang(value);
    applyTranslations();
    renderRestaurantsTable();
    renderSuperadminsTable();
    renderOffersTable();
    renderLogsTable();
    // Nach Sprachwechsel Namen/Avatar erneut zeichnen (falls i18n im Profil)
    applyCurrentSuperadminToUI();
  }

  const currentLang = getCurrentLang();
  if (langSelect && translations[currentLang]) {
    langSelect.value = currentLang;
  }
  if (mobileLangSelect && translations[currentLang]) {
    mobileLangSelect.value = currentLang;
  }

  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      handleLanguageChange(e.target.value);
    });
  }
  if (mobileLangSelect) {
    mobileLangSelect.addEventListener("change", (e) => {
      handleLanguageChange(e.target.value);
    });
  }

  // --- Logout ------------------------------------------------------
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      try {
        window.localStorage.removeItem(SUPERADMIN_TOKEN_KEY);
      } catch {
        // ignore
      }
      window.location.href = "login.html"; // kannst du anpassen
    });
  }

  // --- Suche (Desktop + Mobile) -----------------------------------
  if (restaurantSearch) {
    restaurantSearch.addEventListener("input", () => {
      restaurantSearchTerm = restaurantSearch.value.trim().toLowerCase();
      renderRestaurantsTable();
    });
  }

  // Topbar-Suche spiegelt Restaurant-Suche
  if (topSearch && restaurantSearch) {
    topSearch.addEventListener("input", () => {
      restaurantSearch.value = topSearch.value;
      restaurantSearch.dispatchEvent(new Event("input"));
    });
  }

  // Mobile-Suche spiegelt Topbar & Restaurant-Suche
  if (mobileTopSearch && restaurantSearch) {
    mobileTopSearch.addEventListener("input", () => {
      const val = mobileTopSearch.value;
      if (topSearch) topSearch.value = val;
      restaurantSearch.value = val;
      restaurantSearch.dispatchEvent(new Event("input"));
    });
  }

  // --- Status-Filter ----------------------------------------------
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      restaurantStatusFilter = statusFilter.value;
      renderRestaurantsTable();
    });
  }

  // --- Typ-Filter --------------------------------------------------
  const typeFilter = document.getElementById("typeFilter");
  if (typeFilter) {
    typeFilter.addEventListener("change", () => {
      customerTypeFilter = typeFilter.value;
      renderRestaurantsTable();
    });
  }

  // --- Buttons: Neues Restaurant ----------------------------------
  const newRestaurantButtons = document.querySelectorAll(
    '[data-i18n-key="btn.newRestaurant"]'
  );
  newRestaurantButtons.forEach((btn) => {
    btn.addEventListener("click", () => openRestaurantForm(null));
  });

  // --- CSV Export --------------------------------------------------
  const csvExportButton = document.querySelector(
    '[data-i18n-key="btn.csvExport"]'
  );
  if (csvExportButton) {
    csvExportButton.addEventListener("click", handleCsvExport);
  }

  // --- Restaurant-Formular Events ---------------------------------
  const restaurantForm = document.getElementById("restaurantForm");
  const restaurantFormClose = document.getElementById("restaurantFormClose");
  const restaurantFormCancel = document.getElementById("restaurantFormCancel");
  const restaurantOverlay = document.getElementById("restaurantFormOverlay");

  if (restaurantForm) {
    restaurantForm.addEventListener("submit", saveRestaurantFromForm);
  }
  if (restaurantFormClose) {
    restaurantFormClose.addEventListener("click", closeRestaurantForm);
  }
  if (restaurantFormCancel) {
    restaurantFormCancel.addEventListener("click", closeRestaurantForm);
  }
  if (restaurantOverlay) {
    restaurantOverlay.addEventListener("click", (e) => {
      if (e.target === restaurantOverlay) {
        closeRestaurantForm();
      }
    });
  }

  // --- Lead-Formular Events ---------------------------------------
  const addLeadBtn = document.getElementById("addLeadBtn");
  if (addLeadBtn) {
    addLeadBtn.addEventListener("click", () => openLeadForm(null));
  }

  const leadForm = document.getElementById("leadForm");
  const leadFormClose = document.getElementById("leadFormClose");
  const leadFormCancel = document.getElementById("leadFormCancel");
  const leadOverlay = document.getElementById("leadFormOverlay");

  if (leadForm) {
    leadForm.addEventListener("submit", saveLeadFromForm);
  }
  if (leadFormClose) {
    leadFormClose.addEventListener("click", closeLeadForm);
  }
  if (leadFormCancel) {
    leadFormCancel.addEventListener("click", closeLeadForm);
  }
  if (leadOverlay) {
    leadOverlay.addEventListener("click", (e) => {
      if (e.target === leadOverlay) {
        closeLeadForm();
      }
    });
  }

  // --- Superadmin-Formular Events --------------------------------
  const addSuperadminBtn = document.getElementById("addSuperadminBtn");
  if (addSuperadminBtn) {
    if (isCeo) {
      addSuperadminBtn.addEventListener("click", () => openSuperadminForm(null));
    } else {
      // Button für normale Superadmins deaktivieren
      addSuperadminBtn.disabled = true;
      addSuperadminBtn.classList.add("is-disabled");
      addSuperadminBtn.title = "Nur der CEO kann neue Superadmins anlegen.";
    }
  }

  const superadminForm = document.getElementById("superadminForm");
  const superadminFormClose = document.getElementById("superadminFormClose");
  const superadminFormCancel = document.getElementById("superadminFormCancel");
  const superadminOverlay = document.getElementById("superadminFormOverlay");

  if (superadminForm) {
    superadminForm.addEventListener("submit", saveSuperadminFromForm);
  }
  if (superadminFormClose) {
    superadminFormClose.addEventListener("click", closeSuperadminForm);
  }
  if (superadminFormCancel) {
    superadminFormCancel.addEventListener("click", closeSuperadminForm);
  }
  if (superadminOverlay) {
    superadminOverlay.addEventListener("click", (e) => {
      if (e.target === superadminOverlay) {
        closeSuperadminForm();
      }
    });
  }

  // Settings-Card "Superadmins & Länder" für Nicht-CEO ausblenden


  // --- Abrechnungsmodell: Preis-Feld ein-/ausblenden --------------
  const billingModelSelect = document.getElementById("billingModel");
  const priceGroup = document.getElementById("priceGroup");

  if (billingModelSelect && priceGroup) {
    const updatePriceVisibility = () => {
      if (
        billingModelSelect.value === "yearly" ||
        billingModelSelect.value === "monthly"
      ) {
        priceGroup.style.display = "";
      } else {
        priceGroup.style.display = "none";
      }
    };

    billingModelSelect.addEventListener("change", updatePriceVisibility);
    updatePriceVisibility();
  }

  // --- Firestore-Daten laden --------------------------------------
  subscribeRestaurants();
  subscribeSuperadmins();
  subscribeLeads();
  subscribeOffers();         // Offers laden
  subscribeOrdersToday();
  subscribeUsers();
  subscribeLogs();           // System-Logs laden

  // Initial Karten/Tabellen updaten
  updateOrdersCardUI();
  updateUsersCardUI();
  updateLeadsCardUI();
  renderLeadsSummary();
  renderLeadsTable();
  renderOffersTable();
  renderLogsTable();
});

// 💠 ABSCHNITT 11 – DOMContentLoaded & UI-Wiring (ENDE) ---------------------




























































// 💠 ABSCHNITT 12 – Offers-View (Gruppierung nach Restaurant) (ANFANG) -----

// Einzelnes Offer aus Firestore-Dokument mappen
function mapOfferDoc(docSnap) {
  const data = docSnap.data() || {};
  const id = docSnap.id;

  const parent = docSnap.ref && docSnap.ref.parent && docSnap.ref.parent.parent;
  const restaurantId = data.restaurantId || (parent ? parent.id : null);

  const title = data.title || data.name || data.headline || "Unbenanntes Angebot";

  const activeRaw = data.active ?? data.isActive ?? data.enabled;
  const active = typeof activeRaw === "boolean" ? activeRaw : true;

  const priceRaw = data.price ?? data.priceEuro ?? data.price_eur ?? null;
  const price = priceRaw != null && priceRaw !== "" ? Number(priceRaw) : 0;

  const from = data.from || data.startDate || data.start || null;
  const to = data.to || data.endDate || data.end || null;

  const createdAt = data.createdAt || data.created_at || data.timestamp || null;
  const updatedAt = data.updatedAt || data.updated_at || null;

  return {
    id,
    restaurantId,
    title,
    active,
    price,
    from,
    to,
    createdAt,
    updatedAt,
    raw: data
  };
}

// Offers nach Restaurant gruppieren (im Sichtbereich des aktuellen Superadmins)
function groupOffersByRestaurant() {
  const groupsById = {};

  const scopedRestaurants = getScopedRestaurants();
  const allowedIds = new Set(scopedRestaurants.map((r) => r.id));

  offers.forEach((offer) => {
    if (!offer.restaurantId) return;
    if (allowedIds.size && !allowedIds.has(offer.restaurantId)) return;

    if (!groupsById[offer.restaurantId]) {
      const restaurant =
        scopedRestaurants.find((r) => r.id === offer.restaurantId) || null;
      groupsById[offer.restaurantId] = {
        restaurantId: offer.restaurantId,
        restaurantName: restaurant?.name || offer.restaurantId,
        city: restaurant?.city || "",
        country: restaurant?.country || "",
        customerType: restaurant?.customerType || "restaurant",
        offers: []
      };
    }

    groupsById[offer.restaurantId].offers.push(offer);
  });

  return Object.values(groupsById).sort((a, b) =>
    a.restaurantName.localeCompare(b.restaurantName, "de", { sensitivity: "base" })
  );
}

// Tabelle in der Offers-View zeichnen (eine Zeile pro Kunde)
function renderOffersTable() {
  const body = document.getElementById("offersTableBody");
  const meta = document.getElementById("offersMeta");
  const pageInfo = document.getElementById("offersPageInfo");
  if (!body) return;

  body.innerHTML = "";

  const groups = groupOffersByRestaurant();

  const lang = getCurrentLang();
  const dict = translations[lang] || translations.de;

  if (!groups.length) {
    if (meta) {
      meta.textContent = "Noch keine Angebote erfasst.";
    }
    if (pageInfo) {
      pageInfo.textContent = "Seite 1 von 1";
    }
    return;
  }

  groups.forEach((group) => {
    const totalCount = group.offers.length;
    const activeCount = group.offers.filter((o) => o.active).length;

    const statusKey = activeCount > 0 ? "status.active" : "status.paused";
    const statusLabel = dict[statusKey] || (activeCount > 0 ? "Aktiv" : "Inaktiv");
    const statusClass = activeCount > 0 ? "m-status-badge--active" : "m-status-badge--paused";

    // Letztes Angebot (nach updatedAt/createdAt)
    let lastTitle = "";
    let lastDateText = "";
    let lastTsMillis = 0;

    group.offers.forEach((o) => {
      const ts = o.updatedAt || o.createdAt;
      let millis = 0;
      if (ts && typeof ts.toMillis === "function") {
        millis = ts.toMillis();
      } else if (ts instanceof Date) {
        millis = ts.getTime();
      }
      if (millis >= lastTsMillis) {
        lastTsMillis = millis;
        lastTitle = o.title || "";
        if (millis) {
          const d = new Date(millis);
          lastDateText = d.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
          });
        }
      }
    });

    const row = document.createElement("div");
    row.className = "m-table-row js-offers-group-row";
    row.setAttribute("data-restaurant-id", group.restaurantId);

    const locationText = group.city
      ? group.country
        ? `${group.city} · ${group.country}`
        : group.city
      : group.country || "";

    row.innerHTML = `
      <div>
        <div class="m-table-main">${group.restaurantName}</div>
        <div class="m-table-sub">${locationText || "-"}</div>
      </div>
      <div>
        <div class="m-table-main">${totalCount} Angebot(e)</div>
        <div class="m-table-sub">${activeCount} aktiv</div>
      </div>
      <div>
        <div class="m-table-main">${lastTitle || "-"}</div>
        <div class="m-table-sub">${
          lastDateText ? "zuletzt am " + lastDateText : ""
        }</div>
      </div>
      <div>
        <span class="m-status-badge ${statusClass}">${statusLabel}</span>
      </div>
      <div class="m-table-actions">
        <button class="m-icon-btn js-offers-toggle" type="button" title="Angebote anzeigen">
          👁
        </button>
      </div>
    `;

    body.appendChild(row);

    // Detailzeile direkt danach
    const detailRow = document.createElement("div");
    detailRow.className = "m-table-row m-table-row--group-detail is-hidden";
    detailRow.setAttribute("data-offers-for", group.restaurantId);

    const offersListHtml = group.offers
      .map((o) => {
        const priceText =
          typeof o.price === "number" && !Number.isNaN(o.price) && o.price > 0
            ? `${o.price.toFixed(2)} €`
            : "";
        const badge =
          o.active
            ? `<span class="m-status-badge m-status-badge--active">${
                dict["status.active"] || "Aktiv"
              }</span>`
            : `<span class="m-status-badge m-status-badge--paused">${
                dict["status.paused"] || "Inaktiv"
              }</span>`;

        let dateText = "";
        const ts = o.updatedAt || o.createdAt;
        if (ts && typeof ts.toDate === "function") {
          const d = ts.toDate();
          dateText = d.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
          });
        }

        const parts = [];
        if (priceText) parts.push(priceText);
        if (dateText) parts.push(dateText);

        return `
          <div class="m-system-row">
            <span>${o.title}</span>
            <span class="m-system-status">
              ${
                parts.length
                  ? `<span>${parts.join(" · ")}</span><span>·</span>`
                  : ""
              }
              ${badge}
            </span>
          </div>
        `;
      })
      .join("");

    detailRow.innerHTML = `
      <div class="m-table-group-detail">
        <div class="m-table-group-detail-header">
          <strong>${group.restaurantName}</strong> – ${totalCount} Angebot(e)
        </div>
        <div class="m-table-group-detail-list">
          ${offersListHtml || '<p class="m-system-note">Noch keine Angebote.</p>'}
        </div>
      </div>
    `;

    body.appendChild(detailRow);
  });

  if (meta) {
    meta.textContent = `${groups.length} Kunden mit Angeboten`;
  }
  if (pageInfo) {
    pageInfo.textContent = "Seite 1 von 1";
  }

  attachOffersGroupHandlers();
}

// Klick-Handling für Gruppenzeilen (auf-/zuklappen)
function attachOffersGroupHandlers() {
  const body = document.getElementById("offersTableBody");
  if (!body) return;

  body.querySelectorAll(".js-offers-toggle").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const row = btn.closest(".js-offers-group-row");
      if (!row) return;
      const rid = row.getAttribute("data-restaurant-id");
      toggleOfferDetailsRow(rid);
    });
  });

  body.querySelectorAll(".js-offers-group-row").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest(".m-table-actions")) return;
      const rid = row.getAttribute("data-restaurant-id");
      toggleOfferDetailsRow(rid);
    });
  });
}

function toggleOfferDetailsRow(restaurantId) {
  if (!restaurantId) return;
  const body = document.getElementById("offersTableBody");
  if (!body) return;
  const detail = body.querySelector(
    `.m-table-row--group-detail[data-offers-for="${restaurantId}"]`
  );
  if (!detail) return;
  detail.classList.toggle("is-hidden");
}

// 💠 ABSCHNITT 12 – Offers-View (Gruppierung nach Restaurant) (ENDE) -------















































































// 💠 ABSCHNITT 13 – Users-View (Tabelle & Helpers) (ANFANG) -----------------

function formatUserDate(ts) {
  if (!ts) return "";
  let d = ts;
  if (typeof ts.toDate === "function") {
    d = ts.toDate();
  }
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });
}

function renderUsersTable() {
  const body = document.getElementById("usersTableBody");
  const meta = document.getElementById("usersMeta");
  const pageInfo = document.getElementById("usersPageInfo");

  if (!body) return;

  body.innerHTML = "";

  const lang = getCurrentLang();
  const dict = translations[lang] || translations.de;

  const isOwner =
    typeof isCurrentSuperadminOwner === "function" &&
    isCurrentSuperadminOwner();

  // Welche Restaurants liegen im Sichtbereich des aktuellen Superadmins?
  const scoped = getScopedRestaurants();
  const allowedIds = new Set(scoped.map((r) => r.id));

  // Basis-User abhängig von Rolle:
  //   Owner: alle User
  //   Country-Admin: nur User, die einem Restaurant im eigenen Land zugeordnet sind
  const baseUsers = users.filter((u) => {
    if (isOwner) return true;
    if (!u.restaurantId) return false;
    return allowedIds.has(u.restaurantId);
  });

  // Alphabetisch nach Name
  const sorted = [...baseUsers].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", "de", { sensitivity: "base" })
  );

  sorted.forEach((u) => {
    const row = document.createElement("div");
    row.className = "m-table-row";

    // Zugehöriger Kunde (falls vorhanden)
    let restaurantName = "-";
    let restaurantSub = "";

    if (u.restaurantId) {
      const r = restaurants.find((x) => x.id === u.restaurantId);
      restaurantName = r?.name || u.restaurantId;
      restaurantSub = r ? `#${r.id}` : `#${u.restaurantId}`;
    }

    const created = formatUserDate(u.createdAt);
    const lastActive = formatUserDate(u.lastActiveAt);

    // Status-Label & Badge
    let statusKey = "status.active";
    if (!u.isActive) statusKey = "status.paused";
    if (u.status === "blocked" || u.status === "gesperrt") {
      statusKey = "status.cancelled";
    }

    const statusLabel =
      dict[statusKey] ||
      u.status ||
      (u.isActive ? "Aktiv" : "Inaktiv");

    let statusClass = "m-status-badge--paused";
    if (u.isActive) statusClass = "m-status-badge--active";

    const usernameText = u.username
      ? "@" + u.username.replace(/^@/, "")
      : "";

    row.innerHTML = `
      <div>
        <div class="m-table-main">${u.name}</div>
        <div class="m-table-sub">${
          usernameText || "ID: " + u.id
        }</div>
      </div>
      <div>
        <div class="m-table-main">${u.email || "-"}</div>
        <div class="m-table-sub">${u.phone || ""}</div>
      </div>
      <div>
        <div class="m-table-main">${restaurantName}</div>
        <div class="m-table-sub">${restaurantSub}</div>
      </div>
      <div>
        <div class="m-table-main">${
          lastActive || created || "-"
        }</div>
        <div class="m-table-sub">${
          lastActive && created && lastActive !== created
            ? "Seit " + created
            : created || ""
        }</div>
      </div>
      <div>
        <span class="m-status-badge ${statusClass}">${statusLabel}</span>
      </div>
      <div class="m-table-actions">
        <!-- Platzhalter: später z.B. Impersonation / Sperren -->
        <button class="m-icon-btn" type="button" title="Details (später)">
          👁
        </button>
      </div>
    `;

    body.appendChild(row);
  });

  if (meta) {
    meta.textContent = `${sorted.length} Benutzer · sortiert nach Name`;
  }
  if (pageInfo) {
    pageInfo.textContent = "Seite 1 von 1";
  }
}

// 💠 ABSCHNITT 13 – Users-View (Tabelle & Helpers) (ENDE) -------------------































































// 💠 ABSCHNITT 14 – Logs-View (Mapping & Tabelle & Subscription) (ANFANG) ---

// Einzelnes Log-Dokument aus Firestore robust mappen
function mapLogDoc(docSnap) {
  const data = docSnap.data() || {};
  const id = docSnap.id;

  const level =
    (data.level ||
      data.severity ||
      data.type ||
      "info")
      .toString()
      .toLowerCase();

  const message =
    data.message ||
    data.msg ||
    data.error ||
    data.description ||
    "";

  const source =
    data.source ||
    data.context ||
    data.scope ||
    data.origin ||
    "";

  const code =
    data.code ||
    data.errorCode ||
    data.statusCode ||
    "";

  const createdAt =
    data.createdAt ||
    data.timestamp ||
    data.time ||
    null;

  return {
    id,
    level,
    message,
    source,
    code,
    createdAt,
    raw: data
  };
}

function formatLogDateTime(ts) {
  if (!ts) return "";
  let d = ts;
  if (typeof ts.toDate === "function") {
    d = ts.toDate();
  }
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderLogsTable() {
  const body = document.getElementById("logsTableBody");
  const meta = document.getElementById("logsMeta");
  const pageInfo = document.getElementById("logsPageInfo");

  if (!body) return;

  body.innerHTML = "";

  if (!Array.isArray(systemLogs)) {
    systemLogs = [];
  }

  // Neueste zuerst nach createdAt sortieren
  const sorted = [...systemLogs].sort((a, b) => {
    const getMillis = (log) => {
      const ts = log.createdAt;
      if (ts && typeof ts.toMillis === "function") return ts.toMillis();
      if (ts instanceof Date) return ts.getTime();
      return 0;
    };
    return getMillis(b) - getMillis(a);
  });

  sorted.forEach((log) => {
    const row = document.createElement("div");
    row.className = "m-table-row";

    const timeLabel = formatLogDateTime(log.createdAt);

    let levelLabel = log.level || "info";
    let levelClass = "m-status-badge--paused";
    if (levelLabel === "error") levelClass = "m-status-badge--cancelled";
    if (levelLabel === "warn" || levelLabel === "warning") levelClass = "m-status-badge--trial";
    if (levelLabel === "info") levelClass = "m-status-badge--active";

    const sourceText = log.source || (log.code ? `Code: ${log.code}` : "");

    const msgShort =
      (log.message || "").length > 140
        ? log.message.slice(0, 137) + "…"
        : log.message || "";

    row.innerHTML = `
      <div>
        <div class="m-table-main">${timeLabel || "-"}</div>
      </div>
      <div>
        <span class="m-status-badge ${levelClass}">
          ${levelLabel.toUpperCase()}
        </span>
      </div>
      <div>
        <div class="m-table-main">${sourceText || "-"}</div>
        <div class="m-table-sub">${log.code || ""}</div>
      </div>
      <div>
        <div class="m-table-main">${msgShort || "-"}</div>
      </div>
    `;

    body.appendChild(row);
  });

  if (meta) {
    meta.textContent = `${sorted.length} Einträge · sortiert nach Zeit (neueste zuerst)`;
  }
  if (pageInfo) {
    pageInfo.textContent = "Seite 1 von 1";
  }
}

// Firestore-Subscription für Collection "logs"
function subscribeLogs() {
  try {
    const logsRef = collection(db, "logs");
    onSnapshot(
      logsRef,
      (snapshot) => {
        systemLogs = snapshot.docs.map(mapLogDoc);
        renderLogsTable();
        console.log("System-Logs geladen:", systemLogs.length);
      },
      (err) => {
        console.error("Fehler beim Laden der System-Logs:", err);
      }
    );
    console.log("MENYRA Superadmin – Firestore verbunden (logs).");
  } catch (e) {
    console.error("Firestore-Verbindung (logs) fehlgeschlagen:", e);
  }
}

// 💠 ABSCHNITT 14 – Logs-View (Mapping & Tabelle & Subscription) (ENDE) -----


















































// 💠 ABSCHNITT 15 – Offer-Formular (UI & Speichern) (ANFANG) ---------------

function buildOfferRestaurantSelectOptions(selectedRestaurantId) {
  const select = document.getElementById("offerRestaurantSelect");
  if (!select) return;

  select.innerHTML = "";

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "Bitte Kunden wählen";
  select.appendChild(defaultOpt);

  // 🔹 Nur Kunden im Sichtbereich des aktuellen Superadmins
  //    Owner/CEO: alle Kunden
  //    Country-Admin: nur Kunden seines Landes
  const base =
    typeof getScopedRestaurants === "function"
      ? getScopedRestaurants()
      : restaurants || [];

  if (!base || !base.length) {
    defaultOpt.textContent = "Noch keine Kunden angelegt";
    return;
  }

  const sorted = [...base].sort((a, b) =>
    a.name.localeCompare(b.name, "de", { sensitivity: "base" })
  );

  let foundSelected = false;

  sorted.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.id;
    const locationText = r.city
      ? r.country
        ? `${r.city} · ${r.country}`
        : r.city
      : r.country || "";
    opt.textContent = locationText ? `${r.name} (${locationText})` : r.name;
    if (selectedRestaurantId && selectedRestaurantId === r.id) {
      opt.selected = true;
      foundSelected = true;
    }
    select.appendChild(opt);
  });

  // Falls aus irgendeinem Grund ein Offer zu einem Restaurant gehört,
  // das nicht im Sichtbereich liegt, bleibt selectedRestaurantId im
  // versteckten Feld – das Dropdown zeigt dann "Bitte Kunden wählen".
  // (Normalerweise kommt dieser Fall aber nicht vor, weil Offers
  //  in der View bereits über getScopedRestaurants gefiltert sind.)
}

function openOfferForm(offer) {
  const overlay = document.getElementById("offerFormOverlay");
  const titleEl = document.getElementById("offerFormTitle");

  const idInput = document.getElementById("offerId");
  const restIdHidden = document.getElementById("offerRestaurantId");
  const restSelect = document.getElementById("offerRestaurantSelect");
  const titleInput = document.getElementById("offerTitle");
  const priceInput = document.getElementById("offerPrice");
  const activeInput = document.getElementById("offerActive");
  const fromInput = document.getElementById("offerFrom");
  const toInput = document.getElementById("offerTo");

  if (!overlay || !titleEl || !idInput || !restSelect || !titleInput) return;

  function toInputDateValue(value) {
    if (!value) return "";
    let d = value;
    if (typeof value.toDate === "function") {
      d = value.toDate();
    } else if (typeof value === "string") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        d = parsed;
      }
    }
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  if (offer) {
    // Bearbeiten
    titleEl.textContent = "Angebot bearbeiten";
    idInput.value = offer.id;
    const rid = offer.restaurantId || "";
    if (restIdHidden) restIdHidden.value = rid;

    // 🔹 Dropdown mit Sichtbereich + vorausgewähltem Kunden
    buildOfferRestaurantSelectOptions(rid);

    titleInput.value = offer.title || "";
    if (priceInput) {
      priceInput.value =
        typeof offer.price === "number" && !Number.isNaN(offer.price)
          ? offer.price
          : "";
    }
    if (activeInput) {
      activeInput.checked = !!offer.active;
    }
    if (fromInput) {
      fromInput.value = toInputDateValue(offer.from);
    }
    if (toInput) {
      toInput.value = toInputDateValue(offer.to);
    }
  } else {
    // Neues Angebot
    titleEl.textContent = "Neues Angebot";
    idInput.value = "";
    if (restIdHidden) restIdHidden.value = "";

    // 🔹 Dropdown nur mit Kunden im Sichtbereich
    buildOfferRestaurantSelectOptions(null);

    titleInput.value = "";
    if (priceInput) priceInput.value = "";
    if (activeInput) activeInput.checked = true;
    if (fromInput) fromInput.value = "";
    if (toInput) toInput.value = "";
  }

  overlay.classList.remove("is-hidden");
}

function closeOfferForm() {
  const overlay = document.getElementById("offerFormOverlay");
  const form = document.getElementById("offerForm");
  const idInput = document.getElementById("offerId");
  const restIdHidden = document.getElementById("offerRestaurantId");
  if (!overlay || !form) return;
  overlay.classList.add("is-hidden");
  form.reset();
  if (idInput) idInput.value = "";
  if (restIdHidden) restIdHidden.value = "";
}

async function saveOfferFromForm(e) {
  e.preventDefault();

  const idInput = document.getElementById("offerId");
  const restIdHidden = document.getElementById("offerRestaurantId");
  const restSelect = document.getElementById("offerRestaurantSelect");
  const titleInput = document.getElementById("offerTitle");
  const priceInput = document.getElementById("offerPrice");
  const activeInput = document.getElementById("offerActive");
  const fromInput = document.getElementById("offerFrom");
  const toInput = document.getElementById("offerTo");

  if (!restSelect || !titleInput) return;

  const id = idInput?.value || null;

  let restaurantId = (restIdHidden?.value || "").trim();
  if (!restaurantId) {
    restaurantId = (restSelect.value || "").trim();
  }

  const title = (titleInput.value || "").trim();
  const priceRaw = (priceInput?.value || "").toString().replace(",", ".");
  const active = !!(activeInput && activeInput.checked);
  const fromRaw = fromInput?.value || "";
  const toRaw = toInput?.value || "";

  if (!restaurantId) {
    alert("Bitte einen Kunden für das Angebot auswählen.");
    return;
  }

  if (!title) {
    alert("Bitte einen Titel für das Angebot eingeben.");
    return;
  }

  let price = 0;
  if (priceRaw) {
    const n = Number(priceRaw);
    if (Number.isNaN(n)) {
      alert("Bitte einen gültigen Preis eingeben oder das Feld leer lassen.");
      return;
    }
    price = n;
  }

  const from = fromRaw || null;
  const to = toRaw || null;

  try {
    const payload = {
      restaurantId,
      title,
      price,
      active,
      from,
      to,
      updatedAt: serverTimestamp()
    };

    if (id) {
      const ref = doc(db, "restaurants", restaurantId, "offers", id);
      await updateDoc(ref, payload);
    } else {
      const colRef = collection(db, "restaurants", restaurantId, "offers");
      await addDoc(colRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
    }

    closeOfferForm();
  } catch (err) {
    console.error("Fehler beim Speichern des Angebots:", err);
    alert("Fehler beim Speichern des Angebots. Siehe Konsole.");
  }
}

// 💠 ABSCHNITT 15 – Offer-Formular (UI & Speichern) (ENDE) ------------------
