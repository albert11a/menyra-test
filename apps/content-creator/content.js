import { ccEscape as esc, ccImage } from '../../shared/content-creator.js';
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
      root.innerHTML=`<a class="brand shop-logo" href="/">MNYRA</a><header class="greeting"><h1><span>Përshëndetje,</span>${esc(page.name)}.</h1>${ccImage(page.avatar)?`<img class="avatar" src="${ccImage(page.avatar)}" alt="${esc(page.name)}">`:''}</header>
        <section class="intro"><p class="eyebrow">Krijuar për ju</p><p>Ne jemi MNYRA. Krijojmë foto dhe video për Instagram, Facebook dhe TikTok, posaçërisht për <strong>${esc(page.name)}</strong>.</p><div class="free">Këto foto janë një dhuratë nga ne. Mbajeni të shtypur foton për ta ruajtur në telefon.</div></section>
        <section class="gallery" aria-label="Fotot për lokalin tuaj">${page.photoIds.map((key,i)=>`<figure class="photo"><img src="/api/content-creator?${new URLSearchParams({id,asset:'1',photo:key,v:page.updatedAt||''})}" width="360" height="450" alt="Foto ${i+1} për ${esc(page.name)}" loading="${i<2?'eager':'lazy'}" decoding="async"></figure>`).join('')}</section>
        <section class="faq"><h2>Pyetje dhe përgjigje</h2><details><summary>A mund t’i përdorim menjëherë?</summary><p>Po. Ruajini në telefon dhe përdorini në rrjetet tuaja sociale, pa asnjë detyrim.</p></details><details><summary>Si funksionon bashkëpunimi?</summary><p>Flasim për nevojat tuaja dhe i dakordojmë së bashku shërbimet dhe çmimin para se të fillojmë.</p></details></section>
        <section class="answer"><h2>A jeni të interesuar për më shumë foto për lokalin tuaj?</h2><div class="answer-content"><p>Një përgjigje e shkurtër. Pa asnjë detyrim.</p><div class="answers"><button data-answer="yes">Po, më intereson</button><button data-answer="no">Jo, faleminderit</button></div><p id="answer-error" role="alert"></p></div></section><footer>MNYRA · PËR BIZNESIN TUAJ</footer>`;
      root.addEventListener('click',async event=>{
        const button=event.target.closest('[data-answer]');if(!button)return;
        const buttons=root.querySelectorAll('[data-answer]');buttons.forEach(b=>b.disabled=true);
        try{await (await visits()).answer(button.dataset.answer);}catch{buttons.forEach(b=>b.disabled=false);root.querySelector('#answer-error').textContent='Përgjigjja nuk u ruajt. Provoni përsëri.';}
      });
    }
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
