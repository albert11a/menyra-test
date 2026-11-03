import {once} from 'node:events';
import {waitUntil} from '@vercel/functions';
import {shopRepository,shopAction} from '../server/content-creator-shop.js';
export async function serveCreatorShop(req,res,repository=shopRepository){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(!['POST','GET','HEAD'].includes(req.method)){res.statusCode=405;res.end('{}');return;}
 try{
  const url=new URL(req.url||'/','https://www.mnyra.com');
  let input=req.method!=='POST'?Object.fromEntries(url.searchParams):req.body;
  if(typeof input==='string')input=JSON.parse(input);if(!input||typeof input!=='object')throw Error('Kërkesa mungon.');
  if(req.method!=='POST'&&!['sold','sold-download','sold-preview','receipt','download','free-download','free-image','image','video'].includes(input.op))throw Error('Kërkesa nuk lejohet.');
  if(input.op==='video')input.range=req.headers?.range||'';
  if(input.op==='visit'){
   const decode=value=>{try{return decodeURIComponent(String(value||''));}catch{return '';}};
   input={...input,location:{country:decode(req.headers?.['x-vercel-ip-country']),city:decode(req.headers?.['x-vercel-ip-city'])}};
  }
  const repo=await repository();
  // Persist first. FCM/device delivery must never hold the buyer's receipt hostage.
  const deferred=[];
  const result=await shopAction(input,input.op==='notify'?repo:{...repo,notify:async(...args)=>{deferred.push(args);return true;}},{streamPhoto:true});
  if(deferred.length)waitUntil(Promise.all(deferred.map(async args=>{
   const delivered=await repo.notify(...args).catch(()=>false);
   if(!delivered)console.error('creator_notification_pending',{kind:args[0],id:args[1]});
  })));
  res.statusCode=input.op==='video'?(result.status||200):200;
  if(input.op==='video'){res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control','private, max-age=300');if(result.status===416){res.setHeader('Content-Range',`bytes */${result.total}`);res.end();return;}if(result.status===206)res.setHeader('Content-Range',`bytes ${result.start}-${result.end}/${result.total}`);}
  if(result.redirect){res.statusCode=307;res.setHeader('Location',result.redirect);res.end();return;}
  if(result.chunks){
   res.setHeader('Content-Type',result.mime);
   res.setHeader('X-File-Name',encodeURIComponent(result.name||'foto.jpg'));
   res.setHeader('Content-Length',String(result.size));
   if(req.method==='HEAD'){res.end();return;}
   for await(const chunk of result.chunks){
    if(res.destroyed)return;
    if(!res.write(chunk))await once(res,'drain',{signal:AbortSignal.timeout(15000)});
   }
   res.end();
   if(result.recordDownload)waitUntil(result.recordDownload().catch(error=>console.error('creator_photo_download_tracking',error.message)));
   return;
  }
  if(result.bytes){
   if(input.op==='image')res.setHeader('Cache-Control','private, max-age=300');
   res.setHeader('Content-Type',result.mime);
   res.setHeader('Content-Disposition','inline');
   if(result.name)res.setHeader('X-File-Name',encodeURIComponent(result.name));
   res.setHeader('Content-Length',String(result.bytes.length));
   if(req.method==='HEAD'){res.end();return;}
   for(let offset=0;offset<result.bytes.length;offset+=1024*1024)res.write(result.bytes.subarray(offset,offset+1024*1024));
   res.end();return;
  }
  res.end(req.method==='HEAD'?undefined:JSON.stringify(result));
 }catch(error){if(res.headersSent){res.destroy();return;}res.removeHeader?.('Content-Length');res.removeHeader?.('X-File-Name');res.setHeader('Content-Type','application/json');res.statusCode=400;res.end(JSON.stringify({error:String(error.message||'Ju lutemi, provoni përsëri.')}));}
}
export default function handler(req,res){return serveCreatorShop(req,res);}

