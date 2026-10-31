import {creatorPublicMedia} from './creator-media.js';
export const CREATOR_VIDEO_MIMES = Object.freeze(['video/mp4','video/quicktime','video/webm']);
export const CREATOR_ASSET_ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm';
export const CREATOR_VIDEO_PREVIEW_LIMIT = 48 * 1024 * 1024;
export const creatorVideoFile = file => CREATOR_VIDEO_MIMES.includes(String(file?.type||'').toLowerCase());
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
