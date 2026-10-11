import { rutinaEvents } from '../../shared/lifeskin-rutina.js';
import { ROUTINE_PRODUCTS } from '../../shared/lifeskin-personal-routine.js';
import { imZeitraum, tagesschluessel } from './heart-lifeskin-berechnung.js';
export function baueRutina(sessions, period = '') {
  const events = (sessions || []).filter(s => !s.test && !s.still).flatMap(s => rutinaEvents(s));
  const selected = period ? imZeitraum(events.map(e => ({ ...e, tag: tagesschluessel(e.at) })), period) : events;
  const finished = selected.filter(e => e.kind === 'finish');
  const ranking = ROUTINE_PRODUCTS.map(p => ({ id: p.id, name: p.name, count: finished.filter(e => e.ids.includes(p.id)).length })).sort((a,b) => b.count-a.count || a.name.localeCompare(b.name));
  const prices = new Map();
  for (const e of finished) prices.set(e.price, (prices.get(e.price) || 0) + 1);
  return { starts: selected.filter(e => e.kind === 'start').length, finishes: finished.length,
    details: selected.filter(e => e.kind === 'details').length, orders: selected.filter(e => e.kind === 'order').length,
    total: finished.reduce((n,e) => n + Math.round(e.price * 100), 0) / 100,
    ranking, prices: [...prices].sort((a,b) => a[0]-b[0]) };
}
export function renderRutina(stats) {
  const euro = n => `${Number(n).toLocaleString('de-AT', { maximumFractionDigits:2 })} €`;
  const row = (label,value) => `<div class="heart-rutina-row"><span>${label}</span><strong>${value}</strong></div>`;
  return `<div class="heart-rutina-stats">${row('1 · Gestartet',stats.starts)}${row('2 · Fertig',stats.finishes)}
    <h4>Am häufigsten ausgewählt</h4>${stats.ranking.map((p,i) => row(`${i+1} · ${p.name}`,p.count)).join('')}
    ${row('3 · Më shumë detaje',stats.details)}${row('4 · Vazhdo me porosinë',stats.orders)}
    ${row('5 · Gesamtpreis fertiger Routinen',euro(stats.total))}
    ${stats.prices.map(([price,count]) => row(`Fertig mit ${euro(price)}`,count)).join('')}
    <p class="heart-lifeskin-block__fuss">Auswahl pro Abschluss · Gesamtpreis ist kein Umsatz. Messung ab Einführung; frühere Routinen sind nicht erfasst.</p></div>`;
}
