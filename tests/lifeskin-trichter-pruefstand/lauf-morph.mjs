// DAS ABGLEICHEN VON HEART (apps/mnyra-heart/heart-morph.js) - im Browser.
//
// morphInhalt() soll dasselbe Ergebnis liefern wie innerHTML, nur ohne
// wegzuwerfen, was gleich bleibt. In Node gibt es kein DOM; geprueft wird
// deshalb hier, in Chromium: Nach jedem Schritt muss der Inhalt Zeichen
// fuer Zeichen dem entsprechen, was innerHTML ergeben haette - und die
// Knoten, die bleiben sollten, muessen dieselben sein.
//
//   node scripts/local-dev-server.mjs &
//   node tests/lifeskin-trichter-pruefstand/lauf-morph.mjs

import { chromium } from "playwright-core";

const BASIS = process.env.BASIS || "http://127.0.0.1:5173";
const browser = await chromium.launch({ executablePath: process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium" });
const seite = await browser.newPage();
await seite.goto(`${BASIS}/apps/mnyra-heart/index.html?ohne-app=1`, { waitUntil: "commit" }).catch(() => {});
await seite.setContent("<!doctype html><div id='w'></div>");
const ergebnis = await seite.evaluate(async (basis) => {
  const { morphInhalt, mitFingerabdruck } = await import(`${basis}/apps/mnyra-heart/heart-morph.js`);
  const w = document.getElementById("w");
  const befunde = [];
  const pruefe = (ok, text) => befunde.push({ ok: Boolean(ok), text });
  const gleichWieInnerHtml = (markup, text) => {
    morphInhalt(w, markup);
    const soll = document.createElement("div");
    soll.innerHTML = markup;
    pruefe(w.innerHTML === soll.innerHTML, `${text}: gleiches Ergebnis wie innerHTML`);
  };

  // 1) Liste mit Schluesseln: umsortieren, einfuegen, entfernen.
  gleichWieInnerHtml(`<ul>${["a", "b", "c"].map((x) => `<li data-id="${x}" data-action="z">${x}</li>`).join("")}</ul>`, "Liste");
  const b = w.querySelector('[data-id="b"]');
  gleichWieInnerHtml(`<ul>${["n", "c", "b", "a"].map((x) => `<li data-id="${x}" data-action="z">${x}!</li>`).join("")}</ul>`, "umsortiert + neu");
  pruefe(w.querySelector('[data-id="b"]') === b, "Zeile b ist derselbe Knoten geblieben");
  gleichWieInnerHtml(`<ul>${["c", "a"].map((x) => `<li data-id="${x}" data-action="z">${x}</li>`).join("")}</ul>`, "entfernt");

  // 2) Das Feld, in dem getippt wird, behaelt seinen Wert; die anderen folgen dem Markup.
  morphInhalt(w, `<input id="f1" value="alt"><input id="f2" value="alt"><input type="checkbox" id="k" checked>`);
  const f1 = document.getElementById("f1");
  f1.focus();
  f1.value = "getippt";
  document.getElementById("f2").value = "vergessen";
  morphInhalt(w, `<input id="f1" value="neu"><input id="f2" value="neu"><input type="checkbox" id="k">`);
  pruefe(document.getElementById("f1") === f1 && f1.value === "getippt" && document.activeElement === f1, "aktives Feld: Wert und Fokus bleiben");
  pruefe(document.getElementById("f2").value === "neu", "anderes Feld folgt dem Markup (wie innerHTML)");
  pruefe(document.getElementById("k").checked === false, "Haken folgt dem Markup");
  f1.blur();

  // 3) data-bewahren: gleicher Schluessel -> unangetastet; neuer Schluessel -> neu.
  morphInhalt(w, `<form data-bewahren="s1"><textarea id="t">gespeichert</textarea></form>`);
  const t = document.getElementById("t");
  t.value = "im Bogen getippt";
  morphInhalt(w, `<form data-bewahren="s1"><textarea id="t">anderer Stand</textarea></form>`);
  pruefe(document.getElementById("t") === t && t.value === "im Bogen getippt", "bewahrtes Formular bleibt mit Inhalt");
  morphInhalt(w, `<form data-bewahren="s2"><textarea id="t">zweiter Fall</textarea></form>`);
  pruefe(document.getElementById("t").value === "zweiter Fall", "neuer Schluessel: neues Formular");

  // 4) Fingerabdruck: gleicher Abdruck -> nicht durchsucht, anderer -> abgeglichen.
  const zeile = (text) => mitFingerabdruck(`<div class="z" data-id="r1" data-action="x"><span>${text}</span></div>`);
  morphInhalt(w, zeile("eins"));
  const span = w.querySelector("span");
  span.setAttribute("data-markiert", "1");
  morphInhalt(w, zeile("eins"));
  pruefe(w.querySelector("span") === span && span.getAttribute("data-markiert") === "1", "gleicher Abdruck: Knoten unberuehrt");
  gleichWieInnerHtml(zeile("zwei"), "anderer Abdruck");

  // 5) Auswahlfeld ohne gewaehlte Option zeigt die erste (wie innerHTML).
  morphInhalt(w, `<select id="s"><option>a</option><option selected>b</option></select>`);
  morphInhalt(w, `<select id="s"><option>a</option><option>b</option></select>`);
  pruefe(document.getElementById("s").value === "a", "Auswahl springt ohne 'selected' auf die erste Option");

  // 6) Text, Kommentare, Attribute, SVG.
  gleichWieInnerHtml(`<p class="a">Hallo <b>Welt</b><!-- k --></p><svg viewBox="0 0 2 2"><path d="M0 0"/></svg>`, "gemischt");
  gleichWieInnerHtml(`<p class="b" hidden>Hallo <i>Welt</i></p><svg viewBox="0 0 4 4"><circle r="1"/></svg>`, "Tag gewechselt, Attribute weg/neu");
  gleichWieInnerHtml(`<details open><summary>x</summary><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt=""></details>`, "details/img");
  const bild = w.querySelector("img");
  gleichWieInnerHtml(`<details><summary>y</summary><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt=""></details>`, "details zu");
  pruefe(w.querySelector("img") === bild, "Bild mit gleicher Quelle bleibt derselbe Knoten (kein Neuladen)");
  // 7) Doppelte Schluessel stoeren nicht.
  gleichWieInnerHtml(`<div data-id="d" data-action="x">1</div><div data-id="d" data-action="x">2</div>`, "doppelte Schluessel");
  gleichWieInnerHtml(`<div data-id="d" data-action="x">2</div>`, "doppelte Schluessel danach");
  return befunde;
}, BASIS);
let schlecht = 0;
for (const b of ergebnis) { console.log(`${b.ok ? "✓" : "✗"} ${b.text}`); if (!b.ok) schlecht += 1; }
console.log(`\n${ergebnis.length - schlecht} von ${ergebnis.length} bestanden`);
await browser.close();
process.exit(schlecht ? 1 : 0);
