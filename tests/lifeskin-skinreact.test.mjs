import test from 'node:test';
import assert from 'node:assert/strict';
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
test('archived or set-aside cases leave the SkinReact chip and show up under Archiv',()=>{
  const spaeter=normalisiere('b'.repeat(32),{source,photos:['front'],step:'result',createdAt:'2026-10-03T05:00:00Z'});
  const sessions=[session,spaeter];
  const berichte={[id]:{archiviert:true,...skinreactFreigabe('95-100')},[spaeter.id]:{spaeter:true}};
  const html=(fach)=>renderLifeskin({status:'ready',bereich:'acne',weg:'lifeskinshop',fach,sitzungen:sessions,berichte,produkte:[],kennzahlen:baueKennzahlen(sessions),trichter:baueTrichter(sessions),vorschau:{}});
  assert.doesNotMatch(html('skinreact'),/data-skinreact-fall=/);
  assert.match(html('archiviert'),/012345/);
  assert.match(html('spaeter'),/bbbbbbbb/);
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

// AUTO (Schalter Përputhja, 03.10., Entscheidung Inhaber): 95-100 % steht
// in der Auswahl, und ein neuer Scan geht nach 5 s automatisch raus - ausser
// jemand tippt Stopp (heart-skinreact-auto.js).
test('Auto waehlt 95-100 vor; gestoppt und freigegeben gehen vor', () => {
  const s = { id: 'sr-auto', name: 'Arta', createdAt: new Date().toISOString(), photos: ['a'], source: { scanWorkflow: 'skinreact', weg: 'lifeskinshop' } };
  assert.match(renderSkinreactFall(s, {}, '', { perputhjaModus: 'auto' }), /value="95-100" selected/);
  for (const modus of ['hand', undefined]) assert.doesNotMatch(renderSkinreactFall(s, {}, '', { perputhjaModus: modus }), /" selected/);
  const frei = { skinreact: { bereich: '70-75', freigabeAt: '2026-10-03T08:00:00.000Z', art: 'produkteignung' } };
  assert.match(renderSkinreactFall(s, frei, '', { perputhjaModus: 'auto' }), /value="70-75" selected/);
  const gestoppt = renderSkinreactFall(s, {}, '', { perputhjaModus: 'auto', auto: { gestoppt: true } });
  assert.doesNotMatch(gestoppt, /" selected/);
  assert.match(gestoppt, /Auto gestoppt/);
});

test('Countdown in der Zeile mit Stopp - und unten in Heart, in jeder Ansicht', async () => {
  const s = { id: 'b'.repeat(32), name: 'Besa', createdAt: new Date().toISOString(), photos: ['a'], source: { scanWorkflow: 'skinreact', weg: 'lifeskinshop' } };
  const zeile = renderSkinreactFall(s, {}, '', { perputhjaModus: 'auto', auto: { sek: 3, sendet: false } });
  assert.match(zeile, /Auto-Freigabe 95–100 % in <b>3<\/b> s/);
  assert.match(zeile, new RegExp(`data-action="lifeskin-skinreact-stopp" data-id="${'b'.repeat(32)}">Stopp`));
  assert.doesNotMatch(renderSkinreactFall(s, {}, '', { perputhjaModus: 'auto', auto: { sek: 0, sendet: true } }), /Stopp</);
  const { renderHeartApp } = await import('../apps/mnyra-heart/heart-render.js');
  const knoten = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [], contains: () => false };
  renderHeartApp(knoten, {
    auth: { status: 'authenticated', user: { uid: 'u', email: 'c@m.t' }, profile: {}, access: { allowed: true } },
    shell: { activeView: 'dashboard', modal: {}, navGruppe: null, theme: 'nacht' },
    crmAdmin: {}, analytics: {}, landing: {}, destinations: {}, mnyraGo: {}, connections: {}, setup: {},
    lifeskin: { sitzungen: [s], skinreactAuto: { [s.id]: { sek: 4, sendet: false } } }
  }, {});
  assert.match(knoten.innerHTML, /class="heart-skinreact-leiste"/);
  assert.match(knoten.innerHTML, /<b>Besa<\/b> · Auto in <b>4<\/b> s/);
  assert.match(knoten.innerHTML, /heart-skinreact-leiste__stopp" data-action="lifeskin-skinreact-stopp"/);
});

test('result offers the original cart only for a suitable assessment; low range keeps personal advice', () => {
  const listeners = new Map();
  const root = { innerHTML: '', querySelector: selector => ({ addEventListener: (type, fn) => listeners.set(selector, fn) }) };
  let purchases = 0;
  const ui = new SkinreactErgebnis({ sitzung: {}, wurzel: root, kaufen: () => purchases++ });
  ui.aktiv = true;
  ui.anzeigen({ id: '55-60', min: 55, max: 60, text: '55–60%' });
  assert.match(root.innerHTML, /rekomandim personal/);
  assert.doesNotMatch(root.innerHTML, /sr-result__check|sr-result__products|Porosit Acne Duo/);
  listeners.get('.sr-order')();
  assert.equal(purchases, 0);
  ui.anzeigen({ id: '85-90', min: 85, max: 90, text: '85–90%' });
  assert.match(root.innerHTML, /LF ACNE/);
  assert.match(root.innerHTML, /LF MOISTUR/);
  assert.match(root.innerHTML, /sr-result__check/);
  listeners.get('.sr-order')();
  assert.equal(purchases, 1);
  assert.equal(ui.aktiv, false);
});

test('processing reserves the start control and restores it after returning to the guide', () => {
  const slot = {};
  const start = { innerHTML: 'Fillo skanimin', dataset: {}, hidden: false, disabled: false };
  const section = { dataset: {}, querySelector: () => slot };
  const doc = { getElementById: id => ({ zgjedhja: section, 'ls-start': start })[id] };
  skinreactEinbetten(doc, 'kamera');
  assert.equal(start.innerHTML, 'Anulo skanimin');
  skinreactEinbetten(doc, 'analyse');
  assert.equal(start.hidden, false, 'control keeps its layout space');
  assert.equal(start.disabled, true, 'reserved control cannot restart scan under result');
  skinreactEinbetten(doc, 'einstieg');
  assert.equal(start.disabled, false);
  assert.equal(start.innerHTML, 'Fillo skanimin');
});

test('processing and result have no back-to-page action or circular result display', () => {
  const root = { innerHTML: '', querySelector: () => ({ addEventListener() {} }) };
  const ui = new SkinreactErgebnis({ sitzung: {}, wurzel: root, kaufen() {} });
  ui.vorbereiten();
  assert.match(root.innerHTML, /data-sr-status/);
  assert.doesNotMatch(root.innerHTML, /sr-back|Kthehu|Vazhdo ne faqe|<circle/);
  ui.anzeigen({ id: '85-90', min: 85, max: 90, text: '85–90%' });
  assert.match(root.innerHTML, /REZULTATI YT/);
  assert.match(root.innerHTML, /Porosit Acne Duo/);
  assert.doesNotMatch(root.innerHTML, /sr-back|Kthehu|sr-result__visual|<circle/);
});

test('compact result uses the current shop price and keeps low assessments out of the cart', () => {
  const prices = { cmimi: '35 €', vecmas: '58 €' };
  const root = { innerHTML: '', ownerDocument: { querySelector: s => ({ textContent: prices[s.includes('vecmas') ? 'vecmas' : 'cmimi'] }) }, querySelector: () => ({ addEventListener() {} }) };
  const ui = new SkinreactErgebnis({ sitzung: {}, wurzel: root, kaufen() {} });
  ui.anzeigen({ id: '85-90', min: 85, max: 90, text: '85–90%' });
  assert.match(root.innerHTML, /data-preis="cmimi">35 €/);
  assert.match(root.innerHTML, /data-preis="vecmas" data-preis-zbritje>58 €/);
  assert.match(root.innerHTML, /lf-acne-3-klein\.jpg/);
  assert.match(root.innerHTML, /lf-moistur-klein\.jpg/);
  prices.cmimi = '60 €';
  ui.anzeigen({ id: '90-95', min: 90, max: 95, text: '90–95%' });
  assert.match(root.innerHTML, /data-preis="cmimi">60 €/);
  assert.doesNotMatch(root.innerHTML, /<del/);
  ui.anzeigen({ id: '10-15', min: 10, max: 15, text: '10–15%' });
  assert.doesNotMatch(root.innerHTML, /data-preis|<img|Porosit Acne Duo/);
});
