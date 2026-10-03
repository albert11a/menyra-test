import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKINREACT_BEREICHE, skinreactBereich, skinreactFreigabe, skinreactErgebnis, istSkinreact } from '../shared/lifeskin-skinreact.js';
import { herkunftAuslesen, Sitzung } from '../apps/lifeskin/lifeskin-session.js';
import { berichtAusRest, SkinreactErgebnis, skinreactEinbetten } from '../apps/lifeskin-shop/skinreact-ergebnis.js';
import { renderSkinreactFall, renderLifeskin } from '../apps/mnyra-heart/heart-lifeskin-render.js';
import { skinreactWahlMerken, skinreactEntwuerfe } from '../apps/mnyra-heart/heart-skinreact.js';
import { normalisiere, baueKennzahlen, baueTrichter } from '../apps/mnyra-heart/heart-lifeskin-berechnung.js';

test('all 20 ranges including 0 and 100 are accepted, malformed values never are', () => {
  assert.equal(SKINREACT_BEREICHE.length,20);
  for (const id of SKINREACT_BEREICHE) assert.equal(skinreactBereich(id).max-skinreactBereich(id).min,5);
  for (const bad of [null,'',80,'80-98','100-105','90-100','NaN']) assert.equal(skinreactBereich(bad),null);
});
test('only genuinely released ranges become results; identical report gives identical range',()=>{
  assert.equal(skinreactErgebnis({perputhja:98}),null);
  assert.equal(skinreactErgebnis({skinreact:{bereich:'90-95'}}),null);
  assert.throws(()=>skinreactFreigabe('80-98'));
  const report=skinreactFreigabe('0-5','2026-10-03T05:00:00Z');
  assert.deepEqual(skinreactErgebnis(report),{id:'0-5',min:0,max:5,text:'0–5%'});
  assert.deepEqual(skinreactErgebnis(report),skinreactErgebnis(report));
});
test('shop workflow marker preserves source; only cases with captured photos are SkinReact',()=>{
  const source=herkunftAuslesen({search:'?utm_source=ig'},'', '',null,{dataset:{lsLanding:'lifeskinshop',lsScanWorkflow:'skinreact'}});
  assert.equal(source.scanWorkflow,undefined);assert.equal(source.utmSource,'ig');assert.equal(source.weg,'lifeskinshop');
  source.scanWorkflow='skinreact';
  assert.equal(istSkinreact({source,photos:[]}),false);
  assert.equal(istSkinreact({source,photos:['front']}),true);
  assert.equal(istSkinreact({source:{weg:'lifeskinshop'},photos:['front']}),false);
});
test('REST decoding reads only the signed-off range',()=>{
  const report=berichtAusRest({fields:{skinreact:{mapValue:{fields:{bereich:{stringValue:'85-90'},art:{stringValue:'produkteignung'},freigabeAt:{stringValue:'now'}}}}}});
  assert.equal(skinreactErgebnis(report).text,'85–90%');
});
const id='0123456789abcdef0123456789abcdef';
const source={weg:'lifeskinshop',scanWorkflow:'skinreact'};
const session=normalisiere(id,{createdAt:'2026-10-03T05:00:00Z',source,photos:['front'],step:'result',code:'LS-ABC'});
test('inline row shows picture, all ranges and Dërgo without nested controls',()=>{
  const html=renderSkinreactFall(session,{},'data:image/jpeg;base64,AA');
  assert.match(html,/data-vorschau-bild/);assert.match(html,/Dërgo/);assert.match(html,/value="0-5"/);assert.match(html,/value="95-100"/);
  assert.match(html,/<article/);assert.match(html,/data-action="lifeskin-sitzung"/);assert.match(html,/data-action="lifeskin-skinreact-senden"/);
  skinreactWahlMerken(id,'75-80');
  assert.match(renderSkinreactFall(session,{},''),/value="75-80" selected/);
  skinreactEntwuerfe.clear();
});
test('first SkinReact chip keeps ordered shop cases alongside pending ones',()=>{
  const ordered=normalisiere('a'.repeat(32),{source,photos:['front'],step:'ordered',shopKauf:true,order:{total:29},createdAt:'2026-10-03T05:00:00Z'});
  const sessions=[session,ordered];
  const html=renderLifeskin({status:'ready',bereich:'acne',weg:'lifeskinshop',fach:'skinreact',sitzungen:sessions,berichte:{},produkte:[],kennzahlen:baueKennzahlen(sessions),trichter:baueTrichter(sessions),vorschau:{}});
  assert.match(html,/data-wert="skinreact"/);assert.match(html,/data-skinreact-fall="012345/);assert.match(html,/data-skinreact-fall="aaaaaaaa/);
});
test('poller never substitutes a positive number for missing/failed approval',async()=>{
  let polls=0;
  const status={textContent:''};
  const ui=new SkinreactErgebnis({sitzung:{berichtPfadVoll:'mock'},wurzel:{querySelector:()=>status},holen:async()=>{polls++;return{ok:true,json:async()=>({fields:{}})}} ,intervall:10000});
  ui.aktiv=true;ui.beginn=Date.now();let shown=false;ui.anzeigen=()=>shown=true;
  await ui.pruefen();ui.stop();assert.equal(shown,false);assert.equal(polls,1);
  ui.aktiv=true;ui.holen=async()=>{throw Error('offline')};await ui.pruefen();ui.stop();assert.match(status.textContent,/Lidhja u ndërpre/);assert.equal(shown,false);
});

test('workflow survives reload but older submitted analyses are not reclassified', async()=>{
  const data=new Map();const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const fetchFn=async()=>({ok:true,status:200});
  const original=new Sitzung({speicher:storage,fetchFn});
  original.stand.source={utmSource:'ig',weg:'lifeskinshop'};
  await original.skinreactMarkieren();
  assert.equal(original.stand.source.utmSource,'ig');
  original.schritt('result');await original.kette;
  const resumed=new Sitzung({speicher:storage,fetchFn});
  assert.equal(resumed.scanWorkflow,'skinreact');
  assert.ok(resumed.fortsetzbar());
  data.set('lifeskin:sitzung',JSON.stringify({id,createdAt:'2026-10-03T05:00:00Z',step:'result',bericht:true}));
  const old=new Sitzung({speicher:storage,fetchFn});
  assert.equal(old.scanWorkflow,'');assert.ok(old.fortsetzbar());
});

test('inline embedding preserves original video/canvas screen nodes and reuses the same slot',()=>{
  let slot=null;const camera={id:'ls-kamera'},result={id:'ls-analyse'};
  const section={dataset:{},querySelector:selector=>selector==='[data-sr-live]'?slot:{append:node=>{slot=node}}};
  const document={getElementById:id=>({'zgjedhja':section,'ls-kamera':camera,'ls-analyse':result})[id],createElement:()=>({children:[],setAttribute(){},append(node){this.children.push(node)}})};
  const first=skinreactEinbetten(document,'kamera');
  assert.equal(first.inline,true);assert.equal(section.dataset.srState,'kamera');
  assert.equal(first.platz.children[0],camera);assert.equal(first.platz.children[1],result);
  const next=skinreactEinbetten(document,'analyse');assert.equal(next.platz,first.platz);assert.equal(next.platz.children.length,2);assert.equal(section.dataset.srState,'analyse');
  skinreactEinbetten(document,'einstieg');assert.equal(section.dataset.srState,'idle');
});

// AUTO (Schalter Përputhja, 03.10., Wunsch Inhaber): 95-100 % steht schon
// in der Auswahl - gesendet wird erst mit "Dërgo". Keine Freigabe ohne Mensch.
test('Auto waehlt 95-100 vor, sendet aber nichts von selbst', () => {
  const s = { id: 'sr-auto', name: 'Arta', createdAt: new Date().toISOString(), photos: ['a'], source: { scanWorkflow: 'skinreact', weg: 'lifeskinshop' } };
  const auto = renderSkinreactFall(s, {}, '', { perputhjaModus: 'auto' });
  assert.match(auto, /value="95-100" selected/);
  assert.match(auto, /data-action="lifeskin-skinreact-senden"/, 'Dërgo bleibt der Weg zur Freigabe');
  // Manuell und ohne Einstellung: nichts vorausgewaehlt.
  for (const modus of ['hand', undefined]) assert.doesNotMatch(renderSkinreactFall(s, {}, '', { perputhjaModus: modus }), /" selected/);
  // Schon freigegeben: es gilt die Freigabe, nicht der Vorschlag.
  const frei = { skinreact: { bereich: '70-75', freigabeAt: '2026-10-03T08:00:00.000Z', art: 'produkteignung' } };
  const html = renderSkinreactFall(s, frei, '', { perputhjaModus: 'auto' });
  assert.match(html, /value="70-75" selected/);
  assert.doesNotMatch(html, /value="95-100" selected/);
  // Heart sendet nur aus dem Klick auf Dërgo - kein Senden beim Laden oder im Live-Takt.
  const heart = readFileSync(new URL('../apps/mnyra-heart/heart.js', import.meta.url), 'utf8');
  assert.doesNotMatch(heart, /SKINREACT_AUTO_BEREICH/, 'heart.js darf den Vorschlag nicht selbst senden');
});
