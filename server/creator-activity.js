import {validShopId} from '../shared/content-creator-shop.js';
import {creatorDay} from '../shared/creator-analytics.js';
const EVENTS=new Set(['open','scroll','photo','package','add','remove','cart','checkout','close','order','download','yes','no']);
export async function creatorActivity(input,repo,now=new Date().toISOString()){
 const {pageId,visitorId}=input;if(!validShopId(pageId)||!validShopId(visitorId))throw Error('Besuchskennung fehlt.');
 const page=await repo.read(`contentCreatorPages/${pageId}`);if(!page?.published||page.deleting===true)throw Error('Seite nicht verfügbar.');
 const path=`contentCreatorVisits/${pageId}_${visitorId}`,previous=await repo.read(path)||{};
 const event=EVENTS.has(input.event)?input.event:'';
 const data={pageId,visitorId,opened:true,scrolled:previous.scrolled===true||event==='scroll',answer:previous.answer||(['yes','no'].includes(event)?event:''),createdAt:previous.createdAt||now,updatedAt:now,stage:['page','cart','checkout','ordered'].includes(input.stage)?input.stage:previous.stage||'page',online:input.online!==false,days:[...new Set([...(previous.days||[creatorDay(previous.createdAt)]).filter(Boolean),creatorDay(now)])].slice(-366)};
 if(validShopId(input.cartId))data.cartId=input.cartId;
 const product=(page.products||[]).find(p=>p.id===input.productId);
 const file=(page.photoIds||[]).includes(input.file)?input.file:'';
 if(event){
  const entry={event,at:now,...(product?{productId:product.id,title:String(product.title).slice(0,120)}:{}),...(file?{file}:{})};
  data.events=[...(previous.events||[]),entry].slice(-100);
 }
 await repo.write(path,data);return {ok:true,answer:data.answer,scrolled:data.scrolled};
}
