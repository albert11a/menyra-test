const KEY='mnyra:photo-view-session';
const WINDOW=30*60*1000;

function sessionId(create=true){
 const now=Date.now();
 try{
  const previous=JSON.parse(localStorage.getItem(KEY)||'null');
  const active=previous&&now>=previous.touched&&now-previous.touched<WINDOW&&/^[a-f0-9]{32}$/.test(previous.id);
  if(!active&&!create)return '';
  const id=active?previous.id:crypto.randomUUID().replaceAll('-','');
  localStorage.setItem(KEY,JSON.stringify({id,touched:now}));
  return id;
 }catch{return '';} // Avoid inaccurate repeat counts when storage is unavailable.
}
function internalBrowser(){
 try{return Number(localStorage.getItem('mnyra:heart-internal-until'))>Date.now();}catch{return false;}
}

export function installCreatorPhotoViews({root,pageId,token}){
 if(typeof IntersectionObserver!=='function'||internalBrowser()||navigator.webdriver)return;
 const doc=root.ownerDocument,win=doc.defaultView;
 const selector='img[data-photo]:not([data-video-cover])';
 const timers=new Map(),nodes=new Map(),observers=new Map(),seen=new Map(),pending=new Map();
 let lastRecord=0;
 let retry,flushing=false,failures=0;
 const eligible=node=>{
  if(doc.visibilityState!=='visible'||!doc.hasFocus()||!root.contains(node)||!node.complete||!node.naturalWidth||node.closest('[hidden],[inert],[aria-hidden="true"],details:not([open])'))return false;
  const overlay=root.querySelector('[aria-modal="true"]:not([inert] [aria-modal="true"])');
  if(overlay&&!overlay.contains(node))return false;
  const style=win.getComputedStyle(node);
  return style.visibility==='visible'&&Number(style.opacity)>0;
 };
 function cancel(node){clearTimeout(timers.get(node));timers.delete(node);}
 function qualify(node,entry){
  const bounds=entry.rootBounds,rect=entry.boundingClientRect;
  const area=bounds?Math.min(bounds.width,rect.width)*Math.min(bounds.height,rect.height):0;
  return entry.isIntersecting&&area>0&&entry.intersectionRect.width*entry.intersectionRect.height>=area*.5;
 }
 function refresh(node){
  const entry=nodes.get(node)?.entry;
  if(!entry||!qualify(node,entry)||!eligible(node)){cancel(node);return;}
  if(timers.has(node))return;
  const timer=setTimeout(()=>{
   for(const update of nodes.get(node)?.observer.takeRecords()||[])receive(update);
   if(timers.get(node)!==timer)return;
   timers.delete(node);
   if(!eligible(node)||!nodes.get(node)?.entry||!qualify(node,nodes.get(node).entry)||internalBrowser())return;
   const record=()=>{
    const session=sessionId(),file=node.dataset.photo;
    if(!session)return;
    for(const key of seen.keys())if(key!==session&&!pending.has(key))seen.delete(key);
    if(!seen.has(session))seen.set(session,new Set());
    if(seen.get(session).has(file))return;
    seen.get(session).add(file);
    if(!pending.has(session))pending.set(session,new Set());
    pending.get(session).add(file);
    lastRecord=Date.now();
    schedule();
   };
   if(navigator.locks)void navigator.locks.request(KEY,record).catch(()=>{});else record();
  },1000);
  timers.set(node,timer);
 }
 function receive(entry){
  const node=nodes.get(entry.target);
  if(!node)return;
  node.entry=entry;refresh(entry.target);
 }
 function observe(node){
  const rect=node.getBoundingClientRect(),width=doc.documentElement.clientWidth,height=doc.documentElement.clientHeight;
  const fraction=rect.width&&rect.height ? .5*Math.min(width,rect.width)*Math.min(height,rect.height)/(rect.width*rect.height) : .5;
  const threshold=Math.min(.5,Math.max(0,fraction));
  const current=nodes.get(node);
  if(current?.threshold===threshold)return;
  if(current){cancel(node);current.observer.unobserve(node);}
  if(!observers.has(threshold))observers.set(threshold,new IntersectionObserver(entries=>entries.forEach(receive),{threshold:[0,threshold]}));
  const observer=observers.get(threshold);
  nodes.set(node,{threshold,observer,entry:null});
  observer.observe(node);
 }
 function reconcile(){
  for(const [node,state] of nodes)if(!root.contains(node)){cancel(node);state.observer.unobserve(node);resize?.unobserve(node);nodes.delete(node);}
  for(const node of root.querySelectorAll(selector)){
   if(!nodes.has(node)){observe(node);resize?.observe(node);}
   else refresh(node);
  }
 }
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(entries=>entries.forEach(({target})=>{if(nodes.has(target))observe(target);})):null;
 win.addEventListener('resize',()=>{
  for(const state of observers.values())state.disconnect();
  observers.clear();
  for(const node of [...nodes.keys()]){cancel(node);nodes.delete(node);observe(node);}
 });
 let reconcileFrame;
 const changes=new MutationObserver(()=>{
  if(reconcileFrame)return;
  reconcileFrame=win.requestAnimationFrame(()=>{reconcileFrame=undefined;reconcile();});
 });
 changes.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','aria-hidden','inert','open','src','data-photo','style']});
 root.addEventListener('load',event=>{if(nodes.has(event.target))win.requestAnimationFrame(()=>refresh(event.target));},true);
 doc.addEventListener('visibilitychange',()=>{
  for(const [node,state] of nodes){cancel(node);state.entry=null;state.observer.unobserve(node);state.observer.observe(node);}
  if(doc.visibilityState==='hidden')void flush(true);
 });
 win.addEventListener('blur',()=>{for(const node of nodes.keys())cancel(node);});
 win.addEventListener('focus',()=>{for(const node of nodes.keys())refresh(node);});
 let lastActivity=0;
 function touch(){
  if(internalBrowser()||doc.visibilityState!=='visible'||Date.now()-lastActivity<10000)return;
  lastActivity=Date.now();
  if(navigator.locks)void navigator.locks.request(KEY,()=>sessionId(false)).catch(()=>{});else sessionId(false);
 }
 for(const event of ['pointerdown','keydown','scroll'])doc.addEventListener(event,touch,{passive:true,capture:true});
 win.addEventListener('pagehide',()=>{for(const node of nodes.keys())cancel(node);void flush(true);});
 function schedule(){
  if(!retry&&!flushing)retry=setTimeout(()=>{retry=undefined;void flush();},failures?Math.min(60000,3000*2**failures):3000);
 }
 async function flush(keepalive=false){
  if((flushing&&!keepalive)||!pending.size)return;
  if(Date.now()-lastRecord>WINDOW){pending.clear();return;}
  if(!keepalive)flushing=true;
  try{
   for(const [session,batch] of pending){
    const files=[...batch].slice(0,32);
    const response=await fetch('/api/content-creator-shop',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({op:'photo-views',pageId,session,files,token}),keepalive,signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw Error('Fotoansichten konnten nicht gespeichert werden.');
    for(const file of files)batch.delete(file);
    if(!batch.size)pending.delete(session);
   }
   failures=0;
  }catch{failures++;}
  finally{if(!keepalive)flushing=false;if(pending.size)schedule();}
 }
 reconcile();
}
