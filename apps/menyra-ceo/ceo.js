import { db, auth } from "@shared/firebase-config.js";
import {
  collection, query, where, getDocs, addDoc, doc, setDoc, writeBatch,
  updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// =========================================================
// ABSCHNITT 1 — DOM & STATE
// =========================================================
const $ = (id) => document.getElementById(id);

const body = document.body;
const sidebarNav = $("sidebarNav");
const views = Array.from(document.querySelectorAll(".m-view[data-view]"));

const burgerToggle = $("burgerToggle");
const mobileMenu = $("mobileMenu");
const logoutButton = $("logoutButton");

const themeToggle = $("themeToggle");
const profileName = $("profileName");

const topSearch = $("topSearch");

// Customers UI
const customersTotalBadge = $("customersTotalBadge");
const customersSearch = $("customersSearch");
const customersActiveOnly = $("customersActiveOnly");
const customersTableBody = $("customersTableBody");
const customersFooter = $("customersFooter");

const customerNewBtn = $("customerNewBtn");
const customerModalOverlay = $("customerModalOverlay");
const customerModalClose = $("customerModalClose");
const customerForm = $("customerForm");
const customerModalTitle = $("customerModalTitle");
const customerModalStatus = $("customerModalStatus");

const customerName = $("customerName");
const customerType = $("customerType");
const customerTables = $("customerTables");
const customerSlug = $("customerSlug");

// QR modal
const qrModalOverlay = $("qrModalOverlay");
const qrModalClose = $("qrModalClose");
const qrModalTitle = $("qrModalTitle");
const qrModalStatus = $("qrModalStatus");
const qrCodesBox = $("qrCodesBox");
const copyGuestTemplateBtn = $("copyGuestTemplateBtn");
const copyCodesBtn = $("copyCodesBtn");

// Offers UI
const offersRestaurantSelect = $("offersRestaurantSelect");
const offersSelectedBadge = $("offersSelectedBadge");
const offersStatus = $("offersStatus");
const offersTableBody = $("offersTableBody");
const offerNewBtn = $("offerNewBtn");

const offerEditorCard = $("offerEditorCard");
const offerEditorTitle = $("offerEditorTitle");
const offerEditorStatus = $("offerEditorStatus");
const offerTitle = $("offerTitle");
const offerPrice = $("offerPrice");
const offerImageUrl = $("offerImageUrl");
const offerDesc = $("offerDesc");
const offerActive = $("offerActive");
const offerCancelBtn = $("offerCancelBtn");
const offerSaveBtn = $("offerSaveBtn");

// Auth modal
const authModalOverlay = $("authModalOverlay");
const authModalClose = $("authModalClose");
const authForm = $("authForm");
const authEmail = $("authEmail");
const authPass = $("authPass");
const authStatus = $("authStatus");

const state = {
  user: null,
  view: "dashboard",
  customers: [],
  customersFiltered: [],
  offersByRestaurant: new Map(),
  selectedRestaurantId: null,
  editingOffer: null,
};

// =========================================================
// ABSCHNITT 2 — THEME / UI HELPERS
// =========================================================
const THEME_KEY = "menyra_admin_theme";

function setTheme(theme){
  body.classList.remove("theme-dark", "theme-light");
  body.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  try { localStorage.setItem(THEME_KEY, theme); } catch(_) {}
  if (themeToggle) themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function initTheme(){
  let saved = "light";
  try { saved = localStorage.getItem(THEME_KEY) || "light"; } catch(_) {}
  setTheme(saved);
}

function openMobileMenu(){
  if (!mobileMenu) return;
  mobileMenu.style.display = "block";
  mobileMenu.classList.add("is-open");
}
function closeMobileMenu(){
  if (!mobileMenu) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.style.display = "none";
}

function showView(viewName){
  state.view = viewName;
  views.forEach(v => {
    v.style.display = (v.dataset.view === viewName) ? "block" : "none";
  });
  if (sidebarNav){
    const links = Array.from(sidebarNav.querySelectorAll("a[data-section]"));
    links.forEach(a => a.classList.toggle("is-active", a.dataset.section === viewName));
  }
  // URL hash (kein reload)
  try { history.replaceState(null, "", "#" + viewName); } catch(_) {}
}

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function fmtDate(ts){
  if (!ts) return "–";
  try {
    const d = new Date(ts);
    return d.toLocaleDateString("de-AT", { year:"2-digit", month:"2-digit", day:"2-digit" });
  } catch(_) { return "–"; }
}

function projectRoot(){
  return window.location.origin; // Live-Server / Hosting
}

function buildLinks(restaurantId){
  const root = projectRoot();
  const base = `${root}/apps/menyra-restaurants`;
  return {
    owner: `${base}/owner/index.html?r=${encodeURIComponent(restaurantId)}`,
    waiter: `${base}/waiter/index.html?r=${encodeURIComponent(restaurantId)}`,
    kitchen: `${base}/kitchen/index.html?r=${encodeURIComponent(restaurantId)}`,
    // Guest: table template
    guestTemplate: `${base}/guest/karte/index.html?r=${encodeURIComponent(restaurantId)}&t={TABLE}`,
    guestTable: (t) => `${base}/guest/karte/index.html?r=${encodeURIComponent(restaurantId)}&t=${encodeURIComponent(String(t))}`,
    story: `${base}/guest/story/index.html?r=${encodeURIComponent(restaurantId)}`,
  };
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  } catch(_){
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return true;
  }
}

// =========================================================
// ABSCHNITT 3 — AUTH (CEO)
// =========================================================
function openAuthModal(){
  if (!authModalOverlay) return;
  authModalOverlay.style.display = "flex";
  if (authStatus) authStatus.textContent = "";
  if (authEmail) authEmail.focus();
}

function closeAuthModal(){
  if (!authModalOverlay) return;
  authModalOverlay.style.display = "none";
}

async function doLogin(email, pass){
  if (authStatus) authStatus.textContent = "Login…";
  try{
    await signInWithEmailAndPassword(auth, email, pass);
    if (authStatus) authStatus.textContent = "✅ Eingeloggt";
    closeAuthModal();
  } catch(e){
    if (authStatus) authStatus.textContent = e?.message || String(e);
  }
}

async function doLogout(){
  try{
    await signOut(auth);
  } catch(_){}
}

// =========================================================
// ABSCHNITT 4 — CUSTOMERS (Load / Render / Create)
// =========================================================
function applyCustomersFilter(){
  const q = (customersSearch?.value || topSearch?.value || "").trim().toLowerCase();
  const activeOnly = !!customersActiveOnly?.checked;

  let arr = Array.isArray(state.customers) ? [...state.customers] : [];

  if (activeOnly){
    arr = arr.filter(c => (c.status || "active") === "active");
  }
  if (q){
    arr = arr.filter(c => {
      const hay = `${c.name||""} ${c.type||""} ${c.slug||""} ${c.id||""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // newest first (createdAt desc)
  arr.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));

  state.customersFiltered = arr;
  renderCustomers();
}

function renderCustomers(){
  if (!customersTableBody) return;

  customersTableBody.innerHTML = "";
  const arr = state.customersFiltered || [];
  if (customersTotalBadge) customersTotalBadge.textContent = String(arr.length);
  if (customersFooter) customersFooter.textContent = arr.length ? `${arr.length} Kunden` : "—";

  arr.forEach((c)=>{
    const links = buildLinks(c.id);

    const row = document.createElement("div");
    row.className = "m-table-row";

    const tables = Number(c.tableCount || 0);
    const type = c.type || "—";
    const status = c.status || "active";

    row.innerHTML = `
      <div class="m-strong">${escapeHtml(c.name || "—")}</div>
      <div>${escapeHtml(String(tables))}</div>
      <div class="m-badge">${escapeHtml(type)}</div>
      <div class="m-badge ${status === "active" ? "m-badge--g" : "m-badge--y"}">${escapeHtml(status)}</div>
      <div class="m-mono">${escapeHtml(c.id)}</div>
      <div class="m-table-actions">
        <button class="btn btn-ghost btn-small" data-act="qr" data-id="${escapeHtml(c.id)}">QR</button>
        <a class="btn btn-ghost btn-small" href="${links.owner}" target="_blank" rel="noopener">Owner</a>
        <a class="btn btn-ghost btn-small" href="${links.waiter}" target="_blank" rel="noopener">Waiter</a>
        <a class="btn btn-ghost btn-small" href="${links.kitchen}" target="_blank" rel="noopener">Kitchen</a>
      </div>
    `;
    customersTableBody.appendChild(row);
  });
}

async function loadCustomers(){
  if (!state.user) return;
  if (customersTableBody) customersTableBody.innerHTML = `<div class="m-muted">Lade Kunden…</div>`;

  try{
    const snap = await getDocs(collection(db, "restaurants"));
    const list = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    state.customers = list;
    // Fill offers restaurant select
    fillOffersRestaurantSelect(list);
    // dashboard stats
    renderDashboardStats();
    applyCustomersFilter();
  } catch(e){
    if (customersTableBody) customersTableBody.innerHTML = `<div class="m-muted">${escapeHtml(e?.message || String(e))}</div>`;
  }
}

function openCustomerModal(){
  if (!customerModalOverlay) return;
  customerModalOverlay.style.display = "flex";
  if (customerModalStatus) customerModalStatus.textContent = "";
  if (customerModalTitle) customerModalTitle.textContent = "Neuer Kunde";
  if (customerName) customerName.value = "";
  if (customerSlug) customerSlug.value = "";
  if (customerTables) customerTables.value = "0";
  if (customerType) customerType.value = "cafe";
  customerName?.focus();
}

function closeCustomerModal(){
  if (!customerModalOverlay) return;
  customerModalOverlay.style.display = "none";
}

async function createCustomer(){
  if (!state.user){
    if (customerModalStatus) customerModalStatus.textContent = "Bitte einloggen.";
    return;
  }
  const name = (customerName?.value || "").trim();
  const type = (customerType?.value || "cafe").trim();
  const tableCount = Math.max(0, parseInt(customerTables?.value || "0", 10) || 0);
  const slug = ((customerSlug?.value || "").trim()) || null;

  if (!name){
    if (customerModalStatus) customerModalStatus.textContent = "Name fehlt.";
    return;
  }

  if (customerModalStatus) customerModalStatus.textContent = "Erstelle…";

  try{
    const docRef = await addDoc(collection(db, "restaurants"), {
      name,
      type,
      status: "active",
      tableCount,
      slug,
      createdBy: state.user.uid,
      createdByRole: "ceo",
      createdAt: Date.now()
    });

    await setDoc(doc(db, "restaurants", docRef.id, "public", "meta"), {
      name, type, slug, createdAt: Date.now()
    }, { merge: true });

    // Create table docs in batch (cheap writes, no reads)
    const batch = writeBatch(db);
    for (let i=1; i<=tableCount; i++){
      batch.set(doc(db, "restaurants", docRef.id, "tables", String(i)), {
        label: `Tisch ${i}`,
        tableId: String(i),
        createdAt: Date.now()
      }, { merge: true });
    }
    await batch.commit();

    if (customerModalStatus) customerModalStatus.textContent = `✅ Fertig: ${docRef.id}`;
    closeCustomerModal();
    await loadCustomers();
  } catch(e){
    if (customerModalStatus) customerModalStatus.textContent = e?.message || String(e);
  }
}

// =========================================================
// ABSCHNITT 5 — QR / LINKS MODAL
// =========================================================
function openQrModal(restaurantId){
  const c = state.customers.find(x => x.id === restaurantId);
  if (!c) return;

  state.selectedRestaurantId = restaurantId;

  const links = buildLinks(restaurantId);
  const tables = Math.max(0, parseInt(c.tableCount || "0", 10) || 0);

  if (qrModalTitle) qrModalTitle.textContent = `QR & Links — ${c.name || restaurantId}`;
  if (qrModalStatus) qrModalStatus.textContent = "";
  if (qrCodesBox) qrCodesBox.innerHTML = "";

  // Template
  const tpl = links.guestTemplate;

  const wrapper = document.createElement("div");
  wrapper.className = "m-qr-grid";
  wrapper.innerHTML = `
    <div class="m-card">
      <div class="m-card-title">Guest Template</div>
      <div class="m-mono" style="word-break:break-all">${escapeHtml(tpl)}</div>
    </div>

    <div class="m-card">
      <div class="m-card-title">Owner / Waiter / Kitchen</div>
      <div class="m-mono" style="word-break:break-all">Owner: ${escapeHtml(links.owner)}</div>
      <div class="m-mono" style="word-break:break-all">Waiter: ${escapeHtml(links.waiter)}</div>
      <div class="m-mono" style="word-break:break-all">Kitchen: ${escapeHtml(links.kitchen)}</div>
    </div>
  `;
  qrCodesBox?.appendChild(wrapper);

  // Table list + QR canvases
  const list = document.createElement("div");
  list.className = "m-qr-list";

  for (let i=1; i<=tables; i++){
    const url = links.guestTable(i);
    const item = document.createElement("div");
    item.className = "m-qr-item";
    item.innerHTML = `
      <div class="m-qr-left">
        <div class="m-strong">Tisch ${i}</div>
        <div class="m-mono m-qr-url">${escapeHtml(url)}</div>
        <button class="btn btn-ghost btn-small" data-copy-url="${escapeHtml(url)}">Copy Link</button>
      </div>
      <canvas class="m-qr-canvas" width="128" height="128"></canvas>
    `;

    const canvas = item.querySelector("canvas");
    if (canvas && window.QRCode){
      try{
        window.QRCode.toCanvas(canvas, url, { width: 128, margin: 1 }, (err)=>{
          if (err && qrModalStatus) qrModalStatus.textContent = "QR Fehler: " + err.message;
        });
      } catch(_){}
    }
    list.appendChild(item);
  }

  if (!tables){
    const empty = document.createElement("div");
    empty.className = "m-muted";
    empty.textContent = "Keine Tische gesetzt. (Du kannst später bearbeiten.)";
    list.appendChild(empty);
  }

  qrCodesBox?.appendChild(list);

  if (qrModalOverlay) qrModalOverlay.style.display = "flex";

  // Copy buttons
  if (copyGuestTemplateBtn){
    copyGuestTemplateBtn.onclick = async ()=>{
      await copyToClipboard(tpl);
      if (qrModalStatus) qrModalStatus.textContent = "✅ Template kopiert";
    };
  }

  if (copyCodesBtn){
    copyCodesBtn.onclick = async ()=>{
      // Copy all table links
      const lines = [];
      for (let i=1; i<=tables; i++){
        lines.push(`Tisch ${i}: ${links.guestTable(i)}`);
      }
      await copyToClipboard(lines.join("\n") || tpl);
      if (qrModalStatus) qrModalStatus.textContent = "✅ Links kopiert";
    };
  }
}

function closeQrModal(){
  if (!qrModalOverlay) return;
  qrModalOverlay.style.display = "none";
}

// =========================================================
// ABSCHNITT 6 — OFFERS (Load / CRUD, on demand)
// =========================================================
function fillOffersRestaurantSelect(customers){
  if (!offersRestaurantSelect) return;
  offersRestaurantSelect.innerHTML = `<option value="">— Restaurant auswählen —</option>`;
  const sorted = [...customers].sort((a,b)=> String(a.name||"").localeCompare(String(b.name||""), "de"));
  sorted.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name || c.id} (${c.type || "—"})`;
    offersRestaurantSelect.appendChild(opt);
  });
}

async function loadOffersFor(restaurantId){
  if (!restaurantId) return;
  offersStatus && (offersStatus.textContent = "Lade Offers…");

  try{
    const snap = await getDocs(collection(db, "restaurants", restaurantId, "offers"));
    const list=[];
    snap.forEach(d => list.push({ id:d.id, ...d.data() }));
    // sort newest first
    list.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
    state.offersByRestaurant.set(restaurantId, list);
    renderOffersTable();
    offersStatus && (offersStatus.textContent = list.length ? "—" : "Noch keine Offers.");
    renderDashboardStats();
  } catch(e){
    offersStatus && (offersStatus.textContent = e?.message || String(e));
  }
}

function renderOffersTable(){
  if (!offersTableBody) return;
  const rid = state.selectedRestaurantId;
  const list = state.offersByRestaurant.get(rid) || [];
  offersTableBody.innerHTML = "";

  list.forEach(o=>{
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.innerHTML = `
      <div class="m-strong">${escapeHtml(o.title || "—")}</div>
      <div>${escapeHtml(String(o.price ?? "—"))}</div>
      <div class="m-badge">${o.active ? "active" : "off"}</div>
      <div class="m-mono">${escapeHtml(fmtDate(o.createdAt))}</div>
      <div class="m-mono">${escapeHtml(o.id)}</div>
      <div class="m-table-actions">
        <button class="btn btn-ghost btn-small" data-offer-act="edit" data-id="${escapeHtml(o.id)}">Edit</button>
        <button class="btn btn-ghost btn-small" data-offer-act="toggle" data-id="${escapeHtml(o.id)}">${o.active ? "Off" : "On"}</button>
        <button class="btn btn-danger btn-small" data-offer-act="del" data-id="${escapeHtml(o.id)}">Del</button>
      </div>
    `;
    offersTableBody.appendChild(row);
  });

  if (!list.length){
    offersTableBody.innerHTML = `<div class="m-muted">Noch keine Offers.</div>`;
  }
}

function openOfferEditor(offer){
  state.editingOffer = offer || { id:null, title:"", price:"", imageUrl:"", desc:"", active:true };
  if (offerEditorCard) offerEditorCard.style.display = "block";
  if (offerEditorTitle) offerEditorTitle.textContent = offer?.id ? "Offer bearbeiten" : "Neue Offer";
  if (offerEditorStatus) offerEditorStatus.textContent = "";
  if (offerTitle) offerTitle.value = state.editingOffer.title || "";
  if (offerPrice) offerPrice.value = state.editingOffer.price ?? "";
  if (offerImageUrl) offerImageUrl.value = state.editingOffer.imageUrl || "";
  if (offerDesc) offerDesc.value = state.editingOffer.desc || "";
  if (offerActive) offerActive.checked = !!state.editingOffer.active;
}

function closeOfferEditor(){
  state.editingOffer = null;
  if (offerEditorCard) offerEditorCard.style.display = "none";
}

async function saveOffer(){
  const rid = state.selectedRestaurantId;
  if (!rid){
    offerEditorStatus && (offerEditorStatus.textContent = "Bitte Restaurant auswählen.");
    return;
  }

  const title = (offerTitle?.value || "").trim();
  const priceRaw = (offerPrice?.value || "").trim();
  const imageUrl = (offerImageUrl?.value || "").trim();
  const desc = (offerDesc?.value || "").trim();
  const active = !!offerActive?.checked;

  if (!title){
    offerEditorStatus && (offerEditorStatus.textContent = "Titel fehlt.");
    return;
  }

  offerSaveBtn && (offerSaveBtn.disabled = true);
  offerEditorStatus && (offerEditorStatus.textContent = "Speichere…");

  try{
    const list = state.offersByRestaurant.get(rid) || [];
    const editing = state.editingOffer || { id:null };

    if (!editing.id){
      await addDoc(collection(db, "restaurants", rid, "offers"), {
        title,
        price: priceRaw ? Number(priceRaw) : null,
        imageUrl: imageUrl || null,
        desc: desc || null,
        active,
        createdAt: Date.now()
      });
    } else {
      await updateDoc(doc(db, "restaurants", rid, "offers", editing.id), {
        title,
        price: priceRaw ? Number(priceRaw) : null,
        imageUrl: imageUrl || null,
        desc: desc || null,
        active,
        updatedAt: Date.now()
      });
    }

    closeOfferEditor();
    await loadOffersFor(rid);
  } catch(e){
    offerEditorStatus && (offerEditorStatus.textContent = e?.message || String(e));
  } finally {
    offerSaveBtn && (offerSaveBtn.disabled = false);
  }
}

async function deleteOffer(offerId){
  const rid = state.selectedRestaurantId;
  if (!rid) return;
  if (!confirm("Offer wirklich löschen?")) return;
  try{
    await deleteDoc(doc(db, "restaurants", rid, "offers", offerId));
    await loadOffersFor(rid);
  } catch(e){
    offersStatus && (offersStatus.textContent = e?.message || String(e));
  }
}

async function toggleOffer(offerId){
  const rid = state.selectedRestaurantId;
  if (!rid) return;
  const list = state.offersByRestaurant.get(rid) || [];
  const offer = list.find(o=>o.id===offerId);
  if (!offer) return;
  try{
    await updateDoc(doc(db, "restaurants", rid, "offers", offerId), {
      active: !offer.active,
      updatedAt: Date.now()
    });
    await loadOffersFor(rid);
  } catch(e){
    offersStatus && (offersStatus.textContent = e?.message || String(e));
  }
}

// =========================================================
// ABSCHNITT 7 — DASHBOARD STATS
// =========================================================
function renderDashboardStats(){
  const activeCustomersEl = $("activeCustomers");
  const openLeadsEl = $("openLeads"); // we repurpose to active offers count
  const totalCustomersEl = $("totalCustomers");
  const totalLeadsEl = $("totalLeads"); // repurpose to total tables

  const customers = Array.isArray(state.customers) ? state.customers : [];
  const activeCustomers = customers.filter(c => (c.status||"active") === "active");

  let totalTables = 0;
  activeCustomers.forEach(c => totalTables += Number(c.tableCount||0));

  // offers count (active) from cached offers if selected; else 0
  let activeOffers = 0;
  for (const [, list] of state.offersByRestaurant.entries()){
    activeOffers += (list || []).filter(o=>!!o.active).length;
  }

  if (activeCustomersEl) activeCustomersEl.textContent = String(activeCustomers.length);
  if (totalCustomersEl) totalCustomersEl.textContent = String(customers.length);
  if (totalTablesEl) totalTablesEl.textContent = String(totalTables);
  if (openLeadsEl) openLeadsEl.textContent = String(activeOffers);
}

// =========================================================
// ABSCHNITT 8 — EVENTS / INIT
// =========================================================
function wireEvents(){
  initTheme();

  // Theme toggle
  if (themeToggle){
    themeToggle.addEventListener("click", ()=>{
      const isDark = body.classList.contains("theme-dark");
      setTheme(isDark ? "light" : "dark");
    });
  }

  // Burger
  if (burgerToggle){
    burgerToggle.addEventListener("click", ()=>{
      if (!mobileMenu) return;
      if (mobileMenu.classList.contains("is-open")) closeMobileMenu();
      else openMobileMenu();
    });
  }
  // close mobile menu on click outside
  document.addEventListener("click", (e)=>{
    if (!mobileMenu || !mobileMenu.classList.contains("is-open")) return;
    if (mobileMenu.contains(e.target) || burgerToggle?.contains(e.target)) return;
    closeMobileMenu();
  }, { passive:true });

  // Nav routing
  if (sidebarNav){
    sidebarNav.addEventListener("click", (e)=>{
      const a = e.target.closest("a[data-section]");
      if (!a) return;
      e.preventDefault();
      const section = a.dataset.section;
      if (!section) return;
      showView(section);
      closeMobileMenu();
      if (section === "offers" && state.selectedRestaurantId) loadOffersFor(state.selectedRestaurantId);
    });
  }

  // Search
  const onSearch = ()=> applyCustomersFilter();
  customersSearch?.addEventListener("input", onSearch, { passive:true });
  topSearch?.addEventListener("input", onSearch, { passive:true });
  customersActiveOnly?.addEventListener("change", onSearch);

  // New customer
  customerNewBtn?.addEventListener("click", openCustomerModal);
  customerModalClose?.addEventListener("click", closeCustomerModal);
  customerModalOverlay?.addEventListener("click", (e)=>{
    if (e.target === customerModalOverlay) closeCustomerModal();
  });

  customerForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    createCustomer();
  });

  // Customers actions
  customersTableBody?.addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    const id = btn.dataset.id;
    if (act === "qr") openQrModal(id);
  });

  // QR modal actions
  qrModalClose?.addEventListener("click", closeQrModal);
  qrModalOverlay?.addEventListener("click", (e)=>{
    if (e.target === qrModalOverlay) closeQrModal();
  });
  qrCodesBox?.addEventListener("click", async (e)=>{
    const b = e.target.closest("button[data-copy-url]");
    if (!b) return;
    const url = b.dataset.copyUrl;
    if (!url) return;
    await copyToClipboard(url);
    if (qrModalStatus) qrModalStatus.textContent = "✅ Link kopiert";
  });

  // Offers
  offersRestaurantSelect?.addEventListener("change", async ()=>{
    const rid = offersRestaurantSelect.value || "";
    state.selectedRestaurantId = rid || null;
    if (offersSelectedBadge) offersSelectedBadge.textContent = rid ? rid.slice(0, 8) : "—";
    if (rid){
      await loadOffersFor(rid);
    } else {
      offersTableBody && (offersTableBody.innerHTML = `<div class="m-muted">Bitte Restaurant auswählen.</div>`);
    }
  });

  offerNewBtn?.addEventListener("click", ()=> openOfferEditor(null));
  offerCancelBtn?.addEventListener("click", closeOfferEditor);
  offerSaveBtn?.addEventListener("click", (e)=>{ e.preventDefault(); saveOffer(); });

  offersTableBody?.addEventListener("click", (e)=>{
    const b = e.target.closest("button[data-offer-act]");
    if (!b) return;
    const act = b.dataset.offerAct;
    const id = b.dataset.id;
    const rid = state.selectedRestaurantId;
    const list = state.offersByRestaurant.get(rid) || [];
    const offer = list.find(o=>o.id===id);
    if (act === "edit") openOfferEditor(offer);
    if (act === "toggle") toggleOffer(id);
    if (act === "del") deleteOffer(id);
  });

  // Logout
  logoutButton?.addEventListener("click", doLogout);

  // Auth modal
  authModalClose?.addEventListener("click", ()=>{
    // allow close only if user logged in
    if (state.user) closeAuthModal();
  });
  authForm?.addEventListener("submit", (e)=>{
    e.preventDefault();
    doLogin((authEmail?.value||"").trim(), (authPass?.value||""));
  });
}

function initRouting(){
  const hash = (window.location.hash || "").replace("#","");
  const initial = hash && ["dashboard","customers","offers","leads"].includes(hash) ? hash : "dashboard";
  showView(initial);
}

function initAuth(){
  onAuthStateChanged(auth, async (user)=>{
    state.user = user || null;

    if (profileName) profileName.textContent = user ? (user.email || "User") : "—";

    if (!user){
      openAuthModal();
      // Clear sensitive UI
      state.customers = [];
      state.customersFiltered = [];
      state.offersByRestaurant.clear();
      customersTableBody && (customersTableBody.innerHTML = `<div class="m-muted">Bitte einloggen.</div>`);
      offersTableBody && (offersTableBody.innerHTML = `<div class="m-muted">Bitte einloggen.</div>`);
      renderDashboardStats();
      return;
    }

    closeAuthModal();
    await loadCustomers();
  });
}

(function init(){
  wireEvents();
  initRouting();
  initAuth();
})();
