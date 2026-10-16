import test from 'node:test';
import assert from 'node:assert/strict';
import { fragenNachAufnahme, OBERFLAECHE, OBERFLAECHE_WEGE, t } from '../apps/lifeskin/lifeskin-content.js';
import { lies, ohneKommentare, methode } from './lifeskin-quelle.mjs';
const source = ohneKommentare(lies('apps/lifeskin/lifeskin-app.js'));
// Execute the actual method body with only its UI boundaries substituted.
const method = name => new Function('fragenNachAufnahme', '$', '$$', `return function${methode(source,name).replaceAll('this.#','this.')}`)(fragenNachAufnahme, selector=>selector==='#ls-fragen'?{}:null,()=>[]);
test('both /lifeskin captures go directly to name without questions; other variants retain their questions',()=>{
  for(const capture of ['scan','foto']) {
    const calls=[];
    const state={weg:'',zustand:{typ:capture,nachFragen:true},antwortzeitHolen(){},nameZeigen(){calls.push('name');},fragenStarten(){throw Error('removed question shown');}};
    method('#aufnahmeFragen').call(state,capture);
    assert.deepEqual(calls,['name']);assert.equal(state.zustand.nachFragen,false);
  }
  for(const variant of ['lifeskinshop','lifeskin2']) {
    let list;
    method('#aufnahmeFragen').call({weg:variant,zustand:{},antwortzeitHolen(){},nameZeigen(){throw Error('variant questions skipped');},fragenStarten(value){list=value;}},'foto');
    assert.equal(list.length,variant==='lifeskinshop'?3:4);
  }
});
test('reload of the removed question preserves saved photos and answers and resumes name without replaying steps',()=>{
  const stored={schirm:'fragen',typ:'foto',fotoAnzahl:1,antworten:{anliegen:['pucrrat']}};
  const calls=[];
  const state={weg:'',zustand:{},fragen:{},standHolen:()=>stored,nameZeigen:melden=>calls.push(melden),fragenStarten(){throw Error('removed question restored');}};
  assert.equal(method('#standAufnehmen').call(state),true);
  assert.equal(state.zustand.fotoAnzahl,1);assert.deepEqual(state.fragen.antworten,stored.antworten);
  assert.equal(state.zustand.nachFragen,false);assert.deepEqual(calls,[false]);
});
test('photo-first method order and confirmation describe only stored photos on /lifeskin',()=>{
  const html=lies('apps/lifeskin-landing/index.html');
  const block=html.slice(html.indexOf('id="ls-wahl"'),html.indexOf('</section>',html.indexOf('id="ls-wahl"')));
  assert.deepEqual([...block.matchAll(/data-ls-weg="([a-z]+)"/g)].map(m=>m[1]),['foto','skanim','trup']);
  for(const key of ['telGespeichertFoto','telGespeichertScan']) {
    const copy=t(OBERFLAECHE_WEGE[''][key],'sq');assert.doesNotMatch(copy,/p[eë]rgjigj/);assert.match(copy,/ruajtur/);
    assert.match(t(OBERFLAECHE[key],'sq'),/përgjigjet/); // Other variants still collect answers.
  }
});
