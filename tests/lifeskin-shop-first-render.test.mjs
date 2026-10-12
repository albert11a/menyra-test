import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { shopOffer, renderShop, SHOP_START_SETET, SHOP_HERO_FALLBACK } from '../shared/lifeskin-shop-first-render.js';
import { loadShopSnapshot } from '../api/lifeskin-shop.js';
import shopHero from '../api/lifeskin-shop-hero.js';
import sharp from 'sharp';

const html = readFileSync(new URL('../apps/lifeskin-shop/index.html', import.meta.url), 'utf8');
const now = Date.parse('2026-10-12T08:00:00Z');
const action = { aktiv: true, cmimi: 18, bis: '2026-10-12T21:59:00Z', sete: 7 };
const hero = { url: '/api/lifeskin-shop-hero?v=test', anzahl: 4 };
const offer = shopOffer(SHOP_START_SETET, action, now);
const seedOf = page => { const window = {}; runInNewContext(page.match(/<script>(window.__lsShopSeed[\s\S]*?)<\/script>/)[1], { window }); return window.__lsShopSeed; };

test('first HTML already contains the final promotion, every price and the right image', () => {
  const page = renderShop(html, { offer, hero }, now);
  const prices = [...page.matchAll(/data-preis="cmimi"[^>]*>([^<]*)/g)].map(m => m[1]);
  assert.ok(prices.length > 4);
  assert.ok(prices.every(p => p === '18 €'));
  assert.match(page, /id="aktion">/);
  assert.match(page, /id="aktion-cmimi">18 €/);
  assert.match(page, /id="aktion-mbetur"[^>]*>13:59:00/);
  assert.match(page, /<div class="hero-photo hero-set"><img src="\/api\/lifeskin-shop-hero\?v=test"/);
  assert.match(page, /rel="preload" as="image"[^>]+fetchpriority="high"/);
  assert.ok(page.indexOf('rel="preload" as="image"') < page.indexOf('<script'), 'hero is discovered before any blocking script');
  assert.doesNotMatch(page, /disabled data-shop-await/);
  const seed = seedOf(page);
  assert.equal(seed.offer.price, 18);
  assert.equal(seed.offer.aktion.cmimi, 18);
  assert.equal(seed.hero.url, hero.url);
});

test('expired or disabled promotion renders only the current normal price', () => {
  for (const a of [{ ...action, aktiv: false }, { ...action, bis: '2026-10-11T00:00:00Z' }]) {
    const normal = shopOffer(SHOP_START_SETET, a, now);
    const page = renderShop(html, { offer: normal, hero }, now);
    assert.match(page, /id="aktion" hidden/);
    assert.match(page, /data-preis="cmimi">25 €/);
    assert.equal(seedOf(page).offer.promotion, false);
  }
});

test('missing/failed config never makes a stale price purchasable', () => {
  const pending = renderShop(html, { hero });
  assert.match(pending, /data-shop-preis="pending"/);
  assert.match(pending, /data-set="acne" disabled data-shop-await/);
  assert.equal(seedOf(pending).offer, null);
  const unavailable = renderShop(html, { hero, offer: shopOffer({ lista: [] }, action, now) });
  assert.match(unavailable, /data-shop-preis="fehlt"/);
  assert.match(unavailable, /data-set="acne" disabled data-shop-await/);
  assert.throws(() => shopOffer({ bad: true }, action));
  assert.throws(() => shopOffer(SHOP_START_SETET, { bad: true }));
});

test('snapshot script escapes data that could close a script tag', () => {
  const unsafe = { ...offer, setDok: { lista: [{ title: '</script><script>alert(1)</script>\u2028' }] } };
  const page = renderShop(html, { hero, offer: unsafe }, now);
  assert.doesNotMatch(page, /<script>alert/);
  assert.equal(seedOf(page).offer.setDok.lista[0].title, unsafe.setDok.lista[0].title);
});

test('public config reads start together and never fetch customer data or base64 hero in HTML', async () => {
  const calls = [], pending = [];
  const load = loadShopSnapshot(url => { calls.push(url); return new Promise(resolve => pending.push(resolve)); }, now);
  assert.equal(calls.length, 3);
  assert.ok(calls.every(url => url.includes('/config/shop')));
  assert.match(calls[2], /mask.fieldPaths=updatedAt/);
  assert.ok(calls.every(url => !url.includes('sessions')));
  pending.forEach(resolve => resolve({ status: 404 }));
  const result = await load;
  assert.equal(result.offer.price, 25, 'confirmed absence uses the published default');
  assert.equal(result.hero.url, SHOP_HERO_FALLBACK);
});

test('one failed offer read does not masquerade as a missing config or block hero', async () => {
  const result = await loadShopSnapshot(async url => url.includes('shopAktion') ? { ok: false, status: 503 } : { status: 404 }, now);
  assert.equal(result.offer, null);
  assert.equal(result.hero.url, SHOP_HERO_FALLBACK);
});

test('hero delivers image bytes and caches success; failure redirects without caching', async () => {
  const original = globalThis.fetch;
  const response = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; } });
  try {
    const source = await sharp({ create: { width: 1400, height: 1000, channels: 3, background: '#4f7662' } }).jpeg().toBuffer();
    globalThis.fetch = async url => {
      assert.match(url, /mask.fieldPaths=foto&mask.fieldPaths=updatedAt/);
      return { ok: true, status: 200, json: async () => ({ fields: {
        foto: { stringValue: `data:image/jpeg;base64,${source.toString('base64')}` },
        updatedAt: { stringValue: 'revision-2' }
      } }) };
    };
    const ok = response(); await shopHero({ method: 'GET', url: '/api/lifeskin-shop-hero?v=revision-2' }, ok);
    assert.equal(ok.headers['Content-Type'], 'image/webp');
    const metadata = await sharp(ok.body).metadata();
    assert.equal(metadata.width, 1050);
    assert.equal(metadata.height, 750);
    assert.ok(ok.body.length < source.length);
    assert.match(ok.headers['Cache-Control'], /max-age=31536000.*immutable/);
    const old = response(); await shopHero({ method: 'GET', url: '/api/lifeskin-shop-hero?v=revision-1' }, old);
    assert.match(old.headers['Cache-Control'], /max-age=60/);
    assert.doesNotMatch(old.headers['Cache-Control'], /immutable/);
    globalThis.fetch = async () => { throw Error('offline'); };
    const failed = response(); await shopHero({ method: 'GET' }, failed);
    assert.equal(failed.statusCode, 302);
    assert.equal(failed.headers.Location, SHOP_HERO_FALLBACK);
    assert.equal(failed.headers['Cache-Control'], 'no-store');
  } finally { globalThis.fetch = original; }
});
