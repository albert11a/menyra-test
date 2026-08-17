// Mnyra GO - was Mnyra selbst sieht. Pur.
//
// Diese Datei rechnet die Zahlen aus, die auf der GO-Seite in Heart stehen:
// was verdient wurde, was noch offen ist, und - die wichtigste - wie oft ein
// Lokal eine angenommene Oferta NICHT bestaetigt hat.
//
// Zwei Dinge muss man beim Lesen wissen, sonst versteht man die Zahlen falsch:
//
//  1. GELD KOMMT AUS DEN BUCHUNGEN, ZAEHLUNGEN AUS DEN TAGESDOKUMENTEN.
//     Die Tagesdokumente (goStats) sind eine Zusammenfassung, die beilaeufig
//     geschrieben wird - faellt sie einmal aus, fehlt eine Zaehlung. Fuer
//     "wie oft" ist das hinnehmbar, fuer "wieviel Geld" nicht. Der Betrag
//     kommt deshalb aus den Buchungen selbst, wo er in derselben Transaktion
//     entstanden ist wie die Bestaetigung.
//
//  2. DIE LUECKE IST KEINE FEHLERMELDUNG.
//     "Angenommen minus bestaetigt" ist nicht dasselbe wie "unterschlagen".
//     Ein Gast, der zugreift und dann doch nicht hingeht, steht auch darin.
//     Erst ein Lokal, bei dem die Luecke dauerhaft gross ist, ist ein Anruf
//     wert - deshalb steht hier eine Quote und kein Urteil.

import { GO_COMMISSION_STATUS } from "./go-booking-core.js";
import { sumGoCommissionCents } from "./go-commission-core.js";

function count(value) {
  const parsed = Math.trunc(Number(value) || 0);
  return parsed > 0 ? parsed : 0;
}

function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

/**
 * Die Zahlen eines Lokals und die aller Lokale zusammen.
 *
 * @param {Array}  params.days        Tagesdokumente: { restaurantId, impressions, accepted, confirmed }
 * @param {Array}  params.commissions Posten aus den Buchungen: { restaurantId, amountCents, status }
 * @param {object} params.names       restaurantId -> Name des Lokals
 */
export function buildGoOperatorOverview({ days = [], commissions = [], names = {} } = {}) {
  const rows = new Map();

  const row = (restaurantId) => {
    const id = String(restaurantId || "").trim();
    if (!id) return null;
    if (!rows.has(id)) {
      rows.set(id, {
        restaurantId: id,
        name: String(names?.[id] || "").trim(),
        impressions: 0,
        accepted: 0,
        confirmed: 0,
        pendingCents: 0,
        settledCents: 0
      });
    }
    return rows.get(id);
  };

  (Array.isArray(days) ? days : []).forEach((day) => {
    const entry = row(day?.restaurantId);
    if (!entry) return;
    entry.impressions += count(day?.impressions);
    entry.accepted += count(day?.accepted);
    entry.confirmed += count(day?.confirmed);
  });

  (Array.isArray(commissions) ? commissions : []).forEach((item) => {
    const entry = row(item?.restaurantId);
    if (!entry) return;
    const cents = count(item?.amountCents);
    if (item?.status === GO_COMMISSION_STATUS.settled) entry.settledCents += cents;
    else entry.pendingCents += cents;
  });

  const restaurants = [...rows.values()].map((entry) => ({
    ...entry,
    // Die Luecke: angenommen, aber nie bestaetigt. Sie kann nicht kleiner als
    // null werden - eine Bestaetigung ohne Annahme gibt es nicht, und waere
    // eine Zaehlung einmal ausgefallen, soll daraus keine negative Zahl
    // werden, die niemand erklaeren kann.
    missingConfirmations: Math.max(0, entry.accepted - entry.confirmed),
    // Wieviel Prozent der angenommenen Oferten wurden bestaetigt. Das ist die
    // Zahl, die ein Lokal beschreibt - nicht die Luecke selbst, denn ein
    // grosses Lokal hat immer eine groessere Luecke als ein kleines.
    confirmRatePercent: percent(entry.confirmed, entry.accepted)
  })).sort((a, b) => (
    // Was Geld bringt, zuerst; bei Gleichstand das Lokal mit der groesseren
    // Luecke - das ist das, worueber zu reden waere.
    (b.pendingCents + b.settledCents) - (a.pendingCents + a.settledCents)
    || b.missingConfirmations - a.missingConfirmations
    || String(a.name || a.restaurantId).localeCompare(String(b.name || b.restaurantId))
  ));

  const totals = restaurants.reduce((sum, entry) => ({
    impressions: sum.impressions + entry.impressions,
    accepted: sum.accepted + entry.accepted,
    confirmed: sum.confirmed + entry.confirmed,
    pendingCents: sum.pendingCents + entry.pendingCents,
    settledCents: sum.settledCents + entry.settledCents
  }), { impressions: 0, accepted: 0, confirmed: 0, pendingCents: 0, settledCents: 0 });

  return {
    totals: {
      ...totals,
      restaurants: restaurants.length,
      missingConfirmations: Math.max(0, totals.accepted - totals.confirmed),
      // Von gesehen zu angenommen: sagt, ob die Oferten ueberzeugen.
      acceptRatePercent: percent(totals.accepted, totals.impressions),
      // Von angenommen zu bestaetigt: sagt, ob die Lokale mitspielen.
      confirmRatePercent: percent(totals.confirmed, totals.accepted),
      // Was zusammen schon verdient wurde - offen und abgerechnet.
      earnedCents: totals.pendingCents + totals.settledCents
    },
    restaurants
  };
}

/**
 * Die Summe einer Reihe von Posten, nach Zustand getrennt.
 *
 * Getrennt, weil "verdient" und "noch zu holen" zwei verschiedene Saetze sind
 * und nur einer davon auf dem Konto steht.
 */
export function sumGoOperatorCommissions(commissions = []) {
  const list = Array.isArray(commissions) ? commissions : [];
  const settled = list.filter((item) => item?.status === GO_COMMISSION_STATUS.settled);
  const pending = list.filter((item) => item?.status !== GO_COMMISSION_STATUS.settled);
  return {
    pendingCents: sumGoCommissionCents(pending),
    settledCents: sumGoCommissionCents(settled),
    pendingCount: pending.length,
    settledCount: settled.length
  };
}

/**
 * Eine Abrechnung, so wie sie festgehalten wird.
 *
 * Warum ein eigener Beleg und nicht nur ein umgelegtes Haekchen an jeder
 * Buchung: Ein Haekchen sagt "abgerechnet", aber nicht WANN, nicht ZU WELCHEM
 * BETRAG und nicht ZUSAMMEN MIT WELCHEN. Genau das braucht man aber, wenn ein
 * Lokal in drei Monaten fragt, wofuer es bezahlt hat.
 *
 * Der Beleg traegt die Kennungen der Buchungen mit. Nicht als Verweis, den
 * jemand aufloesen muesste, sondern damit man von der Rechnung zurueck zu
 * jedem einzelnen Gast kommt.
 */
export function buildGoSettlementRecord({
  restaurantId = "",
  restaurantName = "",
  items = [],
  actorUid = "",
  nowMs = Date.now(),
  serverTimestamp = null
} = {}) {
  const list = (Array.isArray(items) ? items : [])
    .filter((item) => item && item.bookingId && count(item.amountCents) > 0);
  return {
    restaurantId: String(restaurantId || "").trim(),
    restaurantName: String(restaurantName || "").trim(),
    // In Cent, wie ueberall. Eine Rechnung in Euro waere die eine Stelle, an
    // der sich ein halber Cent verliert.
    amountCents: list.reduce((total, item) => total + count(item.amountCents), 0),
    bookingCount: list.length,
    bookingIds: list.map((item) => String(item.bookingId)),
    currency: "EUR",
    actorUid: String(actorUid || "").trim(),
    createdAt: serverTimestamp || new Date(nowMs).toISOString()
  };
}
