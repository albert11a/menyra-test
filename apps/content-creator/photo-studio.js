import { ccEscape as esc } from '../../shared/content-creator.js';
import { euro } from '../../shared/content-creator-shop.js';
import { STUDIO_ACCEPT, STUDIO_MAX_BYTES, STUDIO_MAX_FILES, STUDIO_PAYMENT, STUDIO_PRICE, STUDIO_STATES, STUDIO_STYLES } from '../../shared/photo-studio.js';
import { putStudioFile, studioDownload, studioRequest } from '../../shared/photo-studio-client.js';
import { decodeStudioComparison, studioCompare } from '../../shared/photo-studio-compare.js';

const root = document.querySelector('#photo-studio');
const pageId = new URLSearchParams(location.search).get('page') || '';
const givenToken = /^#studio=([a-f0-9]{64})$/.exec(location.hash)?.[1];
const storageKey = 'mnyra-studio-pending-' + pageId;
const readPending = () => { try { return sessionStorage.getItem(storageKey); } catch { return null; } };
const token = givenToken || readPending() || [...crypto.getRandomValues(new Uint8Array(32))].map(byte => byte.toString(16).padStart(2, '0')).join('');
const displaySize = matchMedia('(max-width: 480px)').matches && (navigator.connection?.saveData || globalThis.devicePixelRatio <= 1) ? 'thumb' : 'large';
const call = (op, data) => studioRequest(op, { pageId, token, ...data });
const link = new URL(location.pathname + location.search + '#studio=' + token, location.origin);
const localeTime = value => new Intl.DateTimeFormat('sq-AL', { timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const nav = `<nav class="studio-nav"><span class="studio-wordmark">MNYRA / STUDIO</span><a href="/content-creator/${esc(pageId)}">Kthehu te fotot</a></nav>`;
const stopBusy = () => root.removeAttribute('aria-busy');

function mountForm(businessName) {
  root.innerHTML = `${nav}<header class="studio-hero"><p class="studio-kicker">${esc(businessName)} · MNYRA PHOTO STUDIO</p>
    <h1 class="studio-title">Fotot e tua. Në një nivel tjetër.</h1>
    <p class="studio-intro">Dërgo fotot e tua dhe ne i përpunojmë profesionalisht, me ndriçim, detaje dhe cilësi të përshtatshme për Instagram dhe Facebook.</p>
    <p class="studio-price">Vetëm 0,25 € për foto</p></header>
  <form class="studio-card">
    <div class="studio-drop"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 16-5-5L5 21"/></svg>
      <strong>Zgjidh fotot që dëshiron t’i përpunojmë.</strong><span class="studio-muted">Nga telefoni ose galeria jote.</span>
      <input hidden type="file" multiple accept="${STUDIO_ACCEPT}"><button type="button" class="studio-primary" data-add>Ngarko fotot</button>
      <span class="studio-fine">JPG, PNG, WebP, HEIC/HEIF · deri në 20 foto · 30 MB për foto</span></div>
    <div class="studio-upload-grid"></div>
    <div class="studio-fields">
      <label>Emri<input name="name" required maxlength="120" autocomplete="name"></label>
      <label>Telefoni<input name="phone" required type="tel" maxlength="40" autocomplete="tel"></label>
      <label>Emaili (opsional)<input name="email" type="email" maxlength="200" autocomplete="email"></label>
      <label>Stili (opsional)<select name="style"><option value="">Zgjidh stilin</option>${STUDIO_STYLES.map(style => `<option>${style}</option>`).join('')}</select></label>
      <label>Udhëzime (opsionale)<textarea name="notes" maxlength="1000" rows="2" placeholder="Dëshiroj fotografi natyrale, pa ndryshuar produktin."></textarea></label>
    </div>
    <label class="studio-consent"><input type="checkbox" name="consent" required>Kam të drejtë t’i dërgoj këto foto dhe lejoj përpunimin e tyre për këtë porosi.</label>
    <details class="studio-fine"><summary>Privatësia e fotove</summary><p>Fotot dhe të dhënat e kontaktit përdoren për përpunimin dhe dorëzimin e porosisë. Fotot janë private dhe ruhen për shkarkim deri në 175 ditë nga porosia. Ngarkimet e papërfunduara fshihen automatikisht. Ndaje linkun e porosisë vetëm me persona të besuar. Për fshirjen, kontakto MNYRA.</p></details>
    <div class="studio-checkout"><div><strong>Përmbledhja e porosisë</strong><div data-total aria-live="polite"></div></div><button class="studio-primary" type="submit">Dërgo porosinë</button></div>
    <p class="studio-error" role="alert"></p>
  </form>`;
  const form = root.querySelector('form'), picker = form.querySelector('[type=file]'), drop = form.querySelector('.studio-drop');
  const grid = form.querySelector('.studio-upload-grid'), status = form.querySelector('[role=alert]'), submit = form.querySelector('[type=submit]');
  const rows = [];
  let busy = false;
  const sync = () => {
    form.querySelector('[data-total]').textContent = `${rows.length} foto × 0,25 € · Totali ${euro(rows.length * STUDIO_PRICE)}`;
    submit.disabled = busy || !rows.length;
    form.querySelector('[data-add]').disabled = busy;
    rows.forEach(row => {
      row.remove.disabled = busy || row.uploading;
      row.retry.disabled = busy || row.uploading;
    });
  };
  async function upload(row) {
    if (row.accepted || row.uploading) return;
    row.uploading = true;
    row.retry.hidden = true;
    row.progress.value = 0;
    row.label.textContent = 'Duke ngarkuar…';
    sync();
    const data = { photoId: row.id, version: row.id, bytes: row.file.size };
    try {
      const slot = await call('prepare-original', data);
      if (!slot.accepted) {
        await putStudioFile(slot.url, row.file, value => { row.progress.value = value; });
        row.label.textContent = 'Duke kontrolluar…';
        await call('accept-original', data);
      }
      row.accepted = true;
      row.progress.value = 100;
      row.label.textContent = 'E ngarkuar';
    } catch (error) {
      row.label.textContent = error.message;
      row.retry.hidden = error.status === 422;
    } finally {
      row.uploading = false;
      sync();
    }
  }
  function add(files) {
    if (busy) return;
    status.textContent = '';
    for (const file of files) {
      if (rows.length === STUDIO_MAX_FILES) { status.textContent = 'Mund të zgjedhësh deri në 20 foto.'; break; }
      if (!/\.(jpe?g|png|webp|hei[cf])$/i.test(file.name) && !/^image\/(jpeg|png|webp|hei[cf])$/i.test(file.type) || !file.size || file.size > STUDIO_MAX_BYTES) {
        status.textContent = 'Zgjidh JPG, PNG, WebP ose HEIC/HEIF deri në 30 MB.'; continue;
      }
      const id = crypto.randomUUID(), url = URL.createObjectURL(file), card = document.createElement('article');
      card.className = 'studio-upload';
      card.innerHTML = '<img alt="" loading="lazy" decoding="async"><strong></strong><span role="status">Në pritje</span><progress max="100" value="0" aria-label="Ngarkimi"></progress><button type="button" data-remove>Hiq</button><button type="button" data-retry hidden>Provo përsëri</button>';
      card.querySelector('strong').textContent = file.name;
      const preview = card.querySelector('img');
      preview.src = url;
      preview.onerror = () => { preview.hidden = true; };
      const row = { id, url, file, label: card.querySelector('span'), progress: card.querySelector('progress'), remove: card.querySelector('[data-remove]'), retry: card.querySelector('[data-retry]') };
      row.remove.onclick = () => { rows.splice(rows.indexOf(row), 1); URL.revokeObjectURL(url); card.remove(); sync(); };
      row.retry.onclick = () => void upload(row);
      rows.push(row);
      grid.append(card);
    }
    sync();
  }
  form.querySelector('[data-add]').onclick = () => picker.click();
  picker.onchange = () => { add(picker.files); picker.value = ''; };
  drop.ondragover = event => { event.preventDefault(); drop.dataset.over = ''; };
  drop.ondragleave = () => { delete drop.dataset.over; };
  drop.ondrop = event => { event.preventDefault(); delete drop.dataset.over; add(event.dataTransfer.files); };
  form.onsubmit = async event => {
    event.preventDefault();
    if (busy || !rows.length || rows.some(row => row.uploading)) return;
    busy = true;
    submit.textContent = 'Duke dërguar…';
    status.textContent = '';
    sync();
    try {
      const fields = Object.fromEntries(new FormData(form));
      for (let start = 0; start < rows.length; start += 3) await Promise.all(rows.slice(start, start + 3).map(upload));
      if (rows.some(row => !row.accepted)) throw Error('Kontrollo fotot dhe provo përsëri.');
      try { sessionStorage.setItem(storageKey, token); } catch {}
      const receipt = await call('place', { ...fields, consent: fields.consent === 'on', photos: rows.map(row => row.id) });
      for (const row of rows) URL.revokeObjectURL(row.url);
      openReceipt(receipt, true);
    } catch (error) { status.textContent = error.message; }
    finally {
      busy = false;
      submit.textContent = 'Dërgo porosinë';
      sync();
    }
  };
  sync();
}

function openReceipt(initial, justPlaced = false) {
  history.replaceState(null, '', link.href);
  try { sessionStorage.removeItem(storageKey); } catch {}
  let order = initial, index = 0, paintVersion = 0, renderedKey = '', fetchingKey = '', selection = '', timer;
  const cache = new Map(), originals = new Map();
  root.innerHTML = `${nav}<header class="studio-receipt"><p class="studio-kicker">MNYRA PHOTO STUDIO</p><h1 class="studio-title">${justPlaced ? 'Porosia u pranua!' : 'Porosia jote'}</h1>
    ${justPlaced ? '<p class="studio-intro">Fotot e tua u dërguan me sukses. Do të mund t’i shikosh rezultatet këtu sapo të jenë gati.</p>' : ''}</header>
    <section class="studio-card"><h2>${esc(order.businessName)}</h2><p class="studio-meta"><span>#${esc(order.id.slice(0, 12).toUpperCase())}</span><span>${order.photoCount} foto</span><span>${euro(order.totalCents)}</span><time>${localeTime(order.createdAt)}</time></p>
    <p data-status aria-live="polite"></p><button type="button" data-copy>Kopjo linkun e porosisë</button><p class="studio-fine" data-live role="status"></p></section>
    <section class="studio-card" data-results><nav class="studio-pagination" aria-label="Fotot e porosisë"></nav><div data-compare aria-live="polite"></div>
    <div class="studio-toolbar" data-downloads hidden><button type="button" class="studio-primary" data-save>Shkarko foton</button>
      <button type="button" data-all>Shkarko të gjitha</button><button type="button" data-share hidden>Ruaj / shpërndaj</button>
      <select aria-label="Formati social" data-format><option value="">Formati social</option><option value="feed">Instagram 4:5</option><option value="square">Instagram/Facebook 1:1</option><option value="story">Story 9:16</option></select><button type="button" data-export disabled>Shkarko formatin</button>
    </div><p class="studio-fine" data-export-info hidden>Formati social ruan gjithë foton dhe shton hapësirë rreth saj kur nevojitet.</p>
    <p class="studio-error" data-action-status role="status"></p></section>`;
  const get = selector => root.querySelector(selector);
  const compare = get('[data-compare]'), gallery = get('.studio-pagination'), actionStatus = get('[data-action-status]');
  let sharing;
  const previewKey = photo => [photo.original, photo.edited, order.downloadsAvailable].join(':');
  function preview(photo) {
    const key = previewKey(photo);
    const existing = cache.get(key);
    if (existing && existing.until > Date.now()) return existing.promise;
    const promise = call('media', { variant: 'preview', photoId: photo.id, size: displaySize })
      .then(image => decodeStudioComparison(image, originals.get(photo.original)))
      .then(image => {
        originals.set(photo.original, image.beforeImage);
        if (originals.size > 4) originals.delete(originals.keys().next().value);
        return image;
      }).catch(error => { if (cache.get(key)?.promise === promise) cache.delete(key); throw error; });
    cache.set(key, { until: Date.now() + 12 * 60000, promise });
    if (cache.size > 4) cache.delete(cache.keys().next().value);
    return promise;
  }
  async function paint() {
    const status = `${STUDIO_STATES[order.status]} · ${STUDIO_PAYMENT[order.paymentStatus]}`;
    if (get('[data-status]').textContent !== status) get('[data-status]').textContent = status;
    const photo = order.photos[index];
    get('[data-results]').hidden = !photo;
    get('[data-downloads]').hidden = !order.downloadsAvailable;
    get('[data-export-info]').hidden = !order.downloadsAvailable;
    if (!photo) { ++paintVersion; compare.replaceChildren(); cache.clear(); originals.clear(); sharing = undefined; return; }
    const selected = order.photos.map(photo => photo.id).join(':') + index;
    if (selection !== selected) {
      selection = selected;
      gallery.innerHTML = order.photos.map((item, i) => `<button type="button" aria-current="${i === index}" aria-label="Fotoja ${i + 1}">${i + 1}</button>`).join('');
      [...gallery.children].forEach((button, i) => button.onclick = () => { index = i; void paint(); gallery.children[i]?.focus(); });
    }
    const key = previewKey(photo);
    if (key === fetchingKey) return;
    if (key === renderedKey) {
      if (fetchingKey) { ++paintVersion; fetchingKey = ''; compare.removeAttribute('aria-busy'); }
      return;
    }
    fetchingKey = key;
    const current = ++paintVersion;
    sharing = undefined;
    get('[data-share]').textContent = 'Ruaj / shpërndaj';
    compare.setAttribute('aria-busy', 'true');
    if (!compare.firstChild) compare.textContent = 'Duke ngarkuar foton…';
    try {
      const image = await preview(photo);
      if (current !== paintVersion) return;
      compare.replaceChildren(studioCompare(image));
      renderedKey = key;
      const next = order.photos[index + 1];
      if (next) void preview(next).catch(() => {});
    } catch {
      if (current !== paintVersion) return;
      if (!renderedKey) compare.textContent = 'Fotoja nuk u ngarkua. Duke provuar përsëri…';
    } finally {
      if (current === paintVersion) { fetchingKey = ''; compare.removeAttribute('aria-busy'); }
    }
  }
  get('[data-copy]').onclick = async () => {
    try { await navigator.clipboard.writeText(link.href); get('[data-live]').textContent = 'Linku u kopjua.'; }
    catch { get('[data-live]').textContent = link.href; }
  };
  const download = (selector, variant) => {
    const button = get(selector);
    button.onclick = async () => {
      button.disabled = true;
      actionStatus.textContent = 'Duke përgatitur shkarkimin…';
      try {
        studioDownload(await call('media', { variant, photoId: order.photos[index]?.id, format: get('[data-format]').value }));
        actionStatus.textContent = '';
      } catch (error) { actionStatus.textContent = error.message; }
      finally { button.disabled = selector === '[data-export]' && !get('[data-format]').value; }
    };
  };
  download('[data-save]', 'edited');
  download('[data-all]', 'edited-archive');
  download('[data-export]', 'export');
  get('[data-format]').onchange = event => { get('[data-export]').disabled = !event.target.value; };
  if (navigator.share && navigator.canShare) {
    const button = get('[data-share]');
    button.hidden = false;
    button.onclick = async () => {
      if (sharing) {
        try { await navigator.share({ files: [sharing] }); }
        catch (error) { if (error.name !== 'AbortError') actionStatus.textContent = 'Përdor butonin Shkarko foton.'; }
        return;
      }
      const photoId = order.photos[index]?.id;
      button.disabled = true;
      try {
        const file = await call('media', { variant: 'edited', photoId, share: true });
        const response = await fetch(file.url, { referrerPolicy: 'no-referrer' });
        if (!response.ok) throw Error();
        const prepared = new File([await response.blob()], file.name, { type: file.mime });
        if (photoId !== order.photos[index]?.id) return;
        if (!navigator.canShare({ files: [prepared] })) throw Error();
        sharing = prepared;
        button.textContent = 'Ruaj foton tani';
      } catch { actionStatus.textContent = 'Përdor butonin Shkarko foton.'; }
      finally { button.disabled = false; }
    };
  }
  let refreshing = false, delay = 4000;
  async function refresh() {
    if (refreshing || document.hidden) return;
    refreshing = true;
    try {
      const updated = await call('receipt', { revision: order.revision });
      if (!updated.unchanged) order = updated;
      await paint();
      delay = 4000;
    } catch {
      // Keep the last valid receipt and images while the network reconnects.
      delay = Math.min(delay * 2, 60000);
    } finally {
      refreshing = false;
      if (!document.hidden && !['expired', 'cancelled'].includes(order.status)) timer = setTimeout(refresh, delay);
    }
  }
  const schedule = () => { clearTimeout(timer); if (!document.hidden) void refresh(); };
  document.addEventListener('visibilitychange', schedule);
  globalThis.addEventListener('online', schedule);
  void paint();
  schedule();
}

async function start() {
  try {
    if (givenToken || readPending()) {
      try { openReceipt(await call('receipt')); return; }
      catch (error) { if (givenToken || error.status !== 404) throw error; }
    }
    const { businessName } = await call('studio-info');
    mountForm(businessName);
  } catch (error) {
    root.innerHTML = `${nav}<section class="studio-card"><p class="studio-error" role="alert">${esc(error.message)}</p><button type="button">Provo përsëri</button></section>`;
    root.querySelector('button').onclick = () => void start();
  } finally { stopBusy(); }
}
void start();
