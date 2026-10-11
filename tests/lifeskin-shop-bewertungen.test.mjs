import test from 'node:test';
import assert from 'node:assert/strict';
import { nachrichtenNormalisieren, bewertungText, bewertungLesen, bewertungZusammenfassung, SHOP_REVIEW_MEDIUM } from '../shared/lifeskin-shop-bewertungen.js';
import { kommentarSchreiben } from '../shared/lifeskin-medien.js';
import { reviewMarkup, nachrichtMarkup, reviewSummaryMarkup, nachrichtenAktualisieren } from '../apps/lifeskin-shop/bewertungen.js';
import { kommentarMedien, renderMedienReaktionen } from '../apps/mnyra-heart/heart-lifeskin-medien.js';
import { renderShopNachrichten } from '../apps/mnyra-heart/heart-lifeskin-shopnachrichten.js';

test('rating survives the existing comment write/read format without new database fields', async () => {
  let stored;
  const saved = await kommentarSchreiben(SHOP_REVIEW_MEDIUM, { name: 'Arta', text: bewertungText('Mire per lekuren time.', 4) }, {
    basis: 'https://example.test/documents',
    fetchFn: async (url, options) => {
      assert.ok(url.endsWith('/medien/shop-acne-duo/kommentare'));
      stored = JSON.parse(options.body).fields;
      return { ok: true, json: async () => ({ name: `${url}/review-a` }) };
    }
  });
  assert.deepEqual(Object.keys(stored).sort(), ['createdAt', 'name', 'text', 'verborgen']);
  assert.equal(stored.verborgen.booleanValue, false);
  assert.equal(bewertungLesen(saved).sterne, 4);
  assert.equal(bewertungLesen(saved).text, 'Mire per lekuren time.');
  assert.throws(() => bewertungText('Test', 0));
  assert.throws(() => bewertungText('Test', 6));
  assert.throws(() => bewertungText('', 5));
});

test('averages use genuine numeric reviews and do not rate original messages', () => {
  assert.deepEqual(bewertungZusammenfassung([]), { anzahl: 0, durchschnitt: null });
  assert.deepEqual(bewertungZusammenfassung([{ text: 'Customer quote' }, { text: bewertungText('Good', 5) }, { text: bewertungText('Okay', 3) }]), { anzahl: 2, durchschnitt: 4 });
  assert.equal(bewertungLesen({ text: '[9/5]\nInvalid' }).sterne, null);
});

test('deleting all original messages does not restore defaults; unsafe originals are rejected', () => {
  assert.equal(nachrichtenNormalisieren(null).length, 17);
  assert.deepEqual(nachrichtenNormalisieren([]), []);
  assert.deepEqual(nachrichtenNormalisieren([{ id: 'x', text: 'Quote', bild: 'javascript:alert(1)' }]), []);
  const k = { id: 'safe', text: 'Quote', bild: '/apps/lifeskin-shop/assets/mesazh.jpg' };
  assert.equal(nachrichtenNormalisieren([k, k]).length, 1);
});

test('visitor content is escaped in public and admin review cards', () => {
  const k = { id: 'x', name: '<img onerror=bad>', text: bewertungText('<script>bad()</script>', 2), createdAt: '2026-10-11T02:00:00Z' };
  const markup = reviewMarkup(k);
  assert.doesNotMatch(markup, /<script>|<img onerror/);
  assert.match(markup, /&lt;script&gt;/);
  assert.match(markup, /2 nga 5 yje/);
  const original = nachrichtMarkup({ text: '<b>Quote</b>', bild: '/apps/lifeskin-shop/assets/x.jpg' });
  assert.doesNotMatch(original, /<img|<b>Quote/);
  assert.match(original, /data-zitat-bild=/);
});

test('Heart includes shop reviews, media comments and hidden reviews for moderation', () => {
  const state = { weg: 'lifeskinshop', medien: [{ id: 'media-a', art: 'foto', bild: 'https://example.test/a.jpg', aktiv: true }], medienKommentare: { [SHOP_REVIEW_MEDIUM]: [{ id: 'review-a', medium: SHOP_REVIEW_MEDIUM, name: 'Arta', text: bewertungText('Test', 3), createdAt: '', verborgen: true }] } };
  assert.ok(kommentarMedien(state).some(m => m.id === SHOP_REVIEW_MEDIUM));
  const rendered = renderMedienReaktionen(state);
  assert.match(rendered, /3 \/ 5 Sterne/);
  assert.match(rendered, /Wieder zeigen/);
  assert.match(rendered, /data-medium="shop-acne-duo" data-id="review-a"/);
  assert.match(rendered, /data-action="lifeskin-kommentare-laden"/);
  assert.doesNotMatch(renderShopNachrichten({ shopNachrichten: [] }), /mesazh-ftyra/);
  assert.match(renderShopNachrichten({ shopNachrichtLoeschen: 'mesazh-ftyra' }), /Wirklich löschen/);
});


test('summary stars show the genuine average before the numeric rating and disappear without ratings', () => {
  assert.equal(reviewSummaryMarkup([]), '');
  assert.equal(reviewSummaryMarkup([{ text: 'Original message' }]), '');
  const full = reviewSummaryMarkup([{ text: bewertungText('Good', 5) }]);
  assert.match(full, /review-summary-stars.*width:100%/);
  assert.match(full, /<\/span>5\.0 \/ 5 · 1 vleresime/);
  const mixed = reviewSummaryMarkup([{ text: bewertungText('Good', 5) }, { text: bewertungText('Okay', 2) }]);
  assert.match(mixed, /width:70%/);
  assert.match(mixed, /3\.5 \/ 5 · 2 vleresime/);
});

test('Heart message refresh preserves the already loaded first Instagram card, even with zero messages', () => {
  const profile = { id: 'instagram-profile' };
  const rail = {
    children: [profile, { id: 'old-message' }],
    querySelectorAll(selector) {
      assert.equal(selector, '.message-card:not(.ig-erste)');
      return this.children.slice(1).map(c => ({ remove: () => { this.children = this.children.filter(x => x !== c); } }));
    },
    insertAdjacentHTML(position, html) { assert.equal(position, 'beforeend'); this.html = html; }
  };
  nachrichtenAktualisieren(rail, [{ id: 'real', text: 'Quote', bild: '/apps/lifeskin-shop/assets/mesazh-ftyra.jpg' }]);
  assert.equal(rail.children[0], profile);
  assert.match(rail.html, /Quote/);
  nachrichtenAktualisieren(rail, []);
  assert.equal(rail.children[0], profile);
  assert.equal(rail.html, '');
});
