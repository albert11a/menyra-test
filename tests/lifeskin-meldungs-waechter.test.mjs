// Der Meldungs-Waechter - die Zwischenloesung, solange die Cloud Function
// nicht deployt ist.
//
// WAS HIER WIRKLICH AUF DEM SPIEL STEHT: Der Waechter sieht nur den ZUSTAND
// einer Sitzung, nicht den Uebergang. Er kann also nicht wissen, ob eine
// Analyse gerade ankam oder vor drei Wochen. Faellt das Zeitfenster weg
// oder der Deckel, schickt der erste Lauf jede Sitzung, die je bis zum Scan
// gekommen ist - im Betrieb sind das heute einunddreissig - auf ein
// einziges Telefon. Das holt niemand zurueck.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  FENSTER_MS,
  HOECHSTENS_JE_LAUF,
  MELDUNGEN,
  SCHRITTE,
  baueMeldung,
  faelligeMeldungen,
  meldungsKennung,
  schrittIndex,
  sitzungsZeit,
  zeitAus
} from "../scripts/meldungs-waechter/meldungs-regeln.mjs";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const FUNKTIONEN = lies("functions/index.js");
const WAECHTER = lies("scripts/meldungs-waechter/waechter.mjs");
const WORKFLOW = lies(".github/workflows/mnyra-lifeskin-meldungen.yml");

const JETZT = Date.parse("2026-09-16T10:00:00Z");
const frisch = (minuten = 5) => new Date(JETZT - minuten * 60000).toISOString();

// ---------------------------------------------------------------------------
// Was gemeldet wird - und vor allem, was nicht
// ---------------------------------------------------------------------------

test("eine frische Analyse wird gemeldet", () => {
  const faellig = faelligeMeldungen({ step: "captured", updatedAt: frisch(3) }, { jetzt: JETZT });
  assert.deepEqual(faellig.map((v) => v.type), ["lifeskin_analyse"]);
});

test("eine alte Analyse wird NICHT gemeldet", () => {
  // Der Fall, der alles kaputt macht: hundertneununddreissig Sitzungen im
  // Betrieb, davon einunddreissig mit Befund. Ohne Fenster meldet der erste
  // Lauf sie alle.
  const alt = new Date(JETZT - FENSTER_MS - 60000).toISOString();
  assert.deepEqual(faelligeMeldungen({ step: "result", updatedAt: alt }, { jetzt: JETZT }), []);
  // Und knapp innerhalb bleibt es eine Meldung.
  const knapp = new Date(JETZT - FENSTER_MS + 60000).toISOString();
  assert.equal(faelligeMeldungen({ step: "result", updatedAt: knapp }, { jetzt: JETZT }).length, 1);
});

test("ohne Zeitstempel wird nicht gemeldet", () => {
  // Eine Sitzung ohne Zeit ist entweder uralt oder kaputt. Beides ist kein
  // Grund, ein Telefon zu wecken.
  assert.deepEqual(faelligeMeldungen({ step: "captured" }, { jetzt: JETZT }), []);
  assert.deepEqual(faelligeMeldungen({ step: "captured", updatedAt: "kein Datum" }, { jetzt: JETZT }), []);
});

test("vor dem Scan wird nichts gemeldet", () => {
  // "opened" ist ein Anzeigenklick. Bei fuenfzig am Tag waeren das fuenfzig
  // Meldungen, von denen keine etwas zu tun gibt.
  for (const step of ["opened", "named", "camera"]) {
    assert.deepEqual(faelligeMeldungen({ step, updatedAt: frisch() }, { jetzt: JETZT }), [],
      `${step} loest eine Meldung aus`);
  }
});

test("eine Bestellung meldet beides - Analyse und Bestellung", () => {
  // Der Waechter sieht nur den Endzustand. Wer bestellt hat, hat auch eine
  // Analyse gemacht; ob die schon gemeldet wurde, entscheidet das Dokument
  // und nicht diese Liste.
  const faellig = faelligeMeldungen({ step: "ordered", updatedAt: frisch() }, { jetzt: JETZT });
  assert.deepEqual(faellig.map((v) => v.type), ["lifeskin_analyse", "lifeskin_porosia"]);
});

test("beide Zeitformen werden gelesen", () => {
  // Der Trichter schreibt beides: echte Zeitstempel aus dem Browser,
  // Zeichenketten aus der REST-Schnittstelle. Wer nur eine Form kennt, haelt
  // die andere fuer "keine Zeit".
  const alsStempel = { toDate: () => new Date(JETZT - 60000) };
  assert.equal(zeitAus(alsStempel), JETZT - 60000);
  assert.equal(zeitAus({ _seconds: Math.round((JETZT - 60000) / 1000) }), JETZT - 60000);
  assert.equal(zeitAus(new Date(JETZT).toISOString()), JETZT);
  assert.equal(zeitAus(null), 0);
  assert.equal(zeitAus("Unsinn"), 0);
  // Und die juengere der beiden Zeiten zaehlt.
  assert.equal(sitzungsZeit({ createdAt: new Date(JETZT - 90000).toISOString(), updatedAt: new Date(JETZT).toISOString() }), JETZT);
});

// ---------------------------------------------------------------------------
// Dieselbe Wahrheit wie in den Cloud Functions
// ---------------------------------------------------------------------------

test("die Schrittfolge stimmt mit der der Cloud Functions ueberein", () => {
  const ausFunktion = FUNKTIONEN
    .slice(FUNKTIONEN.indexOf("const LIFESKIN_SCHRITTE"))
    .match(/\[([\s\S]*?)\]/)[1]
    .match(/"[a-z]+"/g)
    .map((x) => x.replace(/"/g, ""));
  assert.deepEqual([...SCHRITTE], ausFunktion,
    "Waechter und Funktion zaehlen verschiedene Schritte - dann meldet einer von beiden falsch");
});

test("die Kennung ist dieselbe wie die der Cloud Function", () => {
  // DARAN HAENGT DIE DOPPELMELDUNG. Die Funktion bildet
  // sanitizeNotificationDocId(`${type}_${sessionId}`). Weicht der Waechter
  // ab, meldet er ein zweites Mal, was die Funktion gerade gemeldet hat.
  assert.equal(meldungsKennung("lifeskin_analyse", "abc123"), "lifeskin_analyse_abc123");
  assert.equal(meldungsKennung("lifeskin_porosia", "a/b c"), "lifeskin_porosia_a_b_c");
  assert.equal(meldungsKennung("lifeskin_analyse", "x".repeat(300)).length, 180);
  assert.match(FUNKTIONEN, /sanitizeNotificationDocId\(`\$\{vorlage\.type\}_\$\{sessionId\}`\)/,
    "Die Funktion bildet ihre Kennung anders - dann passt die des Waechters nicht mehr");
});

test("auf dem Telefon steht derselbe Satz wie von der Funktion", () => {
  const [analyse, bestellung] = MELDUNGEN;
  assert.equal(analyse.text("Valmire"), "Sie haben eine neue Analyse, Valmire");
  assert.equal(analyse.text(""), "Sie haben eine neue Analyse");
  assert.equal(bestellung.text("Valmire"), "Neue Bestellung, Valmire");
  assert.match(FUNKTIONEN, /Sie haben eine neue Analyse, \$\{name\}/,
    "Der Satz der Funktion hat sich geaendert - der Waechter sagt jetzt etwas anderes");
  assert.match(FUNKTIONEN, /Neue Bestellung, \$\{name\}/);
});

test("das Dokument traegt die Felder, die Heart liest", () => {
  const paket = baueMeldung({
    vorlage: MELDUNGEN[0],
    sessionId: "s1",
    sitzung: { name: "Valmire", step: "captured" },
    uid: "u1"
  });
  assert.equal(paket.type, "lifeskin_analyse");
  assert.equal(paket.text, "Sie haben eine neue Analyse, Valmire");
  assert.equal(paket.user, "", "Ein Akteur rutscht vor den Satz - 'Valmire Sie haben...' ist kein Satz");
  assert.equal(paket.serverAuth, true, "Ohne serverAuth verwirft die Versandfunktion die Meldung");
  assert.equal(paket.link, "/heart/#lifeskin");
  assert.equal(paket.userUid, "u1");
  assert.equal(paket.read, false);
});

// ---------------------------------------------------------------------------
// Die beiden Sicherungen
// ---------------------------------------------------------------------------

test("gemeldet wird nur, was noch nicht dasteht", () => {
  // create() scheitert, wenn das Dokument schon da ist - und genau daran
  // haengt die Entscheidung, ob geschickt wird. Ein set({ merge: true })
  // gelaenge jedes Mal und schickte jede Viertelstunde dieselbe Meldung.
  assert.match(WAECHTER, /await ref\.create\(\{/,
    "Der Waechter schreibt statt anzulegen - dann meldet er alle 15 Minuten neu");
  assert.ok(!/notifications"\)\.doc\(kennung\)\.set\(/.test(WAECHTER),
    "Es wird doch mit set() geschrieben");
  assert.match(WAECHTER, /fehler\?\.code === 6/,
    "Ein schon vorhandenes Dokument wird als Fehler behandelt statt als Normalfall");
  // Und geschickt wird erst NACH dem Anlegen.
  assert.ok(WAECHTER.indexOf("const neu = await meldungAnlegen") < WAECHTER.indexOf("await schicken("),
    "Es wird geschickt, bevor feststeht, ob die Meldung neu ist");
});

test("ein Deckel je Lauf - und er zaehlt Meldungen, nicht Empfaenger", () => {
  assert.equal(HOECHSTENS_JE_LAUF, 5);
  assert.match(WAECHTER, /geschickt >= HOECHSTENS_JE_LAUF/,
    "Ohne Deckel kann ein Lauf beliebig viele Meldungen schicken");
  // Eine Analyse geht an neun Empfaenger. Zaehlte der Deckel die, bliebe er
  // mitten in einem Fall stehen - und die uebrigen Empfaenger erfuehren nie
  // davon, weil beim naechsten Lauf das Dokument schon dasteht.
  assert.match(WAECHTER, /if \(etwasGetan\) geschickt \+= 1;/,
    "Der Deckel zaehlt Empfaenger und bricht mitten in einem Fall ab");
  assert.ok(!/const ergebnis = await schicken\(uid, kennung, nutzlast\);\s*\n\s*geschickt \+= 1;/.test(WAECHTER),
    "Je Empfaenger wird weitergezaehlt");
});

test("das Fenster passt zum Takt des Zeitplans", () => {
  // 45 Minuten sind drei Laeufe: Zwei ausgefallene holt der naechste nach.
  // Ein weiteres Fenster meldet Faelle, die laengst gesehen sind - ein
  // Trockenlauf mit sechs Stunden zeigte heute frueh sechs auf einmal.
  assert.equal(FENSTER_MS, 45 * 60 * 1000);
  const takt = Number(WORKFLOW.match(/cron: "\*\/(\d+) \* \* \* \*"/)[1]) * 60000;
  assert.ok(FENSTER_MS >= takt * 2,
    "Das Fenster ist kuerzer als zwei Laeufe - ein ausgefallener Lauf verliert dann Meldungen");
  assert.ok(FENSTER_MS <= takt * 6,
    "Das Fenster ist so weit, dass laengst gesehene Faelle als neu gemeldet werden");
});

test("dieselbe Marke wie die Cloud Function", () => {
  // Sollten beide einmal schicken, legt das Telefon die zweite Meldung auf
  // die erste, statt zwei anzuzeigen.
  assert.match(WAECHTER, /tag: `menyra_notif_\$\{kennung\}`/, "Die Marke fehlt");
  assert.match(FUNKTIONEN, /tag: `menyra_notif_\$\{notificationId\}`/,
    "Die Funktion markiert anders - dann stapeln sich doppelte Meldungen");
});

test("der Zeitplan sagt, dass er wieder weg gehoert", () => {
  assert.match(WORKFLOW, /cron: "\*\/15 \* \* \* \*"/, "Der Zeitplan steht nicht mehr auf 15 Minuten");
  assert.match(WORKFLOW, /MNYRA_FIREBASE_ADMIN_KEY/, "Der Schluessel wird nicht geprueft");
  // Ein roter Lauf alle 15 Minuten schickt alle 15 Minuten eine Fehlermail -
  // und wer die bekommt, schaltet den Zeitplan ab. Solange der Schluessel
  // fehlt, ist der Zeitplan nicht kaputt, sondern uneingerichtet.
  assert.match(WORKFLOW, /if \[ "\$GITHUB_EVENT_NAME" = "schedule" \]; then/,
    "Ein fehlender Schluessel laesst den Zeitplan rot fehlschlagen");
  assert.match(WORKFLOW, /ueberspringen != 'ja'/,
    "Der uebersprungene Lauf laeuft trotzdem weiter");
  assert.match(WORKFLOW, /npm install --prefix scripts\/meldungs-waechter/,
    "Der Lauf installiert das ganze Projekt - das kostet je Viertelstunde Minuten");
  assert.match(WORKFLOW, /WIEDER ABSTELLEN/,
    "Im Workflow steht nicht, dass er nach dem Deploy wieder weg gehoert");
});

test("Unsinn bringt den Waechter nicht durcheinander", () => {
  assert.equal(schrittIndex("gibtsnicht"), -1);
  assert.equal(schrittIndex(null), -1);
  assert.deepEqual(faelligeMeldungen({}, { jetzt: JETZT }), []);
  assert.deepEqual(faelligeMeldungen(null, { jetzt: JETZT }), []);
  assert.deepEqual(faelligeMeldungen({ step: 42, updatedAt: frisch() }, { jetzt: JETZT }), []);
});
