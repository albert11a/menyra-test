import {creatorPublicMedia} from './creator-media.js';
export const CREATOR_VIDEO_MIMES = Object.freeze(['video/mp4','video/quicktime','video/webm']);
export const CREATOR_ASSET_ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm';
export const CREATOR_VIDEO_PREVIEW_LIMIT = 48 * 1024 * 1024;
// iOS Files exports can omit the MIME or use a generic/QuickTime alias.
// Only infer a container for generic/video MIME values, never for other types.
export function creatorVideoMime(file){
 const mime=String(file?.type||'').toLowerCase().split(';')[0].trim();
 if(CREATOR_VIDEO_MIMES.includes(mime))return mime;
 if(mime&&!['application/octet-stream','video/x-quicktime','video/mov','application/quicktime'].includes(mime))return '';
 return {mov:'video/quicktime',mp4:'video/mp4',webm:'video/webm'}[String(file?.name||'').split('.').pop().toLowerCase()]||'';
}
export const creatorVideoFile = file => !!creatorVideoMime(file);
export function validateCreatorAsset(file){
 if(!file?.size)throw Error('Die Datei ist leer.');
 if(file.size>30*1024*1024)throw Error(`Die Datei ist ${(file.size/1024/1024).toFixed(1)} MB groß. Maximal 30 MB pro Datei erlaubt.`);
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)&&!creatorVideoFile(file))throw Error('Dateiformat nicht unterstützt. Bitte JPG, PNG, WebP, MP4, MOV oder WebM wählen.');
}
export function normalizeCreatorAsset(file){
 validateCreatorAsset(file);
 const mime=creatorVideoMime(file);
 return mime&&file.type!==mime?new File([file],file.name,{type:mime,lastModified:file.lastModified}):file;
}
export const creatorIsVideo = (page,id) => page?.mediaTypes?.[id]==='video'||page?.media?.[id]?.mediaType==='video';
export function creatorVideoUrl(page,id,{viewer=false}={}){const media=creatorPublicMedia(page)[id];if(media?.video&&media?.boomerang)return viewer?media.video:media.boomerang;return `/api/content-creator-shop?${new URLSearchParams({op:'video',pageId:page.id,file:id,v:String(page.updatedAt||page.createdMs||'')})}`;}
export function creatorAssetCount(page,ids){
 const videos=ids.filter(id=>creatorIsVideo(page,id)).length,photos=ids.length-videos;
 return [photos?`${photos} foto`:'',videos?`${videos} video`:''].filter(Boolean).join(' · ');
}

// Stable read-only order: keep editorial order within each media type.
export function creatorVideoFirst(page,ids=page.photoIds||[]){
 return [...ids].sort((a,b)=>Number(creatorIsVideo(page,b))-Number(creatorIsVideo(page,a)));
}
export function creatorVideoTime(value){
 const seconds=Number.isFinite(value)?Math.max(0,Math.floor(value)):0;
 return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
