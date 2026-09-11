// Die Zeichen der Hauptanalyse.
//
// Sie sind inline und nicht aus dem Lucide-Paket geladen, aus zwei
// Gruenden: Das Paket sind 352 KB vor dem ersten Wort auf einer Seite, die
// ein Patient im Mobilfunk oeffnet - und ein Zeichen, das an einem extern
// geladenen Script haengt, ist LEER, wenn das Script nicht kommt. Genau
// das ist im Ofertat-Tab passiert (tests/voucher-icon-coverage.test.mjs).
//
// Daraus folgen die drei Pruefungen hier:
//
//   1. Jeder Name, den Aufbau oder Ablauf nennt, liegt inline vor.
//      Sonst bleibt an dieser Stelle ein Loch.
//   2. Jeder inline liegende Pfad ist Zeichen fuer Zeichen der aus dem
//      Paket. Ein von Hand nachgemaltes Lucide-Icon steht neben den
//      echten wie ein Fremdkoerper - und niemand sieht es, weil niemand
//      zwei Pfade nebeneinanderlegt.
//   3. Keine Zeichen, die niemand benutzt. Jedes kostet Auslieferung.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import { IKONEN, IKONE_RAHMEN } from "../apps/lifeskin-astra/astra-ikona.js";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const ASTRA_JS = lies("apps/lifeskin-astra/astra.js");
const ASTRA_HTML = lies("apps/lifeskin-astra/index.html");
const ASTRA_CSS = lies("apps/lifeskin-astra/astra.css");

// Alle Namen, die irgendwo verlangt werden.
//
// Zwei Quellen, beide eindeutig: die Platzhalter im Aufbau und die
// Tabelle ZEICHEN im Ablauf. Ein drittes Muster ueber den uebrigen
// Quelltext hat hier schon "step-mark" und "erledigt" fuer Zeichennamen
// gehalten - deshalb steht jeder Name, den der Ablauf braucht, in der
// Tabelle und nirgends sonst.
function verlangteNamen() {
  const namen = new Set();
  for (const m of ASTRA_HTML.matchAll(/data-ikona="([a-z0-9-]+)"/g)) namen.add(m[1]);
  const tabelle = ASTRA_JS.slice(
    ASTRA_JS.indexOf("const ZEICHEN = Object.freeze({"),
    ASTRA_JS.indexOf("const BLOECKE =")
  );
  assert.ok(tabelle.length > 100, "die Zeichentabelle im Ablauf ist nicht auffindbar");
  for (const m of tabelle.matchAll(/:\s*"([a-z0-9-]+)"/g)) namen.add(m[1]);
  return namen;
}

// Und jeder Name, den der Ablauf benutzt, kommt aus dieser Tabelle.
test("der Ablauf nennt keinen Zeichennamen an der Tabelle vorbei", () => {
  const ohneTabelle = ASTRA_JS.slice(ASTRA_JS.indexOf("const BLOECKE ="));
  const lose = [...ohneTabelle.matchAll(/\bikona\(\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(lose, [], `diese Namen stehen frei im Ablauf statt in ZEICHEN: ${lose.join(", ")}`);
});

// Die Namen, die das mitgelieferte Lucide-Paket kennt.
function paketNamen() {
  const code = lies("apps/menyra-social/vendor/lucide.min.js");
  const kontext = { window: {}, globalThis: {} };
  kontext.self = kontext.window;
  vm.createContext(kontext);
  vm.runInContext(code, kontext);
  const lucide = kontext.window.lucide || kontext.lucide || kontext.globalThis.lucide;
  return lucide?.icons || {};
}

function pascal(name) {
  return String(name).split(/[-_\s]+/).filter(Boolean)
    .map((teil) => teil[0].toUpperCase() + teil.slice(1)).join("");
}

test("die Seite verlangt ueberhaupt Zeichen", () => {
  const verlangt = verlangteNamen();
  assert.ok(verlangt.size >= 15, `nur ${verlangt.size} Zeichen gefunden - stimmt das Muster noch?`);
});

test("jedes verlangte Zeichen liegt inline vor", () => {
  // Fehlt eines, bleibt an seiner Stelle ein Loch. Ein leerer Rahmen neben
  // "45 ditë garanci" sieht nicht nach Zeichen aus, sondern nach Panne -
  // und eine Panne neben einer Zusage kostet die Zusage.
  const fehlend = [...verlangteNamen()].filter((name) => !IKONEN[name]).sort();
  assert.deepEqual(fehlend, [], `diese Zeichen wuerden leer bleiben: ${fehlend.join(", ")}`);
});

test("jeder inline liegende Pfad ist der aus dem Lucide-Paket", () => {
  const paket = paketNamen();
  const abweichend = [];
  for (const [name, knoten] of Object.entries(IKONEN)) {
    const echt = paket[pascal(name)];
    if (!echt) { abweichend.push(`${name}: kennt das Paket nicht`); continue; }
    const ausPaket = echt[2].map(([tag, merkmale]) => [
      tag,
      Object.fromEntries(Object.entries(merkmale)
        .filter(([k]) => k !== "key")
        .map(([k, v]) => [k, String(v)]))
    ]);
    const inline = knoten.map(([tag, merkmale]) => [tag, { ...merkmale }]);
    // Verglichen wird der Inhalt, nicht die Herkunft: Die Knoten aus dem
    // Paket entstehen in einem eigenen vm-Kontext und tragen dessen
    // Prototypen - deepStrictEqual haelt sie deshalb fuer verschieden,
    // obwohl Zeichen fuer Zeichen dasselbe dasteht.
    if (JSON.stringify(inline) !== JSON.stringify(ausPaket)) abweichend.push(name);
  }
  assert.deepEqual(abweichend, [],
    `diese Zeichen weichen vom Paket ab: ${abweichend.join(", ")}`);
});

test("keine Zeichen, die niemand benutzt", () => {
  // Jedes kostet Auslieferung, und ein nie benutztes ist eine Zeile, die
  // niemand mehr prueft.
  const verlangt = verlangteNamen();
  const unbenutzt = Object.keys(IKONEN).filter((name) => !verlangt.has(name)).sort();
  assert.deepEqual(unbenutzt, [], `unbenutzte Zeichen: ${unbenutzt.join(", ")}`);
});

test("die Zeichen erben Farbe und Strichstaerke von Lucide", () => {
  assert.equal(IKONE_RAHMEN.stroke, "currentColor",
    "ein Zeichen mit eigener Farbe steht im Kaufknopf schwarz auf orange");
  assert.equal(IKONE_RAHMEN["stroke-width"], "2");
  assert.equal(IKONE_RAHMEN.viewBox, "0 0 24 24");
  assert.equal(IKONE_RAHMEN.fill, "none");
});

test("die Seite laedt das Lucide-Paket nicht nach", () => {
  // 352 KB vor dem ersten Wort auf einem Telefon im Mobilfunk.
  assert.ok(!ASTRA_HTML.includes("lucide"), "im Aufbau steht ein Verweis auf das Paket");
  assert.ok(!ASTRA_JS.includes("vendor/lucide"), "der Ablauf laedt das Paket nach");
  assert.ok(!ASTRA_HTML.includes("data-lucide"),
    "ein data-lucide-Platzhalter bleibt ohne das Paket leer");
});

test("kein Zeichen steht noch als Schriftzeichen auf der Seite", () => {
  // Pfeile und Haken als Buchstaben sehen auf jedem Geraet anders aus -
  // und auf manchen gar nicht.
  for (const zeichen of ["↗", "↓", "☀", "☾", "✓", "×"]) {
    assert.ok(!ASTRA_HTML.includes(zeichen), `im Aufbau steht noch das Schriftzeichen "${zeichen}"`);
  }
  assert.ok(!ASTRA_CSS.includes("content:'✓'"), "die Leistungsliste malt ihren Haken noch im Stil");
});

test("jedes Zeichen ist vor Vorleseprogrammen versteckt", () => {
  // Es steht neben einem Wort, das dasselbe sagt. "Pfeil nach rechts"
  // zwischen "Vazhdo me setin" und "53 €" liest den Knopf schlechter vor.
  const quelle = lies("apps/lifeskin-astra/astra-ikona.js");
  assert.match(quelle, /svg\.setAttribute\("aria-hidden", "true"\)/);
  for (const m of ASTRA_HTML.matchAll(/<[^>]*data-ikona="[^"]+"[^>]*>/g)) {
    assert.ok(m[0].includes('aria-hidden="true"'), `Platzhalter ohne aria-hidden: ${m[0]}`);
  }
});
