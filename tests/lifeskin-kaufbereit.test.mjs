// DIE VIER FRAGEN NACH SCAN UND FOTO - und wie sie auf der Therapieseite
// ankommen (27.09.2026).
//
// Der Trichter fragt nach der Aufnahme: was stoert, seit wann, was schon
// probiert wurde, ob Dr. Gashi auch die Therapie vorbereiten soll. Heart
// legt eine gepruefte Abschrift in den Bericht, die Therapieseite spiegelt
// sie zurueck. Diese Pruefungen halten die drei Stellen zusammen.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { FRAGEN, FRAGEN_NACH_AUFNAHME, FRAGEN_TEXTE, OBERFLAECHE, t } from "../apps/lifeskin/lifeskin-content.js";
import {
  ANTWORTEN_OEFFENTLICH, antwortenLesen, antwortenFuerBericht, antwortenSpiegel
} from "../shared/lifeskin-antworten.js";
import { anamneseFuerPrompt } from "../apps/mnyra-heart/heart-lifeskin-prompt.js";

const lies = (p) => readFileSync(p, "utf8");
const APP = lies("apps/lifeskin/lifeskin-app.js");
const LANDING = lies("apps/lifeskin-landing/index.html");
const TERAPIA_HTML = lies("apps/lifeskin-verkauf/terapia.html");
const TERAPIA_JS = lies("apps/lifeskin-verkauf/terapia.js");
const ADAPTER = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
const HEART = lies("apps/mnyra-heart/heart.js");

function methode(quelle, name) {
  const start = quelle.indexOf(`  ${name}(`);
  assert.ok(start >= 0, `${name} fehlt`);
  const ende = quelle.indexOf("\n  }\n", start);
  return quelle.slice(start, ende + 4);
}

test("nach Scan und Foto: dieselben vier Fragen, nur Antippen", () => {
  assert.deepEqual(FRAGEN_NACH_AUFNAHME.map((f) => f.id), ["anliegen", "kohezgjatja", "perdorimi", "gatishmeria"]);
  // Aus dem Vorrat gegriffen, nicht abgeschrieben.
  for (const frage of FRAGEN_NACH_AUFNAHME) assert.ok(FRAGEN.includes(frage), frage.id);
  // Keine Tastatur, und nicht mehr als die Schrittfolge zaehlt (pyetja1-4).
  assert.ok(FRAGEN_NACH_AUFNAHME.every((f) => Array.isArray(f.antworten)));
  assert.ok(FRAGEN_NACH_AUFNAHME.length <= 4);
  // Beide Sprachen ueberall.
  for (const frage of FRAGEN_NACH_AUFNAHME) {
    assert.ok(t(frage.titel, "sq") && t(frage.titel, "de"), frage.id);
    for (const a of frage.antworten) assert.ok(t(a.text, "sq") && t(a.text, "de"), `${frage.id}.${a.id}`);
  }
  for (const k of ["einleitungNachScan", "einleitungNachFoto"]) {
    assert.ok(t(FRAGEN_TEXTE[k], "sq") && t(FRAGEN_TEXTE[k], "de"), k);
  }
  assert.ok(t(OBERFLAECHE.nameVorsatzNachFragen, "sq"));
});

test("die Bereitschaftsfrage hat kein Nein - aber einen ehrlichen Ausweg", () => {
  const frage = FRAGEN.find((f) => f.id === "gatishmeria");
  assert.deepEqual(frage.antworten.map((a) => a.id), ["tani", "pasi", "analiza"]);
  for (const a of frage.antworten) assert.doesNotMatch(t(a.text, "sq"), /^Jo\b|nuk më intereson/i);
  // Die Landingpage verspricht die Analyse kostenlos - die Frage auch.
  assert.match(t(frage.unter, "sq"), /falas/);
});

test("Scan und Foto laufen durch die vier Fragen, dann Name und Nummer", () => {
  assert.match(methode(APP, "#fragenZeigen"), /this\.#aufnahmeFragen\("scan"\);/);
  assert.match(methode(APP, "#fotoNehmen"), /this\.#aufnahmeFragen\("foto"\);/);
  const fragen = methode(APP, "#aufnahmeFragen");
  // Die Liste je Weg: im Laden drei Fragen, sonst vier (lifeskin-content.js).
  assert.match(fragen, /fragenNachAufnahme\(this\.weg\)/);
  assert.match(fragen, /danach: "name"/);
  // Ohne Fragenbildschirm wie bisher direkt zum Namen - nie eine weisse Seite.
  assert.match(fragen, /if \(!\$\("#ls-fragen"\)\) \{ this\.#nameZeigen\(\); return; \}/);
  // Die Landingpage (kurze Fassung) traegt den Bildschirm.
  assert.match(LANDING, /data-ls-variante="kurz"/);
  assert.match(LANDING, /id="ls-fragen"/);
  // Zurueck vom Namen fuehrt zur letzten Frage, nicht in die Kamera.
  assert.match(APP, /name: this\.zustand\.nachFragen && !this\.#trupWeg\(\) && gibtEs\("fragen"\) \? "fragen"/);
});

test("die Antworten gehen in den Prompt - mit den Texten, die der Patient las", () => {
  const zeilen = anamneseFuerPrompt({ perdorimi: ["farmaci", "mjek"], gatishmeria: "tani" });
  assert.deepEqual(zeilen.map((z) => z.pergjigja), [
    "Kremë nga barnatorja; Terapi te mjeku ose Roaccutane",
    "Po, dua ta filloj sa më shpejt"
  ]);
  for (const p of ["docs/lifeskin-prompt-v9.txt", "docs/lifeskin-prompt-v9-pa-foto.txt"]) {
    const text = lies(p);
    assert.match(text, /DIE ANTWORTEN VOR DEM KAUF/, p);
    // Die Fragen stehen im Prompt so, wie der Trichter sie stellt.
    for (const id of ["perdorimi", "gatishmeria"]) {
      assert.ok(text.includes(t(FRAGEN.find((f) => f.id === id).titel, "sq")), `${p}: ${id}`);
    }
  }
});

test("oeffentlich sind dieselben Texte wie im Trichter - ohne Gesundheitsangaben", () => {
  for (const [frage, texte] of Object.entries(ANTWORTEN_OEFFENTLICH)) {
    const quelle = FRAGEN.find((f) => f.id === frage);
    assert.ok(quelle, frage);
    for (const [id, text] of Object.entries(texte)) {
      const a = quelle.antworten.find((x) => x.id === id);
      assert.ok(a, `${frage}.${id} gibt es im Trichter nicht`);
      // "Seit wann" steht auf der Seite als ganzer Ausdruck ("Prej disa
      // javësh" statt "Disa javë"); alles andere wortgleich.
      if (frage !== "kohezgjatja") assert.equal(text, t(a.text, "sq"), `${frage}.${id}`);
    }
  }
  const bericht = antwortenFuerBericht({
    anliegen: ["pucrrat", "nukEdi"], kohezgjatja: "vit", perdorimi: ["mjek", "rrjete"],
    gatishmeria: "pasi", kujdesi: ["shtatzeni"], emri: "Arta", numri: "044123456", mosha: "18-24"
  });
  assert.deepEqual(bericht, { anliegen: ["pucrrat"], kohezgjatja: "vit", perdorimi: ["rrjete"], gatishmeria: "pasi" });
  assert.equal(antwortenLesen({ kujdesi: ["izotretinoin"], perdorimi: ["mjek"] }), null);
  assert.equal(antwortenLesen(null), null);
  assert.equal(antwortenLesen("x"), null);
});

test("der Spiegel: Karte, Satz zum Probierten, sein Wort am Knopf", () => {
  const s = antwortenSpiegel({ anliegen: ["pucrrat", "njollat"], kohezgjatja: "vit", perdorimi: ["larje", "shume"], gatishmeria: "tani" });
  assert.deepEqual(s.zeilen.map((z) => z.marke), ["Ju shqetëson", "Që kur", "Keni provuar"]);
  assert.match(s.zeilen[0].text, /Aknet · Njollat e errëta/);
  // "Viele Produkte ohne Ergebnis" wiegt schwerer als "nur Seife".
  assert.match(s.satz, /^Shumë produkte pa plan/);
  assert.match(s.bereit, /doni të filloni sa më shpejt/);
  assert.equal(s.heiss, true);
  // Ohne Foto spricht der Satz nie von Fotos.
  assert.doesNotMatch(antwortenSpiegel({ perdorimi: ["farmaci"] }, { ohneFoto: true }).satz, /foto/i);
  // Dieselben Regeln wie die Seite: nichts nach Dauerkauf, kein Zoegern.
  for (const id of ["shume", "rrjete", "farmaci", "larje", "asgje"]) {
    const satz = antwortenSpiegel({ perdorimi: [id] }).satz;
    assert.ok(satz, id);
    assert.doesNotMatch(satz, /çdo ditë|përditë|rregullisht|para se të filloni|28 ditë|garantuar|100 %/, id);
  }
  for (const id of ["tani", "pasi", "analiza"]) assert.ok(antwortenSpiegel({ gatishmeria: id }).bereit, id);
});

test("Heart legt die Antworten in den Bericht, die Seite zeigt sie beim Angebot", () => {
  assert.match(ADAPTER, /antworten: antwortenFuerBericht\(antworten\)/);
  assert.match(HEART, /antworten: findeSitzung\(store\.getState\(\)\.lifeskin \|\| \{\}, id\)\?\.anamnese \|\| null/);
  assert.match(TERAPIA_HTML, /id="t-thate"[^>]*hidden/);
  assert.match(TERAPIA_HTML, /id="t-gati"[^>]*hidden/);
  // Der Satz steht ueber dem ersten Kaufknopf.
  assert.ok(TERAPIA_HTML.indexOf('id="t-gati"') < TERAPIA_HTML.indexOf('id="hero-knopf"'));
  const thate = methode(TERAPIA_JS, "#thate");
  assert.match(thate, /this\.mitAngebot \? antwortenSpiegel\(this\.daten\?\.antworten/);
  assert.match(methode(TERAPIA_JS, "#zeichnen"), /this\.#thate\(\);/);
});

test("Neuladen mitten in den Fragen: zurueck an dieselbe Frage, mit den Antworten", () => {
  const merken = methode(APP, "#standMerken");
  assert.match(merken, /const inFragen = this\.aktiv === "fragen" && this\.zustand\.nachFragen === true;/);
  assert.match(merken, /fragenI: Number\(this\.fragen\.i\) \|\| 0/);
  assert.match(merken, /antworten: \{ \.\.\.\(this\.fragen\.antworten \|\| \{\}\) \}/);
  const aufnehmen = methode(APP, "#standAufnehmen");
  assert.match(aufnehmen, /if \(stand\.schirm === "fragen"\) \{/);
  assert.match(aufnehmen, /const liste = fragenNachAufnahme\(this\.weg\);\s*this\.#fragenStarten\(liste,/);
  // Jede neue Frage wird sofort gemerkt - ein hart beendetes App-Fenster
  // meldet kein pagehide mehr.
  assert.match(methode(APP, "#frageZeichnen"), /this\.#standMerken\(\);/);
});

test("zwei schnelle Tipps ueberspringen keine Frage", () => {
  const getippt = methode(APP, "#frageGetippt");
  assert.match(getippt, /clearTimeout\(this\.fragen\.weiterUhr\);/);
  assert.match(getippt, /if \(this\.fragen\.i === bei && this\.aktiv === "fragen"\) this\.#frageWeiter\(\);/);
  assert.doesNotMatch(getippt, /setTimeout\(\(\) => this\.#frageWeiter\(\), 220\)/);
});

// ---------- Heart: Stufen, Bereitschaft, Marke ----------
import { ZWEIGE, baueBereitschaft, baueZweige } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

test("Heart: die vier Fragen stehen als Stufen im Trichter von Scan und Foto", () => {
  for (const id of ["scan", "foto"]) {
    const stufen = ZWEIGE.find((z) => z.id === id).stufen.map((s) => s.id);
    const nach = stufen.indexOf(id === "scan" ? "captured" : "fotogati");
    assert.deepEqual(stufen.slice(nach + 1, nach + 6), ["pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri"], id);
  }
  // Der Weg ohne Kamera fragt sie nicht.
  assert.ok(!ZWEIGE.find((z) => z.id === "trup").stufen.some((s) => /^pyetja/.test(s.id)));
  // Wer bei Frage 2 aufhoert, fehlt ab Frage 3; ein Fall von vorher (Name
  // ohne Fragen) zaehlt als durchgegangen.
  const zweig = baueZweige([
    { id: "a", typ: "foto", step: "pyetja2" },
    { id: "b", typ: "foto", step: "emri" }
  ]).find((z) => z.id === "foto");
  const zahl = (id) => zweig.stufen.find((s) => s.id === id).anzahl;
  assert.equal(zahl("pyetja2"), 2);
  assert.equal(zahl("pyetja3"), 1);
});

test("Heart: Bereitschaft je Antwort - und wer davon bestellt hat", () => {
  const b = baueBereitschaft([
    { id: "1", anamnese: { gatishmeria: "tani" }, hatBestellt: true, step: "ordered" },
    { id: "2", anamnese: { gatishmeria: "tani" }, step: "result" },
    { id: "3", anamnese: { gatishmeria: "analiza" }, step: "result" },
    { id: "4", anamnese: {}, step: "result" }
  ]);
  assert.equal(b.basis, 3);
  const tani = b.gruppen.find((g) => g.id === "tani");
  assert.equal(tani.anzahl, 2);
  assert.equal(tani.bestellt, 1);
  assert.equal(tani.bestelltAnteil, 0.5);
  assert.equal(b.gruppen.find((g) => g.id === "pasi").anzahl, 0);
});

test("Heart: Marke 'Will starten' nur bei 'sa më shpejt' und ohne Bestellung", () => {
  const render = readFileSync("apps/mnyra-heart/heart-lifeskin-render.js", "utf8");
  assert.match(render, /sitzung\.anamnese\?\.gatishmeria === "tani" && !sitzung\.hatBestellt/);
  assert.match(render, /\{ id: "gati", label: "Gati" \}/);
});
