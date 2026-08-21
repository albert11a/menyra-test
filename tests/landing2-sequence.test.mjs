import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { stepFromProgress } from "../apps/menyra-social/lead-landing-2/landing2-scroll.js";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const CSS = fs.readFileSync(
  path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-styles.css"),
  "utf8"
);

// An dieser Rechnung haengt, was der Wirt sieht.
//
// Sie steht deshalb als eigene Funktion ohne DOM da: Ein Fehler hier ist
// keiner, den man beim Durchscrollen bemerkt - er sieht aus wie eine Seite,
// die "einfach so" einen Schritt ueberspringt.

test("der Fortschritt trifft die Schritte gleichmaessig", () => {
  assert.equal(stepFromProgress(0, 4), 0);
  assert.equal(stepFromProgress(0.2, 4), 0);
  assert.equal(stepFromProgress(0.25, 4), 1);
  assert.equal(stepFromProgress(0.5, 4), 2);
  assert.equal(stepFromProgress(0.75, 4), 3);
  assert.equal(stepFromProgress(1, 4), 3);
});

test("ausserhalb der Strecke bleibt es beim ersten und letzten Schritt", () => {
  // Ueber dem Abschnitt und unter ihm wird weiter gerechnet - dort darf nichts
  // Undefiniertes herauskommen, sonst blitzt beim schnellen Wischen eine leere
  // Flaeche auf.
  assert.equal(stepFromProgress(-3, 4), 0);
  assert.equal(stepFromProgress(9, 4), 3);
  assert.equal(stepFromProgress(Number.NaN, 4), 0);
  assert.equal(stepFromProgress(Number.POSITIVE_INFINITY, 4), 3);
});

test("eine Sequenz mit einem Schritt bleibt bei null", () => {
  assert.equal(stepFromProgress(0, 1), 0);
  assert.equal(stepFromProgress(0.99, 1), 0);
  assert.equal(stepFromProgress(1, 1), 0);
  // Auch eine kaputte Angabe darf keinen Schritt -1 ergeben.
  assert.equal(stepFromProgress(0.5, 0), 0);
});

test("die Hoehe eines Abschnitts folgt der Zahl der Schritte", () => {
  // Ohne diese Rechnung bekaeme jede Sequenz dieselbe Strecke - eine mit vier
  // Schritten waere dann doppelt so schnell wie eine mit zwei.
  assert.match(CSS, /min-height:\s*calc\(\(var\(--l2-steps[^)]*\)\s*\+\s*1\)\s*\*\s*var\(--l2-vh\)\)/);
});

test("die Bildschirmhoehe wird festgenagelt, nicht bei jedem Wisch gemessen", () => {
  const code = fs.readFileSync(
    path.join(ROOT, "apps/menyra-social/lead-landing-2/landing2-scroll.js"),
    "utf8"
  );
  assert.ok(code.includes("--l2-vh"), "die Hoehe wird nirgends gesetzt");
  // Kleine Aenderungen sind die Adressleiste, keine Drehung. Wer darauf neu
  // misst, misst bei jedem Wisch neu.
  assert.ok(code.includes("HEIGHT_NOISE_PX"), "jede kleine Hoehenaenderung loest ein Neumessen aus");
  assert.ok(code.includes("requestAnimationFrame"), "beim Scrollen wird ungebremst gerechnet");
  assert.ok(code.includes("{ passive: true }"), "die Scroll-Listener blockieren das Wischen");
});

test("ohne Bewegung steht dieselbe Seite untereinander da", () => {
  // Nicht eine gekuerzte Fassung: Wer Bewegung abgestellt hat, soll alles
  // sehen, nur ohne die Bewegung.
  assert.match(CSS, /\.l2-reduced \.l2-seq__view \{[^}]*opacity: 1/);
  assert.match(CSS, /\.l2-reduced \.l2-seq__caption \{[^}]*opacity: 1/);
  assert.match(CSS, /\.l2-reduced \.l2-seq__sticky \{[^}]*position: static/);
});

test("nichts laeuft seitlich aus dem Bild", () => {
  // Der haeufigste Fehler auf 320px - und der einzige, den man sofort sieht.
  assert.match(CSS, /body \{[^}]*overflow-x: hidden/);
});

test("das Stylesheet fasst nur eigene Namen an", () => {
  // Kein Name aus der App, keiner aus der Lead-Landing. Alles faengt mit l2-
  // an; die wenigen Element-Regeln (body, img, a:focus) bleiben in dieser
  // einen Seite.
  const selectors = Array.from(CSS.matchAll(/^\s*\.([a-zA-Z][\w-]*)/gm)).map((m) => m[1]);
  const fremd = selectors.filter((name) => !name.startsWith("l2-") && name !== "is-in" && name !== "is-active" && name !== "is-own" && name !== "is-muted");
  assert.deepEqual(fremd, [], `fremde Klassennamen im Stylesheet: ${fremd.join(", ")}`);
});
