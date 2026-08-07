import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");

// Kommentare stehen im Weg: sie erklaeren gern genau die Werte, die hier
// geprueft werden ("bei 220ms zog die Farbe hinterher").
const ohneKommentare = (text = "") => String(text).replace(/\/\*[\s\S]*?\*\//g, " ").trim();
// Fuer die Regel-Suche: ohne Kommentare zieht kein Selektor Erklaerungstext
// mit, in dem zufaellig ein anderer Selektor vorkommt.
const css = html.replace(/\/\*[\s\S]*?\*\//g, " ");

const regelInhalt = (selektor) => {
  const start = html.indexOf(selektor);
  assert.notEqual(start, -1, `Regel fehlt: ${selektor}`);
  const auf = html.indexOf("{", start);
  const zu = html.indexOf("}", auf);
  return html.slice(auf + 1, zu);
};

// Alle Regeln, die auf die Pill-Zeile selbst zielen - Selektor samt Inhalt.
// Ihre Schattenkante (::after) haengt nur an ihr und belegt keinen Platz im
// Layout; die bleibt hier aussen vor.
const zeilenRegeln = () => {
  const treffer = [];
  const muster = /([^{}]*\.smart-header-tabs--main[^{}]*)\{([^}]*)\}/g;
  let match = muster.exec(css);
  while (match) {
    const selektor = match[1].trim();
    if (!selektor.includes("::")) treffer.push({ selektor, inhalt: match[2] });
    match = muster.exec(css);
  }
  assert.ok(treffer.length > 0, "keine Regel fuer die Pill-Zeile gefunden");
  return treffer;
};

// Der Kern der ganzen Loesung: die Zeile behaelt IMMER ihren Platz im Dokument.
// Nimmt eine Regel ihr die Hoehe, wandert alles darunter um sie hoch - und
// genau daraus entstand das ruckartige Springen beim Hochscrollen.
test("no rule ever takes the pill row out of the layout", () => {
  zeilenRegeln().forEach(({ selektor, inhalt }) => {
    assert.doesNotMatch(inhalt, /(^|[;\s])height\s*:/, `${selektor} setzt eine Hoehe`);
    assert.doesNotMatch(inhalt, /(^|[;\s])(margin|padding)-(top|bottom)\s*:/, `${selektor} aendert den Abstand`);
    assert.doesNotMatch(inhalt, /display\s*:\s*none/, `${selektor} schaltet die Zeile weg`);
  });
});

// Verschoben wird sie nur, wenn sie unter der Leiste klebt. Im normalen Fluss
// wuerde ein transform sie dem Scroll davonlaufen lassen.
test("the row is only moved while it is pinned under the top bar", () => {
  zeilenRegeln()
    .filter(({ inhalt }) => /transform\s*:/.test(inhalt))
    .forEach(({ selektor, inhalt }) => {
      assert.match(inhalt, /translateY/, `${selektor} verschiebt nicht senkrecht`);
      assert.match(
        selektor,
        /html\.smart-header-tabs-stuck\.smart-header-tabs-tucked/,
        `${selektor} verschiebt die Zeile auch ohne Kleben`
      );
    });
});

// Eingesteckt faehrt sie genau um ihre eigene Hoehe - dann liegt sie ganz hinter
// der Leiste und blitzt nirgends hervor.
test("the pinned row tucks away by exactly its own height", () => {
  const regel = regelInhalt("html.smart-header-tabs-stuck.smart-header-tabs-tucked .smart-header-tabs--main");
  assert.match(regel, /translateY\(calc\(-1 \* var\(--smart-header-tabs-row-height/);
  assert.match(regel, /pointer-events:\s*hidden|pointer-events:\s*none/, "und faengt dort keine Tipps mehr ab");
});

// Gefahren wird ueber transform, nicht ueber die Hoehe: Hoehe faerbt das Layout
// ein, transform nicht.
test("the row glides on transform alone, and only while it is gliding", () => {
  const regel = regelInhalt("html.smart-header-tabs-sliding .smart-header-tabs--main");
  assert.match(regel, /transition:\s*transform\s+\d+ms/, "der Uebergang gilt dem transform");
  assert.doesNotMatch(regel, /transition:[^;]*height/, "und nie der Hoehe");
});

// Die Schattenkante der Zeile wird nie ein- oder ausgeblendet: sie sitzt an der
// Zeile und faehrt mit demselben transform mit. Etwas, das gar nicht erst
// geschaltet wird, kann auch nicht nachziehen - und genau das tat sie vorher,
// als ein Timer am Ende der Fahrt sie wieder einschaltete.
test("the row's shadow rides along instead of being switched", () => {
  const geschaltet = [...css.matchAll(/([^{}]*\.smart-header-tabs--main::after[^{}]*)\{([^}]*)\}/g)]
    .filter(([, , inhalt]) => /(opacity|display|visibility|transition)\s*:/.test(inhalt))
    .map(([, selektor]) => ohneKommentare(selektor));
  assert.deepEqual(geschaltet, [], `keine Regel schaltet sie: ${geschaltet.join(" | ")}`);
});

// Solange die Zeile klebt, malt ihre eigene Kante - die unter der Leiste tritt
// zurueck, sonst waere der Schatten dort doppelt so dunkel.
test("the underline yields while the row is pinned", () => {
  assert.match(regelInhalt("html.smart-header-tabs-stuck .smart-header-underline"), /opacity:\s*0/);
});

// Der Wechsel zwischen beiden ist nur deshalb unsichtbar, weil es dieselbe
// Kante an derselben Stelle ist: gleicher Verlauf, gleiche Hoehe. Laufen die
// Werte auseinander, blitzt beim Loslassen ein Sprung auf.
test("both shadow edges are the very same 16px gradient", () => {
  const zeile = regelInhalt(".smart-header-tabs--main::after");
  const kante = regelInhalt(".smart-header-underline {");
  const verlauf = /background:\s*(linear-gradient\([^;]+\))/;
  const hoehe = /height:\s*(\S+?);/;
  assert.equal(zeile.match(verlauf)?.[1], kante.match(verlauf)?.[1], "derselbe Verlauf");
  assert.equal(zeile.match(hoehe)?.[1], kante.match(hoehe)?.[1], "dieselbe Hoehe");
});

// Die Pills muessen sofort antworten. Der Tipp faerbt sie schon beim Loslassen
// des Fingers um - zieht die Farbe danach lange nach, wirkt der Wechsel
// trotzdem verzoegert.
test("the pills answer a tap as quickly as the chevron does", () => {
  const grenze = 160;
  const dauern = (regel) => [...ohneKommentare(regel).matchAll(/(\d+)ms/g)].map((m) => Number(m[1]));
  dauern(regelInhalt(".smart-header-pill {")).forEach((ms) => {
    assert.ok(ms <= grenze, `die Pill braucht ${ms}ms, hoechstens ${grenze}ms`);
  });
  dauern(regelInhalt(".smart-header-collapse-btn {")).forEach((ms) => {
    assert.ok(ms <= grenze, `der Pfeil braucht ${ms}ms, hoechstens ${grenze}ms`);
  });
});

// Der Pfeil scrollt die Zeile oben hinter die Leiste - dafuer muss mindestens
// ihre Hoehe an Scroll-Weg da sein. Auf einer kurzen Seite gaebe es den sonst
// nicht und der Pfeil taete nichts.
test("a page with pills always has at least one row height of scroll room", () => {
  const regel = regelInhalt(".app-shell:has(.smart-header-tabs--main) > main.app-main-scroll");
  assert.match(regel, /min-height:\s*calc\(/);
  assert.match(regel, /--viewport-height/);
  assert.match(regel, /--smart-header-top-height/);
});
