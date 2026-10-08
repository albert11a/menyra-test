// LIFESKIN SHOP - EINBLENDEN BEIM SCROLLEN (08.10., Inhaber): nur Abschnitte
// unter dem ersten Bildschirm, nie ohne Beobachter oder bei "weniger Bewegung".
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

function element(top) {
  const klassen = new Set();
  const stil = new Map();
  return {
    top,
    classList: { add: (k) => klassen.add(k), has: (k) => klassen.has(k) },
    style: { setProperty: (k, v) => stil.set(k, v) },
    stil,
    getBoundingClientRect: () => ({ top })
  };
}

function aufbau(tops) {
  const els = tops.map(element);
  const dok = { querySelectorAll: (wahl) => (wahl === "#setet .routine-card" ? els : []) };
  let rueckruf = null;
  const beobachtet = [];
  class Beobachter {
    constructor(f) { rueckruf = f; }
    observe(el) { beobachtet.push(el); }
    unobserve() {}
  }
  return { els, dok, Beobachter, beobachtet, zeige: (list) => rueckruf(list.map((target) => ({ target, isIntersecting: true }))) };
}

test("nur unter dem ersten Bildschirm versteckt, im Bild gleitet es herein", async () => {
  const { einblenden } = await import("../apps/lifeskin-shop/einblenden.js");
  const a = aufbau([300, 1200, 1400]);
  einblenden({ dok: a.dok, fenster: { innerHeight: 844, matchMedia: () => ({ matches: false }) }, Beobachter: a.Beobachter });
  assert.equal(a.els[0].classList.has("ls-rein"), false, "im ersten Bildschirm nie versteckt");
  assert.ok(a.els[1].classList.has("ls-rein") && a.els[2].classList.has("ls-rein"));
  assert.deepEqual(a.beobachtet, [a.els[1], a.els[2]]);
  a.zeige([a.els[1], a.els[2]]);
  assert.ok(a.els[1].classList.has("ls-rein--da") && a.els[2].classList.has("ls-rein--da"));
  assert.equal(a.els[2].stil.get("--rein-verz"), "90ms");
});

test("ohne Beobachter oder bei weniger Bewegung bleibt alles sichtbar", async () => {
  const { einblenden } = await import("../apps/lifeskin-shop/einblenden.js");
  const a = aufbau([1200]);
  assert.equal(einblenden({ dok: a.dok, fenster: { innerHeight: 844 }, Beobachter: undefined }), null);
  assert.equal(einblenden({ dok: a.dok, fenster: { innerHeight: 844, matchMedia: () => ({ matches: true }) }, Beobachter: a.Beobachter }), null);
  assert.equal(a.els[0].classList.has("ls-rein"), false);
});

test("eingebunden, mit Rueckfall in CSS und ohne Pixel", () => {
  const html = lies("apps/lifeskin-shop/index.html");
  assert.match(html, /<script type="module" src="\/apps\/lifeskin-shop\/einblenden\.js"><\/script>/);
  const css = lies("apps/lifeskin-shop/shop-youth.css");
  assert.match(css, /prefers-reduced-motion:reduce\)\{#ls-einstieg \.ls-rein\{opacity:1;transform:none;transition:none\}/);
  assert.doesNotMatch(lies("apps/lifeskin-shop/einblenden.js"), /fbq\(|lifeskin-pixel|melde\?*\.?\(|import /);
});
