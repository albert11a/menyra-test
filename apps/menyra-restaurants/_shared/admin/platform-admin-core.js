// =========================================================
// MENYRA System 1 — Platform Admin Core
// - Uses MENYRA admin demo UI (menyra_platform.css/html)
// - Cost-optimized: prefers public/* single docs (1 read)
// - No realtime listeners (no onSnapshot)
// =========================================================

import { app, db, auth, storage } from "../../../../shared/firebase-config.js";
import { BUNNY_EDGE_BASE } from "../../../../shared/bunny-edge.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  listActiveStories,
  countActiveStories,
  listExpiredStories,
  addStoryDoc,
  deleteStoryDoc
} from "../firebase/stories.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

import {
collection,
  addDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  collectionGroup,
  setDoc,
  arrayUnion,
  updateDoc,
  orderBy,
  limit,
  deleteDoc,
  serverTimestamp,
  Timestamp

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

// alias for legacy usage in some renderers
function escapeHtml(s) { return esc(s); }

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

function getCachedRestaurantId(uid) {
  if (!uid) return "";
  const v = lsGet(`menyra_owner_rid_${uid}`);
  return typeof v === "string" ? v : "";
}

function setCachedRestaurantId(uid, rid) {
  if (!uid || !rid) return;
  lsSet(`menyra_owner_rid_${uid}`, String(rid));
}
function clearCachedRestaurantId(uid) {
  if (!uid) return;
  try { localStorage.removeItem(`menyra_owner_rid_${uid}`); } catch {}
}

// -------------------------
// Bunny Edge + TUS helpers (Stories)
// -------------------------
let __tusPromise = null;
async function ensureTus(){
  if (window.tus && window.tus.Upload) return window.tus;
  if (__tusPromise) return __tusPromise;
  __tusPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/tus-js-client/dist/tus.min.js";
    s.async = true;
    s.onload = () => resolve(window.tus);
    s.onerror = () => reject(new Error("tus-js-client konnte nicht geladen werden"));
    document.head.appendChild(s);
  });
  return __tusPromise;
}

async function postJson(url, body){
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  const txt = await res.text();
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = { raw: txt }; }
  if (!res.ok) {
    const msg = data?.error || data?.message || txt || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function getVideoDurationSeconds(file){
  return await new Promise((resolve, reject) => {
    try {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.playsInline = true;
      const url = URL.createObjectURL(file);
      v.src = url;
      v.onloadedmetadata = () => {
        const dur = Number(v.duration || 0);
        URL.revokeObjectURL(url);
        resolve(dur);
      };
      v.onerror = () => {
        try { URL.revokeObjectURL(url); } catch {}
        reject(new Error("Video-Metadaten konnten nicht gelesen werden"));
      };
    } catch (err) {
      reject(err);
    }
  });
}


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

const ROLE_HOSTS = new Set(["ceo", "owner", "staff", "waiter", "kitchen"]);

function getRoleOrigin(role) {
  const host = window.location.hostname;
  const proto = window.location.protocol;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  if (isLocal || host.endsWith(".vercel.app")) return window.location.origin;
  const parts = host.split(".");
  const root = ROLE_HOSTS.has(parts[0]) ? parts.slice(1).join(".") : host;
  return `${proto}//${role}.${root}`;
}

function roleBasePath(role) {
  const origin = getRoleOrigin(role);
  return origin === window.location.origin ? `/${role}/` : "/";
}

function buildRoleUrl(role, params = "") {
  const origin = getRoleOrigin(role);
  const basePath = roleBasePath(role);
  const suffix = params ? `?${params}` : "";
  return `${origin}${basePath}${suffix}`;
}

// -------------------------
// UI helpers: format, timers, live badges
// -------------------------
const updatedAtMap = new Map();
const liveUntilMap = new Map();
let updatedTimer = null;
let liveTimer = null;

const currencyFmt = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" });
const numberFmt = new Intl.NumberFormat("de-AT", { maximumFractionDigits: 0 });

function formatCurrency(v) {
  try { return currencyFmt.format(Number(v || 0)); } catch { return `€ ${Math.round(v || 0)}`; }
}
function formatNumber(v) {
  try { return numberFmt.format(Math.round(v || 0)); } catch { return String(Math.round(v || 0)); }
}

function toDateSafe(v) {
  if (!v) return null;
  try {
    if (v instanceof Date) return v;
    if (typeof v.toDate === "function") return v.toDate();
    if (typeof v.seconds === "number") return new Date(v.seconds * 1000);
    if (typeof v === "number") return new Date(v);
    const parsed = new Date(v);
    if (!isNaN(parsed.getTime())) return parsed;
  } catch (_) {}
  return null;
}

function relativeFromNow(tsMs) {
  if (!tsMs) return "-";
  const diff = Math.max(0, nowMs() - tsMs);
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.round(hr / 24);
  return `${days}d`;
}

function renderUpdated(id, ts) {
  const el = $(id);
  if (!el) return;
  if (!ts) { el.textContent = "-"; return; }
  el.textContent = `updated vor ${relativeFromNow(ts)}`;
}

function setUpdated(id, ts = nowMs()) {
  updatedAtMap.set(id, ts);
  renderUpdated(id, ts);
  if (!updatedTimer) {
    updatedTimer = setInterval(() => {
      updatedAtMap.forEach((val, key) => renderUpdated(key, val));
    }, 10000);
  }
}

function markLive(target, ttlMs = 20000) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;
  el.dataset.live = "true";
  liveUntilMap.set(el, nowMs() + ttlMs);
  if (!liveTimer) {
    liveTimer = setInterval(() => {
      const now = nowMs();
      liveUntilMap.forEach((until, node) => {
        if (until && now > until) {
          delete node.dataset.live;
          liveUntilMap.delete(node);
        }
      });
    }, 2000);
  }
}

function animateValue(el, target, formatter = (v) => formatNumber(Math.round(v || 0)), opts = {}) {
  if (!el) return;
  const prev = Number(el.dataset?.value || el.textContent || 0) || 0;
  const diff = target - prev;
  const maxDiff = opts.maxDiff ?? 5000;
  if (!Number.isFinite(diff) || Math.abs(diff) > maxDiff) {
    el.textContent = formatter(target);
    el.dataset.value = target;
    return;
  }
  const duration = opts.duration ?? Math.max(120, Math.min(180, Math.abs(diff) * 4));
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const val = prev + diff * t;
    el.textContent = formatter(val);
    if (t < 1) requestAnimationFrame(step);
    else el.dataset.value = target;
  }
  requestAnimationFrame(step);
}

// -------------------------
// Login Modal (uses existing modal styles)
// -------------------------
function mountLoginModal(roleLabel = "Login", opts = {}) {
  if (document.getElementById("loginModalOverlay")) return;
  const allowBootstrap = !!opts.allowBootstrap;

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
        ${allowBootstrap ? `
        <div class="m-inline" style="justify-content:flex-end; gap:10px; margin-top:10px;">
          <button class="m-btn m-btn--ghost" id="loginBootstrapBtn" type="button">CEO wiederherstellen</button>
        </div>
        <div class="m-muted" id="loginBootstrapNote" style="margin-top:8px;">Nur nutzen, wenn kein CEO mehr vorhanden ist.</div>
        ` : ""}
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

  const bootstrapBtn = overlay.querySelector("#loginBootstrapBtn");
  if (bootstrapBtn) {
    const note = overlay.querySelector("#loginBootstrapNote");
    bootstrapBtn.addEventListener("click", async () => {
      const email = overlay.querySelector("#loginEmail").value.trim();
      const pass = overlay.querySelector("#loginPass").value;
      const status = overlay.querySelector("#loginStatus");
      status.textContent = "";
      if (!email || !pass) {
        status.textContent = "Bitte Email und Passwort eingeben.";
        return;
      }
      status.textContent = "CEO wird erstellt...";
      try {
        let cred = null;
        try {
          cred = await createUserWithEmailAndPassword(auth, email, pass);
        } catch (err) {
          if (err?.code === "auth/email-already-in-use") {
            cred = await signInWithEmailAndPassword(auth, email, pass);
          } else {
            throw err;
          }
        }
        const uid = cred?.user?.uid;
        if (!uid) throw new Error("Kein Benutzer gefunden.");
        await setDoc(doc(db, "superadmins", uid), {
          email,
          name: email.split("@")[0] || "",
          role: "ceo",
          status: "active",
          createdAt: serverTimestamp()
        }, { merge: true });
        status.textContent = "CEO aktiviert. Bitte neu laden.";
        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        console.error(err);
        status.textContent = err?.message || "Fehler beim Erstellen.";
      }
    });

    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "superadmins"), limit(1)));
        if (snap.size > 0) {
          bootstrapBtn.disabled = true;
          if (note) note.textContent = "Bereits ein CEO vorhanden.";
        }
      } catch (err) {
        console.warn("bootstrap check failed", err);
        if (note) note.textContent = "Bootstrap-Check nicht moeglich.";
      }
    })();
  }
}

// -------------------------
// Boot overlay
// -------------------------
function setBootLabel(label) {
  const el = $("mBootLabel");
  if (el && label) el.textContent = label;
}

function setBootStatus(text) {
  const el = $("mBootStatus");
  if (el && text) el.textContent = text;
}

function finishBoot() {
  document.body.classList.remove("m-app-hidden");
  document.body.classList.remove("m-boot");
  document.documentElement.classList.remove("m-boot");
  const ov = $("mBootOverlay");
  if (ov) {
    ov.classList.add("is-done");
    setTimeout(() => {
      try { ov.remove(); } catch {}
    }, 400);
  }
}

async function ensureRoleAccess(role, uid) {
  if (role === "owner") return true;
  if (!uid) return false;
  try {
    if (role === "ceo") {
      const snap = await getDoc(doc(db, "superadmins", uid));
      if (snap.exists()) return true;
    }
    if (role === "staff") {
      const snap = await getDoc(doc(db, "staffAdmins", uid));
      if (snap.exists()) return true;
      // allow superadmins as staff fallback
      const sup = await getDoc(doc(db, "superadmins", uid));
      if (sup.exists()) return true;
    }
  } catch (err) {
    console.error("Access check failed", err);
  }
  return false;
}

// -------------------------
// Views Navigation
// -------------------------
function initNav() {
  const views = qsa('.m-view[data-view]');

  function closeMobileMenu() {
    const mm = $("mobileMenu") || document.querySelector(".m-mobile-menu");
    const ov = $("mobileMenuOverlay") || document.querySelector(".m-mobile-menu-overlay");
    if (mm) mm.classList.remove("is-open");
    if (ov) {
      ov.classList.remove("is-open");
      ov.classList.remove("is-visible");
    }
    document.documentElement.classList.remove("menu-open");
    document.body?.classList.remove("menu-open");
  }

  function showView(name) {
    views.forEach(v => v.style.display = (v.dataset.view === name) ? "" : "none");

    // Active state should reflect ALL nav links currently in DOM (desktop + mobile)
    const allLinks = qsa('[data-section]');
    allLinks.forEach(a => {
      if (a.dataset.section === name) a.classList.add("is-active");
      else a.classList.remove("is-active");
    });
  }

  // Click delegation for navigation links (works for dynamically injected mobile nav)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('[data-section]');
    if (!a) return;

    // Only handle anchors/buttons meant for navigation
    const section = a.dataset.section;
    if (!section) return;

    e.preventDefault();
    showView(section);
    closeMobileMenu();
  });

  // ----------------------------------------------------------
  // Mobile Menu Wiring (Burger + Overlay + Close Button)
  // ----------------------------------------------------------
  const burger = $("burgerToggle");
  const mobileMenu = $("mobileMenu") || document.querySelector(".m-mobile-menu");
  const overlay = $("mobileMenuOverlay") || document.querySelector(".m-mobile-menu-overlay");
  const closeBtn = $("mobileMenuClose");

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    if (overlay) {
      overlay.classList.add("is-visible");
      overlay.classList.add("is-open"); // keep compatibility if some CSS uses is-open
    }
    document.documentElement.classList.add("menu-open");
    document.body?.classList.add("menu-open");
  }
  function toggleMobileMenu() {
    if (!mobileMenu) return;
    const willOpen = !mobileMenu.classList.contains("is-open");
    if (willOpen) openMobileMenu();
    else closeMobileMenu();
  }

  if (burger && mobileMenu) burger.addEventListener("click", toggleMobileMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMobileMenu);
  if (overlay) overlay.addEventListener("click", closeMobileMenu);

  // ----------------------------------------------------------
  // Mobile Navigation Content (NO empty menu)
  // Build from desktop sidebar (#sidebarNav) to stay 1:1.
  // ----------------------------------------------------------
  function ensureMobileNav() {
    if (!mobileMenu) return;

    const inner = mobileMenu.querySelector(".m-mobile-menu-inner") || mobileMenu;
    if (!inner) return;

    // Create host once
    let host = document.getElementById("mobileNavHost");
    if (!host) {
      const section = document.createElement("div");
      section.className = "m-mobile-menu-section";
      section.innerHTML = '<div id="mobileNavHost"></div>';
      // insert right after the search section (if present), else near top
      const searchSection = inner.querySelector(".m-mobile-menu-section");
      if (searchSection && searchSection.parentNode) {
        searchSection.parentNode.insertBefore(section, searchSection.nextSibling);
      } else {
        inner.insertBefore(section, inner.firstChild);
      }
      host = document.getElementById("mobileNavHost");
    }

    if (!host) return;

    // Build list
    const desktopLinks = Array.from(document.querySelectorAll("#sidebarNav a[data-section]"));
    const list = document.createElement("ul");
    list.className = "m-sidebar-nav m-sidebar-nav--mobile";

    desktopLinks.forEach((dl) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.dataset.section = dl.dataset.section;
      a.className = dl.className || "";
      // keep visuals
      a.innerHTML = dl.innerHTML;
      li.appendChild(a);
      list.appendChild(li);
    });

    host.innerHTML = "";
    host.appendChild(list);
  }

  // Build once on load
  ensureMobileNav();

  // Theme toggle (existing)
  const themeBtn = $("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("is-dark");
      try {
        localStorage.setItem(
          "menyra_theme",
          document.documentElement.classList.contains("is-dark") ? "dark" : "light"
        );
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

  const metaPayload = {
    name: base.name || base.restaurantName || base.slug || "",
    restaurantName: base.restaurantName || base.name || "",
    type: base.type || "cafe",
    city: base.city || "",
    logoUrl: base.logoUrl || base.logo || "",
    logo: base.logo || "",
    offersEnabled: true,
    updatedAt: serverTimestamp()
  };

  // public/meta (safe merge)
  await setDoc(doc(db, "restaurants", restaurantId, "public", "meta"), metaPayload, { merge: true });

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

async function ensureOwnerStaffDoc(restaurantId, user) {
  if (!restaurantId || !user?.uid) return;
  const staffRef = doc(db, "restaurants", restaurantId, "staff", user.uid);
  try {
    const snap = await getDoc(staffRef);
    if (snap.exists()) return;
  } catch {}

  try {
    await setDoc(staffRef, {
      role: "owner",
      roles: ["owner"],
      uid: user.uid,
      userId: user.uid,
      email: user.email || "",
      name: user.displayName || "",
      createdAt: serverTimestamp(),
      createdByUid: user.uid
    }, { merge: true });
    await upsertStaffIndex({
      uid: user.uid,
      restaurantId,
      name: user.displayName || "",
      email: user.email || ""
    });
    await setDoc(doc(db, "restaurants", restaurantId), {
      ownerUid: user.uid,
      ownerEmail: user.email || "",
      ownerName: user.displayName || "",
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("ensureOwnerStaffDoc failed:", err?.message || err);
  }
}

function shortCaption(text, max = 90) {
  const safe = String(text || "").trim();
  if (!safe) return "";
  return safe.length > max ? safe.slice(0, max).trim() + "..." : safe;
}

async function initSocialPostsUI({ restaurantId, restaurants, user }) {
  const listEl = $("socialPostsList");
  const statusEl = $("socialStatus");
  const metaEl = $("socialPostsMeta");
    const typeSel = $("socialPostType");
    const cityInp = $("socialCity");
    const cityListEl = $("socialCityList");
    const mediaTypeSel = $("socialMediaType");
  const mediaUrlInp = $("socialMediaUrl");
  const mediaFileInp = $("socialMediaFile");
  const captionInp = $("socialCaption");
  const publishBtn = $("socialPublishBtn");
  const uploadBtn = $("socialUploadBtn");
  const reloadBtn = $("socialReloadBtn");

  if (!listEl) return;

    const base = (restaurants || []).find((r) => r.id === restaurantId) || {};
    if (cityInp && !cityInp.value) cityInp.value = base.city || "";
    if (cityListEl) {
      const cities = new Set();
      (restaurants || []).forEach((r) => {
        const city = String(r.city || "").trim();
        if (city) cities.add(city);
      });
      if (!cities.size && base.city) cities.add(base.city);
      if (!cities.size) cities.add("Prishtina");
      cityListEl.innerHTML = Array.from(cities)
        .sort((a, b) => a.localeCompare(b))
        .map((city) => `<option value="${esc(city)}"></option>`)
        .join("");
    }

    function normalizeUrl(raw) {
      const value = String(raw || "").trim();
      if (!value) return "";
      if (/^https?:\/\//i.test(value)) return value;
      if (value.startsWith("//")) return `https:${value}`;
      return `https://${value.replace(/^\/+/, "")}`;
    }

    function setStatus(text) {
      if (statusEl) statusEl.textContent = text || "";
    }

    function renderPosts(rows) {
      if (!Array.isArray(rows) || !rows.length) {
        listEl.innerHTML = `<div class="m-muted">Keine Posts vorhanden.</div>`;
        if (metaEl) metaEl.textContent = "-";
        return;
      }

      listEl.innerHTML = rows.map((row) => {
        const createdAt = row.createdAt?.seconds ? relativeFromNow(row.createdAt.seconds * 1000) : "-";
        const status = row.status || "active";
        const nextAction = status === "active" ? "hide" : "show";
        const currentType = row.postType || "offer";
        const typeOptions = ["offer", "nightlife", "food", "event"]
          .map((type) => `<option value="${type}" ${type === currentType ? "selected" : ""}>${type}</option>`)
          .join("");
        return `
          <div class="m-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 0.9fr;">
            <div>${esc(shortCaption(row.caption || row.captionShort || ""))}</div>
            <div>
              <select class="m-select2" data-social-type="${row.id}">
                ${typeOptions}
              </select>
            </div>
            <div>${esc(status)}</div>
            <div>${createdAt}</div>
            <div class="m-table-col-actions">
              <button class="m-ghost-btn" data-social-act="${nextAction}" data-social-id="${row.id}">${nextAction}</button>
              <button class="m-ghost-btn" data-social-act="delete" data-social-id="${row.id}">delete</button>
          </div>
        </div>
      `;
    }).join("");

    if (metaEl) metaEl.textContent = `Posts: ${rows.length}`;
  }

  async function loadPosts() {
    if (!restaurantId) {
      setStatus("Kein Lokal ausgewählt.");
      return;
    }
    setStatus("Lade Posts.");
    try {
      const ref = collection(db, "restaurants", restaurantId, "socialPosts");
      let snap = null;
      try {
        snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(50)));
      } catch (_) {
        snap = await getDocs(ref);
      }
      const rows = [];
      snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
      renderPosts(rows);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Fehler beim Laden.");
    }
  }

    async function setPostStatus(postId, nextStatus) {
      if (!restaurantId || !postId) return;
      await setDoc(doc(db, "restaurants", restaurantId, "socialPosts", postId), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await setDoc(doc(db, "socialFeed", postId), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    async function setPostType(postId, nextType) {
      if (!restaurantId || !postId || !nextType) return;
      await setDoc(doc(db, "restaurants", restaurantId, "socialPosts", postId), {
        postType: nextType,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await setDoc(doc(db, "socialFeed", postId), {
        postType: nextType,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

  if (uploadBtn) {
    uploadBtn.addEventListener("click", async () => {
      const file = mediaFileInp?.files?.[0];
      if (!file) {
        setStatus("Bitte ein Bild auswählen.");
        return;
      }
      const maxBytes = 15 * 1024 * 1024;
      if (file.size > maxBytes) {
        setStatus("Max 15MB pro Bild.");
        return;
      }
      if (!String(file.type || "").startsWith("image/")) {
        setStatus("Nur Bilder erlaubt.");
        return;
      }

      const form = new FormData();
      form.append("file", file, file.name || "image.jpg");
      form.append("restaurantId", restaurantId || "");

      try {
        setStatus("Upload startet.");
        const res = await fetch(`${BUNNY_EDGE_BASE}/image/upload`, {
          method: "POST",
          body: form
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.url) {
          setStatus(data?.error || "Upload fehlgeschlagen.");
          return;
        }
          const safeUrl = normalizeUrl(data.url);
          if (mediaUrlInp) mediaUrlInp.value = safeUrl;
          if (mediaTypeSel) mediaTypeSel.value = "image";
          setStatus("Upload OK.");
        } catch (err) {
          console.error(err);
          setStatus("Upload fehlgeschlagen.");
      }
    });
  }

  if (publishBtn) {
    publishBtn.addEventListener("click", async () => {
      if (!restaurantId) {
        setStatus("Kein Lokal ausgewählt.");
        return;
      }
      const caption = captionInp?.value?.trim() || "";
      const mediaUrl = normalizeUrl(mediaUrlInp?.value?.trim() || "");
      if (!caption || !mediaUrl) {
        setStatus("Caption und Media URL sind Pflicht.");
        return;
      }

      const postType = typeSel?.value || "food";
      const city = cityInp?.value?.trim() || base.city || "";
      const mediaType = mediaTypeSel?.value || "image";
      const postRef = doc(collection(db, "restaurants", restaurantId, "socialPosts"));
      const postId = postRef.id;

      const media = [{
        url: mediaUrl,
        type: mediaType,
        thumbUrl: mediaType === "image" ? mediaUrl : ""
      }];

      const payload = {
        postType,
        caption,
        media,
        city,
        createdAt: serverTimestamp(),
        createdByUid: user?.uid || "",
        status: "active"
      };

      const feedPayload = {
        rid: restaurantId,
        postType,
        city,
        createdAt: serverTimestamp(),
        captionShort: shortCaption(caption),
        thumbUrl: mediaType === "image" ? mediaUrl : "",
        mediaType,
        status: "active",
        businessName: base.name || base.restaurantName || ""
      };

      try {
        setStatus("Publishing.");
        await setDoc(postRef, payload);
        await setDoc(doc(db, "socialFeed", postId), feedPayload, { merge: true });
        setStatus("Published.");
        if (captionInp) captionInp.value = "";
        if (mediaUrlInp) mediaUrlInp.value = "";
        await loadPosts();
      } catch (err) {
        console.error(err);
        setStatus("Publish fehlgeschlagen.");
      }
    });
  }

  if (reloadBtn) reloadBtn.addEventListener("click", loadPosts);

    listEl.addEventListener("click", async (e) => {
      const btn = e.target?.closest?.("[data-social-act]");
      if (!btn) return;
      const postId = btn.getAttribute("data-social-id");
      const act = btn.getAttribute("data-social-act");
    if (!postId || !act) return;
    try {
      if (act === "hide") await setPostStatus(postId, "hidden");
      if (act === "show") await setPostStatus(postId, "active");
      if (act === "delete") await setPostStatus(postId, "deleted");
      await loadPosts();
      } catch (err) {
        console.error(err);
        setStatus("Aktion fehlgeschlagen.");
      }
    });

    listEl.addEventListener("change", async (e) => {
      const sel = e.target?.closest?.("[data-social-type]");
      if (!sel) return;
      const postId = sel.getAttribute("data-social-type");
      const nextType = sel.value;
      if (!postId || !nextType) return;
      try {
        await setPostType(postId, nextType);
        setStatus("Typ aktualisiert.");
        await loadPosts();
      } catch (err) {
        console.error(err);
        setStatus("Typ-Update fehlgeschlagen.");
      }
    });

  await loadPosts();
}

async function createRestaurantDoc(role, user, payload) {
  const restaurantsRef = collection(db, "restaurants");

  const base = {
    name: payload.name,
    restaurantName: payload.restaurantName || payload.name,
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

async function updateRestaurantDoc(role, user, restaurantId, payload) {
  if (!restaurantId) throw new Error("restaurantId fehlt");

  const base = {
    name: payload.name,
    restaurantName: payload.restaurantName || payload.name,
    type: payload.type,
    ownerName: payload.ownerName,
    city: payload.city,
    phone: payload.phone,
    tableCount: payload.tableCount,
    yearPrice: payload.yearPrice,
    status: payload.status,
    logoUrl: payload.logoUrl,
    slug: payload.slug,
    updatedAt: serverTimestamp(),
    updatedByUid: user?.uid || null,
    updatedByRole: role || null
  };

  await setDoc(doc(db, "restaurants", restaurantId), base, { merge: true });
  await ensurePublicDocs(restaurantId, base);
  return restaurantId;
}

// -------------------------
// Dashboard helpers
// -------------------------
const DAY_MS = 24 * 60 * 60 * 1000;

function calcYearlyAmount(row) {
  const billing = (row.billingCycle || row.billingInterval || row.planInterval || row.planType || row.billing?.cycle || "").toLowerCase();
  const price = parseFloatSafe(row.price ?? row.yearPrice ?? row.yearlyAmount ?? 0, 0);
  const monthly = parseFloatSafe(row.monthlyPrice ?? row.priceMonthly ?? 0, 0);
  if (billing === "monthly" || billing === "month") return (price || monthly) * 12;
  if (billing === "yearly" || billing === "annual" || billing === "year") return price || (monthly * 12);
  if (monthly) return monthly * 12;
  return price || 0;
}

function isActiveCustomer(row) {
  return (row.status || "").toLowerCase() === "active";
}

function isDemoCustomer(row) {
  const status = (row.status || "").toLowerCase();
  return status === "demo" || status === "trial" || status === "test" || row.demo === true || row.isDemo === true;
}

function customerName(row) {
  return row.name || row.restaurantName || row.slug || row.id || "Kunde";
}

function pickNextBillingDate(row) {
  const candidates = [
    row.nextBillingAt,
    row.nextBillingDate,
    row.billingNextAt,
    row.billingNext,
    row.billing?.nextAt,
    row.billing?.nextDate,
    row.subscription?.nextBillingAt
  ];
  for (const c of candidates) {
    const d = toDateSafe(c);
    if (d) return d;
  }
  return null;
}

function buildNextPayItems(restaurants) {
  const now = nowMs();
  const items = [];
  (restaurants || []).forEach((r) => {
    const d = pickNextBillingDate(r);
    if (d) {
      const daysLeft = Math.ceil((d.getTime() - now) / DAY_MS);
      items.push({ name: customerName(r), daysLeft, raw: d });
    }
  });
  items.sort((a, b) => (a.raw?.getTime() || 0) - (b.raw?.getTime() || 0));
  if (!items.length) {
    const fallback = (restaurants || []).slice(0, 5);
    fallback.forEach((r, idx) => {
      items.push({ name: customerName(r), daysLeft: null, raw: new Date(now + (idx + 1) * DAY_MS) });
    });
  }
  return items;
}

function renderNextPayList(items, expanded = false, markStamp = true) {
  const listEl = $("dashNextPayList");
  if (!listEl) return;
  listEl.innerHTML = "";
  if (!items || !items.length) {
    const li = document.createElement("li");
    li.className = "m-muted";
    li.textContent = "Keine Daten";
    listEl.appendChild(li);
    if (markStamp) setUpdated("dashUpdatedNextPay");
    return;
  }
  const limit = expanded ? Math.min(10, items.length) : Math.min(3, items.length);
  items.slice(0, limit).forEach((item, idx) => {
    const li = document.createElement("li");
    let label = "kein Datum";
    if (item.daysLeft != null) {
      label = item.daysLeft <= 0 ? "heute" : (item.daysLeft === 1 ? "in 1 Tag" : `in ${item.daysLeft} Tagen`);
    }
    li.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:4px;">
        <b>${esc(item.name)}</b>
        <span class="m-muted">${label}</span>
      </div>
      <span class="m-badge">#${idx + 1}</span>
    `;
    listEl.appendChild(li);
  });
  if (markStamp) setUpdated("dashUpdatedNextPay");
}

function renderStoriesList(list, expanded = false, markStamp = true) {
  const listEl = $("dashActiveStoriesList");
  if (!listEl) return;
  listEl.innerHTML = "";
  if (!list || !list.length) {
    const li = document.createElement("li");
    li.className = "m-muted";
    li.textContent = "Keine aktiven Storys";
    listEl.appendChild(li);
    if (markStamp) setUpdated("dashUpdatedStories");
    return;
  }
  const limit = expanded ? Math.min(10, list.length) : Math.min(3, list.length);
  list.slice(0, limit).forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:4px;">
        <b>${idx + 1}. ${esc(item.name)}</b>
        <span class="m-muted">Storys: ${item.count ?? 0}</span>
      </div>
    `;
    listEl.appendChild(li);
  });
  if (markStamp) setUpdated("dashUpdatedStories");
}

function updateCustomersCard(restaurants) {
  const active = (restaurants || []).filter(isActiveCustomer);
  animateValue($("dashActiveCustomersCount"), active.length, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 5000 });
  const sumYearly = active.reduce((acc, r) => acc + calcYearlyAmount(r), 0);
  animateValue($("dashRevenueYearly"), sumYearly, (v) => formatCurrency(v || 0), { maxDiff: 500000 });
  animateValue($("dashRevenueMonthly"), sumYearly / 12, (v) => formatCurrency(v || 0), { maxDiff: 500000 });
  animateValue($("dashRevenueDaily"), sumYearly / 365, (v) => formatCurrency(v || 0), { maxDiff: 500000 });
  setUpdated("dashUpdatedActiveCustomers");
  markLive("cardActiveCustomers");
}

function updateDemoCard(restaurants) {
  const demoCount = (restaurants || []).filter(isDemoCustomer).length;
  animateValue($("dashDemoCustomersCount"), demoCount, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 2000 });
  setUpdated("dashUpdatedDemoCustomers");
  markLive("cardDemoCustomers");
}

function updateSystemStatsCard({ restaurants = [], leadsCount = 0, storiesCount = 0 } = {}) {
  animateValue($("dashSystemRestaurants"), restaurants.length, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 5000 });
  animateValue($("dashSystemLeads"), leadsCount, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 5000 });
  animateValue($("dashSystemStories"), storiesCount, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 5000 });
}

// -------------------------
// UI: Customers
// -------------------------
function renderCustomersTable(rows, role) {
  const body = $("customersTableBody");
  if (!body) return;
  const isTable = body.tagName === "TBODY";
  const list = Array.isArray(rows) ? rows : [];

  body.innerHTML = "";

  if (!list.length) {
    if (isTable) {
      const emptyRow = document.createElement("tr");
      emptyRow.className = "table-row";
      emptyRow.innerHTML = `<td colspan="3" class="text-center text-muted">Keine Kunden.</td>`;
      body.appendChild(emptyRow);
    } else {
      body.innerHTML = `<div class="m-empty">Keine Kunden.</div>`;
    }
    const footer = $("customersFooter");
    if (footer) footer.textContent = "-";
    return;
  }

  list.forEach((r) => {
    if (isTable) {
      const statusKey = String(r.status || "active").toLowerCase();
      let badgeStyle = "background: rgba(168, 85, 247, 0.12); color: #a855f7;";
      if (statusKey === "trial") badgeStyle = "background: rgba(245, 158, 11, 0.12); color: #f59e0b;";
      if (statusKey === "paused") badgeStyle = "background: rgba(100, 116, 139, 0.12); color: #64748b;";
      const statusLabel = (r.status || "active").toUpperCase();
      const sub = r.slug || r.type || "";
      const subHtml = sub ? `<div class="small text-muted">${esc(sub)}</div>` : "";

      const row = document.createElement("tr");
      row.className = "table-row";
      row.innerHTML = `
        <td>
          <div class="fw-800">${esc(r.name || "-")}</div>
          ${subHtml}
        </td>
        <td class="text-center">
          <span class="status-badge" style="${badgeStyle}">${esc(statusLabel)}</span>
        </td>
        <td class="text-end">
          <button class="btn btn-light btn-sm rounded-circle" type="button" data-act="qr" data-id="${esc(r.id)}"><i class="fas fa-qrcode"></i></button>
          <button class="btn btn-light btn-sm rounded-circle" type="button" data-act="edit" data-id="${esc(r.id)}"><i class="fas fa-pen"></i></button>
        </td>
      `;
      body.appendChild(row);
      return;
    }

    const row = document.createElement("div");
    row.className = "m-table-row";
    row.innerHTML = `
      <div>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <b>${esc(r.name || "-")}</b>
          <span class="m-muted" style="font-size:12px;">${esc(r.type || "")}${r.slug ? " - " + esc(r.slug) : ""}</span>
        </div>
      </div>
      <div>${esc(r.ownerName || "-")}</div>
      <div>${esc(r.city || "-")}</div>
      <div>${esc(r.yearPrice != null ? (String(r.yearPrice) + " EUR/Jahr") : "-")}</div>
      <div><span class="m-badge ${r.status === "active" ? "m-badge--green" : (r.status === "trial" ? "m-badge--yellow" : "m-badge--gray")}">${esc(r.status || "-")}</span></div>
      <div class="m-table-col-actions" style="display:flex; gap:8px; justify-content:flex-end;">
        <button class="m-btn m-btn--small m-btn--ghost" type="button" data-act="qr" data-id="${esc(r.id)}">QR & Links</button>
        <button class="m-btn m-btn--small" type="button" data-act="edit" data-id="${esc(r.id)}">Edit</button>
      </div>
    `;
    body.appendChild(row);
  });

  const footer = $("customersFooter");
  if (footer) footer.textContent = list.length ? `Zeilen: ${list.length}` : "-";
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
  const ownerRel = buildRoleUrl("owner", `r=${encodeURIComponent(rid)}`);
  const waiterRel = buildRoleUrl("waiter", `r=${encodeURIComponent(rid)}`);
  const kitchenRel = buildRoleUrl("kitchen", `r=${encodeURIComponent(rid)}`);

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

function inferMenuTypeHint(label) {
  const key = foldText(label || "");
  if (!key) return "";
  if (key.includes("drink") || key.includes("getranke") || key.includes("getraenke") || key.includes("beverage")) return "drink";
  if (key.includes("food") || key.includes("speise") || key.includes("speisen")) return "food";
  return "";
}

function coerceMenuItemsFromData(data) {
  const items = [];
  const seen = new Set();

  function addItems(list, typeHint, categoryHint) {
    if (!Array.isArray(list)) return;
    list.forEach((raw, idx) => {
      let obj = null;
      if (raw && typeof raw === "object") obj = { ...raw };
      else if (typeof raw === "string" && raw.trim()) obj = { name: raw.trim() };
      else return;

      if (categoryHint && !obj.category && !obj.categoryName && !obj.cat) obj.category = categoryHint;
      if (typeHint && !obj.type && !obj.menuType && !obj.kind && !obj.section && !obj.group) obj.type = typeHint;

      const baseKey = String(obj.id || obj._id || obj.menuItemId || obj.name || obj.title || obj.product || "");
      const key = baseKey ? `${baseKey}|${obj.price ?? ""}|${obj.category || ""}` : `idx_${items.length}_${idx}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push(obj);
    });
  }

  function addBuckets(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
    Object.entries(obj).forEach(([key, val]) => {
      if (!Array.isArray(val)) return;
      const hint = inferMenuTypeHint(key);
      addItems(val, hint, key);
    });
  }

  if (!data) return items;
  if (Array.isArray(data)) {
    addItems(data);
    return items;
  }

  addItems(data.items);
  addItems(data.menuItems);
  addItems(data.menu);
  addItems(data.speisekarte);
  addItems(data.food || data.foodItems || data.speisen || data.speise, "food");
  addItems(data.drinks || data.drinkItems || data.getraenke || data.getranke || data.beverages, "drink");

  if (data.menu && typeof data.menu === "object" && !Array.isArray(data.menu)) {
    const m = data.menu;
    addItems(m.items);
    addItems(m.menuItems);
    addItems(m.speisekarte);
    addItems(m.food || m.foodItems || m.speisen || m.speise, "food");
    addItems(m.drinks || m.drinkItems || m.getraenke || m.getranke || m.beverages, "drink");
    addBuckets(m);
  }

  if (Array.isArray(data.categories)) {
    data.categories.forEach((cat) => {
      if (!cat || typeof cat !== "object") return;
      const catName = cat.name || cat.title || cat.category || "";
      const hint = inferMenuTypeHint(cat.type || catName);
      addItems(cat.items || cat.products || cat.list, hint, catName);
    });
  }

  addBuckets(data);
  return items;
}

async function loadPublicMenuItems(restaurantId) {
  const ref = doc(db, "restaurants", restaurantId, "public", "menu");
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const data = snap.data() || {};
  return coerceMenuItemsFromData(data);
}

async function loadLegacyMenuItems(restaurantId) {
  try {
    const snap = await getDoc(doc(db, "restaurants", restaurantId));
    if (!snap.exists()) return [];
    const data = snap.data() || {};
    return coerceMenuItemsFromData(data);
  } catch (err) {
    console.warn("legacy menu read failed:", err?.message || err);
    return [];
  }
}

// =========================================================
// MENU + OFFERS (canonical in subcollections, publish snapshot to public docs)
// - Canonical:
//   restaurants/{restaurantId}/menuItems/{menuItemId}
//   restaurants/{restaurantId}/offers/{offerId}
// - Guest fast reads (1 doc):
//   restaurants/{restaurantId}/public/menu
//   restaurants/{restaurantId}/public/offers
// =========================================================

function foldText(s){
  try{
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }catch(_){
    return String(s || "").toLowerCase();
  }
}

function inferMenuTypeFromItem(d){
  const explicit = d?.type ?? d?.menuType ?? d?.kind ?? d?.group ?? d?.section ?? null;
  if (explicit) {
    const t = foldText(explicit).trim();
    if (t === "drink" || t === "drinks" || t === "beverage" || t === "getranke" || t === "getraenke") return "drink";
    if (t === "food" || t === "speise" || t === "speisen") return "food";
  }
  if (d?.isDrink === true || d?.drink === true) return "drink";
  const cat = d?.category ?? d?.cat ?? d?.categoryName ?? "";
  const name = d?.name ?? d?.title ?? "";
  const desc = d?.description ?? d?.shortDesc ?? d?.desc ?? "";
  const hay = foldText(`${cat} ${name} ${desc}`);
  const drinksWords = [
    "getranke","getraenke","drinks","drink","beverage","beverages",
    "pije","pijet","gazuze","gazuara","alkool","alkoolike","alkoolik",
    "kafe","cafe","coffee","espresso","cappuccino","latte","macchiato",
    "caj","çaj","tea",
    "uje","uj","water","mineral","sparkling","still",
    "leng","lengje","juice","sok","smoothie",
    "cola","coca","pepsi","fanta","sprite","tonic","soda","icetea","iced tea",
    "energy","energjike","red bull","monster",
    "birra","beer","bier","lager","pils",
    "vere","ver","verë","wine","wein","prosecco","champagne",
    "koktej","cocktail","mojito","spritz",
    "vodka","whiskey","whisky","gin","rum","tequila","raki","rakia"
  ];
  return drinksWords.some(w => hay.includes(w)) ? "drink" : "food";
}

function normalizeMenuItemDoc(data, id){
  const d = data || {};
  const type = inferMenuTypeFromItem(d);
  return {
    id: d.id || id,
    type,
    category: d.category || d.cat || d.categoryName || "Sonstiges",
    name: d.name || d.title || "Produkt",
    description: d.description || d.shortDesc || d.desc || "",
    longDescription: d.longDescription || d.longDesc || "",
    price: (d.price === "" || d.price === null || d.price === undefined) ? "" : (Number(d.price) || 0),
    available: d.available !== false,
    imageUrl: d.imageUrl || d.photoUrl || d.image || null,
    imageUrls: Array.isArray(d.imageUrls) ? d.imageUrls : [],
    likeCount: d.likeCount || 0,
    commentCount: d.commentCount || 0,
    ratingCount: d.ratingCount || 0,
    ratingSum: d.ratingSum || 0,
  };
}

function toPublicMenuItem(item){
  const i = item || {};
  return {
    id: i.id,
    type: i.type || null,
    category: i.category || "Sonstiges",
    name: i.name || "Produkt",
    description: i.description || "",
    longDescription: i.longDescription || "",
    price: i.price ?? "",
    available: i.available !== false,
    imageUrl: i.imageUrl || null,
    imageUrls: Array.isArray(i.imageUrls) ? i.imageUrls : [],
    likeCount: i.likeCount || 0,
    commentCount: i.commentCount || 0,
    ratingCount: i.ratingCount || 0,
    ratingSum: i.ratingSum || 0,
  };
}

async function loadMenuItemsFromCollection(restaurantId){
  try {
    const ref = collection(db, "restaurants", restaurantId, "menuItems");
    const snap = await getDocs(ref);
    return snap.docs.map(d => normalizeMenuItemDoc(d.data(), d.id));
  } catch (err) {
    console.warn("menuItems read failed:", err?.message || err);
    return [];
  }
}

async function publishMenuToPublic(restaurantId, items){
  const ref = doc(db, "restaurants", restaurantId, "public", "menu");
  const payload = {
    items: (items || []).map(toPublicMenuItem),
    publishedAt: serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
}

async function loadMenuHybrid(restaurantId){
  const pub = await loadPublicMenuItems(restaurantId);
  if (pub && pub.length) {
    // normalize + infer missing type
    return pub.map((x, idx) => normalizeMenuItemDoc(x, x?.id || `pub_${idx}`));
  }
  const col = await loadMenuItemsFromCollection(restaurantId);
  if (col && col.length) {
    // publish once to speed up guest
    await publishMenuToPublic(restaurantId, col);
    return col;
  }
  const legacy = await loadLegacyMenuItems(restaurantId);
  if (legacy && legacy.length) {
    const normalized = legacy.map((x, idx) => normalizeMenuItemDoc(x, x?.id || `legacy_${idx}`));
    await publishMenuToPublic(restaurantId, normalized);
    return normalized;
  }
  return [];
}

function normalizeOfferDoc(data, id){
  const d = data || {};
  return {
    id: d.id || id,
    title: d.title || d.name || "Sot në fokus",
    price: d.price ?? "",
    desc: d.desc || d.description || "",
    imageUrl: d.imageUrl || d.image || d.photoUrl || null,
    active: d.active !== false,
    menuItemId: d.menuItemId || d.menuItem || "",
  };
}

function toPublicOffer(o){
  const x = o || {};
  return {
    id: x.id,
    title: x.title || "Sot në fokus",
    price: x.price ?? "",
    desc: x.desc || "",
    imageUrl: x.imageUrl || null,
    active: x.active !== false,
    menuItemId: x.menuItemId || "",
  };
}



async function loadOffersFromCollection(restaurantId){
  const ref = collection(db, "restaurants", restaurantId, "offers");
  const snap = await getDocs(ref);
  return snap.docs.map(d => normalizeOfferDoc(d.data(), d.id));
}

async function publishOffersToPublic(restaurantId, offers){
  const ref = doc(db, "restaurants", restaurantId, "public", "offers");
  const payload = { items: (offers || []).map(toPublicOffer), publishedAt: serverTimestamp() };
  await setDoc(ref, payload, { merge: true });
}

async function loadOffersHybrid(restaurantId){
  const pub = await loadPublicOffers(restaurantId);
  if (pub && pub.length) return pub.map((x, idx) => normalizeOfferDoc(x, x?.id || `pub_${idx}`));
  const col = await loadOffersFromCollection(restaurantId);
  if (col && col.length) {
    await publishOffersToPublic(restaurantId, col);
    return col;
  }
  return [];
}




/* =========================================================
   MENU VIEW LOGIC (Speisekarte) — CEO/STAFF/OWNER
   - Data source: menuItems subcollection (canonical) + auto-publish snapshot to public/menu
   - Each item must have type: "food" | "drink"
   ========================================================= */

function normalizeMenuType(v) {
  const t = String(v || "").toLowerCase().trim();
  if (t === "drink" || t === "drinks" || t === "beverage" || t === "getränke" || t === "getraenke") return "drink";
  return "food";
}

function menuRowBadge(type) {
  const t = normalizeMenuType(type);
  return t === "drink" ? "🥤 Getränk" : "🍲 Speise";
}

function renderMenuTable(items, filterType, canDelete) {
  const body = $("menuTableBody");
  if (!body) return;
  const isTable = body.tagName === "TBODY";
  body.innerHTML = "";

  const list = Array.isArray(items) ? items.slice() : [];
  const ft = filterType || "all";
  const filtered = ft === "all" ? list : list.filter(i => normalizeMenuType(i.type) === ft);

  if (!filtered.length) {
    if (isTable) {
      const emptyRow = document.createElement("tr");
      emptyRow.className = "table-row";
      emptyRow.innerHTML = `<td colspan="4" class="text-center text-muted">Keine Items.</td>`;
      body.appendChild(emptyRow);
    } else {
      body.innerHTML = `<div class="m-empty">Keine Items.</div>`;
    }
    return;
  }

  filtered.forEach((it, idx) => {
    const imgSrc = (it.imageUrl || (Array.isArray(it.imageUrls) ? it.imageUrls[0] : "")) || "";
    const previewHtml = imgSrc
      ? `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(it.name || "Item")}" class="menu-thumb" />`
      : `<div class="menu-thumb d-flex align-items-center justify-content-center text-muted small">No image</div>`;
    const statusLabel = it.available === false ? "NICHT VERFUEGBAR" : "VERFUEGBAR";
    const statusStyle = it.available === false
      ? "background: rgba(100, 116, 139, 0.12); color: #64748b;"
      : "background: rgba(34, 197, 94, 0.12); color: #22c55e;";
    const subtitle = it.category ? `<div class="small text-muted d-none d-sm-block">${escapeHtml(it.category)}</div>` : "";

    if (isTable) {
      const row = document.createElement("tr");
      row.className = "table-row";
      row.innerHTML = `
        <td>${previewHtml}</td>
        <td>
          <div class="fw-800">${escapeHtml(it.name || "Item")}</div>
          ${subtitle}
        </td>
        <td class="text-center">
          <span class="status-badge" style="${statusStyle}">${statusLabel}</span>
        </td>
        <td class="text-end">
          <button class="btn btn-light btn-sm rounded-pill fw-700 px-3" type="button" data-mi-edit="${idx}"><i class="fas fa-edit me-1"></i> Edit</button>
          ${canDelete ? `<button class="btn btn-light btn-sm rounded-pill fw-700 px-3 text-danger" type="button" data-mi-del="${idx}"><i class="fas fa-trash me-1"></i> Loeschen</button>` : ""}
        </td>
      `;
      body.appendChild(row);
      return;
    }

    const row = document.createElement("div");
    row.className = "m-table-row";
    const priceLabel = (it.price ?? "") === "" ? "-" : `${Number(it.price || 0).toFixed(2)} EUR`;
    const typeLabel = normalizeMenuType(it.type) === "drink" ? "Drink" : "Food";
    row.innerHTML = `
      <div>
        <div style="display:flex;gap:10px;align-items:center;">
          ${previewHtml}
          <div style="display:flex;flex-direction:column;gap:2px;">
            <strong>${escapeHtml(it.name || "Item")}</strong>
            <div class="m-muted">${escapeHtml(it.category || "")}</div>
          </div>
        </div>
      </div>
      <div>${priceLabel}</div>
      <div>${typeLabel}</div>
      <div><span class="m-badge ${it.available === false ? "m-badge--gray" : "m-badge--success"}">${statusLabel}</span></div>
      <div class="m-table-actions">
        <button class="m-btn m-btn--xs m-btn--ghost" data-mi-edit="${idx}">Bearbeiten</button>
        ${canDelete ? `<button class="m-btn m-btn--xs m-btn--danger" data-mi-del="${idx}">Loeschen</button>` : ""}
      </div>
    `;
    body.appendChild(row);
  });
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
  const ref = collection(db, "leads");

  if (role === "ceo") {
    const snap = await getDocs(query(ref, orderBy("createdAt", "desc"), limit(200)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  if (role === "staff") {
    const q1 = query(ref, where("assignedStaffId", "==", uid), limit(200));
    const q2 = query(ref, where("createdByStaffId", "==", uid), limit(200));
    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const map = new Map();
    for (const d of s1.docs) map.set(d.id, { id: d.id, ...d.data() });
    for (const d of s2.docs) map.set(d.id, { id: d.id, ...d.data() });

    const arr = Array.from(map.values());
    arr.sort((a,b) => {
      const ta = a.createdAt?.seconds ? a.createdAt.seconds : 0;
      const tb = b.createdAt?.seconds ? b.createdAt.seconds : 0;
      return tb - ta;
    });
    return arr.slice(0, 200);
  }

  return [];
}

function leadsStats(rows){
  const total = rows.length;
  const counts = { new:0, contacted:0, interested:0, no_interest:0, other:0 };
  rows.forEach(r=>{
    const s = normalizeLeadStatusKey(r.status || "");
    if (["new","open","offen"].includes(s)) counts.new++;
    else if (["contacted","waiting","follow_up","followup","no_answer","kontaktiert","warten"].includes(s)) counts.contacted++;
    else if (["interested","qualified","meeting","proposal_sent","offer_sent","negotiation","interesse","angebot_gesendet","termin"].includes(s)) counts.interested++;
    else if (["no_interest","nointerest","kein_interesse","lost","verloren","abgelehnt"].includes(s)) counts.no_interest++;
    else counts.other++;
  });
  return { total, counts };
}

const LEAD_STATUS_LABELS = {
  new: "Offen",
  contacted: "Kontaktiert",
  waiting: "Warten",
  follow_up: "Follow-up",
  followup: "Follow-up",
  qualified: "Qualifiziert",
  meeting: "Termin geplant",
  proposal_sent: "Angebot gesendet",
  offer_sent: "Angebot gesendet",
  angebot_gesendet: "Angebot gesendet",
  negotiation: "Verhandlung",
  interested: "Interesse",
  no_answer: "Keine Antwort",
  no_interest: "Kein Interesse",
  lost: "Verloren",
  converted: "Kunde erstellt"
};

const LEAD_TYPE_LABELS = {
  restaurant: "Restaurant",
  cafe: "Café",
  ecommerce: "E-Commerce",
  hotel: "Hotel",
  service: "Dienstleistung"
};

function normalizeLeadStatusKey(value){
  return foldText(value || "").replace(/[\s-]+/g, "_").trim();
}

function normalizeLeadTypeKey(value){
  const key = foldText(value || "").replace(/[\s-]+/g, "_").trim();
  return key === "e_commerce" ? "ecommerce" : key;
}

function leadStatusLabel(value){
  const key = normalizeLeadStatusKey(value || "");
  return LEAD_STATUS_LABELS[key] || value || "—";
}

function leadTypeLabel(value){
  const key = normalizeLeadTypeKey(value || "");
  return LEAD_TYPE_LABELS[key] || value || "—";
}

function normalizeLeadLabels(value){
  const list = Array.isArray(value) ? value : (typeof value === "string" ? value.split(/[;,]/) : []);
  const seen = new Set();
  const out = [];
  list.forEach((raw) => {
    const label = String(raw || "").trim();
    if (!label) return;
    const key = foldText(label);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(label);
  });
  return out;
}

function parseLeadLabelsInput(value){
  return normalizeLeadLabels(value);
}

function renderLeadLabels(labels){
  if (!labels || !labels.length) return "";
  return `<div class="m-inline" style="gap:6px; flex-wrap:wrap; margin-top:4px;">${labels.map(l => `<span class="m-badge">${esc(l)}</span>`).join("")}</div>`;
}

function renderLeadLabelFilterOptions(rows){
  const sel = $("leadsLabelFilter");
  if (!sel) return;
  const current = sel.value || "";
  const labels = new Set();
  (rows || []).forEach((r) => {
    normalizeLeadLabels(r.labels || r.tags || r.label).forEach(l => labels.add(l));
  });

  sel.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "Alle Labels";
  sel.appendChild(opt0);

  Array.from(labels).sort((a, b) => a.localeCompare(b, "de")).forEach((label) => {
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = label;
    sel.appendChild(opt);
  });

  if (current && labels.has(current)) sel.value = current;
}

function openLeadModal(mode, data={}){
  const overlay = $("leadModalOverlay");
  if (!overlay) return;
  $("leadModalTitle").textContent = (mode === "edit") ? "Lead bearbeiten" : "Neuer Lead";

  $("leadId").value = data.id || "";
  $("leadBusinessName").value = data.businessName || "";
  $("leadCustomerType").value = data.customerType || "cafe";
  $("leadContactName") && ($("leadContactName").value = data.contactName || data.contact || "");
  $("leadCity") && ($("leadCity").value = data.city || "");
  $("leadPhone").value = data.phone || "";
  $("leadInstagram") && ($("leadInstagram").value = data.insta || data.instagram || "");
  $("leadStatus").value = data.status || "new";
  $("leadLabels") && ($("leadLabels").value = normalizeLeadLabels(data.labels || data.tags || data.label).join(", "));
  $("leadNote").value = data.note || "";

  setText("leadModalStatus", "");
  show(overlay);
}

function closeLeadModal(){
  const overlay = $("leadModalOverlay");
  if (overlay) hide(overlay);
}

function closeStaffModal(){
  const overlay = $("staffModalOverlay");
  if (overlay) hide(overlay);
}

function updateProfileUi({ name, email, photoUrl }) {
  const label = name || email || "Account";
  qsa(".m-profile-name").forEach((el) => { el.textContent = label; });
  const avatars = qsa(".m-profile-avatar");
  if (!avatars.length) return;
  if (!window.__MENYRA_DEFAULT_AVATAR) {
    window.__MENYRA_DEFAULT_AVATAR = avatars[0].getAttribute("src") || "";
  }
  const src = photoUrl || window.__MENYRA_DEFAULT_AVATAR;
  if (!src) return;
  avatars.forEach((el) => { el.src = src; });
}

async function findStaffEntryForRestaurant(restaurantId, user) {
  if (!restaurantId || !user?.uid) return null;
  try {
    const direct = await getDoc(doc(db, "restaurants", restaurantId, "staff", user.uid));
    if (direct.exists()) return { id: direct.id, data: direct.data() || {} };
  } catch {}

  const uid = user.uid || "";
  const email = user.email || "";
  const candidates = [
    ["uid", uid],
    ["userId", uid],
    ["email", email]
  ];

  for (const [field, value] of candidates) {
    if (!value) continue;
    try {
      const snap = await getDocs(query(collection(db, "restaurants", restaurantId, "staff"), where(field, "==", value), limit(1)));
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return { id: docSnap.id, data: docSnap.data() || {} };
      }
    } catch (err) {
      console.warn("staff lookup failed", field, err);
    }
  }
  return null;
}

async function loadProfileForUser(role, user, restaurantId) {
  if (!user) return;
  let data = null;
  let restaurantName = "";
  try {
    if (role === "owner") {
      if (restaurantId) {
        const entry = await findStaffEntryForRestaurant(restaurantId, user);
        if (entry) data = entry.data;
        const rsnap = await getDoc(doc(db, "restaurants", restaurantId));
        if (rsnap.exists()) {
          const rdata = rsnap.data() || {};
          restaurantName = rdata.name || rdata.restaurantName || "";
        }
      }
    } else if (role === "ceo") {
      const snap = await getDoc(doc(db, "superadmins", user.uid));
      if (snap.exists()) data = snap.data();
    } else if (role === "staff") {
      let snap = await getDoc(doc(db, "staffAdmins", user.uid));
      if (!snap.exists()) snap = await getDoc(doc(db, "superadmins", user.uid));
      if (snap.exists()) data = snap.data();
    }
  } catch (err) {
    console.error("profile load failed", err);
  }
  const email = user.email || data?.email || "";
  let name = data?.name || user.displayName || (email ? email.split("@")[0] : "");
  if (role === "owner" && restaurantName) name = `${name} • ${restaurantName}`;
  const photoUrl = data?.photoUrl || user.photoURL || "";
  updateProfileUi({ name, email, photoUrl });
}

async function collectRestaurantsByStaffField(field, value, limitCount = 10) {
  if (!field || !value) return [];
  try {
    const snap = await getDocs(query(collectionGroup(db, "staff"), where(field, "==", value), limit(limitCount)));
    if (snap.empty) return [];
    const ids = [];
    snap.forEach((docSnap) => {
      const rid = docSnap.ref.parent?.parent?.id || "";
      if (rid) ids.push(rid);
    });
    return ids;
  } catch (err) {
    console.warn("staff lookup failed", field, err);
    return [];
  }
}

async function findRestaurantsByOwner(user) {
  if (!user) return [];
  const ids = new Set();
  const uid = user.uid || "";
  const email = user.email || "";
  try {
    if (uid) {
      const snap = await getDocs(query(collection(db, "restaurants"), where("ownerUid", "==", uid), limit(10)));
      snap.forEach((docSnap) => ids.add(docSnap.id));
    }
  } catch (err) {
    console.warn("ownerUid lookup failed", err);
  }
  try {
    if (email) {
      const snap = await getDocs(query(collection(db, "restaurants"), where("ownerEmail", "==", email), limit(10)));
      snap.forEach((docSnap) => ids.add(docSnap.id));
    }
  } catch (err) {
    console.warn("ownerEmail lookup failed", err);
  }
  const list = Array.from(ids);
  if (!list.length) return [];
  const docs = await Promise.all(list.map(id => getDoc(doc(db, "restaurants", id)).catch(() => null)));
  return list.map((id, idx) => {
    const rsnap = docs[idx];
    const rdata = (rsnap && typeof rsnap.exists === "function" && rsnap.exists()) ? (rsnap.data() || {}) : {};
    const name = rdata?.name || rdata?.restaurantName || id;
    return { id, name };
  });
}

async function findRestaurantsForStaffUser(user) {
  if (!user) return [];
  const uid = user.uid || "";
  const email = user.email || "";
  const ids = new Set();

  (await collectRestaurantsByStaffField(documentId(), uid)).forEach(id => ids.add(id));
  (await collectRestaurantsByStaffField("uid", uid)).forEach(id => ids.add(id));
  (await collectRestaurantsByStaffField("userId", uid)).forEach(id => ids.add(id));
  (await collectRestaurantsByStaffField("email", email)).forEach(id => ids.add(id));
  (await findRestaurantsByOwner(user)).forEach(r => ids.add(r.id));

  const uniqueIds = Array.from(ids);
  if (!uniqueIds.length) return [];
  const docs = await Promise.all(uniqueIds.map(id => getDoc(doc(db, "restaurants", id)).catch(() => null)));
  return uniqueIds.map((id, idx) => {
    const rsnap = docs[idx];
    const rdata = (rsnap && typeof rsnap.exists === "function" && rsnap.exists()) ? (rsnap.data() || {}) : {};
    const name = rdata?.name || rdata?.restaurantName || id;
    return { id, name };
  });
}

function showRestaurantPicker(restaurants, preferredId = "") {
  return new Promise((resolve) => {
    if (!Array.isArray(restaurants) || !restaurants.length) return resolve("");
    const existing = document.getElementById("ownerRestaurantPickerOverlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.className = "m-modal-overlay";
    overlay.id = "ownerRestaurantPickerOverlay";
    overlay.innerHTML = `
      <div class="m-modal" style="max-width:420px;">
        <div class="m-modal-header">
          <h3 class="m-modal-title">Restaurant waehlen</h3>
          <button class="m-icon-btn" type="button" id="ownerRestaurantPickerClose">x</button>
        </div>
        <div class="m-modal-body">
          <div class="m-input-group">
            <label for="ownerRestaurantPick">Restaurant</label>
            <select id="ownerRestaurantPick" class="m-select2"></select>
          </div>
          <div class="m-inline" style="justify-content:flex-end; gap:10px; margin-top:14px;">
            <button class="m-btn" type="button" id="ownerRestaurantPickBtn">Weiter</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const sel = overlay.querySelector("#ownerRestaurantPick");
    restaurants.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.name || r.id;
      sel.appendChild(opt);
    });
    if (preferredId && restaurants.some(r => r.id === preferredId)) {
      sel.value = preferredId;
    }
    const close = () => {
      try { overlay.remove(); } catch {}
      resolve("");
    };
    overlay.querySelector("#ownerRestaurantPickerClose")?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector("#ownerRestaurantPickBtn")?.addEventListener("click", () => {
      const value = sel.value;
      try { overlay.remove(); } catch {}
      resolve(value || "");
    });
  });
}

async function resolveOwnerRestaurantId(user, preferredId = "", listOverride = null) {
  const list = Array.isArray(listOverride) ? listOverride : await findRestaurantsForStaffUser(user);
  if (list.length === 1) return list[0].id;
  if (list.length > 1) {
    const preferredOk = preferredId && list.some(r => r.id === preferredId);
    const chosen = await showRestaurantPicker(list, preferredOk ? preferredId : "");
    if (chosen) return chosen;
    if (preferredOk) return preferredId;
    return list[0]?.id || "";
  }
  return "";
}

function applyLeadsFilter(allRows){
  const term = foldText(($("leadsSearch")?.value || "").trim());
  const statusFilter = normalizeLeadStatusKey($("leadsStatusFilter")?.value || "");
  const typeFilter = normalizeLeadTypeKey($("leadsTypeFilter")?.value || "");
  const labelFilter = foldText(($("leadsLabelFilter")?.value || "").trim());

  return (allRows || []).filter(r=>{
    const statusKey = normalizeLeadStatusKey(r.status || "");
    if (statusFilter && statusKey !== statusFilter) return false;

    const typeKey = normalizeLeadTypeKey(r.customerType || "");
    if (typeFilter && typeKey !== typeFilter) return false;

    const labels = normalizeLeadLabels(r.labels || r.tags || r.label);
    if (labelFilter && !labels.some(l => foldText(l) === labelFilter)) return false;

    if (!term) return true;
    const insta = r.insta || r.instagram || "";
    const contact = r.contactName || r.contact || "";
    const hay = foldText(`${r.businessName} ${r.city} ${contact} ${r.phone} ${insta} ${r.status} ${r.customerType} ${labels.join(" ")}`);
    return hay.includes(term);
  });
}

function renderLeadsTable(rows){
  const body = $("leadsTableBody");
  if (!body) return;
  body.innerHTML = "";

  const useSwipe = body.classList.contains("swipe-list") || body.dataset.viewStyle === "swipe";
  if (useSwipe) {
    if (!rows.length) {
      body.innerHTML = `<div class="m-muted" style="padding:10px;">Keine Leads.</div>`;
      setText("leadsMeta", "-");
      return;
    }

    const toneForStatus = (value) => {
      const key = normalizeLeadStatusKey(value || "");
      if (key === "new") return { bg: "rgba(99, 102, 241, 0.12)", color: "#6366f1" };
      if (["contacted", "waiting", "follow_up", "meeting", "proposal_sent", "negotiation", "qualified"].includes(key)) {
        return { bg: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" };
      }
      if (["interested", "converted"].includes(key)) return { bg: "rgba(34, 197, 94, 0.12)", color: "#22c55e" };
      if (["no_interest", "lost"].includes(key)) return { bg: "rgba(100, 116, 139, 0.12)", color: "#64748b" };
      return { bg: "rgba(148, 163, 184, 0.16)", color: "#64748b" };
    };

    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "swipe-container";
      const statusLabel = leadStatusLabel(r.status || "");
      const tone = toneForStatus(r.status || "");
      const insta = String(r.insta || r.instagram || "").trim();
      const phone = String(r.phone || "").trim();
      const email = String(r.email || "").trim();
      let metaIcon = "fas fa-circle-info text-muted";
      let metaText = "Kontakt";
      if (insta) {
        metaIcon = "fab fa-instagram text-danger";
        metaText = insta.startsWith("@") ? insta : `@${insta}`;
      } else if (phone) {
        metaIcon = "fas fa-phone text-success";
        metaText = phone;
      } else if (email) {
        metaIcon = "fas fa-envelope text-primary";
        metaText = email;
      }

      row.innerHTML = `
        <div class="swipe-actions-left"><i class="fas fa-archive mb-1 fs-5"></i><span>Archiv</span></div>
        <div class="swipe-actions-right"><i class="fas fa-trash mb-1 fs-5"></i><span>Loeschen</span></div>
        <div class="swipe-content" data-act="lead-edit" data-id="${esc(r.id)}">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-light rounded-circle p-3 d-none d-sm-block"><i class="fas fa-store text-muted"></i></div>
            <div>
              <div class="fw-800">${esc(r.businessName || "-")}</div>
              <div class="small text-muted"><i class="${metaIcon} me-1"></i>${esc(metaText)}</div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="status-badge" style="background:${tone.bg};color:${tone.color};">${esc(statusLabel)}</span>
          </div>
        </div>
      `;
      body.appendChild(row);
    });

    setText("leadsMeta", rows.length ? `Zeilen: ${rows.length}` : "-");
    return;
  }

  rows.forEach(r=>{
    const typeLabel = leadTypeLabel(r.customerType || "");
    const labels = normalizeLeadLabels(r.labels || r.tags || r.label);
    const labelsHtml = renderLeadLabels(labels);
    const city = r.city ? ` - ${esc(r.city)}` : "";
    const contactName = r.contactName || r.contact || "";
    const phone = r.phone || "";
    const insta = r.insta || r.instagram || "";
    const contactLine2 = contactName ? (phone || insta) : (insta || phone);
    const statusLabel = leadStatusLabel(r.status || "");
    const row = document.createElement("div");
    row.className = "m-table-row";
    row.innerHTML = `
      <div>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <b>${esc(r.businessName || "-")}</b>
          <span class="m-muted" style="font-size:12px;">${esc(typeLabel)}${city}</span>
          ${labelsHtml}
        </div>
      </div>
      <div>
        <div style="display:flex; flex-direction:column; gap:2px;">
          <span>${esc(contactName || phone || "-")}</span>
          <span class="m-muted" style="font-size:12px;">${esc(contactLine2 || "")}</span>
          ${contactName && insta ? `<span class="m-muted" style="font-size:12px;">${esc(insta)}</span>` : ""}
        </div>
      </div>
      <div><span class="m-badge">${esc(statusLabel)}</span></div>
      <div class="m-table-col-actions" style="display:flex; gap:8px; justify-content:flex-end;">
        <button class="m-btn m-btn--small m-btn--ghost" type="button" data-act="lead-edit" data-id="${esc(r.id)}">Edit</button>
        <button class="m-btn m-btn--small" type="button" data-act="lead-to-customer" data-id="${esc(r.id)}">-> Kunde</button>
      </div>
    `;
    body.appendChild(row);
  });
  setText("leadsMeta", rows.length ? `Zeilen: ${rows.length}` : "-");
}

// =========================================================
// STAFF MANAGEMENT (CEO/Staff)
// =========================================================

const SYSTEM_STAFF_ROLE_LABELS = {
  ceo: "CEO",
  staff: "Staff Admin"
};

const RESTAURANT_STAFF_ROLE_LABELS = {
  owner: "Owner",
  admin: "Owner",
  manager: "Manager",
  waiter: "Kamarier",
  kitchen: "Kuzhina"
};

const RESTAURANT_STAFF_ROLE_ORDER = ["owner", "admin", "manager", "waiter", "kitchen"];

function normalizeRoleValue(value) {
  const key = String(value || "").trim().toLowerCase();
  const aliases = {
    kamarier: "waiter",
    kamarieri: "waiter",
    garson: "waiter",
    kuzhina: "kitchen",
    kuzhinier: "kitchen",
    kuzhinieri: "kitchen",
    chef: "kitchen",
    cook: "kitchen"
  };
  return aliases[key] || key;
}

function normalizeRoleList(value) {
  const raw = Array.isArray(value) ? value : (value ? [value] : []);
  const out = [];
  const seen = new Set();
  raw.forEach((role) => {
    const key = normalizeRoleValue(role);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
  });
  return out;
}

function normalizeRestaurantRoles(value) {
  const roles = normalizeRoleList(value);
  return roles.filter(r => RESTAURANT_STAFF_ROLE_ORDER.includes(r));
}

function pickRoleValue(...values) {
  for (const v of values) {
    if (Array.isArray(v)) {
      if (v.length) return v;
      continue;
    }
    if (v) return v;
  }
  return "";
}

function pickPrimaryRestaurantRole(roles) {
  const list = normalizeRestaurantRoles(roles);
  for (const role of RESTAURANT_STAFF_ROLE_ORDER) {
    if (list.includes(role)) return role;
  }
  return list[0] || "waiter";
}

function staffRoleLabel(roleOrRoles, kind) {
  const roles = normalizeRoleList(roleOrRoles);
  if (!roles.length) return "-";
  const map = (kind === "restaurant") ? RESTAURANT_STAFF_ROLE_LABELS : SYSTEM_STAFF_ROLE_LABELS;
  const labels = roles.map((r) => map[r] || r);
  return labels.join(", ");
}

function isOwnerRole(roleOrRoles) {
  const roles = normalizeRoleList(roleOrRoles);
  return roles.includes("owner") || roles.includes("admin");
}

async function upsertStaffIndex({ uid, restaurantId, name, email }) {
  if (!uid || !restaurantId) return;
  const payload = {
    uid,
    userId: uid,
    name: name || "",
    email: email || "",
    emailLower: String(email || "").toLowerCase(),
    restaurantIds: arrayUnion(restaurantId),
    updatedAt: serverTimestamp()
  };
  try {
    await setDoc(doc(db, "staffIndex", uid), payload, { merge: true });
  } catch (err) {
    console.warn("staffIndex update failed", err);
  }
}

function fileExtFromName(name) {
  const base = String(name || "").trim();
  if (!base || !base.includes(".")) return "jpg";
  const ext = base.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || "jpg";
}

async function uploadStaffPhotoFile({ file, pathBase }) {
  if (!file || !pathBase) return "";
  const ext = fileExtFromName(file.name);
  const path = `${pathBase}.${ext}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file);
  return await getDownloadURL(ref);
}

let __secondaryAuth = null;
function getSecondaryAuth() {
  if (__secondaryAuth) return __secondaryAuth;
  const existing = getApps().find((a) => a.name === "menyra-secondary");
  const secondaryApp = existing || initializeApp(app.options, "menyra-secondary");
  __secondaryAuth = getAuth(secondaryApp);
  return __secondaryAuth;
}

async function createAuthUser(email, password) {
  const auth2 = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(auth2, email, password);
  try { await signOut(auth2); } catch {}
  return cred.user;
}

async function fetchSystemStaff() {
  const [supSnap, staffSnap] = await Promise.all([
    getDocs(collection(db, "superadmins")),
    getDocs(collection(db, "staffAdmins"))
  ]);
  const rows = [];
  supSnap.forEach((d) => rows.push({ id: d.id, ...(d.data() || {}), role: "ceo", kind: "system" }));
  staffSnap.forEach((d) => rows.push({ id: d.id, ...(d.data() || {}), role: "staff", kind: "system" }));
  return rows;
}

async function fetchStaffRequests(role, uid) {
  const ref = collection(db, "staffRequests");
  let snap = null;
  if (role === "staff" && uid) {
    try {
      snap = await getDocs(query(ref, where("createdByUid", "==", uid)));
    } catch (_) { snap = null; }
  }
  if (!snap) snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
}

async function fetchRestaurantStaff(restaurantId) {
  if (!restaurantId) return [];
  const snap = await getDocs(collection(db, "restaurants", restaurantId, "staff"));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
}

async function createSystemStaffAccount({ name, email, password, role, photoUrl, createdByUid, createdByRole }) {
  const user = await createAuthUser(email, password);
  const payload = {
    uid: user.uid,
    userId: user.uid,
    name: name || "",
    email: email || "",
    role: role || "staff",
    photoUrl: photoUrl || "",
    status: "active",
    createdAt: serverTimestamp(),
    createdByUid: createdByUid || null,
    createdByRole: createdByRole || null
  };
  const col = role === "ceo" ? "superadmins" : "staffAdmins";
  await setDoc(doc(db, col, user.uid), payload, { merge: true });
  return user.uid;
}

async function createRestaurantStaffAccount({ restaurantId, name, email, password, role, roles, photoUrl, createdByUid, createdByRole }) {
  const user = await createAuthUser(email, password);
  const normalizedRoles = normalizeRestaurantRoles(roles || role || "waiter");
  const primaryRole = pickPrimaryRestaurantRole(normalizedRoles);
  const payload = {
    uid: user.uid,
    userId: user.uid,
    name: name || "",
    email: email || "",
    role: primaryRole,
    roles: normalizedRoles,
    photoUrl: photoUrl || "",
    status: "active",
    createdAt: serverTimestamp(),
    createdByUid: createdByUid || null,
    createdByRole: createdByRole || null
  };
  await setDoc(doc(db, "restaurants", restaurantId, "staff", user.uid), payload, { merge: true });
  await upsertStaffIndex({
    uid: user.uid,
    restaurantId,
    name: name || "",
    email: email || ""
  });
  if (isOwnerRole(normalizedRoles)) {
    await setDoc(doc(db, "restaurants", restaurantId), {
      ownerUid: user.uid,
      ownerEmail: email || "",
      ownerName: name || "",
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
  return user.uid;
}

async function updateSystemStaffAccount({ uid, currentRole, nextRole, name, email, photoUrl, updatedByUid, updatedByRole }) {
  if (!uid) return;
  const payload = {
    name: name || "",
    email: email || "",
    role: nextRole || currentRole || "staff",
    photoUrl: photoUrl || "",
    updatedAt: serverTimestamp(),
    updatedByUid: updatedByUid || null,
    updatedByRole: updatedByRole || null
  };
  const fromCol = currentRole === "ceo" ? "superadmins" : "staffAdmins";
  const toCol = nextRole === "ceo" ? "superadmins" : "staffAdmins";
  if (fromCol === toCol) {
    await setDoc(doc(db, fromCol, uid), payload, { merge: true });
    return;
  }
  await setDoc(doc(db, toCol, uid), payload, { merge: true });
  await deleteDoc(doc(db, fromCol, uid));
}

async function updateRestaurantStaffAccount({ restaurantId, uid, role, roles, name, email, photoUrl, updatedByUid, updatedByRole }) {
  if (!restaurantId || !uid) return;
  const normalizedRoles = normalizeRestaurantRoles(roles || role || "waiter");
  const primaryRole = pickPrimaryRestaurantRole(normalizedRoles);
  const payload = {
    uid,
    userId: uid,
    name: name || "",
    email: email || "",
    role: primaryRole,
    roles: normalizedRoles,
    photoUrl: photoUrl || "",
    updatedAt: serverTimestamp(),
    updatedByUid: updatedByUid || null,
    updatedByRole: updatedByRole || null
  };
  await setDoc(doc(db, "restaurants", restaurantId, "staff", uid), payload, { merge: true });
  await upsertStaffIndex({
    uid,
    restaurantId,
    name: name || "",
    email: email || ""
  });
  if (isOwnerRole(normalizedRoles)) {
    await setDoc(doc(db, "restaurants", restaurantId), {
      ownerUid: uid,
      ownerEmail: email || "",
      ownerName: name || "",
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
}

async function deleteSystemStaffAccount(uid, role) {
  if (!uid) return;
  const col = role === "ceo" ? "superadmins" : "staffAdmins";
  await deleteDoc(doc(db, col, uid));
}

async function deleteRestaurantStaffAccount(restaurantId, uid) {
  if (!restaurantId || !uid) return;
  await deleteDoc(doc(db, "restaurants", restaurantId, "staff", uid));
}

async function createStaffRequest(payload) {
  const ref = await addDoc(collection(db, "staffRequests"), {
    ...payload,
    status: "pending",
    createdAt: serverTimestamp()
  });
  return ref.id;
}

async function updateStaffRequest(requestId, payload) {
  if (!requestId) return;
  await setDoc(doc(db, "staffRequests", requestId), payload, { merge: true });
}

// =========================================================
// STORIES VIEW (Owner)
// =========================================================

function fmtTs(ts){
  try {
    if (ts && typeof ts.toDate === "function") ts = ts.toDate();
  } catch {}
  if (!(ts instanceof Date)) return "";
  try {
    return new Intl.DateTimeFormat("de-AT", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    }).format(ts);
  } catch {
    return ts.toLocaleString();
  }
}

async function refreshOwnerStories(restaurantId){
  const listEl = $("storyList");
  const metaEl = $("storyListMeta");
  if (!listEl) return;

  listEl.innerHTML = "";
  metaEl && (metaEl.textContent = "Lade…");

  let rows = [];
  try {
    rows = await listActiveStories(restaurantId, 10);
  } catch (err){
    console.error(err);
    metaEl && (metaEl.textContent = "Fehler beim Laden.");
    listEl.innerHTML = `<div class="m-muted">Stories konnten nicht geladen werden.</div>`;
    return;
  }

  metaEl && (metaEl.textContent = rows.length ? `${rows.length} aktiv` : "Keine aktiven Stories");
  if (!rows.length){
    listEl.innerHTML = `<div class="m-muted">Noch keine Storys – lade oben ein Video hoch.</div>`;
    return;
  }

  rows.forEach((s) => {
    const row = document.createElement("div");
    row.className = "m-story-row";

    const left = document.createElement("div");
    left.className = "m-story-left";

    const iframe = document.createElement("iframe");
    iframe.className = "m-story-thumb";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    const embedUrl = (s.embedUrl || "").trim() || (s.libraryId && s.videoId
      ? `https://iframe.mediadelivery.net/embed/${encodeURIComponent(String(s.libraryId))}/${encodeURIComponent(String(s.videoId))}`
      : "");
    iframe.src = embedUrl ? `${embedUrl}?autoplay=false&loop=true&muted=true&preload=true` : "about:blank";
    iframe.loading = "lazy";

    const info = document.createElement("div");
    info.className = "m-story-info";
    const titleHtml = s.title ? `<div style="font-weight:600; margin-bottom:4px;">${esc(s.title)}</div>` : '';
    const descHtml = s.description ? `<div class="m-muted" style="font-size:13px; margin-bottom:6px;">${esc(s.description)}</div>` : '';
    const menuLinkHtml = s.menuItemId ? `<div class="m-muted" style="font-size:12px;">🔗 Verlinkt mit Menu Item</div>` : '';
    info.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <b>Story</b>
        <span class="m-badge">${esc(s.status || "processing")}</span>
      </div>
      ${titleHtml}
      ${descHtml}
      ${menuLinkHtml}
      <div class="m-muted" style="font-size:12px;">VideoID: ${esc(s.videoId || "—")}</div>
      <div class="m-muted" style="font-size:12px;">Ablauf: ${fmtTs(s.expiresAt) || "—"}</div>
    `;

    left.appendChild(iframe);
    left.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "m-story-actions";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "m-btn m-btn--small m-btn--ghost";
    delBtn.textContent = "Löschen";
    delBtn.addEventListener("click", async () => {
      const st = $("storyStatus");
      delBtn.disabled = true;
      st && (st.textContent = "Lösche Story…");
      try {
        if (s.videoId) {
          try { await postJson(`${BUNNY_EDGE_BASE}/story/delete`, { videoId: s.videoId }); } catch (e) { console.warn(e); }
        }
        await deleteStoryDoc(restaurantId, s.id);
        st && (st.textContent = "Story gelöscht.");
        await refreshOwnerStories(restaurantId);
      } catch (err){
        console.error(err);
        st && (st.textContent = "Löschen fehlgeschlagen.");
      } finally {
        delBtn.disabled = false;
      }
    });

    actions.appendChild(delBtn);

    row.appendChild(left);
    row.appendChild(actions);
    listEl.appendChild(row);
  });
}

async function cleanupExpiredStories(restaurantId, { userInitiated = false } = {}){
  const st = $("storyStatus");
  const btn = $("storyCleanupBtn");
  btn && (btn.disabled = true);
  try {
    st && (st.textContent = userInitiated ? "Cleanup läuft…" : "Cleanup…");
    const expired = await listExpiredStories(restaurantId, 25);
    if (!expired.length){
      st && (st.textContent = "Keine abgelaufenen Stories.");
      return 0;
    }
    let removed = 0;
    for (const s of expired){
      if (s.videoId) {
        try { await postJson(`${BUNNY_EDGE_BASE}/story/delete`, { videoId: s.videoId }); } catch (e) { console.warn(e); }
      }
      try { await deleteStoryDoc(restaurantId, s.id); removed++; } catch (e) { console.warn(e); }
    }
    st && (st.textContent = `Cleanup: ${removed}/${expired.length} entfernt.`);
    return removed;
  } catch (err){
    console.error(err);
    st && (st.textContent = "Cleanup Fehler.");
    return 0;
  } finally {
    btn && (btn.disabled = false);
  }
}

async function loadMenuItemsForStorySelect(restaurantId) {
  const select = $("storyMenuItemSelect");
  if (!select) return;

  try {
    const items = await loadPublicMenuItems(restaurantId);
    select.innerHTML = `<option value="">— Kein Link —</option>`;
    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name || `Item ${item.id}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.warn("Failed to load menu items for story select:", err);
    select.innerHTML = `<option value="">— Fehler beim Laden —</option>`;
  }
}

async function initOwnerStoriesUI({ restaurantId, user }){
  // Only if view exists in current HTML
  if (!$("storyFileInput") || !$("storyUploadBtn") || !$("storyList")) return;
  if (!restaurantId) return;

  // One-time wiring per page
  if (window.__MENYRA__storiesBound) {
    // still refresh when restaurant changes
    await refreshOwnerStories(restaurantId);
    return;
  }
  window.__MENYRA__storiesBound = true;

  // Guest link
  const openGuest = $("storyOpenGuestBtn");
  if (openGuest) {
    openGuest.href = `../guest/story/index.html?r=${encodeURIComponent(restaurantId)}`;
  }

  // Menu items für Story-Verlinkung laden
  await loadMenuItemsForStorySelect(restaurantId);

  // Cleanup button
  $("storyCleanupBtn")?.addEventListener("click", async () => {
    await cleanupExpiredStories(restaurantId, { userInitiated: true });
    await refreshOwnerStories(restaurantId);
  });

  // Automatic cleanup: max once per day per restaurant (to keep costs low)
  const cleanupKey = `menyra_story_cleanup_${restaurantId}`;
  const lastCleanup = Number(lsGet(cleanupKey) || 0);
  if (!lastCleanup || (nowMs() - lastCleanup) > 23 * 60 * 60 * 1000) {
    try {
      await cleanupExpiredStories(restaurantId, { userInitiated: false });
      lsSet(cleanupKey, nowMs());
    } catch {}
  }

  // Upload - zurück zu Stream, aber speichere direkte Stream-URL
  const input = $("storyFileInput");
  const btn = $("storyUploadBtn");
  const prog = $("storyProgress");
  const st = $("storyStatus");

  btn.addEventListener("click", async () => {
    const file = input?.files?.[0];
    if (!file) {
      st && (st.textContent = "Bitte ein Video auswählen.");
      return;
    }

    btn.disabled = true;
    try {
      st && (st.textContent = "Prüfe Video…");
      const dur = await getVideoDurationSeconds(file);
      if (!dur || dur <= 0) {
        st && (st.textContent = "Video-Dauer konnte nicht gelesen werden.");
        return;
      }
      if (dur > 15.05) {
        st && (st.textContent = `Zu lang: ${dur.toFixed(1)}s (max 15s).`);
        return;
      }

      st && (st.textContent = "Prüfe aktive Stories…");
      const activeCount = await countActiveStories(restaurantId, 10);
      if (activeCount >= 10) {
        st && (st.textContent = "Limit erreicht: max. 10 aktive Stories.");
        return;
      }

      await ensureTus();
      st && (st.textContent = "Upload startet…");
      prog && (prog.value = 0);

      const start = await postJson(`${BUNNY_EDGE_BASE}/story/start`, { restaurantId });

      const tus = window.tus;
      const upload = new tus.Upload(file, {
        endpoint: start.tusEndpoint,
        headers: start.uploadHeaders,
        retryDelays: [0, 1000, 3000, 5000],
        metadata: {
          filename: file.name,
          filetype: file.type
        },
        onError: async (error) => {
          console.error(error);
          st && (st.textContent = "Upload Fehler.");
          try { await postJson(`${BUNNY_EDGE_BASE}/story/delete`, { videoId: start.videoId }); } catch {}
          btn.disabled = false;
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const pct = bytesTotal ? Math.floor((bytesUploaded / bytesTotal) * 100) : 0;
          prog && (prog.value = pct);
          st && (st.textContent = `Upload: ${pct}%`);
        },
        onSuccess: async () => {
          prog && (prog.value = 100);
          st && (st.textContent = "Upload fertig. Speichere Story…");
          try {
            const ttlHours = start?.limits?.ttlHours || start?.ttlHours || 24;
            // Speichere HLS-URL für Bunny Stream (funktioniert in allen Browsern mit hls.js)
            const videoUrl = `https://vz-de.b-cdn.net/${encodeURIComponent(String(start.videoId))}/index.m3u8`;

            // Neue Felder auslesen
            const titleInput = $("storyTitleInput");
            const descInput = $("storyDescInput");
            const menuItemSelect = $("storyMenuItemSelect");

            await addStoryDoc(restaurantId, {
              libraryId: start.libraryId,
              videoId: start.videoId,
              videoUrl, // Direkte Stream-URL für <video> Element
              createdByUid: user.uid,
              ttlHours,
              status: "active",
              embedUrl: `https://iframe.mediadelivery.net/embed/${encodeURIComponent(String(start.libraryId))}/${encodeURIComponent(String(start.videoId))}`,
              title: titleInput?.value?.trim() || null,
              description: descInput?.value?.trim() || null,
              menuItemId: menuItemSelect?.value?.trim() || null
            });

            st && (st.textContent = "Story gespeichert.");
            // Felder zurücksetzen
            if (input) input.value = "";
            if (titleInput) titleInput.value = "";
            if (descInput) descInput.value = "";
            if (menuItemSelect) menuItemSelect.value = "";
            await refreshOwnerStories(restaurantId);
          } catch (err){
            console.error(err);
            st && (st.textContent = "Speichern fehlgeschlagen. Lösche Video…");
            try { await postJson(`${BUNNY_EDGE_BASE}/story/delete`, { videoId: start.videoId }); } catch {}
          } finally {
            btn.disabled = false;
          }
        }
      });

      upload.start();
    } catch (err) {
      console.error(err);
      st && (st.textContent = "Fehler: " + (err.message || "Unbekannt"));
      btn.disabled = false;
    }
  });


  // Initial load
  await refreshOwnerStories(restaurantId);
}

export async function bootPlatformAdmin({ role = "ceo", roleLabel = "Platform", restrictRestaurantId = null } = {}) {
  const nav = initNav();
  document.documentElement.classList.add("m-boot");

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
  $("staffModalClose")?.addEventListener("click", closeStaffModal);
  $("staffCancelBtn")?.addEventListener("click", closeStaffModal);


  // When clicking outside (overlay)
  $("customerModalOverlay")?.addEventListener("click", (e) => { if (e.target?.id === "customerModalOverlay") closeCustomerModal(); });
  $("qrModalOverlay")?.addEventListener("click", (e) => { if (e.target?.id === "qrModalOverlay") closeQrModal(); });
  $("leadModalOverlay")?.addEventListener("click", (e) => { if (e.target?.id === "leadModalOverlay") closeLeadModal(); });
  $("staffModalOverlay")?.addEventListener("click", (e) => { if (e.target?.id === "staffModalOverlay") closeStaffModal(); });


  // Owner mode: restrict restaurant id from URL if not passed
  if (role === "owner" && !restrictRestaurantId) {
    restrictRestaurantId = requireParam("r");
  }

  // Hide sections depending on role
  if (role === "owner") {
    // hide customers/leads in nav & mobile nav
    qsa('[data-section="customers"], [data-section="leads"], [data-section="staff"]').forEach(a => a.style.display = "none");
    const newBtn = $("newCustomerBtn");
    if (newBtn) newBtn.style.display = "none";
    // show offers as default
    nav.showView("offers");
  }

  // Sign in gate
  mountLoginModal(`${roleLabel} Login`, { allowBootstrap: role === "ceo" });
  setBootLabel(roleLabel);
  setBootStatus("Zugang wird geladen …");

  let currentUser = null;
  const restaurants = [];
  const leadsAll = [];
  const systemStaff = [];
  const staffRequests = [];
  let restaurantStaff = [];
  let activeStoriesCache = [];
  let nextPayExpanded = false;
  let storiesExpanded = false;
  let swipeLiveUnsub = null;
  let loginShowTimer = null;

  function initSwipeUi() {
    const viewport = $("dashSwipeViewport");
    const track = $("dashSwipeTrack");
    const dotsHost = $("dashSwipeDots");
    if (!viewport || !track) return;

    const slides = Array.from(track.children);
    if (dotsHost) dotsHost.innerHTML = "";
  }

  initSwipeUi();

  $("dashNextPayToggle")?.addEventListener("click", () => {
    nextPayExpanded = !nextPayExpanded;
    const icon = $("dashNextPayToggleIcon");
    if (icon) icon.textContent = nextPayExpanded ? "↑" : "↓";
    renderNextPayList(buildNextPayItems(restaurants), nextPayExpanded, false);
  });

  $("dashActiveStoriesToggle")?.addEventListener("click", () => {
    storiesExpanded = !storiesExpanded;
    const btn = $("dashActiveStoriesToggle");
    if (btn) btn.textContent = storiesExpanded ? "↑" : "↓";
    renderStoriesList(activeStoriesCache, storiesExpanded, false);
  });

// Leads UI (CEO/Staff)
$("newLeadBtn")?.addEventListener("click", () => openLeadModal("new", {}));
$("leadsSearch")?.addEventListener("input", () => { window.__MENYRA__refreshLeads && window.__MENYRA__refreshLeads(); });
["leadsStatusFilter", "leadsTypeFilter", "leadsLabelFilter"].forEach((id) => {
  $(id)?.addEventListener("change", () => { window.__MENYRA__refreshLeads && window.__MENYRA__refreshLeads(); });
});
$("leadsClearFilters")?.addEventListener("click", () => {
  const statusSel = $("leadsStatusFilter");
  const typeSel = $("leadsTypeFilter");
  const labelSel = $("leadsLabelFilter");
  if (statusSel) statusSel.value = "";
  if (typeSel) typeSel.value = "";
  if (labelSel) labelSel.value = "";
  window.__MENYRA__refreshLeads && window.__MENYRA__refreshLeads();
});

$("leadForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = currentUser;
  if (!user) return;

  const leadId = ($("leadId")?.value || "").trim();
  const instagram = ($("leadInstagram")?.value || "").trim();
  const payload = {
    businessName: ($("leadBusinessName")?.value || "").trim(),
    customerType: ($("leadCustomerType")?.value || "cafe").trim(),
    contactName: ($("leadContactName")?.value || "").trim(),
    contact: ($("leadContactName")?.value || "").trim(),
    city: ($("leadCity")?.value || "").trim(),
    phone: ($("leadPhone")?.value || "").trim(),
    insta: instagram,
    instagram,
    labels: parseLeadLabelsInput($("leadLabels")?.value || ""),
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



  // Staff UI (CEO/Staff)
  let systemStaffMap = new Map();
  const staffIndexBackfillDone = new Set();

  function setStaffModalStatus(text) {
    setText("staffModalStatus", text || "");
  }

  function setStaffModalMode(mode) {
    const btn = $("staffSaveBtn");
    if (!btn) return;
    if (mode === "request") btn.textContent = "Anfrage senden";
    else if (mode === "approve") btn.textContent = "Approve";
    else btn.textContent = "Speichern";
  }

  function configureStaffModal(kind, mode) {
    const systemRow = $("staffSystemRoleRow");
    const restaurantRow = $("staffRestaurantRow");
    const passwordRow = $("staffPasswordRow");
    if (kind === "restaurant") {
      if (restaurantRow) restaurantRow.style.display = "";
      if (systemRow) systemRow.style.display = "none";
    } else {
      if (systemRow) systemRow.style.display = "";
      if (restaurantRow) restaurantRow.style.display = "none";
    }
    const showPassword = (mode === "new" || mode === "approve");
    if (passwordRow) passwordRow.style.display = showPassword ? "" : "none";
  }

  function fillStaffRestaurantSelects() {
    const viewSel = $("staffRestaurantSelect");
    const modalSel = $("staffRestaurantSelectModal");
    const restaurantsList = restaurants || [];
    const options = restaurantsList.map(r => ({ id: r.id, name: r.name || r.restaurantName || r.id }));

    [viewSel, modalSel].forEach((sel) => {
      if (!sel) return;
      const current = sel.value;
      sel.innerHTML = "";
      if (!options.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Keine Kunden";
        sel.appendChild(opt);
        return;
      }
      options.forEach((optData) => {
        const opt = document.createElement("option");
        opt.value = optData.id;
        opt.textContent = optData.name;
        sel.appendChild(opt);
      });
      if (current && options.some(o => o.id === current)) sel.value = current;
    });
  }

  function fillStaffAssignSelect() {
    const sel = $("staffAssignSelect");
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "Kein Staff";
    sel.appendChild(opt0);
    systemStaff.forEach((row) => {
      const opt = document.createElement("option");
      opt.value = row.id;
      opt.textContent = row.name || row.email || row.id;
      sel.appendChild(opt);
    });
    if (current && systemStaffMap.has(current)) sel.value = current;
  }

  function syncStaffAssignSelect() {
    const sel = $("staffAssignSelect");
    const rid = $("staffRestaurantSelect")?.value || "";
    if (!sel || !rid) return;
    const row = restaurants.find(r => r.id === rid);
    sel.value = row?.assignedStaffId || "";
  }

  function getRestaurantRolesFromForm() {
    const boxes = Array.from(document.querySelectorAll('input[name="staffRestaurantRoles"]'));
    const selected = boxes.filter(b => b.checked).map(b => b.value);
    return normalizeRestaurantRoles(selected);
  }

  function setRestaurantRolesInForm(roles) {
    const list = new Set(normalizeRestaurantRoles(roles));
    const boxes = Array.from(document.querySelectorAll('input[name="staffRestaurantRoles"]'));
    boxes.forEach((b) => { b.checked = list.has(String(b.value || "").trim()); });
  }

  function openStaffModal({ mode = "new", kind = "system", data = {} } = {}) {
    const overlay = $("staffModalOverlay");
    if (!overlay) return;
    const title = $("staffModalTitle");
    const staffName = $("staffName");
    const staffEmail = $("staffEmail");
    const staffPass = $("staffPassword");
    const systemRole = $("staffSystemRole");
    const restaurantSel = $("staffRestaurantSelectModal");

    const modeTitle = (mode === "edit") ? "bearbeiten" : (mode === "request" ? "Anfrage" : (mode === "approve" ? "bestaetigen" : "neu"));
    if (title) title.textContent = (kind === "restaurant") ? `Kunden Staff ${modeTitle}` : `Menyra Staff ${modeTitle}`;

    $("staffFormMode").value = mode;
    $("staffFormKind").value = kind;
    $("staffFormUid").value = data.id || data.uid || "";
    $("staffFormCurrentRole").value = data.role || data.targetRole || "";
    $("staffFormRequestId").value = data.requestId || data.id || "";
    $("staffFormRestaurantId").value = data.restaurantId || "";
    $("staffFormPhotoUrl").value = data.photoUrl || "";

    if (staffName) staffName.value = data.name || data.displayName || "";
    if (staffEmail) {
      staffEmail.value = data.email || "";
      staffEmail.disabled = (mode === "edit");
    }
    if (staffPass) staffPass.value = "";
    const staffPhoto = $("staffPhoto");
    if (staffPhoto) staffPhoto.value = "";

    fillStaffRestaurantSelects();
    if (restaurantSel) {
      const preferred = data.restaurantId || $("staffRestaurantSelect")?.value || "";
      if (preferred) restaurantSel.value = preferred;
      if (kind === "restaurant") restaurantSel.disabled = (mode === "edit");
    }

    if (systemRole && kind === "system") {
      systemRole.value = data.role || data.targetRole || "staff";
    }
    if (kind === "restaurant") {
      const rolesValue = data.roles || data.targetRoles || data.role || data.targetRole || [];
      if (!normalizeRestaurantRoles(rolesValue).length) {
        setRestaurantRolesInForm(["waiter"]);
      } else {
        setRestaurantRolesInForm(rolesValue);
      }
    }

    configureStaffModal(kind, mode);
    setStaffModalMode(mode);
    setStaffModalStatus("");
    show(overlay);
  }

  function renderStaffRequestsTable(rows) {
    const body = $("staffRequestsBody");
    if (!body) return;
    const isTable = body.tagName === "TBODY";
    body.innerHTML = "";

    if (!rows.length) {
      if (isTable) {
        const emptyRow = document.createElement("tr");
        emptyRow.className = "table-row";
        emptyRow.innerHTML = `<td colspan="6" class="text-center text-muted">Keine Anfragen.</td>`;
        body.appendChild(emptyRow);
      } else {
        body.innerHTML = `<div class="m-muted" style="padding:10px;">Keine Anfragen.</div>`;
      }
      setText("staffRequestsMeta", "-");
      return;
    }

    rows.forEach((req) => {
      const kindLabel = req.kind === "restaurant" ? "Kunde" : "Menyra";
      const roleValue = pickRoleValue(req.targetRoles, req.roles, req.targetRole, req.role, "");
      const roleLabel = staffRoleLabel(roleValue, req.kind === "restaurant" ? "restaurant" : "system");
      const restaurantLabel = req.restaurantName || req.restaurantId || "-";
      let actionHtml = `<span class="text-muted">${esc(req.status || "pending")}</span>`;
      if (role === "ceo") {
        actionHtml = `
          <button class="btn btn-light btn-sm rounded-pill fw-700" type="button" data-act="staff-request-approve" data-id="${esc(req.id)}">Approve</button>
          <button class="btn btn-light btn-sm rounded-pill fw-700 text-danger" type="button" data-act="staff-request-reject" data-id="${esc(req.id)}">Reject</button>
        `;
      }

      if (isTable) {
        const row = document.createElement("tr");
        row.className = "table-row";
        row.innerHTML = `
          <td>${esc(kindLabel)}</td>
          <td>${esc(req.name || "-")}</td>
          <td>${esc(req.email || "-")}</td>
          <td>${esc(roleLabel)}</td>
          <td>${esc(restaurantLabel)}</td>
          <td class="text-end">${actionHtml}</td>
        `;
        body.appendChild(row);
        return;
      }

      const row = document.createElement("div");
      row.className = "m-table-row";
      row.style.gridTemplateColumns = "1.2fr 1.4fr 1.6fr 1fr 1.2fr 0.9fr";
      row.innerHTML = `
        <div>${esc(kindLabel)}</div>
        <div>${esc(req.name || "-")}</div>
        <div>${esc(req.email || "-")}</div>
        <div>${esc(roleLabel)}</div>
        <div>${esc(restaurantLabel)}</div>
        <div class="m-table-col-actions">${actionHtml}</div>
      `;
      body.appendChild(row);
    });
    setText("staffRequestsMeta", rows.length ? `Zeilen: ${rows.length}` : "-");
  }

  function renderSystemStaffTable(rows) {
    const body = $("systemStaffTableBody");
    if (!body) return;
    const isTable = body.tagName === "TBODY";
    body.innerHTML = "";

    if (!rows.length) {
      if (isTable) {
        const emptyRow = document.createElement("tr");
        emptyRow.className = "table-row";
        emptyRow.innerHTML = `<td colspan="5" class="text-center text-muted">Keine Staff.</td>`;
        body.appendChild(emptyRow);
      }
      setText("systemStaffMeta", "-");
      return;
    }

    rows.forEach((r) => {
      const assignedCount = restaurants.filter(x => x.assignedStaffId === r.id).length;
      const assignedLabel = assignedCount ? `${assignedCount} Kunden` : "-";
      const actionHtml = (role === "ceo")
        ? `<button class="btn btn-light btn-sm rounded-pill fw-700" type="button" data-act="system-staff-edit" data-id="${esc(r.id)}">Edit</button>
           <button class="btn btn-light btn-sm rounded-pill fw-700 text-danger" type="button" data-act="system-staff-delete" data-id="${esc(r.id)}">Delete</button>`
        : `<span class="text-muted">-</span>`;

      if (isTable) {
        const row = document.createElement("tr");
        row.className = "table-row";
        row.innerHTML = `
          <td>${esc(r.name || r.email || r.id)}</td>
          <td>${esc(r.email || "-")}</td>
          <td>${esc(staffRoleLabel(r.roles || r.role, "system"))}</td>
          <td>${esc(assignedLabel)}</td>
          <td class="text-end">${actionHtml}</td>
        `;
        body.appendChild(row);
        return;
      }

      const row = document.createElement("div");
      row.className = "m-table-row";
      row.style.gridTemplateColumns = "1.4fr 1.8fr 1fr 1fr 0.9fr";
      row.innerHTML = `
        <div>${esc(r.name || r.email || r.id)}</div>
        <div>${esc(r.email || "-")}</div>
        <div>${esc(staffRoleLabel(r.roles || r.role, "system"))}</div>
        <div>${esc(assignedLabel)}</div>
        <div class="m-table-col-actions">${actionHtml}</div>
      `;
      body.appendChild(row);
    });
    setText("systemStaffMeta", rows.length ? `Zeilen: ${rows.length}` : "-");
  }

  function renderRestaurantStaffTable(rows) {
    const body = $("restaurantStaffTableBody");
    if (!body) return;
    const isTable = body.tagName === "TBODY";
    body.innerHTML = "";

    if (!rows.length) {
      if (isTable) {
        const emptyRow = document.createElement("tr");
        emptyRow.className = "table-row";
        emptyRow.innerHTML = `<td colspan="5" class="text-center text-muted">Keine Staff vorhanden.</td>`;
        body.appendChild(emptyRow);
      } else {
        body.innerHTML = `<div class="m-muted" style="padding:10px;">Keine Staff vorhanden.</div>`;
      }
      setText("restaurantStaffMeta", "-");
      return;
    }

    rows.forEach((r) => {
      const statusKey = String(r.status || "active").toLowerCase();
      let badgeStyle = "background: rgba(34, 197, 94, 0.12); color: #22c55e;";
      if (statusKey !== "active") badgeStyle = "background: rgba(100, 116, 139, 0.12); color: #64748b;";
      const statusLabel = (r.status || "active").toUpperCase();
      const actionHtml = (role === "ceo")
        ? `<button class="btn btn-light btn-sm rounded-pill fw-700" type="button" data-act="restaurant-staff-edit" data-id="${esc(r.id)}">Edit</button>
           <button class="btn btn-light btn-sm rounded-pill fw-700 text-danger" type="button" data-act="restaurant-staff-delete" data-id="${esc(r.id)}">Delete</button>`
        : `<span class="text-muted">-</span>`;

      if (isTable) {
        const row = document.createElement("tr");
        row.className = "table-row";
        row.innerHTML = `
          <td>${esc(r.name || r.email || r.id)}</td>
          <td>${esc(r.email || "-")}</td>
          <td>${esc(staffRoleLabel(r.roles || r.role, "restaurant"))}</td>
          <td class="text-center"><span class="status-badge" style="${badgeStyle}">${statusLabel}</span></td>
          <td class="text-end">${actionHtml}</td>
        `;
        body.appendChild(row);
        return;
      }

      const row = document.createElement("div");
      row.className = "m-table-row";
      row.style.gridTemplateColumns = "1.4fr 1.8fr 1fr 1fr 0.9fr";
      row.innerHTML = `
        <div>${esc(r.name || r.email || r.id)}</div>
        <div>${esc(r.email || "-")}</div>
        <div>${esc(staffRoleLabel(r.roles || r.role, "restaurant"))}</div>
        <div>${esc(statusLabel)}</div>
        <div class="m-table-col-actions">${actionHtml}</div>
      `;
      body.appendChild(row);
    });
    setText("restaurantStaffMeta", rows.length ? `Zeilen: ${rows.length}` : "-");
  }

  async function ensureRestaurantOwnerMapping(restaurantId, rows) {
    if (!restaurantId || !Array.isArray(rows)) return;
    const ownerRow = rows.find(r => isOwnerRole(r.roles || r.role));
    if (!ownerRow) return;
    const existing = restaurants.find(r => r.id === restaurantId) || {};
    const patch = {};
    if (!existing.ownerUid && ownerRow.uid) patch.ownerUid = ownerRow.uid;
    if (!existing.ownerEmail && ownerRow.email) patch.ownerEmail = ownerRow.email;
    if (!existing.ownerName && ownerRow.name) patch.ownerName = ownerRow.name;
    if (!Object.keys(patch).length) return;
    try {
      await setDoc(doc(db, "restaurants", restaurantId), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
      Object.assign(existing, patch);
    } catch (err) {
      console.warn("owner mapping update failed", err);
    }
  }

  async function refreshSystemStaff() {
    try {
      const rows = await fetchSystemStaff();
      systemStaff.splice(0, systemStaff.length, ...(rows || []));
      systemStaffMap = new Map(systemStaff.map(r => [r.id, r]));
      renderSystemStaffTable(systemStaff);
      fillStaffAssignSelect();
    } catch (err) {
      console.error(err);
      renderSystemStaffTable([]);
      setText("systemStaffMeta", "Fehler beim Laden.");
    }
  }

  async function refreshStaffRequests() {
    if (!currentUser) return;
    try {
      const rows = await fetchStaffRequests(role, currentUser.uid);
      let filtered = rows || [];
      if (role === "ceo") filtered = filtered.filter(r => (r.status || "pending") === "pending");
      else filtered = filtered.filter(r => r.createdByUid === currentUser.uid);
      filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      staffRequests.splice(0, staffRequests.length, ...filtered);
      renderStaffRequestsTable(filtered);
    } catch (err) {
      console.error(err);
      renderStaffRequestsTable([]);
      setText("staffRequestsMeta", "Fehler beim Laden.");
    }
  }

  async function refreshRestaurantStaff(rid) {
    if (!rid) {
      renderRestaurantStaffTable([]);
      return;
    }
    try {
      const rows = await fetchRestaurantStaff(rid);
      restaurantStaff = rows || [];
      renderRestaurantStaffTable(restaurantStaff);
      await ensureRestaurantOwnerMapping(rid, restaurantStaff);
      if (!staffIndexBackfillDone.has(rid)) {
        staffIndexBackfillDone.add(rid);
        await Promise.all((restaurantStaff || []).map((r) => {
          const uid = r.uid || r.userId || r.id || "";
          if (!uid) return Promise.resolve();
          return upsertStaffIndex({
            uid,
            restaurantId: rid,
            name: r.name || "",
            email: r.email || ""
          });
        }));
      }
    } catch (err) {
      console.error(err);
      renderRestaurantStaffTable([]);
      setText("restaurantStaffMeta", "Fehler beim Laden.");
    }
  }

  async function refreshStaffUi() {
    if (role === "owner") return;
    const sysBtn = $("newSystemStaffBtn");
    if (sysBtn) sysBtn.textContent = (role === "ceo") ? "+ Neuer Menyra Staff" : "+ Neue Anfrage";
    const restBtn = $("newRestaurantStaffBtn");
    if (restBtn) restBtn.textContent = (role === "ceo") ? "+ Neuer Kunden Staff" : "+ Neue Anfrage";
    fillStaffRestaurantSelects();
    await refreshSystemStaff();
    await refreshStaffRequests();
    const rid = $("staffRestaurantSelect")?.value || restaurants[0]?.id || "";
    if ($("staffRestaurantSelect") && rid) $("staffRestaurantSelect").value = rid;
    if (rid) {
      await refreshRestaurantStaff(rid);
      syncStaffAssignSelect();
    } else {
      renderRestaurantStaffTable([]);
    }
  }

  $("newSystemStaffBtn")?.addEventListener("click", () => {
    const mode = (role === "ceo") ? "new" : "request";
    openStaffModal({ mode, kind: "system", data: {} });
  });

  $("newRestaurantStaffBtn")?.addEventListener("click", () => {
    const mode = (role === "ceo") ? "new" : "request";
    openStaffModal({ mode, kind: "restaurant", data: { restaurantId: $("staffRestaurantSelect")?.value || "" } });
  });

  $("staffRestaurantSelect")?.addEventListener("change", async () => {
    const rid = $("staffRestaurantSelect")?.value || "";
    await refreshRestaurantStaff(rid);
    syncStaffAssignSelect();
  });

  $("staffAssignBtn")?.addEventListener("click", async () => {
    if (!currentUser) return;
    const rid = $("staffRestaurantSelect")?.value || "";
    if (!rid) return;
    const staffId = $("staffAssignSelect")?.value || "";
    const staffRow = systemStaffMap.get(staffId);
    const staffName = staffRow?.name || staffRow?.email || "";
    try {
      await setDoc(doc(db, "restaurants", rid), {
        assignedStaffId: staffId || null,
        assignedStaffName: staffName || "",
        updatedAt: serverTimestamp(),
        updatedByUid: currentUser.uid,
        updatedByRole: role
      }, { merge: true });
      const local = restaurants.find(r => r.id === rid);
      if (local) {
        local.assignedStaffId = staffId || "";
        local.assignedStaffName = staffName || "";
      }
      setText("restaurantStaffMeta", "Zuweisung gespeichert.");
      renderSystemStaffTable(systemStaff);
    } catch (err) {
      console.error(err);
      setText("restaurantStaffMeta", "Zuweisung fehlgeschlagen.");
    }
  });

  $("staffRequestsBody")?.addEventListener("click", async (e) => {
    const btn = e.target?.closest?.("[data-act]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (!id) return;
    const act = btn.getAttribute("data-act");
    const req = staffRequests.find(r => r.id === id);
    if (!req) return;
    if (act === "staff-request-approve") {
      openStaffModal({
        mode: "approve",
        kind: req.kind || "system",
        data: {
          ...req,
          requestId: req.id,
          role: req.targetRole || req.role || "",
          roles: req.targetRoles || req.roles || req.targetRole || req.role || "",
          restaurantId: req.restaurantId || ""
        }
      });
    }
    if (act === "staff-request-reject" && role === "ceo") {
      if (!confirm("Anfrage wirklich ablehnen?")) return;
      try {
        await updateStaffRequest(id, {
          status: "rejected",
          rejectedAt: serverTimestamp(),
          rejectedByUid: currentUser?.uid || null,
          rejectedByRole: role
        });
        await refreshStaffRequests();
      } catch (err) {
        console.error(err);
      }
    }
  });

  $("systemStaffTableBody")?.addEventListener("click", async (e) => {
    if (role !== "ceo") return;
    const btn = e.target?.closest?.("[data-act]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const act = btn.getAttribute("data-act");
    const row = systemStaff.find(r => r.id === id);
    if (!row) return;
    if (act === "system-staff-edit") {
      openStaffModal({ mode: "edit", kind: "system", data: row });
    }
    if (act === "system-staff-delete") {
      if (!confirm("Staff wirklich loeschen?")) return;
      try {
        await deleteSystemStaffAccount(id, row.role);
        await refreshSystemStaff();
      } catch (err) {
        console.error(err);
      }
    }
  });

  $("restaurantStaffTableBody")?.addEventListener("click", async (e) => {
    if (role !== "ceo") return;
    const btn = e.target?.closest?.("[data-act]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const act = btn.getAttribute("data-act");
    const row = restaurantStaff.find(r => r.id === id);
    const rid = $("staffRestaurantSelect")?.value || "";
    if (!row || !rid) return;
    if (act === "restaurant-staff-edit") {
      openStaffModal({ mode: "edit", kind: "restaurant", data: { ...row, restaurantId: rid } });
    }
    if (act === "restaurant-staff-delete") {
      if (!confirm("Staff wirklich loeschen?")) return;
      try {
        await deleteRestaurantStaffAccount(rid, id);
        await refreshRestaurantStaff(rid);
      } catch (err) {
        console.error(err);
      }
    }
  });

  $("staffForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = currentUser;
    if (!user) return;

    const mode = $("staffFormMode")?.value || "new";
    const kind = $("staffFormKind")?.value || "system";
    const uid = $("staffFormUid")?.value || "";
    const requestId = $("staffFormRequestId")?.value || "";
    const currentRole = $("staffFormCurrentRole")?.value || "";
    const name = ($("staffName")?.value || "").trim();
    const email = ($("staffEmail")?.value || "").trim();
    const password = ($("staffPassword")?.value || "").trim();
    const photoFile = $("staffPhoto")?.files?.[0] || null;
    const existingPhotoUrl = ($("staffFormPhotoUrl")?.value || "").trim();
    const systemRole = ($("staffSystemRole")?.value || "staff").trim();
    const restaurantRoles = getRestaurantRolesFromForm();
    const primaryRestaurantRole = pickPrimaryRestaurantRole(restaurantRoles);
    const restaurantId = ($("staffRestaurantSelectModal")?.value || $("staffRestaurantSelect")?.value || "").trim();

    if (!name || !email) {
      setStaffModalStatus("Name und Email erforderlich.");
      return;
    }
    if (kind === "restaurant" && !restaurantId) {
      setStaffModalStatus("Kunde fehlt.");
      return;
    }
    if (kind === "restaurant" && !restaurantRoles.length) {
      setStaffModalStatus("Mindestens eine Rolle waehlen.");
      return;
    }
    if ((mode === "new" || mode === "approve") && !password) {
      setStaffModalStatus("Password erforderlich.");
      return;
    }

    try {
      if (mode === "request") {
        const payload = {
          kind,
          targetRole: (kind === "restaurant") ? primaryRestaurantRole : systemRole,
          targetRoles: (kind === "restaurant") ? restaurantRoles : [],
          name,
          email,
          restaurantId: (kind === "restaurant") ? restaurantId : "",
          restaurantName: (kind === "restaurant") ? (restaurants.find(r => r.id === restaurantId)?.name || restaurantId) : "",
          createdByUid: user.uid,
          createdByRole: role
        };
        const requestId = await createStaffRequest(payload);
        if (photoFile) {
          const url = await uploadStaffPhotoFile({
            file: photoFile,
            pathBase: `staff-requests/${requestId}/${Date.now()}`
          });
          await updateStaffRequest(requestId, { photoUrl: url });
        }
        closeStaffModal();
        await refreshStaffRequests();
        return;
      }

      if (mode === "approve") {
        const targetRole = (kind === "restaurant") ? primaryRestaurantRole : systemRole;
        let createdUid = "";
        if (kind === "restaurant") {
          createdUid = await createRestaurantStaffAccount({
            restaurantId,
            name,
            email,
            password,
            role: targetRole,
            roles: restaurantRoles,
            photoUrl: existingPhotoUrl,
            createdByUid: user.uid,
            createdByRole: role
          });
        } else {
          createdUid = await createSystemStaffAccount({
            name,
            email,
            password,
            role: targetRole,
            photoUrl: existingPhotoUrl,
            createdByUid: user.uid,
            createdByRole: role
          });
        }
        if (photoFile) {
          const pathBase = (kind === "restaurant")
            ? `staff-photos/restaurants/${restaurantId}/${createdUid}-${Date.now()}`
            : `staff-photos/system/${createdUid}-${Date.now()}`;
          const url = await uploadStaffPhotoFile({ file: photoFile, pathBase });
          if (kind === "restaurant") {
            await setDoc(doc(db, "restaurants", restaurantId, "staff", createdUid), { photoUrl: url }, { merge: true });
          } else {
            const col = targetRole === "ceo" ? "superadmins" : "staffAdmins";
            await setDoc(doc(db, col, createdUid), { photoUrl: url }, { merge: true });
          }
        }
        await updateStaffRequest(requestId, {
          status: "approved",
          approvedAt: serverTimestamp(),
          approvedByUid: user.uid,
          approvedByRole: role,
          createdUserUid: createdUid
        });
        closeStaffModal();
        await refreshStaffUi();
        return;
      }

      if (mode === "edit") {
        if (kind === "restaurant") {
          let photoUrl = existingPhotoUrl;
          if (photoFile) {
            const pathBase = `staff-photos/restaurants/${restaurantId}/${uid}-${Date.now()}`;
            photoUrl = await uploadStaffPhotoFile({ file: photoFile, pathBase });
          }
          await updateRestaurantStaffAccount({
            restaurantId,
            uid,
            role: primaryRestaurantRole,
            roles: restaurantRoles,
            name,
            email,
            photoUrl,
            updatedByUid: user.uid,
            updatedByRole: role
          });
          closeStaffModal();
          await refreshRestaurantStaff(restaurantId);
          return;
        }
        let photoUrl = existingPhotoUrl;
        if (photoFile) {
          const pathBase = `staff-photos/system/${uid}-${Date.now()}`;
          photoUrl = await uploadStaffPhotoFile({ file: photoFile, pathBase });
        }
        await updateSystemStaffAccount({
          uid,
          currentRole,
          nextRole: systemRole,
          name,
          email,
          photoUrl,
          updatedByUid: user.uid,
          updatedByRole: role
        });
        closeStaffModal();
        await refreshSystemStaff();
        return;
      }

      if (mode === "new") {
        if (kind === "restaurant") {
          const createdUid = await createRestaurantStaffAccount({
            restaurantId,
            name,
            email,
            password,
            role: primaryRestaurantRole,
            roles: restaurantRoles,
            photoUrl: existingPhotoUrl,
            createdByUid: user.uid,
            createdByRole: role
          });
          if (photoFile && createdUid) {
            const pathBase = `staff-photos/restaurants/${restaurantId}/${createdUid}-${Date.now()}`;
            const url = await uploadStaffPhotoFile({ file: photoFile, pathBase });
            await setDoc(doc(db, "restaurants", restaurantId, "staff", createdUid), { photoUrl: url }, { merge: true });
          }
          closeStaffModal();
          await refreshRestaurantStaff(restaurantId);
          return;
        }
        const createdUid = await createSystemStaffAccount({
          name,
          email,
          password,
          role: systemRole,
          photoUrl: existingPhotoUrl,
          createdByUid: user.uid,
          createdByRole: role
        });
        if (photoFile && createdUid) {
          const pathBase = `staff-photos/system/${createdUid}-${Date.now()}`;
          const url = await uploadStaffPhotoFile({ file: photoFile, pathBase });
          const col = systemRole === "ceo" ? "superadmins" : "staffAdmins";
          await setDoc(doc(db, col, createdUid), { photoUrl: url }, { merge: true });
        }
        closeStaffModal();
        await refreshSystemStaff();
      }
    } catch (err) {
      console.error(err);
      setStaffModalStatus(err?.message || "Fehler beim Speichern.");
    }
  });

  onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    const loginOverlay = $("loginModalOverlay");

    if (loginShowTimer) { clearTimeout(loginShowTimer); loginShowTimer = null; }

    if (!user) {
      document.body.classList.add("m-login");
      document.documentElement.classList.add("m-login");

      if (loginOverlay) {
        loginShowTimer = setTimeout(() => {
          show(loginOverlay);
        }, 160);
      }

      setText("adminStatus", "Nicht eingeloggt.");

      setBootStatus("Login erforderlich.");

      return;

    }

    if (loginOverlay) hide(loginOverlay);
    document.body.classList.remove("m-login");
    document.documentElement.classList.remove("m-login");

    setText("adminStatus", `Eingeloggt: ${user.email || user.uid}`);

    setBootStatus("Pruefe Zugriff...");


    if (role === "owner") {

      setBootStatus("Restaurant wird gesucht...");
      const cachedRid = getCachedRestaurantId(user.uid) || "";
      const urlRid = restrictRestaurantId || "";
      const list = await findRestaurantsForStaffUser(user);
      const validIds = new Set((list || []).map(r => r.id));

      if (cachedRid && !validIds.has(cachedRid)) {
        clearCachedRestaurantId(user.uid);
      }
      if (urlRid && !validIds.has(urlRid)) {
        try {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.delete("r");
          window.history.replaceState({}, "", nextUrl.toString());
        } catch {}
      }

      let rid = "";
      if (urlRid && validIds.has(urlRid)) {
        rid = urlRid;
      } else {
        rid = await resolveOwnerRestaurantId(user, cachedRid, list);
      }
      if (rid) {
        restrictRestaurantId = rid;
        setCachedRestaurantId(user.uid, rid);
        try {
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set("r", rid);
          window.history.replaceState({}, "", nextUrl.toString());
        } catch {}
      }

      if (!rid) {

        setText("offersStatus", "Kein Restaurant gefunden. Bitte im CEO/Staff zuweisen.");

        setBootStatus("Kein Restaurant gefunden. Bitte im CEO/Staff zuweisen.");

        return;

      }

      try {

        await ensureOwnerStaffDoc(rid, user);

        const staffEntry = await findStaffEntryForRestaurant(rid, user);
        const staffRoles = normalizeRoleList(staffEntry?.data?.roles || staffEntry?.data?.role || "");
        const ownerAllowed = ["owner","admin","manager"];

        if (!staffRoles.some(r => ownerAllowed.includes(r))) {

          setText("offersStatus", "Kein Zugriff (restaurants/{r}/staff/{uid}.role).");

          setBootStatus("Kein Zugriff fuer Owner.");

          return;

        }

      } catch (err) {

        console.error(err);

        setText("offersStatus", "Zugriff konnte nicht geprueft werden.");

        setBootStatus("Zugriff konnte nicht geprueft werden.");

        return;

      }

    } else {

      const allowed = await ensureRoleAccess(role, user.uid);

      if (!allowed) {

        setBootStatus("Kein Zugriff (superadmins/staffAdmins).");

        return;

      }

    }

    await loadProfileForUser(role, user, restrictRestaurantId);



    async function refreshRestaurantsUi(force = false) {

      try {

        if (force) cacheDel(`${REST_CACHE_KEY}_${role}_${user.uid}`);

        const fetched = await fetchRestaurants(role, user.uid, restrictRestaurantId);

        restaurants.splice(0, restaurants.length, ...(fetched || []));

        await Promise.all((restaurants || []).map(r => ensurePublicDocs(r.id, r || {})));

        updateCustomersCard(restaurants);

        updateDemoCard(restaurants);

        renderNextPayList(buildNextPayItems(restaurants), nextPayExpanded);

        updateSystemStatsCard({ restaurants, leadsCount: leadsAll.length, storiesCount: activeStoriesCache.length });

        try { refreshCustomers(); } catch (_) {}

        markLive("cardNextPay");
        if (role !== "owner") {
          for (const r of restaurants.slice(0, 30)) {
            if (r.ownerUid || r.ownerEmail) continue;
            try {
              const staffSnap = await getDocs(collection(db, "restaurants", r.id, "staff"));
              const rows = staffSnap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
              await ensureRestaurantOwnerMapping(r.id, rows);
            } catch (_) {}
          }
        }
        try { await refreshStaffUi(); } catch (_) {}

      } catch (err) {

        console.error(err);

        setText("customersMeta", "Fehler beim Laden (Rules/Auth?).");

        setText("offersStatus", "Fehler beim Laden (Rules/Auth?).");

      }

    }



    function fillDashQuickSelect() {

      const dashSel = $("dashRestaurantQuickSelect");

      if (!dashSel) return;

      dashSel.innerHTML = `<option value="">- waehlen -</option>`;

      restaurants.forEach(r => {

        const opt = document.createElement("option");

        opt.value = r.id;

        opt.textContent = r.name || r.id;

        dashSel.appendChild(opt);

      });

      $("dashGoOffers")?.addEventListener("click", () => {

        const rid = dashSel.value;

        if (rid) {

          const offersSel = $("offersRestaurantSelect");

          if (offersSel) offersSel.value = rid;

          nav.showView("offers");

          offersSel?.dispatchEvent(new Event("change"));

        }

      }, { once: true });

    }



    async function refreshActiveStories() {

      if (!restaurants.length) {
        activeStoriesCache = [];
        animateValue($("dashActiveStoriesCount"), 0, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 200 });
        renderStoriesList(activeStoriesCache, storiesExpanded);
        updateSystemStatsCard({ restaurants, leadsCount: leadsAll.length, storiesCount: 0 });
        return;
      }

      try {

        const subset = restaurants.slice(0, 8);
        const counts = await Promise.all(subset.map(r => countActiveStories(r.id, 15).catch(() => 0)));

        activeStoriesCache = subset.map((r, idx) => ({
          name: customerName(r),
          count: counts[idx] || 0
        })).filter(x => x.count > 0);

        const totalStories = activeStoriesCache.reduce((acc, x) => acc + (x.count || 0), 0);
        animateValue($("dashActiveStoriesCount"), totalStories, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 200 });
        renderStoriesList(activeStoriesCache, storiesExpanded);

        markLive("cardStories");

        updateSystemStatsCard({ restaurants, leadsCount: leadsAll.length, storiesCount: totalStories });

      } catch (err) {

        console.error("stories refresh", err);

      }

    }



    async function refreshChecks() {

      try {

        const snap = await getDocs(query(collection(db, "systemLogs"), orderBy("createdAt", "desc"), limit(20)));

        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
        const listEl = $("dashErrorsList");
        if (listEl) {
          listEl.innerHTML = "";
          const errs = rows.filter(r => (r.type || "").toLowerCase() === "error").slice(0, 5);
          if (!errs.length) {
            const li = document.createElement("li");
            li.innerHTML = `<span class="m-muted" style="font-size:12px;">Keine Errors heute</span>`;
            listEl.appendChild(li);
          } else {
            errs.forEach((r) => {
              const ts = toDateSafe(r.createdAt);
              const li = document.createElement("li");
              li.innerHTML = `
                <div class="m-error-title">${esc(r.message || r.msg || "Error")}</div>
                <div class="m-error-meta">${esc(r.app || r.source || "-")} · ${ts ? relativeFromNow(ts.getTime()) : ""}</div>
              `;
              listEl.appendChild(li);
            });
          }
        }

      } catch (err) {

        console.error("systemLogs load failed", err);

      }

    }



    function updateSwipeValues(liveUsersNow = 0, ordersToday = 0) {

      animateValue($("dashLiveUsersNow"), liveUsersNow, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 5000 });

      animateValue($("dashOrdersToday"), ordersToday, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 5000 });

      markLive("cardSwipeStats", 60000);

    }



    function attachLiveSwipe() {

      if (swipeLiveUnsub) return true;

      try {

        const ref = doc(db, "system", "liveStats");

        swipeLiveUnsub = onSnapshot(ref, (snap) => {

          if (!snap.exists()) return;

          const data = snap.data() || {};

          updateSwipeValues(Number(data.liveUsersNow || 0), Number(data.ordersToday || 0));

        });

        return true;

      } catch (err) {

        console.warn("Live stats listener failed", err);

        swipeLiveUnsub = null;

        return false;

      }

    }



    async function refreshSwipeStats() {

      if (attachLiveSwipe()) return;

      const sample = restaurants.slice(0, 4);

      if (!sample.length) {

        updateSwipeValues(0, 0);

        return;

      }

      const start = new Date();

      start.setHours(0, 0, 0, 0);

      const startTs = Timestamp.fromDate(start);

      let orders = 0;

      for (const r of sample) {

        try {

          const snap = await getDocs(query(collection(db, "restaurants", r.id, "orders"), where("createdAt", ">=", startTs)));

          orders += snap.size;

        } catch (err) {

          console.warn("ordersToday fetch failed", err);

        }

      }

      const liveUsersNow = Math.max(sample.length, orders);

      updateSwipeValues(liveUsersNow, orders);

    }



    await refreshRestaurantsUi(true);

    fillDashQuickSelect();
    await refreshActiveStories();
    await refreshChecks();
    await refreshSwipeStats();
    setBootStatus("Bereit.");
    finishBoot();


    setInterval(() => {

      refreshRestaurantsUi();

      refreshActiveStories();

      refreshChecks();

      refreshSwipeStats();

      refreshLeads();

    }, 50000);



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
      const customerId = ($("customerId")?.value || "").trim();

      if (!name) {
        if (statusEl) statusEl.textContent = "Name fehlt.";
        return;
      }

      try {
        const payload = { name, type, ownerName, city, phone, tableCount, yearPrice, status, logoUrl, slug };
        const id = customerId
          ? await updateRestaurantDoc(role, user, customerId, payload)
          : await createRestaurantDoc(role, user, payload);
        // refresh cache and UI
        try { localStorage.removeItem(REST_CACHE_KEY + "_" + role + "_" + user.uid); } catch {}
        const updated = await fetchRestaurants(role, user.uid, restrictRestaurantId);
        restaurants.splice(0, restaurants.length, ...updated);
        refreshCustomers();
        closeCustomerModal();
        setText("adminStatus", customerId ? `Kunde aktualisiert: ${id}` : `Kunde erstellt: ${id}`);
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
async function refreshLeads(force = false) {
  if (role === "owner") return; // owner doesn't use CRM leads
  if (!currentUser) return;

  try {
    if (force) cacheDel(`${LEADS_CACHE_KEY}_${role}_${currentUser.uid}`);
    const rows = await fetchLeads(role, currentUser.uid);
    leadsAll.splice(0, leadsAll.length, ...(rows || []));

    renderLeadLabelFilterOptions(leadsAll);
    const filtered = applyLeadsFilter(leadsAll);
    renderLeadsTable(filtered);

    // stats chips
    const st = leadsStats(leadsAll);
    setText("leadsTotalBadge", String(st.total));
    setText("leadsStatNew", `Offen: ${st.counts.new}`);
    setText("leadsStatContacted", `Kontaktiert/Warten: ${st.counts.contacted}`);
    setText("leadsStatInterested", `Interesse: ${st.counts.interested}`);
    setText("leadsStatNoInterest", `Kein Interesse: ${st.counts.no_interest}`);
    const openCount = leadsAll.filter(r => {
      const s = normalizeLeadStatusKey(r.status || "");
      return !["no_interest", "lost", "converted", "closed", "done"].includes(s);
    }).length;
    animateValue($("dashLeadsTotal"), leadsAll.length, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 5000 });
    animateValue($("dashLeadsOpen"), openCount, (v) => formatNumber(Math.round(v || 0)), { maxDiff: 5000 });
    setUpdated("dashUpdatedLeads");
    markLive("cardLeads");
    updateSystemStatsCard({ restaurants, leadsCount: leadsAll.length, storiesCount: activeStoriesCache.length });

    // row actions (event delegation)
    $("leadsTableBody")?.addEventListener("click", async (e) => {
      const btn = e.target?.closest?.("[data-act]");
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
      // Also fill menu selector
      // fillMenuRestaurantSelect(restaurants); // Moved to after menu variable declarations
    }

    let currentOffers = [];
    let currentMenuItems = [];
    let currentRestaurantId = role === "owner" && restaurants[0] ? restaurants[0].id : "";// =========================================================

    // Owner Stories (Uploads -> Firestore -> Guest Story Page)
    if (role === "owner") {
      const ridForStories = restaurants[0]?.id || restrictRestaurantId || "";
      try {
        await initOwnerStoriesUI({ restaurantId: ridForStories, user });
      } catch (err) {
        console.error(err);
      }
    }
    if (role === "owner") {
      const ridForSocial = restaurants[0]?.id || restrictRestaurantId || "";
      try {
        await initSocialPostsUI({ restaurantId: ridForSocial, restaurants, user });
      } catch (err) {
        console.error(err);
      }
    }
// MENU VIEW: Speisekarte (cheap reads via public/menu)
// =========================================================
const menuSel = $("menuRestaurantSelect");
const menuAddBtn = $("menuAddBtn");
const menuStatus = $("menuStatus");
const menuTypeSeg = $("menuTypeSeg");
const menuOverlay = $("menuItemModalOverlay");
const menuClose = $("menuItemModalClose");
const menuForm = $("menuItemForm");

const miType = $("miType");
const miCategory = $("miCategory");
const miName = $("miName");
const miPrice = $("miPrice");
const miDesc = $("miDesc");
const miImageUrl = $("miImageUrl");
const miAvailable = $("miAvailable");
const miCancel = $("miCancel");
const miTitle = $("menuItemModalTitle");
const miStatus = $("menuItemModalStatus");

let menuFilterType = "all";
let editMenuIndex = -1;
let menuWiringDone = false;

// Initialize menu restaurant selector
if (restaurants) fillMenuRestaurantSelect(restaurants);

function setMenuStatus(t){ if(menuStatus) menuStatus.textContent = t || ""; }

function canCreateMenuItems(){
  return (role === "ceo" || role === "staff"); // Owner can't create new items
}
function canDeleteMenuItems(){
  return (role === "ceo" || role === "staff");
}

function openMenuModal(mode){
  if(!menuOverlay) return;
  menuOverlay.style.display = "";
  miStatus && (miStatus.textContent = "");
  if(mode === "new"){
    miTitle && (miTitle.textContent = "Neues Item");
  } else {
    miTitle && (miTitle.textContent = "Item bearbeiten");
  }
}
function closeMenuModal(){
  if(!menuOverlay) return;
  menuOverlay.style.display = "none";
  editMenuIndex = -1;
}

function fillMenuRestaurantSelect(restaurants){
  if(!menuSel) return;
  menuSel.innerHTML = "";
  restaurants.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.name || r.id;
    menuSel.appendChild(opt);
  });
  if(role === "owner" && restaurants[0]){
    menuSel.value = restaurants[0].id;
  }
}

async function loadMenuUI(rid){
  if(!rid){
    setMenuStatus("Bitte ein Lokal auswählen.");
    renderMenuTable([], menuFilterType, canDeleteMenuItems());
    return;
  }
  setMenuStatus("Lade…");
  try{
    await ensurePublicDocs(rid, { name:"", type:"cafe", city:"", logoUrl:"" });
    currentMenuItems = await loadMenuHybrid(rid);

    // Normalize types for rendering (no auto-save here)
    currentMenuItems = (currentMenuItems || []).map(i => ({
      ...i,
      id: i.id || crypto.randomUUID?.() || String(Math.random()).slice(2),
      type: normalizeMenuType(i.type || i.kind || i.group || i.section || "food"),
      available: i.available !== false
    }));

    renderMenuTable(currentMenuItems, menuFilterType, canDeleteMenuItems());
    setMenuStatus(`${currentMenuItems.length} Items`);
  }catch(err){
    console.error(err);
    setMenuStatus("Fehler beim Laden.");
    renderMenuTable([], menuFilterType, canDeleteMenuItems());
  }
}

async function saveMenuUI(){
  if(!currentRestaurantId){ return; }
  setMenuStatus("Speichere…");
  try{
    await setDoc(doc(db, "restaurants", currentRestaurantId, "public", "menu"), {
      items: currentMenuItems || [],
      updatedAt: serverTimestamp()
    }, { merge: true });

    // refresh offers select for linking
    fillOfferMenuSelect(currentMenuItems || []);

    setMenuStatus("Gespeichert.");
    renderMenuTable(currentMenuItems, menuFilterType, canDeleteMenuItems());
  }catch(err){
    console.error(err);
    setMenuStatus("Speichern fehlgeschlagen.");
  }
}

function bindMenuClicks(){
  const body = $("menuTableBody");
  if(!body) return;

  body.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-mi-edit]");
    if(editBtn){
      const idx = Number(editBtn.getAttribute("data-mi-edit"));
      const it = currentMenuItems[idx];
      if(!it) return;

      editMenuIndex = idx;
      miType && (miType.value = normalizeMenuType(it.type));
      miCategory && (miCategory.value = it.category || "");
      miName && (miName.value = it.name || "");
      miPrice && (miPrice.value = (it.price ?? "") === "" ? "" : String(it.price));
      miDesc && (miDesc.value = it.description || "");
      miImageUrl && (miImageUrl.value = it.imageUrl || "");
      miAvailable && (miAvailable.checked = it.available !== false);

      // Owner can edit fields but we keep type selectable only if ceo/staff
      if(miType){
        miType.disabled = !(role === "ceo" || role === "staff");
      }

      openMenuModal("edit");
      return;
    }

    const delBtn = e.target.closest("[data-mi-del]");
    if(delBtn && canDeleteMenuItems()){
      const idx = Number(delBtn.getAttribute("data-mi-del"));
      const it = currentMenuItems[idx];
      if(!it) return;
      if(!confirm(`Item löschen: ${it.name || "Item"} ?`)) return;
      currentMenuItems.splice(idx, 1);
      await saveMenuUI();
    }
  });
}

function bindMenuTypeSeg(){
  if(!menuTypeSeg) return;
  menuTypeSeg.addEventListener("click", (e) => {
    const b = e.target.closest("[data-menu-type]");
    if(!b) return;
    const t = b.getAttribute("data-menu-type");
    menuFilterType = t || "all";
    menuTypeSeg.querySelectorAll(".m-seg-btn").forEach(x => x.classList.toggle("is-active", x === b));
    renderMenuTable(currentMenuItems, menuFilterType, canDeleteMenuItems());
  });
}

function bindMenuModal(){
  if(menuClose) menuClose.addEventListener("click", closeMenuModal);
  if(miCancel) miCancel.addEventListener("click", closeMenuModal);
  if(menuOverlay){
    menuOverlay.addEventListener("click", (e) => {
      if(e.target === menuOverlay) closeMenuModal();
    });
  }

  if(menuForm){
    menuForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      miStatus && (miStatus.textContent = "");

      if(!currentRestaurantId){
        miStatus && (miStatus.textContent = "Kein Lokal ausgewählt.");
        return;
      }

      const obj = {
        id: (editMenuIndex >= 0 && currentMenuItems[editMenuIndex]?.id) ? currentMenuItems[editMenuIndex].id : (crypto.randomUUID?.() || String(Math.random()).slice(2)),
        type: normalizeMenuType(miType?.value || "food"),
        category: (miCategory?.value || "").trim() || "Sonstiges",
        name: (miName?.value || "").trim(),
        price: (miPrice?.value || "").trim() === "" ? "" : Number(miPrice.value),
        description: (miDesc?.value || "").trim(),
        longDescription: "", // keep optional
        imageUrl: (miImageUrl?.value || "").trim() || null,
        imageUrls: [],
        available: miAvailable?.checked !== false,
        updatedAt: Date.now()
      };

      if(!obj.name){
        miStatus && (miStatus.textContent = "Name fehlt.");
        return;
      }

      // Role rules
      if(editMenuIndex === -1){
        if(!canCreateMenuItems()){
          miStatus && (miStatus.textContent = "Owner kann keine neuen Items erstellen.");
          return;
        }
        currentMenuItems.unshift(obj);
      } else {
        // Owner can edit only selected fields
        if(role === "owner"){
          const old = currentMenuItems[editMenuIndex] || {};
          obj.type = normalizeMenuType(old.type);
          obj.id = old.id;
        }
        currentMenuItems[editMenuIndex] = { ...currentMenuItems[editMenuIndex], ...obj };
      }

      await saveMenuUI();
      closeMenuModal();
    });
  }

  if(menuAddBtn){
    // hide for owner
    if(!canCreateMenuItems()){
      menuAddBtn.style.display = "none";
    } else {
      const menuPublishBtn = document.getElementById("menuPublishBtn");
      if (menuPublishBtn) {
        menuPublishBtn.addEventListener("click", async () => {
          try{
            if (!currentRestaurantId) {
              menuStatus.textContent = "Kein Lokal ausgewählt.";
              return;
            }
            menuStatus.textContent = "Publishing…";
            await publishMenuToPublic(currentRestaurantId, currentMenuItems);
            menuStatus.textContent = "Published ✓";
          }catch(err){
            console.error(err);
            menuStatus.textContent = "Publish error";
          }
        });
      }

      menuAddBtn.addEventListener("click", () => {
        editMenuIndex = -1;
        miType && (miType.disabled = false, miType.value = "food");
        miCategory && (miCategory.value = "");
        miName && (miName.value = "");
        miPrice && (miPrice.value = "");
        miDesc && (miDesc.value = "");
        miImageUrl && (miImageUrl.value = "");
        miAvailable && (miAvailable.checked = true);
        openMenuModal("new");
      });
    }
  }
}

function initMenuView(){
  if (menuWiringDone) return;
  if (!menuSel) return;
  menuWiringDone = true;

  bindMenuClicks();
  bindMenuTypeSeg();
  bindMenuModal();

  menuSel.addEventListener("change", () => {
    const rid = menuSel.value || "";
    currentRestaurantId = rid;
    loadMenuUI(rid);
  });

  document.addEventListener("menyra:viewchange", (e) => {
    if (e?.detail?.view !== "menu") return;
    const rid = menuSel.value || restaurants?.[0]?.id || "";
    if (rid) {
      if (menuSel.value !== rid) menuSel.value = rid;
      currentRestaurantId = rid;
      loadMenuUI(rid);
    } else {
      setMenuStatus("Bitte ein Lokal ausw„hlen.");
      renderMenuTable([], menuFilterType, canDeleteMenuItems());
    }
  });
}

initMenuView();


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
