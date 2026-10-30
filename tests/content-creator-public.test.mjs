import {renderCreatorPromo,creatorHowTo} from '../shared/content-creator-view.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {ccEscape,ccImage} from '../shared/content-creator.js';

const contentSource=(await readFile(new URL('../apps/content-creator/content.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace("import('./visits.js')","loadVisits()").replace(/void start\(\);\s*$/,'return start;');
const contentFactory=new Function('esc','ccImage','mountCreatorShop','document','location','localStorage','globalThis','loadVisits','fetch',`const renderCreatorPromo=arguments[9];\n${contentSource}`);
const visitsSource=(await readFile(new URL('../apps/content-creator/visits.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace('export async function','async function');
const visitsFactory=new Function('db','doc','getDoc','setDoc','serverTimestamp','CC_VISITS','localStorage','globalThis','document',`${visitsSource}\nreturn installCreatorVisits;`);
const id='a'.repeat(32);
async function setup({preview=false,previous=null,failAnswer=false,storage=new Map(),avatar=true,kind='promo'}={}){
 const page={id,published:true,name:'Bistro <One>',avatar:avatar?'data:image/jpeg;base64,AAAA':'',photoIds:['000'],products:[],kind};
 const {document,window}=parseHTML(`<html><head><script type="application/json" id="creator-page-data">${JSON.stringify(page)}</script></head><body><main id="content-app"></main></body></html>`);
 const writes=[],listeners={},timers=[],viewport={scrollY:0,innerHeight:800,setTimeout:fn=>timers.push(fn),addEventListener:(name,fn)=>{listeners[name]=fn;}};
 Object.defineProperty(document.documentElement,'scrollHeight',{value:2800});
 const doc=(...args)=>args.filter(a=>typeof a==='string').join('/');
 const getDoc=async()=>({exists:()=>!!previous,data:()=>previous});
 const setDoc=async(path,data)=>{if(failAnswer&&data.answer)throw Error('offline');writes.push({path,data});};
 const localStorage={getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 let sdkLoads=0,fetches=0;
 const install=visitsFactory({},doc,getDoc,setDoc,()=>({server:true}),'contentCreatorVisits',localStorage,viewport,document);
 const start=contentFactory(ccEscape,ccImage,async({root,page})=>{root.innerHTML=creatorHowTo(page);},document,{pathname:`/content-creator/${id}`,search:preview?'?still=1':''},localStorage,viewport,async()=>{sdkLoads++;return {installCreatorVisits:install};},async()=>{fetches++;throw Error('Unexpected duplicate page request');},renderCreatorPromo);
 await start();const firstLoads=sdkLoads;
 async function settle(){for(let i=0;i<10;i++)await new Promise(r=>setImmediate(r));}
 for(const timer of timers)timer();await settle();
 return {document,window,writes,listeners,viewport,firstLoads,stats:()=>({sdkLoads,fetches}),settle};
}
async function click(ctx,selector){ctx.document.querySelector(selector).dispatchEvent(new ctx.window.Event('click',{bubbles:true}));await ctx.settle();}
test('First frame reuses the server page, with no Firebase or duplicate read before rendering',async()=>{
 const ctx=await setup();assert.equal(ctx.firstLoads,0);assert.equal(ctx.stats().fetches,0);assert.equal(ctx.document.querySelectorAll('.photo img').length,1);
 assert.match(ctx.document.querySelector('.photo img').getAttribute('src'),/asset=1/);
});
test('Besuch, 50%-Scroll und Antwort werden weiterhin gespeichert',async()=>{
 const ctx=await setup();assert.equal(ctx.writes[0].data.opened,true);assert.equal(ctx.document.querySelector('h1').textContent,'Përshëndetje,Bistro <One>.');
 ctx.viewport.scrollY=1100;ctx.listeners.scroll();await ctx.settle();assert.equal(ctx.writes.at(-1).data.scrolled,true);
 await click(ctx,'[data-answer="yes"]');assert.equal(ctx.writes.at(-1).data.answer,'yes');assert.equal(ctx.document.querySelectorAll('[data-answer]').length,0);
});
test('Demo looks identical and never loads the tracking SDK or writes visitor data',async()=>{
 const ctx=await setup({preview:true});await click(ctx,'[data-answer="yes"]');assert.equal(ctx.writes.length,0);assert.equal(ctx.stats().sdkLoads,0);assert.equal(ctx.document.querySelector('.preview'),null);assert.doesNotMatch(ctx.document.body.textContent,/Still|Demo/);
});
test('Fehlgeschlagene Antwort bleibt wiederholbar',async()=>{
 const ctx=await setup({failAnswer:true});await click(ctx,'[data-answer="no"]');assert.match(ctx.document.querySelector('#answer-error').textContent,/nuk u ruajt/);assert.equal(ctx.document.querySelector('[data-answer="no"]').disabled,false);
});
test('Gespeicherte Antwort bleibt nach erneutem Öffnen erhalten',async()=>{
 const ctx=await setup({previous:{scrolled:true,answer:'no'}});assert.equal(ctx.document.querySelectorAll('[data-answer]').length,0);assert.equal(ctx.writes[0].data.answer,'no');
});
test('Silent mode persists without changing presentation',async()=>{
 const storage=new Map();await setup({preview:true,storage});const ctx=await setup({storage});assert.equal(ctx.writes.length,0);assert.equal(ctx.stats().sdkLoads,0);assert.equal(ctx.document.querySelector('.preview'),null);
});
test('Kein leeres Logo, keine ZIP-Oberfläche',async()=>{
 const ctx=await setup({avatar:false});assert.equal(ctx.document.querySelector('.avatar'),null);assert.equal(ctx.document.querySelector('.download'),null);
});

test('Hero selection cannot expose inactive or unknown photographs',async()=>{
 const {creatorHeroFiles}=await import('../shared/content-creator-view.js');
 const page={kind:'shop',photoIds:['a','b','c'],heroPhotoIds:['c','secret','a'],products:[{active:true,imageIds:['a','b']},{active:false,imageIds:['c']}]};
 assert.deepEqual(creatorHeroFiles(page),['a']);
});

test('Shop interest answers use the existing visitor record and silent mode writes nothing',async()=>{
 const ctx=await setup({kind:'shop'});await click(ctx,'[data-answer="yes"]');
 assert.equal(ctx.writes.at(-1).data.answer,'yes');assert.equal(ctx.document.querySelectorAll('[data-answer]').length,0);
 const quiet=await setup({kind:'shop',preview:true});await click(quiet,'[data-answer="no"]');
 assert.equal(quiet.writes.length,0);assert.equal(quiet.stats().sdkLoads,0);
 const failed=await setup({kind:'shop',failAnswer:true});await click(failed,'[data-answer="no"]');
 assert.match(failed.document.querySelector('#answer-error').textContent,/nuk u ruajt/);
 assert.equal(failed.document.querySelector('[data-answer="no"]').disabled,false);
});
