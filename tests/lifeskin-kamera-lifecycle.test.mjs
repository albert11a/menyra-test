import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import * as texte from "../apps/lifeskin/lifeskin-content.js";
import * as pose from "../apps/lifeskin/lifeskin-pose.js";

// Die echten Methoden ausfuehren, nur DOM, Geraet, Netz und Uhr ersetzen.
// Private Namen werden ausschliesslich in dieser Testkopie zugaenglich.
// Keine Browserstarts, keine Kamera, keine Firebase-Aufrufe.
const quelle = readFileSync(new URL("../apps/lifeskin/lifeskin-app.js", import.meta.url), "utf8")
  .replace(/^import[\s\S]*?;\n/gm, "")
  .replace(/^export /gm, "")
  .replace(/this\.#(\w+)/g, "this._$1")
  .replace(/^(  (?:async )?)#(\w+)\(/gm, "$1_$2(")
  + "\nglobalThis.TrichterTest = Trichter;";

function ziel(extra = {}) {
  const horcher = new Map();
  return {
    ...extra, horcher,
    addEventListener(name, fn) {
      if (!horcher.has(name)) horcher.set(name, new Set());
      horcher.get(name).add(fn);
    },
    removeEventListener(name, fn) { horcher.get(name)?.delete(fn); },
    sende(name, event = {}) { for (const fn of [...(horcher.get(name) || [])]) fn(event); },
    anzahl() { return [...horcher.values()].reduce((n, set) => n + set.size, 0); }
  };
}

function uhr() {
  let jetzt = 1000, nummer = 0;
  const timer = new Map();
  const setzen = (fn, ms, wieder = false) => {
    const id = ++nummer;
    timer.set(id, { fn, ms, wieder, wann: jetzt + ms });
    return id;
  };
  const pumpen = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
  return {
    timer, pumpen,
    Date: class extends Date { static now() { return jetzt; } },
    setTimeout: (fn, ms) => setzen(fn, ms),
    setInterval: (fn, ms) => setzen(fn, ms, true),
    clearTimeout: (id) => timer.delete(id),
    clearInterval: (id) => timer.delete(id),
    async weiter(ms) {
      await pumpen();
      const bis = jetzt + ms;
      let durchlaeufe = 0;
      while (true) {
        const next = [...timer].sort((a, b) => a[1].wann - b[1].wann)[0];
        if (!next || next[1].wann > bis) break;
        assert.ok(++durchlaeufe < 10000, "Timer ohne Fortschritt");
        const [id, t] = next;
        jetzt = t.wann;
        if (t.wieder) t.wann += t.ms; else timer.delete(id);
        t.fn();
        await pumpen();
      }
      jetzt = bis;
      await pumpen();
    }
  };
}

function strom() {
  const spur = { readyState: "live", muted: false, stops: 0,
    stop() { this.stops++; this.readyState = "ended"; } };
  return { spur, getTracks: () => [spur], getVideoTracks: () => [spur] };
}

function aufgeschoben() {
  let resolve, reject;
  const promise = new Promise((ja, nein) => { resolve = ja; reject = nein; });
  return { promise, resolve, reject };
}

function probe({ gum, breite = 390, hoehe = 844 } = {}) {
  const clock = uhr();
  const stream = strom();
  const klassen = new Set(["ls-verstecken"]);
  const box = { classList: {
    add: (name) => klassen.add(name), remove: (name) => klassen.delete(name)
  } };
  const video = ziel({ srcObject: null, videoWidth: 0, videoHeight: 0, readyState: 0,
    clientWidth: 300, clientHeight: 300, paused: true, ended: false, currentTime: 0,
    attrs: {}, setAttribute(name, wert) { this.attrs[name] = wert; },
    plays: 0, play() { this.plays++; this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; }
  });
  const buehne = { dataset: {}, style: {} };
  const kind = (h, mt = 0) => ({ getBoundingClientRect: () => ({ height: h }),
    stil: { marginTop: String(mt), marginBottom: "0" } });
  const schirm = { style: {}, clientHeight: hoehe, clientWidth: breite,
    children: [kind(36), buehne, kind(48, 12), kind(68)],
    stil: { paddingTop: "18px", paddingBottom: "18px", paddingLeft: "20px", paddingRight: "20px" }
  };
  const knopf = { textContent: "", onclick: null };
  const hinweis = { textContent: "" };
  const fehlertext = { textContent: "" };
  const nodes = new Map([
    ["#ls-video", video], [".ls-kamera", buehne], ["#ls-kamera", schirm],
    ["#ls-kamerahinweis", hinweis], ["#ls-fehler", box],
    ["#ls-fehlertext", fehlertext], ["#ls-fehlernochmal", knopf]
  ]);
  const document = ziel({ hidden: false, querySelector: (name) => nodes.get(name) || null,
    querySelectorAll: () => [], documentElement: { dataset: {} } });
  const window = ziel({ innerHeight: hoehe, visualViewport: ziel({ height: hoehe }), scrollTo() {} });
  let anfragen = 0;
  const context = vm.createContext({
    ...texte, ...pose, ...clock, document, window, getComputedStyle: (node) => node.stil,
    MESS_BREITE: 384, STANDARD_KONFIG: { sprache: "sq" }, __LIFESKIN_TEST__: true,
    Pixel: class {}, Sitzung: class { schritt() {} ergaenze() {} },
    // Aus lifeskin-foto.js, das der Trichter fuer den zweiten Weg mit
    // Kamera holt. Die Aufnahme einer Stelle kommt in diesem Pruefstand
    // nicht vor - die Namen muessen trotzdem stehen, sonst faellt die
    // ganze Datei beim Einlesen um.
    besteGuete: (kodiere) => ({ jpeg: kodiere(0.9), guete: 0.9 }),
    Flaechenkamera: class { starte() { return Promise.resolve(false); } stoppe() {} },
    beiFreigabe: () => () => {}, KAMERA_HAENGT_MS: 8000, BILD_GRENZE_MS: 5000,
    fotoAusDatei: async () => null,
    navigator: { mediaDevices: { getUserMedia: (...args) => { anfragen++; return gum ? gum(...args) : Promise.resolve(stream); } } },
    netzHolen: async () => null, netzStand: () => "aus", console,
    requestAnimationFrame: (fn) => clock.setTimeout(fn, 16),
    performance: { now: () => clock.Date.now() }
  });
  vm.runInContext(quelle, context);
  const app = new context.TrichterTest({ variante: "kurz" });
  const aufrufe = { fallback: 0, ring: 0 };
  app.zeige = (name) => { app.aktiv = name; };
  app._ringZeichnen = () => {};
  app._neuerRing = () => ({ anteil: 0, hoechsterAusschlag: 0, pauseEinrechnen() {} });
  app._rueckfallschleife = () => { aufrufe.fallback++; };
  app._ringschleife = () => { aufrufe.ring++; };
  const bild = () => {
    Object.assign(video, { videoWidth: 1280, videoHeight: 720, readyState: 2, paused: false });
    video.sende("loadeddata");
  };
  return { app, clock, stream, video, document, window, context, nodes, schirm, buehne,
    bild, aufrufe, knopf, hinweis, fehlertext,
    anfragen: () => anfragen, fehlerSichtbar: () => !klassen.has("ls-verstecken") };
}

test("Zurueck waehrend Freigabe: spaeter Stream wird geschlossen, kein Scan startet", async () => {
  const pending = aufgeschoben();
  const p = probe({ gum: () => pending.promise });
  const start = p.app._kameraStarten();
  p.app.zurueckZu("einstieg");
  await start;
  pending.resolve(p.stream);
  await p.clock.pumpen();
  assert.equal(p.stream.spur.stops, 1);
  assert.equal(p.app.aktiv, "einstieg");
  assert.equal(p.video.srcObject, null);
  assert.equal(p.aufrufe.fallback, 0);
  assert.equal(p.fehlerSichtbar(), false);
  assert.equal(p.clock.timer.size, 0);
});

test("offene Freigabe endet nach 30 Sekunden; spaete Erlaubnis bleibt geschlossen", async () => {
  const pending = aufgeschoben();
  const p = probe({ gum: () => pending.promise });
  const start = p.app._kameraStarten();
  await p.clock.weiter(30000);
  await start;
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerKameraWartet.sq);
  pending.resolve(p.stream);
  await p.clock.pumpen();
  assert.equal(p.stream.spur.stops, 1);
  assert.equal(p.video.srcObject, null);
  assert.equal(p.anfragen(), 1);
});

test("Doppeltippen: nur der aktuelle Stream und genau ein Scanweg bleiben aktiv", async () => {
  const eins = aufgeschoben(), zwei = aufgeschoben();
  let n = 0;
  const p = probe({ gum: () => (++n === 1 ? eins.promise : zwei.promise) });
  const alterStream = strom(), neuerStream = strom();
  const alt = p.app._kameraStarten();
  const neu = p.app._kameraStarten();
  zwei.resolve(neuerStream);
  await p.clock.pumpen(); p.bild(); await p.clock.weiter(480); await neu;
  eins.resolve(alterStream);
  await alt; await p.clock.pumpen();
  assert.equal(alterStream.spur.stops, 1);
  assert.equal(neuerStream.spur.stops, 0);
  assert.equal(p.video.srcObject, neuerStream);
  assert.equal(p.aufrufe.fallback, 1);
  p.app._kameraStoppen();
});

test("iOS: offenes play()-Promise blockiert ein wirklich vorhandenes Bild nicht", async () => {
  const p = probe();
  p.video.play = () => { p.video.paused = false; return new Promise(() => {}); };
  const start = p.app._kameraStarten();
  await p.clock.pumpen(); p.bild();
  assert.equal(p.buehne.dataset.bereit, "nein");
  assert.equal(p.aufrufe.fallback, 0);
  await p.clock.weiter(480); await start;
  assert.equal(p.aufrufe.fallback, 1);
  assert.equal(p.video.muted, true);
  assert.equal(p.video.playsInline, true);
  assert.equal(p.video.anzahl(), 0, "Bereitschaftslistener entfernt");
  p.app._kameraStoppen();
});

test("Metadaten ohne dekodiertes Bild: einmal still neu geholt, dann Hilfe nach 10 statt 30 s", async () => {
  const stroeme = [];
  const p = probe({ gum: async () => { const s = strom(); s.spur.enabled = true; stroeme.push(s); return s; } });
  const start = p.app._kameraStarten();
  await p.clock.pumpen();
  Object.assign(p.video, { videoWidth: 1280, videoHeight: 720, readyState: 1 });
  p.video.sende("loadedmetadata");
  await p.clock.weiter(3000);
  assert.equal(p.buehne.dataset.bereit, "nein");
  assert.equal(p.aufrufe.fallback, 0);
  await p.clock.weiter(2100); await start;
  assert.equal(p.anfragen(), 2, "Ein Strom ohne Bild wird nicht neu geholt");
  assert.equal(stroeme[0].spur.stops, 1, "Der schwarze erste Strom bleibt offen");
  assert.equal(p.fehlerSichtbar(), false, "Der zweite Anlauf zeigt schon einen Fehler");
  await p.clock.weiter(5100);
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerKameraBild.sq);
  assert.equal(p.anfragen(), 2, "Mehr als ein stiller zweiter Anlauf");
  assert.equal(stroeme[1].spur.stops, 1);
  assert.equal(p.video.anzahl(), 0);
  assert.equal(p.document.anzahl(), 0);
  assert.equal(p.clock.timer.size, 0);
});

test("langsames Android: ein erst nach 4 Sekunden geliefertes Bild startet normal", async () => {
  const p = probe();
  const start = p.app._kameraStarten();
  await p.clock.weiter(4000);
  p.bild(); await p.clock.weiter(600); await start;
  assert.equal(p.aufrufe.fallback, 1);
  assert.equal(p.fehlerSichtbar(), false);
  p.app._kameraStoppen();
});

test("Abbruch waehrend Videobereitschaft kann einen neuen Lauf nicht veraendern", async () => {
  const p = probe();
  const alt = p.app._kameraStarten(); await p.clock.pumpen();
  p.app.zurueckZu("einstieg"); await alt;
  p.bild(); await p.clock.weiter(12000);
  assert.equal(p.buehne.dataset.bereit, "nein");
  assert.equal(p.aufrufe.fallback, 0);
  assert.equal(p.fehlerSichtbar(), false);
  assert.equal(p.video.anzahl(), 0);
});

test("unvertraegliche Aufloesung: einfachere Constraints liefern weiter eine Kamera", async () => {
  const calls = [], s = strom();
  const p = probe({ gum: async (regel) => {
    calls.push(regel);
    if (calls.length < 3) throw Object.assign(new Error(), { name: "OverconstrainedError" });
    return s;
  } });
  assert.equal(await p.app._stromHolen(), s);
  assert.equal(calls.length, 3);
  assert.equal(calls[2].video, true);
  assert.ok(calls.every((c) => c.audio === false));
  assert.equal(p.clock.timer.size, 0);
});

for (const [name, schluessel] of [
  ["NotAllowedError", "fehlerKameraErlaubnis"], ["SecurityError", "fehlerKameraErlaubnis"],
  ["NotReadableError", "fehlerKameraBelegt"], ["NotFoundError", "fehlerKameraFehlt"]
]) test(`${name}: konkrete Hilfe und sauberer erneuter Versuch`, async () => {
  let fehler = true;
  const s = strom();
  const p = probe({ gum: async () => {
    if (fehler) throw Object.assign(new Error(), { name });
    return s;
  } });
  await p.app._kameraStarten();
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE[schluessel].sq);
  if (/NotAllowed|Security/.test(name)) assert.equal(p.anfragen(), 1);
  assert.equal(p.clock.timer.size, 0);
  fehler = false;
  p.knopf.onclick(); await p.clock.pumpen(); p.bild(); await p.clock.weiter(480);
  assert.equal(p.fehlerSichtbar(), false);
  assert.equal(p.aufrufe.fallback, 1);
  p.app._kameraStoppen();
});

test("WebView ohne Kamera-API erklaert den Wechsel in den Systembrowser", async () => {
  const p = probe();
  p.context.navigator.mediaDevices = undefined;
  await p.app._kameraStarten();
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerKameraBrowser.sq);
  assert.equal(p.anfragen(), 0);
});

async function laufend() {
  const p = probe();
  const start = p.app._kameraStarten();
  await p.clock.pumpen(); p.bild(); await p.clock.weiter(600); await start;
  return p;
}

test("beendeter Kameratrack waehrend Scan: Kamera aus, Hilfe sichtbar", async () => {
  const p = await laufend();
  p.stream.spur.readyState = "ended";
  await p.clock.weiter(800);
  assert.equal(p.app.kamera.laeuft, false);
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerKameraUnterbrochen.sq);
  assert.equal(p.clock.timer.size, 0);
});

test("eingefrorenes Video mit Metadaten wird nicht endlos als laufend gewertet", async () => {
  const p = await laufend();
  await p.clock.weiter(2400);
  assert.equal(p.app._leinwandFuellen(), null, "Kein altes Frame fuer neue Aufnahmen");
  await p.clock.weiter(8200);
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerKameraBild.sq);
  assert.equal(p.stream.spur.stops, 1);
});

test("Ringscan ohne Fortschritt bleibt trotz laufendem Video nicht endlos offen", async () => {
  const p = await laufend();
  p.app.kamera.modus = "ring";
  const frames = p.clock.setInterval(() => { p.video.currentTime += 0.1; }, 100);
  await p.clock.weiter(46500);
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerScanStillstand.sq);
  assert.equal(p.stream.spur.stops, 1);
  p.clock.clearInterval(frames);
});

test("Appwechsel: Hintergrund liefert keine Aufnahmen und verbraucht keine Scanfrist", async () => {
  const p = await laufend();
  p.app._ereignisse();
  p.app.kamera.modus = "ring";
  p.document.hidden = true; p.document.sende("visibilitychange");
  await p.clock.weiter(65000);
  assert.equal(p.app._kamerabildBereit(p.video), false);
  assert.equal(p.app.kamera.laeuft, true);
  p.document.hidden = false; p.video.paused = true; p.document.sende("visibilitychange");
  const frames = p.clock.setInterval(() => { p.video.currentTime += 0.1; }, 100);
  await p.clock.weiter(2000);
  assert.equal(p.fehlerSichtbar(), false);
  assert.equal(p.video.paused, false);
  p.clock.clearInterval(frames); p.app._kameraStoppen();
});

test("Seite verlassen und BFCache-Rueckkehr: Stream aus, expliziter Neustart statt leeres Bild", async () => {
  const p = await laufend(); p.app._ereignisse();
  p.window.sende("pagehide");
  assert.equal(p.stream.spur.stops, 1);
  assert.equal(p.video.srcObject, null);
  p.window.sende("pageshow", { persisted: true });
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerKameraUnterbrochen.sq);
});

test("Canvas verliert Videobild zwischen Pruefung und Kopie: naechstes Bild bleibt moeglich", () => {
  const p = probe();
  let restauriert = 0;
  const ctx = { save() {}, translate() {}, scale() {}, restore() { restauriert++; },
    drawImage() { throw Object.assign(new Error(), { name: "InvalidStateError" }); } };
  const canvas = { width: 240, height: 240, getContext: () => ctx };
  const aus = { x: 0, y: 0, breite: 240, hoehe: 240 };
  assert.equal(p.app._spiegelnAuf(canvas, p.video, aus, 240, 240), null);
  assert.equal(restauriert, 1);
  ctx.drawImage = () => {};
  assert.equal(p.app._spiegelnAuf(canvas, p.video, aus, 240, 240), canvas);
});

for (const [breite, hoehe] of [[320, 568], [375, 667], [390, 844], [412, 915], [844, 390], [800, 360], [1280, 800]]) {
  test(`Kamera ${breite}x${hoehe}: Kreis, Hinweis und Hilfe passen in verfuegbare Hoehe`, () => {
    const p = probe({ breite, hoehe }); p.app.aktiv = "kamera";
    p.app._kameraGroesse();
    const mass = parseFloat(p.buehne.style.width);
    assert.ok(mass > 0 && mass <= breite - 40);
    assert.ok(mass + 36 + 48 + 12 + 68 + 36 <= hoehe);
    assert.equal(p.schirm.style.height, `${hoehe}px`);
  });
}

test("Drehung und Browserleiste berechnen die Buehne neu", () => {
  const p = probe(); p.app.aktiv = "kamera"; p.app._ereignisse();
  p.app._kameraGroesse();
  const alt = p.buehne.style.width;
  p.schirm.clientWidth = 844; p.schirm.clientHeight = 390;
  p.window.visualViewport.height = 390;
  p.window.sende("resize");
  assert.notEqual(p.buehne.style.width, alt);
  assert.ok(parseFloat(p.buehne.style.width) <= 190);
  p.schirm.clientHeight = 340; p.window.visualViewport.height = 340;
  p.window.visualViewport.sende("resize");
  assert.equal(p.schirm.style.height, "340px");
});

test("vorhandener Querformat-Hinweis pausiert Aufnahme und Ringuhren bis zum Zurueckdrehen", async () => {
  const p = await laufend(); p.app._ereignisse();
  let quer = false, pause = 0;
  p.window.matchMedia = () => ({ matches: quer });
  p.app.kamera.ring.pauseEinrechnen = (ms) => { pause += ms; };
  quer = true; p.window.sende("resize");
  await p.clock.weiter(60000);
  assert.equal(p.app._kamerabildBereit(p.video), false);
  assert.equal(p.app.kamera.laeuft, true);
  quer = false; p.window.sende("resize");
  assert.equal(pause, 60000);
  assert.equal(p.app._kamerabildBereit(p.video), true);
  assert.equal(p.fehlerSichtbar(), false);
  p.app._kameraStoppen();
});

test("Hintergrund waehrend Kamerastart verbraucht die Frist fuer das erste Bild nicht", async () => {
  const p = probe(); p.app._ereignisse();
  const start = p.app._kameraStarten(); await p.clock.pumpen();
  p.document.hidden = true; p.document.sende("visibilitychange");
  await p.clock.weiter(60000);
  assert.equal(p.fehlerSichtbar(), false);
  p.document.hidden = false; p.document.sende("visibilitychange");
  p.bild(); await p.clock.weiter(600); await start;
  assert.equal(p.aufrufe.fallback, 1);
  p.app._kameraStoppen();
});

test("kurzer nativer AbortError darf auf einfachere Kameraeinstellungen zurueckfallen", async () => {
  let n = 0;
  const s = strom();
  const p = probe({ gum: async () => {
    if (++n === 1) throw Object.assign(new Error(), { name: "AbortError" });
    return s;
  } });
  assert.equal(await p.app._stromHolen(), s);
  assert.equal(n, 2);
});

test("normaler Scan behaelt Fotos, captured-Markierung und Uebergabe zur Namenseingabe", async () => {
  const p = await laufend();
  const fotos = { gerade: { jpeg: "test" }, rechts: { jpeg: "test" }, links: { jpeg: "test" } };
  let gespeichert, schritt;
  p.app.kamera.proben = [{ frontal: true, erkannt: true }, { frontal: false, sektor: 2, erkannt: true }];
  p.app._fotosAlsJpeg = async () => fotos;
  p.app.sitzung.fotosSpeichern = (daten) => { gespeichert = daten; };
  p.app.sitzung.schritt = (name, daten) => { schritt = { name, daten }; };
  p.app._fragenZeigen = () => { p.app.aktiv = "name"; };
  await p.app._ringAbschluss();
  assert.equal(gespeichert, fotos);
  assert.equal(schritt.name, "captured");
  assert.equal(schritt.daten.views, 2);
  assert.equal(p.app.zustand.fotoAnzahl, 3);
  assert.equal(p.app.aktiv, "name");
  assert.equal(p.stream.spur.stops, 1);
});

test("Zurueck waehrend JPEG-Kodierung: alte Fotos loesen keine Uebergabe aus", async () => {
  const p = await laufend();
  const pending = aufgeschoben();
  p.app.kamera.proben = [{ frontal: true, erkannt: true }];
  p.app._fotosAlsJpeg = () => pending.promise;
  p.app.sitzung.fotosSpeichern = () => assert.fail("Alter Scan darf nicht mehr speichern");
  const fertig = p.app._ringAbschluss();
  p.app.zurueckZu("einstieg");
  pending.resolve({ gerade: { jpeg: "test" } });
  await fertig;
  assert.equal(p.app.aktiv, "einstieg");
});

test("Scan ohne gespeichertes Foto zaehlt nicht als captured", async () => {
  const p = await laufend();
  p.app.kamera.proben = [{ frontal: true, erkannt: true }];
  p.app._fotosAlsJpeg = async () => ({});
  p.app.sitzung.fotosSpeichern = () => assert.fail("Leere Aufnahme darf nicht gespeichert werden");
  p.app.sitzung.schritt = () => assert.fail("Leere Aufnahme darf nicht als captured zaehlen");
  await p.app._ringAbschluss();
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerKameraBild.sq);
});

test("Kodierung eines alten Scans kann Fotos des neuen Scans nicht leeren oder uebernehmen", async () => {
  const p = probe();
  const foto = { leinwand: { width: 100, height: 100 }, breite: 100, hoehe: 100 };
  p.app.kamera.fotos = { gerade: { erste: foto, mehr: [] } };
  p.app._kodiereSoGutWieMoeglich = () => ({ jpeg: "altes Testbild" });
  const alt = p.app._fotosAlsJpeg();
  const neueFotos = { rechts: { erste: { ...foto }, mehr: [] } };
  p.app.kamera.fotos = neueFotos;
  await p.clock.weiter(0);
  const result = await alt;
  assert.deepEqual(Object.keys(result), ["gerade"]);
  assert.equal(p.app.kamera.fotos, neueFotos);
});

test("Fallback ohne Videobild zeigt Kamerahilfe und behauptet kein fehlendes Gesicht", async () => {
  const p = await laufend();
  p.app._leinwandFuellen = () => null;
  const frames = p.clock.setInterval(() => { p.video.currentTime += 0.1; }, 100);
  const aufnahme = p.app._rueckfallAufnehmen();
  await p.clock.weiter(10100); await aufnahme;
  assert.equal(p.fehlertext.textContent, texte.OBERFLAECHE.fehlerKameraBild.sq);
  assert.equal(p.stream.spur.stops, 1);
  p.clock.clearInterval(frames);
});


test("Aufloesungswechsel beim Start bleiben verborgen bis das Bild stabil ist", async () => {
  const p = probe();
  const start = p.app._kameraStarten();
  await p.clock.pumpen(); p.bild();
  await p.clock.weiter(120);
  assert.equal(p.buehne.dataset.bereit, "nein");
  Object.assign(p.video, { videoWidth: 720, videoHeight: 1280 });
  p.video.sende("resize");
  await p.clock.weiter(120);
  assert.equal(p.buehne.dataset.bereit, "nein");
  await p.clock.weiter(120); await start;
  assert.equal(p.buehne.dataset.bereit, "ja");
  assert.equal(p.aufrufe.fallback, 1);
  p.app._kameraStoppen();
});

test("Das Bild erscheint spaetestens 700 ms nach dem ersten Bild, auch wenn die Groesse springt", async () => {
  const p = probe();
  const start = p.app._kameraStarten();
  await p.clock.pumpen(); p.bild();
  for (let i = 0; i < 5; i++) {
    await p.clock.weiter(120);
    Object.assign(p.video, { videoWidth: i % 2 ? 1280 : 720, videoHeight: i % 2 ? 720 : 1280 });
    p.video.sende("resize");
  }
  assert.equal(p.buehne.dataset.bereit, "nein");
  await p.clock.weiter(120); await start;
  assert.equal(p.buehne.dataset.bereit, "ja");
  assert.equal(p.aufrufe.fallback, 1);
  p.app._kameraStoppen();
});

test("Kein Bild beim ersten Strom, aber beim zweiten: der Scan laeuft ohne Fehlerkasten", async () => {
  let n = 0;
  const p = probe({ gum: async () => { n++; const s = strom(); s.spur.enabled = true; return s; } });
  const start = p.app._kameraStarten();
  await p.clock.weiter(5100); await start;
  assert.equal(n, 2);
  await p.clock.pumpen(); p.bild(); await p.clock.weiter(480);
  assert.equal(p.aufrufe.fallback, 1, "Der zweite Anlauf fuehrt nicht in den Scan");
  assert.equal(p.fehlerSichtbar(), false);
  p.app._kameraStoppen();
});

test("Foto-BFCache: leere Kamera bietet Neustart, vorhandene Vorschau bleibt erhalten", () => {
  const p = probe();
  const buehne = { dataset: { stand: "kamera" } };
  p.nodes.set("#ls-fotobuehne", buehne);
  p.app.aktiv = "foto";
  p.app.flaeche = { laeuft: false, stoppe() {} };
  p.app._ereignisse();
  p.window.sende("pageshow", { persisted: true });
  assert.equal(p.fehlerSichtbar(), true);
  p.nodes.get("#ls-fehler").classList.add("ls-verstecken");
  buehne.dataset.stand = "vorschau";
  p.window.sende("pageshow", { persisted: true });
  assert.equal(p.fehlerSichtbar(), false);
});
