// Die Vorher/Nachher-Faelle: Daten, Landing, Therapieseite, Heart.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  RASTE_STANDARD, RASTE_DOK, RASTI_BILD_PRAEFIX, bildWeg, rastiNormalisieren, rasteNormalisieren,
  rasteFuer, rastiStandard, rasteFuerBericht, rasteLaden, rasteMitBildern, rastiProdukteText
} from "../shared/lifeskin-raste.js";
import { rastiKarte } from "../apps/lifeskin-landing/raste.js";
import { renderRaste, renderRastiEditor, renderBefundRaste, rasteListe, klappSetzen, klappAttr } from "../apps/mnyra-heart/heart-lifeskin-raste.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

test("der Standard entspricht den vier Faellen, die im HTML der Landingpage stehen", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  assert.equal(RASTE_STANDARD.length, 4);
  for (const r of RASTE_STANDARD) {
    assert.ok(html.includes(r.para), `${r.para} fehlt im HTML`);
    assert.ok(html.includes(r.pas), `${r.pas} fehlt im HTML`);
    assert.ok(html.includes(`>${r.emri}<`), `${r.emri} fehlt im HTML`);
  }
});

test("Heart und Seiten nennen dieselben Dokumente", () => {
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  assert.match(adapter, new RegExp(`RASTE_DOK_ID = "${RASTE_DOK}"`));
  assert.match(adapter, new RegExp(`RASTI_BILD_ID = "${RASTI_BILD_PRAEFIX}"`));
});

test("Bildwege: nur eigene Dateien oder Datenbilder", () => {
  assert.equal(bildWeg("/apps/lifeskin-landing/fotot/a.jpg"), "/apps/lifeskin-landing/fotot/a.jpg");
  assert.equal(bildWeg("data:image/jpeg;base64,xx"), "data:image/jpeg;base64,xx");
  assert.equal(bildWeg("https://fremd.example/a.jpg"), "");
  assert.equal(bildWeg("javascript:alert(1)"), "");
  assert.equal(bildWeg("/apps/../geheim.jpg"), "");
});

test("Datenbilder kommen nie in den Index", () => {
  const r = rastiNormalisieren({ id: "x", para: "data:image/jpeg;base64,xx", pas: "/apps/a/b.jpg", bild: true, landing: 1 });
  assert.equal(r.para, "");
  assert.equal(r.pas, "/apps/a/b.jpg");
  assert.equal(r.landing, false, "nur echtes true schaltet ein");
});

test("doppelte und leere Kennungen fallen weg", () => {
  const liste = rasteNormalisieren([{ id: "a" }, { id: "a" }, { id: "" }, { id: "b" }]);
  assert.deepEqual(liste.map((r) => r.id), ["a", "b"]);
});

test("der Standardfall passt zu den Produkten", () => {
  const liste = rasteNormalisieren(RASTE_STANDARD);
  assert.equal(rastiStandard(liste, ["lf-pigment"]).id, "r4");
  assert.equal(rastiStandard(liste, ["lf-acne", "lf-moistur", "lf-pore"]).id, "r3");
  assert.equal(rastiStandard(liste, ["lf-acne", "lf-moistur"]).id, "r1");
  assert.equal(rastiStandard(liste, []).id, "r1");
});

test("ein Bericht zeigt die gewaehlten Faelle in Reihenfolge - nie weniger als einen", () => {
  const liste = rasteNormalisieren(RASTE_STANDARD);
  assert.deepEqual(rasteFuerBericht(liste, ["r4", "r1"], []).map((r) => r.id), ["r4", "r1"]);
  // r2 ist fuer die Analyseseite aus, "weg" gibt es nicht: der Standard.
  assert.deepEqual(rasteFuerBericht(liste, ["r2", "weg"], ["lf-pigment"]).map((r) => r.id), ["r4"]);
  assert.deepEqual(rasteFuerBericht(liste, undefined, []).map((r) => r.id), ["r1"]);
  // Alles aus: dann wirklich keiner.
  assert.deepEqual(rasteFuerBericht(liste.map((r) => ({ ...r, analiza: false })), ["r1"], []), []);
});

test("nur Landing, nur Analyse, beides", () => {
  const liste = rasteNormalisieren([
    { id: "a", landing: true, analiza: false },
    { id: "b", landing: false, analiza: true },
    { id: "c", landing: true, analiza: true },
    { id: "d" }
  ]);
  assert.deepEqual(rasteFuer(liste, "landing").map((r) => r.id), ["a", "c"]);
  assert.deepEqual(rasteFuer(liste, "analiza").map((r) => r.id), ["b", "c"]);
});

test("Laden: ohne Dokument null, Bilder aus dem eigenen Dokument", async () => {
  const antwort = (status, daten) => ({ ok: status === 200, status, json: async () => daten });
  const s = (v) => ({ stringValue: v });
  const holen = async (url) => {
    if (url.endsWith("/raste")) {
      return antwort(200, { fields: { lista: { arrayValue: { values: [
        { mapValue: { fields: { id: s("n1"), emri: s("Arta"), bild: { booleanValue: true }, landing: { booleanValue: true }, pas: s("/apps/x/pas.jpg") } } },
        { mapValue: { fields: { id: s("n2"), bild: { booleanValue: true }, landing: { booleanValue: true } } } }
      ] } } } });
    }
    if (url.endsWith("/rasti-n1")) return antwort(200, { fields: { para: s("data:image/jpeg;base64,AA"), pas: s("") } });
    return antwort(404, {});
  };
  const liste = await rasteLaden("B", holen);
  assert.equal(liste.length, 2);
  const mit = await rasteMitBildern(liste, "B", holen);
  // n2 hat keine Bilder -> faellt weg statt grauer Kachel.
  assert.deepEqual(mit.map((r) => r.id), ["n1"]);
  assert.equal(mit[0].para, "data:image/jpeg;base64,AA");
  assert.equal(mit[0].pas, "/apps/x/pas.jpg", "die nicht getauschte Seite bleibt die Datei");
  assert.equal(await rasteLaden("B", async () => antwort(404, {})), null);
});

test("Landingkarte: gleicher Aufbau wie im HTML, Text maskiert", () => {
  const html = rastiKarte(rastiNormalisieren({
    id: "z", emri: "<b>X</b>", gjetja: "Akne", produkte: ["lf-acne"], emrat: ["LF ACNE"], cmimi: 33,
    para: "/apps/a/1.jpg", pas: "/apps/a/2.jpg"
  }));
  for (const klasse of ["rasti__palet", "gjysma gjysma--fund", "etiket etiket--fund", "rasti__kush", "rasti__seti", "rasti__cmim__nen"]) {
    assert.ok(html.includes(klasse), klasse);
  }
  assert.ok(html.includes("&lt;b&gt;X&lt;/b&gt;"));
  assert.ok(html.includes("Me 1 produkt ·"));
  assert.equal(rastiProdukteText({ produkte: ["lf-acne", "lf-pore"], emrat: [] }), "LF ACNE + LF PORE");
});

test("die Landingpage laedt die Faelle und zaehlt die Punkte neu", () => {
  const html = lies("apps/lifeskin-landing/index.html");
  assert.ok(html.includes('src="/apps/lifeskin-landing/raste.js"'));
  const js = lies("apps/lifeskin-landing/landing.js");
  assert.ok(js.includes('"lifeskin:raste"'));
});

test("die Therapieseite zeichnet die Faelle aus dem Bericht", () => {
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  assert.ok(js.includes("rasteFuerBericht(liste, this.daten?.raste"));
});

test("Heart: Karte mit Schaltern je Ort, zugeklappt", () => {
  const html = renderRaste({ raste: null });
  assert.ok(html.includes("Ergebnisse (Vorher / Nachher)"));
  assert.ok(html.includes("Mit der ersten Änderung werden sie hier gespeichert"));
  assert.equal((html.match(/data-action="lifeskin-rasti-ort"/g) || []).length, 8);
  assert.ok(!/data-klapp="raste" open/.test(html));
  klappSetzen("raste", true);
  assert.ok(renderRaste({ raste: [] }).includes('data-klapp="raste" open'));
  klappSetzen("raste", false);
  assert.equal(klappAttr("nachfassen"), 'data-klapp="nachfassen"');
});

test("Heart: Editor mit Produkt-Dropdowns und beiden Orten", () => {
  const produkte = [{ id: "lf-acne", name: "LF ACNE" }, { id: "lf-pore", name: "LF PORE" }];
  const html = renderRastiEditor({ rastOffen: "r3", raste: null }, produkte);
  assert.equal((html.match(/data-rasti-produkt aria-label/g) || []).length, 3 + 1, "drei Zeilen und die Vorlage");
  // lf-moistur ist nicht angelegt und bleibt trotzdem waehlbar.
  assert.ok(html.includes('value="lf-moistur" selected'));
  assert.ok(html.includes('data-rastifeld-an="landing" checked'));
  assert.ok(html.includes('data-rastifeld-an="analiza" checked'));
  assert.ok(html.includes("lifeskin-rasti-loeschen"));
  assert.ok(!renderRastiEditor({ rastOffen: "__neu" }, produkte).includes("lifeskin-rasti-loeschen"));
});

test("Heart Befund: Platz 1 immer belegt, Standard passend zu den Produkten", () => {
  const liste = rasteListe({});
  const ohne = renderBefundRaste(liste, { produkte: [{ id: "lf-pigment" }] });
  assert.equal((ohne.match(/data-rasti-platz>/g) || []).length, 1 + 1, "ein Platz und die Vorlage");
  assert.ok(/value="r4" selected/.test(ohne));
  const mit = renderBefundRaste(liste, { raste: ["r3", "r1", "r2"] });
  const selects = mit.split("<template")[0];
  assert.equal((selects.match(/data-befund-rasti/g) || []).length, 2, "r2 ist fuer die Analyse aus");
  assert.ok(renderBefundRaste(liste.map((r) => ({ ...r, analiza: false })), {}).includes("Kein Ergebnis"));
});
