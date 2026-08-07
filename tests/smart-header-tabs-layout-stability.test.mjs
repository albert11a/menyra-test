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
test("the row is only ever moved by exactly its own height", () => {
  const verschiebend = zeilenRegeln().filter(({ inhalt }) => /transform\s*:/.test(inhalt));
  assert.ok(verschiebend.length > 0, "keine Regel verschiebt die Zeile");
  verschiebend.forEach(({ selektor, inhalt }) => {
    // Genau eine Strecke, und die endet hinter der Leiste. Alles andere waere
    // eine Bewegung, die dem Scroll davonlaeuft.
    assert.match(
      inhalt,
      /transform:\s*translateY\(calc\(-1 \* var\(--smart-header-tabs-row-height/,
      `${selektor} verschiebt anders als um eine Zeilenhoehe nach oben`
    );
    assert.doesNotMatch(inhalt, /translateY\(calc\(-1 \* var\(--smart-header-tabs-row-height[^)]*\)\s*\*/,
      `${selektor} rechnet die Zeilenhoehe hoch`);
    // Genau ein Zustand darf das: die geheftete Zeile auf ihrem Weg hinter die
    // Leiste. Im normalen Fluss wuerde ein transform dem Scroll davonlaufen.
    assert.match(
      selektor,
      /html\.smart-header-tabs-stuck\.smart-header-tabs-tucked/,
      `${selektor} verschiebt die Zeile in einem zweiten Zustand`
    );
  });
});

// Der Pfeil bewegt nur die Zeile. Nichts an ihr darf davon abhaengen, wie hoch
// das Bild gerade ist - auf iOS aendert sich das beim Scrollen laufend, weil
// die Adressleiste einfaehrt. Eine Mindesthoehe am Hauptbereich liess das
// Dokument dabei wachsen, und die Seite sprang unter dem Finger.
test("nothing about the pill row makes the document height follow the viewport", () => {
  const treffer = [...css.matchAll(/([^{}]*)\{([^}]*)\}/g)]
    .filter(([, selektor, inhalt]) =>
      /smart-header-tabs--main/.test(selektor)
      && /min-height|max-height|height\s*:/.test(inhalt)
      && /--viewport-height|vh\b|dvh|lvh/.test(inhalt))
    .map(([, selektor]) => selektor.trim());
  assert.deepEqual(treffer, [], `haengt an der Bildhoehe: ${treffer.join(" | ")}`);
});

// Eingesteckt faehrt sie genau um ihre eigene Hoehe - dann liegt sie ganz hinter
// der Leiste und blitzt nirgends hervor.
test("the tucked row hides behind the top bar by exactly its own height", () => {
  const regel = regelInhalt("html.smart-header-tabs-stuck.smart-header-tabs-tucked .smart-header-tabs--main");
  assert.match(regel, /translateY\(calc\(-1 \* var\(--smart-header-tabs-row-height/);
  assert.match(regel, /pointer-events:\s*none/, "und faengt dort keine Tipps mehr ab");
});

// Gefahren wird ueber transform, nicht ueber die Hoehe: Hoehe faerbt das Layout
// ein, transform nicht.
test("the row glides on transform alone, and only while it is gliding", () => {
  const regel = regelInhalt("html.smart-header-tabs-sliding .smart-header-tabs--main");
  assert.match(regel, /transition:\s*transform\s+\d+ms/, "der Uebergang gilt dem transform");
  assert.doesNotMatch(regel, /transition:[^;]*height/, "und nie der Hoehe");
});

// Die Schattenkante der Zeile wird nie geschaltet: sie sitzt an der Zeile und
// faehrt mit demselben transform mit. Was gar nicht erst geschaltet wird, kann
// auch nicht nachziehen - und ein Deckkraft-Uebergang auf einem Pseudo-Element
// lief auf WebKit dem transform sichtbar hinterher.
test("the row's shadow is never switched, it just rides along", () => {
  const geschaltet = [...css.matchAll(/([^{}]*\.smart-header-tabs--main::after[^{}]*)\{([^}]*)\}/g)]
    .filter(([, , inhalt]) => /(opacity|display|visibility|transition)\s*:/.test(inhalt))
    .map(([, selektor]) => ohneKommentare(selektor));
  assert.deepEqual(geschaltet, [], `keine Regel schaltet sie: ${geschaltet.join(" | ")}`);
});

// Doppelt duerfen die beiden Kanten trotzdem nie liegen - das loest die
// Geometrie, in beide Richtungen.
test("the two shadow edges never overlap", () => {
  // Geklebt malt die Kante der Zeile; die unter der Leiste tritt zurueck.
  assert.match(regelInhalt("html.smart-header-tabs-stuck .smart-header-underline"), /opacity:\s*0/);
});

// Verschachtelte calc() haben sich auf WebKit nicht zuverlaessig aufgeloest -
// die Zeile stand dann still statt zu fahren. Flach halten.
test("the transform keeps its calc flat, the way WebKit needs it", () => {
  zeilenRegeln()
    .filter(({ inhalt }) => /transform\s*:/.test(inhalt))
    .forEach(({ selektor, inhalt }) => {
      // var(...) zaehlt nicht als Verschachtelung - erst raus damit, dann darf
      // im calc() keine weitere Klammer mehr stehen.
      let ohneVar = inhalt;
      let vorher = "";
      while (ohneVar !== vorher) {
        vorher = ohneVar;
        ohneVar = ohneVar.replace(/var\([^()]*\)/g, "V");
      }
      const calc = ohneVar.slice(ohneVar.indexOf("calc("));
      assert.doesNotMatch(
        calc.slice("calc(".length, calc.indexOf(")")),
        /\(/,
        `${selektor} verschachtelt calc()`
      );
    });
});

// Der Wechsel zwischen beiden ist nur deshalb unsichtbar, weil es dieselbe
// Kante an derselben Stelle ist: gleicher Verlauf, gleiche Hoehe. Laufen die
// Werte auseinander, blitzt beim Loslassen ein Sprung auf.
test("both shadow edges are the very same gradient, from one shared height", () => {
  const zeile = regelInhalt(".smart-header-tabs--main::after");
  const kante = regelInhalt(".smart-header-underline {");
  const verlauf = /background:\s*(linear-gradient\([^;]+\))/;
  assert.equal(zeile.match(verlauf)?.[1], kante.match(verlauf)?.[1], "derselbe Verlauf");
  // Eine Zahl, ein Name - sonst laufen Kante und Fahrstrecke auseinander.
  [zeile, kante].forEach((regel) => {
    assert.match(regel, /height:\s*var\(--smart-header-edge-height\)/);
  });
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

// Der Pfeil scrollt nicht mehr - also braucht die Seite auch keinen
// garantierten Scroll-Weg mehr, und darf ihn schon gar nicht an die Bildhoehe
// haengen.
test("the pill row no longer forces a minimum page height", () => {
  assert.equal(
    css.includes(".app-shell:has(.smart-header-tabs--main) > main.app-main-scroll"),
    false,
    "die Regel fuer den Scroll-Weg ist raus"
  );
});

// Oben hat der Pfeil nichts zu tun - dort ist er auch nicht da, und zwar ohne
// jeden Platz: die Icons daneben stehen buendig an der rechten Kante. Gefahren
// wird ueber die Breite, denn display laesst sich nicht fahren - sonst
// sprangen die Icons.
test("the chevron takes no space at all when it has nothing to do", () => {
  const zu = regelInhalt("html:not(.smart-header-tabs-offscreen) .smart-header-actions > .smart-header-collapse-btn");
  assert.match(zu, /width:\s*0/, "keine Breite");
  // Ohne min-width:0 kaeme die Breite nie bei 0 an - ein Flex-Kind faellt von
  // Haus aus nie unter die Groesse seines Inhalts.
  // Zwei Dinge lassen die Breite sonst nie bei 0 ankommen: min-width:auto am
  // Flex-Kind, und die Innenpolsterung, die bei border-box in der Breite
  // steckt. Beides gemessen aufgefallen - der Pfeil blieb 16px breit stehen.
  const basis = regelInhalt(".smart-header-actions > .smart-header-collapse-btn");
  assert.match(basis, /min-width:\s*0/, "sonst bleibt die Breite des Icons stehen");
  assert.match(basis, /padding-left:\s*0/, "sonst bleibt die Polsterung stehen");
  assert.match(basis, /padding-right:\s*0/);
  assert.match(basis, /border-left-width:\s*0/, "und der Rahmen ebenso");
  assert.match(basis, /border-right-width:\s*0/);
  assert.match(zu, /margin-left:\s*calc\(-1 \* var\(--smart-header-actions-gap/, "und auch die Luecke der Reihe nicht");
  assert.doesNotMatch(zu, /display:\s*none/, "display waere nicht fahrbar");
});

// Beide Strecken fahren, und zwar gleich lang - sonst zoege die eine der
// anderen hinterher und die Icons ruckelten.
test("width and gap travel together", () => {
  const auf = regelInhalt(".smart-header-actions > .smart-header-collapse-btn");
  const dauerUndKurve = /width\s+(\d+)ms\s+(cubic-bezier\([^)]+\))[\s\S]*?margin-left\s+(\d+)ms\s+(cubic-bezier\([^)]+\))/;
  const treffer = auf.match(dauerUndKurve);
  assert.ok(treffer, "beide fahren mit Dauer und Kurve");
  assert.equal(treffer[3], treffer[1], "dieselbe Dauer");
  assert.equal(treffer[4], treffer[2], "dieselbe Kurve");
});

// Am Ende der Fahrt ist er trotzdem wirklich weg: nicht anfassbar, nicht
// anspringbar, nicht vorgelesen. visibility springt dafuer erst, wenn die
// Fahrt durch ist - sonst waere er weg, bevor man es sieht.
test("the chevron is properly gone once it has finished leaving", () => {
  const zu = regelInhalt("html:not(.smart-header-tabs-offscreen) .smart-header-actions > .smart-header-collapse-btn");
  assert.match(zu, /visibility:\s*hidden/);
  assert.match(zu, /pointer-events:\s*none/);
  const fahrt = zu.match(/width\s+(\d+)ms/);
  assert.ok(fahrt);
  assert.match(
    zu,
    new RegExp(`visibility\\s+0s\\s+linear\\s+${fahrt[1]}ms`),
    "die Sichtbarkeit wartet genau die Fahrt ab"
  );
  assert.match(
    regelInhalt(".smart-header-actions > .smart-header-collapse-btn"),
    /visibility\s+0s\s+linear\s+0s/,
    "beim Erscheinen dagegen sofort"
  );
});

// Die Breite auf schmalen Geraeten kommt ueber den Namen, nicht ueber eine
// zweite width-Regel - sonst schluege sie die Fahrt.
test("the narrow-device width only changes the value, not the property", () => {
  // Auf schmalen Geraeten wird nur der Wert gesetzt - eine zweite width-Regel
  // schluege die Fahrt.
  assert.match(css, /\.smart-header-collapse-btn \{ --smart-header-collapse-width: 1\.6rem; \}/);
  // Und die Reihe nimmt den Pfeil von ihrer Breiten-Regel aus.
  assert.match(css, /> button:not\(\.smart-header-collapse-btn\) \{ width: 2rem/);
  // Genau eine Stelle darf dem Pfeil eine Breite geben, und das ist die
  // fahrende oben.
  // :not(...) und :has(...) nennen den Pfeil, zielen aber nicht auf ihn - erst
  // raus damit, dann zaehlt nur, was ihn wirklich trifft.
  const zieltAufDenPfeil = (selektor) => selektor
    .replace(/:(not|has)\([^()]*\)/g, "")
    .includes(".smart-header-collapse-btn");
  const breitenRegeln = [...css.matchAll(/([^{}]*\.smart-header-collapse-btn[^{}]*)\{([^}]*)\}/g)]
    .filter(([, selektor, inhalt]) => /(^|[;\s])width\s*:/.test(inhalt) && zieltAufDenPfeil(selektor))
    .map(([, selektor]) => selektor.trim().replace(/\s+/g, " "));
  assert.deepEqual(breitenRegeln, [
    ".smart-header-actions > .smart-header-collapse-btn",
    "html:not(.smart-header-tabs-offscreen) .smart-header-actions > .smart-header-collapse-btn"
  ], breitenRegeln.join(" | "));
});
