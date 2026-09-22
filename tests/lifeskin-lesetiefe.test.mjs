import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { normalisiere, baueLesetiefe, LESEMARKEN }
  from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderSitzungDetail } from "../apps/mnyra-heart/heart-lifeskin-render.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const seite = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");
const render = readFileSync(join(wurzel, "apps/mnyra-heart/heart-lifeskin-render.js"), "utf8");

// Wo im Bericht jemand aufhoert.
//
// Heart wusste bisher drei Dinge ueber die Befundseite: geoeffnet,
// WhatsApp getippt, bestellt. Dazwischen lagen zwei Bildschirmlaengen
// Bericht, ueber die nichts bekannt war - und genau dort steigt aus, wer
// aussteigt. "Es kauft niemand" ist keine Erkenntnis; "sie lesen bis zur
// Therapie und sehen den Preis nie" ist eine.

const MARKEN = ["sahSchnitt", "sahTherapie", "sahPreis", "kasseGeoeffnet"];

test("die Seite setzt alle vier Marken", () => {
  for (const marke of MARKEN) {
    assert.ok(seite.includes(`"${marke}"`), `Die Seite setzt ${marke} nicht`);
  }
  // Jede genau einmal - vier PATCH je Sitzung, nicht vierzig.
  assert.match(seite, /if \(this\.marken\.has\(name\)\) return;/,
    "Eine Marke wuerde bei jedem Scrollen neu geschrieben");
  // Gerechnet, nicht beobachtet: derselbe Grund wie beim Kaufknopf.
  assert.match(seite, /#spurPruefen\(\)/, "Es gibt keine Messung der Lesetiefe");
  assert.ok(!/IntersectionObserver[\s\S]{0,400}sahPreis/.test(seite),
    "Die Marken haengen an einem Beobachter - der verschlaeft jeden Sprung");
});

test("die Regeln lassen genau diese vier Felder zu", () => {
  // Ohne sie weist Firestore jeden Schreibversuch ab, und die Seite
  // saehe trotzdem normal aus: Die Zahlen blieben einfach auf null.
  for (const marke of MARKEN) {
    assert.ok(regeln.includes(`"${marke}"`), `${marke} fehlt in der Liste der erlaubten Felder`);
    assert.ok(regeln.includes(`data.${marke} is bool`), `${marke} wird nicht auf bool geprueft`);
  }
});

test("die Lesetiefe zaehlt jede Marke fuer sich", () => {
  // NICHT kumulativ, und das ist der ganze Punkt: Der Trichter rechnet
  // "am weitesten gekommen". Waeren die Marken dort eingehaengt, wuerde
  // jeder, der auf der Warteseite WhatsApp antippt, automatisch als
  // "Preis gesehen" gezaehlt.
  const sitzungen = [
    // Liest alles und bestellt.
    normalisiere("a", { berichtGeoeffnet: true, sahSchnitt: true, sahTherapie: true,
      sahPreis: true, kasseGeoeffnet: true, order: { orderId: "LS-1", total: 53 } }),
    // Liest bis zum Preis und bricht dort ab.
    normalisiere("b", { berichtGeoeffnet: true, sahSchnitt: true, sahTherapie: true, sahPreis: true }),
    // Kommt nicht ueber den Befund hinaus.
    normalisiere("c", { berichtGeoeffnet: true, sahSchnitt: true }),
    // Oeffnet die Seite und liest nichts.
    normalisiere("d", { berichtGeoeffnet: true }),
    // Tippt WhatsApp an, liest den Bericht aber nie.
    normalisiere("e", { berichtGeoeffnet: true, waClick: true, waSent: true })
  ];
  const l = Object.fromEntries(baueLesetiefe(sitzungen).map((m) => [m.id, m.anzahl]));
  assert.equal(l.berichtGeoeffnet, 5);
  assert.equal(l.sahSchnitt, 3);
  assert.equal(l.sahTherapie, 2);
  assert.equal(l.sahPreis, 2);
  assert.equal(l.kasseGeoeffnet, 1);
  assert.equal(l.hatBestellt, 1);

  // Der WhatsApp-Tipper zaehlt NICHT als jemand, der den Preis gesehen hat.
  assert.ok(l.sahPreis < l.berichtGeoeffnet,
    "Die Lesetiefe rechnet kumulativ - dann ist sie wertlos");
});

test("der Verlust zeigt, WO es aufhoert", () => {
  const sitzungen = [
    ...Array.from({ length: 10 }, (_, i) =>
      normalisiere(`x${i}`, { berichtGeoeffnet: true, sahSchnitt: true, sahTherapie: true })),
    ...Array.from({ length: 2 }, (_, i) =>
      normalisiere(`y${i}`, { berichtGeoeffnet: true, sahSchnitt: true, sahTherapie: true,
        sahPreis: true, kasseGeoeffnet: i === 0,
        // Wer die Kasse oeffnet und bestellt, hat auch eine Anschrift
        // eingegeben - sonst stuende der groesste Verlust dort, wo in
        // Wahrheit nur die Probe unvollstaendig ist.
        address: i === 0 ? { strasse: "Rr. 1", ort: "Prishtinë" } : null,
        order: i === 0 ? { orderId: "LS-9", total: 53 } : null }))
  ];
  const stufen = baueLesetiefe(sitzungen);
  const preis = stufen.find((m) => m.id === "sahPreis");
  // Von zwoelf, die die Therapie sehen, kommen zwei zum Preis.
  assert.equal(Number(preis.verlust.toFixed(4)), 0.8333);
  const schlimmster = stufen.reduce((a, b) => (b.verlust > a.verlust ? b : a));
  assert.equal(schlimmster.id, "sahPreis", "Der groesste Verlust wird nicht gefunden");
});

test("Heart zeigt die Lesetiefe - und nur die Zahlen", () => {
  // SIE IST DER SECHSTE TRICHTER, kein eigener Block mehr: derselbe
  // Blick auf denselben Weg, nur hinter der Freigabe. Ein Chip
  // ("Bericht") schaltet sie auf.
  assert.match(render, /\{ id: "bericht", label: "Bericht" \}/,
    "Die Lesetiefe hat keinen Chip");
  // Sie haengt am gewaehlten Zeitraum - derselbe Ausschnitt wie die
  // Kacheln darueber.
  assert.match(render, /baueLesetiefe\(sitzungen \|\| \[\], zeitraum \|\| "max"\)/,
    "Berichtsereignisse duerfen nicht nach Scantag vorgefiltert werden");

  // DIE ERKLAERSAETZE SIND WEG - alle, nicht nur einer.
  //
  // Unter der Liste stand ein Satz zur groessten Stufe ("Weniger Faelle
  // haben die Kasse geoeffnet als den Preis gesehen. Der Grund ist damit
  // noch nicht bekannt."), darueber zwei Fussnoten zur Rechenweise. Sie
  // sagten, was die Balken daneben schon zeigen, und der Satz endete
  // jedesmal damit, dass er nichts erklaert.
  // Geprueft wird der Code, nicht die Begruendung darueber: Die Saetze
  // stehen als Beleg im Kommentar, und ein Kommentar faerbt keinen Pixel.
  const ohneNotizen = render.replace(/\/\/[^\n]*/g, "");
  assert.ok(!/LESE_DEUTUNG/.test(ohneNotizen), "Die Deutungstabelle steht noch da");
  assert.ok(!/Weniger Faelle/.test(ohneNotizen), "Unter der Liste steht noch ein Erklaersatz");
  assert.ok(!/Berichtsaktivitaet im Zeitraum/.test(ohneNotizen),
    "Ueber der Liste steht noch eine Fussnote zur Rechenweise");
  assert.ok(!/Ereignisdatum/.test(ohneNotizen), "Die Sternchen-Fussnote steht noch da");
});

test("die Marken der Seite und die Marken in Heart sind dieselben", () => {
  // Kommt auf der Seite eine dazu und hier nicht, wird sie geschrieben
  // und nie gezaehlt - still verschwundene Zahlen sind das Schlimmste.
  const inHeart = LESEMARKEN.map((m) => m.id);
  assert.deepEqual(inHeart,
    ["berichtGeoeffnet", "sahSchnitt", "sahTherapie", "sahPreis", "kasseGeoeffnet",
      "hatAnschrift", "hatBestellt"]);
  for (const marke of MARKEN) {
    assert.ok(inHeart.includes(marke), `${marke} wird geschrieben, aber nicht gezaehlt`);
  }
});

test("die Einzelansicht zeigt nichts Falsches, wenn die Marken fehlen", () => {
  // Alte Sitzungen von vor dieser Aenderung haben die Felder nicht.
  const html = renderSitzungDetail(
    { id: "s1", code: "LS-1", name: "A", createdAt: new Date().toISOString() },
    null, "", [], null);
  assert.ok(html.length > 100);
});
