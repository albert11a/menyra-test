import {creatorVideoFile,CREATOR_VIDEO_PREVIEW_LIMIT} from '../../shared/creator-video.js';

// Only a downscaled silent canvas derivative is recorded. The input File is
// never modified; the paid original (including its audio) stays private.
export async function prepareCreatorVideo(file,{free=false,watermark=()=>{}}={}){
 if(!creatorVideoFile(file)||file.size<1||file.size>30*1024*1024)throw Error('MP4, MOV oder WebM bis 30 MB wählen.');
 const canvas=document.createElement('canvas');
 const Recorder=globalThis.MediaRecorder;
 const mime=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp8','video/webm'].find(type=>Recorder?.isTypeSupported?.(type));
 if(!Recorder||!canvas.captureStream||!mime)throw Error('Dieser Browser kann keine geschützte Videovorschau erstellen. Bitte einen aktuellen Safari oder Chrome verwenden.');
 const video=document.createElement('video'),url=URL.createObjectURL(file);
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';
 video.setAttribute('muted','');video.setAttribute('playsinline','');
 video.style.cssText='position:fixed;left:-10000px;width:2px;height:2px;pointer-events:none';
 document.body.appendChild(video);
 let stream,recorder,timer,frame;
 let onVisibility;
 try{
  await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('Video konnte nicht gelesen werden.')),20000);
   video.onloadeddata=()=>{clearTimeout(timeout);resolve();};
   video.onerror=()=>{clearTimeout(timeout);reject(Error('Dieses Videoformat kann der Browser nicht lesen. Bitte als MP4/H.264 exportieren.'));};
   video.src=url;video.load();
  });
  if(!Number.isFinite(video.duration)||video.duration<=0||video.duration>60||!video.videoWidth||!video.videoHeight)throw Error('Videos bis 60 Sekunden wählen.');
  const scale=Math.min(1,480/Math.max(video.videoWidth,video.videoHeight));
  canvas.width=Math.max(2,Math.floor(video.videoWidth*scale/2)*2);canvas.height=Math.max(2,Math.floor(video.videoHeight*scale/2)*2);
  const context=canvas.getContext('2d',{alpha:false});if(!context)throw Error('Videovorschau konnte nicht erstellt werden.');
  const draw=()=>{context.drawImage(video,0,0,canvas.width,canvas.height);if(!free)watermark(context,canvas.width,canvas.height);};
  context.drawImage(video,0,0,canvas.width,canvas.height);
  const poster=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.85));
  if(!poster)throw Error('Video-Titelbild konnte nicht erstellt werden.');
  draw();stream=canvas.captureStream(20);
  recorder=new Recorder(stream,{mimeType:mime,videoBitsPerSecond:360000});
  const chunks=[];let size=0;
  const preview=await new Promise((resolve,reject)=>{
   let failed=false;
   const fail=message=>{if(failed)return;failed=true;reject(Error(message));};onVisibility=()=>{if(document.visibilityState==='hidden')fail('Videoverarbeitung pausiert. Bitte die Seite geöffnet lassen und erneut hochladen.');};document.addEventListener('visibilitychange',onVisibility);
   recorder.ondataavailable=event=>{if(!event.data?.size)return;size+=event.data.size;if(size>CREATOR_VIDEO_PREVIEW_LIMIT){fail('Videovorschau ist zu groß. Bitte einen kürzeren Clip wählen.');if(recorder.state!=='inactive')recorder.stop();}else chunks.push(event.data);};
   recorder.onerror=()=>fail('Videovorschau konnte nicht erstellt werden.');
   recorder.onstop=()=>{if(!failed)resolve(new Blob(chunks,{type:recorder.mimeType.split(';')[0]}));};
   video.onended=()=>{draw();if(recorder.state!=='inactive')recorder.stop();};
   video.onerror=()=>fail('Video konnte nicht vollständig verarbeitet werden.');
   // A backgrounded tab can stall canvas recording. Never publish a frozen
   // or incomplete preview as though the upload had completed.
   timer=setTimeout(()=>fail('Videoverarbeitung wurde unterbrochen. Bitte die Seite geöffnet lassen und erneut versuchen.'),Math.ceil(video.duration*1000)+20000);
   recorder.start(500);
   const tick=()=>{if(failed||recorder.state==='inactive')return;draw();frame=requestAnimationFrame(tick);};
   video.play().then(tick).catch(()=>fail('Video konnte nicht gestartet werden. Bitte erneut hochladen.'));
  });
  if(!preview.size||preview.size>CREATOR_VIDEO_PREVIEW_LIMIT)throw Error('Videovorschau ist unvollständig.');
  return {preview,poster:new File([poster],'video-poster.jpg',{type:'image/jpeg'}),duration:video.duration,width:canvas.width,height:canvas.height};
 }finally{
  clearTimeout(timer);cancelAnimationFrame(frame);if(onVisibility)document.removeEventListener('visibilitychange',onVisibility);
  if(recorder?.state&&recorder.state!=='inactive'){recorder.onstop=null;recorder.stop();}
  stream?.getTracks().forEach(track=>track.stop());video.pause();video.removeAttribute('src');video.load();video.remove();URL.revokeObjectURL(url);
 }
}
