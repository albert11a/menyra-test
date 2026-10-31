// Processing must retain audio. Muting the input to bypass Safari's gesture
// policy would risk recording silent previews. Retry play() on the SAME element
// directly inside a tap, before starting MediaRecorder or its timeout.
export async function startCreatorVideo(video,audio,{documentObj=globalThis.document}={}){
 const play=()=>{
  const resumed=audio.resume(),started=video.play();
  let timer;
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Video oder Tonverarbeitung reagiert nicht. Bitte erneut hochladen.')),20000);});
  return Promise.race([Promise.all([resumed,started]),timeout]).then(()=>{
   if(audio.state&&audio.state!=='running')throw new DOMException('Tonverarbeitung benötigt einen direkten Tipp.','NotAllowedError');
  }).finally(()=>clearTimeout(timer));
 };
 try{await play();return;}catch(error){if(error.name!=='NotAllowedError')throw error;}
 await new Promise((resolve,reject)=>{
  const overlay=documentObj.createElement('div');
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Videoverarbeitung starten');
  overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(0,0,0,.8);padding:24px';
  const box=documentObj.createElement('div');box.style.cssText='max-width:360px;padding:24px;border-radius:20px;background:#18181c;color:white;font:16px system-ui';
  const message=documentObj.createElement('p');message.textContent='Safari benötigt einen direkten Tipp, um dieses Video mit Ton zu verarbeiten. Die Seite danach bitte geöffnet lassen.';
  const start=documentObj.createElement('button');start.type='button';start.textContent='Videoverarbeitung starten';
  const cancel=documentObj.createElement('button');cancel.type='button';cancel.textContent='Abbrechen';
  for(const button of [start,cancel])button.style.cssText='display:block;width:100%;margin-top:12px;padding:14px;border:0;border-radius:12px;background:#d1f45b;color:#111;font:inherit;outline:none';
  cancel.style.background='#ddd';
  box.append(message,start,cancel);overlay.append(box);documentObj.body.append(overlay);
  const previous=documentObj.activeElement;
  let settled=false;
  const finish=error=>{if(settled)return;settled=true;clearTimeout(timeout);documentObj.removeEventListener('keydown',key,true);documentObj.removeEventListener('visibilitychange',hidden);overlay.remove();previous?.isConnected&&previous.focus?.({preventScroll:true});error?reject(error):resolve();};
  const key=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();finish(Error('Videoverarbeitung abgebrochen.'));}else if(event.key==='Tab'){event.preventDefault();(documentObj.activeElement===start?cancel:start).focus();}};
  const hidden=()=>{if(documentObj.visibilityState==='hidden')finish(Error('Videoverarbeitung unterbrochen. Bitte die Seite geöffnet lassen.'));};
  const timeout=setTimeout(()=>finish(Error('Videoverarbeitung abgebrochen. Bitte erneut hochladen.')),120000);
  documentObj.addEventListener('keydown',key,true);documentObj.addEventListener('visibilitychange',hidden);
  cancel.onclick=()=>finish(Error('Videoverarbeitung abgebrochen.'));
  start.onclick=()=>{
   start.disabled=true;
   // No await/import/network before play(): this is the Safari user gesture.
   let attempt;try{attempt=play();}catch(error){finish(error);return;}
   Promise.resolve(attempt).then(()=>finish(),error=>finish(error));
  };
  start.focus({preventScroll:true});
 });
}
