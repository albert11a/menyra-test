// Personal shop pricing is independent of catalog / other landing-page prices.
export const ROUTINE_PRODUCTS = Object.freeze([
  { id: 'lf-acne', name: 'LF ACNE', goal: 'Akne + shenja nga aknet', text: 'Trajton aknet dhe shenjat nga aknet.', photo: '/apps/lifeskin-shop/assets/lf-acne-3.jpg', time: 'MBREMJE', use: 'Nje shtrese e holle ne lekure te paster e te thate, sipas udhezimit te produktit.' },
  { id: 'lf-moistur', name: 'LF MOISTURE', goal: 'Hidratim + barriere', text: 'Hidraton dhe shton barrieren e lekures.', photo: '/apps/lifeskin-shop/assets/lf-moistur.jpg', time: 'MENGJES + MBREMJE', use: 'Pas trajtimit, sipas udhezimit te produktit. Ne mengjes shto SPF 30+.' },
  { id: 'lf-pore', name: 'LF PORE', goal: 'Pore, gropeza + pika te zeza', text: 'Pastron dhe minimizon poret e zgjeruara, largon pikat e zeza dhe mbush gropezat me qeliza te reja.', photo: '/apps/lifeskin-shop/assets/lf-pore.jpg', time: 'MBREMJE', use: 'Sipas udhezimit te produktit. Me LF ACNE, perdori ne mbremje te ndryshme.' },
  { id: 'lf-clean', name: 'LF CLEAN', goal: 'Lekure e yndyrshme', text: 'Laresi adekuat qe balancon sebumin e lekures.', photo: '/apps/lifeskin-shop/assets/lf-clean-illustration.svg', time: 'MENGJES + MBREMJE', use: 'Pastro lekuren dhe shperlaje, para produkteve te tjera, sipas udhezimit.' }
].map(Object.freeze));
export function isAcneDuoSelection(ids) {
  return Array.isArray(ids) && new Set(ids).size === 2 && ids.includes('lf-acne') && ids.includes('lf-moistur');
}
export const isPersonalRoutine = cart => /^personal-[01]{4}$/.test(String(cart?.set || cart?.id || ''));
export function personalRoutine(ids) {
  if (!Array.isArray(ids) || ids.some(id => !ROUTINE_PRODUCTS.some(p => p.id === id))) return null;
  const products = ROUTINE_PRODUCTS.filter(p => ids.includes(p.id));
  if (!products.length) return null;
  return { id: `personal-${ROUTINE_PRODUCTS.map(p => Number(ids.includes(p.id))).join('')}`, titulli: 'Seti yt personal', produkte: products.map(p => p.id), cmimi: products.length * 10 + 5, teksti: products.map(p => p.name).join(' + ') };
}
export function personalCartRestore(cart) {
  if (!isPersonalRoutine(cart)) return null;
  const set = personalRoutine(cart.ids);
  return set?.id === cart.set ? { ids: [...set.produkte], set: set.id, cmimi: set.cmimi } : null;
}
export function personalOrderPrices(count) {
  if (!Number.isInteger(count) || count < 1 || count > 4) return [];
  const cents = (count * 10 + 5) * 100, base = Math.floor(cents / count);
  return Array.from({ length: count }, (_, i) => (base + Number(i < cents % count)) / 100);
}
