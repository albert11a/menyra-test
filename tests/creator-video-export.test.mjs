import test from 'node:test';
import assert from 'node:assert/strict';
import {creatorVideoMime,normalizeCreatorAsset,validateCreatorAsset} from '../shared/creator-video.js';
import {CREATOR_MEDIA_ORIGIN as origin} from '../shared/creator-media.js';
import {creatorPreviewFile} from '../apps/mnyra-heart/heart-creator-video-download.js';

test('MOV from iOS Files preserves bytes and gains a canonical MIME',async()=>{
 for(const type of ['','application/octet-stream','video/x-quicktime','video/mov']){
  const file=new File(['mov-data'],'CLIP.MOV',{type,lastModified:123});
  const result=normalizeCreatorAsset(file);
  assert.equal(result.type,'video/quicktime');assert.equal(result.lastModified,123);
  assert.equal(await result.text(),'mov-data');
 }
 assert.equal(creatorVideoMime({name:'fake.mov',type:'text/html'}),'');
});
test('empty, unsupported and oversized files have distinct errors',()=>{
 assert.throws(()=>validateCreatorAsset({size:0,type:'video/quicktime'}),/leer/);
 assert.throws(()=>validateCreatorAsset({size:31*1024*1024,type:'video/quicktime'}),/31.0 MB.*30 MB/);
 assert.throws(()=>validateCreatorAsset({size:10,type:'text/html',name:'bad.mov'}),/Dateiformat/);
});
function page(mode='marked'){
 return {id:'page',kind:'shop',name:'Bells',photoIds:['clip'],products:[{id:'p',priceCents:mode==='marked'?3900:0,imageIds:['clip']}],media:{clip:{mode,mediaType:'video',thumb:`${origin}/media/social/owner/thumb.jpg`,medium:`${origin}/media/social/owner/medium.jpg`,large:`${origin}/media/social/owner/large.jpg`,video:`${origin}/media/stories/owner/full.mp4`,boomerang:`${origin}/media/stories/owner/loop.mp4`}}};
}
test('export uses the full marked video, preserving bytes and audio',async()=>{
 const p=page(),file=await creatorPreviewFile(p,'clip',{fetchFn:async url=>{assert.equal(url,p.media.clip.video);return new Response(new Blob(['marked-with-audio'],{type:'video/mp4'}));},loadOriginal:()=>assert.fail('Original must stay private')});
 assert.equal(await file.text(),'marked-with-audio');assert.match(file.name,/MNYRA_Preview.mp4$/);
});
test('free video is re-rendered with an explicit watermark rather than downloaded clean',async()=>{
 const original=new File(['original'],'clip.mov',{type:'video/quicktime'}),watermark=()=>{};
 const file=await creatorPreviewFile(page('clean'),'clip',{fetchFn:()=>assert.fail('Clean CDN must not be exported'),loadOriginal:async()=>original,watermark,prepareVideo:async(input,opts)=>{assert.equal(input,original);assert.equal(opts.free,false);assert.equal(opts.watermark,watermark);return {preview:new Blob(['marked'],{type:'video/webm'})};}});
 assert.equal(await file.text(),'marked');assert.match(file.name,/\.webm$/);
});
test('failed preview download never falls back to the clean original',async()=>{
 await assert.rejects(creatorPreviewFile(page(),'clip',{fetchFn:async()=>new Response('',{status:500}),loadOriginal:()=>assert.fail('No original fallback')}),/nicht geladen/);
});
