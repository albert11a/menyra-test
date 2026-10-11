import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT } from '../lifeskin/lifeskin-config.js';
import { kommentareLaden, kommentarSchreiben } from '../../shared/lifeskin-medien.js';
import { SHOP_REVIEW_MEDIUM, SHOP_NACHRICHTEN_DOK, nachrichtenNormalisieren, bewertungText, bewertungLesen, bewertungZusammenfassung } from '../../shared/lifeskin-shop-bewertungen.js';

const optionen = { basis: LIFESKIN_FIRESTORE_BASE, tenant: LIFESKIN_TENANT };
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function reviewMarkup(roh) {
  const k = bewertungLesen(roh);
  const datum = new Date(k.createdAt);
  const zeit = Number.isNaN(datum.getTime()) ? '' : datum.toLocaleDateString('sq-AL');
  return `<article class="shop-review-card"><div class="shop-review-author"><span class="review-avatar" aria-hidden="true">${escape(k.name.trim().slice(0, 1).toUpperCase())}</span><div><strong>${escape(k.name)}</strong>${zeit ? `<time datetime="${escape(k.createdAt)}">${escape(zeit)}</time>` : ''}</div></div>${k.sterne ? `<p class="review-rating" aria-label="${k.sterne} nga 5 yje"><span aria-hidden="true">${'★'.repeat(k.sterne)}<span class="review-stars-empty">${'★'.repeat(5 - k.sterne)}</span></span></p>` : ''}<p class="shop-review-text">${escape(k.text)}</p></article>`;
}

export function nachrichtMarkup(k) {
  return `<button type="button" class="message-card" data-zitat-bild="${escape(k.bild)}"><span class="message-quote" aria-hidden="true">“</span><span class="message-copy"><strong>“${escape(k.text)}”</strong><span>Shiko mesazhin origjinal <span aria-hidden="true">↗</span></span></span></button>`;
}

function init(dok) {
  const section = dok.getElementById('vleresimet');
  const form = dok.getElementById('shop-review-form');
  if (!section || !form) return;
  let liste = [], laeuft = false;
  const render = () => {
    dok.getElementById('shop-review-list').innerHTML = liste.map(reviewMarkup).join('');
    dok.getElementById('reviews-empty').hidden = Boolean(liste.length);
    const summary = dok.getElementById('reviews-summary');
    const sum = bewertungZusammenfassung(liste);
    summary.hidden = !sum.anzahl;
    summary.textContent = sum.anzahl ? `${sum.durchschnitt.toFixed(1)} / 5 · ${sum.anzahl} vleresime` : '';
  };
  const laden = async () => {
    liste = await kommentareLaden(SHOP_REVIEW_MEDIUM, optionen);
    render();
  };
  const nachrichten = async () => {
    try {
      const response = await fetch(`${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/config/${SHOP_NACHRICHTEN_DOK}`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const values = data.fields?.lista?.arrayValue?.values || [];
      const roh = values.map(v => Object.fromEntries(Object.entries(v.mapValue?.fields || {}).map(([key, val]) => [key, val.stringValue || ''])));
      const rail = dok.querySelector('#klientet .message-rail');
      if (rail) rail.innerHTML = nachrichtenNormalisieren(roh).map(nachrichtMarkup).join('');
      dok.getElementById('klientet')?.toggleAttribute('hidden', !rail?.children.length);
    } catch { /* Keep the real original messages on read failures. */ }
  };
  const originalSection = dok.getElementById('klientet');
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        if (entry.target === section) void laden();
        else void nachrichten();
      }
    }, { rootMargin: '300px' });
    observer.observe(section);
    if (originalSection) observer.observe(originalSection);
  } else { void laden(); void nachrichten(); }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (laeuft || !form.reportValidity()) return;
    const status = dok.getElementById('shop-review-status');
    const eingabe = new FormData(form);
    // Still links never create production reviews during a test visit.
    if (new URL(globalThis.location.href).searchParams.get('still') === '1') {
      status.textContent = 'Ky eshte link prove. Vleresimi nuk u publikua.';
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    laeuft = true; button.disabled = true;
    status.textContent = 'Duke derguar…';
    try {
      const text = bewertungText(eingabe.get('text'), eingabe.get('rating'));
      const k = await kommentarSchreiben(SHOP_REVIEW_MEDIUM, { name: eingabe.get('name'), text }, optionen);
      if (!k?.id) throw new Error('Not saved');
      liste = [k, ...liste]; render(); form.reset();
      status.textContent = 'Faleminderit! Vleresimi yt u publikua.';
    } catch { status.textContent = 'Nuk u dergua. Provo perseri.'; }
    finally { laeuft = false; button.disabled = false; }
  });
}

if (typeof document !== 'undefined') init(document);
