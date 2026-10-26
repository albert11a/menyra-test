import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { fastMedienLaden, fastRasteAuswahl } from '../apps/lifeskin-verkauf/terapia-fast-galerie.js';
import { KundenMedien } from '../apps/lifeskin-verkauf/terapia-medien.js';
import { felder } from '../apps/lifeskin/lifeskin-session.js';
import { rasteNormalisieren, rasteMitBildern } from '../shared/lifeskin-raste.js';

const mediaDoc=(i,extra={})=>({name:`projects/test/databases/(default)/documents/lifeskin/lifeskin/medien/customer-${i}`,fields:felder({art:'foto',bild:`/customer-${i}.jpg`,aktiv:true,reihe:i,...extra})});
const basis='https://firestore.googleapis.com/v1/projects/test/databases/(default)/documents';

test('Fast loads every active public gallery item across pages without a twelve-photo cap',async()=>{
  const calls=[];
  const fetchFn=async url=>{
    calls.push(url);
    if(new URL(url).searchParams.has('pageToken'))return {ok:true,json:async()=>({documents:[mediaDoc(15),mediaDoc(16,{aktiv:false}),mediaDoc(17,{bild:'javascript:bad'})]})};
    return {ok:true,json:async()=>({documents:Array.from({length:15},(_,i)=>mediaDoc(i)),nextPageToken:'next-page'})};
  };
  const result=await fastMedienLaden({basis,fetchFn});
  assert.equal(result.length,16);
  assert.equal(result.at(-1).id,'customer-15');
  assert.equal(calls.length,2);
  assert.ok(calls.every(url=>url.includes('/medien?')&&!url.includes('/sessions/')));
  assert.match(calls[1],/pageToken=next-page/);
});
test('Gallery ordering follows Heart, including video thumbnails and saved crop',async()=>{
  const result=await fastMedienLaden({basis,fetchFn:async()=>({ok:true,json:async()=>({documents:[mediaDoc(2),mediaDoc(1,{art:'video',video:'/review.mp4',ausschnitt:{x:40,y:30,zoom:1.5}})]})})});
  assert.deepEqual(result.map(m=>m.id),['customer-1','customer-2']);
  assert.equal(result[0].art,'video');assert.equal(result[0].video,'/review.mp4');
  assert.deepEqual(result[0].ausschnitt,{x:40,y:30,zoom:1.5});
});
test('Disabled public media stay hidden and unavailable galleries do not block the page',async()=>{
  assert.deepEqual(await fastMedienLaden({basis,fetchFn:async()=>({ok:true,json:async()=>({documents:[mediaDoc(0,{aktiv:false})]})})}),[]);
  assert.deepEqual(await fastMedienLaden({basis,fetchFn:async()=>({ok:false})}),[]);
  assert.deepEqual(await fastMedienLaden({basis,fetchFn:async()=>{throw Error('offline')}}),[]);
});
test('Fast before/after selection includes all published cases across product sets, excluding fully hidden cases',async()=>{
  const cases=rasteNormalisieren([
    {id:'acne',analiza:true,produkte:['lf-acne'],para:'/apps/test/a-before.jpg',pas:'/apps/test/a-after.jpg'},
    {id:'pigment',landing:true,produkte:['lf-pigment'],para:'/apps/test/p-before.jpg',pas:'/apps/test/p-after.jpg'},
    {id:'shop',shop:true,produkte:['lf-pore'],para:'/apps/test/s-before.jpg',pas:'/apps/test/s-after.jpg'},
    {id:'hidden',analiza:false,landing:false,shop:false,para:'/apps/test/h-before.jpg',pas:'/apps/test/h-after.jpg'},
    {id:'incomplete',analiza:true,para:'/apps/test/only-before.jpg'}
  ]);
  const selected=fastRasteAuswahl(cases);
  assert.deepEqual(selected.map(r=>r.id),['acne','pigment','shop','incomplete']);
  const ready=await rasteMitBildern(selected,'https://test/config',()=>{throw Error('static pictures do not fetch')});
  assert.deepEqual(ready.map(r=>r.id),['acne','pigment','shop']);
});
test('Actual Fast customer rail renders every photo after the twelfth and keeps disabled media out',async()=>{
  const {document}=parseHTML('<html><body><section id="customers" hidden><div id="rail"></div></section></body></html>');
  const original=globalThis.document;
  globalThis.document=document;
  try {
    const gallery=new KundenMedien({abschnitt:document.getElementById('customers'),reihe:document.getElementById('rail'),basis,zaehlen:false,fetchFn:async()=>({ok:true,json:async()=>({documents:Array.from({length:17},(_,i)=>mediaDoc(i,{aktiv:i!==16}))})})});
    const result=await gallery.zeigeAlle();
    assert.equal(result.length,16);
    assert.equal(document.querySelectorAll('#rail .medium').length,16);
    assert.equal(document.getElementById('customers').hidden,false);
    assert.equal(document.querySelector('#rail .medium:last-child').dataset.medium,'customer-15');
  } finally {
    if(original===undefined)delete globalThis.document;else globalThis.document=original;
  }
});
