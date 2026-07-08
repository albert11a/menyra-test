// Mnyra Analytics Tracker.
//
// Sammelt Events (Klicks, Impressionen, State-Transitions), dedupliziert sie
// pro Session/Tag und schreibt sie gebatcht nach Firestore:
//   - restaurants/{rid}/analyticsEvents/{autoId}   (Roh-Event)
//   - restaurants/{rid}/analyticsDaily/{YYYY-MM-DD} (Aggregat via increment)
//
// Grundsaetze:
//   - Tracking darf die App NIE brechen: alles ist in try/catch gekapselt.
//   - Firebase wird lazy per dynamic import geladen (gleiche URLs wie die App,
//     damit keine doppelten Modul-Instanzen entstehen).
//   - Eigene Ansichten (Owner/Staff des gleichen Restaurants, CEO) zaehlen nicht.

import {
  buildAnalyticsEvent,
  buildDailyIncrementPlan,
  applyIncrementPlanToPatch,
  analyticsDayKey,
  ANALYTICS_UNIQUE_EVENTS
} from "./analytics-event-schema.js";

const FIREBASE_CONFIG_MODULE_URL = "/shared/firebase-config.js?v=2026-05-02-public-startup-diet-01";
const FIREBASE_FIRESTORE_MODULE_URL = "/shared/vendor/firebase/11.0.0/firebase-firestore.js";

const SESSION_STORAGE_KEY = "mnyra_analytics_session_v1";
const DEDUPE_STORAGE_KEY = "mnyra_analytics_dedupe_v1";
const FLUSH_INTERVAL_MS = 2500;
const MAX_QUEUE_SIZE = 300;
const MAX_DEDUPE_KEYS = 600;

const trackerRuntime = {
  initialized: false,
  state: null,
  windowObj: null,
  documentObj: null,
  queue: [],
  flushTimer: null,
  flushing: false,
  sessionId: "",
  dedupe: { day: "", keys: [] },
  dedupeSet: new Set(),
  observerSnapshot: null,
  intersectionObserver: null,
  firebasePromise: null,
  disabled: false
};

function safeSessionStorage(win) {
  try {
    return win?.sessionStorage || null;
  } catch {
    return null;
  }
}

function randomId() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function ensureSessionId() {
  if (trackerRuntime.sessionId) return trackerRuntime.sessionId;
  const storage = safeSessionStorage(trackerRuntime.windowObj);
  let sessionId = "";
  try {
    sessionId = String(storage?.getItem(SESSION_STORAGE_KEY) || "").trim();
  } catch {}
  if (!sessionId) {
    sessionId = randomId();
    try {
      storage?.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch {}
  }
  trackerRuntime.sessionId = sessionId;
  return sessionId;
}

function loadDedupeRegistry() {
  const storage = safeSessionStorage(trackerRuntime.windowObj);
  const today = analyticsDayKey(new Date());
  let payload = null;
  try {
    payload = JSON.parse(storage?.getItem(DEDUPE_STORAGE_KEY) || "null");
  } catch {}
  if (!payload || payload.day !== today || !Array.isArray(payload.keys)) {
    payload = { day: today, keys: [] };
  }
  trackerRuntime.dedupe = payload;
  trackerRuntime.dedupeSet = new Set(payload.keys);
}

function persistDedupeRegistry() {
  const storage = safeSessionStorage(trackerRuntime.windowObj);
  try {
    storage?.setItem(DEDUPE_STORAGE_KEY, JSON.stringify({
      day: trackerRuntime.dedupe.day,
      keys: trackerRuntime.dedupe.keys.slice(-MAX_DEDUPE_KEYS)
    }));
  } catch {}
}

// true = zum ersten Mal gesehen (Event soll zaehlen)
function markOnce(key = "") {
  const safeKey = String(key || "").trim();
  if (!safeKey) return false;
  const today = analyticsDayKey(new Date());
  if (trackerRuntime.dedupe.day !== today) {
    trackerRuntime.dedupe = { day: today, keys: [] };
    trackerRuntime.dedupeSet = new Set();
  }
  if (trackerRuntime.dedupeSet.has(safeKey)) return false;
  trackerRuntime.dedupeSet.add(safeKey);
  trackerRuntime.dedupe.keys.push(safeKey);
  if (trackerRuntime.dedupe.keys.length > MAX_DEDUPE_KEYS) {
    trackerRuntime.dedupe.keys = trackerRuntime.dedupe.keys.slice(-MAX_DEDUPE_KEYS);
    trackerRuntime.dedupeSet = new Set(trackerRuntime.dedupe.keys);
  }
  persistDedupeRegistry();
  return true;
}

function getState() {
  return trackerRuntime.state || {};
}

function ownRestaurantId() {
  const profile = getState().userProfile || {};
  return String(profile.restaurantId || profile.staffRestaurantId || "").trim();
}

function isCeoProfile() {
  const profile = getState().userProfile || {};
  const roleKey = String(profile.role || "").trim().toLowerCase();
  if (roleKey === "ceo") return true;
  const roles = Array.isArray(profile.roles) ? profile.roles : [];
  return roles.some((role) => String(role || "").trim().toLowerCase() === "ceo");
}

// Zaehlt diese Ansicht fuer das Business? Eigene Previews und CEO-Browsing nicht.
function shouldTrackBusiness(businessId = "") {
  const safeId = String(businessId || "").trim();
  if (!safeId) return false;
  if (safeId === ownRestaurantId()) return false;
  if (isCeoProfile()) return false;
  return true;
}

function currentUserId() {
  return String(getState().user?.uid || "").trim();
}

async function ensureFirebase() {
  if (!trackerRuntime.firebasePromise) {
    trackerRuntime.firebasePromise = Promise.all([
      import(/* @vite-ignore */ FIREBASE_CONFIG_MODULE_URL),
      import(/* @vite-ignore */ FIREBASE_FIRESTORE_MODULE_URL)
    ]).then(([configModule, firestoreModule]) => {
      if (!configModule?.db) throw new Error("analytics-firebase-db-unavailable");
      return { db: configModule.db, firestore: firestoreModule };
    }).catch((err) => {
      trackerRuntime.firebasePromise = null;
      throw err;
    });
  }
  return trackerRuntime.firebasePromise;
}

function scheduleFlush() {
  if (trackerRuntime.flushTimer || !trackerRuntime.queue.length) return;
  const win = trackerRuntime.windowObj;
  // Kein Fallback auf globales setTimeout: in Node-Tests (Window-Stub ohne
  // setTimeout) darf kein haengender Timer entstehen.
  if (typeof win?.setTimeout !== "function") return;
  trackerRuntime.flushTimer = win.setTimeout(() => {
    trackerRuntime.flushTimer = null;
    void flushAnalyticsQueue();
  }, FLUSH_INTERVAL_MS);
}

export async function flushAnalyticsQueue() {
  if (trackerRuntime.flushing || !trackerRuntime.queue.length || trackerRuntime.disabled) return;
  trackerRuntime.flushing = true;
  const events = trackerRuntime.queue.splice(0, trackerRuntime.queue.length);
  try {
    const { db, firestore } = await ensureFirebase();
    const {
      collection, doc, writeBatch, serverTimestamp, increment
    } = firestore;
    // Aggregate pro Business+Tag buendeln, Roh-Events einzeln anhaengen.
    const dailyPatches = new Map();
    const batch = writeBatch(db);
    let writes = 0;
    events.forEach((event) => {
      if (writes >= 400) return; // Batch-Limit-Sicherheit; Rest verwerfen wir bewusst.
      const eventsRef = doc(collection(db, "restaurants", event.businessId, "analyticsEvents"));
      const { __retried, ...eventPayload } = event;
      batch.set(eventsRef, { ...eventPayload, createdAt: serverTimestamp() });
      writes += 1;
      const dailyKey = `${event.businessId}::${event.day}`;
      if (!dailyPatches.has(dailyKey)) {
        dailyPatches.set(dailyKey, {
          businessId: event.businessId,
          day: event.day,
          patch: { date: event.day }
        });
      }
      applyIncrementPlanToPatch(
        dailyPatches.get(dailyKey).patch,
        buildDailyIncrementPlan(event),
        (n) => increment(n)
      );
    });
    dailyPatches.forEach(({ businessId, day, patch }) => {
      if (writes >= 480) return;
      patch.updatedAt = serverTimestamp();
      batch.set(doc(db, "restaurants", businessId, "analyticsDaily", day), patch, { merge: true });
      writes += 1;
    });
    if (writes > 0) await batch.commit();
  } catch (err) {
    // Fehlgeschlagene Events nicht endlos requeuen: nur einmal zuruecklegen.
    try {
      const requeue = events.filter((event) => event.__retried !== true).map((event) => ({ ...event, __retried: true }));
      trackerRuntime.queue.unshift(...requeue.slice(0, MAX_QUEUE_SIZE));
    } catch {}
    console.warn("[mnyra][analytics] flush failed", err);
  } finally {
    trackerRuntime.flushing = false;
    if (trackerRuntime.queue.length) scheduleFlush();
  }
}

export function trackAnalyticsEvent(name = "", meta = {}) {
  try {
    if (trackerRuntime.disabled) return false;
    const businessId = String(meta?.businessId || "").trim();
    if (!shouldTrackBusiness(businessId)) return false;
    if (meta?.onceKey && !markOnce(`${meta.onceKey}`)) return false;
    const isUnique = ANALYTICS_UNIQUE_EVENTS.includes(String(name || "").trim())
      ? markOnce(`u:${name}:${businessId}`)
      : false;
    const event = buildAnalyticsEvent(name, { ...meta, isUnique }, {
      now: new Date(),
      sessionId: ensureSessionId(),
      userId: currentUserId()
    });
    if (!event) return false;
    if (trackerRuntime.queue.length >= MAX_QUEUE_SIZE) trackerRuntime.queue.shift();
    trackerRuntime.queue.push(event);
    scheduleFlush();
    return true;
  } catch (err) {
    console.warn("[mnyra][analytics] track failed", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// State-Transition-Beobachtung (wird nach jedem render() aufgerufen)
// ---------------------------------------------------------------------------

function resolveProfileViewBusinessId(state = getState()) {
  return String(state?.profileView?.profile?.restaurantId || "").trim();
}

function resolveProfileAccessContext(state = getState()) {
  const profileView = state?.profileView || {};
  const routePayload = profileView.routePayload && typeof profileView.routePayload === "object"
    ? profileView.routePayload
    : {};
  const menuAccessSource = String(
    profileView.menuAccessSource
    || routePayload.menuAccessSource
    || state?.profileAccessSource
    || ""
  ).trim().toLowerCase();
  const tableNumber = Math.max(0, Math.trunc(Number(
    profileView.tableNumber
    ?? routePayload.tableNumber
    ?? state?.profileTableNumber
    ?? 0
  ) || 0));
  return { menuAccessSource, tableNumber };
}

function inferProfileSource(prevTab = "", state = getState()) {
  const { menuAccessSource, tableNumber } = resolveProfileAccessContext(state);
  if (menuAccessSource === "qr" || tableNumber > 0) return "qr";
  const prev = String(prevTab || "").trim().toLowerCase();
  if (prev === "feed" || prev === "home") return "feed";
  if (prev === "restaurants" || prev === "travel" || prev === "shopping") return "restaurants";
  if (prev === "search") return "search";
  if (prev === "map") return "map";
  if (!prev) {
    try {
      const referrer = String(trackerRuntime.documentObj?.referrer || "").trim();
      const host = String(trackerRuntime.windowObj?.location?.host || "").trim();
      if (referrer && host && !referrer.includes(host)) return "external";
    } catch {}
    return "direct";
  }
  return "other";
}

function snapshotState(state = getState()) {
  const businessId = resolveProfileViewBusinessId(state);
  return {
    activeTab: String(state?.activeTab || "").trim().toLowerCase(),
    profileBusinessId: businessId,
    profileTopTab: String(state?.profileTopTab || "").trim().toLowerCase(),
    menuDetailKey: state?.menuDetail?.open
      ? `${String(state.menuDetail.item?.id || state.menuDetail.itemId || "").trim()}`
      : "",
    checkoutOpen: !!state?.shopCart?.checkoutOpen,
    confirmationAt: Number(state?.shopCart?.confirmation?.createdAt || 0)
  };
}

function handleProfileViewTransition(prev, next, state) {
  if (!next.profileBusinessId || next.profileBusinessId === prev.profileBusinessId) return;
  const source = inferProfileSource(prev.activeTab === "profile" ? "" : prev.activeTab, state);
  const { tableNumber } = resolveProfileAccessContext(state);
  trackAnalyticsEvent("business_profile_view", {
    businessId: next.profileBusinessId,
    source,
    tableNumber
  });
  if (source === "qr") {
    trackAnalyticsEvent("qr_scan", {
      businessId: next.profileBusinessId,
      source: "qr",
      tableNumber,
      onceKey: `qr:${next.profileBusinessId}:${tableNumber}`
    });
  }
  if (source === "feed") {
    trackAnalyticsEvent("feed_click", {
      businessId: next.profileBusinessId,
      source: "feed"
    });
  }
}

function handleMenuOpenTransition(prev, next, state) {
  if (!next.profileBusinessId) return;
  const menuTabs = new Set(["menu", "cart", "favorites"]);
  const wasMenu = prev.profileBusinessId === next.profileBusinessId && menuTabs.has(prev.profileTopTab);
  const isMenu = next.profileTopTab === "menu";
  if (!isMenu || wasMenu) return;
  const { menuAccessSource, tableNumber } = resolveProfileAccessContext(state);
  trackAnalyticsEvent("menu_open", {
    businessId: next.profileBusinessId,
    source: menuAccessSource === "qr" || tableNumber > 0 ? "qr" : "direct",
    tableNumber
  });
}

function handleProductViewTransition(prev, next, state) {
  if (!next.menuDetailKey || next.menuDetailKey === prev.menuDetailKey) return;
  const detail = state?.menuDetail || {};
  const item = detail.item && typeof detail.item === "object" ? detail.item : {};
  const businessId = String(
    detail.restaurantId
    || item.restaurantId
    || resolveProfileViewBusinessId(state)
    || ""
  ).trim();
  if (!businessId) return;
  const { menuAccessSource, tableNumber } = resolveProfileAccessContext(state);
  trackAnalyticsEvent("product_view", {
    businessId,
    productId: item.id || detail.itemId || next.menuDetailKey,
    productName: item.name || item.title || "",
    source: menuAccessSource === "qr" || tableNumber > 0 ? "qr" : "direct"
  });
}

function handleCheckoutTransition(prev, next, state) {
  if (!next.checkoutOpen || prev.checkoutOpen) return;
  const cart = state?.shopCart || {};
  const businessId = String(cart.restaurantId || "").trim();
  if (!businessId) return;
  const tableNumber = Math.max(0, Math.trunc(Number(cart.tableNumber || 0) || 0));
  trackAnalyticsEvent("order_started", {
    businessId,
    source: tableNumber > 0 || String(cart.serviceMode || "").toLowerCase() === "table" ? "qr" : "direct",
    tableNumber
  });
}

// ---------------------------------------------------------------------------
// Impressionen (IntersectionObserver) + Klick-Delegation
// ---------------------------------------------------------------------------

function ensureIntersectionObserver() {
  if (trackerRuntime.intersectionObserver) return trackerRuntime.intersectionObserver;
  const win = trackerRuntime.windowObj;
  if (!win || typeof win.IntersectionObserver !== "function") return null;
  trackerRuntime.intersectionObserver = new win.IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      const node = entry.target;
      trackerRuntime.intersectionObserver?.unobserve(node);
      try {
        handleImpressionNode(node);
      } catch {}
    });
  }, { threshold: [0.5] });
  return trackerRuntime.intersectionObserver;
}

function handleImpressionNode(node) {
  const state = getState();
  const feedBusinessId = String(node.getAttribute("data-feed-post-open") || "").trim();
  if (feedBusinessId) {
    trackAnalyticsEvent("feed_impression", {
      businessId: feedBusinessId,
      source: "feed",
      onceKey: `fi:${feedBusinessId}`
    });
    return;
  }
  const feedPostId = String(node.getAttribute("data-feed-post-like") || "").trim();
  if (feedPostId) {
    const post = (Array.isArray(state?.feedPosts) ? state.feedPosts : [])
      .find((item) => String(item?.id || "").trim() === feedPostId);
    const businessId = String(post?.restaurantId || "").trim();
    if (businessId) {
      trackAnalyticsEvent("post_impression", {
        businessId,
        postId: feedPostId,
        source: "feed",
        onceKey: `pi:${feedPostId}`
      });
      trackAnalyticsEvent("feed_impression", {
        businessId,
        source: "feed",
        onceKey: `fi:${businessId}`
      });
    }
    return;
  }
  const profilePostId = String(node.getAttribute("data-open-post") || "").trim();
  if (profilePostId) {
    const businessId = resolveProfileViewBusinessId(state);
    if (businessId) {
      trackAnalyticsEvent("post_impression", {
        businessId,
        postId: profilePostId,
        source: "direct",
        onceKey: `pi:${profilePostId}`
      });
    }
  }
}

function scanImpressionTargets() {
  const doc = trackerRuntime.documentObj;
  const observer = ensureIntersectionObserver();
  if (!doc || !observer) return;
  const selector = "[data-feed-post-open], [data-feed-post-like], [data-open-post]";
  doc.querySelectorAll(selector).forEach((node) => {
    if (node.__mnyraAnalyticsObserved) return;
    node.__mnyraAnalyticsObserved = true;
    observer.observe(node);
  });
}

function resolveContactKindFromAnchor(anchor) {
  const href = String(anchor?.getAttribute?.("href") || "").toLowerCase();
  if (!href) return "";
  if (href.startsWith("tel:")) return "phone";
  if (href.includes("maps.google") || href.includes("google.com/maps") || href.startsWith("geo:")) return "map";
  if (
    href.includes("instagram.com")
    || href.includes("facebook.com")
    || href.includes("tiktok.com")
    || href.includes("wa.me")
    || href.includes("whatsapp.com")
  ) return "social";
  return "";
}

function handleDelegatedClick(eventTarget) {
  const state = getState();
  const closest = (selector) => eventTarget?.closest?.(selector) || null;

  const feedOpen = closest("[data-feed-post-open]");
  if (feedOpen) {
    const businessId = String(feedOpen.getAttribute("data-feed-post-open") || "").trim();
    if (businessId) {
      trackAnalyticsEvent("feed_click", { businessId, source: "feed" });
      trackAnalyticsEvent("post_click", { businessId, source: "feed" });
    }
    return;
  }

  const feedLike = closest("[data-feed-post-like]");
  if (feedLike) {
    const postId = String(feedLike.getAttribute("data-feed-post-like") || "").trim();
    const post = (Array.isArray(state?.feedPosts) ? state.feedPosts : [])
      .find((item) => String(item?.id || "").trim() === postId);
    const businessId = String(post?.restaurantId || "").trim();
    if (businessId && postId) {
      trackAnalyticsEvent("post_like", { businessId, postId, source: "feed" });
    }
    return;
  }

  const feedShare = closest("[data-feed-post-share]");
  if (feedShare) {
    const postId = String(feedShare.getAttribute("data-feed-post-share") || "").trim();
    const post = (Array.isArray(state?.feedPosts) ? state.feedPosts : [])
      .find((item) => String(item?.id || "").trim() === postId);
    const businessId = String(post?.restaurantId || "").trim();
    if (businessId && postId) {
      trackAnalyticsEvent("post_share", { businessId, postId, source: "feed" });
    }
    return;
  }

  const openPost = closest("[data-open-post]");
  if (openPost) {
    const businessId = resolveProfileViewBusinessId(state);
    const postId = String(openPost.getAttribute("data-open-post") || "").trim();
    if (businessId && postId) {
      trackAnalyticsEvent("post_click", { businessId, postId, source: "direct" });
    }
    return;
  }

  const menuLike = closest("[data-menu-card-like]");
  if (menuLike) {
    const businessId = resolveProfileViewBusinessId(state);
    const productId = String(menuLike.getAttribute("data-menu-card-like") || "").trim();
    if (businessId && productId) {
      trackAnalyticsEvent("product_like", { businessId, productId, source: "direct" });
    }
    return;
  }

  const category = closest("[data-business-menu-category]");
  if (category) {
    const businessId = resolveProfileViewBusinessId(state);
    const categoryId = String(category.getAttribute("data-business-menu-category") || "").trim();
    if (businessId && categoryId) {
      trackAnalyticsEvent("category_open", {
        businessId,
        categoryId,
        categoryName: String(category.textContent || "").trim().slice(0, 80)
      });
    }
    return;
  }

  const kellner = closest('[data-action="kellner"]');
  if (kellner) {
    const businessId = resolveProfileViewBusinessId(state);
    const { tableNumber } = resolveProfileAccessContext(state);
    if (businessId) {
      trackAnalyticsEvent("call_waiter_click", {
        businessId,
        tableNumber,
        source: tableNumber > 0 ? "qr" : "direct"
      });
    }
    return;
  }

  const anchor = closest("a[href]");
  if (anchor) {
    const businessId = resolveProfileViewBusinessId(state);
    if (!businessId) return;
    const kind = resolveContactKindFromAnchor(anchor);
    if (kind) {
      trackAnalyticsEvent("profile_contact_click", { businessId, contactKind: kind });
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Nach jedem Render aufrufen: erkennt State-Transitions und registriert
// neue Impression-Ziele. Wiederholte Aufrufe ohne Aenderung sind no-ops.
export function observeAnalyticsState() {
  try {
    if (!trackerRuntime.initialized || trackerRuntime.disabled) return;
    const state = getState();
    const next = snapshotState(state);
    const prev = trackerRuntime.observerSnapshot || {
      activeTab: "",
      profileBusinessId: "",
      profileTopTab: "",
      menuDetailKey: "",
      checkoutOpen: false,
      confirmationAt: 0
    };
    trackerRuntime.observerSnapshot = next;
    handleProfileViewTransition(prev, next, state);
    handleMenuOpenTransition(prev, next, state);
    handleProductViewTransition(prev, next, state);
    handleCheckoutTransition(prev, next, state);
    scanImpressionTargets();
  } catch (err) {
    console.warn("[mnyra][analytics] observe failed", err);
  }
}

export function initAnalyticsTracker({ state, windowObj, documentObj } = {}) {
  try {
    if (trackerRuntime.initialized) return;
    trackerRuntime.state = state || null;
    trackerRuntime.windowObj = windowObj || (typeof window === "undefined" ? null : window);
    trackerRuntime.documentObj = documentObj
      || trackerRuntime.windowObj?.document
      || (typeof document === "undefined" ? null : document);
    if (!trackerRuntime.state || !trackerRuntime.windowObj || !trackerRuntime.documentObj) {
      trackerRuntime.disabled = true;
      return;
    }
    trackerRuntime.initialized = true;
    ensureSessionId();
    loadDedupeRegistry();
    trackerRuntime.documentObj.addEventListener("click", (event) => {
      try {
        handleDelegatedClick(event.target);
      } catch {}
    }, { capture: true, passive: true });
    trackerRuntime.documentObj.addEventListener("visibilitychange", () => {
      if (trackerRuntime.documentObj.visibilityState === "hidden") {
        void flushAnalyticsQueue();
      }
    });
    trackerRuntime.windowObj.addEventListener("pagehide", () => {
      void flushAnalyticsQueue();
    });
  } catch (err) {
    trackerRuntime.disabled = true;
    console.warn("[mnyra][analytics] init failed", err);
  }
}

// Nur fuer Tests: internen Zustand zuruecksetzen / inspizieren.
export function __resetAnalyticsTrackerForTests({ state = null, windowObj = null, documentObj = null } = {}) {
  trackerRuntime.initialized = !!(state && windowObj && documentObj);
  trackerRuntime.state = state;
  trackerRuntime.windowObj = windowObj;
  trackerRuntime.documentObj = documentObj;
  trackerRuntime.queue = [];
  trackerRuntime.flushTimer = null;
  trackerRuntime.flushing = false;
  trackerRuntime.sessionId = "";
  trackerRuntime.dedupe = { day: "", keys: [] };
  trackerRuntime.dedupeSet = new Set();
  trackerRuntime.observerSnapshot = null;
  trackerRuntime.intersectionObserver = null;
  trackerRuntime.firebasePromise = null;
  trackerRuntime.disabled = false;
}

export function __getAnalyticsQueueForTests() {
  return trackerRuntime.queue.slice();
}
