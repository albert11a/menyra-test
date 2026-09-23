import test from "node:test";
import assert from "node:assert/strict";

import {
  normalisiere, entdopple, baueTrichter, baueLesetiefe, baueKennzahlen,
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
          // DIE WARTESEITE SIEHT JEDER, DER DEN SCAN ZU ENDE BRINGT - sie
          // kommt unmittelbar nach der Uebergabe. Frueher hiess diese
          // Marke berichtGeoeffnet und fiel genau hier; sie zaehlte damit
          // jeden Ankommenden als jemanden, der seinen Befund gelesen hat.
          warteseiteGeoeffnet: weiter || stehtBeimScan,
          // Und der Befund erst, wenn er freigegeben und geoeffnet ist.
          berichtGeoeffnet: weiter || (stehtBeimScan && i < (kampagne === "anzeige-a" ? 2 : 1)),
          // Einer der beim Scan Stehengebliebenen hinterlaesst seine
          // Nummer, ohne je auf WhatsApp zu schreiben - sonst pruefte
          // kontaktwege() nie den Fall, fuer den es gebaut wurde.
          phone: stehtBeimScan && kampagne === "anzeige-b" && i === 0 ? "+38344123456" : "",
          // Wie weit im Bericht gelesen wurde. Einer der beim Scan
          // Stehengebliebenen liest ihn ganz, kauft aber nicht - und zwei
          // der Weitergekommenen sehen die Therapie, aber nie den Preis.
          // Ohne solche Unterschiede pruefte der Trichter nur, dass vier
          // gleiche Zahlen gleich sind.
          sahSchnitt: weiter || (stehtBeimScan && kampagne === "anzeige-a" && i === 0),
          sahTherapie: weiter,
          sahPreis: weiter && !(step === "offer" && i === 0),
          kasseGeoeffnet: ["address", "ordered"].includes(step),
          waClick: weiter || (stehtBeimScan && kampagne === "anzeige-a" && i === 0),
          waSent: weiter,
          createdAt: new Date(jetzt - n * 40000).toISOString(),
          // GEMESSEN, NICHT GESCHAETZT: "updatedAt" hing am selben Anker
          // wie "createdAt", also an Mittag. Ab halb eins am Nachmittag
          // waren alle vierzig Sitzungen aelter als eine halbe Stunde -
          // und damit Abbrecher. Der Test schlug jeden Tag ab 12:30 fehl.
          //
          // "updatedAt" entscheidet NUR darueber, wer haengengeblieben
          // ist (30 Minuten ohne Tippen); die Tageszahlen haengen alle an
          // "createdAt". Also gehoert es an die Uhr, nicht an den Anker.
          updatedAt: new Date(Date.now() - n * 1000).toISOString(),
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
  // 2 bei "Anschrift"; 2 bestellen. 24 kommen also ueber die Landingpage
  // hinaus und sehen die Wahl.
  assert.deepEqual(t, {
    // Keine dieser vierzig Sitzungen traegt das Sichtbarkeitsmerkmal -
    // genau wie jede Sitzung aus der Zeit davor. Fehlt es, gilt "gesehen";
    // als "nicht gesehen" gelesen fiele der Trichter der Vergangenheit hier
    // auf null, und das waere eine erfundene Zahl.
    //
    // Und die Ladung ("opened") steht nicht mehr als Stufe darueber: Sie
    // wird geschrieben, sobald die Seite geladen ist, nicht wenn jemand
    // hinsieht - im Nenner stuenden Seitenaufrufe, im Zaehler Menschen.
    gesehen: 40,
    // Die Wahl zwischen Scan und ohne Scan - der eine Bildschirm
    // zwischen der Seite und allem danach, und der einzige, den auf
    // BEIDEN Wegen jeder sieht. Der Scan selbst steht nicht im Trichter:
    // Er ist nur noch einer von zwei Wegen, und ein kumulativer Trichter
    // wuerde den anderen mitzaehlen (siehe baueWege).
    wahl: 24,
    // Name und Alter, ein Bildschirm nach dem Scan.
    emri: 14,
    // Alle 14, die den Scan abschliessen, landen auf der Warteseite ...
    warteseiteGeoeffnet: 14,
    // ... und 12 davon werden dort erreichbar: 11 ueber WhatsApp, einer
    // ueber die Nummer, die er statt dessen hinterlaesst. Genau dafuer
    // steht die Stufe - zwei Wege, ein Ziel.
    erreichbar: 12,
    // Von ihnen schreiben 11 auf WhatsApp. Hier endet der Trichter: Was
    // danach kommt, faengt erst an, wenn Dr. Gashi freigegeben hat, und
    // steht in der Lesetiefe.
    whatsapp: 11
  });
});

test("die Lesetiefe zaehlt jede Marke fuer sich, nicht kumulativ", () => {
  // Genau darum steht sie nicht im Trichter: Der rechnet "am weitesten
  // gekommen" und wuerde jeden, der auf der Warteseite WhatsApp antippt,
  // als jemanden zaehlen, der den Preis gesehen hat.
  const l = Object.fromEntries(baueLesetiefe(sitzungen).map((m) => [m.id, m.anzahl]));
  assert.equal(l.berichtGeoeffnet, 13, "Grundmenge sind die, die die Seite geoeffnet haben");
  assert.equal(l.sahSchnitt, 11, "Zehn Weitergekommene und einer, der den Bericht ganz liest");
  assert.equal(l.sahTherapie, 10);
  assert.equal(l.sahPreis, 8, "Zwei sehen die Therapie, aber nie den Preis");
  assert.equal(l.kasseGeoeffnet, 4, "Nur wer die Anschrift begonnen hat");
  assert.equal(l.hatBestellt, 2);

  // Und der Verlust ist der Anteil, der an genau dieser Stelle aufhoert.
  const v = Object.fromEntries(baueLesetiefe(sitzungen).map((m) => [m.id, m.verlust]));
  assert.equal(Number(v.sahPreis.toFixed(4)), 0.2, "Von 10 auf 8 sind zwei von zehn");
  assert.equal(v.berichtGeoeffnet, 0, "Die erste Marke kann nichts verlieren");
});

test("der Verlust je Schritt ist der Anteil, der dort abspringt", () => {
  const t = Object.fromEntries(baueTrichter(sitzungen).map((s) => [s.id, s.verlust]));
  // Von 40 auf 24 sind 16 verloren - der teuerste Schritt des ganzen
  // Trichters und der erste, den es ueberhaupt gibt.
  assert.equal(Number(t.wahl.toFixed(4)), Number((16 / 40).toFixed(4)));
  // Von 14 auf 14: Wer den Scan abschliesst, landet auf der Warteseite -
  // dazwischen liegt nichts, was jemanden kosten koennte.
  assert.equal(t.warteseiteGeoeffnet, 0);
  // Von 14 auf 12 sind zwei von vierzehn: So viele hinterlassen auf der
  // Warteseite WEDER eine Nummer NOCH schreiben sie auf WhatsApp - und
  // genau die bekommen ihren Befund nie zu sehen. Das ist die Zahl, um
  // die es auf diesem Bildschirm geht.
  assert.equal(Number(t.erreichbar.toFixed(4)), Number((2 / 14).toFixed(4)));
  // Und von 12 auf 11 ist einer: der, der statt WhatsApp seine Nummer
  // hinterlassen hat. Kein Verlust - ein anderer Weg zum selben Ziel.
  assert.equal(Number(t.whatsapp.toFixed(4)), Number((1 / 12).toFixed(4)));
  assert.equal(t.gesehen, 0, "Die erste Stufe kann nichts verlieren");
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
  // Eine Analyse ist eine, wenn er auf der Warteseite steht: Dort ist der
  // Fall vollstaendig - Aufnahmen, Anliegen, Name und Nummer. Alles davor
  // ist ein angefangener Scan, den niemand befunden kann.
  assert.equal(k.analysenHeute, t.warteseiteGeoeffnet,
    "Analysen heute muss der Stufe 'Pritja' entsprechen");
  // Die Quotenbasis sind alle Sitzungen der Woche - die Ladungen also,
  // nicht die gesehenen Seiten. Seit der Trichter bei "Landingpage"
  // anfaengt, stehen die Ladungen in keiner Stufe mehr; verglichen wird
  // deshalb mit der Zahl der Sitzungen selbst.
  assert.equal(k.quotenBasis, sitzungen.length);
  assert.ok(k.quotenBasis >= t.gesehen,
    "Es koennen nicht mehr Seiten gesehen als geladen worden sein");
  // Die Bestellungen stehen nicht mehr im Trichter - er endet bei der
  // Warteseite. Sie kommen aus den Kacheln und der Lesetiefe.
  assert.equal(k.bestellungenHeute, 2);
});

// Eigene Aufstellung mit aelteren Zeiten: Wer vor weniger als einer halben
// Stunde zuletzt getippt hat, gilt nicht als Abbrecher - er koennte noch
// dabei sein. In der Aufstellung oben sind alle Zeiten frisch, dort ist die
// Liste also richtigerweise leer.
test("die Abbrecherliste enthaelt nur, wer wirklich haengengeblieben ist", () => {
  assert.equal(baueKennzahlen(sitzungen).abbrecher.length, 0,
    "Wer gerade erst getippt hat, ist noch kein Abbrecher");

  const lange = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const kasse = { berichtGeoeffnet: true, kasseGeoeffnet: true, kasseGeoeffnetAt: lange };
  const alt = [
    normalisiere("x1", { createdAt: lange, updatedAt: lange, step: "address", name: "X1", ...kasse, address: { ort: "Prishtine" } }),
    normalisiere("x2", { createdAt: lange, updatedAt: lange, step: "address", name: "X2", ...kasse, address: { ort: "Gjakove" } }),
    normalisiere("x3", { createdAt: lange, updatedAt: lange, step: "ordered", name: "X3", ...kasse, address: { ort: "Peje" }, order: { orderId: "LS-9", total: 53 } })
  ];
  const k = baueKennzahlen(alt);
  assert.equal(k.abbrecher.length, 2, "Wer bestellt hat, ist kein Abbrecher");
  assert.equal(k.offenerBetrag, 78);
  for (const s of k.abbrecher) assert.ok(s.kasseGeoeffnet && !s.hatBestellt);
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
