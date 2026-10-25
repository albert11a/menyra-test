import test from 'node:test';
import assert from 'node:assert/strict';
import { zeigeTherapieZiele, hautPfad, zieltextLesen } from '../apps/lifeskin-verkauf/terapia-ziele.js';

test('results intro omits the requested sentence without changing the report', () => {
  const bericht = { synimi28: 'Synimi pas 4 javësh: lëkurë e hidratuar. Arritja e plotë e këtij synimi nuk mund të garantohet.' };
  assert.equal(zieltextLesen(bericht), 'Synimi pas 4 javësh: lëkurë e hidratuar.');
  assert.match(bericht.synimi28, /garantohet/);
});

function surface() {
  const node = () => ({ attrs: {}, style: {}, setAttribute(k, v) { this.attrs[k] = v; } });
  const buttons = [1, 2, 3, 4].map(n => ({ ...node(), dataset: { zielwoche: String(n) } }));
  const metrics = [0, 1].map(() => {
    const value = {}, bar = node(), fill = node();
    return { value, bar, fill, querySelector(s) { return ({ '[data-zielwert]': value, '[role=progressbar]': bar, i: fill })[s]; } };
  });
  const row = { scrollLeft: 0, scrollWidth: 600, classList: { toggle(k, v) { row.single = v; } }, scrollTo({ left }) { this.scrollLeft = left; } };
  const nodes = { '[data-zieltext]': {}, '.terapia-ziele__reihe': row, '[data-zielnavigation]': {}, '[data-hautoberflaeche]': node(), '[data-hautpunkte]': node(), '[data-zielstatus]': {}, '[data-zielweiter]': {} };
  return { nodes, buttons, metrics, row, querySelector(s) { return nodes[s]; }, querySelectorAll(s) { return s === '[data-zielwoche]' ? buttons : metrics; } };
}

test('week buttons update both goals, selection, accessible values and skin shape', () => {
  const root = surface();
  const options = { sichtbar: true, bericht: { synimi28: 'Kujdesi yt' }, vergleich: { vorher: 'https://example.com/a.jpg', nachher: 'https://example.com/b.jpg' } };
  zeigeTherapieZiele(root, options);
  assert.equal(root.hidden, false);
  assert.equal(root.metrics[0].value.textContent, '92%');
  assert.equal(root.metrics[1].value.textContent, '85%');
  const finalShape = root.nodes['[data-hautoberflaeche]'].attrs.d;
  root.buttons[0].onclick();
  assert.equal(root.buttons[0].attrs['aria-pressed'], 'true');
  assert.equal(root.buttons[3].attrs['aria-pressed'], 'false');
  assert.equal(root.metrics[0].bar.attrs['aria-valuenow'], '22');
  assert.equal(root.metrics[1].fill.style.width, '35%');
  assert.notEqual(root.nodes['[data-hautoberflaeche]'].attrs.d, finalShape);
  root.nodes['[data-zielweiter]'].onclick(); assert.equal(root.row.scrollLeft, 600);
  root.nodes['[data-zielweiter]'].onclick(); assert.equal(root.row.scrollLeft, 0);
  root.buttons[3].onclick(); assert.equal(root.metrics[0].value.textContent, '92%');
});

test('missing photos use one full-width follow-up card; missing therapy hides section', () => {
  const root = surface();
  zeigeTherapieZiele(root, { sichtbar: true });
  assert.equal(root.row.single, true);
  assert.equal(root.nodes['[data-zielnavigation]'].hidden, true);
  zeigeTherapieZiele(root, { sichtbar: false });
  assert.equal(root.hidden, true);
});

test('illustrations are stable for a report and differ with its content', () => {
  assert.equal(hautPfad(4, 'Akne'), hautPfad(4, 'Akne'));
  assert.notEqual(hautPfad(4, 'Akne'), hautPfad(4, 'Hidratim'));
});
