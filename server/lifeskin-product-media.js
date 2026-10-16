// Public product media only. Customer photos, sessions and reports are never queried.
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {SHOP_CONFIG_BASE,firestoreFields} from '../shared/lifeskin-shop-first-render.js';

export const PRODUCT_ASSETS = Object.freeze({
  'lf-acne':['lf-acne-3.jpg','lf-acne-2.jpg','produkt-lf-acne.jpg'],
  'lf-moistur':['lf-moistur.jpg','produkt-lf-moistur.jpg'],
  'lf-pore':['lf-pore.jpg'], 'lf-pigment':['lf-pigment.jpg']
});
export const MEDIA_SOURCES = Object.freeze({landing:['landingFotot-','fotot'],analysis:['analyseFotot-','bilder'],shop:['shopProduktFoto-','foto']});
const cache=new Map(), pending=new Map();let cacheBytes=0;
const TTL=60000, MAX_BYTES=16*1024*1024;
export const validProductId=id=>/^[\w-]{1,40}$/.test(id);
export function mediaValue(value) {
  if (typeof value!=='string') return null;
  const data=/^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/i.exec(value);
  if(data) {const buffer=Buffer.from(data[1],'base64');return buffer.length?{buffer}:null;}
  return /^https:\/\/[^\s<>"']+$/i.test(value)?{url:value}:null;
}
export const mediaVersion=value=>createHash('sha256').update(value.buffer||value.url).digest('hex').slice(0,24);
async function readDocument(collection,id,fields,fetchFn) {
  const root=SHOP_CONFIG_BASE.replace(/\/config$/,'');
  const url=`${root}/${collection}/${encodeURIComponent(id)}?${fields.map(f=>`mask.fieldPaths=${f}`).join('&')}`;
  const run=async()=>{const r=await fetchFn(url,{signal:AbortSignal.timeout(4000)});if(r.status===404)return null;if(!r.ok)throw Error(`Public media ${r.status}`);return firestoreFields((await r.json()).fields);};
  if(fetchFn!==fetch)return run(); // injected readers stay isolated in tests
  const hit=cache.get(url);if(hit&&hit.until>Date.now())return hit.data;
  if(pending.has(url))return pending.get(url);
  const request=run().then(data=>{
    const bytes=JSON.stringify(data).length;
    if(cache.has(url)){cacheBytes-=cache.get(url).bytes;cache.delete(url);}
    while(cache.size&&(cache.size>=64||cacheBytes+bytes>MAX_BYTES)){const key=cache.keys().next().value;cacheBytes-=cache.get(key).bytes;cache.delete(key);}
    if(bytes<=MAX_BYTES){cache.set(url,{data,bytes,until:Date.now()+TTL});cacheBytes+=bytes;}
    return data;
  }).finally(()=>pending.delete(url));pending.set(url,request);return request;
}
export async function readProduct(id,fetchFn=fetch) {
  return validProductId(id)?readDocument('products',id,['photoRef','availability'],fetchFn):null;
}
async function sourceDocument(id,source,fetchFn) {
  const [prefix,field]=MEDIA_SOURCES[source];
  return readDocument('config',prefix+id,[field],fetchFn);
}
async function assetValue(id,index) {
  const file=PRODUCT_ASSETS[id]?.[index];if(!file)return null;
  try{return {buffer:await readFile(new URL(`../apps/lifeskin-shop/assets/${file}`,import.meta.url))};}catch{return null;}
}
export function collectMedia(id,product,documents={},assets=[]) {
  const values=[];
  const add=(value,source,index=0)=>{const media=value?.buffer?value:mediaValue(value);if(media)values.push({...media,source,index,version:mediaVersion(media)});};
  add(product.photoRef,'primary');
  // Keep the same fallback as the card endpoint before including additional galleries.
  if(!values.length&&assets[0])add(assets[0],'asset',0);
  for(const [source,[,field]] of Object.entries(MEDIA_SOURCES)) {
    const value=documents[source]?.[field];
    (Array.isArray(value)?value:[value]).forEach((v,i)=>add(v,source,i));
  }
  assets.forEach((v,i)=>add(v,'asset',i));
  const seen=new Set();return values.filter(v=>{if(seen.has(v.version))return false;seen.add(v.version);return true;});
}
export async function loadProductMedia(id,fetchFn=fetch,{assets=true}={}) {
  if(!validProductId(id))return null;
  const product=await readProduct(id,fetchFn);
  if(!product)return null;if(product.availability==='hidden')return {hidden:true};
  let partial=false;
  const docs=await Promise.all(Object.keys(MEDIA_SOURCES).map(async source=>{
    try{return [source,await sourceDocument(id,source,fetchFn)];}catch{partial=true;return [source,null];}
  }));
  const local=assets?await Promise.all((PRODUCT_ASSETS[id]||[]).map((_,i)=>assetValue(id,i))):[];
  return {partial,images:collectMedia(id,product,Object.fromEntries(docs),local)};
}
export function mediaUrl(id,entry,width=480) {
  return `/api/lifeskin-product-photo?id=${encodeURIComponent(id)}&source=${entry.source}&index=${entry.index}&v=${entry.version}&w=${width}`;
}
export async function resolveProductMedia(id,source='primary',index=0,fetchFn=fetch) {
  if(!validProductId(id)||!Number.isInteger(index)||index<0||index>31)return null;
  const product=await readProduct(id,fetchFn);
  if(!product)return null;if(product.availability==='hidden')return {hidden:true};
  if(source==='primary') {
    const first=mediaValue(product.photoRef);if(first)return first;
    const fallback=await assetValue(id,0);if(fallback)return fallback;
    // Products without a primary photo can still have Heart galleries.
    for(const key of Object.keys(MEDIA_SOURCES)) {const doc=await sourceDocument(id,key,fetchFn);const field=MEDIA_SOURCES[key][1];const value=doc?.[field];const first=mediaValue(Array.isArray(value)?value[0]:value);if(first)return first;}
    return {placeholder:true};
  }
  if(source==='asset')return assetValue(id,index);
  if(!Object.hasOwn(MEDIA_SOURCES,source))return null;
  const doc=await sourceDocument(id,source,fetchFn), value=doc?.[MEDIA_SOURCES[source][1]];
  return mediaValue(Array.isArray(value)?value[index]:index===0?value:null);
}
