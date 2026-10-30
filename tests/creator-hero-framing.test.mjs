import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {creatorHeroFormat,normalizeCreatorCrop,creatorHeroCropStyle} from '../shared/creator-hero.js';
import {publicCreatorPage,renderCreatorCatalog} from '../shared/content-creator-view.js';
import {renderCreatorHeroEditor} from '../apps/mnyra-heart/heart-content-creator-hero.js';
import {renderContentCreator} from '../apps/mnyra-heart/heart-content-creator-render.js';
import {createHeartStore,createHeartInitialState} from '../apps/mnyra-heart/heart-state.js';
const pageId='a'.repeat(32),heroId=`hero_${'b'.repeat(32)}`,origin='https://menyra-media.alberthoti-vsa.workers.dev';
function fixture(){return {id:pageId,kind:'shop',published:true,name:'Shop',photoIds:[],products:[],heroImages:[{id:heroId,mode:'clean',thumb:`${origin}/media/social/ceo/thumb.webp`,medium:`${origin}/media/social/ceo/medium.webp`,large:`${origin}/media/social/ceo/large.webp`}]};}
test('Hero framing is bounded and untrusted stored values cannot enter CSS',()=>{
 assert.deepEqual(normalizeCreatorCrop(),{x:50,y:30,fit:'cover'});
 assert.deepEqual(normalizeCreatorCrop({x:-100,y:400,fit:'url(evil)'}),{x:0,y:100,fit:'cover'});
 assert.deepEqual(normalizeCreatorCrop({x:'background:red',y:null,fit:'contain'}),{x:50,y:30,fit:'contain'});
 const page={...fixture(),heroFormat:'portrait',heroCrop:{[heroId]:{x:75,y:10,fit:'contain'},unrelated:{private:'secret'}}};
 const safe=publicCreatorPage(page,pageId);assert.equal(safe.heroFormat,'portrait');assert.deepEqual(safe.heroCrop,{[heroId]:{x:75,y:10,fit:'contain'}});
 const {document}=parseHTML(renderCreatorCatalog(safe));assert.equal(document.querySelector('[data-hero-track]').dataset.format,'portrait');
 assert.match(document.querySelector('[data-hero-image]').getAttribute('style'),/object-position:75% 10%;object-fit:contain/);
});
test('The hero selects existing sharp derivatives in one responsive image and defers hidden slides',()=>{
 const page=fixture();page.heroImages.push({...page.heroImages[0],id:`hero_${'c'.repeat(32)}`});
 const {document}=parseHTML(renderCreatorCatalog(page)),images=[...document.querySelectorAll('[data-hero-image]')];
 assert.equal(images[0].getAttribute('src'),page.heroImages[0].medium);
 assert.equal(images[0].getAttribute('srcset'),`${page.heroImages[0].medium} 1080w, ${page.heroImages[0].large} 1600w`);
 assert.equal(images[0].getAttribute('fetchpriority'),'high');assert.equal(images[1].hasAttribute('src'),false);assert.equal(images[1].hasAttribute('srcset'),false);assert.ok(images[1].hasAttribute('data-deferred-srcset'));
 assert.equal(document.querySelectorAll('img[src]').length,1);
});
test('Heart preview sliders update without a request, then explicitly save the exact public framing',async()=>{
 const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/export (async )?function /g,'$1function ');
 const {document,window}=parseHTML('<main></main>'),root=document.querySelector('main'),store=createHeartStore(createHeartInitialState()),page=fixture();
 let stored=structuredClone(page);const writes=[];
 store.actions.patchContentCreator({pages:[page],selectedId:pageId});store.subscribe(state=>{root.innerHTML=renderContentCreator(state.contentCreator);});root.innerHTML=renderContentCreator(store.getState().contentCreator);
 const factory=new Function('db','doc','getDoc','updateDoc','serverTimestamp','CC_PAGES','creatorCdnEnabled','normalizeCreatorCrop','creatorHeroCropStyle','creatorHeroFormat',`${source}\nreturn createContentCreator;`);
 factory({},(...args)=>args.filter(value=>typeof value==='string').join('/'),async()=>({data:()=>stored}),async(path,fields)=>{writes.push(fields);for(const [key,value] of Object.entries(fields)){if(key.startsWith('heroCrop.'))stored.heroCrop={...stored.heroCrop,[key.slice(9)]:value};else stored[key]=value;}},()=> 'now','contentCreatorPages',async()=>true,normalizeCreatorCrop,creatorHeroCropStyle,creatorHeroFormat)({root,store});
 const settle=async()=>{for(let i=0;i<15;i++)await new Promise(resolve=>setImmediate(resolve));};
 for(const [axis,value] of [['x','82'],['y','14'],['fit','contain']]){
  const input=root.querySelector(`[data-cc-hero-adjust="${axis}"]`);if(input.tagName==='SELECT'){for(const option of input.querySelectorAll('option'))option.toggleAttribute('selected',option.value===value);}else input.value=value;input.dispatchEvent(new window.Event('input',{bubbles:true}));
  assert.equal(writes.length,0);input.dispatchEvent(new window.Event('change',{bubbles:true}));
 }
 assert.equal(root.querySelector('[data-cc-hero-preview]').getAttribute('style'),'object-position:82% 14%;object-fit:contain');
 root.querySelector('[data-cc-action="hero-crop-save"]').dispatchEvent(new window.Event('click',{bubbles:true}));await settle();
 assert.deepEqual(stored.heroCrop[heroId],{x:82,y:14,fit:'contain'});assert.equal(store.getState().contentCreator.heroDrafts[`${pageId}:${heroId}`],undefined);
 const format=root.querySelector('[data-cc-hero-format]');for(const option of format.querySelectorAll('option'))option.toggleAttribute('selected',option.value==='portrait');format.dispatchEvent(new window.Event('change',{bubbles:true}));await settle();
 assert.equal(stored.heroFormat,'portrait');assert.equal(root.querySelector('.cc-hero-preview').dataset.format,'portrait');
 assert.ok(renderCreatorCatalog(publicCreatorPage(stored,pageId)).includes('object-position:82% 14%;object-fit:contain'));
});
test('The mobile editor owns readable dark colours and previews fill one column',async()=>{
 const css=await readFile(new URL('../apps/mnyra-heart/heart-content-creator.css',import.meta.url),'utf8');
 assert.match(css,/\.cc-hero-editor\{[^}]*background:#191b1d;color:#f7f7f2/);assert.match(css,/\.cc-hero-editor \.cc-muted\{color:#c7c7c2;opacity:1/);
 assert.match(css,/\.cc-hero-editors\{display:grid;gap:18px\}/);assert.match(css,/@media\(min-width:760px\)/);
 const html=renderCreatorHeroEditor(fixture());const {document}=parseHTML(html);
 assert.equal(document.querySelectorAll('[type="range"]').length,2);assert.ok(document.querySelector('[data-cc-hero-format]'));
 assert.equal(document.querySelector('[data-cc-hero-preview]').getAttribute('src'),fixture().heroImages[0].medium);
});
