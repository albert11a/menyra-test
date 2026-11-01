import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {creatorPublicMedia,CREATOR_MEDIA_ORIGIN} from '../shared/creator-media.js';
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator-shop.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export \{.*\n/gm,'').replace(/export (async )?function /g,'$1function ').replace("await import('./heart-creator-video-optimize.js')",'({requestCreatorVideoOptimization:optimize})');
function harness({concurrent=false,deleting=false,fail=false}={}){
 const base=CREATOR_MEDIA_ORIGIN+'/media/',video=base+'stories/owner/source.mp4';
 const media={mode:'marked',mediaType:'video',video,boomerang:base+'stories/owner/boom.mp4',...Object.fromEntries(['thumb','medium','large'].map(x=>[x,base+`social/owner/${x}.jpg`]))};
 const page={kind:'shop',photoIds:['clip'],products:[{id:'p',priceCents:100,imageIds:['clip']}],media:{clip:media}};
 const writes=[],calls=[],progress=[];
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 const getDoc=async()=>({data:()=>structuredClone(page)});
 const optimize=async(...args)=>{calls.push(args);if(fail)throw Error('offline');if(concurrent)page.media.clip.video=base+'stories/owner/newer.mp4';if(deleting)page.deleting=true;return {video:base+'stories/owner/web.mp4',webVideoVersion:1,videoBytes:40,videoSourceBytes:100};};
 const transaction={get:getDoc,set:(path,value)=>writes.push({path,value}),update:(path,value)=>{writes.push({path,value});if(value['media.clip'])page.media.clip=value['media.clip'];}};
 const runTransaction=async(_db,fn)=>fn(transaction);
 const api=new Function('auth','db','doc','getDoc','creatorPublicMedia','creatorVideoOwner','optimize','runTransaction','serverTimestamp','CC_PAGES',`${source}\nreturn optimizeCreatorPageVideos;`)({currentUser:{uid:'ceo'}},{},doc,getDoc,creatorPublicMedia,async()=> 'owner',optimize,runTransaction,()=> 'now','contentCreatorPages');
 return {page,writes,calls,progress,run:()=>api('page',(...args)=>progress.push(args))};
}
test('Existing migration only replaces the video derivative and persists completion once',async()=>{
 const h=harness(),before=structuredClone(h.page.media.clip);await h.run();assert.equal(h.writes.length,2);
 const after=h.page.media.clip;for(const field of ['thumb','medium','large','boomerang','mode'])assert.equal(after[field],before[field]);assert.equal(after.webVideoVersion,1);
 assert.ok(h.writes.every(w=>!w.path.includes('originals')));assert.deepEqual(h.progress,[[0,1],[1,1]]);
 await h.run();assert.equal(h.calls.length,1);
});
test('Concurrent replacement or business deletion cannot be overwritten by completed optimization',async()=>{
 for(const options of [{concurrent:true},{deleting:true}]){const h=harness(options);await h.run();assert.equal(h.writes.length,0);}
});
test('Failed optimization leaves the current working derivative intact and retryable',async()=>{
 const h=harness({fail:true}),before=structuredClone(h.page);await assert.rejects(h.run(),/offline/);assert.deepEqual(h.page,before);assert.equal(h.writes.length,0);
});
