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
  queryFn = null,
  orderByFn = null,
  limitFn = null,
  onSnapshotFn = null,
  writeBatchFn = null,
  runTransactionFn = null,
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
  getLastRenderModeFn = () => ""
} = {}) {
  const collection = typeof collectionFn === "function" ? collectionFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const query = typeof queryFn === "function" ? queryFn : null;
  const orderBy = typeof orderByFn === "function" ? orderByFn : null;
  const limit = typeof limitFn === "function" ? limitFn : null;
  const onSnapshot = typeof onSnapshotFn === "function" ? onSnapshotFn : null;
  const writeBatch = typeof writeBatchFn === "function" ? writeBatchFn : null;
  const runTransaction = typeof runTransactionFn === "function" ? runTransactionFn : null;
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
  let ordersUnsub = null;
  let ordersListenerKey = "";
  let activeCheckoutSubmitPromise = null;
  let activeCheckoutSubmitAttemptId = "";

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
    if (ordersUnsub) {
      ordersUnsub();
      ordersUnsub = null;
    }
    ordersListenerKey = "";
  }

  function startOrdersListener(user = state?.user) {
    const uid = String(user?.uid || "").trim();
    if (!uid) {
      stopOrdersListener();
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

  function setShopCartState(nextCart, { persist = true, render = true } = {}) {
    if (!state) return;
    state.shopCart = nextCart;
    if (persist) saveShopCartToStorage();
    if (render) renderFn();
  }

  function buildCheckoutAttemptFingerprint(cart = {}, {
    buyerUid = "",
    serviceMode = "",
    tableNumber = 0,
    contact = {}
  } = {}) {
    const itemRows = (Array.isArray(cart?.items) ? cart.items : [])
      .map((item) => [
        String(item?.restaurantId || cart?.restaurantId || "").trim(),
        String(item?.cartKey || item?.itemId || item?.id || "").trim(),
        Math.max(1, Number(item?.quantity || 1) || 1),
        String(item?.price ?? "").trim()
      ].join(":"))
      .sort();
    return JSON.stringify({
      restaurantId: String(cart?.restaurantId || "").trim(),
      serviceMode: String(serviceMode || cart?.serviceMode || "").trim().toLowerCase(),
      tableNumber: Math.max(0, Number(tableNumber || cart?.tableNumber || cart?.form?.tableNumber || 0) || 0),
      buyerUid: String(buyerUid || "").trim(),
      name: String(contact?.name || "").trim(),
      phone: String(contact?.phone || "").trim(),
      city: String(contact?.city || "").trim(),
      address: String(contact?.address || "").trim(),
      items: itemRows
    });
  }

  function buildCheckoutAttemptId(restaurantId = "") {
    const safeRestaurantId = String(restaurantId || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || "shop";
    const randomPart = Math.random().toString(36).slice(2, 8) || "submit";
    return `ord_${safeRestaurantId}_${Date.now().toString(36)}_${randomPart}`;
  }

  function validateCheckoutCartContext(cart = {}) {
    const restaurantId = String(cart?.restaurantId || "").trim();
    if (!restaurantId) {
      return { ok: false, message: "Checkout-Kontext ist ungueltig. Bitte Warenkorb neu oeffnen." };
    }
    const items = Array.isArray(cart?.items) ? cart.items : [];
    if (!items.length) {
      return { ok: false, message: "Der Warenkorb ist leer." };
    }
    const invalidItem = items.find((item) => {
      const quantity = Math.max(0, Number(item?.quantity || 0) || 0);
      return !String(item?.id || item?.itemId || "").trim()
        || !String(item?.cartKey || "").trim()
        || quantity <= 0;
    });
    if (invalidItem) {
      return { ok: false, message: "Warenkorb ist unvollstaendig. Bitte Produkt erneut hinzufuegen." };
    }
    const wrongContextItem = items.find((item) => {
      const itemRestaurantId = String(item?.restaurantId || restaurantId).trim();
      return !itemRestaurantId || itemRestaurantId !== restaurantId;
    });
    if (wrongContextItem) {
      return { ok: false, message: "Warenkorb-Kontext passt nicht mehr zum Shop. Bitte Checkout neu starten." };
    }
    const tableNumber = Math.max(0, Number(cart?.tableNumber || cart?.form?.tableNumber || 0) || 0);
    const isTableService = String(cart?.serviceMode || "").trim().toLowerCase() === "table";
    if (isTableService && tableNumber <= 0) {
      return { ok: false, message: "Tisch-Kontext fehlt. Bitte QR-Menue erneut oeffnen." };
    }
    return { ok: true };
  }

  async function persistCheckoutOrder({
    orderId,
    orderRef,
    userOrderRef = null,
    payload,
    hasUser = false
  } = {}) {
    if (!orderId || !orderRef || !payload) {
      return { reusedExistingOrder: false, payload };
    }
    if (!hasUser && writeBatch && db) {
      const batch = writeBatch(db);
      batch.set(orderRef, payload, { merge: true });
      await batch.commit();
      return { reusedExistingOrder: false, payload };
    }
    if (runTransaction && db) {
      let result = { reusedExistingOrder: false, payload };
      await runTransaction(db, async (tx) => {
        const restaurantSnap = await tx.get(orderRef);
        if (restaurantSnap.exists()) {
          const existingPayload = { id: orderId, ...(restaurantSnap.data() || {}) };
          if (hasUser && userOrderRef) {
            const userSnap = await tx.get(userOrderRef);
            if (!userSnap.exists()) {
              tx.set(userOrderRef, existingPayload, { merge: true });
            }
          }
          result = { reusedExistingOrder: true, payload: existingPayload };
          return;
        }
        tx.set(orderRef, payload, { merge: true });
        if (hasUser && userOrderRef) {
          tx.set(userOrderRef, payload, { merge: true });
        }
        result = { reusedExistingOrder: false, payload };
      });
      return result;
    }
    if (!writeBatch || !db) {
      return { reusedExistingOrder: false, payload };
    }
    const batch = writeBatch(db);
    batch.set(orderRef, payload, { merge: true });
    if (hasUser && userOrderRef) {
      batch.set(userOrderRef, payload, { merge: true });
    }
    await batch.commit();
    return { reusedExistingOrder: false, payload };
  }

  async function submitShopCheckout() {
    const cart = normalizeShopCartState(state?.shopCart);
    if (activeCheckoutSubmitPromise) return activeCheckoutSubmitPromise;
    if (cart.loading || !cart.restaurantId || !cart.items.length) return;
    if (!collection || !makeDocRef || (!writeBatch && !runTransaction) || !db) return;

    const hasUser = !!String(state?.user?.uid || "").trim();
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
        setShopCartState({
          ...cart,
          status: isTableService
            ? "Bestellung wird vorbereitet."
            : "Bitte Name, Tel, Qyteti und Adresse eingeben."
        });
      }
      return;
    }

    const contextValidation = validateCheckoutCartContext(cart);
    if (!contextValidation.ok) {
      setShopCartState({
        ...cart,
        loading: false,
        checkoutOpen: true,
        status: contextValidation.message
      });
      return;
    }

    const restaurant = getRestaurantMetaById(cart.restaurantId) || {};
    const businessAvatar = cart.businessAvatar || restaurant.logoUrl || restaurant.logo || "";
    const submitAttemptFingerprint = buildCheckoutAttemptFingerprint(cart, {
      buyerUid: hasUser ? String(state?.user?.uid || "").trim() : "",
      serviceMode: cart.serviceMode,
      tableNumber,
      contact
    });
    const orderId = String(
      cart.submitAttemptId && cart.submitAttemptFingerprint === submitAttemptFingerprint
        ? cart.submitAttemptId
        : buildCheckoutAttemptId(cart.restaurantId)
    ).trim();
    const orderRef = makeDocRef(collection(db, "restaurants", cart.restaurantId, "orders"), orderId);
    const userOrderRef = hasUser
      ? makeDocRef(db, "users", state.user.uid, "orders", orderId)
      : null;
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
      serviceMode: isTableService ? "table" : String(cart.serviceMode || "").trim(),
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAtClient: nowIso,
      updatedAtClient: nowIso,
      submitAttemptId: orderId
    };

    const submitPromise = (async () => {
      setShopCartState({
        ...cart,
        submitAttemptId: orderId,
        submitAttemptFingerprint,
        loading: true,
        status: "Bestellung wird gesendet..."
      });
      try {
        const { payload: persistedPayload } = await persistCheckoutOrder({
          orderId,
          orderRef,
          userOrderRef,
          payload,
          hasUser
        });
        if (!hasUser && state) {
          const guestOrder = normalizeOrderDoc(persistedPayload, orderId);
          const currentItems = Array.isArray(state.orders?.items) ? state.orders.items : [];
          state.orders = {
            ...state.orders,
            loading: false,
            error: "",
            items: [guestOrder, ...currentItems.filter((item) => String(item?.id || "") !== orderId)]
          };
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
        setShopCartState({
          ...cart,
          submitAttemptId: orderId,
          submitAttemptFingerprint,
          loading: false,
          checkoutOpen: true,
          status: "Bestellung konnte nicht gesendet werden. Bitte erneut versuchen."
        });
      }
    })();
    activeCheckoutSubmitAttemptId = orderId;
    activeCheckoutSubmitPromise = submitPromise;
    try {
      return await submitPromise;
    } finally {
      if (activeCheckoutSubmitAttemptId === orderId) {
        activeCheckoutSubmitAttemptId = "";
      }
      if (activeCheckoutSubmitPromise === submitPromise) {
        activeCheckoutSubmitPromise = null;
      }
    }
  }

  return {
    stopOrdersListener,
    startOrdersListener,
    submitShopCheckout
  };
}
