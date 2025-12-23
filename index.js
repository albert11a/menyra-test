import { db, auth } from "./shared/firebase-config.js";
import {
  collection, query, orderBy, limit, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const $ = (id) => document.getElementById(id);

// --------------------------
// DOM
// --------------------------
const subLine = $("subLine");
const loginBox = $("loginBox");
const loginBtn = $("loginBtn");
const logoutBtn = $("logoutBtn");
const emailInp = $("emailInp");
const passInp = $("passInp");
const loginMsg = $("loginMsg");
const userLine = $("userLine");

const customerSel = $("customerSel");
const customerMeta = $("customerMeta");
const searchInp = $("searchInp");

const ridInp = $("rid");
const tidInp = $("tid");
const goBtn = $("go");
const linksEl = $("links");

// --------------------------
// URL builder
// --------------------------
function projectRoot(){
  const href = window.location.href;
  const idx = href.indexOf("/apps/");
  if (idx !== -1) return href.slice(0, idx + 1);
  return href.replace(/index\.html.*$/,"");
}

function buildLinks(rid, tid){
  const root = projectRoot();
  const qR = `?r=${encodeURIComponent(rid)}`;
  const qG = tid ? `?r=${encodeURIComponent(rid)}&t=${encodeURIComponent(tid)}` : qR;

  return {
    main: `${root}apps/menyra-restaurants/main/index.html${qR}`,
    karte: `${root}apps/menyra-restaurants/guest/karte/index.html${qG}`,
    detajet: `${root}apps/menyra-restaurants/guest/detajet/index.html${qG}&item=DEMO_ITEM_ID`,
    porosia: `${root}apps/menyra-restaurants/guest/porosia/index.html${qG}`,
    story: `${root}apps/menyra-restaurants/guest/story/index.html${qR}`,
    owner: `${root}apps/menyra-restaurants/owner/index.html${qR}`,
    waiter: `${root}apps/menyra-restaurants/waiter/index.html${qR}`,
    kitchen: `${root}apps/menyra-restaurants/kitchen/index.html${qR}`,
    ceo: `${root}apps/menyra-ceo/dashboard.html`,
    staff: `${root}apps/menyra-staff/dashboard.html`
  };
}

function renderLinks(){
  const rid = ridInp.value.trim();
  const tid = tidInp.value.trim();
  if(!rid){
    linksEl.innerHTML = "<div class='muted'>Bitte Kunde auswählen oder restaurantId eingeben.</div>";
    return;
  }
  const L = buildLinks(rid, tid);
  linksEl.innerHTML = `
    <div class="sep"></div>
    <div class="h2">System 1 – ${rid}${tid ? ` (Table ${tid})` : ""}</div>
    <div class="row">
      <a class="btn primary" href="${L.main}" target="_blank">Main</a>
      <a class="btn" href="${L.karte}" target="_blank">Karte</a>
      <a class="btn" href="${L.detajet}" target="_blank">Details</a>
      <a class="btn" href="${L.porosia}" target="_blank">Porosia</a>
      <a class="btn" href="${L.story}" target="_blank">Story</a>
    </div>
    <div class="row">
      <a class="btn" href="${L.owner}" target="_blank">Owner</a>
      <a class="btn" href="${L.waiter}" target="_blank">Waiter</a>
      <a class="btn" href="${L.kitchen}" target="_blank">Kitchen</a>
    </div>
    <div class="h2" style="margin-top:16px">Platform</div>
    <div class="row">
      <a class="btn" href="${L.ceo}" target="_blank">CEO</a>
      <a class="btn" href="${L.staff}" target="_blank">Staff</a>
    </div>
    <div class="muted" style="margin-top:10px">Details-Link nutzt item=DEMO_ITEM_ID (Dummy).</div>
  `;
}

// --------------------------
// Auth
// --------------------------
async function doLogin(){
  loginMsg.textContent = "";
  try{
    await signInWithEmailAndPassword(auth, emailInp.value.trim(), passInp.value);
  }catch(e){
    loginMsg.textContent = e?.message || String(e);
  }
}
async function doLogout(){ await signOut(auth); }

loginBtn.addEventListener("click", doLogin);
logoutBtn.addEventListener("click", doLogout);
goBtn.addEventListener("click", renderLinks);

// --------------------------
// Customer list (Firestore)
// --------------------------
let allCustomers = [];
let unsubCustomers = null;

function setCustomerOptions(list){
  const q = (searchInp.value || "").trim().toLowerCase();
  const filtered = q
    ? list.filter(x =>
        (x.name||"").toLowerCase().includes(q) ||
        x.id.toLowerCase().includes(q) ||
        (x.type||"").toLowerCase().includes(q)
      )
    : list;

  // keep selection if still present
  const prev = customerSel.value;

  customerSel.innerHTML = '<option value="">— bitte wählen —</option>';
  for (const c of filtered){
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name || "(ohne Name)"} · ${c.type || "?"} · ${c.id}`;
    customerSel.appendChild(opt);
  }

  // restore selection
  if (prev && filtered.some(x => x.id === prev)) customerSel.value = prev;
}

function updateSelectedMeta(){
  const id = customerSel.value;
  const c = allCustomers.find(x => x.id === id);
  if(!c){
    customerMeta.textContent = "—";
    return;
  }
  customerMeta.textContent = `Typ: ${c.type || "?"} · Tische: ${c.tableCount ?? "-"} · Status: ${c.status || "-"}`;
}

customerSel.addEventListener("change", ()=>{
  const id = customerSel.value;
  ridInp.value = id || "";
  updateSelectedMeta();
  renderLinks();
});

searchInp.addEventListener("input", ()=> setCustomerOptions(allCustomers));

onAuthStateChanged(auth, (user)=>{
  userLine.textContent = user ? `eingeloggt: ${user.email}` : "nicht eingeloggt";
  loginBox.style.display = user ? "none" : "grid";
  subLine.textContent = user ? "Kunden auswählen → Links testen." : "Login → Kunden auswählen → Links testen.";

  if (unsubCustomers){ unsubCustomers(); unsubCustomers = null; }
  allCustomers = [];
  customerSel.innerHTML = user ? '<option value="">— lädt… —</option>' : '<option value="">— bitte zuerst login —</option>';
  customerMeta.textContent = "—";

  if(!user) return;

  // Cost-conscious: limit list. Increase later if needed.
  const q = query(collection(db, "restaurants"), orderBy("createdAt", "desc"), limit(250));
  unsubCustomers = onSnapshot(q, (snap)=>{
    allCustomers = [];
    snap.forEach(d => allCustomers.push({ id: d.id, ...d.data() }));
    setCustomerOptions(allCustomers);
    updateSelectedMeta();
  }, (err)=>{
    customerSel.innerHTML = '<option value="">— Fehler beim Laden —</option>';
    customerMeta.textContent = err?.message || String(err);
  });
});

// initial
renderLinks();
