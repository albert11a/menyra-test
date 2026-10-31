import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {creatorVideoFirst,creatorVideoTime} from '../shared/creator-video.js';
import {renderCreatorCatalog} from '../shared/content-creator-view.js';
import {createCreatorVideoPlayback} from '../shared/creator-video-playback.js';

test('Video packs precede all photo packs regardless of insertion order or price; mixed media have separate counts',()=>{
 const page={id:'a'.repeat(32),kind:'shop',photoIds:['photo','old-video','new-photo','new-video'],mediaTypes:{'old-video':'video','new-video':'video'},products:[
  {id:'free-photo',priceCents:0,title:'Free photo',imageIds:['photo']},
  {id:'old',priceCents:200,title:'Old mixed pack',imageIds:['photo','old-video']},
  {id:'photo-only',priceCents:100,title:'Photo only',imageIds:['new-photo']},
  {id:'new',priceCents:100,title:'New video',imageIds:['new-video']}
 ]};
 const original=structuredClone(page),{document}=parseHTML(renderCreatorCatalog(page));
 assert.deepEqual([...document.querySelectorAll('.shop-product h3')].map(x=>x.textContent),['Old mixed pack','New video','Free photo','Photo only']);
 const first=document.querySelector('.shop-product');assert.equal(first.querySelector('.shop-slide video').dataset.photo,'old-video');
 assert.equal(first.querySelector('.shop-photo-count').getAttribute('aria-label'),'1 foto · 1 video');assert.equal(first.querySelectorAll('.shop-photo-count>span').length,2);
 assert.deepEqual(creatorVideoFirst(page),['old-video','new-video','photo','new-photo']);assert.deepEqual(page,original);
});

test('Video time display is bounded and formats minute boundaries',()=>{
 assert.deepEqual([NaN,Infinity,-2,0,59.9,60,125].map(creatorVideoTime),['0:00','0:00','0:00','0:00','0:59','1:00','2:05']);
});

test('Progress follows playback, seeks without resuming a paused video and fits portrait/landscape video edges',()=>{
 const {document,window}=parseHTML('<main><div data-view-track><div><video data-creator-video data-video-viewer data-video-src="/full"></video><div data-creator-video-controls><button data-creator-video-toggle></button><span data-creator-video-time></span><input data-creator-video-progress type="range" value="0"></div></div></div></main>');
 const root=document.querySelector('main'),video=root.querySelector('video'),panel=root.querySelector('[data-creator-video-controls]'),range=root.querySelector('input');
 for(const [key,value] of Object.entries({clientWidth:390,clientHeight:800,videoWidth:1080,videoHeight:1920}))Object.defineProperty(video,key,{value,configurable:true});
 video.duration=60;video.currentTime=15;video.paused=true;video.load=()=>{};
 video.play=()=>{video.paused=false;return Promise.resolve();};video.pause=()=>{video.paused=true;};
 let resize;const player=createCreatorVideoPlayback(root,{documentObj:document,windowObj:{IntersectionObserver:class{observe(){}unobserve(){}disconnect(){}},ResizeObserver:class{constructor(callback){resize=callback;}observe(){}unobserve(){}disconnect(){}}}});
 player.sync();player.openViewer();video.dispatchEvent(new window.Event('timeupdate'));
 assert.equal(range.value,'250');assert.equal(range.style.getPropertyValue('--video-progress'),'25%');assert.equal(panel.querySelector('span').textContent,'0:15 / 1:00');
 assert.ok(Math.abs(parseFloat(panel.style.bottom)-53.333)<.01);assert.equal(panel.style.width,'390px');
 video.paused=true;range.value='750';range.dispatchEvent(new window.Event('input'));assert.equal(video.currentTime,45);assert.equal(video.paused,true);assert.equal(range.getAttribute('aria-valuetext'),'0:45 / 1:00');
 Object.defineProperty(video,'videoWidth',{value:1920});Object.defineProperty(video,'videoHeight',{value:1080});resize([{target:video}]);assert.ok(Math.abs(parseFloat(panel.style.bottom)-290.3125)<.01);
 video.duration=Infinity;video.dispatchEvent(new window.Event('durationchange'));assert.equal(range.disabled,true);assert.equal(range.value,'0');
 player.destroy();range.value='1000';range.dispatchEvent(new window.Event('input'));assert.equal(video.currentTime,45);
});
