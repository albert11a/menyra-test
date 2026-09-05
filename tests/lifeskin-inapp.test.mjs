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
const berichtCss = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");

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

test("jeder Bildschirm hat auch ohne dvh eine Hoehe", () => {
  // dvh kennt iOS erst ab 15.4. Ohne Vorgaenger haette der Bildschirm gar
  // keine Hoehe - der Knopf klebte nicht mehr unten, sondern stuende
  // irgendwo in der Mitte.
  //
  // Geprueft werden beide Dateien: Der Trichter und die Befundseite setzen
  // dieselbe Hoehe, und beide muessen den Vorgaenger tragen.
  for (const [name, quelle] of [["Trichter", css], ["Befundseite", berichtCss]]) {
    const stellen = [...quelle.matchAll(/(min-height|height): 100dvh/g)];
    assert.ok(stellen.length >= 1, `${name}: dvh wird gar nicht mehr benutzt`);
    for (const treffer of stellen) {
      const davor = quelle.slice(Math.max(0, treffer.index - 120), treffer.index);
      assert.match(davor, new RegExp(`${treffer[1]}: 100vh`),
        `${name}: 100dvh ohne 100vh davor - auf iOS vor 15.4 hat der Bildschirm dann keine Hoehe`);
    }
  }
});

// Niemand scrollt, solange nur gewartet wird.
//
// Der Bildschirm IST das Fenster, nicht mindestens das Fenster. Mit
// min-height durfte der Inhalt ihn laenger machen, und genau das ist
// unbemerkt passiert: 27 Pixel auf jedem Geraet, weil der
// Fortschrittsbalken im Fluss lag. Sichtbar war davon nur, dass sich die
// Seite schieben liess - und wer wischt und Bewegung sieht, sucht Inhalt,
// den es nicht gibt.
test("kein Bildschirm ist laenger als das Fenster", () => {
  for (const [name, quelle, wahl] of [
    ["Trichter", css, ".ls-schirm {"], ["Befundseite", berichtCss, ".lb-schirm {"]
  ]) {
    const stelle = quelle.indexOf(wahl);
    assert.notEqual(stelle, -1, `${name}: die Regel fuer den Bildschirm fehlt`);
    const block = quelle.slice(stelle, quelle.indexOf("}", stelle));
    assert.match(block, /height: 100dvh/, `${name}: der Bildschirm hat keine feste Hoehe`);
    assert.doesNotMatch(block, /min-height: 100dvh/,
      `${name}: mit min-height darf der Inhalt den Bildschirm laenger machen`);
  }
  // Und der Fortschrittsbalken liegt ausserhalb des Flusses - er war der
  // Grund fuer die 27 Pixel.
  const balken = css.slice(css.indexOf(".ls-fortschritt {"), css.indexOf("}", css.indexOf(".ls-fortschritt {")));
  assert.match(balken, /position: fixed/, "Der Fortschrittsbalken laengt den Bildschirm wieder");
});

// Was zu lang wird, regelt der Mittelteil in sich - der Knopf bleibt
// stehen. Ohne min-height: 0 wird ein Flexkind nie kleiner als sein Inhalt
// und schoebe Kopf und Knopf hinaus.
test("der Mittelteil darf schrumpfen, der Knopf nicht", () => {
  const stelle = css.indexOf(".ls-inhalt {");
  assert.notEqual(stelle, -1);
  const block = css.slice(stelle, css.indexOf("}", stelle));
  assert.match(block, /min-height: 0/, "Der Mittelteil kann nicht schrumpfen");
  assert.match(block, /overflow-y: auto/, "Bleibt zu wenig Platz, wird Text abgeschnitten");
  assert.match(css, /\.ls-kopf, \.ls-fuss \{ flex: none; \}/,
    "Kopf und Fuss duerfen nicht mitschrumpfen");
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
