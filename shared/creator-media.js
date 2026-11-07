// The already deployed MNYRA image uploader returns /media/social/... URLs.
// Only this owned media origin is allowed in public Creator manifests.
export const CREATOR_MEDIA_ORIGIN = 'https://menyra-media.alberthoti-vsa.workers.dev';
export function creatorMediaUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === CREATOR_MEDIA_ORIGIN && /^\/media\/(?:creator-public\/[a-zA-Z0-9/_-]+|social\/[A-Za-z0-9_-]{1,80}\/[A-Za-z0-9_-]+)\.(webp|jpg|png)$/.test(url.pathname) && !url.search && !url.hash && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
export function creatorStudioSamples(page) {
  const { before, after } = page.photoStudioSamples || {};
  return { before: creatorMediaUrl(before), after: creatorMediaUrl(after) };
}
export function creatorVideoMediaUrl(value) {
  try {
    const url=new URL(value);
    return url.origin===CREATOR_MEDIA_ORIGIN && /^\/media\/stories\/[A-Za-z0-9_-]{1,80}\/[A-Za-z0-9_-]+\.(mp4|webm)$/.test(url.pathname) && !url.search && !url.hash && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
export function creatorVariants(record) {
  if (!record || !['clean','marked'].includes(record.mode)) return null;
  const result = {mode:record.mode,...(record.mediaType==='video'?{mediaType:'video'}:{})};
  if(Number.isSafeInteger(record.bytes)&&record.bytes>0&&record.bytes<=30*1024*1024)result.bytes=record.bytes;
  for (const size of ['thumb','medium','large']) {
    result[size] = creatorMediaUrl(record[size]);
    if (!result[size]) return null;
  }
  if(record.mediaType==='video'&&creatorVideoMediaUrl(record.video)&&creatorVideoMediaUrl(record.boomerang)){result.video=creatorVideoMediaUrl(record.video);result.boomerang=creatorVideoMediaUrl(record.boomerang);result.videoVersion=2;}
  if(result.video&&record.webVideoVersion===1){result.webVideoVersion=1;for(const name of ['videoBytes','videoSourceBytes'])if(Number.isSafeInteger(record[name])&&record[name]>0&&record[name]<=48*1024*1024)result[name]=record[name];}
  if(record.mode==='clean'&&creatorMediaUrl(record.download))result.download=creatorMediaUrl(record.download);
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
