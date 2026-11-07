import { creatorStudioSamples } from '../../shared/creator-media.js';
import { ccEscape as esc } from '../../shared/content-creator.js';
import { euro } from '../../shared/content-creator-shop.js';
import { STUDIO_PAYMENT, STUDIO_STATES, studioState, studioStats } from '../../shared/photo-studio.js';
import { creatorCard } from './heart-creator-components.js';

const datetime = value => new Intl.DateTimeFormat('de-AT', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Vienna' }).format(new Date(value));
const statuses = { pending: 'Neu', processing: 'In Bearbeitung', ready: 'Fertig bearbeitet', completed: 'Abgeschlossen', cancelled: 'Storniert' };

export function studioOrderCard(order) {
  return `<details class="cc-order" data-cc-fold="studio-${esc(order.id)}"><summary><span>Photo Studio · ${esc(order.businessName)}<small>${datetime(order.createdAt)} · ${esc(order.customer.name)}</small></span><span>${euro(order.totalCents)}<small>${STUDIO_PAYMENT[order.paymentStatus]}</small></span></summary>
    <p>${esc(order.customer.name)} · ${esc(order.customer.phone)}</p>
    <p>${order.photoCount} Fotos × ${euro(order.unitPriceCents)} · ${STUDIO_STATES[studioState(order)]}</p>
    <button type="button" data-cc-action="studio-open" data-id="${esc(order.id)}">Fotoauftrag öffnen</button>
  </details>`;
}

export function studioOverview(state, page) {
  const rows = (state.studioOrders || []).filter(order => !page || order.pageId === page.id);
  const stats = studioStats(rows);
  const term = (state.studioSearch || '').trim().toLowerCase();
  const status = state.studioFilter || '';
  const filtered = rows.filter(order => (page || !term || order.businessName.toLowerCase().includes(term)) &&
    (!status || (status === 'unpaid' ? order.previewReleased && order.paymentStatus === 'unpaid' : status === order.processingStatus)));
  const sorted = filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const limit = state.studioLimit || 20;
  return creatorCard(`photo-studio-${page?.id || 'all'}`, 'Photo Studio', `
    ${page ? `<div class="cc-row-actions"><button type="button" data-cc-action="studio-toggle" data-id="${esc(page.id)}" aria-pressed="${page.photoStudioEnabled === true}" ${!page.published ? 'disabled' : ''}>${page.photoStudioEnabled ? 'Photo Studio deaktivieren' : 'Photo Studio aktivieren'}</button></div>` : ''}
    ${state.studioError ? `<p class="cc-muted" role="status">${esc(state.studioError)}</p>` : ''}
    <div class="cc-stats cc-studio-stats">${[
      ['Neu', stats.pending], ['In Bearbeitung', stats.processing], ['Fertig bearbeitet', stats.ready],
      ['Warten auf Zahlung', stats.unpaid], ['Abgeschlossen', stats.completed], ['Offen', stats.open],
      ['Eingereichte Fotos', stats.photos], ['Bearbeitete Fotos', stats.edited],
      ['Bestellwert', euro(stats.value)], ['Bestätigte Einnahmen', euro(stats.paid)]
    ].map(([label, value]) => `<div class="cc-stat"><strong>${value}</strong><span>${label}</span></div>`).join('')}</div>
    <div class="cc-row-actions cc-studio-filters">
      ${page ? '' : `<input id="cc-studio-search" type="search" data-studio-search aria-label="Photo-Studio-Business suchen" placeholder="Business suchen" value="${esc(state.studioSearch || '')}">`}
      <label>Auftragsstatus <select data-studio-filter><option value="">Alle</option>${Object.entries({ ...statuses, unpaid: 'Warten auf Zahlung' }).map(([key, label]) => `<option value="${key}" ${key === status ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
    </div>
    ${sorted.slice(0, limit).map(studioOrderCard).join('') || '<p class="cc-muted">Keine Aufträge in dieser Auswahl.</p>'}
    ${sorted.length > limit ? '<button type="button" data-cc-action="more" data-key="studioLimit">Mehr anzeigen</button>' : ''}
  `, state, { count: rows.length });
}

export function studioSamplesCard(page, state) {
  const samples = creatorStudioSamples(page);
  return creatorCard(`studio-samples-${page.id}`, 'Samples', `
    <p class="cc-muted">Dieses Vorher-Nachher-Paar erscheint im Photo Studio auf der Business-Seite. Nur freigegebene Beispielbilder hochladen.</p>
    <div class="cc-studio-samples">
      ${[['before', 'Unbearbeitet'], ['after', 'Bearbeitet']].map(([side, label]) => `
        <label>
          <strong>${label}</strong>
          ${samples[side] ? `<img src="${esc(samples[side])}" alt="${label}" loading="lazy">` : '<span class="cc-muted">Noch kein Bild</span>'}
          <input type="file" accept="image/jpeg,image/png,image/webp" data-cc-studio-sample="${side}" data-page="${esc(page.id)}" ${state.mediaBusy ? 'disabled' : ''}>
        </label>
      `).join('')}
    </div>
  `, state);
}
