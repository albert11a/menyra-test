import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

import { STEP_ORDER } from "../apps/mnyra-heart/heart-landing-render.js";
import { renderHero, renderSurface } from "../apps/menyra-social/lead-landing/lead-landing-sections.js";
import {
  renderChapterMore,
  renderChapterWhat,
  renderDecision,
  renderFreeFeatures,
  renderPaidFeatures,
  renderQrStands,
  renderServiceIntro,
  renderServicePhotos,
  renderServicePrice,
  renderServiceScope,
  renderZeroPrice
} from "../apps/menyra-social/lead-landing/lead-landing-sales.js";

// Zwei Seiten, eine Liste von Namen.
//
// Die Landing zaehlt pro Bildschirm mit und schickt die Zeiten unter dessen
// data-track-Namen nach Firestore. Heart rechnet daraus aus, wo die Wirte
// abspringen - und geht dabei von einer Liste aus, die von Hand gepflegt ist.
//
// Laufen die beiden auseinander, geht nichts kaputt: Die Auswertung laesst
// einen Bildschirm einfach weg oder zeigt ihn mit null Aufrufen an. Genau das
// ist das Gefaehrliche daran - die Zahlen sind dann still falsch, und niemand
// merkt es. Dieser Test rendert die echte Landing und haelt ihre Marken gegen
// Heart.

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");

// So wenig Daten, wie die Renderer brauchen. Die Marken haengen nicht am
// Inhalt, sondern am Aufbau der Seite - ein Lokal ohne Postimet hat dieselben
// Bildschirme wie eines mit.
const PROFIL = {
  name: "Test Lokal",
  city: "Prishtine",
  address: "Rruga B 12",
  phone: "+38344000000",
  currency: "EUR",
  locations: [{ address: "Rruga B 12", lat: 42.6, lng: 21.1 }]
};

function landingMarken() {
  const html = [
    renderHero(PROFIL),
    renderSurface(PROFIL, [], [], []),
    renderChapterWhat(),
    renderFreeFeatures(PROFIL, []),
    renderZeroPrice(),
    renderServiceIntro(),
    renderServicePhotos({}, []),
    renderServiceScope(),
    renderQrStands({}),
    renderServicePrice({}),
    renderChapterMore(),
    renderPaidFeatures({}),
    renderDecision(PROFIL)
  ].join("");

  const marken = [];
  for (const treffer of html.matchAll(/data-track="([^"]+)"/g)) {
    if (!marken.includes(treffer[1])) marken.push(treffer[1]);
  }
  return marken;
}

test("Heart kennt genau die Bildschirme, die die Landing mitzaehlt", () => {
  const aufDerLanding = landingMarken();
  const inHeart = STEP_ORDER.map((step) => step.key);

  const fehlenInHeart = aufDerLanding.filter((name) => !inHeart.includes(name));
  const zuvielInHeart = inHeart.filter((name) => !aufDerLanding.includes(name));

  assert.deepEqual(
    fehlenInHeart,
    [],
    `Die Landing zaehlt Bildschirme mit, die Heart nicht auswertet: ${fehlenInHeart.join(", ")}.`
    + " Sie fehlen in STEP_ORDER in apps/mnyra-heart/heart-landing-render.js."
  );
  assert.deepEqual(
    zuvielInHeart,
    [],
    `Heart wertet Bildschirme aus, die es auf der Landing nicht gibt: ${zuvielInHeart.join(", ")}.`
    + " Sie stehen dort dauerhaft bei null Aufrufen."
  );
});

test("die Reihenfolge in Heart ist die der Seite", () => {
  // Sonst steht der Preis vor dem Profil, und die Absprungkurve liest sich
  // rueckwaerts.
  assert.deepEqual(STEP_ORDER.map((step) => step.key), landingMarken());
});

test("jeder Bildschirm in Heart hat eine Beschriftung", () => {
  STEP_ORDER.forEach((step) => {
    assert.ok(step.label && step.label.trim(), `"${step.key}" hat keine Beschriftung`);
  });
});

test("die Seite wird in der Reihenfolge zusammengesetzt, die dieser Test annimmt", () => {
  // Dieser Test baut die Seite selbst zusammen. Aendert sich die Reihenfolge
  // in lead-landing-app.js, ohne dass sie hier mitgeht, prueft er die falsche
  // Seite - und faende die Verschiebung nicht, die er finden soll.
  const app = fs.readFileSync(path.join(ROOT, "apps/menyra-social/lead-landing/lead-landing-app.js"), "utf8");
  const seite = app.slice(app.indexOf("function renderPage"), app.indexOf("async function boot"));
  const aufrufe = Array.from(seite.matchAll(/\$\{(render[A-Za-z]+)\(/g)).map((treffer) => treffer[1]);
  assert.deepEqual(aufrufe, [
    "renderHero",
    "renderSurface",
    "renderChapterWhat",
    "renderFreeFeatures",
    "renderZeroPrice",
    "renderServiceIntro",
    "renderServicePhotos",
    "renderServiceScope",
    "renderQrStands",
    "renderServicePrice",
    "renderChapterMore",
    "renderPaidFeatures",
    "renderDecision"
  ]);
});

test("die Marken der Landing halten sich an das, was die Regeln durchlassen", () => {
  // firestore.rules laesst nur Namen aus Kleinbuchstaben, Ziffern und
  // Bindestrich durch, und hoechstens 40 Stueck. Ein Name mit einem Punkt
  // darin brechte die ganze Sitzung zu Fall, nicht nur diesen einen Wert.
  const marken = landingMarken();
  assert.ok(marken.length > 0, "keine Marken gefunden - dann prueft dieser Test nichts");
  assert.ok(marken.length <= 40, `${marken.length} Bildschirme, die Regel laesst 40 zu`);
  marken.forEach((name) => {
    assert.match(name, /^[a-z0-9-]+$/, `"${name}" wuerde von den Firestore-Regeln abgewiesen`);
  });
});
