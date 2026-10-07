import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSitzungDetail } from '../apps/mnyra-heart/heart-lifeskin-render.js';
import { Terapia } from '../apps/lifeskin-verkauf/terapia.js';

const fall = { id: 'template-test', name: 'Test', createdAt: '2026-10-07T00:00:00Z' };
const render = (bericht) => renderSitzungDetail(fall, null, '', [], bericht);

test('Heart defaults to Analysis 1 and restores the saved template for every report state', () => {
  for (const status of ['wartet', 'vorschau', 'fertig', 'bestellt']) {
    for (const [wahl, erwartet] of [[undefined, 'analysis1'], ['analysis2', 'analysis2'], ['unknown', 'analysis1']]) {
      const html = render({ status, analyseTemplate: wahl });
      assert.match(html, /id="lifeskin-analyse-template"/);
      assert.match(html, new RegExp(`<option value="${erwartet}" selected>`));
    }
  }
});

test('Only an explicitly selected Analysis 2 activates the new personal design', () => {
  const page = new Terapia({ ort: { pathname: '/terapia/00000000000000000000000000000000', search: '' }, pixel: {} });
  for (const [wahl, erwartet] of [[undefined, false], ['analysis1', false], ['unknown', false], ['analysis2', true]]) {
    page.daten = { analyseTemplate: wahl, weg: 'lifeskin', preis: 39 };
    assert.equal(page.analyse2, erwartet);
    assert.equal(page.kaufWort().startsWith('Porosit terapine time'), erwartet);
  }
  page.daten = { analyseTemplate: 'analysis2', weg: 'lifeskinshop' };
  assert.equal(page.analyse2, false);
});
