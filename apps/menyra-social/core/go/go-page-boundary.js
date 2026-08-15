// Mnyra GO fuer den Gast - die Grenze zum Nachladen.
//
// Dasselbe Muster wie bei der GO-Seite des Panels (go-admin-boundary.js) und
// beim Marktplatz: Ein kleines Modul steht fest im Bundle, die eigentliche
// Seite kommt erst, wenn jemand den Tab oeffnet. Bis dahin stehen die Umrisse
// der spaeteren Karte da - kein Satz, der nichts ueber die Form sagt, damit
// beim Umschalten nichts springt.
//
// Ohne diese Grenze waere GO in dem Augenblick im Startbundle gelandet, in dem
// es ein richtiger Tab wurde - auch fuer jeden, der es nie oeffnet.

import { MNYRA_GO_ENABLED } from "../../../../shared/config/feature-flags.js";

const EMPTY_RENDER = () => "";

function asFn(candidate, fallback = EMPTY_RENDER) {
  return typeof candidate === "function" ? candidate : fallback;
}

// Die Umrisse: oben die Karte mit der Frage, darunter das Bento. Dieselbe
// Geometrie wie die fertige Seite, damit beim Eintreffen nichts springt.
function renderLoadingView() {
  return `
    <div data-go-page-skeleton>
      <div style="padding:20px var(--app-content-inline,1.5rem) 34px;background:#f8fafc;">
        <div style="padding:15px 16px;border:1px solid rgba(15,23,42,0.08);border-radius:24px;background:#ffffff;box-shadow:0 26px 50px -30px rgba(15,23,42,0.34),0 10px 22px -16px rgba(15,23,42,0.22);">
          <div style="height:10px;width:64px;border-radius:999px;background:#f1f5f9;"></div>
          <div style="margin-top:7px;height:4px;border-radius:999px;background:#f8fafc;"></div>
          <div style="margin-top:18px;height:16px;width:140px;border-radius:8px;background:#f1f5f9;"></div>
          <div style="margin-top:14px;height:25px;width:96px;border-radius:8px;background:#f1f5f9;"></div>
          <div style="margin-top:18px;height:10px;border-radius:999px;background:#f8fafc;"></div>
          <div style="margin-top:22px;height:50px;border-radius:18px;background:#f1f5f9;"></div>
        </div>
      </div>
      <div style="background:#ffffff;border-top-left-radius:2.5rem;border-top-right-radius:2.5rem;padding:2.35rem var(--app-content-inline,1.5rem) 2rem;min-height:60vh;box-shadow:0 -14px 30px -24px rgba(15,23,42,0.5);">
        <div style="height:22px;width:80%;border-radius:8px;background:#eef2f7;"></div>
        <div style="margin-top:10px;height:14px;width:65%;border-radius:8px;background:#eef2f7;"></div>
        <div style="margin-top:26px;display:flex;flex-direction:column;gap:30px;">
          ${[0, 1].map(() => `
            <div>
              <div style="aspect-ratio:16 / 9;border-radius:22px;background:#f8fafc;"></div>
              <div style="margin-top:14px;height:9px;width:44px;border-radius:999px;background:#eef2f7;"></div>
              <div style="margin-top:10px;height:15px;width:78%;border-radius:8px;background:#eef2f7;"></div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

export function createGoPageBoundary(options = {}) {
  const render = asFn(options.renderFn, () => {});
  let controller = null;
  let controllerPromise = null;
  let stylesInjected = false;

  // Das Stylesheet der Seite kommt mit dem Modul, nicht aus dem generierten
  // Tailwind-Build: eine Seite, die darauf wartet, sieht beim ersten Aufbau
  // karg aus. Genau so machen es Dashboard und Composer.
  function ensureStyles() {
    if (stylesInjected) return;
    const doc = options.documentObj || (typeof document === "undefined" ? null : document);
    if (!doc?.head) return;
    return import("./go-page-render-utils.js").then((module) => {
      if (stylesInjected || doc.getElementById(module.GO_PAGE_STYLE_ELEMENT_ID)) {
        stylesInjected = true;
        return;
      }
      try {
        const style = doc.createElement("style");
        style.id = module.GO_PAGE_STYLE_ELEMENT_ID;
        style.textContent = module.GO_PAGE_CSS;
        doc.head.appendChild(style);
        stylesInjected = true;
      } catch {
        // Ohne eigenes Stylesheet sieht die Seite karg aus, aber sie steht.
      }
    }).catch(() => {});
  }

  function ensureController() {
    if (controller) return Promise.resolve(controller);
    if (controllerPromise) return controllerPromise;
    controllerPromise = import("./go-page-view-controller.js")
      .then((module) => {
        controller = module.createGoPageViewController(options);
        // Da ist sie: einmal neu zeichnen, und die Seite steht.
        render();
        return controller;
      })
      .catch((error) => {
        controllerPromise = null;
        throw error;
      });
    return controllerPromise;
  }

  function renderGoPageView() {
    if (MNYRA_GO_ENABLED !== true) return "";
    ensureStyles();
    if (!controller) {
      ensureController().catch(() => {});
      return renderLoadingView();
    }
    return controller.renderGoPageView();
  }

  // Kein zweiter Weg in eine laufende Buchung: Die Kennung steht im Zustand
  // (state.goOpenBookingId) und wird beim ersten Aufbau der Seite abgeholt.
  // Das haelt auch den Fall, in dem geklickt wird, bevor die Seite geladen
  // ist - eine Methode hier haette dann ins Leere gegriffen.
  return Object.freeze({
    renderGoPageView,
    __controller: () => controller
  });
}
