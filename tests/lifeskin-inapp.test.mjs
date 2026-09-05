import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";
import { methode } from "./lifeskin-quelle.mjs";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");
const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");

function speicherAttrappe() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

// Die Besucher kommen aus den Fenstern von TikTok, Instagram und Facebook -
// nicht aus Safari oder Chrome. Diese Fenster sind eigene Browser mit
// eigenen Eigenheiten, und die Geraete dahinter sind oft alt.

// ---------- Die Rueckkehr aus WhatsApp ----------

test("wer nach dem Ergebnis zurueckkommt, faengt nicht von vorne an", async () => {
  const speicher = speicherAttrappe();
  const fetchFn = async () => ({ ok: true });

  const erste = new Sitzung({ fetchFn, speicher });
  await erste.starte({ sprache: "sq" });
  await erste.schritt("named", { name: "Arta" });
  await erste.schritt("captured", { views: 9 });
  await erste.schritt("result", { skinType: "mischhaut" });

  // Der WhatsApp-Link ersetzt in diesen Fenstern unsere Seite. "Zurueck"
  // laedt sie neu - das ist dieser Aufruf.
  const nachRueckkehr = new Sitzung({ fetchFn, speicher });
  const weiter = nachRueckkehr.fortsetzbar();
  assert.ok(weiter, "Der Besucher landet wieder bei der Namenseingabe");
  assert.equal(weiter.name, "Arta");
  assert.equal(weiter.views, 9);
  assert.equal(nachRueckkehr.code, erste.code, "Die Fallnummer aendert sich beim Zurueckkommen");
});

test("wer mitten in der Aufnahme neu laedt, faengt richtigerweise neu an", async () => {
  const speicher = speicherAttrappe();
  const fetchFn = async () => ({ ok: true });
  const erste = new Sitzung({ fetchFn, speicher });
  await erste.starte({ sprache: "sq" });
  await erste.schritt("camera");
  // Die Aufnahme muss ohnehin wiederholt werden - ein halber Ring ist
  // nichts, worauf man aufsetzen kann.
  assert.equal(new Sitzung({ fetchFn, speicher }).fortsetzbar(), null);
});

// Wer zurueckkommt, landet auf SEINER Seite - nicht auf einem Bildschirm im
// Trichter.
//
// Frueher stand hier ein Ergebnisbildschirm, der nach dem Neuladen
// wiederhergestellt werden musste. Das ist ersatzlos weg: Der Fall hat eine
// eigene Adresse, und ein Neuladen fuehrt einfach dorthin. Das ist der
// Grund, warum die Befundseite eine Seite ist und kein Bildschirm.
test("nach der Rueckkehr fuehrt der Trichter auf die Befundseite", () => {
  const block = methode(app, "starte");
  assert.ok(block.includes("this.sitzung.fortsetzbar()"),
    "Der abgeschlossene Scan wird beim Neuladen nicht erkannt");
  assert.ok(block.includes("location.replace(this.sitzung.berichtPfad)"),
    "Wer zurueckkommt, landet wieder im Trichter statt auf seiner Seite");
});

// Der Schritt, an dem der abgeschlossene Scan haengt.
//
// Ohne ihn stuende im Speicher weiter "captured", fortsetzbar() gaebe null
// zurueck, und der Rueckkehrer faende noch einmal die Namensfrage. Das ist
// kein Schoenheitsfehler: Er hat den Scan dann zweimal gemacht oder gar
// nicht.
test("die Uebergabe schreibt den abgeschlossenen Schritt", () => {
  const block = methode(app, "#uebergeben");
  assert.ok(block.includes('this.sitzung.schritt("result")'),
    "Der Scan wird nie als abgeschlossen vermerkt");
  assert.ok(block.indexOf('schritt("result")') < block.indexOf("location.assign"),
    "Der Schritt wird erst nach der Umleitung geschrieben - dann nie");
});

test("der Trichter haelt niemanden mehr auf einem eigenen Ergebnisbildschirm", () => {
  assert.ok(!html.includes('id="ls-befund"'), "Der alte Ergebnisbildschirm steht noch im HTML");
  assert.ok(!app.includes("#rueckkehrZeigen"), "Der alte Rueckkehrbildschirm lebt noch");
});

// ---------- Aeltere Geraete ----------
//
// In Kosovo und Albanien laufen viele aeltere Android-Telefone. Eine
// Eigenschaft, die deren Webansicht nicht kennt, wird stillschweigend
// uebersprungen - und wenn kein Vorgaenger dasteht, fehlt sie ganz.

test("die Kamerabuehne hat auch ohne aspect-ratio eine Hoehe", () => {
  // Ohne Vorgaenger haette sie auf Safari vor 15 und Chrome vor 88 die Hoehe
  // null: kein Kamerabild, kein Ring, nichts. Der Trichter waere tot.
  assert.ok(css.includes("padding-top: 100%"), "Kein Vorgaenger fuer aspect-ratio");
  assert.ok(css.includes("@supports (aspect-ratio"), "Beide Schreibweisen zaehlen gleichzeitig");
});

test("jeder Bildschirm hat auch ohne dvh eine Mindesthoehe", () => {
  // dvh kennt iOS erst ab 15.4. Ohne Vorgaenger klebte der Knopf nicht mehr
  // unten, sondern stuende irgendwo in der Mitte.
  const stellen = [...css.matchAll(/min-height: 100dvh/g)];
  assert.ok(stellen.length >= 2, "dvh wird gar nicht mehr benutzt");
  for (const treffer of stellen) {
    const davor = css.slice(Math.max(0, treffer.index - 120), treffer.index);
    assert.ok(davor.includes("100vh"), "Vor dvh fehlt der vh-Vorgaenger");
  }
});

test("jedes inset hat die vier Einzelwerte davor", () => {
  // inset kennt Chrome erst ab 87. Ohne Vorgaenger haette ein absolut
  // gesetztes Element keine Groesse - das Kamerabild waere unsichtbar.
  for (const treffer of css.matchAll(/inset: 0;/g)) {
    const davor = css.slice(Math.max(0, treffer.index - 70), treffer.index);
    assert.match(davor, /top: 0; right: 0; bottom: 0; left: 0;/,
      "Vor inset fehlen die Einzelwerte");
  }
});

test("keine Sprachmittel, die aeltere Webansichten nicht kennen", () => {
  const quellen = ["lifeskin-app.js", "lifeskin-session.js", "lifeskin-metrics.js",
    "lifeskin-catalog.js", "lifeskin-content.js", "lifeskin-pixel.js"];
  // Alle vier gibt es erst ab Chrome 85 bis 93 - und damit nicht auf jedem
  // Android, das in Prishtina in Betrieb ist.
  const heikel = ["replaceAll(", "structuredClone(", "Object.hasOwn(", ".at("];
  for (const datei of quellen) {
    const quelle = readFileSync(join(wurzel, "apps/lifeskin", datei), "utf8");
    for (const mittel of heikel) {
      assert.ok(!quelle.includes(mittel), `${datei} benutzt ${mittel}`);
    }
  }
});

// ---------- Kein Weg endet im Nichts ----------

test("ohne sessionStorage laeuft alles weiter", async () => {
  // Manche Fenster sperren den Speicher, und im privaten Modus wirft er.
  const sitzung = new Sitzung({ fetchFn: async () => ({ ok: true }), speicher: null });
  await assert.doesNotReject(() => sitzung.starte({ sprache: "sq" }));
  assert.equal(sitzung.fortsetzbar(), null);
  assert.match(sitzung.code, /^LS-/);
});

test("ein Speicher, der wirft, haelt nichts an", async () => {
  const boese = {
    getItem() { throw new Error("gesperrt"); },
    setItem() { throw new Error("gesperrt"); }
  };
  const sitzung = new Sitzung({ fetchFn: async () => ({ ok: true }), speicher: boese });
  await assert.doesNotReject(() => sitzung.starte({ sprache: "sq" }));
  assert.equal(sitzung.fortgesetzt, false);
});

test("faellt Firestore aus, laeuft der Verkauf weiter", async () => {
  // Eine Bestellung, die an der Zaehlung scheitert, waere der teuerste
  // denkbare Fehler.
  const sitzung = new Sitzung({ fetchFn: async () => { throw new Error("offline"); }, speicher: null });
  await assert.doesNotReject(() => sitzung.starte({ sprache: "sq" }));
  await assert.doesNotReject(() => sitzung.schritt("named", { name: "Arta" }));
  assert.equal(sitzung.stand.step, "named");
});

test("der Kamerabildschirm hat einen Ausloeser von Hand", () => {
  // Wer den Kopf nicht drehen kann oder will, muss trotzdem herauskommen.
  assert.ok(html.includes('id="ls-manuell"'));
  assert.ok(app.includes("#ringAbschluss({ vonHand: true })"));
});
