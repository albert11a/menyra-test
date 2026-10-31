import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHmac,webcrypto} from 'node:crypto';
import worker from '../cloudflare-edge/menyra-media-worker.js';
import {creatorPublicMedia,creatorVideoMediaUrl,CREATOR_MEDIA_ORIGIN} from '../shared/creator-media.js';
import {creatorVideoUrl} from '../shared/creator-video.js';
import {renderCreatorCatalog} from '../shared/content-creator-view.js';
import {createCreatorVideoPlayback} from '../shared/creator-video-playback.js';
import {parseHTML} from 'linkedom';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
function fixture(){
 const bytes=Buffer.from('0123456789'),stored=[],reads=[],cached=[];
 const metadata={size:bytes.length,httpEtag:'"test"',writeHttpMetadata:headers=>headers.set('content-type','video/mp4')};
 const env={MEDIA_ACTION_TICKET_SECRET:'synthetic-secret',MEDIA_BUCKET:{put:async(...args)=>stored.push(args),head:async()=>metadata,get:async(key,opts)=>{reads.push(opts);return {...metadata,body:opts?.range?bytes.subarray(opts.range.offset,opts.range.offset+opts.range.length):bytes};}}};
 globalThis.caches={default:{match:async()=>null,put:async(...args)=>cached.push(args)}};
 const ctx={waitUntil(){}};
 function token(action='image_upload',ownerId='ceo'){const iat=Math.floor(Date.now()/1000),payload=Buffer.from(JSON.stringify({v:1,iat,exp:iat+300,action,ownerId})).toString('base64url');return `${payload}.${createHmac('sha256',env.MEDIA_ACTION_TICKET_SECRET).update(payload).digest('base64url')}`;}
 const request=(req)=>worker.fetch(req,env,ctx);
 const media=(method='GET',range)=>request(new Request(`${CREATOR_MEDIA_ORIGIN}/media/social/ceo/test.mp4`,{method,headers:range?{range}:{}}));
 return {env,request,media,stored,reads,cached,token};
}
test('Existing photo upload accepts correctly typed videos with the same owner ticket, prefix and permanent cache',async()=>{
 const f=fixture();
 async function upload(token,mime='video/mp4'){
  const body=new FormData();body.set('restaurantId','ceo');body.set('file',new Blob(['baked marked derivative'],{type:mime}),'preview.mp4');
  return f.request(new Request(CREATOR_MEDIA_ORIGIN+'/image/upload',{method:'POST',headers:token?{Authorization:`Bearer ${token}`}:{},body}));
 }
 assert.equal((await upload()).status,401);assert.equal((await upload(f.token('story_upload'))).status,403);assert.equal((await upload(f.token('image_upload','other'))).status,403);
 assert.equal((await upload(f.token(),'application/octet-stream')).status,400);assert.equal(f.stored.length,0);
 const response=await upload(f.token());assert.equal(response.status,200);
 const result=await response.json();assert.ok(creatorVideoMediaUrl(result.url));assert.match(f.stored[0][0],/^social\/ceo\//);
 assert.equal(f.stored[0][2].httpMetadata.cacheControl,'public, max-age=31536000, immutable');
});
test('The same endpoint still accepts photo uploads with the existing image ticket',async()=>{
 const f=fixture(),body=new FormData();body.set('restaurantId','ceo');body.set('file',new Blob(['PHOTO'],{type:'image/jpeg'}),'photo.jpg');
 const response=await f.request(new Request(CREATOR_MEDIA_ORIGIN+'/image/upload',{method:'POST',headers:{Authorization:`Bearer ${f.token()}`},body}));
 assert.equal(response.status,200);assert.match((await response.json()).url,/\/media\/social\/ceo\/.*\.jpg$/);
 assert.equal(f.stored[0][2].httpMetadata.contentType,'image/jpeg');
});
test('R2 video serves bounded, open-ended and suffix ranges, HEAD and invalid ranges without caching partial bodies',async()=>{
 const f=fixture();
 const full=await f.media();assert.equal(full.status,200);assert.equal(await full.text(),'0123456789');assert.equal(full.headers.get('content-length'),'10');assert.equal(f.cached.length,1);
 for(const [range,body,contentRange] of [['bytes=0-1','01','bytes 0-1/10'],['bytes=7-','789','bytes 7-9/10'],['bytes=-3','789','bytes 7-9/10']]){
  const r=await f.media('GET',range);assert.equal(r.status,206);assert.equal(await r.text(),body);assert.equal(r.headers.get('content-range'),contentRange);assert.equal(r.headers.get('accept-ranges'),'bytes');
 }
 const entire=await f.media('GET','bytes=0-');assert.equal(entire.status,206);assert.equal(f.cached.length,2);assert.equal(f.cached[1][1].status,200);assert.equal(f.cached[1][1].headers.get('content-range'),null);
 const reads=f.reads.length,h=await f.media('HEAD','bytes=2-4');assert.equal(h.status,206);assert.equal(h.headers.get('content-length'),'3');assert.equal(await h.text(),'');assert.equal(f.reads.length,reads);
 for(const range of ['bytes=20-','bytes=-0','bytes=4-2','bytes=0-1,3-4']){const r=await f.media('GET',range);assert.equal(r.status,416);assert.equal(r.headers.get('content-range'),'bytes */10');}
});
test('Paid manifest exposes only marked owned R2 boomerang/full URLs; card and viewer choose different derivatives',()=>{
 const base=CREATOR_MEDIA_ORIGIN+'/media/',record={mode:'marked',mediaType:'video',video:base+'social/ceo/full.mp4',boomerang:base+'social/ceo/boom.mp4',...Object.fromEntries(['thumb','medium','large'].map(size=>[size,base+`social/ceo/${size}.webp`]))};
 const page={id:'a'.repeat(32),kind:'shop',name:'Video',photoIds:['clip'],mediaTypes:{clip:'video'},products:[{id:'p',title:'Clip',priceCents:100,imageIds:['clip']}],media:{clip:record}};
 assert.equal(creatorVideoUrl(page,'clip'),record.boomerang);assert.equal(creatorVideoUrl(page,'clip',{viewer:true}),record.video);
 const html=renderCreatorCatalog(page);assert.ok(html.includes(record.boomerang));assert.ok(html.includes('m16 8 6-4v16l-6-4'));assert.ok(html.includes(`poster="${record.medium}"`));
 page.media.clip={...record,mode:'clean'};assert.deepEqual(creatorPublicMedia(page),{});assert.ok(!creatorVideoUrl(page,'clip').includes('/media/social/'));
 for(const url of ['https://evil.invalid/media/social/ceo/full.mp4',record.video+'?token=secret',base+'stories/ceo/full.mp4'])assert.equal(creatorVideoMediaUrl(url),'');
});
test('Opening viewer starts audible video from the tap; cards stay silent and covered/background/removed media stop',()=>{
 const {document}=parseHTML('<main><div data-view-track><div><video data-creator-video data-video-viewer data-video-src="/full"></video></div></div></main>'),root=document.querySelector('main'),video=root.querySelector('video');
 let plays=0;video.load=()=>{};video.play=()=>{plays++;video.paused=false;return Promise.resolve();};video.pause=()=>{video.paused=true;};
 const playback=createCreatorVideoPlayback(root,{windowObj:{IntersectionObserver:class{observe(){}disconnect(){}unobserve(){}}},documentObj:document});playback.sync();assert.equal(plays,0);playback.openViewer();assert.equal(plays,1);assert.equal(video.muted,false);assert.equal(video.controls,true);assert.equal(video.loop,false);
 Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});playback.sync();assert.equal(video.paused,true);
 video.remove();playback.sync();assert.equal(video.paused,true);playback.destroy();
});

test('Client uploads video and boomerang through the exact photo endpoint and owner ticket, with real video MIME',async()=>{
 const source=(await readFile(new URL('../apps/mnyra-heart/heart-creator-cdn.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ');
 const uploads=[],urls=[];
 const fetch=async(url,options)=>{
  urls.push(url);
  if(url==='https://ticket.invalid'){
   assert.deepEqual(JSON.parse(options.body),{action:'image_upload',restaurantId:'ceo'});
   return Response.json({ticket:'photo-ticket'});
  }
  assert.equal(url,CREATOR_MEDIA_ORIGIN+'/image/upload');assert.equal(options.headers.Authorization,'Bearer photo-ticket');
  assert.equal(options.body.get('restaurantId'),'ceo');const file=options.body.get('file');assert.equal(file.type,'video/mp4');uploads.push(await file.text());
  return Response.json({url:CREATOR_MEDIA_ORIGIN+`/media/social/ceo/${uploads.length}.mp4`});
 };
 const upload=new Function('auth','BUNNY_EDGE_BASE','MEDIA_TICKET_ENDPOINT','creatorVideoMediaUrl','creatorMediaUrl','creatorVariants','fetch',`${source}\nreturn uploadCreatorVideo;`)({currentUser:{uid:'ceo',getIdToken:async()=>'firebase-token'}},CREATOR_MEDIA_ORIGIN,'https://ticket.invalid',creatorVideoMediaUrl,null,null,fetch);
 const result=await upload({preview:new Blob(['MARKED-AUDIO'],{type:'video/mp4'}),boomerang:new Blob(['MARKED-BOOMERANG'],{type:'video/mp4'})});
 assert.deepEqual(uploads,['MARKED-AUDIO','MARKED-BOOMERANG']);assert.ok(creatorVideoMediaUrl(result.video));assert.ok(creatorVideoMediaUrl(result.boomerang));
 assert.equal(urls.some(url=>url.includes('/creator/video/')),false);
});
