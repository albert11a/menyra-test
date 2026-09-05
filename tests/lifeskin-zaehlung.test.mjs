import test from "node:test";
import assert from "node:assert/strict";

import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";
import {
  entdopple, baueTrichter, baueKennzahlen, baueTagesverlauf,
  heuteSchluessel, tagesschluessel, normalisiere, SET_PREIS, GESCHAEFTSZONE
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { STANDARD_KONFIG } from "../apps/lifeskin/lifeskin-catalog.js";

// Diese Datei prueft die Zahlen, nach denen ueber Werbebudget entschieden
// wird. Eine falsche Zahl hier ist teurer als ein Absturz: Ein Absturz faellt
// auf, eine falsche Quote nicht.

function speicherAttrappe() {
  const inhalt = new Map();
  return {
    getItem: (k) => (inhalt.has(k) ? inhalt.get(k) : null),
    setItem: (k, v) => inhalt.set(k, String(v))
  };
}

// ---------- Ein Besuch ist ein Besuch ----------

test("ein Neuladen schreibt in dieselbe Sitzung, nicht in eine zweite", async () => {
  const speicher = speicherAttrappe();
  const erste = new Sitzung({ fetchFn: async () => ({ ok: true }), speicher });
  await erste.starte({ sprache: "sq" });
  await erste.schritt("named", { name: "Arta" });
  await erste.schritt("camera");

  const nachNeuladen = new Sitzung({ fetchFn: async () => ({ ok: true }), speicher });
  assert.equal(nachNeuladen.id, erste.id, "Das Neuladen hat eine zweite Sitzung angelegt");
  assert.equal(nachNeuladen.fortgesetzt, true);
});

test("der fortgesetzte Besuch faellt im Trichter nicht zurueck", async () => {
  const speicher = speicherAttrappe();
  const geschrieben = [];
  const fetchFn = async (url, optionen) => { geschrieben.push(JSON.parse(optionen.body).fields); return { ok: true }; };

  const erste = new Sitzung({ fetchFn, speicher });
  await erste.starte({ sprache: "sq" });
  await erste.schritt("captured", { metrics: {} });

  geschrieben.length = 0;
  const zweite = new Sitzung({ fetchFn, speicher });
  await zweite.starte({ sprache: "sq" });

  // Kein Schritt zurueck auf "opened" und kein neuer Anlegezeitpunkt - der
  // waere von den Regeln abgewiesen worden und haette den ganzen
  // Schreibvorgang mitgenommen.
  for (const felder of geschrieben) {
    assert.ok(!("step" in felder), "Ein Neuladen hat den Schritt zurueckgesetzt");
    assert.ok(!("createdAt" in felder), "Ein Neuladen hat den Anlegezeitpunkt ueberschrieben");
  }
  assert.equal(zweite.stand.step, "captured");
});

test("ohne Speicher laeuft alles weiter, nur ohne Fortsetzung", async () => {
  const sitzung = new Sitzung({ fetchFn: async () => ({ ok: true }), speicher: null });
  await assert.doesNotReject(() => sitzung.starte({ sprache: "sq" }));
  assert.equal(sitzung.fortgesetzt, false);
});

// ---------- Entdopplung darf keine Menschen verschmelzen ----------

test("60 Besucher aus einer Anzeige bleiben 60", () => {
  const jetzt = Date.now();
  const roh = [];
  for (let i = 0; i < 60; i += 1) {
    const iphone = i % 3 !== 0;
    roh.push(normalisiere(`s${i}`, {
      createdAt: new Date(jetzt - i * 25000).toISOString(),
      step: "opened",
      // Niemand hat einen Namen eingegeben - der Normalfall am Anfang.
      name: "",
      device: { os: iphone ? "ios" : "android", screen: iphone ? "390x844" : "412x915" },
      source: { utmCampaign: "test-kampagne" }
    }));
  }
  // Die erste Fassung machte aus diesen 60 genau 14: gleiches Handy, gleiche
  // Kampagne, kein Name - und damit fuer die Zusammenfassung derselbe Mensch.
  assert.equal(entdopple(roh).length, 60);
  assert.equal(baueTrichter(entdopple(roh))[0].anzahl, 60);
});

test("zwei Eintraege desselben Menschen werden weiterhin zu einem", () => {
  const jetzt = Date.now();
  const geraet = { os: "ios", screen: "390x844" };
  const roh = [
    normalisiere("a", { createdAt: new Date(jetzt).toISOString(), step: "named", name: "Arta", device: geraet }),
    normalisiere("b", { createdAt: new Date(jetzt + 60000).toISOString(), step: "ordered", name: "Arta", device: geraet })
  ];
  const nach = entdopple(roh);
  assert.equal(nach.length, 1);
  // Der weiter fortgeschrittene Eintrag gewinnt - er ist der echte Versuch.
  assert.equal(nach[0].step, "ordered");
});

test("derselbe Name Stunden spaeter ist ein neuer Besuch", () => {
  const jetzt = Date.now();
  const geraet = { os: "ios", screen: "390x844" };
  const roh = [
    normalisiere("a", { createdAt: new Date(jetzt).toISOString(), step: "named", name: "Arta", device: geraet }),
    normalisiere("b", { createdAt: new Date(jetzt + 4 * 3600 * 1000).toISOString(), step: "named", name: "Arta", device: geraet })
  ];
  assert.equal(entdopple(roh).length, 2);
});

// ---------- Der Tag ----------

test("der Geschaeftstag ist Belgrad, nicht UTC", () => {
  // 00:30 Uhr Ortszeit in Belgrad ist am Vortag noch 22:30 UTC. Wer die
  // ISO-Zeichenkette abschneidet, bucht diese Bestellung auf gestern.
  assert.equal(GESCHAEFTSZONE, "Europe/Belgrade");
  assert.equal(tagesschluessel("2026-03-14T23:30:00.000Z"), "2026-03-15");
});

test("ein Tag zurueck ist ein Kalendertag, auch bei der Zeitumstellung", () => {
  const heute = heuteSchluessel();
  const gestern = heuteSchluessel(1);
  assert.match(gestern, /^\d{4}-\d{2}-\d{2}$/);
  assert.notEqual(gestern, heute);

  // Sieben aufeinanderfolgende Tage muessen sieben verschiedene sein - mit
  // festem Millisekundenabzug faellt an den Umstellungstagen einer aus.
  const tage = new Set();
  for (let i = 0; i < 7; i += 1) tage.add(heuteSchluessel(i));
  assert.equal(tage.size, 7);

  // Und sie muessen lueckenlos absteigen.
  const sortiert = [...tage].sort().reverse();
  for (let i = 1; i < sortiert.length; i += 1) {
    const a = Date.parse(`${sortiert[i - 1]}T12:00:00Z`);
    const b = Date.parse(`${sortiert[i]}T12:00:00Z`);
    assert.equal(a - b, 86400000, `${sortiert[i]} -> ${sortiert[i - 1]} ist kein ganzer Tag`);
  }
});

test("sieben Tage sind sieben Tage, nicht acht", () => {
  const jetzt = Date.now();
  const roh = [];
  // Je eine abgeschlossene Analyse an zehn aufeinanderfolgenden Tagen.
  for (let i = 0; i < 10; i += 1) {
    roh.push(normalisiere(`t${i}`, {
      createdAt: new Date(jetzt - i * 86400000).toISOString(),
      step: "result", name: `P${i}`
    }));
  }
  assert.equal(baueKennzahlen(roh).analysenWoche, 7);
});

// ---------- Die Betraege ----------

test("der offene Betrag rechnet mit dem echten Setpreis", () => {
  const alt = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const roh = [normalisiere("a", {
    createdAt: alt, updatedAt: alt, step: "address", name: "Arta",
    address: { strasse: "Rr. 5", ort: "Prishtine" }
  })];
  const k = baueKennzahlen(roh);
  assert.equal(k.abbrecher.length, 1);
  // Stand als 43 fest im Code, waehrend das Set 53 kostet.
  assert.equal(k.offenerBetrag, 53);
  assert.equal(SET_PREIS, STANDARD_KONFIG.setPreis,
    "Der Bericht rechnet mit einem anderen Preis als der Trichter verlangt");
});

test("ein anderer Setpreis schlaegt durch", () => {
  const alt = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const roh = [normalisiere("a", {
    createdAt: alt, updatedAt: alt, step: "address", name: "A",
    address: { ort: "Prishtine" }
  })];
  assert.equal(baueKennzahlen(roh, { setPreis: 60 }).offenerBetrag, 60);
});

// ---------- Die Quoten ----------

test("die Quoten gelten fuer dieselben sieben Tage wie die Kacheln", () => {
  const jetzt = Date.now();
  const roh = [
    // Diese Woche: zwei Befunde, einer bestellt.
    normalisiere("a", { createdAt: new Date(jetzt).toISOString(), step: "ordered", name: "A", order: { orderId: "1", total: 53 } }),
    normalisiere("b", { createdAt: new Date(jetzt - 86400000).toISOString(), step: "result", name: "B" }),
    // Vor einem Monat: zwanzig, die nie zum Befund kamen.
    ...Array.from({ length: 20 }, (_, i) => normalisiere(`alt${i}`, {
      createdAt: new Date(jetzt - 30 * 86400000).toISOString(), step: "opened", name: `Alt${i}`
    }))
  ];
  const k = baueKennzahlen(roh);
  // Ueber die gesamte Zeit gerechnet stuende die Abschlussquote bei 2 von 22.
  assert.equal(k.quotenBasis, 2);
  assert.equal(k.abschlussQuote, 1);
  assert.equal(k.kaufQuote, 0.5);
});

test("ohne Sitzungen sind die Quoten null und nicht NaN", () => {
  const k = baueKennzahlen([]);
  for (const feld of ["abschlussQuote", "kaufQuote", "umsatzHeute", "offenerBetrag", "quotenBasis"]) {
    assert.equal(Number.isFinite(k[feld]), true, `${feld} ist keine Zahl`);
  }
});

// ---------- Der Trichter ----------

test("wer weiter kam, zaehlt in allen Stufen davor mit", () => {
  const roh = [normalisiere("a", { createdAt: new Date().toISOString(), step: "ordered", name: "A" })];
  const t = baueTrichter(roh);
  for (const stufe of t) assert.equal(stufe.anzahl, 1, `${stufe.id} fehlt`);
  assert.equal(t[0].verlust, 0);
});

test("ein unbekannter Schritt wirft niemanden aus der Zaehlung", () => {
  const roh = [normalisiere("a", { createdAt: new Date().toISOString(), step: "quatsch", name: "A" })];
  assert.equal(baueTrichter(roh)[0].anzahl, 1);
});

test("der Tagesverlauf trifft den richtigen Tag", () => {
  const roh = [normalisiere("a", {
    createdAt: new Date().toISOString(), step: "ordered", name: "A",
    order: { orderId: "1", total: 53 }
  })];
  const heute = baueTagesverlauf(roh).find((t) => t.tag === heuteSchluessel());
  assert.equal(heute.analysen, 1);
  assert.equal(heute.bestellungen, 1);
  assert.equal(heute.umsatz, 53);
});
