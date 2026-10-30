import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import worker from '../cloudflare-edge/menyra-media-worker.js';
import {CREATOR_MEDIA_ORIGIN,creatorVariants,creatorPublicMedia} from '../shared/creator-media.js';
import {publicCreatorPage,creatorImageUrl,renderCreatorCatalog} from '../shared/content-creator-view.js';
import {shopAction} from '../server/content-creator-shop.js';
const pageId='a'.repeat(32),productId='b'.repeat(32),orderId='c'.repeat(32),file='photo';
const uid='aklBkkIuZ7Nrpx266TJn63rrxX62',secret='unit-test-secret';
function ticket(actor=uid,exp=Math.floor(Date.now()/1000)+120){
 const payload=Buffer.from(JSON.stringify({v:1,action:'image_upload',uid:actor,ownerId:actor,iat:Math.floor(Date.now()/1000),exp})).toString('base64url');
 return `${payload}.${createHmac('sha256',secret).update(payload).digest('base64url')}`;
}
function bucket(){
 const files=new Map();let reads=0;
 return {files,reads:()=>reads,async put(key,data,options){files.set(key,{data:new Uint8Array(data),...options});},async head(key){const entry=files.get(key);return entry?{size:entry.data.length,httpMetadata:entry.httpMetadata}:null;},async get(key){reads++;const entry=files.get(key);return entry?{body:entry.data,size:entry.data.length,httpMetadata:entry.httpMetadata}:null;}};
}
function environment(){return {CREATOR_CDN_ENABLED:'1',MEDIA_ACTION_TICKET_SECRET:secret,MEDIA_BUCKET:bucket(),CREATOR_PRIVATE_BUCKET:bucket()};}
function request(path,options={}){return new Request(CREATOR_MEDIA_ORIGIN+path,options);}
async function upload(env,actor=uid){
 const form=new FormData();form.set('pageId',pageId);form.set('imageId',file);form.set('mode','marked');
 form.set('original',new File(['original bytes'],'original.jpg',{type:'image/jpeg'}));
 for(const size of ['thumb','medium','large'])form.set(size,new File([size],'display.webp',{type:'image/webp'}));
 return worker.fetch(request('/creator/upload',{method:'POST',headers:{Authorization:`Bearer ${ticket(actor)}`},body:form}),env,{});
}

test('New routes are off by default and require a private R2 binding',async()=>{
 for(const env of [{...environment(),CREATOR_CDN_ENABLED:undefined},{...environment(),CREATOR_PRIVATE_BUCKET:undefined}]){
  assert.equal((await (await worker.fetch(request('/creator/status'),env,{})).json()).creatorCdn,0);
  assert.equal((await upload(env)).status,503);
 }
});
test('Existing signed media tickets authorize only the CEO, before writing any objects',async()=>{
 const env=environment();assert.equal((await upload(env,'other-user')).status,403);
 assert.equal((await worker.fetch(request('/creator/upload',{method:'POST'}),env,{})).status,401);
 assert.equal(env.MEDIA_BUCKET.files.size,0);assert.equal(env.CREATOR_PRIVATE_BUCKET.files.size,0);
});
test('Upload stores exact originals privately and publishes only prepared marked variants',async()=>{
 const env=environment(),response=await upload(env);assert.equal(response.status,200);
 const record=await response.json();assert.ok(creatorVariants(record.media));assert.equal(record.media.mode,'marked');assert.equal(record.media.bytes,14);
 assert.equal(env.MEDIA_BUCKET.files.size,3);assert.equal(env.CREATOR_PRIVATE_BUCKET.files.size,1);
 assert.equal(Buffer.from(env.CREATOR_PRIVATE_BUCKET.files.get(record.original.key).data).toString(),'original bytes');
 assert.ok([...env.MEDIA_BUCKET.files.keys()].every(key=>key.startsWith('creator-public/')));
 assert.equal(env.CREATOR_PRIVATE_BUCKET.files.get(record.original.key).httpMetadata.cacheControl,'private, no-store');
});
test('Private keys are rejected by the public route before cache lookup, including encoded prefixes',async()=>{
 const before=globalThis.caches;let hits=0;globalThis.caches={default:{match:async()=>{hits++;return new Response('secret');}}};
 try{for(const prefix of ['creator-private','%63reator-private']){
  const response=await worker.fetch(request(`/media/${prefix}/${pageId}/photo/revision.jpg`),environment(),{});
  assert.equal(response.status,404);
 }assert.equal(hits,0);}finally{globalThis.caches=before;}
});
test('Download authorizes against the fixed origin, streams private R2 bytes, and never caches originals',async()=>{
 const env=environment(),record=await (await upload(env)).json(),originalFetch=globalThis.fetch;let called;
 globalThis.fetch=async url=>{called=new URL(url);return Response.json({r2:record.original});};
 try{
  const response=await worker.fetch(request(`/creator/download?pageId=${pageId}&productId=${productId}&file=${file}&url=https://attacker.invalid&key=arbitrary`),env,{});
  assert.equal(response.status,200);assert.equal(await response.text(),'original bytes');
  assert.equal(called.origin,'https://www.mnyra.com');assert.equal(called.pathname,'/api/content-creator-shop');assert.equal(called.searchParams.get('format'),'authorize-r2');assert.equal(called.searchParams.has('url'),false);assert.equal(called.searchParams.has('key'),false);
  assert.match(response.headers.get('cache-control'),/private, no-store/);
  assert.equal(env.MEDIA_BUCKET.reads(),0);
  globalThis.fetch=async()=>new Response('{}',{status:403});
  assert.equal((await worker.fetch(request(`/creator/download?pageId=${pageId}&productId=${productId}&file=${file}`),env,{})).status,403);
  assert.equal(env.CREATOR_PRIVATE_BUCKET.reads(),1);
 }finally{globalThis.fetch=originalFetch;}
});
test('R2 authorization preserves current free membership and exact paid release checks',async()=>{
 const key=`creator-private/${pageId}/${file}/revision.jpg`,r2={key,mime:'image/jpeg',size:5,name:'photo.jpg'};
 const page={published:true,kind:'shop',photoIds:[file],products:[{id:productId,imageIds:[file],priceCents:0}]};
 const order={pageId,approved:false,paymentConfirmed:false,status:'pending',lines:[{imageIds:[file]}]};
 const docs=new Map([[`contentCreatorPages/${pageId}`,page],[`contentCreatorPages/${pageId}/originals/${file}`,{r2}],[`contentCreatorOrders/${orderId}`,order]]);
 const repo={read:async path=>docs.get(path)};
 const free={op:'free-download',pageId,productId,file,format:'authorize-r2'};
 assert.deepEqual(await shopAction(free,repo),{r2});
 const link=await shopAction({...free,format:'file'},repo);assert.ok(link.redirect.startsWith(CREATOR_MEDIA_ORIGIN+'/creator/download?'));
 page.products[0].priceCents=1;await assert.rejects(shopAction(free,repo));
 const paid={op:'download',orderId,file,format:'authorize-r2'};await assert.rejects(shopAction(paid,repo));
 order.approved=true;await assert.rejects(shopAction(paid,repo));order.paymentConfirmed=true;order.status='released';
 assert.deepEqual(await shopAction(paid,repo),{r2});
 docs.set(`contentCreatorPages/${pageId}/originals/${file}`,{r2:{...r2,key:`creator-private/${'d'.repeat(32)}/${file}/revision.jpg`}});
 await assert.rejects(shopAction(paid,repo));
});
test('Public manifests cannot leak private keys, paid clean URLs, inactive assets or foreign hosts',()=>{
 const variants={mode:'marked',bytes:100,thumb:`${CREATOR_MEDIA_ORIGIN}/media/creator-public/${pageId}/photo/revision_thumb.webp`,medium:`${CREATOR_MEDIA_ORIGIN}/media/creator-public/${pageId}/photo/revision_medium.webp`,large:`${CREATOR_MEDIA_ORIGIN}/media/creator-public/${pageId}/photo/revision_large.webp`};
 const page={kind:'shop',photoIds:[file],products:[{id:productId,priceCents:10,imageIds:[file]}],media:{[file]:{...variants,key:'secret'}}};
 assert.equal(creatorImageUrl({...page,id:pageId},file),variants.thumb);
 assert.equal(JSON.stringify(publicCreatorPage(page,pageId)).includes('secret'),false);
 page.media[file].mode='clean';assert.deepEqual(creatorPublicMedia(page),{});
 page.media[file]={...variants,thumb:'https://attacker.invalid/media/photo.webp'};assert.deepEqual(creatorPublicMedia(page),{});
 page.media[file]=variants;page.products[0].active=false;assert.deepEqual(creatorPublicMedia(page),{});
 page.products[0].active=true;
 const html=renderCreatorCatalog({...page,id:pageId});assert.equal((html.match(/fetchpriority="high"/g)||[]).length,1);
});
