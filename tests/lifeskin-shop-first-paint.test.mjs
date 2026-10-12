import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inlineShopFirstPaint } from '../scripts/lifeskin-shop-first-paint.mjs';

test('production shop keeps every stylesheet in cascade order without blocking requests', async () => {
  const html = await readFile(new URL('../apps/lifeskin-shop/index.html', import.meta.url), 'utf8');
  const paths = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  const out = await inlineShopFirstPaint(html, p => readFile(new URL(`..${p}`, import.meta.url), 'utf8'));
  assert.equal(paths.length, 10);
  assert.deepEqual([...out.matchAll(/<style data-shop-style="([^"]+)"/g)].map(m => m[1]), paths);
  assert.doesNotMatch(out, /<link rel="stylesheet"/);
  assert.doesNotMatch(out, /src="\/shared\/lifeskin-still.js"/);
  assert.ok(out.indexOf('window.__mnyraStill') >= 0);
  assert.ok(out.indexOf('window.__mnyraStill') < out.indexOf('window.__lsShopSeed'));
  for (const path of paths) {
    const css = await readFile(new URL(`..${path}`, import.meta.url), 'utf8');
    assert.ok(out.includes(css), `complete styles retained: ${path}`);
  }
});

test('build refuses relative assets rather than silently breaking inline styles', async () => {
  const html = '<link rel="stylesheet" href="/apps/lifeskin-shop/shop.css">';
  for (const css of ['.x{background:url(./photo.jpg)}', '@import "other.css";']) {
    await assert.rejects(inlineShopFirstPaint(html, async () => css), /URL rewriting/);
  }
});
