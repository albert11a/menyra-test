import { reviewGalerie } from '../../shared/lifeskin-review-gallery.js';
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT } from '../lifeskin/lifeskin-config.js';
import { kommentareLaden, kommentarSchreiben } from '../../shared/lifeskin-medien.js';
import { SHOP_REVIEW_MEDIUM, SHOP_NACHRICHTEN_DOK, nachrichtenNormalisieren, bewertungText, bewertungLesen, bewertungZusammenfassung, reviewFotoUrl, REVIEW_FOTOS_MAX, REVIEW_FOTO_BYTES_MAX } from '../../shared/lifeskin-shop-bewertungen.js';

const optionen = { basis: LIFESKIN_FIRESTORE_BASE, tenant: LIFESKIN_TENANT };
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function reviewMarkup(roh) {
  const k = bewertungLesen(roh);
  const datum = new Date(k.createdAt);
  const zeit = Number.isNaN(datum.getTime()) ? '' : datum.toLocaleDateString('sq-AL');
  const photo = k.bilder.length ? `<button type="button" class="review-photo-stack" data-review-gallery="${escape(k.id)}" aria-label="Shiko ${k.bilder.length} foto" style="--review-aspect:${k.bilder[0].breite / k.bilder[0].hoehe}">${k.bilder.slice(0, 3).reverse().map((b, i, all) => `<img src="${reviewFotoUrl(b)}" width="${b.breite}" height="${b.hoehe}" alt="Foto nga klienti" loading="lazy" decoding="async" style="--photo-offset:${(all.length - i - 1) * 5}px">`).join('')}<span class="review-photo-zoom"><svg class="icon" aria-hidden="true"><use href="/apps/lifeskin-shop/icons.svg#Search"></use></svg></span>${k.bilder.length > 1 ? `<span class="review-photo-count">+${k.bilder.length - 1}</span>` : ''}</button>` : '';
  return `<article class="shop-review-card"><div class="review-head"><div class="review-meta"><div class="shop-review-author"><span class="review-avatar" aria-hidden="true">${escape(k.name.trim().slice(0, 1).toUpperCase())}</span><div><strong title="${escape(k.name)}">${escape(k.name)}</strong>${zeit ? `<time datetime="${escape(k.createdAt)}">${escape(zeit)}</time>` : ''}</div></div>${k.sterne ? `<p class="review-rating" aria-label="${k.sterne} nga 5 yje"><span aria-hidden="true">${'★'.repeat(k.sterne)}<span class="review-stars-empty">${'★'.repeat(5 - k.sterne)}</span></span></p>` : ''}</div>${photo}</div><p class="shop-review-text">${escape(k.text)}</p></article>`;
}

export function nachrichtMarkup(k) {
  return `<button type="button" class="message-card" data-zitat-bild="${escape(k.bild)}"><span class="message-quote" aria-hidden="true">“</span><span class="message-copy"><strong>“${escape(k.text)}”</strong><span>Shiko mesazhin origjinal <span aria-hidden="true">↗</span></span></span></button>`;
}

function init(dok) {
  const section = dok.getElementById('vleresimet');
  const form = dok.getElementById('shop-review-form');
  if (!section || !form) return;
  let liste = [], laeuft = false, vorbereitet = false, ausgewaehlt = [], submission = null;
  const render = () => {
    dok.getElementById('shop-review-list').innerHTML = liste.map(reviewMarkup).join('');
    dok.getElementById('reviews-empty').hidden = Boolean(liste.length);
    const summary = dok.getElementById('reviews-summary');
    const sum = bewertungZusammenfassung(liste);
    summary.hidden = !sum.anzahl;
    summary.textContent = sum.anzahl ? `${sum.durchschnitt.toFixed(1)} / 5 · ${sum.anzahl} vleresime` : '';
  };
  const laden = async () => {
    const geladen = await kommentareLaden(SHOP_REVIEW_MEDIUM, optionen);
    liste = [...liste.filter(k => !geladen.some(g => g.id === k.id)), ...geladen];
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
  dok.getElementById('shop-review-list').addEventListener('click', event => {
    const button = event.target.closest('[data-review-gallery]');
    const review = button && liste.find(k => k.id === button.dataset.reviewGallery);
    if (review) void reviewGalerie(bewertungLesen(review).bilder);
  });
  const fileInput = form.querySelector('[data-review-files]');
  const photoList = form.querySelector('[data-review-previews]');
  const photoStatus = form.querySelector('[data-review-photo-status]');
  const add = form.querySelector('[data-review-add]');
  const removePhotos = () => { for (const p of ausgewaehlt) URL.revokeObjectURL(p.url); ausgewaehlt = []; submission = null; photoList.innerHTML = ''; add.disabled = false; };
  const renderPhotos = () => {
    photoList.innerHTML = ausgewaehlt.map((p, i) => `<span class="review-upload-photo"><img src="${p.url}" alt="Foto ${i + 1}"><button type="button" data-remove-photo="${i}" aria-label="Hiq foton ${i + 1}">×</button></span>`).join('');
    add.disabled = vorbereitet || ausgewaehlt.length >= REVIEW_FOTOS_MAX;
  };
  add.addEventListener('click', () => fileInput.click());
  photoList.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-photo]');
    if (!button || laeuft || vorbereitet) return;
    const [removed] = ausgewaehlt.splice(Number(button.dataset.removePhoto), 1); if (removed) URL.revokeObjectURL(removed.url);
    submission = null; renderPhotos(); photoStatus.textContent = '';
  });
  fileInput.addEventListener('change', async () => {
    if (vorbereitet || laeuft) return;
    const files = [...fileInput.files]; fileInput.value = '';
    if (files.length + ausgewaehlt.length > REVIEW_FOTOS_MAX) { photoStatus.textContent = 'Mund ti shtosh deri ne 4 foto.'; return; }
    vorbereitet = true; add.disabled = true; form.querySelector('button[type="submit"]').disabled = true; photoStatus.textContent = 'Duke pergatitur fotot…';
    try {
      for (const file of files) { const p = await reviewFotoVorbereiten(file); ausgewaehlt.push({ ...p, url: URL.createObjectURL(file) }); }
      submission = null; photoStatus.textContent = '';
    } catch { photoStatus.textContent = 'Kjo foto nuk u hap. Provo nje foto tjeter.'; }
    finally { vorbereitet = false; form.querySelector('button[type="submit"]').disabled = false; renderPhotos(); }
  });
  globalThis.addEventListener?.('pagehide', removePhotos, { once: true });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (laeuft || vorbereitet || !form.reportValidity()) return;
    const status = dok.getElementById('shop-review-status');
    const eingabe = new FormData(form);
    // Still links never create production reviews during a test visit.
    if (new URL(globalThis.location.href).searchParams.get('still') === '1') {
      status.textContent = 'Ky eshte link prove. Vleresimi nuk u publikua.';
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    laeuft = true; button.disabled = true; add.disabled = true;
    status.textContent = 'Duke derguar…';
    try {
      const text = bewertungText(eingabe.get('text'), eingabe.get('rating'));
      let k;
      if (ausgewaehlt.length) {
        const signature = JSON.stringify([eingabe.get('name'), eingabe.get('text'), eingabe.get('rating'), ausgewaehlt.map(p => p.jpeg)]);
        if (submission?.signature !== signature) submission = { signature, body: { id: crypto.randomUUID().replaceAll('-', ''), name: eingabe.get('name'), text: eingabe.get('text'), rating: Number(eingabe.get('rating')), fotos: ausgewaehlt.map(p => p.jpeg) } };
        const response = await fetch('/api/lifeskin-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submission.body) });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error('Upload failed');
        k = result.review;
      } else k = await kommentarSchreiben(SHOP_REVIEW_MEDIUM, { name: eingabe.get('name'), text }, optionen);
      if (!k?.id) throw new Error('Not saved');
      liste = [k, ...liste]; render(); form.reset(); removePhotos();
      status.textContent = 'Faleminderit! Vleresimi yt u publikua.';
    } catch { status.textContent = 'Nuk u dergua. Provo perseri.'; }
    finally { laeuft = false; button.disabled = false; renderPhotos(); }
  });
}


export async function reviewFotoVorbereiten(file) {
  if (!file || !/^image\/(jpeg|png|webp|gif|heic|heif|avif)$/i.test(file.type) || file.size > 20000000) throw new Error('Image unsupported');
  let image, release = () => {};
  try {
    if (globalThis.createImageBitmap) { try { image = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* Safari may decode a format through Image instead. */ } }
    if (!image) {
      const url = URL.createObjectURL(file); release = () => URL.revokeObjectURL(url);
      image = await new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url; });
    }
    const scale = Math.min(1, 1440 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (let quality = .88; quality >= .35; quality -= .1) {
      const jpeg = canvas.toDataURL('image/jpeg', quality);
      if (jpeg.length * .75 <= REVIEW_FOTO_BYTES_MAX) return { jpeg };
    }
    throw new Error('Image too large');
  } finally { image?.close?.(); release(); }
}

if (typeof document !== 'undefined') init(document);
