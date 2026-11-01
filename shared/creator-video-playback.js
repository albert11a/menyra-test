import {createCreatorLoopHandoff} from './creator-loop-handoff.js';
import {creatorVideoTime} from './creator-video.js';
// The same inline, muted loop semantics as feed story tiles. Pause previews
// outside the viewport, behind a drawer/viewer and on hidden browser tabs.
export function createCreatorVideoPlayback(root,{windowObj=globalThis,documentObj=root.ownerDocument}={}){
 const videos=new Set(),visible=new Set(),configured=new WeakSet(),manualPaused=new WeakSet(),listeners=new Map(),loops=new Map();let destroyed=false;
 const current=video=>{
  if(documentObj.visibilityState==='hidden'||video.closest('[inert],[hidden]'))return false;
  const details=video.closest('details');if(details&&!details.hasAttribute('open'))return false;
  const track=video.closest('[data-track],[data-view-track],[data-hero-track],[data-cc-gallery],[data-cc-track]');
  if(track){const slide=[...track.children].find(node=>node.contains(video));if(slide&&track.clientWidth>0&&[...track.children].indexOf(slide)!==Math.round(track.scrollLeft/track.clientWidth))return false;}
  return true;
 };
 function poster(video){if(video.dataset.videoPoster&&video.getAttribute('poster')!==video.dataset.videoPoster)video.setAttribute('poster',video.dataset.videoPoster);}
 function control(video){return video.parentElement?.querySelector('[data-creator-video-toggle]');}
 function reflect(video){
  const button=control(video);if(button){button.textContent=video.paused?'▶':'Ⅱ';button.setAttribute('aria-label',video.paused?'Luaj videon':'Ndalo videon');button.setAttribute('aria-pressed',String(!video.paused));}
  const panel=video.parentElement?.querySelector('[data-creator-video-controls]');if(!panel)return;
  const duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:0,time=Math.max(0,Math.min(duration,Number(video.currentTime)||0)),progress=panel.querySelector('[data-creator-video-progress]');
  const label=`${creatorVideoTime(time)} / ${creatorVideoTime(duration)}`;
  const timeLabel=panel.querySelector('[data-creator-video-time]');if(timeLabel.textContent!==label)timeLabel.textContent=label;
  if(progress){progress.disabled=!duration;progress.value=String(duration?Math.round(time/duration*1000):0);progress.style.setProperty('--video-progress',`${duration?time/duration*100:0}%`);progress.setAttribute('aria-valuetext',label);}
 }
 function fitControls(video){
  const panel=video.parentElement?.querySelector('[data-creator-video-controls]');if(!panel)return;
  // Align with object-fit:contain, including horizontal/vertical letterboxing.
  const width=video.clientWidth,height=video.clientHeight;
  if(width&&height&&video.videoWidth&&video.videoHeight){const scale=Math.min(width/video.videoWidth,height/video.videoHeight);panel.style.left=`${(width-video.videoWidth*scale)/2}px`;panel.style.width=`${video.videoWidth*scale}px`;panel.style.right='auto';panel.style.bottom=`${(height-video.videoHeight*scale)/2}px`;}
 }
 function pause(video){const loop=loops.get(video);if(loop)loop.pause();else video.pause?.();}
 function play(video){
  try{Promise.resolve(loops.get(video)?.play()??video.play?.()).catch(()=>{}).finally(()=>reflect(video));}catch{reflect(video);}
 }
 function configure(video){
  const viewer=video.hasAttribute('data-video-viewer');
  video.muted=!viewer;video.defaultMuted=!viewer;video.loop=!viewer;video.playsInline=true;
  video.controls=viewer&&!control(video);
  if(!viewer){const loop=createCreatorLoopHandoff(video,{windowObj});if(loop)loops.set(video,loop);}
  const button=control(video),toggle=()=>{
   if(video.paused){manualPaused.delete(video);video.muted=false;play(video);}
   else{manualPaused.add(video);pause(video);}reflect(video);
  };
  const ended=()=>{if(viewer)manualPaused.add(video);reflect(video);};
  let animation;
  const stopAnimation=()=>{if(animation!==undefined)windowObj.cancelAnimationFrame?.(animation);animation=undefined;};
  const animate=()=>{stopAnimation();reflect(video);if(!video.paused&&viewer&&windowObj.requestAnimationFrame)animation=windowObj.requestAnimationFrame(animate);};
  const changed=event=>{reflect(video);if(event.type==='loadedmetadata'||event.type==='resize')fitControls(video);if(video.paused)stopAnimation();};
  const progress=video.parentElement?.querySelector('[data-creator-video-progress]');
  const seek=()=>{if(Number.isFinite(video.duration)&&video.duration>0){video.currentTime=Math.min(video.duration,Math.max(0,Number(progress.value)/1000*video.duration));reflect(video);}};
  progress?.addEventListener('input',seek);
  video.addEventListener('play',animate);
  button?.addEventListener('click',toggle);
  for(const event of ['pause','error','timeupdate','durationchange','loadedmetadata','seeked','resize'])video.addEventListener(event,changed);
  video.addEventListener('ended',ended);
  listeners.set(video,()=>{stopAnimation();video.removeEventListener('play',animate);progress?.removeEventListener('input',seek);button?.removeEventListener('click',toggle);for(const event of ['pause','error','timeupdate','durationchange','loadedmetadata','seeked','resize'])video.removeEventListener(event,changed);video.removeEventListener('ended',ended);});
  configured.add(video);if(viewer)resizeObserver?.observe(video);reflect(video);fitControls(video);
 }
 function update(video){
  if(destroyed||!visible.has(video)||!current(video)){pause(video);return;}
  poster(video);
  if(!configured.has(video))configure(video);
  const src=video.dataset.videoSrc||video.dataset.deferredVideo;
  if(!src)return;
  if(video.getAttribute('src')!==src){loops.get(video)?.pause();video.preload='metadata';video.setAttribute('src',src);video.load?.();}
  if((loops.get(video)?.paused??video.paused)!==false&&!manualPaused.has(video))play(video);
 }
 const resizeObserver=typeof windowObj.ResizeObserver==='function'?new windowObj.ResizeObserver(entries=>{for(const entry of entries)fitControls(entry.target);}):null;
 const observer=typeof windowObj.IntersectionObserver==='function'?new windowObj.IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.25)visible.add(entry.target);else visible.delete(entry.target);update(entry.target);}},{threshold:[0,.25,.5]}):null;
 const posterObserver=typeof windowObj.IntersectionObserver==='function'?new windowObj.IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){poster(entry.target);posterObserver.unobserve(entry.target);}},{rootMargin:'300px',threshold:0}):null;
 function sync(){
  if(destroyed)return;
  for(const video of videos)if(!root.contains(video)){pause(video);loops.get(video)?.destroy();loops.delete(video);observer?.unobserve(video);posterObserver?.unobserve(video);videos.delete(video);visible.delete(video);listeners.get(video)?.();listeners.delete(video);resizeObserver?.unobserve(video);}
  for(const video of root.querySelectorAll('video[data-creator-video]')){
   if(!videos.has(video)){videos.add(video);posterObserver?.observe(video);observer?.observe(video);}
   if(!observer){const r=video.getBoundingClientRect?.(),height=windowObj.innerHeight||documentObj.documentElement?.clientHeight||0,width=windowObj.innerWidth||documentObj.documentElement?.clientWidth||0;if(r&&height&&width&&r.bottom>0&&r.top<height&&r.right>0&&r.left<width)visible.add(video);else visible.delete(video);}
   update(video);
  }
 }
 const onHidden=()=>sync();const onPageHide=()=>{for(const video of videos)pause(video);};
 root.addEventListener('scroll',sync,true);root.addEventListener('toggle',sync,true);root.addEventListener('pointerdown',sync,{passive:true});
 documentObj.addEventListener('visibilitychange',onHidden);windowObj.addEventListener?.('pagehide',onPageHide);windowObj.addEventListener?.('pageshow',sync);
 return {sync,openViewer(){
  // Called synchronously by the opening tap: Safari needs the user gesture
  // for audible playback, rather than a later IntersectionObserver callback.
  const track=root.querySelector('[data-view-track]');if(!track)return;
  const index=track.clientWidth?Math.round(track.scrollLeft/track.clientWidth):0;
  const video=track.children[index]?.querySelector('video[data-video-viewer]');
  if(video){visible.add(video);update(video);}
 },destroy(){destroyed=true;resizeObserver?.disconnect();observer?.disconnect();posterObserver?.disconnect();for(const video of videos)pause(video);for(const loop of loops.values())loop.destroy();loops.clear();for(const dispose of listeners.values())dispose();listeners.clear();videos.clear();visible.clear();root.removeEventListener('scroll',sync,true);root.removeEventListener('toggle',sync,true);root.removeEventListener('pointerdown',sync);documentObj.removeEventListener('visibilitychange',onHidden);windowObj.removeEventListener?.('pagehide',onPageHide);windowObj.removeEventListener?.('pageshow',sync);}};
}
