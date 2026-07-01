import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { deleteApp, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import WebSocket from "ws";

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";

const functionsTestApp =
  getApps().find((entry) => entry.name === "functions-emulator-test") ||
  initializeApp({ projectId: "mnyra-local" }, "functions-emulator-test");
const functionsTestDb = getFirestore(functionsTestApp);

after(async () => {
  await deleteApp(functionsTestApp);
});

async function waitFor(predicate, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await predicate();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
}

async function openLoggingSocket() {
  const messages = [];
  const socket = new WebSocket("ws://127.0.0.1:4500");
  socket.on("message", (raw) => {
    try {
      messages.push(JSON.parse(String(raw)));
    } catch {}
  });
  await new Promise((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
  return { messages, socket };
}

async function callCreateRestaurantOrder(data) {
  const response = await fetch(
    "http://127.0.0.1:5001/mnyra-local/us-central1/createRestaurantOrder",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data }),
    },
  );
  const body = await response.json();
  return { response, body };
}

test("firebase emulator hub exposes the local Functions emulator", async () => {
  const response = await fetch("http://127.0.0.1:4400/emulators");
  assert.equal(response.ok, true);

  const emulators = await response.json();
  assert.equal(emulators.functions.host, "127.0.0.1");
  assert.equal(emulators.functions.port, 5001);
});

test("functions package stays local and is not a production deploy command", async () => {
  const pkg = JSON.parse(await readFile("functions/package.json", "utf8"));

  assert.equal(pkg.private, true);
  assert.equal(pkg.main, "index.js");
  assert.equal(pkg.engines.node, "20");
  assert.ok(
    !Object.values(pkg.scripts || {}).some((script) => /deploy/i.test(script)),
  );
});

test("createRestaurantOrder computes canonical numeric prices and rejects invalid targets", async () => {
  const suffix = Date.now();
  const restaurantId = `functions-order-${suffix}`;
  const restaurantRef = functionsTestDb.doc(`restaurants/${restaurantId}`);
  const numericItemRef = restaurantRef
    .collection("menuItems")
    .doc("numeric-item");
  const stringItemRef = restaurantRef
    .collection("menuItems")
    .doc("string-item");
  let createdOrderId = "";

  await Promise.all([
    restaurantRef.set({
      id: restaurantId,
      name: "Functions Order Test",
      ownerUid: "functions-owner",
    }),
    numericItemRef.set({
      id: "numeric-item",
      name: "Numeric Price Item",
      price: 4,
      available: true,
    }),
    stringItemRef.set({
      id: "string-item",
      name: "String Price Item",
      price: "3,40",
      available: true,
    }),
  ]);

  try {
    const success = await callCreateRestaurantOrder({
      restaurantId,
      serviceMode: "table",
      source: "qr",
      tableNumber: 2,
      items: [
        { itemId: "numeric-item", quantity: 1, price: 999 },
        { itemId: "string-item", quantity: 2, price: 999 },
      ],
      total: 2997,
      itemCount: 99,
      status: "archiv",
      buyerUid: "forged-buyer",
      guestScopeUid: "functions-guest",
      guestSessionId: "functions-session",
    });
    assert.equal(success.response.ok, true, JSON.stringify(success.body));
    assert.equal(success.body.result.ok, true);
    createdOrderId = success.body.result.orderId;
    assert.ok(createdOrderId);

    const createdSnapshot = await restaurantRef
      .collection("orders")
      .doc(createdOrderId)
      .get();
    assert.equal(createdSnapshot.exists, true);
    const created = createdSnapshot.data();
    assert.equal(created.restaurantId, restaurantId);
    assert.equal(created.status, "Neu");
    assert.equal(created.itemCount, 3);
    assert.equal(created.total, 10.8);
    assert.equal(created.totalCents, 1080);
    assert.equal(created.buyerUid, "");
    assert.equal(created.items[0].price, 4);
    assert.equal(created.items[0].priceCents, 400);
    assert.equal(created.items[1].price, 3.4);
    assert.equal(created.items[1].priceCents, 340);
    assert.equal(typeof created.items[0].price, "number");
    assert.equal(typeof created.items[1].price, "number");
    assert.ok(created.createdAt);
    assert.ok(created.updatedAt);

    const invalidItem = await callCreateRestaurantOrder({
      restaurantId,
      items: [{ itemId: "missing-item", quantity: 1 }],
    });
    assert.equal(invalidItem.response.ok, false);
    assert.equal(invalidItem.body.error.status, "FAILED_PRECONDITION");

    const invalidRestaurant = await callCreateRestaurantOrder({
      restaurantId: `missing-${restaurantId}`,
      items: [{ itemId: "numeric-item", quantity: 1 }],
    });
    assert.equal(invalidRestaurant.response.ok, false);
    assert.equal(invalidRestaurant.body.error.status, "FAILED_PRECONDITION");
  } finally {
    const orderSnapshots = await restaurantRef.collection("orders").get();
    const lookupSnapshots = await restaurantRef.collection("orderLookup").get();
    await Promise.allSettled([
      ...orderSnapshots.docs.map((snapshot) => snapshot.ref.delete()),
      ...lookupSnapshots.docs.map((snapshot) => snapshot.ref.delete()),
      numericItemRef.delete(),
      stringItemRef.delete(),
      restaurantRef.delete(),
    ]);
  }
});

test("order mirror trigger reproduces the local serverTimestamp runtime failure", async () => {
  const orderId = `order-functions-repro-${Date.now()}`;
  const orderRef = functionsTestDb.doc(
    `restaurants/pidhi-madh/orders/${orderId}`,
  );
  const mirrorRef = functionsTestDb.doc(
    `restaurants/pidhi-madh/orderLookup/${orderId}`,
  );
  const { messages, socket } = await openLoggingSocket();

  try {
    await orderRef.set({
      id: orderId,
      restaurantId: "pidhi-madh",
      businessName: "PIDHImadh",
      buyerUid: "",
      buyerName: "Functions Repro",
      buyerHandle: "guest",
      contact: {
        name: "Functions Repro",
        tableNumber: 2,
        tableLabel: "Tisch 2",
      },
      tableNumber: 2,
      tableLabel: "Tisch 2",
      items: [
        {
          id: "menu-001",
          itemId: "menu-001",
          name: "Local Breakfast Plate",
          price: 6.9,
          quantity: 1,
        },
      ],
      itemCount: 1,
      total: 6.9,
      status: "Neu",
      guestSessionId: "functions-repro-session",
      guestLookupToken: orderId,
      orderLookupToken: orderId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdAtClient: new Date().toISOString(),
      updatedAtClient: new Date().toISOString(),
    });

    const matchingLog = await waitFor(() =>
      messages.find((entry) => {
        const serialized = JSON.stringify(entry);
        return (
          serialized.includes("syncOrderMirrorsOnRestaurantOrderWrite") &&
          serialized.includes("orders.mirror.sync") &&
          serialized.includes(
            "Cannot read properties of undefined (reading 'serverTimestamp')",
          ) &&
          serialized.includes("buildCanonicalOrderProjection")
        );
      }),
    );
    assert.ok(matchingLog, "expected the mirror trigger serverTimestamp error");
  } finally {
    socket.close();
    await Promise.allSettled([orderRef.delete(), mirrorRef.delete()]);
  }
});
