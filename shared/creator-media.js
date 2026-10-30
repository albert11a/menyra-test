// Public URLs are restricted to our media origin; private object keys never
// belong in the page manifest or a public /media URL.
export const CREATOR_MEDIA_ORIGIN = 'https://menyra-media.alberthoti-vsa.workers.dev';
export function creatorMediaUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === CREATOR_MEDIA_ORIGIN && /^\/media\/creator-public\/[a-zA-Z0-9/_-]+\.(webp|jpg|png)$/.test(url.pathname) && !url.search && !url.hash ? url.href : '';
  } catch { return ''; }
}
export function creatorVariants(record) {
  if (!record || !['clean','marked'].includes(record.mode)) return null;
  const result = {mode:record.mode};
  if(Number.isSafeInteger(record.bytes)&&record.bytes>0&&record.bytes<=30*1024*1024)result.bytes=record.bytes;
  for (const size of ['thumb','medium','large']) {
    result[size] = creatorMediaUrl(record[size]);
    if (!result[size]) return null;
  }
  return result;
}
export function creatorPublicMedia(page) {
  const result = {};
  for (const id of page.photoIds || []) {
    const products = (page.products || []).filter(p => p.active !== false && p.imageIds?.includes(id));
    if (page.kind === 'shop' && !products.length) continue;
    const mode = page.kind !== 'shop' || products.some(p => p.priceCents === 0) ? 'clean' : 'marked';
    const record = creatorVariants(page.media?.[id]);
    if (record?.mode === mode) result[id] = record;
  }
  return result;
}
export function creatorHeroImages(page) {
  return (Array.isArray(page.heroImages) ? page.heroImages : []).slice(0,6).flatMap(entry => {
    const record = creatorVariants(entry);
    return record && record.mode === 'clean' && /^hero_[a-f0-9]{32}$/.test(entry.id || '') ? [{id:entry.id,...record}] : [];
  });
}
