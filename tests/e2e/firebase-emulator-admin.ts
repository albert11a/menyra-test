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

export async function readRestaurantMenuItemByName(
  restaurantId: string,
  name: string,
) {
  const snapshot = await adminDb
    .collection("restaurants")
    .doc(restaurantId)
    .collection("menuItems")
    .where("name", "==", name)
    .limit(1)
    .get();
  const document = snapshot.docs[0];
  return document ? { id: document.id, data: document.data() } : null;
}

export async function readRestaurantPublicMenu(restaurantId: string) {
  const snapshot = await adminDb
    .collection("restaurants")
    .doc(restaurantId)
    .collection("public")
    .doc("menu")
    .get();
  return snapshot.exists ? snapshot.data() || null : null;
}

export async function deleteRestaurantMenuItemsByNames(
  restaurantId: string,
  names: string[],
) {
  const normalizedNames = new Set(
    names.map((name) => String(name || "").trim()).filter(Boolean),
  );
  if (!normalizedNames.size) return;

  const restaurantRef = adminDb.collection("restaurants").doc(restaurantId);
  const menuItemsRef = restaurantRef.collection("menuItems");
  const snapshots = await Promise.all(
    Array.from(normalizedNames, (name) =>
      menuItemsRef.where("name", "==", name).get(),
    ),
  );
  const documents = snapshots.flatMap((snapshot) => snapshot.docs);
  const removedIds = new Set(documents.map((document) => document.id));
  const publicMenuRef = restaurantRef.collection("public").doc("menu");
  const publicMenuSnapshot = await publicMenuRef.get();
  const publicMenu = publicMenuSnapshot.exists
    ? publicMenuSnapshot.data() || {}
    : {};
  const publicItems = Array.isArray(publicMenu.items) ? publicMenu.items : [];
  const nextPublicItems = publicItems.filter((item) => {
    const itemId = String(item?.id || item?.itemId || "").trim();
    const itemName = String(item?.name || "").trim();
    return !removedIds.has(itemId) && !normalizedNames.has(itemName);
  });
  const batch = adminDb.batch();
  documents.forEach((document) => batch.delete(document.ref));
  if (
    publicMenuSnapshot.exists &&
    nextPublicItems.length !== publicItems.length
  ) {
    batch.set(
      publicMenuRef,
      {
        items: nextPublicItems,
        menuTruthState: nextPublicItems.length ? "seeded" : "knownEmpty",
        updatedAt: FieldValue.serverTimestamp(),
        publishedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
  await batch.commit();
}
