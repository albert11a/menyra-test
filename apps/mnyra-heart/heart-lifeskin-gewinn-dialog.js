// These dialogs live outside Heart's morph root. Live data updates cannot
// replace an open form, dismiss it or reset its unsaved inputs.
import { adsCent, datumGueltig, gewinnGrenzen } from "./heart-lifeskin-gewinn.js";
import { statistikTag } from "../../shared/lifeskin-statistik.js";
import { escapeHtml } from "./heart-ui-utils.js";

const labels = { "": "Skinreact", lifeskinshop: "Acne duo", lifeskin2: "Lifeskin 2" };
const datum = (tag) => datumGueltig(tag) ? tag.split("-").reverse().join(".") : "";
export const gewinnDatumsLabel = (von, bis) => von === bis ? datum(von) : `${datum(von)} – ${datum(bis)}`;

export function kalenderTage(monat) {
  if (!datumGueltig(`${monat}-01`)) return [];
  const erster = new Date(`${monat}-01T12:00:00Z`);
  const offset = (erster.getUTCDay() + 6) % 7;
  const anzahl = new Date(Date.UTC(erster.getUTCFullYear(), erster.getUTCMonth() + 1, 0)).getUTCDate();
  return [...Array(offset).fill(""), ...Array.from({ length: anzahl }, (_, i) => `${monat}-${String(i + 1).padStart(2, "0")}`)];
}
export function kalenderKlick(stand, tag) {
  if (!datumGueltig(tag)) return stand;
  if (!stand.anker) return { ...stand, von: tag, bis: tag, anker: tag };
  return { ...stand, von: [stand.anker, tag].sort()[0], bis: [stand.anker, tag].sort()[1], anker: "" };
}
function dialogOeffnen(titel, inhalt) {
  document.querySelector("dialog.heart-gewinn-dialog")?.close();
  const rueckkehr = document.activeElement;
  const el = document.createElement("dialog");
  el.className = "heart-gewinn-dialog";
  el.setAttribute("aria-label", titel);
  el.innerHTML = `<div class="heart-gewinn-dialog__kopf"><h2>${escapeHtml(titel)}</h2><button type="button" data-dialog-zu aria-label="Schließen">×</button></div>${inhalt}`;
  el.addEventListener("click", (e) => { if (e.target.closest("[data-dialog-zu]")) el.close(); });
  el.addEventListener("close", () => { el.remove(); if (rueckkehr?.isConnected) rueckkehr.focus({ preventScroll: true }); }, { once: true });
  document.body.append(el);
  el.showModal();
  return el;
}

export function oeffneGewinnKalender({ filter = {}, uebernehmen }) {
  const heute = statistikTag(new Date().toISOString());
  const grenzen = gewinnGrenzen(filter) || { von: heute, bis: heute };
  let stand = { monat: (grenzen.von || heute).slice(0, 7), von: grenzen.von || heute, bis: grenzen.bis === "9999-12-31" ? heute : grenzen.bis, anker: "" };
  const el = dialogOeffnen("Zeitraum wählen", '<div data-gewinn-kalender></div>');
  const zeichnen = () => {
    const monatsname = new Intl.DateTimeFormat("de-AT", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${stand.monat}-01T12:00:00Z`));
    el.querySelector("[data-gewinn-kalender]").innerHTML = `
      <p class="heart-gewinn-dialog__hilfe">Einen Tag antippen oder Start- und Endtag für einen Zeitraum wählen.</p>
      <div class="heart-gewinn-kalender__monat"><button type="button" data-monat="-1" aria-label="Vorheriger Monat">‹</button><b aria-live="polite">${escapeHtml(monatsname)}</b><button type="button" data-monat="1" aria-label="Nächster Monat">›</button></div>
      <div class="heart-gewinn-kalender__raster">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((w) => `<small>${w}</small>`).join("")}
      ${kalenderTage(stand.monat).map((tag) => tag ? `<button type="button" data-kalender-tag="${tag}" aria-label="${datum(tag)}" aria-pressed="${tag >= stand.von && tag <= stand.bis}" ${tag === heute ? 'aria-current="date"' : ""} class="${tag >= stand.von && tag <= stand.bis ? "ist-bereich" : ""} ${tag === stand.von || tag === stand.bis ? "ist-rand" : ""}">${Number(tag.slice(-2))}</button>` : '<span aria-hidden="true"></span>').join("")}</div>
      <p class="heart-gewinn-dialog__auswahl" aria-live="polite">${escapeHtml(gewinnDatumsLabel(stand.von, stand.bis))}</p>
      <div class="heart-gewinn-dialog__aktionen"><button type="button" data-dialog-zu>Abbrechen</button><button type="button" data-kalender-uebernehmen class="ist-haupt">Übernehmen</button></div>`;
  };
  el.addEventListener("click", (e) => {
    const tag = e.target.closest("[data-kalender-tag]")?.getAttribute("data-kalender-tag");
    if (tag) { stand = kalenderKlick(stand, tag); zeichnen(); el.querySelector(`[data-kalender-tag="${tag}"]`)?.focus({ preventScroll: true }); }
    const richtung = e.target.closest("[data-monat]")?.getAttribute("data-monat");
    if (richtung) {
      const d = new Date(`${stand.monat}-01T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + Number(richtung));
      if (d.getUTCFullYear() < 1900 || d.getUTCFullYear() > 2100) return;
      stand = { ...stand, monat: d.toISOString().slice(0, 7) }; zeichnen();
      el.querySelector(`[data-monat="${richtung}"]`)?.focus({ preventScroll: true });
    }
    if (e.target.closest("[data-kalender-uebernehmen]")) {
      uebernehmen({ zeit: "vonbis", von: stand.von, bis: stand.bis }); el.close();
    }
  });
  zeichnen();
  return el;
}

export function oeffneGewinnAds({ wege, laden, speichern, nachher }) {
  const el = dialogOeffnen("Ads-Kosten hinzufügen", `<form class="heart-gewinn-dialog__form">
    <p class="heart-gewinn-dialog__hilfe">Tagesgesamtbetrag eingeben. Erneutes Speichern ersetzt den Betrag; 0 € bedeutet keine Ausgaben.</p>
    <label>Bereich<select name="weg">${wege.map((w, i) => `<option value="${escapeHtml(w)}"${i === 0 ? " selected" : ""}>${escapeHtml(labels[w] || w)}</option>`).join("")}</select></label>
    <label>Datum<input type="date" name="datum" required value="${statistikTag(new Date().toISOString())}"></label>
    <label>Ads-Kosten (€)<input type="text" name="betrag" inputmode="decimal" autocomplete="off" placeholder="z. B. 25,50" required></label>
    <p data-ads-hinweis class="heart-gewinn-dialog__hilfe" aria-live="polite">Gespeicherte Tagesbeträge werden geladen …</p>
    <p data-ads-fehler role="alert"></p>
    <button type="button" data-ads-neuladen hidden>Erneut laden</button>
    <div class="heart-gewinn-dialog__aktionen"><button type="button" data-dialog-zu>Abbrechen</button><button type="submit" class="ist-haupt" disabled>Speichern</button></div>
    </form>`);
  const form = el.querySelector("form"), submit = el.querySelector('[type="submit"]');
  const weg = form.querySelector('[name="weg"]'), tag = form.querySelector('[name="datum"]'), betrag = form.querySelector('[name="betrag"]');
  let ads = [], bereit = false, sendet = false;
  const fehler = el.querySelector("[data-ads-fehler]"), hinweis = el.querySelector("[data-ads-hinweis]");
  const vorhanden = () => {
    const a = ads.find((a) => a.weg === weg.value && a.tag === tag.value);
    hinweis.textContent = a ? `Gespeichert: ${(a.cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €. Der neue Betrag ersetzt diesen Tageswert.` : "Noch kein Betrag für diesen Tag gespeichert.";
  };
  const neuLaden = async () => {
    bereit = false; submit.disabled = true; fehler.textContent = "";
    el.querySelector("[data-ads-neuladen]").hidden = true;
    try { ads = await laden(); if (!el.isConnected) return; bereit = true; submit.disabled = false; vorhanden(); }
    catch { if (!el.isConnected) return; fehler.textContent = "Tagesbeträge konnten nicht geladen werden. Bitte erneut versuchen."; el.querySelector("[data-ads-neuladen]").hidden = false; }
  };
  el.addEventListener("change", (e) => { if (bereit && (e.target === weg || e.target === tag)) vorhanden(); });
  el.addEventListener("click", (e) => { if (e.target.closest("[data-ads-neuladen]")) neuLaden(); });
  el.addEventListener("cancel", (e) => { if (sendet) e.preventDefault(); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); if (!bereit || sendet) return;
    const cent = adsCent(betrag.value);
    if (!datumGueltig(tag.value) || cent == null) { fehler.textContent = "Bitte Datum und Betrag mit höchstens zwei Nachkommastellen eingeben."; return; }
    sendet = true; submit.disabled = true; submit.textContent = "Speichert …"; fehler.textContent = "";
    for (const f of el.querySelectorAll("[data-dialog-zu], input, select")) f.disabled = true;
    try { const wert = await speichern({ tag: tag.value, weg: weg.value, cent }); nachher([...ads.filter((a) => a.weg !== wert.weg || a.tag !== wert.tag), wert]); el.close(); }
    catch (err) { fehler.textContent = err?.message || "Speichern fehlgeschlagen. Deine Eingabe bleibt erhalten."; }
    finally { sendet = false; submit.disabled = false; submit.textContent = "Speichern"; for (const f of el.querySelectorAll("[data-dialog-zu], input, select")) f.disabled = false; }
  });
  neuLaden();
  return el;
}
