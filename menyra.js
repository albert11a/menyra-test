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
let restaurantSearchTerm = "";

let superadmins = [];

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

  // Status
  let status = (data.status || "active").toString().toLowerCase().trim();
  if (status === "aktiv") status = "active"; // falls du irgendwo "aktiv" gespeichert hast

  // >>> PREIS-MAPPING – versucht alle typischen Varianten abzufangen <<<

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

  // Falls nur "price" existiert:
  if (rawYear == null && rawMonth == null && data.price != null) {
    if (Number(data.price) > 1000) {
      // z.B. 4440 → eher Jahrespreis
      rawYear = data.price;
    } else {
      // z.B. 370 → eher Monatspreis
      rawMonth = data.price;
    }
  }

  // In Zahlen umwandeln
  let priceYear = 0;
  let priceMonth = 0;

  if (rawYear != null && rawYear !== "") {
    priceYear = Number(rawYear);
  }
  if (rawMonth != null && rawMonth !== "") {
    priceMonth = Number(rawMonth);
  }

  // Fallbacks, falls nur eins der beiden gesetzt ist
  if (!priceYear && priceMonth) {
    priceYear = priceMonth * 12;
  }
  if (!priceMonth && priceYear) {
    priceMonth = priceYear / 12;
  }

  // Letzter Fallback: wenn wirklich gar nichts da ist → 0 €
  if (!priceYear) priceYear = 0;
  if (!priceMonth) priceMonth = 0;

  // Ausgaben pro Jahr für diesen Kunden (frei eintragbar)
  const expensesYear = Number(data.expensesYear || 0);

  const planName = data.planName || data.plan || "Standard";

  // Wenn du debuggen willst, kannst du das kurz aktivieren:
  // console.log("Restaurant mapped:", { id, name, status, priceYear, priceMonth, raw: data });

  return {
    id,
    name,
    ownerName,
    ownerPhone,
    city,
    country,
    status,
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

// --- Finanz-Berechnungen -------------------------------------------

// „Steuerprofil“ – später aus Firestore, vorerst fix
const TAX_RATE = 10;    // 10 % Steuer
const OTHER_RATE = 5;   // 5 % sonstige Abgaben
const TRAVEL_YEAR = 0;  // Reisekosten/Jahr – kannst du später dynamisch machen

function computeFinanceTotals() {
  // Nur aktive Kunden für Umsatz
  const active = restaurants.filter((r) => r.status === "active");
  const activeCount = active.length;
  const totalCount = restaurants.length;

  // Jahresumsatz = Summe aller Jahrespreise der aktiven Kunden
  const revenueYear = active.reduce((sum, r) => {
    const v = Number(r.priceYear || 0);
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  // Monatlich & täglich daraus ableiten
  const revenueMonth = revenueYear / 12;
  const revenueDay = revenueYear / 365;

  // Jahresausgaben (manuell gepflegt pro Kunde)
  const expensesYear = active.reduce((sum, r) => {
    const v = Number(r.expensesYear || 0);
    return sum + (Number.isNaN(v) ? 0 : v);
  }, 0);

  const grossProfit = revenueYear - expensesYear;

  const taxAmount = (grossProfit * TAX_RATE) / 100;
  const otherAmount = (grossProfit * OTHER_RATE) / 100;
  const netProfit = grossProfit - taxAmount - otherAmount - TRAVEL_YEAR;

  // Debug, falls du mal checken willst:
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
  //   netProfit
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
    netProfit
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
    elActiveHint.textContent =
      `Aktive Kunden: ${totals.activeCount} von ${totals.totalCount} gesamt. ` +
      `Jahresumsatz (brutto): ${totals.revenueYear.toFixed(0)} €`;
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

  // Abrechnungs-View Kurzfassung
  const billingSubtitle = document.querySelector(
    '.m-view[data-view="billing"] .m-section-subtitle'
  );
  if (billingSubtitle) {
    billingSubtitle.textContent =
      `Jahresumsatz aktiv: ${totals.revenueYear.toFixed(
        0
      )} € · Ausgaben: ${totals.expensesYear.toFixed(
        0
      )} € · Netto: ca. ${totals.netProfit.toFixed(0)} € / Jahr`;
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

// --- Restaurants-Tabelle rendern -----------------------------------

function renderRestaurantsTable() {
  const bodyContainer = document.getElementById("restaurantsTableBody");
  const meta = document.getElementById("restaurantsMeta");
  const pageInfo = document.getElementById("restaurantsPageInfo");
  if (!bodyContainer) return;

  bodyContainer.innerHTML = "";

  let filtered = [...restaurants];

  if (restaurantStatusFilter !== "all") {
    filtered = filtered.filter((r) => r.status === restaurantStatusFilter);
  }

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

  filtered.forEach((r) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.setAttribute("data-restaurant-row", "");
    row.setAttribute("data-status", r.status);
    row.setAttribute("data-id", r.id);

    const statusKey =
      r.status === "trial"
        ? "status.trial"
        : r.status === "paused"
        ? "status.paused"
        : "status.active";

    const statusLabel = dict[statusKey] || r.status;
    const planLabel = `${r.planName} · ${r.priceYear.toFixed(0)} €`;

    row.innerHTML = `
      <div>
        <div class="m-table-main">${r.name}</div>
        <div class="m-table-sub">#${r.id}</div>
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
  const nameInput = document.getElementById("restaurantName");
  const ownerNameInput = document.getElementById("restaurantOwnerName");
  const ownerPhoneInput = document.getElementById("restaurantOwnerPhone");
  const cityInput = document.getElementById("restaurantCity");
  const countryInput = document.getElementById("restaurantCountry");
  const planNameInput = document.getElementById("restaurantPlanName");
  const priceMonthInput = document.getElementById("restaurantPriceMonth");
  const statusSelect = document.getElementById("restaurantStatus");
  const expensesInput = document.getElementById("restaurantExpensesYear");

  if (!overlay) return;

  if (restaurant) {
    title.textContent = "Restaurant bearbeiten";
    idInput.value = restaurant.id;
    nameInput.value = restaurant.name || "";
    ownerNameInput.value = restaurant.ownerName || "";
    ownerPhoneInput.value = restaurant.ownerPhone || "";
    cityInput.value = restaurant.city || "";
    countryInput.value = restaurant.country || "";
    planNameInput.value = restaurant.planName || "Standard";
    priceMonthInput.value = restaurant.priceMonth || "";
    statusSelect.value = restaurant.status || "active";
    expensesInput.value = restaurant.expensesYear || 0;
  } else {
    title.textContent = "Neues Restaurant";
    idInput.value = "";
    nameInput.value = "";
    ownerNameInput.value = "";
    ownerPhoneInput.value = "";
    cityInput.value = "";
    countryInput.value = "";
    planNameInput.value = "Standard";
    priceMonthInput.value = "370";
    statusSelect.value = "active";
    expensesInput.value = "0";
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
  const nameInput = document.getElementById("restaurantName");
  const ownerNameInput = document.getElementById("restaurantOwnerName");
  const ownerPhoneInput = document.getElementById("restaurantOwnerPhone");
  const cityInput = document.getElementById("restaurantCity");
  const countryInput = document.getElementById("restaurantCountry");
  const planNameInput = document.getElementById("restaurantPlanName");
  const priceMonthInput = document.getElementById("restaurantPriceMonth");
  const statusSelect = document.getElementById("restaurantStatus");
  const expensesInput = document.getElementById("restaurantExpensesYear");

  const id = idInput.value || null;
  const name = nameInput.value.trim();
  const ownerName = ownerNameInput.value.trim();
  const ownerPhone = ownerPhoneInput.value.trim();
  const city = cityInput.value.trim();
  const country = countryInput.value.trim();
  const planName = planNameInput.value.trim() || "Standard";
  const priceMonth = Number(
    (priceMonthInput.value || "0").toString().replace(",", ".")
  );
  const status = (statusSelect.value || "active").toLowerCase();
  const expensesYear = Number(
    (expensesInput.value || "0").toString().replace(",", ".")
  );

  if (!name) {
    alert("Bitte einen Restaurant-Namen eingeben.");
    return;
  }
  if (!priceMonth || Number.isNaN(priceMonth)) {
    alert("Bitte einen gültigen Monatspreis eingeben.");
    return;
  }

  try {
    const payload = {
      name,
      ownerName,
      ownerPhone,
      city,
      country,
      planName,
      priceMonth,
      priceYear: priceMonth * 12,
      expensesYear: Number.isNaN(expensesYear) ? 0 : expensesYear,
      status
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
    console.error("Fehler beim Speichern des Restaurants:", err);
    alert("Fehler beim Speichern. Siehe Konsole.");
  }
}

function handleEditRestaurant(id) {
  const r = restaurants.find((x) => x.id === id);
  if (!r) {
    alert("Restaurant nicht gefunden.");
    return;
  }
  openRestaurantForm(r);
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

  // --- Firestore-Daten laden --------------------------------------
  subscribeRestaurants();
  subscribeSuperadmins();
  subscribeOrdersToday();
  subscribeUsers();

  // Initial Karten updaten
  updateOrdersCardUI();
  updateUsersCardUI();
});
