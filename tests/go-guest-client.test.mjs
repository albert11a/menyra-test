import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  formatGoCardArrival,
  renderGoEntryCardCore,
  renderGoStickyBarCore
} from "../apps/menyra-social/core/go/go-entry-card-render-utils.js";
import {
  GO_MODAL_CSS,
  GO_MODAL_HOW_CARDS,
  GO_MODAL_INFO_ROWS,
  GO_STEPS,
  clampGoPartySize,
  goPartyFillPercent,
  goPartyLabel,
  nextGoStep,
  previousGoStep,
  renderGoModalCore,
  resolveGoStep
} from "../apps/menyra-social/core/go/go-modal-render-utils.js";
import { goIcon } from "../apps/menyra-social/core/go/go-icon-render-utils.js";
import {
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_MIN
} from "../shared/go/go-feature-config.js";
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

test("the modal wears the same shape as the posto modal", () => {
  // Mnyra hat ein Modal, das der Nutzer kennt - das des Business-Composers.
  // GO benutzt dieselbe Form: eine weisse Flaeche ueber der Seite, oben eine
  // Zeile, darunter der scrollende Inhalt. Weicht das hier ab, sind es zwei
  // Apps in einem Fenster.
  const html = renderGoModalCore({ open: true, view: "search", form: { city: "Prishtina" } });
  assert.ok(html.includes('class="mnyra-go modal-overlay"'));
  assert.ok(html.includes('data-modal-surface="#ffffff"'));
  assert.ok(html.includes("mnyra-go__sheet"));
  assert.ok(html.includes("mnyra-go__head"));
  assert.ok(html.includes("mnyra-go__body"));
  // Kein halbdurchsichtiger Hintergrund und kein Bottom Sheet mehr: die
  // Flaeche steht wie beim Composer ueber der ganzen Seite.
  assert.equal(html.includes("bg-slate-900/50"), false);
  assert.equal(html.includes("rounded-t-"), false);
});

test("the head carries the wordmark left, the cross right and nothing else", () => {
  // Links der Schriftzug der App - "MNYRA" wie im Header, "GO" dicht daneben
  // im Mnyra-Blau. Rechts das Kreuz. In der Mitte nichts.
  const html = renderGoModalCore({ open: true, view: "search", form: { city: "Prishtina" } });
  assert.ok(html.includes("mnyra-go__brand-word"));
  assert.ok(html.includes(">MNYRA</span>"));
  assert.ok(html.includes(">GO</span>"));
  assert.ok(html.indexOf("mnyra-go__brand") < html.indexOf("mnyra-go__x"));
  // Kein Titel und keine Handlung mehr in der Kopfzeile: "Shiko ofertat" steht
  // genau einmal, unten am Ende der Fragen.
  assert.equal(html.includes("mnyra-go__title"), false);
  assert.equal(html.includes("mnyra-go__action"), false);
  const head = html.slice(html.indexOf("mnyra-go__head"), html.indexOf("mnyra-go__body"));
  assert.equal(head.includes("Shiko ofertat"), false);
  const lastStep = renderGoModalCore({ open: true, view: "search", form: { step: "place", city: "Prishtina" } });
  assert.equal((lastStep.match(/Shiko ofertat/g) || []).length, 1);

  // Und das Blau ist das der App (indigo-600), nicht irgendeins.
  assert.ok(GO_MODAL_CSS.includes("--go-accent: #4f46e5"));
  assert.ok(GO_MODAL_CSS.includes(".mnyra-go__brand-go"));

  // Die Kopfzeile ist in jedem Bild dieselbe.
  const booking = renderGoModalCore({
    open: true,
    view: "booking",
    booking: { type: "claim", businessName: "Casa Rita", partySize: 2 }
  });
  assert.ok(booking.includes("mnyra-go__brand-word"));
  assert.ok(booking.includes("data-go-close"));
});

test("under the head stand the cards that explain GO, two and a half in view", () => {
  // Was GO ist, sagen vier Karten in vier kurzen Saetzen - waagerecht, wie die
  // Kennzahl-Reihe im Panel. Sie stehen nur im Suchbild: wer schon ein
  // Ergebnis vor sich hat, braucht die Erklaerung nicht mehr.
  const html = renderGoModalCore({ open: true, view: "search", form: {} });
  assert.ok(html.includes("data-go-how"));
  assert.equal((html.match(/mnyra-go__how-card/g) || []).length, GO_MODAL_HOW_CARDS.length);
  assert.equal(GO_MODAL_HOW_CARDS.length, 4);
  GO_MODAL_HOW_CARDS.forEach((card) => assert.ok(html.includes(card.title)));

  // Zweieinhalb Karten im Bild - dieselbe Rechnung wie im Panel.
  assert.ok(GO_MODAL_CSS.includes("/ 2.5)"));
  assert.ok(GO_MODAL_CSS.includes("overflow-x: auto"));

  const results = renderGoModalCore({ open: true, view: "results", results: [] });
  assert.equal(results.includes("data-go-how"), false);
});

test("the lead says who makes the offer to whom", () => {
  // Ein Gast, der GO zum ersten Mal oeffnet, muss in einer Zeile begreifen:
  // das Angebot kommt vom Lokal zu ihm, nicht umgekehrt.
  const html = renderGoModalCore({ open: true, view: "search", form: {} });
  assert.ok(html.includes("Zbritje ose ofertë"));
  assert.ok(html.includes("lokalet përreth teje"));
});

test("below the questions stands what is else worth knowing", () => {
  const html = renderGoModalCore({ open: true, view: "search", form: {} });
  assert.ok(html.includes("Mirë të dihet"));
  GO_MODAL_INFO_ROWS.forEach((row) => assert.ok(html.includes(row.title)));
  // Und zwar UNTER den Fragen: wer weiss, was er will, laeuft nicht erst
  // daran vorbei.
  assert.ok(html.indexOf("data-go-submit") < html.indexOf("mnyra-go__info"));
});

test("every symbol in the modal is a real lucide icon, none is an emoji", () => {
  // Die App laedt Lucide nach und tauscht <i data-lucide> erst danach aus -
  // sie beobachtet dafuer aber nur den Baum unter #app, und das Modal haengt
  // in #overlayRoot. Ein Platzhalter bliebe dort leer. Deshalb steht hier
  // fertiges SVG, und deshalb steht hier kein Emoji als Ersatz.
  const views = [
    renderGoModalCore({ open: true, view: "search", form: { city: "Prishtina", when: "later" } }),
    renderGoModalCore({
      open: true,
      view: "results",
      results: [{ offerId: "o1", businessName: "Casa Rita", benefitLabel: "–10 %", partySize: 4, distanceKm: 1.2, bookingType: "reservation" }]
    }),
    renderGoModalCore({
      open: true,
      view: "booking",
      canSignIn: true,
      booking: { type: "reservation", businessName: "Casa Rita", partySize: 4, shortCode: "A7K2", city: "Prishtina" }
    }),
    renderGoModalCore({ open: true, view: "error", error: "Gabim" })
  ];
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/u;
  views.forEach((html) => {
    assert.ok(html.includes("<svg"), "a view without a single icon is a view without a symbol");
    assert.equal(emoji.test(html), false, `emoji left in: ${html.match(emoji)?.[0] || ""}`);
    assert.equal(html.includes("data-lucide"), false);
  });
  // Die Geometrie ist die von Lucide, nicht nachgezeichnet.
  assert.ok(goIcon("map-pin").includes('viewBox="0 0 24 24"'));
  assert.ok(goIcon("map-pin").includes('stroke="currentColor"'));
  assert.equal(goIcon("gibt-es-nicht"), "");
});

test("no symbol asked for is a symbol that does not exist", () => {
  // goIcon() gibt fuer einen unbekannten Namen "" zurueck - lieber kein Bild
  // als ein leeres Kaestchen. Der Preis dafuer ist, dass ein Tippfehler
  // spurlos verschwindet: der Knopf steht da, nur ohne Pfeil, und niemand
  // sieht es. Also wird hier nachgezaehlt, was das Modal ueberhaupt anfordert.
  const source = readFileSync(
    new URL("../apps/menyra-social/core/go/go-modal-render-utils.js", import.meta.url),
    "utf8"
  );
  const asked = [...source.matchAll(/goIcon\("([^"]+)"\)/g)].map((match) => match[1]);
  assert.ok(asked.length > 10, "the scan found no icon calls - the pattern is wrong");
  [...new Set(asked)].forEach((name) => {
    assert.notEqual(goIcon(name), "", `goIcon("${name}") renders nothing`);
  });

  // Und die Namen, die aus den Tabellen kommen statt aus dem Aufruf: jede
  // Pille, jedes Wort auf dem Merkzettel und jede Ueberschrift traegt eines.
  const carriesIcon = (html, className) => {
    const parts = html.split(`class="${className}"`).slice(1);
    assert.ok(parts.length, `nothing rendered with class ${className}`);
    parts.forEach((part) => {
      const element = part.slice(0, part.indexOf("</button>") + 1 || part.indexOf("</h2>") + 1 || 400);
      assert.ok(element.includes("<svg"), `${className} without a symbol: ${element.slice(0, 120)}`);
    });
  };
  GO_STEPS.forEach((step) => {
    const html = renderGoModalCore({
      open: true,
      view: "search",
      form: { step, category: "coffee", when: "in30", city: "Prishtina" }
    });
    carriesIcon(html, "mnyra-go__q");
    if (step === "category" || step === "when") carriesIcon(html, "mnyra-go__chip");
    if (step !== "party") carriesIcon(html, "mnyra-go__ask-tag");
  });
});

test("the modal is as tall as what you can SEE, not as the layout viewport", () => {
  // iOS Safari legt "position: fixed" gegen das Layout-Viewport aus - und das
  // ist so hoch wie die Seite ohne Browserleiste. Mit "inset: 0" allein reicht
  // das Modal um die Hoehe der Leiste unter den sichtbaren Rand, und der Boden
  // des scrollenden Bereichs liegt dahinter: Das letzte Stueck Inhalt ist auch
  // am Ende des Scrollwegs nicht zu sehen.
  //
  // Nachstellen laesst sich das hier nicht - headless Chrome hat keine
  // Browserleiste, die ein- und ausfaehrt, und svh, dvh und lvh sind dort
  // alle derselbe Wert. Was dieser Test halten kann, ist die Entscheidung:
  // die Hoehe kommt aus svh, nicht aus "bottom: 0".
  // Ohne die Kommentare - geprueft werden die Deklarationen, nicht die
  // Begruendung daneben (die dvh sehr wohl erwaehnt).
  const shell = GO_MODAL_CSS
    .slice(GO_MODAL_CSS.indexOf(".mnyra-go {"), GO_MODAL_CSS.indexOf(".mnyra-go * {"))
    .replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(shell.includes("height: 100svh"));
  // svh und nicht dvh: dvh waechst beim Einfahren der Leiste, und ein
  // Scroll-Container, der unter dem Finger waechst, springt.
  assert.equal(shell.includes("100dvh"), false);
  // Der Rueckfall steht davor, sonst gaebe es fuer alte Browser gar keine.
  assert.ok(shell.indexOf("height: 100%") < shell.indexOf("height: 100svh"));
});

test("the stylesheet ships with the markup, not with tailwind", () => {
  // Das Panel-CSS der App wird generiert; ein Modal, das darauf wartet, sieht
  // beim ersten Aufbau kaputt aus. Deshalb bringt GO sein eigenes mit - genau
  // wie Dashboard und Composer.
  assert.ok(GO_MODAL_CSS.includes(".mnyra-go__sheet"));
  assert.ok(GO_MODAL_CSS.includes("--safe-area-bottom"));
  assert.ok(GO_MODAL_CSS.includes("min-height: 44px"));
  assert.ok(GO_MODAL_CSS.includes("prefers-reduced-motion"));
});

test("everything that can be preselected is preselected", () => {
  const form = { partySize: 2, category: "all", when: "now", city: "Prishtina" };
  const category = renderGoModalCore({ open: true, view: "search", form: { ...form, step: "category" } });
  const when = renderGoModalCore({ open: true, view: "search", form: { ...form, step: "when" } });
  const place = renderGoModalCore({ open: true, view: "search", form: { ...form, step: "place" } });

  // Auf jedem Schritt steht genau eine Antwort schon da: "Krejt", "Tani" -
  // und die Stadt, die die App ohnehin kennt.
  assert.equal((category.match(/aria-pressed="true"/g) || []).length, 1);
  assert.ok(category.includes("Krejt"));
  assert.equal((when.match(/aria-pressed="true"/g) || []).length, 1);
  assert.ok(when.includes("Tani"));
  assert.ok(place.includes("Prishtina"));

  // Und der Knopf verspricht nichts Falsches (Punkt 15).
  assert.ok(place.includes("Shiko ofertat"));
  assert.equal(/dërgo kërkesën/i.test(place), false);
});

test("one question stands in the picture, not four", () => {
  // Vier Fragen untereinander sind ein Formular - und ein Formular beantwortet
  // niemand im Stehen vor einem Lokal.
  const first = renderGoModalCore({ open: true, view: "search", form: {} });
  assert.ok(first.includes("Sa veta jeni?"));
  assert.equal(first.includes("Çka dëshironi?"), false);
  assert.equal(first.includes("Kur?"), false);
  assert.equal(first.includes("Shiko ofertat"), false);
  // Der erste Schritt hat keinen Weg zurueck, wohl aber einen nach vorn: ein
  // Regler ist nie "fertig", also braucht er einen Knopf.
  assert.equal(first.includes("data-go-step-back"), false);
  assert.ok(first.includes("data-go-step-next"));
  assert.ok(first.includes("Hapi 1/4"));

  const third = renderGoModalCore({ open: true, view: "search", form: { step: "when" } });
  assert.ok(third.includes("Kur?"));
  assert.equal(third.includes("Sa veta jeni?"), false);
  assert.ok(third.includes("data-go-step-back"));
  assert.ok(third.includes("Hapi 3/4"));
  // Eine angetippte Pille ist die Antwort - kein Knopf noetig.
  assert.equal(third.includes("data-go-step-next"), false);
  // Ausser bei "Më vonë": das hat erst eine Antwort, wenn die Uhrzeit da ist.
  const later = renderGoModalCore({ open: true, view: "search", form: { step: "when", when: "later" } });
  assert.ok(later.includes("data-go-step-next"));
});

test("an answer already given stays one tap away", () => {
  // Eine Antwort, die man nur durch Neuanfangen aendern kann, ist eine Falle.
  const html = renderGoModalCore({
    open: true,
    view: "search",
    form: { step: "place", partySize: 6, category: "coffee", when: "in30", city: "Prishtina" }
  });
  assert.ok(html.includes('data-go-goto="party"'));
  assert.ok(html.includes('data-go-goto="category"'));
  assert.ok(html.includes('data-go-goto="when"'));
  // Und jede traegt ihre Antwort in einem Wort.
  assert.ok(html.includes("6 veta"));
  assert.ok(html.includes("Kafe"));
  assert.ok(html.includes("+30 min"));
  // Auf dem ersten Schritt gibt es noch nichts zu zeigen.
  const first = renderGoModalCore({ open: true, view: "search", form: {} });
  assert.equal(first.includes("data-go-goto"), false);
});

test("the steps know their order, and a wrong one starts at the front", () => {
  assert.deepEqual([...GO_STEPS], ["party", "category", "when", "place"]);
  assert.equal(resolveGoStep(""), "party");
  assert.equal(resolveGoStep("gibt-es-nicht"), "party");
  assert.equal(nextGoStep("party"), "category");
  assert.equal(nextGoStep("place"), "place");
  assert.equal(previousGoStep("category"), "party");
  assert.equal(previousGoStep("party"), "party");
});

test("the question card stands on top, the explanation in the bento below it", () => {
  const html = renderGoModalCore({ open: true, view: "search", form: {} });
  assert.ok(html.indexOf("mnyra-go__ask") < html.indexOf("mnyra-go__bento"));
  assert.ok(html.indexOf("mnyra-go__bento") < html.indexOf("data-go-how"));
  assert.ok(html.indexOf("data-go-how") < html.indexOf("mnyra-go__info"));
  // Die Karte hebt sich mit einem Schatten ab, das Bento faengt mit runden
  // Ecken an.
  assert.ok(GO_MODAL_CSS.includes(".mnyra-go__ask {"));
  assert.ok(/\.mnyra-go__ask \{[^}]*box-shadow:/s.test(GO_MODAL_CSS));
  assert.ok(/\.mnyra-go__bento \{[^}]*border-radius: 34px 34px 0 0/s.test(GO_MODAL_CSS));
});

test("the group size is a slider from 1 to 10, not a row of buttons", () => {
  const html = renderGoModalCore({ open: true, view: "search", form: { partySize: 4 } });
  assert.ok(html.includes('type="range"'));
  assert.ok(html.includes("data-go-party-range"));
  assert.ok(html.includes(`min="${GO_PARTY_SIZE_MIN}"`));
  assert.ok(html.includes(`max="${GO_PARTY_SIZE_MAX}"`));
  assert.equal(GO_PARTY_SIZE_MAX, 10);
  assert.ok(html.includes('value="4"'));
  // Die Zahl steht gross ueber dem Regler: der Daumen liegt beim Ziehen auf
  // dem Griff und verdeckt ihn.
  assert.ok(html.includes("data-go-party-value"));
  assert.ok(html.includes("4 <span>veta</span>"));
  // Und sie zaehlt albanisch: einer ist ein "person", mehrere sind "veta".
  assert.equal(goPartyLabel(1), "1 person");
  assert.equal(goPartyLabel(7), "7 veta");
  // Der Regler kann nichts Ungueltiges liefern - der Zustand aus einer alten
  // Sitzung sehr wohl.
  assert.equal(clampGoPartySize(0), 1);
  assert.equal(clampGoPartySize(99), 10);
  assert.equal(clampGoPartySize("abc"), 2);
  // Die gefuellte Schiene sagt, wo man steht.
  assert.equal(goPartyFillPercent(1), 0);
  assert.equal(goPartyFillPercent(10), 100);
  // Keine Pillen mehr fuer die Gruppengroesse.
  assert.equal(html.includes("data-go-party="), false);
});

test("the guest is not asked about money at all", () => {
  // Das Budget war die einzige Frage, deren Antwort dem Gast Angebote wegnimmt,
  // statt welche zu bringen - und die er nicht beantworten kann, bevor er
  // weiss, was es ueberhaupt gibt. Sie ist weg, in jedem Zustand.
  const html = renderGoModalCore({ open: true, view: "search", form: { showBudget: true, budget: "low" } });
  assert.equal(html.includes("buxhet"), false);
  assert.equal(html.includes("Buxheti"), false);
  assert.equal(html.includes("deri 10 €"), false);
  assert.equal(html.includes("data-go-budget"), false);
});

test("the four things a guest wants are the four that can be picked", () => {
  const html = renderGoModalCore({ open: true, view: "search", form: { step: "category" } });
  ["Krejt", "Kafe", "Pije", "Ushqim", "Ëmbëlsira"].forEach((label) => {
    assert.ok(html.includes(`>${label}</span>`), `missing category ${label}`);
  });
  assert.equal(html.includes("Brunch"), false);
  // "Krejt" ist die Voreinstellung und steht deshalb allein in der ersten
  // Zeile, nicht als eine von zweien.
  assert.ok(html.includes("mnyra-go__chip--wide"));
});

test("the city can actually be changed, not only looked at", () => {
  // Der Knopf "Ndrysho" stand da, ohne dass etwas dahinter lag. Jetzt oeffnet
  // er ein Feld, und "Ruaj" schliesst es wieder.
  const idle = renderGoModalCore({ open: true, view: "search", form: { step: "place", city: "Prishtina" } });
  assert.ok(idle.includes("data-go-change-city"));
  assert.ok(idle.includes("Prishtina"));
  assert.equal(idle.includes("data-go-city-input"), false);

  const editing = renderGoModalCore({
    open: true,
    view: "search",
    form: { step: "place", city: "Prishtina", editCity: true }
  });
  assert.ok(editing.includes("data-go-city-input"));
  assert.ok(editing.includes("data-go-city-save"));

  // Ohne Stadt steht dort eine Aufforderung, kein leeres Feld.
  const empty = renderGoModalCore({ open: true, view: "search", form: { step: "place", city: "" } });
  assert.ok(empty.includes("Shto qytetin tënd"));
});

test("only 'më vonë' opens a date field", () => {
  const at = (when) => renderGoModalCore({ open: true, form: { step: "when", when } });
  assert.equal(at("now").includes("datetime-local"), false);
  assert.ok(at("later").includes("datetime-local"));
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
  // Und darunter steht, was zu tun ist - nicht nur, dass nichts da ist.
  assert.ok(html.includes("Provo me një orë tjetër"));
  assert.ok(html.includes("data-go-back"));
});

test("every text goes through the escaping, the own ones too", () => {
  const html = renderGoModalCore({
    open: true,
    view: "results",
    results: [],
    texts: { emptySubtitle: "Lokale që mund t'ju pëlqejnë" }
  });
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

// Ein Dokument, das gerade so viel kann, wie der Ablauf braucht - und genau
// die Stellen, die das Modal wie der Composer benutzt: eine Buehne
// (#overlayRoot), ein Stylesheet im Kopf und eine Flaeche, die eingehaengt
// und wieder entfernt wird.
function makeFakeClassList() {
  const set = new Set();
  return {
    add: (name) => set.add(name),
    remove: (name) => set.delete(name),
    contains: (name) => set.has(name),
    toggle: (name, force) => (force ? set.add(name) : set.delete(name))
  };
}

// Ein style-Objekt, das sich merken kann, was hineingeschrieben wurde - sonst
// laesst sich nicht pruefen, welche Farbe der Rand am Ende traegt.
function makeFakeStyle() {
  const props = new Map();
  return {
    setProperty(name, value) { props.set(name, String(value)); },
    removeProperty(name) { props.delete(name); },
    getPropertyValue(name) { return props.get(name) || ""; }
  };
}

function createFakeDocument() {
  const nodes = new Map();
  const make = (tag = "div") => {
    const node = {
      tagName: String(tag || "div").toUpperCase(),
      id: "",
      className: "",
      textContent: "",
      dataset: {},
      innerHTML: "",
      attributes: {},
      parentNode: null,
      style: makeFakeStyle(),
      classList: makeFakeClassList(),
      children: [],
      // Was der Controller an sich selbst haengt - damit ein Test einen Tipp
      // und einen Zug am Regler wirklich ausloesen kann und nicht nur die
      // Zustandsfelder von aussen setzt.
      listeners: {},
      // Was querySelector() finden soll. Der Controller sucht darin die Zahl
      // ueber dem Regler und das Stadtfeld.
      stubs: {},
      setAttribute(name, value) { this.attributes[name] = String(value); },
      getAttribute(name) { return this.attributes[name] ?? null; },
      appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        if (child.id) nodes.set(child.id, child);
        return child;
      },
      remove() {
        if (this.id) nodes.delete(this.id);
        this.parentNode = null;
      },
      addEventListener(type, handler) {
        (this.listeners[type] = this.listeners[type] || []).push(handler);
      },
      dispatch(type, event = {}) {
        (this.listeners[type] || []).forEach((handler) => handler({ preventDefault() {}, ...event }));
      },
      querySelector(selector) { return this.stubs[selector] || null; },
      querySelectorAll() { return []; }
    };
    return node;
  };
  const head = make("head");
  const body = make("body");
  const documentElement = make("html");
  return {
    head,
    body,
    documentElement,
    getElementById: (id) => nodes.get(id) || null,
    createElement: (tag) => make(tag),
    // Die Shell fragt so, ob ueberhaupt ein Modal steht. GO ist hier das
    // einzige - es haengt genau so lange im Baum, wie es offen ist.
    querySelector: (selector) => (
      selector === "#overlayRoot .modal-overlay"
        ? nodes.get("mnyraGoOverlayRoot") || null
        : null
    ),
    querySelectorAll: (selector) => {
      if (selector !== "#overlayRoot .modal-overlay") return [];
      const modal = nodes.get("mnyraGoOverlayRoot");
      return modal ? [modal] : [];
    },
    addEventListener() {},
    __nodes: nodes
  };
}

// Ein Ereignisziel, wie es der Browser liefert: es weiss, in welchem Knopf es
// steckt (closest) und was es selbst ist (matches).
function fakeTarget({ within = {}, is = [], value = "" } = {}) {
  return {
    value,
    style: { setProperty() {} },
    setAttribute() {},
    closest: (selector) => (
      Object.prototype.hasOwnProperty.call(within, selector)
        ? { getAttribute: (name) => within[selector][name] ?? null }
        : null
    ),
    matches: (selector) => is.includes(selector)
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

function createController(api, doc = createFakeDocument()) {
  return createGoRuntimeController({
    documentObj: doc,
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

// ===========================================================================
// Die Fragen, wie sie ein Daumen bedient.
// ===========================================================================

test("dragging the slider changes the group size without rebuilding the modal", async () => {
  // Waehrend des Ziehens darf nicht neu gezeichnet werden - sonst nimmt der
  // Neuaufbau dem Finger den Griff, den er gerade haelt. Der Zustand geht
  // trotzdem mit, und die Suche schickt die neue Zahl.
  const doc = createFakeDocument();
  const api = createFakeApi();
  const controller = createController(api, doc);
  await controller.open("search");

  const modal = doc.getElementById("mnyraGoOverlayRoot");
  const output = { innerHTML: "" };
  modal.stubs["[data-go-party-value]"] = output;
  const before = modal.innerHTML;

  modal.dispatch("input", { target: fakeTarget({ is: ["[data-go-party-range]"], value: "7" }) });
  assert.equal(controller.state.form.partySize, 7);
  assert.equal(modal.innerHTML, before, "the modal was rebuilt mid-drag");
  assert.equal(output.innerHTML, "7 <span>veta</span>");

  // Ein Wert ausserhalb des Reglers landet trotzdem im Rahmen.
  modal.dispatch("input", { target: fakeTarget({ is: ["[data-go-party-range]"], value: "40" }) });
  assert.equal(controller.state.form.partySize, 10);

  await controller.__submitSearch();
  const request = api.calls.find((entry) => entry[0] === "search")[1];
  assert.equal(request.partySize, 10);
});

test("a tap on a category is a tap, and the search carries it", async () => {
  const doc = createFakeDocument();
  const api = createFakeApi();
  const controller = createController(api, doc);
  await controller.open("search");

  const modal = doc.getElementById("mnyraGoOverlayRoot");
  modal.dispatch("click", {
    target: fakeTarget({ within: { "[data-go-category]": { "data-go-category": "dessert" } } })
  });
  assert.equal(controller.state.form.category, "dessert");

  modal.dispatch("click", {
    target: fakeTarget({ within: { "[data-go-when]": { "data-go-when": "in60" } } })
  });
  assert.equal(controller.state.form.when, "in60");

  await controller.__submitSearch();
  const request = api.calls.find((entry) => entry[0] === "search")[1];
  assert.equal(request.category, "dessert");
  // "+1 orë" heisst eine Stunde spaeter - und nicht mehr "jetzt".
  assert.equal(request.requestedAt, Date.parse("2026-08-13T15:00:00.000Z"));
});

test("answering walks forward on its own, and every answer stays reachable", async () => {
  const doc = createFakeDocument();
  const controller = createController(createFakeApi(), doc);
  await controller.open("search");
  const modal = doc.getElementById("mnyraGoOverlayRoot");
  // Jedes Modal faengt bei der ersten Frage an.
  assert.equal(controller.state.form.step, "party");

  // Der Regler ist nie "fertig" - er wird mit dem Knopf abgeschlossen.
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-step-next]": {} } }) });
  assert.equal(controller.state.form.step, "category");

  // Eine angetippte Pille schaltet von selbst weiter.
  modal.dispatch("click", {
    target: fakeTarget({ within: { "[data-go-category]": { "data-go-category": "coffee" } } })
  });
  assert.equal(controller.state.form.step, "when");

  // "Më vonë" nicht: dort fehlt noch die Uhrzeit.
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-when]": { "data-go-when": "later" } } }) });
  assert.equal(controller.state.form.when, "later");
  assert.equal(controller.state.form.step, "when");
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-when]": { "data-go-when": "now" } } }) });
  assert.equal(controller.state.form.step, "place");

  // Zurueck geht Schritt fuer Schritt - und mit einem Sprung auf jede Antwort.
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-step-back]": {} } }) });
  assert.equal(controller.state.form.step, "when");
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-goto]": { "data-go-goto": "party" } } }) });
  assert.equal(controller.state.form.step, "party");
  // Ein unbekannter Sprung landet nicht im Nichts.
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-goto]": { "data-go-goto": "wohin?" } } }) });
  assert.equal(controller.state.form.step, "party");
});

test("back from the results lands on the last step, not at the front", async () => {
  const doc = createFakeDocument();
  const controller = createController(createFakeApi(), doc);
  await controller.open("search");
  await controller.__submitSearch();
  assert.equal(controller.state.view, "results");

  const modal = doc.getElementById("mnyraGoOverlayRoot");
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-back]": {} } }) });
  assert.equal(controller.state.view, "search");
  // "Eine Kleinigkeit anders", nicht "von vorn": der Knopf steht schon da, und
  // der Merkzettel darueber traegt jede Antwort.
  assert.equal(controller.state.form.step, "place");
});

// ===========================================================================
// Der Rand des Bildschirms (die Einfaerbung oben und unten).
// ===========================================================================

test("GO tints the safe areas like every other modal, and gives them back", async () => {
  // GO hing im overlayRoot, ohne der App zu sagen, dass ein Modal offen ist.
  // Oben und unten blieb deshalb das Grau der App stehen, waehrend die Flaeche
  // dazwischen weiss war - zwei sichtbare Streifen an den Raendern.
  const doc = createFakeDocument();
  const controller = createController(createFakeApi(), doc);
  const surface = () => doc.documentElement.style.getPropertyValue("--active-modal-surface");

  await controller.open("search");
  assert.equal(surface(), "#ffffff");
  assert.equal(doc.documentElement.classList.contains("modal-open"), true);
  assert.equal(doc.body.classList.contains("modal-open"), true);

  // Die beiden Flaechen, die den sicheren Bereich ueberhaupt erst einfaerben,
  // gibt es - GO baute sich seinen Wirt frueher ohne sie.
  ["safariChromeTintTop", "safariChromeTintBottom"].forEach((id) => {
    const tint = doc.getElementById(id);
    assert.ok(tint, `${id} missing`);
    assert.equal(tint.style.display, "block");
    assert.equal(tint.style.background, "#ffffff");
  });

  // Und die Farbe kommt vom Modal selbst, nicht aus einer zweiten Abschrift.
  const modal = doc.getElementById("mnyraGoOverlayRoot");
  assert.equal(modal.getAttribute("data-modal-surface"), "#ffffff");

  controller.close();
  assert.equal(surface(), "#f8fafc");
  assert.equal(doc.documentElement.classList.contains("modal-open"), false);
  ["safariChromeTintTop", "safariChromeTintBottom"].forEach((id) => {
    assert.equal(doc.getElementById(id).style.display, "none");
  });
});

test("the city is really changed, and the change reaches the server", async () => {
  const doc = createFakeDocument();
  const api = createFakeApi();
  const controller = createController(api, doc);
  await controller.open("search");
  assert.equal(controller.state.form.city, "Prishtina");
  assert.equal(controller.state.form.editCity, false);

  const modal = doc.getElementById("mnyraGoOverlayRoot");
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-change-city]": {} } }) });
  assert.equal(controller.state.form.editCity, true);

  modal.dispatch("input", { target: fakeTarget({ is: ["[data-go-city-input]"], value: "Gjakova" }) });
  assert.equal(controller.state.form.city, "Gjakova");

  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-city-save]": {} } }) });
  assert.equal(controller.state.form.editCity, false);

  await controller.__submitSearch();
  assert.equal(api.calls.find((entry) => entry[0] === "search")[1].city, "Gjakova");

  // Enter im Feld ist dasselbe wie "Ruaj".
  modal.dispatch("click", { target: fakeTarget({ within: { "[data-go-change-city]": {} } }) });
  modal.dispatch("keydown", {
    key: "Enter",
    target: fakeTarget({ is: ["[data-go-city-input]"], value: "Peja" })
  });
  assert.equal(controller.state.form.city, "Peja");
  assert.equal(controller.state.form.editCity, false);
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
