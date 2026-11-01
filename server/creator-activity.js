import {validShopId,shopQuote} from '../shared/content-creator-shop.js';
import {creatorDay} from '../shared/creator-analytics.js';
const EVENTS=new Set(['open','scroll','photo','video','cover','package','add','remove','cart','checkout','close','order','download','yes','no']);
const text=(value,max=120)=>String(value||'').replace(/[\x00-\x1f<>]/g,'').trim().slice(0,max);
const number=(value,max)=>Math.min(max,Math.max(0,Math.floor(Number(value)||0)));
const safeTime=(value,fallback,now)=>Number.isFinite(Date.parse(value))&&Date.parse(value)<=Date.parse(now)+60000?new Date(value).toISOString():fallback;
function entryFor(raw,page,now,sessionId=''){
 if(!raw||!EVENTS.has(raw.event))return null;
 const product=(page.products||[]).find(p=>p.id===raw.productId);
 const file=(page.photoIds||[]).includes(raw.file)||(page.heroImages||[]).some(image=>image.id===raw.file)?raw.file:'';
 if(sessionId&&['photo','video','cover'].includes(raw.event)&&!file)return null;
 const entry={event:raw.event,at:safeTime(raw.at,now,now),...(validShopId(raw.id)?{id:raw.id}:{}),...(sessionId?{sessionId}:{}),...(product?{productId:product.id,title:text(product.title)}:{}),...(file?{file}:{})};
 if(['photo','video','cover'].includes(raw.event)){
  if(raw.durationMs!==undefined)entry.durationMs=number(raw.durationMs,86400000);entry.surface=['viewer','hero','cart','catalog'].includes(raw.surface)?raw.surface:'catalog';
  entry.mediaType=page.mediaTypes?.[file]==='video'||page.media?.[file]?.mediaType==='video'?'video':'photo';
 }
 if(['add','remove','cart','checkout','order'].includes(raw.event)&&Array.isArray(raw.ids)){
  try{const quote=raw.ids.length?shopQuote(page,raw.ids):{lines:[],totalCents:0};entry.lines=quote.lines.map(line=>({id:line.id,title:line.title,mediaCount:line.imageIds.length,priceCents:line.priceCents}));entry.files=[...new Set(quote.lines.flatMap(line=>line.imageIds))];entry.totalCents=quote.totalCents;}catch{}
 }
 return entry;
}
export async function creatorActivity(input,repo,now=new Date().toISOString()){
 const {pageId,visitorId}=input;if(!validShopId(pageId)||!validShopId(visitorId))throw Error('Besuchskennung fehlt.');
 const page=await repo.read(`contentCreatorPages/${pageId}`);if(!page?.published||page.deleting===true)throw Error('Seite nicht verfügbar.');
 const path=`contentCreatorVisits/${pageId}_${visitorId}`,previous=await repo.read(path)||{};
 const event=EVENTS.has(input.event)?input.event:'';
 const sessions=Array.isArray(previous.sessions)?[...previous.sessions]:[],raw=input.session;
 let session=null,oldSession=null;
 if(raw&&validShopId(raw.sessionId)){
  const old=sessions.find(s=>s.sessionId===raw.sessionId);oldSession=old;
  // A lifecycle request can overtake an older heartbeat. Never roll its snapshot back.
  if(old&&number(raw.sequence,1e9)<=old.sequence)return {ok:true,answer:previous.answer||'',scrolled:previous.scrolled===true};
  const elapsed=number(Date.parse(now)-Date.parse(safeTime(raw.startedAt,now,now))+60000,86400000);
  session={sessionId:raw.sessionId,sequence:number(raw.sequence,1e9),startedAt:old?.startedAt||safeTime(raw.startedAt,now,now),updatedAt:now,activeMs:number(raw.activeMs,elapsed),elapsedMs:number(raw.elapsedMs,elapsed),scrollDepth:number(raw.scrollDepth,100),stageMs:Object.fromEntries(['page','cart','checkout','ordered'].map(key=>[key,number(raw.stageMs?.[key],elapsed)])),media:[]};
  for(const item of (Array.isArray(raw.media)?raw.media:[]).slice(0,300)){
   const safe=entryFor(item,page,now,session.sessionId);if(!safe||!['photo','video','cover'].includes(safe.event))continue;
   session.media.push({...safe,views:number(item.views,10000),durationMs:number(item.durationMs,session.activeMs),completions:number(item.completions,10000)});
  }
  // A shortened unload payload must not erase media totals sent earlier.
  const mergedMedia=new Map((old?.media||[]).map(item=>[JSON.stringify([item.file,item.productId,item.surface,item.event]),item]));
  for(const item of session.media)mergedMedia.set(JSON.stringify([item.file,item.productId,item.surface,item.event]),item);
  session.media=[...mergedMedia.values()].slice(-300);
  const index=sessions.findIndex(s=>s.sessionId===session.sessionId);if(index<0)sessions.push(session);else sessions[index]=session;
 }
 const data={pageId,visitorId,opened:true,scrolled:previous.scrolled===true||event==='scroll'||(session?.scrollDepth||0)>=50,answer:previous.answer||(['yes','no'].includes(event)?event:''),createdAt:previous.createdAt||now,updatedAt:now,stage:['page','cart','checkout','ordered'].includes(input.stage)?input.stage:previous.stage||'page',online:input.online!==false,days:[...new Set([...(previous.days||[creatorDay(previous.createdAt)]).filter(Boolean),creatorDay(now)])].slice(-366)};
 if(validShopId(input.cartId))data.cartId=input.cartId;
 if(session){
  const priorCount=previous.sessionCount??(previous.sessions?.length||(previous.opened?Math.max(1,(previous.events||[]).filter(e=>e.event==='open').length):0));
  data.sessionCount=priorCount+(oldSession?0:1);
  data.activeMs=Math.max(0,(previous.activeMs||0)+session.activeMs-(oldSession?.activeMs||0));
  data.lastSeenAt=now;
  data.sessions=sessions.slice(-30);
  // Stay below Firestore's document limit even for long, busy histories.
  // Preserve old session totals when detailed media history must be bounded.
  for(const retained of data.sessions){
   if(Buffer.byteLength(JSON.stringify(data.sessions))+Buffer.byteLength(JSON.stringify(previous.events||[]))<400000)break;
   if(retained.sessionId!==session.sessionId)retained.media=[];
  }
 }
 // Location is supplied exclusively by the API's hosting headers, never by the visitor body.
 if(input.location?.country||input.location?.city)data.location={country:text(input.location.country,80),city:text(input.location.city,100),approximate:true};
 const incoming=session?[...(Array.isArray(raw.events)?raw.events:[]).slice(-150),...(Array.isArray(input.actions)?input.actions:[]).slice(-100)]:event?[{...input,at:now}]:[];
 const events=[...(previous.events||[])];
 for(const item of incoming){
  const entry=entryFor(item,page,now,session?.sessionId);if(!entry)continue;
  const index=entry.id?events.findIndex(e=>e.id===entry.id):-1;
  if(index<0)events.push(entry);else events[index]=entry;
 }
 if(incoming.length){
  data.events=events.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).slice(session?-300:-100);
  while(data.events.length>1&&Buffer.byteLength(JSON.stringify(data.events))>180000)data.events.shift();
 }
 await repo.write(path,data);return {ok:true,answer:data.answer,scrolled:data.scrolled};
}
