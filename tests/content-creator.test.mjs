import test from 'node:test';
import assert from 'node:assert/strict';
import {contentRows,contentStats,contentStatus,contentLink,ccImage} from '../shared/content-creator.js';
import {createHeartInitialState,createHeartStore} from '../apps/mnyra-heart/heart-state.js';
import {renderHeartApp} from '../apps/mnyra-heart/heart-render.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';

test('Antworten ersetzen vorherige Filter; Scrollen bleibt eine zusätzliche Messung',()=>{
 const page={id:'a',workflow:'sent'};
 assert.equal(contentStatus(page,[]),'sent');
 assert.equal(contentStatus(page,[{opened:true,scrolled:true}]),'opened');
 for(const answer of ['yes','no']){
  const rows=contentRows([page],[{pageId:'a',opened:true,scrolled:true,answer}]);
  assert.equal(rows[0].status,answer);
  assert.equal(rows.filter(r=>r.status==='sent'||r.status==='opened').length,0);
  assert.equal(rows[0].scrolled,true);
 }
});
test('Wiederholte Besuche zählen ein Lokal einmal; neueste Antwort entscheidet',()=>{
 const rows=contentRows([{id:'a',workflow:'sent'},{id:'b',workflow:'ready'},{id:'c',workflow:'working'}],[
 {pageId:'a',opened:true,scrolled:true,answer:'yes',updatedAt:'2026-10-29T10:00:00Z'},
 {pageId:'a',opened:true,answer:'no',updatedAt:'2026-10-29T11:00:00Z'},
 {pageId:'b',opened:true,answer:'yes'},
 {pageId:'deleted',opened:true,answer:'yes'}]);
 assert.deepEqual(contentStats(rows),{opened:2,scrolled:1,yes:1,no:1});
 assert.equal(rows[0].status,'no');assert.equal(rows[2].status,'working');
});
test('Creator-Zustand verändert weder Anmeldung noch Fälle',()=>{
 const store=createHeartStore(createHeartInitialState()),before=store.getState();
 store.actions.patchContentCreator({filter:'yes',pages:[{id:'a'}]});
 assert.deepEqual(store.getState().auth,before.auth);assert.deepEqual(store.getState().lifeskin,before.lifeskin);
 assert.equal(before.contentCreator.filter,'all');assert.equal(store.getState().contentCreator.filter,'yes');
});
test('Header zeigt rechts ausschließlich Plus; Menüzugang ist vorhanden',()=>{
 const state=createHeartInitialState();state.auth={status:'authenticated',access:{allowed:true},user:{uid:'ceo'}};
 state.shell.activeView='contentCreator';
 const root={innerHTML:'',querySelector:()=>null,contains:()=>false};renderHeartApp(root,state,{});
 assert.match(root.innerHTML,/data-nav-key="contentCreator"/);
 const right=root.innerHTML.split('<div class="heart-topbar__right">')[1].split('</header>')[0];
 assert.match(right,/data-cc-action="new"/);assert.doesNotMatch(right,/refresh-heart|clock|calendar|leadSettingsBtn/);
 assert.doesNotMatch(root.innerHTML,/konnte nicht gezeichnet werden/);
});
test('Gefilterte Liste zeigt keine beantworteten Lokale mehr unter Verschickt',()=>{
 const html=renderContentCreator({pages:[{id:'a',name:'Local-A',workflow:'sent'},{id:'b',name:'Local-B',workflow:'sent'}],visits:[{pageId:'a',answer:'yes',opened:true}],filter:'sent'});
 assert.doesNotMatch(html,/Local-A/);assert.match(html,/Local-B/);
});
test('Namen werden escaped, fremde Bild-URLs ausgeschlossen, Upload erlaubt Mehrfachauswahl',()=>{
 const html=renderContentCreator({editor:true,draftName:'"><script>alert(1)</script>',pages:[],visits:[]});
 assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);assert.match(html,/multiple accept="image\/jpeg/);
 assert.equal(ccImage('javascript:alert(1)'),'');
 assert.equal(contentLink('id',true,'https://mnyra.com'),'https://mnyra.com/content-creator/id?still=1');
});
