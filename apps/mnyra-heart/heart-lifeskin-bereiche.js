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
// Die Karten von Skinreact und Acne duo bleiben, wie sie waren - der
// Bereich darunter traegt denselben Abstand wie .heart-lifeskin.
//
// Wischen wie in einer App: nach links wischen fuehrt nach rechts (Acne
// duo), nach rechts wischen nach links (Skinreact). Der Inhalt geht mit
// dem Finger mit, gleitet beim Loslassen hinaus, und der neue Bereich
// gleitet von der anderen Seite herein. Ein Tipp auf einen Chip gleitet
// genauso.

import { escapeHtml } from "./heart-ui-utils.js";

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

export function renderBereichChips(aktiv) {
  const gewaehlt = bereichGueltig(aktiv);
  return `<div class="heart-lifeskin-chips heart-lifeskin-chips--shop heart-bereich-chips" role="tablist" aria-label="Bereich">
    ${BEREICHE.map((b) => `<button type="button" role="tab" class="heart-lifeskin-chip${b.id === gewaehlt ? " heart-lifeskin-chip--an" : ""}"
        data-action="lifeskin-bereich" data-wert="${escapeHtml(b.id)}" aria-selected="${b.id === gewaehlt}">${escapeHtml(b.label)}</button>`).join("")}
  </div>`;
}

// Lifeskin in der Mitte: die eigenen Karten kommen noch.
function renderLifeskinMitte() {
  return `<section class="heart-lifeskin-block heart-bereich-leer">
      <h3 class="heart-lifeskin-block__titel">Lifeskin</h3>
      <p class="heart-lifeskin-leer">Hier kommen die eigenen Lifeskin-Karten hin.</p>
    </section>`;
}

// Die Uebersicht des Tabs: Chips, darunter der gewaehlte Bereich.
// wegInhalt zeichnet Skinreact bzw. Acne duo - die Karten von /lifeskin
// bzw. /lifeskinshop, unveraendert (renderLifeskin).
export function renderBereiche(aktiv, wegInhalt) {
  const gewaehlt = bereichGueltig(aktiv);
  const inhalt = gewaehlt === STANDARD_BEREICH ? renderLifeskinMitte() : wegInhalt();
  return `${renderBereichChips(gewaehlt)}
    <div class="heart-bereich" data-bereich="${escapeHtml(gewaehlt)}">${inhalt}</div>`;
}

// ══ DAS WISCHEN ══════════════════════════════════════════════════════
//
// Bewegt wird ueber eine CSS-Variable auf <html> und nicht am Element
// selbst: Heart zeichnet beim Neuzeichnen die Attribute jedes Knotens
// nach dem Markup (heart-morph.js) - ein style am Bereich waere beim
// naechsten Live-Takt mitten im Wischen weg. <html> zeichnet niemand neu.
const DAUER_MS = 200;

function wenigerBewegung() {
  try { return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true; } catch { return false; }
}

function setze(x, gleitet) {
  const html = document.documentElement;
  html.classList.add("heart-wischt");
  html.classList.toggle("heart-wischt--gleitet", gleitet);
  html.style.setProperty("--heart-wisch-x", `${Math.round(x)}px`);
}

function loslassen() {
  const html = document.documentElement;
  html.classList.remove("heart-wischt", "heart-wischt--gleitet");
  html.style.removeProperty("--heart-wisch-x");
}

const warte = (ms) => new Promise((fertig) => globalThis.setTimeout(fertig, ms));
const naechstesBild = () => new Promise((fertig) => globalThis.requestAnimationFrame(() => fertig()));

let laeuft = false;

// Der Wechsel mit Bewegung: hinaus in Wischrichtung, wechseln, von der
// anderen Seite herein. richtung +1: der Inhalt geht nach links.
export async function bereichGleiten(richtung, wechseln) {
  if (typeof document === "undefined" || laeuft || wenigerBewegung()) {
    wechseln();
    return;
  }
  laeuft = true;
  try {
    const breite = globalThis.innerWidth || 400;
    setze(-richtung * breite, true);
    await warte(DAUER_MS);
    setze(richtung * breite, false);
    wechseln();
    // Steht man weit unten im Lifeskin-Bereich, beginnt der neue oben.
    const chips = document.querySelector(".heart-bereich-chips");
    const kopf = document.querySelector(".heart-topbar")?.getBoundingClientRect().bottom || 0;
    if (chips && chips.getBoundingClientRect().top < kopf) globalThis.scrollTo?.(0, 0);
    await naechstesBild();
    await naechstesBild();
    setze(0, true);
    await warte(DAUER_MS);
  } finally {
    loslassen();
    laeuft = false;
  }
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

  const zurueck = async () => {
    laeuft = true;
    setze(0, true);
    await warte(DAUER_MS);
    loslassen();
    laeuft = false;
  };

  const start = (e) => {
    zug = null;
    if (laeuft || e.touches.length !== 1) return;
    // Ueberall unter dem Kopf - auch auf der leeren Flaeche unter einem
    // kurzen Bereich (Lifeskin in der Mitte), nicht nur auf seinem Inhalt.
    // Der Kopf von Heart gehoert nicht dazu.
    const flaeche = e.target?.closest?.(".heart-main-shell");
    if (!flaeche || !root.contains(flaeche) || e.target.closest(".heart-topbar")
      || !flaeche.querySelector(".heart-bereich")) return;
    const aktiv = lesen?.();
    if (!aktiv || gehoertWoandersHin(e.target, flaeche)) return;
    const t = e.touches[0];
    zug = { x: t.clientX, y: t.clientY, zeit: Date.now(), aktiv, richtung: "", dx: 0 };
  };

  const bewegen = (e) => {
    if (!zug || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - zug.x;
    const dy = t.clientY - zug.y;
    if (!zug.richtung) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      zug.richtung = Math.abs(dx) > Math.abs(dy) * 1.2 ? "waagrecht" : "senkrecht";
    }
    if (zug.richtung !== "waagrecht") return;
    if (e.cancelable) e.preventDefault();
    zug.dx = dx;
    // Am Rand (links Skinreact, rechts Acne duo) gibt der Inhalt nur zaeh
    // nach - man merkt, dass es dort nicht weitergeht.
    const ziel = bereichNachbar(zug.aktiv, dx < 0 ? 1 : -1);
    setze(ziel ? dx : dx * 0.25, false);
  };

  const ende = () => {
    const z = zug;
    zug = null;
    if (!z || z.richtung !== "waagrecht") return;
    const richtung = z.dx < 0 ? 1 : -1;
    const ziel = bereichNachbar(z.aktiv, richtung);
    const breite = globalThis.innerWidth || 400;
    const tempo = Math.abs(z.dx) / Math.max(1, Date.now() - z.zeit);
    const weitGenug = Math.abs(z.dx) > breite * 0.22 || (Math.abs(z.dx) > 40 && tempo > 0.45);
    if (!ziel || !weitGenug) { zurueck(); return; }
    // Vom Finger aus weiter hinaus, nicht noch einmal von der Mitte.
    bereichGleiten(richtung, () => wechseln?.(ziel));
  };

  const abbruch = () => {
    const z = zug;
    zug = null;
    if (z?.richtung === "waagrecht") zurueck();
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
