// One paused candidate, later moved into the viewer: preserve its network and
// decoder state rather than loading the same video into a new element on tap.
export function createCreatorVideoPreload(documentObj){
 let entry;
 function release(){if(!entry)return;const video=entry.video;entry=null;video.pause?.();video.removeAttribute('src');video.load?.();video.remove();}
 function prepare(id,src,{intent=false,poster=''}={}){
  if(!id||!src)return null;
  if(entry&&(entry.id!==id||entry.src!==src||entry.video.error))release();
  if(!entry){
   const video=documentObj.createElement('video');if(typeof video.load!=='function')return null;
   video.playsInline=true;video.setAttribute('playsinline','');video.loop=false;video.preload=intent?'auto':'metadata';
   if(poster)video.setAttribute('poster',poster);
   video.setAttribute('src',src);entry={id,src,video,poster};video.load();
  }else if(intent)entry.video.preload='auto';
  return entry.video;
 }
 return {
  get hasCandidate(){return !!entry;},
  prepare,
  take(id,placeholder,{poster=''}={}){
   const src=placeholder.dataset.videoSrc||placeholder.dataset.deferredVideo;
   const video=prepare(id,src,{intent:true,poster});if(!video)return placeholder;
   const cachedPoster=entry.poster||poster;entry=null;
   for(const attr of placeholder.attributes)if(!['src','poster','preload','data-video-poster'].includes(attr.name))video.setAttribute(attr.name,attr.value);
   if(cachedPoster){video.setAttribute('poster',cachedPoster);video.dataset.videoPoster=cachedPoster;}
   video.preload='auto';placeholder.replaceWith(video);return video;
  },
  keep(id,video){
   if(!id||!video?.getAttribute('src'))return;
   if(entry?.video!==video)release();
   video.pause?.();video.preload='metadata';if(video.currentTime>0)try{video.currentTime=0;}catch{}
   video.remove();entry={id,src:video.getAttribute('src'),video,poster:video.getAttribute('poster')||''};
  },
  destroy:release
 };
}
