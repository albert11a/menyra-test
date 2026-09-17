import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { FRAGEN, FRAGEN_TEXTE, t } from "../apps/lifeskin/lifeskin-content.js";
import { ALTERSGRUPPEN } from "../apps/lifeskin/lifeskin-catalog.js";
import { PARAMETER_IDS } from "../shared/lifeskin-raport-v3.js";
import { promptFuellen } from "../apps/mnyra-heart/heart-lifeskin-prompt.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
const VORLAGE = JSON.parse(readFileSync(join(wurzel, "docs/lifeskin-prompt-v5.json"), "utf8"));

// Die vier kurzen Fragen nach der Aufnahme.
//
// Ein frueherer Entwurf hatte sieben und verzweigte je nach Anliegen. Das
// war medizinisch richtig und hier trotzdem falsch: Der Trichter stellt
// keine Diagnose, das tut Dr. Gashi aus Foto UND Antworten. Was er liefern
// muss, ist das Anliegen - jede Frage darueber hinaus kostet Abschluesse.

test("vier Fragen und der Name, keine mehr", () => {
  assert.equal(FRAGEN.length, 5, "Die Liste ist gewachsen - jede Frage kostet Abschluesse");
  assert.deepEqual(FRAGEN.map((f) => f.id), ["anliegen", "mosha", "lekura", "kujdesi", "emri"]);
  // Der Name steht ZULETZT. Er ist das Einzige, was getippt werden muss;
  // eine Tastatur am Anfang ist eine Huerde, eine Tastatur am Ende ist der
  // letzte Schritt vor dem Ergebnis.
  assert.equal(FRAGEN.at(-1).typ, "text");
  assert.equal(FRAGEN.filter((f) => f.typ === "text").length, 1,
    "Mehr als ein getipptes Feld im Trichter");
});

test("jede Frage und jede Antwort steht in beiden Sprachen", () => {
  for (const frage of FRAGEN) {
    assert.ok(t(frage.titel, "sq") && t(frage.titel, "de"), `${frage.id}: Titel fehlt in einer Sprache`);
    if (frage.typ === "text") {
      assert.ok(t(frage.platzhalter, "sq") && t(frage.platzhalter, "de"),
        `${frage.id}: Platzhalter fehlt in einer Sprache`);
      continue;
    }
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

// Der Name steht in einem Feld, das die Regeln laengst kennen - und der
// Bericht redet den Patienten damit an.
test("der Name geht in sein eigenes Feld", () => {
  const ab = app.indexOf("\n  #frageSchreiben()");
  const schreiben = app.slice(ab, app.indexOf("\n  #", ab + 10));
  assert.match(schreiben, /daten\.name = emri\.slice\(0, 80\)/,
    "Der Name wird nicht geschrieben oder nicht auf die erlaubte Laenge gekuerzt");
  assert.match(schreiben, /this\.zustand\.name = daten\.name/,
    "Der Bericht wird ohne Namen angelegt");
  const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
  const erlaubt = regeln.slice(regeln.indexOf("lifeskinSessionShapeOk"));
  assert.match(erlaubt, /data\.name is string && data\.name\.size\(\) <= 80/);
});

// Das Textfeld schreibt beim Tippen NICHT mit - sonst stuende je Buchstabe
// ein Schreibvorgang in der Leitung.
test("der getippte Name wird einmal geschrieben, nicht je Buchstabe", () => {
  const ab = app.indexOf("\n  #frageWeiter()");
  const weiter = app.slice(ab, app.indexOf("\n  #", ab + 10));
  assert.match(weiter, /typ === "text"\) this\.#frageSchreiben\(\)/,
    "Beim Weitergehen aus dem Textfeld wird nichts geschrieben");
  const feld = app.slice(app.indexOf('$("#ls-fragefeld")?.addEventListener'));
  assert.ok(!/#frageSchreiben/.test(feld.slice(0, 400)),
    "Jeder Buchstabe loest einen Schreibvorgang aus");
});

// ---------- Vom Trichter in den Prompt ----------
//
// Im Fall stehen die Antworten kurz ("njollat", "yndyrshme"). Das ist
// richtig fuer eine Datenbank und unbrauchbar fuer eine Analyse: Ein
// Modell, das "yndyrshme" liest, raet. Heart uebersetzt sie beim Kopieren.

// EINE QUELLE, NICHT ZWEI. Hier standen drei Uebersetzungstabellen in
// Heart, und die waren eine Frage der Zeit: Wer im Trichter eine Antwort
// dazunimmt und dort nicht, schickt eine nackte Kennung an die Analyse
// ("yndyrshme"), und die raet dann. Jetzt liest Heart FRAGEN.
// WAS BEIM KOPIEREN WIRKLICH HERAUSKOMMT.
//
// Nicht "im Quelltext steht die richtige Zeile" - das ist nicht dasselbe wie
// "es kommt das Richtige heraus". promptFuellen() ist reines Rechnen und
// laesst sich darum aufrufen.
test("der kopierte Prompt traegt Name, Altersgruppe und die Antworten", () => {
  const sitzung = {
    name: "Arta", ageBand: "25-34",
    anamnese: {
      anliegen: ["pucrrat", "njollat"], mosha: "25-34",
      lekura: "thate", kujdesi: ["izotretinoin"], emri: "Arta"
    }
  };
  const p = promptFuellen(VORLAGE, sitzung);

  assert.equal(p.hyrja.pacienti.emri, "Arta", "Der Name fehlt im Prompt");
  assert.equal(p.hyrja.pacienti.mosha, "25-34", "Die Altersgruppe fehlt im Prompt");

  const zeilen = p.hyrja.anamneza.pyetjet;
  assert.equal(zeilen.length, 4, "Es stehen nicht alle beantworteten Fragen im Prompt");
  // Jede Zeile traegt FRAGE und ANTWORT, in beiden Sprachen.
  for (const zeile of zeilen) {
    for (const feld of ["pyetja", "pyetja_de", "pergjigja", "pergjigja_de"]) {
      assert.ok(zeile[feld], `Eine Zeile traegt ${feld} nicht`);
    }
  }
  // Und zwar wortgleich das, was auf dem Bildschirm stand.
  assert.equal(zeilen[0].pyetja, "Çka ju shqetëson më së shumti?");
  assert.equal(zeilen[0].pergjigja, "Puçrrat; Njollat e errëta");
  assert.equal(zeilen[3].pergjigja_de, "Roaccutane (Isotretinoin), jetzt oder in den letzten 6 Monaten");
  // Der Name ist keine Anamnese - er steht in pacienti und nicht als Frage.
  assert.ok(!zeilen.some((z) => /quheni|heißen/i.test(z.pyetja + z.pyetja_de)),
    "Die Namensfrage steht als Anamnesezeile im Prompt");
});

// Die Vorlage wird bei jedem Fall neu geholt - aber wer sich darauf
// verlaesst, hat beim zweiten Fall die Angaben des ersten im Prompt.
test("das Fuellen aendert die Vorlage nicht", () => {
  const vorher = JSON.stringify(VORLAGE);
  promptFuellen(VORLAGE, { name: "Arta", ageBand: "25-34", anamnese: { anliegen: ["poret"] } });
  assert.equal(JSON.stringify(VORLAGE), vorher, "Die Vorlage traegt jetzt die Angaben eines Patienten");
});

// Wer bei der dritten Frage aufhoert, hinterlaesst zwei - und die gehoeren
// in den Prompt. Eine leere Antwort mitzuschicken waere schlimmer als sie
// wegzulassen: Sie liest sich wie eine verneinte.
test("ein halb beantworteter Fall schickt nur, was beantwortet wurde", () => {
  const p = promptFuellen(VORLAGE, { name: "", ageBand: "", anamnese: { anliegen: ["poret"] } });
  assert.equal(p.hyrja.anamneza.pyetjet.length, 1);
  assert.equal(p.hyrja.anamneza.pyetjet[0].pergjigja, "Poret e mëdha");
  assert.equal(p.hyrja.pacienti.mosha, null, "Eine fehlende Altersgruppe wird als Wert mitgeschickt");

  const leer = promptFuellen(VORLAGE, null);
  assert.deepEqual(leer.hyrja.anamneza.pyetjet, [], "Ein leerer Fall erzeugt Zeilen");
  assert.equal(leer.hyrja.pacienti.emri, "");
});

// Eine unbekannte Kennung - etwa aus einem Fall von vor der Aenderung -
// darf keine nackte Zeile in den Prompt schreiben.
test("eine Kennung, die es nicht mehr gibt, wird weggelassen", () => {
  const p = promptFuellen(VORLAGE, { anamnese: { anliegen: ["gibtsnicht"], lekura: "thate" } });
  const texte = p.hyrja.anamneza.pyetjet.map((z) => z.pergjigja).join(" ");
  assert.ok(!texte.includes("gibtsnicht"), "Eine rohe Kennung steht im Prompt");
  assert.equal(p.hyrja.anamneza.pyetjet.length, 1, "Die uebrigen Antworten fehlen");
});

test("der Prompt verlangt, dass jede Beschwerde im Befund vorkommt", () => {
  const prompt = JSON.parse(readFileSync(join(wurzel, "docs/lifeskin-prompt-v5.json"), "utf8"));
  // Frage UND Antwort, nicht nur die Antwort: Ohne den Wortlaut der Frage
  // weiss das Modell nicht, worauf sich "E thatë" bezieht.
  assert.ok(Array.isArray(prompt.hyrja.anamneza.pyetjet), "hyrja.anamneza traegt keine Frageliste");
  assert.equal(prompt.hyrja.anamneza.pyetjet.length, 0,
    "Die Vorlage traegt Beispielantworten - die werden abgeschrieben");
  assert.ok(Array.isArray(prompt.anamneza_rregullat) && prompt.anamneza_rregullat.length >= 5,
    "Die Regeln zur Anamnese fehlen");
  const regeln = prompt.anamneza_rregullat.join(" ");
  assert.match(regeln, /muss im Befund vorkommen/);
  // Und der Hauptbefund folgt weiter dem Bild, nicht der Beschwerde -
  // sonst spricht die Analyse dem Patienten nur nach.
  assert.match(regeln, /gjetja_kryesore ist die Achse mit dem hoechsten Produkt/);
  // Die zwei Kombinationen, bei denen es wirklich schiefgehen kann.
  assert.match(regeln, /izotretinoin.{0,40}kein lf-acne/s);
  assert.match(regeln, /nevojat bleibt LEER/);
  // Und eine Pruefstufe haelt es nach: Eine Regel ohne Kontrolle wird unter
  // Last uebersprungen.
  const schritte = prompt.kontrolli_para_pergjigjes.join("\n");
  assert.match(schritte, /SCHRITT \d+ - DIE ANGABEN DES PATIENTEN/,
    "Keine Schlusskontrolle prueft, ob die Antworten im Befund stehen");
});

// Die Regel nennt fuer jede Beschwerde den Parameter, der sie traegt. Ein
// Tippfehler darin schickt das Modell auf ein Feld, das es nicht gibt - und
// das faellt erst am leeren Befund auf.
test("jede Beschwerde zeigt auf Parameter, die es wirklich gibt", () => {
  const prompt = JSON.parse(readFileSync(join(wurzel, "docs/lifeskin-prompt-v5.json"), "utf8"));
  const zuordnung = prompt.anamneza_rregullat.find((z) => z.includes("Die Zuordnung:"));
  assert.ok(zuordnung, "Die Zuordnung Beschwerde -> Parameter fehlt");
  const teil = zuordnung.slice(zuordnung.indexOf("Die Zuordnung:"));
  // Jede der sieben Antworten muss vorkommen ...
  const anliegen = FRAGEN[0].antworten.map((a) => t(a.text, "sq"));
  for (const wort of anliegen) {
    assert.ok(teil.includes(wort), `Die Zuordnung kennt "${wort}" nicht`);
  }
  // ... und jeder genannte Parameter muss im Vertrag stehen.
  const genannt = teil.split("->").slice(1)
    .flatMap((stueck) => stueck.split(";")[0].split(" und "))
    .map((w) => w.trim().replace(/[.,]$/, ""))
    .filter((w) => /^[a-z]+$/.test(w));
  assert.ok(genannt.length >= 7, `Zu wenige Parameter in der Zuordnung (${genannt.length})`);
  for (const id of genannt) {
    assert.ok(PARAMETER_IDS.includes(id), `"${id}" ist kein Parameter aus dem Vertrag`);
  }
});

// Der Befund geht unter ihrem Namen hinaus - also traegt er ihre Stimme
// und kein Wort ueber das Werkzeug, das ihn entworfen hat.
test("der Befund ist in der Stimme von Dr. Gashi geschrieben", () => {
  const prompt = JSON.parse(readFileSync(join(wurzel, "docs/lifeskin-prompt-v5.json"), "utf8"));
  assert.match(prompt.roli, /ERSTEN PERSON/);
  assert.match(prompt.roli, /Dr\. Violeta Gashi unterschreibt/);
  assert.match(prompt.roli, /KEIN WORT UEBER DAS WERKZEUG/);
  // Aber keine erfundene Untersuchung: Was eine Aufnahme nicht hergibt,
  // wird gesagt und nicht behauptet.
  assert.match(prompt.roli, /WAS DU NICHT BEHAUPTEST/);
  assert.match(prompt.roli, /beruehrt, abgetastet oder im Sprechzimmer gesehen/);
  // Und die Zeile, die v5 ueberhaupt erst noetig gemacht hat, steht noch.
  assert.match(prompt.roli, /Ein leeres Feld faellt auf der Seite nicht als Luecke auf/);
});
