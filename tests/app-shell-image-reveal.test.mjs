import assert from "node:assert/strict";
import test from "node:test";

import { createAppShellRuntimeController } from "../apps/menyra-social/core/app-shell/app-shell-runtime-controller.js";

class FakeImageElement {
  constructor(src, { complete = true, naturalWidth = 120 } = {}) {
    this.dataset = {
      fallbackSrc: "",
      imageReveal: "menu",
    };
    this.style = {};
    this.currentSrc = src;
    this.complete = complete;
    this.naturalWidth = naturalWidth;
    this.listeners = new Map();
    this.attributes = new Map([["src", src]]);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  decode() {
    return Promise.resolve();
  }

  getAttribute(name) {
    return this.attributes.get(name) || "";
  }

  getBoundingClientRect() {
    return { top: 0, bottom: 16 };
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  setAttribute(name, value) {
    const safeValue = String(value || "");
    this.attributes.set(name, safeValue);
    if (name === "src") {
      this.currentSrc = safeValue;
    }
  }
}

function createRoot(images = []) {
  return {
    querySelectorAll(selector) {
      if (selector === "img[data-menu-lazy-src]") return [];
      if (selector === "img[data-fallback-src]") return images;
      return [];
    },
  };
}

function createController() {
  return createAppShellRuntimeController({
    state: {},
    PLACEHOLDER_IMAGE: "placeholder.jpg",
    windowObj: {
      addEventListener() {},
      clearTimeout() {},
      removeEventListener() {},
      setTimeout() {
        return 0;
      },
    },
  });
}

async function withFakeImageElement(task) {
  const originalImageElement = globalThis.HTMLImageElement;
  globalThis.HTMLImageElement = FakeImageElement;
  try {
    return await task();
  } finally {
    globalThis.HTMLImageElement = originalImageElement;
  }
}

test("menu image reveal does not hide an already decoded image", async () => {
  await withFakeImageElement(async () => {
    const controller = createController();
    const image = new FakeImageElement("https://cdn.example/menu-a.jpg");

    controller.bindImageFallbacks(createRoot([image]));

    assert.equal(image.style.opacity, "1");
    assert.equal(image.dataset.imageRevealReady, "1");
  });
});

test("menu image reveal keeps a previously revealed src visible across rerenders", async () => {
  await withFakeImageElement(async () => {
    const controller = createController();
    const firstImage = new FakeImageElement("https://cdn.example/menu-b.jpg");

    controller.bindImageFallbacks(createRoot([firstImage]));
    await Promise.resolve();
    await Promise.resolve();

    const rerenderedImage = new FakeImageElement(
      "https://cdn.example/menu-b.jpg",
      {
        complete: false,
        naturalWidth: 0,
      },
    );

    controller.bindImageFallbacks(createRoot([rerenderedImage]));

    assert.equal(rerenderedImage.style.opacity, "1");
    assert.equal(rerenderedImage.dataset.imageRevealReady, "1");
  });
});

test("menu image reveal still hides a new unloaded src until load", async () => {
  await withFakeImageElement(async () => {
    const controller = createController();
    const image = new FakeImageElement("https://cdn.example/menu-c.jpg", {
      complete: false,
      naturalWidth: 0,
    });

    controller.bindImageFallbacks(createRoot([image]));

    assert.equal(image.style.opacity, "0");
    assert.equal(image.dataset.imageRevealReady, "0");
  });
});

test("menu image fallback removes failed responsive candidates before retrying", async () => {
  await withFakeImageElement(async () => {
    const controller = createController();
    const image = new FakeImageElement("https://cdn.example/menu-d.jpg", {
      complete: false,
      naturalWidth: 0,
    });
    image.dataset.fallbackSrc = "https://cdn.example/menu-d.jpg";
    image.setAttribute("srcset", "https://cdn.example/menu-d.jpg 480w");
    image.setAttribute("sizes", "94vw");

    controller.bindImageFallbacks(createRoot([image]));
    image.listeners.get("error")?.();

    assert.equal(image.getAttribute("src"), "placeholder.jpg");
    assert.equal(image.getAttribute("srcset"), "");
    assert.equal(image.getAttribute("sizes"), "");
  });
});
