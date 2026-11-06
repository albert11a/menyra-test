import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {creatorOrderedDelivery,creatorPackageFiles,creatorWatermarkOpacity,shopQuote} from '../shared/content-creator-shop.js';
import {publicCreatorPage,creatorPurchasePhotos,renderCreatorCatalog} from '../shared/content-creator-view.js';
import {recordCreatorPhotoViews} from '../server/creator-photo-views.js';
import {guardedCreatorWrite} from '../server/creator-guarded-write.js';

const id='a'.repeat(32),path=`contentCreatorPages/${id}`;
const samplePage=()=>({published:true,kind:'shop',photoIds:['one','two','three','video'],
 products:[{id:'paid',priceCents:200,imageIds:['one','two','video']},{id:'sold',priceCents:200,imageIds:['three']}],
 mediaTypes:{video:'video'}});

test('Package display order changes across shop, quote and delivery without changing purchase membership',()=>{
 const page=samplePage();
 const receipt={id:'paid',title:'Test',imageIds:['one','two','old'],downloadIds:['one','two','old']};
 assert.deepEqual(creatorPackageFiles(page,page.products[0]),['one','two','video']);
 page.packagePhotoOrder={paid:['two','missing','one','two','video']};
 assert.deepEqual(creatorPackageFiles(page,page.products[0]),['two','one','video']);
 assert.deepEqual(shopQuote(page,['paid']).lines[0].imageIds,['two','one','video']);
 assert.deepEqual(creatorOrderedDelivery(page,['one','three','two','old']),['two','three','one','old']);
 const safePage=publicCreatorPage(page,id),catalog=renderCreatorCatalog(safePage);
 assert.match(catalog,/data-track="paid"[\s\S]*data-photo="two"[\s\S]*data-photo="one"/);
 const purchase=creatorPurchasePhotos(safePage,receipt);
 assert.match(purchase,/data-file="two"[\s\S]*data-file="one"[\s\S]*data-file="old"/);
 assert.deepEqual(receipt.imageIds,['one','two','old']);
 assert.deepEqual(receipt.downloadIds,['one','two','old']);
});

test('Only valid, visible-surface member IDs reach the deduplicated server write',async()=>{
 const session='b'.repeat(32),token='c'.repeat(32),calls=[];
 const repo={read:async name=>name===path?samplePage():name.endsWith(token)?{files:['old','one']}:null,countPhotoViews:async(...args)=>calls.push(args)};
 await recordCreatorPhotoViews({pageId:id,session,files:['one','two','one','video','unknown']},repo);
 await recordCreatorPhotoViews({pageId:id,session,token,files:['one','old','two']},repo);
 await recordCreatorPhotoViews({pageId:id,session,token:'d'.repeat(32),files:['one']},repo);
 assert.deepEqual(calls.map(call=>call[2]),[['one','two'],['one','old']]);
 assert.equal(calls[0][1],calls[1][1]);
 assert.notEqual(calls[0][1],session);
 await assert.rejects(recordCreatorPhotoViews({pageId:id,session,files:Array(33).fill('one')},repo));
});

test('Session dedup and counters share a guarded Firestore commit',async()=>{
 const writes=[{update:{name:'session'},currentDocument:{exists:false}},{transform:{document:'counter'}}];
 let commit,rolledBack=false;
 const fetchFn=async (url,request)=>{
  if(url.endsWith(':beginTransaction'))return Response.json({transaction:'transaction'});
  if(url.endsWith(':batchGet'))return Response.json([{found:{fields:{published:{booleanValue:true}}}}]);
  if(url.endsWith(':rollback')){rolledBack=true;return Response.json({});}
  commit=JSON.parse(request.body);
  return Response.json({error:{status:'FAILED_PRECONDITION'}},{status:400});
 };
 await assert.rejects(guardedCreatorWrite({base:'https://test/documents',headers:{},pagePath:path,writes,conflictRetry:true,fetchFn}),{code:'CREATOR_VISIT_CONFLICT'});
 assert.deepEqual(commit,{transaction:'transaction',writes});
 assert.equal(rolledBack,true);
});

test('Watermark stages only unsold paid photos and publishes together, reusing work after interruption',async()=>{
 const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator-shop.js',import.meta.url),'utf8'))
  .replace(/^import .*;\n/gm,'').replace(/^export \{.*\n/gm,'').replace(/export (async )?function /g,'$1function ');
 const a=samplePage();a.watermarkOpacity=15;
 const b={...samplePage(),watermarkOpacity:15};
 const calls=[],writes=[];
 const doc=(...args)=>args.filter(arg=>typeof arg==='string').join('/');
 const getDoc=async name=>({data:()=>name===path?a:name.endsWith('/chunks/000')?{data:btoa('x')}:{parts:1,size:1,mime:'image/jpeg'}});
 let fail=true;
 const upload=async (_page,file,_original,displays,options)=>{
  calls.push([file,displays.thumb.opacity,options]);
  if(file==='two'&&fail)throw Error('Offline');
  return {media:{thumb:file}};
 };
 class TestImage{width=50;height=60;async decode(){}}
 const ctx={save(){},restore(){},translate(){},rotate(){},measureText(){return {width:14};},fillText(){},drawImage(){}};
 const document={createElement:()=>({getContext:()=>ctx,toDataURL:()=> 'data:image/webp;base64,eA=='})};
 const apply=new Function('db','CC_PAGES','doc','getDoc','Image','document','uploadCreatorMedia','runTransaction','serverTimestamp','deleteField','creatorWatermarkOpacity',`${source}\nreturn applyShopWatermark;`)(
  {},'contentCreatorPages',doc,getDoc,TestImage,document,upload,async (_db,work)=>work({
   get:getDoc,set:(...args)=>writes.push(args),update:(name,data)=>{assert.equal(name,path);writes.push([name,data]);}
  }),()=>0,()=>null,creatorWatermarkOpacity);
 await assert.rejects(apply(id,45,{sold:new Set(['sold'])}),/Offline/);
 assert.equal(writes.length,0);
 fail=false;await apply(id,45,{sold:new Set(['sold'])});
 assert.deepEqual(calls.map(call=>call[0]),['one','two','two']);
 assert.ok(calls.every(([,opacity,options])=>opacity===45&&options.previewOnly));
 assert.deepEqual(writes.slice(0,2).map(([name])=>name),[`${path}/images/one`,`${path}/images/two`]);
 assert.equal(writes.at(-1)[1].watermarkOpacity,45);
 assert.equal(b.watermarkOpacity,15);
 assert.equal(creatorWatermarkOpacity(0),0);
 assert.equal(creatorWatermarkOpacity(),20);
});

test('Photo tracking requires a continuous second and deduplicates catalogue and fullscreen',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date'],now:100000});
 const nodes=[],timers=t.mock.timers;
 let visible=true;
 const sent=[];
 const observerInstances=[];
 class Observer{
  constructor(callback){this.callback=callback;observerInstances.push(this);}
  observe(){} unobserve(){} takeRecords(){return [];}
 }
 const events={};
 const storage=new Map();
 const localStorage={getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)};
 const doc={get visibilityState(){return visible?'visible':'hidden';},hasFocus:()=>visible,documentElement:{clientWidth:400,clientHeight:400},
  addEventListener:(event,listener)=>{events[event]=listener;},
  defaultView:{addEventListener(){},getComputedStyle:()=>({visibility:'visible',opacity:'1'})}};
 const root={ownerDocument:doc,querySelector:()=>null,querySelectorAll:()=>nodes,contains:node=>nodes.includes(node),addEventListener(){}};
 const photo=id=>({dataset:{photo:id},getBoundingClientRect:()=>({width:400,height:800}),complete:true,naturalWidth:400,closest:()=>null});
 nodes.push(photo('a'),photo('b'),photo('c'),photo('a'));
 const source=(await readFile(new URL('../apps/content-creator/photo-views.js',import.meta.url),'utf8')).replace('export function','function');
 const install=new Function('IntersectionObserver','MutationObserver','navigator','localStorage','fetch',`${source}\nreturn installCreatorPhotoViews;`)(
  Observer,class{observe(){}},{},localStorage,async(_url,request)=>{sent.push(JSON.parse(request.body));return {ok:true};});
 install({root,pageId:id});
 function entry(index,height){
  observerInstances[0].callback([{target:nodes[index],isIntersecting:height>0,rootBounds:{width:400,height:400},boundingClientRect:{width:400,height:800},intersectionRect:{width:400,height}}]);
 }
 entry(0,220);entry(1,190);entry(2,220);
 timers.tick(600);
 entry(2,0);
 timers.tick(400);
 entry(3,240); // Same photo in the full-screen surface.
 timers.tick(1000);
 visible=false;events.visibilitychange();
 await Promise.resolve();
 assert.deepEqual(sent.map(row=>row.files),[['a']]);
});
