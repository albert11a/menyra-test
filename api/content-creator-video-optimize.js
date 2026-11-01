import {isCreatorResetAdmin} from '../server/creator-reset.js';
import {optimizeCreatorVideo} from '../server/creator-video-optimize.js';

export async function serveCreatorVideoOptimize(req,res,{authorize=isCreatorResetAdmin,optimize=optimizeCreatorVideo}={}){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='POST'){res.setHeader('Allow','POST');res.statusCode=405;res.end('{}');return;}
 try{
  if(!await authorize(req)){res.statusCode=403;res.end(JSON.stringify({error:'Bitte mit deinem CEO-Konto anmelden.'}));return;}
  const input=typeof req.body==='string'?JSON.parse(req.body):req.body;
  const token=/^Bearer\s+(.+)$/i.exec(String(req.headers?.authorization||''))?.[1];
  const result=await optimize(input,token);res.statusCode=200;res.end(JSON.stringify(result));
 }catch(error){console.error('creator_video_optimization_failed',{name:error.name||'Error',code:error.code||'',message:String(error.message||'').slice(0,180)});res.statusCode=400;res.end(JSON.stringify({error:'Video konnte nicht optimiert werden. Die bisherige Vorschau bleibt verfügbar.'}));}
}
export default function handler(req,res){return serveCreatorVideoOptimize(req,res);}
