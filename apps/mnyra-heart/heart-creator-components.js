import {ccEscape as esc} from '../../shared/content-creator.js';
import {renderHeartIcon as icon} from './heart-icons.js';

export {icon as creatorIcon};
export function creatorMoney(cents){
 const value=Number(cents)||0;
 return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:value%100===0?0:2,maximumFractionDigits:2}).format(value/100);
}
export const creatorCollapsed=(state,key)=>state.collapsedCards?.[key]===true;
export function creatorCard(key,title,content,state={},options={}){
 const closed=creatorCollapsed(state,key);
 return `<section class="cc-card ${esc(options.className||'')}${closed?' cc-collapsed':''}" data-cc-collapse="${esc(key)}" ${options.hidden?'hidden':''}>
 <header class="cc-card-head"><div class="cc-heading"><button type="button" class="cc-title-toggle${options.arrow?' cc-title-toggle--arrow':''}" data-cc-action="collapse" data-key="${esc(key)}" aria-expanded="${!closed}">${options.arrow?icon('chevronDown'):''}<h3>${esc(title)}</h3></button>${options.count!==undefined?`<span class="cc-count">${esc(options.count)}</span>`:''}</div>${options.actions||''}</header>
 <div class="cc-card-body" ${closed?'hidden':''}>${content}</div></section>`;
}
export function creatorSearch(state={}){
 return `<label class="cc-business-search">${icon('search')}<input type="search" id="cc-business-search" data-cc-search value="${esc(state.search||'')}" placeholder="Biznes suchen …" aria-label="Business suchen"></label>`;
}
