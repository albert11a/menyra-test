import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {startCreatorVideo} from '../apps/mnyra-heart/heart-creator-video-start.js';
import {createCreatorVideoPlayback} from '../shared/creator-video-playback.js';
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function processing(){
 const {document}=parseHTML('<html><body></body></html>');
 let gesture=false,plays=0,resumes=0;
 const video={muted:false,play(){plays++;return gesture?Promise.resolve():Promise.reject(new DOMException('Gesture required','NotAllowedError'));}};
 const audio={resume(){resumes++;return Promise.resolve();}};
 return {document,video,audio,tap(button){gesture=true;button.onclick();gesture=false;},get plays(){return plays;},get resumes(){return resumes;}};
}
test('Safari retry uses the original audible video and calls resume/play inside the tap before processing continues',async()=>{
 const c=processing();let recording=false;
 const pending=startCreatorVideo(c.video,c.audio,{documentObj:c.document}).then(()=>{recording=true;});
 await flush();assert.equal(recording,false);assert.equal(c.plays,1);assert.equal(c.document.querySelectorAll('[role=dialog]').length,1);
 c.tap(c.document.querySelector('button'));assert.equal(c.plays,2);assert.equal(c.resumes,2);
 await pending;assert.equal(recording,true);assert.equal(c.video.muted,false);assert.equal(c.document.querySelector('[role=dialog]'),null);
});
test('Allowed playback starts directly without a second tap or modal',async()=>{
 const c=processing();c.video.play=()=>Promise.resolve();await startCreatorVideo(c.video,c.audio,{documentObj:c.document});assert.equal(c.document.body.children.length,0);
});
test('Unsupported codecs fail without displaying a misleading tap-to-start action',async()=>{
 const c=processing();c.video.play=()=>Promise.reject(new DOMException('Codec unsupported','NotSupportedError'));
 await assert.rejects(startCreatorVideo(c.video,c.audio,{documentObj:c.document}),{name:'NotSupportedError'});assert.equal(c.document.body.children.length,0);
});
test('Cancel and backgrounding release the pending processing promise and remove the start action',async()=>{
 for(const cancel of [true,false]){
  const c=processing(),pending=startCreatorVideo(c.video,c.audio,{documentObj:c.document});await flush();
  const rejected=assert.rejects(pending,/abgebrochen|unterbrochen/);
  if(cancel)c.document.querySelectorAll('button')[1].onclick();else{Object.defineProperty(c.document,'visibilityState',{value:'hidden'});c.document.dispatchEvent(new c.document.defaultView.Event('visibilitychange'));}
  await rejected;assert.equal(c.document.body.children.length,0);
 }
});
test('Lower-left viewer control preserves explicit pause across scroll/sync and resumes with audio on tap; ended video stays stopped',async()=>{
 const {document,window}=parseHTML('<main><div data-view-track><div><video data-creator-video data-video-viewer data-video-src="/full"></video><button data-creator-video-toggle></button></div></div></main>');
 const root=document.querySelector('main'),video=root.querySelector('video'),button=root.querySelector('button');
 let plays=0;video.paused=true;video.load=()=>{};video.play=()=>{plays++;video.paused=false;video.dispatchEvent(new window.Event('play'));return Promise.resolve();};video.pause=()=>{video.paused=true;video.dispatchEvent(new window.Event('pause'));};
 const player=createCreatorVideoPlayback(root,{windowObj:{IntersectionObserver:class{observe(){}unobserve(){}disconnect(){}}},documentObj:document});
 player.sync();player.openViewer();await flush();assert.equal(plays,1);assert.equal(video.controls,false);assert.equal(video.muted,false);assert.equal(button.getAttribute('aria-label'),'Ndalo videon');
 button.click();assert.equal(video.paused,true);player.sync();player.openViewer();assert.equal(plays,1);assert.equal(button.getAttribute('aria-label'),'Luaj videon');
 button.click();await flush();assert.equal(plays,2);assert.equal(video.paused,false);assert.equal(video.muted,false);
 video.paused=true;video.dispatchEvent(new window.Event('ended'));player.sync();assert.equal(plays,2);
 player.destroy();button.click();assert.equal(plays,2);
});

test('Actual encoder waits for playback permission before recording, retains audio and emits a silent boomerang',async()=>{
 const {readFile}=await import('node:fs/promises');
 const source=(await readFile(new URL('../apps/mnyra-heart/heart-creator-video.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace('export async function','async function');
 let permit,requested=false,clock=0;const recordings=[],tracks=[];
 const track=kind=>{const value={kind,stopped:false,stop(){this.stopped=true;}};tracks.push(value);return value;};
 const stream=kind=>{const items=[track(kind)];return {addTrack:t=>items.push(t),getAudioTracks:()=>items.filter(t=>t.kind==='audio'),getTracks:()=>items};};
 const destination={stream:stream('audio')},audio={createMediaElementSource:()=>({connect(){},disconnect(){}}),createMediaStreamDestination:()=>destination};
 const video={duration:.12,currentTime:0,videoWidth:360,videoHeight:480,paused:true,style:{},setAttribute(){},removeAttribute(){},remove(){},pause(){this.paused=true;},load(){if(this.src)queueMicrotask(()=>this.onloadeddata?.());}};
 const context={drawImage(){},getImageData:()=>({frame:video.currentTime}),putImageData(){}};
 const canvases=[];
 const document={visibilityState:'visible',body:{appendChild(){}},addEventListener(){},removeEventListener(){},createElement:kind=>{
  if(kind==='video')return video;
  const canvas={getContext:()=>context,captureStream:()=>stream('video'),toBlob:callback=>callback(new Blob(['poster'],{type:'image/jpeg'}))};canvases.push(canvas);return canvas;
 }};
 class Recorder{
  static isTypeSupported(){return true;}
  constructor(input,options){this.stream=input;this.mimeType=options.mimeType;this.state='inactive';recordings.push(this);}
  start(){this.state='recording';}
  stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['encoded'])});this.onstop?.();}
 }
 const raf=callback=>setImmediate(()=>{if(!video.paused){video.currentTime+=.04;if(video.currentTime>video.duration){video.onended?.();return;}}callback();});
 const create=new Function('creatorVideoFile','CREATOR_VIDEO_PREVIEW_LIMIT','creatorVideoAudioContext','startCreatorVideo','globalThis','document','URL','requestAnimationFrame','cancelAnimationFrame','performance',`${source}\nreturn prepareCreatorVideo;`);
 const prepare=create(()=>true,48*1024*1024,()=>audio,async()=>{requested=true;await new Promise(resolve=>{permit=resolve;});video.paused=false;},{MediaRecorder:Recorder},document,{createObjectURL:()=> 'blob:source',revokeObjectURL(){}},raf,clearImmediate,{now:()=>clock+=40});
 const pending=prepare(new File(['original'],'reel.mov',{type:'video/quicktime'}));
 await flush();assert.equal(requested,true);assert.equal(recordings.length,0);
 permit();const result=await pending;
 assert.equal(recordings.length,2);assert.equal(recordings[0].stream.getAudioTracks().length,1);assert.equal(recordings[1].stream.getAudioTracks().length,0);
 assert.ok(result.preview.size>0);assert.ok(result.boomerang.size>0);assert.ok(result.poster.size>0);assert.ok(tracks.every(t=>t.stopped));assert.equal(video.paused,true);
});

test('Processing waits for the audio context as well as video playback before allowing recording',async()=>{
 const c=processing();let resume,ready=false;c.video.play=()=>Promise.resolve();c.audio.resume=()=>new Promise(resolve=>{resume=resolve;});
 const pending=startCreatorVideo(c.video,c.audio,{documentObj:c.document}).then(()=>{ready=true;});await flush();assert.equal(ready,false);resume();await pending;assert.equal(ready,true);
});
