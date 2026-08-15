import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  renderAppFooterCore,
  shouldShowAppFooterCore
} from "../apps/menyra-social/core/ui/app-footer-render-utils.js";
import { renderMainCore } from "../apps/menyra-social/core/ui/main-shell-render-utils.js";

// ===========================================================================
// Der Fuss der App.
//
// Er gibt jeder scrollenden Seite ein definiertes Ende. Vorher hoerte jede
// Ansicht dort auf, wo ihr Inhalt aufhoerte, und darunter lag eine andere
// Farbe - auf iOS zusaetzlich der Grund hinter der Adressleiste.
// ===========================================================================

test("the footer stands on every scrolling page", () => {
  assert.equal(shouldShowAppFooterCore(), true);
  assert.equal(shouldShowAppFooterCore({}), true);
});

// Drei Ansichten haben kein Seitenende: eine Karte fuellt den Bildschirm, ein
// offener Chat-Verlauf ist eine feste Spalte, und das Landing ist eine
// Wisch-Flaeche (touch-action: none). Ein Fuss darin waere entweder
// unerreichbar oder wuerde die Geste stoeren.
test("it stays away where a page has no end", () => {
  assert.equal(shouldShowAppFooterCore({ isMapView: true }), false);
  assert.equal(shouldShowAppFooterCore({ isChatThreadOpen: true }), false);
  assert.equal(shouldShowAppFooterCore({ isLandingTopTab: true }), false);
});

test("the footer says who it belongs to, and nothing that leads nowhere", () => {
  const html = renderAppFooterCore({ brandTitle: "MNYRA", year: 2026 });
  assert.ok(html.includes("MNYRA"));
  assert.ok(html.includes("Zbulo qytetin tënd."));
  assert.ok(html.includes("© 2026 MNYRA"));
  // Keine Links: Rechtstexte gibt es in dieser App noch nicht, und ein Link
  // ins Leere waere schlimmer als keiner.
  assert.equal(html.includes("<a "), false, html);
  assert.equal(html.includes("data-nav"), false, html);
});

// Die drei Regeln, an die er sich haelt - sie sind der Grund, warum er nichts
// kaputt macht.
test("the footer cannot cover anything and cannot depend on missing classes", () => {
  const html = renderAppFooterCore({ year: 2026 });
  // 1. Im Fluss: nichts liegt fest, nichts ueberlagert.
  assert.equal(/position:\s*(fixed|absolute|sticky)/.test(html), false, html);
  assert.equal(html.includes("z-index"), false, html);
  // 2. Eigene Masse als Inline-Stil. Mnyra liefert ein fest vorgeneriertes
  //    Tailwind-CSS aus; eine Klasse, die dort fehlt, taete lautlos nichts.
  assert.equal(html.includes("class="), false, html);
  assert.equal(html.includes("<style"), false, html);
  // 3. Der sichere Bereich unten wird mitgepolstert, damit auf dem Geraet mit
  //    Home-Leiste nichts daran klebt.
  assert.ok(html.includes("var(--safe-area-bottom, 0px)"), html);
});

// Auf einer kurzen Seite stuende der Fuss sonst gleich unter dem letzten Bild.
// "margin-top: auto" nimmt ihm den uebrigen Platz der Huelle als Abstand; bei
// langem Inhalt gibt es keinen uebrigen Platz und nichts aendert sich.
test("the footer takes the leftover room on a short page", () => {
  assert.ok(renderAppFooterCore({ year: 2026 }).includes("margin-top: auto"));
});

// Er entscheidet seine Farbe nicht selbst, sondern uebernimmt die der Flaeche,
// auf der die Ansicht aufhoert - sonst stuende er als graue Kante unter einem
// weissen Bento. Ohne Marke bleibt die Flaeche der App.
test("the footer adopts the colour the view ends on", () => {
  const html = renderAppFooterCore({ year: 2026 });
  assert.ok(html.includes("var(--app-footer-surface, var(--app-bg, #f8fafc))"), html);
  assert.equal(html.includes("background: #ffffff"), false, html);
});

test("a broken year is left out instead of printed", () => {
  assert.equal(renderAppFooterCore({ year: Number.NaN }).includes("©"), false);
  assert.equal(renderAppFooterCore({ year: 0 }).includes("©"), false);
  assert.ok(renderAppFooterCore({ year: "2026" }).includes("© 2026"));
});

test("the brand name is escaped like every other text", () => {
  const html = renderAppFooterCore({
    brandTitle: "<script>x</script>",
    year: 2026,
    escapeHtmlFn: (value = "") => String(value || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  });
  assert.equal(html.includes("<script>x"), false);
  assert.ok(html.includes("&lt;script&gt;"));
});

// ---------------------------------------------------------------------------
// Und die Stelle, an der er landet.
// ---------------------------------------------------------------------------

function renderShell(state = {}) {
  return renderMainCore({
    state: { activeTab: "feed", chatModal: {}, ...state },
    brandTitle: "MNYRA",
    renderFeedViewFn: () => '<div id="feedView">Inhalt</div>'
  });
}

test("the footer is the last thing inside main", () => {
  const html = renderShell();
  const footerAt = html.indexOf("<footer");
  assert.ok(footerAt > -1, "der Fuss fehlt");
  assert.ok(footerAt > html.indexOf('id="feedView"'), "er steht hinter dem Inhalt");
  assert.ok(footerAt < html.indexOf("</main>"), "und noch innerhalb von main");
});

test("the excluded views render without it", () => {
  assert.equal(renderShell({ activeTab: "map" }).includes("<footer"), false);
  assert.equal(
    renderShell({ activeTab: "chat", chatModal: { open: true, profile: { uid: "u1" } } }).includes("<footer"),
    false
  );
  assert.equal(
    renderShell({ activeTab: "profile", profileTopTab: "landing" }).includes("<footer"),
    false
  );
});

// ---------------------------------------------------------------------------
// Und die Huelle, die ihn dorthin schiebt.
// ---------------------------------------------------------------------------

const shellCss = readFileSync(
  path.join(import.meta.dirname, "..", "apps", "menyra-social", "index.html"),
  "utf8"
).replace(/\/\*[\s\S]*?\*\//g, "");

test("the shell is a stack so the footer can sink to the bottom", () => {
  // Ohne Stapel haette "margin-top: auto" im Fuss keinen Platz zu nehmen.
  assert.ok(shellCss.includes(".app-shell { display: flex; flex-direction: column; }"), "der Stapel fehlt");
  const at = shellCss.indexOf("\n    .app-main-scroll {");
  assert.ok(at > -1, "die Regel fuer den Inhalt fehlt");
  const block = shellCss.slice(at, shellCss.indexOf("}", at));
  // Der Inhalt waechst ueber den Bildschirm, schrumpft aber nie darunter -
  // sonst gaebe es auf einer kurzen Seite keinen uebrigen Platz.
  assert.ok(block.includes("flex: 1 0 auto;"), block);
  assert.ok(block.includes("flex-direction: column;"), block);
});

test("the shell drops its own tail where the footer brings one", () => {
  // Das Polster der Huelle laege hinter dem Fuss als Streifen in ihrer eigenen
  // Farbe - genau die Kante, die er beseitigen soll.
  assert.ok(
    shellCss.includes('.app-main-scroll:has(> [data-app-footer]) { padding-bottom: 0 !important; }'),
    "der Auslauf wird nicht abgeraeumt"
  );
});
