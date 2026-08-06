import assert from "node:assert/strict";
import test from "node:test";
import {
  captureVideoPosterFileCore,
  captureVideoPosterFromElementCore
} from "../apps/menyra-social/core/media/video-poster-utils.js";

// Nur so viel Browser, wie das Einfangen wirklich anfasst: ein <video>, das
// Bilder melden kann, ein <canvas>, das zeichnet, und ein Dokument, das beides
// aufnimmt.
class FakeVideo {
  constructor({ withFrameCallback = true, videoWidth = 3840, videoHeight = 2160 } = {}) {
    this.tagName = "VIDEO";
    this.style = { cssText: "" };
    this.attributes = new Map();
    this.listeners = new Map();
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
    this.readyState = 0;
    this.playCount = 0;
    this.pauseCount = 0;
    this.loadCount = 0;
    this.removed = false;
    this.frameCallbacks = [];
    if (!withFrameCallback) this.requestVideoFrameCallback = undefined;
  }

  set src(value) {
    this._src = value;
  }

  get src() {
    return this._src || "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }

  removeEventListener(type, handler) {
    const list = this.listeners.get(type) || [];
    const index = list.indexOf(handler);
    if (index > -1) list.splice(index, 1);
  }

  emit(type) {
    (this.listeners.get(type) || []).slice().forEach((handler) => handler({ type }));
  }

  requestVideoFrameCallback(callback) {
    this.frameCallbacks.push(callback);
  }

  // Der Browser hat ein Bild gezeichnet.
  paintFrame() {
    this.readyState = 2;
    const callbacks = this.frameCallbacks.slice();
    this.frameCallbacks.length = 0;
    callbacks.forEach((callback) => callback(0, {}));
    this.emit("loadeddata");
  }

  play() {
    this.playCount += 1;
    return Promise.resolve();
  }

  pause() {
    this.pauseCount += 1;
  }

  load() {
    this.loadCount += 1;
  }

  remove() {
    this.removed = true;
  }
}

class FakeCanvas {
  constructor(blob) {
    this.tagName = "CANVAS";
    this.width = 0;
    this.height = 0;
    this.drawCalls = [];
    this.blob = blob;
  }

  getContext(kind) {
    if (kind !== "2d") return null;
    return {
      drawImage: (...args) => this.drawCalls.push(args)
    };
  }

  toBlob(callback, type, quality) {
    this.toBlobArgs = { type, quality };
    callback(this.blob);
  }
}

function createHarness({
  video = new FakeVideo(),
  blob = new Blob([new Uint8Array([1, 2, 3])], { type: "image/jpeg" })
} = {}) {
  const canvas = new FakeCanvas(blob);
  const appended = [];
  const timers = [];
  const frames = [];
  const docObj = {
    body: {
      appendChild: (node) => {
        appended.push(node);
        return node;
      }
    },
    documentElement: {},
    createElement(tag) {
      if (tag === "video") return video;
      if (tag === "canvas") return canvas;
      return null;
    }
  };
  const win = {
    setTimeout: (fn, ms) => {
      timers.push({ fn, ms });
      return timers.length;
    },
    clearTimeout: (id) => {
      if (timers[id - 1]) timers[id - 1].cleared = true;
    },
    requestAnimationFrame: (fn) => {
      frames.push(fn);
      return frames.length;
    }
  };
  docObj.defaultView = win;
  return { docObj, video, canvas, appended, timers, frames, runFrames: () => { while (frames.length) frames.shift()(); } };
}

function withObjectUrl(run) {
  const previous = globalThis.URL.createObjectURL;
  const previousRevoke = globalThis.URL.revokeObjectURL;
  const revoked = [];
  globalThis.URL.createObjectURL = () => "blob:fake-video";
  globalThis.URL.revokeObjectURL = (url) => revoked.push(url);
  return Promise.resolve(run(revoked)).finally(() => {
    globalThis.URL.createObjectURL = previous;
    globalThis.URL.revokeObjectURL = previousRevoke;
  });
}

const videoFile = () => new File([new Uint8Array([0, 1])], "clip.mp4", { type: "video/mp4" });

test("capture attaches the video, plays it and hands back a downscaled poster", async () => {
  const harness = createHarness();
  await withObjectUrl(async (revoked) => {
    const pending = captureVideoPosterFileCore(videoFile(), { documentObj: harness.docObj });
    // iOS dekodiert nur, was im Dokument haengt - und nur, wenn es laeuft.
    assert.equal(harness.appended[0], harness.video, "video is attached to the document");
    assert.equal(harness.video.playCount, 1, "playback is what forces the decode");
    assert.equal(harness.video.attributes.get("playsinline"), "");
    assert.equal(harness.video.attributes.get("muted"), "");

    harness.video.paintFrame();
    const poster = await pending;

    assert.ok(poster instanceof File);
    assert.equal(poster.type, "image/jpeg");
    // 3840x2160 wird auf die lange Kante 1080 gerechnet - genau die Kante, auf
    // die der Upload ohnehin herunterrechnet. Nicht in 4K gezeichnet und gepackt.
    assert.equal(harness.canvas.width, 1080);
    assert.equal(harness.canvas.height, 608);
    assert.equal(harness.canvas.toBlobArgs.type, "image/jpeg");
    // Danach bleibt nichts im Dokument stehen.
    assert.equal(harness.video.removed, true);
    assert.equal(harness.video.pauseCount >= 1, true);
    assert.deepEqual(revoked, ["blob:fake-video"]);
  });
});

test("without requestVideoFrameCallback loadeddata plus one frame is enough", async () => {
  const harness = createHarness({ video: new FakeVideo({ withFrameCallback: false }) });
  await withObjectUrl(async () => {
    const pending = captureVideoPosterFileCore(videoFile(), { documentObj: harness.docObj });
    harness.video.readyState = 2;
    harness.video.emit("loadeddata");
    harness.runFrames();
    const poster = await pending;
    assert.ok(poster instanceof File);
  });
});

test("a timeout still uses a frame that is already there", async () => {
  const harness = createHarness();
  await withObjectUrl(async () => {
    const pending = captureVideoPosterFileCore(videoFile(), { documentObj: harness.docObj });
    // Es liegt ein Bild vor, nur gemeldet hat es niemand.
    harness.video.readyState = 2;
    harness.timers[0].fn();
    const poster = await pending;
    assert.ok(poster instanceof File, "der Zeitablauf wirft ein vorhandenes Bild nicht weg");
  });
});

test("a video that never delivers a frame ends without a poster instead of hanging", async () => {
  const harness = createHarness();
  await withObjectUrl(async () => {
    const pending = captureVideoPosterFileCore(videoFile(), { documentObj: harness.docObj });
    harness.timers[0].fn();
    assert.equal(await pending, null);
    assert.equal(harness.video.removed, true);
  });
});

test("a broken file ends without a poster", async () => {
  const harness = createHarness();
  await withObjectUrl(async () => {
    const pending = captureVideoPosterFileCore(videoFile(), { documentObj: harness.docObj });
    harness.video.emit("error");
    assert.equal(await pending, null);
  });
});

test("the running preview video is a second source for the poster", async () => {
  const harness = createHarness();
  harness.video.readyState = 2;
  harness.video.videoWidth = 1080;
  harness.video.videoHeight = 1920;

  const poster = await captureVideoPosterFromElementCore(harness.video, { documentObj: harness.docObj });

  assert.ok(poster instanceof File);
  assert.equal(harness.canvas.width, 608);
  assert.equal(harness.canvas.height, 1080);
  // Das laufende Video wird dabei nicht angefasst.
  assert.equal(harness.video.playCount, 0);
  assert.equal(harness.video.pauseCount, 0);
  assert.equal(harness.video.removed, false);
});

test("a preview without a painted frame hands back nothing", async () => {
  const harness = createHarness();
  harness.video.readyState = 1;

  assert.equal(await captureVideoPosterFromElementCore(harness.video, { documentObj: harness.docObj }), null);
  assert.equal(harness.canvas.drawCalls.length, 0);
});
