const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-Bs_AcgMW.js","chunks/domain-feed-social-eager-CBFTsAn0.js","chunks/domain-auth-BwTam5Mg.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-DP4bEea7.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as it}from"./domain-auth-BwTam5Mg.js";import{f as M,r as ot,l as dt,s as me}from"./domain-analytics-eDoec1fZ.js";import{b as lt}from"./domain-business-accounts-D8NpUhi6.js";import{i as ct,e as ut,a as ht}from"./domain-feed-social-eager-CBFTsAn0.js";const pt=20,mt=8;function j(e=""){return e==null?"":String(e).trim()}function ae(e){if(e==null||e==="")return null;const a=Number(String(e).replace(",","."));return Number.isFinite(a)&&a>0?a:null}function ft(e=Date.now(),a=Math.random()){const t=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(a)||0))*36**6).toString(36).padStart(6,"0");return`room_${t}_${n}`}function bt(e={}){const a=e&&typeof e=="object"?e:{},t=[...Array.isArray(a.images)?a.images:[],j(a.imageUrl??a.image??a.photoUrl)],n=[];return t.forEach(r=>{const s=j(r);s&&!n.includes(s)&&n.push(s)}),n.slice(0,mt)}function gt(e={},{index:a=0}={}){const t=e&&typeof e=="object"?e:{},n=ae(t.persons??t.guests??t.capacity),r=ae(t.size??t.sizeSqm??t.area),s=bt(t);return{id:j(t.id)||ft(Date.now()+a),title:j(t.title??t.name),description:j(t.description??t.text).slice(0,400),imageUrl:s[0]||"",images:s,price:ae(t.price??t.pricePerNight),currency:j(t.currency??t.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:j(t.beds??t.bedsLabel).slice(0,60),size:r==null?null:Math.min(500,Math.round(r)),tag:j(t.tag??t.badge).slice(0,40),active:t.active!==!1}}function yt(e=[]){return(Array.isArray(e)?e:[]).slice(0,pt).map((a,t)=>gt(a,{index:t}))}function _t(e={}){return yt((e&&typeof e=="object"?e:{}).hotelRooms).filter(t=>t.title)}function Fa(e={}){const a=[];return Number.isFinite(e?.persons)&&e.persons>0&&a.push({icon:"users",label:`${e.persons} persona`}),j(e?.beds)&&a.push({icon:"bed",label:j(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&a.push({icon:"size",label:`${e.size} m²`}),a}function ja(e={}){const a=Number(e?.price);if(!Number.isFinite(a)||a<=0)return"";const t=j(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(a)?String(a):a.toFixed(2);return t==="EUR"?`€${n}`:`${n} ${t}`}const Ae="all",Pe=Object.freeze([{key:Ae,label:"Krejt",icon:"sparkles"},{key:"coffee",label:"Kafe",icon:"coffee"},{key:"drinks",label:"Pije",icon:"cup-soda"},{key:"food",label:"Ushqim",icon:"utensils"},{key:"dessert",label:"Ëmbëlsira",icon:"cake-slice"}]),xt=Object.freeze(Pe.map(e=>e.key)),Ra=1,vt=10,Ca=2,ne=Object.freeze([{key:"1-2",min:1,max:2,label:"1–2"},{key:"2-4",min:2,max:4,label:"2–4"},{key:"4-6",min:4,max:6,label:"4–6"},{key:"6+",min:6,max:99,label:"6+"}]),Ta=Object.freeze([{key:"now",label:"Tani",offsetMinutes:0},{key:"in30",label:"+30 min",offsetMinutes:30},{key:"in60",label:"+1 orë",offsetMinutes:60},{key:"later",label:"Më vonë",offsetMinutes:-1}]),wt="claim",fe="reservation",kt=Object.freeze([{key:"percent",label:"Zbritje %"},{key:"freeItem",label:"Produkt falas"},{key:"bundle",label:"Paket / Çmim special"},{key:"table",label:"Tavolinë"},{key:"custom",label:"Oferta ime"}]);function De(e=""){const a=String(e||"").trim().toLowerCase();return ne.find(t=>t.key===a)||null}const $t="Europe/Belgrade",Be=1440,Q=["mon","tue","wed","thu","fri","sat","sun"];function Fe(e){if(e==null||e==="")return 0;if(typeof e=="number")return Number.isFinite(e)?e:0;if(e instanceof Date){const n=e.getTime();return Number.isNaN(n)?0:n}if(typeof e=="object"){if(typeof e.toDate=="function")try{const n=e.toDate(),r=n instanceof Date?n.getTime():NaN;return Number.isNaN(r)?0:r}catch{return 0}return Number.isFinite(Number(e.seconds))?Math.round(Number(e.seconds)*1e3):Number.isFinite(Number(e._seconds))?Math.round(Number(e._seconds)*1e3):0}const t=new Date(String(e)).getTime();return Number.isNaN(t)?0:t}function R(e){const a=Fe(e);return a?new Date(a).toISOString():""}function St(e){const a=String(e??"").trim();if(!a)return-1;const t=a.match(/^(\d{1,2})\s*[:.：]?\s*(\d{2})?$/);if(!t)return-1;const n=Number(t[1]),r=t[2]===void 0?0:Number(t[2]);return!Number.isFinite(n)||!Number.isFinite(r)||n>24||r>59?-1:n*60+r}function be(e){const a=Math.max(0,Math.round(Number(e)||0))%Be,t=Math.floor(a/60),n=a%60;return`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function ge(e){return typeof e=="number"?Number.isFinite(e)?Math.max(0,Math.round(e)):-1:St(e)}function zt(e,a){const t=ge(e);let n=ge(a);return t<0||n<0||n===t?null:(n<t&&(n+=Be),{start:t,end:n})}function At(e=[]){const a=Array.isArray(e)?e:[],t=[];return a.forEach(n=>{if(!n||typeof n!="object")return;const r=zt(n.start??n.from,n.end??n.to);r&&t.push(r)}),Pt(t)}function Pt(e=[]){const a=(Array.isArray(e)?e:[]).filter(n=>n&&Number.isFinite(n.start)&&Number.isFinite(n.end)&&n.end>n.start).slice().sort((n,r)=>n.start-r.start||n.end-r.end),t=[];return a.forEach(n=>{const r=t[t.length-1];if(r&&n.start<=r.end){r.end=Math.max(r.end,n.end);return}t.push({start:n.start,end:n.end})}),t}const Dt="active",ye="paused",_e="archived",xe="go",Bt="public";function f(e="",a=240){return String(e??"").trim().slice(0,a)}function I(e,a=0){const t=Math.trunc(Number(e));return!Number.isFinite(t)||t<0?a:t}function Ft(e=""){const a=String(e||"").trim().toLowerCase();return a===ye?ye:a===_e?_e:Dt}function jt(e=""){const a=String(e||"").trim().toLowerCase();return xt.includes(a)?a:Ae}function je(e=""){return String(e||"").trim().toLowerCase()===fe?fe:wt}function Rt(e={}){const a=e&&typeof e=="object"?e:{},t=String(a.kind||a.type||"").trim().toLowerCase(),n=Math.min(90,Math.max(0,I(a.percent??a.discountPercent,0))),r={kind:["percent","freeItem","bundle","table","custom"].includes(t)?t:n>0?"percent":"custom",percent:n,itemId:f(a.itemId,180),itemName:f(a.itemName||a.item,160),priceText:f(a.priceText||a.price,60),text:f(a.text,160)};return r.label=Ct(r),r}function Ct(e={}){const a=e&&typeof e=="object"?e:{},t=f(a.text,160);if(t)return t;const n=I(a.percent,0);if(a.kind==="percent"||n>0)return n>0?`–${n} %`:"";if(a.kind==="freeItem"){const r=f(a.itemName,160);return r?`${r} falas`:"Produkt falas"}if(a.kind==="bundle"){const r=f(a.itemName,160),s=f(a.priceText,60);return r&&s?`${r} ${s}`:r||s||"Paket special"}return a.kind==="table"?"Tavolinë e rezervuar":""}function Re(e){const a=Array.isArray(e)?e:e?[e]:[],t=[];return a.forEach(n=>{const r=String(n||"").trim().toLowerCase();De(r)&&!t.includes(r)&&t.push(r)}),t.length?t:ne.map(n=>n.key)}function Tt(e=[]){const a=Re(e);let t=Number.POSITIVE_INFINITY,n=0;return a.forEach(r=>{const s=De(r);s&&(t=Math.min(t,s.min),n=Math.max(n,s.max))}),!Number.isFinite(t)||!n?{min:1,max:99}:{min:t,max:n}}function Et(e={}){const a=e&&typeof e=="object"?e:{},t=String(a.mode||"").trim().toLowerCase()==="windows"?"windows":"always",n=[];(Array.isArray(a.days)?a.days:[]).forEach(u=>{const m=String(u||"").trim().toLowerCase();Q.includes(m)&&!n.includes(m)&&n.push(m)});const s=At((Array.isArray(a.windows)?a.windows:[]).map(u=>({start:u?.start??u?.from,end:u?.end??u?.to})));return t==="always"||!n.length&&!s.length?{mode:"always",days:Q.slice(),windows:[]}:{mode:"windows",days:n.length?n:Q.slice(),windows:s}}function Ot(e={}){const a=e&&typeof e=="object"?e:{},t=s=>{const u=f(s,10);return/^\d{4}-\d{2}-\d{2}$/.test(u)?u:""},n=t(a.startDate||a.from),r=t(a.endDate||a.to);return n&&r&&r<n?{startDate:r,endDate:n}:{startDate:n,endDate:r}}function It(e={}){const a=e&&typeof e=="object"?e:{};return{slotGroups:I(a.slotGroups??a.maxGroupsPerSlot,0),slotGuests:I(a.slotGuests??a.maxGuestsPerSlot,0),dailyGroups:I(a.dailyGroups??a.maxGroupsPerDay,0),totalRedemptions:I(a.totalRedemptions??a.maxRedemptions,0)}}function Nt(e){const a=Array.isArray(e)?e:[],t=[];return a.forEach(n=>{const r=String(n||"").trim().toLowerCase();(r===xe||r===Bt)&&!t.includes(r)&&t.push(r)}),t.length?t:[xe]}function X(e={},a=""){const t=e&&typeof e=="object"?e:{},n=Re(t.partyRanges||t.partySizes),r=Tt(n),s=Rt(t.benefit),u=je(t.bookingType);return{id:f(t.id||a,180),restaurantId:f(t.restaurantId,180),locationId:f(t.locationId,180)||"main",title:f(t.title,120),description:f(t.description||t.text,400),terms:f(t.terms||t.conditions,400),benefit:s,benefitLabel:s.label,category:jt(t.category),partyRanges:n,minParty:r.min,maxParty:r.max,schedule:Et(t.schedule),dateRange:Ot(t.dateRange),bookingType:u,limits:It(t.limits),channels:Nt(t.channels),status:Ft(t.status),sponsored:t.sponsored===!0||t.sponsored?.active===!0,sponsoredUntil:R(t.sponsored?.until),priceLevel:Math.min(4,Math.max(0,I(t.priceLevel,0))),redeemedCount:I(t.redeemedCount,0),createdAt:R(t.createdAt),updatedAt:R(t.updatedAt)}}function Ea(e={},{serverTimestamp:a=null}={}){const t=X(e),n={restaurantId:t.restaurantId,locationId:t.locationId,title:t.title,description:t.description,terms:t.terms,benefit:t.benefit,benefitLabel:t.benefitLabel,category:t.category,partyRanges:t.partyRanges,minParty:t.minParty,maxParty:t.maxParty,schedule:t.schedule,dateRange:t.dateRange,bookingType:t.bookingType,limits:t.limits,channels:t.channels,status:t.status,sponsored:t.sponsored,priceLevel:t.priceLevel};return a&&(n.updatedAt=a,t.createdAt||(n.createdAt=a)),n}function Oa(e={}){const a=X(e),t=[];return a.restaurantId||t.push({field:"restaurantId",message:"Lokali mungon."}),a.benefitLabel||t.push({field:"benefit",message:"Shkruaj çka po ofron."}),a.partyRanges.length||t.push({field:"partyRanges",message:"Zgjidh sa persona."}),a.schedule.mode==="windows"&&(a.schedule.days.length||t.push({field:"schedule",message:"Zgjidh ditët."}),a.schedule.windows.length||t.push({field:"schedule",message:"Zgjidh orarin."})),a.benefit.kind==="percent"&&a.benefit.percent<=0&&t.push({field:"benefit",message:"Zbritja duhet të jetë mbi 0 %."}),{ok:t.length===0,errors:t,offer:a}}function Ce(e={}){const t=(e&&e.schedule?e:X(e)).schedule;if(t.mode==="always")return"Gjithmonë";const n={mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"},r=t.days.map(u=>n[u]||u).join(", "),s=t.windows.map(u=>`${be(u.start)}-${be(u.end)}`).join(", ");return[r,s].filter(Boolean).join(" · ")}function Te(e={}){const a=e&&e.partyRanges?e:X(e);return`${a.maxParty>=vt?`${a.minParty}+`:`${a.minParty}–${a.maxParty}`} persona`}const _=Object.freeze({confirmed:"confirmed",checkedIn:"checked_in",completed:"completed",cancelledByUser:"cancelled_by_user",cancelledByBusiness:"cancelled_by_business",notArrived:"not_arrived",expired:"expired"});Object.freeze([_.confirmed,_.checkedIn]);Object.freeze({[_.confirmed]:[_.checkedIn,_.completed,_.cancelledByUser,_.cancelledByBusiness,_.notArrived,_.expired],[_.checkedIn]:[_.completed,_.cancelledByBusiness],[_.completed]:[],[_.cancelledByUser]:[],[_.cancelledByBusiness]:[],[_.notArrived]:[],[_.expired]:[]});function Ee(e=""){const a=String(e||"").trim().toLowerCase();return Object.values(_).includes(a)?a:_.confirmed}function Ia(e={},a=""){const t=e&&typeof e=="object"?e:{},n=t.snapshot&&typeof t.snapshot=="object"?t.snapshot:{};return{id:f(t.id||a,180),restaurantId:f(t.restaurantId||n.restaurantId,180),locationId:f(t.locationId||n.locationId,180)||"main",offerId:f(t.offerId||n.offerId,180),guestId:f(t.guestId,180),uid:f(t.uid,180),shortCode:f(t.shortCode,12).toUpperCase(),type:je(t.type||n.bookingType),status:Ee(t.status),partySize:Math.max(1,Math.trunc(Number(t.partySize||n.partySize)||1)),expectedArrivalAt:R(t.expectedArrivalAt||n.expectedArrivalAt),expectedArrivalMs:Fe(t.expectedArrivalAt||n.expectedArrivalAt),dayKey:f(t.dayKey,10),slotKey:f(t.slotKey,240),timeZone:f(t.timeZone,60)||$t,snapshot:n,businessName:f(n.businessName,120),benefitLabel:f(n.benefitLabel,160),logoUrl:f(n.logoUrl,500),businessSeenAt:R(t.businessSeenAt),checkedInAt:R(t.checkedInAt),completedAt:R(t.completedAt),cancelledAt:R(t.cancelledAt),cancelReason:f(t.cancelReason,200),createdAt:R(t.createdAt),updatedAt:R(t.updatedAt)}}function Kt(e={}){const a=Ee(e?.status);return a===_.confirmed?"Po vijnë":a===_.checkedIn?"Këtu":a===_.completed?"Përfunduar":a===_.cancelledByUser?"Anuluar nga klienti":a===_.cancelledByBusiness?"Anuluar nga ju":a===_.notArrived?"Nuk erdhën":"Skaduar"}const l=Object.freeze({brand:"Mnyra GO",mark:"⚡",editor:"Editor",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{active:"Aktiv",offers:"Ofertat",history:"Historiku",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"Ofertë e re GO",editOffer:"Ndrysho ofertën",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj ofertën",saving:"Po ruhet...",cancel:"Anulo",edit:"Edit",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",benefitQuestion:"Çka po ofron?",benefitCustom:"Teksti yt (opsionale)",partyQuestion:"Për sa persona?",categoryQuestion:"Kategoria",scheduleQuestion:"Kur vlen?",always:"Gjithmonë",specificHours:"Orar specifik",dateFrom:"Prej datës (opsionale)",dateTo:"Deri me datën (opsionale)",actionQuestion:"Kur klienti e zgjedh",onlyOffer:"Vetëm oferta",offerAndTable:"Oferta + tavolinë",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",loading:"Po ngarkohet...",guestName:"Mnyra Guest",table:"Tavolinë",markArrived:"Erdhën",markNotArrived:"Nuk erdhën",markDone:"Përfundo",keepsRunning:"Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",onlyBusiness:"Ky funksion eshte vetem per profile biznesi.",loadingBusiness:"Biznesi po ngarkohet..."});function o(e,a=""){return typeof e=="function"?e(a):String(a??"")}function G(e,a="",t="w-4 h-4"){return typeof e=="function"?e(a,t):""}function Oe(e=""){const a=Date.parse(String(e||""));if(!Number.isFinite(a))return"";const t=new Date(a);return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function Mt({enabled:e=!1,unseenCount:a=0,activeOffers:t=0,todayBookings:n=0,iconFn:r=null,texts:s={}}={}){if(!e)return"";const u={...l,...s||{}},m=Math.max(0,Math.trunc(Number(a)||0)),k=t>0||n>0,g=k?`${t} oferta aktive · ${n} rezervime sot`:u.cardIdle;return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${m>0?`<span class="mnyra-dash__composer-badge" aria-label="${m} ${u.statNew}">${m}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${g}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${G(r,"zap","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${k?u.cardManage:u.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${G(r,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Gt({summary:e={},deps:a={}}={}){const t=a.escapeHtml,n=a.icon;return`
    <div class="mb-6 grid grid-cols-2 gap-3">
      ${[{key:"unseen",label:l.statNew,value:e.unseen||0,icon:"bell",tone:"text-rose-500"},{key:"open",label:l.statActive,value:e.open||0,icon:"zap",tone:"text-indigo-600"},{key:"today",label:l.statToday,value:e.today||0,icon:"calendar",tone:"text-amber-600"},{key:"guests",label:l.guests,value:e.guests||0,icon:"users",tone:"text-emerald-600"}].map(s=>`
        <div class="bg-white rounded-[1.8rem] p-4 border border-slate-100 shadow-sm" data-go-kpi="${o(t,s.key)}">
          <div class="flex items-center gap-2 ${s.tone}">
            ${G(n,s.icon,"w-3.5 h-3.5")}
            <span class="text-[9px] font-black uppercase tracking-widest">${o(t,s.label)}</span>
          </div>
          <p class="mt-2 text-2xl font-black tracking-tighter text-slate-900">${o(t,s.value)}</p>
        </div>
      `).join("")}
    </div>
  `}function Lt({tab:e="active",deps:a={}}={}){const t=a.escapeHtml;return`
    <div class="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" data-go-tabs>
      ${[["active",l.tabs.active],["offers",l.tabs.offers],["history",l.tabs.history],["options",l.tabs.options]].map(([r,s])=>`
        <button type="button" role="tab" aria-selected="${e===r?"true":"false"}" data-go-business-tab="${r}"
          class="shrink-0 min-h-[44px] px-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors ${e===r?"bg-slate-900 text-white":"bg-white text-slate-500 border border-slate-100"}">
          ${o(t,s)}
        </button>
      `).join("")}
    </div>
  `}function ve(e={},a={}){const t=a.escapeHtml,n=e.type==="reservation",r=Oe(e.expectedArrivalAt),s=e.benefitLabel||e.snapshot?.benefitLabel||"",u=`${l.guestName} · ${e.shortCode||""}`.trim();return`
    <div class="p-4 rounded-[1.6rem] border ${!e.businessSeenAt?"bg-indigo-50/50 border-indigo-100":"bg-slate-50 border-slate-100"}" data-go-booking="${o(t,e.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">GO #${o(t,e.shortCode||"")}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${o(t,Kt(e))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${o(t,u)}</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-600">
        <span>👥 ${o(t,`${e.partySize||1} ${l.guests}`)}</span>
        ${r?`<span>🕐 Rreth ${o(t,r)}</span>`:""}
        ${s?`<span>🎁 ${o(t,s)}</span>`:""}
        ${n?`<span>🪑 ${o(t,l.table)}</span>`:""}
      </div>
      ${e.status==="confirmed"?`
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" data-go-booking-action="checkin" data-go-booking-id="${o(t,e.id)}"
            class="px-3 py-1.5 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white">${o(t,l.markArrived)}</button>
          <button type="button" data-go-booking-action="notArrived" data-go-booking-id="${o(t,e.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${o(t,l.markNotArrived)}</button>
        </div>
      `:""}
      ${e.status==="checked_in"?`
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${o(t,e.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${o(t,l.markDone)}</button>
        </div>
      `:""}
    </div>
  `}function Y({eyebrow:e="",title:a="",sub:t="",action:n="",body:r="",deps:s={}}={}){const u=s.escapeHtml;return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${o(u,e)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${o(u,a)}</h3>
          ${t?`<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${o(u,t)}</p>`:""}
        </div>
        ${n}
      </div>
      ${r}
    </div>
  `}function Ut(e={},a={}){const t=a.escapeHtml,n=e.status==="paused"?l.paused:e.status==="archived"?l.archived:"";return`
    <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${o(t,e.id)}">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 truncate">${o(t,e.benefitLabel||"")}</p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">
          ${o(t,Te(e))} &middot; ${o(t,Ce(e))}
        </p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${e.status==="active"?"text-emerald-600":"text-slate-400"}">
          ${o(t,n||l.statActive)}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <button type="button" data-go-offer-edit="${o(t,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${o(t,l.edit)}</button>
        <button type="button" data-go-offer-toggle="${o(t,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${o(t,e.status==="active"?l.paused:l.activate)}</button>
        <button type="button" data-go-offer-archive="${o(t,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">${o(t,l.archive)}</button>
      </div>
    </div>
  `}function Ht({offer:e={},businessName:a="",deps:t={}}={}){const n=t.escapeHtml;return`
    <div class="rounded-[1.8rem] border border-slate-200 bg-white p-5" data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${o(n,l.preview)}</p>
      <p class="mt-3 text-[13px] font-black text-slate-900">
        ${o(n,a)} <span class="font-bold text-slate-400">${o(n,l.offering)}</span>
      </p>
      <p class="mt-2 text-2xl font-black tracking-tighter text-slate-900">${o(n,e.benefitLabel||"")}</p>
      <p class="text-xs font-bold text-slate-500">${o(n,l.forGroup)}</p>
      <p class="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        ${o(n,Te(e))} &middot; ${o(n,Ce(e))}
      </p>
      <span class="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white">
        ${o(n,l.accept)}
      </span>
    </div>
  `}function E(e,a="",t=""){return`<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${t?` for="${o(e,t)}"`:""}>${o(e,a)}</label>`}function O(e,{active:a=!1,attr:t="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${t?`${t}="${o(r,n)}"`:""} aria-pressed="${a?"true":"false"}"
      class="min-h-[44px] px-4 rounded-2xl text-xs font-black transition-colors ${a?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${o(r,e)}
    </button>
  `}function Na({editor:e=null,businessName:a="",deps:t={}}={}){if(!e)return"";const n=t.escapeHtml,r=t.icon,s=e.draft||{},u=Array.isArray(e.errors)?e.errors:[],m=b=>u.find(F=>F.field===b)?.message||"",k=Array.isArray(s.partyRanges)?s.partyRanges:[],g=Array.isArray(s.schedule?.days)?s.schedule.days:[],h=s.schedule?.mode==="windows"?"windows":"always",v={mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"},w=e.mode==="edit",S="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400";return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-offer-editor>
      <div class="flex items-center gap-3 mb-6">
        <button type="button" data-go-offer-cancel class="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500">
          ${G(r,"chevron-left","w-4 h-4")}
        </button>
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${o(n,l.brand)}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">${o(n,w?l.editOffer:l.createOffer)}</h2>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-5">
        <div>
          ${E(n,l.benefitQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${kt.map(b=>O(b.label,{active:(s.benefit?.kind||"percent")===b.key,attr:"data-go-benefit-kind",value:b.key,escapeHtml:n})).join("")}
          </div>
          ${(s.benefit?.kind||"percent")==="percent"?`
            <input id="goBenefitPercent" type="number" min="1" max="90" step="1" data-go-benefit-percent
              value="${o(n,s.benefit?.percent||10)}" class="${S}" />
          `:`
            <input id="goBenefitItem" type="text" data-go-benefit-item placeholder="Cookie, Cappuccino..."
              value="${o(n,s.benefit?.itemName||"")}" class="${S}" />
            <input id="goBenefitPrice" type="text" data-go-benefit-price placeholder="2,50 €"
              value="${o(n,s.benefit?.priceText||"")}" class="${S}" />
          `}
          <input id="goBenefitText" type="text" data-go-benefit-text placeholder="${o(n,l.benefitCustom)}"
            value="${o(n,s.benefit?.text||"")}" class="${S}" />
          ${m("benefit")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${o(n,m("benefit"))}</p>`:""}
        </div>

        <div>
          ${E(n,l.partyQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${ne.map(b=>O(b.label,{active:k.includes(b.key),attr:"data-go-offer-party",value:b.key,escapeHtml:n})).join("")}
          </div>
        </div>

        <div>
          ${E(n,l.categoryQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${Pe.map(b=>O(b.label,{active:(s.category||"all")===b.key,attr:"data-go-offer-category",value:b.key,escapeHtml:n})).join("")}
          </div>
        </div>

        <div>
          ${E(n,l.scheduleQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${O(l.always,{active:h==="always",attr:"data-go-offer-schedule",value:"always",escapeHtml:n})}
            ${O(l.specificHours,{active:h==="windows",attr:"data-go-offer-schedule",value:"windows",escapeHtml:n})}
          </div>
          ${h==="windows"?`
            <div class="mt-3 flex flex-wrap gap-2">
              ${Q.map(b=>O(v[b],{active:g.includes(b),attr:"data-go-offer-day",value:b,escapeHtml:n})).join("")}
            </div>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <input id="goOfferFrom" type="time" data-go-offer-from value="${o(n,e.windowFrom||"14:00")}" class="${S} mt-0" />
              <input id="goOfferTo" type="time" data-go-offer-to value="${o(n,e.windowTo||"18:00")}" class="${S} mt-0" />
            </div>
          `:""}
          ${m("schedule")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${o(n,m("schedule"))}</p>`:""}
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            ${E(n,l.dateFrom,"goOfferStart")}
            <input id="goOfferStart" type="date" data-go-offer-start value="${o(n,s.dateRange?.startDate||"")}" class="${S}" />
          </div>
          <div>
            ${E(n,l.dateTo,"goOfferEnd")}
            <input id="goOfferEnd" type="date" data-go-offer-end value="${o(n,s.dateRange?.endDate||"")}" class="${S}" />
          </div>
        </div>

        <div>
          ${E(n,l.actionQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${O(l.onlyOffer,{active:s.bookingType!=="reservation",attr:"data-go-offer-type",value:"claim",escapeHtml:n})}
            ${O(l.offerAndTable,{active:s.bookingType==="reservation",attr:"data-go-offer-type",value:"reservation",escapeHtml:n})}
          </div>
        </div>

        <div>
          ${E(n,l.limitsTitle)}
          <p class="mt-1 text-[10px] font-bold text-slate-400">${o(n,l.noLimit)}</p>
          <div class="mt-2 grid grid-cols-2 gap-3">
            ${["slotGroups","slotGuests","dailyGroups","totalRedemptions"].map(b=>`
              <div>
                <span class="text-[10px] font-black text-slate-500">${o(n,l[b])}</span>
                <input type="number" min="0" step="1" data-go-offer-limit="${b}"
                  value="${o(n,s.limits?.[b]??0)}" class="${S}" />
              </div>
            `).join("")}
          </div>
        </div>

        ${Ht({offer:s,businessName:a,deps:t})}

        ${e.status?`<p class="text-[11px] font-bold text-rose-500 text-center">${o(n,e.status)}</p>`:""}

        <div class="grid grid-cols-1 gap-2.5">
          <button type="button" data-go-offer-save ${e.saving?"disabled":""}
            class="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform ${e.saving?"opacity-60":""}">
            ${o(n,e.saving?l.saving:w?l.save:l.activate)}
          </button>
          <button type="button" data-go-offer-cancel
            class="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform">
            ${o(n,l.cancel)}
          </button>
        </div>
      </div>
    </div>
  `}function Ka({restaurantName:e="",tab:a="active",summary:t={},bookings:n=[],offers:r=[],settings:s={},paused:u=!1,loading:m=!1,error:k="",deps:g={}}={}){const h=g.escapeHtml,v=g.icon,w=n.filter(P=>["confirmed","checked_in"].includes(P.status)),S=n.filter(P=>!["confirmed","checked_in"].includes(P.status)),b=r.filter(P=>P.status!=="archived");let F="";if(a==="offers")F=Y({eyebrow:l.brand,title:l.tabs.offers,sub:`${b.length} ${b.length===1?"oferte":"oferta"}`,action:`
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${G(v,"plus","w-4 h-4")}
        </button>
      `,body:b.length?`<div class="space-y-3">${b.map(P=>Ut(P,g)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(h,l.emptyTitle)}</div>`,deps:g});else if(a==="history")F=Y({eyebrow:l.brand,title:l.tabs.history,sub:`${S.length}`,body:S.length?`<div class="space-y-3">${S.map(P=>ve(P,g)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(h,l.noHistory)}</div>`,deps:g});else if(a==="options"){const P=Oe(s?.pausedUntil);F=Y({eyebrow:l.brand,title:l.tabs.options,body:`
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${o(h,l.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${o(h,u?`${l.pausedUntil} ${P}`:"ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${u?"text-amber-600":"text-emerald-600"}">
            ${o(h,u?l.paused:l.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${u?`<button type="button" data-go-pause="0" class="min-h-[44px] px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${o(h,l.resume)}</button>`:[{value:"30",label:"30 min"},{value:"60",label:"1 orë"},{value:"tomorrow",label:"Deri nesër"},{value:"-1",label:"Pa afat"}].map(U=>`
              <button type="button" data-go-pause="${U.value}"
                class="min-h-[44px] px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${o(h,U.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${o(h,l.keepsRunning)}</p>
      `,deps:g})}else F=Y({eyebrow:l.brand,title:l.tabs.active,sub:`${w.length}`,body:m?`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${o(h,l.loading)}</div>`:w.length?`<div class="space-y-3">${w.map(P=>ve(P,g)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(h,l.noBookings)}</div>`,deps:g});return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${o(h,l.brand)}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">${o(h,l.editor)}</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${o(h,e)}</p>
        </div>
      </div>

      ${Gt({summary:t,deps:g})}
      ${Lt({tab:a,deps:g})}
      ${F}
      ${k?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${o(h,k)}</p>`:""}
    </div>
  `}function Ma({deps:e={},resolving:a=!1}={}){const t=e.icon,n=e.escapeHtml;return a?`
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${o(n,l.loadingBusiness)}</p>
        </div>
      </div>
    `:`
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${G(t,"lock","w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${o(n,l.brand)}</h2>
        <p class="text-sm text-slate-500">${o(n,l.onlyBusiness)}</p>
      </div>
    </div>
  `}const we="mnyraDashboardStyles",Zt=`
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
`;function Vt(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(we)))try{const a=e.createElement("style");a.id=we,a.textContent=Zt,e.head?.appendChild(a)}catch{}}function x(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function A(e,a,t=""){if(typeof e!="function")return"";try{return e(a,t)||""}catch{return""}}const Wt=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function qt({businessType:e="",isShopCatalog:a=!1}={}){if(a)return"shop";const t=String(e||"").trim().toLowerCase();return Wt.includes(t)?"hotel":"restaurant"}function Yt(e=new Date().getHours()){const a=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return a>=5&&a<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:a>=11&&a<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:a>=18&&a<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function Qt({name:e="",logoUrl:a="",hour:t=new Date().getHours(),iconFn:n}={}){const r=Yt(t),s=x(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${a?`<img src="${x(a)}" alt="${s}" title="${s}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${s}">${A(n,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${x(r.text)}</p>
    </div>
  `}function Jt({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Xt({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function ea({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const ke=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function ta(e="restaurant"){const a=String(e||"").trim().toLowerCase();return ke[a]||ke.restaurant}function aa({iconFn:e,kind:a="restaurant",showEditor:t=!0}={}){if(!t)return"";const n=ta(a);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${x(n.accent)}</span> ${x(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${x(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${x(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const na="/waiter?from=panel";function ra({iconFn:e,showEditor:a=!0}={}){return a?`
    <a href="${na}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function sa({cards:e=[],iconFn:a}={}){const t=(Array.isArray(e)?e:[]).filter(r=>r&&r.key);if(!t.length)return"";const n=t.map((r,s)=>{const u=x(r.label||"");if(r.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const m=s<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let k="";r.imageUrl?k=`<img class="mnyra-dash__hl-media" src="${x(r.imageUrl)}" alt="" ${m} decoding="async" onerror="this.style.display='none'" />`:r.videoUrl&&(k=`<video class="mnyra-dash__hl-media" src="${x(r.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const g=`
      <span class="mnyra-dash__hl-plate">${A(a,r.iconName||"image","w-6 h-6")}</span>
      ${k}
    `,h=r.withEye?`<span class="mnyra-dash__hl-eye">${A(a,"eye","w-4 h-4")}</span>`:"";let v;r.locked?v=`<span class="mnyra-dash__hl-lock">${A(a,"lock","w-3 h-3")}Me pagesë</span>`:r.loading?v='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':r.emptyText?v=`<span class="mnyra-dash__hl-empty">${x(r.emptyText)}</span>`:v=`<span class="mnyra-dash__hl-value">${h}${x(r.value||"0")}</span>`;let w;r.locked?w=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${x(r.key)}"`:r.composer?w=`class="mnyra-dash__hl-card" data-dashboard-composer="${x(r.composer)}"`:w=`class="mnyra-dash__hl-card"${r.panelTab?` data-dashboard-panel-tab="${x(r.panelTab)}"`:""}`;const S=r.locked?`${u} – me pagesë`:`${u} ${r.emptyText||r.value||""}`.trim();return`
      <button type="button" ${w} data-dashboard-metric="${x(r.key)}" aria-label="${x(S)}">
        ${g}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${u}</span>
          ${v}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-dash__hl" data-dashboard-metrics="${x(ia(t))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function ia(e=[]){return(Array.isArray(e)?e:[]).filter(a=>a&&a.key).map(a=>[a.key,a.label||"",a.value||"",a.emptyText||"",a.imageUrl||"",a.videoUrl||"",a.iconName||"",a.panelTab||"",a.composer||"",a.pending?"p":"",a.loading?"l":"",a.locked?"x":"",a.withEye?"e":""].join("~")).join("|")}const Ie=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function J(e=""){const a=String(e||"").trim().toLowerCase();return Ie.some(t=>t.id===a)?a:"funksionet"}function oa({activeTab:e="funksionet",iconFn:a}={}){const t=J(e);return`<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${Ie.map(r=>{const s=r.id===t;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${x(r.id)}"
        aria-selected="${s?"true":"false"}"
        class="mnyra-dash__tab"
      >${A(a,r.iconName,"w-4 h-4")}<span class="mnyra-dash__tab-label">${x(r.label)}</span></button>
    `}).join("")}</div>`}function Ne(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function da({posts:e=[],iconFn:a}={}){const t=Array.isArray(e)?e:[];let n="";return t.length?(n=t.map(r=>{const s=[r.dateLabel,`${M(r.likesCount||0)} Likes`,`${M(r.commentsCount||0)} Kommentare`];return Number(r.impressions||0)>0&&s.push(`${M(r.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${r.thumbUrl?`<img src="${x(r.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:A(a,r.mediaType==="video"?"play":"image","w-5 h-5")}
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
  `}function la(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function ca({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${x(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function ua(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function ha(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),a=Array.from({length:4},(t,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    ${ua()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${Ne(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>').join("")}
      </div>
      ${a}
    `)}
  `}function pa({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${x(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function ma(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const fa="menyra_social_dashboard_cache_v1::",$e="menyra_social_composer_products_v1::",Se=2500,ze=1200,ba=6,ga=3,ya=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),_a=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function B(e){const a=Number(e);return Number.isFinite(a)?a:0}function xa(e={}){const a=String(e.createdAtClient||"").trim();if(a){const n=new Date(a);if(!Number.isNaN(n.getTime()))return n}const t=e.createdAt;if(t&&typeof t.toDate=="function")try{const n=t.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function va(e="",a={}){const t=Array.isArray(a.media)&&a.media.length?a.media[0]:{},n=String(t.type||a.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",r=String(t.thumbUrl||(n==="image"?t.url:"")||a.thumbUrl||"").trim(),s=n==="video"?String(t.url||a.mediaUrl||"").trim():"",u=xa(a);return{id:String(e||"").trim(),caption:String(a.caption||"").trim(),mediaType:n,thumbUrl:r,videoUrl:s,likesCount:B(a.likesCount),commentsCount:B(a.commentsCount),impressions:0,dateLabel:u?u.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:u?u.getTime():0}}function wa({days:e=[],todayKey:a="",rawPosts:t=[]}={}){const n=Array.isArray(e)?e:[],r=me(n),s=n.find(h=>String(h?.date||h?.id||"").trim()===String(a||"").trim()),u=me(s?[s]:[]),m=r.merged?.posts&&typeof r.merged.posts=="object"?r.merged.posts:{},k=(Array.isArray(t)?t:[]).map(h=>va(h?.id,h?.data||{})).filter(h=>h.id).map(h=>({...h,impressions:B(m[h.id]?.impressions)})),g=k.slice().sort((h,v)=>v.createdAtMs-h.createdAtMs).slice(0,ga);return{day:String(a||"").trim(),week:r.summary,today:u.summary,posts:g,latestPost:ka(k)}}function ka(e=[]){const a=(Array.isArray(e)?e:[]).filter(t=>t&&t.id);return a.length?a.slice().sort((t,n)=>B(n.createdAtMs)-B(t.createdAtMs)||B(n.impressions)-B(t.impressions)||B(n.likesCount)-B(t.likesCount))[0]:null}function $a({profile:e={},restaurant:a={}}={}){return lt({profile:e,restaurant:a,feature:"qr"})}function Sa(e={}){const a=e&&typeof e=="object"?e:{};return String(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||a.bannerUrl||"").trim()}function za({model:e=null,coverUrl:a="",subscribed:t=!1,assets:n={}}={}){const r=e?.today||{},s=!e,u=e?.latestPost||null,m=[];if(s)m.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!u)m.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const k=String(u.thumbUrl||"").trim();m.push({key:"latestPost",label:"Postimi fundit",value:M(B(u.impressions)),withEye:!0,imageUrl:k,videoUrl:k?"":String(u.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return m.push({key:"profileViews",label:"Vizitor n'profil",value:M(B(r.profileViews)),withEye:!0,loading:s,imageUrl:String(a||"").trim(),iconName:"user",panelTab:"analitika"}),m.push({key:"menuOpens",label:"Vizitor n'meny",value:M(B(r.menuOpens)),withEye:!0,loading:s&&t,locked:!t,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),m.push({key:"qrScans",label:"Skanime n'tavolina",value:M(B(r.qrScans)),withEye:!0,loading:s&&t,locked:!t,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),m}function Ga({state:e,renderFn:a,documentObj:t,firestoreApi:n={},profileApi:r={},composerApi:s={},viewApi:u={},iconFn:m,storageObj:k}={}){const g=t||(typeof document>"u"?null:document),h=g?.defaultView||(typeof window>"u"?null:window),v=typeof a=="function"?a:()=>{},w=k||(typeof localStorage>"u"?null:localStorage),S=typeof r.getBusinessProfileTypeFn=="function"?r.getBusinessProfileTypeFn:(()=>""),b=typeof r.isShopCatalogProfileFn=="function"?r.isShopCatalogProfileFn:(()=>!1),F=typeof r.getRestaurantMetaByIdFn=="function"?r.getRestaurantMetaByIdFn:(()=>null),P=typeof r.resolveRestaurantLogoFn=="function"?r.resolveRestaurantLogoFn:(()=>""),U=typeof r.resolveOwnAvatarUrlFn=="function"?r.resolveOwnAvatarUrlFn:(()=>""),Ke=typeof u.renderAnalyticsViewFn=="function"?u.renderAnalyticsViewFn:(()=>""),Me=typeof u.renderSettingsViewFn=="function"?u.renderSettingsViewFn:(()=>""),Ge=typeof u.warmAnalyticsFn=="function"?u.warmAnalyticsFn:(()=>{});let re=!1,L=0,se=!1,N=null,H=null,Z="",ie=!1,oe=()=>null;const Le=300;function ee(){const i=e?.userProfile||{};return qt({businessType:S(i),isShopCatalog:b(i)})}function Ue(i=""){const d=F(i)||{};return _t(d).map(c=>({id:c.id,name:c.title,price:c.price??"",category:c.beds||c.tag||"",type:"room",imageUrl:c.imageUrl||""}))}function He(i=""){if(!w)return null;try{const d=w.getItem(`${$e}${i}`);if(!d)return null;const c=JSON.parse(d),p=Array.isArray(c?.items)?c.items:null;return p&&p.length?p:null}catch{return null}}function Ze(i="",d=[]){if(w)try{w.setItem(`${$e}${i}`,JSON.stringify({savedAt:Date.now(),items:d}))}catch{}}async function Ve(i=""){const{db:d,collectionFn:c,queryFn:p,limitFn:y,getDocsFn:$}=n;if(!d||typeof c!="function"||typeof $!="function")throw new Error("Produktet nuk u ngarkuan.");const C=c(d,"restaurants",i,"menuItems"),D=typeof p=="function"&&typeof y=="function"?p(C,y(Le)):C,T=await $(D),z=[];return T.forEach(K=>{const q=oe(K?.id,K?.data?.()||{});q&&z.push(q)}),z.sort((K,q)=>K.name.localeCompare(q.name,"sq")),z}async function We(i="",d){const c=String(i||"").trim();if(!c)throw new Error("Produktet nuk u ngarkuan.");if(ee()==="hotel")return Ue(c);const p=Ve(c).then($=>(Ze(c,$),$)),y=He(c);return y?(typeof d=="function"?p.then($=>d($)).catch(()=>{}):p.catch(()=>{}),y):p}function de(){return N?Promise.resolve(N):(H||(H=it(()=>import("./business-composer-controller-Bs_AcgMW.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(i=>(oe=typeof i?.normalizeComposerProductCore=="function"?i.normalizeComposerProductCore:(()=>null),N=i.createBusinessComposerController({documentObj:g,windowObj:g?.defaultView||null,api:{getRestaurantIdFn:()=>V(),getBusinessMetaFn:()=>{const d=V();if(!d)return{name:"",logoUrl:"",city:""};const c=pe(d),p=F(d)||{};return{name:c.name,logoUrl:c.logoUrl,city:String(p.city||"").trim()}},loadProductsFn:(d,c)=>We(d,c),getBusinessKindFn:()=>ee(),uploadImageFn:s.uploadImageFn,uploadVideoFn:s.uploadVideoFn,captureVideoPosterFn:s.captureVideoPosterFn,createPostFn:s.createPostFn,createStoryFn:s.createStoryFn,formatPriceFn:s.formatPriceFn,getOptimizedImageUrlFn:s.getOptimizedImageUrlFn,escapeHtmlFn:s.escapeHtmlFn,iconFn:typeof m=="function"?m:void 0,afterPublishFn:async d=>{try{await W({force:!0})}catch{}typeof s.afterPublishFn=="function"&&await s.afterPublishFn(d)}}}),N)).catch(i=>{throw H=null,console.error("[mnyra][dashboard] composer load failed",i),i})),H)}function le(){const i=h?.navigator?.connection;return!i||typeof i!="object"?!1:i.saveData===!0?!0:/(^|-)2g$/.test(String(i.effectiveType||"").trim().toLowerCase())}function qe(){if(ie||N||!h||le())return;ie=!0;const i=()=>{if(de().catch(()=>{}),typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}};if(typeof h.requestIdleCallback=="function"){h.requestIdleCallback(i,{timeout:Se});return}h.setTimeout?.(i,ze)}function Ye(){if(re||!h||le())return;re=!0;const i=()=>{try{Ge()}catch{}};if(typeof h.requestIdleCallback=="function"){h.requestIdleCallback(i,{timeout:Se});return}h.setTimeout?.(i,ze)}function Qe(i="post"){const d=String(i||"").trim().toLowerCase(),c=d==="story"||d==="profile"?d:"post";if(typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}if(N){N.open(c);return}Z=c,de().then(p=>{const y=Z||c;Z="",p?.open?.(y)}).catch(()=>{Z=""})}function te(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function ce(i=""){const d=te(),c=String(i||"").trim();return String(d.restaurantId||"")===c||(d.restaurantId=c,d.model=null,d.status="idle",d.error="",d.loadedSignature="",d.paywall="",L+=1),d}function V(){const i=e?.userProfile||{};return String(i.restaurantId||i.staffRestaurantId||"").trim()}let ue="";function Je(){const i=String(e?.user?.uid||"").trim();!i||ue===i||typeof r.ensureBusinessProfileFn=="function"&&(ue=i,Promise.resolve().then(()=>r.ensureBusinessProfileFn()).catch(d=>{console.warn("[mnyra][panel] business profile could not be resolved",d)}).finally(()=>{String(e?.user?.uid||"").trim()===i&&v()}))}function Xe(){const i=String(e?.user?.uid||"").trim();if(!i)return!1;const d=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||d===i}function he(i=""){return`${fa}${i}`}function et(i="",d=""){if(!w||!i)return null;try{const c=w.getItem(he(i));if(!c)return null;const p=JSON.parse(c);return!p||typeof p!="object"||String(p.day||"").trim()!==String(d||"").trim()||!p.model||typeof p.model!="object"?null:p.model}catch{return null}}function tt(i="",d=null){if(!(!w||!i||!d))try{w.setItem(he(i),JSON.stringify({day:d.day,model:d}))}catch{}}async function at(i=""){const{db:d,collectionFn:c,queryFn:p,orderByFn:y,limitFn:$,getDocsFn:C}=n;if(!d||typeof c!="function"||typeof p!="function"||typeof y!="function"||typeof $!="function"||typeof C!="function")return[];const D=c(d,"restaurants",i,"socialPosts");return(await C(p(D,y("createdAt","desc"),$(ba)))).docs.map(z=>({id:z.id,data:z.data()||{}})).filter(z=>{const K=String(z.data.status||"active").trim().toLowerCase();return K!=="deleted"&&K!=="hidden"})}async function W({force:i=!1}={}){const d=V(),c=ce(d);if(!d)return;const p=ot({rangeKey:"7d"});if(!p)return;const y=`${d}::${p.toDay}`;if(!i&&c.loadedSignature===y&&c.status==="ready")return;if(!c.model){const D=et(d,p.toDay);D&&(c.model=D,c.status="ready",v())}L+=1;const $=L;c.model||(c.status="loading",c.error="",v());try{const D={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:d},[T,z]=await Promise.allSettled([dt({...D,fromDay:p.fromDay,toDay:p.toDay}),at(d)]);if($!==L)return;if(T.status==="rejected")throw T.reason;z.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",z.reason),c.model=wa({days:T.value,todayKey:p.toDay,rawPosts:z.status==="fulfilled"?z.value:[]}),c.status="ready",c.error="",c.loadedSignature=y,tt(d,c.model)}catch(D){if($!==L)return;console.error("[mnyra][dashboard] load failed",D),c.model||(c.status="error",c.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}v()}function nt(){se||!g||(se=!0,g.addEventListener("click",i=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(i.target?.closest?.("[data-dashboard-retry]")){W({force:!0});return}if(i.target?.closest?.("[data-dashboard-paywall-close]")){i.preventDefault(),te().paywall="",v();return}const d=i.target?.closest?.("[data-dashboard-metric-locked]");if(d){i.preventDefault(),te().paywall=String(d.getAttribute("data-dashboard-metric-locked")||"").trim(),v();return}const c=i.target?.closest?.("[data-dashboard-composer]");if(c){i.preventDefault(),Qe(c.getAttribute("data-dashboard-composer"));return}const p=i.target?.closest?.("[data-dashboard-panel-tab]");if(p){i.preventDefault();const y=J(p.getAttribute("data-dashboard-panel-tab"));if(y===J(e?.dashboardPanelTab))return;e.dashboardPanelTab=y,v()}}catch{}}))}function pe(i=""){const d=e?.userProfile||{},c=i?F(i)||{}:{},p=String(c.name||c.restaurantName||d.name||"").trim()||"Business";let y="";try{y=String(U()||"").trim()}catch{}if(!y)try{y=String(P(c)||"").trim()}catch{}return{name:p,logoUrl:y,kind:ee(),coverUrl:Sa(c),subscribed:$a({profile:d,restaurant:c})}}function rt(i=""){try{if(!ct()||!i)return"";ut({restaurantId:i,onBadgeFn:()=>v()});const d=ht();return Mt({enabled:!0,unseenCount:d.unseen,activeOffers:d.activeOffers||0,todayBookings:d.today,iconFn:m})}catch{return""}}function st(){Vt(g),nt();const i=V(),d=ce(i);let c="";if(!i)Je(),c=Xe()?ha():ma();else{qe(),Ye();const p=pe(i),y=J(e?.dashboardPanelTab);d.status==="idle"&&(d.status="loading",queueMicrotask(()=>{W({force:!1})}));let $="";d.model?$=da({posts:d.model.posts,iconFn:m}):d.status==="error"?$=pa({message:d.error}):$=la();const C=`
        ${rt(i)}
        ${Jt({iconFn:m})}
        ${ra({iconFn:m,showEditor:!!i})}
        ${Xt({iconFn:m,showEditor:!!i})}
        ${ea({iconFn:m,showEditor:!!i})}
        ${aa({iconFn:m,kind:p.kind,showEditor:!!i})}
      `;let D;y==="analitika"?D=`
          <div class="mnyra-dash__embed">${Ke()}</div>
          ${$}
        `:y==="opsionet"?D=`<div class="mnyra-dash__embed">${Me()}</div>`:D=C;const T=za({model:d.model,coverUrl:p.coverUrl,subscribed:p.subscribed,assets:ya}),z=String(d.paywall||"").trim();c=`
        ${Qt({name:p.name,logoUrl:p.logoUrl,iconFn:m})}
        ${sa({cards:T,iconFn:m})}
        ${Ne(`
          ${oa({activeTab:y,iconFn:m})}
          ${D}
        `)}
        ${z?ca({title:_a[z]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${c}
      </section>
    `}return Object.freeze({renderDashboardView:st,loadDashboard:W})}export{Ca as G,mt as M,Ga as a,X as b,ft as c,Na as d,Ka as e,be as f,Ia as g,vt as h,Ra as i,Pe as j,Ta as k,_t as l,Fa as m,yt as n,ja as o,Ma as r,Ea as t,Oa as v};
