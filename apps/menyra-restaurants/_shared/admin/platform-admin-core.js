// =========================================================
// MENYRA System 1 — Platform Admin Core
// - Uses MENYRA admin demo UI (menyra_platform.css/html)
// - Cost-optimized: prefers public/* single docs (1 read)
// - No realtime listeners (no onSnapshot)
// =========================================================

import { db, auth } from "/shared/firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

import {
collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  orderBy,
  limit,
  serverTimestamp

} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// -------------------------
// Helpers
// -------------------------
const $ = (id) => document.getElementById(id);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function nowMs() { return Date.now(); }

function lsGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function cacheGet(key, ttlMs) {
  const v = lsGet(key);
  if (!v || !v.t || nowMs() - v.t > ttlMs) return null;
  return v.data;
}
function cacheSet(key, data) { lsSet(key, { t: nowMs(), data }); }
function cacheDel(key) { try { localStorage.removeItem(key); } catch {} }


function setText(id, txt) {
  const el = $(id);
  if (el) el.textContent = txt;
}

function show(el) { if (el) el.classList.remove("is-hidden"); }
function hide(el) { if (el) el.classList.add("is-hidden"); }

function parseIntSafe(v, fallback = 0) {
  const n = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}
function parseFloatSafe(v, fallback = 0) {
  const n = parseFloat(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function slugify(input) {
  return String(input || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60) || "kunde";
}

function requireParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function fullUrl(rel) {
  return new URL(rel, window.location.href).toString();
}

// -------------------------
// Login Modal (uses existing modal styles)
// -------------------------
function mountLoginModal(roleLabel = "Login") {
  if (document.getElementById("loginModalOverlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "m-modal-overlay is-hidden";
  overlay.id = "loginModalOverlay";
  overlay.innerHTML = `
    <div class="m-modal" style="max-width:420px;">
      <div class="m-modal-header">
        <h3 class="m-modal-title">${esc(roleLabel)}</h3>
      </div>
      <div class="m-modal-body">
        <div class="m-input-group">
          <label for="loginEmail">Email</label>
          <input id="loginEmail" class="m-input" placeholder="email@domain.com" autocomplete="username"/>
        </div>
        <div class="m-input-group">
          <label for="loginPass">Passwort</label>
          <input id="loginPass" class="m-input" type="password" placeholder="••••••••" autocomplete="current-password"/>
        </div>
        <div class="m-inline" style="justify-content:flex-end; gap:10px; margin-top:14px;">
          <button class="m-btn" id="loginDoBtn" type="button">Login</button>
        </div>
        <div class="m-muted" id="loginStatus" style="margin-top:10px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const loginBtn = overlay.querySelector("#loginDoBtn");
  loginBtn.addEventListener("click", async () => {
    const email = overlay.querySelector("#loginEmail").value.trim();
    const pass = overlay.querySelector("#loginPass").value;
    const status = overlay.querySelector("#loginStatus");
    status.textContent = "";
    if (!email || !pass) {
      status.textContent = "Bitte Email und Passwort eingeben.";
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      status.textContent = "OK.";
    } catch (err) {
      console.error(err);
      status.textContent = err?.message || "Login fehlgeschlagen.";
    }
  });

  show(overlay);
}

// -------------------------
// Views Navigation
// -------------------------
function initNav() {
  const navLinks = qsa('[data-section]');
  const views = qsa('.m-view[data-view]');

  function showView(name) {
    views.forEach(v => v.style.display = (v.dataset.view === name) ? "" : "none");
    navLinks.forEach(a => {
      if (a.dataset.section === name) a.classList.add("is-active");
      else a.classList.remove("is-active");
    });
  }

  navLinks.forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showView(a.dataset.section);
      // close mobile menu if open
      const mm = document.querySelector(".m-mobile-menu");
      const mo = document.querySelector(".m-mobile-menu-overlay");
      if (mm) mm.classList.remove("is-open");
      if (mo) mo.classList.remove("is-open");
    });
  });

  // burger / mobile menu
  const burger = $("burgerToggle");
  const mobileMenu = $("mobileMenu");
  const mobileOverlay = document.querySelector(".m-mobile-menu-overlay");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
      if (mobileOverlay) mobileOverlay.classList.toggle("is-open");
    });
  }
  if (mobileOverlay && mobileMenu) {
    mobileOverlay.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      mobileOverlay.classList.remove("is-open");
    });
  }

  // theme toggle (simple)
  const themeBtn = $("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("is-dark");
      try {
        localStorage.setItem("menyra_theme", document.documentElement.classList.contains("is-dark") ? "dark" : "light");
      } catch {}
    });
    try {
      const saved = localStorage.getItem("menyra_theme");
      if (saved === "dark") document.documentElement.classList.add("is-dark");
    } catch {}
  }

  // default view
  showView("dashboard");
  return { showView };
}

// -------------------------
// Data Access (cost optimized)
// -------------------------
const REST_CACHE_KEY = "menyra_admin_restaurants_cache_v1";
const REST_CACHE_TTL_MS = 2 * 60 * 1000;

async function fetchRestaurants(role, uid, restrictRestaurantId = null) {
  // Owner mode: only one restaurant
  if (restrictRestaurantId) {
    const snap = await getDoc(doc(db, "restaurants", restrictRestaurantId));
    if (!snap.exists()) return [];
    return [{ id: snap.id, ...(snap.data() || {}) }];
  }

  const cacheKey = REST_CACHE_KEY + "_" + role + "_" + (uid || "anon");
  const cached = cacheGet(cacheKey, REST_CACHE_TTL_MS);
  if (cached && Array.isArray(cached)) return cached;

  const ref = collection(db, "restaurants");
  let snaps = null;

  if (role === "staff") {
    // Staff sees only their customers.
    // We support multiple possible fields for backwards compatibility.
    try {
      snaps = await getDocs(query(ref, where("scopeStaffId", "==", uid)));
    } catch (_) { snaps = null; }

    if (!snaps || snaps.empty) {
      try {
        snaps = await getDocs(query(ref, where("assignedStaffId", "==", uid)));
      } catch (_) { snaps = null; }
    }
    if (!snaps || snaps.empty) {
      try {
        snaps = await getDocs(query(ref, where("createdByStaffId", "==", uid)));
      } catch (_) { snaps = null; }
    }
  }

  // CEO (and fallback): load all (no orderBy => no index needed)
  if (!snaps) snaps = await getDocs(ref);

  const rows = snaps.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
  // client-side sort by createdAt if available
  rows.sort((a, b) => {
    const ta = a.createdAt?.seconds ? a.createdAt.seconds : 0;
    const tb = b.createdAt?.seconds ? b.createdAt.seconds : 0;
    return tb - ta;
  });

  cacheSet(cacheKey, rows);
  return rows;
}

const __ENSURED_PUBLIC_DOCS = (window.__MENYRA_ENSURED_PUBLIC_DOCS ||= new Set());

async function ensurePublicDocs(restaurantId, base) {
  if (!restaurantId) return;
  if (__ENSURED_PUBLIC_DOCS.has(restaurantId)) return;

  // public/meta (safe merge)
  await setDoc(doc(db, "restaurants", restaurantId, "public", "meta"), {
    name: base.name || "",
    type: base.type || "cafe",
    city: base.city || "",
    logoUrl: base.logoUrl || "",
    offersEnabled: true,
    updatedAt: serverTimestamp()
  }, { merge: true });

  // IMPORTANT:
  // Never overwrite existing menu/offers items arrays here.
  // Create missing docs only (1x per restaurant per session).
  const menuRef = doc(db, "restaurants", restaurantId, "public", "menu");
  const offersRef = doc(db, "restaurants", restaurantId, "public", "offers");

  try {
    const mSnap = await getDoc(menuRef);
    if (!mSnap.exists()) {
      await setDoc(menuRef, { items: [], updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (_) {}

  try {
    const oSnap = await getDoc(offersRef);
    if (!oSnap.exists()) {
      await setDoc(offersRef, { items: [], updatedAt: serverTimestamp() }, { merge: true });
    }
  } catch (_) {}

  __ENSURED_PUBLIC_DOCS.add(restaurantId);
}

async function createRestaurantDoc(role, user, payload) {
  const restaurantsRef = collection(db, "restaurants");

  const base = {
    name: payload.name,
    type: payload.type,
    ownerName: payload.ownerName,
    city: payload.city,
    phone: payload.phone,
    tableCount: payload.tableCount,
    yearPrice: payload.yearPrice,
    status: payload.status,
    logoUrl: payload.logoUrl,
    slug: payload.slug,
    system: "system1",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdByUid: user.uid,
    createdByRole: role
  };

  if (role === "staff") {
    base.scopeStaffId = user.uid;
  }

  const docRef = await addDoc(restaurantsRef, base);
  await ensurePublicDocs(docRef.id, base);
  return docRef.id;
}

// -------------------------
// UI: Customers
// -------------------------
function renderCustomersTable(rows, role) {
  const body = $("customersTableBody");
  if (!body) return;

  body.innerHTML = "";
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.innerHTML = `
      <div>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <b>${esc(r.name || "—")}</b>
          <span class="m-muted" style="font-size:12px;">${esc(r.type || "")}${r.slug ? " • "+esc(r.slug) : ""}</span>
        </div>
      </div>
      <div>${esc(r.ownerName || "—")}</div>
      <div>${esc(r.city || "—")}</div>
      <div>${esc(r.yearPrice != null ? (String(r.yearPrice)+" €/Jahr") : "—")}</div>
      <div><span class="m-badge ${r.status === "active" ? "m-badge--green" : (r.status === "trial" ? "m-badge--yellow" : "m-badge--gray")}">${esc(r.status || "—")}</span></div>
      <div class="m-table-col-actions" style="display:flex; gap:8px; justify-content:flex-end;">
        <button class="m-btn m-btn--small m-btn--ghost" type="button" data-act="qr" data-id="${esc(r.id)}">QR & Links</button>
        <button class="m-btn m-btn--small" type="button" data-act="edit" data-id="${esc(r.id)}">Edit</button>
      </div>
    `;
    // staff can't edit other than basic? still allow
    body.appendChild(row);
  });

  // footer
  const footer = $("customersFooter");
  if (footer) footer.textContent = rows.length ? `Zeilen: ${rows.length}` : "—";
}

function applyCustomersFilter(allRows) {
  const term = ($("customerSearch")?.value || "").trim().toLowerCase();
  const onlyActive = $("customersOnlyActive")?.checked ?? true;

  return allRows.filter((r) => {
    if (onlyActive && r.status !== "active") return false;
    if (!term) return true;
    const hay = `${r.name||""} ${r.ownerName||""} ${r.city||""} ${r.slug||""}`.toLowerCase();
    return hay.includes(term);
  });
}

function openCustomerModal(mode, data = {}) {
  const overlay = $("customerModalOverlay");
  if (!overlay) return;
  const title = $("customerModalTitle");
  if (title) title.textContent = mode === "edit" ? "Kunde bearbeiten" : "Neuer Kunde";

  // fill form
  $("customerId").value = data.id || "";
  $("customerName").value = data.name || "";
  $("customerOwner").value = data.ownerName || "";
  $("customerCity").value = data.city || "";
  $("customerPhone").value = data.phone || "";
  $("customerTableCount").value = (data.tableCount != null ? String(data.tableCount) : "");
  $("customerYearPrice").value = (data.yearPrice != null ? String(data.yearPrice) : "");
  $("customerLogoUrl").value = data.logoUrl || "";
  const statusSel = $("customerStatus");
  if (statusSel) statusSel.value = data.status || "active";
  const typeSel = $("customerType");
  if (typeSel) typeSel.value = data.type || "cafe";

  setText("customerModalStatus", "");
  show(overlay);
}

function closeCustomerModal() {
  const overlay = $("customerModalOverlay");
  if (overlay) hide(overlay);
}

function openQrModal(restaurant) {
  const overlay = $("qrModalOverlay");
  if (!overlay) return;
  const rid = restaurant.id;

  setText("qrModalTitle", `QR & Links — ${restaurant.name || rid}`);

  // Build template based on our real structure
  const guestTemplateRel = `../menyra-restaurants/guest/karte/index.html?r=${encodeURIComponent(rid)}&t=T1`;
  setText("guestTemplateCode", guestTemplateRel);

  // first tables list
  const max = Math.min(parseIntSafe(restaurant.tableCount, 0), 8);
  const list = $("guestLinksList");
  if (list) {
    list.innerHTML = "";
    if (max <= 0) {
      const div = document.createElement("div");
      div.textContent = "Keine Tische (0) – nur Main Page.";
      list.appendChild(div);
    } else {
      for (let i = 1; i <= max; i++) {
        const t = `T${i}`;
        const rel = `../menyra-restaurants/guest/karte/index.html?r=${encodeURIComponent(rid)}&t=${encodeURIComponent(t)}`;
        const a = document.createElement("a");
        a.href = rel;
        a.textContent = `${t}: ${rel}`;
        a.style.textDecoration = "none";
        a.style.color = "inherit";
        a.target = "_blank";
        list.appendChild(a);
      }
    }
  }

  // owner/staff codes
  const ownerRel = `../menyra-restaurants/owner/index.html?r=${encodeURIComponent(rid)}`;
  const waiterRel = `../menyra-restaurants/staff/kamarieri/index.html?r=${encodeURIComponent(rid)}`;
  const kitchenRel = `../menyra-restaurants/staff/kuzhina/index.html?r=${encodeURIComponent(rid)}`;

  setText("ownerAdminLink", ownerRel);
  setText("staffLoginLink", waiterRel);

  const codes = $("qrCodesBox");
  if (codes) {
    codes.innerHTML = `
      <div><b>Owner:</b> <code>${esc(ownerRel)}</code></div>
      <div><b>Kamarieri:</b> <code>${esc(waiterRel)}</code></div>
      <div><b>Kuzhina:</b> <code>${esc(kitchenRel)}</code></div>
    `;
  }

  // copy buttons
  const copyGuest = $("copyGuestTemplateBtn");
  if (copyGuest) {
    copyGuest.onclick = async () => {
      try {
        await navigator.clipboard.writeText(fullUrl(guestTemplateRel));
        setText("qrModalStatus", "Template kopiert.");
      } catch {
        setText("qrModalStatus", "Copy nicht möglich (Browser).");
      }
    };
  }
  const copyCodes = $("copyCodesBtn");
  if (copyCodes) {
    copyCodes.onclick = async () => {
      const txt = [
        `Owner: ${fullUrl(ownerRel)}`,
        `Kamarieri: ${fullUrl(waiterRel)}`,
        `Kuzhina: ${fullUrl(kitchenRel)}`
      ].join("\n");
      try {
        await navigator.clipboard.writeText(txt);
        setText("qrModalStatus", "Codes kopiert.");
      } catch {
        setText("qrModalStatus", "Copy nicht möglich (Browser).");
      }
    };
  }

  setText("qrModalStatus", "");
  show(overlay);
}

function closeQrModal() {
  const overlay = $("qrModalOverlay");
  if (overlay) hide(overlay);
}

// -------------------------
// UI: Offers (single-doc public/offers)
// -------------------------
async function loadPublicOffers(restaurantId) {
  const ref = doc(db, "restaurants", restaurantId, "public", "offers");
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() || {};
  return Array.isArray(data.items) ? data.items : [];
}

async function savePublicOffers(restaurantId, items) {
  await setDoc(doc(db, "restaurants", restaurantId, "public", "offers"), {
    items: items || [],
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function loadPublicMenuItems(restaurantId) {
  const ref = doc(db, "restaurants", restaurantId, "public", "menu");
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() || {};
  return Array.isArray(data.items) ? data.items : [];
}

function fillOfferMenuSelect(items) {
  const sel = $("offerMenuItem");
  if (!sel) return;
  sel.innerHTML = `<option value="">— optional —</option>`;
  items.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i.id || "";
    opt.textContent = i.name ? `${i.name} (${i.price ?? ""})` : (i.id || "Item");
    sel.appendChild(opt);
  });
}

function renderOffersTable(items) {
  const body = $("offersTableBody");
  if (!body) return;
  body.innerHTML = "";
  items.forEach((o, idx) => {
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.setAttribute("style", "grid-template-columns: 2fr 1.2fr 1fr 0.9fr;");
    const status = (o.active === false) ? "inaktiv" : "aktiv";
    row.innerHTML = `
      <div>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <b>${esc(o.title || "—")}</b>
          <span class="m-muted" style="font-size:12px;">${esc(o.desc || "")}</span>
        </div>
      </div>
      <div><span class="m-badge ${status === "aktiv" ? "m-badge--green" : "m-badge--gray"}">${esc(status)}</span></div>
      <div>${esc(o.price != null ? (String(o.price)+" €") : "—")}</div>
      <div class="m-table-col-actions" style="display:flex; gap:8px; justify-content:flex-end;">
        <button class="m-btn m-btn--small" type="button" data-offer="edit" data-idx="${idx}">Edit</button>
        <button class="m-btn m-btn--small m-btn--danger" type="button" data-offer="del" data-idx="${idx}">Del</button>
      </div>
    `;
    body.appendChild(row);
  });
}

function openOfferEditor(mode, offer = {}) {
  const card = $("offerEditorCard");
  if (!card) return;
  const title = $("offerEditorTitle");
  if (title) title.textContent = mode === "edit" ? "Angebot bearbeiten" : "Neues Angebot";

  card.dataset.mode = mode;
  card.dataset.editId = offer.id || "";

  $("offerTitle").value = offer.title || "";
  $("offerDesc").value = offer.desc || "";
  $("offerPrice").value = offer.price != null ? String(offer.price) : "";
  $("offerImageUrl").value = offer.imageUrl || "";
  $("offerActive").checked = offer.active !== false;
  $("offerAddToCart").checked = offer.addToCart === true;

  const mi = $("offerMenuItem");
  if (mi) mi.value = offer.menuItemId || "";

  setText("offerEditorStatus", "");
  card.style.display = "";
}

function closeOfferEditor() {
  const card = $("offerEditorCard");
  if (!card) return;
  card.style.display = "none";
  card.dataset.mode = "";
  card.dataset.editId = "";
  setText("offerEditorStatus", "");
}

// -------------------------
// Boot function
// -------------------------
// =========================================================
// MENYRA Leads (CEO/Staff)
// - Collection: /leads
// - Staff scoping: scopeStaffId OR createdByStaffId (fallback)
// =========================================================

const LEADS_CACHE_KEY = "menyra_admin_leads_cache_v1";
const LEADS_CACHE_TTL_MS = 2 * 60 * 1000;

function normalizeLead(row){
  return {
    id: row.id,
    businessName: row.businessName || row.name || "",
    customerType: row.customerType || row.type || "cafe",
    city: row.city || "",
    phone: row.phone || "",
    insta: row.insta || "",
    status: row.status || "new",
    note: row.note || "",
    scopeStaffId: row.scopeStaffId || row.createdByStaffId || row.assignedStaffId || "",
    createdAt: row.createdAt || null,
    updatedAt: row.updatedAt || null
  };
}

async function fetchLeads(role, uid){
  const cacheKey = `${LEADS_CACHE_KEY}_${role}_${uid||"anon"}`;
  const cached = cacheGet(cacheKey, LEADS_CACHE_TTL_MS);
  if (cached && Array.isArray(cached)) return cached;

  const ref = collection(db, "leads");
  let snaps = null;

  async function tryStaff(field){
    try {
      // index-free query (no orderBy). We'll sort client-side by createdAt.
      return await getDocs(query(ref, where(field, "==", uid), limit(200)));
    } catch (e) {
      return null;
    }
  }

  if (role === "staff") {
    snaps = await tryStaff("scopeStaffId");
    if (!snaps || snaps.empty) snaps = await tryStaff("createdByStaffId");
    if (!snaps || snaps.empty) snaps = await tryStaff("assignedStaffId");
  }

  if (!snaps) {
    // CEO (or fallback): also avoid index issues by not forcing orderBy
    try {
      snaps = await getDocs(query(ref, limit(200)));
    } catch (e) {
      snaps = await getDocs(ref);
    }
  }

  const rows = snaps.docs.map(d => normalizeLead({ id: d.id, ...(d.data()||{}) }));
  // client-side sort (newest first)
  rows.sort((a,b)=>{
    const ta = a.createdAt?.seconds ? a.createdAt.seconds : 0;
    const tb = b.createdAt?.seconds ? b.createdAt.seconds : 0;
    return tb - ta;
  });

  cacheSet(cacheKey, rows);
  return rows;
}

function leadsStats(rows){
  const total = rows.length;
  const counts = { new:0, contacted:0, interested:0, no_interest:0, other:0 };
  rows.forEach(r=>{
    const s = (r.status||"").toLowerCase();
    if (s === "new" || s === "open" || s === "offen") counts.new++;
    else if (s === "contacted" || s === "waiting" || s === "kontaktiert") counts.contacted++;
    else if (s === "interested" || s === "interesse") counts.interested++;
    else if (s === "no_interest" || s === "nointerest" || s === "kein_interesse") counts.no_interest++;
    else counts.other++;
  });
  return { total, counts };
}

function openLeadModal(mode, data={}){
  const overlay = $("leadModalOverlay");
  if (!overlay) return;
  $("leadModalTitle").textContent = (mode === "edit") ? "Lead bearbeiten" : "Neuer Lead";

  $("leadId").value = data.id || "";
  $("leadBusinessName").value = data.businessName || "";
  $("leadCustomerType").value = data.customerType || "cafe";
  $("leadCity").value = data.city || "";
  $("leadPhone").value = data.phone || "";
  $("leadInsta").value = data.insta || "";
  $("leadStatus").value = data.status || "new";
  $("leadNote").value = data.note || "";

  setText("leadModalStatus", "");
  show(overlay);
}

function closeLeadModal(){
  const overlay = $("leadModalOverlay");
  if (overlay) hide(overlay);
}

function applyLeadsFilter(allRows){
  const term = ($("leadsSearch")?.value || "").trim().toLowerCase();
  if (!term) return allRows;
  return allRows.filter(r=>{
    const hay = `${r.businessName} ${r.city} ${r.phone} ${r.insta} ${r.status}`.toLowerCase();
    return hay.includes(term);
  });
}

function renderLeadsTable(rows){
  const body = $("leadsTableBody");
  if (!body) return;
  body.innerHTML = "";
  rows.forEach(r=>{
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.innerHTML = `
      <div>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <b>${esc(r.businessName || "—")}</b>
          <span class="m-muted" style="font-size:12px;">${esc(r.customerType || "")}${r.city ? " • "+esc(r.city) : ""}</span>
        </div>
      </div>
      <div>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <span>${esc(r.phone || "—")}</span>
          <span class="m-muted" style="font-size:12px;">${esc(r.insta || "")}</span>
        </div>
      </div>
      <div><span class="m-badge">${esc(r.status || "—")}</span></div>
      <div class="m-table-col-actions" style="display:flex; gap:8px; justify-content:flex-end;">
        <button class="m-btn m-btn--small m-btn--ghost" type="button" data-act="lead-edit" data-id="${esc(r.id)}">Edit</button>
        <button class="m-btn m-btn--small" type="button" data-act="lead-to-customer" data-id="${esc(r.id)}">→ Kunde</button>
      </div>
    `;
    body.appendChild(row);
  });
  setText("leadsMeta", rows.length ? `Zeilen: ${rows.length}` : "—");
}

export async function bootPlatformAdmin({ role = "ceo", roleLabel = "Platform", restrictRestaurantId = null } = {}) {
  const nav = initNav();

  // Logout
  const logoutBtn = $("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try { await signOut(auth); } catch {}
      window.location.reload();
    });
  }

  // Basic modal close buttons
  $("customerModalClose")?.addEventListener("click", closeCustomerModal);
  $("customerCancelBtn")?.addEventListener("click", closeCustomerModal);
  $("qrModalClose")?.addEventListener("click", closeQrModal);
  $("leadModalClose")?.addEventListener("click", closeLeadModal);
  $("leadCancelBtn")?.addEventListener("click", closeLeadModal);


  // When clicking outside (overlay)
  $("customerModalOverlay")?.addEventListener("click", (e) => { if (e.target?.id === "customerModalOverlay") closeCustomerModal(); });
  $("qrModalOverlay")?.addEventListener("click", (e) => { if (e.target?.id === "qrModalOverlay") closeQrModal(); });
  $("leadModalOverlay")?.addEventListener("click", (e) => { if (e.target?.id === "leadModalOverlay") closeLeadModal(); });


  // Owner mode: restrict restaurant id from URL if not passed
  if (role === "owner" && !restrictRestaurantId) {
    restrictRestaurantId = requireParam("r");
  }

  // Hide sections depending on role
  if (role === "owner") {
    // hide customers/leads in nav & mobile nav
    qsa('[data-section="customers"], [data-section="leads"]').forEach(a => a.style.display = "none");
    const newBtn = $("newCustomerBtn");
    if (newBtn) newBtn.style.display = "none";
    // show offers as default
    nav.showView("offers");
  }

  // Sign in gate
  mountLoginModal(`${roleLabel} Login`);
  let currentUser = null;

// Leads UI (CEO/Staff)
$("newLeadBtn")?.addEventListener("click", () => openLeadModal("new", {}));
$("leadsSearch")?.addEventListener("input", () => { window.__MENYRA__refreshLeads && window.__MENYRA__refreshLeads(); });

$("leadForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = currentUser;
  if (!user) return;

  const leadId = ($("leadId")?.value || "").trim();
  const payload = {
    businessName: ($("leadBusinessName")?.value || "").trim(),
    customerType: ($("leadCustomerType")?.value || "cafe").trim(),
    city: ($("leadCity")?.value || "").trim(),
    phone: ($("leadPhone")?.value || "").trim(),
    insta: ($("leadInsta")?.value || "").trim(),
    status: ($("leadStatus")?.value || "new").trim(),
    note: ($("leadNote")?.value || "").trim(),
    updatedAt: serverTimestamp()
  };

  // Staff scoping fields (so staff sees only own leads)
  if (role === "staff") {
    payload.scopeStaffId = user.uid;
    payload.createdByStaffId = user.uid;
  }

  setText("leadModalStatus", "Speichere…");
  try {
    if (leadId) {
      await setDoc(doc(db, "leads", leadId), payload, { merge: true });
    } else {
      payload.createdAt = serverTimestamp();
      await addDoc(collection(db, "leads"), payload);
    }
    cacheDel(`${LEADS_CACHE_KEY}_${role}_${user.uid}`);
    closeLeadModal();
    // refresh leads table immediately
    window.__MENYRA__refreshLeads && window.__MENYRA__refreshLeads(true);
  } catch (err) {
    console.error(err);
    setText("leadModalStatus", "Fehler beim Speichern (Rules/Auth?).");
  }
});



  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    const loginOverlay = $("loginModalOverlay");
    if (!user) {
      if (loginOverlay) show(loginOverlay);
      setText("adminStatus", "Nicht eingeloggt.");
      return;
    }
    if (loginOverlay) hide(loginOverlay);
    setText("adminStatus", `Eingeloggt: ${user.email || user.uid}`);

    // Owner access check (optional)
    if (role === "owner") {
      const rid = restrictRestaurantId;
      if (!rid) {
        setText("offersStatus", "Fehler: ?r=RESTAURANT_ID fehlt.");
        return;
      }
      try {
        const staffSnap = await getDoc(doc(db, "restaurants", rid, "staff", user.uid));
        const staffRole = staffSnap.exists() ? (staffSnap.data()?.role || "") : "";
        if (!["owner","admin","manager"].includes(staffRole)) {
          setText("offersStatus", "Kein Zugriff (restaurants/{r}/staff/{uid}.role).");
          return;
        }
      } catch (err) {
        console.error(err);
        setText("offersStatus", "Zugriff konnte nicht geprüft werden.");
        return;
      }
    }

    // Load restaurants list
    let restaurants = [];
    try {
      restaurants = await fetchRestaurants(role, user.uid, restrictRestaurantId);
    } catch (err) {
      console.error(err);
      setText("customersMeta", "Fehler beim Laden (Rules/Auth?).");
      setText("offersStatus", "Fehler beim Laden (Rules/Auth?).");
      return;
    }

    // Dashboard stats
    const total = restaurants.length;
    const active = restaurants.filter(r => r.status === "active").length;
    setText("dashTotalCustomers", String(total));
    setText("dashActiveCustomers", String(active));

    // Fill dashboard quick select
    const dashSel = $("dashRestaurantQuickSelect");
    if (dashSel) {
      dashSel.innerHTML = `<option value="">— auswählen —</option>`;
      restaurants.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.id;
        opt.textContent = r.name || r.id;
        dashSel.appendChild(opt);
      });
    }
    $("dashGoOffers")?.addEventListener("click", () => {
      const rid = dashSel?.value;
      if (rid) {
        const offersSel = $("offersRestaurantSelect");
        if (offersSel) offersSel.value = rid;
        nav.showView("offers");
        offersSel?.dispatchEvent(new Event("change"));
      }
    });

    // Customers view
    const allRows = restaurants;
    function refreshCustomers() {
      const filtered = applyCustomersFilter(allRows);
      const meta = $("customersMeta");
      if (meta) meta.textContent = `${filtered.length} / ${allRows.length}`;
      renderCustomersTable(filtered, role);
    }

    $("customerSearch")?.addEventListener("input", refreshCustomers);
    $("customersOnlyActive")?.addEventListener("change", refreshCustomers);
    $("newCustomerBtn")?.addEventListener("click", () => {
      if (role === "owner") return;
      openCustomerModal("new", {});
    });
    $("openNewCustomerFromDashboard")?.addEventListener("click", () => {
      if (role === "owner") return;
      nav.showView("customers");
      openCustomerModal("new", {});
    });

    // Customer modal submit
    $("customerForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (role === "owner") return;

      const statusEl = $("customerModalStatus");
      if (statusEl) statusEl.textContent = "";

      const name = $("customerName")?.value?.trim();
      const ownerName = $("customerOwner")?.value?.trim();
      const city = $("customerCity")?.value?.trim();
      const phone = $("customerPhone")?.value?.trim();
      const tableCount = parseIntSafe($("customerTableCount")?.value, 0);
      const yearPrice = parseFloatSafe($("customerYearPrice")?.value, 0);
      const logoUrl = $("customerLogoUrl")?.value?.trim();
      const status = $("customerStatus")?.value || "active";
      const type = $("customerType")?.value || "cafe";
      const slug = slugify(name);

      if (!name) {
        if (statusEl) statusEl.textContent = "Name fehlt.";
        return;
      }

      try {
        const id = await createRestaurantDoc(role, user, { name, type, ownerName, city, phone, tableCount, yearPrice, status, logoUrl, slug });
        // refresh cache and UI
        try { localStorage.removeItem(REST_CACHE_KEY + "_" + role + "_" + user.uid); } catch {}
        const updated = await fetchRestaurants(role, user.uid, restrictRestaurantId);
        restaurants.splice(0, restaurants.length, ...updated);
        refreshCustomers();
        closeCustomerModal();
        setText("adminStatus", `Kunde erstellt: ${id}`);
      } catch (err) {
        console.error(err);
        if (statusEl) statusEl.textContent = err?.message || "Speichern fehlgeschlagen (Rules?).";
      }
    });

    // Customers table actions (delegation)
    $("customersTableBody")?.addEventListener("click", (e) => {
      const btn = e.target?.closest("button[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      const rid = btn.dataset.id;
      const item = allRows.find(r => r.id === rid);
      if (!item) return;

      if (act === "qr") openQrModal(item);
      if (act === "edit") openCustomerModal("edit", item);
    });

    refreshCustomers();

    
// Leads view (CEO/Staff)
let leadsAll = [];
async function refreshLeads(force = false) {
  if (role === "owner") return; // owner doesn't use CRM leads
  if (!currentUser) return;

  try {
    if (force) cacheDel(`${LEADS_CACHE_KEY}_${role}_${currentUser.uid}`);
    const rows = await fetchLeads(role, currentUser.uid);
    leadsAll = rows;

    const filtered = applyLeadsFilter(leadsAll);
    renderLeadsTable(filtered);

    // stats chips
    const st = leadsStats(leadsAll);
    setText("leadsTotalBadge", String(st.total));
    setText("leadsStatNew", `Offen: ${st.counts.new}`);
    setText("leadsStatContacted", `Kontaktiert/Warten: ${st.counts.contacted}`);
    setText("leadsStatInterested", `Interesse: ${st.counts.interested}`);
    setText("leadsStatNoInterest", `Kein Interesse: ${st.counts.no_interest}`);

    // row actions (event delegation)
    $("leadsTableBody")?.addEventListener("click", async (e) => {
      const btn = e.target?.closest?.("button[data-act]");
      if (!btn) return;
      const act = btn.getAttribute("data-act");
      const id = btn.getAttribute("data-id");
      if (!id) return;
      const row = leadsAll.find(x => x.id === id);
      if (!row) return;

      if (act === "lead-edit") {
        openLeadModal("edit", row);
        return;
      }

      if (act === "lead-to-customer") {
        // Convert lead -> new customer (restaurant doc)
        setText("adminStatus", "Erstelle Kunde…");
        try {
          const payload = {
            name: row.businessName || "Neuer Kunde",
            type: (row.customerType === "restaurant" ? "restaurant" : "cafe"),
            city: row.city || "",
            phone: row.phone || "",
            ownerName: "",
            tableCount: 10,
            yearPrice: 490,
            logoUrl: "",
            status: "active"
          };
          const createdId = await createRestaurantDoc(role, currentUser, payload);
          await setDoc(doc(db, "leads", id), { status: "converted", convertedRestaurantId: createdId, updatedAt: serverTimestamp() }, { merge: true });

          // clear caches
          try { localStorage.removeItem(REST_CACHE_KEY + "_" + role + "_" + currentUser.uid); } catch {}
          cacheDel(`${LEADS_CACHE_KEY}_${role}_${currentUser.uid}`);

          setText("adminStatus", `Lead → Kunde erstellt: ${createdId}`);
          // refresh customers UI & leads
          const updated = await fetchRestaurants(role, currentUser.uid, restrictRestaurantId);
          restaurants.splice(0, restaurants.length, ...updated);
          refreshCustomers();
          refreshLeads(true);
        } catch (err) {
          console.error(err);
          setText("adminStatus", "Fehler beim Erstellen (Rules/Auth?).");
        }
        return;
      }
    }, { once: true });

    setText("leadsMeta", filtered.length ? `Zeilen: ${filtered.length}` : "—");
  } catch (err) {
    console.error(err);
    setText("leadsMeta", "Fehler beim Laden (Rules/Auth?).");
  }
}
window.__MENYRA__refreshLeads = refreshLeads;
await refreshLeads(true);

// Offers view
    const offersSel = $("offersRestaurantSelect");
    if (offersSel) {
      offersSel.innerHTML = `<option value="">— Lokal wählen —</option>`;
      restaurants.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.id;
        opt.textContent = r.name || r.id;
        offersSel.appendChild(opt);
      });

      if (role === "owner" && restaurants[0]) {
        offersSel.value = restaurants[0].id;
      }
    }

    let currentOffers = [];
    let currentMenuItems = [];
    let currentRestaurantId = role === "owner" && restaurants[0] ? restaurants[0].id : "";

    async function loadOffersUI(rid) {
      if (!rid) {
        setText("offersStatus", "Bitte ein Lokal auswählen.");
        return;
      }
      setText("offersStatus", "Lade…");
      setText("offersSelectedBadge", rid);
      currentRestaurantId = rid;

      try {
        // ensure public docs exist (safe)
        await ensurePublicDocs(rid, { name: "", type: "cafe", city: "", logoUrl: "" });

        currentMenuItems = await loadPublicMenuItems(rid);
        fillOfferMenuSelect(currentMenuItems);

        currentOffers = await loadPublicOffers(rid);
        renderOffersTable(currentOffers);

        setText("offersStatus", `OK (${currentOffers.length})`);
        closeOfferEditor();
      } catch (err) {
        console.error(err);
        setText("offersStatus", err?.message || "Fehler beim Laden.");
      }
    }

    offersSel?.addEventListener("change", () => {
      const rid = offersSel.value;
      loadOffersUI(rid);
    });

    if (role === "owner" && currentRestaurantId) {
      loadOffersUI(currentRestaurantId);
    }

    $("offerNewBtn")?.addEventListener("click", () => {
      if (!currentRestaurantId) return;
      openOfferEditor("new", { active: true });
    });

    // Offers table actions
    $("offersTableBody")?.addEventListener("click", async (e) => {
      const btn = e.target?.closest("button[data-offer]");
      if (!btn) return;
      const idx = parseIntSafe(btn.dataset.idx, -1);
      if (idx < 0 || idx >= currentOffers.length) return;

      const action = btn.dataset.offer;
      if (action === "edit") {
        openOfferEditor("edit", currentOffers[idx]);
      }
      if (action === "del") {
        // delete by removing from array
        const next = currentOffers.slice();
        next.splice(idx, 1);
        try {
          await savePublicOffers(currentRestaurantId, next);
          currentOffers = next;
          renderOffersTable(currentOffers);
          setText("offersStatus", `Gespeichert (${currentOffers.length})`);
        } catch (err) {
          console.error(err);
          setText("offersStatus", err?.message || "Löschen fehlgeschlagen.");
        }
      }
    });

    // Offer editor buttons
    $("offerCancelBtn")?.addEventListener("click", closeOfferEditor);

    $("offerSaveBtn")?.addEventListener("click", async () => {
      if (!currentRestaurantId) return;
      const card = $("offerEditorCard");
      if (!card) return;

      const statusEl = $("offerEditorStatus");
      if (statusEl) statusEl.textContent = "";

      const mode = card.dataset.mode || "new";
      const editId = card.dataset.editId || "";

      const title = $("offerTitle")?.value?.trim();
      if (!title) { if (statusEl) statusEl.textContent = "Titel fehlt."; return; }

      const desc = $("offerDesc")?.value?.trim() || "";
      const price = parseFloatSafe($("offerPrice")?.value, 0);
      const imageUrl = $("offerImageUrl")?.value?.trim() || "";
      const active = $("offerActive")?.checked ?? true;
      const addToCart = $("offerAddToCart")?.checked ?? false;
      const menuItemId = $("offerMenuItem")?.value || "";

      const next = currentOffers.slice();

      if (mode === "edit" && editId) {
        const idx = next.findIndex(o => o.id === editId);
        if (idx >= 0) {
          next[idx] = { ...next[idx], title, desc, price, imageUrl, active, addToCart, menuItemId };
        }
      } else {
        const id = "of_" + Math.random().toString(36).slice(2, 10);
        next.unshift({ id, title, desc, price, imageUrl, active, addToCart, menuItemId, createdAt: nowMs() });
      }

      try {
        await savePublicOffers(currentRestaurantId, next);
        currentOffers = next;
        renderOffersTable(currentOffers);
        closeOfferEditor();
        setText("offersStatus", `Gespeichert (${currentOffers.length})`);
      } catch (err) {
        console.error(err);
        if (statusEl) statusEl.textContent = err?.message || "Speichern fehlgeschlagen.";
      }
    });

    // Offers enabled toggle (stored on public/meta, currently not used by guest)
    $("offersEnabledToggle")?.addEventListener("change", async () => {
      const rid = currentRestaurantId || offersSel?.value;
      if (!rid) return;
      const enabled = $("offersEnabledToggle").checked;
      try {
        await setDoc(doc(db, "restaurants", rid, "public", "meta"), { offersEnabled: enabled, updatedAt: serverTimestamp() }, { merge: true });
        setText("offersStatus", enabled ? "Offers aktiviert." : "Offers deaktiviert.");
      } catch (err) {
        console.error(err);
        setText("offersStatus", err?.message || "Toggle fehlgeschlagen.");
      }
    });

    // Leads placeholders
    setText("leadsMeta", "Demo – später.");
  });


// URL → open a specific view (used by menu pages): ?view=customers|offers|...
try {
  const params = new URLSearchParams(window.location.search || "");
  const view = params.get("view");
  if (view) nav.showView(view);
} catch (e) {
  // ignore
}

}
