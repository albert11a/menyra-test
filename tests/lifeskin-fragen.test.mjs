import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { FRAGEN, FRAGEN_TEXTE, t } from "../apps/lifeskin/lifeskin-content.js";
import { ALTERSGRUPPEN } from "../apps/lifeskin/lifeskin-catalog.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");

// Die vier kurzen Fragen nach der Aufnahme.
//
// Ein frueherer Entwurf hatte sieben und verzweigte je nach Anliegen. Das
// war medizinisch richtig und hier trotzdem falsch: Der Trichter stellt
// keine Diagnose, das tut Dr. Gashi aus Foto UND Antworten. Was er liefern
// muss, ist das Anliegen - jede Frage darueber hinaus kostet Abschluesse.

test("vier Fragen, keine mehr", () => {
  assert.equal(FRAGEN.length, 4, "Die Liste ist gewachsen - jede Frage kostet Abschluesse");
  assert.deepEqual(FRAGEN.map((f) => f.id), ["anliegen", "mosha", "lekura", "kujdesi"]);
});

test("jede Frage und jede Antwort steht in beiden Sprachen", () => {
  for (const frage of FRAGEN) {
    assert.ok(t(frage.titel, "sq") && t(frage.titel, "de"), `${frage.id}: Titel fehlt in einer Sprache`);
    assert.ok(frage.antworten.length >= 2, `${frage.id}: zu wenige Antworten`);
    const ids = new Set();
    for (const antwort of frage.antworten) {
      assert.ok(antwort.id, `${frage.id}: Antwort ohne Kennung`);
      assert.ok(!ids.has(antwort.id), `${frage.id}: Kennung ${antwort.id} steht zweimal`);
      ids.add(antwort.id);
      assert.ok(t(antwort.text, "sq") && t(antwort.text, "de"),
        `${frage.id}/${antwort.id}: fehlt in einer Sprache`);
    }
    // Eine Mehrfachwahl ohne Knopf haette keinen Weg weiter.
    if (frage.hoechstens) assert.ok(frage.hoechstens >= 2);
  }
  for (const schluessel of ["zaehler", "weiter", "einleitung"]) {
    assert.ok(t(FRAGEN_TEXTE[schluessel], "sq") && t(FRAGEN_TEXTE[schluessel], "de"),
      `FRAGEN_TEXTE.${schluessel} fehlt in einer Sprache`);
  }
});

// Poren und Glanz sind zwei verschiedene Beschwerden, auch wenn beide zum
// selben Set fuehren. Wer sie in eine Zeile packt, erfaehrt nie, welche der
// beiden die Leute wirklich stoert.
test("das Anliegen fragt einzeln, nicht in Paaren", () => {
  const anliegen = FRAGEN[0];
  const ids = anliegen.antworten.map((a) => a.id);
  assert.ok(ids.includes("poret") && ids.includes("shkelqimi"),
    "Poren und Glanz stehen wieder in einer Zeile");
  assert.equal(anliegen.hoechstens, 2, "Mehr als zwei Anliegen sind keine Anliegen mehr");
});

// Die Altersgruppen muessen dieselben sein, gegen die der Befund vergleicht.
test("die Altersgruppen kommen aus dem Katalog", () => {
  assert.deepEqual(FRAGEN[1].antworten.map((a) => a.id), [...ALTERSGRUPPEN]);
});

// Sonst steht im Fall "nichts davon UND schwanger", und die Aerztin muss
// raten, was gemeint war.
test("keines davon schliesst die anderen aus", () => {
  const kujdesi = FRAGEN[3];
  const alleine = kujdesi.antworten.filter((a) => a.alleine);
  assert.equal(alleine.length, 1, "Genau eine Antwort darf alleinstehend sein");
  assert.equal(alleine[0].id, "asnjera");
  assert.match(app, /alleine\)\s*\{[\s\S]{0,120}neu = \[antwort\.id\]/,
    "Die alleinstehende Antwort raeumt die anderen nicht weg");
  assert.match(app, /ohneAlleine = bisher\.filter/,
    "Wer etwas anderes waehlt, bleibt auf 'keines davon' stehen");
});

// DIE ZEILE, OHNE DIE ALLES STILL VERSCHWINDET.
//
// hasOnly() prueft das GANZE Dokument. Ein Feld, das dort nicht steht,
// laesst nicht nur sich selbst fallen, sondern jeden Schreibvorgang der
// Sitzung - ohne Fehler, ohne Spur. Genau so sind hier schon einmal alle
// Messwerte verloren gegangen.
test("die Regeln kennen das Feld anamnese", () => {
  const erlaubt = regeln.slice(regeln.indexOf("lifeskinSessionShapeOk"));
  assert.match(erlaubt, /"anamnese"/, "hasOnly() kennt das Feld nicht");
  assert.match(erlaubt, /!\("anamnese" in data\) \|\| data\.anamnese is map/,
    "Die Form des Feldes wird nicht geprueft");
});

test("die Fragen stehen nach der Aufnahme, nicht davor", () => {
  assert.match(app, /const SCHIRME = \["einstieg", "vorbereitung", "kamera", "fragen", "analyse"\]/);
  // Der abgeschlossene Scan fuehrt zu ihnen, nicht gleich zur Aufbereitung.
  const abschluss = app.slice(app.indexOf("async #ringAbschluss"));
  assert.match(abschluss.slice(0, abschluss.indexOf("\n  #")), /this\.#fragenZeigen\(\)/,
    "Nach der Aufnahme kommt wieder gleich die Aufbereitung");
  assert.match(html, /id="ls-fragen"/, "Der Fragenschirm fehlt im Aufbau");
});

// Wer bei der dritten Frage aufhoert, hinterlaesst trotzdem zwei - und
// genau die Faelle sind es, aus denen man lernt, welche Frage zu viel war.
test("jede Antwort wird sofort geschrieben", () => {
  // Die DEFINITION, nicht den Aufruf - der steht davor im Knopf.
  const getippt = app.slice(app.indexOf("\n  #frageGetippt("), app.indexOf("\n  #frageMarkieren("));
  const treffer = getippt.match(/this\.#frageSchreiben\(\)/g) || [];
  assert.equal(treffer.length, 2, "Nicht jeder Weg durch die Antwort schreibt");
  // Und die Altersgruppe geht ausserdem in ihr eigenes Feld, das die Regeln
  // laengst kennen.
  const ab = app.indexOf("\n  #frageSchreiben()");
  const schreiben = app.slice(ab, app.indexOf("\n  #", ab + 10));
  assert.match(schreiben, /daten\.ageBand = mosha/);
});

// Die Aufbereitung nennt die Altersgruppe ("Vergleich mit {gruppe}"). Seit
// der Namensschirm aus dem Weg ist, war sie dort leer - jetzt ist sie
// beantwortet, bevor der Satz erscheint.
test("die Altersgruppe steht fest, bevor die Aufbereitung sie nennt", () => {
  const ab = app.indexOf("\n  #frageSchreiben()");
  const schreiben = app.slice(ab, app.indexOf("\n  #", ab + 10));
  assert.match(schreiben, /this\.zustand\.altersgruppe = mosha/,
    "Die Aufbereitung zeigt wieder eine leere Altersgruppe");
  assert.ok(app.indexOf("#fragenZeigen()") < app.indexOf("async #analyseZeigen"),
    "Die Fragen stehen nach der Aufbereitung");
});
