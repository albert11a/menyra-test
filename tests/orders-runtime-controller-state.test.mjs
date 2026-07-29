import assert from "node:assert/strict";
import test from "node:test";

import { createOrdersRuntimeController } from "../apps/menyra-social/core/orders/orders-runtime-controller.js";

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolveFn, rejectFn) => {
    resolve = resolveFn;
    reject = rejectFn;
  });
  return { promise, resolve, reject };
}

function createBaseCart() {
  return {
    restaurantId: "pidhi-madh",
    businessName: "PIDHImadh",
    businessAvatar: "https://images.example.local/pidhi-logo.jpg",
    tableNumber: 2,
    tableLabel: "Tisch 2",
    serviceMode: "table",
    source: "qr",
    checkoutOpen: false,
    status: "",
    loading: false,
    form: {
      name: "",
      phone: "",
      city: "",
      address: "",
      tableNumber: 2,
      tableLabel: "Tisch 2",
    },
    items: [
      {
        id: "menu-001",
        itemId: "menu-001",
        cartKey: "menu-001::default",
        name: "Local Breakfast Plate",
        quantity: 1,
        price: 6.9,
        imageUrl: "https://images.example.local/breakfast.jpg",
      },
    ],
  };
}

function createState() {
  return {
    user: null,
    userProfile: null,
    profileView: {
      profile: {
        restaurantId: "pidhi-madh",
        type: "restaurant",
        customerType: "restaurant",
      },
    },
    shopCart: createBaseCart(),
    orders: {
      items: [],
      loading: false,
      error: "",
    },
    activeTab: "menu",
  };
}

function createController(state, createOrderFn) {
  return createOrdersRuntimeController({
    state,
    createOrderFn,
    normalizeShopCartStateFn: (raw) => ({
      ...createBaseCart(),
      ...(raw || {}),
      form: {
        ...createBaseCart().form,
        ...(raw?.form || {}),
      },
      items: Array.isArray(raw?.items) ? raw.items : [],
    }),
    getRestaurantMetaByIdFn: () => ({
      id: "pidhi-madh",
      name: "PIDHImadh",
      restaurantName: "PIDHImadh",
      type: "restaurant",
    }),
    parsePriceValueFn: (value) => Number(value || 0) || 0,
    buildShopVariantKeyFn: (itemId) => `${itemId || ""}::default`,
    clampCropPercentFn: (value, fallback = 50) =>
      Number.isFinite(Number(value)) ? Number(value) : fallback,
    clearShopCartFn: ({ keepForm = false } = {}) => {
      const previous = state.shopCart || createBaseCart();
      state.shopCart = {
        ...createBaseCart(),
        restaurantId: "",
        businessName: "",
        businessAvatar: "",
        tableNumber: keepForm ? previous.tableNumber || 0 : 0,
        tableLabel: keepForm ? previous.tableLabel || "" : "",
        serviceMode: keepForm ? previous.serviceMode || "" : "",
        checkoutOpen: false,
        status: "",
        loading: false,
        items: [],
        form: keepForm
          ? { ...previous.form }
          : {
              name: "",
              phone: "",
              city: "",
              address: "",
              tableNumber: 0,
              tableLabel: "",
            },
      };
    },
    saveShopCartToStorageFn: () => {},
    renderFn: () => {},
    guestScopeUid: "guest-pilot",
    resolveGuestScopeUidFn: () => "guest-pilot",
    safeStorageObj: {
      store: new Map(),
      getItem(key) {
        return this.store.get(key) || null;
      },
      setItem(key, value) {
        this.store.set(key, value);
      },
      removeItem(key) {
        this.store.delete(key);
      },
    },
  });
}

test("order submit keeps one in-flight request for double clicks", async () => {
  const state = createState();
  const deferred = createDeferred();
  let createCalls = 0;
  const controller = createController(state, () => {
    createCalls += 1;
    return deferred.promise;
  });

  const firstSubmit = controller.submitShopCheckout();
  const secondSubmit = controller.submitShopCheckout();

  assert.equal(createCalls, 1);
  assert.equal(state.shopCart.loading, true);
  assert.equal(state.shopCart.status, "Porosia po dergohet...");

  deferred.resolve({
    data: {
      orderId: "order-double-click",
      guestLookupToken: "lookup-double-click",
      order: {
        id: "order-double-click",
        restaurantId: "pidhi-madh",
        businessName: "PIDHImadh",
        tableNumber: 2,
        items: [
          {
            itemId: "menu-001",
            name: "Local Breakfast Plate",
            quantity: 1,
            price: 6.9,
          },
        ],
        itemCount: 1,
        total: 6.9,
        status: "Neu",
        createdAtClient: "2026-07-02T00:00:00.000Z",
        updatedAtClient: "2026-07-02T00:00:00.000Z",
      },
    },
  });
  await Promise.all([firstSubmit, secondSubmit]);

  assert.equal(createCalls, 1);
  assert.equal(state.shopCart.loading, false);
  assert.equal(state.shopCart.checkoutOpen, false);
  assert.equal(state.shopCart.confirmation?.restaurantId, "pidhi-madh");
  assert.equal(state.shopCart.confirmation?.tableNumber, 2);
});

test("order submit releases loading state after a real submit error", async () => {
  const state = createState();
  let createCalls = 0;
  const originalConsoleError = console.error;
  const controller = createController(state, async () => {
    createCalls += 1;
    if (createCalls === 1) {
      const error = new Error("permission-denied");
      error.code = "permission-denied";
      throw error;
    }
    return {
      data: {
        orderId: "order-after-error",
        guestLookupToken: "lookup-after-error",
      },
    };
  });

  console.error = () => {};
  try {
    await controller.submitShopCheckout();
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(createCalls, 1);
  assert.equal(state.shopCart.loading, false);
  assert.equal(state.shopCart.checkoutOpen, true);
  assert.equal(
    state.shopCart.status,
    "Porosia nuk mund te dergohej.",
  );

  await controller.submitShopCheckout();

  assert.equal(createCalls, 2);
  assert.equal(state.shopCart.loading, false);
  assert.equal(state.shopCart.confirmation?.restaurantId, "pidhi-madh");
});
