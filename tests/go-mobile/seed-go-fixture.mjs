// Mnyra GO - Testdaten fuer den lokalen Emulator.
//
// Legt das Konto des Wirts, sein Lokal und drei GO-Angebote an. Die Angebote
// laufen durch dieselben Funktionen wie im Editor (normalizeGoOffer), damit
// im Emulator genau das steht, was der Server spaeter auch schreiben wuerde.
//
// Nur Emulator: Ohne FIRESTORE_EMULATOR_HOST bricht das Skript ab.

import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { toGoOfferStoragePayload } from "../../shared/go/go-offer-core.js";
import {
  matchGoOffer,
  normalizeGoSearchRequest,
} from "../../shared/go/go-matching-core.js";

const PROJECT_ID = process.env.MNYRA_FIREBASE_PROJECT_ID || "mnyra-local";
process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";

if (!/^(mnyra-local|demo-|test-|local-)/.test(PROJECT_ID)) {
  throw new Error(`Refusing to seed non-local project "${PROJECT_ID}".`);
}

if (!getApps().length) initializeApp({ projectId: PROJECT_ID });
const db = getFirestore();
const auth = getAuth();

export const GO_FIXTURE = {
  uid: "go-bropizza-owner",
  email: "bropizza@mnyra.com",
  password: "Bropizza1992",
  restaurantId: "bro-pizza",
  slug: "bropizza",
  city: "Prishtina",
};

const ALL_DAY_HOURS = {
  monday: "00:00-23:59",
  tuesday: "00:00-23:59",
  wednesday: "00:00-23:59",
  thursday: "00:00-23:59",
  friday: "00:00-23:59",
  saturday: "00:00-23:59",
  sunday: "00:00-23:59",
};

const business = {
  id: GO_FIXTURE.restaurantId,
  slug: GO_FIXTURE.slug,
  name: "Bro Pizza",
  businessType: "restaurant",
  category: "Restaurant",
  city: GO_FIXTURE.city,
  country: "Kosovo",
  address: "Rruga e Go 1, Prishtina",
  phone: "+383 44 123 456",
  bio: "GO-Testlokal fuer mobile Pruefungen.",
  public: true,
  visibility: "public",
  ownerUid: GO_FIXTURE.uid,
  ownerEmail: GO_FIXTURE.email,
  rating: 4.6,
  priceRange: "€€",
  priceLevel: 2,
  coords: { lat: 42.6629, lng: 21.1655 },
  openingHours: ALL_DAY_HOURS,
};

// Ein zweites Lokal, 75 km entfernt in Prizren. Es dient genau einer Frage:
// Bekommt ein Gast in Prishtina Angebote aus einer Stadt, in der er nicht ist?
const farBusiness = {
  ...{},
  id: "bro-pizza-prizren",
  slug: "bropizzaprizren",
  name: "Bro Pizza Prizren",
  businessType: "restaurant",
  category: "Restaurant",
  city: "Prizren",
  country: "Kosovo",
  address: "Rruga e Prizrenit 5, Prizren",
  public: true,
  visibility: "public",
  ownerUid: "go-bropizza-owner",
  priceLevel: 2,
  coords: { lat: 42.2139, lng: 20.7397 },
  openingHours: ALL_DAY_HOURS,
};

const farOffer = {
  id: "go-offer-prizren",
  title: "Oferta ne Prizren",
  description: "Zbritje ne Prizren.",
  category: "food",
  benefit: { kind: "percent", percent: 15, scope: "all" },
  partyRanges: ["1-2", "3-4", "5-6", "7+"],
  schedule: { mode: "always" },
  limits: { dailyGroups: 9, total: 90 },
  channels: ["go"],
  status: "active",
  priceLevel: 2,
};

const offers = [
  {
    id: "go-offer-pizza",
    title: "Pica e madhe",
    description: "Zbritje per cdo pice te madhe.",
    category: "food",
    benefit: { kind: "percent", percent: 20, scope: "all" },
    partyRanges: ["1-2", "3-4", "5-6", "7+"],
    schedule: { mode: "always" },
    limits: { dailyGroups: 5, total: 50 },
    channels: ["go", "public"],
    status: "active",
    priceLevel: 2,
  },
  {
    id: "go-offer-coffee",
    title: "Kafe falas",
    description: "Nje kafe falas me cdo porosi.",
    category: "coffee",
    benefit: { kind: "freeItem", item: "Kafe", condition: "any_order" },
    partyRanges: ["1-2", "3-4", "5-6"],
    schedule: { mode: "always" },
    limits: { dailyGroups: 2, total: 20 },
    channels: ["go"],
    status: "active",
    priceLevel: 1,
  },
  {
    id: "go-offer-scarce",
    title: "Oferta e fundit",
    description: "Vetem nje grup ne dite.",
    category: "food",
    benefit: { kind: "percent", percent: 30, scope: "food" },
    partyRanges: ["1-2", "3-4", "5-6", "7+"],
    schedule: { mode: "always" },
    limits: { dailyGroups: 1, total: 3 },
    channels: ["go"],
    status: "active",
    priceLevel: 2,
  },
];

async function upsertAuthUser() {
  const payload = {
    uid: GO_FIXTURE.uid,
    email: GO_FIXTURE.email,
    emailVerified: true,
    displayName: "Bro Pizza",
    password: GO_FIXTURE.password,
    disabled: false,
  };
  try {
    await auth.updateUser(GO_FIXTURE.uid, payload);
  } catch (error) {
    if (error?.code === "auth/user-not-found") await auth.createUser(payload);
    else throw error;
  }
}

async function run() {
  await upsertAuthUser();

  const restaurantRef = db
    .collection("restaurants")
    .doc(GO_FIXTURE.restaurantId);
  await restaurantRef.set(business, { merge: true });
  await restaurantRef.collection("public").doc("profile").set(
    {
      restaurantId: GO_FIXTURE.restaurantId,
      slug: GO_FIXTURE.slug,
      name: business.name,
      city: business.city,
      address: business.address,
      phone: business.phone,
      public: true,
    },
    { merge: true },
  );
  await db
    .collection("publicRoutes")
    .doc(GO_FIXTURE.slug)
    .set(
      {
        slug: GO_FIXTURE.slug,
        restaurantId: GO_FIXTURE.restaurantId,
        type: "business",
        surface: "profile",
        public: true,
        canonicalPath: `/${GO_FIXTURE.slug}`,
        menuPath: `/${GO_FIXTURE.slug}/menu`,
      },
      { merge: true },
    );
  await db
    .collection("users")
    .doc(GO_FIXTURE.uid)
    .set(
      {
        uid: GO_FIXTURE.uid,
        email: GO_FIXTURE.email,
        displayName: "Bro Pizza",
        role: "business",
        roles: ["business"],
        restaurantId: GO_FIXTURE.restaurantId,
      },
      { merge: true },
    );

  await restaurantRef.collection("goSettings").doc("config").set(
    {
      enabled: true,
      paused: false,
      pausedUntil: "",
      timeZone: "Europe/Belgrade",
      restaurantId: GO_FIXTURE.restaurantId,
    },
    { merge: true },
  );

  const request = normalizeGoSearchRequest({
    city: GO_FIXTURE.city,
    partySize: 2,
  });
  for (const offer of offers) {
    const payload = toGoOfferStoragePayload({
      ...offer,
      restaurantId: GO_FIXTURE.restaurantId,
    });
    payload.cityKey = "prishtina";
    await restaurantRef
      .collection("goOffers")
      .doc(offer.id)
      .set(payload, { merge: true });
    const match = matchGoOffer({
      offer: { ...payload, id: offer.id },
      business,
      settings: { enabled: true },
      usage: {},
      request,
    });
    console.log(
      `offer ${offer.id}: match=${match.ok} reasons=${JSON.stringify(match.reasons)}`,
    );
  }

  const farRef = db.collection("restaurants").doc(farBusiness.id);
  await farRef.set(farBusiness, { merge: true });
  const farPayload = toGoOfferStoragePayload({
    ...farOffer,
    restaurantId: farBusiness.id,
  });
  farPayload.cityKey = "prizren";
  await farRef
    .collection("goOffers")
    .doc(farOffer.id)
    .set(farPayload, { merge: true });
  await farRef.collection("goSettings").doc("config").set(
    {
      enabled: true,
      paused: false,
      pausedUntil: "",
      timeZone: "Europe/Belgrade",
      restaurantId: farBusiness.id,
    },
    { merge: true },
  );

  console.log("GO fixture ready:", GO_FIXTURE.restaurantId, GO_FIXTURE.email);
}

await run();
