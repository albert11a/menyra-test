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
      <div style="padding:2.25rem 2rem calc(34px + 2.5rem);background:#635bff;">
        <div style="display:flex;flex-direction:column;height:430px;padding:20px 20px 26px;border:1px solid rgba(15,23,42,0.08);border-radius:32px;background:#ffffff;box-shadow:0 26px 50px -28px rgba(34,22,122,0.55),0 10px 22px -14px rgba(34,22,122,0.4);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:10px;border-bottom:1px solid rgba(15,23,42,0.08);">
            <div style="height:16px;width:140px;border-radius:8px;background:#f1f5f9;"></div>
            <div style="height:24px;width:70px;border-radius:8px;background:#f8fafc;"></div>
          </div>
          <div style="flex:1 1 auto;display:flex;align-items:center;justify-content:center;">
            <div style="height:44px;width:158px;border-radius:16px;background:#f1f5f9;"></div>
          </div>
          <div style="padding-top:10px;border-top:1px solid rgba(15,23,42,0.08);">
            <div style="height:50px;border-radius:18px;background:#f1f5f9;"></div>
          </div>
        </div>
      </div>
      <div style="position:relative;z-index:1;margin-top:-2.5rem;background:#ffffff;border-top-left-radius:2.5rem;border-top-right-radius:2.5rem;padding:2.35rem 2rem 2rem;min-height:60vh;box-shadow:0 -16px 34px -26px rgba(34,22,122,0.7);">
        <div style="display:flex;flex-direction:column;gap:clamp(3.5rem,20svh,11rem);">
          ${[0, 1].map(() => `
            <div>
              <div style="position:relative;aspect-ratio:4 / 3;border-radius:22px;background:#f8fafc;">
                <div style="position:absolute;top:50%;right:5%;transform:translateY(-50%);height:24px;width:38%;border-radius:8px;background:#eef2f7;"></div>
              </div>
              <div style="margin-top:clamp(2.75rem,10svh,6rem);height:21px;width:78%;border-radius:8px;background:#eef2f7;"></div>
              <div style="margin-top:8px;height:21px;width:46%;border-radius:8px;background:#eef2f7;"></div>
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

  // Holt nur das Modul. Das Neuzeichnen steht bewusst NICHT hier, sondern beim
  // Aufrufer: beim Vorwaermen sitzt der Nutzer noch im Qyteti, und ein
  // Neuaufbau der Huelle waere dort ein Eingriff ohne Anlass.
  function loadController() {
    if (controller) return Promise.resolve(controller);
    if (controllerPromise) return controllerPromise;
    controllerPromise = import("./go-page-view-controller.js")
      .then((module) => {
        controller = module.createGoPageViewController(options);
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
      // Da stehen gerade die Umrisse. Kommt das Modul an, einmal neu zeichnen -
      // und die Seite steht.
      loadController().then(() => render()).catch(() => {});
      return renderLoadingView();
    }
    return controller.renderGoPageView();
  }

  // Seit GO die dritte Pill in der Kopfzeile ist, wird die Seite genauso
  // vorgewaermt wie der Marktplatz hinter "Lokalet": in einer Leerlaufpause,
  // sobald die Pills ueberhaupt sichtbar sind. Beim Tipp steht das Modul dann
  // schon bereit, und die Umrisse blitzen nicht mehr auf.
  //
  // Anders als renderGoPageView() zeichnet das hier nichts neu - es holt nur
  // das Modul. Faellt der Abruf aus, passiert genau nichts: der naechste
  // Aufbau geht wieder ueber die Umrisse.
  function preload() {
    if (MNYRA_GO_ENABLED !== true) return Promise.resolve(null);
    ensureStyles();
    return loadController().catch(() => null);
  }

  // Kein zweiter Weg in eine laufende Buchung: Die Kennung steht im Zustand
  // (state.goOpenBookingId) und wird beim ersten Aufbau der Seite abgeholt.
  // Das haelt auch den Fall, in dem geklickt wird, bevor die Seite geladen
  // ist - eine Methode hier haette dann ins Leere gegriffen.
  return Object.freeze({
    renderGoPageView,
    preload,
    __controller: () => controller
  });
}
