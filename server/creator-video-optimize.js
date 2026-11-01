import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import ffmpeg from 'ffmpeg-static';
import {CREATOR_MEDIA_ORIGIN,creatorVideoMediaUrl} from '../shared/creator-media.js';
import {MEDIA_TICKET_ENDPOINT} from '../shared/bunny-edge.js';

const exec=promisify(execFile),MAX_BYTES=48*1024*1024;
// Worker storage keys may lowercase a mixed-case restaurant document ID. Keep
// the actual ID for Firebase authorization; compare only this path segment.
const sameVideoOwner=(video,owner)=>new URL(video).pathname.split('/')[3].toLowerCase()===owner.toLowerCase();
export function creatorVideoCompressionArgs(input,output,{copyAudio=false}={}){
 // No scale/crop/fps filter: retain the derivative's existing pixel dimensions
 // and timestamps. The private download original never enters this endpoint.
 return ['-nostdin','-y','-v','error','-max_pixels','8294400','-format_whitelist','mov,matroska,webm','-protocol_whitelist','file','-i',input,
  '-map','0:v:0','-map','0:a:0?','-t','61','-c:v','libx264','-preset','medium',
  '-crf','18','-pix_fmt','yuv420p','-vsync','0','-g','60',
  ...(copyAudio?['-c:a','copy']:['-c:a','aac','-b:a','128k']),'-movflags','+faststart','-threads','2',output];
}
export async function encodeCreatorWebVideo(bytes,{binary=ffmpeg}={}){
 if(!bytes.length||bytes.length>MAX_BYTES)throw Error('Videovorschau ist zu groß.');
 const directory=await mkdtemp(join(tmpdir(),'creator-video-'));
 try{
  const input=join(directory,'source'),output=join(directory,'web.mp4');
  await writeFile(input,bytes);
  await exec(binary,creatorVideoCompressionArgs(input,output,{copyAudio:bytes.subarray(4,8).toString()==='ftyp'}),{timeout:150000,maxBuffer:256*1024,killSignal:'SIGKILL'});
  const encoded=await readFile(output);
  if(!encoded.length||encoded.length>MAX_BYTES)throw Error('Videooptimierung unvollständig.');
  return encoded;
 }finally{await rm(directory,{recursive:true,force:true});}
}
async function limitedVideo(response){
 if(!response.ok||!/^video\/(mp4|webm)(?:;|$)/i.test(response.headers.get('content-type')||''))throw Error('Videovorschau konnte nicht geladen werden.');
 if(Number(response.headers.get('content-length'))>MAX_BYTES){await response.body?.cancel();throw Error('Videovorschau ist zu groß.');}
 const reader=response.body.getReader(),parts=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES)throw Error('Videovorschau ist zu groß.');parts.push(value);}}
 finally{await reader.cancel().catch(()=>{});}
 if(!size)throw Error('Videovorschau ist leer.');
 return Buffer.concat(parts);
}
export async function optimizeCreatorVideo(input,token,{fetchFn=fetch,encode=encodeCreatorWebVideo}={}){
 const source=creatorVideoMediaUrl(input?.video),owner=String(input?.owner||'');
 if(!source)throw Object.assign(Error('Ungültige Creator-Videovorschau.'),{code:'VIDEO_SOURCE_INVALID'});
 if(!/^[A-Za-z0-9_-]{1,80}$/.test(owner)||!sameVideoOwner(source,owner))throw Object.assign(Error('Ungültige Creator-Videovorschau.'),{code:'VIDEO_OWNER_MISMATCH'});
 const deadline=AbortSignal.timeout(260000);
 const request=(url,options={})=>fetchFn(url,{...options,redirect:'error',signal:AbortSignal.any([deadline,AbortSignal.timeout(45000)])});
 // Validate the existing restaurant ownership before downloading/encoding.
 const access=await request(MEDIA_TICKET_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({action:'story_upload',restaurantId:owner})});
 const authorization=await access.json();
 if(!access.ok||typeof authorization.ticket!=='string'||!authorization.ticket)throw Error('Video-Upload konnte nicht freigegeben werden.');
 const bytes=await limitedVideo(await request(source));
 const encoded=await encode(bytes);
 if(encoded.length>=bytes.length*.95)return {video:source,webVideoVersion:1,videoBytes:bytes.length,videoSourceBytes:bytes.length};
 // Encoding can outlive a short-lived upload ticket. Get a fresh ticket after it.
 const renewed=await request(MEDIA_TICKET_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({action:'story_upload',restaurantId:owner})});
 const ticket=await renewed.json();if(!renewed.ok||!ticket.ticket)throw Error('Video-Upload konnte nicht freigegeben werden.');
 const form=new FormData();form.set('restaurantId',owner);form.set('file',new Blob([encoded],{type:'video/mp4'}),'creator-web.mp4');
 const uploaded=await request(`${CREATOR_MEDIA_ORIGIN}/story/upload`,{method:'POST',headers:{Authorization:`Bearer ${ticket.ticket}`,Origin:'https://mnyra.com'},body:form});
 const result=await uploaded.json(),video=creatorVideoMediaUrl(result.cdnUrl||result.url);
 if(!uploaded.ok||!video||!sameVideoOwner(video,owner))throw Error('Optimierte Videovorschau konnte nicht gespeichert werden.');
 return {video,webVideoVersion:1,videoBytes:encoded.length,videoSourceBytes:bytes.length};
}
