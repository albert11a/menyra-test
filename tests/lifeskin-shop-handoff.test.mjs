import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCheckout } from '../apps/lifeskin-shop/checkout-handoff.js';
function storage() { const values = new Map(); return { setItem: (k,v) => values.set(k,v), getItem: k => values.get(k) }; }
test('selected products replace old cart using existing checkout contract', () => {
  const s = storage(); s.setItem('lifeskin.shporta', '[{"id":"lf-pore","sasia":9}]');
  assert.deepEqual(prepareCheckout(s, ['lf-acne','lf-moistur','lf-acne','invalid']), { ok:true, href:'/lifeskin2#produktet' });
  assert.deepEqual(JSON.parse(s.getItem('lifeskin.shporta')), [{id:'lf-acne',sasia:1},{id:'lf-moistur',sasia:1}]);
});
test('test mode survives the handoff and arbitrary URL parameters do not', () => {
  for (const query of ['?still=1&next=https://example.com','?test=1']) assert.equal(prepareCheckout(storage(), ['lf-acne'], query).href, '/lifeskin2?still=1#produktet');
});
test('empty selection, blocked storage and silent storage failures do not navigate', () => {
  assert.equal(prepareCheckout(storage(), []).ok, false);
  assert.equal(prepareCheckout({setItem(){throw new Error('blocked')}}, ['lf-acne']).ok, false);
  assert.equal(prepareCheckout({setItem(){},getItem(){return null}}, ['lf-acne']).ok, false);
});
