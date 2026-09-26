import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const quelle = readFileSync(new URL("../apps/lifeskin/lifeskin-foto.js", import.meta.url), "utf8").replace(/^export /gm, "") + "\nglobalThis.FotoTest = Flaechenkamera; globalThis.jpegTest = alsJpeg;";
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


function probe({ gum, rechte } = {}) {
  const clock = uhr();
  const stream = strom();
  stream.spur.enabled = true;
  const document = ziel({ hidden: false });
  const video = ziel({ srcObject: null, videoWidth: 720, videoHeight: 1280,
    readyState: 2, paused: true, ended: false, currentTime: 0,
    setAttribute() {}, play() { this.paused = false; return new Promise(() => {}); },
    pause() { this.paused = true; } });
  const fehler = [], bereit = [];
  const context = vm.createContext({ ...clock, console });
  vm.runInContext(quelle, context);
  const kamera = new context.FotoTest({ video, dokument: document,
    medien: { getUserMedia: gum || (async () => stream) }, rechte,
    beiFehler: (key) => fehler.push(key), beiBereit: (ok) => bereit.push(ok) });
  const frames = clock.setInterval(() => { if (!video.paused) video.currentTime += 0.05; }, 50);
  return { kamera, clock, stream, video, document, fehler, bereit, context,
    freeze() { clock.clearInterval(frames); },
    stop() { kamera.stoppe(); clock.clearInterval(frames); } };
}
async function laufend() {
  const p = probe(); const start = p.kamera.starte();
  await p.clock.weiter(600); assert.equal(await start, true); return p;
}

test("Foto: eingefrorenes Bild kann nicht aufgenommen werden und endet mit Hilfe", async () => {
  const p = await laufend(); p.freeze();
  await p.clock.weiter(3000);
  assert.equal(p.kamera.aufnehmen(), null);
  await p.clock.weiter(8000);
  assert.deepEqual(p.fehler, ["fehlerKameraBild"]);
  assert.equal(p.stream.spur.stops, 1);
  p.stop(); assert.equal(p.clock.timer.size, 0);
});

test("Foto: beendeter Track zeigt Hilfe und raeumt alle Beobachter auf", async () => {
  const p = await laufend(); p.stream.spur.readyState = "ended";
  await p.clock.weiter(1000);
  assert.deepEqual(p.fehler, ["fehlerKameraUnterbrochen"]);
  assert.equal(p.video.srcObject, null);
  p.stop(); assert.equal(p.clock.timer.size, 0);
  assert.equal(p.document.anzahl(), 0);
});

test("Foto: Appwechsel pausiert Fristen, startet Video neu und wartet auf neue Frames", async () => {
  const p = await laufend();
  p.document.hidden = true; p.document.sende("visibilitychange");
  p.video.paused = true; await p.clock.weiter(60000);
  assert.deepEqual(p.fehler, []);
  assert.equal(p.kamera.bereit, false);
  p.document.hidden = false; p.document.sende("visibilitychange");
  assert.equal(p.kamera.bereit, false);
  await p.clock.weiter(1000);
  assert.equal(p.video.paused, false);
  assert.equal(p.kamera.bereit, true);
  assert.deepEqual(p.fehler, []); p.stop();
});

test("Foto: stumme oder deaktivierte Tracks liefern keine Aufnahme", async () => {
  const p = await laufend();
  p.stream.spur.enabled = false; assert.equal(p.kamera.aufnehmen(), null);
  p.stream.spur.enabled = true; p.stream.spur.muted = true;
  assert.equal(p.kamera.aufnehmen(), null); p.stop();
});

test("Foto: keine Videodaten enden nach zehn sichtbaren Sekunden", async () => {
  const p = probe(); p.video.readyState = 1;
  const start = p.kamera.starte(); await p.clock.weiter(11000);
  assert.equal(await start, false);
  assert.deepEqual(p.fehler, ["fehlerKameraBild"]);
  p.stop(); assert.equal(p.clock.timer.size, 0);
});

test("Foto: Freigabe-Timeout schliesst einen nachtraeglich gelieferten Stream", async () => {
  const pending = aufgeschoben(); const p = probe({ gum: () => pending.promise });
  const start = p.kamera.starte(); await p.clock.weiter(30000);
  assert.equal(await start, false);
  pending.resolve(p.stream); await p.clock.pumpen();
  assert.equal(p.stream.spur.stops, 1);
  assert.deepEqual(p.fehler, ["fehlerKameraWartet"]); p.stop();
});

for (const stelle of ["getContext", "drawImage", "toDataURL"]) {
  test(`JPEG: ${stelle}-Fehler gibt Speicher frei und liefert null`, () => {
    const p = probe();
    const canvas = { width: 0, height: 0,
      getContext() { if (stelle === "getContext") return null;
        return { drawImage() { if (stelle === "drawImage") throw new Error("frame lost"); } }; },
      toDataURL() { throw new Error("encoding failed"); } };
    const result = p.context.jpegTest({}, { breite: 720, hoehe: 1280,
      dokument: { createElement: () => canvas } });
    assert.equal(result, null);
    assert.equal(canvas.width, 0); assert.equal(canvas.height, 0); p.stop();
  });
}

test("JPEG: leere Canvas-Ausgabe wird nicht als Aufnahme akzeptiert", () => {
  const p = probe();
  const canvas = { width: 0, height: 0, getContext: () => ({ drawImage() {} }), toDataURL: () => "data:," };
  assert.equal(p.context.jpegTest({}, { breite: 720, hoehe: 1280, dokument: { createElement: () => canvas } }), null);
  assert.equal(canvas.width, 0); p.stop();
});

// DIE AUFNAHME IST DAS, WAS IM RAHMEN STAND.
//
// Gemeldet: Mit der vorderen Kamera sprang das Bild beim Ausloesen
// seitenverkehrt um - die Vorschau war ein Spiegel, die Aufnahme nicht.
// Geprueft an der echten Klasse: vorne wird Foto UND Kachel gespiegelt,
// hinten keines von beiden.
function zeichenDokument(p) {
  const leinwaende = [];
  p.document.createElement = () => {
    const befehle = [];
    const leinwand = { width: 0, height: 0, befehle,
      getContext: () => ({
        translate: (...a) => befehle.push(["translate", ...a]),
        scale: (...a) => befehle.push(["scale", ...a]),
        drawImage: () => befehle.push(["drawImage"])
      }),
      toDataURL: () => "data:image/jpeg;base64,AAAA" };
    leinwaende.push(leinwand);
    return leinwand;
  };
  return leinwaende;
}

for (const [richtung, gespiegelt] of [["user", true], ["environment", false]]) {
  test(`Foto: ${richtung === "user" ? "vordere" : "hintere"} Kamera nimmt ${gespiegelt ? "gespiegelt" : "ungespiegelt"} auf - wie die Vorschau`, async () => {
    const p = probe();
    const leinwaende = zeichenDokument(p);
    const start = p.kamera.starte(richtung);
    await p.clock.weiter(600);
    assert.equal(await start, true);
    assert.equal(p.kamera.richtung, richtung);
    const aufnahme = p.kamera.aufnehmen();
    assert.ok(aufnahme?.foto && aufnahme?.mini, "Keine Aufnahme");
    assert.equal(leinwaende.length, 2, "Foto und Kachel");
    for (const leinwand of leinwaende) {
      const umgedreht = leinwand.befehle.some(([name, x]) => name === "scale" && x === -1);
      assert.equal(umgedreht, gespiegelt);
    }
    p.stop();
  });
}

// DAS BILD AUS DER KAMERA-APP (Dateifeld) - 12 Megapixel und mehr.
//
// Es wird ueber eine Objekt-Adresse geoeffnet statt als Text von einigen
// Megabyte gelesen, die Adresse danach freigegeben, und eine Datei ohne
// Typangabe (manche Android-Webansichten) wird nicht verworfen.
function dateiProbe({ laedt = true } = {}) {
  const adressen = { erzeugt: [], freigegeben: [] };
  const context = vm.createContext({
    console,
    URL: {
      createObjectURL: (datei) => { const a = `blob:test/${adressen.erzeugt.length}`; adressen.erzeugt.push([a, datei]); return a; },
      revokeObjectURL: (a) => adressen.freigegeben.push(a)
    },
    FileReader: class { readAsDataURL() { throw new Error("Der Text-Umweg wurde benutzt"); } },
    Image: class {
      set src(wert) {
        this.quelle = wert;
        Promise.resolve().then(() => {
          if (!laedt) { this.onerror?.(); return; }
          Object.assign(this, { naturalWidth: 3024, naturalHeight: 4032 });
          this.onload?.();
        });
      }
      get src() { return this.quelle; }
    }
  });
  vm.runInContext(readFileSync(new URL("../apps/lifeskin/lifeskin-foto.js", import.meta.url), "utf8")
    .replace(/^export /gm, "") + "\nglobalThis.dateiTest = ausDatei;", context);
  const dokument = { createElement: () => ({ width: 0, height: 0,
    getContext: () => ({ drawImage() {} }), toDataURL: () => "data:image/jpeg;base64,AAAA" }) };
  return { ausDatei: (datei) => context.dateiTest(datei, { dokument }), adressen };
}

test("Handykamera: Bild ohne Typangabe wird gelesen, verkleinert und die Adresse freigegeben", async () => {
  const p = dateiProbe();
  const aufnahme = await p.ausDatei({ type: "" });
  assert.ok(aufnahme?.foto, "Ein Bild ohne Typ wurde verworfen");
  assert.equal(aufnahme.foto.breite, 1440);
  assert.equal(aufnahme.foto.hoehe, 1920);
  assert.equal(aufnahme.mini.breite, 160);
  assert.equal(p.adressen.erzeugt.length, 1);
  assert.deepEqual(p.adressen.freigegeben, [p.adressen.erzeugt[0][0]], "Die Objekt-Adresse bleibt im Speicher");
});

test("Handykamera: kein Bild, kein Foto - und nichts bleibt liegen", async () => {
  assert.equal(await dateiProbe().ausDatei({ type: "application/pdf" }), null);
  const p = dateiProbe({ laedt: false });
  assert.equal(await p.ausDatei({ type: "image/heic" }), null);
  assert.equal(p.adressen.freigegeben.length, 1);
});

test("Foto: ein ruhiges Bild ist nach 200 ms bereit, nicht erst nach 450", async () => {
  const p = probe(); const start = p.kamera.starte();
  let fertig = null;
  start.then((ok) => { fertig = ok; });
  await p.clock.weiter(120);
  assert.equal(fertig, null, "Bereit, bevor das Bild ruhig stand");
  await p.clock.weiter(180);
  assert.equal(fertig, true, "Das Bild steht, aber der Spinner laeuft weiter");
  p.stop();
});

// Die Kamera ist freigegeben (keine Systemfrage mehr offen), aber
// getUserMedia antwortet nicht: Das ist ein Haenger, und dafuer gibt es
// keine 30 Sekunden Spinner.
function freigabe(anfang) {
  const horcher = new Set();
  const status = { state: anfang,
    addEventListener: (_n, fn) => horcher.add(fn), removeEventListener: (_n, fn) => horcher.delete(fn) };
  return { status, horcher, rechte: { query: async () => status },
    setze(neu) { status.state = neu; for (const fn of [...horcher]) fn(); } };
}

test("Foto: freigegeben und keine Antwort - Hilfe nach 8 statt 30 Sekunden", async () => {
  const f = freigabe("granted");
  const pending = aufgeschoben();
  const p = probe({ gum: () => pending.promise, rechte: f.rechte });
  const start = p.kamera.starte();
  await p.clock.weiter(7900);
  assert.deepEqual(p.fehler, []);
  await p.clock.weiter(200);
  assert.equal(await start, false);
  assert.deepEqual(p.fehler, ["fehlerKameraWartet"]);
  assert.equal(f.horcher.size, 0, "Der Horcher auf die Freigabe bleibt haengen");
  p.stop(); assert.equal(p.clock.timer.size, 0);
});

test("Foto: offene Systemfrage behaelt ihre Zeit, nach dem Zulassen zaehlen 8 Sekunden", async () => {
  const f = freigabe("prompt");
  const pending = aufgeschoben();
  const p = probe({ gum: () => pending.promise, rechte: f.rechte });
  const start = p.kamera.starte();
  await p.clock.weiter(15000);
  assert.deepEqual(p.fehler, [], "Wer die Frage liest, bekommt schon einen Fehler");
  f.setze("granted");
  await p.clock.weiter(7900);
  assert.deepEqual(p.fehler, []);
  await p.clock.weiter(200);
  assert.equal(await start, false);
  assert.deepEqual(p.fehler, ["fehlerKameraWartet"]);
  p.stop();
});

test("Foto: schwarzer erster Strom wird still neu geholt", async () => {
  let n = 0;
  const p = probe({ gum: async () => {
    n++;
    p.video.readyState = n === 1 ? 1 : 2;
    const s = strom(); s.spur.enabled = true; return s;
  } });
  const start = p.kamera.starte();
  await p.clock.weiter(5600);
  assert.equal(await start, true);
  assert.equal(n, 2);
  assert.deepEqual(p.fehler, []);
  p.stop();
});
