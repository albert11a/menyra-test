import {ccEscape as esc,ccImage} from '../../shared/content-creator.js';
import {creatorHeroFiles,creatorImageUrl} from '../../shared/content-creator-view.js';
import {creatorHeroFormat,creatorHeroCrop,normalizeCreatorCrop,creatorHeroCropStyle} from '../../shared/creator-hero.js';

export function renderCreatorHeroEditor(page,state={}) {
  if(page.kind!=='shop')return '';
  const own=page.heroImages||[],files=creatorHeroFiles(page),format=creatorHeroFormat(page),disabled=state.mediaBusy?'disabled':'';
  return `<details class="cc-hero-editor" open><summary>Titelbilder unter dem Header</summary>
    <label class="cc-add">Eigene Titelbilder hochladen<input type="file" multiple accept="image/jpeg,image/png,image/webp" data-cc-hero-upload="${esc(page.id)}" ${disabled}></label>
    <p class="cc-muted">Bis zu 6 eigene Titelbilder. Reihenfolge und Ausschnitt lassen sich unten einstellen.</p>
    <label class="cc-hero-format">Format auf der Webseite<select data-cc-hero-format="${esc(page.id)}" ${disabled}><option value="landscape" ${format==='landscape'?'selected':''}>Querformat · 4:3</option><option value="portrait" ${format==='portrait'?'selected':''}>Hochformat · 4:5</option></select></label>
    <div class="cc-hero-editors">${files.map((id,i)=>{
      const crop=normalizeCreatorCrop(state.heroDrafts?.[`${page.id}:${id}`]||creatorHeroCrop(page,id)),independent=own.some(image=>image.id===id);
      return `<article class="cc-hero-card" data-cc-hero-card="${esc(id)}" data-page="${esc(page.id)}">
        <h3>Titelbild ${i+1}</h3><div class="cc-hero-preview" data-format="${format}"><img src="${esc(creatorImageUrl(page,id,'medium'))}" alt="Vorschau Titelbild ${i+1}" loading="lazy" decoding="async" style="${creatorHeroCropStyle(crop)}" data-cc-hero-preview></div>
        <label>Darstellung<select data-cc-hero-adjust="fit" ${disabled}><option value="cover" ${crop.fit==='cover'?'selected':''}>Fläche ausfüllen</option><option value="contain" ${crop.fit==='contain'?'selected':''}>Ganzes Bild zeigen</option></select></label>
        <label>Horizontal · links / rechts <output data-cc-hero-value="x">${crop.x}%</output><input type="range" min="0" max="100" step="1" value="${crop.x}" data-cc-hero-adjust="x" ${disabled}></label>
        <label>Vertikal · oben / unten <output data-cc-hero-value="y">${crop.y}%</output><input type="range" min="0" max="100" step="1" value="${crop.y}" data-cc-hero-adjust="y" ${disabled}></label>
        <div class="cc-hero-actions"><button type="button" data-cc-action="hero-crop-save" data-id="${esc(page.id)}" data-image="${esc(id)}" ${disabled}>Ausschnitt speichern</button>${independent?`<button type="button" data-cc-action="hero-move" data-id="${esc(page.id)}" data-image="${esc(id)}" data-direction="-1" ${i===0||state.mediaBusy?'disabled':''} aria-label="Titelbild ${i+1} nach vorne">↑</button><button type="button" data-cc-action="hero-move" data-id="${esc(page.id)}" data-image="${esc(id)}" data-direction="1" ${i===own.length-1||state.mediaBusy?'disabled':''} aria-label="Titelbild ${i+1} nach hinten">↓</button><button type="button" data-cc-action="hero-delete" data-id="${esc(page.id)}" data-image="${esc(id)}" ${disabled}>Titelbild entfernen</button>`:''}</div>
      </article>`;
    }).join('')}</div>
    <p class="cc-muted">Die Vorschau zeigt denselben Ausschnitt wie die Webseite. Je nach Bildformat bewegt ein Regler nur den überstehenden Bildteil. Ohne eigene Titelbilder werden die ausgewählten Paketfotos angezeigt.</p>
    <div class="cc-hero-options">${(page.photoIds||[]).filter(id=>(page.products||[]).some(p=>p.active!==false&&p.imageIds?.includes(id))).map((id,i)=>`<label><input type="checkbox" data-cc-hero="${esc(page.id)}" value="${esc(id)}" ${(page.heroPhotoIds||[]).includes(id)?'checked':''} ${disabled}>Paketfoto ${i+1}${ccImage(state.images?.[id]?.cdn?.thumb||state.images?.[id]?.data)?`<img src="${ccImage(state.images[id].cdn?.thumb||state.images[id].data)}" alt="Paketfoto ${i+1}" loading="lazy">`:''}</label>`).join('')}</div>
  </details>`;
}
