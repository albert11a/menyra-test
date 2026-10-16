import test from 'node:test';
import assert from 'node:assert/strict';
import { Storefront, productGallery } from '../apps/lifeskin-shop/storefront.js';
const product = {id:'sample', name:'LF test', price:17.95, images:['/one.jpg','/two.jpg','/three.jpg']};
const button = dataset => ({dataset, setAttribute(key,value){this[key]=value;}});
function gallery(reduced = false) {
  const events = {}, moves = [], thumbs = [0,1,2].map(i=>button({sfImage:String(i)}));
  const arrows = [-1,1].map(i=>button({sfSlide:String(i)}));
  const counter = {textContent:''};
  const track = {clientWidth:320, scrollLeft:0, isConnected:true, addEventListener(name,fn){events[name]=fn;}, scrollTo(value){moves.push(value);}};
  const root = {querySelectorAll:selector=>selector==='[data-sf-image]'?thumbs:arrows, querySelector:()=>counter};
  const win = {matchMedia:()=>({matches:reduced}), requestAnimationFrame:fn=>{events.frame=fn;return 1;}};
  const sf = new Storefront({dok:{defaultView:win, querySelector:selector=>selector==='.sf-gallery'?root:track}});
  sf.activeProduct = product;sf.bindGallery();
  return {sf,events,moves,thumbs,arrows,counter,track};
}
test('v1.1 gallery has no fake slides or navigation for a single photograph',()=>{
  assert.doesNotMatch(productGallery({...product,images:product.images.slice(0,1)}), /data-sf-slide|data-sf-image/);
  assert.doesNotMatch(productGallery({...product,images:[]}), /<img/);
  const html=productGallery(product);
  assert.equal((html.match(/aria-roledescription="slide"/g)||[]).length,3);
  assert.match(html,/aria-controls="sf-gallery-track"/);
});
test('gallery buttons clamp at both ends, synchronize thumbnails and honor reduced motion',()=>{
  const {sf,moves,thumbs,arrows,counter}=gallery(true);
  sf.changeImage(200);
  assert.deepEqual(moves.pop(),{left:640,behavior:'instant'});
  assert.equal(thumbs[2]['aria-pressed'],'true');assert.equal(arrows[1].disabled,true);assert.equal(counter.textContent,'3 / 3');
  sf.changeImage(-3);assert.equal(sf.galleryPosition,0);assert.equal(arrows[0].disabled,true);
});
test('native swipe and keyboard navigation update the same slider without vertical scrolling',()=>{
  const {sf,events,track,moves}=gallery();
  track.scrollLeft=321;events.scroll();events.frame();assert.equal(sf.galleryPosition,1);
  let prevented=false;events.keydown({target:track,key:'End',preventDefault(){prevented=true;}});
  assert.equal(prevented,true);assert.deepEqual(moves.pop(),{left:640,behavior:'smooth'});
  events.keydown({target:{},key:'ArrowLeft',preventDefault(){throw Error('unrelated key intercepted');}});
});
test('deferred photo refresh preserves the selected image and does not reset quantity',()=>{
  const {sf,moves,track}=gallery();sf.galleryPosition=2;sf.quantity=4;
  track.children=[{},{},{}];
  sf.doc.querySelector('.sf-gallery').querySelector=()=>track;
  sf.refreshGallery();assert.equal(sf.quantity,4);assert.equal(sf.galleryPosition,2);assert.deepEqual(moves,[]);
});
test('quantity CTA follows the selected total with bounds at one and twenty',()=>{
  const output={},total={},buttons=[button({sfPdpQty:'-1'}),button({sfPdpQty:'1'})];
  const sf=new Storefront({dok:{getElementById:()=>output,querySelector:()=>total,querySelectorAll:()=>buttons}});sf.activeProduct=product;
  sf.changeQuantity(1);assert.equal(output.textContent,2);assert.equal(total.textContent,'35,9 €');
  sf.changeQuantity(99);assert.equal(sf.quantity,20);assert.equal(buttons[1].disabled,true);
  sf.changeQuantity(-99);assert.equal(sf.quantity,1);assert.equal(buttons[0].disabled,true);
});
test('search input preserves the scroll position and avoids repeated history entries',()=>{
  const listeners={},homeCalls=[];
  const search={addEventListener(name,fn){listeners[name]=fn;}};
  const doc={documentElement:{dataset:{storeView:'home'}},getElementById:id=>id==='storefront-home'?{}:id==='sf-search'?search:null,addEventListener(){},defaultView:{addEventListener(){}}};
  const sf=new Storefront({dok:doc});sf.restoreRoute=()=>{};sf.render=()=>{};sf.home=(...args)=>homeCalls.push(args);sf.start();
  listeners.input({target:{value:'mo'}});listeners.input({target:{value:'mois'}});
  assert.equal(homeCalls.length,0);assert.equal(sf.search,'mois');
  doc.documentElement.dataset.storeView='product';listeners.input({target:{value:'acne'}});
  assert.deepEqual(homeCalls,[[true,true,false]]);
});
test('browser back restores the saved list scroll instead of jumping to a section',()=>{
  const calls=[];let saved;
  const sf=new Storefront({dok:{defaultView:{scrollY:940,history:{state:{keep:true},replaceState:state=>{saved=state;}},scrollTo:value=>calls.push(value),requestAnimationFrame:fn=>fn()},getElementById:()=>({scrollIntoView(){throw Error('unexpected section jump');}})}});
  sf.rememberScroll();assert.deepEqual(saved,{keep:true,sfScroll:940});
  sf.show=()=>{};sf.backScroll=940;sf.home(true,false);
  assert.deepEqual(calls,[{top:940,behavior:'instant'}]);
});
