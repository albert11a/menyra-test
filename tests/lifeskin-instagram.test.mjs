// INSTAGRAM GANZ UNTEN AUF DER THERAPIESEITE (24.09.) - immer sichtbar,
// nur echte Zahlen, beide Konten verlinkt.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const HTML = fs.readFileSync("apps/lifeskin-verkauf/terapia.html", "utf8");

test("der Abschnitt steht nach den Details, vor dem Fuss, und ist nicht versteckt", () => {
  const auf = /<section class="pjese insta" id="instagram"[^>]*>/.exec(HTML)?.[0] || "";
  assert.ok(auf, "Der Abschnitt fehlt");
  assert.doesNotMatch(auf, /hidden/);
  assert.ok(HTML.indexOf('id="analiza"') < HTML.indexOf('id="instagram"'));
  assert.ok(HTML.indexOf('id="instagram"') < HTML.indexOf('class="fundi"'));
});

test("beide Konten verlinkt, mit den echten Zahlen", () => {
  const teil = HTML.slice(HTML.indexOf('id="instagram"'), HTML.indexOf('class="fundi"'));
  assert.match(teil, /href="https:\/\/www\.instagram\.com\/lifeskin\.ks\/"/);
  assert.match(teil, /href="https:\/\/www\.instagram\.com\/lifeskin\.al\/"/);
  assert.match(teil, /73,9 mijë/);
  assert.match(teil, /108 mijë/);
  assert.match(teil, /181\.900/);
  assert.doesNotMatch(teil, /verifik|verified/i, "Kein Haken, den die Konten nicht haben");
});
