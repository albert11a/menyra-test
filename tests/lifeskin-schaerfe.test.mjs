// Welches Bild bleibt, wenn der Kopf beim Ausloesen weiterschwenkt.
//
// DER FALL AUS DEM BETRIEB: Ein Ausloeser traf genau ein Bild - das mit dem
// besten Winkel. Wer den Kopf zuegig dreht, hat in genau diesem Bild die
// groesste Bewegung; der beste Winkel und das schaerfste Bild sind nicht
// dasselbe. Beim Arzt kam dann ein unscharfes Gesicht an, und an einem
// unscharfen Gesicht ist keine Pore zu beurteilen.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { schaerfeVonBild } from "../apps/lifeskin/lifeskin-face.js";
import { ohneKommentare, methode } from "./lifeskin-quelle.mjs";

globalThis.__LIFESKIN_TEST__ = true;
const { fotoBesser } = await import("../apps/lifeskin/lifeskin-app.js");

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const APP = lies("apps/lifeskin/lifeskin-app.js");

// Ein Bild wie das der Kamera: RGBA, Zeile fuer Zeile.
function bild(breite, hoehe, farbe) {
  const daten = new Uint8ClampedArray(breite * hoehe * 4);
  for (let y = 0; y < hoehe; y += 1) {
    for (let x = 0; x < breite; x += 1) {
      const i = (y * breite + x) * 4;
      const w = farbe(x, y);
      daten[i] = w; daten[i + 1] = w; daten[i + 2] = w; daten[i + 3] = 255;
    }
  }
  return { width: breite, height: hoehe, data: daten };
}

// Waagerechte Bewegungsunschaerfe: genau das, was ein geschwenkter Kopf
// macht - der Bildpunkt wird mit seinen Nachbarn links und rechts
// verrechnet.
function verwackelt(quelle, laenge) {
  const { width: b, height: h, data: d } = quelle;
  const daten = new Uint8ClampedArray(d.length);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < b; x += 1) {
      let summe = 0;
      let anzahl = 0;
      for (let k = -laenge; k <= laenge; k += 1) {
        const xx = Math.max(0, Math.min(b - 1, x + k));
        summe += d[(y * b + xx) * 4];
        anzahl += 1;
      }
      const i = (y * b + x) * 4;
      const w = summe / anzahl;
      daten[i] = w; daten[i + 1] = w; daten[i + 2] = w; daten[i + 3] = 255;
    }
  }
  return { width: b, height: h, data: daten };
}

// ---------------------------------------------------------------------------
// Die Messung
// ---------------------------------------------------------------------------

test("ein verwackeltes Bild misst sich deutlich unschaerfer als dasselbe scharfe", () => {
  const scharf = bild(96, 96, (x) => ((x >> 2) % 2 ? 210 : 40));
  const unscharf = verwackelt(scharf, 3);
  const a = schaerfeVonBild(scharf);
  const b = schaerfeVonBild(unscharf);
  assert.ok(a > 0, "das scharfe Bild misst gar nichts");
  assert.ok(a > b * 1.15, `die Unschaerfe faellt nicht auf (scharf ${a.toFixed(2)}, unscharf ${b.toFixed(2)})`);
});

test("eine glatte Flaeche hat keine Schaerfe, und das ist kein Fehler", () => {
  assert.equal(schaerfeVonBild(bild(64, 64, () => 128)), 0);
});

test("ein zu kleiner Ausschnitt gibt null statt einer erfundenen Zahl", () => {
  assert.equal(schaerfeVonBild(bild(3, 3, () => 200)), 0);
  assert.equal(schaerfeVonBild(null), 0);
});

// ---------------------------------------------------------------------------
// Die Auswahl
// ---------------------------------------------------------------------------

test("das erste Bild einer Blickrichtung wird immer genommen", () => {
  assert.equal(fotoBesser(null, { abweichung: 0.9, schaerfe: 1 }), true);
});

test("deutlich schaerfer schlaegt den besseren Winkel", () => {
  // Der Fall aus dem Betrieb: perfekter Winkel, aber verwackelt.
  const verwackeltImWinkel = { abweichung: 0.05, schaerfe: 2 };
  const scharfDaneben = { abweichung: 0.40, schaerfe: 4 };
  assert.equal(fotoBesser(verwackeltImWinkel, scharfDaneben), true);
});

test("ein deutlich unschaerferes Bild gewinnt nie, auch im besseren Winkel", () => {
  const scharfDaneben = { abweichung: 0.40, schaerfe: 4 };
  const verwackeltImWinkel = { abweichung: 0.05, schaerfe: 2 };
  assert.equal(fotoBesser(scharfDaneben, verwackeltImWinkel), false);
});

test("bei aehnlicher Schaerfe entscheidet weiter der Winkel", () => {
  // Fuenf Prozent sind Rauschen, kein Unterschied.
  assert.equal(fotoBesser({ abweichung: 0.40, schaerfe: 3 }, { abweichung: 0.10, schaerfe: 3.05 }), true);
  assert.equal(fotoBesser({ abweichung: 0.10, schaerfe: 3 }, { abweichung: 0.40, schaerfe: 3.05 }), false);
});

test("ohne messbare Schaerfe bleibt es beim alten Verhalten", () => {
  // Kein Gesichtsnetz, kein Ausschnitt - dann entscheidet der Winkel, wie
  // vorher auch. Eine Regel, die ohne ihre Messung anders entscheidet,
  // waere schlimmer als keine.
  assert.equal(fotoBesser({ abweichung: 0.40, schaerfe: null }, { abweichung: 0.10, schaerfe: null }), true);
  assert.equal(fotoBesser({ abweichung: 0.10, schaerfe: null }, { abweichung: 0.40, schaerfe: null }), false);
  assert.equal(fotoBesser({ abweichung: 0.10, schaerfe: 0 }, { abweichung: 0.40, schaerfe: 0 }), false);
});

// ---------------------------------------------------------------------------
// Der Nachschlag
// ---------------------------------------------------------------------------

test("nach jedem Ausloeser holt die Schleife noch Bilder nach", () => {
  const quelle = ohneKommentare(APP);
  assert.match(quelle, /nachschlag = \{ frontal, uebrig: NACHSCHLAG_BILDER \}/,
    "Ein Ausloeser merkt keinen Nachschlag vor");
  const schleife = methode(quelle, "#ringschleife");
  assert.match(schleife, /nachschlag\?\.uebrig > 0.*#fotoNachschlag/,
    "Die Schleife holt die Bilder nicht nach");
  // Und der Nachschlag vermisst nichts: Eine zweite Messung je Aufnahme
  // kostet Zehntelsekunden und laesst den Ring stocken.
  const nachschlag = methode(quelle, "#fotoNachschlag");
  assert.ok(!nachschlag.includes("probeVermessen"), "Der Nachschlag misst mit");
  assert.ok(nachschlag.includes("#fotoMerken"), "Der Nachschlag behaelt kein Bild");
});

test("je Blickrichtung bleibt eine feste, kleine Zahl", () => {
  // Nicht "so viele wie kommen": Daran haengt die Wartezeit nach dem Scan,
  // denn die Bilder liegen als Text in Firestore-Dokumenten.
  const quelle = ohneKommentare(APP);
  assert.match(quelle, /FOTOS_JE_BLICK = Object\.freeze\(\{ gerade: 3, rechts: 3, links: 3, oben: 1 \}\)/,
    "Die Zahl je Blickrichtung steht nicht fest");
  assert.match(quelle, /mehr\.length < hoechstens/,
    "Die Zusatzbilder haben keine Obergrenze");
  assert.match(methode(quelle, "#fotoMerken"), /hoechstens: \(FOTOS_JE_BLICK\[ziel\.blick\] \|\| 1\) - 1/,
    "Die Obergrenze kommt nicht aus der Tabelle");
});

// ---------------------------------------------------------------------------
// Der Weg ohne Gesichtsnetz
// ---------------------------------------------------------------------------

test("auch ohne Gesichtsnetz kommt ein Foto beim Arzt an", () => {
  // Wer das Netz nicht geladen bekam - langsames Netz, altes Geraet -, kam
  // bisher ganz ohne Bild an. Eine Hautanalyse ohne Aufnahme ist keine.
  const rueckfall = methode(ohneKommentare(APP), "#rueckfallAufnehmen");
  assert.match(rueckfall, /#fotoMerken\(/, "Der Rueckfallweg legt kein Foto zurueck");
  assert.match(rueckfall, /#messleinwandFuellen\(\)/,
    "Der Rueckfallweg speichert nicht in voller Aufloesung");
});

// ---------------------------------------------------------------------------
// Zehn Bilder statt drei: drei gerade, drei rechts, drei links, eines oben
// ---------------------------------------------------------------------------
//
// Drei Bilder je Richtung sind nur dann drei Bilder, wenn sie DREI
// AUGENBLICKE zeigen. Ohne Mindestabstand kaemen sie aus demselben
// Nachschlag - drei Aufnahmen desselben Sechzigstels, nicht zu
// unterscheiden. Der Arzt haette drei Bilder und trotzdem eine Ansicht.

const { fotoPlatzWahl } = await import("../apps/lifeskin/lifeskin-app.js");

const leer = () => ({ erste: null, mehr: [] });

test("das erste Bild einer Richtung nimmt den ersten Platz", () => {
  assert.equal(fotoPlatzWahl(leer(), { abweichung: 0.2, schaerfe: 3, zeit: 1000 },
    { hoechstens: 2 }).wohin, "erste");
});

test("ein schaerferes Bild verdraengt das beste, ein aehnliches wird Zusatzbild", () => {
  const platz = { erste: { abweichung: 0.2, schaerfe: 3, zeit: 1000 }, mehr: [] };
  // Deutlich schaerfer: Es gehoert auf den ersten Platz.
  assert.equal(fotoPlatzWahl(platz, { abweichung: 0.3, schaerfe: 5, zeit: 2000 },
    { hoechstens: 2 }).wohin, "erste");
  // Aehnlich scharf, anderer Augenblick: als Zusatzbild.
  assert.equal(fotoPlatzWahl(platz, { abweichung: 0.3, schaerfe: 3, zeit: 2000 },
    { hoechstens: 2 }).wohin, "mehr");
});

test("zwei Bilder aus demselben Augenblick werden nicht beide aufbewahrt", () => {
  const platz = { erste: { abweichung: 0.2, schaerfe: 3, zeit: 1000 }, mehr: [] };
  // 30 Millisekunden spaeter - das ist derselbe Nachschlag.
  assert.equal(fotoPlatzWahl(platz, { abweichung: 0.4, schaerfe: 2.9, zeit: 1030 },
    { hoechstens: 2 }).wohin, "nichts");
});

test("sind die Plaetze voll, weicht nur das unschaerfste - und nur fuer Schaerferes", () => {
  const schwach = { schaerfe: 1, zeit: 2000, abweichung: 0.4 };
  const platz = {
    erste: { abweichung: 0.2, schaerfe: 4, zeit: 1000 },
    mehr: [schwach, { schaerfe: 3, zeit: 3000, abweichung: 0.4 }]
  };
  const besser = fotoPlatzWahl(platz, { abweichung: 0.4, schaerfe: 2, zeit: 4000 }, { hoechstens: 2 });
  assert.equal(besser.wohin, "ersetzen");
  assert.equal(besser.opfer, schwach, "es weicht nicht das unschaerfste");
  // Unschaerfer als alles, was liegt: Es kommt nicht hinein.
  assert.equal(fotoPlatzWahl(platz, { abweichung: 0.1, schaerfe: 0.5, zeit: 4000 },
    { hoechstens: 2 }).wohin, "nichts");
});

test("die Aufsicht bekommt genau ein Bild, kein zweites", () => {
  const platz = { erste: { abweichung: 0.2, schaerfe: 3, zeit: 1000 }, mehr: [] };
  assert.equal(fotoPlatzWahl(platz, { abweichung: 0.4, schaerfe: 2.9, zeit: 5000 },
    { hoechstens: 0 }).wohin, "nichts");
});

test("die Zusatzbilder kosten nicht so viel wie das beste", () => {
  // Gemessen wird auf dem Geraet in voller Aufloesung; was hochgeht, wird
  // angesehen. Daran haengt der Upload - und der haelt die Weiterleitung
  // nach dem Scan auf.
  const quelle = ohneKommentare(APP);
  assert.match(quelle, /FOTO_BREITE_MEHR = 900/, "Die Zusatzbilder sind so gross wie das beste");
  assert.match(quelle, /FOTO_BREITE = 1440/, "Das beste Bild ist nicht mehr in voller Groesse");
  // Und sie liegen als JPEG statt als Leinwand im Speicher.
  assert.match(methode(quelle, "#kleinesFoto"), /toDataURL\("image\/jpeg"/,
    "Die Zusatzbilder haengen als Leinwand im Speicher");
});

test("die Bilder gehen nebeneinander hoch, nicht nacheinander", () => {
  // Der Bericht - und damit die Weiterleitung - wartet auf sie. Zehn
  // nacheinander waeren die dreifache Wartezeit nach dem Scan.
  const sitzung = ohneKommentare(fs.readFileSync(
    path.join(process.cwd(), "apps/lifeskin/lifeskin-session.js"), "utf8"));
  const speichern = methode(sitzung, "fotosSpeichern");
  assert.match(speichern, /Promise\.all/, "Die Fotos gehen wieder eines nach dem anderen hoch");
  assert.match(speichern, /GLEICHZEITIG = 3/, "Es gibt keine Obergrenze fuer gleichzeitige Uploads");
  // Ein Bild, das nicht ankommt, reisst die anderen nicht mit.
  assert.match(speichern, /\.catch\(/, "Ein gescheitertes Foto reisst die anderen mit");
});
