import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");

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
  let match = muster.exec(html);
  while (match) {
    const selektor = match[1].trim();
    if (!selektor.includes("::")) treffer.push({ selektor, inhalt: match[2] });
    match = muster.exec(html);
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

// Der Pfeil scrollt die Zeile oben hinter die Leiste - dafuer muss mindestens
// ihre Hoehe an Scroll-Weg da sein. Auf einer kurzen Seite gaebe es den sonst
// nicht und der Pfeil taete nichts.
test("a page with pills always has at least one row height of scroll room", () => {
  const regel = regelInhalt(".app-shell:has(.smart-header-tabs--main) > main.app-main-scroll");
  assert.match(regel, /min-height:\s*calc\(/);
  assert.match(regel, /--viewport-height/);
  assert.match(regel, /--smart-header-top-height/);
});
