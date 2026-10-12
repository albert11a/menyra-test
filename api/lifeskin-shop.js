// Read only public storefront data; never sessions, orders or credentials.
import { readFile } from 'node:fs/promises';
import { SHOP_CONFIG_BASE, SHOP_HERO_FALLBACK, firestoreFields, shopOffer, renderShop } from '../shared/lifeskin-shop-first-render.js';

export async function readShopDocument(name, fetchFn = fetch, mask = '') {
  const response = await fetchFn(`${SHOP_CONFIG_BASE}/${name}${mask}`, { signal: AbortSignal.timeout(2500), cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Shop config ${response.status}`);
  return firestoreFields((await response.json()).fields);
}

export async function loadShopSnapshot(fetchFn = fetch, now = Date.now()) {
  const [offer, hero] = await Promise.all([
    Promise.all([readShopDocument('shopSetet', fetchFn), readShopDocument('shopAktion', fetchFn)])
      .then(([sets, action]) => shopOffer(sets, action, now)).catch(() => null),
    readShopDocument('shopHero', fetchFn, '?mask.fieldPaths=updatedAt&mask.fieldPaths=anzahl')
      .then(doc => doc ? { url: `/api/lifeskin-shop-hero?v=${encodeURIComponent(String(doc.updatedAt || 'current'))}`, anzahl: Math.min(5, Math.max(1, Number(doc.anzahl) || 1)) }
        : { url: SHOP_HERO_FALLBACK, anzahl: 0 }).catch(() => null)
  ]);
  return { offer, hero };
}

export default async function shopPage(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) { res.statusCode = 405; res.setHeader('Allow', 'GET, HEAD'); res.end(); return; }
  const [html, snapshot] = await Promise.all([
    readFile(new URL('../dist/apps/lifeskin-shop/index.html', import.meta.url), 'utf8')
      .catch(() => readFile(new URL('../apps/lifeskin-shop/index.html', import.meta.url), 'utf8')),
    loadShopSnapshot()
  ]);
  // No stale-while-revalidate: never keep a promotion beyond its deadline.
  const seconds = snapshot.offer?.promotion ? Math.max(0, Math.min(15, Math.floor((Date.parse(snapshot.offer.aktion.bis) - Date.now()) / 1000))) : 15;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', snapshot.offer && snapshot.hero && seconds ? `public, s-maxage=${seconds}` : 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.statusCode = 200;
  res.end(req.method === 'HEAD' ? undefined : renderShop(html, snapshot));
}
