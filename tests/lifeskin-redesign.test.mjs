import test from 'node:test';
import assert from 'node:assert/strict';
import { customerSelection, customerCards, caseCards } from '../apps/lifeskin-landing/redesign.js';

test('saved media keeps active items, puts videos first, and respects empty selections', () => {
  const input = [
    {id:'photo', art:'foto', bild:'/apps/photo.jpg', aktiv:true, reihe:0},
    {id:'off', art:'video', video:'https://example.com/off.mp4', aktiv:false},
    {id:'video', art:'video', bild:'/apps/poster.jpg', video:'https://example.com/on.mp4', aktiv:true, reihe:3},
    {id:'bad', art:'foto', bild:'javascript:alert(1)', aktiv:true}
  ];
  assert.deepEqual(customerSelection(input).map(m => m.id), ['video','photo']);
  assert.deepEqual(customerSelection([]), []);
  assert.equal(customerSelection(null).length, 4);
});
test('media previews do not download video sources and escape captions and URLs', () => {
  const markup = customerCards([{art:'video', video:'https://example.com/movie.mp4', bild:'/apps/poster.jpg" onerror="bad', ausschnitt:{x:40,y:60,zoom:1.2}}]);
  assert.doesNotMatch(markup, /<video|movie\.mp4|src="[^"]*" onerror=/);
  assert.match(markup, /&quot;/);
  assert.match(markup, /object-position:40% 60%/);
});
test('case renderer preserves complete ordered pairs and optimizes only repository images', () => {
  const markup = caseCards([{para:'/apps/lifeskin-landing/fotot/rasti-1-dita1.jpg',pas:'data:image/jpeg;base64,fixture'}]);
  assert.match(markup, /rasti-1-dita1\.webp/);
  assert.match(markup, /src="data:image\/jpeg;base64,fixture"/);
  assert.ok(markup.indexOf('PARA') < markup.indexOf('PAS'));
  assert.equal((markup.match(/data-view="cases"/g) || []).length, 1);
});
