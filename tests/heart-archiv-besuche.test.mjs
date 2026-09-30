// ARCHIV: WANN, WIE OFT UND WIE LANGE ER SEINE ANALYSE ANSAH (30.09.,
// Inhaber) - rueckwirkend aus dem Klickpfad der Therapieseite.
import test from "node:test";
import assert from "node:assert/strict";
import { analyseBesuche, kasseAbsicht, kaufStufe, kaufChancen, hatGekauft } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const pfad = (liste) => ({ timings: { pfad: Object.fromEntries(liste.map(([t, e, s = "Therapieseite"], i) => [`p${i}`, { t, e, s, d: "" }])) } });

test("zwei Besuche, aktive Minuten ohne die Zeit im Hintergrund", () => {
  const b = analyseBesuche(pfad([
    ["2026-09-28T10:00:00.000Z", "geoeffnet"],
    ["2026-09-28T10:01:00.000Z", "gesehen"],
    ["2026-09-28T10:02:00.000Z", "verlassen"],
    ["2026-09-28T11:00:00.000Z", "zurueck"],          // eine Stunde weg - zaehlt nicht
    ["2026-09-28T11:01:00.000Z", "klick"],
    ["2026-09-30T09:00:00.000Z", "geoeffnet"],
    ["2026-09-30T09:03:00.000Z", "scroll"],
    ["2026-09-30T09:00:30.000Z", "klick", "Landing/Trichter"]   // andere Seite - zaehlt nicht
  ]));
  assert.equal(b.anzahl, 2);
  assert.equal(b.zuletzt, "2026-09-30T09:03:00.000Z");
  assert.equal(b.ms, (60 + 60 + 60 + 180) * 1000);
});

test("ohne Klickpfad: geoeffnet zaehlt als ein Besuch, ohne Datum und Zeit", () => {
  assert.deepEqual(analyseBesuche({ berichtGeoeffnet: true }), { anzahl: 1, zuletzt: "", ms: 0 });
  assert.deepEqual(analyseBesuche({}), { anzahl: 0, zuletzt: "", ms: 0 });
});

// KASSE BEWUSST ODER NUR KURZ, UND DIE KAUFCHANCE (30.09., Inhaber).
const ereignisse = (liste) => ({ timings: { pfad: Object.fromEntries(liste.map(([t, e, d = ""], i) => [`p${i}`, { t, e, s: "Therapieseite", d }])) } });
const T = (min, s = 0) => new Date(Date.UTC(2026, 8, 28, 10, min, s)).toISOString();

test("Kasse: kurz auf und zu ist nicht bewusst - ein angetipptes Feld schon", () => {
  const kurz = ereignisse([[T(0), "geoeffnet"], [T(1), "kasse", "Bestellschirm geöffnet · 39 €"], [T(1, 5), "klick", "Kthehu · Bestellschirm"]]);
  assert.equal(kasseAbsicht({ ...kurz, kasseGeoeffnet: true }).art, "kurz");
  assert.equal(kaufStufe({ ...kurz, kasseGeoeffnet: true }), 4);
  const feld = ereignisse([[T(0), "geoeffnet"], [T(1), "kasse", "Bestellschirm geöffnet · 39 €"], [T(1, 5), "feld", "Rruga dhe numri · Bestellschirm"]]);
  assert.equal(kasseAbsicht(feld).art, "bewusst");
  assert.equal(kaufStufe(feld), 5);
  const lange = ereignisse([[T(0), "geoeffnet"], [T(1), "kasse", "x"], [T(1, 40), "verlassen"]]);
  assert.equal(kasseAbsicht(lange).art, "bewusst");
  const zweimal = ereignisse([[T(0), "geoeffnet"], [T(1), "kasse", "x"], [T(1, 2), "klick"], [T(3), "kasse", "x"], [T(3, 2), "klick"]]);
  assert.equal(kasseAbsicht(zweimal).art, "bewusst");
  // Alte Faelle ohne Klickpfad: an der Kasse, aber nicht zu sagen.
  assert.equal(kasseAbsicht({ kasseGeoeffnet: true }).art, "offen");
  assert.equal(kasseAbsicht({}).art, "");
});

test("Stufen aus dem, was er gesehen und getan hat", () => {
  assert.equal(kaufStufe({}), 0);
  assert.equal(kaufStufe(ereignisse([[T(0), "geoeffnet"], [T(0, 20), "verlassen"]])), 1);
  assert.equal(kaufStufe(ereignisse([[T(0), "geoeffnet"], [T(0, 20), "scroll", "50 %"]])), 2);
  assert.equal(kaufStufe(ereignisse([[T(0), "geoeffnet"], [T(1), "gesehen"], [T(2), "klick"]])), 2);
  assert.equal(kaufStufe(ereignisse([[T(0), "geoeffnet"], [T(2), "gesehen"], [T(4), "klick"]])), 3);
  assert.equal(kaufStufe(ereignisse([[T(0), "geoeffnet"], [T(0, 10), "aufgeklappt", "A"], [T(0, 20), "aufgeklappt", "B"]])), 3);
});

test("beim Kaeufer zaehlt nur, was vor der Bestellung war", () => {
  // Er las kurz, bestellte ueber den Schirm - danach schaute er lange.
  const s = ereignisse([[T(0), "geoeffnet"], [T(0, 10), "kasse", "x"], [T(0, 15), "feld", "Qyteti · Bestellschirm"],
    [T(0, 30), "bestellt", "39 €"], [T(1), "gesehen"], [T(5), "gesehen"]]);
  assert.equal(kaufStufe({ ...s, hatBestellt: true }), 5);
  assert.equal(analyseBesuche(s).ms > 4 * 60000, true);
});

test("Kaufchance: gezaehlt je Stufe, zur Gesamtquote hingezogen", () => {
  const bewusst = (id, gekauft) => ({ id, hatBestellt: gekauft, ...ereignisse([[T(0), "geoeffnet"], [T(1), "kasse", "x"], [T(1, 5), "feld", "Qyteti · Bestellschirm"]]) });
  const nur = (id) => ({ id, ...ereignisse([[T(0), "geoeffnet"], [T(0, 10), "verlassen"]]) });
  const faelle = [bewusst("a", true), bewusst("b", true), bewusst("c", true), bewusst("d", false),
    nur("e"), nur("f"), nur("g"), nur("h"), { id: "alt", berichtGeoeffnet: true }];
  const c = kaufChancen(faelle);
  // Gesamt 3 von 8 mit Klickpfad; Stufe 5: 3 von 4 -> (3 + 4 * 3/8) / 8.
  assert.equal(c.get("d").stufe, 5);
  assert.equal(c.get("d").n, 4);
  assert.equal(c.get("d").k, 3);
  assert.ok(Math.abs(c.get("d").p - (3 + 1.5) / 8) < 1e-9);
  // Stufe 1: 0 von 4 -> (0 + 1.5) / 8.
  assert.ok(Math.abs(c.get("e").p - 1.5 / 8) < 1e-9);
  // Ohne Klickpfad zaehlt der Fall nicht mit, bekommt aber seine Stufe.
  assert.equal(c.get("alt").stufe, 1);
});

test("alle Besuche zusammen: Anzahl, Minuten und Stufe ueber jeden Besuch der Therapieseite", () => {
  // Drei Besuche an drei Tagen, je 1 Minute - zusammen 3 Minuten, Stufe 3.
  const tag = (d, m, s = 0) => new Date(Date.UTC(2026, 8, d, 10, m, s)).toISOString();
  const s = ereignisse([
    [tag(25, 0), "geoeffnet"], [tag(25, 1), "gesehen"], [tag(25, 1, 5), "verlassen"],
    [tag(27, 0), "geoeffnet"], [tag(27, 1), "scroll", "25 %"], [tag(27, 1, 5), "verlassen"],
    [tag(30, 0), "geoeffnet"], [tag(30, 1), "klick"]
  ]);
  const b = analyseBesuche(s);
  assert.equal(b.anzahl, 3);
  assert.equal(b.ms, (65 + 65 + 60) * 1000);
  assert.equal(b.zuletzt, tag(30, 1));
  // Jeder Besuch fuer sich waere nur Stufe 1 - zusammen ist es Stufe 3.
  assert.equal(kaufStufe(s), 3);
});

test("in Heart eingetragene Bestellung zaehlt als Kauf - und nur was davor war", () => {
  const bestellt = { id: "w", bestelltAt: T(2), ...ereignisse([[T(0), "geoeffnet"], [T(1), "kasse", "x"], [T(1, 5), "klick", "Kthehu · Bestellschirm"],
    [T(3), "geoeffnet"], [T(4), "kasse", "x"], [T(4, 30), "verlassen"]]) };
  // Vor der Bestellung nur einmal kurz an der Kasse; das Nachschauen danach zaehlt nicht.
  assert.equal(kasseAbsicht(bestellt).art, "kurz");
  assert.equal(kaufStufe(bestellt), 4);
  const offen = { id: "o", ...ereignisse([[T(0), "geoeffnet"], [T(1), "kasse", "x"], [T(1, 5), "klick", "Kthehu · Bestellschirm"]]) };
  const c = kaufChancen([bestellt, offen], { w: { status: "versandt" } });
  assert.equal(c.get("o").stufe, 4);
  assert.equal(c.get("o").n, 2);
  assert.equal(c.get("o").k, 1);
  assert.equal(hatGekauft({}, { status: "zugestellt" }), true);
  assert.equal(hatGekauft({}, { status: "fertig" }), false);
});
