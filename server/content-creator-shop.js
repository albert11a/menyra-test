import {creatorActivity} from './creator-activity.js';
import {guardedCreatorWrite} from './creator-guarded-write.js';
import {creatorPublicMedia} from '../shared/creator-media.js';
import {createHash} from 'node:crypto';
import {optimizedShopImage,creatorDisplayImage} from './content-creator-images.js';
import {schluessel,zugangHolen,lies,wert,empfaenger,meldungAnlegen,schicken,zustellungAendern} from '../api/lifeskin-meldung.js';
import {CC_CARTS,CC_ORDERS,validShopId,shopQuote,shopCustomer,purchasedFiles,euro} from '../shared/content-creator-shop.js';
const BASE='https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents';
let tokenRequest;
export function encodeValue(v){if(v===null)return {nullValue:null};if(Array.isArray(v))return {arrayValue:{values:v.map(encodeValue)}};if(typeof v==='object')return {mapValue:{fields:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encodeValue(x)]))}};if(typeof v==='boolean')return {booleanValue:v};if(typeof v==='number')return {integerValue:String(v)};return {stringValue:String(v)};}
export async function shopRepository(){
 const key=schluessel();if(!key)throw Error('Shop-Zugang ist noch nicht eingerichtet.');
 const token=await (tokenRequest ||= zugangHolen(key).finally(()=>{tokenRequest=undefined;}));
 let pageGuard;
 return {
  async read(path,fields){const target=fields?.length?`${path}?${fields.map(field=>`mask.fieldPaths=${encodeURIComponent(field)}`).join('&')}`:path;const raw=await lies(target,token);const data=raw?Object.fromEntries(Object.entries(raw.fields||{}).map(([k,v])=>[k,wert(v)])):null;if(/^contentCreatorPages\/[a-f0-9]{32}$/.test(path))pageGuard={path,active:data?.published===true&&!data?.deleting};return data;},
  async write(path,data,create=false,requireExisting=false){
   if(pageGuard&&/^(contentCreatorVisits|contentCreatorCarts|contentCreatorOrders)\/[^/]+$/.test(path)){
    if(!pageGuard.active)throw Error('Diese Business-Seite ist nicht mehr verfügbar.');
    const update={update:{name:BASE.replace('https://firestore.googleapis.com/v1/','')+'/'+path,fields:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,encodeValue(v)]))},...(!create?{updateMask:{fieldPaths:Object.keys(data)}}:{}),...(create||requireExisting?{currentDocument:{exists:!create}}:{})};
    return guardedCreatorWrite({base:BASE,headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},pagePath:pageGuard.path,write:update,create,requireExisting});
   }
   const mask=create?'currentDocument.exists=false':Object.keys(data).map(k=>`updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')+(requireExisting?'&currentDocument.exists=true':'');
   const r=await fetch(`${BASE}/${path}?${mask}`,{method:'PATCH',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({fields:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,encodeValue(v)]))}),signal:AbortSignal.timeout(10000)});
   if((create&&(r.status===409||r.status===412))||(requireExisting&&[404,409,412].includes(r.status)))return false;if(!r.ok)throw Error('Speichern fehlgeschlagen.');return true;
  },
  async notify(kind,id,record){
   const fingerprint=createHash('sha256').update(record.lines.map(p=>p.id).sort().join(':')).digest('hex').slice(0,12);
   const notificationId=`cc_${kind}_${id}_${kind==='cart'?fingerprint:'order'}`;
   const payload={title:"MNYRA · Content Creator",type:`content_creator_${kind}`,text:kind==='cart'?`🛒 ${record.pageName}: Warenkorb ${euro(record.totalCents)}`:`🛍️ ${record.pageName}: Bestellung ${euro(record.totalCents)} · ${record.customer.name}`,link:'/heart/#contentCreator',source:'content-creator'};
   const results=await Promise.all((await empfaenger(token)).map(async uid=>{
    let delivery;
    try{delivery=await meldungAnlegen(uid,notificationId,payload,token);if(delivery)await schicken(uid,notificationId,payload,token,delivery);return true;}
    catch{if(delivery)await zustellungAendern(delivery.pfad,{leaseUntil:0},token).catch(()=>{});return false;}
   }));
   const ok=results.every(Boolean);
   await this.write(`${kind==='order'?CC_ORDERS:CC_CARTS}/${id}`,{notificationPending:!ok,notificationAttemptAt:new Date().toISOString()},false,true);
   return ok;
  }
 };
}
function publicOrder(order,id){return {id,pageId:order.pageId,lines:order.lines,totalCents:order.totalCents,currency:'EUR',status:order.status,approved:order.approved===true,downloadsAvailable:order.downloadsReleased===true||order.approved===true,paymentDueDate:order.paymentDueDate||'',paymentMethod:'cod',createdAt:order.createdAt};}
async function originalFile(path,metadata,repo){
 if(!Number.isSafeInteger(metadata.size)||metadata.size<1||metadata.size>30*1024*1024)throw Error('Skedari nuk është i disponueshëm.');
 const parts=[];let size=0;
 for(let start=0;start<metadata.parts;start+=8){
  const rows=await Promise.all(Array.from({length:Math.min(8,metadata.parts-start)},(_,i)=>repo.read(`${path}/chunks/${String(start+i).padStart(3,'0')}`)));
  for(const row of rows){if(!row?.data)throw Error('Shkarkimi u ndërpre.');const bytes=Buffer.from(row.data,'base64');size+=bytes.length;if(size>metadata.size)throw Error('Skedari nuk është i plotë.');parts.push(bytes);}
 }
 if(size!==metadata.size)throw Error('Skedari nuk është i plotë.');
 return {bytes:Buffer.concat(parts),mime:metadata.mime,name:metadata.name};
}
export async function shopAction(input,repo){
 const {op,pageId,cartId,orderId}=input;
 if(op==='visit')return creatorActivity(input,repo);
 if(op==='image'||op==='prepare-image'){
  if(!validShopId(pageId)||!/^[a-zA-Z0-9_-]{1,64}$/.test(String(input.file||'')))throw Error('Fotoja nuk u gjet.');
  const page=await repo.read(`contentCreatorPages/${pageId}`);
  if(!page?.published||page.deleting===true||page.kind!=='shop'||!page.photoIds?.includes(input.file))throw Error('Fotoja nuk u gjet.');
  const products=(page.products||[]).filter(p=>p.active!==false&&p.imageIds?.includes(input.file));
  if(!products.length)throw Error('Fotoja nuk u gjet.');
  const free=products.find(p=>p.priceCents===0);
  const media=creatorPublicMedia(page)[input.file];
  if(media&&op==='image')return {redirect:media[['thumb','medium','large'].includes(input.size)?input.size:'thumb']};
  if(['2','3'].includes(String(input.display))||op==='prepare-image'){
   const path=`contentCreatorPages/${pageId}/originals/${input.file}`;
   const display=await creatorDisplayImage(path,null,repo,{size:input.size,free:!!free,persist:op==='prepare-image'});
   // Explicit cache preparation only; never returns private clean variants.
   return op==='prepare-image'?{ok:true}:{bytes:display.bytes,mime:display.mime};
  }
  if(free){
   const path=`contentCreatorPages/${pageId}/originals/${input.file}`,metadata=await repo.read(path);
   if(!metadata||!Number.isInteger(metadata.parts)||metadata.parts<1||metadata.parts>100||!Number.isSafeInteger(metadata.size)||metadata.size<1||metadata.size>30*1024*1024)throw Error('Fotoja nuk u gjet.');
   const preview=await optimizedShopImage(path,metadata,repo);
   return {bytes:Buffer.from(preview.data.split(',')[1],'base64'),mime:'image/jpeg'};
  }
  const preview=await repo.read(`contentCreatorPages/${pageId}/previews/${input.file}`);
  if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(preview?.data||''))throw Error('Fotoja nuk u gjet.');
  return {bytes:Buffer.from(preview.data.split(',')[1],'base64'),mime:'image/jpeg'};
 }

 if(op==='free-download'||op==='free-image'||op==='free-preview'){
  if(!validShopId(pageId))throw Error('Pakoja nuk është e disponueshme.');
  const page=await repo.read(`contentCreatorPages/${pageId}`),quote=shopQuote(page,[input.productId]),line=quote.lines[0];
  const file=String(input.file||'');
  if(line.priceCents!==0||!line.imageIds.includes(file)||!/^[a-zA-Z0-9_-]{1,64}$/.test(file))throw Error('Ky skedar nuk është falas.');
  const publicOriginal=creatorPublicMedia(page)[file]?.download;
  if(op==='free-download'&&input.format==='file'&&publicOriginal)return {redirect:publicOriginal};
  const path=`contentCreatorPages/${pageId}/originals/${file}`,metadata=await repo.read(path,op==='free-download'?['name','mime','size','parts']:undefined);
  if(!metadata||!Number.isInteger(metadata.parts)||metadata.parts<1||metadata.parts>100||!Number.isSafeInteger(metadata.size)||metadata.size<1||metadata.size>30*1024*1024||!['image/jpeg','image/png','image/webp'].includes(metadata.mime))throw Error('Skedari nuk është i disponueshëm.');
  if(op==='free-image'||op==='free-preview'){
   const preview=await optimizedShopImage(path,metadata,repo,op==='free-preview');
   return op==='free-preview'?{data:preview.data}:{bytes:Buffer.from(preview.data.split(',')[1],'base64'),mime:'image/jpeg'};
  }
  if(input.format==='file')return originalFile(path,metadata,repo);
  if(input.part===undefined)return {name:metadata.name,mime:metadata.mime,parts:metadata.parts,size:metadata.size};
  const part=Number(input.part);if(!Number.isInteger(part)||part<0||part>=metadata.parts)throw Error('Skedari nuk është i vlefshëm.');
  const chunk=await repo.read(`${path}/chunks/${String(part).padStart(3,'0')}`);if(!chunk?.data)throw Error('Shkarkimi u ndërpre. Provoni përsëri.');return {data:chunk.data};
 }
 if(op==='receipt'||op==='download'){
  if(!validShopId(orderId))throw Error('Porosia nuk u gjet.');
  const order=await repo.read(`${CC_ORDERS}/${orderId}`);if(!order)throw Error('Porosia nuk u gjet.');
  if(op==='receipt')return publicOrder(order,orderId);
  if(order.downloadsReleased!==true&&(order.approved!==true||order.status!=='released'||order.paymentConfirmed!==true))throw Error('Shkarkimi hapet pas konfirmimit të pagesës.');
  const file=String(input.file||'');if(!/^[a-zA-Z0-9_-]{1,64}$/.test(file)||!purchasedFiles(order).includes(file))throw Error('Ky artikull nuk i përket porosisë.');
  const metadata=await repo.read(`contentCreatorPages/${order.pageId}/originals/${file}`,['name','mime','size','parts']);
  if(!metadata||!Number.isInteger(metadata.parts)||metadata.parts<1||metadata.parts>100)throw Error('Skedari nuk është i disponueshëm.');
  if(input.format==='file')return originalFile(`contentCreatorPages/${order.pageId}/originals/${file}`,metadata,repo);
  if(input.part===undefined)return {name:metadata.name,mime:metadata.mime,parts:metadata.parts,size:metadata.size};
  const part=Number(input.part);if(!Number.isInteger(part)||part<0||part>=metadata.parts)throw Error('Skedari nuk është i vlefshëm.');
  const chunk=await repo.read(`contentCreatorPages/${order.pageId}/originals/${file}/chunks/${String(part).padStart(3,'0')}`);
  if(!chunk?.data)throw Error('Shkarkimi u ndërpre. Provoni përsëri.');
  return {data:chunk.data};
 }
 if(!validShopId(pageId)||!validShopId(cartId))throw Error('Shporta nuk është e vlefshme.');
 if(op==='notify'){
  const kind=input.kind==='order'?'order':'cart',id=kind==='order'?orderId:cartId;
  if(!validShopId(id))throw Error('Kennung fehlt.');
  const record=await repo.read(`${kind==='order'?CC_ORDERS:CC_CARTS}/${id}`);
  if(!record||record.pageId!==pageId||(kind==='cart'&&(!record.lines?.length||record.status!=='active'))||Date.now()-Date.parse(record.updatedAt||record.createdAt)>86400000)return {ok:true};
  return {ok:await repo.notify(kind,id,record)};
 }
 const page=await repo.read(`contentCreatorPages/${pageId}`);
 if(!page?.published||page.deleting===true||page.kind!=='shop')throw Error('Ky dyqan nuk është i disponueshëm.');
 if(op==='checkout'){
  const cart=await repo.read(`${CC_CARTS}/${cartId}`);
  if(!cart||cart.pageId!==pageId||cart.status!=='active')return {ok:true};
  const clean=(value,max)=>String(value||'').replace(/[\x00-\x1f<>]/g,'').trim().slice(0,max);
  const customer=Object.fromEntries([['name',120],['address',300],['country',80],['phone',40]].map(([key,max])=>[key,clean(input.customer?.[key],max)]));
  await repo.write(`${CC_CARTS}/${cartId}`,{customer,checkoutAt:cart.checkoutAt||new Date().toISOString(),updatedAt:new Date().toISOString()});return {ok:true};
 }

 if(op==='cart'&&Array.isArray(input.ids)&&!input.ids.length){
  const existing=await repo.read(`${CC_CARTS}/${cartId}`);if(existing&&existing.pageId!==pageId)throw Error('Shporta nuk është e vlefshme.');
  if(existing?.status==='ordered')return {lines:[],totalCents:0,currency:'EUR'};
  await repo.write(`${CC_CARTS}/${cartId}`,{pageId,pageName:page.name,lines:[],totalCents:0,status:'empty',updatedAt:new Date().toISOString()});return {lines:[],totalCents:0,currency:'EUR'};
 }
 if(op==='order'&&validShopId(orderId)){
  const existing=await repo.read(`${CC_ORDERS}/${orderId}`);
  if(existing){if(existing.pageId!==pageId||existing.cartId!==cartId)throw Error('Porosia nuk është e vlefshme.');await repo.write(`${CC_CARTS}/${cartId}`,{status:'ordered',orderId,updatedAt:new Date().toISOString()});await repo.notify('order',orderId,existing).catch(()=>{});return publicOrder(existing,orderId);}
 }
 const quote=shopQuote(page,input.ids),now=new Date().toISOString();
 if(op==='cart'){
  const existing=await repo.read(`${CC_CARTS}/${cartId}`);
  if(existing&&existing.pageId!==pageId)throw Error('Shporta nuk është e vlefshme.');
  if(existing?.status==='ordered')return {...quote,notified:true};
  const record={pageId,pageName:page.name,...quote,...(validShopId(input.visitorId)?{visitorId:input.visitorId}:{}),status:'active',createdAt:existing?.createdAt||now,updatedAt:now};
  const added=!existing||quote.lines.some(p=>!(existing.lines||[]).some(q=>q.id===p.id));
  if(added)record.notificationPending=true;
  await repo.write(`${CC_CARTS}/${cartId}`,record);
  const notified=added?await repo.notify('cart',cartId,record).catch(()=>false):true;
  return {...quote,notified};
 }
 if(op!=='order'||!validShopId(orderId))throw Error('Kërkesa nuk është e vlefshme.');
 const existing=await repo.read(`${CC_ORDERS}/${orderId}`);
 if(existing){if(existing.pageId!==pageId||existing.cartId!==cartId)throw Error('Porosia nuk është e vlefshme.');await repo.write(`${CC_CARTS}/${cartId}`,{status:'ordered',orderId,updatedAt:new Date().toISOString()});await repo.notify('order',orderId,existing).catch(()=>{});return publicOrder(existing,orderId);}
 if(input.expectedTotalCents!==quote.totalCents)return {priceChanged:true,...quote};
 const customer=shopCustomer(input.customer);
 // Freeze original file identities; removing storefront photos never removes purchased assets.
 for(const file of purchasedFiles(quote)){const asset=await repo.read(`contentCreatorPages/${pageId}/originals/${file}`);if(!asset?.parts)throw Error('Një skedar nuk është ende gati. Ju lutemi, provoni përsëri.');}
 const monthParts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit'}).formatToParts(new Date(now));
 const year=Number(monthParts.find(p=>p.type==='year').value),month=Number(monthParts.find(p=>p.type==='month').value);
 const paymentDueDate=`${year+(month===12?1:0)}-${String(month===12?1:month+1).padStart(2,'0')}-01`;
 const order={pageId,pageName:page.name,cartId,...(validShopId(input.visitorId)?{visitorId:input.visitorId}:{}),...quote,customer,paymentMethod:'cod',status:'pending',approved:false,notificationPending:true,...(quote.totalCents>0?{downloadsReleased:true,paymentSchedule:'monthly',paymentDueDate}:{}),createdAt:now,updatedAt:now};
 const created=await repo.write(`${CC_ORDERS}/${orderId}`,order,true);
 const persisted=created?order:await repo.read(`${CC_ORDERS}/${orderId}`);
 if(!persisted||persisted.cartId!==cartId||persisted.pageId!==pageId)throw Error('Porosia nuk është e vlefshme.');
 await repo.write(`${CC_CARTS}/${cartId}`,{status:'ordered',orderId,updatedAt:now});
 const notified=await repo.notify('order',orderId,persisted).catch(()=>false);
 return {...publicOrder(persisted,orderId),notified};
}

