import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = "mnyra-local";
const APP_NAME = "mnyra-playwright";

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";

const adminApp =
  getApps().find((entry) => entry.name === APP_NAME) ||
  initializeApp({ projectId: PROJECT_ID }, APP_NAME);
const adminDb = getFirestore(adminApp);

export async function listRestaurantOrders(restaurantId: string) {
  const snapshot = await adminDb
    .collection("restaurants")
    .doc(restaurantId)
    .collection("orders")
    .get();
  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    data: docSnapshot.data(),
  }));
}

export async function readRestaurantOrder(
  restaurantId: string,
  orderId: string,
) {
  const snapshot = await adminDb
    .collection("restaurants")
    .doc(restaurantId)
    .collection("orders")
    .doc(orderId)
    .get();
  return snapshot.exists ? snapshot.data() || null : null;
}

export async function deleteRestaurantOrder(
  restaurantId: string,
  orderId: string,
) {
  const orderRef = adminDb
    .collection("restaurants")
    .doc(restaurantId)
    .collection("orders")
    .doc(orderId);
  const orderSnapshot = await orderRef.get();
  const orderData = orderSnapshot.exists ? orderSnapshot.data() || {} : {};
  const lookupTokens = new Set(
    [orderData.guestLookupToken, orderData.orderLookupToken, orderId]
      .map((value) => String(value || "").trim())
      .filter(Boolean),
  );
  await Promise.allSettled([
    orderRef.delete(),
    ...Array.from(lookupTokens, (lookupToken) =>
      adminDb
        .collection("restaurants")
        .doc(restaurantId)
        .collection("orderLookup")
        .doc(lookupToken)
        .delete(),
    ),
  ]);
}

export async function createForeignRestaurantOrder(orderId: string) {
  await adminDb
    .collection("restaurants")
    .doc("shop-demo")
    .collection("orders")
    .doc(orderId)
    .set({
      id: orderId,
      restaurantId: "shop-demo",
      status: "new",
      buyerUid: "",
      buyerName: "Foreign Guest",
      items: [
        {
          id: "shop-item-001",
          itemId: "shop-item-001",
          name: "Foreign Restaurant Item",
          quantity: 1,
          price: 19.9,
        },
      ],
      itemCount: 1,
      total: 19.9,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdAtClient: new Date().toISOString(),
      updatedAtClient: new Date().toISOString(),
    });
}

export async function restoreSeedWaiterOrder() {
  await adminDb
    .collection("restaurants")
    .doc("pidhi-madh")
    .collection("orders")
    .doc("order-demo-001")
    .set(
      {
        status: "new",
        updatedAt: "2026-07-01T07:00:00.000Z",
        updatedAtClient: "2026-07-01T07:00:00.000Z",
      },
      { merge: true },
    );
}
