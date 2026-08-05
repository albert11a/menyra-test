import test from "node:test";
import assert from "node:assert/strict";

import { chunkList, mapWithLimit } from "../apps/mnyra-heart/heart-async-utils.js";

// Hier haengt das Tempo des ersten Landing-Ladens dran: Die Namen der Lokale
// wurden in Zehnerpaketen nacheinander geholt, jedes Paket mit der vollen
// Wartezeit. Diese Tests halten fest, dass sie jetzt nebeneinander laufen -
// und dass dabei nicht alles auf einmal losgeschickt wird.

function warte(ms) {
  return new Promise((weiter) => setTimeout(weiter, ms));
}

test("die Pakete haben die gewuenschte Groesse, der Rest bleibt uebrig", () => {
  assert.deepEqual(chunkList([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunkList([1, 2], 10), [[1, 2]]);
  assert.deepEqual(chunkList([], 10), []);
  // Eine unsinnige Groesse darf keine Endlosschleife ergeben.
  assert.deepEqual(chunkList([1, 2], 0), [[1], [2]]);
});

test("die Ergebnisse behalten die Reihenfolge der Eingabe", async () => {
  const ergebnis = await mapWithLimit([5, 1, 3], 3, async (wert) => {
    await warte(wert);
    return wert * 10;
  });
  assert.deepEqual(ergebnis, [50, 10, 30]);
});

test("es laufen mehrere gleichzeitig, aber nie mehr als erlaubt", async () => {
  let gleichzeitig = 0;
  let hoechststand = 0;

  await mapWithLimit(Array.from({ length: 20 }, (_, i) => i), 4, async () => {
    gleichzeitig += 1;
    hoechststand = Math.max(hoechststand, gleichzeitig);
    await warte(5);
    gleichzeitig -= 1;
  });

  assert.equal(hoechststand, 4, `es waren ${hoechststand} gleichzeitig unterwegs, erlaubt sind 4`);
});

test("nebeneinander ist deutlich schneller als nacheinander", async () => {
  const start = Date.now();
  await mapWithLimit(Array.from({ length: 8 }, (_, i) => i), 8, async () => warte(30));
  const gebraucht = Date.now() - start;
  // Nacheinander waeren es rund 240ms. Grosszuegig gemessen, damit der Test
  // auf einer langsamen Maschine nicht grundlos rot wird.
  assert.ok(gebraucht < 150, `acht Abrufe zu 30ms brauchten ${gebraucht}ms - das lief nacheinander`);
});

test("eine leere Liste macht nichts und wartet auf nichts", async () => {
  let aufrufe = 0;
  const ergebnis = await mapWithLimit([], 4, async () => { aufrufe += 1; });
  assert.deepEqual(ergebnis, []);
  assert.equal(aufrufe, 0);
});

test("bei weniger Aufgaben als Plaetzen werden nicht mehr Arbeiter gestartet", async () => {
  let gleichzeitig = 0;
  let hoechststand = 0;
  await mapWithLimit([1, 2], 8, async () => {
    gleichzeitig += 1;
    hoechststand = Math.max(hoechststand, gleichzeitig);
    await warte(5);
    gleichzeitig -= 1;
  });
  assert.equal(hoechststand, 2);
});
