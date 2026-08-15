// Mnyra GO - Zeit. Pur, ohne Browser, ohne Firebase.
//
// Zwei Dinge macht dieses Modul, und nur diese zwei:
//
//  1. Es rechnet einen Zeitpunkt in die oertliche Zeit des Lokals um.
//     Ein Lokal in Prishtina schliesst um 22:00 Uhr seiner Uhr - nicht um
//     22:00 Uhr UTC und schon gar nicht um 22:00 Uhr der Uhr des Gastes, der
//     das Telefon auf einer anderen Zeitzone stehen hat. Gerechnet wird
//     deshalb immer mit einer Zonenangabe, nie mit getHours() der Maschine.
//
//  2. Es beschreibt Zeitfenster als Minuten seit Mitternacht. 14:00-22:00
//     wird zu { start: 840, end: 1320 }. Ein Fenster ueber Mitternacht
//     (20:00-02:00) endet bei 1560 - also jenseits von 1440. Damit bleibt ein
//     Fenster ein einziges Paar Zahlen und muss nirgends in zwei Teile
//     zerfallen.
//
// Was hier ausdruecklich NICHT steht: irgendeine Regel, die einen Gast wegen
// zehn Minuten Verspaetung abweist. Die angegebene Uhrzeit einer GO-Buchung
// ist die erwartete Ankunft, kein Einlassfenster.

// Kosovo/Prishtina liegt in der IANA-Datenbank unter Europe/Belgrade - eine
// eigene Zone Europe/Pristina gibt es dort nicht. Lokale koennen ihre Zone im
// Profil ueberschreiben, sobald Mnyra ueber diese Zeitzone hinauswaechst.
export const GO_DEFAULT_TIME_ZONE = "Europe/Belgrade";

export const GO_MINUTES_PER_DAY = 1440;

// Montag zuerst, wie der Wochenplan im Editor gelesen wird.
export const GO_WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const MINUTE_MS = 60 * 1000;

// Intl.DateTimeFormat ist der einzige Weg, ohne Zeitzonen-Bibliothek an die
// oertliche Zeit zu kommen. Die Formatter sind teuer zu bauen und werden
// deshalb je Zone einmal angelegt.
const formatterCache = new Map();

function getPartsFormatter(timeZone) {
  const zone = String(timeZone || "").trim() || GO_DEFAULT_TIME_ZONE;
  const cached = formatterCache.get(zone);
  if (cached) return cached;
  let formatter = null;
  try {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short"
    });
  } catch {
    // Unbekannte Zone: lieber die Standardzone als ein Absturz mitten in
    // einer Suche. Eine falsche Stunde ist ein Anzeigefehler, eine geworfene
    // Ausnahme waere ein Ausfall.
    formatter = getPartsFormatter(GO_DEFAULT_TIME_ZONE);
  }
  formatterCache.set(zone, formatter);
  return formatter;
}

const WEEKDAY_BY_SHORT_NAME = {
  mon: "mon",
  tue: "tue",
  wed: "wed",
  thu: "thu",
  fri: "fri",
  sat: "sat",
  sun: "sun"
};

// Firestore liefert Timestamp, Date, ISO-String oder Millis - je nach Weg.
// Alles landet hier als Millisekunden oder 0 (= unbekannt).
export function toGoMillis(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      try {
        const date = value.toDate();
        const ms = date instanceof Date ? date.getTime() : NaN;
        return Number.isNaN(ms) ? 0 : ms;
      } catch {
        return 0;
      }
    }
    if (Number.isFinite(Number(value.seconds))) return Math.round(Number(value.seconds) * 1000);
    if (Number.isFinite(Number(value._seconds))) return Math.round(Number(value._seconds) * 1000);
    return 0;
  }
  const parsed = new Date(String(value));
  const ms = parsed.getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export function toGoIso(value) {
  const ms = toGoMillis(value);
  return ms ? new Date(ms).toISOString() : "";
}

// Der Zeitpunkt, zerlegt in die oertliche Sicht des Lokals: Tagesschluessel,
// Wochentag und Minuten seit Mitternacht. Alles Weitere in GO rechnet mit
// genau diesen drei Werten.
export function resolveGoLocalTime(value, timeZone = GO_DEFAULT_TIME_ZONE) {
  const ms = toGoMillis(value) || Date.now();
  const parts = getPartsFormatter(timeZone).formatToParts(new Date(ms));
  const read = (type) => {
    const found = parts.find((part) => part.type === type);
    return found ? found.value : "";
  };
  const year = read("year");
  const month = read("month");
  const day = read("day");
  const hour = read("hour") === "24" ? "00" : read("hour");
  const minute = read("minute");
  const weekdayRaw = String(read("weekday") || "").slice(0, 3).toLowerCase();
  return {
    ms,
    dayKey: year && month && day ? `${year}-${month}-${day}` : "",
    weekday: WEEKDAY_BY_SHORT_NAME[weekdayRaw] || "",
    minutes: (Number(hour) || 0) * 60 + (Number(minute) || 0),
    timeZone: String(timeZone || "").trim() || GO_DEFAULT_TIME_ZONE
  };
}

export function goDayKey(value, timeZone = GO_DEFAULT_TIME_ZONE) {
  return resolveGoLocalTime(value, timeZone).dayKey;
}

export function goWeekday(value, timeZone = GO_DEFAULT_TIME_ZONE) {
  return resolveGoLocalTime(value, timeZone).weekday;
}

// "14:00" -> 840. Auch "14.00", "1400" und "9:5" werden gelesen, weil beides
// im Freitext der Oeffnungszeiten vorkommt. Unlesbares gibt -1.
export function parseGoClockMinutes(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return -1;
  const match = raw.match(/^(\d{1,2})\s*[:.：]?\s*(\d{2})?$/);
  if (!match) return -1;
  const hours = Number(match[1]);
  const minutes = match[2] === undefined ? 0 : Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return -1;
  if (hours > 24 || minutes > 59) return -1;
  return hours * 60 + minutes;
}

export function formatGoClock(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0)) % GO_MINUTES_PER_DAY;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

// Eine Zahl ist bereits eine Minutenangabe, ein Text ist eine Uhrzeit.
//
// Der Unterschied ist wichtiger, als er aussieht: Ein Fenster, das einmal
// normalisiert wurde, geht als { start: 840 } weiter. Wuerde die 840 noch
// einmal als Uhrzeit gelesen, kaeme "8:40" heraus - aus 14:00 wuerde 08:40.
// Normalisieren muss man zweimal machen koennen, ohne dass sich etwas
// aendert.
function readGoWindowValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : -1;
  }
  return parseGoClockMinutes(value);
}

// Ein Fenster aus zwei Uhrzeiten. Endet es vor seinem Anfang, laeuft es ueber
// Mitternacht - dann wird das Ende um einen Tag verschoben statt das Fenster
// zu verwerfen. Ein Lokal, das bis 02:00 offen hat, ist nachts um eins offen
// und nicht "seit gestern geschlossen".
export function buildGoWindow(startValue, endValue) {
  const start = readGoWindowValue(startValue);
  let end = readGoWindowValue(endValue);
  if (start < 0 || end < 0) return null;
  if (end === start) return null;
  if (end < start) end += GO_MINUTES_PER_DAY;
  return { start, end };
}

export function normalizeGoWindows(list = []) {
  const source = Array.isArray(list) ? list : [];
  const windows = [];
  source.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const built = buildGoWindow(entry.start ?? entry.from, entry.end ?? entry.to);
    if (built) windows.push(built);
  });
  return mergeGoWindows(windows);
}

// Ueberlappende Fenster werden zu einem. Ohne das zaehlt ein Lokal, das
// 11:00-15:00 und 12:00-23:00 eingetragen hat, seine Mittagszeit doppelt.
export function mergeGoWindows(list = []) {
  const sorted = (Array.isArray(list) ? list : [])
    .filter((entry) => entry && Number.isFinite(entry.start) && Number.isFinite(entry.end) && entry.end > entry.start)
    .slice()
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  sorted.forEach((entry) => {
    const last = merged[merged.length - 1];
    if (last && entry.start <= last.end) {
      last.end = Math.max(last.end, entry.end);
      return;
    }
    merged.push({ start: entry.start, end: entry.end });
  });
  return merged;
}

// Der Schnitt zweier Fensterlisten. Genau das ist die Regel, dass die
// Oeffnungszeit ueber dem Angebotsplan steht (Spezifikation Punkt 18): Das
// Angebot gilt 14:00-23:00, das Lokal schliesst um 22:00 - uebrig bleibt
// 14:00-22:00.
export function intersectGoWindows(listA = [], listB = []) {
  const a = mergeGoWindows(listA);
  const b = mergeGoWindows(listB);
  if (!a.length) return b.slice();
  if (!b.length) return a.slice();
  const result = [];
  a.forEach((left) => {
    b.forEach((right) => {
      const start = Math.max(left.start, right.start);
      const end = Math.min(left.end, right.end);
      if (end > start) result.push({ start, end });
    });
  });
  return mergeGoWindows(result);
}

// Liegt eine Minute in einem der Fenster? Fenster ueber Mitternacht werden
// zusaetzlich mit einem Tag Versatz geprueft: Um 01:00 (60) faellt der Gast
// in ein Fenster, das gestern um 20:00 begann und bei 1560 endet.
export function isWithinGoWindows(minutes, windows = []) {
  const value = Number(minutes);
  if (!Number.isFinite(value)) return false;
  const list = Array.isArray(windows) ? windows : [];
  return list.some((entry) => {
    if (!entry || !Number.isFinite(entry.start) || !Number.isFinite(entry.end)) return false;
    if (value >= entry.start && value < entry.end) return true;
    const shifted = value + GO_MINUTES_PER_DAY;
    return shifted >= entry.start && shifted < entry.end;
  });
}

export function goWindowsLabel(windows = []) {
  return (Array.isArray(windows) ? windows : [])
    .map((entry) => `${formatGoClock(entry.start)}-${formatGoClock(entry.end)}`)
    .join(", ");
}

// Das Ende des Betriebstages in Millisekunden.
//
// Es ist die einzige Zeitgrenze, die eine GO-Buchung ueberhaupt kennt: nicht
// "+15 Minuten nach der erwarteten Ankunft", sondern das Ende des Tages, an
// dem der Gast erwartet wurde. Ein Lokal, das ueber Mitternacht offen hat,
// bekommt entsprechend spaeter Feierabend.
export function resolveGoOperatingDayEndMs({
  referenceMs = Date.now(),
  timeZone = GO_DEFAULT_TIME_ZONE,
  windows = [],
  fallbackEndMinutes = 26 * 60
} = {}) {
  const local = resolveGoLocalTime(referenceMs, timeZone);
  const merged = mergeGoWindows(windows);
  const latestEnd = merged.length
    ? merged.reduce((max, entry) => Math.max(max, entry.end), 0)
    : Math.max(0, Number(fallbackEndMinutes) || 0);
  const midnightMs = local.ms - local.minutes * MINUTE_MS;
  return midnightMs + latestEnd * MINUTE_MS;
}

// Runden auf ein Raster - die Grundlage der Kapazitaetsscheiben (30 Minuten).
// Der Schluessel selbst wird in go-booking-core gebaut; hier steht nur die
// Rechnung.
export function floorGoMinutesToSlot(minutes, slotMinutes = 30) {
  const size = Math.max(1, Math.round(Number(slotMinutes) || 30));
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  return Math.floor(value / size) * size;
}

export function addGoMinutes(value, minutes) {
  const ms = toGoMillis(value) || Date.now();
  return ms + Math.round(Number(minutes) || 0) * MINUTE_MS;
}

// Ueberlappen sich zwei erwartete Ankuenfte so stark, dass es dieselbe
// Verabredung waere? Gebraucht fuer die Regel, dass ein Gast nicht zur selben
// Zeit an vier Tischen sitzen kann (Spezifikation Punkt 34).
export function goArrivalsOverlap(firstMs, secondMs, windowMinutes = 120) {
  const a = toGoMillis(firstMs);
  const b = toGoMillis(secondMs);
  if (!a || !b) return false;
  const span = Math.max(1, Math.round(Number(windowMinutes) || 0)) * MINUTE_MS;
  return Math.abs(a - b) < span;
}
