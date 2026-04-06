import {
  normalizeOrderItemCore,
  normalizeOrderDocCore
} from "./order-normalize-utils.js";
import { normalizeRestaurantTypeCore } from "../profile/restaurant-type-utils.js";

export function createOrdersRuntimeController({
  state = null,
  db = null,
  collectionFn = null,
  docFn = null,
  getDocFn = null,
  queryFn = null,
  orderByFn = null,
  limitFn = null,
  onSnapshotFn = null,
  writeBatchFn = null,
  serverTimestampFn = () => null,
  normalizeShopCartStateFn = (raw) => raw || {},
  isLocalBusinessProfileFn = () => false,
  canAccessRestaurantOrdersFn = () => false,
  resolveProfileRestaurantIdFn = () => "",
  getRestaurantMetaByIdFn = () => null,
  normalizeHandleFn = (value = "") => String(value || ""),
  buildShopVariantKeyFn = () => "",
  clampCropPercentFn = (value, fallback = 50) => fallback,
  parsePriceValueFn = () => 0,
  saveShopCartToStorageFn = () => {},
  clearShopCartFn = () => {},
  renderFn = () => {},
  getLastRenderModeFn = () => "",
  safeStorageObj = null,
  guestScopeUid = "",
  resolveGuestScopeUidFn = null,
  legacyGuestScopeUid = "guest"
} = {}) {
  const collection = typeof collectionFn === "function" ? collectionFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const getDoc = typeof getDocFn === "function" ? getDocFn : null;
  const query = typeof queryFn === "function" ? queryFn : null;
  const orderBy = typeof orderByFn === "function" ? orderByFn : null;
  const limit = typeof limitFn === "function" ? limitFn : null;
  const onSnapshot = typeof onSnapshotFn === "function" ? onSnapshotFn : null;
  const writeBatch = typeof writeBatchFn === "function" ? writeBatchFn : null;
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const normalizeShopCartState = typeof normalizeShopCartStateFn === "function"
    ? normalizeShopCartStateFn
    : ((raw) => raw || {});
  const isLocalBusinessProfile = typeof isLocalBusinessProfileFn === "function"
    ? isLocalBusinessProfileFn
    : (() => false);
  const canAccessRestaurantOrders = typeof canAccessRestaurantOrdersFn === "function"
    ? canAccessRestaurantOrdersFn
    : (() => false);
  const resolveProfileRestaurantId = typeof resolveProfileRestaurantIdFn === "function"
    ? resolveProfileRestaurantIdFn
    : ((profile = null) => String(profile?.restaurantId || "").trim());
  const getRestaurantMetaById = typeof getRestaurantMetaByIdFn === "function"
    ? getRestaurantMetaByIdFn
    : (() => null);
  const normalizeHandle = typeof normalizeHandleFn === "function"
    ? normalizeHandleFn
    : ((value = "") => String(value || ""));
  const buildShopVariantKey = typeof buildShopVariantKeyFn === "function"
    ? buildShopVariantKeyFn
    : (() => "");
  const clampCropPercent = typeof clampCropPercentFn === "function"
    ? clampCropPercentFn
    : ((value, fallback = 50) => fallback);
  const parsePriceValue = typeof parsePriceValueFn === "function"
    ? parsePriceValueFn
    : (() => 0);
  const saveShopCartToStorage = typeof saveShopCartToStorageFn === "function"
    ? saveShopCartToStorageFn
    : (() => {});
  const clearShopCart = typeof clearShopCartFn === "function"
    ? clearShopCartFn
    : (() => {});
  const getLastRenderMode = typeof getLastRenderModeFn === "function"
    ? getLastRenderModeFn
    : (() => "");
  const resolveGuestScopeUid = typeof resolveGuestScopeUidFn === "function"
    ? (() => String(resolveGuestScopeUidFn() || guestScopeUid || "").trim())
    : (() => String(guestScopeUid || "").trim());
  const legacyGuestScope = String(legacyGuestScopeUid || "guest").trim() || "guest";
  const safeStorage = safeStorageObj && typeof safeStorageObj.getItem === "function" && typeof safeStorageObj.setItem === "function"
    ? safeStorageObj
    : (typeof globalThis !== "undefined" && globalThis.localStorage
      ? globalThis.localStorage
      : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      });
  const GUEST_ORDER_SESSION_KEY = "menyra_orders_guest_session_v1";
  const GUEST_ORDER_LOOKUP_INDEX_KEY = "menyra_orders_guest_lookup_index_v1";
  const LEGACY_GUEST_ORDER_STORAGE_KEYS = Object.freeze([
    GUEST_ORDER_SESSION_KEY,
    GUEST_ORDER_LOOKUP_INDEX_KEY
  ]);
  const GUEST_ORDER_LOOKUP_INDEX_LIMIT = 24;
  let ordersUnsub = null;
  let ordersListenerKey = "";
  let guestRecoveryLoadSeq = 0;
  let checkoutSubmitInFlight = false;

  function isTransientCheckoutError(err = null) {
    const code = String(err?.code || err?.name || "").trim().toLowerCase();
    const message = String(err?.message || "").trim().toLowerCase();
    const markers = [
      "unavailable",
      "deadline-exceeded",
      "cancelled",
      "aborted",
      "resource-exhausted",
      "internal",
      "network",
      "offline",
      "socket",
      "timeout"
    ];
    return markers.some((marker) => code.includes(marker) || message.includes(marker));
  }

  async function commitBatchWithBackoff(buildBatch, {
    attempts = 3,
    baseDelayMs = 220
  } = {}) {
    const createBatch = typeof buildBatch === "function" ? buildBatch : null;
    if (!createBatch) return;
    const totalAttempts = Math.max(1, Math.round(Number(attempts) || 1));
    let lastError = null;
    for (let attempt = 0; attempt < totalAttempts; attempt += 1) {
      try {
        const batch = createBatch();
        await batch.commit();
        return;
      } catch (err) {
        lastError = err;
        if (attempt >= totalAttempts - 1 || !isTransientCheckoutError(err)) {
          throw err;
        }
        const baseDelay = Math.max(100, Number(baseDelayMs) || 100);
        const delay = Math.round(baseDelay * (attempt + 1) * (0.65 + Math.random() * 0.35));
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError || new Error("checkout-commit-retry-failed");
  }

  function resolveActiveGuestScopeUid() {
    return String(resolveGuestScopeUid() || guestScopeUid || "").trim();
  }

  function buildGuestScopedStorageKey(baseKey, currentGuestScopeUid = resolveActiveGuestScopeUid()) {
    const safeBaseKey = String(baseKey || "").trim();
    const safeGuestScopeUid = String(currentGuestScopeUid || "").trim();
    if (!safeBaseKey || !safeGuestScopeUid) return "";
    return `${safeBaseKey}::${safeGuestScopeUid}`;
  }

  function pruneLegacyGlobalGuestOrderStorage(currentGuestScopeUid = resolveActiveGuestScopeUid()) {
    const safeGuestScopeUid = String(currentGuestScopeUid || "").trim();
    if (!safeGuestScopeUid || safeGuestScopeUid === legacyGuestScope) return;
    LEGACY_GUEST_ORDER_STORAGE_KEYS.forEach((baseKey) => {
      const safeBaseKey = String(baseKey || "").trim();
      if (!safeBaseKey) return;
      safeStorage.removeItem(safeBaseKey);
      safeStorage.removeItem(`${safeBaseKey}::${legacyGuestScope}`);
    });
  }

  function readJsonFromStorage(key, fallback = null) {
    const safeKey = String(key || "").trim();
    if (!safeKey) return fallback;
    try {
      const raw = safeStorage.getItem(safeKey);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeJsonToStorage(key, value) {
    const safeKey = String(key || "").trim();
    if (!safeKey) return;
    try {
      safeStorage.setItem(safeKey, JSON.stringify(value));
    } catch {}
  }

  function createOpaqueOrderToken(prefix = "tok") {
    const tokenPrefix = String(prefix || "tok").trim().toLowerCase() || "tok";
    const randomPart = (() => {
      try {
        if (globalThis?.crypto?.getRandomValues) {
          const bytes = new Uint8Array(12);
          globalThis.crypto.getRandomValues(bytes);
          return Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");
        }
      } catch {}
      return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
    })();
    return `${tokenPrefix}_${randomPart}`;
  }

  function ensureGuestOrderSessionId(currentGuestScopeUid = resolveActiveGuestScopeUid()) {
    const scopedSessionKey = buildGuestScopedStorageKey(GUEST_ORDER_SESSION_KEY, currentGuestScopeUid);
    if (!scopedSessionKey) return "";
    pruneLegacyGlobalGuestOrderStorage(currentGuestScopeUid);
    const existing = String(readJsonFromStorage(scopedSessionKey, "") || "").trim();
    if (existing) return existing;
    const next = createOpaqueOrderToken("guest");
    writeJsonToStorage(scopedSessionKey, next);
    return next;
  }

  function normalizeGuestLookupEntry(entry = {}) {
    const restaurantId = String(entry.restaurantId || "").trim();
    const orderId = String(entry.orderId || "").trim();
    const lookupToken = String(entry.lookupToken || "").trim();
    const createdAt = Math.max(0, Number(entry.createdAt || 0) || 0);
    if (!restaurantId || !orderId || !lookupToken) return null;
    return {
      restaurantId,
      orderId,
      lookupToken,
      createdAt: createdAt || Date.now()
    };
  }

  function readGuestLookupEntries(currentGuestScopeUid = resolveActiveGuestScopeUid()) {
    const scopedLookupIndexKey = buildGuestScopedStorageKey(GUEST_ORDER_LOOKUP_INDEX_KEY, currentGuestScopeUid);
    if (!scopedLookupIndexKey) return [];
    pruneLegacyGlobalGuestOrderStorage(currentGuestScopeUid);
    const parsed = readJsonFromStorage(scopedLookupIndexKey, []);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => normalizeGuestLookupEntry(entry))
      .filter(Boolean)
      .sort((a, b) => (Number(b.createdAt || 0) || 0) - (Number(a.createdAt || 0) || 0))
      .slice(0, GUEST_ORDER_LOOKUP_INDEX_LIMIT);
  }

  function writeGuestLookupEntries(entries = [], currentGuestScopeUid = resolveActiveGuestScopeUid()) {
    const scopedLookupIndexKey = buildGuestScopedStorageKey(GUEST_ORDER_LOOKUP_INDEX_KEY, currentGuestScopeUid);
    if (!scopedLookupIndexKey) return [];
    pruneLegacyGlobalGuestOrderStorage(currentGuestScopeUid);
    const normalized = (Array.isArray(entries) ? entries : [])
      .map((entry) => normalizeGuestLookupEntry(entry))
      .filter(Boolean)
      .sort((a, b) => (Number(b.createdAt || 0) || 0) - (Number(a.createdAt || 0) || 0))
      .slice(0, GUEST_ORDER_LOOKUP_INDEX_LIMIT);
    writeJsonToStorage(scopedLookupIndexKey, normalized);
    return normalized;
  }

  function rememberGuestLookupEntry(entry = {}, currentGuestScopeUid = resolveActiveGuestScopeUid()) {
    const normalized = normalizeGuestLookupEntry(entry);
    if (!normalized) return;
    const existing = readGuestLookupEntries(currentGuestScopeUid);
    const deduped = existing.filter((row) => (
      !(row.lookupToken === normalized.lookupToken && row.restaurantId === normalized.restaurantId)
    ));
    writeGuestLookupEntries([normalized, ...deduped], currentGuestScopeUid);
  }

  async function loadGuestRecoveredOrdersFromLookup(currentGuestScopeUid = resolveActiveGuestScopeUid()) {
    const safeGuestScopeUid = String(currentGuestScopeUid || "").trim();
    if (!safeGuestScopeUid) return [];
    const entries = readGuestLookupEntries(safeGuestScopeUid);
    if (!entries.length || !makeDocRef || !getDoc || !db) {
      return [];
    }
    const settled = await Promise.allSettled(entries.map(async (entry) => {
      const snap = await getDoc(makeDocRef(db, "restaurants", entry.restaurantId, "orderLookup", entry.lookupToken));
      if (!snap?.exists?.()) return null;
      const data = snap.data() || {};
      return normalizeOrderDoc(data, data.id || entry.orderId);
    }));
    const items = settled
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .filter((entry) => entry && entry.id && entry.restaurantId);
    items.sort((a, b) => {
      const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime() || 0;
      const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime() || 0;
      return bTime - aTime;
    });
    return items;
  }

  async function syncGuestRecoveredOrders({
    loading = true,
    guestScopeUidOverride = resolveActiveGuestScopeUid()
  } = {}) {
    const safeGuestScopeUid = String(guestScopeUidOverride || "").trim();
    const requestSeq = ++guestRecoveryLoadSeq;
    if (state) {
      state.orders = {
        ...state.orders,
        loading: loading === true,
        error: loading === true ? "" : state.orders?.error || ""
      };
    }
    renderOrdersTabIfActive();
    try {
      if (!safeGuestScopeUid) {
        if (requestSeq !== guestRecoveryLoadSeq) return;
        if (state) {
          state.orders = {
            ...state.orders,
            items: [],
            loading: false,
            error: ""
          };
        }
        renderOrdersTabIfVisible();
        return;
      }
      const items = await loadGuestRecoveredOrdersFromLookup(safeGuestScopeUid);
      if (requestSeq !== guestRecoveryLoadSeq) return;
      if (state) {
        state.orders = {
          ...state.orders,
          items,
          loading: false,
          error: ""
        };
      }
      renderOrdersTabIfVisible();
    } catch (err) {
      console.error(err);
      if (requestSeq !== guestRecoveryLoadSeq) return;
      if (state) {
        state.orders = {
          ...state.orders,
          loading: false,
          error: "Bestellungen konnten nicht wiederhergestellt werden."
        };
      }
      renderOrdersTabIfVisible();
    }
  }

  function normalizeOrderItem(item) {
    return normalizeOrderItemCore(item, {
      buildShopVariantKeyFn: buildShopVariantKey,
      clampCropPercentFn: clampCropPercent
    });
  }

  function normalizeOrderDoc(data, id) {
    return normalizeOrderDocCore(data, id, {
      normalizeOrderItemFn: normalizeOrderItem,
      parsePriceValueFn: parsePriceValue
    });
  }

  function resolveCartBusinessType(cart = {}) {
    const restaurantId = String(cart?.restaurantId || "").trim();
    const restaurant = restaurantId ? (getRestaurantMetaById(restaurantId) || {}) : {};
    return normalizeRestaurantTypeCore(
      restaurant?.type
      || restaurant?.customerType
      || cart?.businessType
      || state?.profileView?.profile?.type
      || state?.profileView?.profile?.customerType
      || ""
    );
  }

  function renderOrdersTabIfActive() {
    if (state?.activeTab === "orders") {
      renderFn();
    }
  }

  function renderOrdersTabIfVisible() {
    if (state?.activeTab === "orders" && getLastRenderMode() === "main") {
      renderFn();
    }
  }

  function stopOrdersListener() {
    guestRecoveryLoadSeq += 1;
    if (ordersUnsub) {
      ordersUnsub();
      ordersUnsub = null;
    }
    ordersListenerKey = "";
  }

  function startOrdersListener(user = state?.user) {
    const uid = String(user?.uid || "").trim();
    if (!uid) {
      const currentGuestScopeUid = resolveActiveGuestScopeUid();
      stopOrdersListener();
      ordersListenerKey = currentGuestScopeUid ? `guest:${currentGuestScopeUid}` : "guest:none";
      void syncGuestRecoveredOrders({ loading: true, guestScopeUidOverride: currentGuestScopeUid });
      return;
    }
    if (!collection || !query || !orderBy || !limit || !onSnapshot || !db) return;
    const restaurantId = resolveProfileRestaurantId(state?.userProfile);
    const isBusiness = canAccessRestaurantOrders(state?.userProfile) && !!restaurantId;
    const nextListenerKey = isBusiness ? `restaurant:${restaurantId}` : `user:${uid}`;
    if (!nextListenerKey || (ordersUnsub && ordersListenerKey === nextListenerKey)) return;

    stopOrdersListener();
    const pathRef = isBusiness
      ? collection(db, "restaurants", restaurantId, "orders")
      : collection(db, "users", uid, "orders");
    const listenerPath = isBusiness
      ? `restaurants/${restaurantId}/orders`
      : `users/${uid}/orders`;
    ordersListenerKey = nextListenerKey;
    if (state) {
      state.orders = { ...state.orders, loading: true, error: "" };
    }
    renderOrdersTabIfActive();
    ordersUnsub = onSnapshot(query(pathRef, orderBy("createdAt", "desc"), limit(60)), (snap) => {
      const items = snap.docs.map((docSnap) => normalizeOrderDoc(docSnap.data() || {}, docSnap.id));
      if (state) {
        state.orders = { ...state.orders, items, loading: false, error: "" };
      }
      renderOrdersTabIfVisible();
    }, (err) => {
      console.error(`[mnyra][firestore.listen.orders] ${listenerPath}`, err);
      ordersUnsub = null;
      ordersListenerKey = "";
      if (state) {
        state.orders = {
          ...state.orders,
          loading: false,
          error: "Bestellungen konnten nicht geladen werden."
        };
      }
      renderOrdersTabIfVisible();
    });
  }

  function getShopCartTotal(items = []) {
    return (Array.isArray(items) ? items : []).reduce((sum, item) => {
      return sum + (parsePriceValue(item?.price) * Math.max(1, Number(item?.quantity || 1) || 1));
    }, 0);
  }

  async function submitShopCheckout() {
    const cart = normalizeShopCartState(state?.shopCart);
    if (checkoutSubmitInFlight || cart.loading || !cart.restaurantId || !cart.items.length) return;
    if (!collection || !makeDocRef || !writeBatch || !db) return;

    const hasUser = !!String(state?.user?.uid || "").trim();
    const currentGuestScopeUid = hasUser ? "" : resolveActiveGuestScopeUid();
    if (!hasUser && !currentGuestScopeUid) {
      if (state) {
        state.shopCart = {
          ...cart,
          loading: false,
          checkoutOpen: true,
          status: "Guest-Session konnte nicht initialisiert werden."
        };
      }
      renderFn();
      return;
    }
    const guestSessionId = hasUser ? "" : ensureGuestOrderSessionId(currentGuestScopeUid);
    if (!hasUser && !guestSessionId) {
      if (state) {
        state.shopCart = {
          ...cart,
          loading: false,
          checkoutOpen: true,
          status: "Guest-Session konnte nicht initialisiert werden."
        };
      }
      renderFn();
      return;
    }
    const guestLookupToken = hasUser ? "" : createOpaqueOrderToken("order");
    const tableNumber = Math.max(0, Number(cart.tableNumber || cart.form?.tableNumber || 0) || 0);
    const isTableService = String(cart.serviceMode || "").trim().toLowerCase() === "table" && tableNumber > 0;
    const isHospitalityOrder = ["restaurant", "cafe", "fastfood"].includes(resolveCartBusinessType(cart));
    const contact = {
      name: String(cart.form?.name || "").trim(),
      phone: String(cart.form?.phone || "").trim(),
      city: String(cart.form?.city || "").trim(),
      address: String(cart.form?.address || "").trim(),
      tableNumber,
      tableLabel: tableNumber ? `Tisch ${tableNumber}` : ""
    };
    const missingRequired = isTableService
      ? false
      : (isHospitalityOrder ? false : (!contact.name || !contact.phone || !contact.city || !contact.address));
    if (missingRequired) {
      if (state) {
        state.shopCart = {
          ...cart,
          status: isTableService
            ? "Bestellung wird vorbereitet."
            : "Bitte Name, Tel, Qyteti und Adresse eingeben."
        };
      }
      saveShopCartToStorage();
      renderFn();
      return;
    }

    const restaurant = getRestaurantMetaById(cart.restaurantId) || {};
    const businessAvatar = cart.businessAvatar || restaurant.logoUrl || restaurant.logo || "";
    const orderRef = makeDocRef(collection(db, "restaurants", cart.restaurantId, "orders"));
    const orderId = orderRef.id;
    const nowIso = new Date().toISOString();
    const buyerHandle = hasUser
      ? String(
        state?.userProfile?.handle
        || normalizeHandle(state?.userProfile?.name || state?.user?.displayName || "user")
      ).replace(/^@/, "").trim()
      : "guest";
    const payload = {
      id: orderId,
      restaurantId: cart.restaurantId,
      businessName: cart.businessName || restaurant.name || restaurant.restaurantName || "Shop",
      businessAvatar,
      buyerUid: hasUser ? String(state?.user?.uid || "").trim() : "",
      buyerName: hasUser
        ? (state?.userProfile?.name || state?.user?.displayName || contact.name || "User")
        : (contact.name || "Gast"),
      buyerHandle,
      buyerAvatar: hasUser ? (state?.userProfile?.avatar || "") : "",
      contact,
      tableNumber,
      tableLabel: tableNumber ? `Tisch ${tableNumber}` : "",
      items: cart.items.map((item) => ({
        id: item.id,
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        category: item.category,
        cartKey: item.cartKey || buildShopVariantKey(item.itemId || item.id || "", {
          size: item.selectedSize || "",
          color: item.selectedColor || ""
        }),
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || "",
        cropX: clampCropPercent(item.cropX ?? 50, 50),
        cropY: clampCropPercent(item.cropY ?? 50, 50)
      })),
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: getShopCartTotal(cart.items),
      status: "Neu",
      orderSource: "canonical",
      guestScopeUid: hasUser ? "" : currentGuestScopeUid,
      guestSessionId,
      guestLookupToken,
      orderLookupToken: guestLookupToken,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAtClient: nowIso,
      updatedAtClient: nowIso
    };

    if (state) {
      state.shopCart = { ...cart, loading: true, status: "Bestellung wird gesendet..." };
    }
    checkoutSubmitInFlight = true;
    renderFn();
    try {
      await commitBatchWithBackoff(() => {
        const batch = writeBatch(db);
        batch.set(orderRef, payload, { merge: true });
        return batch;
      }, {
        attempts: 3,
        baseDelayMs: 260
      });
      if (!hasUser && state) {
        rememberGuestLookupEntry({
          restaurantId: cart.restaurantId,
          orderId,
          lookupToken: guestLookupToken,
          createdAt: Date.now()
        }, currentGuestScopeUid);
        const guestOrder = normalizeOrderDoc(payload, orderId);
        state.orders = {
          ...state.orders,
          loading: false,
          error: "",
          items: [guestOrder, ...(Array.isArray(state.orders?.items) ? state.orders.items : [])]
        };
        void syncGuestRecoveredOrders({ loading: false, guestScopeUidOverride: currentGuestScopeUid });
      }
      const showHospitalityConfirmation = isTableService || isHospitalityOrder;
      clearShopCart({ keepForm: true });
      if (state) {
        if (showHospitalityConfirmation) {
          state.shopCart = {
            ...state.shopCart,
            restaurantId: cart.restaurantId,
            businessName: cart.businessName || restaurant.name || restaurant.restaurantName || "Shop",
            businessAvatar,
            status: "",
            loading: false,
            checkoutOpen: false,
            confirmation: {
              restaurantId: cart.restaurantId,
              title: tableNumber ? `Tisch ${tableNumber}` : (cart.businessName || restaurant.name || restaurant.restaurantName || "Bestellung"),
              message: "Ihre Bestellung wird zubereitet und in Kuerze serviert.",
              tableNumber,
              createdAt: Date.now()
            }
          };
        } else {
          state.activeTab = "orders";
          state.drawerOpen = false;
        }
      }
      renderFn();
    } catch (err) {
      console.error(err);
      if (state) {
        state.shopCart = {
          ...cart,
          loading: false,
          checkoutOpen: true,
          status: "Bestellung konnte nicht gesendet werden."
        };
      }
      saveShopCartToStorage();
      renderFn();
    } finally {
      checkoutSubmitInFlight = false;
    }
  }

  return {
    stopOrdersListener,
    startOrdersListener,
    submitShopCheckout
  };
}
