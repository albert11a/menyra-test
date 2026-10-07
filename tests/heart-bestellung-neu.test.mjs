// Eine Bestellung selbst anlegen in Heart (das "+" der Karte "Bestellungen").
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { neueBestellung, preisLesen, preisVorschlagFuer, stueckGesamt, neuerCode } from "../apps/mnyra-heart/heart-bestellung-neu-daten.js";
import { normalisiere } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderBestellungen } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { preisFuer } from "../shared/lifeskin-preise.js";

const require = createRequire(import.meta.url);
const { istKauf } = require("../functions/lifeskin-capi-payload.js");

const KATALOG = [
  { id: "lf-acne", name: "LF ACNE", preis: 29 },
  { id: "lf-moistur", name: "LF MOISTUR", preis: 29 },
  { id: "lf-pore", name: "LF PORE", preis: 29 }
];
const SETET = [{ id: "acne", titulli: "Seti kundër akneve", produkte: ["lf-acne", "lf-moistur"], preis: 19 }];
const JETZT = Date.parse("2026-10-07T18:30:00.000Z");

const anlegen = (extra = {}) => neueBestellung({
  wahl: { "lf-acne": 1, "lf-moistur": 1 }, katalog: KATALOG, preis: 19,
  kunde: { name: "Arta Berisha", telefon: "044 123 456", adresse: "Rr. Nëna Terezë 5", qyteti: "Prishtinë" },
  autor: "Albert", jetzt: JETZT, id: "a".repeat(32), code: "LS-0710-ABCDE", ...extra
});

test("ohne Produkt keine Bestellung - sonst nimmt sie alles an", () => {
  assert.ok(neueBestellung({ wahl: {}, katalog: KATALOG }).fehler);
  const leer = neueBestellung({ wahl: { "lf-acne": 1 }, katalog: KATALOG, vorschlag: 29, jetzt: JETZT });
  assert.equal(leer.fehler, undefined, "Name, Nummer, Adresse duerfen leer sein");
  assert.equal(leer.daten.order.total, 29, "ohne getippten Preis gilt der Vorschlag");
});

test("das Dokument ist eine Bestellung wie aus dem Laden", () => {
  const { daten, code } = anlegen();
  assert.equal(daten.step, "ordered");
  assert.equal(daten.order.orderId, code);
  assert.equal(daten.order.total, 19);
  assert.equal(daten.order.payment, "nachnahme");
  assert.equal(daten.order.manuell, true);
  assert.deepEqual(daten.order.items.map((i) => [i.id, i.sasia]), [["lf-acne", 1], ["lf-moistur", 1]]);
  assert.deepEqual(daten.address, { name: "Arta Berisha", telefon: "044 123 456", strasse: "Rr. Nëna Terezë 5", ort: "Prishtinë" });
  assert.equal(daten.source.weg, "lifeskinshop", "steht im Tab Lifeskin Shop");
  const s = normalisiere("a".repeat(32), daten);
  assert.equal(s.hatBestellt, true);
  assert.equal(s.gesehen, false, "kein Besuch der Seite - zaehlt in keinem Trichter");
});

test("NIE an Meta: die Conversions API meldet diese Bestellung nicht", () => {
  const { daten } = anlegen();
  assert.equal(daten.device?.zustimmung, undefined);
  assert.equal(istKauf(null, daten), false);
  assert.equal(istKauf({ step: "address" }, daten), false);
});

test("nur Felder, die die Firestore-Regel fuer Sitzungen erlaubt", () => {
  const regeln = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
  const block = regeln.slice(regeln.indexOf("function lifeskinSessionShapeOk"));
  const liste = block.slice(block.indexOf("hasOnly(["), block.indexOf("])"));
  const erlaubt = new Set([...liste.replace(/\/\/.*$/gm, "").matchAll(/"([A-Za-z]+)"/g)].map((m) => m[1]));
  const { daten } = anlegen();
  for (const k of Object.keys(daten)) assert.ok(erlaubt.has(k), `Feld ${k} wuerde abgewiesen`);
  assert.ok(daten.name.length <= 80 && daten.phone.length <= 40 && daten.code.length <= 24);
});

test("Preis: Set wie im Laden, sonst Staffel; getippt mit Komma", () => {
  assert.equal(preisVorschlagFuer({ "lf-acne": 1, "lf-moistur": 1 }, SETET, preisFuer), 19);
  assert.equal(preisVorschlagFuer({ "lf-acne": 2, "lf-moistur": 1 }, SETET, preisFuer), preisFuer(3));
  assert.equal(preisVorschlagFuer({ "lf-pore": 1 }, SETET, preisFuer), preisFuer(1));
  assert.equal(preisVorschlagFuer({}, SETET, preisFuer), 0);
  assert.equal(stueckGesamt({ a: 2, b: 1 }), 3);
  assert.equal(preisLesen("19,50 €"), 19.5);
  assert.equal(preisLesen(""), null);
  assert.equal(preisLesen("abc"), null);
  assert.match(neuerCode(JETZT), /^LS-\d{4}-[2-9A-HJ-NP-Z]{5}$/);
});

test("die Karte Bestellungen hat oben rechts das + - auch wenn sie leer ist", () => {
  assert.match(renderBestellungen([], "heute", {}), /data-action="lifeskin-bestellung-neu"/);
  const s = normalisiere("a".repeat(32), anlegen({ jetzt: Date.now() }).daten);
  const html = renderBestellungen([s], "heute", {});
  assert.match(html, /data-action="lifeskin-bestellung-neu"/);
  assert.match(html, /Arta Berisha/);
  assert.match(html, /von Heart/);
});

test("zaehlt als Bestellung und Umsatz - aber nie als Besuch, Warenkorb, Kasse oder live", async () => {
  const { baueKennzahlen, baueKauftrichter } = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const { istGeradeAktiv } = await import("../apps/mnyra-heart/heart-lifeskin-live.js");
  const s = normalisiere("a".repeat(32), anlegen({ jetzt: Date.now() }).daten);
  assert.equal(s.manuell, true);
  const k = baueKennzahlen([s]);
  assert.equal(k.warenkoerbe, 0);
  assert.equal(k.kasse, 0);
  assert.equal(k.landing, 0);
  assert.equal(istGeradeAktiv(s), false);
  assert.equal(baueKauftrichter([s]).at(-1).anzahl, 0);
  assert.equal(k.umsatzHeute, 19);
  assert.equal(k.bestellungenHeute, 1);
});
