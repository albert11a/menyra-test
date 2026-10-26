import { fastKonfig } from '../../shared/lifeskin-fast.js';
const icon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m13 2-8 12h6l-1 8 9-13h-7z"/></svg>';
export function renderFastKnopf(state = {}) {
  const on = fastKonfig(state.fast).enabled;
  return `<button type="button" class="heart-fast${on ? ' heart-fast--an' : ''}" data-action="lifeskin-fast-toggle" aria-pressed="${on}" aria-label="Fast ${on ? 'ausschalten' : 'einschalten'}"${state.fastSpeichert || state.status !== 'ready' ? ' disabled' : ''}>${icon}<span>Fast</span></button>`;
}
export function renderFastPreise(state = {}) {
  const c = fastKonfig(state.fast);
  return `<section class="heart-lifeskin-block heart-fast-preise"><h3>Fast · Setpreise</h3>
    <p>Nur /lifeskin bei eingeschaltetem Fast. Bestehende Analysen und Shoppreise bleiben erhalten.</p>
    <div class="heart-fast-preise__felder">${[2, 3, 4].map(n => `<label>${n} Produkte · €<input id="lifeskin-fast-preis-${n}" type="number" min="0.01" max="1000" step="0.01" inputmode="decimal" value="${c.prices[n]}"></label>`).join('')}</div>
    <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-fast-preise"${state.fastSpeichert ? ' disabled' : ''}>Preise speichern</button>
  </section>`;
}
