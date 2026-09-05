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

// Den Rumpf einer Methode ausschneiden.
//
// Vorher endete der Ausschnitt an der Kommentarmarke "---------- Empfehlung"
// - und die entfernt der Kommentarfilter zwei Zeilen darueber. indexOf gab
// dann -1, slice(a, -1) lieferte die halbe Datei, und der Test prueft
// etwas voellig anderes als er behauptet. Jetzt wird bis zur naechsten
// Methode geschnitten, und die steht im Code, nicht im Kommentar.
function rumpf(name) {
  // Die DEFINITION, nicht die erste Erwaehnung: indexOf findet sonst den
  // Aufruf "this.#befundZeigen();", der weiter oben steht - und der Rumpf
  // waere dann sechzehn Zeichen lang.
  const anfang = app.search(new RegExp(`\\n  (?:async )?${name}\\(`));
  assert.notEqual(anfang, -1, `${name} nicht gefunden`);
  const rest = app.slice(anfang + name.length + 3);
  const naechste = rest.search(/\n  (?:async )?#[A-Za-zÄÖÜäöü][A-Za-z0-9]*\(/);
  assert.notEqual(naechste, -1, `Keine Methode nach ${name}`);
  return rest.slice(0, naechste);
}

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
  const block = rumpf("#befundZeigen");

  // Alles, was eine Aussage ueber die Haut waere, wird nur noch versteckt.
  for (const kennung of ["#ls-hauttyp", "#ls-lob", "#ls-schwerpunkt", "#ls-werte", "#ls-kombi"]) {
    assert.ok(block.includes(kennung), `${kennung} wird nicht behandelt`);
  }
  assert.ok(block.includes("ls-verstecken"), "Die Befundfelder werden nicht versteckt");
  // Und nichts wird mehr hineingeschrieben.
  assert.ok(!/STUFEN_TEXTE|BEFUND_TEXTE|hauptbefunde/.test(block),
    "Der Ergebnisbildschirm schreibt weiterhin Befundtexte");
});

// Auch die Fotos sind weg.
//
// Ein Gesicht in schlechtem Licht, vergroessert auf einem Handybildschirm,
// gefaellt fast niemandem - und der Bildschirm, auf dem entschieden wird,
// ist der falsche Ort dafuer. Sie gehen weiterhin an die Aerztin, nur nicht
// zurueck an den Patienten.
test("der Patient bekommt auch seine Fotos nicht zu sehen", () => {
  const block = rumpf("#befundZeigen");
  assert.ok(block.includes('"#ls-aufnahmen"'), "Der Fotokasten wird nicht behandelt");
  assert.ok(!/kachel|img|createElement\("figure"\)/.test(block),
    "Der Ergebnisbildschirm baut weiterhin Bilder");
});

test("die Fotos gehen trotzdem an die Aerztin", () => {
  assert.ok(app.includes("fotosSpeichern"), "Die Fotos werden nicht mehr gespeichert");
  assert.ok(app.includes("#fotoMerken"), "Es werden keine Fotos mehr aufgenommen");
});

// Was der Patient stattdessen in der Hand haelt: seine Fallnummer.
// Das Einzige nach der Aufnahme, das wahr ist und nicht falsch sein kann.
test("stattdessen steht dort die Fallnummer", () => {
  assert.ok(html.includes('id="ls-aktenummer"'));
  const block = rumpf("#befundZeigen");
  assert.ok(block.includes("this.sitzung.code"), "Die Fallnummer wird nicht angezeigt");
});

test("drei Schritte sind erledigt, einer ist offen", () => {
  const block = rumpf("#aktenschritteZeigen");
  const fertig = (block.match(/fertig: true/g) || []).length;
  const offen = (block.match(/fertig: false/g) || []).length;
  assert.equal(fertig, 3, "Es sollen genau drei Schritte erledigt sein");
  assert.equal(offen, 1, "Genau ein Schritt muss offen bleiben - er ist der Grund weiterzugehen");
  assert.ok(block.includes("akteOffenHinweis"), "Der offene Schritt sagt nicht, warum er offen ist");
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

// ---------- Die Fallnummer ----------

test("die Fallnummer ist kurz, lesbar und verwechselt sich nicht", async () => {
  const { codeAus } = await import("../apps/lifeskin/lifeskin-session.js");
  const code = codeAus("a1b2c3d4e5f60718");
  assert.match(code, /^LS-[2-9A-HJ-NP-Z]{6}$/, `Unerwartete Form: ${code}`);
  // Ohne 0, 1, I und O - die vier verwechselt jeder beim Abtippen.
  assert.doesNotMatch(code, /[01IO]/);
  // Dieselbe Sitzung ergibt immer dieselbe Nummer, auch nach einem Neuladen.
  assert.equal(codeAus("a1b2c3d4e5f60718"), code);
  assert.equal(codeAus(""), "");
});

test("die Fallnummer kollidiert nicht", async () => {
  const { codeAus } = await import("../apps/lifeskin/lifeskin-session.js");
  // Der erste Versuch leitete beide Haelften aus derselben Zahl ab: 200.000
  // Kennungen ergaben nur 62.000 Nummern. Eine Fallnummer, die zweimal
  // vorkommt, oeffnet der Aerztin den falschen Fall.
  const gesehen = new Set();
  for (let i = 0; i < 20000; i += 1) gesehen.add(codeAus(`${i.toString(16)}-${i * 7919}`));
  assert.ok(gesehen.size >= 19995,
    `Zu viele Kollisionen: ${20000 - gesehen.size} bei 20.000 Kennungen`);
});

test("die Sitzung schickt ihre Fallnummer mit", async () => {
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  const geschrieben = [];
  const sitzung = new Sitzung({
    fetchFn: async (url, optionen) => { geschrieben.push(JSON.parse(optionen.body).fields); return { ok: true }; },
    speicher: null
  });
  await sitzung.starte({ sprache: "sq" });
  assert.equal(geschrieben[0].code?.stringValue, sitzung.code);
  assert.match(sitzung.code, /^LS-/);
});
