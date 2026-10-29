import { readFile } from 'node:fs/promises';
import { ccEscape as esc, ccImage } from '../shared/content-creator.js';
import {publicCreatorPage,renderCreatorCatalog,creatorPhoto,creatorHowTo} from '../shared/content-creator-view.js';
const BASE='https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents';
function decode(v){if(!v)return null;if('stringValue'in v)return v.stringValue;if('booleanValue'in v)return v.booleanValue;if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return Number(v.doubleValue);if('timestampValue'in v)return v.timestampValue;if(v.mapValue)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]));if(v.arrayValue)return (v.arrayValue.values||[]).map(decode);return null;}
let creatorStyles;
async function loadCreatorStyles(){
 return creatorStyles ||= Promise.all(['content','shop'].map(async name=>{
  try{return await readFile(new URL(`../dist/apps/content-creator/${name}.css`,import.meta.url),'utf8');}
  catch{return readFile(new URL(`../apps/content-creator/${name}.css`,import.meta.url),'utf8');}
 })).then(styles=>styles.join('\n')).catch(error=>{creatorStyles=undefined;throw error;});
}
export async function publicDocument(path,fetchFn=fetch){
  const response=await fetchFn(`${BASE}/${path}`,{signal:AbortSignal.timeout(4000)});
  if(response.status===404)return null;if(!response.ok)throw Error('Public page unavailable');
  return Object.fromEntries(Object.entries((await response.json()).fields || {}).map(([k,v])=>[k,decode(v)]));
}
async function readCreatorCovers(safePage,page){
  const {shopRepository,shopAction}=await import('../server/content-creator-shop.js');
  const repo=await shopRepository(),pagePath=`contentCreatorPages/${safePage.id}`,covers={};
  const seeded={...repo,read:(path,fields)=>path===pagePath?Promise.resolve(page):repo.read(path,fields)};
  await Promise.all(safePage.products.slice(0,2).map(async p=>{
    const file=p.imageIds[0];if(!file)return;
    try{const image=await shopAction({op:'image',pageId:safePage.id,file,display:'3',size:'thumb'},seeded);covers[file]=`data:${image.mime};base64,${image.bytes.toString('base64')}`;}catch{}
  }));
  return covers;
}
export async function serveContentCreator(req,res,{read=publicDocument,shell,loadCovers=readCreatorCovers}={}){
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');res.end();return;}
  const url=new URL(req.url || '/', 'https://www.mnyra.com');
  const id=String(req.query?.id || url.searchParams.get('id') || '');
  if(!/^[a-f0-9]{32}$/.test(id)){res.statusCode=404;res.end();return;}
  const assetMode=String(req.query?.asset || url.searchParams.get('asset') || '')==='1';
  const imageMode=String(req.query?.image || url.searchParams.get('image') || '')==='1';
  try{
    const page=await read(`contentCreatorPages/${id}`);
    if(!page?.published){res.statusCode=404;res.setHeader('Cache-Control','no-store');res.end();return;}
    const safePage=publicCreatorPage(page,id);
    if(!imageMode&&!assetMode&&safePage.avatar){
      try{
        const {default:sharp}=await import('sharp');
        const bytes=await sharp(Buffer.from(safePage.avatar.split(',')[1],'base64'),{limitInputPixels:50000000}).rotate().resize({width:96,height:96,fit:'inside',withoutEnlargement:true}).jpeg({quality:64}).toBuffer();
        safePage.avatar=`data:image/jpeg;base64,${bytes.toString('base64')}`;
      }catch{}
    }
    if(String(req.query?.format || url.searchParams.get('format') || '')==='json'){
      res.statusCode=200;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(req.method==='HEAD'?undefined:JSON.stringify(safePage));return;
    }
    if(assetMode){
      const key=String(req.query?.photo || url.searchParams.get('photo') || '');
      if(page.kind==='shop'||!safePage.photoIds.includes(key)){res.statusCode=404;res.end();return;}
      const record=await read(`contentCreatorPages/${id}/images/${key}`),data=ccImage(record?.data);
      if(!data){res.statusCode=404;res.end();return;}
      const {default:sharp}=await import('sharp');
      const bytes=await sharp(Buffer.from(data.split(',')[1],'base64'),{limitInputPixels:50000000}).rotate().resize({width:720,height:1080,fit:'inside',withoutEnlargement:true}).webp({quality:68}).toBuffer();
      res.statusCode=200;res.setHeader('Content-Type','image/webp');res.setHeader('Cache-Control','private, max-age=300');res.end(req.method==='HEAD'?undefined:bytes);return;
    }
    const last=safePage.photoIds.at(-1);
    if(imageMode){
      if(!last || !/^[a-zA-Z0-9_-]{1,64}$/.test(last)){res.statusCode=404;res.end();return;}
      if(page.kind==='shop'){res.statusCode=307;res.setHeader('Cache-Control','no-store');res.setHeader('Location',`/api/content-creator-shop?${new URLSearchParams({op:'image',pageId:id,file:last,display:'3',size:'medium',v:safePage.updatedAt||String(safePage.createdMs)})}`);res.end();return;}
      const image=await read(`contentCreatorPages/${id}/${page.kind==='shop'?'previews':'images'}/${last}`),data=ccImage(image?.data);
      if(!data){res.statusCode=404;res.end();return;}
      res.setHeader('Content-Type','image/jpeg');res.setHeader('Cache-Control','public, max-age=60');
      res.statusCode=200;res.end(req.method==='HEAD'?undefined:Buffer.from(data.split(',')[1],'base64'));return;
    }
    let html=shell;
    if(!html){try{html=await readFile(new URL('../dist/apps/content-creator/index.html',import.meta.url),'utf8');}catch{html=await readFile(new URL('../apps/content-creator/index.html',import.meta.url),'utf8');}}
    const title=`Për ${page.name} · MNYRA`,description=`Foto të përgatitura posaçërisht për ${page.name}. Përmbajtje për rrjetet tuaja sociale nga MNYRA.`;
    const origin='https://www.mnyra.com',image=`${origin}/api/content-creator?id=${id}&image=1&display=3&photo=${encodeURIComponent(last || '')}&v=${encodeURIComponent(safePage.updatedAt || String(safePage.createdMs))}`;
    html=html.replace(/<title>[^<]*<\/title>/,()=>`<title>${esc(title)}</title>`).replace('</head>',()=>`<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}/content-creator/${id}"><meta name="twitter:card" content="summary_large_image">${last?`<meta property="og:image" content="${esc(image)}"><meta name="twitter:image" content="${esc(image)}">`:''}</head>`);
    // The first screen is useful without JavaScript. Already-prepared covers
    // are embedded in HTML; cold preparation is bounded so it cannot stall it.
    if(safePage.kind==='shop'){
      const covers={};
      if(req.method!=='HEAD'){
        let timer;
        await Promise.race([
          (async()=>{
            Object.assign(covers,await loadCovers(safePage,page));
          })().catch(()=>{}),
          new Promise(resolve=>{timer=setTimeout(resolve,1200);})
        ]).finally(()=>clearTimeout(timer));
      }
      const catalog=renderCreatorCatalog(safePage,{photo:(key,alt,options)=>creatorPhoto(safePage,key,alt,{...options,src:covers[key]})});
      const firstFrame=`<div class="shop-shell">${catalog}<div id="shop-image-errors"></div>${creatorHowTo(safePage)}<footer class="shop-footer">MNYRA · Krijuar për biznesin tuaj</footer></div>`;
      html=html.replace(/(<main[^>]*id="content-app"[^>]*>)[\s\S]*?(<\/main>)/,(_,open,close)=>open+firstFrame+close);
    }
    // CSS is small and shared by the first server frame: avoid two extra 3G
    // round trips before any inline photograph can be painted.
    if(html.includes('/apps/content-creator/content.css')){
      try{const css=await loadCreatorStyles();html=html.replace(/<link rel="stylesheet" href="\/apps\/content-creator\/(?:content|shop)\.css[^"]*">/g,'').replace('</head>',()=>`<style>${css}</style></head>`);}catch{}
    }
    const payload=JSON.stringify(safePage).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    html=html.replace('</head>',()=>`<script id="creator-page-data" type="application/json">${payload}</script></head>`);
    res.statusCode=200;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(req.method==='HEAD'?undefined:html);
  }catch{res.statusCode=503;res.setHeader('Cache-Control','no-store');res.end('Faqja nuk është e disponueshme për momentin.');}
}
export default function handler(req,res){return serveContentCreator(req,res);}

