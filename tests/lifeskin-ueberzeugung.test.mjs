import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { TEXTE } from "../apps/lifeskin-bericht/bericht-texte.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const bericht = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
const markup = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
const heart = readFileSync(join(wurzel, "apps/mnyra-heart/heart.js"), "utf8");
const adapter = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-adapter.js"), "utf8");
const editor = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-render.js"), "utf8");

// Die Befundseite muss dreiundfuenfzig Euro tragen.
//
// Sie hat das nicht getan, solange darauf ein Absatz Text und zwei Flaschen
// standen: Wer zwei Flaschen sieht, rechnet Flaschenpreise. Was den Preis
// traegt, sind vier Dinge - dass jemand hingesehen hat, dass es eine
// Einordnung gibt, dass es einen Verlauf mit einem Ende gibt, und dass
// dieselbe Aerztin achtundzwanzig Tage lang zusieht.
//
// Diese Datei haelt genau diese vier fest. Sie prueft keine Pixel; ob es
// auf den Bildschirm passt, misst der Playwright-Lauf.

test("jeder Text, den die Seite abruft, steht im Verzeichnis - in beiden Sprachen", () => {
  const abgerufen = new Set(
    [...bericht.matchAll(/this\.text\("([a-zA-Z0-9]+)"/g)].map((m) => m[1])
  );
  // Die Wochen werden zusammengesetzt, nicht buchstabiert.
  for (const nummer of [1, 2, 3, 4]) abgerufen.add(`planJava${nummer}`);
  abgerufen.delete("planJava${nummer}");

  assert.ok(abgerufen.size > 30, `Zu wenige Textschluessel gefunden (${abgerufen.size})`);
  const fehlend = [...abgerufen].filter((k) => !TEXTE[k]);
  assert.deepEqual(fehlend, [], "Diese Schluessel ruft die Seite ab, es gibt sie aber nicht");

  const halb = [...abgerufen].filter((k) => !TEXTE[k]?.sq || !TEXTE[k]?.de);
  assert.deepEqual(halb, [], "Diese Texte fehlen in einer der beiden Sprachen");
});

test("die Seite belegt, dass jemand hingesehen hat", () => {
  // Aufnahmen, Zonen, Zeitpunkt. Ohne diese Zeile ist der Befund ein Text
  // ueber seine Haut; mit ihr hat sich jemand seine Haut angesehen.
  assert.ok(markup.includes('id="lb-beweis"'), "Der Beweisstreifen fehlt im Markup");
  assert.ok(bericht.includes("#beweisZeichnen"), "Der Beweisstreifen wird nicht gezeichnet");
  assert.match(bericht, /beweisFotos[\s\S]{0,80}daten\.photos/,
    "Die Zahl der Aufnahmen ist erfunden statt aus der Sitzung genommen");
  assert.match(bericht, /freigabeAt/,
    "Das Datum ist nicht der Zeitpunkt, an dem Dr. Gashi den Befund freigegeben hat");
});

test("ohne Einordnung durch Dr. Gashi behauptet die Seite keine", () => {
  // Marke und Verlaufskasten haengen beide am Schweregrad. Setzt sie ihn
  // nicht, bleiben beide weg - lieber nichts als eine Diagnose, die
  // niemand gestellt hat.
  for (const methode of ["#gradZeichnen", "#verlaufZeichnen"]) {
    const stelle = bericht.indexOf(`${methode}()`, bericht.indexOf(`${methode}() {`));
    const koerper = bericht.slice(bericht.indexOf(`${methode}() {`), bericht.indexOf("\n  }", stelle));
    assert.match(koerper, /daten\.schwere/, `${methode} liest den Schweregrad nicht`);
    assert.match(koerper, /ls-verstecken/, `${methode} blendet ohne Schweregrad nicht aus`);
  }
});

test("der Schweregrad kommt aus Heart und nirgends sonst her", () => {
  assert.match(editor, /id="lifeskin-schwere"/, "Dr. Gashi hat kein Feld fuer den Schweregrad");
  assert.match(heart, /#lifeskin-schwere/, "Der Schweregrad wird beim Freigeben nicht gelesen");
  assert.match(heart, /gibBerichtFrei\(id, \{[^}]*schwere/, "Der Schweregrad wird nicht mitgeschickt");
  // Und nur die drei Stufen, die es gibt.
  assert.match(adapter, /\["leicht", "mittel", "schwer"\]\.includes\(schwere\)/,
    "Der Adapter schreibt jeden Wert durch, den das Formular liefert");
});

test("was ohne Behandlung passiert, skaliert mit dem Grad", () => {
  // Ein Satz fuer alle drei Stufen waere entweder bei leicht uebertrieben
  // oder bei schwer verharmlosend. Beides kostet Glaubwuerdigkeit.
  const texte = ["ohneLeicht", "ohneMittel", "ohneSchwer"].map((k) => TEXTE[k].sq);
  assert.equal(new Set(texte).size, 3, "Die drei Stufen sagen dasselbe");
});

test("die Seite verkauft eine Therapie mit einem Ende, keine zwei Flaschen", () => {
  assert.ok(markup.includes('id="lb-plan"'), "Der Vier-Wochen-Plan fehlt im Markup");
  for (const nummer of [1, 2, 3, 4]) {
    assert.ok(TEXTE[`planJava${nummer}`]?.sq, `Woche ${nummer} fehlt`);
  }
  // Woche zwei sagt ausdruecklich, dass noch wenig zu sehen ist. Wer das
  // vorher weiss, hoert in Woche zwei nicht auf - und ein Abbrecher in
  // Woche zwei ist ein Patient, der nie wiederkommt.
  assert.match(TEXTE.planJava2.sq, /pak|ende/i,
    "Woche 2 verspricht sichtbare Ergebnisse - genau dort steigen sie sonst aus");
});

test("die Betreuung steht auf der Seite und vor dem Preis", () => {
  // Achtundzwanzig Tage Nachschau sind das Einzige, was kein Regal
  // mitliefert. Sie sind im Preis enthalten, also stehen sie davor.
  assert.ok(markup.includes('id="lb-betreuung"'), "Die Betreuung fehlt im Markup");
  assert.ok(
    markup.indexOf('id="lb-betreuung"') < markup.indexOf('class="lb-preis"'),
    "Die Betreuung steht hinter dem Preis - dort begruendet sie ihn nicht mehr"
  );
  assert.match(TEXTE.betreuungTitel.sq + TEXTE.betreuungText.sq, /28/,
    "Die Zusage nennt die Dauer nicht - 'wir sind da' ohne Zahl ist keine Zusage");
});

// ---------- Die Messung ----------
//
// Der Teil, der die Seite von einer Werbeseite unterscheidet. Ein Adjektiv
// laesst sich wegdiskutieren, ein Wert auf einer Skala nicht.

test("die Messwerte kommen aus der Analyse und nicht aus der Seite", () => {
  assert.ok(markup.includes('id="lb-messblock"'), "Der Messblock fehlt im Markup");
  assert.ok(bericht.includes("#messZeichnen"), "Die Messwerte werden nicht gezeichnet");
  // Ohne Werte kein Block. Acht leere Balken auf einem Befund waeren
  // schlimmer als gar keine.
  const koerper = bericht.slice(bericht.indexOf("#messZeichnen() {"), bericht.indexOf("// Die Erklaerung zu einem Fachwort"));
  assert.match(koerper, /ls-verstecken/, "Ohne Messwerte bleibt der Block trotzdem stehen");
  assert.match(koerper, /daten\.analyse/, "Die Werte werden nicht aus dem Befund gelesen");
  assert.ok(!/Math\.random|\bfake|beispiel/i.test(koerper), "Hier werden Werte erfunden");
});

test("jede Zeile laesst sich antippen und erklaeren", () => {
  // Der Punkt, an dem "technisch" und "0 kompliziert" zusammengehen: Das
  // Fachwort darf dastehen, WEIL ein Fingertipp es in einem Satz aufloest.
  assert.match(bericht, /#infoZeigen/, "Es gibt keine Erklaerung zu den Fachworten");
  assert.match(bericht, /data-info/, "Die Fragezeichen sind nicht verdrahtet");
  assert.ok(markup.includes('data-info="iga"'), "Die IGA-Skala hat kein Fragezeichen");
  assert.ok(markup.includes('data-info="grenzen"'), "Die Grenzen der Messung sind nicht antippbar");
});

test("die Seite nennt die Grenzen ihrer eigenen Messung", () => {
  // Freiwillig, und deshalb traegt es: Wer sagt, was er NICHT weiss, wird
  // beim Rest geglaubt. Auf einer Seite, die 53 Euro will, ist das kein
  // Beiwerk, sondern die Grundlage.
  assert.ok(TEXTE.grenzenText?.sq && TEXTE.grenzenText?.de, "Der Grenzentext fehlt");
  assert.match(TEXTE.grenzenText.sq, /mjek/i, "Die Grenzen verweisen nicht auf den Arzt");
  assert.ok(
    markup.indexOf('id="lb-messblock"') < markup.indexOf('class="lb-preis"'),
    "Die Messung steht hinter dem Preis - dort begruendet sie ihn nicht mehr"
  );
});
