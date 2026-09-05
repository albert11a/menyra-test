import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

// Ein Knopf, der im Markup steht und den niemand auffaengt, sieht aus wie
// ein Knopf und ist keiner. Genau das ist zweimal passiert: Die Analysen in
// Heart waren wochenlang nicht anklickbar, obwohl die Einzelansicht fertig
// im Code lag, und "Produkt anlegen" tut bis heute nichts.
//
// Solche Fehler findet kein Test, der Funktionen aufruft - nur einer, der
// Markup und Behandler gegeneinander haelt.

test("jeder Knopf in Heart hat einen Behandler", () => {
  const ordner = join(wurzel, "apps/mnyra-heart");
  const events = readFileSync(join(ordner, "heart-events.js"), "utf8");
  const behandelt = new Set([...events.matchAll(/action === "([a-z0-9-]+)"/g)].map((m) => m[1]));

  const gefunden = new Map();
  for (const datei of readdirSync(ordner).filter((f) => f.endsWith(".js") && f !== "heart-events.js")) {
    const quelle = readFileSync(join(ordner, datei), "utf8");
    for (const m of quelle.matchAll(/data-action="([a-z0-9-]+)"/g)) {
      if (!gefunden.has(m[1])) gefunden.set(m[1], datei);
    }
  }

  assert.ok(gefunden.size > 30, `Zu wenige Knoepfe gefunden (${gefunden.size}) - die Suche greift nicht mehr`);
  const tot = [...gefunden].filter(([aktion]) => !behandelt.has(aktion));
  assert.deepEqual(
    tot.map(([aktion, datei]) => `${aktion} (${datei})`),
    [],
    "Diese Knoepfe stehen im Markup, aber heart-events.js faengt sie nicht auf - ein Druck darauf tut nichts"
  );
});

// Dasselbe fuer den Trichter, nur andersherum: Dort werden die Knoepfe ueber
// ihre Kennung angesprochen. Fehlt eine im HTML, laeuft der Aufruf ins Leere
// und der Bildschirm bleibt einfach stehen.
test("jede Kennung, die der Trichter anspricht, gibt es auch im HTML", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
  const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");

  const imHtml = new Set([...html.matchAll(/id="(ls-[a-z0-9-]+)"/g)].map((m) => m[1]));
  const angesprochen = [...app.matchAll(/\$\("#(ls-[a-z0-9-]+)"\)/g)].map((m) => m[1]);

  assert.ok(angesprochen.length > 30, "Die Suche nach Kennungen greift nicht mehr");
  const fehlend = [...new Set(angesprochen)].filter((id) => !imHtml.has(id)).sort();
  assert.deepEqual(fehlend, [], "Diese Kennungen spricht der Trichter an, im HTML gibt es sie nicht");
});

test("keine Kennung kommt im HTML zweimal vor", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
  const alle = [...html.matchAll(/id="([a-zA-Z0-9_-]+)"/g)].map((m) => m[1]);
  const doppelt = [...new Set(alle.filter((v, i) => alle.indexOf(v) !== i))].sort();
  // Zwei gleiche Kennungen heissen: Der Code erwischt immer nur die erste.
  // Genau daran ist das Namensfeld schon einmal gescheitert.
  assert.deepEqual(doppelt, []);
});

test("jeder Bildschirm des Trichters steht im HTML", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
  const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
  const treffer = app.match(/const SCHIRME = \[([^\]]+)\]/);
  assert.ok(treffer, "SCHIRME nicht gefunden");
  for (const name of [...treffer[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1])) {
    assert.ok(html.includes(`id="ls-${name}"`), `Der Bildschirm ls-${name} fehlt im HTML`);
  }
});
