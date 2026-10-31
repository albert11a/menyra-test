import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {createHeartStore,createHeartInitialState} from '../apps/mnyra-heart/heart-state.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';
import {contentLink} from '../shared/content-creator.js';
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ');
const factory=new Function('db','collection','doc','getDoc','onSnapshot','setDoc','updateDoc','writeBatch','serverTimestamp','CC_PAGES','CC_VISITS','contentLink',`const creatorCdnEnabled=async()=>false; const savePromoAsset=async(pageId,imageId,file,data)=>setDoc(doc(db,CC_PAGES,pageId,'images',imageId),{data,caption:''});\n${source}\nreturn createContentCreator;`);
test('Lokal öffnen, Unterschrift speichern, Reihenfolge ändern, löschen und hinzufügen',async()=>{
 const {document,window}=parseHTML('<div id="app"></div>'),root=document.getElementById('app');
 const store=createHeartStore(createHeartInitialState());
 const page={id:'a',name:'Cafe',published:true,workflow:'ready',photoIds:['one','two']},image={data:'data:image/jpeg;base64,YWJj',caption:'Original'};
 const docs=new Map([['contentCreatorPages/a',{...page}],['contentCreatorPages/a/images/one',{...image}],['contentCreatorPages/a/images/two',{...image}]]);
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 const getDoc=async path=>({exists:()=>docs.has(path),data:()=>docs.get(path)});
 const update=async(path,data)=>docs.set(path,{...docs.get(path),...data});
 const create=factory({},()=>'',doc,getDoc,()=>()=>{},async(path,data)=>docs.set(path,data),update,()=>{
 const writes=[];return {update:(...args)=>writes.push(()=>update(...args)),delete:path=>writes.push(()=>docs.delete(path)),commit:async()=>{for(const write of writes)await write();}};
 },()=>'', 'contentCreatorPages','contentCreatorVisits',contentLink);
 store.actions.patchContentCreator({pages:[page],visits:[{pageId:'a',opened:true,scrolled:true,answer:'yes'}]});
 store.subscribe(state=>{root.innerHTML=renderContentCreator(state.contentCreator);});root.innerHTML=renderContentCreator(store.getState().contentCreator);
 create({root,store,prepareImage:async()=>image.data});
 async function settle(){for(let i=0;i<10;i++)await new Promise(r=>setImmediate(r));}
 async function click(selector){const node=root.querySelector(selector);assert.ok(node,selector);node.dispatchEvent(new window.Event('click',{bubbles:true}));await settle();}
 await click('[data-cc-action="detail"]');assert.equal(store.getState().contentCreator.selectedId,'a');assert.match(root.innerHTML,/Ja geklickt/);
 const field=root.querySelector('[data-edit-caption="one"]');field.value='Neue Unterschrift';field.dispatchEvent(new window.Event('input',{bubbles:true}));
 await click('[data-cc-action="caption"][data-image="one"]');assert.equal(docs.get('contentCreatorPages/a/images/one').caption,'Neue Unterschrift');
 await click('[data-cc-action="move"][data-image="two"][data-direction="-1"]');assert.deepEqual(docs.get('contentCreatorPages/a').photoIds,['two','one']);
 await click('[data-cc-action="delete"][data-image="two"]');assert.deepEqual(docs.get('contentCreatorPages/a').photoIds,['one']);assert.equal(docs.has('contentCreatorPages/a/images/two'),false);
 const input=root.querySelector('[data-cc-add]');Object.defineProperty(input,'files',{value:[{name:'new.jpg'}]});input.dispatchEvent(new window.Event('change',{bubbles:true}));await settle();
 assert.equal(docs.get('contentCreatorPages/a').photoIds.length,2);assert.equal(store.getState().contentCreator.mediaBusy,false);
 const updated={...docs.get('contentCreatorPages/a'),kind:'shop',products:[{id:'pack',title:'Pako',priceCents:0,active:true,imageIds:['one']}]};
 docs.set('contentCreatorPages/a',updated);store.actions.patchContentCreator({pages:[updated]});
 const hero=root.querySelector('[data-cc-hero][value="one"]');assert.ok(hero);hero.checked=true;hero.setAttribute('checked','');
 hero.dispatchEvent(new window.Event('change',{bubbles:true}));await settle();
 assert.deepEqual(docs.get('contentCreatorPages/a').heroPhotoIds,['one']);

});

test('bestehende Vorschau wird gezielt zum Shop, Bilder, Link, Workflow und Daten bleiben erhalten', async () => {
 const {document,window}=parseHTML('<div id="app"></div>'),root=document.getElementById('app');
 const store=createHeartStore(createHeartInitialState());
 const pages=[{id:'peshku',name:'Peshku i pite',kind:'promo',published:true,photoIds:['one','two'],workflow:'sent',media:{one:{thumb:'saved'}},heroPhotoIds:['one']},
 {id:'maison',name:'La maison bistro',published:true,photoIds:['three'],workflow:'working',products:[{id:'existing',title:'Existing',priceCents:100,imageIds:['three']}]}];
 const docs=new Map(pages.map(p=>[`contentCreatorPages/${p.id}`,structuredClone(p)])),writes=[];
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 const create=factory({},()=>'',doc,async key=>({data:()=>docs.get(key)}),()=>()=>{},()=>{},async(key,data)=>{writes.push({key,data});docs.set(key,{...docs.get(key),...data});},()=>{},()=> 'timestamp','contentCreatorPages','contentCreatorVisits',contentLink);
 const visits=[{pageId:'peshku',opened:true,scrolled:true}],orders=[{id:'order',pageId:'maison'}];
 store.actions.patchContentCreator({pages,visits,orders,selectedId:'peshku'});
 store.subscribe(state=>{root.innerHTML=renderContentCreator(state.contentCreator);});root.innerHTML=renderContentCreator(store.getState().contentCreator);
 create({root,store});
 for(const page of pages){
  store.actions.patchContentCreator({selectedId:page.id});
  const button=root.querySelector('[data-cc-action="convert-shop"]');assert.ok(button);
  button.dispatchEvent(new window.Event('click',{bubbles:true}));button.dispatchEvent(new window.Event('click',{bubbles:true}));
  for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));
  const updated=docs.get(`contentCreatorPages/${page.id}`);
  assert.deepEqual(updated,{...page,kind:'shop',products:page.products||[],updatedAt:'timestamp'});
  assert.equal(root.querySelector('[data-cc-action="convert-shop"]'),null);
  assert.match(root.textContent,/Seitenart: Shop/);
 }
 assert.equal(writes.length,2,'double click does not duplicate conversion');
 assert.deepEqual(store.getState().contentCreator.visits,visits);assert.deepEqual(store.getState().contentCreator.orders,orders);
 assert.deepEqual(Object.keys(writes[0].data).sort(),['kind','products','updatedAt']);
 assert.deepEqual(Object.keys(writes[1].data).sort(),['kind','updatedAt']);
});
