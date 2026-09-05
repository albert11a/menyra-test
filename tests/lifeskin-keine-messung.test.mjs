import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { erstelleBefund } from "../apps/lifeskin/lifeskin-rules.js";
import { STANDARD_PRODUKTE, STANDARD_KONFIG } from "../apps/lifeskin/lifeskin-catalog.js";
import { OBERFLAECHE } from "../apps/lifeskin/lifeskin-content.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
// Ohne Kommentarzeilen - sonst schlaegt die Suche auf den Erklaerungen an,
// die genau beschreiben, was entfernt wurde.
const appMitKommentaren = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
const app = appMitKommentaren.replace(/^[ \t]*\/\/.*$/gm, "");

// Der Patient bekommt keinen einzigen Messwert zu sehen.
//
// Der Grund ist eine Rechnung, keine Vorsicht: Eine falsche Stufe kostet
// nicht einen Kunden mit halber Wahrscheinlichkeit, sie kostet ihn ganz. Wer
// bei reiner Haut "deutliche Pigmentflecken" liest, weiss, dass die Maschine
// sich irrt - und glaubt danach auch der Aerztin nicht mehr. Der Schaden
// trifft das Einzige, was hier wirklich verkauft: ihren Namen.
//
// Keine dieser Zahlen ist je gegen einen echten Fall geprueft worden.
// Solange das so ist, bleiben sie auf der Seite unsichtbar.

test("waehrend der Aufnahme steht kein gemessener Wert auf dem Bildschirm", () => {
  assert.ok(!html.includes('id="ls-messwerte"'), "Das Wertefeld steht noch im HTML");
  for (const zeichen of ["ITA ", "a* ", "ls-messwert"]) {
    assert.ok(!app.includes(zeichen), `Der Trichter zeigt weiterhin "${zeichen}"`);
  }
});

test("der Zaehler bleibt - er sagt etwas ueber die Aufnahme, nicht ueber die Haut", () => {
  assert.ok(html.includes('id="ls-messzaehler"'));
  assert.ok(app.includes("ringGemessen"));
});

test("der Ergebnisbildschirm nennt weder Hauttyp noch Befund noch Stufe", () => {
  const anfang = app.indexOf("#befundZeigen() {");
  const ende = app.indexOf("// ---------- Empfehlung ----------", anfang);
  const block = app.slice(anfang, ende);

  // Alles, was eine Aussage ueber die Haut waere, wird nur noch versteckt.
  for (const kennung of ["#ls-hauttyp", "#ls-lob", "#ls-schwerpunkt", "#ls-werte", "#ls-kombi"]) {
    assert.ok(block.includes(kennung), `${kennung} wird nicht behandelt`);
  }
  assert.ok(block.includes("ls-verstecken"), "Die Befundfelder werden nicht versteckt");
  // Und nichts wird mehr hineingeschrieben.
  assert.ok(!/STUFEN_TEXTE|BEFUND_TEXTE|hauptbefunde/.test(block),
    "Der Ergebnisbildschirm schreibt weiterhin Befundtexte");
});

test("stattdessen stehen dort die drei eigenen Aufnahmen", () => {
  assert.ok(html.includes('id="ls-aufnahmen"'));
  const anfang = app.indexOf("#befundZeigen() {");
  const block = app.slice(anfang, app.indexOf("// ---------- Empfehlung ----------", anfang));
  for (const blick of ["gerade", "rechts", "links"]) {
    assert.ok(block.includes(`"${blick}"`), `Die Aufnahme "${blick}" fehlt`);
  }
});

test("der Text verspricht die Aerztin, nicht die Maschine", () => {
  for (const sprache of ["sq", "de"]) {
    const text = OBERFLAECHE.aufnahmenText[sprache];
    assert.ok(text && text.length > 40, `aufnahmenText fehlt fuer ${sprache}`);
    assert.ok(/Gashi/.test(text), "Der Satz nennt die Aerztin nicht");
  }
  // Der Titel sagt nicht mehr "das ist Ihr Hautbild".
  assert.ok(!/Hautbild|lëkura juaj\./.test(OBERFLAECHE.befundTitel.de + OBERFLAECHE.befundTitel.sq));
});

// Gerechnet und gespeichert wird weiter alles - sonst haette die Aerztin in
// Heart nichts, worauf sie schauen kann, und der spaetere automatische
// Befundentwurf keine Grundlage.
test("der Befund wird weiterhin gerechnet und bleibt vollstaendig", () => {
  const messung = {
    stirn: { helligkeit: 62, roetung: 14, hautton: 40, textur: 1.4, linien: 12, glanz: 0.09, pigment: 0.05, poren: 0.03 },
    nase: { helligkeit: 62, roetung: 15, hautton: 40, textur: 1.5, linien: 12, glanz: 0.12, pigment: 0.05, poren: 0.05 },
    wangeLinks: { helligkeit: 60, roetung: 16, hautton: 38, textur: 1.6, linien: 11, glanz: 0.05, pigment: 0.06, poren: 0.02 },
    wangeRechts: { helligkeit: 60, roetung: 16, hautton: 38, textur: 1.6, linien: 11, glanz: 0.05, pigment: 0.06, poren: 0.02 },
    kinn: { helligkeit: 61, roetung: 14, hautton: 39, textur: 1.5, linien: 11, glanz: 0.07, pigment: 0.05, poren: 0.03 }
  };
  const befund = erstelleBefund({
    messung, altersgruppe: "25-34",
    produkte: STANDARD_PRODUKTE, konfig: STANDARD_KONFIG
  });
  assert.ok(befund.hauttyp?.id, "Kein Hauttyp mehr");
  assert.ok(befund.befunde.length > 0, "Keine Befunde mehr");
  assert.equal(befund.empfehlung.length, STANDARD_KONFIG.setGroesse);
});

test("die Sitzung schreibt Hauttyp und Befunde weiterhin nach Heart", () => {
  assert.ok(app.includes('this.sitzung.schritt("result"'), "Der Schritt result fehlt");
  const anfang = app.indexOf('this.sitzung.schritt("result"');
  const block = app.slice(anfang, anfang + 300);
  assert.ok(block.includes("skinType"), "skinType wird nicht mehr gespeichert");
  assert.ok(block.includes("findings"), "findings werden nicht mehr gespeichert");
});
