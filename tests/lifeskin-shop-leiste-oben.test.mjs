// DIE BROWSERLEISTE UEBER /lifeskinshop NIMMT DIE FARBE DER LEISTE OBEN.
//
// Safari und In-App-Browser (Instagram, Facebook) lesen auf iOS 26 die
// Farbe ihrer oberen Leiste nicht aus theme-color, sondern aus dem festen
// oder klebenden Element am oberen Rand: WebKit trifft 8 px unter der
// Kante, geht zur ersten festen oder klebenden Ebene und nimmt deren
// einfarbige background-color (kein Verlauf, kein Bild).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("die Leiste 'Kosovë & Shqipëri' klebt oben und traegt eine einfarbige Flaeche", () => {
  const css = lies("apps/lifeskin-shop/shop.css");
  const regel = css.slice(css.indexOf(".announcement{"), css.indexOf("}", css.indexOf(".announcement{")));
  assert.match(regel, /position:sticky;top:0;/, "ohne sticky liest der Browser keine Farbe von ihr");
  assert.match(regel, /background:var\(--ink\)/);
  assert.doesNotMatch(regel, /gradient|url\(/, "Verlauf oder Bild zaehlt fuer die Browserleiste nicht");
  assert.match(css, /--ink:#123b3e/);
  assert.match(css, /scroll-padding-top:44px/, "Sprungmarken landen sonst unter der klebenden Leiste");
  const html = lies("apps/lifeskin-shop/index.html");
  assert.match(html, /<meta name="theme-color" content="#123b3e">/);
  assert.ok(html.indexOf('class="announcement"') < html.indexOf('class="page"'), "die Leiste muss ganz oben stehen");
});
