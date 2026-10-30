import { ccEscape as esc, ccImage } from '../../shared/content-creator.js';
import {renderCreatorPromo} from '../../shared/content-creator-view.js';
import { mountCreatorShop } from './shop.js';
const root=document.getElementById('content-app');
const id=location.pathname.split('/').filter(Boolean).at(-1);
const params=new URLSearchParams(location.search);
let still=params.get('still')==='1'||params.get('preview')==='1';
try{
  if(params.get('still')==='1')localStorage.setItem('mnyra:content:still','1');
  if(params.get('still')==='0')localStorage.removeItem('mnyra:content:still');
  if(params.get('still')!=='0')still ||= localStorage.getItem('mnyra:content:still')==='1'||localStorage.getItem('mnyra:still')==='1';
}catch{}
let tracking;
function responseMessage(answer){const node=root.querySelector('.answer-content');if(node)node.innerHTML=`<p class="answer-message">${answer==='yes'?'Faleminderit për interesimin! E morëm përgjigjen tuaj. Mund të vazhdoni bisedën me ne aty ku ju dërguam linkun.':'Faleminderit për përgjigjen tuaj! Fotot shembull mbeten tuajat për t’i përdorur kur të dëshironi.'}</p>`;}
function visits(){
  if(still)return Promise.resolve({answer:async value=>responseMessage(value)});
  return tracking ||= import('./visits.js').then(({installCreatorVisits})=>installCreatorVisits({id,onAnswer:responseMessage})).catch(error=>{tracking=undefined;throw error;});
}
async function start(){
  try{
    if(!/^[a-f0-9]{32}$/.test(id))throw Error('Faqja nuk u gjet.');
    let page;
    const initial=document.getElementById('creator-page-data');
    try{if(initial)page=JSON.parse(initial.textContent);}catch{}
    if(!page||page.id!==id||!page.published){
      const response=await fetch(`/api/content-creator?${new URLSearchParams({id,format:'json'})}`,{signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw Error('Faqja nuk u gjet.');page=await response.json();
    }
    document.title=`Për ${page.name} · MNYRA`;
    if(page.kind==='shop')await mountCreatorShop({root,page,still});
    else {
      root.innerHTML=renderCreatorPromo(page);
    }
    root.addEventListener('click',async event=>{
      const button=event.target.closest('[data-answer]');if(!button)return;
      const buttons=root.querySelectorAll('[data-answer]');buttons.forEach(b=>b.disabled=true);
      try{await (await visits()).answer(button.dataset.answer);}catch{buttons.forEach(b=>b.disabled=false);const error=root.querySelector('#answer-error');if(error)error.textContent='Përgjigjja nuk u ruajt. Provoni përsëri.';}
    });

    // Non-visual work never gates first photos or interactions.
    if(!still)globalThis.setTimeout(()=>{void visits().catch(()=>{tracking=undefined;});},4500);
  }catch{
    // Keep any server-rendered photographs visible if hydration fails.
    if(root.querySelector('.shop-product'))return;
    root.innerHTML='<div class="brand">MNYRA</div><p class="error">Faqja nuk është e disponueshme për momentin. Provoni përsëri.</p><button class="retry" id="retry-page">Provo përsëri</button>';
    root.querySelector('#retry-page').onclick=()=>location.reload();
  }
}
void start();
