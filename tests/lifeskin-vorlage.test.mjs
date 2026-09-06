import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  PARAMETER, FELDER, stufeAus, vorlageLesen, pdfText,
  csvLesen, csvVorlage, jsonLesen, jsonVorlage
} from "../shared/lifeskin-analyse.js";

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

// ---------- Die Tabelle ----------
//
// Eine Datei je Patient, zwei Spalten. Das ist der Weg, der taeglich
// benutzt wird - PDF und Textvorlage sind die Rueckwege. Was hier bricht,
// bricht bei fuenfzig Analysen am Tag fuenfzigmal.

test("die erzeugte Tabelle laesst sich vollstaendig zurueckleisen", () => {
  // Die Vorlage wird aus dem Katalog erzeugt und nicht daneben gepflegt.
  // Dieser Test ist die Naht dazwischen: Wenn ein Feld dazukommt, muss es
  // durch die Vorlage und wieder heraus kommen, ohne dass jemand daran
  // denkt.
  const gelesen = csvLesen(csvVorlage());
  assert.equal(gelesen.schwere, "mittel", "Der Schweregrad kam nicht durch");
  assert.equal(gelesen.iga, 3);
  assert.equal(gelesen.parameter.length, PARAMETER.length, "Nicht alle Messwerte kamen durch");
  assert.equal(gelesen.produkte.length, 2, "Die Produktkennungen wurden nicht getrennt");
  assert.equal(gelesen.produkte[0].id, "lifeskin-akne");
  assert.ok(gelesen.produkte[0].satz, "Der Satz zum ersten Produkt fehlt");
  assert.equal(gelesen.preis, 53);
  assert.equal(gelesen.javet.length, 4, "Der Vier-Wochen-Plan kam nicht durch");
  for (const feld of ["kodi", "diagnoza", "tipiLekures", "zonat", "befund",
                      "paTrajtim", "kurMjek", "keshilla"]) {
    assert.ok(gelesen[feld], `${feld} kam nicht durch die Tabelle`);
  }
});

test("jedes Feld des Katalogs steht in der Vorlage", () => {
  // Ein Feld, das das Programm kennt und die Vorlage nicht, ist ein Feld,
  // das nie ausgefuellt wird.
  const vorlage = csvVorlage();
  for (const f of FELDER) {
    assert.ok(vorlage.includes(f.sq), `"${f.sq}" fehlt in der Vorlage`);
    assert.ok(f.hilfe && f.hilfe.length > 5, `${f.id} hat keine Erklaerung`);
  }
  assert.equal(new Set(FELDER.map((f) => f.id)).size, FELDER.length,
    "Zwei Felder tragen dieselbe Kennung");
});

test("Komma, Semikolon und Tabulator gehen alle drei", () => {
  // Excel schreibt je nach Landeseinstellung Semikolon statt Komma. Wer
  // nur Komma liest, bekommt von der Haelfte der Rechner eine leere Seite.
  const komma = csvLesen("fusha,vlera\nShkalla,e rëndë\nPustula,të shumta\n");
  const strich = csvLesen("fusha;vlera\nShkalla;e rëndë\nPustula;të shumta\n");
  const tab = csvLesen("fusha\tvlera\nShkalla\te rëndë\nPustula\ttë shumta\n");
  for (const [name, gelesen] of [["Komma", komma], ["Semikolon", strich], ["Tabulator", tab]]) {
    assert.equal(gelesen.schwere, "schwer", `${name} wurde nicht als Trenner erkannt`);
    assert.equal(gelesen.parameter[0].wert, "të shumta", `${name}: der Wert kam nicht durch`);
  }
});

test("ein Komma im Befundtext zerschneidet den Satz nicht", () => {
  // Der Fehler, der einen Befund mitten im Wort abschneidet: In einem
  // Befundtext stehen Kommas, und ein Komma in Anfuehrungszeichen ist ein
  // Komma und keine neue Spalte.
  const gelesen = csvLesen(
    'fusha,vlera\n' +
    '"Përfundimi për pacientin","Lëkura juaj është e yndyrshme, me pore të zgjeruara. Kjo trajtohet."\n'
  );
  assert.match(gelesen.befund, /pore të zgjeruara/, "Der Satz wurde am Komma abgeschnitten");
  assert.match(gelesen.befund, /Kjo trajtohet/);

  // Und Anfuehrungszeichen im Text selbst, verdoppelt geschrieben.
  const mitAnf = csvLesen('fusha,vlera\nDiagnoza,"Akne ""vulgaris"", inflamatore"\n');
  assert.equal(mitAnf.diagnoza, 'Akne "vulgaris", inflamatore');
});

test("die Kennung geht genauso wie die albanische Beschriftung", () => {
  // Wer die Tabelle aus einem anderen Programm exportiert, hat dort
  // vielleicht die kurzen Kennungen stehen. Beides muss treffen.
  const gelesen = csvLesen("fusha,vlera\niga,4\nshkalla,e rëndë\nlezione,rreth 30\n");
  assert.equal(gelesen.iga, 4);
  assert.equal(gelesen.parameter[0].id, "lezione");
  assert.equal(gelesen.parameter[0].stufe, 4, "30 Stellen sind keine Vier");
});

test("die breite Form geht auch - Kopfzeile oben, Werte darunter", () => {
  const gelesen = csvLesen("Shkalla,Vlerësimi IGA,Pustula\ne lehtë,1,të pakta\n");
  assert.equal(gelesen.schwere, "leicht");
  assert.equal(gelesen.iga, 1);
  assert.equal(gelesen.parameter[0].wert, "të pakta");
});

test("ein halber Wochenplan wird nicht halb uebernommen", () => {
  // Vier Zeilen sind ein Verlauf mit einem Ende. Zwei Zeilen sind ein
  // abgebrochener Satz - dann lieber der ganze Standardplan.
  const halb = csvLesen("fusha,vlera\nJava 1,Fillon\nJava 2,Vazhdon\n");
  assert.deepEqual(halb.javet, [], "Ein halber Plan wurde uebernommen");
  const ganz = csvLesen("fusha,vlera\nJava 1,A\nJava 2,B\nJava 3,C\nJava 4,D\n");
  assert.deepEqual(ganz.javet, ["A", "B", "C", "D"]);
});

test("eine leere Tabelle erfindet nichts", () => {
  const leer = csvLesen(csvVorlage({ beispiele: false }));
  assert.equal(leer.schwere, "");
  assert.equal(leer.iga, null);
  assert.deepEqual(leer.parameter, []);
  assert.deepEqual(leer.produkte, []);
  assert.equal(leer.preis, null);
  assert.deepEqual(leer.javet, []);
});

test("Heart prueft die Fallnummer, bevor es etwas uebernimmt", () => {
  // Die eine Pruefung, die wirklich schuetzt. Bei fuenfzig Analysen am Tag
  // ist die Verwechslung zweier Tabellen kein unwahrscheinlicher Fall, und
  // ein fremder Befund auf der Seite eines Patienten waere der teuerste
  // Fehler, den dieses System machen kann.
  const heartQuelle = readFileSync(join(wurzel, "apps/mnyra-heart/heart.js"), "utf8");
  const stelle = heartQuelle.indexOf("async function lifeskinVorlageLesen");
  const koerper = heartQuelle.slice(stelle, heartQuelle.indexOf("\n}", stelle));
  assert.match(koerper, /gelesen\.kodi/, "Die Fallnummer aus der Tabelle wird nicht gelesen");
  assert.match(koerper, /offenerCode/, "Sie wird nicht gegen den offenen Fall gehalten");
  // Und bei Abweichung wird NICHTS uebernommen, nicht nur gewarnt.
  const pruefung = koerper.slice(koerper.indexOf("offenerCode"));
  assert.match(pruefung.slice(0, 900), /return;/,
    "Bei falscher Fallnummer laeuft die Uebernahme trotzdem weiter");
});

// ---------- JSON ----------
//
// Der bequemste Weg von allen, und der einzige, der nicht an
// Excel-Eigenheiten haengt. Wer die Analyse in einem anderen Fenster
// erzeugt, hat sie in der Zwischenablage - nicht als Datei.

test("die JSON-Vorlage laesst sich vollstaendig zurueckleisen", () => {
  const gelesen = jsonLesen(jsonVorlage());
  assert.equal(gelesen.schwere, "mittel");
  assert.equal(gelesen.iga, 3);
  assert.equal(gelesen.parameter.length, PARAMETER.length, "Nicht alle Messwerte kamen durch");
  assert.equal(gelesen.produkte.length, 2);
  assert.equal(gelesen.produkte[0].id, "lifeskin-akne");
  assert.ok(gelesen.produkte[0].satz);
  assert.equal(gelesen.preis, 53);
  assert.equal(gelesen.javet.length, 4);
  for (const feld of ["kodi", "diagnoza", "tipiLekures", "zonat", "befund",
                      "paTrajtim", "kurMjek", "keshilla"]) {
    assert.ok(gelesen[feld], `${feld} kam nicht durch das JSON`);
  }
});

test("JSON und Tabelle ergeben dasselbe", () => {
  // Zwei Wege, ein Ergebnis. Sonst haengt das Aussehen der Patientenseite
  // davon ab, welchen Weg jemand zufaellig genommen hat.
  const ausJson = jsonLesen(jsonVorlage());
  const ausCsv = csvLesen(csvVorlage());
  for (const feld of ["schwere", "iga", "kodi", "diagnoza", "befund", "preis"]) {
    assert.deepEqual(ausJson[feld], ausCsv[feld], `${feld} unterscheidet sich zwischen JSON und Tabelle`);
  }
  assert.deepEqual(
    ausJson.parameter.map((p) => [p.id, p.wert, p.stufe]),
    ausCsv.parameter.map((p) => [p.id, p.wert, p.stufe]),
    "Die Messwerte unterscheiden sich zwischen JSON und Tabelle"
  );
});

test("JSON darf verschachtelt sein und deutsche Namen tragen", () => {
  // Wer eine Analyse von Hand oder von einem Programm erzeugen laesst,
  // soll sich nicht nach unserer Schachtelung richten muessen.
  const gelesen = jsonLesen(JSON.stringify({
    Fallnummer: "LS-1",
    vleresimi: { Schweregrad: "e rëndë", "Vlerësimi IGA": 4 },
    matjet: { pie: { vlera: "e moderuar" }, noduse: "nuk dallohen qartë" }
  }));
  assert.equal(gelesen.kodi, "LS-1");
  assert.equal(gelesen.schwere, "schwer");
  assert.equal(gelesen.iga, 4);
  assert.equal(gelesen.parameter.length, 2);
  assert.equal(gelesen.parameter.find((p) => p.id === "pie").wert, "e moderuar");
});

test("JSON kann mehr als zwei Produkte - die Tabelle kann das nicht", () => {
  // Der eine echte Vorteil: Die Tabelle braucht fuer jeden Anwendungssatz
  // eine eigene Spalte, JSON nicht.
  const gelesen = jsonLesen(JSON.stringify({
    produktet: [
      { id: "a", perdorimi: "X" },
      { id: "b", perdorimi: "Y" },
      { id: "c" },
      "d"
    ]
  }));
  assert.equal(gelesen.produkte.length, 4);
  assert.deepEqual(gelesen.produkte[0], { id: "a", satz: "X" });
  assert.deepEqual(gelesen.produkte[3], { id: "d", satz: "" });
});

test("kaputtes JSON sagt WO es kaputt ist", () => {
  // Ein fehlendes Komma ist der haeufigste Fehler beim Einfuegen von Hand.
  // "Ungueltig" ohne Zeilenangabe hilft dabei niemandem - schon gar nicht
  // jemandem, der gerade fuenfzig Analysen vor sich hat.
  assert.throws(
    () => jsonLesen('{\n  "shkalla": "e moderuar"\n  "iga": 3\n}'),
    (fehler) => /Zeile \d+/.test(fehler.message) && /Komma/.test(fehler.message),
    "Der Fehler nennt weder Zeile noch die wahrscheinliche Ursache"
  );
  assert.throws(() => jsonLesen(""), /nichts eingefuegt/i);
  assert.throws(() => jsonLesen('{"hallo": "welt"}'), /kein einziges bekanntes Feld/i);
});

test("Heart nimmt JSON auf beiden Wegen an - Datei und eingefuegt", () => {
  const heartQuelle = readFileSync(join(wurzel, "apps/mnyra-heart/heart.js"), "utf8");
  assert.match(heartQuelle, /jsonLesen/, "Heart liest gar kein JSON");
  assert.match(heartQuelle, /siehtNachJsonAus/,
    "Eine JSON-Datei mit falscher Endung wird nicht erkannt");
  // Und das Eingefuegte laeuft durch dieselbe Pruefung wie eine Datei -
  // sonst haette der bequemere Weg die schwaechere Kontrolle.
  const stelle = heartQuelle.indexOf("async function lifeskinJsonUebernehmen");
  assert.ok(stelle > 0, "Es gibt keinen Weg fuer eingefuegtes JSON");
  const koerper = heartQuelle.slice(stelle, heartQuelle.indexOf("\n}", stelle));
  assert.match(koerper, /lifeskinVorlageLesen/,
    "Eingefuegtes JSON umgeht die Pruefung der Fallnummer");
});
