import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {createCreatorEngagement} from '../apps/content-creator/visits.js';
import {creatorActivity} from '../server/creator-activity.js';
import {serveCreatorShop} from '../api/content-creator-shop.js';
import {creatorVisitStats} from '../shared/creator-analytics.js';
import {creatorJourney} from '../apps/mnyra-heart/heart-creator-overview.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';
const pageId='a'.repeat(32),visitorId='b'.repeat(32),sessionId='c'.repeat(32),eventId='d'.repeat(32);
function measurement(markup='<img data-photo="one">'){
 const {document,window}=parseHTML(`<html><body><main>${markup}</main></body></html>`),root=document.querySelector('main');
 document.visibilityState='visible';let time=Date.parse('2026-11-01T10:00:00Z');
 for(const node of root.querySelectorAll('[data-photo]')){Object.assign(node,{complete:true,naturalWidth:300});node.getBoundingClientRect=()=>({left:0,top:0,right:300,bottom:400,width:300,height:400});}
 const windowObj={innerWidth:390,innerHeight:844,scrollY:0};
 Object.defineProperty(document.documentElement,'scrollHeight',{value:1688});
 const tracker=createCreatorEngagement({root,documentObj:document,windowObj,now:()=>time});
 return {document,window,root,tracker,windowObj,tick(ms=500){time+=ms;tracker.sample();},snapshot:()=>structuredClone(tracker.snapshot())};
}
test('Only loaded, visible media counts; return exposures add views, hidden tabs and overlays pause time',()=>{
 const m=measurement();m.tick();assert.equal(m.snapshot().media.length,0);m.tick();
 assert.equal(m.snapshot().media[0].views,1);assert.equal(m.snapshot().media[0].durationMs,1000);
 m.root.setAttribute('inert','');m.tick();m.root.removeAttribute('inert');m.tick();m.tick();
 assert.equal(m.snapshot().media[0].views,2);assert.equal(m.snapshot().media[0].durationMs,2000);
 m.document.visibilityState='hidden';const before=m.snapshot().activeMs;m.tick(10000);assert.equal(m.snapshot().activeMs,before);
 m.document.visibilityState='visible';m.tracker.resume();m.root.querySelector('img').complete=false;m.tick();m.tick();assert.equal(m.snapshot().media[0].views,2);
});
test('Viewport-sized visibility supports tall mobile photos and rejects offscreen slides',()=>{
 const m=measurement('<img data-photo="one"><img data-photo="two">');
 m.root.children[0].getBoundingClientRect=()=>({left:0,top:0,right:300,bottom:1200,width:300,height:1200});
 m.root.children[1].getBoundingClientRect=()=>({left:370,top:0,right:670,bottom:400,width:300,height:400});
 m.tick();m.tick();assert.deepEqual(m.snapshot().media.map(item=>item.file),['one']);
 m.windowObj.scrollY=422;m.tick();assert.equal(m.snapshot().scrollDepth,50);
});
test('Video cover visibility is distinct from advancing playback; pause, buffering and seeking do not add playback',()=>{
 const m=measurement('<img data-video-cover data-photo="cover"><video data-photo="movie"></video>'),video=m.root.querySelector('video');
 Object.assign(video,{paused:true,currentTime:0,readyState:4,duration:10});m.tick();m.tick();assert.equal(m.snapshot().media.length,1);assert.equal(m.snapshot().media[0].event,'cover');
 video.paused=false;m.tick();video.currentTime=.5;m.tick();video.currentTime=1;m.tick();
 let media=m.snapshot().media.find(item=>item.event==='video');assert.equal(media.durationMs,1000);m.tick();m.tick();assert.equal(m.snapshot().media.find(item=>item.event==='video').durationMs,1000);
 video.dispatchEvent(new m.window.Event('seeking',{bubbles:true}));video.currentTime=9.8;m.tick();assert.equal(m.snapshot().media.find(item=>item.event==='video').durationMs,1000);
 video.currentTime=0.2;m.tick();assert.equal(m.snapshot().media.find(item=>item.event==='video').completions,1);
 video.paused=true;m.tick();m.tick();assert.equal(m.snapshot().media.find(item=>item.event==='video').durationMs,1500);
});
function fixture(){
 const page={id:pageId,published:true,kind:'shop',name:'Cafe',photoIds:['one','movie'],mediaTypes:{movie:'video'},products:[{id:'pack',title:'Paket',imageIds:['one','movie'],priceCents:2900}]};
 const docs=new Map([[`contentCreatorPages/${pageId}`,page]]);
 const repo={read:async key=>docs.get(key),write:async(key,data)=>{docs.set(key,{...docs.get(key),...structuredClone(data)});return true;}};
 const session={sessionId,sequence:1,startedAt:'2026-11-01T10:00:00Z',activeMs:5000,elapsedMs:10000,scrollDepth:60,stageMs:{page:3000,cart:2000},media:[{file:'one',productId:'pack',event:'photo',views:2,durationMs:3000}],events:[{id:eventId,event:'photo',file:'one',productId:'pack',at:'2026-11-01T10:00:01Z',durationMs:3000}]};
 return {page,docs,repo,session,path:`contentCreatorVisits/${pageId}_${visitorId}`};
}
test('Session snapshots and actions are idempotent; old sequences cannot roll back time, repeat visits remain visible',async()=>{
 const f=fixture(),input={pageId,visitorId,event:'open',session:f.session,actions:[{id:'e'.repeat(32),event:'cart',ids:['pack'],at:'2026-11-01T10:00:04Z'}]};
 await creatorActivity(input,f.repo,'2026-11-01T10:00:10Z');await creatorActivity(input,f.repo,'2026-11-01T10:00:11Z');
 let visit=f.docs.get(f.path);assert.equal(visit.events.length,2);assert.equal(visit.activeMs,5000);assert.equal(visit.sessionCount,1);assert.equal(visit.events[1].lines[0].priceCents,2900);
 f.session.sequence=2;f.session.activeMs=6000;await creatorActivity(input,f.repo,'2026-11-01T10:00:12Z');
 await creatorActivity({...input,session:{...f.session,sequence:1,activeMs:1000}},f.repo,'2026-11-01T10:00:13Z');assert.equal(f.docs.get(f.path).activeMs,6000);
 await creatorActivity({...input,session:{...f.session,sessionId:'f'.repeat(32),sequence:1}},f.repo,'2026-11-01T11:00:00Z');
 visit=f.docs.get(f.path);assert.equal(visit.sessionCount,2);assert.equal(creatorVisitStats([visit]).returns,1);
 const html=renderContentCreator({pages:[f.page],visits:[visit],filter:'seen'});assert.match(html,/Zuletzt: 01.11.26/);assert.match(html,/2 Besuche · 1 Wiederbesuche/);
 const journey=creatorJourney(f.page,{visits:[visit]});assert.match(journey,/Foto angesehen · 4×/);assert.match(journey,/Shporta: Paket/);
});
test('API only trusts platform location headers, decodes city names and leaves unavailable location unknown',async()=>{
 const f=fixture();let output;
 const response={setHeader(){},end(value){output=JSON.parse(value);}};
 const body={op:'visit',pageId,visitorId,event:'open',location:{city:'Invented',country:'XX'}};
 await serveCreatorShop({method:'POST',url:'/',headers:{'x-vercel-ip-country':'AT','x-vercel-ip-city':'Sankt%20P%C3%B6lten'},body},response,async()=>f.repo);
 assert.equal(output.ok,true);assert.deepEqual(f.docs.get(f.path).location,{country:'AT',city:'Sankt Pölten',approximate:true});
 await serveCreatorShop({method:'POST',url:'/',headers:{},body:{...body,visitorId:'e'.repeat(32)}},response,async()=>f.repo);
 assert.equal(f.docs.get(`contentCreatorVisits/${pageId}_${'e'.repeat(32)}`).location,undefined);
});
test('Unknown media and hostile metadata are rejected or bounded; legacy durations are not invented',async()=>{
 const f=fixture();f.session.media.push({file:'secret',event:'video',durationMs:1e10});f.session.media[0].durationMs=1e10;
 await creatorActivity({pageId,visitorId,session:f.session,location:{city:'<bad>\n',country:'AT'}},f.repo,'2026-11-01T10:00:10Z');
 assert.equal(f.docs.get(f.path).sessions[0].media.length,1);assert.equal(f.docs.get(f.path).sessions[0].media[0].durationMs,5000);
 assert.match(creatorJourney(f.page,{visits:[{pageId,visitorId,opened:true,updatedAt:'2026-11-01T10:00:10Z'}]}),/keine Dauer erfasst/);
});
test('An unload snapshot retains older media totals; concurrent visitor writes retry without duplicating events',async()=>{
 const f=fixture();const input={op:'visit',pageId,visitorId,session:f.session};
 await creatorActivity(input,f.repo,'2026-11-01T10:00:10Z');
 await creatorActivity({...input,session:{...f.session,sequence:2,media:[]}},f.repo,'2026-11-01T10:00:11Z');
 assert.equal(f.docs.get(f.path).sessions[0].media[0].views,2);
 let conflicts=0;const repo={...f.repo,write:async(...args)=>{if(conflicts++===0)throw Object.assign(Error('conflict'),{code:'CREATOR_VISIT_CONFLICT'});return f.repo.write(...args);}};
 const {shopAction}=await import('../server/content-creator-shop.js');
 await shopAction({...input,session:{...f.session,sequence:3}},repo);
 assert.equal(conflicts,2);assert.equal(f.docs.get(f.path).events.length,1);assert.equal(f.docs.get(f.path).sessionCount,1);
});
test('Lifecycle flush starts while a preceding normal request is blocked, with a bounded keepalive body',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=(await readFile(new URL('../apps/content-creator/visits.js',import.meta.url),'utf8')).replace(/export (async )?function /g,'$1function ');
 const {document}=parseHTML('<html><body><main id="content-app"></main></body></html>');
 const listeners={},calls=[];let release;
 const viewport={setInterval:()=>0,addEventListener:(name,fn)=>{listeners[name]=fn;}};
 const install=new Function('globalThis','document','localStorage','fetch',`${source}\nreturn installCreatorVisits;`)(viewport,document,{getItem:()=>visitorId},async(url,options)=>{calls.push(options);if(calls.length===1)await new Promise(resolve=>{release=resolve;});return {ok:true,json:async()=>({ok:true})};});
 const tracker=await install({id:pageId});await new Promise(resolve=>setImmediate(resolve));
 const pending=tracker.track('cart',{ids:['pack'],stage:'cart'});
 listeners.pagehide({persisted:true});assert.equal(calls.length,2);assert.equal(calls[1].keepalive,true);assert.ok(Buffer.byteLength(calls[1].body)<48000);
 assert.equal(JSON.parse(calls[1].body).online,false);release();await pending;
});
