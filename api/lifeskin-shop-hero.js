// A regular cacheable image, instead of base64 JSON downloaded by the shop module.
import { readShopDocument } from './lifeskin-shop.js';
import { SHOP_HERO_FALLBACK } from '../shared/lifeskin-shop-first-render.js';
import sharp from 'sharp';

export default async function shopHero(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) { res.statusCode = 405; res.end(); return; }
  try {
    const doc = await readShopDocument('shopHero', fetch, '?mask.fieldPaths=foto&mask.fieldPaths=updatedAt');
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(doc?.foto || '');
    if (!match) throw new Error('No hero');
    const original = Buffer.from(match[2], 'base64');
    const query = new URL(req.url || '/', 'https://shop.invalid').searchParams;
    const width = query.get('w') === '720' ? 720 : 1050;
    // Bound decoded pixels and output size; never upscale or change the crop.
    const bytes = await sharp(original, { limitInputPixels: 25000000 })
      .rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 }).toBuffer();
    const version = query.get('v');
    // Only the matching Heart revision is immutable. An old URL must not
    // permanently cache a newer upload after an edge-cache miss.
    const versioned = typeof doc.updatedAt === 'string' && version === doc.updatedAt;
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', versioned
      ? 'public, max-age=31536000, s-maxage=31536000, immutable'
      : 'public, max-age=60, s-maxage=60');
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
