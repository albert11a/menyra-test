import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const controllerSource = readFileSync(
  path.join(path.resolve(import.meta.dirname, ".."), "apps", "menyra-social", "core", "analytics", "analytics-view-controller.js"),
  "utf8"
);

// ===========================================================================
// Die Analitika steht an zwei Stellen: als eigener Tab und als Seite im Bento
// des Panels. Im Panel ist activeTab "dashboard" - eine Bindung, die auf den
// Tab-Namen "analytics" prueft, haette dort jeden Klick auf den
// Zeitraum-Filter verschluckt. Gefragt wird deshalb nach der Ansicht.
// ===========================================================================

test("the analytics handlers key off their own view, not off the tab name", () => {
  const start = controllerSource.indexOf("function bindDelegatedEvents");
  assert.ok(start > -1, "die Bindung muss auffindbar sein");
  const block = controllerSource.slice(start, controllerSource.indexOf("function scheduleAfterRenderBind", start));
  assert.ok(
    block.includes('closest?.("[data-analytics-root]")'),
    "die Bindung muss am Rahmen der Ansicht haengen"
  );
  assert.equal(
    block.includes('!== "analytics"'),
    false,
    "eine Pruefung auf den Tab-Namen sperrt die Analitika im Panel aus"
  );
});

// Und der Rahmen, nach dem gefragt wird, muss auch wirklich da sein.
test("the analytics view carries that very marker", () => {
  assert.ok(controllerSource.includes("data-analytics-root"));
});
