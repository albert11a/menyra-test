// Warum die Kamera manchmal "sehr verspaetet" startete.
//
// DER FALL AUS DEM BETRIEB, nachgestellt und gemessen: Auf dem Geraet lief
// die Kamera bereits - der gruene Punkt stand in der Statusleiste, das
// Videoelement lieferte Bilder -, aber der Trichter stand hinter
// `await video.play()`. Auf iOS bleibt dieses Versprechen gelegentlich
// offen. Sichtbar war davon: ein leerer Kreis, keine Zeile darunter, kein
// Ring. Nach achtzehn Sekunden stand der Schritt immer noch auf "camera",
// und kein einziges Foto ging hoch.
//
// Im Browser nachgestellt (play() antwortet nie):
//   vorher  nach 2 s: kein Hinweis, data-bereit="nein"  - nach 18 s: nichts
//   nachher nach 2 s: Bild da, Hinweis da               - Scan laeuft durch

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { OBERFLAECHE } from "../apps/lifeskin/lifeskin-content.js";
import { ohneKommentare, methode } from "./lifeskin-quelle.mjs";

const APP = ohneKommentare(fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-app.js"), "utf8"));
const START = methode(APP, "#kameraStarten");

test("der Trichter wartet nicht auf das Abspielen", () => {
  // Das ist die Zeile, die den Bildschirm angehalten hat.
  assert.ok(!/await\s+video\.play\(\)/.test(START),
    "Der Ablauf haengt wieder am Versprechen von play()");
  assert.match(START, /await this\.#abspielen\(video\)/,
    "Das Abspielen wird nicht mehr angestossen");
});

test("das Anstossen hat eine Frist und meldet keinen Kamerafehler", () => {
  const abspielen = methode(APP, "#abspielen");
  assert.match(abspielen, /Promise\.race/, "Es wird wieder unbegrenzt gewartet");
  assert.match(abspielen, /fristMs/, "Es gibt keine Frist");
  // Ein abgelehntes play() ist kein Kamerafehler: Der Strom steht schon.
  assert.ok(!abspielen.includes("fehlerKamera"),
    "Ein abgelehntes play() schickt den Kunden in den Fehlerbildschirm");
});

test("kommt kein Bild, wird noch einmal angestossen - und irgendwann Schluss", () => {
  const waechter = methode(APP, "#abspielWaechter");
  assert.match(waechter, /videoWidth > 0 && !video\.paused/,
    "Der Waechter erkennt nicht, ob wirklich Bilder fliessen");
  assert.match(waechter, /versuche > 10/, "Der Waechter laeuft ohne Ende");
  assert.match(waechter, /clearInterval/, "Der Waechter hoert nie auf");
  // Und er haengt nicht am naechsten Anlauf weiter.
  assert.match(methode(APP, "#kameraStoppen"), /clearInterval\(this\.kamera\.abspielTakt\)/,
    "Der Waechter laeuft nach dem Stoppen weiter");
});

test("die Seite sagt sofort, dass die Kamera aufgeht", () => {
  // Zwischen dem Tippen und dem ersten Bild liegen die Systemfrage und das
  // Aufwachen der Kamera. Ohne ein Wort ist das ein leerer Kreis auf einer
  // leeren Seite - und das sieht nicht nach "laedt" aus, sondern nach
  // kaputt.
  const vorGetUserMedia = START.slice(0, START.indexOf("getUserMedia"));
  assert.match(vorGetUserMedia, /#ls-kamerahinweis.*kameraOeffnet/s,
    "Der Hinweis kommt erst, wenn das Bild schon da ist");
  assert.ok(OBERFLAECHE.kameraOeffnet?.sq, "Der Satz fehlt auf Albanisch");
  assert.ok(OBERFLAECHE.kameraOeffnet?.de, "Der Satz fehlt auf Deutsch");
});
