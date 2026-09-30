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

test("Kaufchance: verglichen wird mit Leuten, die auch erst ohne Kauf gingen", () => {
  const tag = (d, m, sek = 0) => new Date(Date.UTC(2026, 8, d, 10, m, sek)).toISOString();
  // Kam am 25. nur kurz, kam am 27. wieder und kaufte: sein Stand beim
  // Gehen war "Nur geoeffnet" - das zaehlt, nicht die Kasse am 27.
  const spaeter = (id) => ({ id, hatBestellt: true, ...ereignisse([[tag(25, 0), "geoeffnet"], [tag(25, 0, 20), "verlassen"],
    [tag(27, 0), "geoeffnet"], [tag(27, 1), "kasse", "x"], [tag(27, 1, 5), "feld", "Qyteti · Bestellschirm"], [tag(27, 2), "bestellt", "39 €"]]) });
  // Kaufte gleich beim ersten Mal: ist nie ohne Kauf gegangen - zaehlt nicht.
  const sofort = (id) => ({ id, hatBestellt: true, ...ereignisse([[tag(26, 0), "geoeffnet"], [tag(26, 1), "kasse", "x"], [tag(26, 2), "bestellt", "39 €"]]) });
  const nur = (id) => ({ id, ...ereignisse([[tag(25, 0), "geoeffnet"], [tag(25, 0, 10), "verlassen"]]) });
  const faelle = [spaeter("a"), spaeter("b"), sofort("c"), sofort("d"), nur("e"), nur("f"), nur("g"), nur("h"), nur("i"), nur("j"),
    { id: "alt", berichtGeoeffnet: true }];
  const c = kaufChancen(faelle);
  // Stufe 1 (nur geoeffnet): 2 von 8 kauften spaeter; gesamt 2 von 8 -> 25 %.
  assert.equal(c.get("e").stufe, 1);
  assert.equal(c.get("e").n, 8);
  assert.equal(c.get("e").k, 2);
  assert.ok(Math.abs(c.get("e").p - 0.25) < 1e-9);
  // Die Sofortkaeufer stehen mit ihrer eigenen Stufe da, zaehlen aber nicht.
  assert.equal(c.get("c").stufe, 4);
  assert.equal(c.get("c").n, 0);
  // Ohne Klickpfad zaehlt der Fall nicht mit, bekommt aber seine Stufe.
  assert.equal(c.get("alt").stufe, 1);
});

test("in Heart eingetragene Bestellung zaehlt als Kauf - der Stand beim Gehen zaehlt", () => {
  // Las am 28. lange, war kurz an der Kasse, ging; bestellte am 29. per WhatsApp.
  const tag = (d, m, sek = 0) => new Date(Date.UTC(2026, 8, d, 10, m, sek)).toISOString();
  const whatsapp = { id: "w", bestelltAt: tag(29, 0), ...ereignisse([[tag(28, 0), "geoeffnet"], [tag(28, 4), "gesehen"],
    [tag(28, 5), "kasse", "x"], [tag(28, 5, 5), "klick", "Kthehu · Bestellschirm"], [tag(30, 0), "geoeffnet"], [tag(30, 3), "gesehen"]]) };
  // Nach der Bestellung zaehlt nichts mehr.
  assert.equal(kasseAbsicht(whatsapp).art, "kurz");
  assert.equal(kaufStufe(whatsapp), 4);
  const offen = { id: "o", ...ereignisse([[tag(28, 0), "geoeffnet"], [tag(28, 1), "kasse", "x"], [tag(28, 1, 5), "klick", "Kthehu · Bestellschirm"]]) };
  const c = kaufChancen([whatsapp, offen], { w: { status: "versandt" } });
  assert.equal(c.get("o").stufe, 4);
  assert.equal(c.get("o").n, 2);
  assert.equal(c.get("o").k, 1);
  assert.equal(hatGekauft({}, { status: "zugestellt" }), true);
  assert.equal(hatGekauft({}, { status: "fertig" }), false);
  // Fehlt die Kasse im Pfad, sagt es die Marke.
  assert.equal(kasseAbsicht({ kasseGeoeffnet: true, ...ereignisse([[T(0), "geoeffnet"]]) }).art, "offen");
});
