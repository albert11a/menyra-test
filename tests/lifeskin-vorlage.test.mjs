import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PARAMETER, stufeAus, vorlageLesen, pdfText } from "../shared/lifeskin-analyse.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const beispiel = join(wurzel, "tests/fixtures/lifeskin-analiza-beispiel.pdf");
const shabllon = readFileSync(join(wurzel, "docs/lifeskin-analiza-shabllon.txt"), "utf8");

// Dr. Gashi tippt den Befund nicht ab, sie laedt ihn hoch.
//
// Das ist der Unterschied zwischen einer Minute und zehn je Patient - und
// bei fuenfzig Analysen am Tag ist das der Unterschied zwischen "geht" und
// "geht nicht". Diese Datei haelt fest, dass der Weg auch dann noch traegt,
// wenn niemand mehr hinsieht: was gelesen wird, wie aus Worten Stufen
// werden, und dass nichts geraten wird.

test("die echte PDF wird vollstaendig gelesen", async () => {
  // Kein nachgebautes Beispiel: die Datei, die Dr. Gashi geschickt hat.
  // Ein PDF ist kein Text - die Buchstaben liegen als Glyphennummern eines
  // mitgelieferten Schriftausschnitts darin, doppelt verpackt. Wenn dieser
  // Test faellt, liest Heart ihre Berichte nicht mehr.
  const text = await pdfText(new Uint8Array(readFileSync(beispiel)));
  assert.ok(text.length > 3000, `Zu wenig Text aus dem PDF (${text.length} Zeichen)`);

  // Die albanischen Zeichen muessen mitkommen. Ohne die Zeichentabelle
  // fielen ë und ç lautlos aus jedem Wort - und "e moderuar" wurde zu
  // "e moderuar", aber "të lehta" zu "t lehta".
  assert.match(text, /ë/, "ë fehlt - die Zeichentabelle der Schrift wird nicht gelesen");
  assert.match(text, /ç|Ç/, "ç fehlt - die Zeichentabelle der Schrift wird nicht gelesen");

  const gelesen = vorlageLesen(text);
  assert.equal(gelesen.schwere, "mittel", "Der Schweregrad wurde nicht erkannt");
  assert.equal(gelesen.iga, 3, "Die IGA-Stufe wurde nicht erkannt");
  assert.ok(gelesen.befund.length > 100, "Der Befundtext wurde nicht uebernommen");
  assert.equal(gelesen.parameter.length, PARAMETER.length,
    "Nicht alle acht Messwerte wurden gefunden");

  // Und die Werte selbst, nicht nur ihre Zahl.
  const nach = new Map(gelesen.parameter.map((p) => [p.id, p]));
  assert.match(nach.get("lezione").wert, /10-15/, "Der wichtigste Messwert stimmt nicht");
  assert.equal(nach.get("noduse").stufe, 0, "\"nuk dallohen qartë\" ist keine Null");
  assert.equal(nach.get("lezione").stufe, 3, "10-15 Stellen sind keine Drei");
});

test("die Textvorlage liest sich genauso", () => {
  // Zwei Quellen, ein Ergebnis. Sonst waere die Vorlage eine Vorlage fuer
  // genau einen Dateityp.
  const gelesen = vorlageLesen(shabllon);
  assert.equal(gelesen.schwere, "mittel");
  assert.equal(gelesen.iga, 3);
  assert.equal(gelesen.parameter.length, PARAMETER.length);
  assert.ok(gelesen.befund.length > 40, "Der Befundabsatz wurde nicht als Block gelesen");
});

test("Label und Wert duerfen in zwei Zeilen stehen", () => {
  // So setzt jedes Layoutprogramm eine Tabelle: Beschriftung oben, Wert
  // darunter. Wer nur "Label: Wert" liest, liest kein einziges PDF.
  const gelesen = vorlageLesen("Shkalla\ne rëndë\nPustula\ntë shumta\n");
  assert.equal(gelesen.schwere, "schwer");
  assert.equal(gelesen.parameter[0].id, "pustula");
  assert.equal(gelesen.parameter[0].wert, "të shumta");
});

test("aus Worten werden Stufen, und Zahlen schlagen Worte", () => {
  // Die Bruecke zwischen dem, was Dr. Gashi schreibt, und dem, was der
  // Balken zeigt. "rreth 10-15 të dukshme" ist eine Messung; das Wort
  // daneben ist nur ein Wort.
  assert.equal(stufeAus("rreth 10-15 të dukshme"), 3);
  assert.equal(stufeAus("nuk dallohen qartë"), 0);
  assert.equal(stufeAus("minimal në foto"), 1);
  assert.equal(stufeAus("e moderuar"), 3);
  assert.equal(stufeAus("e rëndë"), 4);

  // Die Falle, an der eine naive Zuordnung scheitert: "i lehtë deri i
  // moderuar" enthaelt BEIDE Worte. Es ist zwei, nicht eins und nicht drei.
  assert.equal(stufeAus("i lehtë deri i moderuar"), 2);
  assert.equal(stufeAus("të pranishme në disa zona"), 2);
});

test("was nicht erkennbar ist, wird nicht erfunden", () => {
  // Ein erfundener Messwert auf einem Befund ist schlimmer als ein
  // fehlender. Ohne Stufe zeigt die Seite den Text und keinen Balken.
  assert.equal(stufeAus(""), null);
  assert.equal(stufeAus("hmm"), null);

  const leer = vorlageLesen("Guten Tag\nnichts davon passt hier\n");
  assert.equal(leer.schwere, "");
  assert.equal(leer.iga, null);
  assert.deepEqual(leer.parameter, []);
});

test("jeder Parameter hat beide Sprachen und einen Erklaersatz", () => {
  // Das Fragezeichen an jeder Zeile ist der Grund, warum die Seite
  // technisch aussehen darf: Ein Fachwort, das man antippen und verstehen
  // kann, wirkt kompetent. Eines ohne Erklaerung wirkt nach Abzocke.
  for (const p of PARAMETER) {
    for (const feld of ["sq", "de", "hinweisSq", "hinweisDe"]) {
      assert.ok(p[feld] && p[feld].length > 3, `${p.id}: ${feld} fehlt`);
    }
  }
  assert.equal(new Set(PARAMETER.map((p) => p.id)).size, PARAMETER.length,
    "Zwei Parameter tragen dieselbe Kennung");
});
