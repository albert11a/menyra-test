import {shopRepository,shopAction} from '../server/content-creator-shop.js';
export async function serveCreatorShop(req,res,repository=shopRepository){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(!['POST','GET'].includes(req.method)){res.statusCode=405;res.end('{}');return;}
 try{
  const url=new URL(req.url||'/','https://www.mnyra.com');
  let input=req.method==='GET'?Object.fromEntries(url.searchParams):req.body;
  if(typeof input==='string')input=JSON.parse(input);if(!input||typeof input!=='object')throw Error('Kërkesa mungon.');
  if(req.method==='GET'&&!['receipt','download'].includes(input.op))throw Error('Kërkesa nuk lejohet.');
  const result=await shopAction(input,await repository());res.statusCode=200;res.end(JSON.stringify(result));
 }catch(error){res.statusCode=400;res.end(JSON.stringify({error:String(error.message||'Ju lutemi, provoni përsëri.')}));}
}
export default function handler(req,res){return serveCreatorShop(req,res);}
