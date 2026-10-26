import test from 'node:test';
import assert from 'node:assert/strict';
import { fastKonfig, fastEmpfehlung, fastAntwortenOk } from '../shared/lifeskin-fast.js';
import { createFastHandler, fastTicket } from '../api/lifeskin-fast.js';
import { FastLauf } from '../apps/lifeskin/lifeskin-fast.js';
import { felder } from '../apps/lifeskin/lifeskin-session.js';
import { wert } from '../api/lifeskin-meldung.js';
import { renderFastKnopf, renderFastPreise } from '../apps/mnyra-heart/heart-lifeskin-fast.js';

const catalog = ['acne', 'pore', 'moistur', 'pigment', 'clean'].map(x => ({ id: `lf-${x}`, name: `LF ${x.toUpperCase()}`, availability: 'visible' }));
const a = changes => ({ anliegen: ['pucrrat'], lekura: 'perzier', kujdesi: ['asnjera'], perdorimi: ['asgje'], ...changes });
const ids = result => result.produkte.map(p => p.id);

test('Fast starts disabled and has independent bounded 2/3/4-set prices', () => {
  assert.deepEqual(fastKonfig(), { enabled: false, prices: { 2:25, 3:35, 4:45 } });
  assert.deepEqual(fastKonfig({ enabled:'true', prices:{ 2:'', 3:-1, 4:Infinity } }).prices, { 2:25,3:35,4:45 });
  assert.equal(fastKonfig({ enabled:true,prices:{3:37.125} }).prices[3],37.13);
});
test('Exact requested acne/pores/moisture bundle, deduplication and 2/3/4 pricing', () => {
  assert.deepEqual(ids(fastEmpfehlung(a(), {}, catalog)), ['lf-acne','lf-moistur']);
  const triple = fastEmpfehlung(a({ anliegen:['pucrrat','poret'] }), {}, catalog);
  assert.deepEqual(ids(triple), ['lf-acne','lf-pore','lf-moistur']);
  assert.equal(triple.preis,35);
  assert.equal(fastEmpfehlung(a({anliegen:['pucrrat','poret','njollat']}),{},catalog).preis,45);
  assert.equal(fastEmpfehlung(a({anliegen:['poret','shkelqimi']}),{},catalog).preis,25);
  assert.equal(fastEmpfehlung(a(),{prices:{2:29}},catalog).preis,29);
});
test('Every concern combination is bounded, deterministic and includes moistur', () => {
  const concerns=['pucrrat','poret','shkelqimi','njollat','skuqja','thate','rrudhat'];
  for(let mask=1;mask<128;mask++) {
    const selected=concerns.filter((_,i)=>mask&(1<<i));
    if(selected.length>3)continue;
    const r=fastEmpfehlung(a({anliegen:selected}),{},catalog);
    assert.ok(r.produkte.length>=2&&r.produkte.length<=4);
    assert.ok(ids(r).includes('lf-moistur'));
    assert.equal(new Set(ids(r)).size,r.produkte.length);
    assert.deepEqual(r,fastEmpfehlung(a({anliegen:selected}),{},catalog));
  }
});
test('Current pregnancy and treatment safety answers retain the basic-care exception', () => {
  for (const change of [{kujdesi:['shtatzeni']},{kujdesi:['izotretinoin']},{kujdesi:['trajtim']}]) {
    assert.deepEqual(ids(fastEmpfehlung(a(change),{},catalog)), ['lf-clean','lf-moistur']);
  }
});
test('Dry skin, redness and historical treatments preserve the selected acne/pores set', () => {
  for (const change of [{lekura:'thate'}, {perdorimi:['mjek']}, {anliegen:['pucrrat','poret','skuqja']}, {lekura:'thate',perdorimi:['mjek']}]) {
    const result = fastEmpfehlung(a({anliegen:['pucrrat','poret'],...change}),{},catalog);
    assert.deepEqual(ids(result), ['lf-acne','lf-pore','lf-moistur']);
    assert.equal(result.preis,35);
    assert.equal(result.raport.shitja.shqetesimi,'');
  }
  const result = fastEmpfehlung(a({anliegen:['pucrrat','poret','njollat'],lekura:'thate',perdorimi:['mjek']}),{},catalog);
  assert.deepEqual(ids(result),['lf-acne','lf-pore','lf-pigment','lf-moistur']);
  assert.equal(result.preis,45);
});
test('Incomplete, fabricated, duplicate and contradictory answers are rejected', () => {
  for(const bad of [{},{...a(),anliegen:[]},a({anliegen:['pucrrat','pucrrat']}),a({kujdesi:['asnjera','shtatzeni']}),a({anliegen:['nukEdi','pucrrat']}),a({perdorimi:['anything']})]) {
    assert.equal(Boolean(fastAntwortenOk(bad)),false);
    assert.throws(()=>fastEmpfehlung(bad,{},catalog),/answers/);
  }
  assert.throws(()=>fastEmpfehlung(a(),{},catalog.filter(p=>p.id!=='lf-acne')),/unavailable/);
});
test('Public recommendation has no private safety answers or fabricated clinical findings', () => {
  const r=fastEmpfehlung(a({kujdesi:['shtatzeni']}),{},catalog);
  assert.equal(r.raport.aerztlichGeprueft,false);
  assert.match(r.befund,/Bazuar në përgjigjet tuaja/);
  assert.doesNotMatch(JSON.stringify(r),/shtatzeni|izotretinoin|phone|diagnoza|parametrat|80%/);
});

const id='a'.repeat(32), createdAt='2026-10-26T20:00:00.000Z';
const secret={private_key:'unit-test-only'};
const decode = f => Object.fromEntries(Object.entries(f).map(([k,v])=>[k,wert(v)]));
function fixture({enabled=true,step='opened',weg='',reportStatus='wartet',photo=true,failCommit=false}={}) {
  const docs=new Map();
  const root='lifeskin/lifeskin';
  docs.set(`${root}/sessions/${id}`,{createdAt,code:'TEST',name:'Test',step,source:{weg},typ:'foto',anamnese:a({anliegen:['pucrrat','poret']})});
  docs.set(`${root}/reports/${id}`,{createdAt,status:reportStatus,photos:1});
  docs.set(`${root}/config/fast`,{enabled,prices:{2:25,3:35,4:45}});
  for(const p of catalog)docs.set(`${root}/products/${p.id}`,p);
  const commits=[];
  const fetchFn=async(url,options={})=>{
    if(url.endsWith(':commit')) {
      if(failCommit)return {ok:false};
      const body=JSON.parse(options.body);commits.push(body);
      for(const w of body.writes) {
        const path=w.update.name.split('/documents/')[1];
        const data=decode(w.update.fields);
        docs.set(path,{...docs.get(path),...data});
      }
      return {ok:true,json:async()=>({})};
    }
    const path=url.split('/documents/')[1].split('?')[0];
    if(path.endsWith('/photos'))return {ok:true,json:async()=>({documents:photo?[{fields:felder({blick:'zona'})}]:[]})};
    const data=docs.get(path);
    return {ok:!!data,status:data?200:404,json:async()=>({fields:felder(data),updateTime:'2026-10-26T20:00:01Z'})};
  };
  const handler=createFastHandler({key:()=>secret,token:async()=> 'test-token',fetchFn,now:()=> '2026-10-26T20:01:00.000Z'});
  const call=async body=>{
    let json;const res={setHeader(){},end(value){json=JSON.parse(value)}};
    await handler({method:'POST',body:{id,...body},headers:{origin:'https://mnyra.com',host:'mnyra.com'}},res);
    return {status:res.statusCode,...json};
  };
  return {docs,commits,call,root};
}
test('Server pins enabled sessions, ignores request prices, commits ready report and Fast case together',async()=>{
  const f=fixture();const start=await f.call({action:'start'});
  assert.equal(start.enabled,true);
  assert.equal(start.ticket,fastTicket(secret,id,createdAt));
  const result=await f.call({action:'generate',ticket:start.ticket,preis:1});
  assert.equal(result.status,200);
  const r=f.docs.get(`${f.root}/reports/${id}`);
  assert.equal(r.status,'fertig');assert.equal(r.preis,35);
  assert.equal(f.commits[0].writes[0].currentDocument.updateTime,'2026-10-26T20:00:01Z');
  assert.equal(f.commits[0].writes[1].updateMask.fieldPaths[0],'source.fast');
  assert.equal(f.docs.get(`${f.root}/sessions/${id}`).source.fast,true);
  await f.call({action:'generate',ticket:start.ticket});
  assert.equal(f.commits.length,1);
});
test('Switch off stops new sessions; already opted-in cases complete; old prices freeze',async()=>{
  const f=fixture();const start=await f.call({action:'start'});
  f.docs.set(`${f.root}/config/fast`,{enabled:false,prices:{2:27,3:39,4:49}});
  assert.equal((await f.call({action:'start'})).enabled,false);
  assert.equal((await f.call({action:'generate',ticket:start.ticket})).ok,true);
  assert.equal(f.docs.get(`${f.root}/reports/${id}`).preis,39);
  f.docs.set(`${f.root}/config/fast`,{enabled:false,prices:{3:1}});
  await f.call({action:'generate',ticket:start.ticket});
  assert.equal(f.docs.get(`${f.root}/reports/${id}`).preis,39);
});
test('No ticket, wrong session, no photo, other funnels and interrupted save cannot publish',async()=>{
  for(const options of [{photo:false},{weg:'lifeskinshop'},{weg:'lifeskin2'}]) {
    const f=fixture(options);
    const r=await f.call({action:'generate',ticket:fastTicket(secret,id,createdAt)});
    assert.equal(r.ok,false);assert.equal(f.commits.length,0);
  }
  const f=fixture();
  assert.equal((await f.call({action:'generate',ticket:'f'.repeat(64)})).status,403);
  assert.equal((await f.call({action:'generate',ticket:fastTicket(secret,'b'.repeat(32),createdAt)})).status,403);
  const fail=fixture({failCommit:true});
  assert.equal((await fail.call({action:'generate',ticket:fastTicket(secret,id,createdAt)})).status,503);
  assert.equal(fail.docs.get(`${fail.root}/reports/${id}`).status,'wartet');
});
test('Existing ordered and clinician-released reports are never overwritten',async()=>{
  for(const reportStatus of ['bestellt','versandt','fertig']) {
    const f=fixture({reportStatus});
    assert.equal((await f.call({action:'generate',ticket:fastTicket(secret,id,createdAt)})).ok,true);
    assert.equal(f.commits.length,0);
    assert.equal(f.docs.get(`${f.root}/reports/${id}`).status,reportStatus);
  }
});
test('Client makes one decision, persists mode across refresh and only uses saved ticket for generation',async()=>{
  const mem=new Map(), storage={getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)};
  const calls=[];
  const session={id,kette:Promise.resolve()};
  const fetchFn=async(url,options)=>{
    calls.push(url);
    if(url.startsWith('https:'))return {ok:true,json:async()=>({fields:felder({enabled:true})})};
    const b=JSON.parse(options.body);
    return {ok:true,json:async()=>b.action==='start'?{ok:true,ticket:'signed-ticket'}:{ok:true}};
  };
  const run=new FastLauf(session,{storage,fetchFn});
  assert.deepEqual(await Promise.all([run.decide(),run.decide()]),[true,true]);
  assert.equal(calls.length,2);
  const resumed=new FastLauf(session,{storage,fetchFn});
  assert.equal(await resumed.decide(),true);assert.equal(calls.length,2);
  await resumed.generate();assert.equal(calls.length,3);
});
test('Header states and editable prices use separate Fast actions',()=>{
  assert.match(renderFastKnopf({status:'ready'}),/aria-pressed="false"/);
  assert.match(renderFastKnopf({status:'ready',fast:{enabled:true}}),/aria-pressed="true"/);
  assert.match(renderFastKnopf({status:'loading'}),/ disabled/);
  const html=renderFastPreise();
  for(const price of [25,35,45])assert.match(html,new RegExp(`value="${price}"`));
});

test('Switching between image and body/question paths keeps Fast on image paths only', async()=>{
  const mem=new Map(), storage={getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)};
  const run=new FastLauf({id,kette:Promise.resolve()},{storage,fetchFn:async()=>({ok:true,json:async()=>({fields:felder({enabled:false})})})});
  run.ticket='signed';run.select('foto');run.persist();assert.equal(run.active,true);
  run.select('trup');assert.equal(run.active,false);
  assert.equal(new FastLauf({id},{storage}).active,false);
  run.select('scan');assert.equal(run.active,true);
  run.select('pytje');assert.equal(run.active,false);
});
test('Failed background answer writes are retried, and saved answers survive interrupted generation',async()=>{
  const mem=new Map(), storage={getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)};
  const writes=[];
  const session={id,kette:Promise.resolve(),ergaenze:async value=>writes.push(value)};
  const run=new FastLauf(session,{storage,fetchFn:async()=>{throw Error('offline')}});
  run.ticket='signed';run.select('foto');run.remember({...a(),emri:'Test',mosha:'25-34'});
  await assert.rejects(()=>run.generate(),/offline/);
  assert.equal(writes.length,1);
  const resumed=new FastLauf(session,{storage,fetchFn:async()=>({ok:true,json:async()=>({ok:true})})});
  await resumed.generate();
  assert.equal(writes.length,2);
  assert.equal(writes[1].name,'Test');assert.equal(writes[1].ageBand,'25-34');
  assert.deepEqual(resumed.answers.anliegen,['pucrrat']);
});
test('Server rejects stale persisted answers instead of publishing a set for old choices',async()=>{
  const f=fixture();
  const result=await f.call({action:'generate',ticket:fastTicket(secret,id,createdAt),answers:a({anliegen:['njollat']})});
  assert.equal(result.status,409);assert.equal(f.commits.length,0);
});

test('Activation readiness check verifies the server without modifying customer data',async()=>{
  const f=fixture({enabled:false});
  assert.equal((await f.call({action:'check'})).ok,true);
  assert.equal(f.commits.length,0);
  const handler=createFastHandler({key:()=>null});
  let data;const res={setHeader(){},end(v){data=JSON.parse(v)}};
  await handler({method:'POST',body:{action:'check'},headers:{}},res);
  assert.equal(res.statusCode,503);assert.equal(data.ok,false);
});
