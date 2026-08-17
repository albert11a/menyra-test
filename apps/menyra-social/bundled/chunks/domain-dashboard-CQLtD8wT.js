const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-BQMwhmIr.js","chunks/domain-feed-social-eager-Edt6W6jZ.js","chunks/domain-auth-B1kS5TG-.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-BlG5au9A.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as lt}from"./domain-auth-B1kS5TG-.js";import{f as L,r as ct,l as ut,s as ye}from"./domain-analytics-oyJYW1vv.js";import{b as ht}from"./domain-business-accounts-D8NpUhi6.js";import{i as pt,e as mt,a as ft}from"./domain-feed-social-eager-Edt6W6jZ.js";const bt=20,gt=8;function F(e=""){return e==null?"":String(e).trim()}function re(e){if(e==null||e==="")return null;const a=Number(String(e).replace(",","."));return Number.isFinite(a)&&a>0?a:null}function yt(e=Date.now(),a=Math.random()){const t=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(a)||0))*36**6).toString(36).padStart(6,"0");return`room_${t}_${n}`}function _t(e={}){const a=e&&typeof e=="object"?e:{},t=[...Array.isArray(a.images)?a.images:[],F(a.imageUrl??a.image??a.photoUrl)],n=[];return t.forEach(r=>{const s=F(r);s&&!n.includes(s)&&n.push(s)}),n.slice(0,gt)}function xt(e={},{index:a=0}={}){const t=e&&typeof e=="object"?e:{},n=re(t.persons??t.guests??t.capacity),r=re(t.size??t.sizeSqm??t.area),s=_t(t);return{id:F(t.id)||yt(Date.now()+a),title:F(t.title??t.name),description:F(t.description??t.text).slice(0,400),imageUrl:s[0]||"",images:s,price:re(t.price??t.pricePerNight),currency:F(t.currency??t.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:F(t.beds??t.bedsLabel).slice(0,60),size:r==null?null:Math.min(500,Math.round(r)),tag:F(t.tag??t.badge).slice(0,40),active:t.active!==!1}}function wt(e=[]){return(Array.isArray(e)?e:[]).slice(0,bt).map((a,t)=>xt(a,{index:t}))}function vt(e={}){return wt((e&&typeof e=="object"?e:{}).hotelRooms).filter(t=>t.title)}function La(e={}){const a=[];return Number.isFinite(e?.persons)&&e.persons>0&&a.push({icon:"users",label:`${e.persons} persona`}),F(e?.beds)&&a.push({icon:"bed",label:F(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&a.push({icon:"size",label:`${e.size} m²`}),a}function Ua(e={}){const a=Number(e?.price);if(!Number.isFinite(a)||a<=0)return"";const t=F(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(a)?String(a):a.toFixed(2);return t==="EUR"?`€${n}`:`${n} ${t}`}const je="all",Fe=Object.freeze([{key:je,label:"Krejt",icon:"sparkles"},{key:"coffee",label:"Kafe",icon:"coffee"},{key:"drinks",label:"Pije",icon:"cup-soda"},{key:"food",label:"Ushqim",icon:"utensils"},{key:"dessert",label:"Ëmbëlsira",icon:"cake-slice"}]),kt=Object.freeze(Fe.map(e=>e.key)),$t="food",St="drinks",zt="unsure",At=Object.freeze([Object.freeze({key:$t,label:"Ushqim",hint:"Mëngjes, drekë, darkë etj.",icon:"utensils",categories:Object.freeze(["food"])}),Object.freeze({key:St,label:"Pije",hint:"Kafe, ëmbëlsira, lëngje etj.",icon:"cup-soda",categories:Object.freeze(["coffee","drinks","dessert"])}),Object.freeze({key:zt,label:"Nuk e di",hint:"Gjitha ofertat për rreth teje.",icon:"sparkles",categories:Object.freeze([])})]);Object.freeze(At.map(e=>e.key));const Ha=1,Dt=10,Za=2,ie=Object.freeze([{key:"1-2",min:1,max:2,label:"1–2"},{key:"2-4",min:2,max:4,label:"2–4"},{key:"4-6",min:4,max:6,label:"4–6"},{key:"6+",min:6,max:99,label:"6+"}]),Wa=Object.freeze([{key:"now",label:"Tani",offsetMinutes:0},{key:"in30",label:"+30 min",offsetMinutes:30},{key:"in60",label:"+1 orë",offsetMinutes:60},{key:"later",label:"Më vonë",offsetMinutes:-1}]),Pt="claim",_e="reservation",Bt=Object.freeze([{key:"percent",label:"Zbritje %"},{key:"freeItem",label:"Produkt falas"},{key:"bundle",label:"Paket / Çmim special"},{key:"table",label:"Tavolinë"},{key:"custom",label:"Oferta ime"}]),Va=7;function Re(e=""){const a=String(e||"").trim().toLowerCase();return ie.find(t=>t.key===a)||null}const U="Europe/Belgrade",Te=1440,X=["mon","tue","wed","thu","fri","sat","sun"],xe=new Map;function Oe(e){const a=String(e||"").trim()||U,t=xe.get(a);if(t)return t;let n=null;try{n=new Intl.DateTimeFormat("en-GB",{timeZone:a,hour12:!1,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",weekday:"short"})}catch{n=Oe(U)}return xe.set(a,n),n}const jt={mon:"mon",tue:"tue",wed:"wed",thu:"thu",fri:"fri",sat:"sat",sun:"sun"};function oe(e){if(e==null||e==="")return 0;if(typeof e=="number")return Number.isFinite(e)?e:0;if(e instanceof Date){const n=e.getTime();return Number.isNaN(n)?0:n}if(typeof e=="object"){if(typeof e.toDate=="function")try{const n=e.toDate(),r=n instanceof Date?n.getTime():NaN;return Number.isNaN(r)?0:r}catch{return 0}return Number.isFinite(Number(e.seconds))?Math.round(Number(e.seconds)*1e3):Number.isFinite(Number(e._seconds))?Math.round(Number(e._seconds)*1e3):0}const t=new Date(String(e)).getTime();return Number.isNaN(t)?0:t}function j(e){const a=oe(e);return a?new Date(a).toISOString():""}function Ft(e,a=U){const t=oe(e)||Date.now(),n=Oe(a).formatToParts(new Date(t)),r=f=>{const v=n.find($=>$.type===f);return v?v.value:""},s=r("year"),u=r("month"),h=r("day"),w=r("hour")==="24"?"00":r("hour"),k=r("minute"),p=String(r("weekday")||"").slice(0,3).toLowerCase();return{ms:t,dayKey:s&&u&&h?`${s}-${u}-${h}`:"",weekday:jt[p]||"",minutes:(Number(w)||0)*60+(Number(k)||0),timeZone:String(a||"").trim()||U}}function Rt(e){const a=String(e??"").trim();if(!a)return-1;const t=a.match(/^(\d{1,2})\s*[:.：]?\s*(\d{2})?$/);if(!t)return-1;const n=Number(t[1]),r=t[2]===void 0?0:Number(t[2]);return!Number.isFinite(n)||!Number.isFinite(r)||n>24||r>59?-1:n*60+r}function we(e){const a=Math.max(0,Math.round(Number(e)||0))%Te,t=Math.floor(a/60),n=a%60;return`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function ve(e){return typeof e=="number"?Number.isFinite(e)?Math.max(0,Math.round(e)):-1:Rt(e)}function Tt(e,a){const t=ve(e);let n=ve(a);return t<0||n<0||n===t?null:(n<t&&(n+=Te),{start:t,end:n})}function Ot(e=[]){const a=Array.isArray(e)?e:[],t=[];return a.forEach(n=>{if(!n||typeof n!="object")return;const r=Tt(n.start??n.from,n.end??n.to);r&&t.push(r)}),Et(t)}function Et(e=[]){const a=(Array.isArray(e)?e:[]).filter(n=>n&&Number.isFinite(n.start)&&Number.isFinite(n.end)&&n.end>n.start).slice().sort((n,r)=>n.start-r.start||n.end-r.end),t=[];return a.forEach(n=>{const r=t[t.length-1];if(r&&n.start<=r.end){r.end=Math.max(r.end,n.end);return}t.push({start:n.start,end:n.end})}),t}const Ct="active",ke="paused",$e="archived",Se="go",Nt="public";function b(e="",a=240){return String(e??"").trim().slice(0,a)}function N(e,a=0){const t=Math.trunc(Number(e));return!Number.isFinite(t)||t<0?a:t}function Kt(e=""){const a=String(e||"").trim().toLowerCase();return a===ke?ke:a===$e?$e:Ct}function Gt(e=""){const a=String(e||"").trim().toLowerCase();return kt.includes(a)?a:je}function Ee(e=""){return String(e||"").trim().toLowerCase()===_e?_e:Pt}function It(e={}){const a=e&&typeof e=="object"?e:{},t=String(a.kind||a.type||"").trim().toLowerCase(),n=Math.min(90,Math.max(0,N(a.percent??a.discountPercent,0))),r={kind:["percent","freeItem","bundle","table","custom"].includes(t)?t:n>0?"percent":"custom",percent:n,itemId:b(a.itemId,180),itemName:b(a.itemName||a.item,160),priceText:b(a.priceText||a.price,60),text:b(a.text,160)};return r.label=Mt(r),r}function Mt(e={}){const a=e&&typeof e=="object"?e:{},t=b(a.text,160);if(t)return t;const n=N(a.percent,0);if(a.kind==="percent"||n>0)return n>0?`–${n} %`:"";if(a.kind==="freeItem"){const r=b(a.itemName,160);return r?`${r} falas`:"Produkt falas"}if(a.kind==="bundle"){const r=b(a.itemName,160),s=b(a.priceText,60);return r&&s?`${r} ${s}`:r||s||"Paket special"}return a.kind==="table"?"Tavolinë e rezervuar":""}function Ce(e){const a=Array.isArray(e)?e:e?[e]:[],t=[];return a.forEach(n=>{const r=String(n||"").trim().toLowerCase();Re(r)&&!t.includes(r)&&t.push(r)}),t.length?t:ie.map(n=>n.key)}function Lt(e=[]){const a=Ce(e);let t=Number.POSITIVE_INFINITY,n=0;return a.forEach(r=>{const s=Re(r);s&&(t=Math.min(t,s.min),n=Math.max(n,s.max))}),!Number.isFinite(t)||!n?{min:1,max:99}:{min:t,max:n}}function Ut(e={}){const a=e&&typeof e=="object"?e:{},t=String(a.mode||"").trim().toLowerCase()==="windows"?"windows":"always",n=[];(Array.isArray(a.days)?a.days:[]).forEach(u=>{const h=String(u||"").trim().toLowerCase();X.includes(h)&&!n.includes(h)&&n.push(h)});const s=Ot((Array.isArray(a.windows)?a.windows:[]).map(u=>({start:u?.start??u?.from,end:u?.end??u?.to})));return t==="always"||!n.length&&!s.length?{mode:"always",days:X.slice(),windows:[]}:{mode:"windows",days:n.length?n:X.slice(),windows:s}}function Ht(e={}){const a=e&&typeof e=="object"?e:{},t=s=>{const u=b(s,10);return/^\d{4}-\d{2}-\d{2}$/.test(u)?u:""},n=t(a.startDate||a.from),r=t(a.endDate||a.to);return n&&r&&r<n?{startDate:r,endDate:n}:{startDate:n,endDate:r}}function Zt(e={}){const a=e&&typeof e=="object"?e:{};return{slotGroups:N(a.slotGroups??a.maxGroupsPerSlot,0),slotGuests:N(a.slotGuests??a.maxGuestsPerSlot,0),dailyGroups:N(a.dailyGroups??a.maxGroupsPerDay,0),totalRedemptions:N(a.totalRedemptions??a.maxRedemptions,0)}}function Wt(e){const a=Array.isArray(e)?e:[],t=[];return a.forEach(n=>{const r=String(n||"").trim().toLowerCase();(r===Se||r===Nt)&&!t.includes(r)&&t.push(r)}),t.length?t:[Se]}function te(e={},a=""){const t=e&&typeof e=="object"?e:{},n=Ce(t.partyRanges||t.partySizes),r=Lt(n),s=It(t.benefit),u=Ee(t.bookingType);return{id:b(t.id||a,180),restaurantId:b(t.restaurantId,180),locationId:b(t.locationId,180)||"main",title:b(t.title,120),description:b(t.description||t.text,400),terms:b(t.terms||t.conditions,400),benefit:s,benefitLabel:s.label,category:Gt(t.category),partyRanges:n,minParty:r.min,maxParty:r.max,schedule:Ut(t.schedule),dateRange:Ht(t.dateRange),bookingType:u,limits:Zt(t.limits),channels:Wt(t.channels),status:Kt(t.status),sponsored:t.sponsored===!0||t.sponsored?.active===!0,sponsoredUntil:j(t.sponsored?.until),priceLevel:Math.min(4,Math.max(0,N(t.priceLevel,0))),redeemedCount:N(t.redeemedCount,0),createdAt:j(t.createdAt),updatedAt:j(t.updatedAt)}}function qa(e={},{serverTimestamp:a=null}={}){const t=te(e),n={restaurantId:t.restaurantId,locationId:t.locationId,title:t.title,description:t.description,terms:t.terms,benefit:t.benefit,benefitLabel:t.benefitLabel,category:t.category,partyRanges:t.partyRanges,minParty:t.minParty,maxParty:t.maxParty,schedule:t.schedule,dateRange:t.dateRange,bookingType:t.bookingType,limits:t.limits,channels:t.channels,status:t.status,sponsored:t.sponsored,priceLevel:t.priceLevel};return a&&(n.updatedAt=a,t.createdAt||(n.createdAt=a)),n}function Ya(e={}){const a=te(e),t=[];return a.restaurantId||t.push({field:"restaurantId",message:"Lokali mungon."}),a.benefitLabel||t.push({field:"benefit",message:"Shkruaj çka po ofron."}),a.partyRanges.length||t.push({field:"partyRanges",message:"Zgjidh sa persona."}),a.schedule.mode==="windows"&&(a.schedule.days.length||t.push({field:"schedule",message:"Zgjidh ditët."}),a.schedule.windows.length||t.push({field:"schedule",message:"Zgjidh orarin."})),a.benefit.kind==="percent"&&a.benefit.percent<=0&&t.push({field:"benefit",message:"Zbritja duhet të jetë mbi 0 %."}),{ok:t.length===0,errors:t,offer:a}}function Ne(e={}){const t=(e&&e.schedule?e:te(e)).schedule;if(t.mode==="always")return"Gjithmonë";const n={mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"},r=t.days.map(u=>n[u]||u).join(", "),s=t.windows.map(u=>`${we(u.start)}-${we(u.end)}`).join(", ");return[r,s].filter(Boolean).join(" · ")}function Ke(e={}){const a=e&&e.partyRanges?e:te(e);return`${a.maxParty>=Dt?`${a.minParty}+`:`${a.minParty}–${a.maxParty}`} persona`}const _=Object.freeze({confirmed:"confirmed",checkedIn:"checked_in",completed:"completed",cancelledByUser:"cancelled_by_user",cancelledByBusiness:"cancelled_by_business",notArrived:"not_arrived",expired:"expired"});Object.freeze([_.confirmed,_.checkedIn]);Object.freeze({[_.confirmed]:[_.checkedIn,_.completed,_.cancelledByUser,_.cancelledByBusiness,_.notArrived,_.expired],[_.checkedIn]:[_.completed,_.cancelledByBusiness],[_.completed]:[],[_.cancelledByUser]:[],[_.cancelledByBusiness]:[],[_.notArrived]:[],[_.expired]:[]});function Ge(e=""){const a=String(e||"").trim().toLowerCase();return Object.values(_).includes(a)?a:_.confirmed}function Qa({expectedArrivalAt:e=Date.now(),timeZone:a=U}={}){return Ft(e,a).dayKey}function Ja(e={},a=""){const t=e&&typeof e=="object"?e:{},n=t.snapshot&&typeof t.snapshot=="object"?t.snapshot:{};return{id:b(t.id||a,180),restaurantId:b(t.restaurantId||n.restaurantId,180),locationId:b(t.locationId||n.locationId,180)||"main",offerId:b(t.offerId||n.offerId,180),guestId:b(t.guestId,180),uid:b(t.uid,180),shortCode:b(t.shortCode,12).toUpperCase(),type:Ee(t.type||n.bookingType),status:Ge(t.status),partySize:Math.max(1,Math.trunc(Number(t.partySize||n.partySize)||1)),expectedArrivalAt:j(t.expectedArrivalAt||n.expectedArrivalAt),expectedArrivalMs:oe(t.expectedArrivalAt||n.expectedArrivalAt),dayKey:b(t.dayKey,10),slotKey:b(t.slotKey,240),timeZone:b(t.timeZone,60)||U,snapshot:n,businessName:b(n.businessName,120),benefitLabel:b(n.benefitLabel,160),logoUrl:b(n.logoUrl,500),businessSeenAt:j(t.businessSeenAt),checkedInAt:j(t.checkedInAt),completedAt:j(t.completedAt),cancelledAt:j(t.cancelledAt),cancelReason:b(t.cancelReason,200),commissionVersion:b(t.commissionVersion,40),commission:t.commission&&typeof t.commission=="object"?{version:b(t.commission.version,40),currency:b(t.commission.currency,8),partySize:Math.max(1,Math.trunc(Number(t.commission.partySize)||1)),amountCents:Math.max(0,Math.trunc(Number(t.commission.amountCents)||0)),status:b(t.commission.status,20),confirmedAt:j(t.commission.confirmedAt)}:null,createdAt:j(t.createdAt),updatedAt:j(t.updatedAt)}}function Vt(e={}){const a=Ge(e?.status);return a===_.confirmed?"Po vijnë":a===_.checkedIn?"Këtu":a===_.completed?"Përfunduar":a===_.cancelledByUser?"Anuluar nga klienti":a===_.cancelledByBusiness?"Anuluar nga ju":a===_.notArrived?"Nuk erdhën":"Skaduar"}function qt(e=0){const a=Math.max(0,Math.trunc(Number(e)||0)),t=Math.trunc(a/100),n=String(a%100).padStart(2,"0");return`${t},${n} €`}const d=Object.freeze({brand:"Mnyra GO",mark:"⚡",editor:"Editori",brandMnyra:"MNYRA",brandGo:"GO",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{active:"Aktiv",offers:"Ofertat",archive:"Arkiv",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"Ofertë e re GO",scanOffer:"Skano ofertën",seenToday:"Ofertën e kanë parë sot",acceptedToday:"E kanë pranuar sot",editOffer:"Ndrysho ofertën",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj ofertën",saving:"Po ruhet...",cancel:"Anulo",edit:"Edit",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",benefitQuestion:"Çka po ofron?",benefitCustom:"Teksti yt (opsionale)",partyQuestion:"Për sa persona?",categoryQuestion:"Për kë âsht kjo ofertë?",categoryHint:"Gastet zgjedhin mes «Ushqim» edhe «Pije».",scheduleQuestion:"Kur vlen?",always:"Gjithmonë",specificHours:"Orar specifik",dateFrom:"Prej datës (opsionale)",dateTo:"Deri me datën (opsionale)",actionQuestion:"Kur klienti e zgjedh",onlyOffer:"Vetëm oferta",offerAndTable:"Oferta + tavolinë",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",loading:"Po ngarkohet...",guestName:"Mnyra Guest",table:"Tavolinë",markDone:"Përfundo",around:"Rreth",search:"Kërko",searching:"Po kërkoj...",codePlaceholder:"Kodi i klientit",codeNotFound:"Ky kod nuk u gjet.",partyAtTable:"Sa persona janë",commission:"Provizioni",keepsRunning:"Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",onlyBusiness:"Ky funksion eshte vetem per profile biznesi.",loadingBusiness:"Biznesi po ngarkohet..."});function i(e,a=""){return typeof e=="function"?e(a):String(a??"")}function K(e,a="",t="w-4 h-4"){return typeof e=="function"?e(a,t):""}function Ie(e=""){const a=Date.parse(String(e||""));if(!Number.isFinite(a))return"";const t=new Date(a);return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function Yt({enabled:e=!1,unseenCount:a=0,activeOffers:t=0,todayBookings:n=0,iconFn:r=null,texts:s={}}={}){if(!e)return"";const u={...d,...s||{}},h=Math.max(0,Math.trunc(Number(a)||0)),w=t>0||n>0,k=w?`${t} oferta aktive · ${n} rezervime sot`:u.cardIdle;return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${h>0?`<span class="mnyra-dash__composer-badge" aria-label="${h} ${u.statNew}">${h}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${k}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${K(r,"zap","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${w?u.cardManage:u.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${K(r,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const Qt=`
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
`;function Jt(e={},a={}){const t=a.escapeHtml,n=a.icon,r=e.imageUrl?`<img class="go-hl__media" src="${i(t,e.imageUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:"",s=e.action?`<span class="go-hl__action">${i(t,e.action)}</span>`:`
      <span class="go-hl__label">${i(t,e.label)}</span>
      <span class="go-hl__value">${i(t,e.value)}</span>
    `,u=e.action||`${e.label} ${e.value}`;return`
    <button type="button" class="go-hl__card" ${e.attr||""} data-go-highlight="${i(t,e.key)}"
      aria-label="${i(t,u)}">
      <span class="go-hl__plate ${i(t,e.tone||"text-slate-400")}">${K(n,e.icon,"w-6 h-6")}</span>
      ${r}
      <span class="go-hl__body">${s}</span>
    </button>
  `}function Xt({stats:e={},deps:a={}}={}){return`
    <div class="go-hl" data-go-highlights>
      ${[{key:"scan",action:d.scanOffer,icon:"camera",tone:"text-indigo-600",attr:"data-go-scan"},{key:"seen",label:d.seenToday,value:Number(e.impressions)||0,icon:"eye",tone:"text-indigo-600"},{key:"accepted",label:d.acceptedToday,value:Number(e.accepted)||0,icon:"check-check",tone:"text-emerald-600"}].map(n=>Jt(n,a)).join("")}
      <span class="go-hl__tail" aria-hidden="true"></span>
    </div>
  `}function ea({tab:e="active",deps:a={}}={}){const t=a.escapeHtml,n=a.icon;return`
    <div class="go-tabs" role="tablist" data-go-tabs>
      ${[["active",d.tabs.active,"zap"],["offers",d.tabs.offers,"tag"],["archive",d.tabs.archive,"archive"],["options",d.tabs.options,"settings"]].map(([s,u,h])=>`
        <button type="button" role="tab" aria-selected="${e===s?"true":"false"}" data-go-business-tab="${s}"
          class="go-tab">${K(n,h,"w-4 h-4")}<span class="go-tab-label">${i(t,u)}</span></button>
      `).join("")}
    </div>
  `}function se(e={},a={},{found:t=!1}={}){const n=a.escapeHtml,r=e.type==="reservation",s=Ie(e.expectedArrivalAt),u=e.benefitLabel||e.snapshot?.benefitLabel||"",h=!e.businessSeenAt,w=s?`${d.around} ${s}`:d.guestName;return`
    <div class="p-4 rounded-[1.6rem] border ${t?"bg-white border-indigo-300 ring-2 ring-indigo-100":h?"bg-indigo-50/50 border-indigo-100":"bg-slate-50 border-slate-100"}"
      data-go-booking="${i(n,e.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">${i(n,w)}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${i(n,Vt(e))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${i(n,d.guestName)}</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-600">
        <span>👥 ${i(n,`${e.partySize||1} ${d.guests}`)}</span>
        ${s?`<span>🕐 ${i(n,d.around)} ${i(n,s)}</span>`:""}
        ${u?`<span>🎁 ${i(n,u)}</span>`:""}
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
          ${i(n,d.commission)} · ${i(n,qt(e.commission.amountCents))}
        </p>
      `:""}
      ${e.status==="checked_in"?`
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${i(n,e.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${i(n,d.markDone)}</button>
        </div>
      `:""}
    </div>
  `}function ta({code:e="",status:a="",busy:t=!1,deps:n={}}={}){const r=n.escapeHtml,s=n.icon;return`
    <div class="mb-4" data-go-code-search>
      <div class="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-400 transition-colors">
        <span class="pl-2 text-slate-400">${K(s,"search","w-4 h-4")}</span>
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
  `}function J({eyebrow:e="",title:a="",sub:t="",action:n="",body:r="",deps:s={}}={}){const u=s.escapeHtml;return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${i(u,e)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${i(u,a)}</h3>
          ${t?`<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${i(u,t)}</p>`:""}
        </div>
        ${n}
      </div>
      ${r}
    </div>
  `}function aa(e={},a={}){const t=a.escapeHtml,n=e.status==="paused"?d.paused:e.status==="archived"?d.archived:"";return`
    <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${i(t,e.id)}">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 truncate">${i(t,e.benefitLabel||"")}</p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">
          ${i(t,Ke(e))} &middot; ${i(t,Ne(e))}
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
  `}function na({offer:e={},businessName:a="",deps:t={}}={}){const n=t.escapeHtml;return`
    <div class="rounded-[1.8rem] border border-slate-200 bg-white p-5" data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${i(n,d.preview)}</p>
      <p class="mt-3 text-[13px] font-black text-slate-900">
        ${i(n,a)} <span class="font-bold text-slate-400">${i(n,d.offering)}</span>
      </p>
      <p class="mt-2 text-2xl font-black tracking-tighter text-slate-900">${i(n,e.benefitLabel||"")}</p>
      <p class="text-xs font-bold text-slate-500">${i(n,d.forGroup)}</p>
      <p class="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        ${i(n,Ke(e))} &middot; ${i(n,Ne(e))}
      </p>
      <span class="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white">
        ${i(n,d.accept)}
      </span>
    </div>
  `}function E(e,a="",t=""){return`<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${t?` for="${i(e,t)}"`:""}>${i(e,a)}</label>`}function C(e,{active:a=!1,attr:t="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${t?`${t}="${i(r,n)}"`:""} aria-pressed="${a?"true":"false"}"
      class="min-h-[44px] px-4 rounded-2xl text-xs font-black transition-colors ${a?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${i(r,e)}
    </button>
  `}function Xa({editor:e=null,businessName:a="",deps:t={}}={}){if(!e)return"";const n=t.escapeHtml,r=t.icon,s=e.draft||{},u=Array.isArray(e.errors)?e.errors:[],h=g=>u.find(R=>R.field===g)?.message||"",w=Array.isArray(s.partyRanges)?s.partyRanges:[],k=Array.isArray(s.schedule?.days)?s.schedule.days:[],p=s.schedule?.mode==="windows"?"windows":"always",f={mon:"Hën",tue:"Mar",wed:"Mër",thu:"Enj",fri:"Pre",sat:"Sht",sun:"Die"},v=e.mode==="edit",$="mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400";return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-offer-editor>
      <div class="flex items-center gap-3 mb-6">
        <button type="button" data-go-offer-cancel class="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500">
          ${K(r,"chevron-left","w-4 h-4")}
        </button>
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${i(n,d.brand)}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">${i(n,v?d.editOffer:d.createOffer)}</h2>
        </div>
      </div>

      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm space-y-5">
        <div>
          ${E(n,d.benefitQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${Bt.map(g=>C(g.label,{active:(s.benefit?.kind||"percent")===g.key,attr:"data-go-benefit-kind",value:g.key,escapeHtml:n})).join("")}
          </div>
          ${(s.benefit?.kind||"percent")==="percent"?`
            <input id="goBenefitPercent" type="number" min="1" max="90" step="1" data-go-benefit-percent
              value="${i(n,s.benefit?.percent||10)}" class="${$}" />
          `:`
            <input id="goBenefitItem" type="text" data-go-benefit-item placeholder="Cookie, Cappuccino..."
              value="${i(n,s.benefit?.itemName||"")}" class="${$}" />
            <input id="goBenefitPrice" type="text" data-go-benefit-price placeholder="2,50 €"
              value="${i(n,s.benefit?.priceText||"")}" class="${$}" />
          `}
          <input id="goBenefitText" type="text" data-go-benefit-text placeholder="${i(n,d.benefitCustom)}"
            value="${i(n,s.benefit?.text||"")}" class="${$}" />
          ${h("benefit")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${i(n,h("benefit"))}</p>`:""}
        </div>

        <div>
          ${E(n,d.partyQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${ie.map(g=>C(g.label,{active:w.includes(g.key),attr:"data-go-offer-party",value:g.key,escapeHtml:n})).join("")}
          </div>
        </div>

        <div>
          ${E(n,d.categoryQuestion)}
          <p class="mt-1 text-[11px] font-semibold text-slate-400">${n(d.categoryHint)}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            ${Fe.map(g=>C(g.label,{active:(s.category||"all")===g.key,attr:"data-go-offer-category",value:g.key,escapeHtml:n})).join("")}
          </div>
        </div>

        <div>
          ${E(n,d.scheduleQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${C(d.always,{active:p==="always",attr:"data-go-offer-schedule",value:"always",escapeHtml:n})}
            ${C(d.specificHours,{active:p==="windows",attr:"data-go-offer-schedule",value:"windows",escapeHtml:n})}
          </div>
          ${p==="windows"?`
            <div class="mt-3 flex flex-wrap gap-2">
              ${X.map(g=>C(f[g],{active:k.includes(g),attr:"data-go-offer-day",value:g,escapeHtml:n})).join("")}
            </div>
            <div class="mt-3 grid grid-cols-2 gap-3">
              <input id="goOfferFrom" type="time" data-go-offer-from value="${i(n,e.windowFrom||"14:00")}" class="${$} mt-0" />
              <input id="goOfferTo" type="time" data-go-offer-to value="${i(n,e.windowTo||"18:00")}" class="${$} mt-0" />
            </div>
          `:""}
          ${h("schedule")?`<p class="mt-2 text-[11px] font-bold text-rose-500">${i(n,h("schedule"))}</p>`:""}
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div>
            ${E(n,d.dateFrom,"goOfferStart")}
            <input id="goOfferStart" type="date" data-go-offer-start value="${i(n,s.dateRange?.startDate||"")}" class="${$}" />
          </div>
          <div>
            ${E(n,d.dateTo,"goOfferEnd")}
            <input id="goOfferEnd" type="date" data-go-offer-end value="${i(n,s.dateRange?.endDate||"")}" class="${$}" />
          </div>
        </div>

        <div>
          ${E(n,d.actionQuestion)}
          <div class="mt-2 flex flex-wrap gap-2">
            ${C(d.onlyOffer,{active:s.bookingType!=="reservation",attr:"data-go-offer-type",value:"claim",escapeHtml:n})}
            ${C(d.offerAndTable,{active:s.bookingType==="reservation",attr:"data-go-offer-type",value:"reservation",escapeHtml:n})}
          </div>
        </div>

        <div>
          ${E(n,d.limitsTitle)}
          <p class="mt-1 text-[10px] font-bold text-slate-400">${i(n,d.noLimit)}</p>
          <div class="mt-2 grid grid-cols-2 gap-3">
            ${["slotGroups","slotGuests","dailyGroups","totalRedemptions"].map(g=>`
              <div>
                <span class="text-[10px] font-black text-slate-500">${i(n,d[g])}</span>
                <input type="number" min="0" step="1" data-go-offer-limit="${g}"
                  value="${i(n,s.limits?.[g]??0)}" class="${$}" />
              </div>
            `).join("")}
          </div>
        </div>

        ${na({offer:s,businessName:a,deps:t})}

        ${e.status?`<p class="text-[11px] font-bold text-rose-500 text-center">${i(n,e.status)}</p>`:""}

        <div class="grid grid-cols-1 gap-2.5">
          <button type="button" data-go-offer-save ${e.saving?"disabled":""}
            class="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform ${e.saving?"opacity-60":""}">
            ${i(n,e.saving?d.saving:v?d.save:d.activate)}
          </button>
          <button type="button" data-go-offer-cancel
            class="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform">
            ${i(n,d.cancel)}
          </button>
        </div>
      </div>
    </div>
  `}function en({restaurantName:e="",tab:a="active",stats:t={},search:n={},bookings:r=[],offers:s=[],settings:u={},paused:h=!1,loading:w=!1,error:k="",deps:p={}}={}){const f=p.escapeHtml,v=p.icon,$=r.filter(z=>["confirmed","checked_in"].includes(z.status)),g=r.filter(z=>!["confirmed","checked_in"].includes(z.status)),R=s.filter(z=>z.status!=="archived");let G="";if(a==="offers")G=J({eyebrow:d.brand,title:d.tabs.offers,sub:`${R.length} ${R.length===1?"oferte":"oferta"}`,action:`
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${K(v,"plus","w-4 h-4")}
        </button>
      `,body:R.length?`<div class="space-y-3">${R.map(z=>aa(z,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${i(f,d.emptyTitle)}</div>`,deps:p});else if(a==="archive")G=J({eyebrow:d.brand,title:d.tabs.archive,sub:`${g.length}`,body:g.length?`<div class="space-y-3">${g.map(z=>se(z,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${i(f,d.noHistory)}</div>`,deps:p});else if(a==="options"){const z=Ie(u?.pausedUntil);G=J({eyebrow:d.brand,title:d.tabs.options,body:`
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${i(f,d.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${i(f,h?`${d.pausedUntil} ${z}`:"ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${h?"text-amber-600":"text-emerald-600"}">
            ${i(f,h?d.paused:d.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${h?`<button type="button" data-go-pause="0" class="min-h-[44px] px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${i(f,d.resume)}</button>`:[{value:"30",label:"30 min"},{value:"60",label:"1 orë"},{value:"tomorrow",label:"Deri nesër"},{value:"-1",label:"Pa afat"}].map(Z=>`
              <button type="button" data-go-pause="${Z.value}"
                class="min-h-[44px] px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${i(f,Z.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${i(f,d.keepsRunning)}</p>
      `,deps:p})}else G=J({eyebrow:d.brand,title:d.tabs.active,sub:`${$.length}`,body:`
        ${ta({code:n.code,status:n.status,busy:n.busy,deps:p})}
        ${n.booking?`
          <div class="mb-4">${se(n.booking,p,{found:!0})}</div>
        `:""}
        ${w?`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${i(f,d.loading)}</div>`:$.length?`<div class="space-y-3">${$.filter(z=>z.id!==n.booking?.id).map(z=>se(z,p)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${i(f,d.noBookings)}</div>`}
      `,deps:p});return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <!--
        Das Stylesheet steht in der Seite und nicht im Kopf des Dokuments: Die
        Reihe braucht Regeln, die sich mit Tailwind-Klassen nicht schreiben
        lassen (Zeilenbegrenzung, versteckte Bildlaufleiste, Rasterpunkte).
        Es wird mit der Seite ersetzt, also gibt es es immer genau einmal.
      -->
      <style>${Qt}</style>
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
        <h1 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">${i(f,d.brandMnyra)}<span class="text-indigo-600">${i(f,d.brandGo)}</span></h1>
        <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${i(f,e?`${d.editor} ${e}`:d.editor)}</p>
      </div>

      ${Xt({stats:t,deps:p})}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        dieselbe Flaeche wie im Paneli. Die Reihe darueber bleibt frei: sie
        gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="go-bento" data-go-bento>
        ${ea({tab:a,deps:p})}
        <div>
          ${G}
          ${k?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${i(f,k)}</p>`:""}
        </div>
      </div>
    </div>
  `}function tn({deps:e={},resolving:a=!1}={}){const t=e.icon,n=e.escapeHtml;return a?`
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${i(n,d.loadingBusiness)}</p>
        </div>
      </div>
    `:`
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${K(t,"lock","w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${i(n,d.brand)}</h2>
        <p class="text-sm text-slate-500">${i(n,d.onlyBusiness)}</p>
      </div>
    </div>
  `}const ze="mnyraDashboardStyles",ra=`
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
`;function sa(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(ze)))try{const a=e.createElement("style");a.id=ze,a.textContent=ra,e.head?.appendChild(a)}catch{}}function x(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function D(e,a,t=""){if(typeof e!="function")return"";try{return e(a,t)||""}catch{return""}}const ia=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function oa({businessType:e="",isShopCatalog:a=!1}={}){if(a)return"shop";const t=String(e||"").trim().toLowerCase();return ia.includes(t)?"hotel":"restaurant"}function da(e=new Date().getHours()){const a=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return a>=5&&a<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:a>=11&&a<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:a>=18&&a<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function la({name:e="",logoUrl:a="",hour:t=new Date().getHours(),iconFn:n}={}){const r=da(t),s=x(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${a?`<img src="${x(a)}" alt="${s}" title="${s}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${s}">${D(n,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${x(r.text)}</p>
    </div>
  `}function ca({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function ua({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function ha({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const Ae=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function pa(e="restaurant"){const a=String(e||"").trim().toLowerCase();return Ae[a]||Ae.restaurant}function ma({iconFn:e,kind:a="restaurant",showEditor:t=!0}={}){if(!t)return"";const n=pa(a);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${x(n.accent)}</span> ${x(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${x(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${x(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const fa="/waiter?from=panel";function ba({iconFn:e,showEditor:a=!0}={}){return a?`
    <a href="${fa}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${D(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${D(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function ga({cards:e=[],iconFn:a}={}){const t=(Array.isArray(e)?e:[]).filter(r=>r&&r.key);if(!t.length)return"";const n=t.map((r,s)=>{const u=x(r.label||"");if(r.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const h=s<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let w="";r.imageUrl?w=`<img class="mnyra-dash__hl-media" src="${x(r.imageUrl)}" alt="" ${h} decoding="async" onerror="this.style.display='none'" />`:r.videoUrl&&(w=`<video class="mnyra-dash__hl-media" src="${x(r.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const k=`
      <span class="mnyra-dash__hl-plate">${D(a,r.iconName||"image","w-6 h-6")}</span>
      ${w}
    `,p=r.withEye?`<span class="mnyra-dash__hl-eye">${D(a,"eye","w-4 h-4")}</span>`:"";let f;r.locked?f=`<span class="mnyra-dash__hl-lock">${D(a,"lock","w-3 h-3")}Me pagesë</span>`:r.loading?f='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':r.emptyText?f=`<span class="mnyra-dash__hl-empty">${x(r.emptyText)}</span>`:f=`<span class="mnyra-dash__hl-value">${p}${x(r.value||"0")}</span>`;let v;r.locked?v=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${x(r.key)}"`:r.composer?v=`class="mnyra-dash__hl-card" data-dashboard-composer="${x(r.composer)}"`:v=`class="mnyra-dash__hl-card"${r.panelTab?` data-dashboard-panel-tab="${x(r.panelTab)}"`:""}`;const $=r.locked?`${u} – me pagesë`:`${u} ${r.emptyText||r.value||""}`.trim();return`
      <button type="button" ${v} data-dashboard-metric="${x(r.key)}" aria-label="${x($)}">
        ${k}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${u}</span>
          ${f}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-dash__hl" data-dashboard-metrics="${x(ya(t))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function ya(e=[]){return(Array.isArray(e)?e:[]).filter(a=>a&&a.key).map(a=>[a.key,a.label||"",a.value||"",a.emptyText||"",a.imageUrl||"",a.videoUrl||"",a.iconName||"",a.panelTab||"",a.composer||"",a.pending?"p":"",a.loading?"l":"",a.locked?"x":"",a.withEye?"e":""].join("~")).join("|")}const Me=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function ee(e=""){const a=String(e||"").trim().toLowerCase();return Me.some(t=>t.id===a)?a:"funksionet"}function _a({activeTab:e="funksionet",iconFn:a}={}){const t=ee(e);return`<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${Me.map(r=>{const s=r.id===t;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${x(r.id)}"
        aria-selected="${s?"true":"false"}"
        class="mnyra-dash__tab"
      >${D(a,r.iconName,"w-4 h-4")}<span class="mnyra-dash__tab-label">${x(r.label)}</span></button>
    `}).join("")}</div>`}function Le(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function xa({posts:e=[],iconFn:a}={}){const t=Array.isArray(e)?e:[];let n="";return t.length?(n=t.map(r=>{const s=[r.dateLabel,`${L(r.likesCount||0)} Likes`,`${L(r.commentsCount||0)} Kommentare`];return Number(r.impressions||0)>0&&s.push(`${L(r.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${r.thumbUrl?`<img src="${x(r.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:D(a,r.mediaType==="video"?"play":"image","w-5 h-5")}
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
  `}function wa(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function va({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${x(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function ka(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function $a(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),a=Array.from({length:4},(t,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    ${ka()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${Le(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>').join("")}
      </div>
      ${a}
    `)}
  `}function Sa({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${x(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function za(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Aa="menyra_social_dashboard_cache_v1::",De="menyra_social_composer_products_v1::",Pe=2500,Be=1200,Da=6,Pa=3,Ba=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),ja=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function B(e){const a=Number(e);return Number.isFinite(a)?a:0}function Fa(e={}){const a=String(e.createdAtClient||"").trim();if(a){const n=new Date(a);if(!Number.isNaN(n.getTime()))return n}const t=e.createdAt;if(t&&typeof t.toDate=="function")try{const n=t.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function Ra(e="",a={}){const t=Array.isArray(a.media)&&a.media.length?a.media[0]:{},n=String(t.type||a.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",r=String(t.thumbUrl||(n==="image"?t.url:"")||a.thumbUrl||"").trim(),s=n==="video"?String(t.url||a.mediaUrl||"").trim():"",u=Fa(a);return{id:String(e||"").trim(),caption:String(a.caption||"").trim(),mediaType:n,thumbUrl:r,videoUrl:s,likesCount:B(a.likesCount),commentsCount:B(a.commentsCount),impressions:0,dateLabel:u?u.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:u?u.getTime():0}}function Ta({days:e=[],todayKey:a="",rawPosts:t=[]}={}){const n=Array.isArray(e)?e:[],r=ye(n),s=n.find(p=>String(p?.date||p?.id||"").trim()===String(a||"").trim()),u=ye(s?[s]:[]),h=r.merged?.posts&&typeof r.merged.posts=="object"?r.merged.posts:{},w=(Array.isArray(t)?t:[]).map(p=>Ra(p?.id,p?.data||{})).filter(p=>p.id).map(p=>({...p,impressions:B(h[p.id]?.impressions)})),k=w.slice().sort((p,f)=>f.createdAtMs-p.createdAtMs).slice(0,Pa);return{day:String(a||"").trim(),week:r.summary,today:u.summary,posts:k,latestPost:Oa(w)}}function Oa(e=[]){const a=(Array.isArray(e)?e:[]).filter(t=>t&&t.id);return a.length?a.slice().sort((t,n)=>B(n.createdAtMs)-B(t.createdAtMs)||B(n.impressions)-B(t.impressions)||B(n.likesCount)-B(t.likesCount))[0]:null}function Ea({profile:e={},restaurant:a={}}={}){return ht({profile:e,restaurant:a,feature:"qr"})}function Ca(e={}){const a=e&&typeof e=="object"?e:{};return String(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||a.bannerUrl||"").trim()}function Na({model:e=null,coverUrl:a="",subscribed:t=!1,assets:n={}}={}){const r=e?.today||{},s=!e,u=e?.latestPost||null,h=[];if(s)h.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!u)h.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const w=String(u.thumbUrl||"").trim();h.push({key:"latestPost",label:"Postimi fundit",value:L(B(u.impressions)),withEye:!0,imageUrl:w,videoUrl:w?"":String(u.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return h.push({key:"profileViews",label:"Vizitor n'profil",value:L(B(r.profileViews)),withEye:!0,loading:s,imageUrl:String(a||"").trim(),iconName:"user",panelTab:"analitika"}),h.push({key:"menuOpens",label:"Vizitor n'meny",value:L(B(r.menuOpens)),withEye:!0,loading:s&&t,locked:!t,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),h.push({key:"qrScans",label:"Skanime n'tavolina",value:L(B(r.qrScans)),withEye:!0,loading:s&&t,locked:!t,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),h}function an({state:e,renderFn:a,documentObj:t,firestoreApi:n={},profileApi:r={},composerApi:s={},viewApi:u={},iconFn:h,storageObj:w}={}){const k=t||(typeof document>"u"?null:document),p=k?.defaultView||(typeof window>"u"?null:window),f=typeof a=="function"?a:()=>{},v=w||(typeof localStorage>"u"?null:localStorage),$=typeof r.getBusinessProfileTypeFn=="function"?r.getBusinessProfileTypeFn:(()=>""),g=typeof r.isShopCatalogProfileFn=="function"?r.isShopCatalogProfileFn:(()=>!1),R=typeof r.getRestaurantMetaByIdFn=="function"?r.getRestaurantMetaByIdFn:(()=>null),G=typeof r.resolveRestaurantLogoFn=="function"?r.resolveRestaurantLogoFn:(()=>""),z=typeof r.resolveOwnAvatarUrlFn=="function"?r.resolveOwnAvatarUrlFn:(()=>""),Z=typeof u.renderAnalyticsViewFn=="function"?u.renderAnalyticsViewFn:(()=>""),Ue=typeof u.renderSettingsViewFn=="function"?u.renderSettingsViewFn:(()=>""),He=typeof u.warmAnalyticsFn=="function"?u.warmAnalyticsFn:(()=>{});let de=!1,H=0,le=!1,I=null,W=null,V="",ce=!1,ue=()=>null;const Ze=300;function ae(){const o=e?.userProfile||{};return oa({businessType:$(o),isShopCatalog:g(o)})}function We(o=""){const l=R(o)||{};return vt(l).map(c=>({id:c.id,name:c.title,price:c.price??"",category:c.beds||c.tag||"",type:"room",imageUrl:c.imageUrl||""}))}function Ve(o=""){if(!v)return null;try{const l=v.getItem(`${De}${o}`);if(!l)return null;const c=JSON.parse(l),m=Array.isArray(c?.items)?c.items:null;return m&&m.length?m:null}catch{return null}}function qe(o="",l=[]){if(v)try{v.setItem(`${De}${o}`,JSON.stringify({savedAt:Date.now(),items:l}))}catch{}}async function Ye(o=""){const{db:l,collectionFn:c,queryFn:m,limitFn:y,getDocsFn:S}=n;if(!l||typeof c!="function"||typeof S!="function")throw new Error("Produktet nuk u ngarkuan.");const T=c(l,"restaurants",o,"menuItems"),P=typeof m=="function"&&typeof y=="function"?m(T,y(Ze)):T,O=await S(P),A=[];return O.forEach(M=>{const Q=ue(M?.id,M?.data?.()||{});Q&&A.push(Q)}),A.sort((M,Q)=>M.name.localeCompare(Q.name,"sq")),A}async function Qe(o="",l){const c=String(o||"").trim();if(!c)throw new Error("Produktet nuk u ngarkuan.");if(ae()==="hotel")return We(c);const m=Ye(c).then(S=>(qe(c,S),S)),y=Ve(c);return y?(typeof l=="function"?m.then(S=>l(S)).catch(()=>{}):m.catch(()=>{}),y):m}function he(){return I?Promise.resolve(I):(W||(W=lt(()=>import("./business-composer-controller-BQMwhmIr.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(o=>(ue=typeof o?.normalizeComposerProductCore=="function"?o.normalizeComposerProductCore:(()=>null),I=o.createBusinessComposerController({documentObj:k,windowObj:k?.defaultView||null,api:{getRestaurantIdFn:()=>q(),getBusinessMetaFn:()=>{const l=q();if(!l)return{name:"",logoUrl:"",city:""};const c=ge(l),m=R(l)||{};return{name:c.name,logoUrl:c.logoUrl,city:String(m.city||"").trim()}},loadProductsFn:(l,c)=>Qe(l,c),getBusinessKindFn:()=>ae(),uploadImageFn:s.uploadImageFn,uploadVideoFn:s.uploadVideoFn,captureVideoPosterFn:s.captureVideoPosterFn,createPostFn:s.createPostFn,createStoryFn:s.createStoryFn,formatPriceFn:s.formatPriceFn,getOptimizedImageUrlFn:s.getOptimizedImageUrlFn,escapeHtmlFn:s.escapeHtmlFn,iconFn:typeof h=="function"?h:void 0,afterPublishFn:async l=>{try{await Y({force:!0})}catch{}typeof s.afterPublishFn=="function"&&await s.afterPublishFn(l)}}}),I)).catch(o=>{throw W=null,console.error("[mnyra][dashboard] composer load failed",o),o})),W)}function pe(){const o=p?.navigator?.connection;return!o||typeof o!="object"?!1:o.saveData===!0?!0:/(^|-)2g$/.test(String(o.effectiveType||"").trim().toLowerCase())}function Je(){if(ce||I||!p||pe())return;ce=!0;const o=()=>{if(he().catch(()=>{}),typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}};if(typeof p.requestIdleCallback=="function"){p.requestIdleCallback(o,{timeout:Pe});return}p.setTimeout?.(o,Be)}function Xe(){if(de||!p||pe())return;de=!0;const o=()=>{try{He()}catch{}};if(typeof p.requestIdleCallback=="function"){p.requestIdleCallback(o,{timeout:Pe});return}p.setTimeout?.(o,Be)}function et(o="post"){const l=String(o||"").trim().toLowerCase(),c=l==="story"||l==="profile"?l:"post";if(typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}if(I){I.open(c);return}V=c,he().then(m=>{const y=V||c;V="",m?.open?.(y)}).catch(()=>{V=""})}function ne(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function me(o=""){const l=ne(),c=String(o||"").trim();return String(l.restaurantId||"")===c||(l.restaurantId=c,l.model=null,l.status="idle",l.error="",l.loadedSignature="",l.paywall="",H+=1),l}function q(){const o=e?.userProfile||{};return String(o.restaurantId||o.staffRestaurantId||"").trim()}let fe="";function tt(){const o=String(e?.user?.uid||"").trim();!o||fe===o||typeof r.ensureBusinessProfileFn=="function"&&(fe=o,Promise.resolve().then(()=>r.ensureBusinessProfileFn()).catch(l=>{console.warn("[mnyra][panel] business profile could not be resolved",l)}).finally(()=>{String(e?.user?.uid||"").trim()===o&&f()}))}function at(){const o=String(e?.user?.uid||"").trim();if(!o)return!1;const l=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||l===o}function be(o=""){return`${Aa}${o}`}function nt(o="",l=""){if(!v||!o)return null;try{const c=v.getItem(be(o));if(!c)return null;const m=JSON.parse(c);return!m||typeof m!="object"||String(m.day||"").trim()!==String(l||"").trim()||!m.model||typeof m.model!="object"?null:m.model}catch{return null}}function rt(o="",l=null){if(!(!v||!o||!l))try{v.setItem(be(o),JSON.stringify({day:l.day,model:l}))}catch{}}async function st(o=""){const{db:l,collectionFn:c,queryFn:m,orderByFn:y,limitFn:S,getDocsFn:T}=n;if(!l||typeof c!="function"||typeof m!="function"||typeof y!="function"||typeof S!="function"||typeof T!="function")return[];const P=c(l,"restaurants",o,"socialPosts");return(await T(m(P,y("createdAt","desc"),S(Da)))).docs.map(A=>({id:A.id,data:A.data()||{}})).filter(A=>{const M=String(A.data.status||"active").trim().toLowerCase();return M!=="deleted"&&M!=="hidden"})}async function Y({force:o=!1}={}){const l=q(),c=me(l);if(!l)return;const m=ct({rangeKey:"7d"});if(!m)return;const y=`${l}::${m.toDay}`;if(!o&&c.loadedSignature===y&&c.status==="ready")return;if(!c.model){const P=nt(l,m.toDay);P&&(c.model=P,c.status="ready",f())}H+=1;const S=H;c.model||(c.status="loading",c.error="",f());try{const P={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:l},[O,A]=await Promise.allSettled([ut({...P,fromDay:m.fromDay,toDay:m.toDay}),st(l)]);if(S!==H)return;if(O.status==="rejected")throw O.reason;A.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",A.reason),c.model=Ta({days:O.value,todayKey:m.toDay,rawPosts:A.status==="fulfilled"?A.value:[]}),c.status="ready",c.error="",c.loadedSignature=y,rt(l,c.model)}catch(P){if(S!==H)return;console.error("[mnyra][dashboard] load failed",P),c.model||(c.status="error",c.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}f()}function it(){le||!k||(le=!0,k.addEventListener("click",o=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(o.target?.closest?.("[data-dashboard-retry]")){Y({force:!0});return}if(o.target?.closest?.("[data-dashboard-paywall-close]")){o.preventDefault(),ne().paywall="",f();return}const l=o.target?.closest?.("[data-dashboard-metric-locked]");if(l){o.preventDefault(),ne().paywall=String(l.getAttribute("data-dashboard-metric-locked")||"").trim(),f();return}const c=o.target?.closest?.("[data-dashboard-composer]");if(c){o.preventDefault(),et(c.getAttribute("data-dashboard-composer"));return}const m=o.target?.closest?.("[data-dashboard-panel-tab]");if(m){o.preventDefault();const y=ee(m.getAttribute("data-dashboard-panel-tab"));if(y===ee(e?.dashboardPanelTab))return;e.dashboardPanelTab=y,f()}}catch{}}))}function ge(o=""){const l=e?.userProfile||{},c=o?R(o)||{}:{},m=String(c.name||c.restaurantName||l.name||"").trim()||"Business";let y="";try{y=String(z()||"").trim()}catch{}if(!y)try{y=String(G(c)||"").trim()}catch{}return{name:m,logoUrl:y,kind:ae(),coverUrl:Ca(c),subscribed:Ea({profile:l,restaurant:c})}}function ot(o=""){try{if(!pt()||!o)return"";mt({restaurantId:o,onBadgeFn:()=>f()});const l=ft();return Yt({enabled:!0,unseenCount:l.unseen,activeOffers:l.activeOffers||0,todayBookings:l.today,iconFn:h})}catch{return""}}function dt(){sa(k),it();const o=q(),l=me(o);let c="";if(!o)tt(),c=at()?$a():za();else{Je(),Xe();const m=ge(o),y=ee(e?.dashboardPanelTab);l.status==="idle"&&(l.status="loading",queueMicrotask(()=>{Y({force:!1})}));let S="";l.model?S=xa({posts:l.model.posts,iconFn:h}):l.status==="error"?S=Sa({message:l.error}):S=wa();const T=`
        ${ot(o)}
        ${ca({iconFn:h})}
        ${ba({iconFn:h,showEditor:!!o})}
        ${ua({iconFn:h,showEditor:!!o})}
        ${ha({iconFn:h,showEditor:!!o})}
        ${ma({iconFn:h,kind:m.kind,showEditor:!!o})}
      `;let P;y==="analitika"?P=`
          <div class="mnyra-dash__embed">${Z()}</div>
          ${S}
        `:y==="opsionet"?P=`<div class="mnyra-dash__embed">${Ue()}</div>`:P=T;const O=Na({model:l.model,coverUrl:m.coverUrl,subscribed:m.subscribed,assets:Ba}),A=String(l.paywall||"").trim();c=`
        ${la({name:m.name,logoUrl:m.logoUrl,iconFn:h})}
        ${ga({cards:O,iconFn:h})}
        ${Le(`
          ${_a({activeTab:y,iconFn:h})}
          ${P}
        `)}
        ${A?va({title:ja[A]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${c}
      </section>
    `}return Object.freeze({renderDashboardView:dt,loadDashboard:Y})}export{Za as G,gt as M,an as a,te as b,yt as c,Xa as d,en as e,we as f,Ja as g,Qa as h,Dt as i,Ha as j,At as k,Va as l,Wa as m,wt as n,vt as o,La as p,Ua as q,tn as r,qa as t,Ya as v};
