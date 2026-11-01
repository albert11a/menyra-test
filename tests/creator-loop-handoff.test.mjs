import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {createCreatorLoopHandoff} from '../shared/creator-loop-handoff.js';
import {createCreatorVideoPlayback} from '../shared/creator-video-playback.js';
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function setup(){
 const {document,window}=parseHTML('<main><div class="shop-slide"></div></main>');
 const timers=new Map();let clock=0,nextTimer=0,created=0;
 const environment={setTimeout(fn,ms){const id=++nextTimer;timers.set(id,{fn,at:clock+ms});return id;},clearTimeout:id=>timers.delete(id)};
 function advance(ms){clock+=ms;for(const [id,task] of [...timers])if(task.at<=clock){timers.delete(id);task.fn();}}
 function video(){
  const node=document.createElement('video');created++;node.duration=2;node.currentTime=0;node.readyState=4;node.paused=true;node.seeking=false;node.loop=true;node.loads=0;node.plays=0;node.stops=0;node.bufferEnd=2;
  node.buffered={length:1,start:()=>0,end:()=>node.bufferEnd};node.frames=new Map();let nextFrame=0;
  node.requestVideoFrameCallback=fn=>{const id=++nextFrame;node.frames.set(id,fn);return id;};node.cancelVideoFrameCallback=id=>node.frames.delete(id);
  node.play=()=>{node.plays++;node.paused=false;node.dispatchEvent(new window.Event('play'));return Promise.resolve();};
  node.pause=()=>{node.stops++;node.paused=true;node.dispatchEvent(new window.Event('pause'));};
  node.load=()=>{node.loads++;node.readyState=node.hasAttribute('src')?4:0;};
  node.cloneNode=()=>{const clone=video();for(const attr of node.attributes)clone.setAttribute(attr.name,attr.value);return clone;};
  return node;
 }
 const primary=video(),root=document.querySelector('main'),host=root.firstElementChild;host.append(primary);
 primary.setAttribute('data-creator-video','');primary.setAttribute('data-video-src','/safe-boomerang.mp4');primary.setAttribute('src','/safe-boomerang.mp4');primary.style.opacity='.9';
 function frame(node,time){node.currentTime=time;const callbacks=[...node.frames.values()];node.frames.clear();for(const callback of callbacks)callback(clock,{mediaTime:time});}
 const helper=createCreatorLoopHandoff(primary,{windowObj:environment});
 return {document,window,root,host,primary,helper,environment,timers,advance,frame,get created(){return created;},buffer:()=>root.querySelector('[data-creator-loop-buffer]')};
}

test('Reuses one warmed decoder across successive cycles and hands off before EOF only after a decoded incoming frame',async()=>{
 const c=setup();await c.helper.play();const second=c.buffer();assert.ok(second);assert.equal(c.created,2);assert.equal(second.getAttribute('src'),c.primary.getAttribute('src'));assert.equal(second.hasAttribute('data-creator-video'),false);assert.equal(second.muted,true);
 c.frame(c.primary,1.9);assert.equal(second.plays,1);assert.equal(second.style.opacity,'.001');assert.equal(c.primary.style.opacity,'.9');assert.equal(c.primary.paused,false);
 c.frame(second,.01);assert.equal(second.style.opacity,'1');assert.equal(c.primary.paused,false);assert.equal(c.primary.loop,false);
 c.advance(50);assert.equal(c.primary.paused,true);assert.equal(c.primary.currentTime,0);assert.equal(c.primary.style.opacity,'.001');
 c.frame(second,1.9);assert.equal(c.primary.plays,2);assert.equal(c.primary.style.opacity,'.001');
 c.frame(c.primary,.01);assert.equal(c.primary.style.opacity,'1');c.advance(50);assert.equal(second.paused,true);assert.equal(second.currentTime,0);assert.equal(c.created,2);
 c.helper.destroy();assert.equal(c.buffer(),null);assert.equal(c.timers.size,0);assert.equal(c.primary.frames.size,0);assert.equal(second.frames.size,0);assert.equal(c.primary.style.opacity,'.9');
});

test('Slow first downloads do not create a competing preview decoder until the entire clip is buffered',async()=>{
 const c=setup();c.primary.bufferEnd=1;await c.helper.play();assert.equal(c.buffer(),null);assert.equal(c.created,1);
 c.frame(c.primary,.5);assert.equal(c.buffer(),null);c.primary.bufferEnd=2;c.frame(c.primary,.8);assert.ok(c.buffer());c.helper.destroy();
});

test('Stalled or late incoming frames never flash a poster/late frame or stop the visible native fallback',async()=>{
 const c=setup();await c.helper.play();const second=c.buffer();c.frame(c.primary,1.9);c.advance(250);
 assert.equal(c.primary.paused,false);assert.equal(c.primary.loop,true);assert.equal(second.paused,true);assert.equal(c.primary.style.opacity,'1');
 c.frame(c.primary,.01);c.frame(c.primary,1.9);
 // The primary already wrapped while the other decoder was starting.
 c.primary.currentTime=.02;c.frame(second,.01);assert.equal(second.style.opacity,'.001');assert.equal(c.primary.style.opacity,'1');assert.equal(second.paused,true);
 c.helper.destroy();
});

test('Rejected muted playback retains native looping and does not reveal the incoming video',async()=>{
 const c=setup();await c.helper.play();const second=c.buffer();second.play=()=>Promise.reject(new DOMException('Blocked','NotAllowedError'));
 c.frame(c.primary,1.9);await settle();assert.equal(c.primary.paused,false);assert.equal(c.primary.loop,true);assert.equal(second.style.opacity,'.001');assert.equal(second.frames.size,0);c.helper.destroy();
});

test('Pausing a pending handoff or active buffer cancels callbacks, frees the decoder, and resumes from the primary',async()=>{
 for(const commit of [false,true]){
  const c=setup();await c.helper.play();const second=c.buffer();c.frame(c.primary,1.9);if(commit)c.frame(second,.01);
  c.helper.pause();assert.equal(c.helper.paused,true);assert.equal(c.primary.paused,true);assert.equal(second.paused,true);assert.equal(c.buffer(),null);assert.equal(c.timers.size,0);assert.equal(second.frames.size,0);assert.equal(c.primary.frames.size,0);
  c.advance(1000);await c.helper.play();assert.equal(c.primary.paused,false);assert.ok(c.buffer());c.helper.destroy();
 }
});

test('Unsupported browsers and full audible viewers retain the original player without clones',()=>{
 const c=setup();c.helper.destroy();c.primary.setAttribute('data-video-viewer','');assert.equal(createCreatorLoopHandoff(c.primary),null);c.primary.removeAttribute('data-video-viewer');c.primary.requestVideoFrameCallback=undefined;assert.equal(createCreatorLoopHandoff(c.primary),null);assert.equal(c.created,1);
});

test('Playback synchronization does not restart the hidden primary while its buffer plays; covered/offscreen previews release it',async()=>{
 const c=setup();c.helper.destroy();let visibility;
 const player=createCreatorVideoPlayback(c.root,{documentObj:c.document,windowObj:{...c.environment,IntersectionObserver:class{constructor(callback,options){if(!options.rootMargin)visibility=callback;}observe(){}unobserve(){}disconnect(){}}}});
 player.sync();visibility([{target:c.primary,isIntersecting:true,intersectionRatio:1}]);await settle();const second=c.buffer();assert.ok(second);
 c.frame(c.primary,1.9);c.frame(second,.01);c.advance(50);const plays=c.primary.plays;player.sync();assert.equal(c.primary.plays,plays);assert.equal(second.paused,false);
 c.root.setAttribute('inert','');player.sync();assert.equal(c.buffer(),null);assert.equal(second.paused,true);assert.equal(c.primary.paused,true);assert.equal(c.timers.size,0);
 c.root.removeAttribute('inert');player.sync();assert.equal(c.primary.paused,false);player.destroy();assert.equal(c.buffer(),null);
});

test('A stale rejected play cannot pause a newer playback session',async()=>{
 const c=setup();let rejectFirst;
 c.primary.play=()=>{c.primary.paused=false;return new Promise((_,reject)=>{rejectFirst=reject;});};
 const first=c.helper.play();c.helper.pause();c.primary.play=()=>{c.primary.paused=false;return Promise.resolve();};await c.helper.play();
 rejectFirst(new DOMException('Superseded play','AbortError'));await assert.rejects(first,{name:'AbortError'});assert.equal(c.primary.paused,false);assert.equal(c.helper.paused,false);c.helper.destroy();
});

test('Buffer errors fall back safely and stale errors after removal cannot change a resumed session',async()=>{
 const c=setup();await c.helper.play();const second=c.buffer();second.dispatchEvent(new c.window.Event('error'));assert.equal(c.buffer(),null);assert.equal(c.primary.paused,false);assert.equal(c.primary.loop,true);
 c.helper.pause();await c.helper.play();const plays=c.primary.plays;second.dispatchEvent(new c.window.Event('error'));assert.equal(c.primary.plays,plays);assert.equal(c.helper.paused,false);c.helper.destroy();
});
