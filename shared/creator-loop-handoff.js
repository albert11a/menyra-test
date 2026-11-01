// Silent previews only. Keep native loop as fallback; hand off to a decoded
// frame of the same short cached clip before the visible decoder rewinds.
export function createCreatorLoopHandoff(primary,{windowObj=globalThis}={}){
 if(!primary.parentElement||primary.hasAttribute('data-video-viewer')||typeof primary.requestVideoFrameCallback!=='function'||typeof primary.cancelVideoFrameCallback!=='function')return null;
 const setTimer=windowObj.setTimeout?.bind(windowObj)||setTimeout,clearTimer=windowObj.clearTimeout?.bind(windowObj)||clearTimeout;
 const original={opacity:primary.style.opacity,transition:primary.style.transition,position:primary.style.position,inset:primary.style.inset,zIndex:primary.style.zIndex,isolation:primary.parentElement.style.isolation};
 let active=primary,buffer=null,running=false,destroyed=false,failed=false,epoch=0,watchNode,watchId,attempt=null,fadeTimer,attempted=false;
 const duration=()=>Number.isFinite(active.duration)?active.duration:0;
 const lead=()=>Math.min(.12,duration()*.12),fade=()=>Math.min(50,lead()*500);
 function cancelWatch(){if(watchId!==undefined)watchNode.cancelVideoFrameCallback(watchId);watchId=undefined;}
 function normalize(){for(const node of [primary,buffer])if(node){node.style.transition='none';node.style.opacity=active===node?'1':'.001';node.style.zIndex=active===node?'1':'0';}}
 function clearAttempt(){if(!attempt)return;attempt.to.cancelVideoFrameCallback(attempt.frame);clearTimer(attempt.timeout);attempt=null;}
 function release(){
  if(!buffer)return;
  buffer.pause();buffer.removeAttribute('src');buffer.load();buffer.remove();buffer=null;
 }
 function abortSwap(pending){
  if(attempt!==pending)return;
  clearAttempt();pending.to.pause();try{pending.to.currentTime=0;}catch{}normalize();
  if(running&&!destroyed)watch();
 }
 function commit(pending){
  if(attempt!==pending||!running||destroyed||pending.epoch!==epoch)return;
  // A slow decoder must never introduce a late jump after native loop wrapped.
  if(pending.from.currentTime<duration()-lead()*2||pending.from.duration-pending.from.currentTime<fade()/1000){abortSwap(pending);return;}
  clearAttempt();const outgoing=pending.from;active=pending.to;attempted=false;
  outgoing.loop=false;active.loop=true;
  active.style.transition=`opacity ${fade()}ms linear`;active.style.opacity='1';
  const generation=epoch;
  fadeTimer=setTimer(()=>{
   fadeTimer=undefined;if(destroyed||generation!==epoch)return;
   outgoing.pause();try{outgoing.currentTime=0;}catch{}
   normalize();
  },fade());
  watch();
 }
 function swap(){
  const incoming=active===primary?buffer:primary;
  if(attempt||!incoming||incoming.readyState<2||incoming.seeking)return;
  attempted=true;
  const pending={from:active,to:incoming,epoch,frame:undefined,timeout:undefined};attempt=pending;
  incoming.muted=true;incoming.defaultMuted=true;incoming.loop=true;
  // A tiny nonzero opacity keeps the incoming video in Safari's compositor.
  // It is not revealed until requestVideoFrameCallback confirms real pixels.
  incoming.style.transition='none';incoming.style.zIndex='1';incoming.style.opacity='.001';active.style.zIndex='0';
  pending.frame=incoming.requestVideoFrameCallback(()=>commit(pending));
  pending.timeout=setTimer(()=>abortSwap(pending),250);
  try{Promise.resolve(incoming.play()).catch(()=>abortSwap(pending));}catch{abortSwap(pending);}
 }
 function warm(){
  if(!primary.parentElement||buffer||failed||!running||destroyed||duration()<.5||duration()>6)return;
  // Do not compete with the first play on slow connections. Only prepare the
  // second decoder after the short original clip is completely buffered.
  const ranges=primary.buffered;
  if(!ranges?.length||ranges.start(0)>.05||ranges.end(ranges.length-1)<primary.duration-.05)return;
  const src=primary.getAttribute('src');if(!src)return;
  buffer=primary.cloneNode(false);
  for(const name of ['data-creator-video','data-video-src','data-deferred-video','data-photo','data-size','data-alt','autoplay','controls','id','poster'])buffer.removeAttribute(name);
  buffer.setAttribute('data-creator-loop-buffer','');buffer.setAttribute('aria-hidden','true');buffer.tabIndex=-1;
  buffer.muted=true;buffer.defaultMuted=true;buffer.playsInline=true;buffer.loop=true;buffer.preload='auto';buffer.controls=false;
  buffer.style.cssText+=';position:absolute;inset:0;width:100%;height:100%;opacity:0;pointer-events:none;z-index:1;transition:none';
  primary.style.position='absolute';primary.style.inset='0';primary.style.zIndex='1';
  primary.parentElement.style.isolation='isolate';primary.parentElement.insertBefore(buffer,primary.nextSibling);
  buffer.addEventListener('error',fallback,{once:true});buffer.setAttribute('src',src);buffer.load();
 }
 function watch(){
  cancelWatch();if(!running||destroyed||failed||attempt)return;
  const generation=epoch,node=active;watchNode=node;
  watchId=node.requestVideoFrameCallback((_now,metadata)=>{
   watchId=undefined;if(!running||destroyed||generation!==epoch||node!==active)return;
   warm();const time=Number.isFinite(metadata?.mediaTime)?metadata.mediaTime:node.currentTime;
   if(time<duration()-lead()*2)attempted=false;
   if(buffer&&!attempted&&time>=duration()-lead())swap();
   if(!attempt)watch();
  });
 }
 function fallback(event){
  if(destroyed||!buffer||event?.target!==buffer)return;
  failed=true;epoch++;clearAttempt();cancelWatch();clearTimer(fadeTimer);fadeTimer=undefined;
  const previous=active,time=active.currentTime;active=primary;primary.loop=true;normalize();release();
  if(previous!==primary)try{primary.currentTime=time;}catch{}
  if(running)try{Promise.resolve(primary.play()).catch(()=>{});}catch{}
 }
 function pause(){
  running=false;epoch++;clearAttempt();cancelWatch();clearTimer(fadeTimer);fadeTimer=undefined;
  const previous=active,time=active.currentTime;primary.pause();buffer?.pause();active=primary;
  primary.loop=true;normalize();release();if(previous!==primary)try{primary.currentTime=time;}catch{}
  attempted=false;
 }
 return {
  get paused(){return !running||active.paused;},
  play(){
   if(destroyed)return Promise.resolve();
   if(running&&!active.paused)return Promise.resolve();
   running=true;active.muted=true;active.defaultMuted=true;
   const generation=epoch;
   let playing;try{playing=active.play();}catch(error){pause();return Promise.reject(error);}
   warm();watch();return Promise.resolve(playing).catch(error=>{if(generation===epoch&&!destroyed)pause();throw error;});
  },
  pause,
  destroy(){if(destroyed)return;pause();destroyed=true;primary.style.opacity=original.opacity;primary.style.transition=original.transition;primary.style.position=original.position;primary.style.inset=original.inset;primary.style.zIndex=original.zIndex;if(primary.parentElement)primary.parentElement.style.isolation=original.isolation;}
 };
}
