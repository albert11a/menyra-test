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
const HTML = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/index.html"), "utf8");
const CSS = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-styles.css"), "utf8");
const START = methode(APP, "#kameraStarten");

test("der Trichter wartet nicht auf das Abspielen", () => {
  // Das ist die Zeile, die den Bildschirm angehalten hat.
  assert.ok(!/await\s+video\.play\(\)/.test(START),
    "Der Ablauf haengt wieder am Versprechen von play()");
  // Angestossen wird weiter - ohne play() faengt auf manchen Geraeten gar
  // nichts an.
  assert.match(START, /this\.#abspielen\(video\);/,
    "Das Abspielen wird nicht mehr angestossen");
  // ABER NICHT MEHR ABGEWARTET. Sonst laufen zwei Wartezeiten
  // hintereinander fuer einen Vorgang: erst die Frist in #abspielen, dann
  // das Pollen in #videoBereit. Bleibt play() auf iOS offen, waren das
  // 1200 ms leerer Kreis, obwohl der Strom schon stand.
  assert.ok(!/await this\.#abspielen\(/.test(START),
    "Auf das Abspielen wird wieder gewartet, bevor ueberhaupt jemand auf das Bild sieht");
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

// ---------------------------------------------------------------------------
// Die neun Sekunden, in denen nichts geschah
// ---------------------------------------------------------------------------
//
// GEMESSEN, NICHT GESCHAETZT, mit einem Gesichtsnetz, das sechs Sekunden
// braucht (langsames Mobilnetz, 6,7 MB):
//
//   vorher  Bild 0,45 s - Fuehrung erst 6,0 s - Aufnahme fertig 8,6 s
//   jetzt   Bild 0,45 s - Fuehrung 0,48 s     - Aufnahme fertig 5,7 s
//
// Der Unterschied ist nicht nur die Zeit: Vorher stand der Bildschirm
// still, und ein Bildschirm, auf dem nichts geschieht, fuehlt sich laenger
// an als er ist.

test("der Trichter wartet nicht auf das Gesichtsnetz, er fuehrt schon", () => {
  assert.ok(!/await netzHolen/.test(START),
    "Der Bildschirm steht wieder still, bis das Netz da ist");
  // Gefuehrt wird sofort - mit dem Weg, der ohne Netz auskommt.
  const vorNetz = START.slice(0, START.indexOf("netzHolen"));
  assert.match(vorNetz, /this\.#rueckfallschleife\(\)/,
    "Vor dem Netz passiert nichts");
  // Und kommt es an, uebernimmt der Ring.
  assert.match(START, /netzHolen\([^)]*\)\.then/, "Das Netz wird nicht mehr abgeholt");
  assert.match(START, /this\.kamera\.modus = "ring"[\s\S]{0,200}#ringschleife\(\)/,
    "Der Ring uebernimmt nicht, wenn das Netz ankommt");
});

test("es laeuft immer nur ein Aufnahmeweg", () => {
  // Zwei Wege gleichzeitig waeren zwei Messungen desselben Gesichts, die
  // einander ueberschreiben.
  assert.match(methode(APP, "#ringschleife"), /this\.kamera\.modus !== "ring"/,
    "Der Ring laeuft weiter, auch wenn er nicht dran ist");
  assert.match(methode(APP, "#rueckfallschleife"), /this\.kamera\.modus !== "rueckfall"/,
    "Der Weg ohne Netz laeuft weiter, auch wenn der Ring uebernommen hat");
  assert.match(START, /if \(this\.kamera\.modus !== "rueckfall"\) return;/,
    "Der Ring uebernimmt auch mitten in einer laufenden Aufnahme");
});

test("aufgenommen wird erst, wenn feststeht, ob das Netz kommt", () => {
  // Sonst waere der Scan nach drei Sekunden vorbei - mit drei geraden
  // Bildern -, obwohl der Ring eine Sekunde spaeter haette laufen koennen.
  assert.match(methode(APP, "#rueckfallschleife"),
    /!this\.kamera\.netzWartet && Date\.now\(\) - seit >= 3000/,
    "Der Weg ohne Netz nimmt auf, waehrend das Netz noch unterwegs ist");
});

// ---------------------------------------------------------------------------
// Der leere Kreis
// ---------------------------------------------------------------------------
//
// Was der Besucher zwischen "Kamera oeffnen" und dem ersten Bild sah: eine
// gleichmaessige helle Flaeche, vollkommen still. Die unterscheidet sich in
// nichts von einer haengengebliebenen Seite - und genau hier springen die
// Leute ab.

test("solange kein Bild da ist, dreht sich etwas im Kreis", () => {
  assert.match(HTML, /<div class="ls-kamera__laedt"[^>]*aria-hidden="true"><\/div>/,
    "Im Kreis fehlt das Zeichen, dass noch geladen wird");
  // Es liegt IM Kreis und nicht daneben: Dort schaut hin, wer wartet.
  const kreis = HTML.slice(HTML.indexOf('class="ls-kamera__kreis"'));
  assert.ok(kreis.indexOf("ls-kamera__laedt") < kreis.indexOf("</div>"),
    "Das Ladezeichen liegt ausserhalb des Kreises");
  assert.match(CSS, /@keyframes ls-kreiselt/, "Das Ladezeichen bewegt sich nicht");
  assert.match(CSS, /\.ls-kamera\[data-bereit="ja"\] \.ls-kamera__laedt \{ opacity: 0; \}/,
    "Das Ladezeichen bleibt stehen, wenn das Bild da ist");
  // Ganz abschalten ist hier falsch: Ohne jede Bewegung steht wieder die
  // stille Flaeche da, und die war das Problem.
  const ruhe = CSS.slice(CSS.indexOf("prefers-reduced-motion"));
  assert.ok(/ls-kamera__laedt::before \{ animation-duration/.test(CSS),
    "Bei abgeschalteter Bewegung fehlt die langsame Fassung");
  assert.ok(ruhe.length > 0);
});

test("das Bild kommt beim ersten Einzelbild, nicht erst wenn die Breite ruhig ist", () => {
  // Zwei verschiedene Fragen, die hier eine waren: "darf man zeigen" haengt
  // an videoWidth > 0, "darf man messen" an der ruhigen Breite. Gewartet
  // wurde auf die zweite - bis zu zwei Sekunden leerer Kreis, obwohl das
  // Bild laengst richtig dagestanden haette.
  const bereit = methode(APP, "#videoBereit");
  const schleife = bereit.slice(bereit.indexOf("while ("));
  const zeigen = schleife.indexOf("zeigen()");
  const ruhig = schleife.indexOf("ruhigSeit");
  assert.ok(zeigen > 0, "In der Schleife wird das Bild nie eingeblendet");
  assert.ok(zeigen < ruhig,
    "Eingeblendet wird erst nach der Ruhezeit - das ist der leere Kreis von vorher");
  // Und nach der Frist trotzdem, wie vorher.
  assert.match(bereit.slice(bereit.indexOf("}", schleife.length)), /zeigen\(\)/,
    "Nach der Frist bleibt der Kreis leer");
});
