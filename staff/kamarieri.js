// kamarieri.js – Kellner-Ansicht (MENYRA)
// Struktur-Regel: Wir arbeiten ab jetzt immer in GANZEN ABSCHNITTEN (START..END).

/* =========================================================
   ABSCHNITT 0 — IMPORTS
   ========================================================= */
// --- START: ABSCHNITT 0 — IMPORTS ---
import { db } from "../shared/firebase-config.js";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  startAfter,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
// --- END: ABSCHNITT 0 — IMPORTS ---

/* =========================================================
   ABSCHNITT 1 — DOM ELEMENTS
   ========================================================= */
// --- START: ABSCHNITT 1 — DOM ELEMENTS ---
const kRestLabel = document.getElementById("kRestLabel");
const waiterLoginCard = document.getElementById("waiterLoginCard");
const waiterCodeInput = document.getElementById("waiterCodeInput");
const waiterLoginBtn = document.getElementById("waiterLoginBtn");
const waiterLoginStatus = document.getElementById("waiterLoginStatus");
const orderCard = document.getElementById("orderCard");
const orderList = document.getElementById("orderList");
const statusFilterRow = document.getElementById("statusFilterRow");
const archiveLoadMoreBtn = document.getElementById("archiveLoadMoreBtn");
const archiveMeta = document.getElementById("archiveMeta");
// --- END: ABSCHNITT 1 — DOM ELEMENTS ---

/* =========================================================
   ABSCHNITT 2 — GLOBAL STATE
   ========================================================= */
// --- START: ABSCHNITT 2 — GLOBAL STATE ---
let currentRestaurantId = null;
let unsubOpenOrders = null;

let view = "open"; // "open" | "archive"
let openFilter = "open"; // "open" | "new" | "in_progress"

let openOrders = [];
let archiveOrders = [];
let archiveCursor = null;
let archiveDone = false;
let archiveLoading = false;
// --- END: ABSCHNITT 2 — GLOBAL STATE ---

/* =========================================================
   ABSCHNITT 3 — SESSION
   ========================================================= */
// --- START: ABSCHNITT 3 — SESSION ---
function saveWaiterSession(restaurantId) {
  localStorage.setItem("menyra_waiter_restaurantId", restaurantId);
}

function loadWaiterSession() {
  return localStorage.getItem("menyra_waiter_restaurantId");
}
// --- END: ABSCHNITT 3 — SESSION ---

/* =========================================================
   ABSCHNITT 4 — ABO / STATUS (Operational Check)
   ========================================================= */
// --- START: ABSCHNITT 4 — ABO / STATUS (Operational Check) ---
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSubscriptionValid(data) {
  if (!data.subscriptionUntil) return true;
  const today = todayISO();
  return data.subscriptionUntil >= today;
}

function isRestaurantOperational(data) {
  if (data.active === false) return false;
  if (!isSubscriptionValid(data)) return false;
  return true;
}
// --- END: ABSCHNITT 4 — ABO / STATUS (Operational Check) ---

/* =========================================================
   ABSCHNITT 5 — STATUS LABELS + FORMATTING
   ========================================================= */
// --- START: ABSCHNITT 5 — STATUS LABELS + FORMATTING ---
function mapStatusLabel(status) {
  if (status === "new") return "Neu";
  if (status === "in_progress") return "In Arbeit";
  if (status === "served") return "Serviert";
  return status || "";
}

function getStatusColors(status) {
  if (status === "new") return { bg: "#dbeafe", fg: "#1d4ed8" };
  if (status === "in_progress") return { bg: "#fef9c3", fg: "#a16207" };
  if (status === "served") return { bg: "#e5e7eb", fg: "#374151" };
  return { bg: "#e5e7eb", fg: "#374151" };
}

function formatCreatedAt(ts) {
  if (!ts || typeof ts.toDate !== "function") return "";
  const d = ts.toDate();
  const time = d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" });
  return `${date} ${time}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
// --- END: ABSCHNITT 5 — STATUS LABELS + FORMATTING ---

/* =========================================================
   ABSCHNITT 6 — LOGIN KELLNER
   ========================================================= */
// --- START: ABSCHNITT 6 — LOGIN KELLNER ---
async function loginWaiter(code) {
  if (!waiterLoginStatus) return;

  waiterLoginStatus.textContent = "";
  waiterLoginStatus.className = "status-text";

  if (!code) {
    waiterLoginStatus.textContent = "Bitte Kellner-Code eingeben.";
    waiterLoginStatus.classList.add("status-err");
    return;
  }

  try {
    if (waiterLoginBtn) {
      waiterLoginBtn.disabled = true;
      waiterLoginBtn.textContent = "Prüfe...";
    }

    const qRest = query(collection(db, "restaurants"), where("waiterCode", "==", code));
    const snap = await getDocs(qRest);

    if (snap.empty) {
      waiterLoginStatus.textContent = "Kein Lokal mit diesem Kellner-Code gefunden.";
      waiterLoginStatus.classList.add("status-err");
      return;
    }

    const docSnap = snap.docs[0];
    const data = docSnap.data() || {};

    if (!isRestaurantOperational(data)) {
      waiterLoginStatus.textContent =
        "Dieses MENYRA ist aktuell nicht aktiv. Bitte Chef oder MENYRA kontaktieren.";
      waiterLoginStatus.classList.add("status-err");
      return;
    }

    currentRestaurantId = docSnap.id;
    saveWaiterSession(currentRestaurantId);

    if (kRestLabel) kRestLabel.textContent = data.restaurantName || currentRestaurantId;
    if (waiterLoginCard) waiterLoginCard.style.display = "none";
    if (orderCard) orderCard.style.display = "block";

    setView("open");
  } catch (err) {
    console.error(err);
    waiterLoginStatus.textContent = "Fehler: " + (err?.message || "Unknown error");
    waiterLoginStatus.classList.add("status-err");
  } finally {
    if (waiterLoginBtn) {
      waiterLoginBtn.disabled = false;
      waiterLoginBtn.textContent = "Einloggen";
    }
  }
}
// --- END: ABSCHNITT 6 — LOGIN KELLNER ---

/* =========================================================
   ABSCHNITT 7 — RENDERING (XSS-safe)
   ========================================================= */
// --- START: ABSCHNITT 7 — RENDERING ---
function renderOrders(orders, { showActions }) {
  if (!orderList) return;

  orderList.innerHTML = "";

  if (!orders.length) {
    orderList.innerHTML = "<div class='info'>Noch keine Bestellungen.</div>";
    return;
  }

  orders.forEach((o) => {
    const div = document.createElement("div");
    div.className = "card";

    const label = mapStatusLabel(o.status);
    const colors = getStatusColors(o.status);

    const safeTable = escapeHtml(o.table || "?");
    const safeItemsText = escapeHtml(
      (o.items || []).map((i) => `${Number(i.qty) || 0}× ${String(i.name || "")}`).join(", ")
    );

    const total =
      (o.items || []).reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0),
        0
      ) || 0;

    div.innerHTML = `
      <div class="list-item-row">
        <span>
          Tisch ${safeTable}
          <br/>
          <span class="info">${safeItemsText || ""}</span>
        </span>
        <span class="badge" style="background:${colors.bg}; color:${colors.fg};">
          ${escapeHtml(label)}
        </span>
      </div>
      <div class="info">
        ${escapeHtml(o.createdAtText || "")}${o.note ? ` • Notiz: ${escapeHtml(o.note)}` : ""}
        <br/>
        Summe: ${total.toFixed(2)} €
      </div>
      ${
        showActions
          ? `<div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
              <button class="btn btn-ghost btn-small" data-id="${escapeHtml(o.id)}" data-status="in_progress">In Arbeit</button>
              <button class="btn btn-primary btn-small" data-id="${escapeHtml(o.id)}" data-status="served">Serviert</button>
            </div>`
          : ""
      }
    `;

    orderList.appendChild(div);
  });
}

function render() {
  if (view === "open") {
    let filtered = openOrders;
    if (openFilter === "new") filtered = openOrders.filter((o) => o.status === "new");
    if (openFilter === "in_progress") filtered = openOrders.filter((o) => o.status === "in_progress");

    if (archiveLoadMoreBtn) archiveLoadMoreBtn.style.display = "none";
    if (archiveMeta) archiveMeta.style.display = "none";

    renderOrders(filtered, { showActions: true });
    return;
  }

  const showLoadMore = !archiveDone && !archiveLoading;
  if (archiveLoadMoreBtn) archiveLoadMoreBtn.style.display = showLoadMore ? "inline-flex" : "none";
  if (archiveMeta) {
    archiveMeta.style.display = "inline";
    archiveMeta.textContent = archiveOrders.length
      ? `Geladen: ${archiveOrders.length}${archiveDone ? " (Ende)" : ""}`
      : "Archiv ist leer.";
  }

  renderOrders(archiveOrders, { showActions: false });
}
// --- END: ABSCHNITT 7 — RENDERING ---

/* =========================================================
   ABSCHNITT 8 — FIRESTORE: OPEN LISTENER (CHEAP)
   ========================================================= */
// --- START: ABSCHNITT 8 — FIRESTORE: OPEN LISTENER (CHEAP) ---
function startOpenListener() {
  if (!currentRestaurantId) return;
  if (unsubOpenOrders) unsubOpenOrders();

  const ordersCol = collection(db, "restaurants", currentRestaurantId, "orders");

  const qOpen = query(
    ordersCol,
    where("status", "in", ["new", "in_progress"]),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  unsubOpenOrders = onSnapshot(
    qOpen,
    (snap) => {
      const orders = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        orders.push({
          id: docSnap.id,
          table: data.table || "?",
          items: data.items || [],
          status: data.status || "new",
          createdAtText: formatCreatedAt(data.createdAt),
          note: data.note || "",
        });
      });
      openOrders = orders;
      render();
    },
    (error) => {
      console.error("[KAMARIERI] onSnapshot Fehler:", error);
      if (orderList) {
        orderList.innerHTML = "<div class='info'>Fehler beim Laden der Bestellungen.</div>";
      }
    }
  );
}
// --- END: ABSCHNITT 8 — FIRESTORE: OPEN LISTENER (CHEAP) ---

/* =========================================================
   ABSCHNITT 9 — FIRESTORE: ARCHIVE (PAGINATION, NO LIVE)
   ========================================================= */
// --- START: ABSCHNITT 9 — FIRESTORE: ARCHIVE (PAGINATION, NO LIVE) ---
async function loadArchivePage({ reset } = { reset: false }) {
  if (!currentRestaurantId) return;
  if (archiveLoading) return;

  if (reset) {
    archiveOrders = [];
    archiveCursor = null;
    archiveDone = false;
  }

  archiveLoading = true;
  render();

  try {
    const ordersCol = collection(db, "restaurants", currentRestaurantId, "orders");

    let qArch = query(
      ordersCol,
      where("status", "==", "served"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    if (archiveCursor) {
      qArch = query(
        ordersCol,
        where("status", "==", "served"),
        orderBy("createdAt", "desc"),
        startAfter(archiveCursor),
        limit(50)
      );
    }

    const snap = await getDocs(qArch);

    const batch = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      batch.push({
        id: docSnap.id,
        table: data.table || "?",
        items: data.items || [],
        status: data.status || "served",
        createdAtText: formatCreatedAt(data.createdAt),
        note: data.note || "",
      });
    });

    if (batch.length) {
      archiveOrders = [...archiveOrders, ...batch];
      archiveCursor = snap.docs[snap.docs.length - 1];
    }

    if (batch.length < 50) archiveDone = true;
  } catch (err) {
    console.error("[KAMARIERI] Archive load error:", err);
  } finally {
    archiveLoading = false;
    render();
  }
}
// --- END: ABSCHNITT 9 — FIRESTORE: ARCHIVE (PAGINATION, NO LIVE) ---

/* =========================================================
   ABSCHNITT 10 — VIEW SWITCH
   ========================================================= */
// --- START: ABSCHNITT 10 — VIEW SWITCH ---
function setView(filter) {
  if (filter === "archive") {
    view = "archive";
    if (unsubOpenOrders) {
      unsubOpenOrders();
      unsubOpenOrders = null;
    }
    loadArchivePage({ reset: true });
  } else {
    const wasOpen = view === "open";
    view = "open";
    openFilter = filter;

    if (!wasOpen || !unsubOpenOrders) startOpenListener();
  }

  if (statusFilterRow) {
    const allButtons = statusFilterRow.querySelectorAll("button[data-filter]");
    allButtons.forEach((b) => {
      const isActive = b.dataset.filter === filter;
      if (isActive) {
        b.classList.remove("btn-ghost");
        b.classList.add("btn-primary");
      } else {
        b.classList.remove("btn-primary");
        b.classList.add("btn-ghost");
      }
    });
  }

  render();
}
// --- END: ABSCHNITT 10 — VIEW SWITCH ---

/* =========================================================
   ABSCHNITT 11 — EVENTS
   ========================================================= */
// --- START: ABSCHNITT 11 — EVENTS ---
if (waiterLoginBtn) {
  waiterLoginBtn.addEventListener("click", () => {
    loginWaiter(((waiterCodeInput && waiterCodeInput.value) || "").trim());
  });
}

if (statusFilterRow) {
  statusFilterRow.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;
    setView(btn.dataset.filter);
  });
}

if (archiveLoadMoreBtn) {
  archiveLoadMoreBtn.addEventListener("click", () => {
    if (view !== "archive") return;
    loadArchivePage({ reset: false });
  });
}

if (orderList) {
  orderList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-id][data-status]");
    if (!btn) return;
    if (!currentRestaurantId) return;
    if (view === "archive") return;

    const id = btn.dataset.id;
    const status = btn.dataset.status;
    const orderRef = doc(db, "restaurants", currentRestaurantId, "orders", id);

    try {
      await updateDoc(orderRef, { status });
    } catch (err) {
      console.error("[KAMARIERI] Status Update Error:", err);
    }
  });
}
// --- END: ABSCHNITT 11 — EVENTS ---

/* =========================================================
   ABSCHNITT 12 — AUTO-LOGIN
   ========================================================= */
// --- START: ABSCHNITT 12 — AUTO-LOGIN ---
const storedRestId = loadWaiterSession();
if (storedRestId) {
  (async () => {
    try {
      const ref = doc(db, "restaurants", storedRestId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data() || {};
      if (!isRestaurantOperational(data)) return;

      currentRestaurantId = storedRestId;
      if (kRestLabel) kRestLabel.textContent = data.restaurantName || currentRestaurantId;
      if (waiterLoginCard) waiterLoginCard.style.display = "none";
      if (orderCard) orderCard.style.display = "block";

      setView("open");
    } catch (err) {
      console.error(err);
    }
  })();
}
// --- END: ABSCHNITT 12 — AUTO-LOGIN ---
