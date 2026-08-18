import assert from "node:assert/strict";
import test from "node:test";

import {
  GO_DEFAULT_TIME_ZONE,
  buildGoWindow,
  formatGoClock,
  intersectGoWindows,
  isWithinGoWindows,
  mergeGoWindows,
  parseGoClockMinutes,
  resolveGoLocalTime,
  toGoMillis
} from "../shared/go/go-time-core.js";
import {
  parseGoOpeningHours,
  readGoOpeningWindows
} from "../shared/go/go-opening-hours-core.js";

// ===========================================================================
// Die Uhr des Lokals, nicht die des Telefons.
//
// Ein Gast kann mit einer Uhr auf Zuerich, London oder gar nicht gestellter
// Zeitzone in Prishtina stehen. Wenn GO danach rechnet, waere ein Lokal fuer
// diesen Gast zwei Stunden zu frueh geschlossen. Deshalb geht jede Rechnung
// ueber die Zone des Lokals.
// ===========================================================================

test("a moment becomes the local view of the venue", () => {
  // 17:00 UTC im August ist 19:00 in Prishtina (UTC+2).
  const local = resolveGoLocalTime("2026-08-15T17:00:00.000Z", GO_DEFAULT_TIME_ZONE);
  assert.equal(local.dayKey, "2026-08-15");
  assert.equal(local.weekday, "sat");
  assert.equal(local.minutes, 19 * 60);
});

test("the same moment in winter keeps the venue's own hour", () => {
  // Im Januar gilt UTC+1 - dieselbe UTC-Zeit ist dann 18:00 vor Ort.
  const local = resolveGoLocalTime("2026-01-15T17:00:00.000Z", GO_DEFAULT_TIME_ZONE);
  assert.equal(local.minutes, 18 * 60);
  assert.equal(local.weekday, "thu");
});

test("an unknown zone falls back instead of throwing", () => {
  // Eine kaputte Zonenangabe im Profil darf keine Suche abbrechen.
  const local = resolveGoLocalTime("2026-08-15T17:00:00.000Z", "Mars/Olympus");
  assert.equal(local.dayKey, "2026-08-15");
  assert.equal(local.minutes, 19 * 60);
});

test("clock text is read the way people type it", () => {
  assert.equal(parseGoClockMinutes("14:00"), 840);
  assert.equal(parseGoClockMinutes("14.00"), 840);
  assert.equal(parseGoClockMinutes("9"), 540);
  assert.equal(parseGoClockMinutes(""), -1);
  assert.equal(parseGoClockMinutes("25:00"), -1);
  assert.equal(formatGoClock(840), "14:00");
});

test("a window past midnight ends on the next day, not yesterday", () => {
  // Ein Lokal mit 20:00-02:00 ist um ein Uhr nachts offen. Wuerde das Fenster
  // verworfen, weil das Ende kleiner als der Anfang ist, waere es das nicht.
  const window = buildGoWindow("20:00", "02:00");
  assert.deepEqual(window, { start: 1200, end: 1560 });
  assert.equal(isWithinGoWindows(60, [window]), true);
  assert.equal(isWithinGoWindows(19 * 60, [window]), false);
});

test("overlapping windows collapse into one", () => {
  const merged = mergeGoWindows([
    { start: 660, end: 900 },
    { start: 720, end: 1380 }
  ]);
  assert.deepEqual(merged, [{ start: 660, end: 1380 }]);
});

// ===========================================================================
// Punkt 18: Die Oeffnungszeit steht ueber dem Plan des Angebots.
// ===========================================================================

test("the venue's closing time cuts the offer window", () => {
  // Angebot 14:00-23:00, Lokal schliesst 22:00 - uebrig bleibt 14:00-22:00.
  const result = intersectGoWindows(
    [{ start: 840, end: 1380 }],
    [{ start: 660, end: 1320 }]
  );
  assert.deepEqual(result, [{ start: 840, end: 1320 }]);
  assert.equal(isWithinGoWindows(1350, result), false);
});

test("free text opening hours are read as day windows", () => {
  const parsed = parseGoOpeningHours("Hene - Diel: 11:00 - 22:00");
  assert.equal(parsed.hasData, true);
  assert.deepEqual(parsed.byDay.mon, [{ start: 660, end: 1320 }]);
  assert.deepEqual(parsed.byDay.sun, [{ start: 660, end: 1320 }]);
});

test("a range across the weekend wraps around", () => {
  const parsed = parseGoOpeningHours("Premte - Hene: 10:00 - 23:00");
  assert.equal(parsed.byDay.fri.length, 1);
  assert.equal(parsed.byDay.sat.length, 1);
  assert.equal(parsed.byDay.sun.length, 1);
  assert.equal(parsed.byDay.mon.length, 1);
  // Dienstag bleibt unberuehrt - "Premte - Hene" sind vier Tage, nicht sieben.
  assert.equal(parsed.byDay.tue.length, 0);
});

test("several segments and a closing day live side by side", () => {
  const parsed = parseGoOpeningHours("Hene-Enjte: 11:00-22:00; Premte: 11:00-24:00; Diel: mbyllur");
  assert.deepEqual(parsed.byDay.mon, [{ start: 660, end: 1320 }]);
  assert.deepEqual(parsed.byDay.fri, [{ start: 660, end: 1440 }]);
  assert.deepEqual(parsed.byDay.sun, []);
});

test("unreadable hours say so instead of inventing a limit", () => {
  // Das ist der wichtigste Fall: Aus "Orari se shpejti" darf kein geratenes
  // "bis 22:00" werden. hasData bleibt false, und die Matching-Engine nimmt
  // dann allein den Plan des Angebots.
  const parsed = parseGoOpeningHours("Orari se shpejti");
  assert.equal(parsed.hasData, false);
  const day = readGoOpeningWindows({ openingHours: "Orari se shpejti" }, "mon");
  assert.equal(day.hasData, false);
  assert.deepEqual(day.windows, []);
});

test("a per-day map is read as well as a sentence", () => {
  const day = readGoOpeningWindows({ openingHours: { mon: "09:00-17:00", sat: "10:00 - 14:00" } }, "sat");
  assert.equal(day.hasData, true);
  assert.deepEqual(day.windows, [{ start: 600, end: 840 }]);
});

// ===========================================================================
// Die Zeitgrenze einer Buchung steht nicht mehr in diesem Modul.
//
// Hier standen einmal resolveGoOperatingDayEndMs (das Ende des Betriebstages
// als Verfallsgrenze), floorGoMinutesToSlot (das 30-Minuten-Raster) und
// goArrivalsOverlap (zwei Tische desselben Gastes). Alle drei setzten eine
// erwartete Ankunft voraus, und die gibt es ohne "Kur?" nicht mehr. Eine
// Buchung laeuft jetzt 24 Stunden ab ihrer Annahme - nachzulesen in
// go-booking-core.test.mjs.
//
// Was von diesem Modul bleibt, ist die Fenster-Mathematik darueber: Sie
// entscheidet weiter, WANN eine Offerte gefunden werden kann.
// ===========================================================================

test("the opening hours still decide when an offer can be found", () => {
  // Das Angebot gilt 14:00-23:00, das Lokal schliesst um 22:00.
  const offer = [{ start: 840, end: 1380 }];
  const venue = [{ start: 660, end: 1320 }];
  assert.deepEqual(intersectGoWindows(offer, venue), [{ start: 840, end: 1320 }]);
  // Um 22:30 ist zu - auch wenn das Angebot bis 23:00 laeuft.
  assert.equal(isWithinGoWindows(1350, intersectGoWindows(offer, venue)), false);
  assert.equal(isWithinGoWindows(1200, intersectGoWindows(offer, venue)), true);
});
