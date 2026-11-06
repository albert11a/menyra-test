import test,{before,beforeEach,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {serverTimestamp} from 'firebase/firestore';
const id='a'.repeat(32),visitor=`${id}_${'b'.repeat(32)}`;
const [host,port]=String(process.env.FIRESTORE_EMULATOR_HOST||'127.0.0.1:8080').split(':');
let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'mnyra-local-content-creator',firestore:{host,port:Number(port),rules:await readFile(new URL('../../firestore.rules',import.meta.url),'utf8')}});});
beforeEach(async()=>{await env.clearFirestore();await env.withSecurityRulesDisabled(async ctx=>{
 const db=ctx.firestore();await db.doc(`contentCreatorPages/${id}`).set({published:true,name:'Bistro'});
 await db.doc(`contentCreatorPages/${id}/images/000`).set({data:'data:image/jpeg;base64,AAAA'});
 await db.doc('users/ceo-test').set({role:'ceo'});
});});
after(async()=>{if(env)await env.cleanup();});
const guest=()=>env.unauthenticatedContext().firestore();
const data=()=>({pageId:id,opened:true,scrolled:false,answer:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
test('Gäste dürfen veröffentlichte Seiten/Bilder abrufen, aber keine Seitenlisten oder Änderungen',async()=>{
 const db=guest();await assertSucceeds(db.doc(`contentCreatorPages/${id}`).get());
 await assertSucceeds(db.doc(`contentCreatorPages/${id}/images/000`).get());
 await assertFails(db.collection('contentCreatorPages').get());
 await assertFails(db.doc(`contentCreatorPages/${id}`).update({name:'changed'}));
 await assertFails(db.doc(`contentCreatorPages/${id}/images/000`).set({data:'changed'}));
});
test('Entwürfe und deren Bilder bleiben privat',async()=>{
 await env.withSecurityRulesDisabled(ctx=>ctx.firestore().doc(`contentCreatorPages/${id}`).update({published:false}));
 await assertFails(guest().doc(`contentCreatorPages/${id}`).get());
 await assertFails(guest().doc(`contentCreatorPages/${id}/images/000`).get());
 await assertFails(guest().doc(`contentCreatorVisits/${visitor}`).set(data()));
});
test('Sitzung anlegen, scrollen und einmal antworten ist erlaubt; Zurücksetzen ist verboten',async()=>{
 const ref=guest().doc(`contentCreatorVisits/${visitor}`);
 await assertSucceeds(ref.set(data()));await assertSucceeds(ref.get());
 await assertSucceeds(ref.update({scrolled:true,updatedAt:serverTimestamp()}));
 await assertSucceeds(ref.update({answer:'yes',updatedAt:serverTimestamp()}));
 await assertFails(ref.update({answer:'no',updatedAt:serverTimestamp()}));
 await assertFails(ref.update({scrolled:false,updatedAt:serverTimestamp()}));
 await assertFails(ref.update({createdAt:serverTimestamp(),updatedAt:serverTimestamp()}));
 await assertFails(ref.update({unexpected:'data',updatedAt:serverTimestamp()}));
 await assertFails(ref.delete());await assertFails(guest().collection('contentCreatorVisits').get());
});
test('Falsche Seitenkennung und ungültige Antworten werden abgelehnt',async()=>{
 await assertFails(guest().doc(`contentCreatorVisits/${visitor}`).set({...data(),pageId:'c'.repeat(32)}));
 await assertFails(guest().doc(`contentCreatorVisits/${visitor}`).set({...data(),answer:'maybe'}));
});

test('Shop: Originale und Bestellungen bleiben privat; nur Vorschauen sind öffentlich',async()=>{
 await env.withSecurityRulesDisabled(async ctx=>{
  const db=ctx.firestore();await db.doc(`contentCreatorPages/${id}`).update({kind:'shop'});
  await db.doc(`contentCreatorPages/${id}/previews/000`).set({data:'preview'});
  await db.doc(`contentCreatorPages/${id}/originals/000`).set({name:'original.jpg',parts:1});
  await db.doc(`contentCreatorPages/${id}/originals/000/chunks/000`).set({data:'original'});
  await db.doc(`contentCreatorOrders/${id}`).set({approved:false,status:'pending',paymentConfirmed:false,totalCents:2900});
 });
 const db=guest();await assertFails(db.doc(`contentCreatorPages/${id}/images/000`).get());
 await assertSucceeds(db.doc(`contentCreatorPages/${id}/previews/000`).get());
 await assertFails(db.doc(`contentCreatorPages/${id}/originals/000`).get());
 await assertFails(db.doc(`contentCreatorPages/${id}/originals/000/chunks/000`).get());
 await assertFails(db.doc(`contentCreatorOrders/${id}`).get());
 await assertFails(db.doc(`contentCreatorOrders/${id}`).set({approved:true,status:'released'}));
 await assertFails(db.doc(`contentCreatorCarts/${id}`).set({totalCents:1}));
 const ceo=env.authenticatedContext('ceo-test').firestore();
 await assertFails(ceo.doc(`contentCreatorOrders/${id}`).update({approved:true,status:'released'}));
 await assertSucceeds(ceo.doc(`contentCreatorOrders/${id}`).update({approved:true,status:'released',paymentConfirmed:true}));
 await assertFails(ceo.doc(`contentCreatorOrders/${id}`).update({totalCents:1}));
});

test('Only Heart can read photo counters, and browser clients cannot write counters or sessions',async()=>{
 const stats=`contentCreatorPages/${id}/photoStats/000`,session=`contentCreatorPages/${id}/photoViewSessions/test`;
 await env.withSecurityRulesDisabled(async ctx=>{
  await ctx.firestore().doc(stats).set({viewCount:1});
  await ctx.firestore().doc(session).set({files:['000']});
 });
 const ceo=env.authenticatedContext('ceo-test').firestore();
 await assertSucceeds(ceo.doc(stats).get());
 await assertFails(guest().doc(stats).get());
 await assertFails(guest().doc(stats).set({viewCount:20}));
 await assertFails(ceo.doc(stats).update({viewCount:20}));
 await assertFails(guest().doc(session).get());
 await assertFails(ceo.doc(session).get());
});

test('Concurrent, overlapping sessions and retries persist one Seen per photo and session',async()=>{
 const {countCreatorPhotoViews}=await import('../../server/creator-photo-views.js');
 const base=`http://${host}:${port}/v1/projects/mnyra-local-content-creator/databases/(default)/documents`;
 const headers={authorization:'Bearer owner','content-type':'application/json'};
 const pagePath=`contentCreatorPages/${id}`;
 const read=async path=>{
  const response=await fetch(`${base}/${path}`,{headers});
  if(response.status===404)return null;
  assert.equal(response.ok,true,await response.clone().text());
  return response.json();
 };
 const submit=(sessionKey,files)=>countCreatorPhotoViews({base,headers,pagePath,sessionKey,files,now:new Date(),pageId:id,read});
 await Promise.all([submit('one',['001','002']),submit('one',['001','003']),submit('two',['001','002'])]);
 await submit('one',['001','002','003']);
 const db=env.authenticatedContext('ceo-test').firestore();
 const rows=await db.collection(`${pagePath}/photoStats`).get();
 assert.deepEqual(Object.fromEntries(rows.docs.map(row=>[row.id,row.data().viewCount])),{'001':2,'002':2,'003':1});
 const photos=Array.from({length:100},(_,i)=>`photo-${i}`);
 await Promise.all(['a','b','c','d','e','e'].map(async session=>{
  for(let offset=0;offset<photos.length;offset+=25)await submit(session,photos.slice(offset,offset+25));
 }));
 const loadStats=(await db.collection(`${pagePath}/photoStats`).get()).docs.filter(row=>row.id.startsWith('photo-'));
 assert.equal(loadStats.length,100);
 assert.ok(loadStats.every(row=>row.data().viewCount===5));
 await env.withSecurityRulesDisabled(ctx=>ctx.firestore().doc(pagePath).update({deleting:true}));
 await assert.rejects(submit('three',['001']));
 assert.equal((await db.doc(`${pagePath}/photoStats/001`).get()).data().viewCount,2);
});
