import test from "node:test";
import assert from "node:assert/strict";

import {
  istHaut,
  bildRaster,
  gesichtsFeld,
  findeAugenPaar,
  findePunkte,
  pruefeAufnahme,
  bewegungZwischen,
  GRENZEN
} from "../apps/lifeskin/lifeskin-face.js";
import { zonenAusPunkten } from "../apps/lifeskin/lifeskin-metrics.js";
import { baueGesicht, HAUTTOENE, OVAL, BREITE, HOEHE } from "./lifeskin-gesicht-bauen.mjs";

function leeresBild(wert = 150) {
  const data = new Uint8ClampedArray(BREITE * HOEHE * 4).fill(wert);
  for (let i = 3; i < data.length; i += 4) data[i] = 255;
  return { data, width: BREITE, height: HOEHE };
}

test("Haut wird von Haar, Wand und Kleidung unterschieden", () => {
  // Der Kern der zweiten Fassung. Die erste suchte das Dunkle und fand
  // darum Haar; diese sucht die Haut.
  for (const [name, ton] of Object.entries(HAUTTOENE)) {
    assert.ok(istHaut(ton[0], ton[1], ton[2]), `${name} wird nicht als Haut erkannt`);
  }
  assert.ok(!istHaut(26, 20, 18), "Dunkles Haar darf keine Haut sein");
  assert.ok(!istHaut(128, 132, 138), "Eine graue Wand darf keine Haut sein");

  // Blondes Haar (196,168,120) liegt farblich mitten im Hautbereich und wird
  // mitgezaehlt. Das laesst sich ueber Farbe allein nicht trennen und wird
  // hier nicht behauptet - die Folge ist ein etwas groesseres Gesichtsfeld,
  // und die Augensuche findet die Augen trotzdem. Der Fall "blondes Haar"
  // steht darum weiter unten als Durchlauf, nicht hier als Farbregel.
  assert.ok(!istHaut(20, 40, 120), "Blaue Kleidung darf keine Haut sein");
  assert.ok(!istHaut(240, 240, 240), "Weiss darf keine Haut sein");
});

test("das Gesichtsfeld wird bei jedem Hautton gefunden — mit dunklem Haar", () => {
  // Genau der Fall, an dem die erste Fassung im Betrieb gescheitert ist:
  // dunkles Haar, gutes Licht, und trotzdem "kein Gesicht erkannt".
  for (const ton of Object.keys(HAUTTOENE)) {
    const { bild, erwartet } = baueGesicht({ hautton: ton });
    const raster = bildRaster(bild);
    const feld = gesichtsFeld(raster);
    assert.ok(feld, `Kein Gesichtsfeld bei Hautton ${ton}`);

    const breiteEcht = feld.w * raster.faktor;
    const abweichung = Math.abs(breiteEcht - erwartet.gesichtBreite) / erwartet.gesichtBreite;
    assert.ok(abweichung < 0.35,
      `Gesichtsbreite bei ${ton} um ${Math.round(abweichung * 100)} % daneben`);
  }
});

test("das Augenpaar wird gefunden, nicht die Augenbrauen oder das Haar", () => {
  for (const ton of Object.keys(HAUTTOENE)) {
    const { bild, erwartet } = baueGesicht({ hautton: ton });
    const raster = bildRaster(bild);
    const augen = findeAugenPaar(raster, gesichtsFeld(raster));
    assert.ok(augen, `Kein Augenpaar bei Hautton ${ton}`);

    const fehler = Math.abs(augen.augenabstand - erwartet.augenabstand);
    assert.ok(fehler < erwartet.augenabstand * 0.25,
      `Augenabstand bei ${ton} um ${fehler.toFixed(0)} px daneben (erwartet ${erwartet.augenabstand.toFixed(0)})`);

    const mitte = (augen.augeLinks.x + augen.augeRechts.x) / 2;
    assert.ok(Math.abs(mitte - erwartet.cx) < erwartet.gesichtBreite * 0.18,
      `Die Augenmitte bei ${ton} liegt nicht auf der Gesichtsmitte`);

    // Waeren Haare gefunden worden, laege das Paar deutlich hoeher.
    const augenHoehe = (augen.augeLinks.y + augen.augeRechts.y) / 2;
    assert.ok(Math.abs(augenHoehe - erwartet.augenY) < erwartet.gesichtBreite * 0.3,
      `Das gefundene Paar bei ${ton} liegt nicht auf Augenhoehe — vermutlich Haar oder Brauen`);
  }
});

test("ein gutes Gesicht besteht alle vier Pruefungen", () => {
  const ergebnis = pruefeAufnahme(baueGesicht().bild, OVAL);
  assert.deepEqual(ergebnis.pruefungen,
    { gesicht: true, abstand: true, licht: true, ruhe: true },
    `Ein gutes Gesicht wurde abgelehnt: ${JSON.stringify(ergebnis.messwerte)}`);
  assert.equal(ergebnis.bereit, true);
});

test("schwierige, aber alltaegliche Bedingungen gehen trotzdem durch", () => {
  // Jede Zeile hier ist ein Kunde, der sonst verloren gewesen waere.
  const faelle = [
    ["dunkler Hintergrund", { hintergrund: [18, 18, 22] }],
    ["heller Hintergrund", { hintergrund: [246, 246, 248] }],
    ["Abendlicht", { helligkeit: 0.62 }],
    ["sehr helles Licht", { helligkeit: 1.38 }],
    ["blondes Haar", { haarFarbe: [196, 168, 120] }],
    ["Kopftuch oder Kappe", { mitHaar: false }],
    ["Kopf leicht seitlich", { mitteX: 0.42 }],
    ["ohne Augenbrauen", { mitBrauen: false }],
    ["dunkle Haut, dunkles Haar", { hautton: "sehrDunkel" }]
  ];
  for (const [name, opt] of faelle) {
    const ergebnis = pruefeAufnahme(baueGesicht(opt).bild, OVAL);
    assert.equal(ergebnis.bereit, true,
      `"${name}" wurde abgelehnt (${ergebnis.hinweis}): ${JSON.stringify(ergebnis.pruefungen)}`);
  }
});

test("ein Vollbart ist kein Grund, jemanden wegzuschicken", () => {
  // Der zweite Ausfall im Betrieb, und derselbe Fehler wie beim Haar: Die
  // Maske sucht Haut, ein Bart ist keine, und damit fiel bei einem baertigen
  // Gesicht die untere Haelfte des Feldes weg. Uebrig blieb ein Feld, das
  // breiter als hoch und duenner besetzt war als die Grenzen erlaubten - und
  // der Besucher las "kein Gesicht erkannt", waehrend er gut ausgeleuchtet
  // davorsass. Im Zielmarkt traegt ein grosser Teil der Maenner Vollbart.
  for (const ton of Object.keys(HAUTTOENE)) {
    const { bild } = baueGesicht({ hautton: ton, bart: true });
    const raster = bildRaster(bild);
    const feld = gesichtsFeld(raster);
    assert.ok(feld, `Kein Gesichtsfeld bei Vollbart und Hautton ${ton}`);

    const ergebnis = pruefeAufnahme(bild, OVAL);
    assert.ok(ergebnis.pruefungen.gesicht,
      `Vollbart bei ${ton} wurde abgewiesen: ${ergebnis.hinweis}`);
  }
});

test("eine Muetze tief im Gesicht nimmt der Maske die Stirn - und geht trotzdem durch", () => {
  // Dieselbe Rechnung von der anderen Seite: Faellt oben etwas weg statt
  // unten, bleibt ebenfalls ein flaches Feld uebrig.
  const { bild } = baueGesicht({ hautton: "mittel", bart: false });
  // Die obere Gesichtshaelfte dunkel ueberstreichen - Muetze, Pony, harter
  // Schlagschatten von einer Deckenlampe.
  for (let y = 0; y < HOEHE * 0.34; y += 1) {
    for (let x = 0; x < BREITE; x += 1) {
      const q = (y * BREITE + x) * 4;
      bild.data[q] = 30; bild.data[q + 1] = 24; bild.data[q + 2] = 22;
    }
  }
  const feld = gesichtsFeld(bildRaster(bild));
  assert.ok(feld, "Ohne Stirn wird kein Gesichtsfeld mehr gefunden");
});

test("der Hinweis sagt, was zu tun ist — nie nur, dass etwas fehlt", () => {
  const nah = pruefeAufnahme(baueGesicht({ gesichtBreite: 0.95 }).bild, OVAL);
  assert.equal(nah.hinweis, "zuNah");

  // Wichtig: ein kleines Gesicht ist ein Gesicht. Wer zu weit weg steht,
  // muss "naeher herangehen" lesen, nicht "kein Gesicht erkannt" - sonst
  // weiss er nicht, was er tun soll, und bricht ab.
  const fern = pruefeAufnahme(baueGesicht({ gesichtBreite: 0.18 }).bild, OVAL);
  assert.equal(fern.hinweis, "zuFern");

  const dunkel = pruefeAufnahme(leeresBild(12), OVAL);
  assert.equal(dunkel.hinweis, "zuDunkel");

  // Eine helle Wand ist nicht dunkel. Wer hier "besseres Licht" liest,
  // dreht die Lampe auf und wundert sich, dass nichts geschieht.
  const wand = pruefeAufnahme(leeresBild(150), OVAL);
  assert.equal(wand.hinweis, "keinGesicht");
});

test("ohne Gesicht entstehen keine Punkte", () => {
  assert.equal(findePunkte(leeresBild(150), OVAL), null);
  assert.equal(pruefeAufnahme(leeresBild(150), OVAL).punkte, null);
});

test("die Augen sind eine Verfeinerung, keine Bedingung", () => {
  // Die zweite Lehre aus dem Ausfall. Findet die Suche kein Augenpaar,
  // werden die Punkte aus dem Gesichtsfeld abgeleitet und die Analyse laeuft
  // trotzdem. Ein Trichter, der jemanden wegschickt, weil eine Verfeinerung
  // fehlt, verliert Geld ohne Not.
  const bild = baueGesicht({ mitBrauen: false }).bild;
  const raster = bildRaster(bild);
  const feld = gesichtsFeld(raster);

  // Die Ableitung aus dem Feld allein muss brauchbare Zonen ergeben.
  const treffer = findePunkte(bild, OVAL, raster);
  assert.ok(treffer, "Ohne Augen muessen Punkte aus dem Feld entstehen");
  const zonen = zonenAusPunkten(treffer.punkte);
  for (const name of ["stirn", "nase", "wangeLinks", "wangeRechts", "kinn"]) {
    assert.ok(zonen[name].w > 4 && zonen[name].h > 4, `Zone unbrauchbar: ${name}`);
    assert.ok(zonen[name].x >= 0 && zonen[name].y >= 0, `Zone ausserhalb: ${name}`);
  }
  assert.ok(feld, "Voraussetzung: Gesichtsfeld gefunden");
});

test("aus den Punkten werden Zonen, die im Gesicht liegen", () => {
  const { bild, erwartet } = baueGesicht();
  const treffer = findePunkte(bild, OVAL);
  const zonen = zonenAusPunkten(treffer.punkte);

  // Die Wangen liegen links und rechts der Gesichtsmitte und beruehren sich nicht.
  assert.ok(zonen.wangeLinks.x + zonen.wangeLinks.w <= zonen.wangeRechts.x,
    "Die Wangenzonen ueberlappen");
  assert.ok(zonen.wangeLinks.x < erwartet.cx && zonen.wangeRechts.x > erwartet.cx,
    "Die Wangen liegen nicht beidseits der Mitte");
  // Und die Stirn liegt ueber der Nase.
  assert.ok(zonen.stirn.y + zonen.stirn.h <= zonen.nase.y + 1);
});

test("dasselbe Bild ergibt dieselbe Erkennung", () => {
  const { bild } = baueGesicht();
  const a = findePunkte(bild, OVAL);
  const b = findePunkte(bild, OVAL);
  assert.deepEqual(a.punkte, b.punkte,
    "Die Erkennung muss bei gleichem Bild Zeichen fuer Zeichen gleich sein");
});

test("Licht verschiebt die Erkennung nicht", () => {
  // Dieselbe Person hell und dunkel aufgenommen: Der Augenabstand ist eine
  // Groesse im Bild und darf sich mit dem Licht nicht aendern - sonst
  // veraenderten sich die Messzonen und damit der Befund.
  const hell = findePunkte(baueGesicht({ helligkeit: 1.25 }).bild, OVAL);
  const dunkel = findePunkte(baueGesicht({ helligkeit: 0.68 }).bild, OVAL);
  assert.ok(hell && dunkel, "Beide Aufnahmen muessen erkannt werden");

  const abstandHell = Math.abs(hell.punkte[33].x - hell.punkte[263].x);
  const abstandDunkel = Math.abs(dunkel.punkte[33].x - dunkel.punkte[263].x);
  const abweichung = Math.abs(abstandHell - abstandDunkel) / abstandHell;
  assert.ok(abweichung < 0.12,
    `Der Augenabstand wandert mit dem Licht um ${Math.round(abweichung * 100)} %`);
});

test("Bewegung zwischen zwei Bildern wird gemessen", () => {
  const a = bildRaster(baueGesicht().bild);
  const gleich = bildRaster(baueGesicht().bild);
  const verschoben = bildRaster(baueGesicht({ mitteX: 0.62 }).bild);

  assert.ok(bewegungZwischen(a, gleich) < 0.01, "Zwei gleiche Bilder sind keine Bewegung");
  assert.ok(bewegungZwischen(a, verschoben) > GRENZEN.bewegungMax,
    "Ein deutlich verschobenes Bild muss die Ruhepruefung reissen");
});

test("ein Farbstich im Raum macht die Erkennung nicht kaputt", () => {
  // Der haeufigste Ausfall im Betrieb nach dem Zuschnitt: Gluehlampenlicht
  // faerbt alles orange, Leuchtstoffroehren gruenlich. Ohne Weissabgleich
  // rutscht die Haut aus ihrem Farbfenster und die Wand hinein - und niemand
  // versteht, warum es abends im Bad nicht geht und mittags am Fenster schon.
  const stiche = [
    ["Gluehlampe (orange)", [1.18, 0.98, 0.74]],
    ["Leuchtstoff (gruen)", [0.9, 1.12, 0.94]],
    ["Abendhimmel (blau)", [0.84, 0.94, 1.2]]
  ];
  for (const [name, [fr, fg, fb]] of stiche) {
    const { bild } = baueGesicht();
    for (let i = 0; i < bild.data.length; i += 4) {
      bild.data[i] = Math.min(255, bild.data[i] * fr);
      bild.data[i + 1] = Math.min(255, bild.data[i + 1] * fg);
      bild.data[i + 2] = Math.min(255, bild.data[i + 2] * fb);
    }
    const ergebnis = pruefeAufnahme(bild, OVAL);
    assert.equal(ergebnis.bereit, true,
      `"${name}" wurde abgelehnt (${ergebnis.hinweis})`);
  }
});

test("eine grobere Rasterung findet dasselbe Gesicht", () => {
  // Waehrend der Vorschau laeuft die Pruefung mit halber Aufloesung und
  // uebersprungenen Bildpunkten, damit das Bild nicht ruckelt. Das darf am
  // Ergebnis nichts aendern.
  const { bild } = baueGesicht();
  const fein = pruefeAufnahme(bild, OVAL);
  const grob = pruefeAufnahme(bild, OVAL, null, { rasterBreite: 64, schritt: 2 });

  assert.equal(grob.bereit, fein.bereit,
    "Die grobe Pruefung kommt zu einem anderen Schluss als die feine");
  const abweichung = Math.abs(grob.messwerte.breiteAnteil - fein.messwerte.breiteAnteil);
  assert.ok(abweichung < 0.08,
    `Die Gesichtsbreite weicht um ${abweichung.toFixed(3)} ab`);
});

test("aus dem Oval allein entstehen brauchbare Punkte", async () => {
  // Der letzte Rueckfall: Findet die Erkennung nichts und der Besucher loest
  // von Hand aus, wird das Oval als Gesicht angenommen. Ungenauer, aber ein
  // Ergebnis - ein Trichter, der hier nichts liefert, hat den Kunden verloren.
  const { punkteAusOval } = await import("../apps/lifeskin/lifeskin-face.js");
  const punkte = punkteAusOval(OVAL);
  const zonen = zonenAusPunkten(punkte);
  for (const name of ["stirn", "nase", "wangeLinks", "wangeRechts", "kinn"]) {
    assert.ok(zonen[name].w > 4 && zonen[name].h > 4, `Zone unbrauchbar: ${name}`);
  }
  // Und sie liegen innerhalb des Ovals, nicht daneben.
  assert.ok(zonen.stirn.y >= OVAL.y - 1, "Die Stirn liegt ueber dem Oval");
  assert.ok(zonen.kinn.y + zonen.kinn.h <= OVAL.y + OVAL.h + 1, "Das Kinn liegt unter dem Oval");
});
