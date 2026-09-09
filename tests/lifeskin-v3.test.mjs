import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {raportLesen,jsonLesen} from '../shared/lifeskin-analyse.js';
import {validateRaportV3,reportToWire,termSegments,reportAllowsOffer} from '../shared/lifeskin-raport-v3.js';
import {RAPORT_BOGEN} from '../apps/mnyra-heart/heart-lifeskin-render.js';
const prompt=JSON.parse(readFileSync(new URL('../docs/lifeskin-prompt.json',import.meta.url)));
const example=()=>structuredClone(prompt.shembull_i_pergjigjes);

test('v3 passes both readers and round trips without losing explanations or null',()=>{
 const d=example(); const r=raportLesen(d);
 assert.equal(jsonLesen(JSON.stringify(d)).kodi,d.kodi);
 assert.deepEqual(reportToWire(r),d);
 assert.equal(r.parametrat.find(p=>p.id==='barriera').shkalla,null);
});
test('invalid versions, counts, duplicate parameters, grades and unknown fields are rejected',()=>{
 for(const mutate of [d=>d.schema_version=4,d=>d.kodi='',d=>d.raporti.parametrat_e_vleresuar=10,d=>d.parametrat[1].id=d.parametrat[0].id,d=>d.parametrat[0].shkalla='2',d=>d.parametrat[0].grada='gut',d=>d.arztGeprueft=true,d=>d.termat[0].shprehja='absent term']){
  const d=example();mutate(d);assert.throws(()=>raportLesen(d),/LifeSkin JSON/);
 }
});
test('unknown and normal skin can return no diagnosis and no products without fake findings',()=>{
 const d=example();d.vleresimi={statusi:'i_pavleresueshem',kufizimi:'Nevojiten pamje më të qarta.'};
 d.parametrat.forEach(p=>{p.shkalla=null;p.grada='nuk vlerësohet';p.vlera='nuk vlerësohet';});
 d.raporti={fotot:1,parametrat_e_vleresuar:0,parametrat_me_gjetje:0,zonat_e_kontrolluara:0,zonat_me_ndryshime:0};
 d.gjetjet={permbledhja:'Nuk ka informacion të mjaftueshëm për një vlerësim.',gjetja_kryesore:'',gjetja_dyta:'',sipas_zonave:[]};
 d.diagnoza={id:'tjeter',emri:'Nuk vlerësohet',latinisht:'',niveli:null,niveli_emri:''};d.termat=[];d.nevojat=[];d.shpjegimi=[];
 d.pa_kujdes={zbehet:'',nuk_zbehet:'',pas_6_muajsh:''};d.synimi_28='';d.keshilla='Nevojiten pamje më të qarta.';
 const r=raportLesen(d);assert.equal(r.parametratVleresuar,0);assert.equal(r.niveli,null);assert.equal(r.zonat,0);assert.deepEqual(reportToWire(r),d);
 d.nevojat=example().nevojat;assert.throws(()=>validateRaportV3(d),/Kein Produktbedarf/);
});
test('offer requires independent review, a need and an assessable status for v3',()=>{
 const r=raportLesen(example());assert.equal(reportAllowsOffer(r),false);
 r.aerztlichGeprueft=true;assert.equal(reportAllowsOffer(r),true);
 r.nevojat=[];assert.equal(reportAllowsOffer(r),false);
 r.nevojat=example().nevojat;r.vleresimi.statusi='kontroll_mjekesor';assert.equal(reportAllowsOffer(r),false);
 assert.equal(reportAllowsOffer({}),true); // legacy contract
});
test('term splitting preserves text, uses longest phrase and treats markup as text',()=>{
 const terms=[{id:'short',shprehja:'pore'},{id:'long',shprehja:'pore të bllokuara'}];
 const text='<img src=x onerror=alert(1)> pore të bllokuara dhe pore';
 const parts=termSegments(text,terms);
 assert.equal(parts.map(p=>p.text).join(''),text);
 assert.deepEqual(parts.filter(p=>p.term).map(p=>p.term.id),['long','short']);
 assert.equal(parts[0].term,undefined);
 assert.deepEqual(termSegments('tekst',[{shprehja:''}]),[{text:'tekst'}]);
});

// Exercise the actual Heart form functions, with a minimal form-only adapter.
const source=readFileSync(new URL('../apps/mnyra-heart/heart.js',import.meta.url),'utf8');
function body(name){const start=source.indexOf(`function ${name}(`);return source.slice(start,source.indexOf('\n}\n',start)+2);}
function form(){
 const elements=[];
 const add=(attr,val='',i=null)=>{const key=attr.replace(/^data-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());const el={value:val,checked:false,attrs:{[attr]:i??''},dataset:{[key]:i??''}};elements.push(el);return el;};
 for(const f of RAPORT_BOGEN)add('data-raport','',f.id);
 add('data-raport-meta','{}');add('data-raport-terms','[]');add('data-raport-reviewed');
 for(let i=0;i<5;i++)for(const k of ['ort','text'])add(`data-zona-${k}`,'',String(i));
 for(let i=0;i<10;i++)for(const k of ['emri','vlera','grada','thjeshte','shkalla'])add(`data-par-${k}`,'',String(i));
 const match=(el,q)=>{const m=q.trim().match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);return m&&Object.hasOwn(el.attrs,m[1])&&(m[2]===undefined||el.attrs[m[1]]===m[2]);};
 const document={querySelector:q=>elements.find(el=>match(el,q))||null,querySelectorAll:q=>elements.filter(el=>q.split(',').some(one=>match(el,one)))};
 const create=new Function('document','CSS','RAPORT_MESSWERTE',`${body('lifeskinBogenLesen')}\n${body('lifeskinBogenFuellen')}\nreturn {read:lifeskinBogenLesen,fill:lifeskinBogenFuellen};`);
 return {...create(document,{escape:s=>s},10),document};
}
test('Heart imports, edits, replaces and reopens all v3 metadata without stale form values',()=>{
 const f=form();const r=raportLesen(example());f.fill(r);
 assert.deepEqual(reportToWire(f.read()),example());
 f.document.querySelector('[data-raport-reviewed]').checked=true;
 assert.equal(f.read().aerztlichGeprueft,true);
 const next=example();next.kodi='LS-NEXT';next.termat=[];next.nevojat=[];next.shpjegimi=[];next.gjetjet.sipas_zonave=[];next.raporti.zonat_me_ndryshime=0;next.pa_kujdes={zbehet:'',nuk_zbehet:'',pas_6_muajsh:''};next.keshilla='';
 f.fill(raportLesen(next));assert.deepEqual(reportToWire(f.read()),next);
 assert.equal(f.read().aerztlichGeprueft,false);
 f.document.querySelector('[data-raport="gjetjet"]').value='Text von Hand';
 assert.equal(f.read().gjetjet,'Text von Hand');
 f.document.querySelector('[data-raport-terms]').value='{';assert.throws(()=>f.read());
});
