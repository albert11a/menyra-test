import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {createHeartStore,createHeartInitialState} from '../apps/mnyra-heart/heart-state.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';
import {contentLink} from '../shared/content-creator.js';
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ');
const factory=new Function('db','collection','doc','getDoc','onSnapshot','setDoc','updateDoc','writeBatch','serverTimestamp','CC_PAGES','CC_VISITS','contentLink',`${source}\nreturn createContentCreator;`);
function setup(){
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
 },()=>'', 'contentCreatorPages','contentCreatorVisits',contentLink);
 store.actions.patchContentCreator({pages:[page]});store.subscribe(state=>{root.innerHTML=renderContentCreator(state.contentCreator);});root.innerHTML=renderContentCreator(store.getState().contentCreator);
 create({root,store});
 async function click(selector){const node=root.querySelector(selector);assert.ok(node,selector);node.dispatchEvent(new window.Event('click',{bubbles:true}));for(let i=0;i<15;i++)await new Promise(r=>setImmediate(r));}
 return {root,store,docs,click,setFailure:value=>{fail=value;}};
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
test('Shop-Fotos ändern Reihenfolge im Paket; letztes Foto entfernt auch das leere Paket',async()=>{
 const c=setup();await c.click('[data-cc-action="detail"]');
 await c.click('[data-cc-action="move"][data-image="b"][data-direction="-1"]');
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').products[0].imageIds,['b','a']);
 await c.click('[data-cc-action="delete"][data-image="b"]');
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').products.map(p=>p.imageIds),[['a'],['c']]);
 await c.click('[data-cc-action="delete"][data-image="a"]');
 assert.deepEqual(c.docs.get('contentCreatorPages/shop').products.map(p=>p.id),['q']);
 assert.deepEqual(c.store.getState().contentCreator.pages[0].products.map(p=>p.id),['q']);
 assert.equal(c.docs.has('contentCreatorPages/shop/originals/a'),true);
});
const assetSource=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator-shop.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export \{.*\n/gm,'').replace(/export (async )?function /g,'$1function ');
test('Wasserzeichen ist dezenter und verwendet gemessene Wortabstände in allen Bildformaten',()=>{
 const draw=new Function(`${assetSource}\nreturn drawShopWatermark;`)();
 for(const [width,height] of [[720,900],[720,150],[100,720],[32,32]]){
  const rows=new Map();let textWidth=0;const ctx={save(){},restore(){},translate(){},rotate(){},measureText(){textWidth=parseFloat(this.font.split(' ')[1])*9;return {width:textWidth};},fillText(text,x,y){assert.equal(text,'MNYRA · PREVIEW');const xs=rows.get(y)||[];xs.push(x);rows.set(y,xs);}};
  draw(ctx,width,height);assert.equal(ctx.fillStyle,'rgba(255,255,255,.32)');assert.ok(rows.size>1);
  for(const xs of rows.values())for(let i=1;i<xs.length;i++)assert.ok(xs[i]-xs[i-1]>textWidth+30);
 }
});
test('Vorhandene Vorschauen werden aus Originalen erneuert, Bildunterschriften bleiben bestehen',async()=>{
 const docs=new Map([['contentCreatorPages/s/originals/a',{parts:1,mime:'image/jpeg'}],['contentCreatorPages/s/originals/a/chunks/000',{data:btoa('original')}]]),writes=[],urls=[];
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 const ctx={save(){},restore(){},translate(){},rotate(){},measureText:()=>({width:200}),fillText(){},drawImage(){}};
 const document={createElement:()=>({getContext:()=>ctx,toDataURL:()=> 'new-preview'})};
 class Image{constructor(){this.width=720;this.height=900;}async decode(){}}
 const refresh=new Function('db','doc','getDoc','setDoc','CC_PAGES','Image','document','URL',`${assetSource}\nreturn refreshShopPreviews;`)({},doc,async path=>({data:()=>docs.get(path)}),async(...args)=>writes.push(args),'contentCreatorPages',Image,document,{createObjectURL:()=> 'blob:original',revokeObjectURL:url=>urls.push(url)});
 await refresh('s',['a']);assert.equal(writes.length,3);assert.deepEqual(writes[2],['contentCreatorPages/s/images/a',{data:'new-preview'},{merge:true}]);assert.deepEqual(urls,['blob:original']);
 await assert.rejects(refresh('s',['missing']),/Originaldatei fehlt/);assert.equal(writes.length,3);
});
