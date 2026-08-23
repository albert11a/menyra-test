import test from "node:test";
import assert from "node:assert/strict";

import { stepIndexAt } from "../apps/menyra-social/lead-landing/lead-landing-track.js";

// Woran die Auswertung der Landing haengt.
//
// Gezaehlt wird nicht mehr erst im Stillstand, sondern waehrend des Wischens -
// und wer auf einem Wisch steht, hat alle davor passiert. Beides zusammen ist
// der Unterschied zwischen "er ist nicht weitergekommen" und "wir haben nicht
// hingeschaut": Vorher tauchte ein zuegiger Durchlauf nur dort auf, wo jemand
// laenger stehen blieb.

// Sechzehn Bildschirme, einer je Bildschirmhoehe - so liegen die Rastpunkte
// der echten Seite.
const BILD = 844;
const TOPS = Array.from({ length: 16 }, (_, index) => index * BILD);

test("auf jedem Rastpunkt gilt genau der Bildschirm, der dort oben steht", () => {
  TOPS.forEach((top, index) => {
    assert.equal(stepIndexAt(TOPS, top), index);
  });
});

test("zwischen zwei Rastpunkten gilt der obere - wie bei der Seitenfarbe", () => {
  assert.equal(stepIndexAt(TOPS, 3 * BILD + 1), 3);
  assert.equal(stepIndexAt(TOPS, 4 * BILD - 20), 3);
  assert.equal(stepIndexAt(TOPS, 4 * BILD), 4);
});

test("ein halber Pixel Rundung zaehlt schon dem erreichten Bildschirm zu", () => {
  // Nach dem Einrasten steht der Rastpunkt gern knapp unter der Kante. Ohne
  // die Zugabe zaehlte der Wisch dem vorigen zu - und der erreichte stuende
  // in der Auswertung mit null Aufrufen.
  assert.equal(stepIndexAt(TOPS, 9 * BILD - 1.5), 9);
});

test("ueber dem ersten und unter dem letzten Rastpunkt bleibt es stehen", () => {
  assert.equal(stepIndexAt(TOPS, -400), 0);
  assert.equal(stepIndexAt(TOPS, 99 * BILD), TOPS.length - 1);
  assert.equal(stepIndexAt([], 0), -1);
});

test("ein einziger langer Wisch laesst keinen Bildschirm aus", () => {
  // So sieht ein Durchlauf aus, bei dem nur zwei Messungen zustande kommen:
  // einmal ganz oben, einmal ganz unten. Der Weg dazwischen ergibt sich aus
  // dem Index - deshalb kann er nicht verloren gehen.
  const ersteMessung = stepIndexAt(TOPS, 0);
  const letzteMessung = stepIndexAt(TOPS, 15 * BILD);
  const gesehen = [];
  for (let index = ersteMessung; index <= letzteMessung; index += 1) gesehen.push(index);
  assert.equal(gesehen.length, TOPS.length);
});
