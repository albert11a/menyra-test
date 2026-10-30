import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {creatorVariants,creatorPublicMedia,CREATOR_MEDIA_ORIGIN} from '../shared/creator-media.js';
const pageId='a'.repeat(32);
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator-shop.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export \{.*\n/gm,'').replace(/export (async )?function /g,'$1function ');
function setup({failSecond=false,archived=false}={}){
 const page={kind:'shop',published:true,photoIds:['one','two'],products:[{id:'pack',priceCents:100,imageIds:['one','two']}]};
 const docs=new Map([[`contentCreatorPages/${pageId}`,page]]);
 for(const id of ['one','two',...(archived?['archived']:[])]){
  docs.set(`contentCreatorPages/${pageId}/originals/${id}`,{parts:1,name:`${id}.jpg`,mime:'image/jpeg',size:8});
  docs.set(`contentCreatorPages/${pageId}/originals/${id}/chunks/000`,{data:btoa('original')});
  docs.set(`contentCreatorPages/${pageId}/images/${id}`,{data:'data:image/jpeg;base64,bGVnYWN5',caption:'Keep this caption'});
 }
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 function update(path,data){const record={...docs.get(path)};for(const [key,value] of Object.entries(data)){if(key.startsWith('media.'))record.media={...record.media,[key.slice(6)]:value};else record[key]=value;}docs.set(path,record);}
 const writeBatch=()=>{const operations=[];return {set:(path,data)=>operations.push(()=>update(path,data)),update:(path,data)=>operations.push(()=>update(path,data)),commit:async()=>{for(const op of operations)op();}};};
 let fail=failSecond;const uploads=[];
 const upload=async(pid,id,file,displays,options)=>{
  if(fail&&id==='two')throw Error('Upload interrupted');
  assert.equal(await file.text(),'original');assert.deepEqual(Object.keys(displays),['thumb','medium','large']);uploads.push(id);
  const media={mode:options.free?'clean':'marked',bytes:file.size};
  for(const size of ['thumb','medium','large'])media[size]=`${CREATOR_MEDIA_ORIGIN}/media/creator-public/${pid}/${id}/revision_${size}.webp`;
  return {media,original:{key:`creator-private/${pid}/${id}/revision.jpg`,name:file.name,mime:file.type,size:file.size}};
 };
 const context={save(){},restore(){},translate(){},rotate(){},measureText:()=>({width:40}),fillText(){},fillRect(){},drawImage(){}};
 const document={createElement:()=>({getContext:()=>context,toDataURL:()=> 'data:image/webp;base64,YWJj'})};
 class Image{constructor(){this.width=100;this.height=150;}async decode(){}}
 const factory=new Function('db','doc','getDoc','getDocs','collection','setDoc','updateDoc','serverTimestamp','writeBatch','CC_PAGES','CC_ORDERS','creatorCdnEnabled','uploadCreatorMedia','readCreatorOriginal','creatorVariants','creatorPublicMedia','Image','document',`${source}\nreturn {migrateCreatorPage,saveCreatorCdnAsset};`);
 const api=factory({},doc,async path=>({data:()=>docs.get(path)}),async path=>({docs:[...docs].filter(([key])=>key.startsWith(path+'/')&&key.slice(path.length+1).indexOf('/')<0).map(([key,data])=>({id:key.split('/').at(-1),data:()=>data}))}),doc,async(path,data)=>update(path,data),async(path,data)=>update(path,data),()=> 'now',writeBatch,'contentCreatorPages','contentCreatorOrders',async()=>true,upload,async record=>new File(['original'],record.name,{type:record.mime}),creatorVariants,creatorPublicMedia,Image,document);
 return {api,docs,uploads,setFailure:value=>{fail=value;}};
}
test('Existing assets migrate without re-upload, preserve original chunks/captions, and resume a partial failure',async()=>{
 const ctx=setup({failSecond:true});
 await assert.rejects(ctx.api.migrateCreatorPage(pageId),/interrupted/);
 assert.deepEqual(ctx.uploads,['one']);assert.ok(ctx.docs.get(`contentCreatorPages/${pageId}`).media.one);
 assert.equal(ctx.docs.get(`contentCreatorPages/${pageId}/images/one`).caption,'Keep this caption');
 assert.equal(ctx.docs.get(`contentCreatorPages/${pageId}/images/one`).data,'data:image/jpeg;base64,bGVnYWN5');
 assert.equal(ctx.docs.get(`contentCreatorPages/${pageId}/originals/one/chunks/000`).data,btoa('original'));
 ctx.setFailure(false);await ctx.api.migrateCreatorPage(pageId);
 assert.deepEqual(ctx.uploads,['one','two']);assert.equal(ctx.docs.get(`contentCreatorPages/${pageId}`).cdnMigrationVersion,1);
 await ctx.api.migrateCreatorPage(pageId);assert.deepEqual(ctx.uploads,['one','two']);
});
test('Archived original files retained for previous paid orders migrate too',async()=>{
 const ctx=setup({archived:true});await ctx.api.migrateCreatorPage(pageId);
 assert.deepEqual(ctx.uploads,['one','two','archived']);assert.ok(ctx.docs.get(`contentCreatorPages/${pageId}/originals/archived`).r2);
 assert.equal(creatorPublicMedia(ctx.docs.get(`contentCreatorPages/${pageId}`)).archived,undefined);
});
test('A failed upload never replaces a manifest or private original pointer',async()=>{
 const ctx=setup({failSecond:true}),before=structuredClone(ctx.docs.get(`contentCreatorPages/${pageId}`));
 await assert.rejects(ctx.api.saveCreatorCdnAsset(pageId,'two',new File(['original'],'two.jpg',{type:'image/jpeg'})),/interrupted/);
 assert.deepEqual(ctx.docs.get(`contentCreatorPages/${pageId}`),before);assert.equal(ctx.docs.get(`contentCreatorPages/${pageId}/originals/two`).r2,undefined);
});
