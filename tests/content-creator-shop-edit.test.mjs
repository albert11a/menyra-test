import {creatorBusinessStatus,creatorBusinessMatches} from '../shared/creator-analytics.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {createHeartStore,createHeartInitialState} from '../apps/mnyra-heart/heart-state.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';
import {contentLink} from '../shared/content-creator.js';
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ');
const factory=new Function('db','collection','doc','getDoc','onSnapshot','setDoc','updateDoc','writeBatch','serverTimestamp','CC_PAGES','CC_VISITS','contentLink','creatorBusinessStatus','creatorBusinessMatches',`const creatorCdnEnabled=async()=>false; const savePromoAsset=async(pageId,imageId,file,data)=>setDoc(doc(db,CC_PAGES,pageId,'images',imageId),{data,caption:''});\n${source}\nreturn createContentCreator;`);
function setup(options={}){
 const {document,window}=parseHTML('<div id="app"></div>'),root=document.getElementById('app');
 const store=createHeartStore(createHeartInitialState());
 const page={id:'shop',name:'Cafe',kind:'shop',published:true,workflow:'ready',photoIds:['a','b','c'],products:[{id:'p',title:'First',priceCents:250,imageIds:['a','b']},{id:'q',title:'Second',priceCents:500,imageIds:['b','c']}]};
 const docs=new Map([['contentCreatorPages/shop',page],['contentCreatorOrders/buyer',{lines:[{imageIds:['a','b']}],approved:true}]]);
 for(const key of page.photoIds)for(const group of ['images','previews','originals'])docs.set(`contentCreatorPages/shop/${group}/${key}`,{data:'data:image/jpeg;base64,YWJj',caption:'Caption'});
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 const update=async(path,data)=>docs.set(path,{...docs.get(path),...data});
 let fail=false;
 const create=factory({},()=>'',doc,async path=>({data:()=>docs.get(path)}),()=>()=>{},async()=>{},update,()=>{
 const writes=[];return {update:(...args)=>writes.push(()=>update(...args)),delete:path=>writes.push(()=>docs.delete(path)),commit:async()=>{if(fail)throw Error('Offline');for(const write of writes)await write();}};
 },()=>'', 'contentCreatorPages','contentCreatorVisits',contentLink,creatorBusinessStatus,creatorBusinessMatches);
 store.actions.patchContentCreator({pages:[page]});store.subscribe(state=>{root.innerHTML=renderContentCreator(state.contentCreator);});root.innerHTML=renderContentCreator(store.getState().contentCreator);
 const uploads=[];
 create({root,store,prepareImage:async file=>'preview:'+file.name,saveAsset:async(pageId,key,file,data,config)=>{
   if(options.failUpload&&uploads.length===1)throw Error('Upload fehlgeschlagen');
   uploads.push({key,file,config});docs.set(`contentCreatorPages/${pageId}/images/${key}`,{data});docs.set(`contentCreatorPages/${pageId}/originals/${key}`,{name:file.name});
 }});
 async function click(selector){const node=root.querySelector(selector);assert.ok(node,selector);node.dispatchEvent(new window.Event('click',{bubbles:true}));for(let i=0;i<15;i++)await new Promise(r=>setImmediate(r));}
 async function add(product,files){const input=root.querySelector(`[data-cc-package-add="${product}"]`);assert.ok(input);Object.defineProperty(input,'files',{value:files});input.dispatchEvent(new window.Event('change',{bubbles:true}));for(let i=0;i<20;i++)await new Promise(r=>setImmediate(r));}
 return {root,store,docs,click,add,uploads,setFailure:value=>{fail=value;}};
}
test('Paket löschen bestätigt und atomar; gemeinsame Fotos und gekaufte Originale bleiben erhalten',async()=>{
 const c=setup();await c.click('[data-cc-action="detail"]');
 assert.equal(c.root.querySelectorAll('.cc-package-photos [data-cc-action="delete"]').length,4);
 const selector='[data-cc-action="delete-package"][data-product="p"]';
 await c.click(selector);assert.equal(c.docs.get('contentCreatorPages/shop').products.length,2);
 await c.click('[data-cc-action="cancel-package-delete"]');assert.equal(c.store.getState().contentCreator.deletePackageConfirm,'');
 await c.click(selector);c.setFailure(true);await c.click(selector);
 assert.equal(c.docs.get('contentCreatorPages/shop').products.length,2);assert.match(c.store.getState().contentCreator.mediaError,/Offline/);
 c.setFailure(false);await c.click(selector);
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').photoIds,['b','c']);assert.equal(c.docs.get('contentCreatorPages/shop').products.length,1);
 assert.equal(c.docs.has('contentCreatorPages/shop/images/a'),false);assert.equal(c.docs.has('contentCreatorPages/shop/previews/a'),false);
 for(const key of ['a','b','c'])assert.equal(c.docs.has(`contentCreatorPages/shop/originals/${key}`),true);
 assert.equal(c.docs.has('contentCreatorPages/shop/previews/b'),true);assert.equal(c.docs.has('contentCreatorOrders/buyer'),true);
 assert.equal(c.root.querySelectorAll('[data-cc-package]').length,1);
});
test('Paketfotos entfernen behält gemeinsame Fotos und ein erneut befüllbares leeres Paket',async()=>{
 const c=setup();await c.click('[data-cc-action="detail"]');
 await c.click('[data-cc-action="move"][data-image="b"][data-direction="-1"]');
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').products[0].imageIds,['b','a']);
 await c.click('[data-cc-action="delete"][data-image="b"]');
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').products.map(p=>p.imageIds),[['a'],['b','c']]);
 await c.click('[data-cc-action="delete"][data-image="a"]');
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').products.map(p=>p.id),['p','q']);
 assert.deepEqual(c.store.getState().contentCreator.pages[0].products.map(p=>p.id),['p','q']);
 assert.equal(c.docs.has('contentCreatorPages/shop/originals/a'),true);
 assert.equal(c.docs.has('contentCreatorPages/shop/images/b'),true);
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').products[0].imageIds,[]);
 assert.ok(c.root.querySelector('[data-cc-package-add="p"]'));
});
const assetSource=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator-shop.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export \{.*\n/gm,'').replace(/export (async )?function /g,'$1function ');
test('Wasserzeichen hat 45 Prozent Deckkraft und verwendet gemessene Wortabstände in allen Bildformaten',()=>{
 const draw=new Function(`${assetSource}\nreturn drawShopWatermark;`)();
 for(const [width,height] of [[720,900],[720,150],[100,720],[32,32]]){
  const rows=new Map();let textWidth=0;const ctx={save(){},restore(){},translate(){},rotate(){},measureText(){textWidth=parseFloat(this.font.split(' ')[1])*9;return {width:textWidth};},fillText(text,x,y){assert.equal(text,'MNYRA · PREVIEW');const xs=rows.get(y)||[];xs.push(x);rows.set(y,xs);}};
  draw(ctx,width,height);assert.equal(ctx.fillStyle,'rgba(255,255,255,.45)');assert.ok(rows.size>1);
  for(const xs of rows.values())for(let i=1;i<xs.length;i++)assert.ok(xs[i]-xs[i-1]>textWidth+15);
 }
});
test('Vorhandene Vorschauen werden aus Originalen erneuert, Bildunterschriften bleiben bestehen',async()=>{
 const docs=new Map([['contentCreatorPages/s/originals/a',{parts:1,mime:'image/jpeg'}],['contentCreatorPages/s/originals/a/chunks/000',{data:btoa('original')}]]),writes=[],urls=[];
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 const ctx={save(){},restore(){},translate(){},rotate(){},measureText:()=>({width:200}),fillText(){},drawImage(){}};
 const document={createElement:()=>({getContext:()=>ctx,toDataURL:()=> 'new-preview'})};
 class Image{constructor(){this.width=720;this.height=900;}async decode(){}}
 const refresh=new Function('db','doc','getDoc','setDoc','CC_PAGES','Image','document','URL','updateDoc','serverTimestamp',`const creatorCdnEnabled=async()=>false;\n${assetSource}\nreturn refreshShopPreviews;`)({},doc,async path=>({data:()=>docs.get(path)}),async(...args)=>writes.push(args),'contentCreatorPages',Image,document,{createObjectURL:()=> 'blob:original',revokeObjectURL:url=>urls.push(url)},async()=>{},()=>0);
 await refresh('s',['a']);assert.equal(writes.length,6);assert.equal(writes.filter(([path,data])=>path.includes('/displays/')&&data.version===3).length,3);assert.deepEqual(writes[5],['contentCreatorPages/s/images/a',{data:'new-preview'},{merge:true}]);assert.deepEqual(urls,['blob:original']);
 await assert.rejects(refresh('s',['missing']),/Originaldatei fehlt/);assert.equal(writes.length,6);
});

test('iPhone JPEG fallback adapts oversized previews instead of demanding smaller originals',()=>{
 let encodes=0;
 const ctx={save(){},restore(){},translate(){},rotate(){},measureText:()=>({width:150}),fillText(){},drawImage(){},fillRect(){}};
 const document={createElement:()=>({width:0,height:0,getContext:()=>ctx,toDataURL(mime,q){encodes++;if(mime==='image/webp')return 'data:image/png;base64,AA';return 'data:image/jpeg;base64,'+'A'.repeat(Math.round(this.width*this.height*q*.7));}})};
 const prepare=new Function('document',`${assetSource}\nreturn prepareBoundedShopDisplay;`)(document);
 const original={width:4000,height:6000},record=prepare(original,1600,.88);
 assert.ok(JSON.stringify(record).length<=950000);assert.ok(record.width>=640);assert.ok(encodes>4);
 assert.deepEqual(original,{width:4000,height:6000});assert.match(record.clean,/^data:image\/jpeg/);assert.match(record.marked,/^data:image\/jpeg/);
});

test('Add several photos to one existing package, preserving other packages and purchased originals',async()=>{
 const c=setup();await c.click('[data-cc-action="detail"]');
 const files=[{name:'new-1.jpg',type:'image/jpeg',size:100},{name:'new-2.png',type:'image/png',size:100}];
 await c.add('p',files);const page=c.docs.get('contentCreatorPages/shop');
 assert.equal(page.photoIds.length,5);assert.deepEqual(page.products[0].imageIds,['a','b',...c.uploads.map(u=>u.key)]);
 assert.deepEqual(page.products[1].imageIds,['b','c']);assert.equal(page.products[0].priceCents,250);
 assert.equal(c.uploads.length,2);assert.ok(c.uploads.every(u=>u.config.free===false));
 assert.deepEqual(c.docs.get('contentCreatorOrders/buyer').lines[0].imageIds,['a','b']);
 assert.equal(c.root.querySelectorAll('[data-cc-package="p"] figure').length,4);
});
test('Failed or oversized package additions leave membership unchanged and can be retried',async()=>{
 const c=setup({failUpload:true});await c.click('[data-cc-action="detail"]');
 const file={name:'new.jpg',type:'image/jpeg',size:100};await c.add('p',[file,file]);
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').photoIds,['a','b','c']);
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').products[0].imageIds,['a','b']);
 assert.match(c.store.getState().contentCreator.mediaError,/Upload fehlgeschlagen/);
 assert.equal(c.root.querySelector('[data-cc-package-add="p"]').disabled,false);
 const d=setup();await d.click('[data-cc-action="detail"]');await d.add('p',[{...file,size:31*1024*1024}]);
 assert.equal(d.uploads.length,0);assert.match(d.store.getState().contentCreator.mediaError,/30 MB/);
 await d.add('p',[file]);assert.equal(d.docs.get('contentCreatorPages/shop').products[0].imageIds.length,3);
});

test('Business settings persist bulk Ready/Archiv and follow-up without changing packages',async()=>{
 const c=setup();await c.click('[data-cc-action="settings"]');
 const select=c.root.querySelector('[data-cc-select]');select.checked=true;select.dispatchEvent(new c.root.ownerDocument.defaultView.Event('change',{bubbles:true}));
 await c.click('[data-cc-action="bulk-status"][data-key="ready"]');
 assert.equal(c.docs.get('contentCreatorPages/shop').workflow,'ready');
 assert.ok(c.docs.get('contentCreatorPages/shop').workflowAt);
 await c.click('[data-cc-action="settings"]');await c.click('[data-cc-action="select-all"]');
 await c.click('[data-cc-action="bulk-status"][data-key="archived"]');
 assert.equal(c.docs.get('contentCreatorPages/shop').workflow,'archived');
 assert.equal(c.docs.get('contentCreatorPages/shop').products.length,2);
});

test('Approved roster exposes compact link chips behind only the row arrow',async()=>{
 const c=setup();assert.equal(c.root.querySelector('.cc-link-actions'),null);
 await c.click('[data-cc-action="toggle-links"]');
 const actions=[...c.root.querySelectorAll('.cc-link-actions button')];
 assert.deepEqual(actions.map(node=>node.textContent.trim()),['Still preview','Still copy','True copy','Sended']);
 assert.equal(c.root.querySelector('[data-cc-action="toggle-links"]').getAttribute('aria-expanded'),'true');
 await c.click('[data-cc-action="toggle-links"]');assert.equal(c.root.querySelector('.cc-link-actions'),null);
});
test('Selection uses the LifeSkin toolbar, toggles all/none, and honours the business search',async()=>{
 const c=setup();await c.click('[data-cc-action="settings"]');
 assert.ok(c.root.querySelector('.heart-faelle-wahl__kopf'));
 await c.click('[data-cc-action="select-all"]');assert.deepEqual(c.store.getState().contentCreator.selectedIds,['shop']);
 await c.click('[data-cc-action="select-all"]');assert.deepEqual(c.store.getState().contentCreator.selectedIds,[]);
 const field=c.root.querySelector('#cc-business-search');field.value='does not exist';field.dispatchEvent(new c.root.ownerDocument.defaultView.Event('input',{bubbles:true}));
 assert.equal(c.root.querySelectorAll('.cc-row-main').length,0);
 await c.click('[data-cc-action="select-all"]');assert.deepEqual(c.store.getState().contentCreator.selectedIds,[]);
});
test('Double click minimises cards and the title restores them with keyboard-accessible controls',async()=>{
 const c=setup();c.root.querySelector('.cc-metric').dispatchEvent(new c.root.ownerDocument.defaultView.Event('dblclick',{bubbles:true,cancelable:true}));
 assert.equal(c.store.getState().contentCreator.collapsedCards.metrics,true);
 assert.equal(c.root.querySelector('.cc-metrics-grid').hidden,true);
 await c.click('[data-cc-action="collapse"][data-key="metrics"]');assert.equal(c.store.getState().contentCreator.collapsedCards.metrics,false);
});
test('Package slider steps stay bounded and do not enter a shop or mutate its assets',async()=>{
 const c=setup();await c.click('[data-cc-action="detail"]');
 const gallery=c.root.querySelector('[data-cc-gallery="p"]');Object.defineProperty(gallery,'clientWidth',{value:390});gallery.scrollLeft=0;
 await c.click('[data-cc-action="slide-package"][data-product="p"][data-direction="1"]');
 assert.equal(gallery.scrollLeft,390);assert.equal(c.root.querySelector('[data-cc-position="p"]').textContent,'2 / 2');
 await c.click('[data-cc-action="slide-package"][data-product="p"][data-direction="1"]');assert.equal(gallery.scrollLeft,390);
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').photoIds,['a','b','c']);
});

test('Still copy and True copy retain their different links; Sended persists the sent marker',async()=>{
 const c=setup(),copied=[],previous=Object.getOwnPropertyDescriptor(navigator,'clipboard');
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>copied.push(text)}});
 try{
  await c.click('[data-cc-action="toggle-links"]');
  await c.click('[data-cc-action="still"]');await c.click('[data-cc-action="copy"]');
  assert.equal(copied[0],contentLink('shop',true));assert.equal(copied[1],contentLink('shop'));
  assert.notEqual(copied[0],copied[1]);
  await c.click('[data-cc-action="sent"]');assert.equal(c.docs.get('contentCreatorPages/shop').workflow,'sent');
  assert.equal(c.root.querySelector('[data-cc-action="sent"]').getAttribute('aria-pressed'),'true');
 }finally{if(previous)Object.defineProperty(navigator,'clipboard',previous);else delete navigator.clipboard;}
});
test('Touch double tap collapses a card once even if a browser also fires dblclick',async()=>{
 const c=setup(),window=c.root.ownerDocument.defaultView;
 const target=c.root.querySelector('.cc-live-label');
 const touch=()=>{const event=new window.Event('pointerup',{bubbles:true});Object.defineProperties(event,{pointerType:{value:'touch'},clientX:{value:20},clientY:{value:20}});target.dispatchEvent(event);};
 touch();touch();assert.equal(c.store.getState().contentCreator.collapsedCards.live,true);
 c.root.querySelector('.cc-live-card').dispatchEvent(new window.Event('dblclick',{bubbles:true}));
 assert.equal(c.store.getState().contentCreator.collapsedCards.live,true);
});

test('Marking a Working business as sent does not bypass its Ready step',async()=>{
 const c=setup();const page={...c.docs.get('contentCreatorPages/shop'),workflow:'working'};
 c.docs.set('contentCreatorPages/shop',page);c.store.actions.patchContentCreator({pages:[page]});
 await c.click('[data-cc-action="toggle-links"]');await c.click('[data-cc-action="sent"]');
 assert.equal(c.docs.get('contentCreatorPages/shop').workflow,'working');
 assert.equal(c.root.querySelector('[data-cc-action="sent"]').getAttribute('aria-pressed'),'true');
});
