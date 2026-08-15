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

// Wer die Seite beendet, sagt es - und das ist der Fuss der App. Die Flaechen
// davor sagen nichts: sie sind nicht mehr das Letzte im Dokument, und die
// letzte Marke gewinnt.
test("the footer is the one that says how the page ends", () => {
  const footer = read("apps", "menyra-social", "core", "ui", "app-footer-render-utils.js");
  assert.ok(footer.includes('data-app-end-surface="plane"'));
  assert.equal(renderDashboardBento("<p>x</p>").includes("data-app-end-surface"), false);
  const feed = read("apps", "menyra-social", "core", "feed", "feed-view-orchestration-controller.js");
  assert.equal(feed.includes("data-app-end-surface"), false);
  // Und der Grund kennt beide Antworten.
  const shell = read("apps", "menyra-social", "index.html");
  assert.ok(shell.includes('html[data-app-end="plane"] { --app-canvas: var(--app-bg); }'));
});

// Der Fuss traegt auf jeder Seite dieselbe Farbe. Er hat kurzzeitig die der
// Ansicht darueber uebernommen; die Huelle liest deshalb keine Flaechen-Marke
// mehr, und die Ansichten setzen keine.
test("nothing recolours the footer per view any more", () => {
  const shell = read("apps", "menyra-social", "index.html").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.equal(shell.includes("--app-footer-surface"), false, "die Huelle faerbt den Fuss wieder um");
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
