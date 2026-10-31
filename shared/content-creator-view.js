import {creatorHeroFormat,creatorHeroCrop,creatorHeroCropStyle} from './creator-hero.js';
import { ccEscape as esc, ccImage } from './content-creator.js';
import { euro } from './content-creator-shop.js';
import {creatorPublicMedia,creatorHeroImages} from './creator-media.js';

// Lucide paths, rendered inline: no icon library/CDN request or hydration delay.
const paths = {
  'pause': '<path d="M9 5v14M15 5v14"/>',
  'play': '<path d="m8 5 11 7-11 7Z"/>',
  'calendar': '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  'shopping-bag': '<path d="M16 10V6a4 4 0 0 0-8 0v4"/><path d="M5 7h14l1 12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/>',
  'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
  'arrow-right': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'x': '<path d="m18 6-12 12M6 6l12 12"/>',
  'check': '<path d="m20 6-11 11-5-5"/>',
  'image': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  'images': '<rect x="7" y="3" width="14" height="14" rx="2"/><path d="M17 21H5a2 2 0 0 1-2-2V7m4 6 4-4 6 6"/>',
  'expand': '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  'save': '<path d="M12 3v12m-5-5 5 5 5-5M5 16v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/>',
  'shield-check': '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
  'refresh-cw': '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-2L20 8M4 16l2.4 3A7 7 0 0 0 18 17"/>'
};
export function creatorIcon(name) {
  return `<svg class="cc-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.image}</svg>`;
}
export const DISPLAY_VERSION = 4;
export function creatorImageUrl(page, file, size = 'thumb') {
  const media = creatorPublicMedia(page)[file] || creatorHeroImages(page).find(image=>image.id===file);
  if (media?.[size]) return media[size];
  return `/api/content-creator-shop?${new URLSearchParams({op:'image',pageId:page.id,file,size,display:String(DISPLAY_VERSION),v:String(page.updatedAt || page.createdMs || '')})}`;
}
export function publicCreatorPage(page, id) {
  const photoIds = [...new Set((page.photoIds || []).filter(key => /^[a-zA-Z0-9_-]{1,64}$/.test(key)))].slice(0,30);
  return {id, published:true, media:creatorPublicMedia(page),heroImages:creatorHeroImages(page),heroFormat:creatorHeroFormat(page),heroCrop:Object.fromEntries(creatorHeroFiles(page).map(id=>[id,creatorHeroCrop(page,id)])),kind:page.kind === 'shop' ? 'shop' : 'promo', name:String(page.name || '').slice(0,160),
    avatar:ccImage(page.avatar), heroPhotoIds:[...new Set((Array.isArray(page.heroPhotoIds)?page.heroPhotoIds:[]).filter(id=>photoIds.includes(id)))].slice(0,6), updatedAt:typeof page.updatedAt === 'string' ? page.updatedAt : '', createdMs:Number(page.createdMs)||0, photoIds,
    products:(page.products || []).filter(p => p.active !== false && /^[a-zA-Z0-9_-]{1,64}$/.test(p.id) && Number.isSafeInteger(p.priceCents) && p.priceCents >= 0).slice(0,10).map(p=>({id:p.id,title:String(p.title || 'Pako fotosh').slice(0,120),priceCents:p.priceCents,active:true,imageIds:photoIds.filter(key=>p.imageIds?.includes(key))}))};
}
export function creatorOfferButton(product, {busy = '', selected = false} = {}) {
  const free = product.priceCents === 0;
  return `<button type="button" class="shop-buy${selected ? ' is-added' : ''}" data-shop="${free?'free-save':'add'}" data-product="${esc(product.id)}" ${busy || selected ? 'disabled' : ''}>${creatorIcon(busy ? 'refresh-cw' : free ? 'save' : selected ? 'check' : 'shopping-bag')}<span>${busy===product.id?'Duke përgatitur…':free?'Ruaj fotot':selected?'Në shportë':'Shto në shportë'}</span></button>`;
}
export function creatorPhoto(page, id, alt, {src, size='thumb', eager=false, active=true, hero=false} = {}) {
  const url = (active ? src : undefined) || creatorImageUrl(page,id,size);
  const products=(page.products||[]).filter(product=>product.active!==false&&product.imageIds?.includes(id));
  const protectedPreview=page.kind==='shop'&&products.some(product=>product.priceCents>0)&&!products.some(product=>product.priceCents===0)&&!creatorHeroImages(page).some(image=>image.id===id);
  const candidates=hero?`${creatorImageUrl(page,id,'medium')} 1080w, ${creatorImageUrl(page,id,'large')} 1600w`:'';
  const responsive=hero?` ${active?'srcset':'data-deferred-srcset'}="${esc(candidates)}" sizes="(min-width: 480px) 440px, calc(100vw - 40px)" data-hero-image style="${creatorHeroCropStyle(creatorHeroCrop(page,id))}"`:'';
  return `<img ${protectedPreview?'data-protected-preview ':''}${active?`src="${esc(url)}"`:`data-deferred-src="${esc(url)}"`}${responsive} data-photo="${esc(id)}" data-size="${size}" data-alt="${esc(alt)}" alt="${esc(alt)}" width="360" height="450" decoding="async" loading="${eager?'eager':'lazy'}" fetchpriority="${eager?'high':'auto'}" draggable="false">`;
}
export function creatorHeroFiles(page) {
  const independent=creatorHeroImages(page);
  if(independent.length)return independent.map(image=>image.id);
  const allowed=page.kind==='shop'?(page.photoIds||[]).filter(id=>(page.products||[]).some(p=>p.active!==false&&p.imageIds?.includes(id))):(page.photoIds||[]);
  const chosen=(Array.isArray(page.heroPhotoIds)?page.heroPhotoIds:[]).filter(id=>allowed.includes(id));
  const defaults=(page.products||[]).filter(p=>p.active!==false).map(p=>p.imageIds?.find(id=>allowed.includes(id))).filter(Boolean);
  return [...new Set(chosen.length?chosen:defaults.length?defaults:allowed.slice(0,3))].slice(0,6);
}
export function creatorIntroduction(page, photo) {
  const files=creatorHeroFiles(page);
  return `<section class="shop-introduction">
    ${files.length?`<div class="shop-hero-gallery" aria-label="Shembuj te punes sone" aria-roledescription="carousel"><div class="shop-hero-track" data-hero-track data-format="${creatorHeroFormat(page)}">${files.map((id,i)=>`<div class="shop-hero-slide">${photo(id,`Foto per ${page.name} · ${i+1}`,{size:'medium',hero:true,active:i===0,eager:i===0})}</div>`).join('')}</div>${files.length>1?`<div class="shop-hero-controls"><div class="shop-hero-dots">${files.map((_,i)=>`<button type="button" data-shop="hero-dot" data-index="${i}" aria-label="Foto e prezantimit ${i+1}" aria-pressed="${i===0}"></button>`).join('')}</div><button type="button" data-shop="hero-toggle" aria-label="Ndalo nderrimin automatik">${creatorIcon('pause')}</button></div>`:''}</div>`:''}
    <div class="shop-intro-copy"><span class="shop-studio-tag">mnyra <span aria-hidden="true">×</span> ${esc(page.name)}</span><h1>Biznesi yt meriton<br>me u pa.</h1>
    <p>Ti kujdesesh per biznesin. Por nuk eshte lehte me gjet kohe edhe per foto, postime e mesazhe.</p>
    <p>Sot, shume njerez te shohin ne telefon para se me ble ose me te vizitu. Shikojne fotot, produktet dhe cka thone klientet. Aty krijohet pershtypja e pare.</p>
    <p>Ne krijojme foto e video qe tregojne bukur ate qe ofron. Per dyqanin, restorantin, kafene, butiken apo produktet qe shet online.</p>
    <p class="shop-intro-close">Andaj, ju kemi pergatitur disa foto falas. Te tjerat jane me pagese, me cmim te arsyeshem. Merrni sot, paguani me 1 te muajit te ardhshem.</p>
    <a class="shop-details-link" href="#shop-faq">Me poshte i gjeni te gjitha detajet ${creatorIcon('arrow-right')}</a></div>
  </section>`;
}
export function renderCreatorCatalog(page, {ids=[], positions={}, offerButton, photo} = {}) {
  const products = (page.products || []).filter(p=>p.active!==false && p.imageIds?.some(id=>page.photoIds.includes(id)));
  const img = photo || ((id,alt,opts)=>creatorPhoto(page,id,alt,opts));
  const offer = offerButton || (product=>creatorOfferButton(product,{selected:ids.includes(product.id)}));
  return `<header class="shop-header"><a href="/" class="shop-logo" aria-label="MNYRA">MNYRA<span class="shop-logo-dot"></span></a><button type="button" data-shop="cart" class="shop-cart" aria-label="Hap shportën">${creatorIcon('shopping-bag')}<b ${ids.length?'':'hidden'}>${ids.length}</b></button></header>
    <div class="shop-weekly">${creatorIcon('calendar')}<span>Çdo javë, foto të reja për ju.</span></div>
    ${creatorIntroduction(page,img)}
    ${[{title:'Falas për ty',items:products.filter(p=>p.priceCents===0)},{title:'Me çmim të arsyeshëm',items:products.filter(p=>p.priceCents>0)}].filter(group=>group.items.length).map(group=>`<section class="shop-collection"><div class="shop-section-title"><h2>${group.title}</h2><span>${group.items.length} pako ${creatorIcon('images')}</span></div>
    <div class="shop-products">${group.items.map((product)=>{
      const files=page.photoIds.filter(id=>product.imageIds.includes(id)),position=positions[product.id]||0;
      return `<article class="shop-product"><div class="shop-carousel"><div class="shop-track" data-track="${esc(product.id)}">${files.map((id,i)=>`<button type="button" class="shop-slide" data-shop="view" data-product="${esc(product.id)}" data-index="${i}" aria-label="Shiko foton ${i+1} të pakos ${esc(product.title)}">${img(id,`${product.title} · ${i+1}`,{active:i===position,eager:false,size:'thumb'})}</button>`).join('')}</div><span class="shop-photo-count">${creatorIcon('images')}${files.length}</span><span class="shop-expand">${creatorIcon('expand')}</span>${files.length>1?`<button class="shop-arrow shop-prev" data-shop="slide" data-product="${esc(product.id)}" data-step="-1" aria-label="Fotoja paraprake">${creatorIcon('chevron-left')}</button><button class="shop-arrow shop-next" data-shop="slide" data-product="${esc(product.id)}" data-step="1" aria-label="Fotoja tjetër">${creatorIcon('chevron-right')}</button><div class="shop-dots">${files.map((_,i)=>`<button data-shop="dot" data-product="${esc(product.id)}" data-index="${i}" aria-label="Foto ${i+1}" aria-pressed="${position===i}"></button>`).join('')}</div>`:''}</div><div class="shop-product-info"><div class="shop-price-row"><h3>${esc(product.title)}</h3><strong>${product.priceCents===0?'Falas':euro(product.priceCents)}</strong></div><p>${files.length} foto · Cilësi origjinale</p>${offer(product)}</div></article>`;
    }).join('')}</div></section>`).join('')}`;
}
export function creatorHowTo(page) {
  return `<section class="shop-how" id="shop-faq" aria-labelledby="shop-faq-title"><div class="shop-how-heading"><span class="shop-studio-tag">Gjithçka që duhet të dini</span><h2 id="shop-faq-title">Pyetje të shpeshta</h2></div>
    <details data-faq="how"><summary>Si funksionon? ${creatorIcon('chevron-right')}</summary><div class="shop-how-steps">
      <article><span>${creatorIcon('images')}</span><div><h3>Zgjidhni fotot</h3><p>Shikoni fotot dhe zgjidhni pakot që dëshironi të postoni në Instagram, Facebook apo rrjete të tjera sociale.</p></div><b>01</b></article>
      <article><span>${creatorIcon('shopping-bag')}</span><div><h3>Konfirmoni blerjen</h3><p>Shtoni pakot në shportë dhe plotësoni të dhënat e lokalit. Pas porosisë, ruajini fotot në telefon dhe përdorini menjëherë. Fotot falas i ruani pa porosi.</p></div><b>02</b></article>
      <article><span>${creatorIcon('calendar')}</span><div><h3>Paguani në fillim të muajit</h3><p>Më 1 të muajit të ardhshëm vijmë te lokali juaj për pagesën e fotove të blera. Thjesht, lehtë dhe pa pagesë sot.</p></div><b>03</b></article></div></details>
    <details data-faq="custom"><summary>Foto sipas dëshirës suaj ${creatorIcon('chevron-right')}</summary><p>Keni një ide, një produkt të ri apo një ofertë për të prezantuar? Na tregoni çfarë dëshironi: produktin, stilin, ngjyrat dhe ku do ta përdorni foton. Mund të na dërgoni edhe një shembull. Së bashku i sqarojmë detajet dhe çmimin para se të fillojmë.</p></details>
    <details data-faq="video"><summary>A krijoni edhe video? ${creatorIcon('chevron-right')}</summary><p>Po, krijojmë edhe video për produktet, lokalin dhe ofertat tuaja, përfshirë Reels dhe Stories. Na shkruani në çdo kohë aty ku ju dërguam këtë link. Na tregoni idenë tuaj dhe ne ju shpjegojmë mundësitë dhe çmimin.</p></details>
    <details data-faq="free"><summary>A janë vërtet falas? ${creatorIcon('chevron-right')}</summary><p>Po. Pakot e shënuara “Falas” janë dhuratë për ${esc(page.name)}. Ruajini dhe postojini pa pagesë dhe pa detyrim për të blerë foto të tjera. Çmimi i çdo pakoje tjetër shfaqet para porosisë.</p></details>
  </section>
  <section class="answer shop-answer" aria-labelledby="shop-answer-title"><h2 id="shop-answer-title">A dëshironi të krijojmë më shumë foto për biznesin tuaj?</h2><div class="answer-content" aria-live="polite"><p>Na ndihmoni të kuptojmë çfarë ju intereson. Pa asnjë detyrim.</p><div class="answers"><button type="button" data-answer="yes">Po, më intereson</button><button type="button" data-answer="no">Jo, faleminderit</button></div><p id="answer-error" role="alert"></p></div></section>`;
}
export function creatorFooter(page) {
  return `<footer class="shop-footer"><a class="shop-logo" href="/" aria-label="MNYRA">MNYRA<span class="shop-logo-dot"></span></a><p>Biznesi yt meriton me u pa.</p><div><span>Krijuar për ${esc(page.name)}</span><a href="#shop-faq">Pyetje të shpeshta ${creatorIcon('arrow-up-right')}</a></div></footer>`;
}

export function renderCreatorPromo(page){
  return `<a class="brand shop-logo" href="/">MNYRA</a><header class="greeting"><h1><span>Përshëndetje,</span>${esc(page.name)}.</h1>${ccImage(page.avatar)?`<img class="avatar" src="${ccImage(page.avatar)}" alt="${esc(page.name)}">`:''}</header>
        <section class="intro"><p class="eyebrow">Krijuar për ju</p><p>Ne jemi MNYRA. Krijojmë foto dhe video për Instagram, Facebook dhe TikTok, posaçërisht për <strong>${esc(page.name)}</strong>.</p><div class="free">Këto foto janë një dhuratë nga ne. Mbajeni të shtypur foton për ta ruajtur në telefon.</div></section>
        <section class="gallery" aria-label="Fotot për lokalin tuaj">${page.photoIds.map((key,i)=>`<figure class="photo"><img src="${page.media?.[key]?creatorImageUrl(page,key,'medium'):'/api/content-creator?'+new URLSearchParams({id:page.id,asset:'1',photo:key,v:page.updatedAt||''})}" width="360" height="450" alt="Foto ${i+1} për ${esc(page.name)}" loading="${i<2?'eager':'lazy'}" decoding="async"></figure>`).join('')}</section>
        <section class="faq"><h2>Pyetje dhe përgjigje</h2><details><summary>A mund t’i përdorim menjëherë?</summary><p>Po. Ruajini në telefon dhe përdorini në rrjetet tuaja sociale, pa asnjë detyrim.</p></details><details><summary>Si funksionon bashkëpunimi?</summary><p>Flasim për nevojat tuaja dhe i dakordojmë së bashku shërbimet dhe çmimin para se të fillojmë.</p></details></section>
        <section class="answer"><h2>A jeni të interesuar për më shumë foto për lokalin tuaj?</h2><div class="answer-content"><p>Një përgjigje e shkurtër. Pa asnjë detyrim.</p><div class="answers"><button data-answer="yes">Po, më intereson</button><button data-answer="no">Jo, faleminderit</button></div><p id="answer-error" role="alert"></p></div></section><footer>MNYRA · PËR BIZNESIN TUAJ</footer>`;
}
