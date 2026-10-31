// The same inline, muted loop semantics as feed story tiles. Pause previews
// outside the viewport, behind a drawer/viewer and on hidden browser tabs.
export function createCreatorVideoPlayback(root,{windowObj=globalThis,documentObj=root.ownerDocument}={}){
 const videos=new Set(),visible=new Set(),configured=new WeakSet();let destroyed=false;
 const current=video=>{
  if(documentObj.visibilityState==='hidden'||video.closest('[inert],[hidden]'))return false;
  const details=video.closest('details');if(details&&!details.hasAttribute('open'))return false;
  const track=video.closest('[data-track],[data-view-track],[data-hero-track],[data-cc-gallery],[data-cc-track]');
  if(track){const slide=[...track.children].find(node=>node.contains(video));if(slide&&track.clientWidth>0&&[...track.children].indexOf(slide)!==Math.round(track.scrollLeft/track.clientWidth))return false;}
  return true;
 };
 function poster(video){if(video.dataset.videoPoster&&video.getAttribute('poster')!==video.dataset.videoPoster)video.setAttribute('poster',video.dataset.videoPoster);}
 function update(video){
  if(destroyed||!visible.has(video)||!current(video)){video.pause?.();return;}
  poster(video);
  const viewer=video.hasAttribute('data-video-viewer');
  if(!viewer||!configured.has(video)){video.muted=!viewer;video.defaultMuted=!viewer;configured.add(video);}
  video.loop=!viewer;video.playsInline=true;video.controls=viewer;
  const src=video.dataset.videoSrc||video.dataset.deferredVideo;
  if(!src)return;
  if(video.getAttribute('src')!==src){video.preload='metadata';video.setAttribute('src',src);video.load?.();}
  if(video.paused!==false){try{video.play?.()?.catch?.(()=>{});}catch{ /* Leave the poster visible if native autoplay is blocked. */ }}
 }
 const observer=typeof windowObj.IntersectionObserver==='function'?new windowObj.IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.25)visible.add(entry.target);else visible.delete(entry.target);update(entry.target);}},{threshold:[0,.25,.5]}):null;
 const posterObserver=typeof windowObj.IntersectionObserver==='function'?new windowObj.IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){poster(entry.target);posterObserver.unobserve(entry.target);}},{rootMargin:'300px',threshold:0}):null;
 function sync(){
  if(destroyed)return;
  for(const video of videos)if(!root.contains(video)){video.pause?.();observer?.unobserve(video);posterObserver?.unobserve(video);videos.delete(video);visible.delete(video);}
  for(const video of root.querySelectorAll('video[data-creator-video]')){
   if(!videos.has(video)){videos.add(video);posterObserver?.observe(video);observer?.observe(video);}
   if(!observer){const r=video.getBoundingClientRect?.(),height=windowObj.innerHeight||documentObj.documentElement?.clientHeight||0,width=windowObj.innerWidth||documentObj.documentElement?.clientWidth||0;if(r&&height&&width&&r.bottom>0&&r.top<height&&r.right>0&&r.left<width)visible.add(video);else visible.delete(video);}
   update(video);
  }
 }
 const onHidden=()=>sync();const onPageHide=()=>{for(const video of videos)video.pause?.();};
 root.addEventListener('scroll',sync,true);root.addEventListener('toggle',sync,true);root.addEventListener('pointerdown',sync,{passive:true});
 documentObj.addEventListener('visibilitychange',onHidden);windowObj.addEventListener?.('pagehide',onPageHide);windowObj.addEventListener?.('pageshow',sync);
 return {sync,openViewer(){
  // Called synchronously by the opening tap: Safari needs the user gesture
  // for audible playback, rather than a later IntersectionObserver callback.
  const track=root.querySelector('[data-view-track]');if(!track)return;
  const index=track.clientWidth?Math.round(track.scrollLeft/track.clientWidth):0;
  const video=track.children[index]?.querySelector('video[data-video-viewer]');
  if(video){visible.add(video);update(video);}
 },destroy(){destroyed=true;observer?.disconnect();posterObserver?.disconnect();for(const video of videos)video.pause?.();videos.clear();visible.clear();root.removeEventListener('scroll',sync,true);root.removeEventListener('toggle',sync,true);root.removeEventListener('pointerdown',sync);documentObj.removeEventListener('visibilitychange',onHidden);windowObj.removeEventListener?.('pagehide',onPageHide);windowObj.removeEventListener?.('pageshow',sync);}};
}
