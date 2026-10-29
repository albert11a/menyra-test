import test from 'node:test';
import assert from 'node:assert/strict';
import {serveContentCreator} from '../api/content-creator.js';
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
