import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { OBERFLAECHE, t } from "../apps/lifeskin/lifeskin-content.js";
import { LIFESKIN_WHATSAPP, LIFESKIN_WHATSAPP_TEXT } from "../apps/lifeskin/lifeskin-config.js";
import { codeAus } from "../apps/lifeskin/lifeskin-session.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");

// Was beim Tippen auf den Knopf wirklich passiert:
//
// Der Link fuehrt auf wa.me. Auf dem iPhone erscheint dann ein Systemhinweis
// "Diese Seite in WhatsApp oeffnen?" mit Abbrechen und Oeffnen. Das ist der
// gefaehrlichste Punkt im ganzen Trichter - wer ihn nicht erwartet, tippt
// auf Abbrechen und ist weg.
//
// Diese Datei haelt fest, dass jede Angst VOR dem Tippen beantwortet ist.

// ---------- Der Link selbst ----------

test("der Link traegt die Nummer und unseren eigenen Text", () => {
  // Der Kurzlink wa.me/message/... nimmt keinen eigenen Text an - dann
  // fehlte die Fallnummer, und die Aerztin muesste raten, wer schreibt.
  assert.match(LIFESKIN_WHATSAPP, /^\d{8,15}$/, "Die Nummer muss reine Ziffern sein, ohne Plus");
  assert.ok(app.includes("https://wa.me/${LIFESKIN_WHATSAPP}?text="), "Der Link nimmt keinen Text mit");
  assert.ok(app.includes("encodeURIComponent"), "Der Text wird nicht kodiert");
});

test("die vorbefuellte Nachricht enthaelt die Fallnummer", () => {
  for (const sprache of ["sq", "de"]) {
    const vorlage = LIFESKIN_WHATSAPP_TEXT[sprache];
    assert.ok(vorlage.includes("{code}"), `${sprache}: keine Fallnummer in der Nachricht`);
    // Kurz. Je laenger, desto mehr Leute lesen sie zu Ende und loeschen sie.
    assert.ok(vorlage.length <= 90, `${sprache}: zu lang (${vorlage.length} Zeichen)`);
  }
  const code = codeAus("a1b2c3d4", new Date().toISOString());
  const fertig = LIFESKIN_WHATSAPP_TEXT.sq.replace("{code}", code);
  assert.ok(fertig.includes(code));
  assert.ok(!fertig.includes("{"), "In der Nachricht steht noch ein Platzhalter");
});

test("ohne hinterlegte Nummer bleibt der Trichter vollstaendig", () => {
  // Der Knopf verschwindet, das Nummernfeld bleibt - niemand sitzt fest.
  assert.ok(app.includes("if (!LIFESKIN_WHATSAPP) {"));
  const stelle = app.indexOf("if (!LIFESKIN_WHATSAPP) {");
  const block = app.slice(stelle, stelle + 300);
  assert.ok(block.includes("ls-verstecken"), "Der Knopf bleibt sichtbar, obwohl er ins Leere fuehrt");
  assert.ok(block.includes("waNummerKnopf"), "Der zweite Weg wird nicht angeboten");
});

// ---------- Sechs Menschen, sechs Aengste ----------
//
// Kein Nutzertest - dafuer braeuchte es echte Menschen. Was hier geprueft
// wird, ist, dass fuer jede dieser Aengste eine Antwort AUF DEM BILDSCHIRM
// steht, bevor getippt wird.

test("Die Misstrauische: sie sieht vorher, was passiert", () => {
  // "Ich klicke nicht auf etwas, von dem ich nicht weiss, was es tut."
  assert.ok(html.includes('id="ls-wafaq"'), "Es gibt keine Erklaerung");
  const text = t(OBERFLAECHE.waWasPassiertText, "de");
  assert.match(text, /WhatsApp öffnet/, "Es steht nicht da, was sich oeffnet");
  assert.match(text, /jederzeit/, "Es steht nicht da, dass sie aussteigen kann");
});

test("Der Ungeduldige: ein Knopf, kein Lesen", () => {
  // Er ueberfliegt. Der Knopf muss ohne einen einzigen gelesenen Satz
  // funktionieren - deshalb steht die App im Knopf selbst.
  assert.match(t(OBERFLAECHE.waKnopf, "de"), /WhatsApp/);
  assert.ok(t(OBERFLAECHE.waKnopf, "sq").length <= 22, "Der Knopftext ist zu lang zum Ueberfliegen");
  // Die Erklaerung ist zugeklappt - sie darf ihn nicht aufhalten.
  assert.ok(html.includes("<details"), "Die Erklaerung steht offen im Weg");
});

test("Die Schamhafte: es ist eine Aerztin, kein Laden", () => {
  // "Wer sieht mein Gesicht?" Die Antwort muss den Arzttitel enthalten,
  // nicht eine Firma.
  for (const sprache of ["sq", "de"]) {
    assert.match(t(OBERFLAECHE.waWasPassiertText, sprache), /Dr\. Gashi/);
    assert.match(t(OBERFLAECHE.aufnahmenText, sprache), /Dr\. Gashi/);
  }
});

test("Der Sparsame: kostenlos steht dabei", () => {
  for (const sprache of ["sq", "de"]) {
    assert.match(t(OBERFLAECHE.waWasPassiertText, sprache), /Kostenlos|Pa pagesë/);
  }
});

test("Die Technikvorsichtige: sie muss nichts formulieren", () => {
  // "Was soll ich denn schreiben?" ist eine echte Huerde - und die groesste
  // bei Aelteren. Der Satz unter dem Knopf nimmt sie ganz weg.
  for (const sprache of ["sq", "de"]) {
    const text = t(OBERFLAECHE.waUnterKnopf, sprache);
    assert.ok(text.length > 20, `${sprache}: kein Satz unter dem Knopf`);
    assert.match(text, /geschrieben|shkruar/, "Es steht nicht da, dass die Nachricht fertig ist");
  }
});

test("Der Vorsichtige ohne WhatsApp: er sitzt nicht fest", () => {
  assert.ok(html.includes('id="ls-whatsappnummer"'), "Kein zweiter Weg");
  assert.match(t(OBERFLAECHE.waNummerKnopf, "de"), /Kein WhatsApp/);
});

// ---------- Die Rueckkehr ----------

test("wer zurueckkommt, wird einmal gefragt - und nur einmal", () => {
  assert.ok(app.includes("visibilitychange"), "Die Rueckkehr wird nicht bemerkt");
  const stelle = app.indexOf("#whatsappRueckkehr() {");
  const block = app.slice(stelle, stelle + 420);
  assert.ok(block.includes("waGefragt"), "Es gibt keine Sperre gegen ein zweites Fragen");
  assert.ok(block.includes("waGetippt"), "Es wird auch gefragt, wenn nie getippt wurde");
  assert.ok(block.includes('visibilityState !== "visible"'), "Es wird beim Weggehen gefragt statt beim Zurueckkommen");
});

test("die Frage hat beide Antworten, und keine ist eine Sackgasse", () => {
  assert.ok(html.includes('id="ls-warueckja"'));
  assert.ok(html.includes('id="ls-waruecknein"'));
  assert.match(t(OBERFLAECHE.waZurueckNein, "de"), /Nummer/, "Das Nein fuehrt nirgendwohin");
  // Nein fuehrt in das Nummernfeld, nicht ins Leere.
  const stelle = app.indexOf('$("#ls-waruecknein")');
  assert.ok(app.slice(stelle, stelle + 240).includes("#whatsappGriff"));
});

// ---------- Was gemessen wird ----------

test("Klick und bestaetigtes Senden werden getrennt gezaehlt", () => {
  // Der Abstand zwischen beiden ist die einzige Zahl, die sagt, wie viele
  // in WhatsApp doch noch abspringen - ohne sie sucht man den Fehler ewig
  // an der falschen Stelle.
  assert.ok(app.includes("waClick: true"));
  assert.ok(app.includes("waSent: true"));
  const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
  for (const feld of ["waClick", "waSent"]) {
    assert.ok(regeln.includes(`"${feld}"`), `${feld} wird von den Regeln abgewiesen`);
  }
});

test("beide Wege melden Lead an Meta - der Knopf und die Nummer", () => {
  // Auf Lead wird optimiert. Meldet nur einer der beiden, lernt Meta die
  // Haelfte der Wahrheit.
  const knopf = app.indexOf("#whatsappGetippt() {");
  const nummer = app.indexOf("#whatsappGriff() {");
  assert.ok(app.slice(knopf, knopf + 220).includes("meldeLead"));
  assert.ok(app.slice(nummer, nummer + 700).includes("meldeLead"));
});
