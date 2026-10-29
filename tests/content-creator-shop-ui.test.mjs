import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {ccEscape,ccImage} from '../shared/content-creator.js';
import {euro,shopQuote,validShopId} from '../shared/content-creator-shop.js';
import {shopAction} from '../server/content-creator-shop.js';
const source=(await readFile(new URL('../apps/content-creator/shop.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace('export async function mountCreatorShop','async function mountCreatorShop');
const factory=new Function('db','doc','getDoc','esc','ccImage','CC_PAGES','euro','shopQuote','validShopId','zipBlob','localStorage','location','fetch','document','globalThis',`${source}\nreturn mountCreatorShop;`);
const pageId='a'.repeat(32);
async function setup(still=false,price=2900){
 const {document,window}=parseHTML('<html><body><main id="app"></main></body></html>'),root=document.getElementById('app');window.HTMLElement.prototype.scrollIntoView=()=>{};window.HTMLElement.prototype.scrollTo=function(options){this.scrollLeft=options.left;this.dispatchEvent(new window.Event('scroll'));};
 const storage=new Map(),calls=[],page={id:pageId,published:true,kind:'shop',name:'Bistro',photoIds:['one','two','three','four'],products:[{id:'pack',title:'Social Set',priceCents:price,imageIds:['one','two','three','four']}]};
 const docs=new Map([[`contentCreatorPages/${pageId}`,structuredClone(page)]]);
 for(const key of page.photoIds)docs.set(`contentCreatorPages/${pageId}/originals/${key}`,{parts:1,size:3,name:key+'.jpg'});
 const repo={read:async key=>docs.get(key),write:async(key,data)=>{docs.set(key,{...docs.get(key),...structuredClone(data)});return true;},notify:async()=>true};
 const fetch=async(url,options)=>{
  const payload=options.method==='POST'?JSON.parse(options.body):Object.fromEntries(new URL(url,'https://www.mnyra.com').searchParams);calls.push(payload);
  try{return {ok:true,json:async()=>await shopAction(payload,repo)};}catch(error){return {ok:false,json:async()=>({error:error.message})};}
 };
 const mount=factory({},(...args)=>args.filter(x=>typeof x==='string').join('/'),async()=>({data:()=>({data:'data:image/jpeg;base64,YWJj'})}),ccEscape,ccImage,'contentCreatorPages',euro,shopQuote,validShopId,()=>{}, {getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}, {origin:'https://www.mnyra.com',search:''},fetch,document,{setInterval:()=>0,addEventListener:()=>{}});
 await mount({root,page,still});
 async function settle(){for(let i=0;i<15;i++)await new Promise(r=>setImmediate(r));}
 async function click(selector){const button=root.querySelector(selector);assert.ok(button,selector);button.dispatchEvent(new window.Event('click',{bubbles:true}));await settle();}
 async function checkout(){await click('[data-shop="cart"]');await click('[data-shop="checkout"]');for(const [name,value] of Object.entries({name:'Test User',address:'Test Street 12',phone:'+38344123456'})){const field=root.querySelector(`[name="${name}"]`);field.value=value;field.dispatchEvent(new window.Event('input',{bubbles:true}));}}
 async function submit(){root.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await settle();}
 return {root,docs,calls,click,checkout,submit,document,window};
}
test('Shop bündelt vier Fotos, zeigt Dots, Warenkorb, COD und gesperrte Bestellung',async()=>{
 const ctx=await setup();assert.equal(ctx.root.querySelectorAll('.shop-product').length,1);assert.equal(ctx.root.querySelectorAll('.shop-slide').length,4);assert.equal(ctx.root.querySelectorAll('.shop-dots button').length,4);
 await ctx.click('[data-shop="add"]');assert.equal(ctx.calls[0].op,'cart');assert.deepEqual(ctx.calls[0].ids,['pack']);
 await ctx.checkout();assert.match(ctx.root.querySelector('.shop-payment').textContent,/Pagesa te postieri/);await ctx.submit();
 assert.equal(ctx.root.querySelectorAll('.shop-order').length,1);assert.equal(ctx.root.querySelector('[data-shop="download"]').disabled,true);
 const [path,order]=[...ctx.docs.entries()].find(([key])=>key.startsWith('contentCreatorOrders/'));ctx.docs.set(path,{...order,approved:true,paymentConfirmed:true,status:'released'});
 await ctx.click('[data-shop="refresh"]');assert.equal(ctx.root.querySelector('[data-shop="download"]').disabled,false);
});
test('Still-Modus lässt Checkout durchspielen und sendet keine Warenkorb-/Bestell-Requests',async()=>{
 const ctx=await setup(true);await ctx.click('[data-shop="add"]');await ctx.checkout();await ctx.submit();
 assert.equal(ctx.calls.length,0);assert.equal(ctx.root.querySelectorAll('.shop-order').length,1);assert.equal(ctx.root.querySelector('[data-shop="download"]').disabled,true);
});
test('Preisänderung erfordert erneute Bestätigung; keine heimlich höhere Bestellung',async()=>{
 const ctx=await setup();await ctx.click('[data-shop="add"]');await ctx.checkout();ctx.docs.get(`contentCreatorPages/${pageId}`).products[0].priceCents=4000;
 await ctx.submit();assert.equal([...ctx.docs.keys()].filter(k=>k.startsWith('contentCreatorOrders/')).length,0);assert.match(ctx.root.textContent,/Çmimi u përditësua/);
 await ctx.submit();const order=[...ctx.docs.entries()].find(([key])=>key.startsWith('contentCreatorOrders/'))[1];assert.equal(order.totalCents,4000);
});


test('Foto öffnet das ganze Paket groß; Pfeile, Punkte und Swipe wechseln Bilder ohne Shop-Anfrage',async()=>{
 const ctx=await setup(true);ctx.document.body.style.position='relative';
 await ctx.click('[data-shop="view"][data-index="2"]');
 assert.equal(ctx.root.querySelectorAll('.shop-viewer-slide').length,4);assert.equal(ctx.root.querySelector('[data-view-count]').textContent,'3 / 4');
 assert.equal(ctx.document.body.style.position,'fixed');assert.ok(ctx.root.querySelector('.shop-header').hasAttribute('inert'));
 await ctx.click('[data-shop="viewer-step"][data-step="1"]');assert.equal(ctx.root.querySelector('[data-view-count]').textContent,'4 / 4');
 await ctx.click('[data-shop="viewer-step"][data-step="1"]');assert.equal(ctx.root.querySelector('[data-view-count]').textContent,'4 / 4');
 await ctx.click('[data-shop="viewer-dot"][data-index="0"]');assert.equal(ctx.root.querySelector('[data-view-count]').textContent,'1 / 4');
 const track=ctx.root.querySelector('[data-view-track]');Object.defineProperty(track,'clientWidth',{value:390});track.scrollLeft=390;track.dispatchEvent(new ctx.window.Event('scroll'));
 assert.equal(ctx.root.querySelector('[data-view-count]').textContent,'2 / 4');assert.equal(ctx.root.querySelector('[data-shop="viewer-dot"][data-index="1"]').getAttribute('aria-pressed'),'true');
 await ctx.click('[data-shop="viewer-close"]');assert.equal(ctx.root.querySelector('.shop-viewer'),null);assert.equal(ctx.document.body.style.position,'relative');
 assert.equal(ctx.root.querySelector('.shop-header').hasAttribute('inert'),false);assert.equal(ctx.calls.length,0);
});
test('Großansicht schließt mit Escape und funktioniert neben dem Warenkorb',async()=>{
 const ctx=await setup(true);await ctx.click('[data-shop="view"][data-index="0"]');
 const event=new ctx.window.Event('keydown',{bubbles:true,cancelable:true});Object.defineProperty(event,'key',{value:'Escape'});
 ctx.root.querySelector('[data-shop="viewer-close"]').dispatchEvent(event);assert.equal(ctx.root.querySelector('.shop-viewer'),null);
 await ctx.click('[data-shop="view"][data-index="1"]');await ctx.click('.shop-viewer [data-shop="add"]');assert.equal(ctx.root.querySelector('.shop-viewer [data-shop="add"]').disabled,true);
 await ctx.click('[data-shop="viewer-close"]');await ctx.click('[data-shop="cart"]');assert.equal(ctx.root.querySelectorAll('.shop-cart-line').length,1);
});
test('Bildflächen sind in beiden Ansichten fest begrenzt und erlauben kein vertikales Innenscrollen',async()=>{
 const css=await readFile(new URL('../apps/content-creator/shop.css',import.meta.url),'utf8');
 assert.match(css,/\.shop-carousel\{aspect-ratio:4\/5;overflow:hidden\}/);
 assert.match(css,/\.shop-track\{[^}]*height:100%[^}]*overflow-y:hidden/);
 assert.match(css,/\.shop-slide\{flex:0 0 100%;[^}]*height:100%/);
 assert.match(css,/\.shop-viewer-track\{[^}]*overflow-y:hidden/);
 assert.match(css,/\.shop-viewer-slide img\{[^}]*object-fit:contain/);
});

test('Kostenloses Paket zeigt Falas und bestellt mit 0 Euro ohne Zahlungsaufforderung',async()=>{
 const ctx=await setup(false,0);assert.match(ctx.root.querySelector('.shop-price-row').textContent,/Falas/);
 await ctx.click('[data-shop="add"]');await ctx.checkout();assert.match(ctx.root.querySelector('.shop-payment').textContent,/Nuk kërkohet pagesë/);assert.doesNotMatch(ctx.root.querySelector('.shop-payment').textContent,/Pagesa te postieri/);
 await ctx.submit();const order=[...ctx.docs.entries()].find(([key])=>key.startsWith('contentCreatorOrders/'))[1];assert.equal(order.totalCents,0);assert.equal(order.approved,false);assert.match(ctx.root.querySelector('.shop-order-state').textContent,/Në pritje të miratimit/);
});
