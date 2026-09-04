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
  const dreh = { nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad + 4 };

  assert.equal(ring.schritt(netz(dreh), 1000).neuerSektor, null, "Ein Bild allein schliesst nichts");
  const zweites = ring.schritt(netz(dreh), 1300);
  assert.equal(zweites.neuerSektor, SEKTOREN / 4, "Nach dem Haltebild geht der rechte Strich zu");
});

test("unter der Schwelle passiert nichts, darueber schon - und zwar in Grad", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  for (const t of [1000, 1300]) ring.schritt(netz({ nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad - 4 }), t);
  assert.equal(ring.anteil, 0, "Fuenfzehn Grad sind noch keine Kopfdrehung");

  for (const t of [1600, 1900]) ring.schritt(netz({ nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad + 4 }), t);
  assert.ok(ring.anteil > 0, "Einundzwanzig Grad sind eine");
});

test("nach oben reicht weniger als zur Seite - der Hals gibt nicht dasselbe her", () => {
  // Der Grund, warum hier zwei Schwellen stehen und nicht eine. Mit einer
  // gemeinsamen blieb der Ring oben und unten offen, waehrend er links und
  // rechts zuging: Seitlich sind rund 35 Grad bequem, senkrecht nur rund 20.
  const grad = POSE_GRENZEN.schwelleSenkrechtGrad + 2;   // zu wenig fuer seitlich

  const hoch = new Ringlauf({ jetzt: 0 });
  eingemessen(hoch);
  for (const t of [1000, 1300]) hoch.schritt(netz({ ny: -0.3, grad }), t);
  assert.ok(hoch.abgedeckt[0], `Nach oben muessen ${grad} Grad reichen`);

  const seite = new Ringlauf({ jetzt: 0 });
  eingemessen(seite);
  for (const t of [1000, 1300]) seite.schritt(netz({ nx: 0.3, grad }), t);
  assert.equal(seite.anteil, 0, `Zur Seite duerfen ${grad} Grad noch nicht reichen`);
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
      ring.schritt(netz({ nx, ny, grad: POSE_GRENZEN.schwelleSeitlichGrad + 8 }), jetzt);
    }
  }
  assert.equal(ring.anteil, 1, `Der Ring ist nur zu ${Math.round(ring.anteil * 100)} % zu`);
  assert.ok(ring.fertigBei());
});

test("ein halb offener Ring ist nicht fertig - egal wie lange es dauert", () => {
  // Frueher reichten zwei Drittel, und nach einer Weile ging es auch ohne.
  // Damit hiess der Ring nichts: Der Kunde sah ihn halb offen und wurde
  // trotzdem weitergeschickt. Ein Fortschritt, der auch ohne Fortschritt
  // endet, ist keiner.
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });
  for (let s = 0; s < SEKTOREN - 1; s += 1) ring.abgedeckt[s] = true;

  assert.ok(!ring.fertigBei(), "Elf von zwoelf Strichen sind nicht fertig");
  ring.abgedeckt[SEKTOREN - 1] = true;
  assert.ok(ring.fertigBei(), "Zwoelf von zwoelf schon");
});

test("ohne gerade Aufnahme ist auch ein voller Ring nicht fertig", () => {
  // Der Befund beruht auf den geraden Aufnahmen. Ohne die eine gibt es
  // nichts zu rechnen, egal wie brav jemand den Kopf gedreht hat.
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.abgedeckt.fill(true);
  assert.ok(!ring.fertigBei());
  ring.aufnahmeVermerkt(0, { frontal: true });
  assert.ok(ring.fertigBei());
});

test("wer sich nicht bewegt, wird nicht weitergeschickt", () => {
  // Die Kehrseite derselben Regel, und sie ist gewollt. Den Ausweg gibt es
  // trotzdem, und zwar sichtbar: den Ausloeser unter dem Bild.
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });
  for (let t = 1000; t < 60000; t += 500) ring.schritt(netz(), t);
  assert.equal(ring.anteil, 0);
  assert.ok(!ring.fertigBei(), "Ohne Bewegung darf nichts fertig werden");
});

test("die Schwelle sinkt, je laenger es dauert", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  assert.equal(ring.schwelleBei(0), 1);
  assert.ok(ring.schwelleBei(POSE_GRENZEN.lockerungAbMs) < 1);
  assert.ok(ring.schwelleBei(POSE_GRENZEN.zweiteLockerungAbMs) < ring.schwelleBei(POSE_GRENZEN.lockerungAbMs));
});

test("ein Bild ohne Gesicht wirft den Ring nicht um", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  const dreh = { nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad + 4 };
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
