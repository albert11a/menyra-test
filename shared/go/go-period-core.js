// Mnyra GO - Zeitraeume und der Trichter. Pur.
//
// Hier steht die eine Rechnung, die Business und Heart teilen. Nicht aus
// Ordnungsliebe: Wenn das Panel "Oferta të pranuara 10" zeigt und Heart fuer
// dasselbe Lokal am selben Tag 11 zaehlt, ist eine der beiden Zahlen falsch -
// und niemand weiss, welche (Punkt 54, Regel 13).
//
// Zwei Dinge muss man beim Lesen wissen, sonst versteht man die Zahlen falsch:
//
//  1. DER TRICHTER IST EINE KOHORTE, DIE BESUCHER SIND ES NICHT.
//     "Sot" nimmt beim Trichter die Buchungen, die HEUTE ANGENOMMEN wurden,
//     und zaehlt von genau diesen die Aktivierungen und Finalisierungen
//     (Punkt 33). Deshalb kann dort nie "Pranuara 10 / Aktivizuara 14"
//     stehen. Besucher zaehlen dagegen nach dem Tag der FINALISIERUNG
//     (Punkt 34): Eine gestern angenommene Oferta, die heute eingeloest wird,
//     ist ein Gast von heute.
//
//  2. DER TAG GEHOERT DEM LOKAL.
//     Ein Zeitraum wird in der Zeitzone des Lokals abgesteckt, nicht in der
//     des Servers. Ein Lokal soll seinen Betriebstag sehen und nicht den von
//     Greenwich.

import { normalizeGoBookingStatus } from "./go-booking-core.js";
import {
  GO_DEFAULT_TIME_ZONE,
  resolveGoLocalTime,
  toGoMillis
} from "./go-time-core.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// Die fuenf Zeitraeume, die ueberall dieselben sind: im Panel, in Heart, auf
// dem Server. "sot" ist vorausgewaehlt - ein Wirt fragt zuerst nach heute.
export const GO_PERIODS = Object.freeze([
  { key: "sot", label: "Sot", days: 1 },
  { key: "dje", label: "Dje", days: 1 },
  { key: "week", label: "1 javë", days: 7 },
  { key: "month", label: "1 muaj", days: 30 },
  { key: "year", label: "1 vit", days: 365 }
]);

export const GO_PERIOD_KEYS = Object.freeze(GO_PERIODS.map((entry) => entry.key));
export const GO_PERIOD_DEFAULT = "sot";

export function normalizeGoPeriod(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return GO_PERIOD_KEYS.includes(key) ? key : GO_PERIOD_DEFAULT;
}

export function goPeriodLabel(value = "") {
  const found = GO_PERIODS.find((entry) => entry.key === normalizeGoPeriod(value));
  return found ? found.label : "";
}

/**
 * Der Anfang eines Tages in der Zeitzone des Lokals, als Millisekunden.
 *
 * Der Umweg ueber resolveGoLocalTime ist noetig, weil JavaScript nur die Zone
 * der Maschine kennt: Es gibt keinen Weg, direkt "Mitternacht in Prishtina" zu
 * bilden. Also wird der Zeitpunkt in die oertliche Sicht zerlegt und die
 * Minuten seit Mitternacht wieder abgezogen.
 */
function startOfLocalDay(ms, timeZone) {
  const local = resolveGoLocalTime(ms, timeZone);
  return local.ms - local.minutes * 60 * 1000;
}

/**
 * Von wann bis wann ein Zeitraum reicht.
 *
 * "Sot" ist der heutige Kalendertag, "Dje" der gestrige - beides ganze Tage
 * und keine 24 Stunden ab jetzt. Der Unterschied ist der, den ein Wirt meint:
 * Wer um 23:00 auf "Sot" tippt, will den Tag sehen, der gleich zu Ende geht,
 * und nicht die Zeit seit gestern Abend.
 *
 * "1 javë" sind die letzten 7 Tage INKLUSIVE heute (Punkt 56) - also sechs
 * ganze Tage und der laufende.
 */
export function resolveGoPeriodRange({
  period = GO_PERIOD_DEFAULT,
  nowMs = Date.now(),
  timeZone = GO_DEFAULT_TIME_ZONE
} = {}) {
  const key = normalizeGoPeriod(period);
  const now = toGoMillis(nowMs) || Date.now();
  const todayStart = startOfLocalDay(now, timeZone);

  if (key === "dje") {
    return {
      key,
      timeZone,
      fromMs: todayStart - DAY_MS,
      // Bis Mitternacht, nicht bis jetzt: Gestern ist vorbei.
      toMs: todayStart,
      dayCount: 1
    };
  }

  const found = GO_PERIODS.find((entry) => entry.key === key);
  const days = Math.max(1, Math.trunc(Number(found?.days) || 1));
  return {
    key,
    timeZone,
    fromMs: todayStart - (days - 1) * DAY_MS,
    // Bis jetzt und nicht bis Mitternacht: Der laufende Tag zaehlt mit, so
    // weit er gekommen ist.
    toMs: now,
    dayCount: days
  };
}

function inRange(ms, fromMs, toMs) {
  return Number.isFinite(ms) && ms > 0 && ms >= fromMs && ms <= toMs;
}

/**
 * Der Trichter als Kohorte (Punkt 33).
 *
 * Genommen werden die Buchungen, die IM ZEITRAUM ANGENOMMEN wurden. Von genau
 * diesen wird gezaehlt, wie viele aktiviert und wie viele finalisiert wurden -
 * unabhaengig davon, wann das passiert ist.
 *
 * Deshalb steht dort nie eine Zahl ueber der davor. Wuerde man stattdessen
 * "heute aktiviert" zaehlen, kaeme irgendwann "Pranuara 10 / Aktivizuara 14"
 * heraus, weil vier davon von gestern stammen - und der Wirt haette eine
 * Auskunft, die er nicht lesen kann.
 *
 * `activated` zaehlt jede Buchung, die den Wisch hinter sich hat - auch die
 * bereits finalisierten. Eine finalisierte Oferta wurde aktiviert; sie aus der
 * Zahl herauszunehmen hiesse, den Trichter nach unten zu verjuengen, indem man
 * oben etwas wegnimmt.
 */
export function buildGoCohortFunnel({ bookings = [], fromMs = 0, toMs = Date.now() } = {}) {
  let accepted = 0;
  let activated = 0;
  let finalized = 0;

  (Array.isArray(bookings) ? bookings : []).forEach((booking) => {
    if (!inRange(toGoMillis(booking?.acceptedAt || booking?.createdAt), fromMs, toMs)) return;
    accepted += 1;
    // Uebersetzt gelesen: Heart reicht rohe Dokumente herein, und darin kann
    // noch "confirmed" stehen.
    const status = normalizeGoBookingStatus(booking?.status);
    const wasActivated = !!toGoMillis(booking?.activatedAt)
      || status === "activated"
      || status === "finalized";
    if (wasActivated) activated += 1;
    if (status === "finalized") finalized += 1;
  });

  return {
    accepted,
    activated,
    finalized,
    // Die Luecke, ueber die Heart spaeter redet: aktiviert, aber nie
    // finalisiert. Sie ist keine Anklage - ein Gast, der wischt und dann doch
    // geht, steht auch darin.
    activatedNotFinalized: Math.max(0, activated - finalized)
  };
}

/**
 * Besucher im Zeitraum (Punkt 34).
 *
 * Hier zaehlt der Tag der FINALISIERUNG, nicht der der Annahme - und gezaehlt
 * werden PERSONEN, nicht Oferten (Punkt 11). Sieben finalisierte Oferten mit
 * den Gruppen 2, 4, 1, 3, 2, 4, 2 sind sieben Oferten und achtzehn Gaeste.
 *
 * Genommen wird die bestaetigte Personenzahl. Die geschaetzte des Gastes waere
 * hier die falsche: Der Kellner hat nachgezaehlt, und danach wurde auch
 * abgerechnet.
 */
export function countGoVisitors({ bookings = [], fromMs = 0, toMs = Date.now() } = {}) {
  let visits = 0;
  let visitors = 0;

  (Array.isArray(bookings) ? bookings : []).forEach((booking) => {
    if (normalizeGoBookingStatus(booking?.status) !== "finalized") return;
    if (!inRange(toGoMillis(booking?.finalizedAt), fromMs, toMs)) return;
    visits += 1;
    visitors += Math.max(1, Math.trunc(
      Number(booking?.partySizeVerified || booking?.partySizeRequested) || 1
    ));
  });

  return { visits, visitors };
}

/**
 * Was in einem Zeitraum an Provision entstanden ist.
 *
 * Aus den Buchungen und nicht aus den Tagesdokumenten: Die Tagesdokumente sind
 * eine beilaeufig geschriebene Zusammenfassung, und fuer "wie oft" ist das
 * hinnehmbar. Fuer "wieviel Geld" nicht - der Betrag kommt von dort, wo er in
 * derselben Transaktion entstanden ist wie die Finalisierung.
 */
export function sumGoEarnedCents({ bookings = [], fromMs = 0, toMs = Date.now() } = {}) {
  return (Array.isArray(bookings) ? bookings : []).reduce((total, booking) => {
    if (normalizeGoBookingStatus(booking?.status) !== "finalized") return total;
    if (!inRange(toGoMillis(booking?.finalizedAt), fromMs, toMs)) return total;
    const cents = Math.trunc(Number(booking?.commission?.amountCents) || 0);
    return total + (cents > 0 ? cents : 0);
  }, 0);
}
