import { escapeHtml } from './heart-ui-utils.js';
import { klappAttr } from './heart-lifeskin-klapp.js';
import { nachrichtenNormalisieren } from '../../shared/lifeskin-shop-bewertungen.js';

export function renderShopNachrichten(zustand = {}) {
  const liste = nachrichtenNormalisieren(zustand.shopNachrichten);
  const busy = Boolean(zustand.shopNachrichtenStatus);
  return `<details class="heart-lifeskin-block heart-klapp" ${klappAttr('shopnachrichten')}><summary class="heart-klapp__kopf"><h3 class="heart-lifeskin-block__titel">Shop – Originalnachrichten</h3><span class="heart-klapp__zahl">${liste.length} Nachrichten</span></summary><p class="heart-lifeskin-block__fuss">Diese Kundennachrichten stehen im Shop. Das Originalbild öffnet sich dort erst beim Antippen.</p>${!liste.length ? '<p class="heart-lifeskin-leer">Keine Originalnachricht im Shop.</p>' : `<ul class="heart-kommentare">${liste.map(k => `<li class="heart-kommentar heart-shopnachricht"><div class="heart-kommentar__leib"><p class="heart-kommentar__text">${escapeHtml(k.text)}</p><div class="heart-kommentar__knoepfe"><a class="heart-lifeskin-knopf" href="${escapeHtml(k.bild)}" target="_blank" rel="noopener">Original öffnen</a><button type="button" class="heart-lifeskin-knopf heart-kommentar__weg" data-action="lifeskin-shopnachricht-loeschen" data-id="${escapeHtml(k.id)}" ${busy ? 'disabled' : ''}>${zustand.shopNachrichtLoeschen === k.id ? 'Wirklich löschen?' : 'Löschen'}</button></div></div></li>`).join('')}</ul>`}${busy ? '<p role="status">Wird gespeichert …</p>' : ''}</details>`;
}
