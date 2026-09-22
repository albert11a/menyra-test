import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { baueStillLinks, renderStillLinks } from "../apps/mnyra-heart/heart-lifeskin-render.js";

test("jeder Link in 'Seiten ohne Stats' traegt still=1", () => {
  const zustand = {
    sitzungen: [
      { id: "aaaa1111", createdAt: "2026-09-01T10:00:00Z" },
      { id: "bbbb2222", createdAt: "2026-09-02T10:00:00Z" }
    ],
    tests: [],
    berichte: {
      aaaa1111: { status: "wartet" },
      bbbb2222: { status: "fertig", produkte: ["serum"] }
    }
  };
  const { master, gruppen } = baueStillLinks(zustand);
  assert.match(master, /\/lifeskin\?still=1$/);
  const alle = gruppen.flatMap((g) => g.seiten);
  for (const seite of alle) assert.match(seite.url, /[?&]still=1(&|$)/, seite.label);
  const nach = gruppen.at(-1).seiten;
  assert.match(nach[0].url, /\/analiza\/aaaa1111\?still=1$/);
  assert.match(nach[1].url, /\/analiza\/bbbb2222\?still=1$/);
  assert.match(nach[2].url, /\/analiza\/bbbb2222\?still=1&kasse=1$/);
  assert.ok(alle.some((s) => /schirm=tel&weg=foto/.test(s.url)));
});

test("eigene Testfaelle gehen vor, fehlende Faelle stehen ohne Link da", () => {
  const zustand = {
    sitzungen: [{ id: "cccc3333", createdAt: "2026-09-05T10:00:00Z" }],
    tests: [{ id: "dddd4444", createdAt: "2026-09-01T10:00:00Z" }],
    berichte: { cccc3333: { status: "wartet" }, dddd4444: { status: "wartet" } }
  };
  const nach = baueStillLinks(zustand).gruppen.at(-1).seiten;
  assert.match(nach[0].url, /dddd4444/);
  assert.equal(nach[1].url, "");
  assert.match(renderStillLinks(zustand), /keine freigegebene Analyse/);
});

test("jede Lifeskin-Seite laedt den stillen Modus vor allen Modulen", () => {
  for (const seite of ["lifeskin", "lifeskin-landing", "lifeskin-astra", "lifeskin-bericht",
    "lifeskin-trichter", "lifeskin-landing-template", "lifeskin-einstieg-template"]) {
    const html = readFileSync(new URL(`../apps/${seite}/index.html`, import.meta.url), "utf8");
    const still = html.indexOf('<script src="/shared/lifeskin-still.js"></script>');
    const modul = html.indexOf('type="module"');
    assert.ok(still > 0, `${seite}: Skript fehlt`);
    assert.ok(modul < 0 || still < modul, `${seite}: Skript kommt nach den Modulen`);
  }
});
