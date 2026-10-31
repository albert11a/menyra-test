import {contentStatus} from './content-creator.js';
// Creator telemetry and reporting. No dependency on LifeSkin's runtime.
export const CREATOR_PERIODS=[['today','Heute'],['yesterday','Gestern'],['7','7 Tage'],['30','30 Tage'],['all','Max']];
export const CREATOR_STATUSES=[['working','Working'],['ready','Ready'],['seen','Seen'],['customer','Kunde'],['archived','Archiv']];
export function creatorMs(value){if(typeof value?.toMillis==='function')return value.toMillis();if(value?.seconds)return value.seconds*1000;return typeof value==='number'?value:Date.parse(value||'')||0;}
export function creatorDay(value=Date.now()){const ms=creatorMs(value);return ms?new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'}).format(ms):'';}
export function creatorInPeriod(value,period='today',now=Date.now(),date=''){
 const day=creatorDay(value),today=creatorDay(now);if(!day)return false;
 if(period==='all')return true;if(period==='date')return day===date;if(period==='today')return day===today;
 const anchor=Date.parse(`${today}T12:00:00Z`),before=creatorDay(anchor-86400000);
 if(period==='yesterday')return day===before;
 const start=new Date(anchor-(Number(period)-1)*86400000).toISOString().slice(0,10);
 return day>=start&&day<=today;
}
export function creatorBusinessStatus(page,visits=[],orders=[]){
 if(page.workflow==='archived')return 'archived';
 if(orders.some(o=>o.pageId===page.id&&o.status!=='cancelled'))return 'customer';
 if(!['ready','sent'].includes(page.workflow))return 'working';
 const viewed=visits.filter(v=>v.pageId===page.id&&v.opened);
 const latest=Math.max(0,...viewed.map(v=>creatorMs(v.updatedAt||v.createdAt)));
 if(page.workflow==='ready'&&creatorMs(page.workflowAt)>latest)return 'ready';
 if(viewed.length)return 'seen';return 'ready';
}
export function creatorOverview(state={},now=Date.now()){
 const period=value=>creatorInPeriod(value,state.period||'today',now,state.date);
 const visits=state.visits||[],orders=(state.orders||[]).filter(o=>o.status!=='cancelled');
 const live=visits.filter(v=>v.online!==false&&now-creatorMs(v.updatedAt)<90000&&creatorMs(v.updatedAt)<=now&&v.stage);
 const selected=orders.filter(o=>period(o.createdAt));
 // Heartbeats never manufacture repeat visitors: daily attendance is recorded explicitly.
 const browsers=new Set(visits.filter(v=>(v.days||[creatorDay(v.createdAt)]).some(day=>period(`${day}T12:00:00Z`))).map(v=>v.visitorId||v.id||`${v.pageId}:${creatorMs(v.createdAt)}`));
 return {live:live.length,visitors:browsers.size,orders:selected.length,value:selected.reduce((n,o)=>n+(o.totalCents||0),0),stages:['page','cart','checkout'].map(stage=>live.filter(v=>(v.stage==='ordered'?'page':v.stage)===stage).length)};
}
export function creatorFollowups(state={}){
 const ordered=new Set((state.orders||[]).map(o=>o.cartId));
 return (state.carts||[]).filter(c=>c.status==='active'&&c.lines?.length&&!ordered.has(c.id)).sort((a,b)=>creatorMs(b.updatedAt)-creatorMs(a.updatedAt));
}

export function creatorBusinessMatches(page,state={}){
 const filter=state.filter||'all';
 const status=creatorBusinessStatus(page,state.visits,state.orders);
 const legacy=['sent','opened','yes','no'].includes(filter)&&contentStatus(page,(state.visits||[]).filter(v=>v.pageId===page.id))===filter;
 return (filter==='all'||filter===status||legacy)&&String(page.name||'').toLocaleLowerCase().includes(String(state.search||'').trim().toLocaleLowerCase());
}
