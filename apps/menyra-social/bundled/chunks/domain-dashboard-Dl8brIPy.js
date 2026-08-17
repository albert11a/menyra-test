const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-D5Wf7YqC.js","chunks/domain-feed-social-eager-mglKCN1Q.js","chunks/domain-auth-B1kS5TG-.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-BTV6SpEw.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as mt}from"./domain-auth-B1kS5TG-.js";import{f as I,r as ft,l as gt,s as ve}from"./domain-analytics-oyJYW1vv.js";import{b as bt}from"./domain-business-accounts-D8NpUhi6.js";import{i as yt,e as _t,a as xt}from"./domain-feed-social-eager-mglKCN1Q.js";const vt=20,wt=8;function F(e=""){return e==null?"":String(e).trim()}function ie(e){if(e==null||e==="")return null;const a=Number(String(e).replace(",","."));return Number.isFinite(a)&&a>0?a:null}function kt(e=Date.now(),a=Math.random()){const t=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(a)||0))*36**6).toString(36).padStart(6,"0");return`room_${t}_${n}`}function $t(e={}){const a=e&&typeof e=="object"?e:{},t=[...Array.isArray(a.images)?a.images:[],F(a.imageUrl??a.image??a.photoUrl)],n=[];return t.forEach(r=>{const s=F(r);s&&!n.includes(s)&&n.push(s)}),n.slice(0,wt)}function St(e={},{index:a=0}={}){const t=e&&typeof e=="object"?e:{},n=ie(t.persons??t.guests??t.capacity),r=ie(t.size??t.sizeSqm??t.area),s=$t(t);return{id:F(t.id)||kt(Date.now()+a),title:F(t.title??t.name),description:F(t.description??t.text).slice(0,400),imageUrl:s[0]||"",images:s,price:ie(t.price??t.pricePerNight),currency:F(t.currency??t.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:F(t.beds??t.bedsLabel).slice(0,60),size:r==null?null:Math.min(500,Math.round(r)),tag:F(t.tag??t.badge).slice(0,40),active:t.active!==!1}}function zt(e=[]){return(Array.isArray(e)?e:[]).slice(0,vt).map((a,t)=>St(a,{index:t}))}function At(e={}){return zt((e&&typeof e=="object"?e:{}).hotelRooms).filter(t=>t.title)}function Qa(e={}){const a=[];return Number.isFinite(e?.persons)&&e.persons>0&&a.push({icon:"users",label:`${e.persons} persona`}),F(e?.beds)&&a.push({icon:"bed",label:F(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&a.push({icon:"size",label:`${e.size} m²`}),a}function Ja(e={}){const a=Number(e?.price);if(!Number.isFinite(a)||a<=0)return"";const t=F(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(a)?String(a):a.toFixed(2);return t==="EUR"?`€${n}`:`${n} ${t}`}const Ce="all",Dt=Object.freeze([{key:Ce,label:"Krejt",icon:"sparkles"},{key:"coffee",label:"Kafe",icon:"coffee"},{key:"drinks",label:"Pije",icon:"cup-soda"},{key:"food",label:"Ushqim",icon:"utensils"},{key:"dessert",label:"Ëmbëlsira",icon:"cake-slice"}]),Pt=Object.freeze(Dt.map(e=>e.key)),Mt="food",jt="drinks",Bt="unsure",Ee=Object.freeze([Object.freeze({key:Mt,label:"Ushqim",hint:"Mëngjes, drekë, darkë etj.",icon:"utensils",categories:Object.freeze(["food"])}),Object.freeze({key:jt,label:"Pije",hint:"Kafe, ëmbëlsira, lëngje etj.",icon:"cup-soda",categories:Object.freeze(["coffee","drinks","dessert"])}),Object.freeze({key:Bt,label:"Nuk e di",hint:"Gjitha ofertat për rreth teje.",icon:"sparkles",categories:Object.freeze([])})]);Object.freeze(Ee.map(e=>e.key));const Xa=1,Ft=10,en=2,le=Object.freeze([{key:"1-2",min:1,max:2,label:"1–2"},{key:"2-4",min:2,max:4,label:"2–4"},{key:"4-6",min:4,max:6,label:"4–6"},{key:"6+",min:6,max:99,label:"6+"}]),tn=Object.freeze([{key:"now",label:"Tani",offsetMinutes:0},{key:"in30",label:"+30 min",offsetMinutes:30},{key:"in60",label:"+1 orë",offsetMinutes:60},{key:"later",label:"Më vonë",offsetMinutes:-1}]),Rt="claim",we="reservation",an=7;function Te(e=""){const a=String(e||"").trim().toLowerCase();return le.find(t=>t.key===a)||null}const H="Europe/Belgrade",Ne=1440,oe=["mon","tue","wed","thu","fri","sat","sun"],ke=new Map;function Ke(e){const a=String(e||"").trim()||H,t=ke.get(a);if(t)return t;let n=null;try{n=new Intl.DateTimeFormat("en-GB",{timeZone:a,hour12:!1,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short"})}catch{n=Ke(H)}return ke.set(a,n),n}const Ot={mon:"mon",tue:"tue",wed:"wed",thu:"thu",fri:"fri",sat:"sat",sun:"sun"};function ce(e){if(e==null||e==="")return 0;if(typeof e=="number")return Number.isFinite(e)?e:0;if(e instanceof Date){const n=e.getTime();return Number.isNaN(n)?0:n}if(typeof e=="object"){if(typeof e.toDate=="function")try{const n=e.toDate(),r=n instanceof Date?n.getTime():NaN;return Number.isNaN(r)?0:r}catch{return 0}return Number.isFinite(Number(e.seconds))?Math.round(Number(e.seconds)*1e3):Number.isFinite(Number(e._seconds))?Math.round(Number(e._seconds)*1e3):0}const t=new Date(String(e)).getTime();return Number.isNaN(t)?0:t}function B(e){const a=ce(e);return a?new Date(a).toISOString():""}function Ct(e,a=H){const t=ce(e)||Date.now(),n=Ke(a).formatToParts(new Date(t)),r=m=>{const v=n.find(z=>z.type===m);return v?v.value:""},s=r("year"),c=r("month"),u=r("day"),b=r("hour")==="24"?"00":r("hour"),w=r("minute"),p=String(r("weekday")||"").slice(0,3).toLowerCase();return{ms:t,dayKey:s&&c&&u?`${s}-${c}-${u}`:"",weekday:Ot[p]||"",minutes:(Number(b)||0)*60+(Number(w)||0),timeZone:String(a||"").trim()||H}}function Et(e){const a=String(e??"").trim();if(!a)return-1;const t=a.match(/^(\d{1,2})\s*[:.：]?\s*(\d{2})?$/);if(!t)return-1;const n=Number(t[1]),r=t[2]===void 0?0:Number(t[2]);return!Number.isFinite(n)||!Number.isFinite(r)||n>24||r>59?-1:n*60+r}function $e(e){const a=Math.max(0,Math.round(Number(e)||0))%Ne,t=Math.floor(a/60),n=a%60;return`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function Se(e){return typeof e=="number"?Number.isFinite(e)?Math.max(0,Math.round(e)):-1:Et(e)}function Tt(e,a){const t=Se(e);let n=Se(a);return t<0||n<0||n===t?null:(n<t&&(n+=Ne),{start:t,end:n})}function Nt(e=[]){const a=Array.isArray(e)?e:[],t=[];return a.forEach(n=>{if(!n||typeof n!="object")return;const r=Tt(n.start??n.from,n.end??n.to);r&&t.push(r)}),Kt(t)}function Kt(e=[]){const a=(Array.isArray(e)?e:[]).filter(n=>n&&Number.isFinite(n.start)&&Number.isFinite(n.end)&&n.end>n.start).slice().sort((n,r)=>n.start-r.start||n.end-r.end),t=[];return a.forEach(n=>{const r=t[t.length-1];if(r&&n.start<=r.end){r.end=Math.max(r.end,n.end);return}t.push({start:n.start,end:n.end})}),t}const Gt="active",ze="paused",Ae="archived",De="go",It="public";function g(e="",a=240){return String(e??"").trim().slice(0,a)}function T(e,a=0){const t=Math.trunc(Number(e));return!Number.isFinite(t)||t<0?a:t}function Lt(e=""){const a=String(e||"").trim().toLowerCase();return a===ze?ze:a===Ae?Ae:Gt}function Ut(e=""){const a=String(e||"").trim().toLowerCase();return Pt.includes(a)?a:Ce}function Ge(e=""){return String(e||"").trim().toLowerCase()===we?we:Rt}function Ht(e={}){const a=e&&typeof e=="object"?e:{},t=String(a.kind||a.type||"").trim().toLowerCase(),n=Math.min(90,Math.max(0,T(a.percent??a.discountPercent,0))),r={kind:["percent","freeItem","bundle","table","custom"].includes(t)?t:n>0?"percent":"custom",percent:n,itemId:g(a.itemId,180),itemName:g(a.itemName||a.item,160),priceText:g(a.priceText||a.price,60),text:g(a.text,160)};return r.label=Zt(r),r}function Zt(e={}){const a=e&&typeof e=="object"?e:{},t=g(a.text,160);if(t)return t;const n=T(a.percent,0);if(!(a.kind==="freeItem"||a.kind==="bundle"||a.kind==="table")&&(a.kind==="percent"||n>0))return n>0?`–${n} %`:"";if(a.kind==="freeItem"){const s=g(a.itemName,160);return s?`${s} falas`:"Produkt falas"}if(a.kind==="bundle"){const s=g(a.itemName,160),c=g(a.priceText,60);return s&&c?`${s} ${c}`:s||c||"Paket special"}return a.kind==="table"?"Tavolinë e rezervuar":""}function Ie(e){const a=Array.isArray(e)?e:e?[e]:[],t=[];return a.forEach(n=>{const r=String(n||"").trim().toLowerCase();Te(r)&&!t.includes(r)&&t.push(r)}),t.length?t:le.map(n=>n.key)}function Vt(e=[]){const a=Ie(e);let t=Number.POSITIVE_INFINITY,n=0;return a.forEach(r=>{const s=Te(r);s&&(t=Math.min(t,s.min),n=Math.max(n,s.max))}),!Number.isFinite(t)||!n?{min:1,max:99}:{min:t,max:n}}function Wt(e={}){const a=e&&typeof e=="object"?e:{},t=String(a.mode||"").trim().toLowerCase()==="windows"?"windows":"always",n=[];(Array.isArray(a.days)?a.days:[]).forEach(c=>{const u=String(c||"").trim().toLowerCase();oe.includes(u)&&!n.includes(u)&&n.push(u)});const s=Nt((Array.isArray(a.windows)?a.windows:[]).map(c=>({start:c?.start??c?.from,end:c?.end??c?.to})));return t==="always"||!n.length&&!s.length?{mode:"always",days:oe.slice(),windows:[]}:{mode:"windows",days:n.length?n:oe.slice(),windows:s}}function qt(e={}){const a=e&&typeof e=="object"?e:{},t=s=>{const c=g(s,10);return/^\d{4}-\d{2}-\d{2}$/.test(c)?c:""},n=t(a.startDate||a.from),r=t(a.endDate||a.to);return n&&r&&r<n?{startDate:r,endDate:n}:{startDate:n,endDate:r}}function Yt(e={}){const a=e&&typeof e=="object"?e:{};return{slotGroups:T(a.slotGroups??a.maxGroupsPerSlot,0),slotGuests:T(a.slotGuests??a.maxGuestsPerSlot,0),dailyGroups:T(a.dailyGroups??a.maxGroupsPerDay,0),totalRedemptions:T(a.totalRedemptions??a.maxRedemptions,0)}}function Qt(e){const a=Array.isArray(e)?e:[],t=[];return a.forEach(n=>{const r=String(n||"").trim().toLowerCase();(r===De||r===It)&&!t.includes(r)&&t.push(r)}),t.length?t:[De]}function ae(e={},a=""){const t=e&&typeof e=="object"?e:{},n=Ie(t.partyRanges||t.partySizes),r=Vt(n),s=Ht(t.benefit),c=Ge(t.bookingType);return{id:g(t.id||a,180),restaurantId:g(t.restaurantId,180),locationId:g(t.locationId,180)||"main",title:g(t.title,120),description:g(t.description||t.text,400),terms:g(t.terms||t.conditions,400),benefit:s,benefitLabel:s.label,category:Ut(t.category),partyRanges:n,minParty:r.min,maxParty:r.max,schedule:Wt(t.schedule),dateRange:qt(t.dateRange),bookingType:c,limits:Yt(t.limits),channels:Qt(t.channels),status:Lt(t.status),sponsored:t.sponsored===!0||t.sponsored?.active===!0,sponsoredUntil:B(t.sponsored?.until),priceLevel:Math.min(4,Math.max(0,T(t.priceLevel,0))),redeemedCount:T(t.redeemedCount,0),createdAt:B(t.createdAt),updatedAt:B(t.updatedAt)}}function nn(e={},{serverTimestamp:a=null}={}){const t=ae(e),n={restaurantId:t.restaurantId,locationId:t.locationId,title:t.title,description:t.description,terms:t.terms,benefit:t.benefit,benefitLabel:t.benefitLabel,category:t.category,partyRanges:t.partyRanges,minParty:t.minParty,maxParty:t.maxParty,schedule:t.schedule,dateRange:t.dateRange,bookingType:t.bookingType,limits:t.limits,channels:t.channels,status:t.status,sponsored:t.sponsored,priceLevel:t.priceLevel};return a&&(n.updatedAt=a,t.createdAt||(n.createdAt=a)),n}function rn(e={}){const a=ae(e),t=[];return a.restaurantId||t.push({field:"restaurantId",message:"Lokali mungon."}),a.benefitLabel||t.push({field:"benefit",message:"Shkruaj çka po ofron."}),a.partyRanges.length||t.push({field:"partyRanges",message:"Zgjidh sa persona."}),a.schedule.mode==="windows"&&(a.schedule.days.length||t.push({field:"schedule",message:"Zgjidh ditët."}),a.schedule.windows.length||t.push({field:"schedule",message:"Zgjidh orarin."})),a.benefit.kind==="percent"&&a.benefit.percent<=0&&t.push({field:"benefit",message:"Zbritja duhet të jetë mbi 0 %."}),{ok:t.length===0,errors:t,offer:a}}function Le(e={}){const t=(e&&e.schedule?e:ae(e)).schedule;if(t.mode==="always")return"Gjithmonë";const n={mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"},r=t.days.map(c=>n[c]||c).join(", "),s=t.windows.map(c=>`${$e(c.start)}-${$e(c.end)}`).join(", ");return[r,s].filter(Boolean).join(" · ")}function Ue(e={}){const a=e&&e.partyRanges?e:ae(e);return`${a.maxParty>=Ft?`${a.minParty}+`:`${a.minParty}–${a.maxParty}`} persona`}const He=Object.freeze({x:[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]],users:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{cx:"9",cy:"7",r:"4"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75"}]],sparkles:[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"}],["path",{d:"M20 3v4"}],["path",{d:"M22 5h-4"}],["path",{d:"M4 17v2"}],["path",{d:"M5 18H3"}]],coffee:[["path",{d:"M10 2v2"}],["path",{d:"M14 2v2"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"}],["path",{d:"M6 2v2"}]],"cup-soda":[["path",{d:"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"}],["path",{d:"M5 8h14"}],["path",{d:"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"}],["path",{d:"m12 8 1-6h2"}]],utensils:[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"}],["path",{d:"M7 2v20"}],["path",{d:"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"}]],"cake-slice":[["circle",{cx:"9",cy:"7",r:"2"}],["path",{d:"M7.2 7.9 3 11v9c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-9c0-2-3-6-7-8l-3.6 2.6"}],["path",{d:"M16 13H3"}],["path",{d:"M16 17H3"}]],zap:[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"}]],timer:[["line",{x1:"10",x2:"14",y1:"2",y2:"2"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11"}],["circle",{cx:"12",cy:"14",r:"8"}]],clock:[["circle",{cx:"12",cy:"12",r:"10"}],["polyline",{points:"12 6 12 12 16 14"}]],"calendar-clock":[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{d:"M16 2v4"}],["path",{d:"M8 2v4"}],["path",{d:"M3 10h5"}],["path",{d:"M17.5 17.5 16 16.3V14"}],["circle",{cx:"16",cy:"16",r:"6"}]],"map-pin":[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{cx:"12",cy:"10",r:"3"}]],search:[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]],"badge-percent":[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"}],["path",{d:"m15 9-6 6"}],["path",{d:"M9 9h.01"}],["path",{d:"M15 15h.01"}]],"check-check":[["path",{d:"M18 6 7 17l-5-5"}],["path",{d:"m22 10-7.5 7.5L13 16"}]],"party-popper":[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]],gift:[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1"}],["path",{d:"M12 8v13"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"}]],"shield-check":[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]],"ticket-percent":[["path",{d:"M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"}],["path",{d:"M9 9h.01"}],["path",{d:"m15 9-6 6"}],["path",{d:"M15 15h.01"}]],store:[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"}],["path",{d:"M2 7h20"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"}]],pencil:[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{d:"m15 5 4 4"}]],armchair:[["path",{d:"M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"}],["path",{d:"M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"}],["path",{d:"M5 18v2"}],["path",{d:"M19 18v2"}]],"circle-check-big":[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335"}],["path",{d:"m9 11 3 3L22 4"}]],"book-open":[["path",{d:"M12 7v14"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],navigation:[["polygon",{points:"3 11 22 2 13 21 11 13 3 11"}]],"log-in":[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"}],["polyline",{points:"10 17 15 12 10 7"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12"}]],"rotate-ccw":[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]],"arrow-left":[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]],"chevron-right":[["path",{d:"m9 18 6-6-6-6"}]],"triangle-alert":[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]],link:[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"}]],copy:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"}]],check:[["path",{d:"M20 6 9 17l-5-5"}]],hash:[["line",{x1:"4",x2:"20",y1:"9",y2:"9"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21"}]],ban:[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m4.9 4.9 14.2 14.2"}]]}),Jt=Object.freeze({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"});function Pe(e={}){return Object.entries(e).map(([a,t])=>` ${a}="${t}"`).join("")}Object.freeze(Object.keys(He));function X(e="",a=""){const t=He[String(e||"").trim()];if(!t)return"";const n=t.map(([s,c])=>`<${s}${Pe(c)}></${s}>`).join(""),r=String(a||"").trim();return`<svg${Pe(Jt)}${r?` class="${r}"`:""}>${n}</svg>`}const Me=Object.freeze({offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",peopleSuffix:"persona"}),Xt=`
/* Die Ergebniskarte. Sie darf nicht aussehen wie eine gewoehnliche Oferta:
   oben steht, WER anbietet, darunter, was DIESER Gruppe angeboten wird.
   Auf dem weissen Bento traegt sie die Flaeche der App, wie die
   Erklaerkarten - sonst waere sie ein Rahmen ohne Karte darin. */
.mnyra-go-page__card {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--go-outline, #e2e8f0);
  border-radius: 26px;
  background: var(--go-plane, #f8fafc);
  color: var(--go-ink, #0f172a);
  text-align: left;
  /* Nach "Shiko ofertat" faehrt die Seite zum ersten Angebot. Ohne diesen
     Rand endete die Fahrt mit der Oberkante der Karte genau unter der
     Kopfzeile der App - halb verdeckt, und der Blick sucht wieder. */
  scroll-margin-top: 88px;
}
.mnyra-go-page__card-head { display: flex; align-items: center; gap: 10px; }
.mnyra-go-page__card-logo { width: 40px; height: 40px; border-radius: 14px; object-fit: cover; background: var(--go-plane, #f8fafc); flex: 0 0 auto; }
.mnyra-go-page__card-logo--empty { color: var(--go-muted, #94a3b8); display: flex; align-items: center; justify-content: center; }
.mnyra-go-page__card-logo--empty svg { width: 18px; height: 18px; }
.mnyra-go-page__card-names { min-width: 0; }
.mnyra-go-page__card-who { margin: 0; min-width: 0; font-size: 13px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-go-page__card-who span { color: var(--go-muted, #94a3b8); font-weight: 700; }
.mnyra-go-page__card-sponsored { margin: 2px 0 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted, #94a3b8); }
.mnyra-go-page__card-benefit { margin: 12px 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go-page__card-for { margin: 2px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2, #475569); }
.mnyra-go-page__card-meta { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; font-weight: 700; color: var(--go-ink-2, #475569); }
.mnyra-go-page__card-meta span { display: inline-flex; align-items: center; gap: 5px; }
.mnyra-go-page__card-meta svg { width: 14px; height: 14px; color: var(--go-muted, #94a3b8); }
.mnyra-go-page__card-only { margin: 12px 0 0; display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted, #94a3b8); }
.mnyra-go-page__card-only svg { width: 12px; height: 12px; }
.mnyra-go-page__cta {
  width: 100%;
  min-height: 50px;
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: none;
  border-radius: 18px;
  background: var(--go-ink, #0f172a);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 900;
  letter-spacing: -0.01em;
  font-family: inherit;
  cursor: pointer;
}
.mnyra-go-page__cta svg { width: 17px; height: 17px; }
.mnyra-go-page__cta:disabled { opacity: 0.6; cursor: not-allowed; }
.mnyra-go-page__cta:not(:disabled):active { transform: scale(0.99); }
`;function O(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ea({businessName:e="",logoUrl:a="",benefitLabel:t="",sponsored:n=!1,meta:r=[],ctaLabel:s="",ctaIcon:c="check-check",ctaDisabled:u=!1,cardAttrs:b="",ctaAttrs:w="",texts:p=Me}={}){const m={...Me,...p||{}},v=(Array.isArray(r)?r:[]).filter(A=>A&&A.label),z=String(s||m.accept);return`
    <article class="mnyra-go-page__card"${b?` ${b}`:""}>
      <div class="mnyra-go-page__card-head">
        ${a?`<img class="mnyra-go-page__card-logo" src="${O(a)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`:`<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${X("store")}</div>`}
        <div class="mnyra-go-page__card-names">
          <p class="mnyra-go-page__card-who">${O(e)} <span>${O(m.offering)}</span></p>
          ${n?`<p class="mnyra-go-page__card-sponsored">${O(m.sponsored)}</p>`:""}
        </div>
      </div>

      <p class="mnyra-go-page__card-benefit">${O(t)}</p>
      <p class="mnyra-go-page__card-for">${O(m.forGroup)}</p>

      <div class="mnyra-go-page__card-meta">
        ${v.map(A=>`<span>${X(A.icon||"")}${O(A.label)}</span>`).join("")}
      </div>

      <p class="mnyra-go-page__card-only">${X("ticket-percent")}${O(m.onlyGo)}</p>

      <button
        type="button"
        class="mnyra-go-page__cta"
        ${w}
        ${u?"disabled":""}
      >${c?X(c):""}${O(z)}</button>
    </article>
  `}const _=Object.freeze({confirmed:"confirmed",checkedIn:"checked_in",completed:"completed",cancelledByUser:"cancelled_by_user",cancelledByBusiness:"cancelled_by_business",notArrived:"not_arrived",expired:"expired"});Object.freeze([_.confirmed,_.checkedIn]);Object.freeze({[_.confirmed]:[_.checkedIn,_.completed,_.cancelledByUser,_.cancelledByBusiness,_.notArrived,_.expired],[_.checkedIn]:[_.completed,_.cancelledByBusiness],[_.completed]:[],[_.cancelledByUser]:[],[_.cancelledByBusiness]:[],[_.notArrived]:[],[_.expired]:[]});function Ze(e=""){const a=String(e||"").trim().toLowerCase();return Object.values(_).includes(a)?a:_.confirmed}function sn({expectedArrivalAt:e=Date.now(),timeZone:a=H}={}){return Ct(e,a).dayKey}function on(e={},a=""){const t=e&&typeof e=="object"?e:{},n=t.snapshot&&typeof t.snapshot=="object"?t.snapshot:{};return{id:g(t.id||a,180),restaurantId:g(t.restaurantId||n.restaurantId,180),locationId:g(t.locationId||n.locationId,180)||"main",offerId:g(t.offerId||n.offerId,180),guestId:g(t.guestId,180),uid:g(t.uid,180),shortCode:g(t.shortCode,12).toUpperCase(),type:Ge(t.type||n.bookingType),status:Ze(t.status),partySize:Math.max(1,Math.trunc(Number(t.partySize||n.partySize)||1)),expectedArrivalAt:B(t.expectedArrivalAt||n.expectedArrivalAt),expectedArrivalMs:ce(t.expectedArrivalAt||n.expectedArrivalAt),dayKey:g(t.dayKey,10),slotKey:g(t.slotKey,240),timeZone:g(t.timeZone,60)||H,snapshot:n,businessName:g(n.businessName,120),benefitLabel:g(n.benefitLabel,160),logoUrl:g(n.logoUrl,500),businessSeenAt:B(t.businessSeenAt),checkedInAt:B(t.checkedInAt),completedAt:B(t.completedAt),cancelledAt:B(t.cancelledAt),cancelReason:g(t.cancelReason,200),commissionVersion:g(t.commissionVersion,40),commission:t.commission&&typeof t.commission=="object"?{version:g(t.commission.version,40),currency:g(t.commission.currency,8),partySize:Math.max(1,Math.trunc(Number(t.commission.partySize)||1)),amountCents:Math.max(0,Math.trunc(Number(t.commission.amountCents)||0)),status:g(t.commission.status,20),confirmedAt:B(t.commission.confirmedAt)}:null,createdAt:B(t.createdAt),updatedAt:B(t.updatedAt)}}function ta(e={}){const a=Ze(e?.status);return a===_.confirmed?"Po vijnë":a===_.checkedIn?"Këtu":a===_.completed?"Përfunduar":a===_.cancelledByUser?"Anuluar nga klienti":a===_.cancelledByBusiness?"Anuluar nga ju":a===_.notArrived?"Nuk erdhën":"Skaduar"}function aa(e=0){const a=Math.max(0,Math.trunc(Number(e)||0)),t=Math.trunc(a/100),n=String(a%100).padStart(2,"0");return`${t},${n} €`}const d=Object.freeze({brand:"Mnyra GO",mark:"⚡",editor:"Editori",brandMnyra:"MNYRA",brandGo:"GO",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{active:"Aktiv",offers:"Ofertat",archive:"Arkiv",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"Ofertë e re GO",scanOffer:"Skano ofertën",seenToday:"Ofertën e kanë parë sot",acceptedToday:"E kanë pranuar sot",editOffer:"Ndrysho ofertën",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj ofertën",saving:"Po ruhet...",close:"Mbyll",edit:"Edit",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",benefitQuestion:"Çka po ofron?",benefitCustom:"Teksti yt (opsionale)",benefitPercent:"Zbritje %",benefitAction:"Aksion",percentPlaceholder:"Sa përqind zbritje",actionItemPlaceholder:"1 Kafe + 1 kroasan",actionPricePlaceholder:"Çmimi (p.sh. 2,50 €)",partyQuestion:"Prej sa personave vlen kjo ofertë",categoryQuestion:"Kur e lshon këtë ofertë",categoryHint:"Gastet zgjedhin mes «Ushqim» edhe «Pije».",ifFood:"Nëse kërkohet ushqim",ifDrinks:"Nëse kërkohet pije",scheduleQuestion:"Nga çfarë orari vlen oferta",always:"Nonstop",specificHours:"Specifik",hoursFrom:"Prej orës",hoursTo:"Deri në orë",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",loading:"Po ngarkohet...",guestName:"Mnyra Guest",table:"Tavolinë",markDone:"Përfundo",around:"Rreth",search:"Kërko",searching:"Po kërkoj...",codePlaceholder:"Kodi i klientit",codeNotFound:"Ky kod nuk u gjet.",partyAtTable:"Sa persona janë",commission:"Provizioni",keepsRunning:"Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",onlyBusiness:"Ky funksion eshte vetem per profile biznesi.",loadingBusiness:"Biznesi po ngarkohet..."});function i(e,a=""){return typeof e=="function"?e(a):String(a??"")}function N(e,a="",t="w-4 h-4"){return typeof e=="function"?e(a,t):""}function Ve(e=""){const a=Date.parse(String(e||""));if(!Number.isFinite(a))return"";const t=new Date(a);return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function na({enabled:e=!1,unseenCount:a=0,activeOffers:t=0,todayBookings:n=0,iconFn:r=null,texts:s={}}={}){if(!e)return"";const c={...d,...s||{}},u=Math.max(0,Math.trunc(Number(a)||0)),b=t>0||n>0,w=b?`${t} oferta aktive · ${n} rezervime sot`:c.cardIdle;return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${u>0?`<span class="mnyra-dash__composer-badge" aria-label="${u} ${c.statNew}">${u}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${w}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${N(r,"zap","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${b?c.cardManage:c.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${N(r,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const ra=`
.go-hl {
  margin: 0 -1.5rem 1.5rem;
  padding: 0 1.5rem;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 1.5rem;
  overscroll-behavior-x: contain;
  /* Wie in der Spots-Reihe im Feed: der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen auf der Reihe
     verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.go-hl::-webkit-scrollbar { display: none; }
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+24px Polster), abzueglich der beiden
   Luecken zwischen den drei angeschnittenen Karten. */
.go-hl__card {
  flex: 0 0 calc((100% + 24px - 20px) / 2.5);
  /* Bildfenster (140px) + Abstand + Textblock + Polster unten. */
  height: 228px;
  position: relative;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  background: #ffffff;
  padding: 0;
  scroll-snap-align: start;
  text-align: left;
  font: inherit;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.go-hl__card:active { transform: scale(0.98); }
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.go-hl__tail { flex: 0 0 18px; }
/* Alle Bilder stehen im selben Fenster oben in der Karte - gleiche Hoehe auf
   jeder Karte, egal welches Format das Bild mitbringt. */
.go-hl__media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 140px;
  object-fit: cover;
  object-position: center;
  display: block;
}
/* Die Flaeche unter dem Bild: sie traegt die Karte, solange kein Bild da ist
   - dann steht hier statt eines Lochs eine ruhige Flaeche mit Symbol. */
.go-hl__plate {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.go-hl__body {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 154px;
  z-index: 2;
}
/* Zwei Zeilen, immer - auch wenn die Beschriftung nur eine braucht. So stehen
   die Zahlen aller Karten auf derselben Hoehe. */
.go-hl__label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  min-height: 25px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: #94a3b8;
  overflow: hidden;
}
.go-hl__value {
  margin: 5px 0 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
/* Auf einer Handgriff-Karte steht kein Wert, sondern der Satz selbst. Er
   nimmt die Hoehe von Beschriftung und Zahl zusammen ein, damit die Reihe
   eine Linie behaelt. */
.go-hl__action {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: #0f172a;
  overflow: hidden;
}
/* Das Bento traegt alles unter der Karten-Reihe: die Tab-Leiste und darunter
   die Liste, die sie gewaehlt hat. Dieselbe Flaeche wie im Paneli - oben
   gerundet, bis an beide Seitenraender, und sie laeuft nach unten weiter.
   Deshalb sind nur die oberen Ecken gerundet.

   Die negative Marge ist genau das Seitenpolster der Seite (1.5rem): so
   reicht die Flaeche bis an die Raender, waehrend ihr Inhalt in der Flucht
   der Karten darueber bleibt. Der Abstand nach oben ist bewusst gross - die
   Reihe soll als eigenes Stueck lesen und nicht an der Flaeche kleben. */
.go-bento {
  margin: 72px -1.5rem 0;
  padding: 22px 1.5rem 112px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  border-radius: 40px 40px 0 0;
  box-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);
}
/* Die Leiste braucht Luft nach unten, deutlich mehr als der Abstand zwischen
   zwei Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Mit 44px liest sie als Kopf der Flaeche und nicht als erste Karte. */
.go-bento > .go-tabs { margin-top: 0; }
.go-bento > .go-tabs + * { margin-top: 44px; }
/* Vier Knoepfe, sonst nichts - kein Grund, kein Rahmen, kein Polster um sie
   herum. Ein Kasten darum schoebe sie um seine Polsterbreite nach innen und
   damit aus der Flucht der Karten darunter. */
.go-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
/* Symbol und Wort stehen in EINER Zeile und auf EINER Grundlinie: beide sind
   Flex-Kinder mit gleicher Ausrichtung, das Symbol in fester Groesse. */
.go-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  padding: 11px 8px;
  border: 1px solid #f1f5f9;
  /* Ganz rund, wie im Paneli: beide sagen dasselbe - "waehle eines von
     mehreren" - und sollen deshalb gleich aussehen. */
  border-radius: 999px;
  background: #f8fafc;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  color: #475569;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier.
   "block" nimmt ihnen die Grundlinien-Luecke, die ein Inline-Element unter
   sich laesst - sonst saesse das Wort daneben minimal zu hoch. */
.go-tab svg,
.go-tab i {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  display: block;
}
.go-tab-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Der gewaehlte Knopf traegt dasselbe Schwarz wie im Paneli. */
.go-tab[aria-selected="true"] {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}
.go-tab:active { transform: scale(0.98); }
`;function sa(e={},a={}){const t=a.escapeHtml,n=a.icon,r=e.imageUrl?`<img class="go-hl__media" src="${i(t,e.imageUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:"",s=e.action?`<span class="go-hl__action">${i(t,e.action)}</span>`:`
      <span class="go-hl__label">${i(t,e.label)}</span>
      <span class="go-hl__value">${i(t,e.value)}</span>
    `,c=e.action||`${e.label} ${e.value}`;return`
    <button type="button" class="go-hl__card" ${e.attr||""} data-go-highlight="${i(t,e.key)}"
      aria-label="${i(t,c)}">
      <span class="go-hl__plate ${i(t,e.tone||"text-slate-400")}">${N(n,e.icon,"w-6 h-6")}</span>
      ${r}
      <span class="go-hl__body">${s}</span>
    </button>
  `}function ia({stats:e={},deps:a={}}={}){return`
    <div class="go-hl" data-go-highlights>
      ${[{key:"scan",action:d.scanOffer,icon:"camera",tone:"text-indigo-600",attr:"data-go-scan"},{key:"seen",label:d.seenToday,value:Number(e.impressions)||0,icon:"eye",tone:"text-indigo-600"},{key:"accepted",label:d.acceptedToday,value:Number(e.accepted)||0,icon:"check-check",tone:"text-emerald-600"}].map(n=>sa(n,a)).join("")}
      <span class="go-hl__tail" aria-hidden="true"></span>
    </div>
  `}function oa({tab:e="active",deps:a={}}={}){const t=a.escapeHtml,n=a.icon;return`
    <div class="go-tabs" role="tablist" data-go-tabs>
      ${[["active",d.tabs.active,"zap"],["offers",d.tabs.offers,"tag"],["archive",d.tabs.archive,"archive"],["options",d.tabs.options,"settings"]].map(([s,c,u])=>`
        <button type="button" role="tab" aria-selected="${e===s?"true":"false"}" data-go-business-tab="${s}"
          class="go-tab">${N(n,u,"w-4 h-4")}<span class="go-tab-label">${i(t,c)}</span></button>
      `).join("")}
    </div>
  `}function de(e={},a={},{found:t=!1}={}){const n=a.escapeHtml,r=e.type==="reservation",s=Ve(e.expectedArrivalAt),c=e.benefitLabel||e.snapshot?.benefitLabel||"",u=!e.businessSeenAt,b=s?`${d.around} ${s}`:d.guestName;return`
    <div class="p-4 rounded-[1.6rem] border ${t?"bg-white border-indigo-300 ring-2 ring-indigo-100":u?"bg-indigo-50/50 border-indigo-100":"bg-slate-50 border-slate-100"}"
      data-go-booking="${i(n,e.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">${i(n,b)}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${i(n,ta(e))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${i(n,d.guestName)}</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-600">
        <span>👥 ${i(n,`${e.partySize||1} ${d.guests}`)}</span>
        ${s?`<span>🕐 ${i(n,d.around)} ${i(n,s)}</span>`:""}
        ${c?`<span>🎁 ${i(n,c)}</span>`:""}
        ${r?`<span>🪑 ${i(n,d.table)}</span>`:""}
      </div>
      ${t&&e.status==="confirmed"?`
        <div class="mt-4">
          <!--
            Die Gruppengroesse gehoert dem Kellner, nicht dem Gast: Er sitzt
            vor der Gruppe und sieht, wieviele es wirklich sind. Was er hier
            stehen laesst oder aendert, ist die Zahl, die abgerechnet wird.
          -->
          <label class="flex items-center justify-between gap-3 mb-3">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${i(n,d.partyAtTable)}</span>
            <input type="number" inputmode="numeric" min="1" max="10" data-go-confirm-party
              value="${i(n,e.partySize||1)}"
              class="w-16 text-center py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900" />
          </label>
          <button type="button" data-go-booking-confirm data-go-booking-id="${i(n,e.id)}"
            class="w-full py-3.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white active:scale-[0.98] transition-transform">
            ${i(n,d.accept)}
          </button>
        </div>
      `:""}
      ${e.commission?`
        <!--
          Was diese Bestaetigung kostet, steht offen da. Eine Provision, die
          das Lokal erst auf der Rechnung sieht, waere eine Ueberraschung -
          und Ueberraschungen bei Geld kosten Vertrauen.
        -->
        <p class="mt-3 pt-3 border-t border-slate-200/70 text-[10px] font-black uppercase tracking-widest text-slate-400">
          ${i(n,d.commission)} · ${i(n,aa(e.commission.amountCents))}
        </p>
      `:""}
      ${e.status==="checked_in"?`
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${i(n,e.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${i(n,d.markDone)}</button>
        </div>
      `:""}
    </div>
  `}function da({code:e="",status:a="",busy:t=!1,deps:n={}}={}){const r=n.escapeHtml,s=n.icon;return`
    <div class="mb-4" data-go-code-search>
      <div class="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-400 transition-colors">
        <span class="pl-2 text-slate-400">${N(s,"search","w-4 h-4")}</span>
        <input type="text" data-go-code-input value="${i(r,e)}"
          placeholder="${i(r,d.codePlaceholder)}"
          autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
          class="flex-1 min-w-0 bg-transparent py-2 text-sm font-black uppercase tracking-[0.2em] text-slate-900 outline-none" />
        <button type="button" data-go-code-submit ${t?"disabled":""}
          class="shrink-0 px-4 py-2 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white ${t?"opacity-60":""}">
          ${i(r,t?d.searching:d.search)}
        </button>
      </div>
      ${a?`<p class="mt-2 text-[10px] font-bold text-rose-500">${i(r,a)}</p>`:""}
    </div>
  `}function ee({eyebrow:e="",title:a="",sub:t="",action:n="",body:r="",deps:s={}}={}){const c=s.escapeHtml;return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${i(c,e)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${i(c,a)}</h3>
          ${t?`<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${i(c,t)}</p>`:""}
        </div>
        ${n}
      </div>
      ${r}
    </div>
  `}function la(e={},a={}){const t=a.escapeHtml,n=e.status==="paused"?d.paused:e.status==="archived"?d.archived:"";return`
    <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${i(t,e.id)}">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 truncate">${i(t,e.benefitLabel||"")}</p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">
          ${i(t,Ue(e))} &middot; ${i(t,Le(e))}
        </p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${e.status==="active"?"text-emerald-600":"text-slate-400"}">
          ${i(t,n||d.statActive)}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <button type="button" data-go-offer-edit="${i(t,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${i(t,d.edit)}</button>
        <button type="button" data-go-offer-toggle="${i(t,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${i(t,e.status==="active"?d.paused:d.activate)}</button>
        <button type="button" data-go-offer-archive="${i(t,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">${i(t,d.archive)}</button>
      </div>
    </div>
  `}function ca({offer:e={},businessName:a="",deps:t={}}={}){const n=t.escapeHtml;return`
    <div data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${i(n,d.preview)}</p>
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Ein Knopf, der aussieht wie
        der des Gastes und auf nichts hoert, waere ein kaputter Knopf.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${ea({businessName:a,benefitLabel:e.benefitLabel||"",meta:[{icon:"users",label:Ue(e)},{icon:"clock",label:Le(e)}]})}
      </div>
    </div>
  `}function U(e,a="",t=""){return`<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${t?` for="${i(e,t)}"`:""}>${i(e,a)}</label>`}function V(e,{active:a=!1,attr:t="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${t?`${t}="${i(r,n)}"`:""} aria-pressed="${a?"true":"false"}"
      class="min-h-[44px] px-4 rounded-2xl text-xs font-black transition-colors ${a?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${i(r,e)}
    </button>
  `}function ha(e=""){const a=String(e||"all").trim().toLowerCase();return a==="food"?["food"]:a==="coffee"||a==="drinks"||a==="dessert"?["drinks"]:["food","drinks"]}function dn(e=[]){const a=Array.isArray(e)?e:[],t=a.includes("food"),n=a.includes("drinks");return t&&n?"all":t?"food":n?"drinks":""}function ln({editor:e=null,businessName:a="",deps:t={}}={}){if(!e)return"";const n=t.escapeHtml,r=t.icon,s=e.draft||{},c=Array.isArray(e.errors)?e.errors:[],u=$=>c.find(k=>k.field===$)?.message||"",b=Array.isArray(s.partyRanges)?s.partyRanges:[],w=s.schedule?.mode==="windows"?"windows":"always",p=Array.isArray(e.intents)?e.intents:ha(s.category),m=(s.benefit?.kind||"percent")==="percent",v=e.mode==="edit",z="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400",A='<div class="h-px bg-slate-100"></div>',R=$=>`<p class="mt-1 text-[11px] font-semibold text-slate-400">${i(n,$)}</p>`;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;"
      data-go-offer-editor role="dialog" aria-modal="true"
      aria-label="${i(n,v?d.editOffer:d.createOffer)}">
      <!--
        Die Karte der Vorschau bringt ihr Stylesheet mit: Sie ist dieselbe wie
        im Qyteti, und deren Regeln haengen am Kopf des Dokuments erst, wenn
        jemand die Gaeste-Seite geoeffnet hat.
      -->
      <style>${Xt}</style>
      <div class="absolute inset-0 bg-black/60" data-go-offer-cancel></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
        <div class="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
          <div class="min-w-0">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${i(n,d.brand)}</span>
            <h3 class="text-xl font-black italic tracking-tighter truncate">${i(n,v?d.editOffer:d.createOffer)}</h3>
          </div>
          <button type="button" data-go-offer-cancel aria-label="${i(n,d.close)}"
            class="shrink-0 w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
            ${N(r,"x","w-4 h-4")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-5">
          <div>
            ${U(n,d.benefitQuestion)}
            <div class="mt-2 flex flex-wrap gap-2">
              ${V(d.benefitPercent,{active:m,attr:"data-go-benefit-kind",value:"percent",escapeHtml:n})}
              ${V(d.benefitAction,{active:!m,attr:"data-go-benefit-kind",value:"bundle",escapeHtml:n})}
            </div>
            ${m?`
              <input id="goBenefitPercent" type="number" inputmode="numeric" min="1" max="90" step="1" data-go-benefit-percent
                placeholder="${i(n,d.percentPlaceholder)}"
                value="${i(n,s.benefit?.percent||"")}" class="${z}" />
            `:`
              <input id="goBenefitItem" type="text" data-go-benefit-item
                placeholder="${i(n,d.actionItemPlaceholder)}"
                value="${i(n,s.benefit?.itemName||"")}" class="${z}" />
              <input id="goBenefitPrice" type="text" inputmode="decimal" data-go-benefit-price
                placeholder="${i(n,d.actionPricePlaceholder)}"
                value="${i(n,s.benefit?.priceText||"")}" class="${z}" />
            `}
            ${u("benefit")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${i(n,u("benefit"))}</p>`:""}
          </div>

          ${A}

          <div>
            ${U(n,d.partyQuestion)}
            <div class="mt-2 flex flex-wrap gap-2">
              ${le.map($=>V($.label,{active:b.includes($.key),attr:"data-go-offer-party",value:$.key,escapeHtml:n})).join("")}
            </div>
            ${u("partyRanges")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${i(n,u("partyRanges"))}</p>`:""}
          </div>

          ${A}

          <div>
            ${U(n,d.categoryQuestion)}
            ${R(d.categoryHint)}
            <div class="mt-3 space-y-2">
              ${[{key:"food",label:d.ifFood},{key:"drinks",label:d.ifDrinks}].map($=>{const k=p.includes($.key),L=Ee.find(ne=>ne.key===$.key)?.hint||"";return`
                  <button type="button" data-go-offer-intent="${i(n,$.key)}" aria-pressed="${k?"true":"false"}"
                    class="w-full text-left min-h-[56px] px-4 py-3 rounded-2xl border transition-colors ${k?"bg-slate-900 border-slate-900 text-white":"bg-slate-50 border-slate-100 text-slate-600"}">
                    <span class="block text-xs font-black">${i(n,$.label)}</span>
                    <span class="block mt-0.5 text-[11px] font-semibold ${k?"text-white/60":"text-slate-400"}">${i(n,L)}</span>
                  </button>
                `}).join("")}
            </div>
            ${u("category")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${i(n,u("category"))}</p>`:""}
          </div>

          ${A}

          <div>
            ${U(n,d.scheduleQuestion)}
            <div class="mt-2 flex flex-wrap gap-2">
              ${V(d.always,{active:w==="always",attr:"data-go-offer-schedule",value:"always",escapeHtml:n})}
              ${V(d.specificHours,{active:w==="windows",attr:"data-go-offer-schedule",value:"windows",escapeHtml:n})}
            </div>
            ${w==="windows"?`
              <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  ${U(n,d.hoursFrom,"goOfferFrom")}
                  <input id="goOfferFrom" type="time" data-go-offer-from value="${i(n,e.windowFrom||"14:00")}" class="${z}" />
                </div>
                <div>
                  ${U(n,d.hoursTo,"goOfferTo")}
                  <input id="goOfferTo" type="time" data-go-offer-to value="${i(n,e.windowTo||"18:00")}" class="${z}" />
                </div>
              </div>
            `:""}
            ${u("schedule")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${i(n,u("schedule"))}</p>`:""}
          </div>

          ${A}

          ${ca({offer:s,businessName:a,deps:t})}
        </div>

        <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
          <button type="button" data-go-offer-save ${e.saving?"disabled":""}
            class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
            ${i(n,e.saving?d.saving:v?d.save:d.activate)}
          </button>
          <div class="text-center text-[10px] font-bold ${e.status?"text-rose-500":"text-slate-400"} mt-3">${i(n,e.status)}</div>
        </div>
        </div>
      </div>
    </div>
  `}function cn({restaurantName:e="",tab:a="active",stats:t={},search:n={},bookings:r=[],offers:s=[],settings:c={},paused:u=!1,loading:b=!1,error:w="",deps:p={}}={}){const m=p.escapeHtml,v=p.icon,z=r.filter(k=>["confirmed","checked_in"].includes(k.status)),A=r.filter(k=>!["confirmed","checked_in"].includes(k.status)),R=s.filter(k=>k.status!=="archived");let $="";if(a==="offers")$=ee({eyebrow:d.brand,title:d.tabs.offers,sub:`${R.length} ${R.length===1?"oferte":"oferta"}`,action:`
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${N(v,"plus","w-4 h-4")}
        </button>
      `,body:R.length?`<div class="space-y-3">${R.map(k=>la(k,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${i(m,d.emptyTitle)}</div>`,deps:p});else if(a==="archive")$=ee({eyebrow:d.brand,title:d.tabs.archive,sub:`${A.length}`,body:A.length?`<div class="space-y-3">${A.map(k=>de(k,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${i(m,d.noHistory)}</div>`,deps:p});else if(a==="options"){const k=Ve(c?.pausedUntil);$=ee({eyebrow:d.brand,title:d.tabs.options,body:`
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${i(m,d.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${i(m,u?`${d.pausedUntil} ${k}`:"ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${u?"text-amber-600":"text-emerald-600"}">
            ${i(m,u?d.paused:d.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${u?`<button type="button" data-go-pause="0" class="min-h-[44px] px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${i(m,d.resume)}</button>`:[{value:"30",label:"30 min"},{value:"60",label:"1 orë"},{value:"tomorrow",label:"Deri nesër"},{value:"-1",label:"Pa afat"}].map(L=>`
              <button type="button" data-go-pause="${L.value}"
                class="min-h-[44px] px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${i(m,L.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${i(m,d.keepsRunning)}</p>
      `,deps:p})}else $=ee({eyebrow:d.brand,title:d.tabs.active,sub:`${z.length}`,body:`
        ${da({code:n.code,status:n.status,busy:n.busy,deps:p})}
        ${n.booking?`
          <div class="mb-4">${de(n.booking,p,{found:!0})}</div>
        `:""}
        ${b?`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${i(m,d.loading)}</div>`:z.length?`<div class="space-y-3">${z.filter(k=>k.id!==n.booking?.id).map(k=>de(k,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${i(m,d.noBookings)}</div>`}
      `,deps:p});return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <!--
        Das Stylesheet steht in der Seite und nicht im Kopf des Dokuments: Die
        Reihe braucht Regeln, die sich mit Tailwind-Klassen nicht schreiben
        lassen (Zeilenbegrenzung, versteckte Bildlaufleiste, Rasterpunkte).
        Es wird mit der Seite ersetzt, also gibt es es immer genau einmal.
      -->
      <style>${ra}</style>
      <!--
        Dieselbe Ueberschrift wie im Qyteti: oben der Name in einer Zeile,
        darunter ein Satz in klein und grau. Vorher standen hier drei Zeilen
        - eine Marke, eine Ueberschrift, ein Name - und das Lokal las von oben
        nach unten dreimal, wo es ist, bevor es einmal las, was es hier tun
        kann. Zwei Zeilen sagen dasselbe.

        Das GO steht im Blau der Marke und direkt am Wort: "MNYRAGO" ist ein
        Name, kein Wort mit einer Beschriftung daneben.
      -->
      <div class="mb-6">
        <h1 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">${i(m,d.brandMnyra)}<span class="text-indigo-600">${i(m,d.brandGo)}</span></h1>
        <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${i(m,e?`${d.editor} ${e}`:d.editor)}</p>
      </div>

      ${ia({stats:t,deps:p})}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        dieselbe Flaeche wie im Paneli. Die Reihe darueber bleibt frei: sie
        gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="go-bento" data-go-bento>
        ${oa({tab:a,deps:p})}
        <div>
          ${$}
          ${w?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${i(m,w)}</p>`:""}
        </div>
      </div>
    </div>
  `}function hn({deps:e={},resolving:a=!1}={}){const t=e.icon,n=e.escapeHtml;return a?`
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${i(n,d.loadingBusiness)}</p>
        </div>
      </div>
    `:`
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${N(t,"lock","w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${i(n,d.brand)}</h2>
        <p class="text-sm text-slate-500">${i(n,d.onlyBusiness)}</p>
      </div>
    </div>
  `}const je="mnyraDashboardStyles",ua=`
.mnyra-dash {
  /* Horizontale Flucht auf die SICHTBAREN Header-Icons (nicht die
     unsichtbaren Touch-Kreise): Menue-Striche beginnen bei 28px,
     Warenkorb-Symbol endet bei 30px vom rechten Rand - 28px beidseitig
     trifft beide optisch (rechts 2px Toleranz, im Browser vermessen). */
  padding: 16px 28px 0;
  /* Kein unteres Polster und keine Mindesthoehe mehr: den Abschluss der Seite
     macht jetzt der Fuss der App (core/ui/app-footer-render-utils.js), der im
     Fluss hinter dem Panel steht. Beides hier waere doppelt - die Mindesthoehe
     schoebe den Fuss ausserdem bei kurzem Inhalt unter den Bildschirmrand. */
  --dash-surface: #ffffff;
  --dash-plane: #f8fafc;
  --dash-ink: #0f172a;
  --dash-ink-2: #475569;
  --dash-muted: #94a3b8;
  --dash-border: rgba(15, 23, 42, 0.08);
  /* Genau die Linie, die auch die Profil-Karten tragen (border-slate-100). */
  --dash-hairline: #f1f5f9;
  /* Die Umrandung der hellen Karten - eine Stufe dunkler (slate-200). Die
     Haarlinie waere hier zu leise: die Karten stehen auf ihrer eigenen
     hellen Flaeche im Weiss des Bentos, und ohne sichtbare Kante schwimmen
     sie darin. */
  --dash-card-outline: #e2e8f0;
  --dash-accent: #4f46e5;
  --dash-accent-soft: #eef2ff;
  /* Eine Rundung fuer alle Karten des Panels - gemessen an der Vorlage
     (25px). Kein Schatten, und als Rand dieselbe Haarlinie wie im Profil. */
  --dash-card-radius: 25px;
  /* Die schwarze Posting-Karte. Eigene Marken statt roher Farbwerte, damit
     Flaeche und Schrift darauf an einer Stelle stimmen - auf Schwarz traegt
     weder das Panel-Indigo noch das Panel-Grau genug Kontrast. */
  --dash-black: #0f172a;
  --dash-black-ink: #ffffff;
  --dash-black-muted: #94a3b8;
  --dash-black-accent: #a5b4fc;
  --dash-black-hairline: rgba(255, 255, 255, 0.14);
  --dash-black-ring: rgba(255, 255, 255, 0.2);
  /* Mnyra Waiter hat seine eigenen Farben - schwarze Flaeche, weisses "MNYRA",
     rotes "WAITER". Genau das Rot, das die Waiter-App traegt (rose-500), damit
     die Karte hier und die App dahinter als dasselbe lesen. */
  --dash-waiter: #f43f5e;
  --dash-waiter-soft: rgba(244, 63, 94, 0.16);
  --dash-waiter-ring: rgba(244, 63, 94, 0.35);
  /* Und ihre Flaeche ist wirklich schwarz, nicht das dunkle Blau der
     Posting-Karte (--dash-black: #0f172a). Die beiden stehen uebereinander -
     mit derselben Farbe waeren es zwei Haelften einer Flaeche statt zwei
     Karten. Der Schriftzug steht dabei wie auf den anderen Karten: "Mnyra
     Waiter", nicht in Grossbuchstaben. */
  --dash-waiter-plane: #000000;
  /* Das Bento unter der Karte: nur oben gerundet, weil es bis an die
     Panel-Raender und bis ans Seitenende laeuft. Dieselbe Rundung wie das
     Bento des Feed-Gates (--feed-location-gate-bento-radius: 2.5rem), damit
     beide Flaechen in der App gleich anfangen. Der Auslauf ist genau das
     untere Polster von .mnyra-dash: so endet die Flaeche mit der Seite.
     Die Faecher darin sind etwas kleiner gerundet als die Karte darueber,
     damit sie als Inhalt der Flaeche lesen und nicht als Karten darauf. */
  --dash-bento-radius: 40px;
  --dash-bento-tail: 112px;
  --dash-bento-cell-radius: 20px;
  /* Die obere Kante des Bentos traegt denselben weichen Schatten wie der
     Header - nach oben gedreht, weil die Flaeche hier von unten kommt. */
  --dash-bento-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);
  /* Das Bildfenster der Kennzahl-Karten. Eine Zahl fuer alle vier, damit die
     Reihe eine Linie haelt - und die Zahl, auf die die beiden festen Fotos
     zugeschnitten sind. */
  --dash-hl-media: 140px;
  color: var(--dash-ink);
  font-family: inherit;
}
/* Als installierte App gibt es keine Adressleiste, die den Viewport kleiner
   machen koennte - dort ist der dynamische Viewport der ehrlichere Wert.
   Dieselbe Ausnahme macht das Feed-Gate. */
.mnyra-dash * { box-sizing: border-box; }
/* Die Begruessung steht wie die Stadt-Ueberschrift im Feed: eine fette Zeile,
   darunter dicht die graue Unterzeile. Deshalb ein Stapel, keine Zeile mit
   Bild links - das Logo sitzt jetzt IN der ersten Zeile. */
.mnyra-dash__greet {
  min-height: 44px;
  margin: 4px 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* Das Logo steht so gross wie das Wort daneben - flach in der Seite, nur mit
   abgerundeten Ecken. Kein Indigo-Lila-Ring mehr, kein Schatten: mit Rahmen
   stand das Bild vor der Seite statt darin. Die Haarlinie bleibt, damit ein
   weisses Logo nicht randlos in die weisse Seite laeuft. */
.mnyra-dash__greet-logo {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
}
.mnyra-dash__greet-logo img,
.mnyra-dash__greet-logo-fallback {
  width: 100%;
  height: 100%;
  border-radius: 7px;
  border: 1px solid var(--dash-hairline);
  background: #ffffff;
  object-fit: cover;
  display: block;
}
.mnyra-dash__greet-logo-fallback {
  background: var(--dash-plane);
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-dash__greet-logo-fallback svg,
.mnyra-dash__greet-logo-fallback i {
  width: 13px;
  height: 13px;
  display: block;
}
/* Genau die Ueberschrift der Stadt im Feed: text-xl, font-black,
   tracking-tight, slate-900. */
.mnyra-dash__greet-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin: 0;
  color: var(--dash-ink);
}
/* Dieselbe Farbe wie die Ueberschrift, in der sie steht. */
.mnyra-dash__greet-hello { color: var(--dash-ink); }
/* Und die Unterzeile genau wie unter der Stadt: 11px, halbfett, slate-400,
   dicht an der Zeile darueber. */
.mnyra-dash__greet-sub {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  margin: 2px 0 0;
  color: var(--dash-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Die Kennzahl-Reihe unter der Begruessung - dieselbe Machart wie die
   Highlight-Karten der Lokale-Seite: eine waagerechte Reihe, die bis an beide
   Bildschirmraender laeuft, aber links dort anfaengt, wo auch alles andere im
   Panel anfaengt.
   Die negative Marge ist genau das Seitenpolster von .mnyra-dash, das Polster
   darin schiebt die erste Karte wieder in die Flucht. So laeuft die Reihe unter
   den Rand hinaus, ohne dass die erste Karte springt.
   Die 34px Abstand zur Begruessung sind dieselben, die vorher die schwarze
   Karte hier hatte (16px Aussenmarge der Begruessung + 18px). */
.mnyra-dash__hl {
  margin: 28px -28px 0;
  padding: 0 28px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 28px;
  overscroll-behavior-x: contain;
  /* Wie in der Spots-Reihe im Feed: der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen auf der Reihe verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mnyra-dash__hl::-webkit-scrollbar { display: none; }
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+28px Polster), abzueglich der beiden
   Luecken zwischen den drei angeschnittenen Karten. */
.mnyra-dash__hl-card {
  flex: 0 0 calc((100% + 28px - 20px) / 2.5);
  /* Bildfenster + Abstand + Textblock + Polster unten. Die Karte gibt dem Text
     unter dem Bild Luft, statt ihn an die Kante zu setzen. Der Textblock traegt
     zwei Zeilen Beschriftung (25px) und darunter die Zahl - deshalb 88px und
     nicht mehr 74px. */
  height: calc(var(--dash-hl-media) + 88px);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
  background: var(--dash-surface);
  padding: 0;
  scroll-snap-align: start;
  cursor: pointer;
  text-align: left;
  font: inherit;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.mnyra-dash__hl-card:active { transform: scale(0.98); }
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.mnyra-dash__hl-tail { flex: 0 0 18px; }
/* Alle Bilder stehen im selben Fenster oben in der Karte - gleiche Hoehe auf
   jeder Karte, egal welches Format das Bild mitbringt. Vorher richtete sich
   die Hoehe nach dem Bild, und die Reihe sah dadurch ungleich aus.
   Das Fenster ist etwas breiter als hoch (--dash-hl-media). Ein hochformatiges
   Bild wird darin oben und unten beschnitten und behaelt seine volle Breite;
   nur ein Bild, das noch flacher liegt als das Fenster, verliert etwas an den
   Seiten. Die beiden festen Fotos sind auf genau dieses Verhaeltnis
   zugeschnitten und werden deshalb gar nicht beschnitten.
   Die Maske loest die Unterkante auf, damit das Bild nicht mit einer harten
   Linie endet, sondern in das Weiss darunter uebergeht. */
.mnyra-dash__hl-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--dash-hl-media);
  object-fit: cover;
  object-position: center;
  display: block;
}
/* Die Flaeche unter dem Bild: sie traegt die Karte, wenn ein Bild fehlt oder
   nicht laedt - dann steht hier statt eines Lochs eine ruhige Flaeche mit
   Symbol, dieselbe wie in den Faechern des Bentos. Das Symbol sitzt oben, wo
   sonst das Bild steht, nicht in der Mitte der ganzen Karte. */
.mnyra-dash__hl-plate {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--dash-hl-media);
  background: var(--dash-plane);
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-dash__hl-plate svg,
.mnyra-dash__hl-plate i { width: 26px; height: 26px; display: block; }
/* Ueber dem Bildfenster lag frueher ein weisser Verlauf, der seine Unterkante
   ausblendete. Er ist weg: das Bild steht jetzt ganz und scharf im Fenster und
   endet an dessen Kante. Beschriftung und Zahl standen ohnehin schon unter dem
   Fenster im Weissen - fuer sie aendert sich dadurch nichts. */
/* Beschriftung und Zahl stehen unter dem Bildfenster, mit Abstand dazu. Die
   14px sind dieser Abstand - er faengt dort an, wo das Fenster endet. */
.mnyra-dash__hl-body {
  position: absolute;
  left: 12px;
  right: 12px;
  top: calc(var(--dash-hl-media) + 14px);
  z-index: 2;
}
/* Zwei Zeilen, immer - auch wenn die Beschriftung nur eine braucht.
   "Skanime n'tavolina" passt auf dieser Kartenbreite nicht in eine Zeile;
   abgeschnitten waere sie unlesbar. Der Platz fuer die zweite Zeile ist
   deshalb auf JEDER Karte reserviert (min-height), nicht nur wo er gebraucht
   wird: so stehen die Zahlen aller vier Karten auf derselben Hoehe. Eine
   dritte Zeile gibt es nicht - danach endet die Beschriftung mit Punkten. */
.mnyra-dash__hl-label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  min-height: 25px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: var(--dash-muted);
  overflow: hidden;
}
.mnyra-dash__hl-value {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--dash-ink);
  font-variant-numeric: tabular-nums;
}
/* Steht noch kein Beitrag da, tritt dieser Satz an die Stelle der Zahl - und
   nimmt genau ihre Hoehe ein: zwei Zeilen zu 11px sind so hoch wie eine Zahl
   zu 22px. Die Karte bleibt dadurch so hoch wie ihre Nachbarn. */
/* Steht noch kein Beitrag da, tritt dieser Satz an die Stelle der Zahl. Er
   nimmt genau ihre Hoehe ein, damit die Karte so hoch bleibt wie ihre
   Nachbarn - und er ist kurz genug fuer eine Zeile. */
.mnyra-dash__hl-empty {
  display: flex;
  align-items: center;
  min-height: 23px;
  margin: 5px 0 0;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--dash-ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Das Auge vor der Zahl des Beitrags: es sagt "gesehen", ohne dass ein Wort
   dafuer in der Beschriftung stehen muss. */
.mnyra-dash__hl-eye {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: var(--dash-muted);
}
.mnyra-dash__hl-eye svg,
.mnyra-dash__hl-eye i { width: 16px; height: 16px; display: block; }
/* Der Platzhalter steht genau dort und genau so hoch wie die Zahl, die gleich
   kommt: zwischen Laden und Zahl springt nichts. */
.mnyra-dash__hl-value--pending {
  width: 54px;
  height: 23px;
  margin-top: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
}
/* Verschlossene Karte: das Bild bleibt scharf und ganz zu sehen - verschlossen
   ist die ZAHL, nicht das Motiv. An ihrer Stelle steht das Schild. */
/* Das Schild auf der hellen Karte: dunkel gefuellt, damit es sich vom Weiss
   abhebt - auf Weiss waere ein weisses Schild nicht zu sehen. */
.mnyra-dash__hl-lock {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0 0;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--dash-black);
  border: 1px solid var(--dash-black);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--dash-black-ink);
}
.mnyra-dash__hl-lock svg,
.mnyra-dash__hl-lock i { width: 11px; height: 11px; display: block; }
/* Die Karte, die auf ihr Bild wartet (der beste Beitrag): dieselbe Flaeche und
   Rundung wie die fertige Karte, damit beim Eintreffen nichts springt. */
.mnyra-dash__hl-card--pending {
  background: var(--dash-plane);
  border-color: var(--dash-hairline);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  cursor: default;
}
/* "Posto n'Zbulo": erste Karte im Bento. Ueberschrift, Untertitel, darunter
   die Aktionszeile mit dem Plus. */
.mnyra-dash__composer {
  background: var(--dash-black);
  /* Rand in der Flaechenfarbe - ausdruecklich gesetzt, weil die Karte ein
     <button> ist und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-black);
  border-radius: var(--dash-card-radius);
  padding: 18px;
}
/* Die ganze Karte ist der Knopf. Sie sieht aus wie vorher - nur nimmt jetzt
   jede Stelle den Tipp an, nicht nur ein Streifen darin. */
.mnyra-dash__composer--tap {
  display: block;
  width: 100%;
  text-align: left;
  font: inherit;
  /* Die Waiter-Karte ist ein <a>, weil sie aus der App hinausfuehrt - ohne das
     hier zoege der Browser eine Linie unter jedes Wort darin. */
  text-decoration: none;
  color: var(--dash-black-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.mnyra-dash__composer--tap:active { transform: scale(0.99); }
/* Groesse und Gewicht der Ueberschrift bleiben unveraendert, nur die Farbe
   traegt jetzt die schwarze Flaeche. Als Kind eines <button> steht sie in
   einem <span> - der braucht die Blockform ausdruecklich. */
.mnyra-dash__composer-title {
  display: block;
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--dash-black-ink);
}
.mnyra-dash__composer-accent { color: var(--dash-black-accent); }
/* Untertitel: dasselbe Grau wie im Panel, auf Schwarz noch gut lesbar. */
.mnyra-dash__composer-sub {
  display: block;
  margin: 5px 0 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--dash-black-muted);
}
/* Die Aktionszeile der grossen Karte: eine Haarlinie trennt sie vom Text,
   darunter das Plus im Kreis, die Beschriftung und rechtsbuendig der Pfeil.
   Kein zweiter Knopf - die Karte selbst nimmt den Tipp an. */
.mnyra-dash__composer-cta {
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid var(--dash-black-hairline);
  display: flex;
  align-items: center;
  gap: 10px;
}
.mnyra-dash__composer-cta-icon {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--dash-black-ring);
  background: transparent;
  /* Plus und Beschriftung stehen weiss auf der schwarzen Karte - das Indigo
     der Ueberschrift traegt hier unten zu wenig. */
  color: var(--dash-black-ink);
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Die Karte kommt ohne den Tailwind-Build aus: Symbolgroessen stehen hier. */
.mnyra-dash__composer-cta-icon svg,
.mnyra-dash__composer-cta-icon i {
  width: 15px;
  height: 15px;
  display: block;
}
.mnyra-dash__composer-cta-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.2;
  color: var(--dash-black-ink);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__composer-cta-chevron {
  margin-left: auto;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: var(--dash-black-muted);
}
.mnyra-dash__composer-cta-chevron svg,
.mnyra-dash__composer-cta-chevron i {
  width: 16px;
  height: 16px;
  display: block;
}
/* Dieselbe Karte in hell: Form, Masse und Abstaende bleiben, nur die Farben
   kommen aus dem Panel statt von der schwarzen Flaeche. Damit steht die
   Offerten-Karte in derselben Farbwelt wie "Ndrysho menune" und
   "Oferta & Reklama" darunter - ruhige Flaeche, Haarlinie, das Indigo im
   Symbol. Zwei schwarze Karten uebereinander waeren zu schwer gewesen. */
.mnyra-dash__composer--plane {
  background: var(--dash-plane);
  /* Eine sichtbare Umrandung, nicht die Haarlinie der Faecher: die stand auf
     der eigenen Flaeche der Karte (#f8fafc) praktisch im Nichts, und die Karte
     schwamm damit im Weiss des Bentos. Eine Stufe dunkler (slate-200) zieht
     die Kante sauber nach, ohne dass sie als Rahmen auffaellt. Die Linie IN
     der Karte - ueber der Aktionszeile - bleibt die leisere: sie trennt
     innen, die Umrandung grenzt nach aussen ab. */
  border-color: var(--dash-card-outline);
  color: var(--dash-ink);
}
/* Das Abzeichen auf einer Karte: die Zahl der Vorgaenge, die das Lokal noch
   nicht gesehen hat. Es sitzt in der Ueberschrift, damit es die Karte nicht
   breiter macht - und traegt sein eigenes aria-label, weil eine rote Blase
   allein fuer Screenreader nichts sagt. */
.mnyra-dash__composer-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  margin-left: 8px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--dash-waiter);
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  vertical-align: middle;
}
.mnyra-dash__composer--plane .mnyra-dash__composer-title { color: var(--dash-ink); }
.mnyra-dash__composer--plane .mnyra-dash__composer-accent { color: var(--dash-accent); }
.mnyra-dash__composer--plane .mnyra-dash__composer-sub { color: var(--dash-muted); }
.mnyra-dash__composer--plane .mnyra-dash__composer-cta { border-top-color: var(--dash-hairline); }
/* Das Symbol traegt dieselbe weiche Indigo-Flaeche wie die Kacheln - auf hell
   ist der Ring der schwarzen Karte kaum zu sehen. */
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-icon {
  border-color: transparent;
  background: var(--dash-accent-soft);
  color: var(--dash-accent);
}
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-label { color: var(--dash-ink); }
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-chevron { color: var(--dash-muted); }
/* Und dieselbe Karte in den Farben von Mnyra Waiter. Sie behaelt die schwarze
   Grundform - nur der Akzent wechselt von Indigo auf das Rot der Waiter-App.
   Der Schriftzug steht in Grossbuchstaben: er ist eine Marke, kein Satz.
   Als einzige Karte des Panels fuehrt sie aus der App hinaus; das Rot ist das,
   woran man Waiter drueben wiedererkennt. */
.mnyra-dash__composer--waiter {
  background: var(--dash-waiter-plane);
  border-color: var(--dash-waiter-plane);
}
.mnyra-dash__composer--waiter .mnyra-dash__composer-accent { color: var(--dash-waiter); }
/* Der Satz darunter steht hier weiss, nicht im Grau der anderen Karten: auf
   wirklich Schwarz traegt das Grau zu wenig. */
.mnyra-dash__composer--waiter .mnyra-dash__composer-sub { color: var(--dash-black-ink); }
.mnyra-dash__composer--waiter .mnyra-dash__composer-cta-icon {
  border-color: var(--dash-waiter-ring);
  background: var(--dash-waiter-soft);
  color: var(--dash-waiter);
}
.mnyra-dash__section { margin-top: 14px; }
.mnyra-dash__section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 10px;
}
.mnyra-dash__section-title {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dash-ink-2);
  margin: 0;
}
.mnyra-dash__section-link {
  border: none;
  background: none;
  padding: 0;
  font-size: 11px;
  font-weight: 800;
  color: var(--dash-accent);
  cursor: pointer;
}
/* Das Bento: eine helle Flaeche unter der schwarzen Karte. Sie traegt alles,
   was unter der Karte kommt - Schnellzugriffe, Kennzahlen, letzte Beitraege -
   und laeuft dabei bis ans Ende der Seite.
   Die negative Marge ist genau das Seitenpolster von .mnyra-dash: so reicht
   die Flaeche bis an die Panel-Raender, waehrend ihr Inhalt in der Flucht der
   Karte darueber bleibt. Weil sie an den Raendern endet und unten weiterlaeuft,
   sind nur die oberen Ecken gerundet - in derselben Rundung wie das Bento des
   Feed-Gates. */
.mnyra-dash__bento {
  /* Der Abstand nach oben ist die Luft zwischen der Kennzahl-Reihe und der
     Flaeche. Er ist bewusst gross: die Reihe soll als eigenes Stueck lesen und
     nicht an der Flaeche kleben, die gleich darunter anfaengt. */
  /* Nach unten polstert das Bento nur noch sich selbst. Frueher zog eine
     negative Marge denselben Betrag wieder ab, damit seine Flaeche bis ans
     Seitenende reichte - mit dem Fuss dahinter waere genau das ein Fehler: die
     Marge zoege ihn um diesen Betrag nach oben, mitten in die Flaeche hinein. */
  margin: 72px -28px 0;
  padding: 22px 28px var(--dash-bento-tail);
  background: var(--dash-surface);
  border-top: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-radius) var(--dash-bento-radius) 0 0;
  /* Dieselbe weiche Kante wie unter dem Header, nur nach oben gedreht: die
     Flaeche beginnt sichtbar, statt an der Haarlinie einfach umzuschlagen.
     Es ist der Schatten, den auch das Bento der Lokale-Seite traegt. */
  box-shadow: var(--dash-bento-shadow);
}
/* Alles im Bento haelt denselben Abstand zum Stueck darueber. Das erste
   Stueck - die Tab-Leiste - braucht keinen: dort ist das Polster des Bentos
   schon sein Abstand. */
.mnyra-dash__bento > .mnyra-dash__section,
.mnyra-dash__bento > .mnyra-dash__embed,
.mnyra-dash__bento > .mnyra-dash__composer { margin-top: 22px; }
.mnyra-dash__bento > .mnyra-dash__tabs { margin-top: 0; }
/* Die Leiste braucht Luft nach unten, deutlich mehr als der Abstand zwischen
   zwei Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Mit 44px liest sie als Kopf der Flaeche und nicht als erste Karte in
   einer Reihe von Karten. */
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__composer,
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__embed,
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__section { margin-top: 44px; }
/* Die Tab-Leiste oben im Bento: Funksionet, Analitika, Opsionet.
   Drei Knoepfe, sonst nichts - kein Grund, kein Rahmen, kein Polster um sie
   herum. Frueher lagen sie in einem eigenen Kasten; der schob sie um seine
   Polsterbreite nach innen und brachte sie damit aus der Flucht der Karten
   darunter. Ohne ihn stehen sie genau dort, wo auch "Posto n'Mnyra" anfaengt
   und aufhoert - links wie rechts. */
.mnyra-dash__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
/* Symbol und Wort stehen in EINER Zeile und auf EINER Grundlinie: beide sind
   Flex-Kinder mit gleicher Ausrichtung, das Symbol in fester Groesse. Genau
   daran gehen solche Leisten sonst schief - ein Symbol, das seine Hoehe aus
   der Zeile zieht, sitzt auf jeder Zeile anders. */
.mnyra-dash__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  padding: 11px 8px;
  border: 1px solid var(--dash-hairline);
  /* Ganz rund, wie die Zeitraum-Knoepfe der Analitika. Beide sagen dasselbe -
     "waehle eines von mehreren" - und sollen deshalb gleich aussehen. */
  border-radius: 999px;
  background: var(--dash-plane);
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  color: var(--dash-ink-2);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier.
   "block" nimmt ihnen die Grundlinien-Luecke, die ein Inline-Element unter
   sich laesst - sonst saesse das Wort daneben minimal zu hoch. */
.mnyra-dash__tab svg,
.mnyra-dash__tab i {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  display: block;
}
.mnyra-dash__tab-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Der gewaehlte Knopf traegt dieselbe Flaeche wie die Posting-Karte darunter:
   dasselbe Schwarz, dieselbe weisse Schrift. Beides ist das Gewichtigste auf
   seiner Hoehe, und beides gehoert zusammen. */
.mnyra-dash__tab[aria-selected="true"] {
  background: var(--dash-black);
  border-color: var(--dash-black);
  color: var(--dash-black-ink);
}
.mnyra-dash__tab:active { transform: scale(0.98); }
/* Analitika und Opsionet bringen ihre eigene Ansicht mit - samt eigenem
   Seitenpolster. Das Bento hat seines schon; beide zusammen waeren doppelt.
   Der Rahmen nimmt deshalb das Polster des Bentos zurueck und laesst der
   Ansicht darin ihr eigenes. */
.mnyra-dash__embed {
  margin-left: -28px;
  margin-right: -28px;
}
/* Bis an den unteren Rand des Bentos laeuft die eingesetzte Ansicht nur, wenn
   NICHTS mehr hinter ihr kommt. In der Analitika stehen darunter noch die
   letzten Beitraege - dort zoege der negative Rand sie unter die Ansicht. */
.mnyra-dash__embed:last-child { margin-bottom: calc(-1 * var(--dash-bento-tail)); }
/* Die Faecher der Kennzahlen-Reihe (.mnyra-dash__kpi*) standen hier. Mit der
   Reihe selbst sind auch sie weg - die Analitika bringt ihre eigene Form mit. */
/* Auch die Beitragsliste ist ein Fach des Bentos. */
.mnyra-dash__posts {
  background: var(--dash-plane);
  /* Rand ausdruecklich gesetzt, weil die Kacheln <button> sind und der
     Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
  padding: 6px;
}
.mnyra-dash__post {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  min-height: 64px;
  /* Auf der ruhigen Flaeche des Fachs trennt die Haarlinie, nicht die
     Flaeche selbst - die haette dort keinen Kontrast mehr. */
  border-bottom: 1px solid var(--dash-hairline);
}
.mnyra-dash__post:last-child { border-bottom: none; }
.mnyra-dash__post-thumb {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--dash-plane);
  overflow: hidden;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
}
.mnyra-dash__post-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mnyra-dash__post-main { min-width: 0; flex: 1; }
.mnyra-dash__post-caption {
  font-size: 12px;
  font-weight: 700;
  color: var(--dash-ink);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__post-meta {
  font-size: 10px;
  font-weight: 700;
  color: var(--dash-muted);
  margin: 4px 0 0;
  font-variant-numeric: tabular-nums;
}
.mnyra-dash__state {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 28px 18px;
  text-align: center;
}
.mnyra-dash__state-title { font-size: 14px; font-weight: 800; color: var(--dash-ink); margin: 0 0 6px; }
.mnyra-dash__state-body { font-size: 12px; color: var(--dash-ink-2); margin: 0; line-height: 1.6; }
.mnyra-dash__retry {
  margin-top: 14px;
  border: none;
  background: var(--dash-ink);
  color: var(--dash-surface);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
}
/* Der Hinweis hinter den verschlossenen Karten. Bewusst schlicht gehalten -
   die Gestaltung kommt spaeter; was hier steht, ist nur der Weg dorthin. */
.mnyra-dash__paywall {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.55);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
.mnyra-dash__paywall-card {
  width: 100%;
  max-width: 320px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 22px;
  text-align: center;
}
.mnyra-dash__paywall-title { font-size: 15px; font-weight: 900; color: var(--dash-ink); margin: 0 0 6px; }
.mnyra-dash__paywall-body { font-size: 12px; font-weight: 600; line-height: 1.6; color: var(--dash-ink-2); margin: 0 0 16px; }
/* Der Platzhalter beim Laden steht dort, wo gleich eine Karte steht - gleiche
   Rundung, damit beim Erscheinen nichts springt. */
.mnyra-dash__skeleton {
  border-radius: var(--dash-bento-cell-radius);
  background: var(--dash-plane);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  border: 1px solid transparent;
}
@keyframes mnyraDashPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
`;function pa(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(je)))try{const a=e.createElement("style");a.id=je,a.textContent=ua,e.head?.appendChild(a)}catch{}}function x(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function P(e,a,t=""){if(typeof e!="function")return"";try{return e(a,t)||""}catch{return""}}const ma=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function fa({businessType:e="",isShopCatalog:a=!1}={}){if(a)return"shop";const t=String(e||"").trim().toLowerCase();return ma.includes(t)?"hotel":"restaurant"}function ga(e=new Date().getHours()){const a=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return a>=5&&a<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:a>=11&&a<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:a>=18&&a<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function ba({name:e="",logoUrl:a="",hour:t=new Date().getHours(),iconFn:n}={}){const r=ga(t),s=x(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${a?`<img src="${x(a)}" alt="${s}" title="${s}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${s}">${P(n,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${x(r.text)}</p>
    </div>
  `}function ya({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function _a({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function xa({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const Be=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function va(e="restaurant"){const a=String(e||"").trim().toLowerCase();return Be[a]||Be.restaurant}function wa({iconFn:e,kind:a="restaurant",showEditor:t=!0}={}){if(!t)return"";const n=va(a);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${x(n.accent)}</span> ${x(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${x(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${x(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const ka="/waiter?from=panel";function $a({iconFn:e,showEditor:a=!0}={}){return a?`
    <a href="${ka}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function Sa({cards:e=[],iconFn:a}={}){const t=(Array.isArray(e)?e:[]).filter(r=>r&&r.key);if(!t.length)return"";const n=t.map((r,s)=>{const c=x(r.label||"");if(r.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const u=s<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let b="";r.imageUrl?b=`<img class="mnyra-dash__hl-media" src="${x(r.imageUrl)}" alt="" ${u} decoding="async" onerror="this.style.display='none'" />`:r.videoUrl&&(b=`<video class="mnyra-dash__hl-media" src="${x(r.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const w=`
      <span class="mnyra-dash__hl-plate">${P(a,r.iconName||"image","w-6 h-6")}</span>
      ${b}
    `,p=r.withEye?`<span class="mnyra-dash__hl-eye">${P(a,"eye","w-4 h-4")}</span>`:"";let m;r.locked?m=`<span class="mnyra-dash__hl-lock">${P(a,"lock","w-3 h-3")}Me pagesë</span>`:r.loading?m='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':r.emptyText?m=`<span class="mnyra-dash__hl-empty">${x(r.emptyText)}</span>`:m=`<span class="mnyra-dash__hl-value">${p}${x(r.value||"0")}</span>`;let v;r.locked?v=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${x(r.key)}"`:r.composer?v=`class="mnyra-dash__hl-card" data-dashboard-composer="${x(r.composer)}"`:v=`class="mnyra-dash__hl-card"${r.panelTab?` data-dashboard-panel-tab="${x(r.panelTab)}"`:""}`;const z=r.locked?`${c} – me pagesë`:`${c} ${r.emptyText||r.value||""}`.trim();return`
      <button type="button" ${v} data-dashboard-metric="${x(r.key)}" aria-label="${x(z)}">
        ${w}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${c}</span>
          ${m}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-dash__hl" data-dashboard-metrics="${x(za(t))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function za(e=[]){return(Array.isArray(e)?e:[]).filter(a=>a&&a.key).map(a=>[a.key,a.label||"",a.value||"",a.emptyText||"",a.imageUrl||"",a.videoUrl||"",a.iconName||"",a.panelTab||"",a.composer||"",a.pending?"p":"",a.loading?"l":"",a.locked?"x":"",a.withEye?"e":""].join("~")).join("|")}const We=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function te(e=""){const a=String(e||"").trim().toLowerCase();return We.some(t=>t.id===a)?a:"funksionet"}function Aa({activeTab:e="funksionet",iconFn:a}={}){const t=te(e);return`<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${We.map(r=>{const s=r.id===t;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${x(r.id)}"
        aria-selected="${s?"true":"false"}"
        class="mnyra-dash__tab"
      >${P(a,r.iconName,"w-4 h-4")}<span class="mnyra-dash__tab-label">${x(r.label)}</span></button>
    `}).join("")}</div>`}function qe(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function Da({posts:e=[],iconFn:a}={}){const t=Array.isArray(e)?e:[];let n="";return t.length?(n=t.map(r=>{const s=[r.dateLabel,`${I(r.likesCount||0)} Likes`,`${I(r.commentsCount||0)} Kommentare`];return Number(r.impressions||0)>0&&s.push(`${I(r.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${r.thumbUrl?`<img src="${x(r.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:P(a,r.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${x(r.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${x(s.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `}).join(""),n=`<div class="mnyra-dash__posts">${n}</div>`):n=`
      <div class="mnyra-dash__state" style="border:none;">
        <p class="mnyra-dash__state-title">Ende nuk ka postime</p>
        <p class="mnyra-dash__state-body">Posto foton ose videon tende te pare qe vizitoret te te zbulojne ne feed.</p>
        <button type="button" class="mnyra-dash__retry" data-nav="upload" data-upload-intent="chooser">Neuer Beitrag</button>
      </div>
    `,`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="profile">Profil öffnen</button>
      </div>
      ${n}
    </div>
  `}function Pa(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function Ma({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${x(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function ja(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Ba(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),a=Array.from({length:4},(t,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    ${ja()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${qe(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>').join("")}
      </div>
      ${a}
    `)}
  `}function Fa({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${x(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Ra(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Oa="menyra_social_dashboard_cache_v1::",Fe="menyra_social_composer_products_v1::",Re=2500,Oe=1200,Ca=6,Ea=3,Ta=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),Na=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function j(e){const a=Number(e);return Number.isFinite(a)?a:0}function Ka(e={}){const a=String(e.createdAtClient||"").trim();if(a){const n=new Date(a);if(!Number.isNaN(n.getTime()))return n}const t=e.createdAt;if(t&&typeof t.toDate=="function")try{const n=t.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function Ga(e="",a={}){const t=Array.isArray(a.media)&&a.media.length?a.media[0]:{},n=String(t.type||a.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",r=String(t.thumbUrl||(n==="image"?t.url:"")||a.thumbUrl||"").trim(),s=n==="video"?String(t.url||a.mediaUrl||"").trim():"",c=Ka(a);return{id:String(e||"").trim(),caption:String(a.caption||"").trim(),mediaType:n,thumbUrl:r,videoUrl:s,likesCount:j(a.likesCount),commentsCount:j(a.commentsCount),impressions:0,dateLabel:c?c.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:c?c.getTime():0}}function Ia({days:e=[],todayKey:a="",rawPosts:t=[]}={}){const n=Array.isArray(e)?e:[],r=ve(n),s=n.find(p=>String(p?.date||p?.id||"").trim()===String(a||"").trim()),c=ve(s?[s]:[]),u=r.merged?.posts&&typeof r.merged.posts=="object"?r.merged.posts:{},b=(Array.isArray(t)?t:[]).map(p=>Ga(p?.id,p?.data||{})).filter(p=>p.id).map(p=>({...p,impressions:j(u[p.id]?.impressions)})),w=b.slice().sort((p,m)=>m.createdAtMs-p.createdAtMs).slice(0,Ea);return{day:String(a||"").trim(),week:r.summary,today:c.summary,posts:w,latestPost:La(b)}}function La(e=[]){const a=(Array.isArray(e)?e:[]).filter(t=>t&&t.id);return a.length?a.slice().sort((t,n)=>j(n.createdAtMs)-j(t.createdAtMs)||j(n.impressions)-j(t.impressions)||j(n.likesCount)-j(t.likesCount))[0]:null}function Ua({profile:e={},restaurant:a={}}={}){return bt({profile:e,restaurant:a,feature:"qr"})}function Ha(e={}){const a=e&&typeof e=="object"?e:{};return String(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||a.bannerUrl||"").trim()}function Za({model:e=null,coverUrl:a="",subscribed:t=!1,assets:n={}}={}){const r=e?.today||{},s=!e,c=e?.latestPost||null,u=[];if(s)u.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!c)u.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const b=String(c.thumbUrl||"").trim();u.push({key:"latestPost",label:"Postimi fundit",value:I(j(c.impressions)),withEye:!0,imageUrl:b,videoUrl:b?"":String(c.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return u.push({key:"profileViews",label:"Vizitor n'profil",value:I(j(r.profileViews)),withEye:!0,loading:s,imageUrl:String(a||"").trim(),iconName:"user",panelTab:"analitika"}),u.push({key:"menuOpens",label:"Vizitor n'meny",value:I(j(r.menuOpens)),withEye:!0,loading:s&&t,locked:!t,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),u.push({key:"qrScans",label:"Skanime n'tavolina",value:I(j(r.qrScans)),withEye:!0,loading:s&&t,locked:!t,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),u}function un({state:e,renderFn:a,documentObj:t,firestoreApi:n={},profileApi:r={},composerApi:s={},viewApi:c={},iconFn:u,storageObj:b}={}){const w=t||(typeof document>"u"?null:document),p=w?.defaultView||(typeof window>"u"?null:window),m=typeof a=="function"?a:()=>{},v=b||(typeof localStorage>"u"?null:localStorage),z=typeof r.getBusinessProfileTypeFn=="function"?r.getBusinessProfileTypeFn:(()=>""),A=typeof r.isShopCatalogProfileFn=="function"?r.isShopCatalogProfileFn:(()=>!1),R=typeof r.getRestaurantMetaByIdFn=="function"?r.getRestaurantMetaByIdFn:(()=>null),$=typeof r.resolveRestaurantLogoFn=="function"?r.resolveRestaurantLogoFn:(()=>""),k=typeof r.resolveOwnAvatarUrlFn=="function"?r.resolveOwnAvatarUrlFn:(()=>""),L=typeof c.renderAnalyticsViewFn=="function"?c.renderAnalyticsViewFn:(()=>""),ne=typeof c.renderSettingsViewFn=="function"?c.renderSettingsViewFn:(()=>""),Ye=typeof c.warmAnalyticsFn=="function"?c.warmAnalyticsFn:(()=>{});let he=!1,Z=0,ue=!1,K=null,W=null,q="",pe=!1,me=()=>null;const Qe=300;function re(){const o=e?.userProfile||{};return fa({businessType:z(o),isShopCatalog:A(o)})}function Je(o=""){const l=R(o)||{};return At(l).map(h=>({id:h.id,name:h.title,price:h.price??"",category:h.beds||h.tag||"",type:"room",imageUrl:h.imageUrl||""}))}function Xe(o=""){if(!v)return null;try{const l=v.getItem(`${Fe}${o}`);if(!l)return null;const h=JSON.parse(l),f=Array.isArray(h?.items)?h.items:null;return f&&f.length?f:null}catch{return null}}function et(o="",l=[]){if(v)try{v.setItem(`${Fe}${o}`,JSON.stringify({savedAt:Date.now(),items:l}))}catch{}}async function tt(o=""){const{db:l,collectionFn:h,queryFn:f,limitFn:y,getDocsFn:S}=n;if(!l||typeof h!="function"||typeof S!="function")throw new Error("Produktet nuk u ngarkuan.");const C=h(l,"restaurants",o,"menuItems"),M=typeof f=="function"&&typeof y=="function"?f(C,y(Qe)):C,E=await S(M),D=[];return E.forEach(G=>{const J=me(G?.id,G?.data?.()||{});J&&D.push(J)}),D.sort((G,J)=>G.name.localeCompare(J.name,"sq")),D}async function at(o="",l){const h=String(o||"").trim();if(!h)throw new Error("Produktet nuk u ngarkuan.");if(re()==="hotel")return Je(h);const f=tt(h).then(S=>(et(h,S),S)),y=Xe(h);return y?(typeof l=="function"?f.then(S=>l(S)).catch(()=>{}):f.catch(()=>{}),y):f}function fe(){return K?Promise.resolve(K):(W||(W=mt(()=>import("./business-composer-controller-D5Wf7YqC.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(o=>(me=typeof o?.normalizeComposerProductCore=="function"?o.normalizeComposerProductCore:(()=>null),K=o.createBusinessComposerController({documentObj:w,windowObj:w?.defaultView||null,api:{getRestaurantIdFn:()=>Y(),getBusinessMetaFn:()=>{const l=Y();if(!l)return{name:"",logoUrl:"",city:""};const h=xe(l),f=R(l)||{};return{name:h.name,logoUrl:h.logoUrl,city:String(f.city||"").trim()}},loadProductsFn:(l,h)=>at(l,h),getBusinessKindFn:()=>re(),uploadImageFn:s.uploadImageFn,uploadVideoFn:s.uploadVideoFn,captureVideoPosterFn:s.captureVideoPosterFn,createPostFn:s.createPostFn,createStoryFn:s.createStoryFn,formatPriceFn:s.formatPriceFn,getOptimizedImageUrlFn:s.getOptimizedImageUrlFn,escapeHtmlFn:s.escapeHtmlFn,iconFn:typeof u=="function"?u:void 0,afterPublishFn:async l=>{try{await Q({force:!0})}catch{}typeof s.afterPublishFn=="function"&&await s.afterPublishFn(l)}}}),K)).catch(o=>{throw W=null,console.error("[mnyra][dashboard] composer load failed",o),o})),W)}function ge(){const o=p?.navigator?.connection;return!o||typeof o!="object"?!1:o.saveData===!0?!0:/(^|-)2g$/.test(String(o.effectiveType||"").trim().toLowerCase())}function nt(){if(pe||K||!p||ge())return;pe=!0;const o=()=>{if(fe().catch(()=>{}),typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}};if(typeof p.requestIdleCallback=="function"){p.requestIdleCallback(o,{timeout:Re});return}p.setTimeout?.(o,Oe)}function rt(){if(he||!p||ge())return;he=!0;const o=()=>{try{Ye()}catch{}};if(typeof p.requestIdleCallback=="function"){p.requestIdleCallback(o,{timeout:Re});return}p.setTimeout?.(o,Oe)}function st(o="post"){const l=String(o||"").trim().toLowerCase(),h=l==="story"||l==="profile"?l:"post";if(typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}if(K){K.open(h);return}q=h,fe().then(f=>{const y=q||h;q="",f?.open?.(y)}).catch(()=>{q=""})}function se(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function be(o=""){const l=se(),h=String(o||"").trim();return String(l.restaurantId||"")===h||(l.restaurantId=h,l.model=null,l.status="idle",l.error="",l.loadedSignature="",l.paywall="",Z+=1),l}function Y(){const o=e?.userProfile||{};return String(o.restaurantId||o.staffRestaurantId||"").trim()}let ye="";function it(){const o=String(e?.user?.uid||"").trim();!o||ye===o||typeof r.ensureBusinessProfileFn=="function"&&(ye=o,Promise.resolve().then(()=>r.ensureBusinessProfileFn()).catch(l=>{console.warn("[mnyra][panel] business profile could not be resolved",l)}).finally(()=>{String(e?.user?.uid||"").trim()===o&&m()}))}function ot(){const o=String(e?.user?.uid||"").trim();if(!o)return!1;const l=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||l===o}function _e(o=""){return`${Oa}${o}`}function dt(o="",l=""){if(!v||!o)return null;try{const h=v.getItem(_e(o));if(!h)return null;const f=JSON.parse(h);return!f||typeof f!="object"||String(f.day||"").trim()!==String(l||"").trim()||!f.model||typeof f.model!="object"?null:f.model}catch{return null}}function lt(o="",l=null){if(!(!v||!o||!l))try{v.setItem(_e(o),JSON.stringify({day:l.day,model:l}))}catch{}}async function ct(o=""){const{db:l,collectionFn:h,queryFn:f,orderByFn:y,limitFn:S,getDocsFn:C}=n;if(!l||typeof h!="function"||typeof f!="function"||typeof y!="function"||typeof S!="function"||typeof C!="function")return[];const M=h(l,"restaurants",o,"socialPosts");return(await C(f(M,y("createdAt","desc"),S(Ca)))).docs.map(D=>({id:D.id,data:D.data()||{}})).filter(D=>{const G=String(D.data.status||"active").trim().toLowerCase();return G!=="deleted"&&G!=="hidden"})}async function Q({force:o=!1}={}){const l=Y(),h=be(l);if(!l)return;const f=ft({rangeKey:"7d"});if(!f)return;const y=`${l}::${f.toDay}`;if(!o&&h.loadedSignature===y&&h.status==="ready")return;if(!h.model){const M=dt(l,f.toDay);M&&(h.model=M,h.status="ready",m())}Z+=1;const S=Z;h.model||(h.status="loading",h.error="",m());try{const M={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:l},[E,D]=await Promise.allSettled([gt({...M,fromDay:f.fromDay,toDay:f.toDay}),ct(l)]);if(S!==Z)return;if(E.status==="rejected")throw E.reason;D.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",D.reason),h.model=Ia({days:E.value,todayKey:f.toDay,rawPosts:D.status==="fulfilled"?D.value:[]}),h.status="ready",h.error="",h.loadedSignature=y,lt(l,h.model)}catch(M){if(S!==Z)return;console.error("[mnyra][dashboard] load failed",M),h.model||(h.status="error",h.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}m()}function ht(){ue||!w||(ue=!0,w.addEventListener("click",o=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(o.target?.closest?.("[data-dashboard-retry]")){Q({force:!0});return}if(o.target?.closest?.("[data-dashboard-paywall-close]")){o.preventDefault(),se().paywall="",m();return}const l=o.target?.closest?.("[data-dashboard-metric-locked]");if(l){o.preventDefault(),se().paywall=String(l.getAttribute("data-dashboard-metric-locked")||"").trim(),m();return}const h=o.target?.closest?.("[data-dashboard-composer]");if(h){o.preventDefault(),st(h.getAttribute("data-dashboard-composer"));return}const f=o.target?.closest?.("[data-dashboard-panel-tab]");if(f){o.preventDefault();const y=te(f.getAttribute("data-dashboard-panel-tab"));if(y===te(e?.dashboardPanelTab))return;e.dashboardPanelTab=y,m()}}catch{}}))}function xe(o=""){const l=e?.userProfile||{},h=o?R(o)||{}:{},f=String(h.name||h.restaurantName||l.name||"").trim()||"Business";let y="";try{y=String(k()||"").trim()}catch{}if(!y)try{y=String($(h)||"").trim()}catch{}return{name:f,logoUrl:y,kind:re(),coverUrl:Ha(h),subscribed:Ua({profile:l,restaurant:h})}}function ut(o=""){try{if(!yt()||!o)return"";_t({restaurantId:o,onBadgeFn:()=>m()});const l=xt();return na({enabled:!0,unseenCount:l.unseen,activeOffers:l.activeOffers||0,todayBookings:l.today,iconFn:u})}catch{return""}}function pt(){pa(w),ht();const o=Y(),l=be(o);let h="";if(!o)it(),h=ot()?Ba():Ra();else{nt(),rt();const f=xe(o),y=te(e?.dashboardPanelTab);l.status==="idle"&&(l.status="loading",queueMicrotask(()=>{Q({force:!1})}));let S="";l.model?S=Da({posts:l.model.posts,iconFn:u}):l.status==="error"?S=Fa({message:l.error}):S=Pa();const C=`
        ${ut(o)}
        ${ya({iconFn:u})}
        ${$a({iconFn:u,showEditor:!!o})}
        ${_a({iconFn:u,showEditor:!!o})}
        ${xa({iconFn:u,showEditor:!!o})}
        ${wa({iconFn:u,kind:f.kind,showEditor:!!o})}
      `;let M;y==="analitika"?M=`
          <div class="mnyra-dash__embed">${L()}</div>
          ${S}
        `:y==="opsionet"?M=`<div class="mnyra-dash__embed">${ne()}</div>`:M=C;const E=Za({model:l.model,coverUrl:f.coverUrl,subscribed:f.subscribed,assets:Ta}),D=String(l.paywall||"").trim();h=`
        ${ba({name:f.name,logoUrl:f.logoUrl,iconFn:u})}
        ${Sa({cards:E,iconFn:u})}
        ${qe(`
          ${Aa({activeTab:y,iconFn:u})}
          ${M}
        `)}
        ${D?Ma({title:Na[D]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${h}
      </section>
    `}return Object.freeze({renderDashboardView:pt,loadDashboard:Q})}export{Ja as A,oe as G,wt as M,un as a,ae as b,kt as c,cn as d,dn as e,$e as f,ha as g,ln as h,ca as i,on as j,sn as k,Xt as l,en as m,zt as n,Ft as o,Xa as p,X as q,hn as r,Ee as s,nn as t,an as u,rn as v,tn as w,ea as x,At as y,Qa as z};
