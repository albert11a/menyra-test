import assert from "node:assert/strict";
import test from "node:test";

import {
  createCanonicalPublicBusinessContextCore,
  getCanonicalPublicBusinessLoadIds,
  isCanonicalPublicBusinessTarget,
  mergeStableCanonicalProfileShellCore
} from "../apps/menyra-social/core/profile/canonical-public-business-context-utils.js";

test("slug-only route creates resolving context without treating slug as canonical id", () => {
  const context = createCanonicalPublicBusinessContextCore({
    inputSlug: "moka-coffee",
    routeSource: "slug"
  });

  assert.equal(context.canonicalRestaurantId, "");
  assert.equal(context.inputSlug, "moka-coffee");
  assert.equal(context.routeSource, "slug");
  assert.equal(context.profileStatus, "resolving");
  assert.equal(isCanonicalPublicBusinessTarget(context, "moka-coffee"), true);
});

test("public route payload promotes canonical restaurant id above route alias", () => {
  const context = createCanonicalPublicBusinessContextCore({
    inputSlug: "casa-rita",
    routeSource: "alias",
    routePayload: {
      restaurantId: "casa-rita",
      canonicalRestaurantId: "Lzm6RpNu3ErSDtGCHxpi",
      publicSlug: "casarita",
      businessSnapshot: { restaurantId: "Lzm6RpNu3ErSDtGCHxpi" }
    }
  });

  assert.equal(context.canonicalRestaurantId, "Lzm6RpNu3ErSDtGCHxpi");
  assert.equal(context.profileStatus, "ready");
  assert.deepEqual(getCanonicalPublicBusinessLoadIds(context).slice(0, 2), [
    "Lzm6RpNu3ErSDtGCHxpi",
    "casa-rita"
  ]);
});

test("qr route context preserves canonical id and table context", () => {
  const context = createCanonicalPublicBusinessContextCore({
    routeContext: {
      pendingProfileRestaurantId: "Lzm6RpNu3ErSDtGCHxpi",
      pendingProfileAccessSource: "qr",
      pendingProfileTableNumber: 7,
      publicBusiness: {
        routeId: "Lzm6RpNu3ErSDtGCHxpi",
        accessSource: "qr",
        tableNumber: 7,
        isQr: true
      }
    }
  });

  assert.equal(context.canonicalRestaurantId, "Lzm6RpNu3ErSDtGCHxpi");
  assert.equal(context.routeSource, "qr");
  assert.equal(context.isQr, true);
  assert.equal(context.tableNumber, 7);
  assert.equal(context.accessSource, "qr");
});

test("business user context can provide canonical restaurant id", () => {
  const context = createCanonicalPublicBusinessContextCore({
    userProfile: {
      uid: "owner-1",
      restaurantId: "restaurant-from-user"
    },
    routeSource: "businessUser"
  });

  assert.equal(context.canonicalRestaurantId, "restaurant-from-user");
  assert.equal(context.routeSource, "businessuser");
  assert.equal(context.profileStatus, "ready");
});

test("context tracks independent profile menu and posts statuses", () => {
  const context = createCanonicalPublicBusinessContextCore({
    profile: { canonicalRestaurantId: "restaurant-a" },
    profileStatus: "ready",
    menuStatus: "loading",
    postsStatus: "empty",
    lastStableMenuData: [{ id: "menu-1" }],
    lastStablePostsData: []
  });

  assert.equal(context.profileStatus, "ready");
  assert.equal(context.menuStatus, "loading");
  assert.equal(context.postsStatus, "empty");
  assert.deepEqual(context.lastStableMenuData, [{ id: "menu-1" }]);
  assert.deepEqual(context.lastStablePostsData, []);
});

test("stable shell merge keeps previous header data while canonical load is still partial", () => {
  const currentProfile = {
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    name: "Stable Name",
    avatar: "stable-logo.png",
    titleImageUrl: "stable-cover.jpg",
    followers: 12
  };
  const incomingProfile = {
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    name: "",
    truthState: "loading"
  };

  const merged = mergeStableCanonicalProfileShellCore(currentProfile, incomingProfile, {
    canonicalRestaurantId: "restaurant-a"
  });

  assert.equal(merged.name, "Stable Name");
  assert.equal(merged.avatar, "stable-logo.png");
  assert.equal(merged.titleImageUrl, "stable-cover.jpg");
  assert.equal(merged.followers, 12);
});

test("stable shell merge lets canonical complete data win", () => {
  const merged = mergeStableCanonicalProfileShellCore({
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    name: "Old Name",
    avatar: "old-logo.png"
  }, {
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    name: "Canonical Name",
    avatar: "canonical-logo.png"
  }, {
    canonicalRestaurantId: "restaurant-a"
  });

  assert.equal(merged.name, "Canonical Name");
  assert.equal(merged.avatar, "canonical-logo.png");
});

test("different canonical profile does not inherit old shell data", () => {
  const incoming = {
    restaurantId: "restaurant-b",
    canonicalRestaurantId: "restaurant-b",
    name: ""
  };

  const merged = mergeStableCanonicalProfileShellCore({
    restaurantId: "restaurant-a",
    canonicalRestaurantId: "restaurant-a",
    name: "Old Name"
  }, incoming, {
    canonicalRestaurantId: "restaurant-b"
  });

  assert.equal(merged, incoming);
});
