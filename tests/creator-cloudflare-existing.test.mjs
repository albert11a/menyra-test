import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {creatorMediaUrl,creatorVariants,creatorPublicMedia,CREATOR_MEDIA_ORIGIN} from '../shared/creator-media.js';
import {shopAction} from '../server/content-creator-shop.js';
import {publicCreatorPage,creatorImageUrl,renderCreatorCatalog} from '../shared/content-creator-view.js';
const pageId='a'.repeat(32),productId='b'.repeat(32),orderId='c'.repeat(32),file='photo';
const source=(await readFile(new URL('../apps/mnyra-heart/heart-creator-cdn.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ');
function setup({failOriginal=false}={}){
 const uploads=[],calls=[],uid='test-ceo';
 const fetch=async(url,options)=>{
  calls.push(url);
  if(url.startsWith('data:'))return globalThis.fetch(url);
  if(url==='https://tickets.invalid/issueMediaActionTicket'){
   assert.deepEqual(JSON.parse(options.body),{action:'image_upload',restaurantId:uid});
   assert.equal(options.headers.Authorization,'Bearer firebase-user-token');
   return Response.json({ticket:'existing-image-ticket'});
  }
  assert.equal(url,CREATOR_MEDIA_ORIGIN+'/image/upload');
  assert.equal(options.headers.Authorization,'Bearer existing-image-ticket');
  assert.equal(options.body.get('restaurantId'),uid);
  const blob=options.body.get('file');uploads.push({name:blob.name,data:await blob.text()});
  if(blob.name==='original.jpg'&&failOriginal)throw Error('Optional original upload failed');
  return Response.json({url:`${CREATOR_MEDIA_ORIGIN}/media/social/${uid}/${uploads.length}.${blob.type==='image/webp'?'webp':'jpg'}`});
 };
 const api=new Function('auth','BUNNY_EDGE_BASE','MEDIA_TICKET_ENDPOINT','creatorVariants','creatorMediaUrl','fetch',`${source}\nreturn {creatorCdnEnabled,uploadCreatorMedia};`)({currentUser:{uid,getIdToken:async()=> 'firebase-user-token'}},CREATOR_MEDIA_ORIGIN,'https://tickets.invalid/issueMediaActionTicket',creatorVariants,creatorMediaUrl,fetch);
 const displays=Object.fromEntries(['thumb','medium','large'].map(size=>[size,Object.fromEntries(['clean','marked'].map(mode=>[mode,`data:image/webp;base64,${Buffer.from(`${mode}-${size}`).toString('base64')}`]))]));
 return {api,uploads,calls,displays};
}
test('Already deployed image upload works without a Worker status route, new bucket or activation',async()=>{
 const ctx=setup();assert.equal(await ctx.api.creatorCdnEnabled(),true);assert.equal(ctx.calls.length,0);
 const result=await ctx.api.uploadCreatorMedia(pageId,file,new File(['private-original'],'original.jpg',{type:'image/jpeg'}),ctx.displays);
 assert.ok(creatorVariants(result.media));assert.equal(result.media.mode,'marked');assert.equal(ctx.uploads.length,3);
 assert.deepEqual(ctx.uploads.map(upload=>upload.data).sort(),['marked-large','marked-medium','marked-thumb']);
 assert.equal(result.media.download,undefined);assert.equal('original' in result,false);
 assert.ok(ctx.calls.filter(url=>!url.startsWith('data:')).every(url=>url.includes('/image/upload')||url.includes('/issueMediaActionTicket')));
});
test('Only explicitly free originals are copied to the existing public media endpoint',async()=>{
 const ctx=setup();const result=await ctx.api.uploadCreatorMedia(pageId,file,new File(['free-original'],'original.jpg',{type:'image/jpeg'}),ctx.displays,{free:true});
 assert.equal(ctx.uploads.length,4);assert.ok(ctx.uploads.some(upload=>upload.data==='free-original'));assert.ok(creatorMediaUrl(result.media.download));
 const failed=setup({failOriginal:true});const fallback=await failed.api.uploadCreatorMedia(pageId,file,new File(['free-original'],'original.jpg',{type:'image/jpeg'}),failed.displays,{free:true});
 assert.ok(creatorVariants(fallback.media));assert.equal(fallback.media.download,undefined);
 const large=setup();const oversized=await large.api.uploadCreatorMedia(pageId,file,{size:16*1024*1024},large.displays,{free:true});assert.ok(creatorVariants(oversized.media));assert.equal(large.uploads.length,3);
});
test('Paid originals keep the established order, payment and private chunk checks',async()=>{
 const order={pageId,approved:false,paymentConfirmed:false,status:'pending',lines:[{imageIds:[file]}]};
 const docs=new Map([[`contentCreatorOrders/${orderId}`,order],[`contentCreatorPages/${pageId}/originals/${file}`,{parts:1,size:3,mime:'image/jpeg',name:'photo.jpg'}],[`contentCreatorPages/${pageId}/originals/${file}/chunks/000`,{data:'YWJj'}]]);
 const repo={read:async path=>docs.get(path)},input={op:'download',orderId,file,format:'file'};
 await assert.rejects(shopAction(input,repo));order.approved=true;await assert.rejects(shopAction(input,repo));
 order.paymentConfirmed=true;order.status='released';assert.equal((await shopAction(input,repo)).bytes.toString(),'abc');
 await assert.rejects(shopAction({...input,file:'other'},repo));
});
test('Public manifests expose only the current permitted preview and never a paid original URL',()=>{
 const media={mode:'marked',bytes:100,...Object.fromEntries(['thumb','medium','large'].map(size=>[size,`${CREATOR_MEDIA_ORIGIN}/media/social/ceo/${size}.webp`])),download:`${CREATOR_MEDIA_ORIGIN}/media/social/ceo/original.jpg`};
 const page={kind:'shop',photoIds:[file],products:[{id:productId,priceCents:10,imageIds:[file]}],media:{[file]:media}};
 assert.equal(creatorImageUrl({...page,id:pageId},file),media.thumb);
 assert.equal(JSON.stringify(publicCreatorPage(page,pageId)).includes('original.jpg'),false);
 assert.equal((renderCreatorCatalog({...page,id:pageId}).match(/fetchpriority="high"/g)||[]).length,1);
 page.media[file].mode='clean';assert.deepEqual(creatorPublicMedia(page),{});
 page.media[file]={...media,thumb:'https://attacker.invalid/photo.jpg'};assert.deepEqual(creatorPublicMedia(page),{});
});
test('Free original redirects still require current publication, free price and exact package membership',async()=>{
 const download=`${CREATOR_MEDIA_ORIGIN}/media/social/ceo/original.jpg`;
 const page={published:true,kind:'shop',photoIds:[file],products:[{id:productId,priceCents:0,imageIds:[file]}],media:{[file]:{mode:'clean',download,...Object.fromEntries(['thumb','medium','large'].map(size=>[size,`${CREATOR_MEDIA_ORIGIN}/media/social/ceo/${size}.webp`]))}}};
 const repo={read:async()=>page},input={op:'free-download',pageId,productId,file,format:'file'};
 assert.deepEqual(await shopAction(input,repo),{redirect:download});
 page.published=false;await assert.rejects(shopAction(input,repo));page.published=true;
 page.products[0].priceCents=10;await assert.rejects(shopAction(input,repo));page.products[0].priceCents=0;
 await assert.rejects(shopAction({...input,file:'other'},repo));
});
