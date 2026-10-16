// Public product image delivery. Never reads customer/session collections.
import sharp from 'sharp';
import { SHOP_CONFIG_BASE, firestoreFields } from '../shared/lifeskin-shop-first-render.js';
import { PRODUCT_PRESENTATION } from '../shared/lifeskin-storefront.js';
export async function loadProductPhoto(id, fetchFn = fetch) {
  if (!/^[\w-]{1,40}$/.test(id)) return null;
  const response = await fetchFn(`${SHOP_CONFIG_BASE.replace(/\/config$/, '/products')}/${encodeURIComponent(id)}?mask.fieldPaths=photoRef&mask.fieldPaths=availability`, { signal:AbortSignal.timeout(3500) });
  if (!response.ok) return null;
  const data = firestoreFields((await response.json()).fields);
  if (data.availability === 'hidden') return { hidden:true };
  if (/^data:image\/(?:jpeg|png|webp);base64,/i.test(data.photoRef || '')) return { buffer:Buffer.from(data.photoRef.split(',')[1], 'base64') };
  if (/^https:\/\/[^\s<>"']+$/.test(data.photoRef || '')) return { url:data.photoRef };
  return { fallback:PRODUCT_PRESENTATION[id]?.image || '' };
}
export default async function productPhoto(req,res) {
  if (!['GET','HEAD'].includes(req.method)) { res.statusCode=405;res.setHeader('Allow','GET, HEAD');res.end();return; }
  const url = new URL(req.url || '/', 'https://local.invalid');
  const id = String(req.query?.id || url.searchParams.get('id') || '');
  const requested = Number(req.query?.w || url.searchParams.get('w')) || 480;
  const width = [240,480,960].find(size => size >= requested) || 960;
  let photo;
  try { photo=await loadProductPhoto(id); } catch { photo=null; }
  if (!photo || photo.hidden) { res.statusCode=404;res.setHeader('Cache-Control','no-store');res.end();return; }
  if (!photo.buffer) {
    const path=photo.url || (photo.fallback ? `/apps/lifeskin-shop/assets/${photo.fallback}` : '/apps/lifeskin-shop/assets/catalog-placeholder.svg');
    res.statusCode=307;res.setHeader('Location',path);res.setHeader('Cache-Control','public, max-age=60');res.end();return;
  }
  try {
    const image=await sharp(photo.buffer,{limitInputPixels:20000000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:80}).toBuffer();
    res.statusCode=200;res.setHeader('Content-Type','image/webp');res.setHeader('Cache-Control','public, max-age=60');res.setHeader('Vercel-CDN-Cache-Control','public, s-maxage=60');res.end(req.method==='HEAD'?undefined:image);
  } catch { res.statusCode=422;res.setHeader('Cache-Control','no-store');res.end(); }
}
