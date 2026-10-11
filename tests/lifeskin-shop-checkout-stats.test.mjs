import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutBegonnen } from '../shared/lifeskin-checkout.js';
import { normalisiere, warAnDerKasse } from '../apps/mnyra-heart/heart-lifeskin-berechnung.js';
import { baueShopWeg } from '../apps/mnyra-heart/heart-lifeskin-weg.js';
import { faelligeMeldungen } from '../scripts/meldungs-waechter/meldungs-regeln.mjs';
import { shopAbschnitte, shopSichtPatch } from '../shared/lifeskin-shopsicht.js';

const shop = { source: { weg: 'lifeskinshop' }, step: 'opened', kasseGeoeffnet: true, updatedAt: new Date().toISOString() };
const kasseMeldung = s => faelligeMeldungen(s).some(m => m.type === 'lifeskin_kasse');

test('historical shop screen opening alone is neither checkout nor checkout notification', () => {
  for (const s of [shop, { ...shop, timings: { kasse: { v: 2, geoeffnet: shop.updatedAt } } }]) {
    assert.equal(checkoutBegonnen(s), false);
    assert.equal(warAnDerKasse(s), false);
    assert.equal(normalisiere('old', s).kasseGeoeffnet, false);
    assert.equal(kasseMeldung(s), false);
    assert.equal(baueShopWeg([s]).kauf.find(x => x.id === 'kasse').anzahl, 0);
  }
});

test('first input evidence agrees in Heart and notification, including historical typed fields', () => {
  for (const evidence of [
    { adresseBegonnen: true },
    { timings: { kasse: { v: 2, begonnen: shop.updatedAt } } },
    { timings: { kasse: { felder: { name: 'Ada' } } } }
  ]) {
    const s = { ...shop, ...evidence };
    assert.equal(checkoutBegonnen(s), true);
    assert.equal(warAnDerKasse(s), true);
    assert.equal(normalisiere('started', s).kasseGeoeffnet, true);
    assert.equal(kasseMeldung(s), true);
    assert.equal(baueShopWeg([s]).kauf.find(x => x.id === 'kasse').anzahl, 1);
  }
  assert.equal(checkoutBegonnen({ ...shop, timings: { kasse: { felder: { name: '   ' } } } }), false);
});

test('completed orders prove checkout but only produce the order notification; manual orders excluded', () => {
  const ordered = { ...shop, hatBestellt: true, order: { orderId: 'real' } };
  assert.equal(checkoutBegonnen(ordered), true);
  assert.equal(kasseMeldung(ordered), false);
  assert.equal(checkoutBegonnen({ ...ordered, manuell: true }), false);
  assert.equal(checkoutBegonnen({ ...ordered, order: { orderId: 'manual', manuell: true } }), false);
});

test('analysis checkout keeps its original screen-opening definition', () => {
  const s = { ...shop, source: {} };
  assert.equal(checkoutBegonnen(s), true);
  assert.equal(warAnDerKasse(s), true);
  assert.equal(kasseMeldung(s), true);
});

test('current sections count observed views once per session, without invented historical views', () => {
  const rows = shopAbschnitte([
    { timings: { shop: { v: 3, kundenMedien: true, bewertungen: true } } },
    { timings: { shop: { v: 3, kundenMedien: true, rutinaWahl: true } } },
    { produkteGesehen: true },
    { timings: { shop: { v: 1, s9: true } } }
  ]);
  assert.equal(rows.length, 14);
  assert.equal(rows.find(r => r.id === 'kundenMedien').anzahl, 2);
  assert.equal(rows.find(r => r.id === 'bewertungen').anzahl, 1);
  assert.equal(rows.find(r => r.id === 'rutinaWahl').anzahl, 1);
  assert.equal(rows.find(r => r.id === 'produkte').anzahl, 0);
  assert.equal(rows.find(r => r.id === 'abschluss').anzahl, 0);
  assert.deepEqual(shopSichtPatch(103), { v: 3, kundenMedien: true });
  assert.deepEqual(shopSichtPatch(7), { v: 3, skinreact: true });
});
