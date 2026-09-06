import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { TEXTE, t } from "../apps/lifeskin-bericht/bericht-texte.js";
import { LIFESKIN_WHATSAPP, LIFESKIN_WHATSAPP_TEXT } from "../apps/lifeskin/lifeskin-config.js";
import { codeAus } from "../apps/lifeskin/lifeskin-session.js";
import { methode } from "./lifeskin-quelle.mjs";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
const seite = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
const trichter = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");

// WO der Knopf steht, und warum nicht im Trichter:
//
// Er steht auf der Befundseite. Dort hat der Patient eine Fallnummer, eine
// eigene Adresse und einen sichtbaren Grund, sich zu melden - er wartet auf
// eine Antwort. Im Trichter haette er nur eine Bitte gehabt.
//
// WAS beim Tippen wirklich passiert:
//
// Der Link fuehrt auf wa.me. Auf dem iPhone erscheint dann ein Systemhinweis
// "Diese Seite in WhatsApp oeffnen?" mit Abbrechen und Oeffnen. Das ist der
// gefaehrlichste Punkt der ganzen Seite - wer ihn nicht erwartet, tippt auf
// Abbrechen und ist weg.
//
// Diese Datei haelt fest, dass jede Angst VOR dem Tippen beantwortet ist.

test("der Trichter fragt nicht mehr nach WhatsApp", () => {
  // Zweimal fragen heisst einmal zu oft. Wer im Trichter schon abgelehnt
  // hat, sagt auf der Befundseite kein zweites Mal ja.
  assert.ok(!trichter.includes("wa.me"), "Der Trichter hat noch einen WhatsApp-Weg");
  assert.ok(!trichter.includes("LIFESKIN_WHATSAPP"), "Der Trichter kennt die Nummer noch");
});

// ---------- Der Link selbst ----------

test("der Link traegt die Nummer und unseren eigenen Text", () => {
  // Der Kurzlink wa.me/message/... nimmt keinen eigenen Text an - dann
  // fehlte die Fallnummer, und die Aerztin muesste raten, wer schreibt.
  assert.match(LIFESKIN_WHATSAPP, /^\d{8,15}$/, "Die Nummer muss reine Ziffern sein, ohne Plus");
  assert.ok(seite.includes("https://wa.me/${LIFESKIN_WHATSAPP}?text="), "Der Link nimmt keinen Text mit");
  assert.ok(seite.includes("encodeURIComponent"), "Der Text wird nicht kodiert");
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

test("ohne hinterlegte Nummer bleibt die Seite vollstaendig", () => {
  // Der Knopf verschwindet, die Seite bleibt - niemand sitzt fest, denn die
  // Antwort erscheint hier ohnehin.
  const block = methode(seite, "#whatsappSetzen");
  assert.ok(block.includes("if (!LIFESKIN_WHATSAPP)"), "Der leere Fall ist nicht behandelt");
  assert.ok(block.includes("ls-verstecken"), "Der Knopf bleibt sichtbar, obwohl er ins Leere fuehrt");
});

// ---------- Sechs Menschen, sechs Aengste ----------
//
// Kein Nutzertest - dafuer braeuchte es echte Menschen. Was hier geprueft
// wird, ist, dass fuer jede dieser Aengste eine Antwort AUF DEM BILDSCHIRM
// steht, bevor getippt wird.

test("Die Misstrauische: sie sieht vorher, was passiert", () => {
  // "Ich klicke nicht auf etwas, von dem ich nicht weiss, was es tut."
  assert.ok(html.includes('id="lb-faqknopf"'), "Es gibt keinen Weg zur Erklaerung");
  assert.ok(html.includes('id="lb-blatt"'), "Es gibt keine Erklaerung");
  const text = t(TEXTE.waWasPassiertText, "de");
  assert.match(text, /WhatsApp öffnet/, "Es steht nicht da, was sich oeffnet");
  assert.match(text, /jederzeit/, "Es steht nicht da, dass sie aussteigen kann");
});

test("Der Ungeduldige: ein Knopf, kein Lesen", () => {
  // Er ueberfliegt. Der Knopf muss ohne einen einzigen gelesenen Satz
  // funktionieren - deshalb steht die App im Knopf selbst.
  assert.match(t(TEXTE.waKnopf, "de"), /WhatsApp/);
  assert.ok(t(TEXTE.waKnopf, "sq").length <= 26, "Der Knopftext ist zu lang zum Ueberfliegen");
  // Die Erklaerung liegt im Blatt und ist zu - sie darf ihn nicht aufhalten
  // und sie darf den Bildschirm nicht laenger machen.
  assert.match(html, /id="lb-blatt"[^>]*class=|class="[^"]*ls-verstecken[^"]*"[^>]*id="lb-blatt"/,
    "Das Blatt steht offen im Weg");
  assert.ok(html.includes('id="lb-blatt"') && /lb-blatt ls-verstecken|ls-verstecken" id="lb-blatt/.test(html),
    "Das Blatt ist beim Laden nicht zugeklappt");
});

test("Die Schamhafte: es ist eine Aerztin, kein Laden", () => {
  // "Wer sieht mein Gesicht?" Die Antwort muss den Arzttitel enthalten,
  // nicht eine Firma - und zwar dort, wo sie zuerst hinsieht: im Titel.
  for (const sprache of ["sq", "de"]) {
    assert.match(t(TEXTE.waWasPassiertText, sprache), /Dr\. Gashi/);
    assert.match(t(TEXTE.titel, sprache), /Dr\. Gashi/);
    assert.match(t(TEXTE.titelOhneName, sprache), /Dr\. Gashi/);
  }
});

test("Der Sparsame: kostenlos steht dabei", () => {
  for (const sprache of ["sq", "de"]) {
    assert.match(t(TEXTE.waWasPassiertText, sprache), /Kostenlos|Pa pagesë/);
  }
});

test("Die Technikvorsichtige: sie muss nichts formulieren", () => {
  // "Was soll ich denn schreiben?" ist eine echte Huerde - und die groesste
  // bei Aelteren. Der Satz unter dem Knopf nimmt sie ganz weg.
  for (const sprache of ["sq", "de"]) {
    const text = t(TEXTE.waUnter, sprache);
    assert.ok(text.length > 20, `${sprache}: kein Satz unter dem Knopf`);
    assert.match(text, /geschrieben|shkruar/, "Es steht nicht da, dass die Nachricht fertig ist");
  }
});

test("Der Vorsichtige ohne WhatsApp: er sitzt nicht fest", () => {
  // Sein Ausweg ist die Seite selbst: Er speichert den Link und muss
  // niemandem eine Nummer geben. Die Antwort erscheint hier.
  assert.ok(html.includes('id="lb-kopieren"'), "Kein zweiter Weg");
  for (const sprache of ["sq", "de"]) {
    assert.match(t(TEXTE.kopierenUnter, sprache), /WhatsApp/,
      `${sprache}: es steht nicht da, dass es auch ohne WhatsApp geht`);
  }
});

test("Der Pessimist: die Frage ist ein Dienst, keine Bitte", () => {
  // "Die wollen doch nur verkaufen." Deshalb steht ueber dem Knopf nicht
  // "schreiben Sie uns", sondern "sollen wir Bescheid geben" - und die
  // Antwort kommt so oder so, auch wenn er nie tippt.
  assert.ok(html.includes('id="lb-benachrichtigen"'), "Die Frage fehlt");
  for (const sprache of ["sq", "de"]) {
    const frage = t(TEXTE.benachrichtigen, sprache);
    assert.ok(frage.endsWith("?"), `${sprache}: das ist keine Frage`);
    assert.ok(!/kauf|blej|produkt/i.test(frage), `${sprache}: hier wird verkauft statt gefragt`);
  }
  // Im WARTEZUSTAND kein Preis und kein Kaufknopf: Solange kein Befund da
  // ist, gibt es nichts zu verkaufen. Im fertigen Befund steht beides - das
  // ist der Sinn der Sache und faellt nicht unter diese Regel.
  const wartetext = [
    "laedt", "titel", "titelOhneName", "akteMarke", "akteFotos", "warum",
    "dauerHeute", "dauerMorgen", "schrittScan", "schrittFotos", "schrittAnalyse",
    "schrittFertig", "benachrichtigen", "waKnopf", "waUnter", "waRueckFrage",
    "waRueckJa", "waDanke", "waWasPassiert", "waWasPassiertText",
    "kopieren", "kopierenUnter", "haftung"
  ];
  for (const schluessel of wartetext) {
    for (const sprache of ["sq", "de"]) {
      // \b um EUR herum: Ohne Wortgrenze schlaegt es in "Beurteilung" an,
      // und dann meldet der Test einen Preis, wo der Haftungshinweis steht.
      assert.doesNotMatch(String(TEXTE[schluessel]?.[sprache] || ""), /€|\bEUR\b|çmim|\bPreis/i,
        `${schluessel}/${sprache}: auf der Warteseite wird verkauft`);
    }
  }

  // Und der Wartebildschirm selbst traegt keinen Kaufknopf - der liegt in
  // seinem eigenen Abschnitt, der erst mit dem Befund erscheint.
  const wartet = html.slice(html.indexOf('id="lb-wartet"'), html.indexOf('id="lb-fertig"'));
  assert.ok(!wartet.includes("ls-knopf--kauf"), "Auf der Warteseite steht ein Kaufknopf");
  assert.ok(!/€/.test(wartet), "Auf der Warteseite steht ein Preis");
});

// ---------- Die Rueckkehr ----------

test("wer zurueckkommt, wird einmal gefragt - und nur einmal", () => {
  assert.ok(seite.includes("visibilitychange"), "Die Rueckkehr wird nicht bemerkt");
  const block = methode(seite, "#ereignisse");
  assert.ok(block.includes("waGefragt"), "Es gibt keine Sperre gegen ein zweites Fragen");
  assert.ok(block.includes("waGetippt"), "Es wird auch gefragt, wenn nie getippt wurde");
  assert.ok(block.includes('visibilityState !== "visible"'), "Es wird beim Weggehen gefragt statt beim Zurueckkommen");
});

// ---------- Was gemessen wird ----------

test("Klick und bestaetigtes Senden werden getrennt gezaehlt", () => {
  // Der Abstand zwischen beiden ist die einzige Zahl, die sagt, wie viele
  // in WhatsApp doch noch abspringen - ohne sie sucht man den Fehler ewig
  // an der falschen Stelle.
  assert.ok(seite.includes("waClick: true"));
  assert.ok(seite.includes("waSent: true"));
  const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
  for (const feld of ["waClick", "waSent", "berichtGeoeffnet", "linkKopiert"]) {
    assert.ok(regeln.includes(`"${feld}"`), `${feld} wird von den Regeln abgewiesen`);
  }
});

test("der Griff zum Knopf meldet Lead an Meta", () => {
  // Auf Lead wird optimiert: Bei den geplanten Ausgaben liegen die
  // Bestellungen unter den ungefaehr fuenfzig Ereignissen je Woche, die eine
  // Anzeigengruppe braucht, um aus der Lernphase zu kommen.
  const block = methode(seite, "#ereignisse");
  assert.ok(block.includes("meldeLead"), "Der Knopf meldet Lead nicht");
});

// ---------- Der fertige Befund ----------

test("die Anschrift landet in der Sitzung, nicht im oeffentlichen Bericht", () => {
  // Der Bericht ist mit der Kennung fuer jeden lesbar. Eine Adresse darin
  // waere in dem Moment offen, in dem jemand seinen Link weitergibt - und
  // Weitergeben ist genau das, wozu die Seite einlaedt.
  const block = methode(seite, "#bestellen");
  assert.ok(block.includes("this.#merken({"), "Die Anschrift geht nicht in die Sitzung");
  assert.ok(/address: werte/.test(block), "Die Anschrift wird nicht gespeichert");
  const berichtTeil = block.slice(block.indexOf("/reports/"));
  assert.ok(!/address|telefon|strasse|\bort\b/.test(berichtTeil),
    "Im Bericht landet eine Anschrift");
  assert.ok(berichtTeil.includes('status: "bestellt"'), "Der Zustand wird nicht gesetzt");
});

test("der Patient darf am Bericht nur den Zustand aendern", () => {
  const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
  const block = regeln.slice(regeln.indexOf("function lifeskinBestellung()"));
  const bis = block.indexOf("\n      }");
  const fn = block.slice(0, bis);
  assert.ok(fn.includes('alt.status == "fertig"'), "Es gibt keinen Ausgangszustand");
  assert.ok(fn.includes('neu.status == "bestellt"'), "Es gibt kein Ziel");
  assert.ok(fn.includes('hasOnly(["status", "bestelltAt"])'),
    "Er duerfte mehr als den Zustand aendern");
});

test("ohne Neuladen: die Seite fragt nach, aber nur wenn sie zu sehen ist", () => {
  const block = methode(seite, "#horchen");
  assert.ok(block.includes("setInterval"), "Es wird gar nicht nachgesehen");
  assert.ok(block.includes('visibilityState !== "visible"'),
    "Ein Handy in der Tasche fragt trotzdem");
  assert.ok(block.includes("visibilitychange"),
    "Bei der Rueckkehr wird nicht sofort nachgesehen");
  // Steht der Befund und ist bestellt, gibt es nichts mehr zu holen.
  assert.ok(block.includes('"bestellt"'), "Es wird endlos weitergefragt");
  // Kein Firebase-Paket auf dieser Seite: 460 KB auf einer Seite, die in
  // Sekunden offen sein muss.
  assert.ok(!seite.includes("firebase/"), "Die Befundseite zieht das Firebase-Paket");
});

test("die Produktfotos stehen nicht im Bericht", () => {
  // Ein Foto ist eine Datenzeile von mehreren hunderttausend Zeichen; zwei
  // davon sprengen ein Firestore-Dokument von einem Megabyte.
  const adapter = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-adapter.js"), "utf8");
  const block = adapter.slice(adapter.indexOf("export async function gibBerichtFrei"));
  const fn = block.slice(0, block.indexOf("\n}\n"));
  assert.ok(fn.includes("id: String(p.id)"), "Die Produktkennung fehlt");
  assert.ok(!/photoRef|foto/i.test(fn), "Ein Foto wandert in den Bericht");
  assert.ok(methode(seite, "#produkteHolen").includes("/products/"),
    "Die Seite holt die Produkte nicht nach");
});
