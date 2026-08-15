// Mnyra GO im Panel - die Grenze zum Nachladen.
//
// Dasselbe Muster wie beim Marktplatz (core/marketplace/marketplace-runtime-
// boundary.js): Ein kleines Modul steht fest im Bundle, die eigentliche Seite
// kommt erst, wenn jemand den Tab oeffnet. Bis dahin stehen die Umrisse der
// spaeteren Karten da - kein Satz, der nichts ueber die Form sagt, damit beim
// Umschalten nichts springt.
//
// Ohne diese Grenze waere GO in dem Augenblick im Startbundle gelandet, in
// dem es ein richtiger Tab wurde - auch fuer jeden, der das Feature gar nicht
// eingeschaltet hat.

import { MNYRA_GO_ENABLED } from "../../../../shared/config/feature-flags.js";

const EMPTY_RENDER = () => "";

function asFn(candidate, fallback = EMPTY_RENDER) {
  return typeof candidate === "function" ? candidate : fallback;
}

function renderLoadingView() {
  return `
    <div class="p-6 app-main-content-safe" data-go-admin-skeleton>
      <div class="mb-6">
        <div class="h-2.5 w-16 rounded-full bg-slate-100"></div>
        <div class="mt-2 h-6 w-32 rounded-lg bg-slate-100"></div>
      </div>
      <div class="mb-6 grid grid-cols-2 gap-3">
        ${[0, 1, 2, 3].map(() => `
          <div class="bg-white rounded-[1.8rem] p-4 border border-slate-100 shadow-sm">
            <div class="h-2.5 w-12 rounded-full bg-slate-100"></div>
            <div class="mt-3 h-7 w-10 rounded-lg bg-slate-100"></div>
          </div>
        `).join("")}
      </div>
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="h-3 w-24 rounded-full bg-slate-100"></div>
        <div class="mt-4 space-y-3">
          ${[0, 1].map(() => `<div class="h-20 rounded-[1.6rem] bg-slate-50 border border-slate-100"></div>`).join("")}
        </div>
      </div>
    </div>
  `;
}

export function createGoAdminBoundary(options = {}) {
  const render = asFn(options.renderFn, () => {});
  let controller = null;
  let controllerPromise = null;

  function ensureController() {
    if (controller) return Promise.resolve(controller);
    if (controllerPromise) return controllerPromise;
    controllerPromise = import("./go-admin-view-controller.js")
      .then((module) => {
        controller = module.createGoAdminViewController(options);
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

  return {
    renderGoAdminView() {
      // Ist GO aus, gibt es diesen Tab nicht - und der Bundler nimmt mit
      // dieser Zeile den ganzen Rest gleich mit heraus.
      if (!MNYRA_GO_ENABLED) return "";
      if (!controller) {
        void ensureController().catch(() => null);
        return renderLoadingView();
      }
      return controller.renderGoAdminView();
    },
    preload() {
      if (!MNYRA_GO_ENABLED) return;
      void ensureController().catch(() => null);
    },
    disconnect() {
      controller?.disconnect?.();
    }
  };
}
