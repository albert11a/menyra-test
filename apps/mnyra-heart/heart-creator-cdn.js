import {auth} from '/shared/firebase-config.js';
import {BUNNY_EDGE_BASE, MEDIA_TICKET_ENDPOINT} from '../../shared/bunny-edge.js';
import {creatorVariants} from '../../shared/creator-media.js';

let capability;
export function creatorCdnEnabled() {
  return capability ||= fetch(`${BUNNY_EDGE_BASE}/creator/status`,{signal:AbortSignal.timeout(5000)})
    .then(async response => response.ok && (await response.json()).creatorCdn === 1)
    .catch(() => false);
}
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
  const access = await ticket(),form = new FormData();
  form.set('pageId',pageId);form.set('imageId',imageId);form.set('restaurantId',access.uid);
  form.set('mode',free || hero ? 'clean' : 'marked');
  form.set('original',file,file.name || 'photo.jpg');
  for (const size of ['thumb','medium','large']) {
    const data = displays[size][free || hero ? 'clean' : 'marked'];
    const blob = await (await fetch(data)).blob();
    form.set(size,blob,`${size}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`);
  }
  const response = await fetch(`${BUNNY_EDGE_BASE}/creator/upload`,{
    method:'POST',headers:{Authorization:`Bearer ${access.token}`},body:form,signal:AbortSignal.timeout(120000)
  });
  const result = await response.json();
  if (!response.ok || !creatorVariants(result.media) || !result.original?.key?.startsWith('creator-private/')) throw Error(result.error || 'Cloudflare-Upload unvollständig. Bitte wiederholen.');
  return result;
}
export async function readCreatorOriginal(record) {
  const access = await ticket();
  const response = await fetch(`${BUNNY_EDGE_BASE}/creator/admin-original?${new URLSearchParams({key:record.key,restaurantId:access.uid})}`,{
    headers:{Authorization:`Bearer ${access.token}`},signal:AbortSignal.timeout(120000)
  });
  if (!response.ok) throw Error('Original konnte nicht geladen werden.');
  const blob = await response.blob();
  if (blob.size !== record.size) throw Error('Original ist unvollständig.');
  return new File([blob],record.name,{type:record.mime});
}
