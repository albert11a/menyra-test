import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

globalThis.__LIFESKIN_TEST__ = true;
const { Dyqan, shopFetch, shopBeiSicht } = await import('../apps/lifeskin-shop/shop.js');
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const field = value => typeof value === 'string' ? { stringValue: value }
  : typeof value === 'number' ? { doubleValue: value }
  : typeof value === 'boolean' ? { booleanValue: value }
  : Array.isArray(value) ? { arrayValue: { values: value.map(field) } }
  : { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, field(v)])) } };
const response = value => ({ ok: true, status: 200, json: async () => ({ fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, field(v)])) }) });
const offer = price => response({ lista: [{ id: 'acne', produkte: ['lf-acne', 'lf-moistur'], cmimi: price, aktiv: true, bild: true, titulli: 'Acne Duo' }] });

function fixture(holen) {
  const elements = new Map();
  const node = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      dataset: {}, hidden: true, disabled: true, value: '', textContent: '', children: [], scrollLeft: 0,
      setAttribute(name, value) { this[name] = value; }, removeAttribute(name) { delete this[name]; },
      toggleAttribute(name, value) { this[name] = value; }, addEventListener() {}, after() {}, remove() {}, closest() { return null; },
      querySelector() { return null; }, querySelectorAll() { return []; },
      insertAdjacentHTML(_, html) { this.innerHTML += html; },
      set innerHTML(html) { this.html = html; this.children = Array.from(html.matchAll(/<article/g), () => ({})); },
      get innerHTML() { return this.html || ''; }
    });
    return elements.get(selector);
  };
  const buttons = [node('hero-button'), node('footer-button')];
  buttons.forEach(button => { button.dataset.set = 'acne'; });
  // Startangebot seit 07.10.: 3 Produkte, 39 € (shop.js SHOP_START_SETET).
  const price = node('price'); price.dataset.preis = 'cmimi'; price.textContent = '39 €';
  const documentElement = { dataset: {}, setAttribute(name, value) { this[name] = value; } };
  const dok = {
    documentElement, defaultView: {},
    querySelector: selector => selector === '.hero-photo' ? null : node(selector),
    querySelectorAll: selector => selector === '[data-preis]' ? [price] : selector.includes('[data-set]') ? buttons : [],
    createElement: () => node('dots'), addEventListener() {}
  };
  const events = [], patches = [];
  const sitzung = { code: 'TEST-LOCAL', ergaenze: patch => patches.push(patch), liveMerken() {}, schritt: async (_, data) => { events.push(['saved', data.order.total]); return { ok: true }; } };
  const shop = new Dyqan({ dokument: dok, speicher: null, dauerSpeicher: { getItem: () => JSON.stringify({ cmimi: 39 }) }, holen,
    trichter: () => ({ sitzung, pixel: { meldeKorb: value => events.push(['AddToCart', value]), meldeKasse: value => events.push(['InitiateCheckout', value]) } }) });
  return { shop, dok, node, price, buttons, events, patches };
}

test('published Shop-Sets price is usable immediately despite slow Heart and stale local cache', async () => {
  const pending = deferred();
  const f = fixture(() => pending.promise);
  const loading = f.shop.angebotLaden();
  assert.equal(f.shop.setVon('acne').cmimi, 39);
  assert.equal(f.shop.angebotBereit, true);
  f.shop.setLegen('acne');
  assert.deepEqual(f.events, [['AddToCart', 39], ['InitiateCheckout', 39]]);
  assert.equal(f.node('#kasa-shuma').textContent, '39 €');
  pending.resolve(offer(19)); await loading;
  assert.equal(f.price.textContent, '19 €');
  assert.equal(f.dok.documentElement['data-shop-preis'], 'bereit');
  assert.ok(f.buttons.every(button => !button.disabled));
  assert.equal(f.node('#shop-preisstatus').hidden, true);
});

test('buy button preserves full cart and AddToCart, then opens the real checkout; saved total agrees', async () => {
  const f = fixture(async () => offer(19));
  await f.shop.angebotLaden();
  f.shop.setLegen('acne');
  assert.deepEqual(f.shop.korb.ids, ['lf-acne', 'lf-moistur']);
  assert.deepEqual(f.events, [['AddToCart', 19], ['InitiateCheckout', 19]]);
  assert.ok(f.patches.some(p => p.imKorb === true));
  assert.ok(f.patches.some(p => p.korbWert === 19));
  assert.equal(f.node('#sheet').open, undefined, 'no intermediate cart dialog');
  assert.equal(f.node('#kasa').hidden, false);
  assert.equal(f.node('#kasa-shuma').textContent, '19 €');
  for (const id of ['#kasa-emri', '#kasa-telefoni', '#kasa-adresa', '#kasa-qyteti']) f.node(id).value = 'local fixture';
  await f.shop.bestellen();
  assert.deepEqual(f.events.at(-1), ['saved', 19]);
  assert.equal(f.node('#kasa-faleminderit').hidden, false);
});

test('offline keeps published 39 EUR purchasable; later Shop-Sets update also refreshes open checkout', async () => {
  let failure = true;
  const f = fixture(async () => { if (failure) throw Error('offline'); return offer(27); });
  await f.shop.angebotLaden(); f.shop.setLegen('acne');
  assert.equal(f.shop.angebotBereit, true);
  assert.equal(f.node('#shop-preisstatus').hidden, true);
  assert.deepEqual(f.events, [['AddToCart', 39], ['InitiateCheckout', 39]]);
  failure = false; await f.shop.angebotLaden();
  assert.equal(f.price.textContent, '27 €');
  assert.equal(f.node('#kasa-shuma').textContent, '27 €');
  assert.equal(f.shop.korb.cmimi, 27);
});

test('malformed config retains published Shop-Sets price', async () => {
  const f = fixture(async () => response({ broken: true }));
  await f.shop.angebotLaden();
  assert.equal(f.shop.angebotBereit, true);
  assert.equal(f.shop.setVon('acne').cmimi, 39);
});

test('missing Heart config retains the published 39 EUR instead of the 49 EUR standard for 3 products', async () => {
  const f = fixture(async () => ({ status: 404, ok: false }));
  await f.shop.angebotLaden();
  assert.equal(f.price.textContent, '39 €');
  f.shop.setLegen('acne');
  assert.equal(f.node('#kasa-shuma').textContent, '39 €');
});

test('slow case index and large media cannot block the authoritative price', async () => {
  let onVisible;
  const oldObserver = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = class { constructor(fn) { onVisible = fn; } observe() {} disconnect() {} };
  const index = deferred(), requests = [];
  try {
    const f = fixture(async url => { requests.push(url); if (url.endsWith('/shopSetet')) return offer(19); if (url.endsWith('/raste')) return index.promise; throw Error('unexpected optional request'); });
    const loading = f.shop.laden(); await tick();
    assert.equal(f.shop.angebotBereit, true);
    assert.equal(f.price.textContent, '19 €');
    assert.equal(requests.length, 3, 'customer media starts independently; optional product images still wait');
    assert.equal(typeof onVisible, 'function');
    index.resolve({ status: 404, ok: false }); await loading;
    assert.equal(f.node('#proof-bahn').children.length, 3);
  } finally { globalThis.IntersectionObserver = oldObserver; }
});

test('photo and video rail loads even when empty rail never intersects', async () => {
  const oldObserver = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = class { constructor() {} observe() {} disconnect() {} };
  const pendingMedia = deferred(), requests = [];
  try {
    const f = fixture(async url => {
      requests.push(url);
      if (url.endsWith('/shopSetet')) return offer(19);
      if (url.endsWith('/raste')) return { ok: false, status: 404 };
      if (url.includes('/medien?')) return pendingMedia.promise;
      throw Error('unexpected product request');
    });
    await f.shop.laden();
    assert.ok(requests.some(url => url.includes('/medien?')), 'media request starts without observer callback');
    assert.equal(f.price.textContent, '19 €', 'pending media never blocks price');
    const documents = [
      { id: 'photo', art: 'foto', bild: 'https://example.com/photo.jpg', aktiv: true },
      { id: 'video', art: 'video', bild: 'https://example.com/poster.jpg', video: 'https://example.com/video.mp4', aktiv: true }
    ].map(({ id, ...data }) => ({ name: `medien/${id}`, fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, field(v)])) }));
    pendingMedia.resolve({ ok: true, status: 200, json: async () => ({ documents }) });
    await tick(); await tick();
    assert.match(f.node('#customer-media').innerHTML, /photo.jpg/);
    assert.match(f.node('#customer-media').innerHTML, /poster.jpg/);
    assert.match(f.node('#customer-media').innerHTML, /klient-kachel__spiel/);
    assert.equal(f.shop.klienten.find(m => m.id === 'video').video, 'https://example.com/video.mp4');
  } finally { globalThis.IntersectionObserver = oldObserver; }
});

test('first Heart case appears without waiting for the remaining gallery', async () => {
  const oldObserver = globalThis.IntersectionObserver;
  const observers = [];
  globalThis.IntersectionObserver = class { constructor(fn) { this.fn = fn; observers.push(this); } observe(element) { this.element = element; } disconnect() {} };
  const second = deferred(), requests = [];
  try {
    const f = fixture(async url => {
      requests.push(url);
      if (url.endsWith('/shopSetet')) return offer(19);
      if (url.endsWith('/raste')) return response({ lista: ['one', 'two'].map(id => ({ id, shop: true, bild: true, produkte: ['lf-acne', 'lf-moistur'] })) });
      if (url.endsWith('/rasti-one')) return response({ para: 'data:image/jpeg;base64,ONE', pas: 'data:image/jpeg;base64,AFTER' });
      if (url.endsWith('/rasti-two')) return second.promise;
      throw Error('unexpected optional request');
    });
    await f.shop.laden();
    const rail = f.node('#proof-bahn');
    assert.equal(rail.children.length, 1);
    assert.equal(requests.some(url => url.endsWith('/rasti-two')), false);
    rail.scrollLeft = 42;
    observers.find(o => o.element === rail).fn([{ isIntersecting: true }]); await tick();
    assert.equal(rail.children.length, 1, 'first case stays visible during slow second image');
    second.resolve(response({ para: 'data:image/jpeg;base64,TWO', pas: 'data:image/jpeg;base64,AFTER' })); await tick(); await tick();
    assert.equal(rail.children.length, 2);
    assert.equal(rail.scrollLeft, 42, 'appending does not jump back to the first card');
  } finally { globalThis.IntersectionObserver = oldObserver; }
});

test('optional data starts once near its section, including observer fallback', async () => {
  let notify, disconnected = 0, loads = 0;
  class Observer { constructor(fn) { notify = fn; } observe() {} disconnect() { disconnected++; } }
  shopBeiSicht({}, () => { loads++; }, Observer);
  await tick(); assert.equal(loads, 0);
  notify([{ isIntersecting: false }]); await tick(); assert.equal(loads, 0);
  notify([{ isIntersecting: true }]); notify([{ isIntersecting: true }]); await tick();
  assert.equal(loads, 1); assert.equal(disconnected, 1);
  shopBeiSicht({}, () => { loads++; }, null); await tick(); assert.equal(loads, 2);
});

test('hanging reads time out even on older browsers without AbortController', async () => {
  const saved = globalThis.AbortController;
  globalThis.AbortController = undefined;
  try { await assert.rejects(shopFetch(() => new Promise(() => {}), 5)('local-fixture'), /timeout/); }
  finally { globalThis.AbortController = saved; }
});

test('initial HTML displays the published 39 EUR (3 products) without waiting and mobile CSS puts purchase before product photos', () => {
  const html = readFileSync(new URL('../apps/lifeskin-shop/index.html', import.meta.url), 'utf8');
  const prices = [...html.matchAll(/data-preis="cmimi">([^<]+)/g)].map(m => m[1]);
  assert.ok(prices.length > 4);
  assert.ok(prices.every(price => price === "39 €"));
  // Startfassung im HTML = Startangebot im Code: nichts springt beim ersten Laden um.
  assert.match(html, /<html [^>]*data-set-produkte="3">/);
  assert.match(html, /data-preis="vecmas">87 €/);
  assert.doesNotMatch(html, /data-set="acne" disabled|visibility:hidden|Po ngarkohet cmimi/);
  assert.doesNotMatch(html, /lifeskinshop:cmimi/);
  const css = readFileSync(new URL('../apps/lifeskin-shop/shop-youth.css', import.meta.url), 'utf8');
  assert.match(css, /\.page \.buy\{order:1\}/);
  assert.match(css, /\.page \.visual\{order:4;/);
});
