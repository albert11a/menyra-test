import {createHash} from 'node:crypto';
import {optimizedShopImage} from './content-creator-images.js';
import {schluessel,zugangHolen,lies,wert,empfaenger,meldungAnlegen,schicken,zustellungAendern} from '../api/lifeskin-meldung.js';
import {CC_CARTS,CC_ORDERS,validShopId,shopQuote,shopCustomer,purchasedFiles,euro} from '../shared/content-creator-shop.js';
const BASE='https://firestore.googleapis.com/v1/projects/menyra-c0e68/databases/(default)/documents';
let tokenRequest;
export function encodeValue(v){if(v===null)return {nullValue:null};if(Array.isArray(v))return {arrayValue:{values:v.map(encodeValue)}};if(typeof v==='object')return {mapValue:{fields:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encodeValue(x)]))}};if(typeof v==='boolean')return {booleanValue:v};if(typeof v==='number')return {integerValue:String(v)};return {stringValue:String(v)};}
export async function shopRepository(){
 const key=schluessel();if(!key)throw Error('Shop-Zugang ist noch nicht eingerichtet.');
 const token=await (tokenRequest ||= zugangHolen(key).finally(()=>{tokenRequest=undefined;}));
 return {
  async read(path,fields){const target=fields?.length?`${path}?${fields.map(field=>`mask.fieldPaths=${encodeURIComponent(field)}`).join('&')}`:path;const raw=await lies(target,token);return raw?Object.fromEntries(Object.entries(raw.fields||{}).map(([k,v])=>[k,wert(v)])):null;},
  async write(path,data,create=false){
   const mask=create?'currentDocument.exists=false':Object.keys(data).map(k=>`updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
   const r=await fetch(`${BASE}/${path}?${mask}`,{method:'PATCH',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({fields:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,encodeValue(v)]))}),signal:AbortSignal.timeout(10000)});
   if(create&&(r.status===409||r.status===412))return false;if(!r.ok)throw Error('Speichern fehlgeschlagen.');return true;
  },
  async notify(kind,id,record){
   const fingerprint=createHash('sha256').update(record.lines.map(p=>p.id).sort().join(':')).digest('hex').slice(0,12);
   const notificationId=`cc_${kind}_${id}_${kind==='cart'?fingerprint:'order'}`;
   const payload={title:"MNYRA · Content Creator",type:`content_creator_${kind}`,text:kind==='cart'?`🛒 ${record.pageName}: Warenkorb ${euro(record.totalCents)}`:`🛍️ ${record.pageName}: Bestellung ${euro(record.totalCents)} · ${record.customer.name}`,link:'/heart/#contentCreator',source:'content-creator'};
   let ok=true;
   for(const uid of await empfaenger(token)){
    let delivery;
    try{delivery=await meldungAnlegen(uid,notificationId,payload,token);if(delivery)await schicken(uid,notificationId,payload,token,delivery);}
    catch{ok=false;if(delivery)await zustellungAendern(delivery.pfad,{leaseUntil:0},token).catch(()=>{});}
   }
   return ok;
  }
 };
}
function publicOrder(order,id){return {id,pageId:order.pageId,lines:order.lines,totalCents:order.totalCents,currency:'EUR',status:order.status,approved:order.approved===true,paymentMethod:'cod',createdAt:order.createdAt};}
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
 if(op==='image'){
  if(!validShopId(pageId)||!/^[a-zA-Z0-9_-]{1,64}$/.test(String(input.file||'')))throw Error('Fotoja nuk u gjet.');
  const page=await repo.read(`contentCreatorPages/${pageId}`);
  if(!page?.published||page.kind!=='shop'||!page.photoIds?.includes(input.file))throw Error('Fotoja nuk u gjet.');
  const products=(page.products||[]).filter(p=>p.active!==false&&p.imageIds?.includes(input.file));
  if(!products.length)throw Error('Fotoja nuk u gjet.');
  const free=products.find(p=>p.priceCents===0);
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
  if(order.approved!==true||order.status!=='released'||order.paymentConfirmed!==true)throw Error('Shkarkimi hapet pas konfirmimit të pagesës.');
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
  if(!record||record.pageId!==pageId||(kind==='cart'&&(!record.lines?.length||record.status!=='active'))||Date.now()-Date.parse(record.updatedAt||record.createdAt)>120000)return {ok:true};
  return {ok:await repo.notify(kind,id,record)};
 }
 const page=await repo.read(`contentCreatorPages/${pageId}`);
 if(!page?.published||page.kind!=='shop')throw Error('Ky dyqan nuk është i disponueshëm.');
 if(op==='cart'&&Array.isArray(input.ids)&&!input.ids.length){
  const existing=await repo.read(`${CC_CARTS}/${cartId}`);if(existing&&existing.pageId!==pageId)throw Error('Shporta nuk është e vlefshme.');
  await repo.write(`${CC_CARTS}/${cartId}`,{pageId,pageName:page.name,lines:[],totalCents:0,status:'empty',updatedAt:new Date().toISOString()});return {lines:[],totalCents:0,currency:'EUR'};
 }
 if(op==='order'&&validShopId(orderId)){
  const existing=await repo.read(`${CC_ORDERS}/${orderId}`);
  if(existing){if(existing.pageId!==pageId||existing.cartId!==cartId)throw Error('Porosia nuk është e vlefshme.');await repo.notify('order',orderId,existing).catch(()=>{});return publicOrder(existing,orderId);}
 }
 const quote=shopQuote(page,input.ids),now=new Date().toISOString();
 if(op==='cart'){
  const existing=await repo.read(`${CC_CARTS}/${cartId}`);
  if(existing&&existing.pageId!==pageId)throw Error('Shporta nuk është e vlefshme.');
  const record={pageId,pageName:page.name,...quote,status:'active',createdAt:existing?.createdAt||now,updatedAt:now};
  await repo.write(`${CC_CARTS}/${cartId}`,record);
  const added=!existing||quote.lines.some(p=>!(existing.lines||[]).some(q=>q.id===p.id));
  const notified=added?await repo.notify('cart',cartId,record).catch(()=>false):true;
  return {...quote,notified};
 }
 if(op!=='order'||!validShopId(orderId))throw Error('Kërkesa nuk është e vlefshme.');
 const existing=await repo.read(`${CC_ORDERS}/${orderId}`);
 if(existing){if(existing.pageId!==pageId||existing.cartId!==cartId)throw Error('Porosia nuk është e vlefshme.');await repo.notify('order',orderId,existing).catch(()=>{});return publicOrder(existing,orderId);}
 if(input.expectedTotalCents!==quote.totalCents)return {priceChanged:true,...quote};
 const customer=shopCustomer(input.customer);
 // Freeze original file identities; removing storefront photos never removes purchased assets.
 for(const file of purchasedFiles(quote)){const asset=await repo.read(`contentCreatorPages/${pageId}/originals/${file}`);if(!asset?.parts)throw Error('Një skedar nuk është ende gati. Ju lutemi, provoni përsëri.');}
 const order={pageId,pageName:page.name,cartId,...quote,customer,paymentMethod:'cod',status:'pending',approved:false,createdAt:now,updatedAt:now};
 const created=await repo.write(`${CC_ORDERS}/${orderId}`,order,true);
 const persisted=created?order:await repo.read(`${CC_ORDERS}/${orderId}`);
 if(!persisted||persisted.cartId!==cartId||persisted.pageId!==pageId)throw Error('Porosia nuk është e vlefshme.');
 await repo.write(`${CC_CARTS}/${cartId}`,{status:'ordered',orderId,updatedAt:now});
 const notified=await repo.notify('order',orderId,persisted).catch(()=>false);
 return {...publicOrder(persisted,orderId),notified};
}

