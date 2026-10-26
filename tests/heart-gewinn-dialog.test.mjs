import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { oeffneGewinnAds, oeffneGewinnKalender, kalenderKlick, kalenderTage } from '../apps/mnyra-heart/heart-lifeskin-gewinn-dialog.js';
import { morphInhalt } from '../apps/mnyra-heart/heart-morph.js';
import { renderGewinn } from '../apps/mnyra-heart/heart-lifeskin-gewinn.js';

function dom() {
  const { document, window } = parseHTML('<html><body><main id="root"></main></body></html>');
  const old = globalThis.document; globalThis.document = document;
  const create = document.createElement.bind(document);
  document.createElement = (tag) => {
    const el = create(tag);
    if (tag === 'dialog') {
      el.showModal = () => el.setAttribute('open', '');
      el.close = () => { el.removeAttribute('open'); el.dispatchEvent(new window.Event('close')); };
    }
    return el;
  };
  const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
  return { document, window, click, restore: () => { globalThis.document = old; } };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

test('calendar selection supports a single day, reverse ranges, month boundaries and leap years', () => {
  assert.equal(kalenderTage('2028-02').filter(Boolean).length, 29);
  assert.equal(kalenderTage('2026-02').filter(Boolean).length, 28);
  assert.deepEqual(kalenderTage('invalid'), []);
  let s = kalenderKlick({ monat: '2026-10' }, '2026-10-31');
  assert.equal(s.von, s.bis);
  s = kalenderKlick(s, '2026-11-02'); assert.equal(s.von, '2026-10-31'); assert.equal(s.bis, '2026-11-02');
  s = kalenderKlick(s, '2026-11-05'); s = kalenderKlick(s, '2026-10-29');
  assert.equal(s.von, '2026-10-29'); assert.equal(s.bis, '2026-11-05');
  assert.equal(kalenderKlick(s, '2026-02-30'), s);
});

test('calendar commits only on Apply; supports one day and ranges across months', () => {
  const env = dom();
  try {
    const results = [];
    let el = oeffneGewinnKalender({ filter: { zeit: 'vonbis', von: '2026-10-01', bis: '2026-10-01' }, uebernehmen: (f) => results.push(f) });
    env.click(el.querySelector('[data-kalender-tag="2026-10-25"]'));
    assert.equal(results.length, 0);
    env.click(el.querySelector('[data-kalender-uebernehmen]'));
    assert.deepEqual(results[0], { zeit: 'vonbis', von: '2026-10-25', bis: '2026-10-25' });
    assert.equal(el.isConnected, false);
    el = oeffneGewinnKalender({ filter: results[0], uebernehmen: (f) => results.push(f) });
    env.click(el.querySelector('[data-kalender-tag="2026-10-31"]'));
    env.click(el.querySelector('[data-monat="1"]'));
    env.click(el.querySelector('[data-kalender-tag="2026-11-02"]'));
    env.click(el.querySelector('[data-kalender-uebernehmen]'));
    assert.deepEqual(results[1], { zeit: 'vonbis', von: '2026-10-31', bis: '2026-11-02' });
    el = oeffneGewinnKalender({ filter: results[1], uebernehmen: (f) => results.push(f) });
    env.click(el.querySelector('[data-dialog-zu]')); assert.equal(results.length, 2);
  } finally { env.restore(); }
});

test('ads dialog survives statistics morph/loading and saves exact selected day/amount once', async () => {
  const env = dom();
  try {
    let finishLoad, finishSave, saves = 0, result;
    const root = env.document.getElementById('root');
    morphInhalt(root, renderGewinn([], { gewinnStatus: 'bereit' }, ['']));
    const el = oeffneGewinnAds({ wege: [''], laden: () => new Promise((r) => { finishLoad = r; }),
      speichern: (v) => { saves++; assert.deepEqual(v, { tag: '2026-10-25', weg: '', cent: 1027 }); return new Promise((r) => { finishSave = () => r(v); }); }, nachher: (a) => { result = a; } });
    const form = el.querySelector('form');
    el.querySelector('[name="betrag"]').value = '10,27'; el.querySelector('[name="datum"]').value = '2026-10-25';
    for (const gewinnStatus of ['laedt', 'bereit', 'fehler']) morphInhalt(root, renderGewinn([], { gewinnStatus }, ['']));
    assert.equal(el.isConnected, true); assert.equal(el.querySelector('[name="betrag"]').value, '10,27');
    finishLoad([{ tag: '2026-10-25', weg: '', cent: 500 }]); await flush();
    const submit = () => form.dispatchEvent(new env.window.Event('submit', { cancelable: true }));
    submit(); submit(); assert.equal(saves, 1); assert.equal(el.isConnected, true);
    finishSave(); await flush();
    assert.equal(el.isConnected, false); assert.deepEqual(result, [{ tag: '2026-10-25', weg: '', cent: 1027 }]);
  } finally { env.restore(); }
});

test('failed ads load retries, failed save keeps inputs and re-enables controls', async () => {
  const env = dom();
  try {
    let attempts = 0;
    const el = oeffneGewinnAds({ wege: ['lifeskinshop'], laden: async () => { if (++attempts === 1) throw new Error('offline'); return []; }, speichern: async () => { throw new Error('offline'); }, nachher: () => assert.fail('must not commit') });
    await flush(); assert.equal(el.querySelector('[type="submit"]').disabled, true);
    env.click(el.querySelector('[data-ads-neuladen]')); await flush();
    assert.equal(el.querySelector('[type="submit"]').disabled, false);
    el.querySelector('[name="betrag"]').value = '12,50';
    el.querySelector('form').dispatchEvent(new env.window.Event('submit', { cancelable: true })); await flush();
    assert.equal(el.isConnected, true); assert.equal(el.querySelector('[name="betrag"]').value, '12,50');
    assert.equal(el.querySelector('[type="submit"]').disabled, false); assert.match(el.querySelector('[role="alert"]').textContent, /offline/);
  } finally { env.restore(); }
});
