import test from "node:test";
import assert from "node:assert/strict";

import {
  estimateTravelCore,
  formatDistanceLabelCore,
  formatTravelLabelCore,
  hasFiniteCoordsCore,
  haversineDistanceMetersCore
} from "../apps/menyra-social/core/destinations/destination-distance-core.js";

test("haversineDistanceMetersCore computes plausible distances", () => {
  // Velipoje Zentrum -> Shkodra: Luftlinie ~20 km
  const meters = haversineDistanceMetersCore(41.8734, 19.4231, 42.0683, 19.5126);
  assert.ok(meters > 18000 && meters < 26000, `unexpected distance ${meters}`);
  assert.equal(haversineDistanceMetersCore(41.87, 19.42, 41.87, 19.42), 0);
  assert.equal(haversineDistanceMetersCore(null, 19.42, 41.87, 19.42), null);
});

test("formatDistanceLabelCore formats meters and kilometers", () => {
  assert.equal(formatDistanceLabelCore(178), "180 m");
  assert.equal(formatDistanceLabelCore(4), "10 m");
  assert.equal(formatDistanceLabelCore(1230), "1.2 km");
  assert.equal(formatDistanceLabelCore(27400), "27 km");
  assert.equal(formatDistanceLabelCore(NaN), "");
});

test("estimateTravelCore picks walk for short and drive for long distances", () => {
  assert.deepEqual(estimateTravelCore(160), { mode: "walk", minutes: 2 });
  assert.deepEqual(estimateTravelCore(12000), { mode: "drive", minutes: 20 });
  assert.equal(estimateTravelCore(-1), null);
});

test("formatTravelLabelCore uses provided labels", () => {
  assert.equal(
    formatTravelLabelCore(160, { walk: "min në këmbë", drive: "min me makinë" }),
    "2 min në këmbë"
  );
  assert.equal(
    formatTravelLabelCore(12000, { walk: "min në këmbë", drive: "min me makinë" }),
    "20 min me makinë"
  );
});

test("hasFiniteCoordsCore validates coordinates", () => {
  assert.equal(hasFiniteCoordsCore({ lat: 41.8, lng: 19.4 }), true);
  assert.equal(hasFiniteCoordsCore({ lat: "41.8", lng: "19.4" }), true);
  assert.equal(hasFiniteCoordsCore({ lat: null, lng: 19.4 }), false);
  assert.equal(hasFiniteCoordsCore(null), false);
});
