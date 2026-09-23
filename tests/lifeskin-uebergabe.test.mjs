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
  const C=vm.runInNewContext(`(class {${method}})`,{$:()=>null,warte:()=>new Promise(()=>{}),setTimeout:(fn)=>{timers.set(++id,fn);return id;},clearTimeout:(i)=>timers.delete(i),location:{assign:p=>events.push(p)}});
  const app=new C();app._uebergeben=app.senden;Object.assign(app,{zustand:{},sprache:'sq',zeige:()=>{},text:k=>k,_standVergessen:()=>events.push('forget'),_aufbereitungZeigen:async()=>{},_aufbereitungFertig:()=>{},_fehlerZeigen:(_,retry)=>{app.retry=retry;events.push('error');},sitzung:{berichtAnlegen:save,schritt:s=>events.push(s),berichtPfad:'/analiza/test'}});
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

test('fehlgeschlagenes Foto verhindert falsche Abgabe und wird erneut hochgeladen',async()=>{
 let online=false;const calls=[];
 const s=new Sitzung({speicher:null,fetchFn:async(url)=>{calls.push(url);return {ok:!url.includes('/photos/')||online,status:503};}});
 await s.fotosSpeichern({front:{jpeg:'data:image/jpeg;base64,abc',breite:10,hoehe:10,guete:.9}});
 assert.equal(await s.berichtAnlegen({photos:1}),false);
 assert.equal(calls.some(url=>url.includes('/reports?')),false);
 online=true;assert.equal(await s.berichtAnlegen({photos:1}),true);
 assert.equal(s.offeneFotos.size,0);assert.match(calls.at(-1),/reports\?/);
});
test('nie beantworteter Request laesst die Warteschlange nach der Frist weiterlaufen',async(t)=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const s=new Sitzung({speicher:null,fetchFn:()=>new Promise(()=>{})});
 const request=s.fetchFn('https://example.test/metadata');
 const result=assert.rejects(request,/Zeitgrenze/);
 t.mock.timers.tick(20000);await result;
});

for(const typ of ['scan','foto','trup','pytje']) test(`${typ}: richtiger Bericht und Navigation erst nach Bestaetigung`,async()=>{
 let daten,finish;
 const p=probe(d=>{daten=d;return new Promise(r=>finish=r);});
 p.app.zustand={typ,name:'Test',nummerGegeben:true,fotoAnzahl:typ==='scan'?10:typ==='foto'?1:0};
 const pending=p.app.senden();
 assert.equal(daten.typ,typ);assert.equal(daten.numri,true);assert.equal(daten.photos,p.app.zustand.fotoAnzahl);assert.deepEqual(p.events,[]);
 finish(true);await pending;assert.equal(p.events.at(-1),'/analiza/test');
});

test('Abschluss-PATCH bleibt beim Wechsel zur Warteseite am Leben',async()=>{
 const calls=[];
 const s=new Sitzung({speicher:null,fetchFn:async(url,options)=>{calls.push({url,options});return {ok:true};}});
 await s.schritt('result');
 assert.equal(calls[0].options.keepalive,true);
 assert.equal(JSON.parse(calls[0].options.body).fields.step.stringValue,'result');
});

test('der Ladebildschirm zeigt wieder Zeilen und Ring - neben dem Speichern, nicht statt ihm',()=>{
 assert.match(source,/const anzeige = this\.#aufbereitungZeigen\(\)/);
 assert.match(source,/await anzeige;\s*\/\/ Erst ein bestaetigter Bericht/);
 const zeilen=source.slice(source.indexOf('  #aufbereitungZeilen() {'),source.indexOf('  async #aufbereitungZeigen() {'));
 for(const k of ['fotoAnalyseAufnahme','analyseZonen','textAnalyseAngaben'])assert.match(zeilen,new RegExp(k));
});
