import {creatorPublicMedia} from '../../shared/creator-media.js';

// Download only a validated marked derivative. Clean/free media is rendered
// locally with the same baked watermark; the original is never a fallback URL.
export async function creatorPreviewFile(page,id,{loadOriginal,watermark,fetchFn=fetch,prepareVideo}={}){
 const media=creatorPublicMedia(page)[id];
 let blob;
 if(media?.mode==='marked'&&media.video){
  try{
   const response=await fetchFn(media.video,{signal:AbortSignal.timeout(120000)});
   if(response.ok){
    const candidate=await response.blob();
    if(candidate.size && ['video/mp4','video/webm'].includes(candidate.type.split(';')[0]))blob=candidate;
   }
  }catch{
   // A failed CDN read (including a dropped response body) can be rebuilt locally.
  }
 }
 if(!blob){
  if(typeof watermark!=='function')throw Error('Videovorschau konnte nicht geladen werden.');
  const original=await loadOriginal(page.id,id);
  const prepare=prepareVideo||(await import('./heart-creator-video.js')).prepareCreatorVideo;
  blob=(await prepare(original,{free:false,watermark})).preview;
 }
 if(!blob?.size)throw Error('Videovorschau ist leer.');
 const extension=blob.type.split(';')[0]==='video/webm'?'webm':'mp4';
 const name=String(page.name||'Video').replace(/[^\p{L}\p{N}_-]+/gu,'_').slice(0,60)||'Video';
 return new File([blob],`${name}_${id}_MNYRA_Preview.${extension}`,{type:blob.type});
}

export async function downloadCreatorVideoPreview(page,id,options){
 const file=await creatorPreviewFile(page,id,options),url=URL.createObjectURL(file);
 const dialog=document.createElement('dialog'),title=document.createElement('h3'),link=document.createElement('a'),close=document.createElement('button');
 dialog.className='cc-video-export-dialog';
 title.textContent='Video mit MNYRA Preview';
 link.href=url;link.download=file.name;link.textContent='Datei herunterladen';
 close.type='button';close.textContent='Schließen';close.onclick=()=>dialog.close();
 dialog.append(title,link);
 // A second explicit tap retains iOS's user gesture after preparation/fetch.
 // The share sheet offers “Video sichern” when supported by the device.
 if(navigator.canShare?.({files:[file]})){
  const share=document.createElement('button'),error=document.createElement('p');
  share.type='button';share.textContent='Speichern / Teilen';error.setAttribute('role','alert');
  share.onclick=async()=>{share.disabled=true;error.textContent='';try{await navigator.share({files:[file]});}catch(e){if(e.name!=='AbortError')error.textContent='Teilen fehlgeschlagen. Bitte „Datei herunterladen“ verwenden.';}finally{share.disabled=false;}};
  dialog.append(share,error);
 }
 dialog.append(close);document.body.append(dialog);
 dialog.addEventListener('close',()=>{dialog.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);},{once:true});
 dialog.showModal();
}
