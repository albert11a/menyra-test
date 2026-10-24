import { escapeHtml } from "./heart-ui-utils.js";
import { vergleichLesen, vergleichUrl } from "../../shared/lifeskin-vergleich.js";

export function renderBefundVergleich(wert) {
  const paar = vergleichLesen(wert);
  return `<p class="heart-lifeskin-hinweis">Unter Woche 4 auf dieser persönlichen Therapieseite. Nur sichtbar, wenn beide Bilder vorhanden sind. Nach dem Hochladen den Befund speichern.</p>
    <div class="heart-vergleich">${["vorher", "nachher"].map((seite) => `
      <div data-vergleich-slot="${seite}">
        <strong>${seite === "vorher" ? "Vorher · Para" : "Nachher · Pas"}</strong>
        <input type="text" hidden data-vergleich-url="${seite}" value="${escapeHtml(paar[seite])}">
        <img data-vergleich-vorschau ${paar[seite] ? `src="${escapeHtml(paar[seite])}"` : "hidden"} alt="${seite === "vorher" ? "Vorher" : "Nachher"}" loading="lazy">
        <button type="button" class="heart-befund__knopf" data-action="lifeskin-vergleich-upload">Foto hochladen</button>
        <button type="button" class="heart-befund__knopf" data-action="lifeskin-vergleich-entfernen"${paar[seite] ? "" : " hidden"}>Entfernen</button>
        <small data-vergleich-status role="status" aria-live="polite"></small>
      </div>`).join("")}</div>`;
}
export function vergleichVorschau(feld) {
  const slot = feld?.closest("[data-vergleich-slot]");
  if (!slot) return;
  const url = vergleichUrl(feld.value);
  const bild = slot.querySelector("[data-vergleich-vorschau]");
  bild.hidden = !url;
  if (url) bild.src = url;
  else bild.removeAttribute("src");
  slot.querySelector('[data-action="lifeskin-vergleich-entfernen"]').hidden = !url;
}
export async function vergleichHochladen(slot, datei, upload) {
  if (!slot || slot.dataset.uploading === "ja") return;
  const status = slot.querySelector("[data-vergleich-status]");
  const buttons = [...slot.querySelectorAll("button")];
  slot.dataset.uploading = "ja";
  buttons.forEach((b) => { b.disabled = true; });
  status.textContent = "Foto wird verkleinert und hochgeladen …";
  try {
    if (!datei?.type?.startsWith("image/")) throw new Error("Bitte ein Foto auswählen.");
    if (datei.size > 20 * 1024 * 1024) throw new Error("Das Foto darf höchstens 20 MB groß sein.");
    const ergebnis = await upload(datei);
    const url = vergleichUrl(ergebnis?.bild);
    if (!url) throw new Error("Upload fehlgeschlagen. Bitte erneut versuchen.");
    const feld = slot.querySelector("[data-vergleich-url]");
    feld.value = url;
    vergleichVorschau(feld);
    feld.dispatchEvent(new Event("input", { bubbles: true }));
    status.textContent = "Hochgeladen. Befund speichern, um das Foto zu übernehmen.";
  } catch (fehler) { status.textContent = fehler?.message || "Upload fehlgeschlagen."; }
  finally {
    delete slot.dataset.uploading;
    buttons.forEach((b) => { b.disabled = false; });
  }
}
