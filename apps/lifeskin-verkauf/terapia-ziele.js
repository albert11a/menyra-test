import { vergleichVollstaendig } from "../../shared/lifeskin-vergleich.js";

// Presentation goals only. Report content changes the illustration, never
// manufactures a patient-specific probability, measurement or forecast.
export const WOCHENZIELE = [[22, 35], [47, 56], [72, 73], [92, 85]];

export function zieltextLesen(bericht = {}) {
  return String(bericht.synimi28 || bericht.gjetjaKryesore || "")
    .replace(/Arritja e plot[eë] e k[eë]tij synimi nuk mund t[eë] garantohet[.!]?/giu, "")
    .replace(/\s+/g, " ").trim();
}

export function hautPfad(woche, kontext = "") {
  let saat = 0;
  for (const zeichen of String(kontext)) saat = (saat * 31 + zeichen.charCodeAt(0)) >>> 0;
  const tiefe = (5 - woche) * 3;
  return `M0 31 Q30 ${29 - tiefe} ${65 + saat % 20} 30 T150 29 Q190 ${28 - tiefe} ${245 + saat % 25} 30 T340 30 L340 44 L0 44Z`;
}

export function zeigeTherapieZiele(wurzel, { sichtbar, bericht = {}, vergleich } = {}) {
  if (!wurzel) return;
  wurzel.hidden = !sichtbar;
  if (!sichtbar) return;
  const text = zieltextLesen(bericht);
  wurzel.querySelector("[data-zieltext]").textContent = text || "Synimet per lekuren tende pas 4 javeve.";
  const paar = vergleichVollstaendig(vergleich);
  wurzel.querySelector(".terapia-ziele__reihe").classList.toggle("terapia-ziele__reihe--einzeln", !paar);
  wurzel.querySelector("[data-zielnavigation]").hidden = !paar;
  const setzen = (woche) => {
    const ziele = WOCHENZIELE[woche - 1];
    wurzel.querySelectorAll("[data-zielwoche]").forEach((knopf) => {
      knopf.setAttribute("aria-pressed", String(Number(knopf.dataset.zielwoche) === woche));
    });
    wurzel.querySelector("[data-hautoberflaeche]").setAttribute("d", hautPfad(woche, text));
    wurzel.querySelector("[data-hautpunkte]").setAttribute("opacity", String(.86 - woche * .16));
    wurzel.querySelectorAll(".terapia-ziele__metrik").forEach((metrik, i) => {
      metrik.querySelector("[data-zielwert]").textContent = `${ziele[i]}%`;
      metrik.querySelector("[role=progressbar]").setAttribute("aria-valuenow", String(ziele[i]));
      metrik.querySelector("i").style.width = `${ziele[i]}%`;
    });
    wurzel.querySelector("[data-zielstatus]").textContent = `Java ${woche}: synimi i qetesimit ${ziele[0]}%, hidratimi ${ziele[1]}%.`;
  };
  wurzel.querySelectorAll("[data-zielwoche]").forEach((knopf) => {
    knopf.onclick = () => setzen(Number(knopf.dataset.zielwoche));
  });
  const weiter = wurzel.querySelector("[data-zielweiter]");
  weiter.onclick = () => {
    const reihe = wurzel.querySelector(".terapia-ziele__reihe");
    const zurueck = reihe.scrollLeft > 20;
    reihe.scrollTo({ left: zurueck ? 0 : reihe.scrollWidth, behavior: globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    weiter.textContent = zurueck ? "Shiko kujdesin →" : "← Shiko foton";
  };
  setzen(4);
}
