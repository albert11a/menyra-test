import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeMenuItemDocCore } from "../apps/menyra-social/core/menu/menu-doc-normalize-utils.js";
import {
  normalizeMenuTypeCore,
  normalizeOptionListCore,
} from "../apps/menyra-social/core/menu/menu-input-utils.js";
import { saveMenuItemFromModalCore } from "../apps/menyra-social/core/menu/menu-save-utils.js";

const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const seed = JSON.parse(
  await readFile(resolve(repoRoot, "seed/data/mnyra-local-seed.json"), "utf8"),
);

const documentsByPath = new Map(
  (seed.documents || []).map((document) => [document.path, document.data || {}]),
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
  "approvedByUid",
  "billing",
  "billingNote",
  "businessAccess",
  "ceoPath",
  "contactEmail",
  "createdByUid",
  "crm",
  "email",
  "internalNote",
  "internalNotes",
  "leadId",
  "leadSource",
  "loginEmail",
  "moderationNotes",
  "ownerEmail",
  "ownerUid",
  "password",
  "payment",
  "payout",
  "private",
  "rejectedByUid",
  "reviewedByUid",
  "role",
  "roles",
  "socialEmail",
  "staff",
  "staffRole",
  "staffStatus",
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
  "avatarUrl",
  "bio",
  "businessType",
  "category",
  "city",
  "country",
  "coverUrl",
  "description",
  "instagram",
  "instagramUrl",
  "logoUrl",
  "name",
  "phone",
  "public",
  "restaurantId",
  "slug",
  "tiktok",
  "tiktokUrl",
  "type",
]);

const publicMetaKeys = new Set([
  "address",
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
  "name",
  "phone",
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

const publicOffersKeys = new Set(["items", "public", "restaurantId"]);
const publicOfferItemKeys = new Set([
  "city",
  "description",
  "id",
  "imageUrl",
  "price",
  "title",
]);

const publicAdsKeys = new Set(["items", "public", "restaurantId"]);
const publicAdItemKeys = new Set([
  "active",
  "copy",
  "ctaUrl",
  "displayPriority",
  "expiresAt",
  "id",
  "imageUrl",
  "mediaUrl",
  "publishedAt",
  "status",
  "title",
]);

function getRequiredDocument(path) {
  const data = documentsByPath.get(path);
  assert.ok(data, `missing seed document ${path}`);
  return data;
}

function assertAllowedKeys(value, allowedKeys, label) {
  const extraKeys = Object.keys(value || {}).filter((key) => !allowedKeys.has(key));
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
