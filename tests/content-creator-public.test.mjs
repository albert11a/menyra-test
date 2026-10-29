import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {ccEscape,ccImage} from '../shared/content-creator.js';
const source=(await readFile(new URL('../apps/content-creator/content.js',import.meta.url),'utf8'))
 .replace(/^import .*;\n/gm,'').replace(/\bscrollY\b/g,'viewport.scrollY').replace(/\binnerHeight\b/g,'viewport.innerHeight').replace(/start\(\);\s*$/,'return start;');
const factory=new Function('db','doc','getDoc','setDoc','serverTimestamp','CC_PAGES','CC_VISITS','esc','ccImage','document','location','localStorage','CSS','addEventListener','viewport',source);
const id='a'.repeat(32);
async function setup({preview=false,previous=null,failAnswer=false}={}){
 const {document,window}=parseHTML('<html><body><main id="content-app"></main></body></html>');
 const writes=[],storage=new Map(),listeners={},viewport={scrollY:0,innerHeight:800};
 Object.defineProperty(document.documentElement,'scrollHeight',{value:2800});
 const doc=(...args)=>args.filter(a=>typeof a==='string').join('/');
 const getDoc=async path=>({exists:()=> path.startsWith('contentCreatorVisits/') ? !!previous : true,data:()=> path.includes('/images/') ? {data:'data:image/jpeg;base64,AAAA'} : path.startsWith('contentCreatorVisits/') ? previous : {name:'Bistro <One>',avatar:'data:image/jpeg;base64,AAAA',photoIds:['000'],published:true}});
 const setDoc=async(path,data)=>{if(failAnswer && data.answer)throw Error('offline');writes.push({path,data});};
 const start=factory({},doc,getDoc,setDoc,()=>({server:true}),'contentCreatorPages','contentCreatorVisits',ccEscape,ccImage,document,{pathname:`/content-creator/${id}`,search:preview?'?preview=1':''},{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},{escape:s=>s},(name,fn)=>{listeners[name]=fn;},viewport);
 await start();await new Promise(r=>setImmediate(r));
 return {document,window,writes,listeners,viewport};
}
async function click(ctx,selector){ctx.document.querySelector(selector).dispatchEvent(new ctx.window.Event('click',{bubbles:true}));await new Promise(r=>setImmediate(r));}
test('Besuch, 50%-Scroll und Antwort werden gespeichert; Antwort ersetzt Auswahl',async()=>{
 const ctx=await setup();assert.equal(ctx.writes.length,1);assert.equal(ctx.writes[0].data.opened,true);
 assert.equal(ctx.document.querySelector('h1').textContent,'Përshëndetje,Bistro <One>.');
 ctx.viewport.scrollY=1100;ctx.listeners.scroll();await new Promise(r=>setImmediate(r));
 assert.equal(ctx.writes.at(-1).data.scrolled,true);
 await click(ctx,'[data-answer="yes"]');assert.equal(ctx.writes.at(-1).data.answer,'yes');
 assert.equal(ctx.document.querySelectorAll('[data-answer]').length,0);assert.match(ctx.document.querySelector('.answer-content').textContent,/Faleminderit për interesimin/);
});
test('Eigene Vorschau erzeugt auch beim Antworten keine Messdaten',async()=>{
 const ctx=await setup({preview:true});await click(ctx,'[data-answer="yes"]');assert.equal(ctx.writes.length,0);
 assert.match(ctx.document.querySelector('#answer-error').textContent,/nicht gespeichert/);
});
test('Fehlgeschlagene Antwort meldet Fehler und ermöglicht einen neuen Versuch',async()=>{
 const ctx=await setup({failAnswer:true});await click(ctx,'[data-answer="no"]');
 assert.match(ctx.document.querySelector('#answer-error').textContent,/nuk u ruajt/);
 assert.equal(ctx.document.querySelector('[data-answer="no"]').disabled,false);
});
test('Eine vorhandene Antwort bleibt nach erneutem Öffnen erhalten',async()=>{
 const ctx=await setup({previous:{scrolled:true,answer:'no'}});
 assert.equal(ctx.document.querySelectorAll('[data-answer]').length,0);
 assert.equal(ctx.writes[0].data.answer,'no');assert.equal(ctx.writes[0].data.scrolled,true);
});
