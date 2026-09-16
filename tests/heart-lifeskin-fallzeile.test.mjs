// Die Liste der Analysen - und was links davon steht.
//
// Drei Dinge, die zusammengehoeren:
//
//   1. Die Reihenfolge der Bloecke: Bestellungen zuerst, die Analysen
//      direkt darunter. Dort liegt die Arbeit des Tages; alles Weitere
//      ist Auswertung und kann warten.
//   2. Die Bestellungen haben einen EIGENEN Zeitraum. Wer die Zahlen von
//      heute anschaut, will die Bestellung von vorgestern trotzdem sehen -
//      die ist noch zu packen.
//   3. Die Fallzeile selbst: links das erste Foto rund geschnitten,
//      daneben zwei Zeilen, senkrecht mittig. Oben, wer es ist; unten,
//      wie weit er gekommen ist. Das Bild kommt NICHT mit der Liste -
//      eine Aufnahme wiegt rund zweihundert Kilobyte, vierzig Zeilen
//      waeren acht Megabyte bei jedem Oeffnen des Reiters.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  GESCHAEFTSZONE, baueKennzahlen, baueTrichter, baueLesetiefe,
  baueHerkunft, baueVerteilung
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { ohneKommentare, funktion } from "./lifeskin-quelle.mjs";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const RENDER = lies("apps/mnyra-heart/heart-lifeskin-render.js");
const HEART = lies("apps/mnyra-heart/heart.js");
const ADAPTER = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
const EVENTS = lies("apps/mnyra-heart/heart-events.js");
const CSS = lies("apps/mnyra-heart/heart.css");
const STATE = lies("apps/mnyra-heart/heart-state.js");

const TAG = new Intl.DateTimeFormat("sv-SE", { timeZone: GESCHAEFTSZONE });
const tagVor = (tage) => {
  const jetzt = new Date();
  const heute = new Date(`${TAG.format(jetzt)}T12:00:00Z`);
  heute.setUTCDate(heute.getUTCDate() - tage);
  return TAG.format(heute);
};

const sitzung = (id, extra = {}) => ({
  id, createdAt: new Date().toISOString(), tag: tagVor(0), step: "result",
  name: id, code: `LS-${id}`, photos: ["gerade"], source: {}, device: {},
  hatBestellt: false, hatAnschrift: false, hatTelefon: false, ...extra
});

function zeichne(zusatz = {}) {
  const grund = {
    status: "ready", loadedFrom: "network", sitzungen: [], tests: [], berichte: {},
    produkte: [], abdeckung: [], kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]),
    lesetiefe: baueLesetiefe([]), herkunft: baueHerkunft([]), verteilung: baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produktOffen: "", produktStatus: "", zeitraum: "heute", fach: "neu",
    bestellZeitraum: "heute", vorschau: {}
  };
  return renderLifeskin({ ...grund, ...zusatz });
}

// ---------------------------------------------------------------------------
// Wo die Bloecke stehen
// ---------------------------------------------------------------------------

test("die Analysen stehen direkt unter den Bestellungen", () => {
  const html = zeichne({ sitzungen: [sitzung("a")] });
  const bestellungen = html.indexOf(">Bestellungen<");
  const analysen = html.indexOf(">Analysen<");
  const nachfassen = html.indexOf(">Nachfassen<");
  assert.ok(bestellungen > -1 && analysen > -1 && nachfassen > -1);
  assert.ok(bestellungen < analysen, "Die Analysen stehen ueber den Bestellungen");
  assert.ok(analysen < nachfassen, "Zwischen Bestellungen und Analysen steht noch etwas");
});

// ---------------------------------------------------------------------------
// Der eigene Zeitraum der Bestellungen
// ---------------------------------------------------------------------------

test("die Bestellungen haben ihre eigene Chipreihe", () => {
  const html = zeichne({ sitzungen: [sitzung("a", { hatBestellt: true })] });
  for (const [id, label] of [["heute", "Heute"], ["gestern", "Gestern"], ["woche", "1 Woche"], ["max", "Max"]]) {
    assert.ok(html.includes(`data-action="lifeskin-bestellzeitraum" data-wert="${id}"`), `${id} fehlt`);
    assert.ok(html.includes(label), `${label} fehlt`);
  }
});

test("der Zeitraum der Bestellungen haengt nicht an dem ueber den Zahlen", () => {
  const liste = [
    sitzung("heute", { hatBestellt: true, order: { total: 40 } }),
    sitzung("alt", { hatBestellt: true, tag: tagVor(3), order: { total: 40 } })
  ];
  // Die Zahlen stehen auf "Heute", die Bestellungen auf "1 Woche": Beide
  // Ausschnitte gelten gleichzeitig.
  const html = zeichne({ sitzungen: liste, zeitraum: "heute", bestellZeitraum: "woche" });
  const block = html.slice(html.indexOf(">Bestellungen<"), html.indexOf(">Analysen<"));
  assert.ok(block.includes('data-id="alt"'), "Die Bestellung von vorgestern fehlt");
  assert.ok(block.includes('data-id="heute"'));

  const eng = zeichne({ sitzungen: liste, zeitraum: "max", bestellZeitraum: "heute" });
  const engBlock = eng.slice(eng.indexOf(">Bestellungen<"), eng.indexOf(">Analysen<"));
  assert.ok(!engBlock.includes('data-id="alt"'), "Auf 'Heute' steht eine aeltere Bestellung in der Liste");
});

test("ein leerer Zeitraum sagt das, statt die Bestellungen verschwinden zu lassen", () => {
  const html = zeichne({
    sitzungen: [sitzung("alt", { hatBestellt: true, tag: tagVor(3) })],
    bestellZeitraum: "heute"
  });
  assert.ok(html.includes(">Bestellungen<"));
  assert.match(html, /In diesem Zeitraum keine Bestellung/);
});

test("der Chip fuehrt zu einer Operation, die es gibt", () => {
  assert.match(EVENTS, /action === "lifeskin-bestellzeitraum"/);
  assert.match(EVENTS, /operations\.setLifeskinBestellZeitraum\?\./);
  assert.match(HEART, /setLifeskinBestellZeitraum\(id\)/);
  assert.match(STATE, /bestellZeitraum:\s*"heute"/);
});

// ---------------------------------------------------------------------------
// Die Fallzeile
// ---------------------------------------------------------------------------

test("die Zeile traegt Name, Alter, Fallnummer und Anzahl der Fotos", () => {
  const html = zeichne({
    sitzungen: [sitzung("a", { name: "Arta", ageBand: "25-34", code: "LS-77", photos: Array(10).fill("x") })]
  });
  const zeile = html.slice(html.indexOf('class="heart-lifeskin-fall"'));
  assert.ok(zeile.includes("Arta"));
  assert.ok(zeile.includes("25-34"));
  assert.ok(zeile.includes("LS-77"));
  // Die Anzahl sitzt auf dem Bild: GEMESSEN - neben dem Bild bleiben auf
  // einem 390-Punkte-Telefon 264 Punkte, und mit ihr in der ersten Zeile
  // blieben fuer den Namen keine 50 mehr.
  assert.ok(zeile.includes('class="heart-lifeskin-fall__anzahl" title="10 Fotos">10<'));
});

test("die zweite Zeile zeigt alle drei Marken - erreichte hervorgehoben", () => {
  const html = zeichne({
    sitzungen: [
      sitzung("weit", { waSent: true, berichtGeoeffnet: true, hatBestellt: true }),
      sitzung("kurz")
    ],
    fach: "neu"
  });
  // Nur den Analysenblock ansehen: "weit" steht auch oben bei den
  // Bestellungen, und dort sieht die Zeile anders aus.
  const analysen = html.slice(html.indexOf(">Analysen<"));
  const teile = analysen.split('class="heart-lifeskin-fall"');
  const weit = teile.find((t) => t.includes('data-id="weit"')) || "";
  const kurz = teile.find((t) => t.includes('data-id="kurz"')) || "";

  // Beide Zeilen tragen alle drei Marken. Nur so liest sich auf einen
  // Blick, WO jemand haengengeblieben ist.
  for (const stueck of [weit, kurz]) {
    assert.ok(stueck.includes("WhatsApp"));
    assert.ok(stueck.includes("geoeffnet"));
    assert.ok(stueck.includes("bestellt"));
  }
  assert.ok(weit.includes("heart-lifeskin-pill--wa heart-lifeskin-pill--an"));
  assert.ok(weit.includes("heart-lifeskin-pill--kauf heart-lifeskin-pill--an"));
  assert.ok(!kurz.includes("heart-lifeskin-pill--an"), "Eine Zeile ohne Fortschritt zeigt eine Marke als erreicht");
});

test("es bleiben zwei Zeilen: oben wer, unten wie weit", () => {
  const html = zeichne({
    sitzungen: [sitzung("a", { waSent: true, berichtGeoeffnet: true, hatBestellt: true })]
  });
  const zeile = html.slice(html.indexOf('class="heart-lifeskin-fall"'));
  const kopf = zeile.slice(zeile.indexOf("__kopf"), zeile.indexOf("__fuss"));
  const fuss = zeile.slice(zeile.indexOf("__fuss"));
  // Die Zeit gehoert nach oben. Unten stehen drei Marken, und die fuellen
  // auf einem Telefon die Zeile bereits ganz aus - GEMESSEN: 237 von 244
  // Punkten. Mit der Zeit dazu wurden es drei Zeilen statt zwei.
  assert.ok(kopf.includes("heart-lifeskin-fall__zeit"), "Die Zeit steht nicht in der ersten Zeile");
  assert.ok(!fuss.includes("heart-lifeskin-fall__zeit"));
  assert.ok(fuss.includes("heart-lifeskin-pill"));
  // Links steht jetzt das Bild - die alte Zeitspalte der Analysenzeile ist weg.
  assert.ok(!zeile.slice(0, zeile.indexOf("heart-lifeskin-fall__leib")).includes("heart-lifeskin-zeile__zeit"));
});

test("von heute die Uhrzeit, aelteres traegt sein Datum", () => {
  const html = zeichne({
    sitzungen: [sitzung("heute"), sitzung("alt", { tag: tagVor(4), createdAt: new Date(Date.now() - 4 * 864e5).toISOString() })],
    fach: "neu"
  });
  const analysen = html.slice(html.indexOf(">Analysen<"));
  const teile = analysen.split('class="heart-lifeskin-fall"');
  const heute = teile.find((t) => t.includes('data-id="heute"')) || "";
  const alt = teile.find((t) => t.includes('data-id="alt"')) || "";
  assert.match(heute, /__zeit">\d{2}:\d{2}</, "Von heute fehlt die Uhrzeit");
  assert.match(alt, /__zeit">\d{2}\.\d{2}\.</, "Aelteres traegt kein Datum");
});

// ---------------------------------------------------------------------------
// Das Bild links
// ---------------------------------------------------------------------------

test("ohne Bild haelt der Platz dieselbe Groesse - mit dem Anfangsbuchstaben", () => {
  const html = zeichne({ sitzungen: [sitzung("a", { name: "Arta" })] });
  assert.ok(html.includes('data-vorschau="a"'), "Die Zeile fragt nicht nach einem Bild");
  assert.ok(html.includes("heart-lifeskin-fall__buchstabe"));
  assert.match(html, />A</);
});

test("liegt das Bild vor, steht es da - und die Zeile fragt nicht noch einmal", () => {
  const html = zeichne({
    sitzungen: [sitzung("a")],
    vorschau: { a: "data:image/jpeg;base64,XYZ" }
  });
  assert.ok(html.includes('src="data:image/jpeg;base64,XYZ"'));
  assert.ok(!html.includes('data-vorschau="a"'), "Ein vorhandenes Bild wird erneut angefordert");
});

test("das Bild ist rund geschnitten und fuellt seinen Platz", () => {
  const block = CSS.slice(CSS.indexOf(".heart-lifeskin-fall__bild"));
  assert.match(block, /border-radius:\s*15px/);
  assert.match(block, /object-fit:\s*cover/);
  // Feste Groesse, sonst springt die Liste beim Nachladen.
  assert.match(block, /width:\s*48px;\s*height:\s*48px/);
});

test("die Marken sind so gross wie der Text daneben", () => {
  const pille = CSS.slice(CSS.indexOf(".heart-lifeskin-pill {"), CSS.indexOf(".heart-lifeskin-pill--an"));
  const groesse = Number(/font-size:\s*([\d.]+)px/.exec(pille)?.[1]);
  // Der Massstab ist die zweite Zeile, wie sie in Heart ueberall aussieht -
  // nicht eine Zahl, die jemand hier hineingeschrieben hat.
  const zweiteZeile = Number(/\.heart-lifeskin-zeile__leib small \{[^}]*font-size:\s*([\d.]+)px/s.exec(CSS)?.[1]);
  const zeit = Number(/\.heart-lifeskin-fall__zeit \{[^}]*font-size:\s*([\d.]+)px/s.exec(CSS)?.[1]);
  assert.ok(groesse && zweiteZeile && zeit, "Eine der Schriftgroessen ist nicht zu finden");
  assert.equal(groesse, zweiteZeile, "Die Marken lesen sich nicht wie der Text daneben");
  assert.equal(groesse, zeit);
  // Und vor allem: KEINE gesperrten Versalien mehr in halber Groesse.
  assert.ok(!/\.heart-lifeskin-pill \{[^}]*text-transform/s.test(CSS));
  assert.ok(groesse > 11, `${groesse}px ist zu klein zum Lesen`);
});

// ---------------------------------------------------------------------------
// Woher das Bild kommt - und was es NICHT kostet
// ---------------------------------------------------------------------------

test("die Vorschau holt genau ein Dokument je Sitzung", () => {
  const quelle = ohneKommentare(funktion(ADAPTER, "ladeErstesFoto"));
  assert.match(quelle, /limit\(1\)/, "Ohne limit zoege eine Zeile alle zehn Aufnahmen");
  assert.match(quelle, /"photos"/);
});

test("die Bilder kommen erst, wenn die Zeile ins Bild scrollt", () => {
  const quelle = ohneKommentare(HEART);
  assert.match(quelle, /IntersectionObserver/);
  assert.match(quelle, /\[data-vorschau\]/);
  // Vor dem Neu-Einhaengen abhaengen: Heart schreibt den ganzen Bereich neu,
  // sonst haelt der Beobachter jede Zeile fest, die je gezeichnet wurde.
  assert.match(ohneKommentare(funktion(HEART, "beobachteLifeskinVorschau")), /disconnect\(\)/);
});

test("die geholten Bilder werden verkleinert, bevor sie im Zustand liegen", () => {
  const quelle = ohneKommentare(funktion(HEART, "bildVerkleinern"));
  assert.match(quelle, /canvas/);
  assert.match(quelle, /toDataURL\("image\/jpeg"/);
  assert.match(ohneKommentare(HEART), /VORSCHAU_KANTE\s*=\s*(\d+)/);
  const kante = Number(/VORSCHAU_KANTE\s*=\s*(\d+)/.exec(HEART)[1]);
  assert.ok(kante <= 320, `${kante} Punkte sind fuer ein Feld von 52 Punkten zu viel`);
});

test("ein Fehlschlag wird gemerkt, damit die Zeile nicht immer wieder fragt", () => {
  const quelle = ohneKommentare(funktion(HEART, "vorschauHolen"));
  assert.match(quelle, /catch\s*\{/);
  assert.match(quelle, /gefunden\[id\]\s*=\s*""/);
});
