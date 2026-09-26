// Kaufleiste, Kasse und Kundenvideos der Therapieseite - von Grund auf.
//
// Gemeldet vom iPhone: Die Kaufleiste stand mitten im Bildschirm (nach der
// Kasse, nach der Rueckkehr) und erschien beim Ueberscrollen oben.
// Die Ursachen, und was hier festgehalten wird:
// 1. Kasse und Kundenvideos lagen als "position: fixed" ueber der Seite,
//    mit Eingabefeldern darin. Beim Tippen schob iOS die Seite unter der
//    Tastatur weg und liess sie verschoben - jede feste Leiste stand danach
//    um die Tastaturhoehe zu hoch. Jetzt sind beide eine eigene Ansicht an
//    der Stelle der Seite (ansicht.js) - ohne Nachrechnen, ohne Tricks.
// 2. Versteckt war die Leiste nur unter den Rand geschoben. Jetzt ist
//    versteckt unsichtbar.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ansichtOeffnen, ansichtSchliessen, offeneAnsicht } from "../apps/lifeskin-verkauf/ansicht.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");
const css = lies("apps/lifeskin-verkauf/verkauf.css");
const regel = (wahl) => {
  const anfang = css.indexOf(`${wahl} {`);
  assert.ok(anfang > -1, `${wahl} fehlt`);
  return css.slice(anfang, css.indexOf("}", anfang));
};

function umgebung({ y = 1200, instantFehlt = false } = {}) {
  const aufrufe = [];
  const fenster = {
    scrollY: y,
    scrollTo(a, b) {
      if (typeof a === "object") {
        if (instantFehlt && a.behavior === "instant") throw new TypeError("unbekannt");
        aufrufe.push({ top: a.top, verhalten: a.behavior });
        fenster.scrollY = a.top;
      } else {
        aufrufe.push({ top: b, verhalten: "alt" });
        fenster.scrollY = b;
      }
    }
  };
  const dokument = { documentElement: { dataset: {} } };
  return { fenster, dokument, aufrufe };
}

test("die Kasse tritt an die Stelle der Seite und gibt sie an derselben Stelle zurueck", () => {
  const { fenster, dokument, aufrufe } = umgebung({ y: 1200 });
  const kasse = { hidden: true };
  ansichtOeffnen(kasse, "kasse", { fenster, dokument });
  assert.equal(kasse.hidden, false);
  assert.equal(dokument.documentElement.dataset.ansicht, "kasse", "die Seite dahinter bleibt stehen");
  assert.deepEqual(aufrufe.at(-1), { top: 0, verhalten: "instant" }, "die Kasse beginnt nicht oben");
  assert.equal(offeneAnsicht(), kasse);

  ansichtSchliessen(kasse, { fenster, dokument });
  assert.equal(kasse.hidden, true);
  assert.equal(dokument.documentElement.dataset.ansicht, undefined, "die Seite kommt nicht zurueck");
  assert.deepEqual(aufrufe.at(-1), { top: 1200, verhalten: "instant" }, "die Seite steht danach woanders");
  assert.equal(offeneAnsicht(), null);
});

test("vom Video direkt in die Kasse: zurueck geht es an die alte Stelle der Seite", () => {
  const { fenster, dokument, aufrufe } = umgebung({ y: 900 });
  const video = { hidden: true };
  const kasse = { hidden: true };
  ansichtOeffnen(video, "betrachter", { fenster, dokument });
  ansichtSchliessen(video, { fenster, dokument });
  ansichtOeffnen(kasse, "kasse", { fenster, dokument });
  ansichtSchliessen(kasse, { fenster, dokument });
  assert.equal(aufrufe.at(-1).top, 900);
  assert.equal(video.hidden, true);
});

test("aeltere Browser ohne 'instant' springen trotzdem", () => {
  const { fenster, dokument, aufrufe } = umgebung({ y: 500, instantFehlt: true });
  const kasse = { hidden: true };
  ansichtOeffnen(kasse, "kasse", { fenster, dokument });
  ansichtSchliessen(kasse, { fenster, dokument });
  assert.deepEqual(aufrufe.map((a) => a.top), [0, 500]);
});

test("Kasse und Betrachter sind keine festen Fenster mehr", () => {
  assert.doesNotMatch(regel(".porosia"), /position:\s*fixed/, "die Kasse liegt wieder fest ueber der Seite");
  assert.doesNotMatch(regel(".betrachter"), /position:\s*fixed/, "der Betrachter liegt wieder fest ueber der Seite");
  assert.match(css, /html\[data-ansicht\] \.kopf, html\[data-ansicht\] \.faqe, html\[data-ansicht\] \.leiste \{ display: none !important; \}/);
});

test("keine Scroll-Sperre und kein Nachrechnen mehr auf der Therapieseite", () => {
  for (const datei of ["apps/lifeskin-verkauf/terapia.js", "apps/lifeskin-verkauf/terapia-medien.js"]) {
    const js = lies(datei);
    assert.doesNotMatch(js, /pa-rreshqitje/, `${datei} sperrt wieder das Scrollen`);
    assert.doesNotMatch(js, /untenNachziehen/, `${datei} rechnet wieder nach`);
    assert.match(js, /ansichtOeffnen\(/, `${datei} oeffnet nicht als Ansicht`);
  }
});

test("versteckt heisst unsichtbar - nicht unter den Rand geschoben", () => {
  const versteckt = regel('.leiste[data-an="nein"]');
  assert.match(versteckt, /visibility: hidden/);
  assert.match(versteckt, /opacity: 0/);
  assert.match(versteckt, /pointer-events: none/);
  assert.doesNotMatch(versteckt, /110%/);
  assert.doesNotMatch(css, /--unten/);
});

test("der Betrachter merkt sich die Stelle der Seite, bevor er sich oeffnet", () => {
  const js = lies("apps/lifeskin-verkauf/terapia-medien.js");
  const oeffne = js.slice(js.indexOf("  oeffne(index) {"), js.indexOf("  schliesse({"));
  const eintrag = oeffne.indexOf("history.pushState");
  const ansicht = oeffne.indexOf("ansichtOeffnen(b.hinten");
  assert.ok(eintrag > -1 && ansicht > -1);
  assert.ok(eintrag < ansicht,
    "erst die Ansicht, dann der Verlaufseintrag - dann stellt 'zurueck' den Anfang des Betrachters her statt der Stelle der Seite");
  // Aus dem Video in die Kasse: erst wenn das Zurueck ganz angekommen ist.
  assert.match(js, /addEventListener\("popstate", \(\) => setTimeout\(\(\) => this\.kaufen\?\.tun\(\), 0\), \{ once: true \}\)/);
});
