// Die Kaufleiste steht immer an der echten Unterkante - auch wenn iOS
// nach Tastatur oder Wischen eine zu kleine Fensterhoehe behaelt.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { untenVersatz } from "../shared/lifeskin-unten.js";

test("normal: kein Versatz", () => {
  assert.equal(untenVersatz({ vvHoehe: 750, vvOben: 0, fensterHoehe: 750 }), 0);
});

test("iOS behaelt die kleine Hoehe: die Leiste muss um die Differenz nach unten", () => {
  assert.equal(untenVersatz({ vvHoehe: 750, vvOben: 0, fensterHoehe: 530 }), 220);
});

test("kleine Abweichungen, Zoom und offene Felder bleiben unangetastet", () => {
  assert.equal(untenVersatz({ vvHoehe: 751, vvOben: 0, fensterHoehe: 750 }), 0);
  assert.equal(untenVersatz({ vvHoehe: 400, vvOben: 100, fensterHoehe: 750, zoom: 1.8 }), 0);
  assert.equal(untenVersatz({ vvHoehe: 400, vvOben: 0, fensterHoehe: 750, feldOffen: true }), 0);
  assert.equal(untenVersatz({}), 0);
});

test("die Leiste rechnet den Versatz in ihr transform - sichtbar und versteckt", () => {
  const css = readFileSync(new URL("../apps/lifeskin-verkauf/verkauf.css", import.meta.url), "utf8");
  assert.match(css, /\.leiste \{[\s\S]*?translate3d\(0, var\(--unten, 0px\), 0\)/);
  assert.match(css, /\.leiste\[data-an="nein"\] \{ transform: translate3d\(0, calc\(110% \+ var\(--unten, 0px\)\), 0\)/);
  const js = readFileSync(new URL("../apps/lifeskin-verkauf/terapia.js", import.meta.url), "utf8");
  assert.match(js, /festUntenHalten\(leiste\)/);
});
