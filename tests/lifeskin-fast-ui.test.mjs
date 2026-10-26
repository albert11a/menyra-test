import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { readFileSync } from 'node:fs';
import { fastSeite } from '../apps/lifeskin-verkauf/terapia-fast.js';
import { fastEmpfehlung } from '../shared/lifeskin-fast.js';
import { FRAGEN, fragenNachAufnahme } from '../apps/lifeskin/lifeskin-content.js';
import { lies, ohneKommentare, methode } from './lifeskin-quelle.mjs';
import { renderLifeskin } from '../apps/mnyra-heart/heart-lifeskin-render.js';
import { normalisiere, baueKennzahlen, baueTrichter } from '../apps/mnyra-heart/heart-lifeskin-berechnung.js';
const source=ohneKommentare(lies('apps/lifeskin/lifeskin-app.js'));
const method = name => new Function('FRAGEN','fragenNachAufnahme','$','$$',`return function${methode(source,name).replaceAll('this.#','this.')}`)(FRAGEN,fragenNachAufnahme,selector=>selector==='#ls-fragen'?{}:null,()=>[]);
const catalog=['acne','pore','pigment','moistur','clean'].map(p=>({id:`lf-${p}`,name:`LF ${p.toUpperCase()}`}));
const answers={anliegen:['pucrrat','poret','njollat'],lekura:'perzier',kujdesi:['asnjera'],perdorimi:['asgje']};

test('Real Fast question list has concerns, skin type and safety; no phone screen',()=>{
  let list;
  const state={fast:{active:true,saved:{}},weg:'',zustand:{},antwortzeitHolen(){},fastFragen:method('#fastFragen'),fragenStarten:value=>list=value};
  method('#aufnahmeFragen').call(state,'foto');
  assert.deepEqual(list.map(x=>x.id),['anliegen','lekura','kujdesi','perdorimi']);
  assert.equal(list[0].hoechstens,3);
  assert.equal(list.some(x=>x.typ==='tel'),false);
});
test('Name/age continues directly into Fast submission, while disabled mode keeps contact',()=>{
  for(const active of [true,false]) {
    const calls=[];
    const state={fast:{active,remember:v=>calls.push('remember')},zustand:{typ:'foto',nachFragen:true},fragen:{antworten:{}},sitzung:{ergaenze(){}},pixel:{meldeAbgabe(){}},nameLesen:()=>({name:'Test',altersgruppe:'25-34'}),nameFehler(){},analyseZeigen:()=>calls.push('generate'),trupWeg:()=>false,telZeigen:()=>{calls.push('contact');return true}};
    method('#nameWeiter').call(state);
    assert.deepEqual(calls,active?['remember','generate']:['contact']);
  }
});
test('Four-product Fast page preserves exact summary and short answer-based explanation',()=>{
  const {document}=parseHTML(readFileSync(new URL('../apps/lifeskin-verkauf/terapia.html',import.meta.url),'utf8'));
  const recommendation=fastEmpfehlung(answers,{},catalog);
  fastSeite(document,recommendation,catalog.filter(p=>recommendation.produkte.some(x=>x.id===p.id)));
  assert.match(document.querySelector('#t-hyrja').textContent,/^Seti juaj për lëkurën tuaj: Aknet/);
  assert.doesNotMatch(document.querySelector('#t-hyrja').textContent,/Bazuar në përgjigjet/);
  assert.match(document.querySelector('#t-hyrja').textContent,/4 produkte/);
  assert.equal(document.querySelector('#pse').hidden,true);
  assert.equal(document.querySelector('#vendimi').hidden,true);
  assert.equal(document.querySelector('#t-seti').nextElementSibling.id,'pyetjet');
  assert.equal(document.querySelector('#t-metodablock').hidden,true);
  assert.equal(document.querySelector('#t-metoda').textContent,'');
  assert.equal(document.querySelector('#t-mjeku').hidden,true);
  assert.equal(document.querySelector('#t-diagnoza').hidden,true);
  assert.equal(document.querySelector('#t-parametratblock').hidden,true);
  assert.equal(document.querySelector('#t-vleresimi').hidden,true);
  assert.equal(document.querySelector('#t-vleresimi').textContent,'');
  assert.doesNotMatch(document.querySelector('#t-faq1').textContent,/Dr\. Gashi|sipas fotove/);
});
test('Existing non-Fast therapy DOM remains byte-for-byte untouched by Fast presentation',()=>{
  const {document}=parseHTML(readFileSync(new URL('../apps/lifeskin-verkauf/terapia.html',import.meta.url),'utf8'));
  const before=document.toString();fastSeite(document,{},[]);assert.equal(document.toString(),before);
});
test('Fast case chip shows only Fast cases and leaves archived cases in the archive',()=>{
  const sessions=[['fast','Fast client'],['normal','Normal client'],['archived','Archived client']].map(([id,name])=>normalisiere(id,{name,step:'result',typ:'foto',createdAt:'2026-10-26T12:00:00Z'}));
  const reports={fast:{status:'fertig',fast:{version:1}},normal:{status:'fertig'},archived:{status:'fertig',fast:{version:1},archiviert:true}};
  const html=renderLifeskin({status:'ready',kennzahlen:baueKennzahlen(sessions),trichter:baueTrichter(sessions),sitzungen:sessions,tests:[],berichte:reports,produkte:[],fach:'fast',zeitraum:'max'});
  const {document}=parseHTML(html);
  const caseRows=[...document.querySelectorAll('.heart-lifeskin-fall')];
  assert.equal(caseRows.length,1);assert.match(caseRows[0].textContent,/Fast client/);
});

test('Fast cases are exclusive to Fast across pending, ready, seen, checkout and order states',()=>{
  const variants = [
    {status:'wartet'}, {status:'fertig'}, {status:'fertig',berichtGeoeffnet:true},
    {status:'fertig',kasseGeoeffnet:true}, {status:'bestellt',hatBestellt:true,order:{orderId:'fast-order',total:35}}
  ];
  for (const [index,variant] of variants.entries()) {
    const fast=normalisiere('fast',{name:'Fast client',step:'result',typ:'foto',createdAt:'2026-10-26T12:00:00Z',source:{fast:true},...variant});
    const regular=normalisiere('normal',{name:'Normal client',step:'result',typ:'foto',createdAt:'2026-10-26T12:00:00Z'});
    const sessions=[fast,regular];
    const reports={fast:{status:variant.status,fast:{version:1}},normal:{status:'wartet'}};
    const rows=fach=>{
      const html=renderLifeskin({status:'ready',kennzahlen:baueKennzahlen(sessions),trichter:baueTrichter(sessions),sitzungen:sessions,tests:[],berichte:reports,produkte:[],fach,zeitraum:'max'});
      return [...parseHTML(html).document.querySelectorAll('.heart-lifeskin-fall')].map(row=>row.getAttribute('data-id'));
    };
    assert.deepEqual(rows('fast'),['fast'],`Fast state ${index}`);
    assert.deepEqual(rows('alle'),['normal'],`Open state ${index}`);
    for (const fach of ['ready','seen','kasse','bestellt']) assert.ok(!rows(fach).includes('fast'),`${fach}: ${index}`);
  }
});

test('Reload after report creation resumes interrupted automatic publication before starting a new funnel',()=>{
  let retries=0;
  const state={fast:{active:true,pending:true},netzAufDerLanding(){},pixel:{starte:()=>false},texteSetzen(){},ereignisse(){},uebergeben:()=>retries++,sitzung:{fortsetzbar(){throw Error('must recover first')}}};
  method('starte').call(state);
  assert.equal(retries,1);
});

test('Every Fast buy button uses Porosit terapin with the frozen set price',async()=>{
  const {Terapia}=await import('../apps/lifeskin-verkauf/terapia.js');
  const page=new Terapia({ort:{pathname:`/terapia/${'a'.repeat(32)}`,search:''},pixel:{}});
  page.daten={fast:{version:1},preis:35};
  assert.match(page.kaufWort(),/^Porosit terapin — 35/);
  page.daten={preis:53};
  assert.match(page.kaufWort(),/^Fillo terapinë/);
});

test('Fast photos remain visible outside the hidden author row and FAQ movement is idempotent',()=>{
  const {document}=parseHTML(readFileSync(new URL('../apps/lifeskin-verkauf/terapia.html',import.meta.url),'utf8'));
  const recommendation=fastEmpfehlung(answers,{},catalog);
  const photos=document.querySelector('#t-fotot');photos.hidden=false;
  const stack=document.querySelector('#t-fototstapel');stack.dataset.zeige='1';
  stack.innerHTML='<img src="/one.jpg"><img src="/two.jpg"><img src="/three.jpg">';
  const faq=document.querySelector('#pyetjet');
  fastSeite(document,recommendation,catalog);
  fastSeite(document,recommendation,catalog);
  assert.equal(photos.parentNode,document.querySelector('.hero__karte'));
  assert.equal(photos.hidden,false);assert.equal(photos.closest('#t-mjeku'),null);
  assert.equal(stack.hasAttribute('data-zeige'),false);assert.equal(stack.children.length,3);
  assert.equal(faq,document.querySelector('#t-seti').nextElementSibling);
  assert.equal(document.querySelectorAll('#pyetjet').length,1);
  assert.equal(document.querySelectorAll('#t-fotot').length,1);
});

// Run the real async UI-boundary methods with isolated document/network seams.
function asyncTherapyMethod(name,bindings) {
  const source=readFileSync(new URL('../apps/lifeskin-verkauf/terapia.js',import.meta.url),'utf8');
  const start=source.indexOf(`  async #${name}()`);assert.ok(start>=0);
  const body=source.slice(source.indexOf('{',start)+1,source.indexOf('\n  }\n',start)).replaceAll('this.#','this.');
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
  const fn=new AsyncFunction(...Object.keys(bindings),body);
  return state=>fn.call(state,...Object.values(bindings));
}

test('Actual thumbnail loading displays Fast photos and retains the existing normal-page fitting path',async()=>{
  for(const fast of [true,false]) {
    const {document}=parseHTML(readFileSync(new URL('../apps/lifeskin-verkauf/terapia.html',import.meta.url),'utf8'));
    const data=fast?fastEmpfehlung(answers,{},catalog):{};
    fastSeite(document,data,catalog);
    let fitted=0,resized=0;
    const state={ohneFoto:false,daten:data,quelle:{miniaturen:async()=>[{jpeg:'data:image/jpeg;base64,AAAA'},{jpeg:'data:image/jpeg;base64,BBBB'}]},stapelEinpassen:()=>fitted++};
    await asyncTherapyMethod('analyseFotos',{
      $:selector=>document.querySelector(selector),element:tag=>document.createElement(tag),
      schreibe:(el,value)=>{if(el)el.textContent=value;},zeigen:(el,on)=>{if(el)el.hidden=!on;},
      window:{addEventListener:()=>resized++}
    })(state);
    assert.equal(document.querySelector('#t-fotot').hidden,false);
    assert.equal(document.querySelectorAll('#t-fototstapel img').length,2);
    assert.equal(fitted,fast?0:1);assert.equal(resized,fast?0:1);
    assert.equal(document.querySelector('#t-fotot').parentNode,document.querySelector(fast?'.hero__karte':'#t-mjeku'));
  }
});

test('Late product photo repaint preserves Fast package copy and FAQ order',async()=>{
  const {document}=parseHTML(readFileSync(new URL('../apps/lifeskin-verkauf/terapia.html',import.meta.url),'utf8'));
  const data=fastEmpfehlung(answers,{},catalog);
  fastSeite(document,data,catalog);
  const state={daten:data,produkte:[],quelle:{fetchFn:async()=>({ok:false})},seti:()=>{
    document.querySelector('#t-setinen').textContent='E zgjodhi Dr. Gashi sipas fotove tuaja';
  }};
  await asyncTherapyMethod('mjetetFotot',{
    LIFESKIN_FIRESTORE_BASE:'https://test.invalid/documents',LIFESKIN_TENANT:'lifeskin',
    document,fastSeite,setTimeout:()=>0
  })(state);
  assert.equal(document.querySelector('#t-setinen').textContent,'Set i përzgjedhur automatikisht sipas përgjigjeve tuaja');
  assert.equal(document.querySelector('#t-seti').nextElementSibling.id,'pyetjet');
  assert.equal(document.querySelector('#pse').hidden,true);
  assert.equal(document.querySelector('#vendimi').hidden,true);
});
