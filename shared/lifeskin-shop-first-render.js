// Public first-paint contract shared by the HTML handler and browser.
import { SETET_STANDARD, aktiveSetet, setetOderStandard, setPreis } from './lifeskin-shop-sets.js';
import { AKTION_STANDARD, aktionNormalisieren, aktionLaeuft, aktionTexte } from './lifeskin-aktion.js';

export const SHOP_START_SETET = { lista: SETET_STANDARD.map(s => s.id === 'acne' ? { ...s, cmimi: 25 } : s) };
export const SHOP_HERO_FALLBACK = '/apps/lifeskin-shop/assets/set-hero.jpg';
export const SHOP_CONFIG_BASE = 'https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents/lifeskin/lifeskin/config';

export function shopOffer(setDok, rawAktion, now = Date.now()) {
  if (setDok !== null && !Array.isArray(setDok?.lista)) throw new Error('Invalid shop offer');
  if (rawAktion !== null && typeof rawAktion?.aktiv !== 'boolean') throw new Error('Invalid shop promotion');
  const sets = aktiveSetet(setetOderStandard(setDok || SHOP_START_SETET))
    .filter(s => s.produkte.length === 2 && s.produkte.includes('lf-acne') && s.produkte.includes('lf-moistur')).slice(0, 1);
  const aktion = aktionNormalisieren(rawAktion || AKTION_STANDARD);
  const promotion = sets.length > 0 && aktionLaeuft(aktion, now);
  return { setDok: setDok || SHOP_START_SETET, aktion, available: sets.length > 0,
    price: sets.length ? promotion ? aktion.cmimi : setPreis(sets[0]) : null,
    promotion, texts: promotion ? aktionTexte(aktion, now) : null };
}

export function firestoreValue(field) {
  if (!field || typeof field !== 'object') return null;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return field.booleanValue;
  if ('arrayValue' in field) return (field.arrayValue.values || []).map(firestoreValue);
  if ('mapValue' in field) return firestoreFields(field.mapValue.fields);
  return null;
}
export function firestoreFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, firestoreValue(value)]));
}

const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function renderShop(html, { offer, hero } = {}, now = Date.now()) {
  const seed = { offer: offer || null, hero: hero || null };
  html = html.replace('/*SHOP_FIRST_RENDER*/null', () => json(seed));
  if (hero) {
    const responsive = hero.url.startsWith('/api/lifeskin-shop-hero?')
      ? `${hero.url}&w=720 720w, ${hero.url} 1050w` : '';
    const sizes = '(min-width: 900px) 510px, calc(100vw - 40px)';
    html = html.replace('data-shop-hero="pending"', 'data-shop-hero="ready"')
      .replace('data-shop-hero-src', `src="${escape(hero.url)}"${responsive ? ` srcset="${escape(responsive)}" sizes="${sizes}"` : ''}`)
      .replace(/<meta name="viewport"[^>]+>/, viewport => `${viewport}\n<link rel="preload" as="image" href="${escape(hero.url)}"${responsive ? ` imagesrcset="${escape(responsive)}" imagesizes="${sizes}"` : ''} fetchpriority="high">`);
  }
  if (!offer) return html;
  html = html.replace('data-shop-preis="pending"', `data-shop-preis="${offer.available ? 'bereit' : 'fehlt'}"`);
  html = html.replace(/(<[^>]+data-preis="cmimi"[^>]*>)[^<]*(<\/[^>]+>)/g, (_, open, close) => `${open}${offer.available ? offer.price + ' €' : '—'}${close}`);
  if (offer.available) html = html.replace(/ disabled data-shop-await/g, '');
  if (offer.promotion) {
    html = html.replace('id="aktion" hidden', 'id="aktion"');
    const t = offer.texts;
    const seconds = Math.max(0, Math.floor((Date.parse(offer.aktion.bis) - now) / 1000));
    const clock = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
    const values = { 'aktion-plakete': t.plakete === 'VETËM SOT' ? 'ZBRITJE E SOTME' : 'ZBRITJE', 'aktion-ende': t.ende,
      'aktion-cmimi': `${t.cmimi} €`, 'aktion-vecmas': `${t.vecmas} €`, 'aktion-kursen': `Kursen ${t.kursen} €`, 'aktion-mbetur': clock };
    for (const [id, value] of Object.entries(values)) {
      html = html.replace(new RegExp(`(id="${id}"[^>]*>)[^<]*`), (_, open) => open + escape(value));
    }
    if (!t.kursen) for (const id of ['aktion-nga', 'aktion-vecmas', 'aktion-kursen']) html = html.replace(`id="${id}"`, `id="${id}" hidden`);
  }
  return html;
}
