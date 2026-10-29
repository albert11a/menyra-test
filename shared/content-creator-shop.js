export const CC_CARTS='contentCreatorCarts';
export const CC_ORDERS='contentCreatorOrders';
export const euro=cents=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format((Number(cents)||0)/100);
export const validShopId=id=>typeof id==='string'&&/^[a-f0-9]{32}$/.test(id);
export function priceCents(value){const n=Number(String(value??'').trim().replace(',','.'));if(!String(value??'').trim()||!Number.isFinite(n)||n<0||n>10000)throw Error('Bitte einen Preis zwischen 0 und 10.000 € angeben.');const cents=Math.round(n*100);if(n>0&&cents<1)throw Error("Der Mindestpreis ist 0,01 €.");return cents;}
export function shopQuote(page,ids){
 if(!page?.published||page.kind!=='shop')throw Error('Ky dyqan nuk është i disponueshëm.');
 if(!Array.isArray(ids)||!ids.length||ids.length>10||new Set(ids).size!==ids.length)throw Error('Shporta nuk është e vlefshme.');
 const lines=ids.map(id=>{
  const product=(page.products||[]).find(p=>p.id===id&&p.active!==false);
  const images=(page.photoIds||[]).filter(key=>product?.imageIds?.includes(key));
  if(!product||!Number.isSafeInteger(product.priceCents)||product.priceCents<0||product.priceCents>1000000||!images.length)throw Error('Një pako nuk është më e disponueshme.');
  return {id,title:String(product.title||'Pako fotosh').slice(0,120),priceCents:product.priceCents,imageIds:images};
 });
 if(new Set(lines.flatMap(p=>p.imageIds)).size>30)throw Error('Shporta është shumë e madhe.');
 return {lines,totalCents:lines.reduce((sum,p)=>sum+p.priceCents,0),currency:'EUR'};
}
export function shopCustomer(input){
 const clean=(v,max)=>String(v||'').replace(/[\x00-\x1f<>]/g,'').trim().slice(0,max);
 const customer={name:clean(input?.name,120),address:clean(input?.address,300),country:clean(input?.country,80),phone:clean(input?.phone,40)};
 if(customer.name.length<3||customer.address.length<5||customer.country.length<2||!/^\+?[\d\s().-]{6,40}$/.test(customer.phone))throw Error('Plotësoni emrin, adresën, shtetin dhe numrin e telefonit.');
 return customer;
}
export function purchasedFiles(order){return [...new Set((order.lines||[]).flatMap(line=>line.imageIds||[]))];}

export function initialShopProduct(state,imageIds){return {id:crypto.randomUUID().replaceAll('-',''),title:String(state.shopTitle||'Pako fotosh').slice(0,120),priceCents:priceCents(state.shopPrice),imageIds,active:true};}

