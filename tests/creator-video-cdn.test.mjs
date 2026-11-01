import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHmac,webcrypto} from 'node:crypto';
import worker from '../cloudflare-edge/menyra-media-worker.js';
import {creatorPublicMedia,creatorVideoMediaUrl,CREATOR_MEDIA_ORIGIN} from '../shared/creator-media.js';
import {creatorVideoUrl} from '../shared/creator-video.js';
import {renderCreatorCatalog} from '../shared/content-creator-view.js';
import {createCreatorVideoPlayback} from '../shared/creator-video-playback.js';
import {createMediaUploadRuntimeController} from '../apps/menyra-social/core/media/media-upload-runtime-controller.js';
import {parseHTML} from 'linkedom';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
function fixture(){
 const stored=[],bytes=Buffer.from('0123456789'),metadata={size:10,httpEtag:'"test"',writeHttpMetadata:h=>h.set('content-type','video/mp4')};
 const env={MEDIA_ACTION_TICKET_SECRET:'synthetic-secret',MEDIA_BUCKET:{put:async(...args)=>stored.push(args),get:async()=>({...metadata,body:bytes})}};
 globalThis.caches={default:{match:async()=>null,put:async()=>{}}};
 function token(action='story_upload',ownerId='managed-business'){const iat=Math.floor(Date.now()/1000),payload=Buffer.from(JSON.stringify({v:1,iat,exp:iat+300,action,ownerId})).toString('base64url');return `${payload}.${createHmac('sha256',env.MEDIA_ACTION_TICKET_SECRET).update(payload).digest('base64url')}`;}
 return {stored,token,request:req=>worker.fetch(req,env,{waitUntil(){}})};
}
test('Unmodified menu video endpoint accepts video with the existing business-owner story ticket',async()=>{
 const f=fixture();
 async function upload(token,mime='video/mp4'){
  const body=new FormData();body.set('restaurantId','managed-business');body.set('file',new Blob(['marked derivative'],{type:mime}),'preview.mp4');
  return f.request(new Request(CREATOR_MEDIA_ORIGIN+'/story/upload',{method:'POST',headers:token?{Authorization:`Bearer ${token}`}:{},body}));
 }
 assert.equal((await upload()).status,401);assert.equal((await upload(f.token('image_upload'))).status,403);assert.equal((await upload(f.token('story_upload','other'))).status,403);
 assert.equal((await upload(f.token(),'image/jpeg')).status,400);assert.equal(f.stored.length,0);
 const r=await upload(f.token());assert.equal(r.status,200);assert.ok(creatorVideoMediaUrl((await r.json()).url));
 assert.match(f.stored[0][0],/^stories\/managed-business\//);assert.equal(f.stored[0][2].httpMetadata.contentType,'video/mp4');
 assert.equal(f.stored[0][2].httpMetadata.cacheControl,'public, max-age=86400');
});
test('Existing Worker still serves old video objects; 24-hour cache lifetime does not delete or expire the object',async()=>{
 const f=fixture();const r=await f.request(new Request(CREATOR_MEDIA_ORIGIN+'/media/stories/managed-business/1-old.mp4'));
 assert.equal(r.status,200);assert.equal(await r.text(),'0123456789');assert.equal(r.headers.get('cache-control'),'public, max-age=86400');
 assert.equal(r.headers.get('content-type'),'video/mp4');
});
test('Paid manifest stays protected; catalog uses a poster and only the viewer selects full video',()=>{
 const base=CREATOR_MEDIA_ORIGIN+'/media/',record={mode:'marked',mediaType:'video',video:base+'stories/business/full.mp4',boomerang:base+'stories/business/boom.mp4',...Object.fromEntries(['thumb','medium','large'].map(size=>[size,base+`social/ceo/${size}.webp`]))};
 const page={id:'a'.repeat(32),kind:'shop',name:'Video',photoIds:['clip'],mediaTypes:{clip:'video'},products:[{id:'p',title:'Clip',priceCents:100,imageIds:['clip']}],media:{clip:record}};
 assert.equal(creatorVideoUrl(page,'clip'),record.boomerang);assert.equal(creatorVideoUrl(page,'clip',{viewer:true}),record.video);
 const html=renderCreatorCatalog(page);assert.ok(!html.includes(record.boomerang));assert.ok(!html.includes(record.video));assert.ok(!html.includes('<video'));assert.ok(html.includes('data-video-cover'));assert.ok(html.includes('m16 8 6-4v16l-6-4'));assert.ok(html.includes(`src="${record.thumb}"`));
 page.media.clip={...record,mode:'clean'};assert.deepEqual(creatorPublicMedia(page),{});assert.ok(!creatorVideoUrl(page,'clip').includes('/media/stories/'));
 for(const url of ['https://evil.invalid/media/stories/business/full.mp4',record.video+'?token=secret',base+'social/ceo/full.mp4'])assert.equal(creatorVideoMediaUrl(url),'');
});
test('Opening viewer starts audible video from the tap; cards stay silent and covered/background/removed media stop',()=>{
 const {document}=parseHTML('<main><div data-view-track><div><video data-creator-video data-video-viewer data-video-src="/full"></video></div></div></main>'),root=document.querySelector('main'),video=root.querySelector('video');
 let plays=0;video.load=()=>{};video.play=()=>{plays++;video.paused=false;return Promise.resolve();};video.pause=()=>{video.paused=true;};
 const playback=createCreatorVideoPlayback(root,{windowObj:{IntersectionObserver:class{observe(){}disconnect(){}unobserve(){}}},documentObj:document});playback.sync();assert.equal(plays,0);playback.openViewer();assert.equal(plays,1);assert.equal(video.muted,false);assert.equal(video.controls,true);assert.equal(video.loop,false);
 Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});playback.sync();assert.equal(video.paused,true);video.remove();playback.sync();assert.equal(video.paused,true);playback.destroy();
});
const cdnSource=(await readFile(new URL('../apps/mnyra-heart/heart-creator-cdn.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ').replace("await import('../menyra-social/core/media/media-upload-runtime-controller.js')",'({createMediaUploadRuntimeController:menuUploader})').replace("await import('./heart-creator-video-optimize.js')",'({requestCreatorVideoOptimization:optimizeMock})');
function client({owner='managed-business',rejectUpload=false}={}){
 const uploads=[],calls=[],queries=[];
 const auth={currentUser:{uid:'ceo',getIdToken:async()=>'firebase-token'}};
 const fetch=async(url,options)=>{
  calls.push(url);
  if(url==='https://ticket.invalid'){
   assert.deepEqual(JSON.parse(options.body),{action:'story_upload',restaurantId:owner});assert.equal(options.headers.Authorization,'Bearer firebase-token');return Response.json({ticket:'existing-menu-ticket'});
  }
  assert.equal(url,CREATOR_MEDIA_ORIGIN+'/story/upload');assert.equal(options.headers.Authorization,'Bearer existing-menu-ticket');assert.equal(options.body.get('restaurantId'),owner);
  if(rejectUpload)return Response.json({error:'Forbidden'},{status:403});
  const file=options.body.get('file');assert.equal(file.type,'video/mp4');uploads.push(await file.text());
  return Response.json({url:CREATOR_MEDIA_ORIGIN+`/media/stories/${owner}/${uploads.length}.mp4`});
 };
 const api=new Function('auth','db','collection','query','where','limit','getDocs','BUNNY_EDGE_BASE','MEDIA_TICKET_ENDPOINT','creatorVideoMediaUrl','fetch','menuUploader','optimizeMock',`${cdnSource}\nreturn {uploadCreatorVideo,creatorVideoOwner};`)(auth,{},(_db,name)=>name,(...args)=>args,(...args)=>args,count=>count,async q=>{queries.push(q);return {docs:owner?[{id:owner}]:[]};},CREATOR_MEDIA_ORIGIN,'https://ticket.invalid',creatorVideoMediaUrl,fetch,createMediaUploadRuntimeController,async(video,actualOwner)=>{assert.equal(actualOwner,owner);return {video,webVideoVersion:1,videoBytes:10,videoSourceBytes:20};});
 return {...api,queries,calls,uploads};
}
const prepared=()=>({preview:new Blob(['MARKED-AUDIO'],{type:'video/mp4'}),boomerang:new Blob(['MARKED-BOOMERANG'],{type:'video/mp4'})});
test('Creator executes the actual menu video uploader with a managed business; no photo-route workaround or Story writes',async()=>{
 const c=client();const result=await c.uploadCreatorVideo(prepared());assert.deepEqual(c.uploads,['MARKED-AUDIO','MARKED-BOOMERANG']);
 assert.equal(result.webVideoVersion,1);assert.equal(result.videoBytes,10);assert.ok(creatorVideoMediaUrl(result.video));assert.ok(creatorVideoMediaUrl(result.boomerang));assert.equal(c.queries.length,1);
 assert.deepEqual(c.queries[0],['restaurants',['createdByUid','==','ceo'],1]);
 await c.uploadCreatorVideo(prepared());assert.equal(c.queries.length,1);
 assert.ok(c.calls.every(url=>url==='https://ticket.invalid'||url===CREATOR_MEDIA_ORIGIN+'/story/upload'));
});
test('Missing managed business fails before upload instead of using the CEO uid or another unauthorized owner',async()=>{
 const c=client({owner:''});await assert.rejects(c.uploadCreatorVideo(prepared()),/Betrieb/);assert.equal(c.calls.length,0);
 const self=client({owner:'ceo'});await assert.rejects(self.uploadCreatorVideo(prepared()),/Betrieb/);assert.equal(self.calls.length,0);
});
test('Rejected existing menu upload invalidates the owner cache, so a retry can resolve current ownership',async()=>{
 const c=client({rejectUpload:true});await assert.rejects(c.uploadCreatorVideo(prepared()),/Forbidden/);assert.equal(c.queries.length,1);
 await assert.rejects(c.uploadCreatorVideo(prepared()),/Forbidden/);assert.equal(c.queries.length,2);assert.equal(c.uploads.length,0);
});
