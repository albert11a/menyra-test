import assert from "node:assert/strict";
import test from "node:test";

import {
  createFeedSearchMapRouteRuntime
} from "../apps/menyra-social/core/app-shell/feed-search-map-runtime.js";

test("feed runtime preloads business profile open flow", () => {
  const calls = [];
  const runtime = createFeedSearchMapRouteRuntime({
    feed: {
      renderFeedView: () => "feed"
    },
    discovery: {
      preloadProfileOpenFlow: () => calls.push("profile-open-flow")
    }
  });

  runtime.routeRuntimes.feed.preload();

  assert.deepEqual(calls, ["profile-open-flow"]);
  assert.equal(runtime.routeRuntimes.feed.render(), "feed");
});
