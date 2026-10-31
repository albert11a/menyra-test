import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { deleteCreatorBusinessStep, DELETE_CREATOR_BUSINESS } from '../server/creator-business-delete.js';
import { serveCreatorBusinessDelete } from '../api/content-creator-delete.js';
import { createCreatorBusinessDeletion } from '../apps/mnyra-heart/heart-creator-business-delete.js';
import { renderContentCreator, renderBusinessDelete } from '../apps/mnyra-heart/heart-content-creator-render.js';
import { creatorBusinessStatus, creatorBusinessMatches } from '../shared/creator-analytics.js';
import { creatorActivity } from '../server/creator-activity.js';

const pageId='a'.repeat(32),other='b'.repeat(32),visitor='c'.repeat(32);
const root=`contentCreatorPages/${pageId}`,base='projects/menyra-c0e68/databases/(default)/documents/';
const input={pageId,confirm:DELETE_CREATOR_BUSINESS};
function fixture() {
  const docs=new Map(),batches=[];let revision=0;
  function add(path,fields={}){docs.set(path,{name:base+path,fields,updateTime:String(++revision)});}
  add(root,{name:{stringValue:'Test'},kind:{stringValue:'shop'},published:{booleanValue:true}});
  add(`contentCreatorPages/${other}`,{name:{stringValue:'Other'}});
  for(const collection of ['contentCreatorVisits','contentCreatorCarts','contentCreatorOrders']) {
    for(let n=0;n<451;n++)add(`${collection}/${n}`,{pageId:{stringValue:pageId}});
    add(`${collection}/foreign`,{pageId:{stringValue:other}});
  }
  add(`${root}/images/image`,{data:{stringValue:'preview'}});
  add(`${root}/previews/image`,{data:{stringValue:'preview'}});
  add(`${root}/originals/image`,{name:{stringValue:'original.jpg'}});
  for(let n=0;n<451;n++)add(`${root}/originals/image/chunks/${n}`,{data:{stringValue:'bytes'}});
  add(`${root}/originals/image/displays/thumb`);
  // Interrupted old uploads may have descendants without a metadata document.
  add(`${root}/originals/orphan/chunks/0`);
  add('lifeskin/lifeskin/sessions/untouched');
  const repo={
    async read(path){return structuredClone(docs.get(path)||null);},
    async related(collection,id){return [...docs].filter(([path,doc])=>path.startsWith(collection+'/')&&doc.fields.pageId?.stringValue===id).slice(0,200).map(([,doc])=>structuredClone(doc));},
    async list(path,{missing=false,size=200}={}){
      const result=new Map();
      for(const [key,doc]of docs){
        if(!key.startsWith(path+'/'))continue;
        const rest=key.slice(path.length+1),id=rest.split('/')[0];
        if(!rest.includes('/'))result.set(id,structuredClone(doc));
        else if(missing&&!result.has(id))result.set(id,{name:base+path+'/'+id});
      }
      return [...result.values()].sort((a,b)=>a.name.localeCompare(b.name)).slice(0,size);
    },
    async commit(writes){
      assert.ok(writes.length<=200);
      for(const write of writes)if(write.currentDocument?.updateTime)assert.equal(docs.get((write.delete||write.update.name).slice(base.length))?.updateTime,write.currentDocument.updateTime);
      for(const write of writes){
        if(write.delete){
          const path=write.delete.slice(base.length);
          if(path===root)assert.equal([...docs.keys()].some(key=>key.startsWith(root+'/')),false,'parent cannot disappear before children');
          docs.delete(path);
        }else{
          const path=write.update.name.slice(base.length),doc=docs.get(path);
          docs.set(path,{...doc,fields:{...doc.fields,...write.update.fields},updateTime:String(++revision)});
        }
      }
      batches.push(writes);
    }
  };
  return {repo,docs,batches};
}

test('complete bounded deletion removes related records, all photo descendants and orphan chunks, leaves other businesses intact',async()=>{
  const {repo,docs,batches}=fixture();
  let result=await deleteCreatorBusinessStep({...input,phase:6},repo);
  assert.equal(result.done,false);
  assert.equal(docs.get(root).fields.published.booleanValue,false,'public page closes first');
  assert.equal(docs.get(root).fields.deleting.booleanValue,true);
  assert.equal(docs.get(root).fields.deletionPhase.integerValue,'0','client phase ignored');
  let steps=0;
  while(!result.done){assert.ok(++steps<60);result=await deleteCreatorBusinessStep(input,repo);}
  assert.equal([...docs].filter(([path])=>path===root||path.startsWith(root+'/')).length,0);
  assert.equal(docs.size,5,'foreign business, its 3 records and LifeSkin survive');
  assert.ok(batches.length>10);
  assert.deepEqual(await deleteCreatorBusinessStep(input,repo),{ok:true,done:true,deleted:0},'safe retry after a lost final response');
});

test('network failures preserve parent and the server phase; a new client resumes',async()=>{
  const {repo,docs}=fixture();
  await deleteCreatorBusinessStep(input,repo);
  const commit=repo.commit;
  repo.commit=async()=>{throw Error('network');};
  await assert.rejects(deleteCreatorBusinessStep(input,repo),/network/);
  assert.ok(docs.has(root));assert.equal(docs.get(root).fields.deletionPhase.integerValue,'0');
  repo.commit=commit;
  let result;
  do{result=await deleteCreatorBusinessStep(input,repo);}while(!result.done);
  assert.equal(docs.has(root),false);
});

test('validation and path confinement reject unconfirmed deletion and a foreign child',async()=>{
  const {repo,batches}=fixture();
  for(const bad of [{pageId},{...input,pageId:'../x'},{...input,confirm:'RESET_CONTENT_CREATOR'}])await assert.rejects(deleteCreatorBusinessStep(bad,repo));
  assert.equal(batches.length,0);
  await deleteCreatorBusinessStep(input,repo);
  repo.related=async()=>[{name:base+'lifeskin/lifeskin'}];
  await assert.rejects(deleteCreatorBusinessStep(input,repo),/Löschpfad/);
  assert.equal(batches.length,1);
});

function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(text){this.body=JSON.parse(text);}};}
test('HTTP deletion denies GET, anonymous and non-CEO calls before opening storage',async()=>{
  let opened=0;
  const repository=async()=>{opened++;throw Error('never');};
  for(const [method,authorized,status]of [['GET',true,405],['POST',false,403]]){
    const res=response();await serveCreatorBusinessDelete({method,body:input},res,{authorize:async()=>authorized,repository});
    assert.equal(res.statusCode,status);assert.equal(res.headers['Cache-Control'],'no-store');
  }
  assert.equal(opened,0);
});

test('bottom delete card requires confirmation, can cancel, renders resumable deletion and removes the obsolete Shop switch',()=>{
  const page={id:pageId,name:'Cafe <unsafe>',kind:'promo',photoIds:[],published:true};
  let {document}=parseHTML(renderContentCreator({pages:[page],selectedId:pageId,visits:[]}));
  const detail=document.querySelector('.cc-detail');
  assert.ok(detail.lastElementChild.classList.contains('cc-business-delete'));
  assert.equal(document.querySelector('[data-cc-action="convert-shop"]'),null);
  assert.equal(document.querySelector('[data-cc-action="cancel-business-delete"]'),null);
  assert.equal(document.querySelector('unsafe'),null);
  ({document}=parseHTML(renderBusinessDelete(page,{deleteBusinessConfirm:pageId})));
  assert.ok(document.querySelector('[data-cc-action="cancel-business-delete"]'));
  assert.match(document.documentElement.textContent,/endgültig löschen/);
  ({document}=parseHTML(renderContentCreator({pages:[{...page,deleting:true}],selectedId:pageId,visits:[]})));
  assert.match(document.documentElement.textContent,/Löschen fortsetzen/);
  assert.equal(document.querySelector('[data-cc-action="cancel-business-delete"]'),null);
  assert.equal(document.querySelector('[data-cc-add]'),null);
  ({document}=parseHTML(renderContentCreator({pages:[{...page,deleting:true,published:false,photoIds:['old']}],expandedBusinesses:{[pageId]:true}})));
  assert.equal(document.querySelector('[data-cc-action="resume"]'),null);
  assert.equal(document.querySelector('[data-cc-action="copy"]'),null);
});

test('controller confirms, blocks duplicate runs and returns to list only after complete success',async()=>{
  let state={pages:[{id:pageId}]},calls=0,removed=0,fail=true;
  const controller=createCreatorBusinessDeletion({getState:()=>state,patch:data=>Object.assign(state,data),deleted:id=>{assert.equal(id,pageId);removed++;},request:async()=>{calls++;if(fail)throw Error('network');return {ok:true,done:true};}});
  await controller.remove(pageId);assert.equal(calls,0);
  controller.cancel();assert.equal(state.deleteBusinessConfirm,'');
  await controller.remove(pageId);
  const active=controller.remove(pageId);await controller.remove(pageId);await active;
  assert.equal(calls,1);assert.equal(removed,0);assert.match(state.deleteBusinessError,/network/);
  fail=false;await controller.remove(pageId);
  assert.equal(removed,1);assert.equal(state.deletingBusinessId,'');
});

test('normal links immediately route Working and legacy pages to Seen; silent mode without visits does not',async()=>{
  const page={id:pageId,workflow:'working',published:true};
  assert.equal(creatorBusinessStatus(page,[]),'working');
  const records=new Map([[`contentCreatorPages/${pageId}`,page]]);
  const repo={read:async path=>records.get(path),write:async(path,data)=>records.set(path,data)};
  await creatorActivity({pageId,visitorId:visitor,event:'open'},repo,'2026-10-31T12:00:00Z');
  const visits=[records.get(`contentCreatorVisits/${pageId}_${visitor}`)];
  assert.equal(creatorBusinessStatus(page,visits),'seen');
  assert.equal(creatorBusinessMatches(page,{visits,filter:'seen'}),true);
  assert.equal(creatorBusinessMatches(page,{visits,filter:'working'}),false);
  assert.equal(creatorBusinessStatus({...page,workflow:'ready'},visits),'seen');
  assert.equal(creatorBusinessStatus({...page,workflow:'archived'},visits),'archived');
  assert.equal(creatorBusinessStatus(page,visits,[{pageId,status:'pending'}]),'customer');
  page.published=false;await assert.rejects(creatorActivity({pageId,visitorId:visitor,event:'open'},repo),/nicht verfügbar/);
});

test('public writes transact against the live page and roll back if the deletion lock wins',async()=>{
  const {guardedCreatorWrite}=await import('../server/creator-guarded-write.js');
  for(const locked of [false,true]){
    const calls=[];
    const fetchFn=async(url,options)=>{
      calls.push({url,options});
      if(url.endsWith(':beginTransaction'))return {ok:true,json:async()=>({transaction:'transaction-token'})};
      if(url.includes('?transaction='))return {ok:true,json:async()=>({fields:{published:{booleanValue:!locked},deleting:{booleanValue:locked}}})};
      if(url.endsWith(':commit'))return {ok:true};
      if(url.endsWith(':rollback'))return {ok:true};
      throw Error('Unexpected request');
    };
    const write={update:{name:base+'contentCreatorVisits/visitor',fields:{}}};
    const run=()=>guardedCreatorWrite({base:'https://firestore.invalid/documents',headers:{},pagePath:root,write,fetchFn});
    if(locked){
      await assert.rejects(run(),/nicht mehr verfügbar/);
      assert.equal(calls.some(call=>call.url.endsWith(':commit')),false);
      assert.ok(calls.some(call=>call.url.endsWith(':rollback')));
    }else{
      assert.equal(await run(),true);
      const body=JSON.parse(calls.find(call=>call.url.endsWith(':commit')).options.body);
      assert.equal(body.transaction,'transaction-token');assert.deepEqual(body.writes,[write]);
      assert.equal(calls.some(call=>call.url.endsWith(':rollback')),false);
    }
  }
});


test('deletion lock blocks public HTML and activity even if a stale client re-publishes an empty shop',async()=>{
 const {serveContentCreator}=await import('../api/content-creator.js');
 const {shopQuote}=await import('../shared/content-creator-shop.js');
 const page={published:true,deleting:true,kind:'shop',photoIds:[],products:[]};
 const res={setHeader(){},end(body){this.body=body;}};
 await serveContentCreator({method:'GET',url:'/content-creator/'+pageId,query:{id:pageId}},res,{read:async()=>page});
 assert.equal(res.statusCode,404);
 await assert.rejects(creatorActivity({pageId,visitorId:visitor,event:'open'},{read:async()=>page}),/nicht verfügbar/);
 assert.throws(()=>shopQuote(page,['anything']),/nuk është/);
});
