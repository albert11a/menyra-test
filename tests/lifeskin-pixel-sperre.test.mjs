// DIE PIXEL-SPERRE - Meta-Pixel und Conversions API aendern sich nur mit
// ausdruecklicher Erlaubnis des Inhabers.
//
// Warum: Die Anzeigen optimieren auf genau diese Ereignisse (Lead bei der
// Nummer, Purchase bei der Bestellung). Ein umbenanntes Ereignis, ein
// anderer Zeitpunkt, eine andere Pixel-Kennung - und Meta lernt neu oder
// optimiert auf das Falsche, ohne dass es jemand merkt. Deshalb darf hier
// NIEMAND etwas aendern, auch keine KI, ohne vorher zu fragen
// (AGENTS.md, "Meta-Pixel-Sperre").
//
// Wie: Fuer die Pixel-Dateien wird der ganze Inhalt verglichen, in den
// Seiten jede Zeile, die den Pixel aufruft. Weicht etwas ab, wird dieser
// Test rot - und damit auch die CI auf GitHub.
//
// NUR MIT ERLAUBNIS: Hat der Inhaber eine Aenderung ausdruecklich erlaubt,
// wird der neue Wert unten eingetragen (npm-Ausgabe zeigt ihn) und im
// Commit vermerkt: "Pixel-Aenderung erlaubt von <Name> am <Datum>: <was>".
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const hash = (text) => createHash("sha256").update(text.replace(/\r\n/g, "\n")).digest("hex").slice(0, 16);

const HINWEIS = "Meta-Pixel/Conversions API geaendert. Das ist gesperrt: nur mit ausdruecklicher "
  + "Erlaubnis des Inhabers (AGENTS.md, Meta-Pixel-Sperre). Aenderung zuruecknehmen oder zuerst fragen.";

// 1. DIE PIXEL-DATEIEN - ganz.
// Pixel-Aenderung erlaubt von Albert am 29.09.2026: 1 Kauf erst nach dem
// Speichern melden, 2 Schritt beim zweiten Versuch neu schreiben, 3 User-Agent
// und Seite fuer die Conversions API vorbereiten, 4 nach dem Kauf keine
// AddToCart/InitiateCheckout mehr (tests/lifeskin-kauf-nach-speichern.test.mjs).
const DATEIEN = Object.freeze({
  "apps/lifeskin/lifeskin-pixel.js": "b824053f8f7f84ca",
  // Pixel-Aenderung erlaubt von Albert (albert11a, Inhaber) am 28.09.2026:
  // Bestellungen aus dem stillen Modus (order.still) gehen nicht an die CAPI.
  "functions/lifeskin-capi-payload.js": "b6c4397eda969cb8",
  "functions/lifeskin-capi.js": "f18ba400ba2329ec"
});

// 2. DIE KENNUNG UND DIE EINWILLIGUNG - genau diese zwei Zeilen.
const KONFIG = Object.freeze({
  LIFESKIN_PIXEL_ID: '"1347571994123884"',
  LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG: "false"
});

// 3. JEDE ZEILE IN DEN SEITEN, DIE DEN PIXEL AUFRUFT.
const SEITEN = Object.freeze([
  "apps/lifeskin/lifeskin-app.js",
  "apps/lifeskin/lifeskin-session.js",
  "apps/lifeskin-astra/astra.js",
  "apps/lifeskin-verkauf/terapia.js",
  "apps/lifeskin-landing/landing.js",
  "apps/lifeskin-landing/shop.js",
  "apps/lifeskin-landing/index.html",
  "apps/lifeskin-2/index.html",
  // Der Laden unter /lifeskinshop. Pixel-Aenderung erlaubt von Albert
  // (albert11a, Inhaber) am 28.09.2026: /lifeskinshop meldet AddToCart,
  // InitiateCheckout, Purchase (Browser + CAPI) und Lead wie die anderen Wege.
  "apps/lifeskin-shop/shop.js",
  "apps/lifeskin-shop/index.html",
  "functions/index.js"
]);
const PIXEL_ZEILE = /\bpixel\??\.\w+\(|\bfbq\(|trackCustom|new Pixel\(|pixelKennungen|lifeskinCapi|\bfbc\b|\bfbp\b/;

export function pixelZeilen(pfad) {
  return lies(pfad).split("\n").map((z) => z.trim()).filter((z) => PIXEL_ZEILE.test(z)).join("\n");
}
// Neu eingetragen am 29.09.2026 mit der Erlaubnis oben (browserAngaben in den
// Bestellungen, kein AddToCart/InitiateCheckout nach dem Kauf).
const SEITEN_HASH = "2eb7f4b9de32d1ac";

test("Meta-Pixel-Sperre: die Pixel-Dateien sind unveraendert", () => {
  for (const [pfad, erwartet] of Object.entries(DATEIEN)) {
    assert.equal(hash(lies(pfad)), erwartet, `${pfad}: ${HINWEIS}`);
  }
});

test("Meta-Pixel-Sperre: Pixel-Kennung und Einwilligung sind unveraendert", () => {
  const konfig = lies("apps/lifeskin/lifeskin-config.js");
  for (const [name, wert] of Object.entries(KONFIG)) {
    const treffer = konfig.match(new RegExp(`export const ${name} = ([^;]+);`));
    assert.equal(treffer?.[1], wert, `${name}: ${HINWEIS}`);
  }
});

test("Meta-Pixel-Sperre: jeder Pixel-Aufruf in den Seiten ist unveraendert", () => {
  const alle = SEITEN.map((p) => `# ${p}\n${pixelZeilen(p)}`).join("\n");
  assert.equal(hash(alle), SEITEN_HASH, `Pixel-Aufrufe in den Seiten: ${HINWEIS}`);
});
