import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { oeffneGewinnAds, oeffneGewinnKalender, kalenderKlick, kalenderTage, oeffneGewinnInfo, renderGewinnAbzuege, oeffneGewinnStats, renderGewinnVerlauf } from '../apps/mnyra-heart/heart-lifeskin-gewinn-dialog.js';
import { morphInhalt } from '../apps/mnyra-heart/heart-morph.js';
import { renderGewinn, baueGewinn } from '../apps/mnyra-heart/heart-lifeskin-gewinn.js';

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


test('calendar filter and select remain consistent after morphing from today to a chosen day', () => {
  const env = dom();
  try {
    const root = env.document.getElementById('root');
    morphInhalt(root, renderGewinn([], { gewinnStatus: 'bereit', gewinnFilter: { zeit: 'heute' } }, ['']));
    const oldSelect = root.querySelector('select');
    morphInhalt(root, renderGewinn([], { gewinnStatus: 'bereit', gewinnFilter: { zeit: 'vonbis', von: '2026-10-24', bis: '2026-10-24' } }, ['']));
    const select = root.querySelector('select');
    assert.notEqual(select, oldSelect);
    assert.equal(select.value, 'vonbis');
    assert.equal(select.querySelector('option[selected]').textContent, 'Eigene Auswahl');
    assert.match(root.querySelector('.heart-gewinn__datumslabel').textContent, /24.10.2026/);
    assert.deepEqual([...select.options].map((o) => o.textContent), ['Heute', 'Gestern', 'Vorgestern', 'Letzte 7 Tage', 'Dieser Monat', 'Max · alle', 'Eigene Auswahl']);
  } finally { env.restore(); }
});


test('profit card uses the standard stat tiles and puts deductions behind Info beside Plus', () => {
  const env = dom();
  try {
    const root = env.document.getElementById('root');
    morphInhalt(root, renderGewinn([], { gewinnStatus: 'bereit' }, ['lifeskinshop']));
    assert.equal(root.querySelectorAll('.heart-lifeskin-kacheln > .heart-lifeskin-kachel').length, 12);
    const info = root.querySelector('[data-action="lifeskin-gewinn-info"]');
    assert.equal(info.parentElement.tagName, 'SUMMARY');
    assert.equal(info.nextElementSibling.getAttribute('data-action'), 'lifeskin-gewinn-plus');
    assert.equal(info.getAttribute('data-gewinn-wege'), '["lifeskinshop"]');
    assert.doesNotMatch(root.textContent, /Abzüge:|Verpackung|Sonstiges/);
  } finally { env.restore(); }
});

test('Info shows the selected period and exact deductions, survives live renders, closes normally', () => {
  const env = dom();
  const rechnung = { summe: { umsatz: 4400, produkt: 631, transport: 500, riba: 200, verpackung: 30, sonstiges: 0, ads: 2570, gewinn: 469, fehlt: 0, bestellungen: 1 }, grenzen: { von: '2026-10-24', bis: '2026-10-24' }, vorlaeufig: false };
  try {
    const el = oeffneGewinnInfo({ rechnung, adsBereit: true });
    const rows = Object.fromEntries([...el.querySelectorAll('dl > div')].map((r) => [r.querySelector('dt').textContent, r.querySelector('dd').textContent]));
    assert.equal(rows['Abzüge gesamt'], '39,31 €'); assert.equal(rows['Gewinn nach Kosten'], '4,69 €');
    assert.equal(rows.Transport, '5,00 €'); assert.equal(rows.Verpackung, '0,30 €'); assert.equal(rows.Sonstiges, undefined);
    assert.match(el.textContent, /24.10.2026/);
    morphInhalt(env.document.getElementById('root'), renderGewinn([], { gewinnStatus: 'laedt' }, ['']));
    assert.equal(el.isConnected, true);
    env.click(el.querySelector('[data-dialog-zu]')); assert.equal(el.isConnected, false);
    const missing = renderGewinnAbzuege({ ...rechnung, summe: { ...rechnung.summe, fehlt: 1 } }, false);
    assert.match(missing, /unvollständig/); assert.doesNotMatch(missing, /39,31 €|4,69 €/);
  } finally { env.restore(); }
});


test('Stats opens expandable order and ads lists for the same dates, with red zero-order days', () => {
  const env = dom();
  try {
    const rechnung = baueGewinn([
      { id: 'a', name: '<Kunde>', source: { weg: 'lifeskinshop' }, order: { orderId: 'A1', createdAt: '2026-10-25T10:00:00Z', total: 44 } },
      { id: 'b', source: { weg: '' }, order: { orderId: 'B1', createdAt: '2026-10-24T10:00:00Z', total: 34, status: 'storniert' } }
    ], { gewinnStatus: 'bereit', gewinnFilter: { zeit: 'woche' }, gewinnAds: [{ weg: '', tag: '2026-10-24', cent: 2000 }, { weg: '', tag: '2026-10-25', cent: 1000 }] }, ['', 'lifeskinshop'], '2026-10-26T12:00:00Z');
    const el = oeffneGewinnStats({ rechnung, adsBereit: true });
    assert.equal(el.querySelectorAll('details').length, 3);
    assert.match(el.querySelector('.heart-gewinn-verlauf').previousElementSibling.querySelector('summary').textContent, /Anulime/);
    const orderList = el.querySelector('details .heart-gewinn-bestellliste');
    assert.equal(orderList.querySelectorAll('li').length, 1);
    assert.match(orderList.textContent, /A1/); assert.doesNotMatch(orderList.textContent, /B1/);
    assert.equal(orderList.querySelector('b').textContent, '<Kunde>');
    const red = el.querySelector('tr.ohne-bestellung');
    assert.match(red.textContent, /24.10.2026/); assert.match(red.textContent, /20,00 €/);
    assert.match(el.textContent, /1 Tag mit Ads-Kosten ohne Bestellung/);
    const root = env.document.getElementById('root'); morphInhalt(root, renderGewinn([], { gewinnStatus: 'bereit' }, ['']));
    assert.equal(el.isConnected, true);
    env.click(el.querySelector('[data-dialog-zu]')); assert.equal(el.isConnected, false);
  } finally { env.restore(); }
});

test('daily table colors positive orders and profit green, zero orders and losses red, zero/unknown profit neutral', () => {
  const env = dom();
  try {
    const sessions = [20, 1, 4.8, 8].map((total, i) => ({ id: `color${i}`, source: { weg: '' }, order: { orderId: `C${i}`, createdAt: `2026-10-${24 + i}T10:00:00Z`, total, items: [{ id: 'p', sasia: 1 }] } }));
    const st = { gewinnStatus: 'bereit', gewinnFilter: { zeit: 'max' }, gewinnAds: [24, 25, 26, 27, 28].map((n) => ({ weg: '', tag: `2026-10-${n}`, cent: n === 28 ? 100 : 0 })),
      produktkosten: { shisheStueck: 1, stikerStueck: 1, kreme: [{ name: 'p', produkt: 'p', preis: 0, menge: 30 }] },
      dergesat: Object.fromEntries([0, 1, 2].map((i) => [`color${i}`, { postaBeki: '123' }])) };
    const root = env.document.getElementById('root'); morphInhalt(root, renderGewinn(sessions, st, ['']));
    const rows = Object.fromEntries([...root.querySelectorAll('.heart-gewinn__tabelle tbody tr')].map((row) => [row.cells?.[0]?.textContent || row.querySelector('td').textContent, [...row.querySelectorAll('td')]]));
    assert.equal(rows['2026-10-24'][2].className, 'heart-gewinn__positiv');
    assert.equal(rows['2026-10-24'][5].className, 'heart-gewinn__positiv');
    assert.equal(rows['2026-10-25'][5].className, 'heart-gewinn__negativ');
    assert.equal(rows['2026-10-26'][5].className, '');
    assert.equal(rows['2026-10-27'][5].className, ''); assert.equal(rows['2026-10-27'][5].textContent, '—');
    assert.equal(rows['2026-10-28'][2].className, 'heart-gewinn__negativ');
    assert.equal(rows['2026-10-28'][5].className, 'heart-gewinn__negativ');
  } finally { env.restore(); }
});

test('profit card keeps the same blocks across loading, errors and legacy-data notes; daily expansion survives updates', async () => {
  const { klappSetzen } = await import('../apps/mnyra-heart/heart-lifeskin-klapp.js');
  const env = dom();
  try {
    const root = env.document.getElementById('root');
    const sessions = [{ id: 'legacy', source: { weg: '' }, berichtGeoeffnet: true }];
    let structure;
    klappSetzen('gewinn-tage:', true);
    for (const gewinnStatus of ['laedt', 'bereit', 'fehler', 'bereit']) {
      morphInhalt(root, renderGewinn(sessions, { gewinnStatus, gewinnFilter: { zeit: 'max' } }, ['']));
      const content = root.querySelector('.heart-gewinn__inhalt');
      const blocks = [...content.children].map((e) => e.tagName);
      structure ??= blocks; assert.deepEqual(blocks, structure);
      assert.equal(content.querySelectorAll(':scope > p').length, 0);
      assert.doesNotMatch(content.textContent, /Ads werden geladen|ältere Seen-Analysen|Bestellungen ohne Bestelldatum/);
      assert.equal(root.querySelector('[data-klapp="gewinn-tage:"]').hasAttribute('open'), true);
    }
  } finally { klappSetzen('gewinn-tage:', false); env.restore(); }
});


test('Stats running balance subtracts each expense once and leaves cancellations out of the net calculation', () => {
  const env = dom();
  const rechnung = { summe: { umsatz: 10000, transport: 1000, riba: 500, produkt: 2000, verpackung: 100, sonstiges: 0, ads: 3000, gewinn: 3400, fehlt: 0, anulimeWert: 5000 }, vorlaeufig: false };
  try {
    const root = env.document.getElementById('root'); root.innerHTML = renderGewinnVerlauf(rechnung, true);
    const rows = Object.fromEntries([...root.querySelectorAll('dl > div')].map((r) => [r.querySelector('dt').textContent, r.querySelector('dd').textContent]));
    assert.equal(rows.Umsatz, '100,00 €'); assert.equal(rows.Posta, '− 10,00 €'); assert.equal(rows['Nach Posta'], '90,00 €');
    assert.equal(rows['Nach Riba'], '85,00 €'); assert.equal(rows['Nach Produktkosten'], '65,00 €');
    assert.equal(rows['Nach Verpackung'], '64,00 €'); assert.equal(rows['Nach Sonstiges'], undefined); assert.equal(rows.Sonstiges, undefined);
    assert.equal(rows.Ads, '− 30,00 €'); assert.equal(rows.Reingewinn, '34,00 €');
    assert.equal(root.querySelector('.ist-reingewinn').classList.contains('ist-positiv'), true);
    root.innerHTML = renderGewinnVerlauf(rechnung, false);
    assert.equal(root.querySelector('.ist-reingewinn dd').textContent, '—');
    assert.doesNotMatch(root.querySelector('.ist-reingewinn').className, /ist-positiv|ist-negativ/);
    root.innerHTML = renderGewinnVerlauf({ ...rechnung, summe: { ...rechnung.summe, fehlt: 1 } }, true);
    assert.equal(root.querySelector('.ist-zwischenstand dd').textContent, '—');
    root.innerHTML = renderGewinnVerlauf({ ...rechnung, summe: { ...rechnung.summe, ads: 7000 } }, true);
    assert.equal(root.querySelector('.ist-reingewinn dd').textContent, '-6,00 €');
    assert.equal(root.querySelector('.ist-reingewinn').classList.contains('ist-negativ'), true);
  } finally { env.restore(); }
});
