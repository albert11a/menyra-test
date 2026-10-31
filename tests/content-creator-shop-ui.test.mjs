import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {ccEscape,ccImage} from '../shared/content-creator.js';
import {euro,shopQuote,validShopId} from '../shared/content-creator-shop.js';
import {creatorIcon,creatorImageUrl,creatorOfferButton,creatorPhoto,renderCreatorCatalog,creatorHowTo,creatorFooter} from '../shared/content-creator-view.js';
import {shopAction} from '../server/content-creator-shop.js';
const source=(await readFile(new URL('../apps/content-creator/shop.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace('export async function mountCreatorShop','async function mountCreatorShop');
const factory=new Function('creatorVisitorId','db','doc','getDoc','esc','ccImage','CC_PAGES','euro','shopQuote','validShopId','zipBlob','localStorage','location','fetch','document','globalThis','setTimeout','navigator','creatorIcon','creatorImageUrl','creatorOfferButton','creatorPhoto','renderCreatorCatalog','creatorHowTo','creatorFooter',`${source}\nreturn mountCreatorShop;`);
const pageId='a'.repeat(32);
async function setup(still=false,price=2900,options={}){
 const {document,window}=parseHTML('<html><head><meta name="theme-color" content="#f7f6f2"><meta name="color-scheme" content="light"></head><body><main id="app"></main></body></html>'),root=document.getElementById('app');window.HTMLElement.prototype.scrollIntoView=()=>{};window.HTMLElement.prototype.scrollTo=function(options){this.scrollLeft=options.left;this.dispatchEvent(new window.Event('scroll'));};
 const storage=new Map(),calls=[],zipFiles=[],page={id:pageId,published:true,kind:'shop',name:'Bistro',media:options.media||{},heroPhotoIds:options.heroPhotoIds||[],photoIds:['one','two','three','four'],products:[{id:'pack',title:'Social Set',priceCents:price,imageIds:['one','two','three','four']}]};
 const docs=new Map([[`contentCreatorPages/${pageId}`,structuredClone(page)]]);
 for(const key of page.photoIds){docs.set(`contentCreatorPages/${pageId}/originals/${key}`,{parts:1,size:3,name:key+'.jpg',mime:'image/jpeg',cleanPreview:{version:1,data:'data:image/jpeg;base64,YWJj'}});docs.set(`contentCreatorPages/${pageId}/originals/${key}/chunks/000`,{data:'YWJj'});}
 const repo={read:async key=>docs.get(key),write:async(key,data)=>{docs.set(key,{...docs.get(key),...structuredClone(data)});return true;},notify:async()=>true};
 const fetch=async(url,requestOptions)=>{
  const payload=requestOptions.method==='POST'?JSON.parse(requestOptions.body):Object.fromEntries(new URL(url,'https://www.mnyra.com').searchParams);if(new URL(url,'https://www.mnyra.com').pathname==='/creator/download')payload.op=payload.orderId?'download':'free-download';calls.push(payload);
  try{if(payload.op==='free-download'&&options.download)await options.download(payload);if(payload.op==='free-preview'&&options.preview){const result=await options.preview(payload);if(result)return result;}const result=await shopAction(payload,repo);if(payload.op==='order'&&options.lostOrderResponse)throw Error('Response lost after commit');return {ok:true,json:async()=>result,arrayBuffer:async()=>result.bytes,headers:{get:key=>key==='Content-Type'?result.mime:key==='X-File-Name'?encodeURIComponent(result.name):null}};}catch(error){return {ok:false,json:async()=>({error:error.message})};}
 };
 const mount=factory(()=>'e'.repeat(32),{},(...args)=>args.filter(x=>typeof x==='string').join('/'),async()=>({data:()=>({data:'data:image/jpeg;base64,YWJj'})}),ccEscape,ccImage,'contentCreatorPages',euro,shopQuote,validShopId,files=>{zipFiles.push(files);return new Blob(['zip']);}, {getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}, {origin:'https://www.mnyra.com',search:''},fetch,document,{setInterval:(fn,ms)=>{options.intervals?.push({fn,ms});return 0;},addEventListener:()=>{},Image:options.Image,IntersectionObserver:options.IntersectionObserver,matchMedia:()=>({matches:!!options.reducedMotion})},()=>0,options.navigator||{},creatorIcon,creatorImageUrl,creatorOfferButton,creatorPhoto,renderCreatorCatalog,creatorHowTo,creatorFooter);
 await mount({root,page,still});
 async function settle(){for(let i=0;i<15;i++)await new Promise(r=>setImmediate(r));}
 async function click(selector){const button=root.querySelector(selector);assert.ok(button,selector);button.dispatchEvent(new window.Event('click',{bubbles:true}));await settle();}
 async function checkout(){await click('[data-shop="cart"]');await click('[data-shop="checkout"]');for(const [name,value] of Object.entries({name:'Test User',address:'Test Street 12',phone:'+38344123456'})){const field=root.querySelector(`[name="${name}"]`);field.value=value;field.dispatchEvent(new window.Event('input',{bubbles:true}));}}
 async function submit(){root.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await settle();}
 await settle();
 return {root,docs,calls,zipFiles,click,checkout,submit,document,window,settle};
}
test('Paid preview cards and viewer block native saving while free photos and checkout remain usable',async()=>{
 const paid=await setup();
 for(const type of ['contextmenu','dragstart']){
  const event=new paid.window.Event(type,{bubbles:true,cancelable:true});
  paid.root.querySelector('.shop-slide img').dispatchEvent(event);assert.equal(event.defaultPrevented,true);
  const surface=new paid.window.Event(type,{bubbles:true,cancelable:true});
  paid.root.querySelector('.shop-slide').dispatchEvent(surface);assert.equal(surface.defaultPrevented,true);
 }
 const swipe=new paid.window.Event('pointerdown',{bubbles:true,cancelable:true});
 paid.root.querySelector('.shop-slide').dispatchEvent(swipe);assert.equal(swipe.defaultPrevented,false);
 await paid.click('[data-shop="view"]');
 const viewerEvent=new paid.window.Event('contextmenu',{bubbles:true,cancelable:true});
 paid.root.querySelector('.shop-viewer-slide').dispatchEvent(viewerEvent);assert.equal(viewerEvent.defaultPrevented,true);
 await paid.click('[data-shop="viewer-close"]');await paid.click('[data-shop="add"]');await paid.checkout();
 const fieldEvent=new paid.window.Event('contextmenu',{bubbles:true,cancelable:true});
 paid.root.querySelector('[name="name"]').dispatchEvent(fieldEvent);assert.equal(fieldEvent.defaultPrevented,false);
 const free=await setup(false,0);assert.equal(free.root.querySelector('[data-protected-preview]'),null);
 const freeEvent=new free.window.Event('contextmenu',{bubbles:true,cancelable:true});
 free.root.querySelector('.shop-slide img').dispatchEvent(freeEvent);assert.equal(freeEvent.defaultPrevented,false);
});
test('A photo shared with a free package and promotional images stay saveable',()=>{
 const page={id:pageId,kind:'shop',photoIds:['one'],products:[{active:true,priceCents:1500,imageIds:['one']},{active:true,priceCents:0,imageIds:['one']}]};
 assert.doesNotMatch(creatorPhoto(page,'one','Free'),/data-protected-preview/);
 page.products.pop();assert.match(creatorPhoto(page,'one','Paid'),/data-protected-preview/);
 page.kind='promo';assert.doesNotMatch(creatorPhoto(page,'one','Promo'),/data-protected-preview/);
});
test('Shop bündelt vier Fotos und gibt Originale vor der monatlichen Zahlung frei',async()=>{
 const ctx=await setup();assert.equal(ctx.root.querySelectorAll('.shop-product').length,1);assert.equal(ctx.root.querySelectorAll('.shop-slide').length,4);assert.equal(ctx.root.querySelectorAll('.shop-dots button').length,4);
 await ctx.click('[data-shop="add"]');assert.equal(ctx.calls[0].op,'cart');assert.deepEqual(ctx.calls[0].ids,['pack']);
 await ctx.checkout();assert.match(ctx.root.querySelector('.shop-payment').textContent,/paguani më 1/);await ctx.submit();
 assert.equal(ctx.root.querySelectorAll('.shop-order').length,1);assert.equal(ctx.root.querySelector('[data-shop="save-photos"]').disabled,false);
 const [path,order]=[...ctx.docs.entries()].find(([key])=>key.startsWith('contentCreatorOrders/'));ctx.docs.set(path,{...order,approved:true,paymentConfirmed:true,status:'released'});
 await ctx.click('[data-shop="refresh"]');assert.equal(ctx.root.querySelector('[data-shop="save-photos"]').disabled,false);
});
test('Still-Modus lässt Checkout durchspielen und sendet keine Warenkorb-/Bestell-Requests',async()=>{
 const ctx=await setup(true);await ctx.click('[data-shop="add"]');await ctx.checkout();await ctx.submit();
 assert.equal(ctx.calls.length,0);assert.equal(ctx.root.querySelectorAll('.shop-order').length,1);assert.equal(ctx.root.querySelector('[data-shop="save-photos"]').disabled,false);
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

test('Gratisfotos lassen sich ohne ZIP, Warenkorb oder Bestellung als Originale speichern',async()=>{
 const ctx=await setup(false,0);assert.match(ctx.root.querySelector('.shop-price-row').textContent,/Falas/);assert.equal(ctx.root.querySelector('.shop-watermark'),null);
 assert.match(ctx.root.querySelector('.shop-slide img').getAttribute('src'),/op=image/);assert.equal(ctx.root.querySelector('[data-shop="add"]'),null);
 await ctx.click('[data-shop="free-save"]');assert.equal(ctx.root.querySelector('form'),null);assert.equal([...ctx.docs.keys()].some(k=>k.startsWith('contentCreatorOrders/')),false);
 assert.equal(ctx.calls.filter(c=>c.op==='free-download').length,4);assert.ok(ctx.calls.every(c=>['free-download','free-preview'].includes(c.op)));assert.equal(ctx.root.querySelectorAll('.shop-save-files a[target="_blank"]').length,4);assert.equal(ctx.root.querySelector('[data-shop="free-download"]'),null);
 await ctx.click('[data-shop="view"][data-index="0"]');assert.ok(ctx.root.querySelector('.shop-viewer [data-shop="free-save"]'));
});
test('Kostenloser Download im Still-Modus schreibt keine Statistik, Bestellung oder Meldung',async()=>{
 const ctx=await setup(true,0);await ctx.click('[data-shop="free-save"]');assert.equal(ctx.root.querySelectorAll('.shop-save-files a[target="_blank"]').length,4);assert.ok(ctx.calls.every(c=>['free-download','free-preview'].includes(c.op)));
});

test('Galerie verwendet sofort normale Bild-URLs ohne JavaScript-Bildanfragen',async()=>{
 const ctx=await setup(false,0);assert.equal(ctx.calls.length,0);assert.equal(ctx.root.querySelectorAll('.shop-slide img').length,4);
 assert.equal(ctx.root.querySelectorAll('.shop-slide img[src]').length,1);assert.equal(ctx.root.querySelectorAll('.shop-slide img[data-deferred-src]').length,3);
 const image=ctx.root.querySelector('.shop-slide img');image.onerror();assert.ok(ctx.root.querySelector('[data-shop="retry-images"]'));
 await ctx.click('[data-shop="retry-images"]');assert.match(ctx.root.querySelector('.shop-slide img').getAttribute('src'),/retry=/);assert.equal(ctx.calls.length,0);
});
test('Fotos speichern übergibt echte Bilddateien beim zweiten Fingertipp an das Teilen-Menü',async()=>{
 const shares=[];const ctx=await setup(false,0,{navigator:{canShare:({files})=>files.every(f=>f.type==='image/jpeg'),share:async payload=>shares.push(payload)}});
 await ctx.click('[data-shop="free-save"]');assert.ok(ctx.root.querySelector('[data-shop="save-ready"]'));assert.equal(shares.length,0);
 assert.equal(ctx.root.querySelectorAll('.shop-save-files a').length,4);const count=ctx.calls.length;
 await ctx.click('[data-shop="save-ready"]');assert.equal(shares.length,1);assert.equal(shares[0].files.length,4);assert.equal(shares[0].files[0].type,'image/jpeg');assert.equal(await shares[0].files[0].text(),'abc');assert.equal(ctx.calls.length,count);
 assert.equal(ctx.root.querySelector('[data-shop="save-zip"]'),null);await ctx.click('[data-shop="save-close"]');await ctx.click('[data-shop="free-save"]');assert.equal(shares.length,2);assert.equal(ctx.calls.length,count);
});
test('Ohne Datei-Teilen bleiben einzelne Bildlinks statt ausschließlich ZIP verfügbar',async()=>{
 const ctx=await setup(false,0);await ctx.click('[data-shop="free-save"]');await ctx.click('[data-shop="save-ready"]');assert.equal(ctx.root.querySelectorAll('.shop-save-files a[target="_blank"]').length,4);assert.match(ctx.root.textContent,/Hapni fotot veçmas/);
});

test('Speichern zeigt sofort den Dialog und Fortschritt bevor große Originale fertig sind',async()=>{
 let release;const slow=new Promise(resolve=>{release=resolve;});
 const ctx=await setup(false,0,{download:async payload=>{if(payload.file==='two')await slow;}});
 await ctx.click('[data-shop="free-save"]');assert.ok(ctx.root.querySelector('.shop-save-overlay'));assert.match(ctx.root.querySelector('.shop-save-overlay').textContent,/3 \/ 4/);assert.equal(ctx.root.querySelector('[data-shop="save-ready"]').disabled,true);
 release();await ctx.settle();assert.equal(ctx.root.querySelectorAll('.shop-save-files a').length,4);
});

test('Demo has the real mobile header, only a cart icon and three explanation cards',async()=>{
 const ctx=await setup(true);assert.equal(ctx.root.querySelector('.preview'),null);assert.doesNotMatch(ctx.root.textContent,/Still|Demo|ZIP/);assert.equal(ctx.root.querySelector('.shop-header').querySelectorAll('button').length,1);assert.ok(ctx.root.querySelector('.shop-cart svg'));assert.equal(ctx.root.querySelectorAll('.shop-how-steps article').length,3);
});
test('Viewer matches the document and browser theme, then restores the previous theme',async()=>{
 const ctx=await setup(true);await ctx.click('[data-shop="view"]');assert.equal(ctx.document.documentElement.dataset.ccViewer,'1');assert.equal(ctx.document.querySelector('meta[name="theme-color"]').getAttribute('content'),'#101813');assert.equal(ctx.document.querySelector('meta[name="color-scheme"]').getAttribute('content'),'dark');
 await ctx.click('[data-shop="viewer-close"]');assert.equal(ctx.document.documentElement.dataset.ccViewer,'0');assert.equal(ctx.document.querySelector('meta[name="theme-color"]').getAttribute('content'),'#f7f6f2');assert.equal(ctx.document.querySelector('meta[name="color-scheme"]').getAttribute('content'),'light');
});
test('Cart changes retain decoded image nodes instead of resetting the gallery',async()=>{
 const ctx=await setup(true),image=ctx.root.querySelector('.shop-slide img');await ctx.click('[data-shop="add"]');assert.equal(ctx.root.querySelector('.shop-slide img'),image);await ctx.click('[data-shop="cart"]');assert.equal(ctx.root.querySelector('.shop-slide img'),image);
});
test('Moving to a hidden carousel slide starts its image only when needed',async()=>{
 const ctx=await setup(true);assert.equal(ctx.root.querySelectorAll('.shop-slide img[src]').length,1);await ctx.click('[data-shop="slide"][data-step="1"]');assert.ok(ctx.root.querySelectorAll('.shop-slide img[src]').length>=2);assert.match(ctx.root.querySelector('[data-shop="view"][data-index="1"] img').src,/size=thumb/);
});


test('Viewer displays the already loaded thumbnail while the larger image arrives',async()=>{
 const ctx=await setup(true),src=ctx.root.querySelector('.shop-slide img').getAttribute('src');await ctx.click('[data-shop="view"]');
 const slide=ctx.root.querySelector('.shop-viewer-slide');assert.equal(slide.querySelector('.shop-viewer-preview').getAttribute('src'),src);assert.match(slide.querySelector('img[data-size="medium"]').getAttribute('src'),/size=medium/);
 slide.querySelector('img[data-size="medium"]').onerror();assert.equal(slide.querySelector('img[data-size="medium"]').style.opacity,'0');assert.ok(slide.querySelector('.shop-viewer-preview'));
});

test('The next card image is fetched and decoded after the current photo loads, before any swipe',async()=>{
 const ctx=await setup(true),first=ctx.root.querySelector('.shop-slide img'),next=ctx.root.querySelector('[data-shop="view"][data-index="1"] img');
 assert.equal(next.hasAttribute('src'),false);let decoded=0;next.decode=async()=>{decoded++;};
 first.onload();await ctx.settle();assert.match(next.getAttribute('src'),/display=4/);assert.equal(next.loading,'eager');assert.equal(next.fetchPriority,'low');assert.equal(decoded,1);
 const third=ctx.root.querySelector('[data-shop="view"][data-index="2"] img');assert.equal(third.hasAttribute('src'),false);
 next.onload();assert.equal(third.hasAttribute('src'),false);
});
test('Header and explanation have neither a star icon nor the unwanted headline',async()=>{
 const ctx=await setup(true);assert.doesNotMatch(ctx.root.textContent,/Në një dritë të re/);assert.doesNotMatch(ctx.root.innerHTML,/m12 3 2.5 6.5/);
});

test('Paid card and decoded images remain mounted through arrows, viewer open and close',async()=>{
 const ctx=await setup(true),card=ctx.root.querySelector('.shop-product'),track=card.querySelector('[data-track]');
 Object.defineProperty(track,'clientWidth',{value:170});
 const images=[...track.querySelectorAll('img')];
 await ctx.click('[data-shop="slide"][data-step="1"]');
 assert.equal(track.scrollLeft,170);assert.ok(images[1].getAttribute('src'));
 await ctx.click('[data-shop="view"][data-index="1"]');
 assert.equal(ctx.root.querySelector('.shop-product'),card);assert.equal(ctx.root.querySelector('.shop-error'),null);
 assert.equal(ctx.document.documentElement.dataset.ccViewer,'1');
 await ctx.click('[data-shop="viewer-step"][data-step="1"]');
 await ctx.click('[data-shop="viewer-close"]');
 assert.equal(ctx.root.querySelector('.shop-product'),card);assert.equal(track.scrollLeft,340);
 assert.deepEqual([...track.querySelectorAll('img')],images);assert.equal(ctx.root.querySelector('.shop-error'),null);
 assert.equal(card.closest('[inert]'),null);
});
test('Catalog sections and solid header match mobile request without paint containment',async()=>{
 const ctx=await setup(true),css=await readFile(new URL('../apps/content-creator/shop.css',import.meta.url),'utf8');
 assert.match(ctx.root.textContent,/Me çmim të arsyeshëm/);assert.doesNotMatch(ctx.root.textContent,/Koleksioni juaj/);
 assert.ok(ctx.root.querySelector('#shop-purchases:not([hidden])'));
 assert.doesNotMatch(css,/content-visibility|contain-intrinsic-size|#f7f6f2ee/);
});

test('Visible current and adjacent photos warm decoded larger versions before opening',async()=>{
 const warmed=[];
 class Image {constructor(){warmed.push(this);}decode(){this.decoded=true;return Promise.resolve();}}
 const ctx=await setup(true,2900,{Image});
 const photos=ctx.root.querySelectorAll('.shop-slide img');photos[0].onload();photos[1].onload();
 assert.equal(warmed.length,2);assert.ok(warmed.every(image=>image.decoded&&image.src.includes('size=medium')));
 photos[0].onload();assert.equal(warmed.length,2);
});

test('Hero autoplay, swipe, dots and pause preserve the gallery through cart changes',async()=>{
 const intervals=[],ctx=await setup(true,2900,{heroPhotoIds:['one','two','three'],intervals});
 const track=ctx.root.querySelector('[data-hero-track]');Object.defineProperty(track,'clientWidth',{value:390});
 assert.equal(track.children.length,3);assert.equal(track.querySelectorAll('img[src]').length,1);assert.equal(track.querySelectorAll('img[data-deferred-srcset]').length,2);
 const timer=intervals.find(t=>t.ms===5500);assert.ok(timer);timer.fn();assert.equal(track.scrollLeft,390);
 await ctx.click('[data-shop="hero-toggle"]');timer.fn();assert.equal(track.scrollLeft,390);
 await ctx.click('[data-shop="hero-dot"][data-index="2"]');assert.equal(track.scrollLeft,780);assert.ok(track.children[2].querySelector('img').srcset.includes('1600w'));assert.equal(track.children[2].querySelector('img').hasAttribute('data-deferred-srcset'),false);
 await ctx.click('[data-shop="add"]');assert.equal(ctx.root.querySelector('[data-hero-track]'),track);
 track.scrollLeft=0;track.dispatchEvent(new ctx.window.Event('scroll'));
 assert.equal(ctx.root.querySelector('[data-shop="hero-dot"][data-index="0"]').getAttribute('aria-pressed'),'true');
});
test('Hero respects reduced motion and keeps the introduction in simple Albanian pa ë',async()=>{
 const intervals=[],ctx=await setup(true,2900,{heroPhotoIds:['one','two'],intervals,reducedMotion:true});
 const track=ctx.root.querySelector('[data-hero-track]');intervals.find(t=>t.ms===5500).fn();assert.ok(!track.scrollLeft);
 const intro=ctx.root.querySelector('.shop-intro-copy');assert.doesNotMatch(intro.textContent,/[ëË]/);
 assert.match(intro.textContent,/mnyra.*Bistro/);assert.match(intro.textContent,/foto falas/);assert.ok(intro.querySelector('a[href="#shop-faq"]'));
});


test('Preparing on focus enables sharing on the first tap without downloading the same originals again',async()=>{
 const shared=[];
 const ctx=await setup(false,0,{navigator:{canShare:()=>true,share:async data=>shared.push(data)}});
 const button=ctx.root.querySelector('[data-shop="free-save"]');button.dispatchEvent(new ctx.window.Event('focusin',{bubbles:true}));await ctx.settle();
 assert.equal(ctx.calls.filter(call=>call.op==='free-download').length,4);
 await ctx.click('[data-shop="free-save"]');
 assert.equal(shared.length,1);assert.equal(shared[0].files.length,4);assert.equal(await shared[0].files[0].text(),'abc');
 assert.equal(ctx.calls.filter(call=>call.op==='free-download').length,4);assert.equal(ctx.root.querySelector('.shop-save-overlay'),null);
});

test('Visible free packages prepare at most a small known original set; 3G and data saving skip automatic preparation',async()=>{
 const origin='https://menyra-media.alberthoti-vsa.workers.dev';
 const media=Object.fromEntries(['one','two','three','four'].map(id=>[id,{mode:'clean',bytes:100,thumb:`${origin}/media/creator-public/${pageId}/${id}/r_thumb.webp`,medium:`${origin}/media/creator-public/${pageId}/${id}/r_medium.webp`,large:`${origin}/media/creator-public/${pageId}/${id}/r_large.webp`}]));
 class Observer{constructor(callback){this.callback=callback;}observe(target){this.callback([{target,isIntersecting:true}]);}disconnect(){}}
 for(const connection of [{effectiveType:'3g'},{effectiveType:'4g',saveData:true}]){
  const ctx=await setup(false,0,{media,IntersectionObserver:Observer,navigator:{connection}});await ctx.settle();
  assert.equal(ctx.calls.filter(call=>call.op==='free-download').length,0);
 }
 const fast=await setup(false,0,{media,IntersectionObserver:Observer,navigator:{connection:{effectiveType:'4g'}}});await fast.settle();
 assert.equal(fast.calls.filter(call=>call.op==='free-download').length,4);
});

test('FAQ stays open and a saved interest answer survives cart updates',async()=>{
 const ctx=await setup(true),faq=ctx.root.querySelector('details[data-faq="custom"]');faq.setAttribute('open','');
 assert.equal(ctx.root.querySelectorAll('.shop-how details').length,4);
 const answer=ctx.root.querySelector('.answer-content');answer.innerHTML='<p class="answer-message">Faleminderit!</p>';
 await ctx.click('[data-shop="add"]');
 assert.ok(ctx.root.querySelector('details[data-faq="custom"][open]'));
 assert.equal(ctx.root.querySelector('.answer-content'),answer);assert.equal(ctx.root.querySelector('[data-answer]'),null);
});

test('A committed order with a lost response is recovered without a second purchase',async()=>{
 const ctx=await setup(false,2900,{lostOrderResponse:true});
 await ctx.click('[data-shop="add"]');await ctx.checkout();await ctx.submit();
 assert.equal([...ctx.docs.keys()].filter(key=>key.startsWith('contentCreatorOrders/')).length,1);
 assert.equal(ctx.root.querySelectorAll('.shop-order').length,1);
 assert.ok(ctx.calls.some(call=>call.op==='receipt'));
 assert.doesNotMatch(ctx.root.textContent,/Response lost/);
});
