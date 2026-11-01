import {auth} from '/shared/firebase-config.js';
import {creatorVideoMediaUrl} from '../../shared/creator-media.js';

export async function requestCreatorVideoOptimization(video,owner){
 const user=auth.currentUser;if(!user)throw Error('Bitte erneut in Heart anmelden.');
 const response=await fetch('/api/content-creator-video-optimize',{
  method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await user.getIdToken()}`},
  body:JSON.stringify({video,owner}),signal:AbortSignal.timeout(280000)
 });
 const result=await response.json();
 if(!response.ok||result.webVideoVersion!==1||!creatorVideoMediaUrl(result.video)||
  !Number.isSafeInteger(result.videoBytes)||result.videoBytes<1||result.videoBytes>48*1024*1024||
  !Number.isSafeInteger(result.videoSourceBytes)||result.videoBytes>result.videoSourceBytes)throw Error(result.error||'Videooptimierung fehlgeschlagen.');
 return {video:result.video,webVideoVersion:1,videoBytes:result.videoBytes,videoSourceBytes:result.videoSourceBytes};
}
