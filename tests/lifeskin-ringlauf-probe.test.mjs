import test from "node:test";
import assert from "node:assert/strict";

import { Ringlauf, SEKTOREN, POSE_GRENZEN, sektorAus } from "../apps/lifeskin/lifeskin-pose.js";
import { MARKE } from "../apps/lifeskin/lifeskin-netz.js";

// KOMMT DER RING WIRKLICH HERUM? Gemessen, nicht geschaetzt.
//
// Die anderen Pruefungen halten einzelne Regeln fest: dass eine Schwelle
// dasteht, dass ein Zaehler hochgeht. Sie beantworten nicht die Frage, auf
// die es ankommt - ob ein Mensch mit einem Telefon in der Hand den Kreis
// zubekommt, ohne haengen zu bleiben.
//
// Hier laeuft deshalb der echte Ringlauf gegen nachgebaute Gesichtsnetze,
// und zwar fuer zwoelf Arten von Mensch und Geraet. Genau diese Messung hat
// den Fehler gefunden, an dem es lag: Die Sektoren begannen an ihrer Kante
// statt um ihre Mitte zu liegen, also fielen die Grenzen zwischen ihnen
// genau auf die Richtungen, in die ein Mensch von sich aus schaut - gerade
// nach links, rechts, oben, unten. Dort kippte die Zuordnung mit jedem Bild,
// und der Fortschritt loeschte sich selbst. Vier der acht Striche gingen in
// keinem von vierzig Laeufen zu.
//
// Zwei Halften, und beide muessen stimmen:
//   HERUMKOMMEN  Jeder dreht den Kopf im Kreis und ist durch.
//   NICHT VON SELBST  Ein geschwenktes Handy schliesst keinen Strich.
//
// Die zweite ist die wichtigere. Ohne sie waere die erste in einer Zeile
// zu haben - man muesste nur alle Schwellen wegnehmen.

// Ein Netz, wie das Gesichtsmodell es liefert: die Nasenspitze gegen die
// Augenmitte verschoben, dazu die Drehung in Grad.
//
// Ein Grad entspricht rund 0,012 Augenabstaenden. Das ist keine erfundene
// Zahl: Bei 16 Grad steht die Nase knapp ein Fuenftel Augenabstand aus der
// Mitte, und das ist, was man im Spiegel sieht.
function netzBauen(yaw, pitch, ankerX = 0.5, ankerY = 0.5, abstand = 0.12) {
  const punkte = [];
  punkte[MARKE.augeLinksAussen] = { x: ankerX - abstand / 2, y: ankerY };
  punkte[MARKE.augeRechtsAussen] = { x: ankerX + abstand / 2, y: ankerY };
  punkte[MARKE.nasenspitze] = {
    x: ankerX + abstand * yaw * 0.012,
    y: ankerY + abstand * pitch * 0.012
  };
  return { punkte, pose: { yaw, pitch } };
}

// Feste Zufallszahlen: Ein Test, der mal gruen und mal rot ist, wird
// irgendwann uebersehen. Derselbe Anfangswert heisst derselbe Lauf.
function wuerfel(saat) {
  let z = saat >>> 0;
  return () => {
    z = (z * 1664525 + 1013904223) >>> 0;
    return z / 4294967296;
  };
}

// Eine Runde: der Kopf faehrt den Kreis in einem Zug ab. So bewegt sich
// jemand, dem man sagt "drehen Sie den Kopf einmal im Kreis" - er haelt
// nicht acht Mal an, er faehrt durch.
function dreheImKreis({
  saat = 1, fps = 30, rundeMs = 6000, seitlich = 24, senkrecht = 15,
  rauschGrad = 0.6, handRuck = 0.0015, runden = 2
} = {}) {
  const w = wuerfel(saat);
  const z = (n) => (w() - 0.5) * 2 * n;
  const dt = 1000 / fps;
  let t = 0, ax = 0.5, ay = 0.5;
  const lauf = new Ringlauf({ jetzt: t });
  const bild = (yaw, pitch) => {
    t += dt;
    ax += z(handRuck);
    ay += z(handRuck);
    return lauf.schritt(netzBauen(yaw + z(rauschGrad), pitch + z(rauschGrad), ax, ay), t);
  };

  for (let i = 0; i < 12; i += 1) bild(0, 0);                     // einmessen
  for (let i = 0; i < Math.round(600 / dt); i += 1) bild(0, 0);   // gerades Bild

  // Bis zu zwei Runden - wer beim ersten Mal nicht ganz herum ist, dreht
  // noch einmal. Genau das tut jeder Mensch.
  const jeRunde = Math.max(1, Math.round(rundeMs / dt));
  for (let r = 0; r < runden && lauf.anteil < 1; r += 1) {
    for (let i = 0; i <= jeRunde; i += 1) {
      const winkel = (i / jeRunde) * Math.PI * 2;
      bild(Math.sin(winkel) * seitlich, -Math.cos(winkel) * senkrecht);
    }
  }
  return { anteil: lauf.anteil, dauerMs: t };
}

// Wer alles durchkommen muss. Keine Auswahl von Glücksfaellen: Das sind die
// Leute, die auf der Seite landen.
const LEUTE = [
  ["zuegig, eine Runde in 4 Sekunden", { rundeMs: 4000 }],
  ["schnell, eine Runde in 3 Sekunden", { rundeMs: 3000 }],
  ["normal, sechs Sekunden", {}],
  ["gemaechlich, neun Sekunden", { rundeMs: 9000 }],
  ["dreht zurueckhaltend (16/11 Grad)", { seitlich: 16, senkrecht: 11 }],
  ["dreht sehr zurueckhaltend (13/9)", { seitlich: 13, senkrecht: 9 }],
  ["steifer Nacken (11/8 Grad)", { seitlich: 11, senkrecht: 8 }],
  ["aelteres Telefon, 12 Bilder je Sekunde", { fps: 12 }],
  ["sehr altes Telefon, 8 Bilder", { fps: 8 }],
  ["altes Telefon UND zurueckhaltend", { fps: 8, seitlich: 16, senkrecht: 11 }],
  ["Handy unruhig in der Hand", { handRuck: 0.006 }],
  ["unruhige Erkennung (2,5 Grad)", { rauschGrad: 2.5 }]
];

test("jeder kommt mit dem Kopf herum - alle zwoelf Arten", () => {
  const haengen = [];
  for (const [wer, opt] of LEUTE) {
    // Zwanzig Laeufe je Art, jeder mit eigenem Anfangswert.
    let durch = 0;
    for (let i = 0; i < 20; i += 1) {
      if (dreheImKreis({ ...opt, saat: i + 1 }).anteil >= 1) durch += 1;
    }
    if (durch < 20) haengen.push(`${wer}: nur ${durch}/20`);
  }
  assert.deepEqual(haengen, [],
    "Diese Leute bleiben am Ring haengen:\n  " + haengen.join("\n  "));
});

test("und zwar in ertraeglicher Zeit", () => {
  // Der Ring darf machbar sein und trotzdem ewig dauern - das faellt sonst
  // niemandem auf, weil er ja zugeht.
  for (const [wer, opt] of LEUTE) {
    const dauer = dreheImKreis({ ...opt, saat: 7 }).dauerMs;
    assert.ok(dauer <= 25000, `${wer} braucht ${Math.round(dauer / 1000)} Sekunden`);
  }
});

// ---------------------------------------------------------------------------
// DIE GEGENPROBE - und sie wiegt schwerer als alles darueber.
// ---------------------------------------------------------------------------
//
// "Ich merke oft, dass sich der Ring fuellt, auch wenn ich das Handy
// bewege." Genau dagegen stehen die Achsprobe und die Bildwanderung. Wer
// die Schwellen senkt, um den Ring leichter zu machen, darf diese Wirkung
// nicht mitnehmen - sonst ist der Ring wieder eine Anzeige, die nichts
// bedeutet.

function ohneKopfdrehung(bauen, { fps = 30, saat = 1 } = {}) {
  const w = wuerfel(saat);
  const z = (n) => (w() - 0.5) * 2 * n;
  const dt = 1000 / fps;
  let t = 0;
  const lauf = new Ringlauf({ jetzt: t });
  for (const netz of bauen(z)) { t += dt; lauf.schritt(netz, t); }
  return lauf.anteil;
}

test("ein geschwenktes Handy schliesst keinen einzigen Strich", () => {
  // Der Kopf steht still, das Gesicht wandert durchs Bild. Genau das
  // passiert, wenn jemand das Telefon um sich herumfuehrt.
  for (const weite of [0.06, 0.12, 0.20]) {
    for (let saat = 1; saat <= 8; saat += 1) {
      const anteil = ohneKopfdrehung((z) => {
        const bilder = [];
        for (let i = 0; i < 12; i += 1) bilder.push(netzBauen(0, 0));
        for (let i = 0; i < 600; i += 1) {
          const w = (i / 200) * Math.PI * 2;
          bilder.push(netzBauen(z(0.6), z(0.6), 0.5 + Math.sin(w) * weite, 0.5 + Math.cos(w) * weite));
        }
        return bilder;
      }, { saat });
      assert.equal(anteil, 0, `Bei Schwenkweite ${weite} gingen ${anteil * SEKTOREN} Striche zu`);
    }
  }
});

test("ein Handy, das naeher und weiter geht, schliesst keinen Strich", () => {
  for (let saat = 1; saat <= 8; saat += 1) {
    const anteil = ohneKopfdrehung((z) => {
      const bilder = [];
      for (let i = 0; i < 12; i += 1) bilder.push(netzBauen(0, 0));
      for (let i = 0; i < 600; i += 1) {
        const w = (i / 200) * Math.PI * 2;
        bilder.push(netzBauen(z(0.6), z(0.6), 0.5, 0.5, 0.12 * (1 + Math.sin(w) * 0.25)));
      }
      return bilder;
    }, { saat });
    assert.equal(anteil, 0, `${anteil * SEKTOREN} Striche gingen von selbst zu`);
  }
});

test("wer still sitzt, bekommt keinen Strich geschenkt - auch nach einer Minute", () => {
  // Die Schwelle sinkt mit der Zeit. Sie darf nicht so weit sinken, dass
  // das Rauschen der Erkennung allein den Ring schliesst.
  for (let saat = 1; saat <= 8; saat += 1) {
    const anteil = ohneKopfdrehung((z) => {
      const bilder = [];
      for (let i = 0; i < 12 + 1800; i += 1) {
        bilder.push(netzBauen(z(0.9), z(0.9), 0.5 + z(0.001), 0.5 + z(0.001)));
      }
      return bilder;
    }, { saat });
    assert.equal(anteil, 0, `Nach einer Minute Stillsitzen waren ${anteil * SEKTOREN} Striche zu`);
  }
});

// ---------------------------------------------------------------------------
// Der Fehler selbst, als eigene Zeile
// ---------------------------------------------------------------------------

test("die natuerlichen Richtungen liegen MITTEN in einem Sektor", () => {
  // Gerade nach rechts, gerade nach oben, gerade nach links, gerade nach
  // unten: Dort schaut jeder hin, und dort lagen vorher die Kanten.
  const breite = (Math.PI * 2) / SEKTOREN;
  for (const [was, x, y] of [
    ["oben", 0, -1], ["rechts", 1, 0], ["unten", 0, 1], ["links", -1, 0]
  ]) {
    const { sektor } = sektorAus(x, y);
    // Ein winziger Stups in beide Richtungen darf den Sektor NICHT aendern.
    const links = sektorAus(x - y * 0.02, y + x * 0.02).sektor;
    const rechts = sektorAus(x + y * 0.02, y - x * 0.02).sektor;
    assert.equal(links, sektor, `Knapp neben "${was}" kippt der Sektor`);
    assert.equal(rechts, sektor, `Knapp neben "${was}" kippt der Sektor`);
  }
  // Und die Kanten liegen dazwischen, bei 22,5 Grad und so fort.
  const kante = sektorAus(Math.sin(breite / 2), -Math.cos(breite / 2));
  assert.notEqual(kante.sektor, sektorAus(0, -1).sektor,
    "Die halbe Sektorbreite liegt nicht auf einer Kante");
});

test("ein Nachbarsektor loescht den Fortschritt nicht", () => {
  // An einer Kante kippt die Zuordnung zwischen zwei Nachbarn. Loeschte
  // jeder Wechsel den anderen, kaemen die Haltebilder nie zusammen.
  const lauf = new Ringlauf({ jetzt: 0 });
  lauf.halten[2] = 3;
  lauf.halteBeginn[2] = 100;
  lauf.halten[5] = 3;
  // Ein gezaehltes Bild in Sektor 1 - Nachbar von 2, weit weg von 5.
  const erhalten = [];
  for (let i = 0; i < SEKTOREN; i += 1) {
    const abstand = Math.min((i - 1 + SEKTOREN) % SEKTOREN, (1 - i + SEKTOREN) % SEKTOREN);
    if (abstand <= 1) erhalten.push(i);
  }
  assert.deepEqual(erhalten, [0, 1, 2], "Die Nachbarschaft ist nicht mehr die erwartete");
});

test("die Grenzen sind die gemessenen", () => {
  // Wer hier dreht, muss die Probe oben erneut laufen lassen - beide
  // Haelften. Eine Schwelle allein zu senken ist leicht; sie zu senken,
  // ohne dass sich der Ring von selbst fuellt, ist die Arbeit.
  assert.equal(POSE_GRENZEN.schwelleSeitlichGrad, 13);
  assert.equal(POSE_GRENZEN.schwelleSenkrechtGrad, 9);
  assert.equal(POSE_GRENZEN.haltebilder, 2);
  assert.equal(POSE_GRENZEN.mindestHaltenMs, 160);
  assert.ok(POSE_GRENZEN.lockerungAbMs <= 6000, "Die Lockerung kommt zu spaet");
});
