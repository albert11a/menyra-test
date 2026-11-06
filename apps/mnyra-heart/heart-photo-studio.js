import { ccEscape as esc } from '../../shared/content-creator.js';
import { euro } from '../../shared/content-creator-shop.js';
import { STUDIO_ACCEPT, STUDIO_MAX_BYTES, STUDIO_PAYMENT, STUDIO_STATES, studioState } from '../../shared/photo-studio.js';
import { ensureStudioStyles, putStudioFile, studioDownload } from '../../shared/photo-studio-client.js';
import { decodeStudioComparison, studioCompare } from '../../shared/photo-studio-compare.js';

const actionLabels = {
  start: 'Bearbeitung starten', publish: 'Ergebnis für Kunden freigeben',
  'confirm-payment': 'Zahlung erfassen', 'release-downloads': 'Downloads freigeben',
  complete: 'Auftrag abschließen', cancel: 'Auftrag stornieren', note: 'Bearbeitungsnotiz'
};
const eventLabels = { ordered: 'Bestellung eingegangen', 'result-uploaded': 'Ergebnisversion hochgeladen', ...actionLabels };

export function openHeartStudio({ store, initial, request }) {
  ensureStudioStyles();
  let order = initial, index = 0, busy = false, previewVersion = '', previewTask = 0, attempted;
  const dialog = document.createElement('dialog');
  dialog.className = 'studio-admin';
  dialog.setAttribute('aria-labelledby', 'heart-studio-title');
  dialog.innerHTML = `<header class="studio-nav"><div><span class="studio-kicker">MNYRA PHOTO STUDIO</span><h2 id="heart-studio-title">${esc(order.businessName)} · #${esc(order.id.slice(0, 12).toUpperCase())}</h2></div><button type="button" data-close>Schließen</button></header>
    <div data-details></div>
    <div class="studio-toolbar"><button type="button" data-download="original-archive">Originale herunterladen</button><button type="button" data-download="edited-archive">Alle Ergebnisse herunterladen</button></div>
    <section class="studio-card" data-editor><nav class="studio-pagination" aria-label="Fotos des Auftrags"></nav><div data-comparison></div>
    <div class="studio-toolbar"><button type="button" data-download="original">Original herunterladen</button><button type="button" data-download="edited">Ergebnis herunterladen</button></div>
    <form data-upload><label>Bearbeitetes Foto hochladen / ersetzen<input required type="file" accept="${STUDIO_ACCEPT}"></label>
      <button type="submit" class="studio-primary">Ergebnis speichern</button> <span data-studio-progress role="status"></span></form></section>
    <p class="studio-error" data-error role="alert"></p>
    <div class="studio-toolbar" data-actions></div>
    <form data-action-form hidden class="studio-card studio-admin-workflow"><h3></h3>
      <label data-note-label><span></span><textarea maxlength="1000" rows="2"></textarea></label>
      <label data-method>Zahlungsart<select><option value="manual">Manuell</option><option value="consolidated">Sammelabrechnung</option></select></label>
      <label data-confirm><span><input type="checkbox"> Zahlung über <strong>${euro(order.totalCents)}</strong> ist tatsächlich eingegangen.</span></label>
      <div class="studio-toolbar"><button type="submit" class="studio-primary">Bestätigen</button><button type="button" data-cancel>Zurück</button></div>
    </form>
    <details class="studio-card"><summary>Bearbeitungsverlauf</summary><ol data-history></ol></details>`;
  document.body.append(dialog);
  const get = selector => dialog.querySelector(selector);
  const upload = get('[data-upload]'), fileInput = upload.querySelector('input');
  const controls = get('[data-action-form]'), errorBox = get('[data-error]');
  const note = controls.querySelector('textarea'), check = controls.querySelector('[type=checkbox]');
  const comparison = get('[data-comparison]'), progress = get('[data-studio-progress]');
  const call = (op, data = {}) => request(op, { pageId: order.pageId, orderId: order.id, ...data });
  const selection = get('.studio-pagination');
  const closed = () => order.processingStatus === 'cancelled' || Date.parse(order.mediaExpiresAt) <= Date.now();
  const currentPhoto = () => order.photoRecords[index];
  const complete = () => order.photoRecords.every(photo => photo.result);
  let currentAction = '';

  function setDisabled() {
    for (const button of dialog.querySelectorAll('button:not([data-close]):not([data-compare])')) {
      const variant = button.dataset.download;
      button.disabled = busy || (!!variant && (closed() ||
        (variant === 'edited' && !currentPhoto().result) || (variant === 'edited-archive' && !complete())));
    }
    fileInput.disabled = busy || closed();
  }
  async function work(task) {
    if (busy) return;
    busy = true;
    errorBox.textContent = '';
    setDisabled();
    try { await task(); }
    catch (error) { errorBox.textContent = error.message; }
    finally { busy = false; setDisabled(); }
  }
  async function renderPreview() {
    if (closed()) { ++previewTask; comparison.textContent = 'Die Fotos sind nicht mehr verfügbar.'; return; }
    const photo = currentPhoto(), key = [photo.id, photo.result?.version].join(':');
    if (key === previewVersion) return;
    previewVersion = key;
    const task = ++previewTask;
    if (!comparison.firstChild) comparison.textContent = 'Vorschau lädt …';
    try {
      const image = await call('admin-media', { variant: 'preview', photoId: photo.id }).then(decodeStudioComparison);
      if (task === previewTask && dialog.open) comparison.replaceChildren(studioCompare(image, { afterLabel: 'MNYRA Edit', missing: 'Bearbeitetes Foto fehlt.' }));
    } catch (error) {
      if (task !== previewTask) return;
      previewVersion = '';
      errorBox.textContent = error.message;
      const retry = document.createElement('button');
      retry.type = 'button'; retry.textContent = 'Vorschau erneut laden';
      retry.onclick = () => { retry.remove(); void renderPreview(); };
      comparison.append(retry);
    }
  }
  function render() {
    const active = !closed(), pending = order.photoRecords.some(photo => photo.result && photo.result.version !== photo.published?.version);
    get('[data-details]').innerHTML = `<p class="studio-meta"><span>${esc(order.customer.name)}</span><span>${esc(order.customer.phone)}</span><span>${esc(order.customer.email)}</span><span>${order.photoCount} × ${euro(order.unitPriceCents)} = ${euro(order.totalCents)}</span></p>
      <p>${STUDIO_STATES[studioState(order)]} · ${STUDIO_PAYMENT[order.paymentStatus]}${order.downloadsReleased ? ' · Downloads freigegeben' : ''}</p>
      ${order.requestedStyle || order.customerNotes ? `<p>${esc(order.requestedStyle)} ${esc(order.customerNotes)}</p>` : ''}
      ${order.paymentReference ? `<p class="studio-fine">Zahlungsreferenz ${esc(order.paymentReference)}</p>` : ''}`;
    const photos = order.photoRecords;
    selection.innerHTML = photos.map((photo, i) => `<button type="button" aria-current="${i === index}" aria-label="Foto ${i + 1}, ${photo.result ? 'bearbeitet' : 'offen'}">${i + 1} ${photo.result ? '✓' : '·'}</button>`).join('');
    [...selection.children].forEach((button, i) => button.onclick = () => {
      index = i; upload.reset(); attempted = undefined; progress.textContent = ''; render(); selection.children[i]?.focus();
    });
    upload.hidden = !active;
    const actions = [];
    if (active && order.processingStatus === 'pending') actions.push('start');
    if (active && complete() && (!order.previewReleased || pending)) actions.push('publish');
    if (order.processingStatus !== 'cancelled') {
      if (order.paymentStatus === 'unpaid') actions.push('confirm-payment', 'cancel');
      if (active && order.paymentStatus === 'paid' && order.previewReleased && !order.downloadsReleased) actions.push('release-downloads');
      if (order.downloadsReleased && order.processingStatus !== 'completed') actions.push('complete');
      actions.push('note');
    }
    const buttons = get('[data-actions]');
    buttons.innerHTML = actions.map(action => `<button type="button" data-studio-action="${action}">${actionLabels[action]}</button>`).join('');
    for (const button of buttons.children) button.onclick = () => {
      currentAction = button.dataset.studioAction;
      const payment = currentAction === 'confirm-payment', wantsNote = payment || ['note', 'cancel'].includes(currentAction);
      controls.reset(); controls.hidden = false;
      controls.querySelector('h3').textContent = actionLabels[currentAction];
      get('[data-note-label]').hidden = !wantsNote;
      get('[data-note-label] span').textContent = payment ? 'Beleg oder Referenz der Sammelabrechnung' : currentAction === 'cancel' ? 'Grund für die Stornierung' : 'Interne Notiz';
      get('[data-method]').hidden = !payment;
      get('[data-confirm]').hidden = !payment;
      note.required = wantsNote; check.required = payment;
      (wantsNote ? note : controls.querySelector('[type=submit]')).focus();
    };
    get('[data-history]').innerHTML = [...order.history].reverse().map(item => `<li>${new Date(item.at).toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })} · ${esc(eventLabels[item.event] || item.event)}${item.note ? ' · ' + esc(item.note) : ''}</li>`).join('');
    setDisabled();
    void renderPreview();
  }
  controls.onsubmit = event => {
    event.preventDefault();
    void work(async () => {
      await call('admin-state', { action: currentAction, note: note.value, confirmed: check.checked, paymentMethod: controls.querySelector('select').value });
      controls.hidden = true;
    });
  };
  get('[data-cancel]').onclick = () => { controls.hidden = true; };
  upload.onsubmit = event => {
    event.preventDefault();
    const file = fileInput.files[0], photo = currentPhoto();
    if (!file) return;
    void work(async () => {
      if (!file.size || file.size > STUDIO_MAX_BYTES) throw Error('Pro Foto sind maximal 30 MB möglich.');
      if (attempted?.file !== file) attempted = { file, version: crypto.randomUUID(), baseVersion: photo.result?.version || '' };
      const data = { photoId: photo.id, bytes: file.size, version: attempted.version, baseVersion: attempted.baseVersion };
      progress.textContent = 'Upload startet …';
      try {
        const slot = await call('admin-prepare-result', data);
        if (!slot.accepted) {
          await putStudioFile(slot.url, file, percent => { progress.textContent = percent + ' %'; });
          progress.textContent = 'Datei wird geprüft …';
          await call('admin-accept-result', data);
        }
        progress.textContent = 'Ergebnis gespeichert.';
        attempted = undefined;
        upload.reset();
      } catch (error) { progress.textContent = ''; throw error; }
    });
  };
  for (const button of dialog.querySelectorAll('[data-download]')) button.onclick = () => void work(async () => {
    studioDownload(await call('admin-media', { variant: button.dataset.download, photoId: currentPhoto().id }));
  });
  const unsubscribe = store.subscribe(state => {
    if (state.auth.status !== 'authenticated' || !state.auth.access?.allowed) { dialog.close(); return; }
    const next = state.contentCreator.studioOrders?.find(row => row.id === order.id);
    if (next && next.revision !== order.revision) { order = next; render(); }
  });
  dialog.addEventListener('close', () => { unsubscribe(); dialog.remove(); }, { once: true });
  get('[data-close]').onclick = () => dialog.close();
  dialog.showModal();
  render();
}
