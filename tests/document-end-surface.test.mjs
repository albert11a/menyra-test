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

test("both white surfaces say how they end", () => {
  // Das Bento des Panels ...
  assert.ok(renderDashboardBento("<p>x</p>").includes('data-app-end-surface="surface"'));
  // ... und die weisse Kapitel-Flaeche des Feed-Gates.
  const feed = read("apps", "menyra-social", "core", "feed", "feed-view-orchestration-controller.js");
  const at = feed.indexOf('class="feed-gate-chapters"');
  assert.ok(at > -1);
  assert.ok(feed.slice(at, at + 200).includes('data-app-end-surface="surface"'), feed.slice(at, at + 200));
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
