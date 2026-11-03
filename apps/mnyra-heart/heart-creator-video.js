import {creatorVideoFile,CREATOR_VIDEO_PREVIEW_LIMIT} from '../../shared/creator-video.js';
import {startCreatorVideo} from './heart-creator-video-start.js';
import {creatorVideoAudioContext} from './heart-creator-video-audio.js';

// Two derivatives: a full 1920px video retaining audio, and a short, silent
// 1080px forward/reverse clip. Paid derivatives have a baked watermark.
export async function prepareCreatorVideo(file,{free=false,watermark=()=>{}}={}){
 if(!creatorVideoFile(file)||file.size<1||file.size>30*1024*1024)throw Error('MP4, MOV oder WebM bis 30 MB wählen.');
 const Recorder=globalThis.MediaRecorder;
 const mimes=['video/mp4;codecs=avc1.4d0028,mp4a.40.2','video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp8,opus','video/webm'].filter(type=>Recorder?.isTypeSupported?.(type));
 const canvas=document.createElement('canvas'),audio=creatorVideoAudioContext();
 if(!Recorder||!canvas.captureStream||!mimes.length)throw Error('Dieser Browser kann keine geschützte Videovorschau erstellen. Bitte einen aktuellen Safari oder Chrome verwenden.');
 if(!audio)throw Error('Bitte „Vorschauen aktualisieren“ oder „Paket hochladen“ erneut antippen, um die Verarbeitung mit Ton zu starten.');
 const video=document.createElement('video'),url=URL.createObjectURL(file),streams=[],frames=[];
 video.playsInline=true;video.preload='auto';video.setAttribute('playsinline','');
 video.style.cssText='position:fixed;left:-10000px;width:2px;height:2px;pointer-events:none';document.body.appendChild(video);
 // Audio is diverted into the recording, without playing through speakers.
 const source=audio.createMediaElementSource(video),destination=audio.createMediaStreamDestination();source.connect(destination);
 let recorder,timer,frame,onVisibility;
 const cleanupRecorder=()=>{clearTimeout(timer);globalThis.cancelAnimationFrame(frame);if(onVisibility)document.removeEventListener('visibilitychange',onVisibility);if(recorder?.state&&recorder.state!=='inactive'){recorder.onstop=null;recorder.stop();}};
 async function record(stream,bitrate,start,{singleChunk=false}={}){
  // Some browsers advertise a codec but reject its recorder configuration.
  // Retry the established formats before failing a working upload path.
  let creationError;
  for(const mime of mimes){try{recorder=new Recorder(stream,{mimeType:mime,videoBitsPerSecond:bitrate,audioBitsPerSecond:128000});creationError=null;break;}catch(error){creationError=error;}}
  if(creationError)throw creationError;
  const chunks=[];let size=0;
  return new Promise((resolve,reject)=>{
   let failed=false;
   const fail=message=>{if(failed)return;failed=true;cleanupRecorder();reject(Error(message));};
   onVisibility=()=>{if(document.visibilityState==='hidden')fail('Videoverarbeitung unterbrochen. Bitte die Seite geöffnet lassen und erneut versuchen.');};document.addEventListener('visibilitychange',onVisibility);
   recorder.ondataavailable=event=>{if(!event.data?.size)return;size+=event.data.size;if(size>CREATOR_VIDEO_PREVIEW_LIMIT)fail('Videovorschau ist zu groß. Bitte einen kürzeren Clip wählen.');else chunks.push(event.data);};
   recorder.onerror=()=>fail('Videovorschau konnte nicht erstellt werden.');
   recorder.onstop=()=>{if(!failed){cleanupRecorder();resolve(new Blob(chunks,{type:recorder.mimeType.split(';')[0]}));}};
   timer=setTimeout(()=>fail('Videoverarbeitung wurde unterbrochen. Bitte erneut versuchen.'),Math.ceil(video.duration*1000)+25000);
   if(singleChunk)recorder.start();else recorder.start(250);start(()=>{if(recorder.state!=='inactive')recorder.stop();},fail);
  });
 }
 try{
  await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('Video konnte nicht gelesen werden.')),20000);
   video.onloadeddata=()=>{clearTimeout(timeout);resolve();};
   video.onerror=()=>{clearTimeout(timeout);reject(Error('Dieses Videoformat kann der Browser nicht lesen. Bitte als MP4/H.264 exportieren.'));};video.src=url;video.load();
  });
  if(!Number.isFinite(video.duration)||video.duration<=0||video.duration>60||!video.videoWidth||!video.videoHeight)throw Error('Videos bis 60 Sekunden wählen.');
  function dimensions(target,edge){const scale=Math.min(1,edge/Math.max(video.videoWidth,video.videoHeight));target.width=Math.max(2,Math.floor(video.videoWidth*scale/2)*2);target.height=Math.max(2,Math.floor(video.videoHeight*scale/2)*2);}
  dimensions(canvas,1920);const context=canvas.getContext('2d',{alpha:false});
  if(!context)throw Error('Videovorschau konnte nicht erstellt werden.');
  context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
  context.drawImage(video,0,0,canvas.width,canvas.height);
  const poster=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.92));if(!poster)throw Error('Video-Titelbild konnte nicht erstellt werden.');
  const small=document.createElement('canvas');dimensions(small,1080);const smallContext=small.getContext('2d',{alpha:false});
  const draw=()=>{context.drawImage(video,0,0,canvas.width,canvas.height);if(!free)watermark(context,canvas.width,canvas.height);};
  draw();const stream=canvas.captureStream(30);streams.push(stream);for(const track of destination.stream.getAudioTracks())stream.addTrack(track);
  // Resolve Safari gesture restrictions BEFORE the recorder starts.
  await startCreatorVideo(video,audio);
  let lastCapture=-1,firstCapture=0;
  // Shorter, denser loop: sharper pixels without raising the network bitrate.
  const captureFps=30,maxFrames=Math.min(36,Math.floor(128*1024*1024/(small.width*small.height*4)));
  const preview=await record(stream,6000000,(stop,fail)=>{
   video.onended=stop;video.onerror=()=>fail('Video konnte nicht vollständig verarbeitet werden.');
   const tick=()=>{
    draw();
    if(video.currentTime<=1.2&&frames.length<maxFrames&&video.currentTime-lastCapture>=.9/captureFps){smallContext.drawImage(video,0,0,small.width,small.height);if(!free)watermark(smallContext,small.width,small.height);if(!frames.length)firstCapture=video.currentTime;frames.push(smallContext.getImageData(0,0,small.width,small.height));lastCapture=video.currentTime;}
    frame=requestAnimationFrame(tick);
   };
   tick();
  });
  video.pause();if(!preview.size||frames.length<2)throw Error('Videovorschau ist unvollständig.');
  // Reverse is encoded once, rather than repeated seeking/negative playbackRate
  // on every customer's phone. At most 36 bounded frames are held in memory.
  const sequence=[...frames,...frames.slice(1,-1).reverse()],fps=Math.min(captureFps,Math.max(12,(frames.length-1)/Math.max(.001,lastCapture-firstCapture)));
  smallContext.putImageData(sequence[0],0,0);
  // Explicit frames avoid capture-clock drift; use ordinary capture on browsers
  // without requestFrame. A single final blob avoids fragmented loop segments.
  let loopStream;try{loopStream=small.captureStream(0);}catch{loopStream=small.captureStream(fps);}
  let loopTrack=loopStream.getVideoTracks?.()[0];
  if(typeof loopTrack?.requestFrame!=='function'){loopStream.getTracks().forEach(track=>track.stop());loopStream=small.captureStream(fps);loopTrack=null;}
  streams.push(loopStream);
  const boomerang=await record(loopStream,3000000,stop=>{
   const started=performance.now();let shown=-1;
   const tick=()=>{const index=Math.floor((performance.now()-started)*fps/1000);if(index>=sequence.length){stop();return;}if(index!==shown){smallContext.putImageData(sequence[index],0,0);loopTrack?.requestFrame();shown=index;}frame=requestAnimationFrame(tick);};tick();
  },{singleChunk:true});
  return {preview,boomerang,poster:new File([poster],'video-poster.jpg',{type:'image/jpeg'}),duration:video.duration,width:canvas.width,height:canvas.height};
 }finally{
  cleanupRecorder();for(const stream of streams)stream.getTracks().forEach(track=>track.stop());destination.stream.getTracks().forEach(track=>track.stop());source.disconnect();frames.length=0;video.pause();video.removeAttribute('src');video.load();video.remove();URL.revokeObjectURL(url);
 }
}
