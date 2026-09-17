import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { telefonPruefen } from "../apps/lifeskin-astra/astra-telefon.js";
import { normalisiere, baueTrichter, TRICHTER_STUFEN } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const astra = readFileSync(join(wurzel, "apps/lifeskin-astra/astra.js"), "utf8");
const html = readFileSync(join(wurzel, "apps/lifeskin-astra/index.html"), "utf8");
const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");

// WARUM ES DIESE DATEI GIBT.
//
// Von 32 fertigen Analysen haben 13 ihren Befund gesehen - genau die 13,
// die erreichbar waren. Die Nummer ist der zweite Weg dorthin, und jeder
// Fehler darin kostet einen Patienten, der seinen Befund nie liest.

test("normale kosovarische Nummern gehen durch", () => {
  for (const roh of ["044123456", "044 123 456", "044-123-456", "049/123/456"]) {
    const e = telefonPruefen(roh);
    assert.equal(e.ok, true, `${roh} wurde abgewiesen`);
  }
});

test("wie Menschen Nummern aufschreiben, wird nicht bestraft", () => {
  // Klammern, Punkte und Leerzeichen sind kein Fehler des Patienten.
  assert.equal(telefonPruefen("+383 (0)44 123 456").ok, true);
  assert.equal(telefonPruefen("+383.44.123.456").ok, true);
  assert.equal(telefonPruefen("  044 123 456  ").ok, true);
});

test("die Diaspora wird nicht ausgesperrt", () => {
  // Ein guter Teil der Patienten sitzt in Deutschland und der Schweiz.
  // Eine Laengenregel je Land haette genau die weggeworfen.
  for (const roh of ["+4917612345678", "+41791234567", "+355692345678"]) {
    assert.equal(telefonPruefen(roh).ok, true, `${roh} wurde abgewiesen`);
  }
});

test("00 wird zu + - das ist Regel, nicht Raten", () => {
  assert.equal(telefonPruefen("0038344123456").nummer, "+38344123456");
  assert.equal(telefonPruefen("+38344123456").nummer, "+38344123456");
});

test("ohne gesetzte Vorwahl wird kein Land erraten", () => {
  // Dieselbe 044 gibt es in Kosovo UND in Albanien. Ein Anruf ins falsche
  // Land kommt nicht an - also bleibt die Null stehen.
  assert.equal(telefonPruefen("044123456").nummer, "044123456");
  // Erst wenn die Kampagne ein Land bedient, wird daraus die volle Form.
  assert.equal(telefonPruefen("044123456", "+383").nummer, "+38344123456");
  assert.equal(telefonPruefen("044123456", "+355").nummer, "+35544123456");
});

test("was sicher keine Nummer ist, wird mit Grund abgewiesen", () => {
  assert.deepEqual(telefonPruefen(""), { ok: false, grund: "leer" });
  assert.deepEqual(telefonPruefen("   "), { ok: false, grund: "leer" });
  assert.equal(telefonPruefen("044").grund, "kurz");
  assert.equal(telefonPruefen("0441234567890123456").grund, "lang");
  // Wer unsicher ist, schreibt tatsaechlich so etwas hinein.
  assert.equal(telefonPruefen("044 ose 045").grund, "zeichen");
  assert.equal(telefonPruefen("nuk e di").grund, "zeichen");
  // Ein Plus gehoert nach vorne und nirgendwo sonst.
  assert.equal(telefonPruefen("044+123456").grund, "zeichen");
});

test("ein Grund fuehrt immer zu einem Satz, den der Patient lesen kann", () => {
  // Ein Feld, das rot wird, ohne zu sagen warum, wird nicht korrigiert,
  // sondern verlassen.
  for (const grund of ["kurz", "lang", "zeichen"]) {
    const schluessel = { kurz: "pritNrGabimShkurt", lang: "pritNrGabimGjate", zeichen: "pritNrGabimShenja" }[grund];
    assert.ok(astra.includes(schluessel), `Fuer "${grund}" gibt es keinen Text`);
  }
});

// DIE WICHTIGSTE ZUSICHERUNG DIESER DATEI.
//
// Ein "gespeichert", das erscheint, bevor der Schreibvorgang durch ist,
// ist eine Luege, sobald er scheitert: Der Patient wartet auf einen Anruf,
// den niemand machen kann. Genau dieses Muster hat uns die Anamnese
// gekostet - dort wurde ein 403 verschluckt und der Trichter lief weiter.
test("gedankt wird erst, wenn die Nummer wirklich angekommen ist", () => {
  const ab = astra.indexOf("async #nummerSchicken()");
  assert.notEqual(ab, -1, "#nummerSchicken nicht gefunden");
  const block = astra.slice(ab, astra.indexOf("\n  // Den Link kopieren", ab));

  assert.match(block, /const antwort = await this\.quelle\.merken\(/,
    "Die Antwort des Schreibvorgangs wird nicht abgewartet");
  assert.match(block, /if \(!antwort\?\.ok\) \{ melde\("pritNrGabimRuajtje"\); return; \}/,
    "Ein abgewiesener Schreibvorgang fuehrt nicht zu einer Fehlermeldung");
  // Die Bestaetigung steht NACH der Pruefung, nicht davor.
  assert.ok(block.indexOf("antwort?.ok") < block.indexOf("#pritNummerFertig"),
    "Die Bestaetigung erscheint, bevor der Schreibvorgang geprueft ist");
});

test("zweimal tippen schreibt nicht zweimal", () => {
  const ab = astra.indexOf("async #nummerSchicken()");
  const block = astra.slice(ab, astra.indexOf("\n  // Den Link kopieren", ab));
  assert.match(block, /knopf\.disabled = true/, "Der Knopf bleibt waehrend des Schreibens offen");
  assert.match(block, /knopf\.disabled = false/, "Der Knopf bleibt nach dem Schreiben zu");
});

// Die Lehre aus der Anamnese: Ein Feld, das die Regeln nicht kennen,
// weist mit hasOnly den GANZEN Schreibvorgang ab - still, mit 403.
test("phone und phoneConsent stehen in den Firestore-Regeln", () => {
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const hasOnly = regeln.indexOf("hasOnly([", anfang);
  const liste = regeln.slice(hasOnly, regeln.indexOf("])", hasOnly));
  for (const feld of ["phone", "phoneConsent"]) {
    assert.ok(liste.includes(`"${feld}"`), `${feld} fehlt in der erlaubten Liste`);
  }
  const rumpf = regeln.slice(anfang);
  assert.match(rumpf, /data\.phone is string && data\.phone\.size\(\) <= 40/);
});

test("die Nummer geht getrennt von allem anderen hinaus", () => {
  const ab = astra.indexOf("async #nummerSchicken()");
  const block = astra.slice(ab, astra.indexOf("\n  // Den Link kopieren", ab));
  // Nur phone und phoneConsent - kein drittes Feld, das den Vorgang
  // mitreissen koennte, wenn die Regeln es nicht kennen.
  const ruf = block.slice(block.indexOf("merken({"), block.indexOf("});", block.indexOf("merken({")));
  const felder = [...ruf.matchAll(/^\s*([a-zA-Z]+):/gm)].map((m) => m[1]);
  assert.deepEqual(felder.sort(), ["phone", "phoneConsent"]);
});

test("das Feld traegt die Zifferntastatur und stoert das Layout nicht", () => {
  const feld = html.slice(html.indexOf('id="an-pritnr"') - 200, html.indexOf('id="an-pritnr"') + 320);
  // Ohne inputmode kommt auf dem Telefon die Buchstabentastatur - das ist
  // der Unterschied zwischen "kurz eintippen" und "aufgeben".
  assert.match(feld, /type="tel"/);
  assert.match(feld, /inputmode="tel"/);
  assert.match(feld, /autocomplete="tel"/);
  const css = readFileSync(join(wurzel, "apps/lifeskin-astra/astra.css"), "utf8");
  // Unter 16px zoomt iOS beim Hineintippen die Seite heran, und der Knopf
  // daneben liegt dann ausserhalb des Bildes.
  assert.match(css, /\.wait-phone-input\{[^}]*font-size:1rem/);
});

test("die Nummer steht als eigener Weg da, nicht als Fussnote", () => {
  // Sie liegt im Fuss der Warteseite, bei WhatsApp - nicht unter den zwei
  // leisen Woertern, ueber die man hinwegliest.
  const fuss = html.slice(html.indexOf('class="wait-foot"'), html.indexOf('<!-- Die fertige Analyse'));
  assert.ok(fuss.includes('id="an-pritwa"'), "Der WhatsApp-Knopf steht nicht im Fuss");
  assert.ok(fuss.includes('id="an-pritnrform"'), "Das Nummernfeld steht nicht im Fuss");
  assert.ok(fuss.indexOf('id="an-pritnrform"') < fuss.indexOf('class="wait-quiet"'),
    "Das Nummernfeld steht unter den leisen Woertern");
});

// Ohne diese Zahl laesst sich nicht sagen, ob die Aenderung etwas gebracht
// hat - und genau das ist die Frage, wegen der sie gebaut wurde.
test("Heart zaehlt, wie viele ueberhaupt erreichbar sind", () => {
  const stufe = TRICHTER_STUFEN.find((s) => s.id === "erreichbar");
  assert.ok(stufe, "Die Stufe Erreichbar fehlt im Trichter");
  assert.equal(stufe.feld, "erreichbar");

  // Beide Wege zaehlen gleich.
  assert.equal(normalisiere("a", { phone: "+38344123456" }).erreichbar, true);
  assert.equal(normalisiere("b", { waClick: true }).erreichbar, true);
  assert.equal(normalisiere("c", { waSent: true }).erreichbar, true);
  assert.equal(normalisiere("d", {}).erreichbar, false);

  // Und der Trichter rechnet sie zusammen: drei erreichbar von vier.
  const trichter = baueTrichter([
    normalisiere("a", { step: "result", berichtGeoeffnet: true, phone: "+38344123456" }),
    normalisiere("b", { step: "result", berichtGeoeffnet: true, waClick: true }),
    normalisiere("c", { step: "result", berichtGeoeffnet: true, waSent: true }),
    normalisiere("d", { step: "result", berichtGeoeffnet: true })
  ]);
  assert.equal(trichter.find((s) => s.id === "erreichbar").anzahl, 3);
  assert.equal(trichter.find((s) => s.id === "berichtGeoeffnet").anzahl, 4);
});

test("eine schon hinterlassene Nummer wird nicht noch einmal erfragt", () => {
  const ab = astra.indexOf("#pritNummer() {");
  // Auf die DEFINITION ankern, nicht auf den ersten Aufruf: Die Methode
  // ruft #pritNummerFertig selbst auf, und der Schnitt endete davor.
  const block = astra.slice(ab, astra.indexOf("\n  #pritNummerFertig(", ab));
  assert.match(block, /if \(this\.daten\?\.phone\) \{ this\.#pritNummerFertig\(this\.daten\.phone\); return; \}/,
    "Wer zurueckkommt, sieht wieder ein leeres Feld");
  // Und der Zuhoerer haengt sich nur einmal an: #pritZeigen laeuft erneut,
  // wenn der Abruf einen neuen Zustand bringt.
  assert.match(block, /if \(this\.nrVerdrahtet\) return;/,
    "Der Zuhoerer kann sich mehrfach anhaengen");
});
