// Public catalog contract for the existing storefront. Prices are never read from storage.
const ASSETS = '/apps/lifeskin-shop/assets/';
export const SHOP_CATEGORIES = Object.freeze({ akne: 'Akne', hidratim: 'Hidratim', pastrim: 'Pastrim', pore: 'Pore', njolla: 'Njolla', spf: 'Mbrojtje nga dielli', trup: 'Per trupin', kujdes: 'Kujdes tjeter' });
export const CATALOG_FIELDS = Object.freeze(['name','einzelpreis','availability','inhalt','order','nenName','kurztext','beschreibung','shopKategorie','shopBadge','shopSkinTypes','perdorimi','perberesit','perberesitGeprueft']);
export const CART_MAX_LINES = 50;
export const CART_MAX_QUANTITY = 20;
export const CATALOG_CART = 'catalog';
export const PRODUCT_PRESENTATION = Object.freeze({
  'lf-acne': { category: 'akne', label: 'Akne', subtitle: 'Kujdes per lekuren me akne', image: 'lf-acne-3.jpg', color: 'rose' },
  'lf-moistur': { category: 'hidratim', label: 'Hidratim', subtitle: 'Hidratim per cdo dite', image: 'lf-moistur.jpg', color: 'blue' },
  'lf-pore': { category: 'pore', label: 'Pore', subtitle: 'Kujdes per poret dhe teksturen', image: 'lf-pore.jpg', color: 'sand' },
  'lf-pigment': { category: 'njolla', label: 'Njolla', subtitle: 'Kujdes per tonin e lekures', image: 'lf-pigment.jpg', color: 'peach' },
  'lf-clean': { category: 'pastrim', label: 'Pastrim', subtitle: 'Hapi i pare i rutines', image: '', color: 'sand' }
});
export const sqText = value => String(typeof value === 'string' ? value : value?.sq || '').replace(/ë/g, 'e').replace(/Ë/g, 'E').trim();
export function safeProductImage(value) {
  const s = String(value || '').trim();
  return /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(s)
    || /^https:\/\/[^\s<>"']+$/i.test(s)
    || (/^\/apps\/[a-z0-9_./-]+\.(?:jpe?g|png|webp)$/i.test(s) && !s.includes('..')) ? s : '';
}
export function storefrontProducts(records, photos = new Map(), { deferredImages = false } = {}) {
  const seen = new Set();
  return (Array.isArray(records) ? records : []).flatMap(raw => {
    const id = String(raw?.id || '');
    const price = Number(raw?.einzelpreis);
    if (!/^[\w-]{1,40}$/.test(id) || seen.has(id) || raw.availability === 'hidden' || !Number.isFinite(price) || price <= 0 || price > 9999) return [];
    seen.add(id);
    const p = PRODUCT_PRESENTATION[id] || { category: 'kujdes', label: 'Kujdes', subtitle: '', color: 'sand' };
    const category = Object.hasOwn(SHOP_CATEGORIES, raw.shopKategorie) ? raw.shopKategorie : p.category;
    const images = deferredImages ? [`/api/lifeskin-product-photo?id=${encodeURIComponent(id)}&w=480`] : [...new Set([raw.photoRef, ...(photos.get(id) || []), p.image ? ASSETS + p.image : ''].map(safeProductImage).filter(Boolean))].slice(0, 6);
    return [{ id, name: String(raw.name || id).slice(0, 100), price: Math.round(price * 100) / 100,
      size: String(raw.inhalt || '').slice(0, 80), category, label: SHOP_CATEGORIES[category] || p.label, color: p.color,
      badge: sqText(raw.shopBadge).slice(0, 30), soldOut: raw.availability === "soldout",
      skinTypes: sqText(raw.shopSkinTypes).slice(0, 200),
      subtitle: sqText(raw.nenName) || p.subtitle, description: sqText(raw.beschreibung) || sqText(raw.kurztext) || p.subtitle,
      images, order: Number(raw.order) || 99,
      usage: ['koha', 'sasia', 'si', 'kujdes'].map(key => sqText(raw.perdorimi?.[key])).filter(Boolean),
      ingredients: raw.perberesitGeprueft === true && Array.isArray(raw.perberesit) ? raw.perberesit.map(x => [String(x.emri || ''), String(x.sasia || '')].filter(Boolean).join(' ')).filter(Boolean) : [] }];
  }).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}
export function catalogCart(ids, products, quantities = {}) {
  const wanted = [...new Set(Array.isArray(ids) ? ids : [])].slice(0, CART_MAX_LINES);
  const byId = new Map(products.map(p => [p.id, p]));
  // Reject the complete selection when a product disappeared or was hidden.
  if (!wanted.length || wanted.some(id => !byId.has(id) || byId.get(id).soldOut)) return null;
  const mengen = Object.fromEntries(wanted.map(id => [id, Math.min(CART_MAX_QUANTITY, Math.max(1, Math.floor(Number(quantities[id]) || 1)))]));
  const lines = wanted.map(id => ({ id, name: byId.get(id).name, cmimi: byId.get(id).price, sasia: mengen[id] }));
  return { ids: wanted, set: CATALOG_CART, mengen, cmimi: Math.round(lines.reduce((total, line) => total + line.cmimi * line.sasia, 0) * 100) / 100, lines };
}
export const money = value => `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value)} €`;

export function changeCatalogQuantity(cart, id, quantity, products) {
  const ids = [...(cart?.set === CATALOG_CART ? cart.ids : [])];
  const quantities = { ...(cart?.mengen || {}) };
  const n = Math.min(CART_MAX_QUANTITY, Math.max(0, Math.floor(Number(quantity) || 0)));
  if (!n) { delete quantities[id]; return ids.filter(x => x !== id).length ? catalogCart(ids.filter(x => x !== id), products, quantities) : { ids: [], set: '', mengen: {}, lines: [], cmimi: 0 }; }
  if (!ids.includes(id)) { if (ids.length >= CART_MAX_LINES) return null; ids.push(id); }
  quantities[id] = n;
  return catalogCart(ids, products, quantities);
}
export function filterCatalog(products, { category = 'all', search = '', sort = 'recommended' } = {}) {
  const query = sqText(search).toLowerCase();
  const list = products.filter(p => (category === 'all' || p.category === category) && (!query || sqText([p.name, p.subtitle, p.description, p.label].join(' ')).toLowerCase().includes(query)));
  return sort === 'recommended' ? list : [...list].sort((a,b) => (a.price - b.price) * (sort === 'price-down' ? -1 : 1));
}
