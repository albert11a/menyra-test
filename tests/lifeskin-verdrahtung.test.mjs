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

  assert.ok(angesprochen.length > 20, "Die Suche nach Kennungen greift nicht mehr");
  const fehlend = [...new Set(angesprochen)].filter((id) => !imHtml.has(id)).sort();
  assert.deepEqual(fehlend, [], "Diese Kennungen spricht der Trichter an, im HTML gibt es sie nicht");
});

// Und dasselbe fuer die Befundseite.
//
// Sie ist der Bildschirm, den jeder Patient sieht und auf dem alles haengt,
// was nach dem Scan noch passiert - eine Kennung, die dort ins Leere laeuft,
// heisst: kein Knopf, keine Nachricht, kein Verkauf.
test("jede Kennung, die die Befundseite anspricht, gibt es auch in ihrem HTML", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const seite = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");

  const imHtml = new Set([...html.matchAll(/id="(lb-[a-z0-9-]+)"/g)].map((m) => m[1]));
  const angesprochen = [...seite.matchAll(/#(lb-[a-z0-9-]+)/g)].map((m) => m[1]);

  assert.ok(angesprochen.length > 12, "Die Suche nach Kennungen greift nicht mehr");
  const fehlend = [...new Set(angesprochen)].filter((id) => !imHtml.has(id)).sort();
  assert.deepEqual(fehlend, [], "Diese Kennungen spricht die Befundseite an, im HTML gibt es sie nicht");
});

test("keine Kennung kommt im HTML der Befundseite zweimal vor", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const alle = [...html.matchAll(/id="([a-zA-Z0-9_-]+)"/g)].map((m) => m[1]);
  const doppelt = [...new Set(alle.filter((v, i) => alle.indexOf(v) !== i))].sort();
  assert.deepEqual(doppelt, []);
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

// Alle fuenf Bildschirme sehen aus wie dieselbe Anwendung.
//
// Der Kameraschirm war einmal schwarz. Das liess das Vorschaubild wirken -
// und kostete an der einzigen Stelle Vertrauen, an der ein Nein den ganzen
// Trichter beendet: bei der Kamerafrage. Dunkel ist jetzt nur noch das
// Quadrat mit dem Bild.
test("kein Bildschirm des Trichters faellt farblich aus der Reihe", () => {
  const css = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");

  const treffer = css.match(/\.ls-schirm--kamera\s*\{([^}]*)\}/);
  assert.ok(treffer, "Der Kameraschirm hat keine eigene Regel mehr");
  assert.match(treffer[1], /background:\s*var\(--grund\)/,
    "Der Kameraschirm traegt einen anderen Grund als die anderen vier");
  assert.match(treffer[1], /color:\s*var\(--text\)/,
    "Der Kameraschirm traegt eine andere Schriftfarbe");

  // Und keine Ausnahme mehr, die nur wegen des schwarzen Grundes noetig war.
  assert.ok(!/\.ls-schirm--kamera[^{]*\{[^}]*#fff/.test(css),
    "Auf dem Kameraschirm steht noch eine Weiss-Ausnahme");
  assert.ok(!/\.ls-schirm--kamera[^{]*\{[^}]*255,\s*255,\s*255/.test(css),
    "Auf dem Kameraschirm steht noch eine Weiss-Ausnahme");

  // Schwarz bleibt genau eine Stelle: das Quadrat mit dem Bild.
  const buehne = css.match(/\.ls-kamera\s*\{([^}]*)\}/);
  assert.ok(buehne, "Die Kamerabuehne hat keine Regel");
  assert.match(buehne[1], /background:\s*#000/, "Die Fassung des Bildes ist nicht mehr dunkel");
});
