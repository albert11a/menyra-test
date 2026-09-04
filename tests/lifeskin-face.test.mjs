import test from "node:test";
import assert from "node:assert/strict";

import {
  grauRaster,
  findeAugen,
  findePunkte,
  pruefeAufnahme,
  bewegungZwischen,
  GRENZEN
} from "../apps/lifeskin/lifeskin-face.js";
import { zonenAusPunkten } from "../apps/lifeskin/lifeskin-metrics.js";

const BREITE = 360;
const HOEHE = 640;

// Das Oval, in das der Besucher sein Gesicht legt.
const OVAL = { x: BREITE * 0.16, y: HOEHE * 0.14, w: BREITE * 0.68, h: HOEHE * 0.60 };

// Ein Testbild: heller Grund, ein Gesichtsoval, zwei dunkle Augen.
function testAufnahme({
  augenabstand = 96,
  augenY = HOEHE * 0.34,
  mitteX = BREITE / 2,
  grund = 60,
  haut = 178,
  auge = 58,
  augenVersatzY = 0,
  rauschen = 0
} = {}) {
  const data = new Uint8ClampedArray(BREITE * HOEHE * 4);
  const setze = (x, y, wert) => {
    if (x < 0 || y < 0 || x >= BREITE || y >= HOEHE) return;
    const q = (y * BREITE + x) * 4;
    data[q] = wert; data[q + 1] = Math.round(wert * 0.82); data[q + 2] = Math.round(wert * 0.76);
    data[q + 3] = 255;
  };

  for (let y = 0; y < HOEHE; y += 1) {
    for (let x = 0; x < BREITE; x += 1) setze(x, y, grund);
  }

  // Gesichtsflaeche als Ellipse.
  const cx = mitteX;
  const cy = augenY + augenabstand * 0.55;
  const rx = augenabstand * 1.25;
  const ry = augenabstand * 1.85;
  for (let y = 0; y < HOEHE; y += 1) {
    for (let x = 0; x < BREITE; x += 1) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        const stoerung = rauschen ? (Math.sin(x * 2.7) + Math.cos(y * 3.1)) * rauschen : 0;
        setze(x, y, haut + stoerung);
      }
    }
  }

  // Zwei Augen als dunkle Flecken.
  const augen = [
    { x: mitteX - augenabstand / 2, y: augenY },
    { x: mitteX + augenabstand / 2, y: augenY + augenVersatzY }
  ];
  for (const a of augen) {
    for (let y = -9; y <= 9; y += 1) {
      for (let x = -13; x <= 13; x += 1) {
        if ((x * x) / 169 + (y * y) / 81 <= 1) setze(Math.round(a.x + x), Math.round(a.y + y), auge);
      }
    }
  }

  return { data, width: BREITE, height: HOEHE };
}

test("das Graustufenraster mittelt, statt zu greifen", () => {
  const bild = testAufnahme();
  const raster = grauRaster(bild, 64);
  assert.equal(raster.breite, 64);
  assert.ok(raster.hoehe > 64, "Ein hochkantes Bild muss ein hochkantes Raster ergeben");
  assert.ok(raster.werte.every((v) => v >= 0 && v <= 255));
});

test("beide Augen werden gefunden, jedes auf seiner Seite", () => {
  const bild = testAufnahme();
  const augen = findeAugen(bild, OVAL);
  assert.ok(augen, "Kein Augenpaar gefunden");

  assert.ok(augen.augeLinks.x < BREITE / 2, "Das linke Auge liegt rechts der Mitte");
  assert.ok(augen.augeRechts.x > BREITE / 2, "Das rechte Auge liegt links der Mitte");
  assert.ok(Math.abs(augen.augenabstand - 96) < 20,
    `Der Augenabstand ist zu ungenau: ${augen.augenabstand.toFixed(1)} statt ~96`);
  assert.ok(augen.kontrast >= GRENZEN.kontrastMin,
    "Deutliche Augen muessen den Kontrastwert reissen");
});

test("ein schraeg gehaltenes Handy faellt auf", () => {
  const gerade = findeAugen(testAufnahme(), OVAL);
  const schraeg = findeAugen(testAufnahme({ augenVersatzY: 30 }), OVAL);
  assert.ok(schraeg.schraeglage > gerade.schraeglage);
  assert.ok(schraeg.schraeglage > GRENZEN.schraeglageMax,
    "Eine deutliche Schraeglage muss die Grenze reissen");
});

test("aus dem Augenpaar entstehen alle Punkte, die der Messkern braucht", () => {
  const treffer = findePunkte(testAufnahme(), OVAL);
  assert.ok(treffer, "Keine Punkte erzeugt");

  // Der Beweis, dass die beiden Module zusammenpassen: Der Messkern muss die
  // Punkte ohne Beanstandung in Zonen umsetzen koennen.
  const zonen = zonenAusPunkten(treffer.punkte);
  for (const name of ["stirn", "nase", "wangeLinks", "wangeRechts", "kinn"]) {
    assert.ok(zonen[name].w > 4 && zonen[name].h > 4, `Zone unbrauchbar: ${name}`);
  }
});

test("ein gutes Bild besteht alle vier Pruefungen", () => {
  const ergebnis = pruefeAufnahme(testAufnahme(), OVAL);
  assert.deepEqual(
    ergebnis.pruefungen,
    { gesicht: true, abstand: true, licht: true, ruhe: true },
    `Ein gutes Bild wurde abgelehnt: ${JSON.stringify(ergebnis.messwerte)}`
  );
  assert.equal(ergebnis.bereit, true);
  assert.equal(ergebnis.hinweis, null);
});

test("zu dunkel wird als zu dunkel benannt, nicht als Fehler", () => {
  const ergebnis = pruefeAufnahme(testAufnahme({ haut: 42, grund: 20, auge: 8 }), OVAL);
  assert.equal(ergebnis.pruefungen.licht, false);
  assert.equal(ergebnis.bereit, false);
  assert.equal(ergebnis.hinweis, "zuDunkel");
});

test("zu nah und zu fern werden unterschieden", () => {
  const nah = pruefeAufnahme(testAufnahme({ augenabstand: 200 }), OVAL);
  assert.equal(nah.pruefungen.abstand, false);
  assert.equal(nah.hinweis, "zuNah");

  const fern = pruefeAufnahme(testAufnahme({ augenabstand: 52 }), OVAL);
  assert.equal(fern.pruefungen.abstand, false);
  assert.equal(fern.hinweis, "zuFern");
});

test("Bewegung zwischen zwei Bildern wird gemessen", () => {
  const a = grauRaster(testAufnahme());
  const gleich = grauRaster(testAufnahme());
  const verschoben = grauRaster(testAufnahme({ mitteX: BREITE / 2 + 30 }));

  assert.ok(bewegungZwischen(a, gleich) < 0.01, "Zwei gleiche Bilder sind keine Bewegung");
  assert.ok(bewegungZwischen(a, verschoben) > GRENZEN.bewegungMax,
    "Ein deutlich verschobenes Bild muss die Ruhepruefung reissen");
});

test("ohne Gesicht wird nicht geraten", () => {
  const leer = { data: new Uint8ClampedArray(BREITE * HOEHE * 4).fill(150), width: BREITE, height: HOEHE };
  for (let i = 3; i < leer.data.length; i += 4) leer.data[i] = 255;
  const ergebnis = pruefeAufnahme(leer, OVAL);
  assert.equal(ergebnis.pruefungen.gesicht, false);
  assert.equal(ergebnis.hinweis, "keinGesicht");
  assert.equal(ergebnis.punkte, null);
});
