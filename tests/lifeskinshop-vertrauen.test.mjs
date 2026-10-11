// LIFESKIN SHOP - VERTRAUEN AUF DEM TELEFON (Analyse 08.10., Inhaber):
// keine Sterne ohne Bewertungen, keine Zeile mit Kundennachrichten beim
// Hauptbild, kein Instagram-Ausgang in der
// Seitenmitte, die Chat-Begruessung kommt spaet und geht von selbst.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const HTML = lies("apps/lifeskin-shop/index.html");

// Approved 11.10.: original messages after customer media, no count above the product.
test("Originalnachrichten bleiben erhalten und stehen nach Kundenfotos und Videos", () => {
  const karten = (HTML.match(/<button type="button" class="message-card" data-zitat-bild=/g) || []).length;
  assert.equal(karten, 17);
  assert.doesNotMatch(HTML, /mesazhe-meta|hero-stimmen/);
  const tokens = ['id="fillimi"', 'id="rezultate"', 'id="per-ty"', 'id="customer-section"', 'id="klientet"', 'id="setet"'];
  const positions = tokens.map(token => HTML.indexOf(token));
  assert.ok(positions.every(p => p >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(HTML, /id="customer-media"/);
  assert.match(HTML, /data-rail-controls="messages"/);
});

test("Freigegebener Kopf ohne unbelegte Sternbewertung", () => {
  assert.doesNotMatch(HTML, /★|hero-yjet|mesazhe-yje/);
});

test("Instagram-Bestellung nur im Fussbereich, nicht zwischen den Produkten", () => {
  assert.doesNotMatch(HTML, /class="ig-porosi"|id="porosit-instagram"/);
  const fuss = HTML.slice(HTML.indexOf('<footer class="footer">'));
  assert.match(fuss, /href="https:\/\/ig\.me\/m\/lifeskin\.ks"[^>]*>Porosit në Instagram<\/a>/);
  assert.equal((HTML.match(/ig\.me\/m\/lifeskin\.ks/g) || []).length, 1);
});

test("Chat-Begruessung: erst nach 20 s, nach 8 s wieder weg", () => {
  const js = lies("apps/lifeskin-shop/chat.js");
  assert.match(js, /const GRUSS_NACH_MS = 20000;/);
  assert.match(js, /const GRUSS_DAUER_MS = 8000;/);
  assert.match(js, /this\.gruss\.hidden = false;[\s\S]{0,120}setTimeout\(\(\) => this\.#grussWeg\(\), GRUSS_DAUER_MS\)/);
});

test('Galerie-Knoepfe reagieren auf spaeter geladene Heart-Medien und Scrollgrenzen', async (t) => {
  const { railControls } = await import('../apps/lifeskin-shop/product-page.js');
  const originalMutation = globalThis.MutationObserver;
  const originalResize = globalThis.ResizeObserver;
  t.after(() => { globalThis.MutationObserver = originalMutation; globalThis.ResizeObserver = originalResize; });
  let changed;
  globalThis.MutationObserver = class { constructor(fn) { changed = fn; } observe() {} };
  globalThis.ResizeObserver = class { observe() {} };
  const button = () => ({ disabled: false, handlers: {}, addEventListener(type, fn) { this.handlers[type] = fn; } });
  const prev = button(), next = button(), count = { textContent: '' };
  const controls = { hidden: false, querySelector: selector => ({ '[data-rail-prev]': prev, '[data-rail-next]': next, '[data-rail-count]': count }[selector]) };
  const rail = { children: [], scrollLeft: 0, scrollWidth: 600, clientWidth: 220, handlers: {}, addEventListener(type, fn) { this.handlers[type] = fn; }, scrollBy(options) { this.lastScroll = options; } };
  railControls(controls, rail);
  assert.equal(controls.hidden, true);
  rail.children = [0, 112, 224].map(offsetLeft => ({ offsetLeft, classList: { contains: () => false } }));
  changed();
  assert.equal(controls.hidden, false);
  assert.equal(count.textContent, '1 / 3');
  assert.equal(prev.disabled, true);
  assert.equal(next.disabled, false);
  next.handlers.click();
  assert.equal(rail.lastScroll.left, 220);
  rail.scrollLeft = 112; rail.handlers.scroll();
  assert.equal(count.textContent, '2 / 3');
  rail.scrollLeft = 380; rail.handlers.scroll();
  assert.equal(next.disabled, true);
  let prevented = false;
  rail.handlers.keydown({ target: rail, key: 'ArrowLeft', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(rail.lastScroll.left, -220);
});
