import assert from "node:assert/strict";
import test from "node:test";

import { normalizeMenuItemDocCore } from "../apps/menyra-social/core/menu/menu-doc-normalize-utils.js";
import { normalizeMenuTypeCore, normalizeOptionListCore } from "../apps/menyra-social/core/menu/menu-input-utils.js";
import { saveMenuItemFromModalCore } from "../apps/menyra-social/core/menu/menu-save-utils.js";

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
    }
  };
}

test("menu item normalization coerces editor price strings to numbers", () => {
  const item = normalizeMenuItemDocCore({
    id: "menu-price-001",
    name: "Local Plate",
    category: "Lunch",
    price: "6,90 EUR"
  }, "menu-price-001");

  assert.equal(item.price, 6.9);
  assert.equal(typeof item.price, "number");
});

test("menu editor save persists a numeric price and publishes numeric public items", async () => {
  const state = {
    user: { uid: "owner-demo" },
    userProfile: {
      restaurantId: "pidhi-madh",
      role: "business"
    },
    restaurants: [],
    menu: {
      items: []
    },
    menuModal: {
      mode: "create",
      item: null,
      status: "",
      loading: false,
      existingImages: [],
      imageFiles: [],
      imageUrlDraft: ""
    }
  };
  const documentObj = createMenuDocument({
    menuItemName: "Number Price Contract Plate",
    menuItemPrice: "7,50 EUR",
    menuItemCategory: "Contract",
    menuItemType: "food",
    menuItemVisibility: "available"
  });
  const setDocCalls = [];
  const publishCalls = [];
  const syncCalls = [];

  await saveMenuItemFromModalCore({
    state,
    documentObj,
    isShopCatalogProfile: () => false,
    getBusinessProfileType: () => "restaurant",
    renderOverlays: () => {},
    normalizeOptionList: normalizeOptionListCore,
    getMenuModalCrop: () => ({ x: 50, y: 50 }),
    uploadCompressedImage: async () => ({ cdnUrl: "" }),
    collection: (_db, ...path) => ({
      id: path.at(-1),
      path: path.join("/"),
      __collectionRef: true
    }),
    doc: (...args) => {
      if (args.length === 1 && args[0]?.__collectionRef) {
        return { id: "generated-menu-price", path: `${args[0].path}/generated-menu-price` };
      }
      return { id: args.at(-1), path: args.slice(1).join("/") };
    },
    db: { projectId: "mnyra-local" },
    normalizeMenuType: normalizeMenuTypeCore,
    serverTimestamp: () => "SERVER_TIMESTAMP",
    setDoc: async (ref, payload, options) => {
      setDocCalls.push({ ref, payload, options });
    },
    normalizeMenuItemDoc: normalizeMenuItemDocCore,
    syncMenuCaches: (restaurantId, items, options) => {
      syncCalls.push({ restaurantId, items, options });
    },
    publishMenuToPublic: async (restaurantId, items) => {
      publishCalls.push({ restaurantId, items });
    },
    closeMenuModal: () => {
      state.menuModal.closed = true;
    },
    render: () => {}
  });

  assert.equal(setDocCalls.length, 1);
  assert.equal(setDocCalls[0].payload.price, 7.5);
  assert.equal(typeof setDocCalls[0].payload.price, "number");
  assert.equal(syncCalls.length, 1);
  assert.equal(syncCalls[0].items[0].price, 7.5);
  assert.equal(publishCalls.length, 1);
  assert.equal(publishCalls[0].items[0].price, 7.5);
  assert.equal(state.menuModal.closed, true);
});
