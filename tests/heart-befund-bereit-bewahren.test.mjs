// Befund: "Bereit" speichert alles und markiert den Fall (Chip im Fach
// Offen); der Bogen geht beim Wechsel zur Fallliste und beim Neuladen
// nicht verloren; das Antwortfeld in Schritt 3 waechst nicht mit.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const lies = (p) => fs.readFileSync(p, "utf8");

test("Bereit: eigener Knopf, Vorschau mit Marke, Chip im Fach Offen", () => {
  const render = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(render, /data-action="lifeskin-bericht-bereit"/);
  assert.match(render, /alle: \[m\.prompt, m\.bereit\]/);
  assert.match(render, /bereit: \{ id: "bereit", label: "Bereit", an: bericht\?\.bereit === true && bericht\?\.status === "vorschau" \}/);
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  assert.match(adapter, /status: nurStaff \|\| bereit \? "vorschau" : "fertig"/);
  assert.match(adapter, /bereit: bereit === true/);
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /lifeskin-bericht-bereit[\s\S]{0,120}\{ bereit: true \}/);
});

test("der Bogen ueberlebt den Weg zur Fallliste und zurueck", () => {
  const r = lies("apps/mnyra-heart/heart-render.js");
  assert.match(r, /const bewahrtArchiv = new Map\(\)/);
  assert.match(r, /function captureBewahrt[\s\S]{0,400}return bewahrtArchiv;/);
});

test("und ein Neuladen: Aenderungen je Fall auf dem Geraet, geloescht nach dem Speichern", () => {
  const h = lies("apps/mnyra-heart/heart.js");
  assert.match(h, /bogenWiederherstellen\(root\)/);
  assert.match(h, /entwurfLoeschen\(id\);\s*bogenVergessen\(id\);/);
  const sp = lies("apps/mnyra-heart/heart-lifeskin-bogenspeicher.js");
  assert.match(sp, /alt\.schluessel !== schluessel/, "Ein neuerer Stand darf nicht ueberschrieben werden");
});

test("Schritt 3: das Antwortfeld hat eine feste Hoehe", () => {
  assert.match(lies("apps/mnyra-heart/heart-lifeskin-render.js"), /id="lifeskin-json" rows="3" data-fest/);
  assert.match(lies("apps/mnyra-heart/heart.css"), /textarea\.heart-lifeskin-eingabe\[data-fest\] \{ field-sizing: fixed; height: 96px/);
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /\.heart-befund textarea:not\(\[data-fest\]\)/);
  assert.match(lies("apps/mnyra-heart/heart-lifeskin-befundstand.js"), /:not\(\[data-fest\]\)/);
});
