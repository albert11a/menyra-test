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
