import { app as sharedApp } from "/shared/firebase-config.js?v=2026-03-10-startup-1";
import {
  getApps,
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  browserSessionPersistence,
  browserLocalPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  collection,
  doc,
  getFirestore,
  getDoc,
  getDocs,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import {
  getMessaging,
  getToken,
  isSupported as isMessagingSupported,
  onMessage
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging.js";

const APP_ROOT = document.getElementById("app");
const WAITER_FIREBASE_APP_NAME = "menyra-waiter";
const WAITER_SW_URL = "/waiter/sw.js";
const WAITER_SW_SCOPE = "/waiter/";
const DEVICE_ID_KEY = "mnyra_waiter_device_id_v1";
const ACCESS_CACHE_KEY_PREFIX = "mnyra_waiter_access_v1:";
const FCM_WEB_PUSH_VAPID_KEY = "BERxbC5-yX8miGIVaFJGAapzd0-jL0D9HQf3swOJiKZcAJsAO_FoC-8v7DCCcDgmfgkKcMVd0X6VVq8zD2hePqk";
const moneyFormatter = new Intl.NumberFormat("de-AT", {
  style: "currency",
  currency: "EUR"
});
const dateFormatter = new Intl.DateTimeFormat("de-AT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});
const timeFormatter = new Intl.DateTimeFormat("de-AT", {
  hour: "2-digit",
  minute: "2-digit"
});
const statusLabels = {
  bestellung: "Neu",
  angenommen: "Arbeit",
  fertig: "Fertig",
  archiv: "Archiv"
};
const statusToneClasses = {
  bestellung: {
    text: "text-rose-400",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30"
  },
  angenommen: {
    text: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30"
  },
  fertig: {
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
  },
  archiv: {
    text: "text-zinc-500",
    badge: "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
  }
};
let waiterApp = null;
let waiterAuth = null;
let waiterDb = null;

function getWaiterFirebaseApp() {
  if (waiterApp) return waiterApp;
  const existing = getApps().find((entry) => entry.name === WAITER_FIREBASE_APP_NAME);
  waiterApp = existing || initializeApp(sharedApp.options, WAITER_FIREBASE_APP_NAME);
  return waiterApp;
}

function getWaiterDb() {
  if (waiterDb) return waiterDb;
  const app = getWaiterFirebaseApp();
  try {
    waiterDb = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch {
    waiterDb = getFirestore(app);
  }
  return waiterDb;
}

function getWaiterAuth() {
  if (waiterAuth) return waiterAuth;
  const app = getWaiterFirebaseApp();
  try {
    waiterAuth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence]
    });
  } catch {
    waiterAuth = getAuth(app);
  }
  return waiterAuth;
}

const app = getWaiterFirebaseApp();
const auth = getWaiterAuth();
const db = getWaiterDb();

const state = {
  authReady: false,
  authLoading: false,
  sessionLoading: false,
  loginError: "",
  sessionError: "",
  user: null,
  userProfile: null,
  access: {
    allowed: false,
    restaurantId: "",
    businessName: "",
    businessAvatar: "",
    displayName: "",
    roleLabel: "",
    owner: false,
    waiterAccess: false,
    tableCount: 0
  },
  orders: [],
  ordersLoaded: false,
  activeTab: "bestellung",
  selectedTable: null,
  archiveRange: "heute",
  archiveDateFrom: "",
  archiveDateTo: "",
  savingOrderIds: new Set(),
  toast: null,
  push: {
    loading: false,
    supported: false,
    permission: typeof Notification === "undefined" ? "denied" : Notification.permission,
    enabled: false,
    error: ""
  }
};

function isStandaloneDisplayMode() {
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  } catch {}
  return window.navigator?.standalone === true;
}

function useStandaloneWaiterSurface() {
  return Boolean(state.authReady && state.access.allowed && isStandaloneDisplayMode());
}

function getWaiterSurfaceTailStyle() {
  if (useStandaloneWaiterSurface()) {
    return "margin-top:-1px; min-height:max(72rem, 100dvh); background:#18181b;";
  }
  return "margin-top:-1px; height:88rem; background:linear-gradient(180deg, #18181b 0%, #18181b 74%, #101010 90%, #000000 100%);";
}

let ordersUnsub = null;
let toastTimer = null;
let toastExitTimer = null;
let ordersInitialized = false;
let seenOrderIds = new Set();
let serviceWorkerRegistrationPromise = null;
let foregroundMessageCleanup = null;
let alertAudioContext = null;
let alertAudioUnlockBound = false;

function asText(value = "") {
  return String(value || "").trim();
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toDate(value) {
  if (!value) return null;
  try {
    if (typeof value.toDate === "function") return value.toDate();
  } catch {}
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return moneyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

function formatOrderTime(value) {
  const date = toDate(value);
  if (!date) return "--:--";
  return timeFormatter.format(date);
}

function formatOrderDate(value) {
  const date = toDate(value);
  if (!date) return "";
  return dateFormatter.format(date);
}

function normalizeStatus(value = "") {
  const key = asText(value).toLowerCase();
  if (!key || key === "neu" || key === "new" || key === "bestellung" || key === "pending" || key === "open") {
    return "bestellung";
  }
  if (key === "angenommen" || key === "accepted" || key === "arbeit" || key === "in_progress") {
    return "angenommen";
  }
  if (key === "fertig" || key === "ready" || key === "serviert" || key === "served") {
    return "fertig";
  }
  if (key === "archiv" || key === "archived" || key === "done" || key === "completed") {
    return "archiv";
  }
  return "bestellung";
}

function resolveOrderTableNumber(source = {}) {
  const candidates = [
    source.table,
    source.tableNumber,
    source.tableId,
    source.tableNo,
    source.contact?.table,
    source.contact?.tableNumber,
    source.contact?.tableId
  ];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value) && value > 0) return Math.round(value);
  }
  return null;
}

function resolveOrderTableLabel(source = {}) {
  const numeric = resolveOrderTableNumber(source);
  if (numeric) return `T${numeric}`;
  const stringCandidate = asText(
    source.tableLabel
    || source.tableName
    || source.zone
    || source.contact?.tableLabel
    || source.contact?.tableName
  );
  return stringCandidate || "Kein Tisch";
}

function normalizeOrderItem(item = {}, index = 0) {
  const quantity = Math.max(1, Number(item.quantity || item.qty || 1) || 1);
  return {
    id: asText(item.id || item.itemId || `item_${index}`),
    name: asText(item.name || item.title || "Produkt") || "Produkt",
    quantity,
    price: Number(item.price || 0) || 0,
    note: asText(item.note || item.notes || item.instructions || item.comment || "")
  };
}

function normalizeOrderDoc(docSnap) {
  const source = docSnap?.data ? (docSnap.data() || {}) : (docSnap || {});
  const items = (Array.isArray(source.items) ? source.items : []).map(normalizeOrderItem);
  const total = Number(source.total || 0);
  const status = normalizeStatus(source.status);
  const tableNumber = resolveOrderTableNumber(source);
  const createdAt = source.createdAt || source.createdAtClient || source.updatedAt || source.updatedAtClient || null;
  const updatedAt = source.updatedAt || source.updatedAtClient || source.createdAt || source.createdAtClient || null;
  return {
    id: asText(docSnap?.id || source.id || `${Date.now()}`),
    rawStatus: asText(source.status || "Neu"),
    status,
    tableNumber,
    tableLabel: resolveOrderTableLabel(source),
    createdAt,
    updatedAt,
    buyerName: asText(source.buyerName || source.contact?.name || ""),
    buyerHandle: asText(source.buyerHandle || ""),
    businessName: asText(source.businessName || ""),
    contactPhone: asText(source.contact?.phone || ""),
    contactCity: asText(source.contact?.city || ""),
    contactAddress: asText(source.contact?.address || ""),
    itemCount: Math.max(1, Number(source.itemCount || items.reduce((sum, item) => sum + item.quantity, 0) || 1) || 1),
    total: Number.isFinite(total) ? total : 0,
    items
  };
}

function normalizeRoleLabel(role = "", owner = false) {
  if (owner) return "Owner";
  const key = asText(role).toLowerCase();
  if (key === "manager") return "Manager";
  return "Kellner";
}

function normalizeConfiguredTableCount(source = {}) {
  const candidates = [
    source.tableQrCount,
    source.tableCount,
    source.tableQrTables,
    source.tablesCount
  ];
  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value) && value >= 0) {
      return Math.max(0, Math.min(200, Math.trunc(value)));
    }
  }
  return 0;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function accessCacheKey(uid = "") {
  const safeUid = asText(uid);
  return safeUid ? `${ACCESS_CACHE_KEY_PREFIX}${safeUid}` : "";
}

function readCachedAccess(uid = "") {
  const key = accessCacheKey(uid);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) || {};
    const restaurantId = asText(parsed.restaurantId);
    if (!restaurantId) return null;
      return {
        allowed: parsed.allowed === true,
        restaurantId,
        businessName: asText(parsed.businessName),
        businessAvatar: asText(parsed.businessAvatar || "/apps/waiter/assets/logo-square.png"),
        displayName: asText(parsed.displayName),
        roleLabel: asText(parsed.roleLabel),
        owner: parsed.owner === true,
        waiterAccess: parsed.waiterAccess === true,
        tableCount: normalizeConfiguredTableCount(parsed)
      };
  } catch {
    return null;
  }
}

function writeCachedAccess(uid = "", access = null) {
  const key = accessCacheKey(uid);
  if (!key) return;
  if (!access || access.allowed !== true || !asText(access.restaurantId)) {
    try { localStorage.removeItem(key); } catch {}
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify({
      allowed: true,
      restaurantId: asText(access.restaurantId),
      businessName: asText(access.businessName),
        businessAvatar: asText(access.businessAvatar || "/apps/waiter/assets/logo-square.png"),
        displayName: asText(access.displayName),
        roleLabel: asText(access.roleLabel),
        owner: access.owner === true,
        waiterAccess: access.waiterAccess === true,
        tableQrCount: normalizeConfiguredTableCount(access),
        ts: Date.now()
      }));
  } catch {}
}

function subtractDays(date, days) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() - days);
  return next;
}

function matchesRestaurantOwnerIdentity(restaurant = {}, user = null) {
  const uid = asText(user?.uid);
  const email = asText(user?.email).toLowerCase();
  const ownerUidFields = [
    restaurant.ownerUid,
    restaurant.socialUid,
    restaurant.uid,
    restaurant.userUid,
    restaurant.accountUid
  ];
  const ownerEmailFields = [
    restaurant.ownerEmail,
    restaurant.email,
    restaurant.contactEmail,
    restaurant.socialEmail,
    restaurant.loginEmail,
    restaurant.accountEmail
  ];
  const uidMatch = !!uid && ownerUidFields.some((value) => asText(value) === uid);
  const emailMatch = !!email && ownerEmailFields.some((value) => asText(value).toLowerCase() === email);
  return uidMatch || emailMatch;
}

async function queryFirstRestaurantByFields(fields = [], value = "") {
  const safeValue = asText(value);
  if (!safeValue || !Array.isArray(fields) || !fields.length) {
    return {
      restaurantId: "",
      restaurantData: {}
    };
  }
  const results = await Promise.all(fields.map((field) => (
    getDocs(query(collection(db, "restaurants"), where(field, "==", safeValue), limit(1))).catch(() => null)
  )));
  for (const snap of results) {
    if (snap && !snap.empty) {
      const restaurantSnap = snap.docs[0];
      return {
        restaurantId: restaurantSnap.id,
        restaurantData: restaurantSnap.data() || {}
      };
    }
  }
  return {
    restaurantId: "",
    restaurantData: {}
  };
}

async function resolveOwnerRestaurant(user, explicitRestaurantId = "") {
  const safeRestaurantId = asText(explicitRestaurantId);
  if (safeRestaurantId) {
    const directSnap = await getDoc(doc(db, "restaurants", safeRestaurantId)).catch(() => null);
    if (directSnap?.exists?.()) {
      const directData = directSnap.data() || {};
      if (matchesRestaurantOwnerIdentity(directData, user)) {
        return {
          restaurantId: directSnap.id,
          restaurantData: directData
        };
      }
    }
  }

  const uid = asText(user?.uid);
  if (uid) {
    const byUid = await queryFirstRestaurantByFields(["ownerUid", "socialUid", "uid", "userUid", "accountUid"], uid);
    if (byUid.restaurantId) {
      return byUid;
    }
  }

  const email = asText(user?.email);
  const normalizedEmail = email.toLowerCase();
  const emailVariants = [...new Set([email, normalizedEmail].filter(Boolean))];
  if (emailVariants.length) {
    for (const variant of emailVariants) {
      const byEmail = await queryFirstRestaurantByFields(
        ["ownerEmail", "email", "contactEmail", "socialEmail", "loginEmail", "accountEmail"],
        variant
      );
      if (byEmail.restaurantId) {
        return byEmail;
      }
    }
  }

  return {
    restaurantId: "",
    restaurantData: {}
  };
}

function showToast(message = "", { tone = false } = {}) {
  if (!message) return;
  if (toastTimer) window.clearTimeout(toastTimer);
  if (toastExitTimer) window.clearTimeout(toastExitTimer);
  const toastId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  state.toast = {
    id: toastId,
    message,
    phase: "entering"
  };
  if (tone) {
    void playAlertTone();
  }
  render();
  const promoteToast = () => {
    if (state.toast?.id !== toastId) return;
    state.toast = {
      ...state.toast,
      phase: "visible"
    };
    render();
  };
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => window.requestAnimationFrame(promoteToast));
  } else {
    window.setTimeout(promoteToast, 24);
  }
  toastTimer = window.setTimeout(() => {
    dismissToast(toastId);
  }, 3600);
}

function dismissToast(toastId = "") {
  const activeToast = state.toast;
  if (!activeToast) return;
  if (toastId && activeToast.id !== toastId) return;
  if (activeToast.phase === "leaving") return;
  if (toastTimer) {
    window.clearTimeout(toastTimer);
    toastTimer = null;
  }
  state.toast = {
    ...activeToast,
    phase: "leaving"
  };
  render();
  if (toastExitTimer) window.clearTimeout(toastExitTimer);
  toastExitTimer = window.setTimeout(() => {
    if (state.toast?.id !== activeToast.id) return;
    state.toast = null;
    render();
  }, 460);
}

function getAlertAudioContext() {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!alertAudioContext || alertAudioContext.state === "closed") {
    alertAudioContext = new AudioContextCtor();
  }
  return alertAudioContext;
}

async function primeAlertTone() {
  try {
    const audioCtx = getAlertAudioContext();
    if (!audioCtx) return false;
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
    if (audioCtx.state !== "running") return false;
    const gain = audioCtx.createGain();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.00001, audioCtx.currentTime);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.01);
    oscillator.onended = () => {
      try {
        oscillator.disconnect();
        gain.disconnect();
      } catch {}
    };
    return true;
  } catch {
    return false;
  }
}

function bindAlertToneUnlock() {
  if (alertAudioUnlockBound) return;
  alertAudioUnlockBound = true;
  const unlock = () => {
    void primeAlertTone();
  };
  const options = { passive: true, capture: true };
  window.addEventListener("pointerdown", unlock, options);
  window.addEventListener("touchstart", unlock, options);
  window.addEventListener("touchend", unlock, options);
  window.addEventListener("click", unlock, options);
  window.addEventListener("keydown", unlock, options);
}

async function playAlertTone() {
  let played = false;
  try {
    const audioCtx = getAlertAudioContext();
    if (!audioCtx) throw new Error("AudioContext unavailable");
    if (audioCtx.state === "suspended") {
      await audioCtx.resume().catch(() => {});
    }
    if (audioCtx.state !== "running") {
      return;
    }
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(784, now);
    oscillator.frequency.exponentialRampToValueAtTime(932, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.44);
    oscillator.onended = () => {
      try {
        oscillator.disconnect();
        gain.disconnect();
      } catch {}
    };
    played = true;
  } catch {}
  try {
    if (navigator.vibrate) navigator.vibrate(played ? [140, 70, 140] : [180, 90, 180]);
  } catch {}
}

function parseForegroundNotificationPayload(payload = {}) {
  const notification = payload.notification || {};
  const data = payload.data || {};
  return {
    title: asText(notification.title || data.title || "Neue Bestellung"),
    body: asText(notification.body || data.body || "Neue Bestellung eingegangen")
  };
}

async function ensureServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  if (!serviceWorkerRegistrationPromise) {
    serviceWorkerRegistrationPromise = navigator.serviceWorker.getRegistration(WAITER_SW_SCOPE)
      .then((existing) => existing || navigator.serviceWorker.register(WAITER_SW_URL, { scope: WAITER_SW_SCOPE }))
      .catch((err) => {
        console.error(err);
        return null;
      });
  }
  return serviceWorkerRegistrationPromise;
}

function getDeviceId() {
  const existing = asText(localStorage.getItem(DEVICE_ID_KEY));
  if (existing) return existing;
  const next = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

async function syncPushDeviceToken({ requestPermission = false } = {}) {
  if (!state.user?.uid) return;
  state.push.supported = false;
  state.push.error = "";
  render();

  const supported = await isMessagingSupported().catch(() => false);
  state.push.supported = supported && window.isSecureContext && "serviceWorker" in navigator;
  state.push.permission = typeof Notification === "undefined" ? "denied" : Notification.permission;
  if (!state.push.supported) {
    render();
    return;
  }

  if (requestPermission && typeof Notification !== "undefined" && Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    state.push.permission = permission;
  }

  if (state.push.permission !== "granted") {
    state.push.enabled = false;
    render();
    return;
  }

  state.push.loading = true;
  render();

  try {
    const registration = await ensureServiceWorkerRegistration();
    if (!registration) throw new Error("Service Worker Registrierung fehlgeschlagen.");
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: FCM_WEB_PUSH_VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    if (!asText(token)) throw new Error("Kein Push-Token erhalten.");
    await setDoc(doc(db, "users", state.user.uid, "devices", `waiter_${getDeviceId()}`), {
      token,
      enabled: true,
      platform: "web",
      app: "menyra-waiter",
      scope: "waiter",
      locale: asText(navigator.language || "").slice(0, 24),
      userAgent: asText(navigator.userAgent || "").slice(0, 190),
      updatedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp()
    }, { merge: true });
    state.push.enabled = true;
    state.push.error = "";
  } catch (err) {
    console.error(err);
    state.push.enabled = false;
    state.push.error = err?.message || "Push konnte nicht aktiviert werden.";
  } finally {
    state.push.loading = false;
    render();
  }
}

async function bindForegroundMessaging() {
  if (foregroundMessageCleanup) return;
  const supported = await isMessagingSupported().catch(() => false);
  if (!supported) return;
  const messaging = getMessaging(app);
  foregroundMessageCleanup = onMessage(messaging, (payload) => {
    const notification = parseForegroundNotificationPayload(payload);
    showToast(notification.body || notification.title, { tone: true });
  });
}

function stopForegroundMessaging() {
  if (typeof foregroundMessageCleanup === "function") {
    try {
      foregroundMessageCleanup();
    } catch {}
  }
  foregroundMessageCleanup = null;
}

function stopOrdersListener() {
  if (typeof ordersUnsub === "function") {
    try {
      ordersUnsub();
    } catch {}
  }
  ordersUnsub = null;
}

function handleIncomingOrderNotification(order) {
  const label = order.tableNumber ? `Tisch ${order.tableNumber}` : order.tableLabel;
  const buyer = order.buyerName ? ` fuer ${order.buyerName}` : "";
  showToast(`Neue Bestellung ${label}${buyer}`, { tone: true });

  if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.visibilityState !== "visible") {
    const title = state.access.businessName || "MNYRA Waiter";
    const body = `Neue Bestellung ${label}${buyer}`;
    ensureServiceWorkerRegistration().then((registration) => {
      if (registration?.showNotification) {
        registration.showNotification(title, {
          body,
          icon: state.access.businessAvatar || "/apps/waiter/assets/icon-192.png",
          badge: "/apps/waiter/assets/icon-192.png",
          silent: false,
          vibrate: [180, 90, 180],
          tag: `waiter_order_${order.id}`,
          data: {
            url: `/waiter/?restaurant=${encodeURIComponent(state.access.restaurantId)}&order=${encodeURIComponent(order.id)}`
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }
}

function startOrdersListener() {
  stopOrdersListener();
  const restaurantId = asText(state.access.restaurantId);
  if (!restaurantId) return;
  state.sessionError = "";
  render();

  const ordersRef = collection(db, "restaurants", restaurantId, "orders");
  const orderedQuery = query(ordersRef, orderBy("createdAt", "desc"), limit(120));
  const fallbackQuery = query(ordersRef, limit(120));
  let usingFallback = false;

  const subscribe = (refQuery) => {
    ordersUnsub = onSnapshot(refQuery, (snapshot) => {
      const nextOrders = snapshot.docs.map((docSnap) => normalizeOrderDoc(docSnap));
      nextOrders.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
      if (ordersInitialized) {
        snapshot.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const order = normalizeOrderDoc(change.doc);
          if (seenOrderIds.has(order.id)) return;
          seenOrderIds.add(order.id);
          if (order.status === "bestellung") {
            handleIncomingOrderNotification(order);
          }
        });
      } else {
        seenOrderIds = new Set(nextOrders.map((order) => order.id));
        ordersInitialized = true;
      }
      state.orders = nextOrders;
      state.ordersLoaded = true;
      render();
      maybeOpenHighlightedOrder();
    }, (err) => {
      console.error(err);
      if (!usingFallback) {
        usingFallback = true;
        subscribe(fallbackQuery);
        return;
      }
      state.sessionError = err?.message || "Bestellungen konnten nicht geladen werden.";
      state.ordersLoaded = true;
      render();
    });
  };

  subscribe(orderedQuery);
}

async function resolveAccessContext(user) {
  const userSnap = await getDoc(doc(db, "users", user.uid));
  const userData = userSnap.exists() ? (userSnap.data() || {}) : {};
  const permissions = userData.permissions && typeof userData.permissions === "object" ? userData.permissions : {};
  const role = asText(userData.role).toLowerCase();
  const ownerRestaurantId = asText(userData.restaurantId);
  const isStaffAccount = role === "staff"
    || !!asText(
      userData.staffRestaurantId
      || userData.waiterRestaurantId
      || userData.businessOwnerUid
      || ""
    );
  const ownerRestaurant = isStaffAccount
    ? { restaurantId: "", restaurantData: {} }
    : await resolveOwnerRestaurant(user, ownerRestaurantId);
  const owner = !isStaffAccount && (
    !!ownerRestaurantId
    || role === "business"
    || !!asText(ownerRestaurant.restaurantId)
  );
  const baseRestaurantId = asText(userData.waiterRestaurantId || userData.staffRestaurantId || userData.restaurantId);
  const userWaiterAccess = userData.waiterAccess === true || permissions.waiterAccess === true;

  let restaurantId = owner ? asText(ownerRestaurant.restaurantId || ownerRestaurantId) : baseRestaurantId;
  let staffData = {};
  let restaurantData = owner ? (ownerRestaurant.restaurantData || {}) : {};
  let restaurantMeta = {};
  if (restaurantId) {
    const [staffSnap, restaurantSnap, metaSnap] = await Promise.all([
      owner ? Promise.resolve(null) : getDoc(doc(db, "restaurants", restaurantId, "staff", user.uid)).catch(() => null),
      Object.keys(restaurantData).length ? Promise.resolve(null) : getDoc(doc(db, "restaurants", restaurantId)).catch(() => null),
      getDoc(doc(db, "restaurants", restaurantId, "public", "meta")).catch(() => null)
    ]);
    if (staffSnap?.exists?.()) {
      staffData = staffSnap.data() || {};
    }
    if (restaurantSnap?.exists?.()) {
      restaurantData = restaurantSnap.data() || {};
    }
    if (metaSnap?.exists?.()) {
      restaurantMeta = metaSnap.data() || {};
    }
  }

  const staffPermissions = staffData.permissions && typeof staffData.permissions === "object" ? staffData.permissions : {};
  const hasStaffDoc = owner || Object.keys(staffData).length > 0;
  const waiterAccess = owner
    || userWaiterAccess
    || staffData.waiterAccess === true
    || staffPermissions.waiterAccess === true;
  const active = owner
    || (
      hasStaffDoc
      &&
      staffData.active !== false
      && asText(staffData.status).toLowerCase() !== "disabled"
      && userData.staffActive !== false
      && asText(userData.staffStatus).toLowerCase() !== "disabled"
    );

  const allowed = owner || (hasStaffDoc && !!restaurantId && waiterAccess && active);

  if (owner && restaurantId && !ownerRestaurantId) {
    void setDoc(doc(db, "users", user.uid), {
      restaurantId,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(() => null);
  }

  return {
    allowed,
    restaurantId,
    businessName: asText(
      restaurantData.name
      || restaurantData.restaurantName
      || staffData.restaurantName
      || "Business"
    ),
    businessAvatar: asText(
      restaurantData.logoUrl
      || restaurantData.logo
      || "/apps/waiter/assets/logo-square.png"
    ),
    displayName: asText(userData.name || user.displayName || user.email || "Staff"),
    roleLabel: normalizeRoleLabel(asText(staffData.role || userData.staffRole || ""), owner),
    owner,
    waiterAccess,
    tableCount: normalizeConfiguredTableCount(restaurantMeta)
  };
}

function resetSessionUi() {
  state.access = {
    allowed: false,
    restaurantId: "",
    businessName: "",
    businessAvatar: "",
    displayName: "",
    roleLabel: "",
    owner: false,
    waiterAccess: false,
    tableCount: 0
  };
  state.orders = [];
  state.ordersLoaded = false;
  state.activeTab = "bestellung";
  state.selectedTable = null;
  state.sessionError = "";
  state.savingOrderIds = new Set();
  state.sessionLoading = false;
  ordersInitialized = false;
  seenOrderIds = new Set();
}

function syncDocumentTitle() {
  const brand = asText(state.access.businessName || "MNYRA Waiter");
  document.title = state.access.allowed ? `${brand} - Waiter` : "MNYRA Waiter";
}

function syncPageSurface() {
  try {
    const standalone = useStandaloneWaiterSurface();
    document.documentElement.style.background = "#000000";
    document.documentElement.style.overscrollBehaviorY = standalone ? "none" : "auto";
    document.body.style.background = standalone ? "#18181b" : "#000000";
    document.body.style.overscrollBehaviorY = standalone ? "none" : "auto";
    APP_ROOT?.style?.setProperty("background", "transparent");
    APP_ROOT?.style?.setProperty("background-image", "none");
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", "#000000");
    }
  } catch {}
}

function openOrderFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    orderId: asText(params.get("order")),
    restaurantId: asText(params.get("restaurant"))
  };
}

function maybeOpenHighlightedOrder() {
  const { orderId, restaurantId } = openOrderFromQuery();
  if (!orderId) return;
  if (restaurantId && restaurantId !== asText(state.access.restaurantId)) return;
  const order = state.orders.find((entry) => entry.id === orderId);
  if (!order) return;
  if (order.tableNumber) {
    state.selectedTable = order.tableNumber;
  }
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete("order");
  history.replaceState({}, "", nextUrl.toString());
  render();
}

async function handleAuthChanged(user) {
  stopOrdersListener();
  stopForegroundMessaging();
  state.user = user || null;
  state.userProfile = null;
  resetSessionUi();
  state.authReady = true;
  state.authLoading = false;
  state.loginError = "";
  if (!user) {
    writeCachedAccess("");
    syncDocumentTitle();
    render();
    return;
  }
  const cachedAccess = readCachedAccess(user.uid);
  if (cachedAccess?.allowed) {
    state.access = cachedAccess;
    state.userProfile = cachedAccess;
  }
  state.sessionLoading = true;
  syncDocumentTitle();
  render();

  try {
    const access = await resolveAccessContext(user);
    state.access = access;
    state.userProfile = access;
    writeCachedAccess(user.uid, access);
    state.sessionLoading = false;
    syncDocumentTitle();
    render();
    if (!access.allowed) {
      state.sessionError = "Dieser Account hat keinen Zugriff auf die Waiter App.";
      render();
      return;
    }
    startOrdersListener();
    void bindForegroundMessaging();
    void syncPushDeviceToken({ requestPermission: false });
  } catch (err) {
    console.error(err);
    state.sessionLoading = false;
    writeCachedAccess(user.uid, null);
    state.sessionError = err?.message || "Session konnte nicht geladen werden.";
    render();
  }
}

function matchesArchiveRange(order) {
  const value = toDate(order.updatedAt) || toDate(order.createdAt);
  if (!value) return true;
  if (state.archiveRange === "woche") {
    return value >= subtractDays(new Date(), 7);
  }
  if (state.archiveRange === "custom") {
    const from = asText(state.archiveDateFrom);
    const to = asText(state.archiveDateTo);
    if (!from && !to) return true;
    const lower = from ? new Date(`${from}T00:00:00`) : null;
    const upper = to ? new Date(`${to}T23:59:59`) : null;
    if (lower && value < lower) return false;
    if (upper && value > upper) return false;
    return true;
  }
  return value >= new Date(`${todayIso()}T00:00:00`);
}

function getOrdersForTab(tab = state.activeTab) {
  const targetTab = asText(tab) || "bestellung";
  if (targetTab === "archiv") {
    return state.orders.filter((order) => order.status === "archiv").filter(matchesArchiveRange);
  }
  return state.orders.filter((order) => order.status === targetTab);
}

function getTableIds() {
  const activeSet = new Set();
  const configuredCount = normalizeConfiguredTableCount(state.access);
  for (let index = 1; index <= configuredCount; index += 1) {
    activeSet.add(index);
  }
  state.orders.forEach((order) => {
    if (order.status === "archiv") return;
    if (Number.isFinite(order.tableNumber) && order.tableNumber > 0) {
      activeSet.add(order.tableNumber);
    }
  });
  return Array.from(activeSet).sort((a, b) => a - b);
}

function getActiveTableIdSet() {
  const activeSet = new Set();
  state.orders.forEach((order) => {
    if (order.status === "archiv") return;
    if (Number.isFinite(order.tableNumber) && order.tableNumber > 0) {
      activeSet.add(order.tableNumber);
    }
  });
  return activeSet;
}

function renderStatusButton(order) {
  const saving = state.savingOrderIds.has(order.id);
  if (order.status === "bestellung") {
    return `
      <button type="button" data-order-action="angenommen" data-order-id="${escapeHtml(order.id)}" class="w-full bg-white text-black font-black text-[12px] uppercase tracking-[0.1em] py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60" ${saving ? "disabled" : ""}>
        <span>${saving ? "Speichern..." : "Bestellung annehmen"}</span>
        <span aria-hidden="true">></span>
      </button>
    `;
  }
  if (order.status === "angenommen") {
    return `
      <button type="button" data-order-action="fertig" data-order-id="${escapeHtml(order.id)}" class="w-full bg-emerald-500 text-black font-black text-[12px] uppercase tracking-[0.1em] py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60" ${saving ? "disabled" : ""}>
        <span>${saving ? "Speichern..." : "Serviert"}</span>
      </button>
    `;
  }
  if (order.status === "fertig") {
    return `
      <button type="button" data-order-action="archiv" data-order-id="${escapeHtml(order.id)}" class="w-full bg-zinc-800 text-zinc-300 font-black text-[12px] uppercase tracking-[0.1em] py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all border border-zinc-700/50 disabled:opacity-60" ${saving ? "disabled" : ""}>
        <span>${saving ? "Speichern..." : "Archivieren"}</span>
      </button>
    `;
  }
  return "";
}

function renderOrderCard(order) {
  const tone = statusToneClasses[order.status] || statusToneClasses.bestellung;
  const metaLine = [order.contactPhone, order.contactCity].filter(Boolean).join(" / ");
  return `
    <article class="bg-black/30 rounded-[2rem] overflow-hidden transition-all border border-zinc-800/60 ${order.status === "archiv" ? "opacity-50" : ""}">
      <div class="p-5 flex justify-between items-start gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border border-zinc-800/30 ${tone.badge}">
            ${escapeHtml(order.tableNumber ? String(order.tableNumber) : "*")}
          </div>
          <div class="min-w-0">
            <h3 class="font-bold text-white text-[17px] tracking-tight leading-none mb-1.5 uppercase truncate">${escapeHtml(order.tableNumber ? `Tisch ${order.tableNumber}` : order.tableLabel)}</h3>
            <div class="flex flex-wrap items-center gap-2">
              <span class="bg-zinc-800/80 text-zinc-500 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-zinc-700/30">${escapeHtml(formatOrderTime(order.createdAt))}</span>
              <span class="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${tone.badge}">${escapeHtml(statusLabels[order.status] || order.rawStatus)}</span>
              ${metaLine ? `<span class="bg-zinc-900 text-zinc-500 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-zinc-700/30 truncate">${escapeHtml(metaLine)}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="text-right shrink-0">
          <p class="text-xs font-black text-zinc-100">${escapeHtml(formatMoney(order.total))}</p>
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">${escapeHtml(order.id)}</p>
        </div>
      </div>
      <div class="px-5 pb-5">
        <div class="bg-zinc-900/40 rounded-2xl p-4 space-y-3.5 border border-zinc-800/30">
          ${order.items.map((item) => `
            <div class="flex items-start gap-3">
              <div class="bg-zinc-800 text-zinc-100 font-black text-[11px] px-2 py-1 rounded-lg min-w-[34px] text-center border border-zinc-700/50">${escapeHtml(String(item.quantity))}x</div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-zinc-200 text-[15px] leading-tight tracking-tight">${escapeHtml(item.name)}</p>
                ${item.note ? `<div class="mt-1.5 inline-flex items-center bg-rose-950/20 py-1 px-2 rounded-lg border border-rose-900/20"><span class="text-[11px] text-rose-500/90 font-bold italic leading-tight uppercase tracking-tight">${escapeHtml(item.note)}</span></div>` : ""}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      ${(order.buyerName || order.contactAddress) ? `
        <div class="px-5 pb-5">
          <div class="rounded-2xl border border-zinc-800/60 bg-zinc-950/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>${escapeHtml(order.buyerName || "Gast")}</span>
            <span>${escapeHtml(order.contactAddress || formatOrderDate(order.createdAt))}</span>
          </div>
        </div>
      ` : ""}
      ${order.status !== "archiv" ? `<div class="px-5 pb-5">${renderStatusButton(order)}</div>` : ""}
    </article>
  `;
}

function renderArchiveFilters() {
  return `
    <div class="mb-6">
      <div class="flex bg-black/40 p-1 rounded-2xl border border-zinc-800/30 mb-3">
        ${["heute", "woche", "custom"].map((range) => `
          <button type="button" data-archive-range="${range}" class="relative flex-1 py-2 px-1 rounded-xl transition-all duration-200 flex items-center justify-center ${state.archiveRange === range ? "bg-zinc-800 text-white" : "text-zinc-500"}">
            <span class="text-[11px] font-bold uppercase tracking-wider">${range === "heute" ? "Heute" : (range === "woche" ? "Woche" : "Zeitraum")}</span>
          </button>
        `).join("")}
      </div>
      ${state.archiveRange === "custom" ? `
        <div class="flex items-center gap-2 bg-zinc-900/40 p-2 rounded-2xl border border-zinc-800/30">
          <label class="flex-1 flex items-center bg-zinc-800/40 rounded-xl px-3 py-2.5 border border-zinc-700/30">
            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">Von</span>
            <input id="archiveDateFrom" type="date" value="${escapeHtml(state.archiveDateFrom)}" class="bg-transparent text-zinc-300 text-xs w-full focus:outline-none [color-scheme:dark]">
          </label>
          <label class="flex-1 flex items-center bg-zinc-800/40 rounded-xl px-3 py-2.5 border border-zinc-700/30">
            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">Bis</span>
            <input id="archiveDateTo" type="date" value="${escapeHtml(state.archiveDateTo)}" class="bg-transparent text-zinc-300 text-xs w-full focus:outline-none [color-scheme:dark]">
          </label>
        </div>
      ` : ""}
    </div>
  `;
}

function renderTableSheet() {
  if (!state.selectedTable) return "";
  const orders = state.orders.filter((order) => order.tableNumber === state.selectedTable);
  return `
    <div class="fixed inset-0 z-50 overflow-hidden">
      <button type="button" data-close-table-sheet="true" class="absolute inset-0 bg-black/80 backdrop-blur-sm"></button>
      <div class="absolute inset-x-0 bottom-0 rounded-t-[2.5rem] bg-zinc-900 border-t border-zinc-800/50 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] overflow-hidden" style="max-height: calc(100dvh - 0.5rem); padding-bottom: max(env(safe-area-inset-bottom), 1rem);">
        <div class="flex flex-col min-h-[38vh]" style="max-height: calc(100dvh - 0.5rem);">
        <div class="w-full flex justify-center pt-3 pb-6 shrink-0">
          <button type="button" data-close-table-sheet="true" class="w-12 h-1 bg-zinc-800 rounded-full"></button>
        </div>
        <div class="px-8 pb-8 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-black font-black text-2xl">${escapeHtml(String(state.selectedTable))}</div>
            <div>
              <h2 class="text-2xl font-bold text-white tracking-tighter uppercase leading-none">Tisch ${escapeHtml(String(state.selectedTable))}</h2>
              <p class="text-zinc-500 text-[10px] font-bold tracking-widest uppercase mt-1">Aktuelle Uebersicht</p>
            </div>
          </div>
          <button type="button" data-close-table-sheet="true" class="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white border border-zinc-700/30">x</button>
        </div>
        <div class="px-5 pb-6 overflow-y-auto overscroll-contain no-scrollbar space-y-4 flex-1 min-h-0">
          ${orders.length ? orders.map((order) => renderOrderCard(order)).join("") : `<div class="bg-black/20 p-16 rounded-[2.5rem] text-center border border-dashed border-zinc-800"><p class="text-zinc-600 font-bold uppercase tracking-widest text-xs">Keine Bestellungen</p></div>`}
        </div>
        </div>
      </div>
    </div>
  `;
}

function renderToast() {
  if (!state.toast) return "";
  const isLeaving = state.toast.phase === "leaving";
  return `
    <div class="shrink-0 overflow-hidden transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style="width:${isLeaving ? "0px" : "min(18.5rem, calc(100vw - 8rem))"}; opacity:${isLeaving ? "0" : "1"}; will-change: width, opacity;">
      <div class="h-20 rounded-[1.6rem] border border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 py-3 shadow-2xl shadow-black/40 flex items-center justify-between gap-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isLeaving ? "-translate-x-10 opacity-0" : "translate-x-0 opacity-100"}" style="will-change: transform, opacity;">
        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-black uppercase tracking-widest text-emerald-400">Realtime</p>
          <p class="text-sm font-semibold text-zinc-100 mt-1">${escapeHtml(state.toast.message)}</p>
        </div>
        <button type="button" data-close-toast="true" class="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">x</button>
      </div>
    </div>
  `;
}

function renderNotificationBanner() {
  const showEnable = state.push.supported && state.push.permission !== "granted";
  const showActive = state.push.enabled;
  const message = state.push.error ? state.push.error : (showActive ? "Push aktiv" : (showEnable ? "Push deaktiviert" : ""));
  if (!message && !showEnable) return "";
  return `
    <div class="px-6 pb-4">
      <div class="rounded-[1.6rem] border ${state.push.error ? "border-rose-500/20 bg-rose-500/10" : "border-zinc-800 bg-zinc-950/70"} px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest ${state.push.error ? "text-rose-400" : "text-zinc-500"}">Benachrichtigungen</p>
          <p class="text-sm font-semibold text-zinc-100">${escapeHtml(message)}</p>
        </div>
        ${showEnable ? `<button id="enableNotificationsBtn" type="button" class="shrink-0 px-4 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-60" ${state.push.loading ? "disabled" : ""}>${state.push.loading ? "Aktiviert..." : "Aktivieren"}</button>` : ""}
      </div>
    </div>
  `;
}

function renderLoginView() {
  return `
    <div class="min-h-screen bg-black flex flex-col justify-center px-6 py-10">
      <div class="max-w-md mx-auto w-full">
        <div class="mb-10 text-center">
          <h1 class="text-5xl font-black tracking-tighter text-white">Mnyra</h1>
          <p class="text-[11px] font-black uppercase tracking-[0.28em] text-zinc-500 mt-4">Waiter Login</p>
        </div>
        <form id="loginForm" class="space-y-4">
          <label class="block bg-zinc-950 border border-zinc-800 rounded-[1.8rem] px-5 py-4">
            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</span>
            <input id="loginEmail" type="email" autocomplete="username" class="w-full bg-transparent text-white text-sm font-semibold outline-none mt-2" placeholder="staff@business.com">
          </label>
          <label class="block bg-zinc-950 border border-zinc-800 rounded-[1.8rem] px-5 py-4">
            <span class="text-[10px] font-black uppercase tracking-widest text-zinc-500">Passwort</span>
            <input id="loginPassword" type="password" autocomplete="current-password" class="w-full bg-transparent text-white text-sm font-semibold outline-none mt-2" placeholder="Passwort">
          </label>
          ${state.loginError ? `<div class="text-center text-[10px] font-black uppercase tracking-widest text-rose-400">${escapeHtml(state.loginError)}</div>` : ""}
          <button type="submit" class="w-full bg-white text-black font-black text-[12px] uppercase tracking-[0.18em] py-5 rounded-[1.8rem] shadow-2xl shadow-black/30 disabled:opacity-60" ${state.authLoading ? "disabled" : ""}>${state.authLoading ? "Login..." : "Einloggen"}</button>
        </form>
      </div>
    </div>
  `;
}

function renderNoAccessView() {
  return `
    <div class="min-h-screen flex flex-col justify-center px-6 py-10">
      <div class="max-w-md mx-auto w-full bg-zinc-950/80 border border-zinc-800 rounded-[2.5rem] p-8 text-center">
        <div class="w-20 h-20 rounded-[2rem] bg-zinc-900 mx-auto mb-6 flex items-center justify-center text-3xl">!</div>
        <h1 class="text-2xl font-black tracking-tighter text-white">Kein Zugriff</h1>
        <p class="text-sm font-semibold text-zinc-500 mt-4">${escapeHtml(state.sessionError || "Dieser Account darf die Waiter App nicht benutzen.")}</p>
        <button id="accessLogoutBtn" type="button" class="mt-8 w-full py-4 rounded-[1.6rem] bg-white text-black text-[10px] font-black uppercase tracking-[0.18em]">Abmelden</button>
      </div>
    </div>
  `;
}

function renderWaiterView() {
  const filteredOrders = getOrdersForTab();
  const tableIds = getTableIds();
  const activeTableIds = getActiveTableIdSet();
  const tailStyle = getWaiterSurfaceTailStyle();
  const headerTopStyle = useStandaloneWaiterSurface()
    ? "padding-top: calc(env(safe-area-inset-top) + 3.25rem);"
    : "padding-top: calc(env(safe-area-inset-top) + 2.5rem);";
  const countByStatus = {
    bestellung: getOrdersForTab("bestellung").length,
    angenommen: getOrdersForTab("angenommen").length,
    fertig: getOrdersForTab("fertig").length
  };
  return `
    <div class="min-h-screen bg-black font-sans flex flex-col selection:bg-zinc-800 antialiased">
      <header class="shrink-0 z-10 flex flex-col bg-black" style="${headerTopStyle}">
        <div class="px-6 mb-6 flex justify-between items-start gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <img src="${escapeHtml(state.access.businessAvatar || "/apps/waiter/assets/logo-square.png")}" alt="${escapeHtml(state.access.businessName)}" class="w-11 h-11 rounded-xl object-contain shrink-0 bg-zinc-950 border border-zinc-800 p-1">
            <div class="min-w-0">
              <h1 class="text-[18px] font-bold text-white tracking-tight leading-none truncate">${escapeHtml(state.access.businessName || "Business")}</h1>
              <div class="flex items-center mt-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span><h2 class="text-[10px] text-zinc-400 font-bold leading-none tracking-widest uppercase truncate">${escapeHtml(`${state.access.displayName} · ${state.access.roleLabel}`)}</h2></div>
            </div>
          </div>
          <button id="logoutBtn" type="button" class="shrink-0 h-11 px-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 text-[10px] font-black uppercase tracking-widest text-zinc-400">Logout</button>
        </div>
        ${renderNotificationBanner()}
        <div class="px-6 pb-8 overflow-hidden">
          <div class="flex items-stretch gap-3">
            ${renderToast()}
            <div class="min-w-0 flex-1 transition-[transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
              <div class="flex space-x-3 overflow-x-auto no-scrollbar">
                ${tableIds.length ? tableIds.map((tableId) => {
                  const isSelected = state.selectedTable === tableId;
                  const isActive = activeTableIds.has(tableId);
                  const cardTone = isSelected
                    ? "bg-white border-white"
                    : (isActive ? "bg-zinc-900 border-zinc-800/30" : "bg-zinc-950 border-zinc-800/30");
                  const textTone = isSelected
                    ? "text-black opacity-20"
                    : (isActive ? "text-zinc-100 opacity-10" : "text-zinc-800 opacity-40");
                  const statusTone = isSelected
                    ? "bg-black/10"
                    : (isActive ? "bg-emerald-500/80" : "bg-zinc-700/80");
                  return `<button type="button" data-table="${escapeHtml(String(tableId))}" class="group relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300 ${cardTone}"><div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none ${textTone}"><span class="text-[4rem] font-black tracking-tighter leading-none mt-1">T${escapeHtml(String(tableId))}</span></div><div class="absolute left-3 bottom-3 w-2 h-2 rounded-full ${statusTone}"></div></button>`;
                }).join("") : `<div class="w-full rounded-[2rem] border border-zinc-800 bg-zinc-950/70 px-5 py-4 text-sm font-semibold text-zinc-500">Noch keine Tische vorhanden.</div>`}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main class="bg-zinc-900 flex-1 rounded-t-[2.5rem] relative border-t border-zinc-800/50">
        <div class="w-full flex justify-center pt-3 pb-1 shrink-0 absolute top-0 z-20"><div class="w-10 h-1 bg-zinc-800 rounded-full opacity-50"></div></div>
        <div class="px-5 pt-10 pb-[max(env(safe-area-inset-bottom),6rem)] max-w-2xl mx-auto w-full">
          <div class="flex items-center gap-2 mb-6">
            <nav class="flex-1 flex bg-black/40 p-1 rounded-2xl border border-zinc-800/30">
              ${["bestellung", "angenommen", "fertig"].map((tab) => `<button type="button" data-tab="${tab}" class="relative flex-1 py-3 px-1 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${state.activeTab === tab ? "bg-zinc-800 text-white" : "text-zinc-500"}"><span class="text-[11px] font-bold uppercase tracking-wider">${escapeHtml(statusLabels[tab])}</span>${countByStatus[tab] > 0 ? `<span class="text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center ${state.activeTab === tab ? "bg-white text-black" : "bg-zinc-900 text-zinc-600"}">${escapeHtml(String(countByStatus[tab]))}</span>` : ""}</button>`).join("")}
            </nav>
            <button type="button" data-tab="archiv" class="w-12 h-12 flex items-center justify-center rounded-2xl transition-all border ${state.activeTab === "archiv" ? "bg-white border-white text-black" : "bg-black/40 border-zinc-800/30 text-zinc-500 hover:text-white"}">Ark</button>
          </div>
          ${state.activeTab === "archiv" ? renderArchiveFilters() : ""}
          ${state.sessionError ? `<div class="mb-6 text-center text-[10px] font-black uppercase tracking-widest text-rose-400">${escapeHtml(state.sessionError)}</div>` : ""}
          ${!state.ordersLoaded ? `<div class="text-center py-24 flex flex-col items-center opacity-70"><div class="w-12 h-12 rounded-2xl border-2 border-zinc-700 border-t-white animate-spin mb-4"></div><p class="text-sm font-bold text-zinc-500 uppercase tracking-widest">Bestellungen laden</p></div>` : (filteredOrders.length ? `<div class="space-y-4">${filteredOrders.map((order) => renderOrderCard(order)).join("")}</div>` : `<div class="text-center py-24 flex flex-col items-center opacity-30"><div class="w-14 h-14 rounded-[1.8rem] bg-zinc-800/60 flex items-center justify-center text-zinc-500 text-2xl mb-4">V</div><p class="text-sm font-bold text-zinc-500 uppercase tracking-widest">Alles erledigt</p></div>`)}
        </div>
      </main>
      <div aria-hidden="true" style="${tailStyle}"></div>
      ${renderTableSheet()}
    </div>
  `;
}

function renderLoadingView() {
  return `<div class="min-h-screen bg-black flex items-center justify-center px-6"><div class="text-center"><div class="w-12 h-12 rounded-2xl border-2 border-zinc-700 border-t-white animate-spin mx-auto mb-4"></div><p class="text-[10px] font-black uppercase tracking-widest text-zinc-500">Session wird geladen</p></div></div>`;
}

function render() {
  syncPageSurface();
  if (!state.authReady) {
    APP_ROOT.innerHTML = renderLoadingView();
    return;
  }
  if (!state.user) {
    APP_ROOT.innerHTML = renderLoginView();
    return;
  }
  if (state.sessionLoading && !state.access.allowed) {
    APP_ROOT.innerHTML = renderLoadingView();
    return;
  }
  if (!state.access.allowed) {
    APP_ROOT.innerHTML = renderNoAccessView();
    return;
  }
  APP_ROOT.innerHTML = renderWaiterView();
}

async function updateOrderStatus(orderId, nextStatus) {
  const restaurantId = asText(state.access.restaurantId);
  const id = asText(orderId);
  if (!restaurantId || !id || !nextStatus) return;
  state.savingOrderIds.add(id);
  render();
  try {
    await updateDoc(doc(db, "restaurants", restaurantId, "orders", id), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
      updatedAtClient: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    showToast(err?.message || "Status konnte nicht aktualisiert werden.");
  } finally {
    state.savingOrderIds.delete(id);
    render();
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  void primeAlertTone();
  const email = asText(document.getElementById("loginEmail")?.value);
  const password = document.getElementById("loginPassword")?.value || "";
  if (!email || !password) {
    state.loginError = "Bitte Email und Passwort eingeben.";
    render();
    return;
  }
  state.authLoading = true;
  state.loginError = "";
  render();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    state.loginError = err?.message || "Login fehlgeschlagen.";
  } finally {
    if (!auth.currentUser && !state.user) {
      state.authLoading = false;
    }
    render();
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error(err);
  }
}

APP_ROOT.addEventListener("submit", (event) => {
  const form = event.target;
  if (form instanceof HTMLFormElement && form.id === "loginForm") {
    void handleLoginSubmit(event);
  }
});

APP_ROOT.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest("#logoutBtn, #accessLogoutBtn")) {
    void handleLogout();
    return;
  }
  const tabBtn = target.closest("[data-tab]");
  if (tabBtn) {
    state.activeTab = asText(tabBtn.getAttribute("data-tab")) || "bestellung";
    render();
    return;
  }
  const tableBtn = target.closest("[data-table]");
  if (tableBtn) {
    const value = Number(tableBtn.getAttribute("data-table"));
    state.selectedTable = Number.isFinite(value) ? value : null;
    render();
    return;
  }
  if (target.closest("[data-close-table-sheet]")) {
    state.selectedTable = null;
    render();
    return;
  }
  const archiveBtn = target.closest("[data-archive-range]");
  if (archiveBtn) {
    state.archiveRange = asText(archiveBtn.getAttribute("data-archive-range")) || "heute";
    render();
    return;
  }
  const orderBtn = target.closest("[data-order-action]");
  if (orderBtn) {
    void updateOrderStatus(asText(orderBtn.getAttribute("data-order-id")), asText(orderBtn.getAttribute("data-order-action")));
    return;
  }
  if (target.closest("#enableNotificationsBtn")) {
    void syncPushDeviceToken({ requestPermission: true });
    return;
  }
  if (target.closest("[data-close-toast]")) {
    dismissToast();
  }
});

APP_ROOT.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.id === "archiveDateFrom") {
    state.archiveDateFrom = target.value || "";
    render();
  }
  if (target.id === "archiveDateTo") {
    state.archiveDateTo = target.value || "";
    render();
  }
});

async function bootstrap() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {}
  bindAlertToneUnlock();
  void ensureServiceWorkerRegistration();
  onAuthStateChanged(auth, (user) => {
    void handleAuthChanged(user);
  });
}

render();
void bootstrap();
