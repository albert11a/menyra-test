import test from "node:test";
import assert from "node:assert/strict";

import { richtungAusNetz, sektorAus, Ringlauf, SEKTOREN, POSE_GRENZEN } from "../apps/lifeskin/lifeskin-pose.js";
import { MARKE } from "../apps/lifeskin/lifeskin-netz.js";

// Ein Netzergebnis von Hand. Der Augenabstand ist 0,2 - `nx` und `ny` stehen
// also in Einheiten des Augenabstands, genau wie richtungAusNetz() rechnet.
function netz({ nx = 0, ny = 0, grad = 0 } = {}) {
  const p = [];
  p[MARKE.augeLinksAussen] = { x: 0.4, y: 0.5 };
  p[MARKE.augeRechtsAussen] = { x: 0.6, y: 0.5 };
  p[MARKE.nasenspitze] = { x: 0.5 + nx * 0.2, y: 0.5 + ny * 0.2 };
  return { punkte: p, pose: { yaw: grad, pitch: 0, roll: 0 } };
}

function eingemessen(ring, teil = {}, jetzt = 0) {
  let stand = null;
  for (let i = 0; i < POSE_GRENZEN.kalibrierBilder; i += 1) {
    stand = ring.schritt(netz(teil), jetzt + i * 150);
  }
  return stand;
}

test("die Richtung kommt aus dem Bild und kann darum kein falsches Vorzeichen haben", () => {
  // Der Kern der zweiten Fassung. Die Matrix gibt die Richtung auch her,
  // aber ihre Vorzeichenkonvention ist nicht dokumentiert - ein Fehler darin
  // laesst den Ring auf der Gegenseite zugehen, waehrend der Besucher dreht.
  // Wo die Nasenspitze zur Augenmitte steht, ist dagegen zu sehen.
  assert.ok(richtungAusNetz(netz({ nx: 0.3 })).x > 0, "Nase rechts heisst rechts");
  assert.ok(richtungAusNetz(netz({ nx: -0.3 })).x < 0, "Nase links heisst links");
  assert.ok(richtungAusNetz(netz({ ny: -0.3 })).y < 0, "Nase hoch heisst hoch");
  assert.equal(richtungAusNetz(netz({ grad: 21 })).grad, 21, "Der Betrag kommt in Grad aus der Matrix");
  assert.equal(richtungAusNetz(null), null);
  assert.equal(richtungAusNetz({ punkte: [] }), null);
});

test("der Augenabstand normiert: naeher am Handy ist keine Kopfdrehung", () => {
  const fern = { punkte: [], pose: { yaw: 0, pitch: 0, roll: 0 } };
  fern.punkte[MARKE.augeLinksAussen] = { x: 0.45, y: 0.5 };
  fern.punkte[MARKE.augeRechtsAussen] = { x: 0.55, y: 0.5 };
  fern.punkte[MARKE.nasenspitze] = { x: 0.515, y: 0.53 };

  const nah = { punkte: [], pose: { yaw: 0, pitch: 0, roll: 0 } };
  nah.punkte[MARKE.augeLinksAussen] = { x: 0.30, y: 0.5 };
  nah.punkte[MARKE.augeRechtsAussen] = { x: 0.70, y: 0.5 };
  nah.punkte[MARKE.nasenspitze] = { x: 0.56, y: 0.62 };

  const a = richtungAusNetz(fern), b = richtungAusNetz(nah);
  assert.ok(Math.abs(a.x - b.x) < 0.02, `Der Abstand verschiebt die Richtung um ${Math.abs(a.x - b.x)}`);
  assert.ok(Math.abs(a.y - b.y) < 0.02);
});

test("oben ist oben: die vier Himmelsrichtungen treffen ihre Striche", () => {
  const viertel = SEKTOREN / 4;
  assert.equal(sektorAus(0, -1).sektor, 0, "oben");
  assert.equal(sektorAus(1, 0).sektor, viertel, "rechts");
  assert.equal(sektorAus(0, 1).sektor, viertel * 2, "unten");
  assert.equal(sektorAus(-1, 0).sektor, viertel * 3, "links");
});

test("der Nullpunkt wird gemessen, nicht angenommen", () => {
  // Jeder haelt das Handy anders, und ein Kopf, der bequem sitzt, steht
  // selten auf null Grad.
  const ring = new Ringlauf({ jetzt: 0 });
  const stand = eingemessen(ring, { nx: 0.12, ny: 0.30 });
  assert.ok(stand.kalibriert);
  const gerade = ring.schritt(netz({ nx: 0.12, ny: 0.30 }), 1000);
  assert.equal(gerade.sektor, null, "Der eingemessene Sitz gilt als geradeaus");
  assert.ok(gerade.mitte);
});

test("waehrend einer Drehung wird kein Nullpunkt eingemessen", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  let stand = null;
  for (let i = 0; i < POSE_GRENZEN.kalibrierBilder; i += 1) {
    stand = ring.schritt(netz({ nx: i * 0.06, grad: i * 6 }), i * 150);
  }
  assert.ok(!stand.kalibriert, "Ein wandernder Kopf darf nicht als Nullpunkt gelten");
});

test("nach vier Sekunden wird notfalls eingemessen, damit niemand haengen bleibt", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  let stand = null;
  for (let i = 0; i < POSE_GRENZEN.kalibrierBilder; i += 1) {
    stand = ring.schritt(netz({ nx: i * 0.06, grad: i * 6 }), POSE_GRENZEN.kalibrierNotstartMs + i * 150);
  }
  assert.ok(stand.kalibriert);
});

test("ein Strich geht erst zu, wenn der Kopf dort auch bleibt", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  const dreh = { nx: 0.3, grad: POSE_GRENZEN.schwelleGrad + 4 };

  assert.equal(ring.schritt(netz(dreh), 1000).neuerSektor, null, "Ein Bild allein schliesst nichts");
  const zweites = ring.schritt(netz(dreh), 1300);
  assert.equal(zweites.neuerSektor, SEKTOREN / 4, "Nach dem Haltebild geht der rechte Strich zu");
});

test("unter der Schwelle passiert nichts, darueber schon - und zwar in Grad", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  for (const t of [1000, 1300]) ring.schritt(netz({ nx: 0.3, grad: POSE_GRENZEN.schwelleGrad - 3 }), t);
  assert.equal(ring.anteil, 0, "Fuenfzehn Grad sind noch keine Kopfdrehung");

  for (const t of [1600, 1900]) ring.schritt(netz({ nx: 0.3, grad: POSE_GRENZEN.schwelleGrad + 3 }), t);
  assert.ok(ring.anteil > 0, "Einundzwanzig Grad sind eine");
});

test("eine Runde im Kreis fuellt den Ring und beendet ihn", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });

  let jetzt = 1000;
  for (let s = 0; s < SEKTOREN; s += 1) {
    const winkel = (s + 0.5) * ((Math.PI * 2) / SEKTOREN);
    const nx = Math.sin(winkel) * 0.3;
    const ny = -Math.cos(winkel) * 0.3;
    for (let i = 0; i < POSE_GRENZEN.haltebilder; i += 1) {
      jetzt += 300;
      ring.schritt(netz({ nx, ny, grad: POSE_GRENZEN.schwelleGrad + 5 }), jetzt);
    }
  }
  assert.equal(ring.anteil, 1, `Der Ring ist nur zu ${Math.round(ring.anteil * 100)} % zu`);
  assert.ok(ring.fertigBei(jetzt));
});

test("zwei Drittel herum reichen", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });
  for (let s = 0; s < Math.ceil(SEKTOREN * POSE_GRENZEN.mindestAnteil); s += 1) ring.abgedeckt[s] = true;
  assert.ok(!ring.fertigBei(POSE_GRENZEN.mindestdauerMs - 1));
  assert.ok(ring.fertigBei(POSE_GRENZEN.mindestdauerMs + 1));
});

test("wo nichts ankommt, wird nicht bis zum Schluss gewartet", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });
  assert.ok(!ring.fertigBei(POSE_GRENZEN.ohneFortschrittMs - 1));
  assert.ok(ring.fertigBei(POSE_GRENZEN.ohneFortschrittMs + 1));

  const anderer = new Ringlauf({ jetzt: 0 });
  eingemessen(anderer);
  anderer.aufnahmeVermerkt(0, { frontal: true });
  anderer.abgedeckt[0] = true;
  assert.ok(!anderer.fertigBei(POSE_GRENZEN.ohneFortschrittMs + 1),
    "Ein Ring, der laeuft, darf nicht frueh abgebrochen werden");
});

test("der Ring sperrt niemanden ein", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });
  for (let t = 1000; t < POSE_GRENZEN.hoechstdauerMs; t += 500) ring.schritt(netz(), t);
  assert.equal(ring.anteil, 0);
  assert.ok(ring.fertigBei(POSE_GRENZEN.hoechstdauerMs + 1));
});

test("die Schwelle sinkt, je laenger es dauert", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  assert.equal(ring.schwelleBei(0), POSE_GRENZEN.schwelleGrad);
  assert.ok(ring.schwelleBei(POSE_GRENZEN.lockerungAbMs) < POSE_GRENZEN.schwelleGrad);
  assert.ok(ring.schwelleBei(POSE_GRENZEN.zweiteLockerungAbMs) < ring.schwelleBei(POSE_GRENZEN.lockerungAbMs));
});

test("ein Bild ohne Gesicht wirft den Ring nicht um", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  const dreh = { nx: 0.3, grad: POSE_GRENZEN.schwelleGrad + 4 };
  ring.schritt(netz(dreh), 1000);
  ring.schritt(netz(dreh), 1300);
  const vorher = ring.anteil;

  const stand = ring.schritt(null, 1600);
  assert.ok(stand.verloren);
  assert.equal(ring.anteil, vorher, "Ein Aussetzer darf keinen Strich wieder aufmachen");
});

test("das Ziel weist immer nach vorn, nie zurueck", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  ring.abgedeckt[0] = true;
  ring.abgedeckt[1] = true;
  assert.equal(ring.zielSektor(0), 2);
  assert.equal(ring.zielSektor(SEKTOREN - 1), SEKTOREN - 1);
});
