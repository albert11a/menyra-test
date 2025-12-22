// =========================================================
// MENYRA Guest — Karte (Firestore live load + QuickNav)
// Goal of this step:
// - QR params (?r=restaurantId&t=tableId) work
// - Restaurant doc + featured offers load from Firestore
// - Story button opens Social Story page for this restaurant
// =========================================================

import { db, getQueryParam } from "../../shared/firebase-config.js";
import { BUNNY_IMAGES_CDN_HOST } from "../../shared/bunny-public.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// --- Defaults (for local demo / missing QR params) ---
const DEFAULT_RESTAURANT_ID = "prince-coffe-house-001";

const restaurantId = (getQueryParam("r") || DEFAULT_RESTAURANT_ID).trim();
const tableId = (getQueryParam("t") || "").trim();

// --- DOM ---
const elLogo = document.getElementById("restaurantLogo");
const elName = document.getElementById("restaurantName");
const elMeta = document.getElementById("restaurantMeta");
const offersSlider = document.getElementById("offersSlider");
const offersDots = document.getElementById("offersDots");

// QuickNav
const quickNav = document.getElementById("quickNav");
const langToggleBtn = document.getElementById("langToggleBtn");
const langBackBtn = document.getElementById("langBackBtn");
const langNextBtn = document.getElementById("langNextBtn");
const langPanel = document.getElementById("langPanel");
const langLabel = document.getElementById("langLabel");

const kamToggleBtn = document.getElementById("kamToggleBtn");
const kamBackBtn = document.getElementById("kamBackBtn");
const kamNextBtn = document.getElementById("kamNextBtn");
const kamPanel = document.getElementById("kamPanel");

const openStoryBtn = document.getElementById("openStoryBtn");
const openInfoBtn = document.getElementById("openInfoBtn");
const callWaiterOpt = document.getElementById("callWaiterOpt");
const payOpt = document.getElementById("payOpt");

function safeImgUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  // If someone stores only a path in Firestore, we prefix with our Bunny images CDN.
  const path = url.replace(/^\/+/, "");
  return `https://${BUNNY_IMAGES_CDN_HOST}/${path}`;
}

function setLangLabel(code) {
  const map = { de: "DE", en: "EN", sq: "SQ", sr: "SR", tr: "TR" };
  langLabel.textContent = map[code] || "Language";
}

function openLangPanel() {
  quickNav.classList.add("lang-open");
  langToggleBtn.setAttribute("aria-expanded", "true");
  langPanel.setAttribute("aria-hidden", "false");
}
function closeLangPanel() {
  quickNav.classList.remove("lang-open");
  langToggleBtn.setAttribute("aria-expanded", "false");
  langPanel.setAttribute("aria-hidden", "true");
}

function openKamPanel() {
  quickNav.classList.add("kam-open");
  kamToggleBtn.setAttribute("aria-expanded", "true");
  kamPanel.setAttribute("aria-hidden", "false");
}
function closeKamPanel() {
  quickNav.classList.remove("kam-open");
  kamToggleBtn.setAttribute("aria-expanded", "false");
  kamPanel.setAttribute("aria-hidden", "true");
}

function closeAllPanels() {
  closeLangPanel();
  closeKamPanel();
}

// --- QuickNav handlers ---
langToggleBtn.addEventListener("click", () => {
  if (quickNav.classList.contains("lang-open")) closeLangPanel();
  else {
    closeKamPanel();
    openLangPanel();
  }
});

kamToggleBtn.addEventListener("click", () => {
  if (quickNav.classList.contains("kam-open")) closeKamPanel();
  else {
    closeLangPanel();
    openKamPanel();
  }
});

[langBackBtn, langNextBtn].forEach((b) => b.addEventListener("click", closeLangPanel));
[kamBackBtn, kamNextBtn].forEach((b) => b.addEventListener("click", closeKamPanel));

// Click outside (panel overlay bg) closes
langPanel.addEventListener("click", (e) => {
  if (e.target === langPanel) closeLangPanel();
});
kamPanel.addEventListener("click", (e) => {
  if (e.target === kamPanel) closeKamPanel();
});

// Language select
langPanel.querySelectorAll(".panelOpt[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const code = btn.getAttribute("data-lang");
    localStorage.setItem("menyra_lang", code);
    setLangLabel(code);
    closeLangPanel();
  });
});

openStoryBtn.addEventListener("click", () => {
  const qs = new URLSearchParams();
  qs.set("r", restaurantId);
  if (tableId) qs.set("t", tableId);
  window.location.href = `../social/story.html?${qs.toString()}`;
});

openInfoBtn.addEventListener("click", () => {
  closeAllPanels();
  alert("Info: Platzhalter. Hier kommen später Öffnungszeiten, Adresse, WLAN, Social Links usw.");
});

callWaiterOpt.addEventListener("click", () => {
  closeKamPanel();
  alert("Kamarieri: Platzhalter. Später schreiben wir in Firestore einen Call.");
});

payOpt.addEventListener("click", () => {
  closeKamPanel();
  alert("Pay: Platzhalter. Später Payment/Checkout.");
});

// Close panels on ESC
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllPanels();
});

// --- Firestore load ---
async function loadRestaurant() {
  const ref = doc(db, "restaurants", restaurantId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    elName.textContent = "Restaurant nicht gefunden";
    elMeta.textContent = `ID: ${restaurantId}`;
    elLogo.removeAttribute("src");
    return null;
  }

  const data = snap.data();
  elName.textContent = data.name || data.title || "Restaurant";
  elMeta.textContent = data.subtitle || data.tagline || "Mirësevini në menynë digjitale";
  elLogo.src = safeImgUrl(data.profileImageUrl || data.logoUrl || data.logo);
  elLogo.alt = `${elName.textContent} Logo`;
  return data;
}

function renderOfferSlide(o) {
  const wrap = document.createElement("div");
  wrap.className = "offer-slide";

  const img = document.createElement("img");
  img.className = "offer-image";
  img.alt = o.title || "Offer";
  img.loading = "eager";
  img.decoding = "async";
  img.src = safeImgUrl(o.imageUrl || o.image);

  const header = document.createElement("div");
  header.className = "offer-header";

  const t = document.createElement("div");
  t.className = "offer-title";
  t.textContent = o.title || "Offer";

  const p = document.createElement("div");
  p.className = "offer-price";
  p.textContent = o.priceLabel || (typeof o.price === "number" ? `${o.price.toFixed(2)} €` : (o.price || ""));

  header.appendChild(t);
  header.appendChild(p);

  const desc = document.createElement("div");
  desc.className = "offer-desc";
  desc.textContent = o.description || o.desc || "";

  const actions = document.createElement("div");
  actions.className = "offer-actions";
  const btnInfo = document.createElement("button");
  btnInfo.className = "btn btn-ghost btn-small";
  btnInfo.type = "button";
  btnInfo.textContent = "Info";
  btnInfo.addEventListener("click", () => alert(o.description || "Info"));

  const btnAdd = document.createElement("button");
  btnAdd.className = "btn btn-primary btn-small";
  btnAdd.type = "button";
  btnAdd.textContent = "Shto";
  btnAdd.addEventListener("click", () => alert("Platzhalter: Add to cart kommt später."));

  actions.appendChild(btnInfo);
  actions.appendChild(btnAdd);

  wrap.appendChild(img);
  wrap.appendChild(header);
  wrap.appendChild(desc);
  wrap.appendChild(actions);
  return wrap;
}

async function loadOffers() {
  offersSlider.innerHTML = "";
  offersDots.innerHTML = "";

  const ref = collection(db, "restaurants", restaurantId, "offers");
  const q = query(ref, orderBy("createdAt", "desc"), limit(8));
  const snap = await getDocs(q);
  const offers = [];
  snap.forEach((d) => offers.push({ id: d.id, ...d.data() }));

  // Filter active in JS to avoid composite indexes.
  const activeOffers = offers.filter((o) => o.isActive !== false);
  if (activeOffers.length === 0) {
    offersSlider.innerHTML = `<div class="offer-slide"><div class="offer-header"><div class="offer-title">Noch keine Angebote</div><div class="offer-price"></div></div><div class="offer-desc">Der Kunde hat noch kein „Sot ne fokus“ Angebot gepostet.</div></div>`;
    return;
  }

  // Render only first for now (slider logic comes later)
  offersSlider.appendChild(renderOfferSlide(activeOffers[0]));
}

async function init() {
  // language label
  setLangLabel(localStorage.getItem("menyra_lang") || "de");

  await loadRestaurant();
  await loadOffers();
}

init().catch((e) => {
  console.error(e);
  elName.textContent = "Fehler beim Laden";
  elMeta.textContent = String(e?.message || e);
});
