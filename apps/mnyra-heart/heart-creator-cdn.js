import {auth} from '/shared/firebase-config.js';
import {BUNNY_EDGE_BASE, MEDIA_TICKET_ENDPOINT} from '../../shared/bunny-edge.js';
import {creatorVariants,creatorMediaUrl,CREATOR_WATERMARK_VERSION} from '../../shared/creator-media.js';

// The existing MNYRA image endpoint is already deployed. No capability endpoint,
// feature flag, Worker update, private bucket or new credentials are required.
export async function creatorCdnEnabled() { return true; }
async function ticket() {
  const user = auth.currentUser;
  if (!user) throw Error('Bitte erneut in Heart anmelden.');
  const response = await fetch(MEDIA_TICKET_ENDPOINT,{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await user.getIdToken()}`},
    body:JSON.stringify({action:'image_upload',restaurantId:user.uid}),signal:AbortSignal.timeout(15000)
  });
  const result = await response.json();
  if (!response.ok || !result.ticket) throw Error('Cloudflare-Upload konnte nicht freigegeben werden.');
  return {token:result.ticket,uid:user.uid};
}
export async function uploadCreatorMedia(pageId,imageId,file,displays,{free=false,hero=false}={}) {
  const access=await ticket(),mode=free||hero?'clean':'marked',media={mode,bytes:file.size};
  if(mode==='marked')media.watermarkVersion=CREATOR_WATERMARK_VERSION;
  async function upload(blob,name){
    const form=new FormData();form.set('restaurantId',access.uid);form.set('file',blob,name);
    const response=await fetch(`${BUNNY_EDGE_BASE}/image/upload`,{
      method:'POST',headers:{Authorization:`Bearer ${access.token}`},body:form,signal:AbortSignal.timeout(120000)
    });
    const result=await response.json();
    const url=creatorMediaUrl(result.cdnUrl||result.url);
    if(!response.ok||!url)throw Error(result.error||'Cloudflare-Upload unvollständig. Bitte wiederholen.');
    return url;
  }
  // Only the selected public variant leaves the browser. In particular a paid
  // package never uploads its clean derivatives or original to public R2.
  await Promise.all(['thumb','medium','large'].map(async size=>{
    const blob=await(await fetch(displays[size][mode])).blob();
    media[size]=await upload(blob,`${size}.${blob.type==='image/webp'?'webp':'jpg'}`);
  }));
  if(!creatorVariants(media))throw Error('Cloudflare-Vorschauen sind unvollständig.');
  // Free originals may be public, just like normal MNYRA images. Large files
  // retain the established protected Firestore download path. A failure here
  // must not invalidate already uploaded previews or the protected original.
  if(free&&!hero&&file.size<=15*1024*1024){
    try{media.download=await upload(file,file.name||'photo.jpg');}catch{}
  }
  return {media};
}
