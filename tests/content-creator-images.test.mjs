import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import sharp from 'sharp';
import {optimizedShopImage} from '../server/content-creator-images.js';
function fixture(bytes,path){
 const docs=new Map(),part=400000,metadata={name:'original.jpg',mime:'image/jpeg',size:bytes.length,parts:Math.ceil(bytes.length/part)};
 docs.set(path,metadata);for(let i=0;i<metadata.parts;i++)docs.set(`${path}/chunks/${String(i).padStart(3,'0')}`,{data:bytes.subarray(i*part,(i+1)*part).toString('base64')});
 let reads=0,active=0,max=0,writes=0;
 const repo={read:async key=>{reads++;active++;max=Math.max(max,active);await new Promise(r=>setImmediate(r));active--;return docs.get(key);},write:async(key,data)=>{writes++;docs.set(key,{...docs.get(key),...data});}};
 return {repo,metadata,docs,stats:()=>({reads,max,writes})};
}
test('Große Originale werden einmal verkleinert und über Instanzen hinweg als kleine Anzeige gespeichert',async()=>{
 const bytes=await sharp(randomBytes(1800*2400*3),{raw:{width:1800,height:2400,channels:3}}).jpeg({quality:96}).toBuffer();
 const path='speed-test/original';const f=fixture(bytes,path);
 const [display,same]=await Promise.all([optimizedShopImage(path,f.metadata,f.repo,true),optimizedShopImage(path,f.metadata,f.repo)]);
 assert.equal(display.data,same.data);assert.equal(f.stats().reads,f.metadata.parts);assert.ok(f.stats().max<=8);assert.equal(f.stats().writes,1);
 const output=Buffer.from(display.data.split(',')[1],'base64'),meta=await sharp(output).metadata();
 assert.ok(meta.width<=1200&&meta.height<=1200);assert.ok(output.length<bytes.length/4);assert.ok(display.data.length<500000);
 const before=f.stats().reads;assert.equal((await optimizedShopImage(path,f.docs.get(path),f.repo)).data,display.data);assert.equal(f.stats().reads,before);
 assert.equal(f.docs.get(path).size,bytes.length);
});
test('Kleine Hochformatbilder bleiben vollständig und werden nicht zugeschnitten',async()=>{
 const bytes=await sharp({create:{width:80,height:120,channels:3,background:'#aabbcc'}}).jpeg().toBuffer();const f=fixture(bytes,'portrait');
 const image=await optimizedShopImage('portrait',f.metadata,f.repo),meta=await sharp(Buffer.from(image.data.split(',')[1],'base64')).metadata();
 assert.equal(meta.width,80);assert.equal(meta.height,120);assert.equal(f.stats().writes,0);
});
test('Unvollständiges Original kann nach Behebung erneut geladen werden',async()=>{
 const bytes=await sharp({create:{width:30,height:40,channels:3,background:'white'}}).jpeg().toBuffer(),path='retry-image';const f=fixture(bytes,path),key=`${path}/chunks/000`,chunk=f.docs.get(key);f.docs.delete(key);
 await assert.rejects(optimizedShopImage(path,f.metadata,f.repo,true),/nicht|plotë/);assert.equal(f.stats().writes,0);
 f.docs.set(key,chunk);assert.match((await optimizedShopImage(path,f.metadata,f.repo,true)).data,/^data:image\/jpeg;base64,/);assert.equal(f.stats().writes,1);
});

const {creatorDisplayImage}=await import('../server/content-creator-images.js');
const {shopAction}=await import('../server/content-creator-shop.js');
test('Prepared mobile derivatives are small, persistent and read without original chunks',async()=>{
 const bytes=await sharp({create:{width:1600,height:2200,channels:3,background:'#3a5544'}}).jpeg().toBuffer(),path='display-v2/original',f=fixture(bytes,path);
 const thumb=await creatorDisplayImage(path,f.metadata,f.repo,{free:true,persist:true});
 assert.equal(thumb.mime,'image/webp');const metadata=await sharp(thumb.bytes).metadata();assert.ok(metadata.width===640&&metadata.height<=960);assert.ok(thumb.bytes.length<30000);assert.equal(f.stats().writes,3);
 const saved=f.docs.get(path),before=f.stats().reads;
 const marked=await creatorDisplayImage(path,saved,f.repo,{free:false,size:'medium'});
 assert.equal(f.stats().reads,before+1);assert.equal(f.stats().writes,3);assert.ok(marked.bytes.length<100000);
 assert.notDeepEqual(marked.bytes,Buffer.from(f.docs.get(path+'/displays/medium').clean.split(',')[1],'base64'));
 const again=await creatorDisplayImage(path,saved,f.repo,{free:true,persist:true});assert.deepEqual(again.bytes,thumb.bytes);assert.equal(f.stats().writes,3);
});
test('Display preparation cannot expose paid clean images or bypass publication and membership checks',async()=>{
 const pageId='a'.repeat(32),file='sensitive',path=`contentCreatorPages/${pageId}/originals/${file}`;
 const bytes=await sharp({create:{width:500,height:700,channels:3,background:'#cbbda8'}}).jpeg().toBuffer(),f=fixture(bytes,path);
 const page={published:true,kind:'shop',photoIds:[file],products:[{id:'paid',priceCents:190,imageIds:[file]}]},baseRead=f.repo.read;
 f.repo.read=async(key,fields)=>key===`contentCreatorPages/${pageId}`?page:baseRead(key,fields);
 const result=await shopAction({op:'prepare-image',pageId,file},f.repo);assert.deepEqual(result,{ok:true});
 const before=f.stats().reads;
 const paid=await shopAction({op:'image',pageId,file,display:'2',size:'thumb'},f.repo);
 assert.equal(f.stats().reads,before+1);assert.equal(paid.bytes.toString('base64'),f.docs.get(path+'/displays/thumb').marked.split(',')[1]);
 page.products[0].priceCents=0;
 const free=await shopAction({op:'image',pageId,file,display:'2'},f.repo);assert.notDeepEqual(paid.bytes,free.bytes);
 page.products[0].active=false;await assert.rejects(shopAction({op:'prepare-image',pageId,file},f.repo));
 page.products[0].active=true;page.published=false;await assert.rejects(shopAction({op:'image',pageId,file,display:'2'},f.repo));
});

test('High quality displays use original pixels even when a low resolution compressed preview exists',async()=>{
 const bytes=await sharp({create:{width:1500,height:2000,channels:3,background:'#1525de'}}).png().toBuffer(),path='original-quality-contract',f=fixture(bytes,path);
 const red=await sharp({create:{width:40,height:50,channels:3,background:'#ef2311'}}).jpeg({quality:35}).toBuffer();
 f.metadata.cleanPreview={version:1,data:'data:image/jpeg;base64,'+red.toString('base64')};
 const result=await creatorDisplayImage(path,f.metadata,f.repo,{size:'medium',free:true,persist:true});
 const {data,info}=await sharp(result.bytes).raw().toBuffer({resolveWithObject:true});assert.equal(info.width,1280);assert.ok(data[2]>180&&data[0]<60);assert.ok(f.stats().reads>=f.metadata.parts);
 assert.equal(f.docs.get(path+'/displays/medium').width,1280);assert.equal(f.docs.get(path+'/displays/thumb').width,640);
});

test('Detailed PNG originals fit every persisted display budget without rejecting the upload',async()=>{
 const bytes=await sharp(randomBytes(1600*2200*3),{raw:{width:1600,height:2200,channels:3}}).png().toBuffer();
 const path='detailed-png-budget',f=fixture(bytes,path),before=Buffer.from(bytes);
 const display=await creatorDisplayImage(path,f.metadata,f.repo,{size:'large',free:true,persist:true});
 assert.ok(display.bytes.length>1000);assert.equal(f.stats().writes,3);
 for(const size of ['thumb','medium','large']){
  const record=f.docs.get(path+'/displays/'+size);assert.ok(JSON.stringify(record).length<=950000);
  assert.ok(record.width>=480);assert.ok((await sharp(Buffer.from(record.clean.split(',')[1],'base64')).metadata()).width===record.width);
 }
 assert.deepEqual(bytes,before);assert.equal(f.docs.get(path).size,before.length);
});
