// Mnyra GO - der direkte Blick in den Emulator.
//
// Die Tests pruefen nicht nur, was auf dem Telefon steht, sondern auch, was
// dabei in der Datenbank entsteht: eine Buchung, nicht zwei; ein Eintrag im
// Hauptbuch, nicht keiner.

import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = "mnyra-local";
const APP_NAME = "mnyra-go-mobile";

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";

const app =
  getApps().find((entry) => entry.name === APP_NAME) ||
  initializeApp({ projectId: PROJECT_ID }, APP_NAME);
export const db = getFirestore(app);

export type GoBookingRecord = { id: string } & Record<string, any>;

export async function listGoBookings(
  restaurantId = "",
): Promise<GoBookingRecord[]> {
  const snapshot = await db.collection("goBookings").get();
  const records: GoBookingRecord[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Record<string, any>),
  }));
  return records.filter(
    (entry) => !restaurantId || entry.restaurantId === restaurantId,
  );
}

export async function listGoLedger(): Promise<GoBookingRecord[]> {
  const snapshot = await db.collection("goLedger").get();
  const records: GoBookingRecord[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Record<string, any>),
  }));
  return records;
}

async function deleteCollection(path: string) {
  const snapshot = await db.collection(path).get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}

async function deleteSub(restaurantId: string, sub: string) {
  const snapshot = await db
    .collection("restaurants")
    .doc(restaurantId)
    .collection(sub)
    .get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
}

/** Vor jedem Fall: keine Buchung, kein Zaehler, kein Hauptbuch. */
export async function resetGoRuntimeData() {
  await Promise.all([
    deleteCollection("goBookings"),
    deleteCollection("goBookingCodes"),
    deleteCollection("goGuestSessions"),
    deleteCollection("goLedger"),
    deleteSub("bro-pizza", "goCapacity"),
    deleteSub("bro-pizza", "goStats"),
    deleteSub("bro-pizza-prizren", "goCapacity"),
    deleteSub("bro-pizza-prizren", "goStats"),
  ]);
}

export async function setOfferLimits(
  restaurantId: string,
  offerId: string,
  limits: { dailyGroups?: number; total?: number },
) {
  await db
    .collection("restaurants")
    .doc(restaurantId)
    .collection("goOffers")
    .doc(offerId)
    .set({ limits: { dailyGroups: 0, total: 0, ...limits } }, { merge: true });
}

export async function setOfferStatus(
  restaurantId: string,
  offerId: string,
  status: string,
) {
  await db
    .collection("restaurants")
    .doc(restaurantId)
    .collection("goOffers")
    .doc(offerId)
    .set({ status }, { merge: true });
}
