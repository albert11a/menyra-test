import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { telefonPruefen } from "../apps/lifeskin-astra/astra-telefon.js";
import { normalisiere, baueTrichter, kontaktwege, TRICHTER_STUFEN } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

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

test("die Nummer steht zuerst, WhatsApp kleiner darunter", () => {
  const fuss = html.slice(html.indexOf('class="wait-foot"'), html.indexOf('<!-- Die fertige Analyse'));
  assert.ok(fuss.includes('id="an-pritwa"'), "Der WhatsApp-Knopf steht nicht im Fuss");
  assert.ok(fuss.includes('id="an-pritnrform"'), "Das Nummernfeld steht nicht im Fuss");
  // DIE REIHENFOLGE IST DIE AUSSAGE. Die Nummer ist der Weg, ueber den wir
  // jeden erreichen; WhatsApp ist der Weg fuer die, die lieber selbst
  // schreiben. Stuende WhatsApp oben, waere die Nummer wieder das Zweite.
  assert.ok(fuss.indexOf('id="an-pritnrform"') < fuss.indexOf('id="an-pritwa"'),
    "WhatsApp steht ueber dem Nummernfeld");
  // Und der WhatsApp-Knopf ist der kleinere von beiden.
  const waZeile = fuss.slice(fuss.indexOf('id="an-pritwa"') - 120, fuss.indexOf('id="an-pritwa"') + 40);
  assert.match(waZeile, /wa-button-small/, "Der WhatsApp-Knopf ist nicht der kleinere");
  assert.ok(fuss.indexOf('id="an-pritnrform"') < fuss.indexOf('class="wait-quiet"'),
    "Das Nummernfeld steht unter den leisen Woertern");
});

// Ohne diese Zahl laesst sich nicht sagen, ob die Aenderung etwas gebracht
// hat - und genau das ist die Frage, wegen der sie gebaut wurde.
//
// Sie steht NICHT im Trichter: Der rechnet kumulativ, und erreichbar zu
// sein ist keine Station auf dem Weg, sondern eine Eigenschaft. Wer seinen
// Befund oeffnet, wuerde sie sich damit rueckwirkend selbst verleihen - in
// der Gesamtprobe sprang die Zahl so von 11 auf 13.
test("Heart zaehlt, auf welchem Weg sie erreichbar wurden", () => {
  const fertig = (zusatz) => normalisiere("x", {
    step: "result", warteseiteGeoeffnet: true, ...zusatz
  });
  const wege = Object.fromEntries(kontaktwege([
    fertig({ phone: "+38344123456" }),
    fertig({ waClick: true }),
    fertig({ phone: "+38344123456", waSent: true }),
    fertig({})
  ]).map((f) => [f.id, f.anzahl]));

  // Vier Faecher, die sich nicht ueberschneiden: Jede Sitzung liegt in
  // genau einem, also ist die Summe die Zahl der fertigen Scans.
  assert.deepEqual(wege, { nummer: 1, whatsapp: 1, beides: 1, keiner: 1 });

  // Und wer den Scan nicht zu Ende gebracht hat, steht in keinem Fach -
  // sonst stuende jeder Abbrecher als "nicht erreichbar" da, und die Zahl
  // waere die der Abbrecher und nicht die der unerreichbaren Befunde.
  const nurAbbrecher = kontaktwege([normalisiere("y", { step: "camera" })]);
  assert.equal(nurAbbrecher[0].gesamt, 0);

  // Beide Wege zaehlen gleich viel.
  assert.equal(normalisiere("a", { phone: "+38344123456" }).erreichbar, true);
  assert.equal(normalisiere("b", { waClick: true }).erreichbar, true);
  assert.equal(normalisiere("c", { waSent: true }).erreichbar, true);
  assert.equal(normalisiere("d", {}).erreichbar, false);
});

// Die Warteseite ist kein Befund - der Trichter trennt sie jetzt.
test("der Trichter zaehlt jeden Bildschirm und keinen doppelt", () => {
  const ids = TRICHTER_STUFEN.map((s) => s.id);
  // Die fuenf Bildschirme des Trichters, in der Reihenfolge des Wegs.
  for (const stufe of ["opened", "named", "camera", "captured", "fragen", "aufbereitung"]) {
    assert.ok(ids.includes(stufe), `Der Bildschirm ${stufe} zaehlt nicht`);
  }
  // Warteseite und Befund getrennt, und in dieser Reihenfolge.
  assert.ok(ids.indexOf("warteseiteGeoeffnet") < ids.indexOf("berichtGeoeffnet"));
  // Und die zwei Eigenschaften stehen NICHT im Weg.
  assert.ok(!ids.includes("erreichbar"), "Erreichbar ist keine Station");
  assert.ok(!ids.includes("waClick"), "WhatsApp ist keine Station");

  const t = Object.fromEntries(baueTrichter([
    normalisiere("a", { step: "fragen" }),
    normalisiere("b", { step: "result", warteseiteGeoeffnet: true })
  ]).map((s) => [s.id, s.anzahl]));
  assert.equal(t.captured, 2, "Wer bei den Fragen ist, hat aufgenommen");
  assert.equal(t.fragen, 2);
  assert.equal(t.aufbereitung, 1, "Nur einer ist ueber die Fragen hinaus");
  assert.equal(t.warteseiteGeoeffnet, 1);
  assert.equal(t.berichtGeoeffnet, 0, "Die Warteseite zaehlt als Befund");
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

// KEINE FRAGE MEHR, SONDERN EINE ANSAGE.
//
// Hier stand "Dëshironi të njoftoheni kur të përfundojë?" - und auf eine
// Frage ist "nein" eine erlaubte Antwort. Sie ist hier keine: Ohne einen
// Weg zurueck bekommt der Patient seinen Befund nie zu sehen.
test("die Nummer wird nicht mehr als Wunsch erfragt", () => {
  const texte = readFileSync(join(wurzel, "apps/lifeskin-astra/astra-texte.js"), "utf8");
  assert.ok(!texte.includes("pritNjofto:"), "Die Frage steht noch in den Texten");
  assert.ok(!astra.includes("pritNjofto"), "Die Frage wird noch gezeichnet");
  assert.match(texte, /pritNrTitel:[\s\S]{0,200}Ku t'ju njoftojmë/,
    "Die Ansage ueber dem Feld fehlt");
  // Und ein leeres Feld bleibt nicht stumm: Wer auf den Knopf tippt, ohne
  // etwas zu schreiben, soll erfahren, wofuer die Nummer gebraucht wird.
  assert.match(astra, /leer: "pritNrPflicht"/, "Ein leeres Feld sagt nichts");
});

test("die Warteseite zaehlt nicht mehr als gelesener Befund", () => {
  // Die Marke haengt am gezeigten Bildschirm, nicht am Laden der Seite.
  assert.match(astra, /if \(name === "prit"\) this\.#markeSetzen\("warteseiteGeoeffnet"\);/);
  assert.match(astra, /if \(name === "fertig"\) this\.#markeSetzen\("berichtGeoeffnet"\);/);
  // Und beim Laden der Seite wird keine der beiden mehr geschrieben.
  const start = astra.slice(astra.indexOf("this.daten = await this.quelle.bericht()"),
    astra.indexOf("#zeige(name) {"));
  assert.ok(!/merken\(\{\s*berichtGeoeffnet/.test(start),
    "Das Laden der Seite zaehlt weiter als gelesener Befund");
  // Die Regeln kennen das neue Feld - sonst weist hasOnly still den
  // ganzen Schreibvorgang ab.
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const liste = regeln.slice(regeln.indexOf("hasOnly([", anfang), regeln.indexOf("])", anfang));
  assert.ok(liste.includes('"warteseiteGeoeffnet"'), "warteseiteGeoeffnet fehlt in den Regeln");
});
