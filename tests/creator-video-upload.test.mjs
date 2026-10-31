import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {creatorVariants,CREATOR_MEDIA_ORIGIN} from '../shared/creator-media.js';
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator-shop.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export \{.*\n/gm,'').replace(/export (async )?function /g,'$1function ').replace("await import('./heart-creator-video.js')",'({prepareCreatorVideo:prepareVideoMock})');
function setup(fail=false,{large=false,writeFailure=false}={}){
 let active=0,maxActive=0;
 const docs=new Map(),uploaded=[],published=[],file=new File([large?Buffer.alloc(2800017,91):'ORIGINAL-WITH-AUDIO'],'reel.mp4',{type:'video/mp4'});
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 const setDoc=async(path,value,options)=>{if(path.includes('/chunks/')){active++;maxActive=Math.max(active,maxActive);await new Promise(resolve=>setImmediate(resolve));active--;if(writeFailure&&path.endsWith('/002'))throw Error('Storage refused');}docs.set(path,options?.merge?{...docs.get(path),...value}:value);};
 class Image{constructor(){this.width=360;this.height=480;}async decode(){}}
 const context={drawImage(){},fillRect(){},save(){},translate(){},rotate(){},measureText:()=>({width:50}),fillText(){},restore(){}};
 const document={createElement:()=>({getContext:()=>context,toDataURL:()=> 'data:image/webp;base64,YWJj'})};
 const prepareCreatorVideo=async(input,opts)=>{assert.equal(input,file);assert.equal(opts.free,false);if(fail)throw Error('Encoding failed');return {preview:new Blob(['MARKED-PREVIEW-WITH-AUDIO'],{type:'video/mp4'}),boomerang:new Blob(['BOOMERANG'],{type:'video/mp4'}),poster:new File(['POSTER'],'poster.jpg',{type:'image/jpeg'}),duration:10};};
 const uploadCreatorMedia=async(page,id,input,displays,options)=>{uploaded.push(input);return {media:{mode:options.free?'clean':'marked',thumb:CREATOR_MEDIA_ORIGIN+'/media/social/owner/thumb.webp',medium:CREATOR_MEDIA_ORIGIN+'/media/social/owner/medium.webp',large:CREATOR_MEDIA_ORIGIN+'/media/social/owner/large.webp'}};};
 const factory=new Function('db','doc','setDoc','writeBatch','creatorCdnEnabled','uploadCreatorMedia','uploadCreatorVideo','Image','URL','document','creatorVariants','serverTimestamp','prepareVideoMock','CC_PAGES',`${source}\nreturn saveShopAsset;`);
 const save=factory({},doc,setDoc,()=>({set:(...args)=>setDoc(...args),update:(_ref,value)=>published.push(value),commit:async()=>{}}),async()=>true,uploadCreatorMedia,async prepared=>{uploaded.push(prepared.preview,prepared.boomerang);return {video:CREATOR_MEDIA_ORIGIN+'/media/stories/owner/full.mp4',boomerang:CREATOR_MEDIA_ORIGIN+'/media/stories/owner/boom.mp4'};},Image,{createObjectURL:()=> 'blob:poster',revokeObjectURL(){}},document,creatorVariants,()=>0,prepareCreatorVideo,'contentCreatorPages');
 return {save,docs,uploaded,published,file,get maxActive(){return maxActive;}};
}
test('Video upload persists byte-exact private original, marked R2 full video with audio, boomerang and poster',async()=>{
 const c=setup();await c.save('page','clip',c.file,'',{free:false});
 assert.equal(c.docs.get('contentCreatorPages/page/originals/clip/chunks/000').data,btoa('ORIGINAL-WITH-AUDIO'));
 const metadata=c.docs.get('contentCreatorPages/page/originals/clip');assert.equal(metadata.mime,'video/mp4');assert.equal(metadata.name,'reel.mp4');assert.equal(metadata.mediaType,'video');
 assert.deepEqual(await Promise.all(c.uploaded.map(file=>file.text())),['MARKED-PREVIEW-WITH-AUDIO','BOOMERANG','POSTER']);
 assert.ok([...c.docs.keys()].every(key=>!key.includes('/videoPreviews/')));
 assert.equal(c.published.length,1);assert.equal(c.published[0]['mediaTypes.clip'],'video');
 const media=c.published[0]['media.clip'];assert.equal(media.mediaType,'video');assert.equal(media.download,undefined);assert.equal(media.mode,'marked');assert.match(media.video,/media\/stories\//);assert.match(media.boomerang,/boom.mp4$/);
});
test('Failed video encoding leaves no completed preview or public video registration',async()=>{
 const c=setup(true);await assert.rejects(c.save('page','clip',c.file,'',{free:false}),/Encoding failed/);
 assert.equal(c.published.length,0);assert.equal(c.uploaded.length,0);assert.equal(c.docs.get('contentCreatorPages/page/originals/clip').videoPreview,undefined);
});

test('Large private video originals upload concurrently with a fixed bound and round-trip exact bytes',async()=>{
 const c=setup(false,{large:true});await c.save('page','clip',c.file,'',{free:false});
 const meta=c.docs.get('contentCreatorPages/page/originals/clip');
 const original=Buffer.concat(Array.from({length:meta.parts},(_,i)=>Buffer.from(c.docs.get(`contentCreatorPages/page/originals/clip/chunks/${String(i).padStart(3,'0')}`).data,'base64')));
 assert.deepEqual(original,Buffer.from(await c.file.arrayBuffer()));assert.ok(c.maxActive>1&&c.maxActive<=6);
});
test('Rejected private chunk never publishes complete original metadata or a public product video',async()=>{
 const c=setup(false,{large:true,writeFailure:true});await assert.rejects(c.save('page','clip',c.file,'',{free:false}),/Storage refused/);
 assert.equal(c.docs.has('contentCreatorPages/page/originals/clip'),false);assert.equal(c.uploaded.length,0);assert.equal(c.published.length,0);
});
