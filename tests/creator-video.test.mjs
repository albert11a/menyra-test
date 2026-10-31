import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {shopAction} from '../server/content-creator-shop.js';
import {serveCreatorShop} from '../api/content-creator-shop.js';
import {creatorPhoto,publicCreatorPage,renderCreatorCatalog} from '../shared/content-creator-view.js';
import {creatorIsVideo,creatorAssetCount} from '../shared/creator-video.js';
import {createCreatorVideoPlayback} from '../shared/creator-video-playback.js';
const pageId='a'.repeat(32),cartId='b'.repeat(32),orderId='c'.repeat(32),generation='d'.repeat(32);
function fixture(){
 const preview=Buffer.alloc(500005,77),original=Buffer.from('PRIVATE-ORIGINAL-WITH-AUDIO');
 const page={id:pageId,published:true,kind:'shop',name:'Video Shop',photoIds:['clip','photo'],mediaTypes:{clip:'video'},products:[{id:'p',title:'Reel',priceCents:1400,imageIds:['clip']}]};
 const base=`contentCreatorPages/${pageId}/originals/clip`;
 const docs=new Map([[`contentCreatorPages/${pageId}`,page],[base,{name:'reel.mov',mime:'video/quicktime',mediaType:'video',parts:1,size:original.length,videoPreview:{id:generation,mime:'video/mp4',mode:'marked',parts:2,size:preview.length}}],[`${base}/chunks/000`,{data:original.toString('base64')}]]);
 for(let i=0;i<2;i++)docs.set(`${base}/videoPreviews/${generation}/chunks/${String(i).padStart(3,'0')}`,{data:preview.subarray(i*400000,(i+1)*400000).toString('base64')});
 const reads=[],repo={read:async p=>{reads.push(p);return docs.get(p);},write:async(p,d)=>{docs.set(p,{...docs.get(p),...d});return true;},notify:async()=>true};
 return {page,base,docs,repo,reads,preview,original};
}
test('Public video card contains only lazy silent looping preview and poster, no controls or original URL',()=>{
 const f=fixture(),safe=publicCreatorPage(f.page,pageId),markup=creatorPhoto(safe,'clip','Reel');
 const node=parseHTML(markup).document.querySelector('video');assert.ok(node);
 for(const attr of ['muted','autoplay','loop','playsinline','disablepictureinpicture'])assert.ok(node.hasAttribute(attr),attr);
 assert.equal(node.hasAttribute('controls'),false);assert.equal(node.hasAttribute('src'),false);assert.equal(node.getAttribute('preload'),'none');
 assert.ok(node.getAttribute('data-video-src').includes('op=video'));assert.ok(node.hasAttribute('data-protected-preview'));assert.ok(node.getAttribute('data-video-poster').includes('op=image'));
 assert.equal(safe.mediaTypes.clip,'video');assert.equal(creatorIsVideo(safe,'clip'),true);assert.equal(creatorAssetCount(safe,['clip','photo']),'1 foto · 1 video');
 assert.match(renderCreatorCatalog(safe),/1 video · Cilësi origjinale/);assert.doesNotMatch(markup,/op=download|originals|PRIVATE/);
});
test('Video preview serves marked bytes only; a range reads only its private preview chunk',async()=>{
 const f=fixture(),r=await shopAction({op:'video',pageId,file:'clip',range:'bytes=400001-400004'},f.repo);
 assert.equal(r.status,206);assert.deepEqual(r.bytes,f.preview.subarray(400001,400005));
 assert.equal(f.reads.filter(p=>p.includes('/videoPreviews/')).length,1);assert.ok(f.reads.every(p=>!p.endsWith('/clip/chunks/000')));
 const suffix=await shopAction({op:'video',pageId,file:'clip',range:'bytes=-4'},f.repo);assert.equal(suffix.bytes.length,4);assert.equal(suffix.start,500001);
 for(const range of ['bytes=999999-','bytes=2-1','bytes=0-1,4-5','bytes=-0'])assert.equal((await shopAction({op:'video',pageId,file:'clip',range},f.repo)).status,416);
});
test('Unpublished, deleted, unlisted and foreign video previews remain inaccessible; clean paid preview is refused',async()=>{
 const f=fixture();await assert.rejects(shopAction({op:'video',pageId,file:'other'},f.repo));
 f.page.published=false;await assert.rejects(shopAction({op:'video',pageId,file:'clip'},f.repo));f.page.published=true;
 f.page.deleting=true;await assert.rejects(shopAction({op:'video',pageId,file:'clip'},f.repo));delete f.page.deleting;
 f.page.products[0].active=false;await assert.rejects(shopAction({op:'video',pageId,file:'clip'},f.repo));f.page.products[0].active=true;
 f.docs.get(f.base).videoPreview.mode='clean';await assert.rejects(shopAction({op:'video',pageId,file:'clip'},f.repo));
 f.page.products[0].priceCents=0;assert.deepEqual((await shopAction({op:'video',pageId,file:'clip'},f.repo)).bytes,f.preview);
});
test('Missing or corrupt preview chunks fail closed without falling back to the original',async()=>{
 const f=fixture();f.docs.delete(`${f.base}/videoPreviews/${generation}/chunks/001`);
 await assert.rejects(shopAction({op:'video',pageId,file:'clip'},f.repo));assert.ok(f.reads.every(p=>!p.endsWith('/clip/chunks/000')));
});
test('Paid video original retains bytes, MOV MIME and filename after checkout; foreign downloads stay blocked',async()=>{
 const f=fixture();await assert.rejects(shopAction({op:'download',orderId,file:'clip',format:'file'},f.repo));
 const order=await shopAction({op:'order',pageId,cartId,orderId,ids:['p'],expectedTotalCents:1400,customer:{name:'Video Test',phone:'00000000',address:'Test Street',country:'Kosovë'}},f.repo);
 assert.equal(order.downloadsAvailable,true);
 const result=await shopAction({op:'download',orderId,file:'clip',format:'file'},f.repo);assert.deepEqual(result.bytes,f.original);assert.equal(result.mime,'video/quicktime');assert.equal(result.name,'reel.mov');
 await assert.rejects(shopAction({op:'download',orderId,file:'foreign',format:'file'},f.repo));
 f.page.products[0].priceCents=0;
 assert.deepEqual((await shopAction({op:'free-download',pageId,productId:'p',file:'clip',format:'file'},f.repo)).bytes,f.original);
});
test('HTTP supports video Range and HEAD with the right lengths, MIME and range headers',async()=>{
 const f=fixture();
 async function request(method,range){const headers={},chunks=[],res={setHeader:(k,v)=>headers[k]=v,write:b=>chunks.push(b),end:b=>{if(b)chunks.push(Buffer.from(b));}};
 await serveCreatorShop({method,url:`/api/content-creator-shop?op=video&pageId=${pageId}&file=clip`,headers:{range}},res,async()=>f.repo);return {headers,body:Buffer.concat(chunks),status:res.statusCode};}
 const r=await request('GET','bytes=1-5');assert.equal(r.status,206);assert.equal(r.headers['Content-Range'],'bytes 1-5/500005');assert.equal(r.headers['Content-Length'],'5');assert.equal(r.headers['Content-Type'],'video/mp4');assert.equal(r.body.length,5);
 const h=await request('HEAD','bytes=1-5');assert.equal(h.status,206);assert.equal(h.body.length,0);assert.equal(h.headers['Content-Length'],'5');
 assert.equal((await request('GET','bytes=999999-')).status,416);
});
test('Visible current video starts muted, offscreen/background/covered videos pause without reloading',()=>{
 const {document,window}=parseHTML('<main><div data-track="p"><div><video data-creator-video data-video-src="/safe-preview"></video></div><div><video data-creator-video data-deferred-video="/second-preview"></video></div></div></main>');
 const root=document.querySelector('main'),track=root.querySelector('[data-track]'),videos=[...root.querySelectorAll('video')];Object.defineProperty(track,'clientWidth',{value:200});track.scrollLeft=0;
 let callback;class Observer{constructor(cb,options){if(!options.rootMargin)callback=cb;}observe(){}unobserve(){}disconnect(){}}
 for(const video of videos){video.paused=true;video.loads=0;video.load=()=>video.loads++;video.play=()=>{video.paused=false;return Promise.resolve();};video.pause=()=>{video.paused=true;};}
 const playback=createCreatorVideoPlayback(root,{windowObj:{IntersectionObserver:Observer},documentObj:document});playback.sync();assert.equal(videos[0].hasAttribute('src'),false);
 callback(videos.map(target=>({target,isIntersecting:true,intersectionRatio:1})));assert.equal(videos[0].paused,false);assert.equal(videos[0].muted,true);assert.equal(videos[1].hasAttribute('src'),false);
 playback.sync();assert.equal(videos[0].loads,1);
 track.scrollLeft=200;track.dispatchEvent(new window.Event('scroll',{bubbles:true}));assert.equal(videos[0].paused,true);assert.equal(videos[1].paused,false);
 root.setAttribute('inert','');playback.sync();assert.equal(videos[1].paused,true);root.removeAttribute('inert');playback.sync();assert.equal(videos[1].paused,false);
 Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new window.Event('visibilitychange'));assert.equal(videos[1].paused,true);
 playback.destroy();
});

test('Non-video order HTTP responses keep numeric 200 instead of the string order status',async()=>{
 const f=fixture(),headers={},response={setHeader:(k,v)=>headers[k]=v,end(body){this.body=body;}};
 await serveCreatorShop({method:'POST',body:{op:'order',pageId,cartId,orderId,ids:['p'],expectedTotalCents:1400,customer:{name:'Video Test',address:'Test Street',country:'Kosovë',phone:'00000000'}}},response,async()=>f.repo);
 assert.equal(response.statusCode,200);assert.equal(JSON.parse(response.body).status,'pending');
});
