import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('apps/lifeskin-landing/scroll-story.js','utf8');
function setup(){
 const pending=[],listeners={},pairs=[0,1].map(()=>({hidden:false,images:[{src:'fallback'},{src:'fallback'}],querySelectorAll(){return this.images;}}));
 const proof={hidden:false,querySelectorAll(){return pairs;}};
 const root={querySelectorAll(){return [];},querySelector(){return proof;},addEventListener(name,fn){listeners[name]=fn;}};
 class Image{set src(value){this.path=value;pending.push(this);}}
 vm.runInNewContext(source,{document:{getElementById(id){return id==='lf-preview'?root:{};}},window:{matchMedia(){return {matches:false};}},Image});
 return {proof,pairs,pending,update:detail=>listeners['lifeskin:comparison-cases']({detail})};
}
test('early proof shows only complete configured pairs and hides unused thumbnails',async()=>{
 const s=setup(),update=s.update([{para:'before',pas:'after'}]);
 assert.equal(s.proof.hidden,true);
 s.pending[0].onload();await Promise.resolve();assert.equal(s.pairs[0].images[0].src,'fallback');
 s.pending[1].onload();await update;
 assert.equal(s.proof.hidden,false);assert.equal(s.pairs[0].images[1].src,'after');assert.equal(s.pairs[1].hidden,true);
});
test('an empty configuration prevents a pending older request from restoring proof',async()=>{
 const s=setup(),old=s.update([{para:'old-before',pas:'old-after'}]);await s.update([]);
 s.pending.forEach(i=>i.onload());await old;
 assert.equal(s.proof.hidden,true);assert.equal(s.pairs[0].images[0].src,'fallback');
});
test('failed configured photos never expose unrelated fallback proof',async()=>{
 const s=setup(),update=s.update([{para:'missing',pas:'after'}]);s.pending[0].onerror();await update;
 assert.equal(s.proof.hidden,true);
});
