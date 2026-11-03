import {creatorVisitorId} from './visitor-id.js';
// Cumulative session snapshots survive retries without counting the same time twice.
export function createCreatorEngagement({root,documentObj=document,windowObj=globalThis,now=()=>Date.now()}){
 const started=now(),sessionId=crypto.randomUUID().replaceAll('-','');
 const state={sessionId,startedAt:new Date(started).toISOString(),activeMs:0,elapsedMs:0,stageMs:{page:0,cart:0,checkout:0,ordered:0},scrollDepth:0,media:[],events:[]};
 const exposures=new Map(),totals=new Map(),sought=new WeakSet();
 root?.addEventListener('seeking',event=>sought.add(event.target),true);let last=started,stage='page',sequence=0,suspended=false;
 function visible(node){
  if(!root?.contains(node)||node.closest('[inert],[hidden],[aria-hidden="true"]'))return false;
  const details=node.closest('details');if(details&&!details.hasAttribute('open'))return false;
  if(node.tagName==='IMG'&&(!node.complete||!node.naturalWidth))return false;
  const r=node.getBoundingClientRect?.(),w=windowObj.innerWidth||documentObj.documentElement.clientWidth,h=windowObj.innerHeight||documentObj.documentElement.clientHeight;
  if(!r||!w||!h||!r.width||!r.height)return false;
  const area=Math.max(0,Math.min(r.right,w)-Math.max(r.left,0))*Math.max(0,Math.min(r.bottom,h)-Math.max(r.top,0));
  return area>=Math.min(r.width,w)*Math.min(r.height,h)*.5;
 }
 function sample(){
  const time=now(),delta=Math.min(1500,Math.max(0,time-last));last=time;state.elapsedMs=Math.max(0,time-started);
  const foreground=!suspended&&documentObj.visibilityState!=='hidden';
  if(foreground){state.activeMs+=delta;state.stageMs[stage]+=delta;}
  const y=windowObj.scrollY||0,available=documentObj.documentElement.scrollHeight-(windowObj.innerHeight||0);
  if(foreground&&available>0)state.scrollDepth=Math.max(state.scrollDepth,Math.min(100,Math.round(y/available*100)));
  const current=new Set();
  if(foreground)for(const node of root?.querySelectorAll('img[data-photo],video[data-photo]')||[]){
   if(!visible(node))continue;
   const isVideo=node.tagName==='VIDEO';
   if(isVideo&&(node.paused!==false||node.ended||node.seeking||node.readyState<3))continue;
   const file=node.dataset.photo,track=node.closest('[data-track]'),viewer=node.closest('.shop-viewer');
   const productId=track?.dataset.track||viewer?.querySelector('[data-product]')?.dataset.product||node.closest('[data-product]')?.dataset.product||'';
   const surface=viewer?'viewer':node.closest('[data-hero-track]')?'hero':node.closest('.shop-cart-line')?'cart':'catalog';
   const event=isVideo?'video':node.hasAttribute('data-video-cover')?'cover':'photo';
   const key=JSON.stringify([file,productId,surface,event]);if(current.has(key))continue;current.add(key);
   let exposure=exposures.get(key);
   if(!exposure){exposure={ms:0,previousTime:Number(node.currentTime)||0};exposures.set(key,exposure);}
   let measuredDelta=delta;
   if(isVideo){
    const position=Number(node.currentTime)||0,previous=exposure.previousTime;
    const wrapped=!sought.has(node)&&Number.isFinite(node.duration)&&previous>node.duration-1.5&&position<1.5&&position<previous;
    if(wrapped&&exposure.total)exposure.total.completions++;
    measuredDelta=sought.has(node)||(!wrapped&&position<=previous)?0:delta;
    sought.delete(node);exposure.previousTime=position;
   }
   exposure.ms+=measuredDelta;
   if(!exposure.entry&&exposure.ms>=1000){
    let total=totals.get(key);if(!total){total={file,productId,surface,event,views:0,durationMs:0,completions:0};totals.set(key,total);}
    total.views++;total.durationMs+=exposure.ms;
    exposure.total=total;exposure.entry={id:crypto.randomUUID().replaceAll('-',''),event,file,productId,surface,at:new Date(time-exposure.ms).toISOString(),durationMs:exposure.ms};
    state.events.push(exposure.entry);state.events=state.events.slice(-150);
   }else if(exposure.entry){exposure.total.durationMs+=measuredDelta;exposure.entry.durationMs+=measuredDelta;}

  }
  for(const key of exposures.keys())if(!current.has(key))exposures.delete(key);
  state.media=[...totals.values()].slice(-300);
 }
 // A non-looping player's ended event has no subsequent playing sample.
 root?.addEventListener('ended',event=>{const node=event.target;if(node.tagName!=='VIDEO')return;for(const exposure of exposures.values())if(exposure.entry?.file===node.dataset.photo&&exposure.entry.event==='video')exposure.total.completions++;},true);
 return {sample,setStage(value){sample();if(Object.hasOwn(state.stageMs,value))stage=value;},suspend(){sample();suspended=true;exposures.clear();},resume(){last=now();suspended=false;},snapshot(){sample();return {...state,events:[...state.events],media:[...state.media],stageMs:{...state.stageMs},sequence:++sequence};}};
}
// Own endpoint; no public Firebase SDK, login or Heart persistence involved.
export async function installCreatorVisits({id,onAnswer}){
 const visitorId=creatorVisitorId(id);let stage='page',cartId='',queue=Promise.resolve(),scrolled=false,actions=[];
 let engagement=createCreatorEngagement({root:document.getElementById('content-app')});
 function send(event='',extra={},keepalive=false){
  if(event){actions.push({id:crypto.randomUUID().replaceAll('-',''),event,at:new Date().toISOString(),...extra});actions=actions.slice(-100);}
  const payload={op:'visit',pageId:id,visitorId,stage,cartId,event,...extra,session:engagement.snapshot(),actions:[...actions]};
  // Keep unload requests under the browser's shared 64 KiB keepalive budget.
  let body=JSON.stringify(payload);
  if(keepalive)while(new TextEncoder().encode(body).length>48000){
   if(payload.actions.length>1)payload.actions.shift();
   else if(payload.session.events.length>1)payload.session.events=payload.session.events.slice(1);
   else if(payload.session.media.length>1)payload.session.media=payload.session.media.slice(1);
   else break;
   body=JSON.stringify(payload);
  }
  const sentIds=new Set(payload.actions.map(action=>action.id));
  const task=()=>fetch('/api/content-creator-shop',{method:'POST',headers:{'content-type':'application/json'},body,keepalive,signal:AbortSignal.timeout(10000)}).then(async response=>{if(!response.ok)throw Error('Besuch nicht gespeichert.');const result=await response.json();actions=actions.filter(action=>!sentIds.has(action.id));if(result.answer)onAnswer?.(result.answer);return result;});
  // Lifecycle flushes must start immediately, even behind a slow request.
  if(keepalive)return task();
  queue=queue.catch(()=>{}).then(task);return queue;
 }
 function track(event,extra={}){if(extra.stage){engagement.setStage(extra.stage);stage=extra.stage;}if(extra.cartId)cartId=extra.cartId;return send(event,extra);}
 void track('open').catch(()=>{});
 globalThis.addEventListener('scroll',()=>{
  if(scrolled||globalThis.scrollY<10)return;
  const available=document.documentElement.scrollHeight-globalThis.innerHeight;
  if(available>0&&globalThis.scrollY/available>=.5){scrolled=true;void track('scroll').catch(()=>{scrolled=false;});}
 },{passive:true});
 const sampleTimer=globalThis.setInterval(()=>engagement.sample(),500);
 const timer=globalThis.setInterval(()=>{if(document.visibilityState!=='hidden')void send().catch(()=>{});},10000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')engagement.suspend();else engagement.resume();void send('',{online:document.visibilityState!=='hidden'},true).catch(()=>{});});
 globalThis.addEventListener('pagehide',event=>{engagement.suspend();void send('',{online:false},true).catch(()=>{});if(!event.persisted){clearInterval(timer);clearInterval(sampleTimer);}});
 globalThis.addEventListener('pageshow',event=>{if(event.persisted){engagement=createCreatorEngagement({root:document.getElementById('content-app')});void track('open').catch(()=>{});}else{engagement.resume();void send().catch(()=>{});}});
 return {track,answer:async value=>{if(!['yes','no'].includes(value))return;await track(value);onAnswer?.(value);}};
}
