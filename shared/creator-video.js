export const CREATOR_VIDEO_MIMES = Object.freeze(['video/mp4','video/quicktime','video/webm']);
export const CREATOR_ASSET_ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm';
export const CREATOR_VIDEO_PREVIEW_LIMIT = 4 * 1024 * 1024;
export const creatorVideoFile = file => CREATOR_VIDEO_MIMES.includes(String(file?.type||'').toLowerCase());
export const creatorIsVideo = (page,id) => page?.mediaTypes?.[id]==='video'||page?.media?.[id]?.mediaType==='video';
export function creatorVideoUrl(page,id){return `/api/content-creator-shop?${new URLSearchParams({op:'video',pageId:page.id,file:id,v:String(page.updatedAt||page.createdMs||'')})}`;}
export function creatorAssetCount(page,ids){
 const videos=ids.filter(id=>creatorIsVideo(page,id)).length,photos=ids.length-videos;
 return [photos?`${photos} foto`:'',videos?`${videos} video`:''].filter(Boolean).join(' · ');
}
