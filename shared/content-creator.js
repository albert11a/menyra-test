import {creatorMediaUrl} from './creator-media.js';
import {creatorDirectPath, CREATOR_DIRECT_ROUTES} from './creator-direct-routes.js';
export const CC_PAGES = "contentCreatorPages";
export const CC_VISITS = "contentCreatorVisits";
export const CC_FILTERS = Object.freeze([
  ["all", "Alle"], ["working", "In Arbeit"], ["ready", "Fertig"],
  ["sent", "Verschickt"], ["opened", "Geöffnet"], ["yes", "Ja"], ["no", "Nein"]
]);
export function contentStatus(page, visits = []) {
  const replies = visits.filter(v => ["yes", "no"].includes(v.answer));
  const time = value => typeof value?.toMillis === "function" ? value.toMillis() : Date.parse(value || "") || 0;
  const latest = replies.reduce((last,v) => !last || time(v.updatedAt) >= time(last.updatedAt) ? v : last, null);
  if (latest) return latest.answer;
  if (visits.some(v => v.opened)) return "opened";
  return ["working", "ready", "sent"].includes(page.workflow) ? page.workflow : "working";
}
export function contentRows(pages = [], visits = []) {
  const grouped = new Map();
  for (const v of visits) { if (!grouped.has(v.pageId)) grouped.set(v.pageId, []); grouped.get(v.pageId).push(v); }
  return pages.map(page => {
    const events = grouped.get(page.id) || [];
    const status = contentStatus(page, events);
    return { ...page, status, opened: events.some(v => v.opened),
      scrolled: events.some(v => v.scrolled), yes: status === "yes", no: status === "no" };
  });
}
export function contentStats(rows = []) {
  return Object.fromEntries(["opened", "scrolled", "yes", "no"].map(key => [key, rows.filter(r => r[key]).length]));
}
export function contentLink(id, preview = false, origin = globalThis.location?.origin || "https://www.mnyra.com", slug = "") {
  return `${origin}${creatorDirectPath(id) || (slug ? `/${slug}` : "") || `/content-creator/${encodeURIComponent(id)}`}${preview ? "?still=1" : ""}`;
}
export function ccEscape(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[c]);
}
export function ccImage(value) { return /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value || "") ? value : creatorMediaUrl(value); }

export function creatorDeliveryPhotos(page) {
  const active = new Set((page.products || []).filter(product => product.active !== false).flatMap(product => product.imageIds || []));
  return (page.kind === 'shop' ? page.photoIds || [] : []).filter(file =>
    /^[a-zA-Z0-9_-]{1,64}$/.test(file) && active.has(file)
    && page.mediaTypes?.[file] !== 'video' && page.media?.[file]?.mediaType !== 'video'
  );
}

function compactCreatorId(id){
  return btoa(String.fromCharCode(...id.match(/../g).map(byte=>parseInt(byte,16)))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
function expandCreatorId(value){
  if(/^[a-f0-9]{32}$/.test(value||''))return value;
  if(!/^[A-Za-z0-9_-]{22}$/.test(value||''))return '';
  return Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),byte=>byte.charCodeAt(0).toString(16).padStart(2,'0')).join('');
}
export function creatorPhotoLink(id,token,slug,origin=globalThis.location.origin){
  const canonical=creatorDirectPath(id).slice(1);
  return `${origin}/${canonical||slug}-fotot#${canonical?'':compactCreatorId(id)+'.'}${compactCreatorId(token)}`;
}
export function creatorPhotoLinkKeys(path,fragment){
  const [first,second]=fragment.split('.');
  const slug=path.replace(/-fotot$/,'');
  return {pageId:second?expandCreatorId(first):Object.hasOwn(CREATOR_DIRECT_ROUTES,slug)?CREATOR_DIRECT_ROUTES[slug]:'',token:expandCreatorId(second||first)};
}
