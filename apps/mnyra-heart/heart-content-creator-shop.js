import {db} from '/shared/firebase-config.js';
import {doc,setDoc,updateDoc,serverTimestamp} from '/shared/vendor/firebase/11.0.0/firebase-firestore.js';
import {CC_PAGES} from '../../shared/content-creator.js';
import {CC_ORDERS} from '../../shared/content-creator-shop.js';
const PART=400000;
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
 const image=new Image();image.src=display;await image.decode();
 const canvas=document.createElement('canvas'),ratio=Math.min(1,720/Math.max(image.width,image.height));
 canvas.width=Math.round(image.width*ratio);canvas.height=Math.round(image.height*ratio);
 const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);
 ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(-.35);
 ctx.font=`600 ${Math.max(19,canvas.width/18)}px Arial`;ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,.68)';ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=3;
 for(let y=-canvas.height;y<canvas.height;y+=110)for(let x=-canvas.width;x<canvas.width;x+=250)ctx.fillText('MNYRA · PREVIEW',x,y);
 ctx.restore();
 const preview=canvas.toDataURL('image/jpeg',.72);
 await setDoc(doc(db,CC_PAGES,pageId,'previews',imageId),{data:preview});
 await setDoc(doc(db,CC_PAGES,pageId,'images',imageId),{data:preview,caption:''});
}
export {initialShopProduct} from "../../shared/content-creator-shop.js";
export async function releaseShopOrder(id){await updateDoc(doc(db,CC_ORDERS,id),{approved:true,paymentConfirmed:true,status:'released',releasedAt:serverTimestamp()});}
