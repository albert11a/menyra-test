import {ccEscape as esc} from '../../shared/content-creator.js';
import {creatorIcon} from '../../shared/content-creator-view.js';
import {creatorVisitorId} from './visits.js';

export async function mountCreatorPhotoGallery({root,pageId,token,track}){
 const visitorId=creatorVisitorId(pageId);
 const saveLabel=navigator.share&&navigator.canShare?'Ruaj foton':'Shkarko';
 async function request(op,file){
  const response=await fetch('/api/content-creator-shop',{
   method:'POST',headers:{'content-type':'application/json'},
   body:JSON.stringify({op,pageId,token,visitorId,file}),
   signal:AbortSignal.timeout(op==='photo-download'?45000:15000)
  });
  if(!response.ok){
   const error=await response.json().catch(()=>null);
   throw Error(error?.error||'Ju lutemi, provoni përsëri.');
  }
  return response;
 }
 const {name,photos}=await (await request('photo-gallery')).json();
 document.title=`Fotot për ${name} · MNYRA`;
 root.innerHTML=`<div class="shop-shell"><section class="creator-photo-delivery">
  <p class="brand">MNYRA</p><h1>Fotot për ${esc(name)}</h1><p>Shkarkoji fotot në cilësi origjinale.</p>
  <div class="creator-photo-grid">${photos.map(({file,cdn,clean},i)=>`<article>
   <img ${cdn?`src="${esc(cdn)}" loading="${i<2?'eager':'lazy'}"`: ''} data-clean="${clean?'1':'0'}" data-cdn="${esc(cdn||'')}" data-photo="${esc(file)}" alt="Foto ${i+1}">
   <button type="button" data-download-photo="${esc(file)}">${creatorIcon('save')} ${saveLabel}</button>
  </article>`).join('')||'<p>Nuk ka foto për shkarkim.</p>'}</div>
  <p class="creator-photo-message" role="status"></p>
 </section></div>`;
 const previews=new IntersectionObserver(entries=>{
  for(const {target,isIntersecting} of entries){
   if(!isIntersecting)continue;
   previews.unobserve(target);
   void request('photo-preview',target.dataset.photo).then(response=>response.blob()).then(blob=>{
    const url=URL.createObjectURL(blob);
    target.addEventListener('load',()=>URL.revokeObjectURL(url),{once:true});
    target.src=url;
   }).catch(()=>{
    if(target.dataset.cdn)target.src=target.dataset.cdn;
    else target.alt='Fotoja nuk u ngarkua.';
   });
  }
 },{rootMargin:'200px'});
 root.querySelectorAll('img[data-photo]').forEach(image=>{
  if(image.dataset.clean!=='1')previews.observe(image);
  else image.addEventListener('error',()=>{image.dataset.cdn='';previews.observe(image);},{once:true});
 });
 const originals=new Map(photos.map(photo=>[photo.file,photo]));
 const ready=new WeakMap();
 track();
 root.addEventListener('click',async event=>{
  const button=event.target.closest('[data-download-photo]');
  if(!button||button.disabled)return;
  const status=root.querySelector('.creator-photo-message');
  if(ready.has(button)){
   try{await navigator.share({files:[ready.get(button)]});}
   catch(error){if(error.name!=='AbortError'){status.textContent=error.message;button.after(status);}}
   return;
  }
  button.disabled=true;button.textContent='Duke shkarkuar…';status.textContent='';
  try{
   const id=button.dataset.downloadPhoto,original=originals.get(id);
   const direct=original?.download;
   const response=direct?await fetch(direct,{signal:AbortSignal.timeout(45000)}):await request('photo-download',id);
   if(!response.ok)throw Error('Fotoja nuk u shkarkua. Provo përsëri.');
   const length=direct?original.size:Number(response.headers.get('Content-Length'));
   const reader=response.body?.getReader();
   const chunks=[];
   let received=0;
   if(reader){
    while(true){
     const {done,value}=await reader.read();
     if(done)break;
     chunks.push(value);received+=value.byteLength;
     if(length)button.textContent=`Duke shkarkuar… ${Math.min(99,Math.floor(received/length*100))}%`;
    }
   }
   const blob=reader?new Blob(chunks,{type:response.headers.get('Content-Type')||''}):await response.blob();
   if(!blob.size||(length&&length!==blob.size))throw Error('Fotoja nuk u shkarkua e plotë.');
   const file=new File([blob],(direct?original.name:decodeURIComponent(response.headers.get('X-File-Name')||'foto.jpg')),{type:blob.type});
   if(direct)void request('photo-record',id).catch(()=>{});
   if(navigator.share&&navigator.canShare?.({files:[file]})){
    ready.set(button,file);
    button.title='Hap menynë e iPhone për ta ruajtur foton.';
    if(navigator.userActivation?.isActive){
     try{await navigator.share({files:[file]});}
     catch(error){if(!['AbortError','NotAllowedError'].includes(error.name))throw error;}
    }
    return;
   }
   const url=URL.createObjectURL(file),link=document.createElement('a');
   link.href=url;link.download=file.name;
   root.append(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(error){status.textContent=error.message;button.after(status);}
  finally{button.disabled=false;button.innerHTML=`${creatorIcon('save')} ${ready.has(button)?'Ruaj foton':saveLabel}`;}
 });
}
