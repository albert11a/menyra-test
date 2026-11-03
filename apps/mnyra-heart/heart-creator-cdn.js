import {auth,db} from '/shared/firebase-config.js';
import {collection,query,where,limit,getDocs} from '/shared/vendor/firebase/11.0.0/firebase-firestore.js';
import {BUNNY_EDGE_BASE, MEDIA_TICKET_ENDPOINT} from '../../shared/bunny-edge.js';
import {creatorVariants,creatorMediaUrl,creatorVideoMediaUrl} from '../../shared/creator-media.js';

// Photos use the existing image uploader. Videos reuse the existing menu
// video uploader below; both already write to the same R2/CDN.
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
// One upload implementation for photos, posters and correctly typed videos.
async function uploadCreatorFile(access,blob,name){
  const form=new FormData();form.set('restaurantId',access.uid);form.set('file',blob,name);
  const response=await fetch(`${BUNNY_EDGE_BASE}/image/upload`,{
    method:'POST',headers:{Authorization:`Bearer ${access.token}`},body:form,signal:AbortSignal.timeout(120000)
  });
  const result=await response.json();
  const url=creatorMediaUrl(result.cdnUrl||result.url);
  if(!response.ok||!url)throw Error(result.error||'Cloudflare-Upload unvollständig. Bitte wiederholen.');
  return url;
}
export async function uploadCreatorMedia(pageId,imageId,file,displays,{free=false,hero=false}={}) {
  const access=await ticket(),mode=free||hero?'clean':'marked',media={mode,bytes:file.size};
  const upload=(blob,name)=>uploadCreatorFile(access,blob,name);
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

// Same owner lookup already used by Heart's existing video uploads. The
// deployed video ticket requires a managed restaurant ID, not the CEO uid.
const videoOwners=new Map();
export async function creatorVideoOwner(uid,video=''){
  const source=video?creatorVideoMediaUrl(video):'';
  if(video&&!source)throw Error('Ungültige Creator-Videovorschau.');
  const sourceOwner=source?new URL(source).pathname.split('/')[3]:'';
  const cacheKey=sourceOwner?`${uid}:${sourceOwner.toLowerCase()}`:uid;
  if(videoOwners.has(cacheKey))return videoOwners.get(cacheKey);
  // Existing Worker objects may use lowercase keys for mixed-case Firestore
  // IDs. Resolve that key to the actual managed document ID for ticket auth.
  // An existing video need not belong to the first restaurant in the account.
  const constraints=[where('createdByUid','==',uid)];if(!sourceOwner)constraints.push(limit(1));
  const rows=await getDocs(query(collection(db,'restaurants'),...constraints));
  const owner=String((sourceOwner?rows.docs.find(row=>row.id.toLowerCase()===sourceOwner.toLowerCase()):rows.docs[0])?.id||'');
  if(!owner||owner===uid)throw Error('Für dieses Video fehlt der zugehörige Betrieb unter diesem Konto.');
  videoOwners.set(cacheKey,owner);return owner;
}

// Reuse the actual, already deployed menu upload implementation. Its name
// includes "story", but uploading alone creates no Story document or expiry.
// Public paid uploads contain only baked-watermark derivatives.
export async function uploadCreatorVideo(prepared) {
  const user=auth.currentUser;if(!user)throw Error('Bitte erneut in Heart anmelden.');
  const owner=await creatorVideoOwner(user.uid);
  const {createMediaUploadRuntimeController}=await import('../menyra-social/core/media/media-upload-runtime-controller.js');
  const uploader=createMediaUploadRuntimeController({auth,mediaBaseUrl:BUNNY_EDGE_BASE,mediaTicketEndpoint:MEDIA_TICKET_ENDPOINT,fetchFn:fetch});
  const result={};
  try{
    for(const [name,blob] of [['video',prepared.preview],['boomerang',prepared.boomerang]]){
      const file=new File([blob],`${name}.${blob.type==='video/webm'?'webm':'mp4'}`,{type:blob.type});
      const uploaded=await uploader.uploadRawMediaFile(file,owner,{maxBytes:48*1024*1024});
      const url=creatorVideoMediaUrl(uploaded.cdnUrl||uploaded.url);
      if(!url)throw Error('Cloudflare-Video-Upload unvollständig. Bitte wiederholen.');
      result[name]=url;
    }
  }catch(error){videoOwners.delete(user.uid);throw error;}
  // Upload already contains only the public marked/clean derivative. Keep a
  // working upload available if optimization is temporarily unavailable.
  try{
    const {requestCreatorVideoOptimization}=await import('./heart-creator-video-optimize.js');
    Object.assign(result,await requestCreatorVideoOptimization(result.video,owner));
  }catch{console.warn('creator_video_optimization_pending');}
  return result;
}

export async function uploadCreatorDeliveryOriginal(file){
  return uploadCreatorFile(await ticket(),file,file.name);
}
