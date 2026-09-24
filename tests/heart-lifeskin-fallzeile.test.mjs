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
    produktOffen: "", produktStatus: "", zeitraum: "heute", fach: "alle",
    bestellZeitraum: "heute", vorschau: {}
  };
  return renderLifeskin({ ...grund, ...zusatz });
}

// ---------------------------------------------------------------------------
// Wo die Bloecke stehen
// ---------------------------------------------------------------------------

// FAELLE, BESTELLUNGEN, NACHFASSEN - in dieser Reihenfolge.
//
// Die Faelle stehen jetzt OBEN: Sie sind die Arbeit des Tages, und was
// danach kam (eine Bestellung, ein Anruf), liest man, wenn die Arbeit
// getan ist. Vorher lagen die Bestellungen darueber - eine Liste, die
// an den meisten Tagen leer ist, vor der, die jeden Tag voll ist.
test("Faelle, Bestellungen und Nachfassen stehen in dieser Reihenfolge", () => {
  const html = zeichne({ sitzungen: [sitzung("a")] });
  const analysen = html.indexOf(">Fälle<");
  const bestellungen = html.indexOf(">Bestellungen<");
  const nachfassen = html.indexOf(">Nachfassen<");
  assert.ok(bestellungen > -1 && analysen > -1 && nachfassen > -1);
  assert.ok(analysen < bestellungen, "Die Bestellungen stehen ueber den Faellen");
  assert.ok(bestellungen < nachfassen, "Nachfassen steht nicht unter den Bestellungen");
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
  const block = html.slice(html.indexOf(">Bestellungen<"), html.indexOf(">Nachfassen<"));
  assert.ok(block.includes('data-id="alt"'), "Die Bestellung von vorgestern fehlt");
  assert.ok(block.includes('data-id="heute"'));

  const eng = zeichne({ sitzungen: liste, zeitraum: "max", bestellZeitraum: "heute" });
  const engBlock = eng.slice(eng.indexOf(">Bestellungen<"), eng.indexOf(">Nachfassen<"));
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

test("die Zeile traegt Name, Fallnummer, Telefon und Anzahl der Fotos - kein Alter", () => {
  const html = zeichne({
    sitzungen: [sitzung("a", { name: "Arta", ageBand: "25-34", code: "LS-77", phone: "049111222", photos: Array(10).fill("x") })]
  });
  const zeile = html.slice(html.indexOf('class="heart-lifeskin-fall'), html.indexOf("</button>", html.indexOf('class="heart-lifeskin-fall')));
  assert.ok(zeile.includes("Arta"));
  assert.ok(zeile.includes("LS-77"));
  assert.ok(zeile.includes("049111222"));
  assert.ok(!zeile.includes("25-34"), "Das Alter steht wieder in der Zeile");
  // Die Anzahl sitzt auf dem Bild.
  assert.ok(zeile.includes('class="heart-lifeskin-fall__anzahl" title="10 Fotos">10<'));
});

// Unten: Weg | Geöffnet | Kasse, rechts Datum und Uhrzeit. Kein
// WhatsApp-Chip und kein "bestellt" - das hat sein eigenes Fach.
function zeileVon(html, id) {
  const liste = html.slice(html.indexOf(">Fälle<"));
  const start = liste.indexOf(`data-id="${id}"`);
  return start < 0 ? "" : liste.slice(start, liste.indexOf("</button>", start));
}

// Welche Chips in welchem Fach (Wunsch 24.09.).
function chipsIn(fach, extra = {}, bericht = { status: "fertig", freigabeAt: "x", preis: 39 }) {
  const html = zeichne({ sitzungen: [sitzung("c1", { typ: "scan", ...extra })], fach, berichte: { c1: bericht } });
  const zeile = zeileVon(html, "c1");
  const fuss = zeile.slice(zeile.indexOf("__fuss"));
  return [...fuss.matchAll(/class="heart-lifeskin-(?:pill|art|fall__zeit)[^"]*">([^<]+)</g)].map((m) => m[1]);
}

test("jedes Fach zeigt seine Chips - Datum und Uhrzeit ueberall", () => {
  const zeit = (liste) => liste.slice(-2).every((w) => /^\d{2}[.:]\d{2}$/.test(w));
  const seen = chipsIn("seen", { berichtGeoeffnet: true });
  assert.deepEqual(seen.slice(0, -2), ["Scan", "Geöffnet", "39 €"]);
  const kasse = chipsIn("kasse", { berichtGeoeffnet: true, kasseGeoeffnet: true });
  assert.deepEqual(kasse.slice(0, -2), ["Scan", "Kasse", "39 €"]);
  // Bestellt: der Betrag der Bestellung, nicht der vorgeschlagene Preis.
  const bestellt = chipsIn("bestellt", { berichtGeoeffnet: true, hatBestellt: true, order: { orderId: "o", total: 49 } });
  assert.deepEqual(bestellt.slice(0, -2), ["Scan", "49 €"]);
  const archiv = chipsIn("archiviert", { berichtGeoeffnet: true }, { status: "fertig", freigabeAt: "x", preis: 39, archiviert: true });
  assert.deepEqual(archiv.slice(0, -2), ["Scan", "Geöffnet", "Kasse", "39 €"]);
  const spaeter = chipsIn("spaeter", {}, { status: "fertig", freigabeAt: "x", spaeter: true });
  assert.deepEqual(spaeter.slice(0, -2), ["Scan", "Geöffnet", "Kasse"]);
  for (const liste of [seen, kasse, bestellt, archiv, spaeter]) assert.ok(zeit(liste), `Datum/Uhrzeit fehlen: ${liste}`);
  // Ohne Preis ein blasser Platzhalter.
  assert.ok(chipsIn("seen", { berichtGeoeffnet: true }, { status: "fertig", freigabeAt: "x" }).includes("– €"));
});

test("Datum und Uhrzeit stehen am Ende der unteren Zeile", () => {
  const html = zeichne({
    sitzungen: [sitzung("alt", { tag: tagVor(4), createdAt: new Date(Date.now() - 4 * 864e5).toISOString() })],
    fach: "alle"
  });
  const zeile = zeileVon(html, "alt");
  const fuss = zeile.slice(zeile.indexOf("__fuss"));
  assert.match(fuss, /__zeit">\d{2}\.\d{2}<\/span><span class="heart-lifeskin-fall__zeit">\d{2}:\d{2}</, "Datum und Uhrzeit fehlen als eigene Chips");
  // Oben in einer Zeile: Name, Fallnummer, Telefon.
  const kopf = zeile.slice(zeile.indexOf("__kopf"), zeile.indexOf("__fuss"));
  assert.ok(kopf.includes("<b>alt</b>") && kopf.includes("LS-alt"));
  assert.ok(!zeile.slice(zeile.indexOf("__kopf"), zeile.indexOf("__fuss")).includes("__zeit"));
});

test("das Zahnrad schaltet die Auswahl: alle, archivieren, später, löschen", () => {
  const aus = zeichne({ sitzungen: [sitzung("a"), sitzung("b")], fach: "alle" });
  assert.match(aus, /data-action="lifeskin-auswahl" aria-label="Fälle auswählen"/);
  assert.match(aus, /data-action="lifeskin-sitzung" data-id="a"/);
  assert.doesNotMatch(aus, /heart-faelle-wahl"/);
  // Der Satz "Abgegebene Faelle ..." ist weg.
  assert.doesNotMatch(aus, /Abgegebene Faelle/);

  const an = zeichne({ sitzungen: [sitzung("a"), sitzung("b")], fach: "alle", auswahl: ["a"] });
  assert.match(an, /data-action="lifeskin-auswahl-fall" data-id="a" aria-pressed="true"/);
  assert.match(an, /data-action="lifeskin-auswahl-fall" data-id="b" aria-pressed="false"/);
  assert.match(an, /1 ausgewählt/);
  assert.match(an, /data-action="lifeskin-auswahl-alle"\s+data-wert="(a,b|b,a)"/);
  for (const wert of ["archiv", "spaeter", "loeschen"]) assert.match(an, new RegExp(`data-wert="${wert}"`));
  const frage = zeichne({ sitzungen: [sitzung("a")], fach: "alle", auswahl: ["a"], auswahlLoeschen: true });
  assert.match(frage, /Wirklich 1 löschen\?/);
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
  assert.match(block, /border-radius:\s*1[56]px/);
  assert.match(block, /object-fit:\s*cover/);
  // Feste Groesse, sonst springt die Liste beim Nachladen.
  assert.match(block, /width:\s*48px;\s*height:\s*48px/);
  assert.match(CSS, /\.heart-faelle \.heart-lifeskin-fall__bild \{ width: 56px; height: 56px;/);
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

// KEIN FLACKERN: Heart zeichnet die Liste bei jeder Aenderung neu. Die
// schon dekodierten Gesichter werden danach wieder eingesetzt, statt neu
// geladen zu werden - vor dem Beobachter, im selben Takt wie das Zeichnen.
test("die Gesichter flackern beim Neuzeichnen nicht", () => {
  const html = zeichne({ sitzungen: [sitzung("a")], vorschau: { a: "data:image/jpeg;base64,XYZ" } });
  assert.match(html, /<img [^>]*data-vorschau-bild="a"/);
  assert.doesNotMatch(html, /data-vorschau-bild="a"[^>]*loading="lazy"|loading="lazy"[^>]*data-vorschau-bild/,
    "Ein Bild aus dem Speicher wartet auf lazy-loading und blinkt");
  const hook = HEART.slice(HEART.indexOf("store.subscribe((state) => {"));
  assert.ok(hook.indexOf("behalteLifeskinVorschau(root)") > -1
    && hook.indexOf("behalteLifeskinVorschau(root)") < hook.indexOf("beobachteLifeskinVorschau(root)"),
    "Die Bildknoten werden nach dem Zeichnen nicht wieder eingesetzt");
  assert.match(funktion(HEART, "behalteLifeskinVorschau"), /replaceWith/);
});

// Nur im Fach "Offen": der Chip Prompt, farbig sobald der Prompt fuer den
// Fall kopiert oder eine Antwort eingefuegt wurde (auf dem Geraet gemerkt).
test("im Fach Offen steht der Chip Prompt - farbig, sobald der Prompt gemacht ist", async () => {
  const speicher = new Map();
  globalThis.localStorage = { getItem: (k) => speicher.get(k) ?? null, setItem: (k, v) => speicher.set(k, String(v)), removeItem: (k) => speicher.delete(k) };
  try {
    const { promptMerken } = await import("../apps/mnyra-heart/heart-lifeskin-entwurf.js");
    const vorher = zeileVon(zeichne({ sitzungen: [sitzung("p1")], fach: "alle" }), "p1");
    assert.match(vorher, /heart-lifeskin-pill--prompt">Prompt</, "Im Fach Offen fehlt der Chip Prompt");
    // An Stelle von Geöffnet und Kasse - die koennen in Offen nie leuchten.
    const fuss = vorher.slice(vorher.indexOf("__fuss"));
    assert.doesNotMatch(fuss, />Geöffnet<|>Kasse</);
    promptMerken("p1");
    const nachher = zeileVon(zeichne({ sitzungen: [sitzung("p1")], fach: "alle" }), "p1");
    assert.match(nachher, /heart-lifeskin-pill--prompt heart-lifeskin-pill--an">Prompt</);
    // In den anderen Faechern nicht.
    const seen = zeichne({ sitzungen: [sitzung("p1", { berichtGeoeffnet: true })], fach: "seen",
      berichte: { p1: { status: "fertig", freigabeAt: "x" } } });
    assert.doesNotMatch(seen, /heart-lifeskin-pill--prompt/);
  } finally {
    delete globalThis.localStorage;
  }
});

test("im Fach Ready steht Freigegeben statt Geöffnet und Kasse", () => {
  const html = zeichne({ sitzungen: [sitzung("r1", { typ: "scan" })], fach: "ready",
    berichte: { r1: { status: "fertig", freigabeAt: "x" } } });
  const zeile = zeileVon(html, "r1");
  assert.match(zeile, /heart-lifeskin-pill--frei heart-lifeskin-pill--an">Freigegeben</);
  assert.doesNotMatch(zeile.slice(zeile.indexOf("__fuss")), />Geöffnet<|>Kasse<|>Prompt</);
});

// FOTOS SCHNELLER UND OHNE SPRINGEN (24.09.)
test("die Aufnahmen kommen zuerst vom Geraet, dann vom Server", () => {
  const fotos = ohneKommentare(funktion(ADAPTER, "ladeFotos"));
  assert.match(fotos, /getDocsFromCache\(sammlung\)/);
  assert.match(fotos, />= erwartet/, "Vom Geraet nur, wenn alle Blicke da sind");
  assert.match(ohneKommentare(funktion(ADAPTER, "ladeErstesFoto")), /getDocsFromCache/);
  assert.match(ohneKommentare(funktion(HEART, "oeffneLifeskinSitzung")), /ladeFotos\(id, erwartet\)/);
});

test("die kleinen Bilder bleiben auf dem Geraet und kommen schubweise", () => {
  const quelle = ohneKommentare(funktion(HEART, "vorschauHolen"));
  assert.match(quelle, /vorschauSpeicherLesen\(\)/);
  assert.match(quelle, /vorschauSpeichern\(gefunden\)/);
  // Jeder Schub steht sofort da: patchLifeskin in der Schleife.
  const schleife = quelle.slice(quelle.indexOf("for (let i = 0"));
  assert.match(schleife, /patchLifeskin/);
  // Ein offener Fall hat Vorrang.
  assert.match(schleife, /lifeskin\?\.offen/);
});

test("waehrend die Aufnahmen laden, steht ihr Platz schon da", async () => {
  const { renderSitzungDetail } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const html = renderSitzungDetail({ id: "x", typ: "scan", photos: ["gerade", "links", "rechts"], createdAt: new Date().toISOString() }, null, "loading");
  assert.equal((html.match(/heart-lifeskin-foto--platz/g) || []).length, 3, "Nicht je Blick eine Kachel");
  assert.doesNotMatch(html, /Fotos werden geladen/);
  const fertig = renderSitzungDetail({ id: "x", typ: "scan", photos: ["gerade"], createdAt: new Date().toISOString() },
    { gerade: { jpeg: "data:image/jpeg;base64,AAA" } }, "ready");
  assert.match(fertig, /data-vorschau-bild="x:gerade"/);
  assert.doesNotMatch(fertig, /heart-lifeskin-foto--platz/);
});
