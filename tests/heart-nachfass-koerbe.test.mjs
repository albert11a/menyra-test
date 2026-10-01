// NACHFASSEN (30.09., Inhaber): jeder Warenkorb, jede Kasse sofort - woher,
// wie lange an der Kasse, welche Felder, was nach dem Warenkorb getippt wurde.
import test from "node:test";
import assert from "node:assert/strict";
import { herkunftArt, kasseInfo, korbZeitpunkt, nachDemKorb, nachfassKoerbe } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const T = (min, s = 0) => new Date(Date.UTC(2026, 8, 30, 10, min, s)).toISOString();
const pfad = (liste) => ({ timings: { pfad: Object.fromEntries(liste.map(([t, s, e, d = ""], i) => [`p${i}`, { t, s, e, d }])) } });
const L = "Landing/Trichter";
const TH = "Therapieseite";

test("Herkunft: Anzeige nur mit Kampagne oder Anzeige, fbclid allein ist ein Meta-Link", () => {
  assert.equal(herkunftArt({ source: { utmSource: "ig", utmCampaign: "LS Kosovo", utmContent: "Video 3" } }).art, "anzeige");
  assert.match(herkunftArt({ source: { utmSource: "ig", utmCampaign: "LS Kosovo", utmContent: "Video 3" } }).detail, /Instagram · LS Kosovo · Video 3/);
  assert.equal(herkunftArt({ source: { utmCampaign: "120212345678" } }).art, "anzeige");
  assert.equal(herkunftArt({ source: { fbc: "fb.1.1.abc" }, device: { app: "instagram" } }).art, "meta");
  assert.equal(herkunftArt({ source: { referrer: "https://l.instagram.com/?u=x" } }).label, "instagram.com");
  assert.equal(herkunftArt({ device: { app: "instagram" } }).art, "app");
  assert.equal(herkunftArt({}).art, "direkt");
  assert.equal(herkunftArt({ source: { utmCampaign: "test" } }).art, "test");
});

test("Laden: Warenkorb, danach getippt, Kasse mit Dauer und Feldern - auch nur ein Buchstabe", () => {
  const s = {
    id: "a", imKorb: true, kasseGeoeffnet: true, kasseGeoeffnetAt: T(2),
    ...pfad([
      [T(0), L, "geoeffnet"],
      [T(1), L, "klick", "Porosit setin · 39 € · Landing: Produkte"],
      [T(1, 30), L, "klick", "Vazhdo me porosinë · sheet"],
      [T(2, 10), L, "feld", "tel · kasa"],
      [T(2, 40), L, "klick", "Kthehu · kasa"],
      [T(2, 41), L, "gesehen", "kasa · 38 s"],
      [T(3), L, "verlassen"]
    ])
  };
  assert.equal(korbZeitpunkt(s).t, T(1));
  const k = kasseInfo(s);
  // Offen um 2:00, "Kthehu" um 2:40 schliesst sie -> 40 s (laenger als die
  // 38 s, die sie ganz im Bild war).
  assert.equal(k.ms, 40 * 1000);
  assert.deepEqual(k.felder, ["Telefoni"]);
  const d = nachDemKorb(s);
  assert.deepEqual(d.eintraege.map((e) => e.e), ["klick", "feld", "klick", "verlassen"]);
});

test("der Zurueck-Knopf der Kasse beendet die Kasse", () => {
  const s = {
    id: "z", imKorb: true, kasseGeoeffnet: true, kasseGeoeffnetAt: T(2),
    ...pfad([[T(1), L, "klick", "Porosit setin · 39 € · Landing: Produkte"], [T(2, 30), L, "klick", "Kthehu · kasa"], [T(3, 30), L, "verlassen"]])
  };
  assert.equal(kasseInfo(s).ms, 30 * 1000);
});

test("Therapieseite: Bestellschirm zaehlt als Kasse, gesehen misst mit", () => {
  const s = {
    id: "b", berichtGeoeffnet: true, kasseGeoeffnet: true,
    ...pfad([
      [T(0), TH, "geoeffnet"],
      [T(1), TH, "kasse", "Bestellschirm geöffnet · 39 €"],
      [T(1, 5), TH, "klick", "Kthehu · Bestellschirm"],
      [T(1, 6), TH, "gesehen", "Bestellschirm · 90 s"]
    ])
  };
  const k = kasseInfo(s);
  assert.equal(k.ms, 90 * 1000);
  assert.deepEqual(k.felder, []);
  assert.equal(korbZeitpunkt(s).t, T(1));
});

test("die Liste: jeder Korb, sofort, neueste oben; Bestellte bleiben mit Marke", () => {
  const liste = nachfassKoerbe([
    { id: "leser", berichtGeoeffnet: true, sahPreis: true },
    { id: "alt", imKorb: true, updatedAt: T(0) },
    { id: "jetzt", imKorb: true, kasseGeoeffnet: true, kasseGeoeffnetAt: T(5) },
    { id: "kauf", hatBestellt: true, imKorb: true, updatedAt: T(3), order: { orderId: "x" } }
  ]);
  assert.deepEqual(liste.map((k) => k.sitzung.id), ["jetzt", "kauf", "alt"]);
  assert.equal(liste.find((k) => k.sitzung.id === "kauf").bestellt, true);
  // Ohne Klickpfad: Kasse ohne Dauer, kein "danach".
  const jetzt = liste[0];
  assert.equal(jetzt.kasse.ms, null, "ohne Klickpfad keine erfundene Dauer");
  assert.equal(jetzt.danach.ohnePfad, true);
  assert.equal(liste.find((k) => k.sitzung.id === "alt").kasse, null);
});

test("rueckwirkend auch der alte Laden auf /lifeskin: Shto-Knopf, Kasse an ihren Feldern", () => {
  const s = {
    id: "alt", imKorb: true, kasseGeoeffnet: true, kasseGeoeffnetAt: T(3),
    ...pfad([
      [T(0), L, "geoeffnet"],
      [T(1), L, "klick", "Shto LF ACNE në shportë · 33 € · Landing: Produkte"],
      [T(2), L, "klick", "Shto në shportë · 33 € · Landingpage"],
      [T(3, 20), L, "feld", "tel · Landingpage"],
      [T(3, 50), L, "klick", "Kthehu · Landingpage"],
      [T(4), L, "verlassen"]
    ])
  };
  assert.equal(korbZeitpunkt(s).t, T(1));
  const k = kasseInfo(s);
  assert.deepEqual(k.felder, ["Telefoni"]);
  assert.equal(k.ms, 50 * 1000);
  assert.equal(nachDemKorb(s).eintraege.length, 4);
  // Das Namensfeld im Trichter (Bildschirm "Emri & Mosha") ist keine Kasse.
  assert.equal(kasseInfo({ ...pfad([[T(0), L, "feld", "name · Emri & Mosha"]]) }), null);
});

test("ohne Korb-Klick im Pfad: ab der Kasse - und ohne beides keine erfundene Aussage", () => {
  const abKasse = { id: "k", kasseGeoeffnet: true, kasseGeoeffnetAt: T(2),
    ...pfad([[T(0), L, "geoeffnet"], [T(1), L, "klick", "Etwas · Landingpage"], [T(2, 10), L, "klick", "Kthehu · kasa"]]) };
  assert.deepEqual(nachDemKorb(abKasse).eintraege.map((e) => e.d), ["Kthehu · kasa"]);
  const ohne = { id: "o", imKorb: true, ...pfad([[T(0), L, "geoeffnet"], [T(1), L, "verlassen"]]) };
  const d = nachDemKorb(ohne);
  assert.equal(d.ohneZeitpunkt, true);
  assert.equal(d.eintraege.length, 0);
});

// 01.10.: Der Warenkorb der Therapieseite stand nur als
// timings.kauf.knopf in der Sitzung - der Kaufknopf heisst je nach Stelle
// anders, und Heart fand den Zeitpunkt nicht ("steht nicht im Klickpfad").
test("Therapieseite: Warenkorb ohne Kasse - ab dem Kaufknopf, auch rueckwirkend", () => {
  const alt = {
    id: "therapie-korb", berichtGeoeffnet: true, timings: {
      kauf: { knopf: T(2) },
      pfad: pfad([
        [T(0), TH, "geoeffnet"],
        [T(1), TH, "gesehen", "Produktet · 40 s"],
        [T(2), TH, "klick", "Porosit terapinë · 39 € · Leiste"],
        [T(2, 20), TH, "gesehen", "Warenkorb · 18 s"],
        [T(2, 21), TH, "klick", "Mbyllni · Warenkorb"],
        [T(3), TH, "verlassen"]
      ]).timings.pfad
    }
  };
  const k = korbZeitpunkt(alt);
  assert.equal(k.t, T(2));
  assert.equal(k.ausMarke, true);
  const d = nachDemKorb(alt);
  assert.notEqual(d.ohneZeitpunkt, true);
  assert.deepEqual(d.eintraege.map((e) => e.d), ["Mbyllni · Warenkorb", ""]);
  const [zeile] = nachfassKoerbe([alt]);
  assert.equal(zeile.zeit, T(2), "die Karte zeigt die Zeit des Warenkorbs");
  assert.equal(zeile.kasse, null);

  // Neu: das Ereignis "korb" im Klickpfad (terapia.js #korb). Die Marke
  // steht einen Augenblick davor - derselbe Moment, das Ereignis gilt.
  const neu = {
    id: "neu", timings: {
      kauf: { knopf: T(1, 59) },
      pfad: pfad([
        [T(0), TH, "geoeffnet"],
        [T(2), TH, "klick", "Porosit · 39 € · Produktet"],
        [T(2), TH, "korb", "geöffnet · 39 €"],
        [T(2, 30), TH, "kasse", "Bestellschirm geöffnet · 39 €"]
      ]).timings.pfad
    }
  };
  assert.equal(korbZeitpunkt(neu).index, 2);
  assert.deepEqual(nachDemKorb(neu).eintraege.map((e) => e.e), ["kasse"]);
});

test("die frueheste Marke zaehlt: Kaufknopf vor Kasse", () => {
  const s = { id: "m", kasseGeoeffnet: true, kasseGeoeffnetAt: T(4), timings: { kauf: { knopf: T(3) } } };
  assert.equal(korbZeitpunkt(s).t, T(3));
  // Ein Korb im Laden VOR dem Kaufknopf der Therapieseite bleibt der erste.
  const laden = { id: "l", imKorb: true, timings: {
    kauf: { knopf: T(9) },
    pfad: pfad([[T(1), L, "klick", "Porosit setin · 39 € · Landing: Produkte"], [T(9), TH, "klick", "Porosit · Leiste"]]).timings.pfad
  } };
  assert.equal(korbZeitpunkt(laden).t, T(1));
});
