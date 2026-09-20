// Die Regeln muessen durchlassen, was der Trichter schickt.
//
// DER AUSFALL AUS DEM BETRIEB: Der Trichter nahm zehn Bilder auf, in
// Firestore kamen drei an, und die Befundseite des Patienten sagte
// "Kjo analizë nuk u gjet." Drei Regeln haben das verursacht, alle drei
// still - der Trichter schickt und wartet nicht auf ein Ja:
//
//   1. photos/{blick}: blick durfte nur "gerade", "rechts", "links" sein.
//      "gerade-2", "rechts-3", "oben" wurden abgelehnt.
//   2. sessions: die Liste der Blickrichtungen durfte drei Namen haben.
//      Mit zehn fiel der ganze Schritt "captured" weg - samt Messwerten.
//   3. reports: die Zahl der Fotos durfte hoechstens neun sein. Mit zehn
//      wurde die Befundseite gar nicht erst angelegt.
//
// Diese Pruefung liest die Regeldatei und haelt sie gegen das, was der
// Trichter wirklich schreibt. Sie braucht keinen Emulator: Was hier
// schiefgeht, ist kein Verhalten, sondern eine Zahl.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const REGELN = lies("firestore.rules");
const APP = lies("apps/lifeskin/lifeskin-app.js");

// Die Namen, die der Trichter vergibt: das beste Bild je Richtung traegt
// ihren Namen, die weiteren zaehlen dahinter.
function namenAusTrichter() {
  const treffer = APP.match(/FOTOS_JE_BLICK = Object\.freeze\(\{([^}]+)\}\)/);
  assert.ok(treffer, "Die Tabelle FOTOS_JE_BLICK ist nicht auffindbar");
  const namen = [];
  for (const stueck of treffer[1].split(",")) {
    const [blick, anzahl] = stueck.split(":").map((x) => x.trim());
    if (!blick) continue;
    for (let i = 1; i <= Number(anzahl); i += 1) namen.push(i === 1 ? blick : `${blick}-${i}`);
  }
  return namen;
}

test("die Regel laesst jeden Namen durch, den der Trichter vergibt", () => {
  const zeile = REGELN.match(/data\.blick\.matches\("([^"]+)"\)/);
  assert.ok(zeile, "Die Blickrichtung wird nicht mehr geprueft - das ist zu viel Durchlass");
  const muster = new RegExp(zeile[1]);
  const abgelehnt = namenAusTrichter().filter((name) => !muster.test(name));
  assert.deepEqual(abgelehnt, [], `Diese Bilder wuerden still abgelehnt: ${abgelehnt.join(", ")}`);
});

test("die Regel laesst NICHT alles durch", () => {
  const muster = new RegExp(REGELN.match(/data\.blick\.matches\("([^"]+)"\)/)[1]);
  for (const boese of ["../../andere", "gerade-99", "irgendwas", "", "unten"]) {
    assert.ok(!muster.test(boese), `"${boese}" darf keine Blickrichtung sein`);
  }
});

test("die Liste in der Sitzung fasst alle Bilder", () => {
  const treffer = REGELN.match(/data\.photos is list && data\.photos\.size\(\) <= (\d+)/);
  assert.ok(treffer, "Die Liste der Blickrichtungen wird nicht geprueft");
  assert.ok(Number(treffer[1]) >= namenAusTrichter().length,
    `Die Liste fasst ${treffer[1]}, der Trichter schickt ${namenAusTrichter().length}`);
});

test("die Zahl im Bericht fasst alle Bilder", () => {
  // An dieser Zahl hing die Befundseite: Wird sie abgelehnt, gibt es keinen
  // Bericht - und der Patient sieht "nicht gefunden".
  const treffer = REGELN.match(/data\.photos is int && data\.photos >= 0 && data\.photos <= (\d+)/);
  assert.ok(treffer, "Die Zahl der Fotos wird nicht geprueft");
  assert.ok(Number(treffer[1]) >= namenAusTrichter().length,
    `Der Bericht laesst ${treffer[1]} Fotos zu, der Trichter meldet ${namenAusTrichter().length}`);
});

test("der Bericht wird nicht mehr still uebergangen", () => {
  // Er ist der Zweck des ganzen Trichters. Scheitert er, wird es ein
  // zweites Mal versucht, und die Antwort geht nach oben - statt in der
  // Kette zu verschwinden wie eine Zaehlung.
  const sitzung = lies("apps/lifeskin/lifeskin-session.js");
  const block = sitzung.slice(sitzung.indexOf("berichtAnlegen("), sitzung.indexOf("zustandSchreiben("));
  assert.match(block, /return antwort\.ok \|\| antwort\.status === 409/,
    "Das Ergebnis des Schreibens geht nicht nach oben");
  assert.ok((block.match(/await schreiben\(\w+\)/g) || []).length >= 2,
    "Es gibt keinen zweiten Versuch");

  // UND DER ZWEITE VERSUCH LAESST DEN TYP WEG.
  //
  // GESEHEN, NICHT BEFUERCHTET: Der Trichter ging live, bevor die
  // Firestore-Regeln den Typ kannten. hasOnly() weist das GANZE Dokument
  // ab, sobald ein Feld darin steht, das die Regel nicht kennt - der
  // Bericht entstand nicht, und auf der Warteseite stand "Kjo analizë nuk
  // u gjet.", bei allen vier Wegen.
  //
  // Der Typ entscheidet nur, wie die Warteseite formuliert. Der Bericht
  // SELBST ist der Fall: lieber allgemeiner formuliert als gar nicht da.
  assert.match(block, /const ohneTyp = \{ \.\.\.daten \};[\s\S]{0,60}delete ohneTyp\.typ;/,
    "Der zweite Versuch schickt dasselbe noch einmal - und faellt aus demselben Grund");
  assert.match(block, /await schreiben\(ohneTyp\)/,
    "Der zweite Versuch benutzt den Satz ohne den Typ nicht");
});
