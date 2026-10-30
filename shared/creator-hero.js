// One crop contract for Heart's preview and the public carousel. Values from
// stored documents are bounded before they enter CSS or form controls.
export function creatorHeroFormat(page) {
  return page?.heroFormat === 'portrait' ? 'portrait' : 'landscape';
}
export function normalizeCreatorCrop(value = {}) {
  const percent=(number,fallback)=>Number.isFinite(Number(number))&&number!==null&&number!==''?Math.min(100,Math.max(0,Math.round(Number(number)))):fallback;
  return {x:percent(value?.x,50),y:percent(value?.y,30),fit:value?.fit==='contain'?'contain':'cover'};
}
export function creatorHeroCrop(page,id) { return normalizeCreatorCrop(page?.heroCrop?.[id]); }
export function creatorHeroCropStyle(crop) {
  const value=normalizeCreatorCrop(crop);
  return `object-position:${value.x}% ${value.y}%;object-fit:${value.fit}`;
}
