import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {createCreatorVideoPreload} from '../shared/creator-video-preload.js';
function setup(){
 const {document}=parseHTML('<main></main>'),created=[],createElement=document.createElement.bind(document);
 document.createElement=name=>{const node=createElement(name);if(name==='video'){node.loads=0;node.stops=0;node.plays=0;node.currentTime=0;node.load=()=>node.loads++;node.pause=()=>node.stops++;node.play=()=>{node.plays++;return Promise.resolve();};created.push(node);}return node;};
 const preload=createCreatorVideoPreload(document);
 function placeholder(id,src){const node=document.createElement('video');node.dataset.photo=id;node.dataset.videoSrc=src;node.setAttribute('data-video-viewer','');node.setAttribute('poster','/uncached-large.webp');document.querySelector('main').append(node);return node;}
 return {document,created,preload,placeholder};
}
test('Metadata and pointer intent reuse one paused player; opening transfers it with no duplicate load or play',()=>{
 const c=setup(),prepared=c.preload.prepare('clip','/marked.mp4',{poster:'/cached-cover.webp'});assert.equal(prepared.preload,'metadata');assert.equal(prepared.loads,1);assert.equal(prepared.plays,0);assert.equal(c.document.querySelector('video'),null);
 assert.equal(c.preload.prepare('clip','/marked.mp4',{intent:true}),prepared);assert.equal(prepared.preload,'auto');assert.equal(prepared.loads,1);
 const replacement=c.placeholder('clip','/marked.mp4'),opened=c.preload.take('clip',replacement);assert.equal(opened,prepared);assert.equal(opened.loads,1);assert.equal(opened.plays,0);assert.equal(opened.parentElement.tagName,'MAIN');assert.equal(opened.getAttribute('poster'),'/cached-cover.webp');assert.equal(opened.dataset.videoPoster,'/cached-cover.webp');assert.equal(opened.dataset.photo,'clip');assert.equal(c.preload.hasCandidate,false);
});
test('Selecting a different video releases the previous candidate and never plays either candidate',()=>{
 const c=setup(),a=c.preload.prepare('a','/a.mp4'),b=c.preload.prepare('b','/b.mp4',{intent:true});assert.notEqual(a,b);assert.equal(a.hasAttribute('src'),false);assert.equal(a.stops,1);assert.equal(b.loads,1);assert.equal(a.plays+b.plays,0);c.preload.destroy();assert.equal(b.hasAttribute('src'),false);assert.equal(c.preload.hasCandidate,false);
});
test('Closing retains the buffered player at the beginning; reopening does not reload it',()=>{
 const c=setup(),a=c.preload.prepare('a','/a.mp4'),first=c.preload.take('a',c.placeholder('a','/a.mp4'));first.currentTime=5;c.preload.keep('a',first);assert.equal(first.currentTime,0);assert.equal(c.document.querySelector('video'),null);assert.equal(c.preload.hasCandidate,true);
 const reopened=c.preload.take('a',c.placeholder('a','/a.mp4'));assert.equal(reopened,a);assert.equal(reopened.loads,1);assert.equal(c.preload.hasCandidate,false);
});
test('Failed prepared resources are replaced before opening and released on destruction',()=>{
 const c=setup(),a=c.preload.prepare('a','/a.mp4');a.error={code:2};const b=c.preload.prepare('a','/a.mp4');assert.notEqual(a,b);assert.equal(a.hasAttribute('src'),false);assert.equal(b.plays,0);c.preload.destroy();assert.equal(c.preload.hasCandidate,false);
});
