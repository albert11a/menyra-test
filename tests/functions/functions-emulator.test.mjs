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
    const guestLookupToken = success.body.result.guestLookupToken;
    assert.ok(guestLookupToken);

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

    const mirrorSnapshot = await waitFor(async () => {
      const snapshot = await restaurantRef
        .collection("orderLookup")
        .doc(guestLookupToken)
        .get();
      return snapshot.exists ? snapshot : null;
    });
    assert.ok(
      mirrorSnapshot,
      "expected guest order mirror after callable order",
    );
    const mirror = mirrorSnapshot.data();
    assert.equal(mirror.id, createdOrderId);
    assert.equal(mirror.restaurantId, restaurantId);
    assert.equal(mirror.lookupToken, guestLookupToken);
    assert.equal(mirror.mirrorType, "guest_order_lookup");
    assert.equal(mirror.total, 10.8);
    assert.ok(mirror.mirroredAt);

    const notificationRef = functionsTestDb.doc(
      `users/functions-owner/notifications/restaurant_order_${createdOrderId}`,
    );
    const notificationSnapshot = await waitFor(async () => {
      const snapshot = await notificationRef.get();
      return snapshot.exists ? snapshot : null;
    });
    assert.ok(
      notificationSnapshot,
      "expected owner waiter notification after callable order",
    );
    const notification = notificationSnapshot.data();
    assert.equal(notification.type, "restaurant_order");
    assert.equal(notification.restaurantId, restaurantId);
    assert.equal(notification.orderId, createdOrderId);
    assert.equal(notification.userUid, "functions-owner");
    assert.ok(notification.createdAt);
    assert.ok(notification.updatedAt);

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
    const notificationSnapshots = await functionsTestDb
      .collection("users")
      .doc("functions-owner")
      .collection("notifications")
      .where("restaurantId", "==", restaurantId)
      .get();
    await Promise.allSettled([
      ...orderSnapshots.docs.map((snapshot) => snapshot.ref.delete()),
      ...lookupSnapshots.docs.map((snapshot) => snapshot.ref.delete()),
      ...notificationSnapshots.docs.map((snapshot) => snapshot.ref.delete()),
      numericItemRef.delete(),
      stringItemRef.delete(),
      restaurantRef.delete(),
    ]);
  }
});

test("order mirror and waiter notification triggers write server timestamps", async () => {
  const suffix = Date.now();
  const restaurantId = `functions-trigger-${suffix}`;
  const ownerUid = `functions-owner-${suffix}`;
  const waiterUid = `functions-waiter-${suffix}`;
  const orderId = `order-functions-regression-${suffix}`;
  const restaurantRef = functionsTestDb.doc(`restaurants/${restaurantId}`);
  const staffRef = restaurantRef.collection("staff").doc(waiterUid);
  const orderRef = restaurantRef.collection("orders").doc(orderId);
  const mirrorRef = restaurantRef.collection("orderLookup").doc(orderId);
  const ownerNotificationRef = functionsTestDb.doc(
    `users/${ownerUid}/notifications/restaurant_order_${orderId}`,
  );
  const waiterNotificationRef = functionsTestDb.doc(
    `users/${waiterUid}/notifications/restaurant_order_${orderId}`,
  );
  const { messages, socket } = await openLoggingSocket();

  try {
    await Promise.all([
      restaurantRef.set({
        id: restaurantId,
        name: "Functions Trigger Test",
        ownerUid,
      }),
      staffRef.set({
        active: true,
        waiterAccess: true,
      }),
    ]);

    await orderRef.set({
      id: orderId,
      restaurantId,
      businessName: "Functions Trigger Test",
      buyerUid: "",
      buyerName: "Functions Regression",
      buyerHandle: "guest",
      contact: {
        name: "Functions Regression",
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

    const mirrorSnapshot = await waitFor(async () => {
      const snapshot = await mirrorRef.get();
      return snapshot.exists ? snapshot : null;
    });
    assert.ok(mirrorSnapshot, "expected guest order mirror");
    const mirror = mirrorSnapshot.data();
    assert.equal(mirror.restaurantId, restaurantId);
    assert.equal(mirror.id, orderId);
    assert.equal(mirror.lookupToken, orderId);
    assert.equal(mirror.mirrorType, "guest_order_lookup");
    assert.equal(mirror.statusKey, "bestellung");
    assert.ok(mirror.mirroredAt);

    const ownerNotificationSnapshot = await waitFor(async () => {
      const snapshot = await ownerNotificationRef.get();
      return snapshot.exists ? snapshot : null;
    });
    assert.ok(ownerNotificationSnapshot, "expected owner order notification");
    const ownerNotification = ownerNotificationSnapshot.data();
    assert.equal(ownerNotification.type, "restaurant_order");
    assert.equal(ownerNotification.restaurantId, restaurantId);
    assert.equal(ownerNotification.orderId, orderId);
    assert.equal(ownerNotification.userUid, ownerUid);
    assert.ok(ownerNotification.createdAt);
    assert.ok(ownerNotification.updatedAt);

    const waiterNotificationSnapshot = await waitFor(async () => {
      const snapshot = await waiterNotificationRef.get();
      return snapshot.exists ? snapshot : null;
    });
    assert.ok(waiterNotificationSnapshot, "expected waiter order notification");
    const waiterNotification = waiterNotificationSnapshot.data();
    assert.equal(waiterNotification.type, "restaurant_order");
    assert.equal(waiterNotification.restaurantId, restaurantId);
    assert.equal(waiterNotification.orderId, orderId);
    assert.equal(waiterNotification.userUid, waiterUid);
    assert.ok(waiterNotification.createdAt);
    assert.ok(waiterNotification.updatedAt);

    const serverTimestampErrorLog = messages.find((entry) => {
      const serialized = JSON.stringify(entry);
      return (
        serialized.includes("serverTimestamp") &&
        serialized.includes(
          "Cannot read properties of undefined (reading 'serverTimestamp')",
        )
      );
    });
    assert.equal(
      serverTimestampErrorLog,
      undefined,
      "did not expect a serverTimestamp runtime error",
    );
  } finally {
    socket.close();
    await Promise.allSettled([
      orderRef.delete(),
      mirrorRef.delete(),
      ownerNotificationRef.delete(),
      waiterNotificationRef.delete(),
      staffRef.delete(),
      restaurantRef.delete(),
    ]);
  }
});
