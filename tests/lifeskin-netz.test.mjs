import test from "node:test";
import assert from "node:assert/strict";

import { poseAusMatrix, MARKE, NETZ_QUELLEN, LIDSPALTE_LINKS, LIDSPALTE_RECHTS,
  netzStand, netzHolen, __test__ } from "../apps/lifeskin/lifeskin-netz.js";

// Eine Drehmatrix um die Bildachse, spaltenweise wie MediaPipe sie liefert.
function rollMatrix(grad) {
  const w = grad * Math.PI / 180;
  const c = Math.cos(w), s = Math.sin(w);
  return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

test("die Einheitsmatrix ist ein gerader Kopf", () => {
  const p = poseAusMatrix(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
  assert.ok(Math.abs(p.yaw) < 0.001 && Math.abs(p.pitch) < 0.001 && Math.abs(p.roll) < 0.001);
});

test("eine bekannte Drehung kommt in Grad zurueck - im gemessenen Vorzeichen", () => {
  // Der Betrag stimmt aufs Hundertstel; das Vorzeichen ist das, was an
  // echten Bildern herauskam und nicht das, was eine Konvention verspricht:
  // ein um +15 Grad gedrehtes Foto ergab roll -15,1, ein um -15 Grad
  // gedrehtes +14,8. Die Zerlegung liefert also das Negative des
  // Z-Drehwinkels, und genau das haelt dieser Test fest.
  //
  // Dass hier ein Vorzeichen zu erklaeren ist, ist auch der Grund, warum der
  // Ring seine Richtung NICHT aus der Matrix nimmt, sondern aus der Lage der
  // Nasenspitze im Bild (siehe lifeskin-pose.js). Roll wird berichtet,
  // gesteuert wird damit nichts.
  for (const grad of [-30, -15, 0, 15, 30]) {
    assert.ok(Math.abs(poseAusMatrix(rollMatrix(grad)).roll + grad) < 0.01,
      `roll bei ${grad} Grad daneben: ${poseAusMatrix(rollMatrix(grad)).roll}`);
  }
});

test("eine unbrauchbare Matrix ergibt keine Pose statt einer falschen", () => {
  assert.equal(poseAusMatrix(null), null);
  assert.equal(poseAusMatrix(new Float32Array(9)), null);
});

test("die Fassungen sind festgenagelt, nicht 'latest'", () => {
  // Ein stillschweigender Modellwechsel wuerde die Befunde aller Kunden
  // verschieben, ohne dass jemand etwas geaendert haette. Ein Kunde, der
  // seinen Befund ein zweites Mal holt und etwas anderes liest, glaubt beim
  // ersten Mal nichts mehr.
  assert.match(NETZ_QUELLEN.fassung, /^\d+\.\d+\.\d+$/);
  for (const url of [NETZ_QUELLEN.wasm, NETZ_QUELLEN.buendel, NETZ_QUELLEN.modell]) {
    assert.ok(!/latest/.test(url), `${url} zeigt auf "latest"`);
    assert.ok(url.startsWith("https://"), `${url} laeuft nicht ueber https`);
  }
  assert.ok(NETZ_QUELLEN.wasm.includes(NETZ_QUELLEN.fassung));
  assert.ok(NETZ_QUELLEN.buendel.includes(NETZ_QUELLEN.fassung));
});

test("die Landmarken sind eindeutig und liegen im Netz", () => {
  const werte = Object.values(MARKE);
  assert.equal(new Set(werte).size, werte.length, "Zwei Namen zeigen auf denselben Punkt");
  for (const [name, i] of Object.entries(MARKE)) {
    assert.ok(Number.isInteger(i) && i >= 0 && i < 478, `${name} liegt ausserhalb des Netzes`);
  }
  // Die Iris kommt nur aus dem verfeinerten Modell und liegt hinter dem
  // Grundnetz von 468 Punkten. Steht hier eine kleinere Zahl, ist das falsche
  // Modell geladen und der Weissabgleich misst Haut statt Augenweiss.
  assert.ok(MARKE.irisLinks >= 468 && MARKE.irisRechts >= 468);
});

test("die Lidspalten sind geschlossene Umrisse ohne Wiederholung", () => {
  for (const [name, spalte] of [["links", LIDSPALTE_LINKS], ["rechts", LIDSPALTE_RECHTS]]) {
    assert.ok(spalte.length >= 12, `Lidspalte ${name} ist zu grob fuer eine Weissreferenz`);
    assert.equal(new Set(spalte).size, spalte.length, `Lidspalte ${name} nennt einen Punkt doppelt`);
  }
  const doppelt = LIDSPALTE_LINKS.filter((i) => LIDSPALTE_RECHTS.includes(i));
  assert.deepEqual(doppelt, [], "Ein Punkt gehoert zu beiden Augen");
});

test("scheitert das Laden, haelt es den Trichter nicht an", () => {
  // Das ist die wichtigste Zusage dieses Moduls. Ohne sie haengt ein Kunde
  // im Mobilfunk am Ladebalken, und ein Kunde, der wartet, ist ein Kunde,
  // der geht.
  __test__.zuruecksetzen();
  return __test__.ladeWirklich({
    importiere: () => Promise.reject(new Error("Netz weg"))
  }).then(
    () => assert.fail("Haette scheitern muessen"),
    async () => {
      const ergebnis = await netzHolen({ zeitgrenzeMs: 50 }).catch(() => null);
      assert.equal(ergebnis, null, "Ein Fehlschlag muss null liefern, nicht werfen");
      assert.ok(["gescheitert", "laedt"].includes(netzStand()));
      __test__.zuruecksetzen();
    }
  );
});
