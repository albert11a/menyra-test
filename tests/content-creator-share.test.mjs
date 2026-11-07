import test from 'node:test';
import assert from 'node:assert/strict';
import {serveContentCreator} from '../api/content-creator.js';
import {parseHTML} from 'linkedom';
import {creatorPurchasePreloads,creatorPurchasePreview} from '../shared/content-creator-view.js';
const id='a'.repeat(32);
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}};}
test('Link preview includes last image and escaped locale name without recording a visit',async()=>{
 const paths=[],res=response();
 await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}`},res,{read:async path=>{paths.push(path);return {published:true,name:'Bistro <One>',photoIds:['first','last']};},shell:'<html><head><title>Default</title></head><body></body></html>'});
 assert.equal(res.statusCode,200);assert.match(res.body,/og:image/);assert.match(res.body,/photo=last/);assert.match(res.body,/Bistro &lt;One&gt;/);assert.equal(paths.length,1);
});
test('Social image endpoint serves the last photo, never the profile logo',async()=>{
 const paths=[],res=response();
 await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}&image=1`},res,{read:async path=>{paths.push(path);return path.includes('/images/')?{data:'data:image/jpeg;base64,YWJj'}:{published:true,photoIds:['first','last'],avatar:'logo'};}});
 assert.equal(res.headers['Content-Type'],'image/jpeg');assert.equal(res.body.toString(),'abc');assert.match(paths[1],/images\/last$/);
});
test('Drafts cannot be shared or read through the image endpoint',async()=>{
 for(const image of ['', '&image=1']){const res=response();await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}${image}`},res,{read:async()=>({published:false})});assert.equal(res.statusCode,404);}
});
test('Shop-Link-Vorschau liefert ausschließlich das Wasserzeichenbild',async()=>{
 const paths=[],res=response();
 await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}&image=1`},res,{read:async path=>{paths.push(path);return path.includes('/previews/')?{data:'data:image/jpeg;base64,YWJj'}:{published:true,kind:'shop',photoIds:['last']};}});
 assert.equal(res.statusCode,307);assert.match(res.headers.Location,/op=image/);assert.match(res.headers.Location,/display=3/);assert.equal(paths.length,1);
});


test('Gratis-Linkbild verweist ohne Wasserzeichen auf den erneut geprüften Original-Endpunkt',async()=>{
 const res=response();await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}&image=1`},res,{read:async()=>({published:true,kind:'shop',photoIds:['last'],products:[{id:'free',priceCents:0,imageIds:['last']}]})});
 assert.equal(res.statusCode,307);assert.match(res.headers.Location,/op=image/);assert.match(res.headers.Location,/file=last/);assert.equal(res.headers['Cache-Control'],'no-store');
});

test('Shop HTML includes actual first photos and a safe bootstrap before JavaScript',async()=>{
 const page={published:true,kind:'shop',name:'</script><img onerror=alert(1)> $&',photoIds:['first','second','hidden'],products:[{id:'free',priceCents:0,title:'Free',imageIds:['first','second']},{id:'paid',priceCents:190,title:'Paid',imageIds:['hidden']}],privateNote:'PRIVATE',originals:'SECRET',updatedAt:'2026-10-30T00:00:00Z'};
 const res=response();let reads=0;
 await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}`},res,{read:async()=>{reads++;return page;},loadCovers:async()=>({first:'data:image/webp;base64,YWJj',hidden:'data:image/webp;base64,ZGVm'}),shell:'<html><head><title>Default</title></head><body><main id="content-app">Loading</main></body></html>'});
 assert.equal(res.statusCode,200);assert.equal(reads,1);assert.match(res.body,/class="shop-product"/);assert.match(res.body,/src="data:image\/webp;base64,YWJj"/);assert.match(res.body,/src="data:image\/webp;base64,ZGVm"/);
 assert.doesNotMatch(res.body,/PRIVATE|SECRET|<img onerror/);assert.match(res.body,/data-deferred-src=/);assert.doesNotMatch(res.body,/Still|Demo/);
 const json=res.body.match(/id="creator-page-data"[^>]*>(.*?)<\/script>/s)[1];const parsed=JSON.parse(json);assert.equal(parsed.name,page.name);assert.equal(parsed.privateNote,undefined);assert.equal(parsed.originals,undefined);
});
test('Public JSON is allowlisted, never contains clean/private file metadata',async()=>{
 const res=response();await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}&format=json`},res,{read:async()=>({published:true,kind:'shop',name:'Test',photoIds:['one'],products:[],originals:{secret:true},customer:'PRIVATE'})});
 assert.equal(res.statusCode,200);assert.equal(res.headers['Content-Type'],'application/json');assert.doesNotMatch(res.body,/PRIVATE|originals/);
});


test('An active empty Working shop renders public HTML and JSON without photos, packages or cover',async()=>{
 const page={published:true,workflow:'working',kind:'shop',name:'Mama Mantia',avatar:'',photoIds:[],products:[]};
 for(const query of ['', '&format=json']){
  const res=response();await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}${query}`},res,{read:async()=>page,loadCovers:async()=>({}),shell:'<html><head><title>Default</title></head><body><main id="content-app">Loading</main></body></html>'});
  assert.equal(res.statusCode,200);assert.match(res.body,/Mama Mantia/);
  if(query){const json=JSON.parse(res.body);assert.equal(json.published,true);assert.deepEqual(json.products,[]);assert.deepEqual(json.photoIds,[]);}
  else {assert.match(res.body,/id="creator-page-data"/);assert.doesNotMatch(res.body,/>Loading<|src="undefined"/);}
 }
});

test('Live shop sends an empty response for an unchanged version and refreshes when a sale changes',async()=>{
 const page={published:true,kind:'shop',name:'Bistro',photoIds:['one'],products:[]};
 let sold=[];
 const options={read:async()=>page,loadSold:async()=>sold};
 async function live(version=''){
  const res=response();
  await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}&format=live&version=${version}`},res,options);
  return res;
 }
 const first=JSON.parse((await live()).body);
 const unchanged=await live(first.version);
 assert.equal(unchanged.statusCode,204);
 assert.equal(unchanged.body,undefined);
 sold=[{id:'pack',imageIds:['one'],downloadIds:['one']}];
 const changed=JSON.parse((await live(first.version)).body);
 assert.notEqual(changed.version,first.version);
 assert.deepEqual(changed.sold,sold);
});

test('Creator route preloads only the bundle needed for the first interaction',async()=>{
 const shell='<html><head><template data-creator-preload="shop"><link rel="modulepreload" href="/shop.js"></template><template data-creator-preload="photo-gallery"><link rel="modulepreload" href="/photos.js"></template></head><body><main id="content-app"></main></body></html>';
 for(const kind of ['shop','promo','photo-gallery']){
  const res=response();
  const url=kind==='photo-gallery'?'/api/content-creator?photos=1':`/api/content-creator?id=${id}`;
  await serveContentCreator({method:'GET',url},res,{shell,read:async()=>({published:true,kind,photoIds:[],products:[]})});
  assert.equal(res.body.includes('href="/shop.js"'),kind==='shop');
  assert.equal(res.body.includes('href="/photos.js"'),kind==='photo-gallery');
  assert.doesNotMatch(res.body,/<template/);
 }
});

test('First-visit HTML preloads the exact unchanged CDN previews before the purchase cards',async()=>{
 const original='https://menyra-media.alberthoti-vsa.workers.dev/media/social/owner/photo.jpg';
 const sold=[{id:'pack',title:'Photos',imageIds:['one','two','three'],downloadIds:['one','two','three'],deliveryMedia:{one:{url:original,thumb:true}}}];
 const res=response();
 await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}`},res,{
  read:async()=>({published:true,kind:'shop',name:'Bistro',photoIds:[],products:[]}),loadSold:async()=>sold,
  shell:'<html><head><title>Shop</title></head><body><main id="content-app"></main></body></html>'
 });
 const {document}=parseHTML(res.body),images=[...document.querySelectorAll('.shop-purchase-image img')],preloads=[...document.querySelectorAll('head link[rel="preload"][as="image"]')];
 assert.equal(res.statusCode,200);assert.equal(preloads.length,2);
 assert.deepEqual(preloads.map(node=>node.getAttribute('href')),images.slice(0,2).map(node=>node.getAttribute('src')));
 assert.equal(images[0].getAttribute('src'),original+'?w=240');
 assert.match(images[1].getAttribute('src'),/op=sold-preview/);
 assert.match(images[0].getAttribute('data-purchase-fallback'),/op=sold-preview/);
 const bootstrap=JSON.parse(document.getElementById('creator-page-data').textContent);
 assert.deepEqual(bootstrap.sold,sold);
});

test('Purchase preload budget spans packages and excludes unreleased files, videos and untrusted URLs',()=>{
 const page={id,mediaTypes:{video:'video'}};
 const lines=[{id:'first',imageIds:['private','video','one'],downloadIds:['video','one'],deliveryMedia:{one:{url:'https://example.com/original.jpg',thumb:true}}},{id:'second',imageIds:['one','two','three'],downloadIds:['one','two','three']}];
 assert.equal(creatorPurchasePreview(page,lines[0],'private'),null);
 assert.equal(creatorPurchasePreview(page,lines[0],'video'),null);
 const html=creatorPurchasePreloads(page,lines);
 const {document}=parseHTML('<html><head>'+html+'</head></html>');
 assert.equal(document.querySelectorAll('link').length,2);
 assert.doesNotMatch(html,/example\.com|file=private|file=video|file=three/);
 assert.match(html,/productId=first/);assert.match(html,/productId=second/);
});

test('Enabled Studio is in the first HTML response on shop and promo pages, including Heart preview',async()=>{
 const shell='<html><head><title>Default</title></head><body><main id="content-app">Loading</main></body></html>';
 for(const kind of ['shop','promo']){
  for(const enabled of [true,false]){
   const res=response();
   await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}&still=1`},res,{
    shell,read:async()=>({published:true,kind,name:'Studio Bistro',photoIds:[],products:[],photoStudioEnabled:enabled})
   });
   assert.equal(res.statusCode,200);
   const {document}=parseHTML(res.body);
   const entry=document.querySelector('.creator-studio-entry');
   assert.equal(!!entry,enabled);
   if(entry){
    assert.equal(entry.querySelector('a').getAttribute('href'),'/apps/content-creator/photo-studio.html?page='+id);
    assert.equal(entry.querySelector('a').textContent.trim(),'Ngarko fotot');
    assert.equal(entry.nextElementSibling.tagName,'FOOTER');
    if(kind==='shop')assert.equal(entry.previousElementSibling.id,'shop-purchases');
   }
  }
 }
});

test('Studio activation and deactivation invalidate the existing live shop version',async()=>{
 const page={published:true,kind:'shop',name:'Bistro',photoIds:[],products:[]};
 const live=async version=>{
  const res=response();
  await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}&format=live&version=${version}`},res,{read:async()=>page});
  assert.equal(res.statusCode,200);
  return JSON.parse(res.body);
 };
 const initial=await live('');
 assert.equal(initial.photoStudioEnabled,false);
 page.photoStudioEnabled=true;
 const enabled=await live(initial.version);
 assert.equal(enabled.photoStudioEnabled,true);
 page.photoStudioEnabled=false;
 const disabled=await live(enabled.version);
 assert.equal(disabled.photoStudioEnabled,false);
});

test('Sample pair displays original left and edit right after both approved CDN URLs are set',async()=>{
 const before='https://menyra-media.alberthoti-vsa.workers.dev/media/social/owner/before.webp';
 const after='https://menyra-media.alberthoti-vsa.workers.dev/media/social/owner/after.webp';
 const shell='<html><head><title>Default</title></head><body><main id="content-app">Loading</main></body></html>';
 for(const [sampleAfter,count] of [[after,2],['https://other.example/sample.webp',0],['',0]]){
  const res=response();
  await serveContentCreator({method:'GET',url:`/api/content-creator?id=${id}`},res,{
   shell,read:async()=>({published:true,kind:'shop',name:'Bistro',photoIds:[],products:[],photoStudioEnabled:true,photoStudioSamples:{before,after:sampleAfter}})
  });
  const {document}=parseHTML(res.body);
  const photos=[...document.querySelectorAll('.creator-studio-sample figure')];
  assert.equal(photos.length,count);
  if(count){
   assert.deepEqual(photos.map(photo=>photo.querySelector('img').getAttribute('src')),[before,after]);
   assert.deepEqual(photos.map(photo=>photo.querySelector('figcaption').textContent),['Origjinali','E përpunuar']);
  }
 }
});
