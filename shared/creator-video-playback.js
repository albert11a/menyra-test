// The same inline, muted loop semantics as feed story tiles. Pause previews
// outside the viewport, behind a drawer/viewer and on hidden browser tabs.
export function createCreatorVideoPlayback(root,{windowObj=globalThis,documentObj=root.ownerDocument}={}){
 const videos=new Set(),visible=new Set();let destroyed=false;
 const current=video=>{
  if(documentObj.visibilityState==='hidden'||video.closest('[inert],[hidden]'))return false;
  const details=video.closest('details');if(details&&!details.hasAttribute('open'))return false;
  const track=video.closest('[data-track],[data-view-track],[data-hero-track],[data-cc-gallery],[data-cc-track]');
  if(track){const slide=[...track.children].find(node=>node.contains(video));if(slide&&track.clientWidth>0&&[...track.children].indexOf(slide)!==Math.round(track.scrollLeft/track.clientWidth))return false;}
  return true;
 };
 function update(video){
  if(destroyed||!visible.has(video)||!current(video)){video.pause?.();return;}
  video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.controls=false;
  const src=video.dataset.videoSrc||video.dataset.deferredVideo;
  if(!src)return;
  if(video.getAttribute('src')!==src){video.preload='metadata';video.setAttribute('src',src);video.load?.();}
  if(video.paused!==false){try{video.play?.()?.catch?.(()=>{});}catch{ /* Leave the poster visible if native autoplay is blocked. */ }}
 }
 const observer=typeof windowObj.IntersectionObserver==='function'?new windowObj.IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.25)visible.add(entry.target);else visible.delete(entry.target);update(entry.target);}},{threshold:[0,.25,.5]}):null;
 function sync(){
  if(destroyed)return;
  for(const video of videos)if(!root.contains(video)){video.pause?.();observer?.unobserve(video);videos.delete(video);visible.delete(video);}
  for(const video of root.querySelectorAll('video[data-creator-video]')){
   if(!videos.has(video)){videos.add(video);observer?.observe(video);}
   if(!observer){const r=video.getBoundingClientRect?.(),height=windowObj.innerHeight||documentObj.documentElement?.clientHeight||0,width=windowObj.innerWidth||documentObj.documentElement?.clientWidth||0;if(r&&height&&width&&r.bottom>0&&r.top<height&&r.right>0&&r.left<width)visible.add(video);else visible.delete(video);}
   update(video);
  }
 }
 const onHidden=()=>sync();const onPageHide=()=>{for(const video of videos)video.pause?.();};
 root.addEventListener('scroll',sync,true);root.addEventListener('toggle',sync,true);root.addEventListener('pointerdown',sync,{passive:true});
 documentObj.addEventListener('visibilitychange',onHidden);windowObj.addEventListener?.('pagehide',onPageHide);windowObj.addEventListener?.('pageshow',sync);
 return {sync,destroy(){destroyed=true;observer?.disconnect();for(const video of videos)video.pause?.();videos.clear();visible.clear();root.removeEventListener('scroll',sync,true);root.removeEventListener('toggle',sync,true);root.removeEventListener('pointerdown',sync);documentObj.removeEventListener('visibilitychange',onHidden);windowObj.removeEventListener?.('pagehide',onPageHide);windowObj.removeEventListener?.('pageshow',sync);}};
}
