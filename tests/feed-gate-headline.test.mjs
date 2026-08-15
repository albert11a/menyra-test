import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const controllerPath = path.join(
  repoRoot,
  "apps",
  "menyra-social",
  "core",
  "feed",
  "feed-view-orchestration-controller.js"
);

function readController() {
  return fs.readFileSync(controllerPath, "utf8");
}

// Die Ueberschrift im blauen Standort-Bereich ist die urspruengliche: drei
// ganze Saetze wechseln durch, darunter steht die Stadtzeile fest.
test("the gate headline cycles the three original lines", () => {
  const text = readController();
  ["ZBULO SPOTET.", "GJEJ OFERTA.", "HAP MENYTE."].forEach((line) => {
    assert.ok(text.includes(`"${line}"`), `the albanian slider must contain ${line}`);
  });
  assert.ok(text.includes('topCityLine: "NE QYTETIN TEND."'), "the fixed city line must be there");
  ["DISCOVER SPOTS.", "OPEN MENUS."].forEach((line) => {
    assert.ok(text.includes(`"${line}"`), `the english slider must contain ${line}`);
  });
  ["OTKRIJ MESTA.", "OTVORI MENIJE."].forEach((line) => {
    assert.ok(text.includes(`"${line}"`), `the serbian slider must contain ${line}`);
  });
});

test("the gate headline markup is the original slider", () => {
  const text = readController();
  const start = text.indexOf('<div class="loc-title">');
  assert.ok(start >= 0, "the gate title markup must be findable");
  const block = text.slice(start, start + 700);
  assert.ok(block.includes("text-slider-wrapper"), "the slider wrapper must be there");
  assert.ok(block.includes("text-slide-item"), "the slider items must be there");
  assert.ok(block.includes("topSliderItems"), "the slider must read the original copy");
  assert.ok(block.includes("topCityLine"), "the fixed city line must be rendered");
});

// Die Zwischenloesung (ein Wort, auf die Breite der Zeile darunter vergroessert)
// ist vollstaendig zurueckgebaut - kein Rest darf stehenbleiben, sonst wirken
// tote Regeln oder totes Skript auf die Seite.
test("nothing of the resized single word headline is left behind", () => {
  const text = readController();
  [
    "loc-title-rotator",
    "loc-title-tail",
    "loc-title-lead",
    "data-feed-gate-rotator",
    "topRotatingWords",
    "topTailLine",
    "topLeadWord",
    "syncFeedGateHeadlineRotatorDom",
    "ensureFeedGateHeadlineRotatorRemeasure",
    "feedGateRotatorWidth",
    "feed-gate-rotator-height"
  ].forEach((leftover) => {
    assert.ok(!text.includes(leftover), `${leftover} must be gone`);
  });
});

test("the slider stacks its lines so the headline cannot jump", () => {
  const text = readController();
  const start = text.indexOf(".text-slider-wrapper {");
  assert.ok(start >= 0, "the slider wrapper rule must exist");
  const wrapper = text.slice(start, text.indexOf("}", start));
  assert.ok(wrapper.includes("overflow: hidden"), "the wrapper must clip the sliding lines");
  assert.ok(wrapper.includes("height: 1.25em"), "the wrapper must reserve one line of height");

  const itemStart = text.indexOf(".text-slide-item {");
  assert.ok(itemStart >= 0, "the slider item rule must exist");
  const item = text.slice(itemStart, text.indexOf("}", itemStart));
  assert.ok(item.includes("position: absolute"), "the lines must stack on top of each other");
  assert.ok(item.includes("feedLocationTextFadeSlide 9s"), "the lines must share the nine second cycle");

  ["nth-child(1) { animation-delay: 0s", "nth-child(2) { animation-delay: 3s", "nth-child(3) { animation-delay: 6s"]
    .forEach((delay) => {
      assert.ok(text.includes(delay), `the slider needs the delay ${delay}`);
    });
});

// Ueber dem Feed steht der Name der Stadt, nicht mehr "Qa ka t're?".
test("the feed headline shows the city name and the fixed subtitle", () => {
  const text = readController();
  assert.ok(!text.includes("Qa ka t're"), "the old headline must be gone");
  assert.ok(
    text.includes("const resolveFeedHeadlineCityName"),
    "the city name resolver must exist"
  );
  assert.ok(
    text.includes("resolveFeedHeadlineCityName())}</h1>"),
    "the headline must render the resolved city name"
  );
  assert.ok(
    text.includes('escapeHtmlFn("Bëhu një me qytetin tënd.")'),
    "the subtitle must read Behu nje me qytetin tend."
  );
  assert.ok(
    text.includes("data-feed-city-headline"),
    "the headline needs a hook so a city change can patch it in place"
  );
});

// ===========================================================================
// Das Seitenende des Gates.
//
// Die weisse Kapitel-Flaeche hob das Polster des Bentos oben und an den Seiten
// auf, unten aber nicht: dort blieben 2rem des Bentos (#f8fafc) unter dem
// Weiss stehen. Genau diese Kante sah man am Seitenende als Farbunterschied.
// ===========================================================================

test("the white chapter surface reaches the bottom edge of the bento", () => {
  const text = readController();
  // Eine Zahl, zwei Leser: das Bento polstert damit, die Flaeche zieht es ab.
  // Zwei getrennte Zahlen waeren genau die Art Fehler, die man erst auf dem
  // Geraet sieht.
  assert.ok(text.includes("padding: 2.35rem 1.25rem var(--feed-gate-bento-pad-bottom);"));
  assert.ok(text.includes("margin: -2.35rem -1.25rem calc(-1 * var(--feed-gate-bento-pad-bottom));"));
  assert.ok(text.includes("padding: 4.6rem 0 var(--feed-gate-bento-pad-bottom);"));
  // Der Abzug hebt das Polster genau auf - die Hoehe der Seite aendert sich
  // dadurch nicht.
  const abzug = text.indexOf("calc(-1 * var(--feed-gate-bento-pad-bottom))");
  const polster = text.indexOf("padding: 4.6rem 0 var(--feed-gate-bento-pad-bottom);");
  assert.ok(abzug > -1 && polster > abzug, "Abzug und Polster gehoeren in dieselbe Regel");
});

// Nur das Gate polstert unten. Im Feed selbst traegt das Bento kein Polster,
// und dann darf die weisse Flaeche auch keines abziehen - sonst zoege sie an
// einer Stelle, an der nichts steht.
test("only the gate carries that padding, the feed itself does not", () => {
  const text = readController();
  assert.ok(text.includes("--feed-gate-bento-pad-bottom: 0px;"), "der Grundwert ist null");
  const gateOnly = text.indexOf('#feedLocationGate:not([data-location-screen-mode="feed-stage"]) {\n            --feed-gate-bento-pad-bottom: 2rem;');
  assert.ok(gateOnly > -1, "die 2rem stehen nur in der Gate-Regel");
});
