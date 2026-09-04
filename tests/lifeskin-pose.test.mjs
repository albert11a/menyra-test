import test from "node:test";
import assert from "node:assert/strict";

import { poseRoh, sektorAus, Ringlauf, SEKTOREN, POSE_GRENZEN } from "../apps/lifeskin/lifeskin-pose.js";
import { pruefeAufnahme } from "../apps/lifeskin/lifeskin-face.js";
import { baueGesicht, OVAL } from "./lifeskin-gesicht-bauen.mjs";

// Eine Lage von Hand, fuer die Mechanik des Rings. Die Bildkette wird weiter
// unten mit echten Bildern geprueft - hier geht es nur darum, was der Ring
// aus einer gegebenen Richtung macht.
function lage({ x = 0, y = 0, mx = 0, my = 0 } = {}) {
  return {
    feld: { x: 0.2, y: 0.2, w: 0.5, h: 0.6 },
    augen: { x: 0.5 + x, y: 0.42 + y },
    schwerpunkt: { x: 0.5 + mx, y: 0.5 + my },
    schraeglage: 0
  };
}

function ohneAugen(teil) {
  const l = lage(teil);
  l.augen = null;
  return l;
}

// Den Ring einmessen: ein paar ruhige Bilder geradeaus.
function eingemessen(ring, teil = {}, jetzt = 0) {
  let stand = null;
  for (let i = 0; i < POSE_GRENZEN.kalibrierBilder; i += 1) {
    stand = ring.schritt(lage(teil), jetzt + i * 150);
  }
  return stand;
}

test("die Richtung wird gegen einen gemessenen Nullpunkt gerechnet, nicht gegen eine feste Zahl", () => {
  // Wer schief sitzt, soll seinen eigenen geraden Blick bekommen. Ohne das
  // stuende bei jedem zweiten Besucher der Ring von Anfang an schief.
  const ring = new Ringlauf({ jetzt: 0 });
  const stand = eingemessen(ring, { x: 0.06, y: -0.05 });

  assert.ok(stand.kalibriert, "Der Nullpunkt wurde nicht eingemessen");
  const gerade = ring.schritt(lage({ x: 0.06, y: -0.05 }), 1000);
  assert.ok(gerade.betrag < POSE_GRENZEN.mitte,
    `Der eingemessene Sitz gilt als geradeaus, gemessen wurde ${gerade.betrag.toFixed(2)}`);
});

test("waehrend einer Drehung wird kein Nullpunkt eingemessen", () => {
  // Sonst gilt eine Drehung als geradeaus, und danach geht der Ring auf
  // einer Seite nie zu.
  const ring = new Ringlauf({ jetzt: 0 });
  let stand = null;
  for (let i = 0; i < POSE_GRENZEN.kalibrierBilder; i += 1) {
    stand = ring.schritt(lage({ x: i * 0.04, mx: i * 0.03 }), i * 150);
  }
  assert.ok(!stand.kalibriert, "Ein wandernder Kopf darf nicht als Nullpunkt gelten");
});

test("nach vier Sekunden wird notfalls eingemessen, damit niemand haengen bleibt", () => {
  // Wer im Bus sitzt oder zittert, wird nie ruhig genug. Warten waere hier
  // dasselbe wie abweisen.
  const ring = new Ringlauf({ jetzt: 0 });
  let stand = null;
  for (let i = 0; i < POSE_GRENZEN.kalibrierBilder; i += 1) {
    stand = ring.schritt(lage({ x: i * 0.04, mx: i * 0.03 }),
      POSE_GRENZEN.kalibrierNotstartMs + i * 150);
  }
  assert.ok(stand.kalibriert, "Nach der Notfrist muss eingemessen sein");
});

test("oben ist oben: die vier Himmelsrichtungen treffen ihre Striche", () => {
  // Null steht oben, gezaehlt wird im Uhrzeigersinn. Steht das verkehrt,
  // arbeitet der Besucher gegen die Anzeige, und das faellt sofort auf.
  const viertel = SEKTOREN / 4;
  assert.equal(sektorAus(0, -1).sektor, 0, "oben");
  assert.equal(sektorAus(1, 0).sektor, viertel, "rechts");
  assert.equal(sektorAus(0, 1).sektor, viertel * 2, "unten");
  assert.equal(sektorAus(-1, 0).sektor, viertel * 3, "links");
});

test("ein Strich geht erst zu, wenn der Kopf dort auch bleibt", () => {
  // Ein einzelnes Bild kann ein Ausrutscher der Erkennung sein. Ein Ring,
  // der von Ausrutschern zugeht, misst nichts und zeigt trotzdem "fertig".
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);

  const erstes = ring.schritt(lage({ x: 0.09 }), 1000);
  assert.equal(erstes.neuerSektor, null, "Ein einzelnes Bild darf keinen Strich schliessen");
  const zweites = ring.schritt(lage({ x: 0.09 }), 1300);
  assert.equal(zweites.neuerSektor, SEKTOREN / 4, "Nach dem Haltebild muss der rechte Strich zugehen");
  assert.ok(zweites.abgedeckt[SEKTOREN / 4]);
});

test("eine Runde im Kreis fuellt den Ring und beendet ihn", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });

  let jetzt = 1000;
  for (let s = 0; s < SEKTOREN; s += 1) {
    const winkel = (s + 0.5) * ((Math.PI * 2) / SEKTOREN);
    // Zurueck aus dem Sektorwinkel in die Bildachsen: x nach rechts,
    // y nach unten.
    const x = Math.sin(winkel) * POSE_GRENZEN.augenAmplitudeX * 1.2;
    const y = -Math.cos(winkel) * POSE_GRENZEN.augenAmplitudeY * 1.2;
    for (let i = 0; i < POSE_GRENZEN.haltebilder; i += 1) {
      jetzt += 300;
      ring.schritt(lage({ x, y }), jetzt);
    }
  }

  assert.equal(ring.anteil, 1, `Der Ring ist nur zu ${Math.round(ring.anteil * 100)} % zu`);
  assert.ok(ring.fertigBei(jetzt), "Ein voller Ring muss fertig sein");
});

test("zwei Drittel herum reichen - die letzten Striche kosten mehr Geduld als Messwert", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });
  for (let s = 0; s < Math.ceil(SEKTOREN * POSE_GRENZEN.mindestAnteil); s += 1) ring.abgedeckt[s] = true;

  assert.ok(!ring.fertigBei(POSE_GRENZEN.mindestdauerMs - 1), "Zu frueh ist zu frueh");
  assert.ok(ring.fertigBei(POSE_GRENZEN.mindestdauerMs + 1));
});

test("der Ring sperrt niemanden ein", () => {
  // Wer den Kopf kaum drehen kann, bekommt trotzdem einen Befund. Ein Ring,
  // der sich fuer manche nie fuellt, waere schlimmer als das Tor, das er
  // ersetzt.
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });
  for (let t = 1000; t < POSE_GRENZEN.hoechstdauerMs; t += 500) ring.schritt(lage(), t);

  assert.equal(ring.anteil, 0, "Ohne Bewegung darf kein Strich zugehen");
  assert.ok(ring.fertigBei(POSE_GRENZEN.hoechstdauerMs + 1),
    "Nach der Hoechstdauer muss es weitergehen, abgedeckt oder nicht");
});

test("wo nichts ankommt, wird nicht bis zum Schluss gewartet", () => {
  // Zwei Lockerungen und fuenfzehn Sekunden ohne einen einzigen Strich
  // heissen: Es kommt nichts mehr. Weiter warten zu lassen ist keine
  // Sorgfalt, sondern eine Sackgasse mit Ansage.
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.aufnahmeVermerkt(0, { frontal: true });

  assert.ok(!ring.fertigBei(POSE_GRENZEN.ohneFortschrittMs - 1));
  assert.ok(ring.fertigBei(POSE_GRENZEN.ohneFortschrittMs + 1));

  // Wer vorankommt, bekommt die volle Zeit.
  const anderer = new Ringlauf({ jetzt: 0 });
  eingemessen(anderer);
  anderer.aufnahmeVermerkt(0, { frontal: true });
  anderer.abgedeckt[0] = true;
  assert.ok(!anderer.fertigBei(POSE_GRENZEN.ohneFortschrittMs + 1),
    "Ein Ring, der laeuft, darf nicht frueh abgebrochen werden");
});

test("die Schwelle sinkt, je laenger es dauert", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  assert.equal(ring.schwelleBei(0), POSE_GRENZEN.schwelle);
  assert.ok(ring.schwelleBei(POSE_GRENZEN.lockerungAbMs) < POSE_GRENZEN.schwelle);
  assert.ok(ring.schwelleBei(POSE_GRENZEN.zweiteLockerungAbMs)
    < ring.schwelleBei(POSE_GRENZEN.lockerungAbMs));
});

test("ohne Augen traegt die Hautflaeche den Ring weiter", () => {
  // Brille, Wimperntusche, harter Schatten - die Augen fallen im Betrieb
  // staendig kurz aus. Der Ring darf davon nichts merken.
  const ring = new Ringlauf({ jetzt: 0 });
  let stand = null;
  for (let i = 0; i < POSE_GRENZEN.kalibrierBilder; i += 1) {
    stand = ring.schritt(ohneAugen(), i * 150);
  }
  assert.ok(stand.kalibriert, "Ohne Augen muss trotzdem eingemessen werden");

  const gedreht = POSE_GRENZEN.massenAmplitudeX * 1.2;
  ring.schritt(ohneAugen({ mx: gedreht }), 1000);
  const zweites = ring.schritt(ohneAugen({ mx: gedreht }), 1300);
  assert.equal(zweites.quelle, "masse");
  assert.equal(zweites.neuerSektor, SEKTOREN / 4);
});

test("ein Bild ohne Gesicht wirft den Ring nicht um", () => {
  const ring = new Ringlauf({ jetzt: 0 });
  eingemessen(ring);
  ring.schritt(lage({ x: 0.09 }), 1000);
  ring.schritt(lage({ x: 0.09 }), 1300);
  const vorher = ring.anteil;

  const stand = ring.schritt(null, 1600);
  assert.ok(stand.verloren, "Ein Bild ohne Gesicht muss als solches gemeldet werden");
  assert.equal(ring.anteil, vorher, "Ein Aussetzer darf keinen Strich wieder aufmachen");
});

test("das Ziel weist immer nach vorn, nie zurueck", () => {
  // Wer links herum angefangen hat, soll nicht in der Mitte umkehren
  // muessen. Das ist der Unterschied zwischen einem Kreis und Loecherstopfen.
  const ring = new Ringlauf({ jetzt: 0 });
  ring.abgedeckt[0] = true;
  ring.abgedeckt[1] = true;
  assert.equal(ring.zielSektor(0), 2);
  assert.equal(ring.zielSektor(SEKTOREN - 1), SEKTOREN - 1);
});

// ---------- und jetzt mit echten Bildern ----------

function rohAusBild(optionen) {
  const { bild } = baueGesicht(optionen);
  const ergebnis = pruefeAufnahme(bild, OVAL);
  assert.ok(ergebnis.lage, `Kein Gesichtsfeld bei ${JSON.stringify(optionen)}`);
  return poseRoh(ergebnis.lage);
}

test("eine Kopfdrehung zeigt dorthin, wohin der Kopf zeigt", () => {
  // Das Vorzeichen ist alles, worauf es hier ankommt. Steht es verkehrt,
  // laeuft der Ring dem Besucher davon - die genaue Groesse des Ausschlags
  // holt sich der Ringlauf ohnehin ueber seinen eigenen Nullpunkt.
  const gerade = rohAusBild({});

  const rechts = rohAusBild({ blickX: 0.30 });
  const links = rohAusBild({ blickX: -0.30 });
  assert.ok(rechts.augen.x > gerade.augen.x,
    `Blick nach rechts muss nach rechts zeigen (${rechts.augen.x} vs ${gerade.augen.x})`);
  assert.ok(links.augen.x < gerade.augen.x,
    `Blick nach links muss nach links zeigen (${links.augen.x} vs ${gerade.augen.x})`);

  const runter = rohAusBild({ blickY: 0.30 });
  const hoch = rohAusBild({ blickY: -0.30 });
  assert.ok(runter.augen.y > gerade.augen.y, "Blick nach unten muss nach unten zeigen");
  assert.ok(hoch.augen.y < gerade.augen.y, "Blick nach oben muss nach oben zeigen");
});

test("auch mit Vollbart zeigt die Drehung in die richtige Richtung", () => {
  // Genau der Fall aus dem Betrieb: baertiger Besucher, gutes Licht, und die
  // Seite meldete "kein Gesicht".
  const gerade = rohAusBild({ bart: true });
  const rechts = rohAusBild({ bart: true, blickX: 0.30 });
  assert.ok(rechts.augen.x > gerade.augen.x, "Ein Bart darf die Richtung nicht verdrehen");
});

test("ein Schritt naeher ist keine Kopfdrehung", () => {
  // Alle Signale sind Anteile am Gesichtsfeld. Ohne diese Normierung waere
  // jeder Schritt nach vorn eine scheinbare Drehung, und der Ring wuerde
  // Striche schliessen, die niemand angesteuert hat.
  const nah = rohAusBild({ gesichtBreite: 0.52 });
  const fern = rohAusBild({ gesichtBreite: 0.34 });
  assert.ok(Math.abs(nah.augen.x - fern.augen.x) < POSE_GRENZEN.augenAmplitudeX * 0.62,
    `Der Abstand verschiebt die Richtung um ${Math.abs(nah.augen.x - fern.augen.x).toFixed(3)}`);
  assert.ok(Math.abs(nah.augen.y - fern.augen.y) < POSE_GRENZEN.augenAmplitudeY * 0.62);
});
