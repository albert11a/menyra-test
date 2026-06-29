import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

import { createOrdersRuntimeController } from "../apps/menyra-social/core/orders/orders-runtime-controller.js";

const require = createRequire(import.meta.url);
const {
  OrderValidationError,
  normalizeCreateOrderInput,
  buildSecureRestaurantOrderPayload
} = require("../functions/order-security.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

function createStorageMock() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
    removeItem(key) {
      values.delete(String(key));
    },
    dump() {
      return Object.fromEntries(values.entries());
    }
  };
}

function createCheckoutState() {
  return {
    activeTab: "profile",
    drawerOpen: false,
    user: null,
    userProfile: null,
    shopCart: {
      restaurantId: "restaurant-1",
      businessName: "Client Restaurant Name",
      businessAvatar: "client-logo.png",
      serviceMode: "table",
      tableNumber: 7,
      checkoutOpen: true,
      loading: false,
      form: {
        name: "Guest A",
        phone: "123",
        city: "City",
        address: "Street"
      },
      items: [{
        id: "pizza-1",
        itemId: "pizza-1",
        name: "Manipulated Name",
        price: "0.01",
        quantity: 2,
        imageUrl: "client-image.png",
        category: "client-category",
        selectedSize: "Large",
        selectedColor: "Red",
        comment: "no onions",
        cropX: 42,
        cropY: 58
      }]
    },
    orders: {
      items: [],
      loading: false,
      error: ""
    }
  };
}

test("checkout sends only safe order intent to createRestaurantOrder callable", async () => {
  const state = createCheckoutState();
  const storage = createStorageMock();
  const returnedOrder = {
    id: "order-server-1",
    restaurantId: "restaurant-1",
    businessName: "Server Restaurant Name",
    businessAvatar: "server-logo.png",
    contact: {
      name: "Guest A",
      phone: "123",
      city: "City",
      address: "Street",
      tableNumber: 7,
      tableLabel: "Tisch 7"
    },
    tableNumber: 7,
    tableLabel: "Tisch 7",
    items: [{
      id: "pizza-1",
      itemId: "pizza-1",
      name: "Server Pizza",
      price: "12.50",
      quantity: 2,
      imageUrl: "server-image.png",
      category: "Pizza",
      selectedSize: "Large",
      selectedColor: "Red"
    }],
    itemCount: 2,
    total: 25,
    status: "Neu",
    createdAt: "2026-06-29T00:00:00.000Z",
    updatedAt: "2026-06-29T00:00:00.000Z"
  };
  let capturedInput = null;
  const controller = createOrdersRuntimeController({
    state,
    db: {},
    docFn: (...parts) => parts.join("/"),
    getDocFn: async () => ({
      exists: () => true,
      data: () => returnedOrder
    }),
    createOrderFn: async (input) => {
      capturedInput = input;
      return {
        ok: true,
        orderId: "order-server-1",
        restaurantId: "restaurant-1",
        guestLookupToken: "lookup-server-1",
        order: returnedOrder
      };
    },
    normalizeShopCartStateFn: (raw) => raw || {},
    getRestaurantMetaByIdFn: () => ({
      name: "Server Restaurant Name",
      logoUrl: "server-logo.png",
      type: "restaurant"
    }),
    buildShopVariantKeyFn: (itemId, options = {}) => `${itemId}:${options.size}:${options.color}`,
    clampCropPercentFn: (value, fallback = 50) => Math.max(0, Math.min(100, Math.round(Number(value) || fallback))),
    clearShopCartFn: ({ keepForm } = {}) => {
      state.shopCart = {
        restaurantId: "",
        items: [],
        form: keepForm ? state.shopCart.form : {},
        loading: false
      };
    },
    safeStorageObj: storage,
    guestScopeUid: "guest-scope-1",
    resolveGuestScopeUidFn: () => "guest-scope-1"
  });

  await controller.submitShopCheckout();

  assert.ok(capturedInput);
  assert.equal(capturedInput.restaurantId, "restaurant-1");
  assert.equal(capturedInput.tableNumber, 7);
  assert.equal(capturedInput.guestScopeUid, "guest-scope-1");
  assert.ok(capturedInput.guestSessionId);
  assert.deepEqual(Object.keys(capturedInput.items[0]).sort(), [
    "cartKey",
    "comment",
    "cropX",
    "cropY",
    "itemId",
    "quantity",
    "selectedColor",
    "selectedSize"
  ]);
  assert.equal(capturedInput.items[0].itemId, "pizza-1");
  assert.equal(capturedInput.items[0].quantity, 2);
  assert.equal("price" in capturedInput.items[0], false);
  assert.equal("name" in capturedInput.items[0], false);
  assert.equal("imageUrl" in capturedInput.items[0], false);
  assert.equal("total" in capturedInput, false);
  assert.equal("status" in capturedInput, false);
  assert.equal("buyerUid" in capturedInput, false);
  assert.equal("guestLookupToken" in capturedInput, false);
  assert.equal(state.shopCart.confirmation.restaurantId, "restaurant-1");
  assert.equal(state.shopCart.confirmation.tableNumber, 7);
  assert.match(JSON.stringify(storage.dump()), /lookup-server-1/);
});

test("server order payload ignores client prices and computes total from menu data", () => {
  const input = normalizeCreateOrderInput({
    restaurantId: "restaurant-1",
    total: 0.02,
    status: "Fertig",
    contact: { name: "Guest A", tableNumber: 3 },
    items: [{
      itemId: "pizza-1",
      name: "Manipulated Name",
      price: "0.01",
      quantity: 2,
      selectedSize: "Large",
      selectedColor: "Red"
    }]
  });

  const payload = buildSecureRestaurantOrderPayload({
    input,
    restaurantData: {
      name: "Server Restaurant",
      logoUrl: "server-logo.png"
    },
    menuItems: [{
      id: "pizza-1",
      name: "Server Pizza",
      price: "12,50 EUR",
      available: true,
      sizes: ["Large"],
      colors: ["Red"],
      imageUrl: "server-image.png",
      category: "Pizza"
    }],
    orderId: "order-server-1",
    nowIso: "2026-06-29T00:00:00.000Z",
    serverTimestampValue: "SERVER_TIMESTAMP",
    tokenFactory: () => "server-token-1"
  });

  assert.equal(payload.writeData.status, "Neu");
  assert.equal(payload.writeData.statusKey, "bestellung");
  assert.equal(payload.writeData.orderSource, "serverCallable");
  assert.equal(payload.writeData.pricingSource, "server_menu");
  assert.equal(payload.writeData.total, 25);
  assert.equal(payload.writeData.totalCents, 2500);
  assert.equal(payload.writeData.items[0].name, "Server Pizza");
  assert.equal(payload.writeData.items[0].price, "12,50 EUR");
  assert.equal(payload.writeData.items[0].priceCents, 1250);
  assert.equal(payload.writeData.buyerUid, "");
  assert.equal(payload.writeData.guestLookupToken, "server-token-1");
});

test("server order payload rejects hidden or unavailable menu items", () => {
  const input = normalizeCreateOrderInput({
    restaurantId: "restaurant-1",
    items: [{ itemId: "hidden-1", quantity: 1 }]
  });

  assert.throws(() => buildSecureRestaurantOrderPayload({
    input,
    restaurantData: { name: "Server Restaurant" },
    menuItems: [{
      id: "hidden-1",
      name: "Hidden Pizza",
      price: "9.50",
      available: false
    }],
    orderId: "order-server-1",
    nowIso: "2026-06-29T00:00:00.000Z",
    serverTimestampValue: "SERVER_TIMESTAMP",
    tokenFactory: () => "server-token-1"
  }), OrderValidationError);
});

test("server order input rejects spoofed buyer uid", () => {
  assert.throws(() => normalizeCreateOrderInput({
    restaurantId: "restaurant-1",
    buyerUid: "attacker-uid",
    items: [{ itemId: "pizza-1", quantity: 1 }]
  }, {
    authUid: "real-user-uid"
  }), OrderValidationError);
});

test("Firestore rules keep direct restaurant order creates disabled", () => {
  const rules = readFileSync(join(repoRoot, "firestore.rules"), "utf8");
  assert.match(
    rules,
    /match \/orders\/\{orderId\}[\s\S]*allow create: if false;[\s\S]*allow update, delete: if canAccessRestaurantOrdersDoc\(restaurantId\);/
  );
});
