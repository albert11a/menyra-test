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


function probe({ gum } = {}) {
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
    medien: { getUserMedia: gum || (async () => stream) },
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
