import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";

import { renderDashboardBento } from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const read = (...parts) => readFileSync(path.join(repoRoot, ...parts), "utf8");

// ===========================================================================
// Der Streifen am Seitenende.
//
// Auf iOS zeichnet Safari die Flaeche hinter seiner schwebenden Adressleiste
// in der Farbe des Dokument-Grundes. Dort liegt nichts von der Seite mehr -
// eine Ansicht, die unten weiss aufhoert, stiess deshalb auf einen Grund in
// #f8fafc. Kein Element der Seite kann das beheben; nur der Grund selbst.
// ===========================================================================

test("the document canvas takes the colour the view ends with", () => {
  const shell = read("apps", "menyra-social", "index.html");
  // Der Grund ist eine Marke mit Rueckfall: sagt eine Ansicht nichts, bleibt
  // alles wie bisher.
  assert.ok(shell.includes("background: var(--app-canvas, var(--app-bg));"));
  assert.ok(shell.includes('html[data-app-end="surface"] { --app-canvas: #ffffff; }'));
  // Auch der Body, damit beide dieselbe Farbe tragen.
  assert.ok(shell.includes("body { background: #f8fafc; background: var(--app-canvas, var(--app-bg)); color: #0f172a; margin: 0; }"));
});

// Wer die Seite beendet, sagt es - und das sind die Ansichten selbst. Der Fuss
// sagt nichts: er steht unter allen von ihnen und traegt jede Farbe, also
// koennte er nur die eigene melden und nie die der Seite.
test("the views are the ones that say how the page ends", () => {
  assert.ok(renderDashboardBento("<p>x</p>").includes('data-app-end-surface="surface"'));
  const feed = read("apps", "menyra-social", "core", "feed", "feed-view-orchestration-controller.js");
  assert.ok(feed.includes('data-app-end-surface="surface"'));
  const footer = read("apps", "menyra-social", "core", "ui", "app-footer-render-utils.js");
  assert.equal(footer.includes("data-app-end-surface"), false, "der Fuss meldet keine eigene Flaeche");
  // Und der Grund kennt beide Antworten.
  const shell = read("apps", "menyra-social", "index.html");
  assert.ok(shell.includes('html[data-app-end="plane"] { --app-canvas: var(--app-bg); }'));
});

// Dieselbe Marke beantwortet beide Fragen: sie faerbt den Grund des Dokuments
// (hinter der Adressleiste) UND den Fuss darueber. Zwei getrennte Marken
// koennten auseinanderlaufen - dann stuende der Streifen wieder da, nur eine
// Zeile hoeher.
test("the same marker colours the canvas and the footer", () => {
  const shell = read("apps", "menyra-social", "index.html").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(
    shell.includes('.app-main-scroll:has([data-app-end-surface="surface"]) { --app-footer-surface: #ffffff; }'),
    "der Fuss liest die Marke der Ansicht nicht"
  );
  const footer = read("apps", "menyra-social", "core", "ui", "app-footer-render-utils.js");
  assert.ok(footer.includes("var(--app-footer-surface, var(--app-bg, #f8fafc))"));
});

test("the render path asks the view and falls back when it says nothing", () => {
  const app = read("apps", "menyra-social", "social-app.js");
  const at = app.indexOf("function syncDocumentEndSurface");
  assert.ok(at > -1, "der Abgleich muss auffindbar sein");
  const block = app.slice(at, app.indexOf("\n}", at));
  // Das LETZTE markierte Stueck gewinnt - es ist das unterste.
  assert.ok(block.includes("marker[marker.length - 1]"), block);
  // Ohne Marke faellt der Grund zurueck, statt eine alte Farbe zu behalten.
  assert.ok(block.includes("delete root.dataset.appEnd"), block);
  // Und er laeuft bei jedem Neuaufbau mit.
  assert.ok(app.includes("  syncDocumentEndSurface();"));
});
