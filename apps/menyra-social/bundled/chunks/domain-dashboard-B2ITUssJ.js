const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-Bp8PKN2V.js","chunks/domain-feed-social-eager-DRz5_UK8.js","chunks/domain-auth-B1kS5TG-.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-PjErzXdt.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as Bt}from"./domain-auth-B1kS5TG-.js";import{f as te,r as Et,l as Tt,s as Re}from"./domain-analytics-oyJYW1vv.js";import{b as Gt}from"./domain-business-accounts-D8NpUhi6.js";import{i as Kt,e as Nt,a as It}from"./domain-feed-social-eager-DRz5_UK8.js";const Lt=20,Ut=8;function T(e=""){return e==null?"":String(e).trim()}function ye(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function Ht(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${n}`}function Zt(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],T(t.imageUrl??t.image??t.photoUrl)],n=[];return a.forEach(r=>{const i=T(r);i&&!n.includes(i)&&n.push(i)}),n.slice(0,Ut)}function Vt(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},n=ye(a.persons??a.guests??a.capacity),r=ye(a.size??a.sizeSqm??a.area),i=Zt(a);return{id:T(a.id)||Ht(Date.now()+t),title:T(a.title??a.name),description:T(a.description??a.text).slice(0,400),imageUrl:i[0]||"",images:i,price:ye(a.price??a.pricePerNight),currency:T(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:T(a.beds??a.bedsLabel).slice(0,60),size:r==null?null:Math.min(500,Math.round(r)),tag:T(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function Wt(e=[]){return(Array.isArray(e)?e:[]).slice(0,Lt).map((t,a)=>Vt(t,{index:a}))}function qt(e={}){return Wt((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function Rn(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),T(e?.beds)&&t.push({icon:"bed",label:T(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Bn(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=T(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${n}`:`${n} ${a}`}const Je="all",Qt=Object.freeze([{key:Je,label:"Krejt",icon:"sparkles"},{key:"coffee",label:"Kafe",icon:"coffee"},{key:"drinks",label:"Pije",icon:"cup-soda"},{key:"food",label:"Ushqim",icon:"utensils"},{key:"dessert",label:"Ëmbëlsira",icon:"cake-slice"}]),Yt=Object.freeze(Qt.map(e=>e.key)),Xt="food",Jt="drinks",ea="unsure",et=Object.freeze([Object.freeze({key:Xt,label:"Ushqim",hint:"Mëngjes, drekë, darkë, ëmbëlsirë",icon:"utensils",categories:Object.freeze(["food","dessert"])}),Object.freeze({key:Jt,label:"Pije",hint:"Kafe, lëngje dhe pije të tjera",icon:"cup-soda",categories:Object.freeze(["coffee","drinks"])}),Object.freeze({key:ea,label:"Nuk e di",hint:"Gjitha ofertat për rreth teje.",icon:"sparkles",categories:Object.freeze([])})]);Object.freeze(et.map(e=>e.key));const En=1,Be=10,Tn=2,re=Object.freeze([{key:"1-2",min:1,max:2,label:"1–2"},{key:"3-4",min:3,max:4,label:"3–4"},{key:"5-6",min:5,max:6,label:"5–6"},{key:"7+",min:7,max:99,label:"7+"}]),ta=Object.freeze([{key:"2-4",min:2,max:4,label:"2–4"},{key:"4-6",min:4,max:6,label:"4–6"},{key:"6+",min:6,max:99,label:"6+"}]);function Gn(e=[]){const t=Array.isArray(e)?e:e?[e]:[],a=[];return t.forEach(n=>{const r=$e(n);r&&re.forEach(i=>{i.min>r.max||i.max<r.min||a.includes(i.key)||a.push(i.key)})}),re.filter(n=>a.includes(n.key)).map(n=>n.key)}const Kn=Object.freeze([{key:"now",label:"Tani",offsetMinutes:0},{key:"in30",label:"+30 min",offsetMinutes:30},{key:"in60",label:"+1 orë",offsetMinutes:60},{key:"later",label:"Më vonë",offsetMinutes:-1}]),aa="claim",Ee="reservation",Nn=7;function $e(e=""){const t=String(e||"").trim().toLowerCase();return re.find(a=>a.key===t)||ta.find(a=>a.key===t)||null}const ie="Europe/Belgrade",tt=1440,I=["mon","tue","wed","thu","fri","sat","sun"],na=Object.freeze({mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"});function ve(e=""){const t=String(e||"").trim().toLowerCase();return na[t]||t}function ra(e=[]){const t=Array.isArray(e)?e:[],a=I.filter(r=>t.includes(r));if(!a.length||a.length===I.length)return"";const n=[];return a.forEach(r=>{const i=I.indexOf(r),d=n[n.length-1];if(d&&d.end===i-1){d.end=i;return}n.push({start:i,end:i})}),n.map(r=>{const i=ve(I[r.start]),d=ve(I[r.end]);return r.start===r.end?i:r.end===r.start+1?`${i}, ${d}`:`${i}–${d}`}).join(", ")}const Te=new Map;function at(e){const t=String(e||"").trim()||ie,a=Te.get(t);if(a)return a;let n=null;try{n=new Intl.DateTimeFormat("en-GB",{timeZone:t,hour12:!1,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short"})}catch{n=at(ie)}return Te.set(t,n),n}const ia={mon:"mon",tue:"tue",wed:"wed",thu:"thu",fri:"fri",sat:"sat",sun:"sun"};function Se(e){if(e==null||e==="")return 0;if(typeof e=="number")return Number.isFinite(e)?e:0;if(e instanceof Date){const n=e.getTime();return Number.isNaN(n)?0:n}if(typeof e=="object"){if(typeof e.toDate=="function")try{const n=e.toDate(),r=n instanceof Date?n.getTime():NaN;return Number.isNaN(r)?0:r}catch{return 0}return Number.isFinite(Number(e.seconds))?Math.round(Number(e.seconds)*1e3):Number.isFinite(Number(e._seconds))?Math.round(Number(e._seconds)*1e3):0}const a=new Date(String(e)).getTime();return Number.isNaN(a)?0:a}function E(e){const t=Se(e);return t?new Date(t).toISOString():""}function sa(e,t=ie){const a=Se(e)||Date.now(),n=at(t).formatToParts(new Date(a)),r=m=>{const g=n.find(w=>w.type===m);return g?g.value:""},i=r("year"),d=r("month"),h=r("day"),b=r("hour")==="24"?"00":r("hour"),x=r("minute"),p=String(r("weekday")||"").slice(0,3).toLowerCase();return{ms:a,dayKey:i&&d&&h?`${i}-${d}-${h}`:"",weekday:ia[p]||"",minutes:(Number(b)||0)*60+(Number(x)||0),timeZone:String(t||"").trim()||ie}}function oa(e){const t=String(e??"").trim();if(!t)return-1;const a=t.match(/^(\d{1,2})\s*[:.：]?\s*(\d{2})?$/);if(!a)return-1;const n=Number(a[1]),r=a[2]===void 0?0:Number(a[2]);return!Number.isFinite(n)||!Number.isFinite(r)||n>24||r>59?-1:n*60+r}function Ge(e){const t=Math.max(0,Math.round(Number(e)||0))%tt,a=Math.floor(t/60),n=t%60;return`${String(a).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function Ke(e){return typeof e=="number"?Number.isFinite(e)?Math.max(0,Math.round(e)):-1:oa(e)}function da(e,t){const a=Ke(e);let n=Ke(t);return a<0||n<0||n===a?null:(n<a&&(n+=tt),{start:a,end:n})}function la(e=[]){const t=Array.isArray(e)?e:[],a=[];return t.forEach(n=>{if(!n||typeof n!="object")return;const r=da(n.start??n.from,n.end??n.to);r&&a.push(r)}),ca(a)}function ca(e=[]){const t=(Array.isArray(e)?e:[]).filter(n=>n&&Number.isFinite(n.start)&&Number.isFinite(n.end)&&n.end>n.start).slice().sort((n,r)=>n.start-r.start||n.end-r.end),a=[];return t.forEach(n=>{const r=a[a.length-1];if(r&&n.start<=r.end){r.end=Math.max(r.end,n.end);return}a.push({start:n.start,end:n.end})}),a}const ha="active",Ne="paused",Ie="archived",Le="go",ua="public",Y="percent",X="bundle",ae="freeItem",ne="specialPrice",pa=Object.freeze([Y,X,ae,ne]),nt=Object.freeze(["all","food","drinks"]),ma=Object.freeze(["food","drink","any_order","custom"]),fa=Object.freeze({all:"",food:"në ushqim",drinks:"në pije"}),ga=Object.freeze({food:"me porosi ushqimi",drink:"me porosi të pijes",any_order:"me çdo porosi"});function y(e="",t=240){return String(e??"").trim().slice(0,t)}function ba(e=""){const t=y(e,500);return t&&(t.startsWith("/")&&!t.startsWith("//")||/^https:\/\/[^\s]+$/i.test(t))?t:""}const we=9999999;function ya(e){if(typeof e=="number")return!Number.isFinite(e)||e<=0?0:Math.min(we,Math.round(e*100));const t=String(e??"").trim().replace(/[^\d.,]/g,"");if(!t)return 0;const a=Math.max(t.lastIndexOf(","),t.lastIndexOf(".")),n=a<0?"":t.slice(a+1),i=n.length===1||n.length===2?`${t.slice(0,a).replace(/[.,]/g,"")}.${n}`:t.replace(/[.,]/g,""),d=Number.parseFloat(i);return!Number.isFinite(d)||d<=0?0:Math.min(we,Math.round(d*100))}function me(e=0){const t=Math.max(0,Math.trunc(Number(e)||0));return t?`${(t/100).toFixed(2).replace(".",",")} €`:""}function Ue(e=0){const t=Math.max(0,Math.trunc(Number(e)||0));return t?(t/100).toFixed(2).replace(".",","):""}function L(e,t=0){const a=Math.trunc(Number(e));return!Number.isFinite(a)||a<0?t:a}function _a(e=""){const t=String(e||"").trim().toLowerCase();return t===Ne?Ne:t===Ie?Ie:ha}function xa(e=""){const t=String(e||"").trim().toLowerCase();return Yt.includes(t)?t:Je}function rt(e=""){return String(e||"").trim().toLowerCase()===Ee?Ee:aa}function it(e="",t=0){const a=String(e||"").trim().toLowerCase();return a==="percent"||a==="discount"?Y:a==="bundle"?X:a==="freeitem"||a==="free_item"?ae:a==="specialprice"||a==="special_price"?ne:a==="table"?"table":a==="custom"?"custom":t>0?Y:"custom"}function ke(e,t){const a=Math.trunc(Number(e));return Number.isFinite(a)&&a>0?Math.min(we,a):ya(t)}function ze(e={}){const t=e&&typeof e=="object"?e:{},a=Math.min(90,Math.max(0,L(t.percent??t.discountPercent,0))),n=it(t.kind||t.type||t.offerType,a),r=String(t.scope||t.discountScope||"").trim().toLowerCase(),i=String(t.conditionType||t.condition||"").trim().toLowerCase(),d=ke(t.regularPriceCents,t.regularPrice),h=ke(t.goPriceCents,t.goPrice),b=h>0&&d>h?d-h:0,x={kind:n,percent:a,scope:nt.includes(r)?r:"all",itemId:y(t.itemId,180),itemName:y(t.itemName||t.item||t.bundleTitle||t.productName||t.freeItem,160),priceText:y(t.priceText||t.price,60),regularPriceCents:d,goPriceCents:h,savingCents:b,savingPercent:b>0&&d>0?Math.round(b/d*1e4)/100:0,conditionType:ma.includes(i)?i:"",customCondition:y(t.customCondition,120),text:y(t.text,160)};return x.label=va(x),x}function st(e=""){const t=String(e||"").trim().toLowerCase();return fa[t]||""}function ot(e={}){const t=e&&typeof e=="object"?e:{},a=String(t.conditionType||"").trim().toLowerCase();return a==="custom"?y(t.customCondition,120):ga[a]||""}function dt(e={}){return me(ke(e.goPriceCents,e.goPrice))||y(e.priceText,60)}function va(e={}){const t=e&&typeof e=="object"?e:{},a=y(t.text,160);if(a)return a;const n=L(t.percent,0),r=it(t.kind,n),i=y(t.itemName,160);if(r===Y)return n<=0?"":[`-${n}%`,st(t.scope)].filter(Boolean).join(" ");if(r===ae)return i?[`${i} FALAS`,ot(t)].filter(Boolean).join(" "):"";if(r===X||r===ne){const d=dt(t);return i?[i,d].filter(Boolean).join(" "):d}return r==="table"?"Tavolinë e rezervuar":""}function wa(e={}){const t=e&&typeof e=="object"&&e.label!==void 0?e:ze(e),a={kind:t.kind||"",eyebrow:"",headline:t.label||"",note:"",priceRegular:"",priceGo:"",savingLabel:""},n=y(t.itemName,160);if(t.kind===Y){const r=L(t.percent,0);return a.headline=r>0?`-${r}%`:"",a.note=st(t.scope),a}if(t.kind===ae)return a.headline=n?`${n} FALAS`:"",a.note=ot(t),a;if(t.kind===X||t.kind===ne){a.eyebrow=t.kind===X?"Paketë GO":"Çmim special GO",a.headline=n,a.priceRegular=me(t.regularPriceCents),a.priceGo=dt(t);const r=me(t.savingCents);return a.savingLabel=r?`Kursen ${r}`:"",a}return a}function lt(e){const t=Array.isArray(e)?e:e?[e]:[],a=[];return t.forEach(n=>{const r=String(n||"").trim().toLowerCase();$e(r)&&!a.includes(r)&&a.push(r)}),a.length?a:re.map(n=>n.key)}function ka(e=[]){const t=lt(e);let a=Number.POSITIVE_INFINITY,n=0;return t.forEach(r=>{const i=$e(r);i&&(a=Math.min(a,i.min),n=Math.max(n,i.max))}),!Number.isFinite(a)||!n?{min:1,max:99}:{min:a,max:n}}function $a(e={}){const t=e&&typeof e=="object"?e:{},a=String(t.mode||"").trim().toLowerCase()==="windows"?"windows":"always",n=[];(Array.isArray(t.days)?t.days:[]).forEach(d=>{const h=String(d||"").trim().toLowerCase();I.includes(h)&&!n.includes(h)&&n.push(h)});const i=la((Array.isArray(t.windows)?t.windows:[]).map(d=>({start:d?.start??d?.from,end:d?.end??d?.to})));return a==="always"||!n.length&&!i.length?{mode:"always",days:I.slice(),windows:[]}:{mode:"windows",days:n.length?n:I.slice(),windows:i}}function Sa(e={}){const t=e&&typeof e=="object"?e:{},a=i=>{const d=y(i,10);return/^\d{4}-\d{2}-\d{2}$/.test(d)?d:""},n=a(t.startDate||t.from),r=a(t.endDate||t.to);return n&&r&&r<n?{startDate:r,endDate:n}:{startDate:n,endDate:r}}function za(e={}){const t=e&&typeof e=="object"?e:{};return{slotGroups:L(t.slotGroups??t.maxGroupsPerSlot,0),slotGuests:L(t.slotGuests??t.maxGuestsPerSlot,0),dailyGroups:L(t.dailyGroups??t.maxGroupsPerDay,0),totalRedemptions:L(t.totalRedemptions??t.maxRedemptions,0)}}function Aa(e){const t=Array.isArray(e)?e:[],a=[];return t.forEach(n=>{const r=String(n||"").trim().toLowerCase();(r===Le||r===ua)&&!a.includes(r)&&a.push(r)}),a.length?a:[Le]}function fe(e={},t=""){const a=e&&typeof e=="object"?e:{},n=lt(a.partyRanges||a.partySizes),r=ka(n),i=ze(a.benefit),d=rt(a.bookingType);return{id:y(a.id||t,180),restaurantId:y(a.restaurantId,180),locationId:y(a.locationId,180)||"main",title:y(a.title,120),description:y(a.description||a.text,400),terms:y(a.terms||a.conditions,400),imageUrl:ba(a.imageUrl||a.image?.url||a.photoUrl),benefit:i,benefitLabel:i.label,category:xa(a.category),partyRanges:n,minParty:r.min,maxParty:r.max,schedule:$a(a.schedule),dateRange:Sa(a.dateRange),bookingType:d,limits:za(a.limits),channels:Aa(a.channels),status:_a(a.status),sponsored:a.sponsored===!0||a.sponsored?.active===!0,sponsoredUntil:E(a.sponsored?.until),priceLevel:Math.min(4,Math.max(0,L(a.priceLevel,0))),redeemedCount:L(a.redeemedCount,0),createdAt:E(a.createdAt),updatedAt:E(a.updatedAt)}}function In(e={},{serverTimestamp:t=null}={}){const a=fe(e),n={restaurantId:a.restaurantId,locationId:a.locationId,title:a.title,description:a.description,terms:a.terms,imageUrl:a.imageUrl,benefit:a.benefit,benefitLabel:a.benefitLabel,category:a.category,partyRanges:a.partyRanges,minParty:a.minParty,maxParty:a.maxParty,schedule:a.schedule,dateRange:a.dateRange,bookingType:a.bookingType,limits:a.limits,channels:a.channels,status:a.status,sponsored:a.sponsored,priceLevel:a.priceLevel};return t&&(n.updatedAt=t,a.createdAt||(n.createdAt=t)),n}function Pa(e={}){const t=e&&typeof e=="object"&&e.label!==void 0?e:ze(e),a=[],n=y(t.itemName,160),r=(i="")=>{n||a.push({field:"benefitItem",message:i}),!(t.priceText&&!t.regularPriceCents&&!t.goPriceCents)&&(t.regularPriceCents||a.push({field:"regularPrice",message:"Shkruaj çmimin normal."}),t.goPriceCents||a.push({field:"goPrice",message:"Shkruaj çmimin GO."}),t.regularPriceCents&&t.goPriceCents&&t.goPriceCents>=t.regularPriceCents&&a.push({field:"goPrice",message:"Çmimi GO duhet të jetë më i ulët se çmimi normal."}))};return t.kind===Y?(t.percent<=0&&a.push({field:"benefitPercent",message:"Shkruaj zbritjen."}),nt.includes(t.scope)||a.push({field:"benefitScope",message:"Zgjidh ku vlen zbritja."}),a):t.kind===ae?(n||a.push({field:"benefitItem",message:"Shkruaj çka merr klienti falas."}),t.conditionType?t.conditionType==="custom"&&!t.customCondition&&a.push({field:"benefitCondition",message:"Shkruaj kushtin e ofertës."}):a.push({field:"benefitCondition",message:"Zgjidh kushtin e ofertës."}),a):t.kind===X?(r("Shkruaj çka përfshin paketa."),a):t.kind===ne?(r("Shkruaj produktin."),a):(t.label||a.push({field:"benefit",message:"Shkruaj çka po ofron."}),a)}function Da(e={}){const t=fe(e),a=[];return t.restaurantId||a.push({field:"restaurantId",message:"Lokali mungon."}),a.push(...Pa(t.benefit)),t.partyRanges.length||a.push({field:"partyRanges",message:"Zgjidh sa persona."}),t.schedule.mode==="windows"&&(t.schedule.days.length||a.push({field:"schedule",message:"Zgjidh ditët."}),t.schedule.windows.length||a.push({field:"schedule",message:"Zgjidh orarin."})),{ok:a.length===0,errors:a,offer:t}}function ct(e={}){const a=(e&&e.schedule?e:fe(e)).schedule;if(a.mode==="always")return"Gjithmonë";const n=ra(a.days),r=a.windows.map(i=>`${Ge(i.start)}-${Ge(i.end)}`).join(", ");return[n,r].filter(Boolean).join(" · ")}function ht(e={}){const t=e&&e.partyRanges?e:fe(e);return t.minParty<=1&&t.maxParty>=Be?"Të gjithë":`${t.maxParty>=Be?`${t.minParty}+`:`${t.minParty}–${t.maxParty}`} persona`}const ut=Object.freeze({x:[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]],users:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{cx:"9",cy:"7",r:"4"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75"}]],sparkles:[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"}],["path",{d:"M20 3v4"}],["path",{d:"M22 5h-4"}],["path",{d:"M4 17v2"}],["path",{d:"M5 18H3"}]],coffee:[["path",{d:"M10 2v2"}],["path",{d:"M14 2v2"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"}],["path",{d:"M6 2v2"}]],"cup-soda":[["path",{d:"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"}],["path",{d:"M5 8h14"}],["path",{d:"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"}],["path",{d:"m12 8 1-6h2"}]],utensils:[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"}],["path",{d:"M7 2v20"}],["path",{d:"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"}]],"cake-slice":[["circle",{cx:"9",cy:"7",r:"2"}],["path",{d:"M7.2 7.9 3 11v9c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-9c0-2-3-6-7-8l-3.6 2.6"}],["path",{d:"M16 13H3"}],["path",{d:"M16 17H3"}]],zap:[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"}]],timer:[["line",{x1:"10",x2:"14",y1:"2",y2:"2"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11"}],["circle",{cx:"12",cy:"14",r:"8"}]],clock:[["circle",{cx:"12",cy:"12",r:"10"}],["polyline",{points:"12 6 12 12 16 14"}]],"calendar-clock":[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{d:"M16 2v4"}],["path",{d:"M8 2v4"}],["path",{d:"M3 10h5"}],["path",{d:"M17.5 17.5 16 16.3V14"}],["circle",{cx:"16",cy:"16",r:"6"}]],"map-pin":[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{cx:"12",cy:"10",r:"3"}]],search:[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]],"badge-percent":[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"}],["path",{d:"m15 9-6 6"}],["path",{d:"M9 9h.01"}],["path",{d:"M15 15h.01"}]],"check-check":[["path",{d:"M18 6 7 17l-5-5"}],["path",{d:"m22 10-7.5 7.5L13 16"}]],"party-popper":[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]],gift:[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1"}],["path",{d:"M12 8v13"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"}]],"shield-check":[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]],"ticket-percent":[["path",{d:"M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"}],["path",{d:"M9 9h.01"}],["path",{d:"m15 9-6 6"}],["path",{d:"M15 15h.01"}]],store:[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"}],["path",{d:"M2 7h20"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"}]],pencil:[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{d:"m15 5 4 4"}]],armchair:[["path",{d:"M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"}],["path",{d:"M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"}],["path",{d:"M5 18v2"}],["path",{d:"M19 18v2"}]],"circle-check-big":[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335"}],["path",{d:"m9 11 3 3L22 4"}]],"book-open":[["path",{d:"M12 7v14"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],navigation:[["polygon",{points:"3 11 22 2 13 21 11 13 3 11"}]],"log-in":[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"}],["polyline",{points:"10 17 15 12 10 7"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12"}]],"rotate-ccw":[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]],"arrow-left":[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]],"chevron-right":[["path",{d:"m9 18 6-6-6-6"}]],"triangle-alert":[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]],link:[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"}]],copy:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"}]],check:[["path",{d:"M20 6 9 17l-5-5"}]],hash:[["line",{x1:"4",x2:"20",y1:"9",y2:"9"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21"}]],ban:[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m4.9 4.9 14.2 14.2"}]]}),ja=Object.freeze({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"});function He(e={}){return Object.entries(e).map(([t,a])=>` ${t}="${a}"`).join("")}Object.freeze(Object.keys(ut));function ce(e="",t=""){const a=ut[String(e||"").trim()];if(!a)return"";const n=a.map(([i,d])=>`<${i}${He(d)}></${i}>`).join(""),r=String(t||"").trim();return`<svg${He(ja)}${r?` class="${r}"`:""}>${n}</svg>`}const Ze=Object.freeze({offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",peopleSuffix:"persona"}),pt="clean",Ae="hero",mt="compact",Fa=[pt,Ae,mt];function Ca({imageUrl:e="",variant:t=""}={}){if(!String(e||"").trim())return pt;const a=String(t||"").trim().toLowerCase();return Fa.includes(a)?a:Ae}const Oa=`
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
/* Mit Foto oben traegt nicht mehr die Karte das Polster, sondern ihr Koerper:
   Das Bild soll an die Kanten laufen, nicht in einem Rahmen sitzen. */
.mnyra-go-page__card--hero { padding: 0; overflow: hidden; }
.mnyra-go-page__card--hero .mnyra-go-page__card-body { padding: 16px; }
/* 16:9, wie es die Kamera eines Telefons liefert. Die Hoehe steht nicht als
   Zahl da: Auf einem breiten Bildschirm waere ein 200px-Streifen ein Balken,
   auf einem schmalen ein Briefkasten. */
.mnyra-go-page__card-photo {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
  background: var(--go-plane, #f8fafc);
}
/* Die gedraengte Fassung: Bild links, Angebot rechts, der Knopf darunter ueber
   die ganze Breite - er gehoert der Karte und nicht der rechten Spalte. */
.mnyra-go-page__card--compact .mnyra-go-page__card-top {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}
.mnyra-go-page__card--compact .mnyra-go-page__card-photo {
  aspect-ratio: 1 / 1;
  border-radius: 18px;
}
/* In der gedraengten Fassung steht das Logo nicht noch einmal daneben: Das
   Foto ist schon das Bild der Karte, und zwei Bilder in einer Zeile sind
   keine Hierarchie mehr. */
.mnyra-go-page__card--compact .mnyra-go-page__card-logo { display: none; }
.mnyra-go-page__card--compact .mnyra-go-page__card-head { margin: 0; }
.mnyra-go-page__card--compact .mnyra-go-page__card-eyebrow,
.mnyra-go-page__card--compact .mnyra-go-page__card-benefit { margin-top: 6px; }
.mnyra-go-page__card--compact .mnyra-go-page__card-benefit { font-size: 22px; }
.mnyra-go-page__card--compact .mnyra-go-page__card-benefit--title { font-size: 17px; }
.mnyra-go-page__card--compact .mnyra-go-page__card-price-go { font-size: 22px; }
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
`;function F(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ma({businessName:e="",logoUrl:t="",imageUrl:a="",variant:n="",benefitLabel:r="",benefitView:i=null,sponsored:d=!1,meta:h=[],ctaLabel:b="",ctaIcon:x="check-check",ctaDisabled:p=!1,cardAttrs:m="",ctaAttrs:g="",texts:w=Ze}={}){const A={...Ze,...w||{}},C=(Array.isArray(h)?h:[]).filter(W=>W&&W.label),O=String(b||A.accept),_=i&&typeof i=="object"?i:{},B=String(_.headline||r||""),H=String(_.priceGo||""),v=String(_.priceRegular||""),M=String(a||"").trim(),G=Ca({imageUrl:M,variant:n}),J=G===mt,K=M?`<img class="mnyra-go-page__card-photo" src="${F(M)}" alt="" loading="lazy" decoding="async" />`:"",Z=`
    <div class="mnyra-go-page__card-head">
      ${t?`<img class="mnyra-go-page__card-logo" src="${F(t)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`:`<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${ce("store")}</div>`}
      <div class="mnyra-go-page__card-names">
        <p class="mnyra-go-page__card-who">${F(e)} <span>${F(A.offering)}</span></p>
        ${d?`<p class="mnyra-go-page__card-sponsored">${F(A.sponsored)}</p>`:""}
      </div>
    </div>

    ${_.eyebrow?`<p class="mnyra-go-page__card-eyebrow">${F(_.eyebrow)}</p>`:""}
    <p class="mnyra-go-page__card-benefit${H?" mnyra-go-page__card-benefit--title":""}">${F(B)}</p>
    ${_.note?`<p class="mnyra-go-page__card-note">${F(_.note)}</p>`:""}
    ${H?`
      <div class="mnyra-go-page__card-prices">
        ${v?`<span class="mnyra-go-page__card-price-was">${F(v)}</span>`:""}
        <span class="mnyra-go-page__card-price-go">${F(H)}</span>
      </div>
    `:""}
    ${_.savingLabel?`<p class="mnyra-go-page__card-saving">${F(_.savingLabel)}</p>`:""}
    ${J?"":`<p class="mnyra-go-page__card-for">${F(A.forGroup)}</p>`}
  `,V=`
    <div class="mnyra-go-page__card-meta">
      ${C.map(W=>`<span>${ce(W.icon||"")}${F(W.label)}</span>`).join("")}
    </div>

    <p class="mnyra-go-page__card-only">${ce("ticket-percent")}${F(A.onlyGo)}</p>

    <button
      type="button"
      class="mnyra-go-page__cta"
      ${g}
      ${p?"disabled":""}
    >${x?ce(x):""}${F(O)}</button>
  `;return J?`
      <article class="mnyra-go-page__card mnyra-go-page__card--compact"${m?` ${m}`:""}>
        <div class="mnyra-go-page__card-top">
          ${K}
          <div>${Z}</div>
        </div>
        ${V}
      </article>
    `:G===Ae?`
      <article class="mnyra-go-page__card mnyra-go-page__card--hero"${m?` ${m}`:""}>
        ${K}
        <div class="mnyra-go-page__card-body">
          ${Z}
          ${V}
        </div>
      </article>
    `:`
    <article class="mnyra-go-page__card"${m?` ${m}`:""}>
      ${Z}
      ${V}
    </article>
  `}const $=Object.freeze({confirmed:"confirmed",checkedIn:"checked_in",completed:"completed",cancelledByUser:"cancelled_by_user",cancelledByBusiness:"cancelled_by_business",notArrived:"not_arrived",expired:"expired"});Object.freeze([$.confirmed,$.checkedIn]);Object.freeze({[$.confirmed]:[$.checkedIn,$.completed,$.cancelledByUser,$.cancelledByBusiness,$.notArrived,$.expired],[$.checkedIn]:[$.completed,$.cancelledByBusiness],[$.completed]:[],[$.cancelledByUser]:[],[$.cancelledByBusiness]:[],[$.notArrived]:[],[$.expired]:[]});function ft(e=""){const t=String(e||"").trim().toLowerCase();return Object.values($).includes(t)?t:$.confirmed}function Ln({expectedArrivalAt:e=Date.now(),timeZone:t=ie}={}){return sa(e,t).dayKey}function Un(e={},t=""){const a=e&&typeof e=="object"?e:{},n=a.snapshot&&typeof a.snapshot=="object"?a.snapshot:{};return{id:y(a.id||t,180),restaurantId:y(a.restaurantId||n.restaurantId,180),locationId:y(a.locationId||n.locationId,180)||"main",offerId:y(a.offerId||n.offerId,180),guestId:y(a.guestId,180),uid:y(a.uid,180),shortCode:y(a.shortCode,12).toUpperCase(),type:rt(a.type||n.bookingType),status:ft(a.status),partySize:Math.max(1,Math.trunc(Number(a.partySize||n.partySize)||1)),expectedArrivalAt:E(a.expectedArrivalAt||n.expectedArrivalAt),expectedArrivalMs:Se(a.expectedArrivalAt||n.expectedArrivalAt),dayKey:y(a.dayKey,10),slotKey:y(a.slotKey,240),timeZone:y(a.timeZone,60)||ie,snapshot:n,businessName:y(n.businessName,120),benefitLabel:y(n.benefitLabel,160),logoUrl:y(n.logoUrl,500),businessSeenAt:E(a.businessSeenAt),checkedInAt:E(a.checkedInAt),completedAt:E(a.completedAt),cancelledAt:E(a.cancelledAt),cancelReason:y(a.cancelReason,200),commissionVersion:y(a.commissionVersion,40),commission:a.commission&&typeof a.commission=="object"?{version:y(a.commission.version,40),currency:y(a.commission.currency,8),partySize:Math.max(1,Math.trunc(Number(a.commission.partySize)||1)),amountCents:Math.max(0,Math.trunc(Number(a.commission.amountCents)||0)),status:y(a.commission.status,20),confirmedAt:E(a.commission.confirmedAt)}:null,createdAt:E(a.createdAt),updatedAt:E(a.updatedAt)}}function Ra(e={}){const t=ft(e?.status);return t===$.confirmed?"Po vijnë":t===$.checkedIn?"Këtu":t===$.completed?"Përfunduar":t===$.cancelledByUser?"Anuluar nga klienti":t===$.cancelledByBusiness?"Anuluar nga ju":t===$.notArrived?"Nuk erdhën":"Skaduar"}function Ba(e=0){const t=Math.max(0,Math.trunc(Number(e)||0)),a=Math.trunc(t/100),n=String(t%100).padStart(2,"0");return`${a},${n} €`}const s=Object.freeze({brand:"Mnyra GO",mark:"⚡",editor:"Editori",brandMnyra:"MNYRA",brandGo:"GO",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{active:"Aktiv",offers:"Ofertat",archive:"Arkiv",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"Ofertë e re GO",editorHint:"Krijoje ofertën një herë. Mnyra ua shfaq automatikisht klientëve që përputhen.",scanOffer:"Skano ofertën",seenToday:"Ofertën e kanë parë sot",acceptedToday:"E kanë pranuar sot",editOffer:"Ndrysho ofertën",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj ofertën",saving:"Po ruhet...",close:"Mbyll",edit:"Edit",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",benefitQuestion:"Çka po ofron?",benefitHint:"Zgjidh çfarë dëshiron t'i ofrosh klientit.",benefitPercent:"Zbritje %",benefitBundle:"Paketë GO",benefitFree:"Falas",benefitSpecial:"Çmim special",benefitLegacy:"Zgjidh llojin e ofertës.",discountQuestion:"Sa zbritje po ofron?",discountOther:"Tjetër",discountPlaceholder:"Shkruaj zbritjen",scopeQuestion:"Ku vlen zbritja?",scopeAll:"Krejt fatura",scopeFood:"Ushqim",scopeDrinks:"Pije",bundleQuestion:"Çka përfshin paketa?",bundlePlaceholder:"p.sh. 2 Burger + 2 Pije",freeQuestion:"Çka merr falas?",freePlaceholder:"p.sh. 1 Pije",conditionQuestion:"Kur e merr falas?",conditionFood:"Me ushqim",conditionDrink:"Me pije",conditionAny:"Me çdo porosi",conditionCustom:"Tjetër",customConditionQuestion:"Shkruaj kushtin",customConditionPlaceholder:"p.sh. kur porosit 2 pizza",productQuestion:"Cili produkt?",productPlaceholder:"p.sh. Pizza Margherita",priceRegular:"Çmimi normal",priceGo:"Çmimi GO",pricePlaceholder:"0,00",saving:"Kursen",photoQuestion:"Foto e ofertës",photoHint:"Shto një foto që klienti ta shohë ofertën menjëherë.",photoOptional:"Opsionale",photoAdd:"Shto një foto",photoSource:"Nga telefoni ose kamera",photoChange:"Ndrysho",photoRemove:"Hiq",photoUploading:"Po ngarkohet...",photoError:"Fotoja nuk u ngarkua. Provo prapë.",partyQuestion:"Për sa persona vlen?",partyHint:"Zgjidh për çfarë madhësie të grupit vlen oferta.",partyAll:"Të gjithë",categoryQuestion:"Kur të shfaqet oferta?",categoryHint:"Zgjidh kur kjo ofertë i përshtatet kërkimit të klientit.",ifFood:"Nëse kërkohet ushqim",ifDrinks:"Nëse kërkohet kafe / pije",scheduleQuestion:"Kur vlen oferta?",scheduleHint:"Zgjidh kur klientët mund ta përdorin ofertën.",always:"Gjithmonë",specificHours:"Orar specifik",daysQuestion:"Ditët",hoursQuestion:"Orari",hoursFrom:"Nga",hoursTo:"Deri",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",loading:"Po ngarkohet...",guestName:"Mnyra Guest",table:"Tavolinë",markDone:"Përfundo",around:"Rreth",search:"Kërko",searching:"Po kërkoj...",codePlaceholder:"Kodi i klientit",codeNotFound:"Ky kod nuk u gjet.",partyAtTable:"Sa persona janë",commission:"Provizioni",keepsRunning:"Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",onlyBusiness:"Ky funksion eshte vetem per profile biznesi.",loadingBusiness:"Biznesi po ngarkohet..."});function o(e,t=""){return typeof e=="function"?e(t):String(t??"")}function U(e,t="",a="w-4 h-4"){return typeof e=="function"?e(t,a):""}function gt(e=""){const t=Date.parse(String(e||""));if(!Number.isFinite(t))return"";const a=new Date(t);return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Ea({enabled:e=!1,unseenCount:t=0,activeOffers:a=0,todayBookings:n=0,iconFn:r=null,texts:i={}}={}){if(!e)return"";const d={...s,...i||{}},h=Math.max(0,Math.trunc(Number(t)||0)),b=a>0||n>0,x=b?`${a} oferta aktive · ${n} rezervime sot`:d.cardIdle;return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${h>0?`<span class="mnyra-dash__composer-badge" aria-label="${h} ${d.statNew}">${h}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${x}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${U(r,"zap","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${b?d.cardManage:d.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${U(r,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const Ta=`
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
/* Drei Masse, die vorher an Klassen hingen, die es im statischen Tailwind-Blatt
   nicht gibt (md:text-2xl, mt-0.5, min-h-[44px]): die Ueberschrift auf einem
   breiten Bildschirm, der Abstand ihrer Unterzeile, und die Fingerhoehe der
   Pausenknoepfe. Eine Fingerhoehe, die von einer Klasse ohne Regel abhaengt,
   ist keine Fingerhoehe. */
.go-title-sub { margin-top: 2px; }
@media (min-width: 768px) {
  .go-title { font-size: 1.5rem; line-height: 2rem; }
}
.go-pause { min-height: 44px; }
/* Das Suchfeld faerbt seinen Rahmen, wenn der Kellner darin tippt. */
.go-code-box { transition: border-color 0.15s ease; }
.go-code-box:focus-within { border-color: #818cf8; }
/* Die Zeile mit Personen, Ankunft und Vorteil an einer Buchung. Sie hing an
   gap-x-3/gap-y-1 - zwei Klassen, die das statische Blatt nicht kennt, also
   klebten die Angaben aneinander. */
.go-booking-meta { gap: 4px 12px; }
/* Und die Buchung, die der Code gefunden hat: Sie ist hervorgehoben, weil an
   ihr der Knopf haengt, der Geld entstehen laesst. border-indigo-300 und
   ring-indigo-100 gab es im Blatt nicht - die gefundene Buchung sah aus wie
   jede andere. */
.go-booking--found { border-color: #a5b4fc; box-shadow: 0 0 0 2px #e0e7ff; }
`;function Ga(e={},t={}){const a=t.escapeHtml,n=t.icon,r=e.imageUrl?`<img class="go-hl__media" src="${o(a,e.imageUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:"",i=e.action?`<span class="go-hl__action">${o(a,e.action)}</span>`:`
      <span class="go-hl__label">${o(a,e.label)}</span>
      <span class="go-hl__value">${o(a,e.value)}</span>
    `,d=e.action||`${e.label} ${e.value}`;return`
    <button type="button" class="go-hl__card" ${e.attr||""} data-go-highlight="${o(a,e.key)}"
      aria-label="${o(a,d)}">
      <span class="go-hl__plate ${o(a,e.tone||"text-slate-400")}">${U(n,e.icon,"w-6 h-6")}</span>
      ${r}
      <span class="go-hl__body">${i}</span>
    </button>
  `}function Ka({stats:e={},deps:t={}}={}){return`
    <div class="go-hl" data-go-highlights>
      ${[{key:"scan",action:s.scanOffer,icon:"camera",tone:"text-indigo-600",attr:"data-go-scan"},{key:"seen",label:s.seenToday,value:Number(e.impressions)||0,icon:"eye",tone:"text-indigo-600"},{key:"accepted",label:s.acceptedToday,value:Number(e.accepted)||0,icon:"check-check",tone:"text-emerald-600"}].map(n=>Ga(n,t)).join("")}
      <span class="go-hl__tail" aria-hidden="true"></span>
    </div>
  `}function Na({tab:e="active",deps:t={}}={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="go-tabs" role="tablist" data-go-tabs>
      ${[["active",s.tabs.active,"zap"],["offers",s.tabs.offers,"tag"],["archive",s.tabs.archive,"archive"],["options",s.tabs.options,"settings"]].map(([i,d,h])=>`
        <button type="button" role="tab" aria-selected="${e===i?"true":"false"}" data-go-business-tab="${i}"
          class="go-tab">${U(n,h,"w-4 h-4")}<span class="go-tab-label">${o(a,d)}</span></button>
      `).join("")}
    </div>
  `}function _e(e={},t={},{found:a=!1}={}){const n=t.escapeHtml,r=e.type==="reservation",i=gt(e.expectedArrivalAt),d=e.benefitLabel||e.snapshot?.benefitLabel||"",h=!e.businessSeenAt,b=i?`${s.around} ${i}`:s.guestName;return`
    <div class="p-4 rounded-[1.6rem] border ${a?"go-booking--found bg-white":h?"bg-indigo-50/50 border-indigo-100":"bg-slate-50 border-slate-100"}"
      data-go-booking="${o(n,e.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">${o(n,b)}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${o(n,Ra(e))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${o(n,s.guestName)}</p>
      <div class="go-booking-meta mt-3 flex flex-wrap items-center text-xs font-bold text-slate-600">
        <span>👥 ${o(n,`${e.partySize||1} ${s.guests}`)}</span>
        ${i?`<span>🕐 ${o(n,s.around)} ${o(n,i)}</span>`:""}
        ${d?`<span>🎁 ${o(n,d)}</span>`:""}
        ${r?`<span>🪑 ${o(n,s.table)}</span>`:""}
      </div>
      ${a&&e.status==="confirmed"?`
        <div class="mt-4">
          <!--
            Die Gruppengroesse gehoert dem Kellner, nicht dem Gast: Er sitzt
            vor der Gruppe und sieht, wieviele es wirklich sind. Was er hier
            stehen laesst oder aendert, ist die Zahl, die abgerechnet wird.
          -->
          <label class="flex items-center justify-between gap-3 mb-3">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${o(n,s.partyAtTable)}</span>
            <input type="number" inputmode="numeric" min="1" max="10" data-go-confirm-party
              value="${o(n,e.partySize||1)}"
              class="w-16 text-center py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900" />
          </label>
          <button type="button" data-go-booking-confirm data-go-booking-id="${o(n,e.id)}"
            class="w-full py-3.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white active:scale-[0.98] transition-transform">
            ${o(n,s.accept)}
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
          ${o(n,s.commission)} · ${o(n,Ba(e.commission.amountCents))}
        </p>
      `:""}
      ${e.status==="checked_in"?`
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${o(n,e.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${o(n,s.markDone)}</button>
        </div>
      `:""}
    </div>
  `}function Ia({code:e="",status:t="",busy:a=!1,deps:n={}}={}){const r=n.escapeHtml,i=n.icon;return`
    <div class="mb-4" data-go-code-search>
      <div class="go-code-box flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white">
        <span class="pl-2 text-slate-400">${U(i,"search","w-4 h-4")}</span>
        <input type="text" data-go-code-input value="${o(r,e)}"
          placeholder="${o(r,s.codePlaceholder)}"
          autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
          class="flex-1 min-w-0 bg-transparent py-2 text-sm font-black uppercase tracking-[0.2em] text-slate-900 outline-none" />
        <button type="button" data-go-code-submit ${a?"disabled":""}
          class="shrink-0 px-4 py-2 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white ${a?"opacity-60":""}">
          ${o(r,a?s.searching:s.search)}
        </button>
      </div>
      ${t?`<p class="mt-2 text-[10px] font-bold text-rose-500">${o(r,t)}</p>`:""}
    </div>
  `}function he({eyebrow:e="",title:t="",sub:a="",action:n="",body:r="",deps:i={}}={}){const d=i.escapeHtml;return`
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
  `}function La(e={},t={}){const a=t.escapeHtml,n=e.status==="paused"?s.paused:e.status==="archived"?s.archived:"";return`
    <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${o(a,e.id)}">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 truncate">${o(a,e.benefitLabel||"")}</p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">
          ${o(a,ht(e))} &middot; ${o(a,ct(e))}
        </p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${e.status==="active"?"text-emerald-600":"text-slate-400"}">
          ${o(a,n||s.statActive)}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <button type="button" data-go-offer-edit="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${o(a,s.edit)}</button>
        <button type="button" data-go-offer-toggle="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${o(a,e.status==="active"?s.paused:s.activate)}</button>
        <button type="button" data-go-offer-archive="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">${o(a,s.archive)}</button>
      </div>
    </div>
  `}function Ua({offer:e={},businessName:t="",previewImageUrl:a="",deps:n={}}={}){const r=n.escapeHtml;return`
    <div data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${o(r,s.preview)}</p>
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Ein Knopf, der aussieht wie
        der des Gastes und auf nichts hoert, waere ein kaputter Knopf.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${Ma({businessName:t,imageUrl:a||e.imageUrl||"",benefitLabel:e.benefitLabel||"",benefitView:wa(e.benefit||{}),meta:[{icon:"users",label:ht(e)},{icon:"clock",label:ct(e)}]})}
      </div>
    </div>
  `}function N(e,t="",a=""){return`<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${a?` for="${o(e,a)}"`:""}>${o(e,t)}</label>`}function ue(e,{active:t=!1,attr:a="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${a?`${a}="${o(r,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-chip px-4 rounded-2xl text-xs font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${o(r,e)}
    </button>
  `}const Ha=`
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
/* Die Flaeche fuer das Foto (Punkt 10). Sie traegt denselben hellen Grund und
   denselben dünnen Rahmen wie die Eingabefelder daneben - kein gestrichelter
   Rahmen: Der ist die Handschrift eines Web-Uploads von damals und sieht auf
   einem Telefon aus wie ein Fehler.

   Die Hoehe kommt aus dem Seitenverhaeltnis, in dem das Bild spaeter auf der
   Karte des Gastes steht. So ist die leere Flaeche schon der Platz, den das
   Foto einnehmen wird, und nach dem Antippen springt nichts. */
.go-offer-photo {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: #f8fafc;
  color: #64748b;
  font: inherit;
  text-align: center;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
.go-offer-photo:active { transform: scale(0.99); }
.go-offer-photo__plus {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #4f46e5;
}
.go-offer-photo__title { font-size: 13px; font-weight: 900; color: #0f172a; }
.go-offer-photo__sub { font-size: 11px; font-weight: 700; color: #94a3b8; }
/* Nach dem Hochladen nimmt das Bild denselben Platz ein - dieselbe Rundung,
   dasselbe Verhaeltnis, derselbe Zuschnitt wie auf der Karte des Gastes. */
.go-offer-photo__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: #f8fafc;
}
.go-offer-photo__img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
/* Waehrend das Bild zum Server geht, liegt es schon da - nur blasser, damit
   der Wirt sieht, dass noch etwas laeuft. */
.go-offer-photo__frame--busy .go-offer-photo__img { opacity: 0.55; }
/* Eine Pille in der Mitte unter dem Bild - keine Leiste ueber die ganze
   Breite: Die saehe aus wie ein Knopf, und dieser Hinweis ist keiner. */
.go-offer-photo__busy {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: 12px;
  background: rgb(15 23 42 / 0.72);
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
}
.go-offer-photo__actions { margin-top: 10px; display: flex; gap: 8px; }
.go-offer-photo__action {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
  color: #475569;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}
.go-offer-photo__action--remove { color: #e11d48; }
/* Der AKTIVIZO-Knopf, in seinen zwei Zustaenden (Punkt 42).

   Die Farben stehen HIER und nicht in Klassen - und das ist keine Vorliebe,
   sondern die Lehre aus einem unsichtbaren Knopf: Das Tailwind-Blatt der App
   wird statisch erzeugt und enthaelt nur die Klassen, die schon jemand benutzt
   hat. Die Klasse bg-indigo-300 war nicht darunter. Der Knopf stand da, mit
   weisser Schrift, auf weissem Grund - ein Knopf, den man nicht sieht, fehlt. */
.go-offer-save { background: #a5b4fc; box-shadow: none; }
.go-offer-save--ready {
  background: #4f46e5;
  box-shadow: 0 20px 25px -5px rgb(99 102 241 / 0.2), 0 8px 10px -6px rgb(99 102 241 / 0.2);
}
/* Die Zeile unter "Nëse kërkohet ushqim". Zwei Klassen mit eigenen Werten
   (mt-0.5, text-white/60) trugen sie vorher - beide stehen im statischen Blatt
   nicht, also stand die Zeile zu hoch und auf der gewaehlten Karte in Weiss
   auf Schwarz statt gedaempft. */
.go-offer-answer__hint { margin-top: 2px; color: #94a3b8; }
[aria-pressed="true"] > .go-offer-answer__hint { color: rgb(255 255 255 / 0.6); }
`;function xe({attr:e="",unit:t="€",value:a="",placeholder:n="",mode:r="decimal",inputClass:i="",escapeHtml:d=null}={}){return`
    <div class="go-offer-price">
      <input type="text" ${e} inputmode="${o(d,r)}" autocomplete="off"
        placeholder="${o(d,n)}" value="${o(d,a)}" class="${i}" />
      <span class="go-offer-price__unit">${o(d,t)}</span>
    </div>
  `}function se(e,{active:t=!1,attr:a="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${a?`${a}="${o(r,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-pill rounded-xl font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${o(r,e)}
    </button>
  `}const Ve=Object.freeze([10,15,20,25]);function Za({benefit:e={},percentCustom:t=!1,errorFor:a=()=>"",inputClass:n="",inputBase:r="",escapeHtml:i=null}={}){const d=g=>N(i,g),h=g=>{const w=a(g);return w?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="${o(i,g)}">${o(i,w)}</p>`:""};if(!pa.includes(e.kind))return`
      <p class="go-offer-saving font-bold text-slate-400">${o(i,s.benefitLegacy)}</p>
      ${h("benefit")}
    `;const b=Number(e.percent)||0,x=t||b>0&&!Ve.includes(b),p=()=>{const g=me(e.savingCents);if(!g)return"";const w=Math.round(Number(e.savingPercent)||0);return`
      <p class="mt-3 go-offer-saving font-black text-emerald-600" data-go-benefit-saving>
        ${o(i,s.saving)} ${o(i,g)}${w>0?` &middot; -${w}%`:""}
      </p>
    `},m=()=>`
    <div class="mt-3">
      ${d(s.priceRegular)}
      ${xe({attr:"data-go-benefit-regular",value:Ue(e.regularPriceCents),placeholder:s.pricePlaceholder,inputClass:r,escapeHtml:i})}
      ${h("regularPrice")}
    </div>
    <div class="mt-3">
      ${d(s.priceGo)}
      ${xe({attr:"data-go-benefit-go",value:Ue(e.goPriceCents),placeholder:s.pricePlaceholder,inputClass:r,escapeHtml:i})}
      ${h("goPrice")}
    </div>
    ${p()}
  `;if(e.kind===Y)return`
      ${d(s.discountQuestion)}
      <div class="mt-2 flex flex-wrap gap-2">
        ${Ve.map(g=>se(`${g}%`,{active:!x&&b===g,attr:"data-go-discount",value:String(g),escapeHtml:i})).join("")}
        ${se(s.discountOther,{active:x,attr:"data-go-discount",value:"other",escapeHtml:i})}
      </div>
      ${x?`
        <div class="mt-3">
          ${xe({attr:"data-go-benefit-percent",unit:"%",mode:"numeric",value:b>0?String(b):"",placeholder:s.discountPlaceholder,inputClass:r,escapeHtml:i})}
        </div>
      `:""}
      ${h("benefitPercent")}

      <div class="mt-4">
        ${d(s.scopeQuestion)}
        <div class="mt-2 flex flex-wrap gap-2">
          ${[["all",s.scopeAll],["food",s.scopeFood],["drinks",s.scopeDrinks]].map(([g,w])=>se(w,{active:(e.scope||"all")===g,attr:"data-go-discount-scope",value:g,escapeHtml:i})).join("")}
        </div>
        ${h("benefitScope")}
      </div>
    `;if(e.kind===X)return`
      ${d(s.bundleQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(i,s.bundlePlaceholder)}"
        value="${o(i,e.itemName||"")}" class="${n}" />
      ${h("benefitItem")}
      ${m()}
    `;if(e.kind===ae){const g=String(e.conditionType||"");return`
      ${d(s.freeQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(i,s.freePlaceholder)}"
        value="${o(i,e.itemName||"")}" class="${n}" />
      ${h("benefitItem")}

      <div class="mt-4">
        ${d(s.conditionQuestion)}
        <div class="mt-2 grid grid-cols-2 gap-2">
          ${[["food",s.conditionFood],["drink",s.conditionDrink],["any_order",s.conditionAny],["custom",s.conditionCustom]].map(([w,A])=>se(A,{active:g===w,attr:"data-go-benefit-condition",value:w,escapeHtml:i})).join("")}
        </div>
        ${g==="custom"?`
          <div class="mt-3">
            ${d(s.customConditionQuestion)}
            <input type="text" data-go-benefit-condition-text autocomplete="off"
              placeholder="${o(i,s.customConditionPlaceholder)}"
              value="${o(i,e.customCondition||"")}" class="${n}" />
          </div>
        `:""}
        ${h("benefitCondition")}
      </div>
    `}return e.kind===ne?`
      ${d(s.productQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(i,s.productPlaceholder)}"
        value="${o(i,e.itemName||"")}" class="${n}" />
      ${h("benefitItem")}
      ${m()}
    `:""}function Va({imageUrl:e="",photo:t={},escapeHtml:a=null,icon:n=null}={}){const r=String(t.status||""),i=r==="uploading",d=String(t.previewUrl||e||""),h=r==="error"?String(t.error||s.photoError):"",b=d?`
      <div class="go-offer-photo__frame${i?" go-offer-photo__frame--busy":""}">
        <img class="go-offer-photo__img" src="${o(a,d)}" alt="" decoding="async" />
        ${i?`<span class="go-offer-photo__busy">${o(a,s.photoUploading)}</span>`:""}
      </div>
      <div class="go-offer-photo__actions">
        <button type="button" class="go-offer-photo__action" data-go-offer-photo-pick>${o(a,s.photoChange)}</button>
        <button type="button" class="go-offer-photo__action go-offer-photo__action--remove" data-go-offer-photo-remove>${o(a,s.photoRemove)}</button>
      </div>
    `:`
      <button type="button" class="go-offer-photo" data-go-offer-photo-pick>
        <span class="go-offer-photo__plus">${U(n,"plus","w-5 h-5")}</span>
        <span class="go-offer-photo__title">${o(a,s.photoAdd)}</span>
        <span class="go-offer-photo__sub">${o(a,s.photoSource)}</span>
      </button>
    `;return`
    <div data-go-section="photo">
      ${N(a,s.photoQuestion)}
      <p class="mt-1 text-[11px] font-semibold text-slate-400">
        ${o(a,s.photoHint)}
        <span class="text-slate-300">&middot; ${o(a,s.photoOptional)}</span>
      </p>
      <!--
        Das Feld nimmt, was ein Telefon anbietet: aufnehmen, aus der Mediathek,
        aus den Dateien. Ohne "capture" - das erzwingt die Kamera und nimmt dem
        Wirt die drei Fotos, die er letzte Woche schon gemacht hat.
      -->
      <input type="file" accept="image/*" class="hidden" data-go-offer-photo-input />
      <div class="mt-3">${b}</div>
      ${h?`<p class="mt-2 text-[11px] font-bold text-rose-500">${o(a,h)}</p>`:""}
    </div>
  `}function Wa(e=""){const t=String(e||"all").trim().toLowerCase();return t==="food"?["food"]:t==="coffee"||t==="drinks"||t==="dessert"?["drinks"]:["food","drinks"]}function Hn(e=[]){const t=Array.isArray(e)?e:[],a=t.includes("food"),n=t.includes("drinks");return a&&n?"all":a?"food":n?"drinks":""}function Zn({editor:e=null,businessName:t="",deps:a={}}={}){if(!e)return"";const n=a.escapeHtml,r=a.icon,i=e.draft||{},d=Array.isArray(e.errors)?e.errors:[],h=v=>d.find(M=>M.field===v)?.message||"",b=Array.isArray(i.partyRanges)?i.partyRanges:[],x=i.schedule?.mode==="windows"?"windows":"always",p=Array.isArray(i.schedule?.days)&&i.schedule.days.length?i.schedule.days:I.slice(),m=re.every(v=>b.includes(v.key)),g=Array.isArray(e.intents)?e.intents:Wa(i.category),w=i.benefit||{},A=e.mode==="edit",C="w-full go-offer-input bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400",O=`mt-2 ${C}`,_='<div class="h-px bg-slate-100"></div>',B=v=>`<p class="mt-1 text-[11px] font-semibold text-slate-400">${o(n,v)}</p>`,H=Da(i).ok&&g.length>0;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;"
      data-go-offer-editor role="dialog" aria-modal="true"
      aria-label="${o(n,A?s.editOffer:s.createOffer)}">
      <!--
        Die Karte der Vorschau bringt ihr Stylesheet mit: Sie ist dieselbe wie
        im Qyteti, und deren Regeln haengen am Kopf des Dokuments erst, wenn
        jemand die Gaeste-Seite geoeffnet hat.
      -->
      <style>${Oa}${Ha}</style>
      <div class="absolute inset-0 bg-black/60" data-go-offer-cancel></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
        <div class="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
          <div class="min-w-0">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${o(n,s.brand)}</span>
            <h3 class="text-xl font-black italic tracking-tighter truncate">${o(n,A?s.editOffer:s.createOffer)}</h3>
            <!--
              Der eine Satz, der einem Wirt erklaert, warum er hier steht
              (Punkt 2). Er steht im Kopf und nicht im Bildlauf: Er gilt fuer
              das ganze Formular, nicht fuer die erste Frage.
            -->
            <p class="mt-1 text-[11px] font-semibold text-slate-400">${o(n,s.editorHint)}</p>
          </div>
          <button type="button" data-go-offer-cancel aria-label="${o(n,s.close)}"
            class="shrink-0 w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
            ${U(r,"x","w-4 h-4")}
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
          <div class="go-offer-section" data-go-section="benefit">
            ${N(n,s.benefitQuestion)}
            ${B(s.benefitHint)}
            <div class="mt-4 grid grid-cols-2 gap-2">
              ${[[Y,s.benefitPercent],[X,s.benefitBundle],[ae,s.benefitFree],[ne,s.benefitSpecial]].map(([v,M])=>`
                <button type="button" data-go-benefit-kind="${o(n,v)}"
                  aria-pressed="${w.kind===v?"true":"false"}"
                  class="go-offer-kind px-3 rounded-2xl text-xs font-black transition-colors ${w.kind===v?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
                  ${o(n,M)}
                </button>
              `).join("")}
            </div>
            <div class="mt-5" data-go-benefit-form>
              ${Za({benefit:w,percentCustom:e.percentCustom===!0,errorFor:h,inputClass:O,inputBase:C,escapeHtml:n})}
            </div>
          </div>

          ${_}

          <!--
            Das Foto steht direkt hinter den Angaben zum Angebot und nicht am
            Ende des Formulars (Punkt 9): Es gehoert zum Angebot. Wer es unten
            sucht, hat vorher dreimal gelesen, dass es freiwillig ist.
          -->
          ${Va({imageUrl:i.imageUrl||"",photo:e.photo||{},escapeHtml:n,icon:r})}

          ${_}

          <div data-go-section="partyRanges">
            ${N(n,s.partyQuestion)}
            ${B(s.partyHint)}
            <!--
              "Të gjithë" zuerst und allein in seiner Zeile: Es ist die Antwort
              der meisten Lokale, und es ist keine fuenfte Gruppengroesse,
              sondern die Abkuerzung fuer alle vier darunter (Punkt 15).
            -->
            <div class="mt-3">
              ${ue(s.partyAll,{active:m,attr:"data-go-offer-party",value:"all",escapeHtml:n})}
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              ${re.map(v=>ue(v.label,{active:b.includes(v.key),attr:"data-go-offer-party",value:v.key,escapeHtml:n})).join("")}
            </div>
            ${h("partyRanges")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="partyRanges">${o(n,h("partyRanges"))}</p>`:""}
          </div>

          ${_}

          <div data-go-section="category">
            ${N(n,s.categoryQuestion)}
            ${B(s.categoryHint)}
            <div class="mt-3 space-y-2">
              ${[{key:"food",label:s.ifFood},{key:"drinks",label:s.ifDrinks}].map(v=>{const M=g.includes(v.key),G=et.find(J=>J.key===v.key)?.hint||"";return`
                  <button type="button" data-go-offer-intent="${o(n,v.key)}" aria-pressed="${M?"true":"false"}"
                    class="w-full text-left go-offer-answer px-4 py-3 rounded-2xl border transition-colors ${M?"bg-slate-900 border-slate-900 text-white":"bg-slate-50 border-slate-100 text-slate-600"}">
                    <span class="block text-xs font-black">${o(n,v.label)}</span>
                    <span class="block text-[11px] font-semibold go-offer-answer__hint">${o(n,G)}</span>
                  </button>
                `}).join("")}
            </div>
            ${h("category")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="category">${o(n,h("category"))}</p>`:""}
          </div>

          ${_}

          <div data-go-section="schedule">
            ${N(n,s.scheduleQuestion)}
            ${B(s.scheduleHint)}
            <div class="mt-3 flex flex-wrap gap-2">
              ${ue(s.always,{active:x==="always",attr:"data-go-offer-schedule",value:"always",escapeHtml:n})}
              ${ue(s.specificHours,{active:x==="windows",attr:"data-go-offer-schedule",value:"windows",escapeHtml:n})}
            </div>
            ${x==="windows"?`
              <!--
                Die Tage stehen jetzt im Formular (Punkt 23). Vorher galt ein
                Orar specifik stillschweigend fuer jeden Tag - ein Cafe, dessen
                Morgenangebot nur werktags gilt, hatte dafuer keinen Ort im
                Modal. Vorausgewaehlt sind trotzdem alle sieben: Wer nichts
                anfassen will, muss nichts anfassen.
              -->
              <div class="mt-4">
                ${N(n,s.daysQuestion)}
                <div class="mt-2 flex flex-wrap gap-2">
                  ${I.map(v=>se(ve(v),{active:p.includes(v),attr:"data-go-offer-day",value:v,escapeHtml:n})).join("")}
                </div>
              </div>
              <div class="mt-4">
                ${N(n,s.hoursQuestion)}
                <div class="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    ${N(n,s.hoursFrom,"goOfferFrom")}
                    <input id="goOfferFrom" type="time" data-go-offer-from value="${o(n,e.windowFrom||"14:00")}" class="${O}" />
                  </div>
                  <div>
                    ${N(n,s.hoursTo,"goOfferTo")}
                    <input id="goOfferTo" type="time" data-go-offer-to value="${o(n,e.windowTo||"18:00")}" class="${O}" />
                  </div>
                </div>
              </div>
            `:""}
            ${h("schedule")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="schedule">${o(n,h("schedule"))}</p>`:""}
          </div>

          ${_}

          ${Ua({offer:i,businessName:t,previewImageUrl:e.photo?.previewUrl||"",deps:a})}
        </div>

        <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
          <!--
            Fertig oder nicht (Punkt 42): Solange etwas fehlt, traegt der Knopf
            das blasse Lila und keinen Schatten - er sieht aus, als koenne er
            noch nicht. Antippen kann man ihn trotzdem, und dann steht dort,
            WAS fehlt: Ein Knopf, der stumm nicht reagiert, laesst das Lokal
            suchen (Punkt 43).
          -->
          <button type="button" data-go-offer-save ${e.saving?"disabled":""}
            aria-disabled="${H?"false":"true"}"
            class="w-full py-4 rounded-[1.8rem] text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all go-offer-save${H?" go-offer-save--ready":""}">
            ${o(n,e.saving?s.saving:A?s.save:s.activate)}
          </button>
          <div class="text-center text-[10px] font-bold ${e.status?"text-rose-500":"text-slate-400"} mt-3">${o(n,e.status)}</div>
        </div>
        </div>
      </div>
    </div>
  `}function Vn({restaurantName:e="",tab:t="active",stats:a={},search:n={},bookings:r=[],offers:i=[],settings:d={},paused:h=!1,loading:b=!1,error:x="",deps:p={}}={}){const m=p.escapeHtml,g=p.icon,w=r.filter(_=>["confirmed","checked_in"].includes(_.status)),A=r.filter(_=>!["confirmed","checked_in"].includes(_.status)),C=i.filter(_=>_.status!=="archived");let O="";if(t==="offers")O=he({eyebrow:s.brand,title:s.tabs.offers,sub:`${C.length} ${C.length===1?"oferte":"oferta"}`,action:`
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${U(g,"plus","w-4 h-4")}
        </button>
      `,body:C.length?`<div class="space-y-3">${C.map(_=>La(_,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(m,s.emptyTitle)}</div>`,deps:p});else if(t==="archive")O=he({eyebrow:s.brand,title:s.tabs.archive,sub:`${A.length}`,body:A.length?`<div class="space-y-3">${A.map(_=>_e(_,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(m,s.noHistory)}</div>`,deps:p});else if(t==="options"){const _=gt(d?.pausedUntil);O=he({eyebrow:s.brand,title:s.tabs.options,body:`
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${o(m,s.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${o(m,h?`${s.pausedUntil} ${_}`:"ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${h?"text-amber-600":"text-emerald-600"}">
            ${o(m,h?s.paused:s.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${h?`<button type="button" data-go-pause="0" class="go-pause px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${o(m,s.resume)}</button>`:[{value:"30",label:"30 min"},{value:"60",label:"1 orë"},{value:"tomorrow",label:"Deri nesër"},{value:"-1",label:"Pa afat"}].map(B=>`
              <button type="button" data-go-pause="${B.value}"
                class="go-pause px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${o(m,B.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${o(m,s.keepsRunning)}</p>
      `,deps:p})}else O=he({eyebrow:s.brand,title:s.tabs.active,sub:`${w.length}`,body:`
        ${Ia({code:n.code,status:n.status,busy:n.busy,deps:p})}
        ${n.booking?`
          <div class="mb-4">${_e(n.booking,p,{found:!0})}</div>
        `:""}
        ${b?`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${o(m,s.loading)}</div>`:w.length?`<div class="space-y-3">${w.filter(_=>_.id!==n.booking?.id).map(_=>_e(_,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(m,s.noBookings)}</div>`}
      `,deps:p});return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <!--
        Das Stylesheet steht in der Seite und nicht im Kopf des Dokuments: Die
        Reihe braucht Regeln, die sich mit Tailwind-Klassen nicht schreiben
        lassen (Zeilenbegrenzung, versteckte Bildlaufleiste, Rasterpunkte).
        Es wird mit der Seite ersetzt, also gibt es es immer genau einmal.
      -->
      <style>${Ta}</style>
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
        <h1 class="go-title text-xl font-black tracking-tight text-slate-900">${o(m,s.brandMnyra)}<span class="text-indigo-600">${o(m,s.brandGo)}</span></h1>
        <p class="go-title-sub text-[11px] text-slate-400 font-semibold">${o(m,e?`${s.editor} ${e}`:s.editor)}</p>
      </div>

      ${Ka({stats:a,deps:p})}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        dieselbe Flaeche wie im Paneli. Die Reihe darueber bleibt frei: sie
        gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="go-bento" data-go-bento>
        ${Na({tab:t,deps:p})}
        <div>
          ${O}
          ${x?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${o(m,x)}</p>`:""}
        </div>
      </div>
    </div>
  `}function Wn({deps:e={},resolving:t=!1}={}){const a=e.icon,n=e.escapeHtml;return t?`
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${o(n,s.loadingBusiness)}</p>
        </div>
      </div>
    `:`
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${U(a,"lock","w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${o(n,s.brand)}</h2>
        <p class="text-sm text-slate-500">${o(n,s.onlyBusiness)}</p>
      </div>
    </div>
  `}const We="mnyraDashboardStyles",qa=`
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
`;function Qa(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(We)))try{const t=e.createElement("style");t.id=We,t.textContent=qa,e.head?.appendChild(t)}catch{}}function S(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function D(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const Ya=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Xa({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return Ya.includes(a)?"hotel":"restaurant"}function Ja(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function en({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:n}={}){const r=Ja(a),i=S(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${t?`<img src="${S(t)}" alt="${i}" title="${i}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${i}">${D(n,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${S(r.text)}</p>
    </div>
  `}function tn({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function an({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function nn({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const qe=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function rn(e="restaurant"){const t=String(e||"").trim().toLowerCase();return qe[t]||qe.restaurant}function sn({iconFn:e,kind:t="restaurant",showEditor:a=!0}={}){if(!a)return"";const n=rn(t);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${S(n.accent)}</span> ${S(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${S(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${S(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const on="/waiter?from=panel";function dn({iconFn:e,showEditor:t=!0}={}){return t?`
    <a href="${on}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function ln({cards:e=[],iconFn:t}={}){const a=(Array.isArray(e)?e:[]).filter(r=>r&&r.key);if(!a.length)return"";const n=a.map((r,i)=>{const d=S(r.label||"");if(r.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const h=i<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let b="";r.imageUrl?b=`<img class="mnyra-dash__hl-media" src="${S(r.imageUrl)}" alt="" ${h} decoding="async" onerror="this.style.display='none'" />`:r.videoUrl&&(b=`<video class="mnyra-dash__hl-media" src="${S(r.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const x=`
      <span class="mnyra-dash__hl-plate">${D(t,r.iconName||"image","w-6 h-6")}</span>
      ${b}
    `,p=r.withEye?`<span class="mnyra-dash__hl-eye">${D(t,"eye","w-4 h-4")}</span>`:"";let m;r.locked?m=`<span class="mnyra-dash__hl-lock">${D(t,"lock","w-3 h-3")}Me pagesë</span>`:r.loading?m='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':r.emptyText?m=`<span class="mnyra-dash__hl-empty">${S(r.emptyText)}</span>`:m=`<span class="mnyra-dash__hl-value">${p}${S(r.value||"0")}</span>`;let g;r.locked?g=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${S(r.key)}"`:r.composer?g=`class="mnyra-dash__hl-card" data-dashboard-composer="${S(r.composer)}"`:g=`class="mnyra-dash__hl-card"${r.panelTab?` data-dashboard-panel-tab="${S(r.panelTab)}"`:""}`;const w=r.locked?`${d} – me pagesë`:`${d} ${r.emptyText||r.value||""}`.trim();return`
      <button type="button" ${g} data-dashboard-metric="${S(r.key)}" aria-label="${S(w)}">
        ${x}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${d}</span>
          ${m}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-dash__hl" data-dashboard-metrics="${S(cn(a))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function cn(e=[]){return(Array.isArray(e)?e:[]).filter(t=>t&&t.key).map(t=>[t.key,t.label||"",t.value||"",t.emptyText||"",t.imageUrl||"",t.videoUrl||"",t.iconName||"",t.panelTab||"",t.composer||"",t.pending?"p":"",t.loading?"l":"",t.locked?"x":"",t.withEye?"e":""].join("~")).join("|")}const bt=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function pe(e=""){const t=String(e||"").trim().toLowerCase();return bt.some(a=>a.id===t)?t:"funksionet"}function hn({activeTab:e="funksionet",iconFn:t}={}){const a=pe(e);return`<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${bt.map(r=>{const i=r.id===a;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${S(r.id)}"
        aria-selected="${i?"true":"false"}"
        class="mnyra-dash__tab"
      >${D(t,r.iconName,"w-4 h-4")}<span class="mnyra-dash__tab-label">${S(r.label)}</span></button>
    `}).join("")}</div>`}function yt(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function un({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let n="";return a.length?(n=a.map(r=>{const i=[r.dateLabel,`${te(r.likesCount||0)} Likes`,`${te(r.commentsCount||0)} Kommentare`];return Number(r.impressions||0)>0&&i.push(`${te(r.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${r.thumbUrl?`<img src="${S(r.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:D(t,r.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${S(r.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${S(i.filter(Boolean).join(" · "))}</p>
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
  `}function pn(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function mn({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${S(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function fn(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function gn(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),t=Array.from({length:4},(a,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    ${fn()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${yt(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>').join("")}
      </div>
      ${t}
    `)}
  `}function bn({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${S(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function yn(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const _n="menyra_social_dashboard_cache_v1::",Qe="menyra_social_composer_products_v1::",Ye=2500,Xe=1200,xn=6,vn=3,wn=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),kn=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function R(e){const t=Number(e);return Number.isFinite(t)?t:0}function $n(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const n=a.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function Sn(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",r=String(a.thumbUrl||(n==="image"?a.url:"")||t.thumbUrl||"").trim(),i=n==="video"?String(a.url||t.mediaUrl||"").trim():"",d=$n(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:r,videoUrl:i,likesCount:R(t.likesCount),commentsCount:R(t.commentsCount),impressions:0,dateLabel:d?d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:d?d.getTime():0}}function zn({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const n=Array.isArray(e)?e:[],r=Re(n),i=n.find(p=>String(p?.date||p?.id||"").trim()===String(t||"").trim()),d=Re(i?[i]:[]),h=r.merged?.posts&&typeof r.merged.posts=="object"?r.merged.posts:{},b=(Array.isArray(a)?a:[]).map(p=>Sn(p?.id,p?.data||{})).filter(p=>p.id).map(p=>({...p,impressions:R(h[p.id]?.impressions)})),x=b.slice().sort((p,m)=>m.createdAtMs-p.createdAtMs).slice(0,vn);return{day:String(t||"").trim(),week:r.summary,today:d.summary,posts:x,latestPost:An(b)}}function An(e=[]){const t=(Array.isArray(e)?e:[]).filter(a=>a&&a.id);return t.length?t.slice().sort((a,n)=>R(n.createdAtMs)-R(a.createdAtMs)||R(n.impressions)-R(a.impressions)||R(n.likesCount)-R(a.likesCount))[0]:null}function Pn({profile:e={},restaurant:t={}}={}){return Gt({profile:e,restaurant:t,feature:"qr"})}function Dn(e={}){const t=e&&typeof e=="object"?e:{};return String(t.titleImageUrl||t.coverImageUrl||t.coverUrl||t.heroUrl||t.bannerUrl||"").trim()}function jn({model:e=null,coverUrl:t="",subscribed:a=!1,assets:n={}}={}){const r=e?.today||{},i=!e,d=e?.latestPost||null,h=[];if(i)h.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!d)h.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const b=String(d.thumbUrl||"").trim();h.push({key:"latestPost",label:"Postimi fundit",value:te(R(d.impressions)),withEye:!0,imageUrl:b,videoUrl:b?"":String(d.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return h.push({key:"profileViews",label:"Vizitor n'profil",value:te(R(r.profileViews)),withEye:!0,loading:i,imageUrl:String(t||"").trim(),iconName:"user",panelTab:"analitika"}),h.push({key:"menuOpens",label:"Vizitor n'meny",value:te(R(r.menuOpens)),withEye:!0,loading:i&&a,locked:!a,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),h.push({key:"qrScans",label:"Skanime n'tavolina",value:te(R(r.qrScans)),withEye:!0,loading:i&&a,locked:!a,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),h}function qn({state:e,renderFn:t,documentObj:a,firestoreApi:n={},profileApi:r={},composerApi:i={},viewApi:d={},iconFn:h,storageObj:b}={}){const x=a||(typeof document>"u"?null:document),p=x?.defaultView||(typeof window>"u"?null:window),m=typeof t=="function"?t:()=>{},g=b||(typeof localStorage>"u"?null:localStorage),w=typeof r.getBusinessProfileTypeFn=="function"?r.getBusinessProfileTypeFn:(()=>""),A=typeof r.isShopCatalogProfileFn=="function"?r.isShopCatalogProfileFn:(()=>!1),C=typeof r.getRestaurantMetaByIdFn=="function"?r.getRestaurantMetaByIdFn:(()=>null),O=typeof r.resolveRestaurantLogoFn=="function"?r.resolveRestaurantLogoFn:(()=>""),_=typeof r.resolveOwnAvatarUrlFn=="function"?r.resolveOwnAvatarUrlFn:(()=>""),B=typeof d.renderAnalyticsViewFn=="function"?d.renderAnalyticsViewFn:(()=>""),H=typeof d.renderSettingsViewFn=="function"?d.renderSettingsViewFn:(()=>""),v=typeof d.warmAnalyticsFn=="function"?d.warmAnalyticsFn:(()=>{});let M=!1,G=0,J=!1,K=null,Z=null,V="",W=!1,Pe=()=>null;const _t=300;function ge(){const l=e?.userProfile||{};return Xa({businessType:w(l),isShopCatalog:A(l)})}function xt(l=""){const c=C(l)||{};return qt(c).map(u=>({id:u.id,name:u.title,price:u.price??"",category:u.beds||u.tag||"",type:"room",imageUrl:u.imageUrl||""}))}function vt(l=""){if(!g)return null;try{const c=g.getItem(`${Qe}${l}`);if(!c)return null;const u=JSON.parse(c),f=Array.isArray(u?.items)?u.items:null;return f&&f.length?f:null}catch{return null}}function wt(l="",c=[]){if(g)try{g.setItem(`${Qe}${l}`,JSON.stringify({savedAt:Date.now(),items:c}))}catch{}}async function kt(l=""){const{db:c,collectionFn:u,queryFn:f,limitFn:k,getDocsFn:z}=n;if(!c||typeof u!="function"||typeof z!="function")throw new Error("Produktet nuk u ngarkuan.");const q=u(c,"restaurants",l,"menuItems"),j=typeof f=="function"&&typeof k=="function"?f(q,k(_t)):q,Q=await z(j),P=[];return Q.forEach(ee=>{const le=Pe(ee?.id,ee?.data?.()||{});le&&P.push(le)}),P.sort((ee,le)=>ee.name.localeCompare(le.name,"sq")),P}async function $t(l="",c){const u=String(l||"").trim();if(!u)throw new Error("Produktet nuk u ngarkuan.");if(ge()==="hotel")return xt(u);const f=kt(u).then(z=>(wt(u,z),z)),k=vt(u);return k?(typeof c=="function"?f.then(z=>c(z)).catch(()=>{}):f.catch(()=>{}),k):f}function De(){return K?Promise.resolve(K):(Z||(Z=Bt(()=>import("./business-composer-controller-Bp8PKN2V.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(l=>(Pe=typeof l?.normalizeComposerProductCore=="function"?l.normalizeComposerProductCore:(()=>null),K=l.createBusinessComposerController({documentObj:x,windowObj:x?.defaultView||null,api:{getRestaurantIdFn:()=>oe(),getBusinessMetaFn:()=>{const c=oe();if(!c)return{name:"",logoUrl:"",city:""};const u=Me(c),f=C(c)||{};return{name:u.name,logoUrl:u.logoUrl,city:String(f.city||"").trim()}},loadProductsFn:(c,u)=>$t(c,u),getBusinessKindFn:()=>ge(),uploadImageFn:i.uploadImageFn,uploadVideoFn:i.uploadVideoFn,captureVideoPosterFn:i.captureVideoPosterFn,createPostFn:i.createPostFn,createStoryFn:i.createStoryFn,formatPriceFn:i.formatPriceFn,getOptimizedImageUrlFn:i.getOptimizedImageUrlFn,escapeHtmlFn:i.escapeHtmlFn,iconFn:typeof h=="function"?h:void 0,afterPublishFn:async c=>{try{await de({force:!0})}catch{}typeof i.afterPublishFn=="function"&&await i.afterPublishFn(c)}}}),K)).catch(l=>{throw Z=null,console.error("[mnyra][dashboard] composer load failed",l),l})),Z)}function je(){const l=p?.navigator?.connection;return!l||typeof l!="object"?!1:l.saveData===!0?!0:/(^|-)2g$/.test(String(l.effectiveType||"").trim().toLowerCase())}function St(){if(W||K||!p||je())return;W=!0;const l=()=>{if(De().catch(()=>{}),typeof i.prewarmFn=="function")try{i.prewarmFn()}catch{}};if(typeof p.requestIdleCallback=="function"){p.requestIdleCallback(l,{timeout:Ye});return}p.setTimeout?.(l,Xe)}function zt(){if(M||!p||je())return;M=!0;const l=()=>{try{v()}catch{}};if(typeof p.requestIdleCallback=="function"){p.requestIdleCallback(l,{timeout:Ye});return}p.setTimeout?.(l,Xe)}function At(l="post"){const c=String(l||"").trim().toLowerCase(),u=c==="story"||c==="profile"?c:"post";if(typeof i.prewarmFn=="function")try{i.prewarmFn()}catch{}if(K){K.open(u);return}V=u,De().then(f=>{const k=V||u;V="",f?.open?.(k)}).catch(()=>{V=""})}function be(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function Fe(l=""){const c=be(),u=String(l||"").trim();return String(c.restaurantId||"")===u||(c.restaurantId=u,c.model=null,c.status="idle",c.error="",c.loadedSignature="",c.paywall="",G+=1),c}function oe(){const l=e?.userProfile||{};return String(l.restaurantId||l.staffRestaurantId||"").trim()}let Ce="";function Pt(){const l=String(e?.user?.uid||"").trim();!l||Ce===l||typeof r.ensureBusinessProfileFn=="function"&&(Ce=l,Promise.resolve().then(()=>r.ensureBusinessProfileFn()).catch(c=>{console.warn("[mnyra][panel] business profile could not be resolved",c)}).finally(()=>{String(e?.user?.uid||"").trim()===l&&m()}))}function Dt(){const l=String(e?.user?.uid||"").trim();if(!l)return!1;const c=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||c===l}function Oe(l=""){return`${_n}${l}`}function jt(l="",c=""){if(!g||!l)return null;try{const u=g.getItem(Oe(l));if(!u)return null;const f=JSON.parse(u);return!f||typeof f!="object"||String(f.day||"").trim()!==String(c||"").trim()||!f.model||typeof f.model!="object"?null:f.model}catch{return null}}function Ft(l="",c=null){if(!(!g||!l||!c))try{g.setItem(Oe(l),JSON.stringify({day:c.day,model:c}))}catch{}}async function Ct(l=""){const{db:c,collectionFn:u,queryFn:f,orderByFn:k,limitFn:z,getDocsFn:q}=n;if(!c||typeof u!="function"||typeof f!="function"||typeof k!="function"||typeof z!="function"||typeof q!="function")return[];const j=u(c,"restaurants",l,"socialPosts");return(await q(f(j,k("createdAt","desc"),z(xn)))).docs.map(P=>({id:P.id,data:P.data()||{}})).filter(P=>{const ee=String(P.data.status||"active").trim().toLowerCase();return ee!=="deleted"&&ee!=="hidden"})}async function de({force:l=!1}={}){const c=oe(),u=Fe(c);if(!c)return;const f=Et({rangeKey:"7d"});if(!f)return;const k=`${c}::${f.toDay}`;if(!l&&u.loadedSignature===k&&u.status==="ready")return;if(!u.model){const j=jt(c,f.toDay);j&&(u.model=j,u.status="ready",m())}G+=1;const z=G;u.model||(u.status="loading",u.error="",m());try{const j={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:c},[Q,P]=await Promise.allSettled([Tt({...j,fromDay:f.fromDay,toDay:f.toDay}),Ct(c)]);if(z!==G)return;if(Q.status==="rejected")throw Q.reason;P.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",P.reason),u.model=zn({days:Q.value,todayKey:f.toDay,rawPosts:P.status==="fulfilled"?P.value:[]}),u.status="ready",u.error="",u.loadedSignature=k,Ft(c,u.model)}catch(j){if(z!==G)return;console.error("[mnyra][dashboard] load failed",j),u.model||(u.status="error",u.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}m()}function Ot(){J||!x||(J=!0,x.addEventListener("click",l=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(l.target?.closest?.("[data-dashboard-retry]")){de({force:!0});return}if(l.target?.closest?.("[data-dashboard-paywall-close]")){l.preventDefault(),be().paywall="",m();return}const c=l.target?.closest?.("[data-dashboard-metric-locked]");if(c){l.preventDefault(),be().paywall=String(c.getAttribute("data-dashboard-metric-locked")||"").trim(),m();return}const u=l.target?.closest?.("[data-dashboard-composer]");if(u){l.preventDefault(),At(u.getAttribute("data-dashboard-composer"));return}const f=l.target?.closest?.("[data-dashboard-panel-tab]");if(f){l.preventDefault();const k=pe(f.getAttribute("data-dashboard-panel-tab"));if(k===pe(e?.dashboardPanelTab))return;e.dashboardPanelTab=k,m()}}catch{}}))}function Me(l=""){const c=e?.userProfile||{},u=l?C(l)||{}:{},f=String(u.name||u.restaurantName||c.name||"").trim()||"Business";let k="";try{k=String(_()||"").trim()}catch{}if(!k)try{k=String(O(u)||"").trim()}catch{}return{name:f,logoUrl:k,kind:ge(),coverUrl:Dn(u),subscribed:Pn({profile:c,restaurant:u})}}function Mt(l=""){try{if(!Kt()||!l)return"";Nt({restaurantId:l,onBadgeFn:()=>m()});const c=It();return Ea({enabled:!0,unseenCount:c.unseen,activeOffers:c.activeOffers||0,todayBookings:c.today,iconFn:h})}catch{return""}}function Rt(){Qa(x),Ot();const l=oe(),c=Fe(l);let u="";if(!l)Pt(),u=Dt()?gn():yn();else{St(),zt();const f=Me(l),k=pe(e?.dashboardPanelTab);c.status==="idle"&&(c.status="loading",queueMicrotask(()=>{de({force:!1})}));let z="";c.model?z=un({posts:c.model.posts,iconFn:h}):c.status==="error"?z=bn({message:c.error}):z=pn();const q=`
        ${Mt(l)}
        ${tn({iconFn:h})}
        ${dn({iconFn:h,showEditor:!!l})}
        ${an({iconFn:h,showEditor:!!l})}
        ${nn({iconFn:h,showEditor:!!l})}
        ${sn({iconFn:h,kind:f.kind,showEditor:!!l})}
      `;let j;k==="analitika"?j=`
          <div class="mnyra-dash__embed">${B()}</div>
          ${z}
        `:k==="opsionet"?j=`<div class="mnyra-dash__embed">${H()}</div>`:j=q;const Q=jn({model:c.model,coverUrl:f.coverUrl,subscribed:f.subscribed,assets:wn}),P=String(c.paywall||"").trim();u=`
        ${en({name:f.name,logoUrl:f.logoUrl,iconFn:h})}
        ${ln({cards:Q,iconFn:h})}
        ${yt(`
          ${hn({activeTab:k,iconFn:h})}
          ${j}
        `)}
        ${P?mn({title:kn[P]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${u}
      </section>
    `}return Object.freeze({renderDashboardView:Rt,loadDashboard:de})}export{Nn as A,Kn as B,Ma as C,qt as D,Rn as E,Bn as F,re as G,Ut as M,qn as a,fe as b,Ht as c,Wa as d,Vn as e,Ge as f,Gn as g,I as h,Hn as i,Zn as j,Ua as k,Un as l,Ln as m,Wt as n,Oa as o,ya as p,Tn as q,Wn as r,Be as s,In as t,En as u,Da as v,ce as w,et as x,mt as y,Ae as z};
