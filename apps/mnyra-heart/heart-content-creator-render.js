import {creatorStats,creatorOrders,creatorFollowupCard,creatorJourney} from './heart-creator-overview.js';
import {CREATOR_STATUSES,creatorBusinessStatus} from '../../shared/creator-analytics.js';
import {renderCreatorHeroEditor} from './heart-content-creator-hero.js';
import {shopAdmin} from "./heart-content-creator-shop-render.js";
import { CC_FILTERS, contentRows, ccEscape as esc, ccImage } from "../../shared/content-creator.js";
export function renderContentCreator(state = {}) {
  const rows = contentRows(state.pages, state.visits).sort((a,b) => (b.createdMs || 0) - (a.createdMs || 0));
  const filter = state.filter || "all";
  const businessRows=rows.map(row=>({...row,businessStatus:creatorBusinessStatus(row,state.visits,state.orders)}));
  const labels = Object.fromEntries(CC_FILTERS);
  const detail = rows.find(row => row.id === state.selectedId);
  const selected = businessRows.filter(r => filter === "all" || r.businessStatus === filter || (!CREATOR_STATUSES.some(([key])=>key===filter)&&r.status===filter));
  const error = state.error ? `<p class="cc-error" role="alert">${esc(state.error)}</p>` : "";
  return `<section class="cc-workspace">
    ${state.migrationProgress ? `<p class="cc-muted" role="status">${esc(state.migrationProgress)}</p>` : ''}
    ${state.migrationError ? `<p class="cc-error" role="alert">${esc(state.migrationError)} <button type="button" data-cc-action="retry-migration">Übernahme wiederholen</button></p>` : ''}
    ${detail ? renderDetail(detail,state) : ""}
    ${!detail?creatorStats(state):''}
    ${error}
    ${!detail?`<section class="cc-card"><div class="cc-card-head"><h3>Bizneses <small>${rows.length}</small></h3><div class="cc-row-actions"><button class="heart-icon-button" data-cc-action="settings" aria-label="Businesses auswählen" aria-pressed="${!!state.selecting}">⚙</button><button class="heart-icon-button" data-cc-action="new" aria-label="Business erstellen">+</button></div></div>
    <div class="cc-filters" data-cc-track="business-filters" aria-label="Bizneses filtern"><button data-cc-action="filter" data-key="all" aria-pressed="${filter==='all'}">Alle ${rows.length}</button>${CREATOR_STATUSES.map(([key,label])=>`<button data-cc-action="filter" data-key="${key}" aria-pressed="${filter===key}">${label} <small>${businessRows.filter(r=>r.businessStatus===key).length}</small></button>`).join('')}</div>
    ${state.selecting?`<div class="cc-row-actions cc-bulk"><span>${(state.selectedIds||[]).length} ausgewählt</span><button data-cc-action="select-all">Alle sichtbaren wählen</button><button data-cc-action="bulk-status" data-key="ready" ${!state.selectedIds?.length||state.mediaBusy?'disabled':''}>Ready</button><button data-cc-action="bulk-status" data-key="archived" ${!state.selectedIds?.length||state.mediaBusy?'disabled':''}>Archiv</button></div>`:''}`:''}
    <div class="cc-list" ${detail ? "hidden" : ""}>${selected.slice(0,state.businessLimit||20).map(row => `<article class="cc-row">
      ${state.selecting?`<label class="cc-selection"><input type="checkbox" data-cc-select="${esc(row.id)}" ${(state.selectedIds||[]).includes(row.id)?'checked':''}>Auswählen</label>`:''}
      <button class="cc-row-head cc-open" data-cc-action="detail" data-id="${esc(row.id)}">${ccImage(row.avatar) ? `<img class="cc-avatar" src="${ccImage(row.avatar)}" alt="" />` : `<span class="cc-avatar cc-avatar-empty">${esc(row.name?.slice(0,1))}</span>`}
      <div><h2>${esc(row.name)}</h2><span class="cc-status cc-status-${row.status}">${CREATOR_STATUSES.find(([key])=>key===row.businessStatus)?.[1]||labels[row.status]}</span></div></button>
      <p class="cc-muted">${row.photoIds?.length || 0} Bilder${row.opened ? " · Geöffnet" : ""}${row.scrolled ? " · Gescrollt" : ""}${row.yes ? " · Antwort: Ja" : ""}${row.no ? " · Antwort: Nein" : ""}</p>
      <details class="cc-more" data-cc-fold="links-${esc(row.id)}"><summary>Mehr anzeigen</summary><div class="cc-row-actions">${row.published ? `<button data-cc-action="preview" data-id="${esc(row.id)}">Vorschau</button><button data-cc-action="still" data-id="${esc(row.id)}">Still-Link kopieren</button><button data-cc-action="copy" data-id="${esc(row.id)}">Link kopieren</button>` : ""}
      ${row.published && row.workflow !== "sent" && !row.yes && !row.no ? `<button data-cc-action="sent" data-id="${esc(row.id)}">Als verschickt markieren</button>` : ""}
      ${!row.published && row.photoIds?.length ? `<button data-cc-action="resume" data-id="${esc(row.id)}">Fertigstellen</button>` : ""}</div></details>
    </article>`).join("") || `<div class="cc-empty">${state.status === "loading" ? "Lokale werden geladen …" : filter === "all" ? "Noch keine Lokale. Erstelle die erste Seite über +." : "Keine Lokale in diesem Filter."}</div>`}</div>
    ${!detail?`${selected.length>(state.businessLimit||20)?'<button class="cc-more-button" data-cc-action="more" data-key="businessLimit">Mehr anzeigen</button>':''}</section>${creatorOrders(state)}${creatorFollowupCard(state)}`:''}
    ${state.editor ? `<div class="cc-overlay"><section class="cc-dialog" role="dialog" aria-modal="true" aria-labelledby="cc-dialog-title">
      <div class="cc-dialog-head"><h2 id="cc-dialog-title">Betrieb erstellen</h2><button data-cc-action="close" aria-label="Schließen" ${state.saving ? "disabled" : ""}>×</button></div>
      <form id="cc-create-form"><label>Seitenart<select name="kind" id="cc-page-kind" ${state.saving?'disabled':''}><option value="promo" ${state.pageKind!=='shop'?'selected':''}>Content Creator · Vorschau</option><option value="shop" ${state.pageKind==='shop'?'selected':''}>Shop · Fotopakete verkaufen</option></select></label>
      ${state.pageKind==='shop'&&state.pendingPhotos?.length?`<label>Paketname<input id="cc-shop-title" ${state.saving?'disabled':''} name="shopTitle" value="${esc(state.shopTitle||'Pako fotosh')}" maxlength="120" required></label><label>Paketpreis in €<input id="cc-shop-price" ${state.saving?'disabled':''} name="shopPrice" value="${esc(state.shopPrice||'')}" inputmode="decimal" placeholder="29,00" required></label><p class="cc-muted">Alle unten ausgewählten Fotos bilden ein verkäufliches Paket. Weitere Pakete kannst du danach hinzufügen.</p>`:''}
      <p class="cc-muted">Erst den Betrieb anlegen. Fotos und Pakete kannst du später hinzufügen.</p><label>Betriebsname<input id="cc-local-name" name="name" maxlength="120" required value="${esc(state.draftName)}" ${state.saving ? "disabled" : ""}></label>
      <label>Profilbild (optional)<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" ${state.saving ? "disabled" : ""}></label><p class="cc-muted">${esc(state.avatarName || "Optional – ohne Profilbild wird kein Logo angezeigt.")}</p>
      <details class="cc-optional-upload"><summary>Fotos jetzt hinzufügen (optional)</summary><label>Fotos<input name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp" ${state.saving ? "disabled" : ""}></label><p class="cc-muted">${esc(state.photoNames || "Optional · mehrere Bilder gleichzeitig · maximal 30")}</p>
      ${(state.pendingPhotos || []).map((name,i) => `<label>${esc(name)}<textarea id="cc-caption-${i}" data-upload-caption="${i}" maxlength="1000" placeholder="Bildunterschrift">${esc(state.pendingCaptions?.[i] || "")}</textarea></label>`).join("")}
      </details>
      ${state.editorError ? `<p class="cc-error" role="alert">${esc(state.editorError)}</p>` : ""}
      <button class="cc-primary" type="submit" ${state.saving ? "disabled" : ""}>${state.saving ? esc(state.progress || "Seite wird erstellt …") : "Betrieb erstellen"}</button></form>
    </section></div>` : ""}
    ${state.notice ? `<p class="cc-notice" role="status">${esc(state.notice)}</p>` : ""}
  </section>`;
}

function renderDetail(page,state) {
  const visits=(state.visits || []).filter(v=>v.pageId===page.id);
  const values=[["Gesehen",visits.filter(v=>v.opened).length],["Gescrollt",visits.filter(v=>v.scrolled).length],["Ja geklickt",visits.filter(v=>v.answer==="yes").length],["Nein geklickt",visits.filter(v=>v.answer==="no").length]];
  return `<section class="cc-detail">

  ${shopAdmin(page,state)}
  ${creatorOrders(state,page.id)}
  ${renderCreatorHeroEditor(page,state)}
    <details class="cc-card" data-cc-fold="detail-stats"><summary>Besuche · ${esc(page.name)}</summary><div class="cc-stats">${values.map(([label,n])=>`<div class="cc-stat"><strong>${n}</strong><span>${label}</span></div>`).join("")}</div>
  <p class="cc-muted">Eindeutige Browserbesuche · eigene Tests mit Still-Link zählen nicht.</p></details>
${creatorFollowupCard(state,page.id)}
  <section class="cc-card"><h3>Business-Seite</h3>  <div class="cc-row-actions"><button data-cc-action="preview" data-id="${esc(page.id)}">Vorschau öffnen</button><button data-cc-action="still" data-id="${esc(page.id)}">Still-Link kopieren</button><button data-cc-action="copy" data-id="${esc(page.id)}">Kundenlink kopieren</button></div></section>
  ${creatorJourney(page,state)}
  <label class="cc-add" ${page.kind==='shop'?'hidden':''}>Fotos hinzufügen<input type="file" multiple accept="image/jpeg,image/png,image/webp" data-cc-add="${esc(page.id)}" ${state.mediaBusy?'disabled':''}></label>
  ${state.mediaError ? `<p class="cc-error" role="alert">${esc(state.mediaError)}</p>` : ""}
  ${state.mediaBusy ? '<p role="status">Bilder werden gespeichert …</p>' : ""}
  <div class="cc-edit-grid" ${page.kind==='shop'?'hidden':''}>${(page.kind==='shop'?[]:(page.photoIds || [])).map((key,i)=>{
    const image=state.images?.[key];
    return `<article class="cc-row">${ccImage(image?.cdn?.thumb||image?.data) ? `<img src="${ccImage(image.cdn?.thumb||image.data)}" alt="Bild ${i+1}">` : "<p>Bild wird geladen …</p>"}
    <label>Bildunterschrift<textarea id="cc-edit-caption-${esc(key)}" data-edit-caption="${esc(key)}" maxlength="1000">${esc(state.captionDrafts?.[key] ?? image?.caption ?? "")}</textarea></label>
    <div class="cc-row-actions"><button data-cc-action="caption" data-id="${esc(page.id)}" data-image="${esc(key)}" ${state.mediaBusy?'disabled':''}>Text speichern</button><button data-cc-action="move" data-id="${esc(page.id)}" data-image="${esc(key)}" data-direction="-1" ${i===0||state.mediaBusy?'disabled':''}>↑</button><button data-cc-action="move" data-id="${esc(page.id)}" data-image="${esc(key)}" data-direction="1" ${i===page.photoIds.length-1||state.mediaBusy?'disabled':''}>↓</button><button data-cc-action="delete" data-id="${esc(page.id)}" data-image="${esc(key)}" ${state.mediaBusy?'disabled':''}>Löschen</button></div></article>`;
  }).join("")}</div></section>`;
}
