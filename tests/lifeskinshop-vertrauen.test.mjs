// LIFESKIN SHOP - VERTRAUEN AUF DEM TELEFON (Analyse 08.10., Inhaber):
// keine Sterne ohne Bewertungen, keine Zeile mit Kundennachrichten beim
// Hauptbild, kein Instagram-Ausgang in der
// Seitenmitte, die Chat-Begruessung kommt spaet und geht von selbst.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const HTML = lies("apps/lifeskin-shop/index.html");

test("Keine Zeile mit Kundennachrichten beim Hauptbild (Inhaber 08.10.)", () => {
  assert.doesNotMatch(HTML, /hero-stimmen/);
  const karten = (HTML.match(/<button type="button" class="message-card" data-zitat-bild=/g) || []).length;
  assert.match(HTML, new RegExp(`<p class="mesazhe-meta">${karten} mesazhe origjinale`));
});

test("Keine Sterne ohne Sternebewertungen", () => {
  assert.doesNotMatch(HTML, /★/);
  assert.doesNotMatch(HTML, /mesazhe-yje/);
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
