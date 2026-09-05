import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";
import { OBERFLAECHE, t } from "../apps/lifeskin/lifeskin-content.js";
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

test("nach der Rueckkehr steht die Frage sofort da", () => {
  const block = methode(app, "#rueckkehrZeigen");
  assert.ok(block.includes('$("#ls-warueck")?.classList.remove'),
    "Wer gerade aus WhatsApp kommt, wird nicht gefragt");
  // Und der Weg zum Angebot ist weg - er braucht den gerechneten Befund,
  // den es nach einem Neuladen nicht mehr gibt.
  assert.ok(block.includes('$("#ls-befundweiter")?.classList.add("ls-verstecken")'),
    "Ein Knopf, der ins Leere fuehrt, bleibt stehen");
});

test("die Rueckkehr sagt, dass nichts verloren ist", () => {
  for (const sprache of ["sq", "de"]) {
    const text = t(OBERFLAECHE.akteZurueck, sprache);
    assert.ok(text.includes("{name}"), `${sprache}: der Name fehlt`);
    assert.ok(text.length > 20);
  }
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
    "lifeskin-rules.js", "lifeskin-catalog.js", "lifeskin-content.js", "lifeskin-pixel.js"];
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
