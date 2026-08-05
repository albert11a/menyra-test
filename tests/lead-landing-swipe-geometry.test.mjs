import test from "node:test";
import assert from "node:assert/strict";

import { stageStateFromRect } from "../apps/menyra-social/lead-landing/lead-landing-stage.js";
import { istEchteAenderung } from "../apps/menyra-social/lead-landing/lead-landing-viewport.js";

// Woran das Wischen auf der Lead-Landing haengt.
//
// Die Seite rastet pro Bildschirm ein. Zwei Dinge muessen dafuer stimmen, und
// beide sind schon einmal auseinandergelaufen:
//
// 1. Der Schritt, den ein Kapitel zeigt, muss der sein, auf dem man steht.
// 2. Die Bildschirmhoehe, an der alle Rastpunkte haengen, darf sich waehrend
//    des Wischens nicht aendern - sonst wandern sie unter dem Finger weg.

/* ---------------------------------------------- 1. Schritt aus dem Rastpunkt */

// Ein Kapitel mit vier Erklaerungen ist fuenf Bildschirme hoch. Seine
// Rastpunkte liegen bei 0, 1, 2, 3 und 4 Bildschirmen; rect.top ist dort
// jeweils das Negative davon.
const SCHRITTE = 4;
const BILD = 844;
const HOEHE = BILD * (SCHRITTE + 1);

test("auf jedem Rastpunkt gilt genau der Schritt, der dort hingehoert", () => {
  for (let k = 0; k <= SCHRITTE; k += 1) {
    const { state } = stageStateFromRect(-k * BILD, HOEHE, SCHRITTE);
    assert.equal(state, k, `Rastpunkt ${k} zeigt Schritt ${state}`);
  }
});

test("zwischen zwei Rastpunkten wechselt der Schritt auf halbem Weg", () => {
  // Kurz vor der Mitte gilt noch der vorige Schritt ...
  assert.equal(stageStateFromRect(-(1.49 * BILD), HOEHE, SCHRITTE).state, 1);
  // ... kurz danach der naechste. Frueher sprang der Text erst bei 80 % des
  // Weges um: Wer dazwischen stehen blieb, las die Erklaerung eines Schritts,
  // auf dem er gar nicht stand.
  assert.equal(stageStateFromRect(-(1.51 * BILD), HOEHE, SCHRITTE).state, 2);
});

test("der Schritt kommt aus dem Kapitel selbst, nicht aus einer zweiten Messung", () => {
  // Dieselbe Lage, aber das Kapitel ist um ein Zehntel hoeher gemessen - so
  // sieht es aus, wenn die Bildschirmhoehe gerade nachzieht. Der Schritt darf
  // davon nicht abhaengen: Er sitzt auf dem Rastpunkt, und die Rastpunkte
  // liegen im selben Massstab wie das Kapitel.
  const gross = HOEHE * 1.1;
  for (let k = 0; k <= SCHRITTE; k += 1) {
    const { state } = stageStateFromRect(-k * (gross / (SCHRITTE + 1)), gross, SCHRITTE);
    assert.equal(state, k, `Rastpunkt ${k} zeigt Schritt ${state}`);
  }
});

test("ueber die Enden hinaus bleibt der Schritt stehen", () => {
  // Ueber dem Kapitel und darunter darf nichts Negatives und nichts jenseits
  // des letzten Schritts herauskommen.
  assert.equal(stageStateFromRect(BILD, HOEHE, SCHRITTE).state, 0);
  assert.equal(stageStateFromRect(-HOEHE * 2, HOEHE, SCHRITTE).state, SCHRITTE);
  assert.equal(stageStateFromRect(BILD, HOEHE, SCHRITTE).progress, 0);
  assert.equal(stageStateFromRect(-HOEHE * 2, HOEHE, SCHRITTE).progress, 1);
});

test("der Balken laeuft von 0 auf 100 Prozent", () => {
  assert.equal(stageStateFromRect(0, HOEHE, SCHRITTE).progress, 0);
  assert.equal(stageStateFromRect(-SCHRITTE * BILD, HOEHE, SCHRITTE).progress, 1);
  assert.equal(stageStateFromRect(-2 * BILD, HOEHE, SCHRITTE).progress, 0.5);
});

test("ohne Hoehe wird nichts geraten", () => {
  // Waehrend eines App-Wechsels misst sich alles zu null. Dann darf nicht
  // ploetzlich Schritt 0 gelten - sonst steht man nach der Rueckkehr wieder
  // am Anfang des Kapitels.
  assert.deepEqual(stageStateFromRect(0, 0, SCHRITTE), { state: 0, progress: 0 });
});

/* ------------------------------------------- 2. Feste Bildschirmhoehe */

test("die Leiste des Browsers aendert die Bildschirmhoehe nicht", () => {
  // Die Leisten von Safari nehmen etwa ein Achtel der Hoehe ein. Wuerde die
  // Seite darauf reagieren, wuerde jeder Abschnitt mitten im Wischen hoeher
  // oder niedriger - und der Wisch landet auf einem anderen Rastpunkt als dem
  // angesteuerten, oder er wird ganz verschluckt.
  assert.equal(istEchteAenderung(844, 745), false, "eine ausfahrende Leiste zaehlt");
  assert.equal(istEchteAenderung(745, 844), false, "eine einfahrende Leiste zaehlt");
  assert.equal(istEchteAenderung(667, 735), false, "die kleine Leiste auf dem SE zaehlt");
});

test("Drehen und ein anderes Fenster zaehlen sehr wohl", () => {
  // Beim Drehen aendert sich die Breite - das kann keine Leiste sein.
  assert.equal(istEchteAenderung(844, 390, true), true);
  // Und ohne Drehung erst ab einem Fuenftel Unterschied.
  assert.equal(istEchteAenderung(844, 500), true);
});

test("die erste Messung gilt immer, eine Messung ohne Layout nie", () => {
  assert.equal(istEchteAenderung(0, 844), true);
  assert.equal(istEchteAenderung(844, 0), false, "ohne Layout wird nichts gesetzt");
  assert.equal(istEchteAenderung(844, 844), false);
});
