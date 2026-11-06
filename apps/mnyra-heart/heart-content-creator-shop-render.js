import {creatorPackageFiles,creatorWatermarkOpacity} from '../../shared/content-creator-shop.js';
import {creatorIcon as shopIcon} from '../../shared/content-creator-view.js';
import {creatorPhoto,creatorImageUrl} from '../../shared/content-creator-view.js';
import {ccEscape as esc,ccImage} from '../../shared/content-creator.js';
import {creatorCard,creatorCollapsed,creatorMoney,creatorIcon as icon} from './heart-creator-components.js';

function adminAsset(page,id,alt,state){
 if(page.mediaTypes?.[id]==='video'||page.media?.[id]?.mediaType==='video')return creatorPhoto(page,id,alt,{size:'thumb',active:true});
 return `<img src="${ccImage(page.media?.[id]?.thumb||state.images?.[id]?.cdn?.thumb||state.images?.[id]?.data)||esc(creatorImageUrl(page,id,'thumb'))}" alt="${esc(alt)}" loading="lazy">`;
}
function photoSeen(page,id,state){
 if(page.mediaTypes?.[id]==='video'||page.media?.[id]?.mediaType==='video')return '';
 return `<span class="cc-photo-seen">${shopIcon('eye')} ${state.photoViewsPageId!==page.id||state.photoViewsUnavailable?'–':state.photoViews?.[id]||0} Seen</span>`;
}
function packageEditor(page,product,state){
 const busy=state.mediaBusy?'disabled':'';
 const sort=state.photoSort?.[product.id];
 const ids=sort?.pending||creatorPackageFiles(page,product);
 const sortBusy=sort?.pending||state.mediaBusy?'disabled':'';
 return `<details class="cc-package-editor" data-cc-fold="package-${esc(product.id)}"><summary class="cc-package-edit-button">${icon('pencil')}<span class="cc-package-edit-label">Bearbeiten</span><span class="cc-package-close-label">Schließen</span></summary>
 <form class="cc-package" data-cc-package="${esc(product.id)}" data-page="${esc(page.id)}">
 <label>Paketname<input id="cc-title-${esc(product.id)}" name="title" required maxlength="120" value="${esc(product.title)}" ${busy}></label>
 <label>Preis in € (0 = kostenlos)<input id="cc-price-${esc(product.id)}" name="price" required inputmode="decimal" value="${(product.priceCents/100).toFixed(2)}" ${busy}></label>
 <div class="cc-package-photos cc-photo-sort" data-cc-sort data-page="${esc(page.id)}" data-product="${esc(product.id)}">${ids.map((id,index)=>`<figure data-cc-sort-file="${esc(id)}" data-morph-key="edit-${esc(product.id)}-${esc(id)}">${adminAsset(page,id,'Paketmedium',state)}
 ${photoSeen(page,id,state)}
 <div class="cc-row-actions cc-sort-controls">
 <button type="button" data-cc-drag-photo ${sortBusy} aria-label="Foto ${index+1} verschieben">⠿</button>
 <button type="button" data-cc-sort-step="-1" ${index===0?'disabled':sortBusy} aria-label="Foto nach oben">${icon('arrowLeft')}</button>
 <button type="button" data-cc-sort-step="1" ${index===ids.length-1?'disabled':sortBusy} aria-label="Foto nach unten">${icon('chevronRight')}</button>
 <button type="button" data-cc-action="delete" data-id="${esc(page.id)}" data-image="${esc(id)}" data-product="${esc(product.id)}" ${sortBusy}>Aus Paket entfernen</button></div></figure>`).join('')}</div>
 ${sort?.pending?'<p role="status">Reihenfolge wird gespeichert …</p>':sort?.error?`<p role="alert">${esc(sort.error)} <button type="button" data-cc-sort-retry>Erneut versuchen</button></p>`:''}
 <label>Fotos oder Videos hinzufügen<input id="cc-add-photos-${esc(product.id)}" type="file" data-cc-package-add="${esc(product.id)}" data-page="${esc(page.id)}" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" ${busy}></label>
 <div class="cc-row-actions"><button type="submit" ${busy}>Paket speichern</button><button type="button" data-cc-action="close-package-editor">Schließen</button><button type="button" data-cc-action="delete-package" data-id="${esc(page.id)}" data-product="${esc(product.id)}" ${busy}>${state.deletePackageConfirm===product.id?'Ja, Paket und Fotos entfernen':'Paket löschen'}</button>${state.deletePackageConfirm===product.id?'<button type="button" data-cc-action="cancel-package-delete">Abbrechen</button>':''}</div>
 ${state.deletePackageConfirm===product.id?'<p role="status">Gekaufte Originale bleiben für bestehende Bestellungen erhalten.</p>':''}</form></details>`;
}

function packageCard(page,product,state,{editable=true,purchased=false}={}){
  const files=product.imageIds||[],ids=state.photoSort?.[product.id]?.pending||creatorPackageFiles(page,product),key=`package-${product.id}`,closed=creatorCollapsed(state,key);
  return `<article class="cc-card cc-package-card${closed?' cc-collapsed':''}" data-morph-key="package-${esc(product.id)}" data-cc-collapse="${esc(key)}">
  <div class="cc-card-body" ${closed?'hidden':''}><div class="cc-package-stage"><div class="cc-package-gallery" data-cc-gallery="${esc(product.id)}" data-cc-track="cover-${esc(product.id)}" aria-label="${esc(product.title)} · Fotos">${ids.map((id,i)=>`<div class="cc-package-slide">${adminAsset(page,id,`${product.title} · ${i+1}`,state)}${photoSeen(page,id,state)}</div>`).join('')||'<p class="cc-muted">Keine Vorschau verfügbar.</p>'}</div>
  ${ids.length>1?`<button type="button" class="cc-package-prev" data-cc-action="slide-package" data-product="${esc(product.id)}" data-direction="-1" aria-label="Vorheriges Foto">${icon('chevronDown')}</button><button type="button" class="cc-package-next" data-cc-action="slide-package" data-product="${esc(product.id)}" data-direction="1" aria-label="Nächstes Foto">${icon('chevronRight')}</button><span class="cc-package-position" data-cc-position="${esc(product.id)}">1 / ${ids.length}</span>`:''}</div></div>
  ${purchased?`<h3 class="cc-purchased-package-name">${esc(product.title)}</h3>`:''}
  <div class="cc-package-price"><button type="button" data-cc-action="collapse" data-key="${esc(key)}" aria-label="${esc(product.title)} ${closed?'erweitern':'minimieren'}" aria-expanded="${!closed}">Preis: ${creatorMoney(product.priceCents)}</button><span>${files.length} ${files.length===1?'Datei':'Dateien'}</span></div>
  <div class="cc-card-body" ${closed?'hidden':''}>${editable?packageEditor(page,product,state):''}</div></article>`;
}

export function shopAdmin(page,state){
 if(page.kind!=='shop')return '';
 const busy=state.mediaBusy?'disabled':'';
 const header=`<section class="cc-card cc-business-name${creatorCollapsed(state,`name-${page.id}`)?' cc-collapsed':''}" data-cc-collapse="name-${esc(page.id)}"><header class="cc-card-head"><h2>${esc(page.name)}</h2><button type="button" class="heart-faelle-zahnrad" data-cc-action="new-package" aria-label="Paket erstellen" aria-expanded="${!!state.newPackage}">${icon('plus','heart-faelle-zahnrad__icon')}</button></header></section>`;
 const create=creatorCard('new-package','Neues Medienpaket',`<form id="cc-add-package" data-page="${esc(page.id)}"><label>Paketname<input id="cc-new-title" name="title" required maxlength="120" placeholder="z. B. Social Set" ${busy}></label><label>Preis in € (0 = kostenlos)<input id="cc-new-price" name="price" required inputmode="decimal" placeholder="29,00" ${busy}></label><label>Fotos oder Videos<input id="cc-new-files" name="files" type="file" multiple required accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" ${busy}></label><button ${busy}>Paket hochladen</button><p class="cc-muted">Fotos oder Videos bis 30 MB · Videos bis 60 Sekunden. Die Videovorschau wird beim Upload vorbereitet; bitte die Seite geöffnet lassen.</p></form>`,state,{className:'cc-new-package',hidden:!state.newPackage});
 const products=page.products||[];
 const sold=new Map();
 for(const order of state.orders||[]){
  if(order.pageId!==page.id)continue;
  for(const line of order.lines||[]){
   if(line.id&&line.priceCents>0&&!sold.has(line.id))sold.set(line.id,line);
  }
 }
 const packages=products.filter(product=>!sold.has(product.id)).map(product=>packageCard(page,product,state)).join('');
 const purchased=[...sold.values()].map(line=>{
  const product=products.find(item=>item.id===line.id);
  return packageCard(page,product||line,state,{editable:!!product,purchased:true});
 }).join('');
 const draft=state.watermarkDraft?.id===page.id?state.watermarkDraft.value:creatorWatermarkOpacity(page.watermarkOpacity);
 const sample=products.filter(p=>p.active!==false&&p.priceCents>0&&!sold.has(p.id)).flatMap(p=>creatorPackageFiles(page,p)).find(id=>page.mediaTypes?.[id]!=='video'&&page.media?.[id]?.mediaType!=='video');
 const options=creatorCard(`package-options-${page.id}`,'Paketoptionen',`<div class="cc-watermark-options" data-cc-watermark-page="${esc(page.id)}" data-cc-watermark-sample="${esc(sample||'')}">
 <label>Deckkraft MNYRA Preview <output data-cc-watermark-value>${draft} %</output><input aria-label="Deckkraft MNYRA Preview" type="range" min="0" max="100" value="${draft}" data-cc-watermark ${busy}></label>
 ${sample?'<canvas data-cc-watermark-canvas width="240" height="240" role="img" aria-label="Wasserzeichen-Vorschau" hidden></canvas><p data-cc-watermark-status class="cc-muted" role="status"></p>':''}
 <div class="cc-row-actions"><button type="button" data-cc-action="watermark-apply" data-id="${esc(page.id)}" ${busy}>Anwenden</button>
 <button type="button" data-cc-action="watermark-reset" data-id="${esc(page.id)}" ${page.watermarkOpacity==null?'disabled':busy}>Standard wiederherstellen</button></div></div>
 <button type="button" data-cc-action="refresh-previews" data-id="${esc(page.id)}" ${busy}>Vorschauen aktualisieren</button>`,{...state,collapsedCards:{[`package-options-${page.id}`]:true,...state.collapsedCards}});
 const purchasedCard=purchased?creatorCard(`purchased-photos-${page.id}`,'Gekaufte Fotos',`<div class="cc-package-grid cc-purchased-packages">${purchased}</div>`,state,{count:sold.size}):'';
 return header+create+(packages?`<div class="cc-package-grid">${packages}</div>`:'')+options+purchasedCard;
}
