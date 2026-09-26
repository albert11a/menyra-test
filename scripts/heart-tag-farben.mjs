// DER FARBSATZ "TAG" FUER HEART - erzeugt aus den Farben der Nacht.
//
//   node scripts/heart-tag-farben.mjs
//
// Liest apps/mnyra-heart/heart.css, gibt JEDE Regel mit einer Farbangabe in
// derselben Reihenfolge noch einmal aus - mit vorangestelltem
// :where(html[data-heart-theme="tag"]), das nicht mitzaehlt - und ersetzt
// damit den Teil nach "/* ===== TAG (erzeugt) =====" (die Farbwerte von Hand
// oben darin bleiben stehen). Feste dunkle Farben werden gespiegelt
// (Helligkeit umgedreht, Toenung behalten), alles andere bleibt: So gilt im
// hellen Satz dieselbe Reihenfolge wie im dunklen, und eine Sonderregel (der
// gruene Hauptknopf) gewinnt weiter gegen die allgemeine davor.
//
// Nach jeder Farbaenderung in heart.css neu laufen lassen.

import { readFileSync, writeFileSync } from "node:fs";

const DATEI = new URL("../apps/mnyra-heart/heart.css", import.meta.url);
const MARKE = "/* ===== TAG (erzeugt) =====";
const HAND_ENDE = "--heart-shadow: 0 14px 36px rgba(24, 24, 27, 0.08);\n}\n";

const ganz = readFileSync(DATEI, "utf8");
const [vorne, hinten] = ganz.split(MARKE);
if (hinten === undefined) throw new Error(`Marke fehlt in heart.css: ${MARKE}`);
const hand = hinten.slice(0, hinten.indexOf(HAND_ENDE) + HAND_ENDE.length);
const quelle = vorne.replace(/\/\*[\s\S]*?\*\//g, "");

// Regeln mit ihrem @media/@supports-Kontext, in Reihenfolge.
function regeln(text, kontext = "") {
  const raus = [];
  let i = 0;
  while (i < text.length) {
    const auf = text.indexOf("{", i);
    if (auf < 0) break;
    const kopf = text.slice(i, auf).trim();
    let tiefe = 1;
    let j = auf + 1;
    while (j < text.length && tiefe) {
      if (text[j] === "{") tiefe += 1;
      else if (text[j] === "}") tiefe -= 1;
      j += 1;
    }
    const koerper = text.slice(auf + 1, j - 1);
    if (kopf.startsWith("@media") || kopf.startsWith("@supports")) raus.push(...regeln(koerper, kopf));
    else if (!kopf.startsWith("@")) raus.push({ kontext, kopf, koerper });
    i = j;
  }
  return raus;
}

const FARBE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;

function lies(f) {
  if (f.startsWith("#")) {
    let h = f.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16),
      h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  const z = f.slice(f.indexOf("(") + 1, -1).split(",").map((x) => parseFloat(x));
  return [z[0], z[1], z[2], z.length > 3 ? z[3] : 1];
}

function schreib(r, g, b, a) {
  const k = (x) => Math.max(0, Math.min(255, Math.round(x)));
  if (a >= 0.999) return `#${[r, g, b].map((x) => k(x).toString(16).padStart(2, "0")).join("")}`;
  return `rgba(${k(r)}, ${k(g)}, ${k(b)}, ${Number(a.toFixed(3))})`;
}

// HLS wie Pythons colorsys - damit das Ergebnis dem ersten Lauf gleicht.
function zuHls(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, l, 0];
  const d = max - min;
  const s = l <= 0.5 ? d / (max + min) : d / (2 - max - min);
  const rc = (max - r) / d;
  const gc = (max - g) / d;
  const bc = (max - b) / d;
  let h = r === max ? bc - gc : g === max ? 2 + rc - bc : 4 + gc - rc;
  h = ((h / 6) % 1 + 1) % 1;
  return [h, l, s];
}

function vonHls(h, l, s) {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s;
  const m1 = 2 * l - m2;
  const v = (hue) => {
    hue = ((hue % 1) + 1) % 1;
    if (hue < 1 / 6) return m1 + (m2 - m1) * hue * 6;
    if (hue < 0.5) return m2;
    if (hue < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - hue) * 6;
    return m1;
  };
  return [v(h + 1 / 3) * 255, v(h) * 255, v(h - 1 / 3) * 255];
}

function flaeche(f) {
  const [r, g, b, a] = lies(f);
  const [h, l, s] = zuHls(r, g, b);
  if (l > 0.45) return l > 0.85 && a < 1 ? schreib(0, 0, 0, Math.min(1, a * 1.15)) : null;
  if (a < 1 && l < 0.2 && s < 0.2) return null;
  const [l2, s2] = s < 0.18 ? [0.985 - l * 0.6, s * 0.5] : [0.93 - l * 0.45, Math.min(1, s * 0.85)];
  const [r2, g2, b2] = vonHls(h, l2, s2);
  return schreib(r2, g2, b2, a);
}

function rand(f) {
  const [r, g, b, a] = lies(f);
  const [h, l, s] = zuHls(r, g, b);
  if (l > 0.85 && a < 1) return schreib(0, 0, 0, Math.min(1, a * 1.1));
  if (l < 0.3 && s < 0.2) {
    const [r2, g2, b2] = vonHls(h, Math.max(0.72, 0.985 - l * 0.6 - 0.08), s);
    return schreib(r2, g2, b2, a);
  }
  return null;
}

function schatten(f) {
  const [r, g, b, a] = lies(f);
  const [, l] = zuHls(r, g, b);
  return l < 0.2 && a < 1 ? schreib(0, 0, 0, Math.round(a * 0.3 * 1000) / 1000) : null;
}

function schrift(f) {
  const [r, g, b, a] = lies(f);
  const [, l, s] = zuHls(r, g, b);
  return l > 0.86 && s < 0.3 ? schreib(22, 22, 24, a) : null;
}

// Was auf einem Foto, einem Video oder einer Markenfarbe steht, bleibt.
const BLEIBT = /fall__anzahl|fall__geraet|medium__(art|aus|views|oeffnen)|rasti-bild i|landingbild__|dest-picker|#pickerPanel|#confirmLocationBtn|shell__overlay|modal__backdrop|medium-editor__buehne|knopf--wa\b|knopf--viber|wataste|heart-live__punkt|heart-live__halt|button--primary|nav-link--active \.heart-nav-link__icon|befund__knopf--haupt|fall-knopf--haupt|lifeskin-knopf--stark|pill--paskanim|knopf--bereit-an|pill--bereit|heart-tv__knopf|faelle-wahl__taste--frage|lifeskin-fall--an \.heart-lifeskin-fall__wahl|schritte__zeile--an|pfad__balken|stufe__balken|vzeile__spur|heart-loader-spinner/;
const FARB_EIGENSCHAFT = /^(background(-color|-image)?|border(-[a-z]+)*|outline(-color)?|box-shadow|color|fill|stroke|caret-color|text-decoration-color|accent-color)$/;

function ersetze(wert, fn) {
  let geaendert = false;
  const raus = wert.replace(FARBE, (m) => {
    const neu = fn(m);
    if (neu === null) return m;
    geaendert = true;
    return neu;
  });
  return geaendert ? raus : null;
}

function praefix(sel) {
  const s = sel.trim();
  if (s === "html") return 'html:where([data-heart-theme="tag"])';
  if (s.startsWith("html ") || s.startsWith("html.")) return `html:where([data-heart-theme="tag"])${s.slice(4)}`;
  return `:where(html[data-heart-theme="tag"]) ${s}`;
}

function farbigerGrund(koerper) {
  const grund = (koerper.match(/background(-color)?\s*:([^;]*)/) || [])[2] || "";
  if (/var\(--heart-(accent|success|danger)/.test(grund)) return true;
  return (grund.match(FARBE) || []).some((f) => {
    const [r, g, b, a] = lies(f);
    const [, l, s] = zuHls(r, g, b);
    return s > 0.35 && l > 0.2 && l < 0.75 && a > 0.5;
  });
}

const teile = [];
let offen = null;
let puffer = [];
let uebersetzt = 0;
const schliessen = () => {
  if (!puffer.length) return;
  const inhalt = puffer.join("\n\n");
  teile.push(offen ? `${offen} {\n${inhalt}\n}` : inhalt);
  puffer = [];
};

for (const { kontext, kopf, koerper } of regeln(quelle)) {
  if (!kopf || kopf.startsWith(":root")) continue;
  const bleibt = BLEIBT.test(kopf);
  const zeilen = [];
  for (const dekl of koerper.split(";")) {
    const doppelpunkt = dekl.indexOf(":");
    if (doppelpunkt < 0) continue;
    const eigenschaft = dekl.slice(0, doppelpunkt).trim().toLowerCase();
    const wert = dekl.slice(doppelpunkt + 1).split(/\s+/).filter(Boolean).join(" ");
    if (!FARB_EIGENSCHAFT.test(eigenschaft) || !wert) continue;
    let neu = null;
    if (!bleibt && FARBE.test(wert)) {
      FARBE.lastIndex = 0;
      if (/^background/.test(eigenschaft)) neu = ersetze(wert, flaeche);
      else if (/^(border|outline)/.test(eigenschaft)) neu = ersetze(wert, rand);
      else if (eigenschaft === "box-shadow") neu = ersetze(wert, schatten);
      else if (["color", "fill", "stroke", "caret-color"].includes(eigenschaft)) neu = farbigerGrund(koerper) ? null : ersetze(wert, schrift);
    }
    FARBE.lastIndex = 0;
    if (neu) uebersetzt += 1;
    zeilen.push(`  ${eigenschaft}: ${neu || wert};`);
  }
  if (!zeilen.length) continue;
  if (kontext !== offen) { schliessen(); offen = kontext; }
  const selektoren = kopf.split(",").filter((x) => x.trim()).map(praefix).join(",\n");
  puffer.push(`${selektoren} {\n${zeilen.join("\n")}\n}`);
}
schliessen();

const erzeugt = `/* ${uebersetzt} Farbangaben uebersetzt */\n${teile.join("\n\n")}`.replaceAll("#fbfbfb", "var(--heart-bg)");
writeFileSync(DATEI, `${vorne}${MARKE}${hand}\n${erzeugt}\n`);
console.log(`${uebersetzt} Farbangaben uebersetzt, ${teile.length} Bloecke geschrieben.`);
