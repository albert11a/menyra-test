import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const phase1Fixture = require("../../../phase1-testworld/fixtures/phase1-testworld.fixture.cjs");

const baselineUpdatedAt = "2026-03-28T10:00:00.000Z";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export const fixture = clone(phase1Fixture);

export function buildUserDoc(persona, overrides = {}) {
  return {
    uid: persona.uid,
    email: persona.email,
    displayName: persona.displayName,
    name: persona.displayName,
    firstName: persona.firstName,
    lastName: persona.lastName,
    handle: persona.handle,
    avatar: persona.avatarUrl,
    role: persona.role || "user",
    roles: Array.isArray(persona.roles) ? persona.roles.slice() : ["user"],
    restaurantId: "",
    staffRestaurantId: "",
    waiterRestaurantId: "",
    businessAccess: false,
    waiterAccess: false,
    permissions: {
      businessAccess: false,
      waiterAccess: false
    },
    staffActive: true,
    staffStatus: "active",
    followersCount: 0,
    followingCount: 0,
    updatedAt: baselineUpdatedAt,
    ...clone(overrides)
  };
}

export function buildRestaurantDoc(restaurant, overrides = {}) {
  return {
    id: restaurant.id,
    restaurantId: restaurant.id,
    name: restaurant.name,
    restaurantName: restaurant.name,
    handle: restaurant.handle,
    ownerUid: restaurant.ownerUid,
    ownerEmail: restaurant.ownerEmail,
    email: restaurant.ownerEmail,
    logoUrl: restaurant.logoUrl,
    status: restaurant.status,
    updatedAt: baselineUpdatedAt,
    ...clone(overrides)
  };
}

export function buildRestaurantStaffDoc(persona, restaurant, overrides = {}) {
  return {
    uid: persona.uid,
    userId: persona.uid,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    email: persona.email,
    name: persona.displayName,
    role: "waiter",
    roles: ["staff"],
    active: true,
    status: "active",
    businessAccess: false,
    waiterAccess: false,
    permissions: {
      businessAccess: false,
      waiterAccess: false
    },
    updatedAt: baselineUpdatedAt,
    ...clone(overrides)
  };
}

export function buildOrderDoc({
  orderId = "mnyra-rules-test-order-1",
  restaurantId = fixture.restaurants.alpha.id,
  buyerUid = "",
  tableNumber = 0,
  total = 12.9,
  status = "Neu"
} = {}) {
  return {
    id: orderId,
    restaurantId,
    buyerUid,
    buyerName: buyerUid ? fixture.personas.user.displayName : "Guest Rules",
    buyerHandle: buyerUid ? fixture.personas.user.handle : "",
    buyerAvatar: buyerUid ? fixture.personas.user.avatarUrl : "",
    tableNumber,
    tableLabel: tableNumber ? `T${tableNumber}` : "",
    contact: {
      name: buyerUid ? fixture.personas.user.displayName : "Guest Rules",
      phone: "+43000000000",
      city: "Vienna",
      address: "Rules Test Address",
      tableNumber,
      tableLabel: tableNumber ? `T${tableNumber}` : ""
    },
    items: [
      {
        id: "mnyra-rules-test-item-1",
        itemId: "mnyra-rules-test-item-1",
        cartKey: "mnyra-rules-test-item-1",
        name: "Rules Test Item",
        price: "12.90",
        quantity: 1,
        imageUrl: "https://example.test/assets/rules-test-item.jpg",
        category: "Main"
      }
    ],
    itemCount: 1,
    total,
    status,
    createdAt: baselineUpdatedAt,
    updatedAt: baselineUpdatedAt
  };
}

export function buildLeadDoc({
  leadId = "mnyra-rules-test-lead-1",
  createdByUid = fixture.personas.ceo.uid,
  ceoParentUid = fixture.personas.ceo.uid,
  ceoRootUid = fixture.personas.ceo.uid,
  ceoPath = [fixture.personas.ceo.uid],
  restaurantId = ""
} = {}) {
  return {
    id: leadId,
    businessName: "Rules Lead",
    customerType: "cafe",
    contactName: "Rules Lead Owner",
    phone: "+43555555555",
    email: "rules-lead@mnyra.test",
    city: "Vienna",
    address: "Rules Lead Street",
    logoUrl: "https://example.test/assets/rules-lead.png",
    status: "neu",
    restaurantId,
    createdByUid,
    ceoParentUid,
    ceoRootUid,
    ceoPath: Array.isArray(ceoPath) ? ceoPath.slice() : [],
    createdAt: baselineUpdatedAt,
    updatedAt: baselineUpdatedAt
  };
}

export function buildSuperadminDoc(persona, overrides = {}) {
  return {
    uid: persona.uid,
    userId: persona.uid,
    name: persona.displayName,
    displayName: persona.displayName,
    firstName: persona.firstName,
    lastName: persona.lastName,
    email: persona.email,
    handle: persona.handle,
    role: "ceo",
    roles: ["ceo"],
    status: "active",
    ceoParentUid: persona.uid,
    ceoRootUid: persona.uid,
    ceoPath: [persona.uid],
    updatedAt: baselineUpdatedAt,
    ...clone(overrides)
  };
}

export function buildNotificationDoc(overrides = {}) {
  return {
    type: "comment",
    user: fixture.personas.user.displayName,
    userHandle: fixture.personas.user.handle,
    userUid: fixture.personas.user.uid,
    avatar: fixture.personas.user.avatarUrl,
    text: "Rules notification",
    read: false,
    createdAt: baselineUpdatedAt,
    ...clone(overrides)
  };
}
