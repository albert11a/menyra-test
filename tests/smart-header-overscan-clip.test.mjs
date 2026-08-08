import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../apps/menyra-social/index.html", import.meta.url), "utf8");
const shell = readFileSync(new URL("../apps/menyra-social/core/ui/main-shell-render-utils.js", import.meta.url), "utf8");

// Kommentare erklaeren hier genau die Werte, die geprueft werden ("HIER STAND
// DER WAAGERECHTE SCHNITT ... overflow-x: clip") - sie muessen raus, sonst
// findet die Suche den alten Stand im Fliesstext wieder.
const css = html.replace(/\/\*[\s\S]*?\*\//g, " ");

const regeln = (selektor) => {
  const treffer = [];
  const muster = new RegExp(`([^{}]*)\\{([^}]*)\\}`, "g");
  let match = muster.exec(css);
  while (match) {
    const sel = match[1].trim();
    if (sel.split(",").some((teil) => teil.trim() === selektor)) {
      treffer.push({ selektor: sel, inhalt: match[2] });
    }
    match = muster.exec(css);
  }
  return treffer;
};

// Der Kern: die Kopfzeile malt weit ueber ihre sichtbare Oberkante hinaus
// (--smart-header-overscan an der Box, dazu .smart-header-shell::before), und
// genau diese Flaeche deckt den Streifen, den Chrome iOS beim Ausfahren seiner
// Adressleiste freigibt. Schneidet ein Vorfahr sie ab, ist der ganze Aufwand
// wirkungslos - und zwar unsichtbar, weil am Schreibtisch (Chromium, Firefox)
// alles richtig aussieht.
//
// WebKit schneidet bei "overflow-x: clip" auf BEIDEN Achsen. Das begleitende
// "overflow-y: visible" hilft dort nicht, es wird schlicht nicht eingehalten
// (Apple Developer Forums #745729, offen). Auf iOS gibt es keine andere Engine.
//
// #app ist der einzige Vorfahr der Kopfzeile, der das je hatte. Deshalb darf
// dort NICHTS mehr schneiden.
test("no ancestor of the smart header clips - the overscan has to reach the strip", () => {
  const appRegeln = regeln("#app");
  assert.ok(appRegeln.length > 0, "keine Regel fuer #app gefunden");
  appRegeln.forEach(({ selektor, inhalt }) => {
    assert.doesNotMatch(
      inhalt,
      /(^|[;\s])overflow(-x|-y)?\s*:\s*(clip|hidden|auto|scroll)/,
      `${selektor} schneidet - der Ueberstand der Kopfzeile geht auf iOS verloren`
    );
  });
});

// Der waagerechte Schnitt ist damit nicht abgeschafft, sondern verschoben: er
// gehoert unter die Kopfzeile, dorthin, wo das Breite ueberhaupt steht.
// Faellt er ersatzlos weg, laesst sich die Seite seitlich ziehen.
test("the horizontal clip still exists - one level below the header", () => {
  const mainRegeln = regeln(".app-main-scroll");
  const schneidend = mainRegeln.filter(({ inhalt }) => /overflow-x\s*:\s*clip/.test(inhalt));
  assert.equal(
    schneidend.length,
    1,
    "genau eine Regel muss .app-main-scroll waagerecht schneiden"
  );
});

// "overflow-x: hidden" waere hier die naheliegende, aber falsche Abkuerzung:
// zusammen mit einem sichtbaren overflow-y rechnet die andere Achse auf "auto",
// aus dem Element wird ein eigener Scroll-Container - und ein sticky Kind
// klebte dann an ihm statt am Bild.
test("the clip is never downgraded to hidden", () => {
  regeln(".app-main-scroll").forEach(({ selektor, inhalt }) => {
    assert.doesNotMatch(
      inhalt,
      /(^|[;\s])overflow(-x|-y)?\s*:\s*hidden/,
      `${selektor} macht aus dem Schnitt einen Scroll-Container`
    );
  });
});

// Der Schnitt trägt nur, solange die Kopfzeile wirklich ausserhalb von <main>
// steht. Rutscht sie beim Umbauen hinein, ist sie wieder in der schneidenden
// Box - derselbe Fehler, nur an anderer Stelle.
test("the smart header is rendered outside of main", () => {
  const mainBlock = shell.slice(shell.indexOf("<main"), shell.indexOf("</main>"));
  assert.ok(mainBlock.length > 0, "kein <main> im Shell-Markup gefunden");
  assert.doesNotMatch(
    mainBlock,
    /shellHeaderHtml/,
    "die Kopfzeile wird in <main> gerendert und damit wieder geschnitten"
  );
  assert.match(
    shell,
    /\$\{shellHeaderHtml\}[\s\S]*<main/,
    "die Kopfzeile muss vor <main> stehen"
  );
});
