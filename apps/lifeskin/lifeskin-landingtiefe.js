// DIE LANDINGPAGE MESSEN: welche der neun Bildschirme im Bild standen und
// ob jemand vor dem Weiter gelesen hat (Regeln und Namen:
// shared/lifeskin-landingtiefe.js).
//
// LEICHT, UND DAS IST DIE BEDINGUNG: ein IntersectionObserver fuer neun
// Abschnitte, kein scroll-Lauscher. Ein gesehener Bildschirm wird nicht
// weiter beobachtet. Geschrieben wird nur Neues - hoechstens neun kleine
// Felder und einmal das Weiter, gesammelt in der Kette der Sitzung.
// Jeder Fehler endet still: Die Messung haelt die Seite nie an.
import { LANDING_SCHIRME, schirmGesehen, landingSichtPatch, landingWeiterPatch } from "../../shared/lifeskin-landingtiefe.js";

export function starteLandingtiefe({ schreiben, dokument = globalThis.document, fenster = globalThis.window } = {}) {
  const leer = { weiter() {}, stopp() {} };
  try {
    if (typeof schreiben !== "function" || !dokument?.getElementById?.("ls-einstieg")
      || !dokument.getElementById("held") || typeof fenster?.IntersectionObserver !== "function") return leer;
    const gesehen = new Set();
    let tiefe = 0;
    let weiterGemeldet = false;
    const nrVon = new Map(LANDING_SCHIRME.map((s) => [s.id, s.nr]));
    const melden = (nr) => {
      if (gesehen.has(nr)) return;
      gesehen.add(nr);
      const patch = landingSichtPatch(nr, tiefe);
      if (!patch) return;
      tiefe = Math.max(tiefe, nr);
      try { schreiben(patch); } catch { /* still */ }
    };
    const waechter = new fenster.IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        if (!schirmGesehen(e.intersectionRect.height, e.boundingClientRect.height, fenster.innerHeight)) continue;
        const nr = nrVon.get(e.target.id);
        if (!nr) continue;
        waechter.unobserve(e.target);
        melden(nr);
      }
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
    for (const s of LANDING_SCHIRME) {
      const el = dokument.getElementById(s.id);
      if (el) waechter.observe(el);
    }
    // Auf welchem Bildschirm der Knopf lag: der, der gerade die Mitte des
    // Fensters traegt.
    const mitte = () => {
      const y = (fenster.innerHeight || 0) / 2;
      for (const s of LANDING_SCHIRME) {
        const r = dokument.getElementById(s.id)?.getBoundingClientRect?.();
        if (r && r.height > 0 && r.top <= y && r.bottom >= y) return s.nr;
      }
      return 0;
    };
    return {
      // Beim ERSTEN Tipp auf einen Startknopf: mit oder ohne Scroll.
      weiter() {
        if (weiterGemeldet) return;
        weiterGemeldet = true;
        try {
          const ab = mitte();
          if (ab) melden(ab);
          schreiben(landingWeiterPatch(gesehen, ab));
        } catch { /* still */ }
      },
      stopp() { waechter.disconnect(); }
    };
  } catch {
    return leer;
  }
}
