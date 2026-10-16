import {loadProductMedia,mediaUrl,validProductId} from '../server/lifeskin-product-media.js';
export async function serveProductMedia(req,res,load=loadProductMedia) {
  res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');res.end();return;}
  const url=new URL(req.url||'/','https://local.invalid');const id=String(req.query?.id||url.searchParams.get('id')||'');
  if(!validProductId(id)){res.statusCode=400;res.setHeader('Cache-Control','no-store');res.end('{}');return;}
  try{
    const media=await load(id);
    if(!media||media.hidden){res.statusCode=404;res.setHeader('Cache-Control','no-store');res.end('{}');return;}
    const images=[`/api/lifeskin-product-photo?id=${encodeURIComponent(id)}&w=480`,...media.images.slice(1).map(entry=>mediaUrl(id,entry))];
    res.statusCode=200;
    res.setHeader('Cache-Control',media.partial?'no-store':'public, max-age=60');
    res.setHeader('Vercel-CDN-Cache-Control',media.partial?'no-store':'public, s-maxage=60, stale-while-revalidate=300');
    res.end(req.method==='HEAD'?undefined:JSON.stringify({id,complete:!media.partial,images}));
  }catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');res.end('{}');}
}

export default function productMedia(req,res) { return serveProductMedia(req,res); }
