import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {loadProductMedia,mediaVersion,readProduct,PRODUCT_ASSETS} from '../server/lifeskin-product-media.js';
import {serveProductPhoto} from '../api/lifeskin-product-photo.js';
import {serveProductMedia} from '../api/lifeskin-product-media.js';
import {catalogMediaUrls,productImageVariant,storefrontProducts} from '../shared/lifeskin-storefront.js';
import {Storefront} from '../apps/lifeskin-shop/storefront.js';
globalThis.__LIFESKIN_TEST__=true;
const {Dyqan}=await import('../apps/lifeskin-shop/shop.js');
const data=n=>`data:image/jpeg;base64,${Buffer.from('photo-'+n).toString('base64')}`;
const fields=value=>Object.fromEntries(Object.entries(value).map(([k,v])=>[k,Array.isArray(v)?{arrayValue:{values:v.map(x=>({stringValue:x}))}}:{stringValue:v}]));
const response=(value,status=200)=>({ok:status===200,status,json:async()=>({fields:fields(value)})});
function res(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}};}
const main=id=>`/api/lifeskin-product-photo?id=${id}&w=480`;

test('media manifest groups all exact-product Heart galleries, deduplicates bytes and never reads patient data',async()=>{
  const urls=[];
  const result=await loadProductMedia('lf-acne',async raw=>{
    urls.push(raw);const path=new URL(raw).pathname;
    if(path.includes('/products/'))return response({photoRef:data(1),availability:'visible'});
    if(path.endsWith('landingFotot-lf-acne'))return response({fotot:[data(1),data(2)]});
    if(path.endsWith('analyseFotot-lf-acne'))return response({bilder:[data(2),data(3)]});
    if(path.endsWith('shopProduktFoto-lf-acne'))return response({foto:data(4)});
    throw Error('unexpected document');
  },{assets:false});
  assert.equal(result.images.length,4);assert.deepEqual(result.images.map(x=>x.source),['primary','landing','analysis','shop']);
  assert.ok(urls.every(u=>/\/(products\/lf-acne|config\/(landingFotot|analyseFotot|shopProduktFoto)-lf-acne)\?/.test(u)));
  assert.ok(urls.every(u=>! /sessions|reports|medien/.test(u)));
  assert.ok(PRODUCT_ASSETS['lf-acne'].every(name=>name.includes('lf-acne')&&!name.includes('klein')));
  assert.equal(result.partial,false);
});
test('invalid or hidden products do not expose galleries; transient failures remain retryable',async()=>{
  assert.equal(await loadProductMedia('../sessions',()=>{throw Error('must not read');}),null);
  let calls=0;
  const hidden=await loadProductMedia('hidden',async()=>{calls++;return response({availability:'hidden'});},{assets:false});
  assert.equal(hidden.hidden,true);assert.equal(calls,1);
  const partial=await loadProductMedia('new-product',async url=>{
    if(url.includes('/products/'))return response({photoRef:data(1),availability:'visible'});
    throw Error('offline');
  },{assets:false});
  assert.equal(partial.partial,true);assert.equal(partial.images.length,1);
});
test('public source requests are coalesced inside a worker',async()=>{
  const previous=globalThis.fetch;let calls=0,finish;
  globalThis.fetch=async()=>{calls++;await new Promise(r=>finish=r);return response({photoRef:data(7),availability:'visible'});};
  try{const first=readProduct('cache-fixture'),second=readProduct('cache-fixture');finish();assert.deepEqual(await first,await second);await readProduct('cache-fixture');assert.equal(calls,1);}finally{globalThis.fetch=previous;}
});
test('binary delivery is resized WebP; matching revisions are immutable and old revisions are rejected',async()=>{
  const buffer=await sharp({create:{width:600,height:800,channels:3,background:'#abc'}}).png().toBuffer();
  const version=mediaVersion({buffer});
  let out=res();await serveProductPhoto({method:'GET',url:`/?id=p&source=landing&index=0&v=${version}&w=240`},out,async()=>({buffer}));
  assert.equal(out.statusCode,200);assert.equal(out.headers['Content-Type'],'image/webp');assert.match(out.headers['Cache-Control'],/immutable/);
  assert.equal((await sharp(out.body).metadata()).width,240);
  const etag=out.headers.ETag;out=res();await serveProductPhoto({method:'GET',url:`/?id=p&v=${version}&w=240`,headers:{'if-none-match':etag}},out,async()=>({buffer}));
  assert.equal(out.statusCode,304);assert.equal(out.body,undefined);
  out=res();await serveProductPhoto({method:'GET',url:'/?id=p&v=old'},out,async()=>({buffer}));assert.equal(out.statusCode,404);assert.equal(out.headers['Cache-Control'],'no-store');
});
test('manifest only sends compact same-product URLs, preserving the exact card URL for the first photo',async()=>{
  const out=res();await serveProductMedia({method:'GET',url:'/?id=p'},out,async()=>({images:[{source:'primary',index:0,version:'a'},{source:'analysis',index:1,version:'b'}]}));
  const value=JSON.parse(out.body);assert.equal(value.images[0],main('p'));assert.ok(value.images[1].includes('source=analysis'));assert.doesNotMatch(out.body,/base64/);
  assert.deepEqual(catalogMediaUrls('other',value),[]);
  assert.deepEqual(catalogMediaUrls('p',{id:'p',images:[main('p'),main('other'),'https://evil.invalid/x','data:image/png;base64,AAAA']}),[main('p')]);
  assert.match(productImageVariant(value.images[1],240),/v=b&w=240$/);
});
test('gallery fetches share one request, preserve the main URL and retry after errors',async()=>{
  let calls=0,release;const pending=new Promise(r=>release=r);
  const shop=new Dyqan({dokument:{querySelector:()=>null},speicher:null,dauerSpeicher:null,holen:async()=>{calls++;await pending;return {ok:true,json:async()=>({id:'p',complete:true,images:[main('p'),main('p')+'&source=landing&index=0']})};}});
  shop.catalogProducts=[{id:'p',images:[main('p')]}];
  const a=shop.catalogFotosLaden('p'),b=shop.catalogFotosLaden('p');assert.equal(a,b);release();assert.equal(await a,true);assert.equal(calls,1);
  assert.equal(shop.catalogProducts[0].images[0],main('p'));assert.equal(shop.catalogProducts[0].images.length,2);
  assert.equal(await shop.catalogFotosLaden('p'),false);assert.equal(calls,1);
  shop.catalogProducts=[{id:'q',images:[main('q')]}];let tries=0;shop.holen=async()=>{tries++;throw Error('offline');};
  await shop.catalogFotosLaden('q');await shop.catalogFotosLaden('q');assert.equal(tries,2);assert.deepEqual(shop.catalogProducts[0].images,[main('q')]);
});
test('unrelated renders do not replace catalog image elements',()=>{
  let writes=0;const grid={setAttribute(){},set innerHTML(_){writes++;}},nodes={'sf-grid':grid,'sf-catalog-error':{},'sf-results':{}};
  const doc={getElementById:id=>nodes[id],querySelector:()=>null,querySelectorAll:()=>[]};
  const sf=new Storefront({dok:doc,catalogReady:true,catalogProducts:storefrontProducts([{id:'p',name:'P',einzelpreis:5}],new Map(),{deferredImages:true})});sf.renderCart=()=>{};
  sf.render();sf.render();assert.equal(writes,1);sf.search='missing';sf.render();assert.equal(writes,2);
});
test('gallery metadata appends slides without replacing the decoded main photo or moving the viewport',()=>{
  const first={setAttribute(){}},extra={setAttribute(){}};const track={children:[first],appendChild(n){this.children.push(n);}};
  const root={querySelector:selector=>selector==='.sf-gallery-track'?track:null,appendChild(){},set innerHTML(_){throw Error('visible gallery was rebuilt');}};
  const doc={querySelector:()=>root,createElement:()=>({content:{querySelector:selector=>selector==='.sf-gallery-track'?{children:[{},extra]}:null},set innerHTML(_){}})};
  const sf=new Storefront({dok:doc});sf.activeProduct={images:[main('p'),main('p')+'&source=landing']};sf.quantity=3;sf.syncGallery=()=>{};
  sf.refreshGallery();assert.equal(track.children[0],first);assert.equal(track.children[1],extra);assert.equal(sf.quantity,3);
});

test('partial manifest retries keep previously loaded pictures and append recovered sources',async()=>{
  const shop=new Dyqan({dokument:{querySelector:()=>null},speicher:null,dauerSpeicher:null});
  const old=main('p')+'&source=landing&index=0',recovered=main('p')+'&source=analysis&index=0';
  shop.catalogProducts=[{id:'p',images:[main('p'),old]}];
  shop.holen=async()=>({ok:true,json:async()=>({id:'p',complete:false,images:[main('p'),recovered]})});
  assert.equal(await shop.catalogFotosLaden('p'),true);
  assert.deepEqual(shop.catalogProducts[0].images,[main('p'),old,recovered]);
  assert.equal(shop.catalogProducts[0].galleryLoaded,false);
});
