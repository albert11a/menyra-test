import { readFile } from 'node:fs/promises';
import { ccEscape as esc, ccImage } from '../shared/content-creator.js';
const BASE='https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents';
function decode(v){if(!v)return null;if('stringValue'in v)return v.stringValue;if('booleanValue'in v)return v.booleanValue;if(v.arrayValue)return (v.arrayValue.values||[]).map(decode);return null;}
export async function publicDocument(path,fetchFn=fetch){
  const response=await fetchFn(`${BASE}/${path}`,{signal:AbortSignal.timeout(4000)});
  if(response.status===404)return null;if(!response.ok)throw Error('Public page unavailable');
  return Object.fromEntries(Object.entries((await response.json()).fields || {}).map(([k,v])=>[k,decode(v)]));
}
export async function serveContentCreator(req,res,{read=publicDocument,shell}={}){
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');res.end();return;}
  const url=new URL(req.url || '/', 'https://www.mnyra.com');
  const id=String(req.query?.id || url.searchParams.get('id') || '');
  if(!/^[a-f0-9]{32}$/.test(id)){res.statusCode=404;res.end();return;}
  const imageMode=String(req.query?.image || url.searchParams.get('image') || '')==='1';
  try{
    const page=await read(`contentCreatorPages/${id}`);
    if(!page?.published){res.statusCode=404;res.setHeader('Cache-Control','no-store');res.end();return;}
    const last=(page.photoIds || []).at(-1);
    if(imageMode){
      if(!last || !/^[a-zA-Z0-9_-]{1,64}$/.test(last)){res.statusCode=404;res.end();return;}
      const image=await read(`contentCreatorPages/${id}/images/${last}`),data=ccImage(image?.data);
      if(!data){res.statusCode=404;res.end();return;}
      res.setHeader('Content-Type','image/jpeg');res.setHeader('Cache-Control','public, max-age=60');
      res.statusCode=200;res.end(req.method==='HEAD'?undefined:Buffer.from(data.split(',')[1],'base64'));return;
    }
    let html=shell;
    if(!html){try{html=await readFile(new URL('../dist/apps/content-creator/index.html',import.meta.url),'utf8');}catch{html=await readFile(new URL('../apps/content-creator/index.html',import.meta.url),'utf8');}}
    const title=`Për ${page.name} · MNYRA`,description=`Foto të përgatitura posaçërisht për ${page.name}. Përmbajtje për rrjetet tuaja sociale nga MNYRA.`;
    const origin='https://www.mnyra.com',image=`${origin}/api/content-creator?id=${id}&image=1&photo=${encodeURIComponent(last || '')}`;
    html=html.replace(/<title>[^<]*<\/title>/,`<title>${esc(title)}</title>`).replace('</head>',`<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}/content-creator/${id}"><meta name="twitter:card" content="summary_large_image">${last?`<meta property="og:image" content="${esc(image)}"><meta name="twitter:image" content="${esc(image)}">`:''}</head>`);
    res.statusCode=200;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(req.method==='HEAD'?undefined:html);
  }catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');res.end('Faqja nuk është e disponueshme për momentin.');}
}
export default function handler(req,res){return serveContentCreator(req,res);}
