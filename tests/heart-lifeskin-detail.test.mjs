import test from "node:test";
import assert from "node:assert/strict";

import { renderLifeskin } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import {
  baueKennzahlen, baueTrichter, baueHerkunft, baueVerteilung, normalisiere
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { bindHeartEvents } from "../apps/mnyra-heart/heart-events.js";
import fs from "node:fs";
import path from "node:path";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

function zustandMit(roh = [], zusatz = {}) {
  const sitzungen = roh.map((d, i) => normalisiere(d.id || `s${i}`, d));
  return {
    status: "ready", loadedFrom: "network", sitzungen, produkte: [], abdeckung: [],
    kennzahlen: baueKennzahlen(sitzungen), trichter: baueTrichter(sitzungen),
    herkunft: baueHerkunft(sitzungen), verteilung: baueVerteilung(sitzungen),
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    ...zusatz
  };
}

const EINE = {
  id: "abc", createdAt: new Date().toISOString(), step: "ordered",
  name: "Arta", ageBand: "25-34", skinType: "mischhaut", sprache: "sq",
  findings: [{ id: "roetung", stufe: 2 }, { id: "glanz", stufe: 0 }],
  metrics: { wangeLinks: { roetung: 11.5, glanz: 0.03, textur: 0.71, hautton: -12 } },
  ringAnteil: 1, views: 9, mesh: true, mmJeBildpunkt: 0.118,
  address: { strasse: "Rr. Dëshmorët 5", ort: "Prishtinë" },
  order: { orderId: "LS-AB12", total: 53 }
};

test("die Liste zeigt jede Analyse als anklickbaren Knopf", () => {
  const html = renderLifeskin(zustandMit([EINE]));
  assert.match(html, /data-action="lifeskin-sitzung"/);
  assert.match(html, /data-id="abc"/);
});

test("aufgeklappt steht die Analyse allein da", () => {
  const html = renderLifeskin(zustandMit([EINE], { offen: "abc" }));
  assert.match(html, /Arta/);
  // Nicht die Liste daneben - sonst findet man auf dem Handy nichts.
  assert.doesNotMatch(html, /TRICHTER|Trichter/);
  // DER WEG ZURUECK STEHT OBEN IM KOPF, nicht mitten im Text: dort sucht
  // man ihn, und dort steht er auch, wenn man weit gescrollt hat.
  assert.doesNotMatch(html, /Alle Analysen/);
});

test("der Weg zurueck steht im Kopf, neben dem Aktualisieren", () => {
  const shell = lies("apps/mnyra-heart/heart-render.js");
  assert.match(shell, /isLifeskinDetail/);
  assert.match(shell, /data-action="lifeskin-sitzung-zu"/);
  // Und der Titel "Lifeskin" faellt in der ganzen Ansicht weg, nicht nur
  // in der Akte: Er sagte, was links im Menue schon angehakt ist, und
  // kostete auf dem Telefon die halbe Hoehe vor der ersten Zahl.
  assert.match(shell, /VIEWS_WITHOUT_PAGE_TITLE\.has\(activeView\) \? ""/,
    "Die Shell schreibt wieder eine Ueberschrift ueber die Ansicht");
  assert.match(shell, /const VIEWS_WITHOUT_PAGE_TITLE = new Set\(\[[\s\S]{0,160}"lifeskin"/,
    "Die Analysen stehen nicht in der Liste der Ansichten ohne Titel");
});

// Die Akte in der Reihenfolge, in der danach gesucht wird.
test("Fallnummer, Name, Alter, Datum - in dieser Reihenfolge", () => {
  const html = renderLifeskin(zustandMit([EINE], { offen: "abc" }));
  const akte = html.slice(html.indexOf("heart-lifeskin-akte"), html.indexOf("heart-lifeskin-fotos"));
  const stellen = ["Fallnummer", "Name", "Alter", "Datum"].map((wort) => akte.indexOf(wort));
  assert.ok(stellen.every((i) => i > -1), "In der Akte fehlt eine der vier Zeilen");
  assert.deepEqual([...stellen].sort((a, b) => a - b), stellen, "Die vier Zeilen stehen nicht in der Reihenfolge");
});

test("die Aufnahmen stehen zwischen Akte und Befund, in einer Reihe zum Wischen", () => {
  const bild = "data:image/jpeg;base64,AAA";
  const html = renderLifeskin(zustandMit([EINE], {
    offen: "abc",
    fotos: { abc: { gerade: { jpeg: bild }, rechts: { jpeg: bild } } },
    fotosStatus: "ready"
  }));
  const akte = html.indexOf("heart-lifeskin-akte");
  const reihe = html.indexOf("heart-lifeskin-fotos--reihe");
  const befund = html.indexOf("heart-lifeskin-editor");
  assert.ok(akte > -1 && reihe > akte && befund > reihe,
    "Akte, Fotos, Befund stehen nicht in dieser Reihenfolge");
  const css = lies("apps/mnyra-heart/heart.css");
  assert.match(css, /\.heart-lifeskin-fotos--reihe \{[^}]*overflow-x: auto/s);
  assert.match(css, /scroll-snap-type: x mandatory/);
});

test("die drei Aufnahmen erscheinen mit Beschriftung", () => {
  const bild = "data:image/jpeg;base64,AAA";
  const html = renderLifeskin(zustandMit([EINE], {
    offen: "abc",
    fotos: { abc: { gerade: { jpeg: bild }, rechts: { jpeg: bild }, links: { jpeg: bild } } },
    fotosStatus: "ready"
  }));
  for (const wort of ["Gerade", "Kopf nach rechts", "Kopf nach links"]) {
    assert.ok(html.includes(wort), `${wort} fehlt`);
  }
  assert.equal((html.match(/<img /g) || []).length, 3);
});

test("fehlende Fotos werden benannt, nicht verschwiegen", () => {
  const laedt = renderLifeskin(zustandMit([EINE], { offen: "abc", fotosStatus: "loading" }));
  assert.match(laedt, /Fotos werden geladen/);
  const leer = renderLifeskin(zustandMit([EINE], { offen: "abc", fotosStatus: "ready" }));
  assert.match(leer, /keine Fotos/);
});

test("Anschrift und Bestellung stehen da - Aufnahme und Messwerte nicht mehr", () => {
  const html = renderLifeskin(zustandMit([EINE], { offen: "abc" }));
  assert.match(html, /Prishtin/);
  assert.match(html, /LS-AB12/);
  assert.match(html, /53 €/);
  // WEG: Ringanteil, Zahl der Aufnahmen, Millimeter je Bildpunkt und die
  // Zonentabelle. Sie haben keine Frage beantwortet, die in dieser Akte
  // gestellt wird - was gemessen wurde, steht im Befundbogen, dort wird
  // damit gearbeitet.
  assert.doesNotMatch(html, /wangeLinks/);
  assert.doesNotMatch(html, /9 Aufnahmen/);
  assert.doesNotMatch(html, /mm je Bildpunkt/);
  assert.doesNotMatch(html, />Messwerte</);
});

// Was er auf seiner Seite getan hat - die ganze Kette, nicht vier Haken.
test("der Weg des Patienten zeigt jeden Schritt bis zur Bestellung", () => {
  const html = renderLifeskin(zustandMit([{
    ...EINE, warteseiteGeoeffnet: true, phone: "+38344123456", hatTelefon: true,
    berichtGeoeffnet: true, sahSchnitt: true, sahTherapie: true, sahPreis: true
  }], { offen: "abc" }));
  // "Warteseite geoeffnet" und "Befund geoeffnet" sind zwei Zeilen, nicht
  // mehr eine: Die Warteseite sieht jeder, den freigegebenen Befund nicht.
  for (const wort of ["Warteseite geoeffnet", "Nummer hinterlassen",
    "Befund geoeffnet (freigegeben)", "Befund gelesen", "Therapie gesehen", "Preis gesehen",
    "Kasse geoeffnet", "WhatsApp angetippt", "Senden bestaetigt", "Link kopiert",
    "Anschrift eingegeben", "Bestellt"]) {
    assert.ok(html.includes(wort), `${wort} fehlt im Weg`);
  }
  // Wo die Kette abreisst, steht die Frage, die dieser Fall stellt.
  assert.match(html, /Weitester erfasster Meilenstein: Bestellt/);
  // Acht: die sechs gesetzten (Warteseite, Nummer, Befund, Schnitt,
  // Therapie, Preis) plus Anschrift und Bestellung, die dieser Fall schon
  // hat. Der Weg ist um zwei Zeilen laenger, seit Warteseite und Befund
  // getrennt sind und die Nummer ihre eigene bekommt.
  assert.match(html, /8 von 12 Schritten/);
});

test("der Link der Patientenseite laesst sich kopieren statt abtippen", () => {
  const html = renderLifeskin(zustandMit([EINE], { offen: "abc" }));
  assert.match(html, /data-action="lifeskin-link-kopieren"/);
  assert.match(html, /mnyra\.com\/analiza\/abc/);
});

// Der Knopf, der die Testdaten wegraeumt.
test("der Reset-Knopf fragt erst und loescht dann", () => {
  const zu = renderLifeskin(zustandMit([EINE]));
  assert.match(zu, /Alle 1 Analysen loeschen/);
  assert.doesNotMatch(zu, /Ja, loeschen/);

  const gefragt = renderLifeskin(zustandMit([EINE], { resetGefragt: true }));
  assert.match(gefragt, /Ja, loeschen/);
  assert.match(gefragt, /nicht rueckgaengig/);
  assert.match(gefragt, /data-action="lifeskin-reset-abbrechen"/);
});

test("ohne Analysen gibt es nichts zu loeschen", () => {
  assert.doesNotMatch(renderLifeskin(zustandMit([])), /loeschen/);
});

// EIN KNOPF, DER ALLES LOESCHT, STEHT NICHT OBEN.
//
// Er stand vor der ersten Zahl - genau dort, wo die Hand beim Scrollen
// zuerst hinkommt, und Firestore kennt keinen Papierkorb. Angefasst wird
// er hoechstens einmal; alles darueber wird jeden Tag gelesen.
test("der Loeschknopf und der Meldungsschalter stehen ganz unten", () => {
  const html = renderLifeskin(zustandMit([EINE]));
  const loeschen = html.indexOf("Analysen loeschen");
  const schalter = html.indexOf("data-push-schalter");
  const trichter = html.indexOf("heart-lifeskin-trichter");
  const anbieter = html.indexOf("data-anbieterfeld");

  assert.ok(trichter > -1 && anbieter > -1, "Trichter oder Anbieterblock fehlen");
  assert.ok(schalter > trichter, "Der Meldungsschalter steht wieder ueber den Zahlen");
  assert.ok(loeschen > anbieter,
    "Der Loeschknopf steht nicht hinter allem, was taeglich gelesen wird");
});

// Die Knoepfe standen schon im Markup - aufgefangen hat sie nie jemand.
test("jeder Lifeskin-Knopf wird auch behandelt", async () => {
  const gerufen = [];
  const knopf = (action, id = "") => ({
    getAttribute: (n) => (n === "data-action" ? action : n === "data-id" ? id : null),
    hasAttribute: (n) => n === "data-action" || (n === "data-id" && Boolean(id)),
    closest: function () { return this; },
    id: ""
  });
  const wurzel = {
    addEventListener: (art, fn) => { wurzel[art] = fn; },
    removeEventListener: () => {}
  };
  bindHeartEvents({
    root: wurzel,
    operations: {
      openLifeskinSitzung: (id) => gerufen.push(`sitzung:${id}`),
      closeLifeskinSitzung: () => gerufen.push("zu"),
      lifeskinZuruecksetzen: () => gerufen.push("reset"),
      lifeskinResetAbbrechen: () => gerufen.push("abbrechen")
    }
  });

  for (const [action, id] of [["lifeskin-sitzung", "abc"], ["lifeskin-sitzung-zu"], ["lifeskin-reset"], ["lifeskin-reset-abbrechen"]]) {
    await wurzel.click({ target: knopf(action, id), preventDefault: () => {} });
  }
  assert.deepEqual(gerufen, ["sitzung:abc", "zu", "reset", "abbrechen"]);
});

// DIE NUMMER GEHOERT NEBEN DIE FALLNUMMER.
//
// Beides wird in derselben Minute gebraucht: die Nummer zum Anrufen, die
// Fallnummer fuer die Nachricht. Wer sie erst suchen muss, tut es seltener
// - und von 32 fertigen Analysen haben nur die 13 ihren Befund gesehen,
// bei denen jemand Bescheid gegeben hat.
test("die Akte zeigt Fallnummer und Telefon, beides kopierbar", () => {
  const html = renderLifeskin(zustandMit([{
    ...EINE, code: "LS-1809-ZBCTL", phone: "+38344123456"
  }], { offen: "abc" }));

  const akte = html.slice(html.indexOf("heart-lifeskin-akte"), html.indexOf("heart-lifeskin-fotos"));
  // Die Fallnummer ganz oben, die Nummer direkt darunter.
  assert.ok(akte.indexOf("LS-1809-ZBCTL") < akte.indexOf("+38344123456"),
    "Die Fallnummer steht nicht ueber der Telefonnummer");
  // Und beide vor Name, Alter und Datum.
  assert.ok(akte.indexOf("+38344123456") < akte.indexOf("<dt>Name</dt>"),
    "Die Telefonnummer steht unter den Nebensachen");

  // Beides mit einem Griff in die Zwischenablage - Abtippen ist der Weg,
  // auf dem eine Ziffer verrutscht.
  assert.match(akte, /data-action="lifeskin-text-kopieren" data-wert="LS-1809-ZBCTL"/);
  assert.match(akte, /data-action="lifeskin-text-kopieren" data-wert="\+38344123456"/);
  // Und anrufbar, ohne die Nummer irgendwohin zu uebertragen.
  assert.match(akte, /href="tel:\+38344123456"/);
});

test("ohne Nummer steht da, warum es keine gibt", () => {
  // Ein leeres Feld beantwortet die Frage nicht, die sich stellt: Kann ich
  // diesen Menschen erreichen oder nicht?
  const ohne = renderLifeskin(zustandMit([{ ...EINE, phone: "" }], { offen: "abc" }));
  assert.match(ohne, /keine — nicht erreichbar/);

  const perWa = renderLifeskin(zustandMit([{ ...EINE, phone: "", waSent: true }], { offen: "abc" }));
  assert.match(perWa, /keine — hat auf WhatsApp geschrieben/);
});

test("die Anschrift-Nummer zaehlt auch, wenn keine vom Warteschirm da ist", () => {
  // Wer bestellt hat, hat seine Nummer in der Anschrift hinterlassen -
  // dann ist er erreichbar, auch ohne den Warteschirm.
  const html = renderLifeskin(zustandMit([{
    ...EINE, phone: "", address: { ...EINE.address, telefon: "049111222" }
  }], { offen: "abc" }));
  assert.match(html, /049111222/);
});
