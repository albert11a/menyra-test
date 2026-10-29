/* global scrollY, innerHeight, addEventListener */
import { db } from "/shared/firebase-config.js";
import { doc, getDoc, setDoc, serverTimestamp } from "/shared/vendor/firebase/11.0.0/firebase-firestore.js";
import { CC_PAGES, CC_VISITS, ccEscape as esc, ccImage } from "../../shared/content-creator.js";
const root=document.getElementById("content-app");
const id=location.pathname.split("/").filter(Boolean).at(-1);
const preview=new URLSearchParams(location.search).get("preview")==="1";
let visitorId="", visitRef=null, current={opened:true,scrolled:false,answer:""}, saved=false, queue=Promise.resolve();
const memoryKey=`mnyra.content.${id}`;
function readLocal(){try{return JSON.parse(localStorage.getItem(memoryKey)||"null");}catch{return null;}}
function remember(){try{localStorage.setItem(memoryKey,JSON.stringify({visitorId,scrolled:current.scrolled,answer:current.answer}));}catch{}}
function persist(fields={}){
  Object.assign(current,fields);remember();
  if(preview)return Promise.resolve();
  // Serialize writes: an earlier scroll/open must never clear a later answer.
  const snapshot={...current};
  queue=queue.catch(()=>{}).then(async()=>{
    await setDoc(visitRef,{pageId:id,...snapshot,...(!saved?{createdAt:serverTimestamp()}:{}),updatedAt:serverTimestamp()},{merge:true});saved=true;
  });
  return queue;
}
function responseMessage(answer){
  root.querySelector(".answer-content").innerHTML=`<p class="answer-message">${answer==="yes" ? "Faleminderit për interesimin! E morëm përgjigjen tuaj. Mund të vazhdoni bisedën me ne aty ku ju dërguam linkun, që të flasim për përmbajtjen e radhës për lokalin tuaj." : "Faleminderit për përgjigjen tuaj! Fotot shembull mbeten tuajat për t’i përdorur kur të dëshironi."}</p>`;
}
async function start(){
  try{
    if(!/^[a-f0-9]{32}$/.test(id))throw new Error("Kjo faqe nuk u gjet.");
    const snap=await getDoc(doc(db,CC_PAGES,id));
    if(!snap.exists() || !snap.data().published)throw new Error("Kjo faqe nuk është ende e disponueshme.");
    const page=snap.data();document.title=`Për ${page.name} · MNYRA`;
    root.innerHTML=`${preview?'<p class="preview">Vorschau · Dieser Besuch wird nicht gezählt.</p>':""}<div class="brand">MNYRA</div>
      <header class="greeting"><h1><span>Përshëndetje,</span>${esc(page.name)}.</h1><img class="avatar" src="${ccImage(page.avatar)}" alt="${esc(page.name)}"></header>
      <section class="intro"><p class="eyebrow">Pak vëmendje për lokalin tuaj</p><h2>Lokali juaj. Në një dritë të re.</h2><p>Ne jemi MNYRA. Krijojmë përmbajtje për rrjetet tuaja sociale dhe kujdesemi për praninë tuaj digjitale — në Instagram, Facebook, TikTok dhe në faqen tuaj të internetit.</p><p>Kemi përgatitur disa foto shembull posaçërisht për <strong>${esc(page.name)}</strong>, që të shihni si mund të duket përmbajtja e lokalit tuaj.</p><div class="free">Këto foto mund t’i shkarkoni dhe t’i përdorni falas në rrjetet tuaja sociale. Janë një dhuratë nga ne, pa asnjë detyrim.</div></section>
      <section class="gallery" aria-label="Fotot për lokalin tuaj">${page.photoIds.map((key,i)=>`<figure class="photo" data-image="${esc(key)}"><p class="loading">Duke ngarkuar foton ${i+1}…</p></figure>`).join("")}</section>
      <section class="faq"><p class="eyebrow">Mirë të dini</p><h2>Pyetje dhe përgjigje</h2>
        <details><summary>A mund t’i përdorim këto foto menjëherë?</summary><p>Po. Fotot shembull në këtë faqe janë falas për lokalin tuaj. Shkarkojini dhe përdorini në rrjetet tuaja sociale.</p></details>
        <details><summary>Çfarë përmbajtjeje krijoni?</summary><p>Krijojmë foto dhe video për lokalin, produktet ose shërbimet tuaja, të përshtatura për Instagram, Facebook dhe TikTok. Mund të krijojmë edhe faqen tuaj të internetit.</p></details>
        <details><summary>Si funksionon bashkëpunimi?</summary><p>Flasim për nevojat e lokalit tuaj dhe planifikojmë përmbajtjen që ju përshtatet. Para se të fillojmë, i dakordojmë së bashku shërbimet dhe çmimin.</p></details>
        <details><summary>A më obligon diçka përgjigjja “Po”?</summary><p>Jo. Ajo vetëm na tregon se ju intereson të flasim më tej. Nuk është porosi dhe nuk ka pagesë automatike.</p></details>
      </section>
      <section class="answer"><p class="eyebrow">Hapi i radhës</p><h2>A jeni të interesuar që të krijojmë më shumë foto për lokalin tuaj?</h2><div class="answer-content"><p>Një përgjigje e shkurtër na ndihmon. Pa asnjë detyrim.</p><div class="answers"><button data-answer="yes">Po, më intereson</button><button data-answer="no">Jo, faleminderit</button></div><p id="answer-error" role="alert"></p></div></section><footer>MNYRA · PËR BIZNESIN TUAJ</footer>`;
    // Independent image requests keep a single bad image from hiding all the others.
    for(const [i,key] of page.photoIds.entries()) {
      const figure=root.querySelector(`[data-image="${CSS.escape(key)}"]`);
      getDoc(doc(db,CC_PAGES,id,"images",key)).then(photo=>{
        const data=ccImage(photo.data()?.data);if(!data)throw new Error();
        figure.innerHTML=`<img src="${data}" alt="Foto shembull ${i+1} për ${esc(page.name)}" ${i? 'loading="lazy"':''}><a class="download" download="${esc(page.name.replace(/[^a-zA-Z0-9_-]/g,'_'))}-${i+1}.jpg" href="${data}">Shkarko foton ↓</a>`;
      }).catch(()=>{figure.innerHTML='<p class="loading">Fotoja nuk u ngarkua. Rifreskoni faqen për ta provuar përsëri.</p>';});
    }
    const local=readLocal();visitorId=/^[a-f0-9]{32}$/.test(local?.visitorId||"")?local.visitorId:crypto.randomUUID().replaceAll("-","");
    visitRef=doc(db,CC_VISITS,`${id}_${visitorId}`);
    // Exact opaque ID is readable; listing any visitor data is CEO-only.
    if(!preview){const previous=await getDoc(visitRef);if(previous.exists()){current={opened:true,scrolled:previous.data().scrolled===true,answer:previous.data().answer||""};saved=true;}}
    if(current.answer)responseMessage(current.answer);
    persist().catch(()=>{});
    let scrollBusy=false;
    const onScroll=()=>{
      if(current.scrolled||scrollBusy||preview||scrollY<10)return;
      const available=document.documentElement.scrollHeight-innerHeight;
      if(available>0 && scrollY/available>=.5){scrollBusy=true;persist({scrolled:true}).catch(()=>{current.scrolled=false;}).finally(()=>{scrollBusy=false;});}
    };
    addEventListener("scroll",onScroll,{passive:true});
    root.addEventListener("click",async event=>{
      const button=event.target.closest("[data-answer]");if(!button)return;
      if(preview){root.querySelector("#answer-error").textContent="Vorschau: Antworten werden nicht gespeichert.";return;}
      const buttons=root.querySelectorAll("[data-answer]");buttons.forEach(b=>b.disabled=true);
      try{await persist({answer:button.dataset.answer});responseMessage(current.answer);}
      catch{current.answer="";remember();buttons.forEach(b=>b.disabled=false);root.querySelector("#answer-error").textContent="Përgjigjja nuk u ruajt. Ju lutemi, provoni përsëri.";}
    });
  }catch{root.innerHTML='<div class="brand">MNYRA</div><p class="error">Kjo faqe nuk është e disponueshme për momentin. Kontrolloni linkun ose provoni përsëri.</p><button class="retry" id="retry-page">Provo përsëri</button>';root.querySelector("#retry-page").onclick=()=>location.reload();}
}
start();
