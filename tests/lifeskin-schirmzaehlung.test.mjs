import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { TRICHTER_STUFEN } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");
const ohneKommentare = (q) => q.replace(/^[ \t]*\/\/.*$/gm, "");

const app = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));
const stil = lies("apps/lifeskin/lifeskin-styles.css");
const session = lies("apps/lifeskin/lifeskin-session.js");

// JEDER BILDSCHIRM ZAEHLT, SOBALD ER DA IST.
//
// Zwei der fuenf Bildschirme des Trichters standen in keiner Zahl: die
// kurzen Fragen nach der Aufnahme und die Aufbereitung danach. Zwischen
// "captured" und "result" lagen damit zwei Bildschirmlaengen, ueber die
// nichts bekannt war - wer dort abbrach, verschwand aus dem Trichter, ohne
// eine Stelle zu hinterlassen. Ein Verlust ohne Ort ist nicht zu beheben.

// Die Bildschirme des Trichters und der Schritt, der zu jedem gehoert.
//
// Der Fragenbildschirm steht sechsmal darin: Jede Frage ist eine eigene
// Gelegenheit wegzugehen, und welche davon es kostet, steht nur da, wenn
// jede ihre eigene Stufe hat.
// FUENF BILDSCHIRME - und zwar die, die es wirklich gibt.
//
// Der Weg ist: Einstieg, Wahl, Kamera, Name+Alter, Aufbereitung. Die vier
// Fragen sind weg, und die Nummer wird nicht mehr im Trichter gefragt -
// sie steht auf der Warteseite, neben WhatsApp.
//
// Ihre Schrittnamen bleiben in SCHRITTE stehen: Die Firestore-Regeln
// lassen genau diese Liste zu, und alte Sitzungen tragen sie. Als STUFE
// steht im Trichter nur noch, was ein Besucher heute erreichen kann.
const SCHIRM_ZU_SCHRITT = [
  ["einstieg", "opened", { imTrichter: false }],
  ["wahl", "wahl"],
  // DIE KAMERA SCHREIBT IHREN SCHRITT, STEHT ABER NICHT ALS ZEILE IM
  // TRICHTER - und das ist seit dem Wahlbildschirm keine Auslassung,
  // sondern die einzige richtige Rechnung: Ein Trichter zaehlt kumulativ,
  // eine Stufe "Skanimi" haette jeden mitgezaehlt, der ohne Scan
  // weitergegangen ist. Der Scan steht in seinem eigenen Kasten daneben
  // (baueWege in heart-lifeskin-berechnung.js), wo jeder der beiden Wege
  // fuer sich zaehlt.
  ["kamera", "camera", { imTrichter: false }],
  ["name", "emri"],
  // DIE WEGE DER MENYRA. Jeder Bildschirm, den es wirklich gibt, hat
  // seinen eigenen Schritt - sonst laege der Verlust zweier Wege in
  // derselben Zahl, und man wuesste nicht, welcher davon haelt.
  //
  // Sie stehen NICHT als Zeile im gemeinsamen Trichter: Der zaehlt
  // kumulativ, und eine Stufe, die nur ein Weg erreicht, zoege die
  // anderen drei mit. Sie stehen je Weg in ihrem eigenen Kasten
  // (baueZweige in heart-lifeskin-berechnung.js).
  ["fotopara", "fotopara", { imTrichter: false }],
  ["foto", "fotokamera", { imTrichter: false }],
  ["foto (fertig)", "fotogati", { imTrichter: false }],
  ["tel", "numri", { imTrichter: false }],
  // Die Aufbereitung schreibt ihren Schritt, steht aber nicht als Zeile im
  // Trichter: Sie ist ein Zwischenstand von sieben Sekunden, den niemand
  // als Entscheidung erlebt - als Stufe waere sie eine Zeile, die keine
  // Frage beantwortet.
  ["analyse", "aufbereitung", { imTrichter: false }]
];

test("jeder Bildschirm des Trichters schreibt seinen eigenen Schritt", () => {
  const schritte = [...session.matchAll(/"([a-z0-9]+)"/g)].map((m) => m[1]);
  for (const [schirm, schritt] of SCHIRM_ZU_SCHRITT) {
    assert.ok(schritte.includes(schritt),
      `Der Bildschirm ${schirm} hat keinen Schritt ${schritt} in SCHRITTE`);
  }
});

test("jede einzelne Frage zaehlt, sobald sie da ist", () => {
  // Der Schritt faellt beim ZEICHNEN, nicht beim Beantworten: Sonst
  // stuende der Verlust bei der Frage davor, und die Zahl zeigte auf die
  // falsche Stelle.
  const zeichnen = app.slice(app.indexOf("\n  #frageZeichnen({"));
  const kopf = zeichnen.slice(0, 700);
  assert.match(kopf, /const schritt = this\.#schrittZurFrage\(this\.fragen\.i\);/,
    "Die einzelne Frage zaehlt nicht");
  assert.match(kopf, /if \(schritt\) this\.sitzung\.schritt\(schritt\);/);

  // Und die Zuordnung ist aus der Reihenfolge gelesen, nicht abgeschrieben.
  // Sie gilt nur noch der langen Fassung: Die kurze zeigt den
  // Fragenbildschirm gar nicht mehr.
  const zuordnung = app.slice(app.indexOf("#schrittZurFrage(i) {"));
  assert.match(zuordnung.slice(0, 400), /frage\.id === "emri"/);
  assert.match(zuordnung.slice(0, 400), /`pyetja\$\{i \+ 1\}`/);

  // AUCH DER NAMENSSCHIRM ZAEHLT BEIM ZEIGEN.
  //
  // Er zaehlte einmal beim Weitergehen, also erst, wenn Name und Alter
  // dastanden - und damit stand sein Verlust beim Bildschirm davor. Seit
  // es vier Wege gibt, ist genau das die Frage: WO gehen sie weg? Die
  // zwei Angaben schreibt #nameWeiter() nach, wenn sie da sind.
  const nameZeigen = app.slice(app.indexOf("#nameZeigen() {"), app.indexOf("#nameZeigen() {") + 400);
  assert.match(nameZeigen, /this\.sitzung\.schritt\("emri"\);/,
    "Der Namensschirm schreibt seinen Schritt nicht");
  const nameWeiter = app.slice(app.indexOf("#nameWeiter() {"), app.indexOf("#nameWeiter() {") + 400);
  assert.match(nameWeiter, /ageBand: this\.zustand\.altersgruppe/,
    "Die Altersgruppe geht nicht mit - dann vergleicht die Aufbereitung gegen nichts");

  // Die Aufbereitung: sieben Sekunden, in denen jemand weggehen kann,
  // nachdem er alles getan hat.
  const analyse = app.slice(app.indexOf("async #analyseZeigen()"));
  const analyseKopf = analyse.slice(0, 400);
  assert.match(analyseKopf, /this\.sitzung\.schritt\("aufbereitung"\)/,
    "Die Aufbereitung zaehlt nicht");
  assert.ok(analyseKopf.indexOf('schritt("aufbereitung")') < analyseKopf.indexOf('zeige("analyse")'),
    "Der Schritt faellt erst nach dem Zeigen");
});

// Vier Kopien derselben Liste - Trichter, Cloud Function, Meldungswaechter
// und Firestore-Regeln. Laufen sie auseinander, meldet eine Seite falsch
// oder ein Schreibvorgang wird still abgewiesen.
test("alle vier Kopien der Schrittfolge sind dieselbe", () => {
  const ausListe = (quelle, marke) => {
    const ab = quelle.indexOf(marke);
    assert.notEqual(ab, -1, `${marke} nicht gefunden`);
    const auf = quelle.indexOf("[", ab);
    return [...quelle.slice(auf, quelle.indexOf("]", auf)).matchAll(/"([a-z0-9]+)"/g)].map((m) => m[1]);
  };
  const trichter = ausListe(session, "const SCHRITTE");
  assert.deepEqual(ausListe(lies("functions/index.js"), "const LIFESKIN_SCHRITTE"), trichter);
  assert.deepEqual(
    ausListe(lies("scripts/meldungs-waechter/meldungs-regeln.mjs"), "export const SCHRITTE"), trichter);

  const regeln = lies("firestore.rules");
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const stelle = regeln.indexOf("data.step in [", anfang);
  const erlaubt = [...regeln.slice(stelle, regeln.indexOf("]", stelle)).matchAll(/"([a-z0-9]+)"/g)]
    .map((m) => m[1]);
  assert.deepEqual(erlaubt, trichter, "Die Regeln kennen andere Schritte als der Trichter");
});

test("Heart zeigt jeden Bildschirm als eigene Stufe", () => {
  const ids = TRICHTER_STUFEN.map((s) => s.id);
  const gezeigt = SCHIRM_ZU_SCHRITT.filter(([, , wie]) => wie?.imTrichter !== false);
  for (const [schirm, schritt] of gezeigt) {
    assert.ok(ids.includes(schritt), `Der Bildschirm ${schirm} fehlt im Trichter von Heart`);
  }
  // Und die Reihenfolge ist die des Wegs - sonst rechnet der Trichter den
  // Verlust an der falschen Stelle.
  const reihe = gezeigt.map(([, schritt]) => ids.indexOf(schritt));
  assert.deepEqual(reihe, [...reihe].sort((a, b) => a - b),
    "Die Stufen stehen nicht in der Reihenfolge des Wegs");
  // Nach dem letzten Bildschirm kommen die drei Stufen, die kein
  // Bildschirm sind: die Warteseite, der Kontakt, den er dort hinterlaesst
  // (Nummer ODER WhatsApp), und WhatsApp fuer sich.
  assert.deepEqual(ids.slice(-3), ["warteseiteGeoeffnet", "erreichbar", "whatsapp"]);
});

// DER WECHSEL, NICHT DER SPRUNG.
//
// Ein Bildschirm, der hart auf den naechsten umschaltet, liest sich wie ein
// Fehler. Die Animation haengt an [data-aktiv="ja"] und nicht an einer
// Klasse, die JavaScript setzt und wieder wegnimmt: Ein Element, das aus
// display:none zurueckkommt, startet seine Animation von selbst neu. Damit
// gibt es keinen Zwischenzustand, in dem ein Bildschirm haengen bleiben
// koennte, und nichts, was aufgeraeumt werden muss.
test("der Wechsel zwischen den Bildschirmen ist animiert", () => {
  assert.match(stil, /\.ls-schirm\[data-aktiv="ja"\][\s\S]{0,1400}animation: ls-schirm-rein/,
    "Der aktive Bildschirm erscheint ohne Uebergang");
  assert.match(stil, /@keyframes ls-schirm-rein[\s\S]{0,200}opacity: 0[\s\S]{0,120}opacity: 1/,
    "Die Animation blendet nicht ein");

  // Kein Aufraeumen in JavaScript: Der Bildschirmwechsel setzt nur
  // data-aktiv, sonst nichts.
  const zeige = app.slice(app.indexOf("\n  zeige(name, {"), app.indexOf("\n  zurueckZu(ziel)"));
  assert.ok(!/animation|classList\.add\("ls-schirm/.test(zeige),
    "Der Wechsel haengt an JavaScript statt an CSS");
});

test("wer Bewegung abbestellt hat, bekommt den Wechsel trotzdem", () => {
  // Ohne Uebergang waere der harte Sprung wieder da. Ein reines Aufblenden
  // ist keine Bewegung im Sinne der Einstellung.
  const block = stil.slice(stil.indexOf("@media (prefers-reduced-motion: reduce) {\n  .ls-schirm"));
  assert.match(block.slice(0, 400), /animation: ls-schirm-auf/,
    "Bei abbestellter Bewegung springt der Bildschirm wieder");
  assert.match(block.slice(0, 400), /@keyframes ls-schirm-auf/);
  assert.ok(!/translate/.test(block.slice(0, 400)), "Es wird trotzdem bewegt");
});

// Ein transform bindet position:fixed an sich. Lagen die drei festen
// Kaesten im Bildschirm, wuerden sie sich waehrend der Bewegung mit
// verschieben - der Fortschrittsbalken waere plotzlich nicht mehr oben.
test("die festen Kaesten liegen ausserhalb der Bildschirme", () => {
  const html = lies("apps/lifeskin/index.html");
  // Der Fortschrittsbalken traegt nur eine Klasse, die beiden anderen eine
  // Kennung - gesucht wird deshalb nach beidem.
  for (const fest of ["ls-fortschritt", "ls-blatt", "ls-fehler"]) {
    const mitId = html.indexOf(`id="${fest}"`);
    const stelle = mitId !== -1 ? mitId : html.indexOf(`class="${fest}"`);
    assert.notEqual(stelle, -1, `${fest} nicht gefunden`);
    const davor = html.slice(0, stelle);
    const offen = (davor.match(/<section class="ls-schirm/g) || []).length;
    const zu = (davor.match(/<\/section>/g) || []).length;
    assert.equal(offen, zu, `${fest} liegt in einem Bildschirm und wuerde mitbewegt`);
  }
});
