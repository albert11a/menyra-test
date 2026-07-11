import{_ as pr}from"./domain-auth-s7TCC84S.js";import{w as fr}from"./domain-menu-eager-N-6QjTHR.js";import{a as Jt}from"./domain-media-eager-B90n_Ot7.js";import{am as Ye,an as mr,t as gr,ao as br,k as hr,ap as We}from"./domain-feed-social-eager-DClOueWR.js";import{n as ra,g as Xt,h as vr,i as xr}from"./domain-app-events-4xy4qFSW.js";import{K as wr,L as yr,M as $r,N as kr,O as Sr,P as Ir,Q as Cr,J as Pr,R as Ar,A as Tr,g as jr,B as Lr,S as _r,T as Fr,b as Mr,d as Rr}from"./vendor-firebase-D7Ks7H8l.js";import{a as Er,r as zr,b as ia,c as Nr,p as Dr,w as Ur,B as oa}from"./business-type-hint-utils-DMmUx9Wd.js";import"./domain-public-profile-BW4dw-Ab.js";const ln=Object.freeze([Object.freeze({key:"city",label:"Qyteti",labelDe:"Stadt"}),Object.freeze({key:"beach",label:"Plazha",labelDe:"Straende"}),Object.freeze({key:"sights",label:"Vende per te pare",labelDe:"Sehenswuerdigkeiten"}),Object.freeze({key:"activities",label:"Aktivitete",labelDe:"Aktivitaeten"}),Object.freeze({key:"nature",label:"Natyre",labelDe:"Natur"}),Object.freeze({key:"food",label:"Restorante & Kafene",labelDe:"Restaurants & Cafes"}),Object.freeze({key:"nearby",label:"Vende te rendesishme",labelDe:"Wichtige Orte"})]),Br=Object.freeze(ln.map(l=>l.key)),Hr=Object.freeze([Object.freeze({key:"all",labelDe:"Ganzjaehrig"}),Object.freeze({key:"summer",labelDe:"Saisonal Sommer"}),Object.freeze({key:"winter",labelDe:"Saisonal Winter"})]),Or=Object.freeze(Hr.map(l=>l.key)),Vr=12;function ve(l=""){return l==null?"":String(l).trim()}function Zt(l){const r=Number(l);return Number.isFinite(r)?r:null}function Kr(l=""){const r=ve(l).toLowerCase();return Br.includes(r)?r:{qyteti:"city",stadt:"city",plazha:"beach",plazhi:"beach",strand:"beach",straende:"beach",sehenswuerdigkeiten:"sights",sehenswurdigkeiten:"sights",aktivitete:"activities",aktivitaeten:"activities",natyre:"nature",natur:"nature",restorante:"food",restaurants:"food",cafes:"food",kafene:"food",umgebung:"nearby",rrethina:"nearby"}[r]||"nearby"}function qr(l=""){const r=ve(l).toLowerCase();return Or.includes(r)?r:"all"}function Gr(l=Date.now(),r=Math.random()){const u=Math.max(0,Number(l)||0).toString(36),a=Math.floor(Math.max(0,Math.min(.999999,Number(r)||0))*36**6).toString(36).padStart(6,"0");return`place_${u}_${a}`}function Yr(l){return Array.isArray(l)?l.map(r=>ve(r)).filter(Boolean).slice(0,Vr):[]}function Wr(l={},{index:r=0}={}){const u=l&&typeof l=="object"?l:{},a=Zt(u.lat??u.latitude??u.coords?.lat),g=Zt(u.lng??u.lon??u.longitude??u.coords?.lng),f=Zt(u.priority);return{id:ve(u.id)||Gr(Date.now()+r),name:ve(u.name),category:Kr(u.category),description:ve(u.description??u.text).slice(0,600),address:ve(u.address??u.plusCode).slice(0,240),lat:a,lng:g,coverImageUrl:ve(u.coverImageUrl??u.imageUrl??u.coverUrl),gallery:Yr(u.gallery),priority:f==null?0:Math.max(0,Math.min(100,Math.round(f))),pinned:u.pinned===!0,season:qr(u.season??u.seasonal),active:u.active!==!1}}const Qr=6371e3,Jr=80,Xr=600,Zr=1600;function vt(l=0){return(Number(l)||0)*(Math.PI/180)}function ze(l){return l==null||l===""?NaN:Number(l)}function $t(l={}){return Number.isFinite(ze(l?.lat))&&Number.isFinite(ze(l?.lng))}function ei(l,r,u,a){const g=ze(l),f=ze(r),R=ze(u),U=ze(a);if(![g,f,R,U].every(Number.isFinite))return null;const Y=vt(R-g),L=vt(U-f),A=Math.sin(Y/2)**2+Math.cos(vt(g))*Math.cos(vt(R))*Math.sin(L/2)**2;return Math.round(2*Qr*Math.asin(Math.min(1,Math.sqrt(A))))}function ti(l){const r=Number(l);return!Number.isFinite(r)||r<0?"":r<1e3?`${Math.max(10,Math.round(r/10)*10)} m`:r<1e4?`${(r/1e3).toFixed(1).replace(/\.0$/,"")} km`:`${Math.round(r/1e3)} km`}function ni(l){const r=Number(l);return!Number.isFinite(r)||r<0?null:r<=Zr?{mode:"walk",minutes:Math.max(1,Math.round(r/Jr))}:{mode:"drive",minutes:Math.max(1,Math.round(r/Xr))}}function la(l,r={}){const u=ni(l);if(!u)return"";const a=String(r.walk||"min in Gehweite"),g=String(r.drive||"min mit dem Auto");return`${u.minutes} ${u.mode==="walk"?a:g}`}const ba=200;function he(l=""){return l==null?"":String(l).trim()}function ca(l){return Array.isArray(l)?Array.from(new Set(l.map(r=>he(r)).filter(Boolean))).slice(0,ba):[]}function ha(l={}){const r=l&&typeof l=="object"?l:{},u=r.placePatches&&typeof r.placePatches=="object"?r.placePatches:{},a={};return Object.entries(u).slice(0,ba).forEach(([g,f])=>{const R=he(g);if(!R||!f||typeof f!="object")return;const U={};he(f.name)&&(U.name=he(f.name)),he(f.description)&&(U.description=he(f.description).slice(0,600)),he(f.coverImageUrl)&&(U.coverImageUrl=he(f.coverImageUrl)),Object.keys(U).length&&(a[R]=U)}),{hidden:ca(r.hidden),pinned:ca(r.pinned),placePatches:a}}function tn({places:l=[],overrides:r={},hotelCoords:u=null,includeHidden:a=!1}={}){const g=ha(r),f=new Set(g.hidden),R=new Map(g.pinned.map((L,A)=>[L,A])),U=$t(u)?u:null;return(Array.isArray(l)?l:[]).map((L,A)=>Wr(L,{index:A})).filter(L=>L.name&&L.active).map(L=>{const A=g.placePatches[L.id]||{},Q=U&&$t(L)?ei(U.lat,U.lng,L.lat,L.lng):null;return{...L,...A,hidden:f.has(L.id),pinned:R.has(L.id)||L.pinned,pinnedRank:R.has(L.id)?R.get(L.id):null,distanceMeters:Q}}).filter(L=>a||!L.hidden).sort((L,A)=>{const Q=L.pinnedRank!=null,xe=A.pinnedRank!=null;if(Q!==xe)return Q?-1:1;if(Q&&xe&&L.pinnedRank!==A.pinnedRank)return L.pinnedRank-A.pinnedRank;if(L.pinned!==A.pinned)return L.pinned?-1:1;if(L.priority!==A.priority)return A.priority-L.priority;const Ce=Number.isFinite(L.distanceMeters)?L.distanceMeters:1/0,Pe=Number.isFinite(A.distanceMeters)?A.distanceMeters:1/0;return Ce!==Pe?Ce-Pe:String(L.name).localeCompare(String(A.name))})}function ai(l=[]){const r=Array.isArray(l)?l:[];return ln.map(u=>({...u,places:r.filter(a=>a.category===u.key)})).filter(u=>u.places.length)}const nn="mnyraHotelDestinationSections",da="mnyraHotelDetailStyles",si="/apps/menyra-social/styles/hotel-detail.css?v=2026-07-11-hotel-detail-v4",ua=Object.freeze({walk:"min në këmbë",drive:"min me makinë"}),De=Object.freeze({rooms:"Qëndrimi yt",city:"Përreth teje",beach:"Deti afër",sights:"Vlen të shihet",activities:"Përjeto zonën",nature:"Natyrë e gjallë",food:"Shijo lokal",nearby:"Afër teje",amenities:"Pa pagesë shtesë",map:"Zbulo zonën",rating:"Nga vizitorët"}),an=Object.freeze({city:"Qyteti",beach:"Plazha",sights:"Vende për të parë",activities:"Aktivitete",nature:"Natyra",food:"Restorante & Kafene",nearby:"Vende të rëndësishme"}),sn=Object.freeze({bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>',building:'<path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',waves:'<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>',compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',sparkles:'<path d="m12 3-1.2 3.1L8 7.5l2.8 1.4L12 12l1.2-3.1L16 7.5l-2.8-1.4zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8zM18 13l-1 2.7-3 1.3 3 1.3 1 2.7 1-2.7 3-1.3-3-1.3z"/>',tree:'<path d="m17 14 3 3h-5l3 3H6l3-3H4l3-3H3l5-5H5l7-7 7 7h-3l5 5zM12 20v2"/>',coffee:'<path d="M10 2v2M14 2v2M6 2v2M18 8h1a3 3 0 0 1 0 6h-1M4 8h14v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>',pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0"/><circle cx="12" cy="10" r="3"/>',nav:'<path d="m3 11 19-9-9 19-2-8z"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',expand:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/>',check:'<path d="m20 6-11 11-5-5"/>',wifi:'<path d="M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',car:'<path d="m5 17-2-1v-4l2-5h14l2 5v4l-2 1M5 17v2M19 17v2M3 13h18M7 13h.01M17 13h.01"/>',snow:'<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93M8 5l4 2 4-2M8 19l4-2 4 2"/>',shield:'<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',umbrella:'<path d="M2 12h20M12 12v8a2 2 0 0 0 4 0M2 12a10 10 0 0 1 20 0M12 2v1"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',size:'<path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6"/>'}),ri=Object.freeze({city:"building",beach:"waves",sights:"compass",activities:"sparkles",nature:"tree",food:"coffee",nearby:"pin"}),ii=Object.freeze([{keywords:["wifi","wi-fi","internet"],icon:"wifi"},{keywords:["parkim","parking","garazh"],icon:"car"},{keywords:["mengjes","mëngjes","breakfast","fruehstueck"],icon:"coffee"},{keywords:["klime","klimë","kondicioner","ac"],icon:"snow"},{keywords:["plazh","det","beach","pishine","pishinë","pool"],icon:"waves"},{keywords:["shezlong","ombrelle","umbrella"],icon:"umbrella"},{keywords:["recepsion","reception","siguri","security","24"],icon:"shield"},{keywords:["pastrim","cleaning","spa"],icon:"sparkles"},{keywords:["famil","person"],icon:"users"}]);function V(l=""){return l==null?"":String(l).trim()}function N(l=""){return V(l).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ie(l="pin",r=""){const u=sn[l]||sn.pin;return`<svg class="mhd-icon ${r}" viewBox="0 0 24 24" aria-hidden="true">${u}</svg>`}function pa(l=typeof document>"u"?null:document){if(!l||l.getElementById(da))return;const r=l.createElement("link");r.id=da,r.rel="stylesheet",r.href=si,l.head.appendChild(r)}function Ue({iconName:l="pin",eyebrow:r="",title:u=""}={}){return`
    <div class="mhd-section-title">
      <span class="mhd-section-icon">${ie(l)}</span>
      <div>
        ${r?`<small>${N(r)}</small>`:""}
        <h2>${N(u)}</h2>
      </div>
    </div>
  `}function oi(l=""){const r=V(l);if(!r)return null;const u=r.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i);if(!u)return null;const a=Number(String(u[1]||"").replace(",","."));if(!Number.isFinite(a)||a<0)return null;const g=String(u[2]||"m").trim().toLowerCase();return Math.round(g.startsWith("k")?a*1e3:a)}function li(l={}){const r=l.manualDistance&&typeof l.manualDistance=="object"?l.manualDistance:null;if(r){const g=V(r.label);if(!g)return"";const f=oi(g),R=r.direct!==!0&&Number.isFinite(f)?la(f,ua):"";return`
      <div class="mhd-distance">
        <span>${ie("nav","mhd-icon--sm")}${N(g)}</span>
        ${R?`<span>${ie("clock","mhd-icon--sm")}${N(R)}</span>`:""}
      </div>
    `}const u=ti(l.distanceMeters);if(!u)return"";const a=la(l.distanceMeters,ua);return`
    <div class="mhd-distance">
      <span>${ie("nav","mhd-icon--sm")}${N(u)}</span>
      ${a?`<span>${ie("clock","mhd-icon--sm")}${N(a)}</span>`:""}
    </div>
  `}function ci(l={},{nearestPlaceId:r="",imageUrlFn:u=null}={}){const a=ln.find(U=>U.key===l.category)?.label||"",g=l.id&&l.id===r?"Më afër hotelit":a,f=V(l.coverImageUrl),R=f&&typeof u=="function"&&V(u(f))||f;return`
    <article class="mhd-card">
      <div class="mhd-photo">
        ${R?`<img src="${N(R)}" alt="${N(l.name)}" loading="lazy" decoding="async" />`:""}
        ${g?`<span class="mhd-pill mhd-pill--overlay ${l.id===r?"mhd-pill--accent":""}">${N(g)}</span>`:""}
      </div>
      <div class="mhd-card-body">
        <h3>${N(l.name)}</h3>
        ${li(l)}
        ${l.description?`<p class="mhd-copy">${N(l.description)}</p>`:""}
      </div>
    </article>
  `}function fa({template:l=null,overrides:r={},hotelCoords:u=null,imageUrlFn:a=null,manualBeachDistance:g=null}={}){if(!l||!Array.isArray(l.places)||!l.places.length)return"";const f=tn({places:l.places,overrides:r,hotelCoords:$t(u)?u:null});if(!f.length)return"";const R=f.filter(A=>Number.isFinite(A.distanceMeters)).sort((A,Q)=>A.distanceMeters-Q.distanceMeters)[0]||null,U=ai(f),Y=g&&typeof g=="object"?g:null,L=Y?Y.direct===!0?"Në plazh":V(Y.label):"";if(L){const A=U.find(Q=>Q.key==="beach");A?.places?.length&&(A.places[0]={...A.places[0],manualDistance:{label:L,direct:Y.direct===!0}})}return U.map(A=>`
    <section class="mhd-section">
      ${Ue({iconName:ri[A.key]||"pin",eyebrow:De[A.key]||"",title:an[A.key]||A.label})}
      <div class="mhd-rail">
        ${A.places.map(Q=>ci(Q,{nearestPlaceId:R?.id||"",imageUrlFn:a})).join("")}
      </div>
    </section>
  `).join("")}function wt(){return`
    <section class="mhd-section">
      <div class="mhd-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>
  `}function di(){return`
    <div class="mhd">
      ${wt()}
      ${wt()}
      ${wt()}
    </div>
  `}function ui(l={},r="€"){const u=V(l.priceLabel||l.priceText);if(u)return u;const a=Number(l.price??l.startingPrice??l.pricePerNight);if(!Number.isFinite(a)||a<=0)return"";const g=V(l.currency||l.currencyCode)||r;return g==="€"||g.toUpperCase()==="EUR"?`€${a}`:`${a} ${g}`}function pi(l=[]){const r=(Array.isArray(l)?l:[]).filter(u=>V(u?.label));return r.length?`
    <div class="mhd-distance">
      ${r.map(u=>`<span>${ie(u.icon||"check","mhd-icon--sm")}${N(u.label)}</span>`).join("")}
    </div>
  `:""}function fi({rooms:l=[],offers:r=[],imageUrlFn:u=null}={}){const a=(Array.isArray(l)&&l.length?l:Array.isArray(r)?r:[]).filter(g=>g&&g.active!==!1&&V(g.title));return a.length?`
    <section class="mhd-section">
      ${Ue({iconName:"bed",eyebrow:De.rooms,title:"Dhoma"})}
      <div class="mhd-rail">
        ${a.map(g=>{const f=V(g.imageUrl),R=f&&typeof u=="function"&&V(u(f))||f,U=ui(g);return`
            <article class="mhd-card">
              <div class="mhd-photo">
                ${R?`<img src="${N(R)}" alt="${N(g.title)}" loading="lazy" decoding="async" />`:""}
                ${V(g.tag||g.badge)?`<span class="mhd-pill mhd-pill--overlay mhd-pill--accent">${N(g.tag||g.badge)}</span>`:""}
              </div>
              <div class="mhd-card-body">
                <div class="mhd-heading-price">
                  <h3>${N(g.title)}</h3>
                  ${U?`<span class="mhd-price"><strong>${N(U)}</strong><small>/ natë</small></span>`:""}
                </div>
                ${pi(g.metaParts)}
                ${V(g.text||g.description)?`<p class="mhd-copy">${N(g.text||g.description)}</p>`:""}
              </div>
            </article>
          `}).join("")}
      </div>
    </section>
  `:""}function mi({city:l="",address:r="",imageUrl:u="",imageUrlFn:a=null}={}){const g=V(l);if(!g)return"";const f=V(u),R=f&&typeof a=="function"&&V(a(f))||f;return`
    <section class="mhd-section">
      ${Ue({iconName:"building",eyebrow:De.city,title:an.city})}
      <div class="mhd-rail">
        <article class="mhd-card">
          <div class="mhd-photo">
            ${R?`<img src="${N(R)}" alt="${N(g)}" loading="lazy" decoding="async" />`:""}
            <span class="mhd-pill mhd-pill--overlay">${N(an.city)}</span>
          </div>
          <div class="mhd-card-body">
            <h3>${N(g)}</h3>
            ${V(r)?`<p class="mhd-copy">${N(r)}</p>`:""}
          </div>
        </article>
      </div>
    </section>
  `}function gi(l=""){const r=V(l).toLowerCase();for(const u of ii)if(u.keywords.some(a=>r.includes(a)))return u.icon;return"check"}function bi({amenities:l=[]}={}){const r=(Array.isArray(l)?l:[]).map(u=>V(u)).filter(Boolean);return r.length?`
    <section class="mhd-section">
      ${Ue({iconName:"check",eyebrow:De.amenities,title:"Përfshihet"})}
      <div class="mhd-amenities">
        ${r.slice(0,12).map(u=>`
          <article class="mhd-amenity">
            <span class="mhd-amenity-icon">${ie(gi(u))}</span>
            <h3>${N(u)}</h3>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}const rn="mnyraHotelDetailMap";function hi({address:l="",city:r="",destinationName:u="",mapsUrl:a="",hotelCoords:g=null,hotelName:f=""}={}){const R=[V(l),V(r)].filter(Boolean).join(", ")||V(u);if(!R&&!a)return"";const U=$t(g),Y=U?`id="${rn}" data-map-lat="${N(String(g.lat))}" data-map-lng="${N(String(g.lng))}" data-map-name="${N(V(f))}"`:"";return`
    <section class="mhd-section">
      ${Ue({iconName:"compass",eyebrow:De.map,title:"Harta e zbulimit"})}
      <div class="mhd-map-card">
        <div class="mhd-map-art ${U?"mhd-map-art--live":""}" ${Y}>
          <div class="mhd-map-water"></div>
          <span class="mhd-map-pin">${ie("bed")}</span>
        </div>
        <div class="mhd-map-info">
          <div class="mhd-address">
            <span>${ie("pin")}</span>
            <div>
              <small>Lokacioni</small>
              <strong>${N(R||"Hotel")}</strong>
              ${V(u)?`<p>Plazhi, qyteti dhe vendet kryesore rreth ${N(u)}.</p>`:""}
            </div>
          </div>
          ${a?`<a class="mhd-primary" href="${N(a)}" target="_blank" rel="noopener noreferrer">${ie("expand","mhd-icon--sm")}Hap hartën</a>`:""}
        </div>
      </div>
    </section>
  `}function vi({rating:l="",reviewCount:r="",summary:u=""}={}){const a=Number(V(l).replace(",","."));if(!Number.isFinite(a)||a<=0)return"";const g=Math.max(1,Math.min(5,Math.round(a))),f=Array.from({length:g}).map(()=>`<svg class="mhd-icon mhd-star" viewBox="0 0 24 24" aria-hidden="true">${sn.star}</svg>`).join(""),R=V(r);return`
    <section class="mhd-section">
      ${Ue({iconName:"star",eyebrow:De.rating,title:"Vlerësimet"})}
      <div class="mhd-rating">
        <div class="mhd-score">
          <strong>${N(a.toFixed(1))}</strong>
          <div>
            <div class="mhd-stars">${f}</div>
            <p>${N([u,R?`${R} vlerësime`:""].filter(Boolean).join(" · ")||"Nga vizitorët")}</p>
          </div>
        </div>
      </div>
    </section>
  `}function xi({rooms:l=[],offers:r=[],amenities:u=[],address:a="",city:g="",cityImageUrl:f="",destinationId:R="",destinationName:U="",destinationSectionsHtml:Y="",mapsUrl:L="",hotelCoords:A=null,hotelName:Q="",rating:xe="",reviewCount:Ce="",ratingSummary:Pe="",imageUrlFn:Qe=null}={}){const we=!!V(R),It=Y||(we?wt():"");return`
    <div class="mhd">
      ${fi({rooms:l,offers:r,imageUrlFn:Qe})}
      <div id="${nn}" data-destination-id="${N(R)}" style="display:contents">
        ${It}
      </div>
      ${we?"":mi({city:g,address:a,imageUrl:f,imageUrlFn:Qe})}
      ${bi({amenities:u})}
      ${hi({address:a,city:g,destinationName:U,mapsUrl:L,hotelCoords:A,hotelName:Q})}
      ${vi({rating:xe,reviewCount:Ce,summary:Pe})}
    </div>
  `}function Ie(l=""){return l==null?"":String(l).trim()}function ee(l=""){return Ie(l).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ee({id:l="",label:r="",value:u="",placeholder:a="",type:g="text",inputmode:f=""}={}){return`
    <label class="block">
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${ee(r)}</span>
      <input id="${ee(l)}" name="${ee(l)}" type="${ee(g)}" value="${ee(u)}" placeholder="${ee(a)}" ${f?`inputmode="${ee(f)}"`:""} class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
    </label>
  `}function wi(l={},{imagePreview:r=""}={}){const u=ee(l.id),a=Ie(r)||Ie(l.imageUrl);return`
    <div data-hotel-room-row="${u}" class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">${ee(l.title||"Dhomë e re")}</p>
        <button type="button" data-hotel-room-remove="${u}" class="w-9 h-9 rounded-xl bg-white text-slate-400 border border-slate-100 flex items-center justify-center text-xs font-black" aria-label="Fshi dhomën">✕</button>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-20 h-20 rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
          ${a?`<img id="hotelRoomImagePreview_${u}" src="${ee(a)}" alt="" loading="lazy" class="w-full h-full object-cover" />`:`<span id="hotelRoomImagePreview_${u}" class="text-[9px] font-black text-slate-300 uppercase">Foto</span>`}
        </div>
        <input type="file" id="hotelRoomImageInput_${u}" data-hotel-room-image-input="${u}" accept="image/*" hidden />
        <button type="button" data-hotel-room-image-trigger="${u}" class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Ngarko foto</button>
        <input type="hidden" id="hotelRoomImageUrl_${u}" value="${ee(l.imageUrl)}" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${Ee({id:`hotelRoomTitle_${u}`,label:"Emri i dhomës",value:l.title,placeholder:"Dhomë Deluxe me pamje nga deti"})}
        ${Ee({id:`hotelRoomPrice_${u}`,label:"Çmimi / natë (€)",value:l.price==null?"":String(l.price),placeholder:"118",inputmode:"decimal"})}
        ${Ee({id:`hotelRoomPersons_${u}`,label:"Persona",value:l.persons==null?"":String(l.persons),placeholder:"2",inputmode:"numeric"})}
        ${Ee({id:`hotelRoomBeds_${u}`,label:"Krevate",value:l.beds,placeholder:"1 king"})}
        ${Ee({id:`hotelRoomSize_${u}`,label:"Madhësia (m²)",value:l.size==null?"":String(l.size),placeholder:"31",inputmode:"numeric"})}
        ${Ee({id:`hotelRoomTag_${u}`,label:"Etiketa (opsionale)",value:l.tag,placeholder:"Më e zgjedhura"})}
      </div>
      <label class="block">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Përshkrimi (opsional)</span>
        <textarea id="hotelRoomDesc_${u}" name="hotelRoomDesc_${u}" rows="2" placeholder="Detaje të shkurtra për dhomën..." class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${ee(l.description)}</textarea>
      </label>
      <label class="flex items-center justify-between gap-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktive në profil</span>
        <input id="hotelRoomActive_${u}" type="checkbox" ${l.active!==!1?"checked":""} class="w-5 h-5 accent-slate-900" />
      </label>
    </div>
  `}function yi({restaurantId:l="",record:r={},editorState:u={}}={}){const a=Ie(l);if(!a)return"";const g=Ie(u.restaurantId)===a,f=g&&Array.isArray(u.rooms)?ra(u.rooms):ra(r?.hotelRooms),R=g&&u.imagePreviews&&typeof u.imagePreviews=="object"?u.imagePreviews:{},U=g&&u.saving===!0,Y=g?Ie(u.status):"";return`
    <div data-hotel-rooms-editor="${ee(a)}" class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
          <h3 class="text-xl font-black italic tracking-tighter">Dhomat</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dhomat shfaqen te detajet e hotelit</p>
        </div>
        <button type="button" id="hotelRoomAddBtn" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95 text-lg font-black" aria-label="Shto dhomë">+</button>
      </div>
      ${f.length?`<div class="space-y-4">${f.map(L=>wi(L,{imagePreview:Ie(R[L.id])})).join("")}</div>`:'<p class="text-sm font-bold text-slate-400">Ende pa dhoma. Shto dhomën e parë me +.</p>'}
      ${Y?`<p class="text-[10px] font-black uppercase tracking-widest ${Y.includes("ruajt")?"text-emerald-600":"text-slate-500"}">${ee(Y)}</p>`:""}
      <button id="hotelRoomsSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${U?"disabled":""}>
        ${U?"Po ruhen...":"Ruaj Dhomat"}
      </button>
    </div>
  `}const $i=Object.freeze({apiKey:"AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",authDomain:"menyra-c0e68.firebaseapp.com",projectId:"menyra-c0e68",storageBucket:"menyra-c0e68.firebasestorage.app",messagingSenderId:"528471049588",appId:"1:528471049588:web:c507d87c0832562a855821",measurementId:"G-YLFKC8726B"});function ki(){try{const l=String(globalThis?.location?.hostname||"").trim().toLowerCase();if(!["localhost","127.0.0.1","::1"].includes(l))return null;const r=globalThis?.__MENYRA_FIREBASE_EMULATORS__,u=r&&typeof r=="object"?r:{},a=new URLSearchParams(globalThis?.location?.search||"").get("firebase-emulator")==="1";if(u.enabled!==!0&&!a)return null;const g=String(u.projectId||"mnyra-local").trim();return/^(mnyra-local|demo-|test-|local-)/.test(g)?Object.freeze({projectId:g,host:String(u.host||"127.0.0.1").trim()||"127.0.0.1",firestorePort:Math.max(1,Number(u.firestorePort||8080)||8080),authPort:Math.max(1,Number(u.authPort||9099)||9099),functionsPort:Math.max(1,Number(u.functionsPort||5001)||5001)}):null}catch{return null}}const ue=ki(),en=Object.freeze(ue?{apiKey:"mnyra-local-api-key",authDomain:`${ue.projectId}.firebaseapp.com`,projectId:ue.projectId,storageBucket:`${ue.projectId}.appspot.com`,messagingSenderId:"000000000000",appId:"1:000000000000:web:mnyra-local"}:$i),ma=new WeakSet,ga=new WeakSet;function Si({firestore:l=null,authInstance:r=null}={}){return ue?(l&&!ma.has(l)&&(_r(l,ue.host,ue.firestorePort),ma.add(l)),r&&!ga.has(r)&&(Fr(r,`http://${ue.host}:${ue.authPort}`,{disableWarnings:!0}),ga.add(r)),!0):!1}function Ii(){try{const l=jr();if(l?.options?.projectId===en.projectId&&l?.options?.appId===en.appId)return l}catch{}return Lr(en)}const kt=Ii();function Ci(){try{return globalThis?.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__===!0}catch{return!1}}let St;try{const l=Ci();St=wr(kt,{experimentalAutoDetectLongPolling:!0,localCache:l?yr():$r({tabManager:kr()})});try{globalThis.__MENYRA_FIRESTORE_LOCAL_CACHE_KIND__=l?"memory-public-website":"persistent-multitab"}catch{}}catch{St=Sr(kt)}let on;try{on=Ir(kt,{persistence:[Cr,Pr,Ar]})}catch{on=Tr(kt)}Si({firestore:St,authInstance:on});const Pi="destinationsPublic",va="menyra_social_destination_public_cache_v1::",Ai=360*60*1e3,yt=new Map,xt=new Map;function Ne(l=""){return l==null?"":String(l).trim()}function xa(l="",r={}){const u=r&&typeof r=="object"?r:{},a=Array.isArray(u.places)?u.places:[];return a.length?{id:Ne(l),name:Ne(u.name),slug:Ne(u.slug),description:Ne(u.description),version:Math.max(0,Number(u.version)||0),places:a}:null}function Ti(l=""){try{const r=localStorage.getItem(`${va}${l}`);if(!r)return null;const u=JSON.parse(r);return!u||typeof u!="object"||Date.now()-Number(u.storedAt||0)>Ai?null:xa(l,u.data)}catch{return null}}function ji(l="",r=null){try{localStorage.setItem(`${va}${l}`,JSON.stringify({storedAt:Date.now(),data:r}))}catch{}}function wa(l=""){const r=Ne(l);if(!r)return null;if(yt.has(r))return yt.get(r);const u=Ti(r);return u&&yt.set(r,u),u}async function Li(l=""){const r=Ne(l);if(!r)return null;const u=wa(r);if(u)return u;if(xt.has(r))return xt.get(r);const a=(async()=>{try{const g=await Mr(Rr(St,Pi,r)),f=g.exists()?xa(r,g.data()||{}):null;return yt.set(r,f),f&&ji(r,g.data()||{}),f}catch{return null}finally{xt.delete(r)}})();return xt.set(r,a),a}function Ui(l={}){const r=l.state,u=l.resolvePostCountsFn,a=l.escapeHtmlFn,g=l.getOptimizedImageUrlFn,f=l.iconFn,R=l.isLocalBusinessProfileFn,U=typeof l.isCeoUserFn=="function"?l.isCeoUserFn:(()=>!1),Y=l.normalizeHandleFn,L=l.logoFitClassFn,A=l.formatCountFn,Q=l.renderProfileShopCartViewFn,xe=l.renderProfileShopFavoritesViewFn,Ce=typeof l.ensurePostsDataForProfileFn=="function"?l.ensurePostsDataForProfileFn:(()=>{}),Pe=l.ensureMenuDataForProfileFn,Qe=typeof l.ensureEditorMenuDataForProfileFn=="function"?l.ensureEditorMenuDataForProfileFn:(()=>{}),we=l.ensureFocusDataForProfileFn,It=typeof l.ensureAdsDataForProfileFn=="function"?l.ensureAdsDataForProfileFn:(()=>{}),cn=l.ensureTableQrStateForProfileFn,ae=l.isShopCatalogProfileFn,ya=l.getBusinessCatalogLabelFn,Ae=l.normalizeMenuTypeFn,$a=l.primeMenuItemCountsFn,ka=typeof l.hydrateMenuCardViewerLikesFn=="function"?l.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),Sa=l.renderShopProductListFn,Ia=l.getMenuLayoutThemeFn,Ca=l.menuLayoutColors,oe=l.resolveMenuItemHeroFn,J=l.isPlaceholderUrlFn,q=l.placeholderImage,Pa=l.getFirebaseStorageUrlFn,Aa=l.isDirectImageUrlFn,dn=l.formatPriceFn,Ta=typeof l.resolveCurrencyCodeForMenuItemFn=="function"?l.resolveCurrencyCodeForMenuItemFn:(()=>""),un=l.getMenuItemImagesFn,Z=l.getMenuItemObjectPositionFn,Je=l.getMenuItemSocialIdFn,pn=l.menuItemMetaKeyFn,fn=l.ensureMenuItemMetaFn,mn=l.resolveMenuItemCountsFn,Xe=l.getFocusStateForRestaurantFn,ja=typeof l.getAdsStateForRestaurantFn=="function"?l.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),Ze=l.getTableQrStateForRestaurantFn,Te=l.getFocusItemObjectPositionFn,Ct=l.getFocusCardClassFn,La=l.getFocusIndexFn,ye=l.isRestaurantCafeProfileFn,Pt=typeof l.getBusinessProfileTypeFn=="function"?l.getBusinessProfileTypeFn:(()=>""),le=l.getRestaurantMetaByIdFn,_a=l.buildUrlFn,Fa=l.normalizeSearchKeyFn,Ma=l.normalizeFollowHandleFn,pe={key:"",inFlightKey:""},gn=new Set,et=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},Ra=({profile:e=null,routePayload:t=null,surface:n=null,decision:s=null}={})=>{if(!et())return;const o=n&&typeof n=="object"?n:{},i=o.menu&&typeof o.menu=="object"?o.menu:{},c=e&&typeof e=="object"?e:{},d=t&&typeof t=="object"?t:{},p=d?.businessSnapshot?.identity||d?.identity||{},b=String(o.authoritativeRestaurantId||o.restaurantId||i.restaurantId||"").trim(),m=String(c.publicSlug||c.landingSlug||c.handle||p.publicSlug||p.landingSlug||p.handle||"").trim(),h=`${b||"pending"}::${m||"no-slug"}`;if(gn.has(h))return;gn.add(h);const x=Array.isArray(i.items)?i.items:[],w=new Set(x.map($=>String($?.category||"").trim()).filter(Boolean)).size,C=String(i.rawTruthState||i.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:b,slug:m,itemsLength:x.length,categoriesLength:w,menuStatus:String(i.status||"loading"),truthState:C,isLoading:s?.isLoading===!0,isHydrating:i.hydrating===!0||C.toLowerCase()==="hydrating",confirmedEmpty:i.confirmedEmpty===!0,canRenderItems:i.canRenderItems===!0,shouldRenderNoProducts:s?.shouldRenderNoProducts===!0,source:String(i.source||"")})},Ea=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},At=(e="")=>a(String(e||"")),je=(e="")=>a(String(e??"")),se=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:n=""}={})=>{if(!et())return"";const s=[e?`data-debug-renderer="${At(e)}"`:"",t?`data-debug-skeleton="${At(t)}"`:"",n?`data-debug-source="${At(n)}"`:""].filter(Boolean);return s.length?` ${s.join(" ")}`:""},za=(e={},t=[])=>{const n=br(e,t);return` ${[`data-menu-state="${je(n.menuState)}"`,`data-menu-item-count="${je(n.menuItemCount)}"`,`data-focus-state="${je(n.focusState)}"`,`data-focus-business-id="${je(n.focusBusinessId)}"`,`data-focus-item-count="${je(n.focusItemCount)}"`,`data-focus-source="${je(n.focusSource)}"`,`data-focus-stale="${n.focusStale?"true":"false"}"`].join(" ")}`},bn=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:n=null,routePayload:s=null,surface:o=null,decision:i=null,items:c=null,rawItems:d=null,filteredItems:p=null,renderDecision:b="",source:m=""}={})=>{const h=o&&typeof o=="object"?o:{},x=h.menu&&typeof h.menu=="object"?h.menu:{},w=h.focus&&typeof h.focus=="object"?h.focus:{},C=n&&typeof n=="object"?n:r?.profileView?.profile&&typeof r.profileView.profile=="object"?r.profileView.profile:{},$=s&&typeof s=="object"?s:r?.profileView?.routePayload&&typeof r.profileView.routePayload=="object"?r.profileView.routePayload:{},P=$?.businessSnapshot&&typeof $.businessSnapshot=="object"?$.businessSnapshot:{},T=P?.identity&&typeof P.identity=="object"?P.identity:$?.identity&&typeof $.identity=="object"?$.identity:{},k=r?.__webDirectEntry&&typeof r.__webDirectEntry=="object"?r.__webDirectEntry:{},S=String(C.publicSlug||C.landingSlug||C.handle||T.publicSlug||T.landingSlug||T.handle||k.publicSlug||"").trim(),_=String(C.restaurantId||$.restaurantId||k.restaurantId||"").trim(),F=String(C.canonicalRestaurantId||$.canonicalRestaurantId||h.authoritativeRestaurantId||k.canonicalRestaurantId||P.restaurantId||"").trim();let E="";C.canonicalRestaurantId?E="profile.canonicalRestaurantId":$.canonicalRestaurantId?E="routePayload.canonicalRestaurantId":h.authoritativeRestaurantId?E="surface.authoritativeRestaurantId":k.canonicalRestaurantId?E="webDirectEntry.canonicalRestaurantId":P.restaurantId?E="routeSnapshot.restaurantId":C.restaurantId?E="profile.restaurantId":$.restaurantId?E="routePayload.restaurantId":k.restaurantId&&(E="webDirectEntry.restaurantId");const I=String(F||h.restaurantId||x.restaurantId||_||"").trim(),z=Array.isArray(d)?d:Array.isArray(x.items)?x.items:[],B=Array.isArray(c)?c:z,H=Array.isArray(p)?p:B,y=new Set(H.map($e=>String($e?.category||"").trim()).filter(Boolean)).size,M=String(x.status||(i?.isLoading?"loading":"")||"").trim(),D=String(x.rawTruthState||x.truthState||"").trim(),O=x.confirmedEmpty===!0||i?.confirmedEmpty===!0,K=i?.hasError===!0||M==="error"||!!String(x.error||"").trim(),te=!(H.length>0||i?.hasItems===!0)&&!O&&!K,ne=F||_||I||"";return{component:e,functionName:t,slug:S,businessId:I,requestedRestaurantId:_,canonicalRestaurantId:F,restaurantIdSource:E,menuReadPath:ne?`restaurants/${ne}/public/menu`:"",activeTab:String(r?.activeTab||"").trim(),profileTopTab:String(r?.profileTopTab||"").trim(),profileContentTab:String(r?.profileContentTab||"").trim(),itemsLength:B.length,rawItemsLength:z.length,filteredItemsLength:H.length,categoriesLength:y,focusItemsLength:Array.isArray(w.items)?w.items.length:0,loading:x.loading===!0||i?.isLoading===!0||M==="loading",pending:te,hydrating:x.hydrating===!0||D.toLowerCase()==="hydrating",status:M,truthState:D,confirmedEmpty:O,canRenderItems:x.canRenderItems===!0,renderDecision:b||(i?.shouldRenderNoProducts?"no-products":i?.isLoading?"loading":""),source:m||String(x.source||""),buildToken:Ea()}},tt=(e={})=>{et()&&console.warn("[mnyra:no-products-render]",{...bn(e),stack:new Error().stack})},nt=(e="",t={})=>{et()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...bn({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},v=(e,t=e,n={})=>gr(e,{fallback:t,params:n}),Na=(e="")=>{const t=String(e||"").trim();if(!t)return v("nav.menu","Menue");const n=t.toLowerCase();return n==="menue"||n==="menu"||n==="menü"?v("nav.menu",t):n==="shop"?"Shop":t},hn=(e="")=>{const t=String(e||"").trim();if(!t)return"";const n=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(n)?v("menu.products","Produkte"):t},Da=(e="food",t=!1)=>t?v("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?v("menu.drinks","Getraenke"):v("menu.food","Speisen"),vn=(e={},t=!1)=>{const n=Ae(e?.type||"food");return t?v("menu.product","Produkt"):n==="drink"?v("menu.drinkItem","Getraenk"):v("menu.foodItem","Speise")},Tt=(e="",t="#111827")=>{const n=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(n)?n:t};function Ua(e=null,t=null){return Ye(r,{profile:e,routePayload:t,webDirectEntry:r?.__webDirectEntry}).restaurantId}function xn(e=null,t=""){if(!e||typeof e!="object")return e;const n=String(t||"").trim();if(!n)return e;const s=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===n&&s?e:{...e,restaurantId:n,...s?{canonicalRestaurantId:s}:{}}}function Ba(e=""){const t=String(e||"").trim();return t?Ye(r,{profile:r?.profileView?.profile||r?.userProfile,routePayload:r?.profileView?.routePayload,webDirectEntry:r?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function Be(e={}){const t=String(Ta(e)||"").trim();return t?dn(e?.price,t):dn(e?.price)}function Ha(e=[],t="",n=""){const s=String(t||"").trim(),o=String(n||"").trim();if(!s||!o)return"";const i=Array.isArray(e)?e:[];if(!i.length)return`${s}|${o}|empty`;const c=[];return i.forEach(d=>{const p=String(Je(d)||d?.id||"").trim();p&&c.push(p)}),c.length?(c.sort(),`${s}|${o}|${c.join(",")}`):`${s}|${o}|empty`}function Oa(e=[],t=""){const n=String(r.user?.uid||"").trim(),s=Ha(e,t,n);s&&pe.inFlightKey!==s&&pe.key!==s&&(pe.key=s,pe.inFlightKey=s,ka(e,t).catch(o=>{console.error(o),pe.key===s&&(pe.key="")}).finally(()=>{pe.inFlightKey===s&&(pe.inFlightKey="")}))}function Va(e={}){const t=String(e?.uid||"").trim();if(t&&r.followingTargetIds.includes(t))return!0;const n=String(e?.restaurantId||"").trim();if(n&&r.followingTargetIds.includes(n))return!0;const s=Ma(e?.handle||"");return!!(s&&r.followingHandles.includes(s))}function wn(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const n=typeof le=="function"&&le(t)||null;return n?.specialEnabled===!0?!0:(n?.specialEnabled===!1,!1)}function Ka(e={}){return be(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function yn(e,t,n=!0,{includeImageKey:s=!0}={}){const o=u(e),i=e.id?String(e.id):"",c=i?`data-open-post="${a(i)}"`:"",d=i?`data-post-like-count="${a(i)}"`:"",p=i?`data-post-comment-count="${a(i)}"`:"",b=s&&i?`data-img-key="profile-post:${a(i)}"`:"",m=e.type==="wide"||e.type==="hero",h=t&&m?"col-span-2":"",x=t&&m?"aspect-[1.8/1]":"aspect-[4/5]",w=m?800:400,C=m?400:500,$=String(e.posterUrl||e.thumbUrl||e.poster||"").trim(),P=e.isVideo===!0,T=P&&$?$:e.url,k=g(T,m?"large":"medium",{stableKey:i?`profile-post:${i}`:"",variantGroup:"post-detail"}),S=String(e.url||"").trim(),_=S&&!S.includes("#")?`${S}#t=0.001`:S,F=P&&!$&&S?`<video src="${a(_)}" preload="metadata" muted playsinline webkit-playsinline width="${w}" height="${C}" ${b} class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${a(k)}" loading="lazy" decoding="async" width="${w}" height="${C}" ${b} class="w-full h-full object-cover" />`;return`
    <div ${c} role="button" tabindex="0" class="${h} relative ${x} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        ${F}
        ${e.isVideo?`<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${f("play","w-3.5 h-3.5 fill-white block")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${f("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${d} class="text-[10px] font-bold tracking-wide">${a(o.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${f("message-circle","w-3 h-3 text-indigo-200")}
                <span ${p} class="text-[10px] font-bold tracking-wide">${a(o.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${i&&n?`
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
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function jt(e,t,n=!0,{includeImageKeys:s=!0}={}){const o=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${f("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(v("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const i=e.map(d=>yn(d,o,n,{includeImageKey:s})),c=e.reduce((d,p)=>{const b=p?.type==="wide"||p?.type==="hero";return d+(b?2:1)},0);return o&&c%2===1&&i.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),i.join("")}function Lt(){const e=r.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const n=g(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${a(n)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${a(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${f("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${a(t.city||"Stadt")}
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
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(v("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function Le(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}let fe=null;function $n(){if(fe)return fe;if(typeof localStorage>"u")return fe={},fe;try{const e=localStorage.getItem(oa),t=e?JSON.parse(e):{};fe=t&&typeof t=="object"?t:{}}catch{fe={}}return fe}function _t(e={},t=""){const n=ia(e);if(!n.length)return;const{store:s,changed:o}=Ur($n(),n,t);if(o&&(fe=s,!(typeof localStorage>"u")))try{localStorage.setItem(oa,JSON.stringify(s))}catch{}}const qa=new Set(["feed","search","discover","map","location","user","waiter","wr","leads","admin","ceo","owner","staff","kitchen","profile","menu","details","detail","detajet","orders","notifications","settings","upload","customers","business-accounts","businessaccounts","chat","social","heart","hub","apps","api","shared","assets","_shared","core","login","register","post","posts","story","stories","manifest","sw","favicon","robots","sitemap","b","lp"]);function Ft(){try{const t=String(globalThis?.location?.pathname||"").replace(/^\/+|\/+$/g,"").split("/").filter(Boolean);let n=String(t[0]||"").trim();try{n=decodeURIComponent(n)}catch{}return n=n.trim().toLowerCase(),!n||n.includes(".")||qa.has(n)?"":n}catch{return""}}function at(e={}){const t=String(Pt(e)||"").trim().toLowerCase();return t?(_t(e,t),t):Er("",zr($n(),ia(e,{extraSlugs:[Ft()]})))}function Ga(e={}){try{const t=String(globalThis?.location?.pathname||"");return Nr(t)?Dr(e,Ft()):!1}catch{return!1}}function He(e={}){const t=at(e);if(t==="hotel"||t==="motel")return!0;if(t)return!1;if(Ga(e))return!0;const n=_e(e);return Xt(n).length>0||!!String(n.destinationId||"").trim()?(_t(e,"hotel"),!0):!1}function _e(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),n=t?le(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{}}}function Ya(e={},t=""){const n=e&&typeof e=="object"?e:{},s=String(n.id||n._id||n.offerId||n.menuItemId||t||"offer").trim();return{...n,id:s,menuItemId:String(n.menuItemId||n.targetMenuItemId||n.itemId||n.targetItemId||"").trim(),title:n.title||n.name||"Oferta",text:n.text||n.desc||n.description||"",imageUrl:n.imageUrl||n.image||n.photoUrl||"",active:n.active!==!1}}function kn(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],n=new Set;return t.map((s,o)=>Ya(s,`offer_${o}`)).filter(s=>{const o=String(s.id||`${s.title}|${s.text}|${s.imageUrl}`).trim();return!o||n.has(o)?!1:(n.add(o),!0)})}function Wa(e={}){const t=_e(e),n=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!n)return!1;const s=r.focus&&typeof r.focus=="object"?r.focus:{},o=String(s.restaurantId||"").trim()===n,i=String(s.truthSource||"").trim().toLowerCase();if(o&&i==="public-menu"||(o&&Array.isArray(s.items)?s.items:[]).length)return!1;const d=kn(t);return d.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(r.focus={...s,restaurantId:n,items:d,enabled:s.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:d.length?"seeded":"knownEmpty"},!0):!1}function Qa(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const n of t){if(!n||typeof n!="object")continue;const s=Number(n.lat??n.latitude),o=Number(n.lng??n.lon??n.longitude);if(Number.isFinite(s)&&Number.isFinite(o))return{lat:s,lng:o}}return null}function X(e={},t=[]){for(const n of t){const s=String(e?.[n]||"").trim();if(s)return s}return""}function st(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function Ja(e={}){const t=[...st(e.coverImages),...st(e.hotelCoverImages),...st(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(s=>String(s||"").trim()).filter(Boolean),n=[];return t.forEach(s=>{n.includes(s)||n.push(s)}),n.slice(0,8)}function Xa(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Za(e=""){const t=String(e||"").trim(),n=r.hotelCardEditor&&typeof r.hotelCardEditor=="object"?r.hotelCardEditor:{},s=String(n.restaurantId||"").trim();return s?s===t?n:{}:Xa(n)?{}:n}function es(e={}){const t=Array.isArray(e.features)?e.features.map(s=>String(s||"").trim()).filter(Boolean):[],n=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[X(e,["hotelFeatureOneText","gardenTerraceText"])||String(n.gardenTerrace||"").trim()||t[0]||"",X(e,["hotelFeatureTwoText","accessibilityText"])||String(n.accessibility||"").trim()||t[1]||"",X(e,["hotelFeatureThreeText","veganOptionsText"])||String(n.veganOptions||"").trim()||t[2]||""]}function Sn(e={}){const t=[],n=(s="")=>{const o=String(s||"").trim();o&&!t.includes(o)&&t.push(o)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(s=>{Array.isArray(s)&&s.forEach(o=>{typeof o=="string"?n(o):o&&typeof o=="object"&&n(o.label||o.name||o.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&n("Në plazh"),(e.restaurant||e.hasRestaurant)&&n("Restaurant"),(e.breakfast||e.breakfastIncluded)&&n("Mëngjes"),(e.pool||e.hasPool)&&n("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&n("WLAN"),(e.parking||e.freeParking||e.hasParking)&&n("Parking"),(e.spa||e.wellness)&&n("Wellness"),t.slice(0,8)}const ts=[{value:"m",label:"m"},{value:"km",label:"km"}],ns="Në qendër",as="Në plazh",ss=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],rs=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],is=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function me(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function os(e="",{direct:t=!1}={}){const n=String(e||"").trim(),s=me(n),o=t||s==="ne_qender"||s==="ne_plazh"||s==="direkt_ne_qender"||s==="direkt_ne_plazh"||s.includes("direkt")&&(s.includes("strand")||s.includes("zentrum")||s.includes("center"))||s.includes("am_strand")||s.includes("im_zentrum"),i=n.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),c=i?i[1].replace(",","."):"",p=(i?String(i[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:c,unit:p,isDirect:o}}function In({idPrefix:e="",iconName:t="navigation",label:n="",value:s="",directLabel:o="",direct:i=!1}={}){const c=os(s,{direct:i});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${f(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(o)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${a(e)}Value" type="number" min="0" step="0.1" value="${a(c.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${a(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${ts.map(d=>`<option value="${a(d.value)}" ${c.unit===d.value?"selected":""}>${a(d.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${a(o)}</span>
        <input id="${a(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${c.isDirect?"checked":""} />
      </label>
    </div>
  `}function ls(e=[],t=""){const n=String(t||"").trim(),s=new Set(e.map(me));return`
    <option value="">Zgjidh</option>
    ${e.map(o=>`<option value="${a(o)}" ${me(o)===me(n)?"selected":""}>${a(o)}</option>`).join("")}
    ${n&&!s.has(me(n))?`<option value="${a(n)}" selected>Aktuale: ${a(n)}</option>`:""}
  `}function Mt({id:e="",iconName:t="badge-check",label:n="",value:s="",options:o=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${f(t,"w-4 h-4")}
        </div>
        <label for="${a(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</label>
      </div>
      <select id="${a(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${ls(o,s)}
      </select>
    </div>
  `}function cs(e={},t=[]){const n=new Set(t.map(me).filter(Boolean)),s=[],o=(i="")=>{const c=String(i||"").trim();if(!c)return;const d=me(c);n.has(d)||s.some(p=>me(p)===d)||s.push(c)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(i=>st(i).forEach(o)),s}function ds({existingImages:e=[],newPreviews:t=[],imageUrlDraft:n=""}={}){const s=[...t.map((c,d)=>({src:c,kind:"new",idx:d})),...e.map((c,d)=>({src:c,kind:"existing",idx:d}))].filter(c=>c.src),o=s[0]?.src||n||"",i=o?g(o,"large"):q;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${a(i||q)}" class="w-full h-52 object-cover bg-white" />
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
                <img src="${a(g(c.src,"thumb"))}" class="w-full h-full object-cover" />
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
  `}function us({destinationId:e="",overrides:t={},hotelCoords:n=null,manualBeachDistance:s=null}={}){const o=String(e||"").trim();if(!o||typeof document>"u")return;const i=p=>fa({template:p,overrides:t,hotelCoords:n,imageUrlFn:b=>g(b,"medium"),manualBeachDistance:s});let c=0;const d=()=>{const p=document.getElementById(nn);if(!p){c++<20&&requestAnimationFrame(d);return}String(p.dataset.destinationId||"")===o&&p.dataset.destinationFilled!==o&&Li(o).then(b=>{const m=document.getElementById(nn);!m||String(m.dataset.destinationId||"")!==o||(m.dataset.destinationFilled=o,m.innerHTML=b?i(b):"",b&&Cn(tn({places:b.places,overrides:t,hotelCoords:n})))}).catch(()=>{})};typeof requestAnimationFrame=="function"?requestAnimationFrame(d):queueMicrotask(d)}function Cn(e=[]){if(typeof document>"u")return;const t=document.getElementById(rn);t&&(typeof t.__mhdSetPlaces=="function"?t.__mhdSetPlaces(e):t.__mhdPlaces=Array.isArray(e)?e:[])}function ps(e=[]){if(typeof document>"u")return;let t=0;const n=()=>{const s=document.getElementById(rn);if(!s){t++<20&&requestAnimationFrame(n);return}if(Array.isArray(e)&&e.length&&Cn(e),s.dataset.mhdMapObserved==="1")return;s.dataset.mhdMapObserved="1";const o=()=>{pr(()=>import("./hotel-detail-map-runtime-DB741SQ-.js"),[]).then(i=>i.ensureHotelDetailMap({container:s})).catch(()=>{})};if(typeof IntersectionObserver=="function"){const i=new IntersectionObserver(c=>{c.some(d=>d.isIntersecting)&&(i.disconnect(),o())},{rootMargin:"240px"});i.observe(s)}else o()};typeof requestAnimationFrame=="function"?requestAnimationFrame(n):queueMicrotask(n)}function Pn(e={}){return kn(e).filter(t=>t.active!==!1&&String(t.title||"").trim())}function fs(e={}){const t=e.beachfront===!0||e.onBeach===!0||e.amStrand===!0,n=X(e,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung"]);return!t&&!n?null:{label:n,direct:t}}function An(e={}){return!!(Xt(e).length||Pn(e).length||Sn(e).length||String(e.destinationId||"").trim()||X(e,["rating","reviewRating","stars","hotelStars"]))}const Tn="mnyraHotelDetailsPendingRoot";let rt="";function ms(e={},t=""){if(typeof document>"u"||typeof setTimeout!="function")return;const n=String(t||"").trim();if(!n||rt===n)return;rt=n;let s=0;const o=()=>{const i=document.getElementById(Tn);if(!i||String(i.dataset.hotelDetailsPending||"")!==n){rt="";return}if(!(!!(typeof le=="function"?le(n):null)||An(_e(e)))&&s++<24){setTimeout(o,250);return}rt="",i.removeAttribute("data-hotel-details-pending"),i.classList.add("animate-in","fade-in","duration-300"),i.innerHTML=_n(e)};setTimeout(o,250)}const Oe="data-business-catalog-type-pending";let Ve="";function jn(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.publicSlug||e?.handle||Ft()||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"")}function gs(e={}){const t=r?.profileView?.profile;if(t&&typeof t=="object"&&Le(t))return t;const n=r?.userProfile;return n&&typeof n=="object"&&Le(n)?n:e&&typeof e=="object"?e:{}}function bs(){document.querySelectorAll('[data-profile-tab="menu"]').forEach(e=>{e.setAttribute("data-profile-tab-surface","hotel-details"),e.textContent="Details"})}function Ln(e="",t={}){if(typeof document>"u"||typeof setTimeout!="function")return;const n=String(e||"").trim();if(!n||Ve===n)return;Ve=n;let s=0;const o=()=>{const i=document.querySelector(`[${Oe}="${n}"]`);if(!i){Ve="";return}const c=gs(t),d=at(c),p=He(c);if(!d&&!p){if(s++<40){setTimeout(o,300);return}Ve="",i.removeAttribute(Oe);return}Ve="",i.removeAttribute(Oe),p&&(_t(c,d||"hotel"),i.classList.add("animate-in","fade-in","duration-300"),i.innerHTML=Rt(c),bs())};setTimeout(o,300)}function Rt(e={}){const t=_e(e),n=String(e?.canonicalRestaurantId||e?.restaurantId||t.canonicalRestaurantId||t.restaurantId||"").trim(),s=n&&typeof le=="function"?le(n):null;return n&&!s&&!An(t)?(pa(),ms(e,n),`
      <div id="${Tn}" data-hotel-details-pending="${a(n)}" class="app-content-inline app-main-content-safe">
        ${di()}
      </div>
    `):`
    <div class="app-content-inline app-main-content-safe animate-in fade-in duration-300">
      ${_n(e)}
    </div>
  `}function _n(e={}){const t=_e(e),n=Qa(t),s=X(t,["address","primaryAddress","location","formattedAddress","street"]),o=X(t,["city","locationCity","primaryCity","region","country"]),i=X(t,["rating","reviewRating","stars","hotelStars"]),c=X(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),d=X(t,["reviewSummary","ratingSummary","commentsSummary"]),p=Sn(t),b=Pn(t),m=Xt(t).map(S=>({...S,priceLabel:xr(S),metaParts:vr(S)})),h=String(t.destinationId||"").trim(),x=String(t.destinationName||"").trim(),w=ha(t.destinationOverrides||{}),C=X(t,["name","restaurantName","businessName"])||"Hotel",$=n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.lat},${n.lng}`)}`:s||o?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s} ${o}`.trim())}`:"";pa();const P=fs(t),T=h?wa(h):null,k=T?fa({template:T,overrides:w,hotelCoords:n,imageUrlFn:S=>g(S,"medium"),manualBeachDistance:P}):"";return h&&!T&&us({destinationId:h,overrides:w,hotelCoords:n,manualBeachDistance:P}),n&&ps(T?tn({places:T.places,overrides:w,hotelCoords:n}):[]),xi({rooms:m,offers:b,amenities:p,address:s,city:o,cityImageUrl:X(t,["titleImageUrl","coverImageUrl","heroUrl"]),destinationId:h,destinationName:x,destinationSectionsHtml:k,mapsUrl:$,hotelCoords:n,hotelName:C,rating:i,reviewCount:c,ratingSummary:d,imageUrlFn:S=>g(S,"medium")})}function hs(e={}){const t=_e(e),n=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),s=t?.name||t?.restaurantName||e?.name||"Hotel",o=Za(n),i=String(o.status||"").trim(),c=o.saving===!0,d=Array.isArray(o.existingImages)?o.existingImages.map(z=>String(z||"").trim()).filter(Boolean):Ja(t),p=Array.isArray(o.imagePreviews)?o.imagePreviews.map(z=>String(z||"").trim()).filter(Boolean):[],b=String(o.imageUrlDraft||"").trim(),[m,h,x]=es(t),w=cs(t,[m,h,x]),C=X(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),$=X(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),P=X(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),T=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,k=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,S=o.detailsOpen===!0||c,_=p[0]||d[0]||"",F=_?g(_,"thumb"):q,E=[C,$,P?`${P} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",I=i.includes("fehl")||i.includes("Bitte")||i.includes("Nuk");return`
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
            <button type="button" data-hotel-card-details-open aria-expanded="${S?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${f("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${S?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${a(F||q)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${a(s)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(E)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${S?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${f("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${i&&!S?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${I?"text-rose-500":"text-slate-500"}">${a(i)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${a(n)}" data-hotel-card-details-panel class="${S?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
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
              ${ds({existingImages:d,newPreviews:p,imageUrlDraft:b})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${In({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:C,directLabel:ns,direct:T})}
              ${In({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:$,directLabel:as,direct:k})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${a(P)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Mt({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:m,options:ss})}
              ${Mt({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:h,options:rs})}
              ${Mt({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:x,options:is})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${a(w.join(`
`))}</textarea>
              </div>
            </div>

            ${i?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${I?"text-rose-500":"text-slate-500"}">${a(i)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
              ${c?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${yi({restaurantId:n,record:t,editorState:r.hotelRoomsEditor&&typeof r.hotelRoomsEditor=="object"?r.hotelRoomsEditor:{}})}
        ${qt(n,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function it(e={}){const t=String(r.profileTopTab||"").trim().toLowerCase(),n=String(r.profileContentTab||"").trim().toLowerCase();return Le(e)?t==="menu"?"menu":n==="menu"||n==="posts"?n:"posts":n==="media"||n==="checkins"?n:"posts"}function Et(e={}){const t=String(r.profileTopTab||"").trim().toLowerCase();return Le(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(r.user?.uid||"").trim()?"favorites":"profile"}function Fn(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function vs(e=0,t=1){const n=Math.max(1,Number(t||0)||1),s=Math.round(Number(e||0));if(!Number.isFinite(s))return 0;const o=s%n;return o<0?o+n:o}function xs(e=0){return Fn(e)}function ws(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],n=Fn(r.profileLandingStep),s=vs(r.profileLandingGreetingIndex,t.length),o=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},i=String(o.businessName||e.name||"casarita").trim()||"casarita",c=Tt(o.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),d=c&&c.toLowerCase()!=="#111827"?c:"",p=Tt(o.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||c||"","#111827"),b=Tt(o.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||d||"","#4f46e5"),m=i.replace(/\.+$/g,"").trim()||i,h=m.split(/\s+/).filter(Boolean),x=h.length>1?h.slice(0,-1).join(" "):m,w=h.length>1?h[h.length-1]:"",C=w?x:`${x}.`,$=w?`${w}.`:"",P=g(o.logoUrl||e.avatar||"","avatar"),k=String(P||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",S=String(o.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),_=String(o.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),F=n>=2,E=n>=3,I=Array.isArray(r.profileView?.posts)?r.profileView.posts:Array.isArray(e?.posts)?e.posts:[],z=xs(n),B=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${f("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(H=>{const y=z===H;return`
            <div data-landing-step-dot="${H}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${y?"1.22":"1"}); opacity: ${y?"1":"0.88"}; background: ${y?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${y?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${y?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${n===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${n===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((H,y)=>{const M=y===s,D=y===(s-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${y}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${M?"opacity: 1; transform: translateY(0) scale(1);":D?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!M&&!D?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${a(H)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${a(k)}" alt="${a(`${i} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${a(p)};">${a(C)}</span>${$?`<span style="color:${a(b)};">${a($)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${a(S)}<br />
            ${a(_)}
          </p>
        </div>
        ${B}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${n<1?"translate-y-full":n===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===1?"1":"0"}; pointer-events: ${n===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${ct(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${B}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${n<2?"translate-y-full":n===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===2?"1":"0"}; pointer-events: ${n===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${F?ct(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${B}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${n<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${n===3?"1":"0"}; pointer-events: ${n===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${E?ct(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function zt(e=r.profileView?.profile||r.userProfile,{landingPreview:t=!1,selectedTabOverride:n="",compact:s=!1}={}){const o=Le(e),i=String(n||it(e)).trim().toLowerCase()||"posts",c=He(e),d=ae(e),p=c?"Details":d?"Shop":v("nav.menu","Menue"),b=o?[{id:"posts",label:v("profile.posts","Beitraege")},{id:"menu",label:p,surface:c?"hotel-details":"menu"}]:[{id:"posts",label:v("profile.posts","Beitraege")},{id:"media",label:v("profile.media","Medien")},{id:"checkins",label:v("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${s?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${b.map(m=>`
          <button data-profile-tab="${m.id}" ${m.surface?`data-profile-tab-surface="${a(m.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${i===m.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${m.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Nt(e=r.profileView?.profile||r.userProfile,{disabled:t=!1}={}){const n=it(e);return n==="checkins"||n==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${a(v("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${r.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${f("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${r.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${f("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function G(e=""){return String(e||"").trim()}const Mn="mnyra_business_title_image_cache_v1",Rn=80;function En(){if(!r)return{};const e=r.businessTitleImageCache&&typeof r.businessTitleImageCache=="object"?r.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const s=(typeof window<"u"?window.localStorage:null)?.getItem?.(Mn)||"",o=s?JSON.parse(s):{};o&&typeof o=="object"&&Object.entries(o).forEach(([i,c])=>{const d=G(i),p=G(c);d&&p&&!J(p)&&(t[d]=p)})}catch{}return r.businessTitleImageCache={loaded:!0,items:t},t}function ys(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(Mn,JSON.stringify(e))}catch{}}function $s(e={},t="business"){const n=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(s=>G(s)).filter(Boolean);return[...new Set(n)]}function ks(e=[],t=""){const n=G(t);if(!n||J(n))return;const s=En();let o=!1;e.forEach(c=>{const d=G(c);!d||s[d]===n||(s[d]=n,o=!0)});const i=Object.entries(s);if(i.length>Rn){const c=i.slice(i.length-Rn);Object.keys(s).forEach(d=>delete s[d]),c.forEach(([d,p])=>{s[d]=p}),o=!0}o&&ys(s)}function Ss(e=[]){const t=En();for(const n of e){const s=G(n),o=s?G(t[s]):"";if(o&&!J(o))return o}return""}function Is(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function Cs(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function Ps(e={}){const n=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(s=>String(s||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||n||"").trim()}function As(e={},t={}){const n=Ps(e),s=Array.isArray(t.cacheKeys)?t.cacheKeys:[],o=G(t.stableKey||s[0]||"");if(!n){if(t.allowCacheFallback===!0){const c=Ss(s);if(c)return c;const d=o?g("","medium",{stableKey:o}):"";return d&&!J(d)?d:""}return""}const i=g(n,"medium",o?{stableKey:o}:void 0);return i&&!J(i)?(ks(s,i),i):""}function zn(e="",t=""){const n=G(e);if(!n)return"";if(/^https?:\/\//i.test(n))return n;const s=n.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return s?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(s)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(s)}`:"":""}function Ts(e=""){const t=G(e);if(!t)return"";const n=t.replace(/[^\d+]/g,"");return n?`tel:${n}`:""}function js(e={}){const t=Number(e?.gpsLat??e?.lat),n=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(n))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${n}`)}`;const s=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(o=>G(o)).filter(Boolean).join(", ");return s?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`:""}function ot({href:e="",label:t="",iconName:n="",body:s="",buttonAttrs:o=""}={}){const i=G(e),c=String(o||"").trim();if(!i&&!c)return"";const d=s||f(n,"w-4 h-4"),p="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return c?`
    <button type="button" ${c} title="${a(t)}" aria-label="${a(t)}" class="${p}">
      ${d}
    </button>
  `:`
    <a href="${a(i)}" target="_blank" rel="noreferrer" title="${a(t)}" class="${p}">
      ${d}
    </a>
  `}function lt({href:e="",buttonAttrs:t="",iconName:n="",eyebrow:s="",value:o=""}={}){const i=G(o);if(!i)return"";const c=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${f(n,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${a(s)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(i)}</span>
    </div>
  `;return e?`<a href="${a(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</button>`}function Ls({profileName:e="",safeBio:t="",metaLine:n="",identityPending:s=!1,followersLabel:o=""}={}){return`
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(String(o))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(n)}</p>
          ${s?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function Nn(e={},t={}){const n=t.mode==="self"?"self":"public",s=t.disabledBlockClass||"",o=Is(e,n),i=n==="self"?"avatar:self":`avatar:public:${o}`,c=t.avatarUrl||g(e.avatar||"","avatar",{stableKey:i}),d=t.avatarFit||L(!!e.restaurantId),p=String(r?.profileCardInfoOpen||"")===o,b=Number(r?.profileCardInfoHeights?.[o]||0),m=p&&Number.isFinite(b)&&b>0?`height:${Math.ceil(b)}px;`:"",h=t.avatarImgKeyAttr||(n==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${a(o)}"`),x=t.renderAvatarImage===!0?!!String(c||"").trim()&&!J(c):t.renderAvatarImage!==!1&&!!String(c||"").trim()&&!J(c)&&!!String(e?.avatar||"").trim(),w=!!t.identityPending,C=t.followersLabel??A(e.followers),$=G(e?.name)||"User",P=G(t.typeLabel||e?.customerType||e?.type||"Business"),T=G(e?.location||"-"),k=n==="public"?`${T} / ${P}`:T,S=t.bioHtml||a(e?.bio||"").replace(/\n/g,"<br>")||a(v("profile.noBio","Noch keine Bio.")),_=`business-cover:${o}`,F=$s(e,o),E=As(e,{cacheKeys:F,stableKey:_,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),I=js(e),z=Cs(e),B=ot(z?{buttonAttrs:`data-marketplace-open-map="${a(z)}"`,label:v("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:I,label:v("profile.openMap","Karte oeffnen"),iconName:"map"}),H=zn(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),y=zn(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),M=G(e?.phone||e?.telephone||e?.contactPhone||""),D=Ts(M),O=G(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(te=>G(te)).filter(Boolean).join(", ")),K=[lt({href:H,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),lt({href:y,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),W=n==="self"?`
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
          ${a(t.followLabel||v("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${f("message-circle","w-5 h-5")}
      </button>
    `;if(p){const te=[lt({href:D,iconName:"phone",eyebrow:v("profile.call","Anrufen"),value:M}),lt({href:I,iconName:"map-pin",eyebrow:v("profile.address","Adresse"),value:O||T}),K].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${a(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="${m}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${Ls({profileName:$,safeBio:S,metaLine:k,identityPending:w,followersLabel:C})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${a(o)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${f("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(v("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(T)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${te||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(v("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${a(o)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${a(v("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${a(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${E?`<img src="${a(E)}" data-img-key="${a(_)}" alt="${a($)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${f("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${B}
          ${ot({href:y,label:"TikTok",iconName:"music-2"})}
          ${ot({href:H,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${n==="self"?'id="profileAvatarTrigger"':""} class="relative ${n==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${x?`<img src="${a(c)}" data-fallback-src="${a(q)}" decoding="async" width="100" height="100" ${h} class="w-full h-full rounded-[1.8rem] ${d} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${w?"animate-pulse":""}">${f("store","w-8 h-8 text-slate-300")}</div>`}
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
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${a(o)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${f("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a($)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(k)}</p>
          ${w?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${W}
        </div>
      </div>
    </div>
  `}function ct(e={},t=[],{topTabOverride:n="",tutorialMode:s=!1,contentTabOverride:o="",landingHideContent:i=!1,collapseIdentity:c=!1,contentReveal:d=!1,landingMode:p=!1}={}){const b=Va(e),m=!!e.privateAccount&&e.uid&&String(e.uid)!==String(r.user?.uid||"")&&!b,h=!!e.pendingFollowRequest&&!b,x=e.restaurantId?"Business":v("nav.user","User"),w=String(e.handle||Y(e.name||"user")).replace(/^@/,""),$=a(e.bio||"").replace(/\n/g,"<br>")||a(v("profile.noBio","Noch keine Bio.")),P=Le(e),T=String(n||Et(e)).trim().toLowerCase()||"profile",k=String(o||it(e)).trim().toLowerCase()||"posts",S=k==="menu",_=k==="checkins",F=t,I={...r?.profileView&&typeof r.profileView=="object"?r.profileView:{},profile:e,posts:Array.isArray(F)?F:[]},z=hr(r,{profileView:I,profileTopTab:T,profileContentTab:k}),B=String(z?.header?.status||"").trim().toLowerCase()||"loading",H=String(z?.posts?.status||"").trim().toLowerCase()||"loading",y=e.uid||e.restaurantId||w||"public",M=`avatar:public:${y}`,D=String(e?.avatar||"").trim(),O=g(D,"avatar",{stableKey:M}),K=L(!!e.restaurantId),W=p?"":`data-img-key="avatar:public:${a(y)}"`,te=!D&&!!String(O||"").trim()&&!J(O),ne=!!D||te&&We(B),$e=Re=>{if(Re==null)return!1;const Se=Number(Re);return Number.isFinite(Se)&&Se>=0},Qt=ne||$e(e?.followers)||$e(e?.following),ce=We(B)&&!Qt,ke=!!String(O||"").trim()&&!J(O)&&ne,ft=ce?"...":A(e.followers),mt=ce?"...":A(e.following),gt=P?"pt-2":"pt-10",bt=b?v("profile.following","Following"):h?v("profile.requested","Requested"):m?v("profile.request","Request"):v("profile.follow","Follow"),qe=b?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":h?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",Ge=s?"select-none":"app-main-content-safe",de=s?"pointer-events-none":"",re=!c,aa=!i,ht=d?p?"transition-opacity duration-200":"animate-in fade-in duration-300":"",sa=k==="posts"&&F.length>0,dr=k!=="posts"||sa||H==="empty"||H==="error",ur=k==="posts"&&!sa&&H==="error";return!s&&(k==="posts"||k==="media")&&e?.restaurantId&&We(H)&&Ce(e),`
    <div class="${Ge}" ${s?'data-landing-tutorial-surface="true"':""}>
      ${T==="profile"||T==="menu"?`
      ${re?`
        <div class="app-content-inline pb-2 ${gt}">
          ${P?Nn(e,{mode:"public",disabledBlockClass:de,avatarUrl:O,avatarFit:K,avatarImgKeyAttr:W,renderAvatarImage:ke,identityPending:ce,followersLabel:ft,followLabel:bt,followTone:qe,isFollowing:b,hasPendingFollowRequest:h,isLocked:m,bioHtml:$,typeLabel:x,allowTitleImageCacheFallback:We(B)||We(H)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${de}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${ke?`<img src="${a(O)}" data-fallback-src="${a(q)}" decoding="async" width="100" height="100" ${W} class="w-full h-full rounded-[1.8rem] ${K} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${ce?"animate-pulse":""}">${f(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ce?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(ft)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ce?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(mt)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e.name||"User")}</h1>
                ${P?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${a(w)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${$}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(e.location||"-")} / ${x}</p>
                ${ce?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle)}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${h?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${qe} ${h?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${b?f("check","w-4 h-4"):""}
                    ${bt}
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
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${a(v("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${a(v("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${zt(e,{landingPreview:s,selectedTabOverride:k,compact:c})}
        ${aa?Nt(e,{disabled:s}):""}

        ${aa?S?(()=>{const Re=He(e),Se=!Re&&P&&!s&&!p&&!at(e)?jn(e):"";return Se&&Ln(Se,e),`
          <div class="${de} ${ht}"${Se?` ${Oe}="${a(Se)}"`:""}>
            ${Re?Rt(e):pt(e,{mode:p?"landing":"profile",allowAutoEnsure:!p})}
          </div>
        `})():_?`
          <div class="${de} ${ht}">
            ${Lt()}
          </div>
        `:`
          ${dr?`
            ${ur?`
              <div class="app-content-inline ${de}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${a(v("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${r.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${de} ${ht}">
                ${jt(F,r.profileViewMode,!1,{includeImageKeys:!p})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${de}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${ht}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(v("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${T==="cart"?Q(e):T==="favorites"?xe(e):""}
      `}
    </div>
  `}function _s(){const e=r.profileView;if(!e||!e.profile)return"";const t=e.profile,n=e.posts||t.posts||[],s=Et(t);return s==="landing"?ws(t):ct(t,n,{topTabOverride:s,tutorialMode:!1})}function Dn(e,{filter:t="all",query:n=""}={}){const s=Array.isArray(e)?e:[],o=Fa(n||"");return s.filter(i=>t==="all"||Ae(i.type)===t?o?`${i.name||""} ${i.category||""} ${i.description||""}`.toLowerCase().includes(o):!0:!1)}function Un(e,t=0){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Math.max(0,Number(t)||0)}function dt(e=[]){return(Array.isArray(e)?e.slice():[]).map((n,s)=>({item:n,idx:s,order:Un(n?.orderIndex,s)})).sort((n,s)=>n.order-s.order||n.idx-s.idx).map((n,s)=>({...n.item,orderIndex:Un(n.item?.orderIndex,s)}))}function Dt(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function Ke(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":Ae(e?.type||"food")==="drink"?"drink":"food"}function Fs(e={}){return String(e?.category||v("menu.other","Sonstiges")).trim()||v("menu.other","Sonstiges")}function Ms(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const Rs=4,Es={thumb:160,small:480,medium:768,large:1280};function Bn({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<Rs&&n===0}function zs({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){const s=Bn({mode:e,priorityIndex:t,slideIndex:n}),o=e==="profile"?' data-image-reveal="menu"':"";return s?`loading="eager" fetchpriority="high"${o}`:`loading="lazy" fetchpriority="low"${o}`}function Ns({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function ge(e,{mode:t="profile",priorityIndex:n=-1,slideIndex:s=0,stableKey:o="",preferredSize:i="small",candidateSizes:c=["small","medium","large"],variant:d="grid"}={}){const p=String(e||"").trim(),b=t==="profile"&&o?{stableKey:o}:null,m=Bn({mode:t,priorityIndex:n,slideIndex:s}),h=t==="profile"&&!m&&d!=="thumb",x=g(p,i,b),w=J(x)?q:x,C=Pa(p),$=Aa(p)&&p!==w?p:C,P=[],T=new Set;c.forEach(y=>{const M=Es[y]||0;if(!M)return;const D=g(p,y,b);if(!D||J(D))return;const O=`${D}|${M}`;T.has(O)||(T.add(O),P.push(`${D} ${M}w`))});const k=P.length>1?P.join(", "):"",S=k?Ns({variant:d}):"",_=h?"":k,F=h?"":S,E=_?` srcset="${a(_)}"`:"",I=F?` sizes="${a(F)}"`:"",z=zs({mode:t,priorityIndex:n,slideIndex:s}),B=`${z}${E}${I}`,H=h?[`data-menu-lazy-src="${a(w)}"`,`data-menu-lazy-fallback="${a($||q)}"`,k?`data-menu-lazy-srcset="${a(k)}"`:"",S?`data-menu-lazy-sizes="${a(S)}"`:""].filter(Boolean).join(" "):"";return{safeImg:h?q:w,fallbackImg:h?q:$,imageAttrs:B,lazyAttrs:H?` ${H}`:"",srcsetValue:k,sizesValue:S,loadingAttrs:z}}function Fe(e=[],t,n=null){const s=n instanceof Set?n:new Set;return e.map((o,i)=>{const c=Fs(o),d=Ms(c),p=!!d&&!s.has(d);return p&&s.add(d),`<div${p?` data-menu-category-anchor="${a(d)}"`:""} class="h-full">${t(o,i)}</div>`}).join("")}function Ut(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function Ds(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function Hn(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),n=Ds(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),s=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&n?{type:"link",url:n,productId:""}:t==="product"&&s?{type:"product",url:"",productId:s}:{type:"self",url:"",productId:""}}function On(){const e=ae(r.userProfile),t=String(r.menu.filter||"all").trim().toLowerCase()||"all",n=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:v("menu.all","Alle")},{id:"food",label:v("menu.products","Produkte")}]:[{id:"all",label:v("menu.all","Alle")},{id:"food",label:v("menu.food","Speisen")},{id:"drink",label:v("menu.drinks","Getraenke")}]).map(o=>`
        <button data-menu-filter="${o.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${n===o.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${o.label}
        </button>
      `).join("")}
    </div>
  `}function Us(){const e=Ia().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${Ca.map(t=>{const n=t.id===e,s=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${n?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${n?f("check",`w-4 h-4 ${s}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function ut(e,{poster:t="",objectPosition:n="50% 50%",badge:s=!0}={}){if(!Jt(e))return"";const o=String(e.videoUrl||"").trim();if(!o)return"";const i=t?` poster="${a(t)}"`:"";return`<video data-autoplay-video src="${a(o)}"${i} class="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]" style="object-position:${n};" muted loop playsinline autoplay preload="metadata"></video>`+(s?'<div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-10"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white block"><path d="M8 5v14l11-7z"></path></svg></div>':"")}function Bt(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=oe(e),o=t==="profile"?Me(e,{index:0}):"",{safeImg:i,fallbackImg:c,imageAttrs:d,lazyAttrs:p}=ge(s,{mode:t,priorityIndex:n,stableKey:o,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),b=Be(e),m=r.activeTab==="menu"?r.userProfile:r.profileView?.profile||r.userProfile,h=ae(m),x=vn(e,h),w=h?hn(e.category):e.category||"",C=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${a(i)}" data-fallback-src="${a(c)}"${p} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${d} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${a(e.name||v("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${a(b)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${a(w)}</span>`:""}
            <span>${a(x)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${f("more-horizontal","w-4 h-4")}
          </summary>
          <div class="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-2xl shadow-lg p-2 z-20">
            <button data-menu-edit="${a(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
            <button data-menu-delete="${a(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Loeschen</button>
          </div>
        </details>
      </div>
    `:`
    <div ${t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:""} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${t==="profile"?"cursor-pointer":""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${a(i)}" data-fallback-src="${a(c)}"${p} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${d} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${a(e.name||v("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${a(b)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${w?`<span>${a(w)}</span>`:""}
          <span>${a(x)}</span>
        </div>
        ${C?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${a(C)}</p>`:""}
      </div>
    </div>
  `}function Ht(e,{mode:t="profile",variant:n="food",priorityIndex:s=-1}={}){const o=oe(e),i=t==="profile"?Me(e,{index:0}):"",c=n==="drink",{safeImg:d,fallbackImg:p,imageAttrs:b,lazyAttrs:m}=ge(o,{mode:t,priorityIndex:s,stableKey:i,preferredSize:c?"small":"medium",candidateSizes:c?["small","medium"]:["small","medium","large"],variant:c?"grid":"hero"}),h=Be(e),x=r.activeTab==="menu"?r.userProfile:r.profileView?.profile||r.userProfile,w=ae(x),C=vn(e,w),$=w?hn(e.category):e.category||"",P=e.description||"",T=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",k=r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"",S=Je(e),_=pn(k,S),F=_?fn(_):{likes:[],comments:[],counts:{likes:0,comments:0}},E=mn(F),I=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${f("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${a(S)}">${a(A(E.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${f("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${a(S)}">${a(A(E.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${T} class="w-full ${c?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${c?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100 relative">
        <img src="${a(d)}" data-fallback-src="${a(p)}"${m} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${b} decoding="async" />
        ${ut(e,{poster:d,objectPosition:Z(e)})}
      </div>
      ${c?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${a(e.name||v("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${a(h)}</p>
          ${I}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${a(e.name||v("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${a(h)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${$?`<span>${a($)}</span>`:""}
            <span>${a(C)}</span>
          </div>
          ${P?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${a(P)}</p>`:""}
          ${I}
        </div>
      `}
    </div>
  `}function Ot(e={}){if(!e?.restaurantId||ae(e))return!1;const t=String(Pt(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":ye(e)}function Vn(e){const t=e?.restaurantId||r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"",n=Je(e),s=pn(t,n),o=s?fn(s):{likes:[],comments:[],counts:{likes:0,comments:0}},i=String(r.user?.uid||"").trim(),c=String(r.user?.handle||"").trim().toLowerCase(),d=!!o.likes?.some(p=>{const b=String(p?.uid||"").trim();if(i&&b&&b===i)return!0;const m=String(p?.handle||"").trim().toLowerCase();return!!c&&!!m&&m===c});return{itemId:n,meta:o,counts:mn(o),isLiked:d}}function Me(e,{index:t=0}={}){const n=String(e?.restaurantId||r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"").trim(),s=String(e?.id||Je(e)||"").trim();if(!n||!s)return"";const o=Number(t),i=Number.isFinite(o)?Math.max(0,Math.floor(o)):0;return`menu-detail:${n}:${s}:${i}`}function Bs(e){const t=typeof un=="function"?un(e):[],n=Array.isArray(t)?t.filter(Boolean):[];if(n.length)return n;const s=oe(e);return s?[s]:[]}function be(e){return fr(e?.cardStyle||"",Ae(e?.type||"food"))}function Vt(e,{menuItemId:t=""}={}){if(!e)return null;const n=String(t||e.menuItemId||e.itemId||e.productId||"").trim(),s=Jt(e),o=String(e.videoUrl||"").trim(),i=String(e.posterUrl||"").trim(),c=oe(e)||e.imageUrl||(s?i:"")||"";return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:c,objectPosition:e.objectPosition||Z(e),menuItemId:n,mediaType:s?"video":"image",videoUrl:s?o:"",posterUrl:s?i||c:""}}function j(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function Hs(e={}){return nt("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${Ct()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${se({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex items-center justify-between mb-4">
          ${j("h-3 w-24 rounded-full")}
        <div class="flex items-center gap-2">
          ${j("w-9 h-9 rounded-full")}
          ${j("w-9 h-9 rounded-full")}
        </div>
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${j("w-full h-56")}
      </div>
      <div class="mt-4 space-y-2">
        ${j("h-5 w-2/3 rounded-full")}
        ${j("h-4 w-full rounded-full")}
        ${j("h-4 w-3/5 rounded-full")}
      </div>
    </div>
  `}function Os(e={}){return nt("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${se({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
            ${j("w-full h-full")}
          </div>
          <div class="px-2 py-4 space-y-2">
            ${j("h-5 w-2/3 rounded-full")}
            ${j("h-4 w-full rounded-full")}
            ${j("h-4 w-1/2 rounded-full")}
          </div>
        </div>
      </div>
    </div>
  `}function Vs(){return`
    <div class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col relative" aria-hidden="true">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        ${j("w-full h-full")}
        ${j("absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90")}
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="mb-1 space-y-2">
          ${j("h-4 w-4/5 rounded-full")}
          ${j("h-3 w-3/5 rounded-full")}
        </div>
        ${j("h-3 w-full rounded-full mb-1")}
        ${j("h-3 w-2/3 rounded-full mb-3")}
        <div class="mt-auto pt-2 flex items-center justify-between">
          ${j("h-4 w-14 rounded-full")}
          ${j("w-8 h-8 rounded-full bg-slate-900/10")}
        </div>
      </div>
    </div>
  `}function Ks(){return`
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;" aria-hidden="true">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${j("w-full h-full")}
        ${j("absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90")}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div class="min-w-0 flex-1">
            ${j("h-5 w-4/5 rounded-full")}
          </div>
          ${j("h-5 w-14 rounded-full shrink-0")}
        </div>
        ${j("h-4 w-full rounded-full mb-2")}
        ${j("h-4 w-2/3 rounded-full mb-4")}
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div></div>
          <div class="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  `}function Kn(e={}){return nt("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${se({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>Vs()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>Ks()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function qn(e="food"){const t=e==="drink";return`
    <div class="w-full ${t?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm" aria-hidden="true">
      <div class="w-full ${t?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        ${j("w-full h-full")}
      </div>
      ${t?`
        <div class="mt-3 flex flex-1 flex-col space-y-2">
          ${j("h-4 w-4/5 rounded-full")}
          ${j("h-3 w-1/2 rounded-full")}
          <div class="mt-2 flex items-center gap-3">
            ${j("h-3 w-10 rounded-full")}
            ${j("h-3 w-10 rounded-full")}
          </div>
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            ${j("h-4 w-3/5 rounded-full")}
            ${j("h-4 w-14 rounded-full")}
          </div>
          ${j("h-3 w-2/5 rounded-full mt-2")}
          ${j("h-3 w-full rounded-full mt-3")}
          ${j("h-3 w-2/3 rounded-full mt-2")}
          <div class="mt-3 flex items-center gap-3">
            ${j("h-3 w-10 rounded-full")}
            ${j("h-3 w-10 rounded-full")}
          </div>
        </div>
      `}
    </div>
  `}function qs(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${se({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
        <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
        ${j("w-full h-full")}
      </div>
      <div class="pt-3 flex-1 flex flex-col min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1 space-y-2">
            ${j("h-4 w-full rounded-full")}
            ${j("h-4 w-3/5 rounded-full")}
          </div>
          ${j("h-3 w-10 rounded-full shrink-0")}
        </div>
        ${j("h-3 w-full rounded-full mt-3")}
        ${j("h-3 w-2/3 rounded-full mt-2")}
      </div>
    </article>
  `}function Gn({isShop:e=!1,debugContext:t={}}={}){return nt(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${se({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>qs()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${se({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${j("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>qn("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${j("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>qn("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Yn(e,t=[],{mode:n="profile"}={}){const s=e?.restaurantId||"",o=Ot(e)||ae(e);return!s||!o||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((i,c)=>{const d=i.imageUrl||"",p=String(i.menuItemId||i.id||"").trim(),{safeImg:b,fallbackImg:m,imageAttrs:h,lazyAttrs:x}=ge(d,{mode:n,priorityIndex:c,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:p?`menu-focus:${s}:${p}`:""}),w=String(i.menuItemId||"").trim(),C=n==="profile"&&w?`data-menu-open="${a(w)}" role="button"`:"";return`
            <div ${C} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${C?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${a(b)}" data-fallback-src="${a(m)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${i.objectPosition||"50% 50%"};" ${h} decoding="async" />
                ${ut(i,{poster:b,objectPosition:i.objectPosition||"50% 50%",badge:!1})}
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
  `}function Wn(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=oe(e),o=t==="profile"?Me(e,{index:0}):"",{safeImg:i,fallbackImg:c,imageAttrs:d,lazyAttrs:p}=ge(s,{mode:t,priorityIndex:n,stableKey:o,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),b=Be(e),m=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",{itemId:h,counts:x,isLiked:w}=Vn(e);return`
    <div ${m} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${a(i)}" data-fallback-src="${a(c)}"${p} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${d} decoding="async" />
        ${ut(e,{poster:i,objectPosition:Z(e)})}
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
          <span class="text-[14px] font-black text-slate-900">${a(b)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${f("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${a(h)}">${a(A(x.likes))}</span>
          <span data-menu-comment-count="${a(h)}">${a(A(x.comments))}</span>
        </div>
      </div>
    </div>
  `}function Gs(e,t="profile"){if(t!=="profile")return"";const n=Hn(e);return n.type==="link"&&n.url?`data-menu-special-link="${a(n.url)}" role="button" tabindex="0"`:n.type==="product"&&n.productId?`data-menu-open="${a(n.productId)}" role="button"`:`data-menu-open="${a(e.id)}" role="button"`}function Kt(e,{mode:t="profile",size:n="default",priorityIndex:s=-1}={}){const o=oe(e),i=t==="profile"?Me(e,{index:0}):"",c=n==="food",{safeImg:d,fallbackImg:p,imageAttrs:b,lazyAttrs:m}=ge(o,{mode:t,priorityIndex:s,stableKey:i,preferredSize:c?"medium":"small",candidateSizes:c?["small","medium","large"]:["small","medium"],variant:c?"hero":"grid"}),h=Gs(e,t),x=String(e.category||"Special").trim()||"Special",w=a(String(e.name||"Special")).replace(/\n/g,"<br>");return n==="food"?`
      <div ${h} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${a(d)}" data-fallback-src="${a(p)}"${m} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${b} decoding="async" />
        ${ut(e,{poster:d,objectPosition:Z(e)})}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${f("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(x)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${h} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${a(d)}" data-fallback-src="${a(p)}"${m} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${b} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${f("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(x)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function Qn(e,{mode:t="profile",priorityIndex:n=-1}={}){const s=Be(e),o=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",i=Bs(e),d=(i.length?i:[oe(e)||""]).filter(Boolean),p=d.length?d.slice(0,12):[""],b=p.length>1,{itemId:m,counts:h,isLiked:x}=Vn(e),w=A(Math.max(0,Number(h.likes)||0)),C=A(Math.max(0,Number(h.comments)||0));return`
    <div ${o} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${b?`
          <div
            data-menu-card-gallery-track="${a(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${p.map(($,P)=>{const T=t==="profile"?Me(e,{index:P}):"",k=ge($||"",{mode:t,priorityIndex:n,slideIndex:P,stableKey:T,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),S=P>0,_=S?q:k.safeImg,F=S?q:k.fallbackImg,E=S?k.loadingAttrs:k.imageAttrs,I=S?"":k.lazyAttrs||"",z=S?` data-menu-card-deferred-src="${a(k.safeImg)}"
                    data-menu-card-deferred-fallback="${a(k.fallbackImg)}"
                    ${k.srcsetValue?`data-menu-card-deferred-srcset="${a(k.srcsetValue)}"`:""}
                    ${k.sizesValue?`data-menu-card-deferred-sizes="${a(k.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${P}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${a(_)}" data-fallback-src="${a(F)}"${I}${z} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${Z(e)};" ${E} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${p.map(($,P)=>{const T=t==="profile"?Me(e,{index:P}):"",{safeImg:k,fallbackImg:S,imageAttrs:_,lazyAttrs:F}=ge($||"",{mode:t,priorityIndex:n,slideIndex:P,stableKey:T,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${a(k)}" data-fallback-src="${a(S)}"${F} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${Z(e)};" ${_} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${a(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${x?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${x?"true":"false"}"
        >
          ${f("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${b?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${p.map(($,P)=>`
              <div
                data-menu-card-gallery-dot="${a(e.id)}"
                data-menu-card-gallery-index="${P}"
                class="${P===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
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
            <span>${a(v("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${f("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function Ys(e,t,{mode:n="profile",publicMenuSurfaceState:s=null,focusFallbackHtml:o=""}={}){const i=dt(Array.isArray(t)?t:[]),c=String(e?.restaurantId||"").trim(),d=n==="admin"||Ba(c),p=s?.focus?.canRenderFocus?{items:Array.isArray(s.focus.items)?s.focus.items:[],enabled:!0}:c&&d?Xe(c):{items:[],enabled:!1},b=p.enabled?(Array.isArray(p.items)?p.items:[]).map(y=>Vt({...y,objectPosition:Te(y)})):[],m=i.filter(y=>be(y)==="testfirst_focus"&&!Dt(y)).map(y=>Vt(y,{menuItemId:y.id||""})).filter(Boolean),h=new Set,x=[...b,...m].filter(y=>{const M=String(y.menuItemId||y.id||`${y.title}|${y.text}|${y.imageUrl}`);return!M||h.has(M)?!1:(h.add(M),!0)}),w=i.filter(y=>!Dt(y)),C=w.filter(y=>be(y)!=="testfirst_focus"),$=C.length?C:w,P=C.length?x:[],T=$.filter(y=>Ke(y)==="drink"),k=$.filter(y=>Ke(y)!=="drink"),S=(y=[])=>{const M=[],D=[];return y.forEach(O=>{const K=be(O);K==="testfirst_food"||K==="testfirst_special"&&Ut(O)==="food"?D.push(O):M.push(O)}),{gridItems:M,foodItems:D}},_=(y,M=-1)=>be(y)==="testfirst_special"?Kt(y,{mode:n,priorityIndex:M}):Wn(y,{mode:n,priorityIndex:M});let F=0;const E=()=>{const y=F;return F+=1,y},I=new Set,z=(y,M)=>!M.gridItems.length&&!M.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${a(y)}">
        ${M.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a(y)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${Fe(M.gridItems,D=>_(D,E()),I)}
            </div>
          </div>
        `:""}
        ${M.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a(y)}">
            <div class="app-content-inline">
              ${Fe(M.foodItems,D=>{const O=be(D),K=E();return O==="testfirst_special"?Kt(D,{mode:n,size:"food",priorityIndex:K}):Qn(D,{mode:n,priorityIndex:K})},I)}
            </div>
          </div>
        `:""}
      </section>
    `,B=S(T),H=S(k);return`
    <div>
      ${Yn(e,P,{mode:n})||o}
      <div id="menu-section" class="mt-5">
        ${z("drink",B)}
        ${z("food",H)}
      </div>
    </div>
  `}function Jn(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:s=null,priorityOffset:o=0}={}){return e.length?n?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${Fe(e,(i,c)=>Wn(i,{mode:t,priorityIndex:o+c}),s)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${Fe(e,(i,c)=>Ht(i,{mode:t,variant:"drink",priorityIndex:o+c}),s)}
    </div>
  `:""}function Xn(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:s=null,priorityOffset:o=0}={}){return e.length?n?`
      <div>
        ${Fe(e,(i,c)=>be(i)==="testfirst_special"&&Ut(i)==="food"?Kt(i,{mode:t,size:"food",priorityIndex:o+c}):Qn(i,{mode:t,priorityIndex:o+c}),s)}
      </div>
    `:`
    <div class="space-y-4">
      ${Fe(e,(i,c)=>Ht(i,{mode:t,variant:"food",priorityIndex:o+c}),s)}
    </div>
  `:""}function Zn(e,{mode:t="profile"}={}){if(t==="admin"){const n=String(r?.menu?.filter||"all").trim().toLowerCase(),s=ae(r.userProfile),o=v("menu.products","Produkte"),i=e.filter(m=>Ae(m?.type)==="drink"),c=e.filter(m=>Ae(m?.type)!=="drink"),d=(m,h,{addType:x=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${a(m)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${a(m)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(A(h.length))} Eintraege</p>
          </div>
          ${x?`
            <button type="button" data-menu-add-${a(x)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${f("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${h.length?`<div class="space-y-3">${h.map(w=>Bt(w,{mode:"admin"})).join("")}</div>`:(tt({functionName:"renderMenuList.adminSection",items:h,rawItems:h,filteredItems:h,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${se({source:"admin-menu:no-products"})}>${a(v("menu.noProducts","Keine Produkte"))}</div>`)}
      </div>
    `;if(s)return d(o,e,{addType:"food"});const p=[{title:v("menu.drinks","Getraenke"),list:i,addType:"drink"},{title:v("menu.food","Speisen"),list:c,addType:"food"}];if(n==="all")return`
        <div>
          ${p.map(m=>d(m.title,m.list,{addType:m.addType})).join("")}
        </div>
      `;const b=p.filter(m=>m.list.length>0);return b.length?`
      <div>
        ${b.map(m=>d(m.title,m.list,{addType:m.addType})).join("")}
      </div>
    `:n==="drink"?d(v("menu.drinks","Getraenke"),[],{addType:"drink"}):n==="food"?d(v("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((n,s)=>Bt(n,{mode:t,priorityIndex:s})).join("")}
    </div>
  `:(tt({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${se({source:`${t}:no-products`})}>
        ${a(v("menu.noProducts","Keine Produkte"))}
      </div>
    `)}function qt(e,{variant:t="focus",suppressLoading:n=!1}={}){if(!e)return"";const{items:s,enabled:o,loading:i}=Xe(e,{includeInactive:!0}),c=A(s.length),d=String(t||"").trim().toLowerCase()==="travel-offers",p=d?"Ofertat":"Sot ne Fokus",b=d?"Oferta":"Highlights",m=d?"Im Travel und Profil sichtbar":"Im Profil sichtbar",h=d?"Ofertat werden geladen...":v("focus.loading","Fokus wird geladen..."),x=d?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${a(p)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${a(b)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(c)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${d?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(m)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${o?"checked":""} />
      </label>

      ${s.length?`
        <div class="space-y-3">
          ${s.map(w=>{const C=g(w.imageUrl||"","thumb"),$=J(C)?q:C,P=w.active!==!1?"Aktiv":"Inaktiv",T=w.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a($)}" class="w-full h-full object-cover" style="object-position:${Te(w)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(w.title||"Sot ne Fokus")}</p>
                  ${w.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(w.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${T}">${P}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${a(w.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${a(w.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:i&&!n?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(h)}</div>
      `:i?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(x)}</div>
      `}
    </div>
  `}function ea(e={}){if(!e?.restaurantId)return!1;const t=String(Pt(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||ae(e)?!1:ye(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function Ws(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function Qs(e,t){if(!t||!ea(e))return"";const{items:n,loading:s}=ja(t,{includeInactive:!0}),o=A(n.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(o)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${n.length?`
        <div class="space-y-3">
          ${n.map(i=>{const c=g(i.imageUrl||"","thumb"),d=J(c)?q:c,p=Ws(i),b=i.category||"RESTAURANT",m=i.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(d)}" class="w-full h-full object-cover" style="object-position:${Te(i)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(i.title||"Ad")}</p>
                  ${i.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(i.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${a(b)} · ${a(m)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${p.className}">${a(p.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${a(i.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${a(i.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:s?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ads werden geladen...</div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Ads</div>
      `}
    </div>
  `}function Gt(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function Js(e={}){const t=String(e?.restaurantId||"").trim(),n=t?le(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function Yt(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function Xs(e={}){const t=Yt(e);return[...Gt(t.productIds),...Gt(e.shoppingLandingCardProductIds),...Gt(e.shoppingLandingProductIds)].filter(Boolean)}function Wt(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[n,s])=>{const o=String(n||"").trim(),i=String(s||"").trim();return o&&i&&(t[o]=i),t},{})}function Zs(e={}){const t=Yt(e);return{...Wt(e.shoppingLandingProductImageOverrides),...Wt(t.productImageOverrides)}}function er(e=""){const t=String(e||"").trim(),n=r.shoppingLandingCardEditor&&typeof r.shoppingLandingCardEditor=="object"?r.shoppingLandingCardEditor:{},s=String(n.restaurantId||"").trim();return s&&s!==t?{}:n}function tr(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function nr(e={}){const n=[oe(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(tr).filter(Boolean);return n.filter((s,o)=>n.indexOf(s)===o)}function ar(e={},t={},n={}){const s=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!s)return null;const o=nr(e).map(m=>({rawUrl:m,imageUrl:g(m,"thumb")})).filter(m=>m.rawUrl&&!J(m.imageUrl)),i=o[0]?.rawUrl||"",c=String(t?.[s]||"").trim(),d=String(n?.[s]||"").trim(),p=d||c||i,b=p?g(p,"thumb"):"";return{id:s,name:String(e.name||e.title||"Produkt").trim(),price:Be(e),imageUrl:b&&!J(b)?b:"",defaultImageRaw:i,cardImageUrl:c,previewImageUrl:d,imageCandidates:o,objectPosition:Z(e)}}function sr(e={},t="",n=[]){if(!t||!ae(e))return"";const s=Js(e),o=Yt(s),i=er(t),c=i.saving===!0,d=String(i.status||"").trim(),p=/fehl|error|nicht|nuk|kein/i.test(d),b=String(o.imageUrl||s.shoppingLandingCardImageUrl||s.shoppingLandingImageUrl||"").trim(),m=String(s.logoUrl||s.logo||s.logoURL||s.avatar||e.avatar||"").trim(),h=String(i.imageUrlDraft??b).trim(),x=String(i.imagePreview||h||m||"").trim(),w=x?g(x,"large"):q,C=String(i.titleDraft??(o.title||s.shoppingLandingCardTitle||e.name||"")).trim(),$=i.active!==void 0?i.active!==!1:o.active!==!1&&s.shoppingLandingCardEnabled!==!1,P=Xs(s),T=Array.isArray(i.productIds)?i.productIds.map(I=>String(I||"").trim()).filter(Boolean):null,k=new Set(T||P),S={...Zs(s),...Wt(i.productImageOverrides)},_=i.productImagePreviews&&typeof i.productImagePreviews=="object"?i.productImagePreviews:{},F=(Array.isArray(n)?n:[]).filter(I=>I&&String(I.id||"").trim()&&I.hidden!==!0&&I.available!==!1).map(I=>ar(I,S,_)).filter(Boolean),E=k.size?`${A(k.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${a(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(E)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${a(h)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${a(w||q)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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
            <p class="text-xs font-black text-slate-800">Shopping-Tab anzeigen</p>
            <p class="text-[10px] font-bold text-slate-400">Diese Card erscheint im Tab Shopping.</p>
          </div>
          <input id="shoppingLandingActiveToggle" type="checkbox" class="w-5 h-5 accent-amber-500" style="accent-color:#f97316;" ${$?"checked":""} />
        </label>

        <div class="rounded-[1.8rem] border border-slate-100 bg-slate-50 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produkte</p>
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${a(A(F.length))}</span>
          </div>
          ${F.length?`
            <div class="grid grid-cols-1 gap-2">
              ${F.map(I=>{const z=k.has(I.id),B=I.imageUrl||q,H=String(I.defaultImageRaw||I.imageCandidates[0]?.rawUrl||"").trim(),y=String(I.cardImageUrl||"").trim(),M=String(I.previewImageUrl||"").trim(),D=!!(M||y&&y!==H),O=M||(y&&!I.imageCandidates.some(K=>K.rawUrl===y)?y:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${a(I.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${z?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${a(B)}" class="w-full h-full object-cover" style="object-position:${a(I.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${a(I.name)}</span>
                        ${I.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${a(I.price)}</span>`:""}
                      </span>
                    </label>
                    ${z?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${D?`
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
                          ${I.imageCandidates.map((K,W)=>{const te=W===0,ne=M?!1:te?!D:y===K.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${a(I.id)}" data-shopping-landing-product-image-choice="${a(I.id)}" value="${te?"":a(K.rawUrl)}" class="hidden" ${ne?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${ne?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${a(K.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${W+1}</span>
                              </label>
                            `}).join("")}
                          ${O?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${a(I.id)}" data-shopping-landing-product-image-choice="${a(I.id)}" value="${a(O)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${a(g(O,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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
            <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Produkte</div>
          `}
        </div>

        ${d?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${p?"text-rose-500":"text-slate-500"}">${a(d)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
          ${c?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function rr(e){if(!Ot(e)||!wn(e))return"";const n=dt((r.menu.items||[]).filter(s=>be(s)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(A(n.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>
      ${n.length?`
        <div class="space-y-3">
          ${n.map(s=>{const o=g(oe(s),"thumb"),i=J(o)?q:o,c=Hn(s),d=c.type==="link"?"Link":c.type==="product"?"Produkt-Modal":"Diese Karte",p=Ut(s)==="food"?"Food-Size":"Normal",b=Da(Ke(s));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(i)}" class="w-full h-full object-cover" style="object-position:${Z(s)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(s.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${a(b)}</span>
                    <span>${a(p)}</span>
                    <span>${a(d)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${a(s.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${a(s.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function ta(e,{restaurantId:t="",suppressLoading:n=!1,allowAutoEnsure:s=!0,requirePublicMenuTruth:o=!0}={}){const i=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!i||!ye(e))return"";const c=Ye(r,{profile:e,routePayload:r?.profileView?.routePayload,webDirectEntry:r?.__webDirectEntry,restaurantId:i});if(o&&c.menu.status!=="ready")return"";const d=!o||c.focus.canRenderFocus;if(s&&!r.focus.loading&&!d&&we(xn(e,i)),o&&!d)return"";const{items:p,loading:b}=d?{items:Array.isArray(c.focus.items)?c.focus.items:[],loading:c.focus.loading}:Xe(i);if(!(d?!0:Xe(i).enabled)||!p.length&&!b||n&&b&&!p.length)return"";if(b&&!p.length)return`
      <div class="${Ct()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(v("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const h=La(p),x=p[h]||p[0],{safeImg:w,fallbackImg:C,imageAttrs:$,lazyAttrs:P}=ge(x.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:x?.id?`focus-carousel:${i}:${String(x.id)}`:""}),T=x.text||"";return`
    <div id="focusCarousel" class="${Ct()} rounded-[2.5rem] p-6 border shadow-sm">
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
        ${Jt(x)&&String(x.videoUrl||"").trim()?`
          <video data-focus-media="video" data-focus-video data-autoplay-video src="${a(String(x.videoUrl||"").trim())}" ${w?`poster="${a(w)}"`:""} class="w-full h-56 object-cover" style="object-position:${Te(x)};" muted loop playsinline autoplay preload="metadata"></video>
          <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
          </div>
        `:`
          <img data-focus-media="image" data-focus-image src="${a(w)}" data-fallback-src="${a(C)}"${P} class="w-full h-56 object-cover" style="object-position:${Te(x)};" ${$} decoding="async" />
        `}
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${a(x.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${T?"":"hidden"}">${a(T)}</p>
      </div>
      ${p.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${p.map((S,_)=>`
            <button type="button" data-focus-dot="${_}" class="w-2.5 h-2.5 rounded-full ${_===h?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function ir(e,t=220){const n=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${n}`}function na({label:e,url:t,caption:n}){if(!t)return"";const s=ir(t,240);return`
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
  `}function or({profile:e,restaurantId:t,catalogLabel:n}){if(!t||!ye(e))return"";if(typeof cn=="function"){const i=Ze?Ze(t):null;(!i||i.sameRestaurant!==!0||!i.loading&&!i.loaded&&!i.error)&&cn(e)}const s=typeof Ze=="function"?Ze(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},o=(s.tables||[]).map(i=>{const c=_a("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:i});return na({label:`Tisch ${i}`,url:c,caption:`${n} fuer Tisch ${i}`})}).join("");return`
    <div class="mt-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tisch QR</span>
          <h3 class="text-xl font-black italic tracking-tighter">Tische</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gib an, wie viele Tische du hast. Bereits erzeugte Tisch-QR bleiben dauerhaft unter denselben Links.</p>
        </div>
        <label class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <input id="tableQrEnabledToggle" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${s.enabled!==!1?"checked":""} />
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Aktiv</span>
        </label>
      </div>
      <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="tableQrCountInput" class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Anzahl Tische</label>
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${a(String(s.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${s.saving?"disabled":""}>
          ${s.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${s.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${s.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${a(s.status)}</p>`:""}
      ${s.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(s.error)}</p>`:""}
      ${o?`
        <div class="grid grid-cols-2 gap-4 mt-6">
          ${o}
        </div>
      `:`
        <div class="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">Noch keine Tisch-QR-Codes</p>
        </div>
      `}
    </div>
  `}function lr(){const e=r.userProfile,t=e.restaurantId||"",n=String(r.user?.uid||"").trim(),s=String(r.__authBootstrapInFlightUid||"").trim(),o=!t&&!!n&&(!!r.__authProfileLoadPromise||s===n),i=He(e),c=ye(e),d=r.profileView?.profile?.restaurantId?r.profileView.profile:null,p=U()&&!!d?.restaurantId&&ye(d),b=ae(e),m=Na(ya(e)),h=t?le(t):null,x=h?.name||h?.restaurantName||e.name||"Business",w=t&&r.menu.restaurantId===t,C=String(r.menu.source||"").trim().toLowerCase(),$=!!w&&C==="collection",P=!!w&&C==="collection"&&r.menu.loading,T=!!t&&(P||!$),k=b?"all":r.menu.filter,S=$?Dn(r.menu.items,{filter:k,query:r.menu.query}):[],F=wn(e)?S:S.filter(z=>!Ka(z)),E=dt(F),I=A(E.length);if(t&&i){Wa(e);const z=String(r.focus?.truthSource||"").trim().toLowerCase();return!r.focus.loading&&(r.focus.restaurantId!==t||z!=="public-menu")&&we(e),hs(e)}return t&&c&&!$&&!P&&Qe(e),t&&c&&!r.focus.loading&&r.focus.restaurantId!==t&&we(e),t&&ea(e)&&It(e),c?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${m}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(x)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${a(I)}</p>
          </div>
        </div>
      `:o?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Business wird geladen...</p>
        </div>
      `:`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Bitte zuerst dein Business im Account auswaehlen.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Zu den Einstellungen</button>
        </div>
      `}

      ${t?qt(t):""}
      ${t?Qs(e,t):""}
      ${t?sr(e,t,$?r.menu.items:[]):""}
      ${t&&$?rr(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${f("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${a(r.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${On()}

        ${T?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(v("menu.loading",`${m} wird geladen...`,{label:m}))}</div>`:Zn(E,{mode:"admin"})}
        ${r.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${a(r.menu.error)}</div>`:""}
        ${or({profile:e,restaurantId:t,catalogLabel:m})}
      `:""}

    </div>
  `:p?pt(d):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${f("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${m}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function pt(e,{mode:t="profile",allowAutoEnsure:n=!0}={}){const s=r?.profileView?.routePayload&&typeof r.profileView.routePayload=="object"?r.profileView.routePayload:null,o=r?.__webDirectEntry&&typeof r.__webDirectEntry=="object"&&r.__webDirectEntry.active===!0?r.__webDirectEntry:null;let i=Ye(r,{profile:e,routePayload:s,webDirectEntry:o});const c=i.restaurantId||Ua(e,s);if(!c)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${a(v("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const d=xn(e,c),p=ae(d),b=ye(d)&&!p;b&&(i=Ye(r,{profile:d,routePayload:s,webDirectEntry:o,restaurantId:c}));const m=String(o?.canonicalRestaurantId||o?.restaurantId||"").trim(),h=new Set(i.targetIds),x=i.menu.status==="ready",w=i.focus.canRenderFocus,C=x&&b,$=i.focus.matches===!0&&i.focus.loading===!0,T=String(r?.profileView?.menuAccessSource||o?.menuAccessSource||s?.menuAccessSource||"").trim().toLowerCase()==="qr",k=o?.active===!0&&o?.webPriority===!0&&o?.menuFirst===!0&&String(r?.activeTab||"").trim().toLowerCase()==="profile"&&String(r?.profileTopTab||"").trim().toLowerCase()==="menu"&&(m===c||h.has(c)),S=k&&!T,_=["ready","empty","error"].includes(i.menu.status),F=k&&_,E=k&&(!C||i.menu.status!=="ready"),I=!C||i.focus.settled===!0||i.focus.confirmedEmpty===!0||i.menu.status!=="ready";n&&!F&&!_&&Pe(d),n&&!E&&!I&&!$&&x&&(!S||_)&&we(d);const B=i.menu.canRenderItems?dt(Dn(i.menu.items,{filter:"all",query:""})).filter(re=>!Dt(re)):[],H=i.menu.error||"",y=mr(i.menu,B),{hasItems:M,hasError:D,isLoading:O,shouldRenderNoProducts:K}=y;Ra({profile:d,routePayload:s,surface:i,decision:y});const W={profile:d,routePayload:s,surface:i,decision:y,rawItems:i.menu.items,items:B,filteredItems:B,source:"public-menu"},te=za(i,B),ne=B.filter(re=>Ke(re)==="drink"),$e=B.filter(re=>Ke(re)!=="drink"),Qt=0,ce=ne.length,ke=Ot(e),ft=ke||p,mt=new Set;M&&c&&($a(B,c),Oa(B,c));const gt=c&&w?(Array.isArray(i.focus.items)?i.focus.items:[]).map(re=>Vt({...re,objectPosition:Te(re)})).filter(Boolean):[],bt=i.focus.status==="empty"||i.focus.status==="error",qe=b&&!w&&!bt&&i.menu.status!=="empty"&&i.menu.status!=="error",Ge=gt.length?Yn(d,gt,{mode:t}):qe?Os({...W,reason:"focus-truth-pending"}):"",de=ft?Ge:ta(d,{restaurantId:c,suppressLoading:!0,allowAutoEnsure:x&&(!S||_),requirePublicMenuTruth:!0})||(qe?Hs({...W,reason:"focus-truth-pending"}):"");return ke?`
      <div class="app-main-content-safe"${te}>
        ${O?`
          ${Ge}
          ${Kn({...W,reason:"menu-loading"})}
        `:`
          ${M?Ys(d,B,{mode:t,publicMenuSurfaceState:i,focusFallbackHtml:Ge}):D?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(v("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:K?(tt({...W,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${se({source:"public-menu:no-products"})}>${a(v("menu.noProducts","Keine Produkte"))}</div>`):Kn({...W,reason:"menu-not-confirmed-empty"})}
          ${H?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(H)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5"${te}>
      ${de}
      ${O?`
        ${Gn({isShop:p,debugContext:{...W,reason:"menu-loading"}})}
      `:`
        ${M?`
          ${p?`
            ${Sa(B,{profile:e})}
          `:`
            ${ne.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(v("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Jn(ne,{mode:t,useTestfirstCardUi:ke,seenCategories:mt,priorityOffset:Qt})}
                </div>
              </section>
            `:""}
            ${$e.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(v("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Xn($e,{mode:t,useTestfirstCardUi:ke,seenCategories:mt,priorityOffset:ce})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${D?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(v("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:K?`
            ${tt({...W,functionName:"renderProfileMenuView",renderDecision:p?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${se({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(v("menu.noProducts","Keine Produkte"))}
              </div>
            </div>`}
          `:`
            ${Gn({isShop:p,debugContext:{...W,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${H?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(H)}</div>`:""}
      `}
    </div>
  `}function cr(){const e=r.userProfile,t=R(e),n=t?r.businessPosts:r.userPosts,s=String(r.user?.uid||e?.uid||"").trim(),o=String(e?.restaurantId||"").trim(),i=String(r.__userPostsLoadingUid||"").trim(),c=String(r.__businessPostsLoadingRestaurantId||"").trim(),d=String(r.__authBootstrapInFlightUid||"").trim(),p=!!s&&i===s,b=!!o&&c===o,m=!!s&&d===s,h=t?b||m&&!n.length:p||m&&!n.length,x=String(e.handle||Y(e.name||"user")).replace(/^@/,""),C=a(e.bio||"").replace(/\n/g,"<br>")||a(v("profile.noBio","Noch keine Bio.")),$=it(e),P=$==="menu",T=$==="checkins",k=n,S=g(e.avatar,"avatar"),_=L(t),F=Et(e);return`
    <div class="app-main-content-safe">
      ${F==="profile"||F==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Nn(e,{mode:"self",avatarUrl:S,avatarFit:_,followersLabel:A(e.followers),bioHtml:C}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${a(S)}" data-fallback-src="${a(q)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${_} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(A(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${a(A(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${a(x)}</p>`}
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

      ${zt(e)}
      ${Nt(e)}

      ${P?(()=>{const I=He(e),z=!I&&t&&!at(e)?jn(e):"";return z&&Ln(z,e),`
        <div${z?` ${Oe}="${a(z)}"`:""}>
          ${I?Rt(e):pt(e)}
        </div>
      `})():T?`
        ${Lt()}
      `:`
        ${h&&!k.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(v("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${r.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${jt(k,r.profileViewMode)}
          </div>
          ${$==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${f("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${F==="cart"?Q(e):F==="favorites"?xe(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:yn,renderProfilePostsFancy:jt,renderProfileCheckins:Lt,renderProfileTabs:zt,renderProfileViewControls:Nt,renderPublicProfileView:_s,renderMenuFilterRow:On,renderMenuLayoutSection:Us,renderMenuItemCard:Bt,renderMenuItemCardStacked:Ht,renderMenuDrinkGrid:Jn,renderMenuFoodList:Xn,renderMenuList:Zn,renderFocusAdminSection:qt,renderFocusCarousel:ta,renderMenuQrCard:na,renderMenuAdminView:lr,renderProfileMenuView:pt,renderProfileView:cr}}export{Ui as createProfileMenuFocusRenderController};
