// Binary, cacheable image delivery; galleries never send base64 to the browser.
import sharp from 'sharp';
import {resolveProductMedia,mediaVersion,validProductId} from '../server/lifeskin-product-media.js';
export async function loadProductPhoto(id,fetchFn=fetch) {
  return resolveProductMedia(id,'primary',0,fetchFn);
}
export async function serveProductPhoto(req,res,resolve=resolveProductMedia) {
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');res.end();return;}
  const url=new URL(req.url||'/','https://local.invalid');
  const get=key=>req.query?.[key]??url.searchParams.get(key);
  const id=String(get('id')||''),source=String(get('source')||'primary'),index=Number(get('index')||0);
  const requested=Number(get('w'))||480,width=[240,480,960].find(size=>size>=requested)||960;
  if(!validProductId(id)||!['primary','landing','analysis','shop','asset'].includes(source)||!Number.isInteger(index)||index<0||index>31){res.statusCode=400;res.setHeader('Cache-Control','no-store');res.end();return;}
  try{
    const photo=await resolve(id,source,index);
    if(!photo||photo.hidden){res.statusCode=404;res.setHeader('Cache-Control','no-store');res.end();return;}
    if(photo.placeholder){res.statusCode=307;res.setHeader('Location','/apps/lifeskin-shop/assets/catalog-placeholder.svg');res.setHeader('Cache-Control','public, max-age=60');res.end();return;}
    const version=mediaVersion(photo),provided=String(get('v')||'');
    // Never cache replacement content under an old immutable image URL.
    if(provided&&provided!==version){res.statusCode=404;res.setHeader('Cache-Control','no-store');res.end();return;}
    if(photo.url){res.statusCode=307;res.setHeader('Location',photo.url);res.setHeader('Cache-Control','public, max-age=60');res.end();return;}
    const etag=`"${version}-${width}"`;
    res.setHeader('Cache-Control',provided?'public, max-age=31536000, immutable':'public, max-age=60');
    res.setHeader('Vercel-CDN-Cache-Control',provided?'public, s-maxage=31536000, immutable':'public, s-maxage=300, stale-while-revalidate=86400');
    res.setHeader('ETag',etag);res.setHeader('X-Content-Type-Options','nosniff');
    if(req.headers?.['if-none-match']===etag){res.statusCode=304;res.end();return;}
    const bytes=await sharp(photo.buffer,{limitInputPixels:25000000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:78,effort:3}).toBuffer();
    res.statusCode=200;res.setHeader('Content-Type','image/webp');res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');res.end();}
}

export default function productPhoto(req,res) { return serveProductPhoto(req,res); }
