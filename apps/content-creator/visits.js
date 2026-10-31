export function creatorVisitorId(pageId){
 let id;try{id=JSON.parse(localStorage.getItem(`mnyra.content.${pageId}`)||'{}')?.visitorId||localStorage.getItem('mnyra:cc:visitor');}catch{}
 if(!/^[a-f0-9]{32}$/.test(id||'')){id=crypto.randomUUID().replaceAll('-','');try{localStorage.setItem('mnyra:cc:visitor',id);}catch{}}
 return id;
}
// Own endpoint; no public Firebase SDK, login or Heart persistence involved.
export async function installCreatorVisits({id,onAnswer}){
 const visitorId=creatorVisitorId(id);let stage='page',cartId='',queue=Promise.resolve(),scrolled=false;
 function send(event='',extra={},keepalive=false){
  const payload={op:'visit',pageId:id,visitorId,stage,cartId,event,...extra};
  const task=()=>fetch('/api/content-creator-shop',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),keepalive,signal:AbortSignal.timeout(10000)}).then(async response=>{if(!response.ok)throw Error('Besuch nicht gespeichert.');const result=await response.json();if(result.answer)onAnswer?.(result.answer);return result;});
  queue=queue.catch(()=>{}).then(task);return queue;
 }
 function track(event,extra={}){if(extra.stage)stage=extra.stage;if(extra.cartId)cartId=extra.cartId;return send(event,extra);}
 void track('open').catch(()=>{});
 globalThis.addEventListener('scroll',()=>{
  if(scrolled||globalThis.scrollY<10)return;
  const available=document.documentElement.scrollHeight-globalThis.innerHeight;
  if(available>0&&globalThis.scrollY/available>=.5){scrolled=true;void track('scroll').catch(()=>{scrolled=false;});}
 },{passive:true});
 const timer=globalThis.setInterval(()=>{if(document.visibilityState!=='hidden')void send().catch(()=>{});},30000);
 document.addEventListener('visibilitychange',()=>{void send('',{online:document.visibilityState!=='hidden'},true).catch(()=>{});});
 globalThis.addEventListener('pagehide',event=>{void send('',{online:false},true).catch(()=>{});if(!event.persisted)clearInterval(timer);});
 return {track,answer:async value=>{if(!['yes','no'].includes(value))return;await track(value);onAnswer?.(value);}};
}
