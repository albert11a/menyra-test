// Der Ring ging zu, und es lag EIN Foto da.
//
// DER FALL AUS DEM BETRIEB, in Firestore nachgesehen:
//
//   erstellt              fotos views ring ausschlag  blicke
//   2026-09-16T00:44:08     9    11    1      2.54    gerade,gerade-2,…,oben
//   2026-09-16T06:37:21     1     3    1      2.53    links
//   2026-09-16T06:42:43     1     2    1      3.17    rechts
//   2026-09-16T06:48:47     7    10    1      4.35    gerade,gerade-2,…,oben
//
// Derselbe Code, dieselbe Kamera, viermal - und zweimal kam ein einziges
// Bild an, ohne frontales. Der Ring stand dabei jedes Mal auf 1: vollstaendig
// geschlossen. Die Aerztin bekam einen Fall mit einem Foto von der Seite.
//
// DER GRUND IST EINE VERWECHSLUNG: Der Ring zaehlt KOPFHALTUNGEN, nicht
// BILDER. Acht Sektoren zu 45 Grad, aber nur drei Blickrichtungen mit je
// 45 Grad Toleranz - Sektor 3 und 4 (Kopf nach unten) gehoeren zu keiner.
// Dort liefert #blickAus() nichts, der Sektor gilt trotzdem als abgedeckt.
// Dasselbe bei frontalGenommen: gesetzt wird es, ob das Bild abgelegt wurde
// oder nicht. Wer den Kopf in einem zuegigen Schwung herumzieht, schliesst
// alle acht Sektoren in zwei Sekunden - und nur einer davon faellt in eine
// Blickrichtung.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { Ringlauf, SEKTOREN, POSE_GRENZEN } from "../apps/lifeskin/lifeskin-pose.js";
import { ohneKommentare, methode } from "./lifeskin-quelle.mjs";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const APP = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));

// ---------------------------------------------------------------------------
// Der Ring kann wieder aufgehen
// ---------------------------------------------------------------------------

test("ein Abschnitt ohne Bild laesst sich wieder oeffnen", () => {
  const ring = new Ringlauf();
  ring.abgedeckt.fill(true);
  ring.frontalGenommen = true;
  assert.equal(ring.anteil, 1);
  assert.equal(ring.fertigBei(), true, "Vorbedingung: der Ring gilt als fertig");

  ring.wiederOeffnen([1, 2]);
  assert.deepEqual([ring.abgedeckt[1], ring.abgedeckt[2]], [false, false]);
  assert.equal(ring.anteil, 6 / SEKTOREN, "Der Anteil folgt der Oeffnung nicht");
  assert.equal(ring.fertigBei(), false, "Der Ring gilt weiter als fertig");
  // Und die Fuehrung zeigt wieder dorthin - ohne dass es einen zweiten
  // Anzeigeweg braucht.
  assert.ok([1, 2].includes(ring.zielSektor(0)), "Die Fuehrung zeigt nicht auf die Luecke");
});

test("das frontale Bild laesst sich einzeln nachfordern", () => {
  const ring = new Ringlauf();
  ring.abgedeckt.fill(true);
  ring.frontalGenommen = true;
  ring.wiederOeffnen([], { frontal: true });
  assert.equal(ring.frontalGenommen, false);
  assert.equal(ring.anteil, 1, "Die Sektoren wurden mit aufgemacht");
  assert.equal(ring.fertigBei(), false, "Ohne frontales Bild gilt der Ring als fertig");
});

test("die Haltezaehler gehen mit auf", () => {
  // Bleibt der Zaehler stehen, gilt der Sektor beim naechsten Bild sofort
  // wieder als abgedeckt - dann waere das Aufmachen eine Geste ohne Wirkung.
  const ring = new Ringlauf();
  ring.abgedeckt.fill(true);
  ring.halten.fill(POSE_GRENZEN.haltebilder + 5);
  ring.wiederOeffnen([3]);
  assert.equal(ring.halten[3], 0, "Der Haltezaehler bleibt stehen");
});

test("Unsinn macht den Ring nicht kaputt", () => {
  const ring = new Ringlauf();
  ring.abgedeckt.fill(true);
  ring.wiederOeffnen([-1, 99, 1.5, null, "2"]);
  assert.equal(ring.anteil, 1, "Eine unmoegliche Sektornummer hat etwas aufgemacht");
  ring.wiederOeffnen();
  assert.equal(ring.anteil, 1);
});

// ---------------------------------------------------------------------------
// Der Scan endet nicht mehr ohne Bilder
// ---------------------------------------------------------------------------

test("der Abschluss haengt an den Bildern, nicht nur am Ring", () => {
  // Das ist die Zeile, an der zwei Faelle mit einem Foto herausgefallen sind.
  const schleife = methode(APP, "#ringschleife");
  assert.match(schleife, /if \(stand\.fertig && this\.#abschlussReif\(jetzt\)\) \{ this\.#ringAbschluss\(\); return; \}/,
    "Der Scan endet wieder, sobald der Ring zu ist - ohne zu fragen, ob Bilder da sind");
  assert.ok(!/if \(stand\.fertig\) \{ this\.#ringAbschluss/.test(schleife),
    "Der alte, ungepruefte Abschluss steht noch da");
});

test("gezaehlt werden Bilder, nicht Schluessel", () => {
  // #fotoMerken() legt den Platz an, BEVOR feststeht, ob das Bild genommen
  // wird. Ueber Object.keys gezaehlt waere ein leerer Platz ein Bild - und
  // der Scan endete wieder zu frueh, nur diesmal unsichtbar.
  const fehlend = methode(APP, "#fehlendeBlicke");
  assert.match(fehlend, /platz\.erste \|\| \(platz\.mehr \|\| \[\]\)\.length/,
    "Es wird nicht geprueft, ob wirklich ein Bild im Platz liegt");
  assert.ok(!/Object\.keys\(this\.kamera\.fotos/.test(fehlend),
    "Gezaehlt werden die Schluessel statt der Bilder");
});

test("es wird zweimal nachgefordert, dann ist Schluss", () => {
  // Ohne Deckel liefe der Ring endlos weiter auf: Sektor 3 und 4 koennen
  // ueberhaupt kein Bild liefern, und wer sie nicht verlaesst, kaeme nie
  // durch.
  const reif = methode(APP, "#abschlussReif");
  assert.match(reif, /NACHFORDERN_HOECHSTENS/, "Es gibt keinen Deckel");
  assert.match(reif, /AUFNAHME_FRIST_MS/, "Es gibt keine Frist");
  assert.match(reif, /if \(!fehlend\.length\) return true;/,
    "Auch mit allen Bildern wird noch nachgefordert");
  // Die Frist rechnet ab dem Beginn des Rings und nicht ab dem Nachfordern -
  // sonst verlaengerte jede Runde die Frist.
  assert.match(reif, /this\.kamera\.ring\?\.begonnen/, "Die Frist haengt an der falschen Uhr");

  const quelle = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));
  const frist = Number(quelle.match(/const AUFNAHME_FRIST_MS = (\d+)/)[1]);
  assert.ok(frist >= POSE_GRENZEN.zweiteLockerungAbMs * 2,
    `Die Frist (${frist}) laeuft ab, bevor die zweite Lockerung (${POSE_GRENZEN.zweiteLockerungAbMs}) wirken konnte`);
  assert.ok(frist <= 60000, `Die Frist (${frist}) haelt den Kunden zu lange fest`);
});

test("der Zaehler faengt bei jeder Kamera neu an", () => {
  // Sonst waere der zweite Anlauf nach einem Abbruch sofort verbraucht.
  assert.match(methode(APP, "#kameraStarten"), /this\.kamera\.nachgefordert = 0;/,
    "Der Zaehler laeuft ueber zwei Anlaeufe weiter");
});

// ---------------------------------------------------------------------------
// Nachgefordert wird nur, wo es ein Bild geben KANN
// ---------------------------------------------------------------------------

test("die Sektoren je Blickrichtung werden gerechnet, nicht abgeschrieben", () => {
  // Wer eine Blickrichtung verschiebt oder die Toleranz aendert, verschiebt
  // die Tabelle mit. Abgeschrieben waere sie beim ersten solchen Eingriff
  // still falsch - und dann forderte der Ring Bilder aus Sektoren nach, in
  // denen es keine geben kann.
  const quelle = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));
  const block = quelle.slice(quelle.indexOf("const BLICK_SEKTOREN"), quelle.indexOf("const NOETIGE_BLICKE"));
  assert.match(block, /FOTO_BLICKE\.map/, "Die Tabelle steht fest statt gerechnet zu werden");
  assert.match(block, /FOTO_TOLERANZ/, "Die Toleranz geht nicht in die Rechnung ein");

  // Und die Rechnung ergibt, was sie ergeben muss - hier nachgerechnet mit
  // denselben Zahlen wie im Aufbau.
  const tol = Math.PI / 4;
  const blicke = [["rechts", Math.PI / 2], ["links", (Math.PI * 3) / 2], ["oben", 0]];
  const tabelle = Object.fromEntries(blicke.map(([name, winkel]) => {
    const breite = (Math.PI * 2) / SEKTOREN;
    const raus = [];
    for (let s = 0; s < SEKTOREN; s += 1) {
      let a = Math.abs((s + 0.5) * breite - winkel) % (Math.PI * 2);
      if (a > Math.PI) a = Math.PI * 2 - a;
      if (a <= tol) raus.push(s);
    }
    return [name, raus];
  }));
  assert.deepEqual(tabelle, { rechts: [1, 2], links: [5, 6], oben: [0, 7] });
  const belegt = new Set(Object.values(tabelle).flat());
  assert.deepEqual([...Array(SEKTOREN).keys()].filter((s) => !belegt.has(s)), [3, 4],
    "Es sind nicht mehr genau Sektor 3 und 4, die kein Bild liefern koennen");
});

test("nachgefordert wird gerade, rechts und links - oben ist Zugabe", () => {
  const quelle = ohneKommentare(lies("apps/lifeskin/lifeskin-app.js"));
  const noetig = quelle.match(/const NOETIGE_BLICKE = Object\.freeze\(\[([^\]]*)\]\)/)[1];
  assert.match(noetig, /"gerade"/);
  assert.match(noetig, /"rechts"/);
  assert.match(noetig, /"links"/);
  assert.ok(!/"oben"/.test(noetig),
    "Die Aufsicht wird verlangt - die bekommt nicht jeder hin, und der Scan haengt daran");

  // "gerade" hat keinen Sektor: Es wird ueber frontal nachgefordert.
  const nach = methode(APP, "#blickeNachfordern");
  assert.match(nach, /if \(blick === "gerade"\) \{ frontal = true; continue; \}/,
    "Fuer das frontale Bild werden Sektoren aufgemacht, die es nicht gibt");
  assert.match(nach, /ring\.wiederOeffnen\(sektoren, \{ frontal \}\)/);
});
