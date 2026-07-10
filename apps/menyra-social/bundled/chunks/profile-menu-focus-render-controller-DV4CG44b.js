import{_ as ir}from"./domain-auth-BL21ERPm.js";import{w as or}from"./domain-menu-eager-sYUyLrLw.js";import{a as Kt}from"./domain-media-eager-B90n_Ot7.js";import{am as He,an as lr,t as cr,ao as dr,k as ur,ap as Ve}from"./domain-feed-social-eager-CZ02cabQ.js";import{n as Xn,g as Zn,h as pr,i as fr}from"./domain-app-events-1TCZU4mB.js";import{K as mr,L as gr,M as br,N as hr,O as vr,P as xr,Q as wr,J as yr,R as $r,A as kr,g as Sr,B as Ir,S as Cr,T as Pr,b as Ar,d as jr}from"./vendor-firebase-D7Ks7H8l.js";import"./domain-public-profile-BW4dw-Ab.js";const en=Object.freeze([Object.freeze({key:"city",label:"Qyteti",labelDe:"Stadt"}),Object.freeze({key:"beach",label:"Plazha",labelDe:"Straende"}),Object.freeze({key:"sights",label:"Vende per te pare",labelDe:"Sehenswuerdigkeiten"}),Object.freeze({key:"activities",label:"Aktivitete",labelDe:"Aktivitaeten"}),Object.freeze({key:"nature",label:"Natyre",labelDe:"Natur"}),Object.freeze({key:"food",label:"Restorante & Kafene",labelDe:"Restaurants & Cafes"}),Object.freeze({key:"nearby",label:"Vende te rendesishme",labelDe:"Wichtige Orte"})]),Tr=Object.freeze(en.map(i=>i.key)),Lr=Object.freeze([Object.freeze({key:"all",labelDe:"Ganzjaehrig"}),Object.freeze({key:"summer",labelDe:"Saisonal Sommer"}),Object.freeze({key:"winter",labelDe:"Saisonal Winter"})]),_r=Object.freeze(Lr.map(i=>i.key)),Fr=12;function ve(i=""){return i==null?"":String(i).trim()}function qt(i){const r=Number(i);return Number.isFinite(r)?r:null}function Mr(i=""){const r=ve(i).toLowerCase();return Tr.includes(r)?r:{qyteti:"city",stadt:"city",plazha:"beach",plazhi:"beach",strand:"beach",straende:"beach",sehenswuerdigkeiten:"sights",sehenswurdigkeiten:"sights",aktivitete:"activities",aktivitaeten:"activities",natyre:"nature",natur:"nature",restorante:"food",restaurants:"food",cafes:"food",kafene:"food",umgebung:"nearby",rrethina:"nearby"}[r]||"nearby"}function Rr(i=""){const r=ve(i).toLowerCase();return _r.includes(r)?r:"all"}function Er(i=Date.now(),r=Math.random()){const d=Math.max(0,Number(i)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(r)||0))*36**6).toString(36).padStart(6,"0");return`place_${d}_${n}`}function zr(i){return Array.isArray(i)?i.map(r=>ve(r)).filter(Boolean).slice(0,Fr):[]}function Nr(i={},{index:r=0}={}){const d=i&&typeof i=="object"?i:{},n=qt(d.lat??d.latitude??d.coords?.lat),m=qt(d.lng??d.lon??d.longitude??d.coords?.lng),p=qt(d.priority);return{id:ve(d.id)||Er(Date.now()+r),name:ve(d.name),category:Mr(d.category),description:ve(d.description??d.text).slice(0,600),address:ve(d.address??d.plusCode).slice(0,240),lat:n,lng:m,coverImageUrl:ve(d.coverImageUrl??d.imageUrl??d.coverUrl),gallery:zr(d.gallery),priority:p==null?0:Math.max(0,Math.min(100,Math.round(p))),pinned:d.pinned===!0,season:Rr(d.season??d.seasonal),active:d.active!==!1}}const Dr=6371e3,Ur=80,Br=600,Or=1600;function mt(i=0){return(Number(i)||0)*(Math.PI/180)}function Me(i){return i==null||i===""?NaN:Number(i)}function vt(i={}){return Number.isFinite(Me(i?.lat))&&Number.isFinite(Me(i?.lng))}function Hr(i,r,d,n){const m=Me(i),p=Me(r),M=Me(d),D=Me(n);if(![m,p,M,D].every(Number.isFinite))return null;const W=mt(M-m),L=mt(D-p),A=Math.sin(W/2)**2+Math.cos(mt(m))*Math.cos(mt(M))*Math.sin(L/2)**2;return Math.round(2*Dr*Math.asin(Math.min(1,Math.sqrt(A))))}function Vr(i){const r=Number(i);return!Number.isFinite(r)||r<0?"":r<1e3?`${Math.max(10,Math.round(r/10)*10)} m`:r<1e4?`${(r/1e3).toFixed(1).replace(/\.0$/,"")} km`:`${Math.round(r/1e3)} km`}function Kr(i){const r=Number(i);return!Number.isFinite(r)||r<0?null:r<=Or?{mode:"walk",minutes:Math.max(1,Math.round(r/Ur))}:{mode:"drive",minutes:Math.max(1,Math.round(r/Br))}}function ea(i,r={}){const d=Kr(i);if(!d)return"";const n=String(r.walk||"min in Gehweite"),m=String(r.drive||"min mit dem Auto");return`${d.minutes} ${d.mode==="walk"?n:m}`}const da=200;function he(i=""){return i==null?"":String(i).trim()}function ta(i){return Array.isArray(i)?Array.from(new Set(i.map(r=>he(r)).filter(Boolean))).slice(0,da):[]}function ua(i={}){const r=i&&typeof i=="object"?i:{},d=r.placePatches&&typeof r.placePatches=="object"?r.placePatches:{},n={};return Object.entries(d).slice(0,da).forEach(([m,p])=>{const M=he(m);if(!M||!p||typeof p!="object")return;const D={};he(p.name)&&(D.name=he(p.name)),he(p.description)&&(D.description=he(p.description).slice(0,600)),he(p.coverImageUrl)&&(D.coverImageUrl=he(p.coverImageUrl)),Object.keys(D).length&&(n[M]=D)}),{hidden:ta(r.hidden),pinned:ta(r.pinned),placePatches:n}}function Wt({places:i=[],overrides:r={},hotelCoords:d=null,includeHidden:n=!1}={}){const m=ua(r),p=new Set(m.hidden),M=new Map(m.pinned.map((L,A)=>[L,A])),D=vt(d)?d:null;return(Array.isArray(i)?i:[]).map((L,A)=>Nr(L,{index:A})).filter(L=>L.name&&L.active).map(L=>{const A=m.placePatches[L.id]||{},Q=D&&vt(L)?Hr(D.lat,D.lng,L.lat,L.lng):null;return{...L,...A,hidden:p.has(L.id),pinned:M.has(L.id)||L.pinned,pinnedRank:M.has(L.id)?M.get(L.id):null,distanceMeters:Q}}).filter(L=>n||!L.hidden).sort((L,A)=>{const Q=L.pinnedRank!=null,xe=A.pinnedRank!=null;if(Q!==xe)return Q?-1:1;if(Q&&xe&&L.pinnedRank!==A.pinnedRank)return L.pinnedRank-A.pinnedRank;if(L.pinned!==A.pinned)return L.pinned?-1:1;if(L.priority!==A.priority)return A.priority-L.priority;const Ce=Number.isFinite(L.distanceMeters)?L.distanceMeters:1/0,Pe=Number.isFinite(A.distanceMeters)?A.distanceMeters:1/0;return Ce!==Pe?Ce-Pe:String(L.name).localeCompare(String(A.name))})}function qr(i=[]){const r=Array.isArray(i)?i:[];return en.map(d=>({...d,places:r.filter(n=>n.category===d.key)})).filter(d=>d.places.length)}const Yt="mnyraHotelDestinationSections",na="mnyraHotelDetailStyles",Gr="/apps/menyra-social/styles/hotel-detail.css?v=2026-07-10-hotel-detail-v1",aa=Object.freeze({walk:"min në këmbë",drive:"min me makinë"}),Ee=Object.freeze({rooms:"Qëndrimi yt",city:"Përreth teje",beach:"Deti afër",sights:"Vlen të shihet",activities:"Përjeto zonën",nature:"Natyrë e gjallë",food:"Shijo lokal",nearby:"Afër teje",amenities:"Pa pagesë shtesë",map:"Zbulo zonën",rating:"Nga vizitorët"}),Qt=Object.freeze({city:"Qyteti",beach:"Plazha",sights:"Vende për të parë",activities:"Aktivitete",nature:"Natyra",food:"Restorante & Kafene",nearby:"Vende të rëndësishme"}),Jt=Object.freeze({bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>',building:'<path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',waves:'<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>',compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',sparkles:'<path d="m12 3-1.2 3.1L8 7.5l2.8 1.4L12 12l1.2-3.1L16 7.5l-2.8-1.4zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8zM18 13l-1 2.7-3 1.3 3 1.3 1 2.7 1-2.7 3-1.3-3-1.3z"/>',tree:'<path d="m17 14 3 3h-5l3 3H6l3-3H4l3-3H3l5-5H5l7-7 7 7h-3l5 5zM12 20v2"/>',coffee:'<path d="M10 2v2M14 2v2M6 2v2M18 8h1a3 3 0 0 1 0 6h-1M4 8h14v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>',pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0"/><circle cx="12" cy="10" r="3"/>',nav:'<path d="m3 11 19-9-9 19-2-8z"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',expand:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/>',check:'<path d="m20 6-11 11-5-5"/>',wifi:'<path d="M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',car:'<path d="m5 17-2-1v-4l2-5h14l2 5v4l-2 1M5 17v2M19 17v2M3 13h18M7 13h.01M17 13h.01"/>',snow:'<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93M8 5l4 2 4-2M8 19l4-2 4 2"/>',shield:'<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',umbrella:'<path d="M2 12h20M12 12v8a2 2 0 0 0 4 0M2 12a10 10 0 0 1 20 0M12 2v1"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',size:'<path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6"/>'}),Wr=Object.freeze({city:"building",beach:"waves",sights:"compass",activities:"sparkles",nature:"tree",food:"coffee",nearby:"pin"}),Yr=Object.freeze([{keywords:["wifi","wi-fi","internet"],icon:"wifi"},{keywords:["parkim","parking","garazh"],icon:"car"},{keywords:["mengjes","mëngjes","breakfast","fruehstueck"],icon:"coffee"},{keywords:["klime","klimë","kondicioner","ac"],icon:"snow"},{keywords:["plazh","det","beach","pishine","pishinë","pool"],icon:"waves"},{keywords:["shezlong","ombrelle","umbrella"],icon:"umbrella"},{keywords:["recepsion","reception","siguri","security","24"],icon:"shield"},{keywords:["pastrim","cleaning","spa"],icon:"sparkles"},{keywords:["famil","person"],icon:"users"}]);function V(i=""){return i==null?"":String(i).trim()}function z(i=""){return V(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ie(i="pin",r=""){const d=Jt[i]||Jt.pin;return`<svg class="mhd-icon ${r}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`}function sa(i=typeof document>"u"?null:document){if(!i||i.getElementById(na))return;const r=i.createElement("link");r.id=na,r.rel="stylesheet",r.href=Gr,i.head.appendChild(r)}function ze({iconName:i="pin",eyebrow:r="",title:d=""}={}){return`
    <div class="mhd-section-title">
      <span class="mhd-section-icon">${ie(i)}</span>
      <div>
        ${r?`<small>${z(r)}</small>`:""}
        <h2>${z(d)}</h2>
      </div>
    </div>
  `}function Qr(i=""){const r=V(i);if(!r)return null;const d=r.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i);if(!d)return null;const n=Number(String(d[1]||"").replace(",","."));if(!Number.isFinite(n)||n<0)return null;const m=String(d[2]||"m").trim().toLowerCase();return Math.round(m.startsWith("k")?n*1e3:n)}function Jr(i={}){const r=i.manualDistance&&typeof i.manualDistance=="object"?i.manualDistance:null;if(r){const m=V(r.label);if(!m)return"";const p=Qr(m),M=r.direct!==!0&&Number.isFinite(p)?ea(p,aa):"";return`
      <div class="mhd-distance">
        <span>${ie("nav","mhd-icon--sm")}${z(m)}</span>
        ${M?`<span>${ie("clock","mhd-icon--sm")}${z(M)}</span>`:""}
      </div>
    `}const d=Vr(i.distanceMeters);if(!d)return"";const n=ea(i.distanceMeters,aa);return`
    <div class="mhd-distance">
      <span>${ie("nav","mhd-icon--sm")}${z(d)}</span>
      ${n?`<span>${ie("clock","mhd-icon--sm")}${z(n)}</span>`:""}
    </div>
  `}function Xr(i={},{nearestPlaceId:r="",imageUrlFn:d=null}={}){const n=en.find(D=>D.key===i.category)?.label||"",m=i.id&&i.id===r?"Më afër hotelit":n,p=V(i.coverImageUrl),M=p&&typeof d=="function"&&V(d(p))||p;return`
    <article class="mhd-card">
      <div class="mhd-photo">${M?`<img src="${z(M)}" alt="${z(i.name)}" loading="lazy" decoding="async" />`:""}</div>
      <div class="mhd-card-body">
        ${m?`<span class="mhd-pill ${i.id===r?"mhd-pill--accent":""}">${z(m)}</span>`:""}
        <h3>${z(i.name)}</h3>
        ${Jr(i)}
        ${i.description?`<p class="mhd-copy">${z(i.description)}</p>`:""}
      </div>
    </article>
  `}function ra({template:i=null,overrides:r={},hotelCoords:d=null,imageUrlFn:n=null,manualBeachDistance:m=null}={}){if(!i||!Array.isArray(i.places)||!i.places.length)return"";const p=Wt({places:i.places,overrides:r,hotelCoords:vt(d)?d:null});if(!p.length)return"";const M=p.filter(A=>Number.isFinite(A.distanceMeters)).sort((A,Q)=>A.distanceMeters-Q.distanceMeters)[0]||null,D=qr(p),W=m&&typeof m=="object"?m:null,L=W?W.direct===!0?"Në plazh":V(W.label):"";if(L){const A=D.find(Q=>Q.key==="beach");A?.places?.length&&(A.places[0]={...A.places[0],manualDistance:{label:L,direct:W.direct===!0}})}return D.map(A=>`
    <section class="mhd-section">
      ${ze({iconName:Wr[A.key]||"pin",eyebrow:Ee[A.key]||"",title:Qt[A.key]||A.label})}
      <div class="mhd-rail">
        ${A.places.map(Q=>Xr(Q,{nearestPlaceId:M?.id||"",imageUrlFn:n})).join("")}
      </div>
    </section>
  `).join("")}function bt(){return`
    <section class="mhd-section">
      <div class="mhd-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>
  `}function Zr(){return`
    <div class="mhd">
      ${bt()}
      ${bt()}
      ${bt()}
    </div>
  `}function ei(i={},r="€"){const d=V(i.priceLabel||i.priceText);if(d)return d;const n=Number(i.price??i.startingPrice??i.pricePerNight);if(!Number.isFinite(n)||n<=0)return"";const m=V(i.currency||i.currencyCode)||r;return m==="€"||m.toUpperCase()==="EUR"?`€${n}`:`${n} ${m}`}function ti(i=[]){const r=(Array.isArray(i)?i:[]).filter(d=>V(d?.label));return r.length?`
    <div class="mhd-distance">
      ${r.map(d=>`<span>${ie(d.icon||"check","mhd-icon--sm")}${z(d.label)}</span>`).join("")}
    </div>
  `:""}function ni({rooms:i=[],offers:r=[],imageUrlFn:d=null}={}){const n=(Array.isArray(i)&&i.length?i:Array.isArray(r)?r:[]).filter(m=>m&&m.active!==!1&&V(m.title));return n.length?`
    <section class="mhd-section">
      ${ze({iconName:"bed",eyebrow:Ee.rooms,title:"Dhoma"})}
      <div class="mhd-rail">
        ${n.map(m=>{const p=V(m.imageUrl),M=p&&typeof d=="function"&&V(d(p))||p,D=ei(m);return`
            <article class="mhd-card">
              <div class="mhd-photo">${M?`<img src="${z(M)}" alt="${z(m.title)}" loading="lazy" decoding="async" />`:""}</div>
              <div class="mhd-card-body">
                ${V(m.tag||m.badge)?`<span class="mhd-pill mhd-pill--accent">${z(m.tag||m.badge)}</span>`:""}
                <div class="mhd-heading-price">
                  <h3>${z(m.title)}</h3>
                  ${D?`<span class="mhd-price"><strong>${z(D)}</strong><small>/ natë</small></span>`:""}
                </div>
                ${ti(m.metaParts)}
                ${V(m.text||m.description)?`<p class="mhd-copy">${z(m.text||m.description)}</p>`:""}
              </div>
            </article>
          `}).join("")}
      </div>
    </section>
  `:""}function ai({city:i="",address:r="",imageUrl:d="",imageUrlFn:n=null}={}){const m=V(i);if(!m)return"";const p=V(d),M=p&&typeof n=="function"&&V(n(p))||p;return`
    <section class="mhd-section">
      ${ze({iconName:"building",eyebrow:Ee.city,title:Qt.city})}
      <div class="mhd-rail">
        <article class="mhd-card">
          <div class="mhd-photo">${M?`<img src="${z(M)}" alt="${z(m)}" loading="lazy" decoding="async" />`:""}</div>
          <div class="mhd-card-body">
            <span class="mhd-pill">${z(Qt.city)}</span>
            <h3>${z(m)}</h3>
            ${V(r)?`<p class="mhd-copy">${z(r)}</p>`:""}
          </div>
        </article>
      </div>
    </section>
  `}function si(i=""){const r=V(i).toLowerCase();for(const d of Yr)if(d.keywords.some(n=>r.includes(n)))return d.icon;return"check"}function ri({amenities:i=[]}={}){const r=(Array.isArray(i)?i:[]).map(d=>V(d)).filter(Boolean);return r.length?`
    <section class="mhd-section">
      ${ze({iconName:"check",eyebrow:Ee.amenities,title:"Përfshihet"})}
      <div class="mhd-amenities">
        ${r.slice(0,12).map(d=>`
          <article class="mhd-amenity">
            <span class="mhd-amenity-icon">${ie(si(d))}</span>
            <h3>${z(d)}</h3>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}const Xt="mnyraHotelDetailMap";function ii({address:i="",city:r="",destinationName:d="",mapsUrl:n="",hotelCoords:m=null,hotelName:p=""}={}){const M=[V(i),V(r)].filter(Boolean).join(", ")||V(d);if(!M&&!n)return"";const D=vt(m),W=D?`id="${Xt}" data-map-lat="${z(String(m.lat))}" data-map-lng="${z(String(m.lng))}" data-map-name="${z(V(p))}"`:"";return`
    <section class="mhd-section">
      ${ze({iconName:"compass",eyebrow:Ee.map,title:"Harta e zbulimit"})}
      <div class="mhd-map-card">
        <div class="mhd-map-art ${D?"mhd-map-art--live":""}" ${W}>
          <div class="mhd-map-water"></div>
          <span class="mhd-map-pin">${ie("bed")}</span>
        </div>
        <div class="mhd-map-info">
          <div class="mhd-address">
            <span>${ie("pin")}</span>
            <div>
              <small>Lokacioni</small>
              <strong>${z(M||"Hotel")}</strong>
              ${V(d)?`<p>Plazhi, qyteti dhe vendet kryesore rreth ${z(d)}.</p>`:""}
            </div>
          </div>
          ${n?`<a class="mhd-primary" href="${z(n)}" target="_blank" rel="noopener noreferrer">${ie("expand","mhd-icon--sm")}Hap hartën</a>`:""}
        </div>
      </div>
    </section>
  `}function oi({rating:i="",reviewCount:r="",summary:d=""}={}){const n=Number(V(i).replace(",","."));if(!Number.isFinite(n)||n<=0)return"";const m=Math.max(1,Math.min(5,Math.round(n))),p=Array.from({length:m}).map(()=>`<svg class="mhd-icon mhd-star" viewBox="0 0 24 24" aria-hidden="true">${Jt.star}</svg>`).join(""),M=V(r);return`
    <section class="mhd-section">
      ${ze({iconName:"star",eyebrow:Ee.rating,title:"Vlerësimet"})}
      <div class="mhd-rating">
        <div class="mhd-score">
          <strong>${z(n.toFixed(1))}</strong>
          <div>
            <div class="mhd-stars">${p}</div>
            <p>${z([d,M?`${M} vlerësime`:""].filter(Boolean).join(" · ")||"Nga vizitorët")}</p>
          </div>
        </div>
      </div>
    </section>
  `}function li({rooms:i=[],offers:r=[],amenities:d=[],address:n="",city:m="",cityImageUrl:p="",destinationId:M="",destinationName:D="",destinationSectionsHtml:W="",mapsUrl:L="",hotelCoords:A=null,hotelName:Q="",rating:xe="",reviewCount:Ce="",ratingSummary:Pe="",imageUrlFn:Ke=null}={}){const we=!!V(M),yt=W||(we?bt():"");return`
    <div class="mhd">
      ${ni({rooms:i,offers:r,imageUrlFn:Ke})}
      <div id="${Yt}" data-destination-id="${z(M)}" style="display:contents">
        ${yt}
      </div>
      ${we?"":ai({city:m,address:n,imageUrl:p,imageUrlFn:Ke})}
      ${ri({amenities:d})}
      ${ii({address:n,city:m,destinationName:D,mapsUrl:L,hotelCoords:A,hotelName:Q})}
      ${oi({rating:xe,reviewCount:Ce,summary:Pe})}
    </div>
  `}function Se(i=""){return i==null?"":String(i).trim()}function ee(i=""){return Se(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Fe({id:i="",label:r="",value:d="",placeholder:n="",type:m="text",inputmode:p=""}={}){return`
    <label class="block">
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${ee(r)}</span>
      <input id="${ee(i)}" name="${ee(i)}" type="${ee(m)}" value="${ee(d)}" placeholder="${ee(n)}" ${p?`inputmode="${ee(p)}"`:""} class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
    </label>
  `}function ci(i={},{imagePreview:r=""}={}){const d=ee(i.id),n=Se(r)||Se(i.imageUrl);return`
    <div data-hotel-room-row="${d}" class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">${ee(i.title||"Dhomë e re")}</p>
        <button type="button" data-hotel-room-remove="${d}" class="w-9 h-9 rounded-xl bg-white text-slate-400 border border-slate-100 flex items-center justify-center text-xs font-black" aria-label="Fshi dhomën">✕</button>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-20 h-20 rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
          ${n?`<img id="hotelRoomImagePreview_${d}" src="${ee(n)}" alt="" loading="lazy" class="w-full h-full object-cover" />`:`<span id="hotelRoomImagePreview_${d}" class="text-[9px] font-black text-slate-300 uppercase">Foto</span>`}
        </div>
        <input type="file" id="hotelRoomImageInput_${d}" data-hotel-room-image-input="${d}" accept="image/*" hidden />
        <button type="button" data-hotel-room-image-trigger="${d}" class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Ngarko foto</button>
        <input type="hidden" id="hotelRoomImageUrl_${d}" value="${ee(i.imageUrl)}" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${Fe({id:`hotelRoomTitle_${d}`,label:"Emri i dhomës",value:i.title,placeholder:"Dhomë Deluxe me pamje nga deti"})}
        ${Fe({id:`hotelRoomPrice_${d}`,label:"Çmimi / natë (€)",value:i.price==null?"":String(i.price),placeholder:"118",inputmode:"decimal"})}
        ${Fe({id:`hotelRoomPersons_${d}`,label:"Persona",value:i.persons==null?"":String(i.persons),placeholder:"2",inputmode:"numeric"})}
        ${Fe({id:`hotelRoomBeds_${d}`,label:"Krevate",value:i.beds,placeholder:"1 king"})}
        ${Fe({id:`hotelRoomSize_${d}`,label:"Madhësia (m²)",value:i.size==null?"":String(i.size),placeholder:"31",inputmode:"numeric"})}
        ${Fe({id:`hotelRoomTag_${d}`,label:"Etiketa (opsionale)",value:i.tag,placeholder:"Më e zgjedhura"})}
      </div>
      <label class="block">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Përshkrimi (opsional)</span>
        <textarea id="hotelRoomDesc_${d}" name="hotelRoomDesc_${d}" rows="2" placeholder="Detaje të shkurtra për dhomën..." class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${ee(i.description)}</textarea>
      </label>
      <label class="flex items-center justify-between gap-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktive në profil</span>
        <input id="hotelRoomActive_${d}" type="checkbox" ${i.active!==!1?"checked":""} class="w-5 h-5 accent-slate-900" />
      </label>
    </div>
  `}function di({restaurantId:i="",record:r={},editorState:d={}}={}){const n=Se(i);if(!n)return"";const m=Se(d.restaurantId)===n,p=m&&Array.isArray(d.rooms)?Xn(d.rooms):Xn(r?.hotelRooms),M=m&&d.imagePreviews&&typeof d.imagePreviews=="object"?d.imagePreviews:{},D=m&&d.saving===!0,W=m?Se(d.status):"";return`
    <div data-hotel-rooms-editor="${ee(n)}" class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
          <h3 class="text-xl font-black italic tracking-tighter">Dhomat</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dhomat shfaqen te detajet e hotelit</p>
        </div>
        <button type="button" id="hotelRoomAddBtn" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95 text-lg font-black" aria-label="Shto dhomë">+</button>
      </div>
      ${p.length?`<div class="space-y-4">${p.map(L=>ci(L,{imagePreview:Se(M[L.id])})).join("")}</div>`:'<p class="text-sm font-bold text-slate-400">Ende pa dhoma. Shto dhomën e parë me +.</p>'}
      ${W?`<p class="text-[10px] font-black uppercase tracking-widest ${W.includes("ruajt")?"text-emerald-600":"text-slate-500"}">${ee(W)}</p>`:""}
      <button id="hotelRoomsSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${D?"disabled":""}>
        ${D?"Po ruhen...":"Ruaj Dhomat"}
      </button>
    </div>
  `}const ui=Object.freeze({apiKey:"AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",authDomain:"menyra-c0e68.firebaseapp.com",projectId:"menyra-c0e68",storageBucket:"menyra-c0e68.firebasestorage.app",messagingSenderId:"528471049588",appId:"1:528471049588:web:c507d87c0832562a855821",measurementId:"G-YLFKC8726B"});function pi(){try{const i=String(globalThis?.location?.hostname||"").trim().toLowerCase();if(!["localhost","127.0.0.1","::1"].includes(i))return null;const r=globalThis?.__MENYRA_FIREBASE_EMULATORS__,d=r&&typeof r=="object"?r:{},n=new URLSearchParams(globalThis?.location?.search||"").get("firebase-emulator")==="1";if(d.enabled!==!0&&!n)return null;const m=String(d.projectId||"mnyra-local").trim();return/^(mnyra-local|demo-|test-|local-)/.test(m)?Object.freeze({projectId:m,host:String(d.host||"127.0.0.1").trim()||"127.0.0.1",firestorePort:Math.max(1,Number(d.firestorePort||8080)||8080),authPort:Math.max(1,Number(d.authPort||9099)||9099),functionsPort:Math.max(1,Number(d.functionsPort||5001)||5001)}):null}catch{return null}}const ue=pi(),Gt=Object.freeze(ue?{apiKey:"mnyra-local-api-key",authDomain:`${ue.projectId}.firebaseapp.com`,projectId:ue.projectId,storageBucket:`${ue.projectId}.appspot.com`,messagingSenderId:"000000000000",appId:"1:000000000000:web:mnyra-local"}:ui),ia=new WeakSet,oa=new WeakSet;function fi({firestore:i=null,authInstance:r=null}={}){return ue?(i&&!ia.has(i)&&(Cr(i,ue.host,ue.firestorePort),ia.add(i)),r&&!oa.has(r)&&(Pr(r,`http://${ue.host}:${ue.authPort}`,{disableWarnings:!0}),oa.add(r)),!0):!1}function mi(){try{const i=Sr();if(i?.options?.projectId===Gt.projectId&&i?.options?.appId===Gt.appId)return i}catch{}return Ir(Gt)}const xt=mi();function gi(){try{return globalThis?.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__===!0}catch{return!1}}let wt;try{const i=gi();wt=mr(xt,{experimentalAutoDetectLongPolling:!0,localCache:i?gr():br({tabManager:hr()})});try{globalThis.__MENYRA_FIRESTORE_LOCAL_CACHE_KIND__=i?"memory-public-website":"persistent-multitab"}catch{}}catch{wt=vr(xt)}let Zt;try{Zt=xr(xt,{persistence:[wr,yr,$r]})}catch{Zt=kr(xt)}fi({firestore:wt,authInstance:Zt});const bi="destinationsPublic",pa="menyra_social_destination_public_cache_v1::",hi=360*60*1e3,ht=new Map,gt=new Map;function Re(i=""){return i==null?"":String(i).trim()}function fa(i="",r={}){const d=r&&typeof r=="object"?r:{},n=Array.isArray(d.places)?d.places:[];return n.length?{id:Re(i),name:Re(d.name),slug:Re(d.slug),description:Re(d.description),version:Math.max(0,Number(d.version)||0),places:n}:null}function vi(i=""){try{const r=localStorage.getItem(`${pa}${i}`);if(!r)return null;const d=JSON.parse(r);return!d||typeof d!="object"||Date.now()-Number(d.storedAt||0)>hi?null:fa(i,d.data)}catch{return null}}function xi(i="",r=null){try{localStorage.setItem(`${pa}${i}`,JSON.stringify({storedAt:Date.now(),data:r}))}catch{}}function ma(i=""){const r=Re(i);if(!r)return null;if(ht.has(r))return ht.get(r);const d=vi(r);return d&&ht.set(r,d),d}async function wi(i=""){const r=Re(i);if(!r)return null;const d=ma(r);if(d)return d;if(gt.has(r))return gt.get(r);const n=(async()=>{try{const m=await Ar(jr(wt,bi,r)),p=m.exists()?fa(r,m.data()||{}):null;return ht.set(r,p),p&&xi(r,m.data()||{}),p}catch{return null}finally{gt.delete(r)}})();return gt.set(r,n),n}const la="menyra_social_business_type_hint_v1";function Ie(i=""){return i==null?"":String(i).trim()}function ca(i={},{extraSlugs:r=[]}={}){const d=i&&typeof i=="object"?i:{},n=[],m=(p="")=>{p&&!n.includes(p)&&n.push(p)};return[d.restaurantId,d.canonicalRestaurantId,d.landingRestaurantId].map(p=>Ie(p)).filter(Boolean).forEach(p=>m(`r:${p}`)),[d.publicSlug,d.landingSlug,d.handle,d.slug,d.businessSlug].map(p=>Ie(p).replace(/^@+/,"").toLowerCase()).filter(Boolean).forEach(p=>m(`s:${p}`)),(Array.isArray(r)?r:[]).map(p=>Ie(p).replace(/^@+/,"").toLowerCase()).filter(Boolean).forEach(p=>m(`s:${p}`)),n}function yi(i={},r=[]){const d=i&&typeof i=="object"?i:{};for(const n of Array.isArray(r)?r:[]){const m=Ie(d[n]).toLowerCase();if(m)return m}return""}function $i(i={},r=[],d=""){const n=i&&typeof i=="object"?{...i}:{},m=Ie(d).toLowerCase();if(!m||!Array.isArray(r)||!r.length)return{store:n,changed:!1};let p=!1;return r.forEach(M=>{n[M]!==m&&(n[M]=m,p=!0)}),{store:n,changed:p}}function ki(i="",r=""){const d=Ie(i).toLowerCase();return d||Ie(r).toLowerCase()}function Li(i={}){const r=i.state,d=i.resolvePostCountsFn,n=i.escapeHtmlFn,m=i.getOptimizedImageUrlFn,p=i.iconFn,M=i.isLocalBusinessProfileFn,D=typeof i.isCeoUserFn=="function"?i.isCeoUserFn:(()=>!1),W=i.normalizeHandleFn,L=i.logoFitClassFn,A=i.formatCountFn,Q=i.renderProfileShopCartViewFn,xe=i.renderProfileShopFavoritesViewFn,Ce=typeof i.ensurePostsDataForProfileFn=="function"?i.ensurePostsDataForProfileFn:(()=>{}),Pe=i.ensureMenuDataForProfileFn,Ke=typeof i.ensureEditorMenuDataForProfileFn=="function"?i.ensureEditorMenuDataForProfileFn:(()=>{}),we=i.ensureFocusDataForProfileFn,yt=typeof i.ensureAdsDataForProfileFn=="function"?i.ensureAdsDataForProfileFn:(()=>{}),tn=i.ensureTableQrStateForProfileFn,ae=i.isShopCatalogProfileFn,ga=i.getBusinessCatalogLabelFn,Ae=i.normalizeMenuTypeFn,ba=i.primeMenuItemCountsFn,ha=typeof i.hydrateMenuCardViewerLikesFn=="function"?i.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),va=i.renderShopProductListFn,xa=i.getMenuLayoutThemeFn,wa=i.menuLayoutColors,oe=i.resolveMenuItemHeroFn,J=i.isPlaceholderUrlFn,q=i.placeholderImage,ya=i.getFirebaseStorageUrlFn,$a=i.isDirectImageUrlFn,nn=i.formatPriceFn,ka=typeof i.resolveCurrencyCodeForMenuItemFn=="function"?i.resolveCurrencyCodeForMenuItemFn:(()=>""),an=i.getMenuItemImagesFn,Z=i.getMenuItemObjectPositionFn,qe=i.getMenuItemSocialIdFn,sn=i.menuItemMetaKeyFn,rn=i.ensureMenuItemMetaFn,on=i.resolveMenuItemCountsFn,Ge=i.getFocusStateForRestaurantFn,Sa=typeof i.getAdsStateForRestaurantFn=="function"?i.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),We=i.getTableQrStateForRestaurantFn,je=i.getFocusItemObjectPositionFn,$t=i.getFocusCardClassFn,Ia=i.getFocusIndexFn,ye=i.isRestaurantCafeProfileFn,kt=typeof i.getBusinessProfileTypeFn=="function"?i.getBusinessProfileTypeFn:(()=>""),le=i.getRestaurantMetaByIdFn,Ca=i.buildUrlFn,Pa=i.normalizeSearchKeyFn,Aa=i.normalizeFollowHandleFn,pe={key:"",inFlightKey:""},ln=new Set,Ye=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},ja=({profile:e=null,routePayload:t=null,surface:a=null,decision:s=null}={})=>{if(!Ye())return;const l=a&&typeof a=="object"?a:{},o=l.menu&&typeof l.menu=="object"?l.menu:{},c=e&&typeof e=="object"?e:{},u=t&&typeof t=="object"?t:{},f=u?.businessSnapshot?.identity||u?.identity||{},b=String(l.authoritativeRestaurantId||l.restaurantId||o.restaurantId||"").trim(),g=String(c.publicSlug||c.landingSlug||c.handle||f.publicSlug||f.landingSlug||f.handle||"").trim(),h=`${b||"pending"}::${g||"no-slug"}`;if(ln.has(h))return;ln.add(h);const x=Array.isArray(o.items)?o.items:[],w=new Set(x.map($=>String($?.category||"").trim()).filter(Boolean)).size,C=String(o.rawTruthState||o.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:b,slug:g,itemsLength:x.length,categoriesLength:w,menuStatus:String(o.status||"loading"),truthState:C,isLoading:s?.isLoading===!0,isHydrating:o.hydrating===!0||C.toLowerCase()==="hydrating",confirmedEmpty:o.confirmedEmpty===!0,canRenderItems:o.canRenderItems===!0,shouldRenderNoProducts:s?.shouldRenderNoProducts===!0,source:String(o.source||"")})},Ta=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},St=(e="")=>n(String(e||"")),Te=(e="")=>n(String(e??"")),se=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:a=""}={})=>{if(!Ye())return"";const s=[e?`data-debug-renderer="${St(e)}"`:"",t?`data-debug-skeleton="${St(t)}"`:"",a?`data-debug-source="${St(a)}"`:""].filter(Boolean);return s.length?` ${s.join(" ")}`:""},La=(e={},t=[])=>{const a=dr(e,t);return` ${[`data-menu-state="${Te(a.menuState)}"`,`data-menu-item-count="${Te(a.menuItemCount)}"`,`data-focus-state="${Te(a.focusState)}"`,`data-focus-business-id="${Te(a.focusBusinessId)}"`,`data-focus-item-count="${Te(a.focusItemCount)}"`,`data-focus-source="${Te(a.focusSource)}"`,`data-focus-stale="${a.focusStale?"true":"false"}"`].join(" ")}`},cn=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:a=null,routePayload:s=null,surface:l=null,decision:o=null,items:c=null,rawItems:u=null,filteredItems:f=null,renderDecision:b="",source:g=""}={})=>{const h=l&&typeof l=="object"?l:{},x=h.menu&&typeof h.menu=="object"?h.menu:{},w=h.focus&&typeof h.focus=="object"?h.focus:{},C=a&&typeof a=="object"?a:r?.profileView?.profile&&typeof r.profileView.profile=="object"?r.profileView.profile:{},$=s&&typeof s=="object"?s:r?.profileView?.routePayload&&typeof r.profileView.routePayload=="object"?r.profileView.routePayload:{},P=$?.businessSnapshot&&typeof $.businessSnapshot=="object"?$.businessSnapshot:{},j=P?.identity&&typeof P.identity=="object"?P.identity:$?.identity&&typeof $.identity=="object"?$.identity:{},k=r?.__webDirectEntry&&typeof r.__webDirectEntry=="object"?r.__webDirectEntry:{},S=String(C.publicSlug||C.landingSlug||C.handle||j.publicSlug||j.landingSlug||j.handle||k.publicSlug||"").trim(),_=String(C.restaurantId||$.restaurantId||k.restaurantId||"").trim(),F=String(C.canonicalRestaurantId||$.canonicalRestaurantId||h.authoritativeRestaurantId||k.canonicalRestaurantId||P.restaurantId||"").trim();let E="";C.canonicalRestaurantId?E="profile.canonicalRestaurantId":$.canonicalRestaurantId?E="routePayload.canonicalRestaurantId":h.authoritativeRestaurantId?E="surface.authoritativeRestaurantId":k.canonicalRestaurantId?E="webDirectEntry.canonicalRestaurantId":P.restaurantId?E="routeSnapshot.restaurantId":C.restaurantId?E="profile.restaurantId":$.restaurantId?E="routePayload.restaurantId":k.restaurantId&&(E="webDirectEntry.restaurantId");const I=String(F||h.restaurantId||x.restaurantId||_||"").trim(),U=Array.isArray(u)?u:Array.isArray(x.items)?x.items:[],B=Array.isArray(c)?c:U,O=Array.isArray(f)?f:B,y=new Set(O.map($e=>String($e?.category||"").trim()).filter(Boolean)).size,R=String(x.status||(o?.isLoading?"loading":"")||"").trim(),N=String(x.rawTruthState||x.truthState||"").trim(),H=x.confirmedEmpty===!0||o?.confirmedEmpty===!0,K=o?.hasError===!0||R==="error"||!!String(x.error||"").trim(),te=!(O.length>0||o?.hasItems===!0)&&!H&&!K,ne=F||_||I||"";return{component:e,functionName:t,slug:S,businessId:I,requestedRestaurantId:_,canonicalRestaurantId:F,restaurantIdSource:E,menuReadPath:ne?`restaurants/${ne}/public/menu`:"",activeTab:String(r?.activeTab||"").trim(),profileTopTab:String(r?.profileTopTab||"").trim(),profileContentTab:String(r?.profileContentTab||"").trim(),itemsLength:B.length,rawItemsLength:U.length,filteredItemsLength:O.length,categoriesLength:y,focusItemsLength:Array.isArray(w.items)?w.items.length:0,loading:x.loading===!0||o?.isLoading===!0||R==="loading",pending:te,hydrating:x.hydrating===!0||N.toLowerCase()==="hydrating",status:R,truthState:N,confirmedEmpty:H,canRenderItems:x.canRenderItems===!0,renderDecision:b||(o?.shouldRenderNoProducts?"no-products":o?.isLoading?"loading":""),source:g||String(x.source||""),buildToken:Ta()}},Qe=(e={})=>{Ye()&&console.warn("[mnyra:no-products-render]",{...cn(e),stack:new Error().stack})},Je=(e="",t={})=>{Ye()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...cn({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},v=(e,t=e,a={})=>cr(e,{fallback:t,params:a}),_a=(e="")=>{const t=String(e||"").trim();if(!t)return v("nav.menu","Menue");const a=t.toLowerCase();return a==="menue"||a==="menu"||a==="menü"?v("nav.menu",t):a==="shop"?"Shop":t},dn=(e="")=>{const t=String(e||"").trim();if(!t)return"";const a=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(a)?v("menu.products","Produkte"):t},Fa=(e="food",t=!1)=>t?v("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?v("menu.drinks","Getraenke"):v("menu.food","Speisen"),un=(e={},t=!1)=>{const a=Ae(e?.type||"food");return t?v("menu.product","Produkt"):a==="drink"?v("menu.drinkItem","Getraenk"):v("menu.foodItem","Speise")},It=(e="",t="#111827")=>{const a=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(a)?a:t};function Ma(e=null,t=null){return He(r,{profile:e,routePayload:t,webDirectEntry:r?.__webDirectEntry}).restaurantId}function pn(e=null,t=""){if(!e||typeof e!="object")return e;const a=String(t||"").trim();if(!a)return e;const s=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===a&&s?e:{...e,restaurantId:a,...s?{canonicalRestaurantId:s}:{}}}function Ra(e=""){const t=String(e||"").trim();return t?He(r,{profile:r?.profileView?.profile||r?.userProfile,routePayload:r?.profileView?.routePayload,webDirectEntry:r?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function Ne(e={}){const t=String(ka(e)||"").trim();return t?nn(e?.price,t):nn(e?.price)}function Ea(e=[],t="",a=""){const s=String(t||"").trim(),l=String(a||"").trim();if(!s||!l)return"";const o=Array.isArray(e)?e:[];if(!o.length)return`${s}|${l}|empty`;const c=[];return o.forEach(u=>{const f=String(qe(u)||u?.id||"").trim();f&&c.push(f)}),c.length?(c.sort(),`${s}|${l}|${c.join(",")}`):`${s}|${l}|empty`}function za(e=[],t=""){const a=String(r.user?.uid||"").trim(),s=Ea(e,t,a);s&&pe.inFlightKey!==s&&pe.key!==s&&(pe.key=s,pe.inFlightKey=s,ha(e,t).catch(l=>{console.error(l),pe.key===s&&(pe.key="")}).finally(()=>{pe.inFlightKey===s&&(pe.inFlightKey="")}))}function Na(e={}){const t=String(e?.uid||"").trim();if(t&&r.followingTargetIds.includes(t))return!0;const a=String(e?.restaurantId||"").trim();if(a&&r.followingTargetIds.includes(a))return!0;const s=Aa(e?.handle||"");return!!(s&&r.followingHandles.includes(s))}function fn(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const a=typeof le=="function"&&le(t)||null;return a?.specialEnabled===!0?!0:(a?.specialEnabled===!1,!1)}function Da(e={}){return be(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function mn(e,t,a=!0,{includeImageKey:s=!0}={}){const l=d(e),o=e.id?String(e.id):"",c=o?`data-open-post="${n(o)}"`:"",u=o?`data-post-like-count="${n(o)}"`:"",f=o?`data-post-comment-count="${n(o)}"`:"",b=s&&o?`data-img-key="profile-post:${n(o)}"`:"",g=e.type==="wide"||e.type==="hero",h=t&&g?"col-span-2":"",x=t&&g?"aspect-[1.8/1]":"aspect-[4/5]",w=g?800:400,C=g?400:500,$=String(e.posterUrl||e.thumbUrl||e.poster||"").trim(),P=e.isVideo===!0,j=P&&$?$:e.url,k=m(j,g?"large":"medium",{stableKey:o?`profile-post:${o}`:"",variantGroup:"post-detail"}),S=String(e.url||"").trim(),_=S&&!S.includes("#")?`${S}#t=0.001`:S,F=P&&!$&&S?`<video src="${n(_)}" preload="metadata" muted playsinline webkit-playsinline width="${w}" height="${C}" ${b} class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${n(k)}" loading="lazy" decoding="async" width="${w}" height="${C}" ${b} class="w-full h-full object-cover" />`;return`
    <div ${c} role="button" tabindex="0" class="${h} relative ${x} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        ${F}
        ${e.isVideo?`<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${p("play","w-3.5 h-3.5 fill-white block")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${p("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${u} class="text-[10px] font-bold tracking-wide">${n(l.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${p("message-circle","w-3 h-3 text-indigo-200")}
                <span ${f} class="text-[10px] font-bold tracking-wide">${n(l.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${o&&a?`
        <button type="button" data-profile-menu-button="${n(o)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${p("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${n(o)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${n(o)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${p(g?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${g?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${n(o)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${p("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Ct(e,t,a=!0,{includeImageKeys:s=!0}={}){const l=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${p("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(v("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const o=e.map(u=>mn(u,l,a,{includeImageKey:s})),c=e.reduce((u,f)=>{const b=f?.type==="wide"||f?.type==="hero";return u+(b?2:1)},0);return l&&c%2===1&&o.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),o.join("")}function Pt(){const e=r.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const a=m(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${n(a)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${n(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${p("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${n(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${p("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${p("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(v("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function Xe(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}let fe=null;function gn(){if(fe)return fe;if(typeof localStorage>"u")return fe={},fe;try{const e=localStorage.getItem(la),t=e?JSON.parse(e):{};fe=t&&typeof t=="object"?t:{}}catch{fe={}}return fe}function Ua(e={},t=""){const a=ca(e);if(!a.length)return;const{store:s,changed:l}=$i(gn(),a,t);if(l&&(fe=s,!(typeof localStorage>"u")))try{localStorage.setItem(la,JSON.stringify(s))}catch{}}const Ba=new Set(["feed","search","discover","map","location","user","waiter","wr","leads","admin","ceo","owner","staff","kitchen","profile","menu","orders","notifications","settings","upload","customers","business-accounts","businessaccounts","chat","social","heart","hub","apps","api","shared","assets","_shared","core","login","register","post","posts","story","stories","manifest","sw","favicon","robots","sitemap","b","lp"]);function Oa(){try{const t=String(globalThis?.location?.pathname||"").replace(/^\/+|\/+$/g,"").split("/").filter(Boolean),a=String(t[0]||"").trim().toLowerCase();return!a||a.includes(".")||Ba.has(a)?"":a}catch{return""}}function Ha(e={}){const t=String(kt(e)||"").trim().toLowerCase();return t?(Ua(e,t),t):ki("",yi(gn(),ca(e,{extraSlugs:[Oa()]})))}function Ze(e={}){const t=Ha(e);return t==="hotel"||t==="motel"}function De(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),a=t?le(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{}}}function Va(e={},t=""){const a=e&&typeof e=="object"?e:{},s=String(a.id||a._id||a.offerId||a.menuItemId||t||"offer").trim();return{...a,id:s,menuItemId:String(a.menuItemId||a.targetMenuItemId||a.itemId||a.targetItemId||"").trim(),title:a.title||a.name||"Oferta",text:a.text||a.desc||a.description||"",imageUrl:a.imageUrl||a.image||a.photoUrl||"",active:a.active!==!1}}function bn(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.map((s,l)=>Va(s,`offer_${l}`)).filter(s=>{const l=String(s.id||`${s.title}|${s.text}|${s.imageUrl}`).trim();return!l||a.has(l)?!1:(a.add(l),!0)})}function Ka(e={}){const t=De(e),a=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!a)return!1;const s=r.focus&&typeof r.focus=="object"?r.focus:{},l=String(s.restaurantId||"").trim()===a,o=String(s.truthSource||"").trim().toLowerCase();if(l&&o==="public-menu"||(l&&Array.isArray(s.items)?s.items:[]).length)return!1;const u=bn(t);return u.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(r.focus={...s,restaurantId:a,items:u,enabled:s.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:u.length?"seeded":"knownEmpty"},!0):!1}function qa(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const a of t){if(!a||typeof a!="object")continue;const s=Number(a.lat??a.latitude),l=Number(a.lng??a.lon??a.longitude);if(Number.isFinite(s)&&Number.isFinite(l))return{lat:s,lng:l}}return null}function X(e={},t=[]){for(const a of t){const s=String(e?.[a]||"").trim();if(s)return s}return""}function et(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function Ga(e={}){const t=[...et(e.coverImages),...et(e.hotelCoverImages),...et(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(s=>String(s||"").trim()).filter(Boolean),a=[];return t.forEach(s=>{a.includes(s)||a.push(s)}),a.slice(0,8)}function Wa(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Ya(e=""){const t=String(e||"").trim(),a=r.hotelCardEditor&&typeof r.hotelCardEditor=="object"?r.hotelCardEditor:{},s=String(a.restaurantId||"").trim();return s?s===t?a:{}:Wa(a)?{}:a}function Qa(e={}){const t=Array.isArray(e.features)?e.features.map(s=>String(s||"").trim()).filter(Boolean):[],a=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[X(e,["hotelFeatureOneText","gardenTerraceText"])||String(a.gardenTerrace||"").trim()||t[0]||"",X(e,["hotelFeatureTwoText","accessibilityText"])||String(a.accessibility||"").trim()||t[1]||"",X(e,["hotelFeatureThreeText","veganOptionsText"])||String(a.veganOptions||"").trim()||t[2]||""]}function hn(e={}){const t=[],a=(s="")=>{const l=String(s||"").trim();l&&!t.includes(l)&&t.push(l)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(s=>{Array.isArray(s)&&s.forEach(l=>{typeof l=="string"?a(l):l&&typeof l=="object"&&a(l.label||l.name||l.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&a("Në plazh"),(e.restaurant||e.hasRestaurant)&&a("Restaurant"),(e.breakfast||e.breakfastIncluded)&&a("Mëngjes"),(e.pool||e.hasPool)&&a("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&a("WLAN"),(e.parking||e.freeParking||e.hasParking)&&a("Parking"),(e.spa||e.wellness)&&a("Wellness"),t.slice(0,8)}const Ja=[{value:"m",label:"m"},{value:"km",label:"km"}],Xa="Në qendër",Za="Në plazh",es=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],ts=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],ns=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function me(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function as(e="",{direct:t=!1}={}){const a=String(e||"").trim(),s=me(a),l=t||s==="ne_qender"||s==="ne_plazh"||s==="direkt_ne_qender"||s==="direkt_ne_plazh"||s.includes("direkt")&&(s.includes("strand")||s.includes("zentrum")||s.includes("center"))||s.includes("am_strand")||s.includes("im_zentrum"),o=a.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),c=o?o[1].replace(",","."):"",f=(o?String(o[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:c,unit:f,isDirect:l}}function vn({idPrefix:e="",iconName:t="navigation",label:a="",value:s="",directLabel:l="",direct:o=!1}={}){const c=as(s,{direct:o});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${p(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(a)}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(l)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${n(e)}Value" type="number" min="0" step="0.1" value="${n(c.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${n(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${Ja.map(u=>`<option value="${n(u.value)}" ${c.unit===u.value?"selected":""}>${n(u.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${n(l)}</span>
        <input id="${n(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${c.isDirect?"checked":""} />
      </label>
    </div>
  `}function ss(e=[],t=""){const a=String(t||"").trim(),s=new Set(e.map(me));return`
    <option value="">Zgjidh</option>
    ${e.map(l=>`<option value="${n(l)}" ${me(l)===me(a)?"selected":""}>${n(l)}</option>`).join("")}
    ${a&&!s.has(me(a))?`<option value="${n(a)}" selected>Aktuale: ${n(a)}</option>`:""}
  `}function At({id:e="",iconName:t="badge-check",label:a="",value:s="",options:l=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${p(t,"w-4 h-4")}
        </div>
        <label for="${n(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(a)}</label>
      </div>
      <select id="${n(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${ss(l,s)}
      </select>
    </div>
  `}function rs(e={},t=[]){const a=new Set(t.map(me).filter(Boolean)),s=[],l=(o="")=>{const c=String(o||"").trim();if(!c)return;const u=me(c);a.has(u)||s.some(f=>me(f)===u)||s.push(c)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(o=>et(o).forEach(l)),s}function is({existingImages:e=[],newPreviews:t=[],imageUrlDraft:a=""}={}){const s=[...t.map((c,u)=>({src:c,kind:"new",idx:u})),...e.map((c,u)=>({src:c,kind:"existing",idx:u}))].filter(c=>c.src),l=s[0]?.src||a||"",o=l?m(l,"large"):q;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${n(o||q)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${p("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${p("plus","w-2.5 h-2.5")}
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
                ${c.kind==="existing"?`<span data-hotel-card-existing-image="${n(c.src)}" hidden></span>`:""}
                <img src="${n(m(c.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${c.idx}" data-hotel-card-image-source="${c.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${p("x","w-3 h-3")}
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

      <input id="hotelCardCoverImageUrl" type="hidden" value="${n(a)}" />
    </div>
  `}function os({destinationId:e="",overrides:t={},hotelCoords:a=null,manualBeachDistance:s=null}={}){const l=String(e||"").trim();if(!l||typeof document>"u")return;const o=f=>ra({template:f,overrides:t,hotelCoords:a,imageUrlFn:b=>m(b,"medium"),manualBeachDistance:s});let c=0;const u=()=>{const f=document.getElementById(Yt);if(!f){c++<20&&requestAnimationFrame(u);return}String(f.dataset.destinationId||"")===l&&f.dataset.destinationFilled!==l&&wi(l).then(b=>{const g=document.getElementById(Yt);!g||String(g.dataset.destinationId||"")!==l||(g.dataset.destinationFilled=l,g.innerHTML=b?o(b):"",b&&xn(Wt({places:b.places,overrides:t,hotelCoords:a})))}).catch(()=>{})};typeof requestAnimationFrame=="function"?requestAnimationFrame(u):queueMicrotask(u)}function xn(e=[]){if(typeof document>"u")return;const t=document.getElementById(Xt);t&&(typeof t.__mhdSetPlaces=="function"?t.__mhdSetPlaces(e):t.__mhdPlaces=Array.isArray(e)?e:[])}function ls(e=[]){if(typeof document>"u")return;let t=0;const a=()=>{const s=document.getElementById(Xt);if(!s){t++<20&&requestAnimationFrame(a);return}if(Array.isArray(e)&&e.length&&xn(e),s.dataset.mhdMapObserved==="1")return;s.dataset.mhdMapObserved="1";const l=()=>{ir(()=>import("./hotel-detail-map-runtime-DB741SQ-.js"),[]).then(o=>o.ensureHotelDetailMap({container:s})).catch(()=>{})};if(typeof IntersectionObserver=="function"){const o=new IntersectionObserver(c=>{c.some(u=>u.isIntersecting)&&(o.disconnect(),l())},{rootMargin:"240px"});o.observe(s)}else l()};typeof requestAnimationFrame=="function"?requestAnimationFrame(a):queueMicrotask(a)}function wn(e={}){return bn(e).filter(t=>t.active!==!1&&String(t.title||"").trim())}function cs(e={}){const t=e.beachfront===!0||e.onBeach===!0||e.amStrand===!0,a=X(e,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung"]);return!t&&!a?null:{label:a,direct:t}}function yn(e={}){return!!(Zn(e).length||wn(e).length||hn(e).length||String(e.destinationId||"").trim()||X(e,["rating","reviewRating","stars","hotelStars"]))}const $n="mnyraHotelDetailsPendingRoot";let tt="";function ds(e={},t=""){if(typeof document>"u"||typeof setTimeout!="function")return;const a=String(t||"").trim();if(!a||tt===a)return;tt=a;let s=0;const l=()=>{const o=document.getElementById($n);if(!o||String(o.dataset.hotelDetailsPending||"")!==a){tt="";return}if(!(!!(typeof le=="function"?le(a):null)||yn(De(e)))&&s++<24){setTimeout(l,250);return}tt="",o.removeAttribute("data-hotel-details-pending"),o.classList.add("animate-in","fade-in","duration-300"),o.innerHTML=Sn(e)};setTimeout(l,250)}function kn(e={}){const t=De(e),a=String(e?.canonicalRestaurantId||e?.restaurantId||t.canonicalRestaurantId||t.restaurantId||"").trim(),s=a&&typeof le=="function"?le(a):null;return a&&!s&&!yn(t)?(sa(),ds(e,a),`
      <div id="${$n}" data-hotel-details-pending="${n(a)}" class="app-content-inline app-main-content-safe">
        ${Zr()}
      </div>
    `):`
    <div class="app-content-inline app-main-content-safe animate-in fade-in duration-300">
      ${Sn(e)}
    </div>
  `}function Sn(e={}){const t=De(e),a=qa(t),s=X(t,["address","primaryAddress","location","formattedAddress","street"]),l=X(t,["city","locationCity","primaryCity","region","country"]),o=X(t,["rating","reviewRating","stars","hotelStars"]),c=X(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),u=X(t,["reviewSummary","ratingSummary","commentsSummary"]),f=hn(t),b=wn(t),g=Zn(t).map(S=>({...S,priceLabel:fr(S),metaParts:pr(S)})),h=String(t.destinationId||"").trim(),x=String(t.destinationName||"").trim(),w=ua(t.destinationOverrides||{}),C=X(t,["name","restaurantName","businessName"])||"Hotel",$=a?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.lat},${a.lng}`)}`:s||l?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s} ${l}`.trim())}`:"";sa();const P=cs(t),j=h?ma(h):null,k=j?ra({template:j,overrides:w,hotelCoords:a,imageUrlFn:S=>m(S,"medium"),manualBeachDistance:P}):"";return h&&!j&&os({destinationId:h,overrides:w,hotelCoords:a,manualBeachDistance:P}),a&&ls(j?Wt({places:j.places,overrides:w,hotelCoords:a}):[]),li({rooms:g,offers:b,amenities:f,address:s,city:l,cityImageUrl:X(t,["titleImageUrl","coverImageUrl","heroUrl"]),destinationId:h,destinationName:x,destinationSectionsHtml:k,mapsUrl:$,hotelCoords:a,hotelName:C,rating:o,reviewCount:c,ratingSummary:u,imageUrlFn:S=>m(S,"medium")})}function us(e={}){const t=De(e),a=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),s=t?.name||t?.restaurantName||e?.name||"Hotel",l=Ya(a),o=String(l.status||"").trim(),c=l.saving===!0,u=Array.isArray(l.existingImages)?l.existingImages.map(U=>String(U||"").trim()).filter(Boolean):Ga(t),f=Array.isArray(l.imagePreviews)?l.imagePreviews.map(U=>String(U||"").trim()).filter(Boolean):[],b=String(l.imageUrlDraft||"").trim(),[g,h,x]=Qa(t),w=rs(t,[g,h,x]),C=X(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),$=X(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),P=X(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),j=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,k=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,S=l.detailsOpen===!0||c,_=f[0]||u[0]||"",F=_?m(_,"thumb"):q,E=[C,$,P?`${P} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",I=o.includes("fehl")||o.includes("Bitte")||o.includes("Nuk");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(s)}</p>
        </div>
      </div>

      ${a?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
              <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hotel & Ofertat</p>
            </div>
            <button type="button" data-hotel-card-details-open aria-expanded="${S?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${p("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${S?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${n(F||q)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${n(s)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(E)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${S?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${p("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${o&&!S?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${I?"text-rose-500":"text-slate-500"}">${n(o)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${n(a)}" data-hotel-card-details-panel class="${S?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${p("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${is({existingImages:u,newPreviews:f,imageUrlDraft:b})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${vn({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:C,directLabel:Xa,direct:j})}
              ${vn({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:$,directLabel:Za,direct:k})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${n(P)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${At({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:g,options:es})}
              ${At({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:h,options:ts})}
              ${At({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:x,options:ns})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${n(w.join(`
`))}</textarea>
              </div>
            </div>

            ${o?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${I?"text-rose-500":"text-slate-500"}">${n(o)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
              ${c?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${di({restaurantId:a,record:t,editorState:r.hotelRoomsEditor&&typeof r.hotelRoomsEditor=="object"?r.hotelRoomsEditor:{}})}
        ${Dt(a,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function nt(e={}){const t=String(r.profileTopTab||"").trim().toLowerCase(),a=String(r.profileContentTab||"").trim().toLowerCase();return Xe(e)?t==="menu"?"menu":a==="menu"||a==="posts"?a:"posts":a==="media"||a==="checkins"?a:"posts"}function jt(e={}){const t=String(r.profileTopTab||"").trim().toLowerCase();return Xe(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(r.user?.uid||"").trim()?"favorites":"profile"}function In(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function ps(e=0,t=1){const a=Math.max(1,Number(t||0)||1),s=Math.round(Number(e||0));if(!Number.isFinite(s))return 0;const l=s%a;return l<0?l+a:l}function fs(e=0){return In(e)}function ms(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],a=In(r.profileLandingStep),s=ps(r.profileLandingGreetingIndex,t.length),l=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},o=String(l.businessName||e.name||"casarita").trim()||"casarita",c=It(l.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),u=c&&c.toLowerCase()!=="#111827"?c:"",f=It(l.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||c||"","#111827"),b=It(l.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||u||"","#4f46e5"),g=o.replace(/\.+$/g,"").trim()||o,h=g.split(/\s+/).filter(Boolean),x=h.length>1?h.slice(0,-1).join(" "):g,w=h.length>1?h[h.length-1]:"",C=w?x:`${x}.`,$=w?`${w}.`:"",P=m(l.logoUrl||e.avatar||"","avatar"),k=String(P||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",S=String(l.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),_=String(l.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),F=a>=2,E=a>=3,I=Array.isArray(r.profileView?.posts)?r.profileView.posts:Array.isArray(e?.posts)?e.posts:[],U=fs(a),B=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${p("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(O=>{const y=U===O;return`
            <div data-landing-step-dot="${O}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${y?"1.22":"1"}); opacity: ${y?"1":"0.88"}; background: ${y?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${y?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${y?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${a===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${a===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((O,y)=>{const R=y===s,N=y===(s-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${y}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${R?"opacity: 1; transform: translateY(0) scale(1);":N?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!R&&!N?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${n(O)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${n(k)}" alt="${n(`${o} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${n(f)};">${n(C)}</span>${$?`<span style="color:${n(b)};">${n($)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${n(S)}<br />
            ${n(_)}
          </p>
        </div>
        ${B}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${a<1?"translate-y-full":a===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===1?"1":"0"}; pointer-events: ${a===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${rt(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${B}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${a<2?"translate-y-full":a===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===2?"1":"0"}; pointer-events: ${a===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${F?rt(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${B}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${a<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${a===3?"1":"0"}; pointer-events: ${a===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${E?rt(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function Tt(e=r.profileView?.profile||r.userProfile,{landingPreview:t=!1,selectedTabOverride:a="",compact:s=!1}={}){const l=Xe(e),o=String(a||nt(e)).trim().toLowerCase()||"posts",c=Ze(e),u=ae(e),f=c?"Details":u?"Shop":v("nav.menu","Menue"),b=l?[{id:"posts",label:v("profile.posts","Beitraege")},{id:"menu",label:f,surface:c?"hotel-details":"menu"}]:[{id:"posts",label:v("profile.posts","Beitraege")},{id:"media",label:v("profile.media","Medien")},{id:"checkins",label:v("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${s?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${b.map(g=>`
          <button data-profile-tab="${g.id}" ${g.surface?`data-profile-tab-surface="${n(g.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${o===g.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${g.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Lt(e=r.profileView?.profile||r.userProfile,{disabled:t=!1}={}){const a=nt(e);return a==="checkins"||a==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${n(v("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${r.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${p("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${r.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${p("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function G(e=""){return String(e||"").trim()}const Cn="mnyra_business_title_image_cache_v1",Pn=80;function An(){if(!r)return{};const e=r.businessTitleImageCache&&typeof r.businessTitleImageCache=="object"?r.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const s=(typeof window<"u"?window.localStorage:null)?.getItem?.(Cn)||"",l=s?JSON.parse(s):{};l&&typeof l=="object"&&Object.entries(l).forEach(([o,c])=>{const u=G(o),f=G(c);u&&f&&!J(f)&&(t[u]=f)})}catch{}return r.businessTitleImageCache={loaded:!0,items:t},t}function gs(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(Cn,JSON.stringify(e))}catch{}}function bs(e={},t="business"){const a=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(s=>G(s)).filter(Boolean);return[...new Set(a)]}function hs(e=[],t=""){const a=G(t);if(!a||J(a))return;const s=An();let l=!1;e.forEach(c=>{const u=G(c);!u||s[u]===a||(s[u]=a,l=!0)});const o=Object.entries(s);if(o.length>Pn){const c=o.slice(o.length-Pn);Object.keys(s).forEach(u=>delete s[u]),c.forEach(([u,f])=>{s[u]=f}),l=!0}l&&gs(s)}function vs(e=[]){const t=An();for(const a of e){const s=G(a),l=s?G(t[s]):"";if(l&&!J(l))return l}return""}function xs(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function ws(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function ys(e={}){const a=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(s=>String(s||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||a||"").trim()}function $s(e={},t={}){const a=ys(e),s=Array.isArray(t.cacheKeys)?t.cacheKeys:[],l=G(t.stableKey||s[0]||"");if(!a){if(t.allowCacheFallback===!0){const c=vs(s);if(c)return c;const u=l?m("","medium",{stableKey:l}):"";return u&&!J(u)?u:""}return""}const o=m(a,"medium",l?{stableKey:l}:void 0);return o&&!J(o)?(hs(s,o),o):""}function jn(e="",t=""){const a=G(e);if(!a)return"";if(/^https?:\/\//i.test(a))return a;const s=a.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return s?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(s)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(s)}`:"":""}function ks(e=""){const t=G(e);if(!t)return"";const a=t.replace(/[^\d+]/g,"");return a?`tel:${a}`:""}function Ss(e={}){const t=Number(e?.gpsLat??e?.lat),a=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(a))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${a}`)}`;const s=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(l=>G(l)).filter(Boolean).join(", ");return s?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`:""}function at({href:e="",label:t="",iconName:a="",body:s="",buttonAttrs:l=""}={}){const o=G(e),c=String(l||"").trim();if(!o&&!c)return"";const u=s||p(a,"w-4 h-4"),f="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return c?`
    <button type="button" ${c} title="${n(t)}" aria-label="${n(t)}" class="${f}">
      ${u}
    </button>
  `:`
    <a href="${n(o)}" target="_blank" rel="noreferrer" title="${n(t)}" class="${f}">
      ${u}
    </a>
  `}function st({href:e="",buttonAttrs:t="",iconName:a="",eyebrow:s="",value:l=""}={}){const o=G(l);if(!o)return"";const c=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${p(a,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${n(s)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n(o)}</span>
    </div>
  `;return e?`<a href="${n(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</button>`}function Is({profileName:e="",safeBio:t="",metaLine:a="",identityPending:s=!1,followersLabel:l=""}={}){return`
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(String(l))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(a)}</p>
          ${s?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function Tn(e={},t={}){const a=t.mode==="self"?"self":"public",s=t.disabledBlockClass||"",l=xs(e,a),o=a==="self"?"avatar:self":`avatar:public:${l}`,c=t.avatarUrl||m(e.avatar||"","avatar",{stableKey:o}),u=t.avatarFit||L(!!e.restaurantId),f=String(r?.profileCardInfoOpen||"")===l,b=Number(r?.profileCardInfoHeights?.[l]||0),g=f&&Number.isFinite(b)&&b>0?`height:${Math.ceil(b)}px;`:"",h=t.avatarImgKeyAttr||(a==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${n(l)}"`),x=t.renderAvatarImage===!0?!!String(c||"").trim()&&!J(c):t.renderAvatarImage!==!1&&!!String(c||"").trim()&&!J(c)&&!!String(e?.avatar||"").trim(),w=!!t.identityPending,C=t.followersLabel??A(e.followers),$=G(e?.name)||"User",P=G(t.typeLabel||e?.customerType||e?.type||"Business"),j=G(e?.location||"-"),k=a==="public"?`${j} / ${P}`:j,S=t.bioHtml||n(e?.bio||"").replace(/\n/g,"<br>")||n(v("profile.noBio","Noch keine Bio.")),_=`business-cover:${l}`,F=bs(e,l),E=$s(e,{cacheKeys:F,stableKey:_,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),I=Ss(e),U=ws(e),B=at(U?{buttonAttrs:`data-marketplace-open-map="${n(U)}"`,label:v("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:I,label:v("profile.openMap","Karte oeffnen"),iconName:"map"}),O=jn(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),y=jn(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),R=G(e?.phone||e?.telephone||e?.contactPhone||""),N=ks(R),H=G(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(te=>G(te)).filter(Boolean).join(", ")),K=[st({href:O,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),st({href:y,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),Y=a==="self"?`
      <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${p("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${p("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle||"")}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?p("check","w-4 h-4"):""}
          ${n(t.followLabel||v("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${p("message-circle","w-5 h-5")}
      </button>
    `;if(f){const te=[st({href:N,iconName:"phone",eyebrow:v("profile.call","Anrufen"),value:R}),st({href:I,iconName:"map-pin",eyebrow:v("profile.address","Adresse"),value:H||j}),K].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${n(l)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="${g}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${Is({profileName:$,safeBio:S,metaLine:k,identityPending:w,followersLabel:C})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${n(l)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${p("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(v("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(j)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${te||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(v("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${n(l)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${n(v("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${n(l)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${s}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${E?`<img src="${n(E)}" data-img-key="${n(_)}" alt="${n($)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${p("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${B}
          ${at({href:y,label:"TikTok",iconName:"music-2"})}
          ${at({href:O,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${a==="self"?'id="profileAvatarTrigger"':""} class="relative ${a==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${x?`<img src="${n(c)}" data-fallback-src="${n(q)}" decoding="async" width="100" height="100" ${h} class="w-full h-full rounded-[1.8rem] ${u} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${w?"animate-pulse":""}">${p("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${p("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${w?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(String(C))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${n(l)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${p("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n($)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(k)}</p>
          ${w?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${Y}
        </div>
      </div>
    </div>
  `}function rt(e={},t=[],{topTabOverride:a="",tutorialMode:s=!1,contentTabOverride:l="",landingHideContent:o=!1,collapseIdentity:c=!1,contentReveal:u=!1,landingMode:f=!1}={}){const b=Na(e),g=!!e.privateAccount&&e.uid&&String(e.uid)!==String(r.user?.uid||"")&&!b,h=!!e.pendingFollowRequest&&!b,x=e.restaurantId?"Business":v("nav.user","User"),w=String(e.handle||W(e.name||"user")).replace(/^@/,""),$=n(e.bio||"").replace(/\n/g,"<br>")||n(v("profile.noBio","Noch keine Bio.")),P=Xe(e),j=String(a||jt(e)).trim().toLowerCase()||"profile",k=String(l||nt(e)).trim().toLowerCase()||"posts",S=k==="menu",_=k==="checkins",F=t,I={...r?.profileView&&typeof r.profileView=="object"?r.profileView:{},profile:e,posts:Array.isArray(F)?F:[]},U=ur(r,{profileView:I,profileTopTab:j,profileContentTab:k}),B=String(U?.header?.status||"").trim().toLowerCase()||"loading",O=String(U?.posts?.status||"").trim().toLowerCase()||"loading",y=e.uid||e.restaurantId||w||"public",R=`avatar:public:${y}`,N=String(e?.avatar||"").trim(),H=m(N,"avatar",{stableKey:R}),K=L(!!e.restaurantId),Y=f?"":`data-img-key="avatar:public:${n(y)}"`,te=!N&&!!String(H||"").trim()&&!J(H),ne=!!N||te&&Ve(B),$e=Vt=>{if(Vt==null)return!1;const Jn=Number(Vt);return Number.isFinite(Jn)&&Jn>=0},Ht=ne||$e(e?.followers)||$e(e?.following),ce=Ve(B)&&!Ht,ke=!!String(H||"").trim()&&!J(H)&&ne,ct=ce?"...":A(e.followers),dt=ce?"...":A(e.following),ut=P?"pt-2":"pt-10",pt=b?v("profile.following","Following"):h?v("profile.requested","Requested"):g?v("profile.request","Request"):v("profile.follow","Follow"),Be=b?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":h?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",Oe=s?"select-none":"app-main-content-safe",de=s?"pointer-events-none":"",re=!c,Yn=!o,ft=u?f?"transition-opacity duration-200":"animate-in fade-in duration-300":"",Qn=k==="posts"&&F.length>0,sr=k!=="posts"||Qn||O==="empty"||O==="error",rr=k==="posts"&&!Qn&&O==="error";return!s&&(k==="posts"||k==="media")&&e?.restaurantId&&Ve(O)&&Ce(e),`
    <div class="${Oe}" ${s?'data-landing-tutorial-surface="true"':""}>
      ${j==="profile"||j==="menu"?`
      ${re?`
        <div class="app-content-inline pb-2 ${ut}">
          ${P?Tn(e,{mode:"public",disabledBlockClass:de,avatarUrl:H,avatarFit:K,avatarImgKeyAttr:Y,renderAvatarImage:ke,identityPending:ce,followersLabel:ct,followLabel:pt,followTone:Be,isFollowing:b,hasPendingFollowRequest:h,isLocked:g,bioHtml:$,typeLabel:x,allowTitleImageCacheFallback:Ve(B)||Ve(O)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${de}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${ke?`<img src="${n(H)}" data-fallback-src="${n(q)}" decoding="async" width="100" height="100" ${Y} class="w-full h-full rounded-[1.8rem] ${K} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${ce?"animate-pulse":""}">${p(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${p("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ce?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(ct)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ce?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(dt)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
                ${P?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(w)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${$}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")} / ${x}</p>
                ${ce?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle)}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${h?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${Be} ${h?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${b?p("check","w-4 h-4"):""}
                    ${pt}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${g?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${g?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${p("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
          `}
        </div>
      `:""}

      ${g?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${p("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${n(v("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${n(v("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${Tt(e,{landingPreview:s,selectedTabOverride:k,compact:c})}
        ${Yn?Lt(e,{disabled:s}):""}

        ${Yn?S?`
          <div class="${de} ${ft}">
            ${Ze(e)?kn(e):lt(e,{mode:f?"landing":"profile",allowAutoEnsure:!f})}
          </div>
        `:_?`
          <div class="${de} ${ft}">
            ${Pt()}
          </div>
        `:`
          ${sr?`
            ${rr?`
              <div class="app-content-inline ${de}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${n(v("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${r.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${de} ${ft}">
                ${Ct(F,r.profileViewMode,!1,{includeImageKeys:!f})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${de}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${ft}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(v("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${j==="cart"?Q(e):j==="favorites"?xe(e):""}
      `}
    </div>
  `}function Cs(){const e=r.profileView;if(!e||!e.profile)return"";const t=e.profile,a=e.posts||t.posts||[],s=jt(t);return s==="landing"?ms(t):rt(t,a,{topTabOverride:s,tutorialMode:!1})}function Ln(e,{filter:t="all",query:a=""}={}){const s=Array.isArray(e)?e:[],l=Pa(a||"");return s.filter(o=>t==="all"||Ae(o.type)===t?l?`${o.name||""} ${o.category||""} ${o.description||""}`.toLowerCase().includes(l):!0:!1)}function _n(e,t=0){const a=Number(e);return Number.isFinite(a)?Math.max(0,Math.floor(a)):Math.max(0,Number(t)||0)}function it(e=[]){return(Array.isArray(e)?e.slice():[]).map((a,s)=>({item:a,idx:s,order:_n(a?.orderIndex,s)})).sort((a,s)=>a.order-s.order||a.idx-s.idx).map((a,s)=>({...a.item,orderIndex:_n(a.item?.orderIndex,s)}))}function _t(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function Ue(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":Ae(e?.type||"food")==="drink"?"drink":"food"}function Ps(e={}){return String(e?.category||v("menu.other","Sonstiges")).trim()||v("menu.other","Sonstiges")}function As(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const js=4,Ts={thumb:160,small:480,medium:768,large:1280};function Fn({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<js&&a===0}function Ls({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){const s=Fn({mode:e,priorityIndex:t,slideIndex:a}),l=e==="profile"?' data-image-reveal="menu"':"";return s?`loading="eager" fetchpriority="high"${l}`:`loading="lazy" fetchpriority="low"${l}`}function _s({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function ge(e,{mode:t="profile",priorityIndex:a=-1,slideIndex:s=0,stableKey:l="",preferredSize:o="small",candidateSizes:c=["small","medium","large"],variant:u="grid"}={}){const f=String(e||"").trim(),b=t==="profile"&&l?{stableKey:l}:null,g=Fn({mode:t,priorityIndex:a,slideIndex:s}),h=t==="profile"&&!g&&u!=="thumb",x=m(f,o,b),w=J(x)?q:x,C=ya(f),$=$a(f)&&f!==w?f:C,P=[],j=new Set;c.forEach(y=>{const R=Ts[y]||0;if(!R)return;const N=m(f,y,b);if(!N||J(N))return;const H=`${N}|${R}`;j.has(H)||(j.add(H),P.push(`${N} ${R}w`))});const k=P.length>1?P.join(", "):"",S=k?_s({variant:u}):"",_=h?"":k,F=h?"":S,E=_?` srcset="${n(_)}"`:"",I=F?` sizes="${n(F)}"`:"",U=Ls({mode:t,priorityIndex:a,slideIndex:s}),B=`${U}${E}${I}`,O=h?[`data-menu-lazy-src="${n(w)}"`,`data-menu-lazy-fallback="${n($||q)}"`,k?`data-menu-lazy-srcset="${n(k)}"`:"",S?`data-menu-lazy-sizes="${n(S)}"`:""].filter(Boolean).join(" "):"";return{safeImg:h?q:w,fallbackImg:h?q:$,imageAttrs:B,lazyAttrs:O?` ${O}`:"",srcsetValue:k,sizesValue:S,loadingAttrs:U}}function Le(e=[],t,a=null){const s=a instanceof Set?a:new Set;return e.map((l,o)=>{const c=Ps(l),u=As(c),f=!!u&&!s.has(u);return f&&s.add(u),`<div${f?` data-menu-category-anchor="${n(u)}"`:""} class="h-full">${t(l,o)}</div>`}).join("")}function Ft(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function Fs(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function Mn(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),a=Fs(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),s=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&a?{type:"link",url:a,productId:""}:t==="product"&&s?{type:"product",url:"",productId:s}:{type:"self",url:"",productId:""}}function Rn(){const e=ae(r.userProfile),t=String(r.menu.filter||"all").trim().toLowerCase()||"all",a=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:v("menu.all","Alle")},{id:"food",label:v("menu.products","Produkte")}]:[{id:"all",label:v("menu.all","Alle")},{id:"food",label:v("menu.food","Speisen")},{id:"drink",label:v("menu.drinks","Getraenke")}]).map(l=>`
        <button data-menu-filter="${l.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${a===l.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${l.label}
        </button>
      `).join("")}
    </div>
  `}function Ms(){const e=xa().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${wa.map(t=>{const a=t.id===e,s=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${a?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${a?p("check",`w-4 h-4 ${s}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function ot(e,{poster:t="",objectPosition:a="50% 50%",badge:s=!0}={}){if(!Kt(e))return"";const l=String(e.videoUrl||"").trim();if(!l)return"";const o=t?` poster="${n(t)}"`:"";return`<video data-autoplay-video src="${n(l)}"${o} class="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]" style="object-position:${a};" muted loop playsinline autoplay preload="metadata"></video>`+(s?'<div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-10"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white block"><path d="M8 5v14l11-7z"></path></svg></div>':"")}function Mt(e,{mode:t="profile",priorityIndex:a=-1}={}){const s=oe(e),l=t==="profile"?_e(e,{index:0}):"",{safeImg:o,fallbackImg:c,imageAttrs:u,lazyAttrs:f}=ge(s,{mode:t,priorityIndex:a,stableKey:l,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),b=Ne(e),g=r.activeTab==="menu"?r.userProfile:r.profileView?.profile||r.userProfile,h=ae(g),x=un(e,h),w=h?dn(e.category):e.category||"",C=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${n(o)}" data-fallback-src="${n(c)}"${f} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${u} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${n(e.name||v("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${n(b)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${n(w)}</span>`:""}
            <span>${n(x)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${p("more-horizontal","w-4 h-4")}
          </summary>
          <div class="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-2xl shadow-lg p-2 z-20">
            <button data-menu-edit="${n(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100">Bearbeiten</button>
            <button data-menu-delete="${n(e.id)}" class="w-full text-left px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Loeschen</button>
          </div>
        </details>
      </div>
    `:`
    <div ${t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:""} class="w-full p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${t==="profile"?"cursor-pointer":""}">
      <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        <img src="${n(o)}" data-fallback-src="${n(c)}"${f} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${u} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${n(e.name||v("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${n(b)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${w?`<span>${n(w)}</span>`:""}
          <span>${n(x)}</span>
        </div>
        ${C?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(C)}</p>`:""}
      </div>
    </div>
  `}function Rt(e,{mode:t="profile",variant:a="food",priorityIndex:s=-1}={}){const l=oe(e),o=t==="profile"?_e(e,{index:0}):"",c=a==="drink",{safeImg:u,fallbackImg:f,imageAttrs:b,lazyAttrs:g}=ge(l,{mode:t,priorityIndex:s,stableKey:o,preferredSize:c?"small":"medium",candidateSizes:c?["small","medium"]:["small","medium","large"],variant:c?"grid":"hero"}),h=Ne(e),x=r.activeTab==="menu"?r.userProfile:r.profileView?.profile||r.userProfile,w=ae(x),C=un(e,w),$=w?dn(e.category):e.category||"",P=e.description||"",j=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",k=r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"",S=qe(e),_=sn(k,S),F=_?rn(_):{likes:[],comments:[],counts:{likes:0,comments:0}},E=on(F),I=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${p("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${n(S)}">${n(A(E.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${p("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${n(S)}">${n(A(E.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${j} class="w-full ${c?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${c?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100 relative">
        <img src="${n(u)}" data-fallback-src="${n(f)}"${g} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${b} decoding="async" />
        ${ot(e,{poster:u,objectPosition:Z(e)})}
      </div>
      ${c?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${n(e.name||v("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${n(h)}</p>
          ${I}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${n(e.name||v("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${n(h)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${$?`<span>${n($)}</span>`:""}
            <span>${n(C)}</span>
          </div>
          ${P?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(P)}</p>`:""}
          ${I}
        </div>
      `}
    </div>
  `}function Et(e={}){if(!e?.restaurantId||ae(e))return!1;const t=String(kt(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":ye(e)}function En(e){const t=e?.restaurantId||r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"",a=qe(e),s=sn(t,a),l=s?rn(s):{likes:[],comments:[],counts:{likes:0,comments:0}},o=String(r.user?.uid||"").trim(),c=String(r.user?.handle||"").trim().toLowerCase(),u=!!l.likes?.some(f=>{const b=String(f?.uid||"").trim();if(o&&b&&b===o)return!0;const g=String(f?.handle||"").trim().toLowerCase();return!!c&&!!g&&g===c});return{itemId:a,meta:l,counts:on(l),isLiked:u}}function _e(e,{index:t=0}={}){const a=String(e?.restaurantId||r.menu.restaurantId||r.profileView?.profile?.restaurantId||r.userProfile.restaurantId||"").trim(),s=String(e?.id||qe(e)||"").trim();if(!a||!s)return"";const l=Number(t),o=Number.isFinite(l)?Math.max(0,Math.floor(l)):0;return`menu-detail:${a}:${s}:${o}`}function Rs(e){const t=typeof an=="function"?an(e):[],a=Array.isArray(t)?t.filter(Boolean):[];if(a.length)return a;const s=oe(e);return s?[s]:[]}function be(e){return or(e?.cardStyle||"",Ae(e?.type||"food"))}function zt(e,{menuItemId:t=""}={}){if(!e)return null;const a=String(t||e.menuItemId||e.itemId||e.productId||"").trim(),s=Kt(e),l=String(e.videoUrl||"").trim(),o=String(e.posterUrl||"").trim(),c=oe(e)||e.imageUrl||(s?o:"")||"";return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:c,objectPosition:e.objectPosition||Z(e),menuItemId:a,mediaType:s?"video":"image",videoUrl:s?l:"",posterUrl:s?o||c:""}}function T(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function Es(e={}){return Je("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${$t()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${se({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex items-center justify-between mb-4">
          ${T("h-3 w-24 rounded-full")}
        <div class="flex items-center gap-2">
          ${T("w-9 h-9 rounded-full")}
          ${T("w-9 h-9 rounded-full")}
        </div>
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${T("w-full h-56")}
      </div>
      <div class="mt-4 space-y-2">
        ${T("h-5 w-2/3 rounded-full")}
        ${T("h-4 w-full rounded-full")}
        ${T("h-4 w-3/5 rounded-full")}
      </div>
    </div>
  `}function zs(e={}){return Je("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${se({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
            ${T("w-full h-full")}
          </div>
          <div class="px-2 py-4 space-y-2">
            ${T("h-5 w-2/3 rounded-full")}
            ${T("h-4 w-full rounded-full")}
            ${T("h-4 w-1/2 rounded-full")}
          </div>
        </div>
      </div>
    </div>
  `}function Ns(){return`
    <div class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col relative" aria-hidden="true">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        ${T("w-full h-full")}
        ${T("absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90")}
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="mb-1 space-y-2">
          ${T("h-4 w-4/5 rounded-full")}
          ${T("h-3 w-3/5 rounded-full")}
        </div>
        ${T("h-3 w-full rounded-full mb-1")}
        ${T("h-3 w-2/3 rounded-full mb-3")}
        <div class="mt-auto pt-2 flex items-center justify-between">
          ${T("h-4 w-14 rounded-full")}
          ${T("w-8 h-8 rounded-full bg-slate-900/10")}
        </div>
      </div>
    </div>
  `}function Ds(){return`
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;" aria-hidden="true">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${T("w-full h-full")}
        ${T("absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90")}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div class="min-w-0 flex-1">
            ${T("h-5 w-4/5 rounded-full")}
          </div>
          ${T("h-5 w-14 rounded-full shrink-0")}
        </div>
        ${T("h-4 w-full rounded-full mb-2")}
        ${T("h-4 w-2/3 rounded-full mb-4")}
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div></div>
          <div class="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  `}function zn(e={}){return Je("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${se({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>Ns()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>Ds()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Nn(e="food"){const t=e==="drink";return`
    <div class="w-full ${t?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm" aria-hidden="true">
      <div class="w-full ${t?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        ${T("w-full h-full")}
      </div>
      ${t?`
        <div class="mt-3 flex flex-1 flex-col space-y-2">
          ${T("h-4 w-4/5 rounded-full")}
          ${T("h-3 w-1/2 rounded-full")}
          <div class="mt-2 flex items-center gap-3">
            ${T("h-3 w-10 rounded-full")}
            ${T("h-3 w-10 rounded-full")}
          </div>
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            ${T("h-4 w-3/5 rounded-full")}
            ${T("h-4 w-14 rounded-full")}
          </div>
          ${T("h-3 w-2/5 rounded-full mt-2")}
          ${T("h-3 w-full rounded-full mt-3")}
          ${T("h-3 w-2/3 rounded-full mt-2")}
          <div class="mt-3 flex items-center gap-3">
            ${T("h-3 w-10 rounded-full")}
            ${T("h-3 w-10 rounded-full")}
          </div>
        </div>
      `}
    </div>
  `}function Us(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${se({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
        <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
        ${T("w-full h-full")}
      </div>
      <div class="pt-3 flex-1 flex flex-col min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1 space-y-2">
            ${T("h-4 w-full rounded-full")}
            ${T("h-4 w-3/5 rounded-full")}
          </div>
          ${T("h-3 w-10 rounded-full shrink-0")}
        </div>
        ${T("h-3 w-full rounded-full mt-3")}
        ${T("h-3 w-2/3 rounded-full mt-2")}
      </div>
    </article>
  `}function Dn({isShop:e=!1,debugContext:t={}}={}){return Je(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${se({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>Us()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${se({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${T("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>Nn("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${T("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>Nn("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Un(e,t=[],{mode:a="profile"}={}){const s=e?.restaurantId||"",l=Et(e)||ae(e);return!s||!l||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((o,c)=>{const u=o.imageUrl||"",f=String(o.menuItemId||o.id||"").trim(),{safeImg:b,fallbackImg:g,imageAttrs:h,lazyAttrs:x}=ge(u,{mode:a,priorityIndex:c,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:f?`menu-focus:${s}:${f}`:""}),w=String(o.menuItemId||"").trim(),C=a==="profile"&&w?`data-menu-open="${n(w)}" role="button"`:"";return`
            <div ${C} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${C?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${n(b)}" data-fallback-src="${n(g)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${o.objectPosition||"50% 50%"};" ${h} decoding="async" />
                ${ot(o,{poster:b,objectPosition:o.objectPosition||"50% 50%",badge:!1})}
                <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${p("sparkles","w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${n(o.title||"")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${n(o.text||"")}</p>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function Bn(e,{mode:t="profile",priorityIndex:a=-1}={}){const s=oe(e),l=t==="profile"?_e(e,{index:0}):"",{safeImg:o,fallbackImg:c,imageAttrs:u,lazyAttrs:f}=ge(s,{mode:t,priorityIndex:a,stableKey:l,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),b=Ne(e),g=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",{itemId:h,counts:x,isLiked:w}=En(e);return`
    <div ${g} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${n(o)}" data-fallback-src="${n(c)}"${f} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${u} decoding="async" />
        ${ot(e,{poster:o,objectPosition:Z(e)})}
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${p("heart","w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${n(e.name||"")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${n(e.description||"")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${n(b)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${p("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${n(h)}">${n(A(x.likes))}</span>
          <span data-menu-comment-count="${n(h)}">${n(A(x.comments))}</span>
        </div>
      </div>
    </div>
  `}function Bs(e,t="profile"){if(t!=="profile")return"";const a=Mn(e);return a.type==="link"&&a.url?`data-menu-special-link="${n(a.url)}" role="button" tabindex="0"`:a.type==="product"&&a.productId?`data-menu-open="${n(a.productId)}" role="button"`:`data-menu-open="${n(e.id)}" role="button"`}function Nt(e,{mode:t="profile",size:a="default",priorityIndex:s=-1}={}){const l=oe(e),o=t==="profile"?_e(e,{index:0}):"",c=a==="food",{safeImg:u,fallbackImg:f,imageAttrs:b,lazyAttrs:g}=ge(l,{mode:t,priorityIndex:s,stableKey:o,preferredSize:c?"medium":"small",candidateSizes:c?["small","medium","large"]:["small","medium"],variant:c?"hero":"grid"}),h=Bs(e,t),x=String(e.category||"Special").trim()||"Special",w=n(String(e.name||"Special")).replace(/\n/g,"<br>");return a==="food"?`
      <div ${h} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${n(u)}" data-fallback-src="${n(f)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${b} decoding="async" />
        ${ot(e,{poster:u,objectPosition:Z(e)})}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${p("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(x)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${h} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${n(u)}" data-fallback-src="${n(f)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${b} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${p("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(x)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function On(e,{mode:t="profile",priorityIndex:a=-1}={}){const s=Ne(e),l=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",o=Rs(e),u=(o.length?o:[oe(e)||""]).filter(Boolean),f=u.length?u.slice(0,12):[""],b=f.length>1,{itemId:g,counts:h,isLiked:x}=En(e),w=A(Math.max(0,Number(h.likes)||0)),C=A(Math.max(0,Number(h.comments)||0));return`
    <div ${l} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${b?`
          <div
            data-menu-card-gallery-track="${n(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${f.map(($,P)=>{const j=t==="profile"?_e(e,{index:P}):"",k=ge($||"",{mode:t,priorityIndex:a,slideIndex:P,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),S=P>0,_=S?q:k.safeImg,F=S?q:k.fallbackImg,E=S?k.loadingAttrs:k.imageAttrs,I=S?"":k.lazyAttrs||"",U=S?` data-menu-card-deferred-src="${n(k.safeImg)}"
                    data-menu-card-deferred-fallback="${n(k.fallbackImg)}"
                    ${k.srcsetValue?`data-menu-card-deferred-srcset="${n(k.srcsetValue)}"`:""}
                    ${k.sizesValue?`data-menu-card-deferred-sizes="${n(k.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${P}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${n(_)}" data-fallback-src="${n(F)}"${I}${U} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${Z(e)};" ${E} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${f.map(($,P)=>{const j=t==="profile"?_e(e,{index:P}):"",{safeImg:k,fallbackImg:S,imageAttrs:_,lazyAttrs:F}=ge($||"",{mode:t,priorityIndex:a,slideIndex:P,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${n(k)}" data-fallback-src="${n(S)}"${F} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${Z(e)};" ${_} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${x?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${x?"true":"false"}"
        >
          ${p("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${b?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${f.map(($,P)=>`
              <div
                data-menu-card-gallery-dot="${n(e.id)}"
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
            <h4 class="text-[18px] font-black text-slate-900 leading-snug">${n(e.name||"")}</h4>
          </div>
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${n(s)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${n(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${n(g)}">${n(w)}</span>
              <span data-menu-comment-count="${n(g)}">${n(C)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${n(v("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${p("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function Os(e,t,{mode:a="profile",publicMenuSurfaceState:s=null,focusFallbackHtml:l=""}={}){const o=it(Array.isArray(t)?t:[]),c=String(e?.restaurantId||"").trim(),u=a==="admin"||Ra(c),f=s?.focus?.canRenderFocus?{items:Array.isArray(s.focus.items)?s.focus.items:[],enabled:!0}:c&&u?Ge(c):{items:[],enabled:!1},b=f.enabled?(Array.isArray(f.items)?f.items:[]).map(y=>zt({...y,objectPosition:je(y)})):[],g=o.filter(y=>be(y)==="testfirst_focus"&&!_t(y)).map(y=>zt(y,{menuItemId:y.id||""})).filter(Boolean),h=new Set,x=[...b,...g].filter(y=>{const R=String(y.menuItemId||y.id||`${y.title}|${y.text}|${y.imageUrl}`);return!R||h.has(R)?!1:(h.add(R),!0)}),w=o.filter(y=>!_t(y)),C=w.filter(y=>be(y)!=="testfirst_focus"),$=C.length?C:w,P=C.length?x:[],j=$.filter(y=>Ue(y)==="drink"),k=$.filter(y=>Ue(y)!=="drink"),S=(y=[])=>{const R=[],N=[];return y.forEach(H=>{const K=be(H);K==="testfirst_food"||K==="testfirst_special"&&Ft(H)==="food"?N.push(H):R.push(H)}),{gridItems:R,foodItems:N}},_=(y,R=-1)=>be(y)==="testfirst_special"?Nt(y,{mode:a,priorityIndex:R}):Bn(y,{mode:a,priorityIndex:R});let F=0;const E=()=>{const y=F;return F+=1,y},I=new Set,U=(y,R)=>!R.gridItems.length&&!R.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${n(y)}">
        ${R.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(y)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${Le(R.gridItems,N=>_(N,E()),I)}
            </div>
          </div>
        `:""}
        ${R.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(y)}">
            <div class="app-content-inline">
              ${Le(R.foodItems,N=>{const H=be(N),K=E();return H==="testfirst_special"?Nt(N,{mode:a,size:"food",priorityIndex:K}):On(N,{mode:a,priorityIndex:K})},I)}
            </div>
          </div>
        `:""}
      </section>
    `,B=S(j),O=S(k);return`
    <div>
      ${Un(e,P,{mode:a})||l}
      <div id="menu-section" class="mt-5">
        ${U("drink",B)}
        ${U("food",O)}
      </div>
    </div>
  `}function Hn(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:s=null,priorityOffset:l=0}={}){return e.length?a?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${Le(e,(o,c)=>Bn(o,{mode:t,priorityIndex:l+c}),s)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${Le(e,(o,c)=>Rt(o,{mode:t,variant:"drink",priorityIndex:l+c}),s)}
    </div>
  `:""}function Vn(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:s=null,priorityOffset:l=0}={}){return e.length?a?`
      <div>
        ${Le(e,(o,c)=>be(o)==="testfirst_special"&&Ft(o)==="food"?Nt(o,{mode:t,size:"food",priorityIndex:l+c}):On(o,{mode:t,priorityIndex:l+c}),s)}
      </div>
    `:`
    <div class="space-y-4">
      ${Le(e,(o,c)=>Rt(o,{mode:t,variant:"food",priorityIndex:l+c}),s)}
    </div>
  `:""}function Kn(e,{mode:t="profile"}={}){if(t==="admin"){const a=String(r?.menu?.filter||"all").trim().toLowerCase(),s=ae(r.userProfile),l=v("menu.products","Produkte"),o=e.filter(g=>Ae(g?.type)==="drink"),c=e.filter(g=>Ae(g?.type)!=="drink"),u=(g,h,{addType:x=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${n(g)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${n(g)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(A(h.length))} Eintraege</p>
          </div>
          ${x?`
            <button type="button" data-menu-add-${n(x)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${p("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${h.length?`<div class="space-y-3">${h.map(w=>Mt(w,{mode:"admin"})).join("")}</div>`:(Qe({functionName:"renderMenuList.adminSection",items:h,rawItems:h,filteredItems:h,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${se({source:"admin-menu:no-products"})}>${n(v("menu.noProducts","Keine Produkte"))}</div>`)}
      </div>
    `;if(s)return u(l,e,{addType:"food"});const f=[{title:v("menu.drinks","Getraenke"),list:o,addType:"drink"},{title:v("menu.food","Speisen"),list:c,addType:"food"}];if(a==="all")return`
        <div>
          ${f.map(g=>u(g.title,g.list,{addType:g.addType})).join("")}
        </div>
      `;const b=f.filter(g=>g.list.length>0);return b.length?`
      <div>
        ${b.map(g=>u(g.title,g.list,{addType:g.addType})).join("")}
      </div>
    `:a==="drink"?u(v("menu.drinks","Getraenke"),[],{addType:"drink"}):a==="food"?u(v("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((a,s)=>Mt(a,{mode:t,priorityIndex:s})).join("")}
    </div>
  `:(Qe({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${se({source:`${t}:no-products`})}>
        ${n(v("menu.noProducts","Keine Produkte"))}
      </div>
    `)}function Dt(e,{variant:t="focus",suppressLoading:a=!1}={}){if(!e)return"";const{items:s,enabled:l,loading:o}=Ge(e,{includeInactive:!0}),c=A(s.length),u=String(t||"").trim().toLowerCase()==="travel-offers",f=u?"Ofertat":"Sot ne Fokus",b=u?"Oferta":"Highlights",g=u?"Im Travel und Profil sichtbar":"Im Profil sichtbar",h=u?"Ofertat werden geladen...":v("focus.loading","Fokus wird geladen..."),x=u?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${n(f)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${n(b)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(c)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${p("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${u?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(g)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${l?"checked":""} />
      </label>

      ${s.length?`
        <div class="space-y-3">
          ${s.map(w=>{const C=m(w.imageUrl||"","thumb"),$=J(C)?q:C,P=w.active!==!1?"Aktiv":"Inaktiv",j=w.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n($)}" class="w-full h-full object-cover" style="object-position:${je(w)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(w.title||"Sot ne Fokus")}</p>
                  ${w.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(w.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${j}">${P}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${n(w.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${n(w.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:o&&!a?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(h)}</div>
      `:o?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(x)}</div>
      `}
    </div>
  `}function qn(e={}){if(!e?.restaurantId)return!1;const t=String(kt(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||ae(e)?!1:ye(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function Hs(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function Vs(e,t){if(!t||!qn(e))return"";const{items:a,loading:s}=Sa(t,{includeInactive:!0}),l=A(a.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(l)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${p("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${a.length?`
        <div class="space-y-3">
          ${a.map(o=>{const c=m(o.imageUrl||"","thumb"),u=J(c)?q:c,f=Hs(o),b=o.category||"RESTAURANT",g=o.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(u)}" class="w-full h-full object-cover" style="object-position:${je(o)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(o.title||"Ad")}</p>
                  ${o.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(o.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${n(b)} · ${n(g)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${f.className}">${n(f.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${n(o.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${n(o.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
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
  `}function Ut(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function Ks(e={}){const t=String(e?.restaurantId||"").trim(),a=t?le(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function Bt(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function qs(e={}){const t=Bt(e);return[...Ut(t.productIds),...Ut(e.shoppingLandingCardProductIds),...Ut(e.shoppingLandingProductIds)].filter(Boolean)}function Ot(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[a,s])=>{const l=String(a||"").trim(),o=String(s||"").trim();return l&&o&&(t[l]=o),t},{})}function Gs(e={}){const t=Bt(e);return{...Ot(e.shoppingLandingProductImageOverrides),...Ot(t.productImageOverrides)}}function Ws(e=""){const t=String(e||"").trim(),a=r.shoppingLandingCardEditor&&typeof r.shoppingLandingCardEditor=="object"?r.shoppingLandingCardEditor:{},s=String(a.restaurantId||"").trim();return s&&s!==t?{}:a}function Ys(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function Qs(e={}){const a=[oe(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(Ys).filter(Boolean);return a.filter((s,l)=>a.indexOf(s)===l)}function Js(e={},t={},a={}){const s=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!s)return null;const l=Qs(e).map(g=>({rawUrl:g,imageUrl:m(g,"thumb")})).filter(g=>g.rawUrl&&!J(g.imageUrl)),o=l[0]?.rawUrl||"",c=String(t?.[s]||"").trim(),u=String(a?.[s]||"").trim(),f=u||c||o,b=f?m(f,"thumb"):"";return{id:s,name:String(e.name||e.title||"Produkt").trim(),price:Ne(e),imageUrl:b&&!J(b)?b:"",defaultImageRaw:o,cardImageUrl:c,previewImageUrl:u,imageCandidates:l,objectPosition:Z(e)}}function Xs(e={},t="",a=[]){if(!t||!ae(e))return"";const s=Ks(e),l=Bt(s),o=Ws(t),c=o.saving===!0,u=String(o.status||"").trim(),f=/fehl|error|nicht|nuk|kein/i.test(u),b=String(l.imageUrl||s.shoppingLandingCardImageUrl||s.shoppingLandingImageUrl||"").trim(),g=String(s.logoUrl||s.logo||s.logoURL||s.avatar||e.avatar||"").trim(),h=String(o.imageUrlDraft??b).trim(),x=String(o.imagePreview||h||g||"").trim(),w=x?m(x,"large"):q,C=String(o.titleDraft??(l.title||s.shoppingLandingCardTitle||e.name||"")).trim(),$=o.active!==void 0?o.active!==!1:l.active!==!1&&s.shoppingLandingCardEnabled!==!1,P=qs(s),j=Array.isArray(o.productIds)?o.productIds.map(I=>String(I||"").trim()).filter(Boolean):null,k=new Set(j||P),S={...Gs(s),...Ot(o.productImageOverrides)},_=o.productImagePreviews&&typeof o.productImagePreviews=="object"?o.productImagePreviews:{},F=(Array.isArray(a)?a:[]).filter(I=>I&&String(I.id||"").trim()&&I.hidden!==!0&&I.available!==!1).map(I=>Js(I,S,_)).filter(Boolean),E=k.size?`${A(k.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${n(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(E)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${p("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${n(h)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${n(w||q)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${n(C||"Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${n(C)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
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
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${n(A(F.length))}</span>
          </div>
          ${F.length?`
            <div class="grid grid-cols-1 gap-2">
              ${F.map(I=>{const U=k.has(I.id),B=I.imageUrl||q,O=String(I.defaultImageRaw||I.imageCandidates[0]?.rawUrl||"").trim(),y=String(I.cardImageUrl||"").trim(),R=String(I.previewImageUrl||"").trim(),N=!!(R||y&&y!==O),H=R||(y&&!I.imageCandidates.some(K=>K.rawUrl===y)?y:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${n(I.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${U?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${n(B)}" class="w-full h-full object-cover" style="object-position:${n(I.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${n(I.name)}</span>
                        ${I.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${n(I.price)}</span>`:""}
                      </span>
                    </label>
                    ${U?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${N?`
                              <button type="button" data-shopping-landing-product-image-reset="${n(I.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 active:scale-95">
                                Standard
                              </button>
                            `:""}
                            <button type="button" data-shopping-landing-product-image-upload="${n(I.id)}" class="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">
                              Upload
                            </button>
                            <input type="file" accept="image/*" data-shopping-landing-product-image-input="${n(I.id)}" class="hidden" />
                          </div>
                        </div>
                        <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                          ${I.imageCandidates.map((K,Y)=>{const te=Y===0,ne=R?!1:te?!N:y===K.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${n(I.id)}" data-shopping-landing-product-image-choice="${n(I.id)}" value="${te?"":n(K.rawUrl)}" class="hidden" ${ne?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${ne?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${n(K.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${Y+1}</span>
                              </label>
                            `}).join("")}
                          ${H?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${n(I.id)}" data-shopping-landing-product-image-choice="${n(I.id)}" value="${n(H)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${n(m(H,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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

        ${u?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${f?"text-rose-500":"text-slate-500"}">${n(u)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
          ${c?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function Zs(e){if(!Et(e)||!fn(e))return"";const a=it((r.menu.items||[]).filter(s=>be(s)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(A(a.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${p("plus","w-4 h-4")}
        </button>
      </div>
      ${a.length?`
        <div class="space-y-3">
          ${a.map(s=>{const l=m(oe(s),"thumb"),o=J(l)?q:l,c=Mn(s),u=c.type==="link"?"Link":c.type==="product"?"Produkt-Modal":"Diese Karte",f=Ft(s)==="food"?"Food-Size":"Normal",b=Fa(Ue(s));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(o)}" class="w-full h-full object-cover" style="object-position:${Z(s)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(s.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${n(b)}</span>
                    <span>${n(f)}</span>
                    <span>${n(u)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${n(s.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${n(s.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function Gn(e,{restaurantId:t="",suppressLoading:a=!1,allowAutoEnsure:s=!0,requirePublicMenuTruth:l=!0}={}){const o=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!o||!ye(e))return"";const c=He(r,{profile:e,routePayload:r?.profileView?.routePayload,webDirectEntry:r?.__webDirectEntry,restaurantId:o});if(l&&c.menu.status!=="ready")return"";const u=!l||c.focus.canRenderFocus;if(s&&!r.focus.loading&&!u&&we(pn(e,o)),l&&!u)return"";const{items:f,loading:b}=u?{items:Array.isArray(c.focus.items)?c.focus.items:[],loading:c.focus.loading}:Ge(o);if(!(u?!0:Ge(o).enabled)||!f.length&&!b||a&&b&&!f.length)return"";if(b&&!f.length)return`
      <div class="${$t()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(v("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const h=Ia(f),x=f[h]||f[0],{safeImg:w,fallbackImg:C,imageAttrs:$,lazyAttrs:P}=ge(x.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:x?.id?`focus-carousel:${o}:${String(x.id)}`:""}),j=x.text||"";return`
    <div id="focusCarousel" class="${$t()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${f.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${p("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${p("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${Kt(x)&&String(x.videoUrl||"").trim()?`
          <video data-focus-media="video" data-focus-video data-autoplay-video src="${n(String(x.videoUrl||"").trim())}" ${w?`poster="${n(w)}"`:""} class="w-full h-56 object-cover" style="object-position:${je(x)};" muted loop playsinline autoplay preload="metadata"></video>
          <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
          </div>
        `:`
          <img data-focus-media="image" data-focus-image src="${n(w)}" data-fallback-src="${n(C)}"${P} class="w-full h-56 object-cover" style="object-position:${je(x)};" ${$} decoding="async" />
        `}
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${n(x.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${j?"":"hidden"}">${n(j)}</p>
      </div>
      ${f.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${f.map((S,_)=>`
            <button type="button" data-focus-dot="${_}" class="w-2.5 h-2.5 rounded-full ${_===h?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function er(e,t=220){const a=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${a}`}function Wn({label:e,url:t,caption:a}){if(!t)return"";const s=er(t,240);return`
    <button type="button" data-copy-url="${n(t)}" data-copy-label="${n(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${n(s)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${n(e)}</p>
        ${a?`<p class="text-[10px] font-bold text-slate-400 mt-1">${n(a)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function tr({profile:e,restaurantId:t,catalogLabel:a}){if(!t||!ye(e))return"";if(typeof tn=="function"){const o=We?We(t):null;(!o||o.sameRestaurant!==!0||!o.loading&&!o.loaded&&!o.error)&&tn(e)}const s=typeof We=="function"?We(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},l=(s.tables||[]).map(o=>{const c=Ca("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:o});return Wn({label:`Tisch ${o}`,url:c,caption:`${a} fuer Tisch ${o}`})}).join("");return`
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
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${n(String(s.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${s.saving?"disabled":""}>
          ${s.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${s.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${s.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${n(s.status)}</p>`:""}
      ${s.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(s.error)}</p>`:""}
      ${l?`
        <div class="grid grid-cols-2 gap-4 mt-6">
          ${l}
        </div>
      `:`
        <div class="mt-6 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-300">Noch keine Tisch-QR-Codes</p>
        </div>
      `}
    </div>
  `}function nr(){const e=r.userProfile,t=e.restaurantId||"",a=String(r.user?.uid||"").trim(),s=String(r.__authBootstrapInFlightUid||"").trim(),l=!t&&!!a&&(!!r.__authProfileLoadPromise||s===a),o=Ze(e),c=ye(e),u=r.profileView?.profile?.restaurantId?r.profileView.profile:null,f=D()&&!!u?.restaurantId&&ye(u),b=ae(e),g=_a(ga(e)),h=t?le(t):null,x=h?.name||h?.restaurantName||e.name||"Business",w=t&&r.menu.restaurantId===t,C=String(r.menu.source||"").trim().toLowerCase(),$=!!w&&C==="collection",P=!!w&&C==="collection"&&r.menu.loading,j=!!t&&(P||!$),k=b?"all":r.menu.filter,S=$?Ln(r.menu.items,{filter:k,query:r.menu.query}):[],F=fn(e)?S:S.filter(U=>!Da(U)),E=it(F),I=A(E.length);if(t&&o){Ka(e);const U=String(r.focus?.truthSource||"").trim().toLowerCase();return!r.focus.loading&&(r.focus.restaurantId!==t||U!=="public-menu")&&we(e),us(e)}return t&&c&&!$&&!P&&Ke(e),t&&c&&!r.focus.loading&&r.focus.restaurantId!==t&&we(e),t&&qn(e)&&yt(e),c?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${g}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(x)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${n(I)}</p>
          </div>
        </div>
      `:l?`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Business wird geladen...</p>
        </div>
      `:`
        <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500 mb-4">Bitte zuerst dein Business im Account auswaehlen.</p>
          <button data-nav="settings" class="px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">Zu den Einstellungen</button>
        </div>
      `}

      ${t?Dt(t):""}
      ${t?Vs(e,t):""}
      ${t?Xs(e,t,$?r.menu.items:[]):""}
      ${t&&$?Zs(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${p("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${n(r.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${Rn()}

        ${j?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(v("menu.loading",`${g} wird geladen...`,{label:g}))}</div>`:Kn(E,{mode:"admin"})}
        ${r.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${n(r.menu.error)}</div>`:""}
        ${tr({profile:e,restaurantId:t,catalogLabel:g})}
      `:""}

    </div>
  `:f?lt(u):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${p("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${g}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function lt(e,{mode:t="profile",allowAutoEnsure:a=!0}={}){const s=r?.profileView?.routePayload&&typeof r.profileView.routePayload=="object"?r.profileView.routePayload:null,l=r?.__webDirectEntry&&typeof r.__webDirectEntry=="object"&&r.__webDirectEntry.active===!0?r.__webDirectEntry:null;let o=He(r,{profile:e,routePayload:s,webDirectEntry:l});const c=o.restaurantId||Ma(e,s);if(!c)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${n(v("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const u=pn(e,c),f=ae(u),b=ye(u)&&!f;b&&(o=He(r,{profile:u,routePayload:s,webDirectEntry:l,restaurantId:c}));const g=String(l?.canonicalRestaurantId||l?.restaurantId||"").trim(),h=new Set(o.targetIds),x=o.menu.status==="ready",w=o.focus.canRenderFocus,C=x&&b,$=o.focus.matches===!0&&o.focus.loading===!0,j=String(r?.profileView?.menuAccessSource||l?.menuAccessSource||s?.menuAccessSource||"").trim().toLowerCase()==="qr",k=l?.active===!0&&l?.webPriority===!0&&l?.menuFirst===!0&&String(r?.activeTab||"").trim().toLowerCase()==="profile"&&String(r?.profileTopTab||"").trim().toLowerCase()==="menu"&&(g===c||h.has(c)),S=k&&!j,_=["ready","empty","error"].includes(o.menu.status),F=k&&_,E=k&&(!C||o.menu.status!=="ready"),I=!C||o.focus.settled===!0||o.focus.confirmedEmpty===!0||o.menu.status!=="ready";a&&!F&&!_&&Pe(u),a&&!E&&!I&&!$&&x&&(!S||_)&&we(u);const B=o.menu.canRenderItems?it(Ln(o.menu.items,{filter:"all",query:""})).filter(re=>!_t(re)):[],O=o.menu.error||"",y=lr(o.menu,B),{hasItems:R,hasError:N,isLoading:H,shouldRenderNoProducts:K}=y;ja({profile:u,routePayload:s,surface:o,decision:y});const Y={profile:u,routePayload:s,surface:o,decision:y,rawItems:o.menu.items,items:B,filteredItems:B,source:"public-menu"},te=La(o,B),ne=B.filter(re=>Ue(re)==="drink"),$e=B.filter(re=>Ue(re)!=="drink"),Ht=0,ce=ne.length,ke=Et(e),ct=ke||f,dt=new Set;R&&c&&(ba(B,c),za(B,c));const ut=c&&w?(Array.isArray(o.focus.items)?o.focus.items:[]).map(re=>zt({...re,objectPosition:je(re)})).filter(Boolean):[],pt=o.focus.status==="empty"||o.focus.status==="error",Be=b&&!w&&!pt&&o.menu.status!=="empty"&&o.menu.status!=="error",Oe=ut.length?Un(u,ut,{mode:t}):Be?zs({...Y,reason:"focus-truth-pending"}):"",de=ct?Oe:Gn(u,{restaurantId:c,suppressLoading:!0,allowAutoEnsure:x&&(!S||_),requirePublicMenuTruth:!0})||(Be?Es({...Y,reason:"focus-truth-pending"}):"");return ke?`
      <div class="app-main-content-safe"${te}>
        ${H?`
          ${Oe}
          ${zn({...Y,reason:"menu-loading"})}
        `:`
          ${R?Os(u,B,{mode:t,publicMenuSurfaceState:o,focusFallbackHtml:Oe}):N?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(v("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:K?(Qe({...Y,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${se({source:"public-menu:no-products"})}>${n(v("menu.noProducts","Keine Produkte"))}</div>`):zn({...Y,reason:"menu-not-confirmed-empty"})}
          ${O?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(O)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5"${te}>
      ${de}
      ${H?`
        ${Dn({isShop:f,debugContext:{...Y,reason:"menu-loading"}})}
      `:`
        ${R?`
          ${f?`
            ${va(B,{profile:e})}
          `:`
            ${ne.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(v("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Hn(ne,{mode:t,useTestfirstCardUi:ke,seenCategories:dt,priorityOffset:Ht})}
                </div>
              </section>
            `:""}
            ${$e.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(v("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Vn($e,{mode:t,useTestfirstCardUi:ke,seenCategories:dt,priorityOffset:ce})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${N?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(v("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:K?`
            ${Qe({...Y,functionName:"renderProfileMenuView",renderDecision:f?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${se({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(v("menu.noProducts","Keine Produkte"))}
              </div>
            </div>`}
          `:`
            ${Dn({isShop:f,debugContext:{...Y,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${O?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(O)}</div>`:""}
      `}
    </div>
  `}function ar(){const e=r.userProfile,t=M(e),a=t?r.businessPosts:r.userPosts,s=String(r.user?.uid||e?.uid||"").trim(),l=String(e?.restaurantId||"").trim(),o=String(r.__userPostsLoadingUid||"").trim(),c=String(r.__businessPostsLoadingRestaurantId||"").trim(),u=String(r.__authBootstrapInFlightUid||"").trim(),f=!!s&&o===s,b=!!l&&c===l,g=!!s&&u===s,h=t?b||g&&!a.length:f||g&&!a.length,x=String(e.handle||W(e.name||"user")).replace(/^@/,""),C=n(e.bio||"").replace(/\n/g,"<br>")||n(v("profile.noBio","Noch keine Bio.")),$=nt(e),P=$==="menu",j=$==="checkins",k=a,S=m(e.avatar,"avatar"),_=L(t),F=jt(e);return`
    <div class="app-main-content-safe">
      ${F==="profile"||F==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Tn(e,{mode:"self",avatarUrl:S,avatarFit:_,followersLabel:A(e.followers),bioHtml:C}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${n(S)}" data-fallback-src="${n(q)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${_} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${p("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(A(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(A(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(x)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${C}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${p("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${p("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${Tt(e)}
      ${Lt(e)}

      ${P?`
        ${Ze(e)?kn(e):lt(e)}
      `:j?`
        ${Pt()}
      `:`
        ${h&&!k.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(v("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${r.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Ct(k,r.profileViewMode)}
          </div>
          ${$==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${p("plus","w-4 h-4")} Neuen Beitrag
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
  `}return{renderProfilePostCardFancy:mn,renderProfilePostsFancy:Ct,renderProfileCheckins:Pt,renderProfileTabs:Tt,renderProfileViewControls:Lt,renderPublicProfileView:Cs,renderMenuFilterRow:Rn,renderMenuLayoutSection:Ms,renderMenuItemCard:Mt,renderMenuItemCardStacked:Rt,renderMenuDrinkGrid:Hn,renderMenuFoodList:Vn,renderMenuList:Kn,renderFocusAdminSection:Dt,renderFocusCarousel:Gn,renderMenuQrCard:Wn,renderMenuAdminView:nr,renderProfileMenuView:lt,renderProfileView:ar}}export{Li as createProfileMenuFocusRenderController};
