// Mnyra GO - der Anschluss an die App.
//
// Das ist alles, was von GO beim normalen Laden von Qyteti im Browser landet:
// ein Zuhoerer fuer den Klick auf die GO-Karte und der kleine Streifen fuer
// einen laufenden Vorgang. Kein Modal, kein Firebase, keine Suche, keine
// Verbindung (Spezifikation Punkt 6, 54, 132, 139).
//
// Der Klick auf die Karte fuehrt auf den Tab "go" - dieselbe Seite, die auch
// /mnyra-go oeffnet. GO war einmal ein Modal; als Seite gehoert ihm der Rand
// des Bildschirms nicht mehr, und damit sind Kopfzeile, sicherer Bereich und
// Browserleiste wieder Sache der App-Huelle statt Sache von GO.

import { MNYRA_GO_ENABLED } from "../../../../shared/config/feature-flags.js";
import { readGoActiveBookings } from "./go-client-store.js";
import { renderGoStickyBarCore } from "./go-entry-card-render-utils.js";

const STICKY_ID = "mnyraGoSticky";

let delegationBound = false;

export function isGoEnabled() {
  return MNYRA_GO_ENABLED === true;
}

// Die Karte im Qyteti liest daraus ihren zweiten Zustand ("1 aktive"), ohne
// dafuer irgendetwas zu laden.
export function readGoEntryState() {
  if (!isGoEnabled()) return { enabled: false, activeBookings: [] };
  return { enabled: true, activeBookings: readGoActiveBookings() };
}

function mountSticky(documentObj) {
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  if (!doc) return;
  const html = renderGoStickyBarCore({ activeBookings: readGoActiveBookings() });
  const existing = doc.getElementById(STICKY_ID);
  if (!html) {
    if (existing) existing.remove();
    return;
  }
  const node = existing || doc.createElement("div");
  if (!existing) {
    node.id = STICKY_ID;
    doc.body.appendChild(node);
  }
  node.innerHTML = html;
}

/**
 * Einmal je Seite aufrufen. Danach fuehrt jeder Klick auf ein Element mit
 * data-go-open ins GO-Modul - egal, wo es steht (Karte im Qyteti, Streifen am
 * Rand). Die Pill in der Kopfzeile geht einen anderen Weg: sie ist ein
 * Tabwechsel wie Qyteti und Lokalet und laeuft ueber data-main-header-tab.
 */
export function ensureGoEntryDelegation(deps = {}) {
  if (!isGoEnabled()) return false;
  const doc = deps.documentObj || (typeof document === "undefined" ? null : document);
  const openGoTabFn = typeof deps.openGoTabFn === "function" ? deps.openGoTabFn : (() => {});
  if (!doc) return false;
  mountSticky(doc);
  if (delegationBound) return true;
  delegationBound = true;

  doc.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;
    const trigger = target.closest("[data-go-open]");
    if (!trigger) return;
    event.preventDefault();
    const bookingId = trigger.getAttribute("data-go-booking-id") || "";
    // Der Weg ist ein Tabwechsel wie jeder andere. Eine laufende Buchung
    // bringt ihre Kennung mit: die Seite holt sich damit den Stand vom Server.
    openGoTabFn({ bookingId });
  });

  return true;
}

// ---------------------------------------------------------------------------
// Business
// ---------------------------------------------------------------------------

let badgeWatcher = null;
let badgeRestaurantId = "";
const businessCounts = { unseen: 0, open: 0, today: 0, guests: 0 };

export function readGoBusinessCounts() {
  return { ...businessCounts };
}

/**
 * Der Zaehler auf der GO-Karte im Panel (Punkt 50, 52).
 *
 * Den Weg zur GO-Seite legt die Karte selbst zurueck - sie traegt
 * data-nav="gobiznes" wie jede andere Karte in Funksionet. Hier bleibt nur
 * die Zahl darauf, und die kommt aus einer Verbindung, die ausschliesslich
 * auf Business-Seiten aufgebaut wird. Ein Gast im Qyteti bekommt keine
 * Realtime-Verbindung (Punkt 54).
 */
export function ensureGoBusinessEntry({
  restaurantId = "",
  onBadgeFn = () => {}
} = {}) {
  if (!isGoEnabled() || !restaurantId) return false;
  if (badgeWatcher && badgeRestaurantId === restaurantId) return true;
  if (badgeWatcher) badgeWatcher.stop();
  badgeRestaurantId = restaurantId;

  // Der Zaehler wird nachgeladen, nicht mitgeladen: Auch im Panel kostet GO
  // erst dann etwas, wenn es dort wirklich gebraucht wird.
  import("./business-go-runtime-controller.js")
    .then((module) => {
      badgeWatcher = module.createGoBadgeWatcher({
        restaurantId,
        onCount: (counts) => {
          Object.assign(businessCounts, counts);
          onBadgeFn(counts);
        }
      });
      return badgeWatcher.start();
    })
    .catch(() => {
      badgeWatcher = null;
      badgeRestaurantId = "";
    });

  return true;
}

// Nur fuer Tests: den geladenen Zustand zuruecksetzen.
export function resetGoBootForTests() {
  delegationBound = false;
  badgeRestaurantId = "";
  if (badgeWatcher) badgeWatcher.stop();
  badgeWatcher = null;
}
