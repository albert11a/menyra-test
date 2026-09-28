// Same-tab handoff to the existing shop. No orders, customer data or pixel calls.
export function prepareCheckout(storage, productIds, search = '') {
  const allowed = new Set(['lf-acne', 'lf-moistur', 'lf-pigment', 'lf-pore']);
  const ids = [...new Set(productIds)].filter(id => allowed.has(id));
  if (!ids.length) return { ok: false };
  const value = JSON.stringify(ids.map(id => ({ id, sasia: 1 })));
  try {
    storage.setItem('lifeskin.shporta', value);
    if (storage.getItem('lifeskin.shporta') !== value) return { ok: false };
  } catch { return { ok: false }; }
  const params = new URLSearchParams(search);
  const suffix = params.get('still') === '1' || params.get('test') === '1' ? '?still=1' : '';
  return { ok: true, href: `/lifeskin2${suffix}#produktet` };
}
