import {CREATOR_VIDEO_PREVIEW_LIMIT} from '../shared/creator-video.js';

// Range reads touch only private, explicitly watermarked preview chunks.
// Original chunks are reachable solely through the existing purchase gates.
export async function creatorVideoPreview(pageId,file,repo,{free=false,range=''}={}){
 const path=`contentCreatorPages/${pageId}/originals/${file}`;
 const metadata=await repo.read(path,['mediaType','videoPreview']);
 const preview=metadata?.videoPreview;
 if(metadata?.mediaType!=='video'||!preview||preview.mode!==(free?'clean':'marked')||!['video/mp4','video/webm'].includes(preview.mime)||!/^[a-f0-9]{32}$/.test(preview.id||'')||!Number.isSafeInteger(preview.size)||preview.size<1||preview.size>CREATOR_VIDEO_PREVIEW_LIMIT||!Number.isInteger(preview.parts)||preview.parts!==Math.ceil(preview.size/400000))throw Error('Videoja nuk është e disponueshme.');
 let start=0,end=preview.size-1;
 if(range){
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);
  if(!match||(!match[1]&&!match[2]))return {status:416,total:preview.size};
  if(!match[1]){const suffix=Number(match[2]);if(!Number.isSafeInteger(suffix)||suffix<1)return {status:416,total:preview.size};start=Math.max(0,preview.size-suffix);}
  else{start=Number(match[1]);end=match[2]?Math.min(end,Number(match[2])):end;}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=preview.size||end<start)return {status:416,total:preview.size};
 }
 const first=Math.floor(start/400000),last=Math.floor(end/400000),chunks=[];
 for(let part=first;part<=last;part++){
  const row=await repo.read(`${path}/videoPreviews/${preview.id}/chunks/${String(part).padStart(3,'0')}`);
  if(!row?.data||!/^[A-Za-z0-9+/]+={0,2}$/.test(row.data))throw Error('Videovorschau ist unvollständig.');
  const bytes=Buffer.from(row.data,'base64'),expected=Math.min(400000,preview.size-part*400000);
  if(bytes.length!==expected)throw Error('Videovorschau ist unvollständig.');chunks.push(bytes);
 }
 return {bytes:Buffer.concat(chunks).subarray(start-first*400000,end-first*400000+1),mime:preview.mime,status:range?206:200,start,end,total:preview.size};
}
