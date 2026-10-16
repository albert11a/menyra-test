import { money, SHOP_CATEGORIES, filterCatalog } from '../../shared/lifeskin-storefront.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export const sfIcon = name => `<svg class="sf-icon" aria-hidden="true"><use href="/apps/lifeskin-shop/icons.svg#${name}"></use></svg>`;
const image = (p, lazy = true, index = 0) => p.images[index] ? `<img src="${esc(p.images[index])}" alt="${esc(p.name)}" width="640" height="800" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">` : '<span class="sf-card-placeholder">lifeskin<span>Foto se shpejti</span></span>';
export function productCard(p) {
  return `<article class="sf-card"><a href="/lifeskinshop/p/${encodeURIComponent(p.id)}" class="sf-card-image" data-sf-product="${esc(p.id)}">${image(p)}${p.badge ? `<span class="sf-card-label">${esc(p.badge)}</span>` : ''}<span class="sf-card-look">Shiko produktin ${sfIcon('ArrowUpRight')}</span></a><div class="sf-card-info"><span class="sf-card-category">${esc(p.label)}</span><a class="sf-card-name" href="/lifeskinshop/p/${encodeURIComponent(p.id)}" data-sf-product="${esc(p.id)}">${esc(p.name)}</a><p>${esc(p.subtitle)}</p><div class="sf-card-meta"><strong>${money(p.price)}</strong><span>${esc(p.size)}</span></div><button type="button" class="sf-card-add" data-sf-add="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''}>${sfIcon('ShoppingBag')}${p.soldOut ? 'Nuk ka ne stok' : 'Shto ne shport'}</button><button type="button" class="sf-card-buy" data-sf-buy="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''}>Porosit ${sfIcon('ArrowRight')}</button></div></article>`;
}
export function productDetail(p) {
  return `<nav class="sf-breadcrumb" aria-label="Vendndodhja"><button type="button" data-sf-home>Ballina</button>${sfIcon('ChevronRight')}<button type="button" data-sf-category="${esc(p.category)}">${esc(p.label)}</button>${sfIcon('ChevronRight')}<span>${esc(p.name)}</span></nav><div class="sf-detail"><div class="sf-gallery"><div class="sf-detail-photo">${image(p, false)}</div>${p.images.length > 1 ? `<div class="sf-thumbnails" role="group" aria-label="Fotot e produktit">${p.images.map((url, i) => `<button type="button" data-sf-image="${i}" aria-pressed="${i === 0}" aria-label="Foto ${i + 1}"><img src="${esc(url)}" alt="" width="72" height="90"></button>`).join('')}</div>` : ''}</div><div class="sf-detail-copy"><span class="sf-kicker">${esc(p.label)} / LIFESKIN</span><h1 id="sf-product-title">${esc(p.name)}</h1><p class="sf-detail-subtitle">${esc(p.subtitle)}</p><div class="sf-pdp-price"><strong>${money(p.price)}</strong><span>${esc(p.size)}</span></div><p class="sf-product-description">${esc(p.description)}</p>${p.skinTypes ? `<p class="sf-skin-types">${sfIcon('Sparkles')}${esc(p.skinTypes)}</p>` : ''}<div class="sf-pdp-quantity"><span>Sasia</span><div class="sf-quantity"><button type="button" data-sf-pdp-qty="-1" aria-label="Zvogelo sasine">${sfIcon('Minus')}</button><output id="sf-pdp-quantity">1</output><button type="button" data-sf-pdp-qty="1" aria-label="Rrit sasine">${sfIcon('Plus')}</button></div>${p.soldOut ? '<span class="sf-stock">Nuk ka ne stok</span>' : ''}</div><button type="button" class="sf-button sf-button-dark" data-sf-add="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''}>${sfIcon('ShoppingBag')}Shto ne shport <span>${money(p.price)}</span></button><button type="button" class="sf-button sf-button-outline" data-sf-buy="${esc(p.id)}" ${p.soldOut ? 'disabled' : ''}>Porosit tani ${sfIcon('ArrowRight')}</button><div class="sf-pdp-services"><span>${sfIcon('Truck')}Dergesa 1–3 dite</span><span>${sfIcon('Banknote')}Pagesa te dera</span><span>${sfIcon('ShieldCheck')}45 dite garanci</span></div><div class="sf-pdp-accordions"><details open><summary>Per produktin ${sfIcon('Plus')}</summary><p>${esc(p.description)}</p></details>${p.usage.length ? `<details><summary>Si perdoret? ${sfIcon('Plus')}</summary>${p.usage.map(line => `<p>${esc(line)}</p>`).join('')}</details>` : ''}${p.ingredients.length ? `<details><summary>Perberesit kryesore ${sfIcon('Plus')}</summary><p>${p.ingredients.map(esc).join(' · ')}</p></details>` : ''}<details><summary>Dergesa dhe garancia ${sfIcon('Plus')}</summary><p>Pagesen e ben kur e merr porosine. Te kontaktojme per konfirmim. Garancia vlen sipas kushteve te blerjes.</p><a href="/apps/lifeskin-shop/kushtet.html">Lexo kushtet</a></details></div><a class="sf-pdp-help" href="https://wa.me/436508564879" target="_blank" rel="noopener">${sfIcon('Phone')}Ke pyetje? Na shkruaj ne WhatsApp ${sfIcon('ArrowUpRight')}</a></div></div>`;
}
export class Storefront {
  constructor(shop) { this.shop = shop; this.doc = shop.dok; this.filter = 'all'; this.sort = 'recommended'; this.search = ''; this.limit = 12; this.quantity = 1; }
  start() {
    if (!this.doc.getElementById?.('storefront-home')) return;
    this.doc.addEventListener('click', event => {
      const button = event.target.closest?.('[data-sf-help],[data-sf-product],[data-sf-add],[data-sf-buy],[data-sf-category],[data-sf-filter],[data-sf-home],[data-sf-duo],[data-sf-products],[data-sf-retry],[data-sf-image],[data-sf-cart],[data-sf-cart-close],[data-sf-discard],[data-sf-qty],[data-sf-remove],[data-sf-checkout],[data-sf-more],[data-sf-pdp-qty]');
      if (!button) return;
      const d = button.dataset;
      if ('sfHelp' in d) { event.preventDefault(); this.home(false); this.doc.getElementById('sf-help')?.scrollIntoView({block:'start'}); }
      else if ('sfProduct' in d) { event.preventDefault(); this.open(d.sfProduct); }
      else if ('sfAdd' in d || 'sfBuy' in d) {
        const id = d.sfAdd || d.sfBuy;
        if (!this.shop.catalogReady || !this.shop.catalogProducts.some(p => p.id === id && !p.soldOut)) return;
        if (!this.shop.catalogHinzufuegen(id, this.activeProduct?.id === id ? this.quantity : 1)) { this.openCart(); return; }
        if ('sfBuy' in d) { this.closeCart(); this.shop.kasseOeffnen(); } else { this.added = id; this.openCart(); }
      }
      else if ('sfCategory' in d || 'sfFilter' in d) { this.filter = d.sfCategory || d.sfFilter; this.limit = 12; this.home(true); this.render(); }
      else if ('sfRetry' in d) void this.shop.catalogLaden();
      else if ('sfImage' in d) this.changeImage(Number(d.sfImage));
      else if ('sfHome' in d || 'sfProducts' in d) { event.preventDefault(); if ('sfProducts' in d) { this.filter = 'all'; this.search = ''; const field = this.doc.getElementById('sf-search'); if (field) field.value = ''; this.render(); } this.home('sfProducts' in d); }
      else if ('sfDuo' in d) this.duo();
      else if ('sfCart' in d) this.openCart();
      else if ('sfCartClose' in d) this.closeCart();
      else if ('sfDiscard' in d) this.shop.catalogZbraze();
      else if ('sfQty' in d) this.shop.catalogMenge(d.sfId, (this.shop.korb.mengen?.[d.sfId] || 1) + Number(d.sfQty));
      else if ('sfRemove' in d) this.shop.catalogMenge(d.sfRemove, 0);
      else if ('sfCheckout' in d && this.shop.korb.ids.length) { this.closeCart(); this.shop.kasseOeffnen(); }
      else if ('sfMore' in d) { this.limit += 12; this.render(); }
      else if ('sfPdpQty' in d) { this.quantity = Math.max(1, Math.min(20, this.quantity + Number(d.sfPdpQty))); this.doc.getElementById('sf-pdp-quantity').textContent = this.quantity; }
    });
    this.doc.getElementById('sf-sort')?.addEventListener('change', event => { this.sort = event.target.value; this.render(); });
    this.doc.getElementById('sf-search')?.addEventListener('input', event => { this.search = event.target.value; this.limit = 12; this.home(true, false); this.render(); });
    this.doc.addEventListener('click', event => { if (event.target.closest?.('[data-ls-start]')) { this.closeMenu(); this.closeCart(); } });
    const cart = this.doc.getElementById('sf-cart');
    cart?.addEventListener('click', event => { if (event.target === cart && event.clientX < cart.getBoundingClientRect().left) cart.close(); });
    this.doc.defaultView?.addEventListener('popstate', () => this.restoreRoute());
    this.restoreRoute();
  }
  restoreRoute() {
    const location = this.doc.defaultView?.location;
    const pathId = location?.pathname?.match(/\/p\/([\w-]+)\/?$/)?.[1];
    const queryId = new URLSearchParams(location?.search || '').get('produkt');
    if (pathId || queryId) { this.pendingProduct = pathId || queryId; if (this.shop.catalogReady) this.open(this.pendingProduct, false); else { this.show('product'); this.doc.getElementById('sf-product-content').innerHTML = '<div class="sf-empty" role="status">Po ngarkohet produkti...</div>'; } return; }
    if (location?.hash === '#acne-duo' || ['#rezultate', '#setet', '#klientet', '#zgjedhja'].includes(location?.hash)) this.duo(false);
    else this.home(location?.hash === '#sf-products', false);
  }
  closeMenu() { const menu = this.doc.getElementById('menu'); if (menu?.open) menu.close(); this.doc.getElementById('menu-hap')?.setAttribute('aria-expanded', 'false'); }
  base() { return /^(www\.)?lifeskin-ks\.com$/.test(this.doc.defaultView?.location?.hostname || '') ? '' : '/lifeskinshop'; }
  route(suffix) { const location = this.doc.defaultView?.location; if (!location) return; const params = new URLSearchParams(location.search); params.delete('produkt'); const [path, hash] = suffix.split('#'); const pathname = `${this.base()}${path}` || '/'; this.doc.defaultView.history?.pushState(null, '', `${pathname}${params.size ? `?${params}` : ''}${hash ? `#${hash}` : ''}`); }
  show(view) { for (const [id,name] of [['storefront-home','home'],['sf-duo-page','duo'],['sf-product','product']]) { const node = this.doc.getElementById(id); if (node) node.hidden = name !== view; } this.doc.documentElement.dataset.storeView = view; this.closeMenu(); }
  home(toProducts = false, push = true) { this.doc.title = 'LIFESKIN — Skincare, your way.'; this.activeProduct = null; this.pendingProduct = ''; this.show('home'); if (push) this.route(toProducts ? '#sf-products' : ''); if (toProducts) this.doc.getElementById('sf-products')?.scrollIntoView({ block:'start' }); else if (push) this.doc.defaultView?.scrollTo({ top:0, behavior:'instant' }); }
  duo(push = true) { this.show('duo'); if (push) { this.route('#acne-duo'); this.doc.defaultView?.scrollTo({ top:0, behavior:'instant' }); } }
  render() {
    const grid = this.doc.getElementById?.('sf-grid'); if (!grid) return;
    const error = this.doc.getElementById('sf-catalog-error');
    if (!this.shop.catalogReady && this.shop.catalogLoading) { grid.setAttribute('aria-busy','true'); error.hidden = true; this.doc.getElementById('sf-results').textContent = 'Po ngarkohen produktet...'; return; }
    grid.setAttribute('aria-busy','false'); error.hidden = this.shop.catalogReady;
    if (!this.shop.catalogReady) { grid.innerHTML = ''; this.doc.getElementById('sf-results').textContent = 'Produktet nuk u ngarkuan.'; return; }
    const products = filterCatalog(this.shop.catalogProducts, { category:this.filter, search:this.search, sort:this.sort });
    grid.innerHTML = products.slice(0,this.limit).map(productCard).join('') || `<div class="sf-empty">${sfIcon('Search')}<h3>Nuk u gjet asnje produkt.</h3><p>Provo nje emer ose kategori tjeter.</p><button type="button" data-sf-products>Shiko te gjitha</button></div>`;
    this.doc.getElementById('sf-results').textContent = `${products.length} produkte`;
    const more = this.doc.getElementById('sf-load-more'); if (more) more.hidden = products.length <= this.limit;
    for (const button of this.doc.querySelectorAll('[data-sf-filter]')) button.setAttribute('aria-pressed', String(button.dataset.sfFilter === this.filter));
    const categories = [...new Set(this.shop.catalogProducts.map(p => p.category))];
    const filters = this.doc.querySelector('.sf-filters');
    if (filters && filters.dataset.categories !== categories.join(',')) { filters.dataset.categories = categories.join(','); filters.innerHTML = [['all','Te gjitha'], ...categories.map(key => [key, SHOP_CATEGORIES[key] || key])].map(([key,label]) => `<button type="button" data-sf-filter="${esc(key)}" aria-pressed="${key === this.filter}">${esc(label)}</button>`).join(''); }
    const dynamic = this.doc.getElementById('sf-dynamic-categories');
    if (dynamic) dynamic.innerHTML = categories.map(key => `<button type="button" data-sf-category="${esc(key)}">${esc(SHOP_CATEGORIES[key] || key)}${sfIcon('ChevronRight')}</button>`).join('');
    this.renderCart();
    if (this.pendingProduct) { const id = this.pendingProduct; this.pendingProduct = ''; this.open(id, false); }
  }
  renderCart() {
    const root = this.doc.getElementById?.('sf-cart-content'); if (!root) return;
    const catalog = this.shop.korb.set === 'catalog';
    const lines = catalog ? this.shop.korb.lines || [] : [];
    const count = lines.reduce((n,p) => n+p.sasia,0);
    const badge = this.doc.getElementById('bag-count'); if (badge && catalog) { badge.hidden = !count; badge.textContent = count; }
    if (!catalog && this.shop.korb.ids.length) { root.innerHTML = `<div class="sf-cart-legacy"><h3>Seti yt eshte ne shport.</h3><p>${money(this.shop.korb.cmimi || 0)}</p><p>Seti ka cmimin e vet. Vazhdo porosine ose zbraze shporten para se te shtosh produkte vec e vec.</p><button type="button" class="sf-button sf-button-dark" data-sf-checkout>Porosit ${sfIcon('ArrowRight')}</button><button type="button" class="sf-cart-continue" data-sf-discard>Zbraze shporten</button></div>`; return; }
    if (!lines.length) { root.innerHTML = `<div class="sf-empty sf-cart-empty">${sfIcon('ShoppingBag')}<h3>Shporta jote eshte bosh.</h3><p>Gjej dicka te mire per lekuren tende.</p><button type="button" class="sf-button sf-button-dark" data-sf-cart-close>Vazhdo blerjen ${sfIcon('ArrowRight')}</button></div>`; return; }
    root.innerHTML = `${this.added ? `<div class="sf-cart-added" role="status">${sfIcon('CircleCheck')}U shtua ne shport</div>` : ''}<div class="sf-cart-lines">${lines.map(line => { const p = this.shop.catalogProducts.find(p => p.id === line.id); return `<article class="sf-cart-line"><div class="sf-cart-photo">${image(p || { name:line.name, images:[] })}</div><div class="sf-cart-line-info"><div class="sf-cart-line-top"><strong>${esc(line.name)}</strong><button type="button" class="sf-icon-button" data-sf-remove="${esc(line.id)}" aria-label="Hiq ${esc(line.name)}">${sfIcon('X')}</button></div><span>${esc(p?.size || '')}</span><p>${money(line.cmimi)}</p><div class="sf-cart-line-bottom"><div class="sf-quantity"><button type="button" data-sf-qty="-1" data-sf-id="${esc(line.id)}" aria-label="Zvogelo sasine">${sfIcon('Minus')}</button><output>${line.sasia}</output><button type="button" data-sf-qty="1" data-sf-id="${esc(line.id)}" aria-label="Rrit sasine" ${line.sasia >= 20 ? 'disabled' : ''}>${sfIcon('Plus')}</button></div><b>${money(line.cmimi * line.sasia)}</b></div></div></article>`; }).join('')}</div><div class="sf-cart-summary"><div><span>Nentotali (${count})</span><b>${money(this.shop.korb.cmimi)}</b></div><div><span>Dergesa</span><span>E perfshire</span></div><div class="sf-cart-total"><strong>Gjithsej</strong><strong>${money(this.shop.korb.cmimi)}</strong></div><button type="button" class="sf-button sf-button-dark" data-sf-checkout>Porosit ${sfIcon('ArrowRight')}</button><p>${sfIcon('Banknote')}Pagesa te dera · Dergesa 1–3 dite</p><button type="button" class="sf-cart-continue" data-sf-cart-close>Vazhdo blerjen</button></div>`;
  }
  openCart() { this.renderCart(); const cart = this.doc.getElementById('sf-cart'); if (!cart?.open) cart?.showModal(); }
  closeCart() { this.doc.getElementById('sf-cart')?.close(); this.added = ''; }
  open(id, push = true) {
    const p = this.shop.catalogProducts.find(p => p.id === id);
    this.doc.title = p ? `${p.name} | LIFESKIN` : 'LIFESKIN';
    this.quantity = 1;
    this.activeProduct = p || null;
    this.doc.getElementById('sf-product-content').innerHTML = p ? productDetail(p) + `<section class="sf-related"><div class="sf-section-head"><div><span class="sf-kicker">ME SHUME LIFESKIN</span><h2>Shiko edhe.</h2></div></div><div class="sf-grid">${this.shop.catalogProducts.filter(x => x.id !== id).slice(0,4).map(productCard).join('')}</div></section>` : '<div class="sf-empty"><h1>Produkti nuk eshte i disponueshem.</h1><button type="button" data-sf-products>Shiko produktet</button></div>';
    this.show('product');
    if (p && this.shop.catalogFotosLaden) void this.shop.catalogFotosLaden(id).then(() => { if (this.activeProduct?.id === id) this.refreshGallery(); });
    if (push) this.route(`/p/${encodeURIComponent(id)}`);
    this.doc.defaultView?.scrollTo({ top:0, behavior:'instant' });
  }
  refreshGallery() {
    const p = this.activeProduct;
    const root = this.doc.querySelector('.sf-gallery');
    if (!p || !root) return;
    root.innerHTML = `<div class="sf-detail-photo">${image(p, false)}</div>${p.images.length > 1 ? `<div class="sf-thumbnails" role="group" aria-label="Fotot e produktit">${p.images.map((url,i) => `<button type="button" data-sf-image="${i}" aria-pressed="${i===0}" aria-label="Foto ${i+1}"><img src="${esc(url)}" alt="" width="72" height="90"></button>`).join('')}</div>` : ''}`;
  }
  changeImage(index) { const p = this.activeProduct; if (!p?.images[index]) return; this.doc.querySelector('.sf-detail-photo img').src = p.images[index]; for (const button of this.doc.querySelectorAll('[data-sf-image]')) button.setAttribute('aria-pressed',String(Number(button.dataset.sfImage) === index)); }
}
