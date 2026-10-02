// DREI BEREICHE IM LIFESKIN-TAB: SKINREACT · LIFESKIN · ACNE DUO
// (02.10., Wunsch Inhaber).
//
// Unter dem Kopf drei Chips - wie die Chips in "Faelle", kaum gerundet:
//
//   Skinreact  das bisherige Lifeskin (/lifeskin, Weg "")
//   Lifeskin   in der Mitte, beim Oeffnen immer gewaehlt - hier kommen
//              eigene Karten hin (noch leer)
//   Acne duo   der bisherige Lifeskin Shop (/lifeskinshop)
//
// Die Karten von Skinreact und Acne duo bleiben, wie sie waren - jeder
// Bereich traegt denselben Abstand wie .heart-lifeskin.
//
// Wischen wie in einer App: nach links wischen fuehrt nach rechts (Acne
// duo), nach rechts wischen nach links (Skinreact). Die Bereiche liegen
// fertig nebeneinander und gehen mit dem Finger mit; beim Loslassen
// gleitet der Nachbar herein. Ein Tipp auf einen Chip gleitet genauso.

import { escapeHtml } from "./heart-ui-utils.js";
import { mitFingerabdruck } from "./heart-morph.js";

export const BEREICHE = Object.freeze([
  Object.freeze({ id: "skinreact", label: "Skinreact" }),
  Object.freeze({ id: "lifeskin", label: "Lifeskin" }),
  Object.freeze({ id: "acneduo", label: "Acne duo" })
]);

export const STANDARD_BEREICH = "lifeskin";

export function bereichGueltig(id) {
  const wert = String(id || "").trim();
  return BEREICHE.some((b) => b.id === wert) ? wert : STANDARD_BEREICH;
}

// Welcher Weg (shared/lifeskin-weg.js) hinter einem Bereich steht.
// Lifeskin in der Mitte hat (noch) keinen: null.
const WEG_DES_BEREICHS = Object.freeze({ skinreact: "", acneduo: "lifeskinshop" });

export function wegDesBereichs(id) {
  const bereich = bereichGueltig(id);
  return Object.prototype.hasOwnProperty.call(WEG_DES_BEREICHS, bereich) ? WEG_DES_BEREICHS[bereich] : null;
}

// Umgekehrt: in welchem Bereich die Faelle eines Wegs stehen.
export function bereichDesWegs(weg) {
  return String(weg || "") === "lifeskinshop" ? "acneduo" : "skinreact";
}

// Der Nachbar in Wischrichtung: +1 ist der rechts daneben (nach links
// gewischt), -1 der links daneben. Am Rand: null.
export function bereichNachbar(aktiv, richtung) {
  const i = BEREICHE.findIndex((b) => b.id === bereichGueltig(aktiv));
  return BEREICHE[i + (richtung > 0 ? 1 : -1)]?.id || null;
}

// WELCHER CHIP UND WELCHER BEREICH GEWAEHLT AUSSIEHT, SAGT NICHT DAS
// MARKUP, SONDERN <html data-heart-bereich> (heart.css) - damit ein
// Wechsel beim Wischen sofort steht, ohne dass Heart neu zeichnet
// (bereichZeigen). data-gewaehlt ist der Stand im Zustand; er gilt, bis
// das Attribut gesetzt ist.
export function renderBereichChips(aktiv) {
  const gewaehlt = bereichGueltig(aktiv);
  return `<div class="heart-lifeskin-chips heart-lifeskin-chips--shop heart-bereich-chips" role="group" aria-label="Bereich" data-gewaehlt="${escapeHtml(gewaehlt)}">
    ${BEREICHE.map((b) => `<button type="button" class="heart-lifeskin-chip"
        data-action="lifeskin-bereich" data-wert="${escapeHtml(b.id)}">${escapeHtml(b.label)}</button>`).join("")}
  </div>`;
}

// Lifeskin in der Mitte: die eigenen Karten kommen noch.
function renderLifeskinMitte() {
  return `<section class="heart-lifeskin-block heart-bereich-leer">
      <h3 class="heart-lifeskin-block__titel">Lifeskin</h3>
      <p class="heart-lifeskin-leer">Hier kommen die eigenen Lifeskin-Karten hin.</p>
    </section>`;
}

// Die Uebersicht des Tabs: Chips, darunter die Bereiche.
//
// inhaltFuer(id) zeichnet Skinreact bzw. Acne duo - die Karten von
// /lifeskin bzw. /lifeskinshop, unveraendert (renderLifeskin).
//
// alle: ALLE DREI BEREICHE STEHEN FERTIG NEBENEINANDER (02.10.: "sehr
// schnell wischen"). Der gewaehlte steht im Fluss der Seite, die anderen
// liegen links und rechts daneben - unsichtbar, ohne Hoehe und ohne
// Layout, solange nicht gewischt wird (heart.css). Beim Wischen muss so
// nichts mehr aufgebaut werden: Der Nachbar ist sofort unter dem Finger,
// und nach dem Loslassen wechseln nur zwei Klassen. Gleiche Knoten
// bleiben beim Neuzeichnen dieselben (data-morph-key, heart-morph.js).
// Ohne alle steht nur der gewaehlte Bereich da (Laden, alte Aufrufe).
//
// Der Inhalt jedes Bereichs traegt einen Fingerabdruck: Hat er sich nicht
// geaendert, laesst Heart ihn beim Neuzeichnen ganz in Ruhe
// (mitFingerabdruck, heart-morph.js) - drei Bereiche kosten so kaum mehr
// als einer.
export function renderBereiche(aktiv, inhaltFuer, { alle = false } = {}) {
  const gewaehlt = bereichGueltig(aktiv);
  const bereiche = (alle ? BEREICHE : BEREICHE.filter((b) => b.id === gewaehlt)).map((b) => {
    const inhalt = b.id === STANDARD_BEREICH ? renderLifeskinMitte() : inhaltFuer(b.id);
    return `<div class="heart-bereich${b.id === gewaehlt ? " heart-bereich--an" : ""}" data-bereich="${escapeHtml(b.id)}"
        data-morph-key="bereich-${escapeHtml(b.id)}">${mitFingerabdruck(`<div class="heart-bereich__inhalt">${inhalt}</div>`)}</div>`;
  }).join("");
  return `${renderBereichChips(gewaehlt)}
    <div class="heart-bereiche"><div class="heart-bereiche__band">${bereiche}</div></div>`;
}

// ══ DAS WISCHEN ══════════════════════════════════════════════════════
//
// SCHNELL, UND ZWAR SO SCHNELL WIE DER FINGER (02.10.):
//
//   - Das Band mit den Bereichen geht dem Finger 1:1 nach.
//   - Beim Loslassen zaehlt der Schwung der letzten Bewegung: Ein kurzer,
//     schneller Wisch reicht. Der Rest der Strecke gleitet so schnell,
//     wie der Finger war (60-150 ms), und der Nachbar steht sofort da.
//   - Ein neuer Wisch waehrend des Gleitens wartet nicht: Das Gleiten
//     wird sofort beendet, der Wechsel gilt, und der neue Wisch beginnt.
//     So geht Skinreact -> Lifeskin -> Acne duo in einem Zug.
//
// Bewegt wird ueber CSS-Variablen auf <html> und nicht am Element selbst:
// Heart zeichnet beim Neuzeichnen die Attribute jedes Knotens nach dem
// Markup (heart-morph.js) - ein style am Band waere beim naechsten
// Live-Takt mitten im Wischen weg. <html> zeichnet niemand neu.
const ABSTAND_PX = 32;
const DAUER_TIPP_MS = 160;

function wenigerBewegung() {
  try { return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true; } catch { return false; }
}

function html() { return document.documentElement; }

// Wie weit ein Bereich vom naechsten entfernt liegt (Breite + Abstand).
function schrittweite() {
  const band = document.querySelector(".heart-bereiche__band");
  return (band?.getBoundingClientRect().width || globalThis.innerWidth || 400) + ABSTAND_PX;
}

function setze(x, dauer = 0) {
  const h = html();
  h.classList.add("heart-wischt");
  h.classList.toggle("heart-wischt--gleitet", dauer > 0);
  if (dauer > 0) h.style.setProperty("--heart-wisch-dauer", `${Math.round(dauer)}ms`);
  h.style.setProperty("--heart-wisch-x", `${Math.round(x)}px`);
}

// Die Nachbarn zeigen ihren Anfang dort, wo er nach dem Wechsel steht:
// Danach beginnt der neue Bereich oben (scrollTo 0), also steht sein
// Anfang um scrollY tiefer im Band.
function nachbarnAusrichten() {
  html().style.setProperty("--heart-wisch-oben", `${Math.max(0, Math.round(globalThis.scrollY || 0))}px`);
}

function loslassen() {
  const h = html();
  h.classList.remove("heart-wischt", "heart-wischt--gleitet");
  for (const v of ["--heart-wisch-x", "--heart-wisch-dauer", "--heart-wisch-oben"]) h.style.removeProperty(v);
}

// WAS ZU SEHEN IST UND WAS IM ZUSTAND STEHT.
//
// Der Wechsel beim Wischen setzt nur <html data-heart-bereich> - das Bild
// steht sofort, ohne dass Heart neu zeichnet. In den Zustand (und damit
// Weg, Live, Adresse) geht der neue Bereich erst, wenn eine Weile nicht
// mehr gewischt wird (MERKEN_NACH_MS): Neuzeichnen kostet auf dem Telefon
// mit hunderten Faellen eine Viertelsekunde, und in dieser Zeit nimmt die
// Seite keinen Finger an. So geht Wisch auf Wisch ohne zu warten.
const MERKEN_NACH_MS = 350;
let ausstehend = null;

export function bereichZeigen(id) {
  if (typeof document === "undefined") return;
  const wert = bereichGueltig(id);
  if (html().dataset.heartBereich !== wert) html().dataset.heartBereich = wert;
}

function gezeigt(stand) {
  return typeof document === "undefined" ? stand : bereichGueltig(html().dataset.heartBereich || stand);
}

// Nach jedem Zeichnen: das Bild auf den Zustand bringen - ausser ein
// Wechsel wartet noch darauf, gemerkt zu werden, oder es wird gerade
// gewischt.
export function bereichAbgleichen(stand) {
  if (ausstehend || gleiten || html().classList.contains("heart-wischt")) return;
  bereichZeigen(stand);
}

// Von aussen gesetzt (Menue, ein Fall wird geoeffnet): gilt sofort, ein
// noch nicht gemerkter Wisch verfaellt.
export function bereichFestlegen(id) {
  if (ausstehend) { globalThis.clearTimeout(ausstehend.uhr); ausstehend = null; }
  bereichZeigen(id);
}

function merken(wechseln, ziel) {
  if (ausstehend) globalThis.clearTimeout(ausstehend.uhr);
  ausstehend = { ziel, wechseln, uhr: globalThis.setTimeout(merkenJetzt, MERKEN_NACH_MS) };
}

function merkenJetzt() {
  const a = ausstehend;
  if (!a) return;
  // Wird gerade gewischt: spaeter.
  if (gleiten || html().classList.contains("heart-wischt")) { a.uhr = globalThis.setTimeout(merkenJetzt, MERKEN_NACH_MS); return; }
  ausstehend = null;
  a.wechseln(a.ziel);
}

// Das laufende Gleiten - und was an seinem Ende passiert.
let gleiten = null;

function gleitenBeenden() {
  const g = gleiten;
  if (!g) return;
  gleiten = null;
  globalThis.clearTimeout(g.uhr);
  g.ende();
}

function gleiteZu(x, dauer, ende) {
  gleitenBeenden();
  setze(x, dauer);
  const g = { ende, uhr: 0 };
  g.uhr = globalThis.setTimeout(() => { if (gleiten === g) gleitenBeenden(); }, dauer + 16);
  gleiten = g;
}

// Der Wechsel im Bild: Bereich zeigen, Band zuruecksetzen, nach oben -
// in einem Zug, also in einem Bild. Gemerkt wird spaeter (merken).
function tauschen(wechseln, ziel) {
  const oben = (globalThis.scrollY || 0) > 0;
  bereichZeigen(ziel);
  loslassen();
  if (oben) globalThis.scrollTo?.(0, 0);
  merken(wechseln, ziel);
}

function nachbarDa(id) {
  return Boolean(document.querySelector(`.heart-bereich[data-bereich="${id}"]`))
    && gezeigt("") !== id;
}

// Ein Tipp auf einen Chip: dieselbe Bewegung wie ein Wisch.
export function bereichSpringen(von, zu, wechseln) {
  const ziel = bereichGueltig(zu);
  if (typeof document === "undefined") { wechseln(ziel); return; }
  gleitenBeenden();
  const a = BEREICHE.findIndex((b) => b.id === gezeigt(von));
  const z = BEREICHE.findIndex((b) => b.id === ziel);
  if (a === z) return;
  if (wenigerBewegung() || !nachbarDa(ziel)) {
    if (document.querySelector(`.heart-bereich[data-bereich="${ziel}"]`)) tauschen(wechseln, ziel);
    else { if (ausstehend) { globalThis.clearTimeout(ausstehend.uhr); ausstehend = null; } wechseln(ziel); }
    return;
  }
  nachbarnAusrichten();
  setze(0);
  gleiteZu(-(z - a) * schrittweite(), DAUER_TIPP_MS, () => tauschen(wechseln, ziel));
}

// Ein Wischen, das in einem eigenen waagrechten Scrollbereich beginnt
// (Chipreihen, Bildleisten), gehoert diesem und nicht dem Bereich. Felder
// und Regler ebenso.
function gehoertWoandersHin(ziel, flaeche) {
  if (ziel?.closest?.("input, textarea, select, [contenteditable='true'], [data-kein-wischen]")) return true;
  for (let e = ziel; e && e !== flaeche; e = e.parentElement) {
    if (e.scrollWidth > e.clientWidth + 1) {
      const x = globalThis.getComputedStyle?.(e)?.overflowX || "";
      if (x === "auto" || x === "scroll") return true;
    }
  }
  return false;
}

// lesen(): der gewaehlte Bereich, oder "" wenn nicht gewischt werden darf
// (anderer Tab, offene Akte). wechseln(id): den Bereich setzen.
export function bindBereichWischen({ root, lesen, wechseln } = {}) {
  if (!root || typeof document === "undefined") return () => {};
  let zug = null;

  const start = (e) => {
    zug = null;
    if (e.touches.length !== 1) return;
    // Ueberall unter dem Kopf - auch auf der leeren Flaeche unter einem
    // kurzen Bereich (Lifeskin in der Mitte), nicht nur auf seinem Inhalt.
    // Der Kopf von Heart gehoert nicht dazu.
    const flaeche = e.target?.closest?.(".heart-main-shell");
    if (!flaeche || !root.contains(flaeche) || e.target.closest(".heart-topbar")
      || !flaeche.querySelector(".heart-bereich")) return;
    if (gehoertWoandersHin(e.target, flaeche)) return;
    // Gleitet noch etwas: sofort fertig machen - der neue Wisch beginnt
    // im neuen Bereich.
    gleitenBeenden();
    const stand = lesen?.();
    if (!stand) return;
    const aktiv = gezeigt(stand);
    const t = e.touches[0];
    zug = { x: t.clientX, y: t.clientY, aktiv, richtung: "", dx: 0, spur: [{ x: t.clientX, zeit: e.timeStamp || Date.now() }] };
  };

  const bewegen = (e) => {
    if (!zug || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - zug.x;
    const dy = t.clientY - zug.y;
    if (!zug.richtung) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      zug.richtung = Math.abs(dx) > Math.abs(dy) ? "waagrecht" : "senkrecht";
      if (zug.richtung === "waagrecht") nachbarnAusrichten();
    }
    if (zug.richtung !== "waagrecht") return;
    if (e.cancelable) e.preventDefault();
    zug.dx = dx;
    const zeit = e.timeStamp || Date.now();
    zug.spur.push({ x: t.clientX, zeit });
    while (zug.spur.length > 2 && zeit - zug.spur[0].zeit > 90) zug.spur.shift();
    // Am Rand (links Skinreact, rechts Acne duo) gibt der Inhalt nur zaeh
    // nach - man merkt, dass es dort nicht weitergeht.
    const ziel = bereichNachbar(zug.aktiv, dx < 0 ? 1 : -1);
    setze(ziel && nachbarDa(ziel) ? dx : dx * 0.25);
  };

  const ende = (e) => {
    const z = zug;
    zug = null;
    if (!z || z.richtung !== "waagrecht") return;
    // Der Schwung der letzten ~90 ms, in Pixel je Millisekunde.
    const erste = z.spur[0];
    const letzte = z.spur[z.spur.length - 1];
    const tempo = (letzte.x - erste.x) / Math.max(1, (letzte.zeit - erste.zeit) || ((e?.timeStamp || Date.now()) - erste.zeit));
    const richtung = z.dx < 0 ? 1 : -1;
    const ziel = bereichNachbar(z.aktiv, richtung);
    const weite = schrittweite();
    const schwung = Math.abs(tempo) > 0.25 && Math.sign(tempo) === Math.sign(z.dx) && Math.abs(z.dx) > 12;
    const weitGenug = Math.abs(z.dx) > weite * 0.2;
    if (!ziel || !(schwung || weitGenug)) {
      gleiteZu(0, 140, loslassen);
      return;
    }
    if (!nachbarDa(ziel)) {
      if (document.querySelector(`.heart-bereich[data-bereich="${ziel}"]`)) tauschen(wechseln, ziel);
      else { loslassen(); wechseln(ziel); }
      return;
    }
    // Der Rest der Strecke so schnell, wie der Finger war.
    const rest = weite - Math.abs(z.dx);
    const dauer = Math.min(150, Math.max(60, rest / Math.max(Math.abs(tempo), 1.8)));
    gleiteZu(-richtung * weite, dauer, () => tauschen(wechseln, ziel));
  };

  const abbruch = () => {
    const z = zug;
    zug = null;
    if (z?.richtung === "waagrecht") gleiteZu(0, 140, loslassen);
  };

  root.addEventListener("touchstart", start, { passive: true });
  root.addEventListener("touchmove", bewegen, { passive: false });
  root.addEventListener("touchend", ende, { passive: true });
  root.addEventListener("touchcancel", abbruch, { passive: true });
  return () => {
    root.removeEventListener("touchstart", start);
    root.removeEventListener("touchmove", bewegen);
    root.removeEventListener("touchend", ende);
    root.removeEventListener("touchcancel", abbruch);
  };
}
