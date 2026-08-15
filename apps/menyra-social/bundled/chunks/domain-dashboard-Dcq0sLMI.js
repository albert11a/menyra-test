const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-BmAxWOEe.js","chunks/domain-feed-social-eager-DcfYYARs.js","chunks/domain-auth-Bcb0uRsx.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-DyfIj5gr.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as st}from"./domain-auth-Bcb0uRsx.js";import{f as T,r as rt,l as it,s as le}from"./domain-analytics-D19jvtL7.js";import{b as ot}from"./domain-business-accounts-D8NpUhi6.js";import{i as dt,e as lt,a as ct}from"./domain-feed-social-eager-DcfYYARs.js";const ut=20,ht=8;function A(e=""){return e==null?"":String(e).trim()}function Q(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function pt(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${n}`}function mt(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],A(t.imageUrl??t.image??t.photoUrl)],n=[];return a.forEach(s=>{const o=A(s);o&&!n.includes(o)&&n.push(o)}),n.slice(0,ht)}function bt(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},n=Q(a.persons??a.guests??a.capacity),s=Q(a.size??a.sizeSqm??a.area),o=mt(a);return{id:A(a.id)||pt(Date.now()+t),title:A(a.title??a.name),description:A(a.description??a.text).slice(0,400),imageUrl:o[0]||"",images:o,price:Q(a.price??a.pricePerNight),currency:A(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:A(a.beds??a.bedsLabel).slice(0,60),size:s==null?null:Math.min(500,Math.round(s)),tag:A(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function ft(e=[]){return(Array.isArray(e)?e:[]).slice(0,ut).map((t,a)=>bt(t,{index:a}))}function gt(e={}){return ft((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function Pa(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),A(e?.beds)&&t.push({icon:"bed",label:A(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Da(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=A(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${n}`:`${n} ${a}`}const we="all",ke=Object.freeze([{key:we,label:"Krejt",icon:"sparkles"},{key:"coffee",label:"Kafe",icon:"coffee"},{key:"food",label:"Ushqim",icon:"utensils"},{key:"drinks",label:"Pije",icon:"wine"},{key:"brunch",label:"Brunch",icon:"croissant"},{key:"dessert",label:"Ëmbëlsirë",icon:"cake"}]),yt=Object.freeze(ke.map(e=>e.key)),_t=6,ja=Object.freeze([1,2,3,4,5,6]),J=Object.freeze([{key:"1-2",min:1,max:2,label:"1–2"},{key:"2-4",min:2,max:4,label:"2–4"},{key:"4-6",min:4,max:6,label:"4–6"},{key:"6+",min:6,max:99,label:"6+"}]),Fa=Object.freeze([{key:"low",label:"deri 10 €",maxPerPerson:10},{key:"mid",label:"10–20 €",maxPerPerson:20},{key:"high",label:"20–30 €",maxPerPerson:30},{key:"top",label:"30 €+",maxPerPerson:0}]),Ba=Object.freeze([{key:"now",label:"Tani",offsetMinutes:0},{key:"in30",label:"+30 min",offsetMinutes:30},{key:"in60",label:"+1 orë",offsetMinutes:60},{key:"later",label:"Më vonë",offsetMinutes:-1}]),xt="claim",ce="reservation",vt=Object.freeze([{key:"percent",label:"Zbritje %"},{key:"freeItem",label:"Produkt falas"},{key:"bundle",label:"Paket / Çmim special"},{key:"table",label:"Tavolinë"},{key:"custom",label:"Oferta ime"}]);function Se(e=""){const t=String(e||"").trim().toLowerCase();return J.find(a=>a.key===t)||null}const wt="Europe/Belgrade",$e=1440,U=["mon","tue","wed","thu","fri","sat","sun"];function ze(e){if(e==null||e==="")return 0;if(typeof e=="number")return Number.isFinite(e)?e:0;if(e instanceof Date){const n=e.getTime();return Number.isNaN(n)?0:n}if(typeof e=="object"){if(typeof e.toDate=="function")try{const n=e.toDate(),s=n instanceof Date?n.getTime():NaN;return Number.isNaN(s)?0:s}catch{return 0}return Number.isFinite(Number(e.seconds))?Math.round(Number(e.seconds)*1e3):Number.isFinite(Number(e._seconds))?Math.round(Number(e._seconds)*1e3):0}const a=new Date(String(e)).getTime();return Number.isNaN(a)?0:a}function P(e){const t=ze(e);return t?new Date(t).toISOString():""}function kt(e){const t=String(e??"").trim();if(!t)return-1;const a=t.match(/^(\d{1,2})\s*[:.：]?\s*(\d{2})?$/);if(!a)return-1;const n=Number(a[1]),s=a[2]===void 0?0:Number(a[2]);return!Number.isFinite(n)||!Number.isFinite(s)||n>24||s>59?-1:n*60+s}function ue(e){const t=Math.max(0,Math.round(Number(e)||0))%$e,a=Math.floor(t/60),n=t%60;return`${String(a).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function he(e){return typeof e=="number"?Number.isFinite(e)?Math.max(0,Math.round(e)):-1:kt(e)}function St(e,t){const a=he(e);let n=he(t);return a<0||n<0||n===a?null:(n<a&&(n+=$e),{start:a,end:n})}function $t(e=[]){const t=Array.isArray(e)?e:[],a=[];return t.forEach(n=>{if(!n||typeof n!="object")return;const s=St(n.start??n.from,n.end??n.to);s&&a.push(s)}),zt(a)}function zt(e=[]){const t=(Array.isArray(e)?e:[]).filter(n=>n&&Number.isFinite(n.start)&&Number.isFinite(n.end)&&n.end>n.start).slice().sort((n,s)=>n.start-s.start||n.end-s.end),a=[];return t.forEach(n=>{const s=a[a.length-1];if(s&&n.start<=s.end){s.end=Math.max(s.end,n.end);return}a.push({start:n.start,end:n.end})}),a}const At="active",pe="paused",me="archived",be="go",Pt="public";function f(e="",t=240){return String(e??"").trim().slice(0,t)}function B(e,t=0){const a=Math.trunc(Number(e));return!Number.isFinite(a)||a<0?t:a}function Dt(e=""){const t=String(e||"").trim().toLowerCase();return t===pe?pe:t===me?me:At}function jt(e=""){const t=String(e||"").trim().toLowerCase();return yt.includes(t)?t:we}function Ae(e=""){return String(e||"").trim().toLowerCase()===ce?ce:xt}function Ft(e={}){const t=e&&typeof e=="object"?e:{},a=String(t.kind||t.type||"").trim().toLowerCase(),n=Math.min(90,Math.max(0,B(t.percent??t.discountPercent,0))),s={kind:["percent","freeItem","bundle","table","custom"].includes(a)?a:n>0?"percent":"custom",percent:n,itemId:f(t.itemId,180),itemName:f(t.itemName||t.item,160),priceText:f(t.priceText||t.price,60),text:f(t.text,160)};return s.label=Bt(s),s}function Bt(e={}){const t=e&&typeof e=="object"?e:{},a=f(t.text,160);if(a)return a;const n=B(t.percent,0);if(t.kind==="percent"||n>0)return n>0?`–${n} %`:"";if(t.kind==="freeItem"){const s=f(t.itemName,160);return s?`${s} falas`:"Produkt falas"}if(t.kind==="bundle"){const s=f(t.itemName,160),o=f(t.priceText,60);return s&&o?`${s} ${o}`:s||o||"Paket special"}return t.kind==="table"?"Tavolinë e rezervuar":""}function Pe(e){const t=Array.isArray(e)?e:e?[e]:[],a=[];return t.forEach(n=>{const s=String(n||"").trim().toLowerCase();Se(s)&&!a.includes(s)&&a.push(s)}),a.length?a:J.map(n=>n.key)}function Rt(e=[]){const t=Pe(e);let a=Number.POSITIVE_INFINITY,n=0;return t.forEach(s=>{const o=Se(s);o&&(a=Math.min(a,o.min),n=Math.max(n,o.max))}),!Number.isFinite(a)||!n?{min:1,max:99}:{min:a,max:n}}function Ct(e={}){const t=e&&typeof e=="object"?e:{},a=String(t.mode||"").trim().toLowerCase()==="windows"?"windows":"always",n=[];(Array.isArray(t.days)?t.days:[]).forEach(c=>{const p=String(c||"").trim().toLowerCase();U.includes(p)&&!n.includes(p)&&n.push(p)});const o=$t((Array.isArray(t.windows)?t.windows:[]).map(c=>({start:c?.start??c?.from,end:c?.end??c?.to})));return a==="always"||!n.length&&!o.length?{mode:"always",days:U.slice(),windows:[]}:{mode:"windows",days:n.length?n:U.slice(),windows:o}}function Tt(e={}){const t=e&&typeof e=="object"?e:{},a=o=>{const c=f(o,10);return/^\d{4}-\d{2}-\d{2}$/.test(c)?c:""},n=a(t.startDate||t.from),s=a(t.endDate||t.to);return n&&s&&s<n?{startDate:s,endDate:n}:{startDate:n,endDate:s}}function Et(e={}){const t=e&&typeof e=="object"?e:{};return{slotGroups:B(t.slotGroups??t.maxGroupsPerSlot,0),slotGuests:B(t.slotGuests??t.maxGuestsPerSlot,0),dailyGroups:B(t.dailyGroups??t.maxGroupsPerDay,0),totalRedemptions:B(t.totalRedemptions??t.maxRedemptions,0)}}function Ot(e){const t=Array.isArray(e)?e:[],a=[];return t.forEach(n=>{const s=String(n||"").trim().toLowerCase();(s===be||s===Pt)&&!a.includes(s)&&a.push(s)}),a.length?a:[be]}function Z(e={},t=""){const a=e&&typeof e=="object"?e:{},n=Pe(a.partyRanges||a.partySizes),s=Rt(n),o=Ft(a.benefit),c=Ae(a.bookingType);return{id:f(a.id||t,180),restaurantId:f(a.restaurantId,180),locationId:f(a.locationId,180)||"main",title:f(a.title,120),description:f(a.description||a.text,400),terms:f(a.terms||a.conditions,400),benefit:o,benefitLabel:o.label,category:jt(a.category),partyRanges:n,minParty:s.min,maxParty:s.max,schedule:Ct(a.schedule),dateRange:Tt(a.dateRange),bookingType:c,limits:Et(a.limits),channels:Ot(a.channels),status:Dt(a.status),sponsored:a.sponsored===!0||a.sponsored?.active===!0,sponsoredUntil:P(a.sponsored?.until),priceLevel:Math.min(4,Math.max(0,B(a.priceLevel,0))),redeemedCount:B(a.redeemedCount,0),createdAt:P(a.createdAt),updatedAt:P(a.updatedAt)}}function Ra(e={},{serverTimestamp:t=null}={}){const a=Z(e),n={restaurantId:a.restaurantId,locationId:a.locationId,title:a.title,description:a.description,terms:a.terms,benefit:a.benefit,benefitLabel:a.benefitLabel,category:a.category,partyRanges:a.partyRanges,minParty:a.minParty,maxParty:a.maxParty,schedule:a.schedule,dateRange:a.dateRange,bookingType:a.bookingType,limits:a.limits,channels:a.channels,status:a.status,sponsored:a.sponsored,priceLevel:a.priceLevel};return t&&(n.updatedAt=t,a.createdAt||(n.createdAt=t)),n}function Ca(e={}){const t=Z(e),a=[];return t.restaurantId||a.push({field:"restaurantId",message:"Lokali mungon."}),t.benefitLabel||a.push({field:"benefit",message:"Shkruaj çka po ofron."}),t.partyRanges.length||a.push({field:"partyRanges",message:"Zgjidh sa persona."}),t.schedule.mode==="windows"&&(t.schedule.days.length||a.push({field:"schedule",message:"Zgjidh ditët."}),t.schedule.windows.length||a.push({field:"schedule",message:"Zgjidh orarin."})),t.benefit.kind==="percent"&&t.benefit.percent<=0&&a.push({field:"benefit",message:"Zbritja duhet të jetë mbi 0 %."}),{ok:a.length===0,errors:a,offer:t}}function De(e={}){const a=(e&&e.schedule?e:Z(e)).schedule;if(a.mode==="always")return"Gjithmonë";const n={mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"},s=a.days.map(c=>n[c]||c).join(", "),o=a.windows.map(c=>`${ue(c.start)}-${ue(c.end)}`).join(", ");return[s,o].filter(Boolean).join(" · ")}function je(e={}){const t=e&&e.partyRanges?e:Z(e);return`${t.maxParty>=_t?`${t.minParty}+`:`${t.minParty}–${t.maxParty}`} persona`}const y=Object.freeze({confirmed:"confirmed",checkedIn:"checked_in",completed:"completed",cancelledByUser:"cancelled_by_user",cancelledByBusiness:"cancelled_by_business",notArrived:"not_arrived",expired:"expired"});Object.freeze([y.confirmed,y.checkedIn]);Object.freeze({[y.confirmed]:[y.checkedIn,y.completed,y.cancelledByUser,y.cancelledByBusiness,y.notArrived,y.expired],[y.checkedIn]:[y.completed,y.cancelledByBusiness],[y.completed]:[],[y.cancelledByUser]:[],[y.cancelledByBusiness]:[],[y.notArrived]:[],[y.expired]:[]});function Fe(e=""){const t=String(e||"").trim().toLowerCase();return Object.values(y).includes(t)?t:y.confirmed}function Ta(e={},t=""){const a=e&&typeof e=="object"?e:{},n=a.snapshot&&typeof a.snapshot=="object"?a.snapshot:{};return{id:f(a.id||t,180),restaurantId:f(a.restaurantId||n.restaurantId,180),locationId:f(a.locationId||n.locationId,180)||"main",offerId:f(a.offerId||n.offerId,180),guestId:f(a.guestId,180),uid:f(a.uid,180),shortCode:f(a.shortCode,12).toUpperCase(),type:Ae(a.type||n.bookingType),status:Fe(a.status),partySize:Math.max(1,Math.trunc(Number(a.partySize||n.partySize)||1)),expectedArrivalAt:P(a.expectedArrivalAt||n.expectedArrivalAt),expectedArrivalMs:ze(a.expectedArrivalAt||n.expectedArrivalAt),dayKey:f(a.dayKey,10),slotKey:f(a.slotKey,240),timeZone:f(a.timeZone,60)||wt,snapshot:n,businessName:f(n.businessName,120),benefitLabel:f(n.benefitLabel,160),logoUrl:f(n.logoUrl,500),businessSeenAt:P(a.businessSeenAt),checkedInAt:P(a.checkedInAt),completedAt:P(a.completedAt),cancelledAt:P(a.cancelledAt),cancelReason:f(a.cancelReason,200),createdAt:P(a.createdAt),updatedAt:P(a.updatedAt)}}function It(e={}){const t=Fe(e?.status);return t===y.confirmed?"Po vijnë":t===y.checkedIn?"Këtu":t===y.completed?"Përfunduar":t===y.cancelledByUser?"Anuluar nga klienti":t===y.cancelledByBusiness?"Anuluar nga ju":t===y.notArrived?"Nuk erdhën":"Skaduar"}const E=Object.freeze({brand:"Mnyra GO",mark:"⚡",close:"Mbyll",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{active:"Aktiv",offers:"Ofertat",history:"Historiku",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",statGuests:"Gäste",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"+ Krijo ofertë GO",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj",cancel:"Anulo",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",benefitQuestion:"Çka po ofron?",partyQuestion:"Për sa persona?",categoryQuestion:"Kategoria",scheduleQuestion:"Kur vlen?",always:"Gjithmonë",specificHours:"Orar specifik",actionQuestion:"Kur klienti e zgjedh",onlyOffer:"Vetëm oferta",offerAndTable:"Oferta + tavolinë",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",guestName:"Mnyra Guest",table:"Tavolinë",markArrived:"Erdhën",markNotArrived:"Nuk erdhën",markDone:"Përfundo"});function i(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Be(e=""){const t=Date.parse(String(e||""));if(!Number.isFinite(t))return"";const a=new Date(t);return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Nt({enabled:e=!1,unseenCount:t=0,activeOffers:a=0,todayBookings:n=0,texts:s={}}={}){if(!e)return"";const o={...E,...s||{}},c=Math.max(0,Math.trunc(Number(t)||0)),p=a>0||n>0,m=p?`${a} oferta aktive · ${n} rezervime sot`:o.cardIdle;return`
    <button
      type="button"
      data-go-business-open="active"
      class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane"
      data-go-business-card
    >
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">${i(o.mark)} Mnyra</span> GO
        ${c>0?`<span class="ml-2 inline-flex min-w-[22px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-black text-white" aria-label="${i(`${c} ${o.statNew}`)}">${c}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${i(m)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-label">${i(p?o.cardManage:o.emptyAction)}</span>
        <span class="mnyra-dash__composer-cta-chevron">→</span>
      </span>
    </button>
  `}function L(e,t){return`
    <div class="rounded-2xl bg-slate-50 px-3 py-3 text-center">
      <p class="text-lg font-black text-slate-900">${i(t)}</p>
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${i(e)}</p>
    </div>
  `}function fe(e={},t=E){const a=e.type==="reservation",n=Be(e.expectedArrivalAt),s=e.benefitLabel||e.snapshot?.benefitLabel||"",o=`${t.guestName} · ${e.shortCode||""}`.trim();return`
    <article class="rounded-2xl border border-slate-100 p-3 ${e.businessSeenAt?"":"bg-indigo-50/40"}" data-go-booking="${i(e.id)}">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[13px] font-black text-slate-900">GO #${i(e.shortCode||"")}</p>
        <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
          ${i(It(e))}
        </span>
      </div>
      <p class="mt-1 text-[12px] font-bold text-slate-500">${i(o)}</p>
      <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-bold text-slate-600">
        <span>👥 ${i(`${e.partySize||1} ${t.guests}`)}</span>
        ${n?`<span>🕐 Rreth ${i(n)}</span>`:""}
        ${s?`<span>🎁 ${i(s)}</span>`:""}
        ${a?`<span>🪑 ${i(t.table)}</span>`:""}
      </div>
      ${e.status==="confirmed"?`
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="button" data-go-booking-action="checkin" data-go-booking-id="${i(e.id)}"
            class="rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-black text-white">${i(t.markArrived)}</button>
          <button type="button" data-go-booking-action="notArrived" data-go-booking-id="${i(e.id)}"
            class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">${i(t.markNotArrived)}</button>
        </div>
      `:""}
      ${e.status==="checked_in"?`
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${i(e.id)}"
            class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">${i(t.markDone)}</button>
        </div>
      `:""}
    </article>
  `}function Kt({offer:e={},businessName:t="",texts:a={}}={}){const n={...E,...a||{}};return`
    <div class="rounded-[1.75rem] border border-slate-200 bg-white p-4" data-go-offer-preview>
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">${i(n.preview)}</p>
      <p class="mt-2 text-[13px] font-black text-slate-900">
        ${i(t)} <span class="font-semibold text-slate-400">${i(n.offering)}</span>
      </p>
      <p class="mt-2 text-2xl font-black tracking-tight text-slate-900">${i(e.benefitLabel||"")}</p>
      <p class="text-[13px] font-semibold text-slate-500">${i(n.forGroup)}</p>
      <p class="mt-2 text-[12px] font-bold text-slate-500">${i(je(e))}</p>
      <p class="text-[12px] font-bold text-slate-500">${i(De(e))}</p>
      <span class="mt-3 inline-flex rounded-2xl bg-slate-900 px-4 py-2.5 text-[12px] font-black text-white">
        ${i(n.accept)}
      </span>
    </div>
  `}function F(e,{active:t=!1,attr:a="",value:n=""}={}){return`
    <button type="button" ${a?`${a}="${i(n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-black ${t?"bg-slate-900 text-white":"bg-slate-100 text-slate-600"}">
      ${i(e)}
    </button>
  `}function Mt({draft:e={},businessName:t="",errors:a=[],texts:n={}}={}){const s={...E,...n||{}},o=Array.isArray(e.partyRanges)?e.partyRanges:[],c=Array.isArray(e.schedule?.days)?e.schedule.days:[],p=e.schedule?.mode==="windows"?"windows":"always",m={mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"},b=u=>(a||[]).find(x=>x.field===u)?.message||"";return`
    <div data-go-offer-editor>
      <h3 class="text-sm font-black text-slate-900">${i(s.benefitQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${vt.map(u=>F(u.label,{active:(e.benefit?.kind||"percent")===u.key,attr:"data-go-benefit-kind",value:u.key})).join("")}
      </div>
      <div class="mt-3 grid gap-2">
        ${(e.benefit?.kind||"percent")==="percent"?`
          <input type="number" min="1" max="90" data-go-benefit-percent value="${i(e.benefit?.percent||10)}"
            class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
        `:`
          <input type="text" data-go-benefit-item placeholder="Cookie, Cappuccino..." value="${i(e.benefit?.itemName||"")}"
            class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          <input type="text" data-go-benefit-price placeholder="2,50 €" value="${i(e.benefit?.priceText||"")}"
            class="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
        `}
        <input type="text" data-go-benefit-text placeholder="${i(s.benefitQuestion)}" value="${i(e.benefit?.text||"")}"
          class="w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
      </div>
      ${b("benefit")?`<p class="mt-1 text-[12px] font-bold text-rose-600">${i(b("benefit"))}</p>`:""}

      <h3 class="mt-6 text-sm font-black text-slate-900">${i(s.partyQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${J.map(u=>F(u.label,{active:o.includes(u.key),attr:"data-go-offer-party",value:u.key})).join("")}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${i(s.categoryQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${ke.map(u=>F(u.label,{active:(e.category||"all")===u.key,attr:"data-go-offer-category",value:u.key})).join("")}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${i(s.scheduleQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${F(s.always,{active:p==="always",attr:"data-go-offer-schedule",value:"always"})}
        ${F(s.specificHours,{active:p==="windows",attr:"data-go-offer-schedule",value:"windows"})}
      </div>
      ${p==="windows"?`
        <div class="mt-3 flex flex-wrap gap-2">
          ${U.map(u=>F(m[u],{active:c.includes(u),attr:"data-go-offer-day",value:u})).join("")}
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <input type="time" data-go-offer-from value="${i(e.windowFrom||"14:00")}"
            class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          <input type="time" data-go-offer-to value="${i(e.windowTo||"18:00")}"
            class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
        </div>
      `:""}
      ${b("schedule")?`<p class="mt-1 text-[12px] font-bold text-rose-600">${i(b("schedule"))}</p>`:""}

      <div class="mt-3 grid grid-cols-2 gap-2">
        <input type="date" data-go-offer-start value="${i(e.dateRange?.startDate||"")}"
          class="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
        <input type="date" data-go-offer-end value="${i(e.dateRange?.endDate||"")}"
          class="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${i(s.actionQuestion)}</h3>
      <div class="mt-2 flex flex-wrap gap-2">
        ${F(s.onlyOffer,{active:e.bookingType!=="reservation",attr:"data-go-offer-type",value:"claim"})}
        ${F(s.offerAndTable,{active:e.bookingType==="reservation",attr:"data-go-offer-type",value:"reservation"})}
      </div>

      <h3 class="mt-6 text-sm font-black text-slate-900">${i(s.limitsTitle)}</h3>
      <p class="text-[11px] font-bold text-slate-400">${i(s.noLimit)}</p>
      <div class="mt-2 grid grid-cols-2 gap-2">
        ${["slotGroups","slotGuests","dailyGroups","totalRedemptions"].map(u=>`
          <label class="block">
            <span class="text-[11px] font-black text-slate-500">${i(s[u])}</span>
            <input type="number" min="0" data-go-offer-limit="${u}" value="${i(e.limits?.[u]??0)}"
              class="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          </label>
        `).join("")}
      </div>

      <div class="mt-6">
        ${Kt({offer:e,businessName:t,texts:s})}
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <button type="button" data-go-offer-save class="rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white">
          ${i(e.id?s.save:s.activate)}
        </button>
        <button type="button" data-go-offer-cancel class="rounded-2xl bg-slate-100 px-4 py-3.5 text-sm font-black text-slate-600">
          ${i(s.cancel)}
        </button>
      </div>
    </div>
  `}function Gt(e={},t=E){const a=e.status==="paused"?t.paused:e.status==="archived"?t.archived:"";return`
    <article class="rounded-2xl border border-slate-100 p-3" data-go-offer="${i(e.id)}">
      <div class="flex items-center justify-between gap-2">
        <p class="text-[15px] font-black text-slate-900">${i(e.benefitLabel||"")}</p>
        ${a?`<span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">${i(a)}</span>`:""}
      </div>
      <p class="mt-1 text-[12px] font-bold text-slate-500">
        ${i(je(e))} · ${i(De(e))}
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" data-go-offer-edit="${i(e.id)}" class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">
          ${i(t.save)}
        </button>
        <button type="button" data-go-offer-toggle="${i(e.id)}" class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">
          ${i(e.status==="active"?t.paused:t.activate)}
        </button>
        <button type="button" data-go-offer-archive="${i(e.id)}" class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-400">
          ${i(t.archive)}
        </button>
      </div>
    </article>
  `}function Ea(e={}){if(!e||!e.open)return"";const t={...E,...e.texts||{}},a=String(e.tab||"active"),n=e.summary||{},s=Array.isArray(e.bookings)?e.bookings:[],o=Array.isArray(e.offers)?e.offers:[];let c="";if(e.editor)c=Mt({draft:e.editor,businessName:e.businessName,errors:e.editorErrors,texts:t});else if(a==="offers")c=`
      <button type="button" data-go-offer-new class="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white">
        ${i(t.createOffer)}
      </button>
      <div class="mt-3 space-y-3">
        ${o.filter(m=>m.status!=="archived").map(m=>Gt(m,t)).join("")}
      </div>
    `;else if(a==="history"){const m=s.filter(b=>!["confirmed","checked_in"].includes(b.status));c=m.length?`<div class="space-y-3">${m.map(b=>fe(b,t)).join("")}</div>`:`<p class="py-8 text-center text-sm font-black text-slate-400">${i(t.noHistory)}</p>`}else if(a==="options"){const m=Be(e.settings?.pausedUntil);c=`
      <div class="rounded-2xl border border-slate-100 p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-black text-slate-900">${i(t.goOn)}</p>
          <span class="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${e.paused?"bg-amber-100 text-amber-700":"bg-emerald-100 text-emerald-700"}">
            ${i(e.paused?`${t.pausedUntil} ${m}`:"ON")}
          </span>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          ${e.paused?`<button type="button" data-go-pause="0" class="rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-black text-white">${i(t.resume)}</button>`:[{minutes:30,label:"30 min"},{minutes:60,label:"1 orë"},{minutes:0,label:"Deri nesër",untilTomorrow:!0},{minutes:-1,label:"Pa afat"}].map(b=>`
              <button type="button" data-go-pause="${b.untilTomorrow?"tomorrow":b.minutes}"
                class="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-black text-slate-600">${i(b.label)}</button>
            `).join("")}
        </div>
        <p class="mt-3 text-[11px] font-bold text-slate-400">
          Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.
        </p>
      </div>
    `}else{const m=s.filter(b=>["confirmed","checked_in"].includes(b.status));c=m.length?`<div class="space-y-3">${m.map(b=>fe(b,t)).join("")}</div>`:`<p class="py-8 text-center text-sm font-black text-slate-400">${i(t.noBookings)}</p>`}const p=[["active",t.tabs.active],["offers",t.tabs.offers],["history",t.tabs.history],["options",t.tabs.options]];return`
    <div class="fixed inset-0 z-[75]" data-go-business-panel role="dialog" aria-modal="true" aria-label="${i(t.brand)}">
      <div class="absolute inset-0 bg-slate-900/50" data-go-business-close></div>
      <div class="absolute inset-x-0 bottom-0 top-8 overflow-y-auto rounded-t-[2.5rem] bg-white px-5 pb-10 pt-4 md:inset-8 md:m-auto md:max-w-lg md:rounded-[2.5rem]">
        <div class="mb-4 flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 text-sm font-black text-slate-900">
            <span aria-hidden="true">${i(t.mark)}</span>${i(t.brand)}
          </span>
          <button type="button" data-go-business-close class="min-h-[44px] px-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            ${i(t.close)}
          </button>
        </div>

        <div class="grid grid-cols-4 gap-2">
          ${L(t.statNew,n.unseen||0)}
          ${L(t.statActive,n.open||0)}
          ${L(t.statToday,n.today||0)}
          ${L(t.guests,n.guests||0)}
        </div>

        <div class="mt-4 flex gap-2 overflow-x-auto" role="tablist">
          ${p.map(([m,b])=>`
            <button type="button" role="tab" aria-selected="${a===m?"true":"false"}" data-go-business-tab="${m}"
              class="min-h-[44px] whitespace-nowrap rounded-2xl px-4 py-2.5 text-[12px] font-black ${a===m?"bg-slate-900 text-white":"bg-slate-100 text-slate-600"}">
              ${i(b)}
            </button>
          `).join("")}
        </div>

        ${e.error?`<p class="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700">${i(e.error)}</p>`:""}

        <div class="mt-4">
          ${e.loading?'<p class="py-8 text-center text-sm font-black text-slate-400">...</p>':c}
        </div>
      </div>
    </div>
  `}const ge="mnyraDashboardStyles",Lt=`
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
`;function Ut(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(ge)))try{const t=e.createElement("style");t.id=ge,t.textContent=Lt,e.head?.appendChild(t)}catch{}}function _(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function k(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const Ht=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Zt({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return Ht.includes(a)?"hotel":"restaurant"}function Vt(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function Wt({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:n}={}){const s=Vt(a),o=_(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${t?`<img src="${_(t)}" alt="${o}" title="${o}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${o}">${k(n,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${_(s.text)}</p>
    </div>
  `}function qt({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${k(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${k(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Yt({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${k(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${k(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function Qt({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${k(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${k(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const ye=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function Jt(e="restaurant"){const t=String(e||"").trim().toLowerCase();return ye[t]||ye.restaurant}function Xt({iconFn:e,kind:t="restaurant",showEditor:a=!0}={}){if(!a)return"";const n=Jt(t);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${_(n.accent)}</span> ${_(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${_(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${k(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${_(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${k(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const ea="/waiter?from=panel";function ta({iconFn:e,showEditor:t=!0}={}){return t?`
    <a href="${ea}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${k(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${k(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function aa({cards:e=[],iconFn:t}={}){const a=(Array.isArray(e)?e:[]).filter(s=>s&&s.key);if(!a.length)return"";const n=a.map((s,o)=>{const c=_(s.label||"");if(s.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const p=o<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let m="";s.imageUrl?m=`<img class="mnyra-dash__hl-media" src="${_(s.imageUrl)}" alt="" ${p} decoding="async" onerror="this.style.display='none'" />`:s.videoUrl&&(m=`<video class="mnyra-dash__hl-media" src="${_(s.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const b=`
      <span class="mnyra-dash__hl-plate">${k(t,s.iconName||"image","w-6 h-6")}</span>
      ${m}
    `,u=s.withEye?`<span class="mnyra-dash__hl-eye">${k(t,"eye","w-4 h-4")}</span>`:"";let x;s.locked?x=`<span class="mnyra-dash__hl-lock">${k(t,"lock","w-3 h-3")}Me pagesë</span>`:s.loading?x='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':s.emptyText?x=`<span class="mnyra-dash__hl-empty">${_(s.emptyText)}</span>`:x=`<span class="mnyra-dash__hl-value">${u}${_(s.value||"0")}</span>`;let $;s.locked?$=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${_(s.key)}"`:s.composer?$=`class="mnyra-dash__hl-card" data-dashboard-composer="${_(s.composer)}"`:$=`class="mnyra-dash__hl-card"${s.panelTab?` data-dashboard-panel-tab="${_(s.panelTab)}"`:""}`;const V=s.locked?`${c} – me pagesë`:`${c} ${s.emptyText||s.value||""}`.trim();return`
      <button type="button" ${$} data-dashboard-metric="${_(s.key)}" aria-label="${_(V)}">
        ${b}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${c}</span>
          ${x}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-dash__hl" data-dashboard-metrics="${_(na(a))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function na(e=[]){return(Array.isArray(e)?e:[]).filter(t=>t&&t.key).map(t=>[t.key,t.label||"",t.value||"",t.emptyText||"",t.imageUrl||"",t.videoUrl||"",t.iconName||"",t.panelTab||"",t.composer||"",t.pending?"p":"",t.loading?"l":"",t.locked?"x":"",t.withEye?"e":""].join("~")).join("|")}const Re=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function H(e=""){const t=String(e||"").trim().toLowerCase();return Re.some(a=>a.id===t)?t:"funksionet"}function sa({activeTab:e="funksionet",iconFn:t}={}){const a=H(e);return`<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${Re.map(s=>{const o=s.id===a;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${_(s.id)}"
        aria-selected="${o?"true":"false"}"
        class="mnyra-dash__tab"
      >${k(t,s.iconName,"w-4 h-4")}<span class="mnyra-dash__tab-label">${_(s.label)}</span></button>
    `}).join("")}</div>`}function Ce(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function ra({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let n="";return a.length?(n=a.map(s=>{const o=[s.dateLabel,`${T(s.likesCount||0)} Likes`,`${T(s.commentsCount||0)} Kommentare`];return Number(s.impressions||0)>0&&o.push(`${T(s.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${s.thumbUrl?`<img src="${_(s.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:k(t,s.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${_(s.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${_(o.filter(Boolean).join(" · "))}</p>
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
  `}function ia(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function oa({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${_(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function da(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function la(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),t=Array.from({length:4},(a,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    ${da()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${Ce(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>').join("")}
      </div>
      ${t}
    `)}
  `}function ca({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${_(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function ua(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const ha="menyra_social_dashboard_cache_v1::",_e="menyra_social_composer_products_v1::",xe=2500,ve=1200,pa=6,ma=3,ba=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),fa=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function z(e){const t=Number(e);return Number.isFinite(t)?t:0}function ga(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const n=a.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function ya(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",s=String(a.thumbUrl||(n==="image"?a.url:"")||t.thumbUrl||"").trim(),o=n==="video"?String(a.url||t.mediaUrl||"").trim():"",c=ga(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:s,videoUrl:o,likesCount:z(t.likesCount),commentsCount:z(t.commentsCount),impressions:0,dateLabel:c?c.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:c?c.getTime():0}}function _a({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const n=Array.isArray(e)?e:[],s=le(n),o=n.find(u=>String(u?.date||u?.id||"").trim()===String(t||"").trim()),c=le(o?[o]:[]),p=s.merged?.posts&&typeof s.merged.posts=="object"?s.merged.posts:{},m=(Array.isArray(a)?a:[]).map(u=>ya(u?.id,u?.data||{})).filter(u=>u.id).map(u=>({...u,impressions:z(p[u.id]?.impressions)})),b=m.slice().sort((u,x)=>x.createdAtMs-u.createdAtMs).slice(0,ma);return{day:String(t||"").trim(),week:s.summary,today:c.summary,posts:b,latestPost:xa(m)}}function xa(e=[]){const t=(Array.isArray(e)?e:[]).filter(a=>a&&a.id);return t.length?t.slice().sort((a,n)=>z(n.createdAtMs)-z(a.createdAtMs)||z(n.impressions)-z(a.impressions)||z(n.likesCount)-z(a.likesCount))[0]:null}function va({profile:e={},restaurant:t={}}={}){return ot({profile:e,restaurant:t,feature:"qr"})}function wa(e={}){const t=e&&typeof e=="object"?e:{};return String(t.titleImageUrl||t.coverImageUrl||t.coverUrl||t.heroUrl||t.bannerUrl||"").trim()}function ka({model:e=null,coverUrl:t="",subscribed:a=!1,assets:n={}}={}){const s=e?.today||{},o=!e,c=e?.latestPost||null,p=[];if(o)p.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!c)p.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const m=String(c.thumbUrl||"").trim();p.push({key:"latestPost",label:"Postimi fundit",value:T(z(c.impressions)),withEye:!0,imageUrl:m,videoUrl:m?"":String(c.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return p.push({key:"profileViews",label:"Vizitor n'profil",value:T(z(s.profileViews)),withEye:!0,loading:o,imageUrl:String(t||"").trim(),iconName:"user",panelTab:"analitika"}),p.push({key:"menuOpens",label:"Vizitor n'meny",value:T(z(s.menuOpens)),withEye:!0,loading:o&&a,locked:!a,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),p.push({key:"qrScans",label:"Skanime n'tavolina",value:T(z(s.qrScans)),withEye:!0,loading:o&&a,locked:!a,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),p}function Oa({state:e,renderFn:t,documentObj:a,firestoreApi:n={},profileApi:s={},composerApi:o={},viewApi:c={},iconFn:p,storageObj:m}={}){const b=a||(typeof document>"u"?null:document),u=b?.defaultView||(typeof window>"u"?null:window),x=typeof t=="function"?t:()=>{},$=m||(typeof localStorage>"u"?null:localStorage),V=typeof s.getBusinessProfileTypeFn=="function"?s.getBusinessProfileTypeFn:(()=>""),Te=typeof s.isShopCatalogProfileFn=="function"?s.isShopCatalogProfileFn:(()=>!1),W=typeof s.getRestaurantMetaByIdFn=="function"?s.getRestaurantMetaByIdFn:(()=>null),Ee=typeof s.resolveRestaurantLogoFn=="function"?s.resolveRestaurantLogoFn:(()=>""),Oe=typeof s.resolveOwnAvatarUrlFn=="function"?s.resolveOwnAvatarUrlFn:(()=>""),Ie=typeof c.renderAnalyticsViewFn=="function"?c.renderAnalyticsViewFn:(()=>""),Ne=typeof c.renderSettingsViewFn=="function"?c.renderSettingsViewFn:(()=>""),Ke=typeof c.warmAnalyticsFn=="function"?c.warmAnalyticsFn:(()=>{});let X=!1,O=0,ee=!1,R=null,I=null,N="",te=!1,ae=()=>null;const Me=300;function q(){const r=e?.userProfile||{};return Zt({businessType:V(r),isShopCatalog:Te(r)})}function Ge(r=""){const d=W(r)||{};return gt(d).map(l=>({id:l.id,name:l.title,price:l.price??"",category:l.beds||l.tag||"",type:"room",imageUrl:l.imageUrl||""}))}function Le(r=""){if(!$)return null;try{const d=$.getItem(`${_e}${r}`);if(!d)return null;const l=JSON.parse(d),h=Array.isArray(l?.items)?l.items:null;return h&&h.length?h:null}catch{return null}}function Ue(r="",d=[]){if($)try{$.setItem(`${_e}${r}`,JSON.stringify({savedAt:Date.now(),items:d}))}catch{}}async function He(r=""){const{db:d,collectionFn:l,queryFn:h,limitFn:g,getDocsFn:v}=n;if(!d||typeof l!="function"||typeof v!="function")throw new Error("Produktet nuk u ngarkuan.");const D=l(d,"restaurants",r,"menuItems"),S=typeof h=="function"&&typeof g=="function"?h(D,g(Me)):D,j=await v(S),w=[];return j.forEach(C=>{const G=ae(C?.id,C?.data?.()||{});G&&w.push(G)}),w.sort((C,G)=>C.name.localeCompare(G.name,"sq")),w}async function Ze(r="",d){const l=String(r||"").trim();if(!l)throw new Error("Produktet nuk u ngarkuan.");if(q()==="hotel")return Ge(l);const h=He(l).then(v=>(Ue(l,v),v)),g=Le(l);return g?(typeof d=="function"?h.then(v=>d(v)).catch(()=>{}):h.catch(()=>{}),g):h}function ne(){return R?Promise.resolve(R):(I||(I=st(()=>import("./business-composer-controller-BmAxWOEe.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(r=>(ae=typeof r?.normalizeComposerProductCore=="function"?r.normalizeComposerProductCore:(()=>null),R=r.createBusinessComposerController({documentObj:b,windowObj:b?.defaultView||null,api:{getRestaurantIdFn:()=>K(),getBusinessMetaFn:()=>{const d=K();if(!d)return{name:"",logoUrl:"",city:""};const l=de(d),h=W(d)||{};return{name:l.name,logoUrl:l.logoUrl,city:String(h.city||"").trim()}},loadProductsFn:(d,l)=>Ze(d,l),getBusinessKindFn:()=>q(),uploadImageFn:o.uploadImageFn,uploadVideoFn:o.uploadVideoFn,captureVideoPosterFn:o.captureVideoPosterFn,createPostFn:o.createPostFn,createStoryFn:o.createStoryFn,formatPriceFn:o.formatPriceFn,getOptimizedImageUrlFn:o.getOptimizedImageUrlFn,escapeHtmlFn:o.escapeHtmlFn,iconFn:typeof p=="function"?p:void 0,afterPublishFn:async d=>{try{await M({force:!0})}catch{}typeof o.afterPublishFn=="function"&&await o.afterPublishFn(d)}}}),R)).catch(r=>{throw I=null,console.error("[mnyra][dashboard] composer load failed",r),r})),I)}function se(){const r=u?.navigator?.connection;return!r||typeof r!="object"?!1:r.saveData===!0?!0:/(^|-)2g$/.test(String(r.effectiveType||"").trim().toLowerCase())}function Ve(){if(te||R||!u||se())return;te=!0;const r=()=>{if(ne().catch(()=>{}),typeof o.prewarmFn=="function")try{o.prewarmFn()}catch{}};if(typeof u.requestIdleCallback=="function"){u.requestIdleCallback(r,{timeout:xe});return}u.setTimeout?.(r,ve)}function We(){if(X||!u||se())return;X=!0;const r=()=>{try{Ke()}catch{}};if(typeof u.requestIdleCallback=="function"){u.requestIdleCallback(r,{timeout:xe});return}u.setTimeout?.(r,ve)}function qe(r="post"){const d=String(r||"").trim().toLowerCase(),l=d==="story"||d==="profile"?d:"post";if(typeof o.prewarmFn=="function")try{o.prewarmFn()}catch{}if(R){R.open(l);return}N=l,ne().then(h=>{const g=N||l;N="",h?.open?.(g)}).catch(()=>{N=""})}function Y(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function re(r=""){const d=Y(),l=String(r||"").trim();return String(d.restaurantId||"")===l||(d.restaurantId=l,d.model=null,d.status="idle",d.error="",d.loadedSignature="",d.paywall="",O+=1),d}function K(){const r=e?.userProfile||{};return String(r.restaurantId||r.staffRestaurantId||"").trim()}let ie="";function Ye(){const r=String(e?.user?.uid||"").trim();!r||ie===r||typeof s.ensureBusinessProfileFn=="function"&&(ie=r,Promise.resolve().then(()=>s.ensureBusinessProfileFn()).catch(d=>{console.warn("[mnyra][panel] business profile could not be resolved",d)}).finally(()=>{String(e?.user?.uid||"").trim()===r&&x()}))}function Qe(){const r=String(e?.user?.uid||"").trim();if(!r)return!1;const d=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||d===r}function oe(r=""){return`${ha}${r}`}function Je(r="",d=""){if(!$||!r)return null;try{const l=$.getItem(oe(r));if(!l)return null;const h=JSON.parse(l);return!h||typeof h!="object"||String(h.day||"").trim()!==String(d||"").trim()||!h.model||typeof h.model!="object"?null:h.model}catch{return null}}function Xe(r="",d=null){if(!(!$||!r||!d))try{$.setItem(oe(r),JSON.stringify({day:d.day,model:d}))}catch{}}async function et(r=""){const{db:d,collectionFn:l,queryFn:h,orderByFn:g,limitFn:v,getDocsFn:D}=n;if(!d||typeof l!="function"||typeof h!="function"||typeof g!="function"||typeof v!="function"||typeof D!="function")return[];const S=l(d,"restaurants",r,"socialPosts");return(await D(h(S,g("createdAt","desc"),v(pa)))).docs.map(w=>({id:w.id,data:w.data()||{}})).filter(w=>{const C=String(w.data.status||"active").trim().toLowerCase();return C!=="deleted"&&C!=="hidden"})}async function M({force:r=!1}={}){const d=K(),l=re(d);if(!d)return;const h=rt({rangeKey:"7d"});if(!h)return;const g=`${d}::${h.toDay}`;if(!r&&l.loadedSignature===g&&l.status==="ready")return;if(!l.model){const S=Je(d,h.toDay);S&&(l.model=S,l.status="ready",x())}O+=1;const v=O;l.model||(l.status="loading",l.error="",x());try{const S={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:d},[j,w]=await Promise.allSettled([it({...S,fromDay:h.fromDay,toDay:h.toDay}),et(d)]);if(v!==O)return;if(j.status==="rejected")throw j.reason;w.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",w.reason),l.model=_a({days:j.value,todayKey:h.toDay,rawPosts:w.status==="fulfilled"?w.value:[]}),l.status="ready",l.error="",l.loadedSignature=g,Xe(d,l.model)}catch(S){if(v!==O)return;console.error("[mnyra][dashboard] load failed",S),l.model||(l.status="error",l.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}x()}function tt(){ee||!b||(ee=!0,b.addEventListener("click",r=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(r.target?.closest?.("[data-dashboard-retry]")){M({force:!0});return}if(r.target?.closest?.("[data-dashboard-paywall-close]")){r.preventDefault(),Y().paywall="",x();return}const d=r.target?.closest?.("[data-dashboard-metric-locked]");if(d){r.preventDefault(),Y().paywall=String(d.getAttribute("data-dashboard-metric-locked")||"").trim(),x();return}const l=r.target?.closest?.("[data-dashboard-composer]");if(l){r.preventDefault(),qe(l.getAttribute("data-dashboard-composer"));return}const h=r.target?.closest?.("[data-dashboard-panel-tab]");if(h){r.preventDefault();const g=H(h.getAttribute("data-dashboard-panel-tab"));if(g===H(e?.dashboardPanelTab))return;e.dashboardPanelTab=g,x()}}catch{}}))}function de(r=""){const d=e?.userProfile||{},l=r?W(r)||{}:{},h=String(l.name||l.restaurantName||d.name||"").trim()||"Business";let g="";try{g=String(Oe()||"").trim()}catch{}if(!g)try{g=String(Ee(l)||"").trim()}catch{}return{name:h,logoUrl:g,kind:q(),coverUrl:wa(l),subscribed:va({profile:d,restaurant:l})}}function at(r="",d=""){try{if(!dt()||!r)return"";lt({restaurantId:r,businessName:d,documentObj:b,onBadgeFn:()=>x()});const l=ct();return Nt({enabled:!0,unseenCount:l.unseen,activeOffers:l.activeOffers||0,todayBookings:l.today})}catch{return""}}function nt(){Ut(b),tt();const r=K(),d=re(r);let l="";if(!r)Ye(),l=Qe()?la():ua();else{Ve(),We();const h=de(r),g=H(e?.dashboardPanelTab);d.status==="idle"&&(d.status="loading",queueMicrotask(()=>{M({force:!1})}));let v="";d.model?v=ra({posts:d.model.posts,iconFn:p}):d.status==="error"?v=ca({message:d.error}):v=ia();const D=`
        ${at(r,h.name)}
        ${qt({iconFn:p})}
        ${ta({iconFn:p,showEditor:!!r})}
        ${Yt({iconFn:p,showEditor:!!r})}
        ${Qt({iconFn:p,showEditor:!!r})}
        ${Xt({iconFn:p,kind:h.kind,showEditor:!!r})}
      `;let S;g==="analitika"?S=`
          <div class="mnyra-dash__embed">${Ie()}</div>
          ${v}
        `:g==="opsionet"?S=`<div class="mnyra-dash__embed">${Ne()}</div>`:S=D;const j=ka({model:d.model,coverUrl:h.coverUrl,subscribed:h.subscribed,assets:ba}),w=String(d.paywall||"").trim();l=`
        ${Wt({name:h.name,logoUrl:h.logoUrl,iconFn:p})}
        ${aa({cards:j,iconFn:p})}
        ${Ce(`
          ${sa({activeTab:g,iconFn:p})}
          ${S}
        `)}
        ${w?oa({title:fa[w]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${l}
      </section>
    `}return Object.freeze({renderDashboardView:nt,loadDashboard:M})}export{ja as G,ht as M,Oa as a,ke as b,pt as c,Ba as d,Fa as e,Ta as f,Z as g,gt as h,Pa as i,Da as j,ft as n,Ea as r,Ra as t,Ca as v};
