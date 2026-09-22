import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {Sitzung} from '../apps/lifeskin/lifeskin-session.js';
const source=readFileSync(new URL('../apps/lifeskin/lifeskin-app.js',import.meta.url),'utf8');
const method=source.slice(source.indexOf('  async #uebergeben() {'),source.indexOf('\n\n\n\n  // Das Blatt')).replaceAll('this.#','this._').replace('async #uebergeben','async senden');
function probe(save) {
  const timers=new Map(); let id=0;
  const events=[];
  const C=vm.runInNewContext(`(class {${method}})`,{$:()=>null,setTimeout:(fn)=>{timers.set(++id,fn);return id;},clearTimeout:(i)=>timers.delete(i),location:{assign:p=>events.push(p)}});
  const app=new C();app._uebergeben=app.senden;Object.assign(app,{zustand:{},sprache:'sq',zeige:()=>{},text:k=>k,_standVergessen:()=>events.push('forget'),_fehlerZeigen:(_,retry)=>{app.retry=retry;events.push('error');},sitzung:{berichtAnlegen:save,schritt:s=>events.push(s),berichtPfad:'/analiza/test'}});
  return {app,events,timers};
}
test('nur bestaetigte Abgabe vergisst Entwurf und leitet weiter',async()=>{
 const p=probe(async()=>true);await p.app.senden();assert.deepEqual(p.events,['result','forget','/analiza/test']);assert.equal(p.timers.size,0);
});
for(const mode of ['false','reject']) test(`Speicherfehler ${mode} behaelt Entwurf und ist wiederholbar`,async()=>{
 let n=0;const p=probe(async()=>{if(++n>1)return true;if(mode==='reject')throw Error('offline');return false;});
 await p.app.senden();assert.deepEqual(p.events,['error']);await p.app.retry();assert.equal(n,2);assert.equal(p.events.at(-1),'/analiza/test');
});
test('haengender Versand zeigt Hilfe; Doppeltipp und Retry duplizieren ihn nicht',async()=>{
 let finish,n=0;const p=probe(()=>{n++;return new Promise(r=>finish=r);});
 const first=p.app.senden();await p.app.senden();for(const fn of p.timers.values())fn();await first;
 assert.deepEqual(p.events,['error']);finish(true);await p.app.retry();assert.equal(n,1);assert.equal(p.events.at(-1),'/analiza/test');
});
test('fehlende Kontaktbestaetigung verhindert Bericht, Retry speichert Kontakt zuerst',async()=>{
 let online=false;const calls=[];
 const s=new Sitzung({speicher:null,fetchFn:async(url)=>{calls.push(url);return {ok:online,status:503};}});
 s.stand.phone='+1';s.stand.phoneConsent=true;
 assert.equal(await s.berichtAnlegen({numri:true}),false);assert.equal(calls.length,1);
 online=true;assert.equal(await s.berichtAnlegen({numri:true}),true);assert.match(calls.at(-1),/reports\?/);
});
