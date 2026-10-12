import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTINE_PRODUCTS, personalRoutine, personalCartRestore, personalOrderPrices } from '../shared/lifeskin-personal-routine.js';
import { SHOP_START_SETET, shopOffer } from '../shared/lifeskin-shop-first-render.js';
import { RoutineBuilder, productRail, routineInstructions } from '../apps/lifeskin-shop/routine-builder.js';
globalThis.__LIFESKIN_TEST__ = true;
const { Dyqan, bestellZeilen, summe } = await import('../apps/lifeskin-shop/shop.js');

function fixture(storage = new Map()) {
  const nodes = new Map(), events = [], orders = [];
  const node = selector => {
    if (!nodes.has(selector)) nodes.set(selector, { dataset: {}, hidden: true, disabled: false, value: '', textContent: '', innerHTML: '', children: [],
      classList: { add() {}, remove() {} }, setAttribute() {}, removeAttribute() {}, toggleAttribute() {},
      querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, remove() {}, closest() { return null; },
      focus() {}, after() {}, appendChild() {}, getAttribute() { return ''; }
    });
    return nodes.get(selector);
  };
  const price = node('price'); price.dataset.preis = 'cmimi';
  const button = node('buy'); button.dataset.set = 'acne';
  const doc = { documentElement: { dataset: {}, setAttribute() {} }, defaultView: {}, querySelector: node,
    querySelectorAll: selector => selector === '[data-preis]' ? [price] : selector.includes('[data-set]') ? [button] : [], createElement: () => node('new'), addEventListener() {} };
  const speicher = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const sitzung = { code: 'LOCAL-ONLY', ergaenze() {}, liveMerken() {}, schritt: async (_, value) => { orders.push(value.order); return { ok: true }; } };
  const shop = new Dyqan({ seed: { offer: shopOffer(SHOP_START_SETET, { aktiv: false }) }, dokument: doc, speicher, dauerSpeicher: null, holen: async () => ({ ok: false, status: 404 }),
    trichter: () => ({ sitzung, pixel: { meldeKorb: price => events.push(['cart', price]), meldeKasse: price => events.push(['checkout', price]) } }) });
  return { shop, node, storage, price, button, events, orders };
}
const all = ROUTINE_PRODUCTS.map(p => p.id);

test('all 15 combinations are canonical, independent and use 15/25/35/45 EUR', () => {
  for (let mask = 1; mask < 16; mask++) {
    const ids = all.filter((_, i) => mask & (1 << i));
    const set = personalRoutine([...ids].reverse().concat(ids));
    assert.deepEqual(set.produkte, ids);
    assert.equal(set.cmimi, ids.length * 10 + 5);
    assert.equal(set.id.length, 13);
    assert.deepEqual(personalCartRestore({ ids, set: set.id, cmimi: 1 }), { ids, set: set.id, cmimi: set.cmimi });
  }
  assert.equal(personalRoutine([]), null);
  assert.equal(personalRoutine(['lf-acne', 'unknown']), null);
  assert.equal(personalCartRestore({ ids: ['lf-acne'], set: 'personal-0100', cmimi: 1 }), null);
});

test('apply changes page and all order targets; only buying calls existing cart and checkout events', () => {
  const f = fixture();
  assert.equal(f.shop.routineUebernehmen(all), true);
  assert.equal(f.price.textContent, '45 €');
  assert.equal(f.button.dataset.set, 'personal-1111');
  assert.match(f.node('.product-line').innerHTML, /Seti yt personal/);
  assert.match(f.node('.personal-hero').innerHTML, /LF CLEAN/);
  assert.match(f.node('#per-ty .who-grid').innerHTML, /Pore, gropeza/);
  assert.equal(f.events.length, 0);
  f.shop.setLegen(f.button.dataset.set);
  assert.deepEqual(f.events, [['cart', 45]]);
  assert.deepEqual(f.shop.korb.ids, all);
  assert.equal(f.node('#kasa-shuma').textContent, '45 €');
  assert.match(f.node('#kasa-lista').innerHTML, /LF CLEAN/);
  assert.match(f.node('#kasa-wa').href, /LF%20CLEAN/);
});

test('single LF Clean has 150ml, 15 EUR and no Acne Duo treatment instructions', async () => {
  const f = fixture(); f.shop.routineUebernehmen(['lf-clean']); f.shop.setLegen('personal-0001');
  assert.equal(f.node('#kasa-shuma').textContent, '15 €');
  assert.match(f.node('#kasa-lista').innerHTML, /150 ml/);
  assert.doesNotMatch(f.node('#kasa-lista').innerHTML, /Acne Duo|secili/);
  assert.doesNotMatch(f.node('#perdorimi .wrap').innerHTML, /LF ACNE|LF MOISTURE/);
  assert.doesNotMatch(f.node('.faq details:nth-of-type(2) p').innerHTML, /2 jave/);
  for (const id of ['#kasa-emri', '#kasa-telefoni', '#kasa-adresa', '#kasa-qyteti']) f.node(id).value = 'Local test';
  await f.shop.bestellen();
  assert.equal(f.orders[0].total, 15);
  assert.equal(f.orders[0].set.id, 'personal-0001');
  assert.deepEqual(f.orders[0].items, [{ id: 'lf-clean', name: 'LF CLEAN', cmimi: 15, sasia: 1 }]);
});

test('order line prices sum exactly to personal total including three-product cents', () => {
  for (let count = 1; count <= 4; count++) {
    const set = personalRoutine(all.slice(0, count));
    const cart = { ids: set.produkte, set: set.id, cmimi: 1 };
    const lines = bestellZeilen(cart, []);
    assert.equal(Math.round(lines.reduce((total, item) => total + item.cmimi, 0) * 100), set.cmimi * 100);
    assert.equal(summe(cart), set.cmimi);
    assert.equal(personalOrderPrices(count).length, count);
  }
});

test('Heart refresh, session reload and reset retain coherent cart and default offer', async () => {
  const f = fixture(); f.shop.routineUebernehmen(['lf-pore', 'lf-clean']);
  const beforeBuyReload = fixture(f.storage);
  assert.equal(beforeBuyReload.shop.personalSet.id, 'personal-0011');
  f.shop.setLegen('personal-0011');
  await f.shop.angebotLaden();
  assert.equal(f.shop.personalSet.cmimi, 25);
  assert.equal(f.price.textContent, '25 €');
  assert.equal(f.shop.korb.set, 'personal-0011');
  const reloaded = fixture(f.storage);
  assert.equal(reloaded.shop.korb.cmimi, 25);
  assert.equal(reloaded.shop.personalSet.id, 'personal-0011');
  reloaded.shop.routineZurueck();
  assert.equal(reloaded.shop.personalSet, null);
  assert.equal(reloaded.shop.korb.ids.length, 0);
  reloaded.shop.setLegen('acne');
  assert.equal(reloaded.shop.korb.set, 'acne');
  assert.equal(reloaded.shop.korb.cmimi, 25);
});

test('unavailable product rejects apply and cannot emit tracking or open checkout', () => {
  const f = fixture(); f.shop.mittel = f.shop.mittel.filter(p => p.id !== 'lf-clean');
  assert.equal(f.shop.routineUebernehmen(['lf-clean']), false);
  assert.equal(f.shop.personalSet, null); assert.equal(f.events.length, 0);
});

test('rail uses full chosen images and instructions order cleanser before actives, moisture last', () => {
  const rail = productRail(['lf-pore', 'lf-clean'], [{ id: 'lf-pore', fotot: ['data:image/jpeg;base64,HEART'], inhalt: '30 ml' }]);
  assert.match(rail, /data:image\/jpeg;base64,HEART/);
  assert.match(rail, /lf-clean-illustration/);
  assert.equal((rail.match(/class="personal-product"/g) || []).length, 2);
  const use = routineInstructions(all);
  assert.ok(use.indexOf('LF CLEAN') < use.indexOf('LF ACNE'));
  assert.ok(use.indexOf('LF PORE') < use.indexOf('LF MOISTURE'));
  assert.match(use, /mbremje te ndryshme/);
});

function builderFixture(applyResult = true) {
  const nodes = new Map(), listeners = {}, applied = [], ordered = [], tracked = [];
  const node = selector => { if (!nodes.has(selector)) nodes.set(selector, { textContent: '', innerHTML: '', hidden: true, disabled: false, dataset: {}, setAttribute() {}, focus() {} }); return nodes.get(selector); };
  const screens = ['intro', 'choose', 'result'].map(stage => Object.assign(node(stage), { dataset: { routineScreen: stage } }));
  const root = { innerHTML: '', selected: [], ownerDocument: { querySelector: () => null },
    querySelector: node, querySelectorAll: selector => selector === 'input:checked' ? root.selected.map(value => ({ value })) : screens,
    addEventListener: (name, handler) => { listeners[name] = handler; } };
  const builder = new RoutineBuilder({ root, catalog: () => [], apply: ids => { applied.push(ids); return applyResult; }, order: id => ordered.push(id), reset() {}, track: (kind,ids) => tracked.push({ kind, ids }) });
  builder.start();
  const click = action => listeners.click({ target: { closest: () => ({ disabled: false, dataset: { routineAction: action } }) } });
  const select = ids => { root.selected = ids; listeners.change({ target: { matches: () => true } }); };
  return { builder, root, node, screens, click, select, applied, ordered, tracked };
}

test('same-card steps, no initial price, valid selection enables continue; apply and order are distinct', () => {
  const f = builderFixture();
  const intro = f.root.innerHTML.split('data-routine-screen="choose"')[0];
  assert.doesNotMatch(intro, /€|data-routine-price/);
  f.click('choose'); f.click('result'); assert.equal(f.builder.stage, 'choose');
  f.select(['lf-acne']); assert.equal(f.node('[data-routine-action="result"]').disabled, false);
  assert.equal(f.node('.personal-recommend').hidden, false);
  assert.equal(f.node('[data-routine-price]').textContent, '15 €');
  f.click('result'); assert.equal(f.builder.stage, 'result');
  assert.equal(f.screens.filter(screen => !screen.hidden).length, 1);
  f.click('apply'); assert.equal(f.applied.length, 1); assert.equal(f.ordered.length, 0);
  f.click('choose'); assert.deepEqual(f.builder.ids, ['lf-acne']);
  f.select(all); f.click('result'); f.click('order');
  assert.deepEqual(f.ordered, ['personal-1111']);
  f.select([]); assert.equal(f.node('[data-routine-action="result"]').disabled, true);
  assert.equal(f.node('.personal-recommend').hidden, true);
});

 test('Acne + Moistur keeps the duo page and orders the existing duo in either order', () => {
  for (const ids of [['lf-acne', 'lf-moistur'], ['lf-moistur', 'lf-acne']]) {
    const f = fixture();
    f.node('.product-line').innerHTML = 'THE ACNE DUO';
    assert.equal(f.shop.routineUebernehmen(ids), 'acne');
    assert.equal(f.shop.personalSet, null);
    assert.equal(f.node('.product-line').innerHTML, 'THE ACNE DUO');
    assert.equal(f.storage.has('lifeskinshop.routine'), false);
    assert.equal(f.button.dataset.set, 'acne');
    assert.equal(f.events.length, 0);
    f.shop.setLegen('personal-1100');
    assert.equal(f.shop.korb.set, 'acne');
    assert.deepEqual(f.shop.korb.ids, ['lf-acne', 'lf-moistur']);
  }
});
 test('switching a personal set back to duo restores original page and reload stays duo', () => {
  const f = fixture(); f.node('.product-line').innerHTML = 'THE ACNE DUO';
  f.shop.routineUebernehmen(['lf-clean']);
  f.shop.routineUebernehmen(['lf-acne', 'lf-moistur']);
  assert.equal(f.node('.product-line').innerHTML, 'THE ACNE DUO');
  f.storage.set('lifeskinshop.routine', JSON.stringify(['lf-acne', 'lf-moistur']));
  f.storage.set('lifeskinshop.shporta', JSON.stringify({ ids: ['lf-acne', 'lf-moistur'], set: 'personal-1100', cmimi: 25 }));
  const reloaded = fixture(f.storage);
  assert.equal(reloaded.shop.personalSet, null);
  assert.equal(reloaded.shop.korb.set, 'acne');
});

test('builder orders the canonical duo returned by apply and hides the reset button', () => {
  const f = builderFixture('acne');
  f.select(['lf-acne', 'lf-moistur']); f.click('result'); f.click('order');
  assert.deepEqual(f.ordered, ['acne']);
  assert.equal(f.node('[data-routine-action="reset"]').hidden, true);
});
test('Clean photo loads directly from its existing catalog document before product section visibility', async () => {
  const f = fixture(); let called = ''; let refreshed = false;
  f.shop.holen = async url => { called = url; return { ok: true, json: async () => ({ fields: { fotot: { arrayValue: { values: [{ stringValue: 'data:image/jpeg;base64,PHOTO' }] } } } }) }; };
  f.shop.routineBuilder = { refreshPhotos() { refreshed = true; } };
  assert.equal(await f.shop.routineFotoLaden(), true);
  assert.match(called, /landingFotot-lf-clean/);
  assert.deepEqual(f.shop.mittelVon('lf-clean').fotot, ['data:image/jpeg;base64,PHOTO']);
  assert.equal(refreshed, true);
  assert.match(productRail(['lf-clean'], f.shop.mittel), /data:image\/jpeg;base64,PHOTO/);
});
test('Clean photo failure leaves fallback and ordering available', async () => {
  const f = fixture();
  assert.equal(await f.shop.routineFotoLaden(), false);
  assert.equal(f.shop.routineUebernehmen(['lf-clean']), true);
  assert.match(productRail(['lf-clean'], f.shop.mittel), /lf-clean-illustration/);
});

test('routine start and completion are distinct; unchanged revisit does not duplicate finishes', () => {
 const f = builderFixture();
 f.click('choose'); f.select(['lf-clean']); f.click('result');
 f.click('choose'); f.click('result');
 f.click('apply'); f.click('order');
 assert.deepEqual(f.tracked.map(e=>e.kind), ['start','finish','details','order']);
 f.click('choose'); f.select(['lf-clean','lf-pore']); f.click('result');
 assert.equal(f.tracked.filter(e=>e.kind==='finish').length,2);
 f.click('intro'); f.click('choose'); f.click('result');
 assert.equal(f.tracked.filter(e=>e.kind==='start').length,2);
 assert.equal(f.tracked.filter(e=>e.kind==='finish').length,3);
});
