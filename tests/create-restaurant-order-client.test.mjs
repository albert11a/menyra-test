import test from "node:test";
import assert from "node:assert/strict";
import { buildCreateRestaurantOrderRequest } from "../apps/menyra-social/core/orders/create-restaurant-order-client.js";

test("create order client sends only untrusted order intent fields", () => {
  const request = buildCreateRestaurantOrderRequest({
    restaurantId: "restaurant-generic",
    serviceMode: "table",
    source: "qr",
    tableId: "table-2",
    tableNumber: 2,
    tableLabel: "Tisch 2",
    contact: {
      name: "Guest",
      phone: "123",
      role: "admin",
    },
    items: [
      {
        itemId: "menu-001",
        quantity: 2,
        price: 999,
        total: 1998,
        status: "archiv",
        ownerUid: "forged-owner",
        selectedSize: "Large",
        comment: "No onions",
      },
    ],
    price: 999,
    total: 1998,
    itemCount: 2,
    status: "archiv",
    buyerUid: "forged-buyer",
    waiterUid: "forged-waiter",
    guestScopeUid: "guest-scope",
    guestSessionId: "guest-session",
  });

  assert.deepEqual(Object.keys(request).sort(), [
    "contact",
    "guestScopeUid",
    "guestSessionId",
    "items",
    "restaurantId",
    "serviceMode",
    "source",
    "tableId",
    "tableLabel",
    "tableNumber",
  ]);
  assert.deepEqual(Object.keys(request.contact).sort(), [
    "address",
    "city",
    "email",
    "name",
    "phone",
    "tableLabel",
    "tableNumber",
  ]);
  assert.deepEqual(Object.keys(request.items[0]).sort(), [
    "cartKey",
    "comment",
    "cropX",
    "cropY",
    "itemId",
    "quantity",
    "selectedColor",
    "selectedSize",
  ]);
  assert.equal(request.items[0].quantity, 2);
  assert.equal(request.items[0].selectedSize, "Large");
  assert.equal(request.items[0].comment, "No onions");
  assert.equal("price" in request.items[0], false);
  assert.equal("total" in request, false);
  assert.equal("status" in request, false);
  assert.equal("buyerUid" in request, false);
});
