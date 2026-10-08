// LIFESKIN SHOP - VERTRAUEN AUF DEM TELEFON (Analyse 08.10., Inhaber):
// keine Sterne ohne Bewertungen, die Zahl der Kundennachrichten unter dem
// Titel stimmt mit den Karten ueberein, kein Instagram-Ausgang in der
// Seitenmitte, die Chat-Begruessung kommt spaet und geht von selbst.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const HTML = lies("apps/lifeskin-shop/index.html");

test("Unter dem Titel: echte Zahl der Kundennachrichten, verlinkt auf #klientet", () => {
  const zeile = /<a class="hero-stimmen" href="#klientet"><b>(\d+)<\/b> mesazhe origjinale nga klientët/.exec(HTML);
  assert.ok(zeile, "Zeile unter dem Titel fehlt");
  const karten = (HTML.match(/<button type="button" class="message-card" data-zitat-bild=/g) || []).length;
  assert.equal(Number(zeile[1]), karten, "Zahl unter dem Titel = Zahl der Nachrichtenkarten");
  assert.match(HTML, new RegExp(`<p class="mesazhe-meta">${karten} mesazhe origjinale`));
  assert.ok(HTML.indexOf('id="hero-title"') < HTML.indexOf('class="hero-stimmen"'));
  assert.ok(HTML.indexOf('class="hero-stimmen"') < HTML.indexOf('data-set="acne"'), "vor dem ersten Kaufknopf");
  assert.match(HTML, /id="klientet"/);
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
