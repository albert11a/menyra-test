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
// Pixel-Aenderung erlaubt von Albert am 01.10.2026: CAPI-Version v21.0 ->
// v26.0, Lead zusaetzlich vom Server (mit derselben eventID wie im Browser),
// Kauf und Lead ueber api/lifeskin-capi.js (Vercel) - die zwei neuen Dateien
// stehen seitdem selbst unter der Sperre.
// Pixel-Aenderung erlaubt von Albert am 02.10.2026: Telefonnummernabgleich
// fuer Lead/Purchase als SHA-256-Hash, ohne zusaetzlichen UI-Haken.
// Pixel-Aenderung erlaubt von Albert am 02.10.2026: Warteseite Browser + Server
// mit gemeinsamer ID und dauerhafte, begrenzte Kauf-Wiederholung.
// Pixel-Aenderung erlaubt von Albert am 07.10.2026: Cookie-Fenster - Pixel
// und Conversions API (Browser, Vercel, Firebase, Wiederholung) nur nach
// "Pranoj" (device.zustimmung === "ja"); das Fenster selbst steht seitdem
// unter der Sperre.
// Pixel-Aenderung erlaubt von Albert am 07.10.2026 (zweiter Auftrag): Fenster
// "wie alle anderen Shops" - vorne "Pranoj" + "Cilësimet", Abwaehlen dort.
// Pixel-Aenderung erlaubt von Albert am 09.10.2026: Server mit IP und
// Nutzerdaten - der Firestore-Ausloeser wartet 45 s und laesst Vercel (mit
// IP und _fbp) zuerst senden; die Marke speichert die Browserangaben als
// Karte, damit Wiederholungen sie behalten. Keine neuen Ereignisse/Namen.
const DATEIEN = Object.freeze({
  "apps/lifeskin/lifeskin-pixel.js": "c9fa98c2ff90c9a0",
  "shared/lifeskin-zustimmung.js": "adec1f5739b5ebbc",
  // Pixel-Aenderung erlaubt von Albert (albert11a, Inhaber) am 28.09.2026:
  // Bestellungen aus dem stillen Modus (order.still) gehen nicht an die CAPI.
  "functions/lifeskin-capi-payload.js": "cff0afe201cadbec",
  "functions/lifeskin-capi-versand.js": "a9e20d0c8088c119",
  "functions/lifeskin-capi.js": "c95d60baa537353c",
  "api/lifeskin-capi.js": "6452dc7f0274ab16",
  "shared/lifeskin-capi-anstossen.js": "ebd17d59c01e266c"
});

// 2. DIE KENNUNG UND DIE EINWILLIGUNG - genau diese zwei Zeilen.
const KONFIG = Object.freeze({
  LIFESKIN_PIXEL_ID: '"1347571994123884"',
  // Seit 07.10.2026 true - Pixel-Aenderung erlaubt von Albert am 07.10.2026.
  LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG: "true"
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
// Pixel-Aenderung erlaubt von Albert am 29.09.2026 (zweiter Auftrag):
// Ergebnisseite mit Warenkorb wie im Laden - AddToCart beim Kaufknopf
// (Warenkorb), nicht mehr beim gesehenen Preis; InitiateCheckout bei
// "Vazhdo me porosinë" (Kasse). Auch die Warteseite meldet kein AddToCart
// mehr fuer den blossen Preis.
// Pixel-Aenderung erlaubt von Albert am 01.10.2026: Lead mit Fallnummer als
// eventID (meldeLead(code)) im Trichter und auf der Warteseite.
const SEITEN_HASH = "aaa5aed39cb9ac04";

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
