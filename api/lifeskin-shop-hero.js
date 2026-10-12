// A regular cacheable image, instead of base64 JSON downloaded by the shop module.
import { readShopDocument } from './lifeskin-shop.js';
import { SHOP_HERO_FALLBACK } from '../shared/lifeskin-shop-first-render.js';

export default async function shopHero(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) { res.statusCode = 405; res.end(); return; }
  try {
    const doc = await readShopDocument('shopHero');
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(doc?.foto || '');
    if (!match) throw new Error('No hero');
    const bytes = Buffer.from(match[2], 'base64');
    res.setHeader('Content-Type', `image/${match[1]}`);
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.statusCode = 200;
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Location', SHOP_HERO_FALLBACK);
    res.statusCode = 302;
    res.end();
  }
}
