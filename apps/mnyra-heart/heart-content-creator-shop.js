import {db} from '/shared/firebase-config.js';
import {doc,getDoc,setDoc,updateDoc,serverTimestamp} from '/shared/vendor/firebase/11.0.0/firebase-firestore.js';
import {CC_PAGES} from '../../shared/content-creator.js';
import {CC_ORDERS} from '../../shared/content-creator-shop.js';
const PART=400000;
export function drawShopWatermark(ctx,width,height){
 const text='MNYRA · PREVIEW',fontSize=Math.max(16,width/23);
 ctx.save();ctx.translate(width/2,height/2);ctx.rotate(-.35);
 ctx.font=`600 ${fontSize}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle='rgba(255,255,255,.32)';ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=1;
 const stepX=Math.ceil(ctx.measureText(text).width+fontSize*3),stepY=Math.ceil(fontSize*4.5);
 const radius=Math.hypot(width,height)/2;
 for(let row=-Math.ceil(radius/stepY);row<=Math.ceil(radius/stepY);row++){
  for(let col=-Math.ceil(radius/stepX)-1;col<=Math.ceil(radius/stepX)+1;col++)ctx.fillText(text,col*stepX+(row%2)*stepX/2,row*stepY);
 }
 ctx.restore();
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
 await setDoc(doc(db,CC_PAGES,pageId,'originals',imageId),{cleanPreview:{version:1,data:cleanData}},{merge:true});
 drawShopWatermark(ctx,canvas.width,canvas.height);
 const preview=canvas.toDataURL('image/jpeg',.8);
 await setDoc(doc(db,CC_PAGES,pageId,'previews',imageId),{data:preview});
 await setDoc(doc(db,CC_PAGES,pageId,'images',imageId),{data:preview},{merge:true});
}
export async function refreshShopPreviews(pageId,imageIds){
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
}
export async function saveShopAsset(pageId,imageId,file,display){
 if(!file||file.size>30*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('JPG, PNG oder WebP bis 30 MB wählen.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const parts=Math.ceil(bytes.length/PART);if(!parts)throw Error('Die Datei ist leer.');
 for(let i=0;i<parts;i++){
  const slice=bytes.subarray(i*PART,(i+1)*PART);let binary='';
  for(let n=0;n<slice.length;n+=4096)binary+=String.fromCharCode(...slice.subarray(n,n+4096));
  await setDoc(doc(db,CC_PAGES,pageId,'originals',imageId,'chunks',String(i).padStart(3,'0')),{data:btoa(binary)});
 }
 await setDoc(doc(db,CC_PAGES,pageId,'originals',imageId),{name:file.name.slice(0,180),mime:file.type,size:bytes.length,parts});
 await saveShopPreview(pageId,imageId,display);
}
export {initialShopProduct} from "../../shared/content-creator-shop.js";
export async function releaseShopOrder(id){await updateDoc(doc(db,CC_ORDERS,id),{approved:true,paymentConfirmed:true,status:'released',releasedAt:serverTimestamp()});}

