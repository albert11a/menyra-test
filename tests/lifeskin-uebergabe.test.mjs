import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {Sitzung} from '../apps/lifeskin/lifeskin-session.js';
const source=readFileSync(new URL('../apps/lifeskin/lifeskin-app.js',import.meta.url),'utf8');
// Die Uebergabe samt ihrer Hilfsmethode (#uebergabeFortschritt) - private
// Namen werden nur in dieser Testkopie zugaenglich gemacht.
const method=source.slice(source.indexOf('  async #uebergeben() {'),source.indexOf('\n\n\n\n  // Das Blatt')).replaceAll('this.#','this._').replace('async #uebergeben','async senden').replace(/\n  #(\w+)\(/g,'\n  _$1(');
// Eine Uhr, die nur laeuft, wenn der Test sie weiterdreht - und Timer, die
// zu ihrer Zeit feuern statt alle auf einmal.
function probe(save) {
  const timers=new Map(); let id=0; let jetzt=1000;
  const events=[];
  const Uhr=class extends Date { static now() { return jetzt; } };
  const C=vm.runInNewContext(`(class {${method}})`,{$:()=>null,schreibe:(k,t)=>{if(k)k.textContent=t;},UEBERGABE_STILL_MS:20000,Date:Uhr,warte:()=>new Promise(()=>{}),setTimeout:(fn,ms=0)=>{timers.set(++id,{fn,wann:jetzt+ms});return id;},clearTimeout:(i)=>timers.delete(i),location:{assign:p=>events.push(p)}});
  const app=new C();app._uebergeben=app.senden;Object.assign(app,{zustand:{},sprache:'sq',zeige:(n)=>{app.aktiv=n;},text:(k,w)=>w?`${k}:${w.fertig}/${w.gesamt}`:k,_standVergessen:()=>events.push('forget'),_aufbereitungZeigen:async()=>{},_aufbereitungFertig:()=>{},_fehlerZeigen:(_,retry)=>{app.retry=retry;events.push('error');},sitzung:{berichtAnlegen:save,schritt:s=>events.push(s),berichtPfad:'/analiza/test',letzteAntwort:0,offeneFotos:new Map()}});
  const pumpen=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
  const weiter=async(ms)=>{
    const bis=jetzt+ms;
    for(;;){
      const naechster=[...timers].sort((a,b)=>a[1].wann-b[1].wann)[0];
      if(!naechster||naechster[1].wann>bis)break;
      timers.delete(naechster[0]);jetzt=naechster[1].wann;naechster[1].fn();await pumpen();
    }
    jetzt=bis;await pumpen();
  };
  return {app,events,timers,weiter,pumpen,uhr:()=>jetzt};
}
test('nur bestaetigte Abgabe vergisst Entwurf und leitet weiter',async()=>{
 const p=probe(async()=>true);await p.app.senden();assert.deepEqual(p.events,['result','forget','/analiza/test']);assert.equal(p.timers.size,0);
});
for(const mode of ['false','reject']) test(`Speicherfehler ${mode} behaelt Entwurf und ist wiederholbar`,async()=>{
 let n=0;const p=probe(async()=>{if(++n>1)return true;if(mode==='reject')throw Error('offline');return false;});
 await p.app.senden();assert.deepEqual(p.events,['error']);await p.app.retry();assert.equal(n,2);assert.equal(p.events.at(-1),'/analiza/test');
});
test('haengender Versand zeigt Hilfe erst nach 20 s OHNE Antwort; Doppeltipp und Retry duplizieren ihn nicht',async()=>{
 let finish,n=0;const p=probe(()=>{n++;return new Promise(r=>finish=r);});
 const first=p.app.senden();await p.app.senden();
 await p.weiter(19000);assert.deepEqual(p.events,[],'Der Hinweis kommt vor der Frist');
 await p.weiter(2000);await first;
 assert.deepEqual(p.events,['error']);finish(true);await p.app.retry();assert.equal(n,1);assert.equal(p.events.at(-1),'/analiza/test');
});

test('solange der Server antwortet, wartet die Uebergabe - auch laenger als 20 s',async()=>{
 // Die schmale Leitung: sieben Fotos brauchen eine Minute, aber alle paar
 // Sekunden kommt eine Antwort. Frueher stand nach 20 s "nicht bestaetigt".
 let finish;const p=probe(()=>new Promise(r=>finish=r));
 const laeuft=p.app.senden();
 for(let s=0;s<60;s+=5){await p.weiter(5000);p.app.sitzung.letzteAntwort=p.uhr();}
 assert.deepEqual(p.events,[],'Hinweis trotz laufender Uebertragung');
 finish(true);await laeuft;
 assert.deepEqual(p.events,['result','forget','/analiza/test']);assert.equal(p.timers.size,0);
});

test('kommt der Versand nach dem Hinweis doch an, geht es ohne Tipp weiter',async()=>{
 let finish,n=0;const p=probe(()=>{n++;return new Promise(r=>finish=r);});
 const first=p.app.senden();await p.weiter(21000);await first;
 assert.deepEqual(p.events,['error']);
 finish(true);await p.pumpen();await p.pumpen();
 assert.equal(p.events.at(-1),'/analiza/test','Wer die Seite offen laesst, muss nicht noch einmal tippen');
 assert.equal(n,1,'Es wurde ein zweites Mal gesendet');
});

test('scheitert der Versand nach dem Hinweis endgueltig, sendet der naechste Tipp neu',async()=>{
 let finish,n=0;const p=probe(()=>{n++;return n===1?new Promise(r=>finish=r):Promise.resolve(true);});
 const first=p.app.senden();await p.weiter(21000);await first;
 finish(false);await p.pumpen();
 assert.deepEqual(p.events,['error']);
 await p.app.retry();assert.equal(n,2);assert.equal(p.events.at(-1),'/analiza/test');
});

test('die letzte Zeile zaehlt die Fotos, die schon oben sind, und gibt ihren Satz danach zurueck',async()=>{
 let finish;const p=probe(()=>new Promise(r=>finish=r));
 const zeile={textContent:'fotoAnalyseAkte'};
 p.app.aufbereitungLetzte={lastElementChild:zeile};
 p.app.zustand.fotoAnzahl=7;
 for(const b of ['a','b','c'])p.app.sitzung.offeneFotos.set(b,{});
 const laeuft=p.app.senden();
 await p.weiter(1000);assert.equal(zeile.textContent,'uebergabeFotos:4/7');
 p.app.sitzung.offeneFotos.clear();p.app.sitzung.letzteAntwort=p.uhr();
 await p.weiter(1000);assert.equal(zeile.textContent,'fotoAnalyseAkte');
 finish(true);await laeuft;
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

test('jede Antwort des Servers setzt letzteAntwort - die Uhr, an der die Uebergabe wartet',async()=>{
 const s=new Sitzung({speicher:null,fetchFn:async()=>({ok:true})});
 assert.equal(s.letzteAntwort,0);
 const vorher=Date.now();await s.schritt('camera');
 assert.ok(s.letzteAntwort>=vorher,'Eine Antwort wurde nicht vermerkt');
});

test('keepalive nur fuer kleine Schreibvorgaenge - ein grosser ginge sonst ganz verloren',async()=>{
 // Browser verwerfen keepalive-Anfragen ueber 64 KiB, statt sie normal zu
 // senden. Wartet die Kette lange hinter den Fotos, sammelt sich genau so
 // ein grosser Schreibvorgang an.
 const calls=[];
 const s=new Sitzung({speicher:null,fetchFn:async(url,options)=>{calls.push(options);return {ok:true};}});
 await s.ergaenze({problemi:'x'.repeat(100)});
 await s.ergaenze({problemi:'ë'.repeat(40000)});
 assert.equal(calls[0].keepalive,true);
 assert.equal(calls[1].keepalive,false,'80 KB mit keepalive - der Browser haette sie verworfen');
});
