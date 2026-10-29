import test from 'node:test';
import assert from 'node:assert/strict';
import {shopAction,encodeValue} from '../server/content-creator-shop.js';
import {shopQuote,priceCents} from '../shared/content-creator-shop.js';
import {zipBlob,crc32} from '../shared/content-creator-zip.js';
const pageId='a'.repeat(32),cartId='b'.repeat(32),orderId='c'.repeat(32),other='d'.repeat(32);
const product={id:'pack',title:'4 Fotos',priceCents:2900,imageIds:['one','two','three','four']};
function fixture(){
 const page={published:true,kind:'shop',name:'Bistro',photoIds:product.imageIds,products:[{...product}]};
 const docs=new Map([[`contentCreatorPages/${pageId}`,page]]),notifications=[];
 for(const id of product.imageIds){docs.set(`contentCreatorPages/${pageId}/originals/${id}`,{name:id+'.jpg',mime:'image/jpeg',size:3,parts:1});docs.set(`contentCreatorPages/${pageId}/originals/${id}/chunks/000`,{data:'YWJj'});}
 const repo={read:async key=>docs.get(key)||null,write:async(key,value,create=false)=>{if(create&&docs.has(key))return false;docs.set(key,{...docs.get(key),...structuredClone(value)});return true;},notify:async(kind,id,record)=>{notifications.push({kind,id,total:record.totalCents});return true;}};
 return {page,docs,notifications,repo};
}
const customer={name:'Test Customer',address:'Teststraße 12, Prishtinë',country:'Kosovë',phone:'+38344123456'};
const request={op:'order',pageId,cartId,orderId,ids:['pack'],expectedTotalCents:2900,customer};
test('Preise werden serverseitig ermittelt, manipulierte Warenwerte nicht übernommen',async()=>{
 const f=fixture();const cart=await shopAction({op:'cart',pageId,cartId,ids:['pack'],totalCents:1},f.repo);assert.equal(cart.totalCents,2900);assert.equal(f.notifications[0].total,2900);
 const changed=await shopAction({...request,expectedTotalCents:1},f.repo);assert.equal(changed.priceChanged,true);assert.equal(f.docs.has('contentCreatorOrders/'+orderId),false);
});
test('Vier Fotos bilden einen Artikel; mehrfaches Hinzufügen wird abgelehnt',()=>{
 const f=fixture();assert.equal(shopQuote(f.page,['pack']).lines[0].imageIds.length,4);
 assert.throws(()=>shopQuote(f.page,['pack','pack']));assert.throws(()=>priceCents('.001'));assert.equal(priceCents('29,90'),2990);
});
test('Nachnahmebestellung ist unveränderlich und bei Retry idempotent',async()=>{
 const f=fixture();const first=await shopAction(request,f.repo);assert.equal(first.approved,false);assert.equal(first.paymentMethod,'cod');
 f.page.products[0].priceCents=4000;
 const retry=await shopAction(request,f.repo);assert.equal(retry.totalCents,2900);assert.equal([...f.docs.keys()].filter(k=>k.startsWith('contentCreatorOrders/')).length,1);
 await assert.rejects(shopAction({...request,cartId:other},f.repo));
});
test('Fehlende Kundenfelder und nicht fertige Originale verhindern Bestellung',async()=>{
 const f=fixture();await assert.rejects(shopAction({...request,customer:{...customer,address:''}},f.repo));
 f.docs.delete(`contentCreatorPages/${pageId}/originals/one`);await assert.rejects(shopAction(request,f.repo));
 assert.equal(f.docs.has('contentCreatorOrders/'+orderId),false);
});
test('Originale sind bis Zahlung und Freigabe gesperrt; fremde Fotos bleiben gesperrt',async()=>{
 const f=fixture();await shopAction(request,f.repo);
 const download={op:'download',orderId,file:'one'};await assert.rejects(shopAction(download,f.repo));
 const order=f.docs.get('contentCreatorOrders/'+orderId);order.approved=true;order.status='released';await assert.rejects(shopAction(download,f.repo));
 order.paymentConfirmed=true;assert.equal((await shopAction(download,f.repo)).parts,1);
 assert.equal((await shopAction({...download,part:0},f.repo)).data,'YWJj');
 await assert.rejects(shopAction({...download,file:'unknown'},f.repo));await assert.rejects(shopAction({...download,part:99},f.repo));
 // Removing the public offer never removes a buyer's original files.
 f.page.photoIds=[];f.page.products=[];assert.equal((await shopAction({...download,part:0},f.repo)).data,'YWJj');
});
test('Bestellstatus enthält keine Adresse; unbekannter Zugang ist nicht lesbar',async()=>{
 const f=fixture();await shopAction(request,f.repo);const receipt=await shopAction({op:'receipt',orderId},f.repo);
 assert.equal(receipt.customer,undefined);assert.equal(receipt.totalCents,2900);await assert.rejects(shopAction({op:'receipt',orderId:other},f.repo));
});
test('Firestore Encoder bewahrt verschachtelte Artikel und Preise',()=>{const encoded=encodeValue({lines:[{priceCents:2900}]});assert.equal(encoded.mapValue.fields.lines.arrayValue.values[0].mapValue.fields.priceCents.integerValue,'2900');});
test('ZIP enthält Originalbytes, richtige CRC32 und UTF-8-Dateinamen',async()=>{
 const bytes=new TextEncoder().encode('123456789');assert.equal(crc32(bytes),0xcbf43926);
 const zip=zipBlob([{name:'fotö.jpg',bytes}]),all=new Uint8Array(await zip.arrayBuffer()),view=new DataView(all.buffer);
 assert.equal(view.getUint32(0,true),0x04034b50);assert.equal(view.getUint16(6,true),0x800);assert.equal(view.getUint32(14,true),0xcbf43926);assert.equal(view.getUint32(all.length-22,true),0x06054b50);
 const offset=30+view.getUint16(26,true);assert.deepEqual(all.slice(offset,offset+bytes.length),bytes);
});


test('Nullpreis wird ausdrücklich akzeptiert, negative oder fehlende Preise bleiben ungültig',()=>{
 for(const value of [0,'0','0,00','0.00'])assert.equal(priceCents(value),0);
 for(const value of [-1,'-0,01','',null,undefined,'abc',10001])assert.throws(()=>priceCents(value));
 const f=fixture();f.page.products[0].priceCents=0;assert.equal(shopQuote(f.page,['pack']).totalCents,0);
 f.page.products[0].priceCents=-1;assert.throws(()=>shopQuote(f.page,['pack']));
});
test('Kostenlose Bestellung hat Warenwert null und behält die manuelle Downloadfreigabe',async()=>{
 const f=fixture();f.page.products[0].priceCents=0;
 const cart=await shopAction({op:'cart',pageId,cartId,ids:['pack']},f.repo);assert.equal(cart.totalCents,0);
 const order=await shopAction({...request,expectedTotalCents:0},f.repo);assert.equal(order.totalCents,0);assert.equal(order.approved,false);assert.ok(f.notifications.every(n=>n.total===0));
 await assert.rejects(shopAction({op:'download',orderId,file:'one'},f.repo));
});
