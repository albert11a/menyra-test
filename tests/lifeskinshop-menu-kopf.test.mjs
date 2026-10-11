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

test("Freigegebener Produktkopf: Galerie vor Name, Nutzen und echtem Kaufknopf", () => {
  const kopf = HTML.slice(HTML.indexOf('<section class="hero"'), HTML.indexOf('<section class="section" id="rezultate"'));
  const order = ['class="hero-photo hero-set"', 'class="product-kicker"', 'id="hero-title"', 'class="product-subtitle"', 'class="three-benefits"', 'class="selected-set"', 'class="buy"', 'class="buy-assurance"'];
  const positions = order.map(token => kopf.indexOf(token));
  assert.ok(positions.every(p => p >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(kopf, /LF ACNE \+ LF MOISTUR/);
  assert.match(kopf, /<h1 id="hero-title">Acne Duo<\/h1>/);
  assert.match(kopf, /Trajton aknet aktive\.<br>Hidraton dhe mbeshtet barrieren\./);
  for (const id of ["FlaskConical", "ShieldCheck"]) {
    assert.ok(kopf.includes(`icons.svg#${id}`));
    assert.ok(lies("apps/lifeskin-shop/icons.svg").includes(`<symbol id="${id}"`));
  }
  assert.match(kopf, /class="cta" data-set="acne">Porosit Acne Duo/);
  assert.match(kopf, /data-preis="cmimi"/);
  assert.doesNotMatch(kopf, /hero-tabs|hero-fakte|thumbs|breadcrumbs/);
});

test("Menu und Kopf ohne Pixel", () => {
  assert.doesNotMatch(lies("apps/lifeskin-shop/menu.js"), /fbq\(|lifeskin-pixel|melde\w*\(/);
});
