import { db, auth } from "@shared/firebase-config.js";
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const $ = (id) => document.getElementById(id);

// --- DOM ---
const userLine = $("userLine");
const loginBox = $("loginBox");
const appBox = $("appBox");
const loginMsg = $("loginMsg");
const createMsg = $("createMsg");

const logoutBtn = $("logoutBtn");
const loginBtn = $("loginBtn");
const emailInp = $("emailInp");
const passInp = $("passInp");

const nameInp = $("nameInp");
const typeSel = $("typeSel");
const tablesInp = $("tablesInp");
const slugInp = $("slugInp");
const createBtn = $("createBtn");
const customersEl = $("customers");

// --- URL builder ---
function projectRoot(){
  const href = window.location.href;
  const idx = href.indexOf("/apps/");
  if (idx !== -1) return href.slice(0, idx + 1);
  return href.replace(/dashboard\.html.*$/,"");
}

function buildLinks(rid, tableId){
  const root = projectRoot();
  const qR = `?r=${encodeURIComponent(rid)}`;
  const qT = tableId ? `?r=${encodeURIComponent(rid)}&t=${encodeURIComponent(tableId)}` : qR;
  return {
    main: `${root}apps/menyra-restaurants/main/index.html${qR}`,
    karte: `${root}apps/menyra-restaurants/guest/karte/index.html${qT}`,
    story: `${root}apps/menyra-restaurants/guest/story/index.html${qR}`,
    owner: `${root}apps/menyra-restaurants/owner/index.html${qR}`
  };
}

// --- UI helpers ---
function renderCustomerCard(c){
  const links = buildLinks(c.id, 1);
  const div = document.createElement("div");
  div.className = "card";
  div.style.padding = "14px";
  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>
        <div style="font-weight:800">${c.name || "(ohne Name)"}</div>
        <div class="muted">id: ${c.id} · type: ${c.type || "?"} · tables: ${c.tableCount ?? "-"}</div>
        <div class="muted">createdBy: ${c.createdBy || "-"}</div>
      </div>
      <div class="row">
        <a class="btn" href="${links.main}" target="_blank">Main</a>
        <a class="btn" href="${links.karte}" target="_blank">Karte</a>
        <a class="btn" href="${links.owner}" target="_blank">Owner</a>
      </div>
    </div>
    <div class="sep"></div>
    <div class="row">
      <button class="btn" data-copy="${links.main}">Copy Main</button>
      <button class="btn" data-copy="${links.karte}">Copy QR Link (Tisch 1)</button>
      <button class="btn" data-qr="${links.karte}">QR (Tisch 1)</button>
    </div>
    <div class="row" style="margin-top:10px">
      <canvas width="160" height="160" style="display:none;border-radius:12px;border:1px solid var(--border)" data-qr-canvas></canvas>
      <img style="display:none;width:160px;height:160px;border-radius:12px;border:1px solid var(--border)" data-qr-img />
    </div>
  `;

  div.addEventListener("click", async (e)=>{
    const t = e.target;
    if (t?.dataset?.copy) {
      await navigator.clipboard.writeText(t.dataset.copy);
      const old = t.textContent;
      t.textContent = "Copied!";
      setTimeout(()=> t.textContent = old, 900);
    }
    if (t?.dataset?.qr) {
      const url = t.dataset.qr;
      const canvas = div.querySelector("[data-qr-canvas]");
      const img = div.querySelector("[data-qr-img]");
      try {
        canvas.style.display = "block";
        img.style.display = "none";
        if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
          await window.QRCode.toCanvas(canvas, url, { margin: 1, width: 160 });
        } else if (window.qrcode && typeof window.qrcode.toCanvas === "function") {
          await window.qrcode.toCanvas(canvas, url, { margin: 1, width: 160 });
        } else {
          throw new Error("No QR lib");
        }
      } catch(_) {
        canvas.style.display = "none";
        img.style.display = "block";
        img.src = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" + encodeURIComponent(url);
      }
    }
  });

  return div;
}

function setLoggedInUI(user){
  loginBox.style.display = user ? "none" : "grid";
  appBox.style.display = user ? "block" : "none";
  userLine.textContent = user ? `eingeloggt: ${user.email} (${user.uid})` : "nicht eingeloggt";
}

// --- Auth actions ---
async function doLogin(){
  loginMsg.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, emailInp.value.trim(), passInp.value);
  } catch (e) {
    loginMsg.textContent = e?.message || String(e);
  }
}

async function doLogout(){
  await signOut(auth);
}

// --- Create customer (restaurants + public/meta + tables) ---
async function createCustomer(){
  createMsg.textContent = "";
  const user = auth.currentUser;
  if (!user) { createMsg.textContent = "Bitte einloggen."; return; }

  const name = nameInp.value.trim();
  const type = typeSel.value;
  const tableCount = Math.max(0, parseInt(tablesInp.value || "0", 10) || 0);
  const slug = slugInp.value.trim() || null;

  createBtn.disabled = true;
  createMsg.textContent = "Erstelle…";

  try {
    const docRef = await addDoc(collection(db, "restaurants"), {
      name,
      type,
      status: "active",
      tableCount,
      slug,
      createdBy: user.uid,
      createdByRole: "ceo",
      createdAt: Date.now()
    });

    await setDoc(doc(db, "restaurants", docRef.id, "public", "meta"), {
      name, type, slug, createdAt: Date.now()
    }, { merge: true });

    const batch = writeBatch(db);
    for (let i=1; i<=tableCount; i++){
      batch.set(doc(db, "restaurants", docRef.id, "tables", String(i)), {
        label: `Tisch ${i}`,
        tableId: String(i),
        createdAt: Date.now()
      }, { merge: true });
    }
    await batch.commit();

    createMsg.textContent = `Fertig! restaurantId: ${docRef.id}`;
    nameInp.value = "";
    slugInp.value = "";
  } catch (e) {
    createMsg.textContent = e?.message || String(e);
  } finally {
    createBtn.disabled = false;
  }
}

// --- events ---
loginBtn.addEventListener("click", doLogin);
logoutBtn.addEventListener("click", doLogout);
createBtn.addEventListener("click", createCustomer);

// --- subscribe list (CEO = all) ---
let unsub = null;
onAuthStateChanged(auth, (user)=>{
  setLoggedInUI(user);
  if (unsub) { unsub(); unsub = null; }
  if (!user) return;

  const q = query(collection(db, "restaurants"), orderBy("createdAt", "desc"));
  unsub = onSnapshot(q, (snap)=>{
    customersEl.innerHTML = "";
    snap.forEach((d)=> customersEl.appendChild(renderCustomerCard({ id:d.id, ...d.data() })));
    if (!snap.size) customersEl.innerHTML = "<div class='muted'>Noch keine Kunden.</div>";
  });
});
