import test from 'node:test';
import assert from 'node:assert/strict';
import { baueGewinn, bestellKosten, adsCent, datumGueltig, gewinnGrenzen, renderGewinn } from '../apps/mnyra-heart/heart-lifeskin-gewinn.js';
const jetzt = '2026-10-26T12:00:00Z';
const kosten = { shishePreis: 10, shisheStueck: 10, stikerPreis: 5, stikerStueck: 10, mbushja: 30,
  kreme: [{ id: 'a', name: 'Acne', produkt: 'lf-acne', preis: 10, menge: 100, einheit: 'ml' }], verpackung: 1, sonstiges: 0.5, versand: 100 };
const fall = (id = 'a', tag = '2026-10-26') => ({ id, source: { weg: 'lifeskinshop' }, berichtGeoeffnet: true,
  timings: { ereignisse: { [tag]: { berichtGeoeffnet: `${tag}T10:00:00Z` } } },
  order: { orderId: id, createdAt: `${tag}T11:00:00Z`, total: 40, items: [{ id: 'lf-acne', sasia: 2 }] } });
const state = (extra = {}) => ({ gewinnStatus: 'bereit', gewinnFilter: { zeit: 'heute' }, produktkosten: kosten,
  gewinnAds: [{ weg: 'lifeskinshop', tag: '2026-10-26', cent: 1000 }], dergesat: { a: { postaBeki: '123', statusi: 'pranuar' } }, ...extra });
const calc = (ss, st = state()) => baueGewinn(ss, st, ['lifeskinshop'], jetzt);

test('cent ledger: correct quantity, transport, Riba, extras, ads, ratios; no double generic shipping', () => {
  const r = calc([fall()]);
  assert.deepEqual(r.summe, { seen: 1, bestellungen: 1, umsatz: 4000, ads: 1000, produkt: 900, transport: 250, riba: 200, extra: 150, verpackung: 100, sonstiges: 50, fehlt: 0, zugestellt: 1, gewinn: 1500 });
  assert.equal(r.jeSeen, 1000); assert.equal(r.jeBestellung, 1000); assert.equal(r.analysenJeBestellung, 1);
});
test('Albania follows existing Beki prefix tariff', () => {
  const st = state({ dergesat: { a: { postaBeki: 'A123' } } });
  assert.equal(calc([fall()], st).summe.gewinn, 1250);
});
test('first Seen day counts once, returning visitors not recounted on another day', () => {
  const s = fall(); s.timings.ereignisse['2026-10-25'] = { berichtGeoeffnet: true };
  assert.equal(calc([s]).summe.seen, 0);
  assert.equal(calc([s], state({ gewinnFilter: { zeit: 'max' } })).summe.seen, 1);
});
test('legacy Seen is not assigned to scan or update day, available in max only', () => {
  const s = { id: 'old', source: { weg: 'lifeskinshop' }, berichtGeoeffnet: true, updatedAt: jetzt };
  assert.equal(calc([s]).summe.seen, 0);
  assert.equal(calc([s]).ohneSeenDatum, 1);
  assert.equal(calc([s], state({ gewinnFilter: { zeit: 'max' } })).summe.seen, 1);
});
test('completed analyses and manual orders do not imply Seen', () => {
  const s = fall(); s.berichtGeoeffnet = false; s.timings = {}; s.order.manuell = true;
  const r = calc([s, { id: 'ready', source: s.source, step: 'submitted' }]);
  assert.equal(r.summe.seen, 0); assert.equal(r.summe.bestellungen, 1); assert.equal(r.jeSeen, null);
});
test('deduplicates sessions and order IDs, excludes still/tests/cancelled orders', () => {
  const s = fall(); const copy = { ...s, id: 'copy' };
  assert.equal(calc([s, s, copy]).summe.bestellungen, 1);
  assert.equal(calc([{ ...s, order: { ...s.order, still: true } }]).summe.bestellungen, 0);
  assert.equal(calc([s], state({ berichte: { a: { test: true } } })).summe.seen, 0);
  assert.equal(calc([s], state({ dergesat: { a: { statusi: 'anuluar' } } })).summe.bestellungen, 0);
  assert.equal(calc([{ ...s, order: { ...s.order, status: 'storniert' } }]).summe.bestellungen, 0);
});
test('missing country, missing costs or unknown product suppresses profit', () => {
  for (const st of [state({ dergesat: {} }), state({ produktkosten: null }), state({ produktkosten: { ...kosten, kreme: [] } })]) {
    assert.equal(calc([fall()], st).summe.gewinn, null);
    assert.equal(calc([fall()], st).summe.fehlt, 1);
  }
  assert.ok(bestellKosten({ ...fall(), order: { items: [{ id: 'unknown', sasia: 1 }] } }, state()).fehlt.length);
});
test('separate event and order dates, inclusive custom date boundaries', () => {
  const s = fall(); s.order.createdAt = '2026-10-25T23:30:00Z'; // 26th in Kosovo
  assert.equal(calc([s]).summe.bestellungen, 1);
  const st = state({ gewinnFilter: { zeit: 'vonbis', von: '2026-10-26', bis: '2026-10-26' } });
  assert.equal(calc([s], st).summe.bestellungen, 1);
  assert.ok(calc([s], state({ gewinnFilter: { zeit: 'vonbis', von: '2026-10-27', bis: '2026-10-26' } })).fehler);
  assert.deepEqual(gewinnGrenzen({ zeit: 'woche' }, jetzt), { von: '2026-10-20', bis: '2026-10-26' });
});
test('unknown order dates not fabricated; no divisions by zero; losses remain negative', () => {
  const s = fall(); delete s.order.createdAt;
  assert.equal(calc([s]).ohneBestellDatum, 1);
  assert.equal(calc([]).jeBestellung, null);
  const r = calc([], state()); assert.equal(r.summe.gewinn, -1000);
});
test('ads gaps and loading prevent seemingly final advertising averages; explicit zero valid', () => {
  const s = fall();
  assert.equal(calc([s], state({ gewinnAds: [] })).vorlaeufig, true);
  assert.equal(calc([s], state({ gewinnAds: [] })).jeBestellung, null);
  assert.equal(calc([s], state({ gewinnAds: [{ weg: 'lifeskinshop', tag: '2026-10-26', cent: 0 }] })).jeBestellung, 0);
  assert.equal(calc([s], state({ gewinnStatus: 'fehler' })).vorlaeufig, true);
});
test('scopes isolate daily budgets and totals', () => {
  const st = state({ gewinnAds: [{ weg: '', tag: '2026-10-26', cent: 700 }, { weg: 'lifeskinshop', tag: '2026-10-26', cent: 1000 }] });
  assert.equal(calc([fall()], st).summe.ads, 1000);
  assert.equal(baueGewinn([fall()], st, ['', 'lifeskinshop'], jetzt).summe.ads, 1700);
});
test('money validation, invalid dates, render card uses existing collapsible contract', () => {
  assert.equal(adsCent('25,50'), 2550); assert.equal(adsCent('0'), 0);
  for (const v of ['', '-1', 'NaN', '1.234', '1e5']) assert.equal(adsCent(v), null);
  assert.equal(datumGueltig('2026-02-31'), false);
  assert.equal(datumGueltig('garbage'), false);
  assert.equal(datumGueltig('2026-00-01'), false);
  assert.equal(datumGueltig('2026-13-01'), false);
  const html = renderGewinn([], state(), ['lifeskinshop']);
  assert.match(html, /data-klapp="gewinn:lifeskinshop"/);
  assert.match(html, /lifeskin-gewinn-plus/); assert.match(html, /data-gewinn-filter/);
  assert.doesNotMatch(html, /NaN|Infinity/);
});

test('plus carries exact scope and forms do not live in the three morph panels', () => {
  const st = state();
  for (const wege of [[''], ['lifeskinshop'], ['', 'lifeskinshop']]) {
    const html = renderGewinn([], st, wege);
    assert.match(html, /data-gewinn-wege=/);
    assert.match(html, /lifeskin-gewinn-waehlen/);
    assert.doesNotMatch(html, /data-gewinn-datum|type="date"|>Von bis</);
  }
});

test('event routing dispatches the actual plus/calendar target and prevents summary toggle', async () => {
  const { bindHeartEvents } = await import('../apps/mnyra-heart/heart-events.js');
  const events = {}, calls = [];
  const root = { addEventListener: (name, fn) => { events[name] = fn; }, removeEventListener() {} };
  const operations = { gewinnPlus: (t) => calls.push(['plus', t]), gewinnWaehlen: () => calls.push(['calendar']), gewinnFilter: (a, b) => calls.push([a, b]) };
  bindHeartEvents({ root, operations });
  const target = (action) => ({ hasAttribute: () => false, matches: () => false, getAttribute: () => action, closest(sel) { return sel === '[data-action]' || sel.includes('[data-nav-key]') ? this : null; } });
  const plus = target('lifeskin-gewinn-plus'); let prevented = false;
  await events.click({ target: plus, preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true); assert.deepEqual(calls[0], ['plus', plus]);
  const save = target('lifeskin-gewinn-waehlen');
  await events.click({ target: save, preventDefault() {} }); assert.deepEqual(calls[1], ['calendar']);
  await events.change({ target: { matches: (sel) => sel === '[data-gewinn-filter]', getAttribute: () => 'zeit', value: 'max' } });
  assert.deepEqual(calls[2], ['zeit', 'max']);
});


test('yesterday and day before yesterday use calendar days across month and DST boundaries', () => {
  assert.deepEqual(gewinnGrenzen({ zeit: 'gestern' }, '2026-11-01T12:00:00Z'), { von: '2026-10-31', bis: '2026-10-31' });
  assert.deepEqual(gewinnGrenzen({ zeit: 'vorgestern' }, '2026-10-26T12:00:00Z'), { von: '2026-10-24', bis: '2026-10-24' });
  assert.deepEqual(gewinnGrenzen({ zeit: 'gestern' }, '2026-10-25T23:30:00Z'), { von: '2026-10-25', bis: '2026-10-25' });
  assert.deepEqual(gewinnGrenzen({ zeit: 'vorgestern' }, '2027-01-01T12:00:00Z'), { von: '2026-12-30', bis: '2026-12-30' });
});
test('packaging and miscellaneous are separate configured per-order costs, not per-product charges', () => {
  const st = state({ produktkosten: { ...kosten, verpackung: 1.4, sonstiges: 1 } });
  const r = calc([fall()], st);
  assert.equal(r.summe.verpackung, 140); assert.equal(r.summe.sonstiges, 100); assert.equal(r.summe.extra, 240);
  assert.equal(r.summe.gewinn, 1410);
  const html = renderGewinn([fall()], st, ['lifeskinshop']);
  assert.doesNotMatch(html, /Verpackung\/Sonstiges/);
  assert.doesNotMatch(html, /Gewinn = Umsatz/);
});
test('loading is neutral, missing-ad notice appears only after loading and only for active days', () => {
  for (const gewinnStatus of [undefined, 'laedt', 'bereit', 'fehler']) {
    const html = renderGewinn([], state({ gewinnStatus }), ['lifeskinshop']);
    assert.doesNotMatch(html, /heart-lifeskin-warnung|Ads für .* noch offen|Vorläufig: Ads-Daten fehlen/);
  }
});
