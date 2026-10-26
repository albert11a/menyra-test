// Shared, deterministic Fast contract. No DOM, network or physician claims.
export const FAST_DOK = 'fast';
export const FAST_STANDARD = Object.freeze({ enabled: false, prices: Object.freeze({ 2: 25, 3: 35, 4: 45 }) });
export function fastKonfig(raw = {}) {
  const prices = {};
  for (const n of [2, 3, 4]) {
    const v = Number(raw?.prices?.[n]);
    prices[n] = Number.isFinite(v) && v >= 0.01 && v <= 1000 ? Math.round(v * 100) / 100 : FAST_STANDARD.prices[n];
  }
  return { enabled: raw?.enabled === true, prices };
}
const CONCERNS = Object.freeze({
  pucrrat: ['Aknet', 'lf-acne'], poret: ['Poret e mëdha', 'lf-pore'],
  shkelqimi: ['Shkëlqimi', 'lf-pore'], njollat: ['Njollat e errëta', 'lf-pigment'],
  skuqja: ['Skuqja dhe ndjeshmëria', 'lf-moistur'], thate: ['Lëkura e thatë', 'lf-moistur'],
  rrudhat: ['Rrudhat dhe elasticiteti', 'lf-moistur'], nukEdi: ['Kujdesi i përditshëm', 'lf-moistur']
});
const ROLES = Object.freeze({
  'lf-acne': 'Për kujdesin e lëkurës me akne që përmendët.',
  'lf-pore': 'Për poret dhe shkëlqimin që përmendët.',
  'lf-pigment': 'Për kujdesin e lëkurës me njollat që përmendët.',
  'lf-moistur': 'Për hidratim dhe mbështetjen e barrierës së lëkurës.',
  'lf-clean': 'Për hapin e pastrimit në rutinën tuaj.'
});
const list = v => Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];
export function fastAntwortenOk(a) {
  const concerns = list(a?.anliegen), safety = list(a?.kujdesi);
  return concerns.length > 0 && concerns.length <= 3 && new Set(concerns).size === concerns.length
    && concerns.every(x => Object.hasOwn(CONCERNS, x))
    && !(concerns.includes('nukEdi') && concerns.length > 1)
    && ['thate', 'normale', 'yndyrshme', 'perzier'].includes(a?.lekura)
    && safety.length > 0 && safety.every(x => ['asnjera', 'shtatzeni', 'izotretinoin', 'trajtim'].includes(x))
    && !(safety.includes('asnjera') && safety.length > 1)
    && list(a?.perdorimi).length > 0
    && list(a.perdorimi).every(x => ['farmaci', 'rrjete', 'larje', 'shume', 'mjek', 'asgje'].includes(x));
}
export function fastEmpfehlung(answers, config, catalog) {
  if (!fastAntwortenOk(answers)) throw new Error('answers');
  const concerns = list(answers.anliegen);
  // Current safety answers govern this exception. Dry skin, redness and a
  // previously tried treatment must not erase the selected concerns.
  const basic = list(answers.kujdesi).some(x => x !== 'asnjera');
  const ids = basic ? ['lf-clean', 'lf-moistur']
    : [...new Set([...concerns.map(x => CONCERNS[x][1]), 'lf-moistur'])];
  if (ids.length === 1) ids.unshift('lf-clean');
  const products = ids.map(id => {
    const p = catalog.find(p => p.id === id && p.availability !== 'hidden');
    if (!p) throw new Error('product-unavailable');
    return { id, satz: ROLES[id], veprimi: [ROLES[id]] };
  });
  const labels = concerns.map(x => CONCERNS[x][0]);
  const summary = `Bazuar në përgjigjet tuaja, përmendët: ${labels.join(', ')}. `
    + (basic ? 'Rutina juaj nis me pastrim dhe hidratim, me fokus te rehatia e lëkurës.'
      : `Seti juaj me ${ids.length} produkte lidh kujdesin për këto shqetësime me hidratimin e përditshëm.`);
  return {
    produkte: products, preis: fastKonfig(config).prices[ids.length],
    befund: summary, schwere: '', ohneBild: false,
    fast: { version: 1, basis: 'answers', count: ids.length },
    // No diagnosis, made-up zone, severity, measured score or photo claim.
    raport: { schemaVersion: 3, aerztlichGeprueft: false, gjetjet: summary,
      gjetjaKryesore: labels[0], gjetjaDyta: labels[1] || '',
      shpjegimi: products.map(p => `${catalog.find(x => x.id === p.id).name}: ${p.satz}`),
      keshilla: 'Nisni gradualisht dhe ndiqni udhëzimet e produkteve. Në mëngjes përdorni mbrojtje nga dielli. Nëse shfaqet irritim, ndaloni produktin përkatës.',
      shitja: { hyrja: `Bazuar në përgjigjet tuaja: ${labels.join(', ')}. Seti juaj përmban ${ids.length} produkte.`,
        shqetesimi: basic ? 'Fillojmë me kujdesin bazë që respekton ndjeshmërinë dhe rutinën tuaj aktuale.' : '',
        produktet: products.map(p => ({ produkt_id: p.id, per_ju: [p.satz] })),
        dita_28: 'Ndiqni si ndihet dhe si reagon lëkura juaj gjatë përdorimit.' }
    }
  };
}
