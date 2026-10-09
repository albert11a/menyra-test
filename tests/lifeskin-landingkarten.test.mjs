// /lifeskin Karte fuer Karte (04.10., Wunsch Inhaber), die Trichter-Karte
// mit den Chips in der Karte - und die Chips von "Fälle", die nach dem
// Neuzeichnen auf der Seite des gewaehlten Chips stehen.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LANDING_KARTEN, landingKartePatch, landingKartenTiefe, landingKartenGemessen
} from "../shared/lifeskin-landingkarten.js";
import { baueLandingKarten } from "../apps/mnyra-heart/heart-lifeskin-weg.js";
import { starteLandingkarten } from "../apps/lifeskin/lifeskin-landingkarten.js";
import { captureChipScroll, restoreChipScroll } from "../apps/mnyra-heart/heart-render.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");

test("the redesign retains measurement selectors only for matching content", () => {
  // Historical session fields and names remain unchanged. Removed benefit
  // cards are not falsely mapped to new content, and customer media does
  // not masquerade as the existing Instagram proof event.
  //
  // FREIGEGEBENE MOBIL-FASSUNG VOM 09.10.: Sie liess .lf-entry-card weg -
  // und ohne sie startet die Messung gar nicht (starteLandingkarten). Seit
  // 09.10. abends tragen die passenden Karten die Kennungen wieder, ohne
  // sichtbare Aenderung (keine dieser Klassen hat CSS in den geladenen
  // Dateien): Analiza = Smartphone-Karte oben, F.A.Q = #garancia.
  // Die Instagram-Zeile gibt es nicht mehr. "Tash e din" (Karte 7) passt
  // inhaltlich zu "03 Analiza - Terapia", steht aber VOR den Faellen (5) -
  // Heart zaehlt nach Tiefe, jede Sicht dort zaehlte als "Para - Pas
  // gesehen". Darum ohne Kennung.
  const html = lies("apps/lifeskin-landing/index.html");
  assert.ok(html.includes(LANDING_KARTEN[0].wahl.slice(1)), "ohne die erste Karte startet die Messung nicht");
  for (const selector of ['lf-entry-card', 'id="rezultatet"', 'lf-faq'])
    assert.ok(html.includes(selector), selector);
  for (const selector of ['lf-benefit--therapy', 'lf-benefit--analysis', 'lf-benefit--scan', 'lf-warm-result', 'lf-community'])
    assert.ok(!html.includes(selector), selector);
  // Die gemessenen Karten stehen auf der Seite in der Reihenfolge ihrer
  // Nummern - sonst stimmt die Tiefe in Heart nicht.
  const stellen = LANDING_KARTEN
    .map((k) => html.indexOf(k.wahl.startsWith("#") ? `id="${k.wahl.slice(1)}"` : k.wahl.slice(1)))
    .filter((stelle) => stelle >= 0);
  assert.equal(stellen.length, 3);
  assert.deepEqual(stellen, [...stellen].sort((a, b) => a - b));
  assert.deepEqual(LANDING_KARTEN.map(k => k.id),
    ['analiza', 'terapi', 'analizaDetaj', 'skanim', 'paraPas', 'instagram', 'tashEDin', 'faq']);
});

test("jede Karte schreibt nur ihre Kennung; die Tiefe kommt aus den Feldern", () => {
  assert.deepEqual(landingKartePatch(1), { v: 1, analiza: true });
  assert.deepEqual(landingKartePatch(8), { v: 1, faq: true });
  assert.equal(landingKartePatch(0), null);
  assert.equal(landingKartePatch(9), null);
  assert.equal(landingKartenTiefe({}), 0);
  assert.equal(landingKartenTiefe({ timings: { lpKarten: { v: 1, analiza: true, paraPas: true } } }), 5);
  assert.equal(landingKartenGemessen({ timings: { lpKarten: { v: 1 } } }), false);
  assert.equal(landingKartenGemessen({ timings: { lpKarten: { v: 1, analiza: true } } }), true);
});

test("Heart zaehlt 'bis hierher' und nur gemessene Besuche", () => {
  const karten = (...nr) => ({ timings: { lpKarten: Object.fromEntries([["v", 1], ...nr.map((n) => [LANDING_KARTEN[n - 1].id, true])]) } });
  const { stufen, basis } = baueLandingKarten([
    karten(1, 2, 3, 4, 5, 6, 7, 8),
    karten(1, 5),
    karten(1),
    // Von vor der Messung: zaehlt nicht.
    { step: "opened" }
  ]);
  assert.equal(basis, 3);
  assert.deepEqual(stufen.map((s) => [s.nr, s.label, s.anzahl]), [
    [1, "Analiza online", 3], [2, "01 Terapi", 2], [3, "02 Analiza", 2], [4, "03 Skanim", 2],
    [5, "Para - Pas", 2], [6, "Instagram", 1], [7, "Tash e din", 1], [8, "F.A.Q", 1]
  ]);
});

test("die Seite misst die Karten - nur auf /lifeskin, nur Neues, ohne Pixel", async () => {
  const elemente = new Map(LANDING_KARTEN.map((k) => [k.wahl, { name: k.wahl }]));
  let rueckruf = null;
  const beobachtet = [];
  const abgemeldet = [];
  class IO {
    constructor(fn) { rueckruf = fn; }
    observe(el) { beobachtet.push(el); }
    unobserve(el) { abgemeldet.push(el); }
    disconnect() {}
  }
  const fenster = { IntersectionObserver: IO, innerHeight: 800 };
  const dokument = { querySelector: (wahl) => elemente.get(wahl) || null };
  const geschrieben = [];
  starteLandingkarten({ schreiben: (d) => geschrieben.push(d), dokument, fenster });
  assert.equal(beobachtet.length, 8);
  const eintrag = (wahl, sichtbar = 600) => ({
    target: elemente.get(wahl), isIntersecting: true,
    intersectionRect: { height: sichtbar }, boundingClientRect: { height: 700 }
  });
  rueckruf([eintrag(".lf-entry-card"), eintrag("#rezultatet", 20)]);
  rueckruf([eintrag(".lf-entry-card"), eintrag(".lf-faq")]);
  assert.deepEqual(geschrieben, [{ v: 1, analiza: true }, { v: 1, faq: true }], "eine Kante zaehlt nicht, nichts doppelt");
  assert.equal(abgemeldet.length, 2);
  // Eine Seite ohne diese Karten (/lifeskin2, Laden): nichts beobachtet.
  beobachtet.length = 0;
  starteLandingkarten({ schreiben: () => {}, dokument: { querySelector: () => null }, fenster });
  assert.equal(beobachtet.length, 0);
  // Kein Pixel in der Messung.
  for (const datei of ["apps/lifeskin/lifeskin-landingkarten.js", "shared/lifeskin-landingkarten.js"]) {
    assert.doesNotMatch(lies(datei).replace(/\/\/.*$/gm, ""), /fbq|pixel|Pixel/, datei);
  }
  // Der Trichter startet die Messung und schreibt sie in die eigene Sitzung.
  const app = lies("apps/lifeskin/lifeskin-app.js");
  assert.match(app, /this\.landingkarten = starteLandingkarten\(\{ schreiben: \(d\) => this\.sitzung\.landingKartenSchreiben\(d\) \}\);/);
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  const aufrufe = [];
  const fetchFn = async (url, init = {}) => { aufrufe.push({ url, init }); return { ok: true, status: 200, json: async () => ({}) }; };
  const sitzung = new Sitzung({ fetchFn, speicher: null });
  await sitzung.starte({ sprache: "sq" });
  await sitzung.landingKartenSchreiben({ v: 1, paraPas: true });
  const letzte = aufrufe.at(-1);
  assert.match(letzte.url, /updateMask\.fieldPaths=timings\.lpKarten\.v/);
  assert.match(letzte.url, /updateMask\.fieldPaths=timings\.lpKarten\.paraPas/);
  assert.doesNotMatch(letzte.url, /fieldPaths=timings(?!\.)/, "die ganze timings-Karte wuerde ueberschrieben");
});

const jetzt = new Date().toISOString();
async function heart(weg, trichterOffen, sitzungen) {
  const b = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  return renderLifeskin({
    status: "ready", loadedFrom: "network", weg, tests: [], berichte: {},
    sitzungen: sitzungen || [{ id: "a", createdAt: jetzt, updatedAt: jetzt, step: "opened", source: weg ? { weg } : {}, device: {},
      timings: { lpKarten: { v: 1, analiza: true, terapi: true } } }],
    produkte: [], abdeckung: [], kennzahlen: b.baueKennzahlen([]), trichter: b.baueTrichter([]),
    lesetiefe: b.baueLesetiefe([]), herkunft: b.baueHerkunft([]), verteilung: b.baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", zeitraum: "", fach: "alle", trichterOffen
  });
}

test("Trichter: die Chips stehen IN der Karte, seitenweise wie bei 'Fälle'", async () => {
  const html = await heart("", "main");
  const beginn = html.indexOf('data-klapp="trichter"');
  assert.ok(beginn > 0);
  const karte = html.slice(html.lastIndexOf("<details", beginn), html.indexOf("</details>", beginn));
  assert.match(karte, /<h3 class="heart-lifeskin-block__titel">Trichter · Main<\/h3>[^]*?<\/summary>\s*<div class="heart-lifeskin-chips heart-shopchip-pages"/);
  assert.match(karte, /<div class="heart-lifeskin-chips heart-shopchip-pages"[^>]*>\s*<div class="heart-shopchip-page heart-lifeskin-chips--shop" role="group">/);
  assert.deepEqual([...karte.matchAll(/data-action="lifeskin-trichter" data-wert="([a-z]+)"/g)].map((m) => m[1]),
    ["main", "scan", "foto", "trup", "kauf", "gati", "bericht", "landing"]);
  assert.equal((karte.match(/class="heart-shopchip-page /g) || []).length, 2);
  // Vor der Karte keine Chipreihe mehr.
  const davor = html.slice(Math.max(0, html.lastIndexOf("<details", beginn) - 400), html.lastIndexOf("<details", beginn));
  assert.doesNotMatch(davor, /lifeskin-trichter/);
});

test("Chip Landing auf /lifeskin: die acht Karten mit Kreis, Name, Balken, Zahl", async () => {
  const html = await heart("", "landing");
  const beginn = html.indexOf('data-klapp="trichter"');
  const karte = html.slice(beginn, html.indexOf("</details>", beginn));
  const zeilen = [...karte.matchAll(/heart-shopschritt__nr">(\d+)<\/span>\s*<span class="heart-shopschritt__name">([^<]+)<\/span>[\s\S]*?heart-shopschritt__zahl">(\d+)</g)]
    .map((m) => [Number(m[1]), m[2], Number(m[3])]);
  assert.deepEqual(zeilen, [[1, "Analiza online", 1], [2, "01 Terapi", 1], [3, "02 Analiza", 0], [4, "03 Skanim", 0],
    [5, "Para - Pas", 0], [6, "Instagram", 0], [7, "Tash e din", 0], [8, "F.A.Q", 0]]);
  assert.match(karte, /data-wert="landing"\s*aria-pressed="true">\s*Landing <span>1<\/span>/);
});

// Eine kleine Nachbildung der Chipreihen: genug fuer captureChipScroll / restoreChipScroll.
function reihe({ bereich, aktion = "lifeskin-fach", seiten, gewaehlt, breite = 300 }) {
  const knoepfe = [];
  const seitenKnoten = seiten.map((werte) => {
    const seite = { knoepfe: [] };
    for (const wert of werte) {
      const knopf = {
        wert, seite,
        getAttribute: (n) => (n === "data-action" ? aktion : n === "data-wert" ? wert : n === "aria-pressed" ? String(wert === r.gewaehlt) : null),
        closest: (wahl) => (wahl === ".heart-shopchip-page" ? seite : null)
      };
      seite.knoepfe.push(knopf);
      knoepfe.push(knopf);
    }
    return seite;
  });
  const r = {
    gewaehlt, scrollLeft: 0, clientWidth: breite, children: seitenKnoten,
    classList: { contains: (k) => k === "heart-shopchip-pages" },
    closest: (wahl) => (wahl === "[data-bereich]" ? { getAttribute: () => bereich } : null),
    querySelector: (wahl) => (wahl === "[data-action]" ? knoepfe[0]
      : wahl === '[aria-pressed="true"]' ? knoepfe.find((k) => k.wert === r.gewaehlt) || null : null)
  };
  return r;
}
const wurzel = (...reihen) => ({ querySelectorAll: () => reihen });
const FAECHER = [["alle", "ready", "seen", "kasse"], ["bestellt", "spaeter", "archiviert"]];

test("Fälle: jede Reihe behaelt ihre eigene Stelle - nicht die einer anderen Reihe", () => {
  const skinreact = reihe({ bereich: "skinreact", seiten: FAECHER, gewaehlt: "alle" });
  const acne = reihe({ bereich: "acne", seiten: FAECHER, gewaehlt: "bestellt" });
  acne.scrollLeft = 300;
  const stand = captureChipScroll(wurzel(skinreact, acne));
  // Neu gezeichnet: neue Knoten, dieselben Wahlen.
  const skinreactNeu = reihe({ bereich: "skinreact", seiten: FAECHER, gewaehlt: "alle" });
  const acneNeu = reihe({ bereich: "acne", seiten: FAECHER, gewaehlt: "bestellt" });
  restoreChipScroll(wurzel(skinreactNeu, acneNeu), stand);
  assert.equal(skinreactNeu.scrollLeft, 0, "'Offen' gewaehlt - Seite 1, nicht die Seite 2 der anderen Reihe");
  assert.equal(acneNeu.scrollLeft, 300);
});

test("Fälle: wechselt die Wahl, steht die Seite des gewaehlten Chips im Bild", () => {
  const r = reihe({ bereich: "skinreact", seiten: FAECHER, gewaehlt: "bestellt" });
  r.scrollLeft = 300;
  const stand = captureChipScroll(wurzel(r));
  r.gewaehlt = "alle";
  restoreChipScroll(wurzel(r), stand);
  assert.equal(r.scrollLeft, 0);
  // Derselbe Knoten, dieselbe Wahl: Wohin gewischt wurde, bleibt.
  r.scrollLeft = 300;
  restoreChipScroll(wurzel(r), captureChipScroll(wurzel(r)));
  assert.equal(r.scrollLeft, 300);
});
