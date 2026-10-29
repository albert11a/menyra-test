import { db } from './firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from '/shared/vendor/firebase/11.0.0/firebase-firestore.js';
import { CC_VISITS } from '../../shared/content-creator.js';

// Loaded after the first screen, never on a silent preview. No SDK on the
// critical page/image path and no access to Heart's authentication session.
export async function installCreatorVisits({id,onAnswer}) {
  const key=`mnyra.content.${id}`;
  let local={};try{local=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
  const visitorId=/^[a-f0-9]{32}$/.test(local.visitorId||'')?local.visitorId:crypto.randomUUID().replaceAll('-','');
  const ref=doc(db,CC_VISITS,`${id}_${visitorId}`);
  let current={opened:true,scrolled:false,answer:''},saved=false,queue=Promise.resolve();
  try{const previous=await getDoc(ref);if(previous.exists()){current={opened:true,scrolled:previous.data().scrolled===true,answer:previous.data().answer||''};saved=true;}}catch{}
  if(current.answer)onAnswer?.(current.answer);
  function persist(fields={}) {
    const next={...current,...fields};
    if(current.answer && fields.answer && current.answer!==fields.answer)return Promise.resolve();
    const before=current;current=next;
    try{localStorage.setItem(key,JSON.stringify({visitorId,scrolled:next.scrolled,answer:next.answer}));}catch{}
    queue=queue.catch(()=>{}).then(()=>setDoc(ref,{pageId:id,...next,...(!saved?{createdAt:serverTimestamp()}:{}),updatedAt:serverTimestamp()},{merge:true})).then(()=>{saved=true;}).catch(error=>{current=before;throw error;});
    return queue;
  }
  void persist().catch(()=>{});
  let busy=false;
  globalThis.addEventListener('scroll',()=>{
    if(current.scrolled||busy||globalThis.scrollY<10)return;
    const available=document.documentElement.scrollHeight-globalThis.innerHeight;
    if(available>0&&globalThis.scrollY/available>=.5){busy=true;void persist({scrolled:true}).catch(()=>{}).finally(()=>{busy=false;});}
  },{passive:true});
  return {answer:async value=>{if(!['yes','no'].includes(value))return;await persist({answer:value});onAnswer?.(value);}};
}
