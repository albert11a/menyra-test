// menyra.js – Superadmin UI + Firebase + Sprachen + Finanzen + Superadmins + Dashboard-Stats

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

// Dashboard-Stats
let ordersTodayCount = 0;
let topRestaurantToday = null;

let usersTotalCount = 0;
let usersActiveCount = 0;


// --- Mapping: Restaurants ------------------------------------------


function mapRestaurantDoc(docSnap) {
  const data = docSnap.data() || {};
  const id = docSnap.id;

  const name = data.name || data.title || "Unbenannt";
  const ownerName = data.ownerName || data.owner || "";
  const ownerPhone = data.ownerPhone || data.phone || "";
  const city = data.city || "";
  const country = data.country || "";

  const customerType = data.customerType || "restaurant";
  const billingModel = data.billingModel || "yearly";

  let status = (data.status || "active").toString().toLowerCase().trim();
  if (status === "aktiv") status = "active";

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
    status,
    customerType,
    billingModel,
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
  return {
    id: docSnap.id,
    name: data.name || "Unbenannt",
    email: data.email || data.login || "",
    avatarUrl: data.avatarUrl || data.iconUrl || ""
  };
}


// --- Mapping: Leads ------------------------------------------

function mapLeadDoc(docSnap) {
  const data = docSnap.data() || {};
  const id = docSnap.id;

  const customerType = (data.customerType || data.type || "restaurant").toLowerCase();
  const businessName = data.businessName || data.name || "Unbenannt";
  const instagram = data.instagram || data.instagramHandle || "";
  const phone = data.phone || data.phoneNumber || "";
  const statusRaw = (data.status || "new").toLowerCase();
  const note = data.note || data.notes || "";

  const createdAt = data.createdAt || data.created_at || null;
  const updatedAt = data.updatedAt || data.updated_at || null;

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
    raw: data
  };
}


// --- Finanz-Berechnungen -------------------------------------------


// „Steuerprofil“ – später aus Firestore, vorerst fix
const TAX_RATE = 10;    // 10 % Steuer
const OTHER_RATE = 5;   // 5 % sonstige Abgaben
const TRAVEL_YEAR = 0;  // Reisekosten/Jahr – kannst du später dynamisch machen

function safeNumber(val) {
  const n = Number(val || 0);
  return Number.isNaN(n) ? 0 : n;
}

function computeFinanceTotals() {
  // Nur aktive Kunden für Umsatz
  const active = restaurants.filter((r) => r.status === "active");
  const activeCount = active.length;
  const totalCount = restaurants.length;

  // Jahresumsatz = Summe aller Jahrespreise der aktiven Kunden
  const revenueYear = active.reduce((sum, r) => {
    return sum + safeNumber(r.priceYear);
  }, 0);

  // Monatlich & täglich daraus ableiten
  const revenueMonth = revenueYear / 12;
  const revenueDay = revenueYear / 365;

  // Jahresausgaben (manuell gepflegt pro Kunde)
  const expensesYear = active.reduce((sum, r) => {
    return sum + safeNumber(r.expensesYear);
  }, 0);

  const grossProfit = revenueYear - expensesYear;

  const taxAmount = (grossProfit * TAX_RATE) / 100;
  const otherAmount = (grossProfit * OTHER_RATE) / 100;
  const netProfit = grossProfit - taxAmount - otherAmount - TRAVEL_YEAR;

  // Breakdown nach Kundentyp
  const typeKeys = ["cafe", "restaurant", "hotel", "ecommerce", "rentacar", "club"];
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

  // Debug bei Bedarf:
  // console.log("Finance totals:", {
  //   activeCount,
  //   totalCount,
  //   revenueYear,
  //   revenueMonth,
  //   revenueDay,
  //   expensesYear,
  //   grossProfit,
  //   taxAmount,
  //   otherAmount,
  //   netProfit,
  //   activeByType,
  //   revenueYearByType,
  //   mrrMonthly
  // });

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
    const ecommerce = byType.ecommerce || 0;
    const rentacar = byType.rentacar || 0;
    const clubs = byType.club || 0;
    const others = byType.other || 0;

    const gastro = cafes + restaurantsCount + clubs;

    const parts = [];
    if (gastro) parts.push(`Gastro: ${gastro}`);
    if (hotels) parts.push(`Hotels: ${hotels}`);
    if (ecommerce) parts.push(`E-Commerce: ${ecommerce}`);
    if (rentacar) parts.push(`Rent a Car: ${rentacar}`);
    if (others) parts.push(`Sonstige: ${others}`);

    const breakdown = parts.length ? ` · Verteilung: ${parts.join(" · ")}` : "";

    const mrrText =
      t.mrrMonthly && t.mrrMonthly > 0
        ? ` · Monatliche E-Commerce / Rent a Car Einnahmen: ${t.mrrMonthly.toFixed(2)} €`
        : "";

    elActiveHint.textContent =
      `Aktive Kunden: ${t.activeCount} von ${t.totalCount} gesamt. ` +
      `Jahresumsatz (brutto): ${t.revenueYear.toFixed(0)} €` +
      breakdown +
      mrrText;
  }

  // Jährlicher Umsatz (alle aktiven Kunden)
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

  // Abrechnungs-View Kurzfassung (Subtitle)
  const billingSubtitle = document.querySelector(
    '.m-view[data-view="billing"] .m-section-subtitle'
  );
  if (billingSubtitle) {
    const t = totals;
    const baseText =
      `Jahresumsatz aktiv: ${t.revenueYear.toFixed(0)} € · ` +
      `Ausgaben: ${t.expensesYear.toFixed(0)} € · ` +
      `Netto: ca. ${t.netProfit.toFixed(0)} € / Jahr`;

    const mrrText =
      t.mrrMonthly && t.mrrMonthly > 0
        ? ` · Monatliche E-Commerce / Rent a Car Einnahmen: ${t.mrrMonthly.toFixed(2)} €`
        : "";

    billingSubtitle.textContent = baseText + mrrText;
  }

  // Detail-Billing-View (Tab „Abrechnung“)
  renderBillingView(totals);
}


function renderBillingView(totals) {
  const yearEl = document.getElementById("billingYearRevenue");
  const expEl = document.getElementById("billingExpensesYear");
  const netEl = document.getElementById("billingNetProfit");
  const mrrEl = document.getElementById("billingMrrMonthly");
  const breakdownContainer = document.getElementById("billingTypeBreakdown");

  if (yearEl) yearEl.textContent = `${totals.revenueYear.toFixed(0)} €`;
  if (expEl) expEl.textContent = `${totals.expensesYear.toFixed(0)} €`;
  if (netEl) netEl.textContent = `${totals.netProfit.toFixed(0)} €`;
  if (mrrEl) mrrEl.textContent = `${totals.mrrMonthly.toFixed(2)} €`;

  if (!breakdownContainer) return;

  const byTypeActive = totals.activeByType || {};
  const byTypeRevenue = totals.revenueYearByType || {};

  const rows = [
    { key: "cafe", label: "Cafés" },
    { key: "restaurant", label: "Restaurants" },
    { key: "hotel", label: "Hotels" },
    { key: "ecommerce", label: "E-Commerce" },
    { key: "rentacar", label: "Rent a Car" },
    { key: "club", label: "Clubs / Nightlife" },
    { key: "other", label: "Sonstige" }
  ];

  breakdownContainer.innerHTML = "";

  rows.forEach((row) => {
    const count = byTypeActive[row.key] || 0;
    const rev = byTypeRevenue[row.key] || 0;

    // Nur anzeigen, wenn wirklich etwas da ist
    if (!count && !rev) return;

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

  if (!breakdownContainer.children.length) {
    const empty = document.createElement("p");
    empty.className = "m-system-note";
    empty.textContent = "Noch keine aktiven Kunden mit Umsatz.";
    breakdownContainer.appendChild(empty);
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


// --- Leads-UI (Dashboard + Zusammenfassung) ------------------------

function computeLeadStats() {
  const stats = {
    total: leads.length,
    new: 0,
    contacted: 0,
    waiting: 0,
    interested: 0,
    noInterest: 0,
    other: 0
  };

  leads.forEach((lead) => {
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
    `Leads gesamt: ${s.total}` +
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

  // nach Datum sortieren (neueste zuerst)
  const sorted = [...leads].sort((a, b) => {
    const getTime = (l) => {
      const ts = l.createdAt;
      if (ts && typeof ts.toMillis === "function") return ts.toMillis();
      if (ts instanceof Date) return ts.getTime();
      return 0;
    };
    return getTime(b) - getTime(a);
  });

  const typeLabelMap = {
    cafe: "Café",
    restaurant: "Restaurant",
    hotel: "Hotel",
    ecommerce: "E-Commerce",
    rentacar: "Rent a Car",
    club: "Club / Nightlife"
  };

  const typeIconMap = {
    cafe: "☕",
    restaurant: "🍽",
    hotel: "🏨",
    ecommerce: "🛒",
    rentacar: "🚗",
    club: "🎧"
  };

  const statusLabelMap = {
    new: "Offen",
    contacted: "Kontaktiert",
    waiting: "Warten",
    interested: "Interesse",
    "no_interest": "Kein Interesse",
    "no-interest": "Kein Interesse",
    "kein_interesse": "Kein Interesse"
  };

  sorted.forEach((lead) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.setAttribute("data-lead-id", lead.id);

    const typeKey = (lead.customerType || "restaurant").toLowerCase();
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
      ? (lead.instagram.startsWith("@") ? lead.instagram : "@" + lead.instagram)
      : "-";

    let statusClass = "m-status-badge--paused";
    if (sKey === "new") statusClass = "m-status-badge--trial";
    if (sKey === "contacted" || sKey === "waiting") statusClass = "m-status-badge--paused";
    if (sKey === "interested") statusClass = "m-status-badge--active";
    if (sKey === "no_interest" || sKey === "no-interest" || sKey === "kein_interesse") {
      statusClass = "m-status-badge--paused";
    }

    const shortNote =
      (lead.note || "").length > 80
        ? lead.note.slice(0, 77) + "…"
        : (lead.note || "");

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
    meta.textContent = `${sorted.length} Leads · sortiert nach Datum (neueste zuerst)`;
  }
  if (pageInfo) {
    pageInfo.textContent = "Seite 1 von 1";
  }

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

  // Kundentyp-Mapping:
  // cafe -> cafe
  // restaurant -> restaurant
  // hotel -> hotel
  // ecommerce -> ecommerce
  // rentacar -> ecommerce
  // club/nightlife -> cafe
  let sourceType = (lead.customerType || "restaurant").toLowerCase();
  let customerType = "restaurant";

  if (sourceType === "cafe") customerType = "cafe";
  else if (sourceType === "restaurant") customerType = "restaurant";
  else if (sourceType === "hotel") customerType = "hotel";
  else if (sourceType === "ecommerce") customerType = "ecommerce";
  else if (sourceType === "rentacar") customerType = "ecommerce";
  else if (sourceType === "club") customerType = "cafe";

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


// --- Restaurants-Tabelle rendern -----------------------------------



function renderRestaurantsTable() {
  const bodyContainer = document.getElementById("restaurantsTableBody");
  const meta = document.getElementById("restaurantsMeta");
  const pageInfo = document.getElementById("restaurantsPageInfo");
  if (!bodyContainer) return;

  bodyContainer.innerHTML = "";

  let filtered = [...restaurants];

  // Status-Filter
  if (restaurantStatusFilter !== "all") {
    filtered = filtered.filter((r) => r.status === restaurantStatusFilter);
  }

  // Typ-Filter (cafe, restaurant, hotel, ecommerce, rentacar, club)
  if (customerTypeFilter !== "all") {
    filtered = filtered.filter((r) => (r.customerType || "restaurant") === customerTypeFilter);
  }

  // Textsuche
  if (restaurantSearchTerm) {
    const t = restaurantSearchTerm.toLowerCase();
    filtered = filtered.filter((r) => {
      const combined =
        `${r.name} ${r.ownerName} ${r.city} ${r.country}`.toLowerCase();
      return combined.includes(t);
    });
  }

  filtered.sort((a, b) => a.name.localeCompare(b.name));

  const lang = getCurrentLang();
  const dict = translations[lang] || translations.de;

  // Hilfsfunktion für Typ-Icon & Label
  function getTypeConfig(customerType) {
    const type = customerType || "restaurant";
    const iconMap = {
      cafe: "☕",
      restaurant: "🍽",
      hotel: "🏨",
      ecommerce: "🛒",
      rentacar: "🚗",
      club: "🎧"
    };
    const icon = iconMap[type] || "🏪";
    const labelKey = "type." + type;
    const label = dict[labelKey] || type;
    return { icon, label };
  }

  filtered.forEach((r) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.setAttribute("data-restaurant-row", "");
    row.setAttribute("data-status", r.status);
    row.setAttribute("data-id", r.id);
    row.setAttribute("data-type", r.customerType || "restaurant");

    const statusKey =
      r.status === "trial"
        ? "status.trial"
        : r.status === "paused"
        ? "status.paused"
        : "status.active";

    const statusLabel = dict[statusKey] || r.status;

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
        <span class="m-status-badge ${
          r.status === "active"
            ? "m-status-badge--active"
            : r.status === "trial"
            ? "m-status-badge--trial"
            : "m-status-badge--paused"
        }">${statusLabel}</span>
      </div>
      <div class="m-table-actions">
        <button class="m-icon-btn js-restaurant-login" type="button" data-id="${
          r.id
        }" title="Superadmin Login">
          🔑
        </button>
        <button class="m-icon-btn js-restaurant-edit" type="button" data-id="${
          r.id
        }" title="Bearbeiten">
          ✏️
        </button>
        <button class="m-icon-btn js-restaurant-qr" type="button" data-id="${
          r.id
        }" title="QR-Links">
          🔗
        </button>
      </div>
    `;

    bodyContainer.appendChild(row);
  });

  if (meta) {
    const langDict = translations[getCurrentLang()] || translations.de;
    const template = langDict["table.meta"] || "0 Einträge · sortiert nach Name";
    meta.textContent = template.replace(/^0/, String(filtered.length));
  }

  if (pageInfo) {
    const langDict = translations[getCurrentLang()] || translations.de;
    pageInfo.textContent =
      langDict["table.footer.pageInfo"] || "Seite 1 von 1";
  }

  attachRestaurantActionHandlers();
}


// --- Superadmins rendern -------------------------------------------

function renderSuperadminsTable() {
  const body = document.getElementById("superadminsTableBody");
  if (!body) return;

  body.innerHTML = "";

  superadmins.forEach((s) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.setAttribute("data-superadmin-id", s.id);

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
      <div class="m-table-actions">
        <button class="m-icon-btn js-superadmin-edit" type="button" data-id="${
          s.id
        }" title="Bearbeiten">
          ✏️
        </button>
        <button class="m-icon-btn js-superadmin-delete" type="button" data-id="${
          s.id
        }" title="Löschen">
          🗑
        </button>
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

  body.querySelectorAll(".js-superadmin-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
      const s = superadmins.find((x) => x.id === id);
      if (s) openSuperadminForm(s);
    });
  });

  body.querySelectorAll(".js-superadmin-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (!id) return;
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
          typeof restaurant.priceMonth === "number" &&
          !Number.isNaN(restaurant.priceMonth)
            ? restaurant.priceMonth
            : "";
      } else {
        priceInput.value =
          typeof restaurant.priceYear === "number" &&
          !Number.isNaN(restaurant.priceYear)
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
    if (countryInput) countryInput.value = restaurant.country || "";
    if (planNameInput) planNameInput.value = restaurant.planName || "Standard";

    if (expensesInput) {
      expensesInput.value =
        typeof restaurant.expensesYear === "number" &&
        !Number.isNaN(restaurant.expensesYear)
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
    if (countryInput) countryInput.value = "";
    if (planNameInput) planNameInput.value = "Standard";
    if (expensesInput) expensesInput.value = "";

    if (advancedBlock) {
      // beim Erstellen: erweiterte Angaben erstmal verstecken
      advancedBlock.style.display = "none";
    }
  }

  overlay.classList.remove("is-hidden");
}

function closeRestaurantForm() {
  const overlay = document.getElementById("restaurantFormOverlay");
  const form = document.getElementById("restaurantForm");
  if (!overlay || !form) return;
  overlay.classList.add("is-hidden");
  form.reset();
  const idInput = document.getElementById("restaurantId");
  if (idInput) idInput.value = "";
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
  const country = (countryInput?.value || "").trim();
  const planName = (planNameInput?.value || "Standard").trim();

  const expensesYear = Number(
    (expensesInput?.value || "0").toString().replace(",", ".")
  );

  try {
    const payload = {
      customerType,        // "cafe" | "restaurant" | "hotel" | "ecommerce" | "rentacar" | "club"
      name,
      ownerName,
      ownerPhone,
      city,
      country,
      planName,
      billingModel,        // "yearly" | "monthly"
      priceMonth,
      priceYear,
      expensesYear: Number.isNaN(expensesYear) ? 0 : expensesYear,
      status              // "aufbauphase" | "demo" | "trial" | "active" | "paused"
    };

    if (id) {
      const ref = doc(db, "restaurants", id);
      await updateDoc(ref, payload);
    } else {
      await addDoc(collection(db, "restaurants"), {
        ...payload,
        createdAt: serverTimestamp()
      });
    }

    closeRestaurantForm();
  } catch (err) {
    console.error("Fehler beim Speichern des Kunden:", err);
    alert("Fehler beim Speichern. Siehe Konsole.");
  }
}

function handleEditRestaurant(id) {
  const r = restaurants.find((x) => x.id === id);
  if (!r) {
    alert("Kunde nicht gefunden.");
    return;
  }
  openRestaurantForm(r);
}

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
    if (instaInput) instaInput.value = "";
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
  const customerType = (typeSelect.value || "restaurant").toLowerCase();
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

  try {
    const payload = {
      customerType,
      businessName,
      instagram,
      phone,
      status,
      note,
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


// --- Superadmin-Formular (UI) --------------------------------------

function openSuperadminForm(superadmin) {
  const overlay = document.getElementById("superadminFormOverlay");
  const title = document.getElementById("superadminFormTitle");

  const idInput = document.getElementById("superadminId");
  const nameInput = document.getElementById("superadminName");
  const emailInput = document.getElementById("superadminEmail");
  const avatarInput = document.getElementById("superadminAvatarUrl");

  if (!overlay) return;

  if (superadmin) {
    title.textContent = "Superadmin bearbeiten";
    idInput.value = superadmin.id;
    nameInput.value = superadmin.name || "";
    emailInput.value = superadmin.email || "";
    avatarInput.value = superadmin.avatarUrl || "";
  } else {
    title.textContent = "Neuer Superadmin";
    idInput.value = "";
    nameInput.value = "";
    emailInput.value = "";
    avatarInput.value = "";
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

  const id = idInput.value || null;
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const avatarUrl = avatarInput.value.trim();

  if (!name) {
    alert("Bitte einen Namen eingeben.");
    return;
  }
  if (!email) {
    alert("Bitte eine Login/E-Mail eingeben.");
    return;
  }

  try {
    const payload = {
      name,
      email,
      avatarUrl
    };

    if (id) {
      const ref = doc(db, "superadmins", id);
      await updateDoc(ref, payload);
    } else {
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

// --- CSV Export ----------------------------------------------------

function handleCsvExport() {
  if (!restaurants.length) {
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
    "priceMonth",
    "priceYear",
    "expensesYear"
  ];

  const rows = restaurants.map((r) => [
    r.id,
    r.name,
    r.ownerName,
    r.ownerPhone,
    r.city,
    r.country,
    r.status,
    r.planName,
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

// --- Firestore-Subscription ----------------------------------------

function subscribeRestaurants() {
  try {
    const colRef = collection(db, "restaurants");
    onSnapshot(
      colRef,
      (snapshot) => {
        restaurants = snapshot.docs.map(mapRestaurantDoc);
        updateDashboardFromRestaurants();
        renderRestaurantsTable();
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

function subscribeSuperadmins() {
  try {
    const colRef = collection(db, "superadmins");
    onSnapshot(
      colRef,
      (snapshot) => {
        superadmins = snapshot.docs.map(mapSuperadminDoc);
        renderSuperadminsTable();
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
            perRestaurant[restaurantId] =
              (perRestaurant[restaurantId] || 0) + 1;
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
        usersTotalCount = snapshot.size;
        usersActiveCount = 0;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() || {};

          const status = (data.status || "").toLowerCase();
          const activeFlag = data.active;

          const isActive =
            activeFlag === true ||
            (!activeFlag && status !== "inactive" && status !== "blocked");

          if (isActive) usersActiveCount++;
        });

        updateUsersCardUI();
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

// --- UI / LOGIK ----------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // Sprache laden & anwenden
  loadSavedLang();
  applyTranslations();

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
  }

  function closeMobileMenu() {
    if (!mobileMenu || !mobileMenuOverlay) return;
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

    if (langSelect) langSelect.value = value;
    if (mobileLangSelect) mobileLangSelect.value = value;
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
        window.localStorage.removeItem("menyraSuperadminToken");
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

    // --- Typ-Filter (Café, Restaurant, Hotel, E-Commerce, Rent a Car, Club) ---
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

  // --- CSV Export (im Dashboard) ----------------------------------
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
    addSuperadminBtn.addEventListener("click", () => openSuperadminForm(null));
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
  subscribeOrdersToday();
  subscribeUsers();

  // Initial Karten updaten
  updateOrdersCardUI();
  updateUsersCardUI();
  updateLeadsCardUI();
  renderLeadsSummary();
  renderLeadsTable();
});


