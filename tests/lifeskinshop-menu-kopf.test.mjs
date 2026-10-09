// LIFESKIN SHOP - MENU OBEN LINKS UND NEUER KOPF (09.10., Inhaber):
// Menu als Vollbild (Trajtimet, Rreth nesh, Përdorimi), unter dem Titelbild
// Name, Sterne, Text, Zbritje, Kaufknopf, drei Chips, zwei Fakten, Tabs.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const HTML = lies("apps/lifeskin-shop/index.html");

test("Kopf: Menu links, Logo, Shporta", () => {
  assert.match(HTML, /<nav class="wrap nav header"><button type="button" class="nav-menu" id="menu-hap" aria-label="Hap menynë" aria-controls="menu" aria-expanded="false">/);
  assert.match(HTML, /<script type="module" src="\/apps\/lifeskin-shop\/menu\.js"><\/script>/);
});

test("Menu: drei Punkte auf Albanisch, nur einer offen, Sets aus Heart", async () => {
  const menu = HTML.slice(HTML.indexOf('<dialog class="menu" id="menu"'), HTML.indexOf("</dialog>", HTML.indexOf('<dialog class="menu"')));
  const punkte = [...menu.matchAll(/<details class="menu__pjesa" name="menu-pjesa" data-gruppe="menu"[^>]*><summary>([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(punkte, ["Trajtimet", "Rreth nesh", "Përdorimi"]);
  assert.match(menu, /id="menu-setet"/);
  globalThis.__LIFESKIN_TEST__ = true;
  const { menuKarte } = await import("../apps/lifeskin-shop/shop.js");
  const karte = menuKarte({ id: "acne", titulli: "Seti kundër akneve", produkte: ["lf-acne", "lf-moistur"], cmimi: 25 }, "/bild.jpg", { zbritje: true });
  assert.match(karte, /<p class="menu-set__emri">Acne Duo<\/p><p class="menu-set__lloji">Seti kundër akneve<\/p>/);
  assert.match(karte, /<del>58 €<\/del><strong>25 €<\/strong>/);
  assert.match(karte, /data-set="acne">Porosit<\/button>/);
  assert.doesNotMatch(menuKarte({ id: "acne", titulli: "X", produkte: ["lf-acne", "lf-moistur"], cmimi: 25 }, ""), /<del>/);
  assert.match(lies("apps/lifeskin-shop/aktion.js"), /#menu \[data-set\]";/, "bei 0 Sets auch im Menu gesperrt");
});

test("menu.js: oeffnen, schliessen, nur ein Aufklapper je Gruppe", async () => {
  const { nurEinerOffen, menuStarten } = await import("../apps/lifeskin-shop/menu.js");
  const hoerer = {};
  const details = [0, 1, 2].map(() => ({ open: false, dataset: { gruppe: "hero-tab" } }));
  const dok = { addEventListener: (art, f) => { hoerer[art] = f; }, querySelectorAll: () => details };
  nurEinerOffen(dok);
  details[0].open = true; hoerer.toggle({ target: details[0] });
  details[2].open = true; hoerer.toggle({ target: details[2] });
  assert.deepEqual(details.map((d) => d.open), [false, false, true]);

  const ereignisse = {};
  const attr = {};
  const menu = { open: false, addEventListener: (a, f) => { ereignisse[`menu-${a}`] = f; }, showModal() { this.open = true; }, close() { this.open = false; ereignisse["menu-close"]?.(); }, querySelectorAll: () => [] };
  const hap = { setAttribute: (k, v) => { attr[k] = v; }, addEventListener: (a, f) => { ereignisse[`hap-${a}`] = f; } };
  const mbyll = { addEventListener: (a, f) => { ereignisse[`mbyll-${a}`] = f; } };
  const dok2 = { getElementById: (id) => ({ menu, "menu-hap": hap, "menu-mbyll": mbyll }[id]), querySelector: () => null, documentElement: { setAttribute() {}, removeAttribute() {} } };
  menuStarten(dok2);
  ereignisse["hap-click"]();
  assert.equal(menu.open, true);
  assert.equal(attr["aria-expanded"], "true");
  ereignisse["menu-click"]({ target: { closest: (w) => (w.includes("[data-set]") ? {} : null) } });
  assert.equal(menu.open, false, "Porosit schliesst das Menu");
  assert.equal(attr["aria-expanded"], "false");
});

test("Kopf: Name, 2 x 30 ml, drei Chips mit Icon, zwei Fakten, vier kurze Tabs", () => {
  assert.match(HTML, /<p class="hero-emri__set">Acne Duo<\/p><p class="hero-emri__lloji">Trajtim kundër akneve · 2 × 30 ml<\/p>/);
  const chips = [...HTML.matchAll(/<li><svg class="icon" aria-hidden="true"><use href="\/apps\/lifeskin-shop\/icons\.svg#(\w+)"><\/use><\/svg><span>([^<]+)<\/span><\/li>/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(chips, [["Flag", "Made in Germany"], ["BadgeCheck", "Testuar nga dermatologët"], ["Zap", "Shumë efektiv"]]);
  const icons = lies("apps/lifeskin-shop/icons.svg");
  for (const id of ["Flag", "BadgeCheck", "Zap", "Microscope", "Stethoscope"]) assert.match(icons, new RegExp(`<symbol id="${id}"`));
  assert.match(HTML, /<b>94 %<\/b>e bakterieve të akneve largohen/);
  assert.match(HTML, /<b>Dermatologët<\/b>e krijuan formulën/);
  const tabs = [...HTML.matchAll(/<details name="hero-tab" data-gruppe="hero-tab"><summary>([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(tabs, ["Përfitimet", "Garancioni", "Përdorimi", "Përbërësit"]);
  assert.doesNotMatch(HTML, /të rregullt/, "keine Wirkungszusage 'me përdorim të rregullt'");
  // Reihenfolge im Kopf: Zbritje, Kaufknopf, Lieferung, Chips, Fakten, Tabs.
  const pos = ['id="aktion"', 'class="buy"', 'class="micro"', 'class="hero-chips"', 'class="hero-fakte"', 'class="hero-tabs"'].map((s) => HTML.indexOf(s));
  assert.deepEqual([...pos].sort((a, b) => a - b), pos);
});

test("Menu und Kopf ohne Pixel", () => {
  assert.doesNotMatch(lies("apps/lifeskin-shop/menu.js"), /fbq\(|lifeskin-pixel|melde\w*\(/);
});
