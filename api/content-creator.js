import {createHash} from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { ccEscape as esc, ccImage, contentLink } from '../shared/content-creator.js';
import {publicCreatorPage,creatorSoldCards,renderCreatorCatalog,creatorPhoto,creatorHowTo,creatorHeroFiles,renderCreatorPromo,creatorFooter} from '../shared/content-creator-view.js';
const BASE='https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents';
function decode(v){if(!v)return null;if('stringValue'in v)return v.stringValue;if('booleanValue'in v)return v.booleanValue;if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return Number(v.doubleValue);if('timestampValue'in v)return v.timestampValue;if(v.mapValue)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]));if(v.arrayValue)return (v.arrayValue.values||[]).map(decode);return null;}
let creatorStyles;
function creatorPreloads(html,feature){
  return html.replace(/<template data-creator-preload="([^"]+)">([\s\S]*?)<\/template>/g,(_,name,links)=>name===feature?links:'');
}
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
  await Promise.all([...new Set([...creatorHeroFiles(safePage).slice(0,1),...safePage.products.slice(0,6).map(p=>p.imageIds[0])])].filter(Boolean).slice(0,10).map(async file=>{
    try{const image=await shopAction({op:'image',pageId:safePage.id,file,display:'3',size:'thumb'},seeded);covers[file]=`data:${image.mime};base64,${image.bytes.toString('base64')}`;}catch{}
  }));
  return covers;
}
async function readPhotoAlias(code){
  const {shopRepository}=await import('../server/content-creator-shop.js');
  return (await shopRepository()).read(`contentCreatorPages/photo-links/originals/${code}`);
}
export async function serveContentCreator(req,res,{read=publicDocument,shell,loadCovers=readCreatorCovers,readAlias=readPhotoAlias,loadSold}={}){
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','HEAD'].includes(req.method)){res.statusCode=405;res.setHeader('Allow','GET, HEAD');res.end();return;}
  const url=new URL(req.url || '/', 'https://www.mnyra.com');
  let id=String(req.query?.id || url.searchParams.get('id') || '');
  const creatorSlug=String(req.query?.creatorSlug||url.searchParams.get('creatorSlug')||'');
  if(creatorSlug){
    let route;
    if(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(creatorSlug)&&creatorSlug.length<=80){
      try{route=await read(`contentCreatorPages/${creatorSlug}`);}catch{}
    }
    if(route?.kind==='creator-route'&&/^[a-f0-9]{32}$/.test(route.pageId))id=route.pageId;
    else{
      let html;
      try{html=await readFile(new URL('../dist/apps/menyra-social/index.html',import.meta.url),'utf8');}
      catch{html=await readFile(new URL('../apps/menyra-social/index.html',import.meta.url),'utf8');}
      res.setHeader('Content-Type','text/html; charset=utf-8');
      res.setHeader('Cache-Control','no-store');
      res.end(req.method==='HEAD'?undefined:html);return;
    }
  }
  if(String(req.query?.photos || url.searchParams.get('photos') || '')==='1'){
    let html=shell;
    if(!html){try{html=await readFile(new URL('../dist/apps/content-creator/index.html',import.meta.url),'utf8');}catch{html=await readFile(new URL('../apps/content-creator/index.html',import.meta.url),'utf8');}}
    res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
    const code=String(req.query?.code||url.searchParams.get('code')||'');
    const slug=String(req.query?.slug||url.searchParams.get('slug')||'');
    if(code){
      try{
        const alias=/^[A-Za-z0-9_-]{12}$/.test(code)?await readAlias(code):null;
        if(!alias||alias.slug!==slug||!/^[-a-z0-9]{1,70}$/.test(slug)||!(/^[a-f0-9]{32}$/.test(alias.pageId)&&/^[a-f0-9]{32}$/.test(alias.token))){
          res.statusCode=404;res.end('Linku nuk u gjet.');return;
        }
        const canonical=`https://mnyra.com/${slug}-fotot/${code}`;
        const title='Fotot tuaja janë gati · MNYRA';
        const description='Hapeni linkun për t’i ruajtur fotot në cilësi origjinale.';
        const keys=JSON.stringify({pageId:alias.pageId,token:alias.token});
        html=html.replace(/<title>[^<]*<\/title>/,`<title>${title}</title>`).replace('</head>',`<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://mnyra.com/apps/mnyra-heart/assets/icon-512.png"><script id="creator-photo-keys" type="application/json">${keys}</script></head>`);
      }catch{
        res.statusCode=503;res.end('Provoni përsëri.');return;
      }
    }
    res.end(req.method==='HEAD'?undefined:creatorPreloads(html,'photo-gallery').replace(/<p class="loading">[^<]*<\/p>/,''));return;
  }
  if(!/^[a-f0-9]{32}$/.test(id)){res.statusCode=404;res.end();return;}
  const assetMode=String(req.query?.asset || url.searchParams.get('asset') || '')==='1';
  const imageMode=String(req.query?.image || url.searchParams.get('image') || '')==='1';
  try{
    const page=await read(`contentCreatorPages/${id}`);
    if(!page?.published||page.deleting===true){res.statusCode=404;res.setHeader('Cache-Control','no-store');res.end();return;}
    const safePage=publicCreatorPage(page,id);
    const format=String(req.query?.format || url.searchParams.get('format') || '');
    if(format!=='live'&&!imageMode&&!assetMode&&safePage.avatar){
      try{
        const {default:sharp}=await import('sharp');
        const bytes=await sharp(Buffer.from(safePage.avatar.split(',')[1],'base64'),{limitInputPixels:50000000}).rotate().resize({width:96,height:96,fit:'inside',withoutEnlargement:true}).jpeg({quality:64}).toBuffer();
        safePage.avatar=`data:image/jpeg;base64,${bytes.toString('base64')}`;
      }catch{}
    }
    let soldRepository;
    if(safePage.kind==='shop'&&!assetMode&&!imageMode){
      if(loadSold)safePage.sold=await loadSold(id);
      else if(read===publicDocument){
        const {shopRepository}=await import('../server/content-creator-shop.js');
        soldRepository=await shopRepository();
        safePage.sold=await soldRepository.sold(id,format==='json');
      }else safePage.sold=[];
    }
    if(format==='live'){
      const {products,photoIds,media,mediaTypes,heroImages,heroPhotoIds,heroFormat,heroCrop,sold}=safePage;
      const snapshot={id,products,photoIds,media,mediaTypes,heroImages,heroPhotoIds,heroFormat,heroCrop,sold};
      const version=createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
      res.setHeader('Cache-Control','no-store');
      if(url.searchParams.get('version')===version){res.statusCode=204;res.end();return;}
      if(soldRepository&&req.method!=='HEAD')snapshot.sold=await soldRepository.withDeliveryMedia(id,sold);
      res.statusCode=200;res.setHeader('Content-Type','application/json');res.end(req.method==='HEAD'?undefined:JSON.stringify({...snapshot,version}));return;
    }
    if(format==='json'){
      res.statusCode=200;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(req.method==='HEAD'?undefined:JSON.stringify(safePage));return;
    }
    if(assetMode){
      const key=String(req.query?.photo || url.searchParams.get('photo') || '');
      if(page.kind==='shop'||!safePage.photoIds.includes(key)){res.statusCode=404;res.end();return;}
      if(safePage.media?.[key]?.medium){res.statusCode=307;res.setHeader('Location',safePage.media[key].medium);res.setHeader('Cache-Control','no-store');res.end();return;}
      const record=await read(`contentCreatorPages/${id}/images/${key}`),data=ccImage(record?.data);
      if(!data){res.statusCode=404;res.end();return;}
      const {default:sharp}=await import('sharp');
      const bytes=await sharp(Buffer.from(data.split(',')[1],'base64'),{limitInputPixels:50000000}).rotate().resize({width:720,height:1080,fit:'inside',withoutEnlargement:true}).webp({quality:68}).toBuffer();
      res.statusCode=200;res.setHeader('Content-Type','image/webp');res.setHeader('Cache-Control','private, max-age=300');res.end(req.method==='HEAD'?undefined:bytes);return;
    }
    const last=safePage.photoIds.at(-1);
    if(imageMode){
      if(!last || !/^[a-zA-Z0-9_-]{1,64}$/.test(last)){res.statusCode=404;res.end();return;}
      if(safePage.media?.[last]?.medium){res.statusCode=307;res.setHeader('Location',safePage.media[last].medium);res.setHeader('Cache-Control','public, max-age=60');res.end();return;}
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
    html=html.replace(/<title>[^<]*<\/title>/,()=>`<title>${esc(title)}</title>`).replace('</head>',()=>`<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(contentLink(id,false,origin,page.slug))}"><meta name="twitter:card" content="summary_large_image">${last?`<meta property="og:image" content="${esc(image)}"><meta name="twitter:image" content="${esc(image)}">`:''}</head>`);
    // The first screen is useful without JavaScript. Already-prepared covers
    // are embedded in HTML; cold preparation is bounded so it cannot stall it.
    html=creatorPreloads(html,safePage.kind);
    if(safePage.kind==='shop'){
      const covers={};
      if(req.method!=='HEAD' && !creatorHeroFiles(safePage).every(key=>safePage.media?.[key]||safePage.heroImages.some(image=>image.id===key))){
        let timer;
        await Promise.race([
          (async()=>{
            Object.assign(covers,await loadCovers(safePage,page));
          })().catch(()=>{}),
          new Promise(resolve=>{timer=setTimeout(resolve,1200);})
        ]).finally(()=>clearTimeout(timer));
      }
      const catalog=renderCreatorCatalog(safePage,{purchasedIds:new Set(safePage.sold.map(line=>line.id)),photo:(key,alt,options)=>creatorPhoto(safePage,key,alt,{...options,src:covers[key]})});
      const firstFrame=`<div class="shop-shell">${catalog}<div id="shop-image-errors"></div>${creatorHowTo(safePage)}<section class="shop-purchases" id="shop-purchases"><h2>Blerjet tuaja</h2>${creatorSoldCards(safePage,safePage.sold)||'<p>Pas porosisë, artikujt tuaj do të shfaqen këtu.</p>'}</section>${creatorFooter(safePage)}</div>`;
      html=html.replace(/(<main[^>]*id="content-app"[^>]*>)[\s\S]*?(<\/main>)/,(_,open,close)=>open+firstFrame+close);
    }
    if(safePage.kind!=='shop'){
      html=html.replace(/(<main[^>]*id="content-app"[^>]*>)[\s\S]*?(<\/main>)/,(_,open,close)=>open+renderCreatorPromo(safePage)+close);
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

