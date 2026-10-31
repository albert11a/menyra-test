import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {createHeartStore,createHeartInitialState} from '../apps/mnyra-heart/heart-state.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';
import {initialShopProduct,priceCents} from '../shared/content-creator-shop.js';
import {contentLink} from '../shared/content-creator.js';

// Isolate browser SDK imports while exercising the production controller and events.
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator.js',import.meta.url),'utf8'))
 .replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ');
const factory=new Function('db','collection','doc','onSnapshot','setDoc','updateDoc','writeBatch','serverTimestamp','CC_PAGES','CC_VISITS','contentLink','initialShopProduct','getDoc','priceCents',`const creatorCdnEnabled=async()=>false; const savePromoAsset=async(pageId,imageId,file,data)=>setDoc(doc(db,CC_PAGES,pageId,'images',imageId),{data,caption:''});\n${source}\nreturn createContentCreator;`);
function setup(failImage=false,shop=false,empty=false){
 const {document,window}=parseHTML('<div id="app"></div>'),root=document.getElementById('app');
 const store=createHeartStore(createHeartInitialState());store.actions.patchContentCreator({editor:true,draftName:'Bistro & Co',pageKind:shop?'shop':'promo',shopPrice:'29',shopTitle:'4 Fotos'});
 const writes=[],publications=[],docs=new Map();let fail=failImage;
 const setDoc=async(ref,data)=>{if(fail&&ref.includes('/images/'))throw Error('Upload interrupted');writes.push({ref,data});docs.set(ref,{...docs.get(ref),...data});};
 const doc=(...args)=>args.filter(a=>typeof a==='string').join('/');
 const create=factory({},()=>'',doc,()=>()=>{},setDoc,async(ref,data)=>docs.set(ref,{...docs.get(ref),...data}),()=>({update:(ref,data)=>{publications.push({ref,data});docs.set(ref,{...docs.get(ref),...data});},commit:async()=>{}}),()=>({server:true}),'contentCreatorPages','contentCreatorVisits',contentLink,initialShopProduct,async ref=>({data:()=>docs.get(ref)}),priceCents);
 store.subscribe(state=>{root.innerHTML=renderContentCreator(state.contentCreator);});root.innerHTML=renderContentCreator(store.getState().contentCreator);
 const assets=[];create({root,store,prepareImage:async()=> 'data:image/jpeg;base64,AAAA',saveAsset:async(...args)=>assets.push(args)});
 function change(name,files){const input=root.querySelector(`[name="${name}"]`);Object.defineProperty(input,'files',{value:files,configurable:true});input.dispatchEvent(new window.Event('change',{bubbles:true}));}
 if(!empty){change('avatar',[{name:'logo.jpg'}]);change('photos',[{name:'one.jpg'},{name:'two.jpg'}]);}
 const submit=()=>root.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
 return {store,writes,publications,submit,assets,docs,root,window,setFailure:value=>{fail=value;}};
}
async function settled(ctx){for(let i=0;i<30;i++){await new Promise(resolve=>setImmediate(resolve));if(!ctx.store.getState().contentCreator.saving)return;}throw Error('Upload did not finish');}

test('Mehrfachupload veröffentlicht erst nach allen Bildschreibvorgängen',async()=>{
 const ctx=setup();ctx.submit();ctx.submit();await settled(ctx);
 assert.equal(ctx.writes.filter(w=>w.ref.includes('/images/')).length,2);
 assert.equal(ctx.writes[0].data.published,false);assert.equal(ctx.writes[0].data.workflow,'working');
 assert.equal(ctx.publications.length,1);assert.deepEqual(ctx.publications[0].data.photoIds,['000','001']);
 assert.equal(ctx.publications[0].data.published,true);assert.equal(ctx.publications[0].data.workflow,'working');
 assert.equal(ctx.store.getState().contentCreator.editor,false);
});
test('Unterbrochener Upload bleibt privat und lässt sich mit derselben Seite wiederholen',async()=>{
 const ctx=setup(true);ctx.submit();await settled(ctx);
 assert.equal(ctx.publications.length,0);assert.equal(ctx.store.getState().contentCreator.editor,true);
 assert.match(ctx.store.getState().contentCreator.editorError,/Upload interrupted/);
 const first=ctx.writes[0].ref;ctx.setFailure(false);ctx.submit();await settled(ctx);
 assert.equal(ctx.publications.length,1);assert.equal(ctx.publications[0].ref,first);
 assert.equal(ctx.writes.filter(w=>!w.ref.includes('/images/')).length,2);
});

test('Shop-Upload erstellt ein Paket, Originale und sichere Vorschauen vor Veröffentlichung',async()=>{
 const ctx=setup(false,true);ctx.submit();await settled(ctx);
 assert.equal(ctx.writes[0].data.kind,'shop');assert.equal(ctx.assets.length,2);
 assert.equal(ctx.publications[0].data.products.length,1);assert.equal(ctx.publications[0].data.products[0].priceCents,2900);assert.deepEqual(ctx.publications[0].data.products[0].imageIds,['000','001']);
});

test('Betrieb ohne Fotos, Logo oder Paketpreis erstellen und erstes Paket später ergänzen',async()=>{
 const ctx=setup(false,true,true);ctx.store.actions.patchContentCreator({shopPrice:'',shopTitle:''});
 assert.equal(ctx.root.querySelector('[name="shopPrice"]'),null);
 ctx.submit();await settled(ctx);
 const state=ctx.store.getState().contentCreator,page=state.pages[0];
 assert.equal(state.editor,false);assert.equal(state.selectedId,page.id);assert.equal(page.published,false);
 assert.deepEqual(page.photoIds,[]);assert.deepEqual(page.products,[]);assert.equal(ctx.assets.length,0);
 const form=ctx.root.querySelector('#cc-add-package');assert.ok(form);
 form.querySelector('[name="title"]').value='Fishop 1';form.querySelector('[name="price"]').value='0';
 Object.defineProperty(form.querySelector('[name="files"]'),'files',{value:[{name:'large.png'}]});
 form.dispatchEvent(new ctx.window.Event('submit',{bubbles:true,cancelable:true}));
 for(let i=0;i<30;i++)await new Promise(r=>setImmediate(r));
 const saved=ctx.docs.get('contentCreatorPages/'+page.id);
 assert.equal(saved.published,true);assert.equal(saved.workflow,'working');assert.equal(saved.products[0].priceCents,0);
 assert.equal(saved.photoIds.length,1);assert.equal(ctx.assets.length,1);assert.equal(ctx.store.getState().contentCreator.mediaError,'');
});
test('Auch eine Vorschau-Seite kann zunächst ohne Bilder angelegt werden',async()=>{
 const ctx=setup(false,false,true);ctx.submit();await settled(ctx);
 assert.equal(ctx.store.getState().contentCreator.editor,false);assert.equal(ctx.publications[0].data.published,false);
 assert.deepEqual(ctx.publications[0].data.photoIds,[]);assert.equal(ctx.assets.length,0);
 const input=ctx.root.querySelector('[data-cc-add]');Object.defineProperty(input,'files',{value:[]});input.dispatchEvent(new ctx.window.Event('change',{bubbles:true}));
 await new Promise(r=>setImmediate(r));assert.equal(ctx.store.getState().contentCreator.pages[0].published,false);
});
