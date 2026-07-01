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
