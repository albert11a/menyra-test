import {creatorImageUrl} from '../../shared/content-creator-view.js';
import {ccEscape as esc,ccImage} from '../../shared/content-creator.js';
import {creatorCard,creatorCollapsed,creatorMoney,creatorIcon as icon} from './heart-creator-components.js';

function packageEditor(page,product,state){
 const busy=state.mediaBusy?'disabled':'';
 const ids=(product.imageIds||[]).filter(id=>(page.photoIds||[]).includes(id));
 return `<details class="cc-package-editor" data-cc-fold="package-${esc(product.id)}"><summary class="cc-package-edit-button">${icon('pencil')}<span>Bearbeiten</span></summary>
 <form class="cc-package" data-cc-package="${esc(product.id)}" data-page="${esc(page.id)}">
 <label>Paketname<input id="cc-title-${esc(product.id)}" name="title" required maxlength="120" value="${esc(product.title)}" ${busy}></label>
 <label>Preis in € (0 = kostenlos)<input id="cc-price-${esc(product.id)}" name="price" required inputmode="decimal" value="${(product.priceCents/100).toFixed(2)}" ${busy}></label>
 <div class="cc-package-photos cc-photo-track" data-cc-track="edit-${esc(product.id)}">${ids.map(id=>`<figure><img src="${ccImage(state.images?.[id]?.cdn?.thumb||state.images?.[id]?.data)||esc(creatorImageUrl(page,id,'thumb'))}" alt="Paketfoto" loading="lazy"><div class="cc-row-actions">
 <button type="button" data-cc-action="move" data-id="${esc(page.id)}" data-image="${esc(id)}" data-direction="-1" ${page.photoIds.indexOf(id)===0||state.mediaBusy?'disabled':''} aria-label="Foto nach vorne">${icon('arrowLeft')}</button>
 <button type="button" data-cc-action="move" data-id="${esc(page.id)}" data-image="${esc(id)}" data-direction="1" ${page.photoIds.indexOf(id)===page.photoIds.length-1||state.mediaBusy?'disabled':''} aria-label="Foto nach hinten">${icon('chevronRight')}</button>
 <button type="button" data-cc-action="delete" data-id="${esc(page.id)}" data-image="${esc(id)}" data-product="${esc(product.id)}" ${busy}>Aus Paket entfernen</button></div></figure>`).join('')}</div>
 <label>Fotos hinzufügen<input id="cc-add-photos-${esc(product.id)}" type="file" data-cc-package-add="${esc(product.id)}" data-page="${esc(page.id)}" multiple accept="image/jpeg,image/png,image/webp" ${busy}></label>
 <div class="cc-row-actions"><button type="submit" ${busy}>Paket speichern</button><button type="button" data-cc-action="delete-package" data-id="${esc(page.id)}" data-product="${esc(product.id)}" ${busy}>${state.deletePackageConfirm===product.id?'Ja, Paket und Fotos entfernen':'Paket löschen'}</button>${state.deletePackageConfirm===product.id?'<button type="button" data-cc-action="cancel-package-delete">Abbrechen</button>':''}</div>
 ${state.deletePackageConfirm===product.id?'<p role="status">Gekaufte Originale bleiben für bestehende Bestellungen erhalten.</p>':''}</form></details>`;
}

export function shopAdmin(page,state){
 if(page.kind!=='shop')return '';
 const busy=state.mediaBusy?'disabled':'';
 const header=`<section class="cc-card cc-business-name${creatorCollapsed(state,`name-${page.id}`)?' cc-collapsed':''}" data-cc-collapse="name-${esc(page.id)}"><header class="cc-card-head"><h2>${esc(page.name)}</h2><button type="button" class="heart-faelle-zahnrad" data-cc-action="new-package" aria-label="Paket erstellen" aria-expanded="${!!state.newPackage}">${icon('plus','heart-faelle-zahnrad__icon')}</button></header></section>`;
 const create=creatorCard('new-package','Neues Fotopaket',`<form id="cc-add-package" data-page="${esc(page.id)}"><label>Paketname<input id="cc-new-title" name="title" required maxlength="120" placeholder="z. B. Social Set" ${busy}></label><label>Preis in € (0 = kostenlos)<input id="cc-new-price" name="price" required inputmode="decimal" placeholder="29,00" ${busy}></label><label>Fotos<input id="cc-new-files" name="files" type="file" multiple required accept="image/jpeg,image/png,image/webp" ${busy}></label><button ${busy}>Paket hochladen</button></form>`,state,{className:'cc-new-package',hidden:!state.newPackage});
 const packages=(page.products||[]).map(product=>{
  const ids=(product.imageIds||[]).filter(id=>(page.photoIds||[]).includes(id)),key=`package-${product.id}`,closed=creatorCollapsed(state,key);
  return `<article class="cc-card cc-package-card${closed?' cc-collapsed':''}" data-morph-key="package-${esc(product.id)}" data-cc-collapse="${esc(key)}">
  <div class="cc-card-body" ${closed?'hidden':''}><div class="cc-package-stage"><div class="cc-package-gallery" data-cc-gallery="${esc(product.id)}" data-cc-track="cover-${esc(product.id)}" aria-label="${esc(product.title)} · Fotos">${ids.map((id,i)=>`<div class="cc-package-slide"><img src="${ccImage(state.images?.[id]?.cdn?.thumb||state.images?.[id]?.data)||esc(creatorImageUrl(page,id,'medium'))}" alt="${esc(product.title)} · Foto ${i+1}" loading="lazy" decoding="async"></div>`).join('')||'<p class="cc-muted">Noch keine Fotos. Unter Bearbeiten Fotos hinzufügen.</p>'}</div>
  ${ids.length>1?`<button type="button" class="cc-package-prev" data-cc-action="slide-package" data-product="${esc(product.id)}" data-direction="-1" aria-label="Vorheriges Foto">${icon('chevronDown')}</button><button type="button" class="cc-package-next" data-cc-action="slide-package" data-product="${esc(product.id)}" data-direction="1" aria-label="Nächstes Foto">${icon('chevronRight')}</button><span class="cc-package-position" data-cc-position="${esc(product.id)}">1 / ${ids.length}</span>`:''}</div></div>
  <div class="cc-package-price"><button type="button" data-cc-action="collapse" data-key="${esc(key)}" aria-label="${esc(product.title)} ${closed?'erweitern':'minimieren'}" aria-expanded="${!closed}">Preis: ${creatorMoney(product.priceCents)}</button><span>${ids.length} ${ids.length===1?'Bild':'Bilder'}</span></div>
  <div class="cc-card-body" ${closed?'hidden':''}>${packageEditor(page,product,state)}</div></article>`;
 }).join('');
 const options=creatorCard(`package-options-${page.id}`,'Paketoptionen',`<button type="button" data-cc-action="refresh-previews" data-id="${esc(page.id)}" ${busy}>Vorschauen aktualisieren</button>`,{...state,collapsedCards:{[`package-options-${page.id}`]:true,...state.collapsedCards}});
 return header+create+(packages?`<div class="cc-package-grid">${packages}</div>`:'')+options;
}
