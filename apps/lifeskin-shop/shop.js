/* Storefront selection with same-tab handoff to the existing checkout. */
import { preisFuer } from '../../shared/lifeskin-preise.js';
import { prepareCheckout } from './checkout-handoff.js';
(() => {
  'use strict';
  const root = '/apps/lifeskin-shop/assets/';
  const products = {
    acne: { id: 'lf-acne', name: 'LF ACNE', subtitle: 'Kujdes për aknet', image: 'lf-acne-3.jpg' },
    moistur: { id: 'lf-moistur', name: 'LF MOISTUR', subtitle: 'Hidratim i përditshëm', image: 'lf-moistur.jpg' },
    pigment: { id: 'lf-pigment', name: 'LF PIGMENT', subtitle: 'Kujdes për njollat', image: 'lf-pigment.jpg' },
    pore: { id: 'lf-pore', name: 'LF PORE', subtitle: 'Kujdes për poret', image: 'lf-pore.jpg' }
  };
  const sets = {
    acne: { title: 'Seti kundër akneve', text: 'LF ACNE për kujdesin e lëkurës me akne. LF MOISTUR për hidratimin që plotëson rutinën.', keys: ['acne', 'moistur'] },
    pigment: { title: 'Seti për njollat', text: 'LF PIGMENT për kujdesin e tonit të pabarabartë. LF MOISTUR për hidratimin e përditshëm.', keys: ['pigment', 'moistur'] },
    pore: { title: 'Seti për poret', text: 'LF PORE për kujdesin e pamjes së poreve. LF MOISTUR për hidratimin dhe barrierën e lëkurës.', keys: ['pore', 'moistur'] }
  };
  const $ = (s) => document.querySelector(s);
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="/apps/lifeskin-shop/icons.svg#${name}"></use></svg>`;
  const sheet = $('#sheet');
  let opener;
  let cart = [];
  const key = 'lifeskinshop.template.cart.v1';
  try { const value = JSON.parse(sessionStorage.getItem(key) || '[]'); if (Array.isArray(value)) cart = [...new Set(value.filter(k => Object.hasOwn(products, k)))]; } catch {}
  const amount = () => preisFuer(cart.length);
  function refresh() {
    try { sessionStorage.setItem(key, JSON.stringify(cart)); } catch {}
    $('#bag-count').textContent = String(cart.length);
    $('#bag-count').hidden = !cart.length;
  }
  function open(content) {
    if (!sheet.open) opener = document.activeElement;
    $('#sheet-content').innerHTML = content;
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
    $('#close-sheet').focus({ preventScroll: true });
  }
  function close() { sheet.close(); }
  sheet.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  $('#close-sheet').addEventListener('click', close);
  sheet.addEventListener('click', e => {
    if (e.target !== sheet) return;
    const r = sheet.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  });
  function basket() {
    const rows = cart.map(k => {
      const p = products[k];
      return `<div class="basket-row"><img src="${root + p.image}" alt="${p.name}" width="62" height="78"><div><h3>${p.name}</h3><p>${p.subtitle} · 30 ml</p></div><button class="remove" data-remove="${k}" aria-label="Hiqni ${p.name}">${icon('Trash2')}</button></div>`;
    }).join('');
    open(`<h2 id="sheet-title">${cart.length ? 'Zgjedhja juaj.' : 'Shporta juaj.'}</h2><p>${cart.length ? 'Kontrolloni produktet përpara se të vazhdoni.' : 'Zgjidhni një set ose produkt për të filluar.'}</p>${rows}${cart.length ? `<div class="total"><span>Gjithsej · dërgesa e përfshirë</span><strong>${amount()} €</strong></div>${cart.length > 1 ? `<p class="cart-saving">Veçmas ${cart.length * 29} € · Kurseni ${cart.length * 29 - amount()} € së bashku.</p>` : ''}<div class="order-steps"><span>1. Produktet</span><span>2. Adresa</span><span>3. Pagesa në dorëzim</span></div><p class="checkout-note">Produktet kalojnë në dyqanin LifeSkin. Atje hapni shportën për të plotësuar adresën dhe për të konfirmuar porosinë.</p><p id="checkout-error" class="checkout-error" role="alert" hidden></p>` : ''}<div class="sheet-actions">${cart.length ? `<button class="primary" data-checkout>Vazhdo me porosinë · ${amount()} € ${icon('ArrowRight')}</button>` : ''}<button class="secondary" data-continue>${cart.length ? 'Vazhdo blerjet' : 'Zgjidhni setin tuaj'} ${icon('ArrowUpRight')}</button></div>`);
  }
  function addSet(k) {
    if (!Object.hasOwn(sets, k)) return;
    // One routine at a time: avoid combining unrelated active products by accident.
    cart = [...sets[k].keys]; refresh(); basket();
    $('#status').textContent = `${sets[k].title} u shtua në shportë.`;
  }
  $('#single-grid').innerHTML = Object.entries(products).map(([k,p]) => `<article class="single-card"><img src="${root + p.image}" alt="${p.name}" width="300" height="375" loading="lazy"><h3>${p.name}</h3><p>${p.subtitle} · 30 ml</p><button data-single="${k}" aria-label="Shtoni ${p.name}, 29 euro">29 € ${icon('Plus')}</button></article>`).join('');
  document.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-set')) addSet(button.dataset.set);
    if (button.hasAttribute('data-cart')) basket();
    if (button.hasAttribute('data-checkout')) {
      let result;
      try { result = prepareCheckout(sessionStorage, cart.map(k => products[k].id), location.search); }
      catch { result = { ok: false }; }
      if (result.ok) location.assign(result.href);
      else {
        const message = $('#checkout-error');
        message.textContent = 'Shporta nuk u ruajt. Ju lutemi lejoni ruajtjen në shfletues dhe provoni përsëri.';
        message.hidden = false;
      }
    }
    if (button.hasAttribute('data-single')) {
      const k = button.dataset.single;
      if (!cart.includes(k)) cart.push(k);
      refresh(); basket();
    }
    if (button.hasAttribute('data-remove')) {
      cart = cart.filter(k => k !== button.dataset.remove); refresh(); basket();
    }
    if (button.hasAttribute('data-continue')) { close(); $('#setet').scrollIntoView({ behavior: 'smooth' }); }
    if (button.hasAttribute('data-detail')) {
      const k = button.dataset.detail; const s = sets[k];
      open(`<h2 id="sheet-title">${s.title}</h2><p>${s.text}</p><div class="detail-products">${s.keys.map(key => `<figure><img src="${root + products[key].image}" alt="${products[key].name}" width="300" height="375"><figcaption><strong>${products[key].name}</strong>${products[key].subtitle} · 30 ml</figcaption></figure>`).join('')}</div><div class="included"><span>${products[k].name}</span><span>LF MOISTUR</span><small>2 × 30 ml</small></div><div class="total"><span>Seti me dy produkte</span><strong>39 €</strong></div><button class="primary" data-set="${k}">Zgjidh këtë set ${icon('ArrowUpRight')}</button>`);
    }
    if (button.hasAttribute('data-filter')) {
      const filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      document.querySelectorAll('[data-concern]').forEach(c => c.hidden = filter !== 'all' && c.dataset.concern !== filter);
      const selected = filter === 'all' ? 'acne' : filter;
      $('#sticky-label').textContent = sets[selected].title;
      $('#sticky-buy').dataset.set = selected;
      $('#status').textContent = filter === 'all' ? 'Shfaqen të gjitha setet.' : `Shfaqet ${sets[selected].title.toLowerCase()}.`;
    }
  });
  // Retain test/still mode when opening the existing, independently owned flow.
  const params = new URLSearchParams(location.search);
  if (params.get('still') === '1' || params.get('test') === '1') {
    document.querySelectorAll('.check-link').forEach(a => a.href = '/lifeskin2?still=1');
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { $('#sticky').hidden = entries[0].isIntersecting; }, { threshold: 0 }).observe($('.hero'));
  }
  refresh();
})();
