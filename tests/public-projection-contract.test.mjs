import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createRestaurantIdentityRuntimeController } from "../apps/menyra-social/core/common/restaurant-identity-runtime-controller.js";
import { normalizeMenuItemDocCore } from "../apps/menyra-social/core/menu/menu-doc-normalize-utils.js";
import {
  normalizeMenuTypeCore,
  normalizeOptionListCore,
} from "../apps/menyra-social/core/menu/menu-input-utils.js";
import { saveMenuItemFromModalCore } from "../apps/menyra-social/core/menu/menu-save-utils.js";
import {
  buildPublicAdsProjection,
  buildPublicMetaProjection,
  buildPublicOffersProjection,
  buildPublicProfileProjection,
  buildPublicRouteProjection,
} from "../apps/menyra-social/core/public-profile/public-projection-builders.js";

const repoRoot = dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const seed = JSON.parse(
  await readFile(resolve(repoRoot, "seed/data/mnyra-local-seed.json"), "utf8"),
);

const documentsByPath = new Map(
  (seed.documents || []).map((document) => [
    document.path,
    document.data || {},
  ]),
);

const businessFixtures = Object.freeze([
  {
    restaurantId: "pidhi-madh",
    slug: "pidhimadh",
    name: "PIDHImadh",
    type: "restaurant",
  },
  {
    restaurantId: "shop-demo",
    slug: "shopdemo",
    name: "Local Shop Demo",
    type: "ecommerce",
  },
  {
    restaurantId: "hotel-demo",
    slug: "hoteldemo",
    name: "Local Hotel Demo",
    type: "hotel",
  },
]);

const forbiddenProjectionKeys = new Set([
  "accountEmail",
  "adminEmail",
  "adminNotes",
  "approvedByUid",
  "billing",
  "billingNote",
  "bookingAdminNote",
  "businessAccess",
  "budget",
  "ceoPath",
  "contactEmail",
  "creatorUid",
  "createdByUid",
  "crm",
  "email",
  "internalComments",
  "internalMargin",
  "internalNote",
  "internalNotes",
  "leadId",
  "leadSource",
  "loginEmail",
  "moderationNotes",
  "moderatorUid",
  "ownerEmail",
  "ownerUid",
  "password",
  "payment",
  "payout",
  "private",
  "privateBookingNotes",
  "privatePricing",
  "privateTargeting",
  "productOwnerUid",
  "rejectedByUid",
  "reviewedByUid",
  "role",
  "roles",
  "socialEmail",
  "staff",
  "staffRole",
  "staffStatus",
  "targeting",
  "waiterAccess",
]);

const routeKeys = new Set([
  "canonicalPath",
  "menuPath",
  "public",
  "restaurantId",
  "slug",
  "surface",
  "type",
]);

const publicProfileKeys = new Set([
  "address",
  "about",
  "avatarUrl",
  "bio",
  "businessType",
  "category",
  "city",
  "contactUrl",
  "country",
  "coverUrl",
  "coverImageUrl",
  "coverImages",
  "description",
  "displayName",
  "facebookUrl",
  "heroUrl",
  "images",
  "instagram",
  "instagramUrl",
  "logoUrl",
  "name",
  "phone",
  "public",
  "publicContact",
  "restaurantId",
  "slug",
  "socialLinks",
  "tiktok",
  "tiktokUrl",
  "titleImageUrl",
  "type",
  "website",
  "whatsappUrl",
  "youtubeUrl",
]);

const publicMetaKeys = new Set([
  "address",
  "adsEnabled",
  "adsVisible",
  "businessType",
  "category",
  "city",
  "country",
  "coverUrl",
  "customerType",
  "instagram",
  "instagramUrl",
  "logoUrl",
  "menuAvailabilityBadgeVisible",
  "menuStatusBadgeVisible",
  "menuVisible",
  "name",
  "offersEnabled",
  "offersVisible",
  "phone",
  "postsVisible",
  "profileVisible",
  "public",
  "restaurantId",
  "slug",
  "tableQrCount",
  "tableQrEnabled",
  "tables",
  "tiktok",
  "tiktokUrl",
  "type",
  "updatedAt",
  "visibility",
]);

const publicTableKeys = new Set(["id", "label", "number"]);

const publicMenuKeys = new Set([
  "currency",
  "items",
  "menuTruthSource",
  "menuTruthState",
  "public",
  "publishedAt",
  "restaurantId",
  "statusBadgeVisible",
  "updatedAt",
]);

const publicMenuItemKeys = new Set([
  "allergens",
  "available",
  "brand",
  "cardStyle",
  "category",
  "colors",
  "cropX",
  "cropY",
  "crossSellItemIds",
  "description",
  "hidden",
  "id",
  "imageUrl",
  "imageUrls",
  "ingredients",
  "itemId",
  "longDescription",
  "menuHidden",
  "menuSection",
  "name",
  "orderIndex",
  "price",
  "sizes",
  "sku",
  "specialActionProductId",
  "specialActionType",
  "specialActionUrl",
  "specialSize",
  "statusHidden",
  "statusVisibility",
  "stock",
  "type",
  "woltUrl",
]);

const publicOffersKeys = new Set([
  "items",
  "public",
  "restaurantId",
  "updatedAt",
]);
const publicOfferItemKeys = new Set([
  "active",
  "beachDistance",
  "beachfront",
  "bookingUrl",
  "centerDistance",
  "city",
  "contactUrl",
  "cropX",
  "cropY",
  "ctaLabel",
  "ctaUrl",
  "currency",
  "description",
  "directCenter",
  "distanceBeach",
  "distanceCenter",
  "distanceToBeach",
  "distanceToCenter",
  "featureLabels",
  "features",
  "hotelStartingPrice",
  "id",
  "imageUrl",
  "inCenter",
  "isTravelOffer",
  "itemId",
  "labels",
  "location",
  "mediaUrl",
  "menuItemId",
  "offerBadgeLabel",
  "offerDurationLabel",
  "onBeach",
  "price",
  "priceFrom",
  "priceUnit",
  "productId",
  "referenceId",
  "referenceUrl",
  "startingPrice",
  "targetCategory",
  "text",
  "title",
]);

const publicAdsKeys = new Set(["items", "public", "restaurantId", "updatedAt"]);
const publicAdItemKeys = new Set([
  "active",
  "bestChoiceBadgeEnabled",
  "category",
  "copy",
  "cropX",
  "cropY",
  "ctaLabel",
  "ctaUrl",
  "deliveryBadgeEnabled",
  "displayPriority",
  "expiresAt",
  "id",
  "imageUrl",
  "mediaUrl",
  "priceSegment",
  "publishedAt",
  "status",
  "text",
  "title",
  "woltEnabled",
]);

function getRequiredDocument(path) {
  const data = documentsByPath.get(path);
  assert.ok(data, `missing seed document ${path}`);
  return data;
}

function assertAllowedKeys(value, allowedKeys, label) {
  const extraKeys = Object.keys(value || {}).filter(
    (key) => !allowedKeys.has(key),
  );
  assert.deepEqual(extraKeys, [], `${label} contains non-public key(s)`);
}

function assertNoForbiddenKeys(value, label) {
  const violations = [];

  function visit(node, path) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    Object.entries(node).forEach(([key, childValue]) => {
      if (forbiddenProjectionKeys.has(key)) {
        violations.push(`${path}.${key}`);
      }
      visit(childValue, `${path}.${key}`);
    });
  }

  visit(value, label);
  assert.deepEqual(violations, [], `${label} contains private field(s)`);
}

function assertNumericOrNullPrice(item, label) {
  assert.ok(
    item.price === null || typeof item.price === "number",
    `${label}.price must be numeric or null`,
  );
}

function assertPlainProjection(value, label) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertPlainProjection(item, `${label}[${index}]`),
    );
    return;
  }
  if (!value || typeof value !== "object") return;
  assert.equal(
    Object.getPrototypeOf(value),
    Object.prototype,
    `${label} must contain plain objects only`,
  );
  Object.entries(value).forEach(([key, child]) => {
    assertPlainProjection(child, `${label}.${key}`);
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value))
    return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function createMenuDocument(values = {}) {
  return {
    getElementById(id) {
      if (Object.prototype.hasOwnProperty.call(values, id)) {
        return { value: values[id], checked: values[id] === true };
      }
      return { value: "", checked: false };
    },
    querySelectorAll() {
      return [];
    },
  };
}

test("local seed publicRoutes use only public route fields", () => {
  for (const fixture of businessFixtures) {
    const route = getRequiredDocument(`publicRoutes/${fixture.slug}`);

    assertAllowedKeys(route, routeKeys, `publicRoutes/${fixture.slug}`);
    assertNoForbiddenKeys(route, `publicRoutes/${fixture.slug}`);
    assert.equal(route.restaurantId, fixture.restaurantId);
    assert.equal(route.slug, fixture.slug);
    assert.equal(route.public, true);
  }
});

test("local seed public profile and meta docs exclude private fields", () => {
  for (const fixture of businessFixtures) {
    const profilePath = `restaurants/${fixture.restaurantId}/public/profile`;
    const metaPath = `restaurants/${fixture.restaurantId}/public/meta`;
    const profile = getRequiredDocument(profilePath);
    const meta = getRequiredDocument(metaPath);

    assertAllowedKeys(profile, publicProfileKeys, profilePath);
    assertNoForbiddenKeys(profile, profilePath);
    assert.equal(profile.restaurantId, fixture.restaurantId);
    assert.equal(profile.name, fixture.name);

    assertAllowedKeys(meta, publicMetaKeys, metaPath);
    assertNoForbiddenKeys(meta, metaPath);
    assert.equal(meta.restaurantId, fixture.restaurantId);
    assert.equal(meta.name, fixture.name);
    assert.equal(meta.type, fixture.type);

    for (const [index, table] of (meta.tables || []).entries()) {
      assertAllowedKeys(table, publicTableKeys, `${metaPath}.tables[${index}]`);
      assertNoForbiddenKeys(table, `${metaPath}.tables[${index}]`);
    }
  }
});

test("local seed public menu docs contain only public item fields and numeric prices", () => {
  for (const restaurantId of ["pidhi-madh", "shop-demo"]) {
    const path = `restaurants/${restaurantId}/public/menu`;
    const menu = getRequiredDocument(path);

    assertAllowedKeys(menu, publicMenuKeys, path);
    assertNoForbiddenKeys(menu, path);
    assert.equal(menu.restaurantId, restaurantId);
    assert.ok(Array.isArray(menu.items), `${path}.items must be an array`);

    for (const [index, item] of menu.items.entries()) {
      const itemLabel = `${path}.items[${index}]`;
      assertAllowedKeys(item, publicMenuItemKeys, itemLabel);
      assertNoForbiddenKeys(item, itemLabel);
      assertNumericOrNullPrice(item, itemLabel);
    }
  }
});

test("local seed public offers and ads are display-safe", () => {
  const offerPath = "restaurants/hotel-demo/public/offers";
  const offers = getRequiredDocument(offerPath);
  assertAllowedKeys(offers, publicOffersKeys, offerPath);
  assertNoForbiddenKeys(offers, offerPath);
  for (const [index, item] of (offers.items || []).entries()) {
    const itemLabel = `${offerPath}.items[${index}]`;
    assertAllowedKeys(item, publicOfferItemKeys, itemLabel);
    assertNoForbiddenKeys(item, itemLabel);
  }

  const adsPath = "restaurants/pidhi-madh/public/ads";
  const ads = getRequiredDocument(adsPath);
  assertAllowedKeys(ads, publicAdsKeys, adsPath);
  assertNoForbiddenKeys(ads, adsPath);
  for (const [index, item] of (ads.items || []).entries()) {
    const itemLabel = `${adsPath}.items[${index}]`;
    assertAllowedKeys(item, publicAdItemKeys, itemLabel);
    assertNoForbiddenKeys(item, itemLabel);
    assert.equal(item.status, "approved", `${itemLabel} must be approved-only`);
  }
});

test("pure builders reproduce the local seed public projection contracts", () => {
  for (const fixture of businessFixtures) {
    const route = getRequiredDocument(`publicRoutes/${fixture.slug}`);
    const profile = getRequiredDocument(
      `restaurants/${fixture.restaurantId}/public/profile`,
    );
    const meta = getRequiredDocument(
      `restaurants/${fixture.restaurantId}/public/meta`,
    );

    assert.deepEqual(buildPublicRouteProjection(route), route);
    assert.deepEqual(buildPublicProfileProjection(profile), profile);
    assert.deepEqual(buildPublicMetaProjection(meta), meta);
  }

  for (const restaurantId of ["pidhi-madh", "hotel-demo"]) {
    const offers = getRequiredDocument(
      `restaurants/${restaurantId}/public/offers`,
    );
    assert.deepEqual(buildPublicOffersProjection(offers), offers);
  }

  const ads = getRequiredDocument("restaurants/pidhi-madh/public/ads");
  assert.deepEqual(buildPublicAdsProjection(ads), ads);
});

test("restaurant mixed input builds route, profile and meta allowlists only", () => {
  const mixedRestaurant = {
    id: "restaurant-private-source",
    slug: "  Safe Restaurant  ",
    name: "Safe Restaurant",
    displayName: "Safe Restaurant Display",
    bio: "Public bio",
    city: "Prishtina",
    country: "Kosovo",
    address: {
      street: "Public Street",
      number: "7",
      postalCode: "10000",
      city: "Prishtina",
      ownerUid: "nested-owner",
    },
    phone: "+383 44 111 222",
    website: "https://safe.example/restaurant",
    socialLinks: {
      instagramUrl: "https://instagram.example/safe",
      ownerUid: "nested-owner",
      adminEmail: "admin@example.test",
    },
    images: [
      {
        imageUrl: "https://images.example/safe.jpg",
        alt: "Public image",
        ownerUid: "nested-owner",
      },
    ],
    businessType: "restaurant",
    category: "Restaurant",
    type: "restaurant",
    surface: "profile",
    public: true,
    tableQrEnabled: true,
    tableQrCount: "12",
    tables: [
      {
        id: "table-01",
        number: "2",
        label: "Table 2",
        qrSecret: "private-secret",
        staff: [{ ownerUid: "nested-owner" }],
      },
    ],
    menuStatusBadgeVisible: true,
    ownerUid: "owner-private",
    ownerEmail: "owner@example.test",
    billing: { payment: { customerId: "private" } },
    staff: [{ roles: ["owner"] }],
    crm: { leadId: "lead-private" },
  };

  const route = buildPublicRouteProjection(mixedRestaurant);
  const profile = buildPublicProfileProjection(mixedRestaurant);
  const meta = buildPublicMetaProjection(mixedRestaurant);

  assertAllowedKeys(route, routeKeys, "restaurant route builder");
  assertAllowedKeys(profile, publicProfileKeys, "restaurant profile builder");
  assertAllowedKeys(meta, publicMetaKeys, "restaurant meta builder");
  assertNoForbiddenKeys(route, "restaurant route builder");
  assertNoForbiddenKeys(profile, "restaurant profile builder");
  assertNoForbiddenKeys(meta, "restaurant meta builder");
  assert.equal(route.slug, "safe-restaurant");
  assert.equal(route.type, "business");
  assert.equal(route.surface, "profile");
  assert.equal(route.canonicalPath, "/safe-restaurant");
  assert.equal(route.menuPath, "/safe-restaurant/menu");
  assert.equal(profile.address, "Public Street 7, 10000 Prishtina");
  assert.deepEqual(profile.images, [
    { url: "https://images.example/safe.jpg", alt: "Public image" },
  ]);
  assert.deepEqual(meta.tables, [
    { id: "table-01", number: 2, label: "Table 2" },
  ]);
  assert.equal(meta.tableQrCount, 12);
});

test("shop mixed profile and offer input drops product-owner and private pricing fields", () => {
  const profile = buildPublicProfileProjection({
    id: "shop-private-source",
    publicSlug: "safe-shop",
    name: "Safe Shop",
    businessType: "shop",
    category: "Shopping",
    logoUrl: "https://images.example/shop.jpg",
    productOwnerUid: "product-owner-private",
    ownerEmail: "owner@example.test",
    private: { billingNote: "private" },
  });
  const offers = buildPublicOffersProjection({
    restaurantId: "shop-private-source",
    items: [
      {
        id: "shop-offer-01",
        title: "Public product offer",
        productId: "product-01",
        targetCategory: "Featured",
        price: "19,90 EUR",
        imageUrl: "https://images.example/product.jpg",
        productOwnerUid: "product-owner-private",
        internalMargin: 8.4,
        privatePricing: { wholesale: 5 },
      },
    ],
  });

  assertAllowedKeys(profile, publicProfileKeys, "shop profile builder");
  assertAllowedKeys(offers, publicOffersKeys, "shop offers builder");
  assertAllowedKeys(
    offers.items[0],
    publicOfferItemKeys,
    "shop offer item builder",
  );
  assertNoForbiddenKeys(profile, "shop profile builder");
  assertNoForbiddenKeys(offers, "shop offers builder");
  assert.equal(profile.businessType, "shop");
  assert.equal(offers.items[0].productId, "product-01");
  assert.equal(offers.items[0].targetCategory, "Featured");
  assert.equal(offers.items[0].price, 19.9);
});

test("hotel and travel offer builder keeps public booking display data only", () => {
  const offers = buildPublicOffersProjection({
    restaurantId: "hotel-private-source",
    items: [
      {
        id: "hotel-offer-01",
        title: "Weekend Stay",
        description: "Two public nights",
        city: "Prizren",
        price: "59,50 EUR",
        priceUnit: "per_night",
        bookingUrl: "https://booking.example/weekend",
        features: ["Breakfast", "Parking", { internalNote: "private" }],
        bookingAdminNote: "Call the owner first",
        privateBookingNotes: { ownerUid: "private-owner" },
        leadId: "lead-private",
      },
    ],
  });

  assertAllowedKeys(offers, publicOffersKeys, "hotel offers builder");
  assertAllowedKeys(
    offers.items[0],
    publicOfferItemKeys,
    "hotel offer item builder",
  );
  assertNoForbiddenKeys(offers, "hotel offers builder");
  assert.equal(offers.items[0].price, 59.5);
  assert.equal(offers.items[0].bookingUrl, "https://booking.example/weekend");
  assert.deepEqual(offers.items[0].features, ["Breakfast", "Parking"]);
});

test("ads builder emits approved active display-safe ads only", () => {
  const ads = buildPublicAdsProjection({
    restaurantId: "restaurant-private-source",
    public: true,
    items: [
      {
        id: "approved-01",
        title: "Approved",
        copy: "Public copy",
        status: "approved",
        active: true,
        imageUrl: "https://images.example/approved.jpg",
        ctaUrl: "https://safe.example/offer",
        displayPriority: "3",
        moderatorUid: "moderator-private",
        creatorUid: "creator-private",
        internalComments: ["private"],
        budget: 500,
        privateTargeting: { city: "private" },
      },
      { id: "pending-01", title: "Pending", status: "pending", active: true },
      {
        id: "rejected-01",
        title: "Rejected",
        status: "rejected",
        active: true,
      },
      { id: "draft-01", title: "Draft", status: "draft", active: true },
      {
        id: "inactive-01",
        title: "Inactive",
        status: "approved",
        active: false,
      },
    ],
  });

  assertAllowedKeys(ads, publicAdsKeys, "ads builder");
  assert.equal(ads.items.length, 1);
  assertAllowedKeys(ads.items[0], publicAdItemKeys, "ads item builder");
  assertNoForbiddenKeys(ads, "ads builder");
  assert.equal(ads.items[0].id, "approved-01");
  assert.equal(ads.items[0].status, "approved");
  assert.equal(ads.items[0].displayPriority, 3);
});

test("public restaurant enrichment uses safe offer and approved-only ad projections", async () => {
  const restaurants = [
    {
      id: "restaurant-runtime",
      name: "Runtime Restaurant",
      logoUrl: "https://images.example/restaurant.jpg",
      city: "Prishtina",
      type: "restaurant",
      lat: 42.66,
      lng: 21.16,
    },
    {
      id: "hotel-runtime",
      name: "Runtime Hotel",
      logoUrl: "https://images.example/hotel.jpg",
      city: "Prizren",
      type: "hotel",
      lat: 42.21,
      lng: 20.74,
    },
  ];
  const controller = createRestaurantIdentityRuntimeController({
    state: { restaurants },
    db: {},
    docFn: (_db, ...path) => ({ path: path.join("/") }),
    getDocFn: async (ref) => {
      if (ref.path.endsWith("restaurant-runtime/public/ads")) {
        return {
          exists: () => true,
          data: () => ({
            items: [
              {
                id: "approved-runtime",
                title: "Approved runtime ad",
                status: "approved",
                active: true,
                moderatorUid: "private-moderator",
              },
              {
                id: "pending-runtime",
                title: "Pending runtime ad",
                status: "pending",
                active: true,
              },
            ],
          }),
        };
      }
      if (ref.path.endsWith("hotel-runtime/public/offers")) {
        return {
          exists: () => true,
          data: () => ({
            items: [
              {
                id: "offer-runtime",
                title: "Runtime Stay",
                price: "79,90 EUR",
                bookingAdminNote: "private",
              },
            ],
          }),
        };
      }
      return { exists: () => false, data: () => ({}) };
    },
    normalizeRestaurantType: (value) =>
      String(value || "")
        .trim()
        .toLowerCase(),
  });

  const enriched =
    await controller.enrichRestaurantsWithPublicMeta(restaurants);
  const restaurant = enriched.find((item) => item.id === "restaurant-runtime");
  const hotel = enriched.find((item) => item.id === "hotel-runtime");

  assert.deepEqual(
    restaurant.publicAds.map((item) => item.id),
    ["approved-runtime"],
  );
  assertNoForbiddenKeys(restaurant.publicAds, "runtime public ads");
  assert.equal(restaurant.approvedAdsCount, 1);
  assert.equal(hotel.publicOffers[0].price, 79.9);
  assertNoForbiddenKeys(hotel.publicOffers, "runtime public offers");
});

test("meta builder recursively excludes owner, staff and access state", () => {
  const meta = buildPublicMetaProjection({
    restaurantId: "restaurant-private-source",
    type: "restaurant",
    category: "Restaurant",
    public: true,
    menuVisible: true,
    offersEnabled: true,
    adsEnabled: false,
    tables: [
      {
        id: "table-public",
        label: "Public table",
        waiterAccess: true,
        roles: ["owner"],
        private: { ownerUid: "nested-private" },
      },
    ],
    ownerUid: "owner-private",
    staff: [{ staffRole: "manager" }],
    businessAccess: true,
    roles: ["business"],
    accountState: { billing: "private" },
  });

  assertAllowedKeys(meta, publicMetaKeys, "meta builder");
  assertNoForbiddenKeys(meta, "meta builder");
  assert.deepEqual(meta.tables, [
    { id: "table-public", label: "Public table" },
  ]);
  assert.equal(meta.offersEnabled, true);
  assert.equal(meta.adsEnabled, false);
});

test("projection builders are pure, deterministic and return serializable plain objects", () => {
  const input = deepFreeze({
    id: "deterministic-business",
    slug: "Deterministic Business",
    name: "Deterministic Business",
    public: true,
    tables: [{ id: "table-01", number: "1", ownerUid: "private" }],
    items: [
      {
        id: "item-01",
        title: "Item",
        price: "4,20",
        status: "approved",
        active: true,
        internalNote: "private",
      },
    ],
  });
  const inputSnapshot = JSON.stringify(input);
  const builders = [
    buildPublicRouteProjection,
    buildPublicProfileProjection,
    buildPublicMetaProjection,
    buildPublicOffersProjection,
    buildPublicAdsProjection,
  ];

  for (const builder of builders) {
    const first = builder(input);
    const second = builder(input);
    assert.deepEqual(first, second, `${builder.name} must be deterministic`);
    assert.equal(
      JSON.stringify(input),
      inputSnapshot,
      `${builder.name} must not mutate input`,
    );
    assert.doesNotThrow(() => JSON.stringify(first));
    assertPlainProjection(first, builder.name);
  }
});

test("projection builders tolerate missing and malformed partial fields", () => {
  const malformed = {
    restaurantId: { private: true },
    slug: null,
    address: { ownerUid: "private" },
    tables: [null, "bad", { private: true }],
    items: [null, "bad", { status: "approved" }],
    socialLinks: { instagram: { ownerUid: "private" } },
  };
  const builders = [
    buildPublicRouteProjection,
    buildPublicProfileProjection,
    buildPublicMetaProjection,
    buildPublicOffersProjection,
    buildPublicAdsProjection,
  ];

  for (const builder of builders) {
    assert.doesNotThrow(() => builder(malformed));
    const output = builder(malformed);
    assertNoForbiddenKeys(output, `${builder.name} malformed output`);
    assertPlainProjection(output, `${builder.name} malformed output`);
  }
});

test("menu editor projection does not carry private fields from dirty edit state", async () => {
  const state = {
    user: { uid: "owner-demo" },
    userProfile: {
      restaurantId: "pidhi-madh",
      role: "business",
    },
    restaurants: [],
    menu: {
      items: [
        {
          id: "dirty-menu-item",
          name: "Dirty Source Item",
          price: "5,20",
          ownerUid: "owner-demo",
          ownerEmail: "owner.local@example.test",
          billingNote: "must stay private",
          staffRole: "manager",
          internalNotes: "private",
        },
      ],
    },
    menuModal: {
      mode: "edit",
      item: {
        id: "dirty-menu-item",
        orderIndex: 1,
        ownerUid: "owner-demo",
        ownerEmail: "owner.local@example.test",
        billingNote: "must stay private",
        staffRole: "manager",
        internalNotes: "private",
      },
      status: "",
      loading: false,
      existingImages: [],
      imageFiles: [],
      imageUrlDraft: "",
    },
  };
  const setDocCalls = [];
  const publishCalls = [];

  await saveMenuItemFromModalCore({
    state,
    documentObj: createMenuDocument({
      menuItemName: "Clean Public Item",
      menuItemPrice: "5,20 EUR",
      menuItemCategory: "Contract",
      menuItemType: "food",
      menuItemVisibility: "available",
    }),
    isShopCatalogProfile: () => false,
    getBusinessProfileType: () => "restaurant",
    renderOverlays: () => {},
    normalizeOptionList: normalizeOptionListCore,
    getMenuModalCrop: () => ({ x: 50, y: 50 }),
    uploadCompressedImage: async () => ({ cdnUrl: "" }),
    collection: (_db, ...path) => ({
      id: path.at(-1),
      path: path.join("/"),
      __collectionRef: true,
    }),
    doc: (...args) => ({ id: args.at(-1), path: args.slice(1).join("/") }),
    db: { projectId: "mnyra-local" },
    normalizeMenuType: normalizeMenuTypeCore,
    serverTimestamp: () => "SERVER_TIMESTAMP",
    setDoc: async (ref, payload, options) => {
      setDocCalls.push({ ref, payload, options });
    },
    normalizeMenuItemDoc: normalizeMenuItemDocCore,
    syncMenuCaches: () => {},
    publishMenuToPublic: async (restaurantId, items) => {
      publishCalls.push({ restaurantId, items });
    },
    closeMenuModal: () => {
      state.menuModal.closed = true;
    },
    render: () => {},
  });

  assert.equal(setDocCalls.length, 1);
  assert.equal(publishCalls.length, 1);
  assertNumericOrNullPrice(setDocCalls[0].payload, "saved menu payload");
  assertNoForbiddenKeys(setDocCalls[0].payload, "saved menu payload");
  assertNoForbiddenKeys(publishCalls[0].items[0], "published menu item");
  assert.equal(publishCalls[0].items[0].price, 5.2);
});
