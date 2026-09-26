// Die Bilder der Analyseseite: ein zweiter Bilderbereich in Heart, genau
// wie der fuer die Landingpage - eigene Dokumente, eigenes Feld.
//
// Geprueft wird, was sich still verschieben kann: dass Heart dorthin
// schreibt, wo die Analyseseite liest, dass die Landingpage diese Bilder
// nicht mitlaedt, und dass der Bereich in Heart da ist und seine Knoepfe
// die richtige Art tragen.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (pfad) => readFileSync(join(wurzel, pfad), "utf8");

const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
const terapia = lies("apps/lifeskin-verkauf/terapia.js");
const laden = lies("apps/lifeskin-landing/shop.js");
const heart = lies("apps/mnyra-heart/heart.js");
const ereignisse = lies("apps/mnyra-heart/heart-events.js");

test("Heart schreibt die Bilder dorthin, wo die Analyseseite sie sucht", () => {
  const praefix = /ANALYSE_FOTOT_PRAEFIX = "([^"]+)"/.exec(adapter)?.[1];
  const feld = /ANALYSE_FOTOT_FELD = "([^"]+)"/.exec(adapter)?.[1];
  assert.ok(praefix && feld, "Heart nennt Praefix oder Feld nicht mehr");
  assert.equal(/const ANALYSE_FOTO_PRAEFIX = "([^"]+)"/.exec(terapia)?.[1], praefix,
    "Die Analyseseite sucht die Bilder in einem anderen Dokument");
  assert.equal(/const ANALYSE_FOTO_FELD = "([^"]+)"/.exec(terapia)?.[1], feld,
    "Die Analyseseite liest ein anderes Feld");
  // Nicht dasselbe wie die Landingpage - sonst waeren es dieselben Bilder.
  assert.notEqual(praefix, /LANDING_FOTOT_PRAEFIX = "([^"]+)"/.exec(adapter)?.[1]);
  assert.notEqual(feld, "fotot",
    "Heisst das Feld wie das der Landingpage, laedt die Landingpage alle Bilder mit");
});

test("die Landingpage laedt aus config nur das Feld fotot", () => {
  assert.match(laden, /holeSammlung\("config", this\.holen, "fotot"\)/,
    "Die Landingpage holt die ganze Sammlung samt Bildern der Analyseseite");
  assert.match(laden, /mask\.fieldPaths=/, "holeSammlung kennt keine Maske mehr");
});

test("die Konfiguration in Heart ruehrt die Bilddokumente nicht ein", () => {
  assert.match(adapter, /startsWith\(ANALYSE_FOTOT_PRAEFIX\)/,
    "Die Bilder der Analyseseite landen im Konfigurationsobjekt");
});

test("ohne eigene Bilder zeigt die Analyseseite die der Landingpage", () => {
  assert.match(terapia, /const fotot = eigene\.length \? eigene : landing;/);
});

test("Heart zeichnet beide Bereiche, die Knoepfe tragen ihre Art", async () => {
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const grund = {
    status: "ready", loadedFrom: "network", sitzungen: [], abdeckung: [],
    kennzahlen: {}, trichter: [], herkunft: {}, verteilung: {},
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produkte: [{ id: "lf-acne", name: "LF ACNE", einzelpreis: 33 }],
    produktOffen: "lf-acne", produktStatus: "", berichte: {}
  };
  const html = renderLifeskin({
    ...grund,
    produktEntwurf: {
      landingFotot: ["data:image/jpeg;base64,a"],
      analyseFotot: ["data:image/jpeg;base64,x", "data:image/jpeg;base64,y"]
    }
  });
  assert.match(html, /Bilder fuer die Landingpage/);
  assert.match(html, /Bilder fuer die Analyseseite/);
  assert.equal((html.match(/data-action="lifeskin-landingbild-weg" data-index="\d" data-art="analyse"/g) || []).length, 2);
  assert.equal((html.match(/data-action="lifeskin-landingbild-weg" data-index="\d" data-art="landing"/g) || []).length, 1);
  assert.match(html, /data-crm-file-input="heartLifeskinAnalyseInput"/);
  assert.match(heart, /heartLifeskinAnalyseInput[\s\S]{0,160}lifeskinLandingbilder\(dateien, "analyse"\)/,
    "Die Wahl fuer die Analyseseite legt die Bilder bei der Landingpage ab");
  assert.match(ereignisse, /data-art/, "Die Knoepfe geben ihre Art nicht weiter");
});
