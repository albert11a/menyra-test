import {createHash} from 'node:crypto';
import {guardedCreatorWrite} from './creator-guarded-write.js';
import {validShopId} from '../shared/content-creator-shop.js';

export async function recordCreatorPhotoViews(input,repo,now=Date.now()){
 const {pageId,session,files,token}=input;
 if(!validShopId(pageId)||!validShopId(session)||!Array.isArray(files)||files.length>32||files.some(file=>typeof file!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(file)))throw Error('Kërkesa nuk është e vlefshme.');
 if(!files.length)return {ok:true};
 const path=`contentCreatorPages/${pageId}`;
 const page=await repo.read(path,['published','deleting','kind','photoIds','mediaTypes','media','products','heroImages','photoDeliveryEnabled']);
 if(!page?.published||page.deleting)return {ok:true};
 let allowed;
 if(token!==undefined){
  if(!validShopId(token))throw Error('Linku nuk është i vlefshëm.');
  const delivery=await repo.read(`${path}/originals/photo-delivery-${token}`);
  const legacy=!delivery&&page.photoDeliveryEnabled?await repo.read(`${path}/originals/photo-delivery`):null;
  allowed=delivery?.files||(legacy?.token===token?legacy?.files:[]);
 }else{
  const packages=new Set((page.products||[]).filter(p=>p.active!==false).flatMap(p=>p.imageIds||[]));
  allowed=[...(page.photoIds||[]).filter(id=>page.kind!=='shop'||packages.has(id)),...(page.heroImages||[]).map(image=>image.id)];
 }
 const visible=[...new Set(files)].filter(file=>allowed?.includes(file)&&page.mediaTypes?.[file]!=='video'&&page.media?.[file]?.mediaType!=='video');
 if(!visible.length)return {ok:true};
 const sessionKey=createHash('sha256').update(`${pageId}:${session}`).digest('hex');
 await repo.countPhotoViews(path,sessionKey,visible,new Date(now),pageId);
 return {ok:true};
}


// The session precondition and all increments commit together. A retry after
// a lost response observes the same stored session without incrementing again.
export async function countCreatorPhotoViews({base,headers,pagePath,sessionKey,files,now,pageId,read}){
 const parent=new URL(base).pathname.slice('/v1/'.length);
 const sessionPath=`${pagePath}/photoViewSessions/${sessionKey}`;
 for(let attempt=0;attempt<5;attempt++){
  const previous=await read(sessionPath);
  const seen=new Set(previous?.fields?.files?.arrayValue?.values?.map(file=>file.stringValue)||[]);
  const fresh=files.filter(file=>!seen.has(file));
  if(!fresh.length)return;
  const writes=[{
   update:{name:`${parent}/${sessionPath}`,fields:{files:{arrayValue:{values:[...seen,...fresh].map(file=>({stringValue:file}))}},expiresAt:{timestampValue:new Date(+now+86400000).toISOString()}}},
   currentDocument:previous?{updateTime:previous.updateTime}:{exists:false}
  },...fresh.map(file=>({
   update:{name:`${parent}/${pagePath}/photoStats/${file}`,fields:{photoId:{stringValue:file},businessId:{stringValue:pageId}}},
   updateMask:{fieldPaths:['photoId','businessId']},
   updateTransforms:[{fieldPath:'viewCount',increment:{integerValue:'1'}},{fieldPath:'lastViewedAt',setToServerValue:'REQUEST_TIME'}]
  }))];
  try{
   await guardedCreatorWrite({base,headers,pagePath,writes,conflictRetry:true});
   return;
  }catch(error){
   if(error.code!=='CREATOR_VISIT_CONFLICT'||attempt===4)throw error;
   await new Promise(resolve=>setTimeout(resolve,25*2**attempt+Math.random()*40));
  }
 }
}
