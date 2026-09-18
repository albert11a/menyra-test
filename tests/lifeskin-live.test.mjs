import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  baueLive, baueLiveReihe, istGeradeAktiv,
  LIVE_ANALYSE_PUNKTE, LIVE_BESTELL_PUNKTE, LIVE_FENSTER_MS
} from "../apps/mnyra-heart/heart-lifeskin-live.js";
import { normalisiere } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(wurzel, p), "utf8");

const JETZT = Date.parse("2026-09-18T12:00:00.000Z");
const vor = (ms) => new Date(JETZT - ms).toISOString();

function sitzung(step, { alterMs = 5000, ...rest } = {}) {
  return normalisiere(`s-${step}-${alterMs}-${Math.random()}`, {
    createdAt: vor(alterMs + 60000), updatedAt: vor(alterMs), step, ...rest
  });
}

// DER UNTERSCHIED ZUM TRICHTER IST DIE RECHNUNG, NICHT DIE ZEIT.
//
// Der Trichter zaehlt kumulativ - wer bestellt hat, steht in jeder Stufe
// davor. Hier steht jeder in GENAU EINEM Punkt: dort, wo er gerade ist.
// Sonst leuchteten beim ersten Besucher alle Punkte gleichzeitig, und die
// Reihe saehe immer gleich aus.

test("jeder steht in genau einem Punkt - dort, wo er gerade ist", () => {
  const live = baueLive([
    sitzung("opened"),
    sitzung("camera"),
    sitzung("pyetja3"),
    sitzung("result")
  ], JETZT);

  const zahlen = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { start: 1, skanimi: 1, pyetjet: 1, pritja: 1 });
  assert.equal(live.analysen.gesamt, 4);
});

test("wer bei der vierten Frage steht, leuchtet NICHT auch bei der Kamera", () => {
  // Genau das waere passiert, haette die Live-Reihe wie der Trichter
  // gerechnet - und dann sagte sie nichts ueber "wo steckt er gerade".
  const live = baueLive([sitzung("numri")], JETZT);
  const zahlen = Object.fromEntries(live.analysen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { start: 0, skanimi: 0, pyetjet: 1, pritja: 0 });
});

test("ein Punkt leuchtet nur, wenn dort wirklich jemand steht", () => {
  const live = baueLive([sitzung("camera")], JETZT);
  const an = live.analysen.punkte.filter((p) => p.aktiv).map((p) => p.id);
  assert.deepEqual(an, ["skanimi"], "Es leuchtet mehr als der eine Punkt");
  // Und die Bestellreihe ist dabei still.
  assert.equal(live.bestellungen.gesamt, 0);
  assert.ok(!live.bestellungen.punkte.some((p) => p.aktiv));
});

// WAS NICHT VON SELBST KOMMT, IST DAS VERSCHWINDEN.
//
// Wer aufhoert, schreibt nichts mehr. Ohne ein Zeitfenster bliebe sein
// Punkt stehen, bis irgendwann irgendwer etwas anderes tut - und die Reihe
// zeigte Leute, die laengst weg sind.
test("wer laenger nichts getan hat, faellt aus der Reihe", () => {
  const gerade = baueLive([sitzung("camera", { alterMs: 30 * 1000 })], JETZT);
  assert.equal(gerade.analysen.gesamt, 1);

  const laengstWeg = baueLive([sitzung("camera", { alterMs: LIVE_FENSTER_MS + 1000 })], JETZT);
  assert.equal(laengstWeg.analysen.gesamt, 0, "Ein alter Lauf steht noch in der Reihe");
});

test("das Fenster traegt den laengsten Bildschirm", () => {
  // Die Aufnahme dauert: Wer den Ring dreht, schreibt in dieser Zeit
  // nichts. Waere das Fenster enger als der Bildschirm, verschwaende er
  // mitten dabei.
  assert.ok(LIVE_FENSTER_MS >= 120000, "Das Fenster ist kuerzer als eine Aufnahme dauert");
  assert.ok(istGeradeAktiv({ updatedAt: vor(110 * 1000) }, JETZT));
});

test("eine Uhr, die vorgeht, macht keine ewig aktive Sitzung", () => {
  // Der Zeitstempel kommt vom Geraet des Besuchers. Geht dessen Uhr eine
  // Stunde vor, stuende er sonst fuer immer in der Reihe.
  assert.equal(istGeradeAktiv({ updatedAt: new Date(JETZT + 3600000).toISOString() }, JETZT), false);
  // Ein paar Sekunden Abweichung sind dagegen normal und zaehlen mit.
  assert.equal(istGeradeAktiv({ updatedAt: new Date(JETZT + 5000).toISOString() }, JETZT), true);
});

test("ohne Zeitstempel steht niemand in der Reihe", () => {
  assert.equal(istGeradeAktiv({}, JETZT), false);
  assert.equal(istGeradeAktiv(null, JETZT), false);
  assert.equal(baueLive(null, JETZT).analysen.gesamt, 0);
  assert.equal(baueLive([{}], JETZT).analysen.gesamt, 0);
});

// ---------- Die zweite Reihe ----------

test("die Bestellreihe zaehlt die drei Schritte vor dem Geld", () => {
  const live = baueLive([
    sitzung("offer"),
    sitzung("address"),
    sitzung("ordered"),
    // Und einer, der noch gar nicht so weit ist - er gehoert nicht dazu.
    sitzung("pyetja1")
  ], JETZT);

  const zahlen = Object.fromEntries(live.bestellungen.punkte.map((p) => [p.id, p.anzahl]));
  assert.deepEqual(zahlen, { kasse: 1, anschrift: 1, bestellt: 1 });
  assert.equal(live.bestellungen.gesamt, 3);
  // Der bei Frage 1 steht in der anderen Reihe.
  assert.equal(live.analysen.gesamt, 1);
});

test("der Bestellschirm zaehlt auch ueber seine Marke", () => {
  // Er schreibt keinen eigenen Schritt, sondern kasseGeoeffnet. Ohne das
  // stuende niemand je im ersten Punkt der Bestellreihe.
  const kasse = LIVE_BESTELL_PUNKTE.find((p) => p.id === "kasse");
  assert.equal(kasse.marke, "kasseGeoeffnet");
  const live = baueLive([sitzung("result", { kasseGeoeffnet: true })], JETZT);
  assert.equal(live.bestellungen.punkte[0].anzahl, 1);
});

// ---------- Der Chip ----------

test("im Chip steht die Zahl aller gerade Aktiven", () => {
  // "So weiss ich, aha, da tut sich grad was." Eine Null heisst ruhig,
  // eine Eins heisst: jemand ist dabei.
  assert.equal(baueLive([], JETZT).analysen.gesamt, 0);
  assert.equal(baueLive([sitzung("camera"), sitzung("emri")], JETZT).analysen.gesamt, 2);

  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /id: "analysen", label: "Live-Analysen", anzahl: live\?\.analysen\?\.gesamt/);
  assert.match(render, /id: "bestellungen", label: "Live-Bestellungen", anzahl: live\?\.bestellungen\?\.gesamt/);
});

// ---------- Die Reihe auf dem Bildschirm ----------

test("die Punkte haengen an Strichen und leuchten nur, wenn jemand da ist", () => {
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  // Zwischen den Punkten ein Strich, aber nicht vor dem ersten.
  assert.match(render, /\$\{i > 0 \? `<span class="heart-live__strich/);
  assert.match(render, /heart-live__punkt\$\{p\.aktiv \? " heart-live__punkt--an" : ""\}/);

  const css = lies("apps/mnyra-heart/heart.css");
  assert.match(css, /\.heart-live__punkt--an\{?[\s\S]{0,200}animation: heart-live-puls/,
    "Ein aktiver Punkt pulsiert nicht");
  assert.match(css, /@keyframes heart-live-puls/);
  // Wer Bewegung abbestellt hat, sieht den Punkt trotzdem - nur ohne Puls.
  assert.match(css, /prefers-reduced-motion[\s\S]{0,300}\.heart-live__punkt--an \{ animation: none/);
});

test("die Reihe ist auch fuer Vorleseprogramme lesbar", () => {
  // Punkte auf einer Linie sind ein Bild. Ohne Beschriftung waeren sie
  // fuer den, der sie nicht sieht, gar nichts.
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /role="img" aria-label="\$\{escapeHtml\(punkte\.map/);
});

// ---------- Live heisst live ----------

test("die Ansicht haengt an einem Zuhoerer, nicht an einer Nachfrage", () => {
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  assert.match(adapter, /export function horcheLive\(/);
  assert.match(adapter, /abmelden = onSnapshot\(abfrage,/,
    "Die Live-Ansicht fragt nach, statt zuzuhoeren");
  // Und sie holt nur den Ausschnitt, nicht die ganze Sammlung: Ein
  // Zuhoerer auf dreitausend Sitzungen laedt beim Anmelden dreitausend
  // Dokumente und rechnet bei jeder Aenderung alles neu.
  assert.match(adapter, /where\("updatedAt", ">=", seit\)/);
  assert.doesNotMatch(adapter, /limit\(300\)/);
  // Ein Fehler darf Heart nicht anhalten - die Zahlen darunter kommen aus
  // einer eigenen Abfrage.
  assert.match(adapter, /beiAenderung\(null\);/);
});

test("der Takt raeumt weg, was der Zuhoerer nicht meldet", () => {
  // Wer aufhoert, schreibt nichts mehr - Firestore meldet also nichts.
  // Ohne eigenen Takt bliebe sein Punkt stehen.
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /liveTakt = globalThis\.setInterval\(liveRechnen, 1000\)/,
    "Die Reihe rechnet nicht von selbst nach");
  // Aber nur zeichnen, wenn sich etwas geaendert hat: Ein Zustandswechsel
  // je Sekunde zeichnete den ganzen Bereich neu.
  assert.match(heart, /if \(gleich\) return;/,
    "Die Reihe zeichnet jede Sekunde neu, auch wenn nichts passiert ist");
  // Und beim Verlassen abmelden.
  assert.match(heart, /export function liveAnhalten\(\)/);
  assert.match(heart, /globalThis\.clearInterval\(liveTakt\)/);
});

test("die vier Punkte sind die vier Abschnitte des Wegs", () => {
  assert.deepEqual(LIVE_ANALYSE_PUNKTE.map((p) => p.id),
    ["start", "skanimi", "pyetjet", "pritja"]);
  // Jeder Schritt des Trichters liegt in genau einem Punkt - sonst faellt
  // jemand aus der Reihe, ohne dass es auffaellt.
  const alle = LIVE_ANALYSE_PUNKTE.flatMap((p) => p.schritte);
  assert.equal(new Set(alle).size, alle.length, "Ein Schritt steht in zwei Punkten");
  for (const schritt of ["opened", "named", "camera", "captured",
    "pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "numri", "aufbereitung", "result"]) {
    assert.ok(alle.includes(schritt), `Der Schritt ${schritt} liegt in keinem Punkt`);
  }
});
