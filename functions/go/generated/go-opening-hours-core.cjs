"use strict";

// Generated from ../../../shared/go/go-opening-hours-core.js. Do not edit manually.
// Run: node functions/scripts/sync-go-shared.cjs

// Mnyra GO - Oeffnungszeiten lesen. Pur.
//
// Die Oeffnungszeit eines Lokals liegt in Mnyra als Freitext im Profil:
// "Hene - Diel: 11:00 - 22:00". Kein Feld, kein Raster, gewachsen ueber Jahre
// und von Hand getippt. GO braucht sie aber als harte Grenze: Ein GO-Angebot
// darf nach Ladenschluss nicht mehr erscheinen, auch wenn sein eigener Plan
// noch laeuft (Spezifikation Punkt 18).
//
// Dieses Modul liest den Text so weit, wie er sich verlaesslich lesen laesst,
// und sagt ehrlich, wenn er sich nicht lesen laesst.
//
// Die Unterscheidung ist wichtiger als die Trefferquote:
//
//   hasData === true   -> die Zeiten sind bekannt und gelten als Obergrenze.
//   hasData === false  -> unbekannt. Dann gilt allein der Plan des Angebots.
//
// Was hier ausdruecklich NICHT passiert: aus unlesbarem Text eine Annahme
// bauen. Ein geratenes "bis 22:00" wuerde entweder Gaeste vor verschlossener
// Tuer stehen lassen oder ein Lokal aus seiner besten Stunde nehmen. Lieber
// keine Grenze als eine erfundene - das Lokal kann seine GO-Zeiten im Editor
// jederzeit selbst setzen.

const {
  GO_WEEKDAY_KEYS,
  buildGoWindow,
  mergeGoWindows
} = require("./go-time-core.cjs");

// Albanisch, Deutsch und Englisch - das ist, was in den Profilen vorkommt.
// Reihenfolge innerhalb eines Tages spielt keine Rolle; gesucht wird immer
// die laengste passende Schreibweise zuerst.
const WEEKDAY_ALIASES = {
  mon: ["e hene", "e hënë", "hene", "hënë", "hen", "monday", "montag", "mon", "mo", "hn"],
  tue: ["e marte", "e martë", "marte", "martë", "mar", "tuesday", "dienstag", "tue", "di"],
  wed: ["e merkure", "e mërkurë", "merkure", "mërkurë", "mer", "wednesday", "mittwoch", "wed", "mi"],
  thu: ["e enjte", "enjte", "enj", "thursday", "donnerstag", "thu", "do"],
  fri: ["e premte", "premte", "pre", "friday", "freitag", "fri", "fr"],
  sat: ["e shtune", "e shtunë", "shtune", "shtunë", "sht", "saturday", "samstag", "sat", "sa"],
  sun: ["e diel", "diel", "die", "sunday", "sonntag", "sun", "so"]
};

const ALIAS_INDEX = (() => {
  const entries = [];
  Object.keys(WEEKDAY_ALIASES).forEach((day) => {
    WEEKDAY_ALIASES[day].forEach((alias) => entries.push({ day, alias }));
  });
  // Lang vor kurz: sonst schluckt "di" das "diel" und aus Sonntag wird
  // Dienstag.
  return entries.sort((a, b) => b.alias.length - a.alias.length);
})();

const CLOSED_WORDS = ["mbyllur", "pushim", "geschlossen", "closed", "ruhetag"];
const ALL_WEEK_WORDS = ["cdo dite", "çdo ditë", "cdo dit", "every day", "daily", "taeglich", "täglich", "immer", "24/7"];

function foldText(value = "") {
  let text = String(value ?? "").toLowerCase();
  try {
    text = text.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  } catch {
    // Ohne Normalisierung wird nur weniger erkannt, nichts wird falsch.
  }
  return text.replace(/\s+/g, " ").trim();
}

function matchWeekdayAt(text, index) {
  for (const entry of ALIAS_INDEX) {
    if (text.startsWith(entry.alias, index)) {
      const after = text[index + entry.alias.length];
      // Ein Tagesname endet an einem Zeichen, das kein Buchstabe ist -
      // "montagsmenue" ist kein Montag.
      if (!after || !/[a-z]/.test(after)) {
        return { day: entry.day, length: entry.alias.length };
      }
    }
  }
  return null;
}

// Alle Tage, die vor einer Zeitangabe stehen. "hene - diel" wird zur Spanne
// Montag bis Sonntag, "sht, diel" zu zwei einzelnen Tagen.
function readWeekdaysFromLabel(label = "") {
  const text = foldText(label);
  if (!text) return [];
  if (ALL_WEEK_WORDS.some((word) => text.includes(foldText(word)))) return GO_WEEKDAY_KEYS.slice();

  const found = [];
  let index = 0;
  while (index < text.length) {
    const match = matchWeekdayAt(text, index);
    if (!match) {
      index += 1;
      continue;
    }
    const separatorMatch = text.slice(index + match.length).match(/^\s*(-|–|—|bis|to|deri(\s+me)?)\s*/);
    found.push({ day: match.day, range: !!separatorMatch });
    index += match.length + (separatorMatch ? separatorMatch[0].length : 0);
  }
  if (!found.length) return [];

  const days = [];
  for (let position = 0; position < found.length; position += 1) {
    const current = found[position];
    const next = found[position + 1];
    if (current.range && next) {
      const from = GO_WEEKDAY_KEYS.indexOf(current.day);
      const to = GO_WEEKDAY_KEYS.indexOf(next.day);
      if (from >= 0 && to >= 0) {
        // Ueber das Wochenende hinweg: "premte - hene" sind Fr, Sa, So, Mo.
        const span = to >= from ? to - from : 7 - from + to;
        for (let step = 0; step <= span; step += 1) {
          days.push(GO_WEEKDAY_KEYS[(from + step) % 7]);
        }
        position += 1;
        continue;
      }
    }
    days.push(current.day);
  }
  return [...new Set(days)];
}

function readWindowsFromText(value = "") {
  const text = foldText(value);
  const windows = [];
  // "11:00 - 22:00", "11.00-22.00", "11 - 22". Zwei Uhrzeiten mit einem
  // Trennzeichen dazwischen - mehr wird nicht verlangt.
  const pattern = /(\d{1,2}(?:[:.]\d{2})?)\s*(?:-|–|—|bis|to|deri)\s*(\d{1,2}(?:[:.]\d{2})?)/g;
  let match = pattern.exec(text);
  while (match) {
    const window = buildGoWindow(match[1].replace(".", ":"), match[2].replace(".", ":"));
    if (window) windows.push(window);
    match = pattern.exec(text);
  }
  return mergeGoWindows(windows);
}

function emptyByDay() {
  const byDay = {};
  GO_WEEKDAY_KEYS.forEach((day) => {
    byDay[day] = [];
  });
  return byDay;
}

function applySegment(byDay, touched, label, windows, closed) {
  const days = readWeekdaysFromLabel(label);
  const targets = days.length ? days : GO_WEEKDAY_KEYS.slice();
  targets.forEach((day) => {
    touched.add(day);
    if (closed) {
      byDay[day] = [];
      return;
    }
    byDay[day] = mergeGoWindows([...(byDay[day] || []), ...windows]);
  });
}

/**
 * Liest die Oeffnungszeiten eines Lokals.
 *
 * Angenommen werden Freitext ("Hene - Diel: 11:00 - 22:00"), eine Karte je
 * Tag ({ mon: "09:00-17:00" }) und Listen aus beidem.
 *
 * @returns {{ hasData: boolean, byDay: Record<string, Array<{start:number,end:number}>>, source: string }}
 */
function parseGoOpeningHours(raw) {
  const byDay = emptyByDay();
  const touched = new Set();

  const consumeString = (value) => {
    const text = String(value ?? "").trim();
    if (!text) return;
    // Ein Eintrag je Zeile oder je Semikolon: "Hene-Enjte: 11-22; Premte: 11-24".
    text.split(/[\n;|]+/).forEach((rawSegment) => {
      const segment = rawSegment.trim();
      if (!segment) return;
      const closed = CLOSED_WORDS.some((word) => foldText(segment).includes(foldText(word)));
      const windows = readWindowsFromText(segment);
      if (!closed && !windows.length) return;
      // Vor dem ersten Doppelpunkt steht der Tag, dahinter die Zeit. Fehlt der
      // Doppelpunkt, wird der Teil vor der ersten Ziffer als Tagesangabe
      // gelesen. Steht ueberhaupt keine Ziffer da ("Diel: mbyllur"), ist der
      // ganze Rest die Tagesangabe - sonst wuerde ein einzelner Ruhetag als
      // "die ganze Woche geschlossen" gelesen.
      const colonIndex = segment.indexOf(":");
      const digitIndex = segment.search(/\d/);
      let splitIndex = -1;
      if (colonIndex > 0 && (digitIndex < 0 || colonIndex < digitIndex)) splitIndex = colonIndex;
      else if (digitIndex > 0) splitIndex = digitIndex;
      let label = "";
      if (splitIndex > 0) label = segment.slice(0, splitIndex);
      else if (digitIndex < 0) label = segment;
      applySegment(byDay, touched, label, windows, closed);
    });
  };

  const consume = (value, keyHint = "") => {
    if (value === null || value === undefined) return;
    if (typeof value === "string" || typeof value === "number") {
      const hintDays = keyHint ? readWeekdaysFromLabel(keyHint) : [];
      if (hintDays.length) {
        const text = String(value);
        const closed = CLOSED_WORDS.some((word) => foldText(text).includes(foldText(word)));
        const windows = readWindowsFromText(text);
        if (closed || windows.length) applySegment(byDay, touched, keyHint, windows, closed);
        return;
      }
      consumeString(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => consume(entry));
      return;
    }
    if (typeof value === "object") {
      Object.keys(value).forEach((key) => consume(value[key], key));
    }
  };

  consume(raw);

  return {
    hasData: touched.size > 0,
    byDay,
    source: typeof raw === "string" ? raw.trim() : ""
  };
}

// Die Fenster eines einzelnen Wochentags. Kennt Mnyra die Zeiten nicht,
// kommt eine leere Liste mit hasData = false zurueck - der Aufrufer darf
// daraus keine Sperre machen.
function resolveGoOpeningWindowsForDay(parsed, weekday = "") {
  const data = parsed && typeof parsed === "object" ? parsed : { hasData: false, byDay: {} };
  const day = String(weekday || "").trim().toLowerCase();
  const windows = data.byDay && Array.isArray(data.byDay[day]) ? data.byDay[day] : [];
  return { hasData: !!data.hasData, windows: windows.slice() };
}

// Bequemer Einstieg fuer die Matching-Engine: aus dem Rohprofil eines Lokals
// direkt die Fenster des gefragten Wochentags.
function readGoOpeningWindows(record = {}, weekday = "") {
  const source = record && typeof record === "object" ? record : {};
  const raw = source.openingHours
    ?? source.openHours
    ?? source.hours
    ?? source.businessHours
    ?? source.workingHours
    ?? "";
  return resolveGoOpeningWindowsForDay(parseGoOpeningHours(raw), weekday);
}

module.exports = {
  parseGoOpeningHours,
  resolveGoOpeningWindowsForDay,
  readGoOpeningWindows
};
