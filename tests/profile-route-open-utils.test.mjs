import assert from "node:assert/strict";
import test from "node:test";

import { isPendingProfileAlreadyOpenCore } from "../apps/menyra-social/core/profile/profile-route-open-utils.js";

test("hydrated canonical public profile short-circuits duplicate direct route open", () => {
  const casaritaId = "Lzm6RpNu3ErSDtGCHxpi";

  assert.equal(isPendingProfileAlreadyOpenCore({
    pendingProfileRestaurantId: "casarita",
    currentProfileRestaurantId: casaritaId,
    currentProfileCanonicalRestaurantId: casaritaId,
    currentProfilePublicSlug: "casarita",
    currentProfileLandingSlug: "casarita",
    currentProfileHandle: "casarita",
    currentProfileTruthState: "stable",
    currentRoutePayload: {
      owner: "web-direct",
      routeFirst: true,
      restaurantId: "casarita",
      canonicalRestaurantId: casaritaId,
      identity: {
        publicSlug: "casarita",
        landingSlug: "casarita",
        handle: "casarita"
      },
      businessSnapshot: {
        restaurantId: casaritaId,
        identity: {
          publicSlug: "casarita",
          landingSlug: "casarita",
          handle: "casarita"
        }
      }
    }
  }), true);
});

test("plain loading public profile does not short-circuit duplicate open guard", () => {
  const casaritaId = "Lzm6RpNu3ErSDtGCHxpi";

  assert.equal(isPendingProfileAlreadyOpenCore({
    pendingProfileRestaurantId: "casarita",
    currentProfileRestaurantId: casaritaId,
    currentProfileCanonicalRestaurantId: casaritaId,
    currentProfilePublicSlug: "casarita",
    currentProfileTruthState: "loading"
  }), false);
});
