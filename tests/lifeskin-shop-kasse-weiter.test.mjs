// DIE TASTE "WEITER" IST KEIN BESTELLEN (07.10.).
//
// Enter in einem Feld der Kasse schickte das Formular ab: Der Browser
// drueckte selbst auf "Porositni tani", mit leeren Feldern stand der
// Hinweis unter der Tastatur, und fuer den Kunden passierte nichts. In
// Heart sah das aus wie ein Bestellversuch ohne Bestellung.
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.__LIFESKIN_TEST__ = true;
const { Dyqan } = await import('../apps/lifeskin-shop/shop.js');

const IDS = ['#kasa-emri', '#kasa-telefoni', '#kasa-adresa', '#kasa-qyteti'];

function fixture() {
  const elements = new Map();
  let fokus = null;
  const node = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      id: selector, dataset: {}, hidden: true, value: '', textContent: '', children: [], listeners: {},
      setAttribute(name, value) { this[name] = value; }, removeAttribute(name) { delete this[name]; },
      toggleAttribute(name, value) { this[name] = value; }, after() {}, remove() {}, closest() { return null; },
      addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
      focus() { fokus = this; }, blur() { if (fokus === this) fokus = null; },
      querySelector() { return null; },
      querySelectorAll(sel) { return selector === '#kasa-forma' && sel === 'input' ? IDS.map(node) : []; },
      insertAdjacentHTML() {}, innerHTML: ''
    });
    return elements.get(selector);
  };
  const dok = {
    documentElement: { dataset: {}, setAttribute() {} }, defaultView: {},
    querySelector: selector => node(selector), querySelectorAll: () => [],
    createElement: () => node('neu'), addEventListener() {}
  };
  const bestellt = [];
  const sitzung = { code: 'TEST-LOCAL', ergaenze() {}, liveMerken() {}, schritt: async () => { bestellt.push(true); return { ok: true }; } };
  const shop = new Dyqan({ dokument: dok, speicher: null, dauerSpeicher: null, holen: async () => ({ ok: false, status: 404 }),
    trichter: () => ({ sitzung, pixel: {} }) });
  return { shop, node, bestellt, fokus: () => fokus };
}

function enter(f, id) {
  let verhindert = false;
  const ereignis = { key: 'Enter', isComposing: false, target: f.node(id), preventDefault() { verhindert = true; } };
  for (const fn of f.node('#kasa-forma').listeners.keydown || []) fn(ereignis);
  return verhindert;
}

test('Enter in der Kasse bestellt nicht, sondern springt ins naechste leere Feld', () => {
  const f = fixture();
  try { f.shop.starte(); } catch { /* der Rest der Seite fehlt im Test */ }
  assert.ok(f.node('#kasa-forma').listeners.keydown?.length, 'keydown an der Kasse');
  f.node('#kasa-emri').value = 'Test';
  assert.equal(enter(f, '#kasa-emri'), true, 'kein Absenden durch den Browser');
  assert.equal(f.fokus(), f.node('#kasa-telefoni'));
  // Uebersprungene leere Felder kommen danach dran.
  f.node('#kasa-adresa').value = 'Rruga 1';
  f.node('#kasa-qyteti').value = 'Prishtine';
  enter(f, '#kasa-qyteti');
  assert.equal(f.fokus(), f.node('#kasa-telefoni'));
  // Alles da: Tastatur zu, bestellt wird nur mit dem Knopf.
  f.node('#kasa-telefoni').value = '044 123 456';
  enter(f, '#kasa-telefoni');
  assert.equal(f.fokus(), null);
  assert.equal(f.bestellt.length, 0);
});

test('Fehlt ein Feld, steht der Cursor nach dem Knopf im ersten leeren Feld', async () => {
  const f = fixture();
  f.shop.korb = { ids: ['lf-acne', 'lf-moistur'], set: 'acne' };
  f.node('#kasa-emri').value = 'Test';
  f.node('#kasa-qyteti').value = 'Prishtine';
  await f.shop.bestellen();
  assert.equal(f.node('#kasa-gabim').hidden, false);
  assert.equal(f.fokus(), f.node('#kasa-telefoni'));
  assert.equal(f.bestellt.length, 0);
});
