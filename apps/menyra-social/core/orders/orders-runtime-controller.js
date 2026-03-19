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
      console.error(err);
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
    if (cart.loading || !cart.restaurantId || !cart.items.length) return;
    if (!collection || !makeDocRef || !writeBatch || !db) return;

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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAtClient: nowIso,
      updatedAtClient: nowIso
    };

    if (state) {
      state.shopCart = { ...cart, loading: true, status: "Bestellung wird gesendet..." };
    }
    renderFn();
    try {
      const batch = writeBatch(db);
      batch.set(orderRef, payload, { merge: true });
      if (hasUser) {
        batch.set(makeDocRef(db, "users", state.user.uid, "orders", orderId), payload, { merge: true });
      }
      await batch.commit();
      if (!hasUser && state) {
        const guestOrder = normalizeOrderDoc(payload, orderId);
        state.orders = {
          ...state.orders,
          loading: false,
          error: "",
          items: [guestOrder, ...(Array.isArray(state.orders?.items) ? state.orders.items : [])]
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
    }
  }

  return {
    stopOrdersListener,
    startOrdersListener,
    submitShopCheckout
  };
}
