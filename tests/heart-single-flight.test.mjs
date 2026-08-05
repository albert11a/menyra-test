import test from "node:test";
import assert from "node:assert/strict";

import { createSingleFlight, withDeadline } from "../apps/mnyra-heart/heart-single-flight.js";

// Diese Tests halten den Fehler fest, der den Landing-Bereich zweimal auf
// "wird geladen" stehen liess: Mehrfaches Antippen warf das Ergebnis des
// laufenden Ladevorgangs weg, und eine haengende Verbindung wurde nie zu einer
// Meldung.

function uhrAttrappe() {
  const wecker = new Map();
  let naechste = 1;
  return {
    setTimeout(fn, ms) {
      const id = naechste++;
      wecker.set(id, { fn, ms });
      return id;
    },
    clearTimeout(id) { wecker.delete(id); },
    laufen() { Array.from(wecker.values()).forEach((w) => w.fn()); },
    offen() { return wecker.size; }
  };
}

test("mehrfaches Antippen ergibt einen Ladevorgang, nicht viele", async () => {
  let laeufe = 0;
  let fertig;
  const laden = createSingleFlight(() => {
    laeufe += 1;
    return new Promise((aufloesen) => { fertig = aufloesen; });
  });

  const alle = [laden(), laden(), laden(), laden(), laden()];
  assert.equal(laeufe, 1, "es wurde mehr als einmal geladen");

  fertig(["daten"]);
  const ergebnisse = await Promise.all(alle);
  // Entscheidend: Jeder bekommt ein Ergebnis. Keiner geht leer aus und laesst
  // die Ansicht auf "wird geladen" stehen.
  ergebnisse.forEach((ergebnis) => assert.deepEqual(ergebnis, ["daten"]));
});

test("nach dem Ende faengt der naechste wieder von vorne an", async () => {
  let laeufe = 0;
  const laden = createSingleFlight(async () => { laeufe += 1; return laeufe; });
  assert.equal(await laden(), 1);
  assert.equal(await laden(), 2);
});

test("auch ein Fehlschlag gibt den naechsten Versuch frei", async () => {
  let laeufe = 0;
  const laden = createSingleFlight(async () => {
    laeufe += 1;
    if (laeufe === 1) throw new Error("kaputt");
    return "geht wieder";
  });

  await assert.rejects(laden(), /kaputt/);
  // Ohne diese Freigabe waere der Bereich nach einem einzigen Fehlschlag tot.
  assert.equal(await laden(), "geht wieder");
});

test("wer nicht antwortet, wird zu einer Meldung statt zu ewigem Warten", async () => {
  const uhr = uhrAttrappe();
  const haengt = new Promise(() => {});
  const versprechen = withDeadline(haengt, 15000, "Die Verbindung antwortet nicht.", uhr);
  uhr.laufen();
  await assert.rejects(versprechen, /antwortet nicht/);
});

test("wer rechtzeitig antwortet, kommt durch - und die Uhr wird abgeraeumt", async () => {
  const uhr = uhrAttrappe();
  assert.deepEqual(await withDeadline(Promise.resolve(["da"]), 15000, "zu spaet", uhr), ["da"]);
  assert.equal(uhr.offen(), 0, "die Uhr laeuft weiter und haelt den Browser wach");
});

test("ohne Frist bleibt alles, wie es war", async () => {
  assert.equal(await withDeadline(Promise.resolve("da"), 0, "egal", uhrAttrappe()), "da");
});
