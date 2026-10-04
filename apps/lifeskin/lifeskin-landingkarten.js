// DIE KARTEN DER LANDINGPAGE /lifeskin MESSEN: welche der acht Karten im
// Bild standen (Namen und Regeln: shared/lifeskin-landingkarten.js).
//
// Wie lifeskin-landingtiefe.js: ein IntersectionObserver, kein
// scroll-Lauscher. Eine gesehene Karte wird nicht weiter beobachtet;
// geschrieben wird nur Neues - hoechstens acht kleine Felder. Der
// Beobachter misst gegen das Fenster, also auch dann, wenn die Seite in
// einem Kasten (#lp) scrollt. Jeder Fehler endet still: Die Messung haelt
// die Seite nie an.
//
// Nur auf der Seite mit diesen Karten (.lf-entry-card) - auf /lifeskin2
// und im Laden passiert hier nichts.
import { LANDING_KARTEN, landingKartePatch } from "../../shared/lifeskin-landingkarten.js";
import { schirmGesehen } from "../../shared/lifeskin-landingtiefe.js";

export function starteLandingkarten({ schreiben, dokument = globalThis.document, fenster = globalThis.window } = {}) {
  const leer = { stopp() {} };
  try {
    if (typeof schreiben !== "function" || !dokument?.querySelector?.(LANDING_KARTEN[0].wahl)
      || typeof fenster?.IntersectionObserver !== "function") return leer;
    const nrVon = new Map();
    const gemeldet = new Set();
    const waechter = new fenster.IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        if (!schirmGesehen(e.intersectionRect.height, e.boundingClientRect.height, fenster.innerHeight)) continue;
        const nr = nrVon.get(e.target);
        if (!nr || gemeldet.has(nr)) continue;
        gemeldet.add(nr);
        waechter.unobserve(e.target);
        try {
          const patch = landingKartePatch(nr);
          if (patch) schreiben(patch);
        } catch { /* still */ }
      }
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
    for (const k of LANDING_KARTEN) {
      const el = dokument.querySelector(k.wahl);
      if (!el) continue;
      nrVon.set(el, k.nr);
      waechter.observe(el);
    }
    return { stopp() { waechter.disconnect(); } };
  } catch {
    return leer;
  }
}
