// DIE WEGE, AN DENEN BESUCHER HAENGEN BLIEBEN - geprueft an den echten
// Methoden des Trichters, mit nachgebautem Browser, Kamera, Netz und Uhr.
//
//   1. Android in Facebook/Instagram: Die eingebaute Webansicht gibt keine
//      Kamera frei. Statt "Provo sërish" (das dort nie hilft) gibt es die
//      Kamera des Telefons und den Weg nach Chrome.
//   2. Das Foto aus der Kamera des Telefons fuehrt in den Weg "Me foto".
//   3. Ein Ring, der steht, wirft die Bilder nicht mehr weg.
//   4. Faellt die Erkennung aus, macht der Weg ohne Netz fertig.
//   5. Das Gesichtsnetz (6,9 MB) wird erst geholt, wenn jemand scannen will.
//
// Keine Browserstarts, keine Kamera, keine Firebase-Aufrufe.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import * as texte from "../apps/lifeskin/lifeskin-content.js";
import * as pose from "../apps/lifeskin/lifeskin-pose.js";
import { inAppAndroid } from "../apps/lifeskin/lifeskin-app.js";

const quelle = readFileSync(new URL("../apps/lifeskin/lifeskin-app.js", import.meta.url), "utf8")
  .replace(/^import[\s\S]*?;\n/gm, "")
  .replace(/^export /gm, "")
  .replace(/this\.#(\w+)/g, "this._$1")
  .replace(/^(  (?:async )?)#(\w+)\(/gm, "$1_$2(")
  + "\nglobalThis.TrichterTest = Trichter;";

const UA = Object.freeze({
  facebookAndroid: "Mozilla/5.0 (Linux; Android 13; SM-A536B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/447.0.0.40.108;]",
  instagramAndroid: "Mozilla/5.0 (Linux; Android 12; SM-G991B Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.193 Mobile Safari/537.36 Instagram 310.0.0.38.109 Android (31/12; 420dpi; 1080x2176; samsung; SM-G991B; o1s; exynos2100; de_DE; 543512316)",
  instagramIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 308.0.2.18.106 (iPhone15,2; iOS 17_1; de_DE; de; scale=3.00; 1179x2556; 530339375)",
  facebookIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/430.0.0.29.107;FBBV/551146455;FBDV/iPhone13,2;FBMD/iPhone;FBSN/iOS;FBSV/16.6;FBSS/3;FBID/phone;FBLC/de_DE;FBOP/5]",
  samsungInstagram: "Mozilla/5.0 (Linux; Android 14; SM-S921B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.146 Mobile Safari/537.36 Instagram 348.0.0.36.103 Android (34/14; 480dpi; 1080x2340; samsung; SM-S921B; e1s; s5e9945; de_DE; 637476142)",
  chromeAndroid: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  samsungAndroid: "Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
  safariIos: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
});

test("Android in einer App erkannt - iPhone und Systembrowser nicht", () => {
  assert.equal(inAppAndroid(UA.facebookAndroid), true);
  assert.equal(inAppAndroid(UA.instagramAndroid), true);
  assert.equal(inAppAndroid(UA.samsungInstagram), true);
  // Auf dem iPhone geben dieselben Apps die Kamera frei.
  assert.equal(inAppAndroid(UA.instagramIos), false);
  assert.equal(inAppAndroid(UA.facebookIos), false);
  assert.equal(inAppAndroid(UA.chromeAndroid), false);
  assert.equal(inAppAndroid(UA.samsungAndroid), false);
  assert.equal(inAppAndroid(UA.safariIos), false);
  assert.equal(inAppAndroid(""), false);
});

// ---------------------------------------------------------------------------
// Der nachgebaute Browser
// ---------------------------------------------------------------------------

function ziel(extra = {}) {
  const horcher = new Map();
  return {
    ...extra, horcher,
    addEventListener(name, fn) {
      if (!horcher.has(name)) horcher.set(name, new Set());
      horcher.get(name).add(fn);
    },
    removeEventListener(name, fn) { horcher.get(name)?.delete(fn); },
    sende(name, event = {}) { for (const fn of [...(horcher.get(name) || [])]) fn(event); }
  };
}

function uhr() {
  let jetzt = 1000, nummer = 0;
  const timer = new Map();
  const setzen = (fn, ms, wieder = false) => {
    const id = ++nummer;
    timer.set(id, { fn, ms, wieder, wann: jetzt + (ms || 0) });
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
        assert.ok(++durchlaeufe < 20000, "Timer ohne Fortschritt");
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

function knoten(extra = {}) {
  const klassen = new Set(extra.klassen || []);
  const attribute = new Map();
  return ziel({
    textContent: "", hidden: false, onclick: null, dataset: {}, style: {}, value: "",
    classList: {
      add: (name) => klassen.add(name), remove: (name) => klassen.delete(name),
      contains: (name) => klassen.has(name),
      toggle: (name, an) => { if (an ?? !klassen.has(name)) klassen.add(name); else klassen.delete(name); }
    },
    setAttribute(name, wert) { attribute.set(name, String(wert)); },
    getAttribute(name) { return attribute.has(name) ? attribute.get(name) : null; },
    removeAttribute(name) { attribute.delete(name); },
    focus() {},
    ...extra
  });
}

function probe({ ua = UA.chromeAndroid, gum, mitFoto = true, suche = "" } = {}) {
  const clock = uhr();
  const stream = strom();
  const video = ziel({ srcObject: null, videoWidth: 0, videoHeight: 0, readyState: 0,
    clientWidth: 300, clientHeight: 300, paused: true, ended: false, currentTime: 0,
    setAttribute() {}, play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; } });
  const kind = (h) => ({ getBoundingClientRect: () => ({ height: h }), stil: { marginTop: "0", marginBottom: "0" } });
  const buehne = { dataset: {}, style: {} };
  const schirm = { style: {}, clientHeight: 844, clientWidth: 390, children: [kind(36), buehne, kind(60)],
    stil: { paddingTop: "18px", paddingBottom: "18px", paddingLeft: "20px", paddingRight: "20px" } };
  const nodes = new Map([
    ["#ls-video", video], [".ls-kamera", buehne], ["#ls-kamera", schirm],
    ["#ls-kamerahinweis", knoten()],
    ["#ls-fehler", knoten({ klassen: ["ls-verstecken"] })],
    ["#ls-fehlertext", knoten()], ["#ls-fehlernochmal", knoten()],
    ["#ls-fehlerfoto", knoten({ hidden: true })], ["#ls-fehlerchrome", knoten({ hidden: true })],
    ["#ls-blatt", knoten({ klassen: ["ls-verstecken"] })],
    ["#ls-wahl", knoten()], ["#ls-vorbereitung", knoten()], ["#ls-name", knoten()]
  ]);
  if (mitFoto) {
    nodes.set("#ls-foto", knoten());
    nodes.set("#ls-fotobuehne", knoten({ dataset: { stand: "kamera" } }));
    nodes.set("#ls-fotobild", knoten({ src: "" }));
  }
  const felder = [];
  const document = ziel({
    hidden: false, visibilityState: "visible",
    querySelector: (name) => nodes.get(name) || null,
    querySelectorAll: () => [],
    documentElement: { dataset: {} },
    body: { appendChild: (el) => { el.imDokument = true; } },
    createElement: (art) => {
      const el = knoten({ art, klicks: 0, files: [], click() { this.klicks++; } });
      if (art === "input") felder.push(el);
      return el;
    }
  });
  const window = ziel({ innerHeight: 844, visualViewport: ziel({ height: 844 }), scrollTo() {} });
  const aufrufe = { netz: 0, fallback: 0, ring: 0 };
  const sitzung = {
    schritte: [], ergaenzt: [], fotos: [],
    schritt(name) { this.schritte.push(name); },
    ergaenze(daten) { this.ergaenzt.push(daten); },
    zurueckAuf(name) { this.schritte.push(`zurueck:${name}`); },
    fotosSpeichern(fotos) { this.fotos.push(fotos); return Promise.resolve(); },
    miniaturenSpeichern() { return Promise.resolve(); }
  };
  let fehlerFolge = 0;
  let dateiAufnahme = { foto: { jpeg: "data:image/jpeg;base64,QUFB", breite: 1200, hoehe: 1600 },
    mini: { jpeg: "data:image/jpeg;base64,bWluaQ", breite: 120, hoehe: 160 }, vorschau: "data:image/jpeg;base64,bWluaQ" };
  const context = vm.createContext({
    ...texte, ...pose, ...clock, document, window, getComputedStyle: (node) => node.stil || {},
    MESS_BREITE: 384, STANDARD_KONFIG: { sprache: "sq" }, __LIFESKIN_TEST__: true,
    Pixel: class { meldeWeg() {} melde() {} },
    Sitzung: class {},
    besteGuete: (kodiere) => ({ jpeg: kodiere(0.9), guete: 0.9 }),
    Flaechenkamera: class { starte() { return Promise.resolve(false); } stoppe() {} },
    beiFreigabe: () => () => {}, KAMERA_HAENGT_MS: 8000, BILD_GRENZE_MS: 5000,
    fotoAusDatei: async () => dateiAufnahme,
    navigator: { userAgent: ua, mediaDevices: { getUserMedia: (...args) => (gum ? gum(...args) : Promise.resolve(stream)) } },
    location: { href: `https://www.mnyra.com/lifeskin${suche}`, search: suche, pathname: "/lifeskin", assign() {}, replace() {} },
    history: { state: { ls: "einstieg" }, ersetzt: [], replaceState(state, titel, adresse) { this.ersetzt.push(adresse); } },
    netzVorladen: () => { aufrufe.netz++; return Promise.resolve(null); },
    netzHolen: async () => null, netzStand: () => "aus", netzArt: () => "",
    netzFehlerFolge: () => fehlerFolge, messeNetz: () => null,
    // Im eigenen Kontext gibt es nur die Sprache, nicht den Browser.
    URL, URLSearchParams,
    console, requestAnimationFrame: (fn) => clock.setTimeout(fn, 16),
    performance: { now: () => clock.Date.now() }
  });
  vm.runInContext(quelle, context);
  const app = new context.TrichterTest({ variante: "kurz" });
  app.sitzung = sitzung;
  app.zeige = (name) => { app.aktiv = name; };
  app._ringZeichnen = () => {};
  app._neuerRing = () => ({ anteil: 0, hoechsterAusschlag: 0, pauseEinrechnen() {} });
  app._rueckfallschleife = () => { aufrufe.fallback++; };
  app._ringschleife = () => { aufrufe.ring++; };
  const bild = () => {
    Object.assign(video, { videoWidth: 1280, videoHeight: 720, readyState: 2, paused: false });
    video.sende("loadeddata");
  };
  return {
    app, clock, stream, video, nodes, sitzung, felder, aufrufe, context, bild,
    hol: (name) => nodes.get(name),
    fehlerSichtbar: () => !nodes.get("#ls-fehler").classList.contains("ls-verstecken"),
    fehlerFolgeSetzen: (n) => { fehlerFolge = n; },
    dateiSetzen: (wert) => { dateiAufnahme = wert; }
  };
}

const verweigert = () => Promise.reject(Object.assign(new Error("Permission denied"), { name: "NotAllowedError" }));

// ---------------------------------------------------------------------------
// 1. Die gesperrte Kamera einer App
// ---------------------------------------------------------------------------

test("Android in Facebook: kein sinnloses 'Provo sërish', sondern Handykamera und Chrome", async () => {
  const p = probe({ ua: UA.facebookAndroid, gum: verweigert });
  await p.app._kameraStarten();
  assert.equal(p.fehlerSichtbar(), true);
  assert.equal(p.hol("#ls-fehlertext").textContent, texte.OBERFLAECHE.fehlerKameraInApp.sq);
  assert.equal(p.hol("#ls-fehlernochmal").hidden, true, "Nochmal versuchen hilft in dieser App nie");
  assert.equal(p.hol("#ls-fehlerfoto").hidden, false, "Die Kamera des Telefons fehlt");
  const chrome = p.hol("#ls-fehlerchrome");
  assert.equal(chrome.hidden, false, "Der Weg nach Chrome fehlt");
  const adresse = chrome.getAttribute("href");
  assert.match(adresse, /^intent:\/\/www\.mnyra\.com\/lifeskin\?ls_weg=skanim#Intent;scheme=https;package=com\.android\.chrome;/);
  assert.match(adresse, /S\.browser_fallback_url=https%3A%2F%2Fwww\.mnyra\.com%2Flifeskin%3Fls_weg%3Dskanim;end$/);
});

test("Android in einer App, aber SELBST abgelehnt (Frage kam): 'Provo sërish' bleibt, dazu Handykamera und Chrome", async () => {
  // Dass die App gar nicht fragt, sagen alte Quellen - es wird nicht
  // vorausgesetzt. Kommt die Absage erst nach Sekunden, hat ein Mensch
  // "Blockieren" getippt: Eine App, die fragt, fragt vielleicht wieder.
  const p = probe({ ua: UA.samsungInstagram, gum: () => new Promise((_, nein) => {
    p.clock.setTimeout(() => nein(Object.assign(new Error("Permission denied"), { name: "NotAllowedError" })), 2500);
  }) });
  const start = p.app._kameraStarten();
  await p.clock.weiter(2600);
  await start;
  assert.equal(p.hol("#ls-fehlertext").textContent, texte.OBERFLAECHE.fehlerKameraErlaubnis.sq);
  assert.equal(p.hol("#ls-fehlernochmal").hidden, false, "Nach eigener Ablehnung fehlt der zweite Versuch");
  assert.equal(p.hol("#ls-fehlerfoto").hidden, false);
  assert.equal(p.hol("#ls-fehlerchrome").hidden, false);
});

test("Android in einer App mit freigegebener Kamera: kein Fehlerkasten, der Scan laeuft", async () => {
  const p = probe({ ua: UA.samsungInstagram });
  const start = p.app._kameraStarten();
  await p.clock.pumpen(); p.bild(); await p.clock.weiter(600); await start;
  assert.equal(p.fehlerSichtbar(), false);
  assert.equal(p.aufrufe.fallback, 1, "Der Scan ist nicht angelaufen");
  p.app._kameraStoppen();
});

test("Fotoweg in der App: sofortige Absage ohne Frage - Handykamera statt 'Provo sërish'", async () => {
  const p = probe({ ua: UA.facebookAndroid });
  p.context.Flaechenkamera = class {
    constructor(optionen) { this.optionen = optionen; }
    starte() { this.optionen.beiFehler("fehlerKameraErlaubnis"); return Promise.resolve(false); }
    stoppe() {}
  };
  await p.app._fotoStarten();
  assert.equal(p.hol("#ls-fehlertext").textContent, texte.OBERFLAECHE.fehlerKameraInApp.sq);
  assert.equal(p.hol("#ls-fehlernochmal").hidden, true);
  assert.equal(p.hol("#ls-fehlerfoto").hidden, false);
  assert.match(p.hol("#ls-fehlerchrome").getAttribute("href"), /ls_weg=foto/);
});

test("iPhone in Instagram: verweigert heisst verweigert - nochmal UND Handykamera, kein Chrome", async () => {
  const p = probe({ ua: UA.instagramIos, gum: verweigert });
  await p.app._kameraStarten();
  assert.equal(p.hol("#ls-fehlertext").textContent, texte.OBERFLAECHE.fehlerKameraErlaubnis.sq);
  assert.equal(p.hol("#ls-fehlernochmal").hidden, false);
  assert.equal(p.hol("#ls-fehlerfoto").hidden, false);
  assert.equal(p.hol("#ls-fehlerchrome").hidden, true, "Auf dem iPhone gibt es keinen Chrome-Weg aus der App");
});

test("eine Seite ohne Fotobildschirm bietet keine Handykamera an - das Bild haette keinen Platz", async () => {
  const p = probe({ ua: UA.instagramAndroid, gum: verweigert, mitFoto: false });
  await p.app._kameraStarten();
  assert.equal(p.hol("#ls-fehlerfoto").hidden, true);
  assert.equal(p.hol("#ls-fehlerchrome").hidden, false);
});

test("der naechste Fehler raeumt die Auswege des vorigen weg", async () => {
  const p = probe({ ua: UA.facebookAndroid, gum: verweigert });
  await p.app._kameraStarten();
  p.app._fehlerZeigen("uebergabeFehler", () => {});
  assert.equal(p.hol("#ls-fehlertext").textContent, texte.OBERFLAECHE.uebergabeFehler.sq);
  assert.equal(p.hol("#ls-fehlernochmal").hidden, false);
  assert.equal(p.hol("#ls-fehlerfoto").hidden, true);
  assert.equal(p.hol("#ls-fehlerchrome").hidden, true);
  assert.equal(p.hol("#ls-fehlerchrome").getAttribute("href"), null);
});

// ---------------------------------------------------------------------------
// 2. Das Foto aus der Kamera des Telefons
// ---------------------------------------------------------------------------

test("Handykamera nach gesperrtem Scan: Foto steht zur Pruefung, der Weg ist jetzt 'Me foto'", async () => {
  const p = probe({ ua: UA.facebookAndroid, gum: verweigert });
  p.app.zustand.typ = "scan";
  await p.app._kameraStarten();
  p.hol("#ls-fehlerfoto").onclick();
  assert.equal(p.fehlerSichtbar(), false);
  assert.equal(p.felder.length, 1, "Kein Dateifeld angelegt");
  const feld = p.felder[0];
  assert.equal(feld.type, "file");
  assert.equal(feld.accept, "image/*");
  assert.equal(feld.getAttribute("capture"), "user");
  assert.equal(feld.klicks, 1, "Die Kamera des Telefons ging nicht auf");
  assert.equal(feld.imDokument, true);

  feld.files = [{ type: "image/jpeg" }];
  feld.sende("change");
  await p.clock.pumpen();
  assert.equal(p.app.aktiv, "foto");
  assert.equal(p.app.zustand.typ, "foto");
  assert.equal(p.app.zustand.fotoQuelle, "system");
  assert.ok(p.sitzung.ergaenzt.some((d) => d.typ === "foto"), "Der Typ des Falls wurde nicht umgeschrieben");
  assert.ok(p.sitzung.schritte.includes("fotokamera"));
  assert.equal(p.hol("#ls-fotobuehne").dataset.stand, "vorschau");
  assert.equal(p.hol("#ls-fotobild").src, "data:image/jpeg;base64,bWluaQ");

  // "Bëje përsëri" oeffnet wieder die Kamera des Telefons - nicht die
  // Live-Kamera, die es hier nicht gibt. Das alte Bild bleibt, bis ein
  // neues da ist.
  p.app._fotoNochmal();
  assert.equal(feld.klicks, 2);
  assert.ok(p.app.zustand.stelleFoto, "Das Bild ist weg, bevor ein neues da ist");

  // "Përdor foton" - ab hier derselbe Weg wie nach dem Ausloeser.
  p.app._fotoNehmen();
  assert.deepEqual(Object.keys(p.sitzung.fotos[0]), ["zona"]);
  assert.equal(p.app.aktiv, "name");
});

test("ein unlesbares Bild sagt es und laesst es noch einmal versuchen", async () => {
  const p = probe({ ua: UA.facebookAndroid, gum: verweigert });
  await p.app._kameraStarten();
  p.hol("#ls-fehlerfoto").onclick();
  p.dateiSetzen(null);
  p.felder[0].files = [{ type: "image/heic" }];
  p.felder[0].sende("change");
  await p.clock.pumpen();
  assert.equal(p.hol("#ls-fehlertext").textContent, texte.OBERFLAECHE.fehlerSystemFoto.sq);
  assert.notEqual(p.app.aktiv, "foto");
  p.hol("#ls-fehlernochmal").onclick();
  assert.equal(p.felder[0].klicks, 2);
});

test("die Live-Kamera des Fotowegs setzt die Quelle zurueck", () => {
  const p = probe();
  p.app.zustand.fotoQuelle = "system";
  p.app._fotoStarten();
  assert.equal(p.app.zustand.fotoQuelle, "live");
});

// ---------------------------------------------------------------------------
// 3. und 4. Der Ring, der steht - und die Erkennung, die ausfaellt
// ---------------------------------------------------------------------------

async function laufend(p) {
  const start = p.app._kameraStarten();
  await p.clock.pumpen(); p.bild(); await p.clock.weiter(600); await start;
  p.clock.setInterval(() => { p.video.currentTime += 0.1; }, 100);
}

test("Ring ohne Fortschritt MIT Bildern: Hilfe geht auf, Kamera und Bilder bleiben", async () => {
  const p = probe();
  await laufend(p);
  p.app.kamera.modus = "ring";
  p.app.kamera.fotos.gerade = { erste: { leinwand: {}, abweichung: 0 }, mehr: [] };
  // Nach 15 Sekunden ohne Fortschritt (gemessen am 25.09.: mit 25 stand
  // ein Mensch, der den Kopf nicht dreht, 34 Sekunden vor der Kamera).
  await p.clock.weiter(12000);
  assert.equal(p.hol("#ls-blatt").classList.contains("ls-verstecken"), true, "Die Hilfe ging zu frueh auf");
  await p.clock.weiter(4500);
  assert.equal(p.hol("#ls-blatt").classList.contains("ls-verstecken"), false, "Die Hilfe mit 'Vazhdo kështu' ging nicht auf");
  assert.equal(p.fehlerSichtbar(), false);
  assert.equal(p.app.kamera.laeuft, true, "Die Kamera wurde abgeschaltet");
  assert.equal(p.stream.spur.stops, 0);
  assert.ok(p.app.kamera.fotos.gerade?.erste, "Die Bilder sind weg");
  // Und nach 45 Sekunden gibt es erst recht keinen Abbruch.
  await p.clock.weiter(30000);
  assert.equal(p.fehlerSichtbar(), false);
  p.app._kameraStoppen();
});

test("Ring ohne Fortschritt OHNE Bild: nach 30 s der Ausweg - noch einmal oder Telefonkamera", async () => {
  const p = probe();
  await laufend(p);
  p.app.kamera.modus = "ring";
  // Gemessen am 25.09.: Ohne erkanntes Gesicht kam der Ausweg erst nach
  // 50 Sekunden - laenger, als jemand in einem App-Fenster wartet.
  await p.clock.weiter(27000);
  assert.equal(p.fehlerSichtbar(), false, "Der Ausweg kam zu frueh");
  await p.clock.weiter(4500);
  assert.equal(p.fehlerSichtbar(), true, "Nach 30 Sekunden ohne Bild steht kein Ausweg da");
  assert.equal(p.hol("#ls-fehlernochmal").hidden, false, "'Provo sërish' fehlt");
  assert.equal(p.hol("#ls-fehlerfoto").hidden, false, "Die Telefonkamera fehlt");
});

test("faellt die Erkennung Bild um Bild aus, macht der Weg ohne Netz fertig", () => {
  const p = probe();
  // Die Probe ersetzt die Schleife am Objekt; die echte steht am Prototyp.
  const echteSchleife = Object.getPrototypeOf(p.app)._ringschleife;
  Object.assign(p.app.kamera, { laeuft: true, modus: "ring", lauf: 7, letzteMessung: 0, netz: {} });
  p.app._leinwandFuellen = () => ({ width: 384, height: 384 });
  p.app._kameraPausiert = () => false;
  p.fehlerFolgeSetzen(30);
  echteSchleife.call(p.app, 7);
  assert.equal(p.app.kamera.modus, "rueckfall");
  assert.equal(p.app.kamera.netz, null);
  assert.equal(p.aufrufe.fallback, 1);
});

test("einzelne Aussetzer der Erkennung wechseln den Weg nicht", () => {
  const p = probe();
  const echteSchleife = Object.getPrototypeOf(p.app)._ringschleife;
  Object.assign(p.app.kamera, { laeuft: true, modus: "ring", lauf: 3, letzteMessung: 0, uhr: 0,
    ring: { schritt: () => ({ anteil: 0, abgedeckt: [], neuerSektor: null, frontalFaellig: false }), letzteAufnahme: 0 } });
  p.app._leinwandFuellen = () => ({ width: 384, height: 384 });
  p.app._kameraPausiert = () => false;
  p.app._ringHinweisZeigen = () => {};
  p.app._fotoNachschlag = () => {};
  p.app._abschlussFaellig = () => false;
  p.fehlerFolgeSetzen(3);
  echteSchleife.call(p.app, 3);
  assert.equal(p.app.kamera.modus, "ring");
  assert.equal(p.aufrufe.fallback, 0);
});

// ---------------------------------------------------------------------------
// 5. Das Gesichtsnetz erst, wenn jemand scannen will
// ---------------------------------------------------------------------------

test("der Tipp auf den Start merkt das Netz vor - ein anderer Weg bestellt es ab", async () => {
  const p = probe();
  p.app._startTippen();
  assert.equal(p.app.aktiv, "wahl");
  assert.equal(p.aufrufe.netz, 0, "Schon beim Tipp geladen - die Karten der Landingpage koennten nichts mehr abbestellen");
  await p.clock.weiter(1600);
  assert.equal(p.aufrufe.netz, 1);

  const q = probe();
  q.app._startTippen();
  q.app._wegWaehlen("foto");
  await q.clock.weiter(5000);
  assert.equal(q.aufrufe.netz, 0, "Der Fotoweg laedt 6,9 MB, die er nie braucht");

  const r = probe();
  r.app._wegWaehlen("skanim");
  assert.equal(r.aufrufe.netz, 1, "Der Scan wartet auf ein Netz, das niemand angestossen hat");
  assert.equal(r.app.aktiv, "vorbereitung");
});

test("in der App wird das Netz trotzdem vorgeladen - nur ohne Kamera-Schnittstelle nicht", async () => {
  // Ob die App die Kamera freigibt, ist nicht am Geraet geprueft. Gibt sie
  // sie frei, sollen gerade diese Besucher den Ring mit fertigem Netz
  // bekommen - also wird nicht nach der App gefragt.
  const p = probe({ ua: UA.samsungInstagram });
  p.app._wegWaehlen("skanim");
  assert.equal(p.aufrufe.netz, 1);

  const q = probe();
  q.context.navigator.mediaDevices = undefined;
  q.app._startTippen();
  q.app._wegWaehlen("skanim");
  await q.clock.weiter(5000);
  assert.equal(q.aufrufe.netz, 0);
});

test("die Landingpage selbst holt das Netz nicht mehr", () => {
  const app = readFileSync(new URL("../apps/lifeskin/lifeskin-app.js", import.meta.url), "utf8");
  const start = app.slice(app.indexOf("\n  starte() {"), app.indexOf("\n  zeige(name"));
  const ohneKommentar = start.replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!/netzVorladen\(/.test(ohneKommentar), "starte() laedt das Gesichtsnetz fuer jeden Besucher");
});

// ---------------------------------------------------------------------------
// Aus dem Chrome-Link zurueck auf den gewaehlten Weg
// ---------------------------------------------------------------------------

test("?ls_weg=skanim fuehrt auf den Weg und verlaesst die Adresse sofort", () => {
  const p = probe({ suche: "?utm_source=ig&ls_weg=skanim" });
  assert.equal(p.app._direktWegLesen(), "skanim");
  assert.deepEqual(p.context.history.ersetzt, ["/lifeskin?utm_source=ig"]);
  assert.equal(probe({ suche: "?ls_weg=trup" }).app._direktWegLesen(), null, "Nur die zwei Wege mit Kamera");
  assert.equal(probe({ suche: "" }).app._direktWegLesen(), null);
});
