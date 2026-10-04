import test from "node:test";
import assert from "node:assert/strict";
import { normalisiere, baueKennzahlen, heuteSchluessel, kaufImZeitraum } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";
import { dokument } from "../apps/lifeskin-astra/astra-daten.js";

const zeit = (tage = 0) => `${heuteSchluessel(tage)}T10:00:00.000Z`;
const fall = (daten) => normalisiere("fall", { createdAt: zeit(2), updatedAt: zeit(), ...daten });

test("heutiger Therapiekorb einer alten Analyse zaehlt heute, nicht am Scan-Tag", () => {
  const s = fall({ timings: { kauf: { knopf: zeit() } } });
  const k = baueKennzahlen([s]);
  assert.equal(k.warenkoerbe, 1);
  assert.ok(k.warenkorbWert > 0);
  assert.equal(k.landing, 0);
  assert.equal(k.analysen, 0);
  assert.equal(k.kasse, 0);
  assert.equal(baueKennzahlen([s], { zeitraum: "gestern" }).warenkoerbe, 0);
  assert.equal(baueKennzahlen([s], { zeitraum: "woche" }).warenkoerbe, 1);
});

test("spaetere Leseaktivitaet verschiebt einen gestrigen Shop-Korb nicht nach heute", () => {
  const s = fall({ imKorb: true, korbWert: 29, timings: { korbAt: zeit(1) } });
  assert.equal(baueKennzahlen([s]).warenkoerbe, 0);
  const gestern = baueKennzahlen([s], { zeitraum: "gestern" });
  assert.equal(gestern.warenkoerbe, 1);
  assert.equal(gestern.warenkorbWert, 29);
});

test("Korb gestern und Kasse heute behalten jeweils ihren Handlungstag", () => {
  const s = fall({ imKorb: true, kasseGeoeffnet: true, kasseGeoeffnetAt: zeit(),
    timings: { korbAt: zeit(1), ereignisse: { [heuteSchluessel()]: { kasseGeoeffnet: zeit() } } } });
  const heute = baueKennzahlen([s]);
  assert.equal(heute.warenkoerbe, 0);
  assert.equal(heute.kasse, 1);
  assert.equal(baueKennzahlen([s], { zeitraum: "gestern" }).warenkoerbe, 1);
  assert.equal(baueKennzahlen([s], { zeitraum: "woche" }).kasse, 1);
});

test("Tagesmarken der Kasse und Bestellzeit retten alte Sitzungen", () => {
  const kasse = fall({ kasseGeoeffnet: true, timings: { ereignisse: {
    [heuteSchluessel()]: { kasseGeoeffnet: zeit() },
    [heuteSchluessel(1)]: { kasseGeoeffnet: zeit(1) }
  } } });
  assert.equal(baueKennzahlen([kasse]).warenkoerbe, 1);
  assert.equal(baueKennzahlen([kasse]).kasse, 1);
  assert.equal(baueKennzahlen([kasse], { zeitraum: "woche" }).kasse, 1);
  const bestellt = fall({ order: { orderId: "x", total: 29, createdAt: zeit() } });
  const k = baueKennzahlen([bestellt]);
  assert.equal(k.warenkoerbe, 1);
  assert.equal(k.bestellungenHeute, 1);
  assert.equal(k.umsatzHeute, 29);
});

test("Kaufabbrueche folgen dem Warenkorbtag, Altdaten ohne Zeit bleiben geschaetzt", () => {
  const s = fall({ imKorb: true, updatedAt: new Date(Date.now() - 3600000).toISOString(),
    timings: { korbAt: zeit() } });
  assert.equal(baueKennzahlen([s]).kaufAbbrueche.length, 1);
  const alt = fall({ imKorb: true });
  assert.equal(baueKennzahlen([alt]).warenkoerbe, 0);
  assert.equal(kaufImZeitraum(alt, "korb", "max"), true);
});

test("Zeitzone: Handlung kurz vor UTC-Mitternacht gehoert zum folgenden lokalen Tag", () => {
  const s = fall({ timings: { kauf: { knopf: `${heuteSchluessel(1)}T23:30:00.000Z` } } });
  assert.equal(baueKennzahlen([s]).warenkoerbe, 1);
});

test("Shop schreibt die Warenkorbzeit als Blatt, spaetere Wertupdates aendern sie nicht", async () => {
  const calls = [];
  const s = new Sitzung({ speicher: null, fetchFn: async (url, options) => {
    if (options?.method === "PATCH") calls.push({ url: String(url), daten: dokument(JSON.parse(options.body)) });
    return { ok: true, status: 200 };
  } });
  await s.ergaenze({ imKorb: true });
  const korb = calls.find((c) => c.daten.imKorb);
  assert.ok(Number.isFinite(Date.parse(korb.daten.timings.korbAt)));
  const masken = new URL(korb.url).searchParams.getAll("updateMask.fieldPaths");
  assert.ok(masken.includes("timings.korbAt"));
  assert.ok(!masken.includes("timings"));
  await s.ergaenze({ korbWert: 29, korbStueck: 2 });
  assert.equal(calls.at(-1).daten.timings, undefined);
});
