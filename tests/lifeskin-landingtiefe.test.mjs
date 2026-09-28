// Die Landingpage messen: welche der neun Bildschirme gesehen wurden, und
// ob jemand mit oder ohne Scroll zur Mënyra ging.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LANDING_SCHIRME, schirmGesehen, landingSichtPatch, landingWeiterPatch, landingLesen
} from "../shared/lifeskin-landingtiefe.js";
import { baueLandingtrichter } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");

test("die neun Bildschirme stehen in der Reihenfolge der Seite und gibt es alle", () => {
  assert.deepEqual(LANDING_SCHIRME.map((s) => s.nr), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const html = lies("apps/lifeskin-landing/index.html");
  let vorher = -1;
  for (const s of LANDING_SCHIRME) {
    const stelle = html.indexOf(`id="${s.id}"`);
    assert.ok(stelle > -1, `Bildschirm ${s.nr} (#${s.id}) fehlt auf der Landingpage`);
    assert.ok(stelle > vorher, `Bildschirm ${s.nr} steht nicht an seiner Stelle`);
    vorher = stelle;
  }
});

test("gesehen heisst wirklich im Bild, nicht nur eine Kante", () => {
  assert.equal(schirmGesehen(40, 900, 800), false, "eine Kante zaehlt");
  assert.equal(schirmGesehen(320, 900, 800), true, "40 % des Fensters zaehlen nicht");
  assert.equal(schirmGesehen(160, 300, 800), true, "ein kurzer Bildschirm, halb im Bild, zaehlt nicht");
  assert.equal(schirmGesehen(0, 300, 800), false);
});

test("jeder Bildschirm schreibt nur sein eigenes Feld, die Tiefe nur wenn sie waechst", () => {
  assert.deepEqual(landingSichtPatch(3, 1), { v: 2, s3: true, tiefe: 3 });
  assert.deepEqual(landingSichtPatch(2, 5), { v: 2, s2: true });
  assert.equal(landingSichtPatch(10, 0), null);
  assert.equal(landingSichtPatch(0, 0), null);
});

test("ohne Scroll heisst: nur Bildschirm 1 gesehen", () => {
  assert.deepEqual(landingWeiterPatch([1], 1), { v: 2, weg: "direkt", ab: 1, bisDahin: 1 });
  assert.deepEqual(landingWeiterPatch([1, 2, 3], 3), { v: 2, weg: "scroll", ab: 3, bisDahin: 3 });
  assert.equal(landingWeiterPatch([], 0).weg, "direkt");
  assert.equal(landingWeiterPatch(new Set([1, 9]), 9).weg, "scroll");
});

test("Heart liest den Stand - und ohne Messung ist nichts gemessen", () => {
  assert.equal(landingLesen({}).gemessen, false);
  assert.equal(landingLesen({ timings: { pfad: {} } }).gemessen, false);
  const lp = landingLesen({ timings: { landing: { v: 2, s1: true, s2: true, s5: true, tiefe: 5, weg: "scroll", ab: 5, bisDahin: 5 } } });
  assert.deepEqual(lp.gesehen, [1, 2, 5]);
  assert.equal(lp.tiefe, 5);
  assert.equal(lp.weg, "scroll");
  assert.equal(landingLesen({ timings: { landing: { v: 2, weg: "quatsch" } } }).weg, "");
});

test("Messungen von vorher (Version 1) zaehlen in den Nummern von heute", () => {
  // Version 1: 2 = "Si funksionon", 3 = die Faelle. Seit Version 2 stehen die
  // Faelle gleich unter dem ersten Blick - 2 und 3 tauschen.
  const alt = (felder) => landingLesen({ timings: { landing: { v: 1, ...felder } } });
  assert.deepEqual(alt({ s1: true, s2: true, tiefe: 2 }).gesehen, [1, 3]);
  assert.equal(alt({ s1: true, s2: true, tiefe: 2 }).tiefe, 3);
  assert.deepEqual(alt({ s1: true, s2: true, s3: true, s5: true, tiefe: 5 }).gesehen, [1, 2, 3, 5]);
  assert.deepEqual(alt({ s1: true, s3: true, tiefe: 3, ab: 3, bisDahin: 3, weg: "scroll" }),
    { gemessen: true, gesehen: [1, 2], tiefe: 3, weg: "scroll", ab: 2, bisDahin: 3 });
  const html = lies("apps/lifeskin-landing/index.html");
  assert.ok(html.indexOf('id="held"') < html.indexOf('id="rezultatet"')
    && html.indexOf('id="rezultatet"') < html.indexOf('id="pse"'), "die Faelle stehen nicht gleich unter dem ersten Blick");
});

test("der Landing-Trichter zaehlt nur gemessene Besuche und vergleicht beide Wege", () => {
  const lp = (felder) => ({ timings: { landing: { v: 2, ...felder } } });
  const sitzungen = [
    { id: "a", ...lp({ s1: true, weg: "direkt" }), step: "wahl" },
    { id: "b", ...lp({ s1: true, weg: "direkt" }), step: "result", warteseiteGeoeffnet: true, hatBestellt: true },
    { id: "c", ...lp({ s1: true, s2: true, s3: true, weg: "scroll" }), step: "result", warteseiteGeoeffnet: true },
    { id: "d", ...lp({ s1: true, s2: true }) },
    { id: "alt", step: "result" }
  ];
  const t = baueLandingtrichter(sitzungen);
  assert.equal(t.basis, 4, "ein Besuch ohne Messung zaehlt mit");
  const zahl = (id) => t.stufen.find((s) => s.id === id)?.anzahl;
  assert.equal(zahl("landing"), 4);
  assert.equal(zahl("s1"), 4);
  assert.equal(zahl("s2"), 2);
  assert.equal(zahl("s3"), 1);
  assert.equal(zahl("s9"), 0);
  assert.equal(zahl("menyra-direkt"), 2);
  assert.equal(zahl("menyra-scroll"), 1);
  assert.deepEqual(
    { m: t.vergleich.direkt.menyra, p: t.vergleich.direkt.patient, b: t.vergleich.direkt.bestellt },
    { m: 2, p: 1, b: 1 });
  assert.equal(t.vergleich.direkt.bestelltAnteil, 0.5);
  assert.deepEqual(
    { m: t.vergleich.scroll.menyra, p: t.vergleich.scroll.patient, b: t.vergleich.scroll.bestellt },
    { m: 1, p: 1, b: 0 });
});

test("Heart zeigt es an drei Stellen: Trichter, Fall-Chip, Fall-Ansicht", async () => {
  const { renderLandingInhalt } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const html = renderLandingInhalt({ timings: { landing: { v: 2, s1: true, s2: true, s3: true, weg: "scroll", ab: 3, bisDahin: 3 } } });
  assert.equal((html.match(/heart-schritte__zeile--an/g) || []).length, 3);
  assert.match(html, /hier zur Mënyra/);
  assert.match(html, /Mit Scroll zur Mënyra/);
  assert.match(renderLandingInhalt({}), /noch keine Messung/);
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /artMarke\(sitzung\) \+ landingMarke\(sitzung\)/, "der Chip steht nicht an jedem Fall");
  assert.match(render, />No scroll</);
  assert.match(render, /fallKarte\("landing", "Landing"/);
});

test("die Seite misst leicht und schreibt in die Sitzung", () => {
  const messen = lies("apps/lifeskin/lifeskin-landingtiefe.js");
  assert.doesNotMatch(messen, /addEventListener\("scroll"/, "ein scroll-Lauscher macht die Seite langsamer");
  assert.match(messen, /waechter\.unobserve\(e\.target\)/, "ein gesehener Bildschirm wird weiter beobachtet");
  const app = lies("apps/lifeskin/lifeskin-app.js");
  assert.ok(app.indexOf("starteLandingtiefe(") < app.indexOf("this.sitzung.starte({ sprache"),
    "die Messung startet erst nach dem fruehen Tipp");
  assert.match(app, /\(this\.sitzung\.stand\?\.step \|\| "opened"\) === "opened"\) this\.landingtiefe\?\.weiter\(\)/);
  const sitzung = lies("apps/lifeskin/lifeskin-session.js");
  assert.match(sitzung, /timings\.landing\.\$\{f\}/);
  // timings ist in den Regeln eine offene Karte - keine neue Regel noetig.
  assert.match(lies("firestore.rules"), /\(!\("timings" in data\) \|\| data\.timings is map\)/);
});
