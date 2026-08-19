import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  WORK_SURFACE_CSS,
  WORK_SURFACE_STYLE_ELEMENT_ID,
  ensureWorkSurfaceStylesInjected
} from "../apps/menyra-social/core/ui/work-surface-render-utils.js";
import {
  DASHBOARD_CSS,
  renderDashboardBento,
  renderDashboardGreeting,
  renderDashboardMetricCards,
  renderDashboardPanelTabs
} from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";
import { renderGoAdminBodyCore } from "../apps/menyra-social/core/go/business-go-render-utils.js";

const escapeHtml = (value = "") => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");
const icon = (name = "", cls = "") => `<i data-lucide="${name}" class="${cls}"></i>`;
const deps = { escapeHtml, icon };

const shell = readFileSync(new URL("../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js", import.meta.url), "utf8");
const goController = readFileSync(new URL("../apps/menyra-social/core/go/go-admin-view-controller.js", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");

const goHtml = (extra = {}) => renderGoAdminBodyCore({
  restaurantName: "Casa Rita",
  tab: "active",
  overview: { uniqueViewers: 42, accepted: 7, visits: 3, visitors: 11, openCents: 450 },
  deps,
  ...extra
});

const paneliHtml = () => [
  renderDashboardGreeting({ name: "Casa Rita", hour: 10, iconFn: icon }),
  renderDashboardMetricCards({ cards: [{ key: "a", label: "Shikime", value: "42" }], iconFn: icon }),
  renderDashboardBento(renderDashboardPanelTabs({ activeTab: "funksionet", iconFn: icon }))
].join("");

// ===========================================================================
// 1. Eine Geometrie fuer beide Seiten
// ===========================================================================

test("both work surfaces are built from the same layout tokens", () => {
  // Die Marken stehen genau einmal, an der Wurzel beider Seiten.
  [
    "--work-inline: 1.5rem;",
    "--work-head-top: 32px;",
    "--work-head-gap: 36px;",
    "--work-head-min-height: 44px;",
    "--work-cards-gap: 80px;",
    "--work-bento-radius: 40px;",
    "--work-bento-tail: 112px;",
    "--work-bento-lead: 44px;"
  ].forEach((token) => assert.ok(WORK_SURFACE_CSS.includes(token), token));

  // Und die Wurzel beider Seiten traegt die Klasse, aus der sie kommen.
  assert.ok(goHtml().includes(`<div class="mnyra-work animate-in`));
  const dashboardView = readFileSync(
    new URL("../apps/menyra-social/core/dashboard/dashboard-view-controller.js", import.meta.url),
    "utf8"
  );
  assert.ok(dashboardView.includes(`<section class="mnyra-work mnyra-dash" data-dashboard-root>`));
});

test("neither page keeps a pixel geometry of its own beside the shared one", () => {
  // Die alten Einzelloesungen: 28px Seitenpolster im Paneli, 1.5rem in GO -
  // zwei Zahlen fuer dieselbe Flucht. Sie duerfen nicht zurueckkommen.
  [
    "padding: 16px 28px 0;",
    "margin: 28px -28px 0;",
    "margin: 72px -28px 0;",
    "margin-left: -28px;"
  ].forEach((gone) => assert.equal(DASHBOARD_CSS.includes(gone), false, gone));

  const go = goHtml();
  [
    "margin: 0 -1.5rem 1.5rem;",
    "margin: 72px -1.5rem 0;",
    "padding: 22px 1.5rem 112px;"
  ].forEach((gone) => assert.equal(go.includes(gone), false, gone));
});

test("title, cards and bento start on the same x axis on both pages", () => {
  // Alle drei rechnen aus derselben Marke - links wie rechts.
  assert.ok(WORK_SURFACE_CSS.includes("padding: var(--work-head-top) var(--work-inline) 0;"));
  assert.ok(WORK_SURFACE_CSS.includes("margin: 0 calc(-1 * var(--work-inline)) 0;"));
  assert.ok(WORK_SURFACE_CSS.includes("padding: 0 var(--work-inline);"));
  assert.ok(WORK_SURFACE_CSS.includes("margin: var(--work-cards-gap) calc(-1 * var(--work-inline)) 0;"));

  // Und beide Seiten setzen die Klassen auch wirklich.
  const paneli = paneliHtml();
  const go = goHtml();
  [paneli, go].forEach((html) => {
    assert.ok(html.includes("mnyra-work__head"), html.slice(0, 200));
    assert.ok(html.includes("mnyra-work__cards"), html.slice(0, 200));
    assert.ok(html.includes("mnyra-work__bento"), html.slice(0, 200));
  });
});

test("the title block is the same height on both pages", () => {
  // Im Paneli setzt die Begruessung die Zeilenhoehen selbst (1.1 / 1.2). In GO
  // brachte text-xl seine eigene mit - der Textblock wurde 46,5 statt 44 Punkte
  // hoch, und alles darunter stand zweieinhalb Punkte tiefer als im Paneli.
  assert.ok(WORK_SURFACE_CSS.includes("min-height: var(--work-head-min-height);"));
  assert.ok(DASHBOARD_CSS.includes("line-height: 1.1;"));
  const go = goHtml();
  assert.ok(go.includes(".go-head__brand .go-title { line-height: 1.1; }"));
  assert.ok(go.includes(".go-head__brand .go-title-sub { line-height: 1.2; }"));
});

test("mobile and desktop are treated alike - neither page breaks at a width", () => {
  // GO machte ab 768px aus der Wischreihe ein Raster und aus der Ueberschrift
  // eine groessere Schrift; das Paneli tat beides nicht. Genau an dieser
  // Schwelle liefen die beiden Seiten auseinander.
  assert.equal(goHtml().includes("@media (min-width: 768px) {"), false);
  assert.equal(DASHBOARD_CSS.includes("@media (min-width: 768px)"), false);
  // Die einzigen Schwellen sind die der Pillen - und die gelten fuer beide.
  assert.ok(WORK_SURFACE_CSS.includes("@media (max-width: 413px) {"));
  assert.ok(WORK_SURFACE_CSS.includes("@media (max-width: 359px) {"));
});

// ===========================================================================
// 2. Eine Pille fuer beide Seiten
// ===========================================================================

test("the Paneli pills are literally the pills of Mnyra GO", () => {
  // Weder das Paneli noch GO schreiben noch eine eigene Pille. (".mnyra-dash__tabs"
  // bleibt: daran haengen nur noch die Abstaende der Stuecke im Bento.)
  assert.equal(/\.mnyra-dash__tab(?![\w-])/.test(DASHBOARD_CSS), false);
  assert.equal(/\.go-tab(?![\w-])/.test(goHtml()), false);
  assert.equal(goHtml().includes(".go-tab-label"), false);

  // Beide Seiten zeichnen dieselbe Reihe und dieselbe Pille.
  assert.ok(paneliHtml().includes(`<div class="mnyra-work__pills mnyra-dash__tabs"`));
  assert.ok(paneliHtml().includes(`class="mnyra-work__pill"`));
  assert.ok(goHtml().includes(`<div class="mnyra-work__pills go-tabs__pane"`));
  assert.ok(goHtml().includes(`class="mnyra-work__pill"`));

  // Hoehe, Radius, Rand, Typografie, Symbolgroesse, Innenabstand und Luecke
  // stehen einmal - und der gewaehlte Zustand ist auf beiden Seiten das
  // Violett der Marke, nicht mehr Schwarz hier und Violett dort.
  [
    "--work-pill-height: 44px;",
    "--work-pill-inline: 10px;",
    "--work-pill-icon: 14px;",
    "--work-pill-font: 11px;",
    "--work-pill-gap: 8px;",
    "--work-pill-border: #e2e8f0;",
    "--work-pill-active: #4f46e5;",
    "--work-pill-active-ink: #ffffff;"
  ].forEach((token) => assert.ok(WORK_SURFACE_CSS.includes(token), token));
  assert.equal(DASHBOARD_CSS.includes("background: var(--dash-black);\n  border-color: var(--dash-black);"), false);
});

test("every Paneli pill keeps its name for screen readers when the word goes", () => {
  // Unter 360 Punkten bleibt nur das Symbol - auf beiden Seiten. Dann muss der
  // Name woanders stehen, sonst ist die Pille ein Kreis ohne Auskunft.
  const paneli = paneliHtml();
  ["Funksionet", "Analitika", "Opsionet"].forEach((label) => {
    assert.ok(paneli.includes(`aria-label="${label}"`), label);
    assert.ok(paneli.includes(`title="${label}"`), label);
  });
  assert.ok(WORK_SURFACE_CSS.includes(".mnyra-work__pill-label { display: none; }"));
});

// ===========================================================================
// 3. Die Einstellungen stehen im globalen Header
// ===========================================================================

test("settings sit in the global header, before language and the last icon", () => {
  // Reihenfolge: Einstellungen -> Sprache -> das Symbol, das dort schon stand.
  const row = shell.slice(
    shell.indexOf("renderWorkSettingsButton(actionButtonClass, actionIconClass)"),
    shell.indexOf(`data-action="cart"`, shell.indexOf("renderWorkSettingsButton(actionButtonClass, actionIconClass)"))
  );
  assert.ok(row.includes("renderLanguageToggleButton("), row);

  // Nur auf den beiden Arbeitsseiten.
  assert.ok(shell.includes(`return activeTabKey === "dashboard" || activeTabKey === "gobiznes";`));
  // Lucide Settings, in derselben Groesse und Farbe wie die Symbole daneben:
  // sie bekommen alle dieselbe Klasse aus derselben Zeile.
  assert.ok(shell.includes(`${"$"}{icon("settings", iconClass)}`));
  assert.ok(shell.includes("function renderWorkSettingsButton(buttonClass = \"\", iconClass = \"w-5 h-5\") {"));
});

test("the settings button opens the settings that already exist", () => {
  // Keine neue Logik: im Paneli ist es die Pille "Opsionet", in GO der Reiter
  // "options" - genau der, den frueher der violette Knopf im Inhalt oeffnete.
  assert.ok(shell.includes(`data-go-header-settings="true" data-go-business-tab="options"`));
  assert.ok(shell.includes(`data-dashboard-panel-tab="opsionet"`));
  // Und die GO-Seite hoert auf den Knopf, obwohl er ausserhalb von ihr steht.
  assert.ok(goController.includes(`[data-go-admin], [data-go-offer-editor], [data-go-header-settings]`));
});

test("no violet settings button is left in the Mnyra GO content", () => {
  const go = goHtml();
  assert.equal(go.includes("go-head__plus"), false);
  assert.equal(go.includes(`data-go-business-tab="options"`), false);
  // Die Seite der Einstellungen selbst ist unveraendert erreichbar.
  assert.ok(goHtml({ tab: "options" }).includes("data-go-pause="));
});

test("the Paneli keeps Opsionet as a pill as well", () => {
  // Verlangt: die bestehende Pille bleibt vorerst stehen, auch wenn der Weg
  // jetzt zusaetzlich oben im Header steht.
  assert.ok(paneliHtml().includes(`data-dashboard-panel-tab="opsionet"`));
});

test("the extra icon does not push the brand out of a 320px header row", () => {
  // Drei Symbole statt zwei: die Zeile bekommt deshalb dieselbe schmale
  // Behandlung wie mit Location-Feld oder Pill-Zeile, und auf den schmalsten
  // Telefonen ruecken die Symbole noch einmal enger.
  assert.ok(shell.includes("const compactHeaderIcons = !!showFeedLocationHeaderSearch || hasHeaderTabs || showWorkSettings;"));
  assert.ok(shell.includes("const tightHeaderRow = hasHeaderTabs || showWorkSettings;"));
  assert.ok(shell.includes(`smart-header-actions--work`));
  assert.ok(indexHtml.includes(".smart-header-actions--work > button { width: 2rem; }"));
});

// ===========================================================================
// 4. Das Blatt kommt an
// ===========================================================================

test("the shared stylesheet reaches both pages exactly once", () => {
  // GO traegt es in der Seite (sie wird als Ganzes ersetzt), das Paneli haengt
  // es einmal in den Kopf des Dokuments.
  const go = goHtml();
  assert.ok(go.includes(".mnyra-work {"));
  assert.equal(go.split(".mnyra-work__bento {").length - 1, 1);

  const styles = [];
  const documentObj = {
    getElementById: (id) => styles.find((entry) => entry.id === id) || null,
    createElement: () => ({ id: "", textContent: "" }),
    head: { appendChild: (node) => styles.push(node) }
  };
  ensureWorkSurfaceStylesInjected(documentObj);
  ensureWorkSurfaceStylesInjected(documentObj);
  assert.equal(styles.length, 1);
  assert.equal(styles[0].id, WORK_SURFACE_STYLE_ELEMENT_ID);
  assert.ok(styles[0].textContent.includes("--work-inline: 1.5rem;"));
});
