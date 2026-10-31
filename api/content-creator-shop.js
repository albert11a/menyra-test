import {waitUntil} from '@vercel/functions';
import {shopRepository,shopAction} from '../server/content-creator-shop.js';
export async function serveCreatorShop(req,res,repository=shopRepository){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(!['POST','GET'].includes(req.method)){res.statusCode=405;res.end('{}');return;}
 try{
  const url=new URL(req.url||'/','https://www.mnyra.com');
  let input=req.method==='GET'?Object.fromEntries(url.searchParams):req.body;
  if(typeof input==='string')input=JSON.parse(input);if(!input||typeof input!=='object')throw Error('Kërkesa mungon.');
  if(req.method==='GET'&&!['receipt','download','free-download','free-image','image'].includes(input.op))throw Error('Kërkesa nuk lejohet.');
  const repo=await repository();
  // Persist first. FCM/device delivery must never hold the buyer's receipt hostage.
  const deferred=[];
  const result=await shopAction(input,input.op==='notify'?repo:{...repo,notify:async(...args)=>{deferred.push(args);return true;}});
  if(deferred.length)waitUntil(Promise.all(deferred.map(async args=>{
   const delivered=await repo.notify(...args).catch(()=>false);
   if(!delivered)console.error('creator_notification_pending',{kind:args[0],id:args[1]});
  })));
  res.statusCode=200;
  if(result.redirect){res.statusCode=307;res.setHeader('Location',result.redirect);res.end();return;}
  if(result.bytes){
   if(input.op==='image')res.setHeader('Cache-Control','private, max-age=300');
   res.setHeader('Content-Type',result.mime);
   res.setHeader('Content-Disposition','inline');
   if(result.name)res.setHeader('X-File-Name',encodeURIComponent(result.name));
   res.setHeader('Content-Length',String(result.bytes.length));
   for(let offset=0;offset<result.bytes.length;offset+=1024*1024)res.write(result.bytes.subarray(offset,offset+1024*1024));
   res.end();return;
  }
  res.end(JSON.stringify(result));
 }catch(error){res.statusCode=400;res.end(JSON.stringify({error:String(error.message||'Ju lutemi, provoni përsëri.')}));}
}
export default function handler(req,res){return serveCreatorShop(req,res);}

