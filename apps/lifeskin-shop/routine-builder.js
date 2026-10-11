import { ROUTINE_PRODUCTS, personalRoutine, isAcneDuoSelection } from '../../shared/lifeskin-personal-routine.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = name => `<svg class="icon personal-icon" aria-hidden="true" focusable="false"><use href="/apps/lifeskin-shop/icons.svg#${name}"></use></svg>`;
export function productRail(ids, catalog = [], descriptions = false) {
  const products = ROUTINE_PRODUCTS.filter(p => ids.includes(p.id));
  return `<div class="personal-products" tabindex="0" data-product-count="${products.length}" role="region" aria-label="Produktet e setit tuaj">${products.map(p => {
    const m = catalog.find(item => item.id === p.id);
    return `<article class="personal-product"><div class="personal-product-photo"><img src="${escape(m?.fotot?.[0] || p.photo)}" alt="${escape(p.name)}" width="300" height="400" loading="lazy" decoding="async"></div><strong>${escape(p.name)}</strong><small>${escape(m?.inhalt || (p.id === 'lf-clean' ? '150 ml' : '30 ml'))}</small>${descriptions ? `<p>${escape(p.text)}</p>` : ''}</article>`;
  }).join('')}</div>${products.length > 2 ? `<div class="personal-swipe">${icon('ArrowLeft')}<span>Rreshqit per produktet e tjera</span>${icon('ArrowRight')}</div>` : ''}`;
}
export function routineInstructions(ids) {
  // Cleanser precedes actives; moisturizer follows. Never combine BPO/BHA same evening.
  const order = ['lf-clean', 'lf-acne', 'lf-pore', 'lf-moistur'];
  return order.filter(id => ids.includes(id)).map((id, i) => {
    const p = ROUTINE_PRODUCTS.find(item => item.id === id);
    return `<div class="step"><div class="step-num">${i + 1}</div><div><div class="time">${p.time} · ${p.name}</div><h3>${escape(p.goal)}</h3><p>${escape(p.use)}</p></div></div>`;
  }).join('');
}
export class RoutineBuilder {
  constructor({ root, catalog = () => [], apply, order, reset }) {
    this.root = root; this.catalog = catalog; this.apply = apply; this.order = order; this.reset = reset;
    this.ids = []; this.stage = 'intro';
  }
  start() {
    if (!this.root) return;
    this.root.innerHTML = `<div class="wrap"><div class="personal-panel" data-routine-panel>
      <div data-routine-screen="intro"><p class="eyebrow">RUTINA JOTE, ZGJEDHJA JOTE</p><h2>Krijo rutinen tende.<br>Sipas buxhetit tend.</h2><p>Vetem trajtimin apo gjithe setin? Zgjidh produktet sipas nevojes tende.</p><button class="cta" type="button" data-routine-action="choose">Krijo setin tend personal ${icon("ArrowRight")}</button><small>Ti zgjedh. Ne te ndihmojme ta krijosh rutinen.</small></div>
      <div data-routine-screen="choose" hidden><p class="eyebrow">HAPI 1 / 2 · ZGJIDH PRODUKTET</p><h2>Cfare deshiron te trajtosh?</h2><p>Mund te zgjedhesh me shume se nje.</p><div class="personal-choices">${ROUTINE_PRODUCTS.map(p => `<label class="personal-choice"><input type="checkbox" value="${p.id}"><span class="personal-choice-body"><span class="personal-choice-top"><b>${p.name}</b>${p.id === 'lf-moistur' ? '<span class="personal-recommend" hidden>REKOMANDOJM</span>' : ''}</span><strong>${p.goal}</strong><span class="personal-choice-copy">${p.text}</span></span><span class="personal-check" aria-hidden="true">${icon("Check")}</span></label>`).join('')}</div><div class="personal-selection"><span data-routine-count>Zgjidh te pakten nje produkt.</span><strong data-routine-price></strong></div><div class="personal-actions"><button type="button" class="personal-back" data-routine-action="intro">${icon("ArrowLeft")}<span>Kthehu</span></button><button type="button" class="cta" data-routine-action="result" disabled>Vazhdo ${icon("ArrowRight")}</button></div></div>
      <div data-routine-screen="result" hidden><p class="eyebrow">HAPI 2 / 2 · SETI YT</p><h2>Rutina qe zgjodhe ti.</h2><p>Produktet e tua, ne nje set te vetem.</p><div data-routine-products></div><div class="personal-total"><span>Gjithsej per setin tend</span><strong data-routine-total></strong><div class="personal-assurances"><span>${icon("Truck")}Dergesa falas</span><span>${icon("Banknote")}Pagesa te dera</span></div></div><div class="personal-result-actions"><button type="button" class="personal-secondary" data-routine-action="apply">Perdor kete set ${icon("ArrowUpRight")}</button><button type="button" class="cta" data-routine-action="order">Vazhdo me porosine ${icon("ArrowRight")}</button></div><button type="button" class="personal-back" data-routine-action="choose">${icon("ArrowLeft")}<span>Ndrysho zgjedhjen</span></button></div>
      <p class="personal-feedback" data-routine-feedback role="status" hidden></p><button type="button" class="personal-back" data-routine-action="reset" hidden>${icon("ArrowLeft")}<span>Kthehu te Acne Duo</span></button>
    </div></div>`;
    this.root.addEventListener('change', event => {
      if (!event.target.matches('input[type="checkbox"]')) return;
      this.ids = [...this.root.querySelectorAll('input:checked')].map(input => input.value);
      this.update();
    });
    this.root.addEventListener('click', event => {
      const button = event.target.closest('[data-routine-action]');
      if (!button || button.disabled) return;
      const action = button.dataset.routineAction;
      if (['intro', 'choose', 'result'].includes(action)) { this.show(action); return; }
      if (action === 'reset') { this.reset(); this.feedback('U kthye seti Acne Duo.'); button.hidden = true; return; }
      const set = personalRoutine(this.ids);
      const applied = set ? this.apply(set.produkte) : false;
      if (!set || applied === false) { this.feedback('Seti nuk eshte i disponueshem. Provo perseri.'); return; }
      const duo = isAcneDuoSelection(set.produkte);
      this.root.querySelector('[data-routine-action="reset"]').hidden = duo;
      if (action === 'order') this.order(typeof applied === 'string' ? applied : set.id);
      else { this.feedback(duo ? 'Zgjodhe Acne Duo: LF ACNE + LF MOISTURE.' : 'Seti yt u shtua ne faqen e produktit.'); this.root.ownerDocument.querySelector('#fillimi')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  }
  refreshPhotos() {
    if (this.stage === 'result') this.root.querySelector('[data-routine-products]').innerHTML = productRail(this.ids, this.catalog());
  }
  feedback(text) { const node = this.root.querySelector('[data-routine-feedback]'); node.textContent = text; node.hidden = false; }
  update() {
    const set = personalRoutine(this.ids);
    this.root.querySelector('[data-routine-price]').textContent = set ? `${set.cmimi} €` : '';
    this.root.querySelector('[data-routine-count]').textContent = set ? `${set.produkte.length} ${set.produkte.length === 1 ? 'produkt' : 'produkte'} ne setin tend` : 'Zgjidh te pakten nje produkt.';
    this.root.querySelector('[data-routine-action="result"]').disabled = !set;
    this.root.querySelector('.personal-recommend').hidden = !this.ids.includes('lf-acne');
  }
  show(stage) {
    if (stage === 'result') {
      const set = personalRoutine(this.ids); if (!set) return;
      this.root.querySelector('[data-routine-products]').innerHTML = productRail(this.ids, this.catalog());
      this.root.querySelector('[data-routine-total]').textContent = `${set.cmimi} €`;
    }
    this.stage = stage;
    this.root.querySelectorAll('[data-routine-screen]').forEach(screen => { screen.hidden = screen.dataset.routineScreen !== stage; });
    this.root.querySelector('[data-routine-feedback]').hidden = true;
    this.root.querySelector(`[data-routine-screen="${stage}"] h2`)?.setAttribute('tabindex', '-1');
    this.root.querySelector(`[data-routine-screen="${stage}"] h2`)?.focus({ preventScroll: true });
  }
}
