const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/hotel-stay-detail-modal-CSaOOAlP.js","chunks/domain-app-events-hzGRXnB9.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-feed-social-eager-D_VPmVb1.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-CIzEcWj-.js","chunks/domain-dashboard-CUMXwtAY.js","chunks/domain-analytics-BNpk5u6w.js"])))=>i.map(i=>d[i]);
import{_ as ia}from"./domain-auth-Aq-4Vdvh.js";import{w as $r}from"./domain-menu-eager-CIzEcWj-.js";import{r as kr}from"./profile-post-card-markup-utils-HwqIiXgP.js";import{a as Zt}from"./domain-media-eager-DAUyCk2O.js";import{aC as oa,aD as Qe,aE as Sr,t as Ir,aF as Cr,k as Pr,aG as Je}from"./domain-feed-social-eager-D_VPmVb1.js";import{r as jr,h as Ar,H as $a,n as ka,i as Tr}from"./domain-app-events-hzGRXnB9.js";import{n as la,M as ca,b as en,d as Lr,f as Mr}from"./domain-dashboard-CUMXwtAY.js";import{K as _r,L as Fr,M as Er,N as Rr,O as zr,P as Nr,Q as Dr,J as Or,R as Ur,A as Hr,g as Br,B as Vr,S as Kr,T as qr,b as Gr,d as Yr}from"./vendor-firebase-D7Ks7H8l.js";import{a as Wr,r as Qr,b as da,c as Jr,p as Xr,w as Zr,B as ua}from"./business-type-hint-utils-DMmUx9Wd.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-analytics-BNpk5u6w.js";const dn=Object.freeze([Object.freeze({key:"city",label:"Qyteti",labelDe:"Qyteti"}),Object.freeze({key:"beach",label:"Plazha",labelDe:"Straende"}),Object.freeze({key:"sights",label:"Vende per te pare",labelDe:"Sehenswuerdigkeiten"}),Object.freeze({key:"activities",label:"Aktivitete",labelDe:"Aktivitaeten"}),Object.freeze({key:"nature",label:"Natyre",labelDe:"Natur"}),Object.freeze({key:"food",label:"Restorante & Kafene",labelDe:"Restaurants & Cafes"}),Object.freeze({key:"nearby",label:"Vende te rendesishme",labelDe:"Wichtige Orte"})]),ei=Object.freeze(dn.map(o=>o.key)),ti=Object.freeze([Object.freeze({key:"all",labelDe:"Ganzjaehrig"}),Object.freeze({key:"summer",labelDe:"Saisonal Sommer"}),Object.freeze({key:"winter",labelDe:"Saisonal Winter"})]),ni=Object.freeze(ti.map(o=>o.key)),ai=12;function ye(o=""){return o==null?"":String(o).trim()}function tn(o){const r=Number(o);return Number.isFinite(r)?r:null}function si(o=""){const r=ye(o).toLowerCase();return ei.includes(r)?r:{qyteti:"city",stadt:"city",plazha:"beach",plazhi:"beach",strand:"beach",straende:"beach",sehenswuerdigkeiten:"sights",sehenswurdigkeiten:"sights",aktivitete:"activities",aktivitaeten:"activities",natyre:"nature",natur:"nature",restorante:"food",restaurants:"food",cafes:"food",kafene:"food",umgebung:"nearby",rrethina:"nearby"}[r]||"nearby"}function ri(o=""){const r=ye(o).toLowerCase();return ni.includes(r)?r:"all"}function ii(o=Date.now(),r=Math.random()){const u=Math.max(0,Number(o)||0).toString(36),a=Math.floor(Math.max(0,Math.min(.999999,Number(r)||0))*36**6).toString(36).padStart(6,"0");return`place_${u}_${a}`}function oi(o){return Array.isArray(o)?o.map(r=>ye(r)).filter(Boolean).slice(0,ai):[]}function li(o={},{index:r=0}={}){const u=o&&typeof o=="object"?o:{},a=tn(u.lat??u.latitude??u.coords?.lat),b=tn(u.lng??u.lon??u.longitude??u.coords?.lng),f=tn(u.priority);return{id:ye(u.id)||ii(Date.now()+r),name:ye(u.name),category:si(u.category),description:ye(u.description??u.text).slice(0,600),address:ye(u.address??u.plusCode).slice(0,240),lat:a,lng:b,coverImageUrl:ye(u.coverImageUrl??u.imageUrl??u.coverUrl),gallery:oi(u.gallery),priority:f==null?0:Math.max(0,Math.min(100,Math.round(f))),pinned:u.pinned===!0,season:ri(u.season??u.seasonal),active:u.active!==!1}}const ci=6371e3,di=80,ui=600,pi=1600;function wt(o=0){return(Number(o)||0)*(Math.PI/180)}function Ne(o){return o==null||o===""?NaN:Number(o)}function St(o={}){return Number.isFinite(Ne(o?.lat))&&Number.isFinite(Ne(o?.lng))}function fi(o,r,u,a){const b=Ne(o),f=Ne(r),E=Ne(u),_=Ne(a);if(![b,f,E,_].every(Number.isFinite))return null;const U=wt(E-b),P=wt(_-f),S=Math.sin(U/2)**2+Math.cos(wt(b))*Math.cos(wt(E))*Math.sin(P/2)**2;return Math.round(2*ci*Math.asin(Math.min(1,Math.sqrt(S))))}function pa(o){const r=Number(o);return!Number.isFinite(r)||r<0?"":r<1e3?`${Math.max(10,Math.round(r/10)*10)} m`:r<1e4?`${(r/1e3).toFixed(1).replace(/\.0$/,"")} km`:`${Math.round(r/1e3)} km`}function mi(o){const r=Number(o);return!Number.isFinite(r)||r<0?null:r<=pi?{mode:"walk",minutes:Math.max(1,Math.round(r/di))}:{mode:"drive",minutes:Math.max(1,Math.round(r/ui))}}function fa(o,r={}){const u=mi(o);if(!u)return"";const a=String(r.walk||"min in Gehweite"),b=String(r.drive||"min me makine");return`${u.minutes} ${u.mode==="walk"?a:b}`}const Sa=200;function we(o=""){return o==null?"":String(o).trim()}function ma(o){return Array.isArray(o)?Array.from(new Set(o.map(r=>we(r)).filter(Boolean))).slice(0,Sa):[]}function Ia(o={}){const r=o&&typeof o=="object"?o:{},u=r.placePatches&&typeof r.placePatches=="object"?r.placePatches:{},a={};return Object.entries(u).slice(0,Sa).forEach(([b,f])=>{const E=we(b);if(!E||!f||typeof f!="object")return;const _={};we(f.name)&&(_.name=we(f.name)),we(f.description)&&(_.description=we(f.description).slice(0,600)),we(f.coverImageUrl)&&(_.coverImageUrl=we(f.coverImageUrl)),Object.keys(_).length&&(a[E]=_)}),{hidden:ma(r.hidden),pinned:ma(r.pinned),placePatches:a}}function an({places:o=[],overrides:r={},hotelCoords:u=null,includeHidden:a=!1}={}){const b=Ia(r),f=new Set(b.hidden),E=new Map(b.pinned.map((P,S)=>[P,S])),_=St(u)?u:null;return(Array.isArray(o)?o:[]).map((P,S)=>li(P,{index:S})).filter(P=>P.name&&P.active).map(P=>{const S=b.placePatches[P.id]||{},B=_&&St(P)?fi(_.lat,_.lng,P.lat,P.lng):null;return{...P,...S,hidden:f.has(P.id),pinned:E.has(P.id)||P.pinned,pinnedRank:E.has(P.id)?E.get(P.id):null,distanceMeters:B}}).filter(P=>a||!P.hidden).sort((P,S)=>{const B=P.pinnedRank!=null,Q=S.pinnedRank!=null;if(B!==Q)return B?-1:1;if(B&&Q&&P.pinnedRank!==S.pinnedRank)return P.pinnedRank-S.pinnedRank;if(P.pinned!==S.pinned)return P.pinned?-1:1;if(P.priority!==S.priority)return S.priority-P.priority;const le=Number.isFinite(P.distanceMeters)?P.distanceMeters:1/0,ce=Number.isFinite(S.distanceMeters)?S.distanceMeters:1/0;return le!==ce?le-ce:String(P.name).localeCompare(String(S.name))})}function gi(o=[]){const r=Array.isArray(o)?o:[];return dn.map(u=>({...u,places:r.filter(a=>a.category===u.key)})).filter(u=>u.places.length)}const sn="mnyraHotelDestinationSections",ga="mnyraHotelDetailStyles",bi="/apps/menyra-social/styles/hotel-detail.css?v=2026-07-11-hotel-detail-v10",ba=Object.freeze({walk:"min në këmbë",drive:"min me makinë"}),je=Object.freeze({rooms:"Qëndrimi yt",offers:"Oferta për ty",city:"Përreth teje",beach:"Deti afër",sights:"Vlen të shihet",activities:"Përjeto zonën",nature:"Natyrë e gjallë",food:"Shijo lokal",nearby:"Afër teje",amenities:"Pa pagesë shtesë",map:"Zbulo zonën",rating:"Nga vizitorët"}),rn=Object.freeze({city:"Qyteti",beach:"Plazha",sights:"Vende për të parë",activities:"Aktivitete",nature:"Natyra",food:"Restorante & Kafene",nearby:"Vende të rëndësishme"}),on=Object.freeze({bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>',building:'<path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',waves:'<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>',compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',sparkles:'<path d="m12 3-1.2 3.1L8 7.5l2.8 1.4L12 12l1.2-3.1L16 7.5l-2.8-1.4zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8zM18 13l-1 2.7-3 1.3 3 1.3 1 2.7 1-2.7 3-1.3-3-1.3z"/>',tree:'<path d="m17 14 3 3h-5l3 3H6l3-3H4l3-3H3l5-5H5l7-7 7 7h-3l5 5zM12 20v2"/>',coffee:'<path d="M10 2v2M14 2v2M6 2v2M18 8h1a3 3 0 0 1 0 6h-1M4 8h14v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>',pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0"/><circle cx="12" cy="10" r="3"/>',nav:'<path d="m3 11 19-9-9 19-2-8z"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',expand:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/>',arrowRight:'<path d="M5 12h14M13 6l6 6-6 6"/>',check:'<path d="m20 6-11 11-5-5"/>',wifi:'<path d="M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',car:'<path d="m5 17-2-1v-4l2-5h14l2 5v4l-2 1M5 17v2M19 17v2M3 13h18M7 13h.01M17 13h.01"/>',snow:'<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93M8 5l4 2 4-2M8 19l4-2 4 2"/>',shield:'<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',umbrella:'<path d="M2 12h20M12 12v8a2 2 0 0 0 4 0M2 12a10 10 0 0 1 20 0M12 2v1"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',size:'<path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6"/>'}),hi=Object.freeze({city:"building",beach:"waves",sights:"compass",activities:"sparkles",nature:"tree",food:"coffee",nearby:"pin"}),vi=Object.freeze([{keywords:["wifi","wi-fi","internet"],icon:"wifi"},{keywords:["parkim","parking","garazh"],icon:"car"},{keywords:["mengjes","mëngjes","breakfast","fruehstueck"],icon:"coffee"},{keywords:["klime","klimë","kondicioner","ac"],icon:"snow"},{keywords:["plazh","det","beach","pishine","pishinë","pool"],icon:"waves"},{keywords:["shezlong","ombrelle","umbrella"],icon:"umbrella"},{keywords:["recepsion","reception","siguri","security","24"],icon:"shield"},{keywords:["pastrim","cleaning","spa"],icon:"sparkles"},{keywords:["famil","person"],icon:"users"}]);function V(o=""){return o==null?"":String(o).trim()}function N(o=""){return V(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function re(o="pin",r=""){const u=on[o]||on.pin;return`<svg class="mhd-icon ${r}" viewBox="0 0 24 24" aria-hidden="true">${u}</svg>`}function ha(o=typeof document>"u"?null:document){if(!o||o.getElementById(ga))return;const r=o.createElement("link");r.id=ga,r.rel="stylesheet",r.href=bi,o.head.appendChild(r)}function Oe({iconName:o="pin",eyebrow:r="",title:u=""}={}){return`
    <div class="mhd-section-title">
      <span class="mhd-section-icon">${re(o)}</span>
      <div>
        ${r?`<small>${N(r)}</small>`:""}
        <h2>${N(u)}</h2>
      </div>
    </div>
  `}function xi(o=""){const r=V(o);if(!r)return null;const u=r.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i);if(!u)return null;const a=Number(String(u[1]||"").replace(",","."));if(!Number.isFinite(a)||a<0)return null;const b=String(u[2]||"m").trim().toLowerCase();return Math.round(b.startsWith("k")?a*1e3:a)}function wi(o={}){const r=o.manualDistance&&typeof o.manualDistance=="object"?o.manualDistance:null;if(r){const b=V(r.label),f=V(r.timeLabel),E=b||pa(o.distanceMeters),_=xi(b),U=Number.isFinite(_)?_:o.distanceMeters,P=f||(r.direct!==!0&&Number.isFinite(U)?fa(U,ba):"");return!E&&!P?"":`
      <div class="mhd-distance">
        ${E?`<span>${re("nav","mhd-icon--sm")}${N(E)}</span>`:""}
        ${P?`<span>${re("clock","mhd-icon--sm")}${N(P)}</span>`:""}
      </div>
    `}const u=pa(o.distanceMeters);if(!u)return"";const a=fa(o.distanceMeters,ba);return`
    <div class="mhd-distance">
      <span>${re("nav","mhd-icon--sm")}${N(u)}</span>
      ${a?`<span>${re("clock","mhd-icon--sm")}${N(a)}</span>`:""}
    </div>
  `}function yi(o={},{nearestPlaceId:r="",imageUrlFn:u=null}={}){const a=dn.find(_=>_.key===o.category)?.label||"",b=o.id&&o.id===r?"Më afër hotelit":a,f=V(o.coverImageUrl),E=f&&typeof u=="function"&&V(u(f))||f;return`
    <article class="mhd-card">
      <div class="mhd-photo">
        ${E?`<img src="${N(E)}" alt="${N(o.name)}" loading="lazy" decoding="async" />`:""}
        ${b?`<span class="mhd-pill mhd-pill--overlay ${o.id===r?"mhd-pill--accent":""}">${N(b)}</span>`:""}
      </div>
      <div class="mhd-card-body">
        <h3>${N(o.name)}</h3>
        ${wi(o)}
        ${o.description?`<p class="mhd-copy">${N(o.description)}</p>`:""}
      </div>
    </article>
  `}function va({template:o=null,overrides:r={},hotelCoords:u=null,imageUrlFn:a=null,manualBeachDistance:b=null}={}){if(!o||!Array.isArray(o.places)||!o.places.length)return"";const f=an({places:o.places,overrides:r,hotelCoords:St(u)?u:null});if(!f.length)return"";const E=f.filter(B=>Number.isFinite(B.distanceMeters)).sort((B,Q)=>B.distanceMeters-Q.distanceMeters)[0]||null,_=gi(f),U=b&&typeof b=="object"?b:null,P=U?U.direct===!0?"Në plazh":V(U.label):"",S=U?V(U.timeLabel):"";if(P||S){const B=_.find(Q=>Q.key==="beach");B?.places?.length&&(B.places[0]={...B.places[0],manualDistance:{label:P,direct:U.direct===!0,timeLabel:S}})}return _.map(B=>`
    <section class="mhd-section">
      ${Oe({iconName:hi[B.key]||"pin",eyebrow:je[B.key]||"",title:rn[B.key]||B.label})}
      <div class="mhd-rail">
        ${B.places.map(Q=>yi(Q,{nearestPlaceId:E?.id||"",imageUrlFn:a})).join("")}
      </div>
    </section>
  `).join("")}function $t(){return`
    <section class="mhd-section">
      <div class="mhd-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>
  `}function $i(){return`
    <div class="mhd">
      ${$t()}
      ${$t()}
      ${$t()}
    </div>
  `}function ki(o={},r="€"){const u=V(o.priceLabel||o.priceText);if(u)return u;const a=Number(o.price??o.startingPrice??o.pricePerNight);if(!Number.isFinite(a)||a<=0)return"";const b=V(o.currency||o.currencyCode)||r;return b==="€"||b.toUpperCase()==="EUR"?`€${a}`:`${a} ${b}`}function Si(o=[]){const r=(Array.isArray(o)?o:[]).filter(u=>V(u?.label));return r.length?`
    <div class="mhd-distance">
      ${r.map(u=>`<span>${re(u.icon||"check","mhd-icon--sm")}${N(u.label)}</span>`).join("")}
    </div>
  `:""}function xa(o=[]){return(Array.isArray(o)?o:[]).filter(r=>r&&r.active!==!1&&V(r.title))}function Ii({rooms:o=[],offers:r=[],staySection:u="",imageUrlFn:a=null}={}){const b=xa(o),f=xa(r),_=jr({preferred:u,roomsCount:b.length,offersCount:f.length})===$a,U=_?f:b.length?b:f,P=_||!b.length?"offer":"room";return U.length?`
    <section class="mhd-section">
      ${Oe({iconName:_?"sparkles":"bed",eyebrow:_?je.offers:je.rooms,title:_?"Oferta":"Dhoma"})}
      <div class="mhd-rail">
        ${U.map(S=>{const B=Ar(S),Q=B[0]||"",le=Q&&typeof a=="function"&&V(a(Q))||Q,ce=ki(S),Ue=V(S.priceSuffix)||"/ natë";return`
            <article class="mhd-card">
              <div class="mhd-photo">
                ${le?`<img src="${N(le)}" alt="${N(S.title)}" loading="lazy" decoding="async" />`:""}
                ${V(S.tag||S.badge)?`<span class="mhd-pill mhd-pill--overlay mhd-pill--accent">${N(S.tag||S.badge)}</span>`:""}
                ${B.length>1?`<span class="mhd-photo-count">${B.length} foto</span>`:""}
              </div>
              <div class="mhd-card-body">
                <div class="mhd-heading-price">
                  <h3>${N(S.title)}</h3>
                  ${ce?`<span class="mhd-price"><strong>${N(ce)}</strong><small>${N(Ue)}</small></span>`:""}
                </div>
                ${Si(S.metaParts)}
                ${V(S.text||S.description)?`<p class="mhd-copy">${N(S.text||S.description)}</p>`:""}
                <button type="button" class="mhd-more" data-hotel-stay-more="${N(V(S.id))}" data-hotel-stay-kind="${P}">
                  Më shumë
                  ${re("arrowRight","mhd-icon--sm")}
                </button>
              </div>
            </article>
          `}).join("")}
      </div>
    </section>
  `:""}function Ci({city:o="",address:r="",imageUrl:u="",imageUrlFn:a=null}={}){const b=V(o);if(!b)return"";const f=V(u),E=f&&typeof a=="function"&&V(a(f))||f;return`
    <section class="mhd-section">
      ${Oe({iconName:"building",eyebrow:je.city,title:rn.city})}
      <div class="mhd-rail">
        <article class="mhd-card">
          <div class="mhd-photo">
            ${E?`<img src="${N(E)}" alt="${N(b)}" loading="lazy" decoding="async" />`:""}
            <span class="mhd-pill mhd-pill--overlay">${N(rn.city)}</span>
          </div>
          <div class="mhd-card-body">
            <h3>${N(b)}</h3>
            ${V(r)?`<p class="mhd-copy">${N(r)}</p>`:""}
          </div>
        </article>
      </div>
    </section>
  `}function Pi(o=""){const r=V(o).toLowerCase();for(const u of vi)if(u.keywords.some(a=>r.includes(a)))return u.icon;return"check"}function ji({amenities:o=[]}={}){const r=(Array.isArray(o)?o:[]).map(u=>V(u)).filter(Boolean);return r.length?`
    <section class="mhd-section">
      ${Oe({iconName:"check",eyebrow:je.amenities,title:"Përfshihet"})}
      <div class="mhd-amenities">
        ${r.slice(0,12).map(u=>`
          <article class="mhd-amenity">
            <span class="mhd-amenity-icon">${re(Pi(u))}</span>
            <h3>${N(u)}</h3>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}const ln="mnyraHotelDetailMap";function Ai({address:o="",city:r="",destinationName:u="",mapsUrl:a="",hotelCoords:b=null,hotelName:f=""}={}){const E=[V(o),V(r)].filter(Boolean).join(", ")||V(u);if(!E&&!a)return"";const _=St(b),U=_?`id="${ln}" data-map-lat="${N(String(b.lat))}" data-map-lng="${N(String(b.lng))}" data-map-name="${N(V(f))}"`:"";return`
    <section class="mhd-section">
      ${Oe({iconName:"compass",eyebrow:je.map,title:"Harta e zbulimit"})}
      <div class="mhd-map-card">
        <div class="mhd-map-art ${_?"mhd-map-art--live":""}" ${U}>
          <div class="mhd-map-water"></div>
          <span class="mhd-map-pin">${re("bed")}</span>
        </div>
        <div class="mhd-map-info">
          <div class="mhd-address">
            <span>${re("pin")}</span>
            <div>
              <small>Lokacioni</small>
              <strong>${N(E||"Hotel")}</strong>
              ${V(u)?`<p>Plazhi, qyteti dhe vendet kryesore rreth ${N(u)}.</p>`:""}
            </div>
          </div>
          ${a?`<a class="mhd-primary" href="${N(a)}" target="_blank" rel="noopener noreferrer">${re("expand","mhd-icon--sm")}Hap hartën</a>`:""}
        </div>
      </div>
    </section>
  `}function Ti({rating:o="",reviewCount:r="",summary:u=""}={}){const a=Number(V(o).replace(",","."));if(!Number.isFinite(a)||a<=0)return"";const b=Math.max(1,Math.min(5,Math.round(a))),f=Array.from({length:b}).map(()=>`<svg class="mhd-icon mhd-star" viewBox="0 0 24 24" aria-hidden="true">${on.star}</svg>`).join(""),E=V(r);return`
    <section class="mhd-section">
      ${Oe({iconName:"star",eyebrow:je.rating,title:"Vlerësimet"})}
      <div class="mhd-rating">
        <div class="mhd-score">
          <strong>${N(a.toFixed(1))}</strong>
          <div>
            <div class="mhd-stars">${f}</div>
            <p>${N([u,E?`${E} vlerësime`:""].filter(Boolean).join(" · ")||"Nga vizitorët")}</p>
          </div>
        </div>
      </div>
    </section>
  `}function Li({rooms:o=[],offers:r=[],staySection:u="",amenities:a=[],address:b="",city:f="",cityImageUrl:E="",destinationId:_="",destinationName:U="",destinationSectionsHtml:P="",mapsUrl:S="",hotelCoords:B=null,hotelName:Q="",rating:le="",reviewCount:ce="",ratingSummary:Ue="",imageUrlFn:$e=null}={}){const Xe=!!V(_),Ze=P||(Xe?$t():"");return`
    <div class="mhd">
      ${Ii({rooms:o,offers:r,staySection:u,imageUrlFn:$e})}
      ${ji({amenities:a})}
      <div id="${sn}" data-destination-id="${N(_)}" style="display:contents">
        ${Ze}
      </div>
      ${Xe?"":Ci({city:f,address:b,imageUrl:E,imageUrlFn:$e})}
      ${Ai({address:b,city:f,destinationName:U,mapsUrl:S,hotelCoords:B,hotelName:Q})}
      ${Ti({rating:le,reviewCount:ce,summary:Ue})}
    </div>
  `}function Pe(o=""){return o==null?"":String(o).trim()}function ee(o=""){return Pe(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ze({id:o="",label:r="",value:u="",placeholder:a="",type:b="text",inputmode:f=""}={}){return`
    <label class="block">
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${ee(r)}</span>
      <input id="${ee(o)}" name="${ee(o)}" type="${ee(b)}" value="${ee(u)}" placeholder="${ee(a)}" ${f?`inputmode="${ee(f)}"`:""} class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
    </label>
  `}function Mi(o={},{imagePreviews:r=[]}={}){const u=ee(o.id),a=Array.isArray(o.images)?o.images.map(Pe).filter(Boolean):[],b=(Array.isArray(r)?r:[]).map(Pe),f=a.length+b.length,E=(_,U,P)=>`
    <div class="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-100 shrink-0">
      ${_?`<img src="${ee(_)}" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover" />`:'<span class="w-full h-full flex items-center justify-center text-[8px] font-black text-slate-300 uppercase">Foto</span>'}
      ${U===0&&P==="existing"?'<span class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/70 text-white text-[8px] font-black uppercase">Kryesore</span>':""}
      <button type="button" data-hotel-room-image-remove="${u}" data-hotel-room-image-index="${U}" data-hotel-room-image-source="${P}" class="absolute top-1 right-1 w-6 h-6 rounded-lg bg-white/90 text-slate-500 flex items-center justify-center text-[10px] font-black shadow" aria-label="Hiq foton">✕</button>
    </div>
  `;return`
    <div class="space-y-3">
      ${f?`
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          ${a.map((_,U)=>E(_,U,"existing")).join("")}
          ${b.map((_,U)=>E(_,U,"new")).join("")}
        </div>
      `:""}
      <div class="flex items-center gap-3">
        <input type="file" id="hotelRoomImageInput_${u}" data-hotel-room-image-input="${u}" accept="image/*" multiple hidden />
        <button type="button" data-hotel-room-image-trigger="${u}" class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform" ${f>=ca?"disabled":""}>
          ${f?"Shto foto":"Ngarko foto"}
        </button>
        <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">${f} / ${ca}</span>
      </div>
      <input type="hidden" id="hotelRoomImagesData_${u}" value="${ee(a.join(`
`))}" />
    </div>
  `}function _i(o={},{imagePreviews:r=[]}={}){const u=ee(o.id);return`
    <div data-hotel-room-row="${u}" class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">${ee(o.title||"Dhomë e re")}</p>
        <button type="button" data-hotel-room-remove="${u}" class="w-9 h-9 rounded-xl bg-white text-slate-400 border border-slate-100 flex items-center justify-center text-xs font-black" aria-label="Fshi dhomën">✕</button>
      </div>
      ${Mi(o,{imagePreviews:r})}
      <div class="grid grid-cols-2 gap-3">
        ${ze({id:`hotelRoomTitle_${u}`,label:"Emri i dhomës",value:o.title,placeholder:"Dhomë Deluxe me pamje nga deti"})}
        ${ze({id:`hotelRoomPrice_${u}`,label:"Çmimi / natë (€)",value:o.price==null?"":String(o.price),placeholder:"118",inputmode:"decimal"})}
        ${ze({id:`hotelRoomPersons_${u}`,label:"Persona",value:o.persons==null?"":String(o.persons),placeholder:"2",inputmode:"numeric"})}
        ${ze({id:`hotelRoomBeds_${u}`,label:"Krevate",value:o.beds,placeholder:"1 king"})}
        ${ze({id:`hotelRoomSize_${u}`,label:"Madhësia (m²)",value:o.size==null?"":String(o.size),placeholder:"31",inputmode:"numeric"})}
        ${ze({id:`hotelRoomTag_${u}`,label:"Etiketa (opsionale)",value:o.tag,placeholder:"Më e zgjedhura"})}
      </div>
      <label class="block">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Përshkrimi (opsional)</span>
        <textarea id="hotelRoomDesc_${u}" name="hotelRoomDesc_${u}" rows="2" placeholder="Detaje të shkurtra për dhomën..." class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${ee(o.description)}</textarea>
      </label>
      <label class="flex items-center justify-between gap-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktive në profil</span>
        <input id="hotelRoomActive_${u}" type="checkbox" ${o.active!==!1?"checked":""} class="w-5 h-5 accent-slate-900" />
      </label>
    </div>
  `}function Fi({staySection:o="",hasOffers:r=!1}={}){const u=ka(o),a=(b,f,E=!1)=>`
      <button type="button" data-hotel-stay-section-choice="${b}" ${E?"disabled":""} class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${u===b?"bg-slate-900 text-white shadow":"bg-white text-slate-500 border border-slate-100"} ${E?"opacity-40":"active:scale-95"}">
        ${ee(f)}
      </button>
    `;return`
    <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
      <div>
        <p class="text-xs font-black text-slate-800">Seksioni te detajet</p>
        <p class="text-[10px] font-bold text-slate-400">Zgjidh çka shfaqet te detajet e hotelit: Dhomat ose Oferta.</p>
      </div>
      <div class="flex gap-2">
        ${a(Tr,"Dhomat")}
        ${a($a,"Oferta",!r)}
      </div>
      ${r?"":'<p class="text-[9px] font-black uppercase tracking-widest text-slate-300">Shto së pari një Oferta për ta zgjedhur</p>'}
    </div>
  `}function Ei({restaurantId:o="",record:r={},editorState:u={},hasOffers:a=!1}={}){const b=Pe(o);if(!b)return"";const f=Pe(u.restaurantId)===b,E=f&&Array.isArray(u.rooms)?la(u.rooms):la(r?.hotelRooms),_=f&&u.imagePreviews&&typeof u.imagePreviews=="object"?u.imagePreviews:{},U=f&&u.saving===!0,P=f?Pe(u.status):"",S=f&&Pe(u.staySection)?u.staySection:r?.hotelStaySection;return`
    <div data-hotel-rooms-editor="${ee(b)}" class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
          <h3 class="text-xl font-black italic tracking-tighter">Dhomat</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dhomat shfaqen te detajet e hotelit</p>
        </div>
        <button type="button" id="hotelRoomAddBtn" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95 text-lg font-black" aria-label="Shto dhomë">+</button>
      </div>
      ${Fi({staySection:S,hasOffers:a})}
      ${E.length?`<div class="space-y-4">${E.map(B=>_i(B,{imagePreviews:_[B.id]})).join("")}</div>`:'<p class="text-sm font-bold text-slate-400">Ende pa dhoma. Shto dhomën e parë me +.</p>'}
      ${P?`<p class="text-[10px] font-black uppercase tracking-widest ${P.includes("ruajt")?"text-emerald-600":"text-slate-500"}">${ee(P)}</p>`:""}
      <button id="hotelRoomsSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${U?"disabled":""}>
        ${U?"Po ruhen...":"Ruaj Dhomat"}
      </button>
    </div>
  `}const Ri=Object.freeze({apiKey:"AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",authDomain:"menyra-c0e68.firebaseapp.com",projectId:"menyra-c0e68",storageBucket:"menyra-c0e68.firebasestorage.app",messagingSenderId:"528471049588",appId:"1:528471049588:web:c507d87c0832562a855821",measurementId:"G-YLFKC8726B"});function zi(){try{const o=String(globalThis?.location?.hostname||"").trim().toLowerCase();if(!["localhost","127.0.0.1","::1"].includes(o))return null;const r=globalThis?.__MENYRA_FIREBASE_EMULATORS__,u=r&&typeof r=="object"?r:{},a=new URLSearchParams(globalThis?.location?.search||"").get("firebase-emulator")==="1";if(u.enabled!==!0&&!a)return null;const b=String(u.projectId||"mnyra-local").trim();return/^(mnyra-local|demo-|test-|local-)/.test(b)?Object.freeze({projectId:b,host:String(u.host||"127.0.0.1").trim()||"127.0.0.1",firestorePort:Math.max(1,Number(u.firestorePort||8080)||8080),authPort:Math.max(1,Number(u.authPort||9099)||9099),functionsPort:Math.max(1,Number(u.functionsPort||5001)||5001)}):null}catch{return null}}const me=zi(),nn=Object.freeze(me?{apiKey:"mnyra-local-api-key",authDomain:`${me.projectId}.firebaseapp.com`,projectId:me.projectId,storageBucket:`${me.projectId}.appspot.com`,messagingSenderId:"000000000000",appId:"1:000000000000:web:mnyra-local"}:Ri),wa=new WeakSet,ya=new WeakSet;function Ni({firestore:o=null,authInstance:r=null}={}){return me?(o&&!wa.has(o)&&(Kr(o,me.host,me.firestorePort),wa.add(o)),r&&!ya.has(r)&&(qr(r,`http://${me.host}:${me.authPort}`,{disableWarnings:!0}),ya.add(r)),!0):!1}function Di(){try{const o=Br();if(o?.options?.projectId===nn.projectId&&o?.options?.appId===nn.appId)return o}catch{}return Vr(nn)}const It=Di();function Oi(){try{return globalThis?.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__===!0}catch{return!1}}let Ct;try{const o=Oi();Ct=_r(It,{experimentalAutoDetectLongPolling:!0,localCache:o?Fr():Er({tabManager:Rr()})});try{globalThis.__MENYRA_FIRESTORE_LOCAL_CACHE_KIND__=o?"memory-public-website":"persistent-multitab"}catch{}}catch{Ct=zr(It)}let cn;try{cn=Nr(It,{persistence:[Dr,Or,Ur]})}catch{cn=Hr(It)}Ni({firestore:Ct,authInstance:cn});const Ui="destinationsPublic",Ca="menyra_social_destination_public_cache_v1::",Hi=360*60*1e3,kt=new Map,yt=new Map;function De(o=""){return o==null?"":String(o).trim()}function Pa(o="",r={}){const u=r&&typeof r=="object"?r:{},a=Array.isArray(u.places)?u.places:[];return a.length?{id:De(o),name:De(u.name),slug:De(u.slug),description:De(u.description),version:Math.max(0,Number(u.version)||0),places:a}:null}function Bi(o=""){try{const r=localStorage.getItem(`${Ca}${o}`);if(!r)return null;const u=JSON.parse(r);return!u||typeof u!="object"||Date.now()-Number(u.storedAt||0)>Hi?null:Pa(o,u.data)}catch{return null}}function Vi(o="",r=null){try{localStorage.setItem(`${Ca}${o}`,JSON.stringify({storedAt:Date.now(),data:r}))}catch{}}function ja(o=""){const r=De(o);if(!r)return null;if(kt.has(r))return kt.get(r);const u=Bi(r);return u&&kt.set(r,u),u}async function Ki(o=""){const r=De(o);if(!r)return null;const u=ja(r);if(u)return u;if(yt.has(r))return yt.get(r);const a=(async()=>{try{const b=await Gr(Yr(Ct,Ui,r)),f=b.exists()?Pa(r,b.data()||{}):null;return kt.set(r,f),f&&Vi(r,b.data()||{}),f}catch{return null}finally{yt.delete(r)}})();return yt.set(r,a),a}function ao(o={}){const r=o.state,u=o.resolvePostCountsFn,a=o.escapeHtmlFn,b=o.getOptimizedImageUrlFn,f=o.iconFn,E=o.isLocalBusinessProfileFn,_=typeof o.isCeoUserFn=="function"?o.isCeoUserFn:(()=>!1),U=o.normalizeHandleFn,P=o.logoFitClassFn,S=o.formatCountFn,B=o.renderProfileShopCartViewFn,Q=o.renderProfileShopFavoritesViewFn,le=typeof o.ensurePostsDataForProfileFn=="function"?o.ensurePostsDataForProfileFn:(()=>{}),ce=o.ensureMenuDataForProfileFn,Ue=typeof o.ensureEditorMenuDataForProfileFn=="function"?o.ensureEditorMenuDataForProfileFn:(()=>{}),$e=o.ensureFocusDataForProfileFn,Xe=typeof o.ensureAdsDataForProfileFn=="function"?o.ensureAdsDataForProfileFn:(()=>{}),Ze=o.ensureTableQrStateForProfileFn,se=o.isShopCatalogProfileFn,Aa=o.getBusinessCatalogLabelFn,Ae=o.normalizeMenuTypeFn,Ta=o.primeMenuItemCountsFn,La=typeof o.hydrateMenuCardViewerLikesFn=="function"?o.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),Ma=o.renderShopProductListFn,_a=o.getMenuLayoutThemeFn,Fa=o.menuLayoutColors,de=o.resolveMenuItemHeroFn,X=o.isPlaceholderUrlFn,Y=o.placeholderImage,Ea=o.getFirebaseStorageUrlFn,Ra=o.isDirectImageUrlFn,un=o.formatPriceFn,za=typeof o.resolveCurrencyCodeForMenuItemFn=="function"?o.resolveCurrencyCodeForMenuItemFn:(()=>""),pn=o.getMenuItemImagesFn,te=o.getMenuItemObjectPositionFn,et=o.getMenuItemSocialIdFn,fn=o.menuItemMetaKeyFn,mn=o.ensureMenuItemMetaFn,gn=o.resolveMenuItemCountsFn,He=o.getFocusStateForRestaurantFn,Na=typeof o.getAdsStateForRestaurantFn=="function"?o.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),tt=o.getTableQrStateForRestaurantFn,Te=o.getFocusItemObjectPositionFn,Pt=o.getFocusCardClassFn,Da=o.getFocusIndexFn,ke=o.isRestaurantCafeProfileFn,jt=typeof o.getBusinessProfileTypeFn=="function"?o.getBusinessProfileTypeFn:(()=>""),ue=o.getRestaurantMetaByIdFn,Oa=o.buildUrlFn,Ua=o.normalizeSearchKeyFn,Ha=o.normalizeFollowHandleFn,ge={key:"",inFlightKey:""},bn=new Set,nt=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},Ba=({profile:e=null,routePayload:t=null,surface:n=null,decision:s=null}={})=>{if(!nt())return;const l=n&&typeof n=="object"?n:{},i=l.menu&&typeof l.menu=="object"?l.menu:{},c=e&&typeof e=="object"?e:{},d=t&&typeof t=="object"?t:{},p=d?.businessSnapshot?.identity||d?.identity||{},g=String(l.authoritativeRestaurantId||l.restaurantId||i.restaurantId||"").trim(),m=String(c.publicSlug||c.landingSlug||c.handle||p.publicSlug||p.landingSlug||p.handle||"").trim(),h=`${g||"pending"}::${m||"no-slug"}`;if(bn.has(h))return;bn.add(h);const v=Array.isArray(i.items)?i.items:[],w=new Set(v.map(k=>String(k?.category||"").trim()).filter(Boolean)).size,C=String(i.rawTruthState||i.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:g,slug:m,itemsLength:v.length,categoriesLength:w,menuStatus:String(i.status||"loading"),truthState:C,isLoading:s?.isLoading===!0,isHydrating:i.hydrating===!0||C.toLowerCase()==="hydrating",confirmedEmpty:i.confirmedEmpty===!0,canRenderItems:i.canRenderItems===!0,shouldRenderNoProducts:s?.shouldRenderNoProducts===!0,source:String(i.source||"")})},Va=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},At=(e="")=>a(String(e||"")),Le=(e="")=>a(String(e??"")),ie=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:n=""}={})=>{if(!nt())return"";const s=[e?`data-debug-renderer="${At(e)}"`:"",t?`data-debug-skeleton="${At(t)}"`:"",n?`data-debug-source="${At(n)}"`:""].filter(Boolean);return s.length?` ${s.join(" ")}`:""},Ka=(e={},t=[])=>{const n=Cr(e,t);return` ${[`data-menu-state="${Le(n.menuState)}"`,`data-menu-item-count="${Le(n.menuItemCount)}"`,`data-focus-state="${Le(n.focusState)}"`,`data-focus-business-id="${Le(n.focusBusinessId)}"`,`data-focus-item-count="${Le(n.focusItemCount)}"`,`data-focus-source="${Le(n.focusSource)}"`,`data-focus-stale="${n.focusStale?"true":"false"}"`].join(" ")}`},hn=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:n=null,routePayload:s=null,surface:l=null,decision:i=null,items:c=null,rawItems:d=null,filteredItems:p=null,renderDecision:g="",source:m=""}={})=>{const h=l&&typeof l=="object"?l:{},v=h.menu&&typeof h.menu=="object"?h.menu:{},w=h.focus&&typeof h.focus=="object"?h.focus:{},C=n&&typeof n=="object"?n:r?.profileView?.profile&&typeof r.profileView.profile=="object"?r.profileView.profile:{},k=s&&typeof s=="object"?s:r?.profileView?.routePayload&&typeof r.profileView.routePayload=="object"?r.profileView.routePayload:{},A=k?.businessSnapshot&&typeof k.businessSnapshot=="object"?k.businessSnapshot:{},L=A?.identity&&typeof A.identity=="object"?A.identity:k?.identity&&typeof k.identity=="object"?k.identity:{},y=r?.__webDirectEntry&&typeof r.__webDirectEntry=="object"?r.__webDirectEntry:{},T=String(C.publicSlug||C.landingSlug||C.handle||L.publicSlug||L.landingSlug||L.handle||y.publicSlug||"").trim(),j=String(C.restaurantId||k.restaurantId||y.restaurantId||"").trim(),F=String(C.canonicalRestaurantId||k.canonicalRestaurantId||h.authoritativeRestaurantId||y.canonicalRestaurantId||A.restaurantId||"").trim();let z="";C.canonicalRestaurantId?z="profile.canonicalRestaurantId":k.canonicalRestaurantId?z="routePayload.canonicalRestaurantId":h.authoritativeRestaurantId?z="surface.authoritativeRestaurantId":y.canonicalRestaurantId?z="webDirectEntry.canonicalRestaurantId":A.restaurantId?z="routeSnapshot.restaurantId":C.restaurantId?z="profile.restaurantId":k.restaurantId?z="routePayload.restaurantId":y.restaurantId&&(z="webDirectEntry.restaurantId");const I=String(F||h.restaurantId||v.restaurantId||j||"").trim(),D=Array.isArray(d)?d:Array.isArray(v.items)?v.items:[],O=Array.isArray(c)?c:D,K=Array.isArray(p)?p:O,$=new Set(K.map(Se=>String(Se?.category||"").trim()).filter(Boolean)).size,R=String(v.status||(i?.isLoading?"loading":"")||"").trim(),H=String(v.rawTruthState||v.truthState||"").trim(),q=v.confirmedEmpty===!0||i?.confirmedEmpty===!0,G=i?.hasError===!0||R==="error"||!!String(v.error||"").trim(),ne=!(K.length>0||i?.hasItems===!0)&&!q&&!G,ae=F||j||I||"";return{component:e,functionName:t,slug:T,businessId:I,requestedRestaurantId:j,canonicalRestaurantId:F,restaurantIdSource:z,menuReadPath:ae?`restaurants/${ae}/public/menu`:"",activeTab:String(r?.activeTab||"").trim(),profileTopTab:String(r?.profileTopTab||"").trim(),profileContentTab:String(r?.profileContentTab||"").trim(),itemsLength:O.length,rawItemsLength:D.length,filteredItemsLength:K.length,categoriesLength:$,focusItemsLength:Array.isArray(w.items)?w.items.length:0,loading:v.loading===!0||i?.isLoading===!0||R==="loading",pending:ne,hydrating:v.hydrating===!0||H.toLowerCase()==="hydrating",status:R,truthState:H,confirmedEmpty:q,canRenderItems:v.canRenderItems===!0,renderDecision:g||(i?.shouldRenderNoProducts?"no-products":i?.isLoading?"loading":""),source:m||String(v.source||""),buildToken:Va()}},at=(e={})=>{nt()&&console.warn("[mnyra:no-products-render]",{...hn(e),stack:new Error().stack})},st=(e="",t={})=>{nt()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...hn({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},x=(e,t=e,n={})=>Ir(e,{fallback:t,params:n}),qa=(e="")=>{const t=String(e||"").trim();if(!t)return x("nav.menu","Menue");const n=t.toLowerCase();return n==="menue"||n==="menu"||n==="menü"?x("nav.menu",t):n==="shop"?"Shop":t},vn=(e="")=>{const t=String(e||"").trim();if(!t)return"";const n=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(n)?x("menu.products","Produkte"):t},Ga=(e="food",t=!1)=>t?x("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?x("menu.drinks","Getraenke"):x("menu.food","Speisen"),xn=(e={},t=!1)=>{const n=Ae(e?.type||"food");return t?x("menu.product","Produkt"):n==="drink"?x("menu.drinkItem","Pije"):x("menu.foodItem","Speise")},Tt=(e="",t="#111827")=>{const n=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(n)?n:t};function Ya(e=null,t=null){return Qe(r,{profile:e,routePayload:t,webDirectEntry:r?.__webDirectEntry}).restaurantId}function wn(e=null,t=""){if(!e||typeof e!="object")return e;const n=String(t||"").trim();if(!n)return e;const s=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===n&&s?e:{...e,restaurantId:n,...s?{canonicalRestaurantId:s}:{}}}function Wa(e=""){const t=String(e||"").trim();return t?Qe(r,{profile:r?.profileView?.profile||r?.userProfile,routePayload:r?.profileView?.routePayload,webDirectEntry:r?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function Be(e={}){const t=String(za(e)||"").trim();return t?un(e?.price,t):un(e?.price)}function Qa(e=[],t="",n=""){const s=String(t||"").trim(),l=String(n||"").trim();if(!s||!l)return"";const i=Array.isArray(e)?e:[];if(!i.length)return`${s}|${l}|empty`;const c=[];return i.forEach(d=>{const p=String(et(d)||d?.id||"").trim();p&&c.push(p)}),c.length?(c.sort(),`${s}|${l}|${c.join(",")}`):`${s}|${l}|empty`}function Ja(e=[],t=""){const n=String(r.user?.uid||"").trim(),s=Qa(e,t,n);s&&ge.inFlightKey!==s&&ge.key!==s&&(ge.key=s,ge.inFlightKey=s,La(e,t).catch(l=>{console.error(l),ge.key===s&&(ge.key="")}).finally(()=>{ge.inFlightKey===s&&(ge.inFlightKey="")}))}function Xa(e={}){const t=String(e?.uid||"").trim();if(t&&r.followingTargetIds.includes(t))return!0;const n=String(e?.restaurantId||"").trim();if(n&&r.followingTargetIds.includes(n))return!0;const s=Ha(e?.handle||"");return!!(s&&r.followingHandles.includes(s))}function yn(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const n=typeof ue=="function"&&ue(t)||null;return n?.specialEnabled===!0?!0:(n?.specialEnabled===!1,!1)}function Za(e={}){return xe(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function $n(e,t,n=!0,{includeImageKey:s=!0}={}){const l=u(e),i=e.id?String(e.id):"",c=i?`data-open-post="${a(i)}"`:"",d=i?`data-post-like-count="${a(i)}"`:"",p=i?`data-post-comment-count="${a(i)}"`:"",g=s&&i?`data-img-key="profile-post:${a(i)}"`:"",m=e.type==="wide"||e.type==="hero",h=t&&m?"col-span-2":"",v=t&&m?"aspect-[1.8/1]":"aspect-[4/5]",w=m?800:400,C=m?400:500,k=String(e.posterUrl||e.thumbUrl||e.poster||"").trim(),A=e.isVideo===!0,L=A&&k?k:e.url,y=b(L,m?"large":"medium",{stableKey:i?`profile-post:${i}`:"",variantGroup:"post-detail"}),T=String(e.url||"").trim(),j=T&&!T.includes("#")?`${T}#t=0.001`:T,F=A&&!k&&T?`<video src="${a(j)}" preload="metadata" muted playsinline webkit-playsinline width="${w}" height="${C}" ${g} class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${a(y)}" loading="lazy" decoding="async" width="${w}" height="${C}" ${g} class="w-full h-full object-cover" />`,z=i&&n?`
        <button type="button" data-profile-menu-button="${a(i)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${f("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${a(i)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${a(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${f(m?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${m?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${a(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${f("trash-2","w-3.5 h-3.5")}
            Fshi
          </button>
        </div>
      `:"";return kr({colClass:h,aspectClass:v,cardAttrs:c,mediaHtml:F,isVideo:!!e.isVideo,playIconHtml:f("play","w-3.5 h-3.5 fill-white block"),likeLabel:l.likeLabel,commentLabel:l.commentLabel,likeAttrs:d,commentAttrs:p,heartIconHtml:f("heart","w-3 h-3 fill-rose-500 text-rose-500"),commentIconHtml:f("message-circle","w-3 h-3 text-indigo-200"),menuHtml:z,escapeHtmlFn:a})}function Lt(e,t,n=!0,{includeImageKeys:s=!0}={}){const l=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${f("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(x("profile.noContent","Nuk u gjet permbajtje"))}</p>
      </div>
    `;const i=e.map(d=>$n(d,l,n,{includeImageKey:s})),c=e.reduce((d,p)=>{const g=p?.type==="wide"||p?.type==="hero";return d+(g?2:1)},0);return l&&c%2===1&&i.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),i.join("")}function Mt(){const e=r.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const n=b(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${a(n)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${a(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${f("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${a(t.city||"Qyteti")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${f("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${f("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(x("profile.noCheckins","Nuk u gjeten check-ins"))}</p>
      </div>
    `}function Me(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}let be=null;function kn(){if(be)return be;if(typeof localStorage>"u")return be={},be;try{const e=localStorage.getItem(ua),t=e?JSON.parse(e):{};be=t&&typeof t=="object"?t:{}}catch{be={}}return be}function _t(e={},t=""){const n=da(e);if(!n.length)return;const{store:s,changed:l}=Zr(kn(),n,t);if(l&&(be=s,!(typeof localStorage>"u")))try{localStorage.setItem(ua,JSON.stringify(s))}catch{}}const es=new Set(["feed","search","discover","map","location","user","waiter","wr","leads","admin","ceo","owner","staff","kitchen","profile","menu","details","detail","detajet","orders","notifications","settings","upload","customers","business-accounts","businessaccounts","chat","social","heart","hub","apps","api","shared","assets","_shared","core","login","register","post","posts","story","stories","manifest","sw","favicon","robots","sitemap","b","lp"]);function Ft(){try{const t=String(globalThis?.location?.pathname||"").replace(/^\/+|\/+$/g,"").split("/").filter(Boolean);let n=String(t[0]||"").trim();try{n=decodeURIComponent(n)}catch{}return n=n.trim().toLowerCase(),!n||n.includes(".")||es.has(n)?"":n}catch{return""}}function rt(e={}){const t=String(jt(e)||"").trim().toLowerCase();return t?(_t(e,t),t):Wr("",Qr(kn(),da(e,{extraSlugs:[Ft()]})))}function ts(e={}){try{const t=String(globalThis?.location?.pathname||"");return Jr(t)?Xr(e,Ft()):!1}catch{return!1}}function Ve(e={}){const t=rt(e);if(t==="hotel"||t==="motel")return!0;if(t)return!1;if(ts(e))return!0;const n=_e(e);return en(n).length>0||!!String(n.destinationId||"").trim()?(_t(e,"hotel"),!0):!1}function _e(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),n=t?ue(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{}}}function ns(e={},t=""){const n=e&&typeof e=="object"?e:{},s=String(n.id||n._id||n.offerId||n.menuItemId||t||"offer").trim();return{...n,id:s,menuItemId:String(n.menuItemId||n.targetMenuItemId||n.itemId||n.targetItemId||"").trim(),title:n.title||n.name||"Oferta",text:n.text||n.desc||n.description||"",imageUrl:n.imageUrl||n.image||n.photoUrl||"",active:n.active!==!1}}function Sn(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],n=new Set;return t.map((s,l)=>ns(s,`offer_${l}`)).filter(s=>{const l=String(s.id||`${s.title}|${s.text}|${s.imageUrl}`).trim();return!l||n.has(l)?!1:(n.add(l),!0)})}function as(e={}){const t=_e(e),n=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!n)return!1;const s=r.focus&&typeof r.focus=="object"?r.focus:{},l=String(s.restaurantId||"").trim()===n,i=String(s.truthSource||"").trim().toLowerCase();if(l&&i==="public-menu"||(l&&Array.isArray(s.items)?s.items:[]).length)return!1;const d=Sn(t);return d.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(r.focus={...s,restaurantId:n,items:d,enabled:s.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:d.length?"seeded":"knownEmpty"},!0):!1}function ss(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const n of t){if(!n||typeof n!="object")continue;const s=Number(n.lat??n.latitude),l=Number(n.lng??n.lon??n.longitude);if(Number.isFinite(s)&&Number.isFinite(l))return{lat:s,lng:l}}return null}function Z(e={},t=[]){for(const n of t){const s=String(e?.[n]||"").trim();if(s)return s}return""}function it(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function rs(e={}){const t=[...it(e.coverImages),...it(e.hotelCoverImages),...it(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(s=>String(s||"").trim()).filter(Boolean),n=[];return t.forEach(s=>{n.includes(s)||n.push(s)}),n.slice(0,8)}function is(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function os(e=""){const t=String(e||"").trim(),n=r.hotelCardEditor&&typeof r.hotelCardEditor=="object"?r.hotelCardEditor:{},s=String(n.restaurantId||"").trim();return s?s===t?n:{}:is(n)?{}:n}function ls(e={}){const t=Array.isArray(e.features)?e.features.map(s=>String(s||"").trim()).filter(Boolean):[],n=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[Z(e,["hotelFeatureOneText","gardenTerraceText"])||String(n.gardenTerrace||"").trim()||t[0]||"",Z(e,["hotelFeatureTwoText","accessibilityText"])||String(n.accessibility||"").trim()||t[1]||"",Z(e,["hotelFeatureThreeText","veganOptionsText"])||String(n.veganOptions||"").trim()||t[2]||""]}function In(e={}){const t=[],n=(s="")=>{const l=String(s||"").trim();l&&!t.includes(l)&&t.push(l)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(s=>{Array.isArray(s)&&s.forEach(l=>{typeof l=="string"?n(l):l&&typeof l=="object"&&n(l.label||l.name||l.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&n("Në plazh"),(e.restaurant||e.hasRestaurant)&&n("Restaurant"),(e.breakfast||e.breakfastIncluded)&&n("Mëngjes"),(e.pool||e.hasPool)&&n("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&n("WLAN"),(e.parking||e.freeParking||e.hasParking)&&n("Parking"),(e.spa||e.wellness)&&n("Wellness"),t.slice(0,8)}const cs=[{value:"m",label:"m"},{value:"km",label:"km"}],ds="Në qendër",us="Në plazh",ps=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],fs=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],ms=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function he(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function gs(e="",{direct:t=!1}={}){const n=String(e||"").trim(),s=he(n),l=t||s==="ne_qender"||s==="ne_plazh"||s==="direkt_ne_qender"||s==="direkt_ne_plazh"||s.includes("direkt")&&(s.includes("strand")||s.includes("zentrum")||s.includes("center"))||s.includes("am_strand")||s.includes("im_zentrum"),i=n.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),c=i?i[1].replace(",","."):"",p=(i?String(i[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:c,unit:p,isDirect:l}}function Cn({idPrefix:e="",iconName:t="navigation",label:n="",value:s="",directLabel:l="",direct:i=!1,withTime:c=!1,timeMinutes:d=0}={}){const p=gs(s,{direct:i}),g=Number(d),m=Number.isFinite(g)&&g>0?String(Math.round(g)):"";return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${f(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(l)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${a(e)}Value" type="number" min="0" step="0.1" value="${a(p.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${a(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${cs.map(h=>`<option value="${a(h.value)}" ${p.unit===h.value?"selected":""}>${a(h.label)}</option>`).join("")}
        </select>
      </div>
      ${c?`
      <div>
        <label class="text-[10px] font-black text-slate-400 uppercase ml-2" for="${a(e)}Time">Koha në këmbë (min)</label>
        <input id="${a(e)}Time" type="number" min="0" step="1" value="${a(m)}" placeholder="4" inputmode="numeric" class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
      </div>
      `:""}
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${a(l)}</span>
        <input id="${a(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${p.isDirect?"checked":""} />
      </label>
    </div>
  `}function bs(e=[],t=""){const n=String(t||"").trim(),s=new Set(e.map(he));return`
    <option value="">Zgjidh</option>
    ${e.map(l=>`<option value="${a(l)}" ${he(l)===he(n)?"selected":""}>${a(l)}</option>`).join("")}
    ${n&&!s.has(he(n))?`<option value="${a(n)}" selected>Aktuale: ${a(n)}</option>`:""}
  `}function Et({id:e="",iconName:t="badge-check",label:n="",value:s="",options:l=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${f(t,"w-4 h-4")}
        </div>
        <label for="${a(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</label>
      </div>
      <select id="${a(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${bs(l,s)}
      </select>
    </div>
  `}function hs(e={},t=[]){const n=new Set(t.map(he).filter(Boolean)),s=[],l=(i="")=>{const c=String(i||"").trim();if(!c)return;const d=he(c);n.has(d)||s.some(p=>he(p)===d)||s.push(c)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(i=>it(i).forEach(l)),s}function vs({existingImages:e=[],newPreviews:t=[],imageUrlDraft:n=""}={}){const s=[...t.map((c,d)=>({src:c,kind:"new",idx:d})),...e.map((c,d)=>({src:c,kind:"existing",idx:d}))].filter(c=>c.src),l=s[0]?.src||n||"",i=l?b(l,"large"):Y;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${a(i||Y)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${f("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${f("plus","w-2.5 h-2.5")}
          </span>
        </button>
      </div>

      <div class="p-4 rounded-[1.8rem] border border-slate-100 bg-white space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Fotot</p>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${s.length}</span>
        </div>
        ${s.length?`
          <div class="grid grid-cols-3 gap-2">
            ${s.map(c=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${c.kind==="existing"?`<span data-hotel-card-existing-image="${a(c.src)}" hidden></span>`:""}
                <img src="${a(b(c.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${c.idx}" data-hotel-card-image-source="${c.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${f("x","w-3 h-3")}
                </button>
              </div>
            `).join("")}
          </div>
        `:`
          <div class="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            Pa foto
          </div>
        `}
      </div>

      <input id="hotelCardCoverImageUrl" type="hidden" value="${a(n)}" />
    </div>
  `}function xs({destinationId:e="",overrides:t={},hotelCoords:n=null,manualBeachDistance:s=null}={}){const l=String(e||"").trim();if(!l||typeof document>"u")return;const i=p=>va({template:p,overrides:t,hotelCoords:n,imageUrlFn:g=>b(g,"medium"),manualBeachDistance:s});let c=0;const d=()=>{const p=document.getElementById(sn);if(!p){c++<20&&requestAnimationFrame(d);return}String(p.dataset.destinationId||"")===l&&p.dataset.destinationFilled!==l&&Ki(l).then(g=>{const m=document.getElementById(sn);!m||String(m.dataset.destinationId||"")!==l||(m.dataset.destinationFilled=l,m.innerHTML=g?i(g):"",g&&Pn(an({places:g.places,overrides:t,hotelCoords:n})))}).catch(()=>{})};typeof requestAnimationFrame=="function"?requestAnimationFrame(d):queueMicrotask(d)}function Pn(e=[]){if(typeof document>"u")return;const t=document.getElementById(ln);t&&(typeof t.__mhdSetPlaces=="function"?t.__mhdSetPlaces(e):t.__mhdPlaces=Array.isArray(e)?e:[])}function ws(e=[]){if(typeof document>"u")return;let t=0;const n=()=>{const s=document.getElementById(ln);if(!s){t++<20&&requestAnimationFrame(n);return}if(Array.isArray(e)&&e.length&&Pn(e),s.dataset.mhdMapObserved==="1")return;s.dataset.mhdMapObserved="1";const l=()=>{ia(()=>import("./hotel-detail-map-runtime-DB741SQ-.js"),[]).then(i=>i.ensureHotelDetailMap({container:s})).catch(()=>{})};if(typeof IntersectionObserver=="function"){const i=new IntersectionObserver(c=>{c.some(d=>d.isIntersecting)&&(i.disconnect(),l())},{rootMargin:"240px"});i.observe(s)}else l()};typeof requestAnimationFrame=="function"?requestAnimationFrame(n):queueMicrotask(n)}function Rt(e={}){return Sn(e).filter(t=>t.active!==!1&&String(t.title||"").trim())}function ys(e={}){return Rt(e).map(t=>{const n=String(t.hotelStartingPrice||t.startingPrice||t.priceFrom||t.price||"").trim(),s=n?/^\d+(?:[.,]\d+)?$/.test(n)?`€${n}`:n:"",l=String(t.priceUnit||"").trim().toLowerCase(),i=[],c=String(t.offerDurationLabel||"").trim();c&&i.push({icon:"clock",label:c});const d=t.directCenter===!0||t.inCenter===!0?"Në qendër":String(t.distanceCenter||"").trim();d&&i.push({icon:"nav",label:d});const p=t.beachfront===!0||t.onBeach===!0?"Në plazh":String(t.distanceBeach||"").trim();return p&&i.push({icon:"waves",label:p}),{...t,priceLabel:s,priceSuffix:s?l==="total"?"totali":"/ person":"",metaParts:i,tag:String(t.tag||t.offerBadgeLabel||"").trim()}})}function $s(e={}){typeof document>"u"||ia(()=>import("./hotel-stay-detail-modal-CSaOOAlP.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8])).then(t=>t?.registerHotelStayDetailItems?.(e)).catch(()=>{})}function jn(e={}){const t=Z(e,["beachWalkMinutes","distanceBeachWalkMinutes","beachTimeMinutes"]),n=Math.round(Number(String(t).replace(",",".")));return Number.isFinite(n)&&n>0?n:0}function ks(e={}){const t=e.beachfront===!0||e.onBeach===!0||e.amStrand===!0,n=Z(e,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung"]),s=jn(e),l=s>0?`${s} min në këmbë`:"";return!t&&!n&&!l?null:{label:n,direct:t,timeLabel:l}}function An(e={}){return!!(en(e).length||Rt(e).length||In(e).length||String(e.destinationId||"").trim()||Z(e,["rating","reviewRating","stars","hotelStars"]))}const Tn="mnyraHotelDetailsPendingRoot";let ot="";function Ss(e={},t=""){if(typeof document>"u"||typeof setTimeout!="function")return;const n=String(t||"").trim();if(!n||ot===n)return;ot=n;let s=0;const l=()=>{const i=document.getElementById(Tn);if(!i||String(i.dataset.hotelDetailsPending||"")!==n){ot="";return}if(!(!!(typeof ue=="function"?ue(n):null)||An(_e(e)))&&s++<24){setTimeout(l,250);return}ot="",i.removeAttribute("data-hotel-details-pending"),i.classList.add("animate-in","fade-in","duration-300"),i.innerHTML=_n(e)};setTimeout(l,250)}const Ke="data-business-catalog-type-pending";let qe="";function Ln(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.publicSlug||e?.handle||Ft()||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"")}function Is(e={}){const t=r?.profileView?.profile;if(t&&typeof t=="object"&&Me(t))return t;const n=r?.userProfile;return n&&typeof n=="object"&&Me(n)?n:e&&typeof e=="object"?e:{}}function Cs(){document.querySelectorAll('[data-profile-tab="menu"]').forEach(e=>{e.setAttribute("data-profile-tab-surface","hotel-details"),e.textContent="Details"})}function Mn(e="",t={}){if(typeof document>"u"||typeof setTimeout!="function")return;const n=String(e||"").trim();if(!n||qe===n)return;qe=n;let s=0;const l=()=>{const i=document.querySelector(`[${Ke}="${n}"]`);if(!i){qe="";return}const c=Is(t),d=rt(c),p=Ve(c);if(!d&&!p){if(s++<40){setTimeout(l,300);return}qe="",i.removeAttribute(Ke);return}qe="",i.removeAttribute(Ke),p&&(_t(c,d||"hotel"),i.classList.add("animate-in","fade-in","duration-300"),i.innerHTML=zt(c),Cs())};setTimeout(l,300)}function zt(e={}){const t=_e(e),n=String(e?.canonicalRestaurantId||e?.restaurantId||t.canonicalRestaurantId||t.restaurantId||"").trim(),s=n&&typeof ue=="function"?ue(n):null;return n&&!s&&!An(t)?(ha(),Ss(e,n),`
      <div id="${Tn}" data-hotel-details-pending="${a(n)}" class="app-content-inline app-main-content-safe">
        ${$i()}
      </div>
    `):`
    <div class="app-content-inline app-main-content-safe animate-in fade-in duration-300">
      ${_n(e)}
    </div>
  `}function _n(e={}){const t=_e(e),n=ss(t),s=Z(t,["address","primaryAddress","location","formattedAddress","street"]),l=Z(t,["city","locationCity","primaryCity","region","country"]),i=Z(t,["rating","reviewRating","stars","hotelStars"]),c=Z(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),d=Z(t,["reviewSummary","ratingSummary","commentsSummary"]),p=In(t),g=ys(t),m=en(t).map(j=>({...j,priceLabel:Mr(j),metaParts:Lr(j)})),h=ka(t.hotelStaySection);$s({rooms:m,offers:g,imageUrlFn:(j,F="large")=>b(j,F)});const v=String(t.destinationId||"").trim(),w=String(t.destinationName||"").trim(),C=Ia(t.destinationOverrides||{}),k=Z(t,["name","restaurantName","businessName"])||"Hotel",A=n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.lat},${n.lng}`)}`:s||l?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s} ${l}`.trim())}`:"";ha();const L=ks(t),y=v?ja(v):null,T=y?va({template:y,overrides:C,hotelCoords:n,imageUrlFn:j=>b(j,"medium"),manualBeachDistance:L}):"";return v&&!y&&xs({destinationId:v,overrides:C,hotelCoords:n,manualBeachDistance:L}),n&&ws(y?an({places:y.places,overrides:C,hotelCoords:n}):[]),Li({rooms:m,offers:g,staySection:h,amenities:p,address:s,city:l,cityImageUrl:Z(t,["titleImageUrl","coverImageUrl","heroUrl"]),destinationId:v,destinationName:w,destinationSectionsHtml:T,mapsUrl:A,hotelCoords:n,hotelName:k,rating:i,reviewCount:c,ratingSummary:d,imageUrlFn:j=>b(j,"medium")})}function Ps(e={}){const t=_e(e),n=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),s=t?.name||t?.restaurantName||e?.name||"Hotel",l=os(n),i=String(l.status||"").trim(),c=l.saving===!0,d=Array.isArray(l.existingImages)?l.existingImages.map(O=>String(O||"").trim()).filter(Boolean):rs(t),p=Array.isArray(l.imagePreviews)?l.imagePreviews.map(O=>String(O||"").trim()).filter(Boolean):[],g=String(l.imageUrlDraft||"").trim(),[m,h,v]=ls(t),w=hs(t,[m,h,v]),C=Z(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),k=Z(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),A=jn(t),L=Z(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),y=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,T=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,j=l.detailsOpen===!0||c,F=p[0]||d[0]||"",z=F?b(F,"thumb"):Y,I=[C,k,L?`${L} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",D=i.includes("fehl")||i.includes("deshtoi")||i.includes("Bitte")||i.includes("Ju lutem")||i.includes("Nuk")||i.includes("nuk mund");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(s)}</p>
        </div>
      </div>

      ${n?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
              <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hotel & Ofertat</p>
            </div>
            <button type="button" data-hotel-card-details-open aria-expanded="${j?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${f("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${j?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${a(z||Y)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${a(s)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(I)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${j?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${f("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${i&&!j?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${D?"text-rose-500":"text-slate-500"}">${a(i)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${a(n)}" data-hotel-card-details-panel class="${j?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${f("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${vs({existingImages:d,newPreviews:p,imageUrlDraft:g})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Cn({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:C,directLabel:ds,direct:y})}
              ${Cn({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:k,directLabel:us,direct:T,withTime:!0,timeMinutes:A})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${a(L)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Et({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:m,options:ps})}
              ${Et({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:h,options:fs})}
              ${Et({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:v,options:ms})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${a(w.join(`
`))}</textarea>
              </div>
            </div>

            ${i?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${D?"text-rose-500":"text-slate-500"}">${a(i)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
              ${c?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${Ei({restaurantId:n,record:t,editorState:r.hotelRoomsEditor&&typeof r.hotelRoomsEditor=="object"?r.hotelRoomsEditor:{},hasOffers:He(n,{includeInactive:!0}).items.length>0||Rt(t).length>0})}
        ${Yt(n,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Ju lutem zgjidh fillimisht hotel-biznesin tend ne llogari.</p>
        </div>
      `}
    </div>
  `}function lt(e={}){const t=String(r.profileTopTab||"").trim().toLowerCase(),n=String(r.profileContentTab||"").trim().toLowerCase();return Me(e)?t==="menu"?"menu":n==="menu"||n==="posts"?n:"posts":n==="media"||n==="checkins"?n:"posts"}function Nt(e={}){const t=String(r.profileTopTab||"").trim().toLowerCase();return Me(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(r.user?.uid||"").trim()?"favorites":"profile"}function Fn(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function js(e=0,t=1){const n=Math.max(1,Number(t||0)||1),s=Math.round(Number(e||0));if(!Number.isFinite(s))return 0;const l=s%n;return l<0?l+n:l}function As(e=0){return Fn(e)}function Ts(e={}){const t=["Mirë se vini","Welcome","Mire se vini","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],n=Fn(r.profileLandingStep),s=js(r.profileLandingGreetingIndex,t.length),l=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},i=String(l.businessName||e.name||"casarita").trim()||"casarita",c=Tt(l.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),d=c&&c.toLowerCase()!=="#111827"?c:"",p=Tt(l.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||c||"","#111827"),g=Tt(l.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||d||"","#4f46e5"),m=i.replace(/\.+$/g,"").trim()||i,h=m.split(/\s+/).filter(Boolean),v=h.length>1?h.slice(0,-1).join(" "):m,w=h.length>1?h[h.length-1]:"",C=w?v:`${v}.`,k=w?`${w}.`:"",A=b(l.logoUrl||e.avatar||"","avatar"),y=String(A||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",T=String(l.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),j=String(l.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),F=n>=2,z=n>=3,I=Array.isArray(r.profileView?.posts)?r.profileView.posts:Array.isArray(e?.posts)?e.posts:[],D=As(n),O=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${f("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(K=>{const $=D===K;return`
            <div data-landing-step-dot="${K}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${$?"1.22":"1"}); opacity: ${$?"1":"0.88"}; background: ${$?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${$?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${$?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${n===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${n===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((K,$)=>{const R=$===s,H=$===(s-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${$}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${R?"opacity: 1; transform: translateY(0) scale(1);":H?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!R&&!H?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${a(K)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${a(y)}" alt="${a(`${i} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${a(p)};">${a(C)}</span>${k?`<span style="color:${a(g)};">${a(k)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${a(T)}<br />
            ${a(j)}
          </p>
        </div>
        ${O}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${n<1?"translate-y-full":n===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===1?"1":"0"}; pointer-events: ${n===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${ut(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${O}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${n<2?"translate-y-full":n===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===2?"1":"0"}; pointer-events: ${n===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${F?ut(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${O}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${n<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${n===3?"1":"0"}; pointer-events: ${n===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${z?ut(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Dt(e=r.profileView?.profile||r.userProfile,{landingPreview:t=!1,selectedTabOverride:n="",compact:s=!1}={}){const l=Me(e),i=String(n||lt(e)).trim().toLowerCase()||"posts",c=Ve(e),d=se(e),p=c?"Details":d?"Shop":x("nav.menu","Menue"),g=l?[{id:"posts",label:x("profile.posts","Beitraege")},{id:"menu",label:p,surface:c?"hotel-details":"menu"}]:[{id:"posts",label:x("profile.posts","Beitraege")},{id:"media",label:x("profile.media","Medien")},{id:"checkins",label:x("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${s?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${g.map(m=>`
          <button data-profile-tab="${m.id}" ${m.surface?`data-profile-tab-surface="${a(m.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${i===m.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${m.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Ot(e=r.profileView?.profile||r.userProfile,{disabled:t=!1}={}){const n=lt(e);return n==="checkins"||n==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${a(x("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${r.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${f("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${r.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${f("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function W(e=""){return String(e||"").trim()}const En="mnyra_business_title_image_cache_v1",Rn=80;function zn(){if(!r)return{};const e=r.businessTitleImageCache&&typeof r.businessTitleImageCache=="object"?r.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const s=(typeof window<"u"?window.localStorage:null)?.getItem?.(En)||"",l=s?JSON.parse(s):{};l&&typeof l=="object"&&Object.entries(l).forEach(([i,c])=>{const d=W(i),p=W(c);d&&p&&!X(p)&&(t[d]=p)})}catch{}return r.businessTitleImageCache={loaded:!0,items:t},t}function Ls(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(En,JSON.stringify(e))}catch{}}function Ms(e={},t="business"){const n=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(s=>W(s)).filter(Boolean);return[...new Set(n)]}function _s(e=[],t=""){const n=W(t);if(!n||X(n))return;const s=zn();let l=!1;e.forEach(c=>{const d=W(c);!d||s[d]===n||(s[d]=n,l=!0)});const i=Object.entries(s);if(i.length>Rn){const c=i.slice(i.length-Rn);Object.keys(s).forEach(d=>delete s[d]),c.forEach(([d,p])=>{s[d]=p}),l=!0}l&&Ls(s)}function Fs(e=[]){const t=zn();for(const n of e){const s=W(n),l=s?W(t[s]):"";if(l&&!X(l))return l}return""}function Es(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function Rs(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function zs(e={}){const n=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(s=>String(s||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||n||"").trim()}function Ns(e={},t={}){const n=zs(e),s=Array.isArray(t.cacheKeys)?t.cacheKeys:[],l=W(t.stableKey||s[0]||"");if(!n){if(t.allowCacheFallback===!0){const c=Fs(s);if(c)return c;const d=l?b("","medium",{stableKey:l}):"";return d&&!X(d)?d:""}return""}const i=b(n,"medium",l?{stableKey:l}:void 0);return i&&!X(i)?(_s(s,i),i):""}function Nn(e="",t=""){const n=W(e);if(!n)return"";if(/^https?:\/\//i.test(n))return n;const s=n.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return s?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(s)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(s)}`:"":""}function Ds(e=""){const t=W(e);if(!t)return"";const n=t.replace(/[^\d+]/g,"");return n?`tel:${n}`:""}function Os(e={}){const t=Number(e?.gpsLat??e?.lat),n=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(n))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${n}`)}`;const s=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(l=>W(l)).filter(Boolean).join(", ");return s?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`:""}function ct({href:e="",label:t="",iconName:n="",body:s="",buttonAttrs:l=""}={}){const i=W(e),c=String(l||"").trim();if(!i&&!c)return"";const d=s||f(n,"w-4 h-4"),p="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return c?`
    <button type="button" ${c} title="${a(t)}" aria-label="${a(t)}" class="${p}">
      ${d}
    </button>
  `:`
    <a href="${a(i)}" target="_blank" rel="noreferrer" title="${a(t)}" class="${p}">
      ${d}
    </a>
  `}function dt({href:e="",buttonAttrs:t="",iconName:n="",eyebrow:s="",value:l=""}={}){const i=W(l);if(!i)return"";const c=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${f(n,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${a(s)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(i)}</span>
    </div>
  `;return e?`<a href="${a(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</button>`}function Us({profileName:e="",safeBio:t="",metaLine:n="",identityPending:s=!1,followersLabel:l=""}={}){return`
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(String(l))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(x("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(x("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(n)}</p>
          ${s?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(x("profile.headLoading","Koka e profilit po ngarkohet..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function Dn(e={},t={}){const n=t.mode==="self"?"self":"public",s=t.disabledBlockClass||"",l=Es(e,n),i=n==="self"?"avatar:self":`avatar:public:${l}`,c=t.avatarUrl||b(e.avatar||"","avatar",{stableKey:i}),d=t.avatarFit||P(!!e.restaurantId),p=String(r?.profileCardInfoOpen||"")===l,g=Number(r?.profileCardInfoHeights?.[l]||0),m=p&&Number.isFinite(g)&&g>0?`height:${Math.ceil(g)}px;`:"",h=t.avatarImgKeyAttr||(n==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${a(l)}"`),v=t.renderAvatarImage===!0?!!String(c||"").trim()&&!X(c):t.renderAvatarImage!==!1&&!!String(c||"").trim()&&!X(c)&&!!String(e?.avatar||"").trim(),w=!!t.identityPending,C=t.followersLabel??S(e.followers),k=W(e?.name)||"User",A=W(t.typeLabel||e?.customerType||e?.type||"Business"),L=W(e?.location||"-"),y=n==="public"?`${L} / ${A}`:L,T=t.bioHtml||a(e?.bio||"").replace(/\n/g,"<br>")||a(x("profile.noBio","Nuk ka bio.")),j=`business-cover:${l}`,F=Ms(e,l),z=Ns(e,{cacheKeys:F,stableKey:j,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),I=Os(e),D=Rs(e),O=ct(D?{buttonAttrs:`data-marketplace-open-map="${a(D)}"`,label:x("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:I,label:x("profile.openMap","Karte oeffnen"),iconName:"map"}),K=Nn(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),$=Nn(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),R=W(e?.phone||e?.telephone||e?.contactPhone||""),H=Ds(R),q=W(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(ne=>W(ne)).filter(Boolean).join(", ")),G=[dt({href:K,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),dt({href:$,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),J=n==="self"?`
      <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${f("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${f("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle||"")}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?f("check","w-4 h-4"):""}
          ${a(t.followLabel||x("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${f("message-circle","w-5 h-5")}
      </button>
    `;if(p){const ne=[dt({href:H,iconName:"phone",eyebrow:x("profile.call","Anrufen"),value:R}),dt({href:I,iconName:"map-pin",eyebrow:x("profile.address","Adresse"),value:q||L}),G].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${a(l)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="${m}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${Us({profileName:k,safeBio:T,metaLine:y,identityPending:w,followersLabel:C})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${a(l)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${f("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(x("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(L)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${ne||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(x("profile.noContactInfo","Ende nuk ka te dhena kontakti"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${a(l)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${a(x("profile.backToProfile","Kthehu te profili"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${a(l)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${z?`<img src="${a(z)}" data-img-key="${a(j)}" alt="${a(k)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${f("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${O}
          ${ct({href:$,label:"TikTok",iconName:"music-2"})}
          ${ct({href:K,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${n==="self"?'id="profileAvatarTrigger"':""} class="relative ${n==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${v?`<img src="${a(c)}" data-fallback-src="${a(Y)}" decoding="async" width="100" height="100" ${h} class="w-full h-full rounded-[1.8rem] ${d} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${w?"animate-pulse":""}">${f("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${w?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(String(C))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(x("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${a(l)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${f("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(x("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(k)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${T}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(y)}</p>
          ${w?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(x("profile.headLoading","Koka e profilit po ngarkohet..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${J}
        </div>
      </div>
    </div>
  `}function ut(e={},t=[],{topTabOverride:n="",tutorialMode:s=!1,contentTabOverride:l="",landingHideContent:i=!1,collapseIdentity:c=!1,contentReveal:d=!1,landingMode:p=!1}={}){const g=Xa(e),m=!!e.privateAccount&&e.uid&&String(e.uid)!==String(r.user?.uid||"")&&!g,h=!!e.pendingFollowRequest&&!g,v=e.restaurantId?"Business":x("nav.user","User"),w=String(e.handle||U(e.name||"user")).replace(/^@/,""),k=a(e.bio||"").replace(/\n/g,"<br>")||a(x("profile.noBio","Nuk ka bio.")),A=Me(e),L=String(n||Nt(e)).trim().toLowerCase()||"profile",y=String(l||lt(e)).trim().toLowerCase()||"posts",T=y==="menu",j=y==="checkins",F=oa(t),I={...r?.profileView&&typeof r.profileView=="object"?r.profileView:{},profile:e,posts:Array.isArray(F)?F:[]},D=Pr(r,{profileView:I,profileTopTab:L,profileContentTab:y}),O=String(D?.header?.status||"").trim().toLowerCase()||"loading",K=String(D?.posts?.status||"").trim().toLowerCase()||"loading",$=e.uid||e.restaurantId||w||"public",R=`avatar:public:${$}`,H=String(e?.avatar||"").trim(),q=b(H,"avatar",{stableKey:R}),G=P(!!e.restaurantId),J=p?"":`data-img-key="avatar:public:${a($)}"`,ne=!H&&!!String(q||"").trim()&&!X(q),ae=!!H||ne&&Je(O),Se=Re=>{if(Re==null)return!1;const Ce=Number(Re);return Number.isFinite(Ce)&&Ce>=0},Xt=ae||Se(e?.followers)||Se(e?.following),pe=Je(O)&&!Xt,Ie=!!String(q||"").trim()&&!X(q)&&ae,gt=pe?"...":S(e.followers),bt=pe?"...":S(e.following),ht=A?"pt-2":"pt-10",vt=g?x("profile.following","Following"):h?x("profile.requested","Requested"):m?x("profile.request","Request"):x("profile.follow","Follow"),Ye=g?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":h?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",We=s?"select-none":"app-main-content-safe",fe=s?"pointer-events-none":"",oe=!c,sa=!i,xt=d?p?"transition-opacity duration-200":"animate-in fade-in duration-300":"",ra=y==="posts"&&F.length>0,wr=y!=="posts"||ra||K==="empty"||K==="error",yr=y==="posts"&&!ra&&K==="error";return!s&&(y==="posts"||y==="media")&&e?.restaurantId&&Je(K)&&le(e),`
    <div class="${We}" ${s?'data-landing-tutorial-surface="true"':""}>
      ${L==="profile"||L==="menu"?`
      ${oe?`
        <div class="app-content-inline pb-2 ${ht}">
          ${A?Dn(e,{mode:"public",disabledBlockClass:fe,avatarUrl:q,avatarFit:G,avatarImgKeyAttr:J,renderAvatarImage:Ie,identityPending:pe,followersLabel:gt,followLabel:vt,followTone:Ye,isFollowing:g,hasPendingFollowRequest:h,isLocked:m,bioHtml:k,typeLabel:v,allowTitleImageCacheFallback:Je(O)||Je(K)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${fe}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${Ie?`<img src="${a(q)}" data-fallback-src="${a(Y)}" decoding="async" width="100" height="100" ${J} class="w-full h-full rounded-[1.8rem] ${G} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${pe?"animate-pulse":""}">${f(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${pe?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(gt)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(x("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${pe?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(bt)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(x("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e.name||"User")}</h1>
                ${A?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${a(w)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(e.location||"-")} / ${v}</p>
                ${pe?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(x("profile.headLoading","Koka e profilit po ngarkohet..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle)}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${h?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${Ye} ${h?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${g?f("check","w-4 h-4"):""}
                    ${vt}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${m?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${m?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${f("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
          `}
        </div>
      `:""}

      ${m?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${f("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${a(x("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${a(x("profile.followAcceptedFirst","Ndjekja duhet pranuar fillimisht"))}</p>
          </div>
        </div>
      `:`
        ${Dt(e,{landingPreview:s,selectedTabOverride:y,compact:c})}
        ${sa?Ot(e,{disabled:s}):""}

        ${sa?T?(()=>{const Re=Ve(e),Ce=!Re&&A&&!s&&!p&&!rt(e)?Ln(e):"";return Ce&&Mn(Ce,e),`
          <div class="${fe} ${xt}"${Ce?` ${Ke}="${a(Ce)}"`:""}>
            ${Re?zt(e):mt(e,{mode:p?"landing":"profile",allowAutoEnsure:!p})}
          </div>
        `})():j?`
          <div class="${fe} ${xt}">
            ${Mt()}
          </div>
        `:`
          ${wr?`
            ${yr?`
              <div class="app-content-inline ${fe}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${a(x("profile.contentLoadError","Permbajtja nuk mund te ngarkohej"))}</p>
                </div>
              </div>
            `:`
              <div class="${r.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${fe} ${xt}">
                ${Lt(F,r.profileViewMode,!1,{includeImageKeys:!p})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${fe}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${xt}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(x("profile.postsLoading","Postimet po ngarkohen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${L==="cart"?B(e):L==="favorites"?Q(e):""}
      `}
    </div>
  `}function Hs(){const e=r.profileView;if(!e||!e.profile)return"";const t=e.profile,n=e.posts||t.posts||[],s=Nt(t);return s==="landing"?Ts(t):ut(t,n,{topTabOverride:s,tutorialMode:!1})}function On(e,{filter:t="all",query:n=""}={}){const s=Array.isArray(e)?e:[],l=Ua(n||"");return s.filter(i=>t==="all"||Ae(i.type)===t?l?`${i.name||""} ${i.category||""} ${i.description||""}`.toLowerCase().includes(l):!0:!1)}function Un(e,t=0){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Math.max(0,Number(t)||0)}function pt(e=[]){return(Array.isArray(e)?e.slice():[]).map((n,s)=>({item:n,idx:s,order:Un(n?.orderIndex,s)})).sort((n,s)=>n.order-s.order||n.idx-s.idx).map((n,s)=>({...n.item,orderIndex:Un(n.item?.orderIndex,s)}))}function Ut(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function Ge(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":Ae(e?.type||"food")==="drink"?"drink":"food"}function Bs(e={}){return String(e?.category||x("menu.other","Sonstiges")).trim()||x("menu.other","Sonstiges")}function Vs(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const Ks=4,qs={thumb:160,small:480,medium:768,large:1280};function Hn({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<Ks&&n===0}function Gs({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){const s=Hn({mode:e,priorityIndex:t,slideIndex:n}),l=e==="profile"?' data-image-reveal="menu"':"";return s?`loading="eager" fetchpriority="high"${l}`:`loading="lazy" fetchpriority="low"${l}`}function Ys({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function ve(e,{mode:t="profile",priorityIndex:n=-1,slideIndex:s=0,stableKey:l="",preferredSize:i="small",candidateSizes:c=["small","medium","large"],variant:d="grid"}={}){const p=String(e||"").trim(),g=t==="profile"&&l?{stableKey:l}:null,m=Hn({mode:t,priorityIndex:n,slideIndex:s}),h=t==="profile"&&!m&&d!=="thumb",v=b(p,i,g),w=X(v)?Y:v,C=Ea(p),k=Ra(p)&&p!==w?p:C,A=[],L=new Set;c.forEach($=>{const R=qs[$]||0;if(!R)return;const H=b(p,$,g);if(!H||X(H))return;const q=`${H}|${R}`;L.has(q)||(L.add(q),A.push(`${H} ${R}w`))});const y=A.length>1?A.join(", "):"",T=y?Ys({variant:d}):"",j=h?"":y,F=h?"":T,z=j?` srcset="${a(j)}"`:"",I=F?` sizes="${a(F)}"`:"",D=Gs({mode:t,priorityIndex:n,slideIndex:s}),O=`${D}${z}${I}`,K=h?[`data-menu-lazy-src="${a(w)}"`,`data-menu-lazy-fallback="${a(k||Y)}"`,y?`data-menu-lazy-srcset="${a(y)}"`:"",T?`data-menu-lazy-sizes="${a(T)}"`:""].filter(Boolean).join(" "):"";return{safeImg:h?Y:w,fallbackImg:h?Y:k,imageAttrs:O,lazyAttrs:K?` ${K}`:"",srcsetValue:y,sizesValue:T,loadingAttrs:D}}function Fe(e=[],t,n=null){const s=n instanceof Set?n:new Set;return e.map((l,i)=>{const c=Bs(l),d=Vs(c),p=!!d&&!s.has(d);return p&&s.add(d),`<div${p?` data-menu-category-anchor="${a(d)}"`:""} class="h-full">${t(l,i)}</div>`}).join("")}function Ht(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function Ws(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function Bn(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),n=Ws(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),s=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&n?{type:"link",url:n,productId:""}:t==="product"&&s?{type:"product",url:"",productId:s}:{type:"self",url:"",productId:""}}function Vn(){const e=se(r.userProfile),t=String(r.menu.filter||"all").trim().toLowerCase()||"all",n=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:x("menu.all","Alle")},{id:"food",label:x("menu.products","Produkte")}]:[{id:"all",label:x("menu.all","Alle")},{id:"food",label:x("menu.food","Speisen")},{id:"drink",label:x("menu.drinks","Getraenke")}]).map(l=>`
        <button data-menu-filter="${l.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${n===l.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${l.label}
        </button>
      `).join("")}
    </div>
  `}function Qs(){const e=_a().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Ngjyrat</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${Fa.map(t=>{const n=t.id===e,s=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${n?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${n?f("check",`w-4 h-4 ${s}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function ft(e,{poster:t="",objectPosition:n="50% 50%",badge:s=!0}={}){if(!Zt(e))return"";const l=String(e.videoUrl||"").trim();if(!l)return"";const i=t?` poster="${a(t)}"`:"";return`<video data-autoplay-video src="${a(l)}"${i} class="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]" style="object-position:${n};" muted loop playsinline autoplay preload="metadata"></video>`+(s?'<div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-10"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white block"><path d="M8 5v14l11-7z"></path></svg></div>':"")}function Bt(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=de(e),l=t==="profile"?Ee(e,{index:0}):"",{safeImg:i,fallbackImg:c,imageAttrs:d,lazyAttrs:p}=ve(s,{mode:t,priorityIndex:n,stableKey:l,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),g=Be(e),m=r.activeTab==="menu"?r.userProfile:r.profileView?.profile||r.userProfile,h=se(m),v=xn(e,h),w=h?vn(e.category):e.category||"",C=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${a(i)}" data-fallback-src="${a(c)}"${p} class="w-full h-full object-cover" style="object-position:${te(e)};" ${d} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${a(e.name||x("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${a(g)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${a(w)}</span>`:""}
            <span>${a(v)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${f("more-horizontal","w-4 h-4")}
          </summary>
          <div class="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-2xl shadow-lg p-2 z-20">
            <button data-menu-edit="${a(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Ndrysho</button>
            <button data-menu-delete="${a(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Fshi</button>
          </div>
        </details>
      </div>
    `:`
    <div ${t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:""} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${t==="profile"?"cursor-pointer":""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${a(i)}" data-fallback-src="${a(c)}"${p} class="w-full h-full object-cover" style="object-position:${te(e)};" ${d} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${a(e.name||x("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${a(g)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${w?`<span>${a(w)}</span>`:""}
          <span>${a(v)}</span>
        </div>
        ${C?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${a(C)}</p>`:""}
      </div>
    </div>
  `}function Vt(e,{mode:t="profile",variant:n="food",priorityIndex:s=-1}={}){const l=de(e),i=t==="profile"?Ee(e,{index:0}):"",c=n==="drink",{safeImg:d,fallbackImg:p,imageAttrs:g,lazyAttrs:m}=ve(l,{mode:t,priorityIndex:s,stableKey:i,preferredSize:c?"small":"medium",candidateSizes:c?["small","medium"]:["small","medium","large"],variant:c?"grid":"hero"}),h=Be(e),v=r.activeTab==="menu"?r.userProfile:r.profileView?.profile||r.userProfile,w=se(v),C=xn(e,w),k=w?vn(e.category):e.category||"",A=e.description||"",L=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",y=r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"",T=et(e),j=fn(y,T),F=j?mn(j):{likes:[],comments:[],counts:{likes:0,comments:0}},z=gn(F),I=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${f("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${a(T)}">${a(S(z.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${f("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${a(T)}">${a(S(z.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${L} class="w-full ${c?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${c?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100 relative">
        <img src="${a(d)}" data-fallback-src="${a(p)}"${m} class="w-full h-full object-cover" style="object-position:${te(e)};" ${g} decoding="async" />
        ${ft(e,{poster:d,objectPosition:te(e)})}
      </div>
      ${c?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${a(e.name||x("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${a(h)}</p>
          ${I}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${a(e.name||x("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${a(h)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${k?`<span>${a(k)}</span>`:""}
            <span>${a(C)}</span>
          </div>
          ${A?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${a(A)}</p>`:""}
          ${I}
        </div>
      `}
    </div>
  `}function Kt(e={}){if(!e?.restaurantId||se(e))return!1;const t=String(jt(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":ke(e)}function Kn(e){const t=e?.restaurantId||r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"",n=et(e),s=fn(t,n),l=s?mn(s):{likes:[],comments:[],counts:{likes:0,comments:0}},i=String(r.user?.uid||"").trim(),c=String(r.user?.handle||"").trim().toLowerCase(),d=!!l.likes?.some(p=>{const g=String(p?.uid||"").trim();if(i&&g&&g===i)return!0;const m=String(p?.handle||"").trim().toLowerCase();return!!c&&!!m&&m===c});return{itemId:n,meta:l,counts:gn(l),isLiked:d}}function Ee(e,{index:t=0}={}){const n=String(e?.restaurantId||r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"").trim(),s=String(e?.id||et(e)||"").trim();if(!n||!s)return"";const l=Number(t),i=Number.isFinite(l)?Math.max(0,Math.floor(l)):0;return`menu-detail:${n}:${s}:${i}`}function Js(e){const t=typeof pn=="function"?pn(e):[],n=Array.isArray(t)?t.filter(Boolean):[];if(n.length)return n;const s=de(e);return s?[s]:[]}function xe(e){return $r(e?.cardStyle||"",Ae(e?.type||"food"))}function qt(e,{menuItemId:t=""}={}){if(!e)return null;const n=String(t||e.menuItemId||e.itemId||e.productId||"").trim(),s=Zt(e),l=String(e.videoUrl||"").trim(),i=String(e.posterUrl||"").trim(),c=de(e)||e.imageUrl||(s?i:"")||"";return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:c,objectPosition:e.objectPosition||te(e),menuItemId:n,mediaType:s?"video":"image",videoUrl:s?l:"",posterUrl:s?i||c:""}}function M(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function Xs(e={}){return st("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${Pt()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${ie({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex items-center justify-between mb-4">
          ${M("h-3 w-24 rounded-full")}
        <div class="flex items-center gap-2">
          ${M("w-9 h-9 rounded-full")}
          ${M("w-9 h-9 rounded-full")}
        </div>
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${M("w-full h-56")}
      </div>
      <div class="mt-4 space-y-2">
        ${M("h-5 w-2/3 rounded-full")}
        ${M("h-4 w-full rounded-full")}
        ${M("h-4 w-3/5 rounded-full")}
      </div>
    </div>
  `}function Zs(e={}){return st("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${ie({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
            ${M("w-full h-full")}
          </div>
          <div class="px-2 py-4 space-y-2">
            ${M("h-5 w-2/3 rounded-full")}
            ${M("h-4 w-full rounded-full")}
            ${M("h-4 w-1/2 rounded-full")}
          </div>
        </div>
      </div>
    </div>
  `}function er(){return`
    <div class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col relative" aria-hidden="true">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        ${M("w-full h-full")}
        ${M("absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90")}
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="mb-1 space-y-2">
          ${M("h-4 w-4/5 rounded-full")}
          ${M("h-3 w-3/5 rounded-full")}
        </div>
        ${M("h-3 w-full rounded-full mb-1")}
        ${M("h-3 w-2/3 rounded-full mb-3")}
        <div class="mt-auto pt-2 flex items-center justify-between">
          ${M("h-4 w-14 rounded-full")}
          ${M("w-8 h-8 rounded-full bg-slate-900/10")}
        </div>
      </div>
    </div>
  `}function tr(){return`
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;" aria-hidden="true">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${M("w-full h-full")}
        ${M("absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90")}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div class="min-w-0 flex-1">
            ${M("h-5 w-4/5 rounded-full")}
          </div>
          ${M("h-5 w-14 rounded-full shrink-0")}
        </div>
        ${M("h-4 w-full rounded-full mb-2")}
        ${M("h-4 w-2/3 rounded-full mb-4")}
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div></div>
          <div class="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  `}function qn(e={}){return st("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${ie({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>er()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>tr()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Gn(e="food"){const t=e==="drink";return`
    <div class="w-full ${t?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm" aria-hidden="true">
      <div class="w-full ${t?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        ${M("w-full h-full")}
      </div>
      ${t?`
        <div class="mt-3 flex flex-1 flex-col space-y-2">
          ${M("h-4 w-4/5 rounded-full")}
          ${M("h-3 w-1/2 rounded-full")}
          <div class="mt-2 flex items-center gap-3">
            ${M("h-3 w-10 rounded-full")}
            ${M("h-3 w-10 rounded-full")}
          </div>
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            ${M("h-4 w-3/5 rounded-full")}
            ${M("h-4 w-14 rounded-full")}
          </div>
          ${M("h-3 w-2/5 rounded-full mt-2")}
          ${M("h-3 w-full rounded-full mt-3")}
          ${M("h-3 w-2/3 rounded-full mt-2")}
          <div class="mt-3 flex items-center gap-3">
            ${M("h-3 w-10 rounded-full")}
            ${M("h-3 w-10 rounded-full")}
          </div>
        </div>
      `}
    </div>
  `}function nr(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${ie({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
        <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
        ${M("w-full h-full")}
      </div>
      <div class="pt-3 flex-1 flex flex-col min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1 space-y-2">
            ${M("h-4 w-full rounded-full")}
            ${M("h-4 w-3/5 rounded-full")}
          </div>
          ${M("h-3 w-10 rounded-full shrink-0")}
        </div>
        ${M("h-3 w-full rounded-full mt-3")}
        ${M("h-3 w-2/3 rounded-full mt-2")}
      </div>
    </article>
  `}function Yn({isShop:e=!1,debugContext:t={}}={}){return st(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${ie({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>nr()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${ie({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${M("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>Gn("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${M("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>Gn("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Wn(e,t=[],{mode:n="profile"}={}){const s=e?.restaurantId||"",l=Kt(e)||se(e);return!s||!l||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((i,c)=>{const d=i.imageUrl||"",p=String(i.menuItemId||i.id||"").trim(),{safeImg:g,fallbackImg:m,imageAttrs:h,lazyAttrs:v}=ve(d,{mode:n,priorityIndex:c,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:p?`menu-focus:${s}:${p}`:""}),w=String(i.menuItemId||"").trim(),C=n==="profile"&&w?`data-menu-open="${a(w)}" role="button"`:"";return`
            <div ${C} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${C?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${a(g)}" data-fallback-src="${a(m)}"${v} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${i.objectPosition||"50% 50%"};" ${h} decoding="async" />
                ${ft(i,{poster:g,objectPosition:i.objectPosition||"50% 50%",badge:!1})}
                <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${f("sparkles","w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${a(i.title||"")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${a(i.text||"")}</p>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function Qn(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=de(e),l=t==="profile"?Ee(e,{index:0}):"",{safeImg:i,fallbackImg:c,imageAttrs:d,lazyAttrs:p}=ve(s,{mode:t,priorityIndex:n,stableKey:l,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),g=Be(e),m=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",{itemId:h,counts:v,isLiked:w}=Kn(e);return`
    <div ${m} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${a(i)}" data-fallback-src="${a(c)}"${p} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${te(e)};" ${d} decoding="async" />
        ${ft(e,{poster:i,objectPosition:te(e)})}
        <button
          type="button"
          data-menu-card-like="${a(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${f("heart","w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${a(e.name||"")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${a(e.description||"")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${a(g)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${f("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${a(h)}">${a(S(v.likes))}</span>
          <span data-menu-comment-count="${a(h)}">${a(S(v.comments))}</span>
        </div>
      </div>
    </div>
  `}function ar(e,t="profile"){if(t!=="profile")return"";const n=Bn(e);return n.type==="link"&&n.url?`data-menu-special-link="${a(n.url)}" role="button" tabindex="0"`:n.type==="product"&&n.productId?`data-menu-open="${a(n.productId)}" role="button"`:`data-menu-open="${a(e.id)}" role="button"`}function Gt(e,{mode:t="profile",size:n="default",priorityIndex:s=-1}={}){const l=de(e),i=t==="profile"?Ee(e,{index:0}):"",c=n==="food",{safeImg:d,fallbackImg:p,imageAttrs:g,lazyAttrs:m}=ve(l,{mode:t,priorityIndex:s,stableKey:i,preferredSize:c?"medium":"small",candidateSizes:c?["small","medium","large"]:["small","medium"],variant:c?"hero":"grid"}),h=ar(e,t),v=String(e.category||"Special").trim()||"Special",w=a(String(e.name||"Special")).replace(/\n/g,"<br>");return n==="food"?`
      <div ${h} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${a(d)}" data-fallback-src="${a(p)}"${m} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${te(e)};" ${g} decoding="async" />
        ${ft(e,{poster:d,objectPosition:te(e)})}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${f("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(v)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${h} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${a(d)}" data-fallback-src="${a(p)}"${m} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${te(e)};" ${g} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${f("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(v)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function Jn(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=Be(e),l=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",i=Js(e),d=(i.length?i:[de(e)||""]).filter(Boolean),p=d.length?d.slice(0,12):[""],g=p.length>1,{itemId:m,counts:h,isLiked:v}=Kn(e),w=S(Math.max(0,Number(h.likes)||0)),C=S(Math.max(0,Number(h.comments)||0));return`
    <div ${l} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${g?`
          <div
            data-menu-card-gallery-track="${a(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${p.map((k,A)=>{const L=t==="profile"?Ee(e,{index:A}):"",y=ve(k||"",{mode:t,priorityIndex:n,slideIndex:A,stableKey:L,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),T=A>0,j=T?Y:y.safeImg,F=T?Y:y.fallbackImg,z=T?y.loadingAttrs:y.imageAttrs,I=T?"":y.lazyAttrs||"",D=T?` data-menu-card-deferred-src="${a(y.safeImg)}"
                    data-menu-card-deferred-fallback="${a(y.fallbackImg)}"
                    ${y.srcsetValue?`data-menu-card-deferred-srcset="${a(y.srcsetValue)}"`:""}
                    ${y.sizesValue?`data-menu-card-deferred-sizes="${a(y.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${A}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${a(j)}" data-fallback-src="${a(F)}"${I}${D} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${te(e)};" ${z} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${p.map((k,A)=>{const L=t==="profile"?Ee(e,{index:A}):"",{safeImg:y,fallbackImg:T,imageAttrs:j,lazyAttrs:F}=ve(k||"",{mode:t,priorityIndex:n,slideIndex:A,stableKey:L,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${a(y)}" data-fallback-src="${a(T)}"${F} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${te(e)};" ${j} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${a(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${v?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${v?"true":"false"}"
        >
          ${f("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${g?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${p.map((k,A)=>`
              <div
                data-menu-card-gallery-dot="${a(e.id)}"
                data-menu-card-gallery-index="${A}"
                class="${A===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
              ></div>
            `).join("")}
          </div>
        `:""}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div>
            <h4 class="text-[18px] font-black text-slate-900 leading-snug">${a(e.name||"")}</h4>
          </div>
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${a(s)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${a(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${a(m)}">${a(w)}</span>
              <span data-menu-comment-count="${a(m)}">${a(C)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${a(x("menu.add","Shto"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${f("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function sr(e,t,{mode:n="profile",publicMenuSurfaceState:s=null,focusFallbackHtml:l=""}={}){const i=pt(Array.isArray(t)?t:[]),c=String(e?.restaurantId||"").trim(),d=n==="admin"||Wa(c),p=s?.focus?.canRenderFocus?{items:Array.isArray(s.focus.items)?s.focus.items:[],enabled:!0}:c&&d?He(c):{items:[],enabled:!1},g=p.enabled?(Array.isArray(p.items)?p.items:[]).map($=>qt({...$,objectPosition:Te($)})):[],m=i.filter($=>xe($)==="testfirst_focus"&&!Ut($)).map($=>qt($,{menuItemId:$.id||""})).filter(Boolean),h=new Set,v=[...g,...m].filter($=>{const R=String($.menuItemId||$.id||`${$.title}|${$.text}|${$.imageUrl}`);return!R||h.has(R)?!1:(h.add(R),!0)}),w=i.filter($=>!Ut($)),C=w.filter($=>xe($)!=="testfirst_focus"),k=C.length?C:w,A=C.length?v:[],L=k.filter($=>Ge($)==="drink"),y=k.filter($=>Ge($)!=="drink"),T=($=[])=>{const R=[],H=[];return $.forEach(q=>{const G=xe(q);G==="testfirst_food"||G==="testfirst_special"&&Ht(q)==="food"?H.push(q):R.push(q)}),{gridItems:R,foodItems:H}},j=($,R=-1)=>xe($)==="testfirst_special"?Gt($,{mode:n,priorityIndex:R}):Qn($,{mode:n,priorityIndex:R});let F=0;const z=()=>{const $=F;return F+=1,$},I=new Set,D=($,R)=>!R.gridItems.length&&!R.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${a($)}">
        ${R.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a($)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${Fe(R.gridItems,H=>j(H,z()),I)}
            </div>
          </div>
        `:""}
        ${R.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a($)}">
            <div class="app-content-inline">
              ${Fe(R.foodItems,H=>{const q=xe(H),G=z();return q==="testfirst_special"?Gt(H,{mode:n,size:"food",priorityIndex:G}):Jn(H,{mode:n,priorityIndex:G})},I)}
            </div>
          </div>
        `:""}
      </section>
    `,O=T(L),K=T(y);return`
    <div>
      ${Wn(e,A,{mode:n})||l}
      <div id="menu-section" class="mt-5">
        ${D("drink",O)}
        ${D("food",K)}
      </div>
    </div>
  `}function Xn(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:s=null,priorityOffset:l=0}={}){return e.length?n?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${Fe(e,(i,c)=>Qn(i,{mode:t,priorityIndex:l+c}),s)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${Fe(e,(i,c)=>Vt(i,{mode:t,variant:"drink",priorityIndex:l+c}),s)}
    </div>
  `:""}function Zn(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:s=null,priorityOffset:l=0}={}){return e.length?n?`
      <div>
        ${Fe(e,(i,c)=>xe(i)==="testfirst_special"&&Ht(i)==="food"?Gt(i,{mode:t,size:"food",priorityIndex:l+c}):Jn(i,{mode:t,priorityIndex:l+c}),s)}
      </div>
    `:`
    <div class="space-y-4">
      ${Fe(e,(i,c)=>Vt(i,{mode:t,variant:"food",priorityIndex:l+c}),s)}
    </div>
  `:""}function ea(e,{mode:t="profile"}={}){if(t==="admin"){const n=String(r?.menu?.filter||"all").trim().toLowerCase(),s=se(r.userProfile),l=x("menu.products","Produkte"),i=e.filter(m=>Ae(m?.type)==="drink"),c=e.filter(m=>Ae(m?.type)!=="drink"),d=(m,h,{addType:v=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${a(m)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${a(m)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(S(h.length))} Eintraege</p>
          </div>
          ${v?`
            <button type="button" data-menu-add-${a(v)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${f("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${h.length?`<div class="space-y-3">${h.map(w=>Bt(w,{mode:"admin"})).join("")}</div>`:(at({functionName:"renderMenuList.adminSection",items:h,rawItems:h,filteredItems:h,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${ie({source:"admin-menu:no-products"})}>${a(x("menu.noProducts","Nuk ka produkte"))}</div>`)}
      </div>
    `;if(s)return d(l,e,{addType:"food"});const p=[{title:x("menu.drinks","Getraenke"),list:i,addType:"drink"},{title:x("menu.food","Speisen"),list:c,addType:"food"}];if(n==="all")return`
        <div>
          ${p.map(m=>d(m.title,m.list,{addType:m.addType})).join("")}
        </div>
      `;const g=p.filter(m=>m.list.length>0);return g.length?`
      <div>
        ${g.map(m=>d(m.title,m.list,{addType:m.addType})).join("")}
      </div>
    `:n==="drink"?d(x("menu.drinks","Getraenke"),[],{addType:"drink"}):n==="food"?d(x("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((n,s)=>Bt(n,{mode:t,priorityIndex:s})).join("")}
    </div>
  `:(at({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${ie({source:`${t}:no-products`})}>
        ${a(x("menu.noProducts","Nuk ka produkte"))}
      </div>
    `)}function Yt(e,{variant:t="focus",suppressLoading:n=!1}={}){if(!e)return"";const{items:s,enabled:l,loading:i}=He(e,{includeInactive:!0}),c=S(s.length),d=String(t||"").trim().toLowerCase()==="travel-offers",p=d?"Ofertat":"Sot ne Fokus",g=d?"Oferta":"Highlights",m=d?"E dukshme ne Travel dhe profil":"E dukshme ne profil",h=d?"Ofertat po ngarkohen...":x("focus.loading","Fokusi po ngarkohet..."),v=d?"Ende nuk ka oferta":"Ende nuk ka fokus";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${a(p)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${a(g)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(c)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${d?"Shfaq ofertat":"Shfaq ne fokus"}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(m)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${l?"checked":""} />
      </label>

      ${s.length?`
        <div class="space-y-3">
          ${s.map(w=>{const C=b(w.imageUrl||"","thumb"),k=X(C)?Y:C,A=w.active!==!1?"Aktiv":"Inaktiv",L=w.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(k)}" class="w-full h-full object-cover" style="object-position:${Te(w)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(w.title||"Sot ne Fokus")}</p>
                  ${w.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(w.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${L}">${A}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${a(w.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${a(w.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Fshi</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:i&&!n?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(h)}</div>
      `:i?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(v)}</div>
      `}
    </div>
  `}function ta(e={}){if(!e?.restaurantId)return!1;const t=String(jt(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||se(e)?!1:ke(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function rr(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Miratuar",className:"text-emerald-600"}:t==="rejected"?{label:"Refuzuar",className:"text-rose-600"}:{label:"Ne pritje te Heart",className:"text-amber-600"}}function ir(e,t){if(!t||!ta(e))return"";const{items:n,loading:s}=Na(t,{includeInactive:!0}),l=S(n.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(l)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Reklamat e reja ose te ndryshuara shfaqen ne tabin e restoranteve vetem pas miratimit nga Heart.</p>
      </div>

      ${n.length?`
        <div class="space-y-3">
          ${n.map(i=>{const c=b(i.imageUrl||"","thumb"),d=X(c)?Y:c,p=rr(i),g=i.category||"RESTAURANT",m=i.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(d)}" class="w-full h-full object-cover" style="object-position:${Te(i)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(i.title||"Ad")}</p>
                  ${i.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(i.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${a(g)} · ${a(m)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${p.className}">${a(p.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${a(i.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${a(i.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Fshi</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:s?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reklamat po ngarkohen...</div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Ende nuk ka reklama</div>
      `}
    </div>
  `}function Wt(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function or(e={}){const t=String(e?.restaurantId||"").trim(),n=t?ue(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function Qt(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function lr(e={}){const t=Qt(e);return[...Wt(t.productIds),...Wt(e.shoppingLandingCardProductIds),...Wt(e.shoppingLandingProductIds)].filter(Boolean)}function Jt(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[n,s])=>{const l=String(n||"").trim(),i=String(s||"").trim();return l&&i&&(t[l]=i),t},{})}function cr(e={}){const t=Qt(e);return{...Jt(e.shoppingLandingProductImageOverrides),...Jt(t.productImageOverrides)}}function dr(e=""){const t=String(e||"").trim(),n=r.shoppingLandingCardEditor&&typeof r.shoppingLandingCardEditor=="object"?r.shoppingLandingCardEditor:{},s=String(n.restaurantId||"").trim();return s&&s!==t?{}:n}function ur(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function pr(e={}){const n=[de(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(ur).filter(Boolean);return n.filter((s,l)=>n.indexOf(s)===l)}function fr(e={},t={},n={}){const s=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!s)return null;const l=pr(e).map(m=>({rawUrl:m,imageUrl:b(m,"thumb")})).filter(m=>m.rawUrl&&!X(m.imageUrl)),i=l[0]?.rawUrl||"",c=String(t?.[s]||"").trim(),d=String(n?.[s]||"").trim(),p=d||c||i,g=p?b(p,"thumb"):"";return{id:s,name:String(e.name||e.title||"Produkt").trim(),price:Be(e),imageUrl:g&&!X(g)?g:"",defaultImageRaw:i,cardImageUrl:c,previewImageUrl:d,imageCandidates:l,objectPosition:te(e)}}function mr(e={},t="",n=[]){if(!t||!se(e))return"";const s=or(e),l=Qt(s),i=dr(t),c=i.saving===!0,d=String(i.status||"").trim(),p=/fehl|error|nicht|nuk|kein/i.test(d),g=String(l.imageUrl||s.shoppingLandingCardImageUrl||s.shoppingLandingImageUrl||"").trim(),m=String(s.logoUrl||s.logo||s.logoURL||s.avatar||e.avatar||"").trim(),h=String(i.imageUrlDraft??g).trim(),v=String(i.imagePreview||h||m||"").trim(),w=v?b(v,"large"):Y,C=String(i.titleDraft??(l.title||s.shoppingLandingCardTitle||e.name||"")).trim(),k=i.active!==void 0?i.active!==!1:l.active!==!1&&s.shoppingLandingCardEnabled!==!1,A=lr(s),L=Array.isArray(i.productIds)?i.productIds.map(I=>String(I||"").trim()).filter(Boolean):null,y=new Set(L||A),T={...cr(s),...Jt(i.productImageOverrides)},j=i.productImagePreviews&&typeof i.productImagePreviews=="object"?i.productImagePreviews:{},F=(Array.isArray(n)?n:[]).filter(I=>I&&String(I.id||"").trim()&&I.hidden!==!0&&I.available!==!1).map(I=>fr(I,T,j)).filter(Boolean),z=y.size?`${S(y.size)} ausgewaehlt`:"Pa zgjedhje = te gjitha produktet";return`
    <div data-shopping-landing-card-editor="${a(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(z)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Ngarko foto">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${a(h)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${a(w||Y)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${a(C||"Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${a(C)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
        </div>

        <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">Shfaq tabin Shopping</p>
            <p class="text-[10px] font-bold text-slate-400">Kjo karte shfaqet ne tabin Shopping.</p>
          </div>
          <input id="shoppingLandingActiveToggle" type="checkbox" class="w-5 h-5 accent-amber-500" style="accent-color:#f97316;" ${k?"checked":""} />
        </label>

        <div class="rounded-[1.8rem] border border-slate-100 bg-slate-50 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produkte</p>
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${a(S(F.length))}</span>
          </div>
          ${F.length?`
            <div class="grid grid-cols-1 gap-2">
              ${F.map(I=>{const D=y.has(I.id),O=I.imageUrl||Y,K=String(I.defaultImageRaw||I.imageCandidates[0]?.rawUrl||"").trim(),$=String(I.cardImageUrl||"").trim(),R=String(I.previewImageUrl||"").trim(),H=!!(R||$&&$!==K),q=R||($&&!I.imageCandidates.some(G=>G.rawUrl===$)?$:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${a(I.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${D?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${a(O)}" class="w-full h-full object-cover" style="object-position:${a(I.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${a(I.name)}</span>
                        ${I.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${a(I.price)}</span>`:""}
                      </span>
                    </label>
                    ${D?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${H?`
                              <button type="button" data-shopping-landing-product-image-reset="${a(I.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95">
                                Standard
                              </button>
                            `:""}
                            <button type="button" data-shopping-landing-product-image-upload="${a(I.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">
                              Upload
                            </button>
                            <input type="file" accept="image/*" data-shopping-landing-product-image-input="${a(I.id)}" class="hidden" />
                          </div>
                        </div>
                        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          ${I.imageCandidates.map((G,J)=>{const ne=J===0,ae=R?!1:ne?!H:$===G.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${a(I.id)}" data-shopping-landing-product-image-choice="${a(I.id)}" value="${ne?"":a(G.rawUrl)}" class="hidden" ${ae?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${ae?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${a(G.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${J+1}</span>
                              </label>
                            `}).join("")}
                          ${q?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${a(I.id)}" data-shopping-landing-product-image-choice="${a(I.id)}" value="${a(q)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${a(b(q,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                              </span>
                              <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">Upload</span>
                            </label>
                          `:""}
                        </div>
                      </div>
                    `:""}
                  </div>
                `}).join("")}
            </div>
          `:`
            <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-300">Ende nuk ka produkte</div>
          `}
        </div>

        ${d?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${p?"text-rose-500":"text-slate-500"}">${a(d)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
          ${c?"Duke ruajtur...":"Ruaj landing card"}
        </button>
      </div>
    </div>
  `}function gr(e){if(!Kt(e)||!yn(e))return"";const n=pt((r.menu.items||[]).filter(s=>xe(s)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(S(n.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>
      ${n.length?`
        <div class="space-y-3">
          ${n.map(s=>{const l=b(de(s),"thumb"),i=X(l)?Y:l,c=Bn(s),d=c.type==="link"?"Link":c.type==="product"?"Produkt-Modal":"Kjo karte",p=Ht(s)==="food"?"Food-Size":"Normal",g=Ga(Ge(s));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(i)}" class="w-full h-full object-cover" style="object-position:${te(s)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(s.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${a(g)}</span>
                    <span>${a(p)}</span>
                    <span>${a(d)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${a(s.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${a(s.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Fshi</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Ende nuk ka karta Special</div>
      `}
    </div>
  `}function na(e,{restaurantId:t="",suppressLoading:n=!1,allowAutoEnsure:s=!0,requirePublicMenuTruth:l=!0}={}){const i=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!i||!ke(e))return"";const c=Qe(r,{profile:e,routePayload:r?.profileView?.routePayload,webDirectEntry:r?.__webDirectEntry,restaurantId:i});if(l&&c.menu.status!=="ready")return"";const d=!l||c.focus.canRenderFocus;if(s&&!r.focus.loading&&!d&&$e(wn(e,i)),l&&!d)return"";const{items:p,loading:g}=d?{items:Array.isArray(c.focus.items)?c.focus.items:[],loading:c.focus.loading}:He(i);if(!(d?!0:He(i).enabled)||!p.length&&!g||n&&g&&!p.length)return"";if(g&&!p.length)return`
      <div class="${Pt()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(x("focus.loading","Fokusi po ngarkohet..."))}</div>
      </div>
    `;const h=Da(p),v=p[h]||p[0],{safeImg:w,fallbackImg:C,imageAttrs:k,lazyAttrs:A}=ve(v.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:v?.id?`focus-carousel:${i}:${String(v.id)}`:""}),L=v.text||"";return`
    <div id="focusCarousel" class="${Pt()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${p.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${f("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${f("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${Zt(v)&&String(v.videoUrl||"").trim()?`
          <video data-focus-media="video" data-focus-video data-autoplay-video src="${a(String(v.videoUrl||"").trim())}" ${w?`poster="${a(w)}"`:""} class="w-full h-56 object-cover" style="object-position:${Te(v)};" muted loop playsinline autoplay preload="metadata"></video>
          <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
          </div>
        `:`
          <img data-focus-media="image" data-focus-image src="${a(w)}" data-fallback-src="${a(C)}"${A} class="w-full h-56 object-cover" style="object-position:${Te(v)};" ${k} decoding="async" />
        `}
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${a(v.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${L?"":"hidden"}">${a(L)}</p>
      </div>
      ${p.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${p.map((T,j)=>`
            <button type="button" data-focus-dot="${j}" class="w-2.5 h-2.5 rounded-full ${j===h?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function br(e,t=220){const n=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${n}`}function aa({label:e,url:t,caption:n}){if(!t)return"";const s=br(t,240);return`
    <button type="button" data-copy-url="${a(t)}" data-copy-label="${a(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${a(s)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${a(e)}</p>
        ${n?`<p class="text-[10px] font-bold text-slate-400 mt-1">${a(n)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function hr({profile:e,restaurantId:t,catalogLabel:n}){if(!t||!ke(e))return"";if(typeof Ze=="function"){const i=tt?tt(t):null;(!i||i.sameRestaurant!==!0||!i.loading&&!i.loaded&&!i.error)&&Ze(e)}const s=typeof tt=="function"?tt(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},l=(s.tables||[]).map(i=>{const c=Oa("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:i});return aa({label:`Tavolina ${i}`,url:c,caption:`${n} per tavolinen ${i}`})}).join("");return`
    <div class="mt-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">QR i tavolines</span>
          <h3 class="text-xl font-black italic tracking-tighter">Tavolinat</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cakto sa tavolina ke. QR e krijuara te tavolinave mbeten perhere nen te njejtat linke.</p>
        </div>
        <label class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <input id="tableQrEnabledToggle" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${s.enabled!==!1?"checked":""} />
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Aktiv</span>
        </label>
      </div>
      <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="tableQrCountInput" class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Numri i tavolinave</label>
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${a(String(s.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${s.saving?"disabled":""}>
          ${s.saving?"Duke ruajtur...":"Ruaj tavolinat"}
        </button>
      </div>
      ${s.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">QR i tavolines po ngarkohet...</p>':""}
      ${s.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${a(s.status)}</p>`:""}
      ${s.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(s.error)}</p>`:""}
      ${l?`
        <div class="grid grid-cols-2 gap-4 mt-6">
          ${l}
        </div>
      `:`
        <div class="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">Ende nuk ka QR kode tavoline</p>
        </div>
      `}
    </div>
  `}function vr(){const e=r.userProfile,t=e.restaurantId||"",n=String(r.user?.uid||"").trim(),s=String(r.__authBootstrapInFlightUid||"").trim(),l=!t&&!!n&&(!!r.__authProfileLoadPromise||s===n),i=Ve(e),c=ke(e),d=r.profileView?.profile?.restaurantId?r.profileView.profile:null,p=_()&&!!d?.restaurantId&&ke(d),g=se(e),m=qa(Aa(e)),h=t?ue(t):null,v=h?.name||h?.restaurantName||e.name||"Business",w=t&&r.menu.restaurantId===t,C=String(r.menu.source||"").trim().toLowerCase(),k=!!w&&C==="collection",A=!!w&&C==="collection"&&r.menu.loading,L=!!t&&(A||!k),y=g?"all":r.menu.filter,T=k?On(r.menu.items,{filter:y,query:r.menu.query}):[],F=yn(e)?T:T.filter(D=>!Za(D)),z=pt(F),I=S(z.length);if(t&&i){as(e);const D=String(r.focus?.truthSource||"").trim().toLowerCase();return!r.focus.loading&&(r.focus.restaurantId!==t||D!=="public-menu")&&$e(e),Ps(e)}return t&&c&&!k&&!A&&Ue(e),t&&c&&!r.focus.loading&&r.focus.restaurantId!==t&&$e(e),t&&ta(e)&&Xe(e),c?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${m}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(v)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${a(I)}</p>
          </div>
        </div>
      `:l?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Biznesi po ngarkohet...</p>
        </div>
      `:`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Ju lutem zgjidh fillimisht biznesin tend ne llogari.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Te cilesimet</button>
        </div>
      `}

      ${t?Yt(t):""}
      ${t?ir(e,t):""}
      ${t?mr(e,t,k?r.menu.items:[]):""}
      ${t&&k?gr(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${f("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${a(r.menu.query||"")}" placeholder="Kerko produkt..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${Vn()}

        ${L?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(x("menu.loading",`${m} wird geladen...`,{label:m}))}</div>`:ea(z,{mode:"admin"})}
        ${r.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${a(r.menu.error)}</div>`:""}
        ${hr({profile:e,restaurantId:t,catalogLabel:m})}
      `:""}

    </div>
  `:p?mt(d):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${f("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${m}</h2>
          <p class="text-sm text-slate-500">Ky funksion eshte vetem per profile biznesi.</p>
        </div>
      </div>
    `}function mt(e,{mode:t="profile",allowAutoEnsure:n=!0}={}){const s=r?.profileView?.routePayload&&typeof r.profileView.routePayload=="object"?r.profileView.routePayload:null,l=r?.__webDirectEntry&&typeof r.__webDirectEntry=="object"&&r.__webDirectEntry.active===!0?r.__webDirectEntry:null;let i=Qe(r,{profile:e,routePayload:s,webDirectEntry:l});const c=i.restaurantId||Ya(e,s);if(!c)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${a(x("menu.noRestaurantId","Nuk u gjet ID e lokalit"))}
      </div>
    `;const d=wn(e,c),p=se(d),g=ke(d)&&!p;g&&(i=Qe(r,{profile:d,routePayload:s,webDirectEntry:l,restaurantId:c}));const m=String(l?.canonicalRestaurantId||l?.restaurantId||"").trim(),h=new Set(i.targetIds),v=i.menu.status==="ready",w=i.focus.canRenderFocus,C=v&&g,k=i.focus.matches===!0&&i.focus.loading===!0,L=String(r?.profileView?.menuAccessSource||l?.menuAccessSource||s?.menuAccessSource||"").trim().toLowerCase()==="qr",y=l?.active===!0&&l?.webPriority===!0&&l?.menuFirst===!0&&String(r?.activeTab||"").trim().toLowerCase()==="profile"&&String(r?.profileTopTab||"").trim().toLowerCase()==="menu"&&(m===c||h.has(c)),T=y&&!L,j=["ready","empty","error"].includes(i.menu.status),F=y&&j,z=y&&(!C||i.menu.status!=="ready"),I=!C||i.focus.settled===!0||i.focus.confirmedEmpty===!0||i.menu.status!=="ready";n&&!F&&!j&&ce(d),n&&!z&&!I&&!k&&v&&(!T||j)&&$e(d);const O=i.menu.canRenderItems?pt(On(i.menu.items,{filter:"all",query:""})).filter(oe=>!Ut(oe)):[],K=i.menu.error||"",$=Sr(i.menu,O),{hasItems:R,hasError:H,isLoading:q,shouldRenderNoProducts:G}=$;Ba({profile:d,routePayload:s,surface:i,decision:$});const J={profile:d,routePayload:s,surface:i,decision:$,rawItems:i.menu.items,items:O,filteredItems:O,source:"public-menu"},ne=Ka(i,O),ae=O.filter(oe=>Ge(oe)==="drink"),Se=O.filter(oe=>Ge(oe)!=="drink"),Xt=0,pe=ae.length,Ie=Kt(e),gt=Ie||p,bt=new Set;R&&c&&(Ta(O,c),Ja(O,c));const ht=c&&w?(Array.isArray(i.focus.items)?i.focus.items:[]).map(oe=>qt({...oe,objectPosition:Te(oe)})).filter(Boolean):[],vt=i.focus.status==="empty"||i.focus.status==="error",Ye=g&&!w&&!vt&&i.menu.status!=="empty"&&i.menu.status!=="error",We=ht.length?Wn(d,ht,{mode:t}):Ye?Zs({...J,reason:"focus-truth-pending"}):"",fe=gt?We:na(d,{restaurantId:c,suppressLoading:!0,allowAutoEnsure:v&&(!T||j),requirePublicMenuTruth:!0})||(Ye?Xs({...J,reason:"focus-truth-pending"}):"");return Ie?`
      <div class="app-main-content-safe"${ne}>
        ${q?`
          ${We}
          ${qn({...J,reason:"menu-loading"})}
        `:`
          ${R?sr(d,O,{mode:t,publicMenuSurfaceState:i,focusFallbackHtml:We}):H?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(x("menu.loadError","Menuja nuk mund te ngarkohej"))}</div>`:G?(at({...J,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${ie({source:"public-menu:no-products"})}>${a(x("menu.noProducts","Nuk ka produkte"))}</div>`):qn({...J,reason:"menu-not-confirmed-empty"})}
          ${K?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(K)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5"${ne}>
      ${fe}
      ${q?`
        ${Yn({isShop:p,debugContext:{...J,reason:"menu-loading"}})}
      `:`
        ${R?`
          ${p?`
            ${Ma(O,{profile:e})}
          `:`
            ${ae.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(x("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Xn(ae,{mode:t,useTestfirstCardUi:Ie,seenCategories:bt,priorityOffset:Xt})}
                </div>
              </section>
            `:""}
            ${Se.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(x("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Zn(Se,{mode:t,useTestfirstCardUi:Ie,seenCategories:bt,priorityOffset:pe})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${H?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(x("menu.loadError","Menuja nuk mund te ngarkohej"))}
              </div>
            </div>
          `:G?`
            ${at({...J,functionName:"renderProfileMenuView",renderDecision:p?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${ie({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(x("menu.noProducts","Nuk ka produkte"))}
              </div>
            </div>`}
          `:`
            ${Yn({isShop:p,debugContext:{...J,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${K?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(K)}</div>`:""}
      `}
    </div>
  `}function xr(){const e=r.userProfile,t=E(e),n=t?r.businessPosts:r.userPosts,s=String(r.user?.uid||e?.uid||"").trim(),l=String(e?.restaurantId||"").trim(),i=String(r.__userPostsLoadingUid||"").trim(),c=String(r.__businessPostsLoadingRestaurantId||"").trim(),d=String(r.__authBootstrapInFlightUid||"").trim(),p=!!s&&i===s,g=!!l&&c===l,m=!!s&&d===s,h=t?g||m&&!n.length:p||m&&!n.length,v=String(e.handle||U(e.name||"user")).replace(/^@/,""),C=a(e.bio||"").replace(/\n/g,"<br>")||a(x("profile.noBio","Nuk ka bio.")),k=lt(e),A=k==="menu",L=k==="checkins",y=oa(n),T=b(e.avatar,"avatar"),j=P(t),F=Nt(e);return`
    <div class="app-main-content-safe">
      ${F==="profile"||F==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Dn(e,{mode:"self",avatarUrl:T,avatarFit:j,followersLabel:S(e.followers),bioHtml:C}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${a(T)}" data-fallback-src="${a(Y)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${j} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(S(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(x("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(S(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(x("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${a(v)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${C}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${f("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${f("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${Dt(e)}
      ${Ot(e)}

      ${A?(()=>{const I=Ve(e),D=!I&&t&&!rt(e)?Ln(e):"";return D&&Mn(D,e),`
        <div${D?` ${Ke}="${a(D)}"`:""}>
          ${I?zt(e):mt(e)}
        </div>
      `})():L?`
        ${Mt()}
      `:`
        ${h&&!y.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(x("profile.postsLoading","Postimet po ngarkohen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${r.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Lt(y,r.profileViewMode)}
          </div>
        `}
      `}
      `:`
        ${F==="cart"?B(e):F==="favorites"?Q(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:$n,renderProfilePostsFancy:Lt,renderProfileCheckins:Mt,renderProfileTabs:Dt,renderProfileViewControls:Ot,renderPublicProfileView:Hs,renderMenuFilterRow:Vn,renderMenuLayoutSection:Qs,renderMenuItemCard:Bt,renderMenuItemCardStacked:Vt,renderMenuDrinkGrid:Xn,renderMenuFoodList:Zn,renderMenuList:ea,renderFocusAdminSection:Yt,renderFocusCarousel:na,renderMenuQrCard:aa,renderMenuAdminView:vr,renderProfileMenuView:mt,renderProfileView:xr}}export{ao as createProfileMenuFocusRenderController};
