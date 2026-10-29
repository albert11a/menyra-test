import { CC_FILTERS, contentRows, contentStats, contentLink, ccEscape as esc, ccImage } from "../../shared/content-creator.js";
export function renderContentCreator(state = {}) {
  const rows = contentRows(state.pages, state.visits).sort((a,b) => (b.createdMs || 0) - (a.createdMs || 0));
  const stats = contentStats(rows);
  const filter = state.filter || "all";
  const labels = Object.fromEntries(CC_FILTERS);
  const selected = rows.filter(r => filter === "all" || r.status === filter);
  const error = state.error ? `<p class="cc-error" role="alert">${esc(state.error)}</p>` : "";
  return `<section class="cc-workspace">
    <div class="cc-stats">${[["opened","Geöffnet"],["scrolled","Gescrollt"],["yes","Ja"],["no","Nein"]].map(([key,label]) => `<div class="cc-stat"><strong>${stats[key]}</strong><span>${label}</span></div>`).join("")}</div>
    <p class="cc-muted">Anzahl Lokale · Scrollen ab 50 % der Seite</p>
    ${error}
    <div class="cc-filters" aria-label="Lokale filtern">${CC_FILTERS.map(([key,label]) => `<button data-cc-action="filter" data-key="${key}" aria-pressed="${filter===key}">${label} <small>${key === "all" ? rows.length : rows.filter(r=>r.status===key).length}</small></button>`).join("")}</div>
    <div class="cc-list">${selected.map(row => `<article class="cc-row">
      <div class="cc-row-head">${ccImage(row.avatar) ? `<img class="cc-avatar" src="${ccImage(row.avatar)}" alt="" />` : `<span class="cc-avatar cc-avatar-empty">${esc(row.name?.slice(0,1))}</span>`}
      <div><h2>${esc(row.name)}</h2><span class="cc-status cc-status-${row.status}">${labels[row.status]}</span></div></div>
      <p class="cc-muted">${row.photoIds?.length || 0} Bilder${row.opened ? " · Geöffnet" : ""}${row.scrolled ? " · Gescrollt" : ""}${row.yes ? " · Antwort: Ja" : ""}${row.no ? " · Antwort: Nein" : ""}</p>
      <div class="cc-row-actions">${row.published ? `<a href="${esc(contentLink(row.id,true))}" target="_blank" rel="noopener">Vorschau</a><button data-cc-action="copy" data-id="${esc(row.id)}">Link kopieren</button>` : ""}
      ${row.published && row.workflow !== "sent" && !row.yes && !row.no ? `<button data-cc-action="sent" data-id="${esc(row.id)}">Als verschickt markieren</button>` : ""}
      ${!row.published ? `<button data-cc-action="resume" data-id="${esc(row.id)}">Fertigstellen</button>` : ""}</div>
    </article>`).join("") || `<div class="cc-empty">${state.status === "loading" ? "Lokale werden geladen …" : filter === "all" ? "Noch keine Lokale. Erstelle die erste Seite über +." : "Keine Lokale in diesem Filter."}</div>`}</div>
    ${state.editor ? `<div class="cc-overlay"><section class="cc-dialog" role="dialog" aria-modal="true" aria-labelledby="cc-dialog-title">
      <div class="cc-dialog-head"><h2 id="cc-dialog-title">Neue Lokal-Seite</h2><button data-cc-action="close" aria-label="Schließen" ${state.saving ? "disabled" : ""}>×</button></div>
      <form id="cc-create-form"><label>Lokalname<input id="cc-local-name" name="name" maxlength="120" required value="${esc(state.draftName)}" ${state.saving ? "disabled" : ""}></label>
      <label>Profilbild<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" ${state.saving ? "disabled" : ""}></label><p class="cc-muted">${esc(state.avatarName || "Bitte ein Profilbild auswählen.")}</p>
      <label>Beispielbilder<input name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp" ${state.saving ? "disabled" : ""}></label><p class="cc-muted">${esc(state.photoNames || "Mehrere Bilder gleichzeitig · maximal 30")}</p>
      ${state.editorError ? `<p class="cc-error" role="alert">${esc(state.editorError)}</p>` : ""}
      <button class="cc-primary" type="submit" ${state.saving ? "disabled" : ""}>${state.saving ? esc(state.progress || "Seite wird erstellt …") : "Seite erstellen"}</button></form>
    </section></div>` : ""}
    ${state.notice ? `<p class="cc-notice" role="status">${esc(state.notice)}</p>` : ""}
  </section>`;
}
