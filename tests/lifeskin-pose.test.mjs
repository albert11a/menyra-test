import test from "node:test";
import assert from "node:assert/strict";

import { richtungAusNetz, sektorAus, Ringlauf, SEKTOREN, POSE_GRENZEN } from "../apps/lifeskin/lifeskin-pose.js";
import { MARKE } from "../apps/lifeskin/lifeskin-netz.js";

// Ein Netzergebnis von Hand. Der Augenabstand ist 0,2 - `nx` und `ny` stehen
// also in Einheiten des Augenabstands, genau wie richtungAusNetz() rechnet.
//
// `grad` legt sich auf DIE ACHSE, in die auch die Nase zeigt - so, wie es
// bei einem echten Kopf ist: Wer zur Seite schaut, dreht (yaw); wer nach
// oben schaut, nickt (pitch). Wer beides absichtlich auseinanderlaufen
// lassen will - das ist der Fall "Handy bewegt, Kopf nicht" -, setzt yaw
// und pitch von Hand.
//
// `ax`/`ay` verschieben das ganze Gesicht im Bild, `abstand` macht es
// groesser oder kleiner: damit laesst sich ein bewegtes Handy nachstellen.
function netz({ nx = 0, ny = 0, grad = 0, yaw = null, pitch = null,
  ax = 0, ay = 0, abstand = 0.2 } = {}) {
  const p = [];
  const halb = abstand / 2;
  p[MARKE.augeLinksAussen] = { x: 0.5 - halb + ax, y: 0.5 + ay };
  p[MARKE.augeRechtsAussen] = { x: 0.5 + halb + ax, y: 0.5 + ay };
  p[MARKE.nasenspitze] = { x: 0.5 + ax + nx * abstand, y: 0.5 + ay + ny * abstand };
  const waagerecht = Math.abs(nx) >= Math.abs(ny);
  return {
    punkte: p,
    pose: {
      yaw: yaw ?? (waagerecht ? grad : 0),
      pitch: pitch ?? (waagerecht ? 0 : grad),
      roll: 0
    }
  };
}

// So oft, wie ein Strich gehalten werden muss - und mit genug Abstand
// dazwischen, dass auch die Zeitgrenze erfuellt ist.
function halte(ring, teil, ab = 1000, takt = 120) {
  let stand = null;
  for (let i = 0; i < POSE_GRENZEN.haltebilder; i += 1) {
    stand = ring.schritt(netz(teil), ab + i * takt);
  }
  return stand;
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
  const seitlich = richtungAusNetz(netz({ nx: 0.3, grad: 21 }));
  assert.equal(seitlich.yaw, 21, "Die Drehung kommt in Grad aus der Matrix");
  assert.equal(seitlich.pitch, 0, "Und sie steht auf ihrer eigenen Achse");
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
  for (let i = 1; i < POSE_GRENZEN.haltebilder - 1; i += 1) {
    assert.equal(ring.schritt(netz(dreh), 1000 + i * 120).neuerSektor, null,
      `Bild ${i + 1} von ${POSE_GRENZEN.haltebilder} schliesst noch nichts`);
  }
  const letztes = ring.schritt(netz(dreh), 1000 + (POSE_GRENZEN.haltebilder - 1) * 120);
  assert.equal(letztes.neuerSektor, SEKTOREN / 4, "Nach dem Halten geht der rechte Strich zu");
});

test("unter der Schwelle passiert nichts, darueber schon - und zwar in Grad", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  halte(ring, { nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad - 4 }, 1000);
  assert.equal(ring.anteil, 0, "Zwoelf Grad sind noch keine Kopfdrehung");

  halte(ring, { nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad + 4 }, 2000);
  assert.ok(ring.anteil > 0, "Zwanzig Grad sind eine");
});

test("nach oben reicht weniger als zur Seite - der Hals gibt nicht dasselbe her", () => {
  // Der Grund, warum hier zwei Schwellen stehen und nicht eine. Mit einer
  // gemeinsamen blieb der Ring oben und unten offen, waehrend er links und
  // rechts zuging: Seitlich sind rund 35 Grad bequem, senkrecht nur rund 20.
  const grad = POSE_GRENZEN.schwelleSenkrechtGrad + 2;   // zu wenig fuer seitlich

  const hoch = new Ringlauf({ jetzt: 0 });
  eingemessen(hoch);
  halte(hoch, { ny: -0.3, grad }, 1000);
  assert.ok(hoch.abgedeckt[0], `Nach oben muessen ${grad} Grad reichen`);

  const seite = new Ringlauf({ jetzt: 0 });
  eingemessen(seite);
  halte(seite, { nx: 0.3, grad }, 1000);
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

// ---------- Der Kopf dreht sich, nicht das Handy ----------
//
// DIE KLAGE AUS DEM BETRIEB: "Ich merke oft, dass sich der Ring fuellt,
// auch wenn ich nur das Handy bewege." Der Sinn ist aber, dass man den Kopf
// in diese Richtungen dreht.
//
// Vollstaendig auseinanderhalten laesst sich beides aus einem Bild nicht:
// Wer das Handy um den Kopf herumfuehrt, erzeugt dieselbe Ansicht wie
// jemand, der den Kopf dreht. Was sich unterscheiden laesst, ist die
// Bewegung dorthin - und drei Proben tun das.

// ERSTE PROBE: von wo aus gemessen wird.
//
// Das war der eigentliche Fehler. Der Nasenversatz wurde gegen die Ruhelage
// gerechnet, der Drehwinkel aber absolut. Wer sein Handy tief haelt und
// darum von unten gefilmt wird, sitzt in Ruhe schon bei achtzehn Grad
// Neigung - ueber der senkrechten Schwelle, bevor er sich bewegt hat.
test("wer das Handy schraeg haelt, faengt trotzdem bei null an", () => {
  const ruhe = { ny: -0.05, yaw: 0, pitch: 18 };
  const ring = new Ringlauf({ jetzt: 0 });
  for (let i = 0; i < POSE_GRENZEN.kalibrierBilder; i += 1) ring.schritt(netz(ruhe), i * 150);
  assert.ok(ring.kalibriert, "In dieser Haltung wird nicht eingemessen");

  // Sitzen bleiben, nur das uebliche Zittern der Erkennung.
  for (let i = 0; i < 12; i += 1) {
    ring.schritt(netz({ ny: -0.06, yaw: 1, pitch: 19 }), 1000 + i * 120);
  }
  assert.equal(ring.anteil, 0, "Der Ring fuellt sich, ohne dass jemand den Kopf bewegt");

  // Und eine echte Drehung zaehlt weiter - gemessen ab der Ruhelage.
  halte(ring, { ny: -0.35, yaw: 0, pitch: 18 + POSE_GRENZEN.schwelleSenkrechtGrad + 4 }, 4000);
  assert.ok(ring.anteil > 0, "Eine echte Drehung aus der Ruhelage heraus zaehlt nicht mehr");
});

// ZWEITE PROBE: wandert das Gesicht durchs Bild?
//
// Beim Drehen des Kopfes bleibt es ungefaehr an seinem Platz. Beim Bewegen
// des Handys wandert es - und daran ist es zu erkennen.
test("ein wanderndes Bild schliesst keinen Strich", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);

  const dreh = { nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad + 8 };
  // Das Handy wandert je Bild um 0,03 - bei einem Augenabstand von 0,2 sind
  // das fuenfzehn Hundertstel und damit weit ueber der Grenze.
  for (let i = 0; i < POSE_GRENZEN.haltebilder * 3; i += 1) {
    const stand = ring.schritt(netz({ ...dreh, ax: 0.03 * (i + 1) }), 1000 + i * 120);
    assert.ok(stand.unruhig, `Bild ${i} gilt als ruhig, obwohl das Gesicht wandert`);
  }
  assert.equal(ring.anteil, 0, "Das Handy allein hat den Ring gefuellt");

  // Steht es still, geht derselbe Strich zu. Ein Bild zum Ankommen: Der
  // Sprung von der letzten Wanderposition zurueck zur Mitte ist selbst noch
  // eine Wanderung, und das ist richtig so.
  ring.schritt(netz(dreh), 4800);
  halte(ring, dreh, 5000);
  assert.ok(ring.anteil > 0, "Bei ruhigem Bild geht gar nichts mehr");
});

test("auch naeher und weiter weg ist keine Kopfdrehung", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  const dreh = { nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad + 8 };
  // Gleichmaessig naeher: je Bild acht Prozent groesser. Ein fester Zuschlag
  // taeugte hier - er faellt relativ immer kleiner aus, je groesser das
  // Gesicht schon ist, und irgendwann liegt er unter der Grenze. Gemessen
  // wird anteilig, also muss auch der Versuch anteilig sein.
  let abstand = 0.2;
  for (let i = 0; i < POSE_GRENZEN.haltebilder * 3; i += 1) {
    abstand *= 1.08;
    const stand = ring.schritt(netz({ ...dreh, abstand }), 1000 + i * 120);
    assert.ok(stand.unruhig, `Bild ${i} gilt als ruhig, obwohl das Gesicht waechst`);
  }
  assert.equal(ring.anteil, 0, "Das Handy naeher zu halten hat den Ring gefuellt");
});

// DRITTE PROBE: sind sich beide Schaetzungen einig, WELCHE Achse es war?
//
// Die Nasenspitze im Bild und die Drehmatrix ueber alle Landmarken sind
// zwei voneinander unabhaengige Messungen. Beim Drehen des Kopfes sagen sie
// dasselbe. Beim Verschieben des Handys wandert die Nase im Bild, waehrend
// die Matrix etwas anderes meldet.
//
// Verglichen werden nur die Betraege der Achsen, nie ihre Vorzeichen: Deren
// Konvention ist bei der Matrix nicht dokumentiert, und was nicht
// dokumentiert ist, darf hier nichts entscheiden.
test("zeigt die Nase zur Seite, muss auch die Matrix zur Seite zeigen", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  // Bild: deutlich seitlich. Matrix: fast nur Neigung. Das passt nicht
  // zusammen und ist damit keine Kopfdrehung zur Seite.
  halte(ring, { nx: 0.35, ny: 0, yaw: 2, pitch: 26 }, 1000);
  assert.equal(ring.anteil, 0, "Ein Strich ging zu, obwohl sich die Achsen widersprechen");

  // Dieselbe Richtung im Bild, aber jetzt sagt die Matrix dasselbe.
  halte(ring, { nx: 0.35, ny: 0, yaw: 26, pitch: 2 }, 4000);
  assert.ok(ring.anteil > 0, "Bei einigen Achsen geht gar nichts mehr");
});

// Ein einzelnes zuckendes Bild soll eine saubere Drehung nicht wegwerfen.
// Wer das Handy wirklich bewegt, hat kaum ein ruhiges Bild dabei - dann
// kommen die noetigen nie zusammen.
test("ein einzelner Ruck mitten in der Drehung kostet nicht den Strich", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  const dreh = { nx: 0.3, grad: POSE_GRENZEN.schwelleSeitlichGrad + 8 };

  ring.schritt(netz(dreh), 1000);
  ring.schritt(netz(dreh), 1120);
  ring.schritt(netz({ ...dreh, ax: 0.05 }), 1240);   // ein Ruck
  ring.schritt(netz({ ...dreh, ax: 0.05 }), 1360);
  const letztes = ring.schritt(netz({ ...dreh, ax: 0.05 }), 1480);
  assert.equal(letztes.neuerSektor, SEKTOREN / 4,
    "Der Ruck hat das Halten zurueckgesetzt, statt nur nicht mitzuzaehlen");
});
