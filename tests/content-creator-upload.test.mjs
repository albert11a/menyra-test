import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {createHeartStore,createHeartInitialState} from '../apps/mnyra-heart/heart-state.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';
import {contentLink} from '../shared/content-creator.js';

// Isolate browser SDK imports while exercising the production controller and events.
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator.js',import.meta.url),'utf8'))
 .replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ');
const factory=new Function('db','collection','doc','onSnapshot','setDoc','updateDoc','writeBatch','serverTimestamp','CC_PAGES','CC_VISITS','contentLink',`${source}\nreturn createContentCreator;`);
function setup(failImage=false){
 const {document,window}=parseHTML('<div id="app"></div>'),root=document.getElementById('app');
 const store=createHeartStore(createHeartInitialState());store.actions.patchContentCreator({editor:true,draftName:'Bistro & Co'});
 const writes=[],publications=[];let fail=failImage;
 const setDoc=async(ref,data)=>{if(fail&&ref.includes('/images/'))throw Error('Upload interrupted');writes.push({ref,data});};
 const doc=(...args)=>args.filter(a=>typeof a==='string').join('/');
 const create=factory({},()=>'',doc,()=>()=>{},setDoc,async()=>{},()=>({update:(ref,data)=>publications.push({ref,data}),commit:async()=>{}}),()=>({server:true}),'contentCreatorPages','contentCreatorVisits',contentLink);
 store.subscribe(state=>{root.innerHTML=renderContentCreator(state.contentCreator);});root.innerHTML=renderContentCreator(store.getState().contentCreator);
 create({root,store,prepareImage:async()=> 'data:image/jpeg;base64,AAAA'});
 function change(name,files){const input=root.querySelector(`[name="${name}"]`);Object.defineProperty(input,'files',{value:files,configurable:true});input.dispatchEvent(new window.Event('change',{bubbles:true}));}
 change('avatar',[{name:'logo.jpg'}]);change('photos',[{name:'one.jpg'},{name:'two.jpg'}]);
 const submit=()=>root.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
 return {store,writes,publications,submit,setFailure:value=>{fail=value;}};
}
async function settled(ctx){for(let i=0;i<30;i++){await new Promise(resolve=>setImmediate(resolve));if(!ctx.store.getState().contentCreator.saving)return;}throw Error('Upload did not finish');}

test('Mehrfachupload veröffentlicht erst nach allen Bildschreibvorgängen',async()=>{
 const ctx=setup();ctx.submit();ctx.submit();await settled(ctx);
 assert.equal(ctx.writes.filter(w=>w.ref.includes('/images/')).length,2);
 assert.equal(ctx.writes[0].data.published,false);assert.equal(ctx.writes[0].data.workflow,'working');
 assert.equal(ctx.publications.length,1);assert.deepEqual(ctx.publications[0].data.photoIds,['000','001']);
 assert.equal(ctx.publications[0].data.published,true);assert.equal(ctx.publications[0].data.workflow,'ready');
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
