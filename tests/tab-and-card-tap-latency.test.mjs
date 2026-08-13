import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const bindUtilsPath = path.join(
  repoRoot,
  "apps",
  "menyra-social",
  "core",
  "app-events",
  "app-events-shell-bind-utils.js"
);

function readBindUtils() {
  return readFileSync(bindUtilsPath, "utf8");
}

function readOpenMainHeaderTab(text) {
  const start = text.indexOf("const openMainHeaderTab");
  assert.ok(start >= 0, "openMainHeaderTab must be findable");
  return text.slice(start, text.indexOf("\n  };", start));
}

// ===========================================================================
// Der Tab-Wechsel darf nicht in zwei Schritten sichtbar werden.
//
// Frueher lagen zwischen dem Umfaerben der Pill und dem neuen Inhalt zwei
// erzwungene Animationsframes. Gemessen waren das 45 bis 68 ms - man sah
// erst die Pill anspringen und danach den Inhalt kommen.
// ===========================================================================

test("the tab switch paints the pill and the content in one go", () => {
  const block = readOpenMainHeaderTab(readBindUtils());
  assert.ok(
    !block.includes("requestAnimationFrame"),
    "the switch must not wait for an animation frame"
  );
  assert.ok(
    !block.includes("setTimeout"),
    "the switch must not wait for a timer either"
  );
  const pillAt = block.indexOf("syncMainHeaderPillState(tab)");
  const stateAt = block.indexOf("setState({");
  assert.ok(pillAt >= 0 && stateAt > pillAt, "the pill is coloured before the rebuild, in the same task");
});

// Warten auf ein Animationsframe ist nach oben offen: ist der Hauptthread
// beschaeftigt, wird daraus beliebig viel Zeit.
test("no frame juggling is left over in the header bindings", () => {
  const text = readBindUtils();
  assert.ok(
    !text.includes("pendingPillTabFrameId"),
    "the frame bookkeeping for the pills must be gone"
  );
});

test("tapping the pill of the tab you are already on does nothing", () => {
  const block = readOpenMainHeaderTab(readBindUtils());
  assert.ok(
    block.includes("if (state.activeTab === tab) return;"),
    "an already active tab must not trigger a rebuild"
  );
});

// ===========================================================================
// "Shiko profilin" und die Karten
//
// Sie hingen an einem reinen "click". Nach dem Scrollen laesst iOS den Klick
// warten oder schluckt ihn - und genau dort steht man, wenn man weit unten in
// einer Liste einen Knopf drueckt. Das erklaert das "manchmal".
// ===========================================================================

test("the marketplace buttons use the shared tap binding, not a bare click", () => {
  const text = readBindUtils();
  const start = text.indexOf('doc.querySelectorAll("[data-marketplace-open-business]")');
  assert.ok(start >= 0, "the marketplace open handler must be findable");
  const block = text.slice(start, text.indexOf("});", text.indexOf("}));", start)) + 3);
  assert.ok(block.includes("bindTap(btn"), "the button must react on the finger lifting");
  assert.ok(
    !/btn\.addEventListener\("click"/.test(block),
    "a bare click listener is what iOS delays after scrolling"
  );
});

test("the marketplace buttons are bound exactly once", () => {
  const text = readBindUtils();
  const start = text.indexOf('doc.querySelectorAll("[data-marketplace-open-business]")');
  const block = text.slice(start, start + 600);
  assert.ok(
    block.includes('bindOnce(btn, "MarketplaceOpenBusiness"'),
    "re-renders must not stack a second binding on the same node"
  );
});

// Die Bindung selbst bleibt, wie sie ist: Loslassen zaehlt, Wischen nicht,
// Maus und Tastatur laufen weiter ueber den Klick.
test("the shared tap binding still covers mouse and keyboard", () => {
  const tapUtils = readFileSync(
    path.join(repoRoot, "apps", "menyra-social", "core", "common", "tap-bind-utils.js"),
    "utf8"
  );
  assert.ok(tapUtils.includes('element.addEventListener("click", onClick)'), "the click stays for mouse and keyboard");
  assert.ok(tapUtils.includes("TAP_MOVE_TOLERANCE_PX"), "a swipe over the button must not count as a tap");
  assert.ok(tapUtils.includes("TAP_CLICK_SUPPRESS_MS"), "the trailing ios click must not fire a second time");
});
