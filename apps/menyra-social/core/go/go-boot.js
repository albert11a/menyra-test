// Mnyra GO - der Anschluss an die App.
//
// Das ist alles, was von GO beim normalen Laden von Qyteti im Browser landet:
// ein Zuhoerer fuer den Klick auf die GO-Karte und der kleine Streifen fuer
// einen laufenden Vorgang. Kein Modal, kein Firebase, keine Suche, keine
// Verbindung (Spezifikation Punkt 6, 54, 132, 139).
//
// Erst der Klick laedt das eigentliche GO-Modul nach - und wenn dabei etwas
// schiefgeht, bleibt es dabei: Der Klick tut nichts, und die Seite steht
// unveraendert weiter (Punkt 131).

import { MNYRA_GO_ENABLED } from "../../../../shared/config/feature-flags.js";
import { readGoActiveBookings } from "./go-client-store.js";
import { renderGoStickyBarCore } from "./go-entry-card-render-utils.js";

const STICKY_ID = "mnyraGoSticky";

let controllerPromise = null;
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

async function loadController(deps = {}) {
  if (!controllerPromise) {
    controllerPromise = import("./go-runtime-controller.js")
      .then((module) => module.createGoRuntimeController(deps))
      .catch((error) => {
        controllerPromise = null;
        throw error;
      });
  }
  return controllerPromise;
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
 * Rand, Eintrag im Menue).
 */
export function ensureGoEntryDelegation(deps = {}) {
  if (!isGoEnabled()) return false;
  const doc = deps.documentObj || (typeof document === "undefined" ? null : document);
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
    const mode = trigger.getAttribute("data-go-open") || "search";
    const bookingId = trigger.getAttribute("data-go-booking-id") || "";
    loadController(deps)
      .then((controller) => controller.open(mode, bookingId))
      .catch(() => {
        // Bewusst still: Ein Feature, das sich nicht laden laesst, darf keine
        // Fehlermeldung ueber eine funktionierende Seite legen.
      });
  });

  return true;
}

// ---------------------------------------------------------------------------
// Business
// ---------------------------------------------------------------------------

let businessBound = false;
let businessControllerPromise = null;
let badgeWatcher = null;
const businessCounts = { unseen: 0, open: 0, today: 0, guests: 0 };

export function readGoBusinessCounts() {
  return { ...businessCounts };
}

async function loadBusinessController(deps = {}) {
  if (!businessControllerPromise) {
    businessControllerPromise = Promise.all([
      import("./business-go-runtime-controller.js"),
      import("./go-api-client.js")
    ])
      .then(([controllerModule, apiModule]) => {
        const client = apiModule.createGoApiClient();
        return controllerModule.createBusinessGoRuntimeController({
          ...deps,
          bookingActionFn: (payload) => client.businessBookingAction(payload)
        });
      })
      .catch((error) => {
        businessControllerPromise = null;
        throw error;
      });
  }
  return businessControllerPromise;
}

/**
 * Der Anschluss im Panel: der Klick auf die GO-Karte und der Zaehler darauf.
 *
 * Der Zaehler laeuft nur hier - auf Business-Seiten. Ein Gast im Qyteti
 * bekommt keine Realtime-Verbindung (Punkt 54).
 */
export function ensureGoBusinessEntry({
  restaurantId = "",
  businessName = "",
  documentObj = null,
  onBadgeFn = () => {}
} = {}) {
  if (!isGoEnabled() || !restaurantId) return false;
  const doc = documentObj || (typeof document === "undefined" ? null : document);
  if (!doc) return false;

  if (!badgeWatcher) {
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
      });
  }

  if (businessBound) return true;
  businessBound = true;
  doc.addEventListener("click", (event) => {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return;
    const trigger = target.closest("[data-go-business-open]");
    if (!trigger) return;
    event.preventDefault();
    loadBusinessController({ documentObj: doc, restaurantId, businessName })
      .then((controller) => controller.open(trigger.getAttribute("data-go-business-open") || "active"))
      .catch(() => {});
  });
  return true;
}

// Nur fuer Tests: den geladenen Zustand zuruecksetzen.
export function resetGoBootForTests() {
  controllerPromise = null;
  delegationBound = false;
  businessBound = false;
  businessControllerPromise = null;
  if (badgeWatcher) badgeWatcher.stop();
  badgeWatcher = null;
}
