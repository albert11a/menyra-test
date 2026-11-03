import {ccEscape as esc} from '../../shared/content-creator.js';
import {creatorIcon} from '../../shared/content-creator-view.js';
import {creatorVisitorId} from './visits.js';

export async function mountCreatorPhotoGallery({root,pageId,token,track}){
 const visitorId=creatorVisitorId(pageId);
 async function request(op,file){
  const response=await fetch('/api/content-creator-shop',{
   method:'POST',headers:{'content-type':'application/json'},
   body:JSON.stringify({op,pageId,token,visitorId,file}),
   signal:AbortSignal.timeout(op==='photo-download'?90000:15000)
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
  <div class="creator-photo-grid">${photos.map(({file,src},i)=>`<article>
   <img src="${esc(src)}" data-photo="${esc(file)}" loading="${i<2?'eager':'lazy'}" alt="Foto ${i+1}">
   <button type="button" data-download-photo="${esc(file)}">${creatorIcon('save')} Shkarko</button>
  </article>`).join('')||'<p>Nuk ka foto për shkarkim.</p>'}</div>
  <p class="creator-photo-message" role="status"></p>
 </section></div>`;
 track();
 root.addEventListener('click',async event=>{
  const button=event.target.closest('[data-download-photo]');
  if(!button||button.disabled)return;
  const status=root.querySelector('.creator-photo-message');
  button.disabled=true;button.textContent='Duke shkarkuar…';status.textContent='';
  try{
   const response=await request('photo-download',button.dataset.downloadPhoto);
   const blob=await response.blob(),length=Number(response.headers.get('Content-Length'));
   if(!blob.size||(length&&length!==blob.size))throw Error('Fotoja nuk u shkarkua e plotë.');
   const url=URL.createObjectURL(blob),link=document.createElement('a');
   link.href=url;link.download=decodeURIComponent(response.headers.get('X-File-Name')||'foto.jpg');
   root.append(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(error){status.textContent=error.message;button.after(status);}
  finally{button.disabled=false;button.innerHTML=`${creatorIcon('save')} Shkarko`;}
 });
}
