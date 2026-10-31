// Both public Heart entries must load the same Creator stylesheet. The runtime
// also repairs older cached HTML before Heart starts, without touching auth/data.
export const CREATOR_STYLE_PATH='/apps/mnyra-heart/heart-content-creator.css';
export const CREATOR_STYLE_HREF=`${CREATOR_STYLE_PATH}?v=ca941095153d`;
export function ensureCreatorStyles(document=globalThis.document){
 if(!document?.head)return null;
 const existing=document.getElementById('heart-content-creator-style')||[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.getAttribute('href')?.split('?')[0]===CREATOR_STYLE_PATH);
 const link=existing||document.createElement('link');
 link.id='heart-content-creator-style';link.rel='stylesheet';
 if(link.getAttribute('href')!==CREATOR_STYLE_HREF)link.setAttribute('href',CREATOR_STYLE_HREF);
 if(!existing)document.head.appendChild(link);
 return link;
}
