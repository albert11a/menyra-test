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

// ===========================================================================
// Der Zurueck-Knopf des Browsers
//
// Ein Wechsel ueber den Drawer, eine Panel-Kachel oder die Offerten-Karte
// schrieb die Adresse frueher nur um. Der vorige Tab verschwand damit spurlos
// aus dem Verlauf: wer im Panel auf "Ofertat" ging und dann zurueck drueckte,
// landete nicht im Panel, sondern dort, wo er VOR dem Panel war.
// ===========================================================================

function readNavHandler(text) {
  const start = text.indexOf('doc.querySelectorAll("[data-nav]")');
  assert.ok(start >= 0, "the nav handler must be findable");
  return text.slice(start, text.indexOf('doc.querySelectorAll("[data-marketplace-open-business]")', start));
}

test("a tab change through data-nav leaves a step in the browser history", () => {
  const block = readNavHandler(readBindUtils());
  const pushAt = block.indexOf('state.__nextRouteHistoryMode = "push";');
  assert.ok(pushAt >= 0, "the tab change must ask for a history step");
  const stateAt = block.indexOf("setState({", pushAt);
  assert.ok(stateAt > pushAt, "it must ask before the rebuild reads the flag");
});

// Der eigene Profil-Weg laeuft nicht ueber setState, sondern ueber den
// Profil-Oeffner - der bringt seinen eigenen Verlaufsschritt mit
// (queueProfileHistoryPush). Eine zweite Anforderung davor waere doppelt.
test("the own-profile path is left to the profile opener", () => {
  const block = readNavHandler(readBindUtils());
  const profileAt = block.indexOf("openOwnBusinessProfile({ showBack: false");
  const pushAt = block.indexOf('state.__nextRouteHistoryMode = "push";');
  assert.ok(profileAt >= 0 && pushAt > profileAt, "the flag must sit after the own-profile branch has returned");
});

// ===========================================================================
// Die Bilder der Kennzahl-Reihe im Panel
//
// Ein Neuaufbau setzt frische <img> ein, und der Browser baut jedes Bild neu
// auf. Beim Umschalten der Bento-Seiten (Funksionet/Analitika/Opsionet) aendert
// sich an der Reihe aber gar nichts - man sah nur das Flackern.
// ===========================================================================

function readShellController() {
  return readFileSync(
    path.join(repoRoot, "apps", "menyra-social", "core", "app-shell", "app-shell-runtime-controller.js"),
    "utf8"
  );
}

test("the panel metric row survives a rebuild when it says the same thing", () => {
  const text = readShellController();
  // Gemerkt wird VOR dem Austausch ...
  const merken = text.indexOf("const reuseMetricRow = preserveMainScroll");
  assert.ok(merken > -1, "der alte Knoten muss gemerkt werden");
  // Gesucht ist die Stelle, an der ausgetauscht WIRD - nicht die, an der die
  // Funktion dafuer steht.
  const austausch = text.indexOf("headerBlieb = applyAppHtmlKeepingHeader(appEl, nextHtml)");
  assert.ok(austausch > merken, "gemerkt wird vor dem Austausch, sonst ist er schon weg");
  // ... und danach wieder eingehaengt.
  const einhaengen = text.indexOf("nextMetricRow.replaceWith(reuseMetricRow)");
  assert.ok(einhaengen > austausch, "eingehaengt wird nach dem Austausch");
  // Verglichen wird der Fingerabdruck, nicht das Markup: im Dokument stehen
  // daran schon Laufzeit-Spuren (ein Bild, das nicht lud, hat sich verborgen).
  const block = text.slice(text.indexOf("if (reuseMetricRow && reuseMetricRowSignature)"), einhaengen);
  assert.ok(block.includes('getAttribute("data-dashboard-metrics")'), block);
  assert.ok(block.includes("=== reuseMetricRowSignature"), block);
  assert.ok(block.includes("nextMetricRow !== reuseMetricRow"), block);
});
