import assert from "node:assert/strict";
import test from "node:test";

import {
  formatGoCardArrival,
  renderGoEntryCardCore,
  renderGoStickyBarCore
} from "../apps/menyra-social/core/go/go-entry-card-render-utils.js";
import { renderGoModalCore } from "../apps/menyra-social/core/go/go-modal-render-utils.js";
import {
  createGoIdempotencyKey,
  forgetGoBooking,
  readGoActiveBookings,
  readGoGuestToken,
  rememberGoBooking,
  syncGoBookingStatus,
  writeGoGuestToken
} from "../apps/menyra-social/core/go/go-client-store.js";
import { createGoRuntimeController } from "../apps/menyra-social/core/go/go-runtime-controller.js";

// Ein Speicher, wie ihn der Browser hat - und einer, der wirft, wie Safari im
// privaten Modus.
function createStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key)
  };
}

const THROWING_STORAGE = {
  getItem() { throw new Error("private mode"); },
  setItem() { throw new Error("private mode"); },
  removeItem() { throw new Error("private mode"); }
};

// ===========================================================================
// Die Karte im Qyteti (Punkt 4, 5, 43).
// ===========================================================================

test("the card stays away while the feature is off", () => {
  assert.equal(renderGoEntryCardCore({ enabled: false }), "");
});

test("without an active booking the card invites, with one it leads back", () => {
  const idle = renderGoEntryCardCore({ enabled: true, activeBookings: [] });
  assert.ok(idle.includes("Çka po kërkoni tani?"));
  assert.ok(idle.includes("Lokalet kanë oferta për ju."));
  assert.ok(idle.includes('data-go-open="search"'));

  const active = renderGoEntryCardCore({
    enabled: true,
    activeBookings: [{
      bookingId: "bk-1",
      businessName: "Casa Rita",
      partySize: 4,
      expectedArrivalAt: "2026-08-13T17:00:00.000Z"
    }],
    nowMs: Date.parse("2026-08-13T15:00:00.000Z")
  });
  assert.ok(active.includes("Casa Rita"));
  assert.ok(active.includes("4 persona"));
  assert.ok(active.includes('data-go-open="booking"'));
  assert.ok(active.includes('data-go-booking-id="bk-1"'));
  assert.ok(active.includes("1 aktive"));
});

test("the arrival on the card reads as approximate", () => {
  const nowMs = Date.parse("2026-08-13T17:00:00.000Z");
  assert.equal(formatGoCardArrival("2026-08-13T17:05:00.000Z", { nowMs }), "Tani");
  assert.ok(formatGoCardArrival("2026-08-13T19:00:00.000Z", { nowMs }).startsWith("Rreth"));
  assert.equal(formatGoCardArrival("", { nowMs }), "");
});

test("the card carries no image, no counter and no live text", () => {
  const html = renderGoEntryCardCore({ enabled: true, activeBookings: [] });
  assert.equal(html.includes("<img"), false);
  // Nichts, was eine Antwort eines Lokals vortaeuscht (Punkt 20).
  assert.equal(/sekonda|përgjigj/i.test(html), false);
});

test("the sticky bar only appears with a running booking", () => {
  assert.equal(renderGoStickyBarCore({ activeBookings: [] }), "");
  const html = renderGoStickyBarCore({ activeBookings: [{ bookingId: "bk-1", businessName: "Casa Rita" }] });
  assert.ok(html.includes("Casa Rita"));
  assert.ok(html.includes('data-go-open="booking"'));
});

// ===========================================================================
// Das Modal (Punkt 8 bis 15, 19, 29).
// ===========================================================================

test("closed means nothing is rendered at all", () => {
  assert.equal(renderGoModalCore({ open: false }), "");
});

test("everything that can be preselected is preselected", () => {
  const html = renderGoModalCore({
    open: true,
    view: "search",
    form: { partySize: 2, category: "all", when: "now", city: "Prishtina" }
  });
  const pressed = html.match(/aria-pressed="true"/g) || [];
  // Genau drei: die Gruppengroesse, "Krejt" und "Tani".
  assert.equal(pressed.length, 3);
  assert.ok(html.includes("Krejt"));
  assert.ok(html.includes("Tani"));
  assert.ok(html.includes("Prishtina"));
  // Und der Knopf verspricht nichts Falsches (Punkt 15).
  assert.ok(html.includes("Shiko ofertat"));
  assert.equal(/dërgo kërkesën/i.test(html), false);
});

test("budget stays secondary until asked for", () => {
  const collapsed = renderGoModalCore({ open: true, view: "search", form: {} });
  assert.ok(collapsed.includes("+ Shto buxhet"));
  assert.equal(collapsed.includes("deri 10 €"), false);
  const expanded = renderGoModalCore({ open: true, view: "search", form: { showBudget: true } });
  assert.ok(expanded.includes("deri 10 €"));
});

test("only 'më vonë' opens a date field", () => {
  assert.equal(renderGoModalCore({ open: true, form: { when: "now" } }).includes("datetime-local"), false);
  assert.ok(renderGoModalCore({ open: true, form: { when: "later" } }).includes("datetime-local"));
});

test("a result reads as an offer to this group, not as a public promotion", () => {
  const html = renderGoModalCore({
    open: true,
    view: "results",
    results: [{
      offerId: "offer-1",
      restaurantId: "rest-1",
      businessName: "Casa Rita",
      benefitLabel: "–10 %",
      partySize: 4,
      isNow: true,
      distanceKm: 1.2,
      bookingType: "reservation"
    }]
  });
  assert.ok(html.includes("1 lokale kanë oferta për ju"));
  assert.ok(html.includes("Casa Rita"));
  assert.ok(html.includes("po ju ofron"));
  assert.ok(html.includes("për grupin tuaj"));
  assert.ok(html.includes("4 persona"));
  assert.ok(html.includes("1.2 km"));
  assert.ok(html.includes("Vetëm me Mnyra GO"));
  assert.ok(html.includes("Prano ofertën"));
});

test("while confirming, the button says so and cannot be pressed again", () => {
  const html = renderGoModalCore({
    open: true,
    view: "results",
    busyOfferId: "offer-1",
    results: [{ offerId: "offer-1", businessName: "Casa Rita", benefitLabel: "–10 %", partySize: 4 }]
  });
  assert.ok(html.includes("Po konfirmohet..."));
  assert.ok(html.includes("disabled"));
  // Kein "U krye", solange der Server nicht geantwortet hat (Punkt 140).
  assert.equal(html.includes("U krye"), false);
});

test("no results is not a dead end", () => {
  const html = renderGoModalCore({ open: true, view: "results", results: [] });
  assert.ok(html.includes("Nuk gjetëm ofertë GO që përputhet tani."));
  // Der Apostroph steht als Entitaet in der Seite - jeder Text geht durch die
  // Maskierung, auch der eigene.
  assert.ok(html.includes("Lokale që mund t&#39;ju pëlqejnë"));
});

test("a confirmed table and a secured offer say different things", () => {
  const table = renderGoModalCore({
    open: true,
    view: "booking",
    booking: { type: "reservation", businessName: "Casa Rita", benefitLabel: "–10 %", partySize: 4, shortCode: "A7K2" }
  });
  assert.ok(table.includes("U krye"));
  assert.ok(table.includes("Tavolina është konfirmuar"));
  assert.ok(table.includes("A7K2"));

  const claim = renderGoModalCore({
    open: true,
    view: "booking",
    booking: { type: "claim", businessName: "Prince Coffee", benefitLabel: "Cookie falas", partySize: 2 }
  });
  assert.ok(claim.includes("Oferta është e juaja"));
});

test("signing in is offered, never demanded", () => {
  const html = renderGoModalCore({
    open: true,
    view: "booking",
    canSignIn: true,
    booking: { type: "claim", businessName: "Prince Coffee", partySize: 2 }
  });
  assert.ok(html.includes("Ruaje në llogarinë tënde"));
  // Kein Zwang, keine Sperre, kein "um fortzufahren" (Punkt 30).
  assert.equal(/për të vazhduar/i.test(html), false);
});

test("a sold out offer is answered with alternatives", () => {
  const html = renderGoModalCore({
    open: true,
    view: "error",
    error: "Kjo ofertë sapo u plotësua.",
    alternatives: [{ offerId: "o2", businessName: "Bro Pizza", benefitLabel: "–15 %", partySize: 4 }]
  });
  assert.ok(html.includes("Kjo ofertë sapo u plotësua."));
  assert.ok(html.includes("1 alternativa për ju"));
  assert.ok(html.includes("Bro Pizza"));
});

// ===========================================================================
// Was der Browser sich merkt (Punkt 41, 42, 99).
// ===========================================================================

test("the guest token survives a reload, the booking is remembered by its link", () => {
  const storage = createStorage();
  writeGoGuestToken("g1.abcdefghijkl.secretsecretsecret", storage);
  assert.equal(readGoGuestToken(storage), "g1.abcdefghijkl.secretsecretsecret");

  rememberGoBooking({
    bookingId: "bk-1",
    bookingToken: "b1.bk-1.secret",
    businessName: "Casa Rita",
    partySize: 4
  }, storage);
  const list = readGoActiveBookings(storage);
  assert.equal(list.length, 1);
  assert.equal(list[0].businessName, "Casa Rita");

  // Eine Buchung ohne Link waere nicht wiederzufinden - sie wird gar nicht
  // erst gemerkt.
  rememberGoBooking({ bookingId: "bk-2" }, storage);
  assert.equal(readGoActiveBookings(storage).length, 1);
});

test("a closed booking disappears from the card", () => {
  const storage = createStorage();
  rememberGoBooking({ bookingId: "bk-1", bookingToken: "b1.bk-1.secret", businessName: "Casa Rita" }, storage);
  syncGoBookingStatus({ id: "bk-1", status: "cancelled_by_user" }, storage);
  assert.equal(readGoActiveBookings(storage).length, 0);

  rememberGoBooking({ bookingId: "bk-2", bookingToken: "b1.bk-2.secret", businessName: "Casa Rita" }, storage);
  syncGoBookingStatus({ id: "bk-2", status: "checked_in" }, storage);
  assert.equal(readGoActiveBookings(storage)[0].status, "checked_in");
  forgetGoBooking("bk-2", storage);
  assert.equal(readGoActiveBookings(storage).length, 0);
});

test("a storage that throws does not take GO down with it", () => {
  // Safari im privaten Modus wirft schon beim Lesen. GO laeuft dann ohne
  // Gedaechtnis weiter statt gar nicht.
  assert.equal(readGoGuestToken(THROWING_STORAGE), "");
  assert.deepEqual(readGoActiveBookings(THROWING_STORAGE), []);
  assert.equal(writeGoGuestToken("g1.aaaaaaaaaaaa.bbbbbbbbbbbb", THROWING_STORAGE), false);
});

test("the idempotency key is unique per intent", () => {
  const first = createGoIdempotencyKey(null);
  const second = createGoIdempotencyKey(null);
  assert.notEqual(first, second);
  assert.ok(first.length >= 12);
});

// ===========================================================================
// Der Ablauf (Punkt 27, 99, 100, 119).
// ===========================================================================

// Ein Dokument, das gerade so viel kann, wie der Ablauf braucht.
function createFakeDocument() {
  const nodes = new Map();
  const make = (id = "") => ({
    id,
    dataset: {},
    innerHTML: "",
    appendChild() {},
    remove() {
      nodes.delete(id);
    },
    addEventListener() {}
  });
  return {
    body: { appendChild(node) { nodes.set(node.id, node); } },
    getElementById: (id) => nodes.get(id) || null,
    createElement: (tag) => {
      const node = make("");
      node.tagName = String(tag || "").toUpperCase();
      return node;
    },
    addEventListener() {},
    __nodes: nodes
  };
}

function createFakeApi(overrides = {}) {
  const calls = [];
  return {
    calls,
    async ensureGuestSession() {
      calls.push(["ensureGuestSession"]);
      return { guestToken: "g1.aaaaaaaaaaaa.bbbbbbbbbbbbbbbb" };
    },
    async search(request) {
      calls.push(["search", request]);
      return overrides.search
        ? overrides.search(request)
        : { results: [{ offerId: "offer-1", restaurantId: "rest-1", businessName: "Casa Rita", benefitLabel: "–10 %", partySize: 4 }], total: 1 };
    },
    async createBooking(payload) {
      calls.push(["createBooking", payload]);
      if (overrides.createBooking) return overrides.createBooking(payload);
      return {
        booking: {
          id: "bk-1",
          status: "confirmed",
          type: "reservation",
          shortCode: "A7K2",
          partySize: 4,
          businessName: "Casa Rita",
          benefitLabel: "–10 %",
          restaurantId: "rest-1",
          expectedArrivalAt: new Date().toISOString()
        },
        bookingToken: "b1.bk-1.secretsecretsecret"
      };
    },
    async getBooking(token) {
      calls.push(["getBooking", token]);
      return overrides.getBooking ? overrides.getBooking(token) : null;
    },
    async cancelBooking(token) {
      calls.push(["cancelBooking", token]);
      return { id: "bk-1", status: "cancelled_by_user" };
    }
  };
}

function createController(api) {
  return createGoRuntimeController({
    documentObj: createFakeDocument(),
    windowObj: { crypto: null },
    api,
    getCityFn: () => "Prishtina",
    getCoordsFn: () => null,
    isSignedInFn: () => false,
    nowFn: () => Date.parse("2026-08-13T14:00:00.000Z")
  });
}

test("search and accept walk through the states in order", async () => {
  const api = createFakeApi();
  const controller = createController(api);

  await controller.open("search");
  assert.equal(controller.state.view, "search");
  assert.equal(controller.state.form.city, "Prishtina");

  await controller.__submitSearch();
  assert.equal(controller.state.view, "results");
  assert.equal(controller.state.results.length, 1);

  await controller.__acceptOffer("offer-1", "rest-1");
  assert.equal(controller.state.view, "booking");
  assert.equal(controller.state.booking.shortCode, "A7K2");
  assert.equal(controller.state.busyOfferId, "");
});

test("the same offer keeps its idempotency key across retries", async () => {
  let attempt = 0;
  const api = createFakeApi({
    createBooking: (payload) => {
      attempt += 1;
      if (attempt === 1) {
        const error = new Error("network");
        error.code = "unavailable";
        throw error;
      }
      return {
        booking: { id: "bk-1", status: "confirmed", type: "claim", partySize: 2, businessName: "Casa Rita" },
        bookingToken: "b1.bk-1.secret",
        __key: payload.idempotencyKey
      };
    }
  });
  const controller = createController(api);
  await controller.open("search");
  await controller.__submitSearch();

  await controller.__acceptOffer("offer-1", "rest-1");
  assert.equal(controller.state.view, "error");
  const firstKey = api.calls.filter((entry) => entry[0] === "createBooking")[0][1].idempotencyKey;

  await controller.__acceptOffer("offer-1", "rest-1");
  const secondKey = api.calls.filter((entry) => entry[0] === "createBooking")[1][1].idempotencyKey;
  // Ein abgebrochener Versuch ist derselbe Wunsch: Der Browser weiss nicht,
  // ob die Buchung schon steht. Ein neuer Schluessel waere eine zweite
  // Buchung (Punkt 100).
  assert.notEqual(firstKey, "");
  assert.equal(secondKey, firstKey);
  assert.equal(controller.state.view, "booking");
});

test("a rejected offer gets a fresh key, because nothing was created", async () => {
  // Der Gegenfall: Hat der Server ausdruecklich abgelehnt, ist sicher keine
  // Buchung entstanden - der naechste Versuch ist ein neuer Wunsch.
  const api = createFakeApi({
    createBooking: () => {
      const error = new Error("Kjo ofertë nuk vlen për këtë kërkesë.");
      error.code = "failed-precondition";
      throw error;
    }
  });
  const controller = createController(api);
  await controller.open("search");
  await controller.__submitSearch();
  await controller.__acceptOffer("offer-1", "rest-1");
  await controller.__acceptOffer("offer-1", "rest-1");
  const keys = api.calls.filter((entry) => entry[0] === "createBooking").map((entry) => entry[1].idempotencyKey);
  assert.equal(keys.length, 2);
  assert.notEqual(keys[0], keys[1]);
});

test("a sold out answer lands in the alternatives, not in a generic error", async () => {
  const api = createFakeApi({
    createBooking: () => {
      const error = new Error("Kjo ofertë sapo u plotësua.");
      error.code = "resource-exhausted";
      error.soldOut = true;
      error.alternatives = [{ offerId: "offer-2", businessName: "Bro Pizza", benefitLabel: "–15 %", partySize: 4 }];
      throw error;
    }
  });
  const controller = createController(api);
  await controller.open("search");
  await controller.__submitSearch();
  await controller.__acceptOffer("offer-1", "rest-1");

  assert.equal(controller.state.view, "error");
  assert.equal(controller.state.error, "Kjo ofertë sapo u plotësua.");
  assert.equal(controller.state.alternatives.length, 1);
  assert.equal(controller.state.busyOfferId, "");
});

test("a failing GO server leaves the controller in a named error state", async () => {
  const api = createFakeApi({
    search: () => {
      const error = new Error("Mnyra GO është përkohësisht i padisponueshëm.");
      error.code = "internal";
      throw error;
    }
  });
  const controller = createController(api);
  await controller.open("search");
  await controller.__submitSearch();
  assert.equal(controller.state.view, "error");
  assert.ok(controller.state.error.includes("Mnyra GO"));
});
