import assert from "node:assert/strict";
import test from "node:test";

import { createPublicProfileDirectEntryController } from "../apps/menyra-social/core/profile/public-profile-direct-entry-controller.js";

test("direct public profile entry records a pending target without seeding profileView", () => {
  const state = {
    activeTab: "feed",
    profileView: null,
    profileModal: { open: false, profile: null },
    profileTopTab: "profile",
    profileContentTab: "posts",
    profileViewMode: "grid",
    profilePostMenuId: null,
    profileBackTab: "feed",
    drawerOpen: false,
    restaurants: [],
    bootstrapRestaurantPreview: [],
    menu: {
      restaurantId: "",
      items: [],
      loading: false,
      error: "",
      source: "public",
      truthState: "unknown"
    },
    focus: {
      restaurantId: "",
      items: [],
      loading: false,
      error: "",
      truthSource: "public-menu",
      truthState: "unknown"
    }
  };
  const controller = createPublicProfileDirectEntryController({
    state,
    resolveVisibleProfileSurface: () => ({ status: "loading" })
  });

  const entry = controller.seedPendingDirectEntry({
    pendingProfileRestaurantId: "casarita",
    pendingProfileTopTab: "menu",
    pendingProfileAccessSource: "qr",
    pendingProfileTableNumber: 7
  });

  assert.equal(entry.restaurantId, "casarita");
  assert.equal(state.profileView, null);
  assert.equal(state.activeTab, "profile");
  assert.equal(state.profileTopTab, "menu");
  assert.equal(state.profileContentTab, "menu");
  assert.equal(state.__pendingProfileTarget.restaurantId, "casarita");
  assert.equal(state.__pendingProfileTarget.targetKey, "business:casarita");
  assert.equal(state.__webDirectEntry.active, true);
  assert.equal(state.__webDirectEntry.menuAccessSource, "qr");
  assert.equal(state.__webDirectEntry.tableNumber, 7);
});
