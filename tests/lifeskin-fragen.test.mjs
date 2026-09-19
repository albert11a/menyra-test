import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { FRAGEN, FRAGEN_NACH_SCAN, FRAGEN_PA_SKANIM, FRAGEN_PA_SKANIM_NUMRI,
  FRAGEN_TEXTE, t } from "../apps/lifeskin/lifeskin-content.js";
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

test("der Vorrat ist der Vorrat - gestellt wird je Weg eine eigene Auswahl", () => {
  // FRAGEN ist seit dem zweiten Weg nicht mehr die Strecke, sondern der
  // Vorrat: Die lange Fassung stellt sechs davon, der Weg ohne Scan vier
  // andere. Was hier gilt, gilt deshalb fuer den Vorrat, und die Laenge
  // JE STRECKE steht darunter - dort kostet eine Frage zu viel wirklich
  // Abschluesse.
  assert.equal(FRAGEN.length, 7, "Der Vorrat ist gewachsen, ohne dass eine Strecke ihn braucht");
  assert.deepEqual(FRAGEN.map((f) => f.id),
    ["anliegen", "mosha", "lekura", "kohezgjatja", "kujdesi", "emri", "numri"]);
  // Getippt wird ZULETZT, und in dieser Reihenfolge: erst wer er ist, dann
  // wie man ihn erreicht. Eine Tastatur am Anfang ist eine Huerde, eine
  // Tastatur am Ende ist der letzte Schritt vor dem Ergebnis.
  assert.equal(FRAGEN.at(-2).typ, "text");
  assert.equal(FRAGEN.at(-1).typ, "tel");
  const getippt = FRAGEN.filter((f) => f.typ === "text" || f.typ === "tel");
  assert.equal(getippt.length, 2, "Mehr getippte Felder als Name und Nummer");
  assert.deepEqual(getippt.map((f) => f.id), ["emri", "numri"]);
});

// VIER FRAGEN JE STRECKE, NICHT MEHR - und das ist hier keine Vorliebe,
// sondern die Schrittfolge: Die Sitzung kennt pyetja1 bis pyetja4. Eine
// fuenfte Frage braucht erst eine fuenfte Stufe in allen vier Kopien der
// Schrittfolge, und bis die ausgerollt ist, weist hasOnly() den GANZEN
// Schreibvorgang ab - lautlos. Genau so sind hier dreimal Daten
// verschwunden.
test("keine Strecke stellt mehr Fragen, als die Schrittfolge zaehlen kann", () => {
  for (const [name, strecke] of [["nach dem Scan", FRAGEN_NACH_SCAN],
    ["ohne Scan", FRAGEN_PA_SKANIM], ["die Nummer", FRAGEN_PA_SKANIM_NUMRI]]) {
    const zumAntippen = strecke.filter((f) => f.typ !== "text" && f.typ !== "tel");
    assert.ok(zumAntippen.length <= 4,
      `Die Strecke "${name}" stellt ${zumAntippen.length} Fragen - pyetja5 gibt es nicht`);
    // Und jede Strecke ist aus dem Vorrat gegriffen, nicht abgeschrieben:
    // Sonst liefen Text und Pruefung der einen Frage an zwei Stellen
    // auseinander.
    for (const frage of strecke) {
      assert.ok(FRAGEN.some((f) => f.id === frage.id),
        `"${frage.id}" steht in "${name}", aber in keinem Vorrat`);
    }
  }
});

// DER WEG OHNE SCAN LIEFERT KEIN BILD - und darum ist das hier alles,
// was Dr. Gashi ueber diesen Menschen bekommt.
test("ohne Scan wird gefragt, was ohne Bild nicht zu sehen ist", () => {
  assert.deepEqual(FRAGEN_PA_SKANIM.map((f) => f.id),
    ["anliegen", "lekura", "kohezgjatja", "kujdesi"]);
  // Alles zum Antippen: Die Tastatur kommt erst beim Namen, und der steht
  // hinter diesen vieren.
  for (const frage of FRAGEN_PA_SKANIM) {
    assert.ok(Array.isArray(frage.antworten) && frage.antworten.length >= 2,
      `${frage.id}: keine Antworten zum Antippen`);
  }
  // Die Nummer kommt zuletzt und allein - hinter Name und Alter.
  assert.deepEqual(FRAGEN_PA_SKANIM_NUMRI.map((f) => f.id), ["numri"]);
  assert.equal(FRAGEN_PA_SKANIM_NUMRI[0].typ, "tel",
    "Die Nummer bekommt nicht die Zifferntastatur");
  // Dieselbe Kennung wie im Vorrat, damit sie in derselben Zeile der
  // Anamnese landet - nur der Satz darunter ist ein anderer: Auf diesem
  // Weg wird keine Analyse fertig, auf die man hingewiesen werden
  // koennte.
  const ausVorrat = FRAGEN.find((f) => f.id === "numri");
  assert.equal(FRAGEN_PA_SKANIM_NUMRI[0].titel, ausVorrat.titel);
  assert.notEqual(t(FRAGEN_PA_SKANIM_NUMRI[0].unter, "sq"), t(ausVorrat.unter, "sq"));
  assert.match(t(FRAGEN_PA_SKANIM_NUMRI[0].unter, "sq"), /WhatsApp/);
});

// Wer ohne Scan kommt, liefert kein Bild - und dann ist eine geratene
// Beschwerde schlimmer als gar keine: Sie geht in den Prompt und sieht
// dort aus wie eine Auskunft.
test("das Anliegen hat einen Ausweg, und er raeumt die anderen weg", () => {
  const anliegen = FRAGEN.find((f) => f.id === "anliegen");
  const weissNicht = anliegen.antworten.find((a) => a.id === "nukEdi");
  assert.ok(weissNicht, "Es gibt keine Antwort fuer den, der es nicht weiss");
  assert.equal(weissNicht.alleine, true,
    "'Weiss nicht' laesst sich mit einer Beschwerde zusammen antippen");
  assert.equal(anliegen.antworten.at(-1).id, "nukEdi",
    "Der Ausweg steht vorne - dann ist er der schnellste Weg durch die Frage");
});

test("jede Frage und jede Antwort steht in beiden Sprachen", () => {
  for (const frage of FRAGEN) {
    assert.ok(t(frage.titel, "sq") && t(frage.titel, "de"), `${frage.id}: Titel fehlt in einer Sprache`);
    if (frage.typ === "text" || frage.typ === "tel") {
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
  const anliegen = FRAGEN.find((f) => f.id === "anliegen");
  const ids = anliegen.antworten.map((a) => a.id);
  assert.ok(ids.includes("poret") && ids.includes("shkelqimi"),
    "Poren und Glanz stehen wieder in einer Zeile");
  assert.equal(anliegen.hoechstens, 2, "Mehr als zwei Anliegen sind keine Anliegen mehr");
});

// Die Altersgruppen muessen dieselben sein, gegen die der Befund vergleicht.
test("die Altersgruppen kommen aus dem Katalog", () => {
  assert.deepEqual(FRAGEN.find((f) => f.id === "mosha").antworten.map((a) => a.id),
    [...ALTERSGRUPPEN]);
});

// Sonst steht im Fall "nichts davon UND schwanger", und die Aerztin muss
// raten, was gemeint war.
test("keines davon schliesst die anderen aus", () => {
  // Per Kennung und nicht per Platznummer: Der Vorrat waechst, wenn ein
  // Weg eine Frage braucht, und ein Test, der an FRAGEN[3] haengt, prueft
  // danach die falsche Frage.
  const kujdesi = FRAGEN.find((f) => f.id === "kujdesi");
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
  // SCHIRME ist die Vereinigung beider Fassungen: Die lange geht
  // Einstieg, Vorbereitung, Kamera, Fragen, Aufbereitung; die kurze geht
  // Einstieg, Kamera, Name+Alter, Aufbereitung. Was hier zaehlt, ist die
  // Reihenfolge - die Fragen stehen hinter der Kamera.
  const treffer = app.match(/const SCHIRME = \[([^\]]+)\]/);
  assert.ok(treffer, "SCHIRME nicht gefunden");
  const schirme = [...treffer[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(schirme.indexOf("fragen") > schirme.indexOf("kamera"),
    "Die Fragen stehen wieder vor der Aufnahme");
  assert.ok(schirme.indexOf("name") > schirme.indexOf("kamera"),
    "Name und Alter stehen wieder vor der Aufnahme");
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
  assert.match(schreiben, /einzeln\.ageBand = mosha/);
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
  assert.match(schreiben, /einzeln\.name = emri\.slice\(0, 80\)/,
    "Der Name wird nicht geschrieben oder nicht auf die erlaubte Laenge gekuerzt");
  assert.match(schreiben, /this\.zustand\.name = einzeln\.name/,
    "Der Bericht wird ohne Namen angelegt");
  const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
  const erlaubt = regeln.slice(regeln.indexOf("lifeskinSessionShapeOk"));
  assert.match(erlaubt, /data\.name is string && data\.name\.size\(\) <= 80/);
});

// Das Textfeld schreibt beim Tippen NICHT mit - sonst stuende je Buchstabe
// ein Schreibvorgang in der Leitung.
test("das Getippte wird einmal geschrieben, nicht je Buchstabe", () => {
  const ab = app.indexOf("\n  #frageWeiter()");
  const weiter = app.slice(ab, app.indexOf("\n  #frageZurueck()", ab));
  assert.match(weiter, /this\.#frageSchreiben\(\);/,
    "Beim Weitergehen aus dem Feld wird nichts geschrieben");
  // Und erst NACH der Pruefung: Eine untaugliche Nummer soll gar nicht
  // erst in der Sitzung landen.
  assert.ok(weiter.indexOf("#antwortTaugt") < weiter.indexOf("#frageSchreiben()"),
    "Geschrieben wird, bevor geprueft ist");
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
  // EIN VOLLSTAENDIG BEANTWORTETER FALL, also MIT Nummer. Hier stand sie
  // nicht, und darum blieb unbemerkt, dass jeder echte Fall das Kopieren
  // zum Absturz brachte: Jeder Patient, der durch den Trichter geht, hat
  // eine Nummer - der Fall ohne sie ist der, den es nicht gibt.
  const sitzung = {
    name: "Arta", ageBand: "25-34", phone: "+38344123456",
    anamnese: {
      anliegen: ["pucrrat", "njollat"], mosha: "25-34",
      lekura: "thate", kujdesi: ["izotretinoin"], emri: "Arta",
      numri: "044 123 456"
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

// WAS GETIPPT WIRD, HAT KEINE ANTWORTLISTE - und wer sie trotzdem
// durchsucht, bringt das Kopieren zum Absturz.
//
// Genau das geschah, als die Nummer als sechste Frage dazukam: Sie traegt
// `typ: "tel"`, uebersprungen wurde aber nur `typ === "text"`. Die Nummer
// lief in frage.antworten.find() hinein, wo es keine Liste gibt, und der
// Arzt bekam statt des Prompts die Meldung "undefined is not an object
// (evaluating 'frage.antworten.find')". Kein Fall liess sich mehr kopieren.
//
// Geprueft wird gegen JEDE getippte Frage, nicht gegen die Nummer allein:
// Die naechste faellt sonst genauso durch.
test("eine getippte Frage bringt das Kopieren nicht zum Absturz", () => {
  const getippt = FRAGEN.filter((f) => !Array.isArray(f.antworten));
  assert.ok(getippt.length >= 2, "Die getippten Fragen sind verschwunden - prueft der Test noch etwas?");
  for (const frage of getippt) {
    const anamnese = { anliegen: ["poret"], [frage.id]: "044 123 456" };
    const p = promptFuellen(VORLAGE, { anamnese });
    assert.equal(p.hyrja.anamneza.pyetjet.length, 1,
      `${frage.id}: die getippte Frage steht als Anamnesezeile im Prompt`);
  }
});

// DIE NUMMER GEHT NICHT AN DIE ANALYSE. Sie sagt nichts ueber die Haut,
// und ein Text, der aus dem Haus geht, traegt keine Telefonnummer mit, nur
// weil sie zufaellig im selben Feld steht. Heart liest sie in session.phone
// - dort gehoert sie hin.
test("die Telefonnummer steht in keinem Feld des Prompts", () => {
  const nummer = "044123456";
  const p = promptFuellen(VORLAGE, {
    name: "Arta", ageBand: "25-34", phone: `+383${nummer}`,
    anamnese: { anliegen: ["poret"], emri: "Arta", numri: nummer }
  });
  assert.ok(!JSON.stringify(p).includes(nummer),
    "Die Telefonnummer des Patienten steht im kopierten Prompt");
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
  const anliegen = FRAGEN.find((f) => f.id === "anliegen").antworten.map((a) => t(a.text, "sq"));
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

// EIN ABGEWIESENES FELD DARF NUR SICH SELBST KOSTEN.
//
// Die Firestore-Regeln pruefen mit hasOnly gegen das ganze Dokument: Ein
// Feld, das die erlaubte Liste nicht kennt, weist den GANZEN Schreibvorgang
// ab - still, mit 403, und der Trichter laeuft weiter.
//
// Genau das geschah hier. `anamnese` stand in firestore.rules, aber die
// Regeln waren noch nicht ausgerollt; weil Anamnese, Altersgruppe und Name
// in einem Vorgang gingen, nahm das eine abgewiesene Feld die zwei mit, die
// laengst erlaubt waren. Im kopierten Prompt stand danach gar nichts ueber
// den Patienten.
//
// Derselbe Fehler zum dritten Mal - erst die Messwerte, dann zehn Fotos,
// dann die Anamnese. Getrennt geschrieben kann er sich nicht mehr
// ausbreiten.
test("Anamnese und Stammdaten gehen in getrennten Schreibvorgaengen", () => {
  const ab = app.indexOf("\n  #frageSchreiben()");
  assert.notEqual(ab, -1, "#frageSchreiben nicht gefunden");
  const block = app.slice(ab, app.indexOf("\n  #frageWeiter()", ab));

  const aufrufe = block.match(/this\.sitzung\.ergaenze\(/g) || [];
  assert.equal(aufrufe.length, 2,
    "Anamnese und Stammdaten muessen zwei Schreibvorgaenge sein, nicht einer");

  // Die Anamnese steht allein in ihrem Vorgang ...
  assert.match(block, /this\.sitzung\.ergaenze\(\{ anamnese: \{ \.\.\.this\.fragen\.antworten \} \}\)/,
    "Die Anamnese geht nicht allein hinaus");
  // ... und Name und Altersgruppe fahren nicht darin mit.
  assert.ok(!/anamnese[\s\S]{0,200}einzeln\.(name|ageBand)/.test(block)
    && !/einzeln\.(name|ageBand)[\s\S]{0,60}anamnese/.test(block),
    "Name oder Altersgruppe haengen noch am Anamnese-Vorgang");

  // Und der Vorgang mit den Stammdaten faellt aus, wenn es keine gibt:
  // ein leerer Schreibvorgang ist eine Leitung ohne Fracht.
  assert.match(block, /if \(Object\.keys\(einzeln\)\.length\)/,
    "Ein leerer Stammdaten-Vorgang wird nicht vermieden");
});

// Der Verlauf gehoert in die Dokumentation, nicht in die Anweisung.
test("der Prompt traegt keinen Fassungsverlauf mehr", () => {
  const prompt = JSON.parse(readFileSync(join(wurzel, "docs/lifeskin-prompt-v5.json"), "utf8"));
  const kopf = prompt._lexo_kete_para.join(" ");
  assert.ok(!/WAS v5(\.\d)? GEGENUEBER/.test(kopf),
    "Der Fassungsverlauf steht noch im Prompt");
  assert.match(kopf, /docs\/lifeskin-prompt-verlauf\.md/,
    "Der Prompt zeigt nicht, wo der Verlauf steht");
  // Aber was das Modell braucht, steht noch da.
  assert.match(kopf, /v5\.3/);
  assert.match(kopf, /nicht die Schemaversion/);
  assert.match(kopf, /ZWEI BEISPIELBLOECKE/);
  // Und der Verlauf ist wirklich woanders, nicht weg.
  const verlauf = readFileSync(join(wurzel, "docs/lifeskin-prompt-verlauf.md"), "utf8");
  for (const fassung of ["v5 gegenueber v4", "v5.1 gegenueber v5", "v5.2 gegenueber v5.1", "v5.3 gegenueber v5.2"]) {
    assert.ok(verlauf.includes(fassung), `Im Verlauf fehlt ${fassung}`);
  }
});
