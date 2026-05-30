import assert from "node:assert/strict";
import test from "node:test";

import { applyPendingRouteStateCore } from "../apps/menyra-social/core/push/push-route-query-utils.js";

test("pending route application replaces stale business route truth with app route truth", () => {
  const current = {
    pendingProfileRestaurantId: "old-business",
    pendingProfileTopTab: "menu",
    pendingProfileAccessSource: "qr",
    pendingProfileTableNumber: 4,
    pendingUserRouteId: "",
    pendingUserContentTab: "",
    pendingProfileHandled: true,
    pendingInitialTab: "profile"
  };

  const applied = applyPendingRouteStateCore({
    current,
    routeState: {
      pendingProfileRestaurantId: "",
      pendingProfileTopTab: "",
      pendingProfileAccessSource: "",
      pendingProfileTableNumber: 0,
      pendingUserRouteId: "",
      pendingUserContentTab: "",
      pendingInitialTab: "feed"
    }
  });

  assert.equal(applied.changed, true);
  assert.equal(applied.next.pendingProfileRestaurantId, "");
  assert.equal(applied.next.pendingProfileTopTab, "");
  assert.equal(applied.next.pendingProfileAccessSource, "");
  assert.equal(applied.next.pendingProfileTableNumber, 0);
  assert.equal(applied.next.pendingUserRouteId, "");
  assert.equal(applied.next.pendingUserContentTab, "");
  assert.equal(applied.next.pendingProfileHandled, false);
  assert.equal(applied.next.pendingInitialTab, "feed");
});

test("pending route application replaces stale user route truth with business route truth", () => {
  const applied = applyPendingRouteStateCore({
    current: {
      pendingProfileRestaurantId: "",
      pendingUserRouteId: "old-user",
      pendingUserContentTab: "media",
      pendingProfileHandled: true
    },
    routeState: {
      pendingProfileRestaurantId: "new-business",
      pendingProfileTopTab: "menu",
      pendingProfileAccessSource: "qr",
      pendingProfileTableNumber: 8
    }
  });

  assert.equal(applied.changed, true);
  assert.equal(applied.next.pendingProfileRestaurantId, "new-business");
  assert.equal(applied.next.pendingProfileTopTab, "menu");
  assert.equal(applied.next.pendingProfileAccessSource, "qr");
  assert.equal(applied.next.pendingProfileTableNumber, 8);
  assert.equal(applied.next.pendingUserRouteId, "");
  assert.equal(applied.next.pendingUserContentTab, "");
  assert.equal(applied.next.pendingProfileHandled, false);
});

test("pending route application replaces stale business route truth with user route truth", () => {
  const applied = applyPendingRouteStateCore({
    current: {
      pendingProfileRestaurantId: "old-business",
      pendingProfileTopTab: "menu",
      pendingProfileAccessSource: "qr",
      pendingProfileTableNumber: 2,
      pendingUserRouteId: "",
      pendingUserContentTab: ""
    },
    routeState: {
      pendingUserRouteId: "new-user",
      pendingUserContentTab: "media"
    }
  });

  assert.equal(applied.changed, true);
  assert.equal(applied.next.pendingProfileRestaurantId, "");
  assert.equal(applied.next.pendingProfileTopTab, "");
  assert.equal(applied.next.pendingProfileAccessSource, "");
  assert.equal(applied.next.pendingProfileTableNumber, 0);
  assert.equal(applied.next.pendingUserRouteId, "new-user");
  assert.equal(applied.next.pendingUserContentTab, "media");
  assert.equal(applied.next.pendingProfileHandled, false);
});
