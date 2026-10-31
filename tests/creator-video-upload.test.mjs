import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {creatorVariants,CREATOR_MEDIA_ORIGIN} from '../shared/creator-media.js';
const source=(await readFile(new URL('../apps/mnyra-heart/heart-content-creator-shop.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export \{.*\n/gm,'').replace(/export (async )?function /g,'$1function ').replace("await import('./heart-creator-video.js')",'({prepareCreatorVideo:prepareVideoMock})');
function setup(fail=false){
 const docs=new Map(),uploaded=[],published=[],file=new File(['ORIGINAL-WITH-AUDIO'],'reel.mp4',{type:'video/mp4'});
 const doc=(...args)=>args.filter(x=>typeof x==='string').join('/');
 const setDoc=async(path,value,options)=>docs.set(path,options?.merge?{...docs.get(path),...value}:value);
 class Image{constructor(){this.width=360;this.height=480;}async decode(){}}
 const context={drawImage(){},fillRect(){},save(){},translate(){},rotate(){},measureText:()=>({width:50}),fillText(){},restore(){}};
 const document={createElement:()=>({getContext:()=>context,toDataURL:()=> 'data:image/webp;base64,YWJj'})};
 const prepareCreatorVideo=async(input,opts)=>{assert.equal(input,file);assert.equal(opts.free,false);if(fail)throw Error('Encoding failed');return {preview:new Blob(['MARKED-PREVIEW'],{type:'video/mp4'}),poster:new File(['POSTER'],'poster.jpg',{type:'image/jpeg'}),duration:10};};
 const uploadCreatorMedia=async(page,id,input,displays,options)=>{uploaded.push(input);return {media:{mode:options.free?'clean':'marked',thumb:CREATOR_MEDIA_ORIGIN+'/media/social/owner/thumb.webp',medium:CREATOR_MEDIA_ORIGIN+'/media/social/owner/medium.webp',large:CREATOR_MEDIA_ORIGIN+'/media/social/owner/large.webp'}};};
 const factory=new Function('db','doc','setDoc','writeBatch','creatorCdnEnabled','uploadCreatorMedia','Image','URL','document','creatorVariants','serverTimestamp','prepareVideoMock','CC_PAGES',`${source}\nreturn saveShopAsset;`);
 const save=factory({},doc,setDoc,()=>({set:(...args)=>setDoc(...args),update:(_ref,value)=>published.push(value),commit:async()=>{}}),async()=>true,uploadCreatorMedia,Image,{createObjectURL:()=> 'blob:poster',revokeObjectURL(){}},document,creatorVariants,()=>0,prepareCreatorVideo,'contentCreatorPages');
 return {save,docs,uploaded,published,file};
}
test('Video upload persists byte-exact private original, separate marked preview and only public image poster',async()=>{
 const c=setup();await c.save('page','clip',c.file,'',{free:false});
 assert.equal(c.docs.get('contentCreatorPages/page/originals/clip/chunks/000').data,btoa('ORIGINAL-WITH-AUDIO'));
 const metadata=c.docs.get('contentCreatorPages/page/originals/clip');assert.equal(metadata.mime,'video/mp4');assert.equal(metadata.name,'reel.mp4');assert.equal(metadata.videoPreview.mode,'marked');assert.equal(metadata.mediaType,'video');
 assert.ok(c.uploaded.length===1&&c.uploaded.every(file=>file.type==='image/jpeg'));
 const path=`contentCreatorPages/page/originals/clip/videoPreviews/${metadata.videoPreview.id}/chunks/000`;
 assert.equal(c.docs.get(path).data,btoa('MARKED-PREVIEW'));
 assert.equal(c.published.length,1);assert.equal(c.published[0]['mediaTypes.clip'],'video');
 const media=c.published[0]['media.clip'];assert.equal(media.mediaType,'video');assert.equal(media.download,undefined);assert.equal(media.mode,'marked');
});
test('Failed video encoding leaves no completed preview or public video registration',async()=>{
 const c=setup(true);await assert.rejects(c.save('page','clip',c.file,'',{free:false}),/Encoding failed/);
 assert.equal(c.published.length,0);assert.equal(c.uploaded.length,0);assert.equal(c.docs.get('contentCreatorPages/page/originals/clip').videoPreview,undefined);
});
