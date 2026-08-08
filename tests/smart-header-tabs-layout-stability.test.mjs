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

// Und dasselbe eine Ebene weiter, wo es wirklich weh tut: der Hauptbereich ist
// das Element, das dem Dokument seine Laenge gibt. Haengt seine Hoehe an der
// Bildhoehe, waechst und schrumpft das Dokument unter dem Finger - auf iOS
// faehrt die Adressleiste beim ersten Wisch nach einem Neuladen ein, und
// --viewport-height wird bei jedem visualViewport-Ereignis neu geschrieben.
// Genau so entstand das kurze Stehenbleiben mit Nachsprung.
//
// Die Karte ist ausgenommen: sie scrollt nicht (overflow: hidden), sie fuellt
// nur.
test("the main scroll area never gets its length from the viewport", () => {
  const treffer = [...css.matchAll(/([^{}]*)\{([^}]*)\}/g)]
    .filter(([, selektor, inhalt]) =>
      /\.app-main-scroll/.test(selektor)
      && !/--map-fill/.test(selektor)
      && /(min-|max-)?height\s*:/.test(inhalt)
      && /--viewport-height|\d\s*(vh|dvh|lvh|svh)\b/.test(inhalt))
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
// ===========================================================================
// Der Pfeil bewegt nichts, was Layout kostet
//
// Frueher fuhr seine BREITE (dazu der negative Aussenabstand, der die Luecke
// der Reihe mitnahm). Das ist eine Layout-Fahrt: 200ms lang ein Neuvermessen
// der Icon-Reihe, der Header-Zeile und der klebenden Leiste in jedem Bild, auf
// dem Hauptthread - angestossen genau beim Scrollen. Daher das Stocken.
//
// Jetzt behaelt der Pfeil seinen Platz und wechselt nur die Deckkraft; die
// Icons daneben fahren per transform. Beides erledigt der Compositor.
// ===========================================================================

// Der Kern: was das Scrollen anstoesst, darf keine Layout-Eigenschaft fahren.
// Das ist die allgemeine Fassung des Fehlers - sie faengt auch die naechste
// Variante davon.
//
// Gemeint ist genau die Chrome, die am Scroll haengt: die Icon-Reihe mit dem
// Pfeil und die Pill-Zeile. Aufklappende Vorschlagslisten und aehnliches
// duerfen weiter Hoehe fahren - die stossen Finger und Tastatur an, nicht der
// Scroll, und dort ist eine Layout-Fahrt genau das gewollte Bild.
test("nothing the scroll triggers ever animates a layout property", () => {
  const scrollChrome = /smart-header-(actions|collapse-btn|tabs|pill)/;
  const layoutEigenschaft = /\b(width|height|margin(-[a-z]+)?|padding(-[a-z]+)?|top|right|bottom|left|inset|gap|flex(-[a-z]+)?|font-size|border-[a-z]*width)\b/;
  const treffer = [...css.matchAll(/([^{}]*)\{([^}]*)\}/g)]
    .filter(([, selektor, inhalt]) => scrollChrome.test(selektor) && /transition\s*:/.test(inhalt))
    .map(([, selektor, inhalt]) => [selektor.trim().replace(/\s+/g, " "), inhalt.match(/transition\s*:([^;]*)/)?.[1] || ""])
    .filter(([, fahrt]) => layoutEigenschaft.test(fahrt))
    .map(([selektor, fahrt]) => `${selektor} -> ${fahrt.trim()}`);
  assert.deepEqual(treffer, [], `faehrt Layout: ${treffer.join(" | ")}`);
});

// Genau eine Stelle gibt dem Pfeil eine Breite, und die ist konstant. Eine
// zweite waere der Anfang einer neuen Breiten-Fahrt.
test("the chevron has exactly one width, and it never changes", () => {
  // :not(...) und :has(...) nennen den Pfeil, zielen aber nicht auf ihn - erst
  // raus damit, dann zaehlt nur, was ihn wirklich trifft.
  const zieltAufDenPfeil = (selektor) => selektor
    .replace(/:(not|has)\([^()]*\)/g, "")
    .includes(".smart-header-collapse-btn");
  const breitenRegeln = [...css.matchAll(/([^{}]*\.smart-header-collapse-btn[^{}]*)\{([^}]*)\}/g)]
    .filter(([, selektor, inhalt]) => /(^|[;\s])width\s*:/.test(inhalt) && zieltAufDenPfeil(selektor))
    .map(([, selektor]) => selektor.trim().replace(/\s+/g, " "));
  assert.deepEqual(
    breitenRegeln,
    [".smart-header-actions > .smart-header-collapse-btn"],
    breitenRegeln.join(" | ")
  );
  // Auf schmalen Geraeten wird nur der Wert gesetzt, nicht die Eigenschaft.
  assert.match(css, /\.smart-header-actions--with-collapse \{ --smart-header-collapse-width: 1\.6rem; \}/);
});

// Die Pfeilbreite muss an der REIHE stehen, nicht am Pfeil: die Icons daneben
// fahren um genau diesen Betrag, und Variablen vererben nach unten, nicht
// seitwaerts. Am Pfeil deklariert kaeme sie bei den Icons nie an - auf schmalen
// Geraeten waeren sie um den Unterschied verrutscht.
test("the chevron's width is declared where the icons can read it", () => {
  const traeger = [...css.matchAll(/([^{}\n]*)\{[^}]*--smart-header-collapse-width\s*:/g)]
    .map(([, selektor]) => selektor.trim());
  assert.ok(traeger.length > 0, "die Breite wird irgendwo gesetzt");
  traeger.forEach((selektor) => {
    assert.doesNotMatch(
      selektor,
      /collapse-btn\s*$/,
      `${selektor}: von dort erben die Geschwister nicht`
    );
  });
});

// Die Icons fahren um genau den Platz, den der Pfeil einnimmt - Breite plus
// die Luecke, die die Reihe zwischen ihren Knoepfen laesst. Sonst staenden sie
// nicht buendig an der Kante.
test("the icons glide by exactly the chevron's own footprint", () => {
  const zu = regelInhalt(
    ".smart-header-actions--with-collapse:not(.smart-header-actions--collapse-ready)\n      > :not(.smart-header-collapse-btn)"
  );
  assert.match(
    zu,
    /transform:\s*translateX\(calc\(var\(--smart-header-collapse-width[^)]*\)\s*\+\s*var\(--smart-header-actions-gap/,
    "Pfeilbreite plus Luecke"
  );
  const fahrt = regelInhalt(".smart-header-actions--with-collapse > :not(.smart-header-collapse-btn)");
  assert.match(
    fahrt,
    /transition:\s*transform\s+(\d+ms|var\(--smart-header-collapse-glide)/,
    "und gefahren wird der transform"
  );
});

// Wirklich weg ist er trotzdem: nicht anfassbar, nicht anspringbar, nicht
// vorgelesen - und zwar erst, wenn er ausgeblendet ist.
test("the chevron is properly gone once it has finished leaving", () => {
  const zu = regelInhalt(
    ".smart-header-actions--with-collapse:not(.smart-header-actions--collapse-ready)\n      > .smart-header-collapse-btn"
  );
  assert.match(zu, /opacity:\s*0/);
  assert.match(zu, /visibility:\s*hidden/);
  assert.match(zu, /pointer-events:\s*none/);
  const blende = zu.match(/opacity\s+(\d+)ms/);
  assert.ok(blende, "die Deckkraft faehrt mit einer Dauer");
  assert.match(zu, /visibility\s+0s\s+linear\s+\d+ms/, "die Sichtbarkeit wartet sie ab");
  assert.match(
    regelInhalt(".smart-header-actions > .smart-header-collapse-btn"),
    /visibility\s+0s\s+linear\s+0s/,
    "beim Erscheinen dagegen sofort"
  );
});

// Der Pfeil steht genau dort, wohin die Icons fahren, wenn es ihn nicht gibt -
// sie kreuzen ihn also zwangslaeufig. Sichtbar werden darf das nie: er blendet
// erst auf, wenn die Fahrt durch ist, und ist umgekehrt weg, bevor sie ankommt.
test("the chevron and the icons are never visible in the same place", () => {
  const auf = regelInhalt(".smart-header-actions > .smart-header-collapse-btn");
  const zu = regelInhalt(
    ".smart-header-actions--with-collapse:not(.smart-header-actions--collapse-ready)\n      > .smart-header-collapse-btn"
  );
  const fahrt = regelInhalt(".smart-header-actions--with-collapse > :not(.smart-header-collapse-btn)");

  // Die Fahrt liest ihre Dauer aus derselben Variable, an der auch die
  // Verzoegerung der Blende haengt - zwei Zahlen von Hand gleich zu halten
  // waere eine Drift-Falle.
  assert.match(
    fahrt,
    /transition:\s*transform\s+var\(--smart-header-collapse-glide/,
    "die Fahrt nennt die Dauer als Variable"
  );
  assert.match(
    auf,
    /opacity\s+\d+ms\s+[a-z-]+\s+var\(--smart-header-collapse-glide/,
    "und die Blende wartet genau diese Fahrt ab"
  );

  // Beim Verschwinden umgekehrt: kuerzer als die Fahrt und ohne Warten.
  const wegDauer = Number(zu.match(/opacity\s+(\d+)ms/)?.[1]);
  const glide = Number(css.match(/--smart-header-collapse-glide:\s*(\d+)ms/)?.[1]);
  assert.ok(Number.isFinite(wegDauer) && Number.isFinite(glide), "beide Dauern stehen im CSS");
  assert.ok(wegDauer < glide, `die Blende (${wegDauer}ms) muss kuerzer sein als die Fahrt (${glide}ms)`);
  assert.doesNotMatch(zu, /opacity\s+\d+ms\s+[a-z-]+\s+\d*[1-9]\d*ms/, "und sie wartet nicht");
  // Angefasst wird er erst, wenn er auch wirklich zu sehen ist.
  assert.match(zu, new RegExp(`visibility\\s+0s\\s+linear\\s+${wegDauer}ms`), "die Sichtbarkeit folgt der Blende");
});

// :has() wird bei jedem Stil-Neuaufbau mit ausgewertet. Die Icon-Reihe weiss
// vom Render, ob es den Pfeil gibt - dafuer braucht es keine Suche im Baum.
test("the icon row is told about the chevron, it does not search for it", () => {
  const mitHas = [...css.matchAll(/([^{}]*)\{[^}]*\}/g)]
    .map(([, selektor]) => selektor.trim().replace(/\s+/g, " "))
    .filter((selektor) => /smart-header-actions/.test(selektor) && /:has\(/.test(selektor));
  assert.deepEqual(mitHas, [], `sucht im Baum: ${mitHas.join(" | ")}`);
});
