// JEDER SATZ DER PATIENTENSEITE IST EINZELN ERSETZBAR.
//
// Vier Dinge, die zusammengehoeren:
//
//   1. Die Textkarte kennt jeden Text der Seite. Kommt in astra-texte.js
//      einer dazu, ohne dass er in der Karte steht, ist er nicht
//      aenderbar - und das faellt sonst erst jemandem auf, der ihn
//      vergeblich sucht.
//   2. Die Patientenseite fragt bei JEDEM Text zuerst den Befund. Wer das
//      umgeht und irgendwo t(TEXTE.x) schreibt, baut einen Satz ein, der
//      sich nicht mehr aendern laesst.
//   3. Leer heisst Standard. Ein geleertes Feld stellt den Text der Seite
//      wieder her, es speichert keine Leerzeile.
//   4. Die Markierung sagt, was gefuellt ist und was nicht - im Befund
//      wie in den Texten.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  TEXT_ABSCHNITTE, TEXT_SCHLUESSEL, TEXT_HOECHSTLAENGE, standardText, texteSaeubern
} from "../apps/lifeskin-astra/astra-texte-plan.js";
import { TEXTE, NDJEKJA, PYETJET } from "../apps/lifeskin-astra/astra-texte.js";
import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import {
  baueKennzahlen, baueTrichter, baueHerkunft, baueVerteilung, normalisiere
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { ohneKommentare, methode } from "./lifeskin-quelle.mjs";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const ASTRA = lies("apps/lifeskin-astra/astra.js");
const HEART = lies("apps/mnyra-heart/heart.js");
const ADAPTER = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
const EVENTS = lies("apps/mnyra-heart/heart-events.js");

// ---------------------------------------------------------------------------
// Die Karte ist vollstaendig
// ---------------------------------------------------------------------------

test("jeder Text der Seite steht in der Karte - genau einmal", () => {
  for (const schluessel of Object.keys(TEXTE)) {
    assert.ok(TEXT_SCHLUESSEL.includes(schluessel),
      `${schluessel} steht in astra-texte.js, aber nicht in der Textkarte - er waere nicht aenderbar`);
  }
  const doppelt = TEXT_SCHLUESSEL.filter((k, i) => TEXT_SCHLUESSEL.indexOf(k) !== i);
  assert.deepEqual(doppelt, [], "Ein Schluessel steht zweimal in der Karte");
});

test("auch die Listen sind drin: drei Schritte, sechs Fragen, ein Kontakt", () => {
  for (let n = 1; n <= NDJEKJA.length; n += 1) {
    for (const teil of ["Marke", "Titel", "Text"]) {
      assert.ok(TEXT_SCHLUESSEL.includes(`ndjekja${n}${teil}`), `ndjekja${n}${teil} fehlt`);
    }
  }
  for (let n = 1; n <= PYETJET.length; n += 1) {
    assert.ok(TEXT_SCHLUESSEL.includes(`pyetje${n}Pyetja`), `pyetje${n}Pyetja fehlt`);
    assert.ok(TEXT_SCHLUESSEL.includes(`pyetje${n}Pergjigja`), `pyetje${n}Pergjigja fehlt`);
  }
  for (const teil of ["kontaktTitel", "kontaktText", "kontaktKnopf"]) {
    assert.ok(TEXT_SCHLUESSEL.includes(teil), `${teil} fehlt`);
  }
});

test("zu jedem Schluessel gibt es den Satz, der ohne Eintrag dasteht", () => {
  const leer = TEXT_SCHLUESSEL.filter((k) => !standardText(k));
  assert.deepEqual(leer, [], "Ohne Standardtext ist das Feld im Formular eine leere Zeile ohne Sinn");
  assert.equal(standardText("gibtEsNicht"), "");
});

test("die Abschnitte tragen Titel und einen Satz, der sagt, worum es geht", () => {
  assert.ok(TEXT_ABSCHNITTE.length >= 10, "Ohne Abschnitte ist das Formular eine Wand");
  for (const abschnitt of TEXT_ABSCHNITTE) {
    assert.ok(abschnitt.id && abschnitt.titel && abschnitt.fuss, `${abschnitt.id} ist unvollstaendig`);
    assert.ok(abschnitt.schluessel.length > 0);
  }
});

// ---------------------------------------------------------------------------
// Was gespeichert wird
// ---------------------------------------------------------------------------

test("leer heisst Standard - und wird gar nicht erst gespeichert", () => {
  const raus = texteSaeubern({ laedt: "  ", wegTitel: "  Nuk u gjet  ", pyetje1Pyetja: "" });
  assert.deepEqual(raus, { wegTitel: "Nuk u gjet" });
});

test("nur bekannte Schluessel, nur Zeichenketten, und keine ohne Ende", () => {
  const raus = texteSaeubern({
    laedt: "Po hapet",
    erfunden: "geht nicht",
    wegTitel: 42,
    wegText: "x".repeat(TEXT_HOECHSTLAENGE + 500)
  });
  assert.deepEqual(Object.keys(raus).sort(), ["laedt", "wegText"]);
  assert.equal(raus.wegText.length, TEXT_HOECHSTLAENGE);
  assert.deepEqual(texteSaeubern(null), {});
  assert.deepEqual(texteSaeubern("kein Objekt"), {});
});

test("Heart liest die Felder und legt sie an den Befund", () => {
  const quelle = ohneKommentare(HEART);
  assert.match(quelle, /querySelectorAll\("\[data-text\]"\)/);
  assert.match(quelle, /texteSaeubern\(texteRoh\)/);
  assert.match(quelle, /texte,/);
  // Und der Schreibweg legt sie wirklich ab.
  assert.match(ohneKommentare(ADAPTER), /texte: texte && Object\.keys\(texte\)\.length \? texte : \{\}/);
});

// ---------------------------------------------------------------------------
// Die Patientenseite nimmt sie
// ---------------------------------------------------------------------------

test("jeder Text der Seite geht durch die eine Stelle, die den Befund fragt", () => {
  const quelle = ohneKommentare(methode(ASTRA, "text"));
  assert.match(quelle, /this\.daten\?\.texte\?\.\[schluessel\]/);
  assert.match(quelle, /standardText/);

  // KEIN t(TEXTE.x) mehr ausserhalb dieser Stelle: Ein solcher Satz waere
  // nicht mehr aenderbar, und niemand wuesste, warum.
  const ohneMethode = ohneKommentare(ASTRA).replace(ohneKommentare(methode(ASTRA, "text")), "");
  assert.doesNotMatch(ohneMethode, /\bt\(TEXTE\./);
  // Auch die Listen gehen darueber.
  assert.doesNotMatch(ohneMethode, /t\(schritt\./);
  assert.doesNotMatch(ohneMethode, /t\(eintrag\.(pyetja|pergjigja)/);
  assert.doesNotMatch(ohneMethode, /NDJEKJA_KONTAKT/);
});

// ---------------------------------------------------------------------------
// Was Heart daraus zeichnet
// ---------------------------------------------------------------------------

const EINE = {
  id: "abc", createdAt: new Date().toISOString(), step: "result",
  name: "Arta", ageBand: "25-34", code: "LS-1", sprache: "sq"
};

function zeichne(zusatz = {}) {
  const sitzungen = [normalisiere(EINE.id, EINE)];
  return renderLifeskin({
    status: "ready", loadedFrom: "network", sitzungen, tests: [], produkte: [], abdeckung: [],
    kennzahlen: baueKennzahlen(sitzungen), trichter: baueTrichter(sitzungen),
    herkunft: baueHerkunft(sitzungen), verteilung: baueVerteilung(sitzungen),
    offen: "abc", fotos: {}, fotosStatus: "", berichte: {}, ...zusatz
  });
}

test("der Befund steht in Schritten; die Texte der alten Seite liegen zugeklappt darunter", () => {
  const html = zeichne();
  assert.match(html, /data-bogen="befund"/);
  assert.match(html, /data-bogen="texte"/);
  for (const titel of ["Therapie wählen", "Prompt kopieren", "Antwort der KI einfügen", "Therapieseite prüfen", "Freigeben"]) {
    assert.ok(html.includes(titel), titel);
  }
  assert.ok(html.indexOf("Therapie wählen") < html.indexOf("Prompt für diesen Fall"), "Erst waehlen, dann Prompt");
  assert.ok(html.indexOf('data-bogen="texte"') > html.indexOf("Alte Analyseseite"), "Die alten Texte liegen im Klappteil");
});

test("umgeschaltet wird OHNE Zustandsaenderung - sonst waere alles Getippte weg", () => {
  const quelle = ohneKommentare(EVENTS);
  const block = quelle.slice(quelle.indexOf('action === "lifeskin-bogen"'));
  const ende = block.indexOf("return;");
  const koerper = block.slice(0, ende);
  assert.match(koerper, /root\.querySelectorAll/);
  assert.doesNotMatch(koerper, /operations\./, "Ein Umschalten ueber den Zustand wischt den Bogen weg");
});

test("alle Texte stehen im Formular, jeder mit seinem Standardsatz", () => {
  const html = zeichne();
  for (const schluessel of TEXT_SCHLUESSEL) {
    assert.ok(html.includes(`data-text="${schluessel}"`), `${schluessel} fehlt im Formular`);
  }
  assert.ok(html.includes("Po hapet analiza juaj"), "Der Standardsatz steht nicht am Feld");
});

test("ein eigener Text steht im Feld und wird gezaehlt", () => {
  const html = zeichne({ berichte: { abc: { status: "fertig", texte: { laedt: "Diçka tjetër" } } } });
  assert.ok(html.includes("Diçka tjetër"));
  assert.match(html, /Zurzeit 1 eigene/);
});

// ---------------------------------------------------------------------------
// Die Markierung
// ---------------------------------------------------------------------------

test("jedes Feld sagt, ob es gefuellt ist - im Befund wie in den Texten", () => {
  const html = zeichne({
    berichte: { abc: { status: "fertig", raport: { gjetjet: "Ka bllokim." }, texte: { laedt: "Tjetër" } } }
  });
  // Der Befund: gefuellt, wo das JSON etwas hinterlassen hat.
  assert.match(html, /data-fuellung-fuer="raport:gjetjet"[^>]*data-voll="ja"/);
  assert.match(html, /data-fuellung-fuer="raport:keshilla"[^>]*data-voll="nein"/);
  // Die Texte: eigener Text oder Standard.
  assert.match(html, /data-fuellung-fuer="text:laedt"[^>]*data-voll="ja"/);
  assert.match(html, /data-fuellung-fuer="text:wegTitel"[^>]*data-voll="nein"/);
  assert.ok(html.includes(">eigener Text<") && html.includes(">Standard<"));
});

test("die Markierung folgt dem Tippen und dem Uebernehmen", () => {
  const quelle = ohneKommentare(HEART);
  assert.match(quelle, /function lifeskinMarkenAuffrischen/);
  // Nach dem Uebernehmen des JSON - sonst stuende dort weiter "leer",
  // gerade wenn die Frage am dringendsten ist.
  const fuellen = quelle.slice(quelle.indexOf("function lifeskinBogenFuellen"));
  assert.match(fuellen.slice(0, fuellen.indexOf("\n}\n")), /lifeskinMarkenAuffrischen\(\)/);
  // Und bei jedem Tastendruck.
  assert.match(ohneKommentare(EVENTS), /\[data-raport\], \[data-text\]/);
});

// ---------------------------------------------------------------------------
// Freigegeben heisst fertig
// ---------------------------------------------------------------------------

test("eine echte Freigabe legt den Fall ins Fach 'ready' - eine Vorschau nicht", () => {
  const quelle = ohneKommentare(HEART);
  assert.match(quelle, /\.\.\.\(nurStaff \? \{\} : \{ fach: "ready" \}\)/);
});
