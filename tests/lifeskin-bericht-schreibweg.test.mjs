import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { raportLesen } from "../shared/lifeskin-analyse.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const adapter = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-adapter.js"), "utf8");
const seite = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");

// Was Heart schreibt, muss die Patientenseite auch lesen koennen.
//
// GEMESSEN, NICHT GESCHAETZT: Der Bericht fuer die Seite wurde eine Ebene
// zu tief abgelegt - in "analyse" statt oben im Dokument. Die Seite liest
// ihn oben, fand dort nichts und liess Zonen, Messwerte, Diagnose,
// Erklaerung und Prognose weg. Der Patient sah Befundtext und Preis.
//
// Weder die Tests von Heart noch die der Seite konnten das sehen: beide
// Seiten waren fuer sich richtig. Nur die Stelle dazwischen war es nicht.
// Also wird hier genau diese Stelle geprueft - das Dokument, das wirklich
// geschrieben wird.

// Das Dokument aus dem Quelltext holen und ausfuehren. Kein Firebase noetig:
// der Wert, der uebergeben wird, ist ein einfaches Objektliteral.
function dokumentBauen(werte) {
  const start = adapter.indexOf('"reports", sitzungId), ');
  assert.ok(start > 0, "Der Schreibweg des Berichts sieht anders aus als erwartet");
  const auf = adapter.indexOf("{", start);
  let tiefe = 0;
  let zu = auf;
  for (; zu < adapter.length; zu += 1) {
    if (adapter[zu] === "{") tiefe += 1;
    else if (adapter[zu] === "}") { tiefe -= 1; if (!tiefe) break; }
  }
  const literal = adapter.slice(auf, zu + 1);
  const bauen = new Function("befund", "produkte", "preis", "schwere", "analyse", "raport",
    `return (${literal});`);
  return bauen(werte.befund, werte.produkte, werte.preis, werte.schwere, werte.analyse, werte.raport);
}

const raport = raportLesen(
  (() => {
    const md = readFileSync(join(wurzel, "docs/lifeskin-raport-schema.md"), "utf8");
    const roh = md.slice(md.indexOf("```json") + 7);
    return roh.slice(0, roh.indexOf("```"));
  })()
);

const geschrieben = dokumentBauen({
  befund: "Ka bllokim te lehte folikular.",
  produkte: [{ id: "lifeskin-akne", satz: "Ne mengjes." }],
  preis: 53,
  schwere: "mittel",
  analyse: { iga: 2, parameter: [], javet: [] },
  raport
});

test("der Bericht fuer die Patientenseite steht OBEN im Dokument", () => {
  assert.ok(geschrieben.raport, "Kein raport im Dokument - die Seite bliebe halb leer");
  assert.equal(geschrieben.analyse?.raport, undefined,
    "Der Bericht liegt in analyse - dort sucht die Seite nicht");
});

test("er kommt vollstaendig an - nichts faellt auf dem Weg heraus", () => {
  // Genau die Abschnitte, die auf dem Telefon gefehlt haben.
  assert.equal(geschrieben.raport.parametrat.length, 10, "Nicht alle zehn Messwerte");
  assert.deepEqual(geschrieben.raport.zonaLista, raport.zonaLista, "Zonen gingen verloren");
  assert.deepEqual(geschrieben.raport.termat, raport.termat);
  assert.equal(geschrieben.raport.parametrat.find(p=>p.id === "barriera").shkalla, null);
  assert.ok(geschrieben.raport.diagnoza, "Keine Diagnose");
  assert.equal(typeof geschrieben.raport.niveli, "number", "Keine Stufe");
  assert.ok(geschrieben.raport.shpjegimi.length, "Keine Erklaerung");
  assert.ok(geschrieben.raport.paKujdes.nukZbehet, "Keine Prognose");
  assert.ok(geschrieben.raport.ekzaminimi, "Nicht, was untersucht wurde");
});

test("die Seite liest ihn an derselben Stelle, an der Heart ihn ablegt", () => {
  assert.match(seite, /get raport\(\)\s*\{\s*return this\.daten\.raport/,
    "Die Seite liest den Bericht woanders als Heart ihn schreibt");
});

test("ohne Bericht wird das Feld leer geschrieben, nicht ausgelassen", () => {
  // Sonst bliebe bei einer zweiten Freigabe der alte Bericht stehen -
  // geschrieben wird mit merge.
  const ohne = dokumentBauen({
    befund: "Text", produkte: [], preis: 53, schwere: "", analyse: {}, raport: null
  });
  assert.ok("raport" in ohne, "Das Feld fehlt ganz - der alte Bericht bliebe stehen");
  assert.equal(ohne.raport, null);
});
