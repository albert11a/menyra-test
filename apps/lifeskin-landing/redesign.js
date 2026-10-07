// Presentation only. Analysis CTAs retain landing.js -> #ls-start delegation.
import { holeSammlung } from './shop.js';
import { RASTE_STANDARD, escapeRasti as escape } from '../../shared/lifeskin-raste.js';
import { medienListe, ausschnittStil } from '../../shared/lifeskin-medien.js';
// Keep the image helper local so importing this presentation module does
// not start the existing asynchronous case loader a second time.
function rastiBild(src, alt) {
  const img = `<img src="${escape(src)}" alt="${escape(alt)}" width="720" height="810" loading="lazy" decoding="async">`;
  return /^\/apps\/lifeskin-landing\/fotot\/rasti-[a-z0-9-]+\.jpg$/.test(String(src || ''))
    ? `<picture><source srcset="${escape(src.replace(/\.jpg$/, '.webp'))}" type="image/webp">${img}</picture>` : img;
}

const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#lc-${name}"></use></svg>`;
export function customerSelection(raw) {
  // A saved empty collection is empty; a failed request uses repository photos.
  return (Array.isArray(raw) && !raw.length ? [] : medienListe(raw))
    .filter(m => m.aktiv && (m.art === 'video' ? m.video : m.bild))
    .sort((a, b) => Number(b.art === 'video') - Number(a.art === 'video'));
}
export function caseCards(items) {
  return items.map((item, index) => `<article class="case"><button type="button" class="pair-button" data-view="cases" data-index="${index}" aria-label="Hape rastin ${index + 1}, para dhe pas"><span class="pair">${[['para', 'PARA'], ['pas', 'PAS']].map(([key, label]) => `<figure class="photo">${rastiBild(item[key], `Rasti ${index + 1}, ${label.toLowerCase()}`)}<figcaption>${label}</figcaption></figure>`).join('')}</span></button><div class="case-bottom"><span>Rasti ${index + 1}</span>${icon('Plus')}</div></article>`).join('');
}
export function customerCards(items) {
  return items.map((item, index) => {
    const video = item.art === 'video', label = video ? 'Video' : 'Foto';
    const style = ausschnittStil(item.ausschnitt);
    return `<button type="button" class="customer-card" data-view="customers" data-index="${index}" aria-label="Hape ${label.toLowerCase()}n ${index + 1} prej klientes">${item.bild ? `<img src="${escape(item.bild)}" alt="Foto prej klientes LifeSkin" width="300" height="400" loading="lazy" decoding="async"${style ? ` style="${escape(style)}"` : ''}>` : '<span class="customer-placeholder" aria-hidden="true"></span>'}${video ? `<span class="play">${icon('Play')}</span>` : ''}<span class="customer-caption">${icon(video ? 'Play' : 'Camera')} ${label} prej klientes</span></button>`;
  }).join('');
}

export function startGallery(root) {
  const doc = root.ownerDocument, viewer = root.querySelector('#viewer');
  const sticky = root.querySelector('#sticky'), body = root.querySelector('#viewer-body');
  const content = { cases: [...RASTE_STANDARD], customers: customerSelection(null) };
  let group = 'cases', current = 0, trigger = null;
  const rails = new Map();
  const reduced = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const image = (src, alt) => { const img = doc.createElement('img'); img.src = src; img.alt = alt; return img; };
  function stopVideo() { body.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); }
  function renderViewer() {
    stopVideo(); body.replaceChildren();
    const items = content[group], item = items[current];
    if (!item) { viewer.close(); return; }
    root.querySelector('#viewer-title').textContent = group === 'cases' ? 'Para / Pas' : 'Nga klientet';
    if (group === 'cases') {
      for (const [key, label] of [['para', 'Para'], ['pas', 'Pas']]) {
        const figure = doc.createElement('figure'), caption = doc.createElement('figcaption');
        caption.textContent = label; figure.append(image(item[key], `${label} kujdesit me LifeSkin`), caption); body.append(figure);
      }
    } else if (item.art === 'video') {
      const video = doc.createElement('video'); video.src = item.video;
      if (item.bild) video.poster = item.bild;
      video.controls = true; video.playsInline = true; video.preload = 'metadata';
      video.setAttribute('aria-label', 'Video e klientes LifeSkin'); body.append(video);
      video.play().catch(() => {});
    } else body.append(image(item.bild, 'Foto prej klientes LifeSkin'));
    const caption = root.querySelector('#viewer-caption');
    caption.textContent = group === 'customers' ? String(item.text || '').replace(/ë/g, 'e').replace(/Ë/g, 'E') : '';
    caption.hidden = !caption.textContent;
    root.querySelector('#viewer-count').textContent = `${current + 1} / ${items.length}`;
    root.querySelector('#viewer-prev').disabled = current === 0;
    root.querySelector('#viewer-next').disabled = current === items.length - 1;
  }
  function navigate(direction) {
    const next = current + direction;
    if (next >= 0 && next < content[group].length) { current = next; renderViewer(); }
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (!button || !root.contains(button)) return;
    group = button.dataset.view; current = Number(button.dataset.index);
    if (!content[group]?.[current]) return;
    trigger = button; renderViewer(); viewer.showModal(); sticky.classList.add('under-modal');
  });
  viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => { stopVideo(); sticky.classList.remove('under-modal'); if (trigger?.isConnected) trigger.focus({preventScroll:true}); });
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const r = viewer.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) viewer.close();
  });
  root.querySelector('#viewer-prev').addEventListener('click', () => navigate(-1));
  root.querySelector('#viewer-next').addEventListener('click', () => navigate(1));
  viewer.addEventListener('keydown', event => {
    if (event.target.tagName === 'VIDEO') return;
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); navigate(event.key === 'ArrowRight' ? 1 : -1); }
  });
  for (const id of ['cases', 'customers']) {
    const rail = root.querySelector(`#${id}`), prev = root.querySelector(`[data-prev="${id}"]`), next = root.querySelector(`[data-next="${id}"]`);
    const cards = () => [...rail.children];
    const nearest = () => cards().reduce((best, card, i, list) => Math.abs(card.offsetLeft - list[0].offsetLeft - rail.scrollLeft) < Math.abs(list[best].offsetLeft - list[0].offsetLeft - rail.scrollLeft) ? i : best, 0);
    const update = () => {
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
      if (id === 'cases') root.querySelector('#cases-count').textContent = `${content.cases.length ? nearest() + 1 : 0} / ${content.cases.length}`;
    };
    const move = direction => {
      const list = cards(); if (!list.length) return;
      const index = Math.max(0, Math.min(list.length - 1, nearest() + direction));
      rail.scrollTo({left:list[index].offsetLeft - list[0].offsetLeft, behavior:reduced() ? 'instant' : 'smooth'});
    };
    prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
    rail.addEventListener('scroll', update, {passive:true});
    rail.addEventListener('keydown', event => { if (event.target === rail && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } });
    if ('ResizeObserver' in globalThis) new ResizeObserver(update).observe(rail);
    rails.set(id, {rail, update}); update();
  }
  function replace(id, items) {
    if (viewer.open && group === id) viewer.close();
    content[id] = items;
    const {rail, update} = rails.get(id);
    rail.closest('section').hidden = !items.length;
    rail.innerHTML = id === 'cases' ? caseCards(items) : customerCards(items);
    rail.scrollLeft = 0; update();
  }
  root.addEventListener('lifeskin:comparison-cases', event => { if (Array.isArray(event.detail)) replace('cases', event.detail); });
  replace('customers', content.customers);
  // This observer closes media before the existing funnel changes screens.
  new MutationObserver(() => { if (doc.getElementById('ls-einstieg').dataset.aktiv !== 'ja' && viewer.open) viewer.close(); })
    .observe(doc.getElementById('ls-einstieg'), {attributes:true, attributeFilter:['data-aktiv']});
  holeSammlung('medien').then(raw => replace('customers', customerSelection(raw))).catch(() => {});
}
if (typeof document !== 'undefined' && !globalThis.__LIFESKIN_TEST__) {
  const root = document.querySelector('#lf-preview[data-redesign="approved"]');
  if (root) startGallery(root);
}
