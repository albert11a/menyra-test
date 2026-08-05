import test from "node:test";
import assert from "node:assert/strict";

import { HEART_NAV_ITEMS } from "../apps/mnyra-heart/heart-state.js";
import { canRestoreHeartView, resolveHeartRouteView } from "../apps/mnyra-heart/heart-route-view-resolver.js";

// Heart schreibt die offene Ansicht als "#name" in die Adresse, damit ein
// Neuladen dort bleibt, wo man war. Das haelt nur, solange jede Ansicht ihren
// eigenen Namen auch wiedererkennt - sonst landet man nach dem Neuladen wieder
// auf Start, und genau so war es gemeldet.

for (const item of HEART_NAV_ITEMS) {
  test(`"${item.label}" ueberlebt ein Neuladen`, () => {
    assert.ok(canRestoreHeartView(item.key), `${item.key} wird gar nicht erst in die Adresse geschrieben`);
    const zurueck = resolveHeartRouteView({ search: "", hash: `#${item.key}`, pathname: "/heart" });
    assert.equal(zurueck, item.key, `#${item.key} fuehrt nach dem Neuladen woandershin`);
  });
}

test("was sich nicht zurueckholen laesst, wird nicht in die Adresse geschrieben", () => {
  assert.equal(canRestoreHeartView(""), false);
  assert.equal(canRestoreHeartView("gibtsnicht"), false);
  // Ein Kuerzel zeigt zwar auf eine Ansicht, ist aber nicht ihr Name - es
  // gehoert nicht in die Adresse, sonst stuende dort etwas anderes als das,
  // was offen ist.
  assert.equal(canRestoreHeartView("kunden"), false);
});

test("die Adresse schlaegt weiterhin den Pfad, der Pfad den Rest", () => {
  assert.equal(resolveHeartRouteView({ search: "?view=landing", hash: "#analytics", pathname: "/heart" }), "landing");
  assert.equal(resolveHeartRouteView({ search: "", hash: "#analytics", pathname: "/heart/landings" }), "analytics");
  assert.equal(resolveHeartRouteView({ search: "", hash: "", pathname: "/heart/landings" }), "landing");
});

// Laeufe, Meldungen und Bereiche gibt es nicht mehr. Eine alte Adresse darf
// jetzt nicht mehr irgendwo hinfuehren, sondern faellt auf Start zurueck.
test("alte Adressen geloeschter Bereiche fuehren nach Start", () => {
  for (const alt of ["#runs", "#laeufe", "#incidents", "#meldungen", "#modules", "#bereiche"]) {
    assert.equal(resolveHeartRouteView({ search: "", hash: alt, pathname: "/heart" }), "");
    assert.equal(canRestoreHeartView(alt.slice(1)), false);
  }
});
