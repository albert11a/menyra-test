import test from "node:test";
import assert from "node:assert/strict";

import {
  normalisiere, entdopple, baueTrichter, baueKennzahlen,
  baueHerkunft, baueVerteilung, baueTagesverlauf, heuteSchluessel
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

// Ein ganzer Werbetag, von Hand durchgerechnet.
//
// Die Einzeltests pruefen jede Funktion fuer sich. Diese Datei prueft, ob
// sie zusammen dasselbe sagen wie ein Blatt Papier - denn im Bericht stehen
// sie nebeneinander, und ein Widerspruch zwischen zwei Kacheln ist genau
// das, was auffaellt und Vertrauen kostet.

const HEUTE = heuteSchluessel();

// 40 Besucher aus zwei Anzeigen. Vorgegeben, nicht gerechnet:
//
//   20 aus "anzeige-a": 20 geoeffnet, 14 Name, 12 Kamera, 10 Foto,
//                       10 Scan fertig, 8 Empfehlung, 3 Anschrift, 2 bestellt
//   20 aus "anzeige-b": 20 geoeffnet, 10 Name,  6 Kamera,  4 Foto,
//                        4 Scan fertig,  2 Empfehlung, 1 Anschrift, 0 bestellt
//
// Dazu der Weg NACH dem Scan, der nicht im Schritt steht, sondern in eigenen
// Feldern: Wer weitergekommen ist als "Scan fertig", war zwangslaeufig auf
// seiner Befundseite und hat geschrieben. Von den vieren, die bei "Scan
// fertig" stehen bleiben, haben drei ihre Seite geoeffnet und einer davon
// WhatsApp angetippt, ohne das Senden zu bestaetigen.
const PLAN = [
  { kampagne: "anzeige-a", stufen: { opened: 6, named: 2, camera: 2, captured: 0, result: 2, offer: 5, address: 1, ordered: 2 } },
  { kampagne: "anzeige-b", stufen: { opened: 10, named: 4, camera: 2, captured: 0, result: 2, offer: 1, address: 1, ordered: 0 } }
];

function tagBauen() {
  // NICHT "jetzt minus n Sekunden".
  //
  // Die vierzig Sitzungen liegen vierzig Sekunden auseinander, also gut
  // sechsundzwanzig Minuten insgesamt. Faellt der Lauf in die erste halbe
  // Stunde nach Mitternacht in Belgrad, rutscht der aeltere Teil auf
  // gestern - und "Analysen heute" sind auf einmal zehn statt vierzehn.
  // Der Test schlug damit jede Nacht eine halbe Stunde lang fehl, ohne
  // dass an der Rechnung etwas falsch war.
  //
  // Also verankert auf Mittag des Geschaeftstages: derselbe Tag, egal
  // wann der Lauf startet.
  const [jahr, monat, tag] = HEUTE.split("-").map(Number);
  const jetzt = Date.UTC(jahr, monat - 1, tag, 10);
  const roh = [];
  let n = 0;
  for (const { kampagne, stufen } of PLAN) {
    for (const [step, anzahl] of Object.entries(stufen)) {
      for (let i = 0; i < anzahl; i += 1) {
        n += 1;
        const bestellt = step === "ordered";
        // Wer ueber den Scan hinaus ist, war auf seiner Befundseite.
        const weiter = ["offer", "address", "ordered"].includes(step);
        // Und die, die dort stehen bleiben: der erste jeder Anzeige tippt
        // WhatsApp an, der zweite oeffnet nur, weiter kommt keiner.
        const stehtBeimScan = step === "result";
        roh.push(normalisiere(`s${n}`, {
          berichtGeoeffnet: weiter || (stehtBeimScan && i < (kampagne === "anzeige-a" ? 2 : 1)),
          waClick: weiter || (stehtBeimScan && kampagne === "anzeige-a" && i === 0),
          waSent: weiter,
          createdAt: new Date(jetzt - n * 40000).toISOString(),
          updatedAt: new Date(jetzt - n * 40000).toISOString(),
          step,
          // Namenlos ab "opened", benannt ab "named" - wie im echten Ablauf.
          name: step === "opened" ? "" : `Person${n}`,
          device: { os: n % 3 ? "ios" : "android", screen: n % 3 ? "390x844" : "412x915" },
          source: { utmCampaign: kampagne },
          skinType: ["captured", "result", "offer", "address", "ordered"].includes(step) ? "mischhaut" : "",
          findings: step === "opened" ? [] : [{ id: "roetung", stufe: 2 }],
          address: ["address", "ordered"].includes(step) ? { ort: "Prishtine" } : null,
          order: bestellt ? { orderId: `LS-${n}`, total: 53 } : null
        }));
      }
    }
  }
  return roh;
}

const roh = tagBauen();
const sitzungen = entdopple(roh);

test("die Entdopplung fasst nichts zusammen, was nicht zusammengehoert", () => {
  assert.equal(roh.length, 40);
  assert.equal(sitzungen.length, 40, "Vierzig Besucher muessen vierzig bleiben");
});

test("der Trichter stimmt Stufe fuer Stufe mit der Handrechnung", () => {
  const t = Object.fromEntries(baueTrichter(sitzungen).map((s) => [s.id, s.anzahl]));
  // Nachgerechnet: 40 Besucher, davon bleiben 16 bei "geoeffnet" stehen,
  // 6 bei "Name", 4 bei "Kamera", 4 bei "Befund", 6 bei "Empfehlung",
  // 2 bei "Anschrift"; 2 bestellen.
  assert.deepEqual(t, {
    opened: 40, named: 24, camera: 18, captured: 14, result: 14,
    // Der Weg nach dem Scan: 10 Weitergekommene plus 3 von den vieren, die
    // stehen bleiben; davon tippt einer WhatsApp an.
    berichtGeoeffnet: 13, waClick: 11, waSent: 10,
    offer: 10, address: 4, ordered: 2
  });
});

test("der Verlust je Schritt ist der Anteil, der dort abspringt", () => {
  const t = Object.fromEntries(baueTrichter(sitzungen).map((s) => [s.id, s.verlust]));
  // Von 40 auf 24 sind 16 verloren, das sind 40 Prozent.
  assert.equal(Number(t.named.toFixed(4)), 0.4);
  // Von 14 auf 13 ist einer von 14 - das ist der Verlust zwischen dem
  // fertigen Scan und der Befundseite. Diese eine Zahl entscheidet, ob die
  // Uebergabe traegt.
  assert.equal(Number(t.berichtGeoeffnet.toFixed(4)), Number((1 / 14).toFixed(4)));
  // Und von 10 auf 10 ist nichts: Wer geschrieben hat, kommt auch zur
  // Empfehlung.
  assert.equal(t.offer, 0);
  assert.equal(t.opened, 0, "Die erste Stufe kann nichts verlieren");
});

test("die Kacheln stimmen mit der Handrechnung", () => {
  const k = baueKennzahlen(sitzungen);
  // Analyse heisst: Foto aufgenommen oder weiter. Das sind 14.
  assert.equal(k.analysenHeute, 14);
  assert.equal(k.analysenWoche, 14);
  // Abschluss heisst: Befund gesehen oder weiter. 14 von 40.
  assert.equal(k.quotenBasis, 40);
  assert.equal(Number(k.abschlussQuote.toFixed(4)), 0.35);
  // Kauf heisst: bestellt je Befund. 2 von 14.
  assert.equal(Number(k.kaufQuote.toFixed(4)), Number((2 / 14).toFixed(4)));
  assert.equal(k.umsatzHeute, 106);
  assert.equal(k.bestellungenHeute, 2);
  assert.equal(k.ohneDatum, 0);
});

test("Trichter und Kacheln widersprechen sich nicht", () => {
  const t = Object.fromEntries(baueTrichter(sitzungen).map((s) => [s.id, s.anzahl]));
  const k = baueKennzahlen(sitzungen);
  // Dieselbe Groesse darf nicht zweimal verschieden dastehen - genau dieser
  // Widerspruch hat den fehlenden Anlegezeitpunkt verraten.
  assert.equal(k.analysenHeute, t.captured, "Analysen heute muss der Stufe 'Foto aufgenommen' entsprechen");
  assert.equal(k.bestellungenHeute, t.ordered);
  assert.equal(k.quotenBasis, t.opened);
});

// Eigene Aufstellung mit aelteren Zeiten: Wer vor weniger als einer halben
// Stunde zuletzt getippt hat, gilt nicht als Abbrecher - er koennte noch
// dabei sein. In der Aufstellung oben sind alle Zeiten frisch, dort ist die
// Liste also richtigerweise leer.
test("die Abbrecherliste enthaelt nur, wer wirklich haengengeblieben ist", () => {
  assert.equal(baueKennzahlen(sitzungen).abbrecher.length, 0,
    "Wer gerade erst getippt hat, ist noch kein Abbrecher");

  const lange = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const alt = [
    normalisiere("x1", { createdAt: lange, updatedAt: lange, step: "address", name: "X1", address: { ort: "Prishtine" } }),
    normalisiere("x2", { createdAt: lange, updatedAt: lange, step: "address", name: "X2", address: { ort: "Gjakove" } }),
    normalisiere("x3", { createdAt: lange, updatedAt: lange, step: "ordered", name: "X3", address: { ort: "Peje" }, order: { orderId: "LS-9", total: 53 } })
  ];
  const k = baueKennzahlen(alt);
  assert.equal(k.abbrecher.length, 2, "Wer bestellt hat, ist kein Abbrecher");
  assert.equal(k.offenerBetrag, 106);
  for (const s of k.abbrecher) assert.ok(s.hatAnschrift && !s.hatBestellt);
});

test("die Herkunft trennt die beiden Anzeigen sauber", () => {
  const h = baueHerkunft(sitzungen);
  const a = h.find((e) => e.kampagne === "anzeige-a");
  const b = h.find((e) => e.kampagne === "anzeige-b");
  assert.equal(a.sitzungen + b.sitzungen, 40);
  assert.equal(a.bestellt, 2);
  assert.equal(b.bestellt, 0);
  assert.equal(a.umsatz, 106);
  // Genau diese Zahl entscheidet ueber das Budget: Anzeige A verkauft,
  // Anzeige B bringt nur Klicks.
  assert.ok(a.kaufQuote > b.kaufQuote);
});

test("die Verteilung zaehlt nur auffaellige Befunde", () => {
  const v = baueVerteilung(sitzungen);
  const roetung = v.befunde.find((b) => b.id === "roetung");
  // Alle ausser den 16 namenlosen "opened" haben einen Befund der Stufe 2.
  assert.equal(roetung.anzahl, 24);
  assert.equal(v.hauttypen.find((h) => h.id === "mischhaut").anzahl, 14);
});

test("der Tagesverlauf legt alles auf heute", () => {
  const heute = baueTagesverlauf(sitzungen).find((t) => t.tag === HEUTE);
  assert.equal(heute.analysen, 14);
  assert.equal(heute.bestellungen, 2);
  assert.equal(heute.umsatz, 106);
});

test("die Summe ueber alle Tage ist die Summe ueber alle Sitzungen", () => {
  const verlauf = baueTagesverlauf(sitzungen);
  const summe = verlauf.reduce((s, t) => s + t.umsatz, 0);
  assert.equal(summe, baueKennzahlen(sitzungen).umsatzWoche);
});
