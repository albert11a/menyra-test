// Der Sprungschutz: Schaltet die Kamera beim Anlaufen ihre Aufloesung um,
// bleibt das letzte Bild davor stehen und blendet weich aus. Der Ausschnitt
// springt nie sichtbar - und das Bild erscheint trotzdem frueh.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { Sprungschutz, SPRUNG_FENSTER_MS } from "../apps/lifeskin/lifeskin-foto.js";

const CSS = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-styles.css"), "utf8");

function bau() {
  let jetzt = 1000;
  const echtesNow = Date.now;
  Date.now = () => jetzt;
  const bilder = new Map();
  const zeiten = new Map();
  let nummer = 0;
  const fenster = {
    requestAnimationFrame: (fn) => { bilder.set(++nummer, fn); return nummer; },
    cancelAnimationFrame: (id) => bilder.delete(id)
  };
  const echtesSetTimeout = globalThis.setTimeout;
  const echtesClearTimeout = globalThis.clearTimeout;
  globalThis.setTimeout = (fn, ms) => { zeiten.set(++nummer, { fn, wann: jetzt + ms }); return nummer; };
  globalThis.clearTimeout = (id) => zeiten.delete(id);
  const klassen = new Set();
  const gezeichnet = [];
  const leinwand = {
    width: 0, height: 0, className: "", setAttribute() {},
    classList: { add: (...k) => k.forEach((x) => klassen.add(x)), remove: (...k) => k.forEach((x) => klassen.delete(x)),
      contains: (k) => klassen.has(k) },
    getContext: () => ({ drawImage: (_v, _x, _y, b, h) => gezeichnet.push(`${b}x${h}`) })
  };
  const eltern = { insertBefore: (kind) => { eltern.kind = kind; } };
  const video = { parentNode: eltern, nextSibling: null, readyState: 2, videoWidth: 640, videoHeight: 480 };
  const dokument = { defaultView: fenster, createElement: () => leinwand };
  const schutz = new Sprungschutz({ video, dokument });
  // Ein Bild weiter: 33 ms, dann alles, was faellig ist.
  const bild = (ms = 33) => {
    jetzt += ms;
    for (const [id, t] of [...zeiten]) if (t.wann <= jetzt) { zeiten.delete(id); t.fn(); }
    const faellig = [...bilder];
    bilder.clear();
    for (const [, fn] of faellig) fn();
  };
  const aufraeumen = () => {
    schutz.stoppe();
    Date.now = echtesNow;
    globalThis.setTimeout = echtesSetTimeout;
    globalThis.clearTimeout = echtesClearTimeout;
  };
  return { schutz, video, leinwand, klassen, gezeichnet, bild, bilder, zeiten, eltern, aufraeumen };
}

test("die Leinwand liegt sofort ueber dem Video und zeichnet jedes Bild mit", () => {
  const p = bau();
  try {
    assert.equal(p.schutz.starte(), true);
    assert.equal(p.eltern.kind, p.leinwand, "Die Leinwand liegt nicht im Kasten des Videos");
    assert.ok(p.klassen.has("ls-sprung--an"), "Die Leinwand liegt nicht oben, bevor ein Wechsel kommt");
    p.bild(); p.bild();
    assert.deepEqual(p.gezeichnet, ["640x480", "640x480", "640x480"]);
  } finally { p.aufraeumen(); }
});

test("beim Aufloesungswechsel bleibt das alte Bild stehen und blendet erst ruhig aus", () => {
  const p = bau();
  try {
    p.schutz.starte(); p.bild();
    const vorher = p.gezeichnet.length;
    Object.assign(p.video, { videoWidth: 1440, videoHeight: 1080 });
    p.bild();
    assert.equal(p.gezeichnet.length, vorher, "Das neue Bild wurde auf die Leinwand gezeichnet - der Sprung ist zu sehen");
    assert.ok(p.klassen.has("ls-sprung--an"), "Das Standbild deckt den Wechsel nicht ab");
    for (let i = 0; i < 5; i++) p.bild();
    assert.ok(p.klassen.has("ls-sprung--an"), "Ausgeblendet, bevor die neue Groesse ruhig stand");
    for (let i = 0; i < 2; i++) p.bild();
    assert.ok(!p.klassen.has("ls-sprung--an"), "Nach der Ruhezeit bleibt das Standbild stehen");
    assert.ok(p.klassen.has("ls-sprung--blende"), "Es verschwindet ohne Ueberblendung");
    for (let i = 0; i < 9; i++) p.bild();
    assert.ok(p.klassen.has("ls-sprung--an"), "Nach der Blende zeichnet die Leinwand nicht wieder mit");
    assert.equal(p.gezeichnet.at(-1), "1440x1080");
  } finally { p.aufraeumen(); }
});

test("eine Kamera, die nicht zur Ruhe kommt, friert das Bild hoechstens eine Sekunde ein", () => {
  const p = bau();
  try {
    p.schutz.starte(); p.bild();
    for (let i = 0; i < 40 && p.klassen.has("ls-sprung--an"); i++) {
      Object.assign(p.video, { videoWidth: i % 2 ? 640 : 1280, videoHeight: 480 });
      p.bild();
    }
    assert.ok(!p.klassen.has("ls-sprung--an"), "Das Standbild bleibt ewig stehen");
  } finally { p.aufraeumen(); }
});

test("nach dem Fenster ist der Schutz weg und haelt nichts mehr offen", () => {
  const p = bau();
  try {
    p.schutz.starte();
    for (let i = 0; i < Math.ceil(SPRUNG_FENSTER_MS / 33) + 20; i++) p.bild();
    assert.equal(p.bilder.size, 0, "Die Leinwand zeichnet nach dem Fenster weiter");
    assert.equal(p.zeiten.size, 0);
    assert.equal(p.klassen.size, 0);
    assert.equal(p.leinwand.width, 0, "Der Bildspeicher wird nicht freigegeben");
  } finally { p.aufraeumen(); }
});

test("stoppe raeumt sofort auf", () => {
  const p = bau();
  try {
    p.schutz.starte(); p.bild();
    p.schutz.stoppe();
    assert.equal(p.bilder.size, 0);
    assert.equal(p.klassen.size, 0);
  } finally { p.aufraeumen(); }
});

test("ohne Leinwand im Geraet bleibt alles wie ohne Schutz", () => {
  const schutz = new Sprungschutz({ video: { parentNode: null }, dokument: {} });
  assert.equal(schutz.starte(), false);
  schutz.stoppe();
});

test("die Leinwand bekommt denselben Zuschnitt und Spiegel wie das Video", () => {
  assert.match(CSS, /\.ls-kamera video,\s*\n\.ls-kamera \.ls-sprung \{/,
    "Scan: Die Leinwand liegt anders als das Video - jeder Wechsel darauf waere selbst ein Sprung");
  assert.match(CSS, /\.ls-flaeche__rahmen video,\s*\n\.ls-flaeche__rahmen \.ls-sprung,/);
  assert.match(CSS, /\.ls-flaeche\[data-richtung="user"\] \.ls-flaeche__rahmen \.ls-sprung \{ transform: scaleX\(-1\); \}/);
  assert.match(CSS, /\.ls-kamera\[data-bereit="ja"\] \.ls-sprung--an \{ opacity: 1; \}/);
  assert.match(CSS, /\.ls-sprung \{ opacity: 0; transition: opacity 240ms ease;/);
});
