import { ccEscape as esc, ccImage } from './content-creator.js';
import { euro } from './content-creator-shop.js';

// Lucide paths, rendered inline: no icon library/CDN request or hydration delay.
const paths = {
  'shopping-bag': '<path d="M16 10V6a4 4 0 0 0-8 0v4"/><path d="M3.5 7h17l1 14h-19z"/>',
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
export const DISPLAY_VERSION = 3;
export function creatorImageUrl(page, file, size = 'thumb') {
  return `/api/content-creator-shop?${new URLSearchParams({op:'image',pageId:page.id,file,size,display:String(DISPLAY_VERSION),v:String(page.updatedAt || page.createdMs || '')})}`;
}
export function publicCreatorPage(page, id) {
  const photoIds = [...new Set((page.photoIds || []).filter(key => /^[a-zA-Z0-9_-]{1,64}$/.test(key)))].slice(0,30);
  return {id, published:true, kind:page.kind === 'shop' ? 'shop' : 'promo', name:String(page.name || '').slice(0,160),
    avatar:ccImage(page.avatar), updatedAt:typeof page.updatedAt === 'string' ? page.updatedAt : '', createdMs:Number(page.createdMs)||0, photoIds,
    products:(page.products || []).filter(p => p.active !== false && /^[a-zA-Z0-9_-]{1,64}$/.test(p.id) && Number.isSafeInteger(p.priceCents) && p.priceCents >= 0).slice(0,10).map(p=>({id:p.id,title:String(p.title || 'Pako fotosh').slice(0,120),priceCents:p.priceCents,active:true,imageIds:photoIds.filter(key=>p.imageIds?.includes(key))}))};
}
export function creatorOfferButton(product, {busy = '', selected = false} = {}) {
  const free = product.priceCents === 0;
  return `<button type="button" class="shop-buy${selected ? ' is-added' : ''}" data-shop="${free?'free-save':'add'}" data-product="${esc(product.id)}" ${busy || selected ? 'disabled' : ''}>${creatorIcon(busy ? 'refresh-cw' : free ? 'save' : selected ? 'check' : 'shopping-bag')}<span>${busy===product.id?'Duke përgatitur…':free?'Ruaj fotot':selected?'Në shportë':'Shto në shportë'}</span></button>`;
}
export function creatorPhoto(page, id, alt, {src, size='thumb', eager=false, active=true} = {}) {
  const url = src || creatorImageUrl(page,id,size);
  return `<img ${active?`src="${esc(url)}"`:`data-deferred-src="${esc(url)}"`} data-photo="${esc(id)}" data-size="${size}" data-alt="${esc(alt)}" alt="${esc(alt)}" width="360" height="450" decoding="async" loading="${eager?'eager':'lazy'}" fetchpriority="${eager?'high':'auto'}" draggable="false">`;
}
export function renderCreatorCatalog(page, {ids=[], positions={}, offerButton, photo} = {}) {
  const products = (page.products || []).filter(p=>p.active!==false && p.imageIds?.some(id=>page.photoIds.includes(id)));
  const img = photo || ((id,alt,opts)=>creatorPhoto(page,id,alt,opts));
  const offer = offerButton || (product=>creatorOfferButton(product,{selected:ids.includes(product.id)}));
  return `<header class="shop-header"><a href="/" class="shop-logo" aria-label="MNYRA">MNYRA<span class="shop-logo-dot"></span></a><button type="button" data-shop="cart" class="shop-cart" aria-label="Hap shportën">${creatorIcon('shopping-bag')}<b ${ids.length?'':'hidden'}>${ids.length}</b></button></header>
    <section class="shop-hero"><div class="shop-hero-meta"><span class="shop-studio-tag">Krijuar vetëm për ju</span>${ccImage(page.avatar)?`<img class="avatar" src="${ccImage(page.avatar)}" width="42" height="42" alt="${esc(page.name)}">`:''}</div><h1>${esc(page.name)}</h1><p>Foto të veçanta. Gati për t’u publikuar.</p><div class="shop-hero-line"><span></span>${creatorIcon('arrow-up-right')}</div></section>
    <div class="shop-section-title"><h2>Koleksioni juaj</h2><span>${products.length} ${products.length===1?'pako':'pako'} ${creatorIcon('images')}</span></div>
    <section class="shop-products">${products.map((product,pi)=>{
      const files=page.photoIds.filter(id=>product.imageIds.includes(id)),position=positions[product.id]||0;
      return `<article class="shop-product"><div class="shop-carousel"><div class="shop-track" data-track="${esc(product.id)}">${files.map((id,i)=>`<button type="button" class="shop-slide" data-shop="view" data-product="${esc(product.id)}" data-index="${i}" aria-label="Shiko foton ${i+1} të pakos ${esc(product.title)}">${img(id,`${product.title} · ${i+1}`,{active:i===position,eager:pi<2&&i===position,size:'thumb'})}</button>`).join('')}</div><span class="shop-photo-count">${creatorIcon('images')}${files.length}</span><span class="shop-expand">${creatorIcon('expand')}</span>${files.length>1?`<button class="shop-arrow shop-prev" data-shop="slide" data-product="${esc(product.id)}" data-step="-1" aria-label="Fotoja paraprake">${creatorIcon('chevron-left')}</button><button class="shop-arrow shop-next" data-shop="slide" data-product="${esc(product.id)}" data-step="1" aria-label="Fotoja tjetër">${creatorIcon('chevron-right')}</button><div class="shop-dots">${files.map((_,i)=>`<button data-shop="dot" data-product="${esc(product.id)}" data-index="${i}" aria-label="Foto ${i+1}" aria-pressed="${position===i}"></button>`).join('')}</div>`:''}</div><div class="shop-product-info"><div class="shop-price-row"><h3>${esc(product.title)}</h3><strong>${product.priceCents===0?'Falas':euro(product.priceCents)}</strong></div><p>${files.length} foto · Cilësi origjinale</p>${offer(product)}</div></article>`;
    }).join('')}</section>`;
}
export function creatorHowTo(page) {
  const free=page.products.some(p=>p.active!==false&&p.priceCents===0),paid=page.products.some(p=>p.active!==false&&p.priceCents>0);
  return `<section class="shop-how"><div class="shop-how-heading"><span class="shop-studio-tag">E thjeshtë, që në fillim</span><h2>Si funksionon?</h2><p>Nga një foto e bukur te postimi juaj i radhës.</p></div><div class="shop-how-steps"><article><span>${creatorIcon('images')}</span><div><h3>Gjeni të preferuarat</h3><p>Rrëshqitni fotot. Prekni një foto për ta parë të plotë.</p></div><b>01</b></article><article><span>${creatorIcon(free?'save':'shopping-bag')}</span><div><h3>${free?'Ruajini në telefon':'Zgjidhni pakon tuaj'}</h3><p>${free?'Pakot falas ruhen direkt, pa porosi. Hapni menynë e ruajtjes dhe zgjidhni “Ruaj imazhet”.':'Shtoni në shportë pakon që ju pëlqen dhe konfirmoni porosinë.'}</p></div><b>02</b></article><article><span>${creatorIcon(paid?'shield-check':'check')}</span><div><h3>${paid?'Origjinalet janë tuajat':'Gati për t’u publikuar'}</h3><p>${paid?'Për pakot me pagesë, origjinalet hapen pas konfirmimit të pagesës.':'Publikojini në Instagram, Facebook ose kudo që dëshironi.'}</p></div><b>03</b></article></div></section>`;
}
