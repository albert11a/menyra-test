import {db} from '/shared/firebase-config.js';
import {doc,getDoc,setDoc,updateDoc,serverTimestamp,writeBatch} from '/shared/vendor/firebase/11.0.0/firebase-firestore.js';
import {CC_PAGES} from '../../shared/content-creator.js';
import {CC_ORDERS} from '../../shared/content-creator-shop.js';
import {creatorCdnEnabled,uploadCreatorMedia} from './heart-creator-cdn.js';
import {creatorVariants,creatorPublicMedia} from '../../shared/creator-media.js';
const PART=400000;
export function drawShopWatermark(ctx,width,height){
 const text='MNYRA · PREVIEW',fontSize=Math.max(7,width/42);
 ctx.save();ctx.translate(width/2,height/2);ctx.rotate(-.35);
 ctx.font=`400 ${fontSize}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle='rgba(255,255,255,.12)';ctx.shadowColor='rgba(0,0,0,.04)';ctx.shadowBlur=.5;
 const stepX=Math.ceil(ctx.measureText(text).width+fontSize*3),stepY=Math.ceil(fontSize*4.7);
 const radius=Math.hypot(width,height)/2;
 for(let row=-Math.ceil(radius/stepY);row<=Math.ceil(radius/stepY);row++){
  for(let col=-Math.ceil(radius/stepX)-1;col<=Math.ceil(radius/stepX)+1;col++)ctx.fillText(text,col*stepX+(row%2)*stepX/2,row*stepY);
 }
 ctx.restore();
}
export function prepareBoundedShopDisplay(image,edge,quality){
 let scale=Math.min(1,edge/image.width,edge*1.5/image.height);
 for(let attempt=0;attempt<6;attempt++){
  const frame=document.createElement('canvas');
  frame.width=Math.max(1,Math.round(image.width*scale));frame.height=Math.max(1,Math.round(image.height*scale));
  const context=frame.getContext('2d');context.fillStyle='#f1f2ed';context.fillRect?.(0,0,frame.width,frame.height);context.drawImage(image,0,0,frame.width,frame.height);
  const q=attempt===0?quality:Math.max(.5,quality-.06);
  const encode=()=>{const webp=frame.toDataURL('image/webp',q);return webp.startsWith('data:image/webp')?webp:frame.toDataURL('image/jpeg',q);};
  const clean=encode();drawShopWatermark(context,frame.width,frame.height);
  const record={version:3,width:frame.width,height:frame.height,clean,marked:encode()};
  const bytes=JSON.stringify(record).length;
  if(bytes<=950000)return record;
  // Always redraw from the original; never recompress a previous preview.
  if(attempt>0)scale*=Math.min(.9,Math.max(.5,Math.sqrt(900000/bytes)*.94));
 }
 throw Error('Vorschau konnte nicht vorbereitet werden. Bitte erneut versuchen.');
}
export async function saveShopPreview(pageId,imageId,display){
 const image=new Image();image.src=display;await image.decode();
 const canvas=document.createElement('canvas'),ratio=Math.min(1,720/Math.max(image.width,image.height));
 canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
 const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);
 // Keep the lightweight clean image private alongside the original metadata.
 const clean=document.createElement('canvas'),cleanRatio=Math.min(1,1200/Math.max(image.width,image.height));
 clean.width=Math.max(1,Math.round(image.width*cleanRatio));clean.height=Math.max(1,Math.round(image.height*cleanRatio));
 clean.getContext('2d').drawImage(image,0,0,clean.width,clean.height);
 let cleanData=clean.toDataURL('image/jpeg',.78);if(cleanData.length>=500000)cleanData=canvas.toDataURL('image/jpeg',.72);
 // Tiny cards and larger views are ready before the page is published.
 for(const [size,edge,quality] of [['thumb',640,.82],['medium',1280,.84],['large',1600,.88]]){
  const record=prepareBoundedShopDisplay(image,edge,quality);
  await setDoc(doc(db,CC_PAGES,pageId,'originals',imageId,'displays',size),record);
 }
 await setDoc(doc(db,CC_PAGES,pageId,'originals',imageId),{cleanPreview:{version:1,data:cleanData},displayPreview:null},{merge:true});
 drawShopWatermark(ctx,canvas.width,canvas.height);
 const preview=canvas.toDataURL('image/jpeg',.8);
 await setDoc(doc(db,CC_PAGES,pageId,'previews',imageId),{data:preview});
 await setDoc(doc(db,CC_PAGES,pageId,'images',imageId),{data:preview},{merge:true});
}
export async function refreshShopPreviews(pageId,imageIds){
 if(await creatorCdnEnabled()){
  const page=(await getDoc(doc(db,CC_PAGES,pageId))).data();
  for(const imageId of imageIds){const free=(page.products||[]).some(p=>p.active!==false&&p.priceCents===0&&p.imageIds?.includes(imageId));await saveCreatorCdnAsset(pageId,imageId,await savedCreatorFile(pageId,imageId),{free});}
  return;
 }
 for(const imageId of imageIds){
  const snap=await getDoc(doc(db,CC_PAGES,pageId,'originals',imageId)),meta=snap.data();
  if(!meta?.parts)throw Error('Originaldatei fehlt. Vorschau konnte nicht aktualisiert werden.');
  const parts=[];
  for(let i=0;i<meta.parts;i++){
   const chunk=await getDoc(doc(db,CC_PAGES,pageId,'originals',imageId,'chunks',String(i).padStart(3,'0')));
   if(!chunk.data()?.data)throw Error('Originaldatei ist unvollständig.');
   parts.push(Uint8Array.from(atob(chunk.data().data),char=>char.charCodeAt(0)));
  }
  const url=URL.createObjectURL(new Blob(parts,{type:meta.mime}));
  try{await saveShopPreview(pageId,imageId,url);}finally{URL.revokeObjectURL(url);}
 }
 await updateDoc(doc(db,CC_PAGES,pageId),{updatedAt:serverTimestamp()});
}
export async function saveShopAsset(pageId,imageId,file,display,options={}){
 if(!file||file.size>30*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('JPG, PNG oder WebP bis 30 MB wählen.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const parts=Math.ceil(bytes.length/PART);if(!parts)throw Error('Die Datei ist leer.');
 for(let i=0;i<parts;i++){
  const slice=bytes.subarray(i*PART,(i+1)*PART);let binary='';
  for(let n=0;n<slice.length;n+=4096)binary+=String.fromCharCode(...slice.subarray(n,n+4096));
  await setDoc(doc(db,CC_PAGES,pageId,'originals',imageId,'chunks',String(i).padStart(3,'0')),{data:btoa(binary)});
 }
 await setDoc(doc(db,CC_PAGES,pageId,'originals',imageId),{name:file.name.slice(0,180),mime:file.type,size:bytes.length,parts});
 if(await creatorCdnEnabled())return saveCreatorCdnAsset(pageId,imageId,file,options);
 const source=URL.createObjectURL(file);
 try{await saveShopPreview(pageId,imageId,source);}finally{URL.revokeObjectURL(source);}
}

export async function saveCreatorCdnAsset(pageId,imageId,file,{free=false,hero=false,publish=true}={}){
 const source=URL.createObjectURL(file);
 let result;
 try{
  const image=new Image();image.src=source;await image.decode();
  const displays={};
  for(const [size,edge,quality] of [['thumb',480,.68],['medium',1080,.8],['large',1600,.86]])displays[size]=prepareBoundedShopDisplay(image,edge,quality);
  result=await uploadCreatorMedia(pageId,imageId,file,displays,{free,hero});
 }finally{URL.revokeObjectURL(source);}
 // Original chunks stay in the existing protected Firestore collection.
 // Only prepared public image URLs are published after the upload completes.
 const batch=writeBatch(db),pageRef=doc(db,CC_PAGES,pageId);

 batch.set(doc(pageRef,'images',imageId),{cdn:result.media},{merge:true});
 if(!hero&&publish)batch.update(pageRef,{[`media.${imageId}`]:result.media,updatedAt:serverTimestamp()});
 await batch.commit();
 return {id:imageId,...result.media};
}

export async function savedCreatorFile(pageId,imageId){
 const ref=doc(db,CC_PAGES,pageId,'originals',imageId),snap=await getDoc(ref),meta=snap.data();
 if(!Number.isInteger(meta?.parts)||meta.parts<1||meta.parts>100||!Number.isSafeInteger(meta.size)||meta.size<1||meta.size>30*1024*1024)throw Error('Gespeichertes Original fehlt.');
 const chunks=[];let size=0;
 for(let start=0;start<meta.parts;start+=8){
  const rows=await Promise.all(Array.from({length:Math.min(8,meta.parts-start)},(_,offset)=>getDoc(doc(ref,'chunks',String(start+offset).padStart(3,'0')))));
  for(const row of rows){const data=row.data()?.data;if(!data)throw Error('Gespeichertes Original ist unvollständig.');const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));size+=bytes.length;if(size>meta.size)throw Error('Originalgröße stimmt nicht.');chunks.push(bytes);}
 }
 if(size!==meta.size)throw Error('Originalgröße stimmt nicht.');
 return new File(chunks,meta.name||`${imageId}.jpg`,{type:meta.mime||'image/jpeg'});
}

const migrationTasks=new Map();
export function migrateCreatorPage(pageId,onProgress=()=>{}){
 if(migrationTasks.has(pageId))return migrationTasks.get(pageId);
 const task=(async()=>{
  if(!await creatorCdnEnabled())return false;
  const pageRef=doc(db,CC_PAGES,pageId),snapshot=await getDoc(pageRef),page=snapshot.data();
  if(!page)return false;
  const current=creatorPublicMedia(page);
  // Preserved promo photos are not shop products and need no private originals.
  const ids=[...new Set(page.photoIds||[])].filter(id=>page.kind!=='shop'||(page.products||[]).some(product=>product.active!==false&&product.imageIds?.includes(id)));
  let done=0;
  for(const imageId of ids){
   if(imageId.startsWith('hero_')||!page.photoIds?.includes(imageId)||current[imageId]){onProgress(++done,ids.length);continue;}
   let file;
   if(page.kind==='shop')file=await savedCreatorFile(pageId,imageId);
   else{
    const snap=await getDoc(doc(pageRef,'images',imageId)),image=snap.data();
    if(creatorVariants(image?.cdn)){onProgress(++done,ids.length);continue;}
    if(!/^data:image\/(jpeg|png|webp);base64,/.test(image?.data||''))throw Error('Gespeichertes Vorschaufoto fehlt.');
    const blob=await(await fetch(image.data)).blob();file=new File([blob],`${imageId}.jpg`,{type:blob.type});
   }
   const free=page.kind!=='shop'||(page.products||[]).some(p=>p.active!==false&&p.priceCents===0&&p.imageIds?.includes(imageId));
   await saveCreatorCdnAsset(pageId,imageId,file,{free});onProgress(++done,ids.length);
  }
  await updateDoc(pageRef,{cdnMigrationVersion:1,updatedAt:serverTimestamp()});
  return true;
 })();
 migrationTasks.set(pageId,task);task.finally(()=>migrationTasks.delete(pageId)).catch(()=>{});return task;
}

export async function savePromoAsset(pageId,imageId,file,data){
 if(await creatorCdnEnabled())return saveCreatorCdnAsset(pageId,imageId,file,{free:true});
 await setDoc(doc(db,CC_PAGES,pageId,'images',imageId),{data,caption:''});
}
export {initialShopProduct} from "../../shared/content-creator-shop.js";
export async function releaseShopOrder(id){await updateDoc(doc(db,CC_ORDERS,id),{approved:true,paymentConfirmed:true,status:'released',releasedAt:serverTimestamp()});}

