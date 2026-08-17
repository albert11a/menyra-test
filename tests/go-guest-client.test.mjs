import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  formatGoCardArrival,
  renderGoEntryCardCore,
  renderGoStickyBarCore
} from "../apps/menyra-social/core/go/go-entry-card-render-utils.js";
import {
  GO_CITIES,
  GO_PAGE_CSS,
  GO_PAGE_STORY_BASE,
  GO_PAGE_STORY_SLIDES,
  GO_WHEEL_ITEM_HEIGHT,
  goStoryPlainText,
  GO_STEPS,
  clampGoPartySize,
  goDateKey,
  goDateLabel,
  goLaterValue,
  goPartyLabel,
  goWhenSaveLabel,
  nextGoStep,
  previousGoStep,
  renderGoPageCore,
  resolveGoStep
} from "../apps/menyra-social/core/go/go-page-render-utils.js";
import { goIcon } from "../apps/menyra-social/core/go/go-icon-render-utils.js";
import { goApiInternals } from "../apps/menyra-social/core/go/go-api-client.js";
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
import { createGoPageViewController } from "../apps/menyra-social/core/go/go-page-view-controller.js";

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

test("the page renders its two parts: the card on top, the bento below", () => {
  // GO ist keine Flaeche ueber der Seite mehr, sondern eine Seite. Damit
  // gehoert ihm der Rand des Bildschirms nicht mehr - Kopfzeile, sicherer
  // Bereich und Browserleiste sind wieder Sache der App-Huelle.
  const html = renderGoPageCore({ view: "search", form: { city: "Prishtina" } });
  assert.ok(html.includes('class="mnyra-go-page"'));
  assert.ok(html.includes("mnyra-go-page__top"));
  assert.ok(html.includes("mnyra-go-page__bento"));
  assert.ok(html.indexOf("mnyra-go-page__top") < html.indexOf("mnyra-go-page__bento"));
});

test("nothing of the overlay is left", () => {
  // Kein "modal-overlay", keine eigene Flaeche, kein Kreuz: All das kam von
  // der Huelle, die GO sich selbst gebaut hatte - und mit ihr die Fragen nach
  // der Farbe des Randes, die sich nicht beantworten liessen.
  const html = renderGoPageCore({ view: "search", form: { city: "Prishtina" } });
  assert.equal(html.includes("modal-overlay"), false);
  assert.equal(html.includes("data-modal-surface"), false);
  assert.equal(html.includes("data-go-close"), false);
  assert.equal(html.includes("position: fixed"), false);
  assert.equal(GO_PAGE_CSS.includes("position: fixed"), false);
  // Hier stand einmal "kein svh". Die Einheit war nie das Problem - das
  // Modal war es, weil es sich den GANZEN Bildschirm nahm (100svh). Der
  // Abstand zwischen den Kapiteln misst heute an der Fensterhoehe, und das
  // ist etwas anderes. Verboten bleibt der Griff nach der vollen Hoehe.
  assert.equal(/\b100(s|d|l)?vh\b/.test(GO_PAGE_CSS), false);
});

test("the bento is white on the colour of GO, and only its top is rounded", () => {
  // Der Aufbau des Feed-Gates: eine gesaettigte Flaeche oben, das weisse Bento
  // mit runden Ecken darueber. Andersherum waere die Rundung nicht zu sehen -
  // eine gerundete Kante braucht eine andere Farbe hinter sich. Weil das Bento
  // bis ans Ende der Seite laeuft, sind nur die oberen Ecken gerundet.
  assert.ok(GO_PAGE_CSS.includes("--go-bento-surface: #ffffff"));
  assert.ok(GO_PAGE_CSS.includes("--go-bento-radius: 2.5rem"));
  assert.ok(GO_PAGE_CSS.includes("--go-chrome: #635bff"));
  assert.ok(/\.mnyra-go-page__top \{[^}]*background: var\(--go-chrome\)/s.test(GO_PAGE_CSS));
  // Die Farbe des Streifens ist nicht die der betonten Woerter - eine Flaeche
  // und ein Schriftzug brauchen nicht dieselbe Zahl.
  assert.notEqual(
    GO_PAGE_CSS.match(/--go-chrome: (#[0-9a-f]{6})/)[1],
    GO_PAGE_CSS.match(/--go-accent: (#[0-9a-f]{6})/)[1]
  );
  assert.ok(/\.mnyra-go-page__bento \{[^}]*border-top-left-radius: var\(--go-bento-radius\)/s.test(GO_PAGE_CSS));
  assert.equal(/\.mnyra-go-page__bento \{[^}]*border-bottom/s.test(GO_PAGE_CSS), false);

  // "Merr ofertat" steht genau einmal, am Ende der Fragen - und "Shiko
  // ofertat" steht dort noch gar nicht: Es gibt noch nichts zu sehen.
  const lastStep = renderGoPageCore({ view: "search", form: { step: "place", city: "Prishtina" } });
  assert.equal((lastStep.match(/Merr ofertat/g) || []).length, 1);
  assert.equal(lastStep.includes("Shiko ofertat"), false);
});

test("GO stands on the line of the header icons, and reads it from one mark", () => {
  // Der Seitenabstand ist der der Kopfzeile: Die gezeichneten Kanten des
  // Menue-Icons links und des Warenkorb-Icons rechts stehen 2rem vom Rand.
  // Genau dort stehen die Frage-Karte und alles im Bento - nicht auf der
  // Kante der unsichtbaren Button-Kaesten (1.5rem), die acht Pixel weiter
  // aussen liegt.
  //
  // Streifen und Bento lesen dieselbe Marke, und niemand rechnet daneben eine
  // zweite aus.
  assert.ok(GO_PAGE_CSS.includes("--go-inline: 2rem"));
  assert.ok(/\.mnyra-go-page__top \{[^}]*padding: 2\.25rem var\(--go-inline\)/s.test(GO_PAGE_CSS));
  assert.ok(/\.mnyra-go-page__bento \{[^}]*padding: 2\.35rem var\(--go-inline\) 2rem/s.test(GO_PAGE_CSS));

  // Kein Rest der alten, festen Zahlen an den Raendern.
  assert.equal(/\.mnyra-go-page__top \{[^}]*16px/s.test(GO_PAGE_CSS), false);
  assert.equal(GO_PAGE_CSS.includes("var(--app-content-inline"), false);
});

test("the two shadows do not meet: the card floats, the bento only shows its edge", () => {
  // Der Schatten der Karte faellt nach unten, der des Bentos nach oben. Ohne
  // Luft dazwischen laufen sie ineinander, und zwei Schatten uebereinander
  // sehen aus wie Schmutz statt wie Tiefe. Deshalb sitzt unter der Karte mehr
  // Abstand (34px) als ueber ihr, und der Schatten des Bentos ist knapp.
  const ask = GO_PAGE_CSS.match(/\.mnyra-go-page__ask \{[^}]*\}/s)?.[0] || "";
  const bento = GO_PAGE_CSS.match(/\.mnyra-go-page__bento \{[^}]*\}/s)?.[0] || "";
  // Mehrere Lagen statt einer harten Kante.
  assert.ok((ask.match(/rgba\(var\(--go-chrome-shadow\)/g) || []).length >= 3);
  // Nach oben: negatives Y.
  assert.ok(/box-shadow: 0 -\d+px/.test(bento));
  // Beide Schatten liegen auf der Farbe und sind deshalb in ihrer Familie
  // getoent - ein neutraler Schiefer-Schatten legt einen grauen Schleier
  // darauf, statt sie zu verdunkeln.
  assert.ok(GO_PAGE_CSS.includes("--go-chrome-shadow:"));
  assert.equal(ask.includes("rgba(15, 23, 42"), false);
  assert.equal(bento.includes("rgba(15, 23, 42"), false);
});

test("under the head stands the picture story, four pictures in their order", () => {
  // Was GO ist, erzaehlen vier Bilder mit je einem Satz - untereinander, in
  // der Reihenfolge der Sache selbst. Sie stehen nur im Suchbild: wer schon
  // ein Ergebnis vor sich hat, braucht die Erklaerung nicht mehr.
  const html = renderGoPageCore({ view: "search", form: {} });
  assert.ok(html.includes("data-go-story"));
  assert.equal(GO_PAGE_STORY_SLIDES.length, 4);
  assert.equal((html.match(/data-go-story-slide=/g) || []).length, 4);

  // Die Reihenfolge steht im Markup, nicht im Zufall.
  GO_PAGE_STORY_SLIDES.forEach((slide, index) => {
    assert.ok(html.includes(`data-go-story-slide="${index}"`));
    assert.ok(html.includes(GO_PAGE_STORY_BASE + slide.file));
  });
  // Kein "1 / 4" unter den Bildern: Vier Bilder untereinander zaehlt man
  // nicht ab, man sieht sie.
  assert.equal(/\d\s*\/\s*4/.test(html.slice(html.indexOf("data-go-story"))), false);
  assert.equal(GO_PAGE_CSS.includes("story-step"), false);
  const positions = GO_PAGE_STORY_SLIDES.map((slide) => html.indexOf(slide.file));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));

  // Wer ein Angebot vor sich hat, braucht die Erklaerung nicht mehr.
  const withOffers = renderGoPageCore({
    view: "results",
    results: [{ offerId: "o1", businessName: "Casa Rita", benefitLabel: "–10 %", partySize: 2 }]
  });
  assert.equal(withOffers.includes("data-go-story"), false);

  // Ohne Angebot steht sie wieder da. Die Lage nach einer erfolglosen Suche ist
  // genau die von vorher - es gibt noch nichts zu sehen -, und ein Bento, in
  // dem gar nichts steht, ist eine weisse Flaeche und keine Auskunft. Der Satz
  // "Nuk gjetëm ofertë" steht oben auf der Karte; ihn hier zu wiederholen,
  // macht ihn nicht wahrer.
  const empty = renderGoPageCore({ view: "results", results: [] });
  assert.ok(empty.includes("data-go-story"));
  assert.equal((empty.match(/Nuk gjetëm ofertë/g) || []).length, 1);
  const broken = renderGoPageCore({ view: "error", error: "Gabim" });
  assert.ok(broken.includes("data-go-story"));
});

test("a failure is a result of the search, not another page", () => {
  // Vorher fiel im Fehlerfall der ganze Aufbau weg - kein Streifen, keine
  // Karte -, und uebrig blieb ein weisser Streifen mit einem Satz darin, der
  // aussah, als sei die Seite abgestuerzt.
  const html = renderGoPageCore({ view: "error", error: "Gabim i rende" });
  assert.ok(html.includes("mnyra-go-page__top"));
  assert.ok(html.includes("mnyra-go-page__ask"));
  assert.ok(html.indexOf("mnyra-go-page__top") < html.indexOf("mnyra-go-page__bento"));
  assert.ok(html.includes("Gabim i rende"));
  assert.ok(html.includes("data-go-retry"));
  // Der Satz steht einmal, auf der Karte - nicht noch einmal darunter.
  assert.equal((html.match(/Gabim i rende/g) || []).length, 1);

  // Mit Alternativen fuehrt der Knopf nicht zurueck an den Anfang, sondern zu
  // ihnen: sie stehen im Bento wie Angebote.
  const soldOut = renderGoPageCore({
    view: "error",
    error: "Kjo ofertë sapo u plotësua.",
    alternatives: [{ offerId: "o2", businessName: "Bro Pizza", benefitLabel: "–15 %", partySize: 4 }]
  });
  assert.ok(soldOut.includes("data-go-result"));
  assert.equal(soldOut.includes("data-go-retry"), false);
  assert.equal(soldOut.includes("data-go-story"), false);

  // Und die Seite nimmt ihren Platz ein, statt auf halber Hoehe zu enden -
  // sonst stuende unter dem weissen Bento der graue Grund der Seite.
  assert.ok(/\.mnyra-go-page \{[^}]*flex: 1 0 auto/s.test(GO_PAGE_CSS));
});

test("the question lies ON the picture, on the side where the photo is empty", () => {
  // Die Fotos sind leer, die Frage liegt als echter Text darauf: lesbar,
  // vergroesserbar, uebersetzbar - und aenderbar, ohne dass jemand vier
  // Bilder neu setzt.
  const html = renderGoPageCore({ view: "search", form: {} });
  const withHeadline = GO_PAGE_STORY_SLIDES.filter((slide) => slide.headline);
  assert.equal(withHeadline.length, 3);
  assert.equal((html.match(/mnyra-go-page__story-headline"/g) || []).length, 3);

  // Die Seite steht am Bild, nicht am Text: Sie sagt, wo das Foto leer ist.
  GO_PAGE_STORY_SLIDES.forEach((slide) => {
    assert.ok(["left", "right"].includes(slide.side));
    assert.ok(html.includes(`data-go-story-side="${slide.side}"`));
  });
  assert.ok(GO_PAGE_CSS.includes('[data-go-story-side="left"]'));
  assert.ok(GO_PAGE_CSS.includes('[data-go-story-side="right"]'));

  // Das Bild ist breiter als sein Fenster - jedes Foto sagt, welche Seite
  // beim Beschneiden stehen bleibt. Ohne das schnitte es mittig und naehme
  // von der Person UND von der Flaeche, auf der die Frage steht.
  GO_PAGE_STORY_SLIDES.forEach((slide) => {
    assert.ok(["left", "right", "center"].includes(slide.focus), `focus fehlt: ${slide.file}`);
    assert.ok(html.includes(`data-go-story-focus="${slide.focus}"`));
  });
  ["left", "right", "center"].forEach((focus) => {
    assert.ok(GO_PAGE_CSS.includes(`[data-go-story-focus="${focus}"] img { object-position:`));
  });
  // Wo eine Frage im Bild steht, liegt das Motiv auf der anderen Seite -
  // sonst schnitte der Zuschnitt genau die Flaeche weg, die sie braucht.
  GO_PAGE_STORY_SLIDES.filter((slide) => slide.headline).forEach((slide) => {
    assert.notEqual(slide.focus, slide.side, `Frage und Motiv auf derselben Seite: ${slide.file}`);
  });

  // Das letzte Bild traegt keine Frage - es ist das Ende, nicht die naechste.
  assert.equal(GO_PAGE_STORY_SLIDES.at(-1).headline, null);

  // Ueber die halbe Breite geht die Frage nie: Die andere Haelfte gehoert dem
  // Foto.
  const headline = GO_PAGE_CSS.match(/\.mnyra-go-page__story-headline \{[^}]*\}/s)?.[0] || "";
  const width = Number(headline.match(/max-width: (\d+)%/)?.[1]);
  assert.ok(width > 0 && width <= 50, `zu breit: ${width}%`);
  // Und sie faengt keinen Tipp ab, der dem gilt, was darunter liegt.
  assert.ok(headline.includes("pointer-events: none"));
});

test("every picture says in its alt what it shows, not what stands next to it", () => {
  // Frueher stand die Frage im Bild, also trug das alt sie. Jetzt ist sie
  // echter Text daneben - das alt beschreibt deshalb das Foto. Beides
  // doppelt zu sagen hiesse, es einem Screenreader zweimal vorzulesen.
  const html = renderGoPageCore({ view: "search", form: {} });
  GO_PAGE_STORY_SLIDES.forEach((slide) => {
    assert.ok(slide.alt && slide.alt.length > 8, `alt fehlt: ${slide.file}`);
    assert.ok(html.includes(`alt="${slide.alt.replace(/'/g, "&#39;")}"`));
    if (!slide.headline) return;
    assert.equal(slide.alt.includes(goStoryPlainText(slide.headline)), false);
  });
});

test("the sentences below carry the accent, one place each", () => {
  const html = renderGoPageCore({ view: "search", form: {} });
  GO_PAGE_STORY_SLIDES.forEach((slide) => {
    slide.text.forEach((part) => {
      if (typeof part === "string") {
        assert.ok(html.includes(part.replace(/'/g, "&#39;")));
        return;
      }
      const accent = part.accent.replace(/'/g, "&#39;");
      assert.ok(html.includes(`<span class="mnyra-go-page__story-accent">${accent}</span>`));
    });
    assert.equal(slide.text.filter((part) => typeof part !== "string").length, 1);
    assert.ok(goStoryPlainText(slide.text).length > 30);
  });
  assert.equal((html.match(/mnyra-go-page__story-accent/g) || []).length, 4);
  // Betont wird mit der Farbe, nicht zusaetzlich mit der Schriftstaerke.
  const accentRule = GO_PAGE_CSS.match(/\.mnyra-go-page__story-accent \{[^}]*\}/s)?.[0] || "";
  assert.ok(accentRule.includes("color: var(--go-accent)"));
  assert.equal(accentRule.includes("font-weight"), false);
});

test("image and sentence uncover one after the other, not chapter by chapter", () => {
  // Das war die eigentliche Antwort auf "es erscheint zu viel auf einmal":
  // nicht mehr Leere, sondern eine Staffelung. Jedes Bild und jeder Satz
  // deckt sich fuer sich auf - Bild, ein Stueck Scrollen weiter der Satz,
  // ein Stueck weiter das naechste Bild.
  const html = renderGoPageCore({ view: "search", form: {} });
  const marks = (html.match(/data-go-reveal="(\d+)"/g) || []).map((m) => Number(m.match(/\d+/)[0]));
  // Acht Stuecke: vier Bilder, vier Saetze - und durchgezaehlt in der
  // Reihenfolge, in der man an ihnen vorbeikommt.
  assert.deepEqual(marks, [0, 1, 2, 3, 4, 5, 6, 7]);

  // Der Satz haengt nicht mehr am Bild: keine Verzoegerung in Millisekunden,
  // die auch dann vergeht, wenn niemand scrollt.
  const text = GO_PAGE_CSS.match(/\.mnyra-go-page__story-text \{[^}]*\}/s)?.[0] || "";
  assert.equal(/transition:/.test(text), false);
  assert.equal(/opacity: 0/.test(text), false);

  // Verborgen ohne Marke, sichtbar mit - so ist der erste Aufbau richtig.
  assert.ok(/\[data-go-reveal\] \{[^}]*opacity: 0/s.test(GO_PAGE_CSS));
  assert.ok(GO_PAGE_CSS.includes('[data-go-reveal][data-go-reveal-in="1"]'));
});

test("the gap separates the chapters without emptying the screen", () => {
  // Er stand einmal bei 64svh, damit immer nur ein Kapitel im Fenster steht.
  // Das hielt den Blick, hinterliess aber halbe leere Bildschirme - Leere ist
  // kein Fokus. Den macht die Staffelung; der Abstand trennt nur noch.
  const story = GO_PAGE_CSS.match(/\.mnyra-go-page__story \{[^}]*\}/s)?.[0] || "";
  const gap = story.match(/gap: clamp\(([^)]*)\)/)?.[1] || "";
  const between = Number(gap.match(/(\d+)svh/)?.[1]);
  assert.ok(between >= 12 && between <= 32, `Abstand aus dem Rahmen: ${between}svh`);
  // "svh" und nicht "vh": Die kleine Fensterhoehe aendert sich beim Scrollen
  // nicht - sonst wuechse der Abstand unter dem Finger.
  assert.equal(/\d+vh\b/.test(gap.replace(/svh/g, "")), false);
  // Und Grenzen nach beiden Seiten, damit es auf keinem Schirm kippt.
  assert.ok(/^\s*[\d.]+rem,/.test(gap) && /[\d.]+rem\s*$/.test(gap));

  // Innerhalb eines Kapitels misst der Abstand an derselben Groesse - er ist
  // der Weg, den der Daumen zwischen Bild und Satz zuruecklegt, und der haengt
  // am Geraet. Aber er bleibt deutlich kleiner als der zwischen den Kapiteln:
  // Waeren beide gleich, stuenden dort acht einzelne Dinge statt vier
  // Kapiteln.
  const text = GO_PAGE_CSS.match(/\.mnyra-go-page__story-text \{[^}]*\}/s)?.[0] || "";
  const inside = Number(text.match(/margin: clamp\([^)]*?(\d+)svh/)?.[1]);
  assert.ok(inside > 0, "der Abstand zum Bild misst auch an der Fensterhoehe");
  assert.ok(inside * 1.5 <= between, `innen (${inside}svh) muss klar enger sein als aussen (${between}svh)`);
  assert.ok(text.includes("font-size: clamp("));
  assert.ok(text.includes("max-width: 22ch"));
});

test("the pieces come in on scroll, and a redraw does not undo it", () => {
  // Wer Bewegung abbestellt hat, bekommt keine.
  assert.ok(GO_PAGE_CSS.includes("prefers-reduced-motion: reduce"));

  // Was aufgedeckt ist, steht im Zustand: sonst finge jede Antwort auf eine
  // Frage die ganze Erklaerung wieder von vorne an. Gezaehlt wird ueber alle
  // acht Stuecke, nicht ueber die vier Kapitel.
  const fresh = renderGoPageCore({ view: "search", form: {} });
  assert.equal(fresh.includes('data-go-reveal-in="1"'), false);
  const seen = renderGoPageCore({ view: "search", form: {}, storyShown: [0, 1, 2] });
  assert.equal((seen.match(/data-go-reveal-in="1"/g) || []).length, 3);
});

test("the picture frame stands before the picture does", () => {
  // Das Seitenverhaeltnis liegt auf der Flaeche, nicht auf dem Bild: Sonst
  // waere die Flaeche null hoch, bis das Bild da ist - und der Satz darunter
  // wanderte beim Laden. Nur das erste Bild wird sofort geholt.
  assert.ok(/\.mnyra-go-page__story-media \{[^}]*aspect-ratio: 4 \/ 3/s.test(GO_PAGE_CSS));
  const html = renderGoPageCore({ view: "search", form: {} });
  assert.equal((html.match(/loading="eager"/g) || []).length, 1);
  assert.equal((html.match(/loading="lazy"/g) || []).length, 3);
  assert.equal((html.match(/width="1600"/g) || []).length, 4);
  assert.equal((html.match(/height="900"/g) || []).length, 4);
  // Fehlt eine Datei, bleibt die Flaeche stehen statt eines zerbrochenen Symbols.
  assert.equal((html.match(/onerror="this\.remove\(\)"/g) || []).length, 4);
});

test("in the bento stands the story and nothing else", () => {
  // Hier standen einmal eine Ueberschrift, ein Untertitel und vier Zeilen
  // "Mirë të dihet". Alle drei sagten in Worten, was die Bilder zeigen - eine
  // Erklaerung, die daneben noch einmal erklaert wird, wirkt wie eine, der
  // man nicht traut.
  const html = renderGoPageCore({ view: "search", form: {} });
  const bento = html.slice(html.indexOf("mnyra-go-page__bento"));
  assert.ok(bento.includes("data-go-story"));
  assert.equal(bento.includes("mnyra-go-page__info"), false);
  assert.equal(bento.includes("mnyra-go-page__lead"), false);

  // Im Bento steht genau das, was zur Geschichte gehoert: vier Bilder, vier
  // Saetze, vier Zaehler - und kein Wort darueber hinaus.
  const paragraphs = bento.match(/<p class="mnyra-go-page__story-[a-z]+"/g) || [];
  assert.equal(paragraphs.length, 4);

  // Und in den Regeln bleibt kein Rest davon stehen.
  assert.equal(GO_PAGE_CSS.includes("mnyra-go-page__info"), false);
  assert.equal(GO_PAGE_CSS.includes("mnyra-go-page__lead-sub"), false);
});

test("every symbol in the modal is a real lucide icon, none is an emoji", () => {
  // Die App laedt Lucide nach und tauscht <i data-lucide> erst danach aus -
  // sie beobachtet dafuer aber nur den Baum unter #app, und das Modal haengt
  // in #overlayRoot. Ein Platzhalter bliebe dort leer. Deshalb steht hier
  // fertiges SVG, und deshalb steht hier kein Emoji als Ersatz.
  const views = [
    renderGoPageCore({ view: "search", form: { city: "Prishtina", when: "later" } }),
    renderGoPageCore({
      view: "results",
      results: [{ offerId: "o1", businessName: "Casa Rita", benefitLabel: "–10 %", partySize: 4, distanceKm: 1.2, bookingType: "reservation" }]
    }),
    renderGoPageCore({
      view: "booking",
      canSignIn: true,
      booking: { type: "reservation", businessName: "Casa Rita", partySize: 4, shortCode: "A7K2", city: "Prishtina" }
    }),
    renderGoPageCore({ view: "error", error: "Gabim" })
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
    new URL("../apps/menyra-social/core/go/go-page-render-utils.js", import.meta.url),
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
    const html = renderGoPageCore({
      view: "search",
      form: { step, intent: "drinks", when: "in30", city: "Prishtina" }
    });
    carriesIcon(html, "mnyra-go-page__q");
    if (step === "category") carriesIcon(html, "mnyra-go-page__intent-ic");
    if (step === "when") carriesIcon(html, "mnyra-go-page__chip");
    if (step !== "party") carriesIcon(html, "mnyra-go-page__ask-back");
  });

  // Auch die Karte, die waehrend der Suche steht: Sie traegt fuenf Symbole,
  // von denen immer genau eines sichtbar ist.
  const live = renderGoPageCore({ view: "matching", live: { count: 0, seconds: 3 }, form: {} });
  assert.ok((live.match(/<svg/g) || []).length >= 5);
});

test("the stylesheet ships with the markup, not with tailwind", () => {
  // Das Panel-CSS der App wird generiert; eine Seite, die darauf wartet, sieht
  // beim ersten Aufbau kaputt aus. Deshalb bringt GO sein eigenes mit - genau
  // wie Dashboard und Composer.
  assert.ok(GO_PAGE_CSS.includes(".mnyra-go-page"));
  assert.ok(GO_PAGE_CSS.includes("min-height: 44px"));
  assert.ok(GO_PAGE_CSS.includes("prefers-reduced-motion"));
});

test("everything that can be preselected is preselected", () => {
  const form = { partySize: 2, intent: "unsure", when: "now", city: "Prishtina" };
  const category = renderGoPageCore({ view: "search", form: { ...form, step: "category" } });
  const when = renderGoPageCore({ view: "search", form: { ...form, step: "when" } });
  const place = renderGoPageCore({ view: "search", form: { ...form, step: "place" } });

  // Auf jedem Schritt steht genau eine Antwort schon da: "Nuk e di", "Tani" -
  // und die Stadt, die die App ohnehin kennt.
  assert.equal((category.match(/aria-pressed="true"/g) || []).length, 1);
  assert.ok(category.includes("Nuk e di"));
  assert.equal((when.match(/aria-pressed="true"/g) || []).length, 1);
  assert.ok(when.includes("Tani"));
  assert.ok(place.includes("Prishtina"));

  // Und der Knopf verspricht nichts Falsches (Punkt 15).
  assert.ok(place.includes("Merr ofertat"));
  assert.equal(/dërgo kërkesën/i.test(place), false);
});

test("one question stands in the picture, not four", () => {
  // Vier Fragen untereinander sind ein Formular - und ein Formular beantwortet
  // niemand im Stehen vor einem Lokal.
  const first = renderGoPageCore({ view: "search", form: {} });
  assert.ok(first.includes("Sa persona jeni?"));
  assert.equal(first.includes("Çka dëshironi?"), false);
  assert.equal(first.includes("Kur?"), false);
  assert.equal(first.includes("Merr ofertat"), false);
  // Der erste Schritt hat keinen Weg zurueck, wohl aber einen nach vorn: ein
  // Rad ist nie "fertig", also braucht es einen Knopf.
  assert.equal(first.includes("data-go-step-back"), false);
  assert.ok(first.includes("data-go-step-next"));

  const third = renderGoPageCore({ view: "search", form: { step: "when" } });
  assert.ok(third.includes("Kur?"));
  assert.equal(third.includes("Sa persona jeni?"), false);
  assert.ok(third.includes("data-go-step-back"));
  // Eine angetippte Kachel ist die Antwort - kein Knopf noetig.
  assert.equal(third.includes("data-go-step-next"), false);
});

test("an answer already given stays one tap away", () => {
  // Eine Antwort, die man nur durch Neuanfangen aendern kann, ist eine Falle.
  // Der Pfeil oben rechts steht auf jedem Schritt ausser dem ersten, und er
  // geht immer genau einen zurueck - auch aus den beiden Zwischenbildern
  // (Kalender, Staedteliste), die sonst Sackgassen waeren.
  ["category", "when", "place"].forEach((step) => {
    const html = renderGoPageCore({ view: "search", form: { step, city: "Prishtina" } });
    assert.ok(html.includes("data-go-step-back"), `no way back from ${step}`);
  });
  const calendar = renderGoPageCore({
    view: "search",
    form: { step: "when", when: "later", whenSub: "date" }
  });
  assert.ok(calendar.includes("data-go-step-back"));
  const cityList = renderGoPageCore({
    view: "search",
    form: { step: "place", city: "Prishtinë", citySelect: true }
  });
  assert.ok(cityList.includes("data-go-step-back"));

  // Auf dem ersten Schritt steht dort die Antwort, die gerade eingestellt
  // wird - der Daumen liegt auf dem Rad und verdeckt die Zahl darin.
  const first = renderGoPageCore({ view: "search", form: { partySize: 6 } });
  assert.equal(first.includes("data-go-step-back"), false);
  assert.ok(first.includes("data-go-party-value"));
  assert.ok(first.includes("<b>6</b> persona"));
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
  const html = renderGoPageCore({ view: "search", form: {} });
  assert.ok(html.indexOf("mnyra-go-page__ask") < html.indexOf("mnyra-go-page__bento"));
  assert.ok(html.indexOf("mnyra-go-page__bento") < html.indexOf("data-go-story"));
  // Erst die Frage, dann die Geschichte: Wer weiss, was er will, laeuft nicht
  // erst an vier Bildern vorbei.
  assert.ok(html.indexOf("data-go-submit") < html.indexOf("data-go-story"));
  // Die Karte hebt sich mit einem Schatten ab, das Bento faengt mit runden
  // Ecken an.
  assert.ok(GO_PAGE_CSS.includes(".mnyra-go-page__ask {"));
  assert.ok(/\.mnyra-go-page__ask \{[^}]*box-shadow:/s.test(GO_PAGE_CSS));
  assert.ok(/\.mnyra-go-page__bento \{[^}]*border-top-left-radius/s.test(GO_PAGE_CSS));
});

test("the group size is a wheel from 1 to 10, not a slider and not a row of buttons", () => {
  // Ein Schieberegler hat einen Fehler, den kein Styling behebt: Sein Griff
  // liegt unter dem Daumen, der ihn zieht. Ein Rad dreht sich darunter weg.
  const html = renderGoPageCore({ view: "search", form: { partySize: 4 } });
  assert.equal(html.includes('type="range"'), false);
  assert.equal(html.includes("data-go-party-range"), false);
  assert.ok(html.includes('data-go-wheel="party"'));
  assert.ok(html.includes('data-go-wheel-value="4"'));

  // Jede gueltige Gruppengroesse steht als Zeile da, und genau eine ist
  // gewaehlt.
  const picks = [...html.matchAll(/data-go-wheel-pick="(\d+)"/g)].map((match) => Number(match[1]));
  assert.deepEqual(picks, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(GO_PARTY_SIZE_MIN, 1);
  assert.equal(GO_PARTY_SIZE_MAX, 10);
  assert.equal((html.match(/aria-selected="true"/g) || []).length, 1);

  // Die Zeilenhoehe ist keine Geschmacksfrage: Der Controller rechnet mit
  // derselben Zahl, und das Polster oben und unten haengt daran.
  assert.equal(GO_WHEEL_ITEM_HEIGHT, 44);
  assert.ok(GO_PAGE_CSS.includes("--go-wheel-item: 44px"));
  assert.ok(GO_PAGE_CSS.includes("--go-wheel-height: 200px"));
  assert.ok(GO_PAGE_CSS.includes("--go-wheel-pad: 78px"));

  // Und sie zaehlt albanisch: einer ist ein "person", mehrere sind "persona".
  assert.equal(goPartyLabel(1), "1 person");
  assert.equal(goPartyLabel(7), "7 persona");
  // Das Rad kann nichts Ungueltiges liefern - der Zustand aus einer alten
  // Sitzung sehr wohl.
  assert.equal(clampGoPartySize(0), 1);
  assert.equal(clampGoPartySize(99), 10);
  assert.equal(clampGoPartySize("abc"), 2);
  // Keine Pillen mehr fuer die Gruppengroesse.
  assert.equal(html.includes("data-go-party="), false);
});

test("the guest is not asked about money at all", () => {
  // Das Budget war die einzige Frage, deren Antwort dem Gast Angebote wegnimmt,
  // statt welche zu bringen - und die er nicht beantworten kann, bevor er
  // weiss, was es ueberhaupt gibt. Sie ist weg, in jedem Zustand.
  const html = renderGoPageCore({ view: "search", form: { showBudget: true, budget: "low" } });
  assert.equal(html.includes("buxhet"), false);
  assert.equal(html.includes("Buxheti"), false);
  assert.equal(html.includes("deri 10 €"), false);
  assert.equal(html.includes("data-go-budget"), false);
});

test("the guest is asked about the bill, not about the taste", () => {
  // Drei Antworten, untereinander, jede mit einer Zeile darunter. Sie sind
  // keine Geschmacksrichtungen: Wer isst, macht einen grossen Bon, und darauf
  // kann ein Lokal mehr geben - genau diese zwei Faelle kalkuliert ein Wirt.
  const html = renderGoPageCore({ view: "search", form: { step: "category" } });
  assert.ok(html.includes("Për çka jeni?"));
  assert.equal((html.match(/data-go-intent="/g) || []).length, 3);
  ["Ushqim", "Pije", "Nuk e di"].forEach((label) => {
    assert.ok(html.includes(`>${label}</span>`), `missing answer ${label}`);
  });

  // Die Zeile darunter ist kein Beiwerk: "Pije" allein saehe aus, als waere
  // Ëmbëlsira nicht dabei.
  ["Mëngjes, drekë, darkë etj.", "Kafe, ëmbëlsira, lëngje etj.", "Gjitha ofertat për rreth teje."]
    .forEach((hint) => assert.ok(html.includes(hint), `missing hint ${hint}`));

  // Die alten fuenf Pillen gibt es nicht mehr - "Krejt" war eine
  // Entscheidung, "Nuk e di" ist eine ehrliche Antwort.
  assert.equal(html.includes(">Krejt</span>"), false);
  assert.equal(html.includes("data-go-category"), false);
  assert.equal(html.includes("Brunch"), false);
});

test("the venue is asked the same question the guest answers", () => {
  // Der Wirt beantwortet nicht, worauf sein Rabatt gilt, sondern fuer WEN das
  // Angebot ist. Steht dort nur "Kategoria", landet ein gutes Essens-Angebot
  // in der falschen Gruppe.
  const editor = readFileSync(
    new URL("../apps/menyra-social/core/go/business-go-render-utils.js", import.meta.url),
    "utf8"
  );
  assert.equal(editor.includes('categoryQuestion: "Kategoria"'), false);
  // Gefragt wird nach dem Anlass des Gastes ("Kur e lshon këtë ofertë"), und
  // die zwei Antworten sind genau die zwei, die der Gast im Qyteti hat.
  assert.ok(/categoryQuestion: "Kur e lshon/.test(editor));
  assert.ok(editor.includes("categoryHint"));
  assert.ok(editor.includes("Nëse kërkohet ushqim"));
  assert.ok(editor.includes("Nëse kërkohet pije"));
});

test("the city can actually be changed, and the list is a suggestion, not a fence", () => {
  // "Ndrysho" oeffnet die Liste, ein Tipp waehlt, "Ruaj" schliesst sie wieder.
  const idle = renderGoPageCore({ view: "search", form: { step: "place", city: "Prishtinë" } });
  assert.ok(idle.includes("data-go-change-city"));
  assert.ok(idle.includes("Prishtinë"));
  assert.equal(idle.includes("data-go-city-input"), false);

  const editing = renderGoPageCore({
    view: "search",
    form: { step: "place", city: "Prishtinë", citySelect: true }
  });
  assert.ok(editing.includes("data-go-city-input"));
  assert.ok(editing.includes("data-go-city-save"));
  GO_CITIES.forEach((entry) => {
    assert.ok(editing.includes(`data-go-city="${entry.name}"`), `missing city ${entry.name}`);
  });
  assert.equal((editing.match(/aria-pressed="true"/g) || []).length, 1);

  // Wer seinen Ort nicht findet, schreibt ihn hin - sonst waere die Liste eine
  // Tuer, die man vor jedem zumacht, der nicht in einer der grossen Staedte
  // wohnt.
  const typed = renderGoPageCore({
    view: "search",
    form: { step: "place", city: "", citySelect: true, citySearch: "Kaçanik" }
  });
  assert.ok(/data-go-city-free(?![-\w])/.test(typed));
  assert.ok(typed.includes("Përdor: Kaçanik"));
  // Was schon in der Liste steht, wird nicht ein zweites Mal angeboten.
  const known = renderGoPageCore({
    view: "search",
    form: { step: "place", city: "", citySelect: true, citySearch: "Pejë" }
  });
  assert.ok(/data-go-city-free hidden|hidden[^>]*data-go-city-free/.test(known.replace(/\s+/g, " ")));

  // Ohne Stadt steht dort eine Aufforderung, kein leeres Feld.
  const empty = renderGoPageCore({ view: "search", form: { step: "place", city: "" } });
  assert.ok(empty.includes("Shto qytetin tënd"));
});

test("'më vonë' opens a calendar and a wheel, not a datetime field", () => {
  // Ein <input type="datetime-local"> sieht auf jedem Telefon anders aus, und
  // auf keinem sieht es aus wie diese Karte. Ausserdem kennt es die Grenze
  // nicht, die GO wirklich hat: sieben Tage.
  const quick = renderGoPageCore({ view: "search", form: { step: "when", when: "now" } });
  assert.equal(quick.includes("datetime-local"), false);
  assert.equal(quick.includes("data-go-date="), false);

  // Ein Tag ist etwas Ortszeitliches: Der Kalender zeigt den Tag, an dem der
  // Gast steht, nicht den in London.
  const nowMs = new Date(2026, 7, 13, 14, 0, 0).getTime();
  const date = renderGoPageCore({
    view: "search",
    nowMs,
    form: { step: "when", when: "later", whenSub: "date" }
  });
  assert.equal(date.includes("datetime-local"), false);
  assert.ok(date.includes("Zgjidh datën"));
  // Genau acht Tage sind anzutippen: heute und die sieben danach
  // (GO_MAX_LEAD_DAYS). Alles andere steht da und ist abgeschaltet.
  const open = [...date.matchAll(/data-go-date="([\d-]+)"[^>]*aria-pressed="[a-z]+"\s*>/g)];
  assert.equal(open.length, 8);
  assert.ok(date.includes("disabled"));

  const time = renderGoPageCore({
    view: "search",
    nowMs,
    form: { step: "when", when: "later", whenSub: "time", laterDate: "2026-08-13", laterHour: "20", laterMinute: "30" }
  });
  assert.ok(time.includes('data-go-wheel="hour"'));
  assert.ok(time.includes('data-go-wheel="minute"'));
  // Halbe Stunden und keine Minuten - ein Lokal fuehrt seine Kapazitaet so.
  const minuteWheel = time.slice(time.indexOf('data-go-wheel="minute"'));
  assert.deepEqual(
    minuteWheel.match(/data-go-wheel-pick="(\d+)"/g),
    ['data-go-wheel-pick="00"', 'data-go-wheel-pick="30"']
  );
  // Der Knopf sagt, was er speichert - und "Sot" statt eines Datums.
  assert.ok(time.includes("Ruaj orën (Sot, 20:30)"));
  assert.equal(goDateLabel("2026-08-13", undefined, { nowMs }), "Sot");
  assert.equal(goDateLabel("2026-08-14", undefined, { nowMs }), "Nesër");
  assert.equal(goDateLabel("2026-08-17", undefined, { nowMs }), "17 Gus");
  assert.equal(goDateKey(new Date(2026, 7, 3)), "2026-08-03");
  assert.equal(goLaterValue({ laterDate: "2026-08-13", laterHour: "20", laterMinute: "30" }), "2026-08-13T20:30");
});

test("a result reads as an offer to this group, not as a public promotion", () => {
  const html = renderGoPageCore({
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
  const html = renderGoPageCore({
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
  const html = renderGoPageCore({ view: "results", results: [] });
  assert.ok(html.includes("Nuk gjetëm ofertë GO që përputhet tani."));
  // Und darunter steht, was zu tun ist - nicht nur, dass nichts da ist.
  assert.ok(html.includes("Provo me një orë tjetër"));
  assert.ok(html.includes("data-go-back"));
});

test("every text goes through the escaping, the own ones too", () => {
  const html = renderGoPageCore({
    view: "results",
    results: [],
    texts: { emptySubtitle: "Lokale që mund t'ju pëlqejnë" }
  });
  assert.ok(html.includes("Lokale që mund t&#39;ju pëlqejnë"));
});

test("a confirmed table and a secured offer say different things", () => {
  const table = renderGoPageCore({
    view: "booking",
    booking: { type: "reservation", businessName: "Casa Rita", benefitLabel: "–10 %", partySize: 4, shortCode: "A7K2" }
  });
  assert.ok(table.includes("U krye"));
  assert.ok(table.includes("Tavolina është konfirmuar"));
  assert.ok(table.includes("A7K2"));

  const claim = renderGoPageCore({
    view: "booking",
    booking: { type: "claim", businessName: "Prince Coffee", benefitLabel: "Cookie falas", partySize: 2 }
  });
  assert.ok(claim.includes("Oferta është e juaja"));
});

test("signing in is offered, never demanded", () => {
  const html = renderGoPageCore({
    view: "booking",
    canSignIn: true,
    booking: { type: "claim", businessName: "Prince Coffee", partySize: 2 }
  });
  assert.ok(html.includes("Ruaje në llogarinë tënde"));
  // Kein Zwang, keine Sperre, kein "um fortzufahren" (Punkt 30).
  assert.equal(/për të vazhduar/i.test(html), false);
});

test("a sold out offer is answered with alternatives", () => {
  const html = renderGoPageCore({
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
    listeners: {},
    stubs: {},
    addEventListener(type, handler) {
      (this.listeners[type] = this.listeners[type] || []).push(handler);
    },
    dispatch(type, event = {}) {
      (this.listeners[type] || []).forEach((handler) => handler({ preventDefault() {}, ...event }));
    },
    // Die Shell fragt so, ob ueberhaupt ein Modal steht. GO ist hier das
    // einzige - es haengt genau so lange im Baum, wie es offen ist.
    querySelector(selector) { return this.stubs[selector] || null; },
    querySelectorAll() { return []; },
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
    // Jedes Ziel steckt in der GO-Seite - der delegierte Zuhoerer laesst nur
    // durch, was dort drin passiert.
    closest: (selector) => {
      if (selector === "[data-go-page]") return { getAttribute: () => null };
      return Object.prototype.hasOwnProperty.call(within, selector)
        ? { getAttribute: (name) => within[selector][name] ?? null }
        : null;
    },
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

// Eine Uhr, die sofort klingelt. Die Suche laesst die Lokale mit Absicht
// nacheinander eintreffen - acht Sekunden, die ein Test nicht abwarten soll.
// Die Reihenfolge bleibt dieselbe, nur die Pausen dazwischen sind null.
const IMMEDIATE_TIMERS = Object.freeze({
  setTimeout: (fn) => { fn(); return 0; },
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {}
});

function createController(api, doc = createFakeDocument(), state = {}) {
  return createGoPageViewController({
    state,
    renderFn: () => {},
    documentObj: doc,
    windowObj: { crypto: null },
    api,
    timers: IMMEDIATE_TIMERS,
    getCityFn: () => "Prishtina",
    getCoordsFn: () => null,
    isSignedInFn: () => false,
    nowFn: () => Date.parse("2026-08-13T14:00:00.000Z")
  });
}

// Ein Rad, so viel davon, wie der Controller anfasst: eine Liste mit ihren
// Zeilen und einer Scrollposition.
function fakeWheel(name, values, value) {
  const items = values.map((entry) => {
    const attributes = { "data-go-wheel-pick": String(entry) };
    return {
      attributes,
      getAttribute: (key) => attributes[key] ?? null,
      setAttribute: (key, next) => { attributes[key] = String(next); }
    };
  });
  const attributes = { "data-go-wheel": name, "data-go-wheel-value": String(value) };
  return {
    scrollTop: values.indexOf(value) * GO_WHEEL_ITEM_HEIGHT,
    items,
    getAttribute: (key) => attributes[key] ?? null,
    setAttribute: (key, next) => { attributes[key] = String(next); },
    querySelectorAll: () => items,
    scrollTo({ top }) { this.scrollTop = top; }
  };
}

// Ein Bild der Geschichte, so viel wie der Beobachter davon anfasst.
function fakeStorySlide(index) {
  const attributes = { "data-go-reveal": String(index) };
  return {
    attributes,
    getAttribute: (name) => attributes[name] ?? null,
    setAttribute: (name, value) => { attributes[name] = String(value); },
    get revealed() { return attributes["data-go-reveal-in"] === "1"; }
  };
}

// Ein Dokument, das nur die Bilder kennt - mehr braucht das Aufdecken nicht.
function createStoryDocument(slides) {
  return {
    addEventListener() {},
    querySelectorAll: (selector) => (selector === "[data-go-reveal]" ? slides : []),
    querySelector: () => null
  };
}

// Ein Beobachter, den der Test von Hand ausloest.
function installFakeIntersectionObserver() {
  const instances = [];
  const previous = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = class {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observed = [];
      this.disconnected = false;
      instances.push(this);
    }
    observe(node) { this.observed.push(node); }
    unobserve(node) { this.observed = this.observed.filter((entry) => entry !== node); }
    disconnect() { this.disconnected = true; this.observed = []; }
    // Was der Browser taete, wenn das Bild ins Blickfeld kommt.
    enter(node) { this.callback([{ isIntersecting: true, target: node }], this); }
  };
  return {
    instances,
    restore() {
      if (previous) globalThis.IntersectionObserver = previous;
      else delete globalThis.IntersectionObserver;
    }
  };
}

function createStoryController({ slides, reducedMotion = false, state = {} }) {
  return createGoPageViewController({
    state,
    renderFn: () => {},
    documentObj: createStoryDocument(slides),
    windowObj: { crypto: null, matchMedia: () => ({ matches: reducedMotion }) },
    api: createFakeApi(),
    getCityFn: () => "Prishtina",
    isSignedInFn: () => false,
    nowFn: () => Date.parse("2026-08-13T14:00:00.000Z")
  });
}

test("a picture uncovers itself when it comes into view, and stays uncovered", async () => {
  const observers = installFakeIntersectionObserver();
  try {
    const slides = [0, 1, 2, 3].map(fakeStorySlide);
    const state = {};
    const controller = createStoryController({ slides, state });

    controller.renderGoPageView();
    // Der Aufbau selbst deckt nichts auf - er baut. Beobachtet wird danach.
    assert.deepEqual(slides.map((slide) => slide.revealed), [false, false, false, false]);

    await new Promise((resolve) => setTimeout(resolve, 0));
    const observer = observers.instances.at(-1);
    assert.equal(observer.observed.length, 4);

    observer.enter(slides[0]);
    observer.enter(slides[1]);
    assert.deepEqual(slides.map((slide) => slide.revealed), [true, true, false, false]);
    // Aufgedeckt heisst: nicht mehr beobachtet.
    assert.equal(observer.observed.length, 2);

    // Und es steht im Zustand, nicht nur am Knoten - sonst finge die
    // Erklaerung bei der naechsten Antwort wieder von vorne an.
    assert.deepEqual(state.go.storyShown, [0, 1]);
  } finally {
    observers.restore();
  }
});

test("a fast flick leaves no picture behind", async () => {
  // Ein Beobachter meldet, was in einem Einzelbild zu sehen ist. Fliegt die
  // Seite mit einem Schwung durch - oder springt sie ans Ende -, war ein Bild
  // dazwischen in keinem einzigen davon zu sehen. Ohne Regel bliebe es fuer
  // immer unsichtbar; mit ihr deckt das dritte Bild eins und zwei mit auf.
  const observers = installFakeIntersectionObserver();
  try {
    const slides = [0, 1, 2, 3].map(fakeStorySlide);
    const state = {};
    createStoryController({ slides, state }).renderGoPageView();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const observer = observers.instances.at(-1);
    observer.enter(slides[2]);
    assert.deepEqual(slides.map((slide) => slide.revealed), [true, true, true, false]);
    assert.deepEqual(state.go.storyShown, [0, 1, 2]);
    // Das letzte wartet weiter - es kommt erst noch.
    assert.deepEqual(observer.observed, [slides[3]]);
  } finally {
    observers.restore();
  }
});

test("a redraw observes the new nodes and forgets the old ones", async () => {
  const observers = installFakeIntersectionObserver();
  try {
    const first = [0, 1, 2, 3].map(fakeStorySlide);
    const state = {};
    const controller = createStoryController({ slides: first, state });
    controller.renderGoPageView();
    await new Promise((resolve) => setTimeout(resolve, 0));
    observers.instances.at(-1).enter(first[0]);

    // Neu gezeichnet: neue Knoten, und die schon aufgedeckten kommen mit
    // ihrer Marke wieder herein (das erledigt das Rendering aus dem Zustand).
    const second = [0, 1, 2, 3].map(fakeStorySlide);
    second[0].setAttribute("data-go-reveal-in", "1");
    first.length = 0;
    first.push(...second);

    controller.renderGoPageView();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const previous = observers.instances.at(-2);
    const current = observers.instances.at(-1);
    assert.equal(previous.disconnected, true);
    // Nur die drei noch verborgenen - das erste ist fertig.
    assert.equal(current.observed.length, 3);
  } finally {
    observers.restore();
  }
});

test("without motion, or without an observer, everything simply stands there", async () => {
  // Eine Erklaerung, die man nicht sieht, ist keine.
  const observers = installFakeIntersectionObserver();
  try {
    const slides = [0, 1, 2, 3].map(fakeStorySlide);
    createStoryController({ slides, reducedMotion: true }).renderGoPageView();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(slides.map((slide) => slide.revealed), [true, true, true, true]);
    assert.equal(observers.instances.length, 0);
  } finally {
    observers.restore();
  }

  const previous = globalThis.IntersectionObserver;
  delete globalThis.IntersectionObserver;
  try {
    const slides = [0, 1].map(fakeStorySlide);
    createStoryController({ slides }).renderGoPageView();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(slides.map((slide) => slide.revealed), [true, true]);
  } finally {
    if (previous) globalThis.IntersectionObserver = previous;
  }
});

test("search and accept walk through the states in order", async () => {
  const api = createFakeApi();
  const controller = createController(api);

  controller.renderGoPageView();
  assert.equal(controller.__view().view, "search");
  assert.equal(controller.__view().form.city, "Prishtina");

  // Zwischen Frage und Angebot steht ein eigener Zustand: Die Anfrage laeuft,
  // die Angebote sind schon da - aber sie gehoeren dem Gast erst, wenn er
  // "Shiko ofertat" tippt.
  await controller.__submitSearch();
  assert.equal(controller.__view().view, "matching");
  assert.equal(controller.__view().results.length, 1);
  assert.equal(controller.__view().live.done, true);

  controller.__openResults();
  assert.equal(controller.__view().view, "results");
  assert.equal(controller.__view().results.length, 1);

  await controller.__acceptOffer("offer-1", "rest-1");
  assert.equal(controller.__view().view, "booking");
  assert.equal(controller.__view().booking.shortCode, "A7K2");
  assert.equal(controller.__view().busyOfferId, "");
});

// ===========================================================================
// Die Fragen, wie sie ein Daumen bedient.
// ===========================================================================

test("turning the wheel changes the group size without rebuilding the page", async () => {
  // Waehrend das Rad laeuft, darf nicht neu gezeichnet werden - sonst nimmt
  // der Neuaufbau dem Finger den Schwung, den er ihm gerade gegeben hat. Der
  // Zustand geht trotzdem mit, und die Suche schickt die neue Zahl.
  const doc = createFakeDocument();
  const api = createFakeApi();
  const controller = createController(api, doc);
  controller.renderGoPageView();

  const output = { innerHTML: "" };
  doc.stubs["[data-go-party-value]"] = output;

  const wheel = fakeWheel("party", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
  wheel.scrollTop = 6 * GO_WHEEL_ITEM_HEIGHT;
  doc.dispatch("scroll", { target: wheel });
  assert.equal(controller.__view().form.partySize, 7);
  // Die Zahl im Kopf der Karte geht von Hand mit - sie ist das Einzige, was
  // sich mit dem Rad aendert.
  assert.equal(output.innerHTML, "<b>7</b> persona");
  assert.equal(wheel.getAttribute("data-go-wheel-value"), "7");
  assert.equal(wheel.items[6].getAttribute("aria-selected"), "true");
  assert.equal(wheel.items[1].getAttribute("aria-selected"), "false");

  // Zwischen zwei Zeilen gilt die naehere - und ueber dem Ende die letzte.
  wheel.scrollTop = 40 * GO_WHEEL_ITEM_HEIGHT;
  doc.dispatch("scroll", { target: wheel });
  assert.equal(controller.__view().form.partySize, 10);

  await controller.__submitSearch();
  const request = api.calls.find((entry) => entry[0] === "search")[1];
  assert.equal(request.partySize, 10);
});

test("the button under the clock says the time the wheel says", async () => {
  // Der Knopf sagt, WAS er speichert. Bliebe er bei der vorbelegten Zeit
  // stehen, waehrend das Rad schon woanders steht, waere er eine
  // Falschauskunft an genau der Stelle, an der der Gast sie nicht mehr prueft.
  const doc = createFakeDocument();
  const controller = createController(createFakeApi(), doc);
  controller.renderGoPageView();
  const label = { textContent: "" };
  doc.stubs["[data-go-when-save-label]"] = label;

  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-when]": { "data-go-when": "later" } } }) });
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-date]": { "data-go-date": "2026-08-14" } } }) });

  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
  const hourWheel = fakeWheel("hour", hours, controller.__view().form.laterHour);
  hourWheel.scrollTop = 20 * GO_WHEEL_ITEM_HEIGHT;
  doc.dispatch("scroll", { target: hourWheel });
  assert.equal(controller.__view().form.laterHour, "20");
  // Vorbelegt ist die naechste halbe Stunde, also steht die Minute schon auf 30.
  assert.equal(label.textContent, "Ruaj orën (Nesër, 20:30)");

  const minuteWheel = fakeWheel("minute", ["00", "30"], controller.__view().form.laterMinute);
  minuteWheel.scrollTop = 0;
  doc.dispatch("scroll", { target: minuteWheel });
  assert.equal(controller.__view().form.laterMinute, "00");
  assert.equal(label.textContent, "Ruaj orën (Nesër, 20:00)");

  // Und gespeichert wird genau das, was dort steht.
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-when-save]": {} } }) });
  assert.equal(controller.__view().form.laterValue, "2026-08-14T20:00");

  // Aufschrift und Aufbau kommen aus derselben Stelle - zwei Stellen, die
  // denselben Satz bauen, laufen frueher oder spaeter auseinander.
  const html = renderGoPageCore({
    view: "search",
    nowMs: new Date(2026, 7, 13, 12, 0, 0).getTime(),
    form: { step: "when", when: "later", whenSub: "time", laterDate: "2026-08-14", laterHour: "20", laterMinute: "30" }
  });
  assert.ok(html.includes("data-go-when-save-label"));
  assert.ok(html.includes(goWhenSaveLabel(
    { laterDate: "2026-08-14", laterHour: "20", laterMinute: "30" },
    undefined,
    { nowMs: new Date(2026, 7, 13, 12, 0, 0).getTime() }
  )));
});

test("a bare error code is not a sentence for a guest", () => {
  // Kommt der Aufruf gar nicht erst durch (kein Netz, CORS, Funktion nicht
  // veroeffentlicht), setzt Firebase seinen CODE als Nachricht ein.
  // Ungeprueft stuende "internal" als Ueberschrift auf der Karte.
  const blocked = goApiInternals.toGoError({ code: "functions/internal", message: "internal" });
  assert.equal(blocked.code, "internal");
  assert.equal(blocked.message, "Mnyra GO është përkohësisht i padisponueshëm.");

  ["unavailable", "deadline-exceeded", "not-found"].forEach((code) => {
    assert.equal(
      goApiInternals.toGoError({ code, message: code }).message,
      "Mnyra GO është përkohësisht i padisponueshëm."
    );
  });

  // Was der Server selbst formuliert hat, bleibt unangetastet - er weiss
  // besser, was schiefging.
  const spoken = goApiInternals.toGoError({
    code: "failed-precondition",
    message: "Kjo ofertë nuk vlen për këtë kërkesë."
  });
  assert.equal(spoken.message, "Kjo ofertë nuk vlen për këtë kërkesë.");
});

test("the live counter counts to the number of offers, and names every one", async () => {
  // Der Zaehler waehrend der Suche ist eine Anzeige und keine Verzierung: Er
  // laeuft genau so weit, wie es Angebote GIBT, und jeder Name gehoert zu
  // einem Angebot, das der Gast danach wirklich sieht. Ein Zaehler, der immer
  // bis zehn laeuft und dann drei Angebote zeigt, ist eine Luege mit
  // Animation.
  const venues = ["Casa Rita", "Bro Pizza", "Soma"];
  const api = createFakeApi({
    search: () => ({
      results: venues.map((businessName, index) => ({
        offerId: `offer-${index}`,
        restaurantId: `rest-${index}`,
        businessName,
        benefitLabel: "–10 %",
        partySize: 2
      })),
      total: venues.length
    })
  });
  const seen = [];
  const doc = createFakeDocument();
  doc.stubs["[data-go-live-card]"] = { setAttribute() {} };
  doc.stubs["[data-go-live-count]"] = {
    textContent: "",
    removeAttribute() {},
    setAttribute() {},
    offsetWidth: 0
  };
  doc.stubs["[data-go-live-name]"] = {
    _text: "",
    get textContent() { return this._text; },
    set textContent(value) { this._text = value; seen.push(value); },
    removeAttribute() {},
    setAttribute() {},
    offsetWidth: 0
  };
  const controller = createController(api, doc);
  controller.renderGoPageView();
  await controller.__submitSearch();

  const live = controller.__view().live;
  assert.equal(live.total, 3);
  assert.equal(live.count, 3);
  assert.deepEqual(seen, venues);
  assert.equal(live.done, true);
  // Und erst danach gibt es etwas zu sehen.
  assert.equal(controller.__view().view, "matching");
  controller.__openResults();
  assert.equal(controller.__view().view, "results");
});

test("without an offer nobody is kept waiting for a countdown", async () => {
  // Zurueckzuhalten gibt es dann nichts - der eine ehrliche Satz steht sofort
  // da.
  const api = createFakeApi({ search: () => ({ results: [], total: 0 }) });
  const controller = createController(api);
  controller.renderGoPageView();
  await controller.__submitSearch();
  assert.equal(controller.__view().view, "results");
  assert.equal(controller.__view().results.length, 0);
});

test("a tap on an answer is a tap, and the search carries it", async () => {
  const doc = createFakeDocument();
  const api = createFakeApi();
  const controller = createController(api, doc);
  controller.renderGoPageView();

  
  doc.dispatch("click", {
    target: fakeTarget({ within: { "[data-go-intent]": { "data-go-intent": "drinks" } } })
  });
  assert.equal(controller.__view().form.intent, "drinks");

  doc.dispatch("click", {
    target: fakeTarget({ within: { "[data-go-when]": { "data-go-when": "in60" } } })
  });
  assert.equal(controller.__view().form.when, "in60");

  await controller.__submitSearch();
  const request = api.calls.find((entry) => entry[0] === "search")[1];
  // Der Server bekommt die Antwort, nicht eine Kategorie - er uebersetzt sie
  // selbst in "Kafe, Pije, Ëmbëlsira".
  assert.equal(request.intent, "drinks");
  // "+1 orë" heisst eine Stunde spaeter - und nicht mehr "jetzt".
  assert.equal(request.requestedAt, Date.parse("2026-08-13T15:00:00.000Z"));
});

test("answering walks forward on its own, and every answer stays reachable", async () => {
  const doc = createFakeDocument();
  const controller = createController(createFakeApi(), doc);
  controller.renderGoPageView();
  
  // Jedes Modal faengt bei der ersten Frage an.
  assert.equal(controller.__view().form.step, "party");

  // Der Regler ist nie "fertig" - er wird mit dem Knopf abgeschlossen.
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-step-next]": {} } }) });
  assert.equal(controller.__view().form.step, "category");

  // Eine angetippte Antwort schaltet von selbst weiter - deshalb sind es drei
  // und nicht mehrere zum Ankreuzen: Bei einer Mehrfachauswahl wuesste
  // niemand, wann der Gast fertig ist, und es braeuchte einen zweiten Tipp.
  doc.dispatch("click", {
    target: fakeTarget({ within: { "[data-go-intent]": { "data-go-intent": "food" } } })
  });
  assert.equal(controller.__view().form.step, "when");

  // "Më vonë" nicht: dort fehlen noch Tag und Uhrzeit. Es oeffnet den
  // Kalender - und belegt beides mit der naechsten halben Stunde vor.
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-when]": { "data-go-when": "later" } } }) });
  assert.equal(controller.__view().form.when, "later");
  assert.equal(controller.__view().form.whenSub, "date");
  assert.equal(controller.__view().form.step, "when");
  // Vorgeschlagen wird die naechste halbe Stunde in einer Stunde - nicht
  // 19:00. Wer um 22:30 sucht, meint nicht den Abend von gestern.
  assert.equal(
    controller.__view().form.laterDate,
    goDateKey(new Date(Date.parse("2026-08-13T15:00:00.000Z")))
  );
  assert.equal(controller.__view().form.laterMinute, "30");

  // Ein Tag fuehrt zur Uhrzeit, und erst der Knopf darunter schaltet weiter.
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-date]": { "data-go-date": "2026-08-14" } } }) });
  assert.equal(controller.__view().form.laterDate, "2026-08-14");
  assert.equal(controller.__view().form.whenSub, "time");
  assert.equal(controller.__view().form.step, "when");

  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-when-save]": {} } }) });
  assert.equal(controller.__view().form.step, "place");
  assert.equal(
    controller.__view().form.laterValue,
    `2026-08-14T${controller.__view().form.laterHour}:30`
  );

  // Zurueck geht Schritt fuer Schritt - auch aus den Zwischenbildern heraus.
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-step-back]": {} } }) });
  assert.equal(controller.__view().form.step, "when");
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-when]": { "data-go-when": "later" } } }) });
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-date]": { "data-go-date": "2026-08-15" } } }) });
  assert.equal(controller.__view().form.whenSub, "time");
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-step-back]": {} } }) });
  assert.equal(controller.__view().form.whenSub, "date");
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-step-back]": {} } }) });
  assert.equal(controller.__view().form.whenSub, "quick");
  assert.equal(controller.__view().form.step, "when");
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-step-back]": {} } }) });
  assert.equal(controller.__view().form.step, "category");
});

test("back from the results lands on the last step, not at the front", async () => {
  const doc = createFakeDocument();
  const controller = createController(createFakeApi(), doc);
  controller.renderGoPageView();
  await controller.__submitSearch();
  controller.__openResults();
  assert.equal(controller.__view().view, "results");

  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-back]": {} } }) });
  assert.equal(controller.__view().view, "search");
  // "Eine Kleinigkeit anders", nicht "von vorn": der Knopf steht schon da, und
  // der Merkzettel darueber traegt jede Antwort.
  assert.equal(controller.__view().form.step, "place");
});

// ===========================================================================
// Der Rand des Bildschirms (die Einfaerbung oben und unten).
// ===========================================================================

test("GO does not touch the edges of the screen any more", () => {
  // Der Grund fuer den ganzen Umbau: Als Modal faerbte GO den Rand mit - oben
  // den sicheren Bereich, unten die Leiste des Browsers. Keine andere Seite
  // tut das, und eine Seite kann es gar nicht.
  const doc = createFakeDocument();
  const controller = createController(createFakeApi(), doc);
  controller.renderGoPageView();
  assert.equal(doc.documentElement.style.getPropertyValue("--active-modal-surface"), "");
  assert.equal(doc.documentElement.classList.contains("modal-open"), false);
  assert.equal(doc.getElementById("safariChromeTintBottom"), null);
  assert.equal(doc.getElementById("safariChromeTintTop"), null);
});

test("the city is really changed, and the change reaches the server", async () => {
  const doc = createFakeDocument();
  const api = createFakeApi();
  const controller = createController(api, doc);
  controller.renderGoPageView();
  assert.equal(controller.__view().form.city, "Prishtina");
  assert.equal(controller.__view().form.citySelect, false);

  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-change-city]": {} } }) });
  assert.equal(controller.__view().form.citySelect, true);

  // Tippen sucht nur - die Stadt aendert sich erst mit dem Tipp auf eine
  // Zeile. Sonst stuende nach dem ersten Buchstaben "G" als Stadt im Zustand.
  doc.dispatch("input", { target: fakeTarget({ is: ["[data-go-city-input]"], value: "Gjak" }) });
  assert.equal(controller.__view().form.citySearch, "Gjak");
  assert.equal(controller.__view().form.city, "Prishtina");

  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-city]": { "data-go-city": "Gjakovë" } } }) });
  assert.equal(controller.__view().form.city, "Gjakovë");
  assert.equal(controller.__view().form.citySelect, false);
  assert.equal(controller.__view().form.citySearch, "");

  await controller.__submitSearch();
  assert.equal(api.calls.find((entry) => entry[0] === "search")[1].city, "Gjakovë");

  // Enter im Feld nimmt, was dort steht - auch wenn es in keiner Liste steht.
  doc.dispatch("click", { target: fakeTarget({ within: { "[data-go-change-city]": {} } }) });
  doc.dispatch("keydown", {
    key: "Enter",
    target: fakeTarget({ is: ["[data-go-city-input]"], value: "Kaçanik" })
  });
  assert.equal(controller.__view().form.city, "Kaçanik");
  assert.equal(controller.__view().form.citySelect, false);
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
  controller.renderGoPageView();
  await controller.__submitSearch();

  await controller.__acceptOffer("offer-1", "rest-1");
  assert.equal(controller.__view().view, "error");
  const firstKey = api.calls.filter((entry) => entry[0] === "createBooking")[0][1].idempotencyKey;

  await controller.__acceptOffer("offer-1", "rest-1");
  const secondKey = api.calls.filter((entry) => entry[0] === "createBooking")[1][1].idempotencyKey;
  // Ein abgebrochener Versuch ist derselbe Wunsch: Der Browser weiss nicht,
  // ob die Buchung schon steht. Ein neuer Schluessel waere eine zweite
  // Buchung (Punkt 100).
  assert.notEqual(firstKey, "");
  assert.equal(secondKey, firstKey);
  assert.equal(controller.__view().view, "booking");
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
  controller.renderGoPageView();
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
  controller.renderGoPageView();
  await controller.__submitSearch();
  await controller.__acceptOffer("offer-1", "rest-1");

  assert.equal(controller.__view().view, "error");
  assert.equal(controller.__view().error, "Kjo ofertë sapo u plotësua.");
  assert.equal(controller.__view().alternatives.length, 1);
  assert.equal(controller.__view().busyOfferId, "");
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
  controller.renderGoPageView();
  await controller.__submitSearch();
  assert.equal(controller.__view().view, "error");
  assert.ok(controller.__view().error.includes("Mnyra GO"));
});
