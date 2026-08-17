const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-B0PRTMDX.js","chunks/domain-feed-social-eager-D4_FEqaI.js","chunks/domain-auth-B1kS5TG-.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-BHuuCUf1.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as Mt}from"./domain-auth-B1kS5TG-.js";import{f as V,r as Ct,l as Ft,s as Ce}from"./domain-analytics-oyJYW1vv.js";import{b as Ot}from"./domain-business-accounts-D8NpUhi6.js";import{i as Rt,e as Bt,a as Et}from"./domain-feed-social-eager-D4_FEqaI.js";const Tt=20,Nt=8;function E(e=""){return e==null?"":String(e).trim()}function pe(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function Gt(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${n}`}function It(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],E(t.imageUrl??t.image??t.photoUrl)],n=[];return a.forEach(r=>{const s=E(r);s&&!n.includes(s)&&n.push(s)}),n.slice(0,Nt)}function Kt(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},n=pe(a.persons??a.guests??a.capacity),r=pe(a.size??a.sizeSqm??a.area),s=It(a);return{id:E(a.id)||Gt(Date.now()+t),title:E(a.title??a.name),description:E(a.description??a.text).slice(0,400),imageUrl:s[0]||"",images:s,price:pe(a.price??a.pricePerNight),currency:E(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:E(a.beds??a.bedsLabel).slice(0,60),size:r==null?null:Math.min(500,Math.round(r)),tag:E(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function Lt(e=[]){return(Array.isArray(e)?e:[]).slice(0,Tt).map((t,a)=>Kt(t,{index:a}))}function Ut(e={}){return Lt((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function $n(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),E(e?.beds)&&t.push({icon:"bed",label:E(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Sn(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=E(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${n}`:`${n} ${a}`}const qe="all",Ht=Object.freeze([{key:qe,label:"Krejt",icon:"sparkles"},{key:"coffee",label:"Kafe",icon:"coffee"},{key:"drinks",label:"Pije",icon:"cup-soda"},{key:"food",label:"Ushqim",icon:"utensils"},{key:"dessert",label:"Ëmbëlsira",icon:"cake-slice"}]),Zt=Object.freeze(Ht.map(e=>e.key)),Vt="food",Wt="drinks",qt="unsure",Ye=Object.freeze([Object.freeze({key:Vt,label:"Ushqim",hint:"Mëngjes, drekë, darkë etj.",icon:"utensils",categories:Object.freeze(["food"])}),Object.freeze({key:Wt,label:"Pije",hint:"Kafe, ëmbëlsira, lëngje etj.",icon:"cup-soda",categories:Object.freeze(["coffee","drinks","dessert"])}),Object.freeze({key:qt,label:"Nuk e di",hint:"Gjitha ofertat për rreth teje.",icon:"sparkles",categories:Object.freeze([])})]);Object.freeze(Ye.map(e=>e.key));const zn=1,Yt=10,Pn=2,xe=Object.freeze([{key:"1-2",min:1,max:2,label:"1–2"},{key:"2-4",min:2,max:4,label:"2–4"},{key:"4-6",min:4,max:6,label:"4–6"},{key:"6+",min:6,max:99,label:"6+"}]),An=Object.freeze([{key:"now",label:"Tani",offsetMinutes:0},{key:"in30",label:"+30 min",offsetMinutes:30},{key:"in60",label:"+1 orë",offsetMinutes:60},{key:"later",label:"Më vonë",offsetMinutes:-1}]),Qt="claim",Fe="reservation",jn=7;function Qe(e=""){const t=String(e||"").trim().toLowerCase();return xe.find(a=>a.key===t)||null}const Y="Europe/Belgrade",Je=1440,me=["mon","tue","wed","thu","fri","sat","sun"],Oe=new Map;function Xe(e){const t=String(e||"").trim()||Y,a=Oe.get(t);if(a)return a;let n=null;try{n=new Intl.DateTimeFormat("en-GB",{timeZone:t,hour12:!1,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short"})}catch{n=Xe(Y)}return Oe.set(t,n),n}const Jt={mon:"mon",tue:"tue",wed:"wed",thu:"thu",fri:"fri",sat:"sat",sun:"sun"};function ve(e){if(e==null||e==="")return 0;if(typeof e=="number")return Number.isFinite(e)?e:0;if(e instanceof Date){const n=e.getTime();return Number.isNaN(n)?0:n}if(typeof e=="object"){if(typeof e.toDate=="function")try{const n=e.toDate(),r=n instanceof Date?n.getTime():NaN;return Number.isNaN(r)?0:r}catch{return 0}return Number.isFinite(Number(e.seconds))?Math.round(Number(e.seconds)*1e3):Number.isFinite(Number(e._seconds))?Math.round(Number(e._seconds)*1e3):0}const a=new Date(String(e)).getTime();return Number.isNaN(a)?0:a}function B(e){const t=ve(e);return t?new Date(t).toISOString():""}function Xt(e,t=Y){const a=ve(e)||Date.now(),n=Xe(t).formatToParts(new Date(a)),r=f=>{const m=n.find(x=>x.type===f);return m?m.value:""},s=r("year"),d=r("month"),u=r("day"),y=r("hour")==="24"?"00":r("hour"),_=r("minute"),p=String(r("weekday")||"").slice(0,3).toLowerCase();return{ms:a,dayKey:s&&d&&u?`${s}-${d}-${u}`:"",weekday:Jt[p]||"",minutes:(Number(y)||0)*60+(Number(_)||0),timeZone:String(t||"").trim()||Y}}function ea(e){const t=String(e??"").trim();if(!t)return-1;const a=t.match(/^(\d{1,2})\s*[:.：]?\s*(\d{2})?$/);if(!a)return-1;const n=Number(a[1]),r=a[2]===void 0?0:Number(a[2]);return!Number.isFinite(n)||!Number.isFinite(r)||n>24||r>59?-1:n*60+r}function Re(e){const t=Math.max(0,Math.round(Number(e)||0))%Je,a=Math.floor(t/60),n=t%60;return`${String(a).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function Be(e){return typeof e=="number"?Number.isFinite(e)?Math.max(0,Math.round(e)):-1:ea(e)}function ta(e,t){const a=Be(e);let n=Be(t);return a<0||n<0||n===a?null:(n<a&&(n+=Je),{start:a,end:n})}function aa(e=[]){const t=Array.isArray(e)?e:[],a=[];return t.forEach(n=>{if(!n||typeof n!="object")return;const r=ta(n.start??n.from,n.end??n.to);r&&a.push(r)}),na(a)}function na(e=[]){const t=(Array.isArray(e)?e:[]).filter(n=>n&&Number.isFinite(n.start)&&Number.isFinite(n.end)&&n.end>n.start).slice().sort((n,r)=>n.start-r.start||n.end-r.end),a=[];return t.forEach(n=>{const r=a[a.length-1];if(r&&n.start<=r.end){r.end=Math.max(r.end,n.end);return}a.push({start:n.start,end:n.end})}),a}const ra="active",Ee="paused",Te="archived",Ne="go",sa="public",I="percent",K="bundle",W="freeItem",q="specialPrice",ia=Object.freeze([I,K,W,q]),et=Object.freeze(["all","food","drinks"]),oa=Object.freeze(["food","drink","any_order","custom"]),da=Object.freeze({all:"",food:"në ushqim",drinks:"në pije"}),la=Object.freeze({food:"me porosi ushqimi",drink:"me porosi të pijes",any_order:"me çdo porosi"});function b(e="",t=240){return String(e??"").trim().slice(0,t)}const ye=9999999;function ca(e){if(typeof e=="number")return!Number.isFinite(e)||e<=0?0:Math.min(ye,Math.round(e*100));const t=String(e??"").trim().replace(/[^\d.,]/g,"");if(!t)return 0;const a=Math.max(t.lastIndexOf(","),t.lastIndexOf(".")),n=a<0?"":t.slice(a+1),s=n.length===1||n.length===2?`${t.slice(0,a).replace(/[.,]/g,"")}.${n}`:t.replace(/[.,]/g,""),d=Number.parseFloat(s);return!Number.isFinite(d)||d<=0?0:Math.min(ye,Math.round(d*100))}function de(e=0){const t=Math.max(0,Math.trunc(Number(e)||0));return t?`${(t/100).toFixed(2).replace(".",",")} €`:""}function Ge(e=0){const t=Math.max(0,Math.trunc(Number(e)||0));return t?(t/100).toFixed(2).replace(".",","):""}function T(e,t=0){const a=Math.trunc(Number(e));return!Number.isFinite(a)||a<0?t:a}function ua(e=""){const t=String(e||"").trim().toLowerCase();return t===Ee?Ee:t===Te?Te:ra}function ha(e=""){const t=String(e||"").trim().toLowerCase();return Zt.includes(t)?t:qe}function tt(e=""){return String(e||"").trim().toLowerCase()===Fe?Fe:Qt}function at(e="",t=0){const a=String(e||"").trim().toLowerCase();return a==="percent"||a==="discount"?I:a==="bundle"?K:a==="freeitem"||a==="free_item"?W:a==="specialprice"||a==="special_price"?q:a==="table"?"table":a==="custom"?"custom":t>0?I:"custom"}function _e(e,t){const a=Math.trunc(Number(e));return Number.isFinite(a)&&a>0?Math.min(ye,a):ca(t)}function we(e={}){const t=e&&typeof e=="object"?e:{},a=Math.min(90,Math.max(0,T(t.percent??t.discountPercent,0))),n=at(t.kind||t.type||t.offerType,a),r=String(t.scope||t.discountScope||"").trim().toLowerCase(),s=String(t.conditionType||t.condition||"").trim().toLowerCase(),d=_e(t.regularPriceCents,t.regularPrice),u=_e(t.goPriceCents,t.goPrice),y=u>0&&d>u?d-u:0,_={kind:n,percent:a,scope:et.includes(r)?r:"all",itemId:b(t.itemId,180),itemName:b(t.itemName||t.item||t.bundleTitle||t.productName||t.freeItem,160),priceText:b(t.priceText||t.price,60),regularPriceCents:d,goPriceCents:u,savingCents:y,savingPercent:y>0&&d>0?Math.round(y/d*1e4)/100:0,conditionType:oa.includes(s)?s:"",customCondition:b(t.customCondition,120),text:b(t.text,160)};return _.label=pa(_),_}function nt(e=""){const t=String(e||"").trim().toLowerCase();return da[t]||""}function rt(e={}){const t=e&&typeof e=="object"?e:{},a=String(t.conditionType||"").trim().toLowerCase();return a==="custom"?b(t.customCondition,120):la[a]||""}function st(e={}){return de(_e(e.goPriceCents,e.goPrice))||b(e.priceText,60)}function pa(e={}){const t=e&&typeof e=="object"?e:{},a=b(t.text,160);if(a)return a;const n=T(t.percent,0),r=at(t.kind,n),s=b(t.itemName,160);if(r===I)return n<=0?"":[`-${n}%`,nt(t.scope)].filter(Boolean).join(" ");if(r===W)return s?[`${s} FALAS`,rt(t)].filter(Boolean).join(" "):"";if(r===K||r===q){const d=st(t);return s?[s,d].filter(Boolean).join(" "):d}return r==="table"?"Tavolinë e rezervuar":""}function ma(e={}){const t=e&&typeof e=="object"&&e.label!==void 0?e:we(e),a={kind:t.kind||"",eyebrow:"",headline:t.label||"",note:"",priceRegular:"",priceGo:"",savingLabel:""},n=b(t.itemName,160);if(t.kind===I){const r=T(t.percent,0);return a.headline=r>0?`-${r}%`:"",a.note=nt(t.scope),a}if(t.kind===W)return a.headline=n?`${n.toUpperCase()} FALAS`:"",a.note=rt(t),a;if(t.kind===K||t.kind===q){a.eyebrow=t.kind===K?"Paketë GO":"Çmim special GO",a.headline=n,a.priceRegular=de(t.regularPriceCents),a.priceGo=st(t);const r=de(t.savingCents);return a.savingLabel=r?`Kursen ${r}`:"",a}return a}function it(e){const t=Array.isArray(e)?e:e?[e]:[],a=[];return t.forEach(n=>{const r=String(n||"").trim().toLowerCase();Qe(r)&&!a.includes(r)&&a.push(r)}),a.length?a:xe.map(n=>n.key)}function fa(e=[]){const t=it(e);let a=Number.POSITIVE_INFINITY,n=0;return t.forEach(r=>{const s=Qe(r);s&&(a=Math.min(a,s.min),n=Math.max(n,s.max))}),!Number.isFinite(a)||!n?{min:1,max:99}:{min:a,max:n}}function ga(e={}){const t=e&&typeof e=="object"?e:{},a=String(t.mode||"").trim().toLowerCase()==="windows"?"windows":"always",n=[];(Array.isArray(t.days)?t.days:[]).forEach(d=>{const u=String(d||"").trim().toLowerCase();me.includes(u)&&!n.includes(u)&&n.push(u)});const s=aa((Array.isArray(t.windows)?t.windows:[]).map(d=>({start:d?.start??d?.from,end:d?.end??d?.to})));return a==="always"||!n.length&&!s.length?{mode:"always",days:me.slice(),windows:[]}:{mode:"windows",days:n.length?n:me.slice(),windows:s}}function ba(e={}){const t=e&&typeof e=="object"?e:{},a=s=>{const d=b(s,10);return/^\d{4}-\d{2}-\d{2}$/.test(d)?d:""},n=a(t.startDate||t.from),r=a(t.endDate||t.to);return n&&r&&r<n?{startDate:r,endDate:n}:{startDate:n,endDate:r}}function ya(e={}){const t=e&&typeof e=="object"?e:{};return{slotGroups:T(t.slotGroups??t.maxGroupsPerSlot,0),slotGuests:T(t.slotGuests??t.maxGuestsPerSlot,0),dailyGroups:T(t.dailyGroups??t.maxGroupsPerDay,0),totalRedemptions:T(t.totalRedemptions??t.maxRedemptions,0)}}function _a(e){const t=Array.isArray(e)?e:[],a=[];return t.forEach(n=>{const r=String(n||"").trim().toLowerCase();(r===Ne||r===sa)&&!a.includes(r)&&a.push(r)}),a.length?a:[Ne]}function le(e={},t=""){const a=e&&typeof e=="object"?e:{},n=it(a.partyRanges||a.partySizes),r=fa(n),s=we(a.benefit),d=tt(a.bookingType);return{id:b(a.id||t,180),restaurantId:b(a.restaurantId,180),locationId:b(a.locationId,180)||"main",title:b(a.title,120),description:b(a.description||a.text,400),terms:b(a.terms||a.conditions,400),benefit:s,benefitLabel:s.label,category:ha(a.category),partyRanges:n,minParty:r.min,maxParty:r.max,schedule:ga(a.schedule),dateRange:ba(a.dateRange),bookingType:d,limits:ya(a.limits),channels:_a(a.channels),status:ua(a.status),sponsored:a.sponsored===!0||a.sponsored?.active===!0,sponsoredUntil:B(a.sponsored?.until),priceLevel:Math.min(4,Math.max(0,T(a.priceLevel,0))),redeemedCount:T(a.redeemedCount,0),createdAt:B(a.createdAt),updatedAt:B(a.updatedAt)}}function Dn(e={},{serverTimestamp:t=null}={}){const a=le(e),n={restaurantId:a.restaurantId,locationId:a.locationId,title:a.title,description:a.description,terms:a.terms,benefit:a.benefit,benefitLabel:a.benefitLabel,category:a.category,partyRanges:a.partyRanges,minParty:a.minParty,maxParty:a.maxParty,schedule:a.schedule,dateRange:a.dateRange,bookingType:a.bookingType,limits:a.limits,channels:a.channels,status:a.status,sponsored:a.sponsored,priceLevel:a.priceLevel};return t&&(n.updatedAt=t,a.createdAt||(n.createdAt=t)),n}function xa(e={}){const t=e&&typeof e=="object"&&e.label!==void 0?e:we(e),a=[],n=b(t.itemName,160),r=(s="")=>{n||a.push({field:"benefitItem",message:s}),!(t.priceText&&!t.regularPriceCents&&!t.goPriceCents)&&(t.regularPriceCents||a.push({field:"regularPrice",message:"Shkruaj çmimin normal."}),t.goPriceCents||a.push({field:"goPrice",message:"Shkruaj çmimin GO."}),t.regularPriceCents&&t.goPriceCents&&t.goPriceCents>=t.regularPriceCents&&a.push({field:"goPrice",message:"Çmimi GO duhet të jetë më i ulët se çmimi normal."}))};return t.kind===I?(t.percent<=0&&a.push({field:"benefitPercent",message:"Shkruaj zbritjen."}),et.includes(t.scope)||a.push({field:"benefitScope",message:"Zgjidh ku vlen zbritja."}),a):t.kind===W?(n||a.push({field:"benefitItem",message:"Shkruaj çka merr klienti falas."}),t.conditionType?t.conditionType==="custom"&&!t.customCondition&&a.push({field:"benefitCondition",message:"Shkruaj kushtin e ofertës."}):a.push({field:"benefitCondition",message:"Zgjidh kushtin e ofertës."}),a):t.kind===K?(r("Shkruaj çka përfshin paketa."),a):t.kind===q?(r("Shkruaj produktin."),a):(t.label||a.push({field:"benefit",message:"Shkruaj çka po ofron."}),a)}function va(e={}){const t=le(e),a=[];return t.restaurantId||a.push({field:"restaurantId",message:"Lokali mungon."}),a.push(...xa(t.benefit)),t.partyRanges.length||a.push({field:"partyRanges",message:"Zgjidh sa persona."}),t.schedule.mode==="windows"&&(t.schedule.days.length||a.push({field:"schedule",message:"Zgjidh ditët."}),t.schedule.windows.length||a.push({field:"schedule",message:"Zgjidh orarin."})),{ok:a.length===0,errors:a,offer:t}}function ot(e={}){const a=(e&&e.schedule?e:le(e)).schedule;if(a.mode==="always")return"Gjithmonë";const n={mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"},r=a.days.map(d=>n[d]||d).join(", "),s=a.windows.map(d=>`${Re(d.start)}-${Re(d.end)}`).join(", ");return[r,s].filter(Boolean).join(" · ")}function dt(e={}){const t=e&&e.partyRanges?e:le(e);return`${t.maxParty>=Yt?`${t.minParty}+`:`${t.minParty}–${t.maxParty}`} persona`}const lt=Object.freeze({x:[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]],users:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{cx:"9",cy:"7",r:"4"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75"}]],sparkles:[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"}],["path",{d:"M20 3v4"}],["path",{d:"M22 5h-4"}],["path",{d:"M4 17v2"}],["path",{d:"M5 18H3"}]],coffee:[["path",{d:"M10 2v2"}],["path",{d:"M14 2v2"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"}],["path",{d:"M6 2v2"}]],"cup-soda":[["path",{d:"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"}],["path",{d:"M5 8h14"}],["path",{d:"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"}],["path",{d:"m12 8 1-6h2"}]],utensils:[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"}],["path",{d:"M7 2v20"}],["path",{d:"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"}]],"cake-slice":[["circle",{cx:"9",cy:"7",r:"2"}],["path",{d:"M7.2 7.9 3 11v9c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-9c0-2-3-6-7-8l-3.6 2.6"}],["path",{d:"M16 13H3"}],["path",{d:"M16 17H3"}]],zap:[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"}]],timer:[["line",{x1:"10",x2:"14",y1:"2",y2:"2"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11"}],["circle",{cx:"12",cy:"14",r:"8"}]],clock:[["circle",{cx:"12",cy:"12",r:"10"}],["polyline",{points:"12 6 12 12 16 14"}]],"calendar-clock":[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{d:"M16 2v4"}],["path",{d:"M8 2v4"}],["path",{d:"M3 10h5"}],["path",{d:"M17.5 17.5 16 16.3V14"}],["circle",{cx:"16",cy:"16",r:"6"}]],"map-pin":[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{cx:"12",cy:"10",r:"3"}]],search:[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]],"badge-percent":[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"}],["path",{d:"m15 9-6 6"}],["path",{d:"M9 9h.01"}],["path",{d:"M15 15h.01"}]],"check-check":[["path",{d:"M18 6 7 17l-5-5"}],["path",{d:"m22 10-7.5 7.5L13 16"}]],"party-popper":[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]],gift:[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1"}],["path",{d:"M12 8v13"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"}]],"shield-check":[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]],"ticket-percent":[["path",{d:"M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"}],["path",{d:"M9 9h.01"}],["path",{d:"m15 9-6 6"}],["path",{d:"M15 15h.01"}]],store:[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"}],["path",{d:"M2 7h20"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"}]],pencil:[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{d:"m15 5 4 4"}]],armchair:[["path",{d:"M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"}],["path",{d:"M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"}],["path",{d:"M5 18v2"}],["path",{d:"M19 18v2"}]],"circle-check-big":[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335"}],["path",{d:"m9 11 3 3L22 4"}]],"book-open":[["path",{d:"M12 7v14"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],navigation:[["polygon",{points:"3 11 22 2 13 21 11 13 3 11"}]],"log-in":[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"}],["polyline",{points:"10 17 15 12 10 7"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12"}]],"rotate-ccw":[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]],"arrow-left":[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]],"chevron-right":[["path",{d:"m9 18 6-6-6-6"}]],"triangle-alert":[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]],link:[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"}]],copy:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"}]],check:[["path",{d:"M20 6 9 17l-5-5"}]],hash:[["line",{x1:"4",x2:"20",y1:"9",y2:"9"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21"}]],ban:[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m4.9 4.9 14.2 14.2"}]]}),wa=Object.freeze({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"});function Ie(e={}){return Object.entries(e).map(([t,a])=>` ${t}="${a}"`).join("")}Object.freeze(Object.keys(lt));function re(e="",t=""){const a=lt[String(e||"").trim()];if(!a)return"";const n=a.map(([s,d])=>`<${s}${Ie(d)}></${s}>`).join(""),r=String(t||"").trim();return`<svg${Ie(wa)}${r?` class="${r}"`:""}>${n}</svg>`}const Ke=Object.freeze({offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",peopleSuffix:"persona"}),ka=`
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
/* Der kleine Hinweis ueber der grossen Zeile: "PAKETË GO", "ÇMIM SPECIAL GO".
   Er sagt, welche Art von Angebot hier steht - bei einer Zbritje und bei einem
   Falas steht dort nichts, weil die grosse Zeile es schon sagt. */
.mnyra-go-page__card-eyebrow {
  margin: 12px 0 0;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--go-accent, #4f46e5);
}
.mnyra-go-page__card-eyebrow + .mnyra-go-page__card-benefit { margin-top: 4px; }
.mnyra-go-page__card-benefit { margin: 12px 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
/* Steht darunter ein Preis, ist der Preis das Grosse - der Name des Produkts
   oder der Paketa wird dann zur Zeile darueber (Punkt 5.5, 7.6). */
.mnyra-go-page__card-benefit--title { font-size: 19px; letter-spacing: -0.02em; }
.mnyra-go-page__card-note { margin: 2px 0 0; font-size: 15px; font-weight: 800; color: var(--go-ink, #0f172a); }
/* Der alte Preis klein und durchgestrichen, der GO-Preis gross daneben. */
.mnyra-go-page__card-prices { margin: 8px 0 0; display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; }
.mnyra-go-page__card-price-was {
  font-size: 14px;
  font-weight: 700;
  color: var(--go-muted, #94a3b8);
  text-decoration: line-through;
}
.mnyra-go-page__card-price-go { font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go-page__card-saving { margin: 4px 0 0; font-size: 12px; font-weight: 800; color: var(--go-good, #059669); }
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
`;function C(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function $a({businessName:e="",logoUrl:t="",benefitLabel:a="",benefitView:n=null,sponsored:r=!1,meta:s=[],ctaLabel:d="",ctaIcon:u="check-check",ctaDisabled:y=!1,cardAttrs:_="",ctaAttrs:p="",texts:f=Ke}={}){const m={...Ke,...f||{}},x=(Array.isArray(s)?s:[]).filter(D=>D&&D.label),F=String(d||m.accept),z=n&&typeof n=="object"?n:{},R=String(z.headline||a||""),$=String(z.priceGo||""),S=String(z.priceRegular||"");return`
    <article class="mnyra-go-page__card"${_?` ${_}`:""}>
      <div class="mnyra-go-page__card-head">
        ${t?`<img class="mnyra-go-page__card-logo" src="${C(t)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`:`<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${re("store")}</div>`}
        <div class="mnyra-go-page__card-names">
          <p class="mnyra-go-page__card-who">${C(e)} <span>${C(m.offering)}</span></p>
          ${r?`<p class="mnyra-go-page__card-sponsored">${C(m.sponsored)}</p>`:""}
        </div>
      </div>

      ${z.eyebrow?`<p class="mnyra-go-page__card-eyebrow">${C(z.eyebrow)}</p>`:""}
      <p class="mnyra-go-page__card-benefit${$?" mnyra-go-page__card-benefit--title":""}">${C(R)}</p>
      ${z.note?`<p class="mnyra-go-page__card-note">${C(z.note)}</p>`:""}
      ${$?`
        <div class="mnyra-go-page__card-prices">
          ${S?`<span class="mnyra-go-page__card-price-was">${C(S)}</span>`:""}
          <span class="mnyra-go-page__card-price-go">${C($)}</span>
        </div>
      `:""}
      ${z.savingLabel?`<p class="mnyra-go-page__card-saving">${C(z.savingLabel)}</p>`:""}
      <p class="mnyra-go-page__card-for">${C(m.forGroup)}</p>

      <div class="mnyra-go-page__card-meta">
        ${x.map(D=>`<span>${re(D.icon||"")}${C(D.label)}</span>`).join("")}
      </div>

      <p class="mnyra-go-page__card-only">${re("ticket-percent")}${C(m.onlyGo)}</p>

      <button
        type="button"
        class="mnyra-go-page__cta"
        ${p}
        ${y?"disabled":""}
      >${u?re(u):""}${C(F)}</button>
    </article>
  `}const w=Object.freeze({confirmed:"confirmed",checkedIn:"checked_in",completed:"completed",cancelledByUser:"cancelled_by_user",cancelledByBusiness:"cancelled_by_business",notArrived:"not_arrived",expired:"expired"});Object.freeze([w.confirmed,w.checkedIn]);Object.freeze({[w.confirmed]:[w.checkedIn,w.completed,w.cancelledByUser,w.cancelledByBusiness,w.notArrived,w.expired],[w.checkedIn]:[w.completed,w.cancelledByBusiness],[w.completed]:[],[w.cancelledByUser]:[],[w.cancelledByBusiness]:[],[w.notArrived]:[],[w.expired]:[]});function ct(e=""){const t=String(e||"").trim().toLowerCase();return Object.values(w).includes(t)?t:w.confirmed}function Mn({expectedArrivalAt:e=Date.now(),timeZone:t=Y}={}){return Xt(e,t).dayKey}function Cn(e={},t=""){const a=e&&typeof e=="object"?e:{},n=a.snapshot&&typeof a.snapshot=="object"?a.snapshot:{};return{id:b(a.id||t,180),restaurantId:b(a.restaurantId||n.restaurantId,180),locationId:b(a.locationId||n.locationId,180)||"main",offerId:b(a.offerId||n.offerId,180),guestId:b(a.guestId,180),uid:b(a.uid,180),shortCode:b(a.shortCode,12).toUpperCase(),type:tt(a.type||n.bookingType),status:ct(a.status),partySize:Math.max(1,Math.trunc(Number(a.partySize||n.partySize)||1)),expectedArrivalAt:B(a.expectedArrivalAt||n.expectedArrivalAt),expectedArrivalMs:ve(a.expectedArrivalAt||n.expectedArrivalAt),dayKey:b(a.dayKey,10),slotKey:b(a.slotKey,240),timeZone:b(a.timeZone,60)||Y,snapshot:n,businessName:b(n.businessName,120),benefitLabel:b(n.benefitLabel,160),logoUrl:b(n.logoUrl,500),businessSeenAt:B(a.businessSeenAt),checkedInAt:B(a.checkedInAt),completedAt:B(a.completedAt),cancelledAt:B(a.cancelledAt),cancelReason:b(a.cancelReason,200),commissionVersion:b(a.commissionVersion,40),commission:a.commission&&typeof a.commission=="object"?{version:b(a.commission.version,40),currency:b(a.commission.currency,8),partySize:Math.max(1,Math.trunc(Number(a.commission.partySize)||1)),amountCents:Math.max(0,Math.trunc(Number(a.commission.amountCents)||0)),status:b(a.commission.status,20),confirmedAt:B(a.commission.confirmedAt)}:null,createdAt:B(a.createdAt),updatedAt:B(a.updatedAt)}}function Sa(e={}){const t=ct(e?.status);return t===w.confirmed?"Po vijnë":t===w.checkedIn?"Këtu":t===w.completed?"Përfunduar":t===w.cancelledByUser?"Anuluar nga klienti":t===w.cancelledByBusiness?"Anuluar nga ju":t===w.notArrived?"Nuk erdhën":"Skaduar"}function za(e=0){const t=Math.max(0,Math.trunc(Number(e)||0)),a=Math.trunc(t/100),n=String(t%100).padStart(2,"0");return`${a},${n} €`}const i=Object.freeze({brand:"Mnyra GO",mark:"⚡",editor:"Editori",brandMnyra:"MNYRA",brandGo:"GO",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{active:"Aktiv",offers:"Ofertat",archive:"Arkiv",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"Ofertë e re GO",scanOffer:"Skano ofertën",seenToday:"Ofertën e kanë parë sot",acceptedToday:"E kanë pranuar sot",editOffer:"Ndrysho ofertën",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj ofertën",saving:"Po ruhet...",close:"Mbyll",edit:"Edit",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",benefitQuestion:"Çka po ofron?",benefitHint:"Zgjidh llojin e ofertës që dëshiron t'u dërgosh klientëve.",benefitPercent:"Zbritje %",benefitBundle:"Paketë GO",benefitFree:"Falas",benefitSpecial:"Çmim special",benefitLegacy:"Zgjidh llojin e ofertës.",discountQuestion:"Sa zbritje po ofron?",discountOther:"Tjetër",discountPlaceholder:"Shkruaj zbritjen",scopeQuestion:"Ku vlen zbritja?",scopeAll:"Krejt fatura",scopeFood:"Ushqim",scopeDrinks:"Pije",bundleQuestion:"Çka përfshin paketa?",bundlePlaceholder:"p.sh. 2 Burger + 2 Pije",freeQuestion:"Çka merr falas?",freePlaceholder:"p.sh. 1 Pije",conditionQuestion:"Me çfarë kushti?",conditionFood:"Me ushqim",conditionDrink:"Me pije",conditionAny:"Me çdo porosi",conditionCustom:"Tjetër",customConditionQuestion:"Shkruaj kushtin",customConditionPlaceholder:"p.sh. kur porosit 2 pizza",productQuestion:"Cili produkt?",productPlaceholder:"p.sh. Pizza Margherita",priceRegular:"Çmimi normal",priceGo:"Çmimi GO",pricePlaceholder:"0,00",saving:"Kursen",partyQuestion:"Prej sa personave vlen kjo ofertë",categoryQuestion:"Kur e lshon këtë ofertë",categoryHint:"Gastet zgjedhin mes «Ushqim» edhe «Pije».",ifFood:"Nëse kërkohet ushqim",ifDrinks:"Nëse kërkohet pije",scheduleQuestion:"Nga çfarë orari vlen oferta",always:"Nonstop",specificHours:"Specifik",hoursFrom:"Prej orës",hoursTo:"Deri në orë",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",loading:"Po ngarkohet...",guestName:"Mnyra Guest",table:"Tavolinë",markDone:"Përfundo",around:"Rreth",search:"Kërko",searching:"Po kërkoj...",codePlaceholder:"Kodi i klientit",codeNotFound:"Ky kod nuk u gjet.",partyAtTable:"Sa persona janë",commission:"Provizioni",keepsRunning:"Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",onlyBusiness:"Ky funksion eshte vetem per profile biznesi.",loadingBusiness:"Biznesi po ngarkohet..."});function o(e,t=""){return typeof e=="function"?e(t):String(t??"")}function L(e,t="",a="w-4 h-4"){return typeof e=="function"?e(t,a):""}function ut(e=""){const t=Date.parse(String(e||""));if(!Number.isFinite(t))return"";const a=new Date(t);return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Pa({enabled:e=!1,unseenCount:t=0,activeOffers:a=0,todayBookings:n=0,iconFn:r=null,texts:s={}}={}){if(!e)return"";const d={...i,...s||{}},u=Math.max(0,Math.trunc(Number(t)||0)),y=a>0||n>0,_=y?`${a} oferta aktive · ${n} rezervime sot`:d.cardIdle;return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${u>0?`<span class="mnyra-dash__composer-badge" aria-label="${u} ${d.statNew}">${u}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${_}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${L(r,"zap","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${y?d.cardManage:d.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${L(r,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const Aa=`
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
`;function ja(e={},t={}){const a=t.escapeHtml,n=t.icon,r=e.imageUrl?`<img class="go-hl__media" src="${o(a,e.imageUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:"",s=e.action?`<span class="go-hl__action">${o(a,e.action)}</span>`:`
      <span class="go-hl__label">${o(a,e.label)}</span>
      <span class="go-hl__value">${o(a,e.value)}</span>
    `,d=e.action||`${e.label} ${e.value}`;return`
    <button type="button" class="go-hl__card" ${e.attr||""} data-go-highlight="${o(a,e.key)}"
      aria-label="${o(a,d)}">
      <span class="go-hl__plate ${o(a,e.tone||"text-slate-400")}">${L(n,e.icon,"w-6 h-6")}</span>
      ${r}
      <span class="go-hl__body">${s}</span>
    </button>
  `}function Da({stats:e={},deps:t={}}={}){return`
    <div class="go-hl" data-go-highlights>
      ${[{key:"scan",action:i.scanOffer,icon:"camera",tone:"text-indigo-600",attr:"data-go-scan"},{key:"seen",label:i.seenToday,value:Number(e.impressions)||0,icon:"eye",tone:"text-indigo-600"},{key:"accepted",label:i.acceptedToday,value:Number(e.accepted)||0,icon:"check-check",tone:"text-emerald-600"}].map(n=>ja(n,t)).join("")}
      <span class="go-hl__tail" aria-hidden="true"></span>
    </div>
  `}function Ma({tab:e="active",deps:t={}}={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="go-tabs" role="tablist" data-go-tabs>
      ${[["active",i.tabs.active,"zap"],["offers",i.tabs.offers,"tag"],["archive",i.tabs.archive,"archive"],["options",i.tabs.options,"settings"]].map(([s,d,u])=>`
        <button type="button" role="tab" aria-selected="${e===s?"true":"false"}" data-go-business-tab="${s}"
          class="go-tab">${L(n,u,"w-4 h-4")}<span class="go-tab-label">${o(a,d)}</span></button>
      `).join("")}
    </div>
  `}function fe(e={},t={},{found:a=!1}={}){const n=t.escapeHtml,r=e.type==="reservation",s=ut(e.expectedArrivalAt),d=e.benefitLabel||e.snapshot?.benefitLabel||"",u=!e.businessSeenAt,y=s?`${i.around} ${s}`:i.guestName;return`
    <div class="p-4 rounded-[1.6rem] border ${a?"bg-white border-indigo-300 ring-2 ring-indigo-100":u?"bg-indigo-50/50 border-indigo-100":"bg-slate-50 border-slate-100"}"
      data-go-booking="${o(n,e.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">${o(n,y)}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${o(n,Sa(e))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${o(n,i.guestName)}</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-600">
        <span>👥 ${o(n,`${e.partySize||1} ${i.guests}`)}</span>
        ${s?`<span>🕐 ${o(n,i.around)} ${o(n,s)}</span>`:""}
        ${d?`<span>🎁 ${o(n,d)}</span>`:""}
        ${r?`<span>🪑 ${o(n,i.table)}</span>`:""}
      </div>
      ${a&&e.status==="confirmed"?`
        <div class="mt-4">
          <!--
            Die Gruppengroesse gehoert dem Kellner, nicht dem Gast: Er sitzt
            vor der Gruppe und sieht, wieviele es wirklich sind. Was er hier
            stehen laesst oder aendert, ist die Zahl, die abgerechnet wird.
          -->
          <label class="flex items-center justify-between gap-3 mb-3">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${o(n,i.partyAtTable)}</span>
            <input type="number" inputmode="numeric" min="1" max="10" data-go-confirm-party
              value="${o(n,e.partySize||1)}"
              class="w-16 text-center py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900" />
          </label>
          <button type="button" data-go-booking-confirm data-go-booking-id="${o(n,e.id)}"
            class="w-full py-3.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white active:scale-[0.98] transition-transform">
            ${o(n,i.accept)}
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
          ${o(n,i.commission)} · ${o(n,za(e.commission.amountCents))}
        </p>
      `:""}
      ${e.status==="checked_in"?`
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${o(n,e.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${o(n,i.markDone)}</button>
        </div>
      `:""}
    </div>
  `}function Ca({code:e="",status:t="",busy:a=!1,deps:n={}}={}){const r=n.escapeHtml,s=n.icon;return`
    <div class="mb-4" data-go-code-search>
      <div class="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-400 transition-colors">
        <span class="pl-2 text-slate-400">${L(s,"search","w-4 h-4")}</span>
        <input type="text" data-go-code-input value="${o(r,e)}"
          placeholder="${o(r,i.codePlaceholder)}"
          autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
          class="flex-1 min-w-0 bg-transparent py-2 text-sm font-black uppercase tracking-[0.2em] text-slate-900 outline-none" />
        <button type="button" data-go-code-submit ${a?"disabled":""}
          class="shrink-0 px-4 py-2 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white ${a?"opacity-60":""}">
          ${o(r,a?i.searching:i.search)}
        </button>
      </div>
      ${t?`<p class="mt-2 text-[10px] font-bold text-rose-500">${o(r,t)}</p>`:""}
    </div>
  `}function se({eyebrow:e="",title:t="",sub:a="",action:n="",body:r="",deps:s={}}={}){const d=s.escapeHtml;return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${o(d,e)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${o(d,t)}</h3>
          ${a?`<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${o(d,a)}</p>`:""}
        </div>
        ${n}
      </div>
      ${r}
    </div>
  `}function Fa(e={},t={}){const a=t.escapeHtml,n=e.status==="paused"?i.paused:e.status==="archived"?i.archived:"";return`
    <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${o(a,e.id)}">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 truncate">${o(a,e.benefitLabel||"")}</p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">
          ${o(a,dt(e))} &middot; ${o(a,ot(e))}
        </p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${e.status==="active"?"text-emerald-600":"text-slate-400"}">
          ${o(a,n||i.statActive)}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <button type="button" data-go-offer-edit="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${o(a,i.edit)}</button>
        <button type="button" data-go-offer-toggle="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${o(a,e.status==="active"?i.paused:i.activate)}</button>
        <button type="button" data-go-offer-archive="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">${o(a,i.archive)}</button>
      </div>
    </div>
  `}function Oa({offer:e={},businessName:t="",deps:a={}}={}){const n=a.escapeHtml;return`
    <div data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${o(n,i.preview)}</p>
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Ein Knopf, der aussieht wie
        der des Gastes und auf nichts hoert, waere ein kaputter Knopf.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${$a({businessName:t,benefitLabel:e.benefitLabel||"",benefitView:ma(e.benefit||{}),meta:[{icon:"users",label:dt(e)},{icon:"clock",label:ot(e)}]})}
      </div>
    </div>
  `}function Z(e,t="",a=""){return`<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${a?` for="${o(e,a)}"`:""}>${o(e,t)}</label>`}function ge(e,{active:t=!1,attr:a="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${a?`${a}="${o(r,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-chip px-4 rounded-2xl text-xs font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${o(r,e)}
    </button>
  `}const Ra=`
.go-offer-form--enter { animation: goOfferFormIn 180ms ease-out both; }
@keyframes goOfferFormIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
/* Der Abstand zur naechsten Section des Modals (Punkt 18: 28 bis 32 px, die
   restlichen 20 kommen aus dem space-y-5 des Modalkoerpers). */
.go-offer-section { padding-bottom: 8px; }
/* Ein Knopf der Angebotsart: gleiche Hoehe, gleiche Breite, gleiche Rundung -
   vier gleich grosse Flaechen fuer vier gleichrangige Antworten. */
.go-offer-kind { min-height: 52px; }
/* Die Antworten der anderen Fragen im Modal: die Gruppengroessen und der
   Zeitplan als Pille (44 px), Ushqim und Pije als ganze Zeile (56 px). */
.go-offer-chip { min-height: 44px; }
.go-offer-answer { min-height: 56px; }
/* Die Pillen darunter beantworten eine Nebenfrage und sind deshalb kleiner. */
.go-offer-pill { min-height: 40px; padding-left: 14px; padding-right: 14px; font-size: 12px; }
.go-offer-input { min-height: 56px; padding-top: 14px; padding-bottom: 14px; }
.go-offer-saving { font-size: 12px; }
.go-offer-price { position: relative; margin-top: 8px; }
.go-offer-price__unit {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  font-weight: 900;
  color: #94a3b8;
  pointer-events: none;
}
.go-offer-price input { padding-right: 40px; }
.go-offer-price input::-webkit-outer-spin-button,
.go-offer-price input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.go-offer-price input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
`;function be({attr:e="",unit:t="€",value:a="",placeholder:n="",mode:r="decimal",inputClass:s="",escapeHtml:d=null}={}){return`
    <div class="go-offer-price">
      <input type="text" ${e} inputmode="${o(d,r)}" autocomplete="off"
        placeholder="${o(d,n)}" value="${o(d,a)}" class="${s}" />
      <span class="go-offer-price__unit">${o(d,t)}</span>
    </div>
  `}function ie(e,{active:t=!1,attr:a="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${a?`${a}="${o(r,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-pill rounded-xl font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${o(r,e)}
    </button>
  `}const Le=Object.freeze([10,15,20,25]);function Ba({benefit:e={},percentCustom:t=!1,errorFor:a=()=>"",inputClass:n="",inputBase:r="",escapeHtml:s=null}={}){const d=m=>Z(s,m),u=m=>{const x=a(m);return x?`<p class="mt-2 text-[11px] font-bold text-rose-500">${o(s,x)}</p>`:""};if(!ia.includes(e.kind))return`
      <p class="go-offer-saving font-bold text-slate-400">${o(s,i.benefitLegacy)}</p>
      ${u("benefit")}
    `;const y=Number(e.percent)||0,_=t||y>0&&!Le.includes(y),p=()=>{const m=de(e.savingCents);if(!m)return"";const x=Math.round(Number(e.savingPercent)||0);return`
      <p class="mt-3 go-offer-saving font-black text-emerald-600" data-go-benefit-saving>
        ${o(s,i.saving)} ${o(s,m)}${x>0?` &middot; -${x}%`:""}
      </p>
    `},f=()=>`
    <div class="mt-3">
      ${d(i.priceRegular)}
      ${be({attr:"data-go-benefit-regular",value:Ge(e.regularPriceCents),placeholder:i.pricePlaceholder,inputClass:r,escapeHtml:s})}
      ${u("regularPrice")}
    </div>
    <div class="mt-3">
      ${d(i.priceGo)}
      ${be({attr:"data-go-benefit-go",value:Ge(e.goPriceCents),placeholder:i.pricePlaceholder,inputClass:r,escapeHtml:s})}
      ${u("goPrice")}
    </div>
    ${p()}
  `;if(e.kind===I)return`
      ${d(i.discountQuestion)}
      <div class="mt-2 flex flex-wrap gap-2">
        ${Le.map(m=>ie(`${m}%`,{active:!_&&y===m,attr:"data-go-discount",value:String(m),escapeHtml:s})).join("")}
        ${ie(i.discountOther,{active:_,attr:"data-go-discount",value:"other",escapeHtml:s})}
      </div>
      ${_?`
        <div class="mt-3">
          ${be({attr:"data-go-benefit-percent",unit:"%",mode:"numeric",value:y>0?String(y):"",placeholder:i.discountPlaceholder,inputClass:r,escapeHtml:s})}
        </div>
      `:""}
      ${u("benefitPercent")}

      <div class="mt-4">
        ${d(i.scopeQuestion)}
        <div class="mt-2 flex flex-wrap gap-2">
          ${[["all",i.scopeAll],["food",i.scopeFood],["drinks",i.scopeDrinks]].map(([m,x])=>ie(x,{active:(e.scope||"all")===m,attr:"data-go-discount-scope",value:m,escapeHtml:s})).join("")}
        </div>
        ${u("benefitScope")}
      </div>
    `;if(e.kind===K)return`
      ${d(i.bundleQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(s,i.bundlePlaceholder)}"
        value="${o(s,e.itemName||"")}" class="${n}" />
      ${u("benefitItem")}
      ${f()}
    `;if(e.kind===W){const m=String(e.conditionType||"");return`
      ${d(i.freeQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(s,i.freePlaceholder)}"
        value="${o(s,e.itemName||"")}" class="${n}" />
      ${u("benefitItem")}

      <div class="mt-4">
        ${d(i.conditionQuestion)}
        <div class="mt-2 grid grid-cols-2 gap-2">
          ${[["food",i.conditionFood],["drink",i.conditionDrink],["any_order",i.conditionAny],["custom",i.conditionCustom]].map(([x,F])=>ie(F,{active:m===x,attr:"data-go-benefit-condition",value:x,escapeHtml:s})).join("")}
        </div>
        ${m==="custom"?`
          <div class="mt-3">
            ${d(i.customConditionQuestion)}
            <input type="text" data-go-benefit-condition-text autocomplete="off"
              placeholder="${o(s,i.customConditionPlaceholder)}"
              value="${o(s,e.customCondition||"")}" class="${n}" />
          </div>
        `:""}
        ${u("benefitCondition")}
      </div>
    `}return e.kind===q?`
      ${d(i.productQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(s,i.productPlaceholder)}"
        value="${o(s,e.itemName||"")}" class="${n}" />
      ${u("benefitItem")}
      ${f()}
    `:""}function Ea(e=""){const t=String(e||"all").trim().toLowerCase();return t==="food"?["food"]:t==="coffee"||t==="drinks"||t==="dessert"?["drinks"]:["food","drinks"]}function Fn(e=[]){const t=Array.isArray(e)?e:[],a=t.includes("food"),n=t.includes("drinks");return a&&n?"all":a?"food":n?"drinks":""}function On({editor:e=null,businessName:t="",deps:a={}}={}){if(!e)return"";const n=a.escapeHtml,r=a.icon,s=e.draft||{},d=Array.isArray(e.errors)?e.errors:[],u=S=>d.find(D=>D.field===S)?.message||"",y=Array.isArray(s.partyRanges)?s.partyRanges:[],_=s.schedule?.mode==="windows"?"windows":"always",p=Array.isArray(e.intents)?e.intents:Ea(s.category),f=s.benefit||{},m=e.mode==="edit",x="w-full go-offer-input bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400",F=`mt-2 ${x}`,z='<div class="h-px bg-slate-100"></div>',R=S=>`<p class="mt-1 text-[11px] font-semibold text-slate-400">${o(n,S)}</p>`,$=va(s).ok&&p.length>0;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;"
      data-go-offer-editor role="dialog" aria-modal="true"
      aria-label="${o(n,m?i.editOffer:i.createOffer)}">
      <!--
        Die Karte der Vorschau bringt ihr Stylesheet mit: Sie ist dieselbe wie
        im Qyteti, und deren Regeln haengen am Kopf des Dokuments erst, wenn
        jemand die Gaeste-Seite geoeffnet hat.
      -->
      <style>${ka}${Ra}</style>
      <div class="absolute inset-0 bg-black/60" data-go-offer-cancel></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
        <div class="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
          <div class="min-w-0">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${o(n,i.brand)}</span>
            <h3 class="text-xl font-black italic tracking-tighter truncate">${o(n,m?i.editOffer:i.createOffer)}</h3>
          </div>
          <button type="button" data-go-offer-cancel aria-label="${o(n,i.close)}"
            class="shrink-0 w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
            ${L(r,"x","w-4 h-4")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-5" data-go-editor-scroll>
          <!--
            ÇKA PO OFRON? - der erste und wichtigste Schritt.

            Vier Arten in einem 2x2-Raster: In einer Reihe zu vier waeren die
            Woerter auf dem Telefon abgeschnitten, und "Çmim special" ist kein
            Wort, das man erraten soll. Darunter genau die Felder, die die
            gewaehlte Art braucht - und sonst keines.
          -->
          <div class="go-offer-section">
            ${Z(n,i.benefitQuestion)}
            ${R(i.benefitHint)}
            <div class="mt-4 grid grid-cols-2 gap-2">
              ${[[I,i.benefitPercent],[K,i.benefitBundle],[W,i.benefitFree],[q,i.benefitSpecial]].map(([S,D])=>`
                <button type="button" data-go-benefit-kind="${o(n,S)}"
                  aria-pressed="${f.kind===S?"true":"false"}"
                  class="go-offer-kind px-3 rounded-2xl text-xs font-black transition-colors ${f.kind===S?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
                  ${o(n,D)}
                </button>
              `).join("")}
            </div>
            <div class="mt-5 go-offer-form" data-go-benefit-form>
              ${Ba({benefit:f,percentCustom:e.percentCustom===!0,errorFor:u,inputClass:F,inputBase:x,escapeHtml:n})}
            </div>
          </div>

          ${z}

          <div>
            ${Z(n,i.partyQuestion)}
            <div class="mt-2 flex flex-wrap gap-2">
              ${xe.map(S=>ge(S.label,{active:y.includes(S.key),attr:"data-go-offer-party",value:S.key,escapeHtml:n})).join("")}
            </div>
            ${u("partyRanges")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${o(n,u("partyRanges"))}</p>`:""}
          </div>

          ${z}

          <div>
            ${Z(n,i.categoryQuestion)}
            ${R(i.categoryHint)}
            <div class="mt-3 space-y-2">
              ${[{key:"food",label:i.ifFood},{key:"drinks",label:i.ifDrinks}].map(S=>{const D=p.includes(S.key),ce=Ye.find(J=>J.key===S.key)?.hint||"";return`
                  <button type="button" data-go-offer-intent="${o(n,S.key)}" aria-pressed="${D?"true":"false"}"
                    class="w-full text-left go-offer-answer px-4 py-3 rounded-2xl border transition-colors ${D?"bg-slate-900 border-slate-900 text-white":"bg-slate-50 border-slate-100 text-slate-600"}">
                    <span class="block text-xs font-black">${o(n,S.label)}</span>
                    <span class="block mt-0.5 text-[11px] font-semibold ${D?"text-white/60":"text-slate-400"}">${o(n,ce)}</span>
                  </button>
                `}).join("")}
            </div>
            ${u("category")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${o(n,u("category"))}</p>`:""}
          </div>

          ${z}

          <div>
            ${Z(n,i.scheduleQuestion)}
            <div class="mt-2 flex flex-wrap gap-2">
              ${ge(i.always,{active:_==="always",attr:"data-go-offer-schedule",value:"always",escapeHtml:n})}
              ${ge(i.specificHours,{active:_==="windows",attr:"data-go-offer-schedule",value:"windows",escapeHtml:n})}
            </div>
            ${_==="windows"?`
              <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  ${Z(n,i.hoursFrom,"goOfferFrom")}
                  <input id="goOfferFrom" type="time" data-go-offer-from value="${o(n,e.windowFrom||"14:00")}" class="${F}" />
                </div>
                <div>
                  ${Z(n,i.hoursTo,"goOfferTo")}
                  <input id="goOfferTo" type="time" data-go-offer-to value="${o(n,e.windowTo||"18:00")}" class="${F}" />
                </div>
              </div>
            `:""}
            ${u("schedule")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${o(n,u("schedule"))}</p>`:""}
          </div>

          ${z}

          ${Oa({offer:s,businessName:t,deps:a})}
        </div>

        <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
          <button type="button" data-go-offer-save ${e.saving?"disabled":""}
            aria-disabled="${$?"false":"true"}"
            class="w-full py-4 rounded-[1.8rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all ${$?"":"opacity-50"}">
            ${o(n,e.saving?i.saving:m?i.save:i.activate)}
          </button>
          <div class="text-center text-[10px] font-bold ${e.status?"text-rose-500":"text-slate-400"} mt-3">${o(n,e.status)}</div>
        </div>
        </div>
      </div>
    </div>
  `}function Rn({restaurantName:e="",tab:t="active",stats:a={},search:n={},bookings:r=[],offers:s=[],settings:d={},paused:u=!1,loading:y=!1,error:_="",deps:p={}}={}){const f=p.escapeHtml,m=p.icon,x=r.filter($=>["confirmed","checked_in"].includes($.status)),F=r.filter($=>!["confirmed","checked_in"].includes($.status)),z=s.filter($=>$.status!=="archived");let R="";if(t==="offers")R=se({eyebrow:i.brand,title:i.tabs.offers,sub:`${z.length} ${z.length===1?"oferte":"oferta"}`,action:`
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${L(m,"plus","w-4 h-4")}
        </button>
      `,body:z.length?`<div class="space-y-3">${z.map($=>Fa($,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(f,i.emptyTitle)}</div>`,deps:p});else if(t==="archive")R=se({eyebrow:i.brand,title:i.tabs.archive,sub:`${F.length}`,body:F.length?`<div class="space-y-3">${F.map($=>fe($,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(f,i.noHistory)}</div>`,deps:p});else if(t==="options"){const $=ut(d?.pausedUntil);R=se({eyebrow:i.brand,title:i.tabs.options,body:`
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${o(f,i.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${o(f,u?`${i.pausedUntil} ${$}`:"ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${u?"text-amber-600":"text-emerald-600"}">
            ${o(f,u?i.paused:i.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${u?`<button type="button" data-go-pause="0" class="min-h-[44px] px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${o(f,i.resume)}</button>`:[{value:"30",label:"30 min"},{value:"60",label:"1 orë"},{value:"tomorrow",label:"Deri nesër"},{value:"-1",label:"Pa afat"}].map(S=>`
              <button type="button" data-go-pause="${S.value}"
                class="min-h-[44px] px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${o(f,S.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${o(f,i.keepsRunning)}</p>
      `,deps:p})}else R=se({eyebrow:i.brand,title:i.tabs.active,sub:`${x.length}`,body:`
        ${Ca({code:n.code,status:n.status,busy:n.busy,deps:p})}
        ${n.booking?`
          <div class="mb-4">${fe(n.booking,p,{found:!0})}</div>
        `:""}
        ${y?`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${o(f,i.loading)}</div>`:x.length?`<div class="space-y-3">${x.filter($=>$.id!==n.booking?.id).map($=>fe($,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(f,i.noBookings)}</div>`}
      `,deps:p});return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <!--
        Das Stylesheet steht in der Seite und nicht im Kopf des Dokuments: Die
        Reihe braucht Regeln, die sich mit Tailwind-Klassen nicht schreiben
        lassen (Zeilenbegrenzung, versteckte Bildlaufleiste, Rasterpunkte).
        Es wird mit der Seite ersetzt, also gibt es es immer genau einmal.
      -->
      <style>${Aa}</style>
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
        <h1 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">${o(f,i.brandMnyra)}<span class="text-indigo-600">${o(f,i.brandGo)}</span></h1>
        <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${o(f,e?`${i.editor} ${e}`:i.editor)}</p>
      </div>

      ${Da({stats:a,deps:p})}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        dieselbe Flaeche wie im Paneli. Die Reihe darueber bleibt frei: sie
        gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="go-bento" data-go-bento>
        ${Ma({tab:t,deps:p})}
        <div>
          ${R}
          ${_?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${o(f,_)}</p>`:""}
        </div>
      </div>
    </div>
  `}function Bn({deps:e={},resolving:t=!1}={}){const a=e.icon,n=e.escapeHtml;return t?`
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${o(n,i.loadingBusiness)}</p>
        </div>
      </div>
    `:`
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${L(a,"lock","w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${o(n,i.brand)}</h2>
        <p class="text-sm text-slate-500">${o(n,i.onlyBusiness)}</p>
      </div>
    </div>
  `}const Ue="mnyraDashboardStyles",Ta=`
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
`;function Na(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(Ue)))try{const t=e.createElement("style");t.id=Ue,t.textContent=Ta,e.head?.appendChild(t)}catch{}}function k(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function j(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const Ga=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Ia({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return Ga.includes(a)?"hotel":"restaurant"}function Ka(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function La({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:n}={}){const r=Ka(a),s=k(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${t?`<img src="${k(t)}" alt="${s}" title="${s}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${s}">${j(n,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${k(r.text)}</p>
    </div>
  `}function Ua({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${j(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${j(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Ha({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${j(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${j(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function Za({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${j(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${j(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const He=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function Va(e="restaurant"){const t=String(e||"").trim().toLowerCase();return He[t]||He.restaurant}function Wa({iconFn:e,kind:t="restaurant",showEditor:a=!0}={}){if(!a)return"";const n=Va(t);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${k(n.accent)}</span> ${k(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${k(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${j(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${k(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${j(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const qa="/waiter?from=panel";function Ya({iconFn:e,showEditor:t=!0}={}){return t?`
    <a href="${qa}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${j(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${j(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function Qa({cards:e=[],iconFn:t}={}){const a=(Array.isArray(e)?e:[]).filter(r=>r&&r.key);if(!a.length)return"";const n=a.map((r,s)=>{const d=k(r.label||"");if(r.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const u=s<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let y="";r.imageUrl?y=`<img class="mnyra-dash__hl-media" src="${k(r.imageUrl)}" alt="" ${u} decoding="async" onerror="this.style.display='none'" />`:r.videoUrl&&(y=`<video class="mnyra-dash__hl-media" src="${k(r.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const _=`
      <span class="mnyra-dash__hl-plate">${j(t,r.iconName||"image","w-6 h-6")}</span>
      ${y}
    `,p=r.withEye?`<span class="mnyra-dash__hl-eye">${j(t,"eye","w-4 h-4")}</span>`:"";let f;r.locked?f=`<span class="mnyra-dash__hl-lock">${j(t,"lock","w-3 h-3")}Me pagesë</span>`:r.loading?f='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':r.emptyText?f=`<span class="mnyra-dash__hl-empty">${k(r.emptyText)}</span>`:f=`<span class="mnyra-dash__hl-value">${p}${k(r.value||"0")}</span>`;let m;r.locked?m=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${k(r.key)}"`:r.composer?m=`class="mnyra-dash__hl-card" data-dashboard-composer="${k(r.composer)}"`:m=`class="mnyra-dash__hl-card"${r.panelTab?` data-dashboard-panel-tab="${k(r.panelTab)}"`:""}`;const x=r.locked?`${d} – me pagesë`:`${d} ${r.emptyText||r.value||""}`.trim();return`
      <button type="button" ${m} data-dashboard-metric="${k(r.key)}" aria-label="${k(x)}">
        ${_}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${d}</span>
          ${f}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-dash__hl" data-dashboard-metrics="${k(Ja(a))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function Ja(e=[]){return(Array.isArray(e)?e:[]).filter(t=>t&&t.key).map(t=>[t.key,t.label||"",t.value||"",t.emptyText||"",t.imageUrl||"",t.videoUrl||"",t.iconName||"",t.panelTab||"",t.composer||"",t.pending?"p":"",t.loading?"l":"",t.locked?"x":"",t.withEye?"e":""].join("~")).join("|")}const ht=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function oe(e=""){const t=String(e||"").trim().toLowerCase();return ht.some(a=>a.id===t)?t:"funksionet"}function Xa({activeTab:e="funksionet",iconFn:t}={}){const a=oe(e);return`<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${ht.map(r=>{const s=r.id===a;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${k(r.id)}"
        aria-selected="${s?"true":"false"}"
        class="mnyra-dash__tab"
      >${j(t,r.iconName,"w-4 h-4")}<span class="mnyra-dash__tab-label">${k(r.label)}</span></button>
    `}).join("")}</div>`}function pt(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function en({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let n="";return a.length?(n=a.map(r=>{const s=[r.dateLabel,`${V(r.likesCount||0)} Likes`,`${V(r.commentsCount||0)} Kommentare`];return Number(r.impressions||0)>0&&s.push(`${V(r.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${r.thumbUrl?`<img src="${k(r.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:j(t,r.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${k(r.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${k(s.filter(Boolean).join(" · "))}</p>
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
  `}function tn(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function an({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${k(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function nn(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function rn(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),t=Array.from({length:4},(a,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    ${nn()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${pt(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>').join("")}
      </div>
      ${t}
    `)}
  `}function sn({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${k(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function on(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const dn="menyra_social_dashboard_cache_v1::",Ze="menyra_social_composer_products_v1::",Ve=2500,We=1200,ln=6,cn=3,un=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),hn=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function O(e){const t=Number(e);return Number.isFinite(t)?t:0}function pn(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const n=a.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function mn(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",r=String(a.thumbUrl||(n==="image"?a.url:"")||t.thumbUrl||"").trim(),s=n==="video"?String(a.url||t.mediaUrl||"").trim():"",d=pn(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:r,videoUrl:s,likesCount:O(t.likesCount),commentsCount:O(t.commentsCount),impressions:0,dateLabel:d?d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:d?d.getTime():0}}function fn({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const n=Array.isArray(e)?e:[],r=Ce(n),s=n.find(p=>String(p?.date||p?.id||"").trim()===String(t||"").trim()),d=Ce(s?[s]:[]),u=r.merged?.posts&&typeof r.merged.posts=="object"?r.merged.posts:{},y=(Array.isArray(a)?a:[]).map(p=>mn(p?.id,p?.data||{})).filter(p=>p.id).map(p=>({...p,impressions:O(u[p.id]?.impressions)})),_=y.slice().sort((p,f)=>f.createdAtMs-p.createdAtMs).slice(0,cn);return{day:String(t||"").trim(),week:r.summary,today:d.summary,posts:_,latestPost:gn(y)}}function gn(e=[]){const t=(Array.isArray(e)?e:[]).filter(a=>a&&a.id);return t.length?t.slice().sort((a,n)=>O(n.createdAtMs)-O(a.createdAtMs)||O(n.impressions)-O(a.impressions)||O(n.likesCount)-O(a.likesCount))[0]:null}function bn({profile:e={},restaurant:t={}}={}){return Ot({profile:e,restaurant:t,feature:"qr"})}function yn(e={}){const t=e&&typeof e=="object"?e:{};return String(t.titleImageUrl||t.coverImageUrl||t.coverUrl||t.heroUrl||t.bannerUrl||"").trim()}function _n({model:e=null,coverUrl:t="",subscribed:a=!1,assets:n={}}={}){const r=e?.today||{},s=!e,d=e?.latestPost||null,u=[];if(s)u.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!d)u.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const y=String(d.thumbUrl||"").trim();u.push({key:"latestPost",label:"Postimi fundit",value:V(O(d.impressions)),withEye:!0,imageUrl:y,videoUrl:y?"":String(d.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return u.push({key:"profileViews",label:"Vizitor n'profil",value:V(O(r.profileViews)),withEye:!0,loading:s,imageUrl:String(t||"").trim(),iconName:"user",panelTab:"analitika"}),u.push({key:"menuOpens",label:"Vizitor n'meny",value:V(O(r.menuOpens)),withEye:!0,loading:s&&a,locked:!a,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),u.push({key:"qrScans",label:"Skanime n'tavolina",value:V(O(r.qrScans)),withEye:!0,loading:s&&a,locked:!a,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),u}function En({state:e,renderFn:t,documentObj:a,firestoreApi:n={},profileApi:r={},composerApi:s={},viewApi:d={},iconFn:u,storageObj:y}={}){const _=a||(typeof document>"u"?null:document),p=_?.defaultView||(typeof window>"u"?null:window),f=typeof t=="function"?t:()=>{},m=y||(typeof localStorage>"u"?null:localStorage),x=typeof r.getBusinessProfileTypeFn=="function"?r.getBusinessProfileTypeFn:(()=>""),F=typeof r.isShopCatalogProfileFn=="function"?r.isShopCatalogProfileFn:(()=>!1),z=typeof r.getRestaurantMetaByIdFn=="function"?r.getRestaurantMetaByIdFn:(()=>null),R=typeof r.resolveRestaurantLogoFn=="function"?r.resolveRestaurantLogoFn:(()=>""),$=typeof r.resolveOwnAvatarUrlFn=="function"?r.resolveOwnAvatarUrlFn:(()=>""),S=typeof d.renderAnalyticsViewFn=="function"?d.renderAnalyticsViewFn:(()=>""),D=typeof d.renderSettingsViewFn=="function"?d.renderSettingsViewFn:(()=>""),ce=typeof d.warmAnalyticsFn=="function"?d.warmAnalyticsFn:(()=>{});let J=!1,Q=0,ke=!1,U=null,X=null,ee="",$e=!1,Se=()=>null;const mt=300;function ue(){const l=e?.userProfile||{};return Ia({businessType:x(l),isShopCatalog:F(l)})}function ft(l=""){const c=z(l)||{};return Ut(c).map(h=>({id:h.id,name:h.title,price:h.price??"",category:h.beds||h.tag||"",type:"room",imageUrl:h.imageUrl||""}))}function gt(l=""){if(!m)return null;try{const c=m.getItem(`${Ze}${l}`);if(!c)return null;const h=JSON.parse(c),g=Array.isArray(h?.items)?h.items:null;return g&&g.length?g:null}catch{return null}}function bt(l="",c=[]){if(m)try{m.setItem(`${Ze}${l}`,JSON.stringify({savedAt:Date.now(),items:c}))}catch{}}async function yt(l=""){const{db:c,collectionFn:h,queryFn:g,limitFn:v,getDocsFn:P}=n;if(!c||typeof h!="function"||typeof P!="function")throw new Error("Produktet nuk u ngarkuan.");const N=h(c,"restaurants",l,"menuItems"),M=typeof g=="function"&&typeof v=="function"?g(N,v(mt)):N,G=await P(M),A=[];return G.forEach(H=>{const ne=Se(H?.id,H?.data?.()||{});ne&&A.push(ne)}),A.sort((H,ne)=>H.name.localeCompare(ne.name,"sq")),A}async function _t(l="",c){const h=String(l||"").trim();if(!h)throw new Error("Produktet nuk u ngarkuan.");if(ue()==="hotel")return ft(h);const g=yt(h).then(P=>(bt(h,P),P)),v=gt(h);return v?(typeof c=="function"?g.then(P=>c(P)).catch(()=>{}):g.catch(()=>{}),v):g}function ze(){return U?Promise.resolve(U):(X||(X=Mt(()=>import("./business-composer-controller-B0PRTMDX.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(l=>(Se=typeof l?.normalizeComposerProductCore=="function"?l.normalizeComposerProductCore:(()=>null),U=l.createBusinessComposerController({documentObj:_,windowObj:_?.defaultView||null,api:{getRestaurantIdFn:()=>te(),getBusinessMetaFn:()=>{const c=te();if(!c)return{name:"",logoUrl:"",city:""};const h=Me(c),g=z(c)||{};return{name:h.name,logoUrl:h.logoUrl,city:String(g.city||"").trim()}},loadProductsFn:(c,h)=>_t(c,h),getBusinessKindFn:()=>ue(),uploadImageFn:s.uploadImageFn,uploadVideoFn:s.uploadVideoFn,captureVideoPosterFn:s.captureVideoPosterFn,createPostFn:s.createPostFn,createStoryFn:s.createStoryFn,formatPriceFn:s.formatPriceFn,getOptimizedImageUrlFn:s.getOptimizedImageUrlFn,escapeHtmlFn:s.escapeHtmlFn,iconFn:typeof u=="function"?u:void 0,afterPublishFn:async c=>{try{await ae({force:!0})}catch{}typeof s.afterPublishFn=="function"&&await s.afterPublishFn(c)}}}),U)).catch(l=>{throw X=null,console.error("[mnyra][dashboard] composer load failed",l),l})),X)}function Pe(){const l=p?.navigator?.connection;return!l||typeof l!="object"?!1:l.saveData===!0?!0:/(^|-)2g$/.test(String(l.effectiveType||"").trim().toLowerCase())}function xt(){if($e||U||!p||Pe())return;$e=!0;const l=()=>{if(ze().catch(()=>{}),typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}};if(typeof p.requestIdleCallback=="function"){p.requestIdleCallback(l,{timeout:Ve});return}p.setTimeout?.(l,We)}function vt(){if(J||!p||Pe())return;J=!0;const l=()=>{try{ce()}catch{}};if(typeof p.requestIdleCallback=="function"){p.requestIdleCallback(l,{timeout:Ve});return}p.setTimeout?.(l,We)}function wt(l="post"){const c=String(l||"").trim().toLowerCase(),h=c==="story"||c==="profile"?c:"post";if(typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}if(U){U.open(h);return}ee=h,ze().then(g=>{const v=ee||h;ee="",g?.open?.(v)}).catch(()=>{ee=""})}function he(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function Ae(l=""){const c=he(),h=String(l||"").trim();return String(c.restaurantId||"")===h||(c.restaurantId=h,c.model=null,c.status="idle",c.error="",c.loadedSignature="",c.paywall="",Q+=1),c}function te(){const l=e?.userProfile||{};return String(l.restaurantId||l.staffRestaurantId||"").trim()}let je="";function kt(){const l=String(e?.user?.uid||"").trim();!l||je===l||typeof r.ensureBusinessProfileFn=="function"&&(je=l,Promise.resolve().then(()=>r.ensureBusinessProfileFn()).catch(c=>{console.warn("[mnyra][panel] business profile could not be resolved",c)}).finally(()=>{String(e?.user?.uid||"").trim()===l&&f()}))}function $t(){const l=String(e?.user?.uid||"").trim();if(!l)return!1;const c=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||c===l}function De(l=""){return`${dn}${l}`}function St(l="",c=""){if(!m||!l)return null;try{const h=m.getItem(De(l));if(!h)return null;const g=JSON.parse(h);return!g||typeof g!="object"||String(g.day||"").trim()!==String(c||"").trim()||!g.model||typeof g.model!="object"?null:g.model}catch{return null}}function zt(l="",c=null){if(!(!m||!l||!c))try{m.setItem(De(l),JSON.stringify({day:c.day,model:c}))}catch{}}async function Pt(l=""){const{db:c,collectionFn:h,queryFn:g,orderByFn:v,limitFn:P,getDocsFn:N}=n;if(!c||typeof h!="function"||typeof g!="function"||typeof v!="function"||typeof P!="function"||typeof N!="function")return[];const M=h(c,"restaurants",l,"socialPosts");return(await N(g(M,v("createdAt","desc"),P(ln)))).docs.map(A=>({id:A.id,data:A.data()||{}})).filter(A=>{const H=String(A.data.status||"active").trim().toLowerCase();return H!=="deleted"&&H!=="hidden"})}async function ae({force:l=!1}={}){const c=te(),h=Ae(c);if(!c)return;const g=Ct({rangeKey:"7d"});if(!g)return;const v=`${c}::${g.toDay}`;if(!l&&h.loadedSignature===v&&h.status==="ready")return;if(!h.model){const M=St(c,g.toDay);M&&(h.model=M,h.status="ready",f())}Q+=1;const P=Q;h.model||(h.status="loading",h.error="",f());try{const M={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:c},[G,A]=await Promise.allSettled([Ft({...M,fromDay:g.fromDay,toDay:g.toDay}),Pt(c)]);if(P!==Q)return;if(G.status==="rejected")throw G.reason;A.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",A.reason),h.model=fn({days:G.value,todayKey:g.toDay,rawPosts:A.status==="fulfilled"?A.value:[]}),h.status="ready",h.error="",h.loadedSignature=v,zt(c,h.model)}catch(M){if(P!==Q)return;console.error("[mnyra][dashboard] load failed",M),h.model||(h.status="error",h.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}f()}function At(){ke||!_||(ke=!0,_.addEventListener("click",l=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(l.target?.closest?.("[data-dashboard-retry]")){ae({force:!0});return}if(l.target?.closest?.("[data-dashboard-paywall-close]")){l.preventDefault(),he().paywall="",f();return}const c=l.target?.closest?.("[data-dashboard-metric-locked]");if(c){l.preventDefault(),he().paywall=String(c.getAttribute("data-dashboard-metric-locked")||"").trim(),f();return}const h=l.target?.closest?.("[data-dashboard-composer]");if(h){l.preventDefault(),wt(h.getAttribute("data-dashboard-composer"));return}const g=l.target?.closest?.("[data-dashboard-panel-tab]");if(g){l.preventDefault();const v=oe(g.getAttribute("data-dashboard-panel-tab"));if(v===oe(e?.dashboardPanelTab))return;e.dashboardPanelTab=v,f()}}catch{}}))}function Me(l=""){const c=e?.userProfile||{},h=l?z(l)||{}:{},g=String(h.name||h.restaurantName||c.name||"").trim()||"Business";let v="";try{v=String($()||"").trim()}catch{}if(!v)try{v=String(R(h)||"").trim()}catch{}return{name:g,logoUrl:v,kind:ue(),coverUrl:yn(h),subscribed:bn({profile:c,restaurant:h})}}function jt(l=""){try{if(!Rt()||!l)return"";Bt({restaurantId:l,onBadgeFn:()=>f()});const c=Et();return Pa({enabled:!0,unseenCount:c.unseen,activeOffers:c.activeOffers||0,todayBookings:c.today,iconFn:u})}catch{return""}}function Dt(){Na(_),At();const l=te(),c=Ae(l);let h="";if(!l)kt(),h=$t()?rn():on();else{xt(),vt();const g=Me(l),v=oe(e?.dashboardPanelTab);c.status==="idle"&&(c.status="loading",queueMicrotask(()=>{ae({force:!1})}));let P="";c.model?P=en({posts:c.model.posts,iconFn:u}):c.status==="error"?P=sn({message:c.error}):P=tn();const N=`
        ${jt(l)}
        ${Ua({iconFn:u})}
        ${Ya({iconFn:u,showEditor:!!l})}
        ${Ha({iconFn:u,showEditor:!!l})}
        ${Za({iconFn:u,showEditor:!!l})}
        ${Wa({iconFn:u,kind:g.kind,showEditor:!!l})}
      `;let M;v==="analitika"?M=`
          <div class="mnyra-dash__embed">${S()}</div>
          ${P}
        `:v==="opsionet"?M=`<div class="mnyra-dash__embed">${D()}</div>`:M=N;const G=_n({model:c.model,coverUrl:g.coverUrl,subscribed:g.subscribed,assets:un}),A=String(c.paywall||"").trim();h=`
        ${La({name:g.name,logoUrl:g.logoUrl,iconFn:u})}
        ${Qa({cards:G,iconFn:u})}
        ${pt(`
          ${Xa({activeTab:v,iconFn:u})}
          ${M}
        `)}
        ${A?an({title:hn[A]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${h}
      </section>
    `}return Object.freeze({renderDashboardView:Dt,loadDashboard:ae})}export{$n as A,Sn as B,me as G,Nt as M,En as a,le as b,Gt as c,Rn as d,Fn as e,Re as f,Ea as g,On as h,Oa as i,Cn as j,Mn as k,ka as l,Pn as m,Lt as n,Yt as o,ca as p,zn as q,Bn as r,re as s,Dn as t,Ye as u,va as v,jn as w,An as x,$a as y,Ut as z};
