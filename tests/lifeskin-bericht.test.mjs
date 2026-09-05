import test from "node:test";
import assert from "node:assert/strict";

import {
  TRICHTER_STUFEN,
  GESCHAEFTSZONE,
  tagesschluessel,
  heuteSchluessel,
  normalisiere,
  baueTrichter,
  entdopple,
  baueKennzahlen,
  baueHerkunft,
  baueVerteilung
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

// Nicht "vor zwei Stunden", sondern "heute mittag": Sonst faellt der Test
// nachts auf den Vortag und schlaegt nur zwischen null und zwei Uhr fehl -
// genau der Fall, der den Zeitzonenfehler aufgedeckt hat.
const jetztIso = (minutenZurueck = 0) =>
  new Date(Date.now() - minutenZurueck * 60000).toISOString();

function heuteMittagIso() {
  const [jahr, monat, tag] = heuteSchluessel().split("-").map(Number);
  return new Date(Date.UTC(jahr, monat - 1, tag, 11, 0, 0)).toISOString();
}

let laufendeNummer = 0;
function sitzung(felder = {}) {
  laufendeNummer += 1;
  return normalisiere(`s${laufendeNummer}`, {
    createdAt: jetztIso(60),
    updatedAt: jetztIso(60),
    step: "opened",
    device: { os: "android", screen: `360x${700 + laufendeNummer}` },
    source: { utmCampaign: "kampagne-a" },
    ...felder
  });
}

test("der Trichter zaehlt jede erreichte Stufe, nicht nur die letzte", () => {
  // Sonst saehe er aus wie eine Treppe statt wie ein Trichter: Wer bestellt
  // hat, hat auch die Seite geoeffnet.
  const trichter = baueTrichter([
    sitzung({ step: "opened" }),
    sitzung({ step: "result" }),
    sitzung({ step: "ordered", order: { orderId: "LS-1", total: 43 } })
  ]);

  assert.equal(trichter[0].anzahl, 3, "Alle drei haben die Seite geoeffnet");
  assert.equal(trichter.find((s) => s.id === "result").anzahl, 2);
  assert.equal(trichter.find((s) => s.id === "ordered").anzahl, 1);

  // Ein Trichter wird nie breiter.
  for (let i = 1; i < trichter.length; i += 1) {
    assert.ok(trichter[i].anzahl <= trichter[i - 1].anzahl,
      `Stufe ${trichter[i].id} ist breiter als die davor`);
  }
});

test("der Verlust je Schritt zeigt, wo Geld liegen bleibt", () => {
  const trichter = baueTrichter([
    ...Array.from({ length: 10 }, () => sitzung({ step: "offer" })),
    ...Array.from({ length: 2 }, () => sitzung({ step: "ordered", order: { orderId: "x", total: 43 } }))
  ]);
  const anschrift = trichter.find((s) => s.id === "address");
  // 12 sahen die Empfehlung, 2 begannen die Anschrift.
  assert.ok(anschrift.verlust > 0.8,
    `Der teuerste Schritt muss als solcher auffallen, ist ${anschrift.verlust}`);
});

// Diese Erwartung hat sich geaendert, und die alte war falsch.
//
// Vorher galt: gleiches Geraet, gleiches Zeitfenster - eine Sitzung. Ohne
// eingegebenen Namen legte das in einer Werbekampagne verschiedene Menschen
// zusammen, weil fast alle dasselbe Handymodell haben. Nachgerechnet in
// tests/lifeskin-zaehlung.test.mjs: aus 60 Besuchern wurden 14.
//
// Jetzt wird nur zusammengelegt, was einen Namen traegt.
test("nur mit Namen wird zusammengelegt", () => {
  const geraet = { os: "ios", screen: "390x844" };
  const ohneNamen = [
    normalisiere("a", { createdAt: jetztIso(5), step: "opened", device: geraet, source: {} }),
    normalisiere("b", { createdAt: jetztIso(3), step: "result", device: geraet, source: {} })
  ];
  assert.equal(entdopple(ohneNamen).length, 2,
    "Zwei namenlose Besucher sind zwei Menschen, kein Doppeleintrag");

  const mitNamen = [
    normalisiere("a", { createdAt: jetztIso(5), step: "opened", name: "Arta", device: geraet, source: {} }),
    normalisiere("b", { createdAt: jetztIso(3), step: "result", name: "Arta", device: geraet, source: {} }),
    normalisiere("c", { createdAt: jetztIso(90), step: "opened", name: "Arta", device: geraet, source: {} })
  ];
  const sauber = entdopple(mitNamen);
  assert.equal(sauber.length, 2, "Zwei Aufrufe im selben Fenster sind eine Sitzung");
  // Der weiter fortgeschrittene Versuch gewinnt - er ist der echte.
  assert.ok(sauber.some((s) => s.step === "result"),
    "Die weiter fortgeschrittene Sitzung muss ueberleben");
});

test("die Kaufquote misst je abgeschlossener Analyse, nicht je Aufruf", () => {
  // Das ist die Leitzahl. Wer sie auf alle Aufrufe rechnet, bekommt eine
  // andere - und viel kleinere - Zahl und haelt einen guten Trichter fuer
  // schlecht.
  const sitzungen = [
    ...Array.from({ length: 6 }, () => sitzung({ step: "opened" })),
    ...Array.from({ length: 3 }, () => sitzung({ step: "result" })),
    sitzung({ step: "ordered", order: { orderId: "LS-1", total: 43 } })
  ];
  const k = baueKennzahlen(sitzungen);

  // 4 haben den Befund gesehen (3 mit step result + 1 mit ordered), 1 bestellt.
  assert.equal(Math.round(k.kaufQuote * 100), 25);
  assert.equal(Math.round(k.abschlussQuote * 100), 40);
});

test("Abbrecher mit Anschrift kommen erst nach einer halben Stunde auf die Liste", () => {
  const gerade = sitzung({
    step: "address", createdAt: jetztIso(5), updatedAt: jetztIso(5),
    address: { strasse: "Rr. B 12", ort: "Prishtinë" }
  });
  const laenger = sitzung({
    step: "address", createdAt: jetztIso(120), updatedAt: jetztIso(120),
    address: { strasse: "Rr. C 4", ort: "Pejë" }
  });

  const k = baueKennzahlen([gerade, laenger]);
  assert.equal(k.abbrecher.length, 1, "Wer noch tippt, ist kein Abbrecher");
  assert.equal(k.abbrecher[0].address.ort, "Pejë");
});

test("wer bestellt hat, ist kein Abbrecher und kein Nachfasskontakt", () => {
  const kunde = sitzung({
    step: "ordered", createdAt: heuteMittagIso(), updatedAt: jetztIso(120),
    address: { strasse: "Rr. D 1", ort: "Tiranë" },
    phone: "+383 44 111 222",
    order: { orderId: "LS-9", total: 43 }
  });
  const k = baueKennzahlen([kunde]);
  assert.equal(k.abbrecher.length, 0);
  assert.equal(k.kontakte.length, 0, "Ein Kunde gehoert nicht auf die Nachfassliste");
  assert.equal(k.umsatzHeute, 43);
});

test("die Herkunft sagt, welche Anzeige verkauft - nicht welche Klicks bringt", () => {
  const sitzungen = [
    // Viele Klicks, kein Verkauf.
    ...Array.from({ length: 20 }, () => sitzung({ step: "result", source: { utmCampaign: "billig" } })),
    // Wenige Klicks, zwei Verkaeufe.
    ...Array.from({ length: 4 }, () => sitzung({ step: "result", source: { utmCampaign: "gut" } })),
    sitzung({ step: "ordered", source: { utmCampaign: "gut" }, order: { orderId: "1", total: 43 } }),
    sitzung({ step: "ordered", source: { utmCampaign: "gut" }, order: { orderId: "2", total: 43 } })
  ];
  const herkunft = baueHerkunft(sitzungen);
  const gut = herkunft.find((h) => h.kampagne === "gut");
  const billig = herkunft.find((h) => h.kampagne === "billig");

  assert.equal(billig.sitzungen, 20);
  assert.equal(billig.bestellt, 0);
  assert.ok(gut.kaufQuote > billig.kaufQuote,
    "Die Anzeige mit weniger Klicks und mehr Verkaeufen muss besser dastehen");
  assert.equal(herkunft[0].kampagne, "gut", "Sortiert wird nach Umsatz, nicht nach Klicks");
});

test("die Verteilung zaehlt nur Befunde, die auch auffaellig waren", () => {
  const sitzungen = [
    sitzung({ step: "result", skinType: "mischhaut", ageBand: "25-34",
      findings: [{ id: "glanz", stufe: 2 }, { id: "roetung", stufe: 0 }] }),
    sitzung({ step: "result", skinType: "mischhaut", ageBand: "35-44",
      findings: [{ id: "glanz", stufe: 1 }] })
  ];
  const v = baueVerteilung(sitzungen);
  assert.equal(v.hauttypen[0].id, "mischhaut");
  assert.equal(v.hauttypen[0].anzahl, 2);
  assert.equal(v.befunde.find((b) => b.id === "glanz").anzahl, 2);
  assert.equal(v.befunde.find((b) => b.id === "roetung"), undefined,
    "Ein Befund der Stufe null ist kein Befund");
});

test("die Stufen des Berichts sind die des Trichters", () => {
  // Kommt im Trichter ein Schritt dazu und hier nicht, zeigt der Bericht
  // eine Stufe zu wenig, ohne dass etwas kaputtgeht - genau darum diese
  // Klammer.
  //
  // Die Stufen mit einem Feld kommen nicht aus dem Schritt, sondern von der
  // Befundseite: Sie schreibt keinen Schritt, weil ein spaeter Besuch
  // derselben Seite den Fall sonst in einen anderen Zustand schoebe.
  const ausTrichter = ["opened", "named", "camera", "captured", "result"];
  const ausBefundseite = ["berichtGeoeffnet", "waClick", "waSent"];
  const ausKauf = ["offer", "address", "ordered"];
  assert.deepEqual(TRICHTER_STUFEN.map((s) => s.id),
    [...ausTrichter, ...ausBefundseite, ...ausKauf]);
  // Genau die Stufen der Befundseite haengen an einem Feld, keine andere.
  assert.deepEqual(TRICHTER_STUFEN.filter((s) => s.feld).map((s) => s.id), ausBefundseite);
  for (const stufe of TRICHTER_STUFEN.filter((s) => s.feld)) {
    assert.equal(stufe.feld, stufe.id, `${stufe.id}: Feld und Kennung muessen dasselbe sein`);
  }
});

// Der Weg NACH dem Scan zaehlt genauso mit wie der davor.
//
// Ohne ihn endete der Trichter bei "Scan abgeschlossen", und die
// wichtigste Frage waere offen: Wer nach dem Scan nie auf seiner Seite
// ankommt, ist auf dem Weg dorthin verloren gegangen - und dann liegt es
// nicht am Befund, sondern an der Uebergabe.
test("die Befundseite zaehlt im Trichter mit", () => {
  const trichter = Object.fromEntries(baueTrichter([
    // Kam nicht ueber den Scan hinaus.
    normalisiere("a", { createdAt: "2026-09-05T08:00:00Z", step: "result" }),
    // Hat seine Seite geoeffnet, aber nicht geschrieben.
    normalisiere("b", { createdAt: "2026-09-05T08:00:00Z", step: "result", berichtGeoeffnet: true }),
    // Hat getippt und bestaetigt.
    normalisiere("c", {
      createdAt: "2026-09-05T08:00:00Z", step: "result",
      berichtGeoeffnet: true, waClick: true, waSent: true
    })
  ]).map((s) => [s.id, s.anzahl]));

  assert.equal(trichter.result, 3);
  assert.equal(trichter.berichtGeoeffnet, 2);
  assert.equal(trichter.waClick, 1);
  assert.equal(trichter.waSent, 1);
});

// Wer bestaetigt hat, hat auch angetippt - auch wenn nur das eine Feld da
// steht. Sonst saehe der Trichter aus wie eine Treppe statt wie ein
// Trichter, und die Verlustzahl waere negativ.
test("eine spaetere Stufe der Befundseite zieht die frueheren mit", () => {
  const trichter = Object.fromEntries(baueTrichter([
    normalisiere("a", { createdAt: "2026-09-05T08:00:00Z", step: "result", waSent: true })
  ]).map((s) => [s.id, s.anzahl]));
  assert.equal(trichter.berichtGeoeffnet, 1);
  assert.equal(trichter.waClick, 1);
  assert.equal(trichter.waSent, 1);
});


test("der Tag ist der Geschaeftstag, nicht der UTC-Tag", () => {
  // Kosovo und Albanien liegen vor UTC. Eine Bestellung um 00:30 Ortszeit
  // stuende sonst im Bericht des Vortages, und "Umsatz heute" waere null,
  // waehrend das Geld schon da ist.
  assert.equal(GESCHAEFTSZONE, "Europe/Belgrade");

  // 23:30 UTC ist in Prishtina bereits der naechste Tag.
  const spaet = "2026-03-14T23:30:00.000Z";
  assert.equal(tagesschluessel(spaet), "2026-03-15",
    "Nach Mitternacht Ortszeit muss der Folgetag gezaehlt werden");

  // Und mittags stimmen beide ueberein.
  assert.equal(tagesschluessel("2026-03-14T12:00:00.000Z"), "2026-03-14");

  assert.equal(tagesschluessel("keine zeit"), "", "Unlesbares ergibt keinen Tag");
});

