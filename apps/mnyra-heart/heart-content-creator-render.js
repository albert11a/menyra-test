import {creatorCard,creatorSearch,creatorIcon as icon} from './heart-creator-components.js';
import {creatorStats,creatorOrders,creatorFollowupCard,creatorJourney} from './heart-creator-overview.js';
import {CREATOR_STATUSES,creatorBusinessStatus,creatorBusinessMatches} from '../../shared/creator-analytics.js';
import {renderCreatorHeroEditor} from './heart-content-creator-hero.js';
import {shopAdmin} from "./heart-content-creator-shop-render.js";
import { contentRows, ccEscape as esc, ccImage } from "../../shared/content-creator.js";
export function renderContentCreator(state = {}) {
  const rows = contentRows(state.pages, state.visits).sort((a,b) => (b.createdMs || 0) - (a.createdMs || 0));
  const businessRows=rows.map(row=>({...row,businessStatus:creatorBusinessStatus(row,state.visits,state.orders)}));
  const detail = rows.find(row => row.id === state.selectedId);
  const selected = businessRows.filter(row=>creatorBusinessMatches(row,state));
  const error = state.error ? `<p class="cc-error" role="alert">${esc(state.error)}</p>` : "";
  return `<section class="cc-workspace">
    ${state.migrationProgress ? `<p class="cc-muted" role="status">${esc(state.migrationProgress)}</p>` : ''}
    ${state.migrationError ? `<p class="cc-error" role="alert">${esc(state.migrationError)} <button type="button" data-cc-action="retry-migration">Übernahme wiederholen</button></p>` : ''}
    ${detail ? renderDetail(detail,state) : ""}
    ${!detail?creatorStats(state):''}
    ${error}
    ${!detail?renderBusinesses(businessRows,selected,state):''}
    ${!detail?creatorSearch(state)+creatorOrders(state)+creatorFollowupCard(state):''}
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

export function renderBusinessDelete(page, state = {}) {
  const busy = state.deletingBusinessId === page.id;
  const asked = state.deleteBusinessConfirm === page.id;
  const resumed = page.deleting === true;
  const error = (asked || resumed) && state.deleteBusinessError;
  return creatorCard(`delete-${page.id}`, 'Business löschen', `
    <p class="cc-muted">${esc(page.name)} samt Seite, Paketen, gespeicherten Originalen, Bestellungen, Warenkörben und Besuchsdaten löschen.</p>
    ${asked || resumed ? '<p><strong>Endgültig löschen?</strong> Das lässt sich nicht rückgängig machen. Bestell- und Downloadlinks werden ungültig.</p><p class="cc-muted">Bereits öffentlich geteilte Bilddateien können außerhalb der Business-Seite weiter erreichbar sein.</p>' : ''}
    ${error ? `<p class="cc-error" role="alert">${esc(error)}</p>` : ''}
    ${busy ? '<p role="status">Business und zugehörige Daten werden gelöscht …</p>' : ''}
    <div class="cc-row-actions"><button type="button" data-cc-action="delete-business" data-id="${esc(page.id)}" ${busy || state.mediaBusy ? 'disabled' : ''}>${busy ? 'Wird gelöscht …' : resumed || error ? 'Löschen fortsetzen' : asked ? 'Ja, Business endgültig löschen' : 'Business löschen'}</button>
    ${asked && !resumed && !busy ? '<button type="button" data-cc-action="cancel-business-delete">Abbrechen</button>' : ''}</div>`,
    state, { className: 'cc-business-delete' });
}

function renderDetail(page,state) {
  if (page.deleting) return `<section class="cc-detail"><h2>${esc(page.name)}</h2>${renderBusinessDelete(page,state)}</section>`;
  const visits=(state.visits || []).filter(v=>v.pageId===page.id);
  const values=[["Gesehen",visits.filter(v=>v.opened).length],["Gescrollt",visits.filter(v=>v.scrolled).length],["Ja geklickt",visits.filter(v=>v.answer==="yes").length],["Nein geklickt",visits.filter(v=>v.answer==="no").length]];
  return `<section class="cc-detail">

  ${shopAdmin(page,state)}
  ${creatorOrders(state,page.id)}
  ${renderCreatorHeroEditor(page,state)}
  ${creatorCard(`stats-${page.id}`,'Besuche',`<div class="cc-stats">${values.map(([label,n])=>`<div class="cc-stat"><strong>${n}</strong><span>${label}</span></div>`).join('')}</div>`,state)}
${creatorFollowupCard(state,page.id)}
  ${creatorCard(`links-${page.id}`,'Business-Seite',renderLinks(page,state),state)}
  ${creatorJourney(page,state)}
  <label class="cc-add" ${page.kind==='shop'?'hidden':''}>Fotos hinzufügen<input type="file" multiple accept="image/jpeg,image/png,image/webp" data-cc-add="${esc(page.id)}" ${state.mediaBusy?'disabled':''}></label>
  ${state.mediaError ? `<p class="cc-error" role="alert">${esc(state.mediaError)}</p>` : ""}
  ${state.mediaBusy ? '<p role="status">Bilder werden gespeichert …</p>' : ""}
  <div class="cc-edit-grid" ${page.kind==='shop'?'hidden':''}>${(page.kind==='shop'?[]:(page.photoIds || [])).map((key,i)=>{
    const image=state.images?.[key];
    return `<article class="cc-row">${ccImage(image?.cdn?.thumb||image?.data) ? `<img src="${ccImage(image.cdn?.thumb||image.data)}" alt="Bild ${i+1}">` : "<p>Bild wird geladen …</p>"}
    <label>Bildunterschrift<textarea id="cc-edit-caption-${esc(key)}" data-edit-caption="${esc(key)}" maxlength="1000">${esc(state.captionDrafts?.[key] ?? image?.caption ?? "")}</textarea></label>
    <div class="cc-row-actions"><button data-cc-action="caption" data-id="${esc(page.id)}" data-image="${esc(key)}" ${state.mediaBusy?'disabled':''}>Text speichern</button><button data-cc-action="move" data-id="${esc(page.id)}" data-image="${esc(key)}" data-direction="-1" ${i===0||state.mediaBusy?'disabled':''}>↑</button><button data-cc-action="move" data-id="${esc(page.id)}" data-image="${esc(key)}" data-direction="1" ${i===page.photoIds.length-1||state.mediaBusy?'disabled':''}>↓</button><button data-cc-action="delete" data-id="${esc(page.id)}" data-image="${esc(key)}" ${state.mediaBusy?'disabled':''}>Löschen</button></div></article>`;
  }).join("")}</div>${renderBusinessDelete(page,state)}</section>`;
}

function renderLinks(row,state){
 if(row.deleting)return `<button type="button" data-cc-action="detail" data-id="${esc(row.id)}">Löschen fortsetzen</button>`;
 const chip=(action,label,sign,extra='')=>`<button type="button" class="heart-lifeskin-chip" data-cc-action="${action}" data-id="${esc(row.id)}" ${extra}>${icon(sign)}<span>${label}</span></button>`;
 return `<div class="cc-link-actions heart-lifeskin-chips--shop">${row.published?chip('preview','Still preview','eye')+chip('still','Still copy','copy')+chip('copy','True copy','externalLink')+chip('sent','Sended','send',`aria-pressed="${row.workflow==='sent'||!!row.sentAt}" ${state.mediaBusy?'disabled':''}`):row.photoIds?.length?chip('resume','Fertigstellen','edit'):''}</div>`;
}
function renderBusinesses(rows,selected,state){
 const filter=state.filter||'all';
 const chips=[...CREATOR_STATUSES,['all','Alle']];
 const pages=[chips.slice(0,4),chips.slice(4)];
 const filters=`<div class="heart-lifeskin-chips heart-shopchip-pages cc-business-chips" data-cc-track="business-filters" aria-label="Bizneset filtern">${pages.map(page=>`<div class="heart-shopchip-page heart-lifeskin-chips--shop">${page.map(([key,label])=>`<button type="button" class="heart-lifeskin-chip${key===filter?' heart-lifeskin-chip--an':''}" data-cc-action="filter" data-key="${key}" aria-pressed="${key===filter}">${label}<span>${key==='all'?rows.length:rows.filter(row=>row.businessStatus===key).length}</span></button>`).join('')}</div>`).join('')}</div>`;
 const ids=selected.map(row=>row.id),chosen=(state.selectedIds||[]).filter(id=>ids.includes(id)),all=ids.length>0&&chosen.length===ids.length;
 const bulk=state.selecting?`<div class="heart-faelle-wahl cc-bulk"><div class="heart-faelle-wahl__kopf"><button type="button" class="heart-faelle-wahl__alle" data-cc-action="select-all">${all?'Keine':'Alle auswählen'}</button><span class="heart-faelle-wahl__zahl">${chosen.length} ausgewählt</span><button type="button" class="heart-faelle-wahl__fertig" data-cc-action="settings">Fertig</button></div><div class="heart-faelle-wahl__tasten"><button type="button" class="heart-faelle-wahl__taste" data-cc-action="bulk-status" data-key="ready" ${!chosen.length||state.mediaBusy?'disabled':''}>${icon('check','heart-faelle-wahl__icon')}Ready</button><button type="button" class="heart-faelle-wahl__taste" data-cc-action="bulk-status" data-key="archived" ${!chosen.length||state.mediaBusy?'disabled':''}>${icon('archive','heart-faelle-wahl__icon')}Archiv</button></div></div>`:'';
 const list=`<div class="cc-list">${selected.slice(0,state.businessLimit||20).map(row=>{
  const expanded=!!state.expandedBusinesses?.[row.id],picked=(state.selectedIds||[]).includes(row.id);
  return `<article class="cc-row" data-morph-key="business-${esc(row.id)}"><div class="cc-row-main">
  <button type="button" class="cc-row-head cc-open" data-cc-action="${state.selecting?'select-business':'detail'}" data-id="${esc(row.id)}" ${state.selecting?`aria-pressed="${picked}"`:''}>
  <span class="cc-avatar-wrap">${ccImage(row.avatar)?`<img class="cc-avatar" src="${ccImage(row.avatar)}" alt="">`:`<span class="cc-avatar cc-avatar-empty">${esc(row.name?.slice(0,1)||'')}</span>`}${state.selecting?`<span class="heart-lifeskin-fall__wahl${picked?' cc-picked':''}">${picked?icon('check','heart-lifeskin-fall__haken'):''}</span>`:''}</span>
  <span class="cc-business-info"><span class="cc-business-label">${esc(row.name)}</span><span class="cc-business-meta"><span>${CREATOR_STATUSES.find(([key])=>key===row.businessStatus)?.[1]||''}</span><span>${row.photoIds?.length||0} Bilder</span>${row.opened?'<span>Geöffnet</span>':''}${row.scrolled?'<span>Gescrollt</span>':''}${row.yes?'<span>Ja</span>':''}${row.no?'<span>Nein</span>':''}</span></span></button>
  ${state.selecting?`<input class="cc-selection-input" type="checkbox" data-cc-select="${esc(row.id)}" ${picked?'checked':''} aria-label="${esc(row.name)} auswählen">`:`<button type="button" class="cc-row-expand" data-cc-action="toggle-links" data-id="${esc(row.id)}" aria-label="Aktionen für ${esc(row.name)}" aria-expanded="${expanded}">${icon(expanded?'chevronUp':'chevronDown')}</button>`}</div>
  ${expanded&&!state.selecting?renderLinks(row,state):''}</article>`;
 }).join('')||`<p class="cc-empty">${state.status==='loading'?'Lokale werden geladen …':'Keine Businesses in dieser Auswahl.'}</p>`}</div>`;
 const more=selected.length>(state.businessLimit||20)?'<button class="cc-more-button" data-cc-action="more" data-key="businessLimit">Mehr anzeigen</button>':'';
 const actions=`<div class="cc-heading-actions"><button type="button" class="heart-faelle-zahnrad${state.selecting?' heart-faelle-zahnrad--an':''}" data-cc-action="settings" aria-label="Businesses auswählen" aria-pressed="${!!state.selecting}">${icon('zahnrad','heart-faelle-zahnrad__icon')}</button><button type="button" class="heart-faelle-zahnrad" data-cc-action="new" aria-label="Business erstellen">${icon('plus','heart-faelle-zahnrad__icon')}</button></div>`;
 return creatorCard('businesses','Bizneset',filters+bulk+list+more,state,{count:rows.length,actions,className:'cc-businesses'});
}
