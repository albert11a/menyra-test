import {creatorMediaUrl} from './creator-media.js';
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
export function contentLink(id, preview = false, origin = globalThis.location?.origin || "https://www.mnyra.com") {
  return `${origin}/content-creator/${encodeURIComponent(id)}${preview ? "?still=1" : ""}`;
}
export function ccEscape(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[c]);
}
export function ccImage(value) { return /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value || "") ? value : creatorMediaUrl(value); }
