import{_ as ps}from"./domain-auth-BL21ERPm.js";import{w as fs}from"./domain-menu-eager-GwdcSK2h.js";import{a as Jt}from"./domain-media-eager-B90n_Ot7.js";import{am as We,an as ms,t as gs,ao as bs,k as hs,ap as Qe}from"./domain-feed-social-eager-zkIVbwiS.js";import{n as ia,g as Xt,h as vs,i as xs}from"./domain-app-events-Da9xRBtG.js";import{K as ws,L as ys,M as $s,N as ks,O as Ss,P as Is,Q as Cs,J as Ps,R as As,A as Ts,g as js,B as Ls,S as _s,T as Fs,b as Ms,d as Es}from"./vendor-firebase-D7Ks7H8l.js";import"./domain-public-profile-BW4dw-Ab.js";const ln=Object.freeze([Object.freeze({key:"city",label:"Qyteti",labelDe:"Stadt"}),Object.freeze({key:"beach",label:"Plazha",labelDe:"Straende"}),Object.freeze({key:"sights",label:"Vende per te pare",labelDe:"Sehenswuerdigkeiten"}),Object.freeze({key:"activities",label:"Aktivitete",labelDe:"Aktivitaeten"}),Object.freeze({key:"nature",label:"Natyre",labelDe:"Natur"}),Object.freeze({key:"food",label:"Restorante & Kafene",labelDe:"Restaurants & Cafes"}),Object.freeze({key:"nearby",label:"Vende te rendesishme",labelDe:"Wichtige Orte"})]),Rs=Object.freeze(ln.map(o=>o.key)),zs=Object.freeze([Object.freeze({key:"all",labelDe:"Ganzjaehrig"}),Object.freeze({key:"summer",labelDe:"Saisonal Sommer"}),Object.freeze({key:"winter",labelDe:"Saisonal Winter"})]),Ns=Object.freeze(zs.map(o=>o.key)),Ds=12;function ve(o=""){return o==null?"":String(o).trim()}function Zt(o){const s=Number(o);return Number.isFinite(s)?s:null}function Us(o=""){const s=ve(o).toLowerCase();return Rs.includes(s)?s:{qyteti:"city",stadt:"city",plazha:"beach",plazhi:"beach",strand:"beach",straende:"beach",sehenswuerdigkeiten:"sights",sehenswurdigkeiten:"sights",aktivitete:"activities",aktivitaeten:"activities",natyre:"nature",natur:"nature",restorante:"food",restaurants:"food",cafes:"food",kafene:"food",umgebung:"nearby",rrethina:"nearby"}[s]||"nearby"}function Bs(o=""){const s=ve(o).toLowerCase();return Ns.includes(s)?s:"all"}function Os(o=Date.now(),s=Math.random()){const d=Math.max(0,Number(o)||0).toString(36),a=Math.floor(Math.max(0,Math.min(.999999,Number(s)||0))*36**6).toString(36).padStart(6,"0");return`place_${d}_${a}`}function Hs(o){return Array.isArray(o)?o.map(s=>ve(s)).filter(Boolean).slice(0,Ds):[]}function Vs(o={},{index:s=0}={}){const d=o&&typeof o=="object"?o:{},a=Zt(d.lat??d.latitude??d.coords?.lat),m=Zt(d.lng??d.lon??d.longitude??d.coords?.lng),p=Zt(d.priority);return{id:ve(d.id)||Os(Date.now()+s),name:ve(d.name),category:Us(d.category),description:ve(d.description??d.text).slice(0,600),address:ve(d.address??d.plusCode).slice(0,240),lat:a,lng:m,coverImageUrl:ve(d.coverImageUrl??d.imageUrl??d.coverUrl),gallery:Hs(d.gallery),priority:p==null?0:Math.max(0,Math.min(100,Math.round(p))),pinned:d.pinned===!0,season:Bs(d.season??d.seasonal),active:d.active!==!1}}const Ks=6371e3,qs=80,Gs=600,Ys=1600;function xt(o=0){return(Number(o)||0)*(Math.PI/180)}function Ne(o){return o==null||o===""?NaN:Number(o)}function kt(o={}){return Number.isFinite(Ne(o?.lat))&&Number.isFinite(Ne(o?.lng))}function Ws(o,s,d,a){const m=Ne(o),p=Ne(s),M=Ne(d),U=Ne(a);if(![m,p,M,U].every(Number.isFinite))return null;const Y=xt(M-m),L=xt(U-p),A=Math.sin(Y/2)**2+Math.cos(xt(m))*Math.cos(xt(M))*Math.sin(L/2)**2;return Math.round(2*Ks*Math.asin(Math.min(1,Math.sqrt(A))))}function Qs(o){const s=Number(o);return!Number.isFinite(s)||s<0?"":s<1e3?`${Math.max(10,Math.round(s/10)*10)} m`:s<1e4?`${(s/1e3).toFixed(1).replace(/\.0$/,"")} km`:`${Math.round(s/1e3)} km`}function Js(o){const s=Number(o);return!Number.isFinite(s)||s<0?null:s<=Ys?{mode:"walk",minutes:Math.max(1,Math.round(s/qs))}:{mode:"drive",minutes:Math.max(1,Math.round(s/Gs))}}function oa(o,s={}){const d=Js(o);if(!d)return"";const a=String(s.walk||"min in Gehweite"),m=String(s.drive||"min mit dem Auto");return`${d.minutes} ${d.mode==="walk"?a:m}`}const ha=200;function he(o=""){return o==null?"":String(o).trim()}function la(o){return Array.isArray(o)?Array.from(new Set(o.map(s=>he(s)).filter(Boolean))).slice(0,ha):[]}function va(o={}){const s=o&&typeof o=="object"?o:{},d=s.placePatches&&typeof s.placePatches=="object"?s.placePatches:{},a={};return Object.entries(d).slice(0,ha).forEach(([m,p])=>{const M=he(m);if(!M||!p||typeof p!="object")return;const U={};he(p.name)&&(U.name=he(p.name)),he(p.description)&&(U.description=he(p.description).slice(0,600)),he(p.coverImageUrl)&&(U.coverImageUrl=he(p.coverImageUrl)),Object.keys(U).length&&(a[M]=U)}),{hidden:la(s.hidden),pinned:la(s.pinned),placePatches:a}}function tn({places:o=[],overrides:s={},hotelCoords:d=null,includeHidden:a=!1}={}){const m=va(s),p=new Set(m.hidden),M=new Map(m.pinned.map((L,A)=>[L,A])),U=kt(d)?d:null;return(Array.isArray(o)?o:[]).map((L,A)=>Vs(L,{index:A})).filter(L=>L.name&&L.active).map(L=>{const A=m.placePatches[L.id]||{},Q=U&&kt(L)?Ws(U.lat,U.lng,L.lat,L.lng):null;return{...L,...A,hidden:p.has(L.id),pinned:M.has(L.id)||L.pinned,pinnedRank:M.has(L.id)?M.get(L.id):null,distanceMeters:Q}}).filter(L=>a||!L.hidden).sort((L,A)=>{const Q=L.pinnedRank!=null,xe=A.pinnedRank!=null;if(Q!==xe)return Q?-1:1;if(Q&&xe&&L.pinnedRank!==A.pinnedRank)return L.pinnedRank-A.pinnedRank;if(L.pinned!==A.pinned)return L.pinned?-1:1;if(L.priority!==A.priority)return A.priority-L.priority;const Pe=Number.isFinite(L.distanceMeters)?L.distanceMeters:1/0,Ae=Number.isFinite(A.distanceMeters)?A.distanceMeters:1/0;return Pe!==Ae?Pe-Ae:String(L.name).localeCompare(String(A.name))})}function Xs(o=[]){const s=Array.isArray(o)?o:[];return ln.map(d=>({...d,places:s.filter(a=>a.category===d.key)})).filter(d=>d.places.length)}const nn="mnyraHotelDestinationSections",ca="mnyraHotelDetailStyles",Zs="/apps/menyra-social/styles/hotel-detail.css?v=2026-07-10-hotel-detail-v1",da=Object.freeze({walk:"min në këmbë",drive:"min me makinë"}),Ue=Object.freeze({rooms:"Qëndrimi yt",city:"Përreth teje",beach:"Deti afër",sights:"Vlen të shihet",activities:"Përjeto zonën",nature:"Natyrë e gjallë",food:"Shijo lokal",nearby:"Afër teje",amenities:"Pa pagesë shtesë",map:"Zbulo zonën",rating:"Nga vizitorët"}),an=Object.freeze({city:"Qyteti",beach:"Plazha",sights:"Vende për të parë",activities:"Aktivitete",nature:"Natyra",food:"Restorante & Kafene",nearby:"Vende të rëndësishme"}),rn=Object.freeze({bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>',building:'<path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',waves:'<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>',compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',sparkles:'<path d="m12 3-1.2 3.1L8 7.5l2.8 1.4L12 12l1.2-3.1L16 7.5l-2.8-1.4zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8zM18 13l-1 2.7-3 1.3 3 1.3 1 2.7 1-2.7 3-1.3-3-1.3z"/>',tree:'<path d="m17 14 3 3h-5l3 3H6l3-3H4l3-3H3l5-5H5l7-7 7 7h-3l5 5zM12 20v2"/>',coffee:'<path d="M10 2v2M14 2v2M6 2v2M18 8h1a3 3 0 0 1 0 6h-1M4 8h14v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>',pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0"/><circle cx="12" cy="10" r="3"/>',nav:'<path d="m3 11 19-9-9 19-2-8z"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',expand:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/>',check:'<path d="m20 6-11 11-5-5"/>',wifi:'<path d="M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',car:'<path d="m5 17-2-1v-4l2-5h14l2 5v4l-2 1M5 17v2M19 17v2M3 13h18M7 13h.01M17 13h.01"/>',snow:'<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93M8 5l4 2 4-2M8 19l4-2 4 2"/>',shield:'<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',umbrella:'<path d="M2 12h20M12 12v8a2 2 0 0 0 4 0M2 12a10 10 0 0 1 20 0M12 2v1"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',size:'<path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6"/>'}),ei=Object.freeze({city:"building",beach:"waves",sights:"compass",activities:"sparkles",nature:"tree",food:"coffee",nearby:"pin"}),ti=Object.freeze([{keywords:["wifi","wi-fi","internet"],icon:"wifi"},{keywords:["parkim","parking","garazh"],icon:"car"},{keywords:["mengjes","mëngjes","breakfast","fruehstueck"],icon:"coffee"},{keywords:["klime","klimë","kondicioner","ac"],icon:"snow"},{keywords:["plazh","det","beach","pishine","pishinë","pool"],icon:"waves"},{keywords:["shezlong","ombrelle","umbrella"],icon:"umbrella"},{keywords:["recepsion","reception","siguri","security","24"],icon:"shield"},{keywords:["pastrim","cleaning","spa"],icon:"sparkles"},{keywords:["famil","person"],icon:"users"}]);function V(o=""){return o==null?"":String(o).trim()}function N(o=""){return V(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ie(o="pin",s=""){const d=rn[o]||rn.pin;return`<svg class="mhd-icon ${s}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`}function ua(o=typeof document>"u"?null:document){if(!o||o.getElementById(ca))return;const s=o.createElement("link");s.id=ca,s.rel="stylesheet",s.href=Zs,o.head.appendChild(s)}function Be({iconName:o="pin",eyebrow:s="",title:d=""}={}){return`
    <div class="mhd-section-title">
      <span class="mhd-section-icon">${ie(o)}</span>
      <div>
        ${s?`<small>${N(s)}</small>`:""}
        <h2>${N(d)}</h2>
      </div>
    </div>
  `}function ni(o=""){const s=V(o);if(!s)return null;const d=s.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i);if(!d)return null;const a=Number(String(d[1]||"").replace(",","."));if(!Number.isFinite(a)||a<0)return null;const m=String(d[2]||"m").trim().toLowerCase();return Math.round(m.startsWith("k")?a*1e3:a)}function ai(o={}){const s=o.manualDistance&&typeof o.manualDistance=="object"?o.manualDistance:null;if(s){const m=V(s.label);if(!m)return"";const p=ni(m),M=s.direct!==!0&&Number.isFinite(p)?oa(p,da):"";return`
      <div class="mhd-distance">
        <span>${ie("nav","mhd-icon--sm")}${N(m)}</span>
        ${M?`<span>${ie("clock","mhd-icon--sm")}${N(M)}</span>`:""}
      </div>
    `}const d=Qs(o.distanceMeters);if(!d)return"";const a=oa(o.distanceMeters,da);return`
    <div class="mhd-distance">
      <span>${ie("nav","mhd-icon--sm")}${N(d)}</span>
      ${a?`<span>${ie("clock","mhd-icon--sm")}${N(a)}</span>`:""}
    </div>
  `}function ri(o={},{nearestPlaceId:s="",imageUrlFn:d=null}={}){const a=ln.find(U=>U.key===o.category)?.label||"",m=o.id&&o.id===s?"Më afër hotelit":a,p=V(o.coverImageUrl),M=p&&typeof d=="function"&&V(d(p))||p;return`
    <article class="mhd-card">
      <div class="mhd-photo">${M?`<img src="${N(M)}" alt="${N(o.name)}" loading="lazy" decoding="async" />`:""}</div>
      <div class="mhd-card-body">
        ${m?`<span class="mhd-pill ${o.id===s?"mhd-pill--accent":""}">${N(m)}</span>`:""}
        <h3>${N(o.name)}</h3>
        ${ai(o)}
        ${o.description?`<p class="mhd-copy">${N(o.description)}</p>`:""}
      </div>
    </article>
  `}function pa({template:o=null,overrides:s={},hotelCoords:d=null,imageUrlFn:a=null,manualBeachDistance:m=null}={}){if(!o||!Array.isArray(o.places)||!o.places.length)return"";const p=tn({places:o.places,overrides:s,hotelCoords:kt(d)?d:null});if(!p.length)return"";const M=p.filter(A=>Number.isFinite(A.distanceMeters)).sort((A,Q)=>A.distanceMeters-Q.distanceMeters)[0]||null,U=Xs(p),Y=m&&typeof m=="object"?m:null,L=Y?Y.direct===!0?"Në plazh":V(Y.label):"";if(L){const A=U.find(Q=>Q.key==="beach");A?.places?.length&&(A.places[0]={...A.places[0],manualDistance:{label:L,direct:Y.direct===!0}})}return U.map(A=>`
    <section class="mhd-section">
      ${Be({iconName:ei[A.key]||"pin",eyebrow:Ue[A.key]||"",title:an[A.key]||A.label})}
      <div class="mhd-rail">
        ${A.places.map(Q=>ri(Q,{nearestPlaceId:M?.id||"",imageUrlFn:a})).join("")}
      </div>
    </section>
  `).join("")}function yt(){return`
    <section class="mhd-section">
      <div class="mhd-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>
  `}function si(){return`
    <div class="mhd">
      ${yt()}
      ${yt()}
      ${yt()}
    </div>
  `}function ii(o={},s="€"){const d=V(o.priceLabel||o.priceText);if(d)return d;const a=Number(o.price??o.startingPrice??o.pricePerNight);if(!Number.isFinite(a)||a<=0)return"";const m=V(o.currency||o.currencyCode)||s;return m==="€"||m.toUpperCase()==="EUR"?`€${a}`:`${a} ${m}`}function oi(o=[]){const s=(Array.isArray(o)?o:[]).filter(d=>V(d?.label));return s.length?`
    <div class="mhd-distance">
      ${s.map(d=>`<span>${ie(d.icon||"check","mhd-icon--sm")}${N(d.label)}</span>`).join("")}
    </div>
  `:""}function li({rooms:o=[],offers:s=[],imageUrlFn:d=null}={}){const a=(Array.isArray(o)&&o.length?o:Array.isArray(s)?s:[]).filter(m=>m&&m.active!==!1&&V(m.title));return a.length?`
    <section class="mhd-section">
      ${Be({iconName:"bed",eyebrow:Ue.rooms,title:"Dhoma"})}
      <div class="mhd-rail">
        ${a.map(m=>{const p=V(m.imageUrl),M=p&&typeof d=="function"&&V(d(p))||p,U=ii(m);return`
            <article class="mhd-card">
              <div class="mhd-photo">${M?`<img src="${N(M)}" alt="${N(m.title)}" loading="lazy" decoding="async" />`:""}</div>
              <div class="mhd-card-body">
                ${V(m.tag||m.badge)?`<span class="mhd-pill mhd-pill--accent">${N(m.tag||m.badge)}</span>`:""}
                <div class="mhd-heading-price">
                  <h3>${N(m.title)}</h3>
                  ${U?`<span class="mhd-price"><strong>${N(U)}</strong><small>/ natë</small></span>`:""}
                </div>
                ${oi(m.metaParts)}
                ${V(m.text||m.description)?`<p class="mhd-copy">${N(m.text||m.description)}</p>`:""}
              </div>
            </article>
          `}).join("")}
      </div>
    </section>
  `:""}function ci({city:o="",address:s="",imageUrl:d="",imageUrlFn:a=null}={}){const m=V(o);if(!m)return"";const p=V(d),M=p&&typeof a=="function"&&V(a(p))||p;return`
    <section class="mhd-section">
      ${Be({iconName:"building",eyebrow:Ue.city,title:an.city})}
      <div class="mhd-rail">
        <article class="mhd-card">
          <div class="mhd-photo">${M?`<img src="${N(M)}" alt="${N(m)}" loading="lazy" decoding="async" />`:""}</div>
          <div class="mhd-card-body">
            <span class="mhd-pill">${N(an.city)}</span>
            <h3>${N(m)}</h3>
            ${V(s)?`<p class="mhd-copy">${N(s)}</p>`:""}
          </div>
        </article>
      </div>
    </section>
  `}function di(o=""){const s=V(o).toLowerCase();for(const d of ti)if(d.keywords.some(a=>s.includes(a)))return d.icon;return"check"}function ui({amenities:o=[]}={}){const s=(Array.isArray(o)?o:[]).map(d=>V(d)).filter(Boolean);return s.length?`
    <section class="mhd-section">
      ${Be({iconName:"check",eyebrow:Ue.amenities,title:"Përfshihet"})}
      <div class="mhd-amenities">
        ${s.slice(0,12).map(d=>`
          <article class="mhd-amenity">
            <span class="mhd-amenity-icon">${ie(di(d))}</span>
            <h3>${N(d)}</h3>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}const sn="mnyraHotelDetailMap";function pi({address:o="",city:s="",destinationName:d="",mapsUrl:a="",hotelCoords:m=null,hotelName:p=""}={}){const M=[V(o),V(s)].filter(Boolean).join(", ")||V(d);if(!M&&!a)return"";const U=kt(m),Y=U?`id="${sn}" data-map-lat="${N(String(m.lat))}" data-map-lng="${N(String(m.lng))}" data-map-name="${N(V(p))}"`:"";return`
    <section class="mhd-section">
      ${Be({iconName:"compass",eyebrow:Ue.map,title:"Harta e zbulimit"})}
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
              <strong>${N(M||"Hotel")}</strong>
              ${V(d)?`<p>Plazhi, qyteti dhe vendet kryesore rreth ${N(d)}.</p>`:""}
            </div>
          </div>
          ${a?`<a class="mhd-primary" href="${N(a)}" target="_blank" rel="noopener noreferrer">${ie("expand","mhd-icon--sm")}Hap hartën</a>`:""}
        </div>
      </div>
    </section>
  `}function fi({rating:o="",reviewCount:s="",summary:d=""}={}){const a=Number(V(o).replace(",","."));if(!Number.isFinite(a)||a<=0)return"";const m=Math.max(1,Math.min(5,Math.round(a))),p=Array.from({length:m}).map(()=>`<svg class="mhd-icon mhd-star" viewBox="0 0 24 24" aria-hidden="true">${rn.star}</svg>`).join(""),M=V(s);return`
    <section class="mhd-section">
      ${Be({iconName:"star",eyebrow:Ue.rating,title:"Vlerësimet"})}
      <div class="mhd-rating">
        <div class="mhd-score">
          <strong>${N(a.toFixed(1))}</strong>
          <div>
            <div class="mhd-stars">${p}</div>
            <p>${N([d,M?`${M} vlerësime`:""].filter(Boolean).join(" · ")||"Nga vizitorët")}</p>
          </div>
        </div>
      </div>
    </section>
  `}function mi({rooms:o=[],offers:s=[],amenities:d=[],address:a="",city:m="",cityImageUrl:p="",destinationId:M="",destinationName:U="",destinationSectionsHtml:Y="",mapsUrl:L="",hotelCoords:A=null,hotelName:Q="",rating:xe="",reviewCount:Pe="",ratingSummary:Ae="",imageUrlFn:Je=null}={}){const we=!!V(M),Ct=Y||(we?yt():"");return`
    <div class="mhd">
      ${li({rooms:o,offers:s,imageUrlFn:Je})}
      <div id="${nn}" data-destination-id="${N(M)}" style="display:contents">
        ${Ct}
      </div>
      ${we?"":ci({city:m,address:a,imageUrl:p,imageUrlFn:Je})}
      ${ui({amenities:d})}
      ${pi({address:a,city:m,destinationName:U,mapsUrl:L,hotelCoords:A,hotelName:Q})}
      ${fi({rating:xe,reviewCount:Pe,summary:Ae})}
    </div>
  `}function Ie(o=""){return o==null?"":String(o).trim()}function ee(o=""){return Ie(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ze({id:o="",label:s="",value:d="",placeholder:a="",type:m="text",inputmode:p=""}={}){return`
    <label class="block">
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${ee(s)}</span>
      <input id="${ee(o)}" name="${ee(o)}" type="${ee(m)}" value="${ee(d)}" placeholder="${ee(a)}" ${p?`inputmode="${ee(p)}"`:""} class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
    </label>
  `}function gi(o={},{imagePreview:s=""}={}){const d=ee(o.id),a=Ie(s)||Ie(o.imageUrl);return`
    <div data-hotel-room-row="${d}" class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">${ee(o.title||"Dhomë e re")}</p>
        <button type="button" data-hotel-room-remove="${d}" class="w-9 h-9 rounded-xl bg-white text-slate-400 border border-slate-100 flex items-center justify-center text-xs font-black" aria-label="Fshi dhomën">✕</button>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-20 h-20 rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
          ${a?`<img id="hotelRoomImagePreview_${d}" src="${ee(a)}" alt="" loading="lazy" class="w-full h-full object-cover" />`:`<span id="hotelRoomImagePreview_${d}" class="text-[9px] font-black text-slate-300 uppercase">Foto</span>`}
        </div>
        <input type="file" id="hotelRoomImageInput_${d}" data-hotel-room-image-input="${d}" accept="image/*" hidden />
        <button type="button" data-hotel-room-image-trigger="${d}" class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Ngarko foto</button>
        <input type="hidden" id="hotelRoomImageUrl_${d}" value="${ee(o.imageUrl)}" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${ze({id:`hotelRoomTitle_${d}`,label:"Emri i dhomës",value:o.title,placeholder:"Dhomë Deluxe me pamje nga deti"})}
        ${ze({id:`hotelRoomPrice_${d}`,label:"Çmimi / natë (€)",value:o.price==null?"":String(o.price),placeholder:"118",inputmode:"decimal"})}
        ${ze({id:`hotelRoomPersons_${d}`,label:"Persona",value:o.persons==null?"":String(o.persons),placeholder:"2",inputmode:"numeric"})}
        ${ze({id:`hotelRoomBeds_${d}`,label:"Krevate",value:o.beds,placeholder:"1 king"})}
        ${ze({id:`hotelRoomSize_${d}`,label:"Madhësia (m²)",value:o.size==null?"":String(o.size),placeholder:"31",inputmode:"numeric"})}
        ${ze({id:`hotelRoomTag_${d}`,label:"Etiketa (opsionale)",value:o.tag,placeholder:"Më e zgjedhura"})}
      </div>
      <label class="block">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Përshkrimi (opsional)</span>
        <textarea id="hotelRoomDesc_${d}" name="hotelRoomDesc_${d}" rows="2" placeholder="Detaje të shkurtra për dhomën..." class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${ee(o.description)}</textarea>
      </label>
      <label class="flex items-center justify-between gap-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktive në profil</span>
        <input id="hotelRoomActive_${d}" type="checkbox" ${o.active!==!1?"checked":""} class="w-5 h-5 accent-slate-900" />
      </label>
    </div>
  `}function bi({restaurantId:o="",record:s={},editorState:d={}}={}){const a=Ie(o);if(!a)return"";const m=Ie(d.restaurantId)===a,p=m&&Array.isArray(d.rooms)?ia(d.rooms):ia(s?.hotelRooms),M=m&&d.imagePreviews&&typeof d.imagePreviews=="object"?d.imagePreviews:{},U=m&&d.saving===!0,Y=m?Ie(d.status):"";return`
    <div data-hotel-rooms-editor="${ee(a)}" class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
          <h3 class="text-xl font-black italic tracking-tighter">Dhomat</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dhomat shfaqen te detajet e hotelit</p>
        </div>
        <button type="button" id="hotelRoomAddBtn" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95 text-lg font-black" aria-label="Shto dhomë">+</button>
      </div>
      ${p.length?`<div class="space-y-4">${p.map(L=>gi(L,{imagePreview:Ie(M[L.id])})).join("")}</div>`:'<p class="text-sm font-bold text-slate-400">Ende pa dhoma. Shto dhomën e parë me +.</p>'}
      ${Y?`<p class="text-[10px] font-black uppercase tracking-widest ${Y.includes("ruajt")?"text-emerald-600":"text-slate-500"}">${ee(Y)}</p>`:""}
      <button id="hotelRoomsSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${U?"disabled":""}>
        ${U?"Po ruhen...":"Ruaj Dhomat"}
      </button>
    </div>
  `}const hi=Object.freeze({apiKey:"AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",authDomain:"menyra-c0e68.firebaseapp.com",projectId:"menyra-c0e68",storageBucket:"menyra-c0e68.firebasestorage.app",messagingSenderId:"528471049588",appId:"1:528471049588:web:c507d87c0832562a855821",measurementId:"G-YLFKC8726B"});function vi(){try{const o=String(globalThis?.location?.hostname||"").trim().toLowerCase();if(!["localhost","127.0.0.1","::1"].includes(o))return null;const s=globalThis?.__MENYRA_FIREBASE_EMULATORS__,d=s&&typeof s=="object"?s:{},a=new URLSearchParams(globalThis?.location?.search||"").get("firebase-emulator")==="1";if(d.enabled!==!0&&!a)return null;const m=String(d.projectId||"mnyra-local").trim();return/^(mnyra-local|demo-|test-|local-)/.test(m)?Object.freeze({projectId:m,host:String(d.host||"127.0.0.1").trim()||"127.0.0.1",firestorePort:Math.max(1,Number(d.firestorePort||8080)||8080),authPort:Math.max(1,Number(d.authPort||9099)||9099),functionsPort:Math.max(1,Number(d.functionsPort||5001)||5001)}):null}catch{return null}}const ue=vi(),en=Object.freeze(ue?{apiKey:"mnyra-local-api-key",authDomain:`${ue.projectId}.firebaseapp.com`,projectId:ue.projectId,storageBucket:`${ue.projectId}.appspot.com`,messagingSenderId:"000000000000",appId:"1:000000000000:web:mnyra-local"}:hi),fa=new WeakSet,ma=new WeakSet;function xi({firestore:o=null,authInstance:s=null}={}){return ue?(o&&!fa.has(o)&&(_s(o,ue.host,ue.firestorePort),fa.add(o)),s&&!ma.has(s)&&(Fs(s,`http://${ue.host}:${ue.authPort}`,{disableWarnings:!0}),ma.add(s)),!0):!1}function wi(){try{const o=js();if(o?.options?.projectId===en.projectId&&o?.options?.appId===en.appId)return o}catch{}return Ls(en)}const St=wi();function yi(){try{return globalThis?.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__===!0}catch{return!1}}let It;try{const o=yi();It=ws(St,{experimentalAutoDetectLongPolling:!0,localCache:o?ys():$s({tabManager:ks()})});try{globalThis.__MENYRA_FIRESTORE_LOCAL_CACHE_KIND__=o?"memory-public-website":"persistent-multitab"}catch{}}catch{It=Ss(St)}let on;try{on=Is(St,{persistence:[Cs,Ps,As]})}catch{on=Ts(St)}xi({firestore:It,authInstance:on});const $i="destinationsPublic",xa="menyra_social_destination_public_cache_v1::",ki=360*60*1e3,$t=new Map,wt=new Map;function De(o=""){return o==null?"":String(o).trim()}function wa(o="",s={}){const d=s&&typeof s=="object"?s:{},a=Array.isArray(d.places)?d.places:[];return a.length?{id:De(o),name:De(d.name),slug:De(d.slug),description:De(d.description),version:Math.max(0,Number(d.version)||0),places:a}:null}function Si(o=""){try{const s=localStorage.getItem(`${xa}${o}`);if(!s)return null;const d=JSON.parse(s);return!d||typeof d!="object"||Date.now()-Number(d.storedAt||0)>ki?null:wa(o,d.data)}catch{return null}}function Ii(o="",s=null){try{localStorage.setItem(`${xa}${o}`,JSON.stringify({storedAt:Date.now(),data:s}))}catch{}}function ya(o=""){const s=De(o);if(!s)return null;if($t.has(s))return $t.get(s);const d=Si(s);return d&&$t.set(s,d),d}async function Ci(o=""){const s=De(o);if(!s)return null;const d=ya(s);if(d)return d;if(wt.has(s))return wt.get(s);const a=(async()=>{try{const m=await Ms(Es(It,$i,s)),p=m.exists()?wa(s,m.data()||{}):null;return $t.set(s,p),p&&Ii(s,m.data()||{}),p}catch{return null}finally{wt.delete(s)}})();return wt.set(s,a),a}const ga="menyra_social_business_type_hint_v1";function Ce(o=""){return o==null?"":String(o).trim()}function ba(o={},{extraSlugs:s=[]}={}){const d=o&&typeof o=="object"?o:{},a=[],m=(p="")=>{p&&!a.includes(p)&&a.push(p)};return[d.restaurantId,d.canonicalRestaurantId,d.landingRestaurantId].map(p=>Ce(p)).filter(Boolean).forEach(p=>m(`r:${p}`)),[d.publicSlug,d.landingSlug,d.handle,d.slug,d.businessSlug].map(p=>Ce(p).replace(/^@+/,"").toLowerCase()).filter(Boolean).forEach(p=>m(`s:${p}`)),(Array.isArray(s)?s:[]).map(p=>Ce(p).replace(/^@+/,"").toLowerCase()).filter(Boolean).forEach(p=>m(`s:${p}`)),a}function Pi(o={},s=[]){const d=o&&typeof o=="object"?o:{};for(const a of Array.isArray(s)?s:[]){const m=Ce(d[a]).toLowerCase();if(m)return m}return""}function Ai(o={},s=[],d=""){const a=o&&typeof o=="object"?{...o}:{},m=Ce(d).toLowerCase();if(!m||!Array.isArray(s)||!s.length)return{store:a,changed:!1};let p=!1;return s.forEach(M=>{a[M]!==m&&(a[M]=m,p=!0)}),{store:a,changed:p}}function Ti(o="",s=""){const d=Ce(o).toLowerCase();return d||Ce(s).toLowerCase()}function zi(o={}){const s=o.state,d=o.resolvePostCountsFn,a=o.escapeHtmlFn,m=o.getOptimizedImageUrlFn,p=o.iconFn,M=o.isLocalBusinessProfileFn,U=typeof o.isCeoUserFn=="function"?o.isCeoUserFn:(()=>!1),Y=o.normalizeHandleFn,L=o.logoFitClassFn,A=o.formatCountFn,Q=o.renderProfileShopCartViewFn,xe=o.renderProfileShopFavoritesViewFn,Pe=typeof o.ensurePostsDataForProfileFn=="function"?o.ensurePostsDataForProfileFn:(()=>{}),Ae=o.ensureMenuDataForProfileFn,Je=typeof o.ensureEditorMenuDataForProfileFn=="function"?o.ensureEditorMenuDataForProfileFn:(()=>{}),we=o.ensureFocusDataForProfileFn,Ct=typeof o.ensureAdsDataForProfileFn=="function"?o.ensureAdsDataForProfileFn:(()=>{}),cn=o.ensureTableQrStateForProfileFn,ae=o.isShopCatalogProfileFn,$a=o.getBusinessCatalogLabelFn,Te=o.normalizeMenuTypeFn,ka=o.primeMenuItemCountsFn,Sa=typeof o.hydrateMenuCardViewerLikesFn=="function"?o.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),Ia=o.renderShopProductListFn,Ca=o.getMenuLayoutThemeFn,Pa=o.menuLayoutColors,oe=o.resolveMenuItemHeroFn,J=o.isPlaceholderUrlFn,q=o.placeholderImage,Aa=o.getFirebaseStorageUrlFn,Ta=o.isDirectImageUrlFn,dn=o.formatPriceFn,ja=typeof o.resolveCurrencyCodeForMenuItemFn=="function"?o.resolveCurrencyCodeForMenuItemFn:(()=>""),un=o.getMenuItemImagesFn,Z=o.getMenuItemObjectPositionFn,Xe=o.getMenuItemSocialIdFn,pn=o.menuItemMetaKeyFn,fn=o.ensureMenuItemMetaFn,mn=o.resolveMenuItemCountsFn,Ze=o.getFocusStateForRestaurantFn,La=typeof o.getAdsStateForRestaurantFn=="function"?o.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),et=o.getTableQrStateForRestaurantFn,je=o.getFocusItemObjectPositionFn,Pt=o.getFocusCardClassFn,_a=o.getFocusIndexFn,ye=o.isRestaurantCafeProfileFn,At=typeof o.getBusinessProfileTypeFn=="function"?o.getBusinessProfileTypeFn:(()=>""),le=o.getRestaurantMetaByIdFn,Fa=o.buildUrlFn,Ma=o.normalizeSearchKeyFn,Ea=o.normalizeFollowHandleFn,pe={key:"",inFlightKey:""},gn=new Set,tt=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},Ra=({profile:e=null,routePayload:t=null,surface:n=null,decision:r=null}={})=>{if(!tt())return;const l=n&&typeof n=="object"?n:{},i=l.menu&&typeof l.menu=="object"?l.menu:{},c=e&&typeof e=="object"?e:{},u=t&&typeof t=="object"?t:{},f=u?.businessSnapshot?.identity||u?.identity||{},b=String(l.authoritativeRestaurantId||l.restaurantId||i.restaurantId||"").trim(),g=String(c.publicSlug||c.landingSlug||c.handle||f.publicSlug||f.landingSlug||f.handle||"").trim(),h=`${b||"pending"}::${g||"no-slug"}`;if(gn.has(h))return;gn.add(h);const x=Array.isArray(i.items)?i.items:[],w=new Set(x.map($=>String($?.category||"").trim()).filter(Boolean)).size,C=String(i.rawTruthState||i.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:b,slug:g,itemsLength:x.length,categoriesLength:w,menuStatus:String(i.status||"loading"),truthState:C,isLoading:r?.isLoading===!0,isHydrating:i.hydrating===!0||C.toLowerCase()==="hydrating",confirmedEmpty:i.confirmedEmpty===!0,canRenderItems:i.canRenderItems===!0,shouldRenderNoProducts:r?.shouldRenderNoProducts===!0,source:String(i.source||"")})},za=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},Tt=(e="")=>a(String(e||"")),Le=(e="")=>a(String(e??"")),re=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:n=""}={})=>{if(!tt())return"";const r=[e?`data-debug-renderer="${Tt(e)}"`:"",t?`data-debug-skeleton="${Tt(t)}"`:"",n?`data-debug-source="${Tt(n)}"`:""].filter(Boolean);return r.length?` ${r.join(" ")}`:""},Na=(e={},t=[])=>{const n=bs(e,t);return` ${[`data-menu-state="${Le(n.menuState)}"`,`data-menu-item-count="${Le(n.menuItemCount)}"`,`data-focus-state="${Le(n.focusState)}"`,`data-focus-business-id="${Le(n.focusBusinessId)}"`,`data-focus-item-count="${Le(n.focusItemCount)}"`,`data-focus-source="${Le(n.focusSource)}"`,`data-focus-stale="${n.focusStale?"true":"false"}"`].join(" ")}`},bn=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:n=null,routePayload:r=null,surface:l=null,decision:i=null,items:c=null,rawItems:u=null,filteredItems:f=null,renderDecision:b="",source:g=""}={})=>{const h=l&&typeof l=="object"?l:{},x=h.menu&&typeof h.menu=="object"?h.menu:{},w=h.focus&&typeof h.focus=="object"?h.focus:{},C=n&&typeof n=="object"?n:s?.profileView?.profile&&typeof s.profileView.profile=="object"?s.profileView.profile:{},$=r&&typeof r=="object"?r:s?.profileView?.routePayload&&typeof s.profileView.routePayload=="object"?s.profileView.routePayload:{},P=$?.businessSnapshot&&typeof $.businessSnapshot=="object"?$.businessSnapshot:{},T=P?.identity&&typeof P.identity=="object"?P.identity:$?.identity&&typeof $.identity=="object"?$.identity:{},k=s?.__webDirectEntry&&typeof s.__webDirectEntry=="object"?s.__webDirectEntry:{},S=String(C.publicSlug||C.landingSlug||C.handle||T.publicSlug||T.landingSlug||T.handle||k.publicSlug||"").trim(),_=String(C.restaurantId||$.restaurantId||k.restaurantId||"").trim(),F=String(C.canonicalRestaurantId||$.canonicalRestaurantId||h.authoritativeRestaurantId||k.canonicalRestaurantId||P.restaurantId||"").trim();let R="";C.canonicalRestaurantId?R="profile.canonicalRestaurantId":$.canonicalRestaurantId?R="routePayload.canonicalRestaurantId":h.authoritativeRestaurantId?R="surface.authoritativeRestaurantId":k.canonicalRestaurantId?R="webDirectEntry.canonicalRestaurantId":P.restaurantId?R="routeSnapshot.restaurantId":C.restaurantId?R="profile.restaurantId":$.restaurantId?R="routePayload.restaurantId":k.restaurantId&&(R="webDirectEntry.restaurantId");const I=String(F||h.restaurantId||x.restaurantId||_||"").trim(),z=Array.isArray(u)?u:Array.isArray(x.items)?x.items:[],B=Array.isArray(c)?c:z,O=Array.isArray(f)?f:B,y=new Set(O.map($e=>String($e?.category||"").trim()).filter(Boolean)).size,E=String(x.status||(i?.isLoading?"loading":"")||"").trim(),D=String(x.rawTruthState||x.truthState||"").trim(),H=x.confirmedEmpty===!0||i?.confirmedEmpty===!0,K=i?.hasError===!0||E==="error"||!!String(x.error||"").trim(),te=!(O.length>0||i?.hasItems===!0)&&!H&&!K,ne=F||_||I||"";return{component:e,functionName:t,slug:S,businessId:I,requestedRestaurantId:_,canonicalRestaurantId:F,restaurantIdSource:R,menuReadPath:ne?`restaurants/${ne}/public/menu`:"",activeTab:String(s?.activeTab||"").trim(),profileTopTab:String(s?.profileTopTab||"").trim(),profileContentTab:String(s?.profileContentTab||"").trim(),itemsLength:B.length,rawItemsLength:z.length,filteredItemsLength:O.length,categoriesLength:y,focusItemsLength:Array.isArray(w.items)?w.items.length:0,loading:x.loading===!0||i?.isLoading===!0||E==="loading",pending:te,hydrating:x.hydrating===!0||D.toLowerCase()==="hydrating",status:E,truthState:D,confirmedEmpty:H,canRenderItems:x.canRenderItems===!0,renderDecision:b||(i?.shouldRenderNoProducts?"no-products":i?.isLoading?"loading":""),source:g||String(x.source||""),buildToken:za()}},nt=(e={})=>{tt()&&console.warn("[mnyra:no-products-render]",{...bn(e),stack:new Error().stack})},at=(e="",t={})=>{tt()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...bn({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},v=(e,t=e,n={})=>gs(e,{fallback:t,params:n}),Da=(e="")=>{const t=String(e||"").trim();if(!t)return v("nav.menu","Menue");const n=t.toLowerCase();return n==="menue"||n==="menu"||n==="menü"?v("nav.menu",t):n==="shop"?"Shop":t},hn=(e="")=>{const t=String(e||"").trim();if(!t)return"";const n=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(n)?v("menu.products","Produkte"):t},Ua=(e="food",t=!1)=>t?v("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?v("menu.drinks","Getraenke"):v("menu.food","Speisen"),vn=(e={},t=!1)=>{const n=Te(e?.type||"food");return t?v("menu.product","Produkt"):n==="drink"?v("menu.drinkItem","Getraenk"):v("menu.foodItem","Speise")},jt=(e="",t="#111827")=>{const n=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(n)?n:t};function Ba(e=null,t=null){return We(s,{profile:e,routePayload:t,webDirectEntry:s?.__webDirectEntry}).restaurantId}function xn(e=null,t=""){if(!e||typeof e!="object")return e;const n=String(t||"").trim();if(!n)return e;const r=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===n&&r?e:{...e,restaurantId:n,...r?{canonicalRestaurantId:r}:{}}}function Oa(e=""){const t=String(e||"").trim();return t?We(s,{profile:s?.profileView?.profile||s?.userProfile,routePayload:s?.profileView?.routePayload,webDirectEntry:s?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function Oe(e={}){const t=String(ja(e)||"").trim();return t?dn(e?.price,t):dn(e?.price)}function Ha(e=[],t="",n=""){const r=String(t||"").trim(),l=String(n||"").trim();if(!r||!l)return"";const i=Array.isArray(e)?e:[];if(!i.length)return`${r}|${l}|empty`;const c=[];return i.forEach(u=>{const f=String(Xe(u)||u?.id||"").trim();f&&c.push(f)}),c.length?(c.sort(),`${r}|${l}|${c.join(",")}`):`${r}|${l}|empty`}function Va(e=[],t=""){const n=String(s.user?.uid||"").trim(),r=Ha(e,t,n);r&&pe.inFlightKey!==r&&pe.key!==r&&(pe.key=r,pe.inFlightKey=r,Sa(e,t).catch(l=>{console.error(l),pe.key===r&&(pe.key="")}).finally(()=>{pe.inFlightKey===r&&(pe.inFlightKey="")}))}function Ka(e={}){const t=String(e?.uid||"").trim();if(t&&s.followingTargetIds.includes(t))return!0;const n=String(e?.restaurantId||"").trim();if(n&&s.followingTargetIds.includes(n))return!0;const r=Ea(e?.handle||"");return!!(r&&s.followingHandles.includes(r))}function wn(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const n=typeof le=="function"&&le(t)||null;return n?.specialEnabled===!0?!0:(n?.specialEnabled===!1,!1)}function qa(e={}){return be(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function yn(e,t,n=!0,{includeImageKey:r=!0}={}){const l=d(e),i=e.id?String(e.id):"",c=i?`data-open-post="${a(i)}"`:"",u=i?`data-post-like-count="${a(i)}"`:"",f=i?`data-post-comment-count="${a(i)}"`:"",b=r&&i?`data-img-key="profile-post:${a(i)}"`:"",g=e.type==="wide"||e.type==="hero",h=t&&g?"col-span-2":"",x=t&&g?"aspect-[1.8/1]":"aspect-[4/5]",w=g?800:400,C=g?400:500,$=String(e.posterUrl||e.thumbUrl||e.poster||"").trim(),P=e.isVideo===!0,T=P&&$?$:e.url,k=m(T,g?"large":"medium",{stableKey:i?`profile-post:${i}`:"",variantGroup:"post-detail"}),S=String(e.url||"").trim(),_=S&&!S.includes("#")?`${S}#t=0.001`:S,F=P&&!$&&S?`<video src="${a(_)}" preload="metadata" muted playsinline webkit-playsinline width="${w}" height="${C}" ${b} class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${a(k)}" loading="lazy" decoding="async" width="${w}" height="${C}" ${b} class="w-full h-full object-cover" />`;return`
    <div ${c} role="button" tabindex="0" class="${h} relative ${x} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        ${F}
        ${e.isVideo?`<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${p("play","w-3.5 h-3.5 fill-white block")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${p("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${u} class="text-[10px] font-bold tracking-wide">${a(l.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${p("message-circle","w-3 h-3 text-indigo-200")}
                <span ${f} class="text-[10px] font-bold tracking-wide">${a(l.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${i&&n?`
        <button type="button" data-profile-menu-button="${a(i)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${p("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${a(i)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${a(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${p(g?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${g?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${a(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${p("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function Lt(e,t,n=!0,{includeImageKeys:r=!0}={}){const l=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${p("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(v("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const i=e.map(u=>yn(u,l,n,{includeImageKey:r})),c=e.reduce((u,f)=>{const b=f?.type==="wide"||f?.type==="hero";return u+(b?2:1)},0);return l&&c%2===1&&i.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),i.join("")}function _t(){const e=s.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const n=m(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${a(n)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${a(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${p("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${a(t.city||"Stadt")}
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
        <p class="text-slate-400 text-sm font-bold tracking-wide">${a(v("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function _e(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}let fe=null;function $n(){if(fe)return fe;if(typeof localStorage>"u")return fe={},fe;try{const e=localStorage.getItem(ga),t=e?JSON.parse(e):{};fe=t&&typeof t=="object"?t:{}}catch{fe={}}return fe}function Ft(e={},t=""){const n=ba(e);if(!n.length)return;const{store:r,changed:l}=Ai($n(),n,t);if(l&&(fe=r,!(typeof localStorage>"u")))try{localStorage.setItem(ga,JSON.stringify(r))}catch{}}const Ga=new Set(["feed","search","discover","map","location","user","waiter","wr","leads","admin","ceo","owner","staff","kitchen","profile","menu","orders","notifications","settings","upload","customers","business-accounts","businessaccounts","chat","social","heart","hub","apps","api","shared","assets","_shared","core","login","register","post","posts","story","stories","manifest","sw","favicon","robots","sitemap","b","lp"]);function kn(){try{const t=String(globalThis?.location?.pathname||"").replace(/^\/+|\/+$/g,"").split("/").filter(Boolean);let n=String(t[0]||"").trim();try{n=decodeURIComponent(n)}catch{}return n=n.trim().toLowerCase(),!n||n.includes(".")||Ga.has(n)?"":n}catch{return""}}function rt(e={}){const t=String(At(e)||"").trim().toLowerCase();return t?(Ft(e,t),t):Ti("",Pi($n(),ba(e,{extraSlugs:[kn()]})))}function He(e={}){const t=rt(e);if(t==="hotel"||t==="motel")return!0;if(t)return!1;const n=Fe(e);return Xt(n).length>0||!!String(n.destinationId||"").trim()?(Ft(e,"hotel"),!0):!1}function Fe(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),n=t?le(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{}}}function Ya(e={},t=""){const n=e&&typeof e=="object"?e:{},r=String(n.id||n._id||n.offerId||n.menuItemId||t||"offer").trim();return{...n,id:r,menuItemId:String(n.menuItemId||n.targetMenuItemId||n.itemId||n.targetItemId||"").trim(),title:n.title||n.name||"Oferta",text:n.text||n.desc||n.description||"",imageUrl:n.imageUrl||n.image||n.photoUrl||"",active:n.active!==!1}}function Sn(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],n=new Set;return t.map((r,l)=>Ya(r,`offer_${l}`)).filter(r=>{const l=String(r.id||`${r.title}|${r.text}|${r.imageUrl}`).trim();return!l||n.has(l)?!1:(n.add(l),!0)})}function Wa(e={}){const t=Fe(e),n=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!n)return!1;const r=s.focus&&typeof s.focus=="object"?s.focus:{},l=String(r.restaurantId||"").trim()===n,i=String(r.truthSource||"").trim().toLowerCase();if(l&&i==="public-menu"||(l&&Array.isArray(r.items)?r.items:[]).length)return!1;const u=Sn(t);return u.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(s.focus={...r,restaurantId:n,items:u,enabled:r.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:u.length?"seeded":"knownEmpty"},!0):!1}function Qa(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const n of t){if(!n||typeof n!="object")continue;const r=Number(n.lat??n.latitude),l=Number(n.lng??n.lon??n.longitude);if(Number.isFinite(r)&&Number.isFinite(l))return{lat:r,lng:l}}return null}function X(e={},t=[]){for(const n of t){const r=String(e?.[n]||"").trim();if(r)return r}return""}function st(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function Ja(e={}){const t=[...st(e.coverImages),...st(e.hotelCoverImages),...st(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(r=>String(r||"").trim()).filter(Boolean),n=[];return t.forEach(r=>{n.includes(r)||n.push(r)}),n.slice(0,8)}function Xa(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Za(e=""){const t=String(e||"").trim(),n=s.hotelCardEditor&&typeof s.hotelCardEditor=="object"?s.hotelCardEditor:{},r=String(n.restaurantId||"").trim();return r?r===t?n:{}:Xa(n)?{}:n}function er(e={}){const t=Array.isArray(e.features)?e.features.map(r=>String(r||"").trim()).filter(Boolean):[],n=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[X(e,["hotelFeatureOneText","gardenTerraceText"])||String(n.gardenTerrace||"").trim()||t[0]||"",X(e,["hotelFeatureTwoText","accessibilityText"])||String(n.accessibility||"").trim()||t[1]||"",X(e,["hotelFeatureThreeText","veganOptionsText"])||String(n.veganOptions||"").trim()||t[2]||""]}function In(e={}){const t=[],n=(r="")=>{const l=String(r||"").trim();l&&!t.includes(l)&&t.push(l)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(r=>{Array.isArray(r)&&r.forEach(l=>{typeof l=="string"?n(l):l&&typeof l=="object"&&n(l.label||l.name||l.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&n("Në plazh"),(e.restaurant||e.hasRestaurant)&&n("Restaurant"),(e.breakfast||e.breakfastIncluded)&&n("Mëngjes"),(e.pool||e.hasPool)&&n("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&n("WLAN"),(e.parking||e.freeParking||e.hasParking)&&n("Parking"),(e.spa||e.wellness)&&n("Wellness"),t.slice(0,8)}const tr=[{value:"m",label:"m"},{value:"km",label:"km"}],nr="Në qendër",ar="Në plazh",rr=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],sr=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],ir=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function me(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function or(e="",{direct:t=!1}={}){const n=String(e||"").trim(),r=me(n),l=t||r==="ne_qender"||r==="ne_plazh"||r==="direkt_ne_qender"||r==="direkt_ne_plazh"||r.includes("direkt")&&(r.includes("strand")||r.includes("zentrum")||r.includes("center"))||r.includes("am_strand")||r.includes("im_zentrum"),i=n.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),c=i?i[1].replace(",","."):"",f=(i?String(i[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:c,unit:f,isDirect:l}}function Cn({idPrefix:e="",iconName:t="navigation",label:n="",value:r="",directLabel:l="",direct:i=!1}={}){const c=or(r,{direct:i});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${p(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(l)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${a(e)}Value" type="number" min="0" step="0.1" value="${a(c.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${a(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${tr.map(u=>`<option value="${a(u.value)}" ${c.unit===u.value?"selected":""}>${a(u.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${a(l)}</span>
        <input id="${a(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${c.isDirect?"checked":""} />
      </label>
    </div>
  `}function lr(e=[],t=""){const n=String(t||"").trim(),r=new Set(e.map(me));return`
    <option value="">Zgjidh</option>
    ${e.map(l=>`<option value="${a(l)}" ${me(l)===me(n)?"selected":""}>${a(l)}</option>`).join("")}
    ${n&&!r.has(me(n))?`<option value="${a(n)}" selected>Aktuale: ${a(n)}</option>`:""}
  `}function Mt({id:e="",iconName:t="badge-check",label:n="",value:r="",options:l=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${p(t,"w-4 h-4")}
        </div>
        <label for="${a(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${a(n)}</label>
      </div>
      <select id="${a(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${lr(l,r)}
      </select>
    </div>
  `}function cr(e={},t=[]){const n=new Set(t.map(me).filter(Boolean)),r=[],l=(i="")=>{const c=String(i||"").trim();if(!c)return;const u=me(c);n.has(u)||r.some(f=>me(f)===u)||r.push(c)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(i=>st(i).forEach(l)),r}function dr({existingImages:e=[],newPreviews:t=[],imageUrlDraft:n=""}={}){const r=[...t.map((c,u)=>({src:c,kind:"new",idx:u})),...e.map((c,u)=>({src:c,kind:"existing",idx:u}))].filter(c=>c.src),l=r[0]?.src||n||"",i=l?m(l,"large"):q;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${a(i||q)}" class="w-full h-52 object-cover bg-white" />
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
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${r.length}</span>
        </div>
        ${r.length?`
          <div class="grid grid-cols-3 gap-2">
            ${r.map(c=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${c.kind==="existing"?`<span data-hotel-card-existing-image="${a(c.src)}" hidden></span>`:""}
                <img src="${a(m(c.src,"thumb"))}" class="w-full h-full object-cover" />
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

      <input id="hotelCardCoverImageUrl" type="hidden" value="${a(n)}" />
    </div>
  `}function ur({destinationId:e="",overrides:t={},hotelCoords:n=null,manualBeachDistance:r=null}={}){const l=String(e||"").trim();if(!l||typeof document>"u")return;const i=f=>pa({template:f,overrides:t,hotelCoords:n,imageUrlFn:b=>m(b,"medium"),manualBeachDistance:r});let c=0;const u=()=>{const f=document.getElementById(nn);if(!f){c++<20&&requestAnimationFrame(u);return}String(f.dataset.destinationId||"")===l&&f.dataset.destinationFilled!==l&&Ci(l).then(b=>{const g=document.getElementById(nn);!g||String(g.dataset.destinationId||"")!==l||(g.dataset.destinationFilled=l,g.innerHTML=b?i(b):"",b&&Pn(tn({places:b.places,overrides:t,hotelCoords:n})))}).catch(()=>{})};typeof requestAnimationFrame=="function"?requestAnimationFrame(u):queueMicrotask(u)}function Pn(e=[]){if(typeof document>"u")return;const t=document.getElementById(sn);t&&(typeof t.__mhdSetPlaces=="function"?t.__mhdSetPlaces(e):t.__mhdPlaces=Array.isArray(e)?e:[])}function pr(e=[]){if(typeof document>"u")return;let t=0;const n=()=>{const r=document.getElementById(sn);if(!r){t++<20&&requestAnimationFrame(n);return}if(Array.isArray(e)&&e.length&&Pn(e),r.dataset.mhdMapObserved==="1")return;r.dataset.mhdMapObserved="1";const l=()=>{ps(()=>import("./hotel-detail-map-runtime-DB741SQ-.js"),[]).then(i=>i.ensureHotelDetailMap({container:r})).catch(()=>{})};if(typeof IntersectionObserver=="function"){const i=new IntersectionObserver(c=>{c.some(u=>u.isIntersecting)&&(i.disconnect(),l())},{rootMargin:"240px"});i.observe(r)}else l()};typeof requestAnimationFrame=="function"?requestAnimationFrame(n):queueMicrotask(n)}function An(e={}){return Sn(e).filter(t=>t.active!==!1&&String(t.title||"").trim())}function fr(e={}){const t=e.beachfront===!0||e.onBeach===!0||e.amStrand===!0,n=X(e,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung"]);return!t&&!n?null:{label:n,direct:t}}function Tn(e={}){return!!(Xt(e).length||An(e).length||In(e).length||String(e.destinationId||"").trim()||X(e,["rating","reviewRating","stars","hotelStars"]))}const jn="mnyraHotelDetailsPendingRoot";let it="";function mr(e={},t=""){if(typeof document>"u"||typeof setTimeout!="function")return;const n=String(t||"").trim();if(!n||it===n)return;it=n;let r=0;const l=()=>{const i=document.getElementById(jn);if(!i||String(i.dataset.hotelDetailsPending||"")!==n){it="";return}if(!(!!(typeof le=="function"?le(n):null)||Tn(Fe(e)))&&r++<24){setTimeout(l,250);return}it="",i.removeAttribute("data-hotel-details-pending"),i.classList.add("animate-in","fade-in","duration-300"),i.innerHTML=Fn(e)};setTimeout(l,250)}const Ve="data-business-catalog-type-pending";let Ke="";function Ln(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.publicSlug||e?.handle||kn()||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"")}function gr(e={}){const t=s?.profileView?.profile;if(t&&typeof t=="object"&&_e(t))return t;const n=s?.userProfile;return n&&typeof n=="object"&&_e(n)?n:e&&typeof e=="object"?e:{}}function br(){document.querySelectorAll('[data-profile-tab="menu"]').forEach(e=>{e.setAttribute("data-profile-tab-surface","hotel-details"),e.textContent="Details"})}function _n(e="",t={}){if(typeof document>"u"||typeof setTimeout!="function")return;const n=String(e||"").trim();if(!n||Ke===n)return;Ke=n;let r=0;const l=()=>{const i=document.querySelector(`[${Ve}="${n}"]`);if(!i){Ke="";return}const c=gr(t),u=rt(c),f=He(c);if(!u&&!f){if(r++<40){setTimeout(l,300);return}Ke="",i.removeAttribute(Ve);return}Ke="",i.removeAttribute(Ve),f&&(Ft(c,u||"hotel"),i.classList.add("animate-in","fade-in","duration-300"),i.innerHTML=Et(c),br())};setTimeout(l,300)}function Et(e={}){const t=Fe(e),n=String(e?.canonicalRestaurantId||e?.restaurantId||t.canonicalRestaurantId||t.restaurantId||"").trim(),r=n&&typeof le=="function"?le(n):null;return n&&!r&&!Tn(t)?(ua(),mr(e,n),`
      <div id="${jn}" data-hotel-details-pending="${a(n)}" class="app-content-inline app-main-content-safe">
        ${si()}
      </div>
    `):`
    <div class="app-content-inline app-main-content-safe animate-in fade-in duration-300">
      ${Fn(e)}
    </div>
  `}function Fn(e={}){const t=Fe(e),n=Qa(t),r=X(t,["address","primaryAddress","location","formattedAddress","street"]),l=X(t,["city","locationCity","primaryCity","region","country"]),i=X(t,["rating","reviewRating","stars","hotelStars"]),c=X(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),u=X(t,["reviewSummary","ratingSummary","commentsSummary"]),f=In(t),b=An(t),g=Xt(t).map(S=>({...S,priceLabel:xs(S),metaParts:vs(S)})),h=String(t.destinationId||"").trim(),x=String(t.destinationName||"").trim(),w=va(t.destinationOverrides||{}),C=X(t,["name","restaurantName","businessName"])||"Hotel",$=n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.lat},${n.lng}`)}`:r||l?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r} ${l}`.trim())}`:"";ua();const P=fr(t),T=h?ya(h):null,k=T?pa({template:T,overrides:w,hotelCoords:n,imageUrlFn:S=>m(S,"medium"),manualBeachDistance:P}):"";return h&&!T&&ur({destinationId:h,overrides:w,hotelCoords:n,manualBeachDistance:P}),n&&pr(T?tn({places:T.places,overrides:w,hotelCoords:n}):[]),mi({rooms:g,offers:b,amenities:f,address:r,city:l,cityImageUrl:X(t,["titleImageUrl","coverImageUrl","heroUrl"]),destinationId:h,destinationName:x,destinationSectionsHtml:k,mapsUrl:$,hotelCoords:n,hotelName:C,rating:i,reviewCount:c,ratingSummary:u,imageUrlFn:S=>m(S,"medium")})}function hr(e={}){const t=Fe(e),n=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),r=t?.name||t?.restaurantName||e?.name||"Hotel",l=Za(n),i=String(l.status||"").trim(),c=l.saving===!0,u=Array.isArray(l.existingImages)?l.existingImages.map(z=>String(z||"").trim()).filter(Boolean):Ja(t),f=Array.isArray(l.imagePreviews)?l.imagePreviews.map(z=>String(z||"").trim()).filter(Boolean):[],b=String(l.imageUrlDraft||"").trim(),[g,h,x]=er(t),w=cr(t,[g,h,x]),C=X(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),$=X(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),P=X(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),T=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,k=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,S=l.detailsOpen===!0||c,_=f[0]||u[0]||"",F=_?m(_,"thumb"):q,R=[C,$,P?`${P} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",I=i.includes("fehl")||i.includes("Bitte")||i.includes("Nuk");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(r)}</p>
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
              ${p("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${S?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${a(F||q)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${a(r)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(R)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${S?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${p("chevron-right","w-4 h-4")}
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
                ${p("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${dr({existingImages:u,newPreviews:f,imageUrlDraft:b})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Cn({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:C,directLabel:nr,direct:T})}
              ${Cn({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:$,directLabel:ar,direct:k})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${a(P)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Mt({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:g,options:rr})}
              ${Mt({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:h,options:sr})}
              ${Mt({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:x,options:ir})}
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
        ${bi({restaurantId:n,record:t,editorState:s.hotelRoomsEditor&&typeof s.hotelRoomsEditor=="object"?s.hotelRoomsEditor:{}})}
        ${qt(n,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function ot(e={}){const t=String(s.profileTopTab||"").trim().toLowerCase(),n=String(s.profileContentTab||"").trim().toLowerCase();return _e(e)?t==="menu"?"menu":n==="menu"||n==="posts"?n:"posts":n==="media"||n==="checkins"?n:"posts"}function Rt(e={}){const t=String(s.profileTopTab||"").trim().toLowerCase();return _e(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(s.user?.uid||"").trim()?"favorites":"profile"}function Mn(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function vr(e=0,t=1){const n=Math.max(1,Number(t||0)||1),r=Math.round(Number(e||0));if(!Number.isFinite(r))return 0;const l=r%n;return l<0?l+n:l}function xr(e=0){return Mn(e)}function wr(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],n=Mn(s.profileLandingStep),r=vr(s.profileLandingGreetingIndex,t.length),l=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},i=String(l.businessName||e.name||"casarita").trim()||"casarita",c=jt(l.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),u=c&&c.toLowerCase()!=="#111827"?c:"",f=jt(l.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||c||"","#111827"),b=jt(l.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||u||"","#4f46e5"),g=i.replace(/\.+$/g,"").trim()||i,h=g.split(/\s+/).filter(Boolean),x=h.length>1?h.slice(0,-1).join(" "):g,w=h.length>1?h[h.length-1]:"",C=w?x:`${x}.`,$=w?`${w}.`:"",P=m(l.logoUrl||e.avatar||"","avatar"),k=String(P||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",S=String(l.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),_=String(l.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),F=n>=2,R=n>=3,I=Array.isArray(s.profileView?.posts)?s.profileView.posts:Array.isArray(e?.posts)?e.posts:[],z=xr(n),B=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${p("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(O=>{const y=z===O;return`
            <div data-landing-step-dot="${O}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${y?"1.22":"1"}); opacity: ${y?"1":"0.88"}; background: ${y?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${y?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${y?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${n===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${n===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((O,y)=>{const E=y===r,D=y===(r-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${y}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${E?"opacity: 1; transform: translateY(0) scale(1);":D?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!E&&!D?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${a(O)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${a(k)}" alt="${a(`${i} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${a(f)};">${a(C)}</span>${$?`<span style="color:${a(b)};">${a($)}</span>`:""}
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
          ${dt(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${B}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${n<2?"translate-y-full":n===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${n===2?"1":"0"}; pointer-events: ${n===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${F?dt(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${B}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${n<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${n===3?"1":"0"}; pointer-events: ${n===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${R?dt(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function zt(e=s.profileView?.profile||s.userProfile,{landingPreview:t=!1,selectedTabOverride:n="",compact:r=!1}={}){const l=_e(e),i=String(n||ot(e)).trim().toLowerCase()||"posts",c=He(e),u=ae(e),f=c?"Details":u?"Shop":v("nav.menu","Menue"),b=l?[{id:"posts",label:v("profile.posts","Beitraege")},{id:"menu",label:f,surface:c?"hotel-details":"menu"}]:[{id:"posts",label:v("profile.posts","Beitraege")},{id:"media",label:v("profile.media","Medien")},{id:"checkins",label:v("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${r?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${b.map(g=>`
          <button data-profile-tab="${g.id}" ${g.surface?`data-profile-tab-surface="${a(g.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${i===g.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${g.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function Nt(e=s.profileView?.profile||s.userProfile,{disabled:t=!1}={}){const n=ot(e);return n==="checkins"||n==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${a(v("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${s.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${p("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${s.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${p("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function G(e=""){return String(e||"").trim()}const En="mnyra_business_title_image_cache_v1",Rn=80;function zn(){if(!s)return{};const e=s.businessTitleImageCache&&typeof s.businessTitleImageCache=="object"?s.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const r=(typeof window<"u"?window.localStorage:null)?.getItem?.(En)||"",l=r?JSON.parse(r):{};l&&typeof l=="object"&&Object.entries(l).forEach(([i,c])=>{const u=G(i),f=G(c);u&&f&&!J(f)&&(t[u]=f)})}catch{}return s.businessTitleImageCache={loaded:!0,items:t},t}function yr(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(En,JSON.stringify(e))}catch{}}function $r(e={},t="business"){const n=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(r=>G(r)).filter(Boolean);return[...new Set(n)]}function kr(e=[],t=""){const n=G(t);if(!n||J(n))return;const r=zn();let l=!1;e.forEach(c=>{const u=G(c);!u||r[u]===n||(r[u]=n,l=!0)});const i=Object.entries(r);if(i.length>Rn){const c=i.slice(i.length-Rn);Object.keys(r).forEach(u=>delete r[u]),c.forEach(([u,f])=>{r[u]=f}),l=!0}l&&yr(r)}function Sr(e=[]){const t=zn();for(const n of e){const r=G(n),l=r?G(t[r]):"";if(l&&!J(l))return l}return""}function Ir(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function Cr(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function Pr(e={}){const n=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(r=>String(r||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||n||"").trim()}function Ar(e={},t={}){const n=Pr(e),r=Array.isArray(t.cacheKeys)?t.cacheKeys:[],l=G(t.stableKey||r[0]||"");if(!n){if(t.allowCacheFallback===!0){const c=Sr(r);if(c)return c;const u=l?m("","medium",{stableKey:l}):"";return u&&!J(u)?u:""}return""}const i=m(n,"medium",l?{stableKey:l}:void 0);return i&&!J(i)?(kr(r,i),i):""}function Nn(e="",t=""){const n=G(e);if(!n)return"";if(/^https?:\/\//i.test(n))return n;const r=n.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return r?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(r)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(r)}`:"":""}function Tr(e=""){const t=G(e);if(!t)return"";const n=t.replace(/[^\d+]/g,"");return n?`tel:${n}`:""}function jr(e={}){const t=Number(e?.gpsLat??e?.lat),n=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(n))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${n}`)}`;const r=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(l=>G(l)).filter(Boolean).join(", ");return r?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r)}`:""}function lt({href:e="",label:t="",iconName:n="",body:r="",buttonAttrs:l=""}={}){const i=G(e),c=String(l||"").trim();if(!i&&!c)return"";const u=r||p(n,"w-4 h-4"),f="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return c?`
    <button type="button" ${c} title="${a(t)}" aria-label="${a(t)}" class="${f}">
      ${u}
    </button>
  `:`
    <a href="${a(i)}" target="_blank" rel="noreferrer" title="${a(t)}" class="${f}">
      ${u}
    </a>
  `}function ct({href:e="",buttonAttrs:t="",iconName:n="",eyebrow:r="",value:l=""}={}){const i=G(l);if(!i)return"";const c=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${p(n,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${a(r)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a(i)}</span>
    </div>
  `;return e?`<a href="${a(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</button>`}function Lr({profileName:e="",safeBio:t="",metaLine:n="",identityPending:r=!1,followersLabel:l=""}={}){return`
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
          ${r?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${a(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function Dn(e={},t={}){const n=t.mode==="self"?"self":"public",r=t.disabledBlockClass||"",l=Ir(e,n),i=n==="self"?"avatar:self":`avatar:public:${l}`,c=t.avatarUrl||m(e.avatar||"","avatar",{stableKey:i}),u=t.avatarFit||L(!!e.restaurantId),f=String(s?.profileCardInfoOpen||"")===l,b=Number(s?.profileCardInfoHeights?.[l]||0),g=f&&Number.isFinite(b)&&b>0?`height:${Math.ceil(b)}px;`:"",h=t.avatarImgKeyAttr||(n==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${a(l)}"`),x=t.renderAvatarImage===!0?!!String(c||"").trim()&&!J(c):t.renderAvatarImage!==!1&&!!String(c||"").trim()&&!J(c)&&!!String(e?.avatar||"").trim(),w=!!t.identityPending,C=t.followersLabel??A(e.followers),$=G(e?.name)||"User",P=G(t.typeLabel||e?.customerType||e?.type||"Business"),T=G(e?.location||"-"),k=n==="public"?`${T} / ${P}`:T,S=t.bioHtml||a(e?.bio||"").replace(/\n/g,"<br>")||a(v("profile.noBio","Noch keine Bio.")),_=`business-cover:${l}`,F=$r(e,l),R=Ar(e,{cacheKeys:F,stableKey:_,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),I=jr(e),z=Cr(e),B=lt(z?{buttonAttrs:`data-marketplace-open-map="${a(z)}"`,label:v("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:I,label:v("profile.openMap","Karte oeffnen"),iconName:"map"}),O=Nn(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),y=Nn(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),E=G(e?.phone||e?.telephone||e?.contactPhone||""),D=Tr(E),H=G(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(te=>G(te)).filter(Boolean).join(", ")),K=[ct({href:O,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),ct({href:y,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),W=n==="self"?`
      <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${p("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${p("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle||"")}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?p("check","w-4 h-4"):""}
          ${a(t.followLabel||v("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${p("message-circle","w-5 h-5")}
      </button>
    `;if(f){const te=[ct({href:D,iconName:"phone",eyebrow:v("profile.call","Anrufen"),value:E}),ct({href:I,iconName:"map-pin",eyebrow:v("profile.address","Adresse"),value:H||T}),K].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${a(l)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${r}" style="${g}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${Lr({profileName:$,safeBio:S,metaLine:k,identityPending:w,followersLabel:C})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${a(l)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${p("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${a(v("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${a(T)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${te||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${a(v("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${a(l)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${a(v("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${a(l)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${r}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${R?`<img src="${a(R)}" data-img-key="${a(_)}" alt="${a($)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${p("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${B}
          ${lt({href:y,label:"TikTok",iconName:"music-2"})}
          ${lt({href:O,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${n==="self"?'id="profileAvatarTrigger"':""} class="relative ${n==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${x?`<img src="${a(c)}" data-fallback-src="${a(q)}" decoding="async" width="100" height="100" ${h} class="w-full h-full rounded-[1.8rem] ${u} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${w?"animate-pulse":""}">${p("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${p("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${w?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(String(C))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${a(l)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${p("info","w-5 h-5")}</span>
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
  `}function dt(e={},t=[],{topTabOverride:n="",tutorialMode:r=!1,contentTabOverride:l="",landingHideContent:i=!1,collapseIdentity:c=!1,contentReveal:u=!1,landingMode:f=!1}={}){const b=Ka(e),g=!!e.privateAccount&&e.uid&&String(e.uid)!==String(s.user?.uid||"")&&!b,h=!!e.pendingFollowRequest&&!b,x=e.restaurantId?"Business":v("nav.user","User"),w=String(e.handle||Y(e.name||"user")).replace(/^@/,""),$=a(e.bio||"").replace(/\n/g,"<br>")||a(v("profile.noBio","Noch keine Bio.")),P=_e(e),T=String(n||Rt(e)).trim().toLowerCase()||"profile",k=String(l||ot(e)).trim().toLowerCase()||"posts",S=k==="menu",_=k==="checkins",F=t,I={...s?.profileView&&typeof s.profileView=="object"?s.profileView:{},profile:e,posts:Array.isArray(F)?F:[]},z=hs(s,{profileView:I,profileTopTab:T,profileContentTab:k}),B=String(z?.header?.status||"").trim().toLowerCase()||"loading",O=String(z?.posts?.status||"").trim().toLowerCase()||"loading",y=e.uid||e.restaurantId||w||"public",E=`avatar:public:${y}`,D=String(e?.avatar||"").trim(),H=m(D,"avatar",{stableKey:E}),K=L(!!e.restaurantId),W=f?"":`data-img-key="avatar:public:${a(y)}"`,te=!D&&!!String(H||"").trim()&&!J(H),ne=!!D||te&&Qe(B),$e=Re=>{if(Re==null)return!1;const Se=Number(Re);return Number.isFinite(Se)&&Se>=0},Qt=ne||$e(e?.followers)||$e(e?.following),ce=Qe(B)&&!Qt,ke=!!String(H||"").trim()&&!J(H)&&ne,mt=ce?"...":A(e.followers),gt=ce?"...":A(e.following),bt=P?"pt-2":"pt-10",ht=b?v("profile.following","Following"):h?v("profile.requested","Requested"):g?v("profile.request","Request"):v("profile.follow","Follow"),Ge=b?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":h?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",Ye=r?"select-none":"app-main-content-safe",de=r?"pointer-events-none":"",se=!c,ra=!i,vt=u?f?"transition-opacity duration-200":"animate-in fade-in duration-300":"",sa=k==="posts"&&F.length>0,ds=k!=="posts"||sa||O==="empty"||O==="error",us=k==="posts"&&!sa&&O==="error";return!r&&(k==="posts"||k==="media")&&e?.restaurantId&&Qe(O)&&Pe(e),`
    <div class="${Ye}" ${r?'data-landing-tutorial-surface="true"':""}>
      ${T==="profile"||T==="menu"?`
      ${se?`
        <div class="app-content-inline pb-2 ${bt}">
          ${P?Dn(e,{mode:"public",disabledBlockClass:de,avatarUrl:H,avatarFit:K,avatarImgKeyAttr:W,renderAvatarImage:ke,identityPending:ce,followersLabel:mt,followLabel:ht,followTone:Ge,isFollowing:b,hasPendingFollowRequest:h,isLocked:g,bioHtml:$,typeLabel:x,allowTitleImageCacheFallback:Qe(B)||Qe(O)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${de}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${ke?`<img src="${a(H)}" data-fallback-src="${a(q)}" decoding="async" width="100" height="100" ${W} class="w-full h-full rounded-[1.8rem] ${K} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${ce?"animate-pulse":""}">${p(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${p("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ce?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(mt)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${a(v("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ce?"text-slate-300":"text-slate-900"} leading-none mb-1">${a(gt)}</span>
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
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${a(e.handle)}" data-target-type="${a(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${a(e.restaurantId||e.uid||"")}" data-target-name="${a(e.name||"")}" data-target-avatar="${a(e.avatar||"")}" ${h?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${Ge} ${h?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${b?p("check","w-4 h-4"):""}
                    ${ht}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${a(e.uid||"")}" data-chat-handle="${a(e.handle||"")}" data-chat-name="${a(e.name||"")}" data-chat-avatar="${a(e.avatar||"")}" ${g?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${g?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
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
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${a(v("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${a(v("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${zt(e,{landingPreview:r,selectedTabOverride:k,compact:c})}
        ${ra?Nt(e,{disabled:r}):""}

        ${ra?S?(()=>{const Re=He(e),Se=!Re&&P&&!r&&!f&&!rt(e)?Ln(e):"";return Se&&_n(Se,e),`
          <div class="${de} ${vt}"${Se?` ${Ve}="${a(Se)}"`:""}>
            ${Re?Et(e):ft(e,{mode:f?"landing":"profile",allowAutoEnsure:!f})}
          </div>
        `})():_?`
          <div class="${de} ${vt}">
            ${_t()}
          </div>
        `:`
          ${ds?`
            ${us?`
              <div class="app-content-inline ${de}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${a(v("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${s.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${de} ${vt}">
                ${Lt(F,s.profileViewMode,!1,{includeImageKeys:!f})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${de}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${vt}">
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
  `}function _r(){const e=s.profileView;if(!e||!e.profile)return"";const t=e.profile,n=e.posts||t.posts||[],r=Rt(t);return r==="landing"?wr(t):dt(t,n,{topTabOverride:r,tutorialMode:!1})}function Un(e,{filter:t="all",query:n=""}={}){const r=Array.isArray(e)?e:[],l=Ma(n||"");return r.filter(i=>t==="all"||Te(i.type)===t?l?`${i.name||""} ${i.category||""} ${i.description||""}`.toLowerCase().includes(l):!0:!1)}function Bn(e,t=0){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.floor(n)):Math.max(0,Number(t)||0)}function ut(e=[]){return(Array.isArray(e)?e.slice():[]).map((n,r)=>({item:n,idx:r,order:Bn(n?.orderIndex,r)})).sort((n,r)=>n.order-r.order||n.idx-r.idx).map((n,r)=>({...n.item,orderIndex:Bn(n.item?.orderIndex,r)}))}function Dt(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function qe(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":Te(e?.type||"food")==="drink"?"drink":"food"}function Fr(e={}){return String(e?.category||v("menu.other","Sonstiges")).trim()||v("menu.other","Sonstiges")}function Mr(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const Er=4,Rr={thumb:160,small:480,medium:768,large:1280};function On({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<Er&&n===0}function zr({mode:e="profile",priorityIndex:t=-1,slideIndex:n=0}={}){const r=On({mode:e,priorityIndex:t,slideIndex:n}),l=e==="profile"?' data-image-reveal="menu"':"";return r?`loading="eager" fetchpriority="high"${l}`:`loading="lazy" fetchpriority="low"${l}`}function Nr({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function ge(e,{mode:t="profile",priorityIndex:n=-1,slideIndex:r=0,stableKey:l="",preferredSize:i="small",candidateSizes:c=["small","medium","large"],variant:u="grid"}={}){const f=String(e||"").trim(),b=t==="profile"&&l?{stableKey:l}:null,g=On({mode:t,priorityIndex:n,slideIndex:r}),h=t==="profile"&&!g&&u!=="thumb",x=m(f,i,b),w=J(x)?q:x,C=Aa(f),$=Ta(f)&&f!==w?f:C,P=[],T=new Set;c.forEach(y=>{const E=Rr[y]||0;if(!E)return;const D=m(f,y,b);if(!D||J(D))return;const H=`${D}|${E}`;T.has(H)||(T.add(H),P.push(`${D} ${E}w`))});const k=P.length>1?P.join(", "):"",S=k?Nr({variant:u}):"",_=h?"":k,F=h?"":S,R=_?` srcset="${a(_)}"`:"",I=F?` sizes="${a(F)}"`:"",z=zr({mode:t,priorityIndex:n,slideIndex:r}),B=`${z}${R}${I}`,O=h?[`data-menu-lazy-src="${a(w)}"`,`data-menu-lazy-fallback="${a($||q)}"`,k?`data-menu-lazy-srcset="${a(k)}"`:"",S?`data-menu-lazy-sizes="${a(S)}"`:""].filter(Boolean).join(" "):"";return{safeImg:h?q:w,fallbackImg:h?q:$,imageAttrs:B,lazyAttrs:O?` ${O}`:"",srcsetValue:k,sizesValue:S,loadingAttrs:z}}function Me(e=[],t,n=null){const r=n instanceof Set?n:new Set;return e.map((l,i)=>{const c=Fr(l),u=Mr(c),f=!!u&&!r.has(u);return f&&r.add(u),`<div${f?` data-menu-category-anchor="${a(u)}"`:""} class="h-full">${t(l,i)}</div>`}).join("")}function Ut(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function Dr(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function Hn(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),n=Dr(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),r=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&n?{type:"link",url:n,productId:""}:t==="product"&&r?{type:"product",url:"",productId:r}:{type:"self",url:"",productId:""}}function Vn(){const e=ae(s.userProfile),t=String(s.menu.filter||"all").trim().toLowerCase()||"all",n=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:v("menu.all","Alle")},{id:"food",label:v("menu.products","Produkte")}]:[{id:"all",label:v("menu.all","Alle")},{id:"food",label:v("menu.food","Speisen")},{id:"drink",label:v("menu.drinks","Getraenke")}]).map(l=>`
        <button data-menu-filter="${l.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${n===l.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${l.label}
        </button>
      `).join("")}
    </div>
  `}function Ur(){const e=Ca().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${Pa.map(t=>{const n=t.id===e,r=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${n?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${n?p("check",`w-4 h-4 ${r}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function pt(e,{poster:t="",objectPosition:n="50% 50%",badge:r=!0}={}){if(!Jt(e))return"";const l=String(e.videoUrl||"").trim();if(!l)return"";const i=t?` poster="${a(t)}"`:"";return`<video data-autoplay-video src="${a(l)}"${i} class="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]" style="object-position:${n};" muted loop playsinline autoplay preload="metadata"></video>`+(r?'<div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-10"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white block"><path d="M8 5v14l11-7z"></path></svg></div>':"")}function Bt(e,{mode:t="profile",priorityIndex:n=-1}={}){const r=oe(e),l=t==="profile"?Ee(e,{index:0}):"",{safeImg:i,fallbackImg:c,imageAttrs:u,lazyAttrs:f}=ge(r,{mode:t,priorityIndex:n,stableKey:l,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),b=Oe(e),g=s.activeTab==="menu"?s.userProfile:s.profileView?.profile||s.userProfile,h=ae(g),x=vn(e,h),w=h?hn(e.category):e.category||"",C=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${a(i)}" data-fallback-src="${a(c)}"${f} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${u} decoding="async" />
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
            ${p("more-horizontal","w-4 h-4")}
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
        <img src="${a(i)}" data-fallback-src="${a(c)}"${f} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${u} decoding="async" />
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
  `}function Ot(e,{mode:t="profile",variant:n="food",priorityIndex:r=-1}={}){const l=oe(e),i=t==="profile"?Ee(e,{index:0}):"",c=n==="drink",{safeImg:u,fallbackImg:f,imageAttrs:b,lazyAttrs:g}=ge(l,{mode:t,priorityIndex:r,stableKey:i,preferredSize:c?"small":"medium",candidateSizes:c?["small","medium"]:["small","medium","large"],variant:c?"grid":"hero"}),h=Oe(e),x=s.activeTab==="menu"?s.userProfile:s.profileView?.profile||s.userProfile,w=ae(x),C=vn(e,w),$=w?hn(e.category):e.category||"",P=e.description||"",T=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",k=s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"",S=Xe(e),_=pn(k,S),F=_?fn(_):{likes:[],comments:[],counts:{likes:0,comments:0}},R=mn(F),I=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${p("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${a(S)}">${a(A(R.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${p("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${a(S)}">${a(A(R.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${T} class="w-full ${c?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${c?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100 relative">
        <img src="${a(u)}" data-fallback-src="${a(f)}"${g} class="w-full h-full object-cover" style="object-position:${Z(e)};" ${b} decoding="async" />
        ${pt(e,{poster:u,objectPosition:Z(e)})}
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
  `}function Ht(e={}){if(!e?.restaurantId||ae(e))return!1;const t=String(At(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":ye(e)}function Kn(e){const t=e?.restaurantId||s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"",n=Xe(e),r=pn(t,n),l=r?fn(r):{likes:[],comments:[],counts:{likes:0,comments:0}},i=String(s.user?.uid||"").trim(),c=String(s.user?.handle||"").trim().toLowerCase(),u=!!l.likes?.some(f=>{const b=String(f?.uid||"").trim();if(i&&b&&b===i)return!0;const g=String(f?.handle||"").trim().toLowerCase();return!!c&&!!g&&g===c});return{itemId:n,meta:l,counts:mn(l),isLiked:u}}function Ee(e,{index:t=0}={}){const n=String(e?.restaurantId||s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"").trim(),r=String(e?.id||Xe(e)||"").trim();if(!n||!r)return"";const l=Number(t),i=Number.isFinite(l)?Math.max(0,Math.floor(l)):0;return`menu-detail:${n}:${r}:${i}`}function Br(e){const t=typeof un=="function"?un(e):[],n=Array.isArray(t)?t.filter(Boolean):[];if(n.length)return n;const r=oe(e);return r?[r]:[]}function be(e){return fs(e?.cardStyle||"",Te(e?.type||"food"))}function Vt(e,{menuItemId:t=""}={}){if(!e)return null;const n=String(t||e.menuItemId||e.itemId||e.productId||"").trim(),r=Jt(e),l=String(e.videoUrl||"").trim(),i=String(e.posterUrl||"").trim(),c=oe(e)||e.imageUrl||(r?i:"")||"";return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:c,objectPosition:e.objectPosition||Z(e),menuItemId:n,mediaType:r?"video":"image",videoUrl:r?l:"",posterUrl:r?i||c:""}}function j(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function Or(e={}){return at("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${Pt()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${re({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
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
  `}function Hr(e={}){return at("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${re({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
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
  `}function Vr(){return`
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
  `}function Kr(){return`
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
  `}function qn(e={}){return at("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${re({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>Vr()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>Kr()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Gn(e="food"){const t=e==="drink";return`
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
  `}function qr(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${re({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
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
  `}function Yn({isShop:e=!1,debugContext:t={}}={}){return at(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${re({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>qr()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${re({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${j("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>Gn("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${j("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>Gn("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Wn(e,t=[],{mode:n="profile"}={}){const r=e?.restaurantId||"",l=Ht(e)||ae(e);return!r||!l||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((i,c)=>{const u=i.imageUrl||"",f=String(i.menuItemId||i.id||"").trim(),{safeImg:b,fallbackImg:g,imageAttrs:h,lazyAttrs:x}=ge(u,{mode:n,priorityIndex:c,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:f?`menu-focus:${r}:${f}`:""}),w=String(i.menuItemId||"").trim(),C=n==="profile"&&w?`data-menu-open="${a(w)}" role="button"`:"";return`
            <div ${C} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${C?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${a(b)}" data-fallback-src="${a(g)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${i.objectPosition||"50% 50%"};" ${h} decoding="async" />
                ${pt(i,{poster:b,objectPosition:i.objectPosition||"50% 50%",badge:!1})}
                <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${p("sparkles","w-3 h-3 text-amber-500")}
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
  `}function Qn(e,{mode:t="profile",priorityIndex:n=-1}={}){const r=oe(e),l=t==="profile"?Ee(e,{index:0}):"",{safeImg:i,fallbackImg:c,imageAttrs:u,lazyAttrs:f}=ge(r,{mode:t,priorityIndex:n,stableKey:l,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),b=Oe(e),g=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",{itemId:h,counts:x,isLiked:w}=Kn(e);return`
    <div ${g} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${a(i)}" data-fallback-src="${a(c)}"${f} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${u} decoding="async" />
        ${pt(e,{poster:i,objectPosition:Z(e)})}
        <button
          type="button"
          data-menu-card-like="${a(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${p("heart","w-3.5 h-3.5 fill-current opacity-80")}
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
            ${p("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${a(h)}">${a(A(x.likes))}</span>
          <span data-menu-comment-count="${a(h)}">${a(A(x.comments))}</span>
        </div>
      </div>
    </div>
  `}function Gr(e,t="profile"){if(t!=="profile")return"";const n=Hn(e);return n.type==="link"&&n.url?`data-menu-special-link="${a(n.url)}" role="button" tabindex="0"`:n.type==="product"&&n.productId?`data-menu-open="${a(n.productId)}" role="button"`:`data-menu-open="${a(e.id)}" role="button"`}function Kt(e,{mode:t="profile",size:n="default",priorityIndex:r=-1}={}){const l=oe(e),i=t==="profile"?Ee(e,{index:0}):"",c=n==="food",{safeImg:u,fallbackImg:f,imageAttrs:b,lazyAttrs:g}=ge(l,{mode:t,priorityIndex:r,stableKey:i,preferredSize:c?"medium":"small",candidateSizes:c?["small","medium","large"]:["small","medium"],variant:c?"hero":"grid"}),h=Gr(e,t),x=String(e.category||"Special").trim()||"Special",w=a(String(e.name||"Special")).replace(/\n/g,"<br>");return n==="food"?`
      <div ${h} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${a(u)}" data-fallback-src="${a(f)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${b} decoding="async" />
        ${pt(e,{poster:u,objectPosition:Z(e)})}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${p("arrow-right","w-4 h-4")}
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
      <img src="${a(u)}" data-fallback-src="${a(f)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Z(e)};" ${b} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${p("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${a(x)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function Jn(e,{mode:t="profile",priorityIndex:n=-1}={}){const r=Oe(e),l=t==="profile"?`data-menu-open="${a(e.id)}" role="button"`:"",i=Br(e),u=(i.length?i:[oe(e)||""]).filter(Boolean),f=u.length?u.slice(0,12):[""],b=f.length>1,{itemId:g,counts:h,isLiked:x}=Kn(e),w=A(Math.max(0,Number(h.likes)||0)),C=A(Math.max(0,Number(h.comments)||0));return`
    <div ${l} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${b?`
          <div
            data-menu-card-gallery-track="${a(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${f.map(($,P)=>{const T=t==="profile"?Ee(e,{index:P}):"",k=ge($||"",{mode:t,priorityIndex:n,slideIndex:P,stableKey:T,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),S=P>0,_=S?q:k.safeImg,F=S?q:k.fallbackImg,R=S?k.loadingAttrs:k.imageAttrs,I=S?"":k.lazyAttrs||"",z=S?` data-menu-card-deferred-src="${a(k.safeImg)}"
                    data-menu-card-deferred-fallback="${a(k.fallbackImg)}"
                    ${k.srcsetValue?`data-menu-card-deferred-srcset="${a(k.srcsetValue)}"`:""}
                    ${k.sizesValue?`data-menu-card-deferred-sizes="${a(k.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${P}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${a(_)}" data-fallback-src="${a(F)}"${I}${z} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${Z(e)};" ${R} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${f.map(($,P)=>{const T=t==="profile"?Ee(e,{index:P}):"",{safeImg:k,fallbackImg:S,imageAttrs:_,lazyAttrs:F}=ge($||"",{mode:t,priorityIndex:n,slideIndex:P,stableKey:T,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
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
          ${p("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${b?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${f.map(($,P)=>`
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
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${a(r)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${a(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${a(g)}">${a(w)}</span>
              <span data-menu-comment-count="${a(g)}">${a(C)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${a(v("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${p("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function Yr(e,t,{mode:n="profile",publicMenuSurfaceState:r=null,focusFallbackHtml:l=""}={}){const i=ut(Array.isArray(t)?t:[]),c=String(e?.restaurantId||"").trim(),u=n==="admin"||Oa(c),f=r?.focus?.canRenderFocus?{items:Array.isArray(r.focus.items)?r.focus.items:[],enabled:!0}:c&&u?Ze(c):{items:[],enabled:!1},b=f.enabled?(Array.isArray(f.items)?f.items:[]).map(y=>Vt({...y,objectPosition:je(y)})):[],g=i.filter(y=>be(y)==="testfirst_focus"&&!Dt(y)).map(y=>Vt(y,{menuItemId:y.id||""})).filter(Boolean),h=new Set,x=[...b,...g].filter(y=>{const E=String(y.menuItemId||y.id||`${y.title}|${y.text}|${y.imageUrl}`);return!E||h.has(E)?!1:(h.add(E),!0)}),w=i.filter(y=>!Dt(y)),C=w.filter(y=>be(y)!=="testfirst_focus"),$=C.length?C:w,P=C.length?x:[],T=$.filter(y=>qe(y)==="drink"),k=$.filter(y=>qe(y)!=="drink"),S=(y=[])=>{const E=[],D=[];return y.forEach(H=>{const K=be(H);K==="testfirst_food"||K==="testfirst_special"&&Ut(H)==="food"?D.push(H):E.push(H)}),{gridItems:E,foodItems:D}},_=(y,E=-1)=>be(y)==="testfirst_special"?Kt(y,{mode:n,priorityIndex:E}):Qn(y,{mode:n,priorityIndex:E});let F=0;const R=()=>{const y=F;return F+=1,y},I=new Set,z=(y,E)=>!E.gridItems.length&&!E.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${a(y)}">
        ${E.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a(y)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${Me(E.gridItems,D=>_(D,R()),I)}
            </div>
          </div>
        `:""}
        ${E.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${a(y)}">
            <div class="app-content-inline">
              ${Me(E.foodItems,D=>{const H=be(D),K=R();return H==="testfirst_special"?Kt(D,{mode:n,size:"food",priorityIndex:K}):Jn(D,{mode:n,priorityIndex:K})},I)}
            </div>
          </div>
        `:""}
      </section>
    `,B=S(T),O=S(k);return`
    <div>
      ${Wn(e,P,{mode:n})||l}
      <div id="menu-section" class="mt-5">
        ${z("drink",B)}
        ${z("food",O)}
      </div>
    </div>
  `}function Xn(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:r=null,priorityOffset:l=0}={}){return e.length?n?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${Me(e,(i,c)=>Qn(i,{mode:t,priorityIndex:l+c}),r)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${Me(e,(i,c)=>Ot(i,{mode:t,variant:"drink",priorityIndex:l+c}),r)}
    </div>
  `:""}function Zn(e,{mode:t="profile",useTestfirstCardUi:n=!1,seenCategories:r=null,priorityOffset:l=0}={}){return e.length?n?`
      <div>
        ${Me(e,(i,c)=>be(i)==="testfirst_special"&&Ut(i)==="food"?Kt(i,{mode:t,size:"food",priorityIndex:l+c}):Jn(i,{mode:t,priorityIndex:l+c}),r)}
      </div>
    `:`
    <div class="space-y-4">
      ${Me(e,(i,c)=>Ot(i,{mode:t,variant:"food",priorityIndex:l+c}),r)}
    </div>
  `:""}function ea(e,{mode:t="profile"}={}){if(t==="admin"){const n=String(s?.menu?.filter||"all").trim().toLowerCase(),r=ae(s.userProfile),l=v("menu.products","Produkte"),i=e.filter(g=>Te(g?.type)==="drink"),c=e.filter(g=>Te(g?.type)!=="drink"),u=(g,h,{addType:x=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${a(g)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${a(g)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(A(h.length))} Eintraege</p>
          </div>
          ${x?`
            <button type="button" data-menu-add-${a(x)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${p("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${h.length?`<div class="space-y-3">${h.map(w=>Bt(w,{mode:"admin"})).join("")}</div>`:(nt({functionName:"renderMenuList.adminSection",items:h,rawItems:h,filteredItems:h,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${re({source:"admin-menu:no-products"})}>${a(v("menu.noProducts","Keine Produkte"))}</div>`)}
      </div>
    `;if(r)return u(l,e,{addType:"food"});const f=[{title:v("menu.drinks","Getraenke"),list:i,addType:"drink"},{title:v("menu.food","Speisen"),list:c,addType:"food"}];if(n==="all")return`
        <div>
          ${f.map(g=>u(g.title,g.list,{addType:g.addType})).join("")}
        </div>
      `;const b=f.filter(g=>g.list.length>0);return b.length?`
      <div>
        ${b.map(g=>u(g.title,g.list,{addType:g.addType})).join("")}
      </div>
    `:n==="drink"?u(v("menu.drinks","Getraenke"),[],{addType:"drink"}):n==="food"?u(v("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((n,r)=>Bt(n,{mode:t,priorityIndex:r})).join("")}
    </div>
  `:(nt({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${re({source:`${t}:no-products`})}>
        ${a(v("menu.noProducts","Keine Produkte"))}
      </div>
    `)}function qt(e,{variant:t="focus",suppressLoading:n=!1}={}){if(!e)return"";const{items:r,enabled:l,loading:i}=Ze(e,{includeInactive:!0}),c=A(r.length),u=String(t||"").trim().toLowerCase()==="travel-offers",f=u?"Ofertat":"Sot ne Fokus",b=u?"Oferta":"Highlights",g=u?"Im Travel und Profil sichtbar":"Im Profil sichtbar",h=u?"Ofertat werden geladen...":v("focus.loading","Fokus wird geladen..."),x=u?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${a(f)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${a(b)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(c)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${p("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${u?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${a(g)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${l?"checked":""} />
      </label>

      ${r.length?`
        <div class="space-y-3">
          ${r.map(w=>{const C=m(w.imageUrl||"","thumb"),$=J(C)?q:C,P=w.active!==!1?"Aktiv":"Inaktiv",T=w.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a($)}" class="w-full h-full object-cover" style="object-position:${je(w)};" loading="lazy" decoding="async" />
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
  `}function ta(e={}){if(!e?.restaurantId)return!1;const t=String(At(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||ae(e)?!1:ye(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function Wr(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function Qr(e,t){if(!t||!ta(e))return"";const{items:n,loading:r}=La(t,{includeInactive:!0}),l=A(n.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(l)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${p("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${n.length?`
        <div class="space-y-3">
          ${n.map(i=>{const c=m(i.imageUrl||"","thumb"),u=J(c)?q:c,f=Wr(i),b=i.category||"RESTAURANT",g=i.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(u)}" class="w-full h-full object-cover" style="object-position:${je(i)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(i.title||"Ad")}</p>
                  ${i.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${a(i.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${a(b)} · ${a(g)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${f.className}">${a(f.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${a(i.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${a(i.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:r?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ads werden geladen...</div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Ads</div>
      `}
    </div>
  `}function Gt(e){if(Array.isArray(e))return e.map(n=>String(n||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(n=>n.trim()).filter(Boolean):[]}function Jr(e={}){const t=String(e?.restaurantId||"").trim(),n=t?le(t):null;return{...n&&typeof n=="object"?n:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function Yt(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function Xr(e={}){const t=Yt(e);return[...Gt(t.productIds),...Gt(e.shoppingLandingCardProductIds),...Gt(e.shoppingLandingProductIds)].filter(Boolean)}function Wt(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[n,r])=>{const l=String(n||"").trim(),i=String(r||"").trim();return l&&i&&(t[l]=i),t},{})}function Zr(e={}){const t=Yt(e);return{...Wt(e.shoppingLandingProductImageOverrides),...Wt(t.productImageOverrides)}}function es(e=""){const t=String(e||"").trim(),n=s.shoppingLandingCardEditor&&typeof s.shoppingLandingCardEditor=="object"?s.shoppingLandingCardEditor:{},r=String(n.restaurantId||"").trim();return r&&r!==t?{}:n}function ts(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function ns(e={}){const n=[oe(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(ts).filter(Boolean);return n.filter((r,l)=>n.indexOf(r)===l)}function as(e={},t={},n={}){const r=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!r)return null;const l=ns(e).map(g=>({rawUrl:g,imageUrl:m(g,"thumb")})).filter(g=>g.rawUrl&&!J(g.imageUrl)),i=l[0]?.rawUrl||"",c=String(t?.[r]||"").trim(),u=String(n?.[r]||"").trim(),f=u||c||i,b=f?m(f,"thumb"):"";return{id:r,name:String(e.name||e.title||"Produkt").trim(),price:Oe(e),imageUrl:b&&!J(b)?b:"",defaultImageRaw:i,cardImageUrl:c,previewImageUrl:u,imageCandidates:l,objectPosition:Z(e)}}function rs(e={},t="",n=[]){if(!t||!ae(e))return"";const r=Jr(e),l=Yt(r),i=es(t),c=i.saving===!0,u=String(i.status||"").trim(),f=/fehl|error|nicht|nuk|kein/i.test(u),b=String(l.imageUrl||r.shoppingLandingCardImageUrl||r.shoppingLandingImageUrl||"").trim(),g=String(r.logoUrl||r.logo||r.logoURL||r.avatar||e.avatar||"").trim(),h=String(i.imageUrlDraft??b).trim(),x=String(i.imagePreview||h||g||"").trim(),w=x?m(x,"large"):q,C=String(i.titleDraft??(l.title||r.shoppingLandingCardTitle||e.name||"")).trim(),$=i.active!==void 0?i.active!==!1:l.active!==!1&&r.shoppingLandingCardEnabled!==!1,P=Xr(r),T=Array.isArray(i.productIds)?i.productIds.map(I=>String(I||"").trim()).filter(Boolean):null,k=new Set(T||P),S={...Zr(r),...Wt(i.productImageOverrides)},_=i.productImagePreviews&&typeof i.productImagePreviews=="object"?i.productImagePreviews:{},F=(Array.isArray(n)?n:[]).filter(I=>I&&String(I.id||"").trim()&&I.hidden!==!0&&I.available!==!1).map(I=>as(I,S,_)).filter(Boolean),R=k.size?`${A(k.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${a(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(R)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${p("plus","w-4 h-4")}
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
              ${F.map(I=>{const z=k.has(I.id),B=I.imageUrl||q,O=String(I.defaultImageRaw||I.imageCandidates[0]?.rawUrl||"").trim(),y=String(I.cardImageUrl||"").trim(),E=String(I.previewImageUrl||"").trim(),D=!!(E||y&&y!==O),H=E||(y&&!I.imageCandidates.some(K=>K.rawUrl===y)?y:"");return`
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
                          ${I.imageCandidates.map((K,W)=>{const te=W===0,ne=E?!1:te?!D:y===K.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${a(I.id)}" data-shopping-landing-product-image-choice="${a(I.id)}" value="${te?"":a(K.rawUrl)}" class="hidden" ${ne?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${ne?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${a(K.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${W+1}</span>
                              </label>
                            `}).join("")}
                          ${H?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${a(I.id)}" data-shopping-landing-product-image-choice="${a(I.id)}" value="${a(H)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${a(m(H,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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

        ${u?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${f?"text-rose-500":"text-slate-500"}">${a(u)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
          ${c?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function ss(e){if(!Ht(e)||!wn(e))return"";const n=ut((s.menu.items||[]).filter(r=>be(r)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${a(A(n.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${p("plus","w-4 h-4")}
        </button>
      </div>
      ${n.length?`
        <div class="space-y-3">
          ${n.map(r=>{const l=m(oe(r),"thumb"),i=J(l)?q:l,c=Hn(r),u=c.type==="link"?"Link":c.type==="product"?"Produkt-Modal":"Diese Karte",f=Ut(r)==="food"?"Food-Size":"Normal",b=Ua(qe(r));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${a(i)}" class="w-full h-full object-cover" style="object-position:${Z(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${a(r.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${a(b)}</span>
                    <span>${a(f)}</span>
                    <span>${a(u)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${a(r.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${a(r.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function na(e,{restaurantId:t="",suppressLoading:n=!1,allowAutoEnsure:r=!0,requirePublicMenuTruth:l=!0}={}){const i=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!i||!ye(e))return"";const c=We(s,{profile:e,routePayload:s?.profileView?.routePayload,webDirectEntry:s?.__webDirectEntry,restaurantId:i});if(l&&c.menu.status!=="ready")return"";const u=!l||c.focus.canRenderFocus;if(r&&!s.focus.loading&&!u&&we(xn(e,i)),l&&!u)return"";const{items:f,loading:b}=u?{items:Array.isArray(c.focus.items)?c.focus.items:[],loading:c.focus.loading}:Ze(i);if(!(u?!0:Ze(i).enabled)||!f.length&&!b||n&&b&&!f.length)return"";if(b&&!f.length)return`
      <div class="${Pt()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(v("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const h=_a(f),x=f[h]||f[0],{safeImg:w,fallbackImg:C,imageAttrs:$,lazyAttrs:P}=ge(x.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:x?.id?`focus-carousel:${i}:${String(x.id)}`:""}),T=x.text||"";return`
    <div id="focusCarousel" class="${Pt()} rounded-[2.5rem] p-6 border shadow-sm">
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
        ${Jt(x)&&String(x.videoUrl||"").trim()?`
          <video data-focus-media="video" data-focus-video data-autoplay-video src="${a(String(x.videoUrl||"").trim())}" ${w?`poster="${a(w)}"`:""} class="w-full h-56 object-cover" style="object-position:${je(x)};" muted loop playsinline autoplay preload="metadata"></video>
          <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
          </div>
        `:`
          <img data-focus-media="image" data-focus-image src="${a(w)}" data-fallback-src="${a(C)}"${P} class="w-full h-56 object-cover" style="object-position:${je(x)};" ${$} decoding="async" />
        `}
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${a(x.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${T?"":"hidden"}">${a(T)}</p>
      </div>
      ${f.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${f.map((S,_)=>`
            <button type="button" data-focus-dot="${_}" class="w-2.5 h-2.5 rounded-full ${_===h?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function is(e,t=220){const n=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${n}`}function aa({label:e,url:t,caption:n}){if(!t)return"";const r=is(t,240);return`
    <button type="button" data-copy-url="${a(t)}" data-copy-label="${a(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${a(r)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${a(e)}</p>
        ${n?`<p class="text-[10px] font-bold text-slate-400 mt-1">${a(n)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function os({profile:e,restaurantId:t,catalogLabel:n}){if(!t||!ye(e))return"";if(typeof cn=="function"){const i=et?et(t):null;(!i||i.sameRestaurant!==!0||!i.loading&&!i.loaded&&!i.error)&&cn(e)}const r=typeof et=="function"?et(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},l=(r.tables||[]).map(i=>{const c=Fa("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:i});return aa({label:`Tisch ${i}`,url:c,caption:`${n} fuer Tisch ${i}`})}).join("");return`
    <div class="mt-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Tisch QR</span>
          <h3 class="text-xl font-black italic tracking-tighter">Tische</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gib an, wie viele Tische du hast. Bereits erzeugte Tisch-QR bleiben dauerhaft unter denselben Links.</p>
        </div>
        <label class="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100">
          <input id="tableQrEnabledToggle" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200" ${r.enabled!==!1?"checked":""} />
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Aktiv</span>
        </label>
      </div>
      <div class="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div class="flex-1">
          <label for="tableQrCountInput" class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Anzahl Tische</label>
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${a(String(r.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${r.saving?"disabled":""}>
          ${r.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${r.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${r.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${a(r.status)}</p>`:""}
      ${r.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(r.error)}</p>`:""}
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
  `}function ls(){const e=s.userProfile,t=e.restaurantId||"",n=String(s.user?.uid||"").trim(),r=String(s.__authBootstrapInFlightUid||"").trim(),l=!t&&!!n&&(!!s.__authProfileLoadPromise||r===n),i=He(e),c=ye(e),u=s.profileView?.profile?.restaurantId?s.profileView.profile:null,f=U()&&!!u?.restaurantId&&ye(u),b=ae(e),g=Da($a(e)),h=t?le(t):null,x=h?.name||h?.restaurantName||e.name||"Business",w=t&&s.menu.restaurantId===t,C=String(s.menu.source||"").trim().toLowerCase(),$=!!w&&C==="collection",P=!!w&&C==="collection"&&s.menu.loading,T=!!t&&(P||!$),k=b?"all":s.menu.filter,S=$?Un(s.menu.items,{filter:k,query:s.menu.query}):[],F=wn(e)?S:S.filter(z=>!qa(z)),R=ut(F),I=A(R.length);if(t&&i){Wa(e);const z=String(s.focus?.truthSource||"").trim().toLowerCase();return!s.focus.loading&&(s.focus.restaurantId!==t||z!=="public-menu")&&we(e),hr(e)}return t&&c&&!$&&!P&&Je(e),t&&c&&!s.focus.loading&&s.focus.restaurantId!==t&&we(e),t&&ta(e)&&Ct(e),c?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${g}</span>
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

      ${t?qt(t):""}
      ${t?Qr(e,t):""}
      ${t?rs(e,t,$?s.menu.items:[]):""}
      ${t&&$?ss(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${p("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${a(s.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${Vn()}

        ${T?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(v("menu.loading",`${g} wird geladen...`,{label:g}))}</div>`:ea(R,{mode:"admin"})}
        ${s.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${a(s.menu.error)}</div>`:""}
        ${os({profile:e,restaurantId:t,catalogLabel:g})}
      `:""}

    </div>
  `:f?ft(u):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${p("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${g}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function ft(e,{mode:t="profile",allowAutoEnsure:n=!0}={}){const r=s?.profileView?.routePayload&&typeof s.profileView.routePayload=="object"?s.profileView.routePayload:null,l=s?.__webDirectEntry&&typeof s.__webDirectEntry=="object"&&s.__webDirectEntry.active===!0?s.__webDirectEntry:null;let i=We(s,{profile:e,routePayload:r,webDirectEntry:l});const c=i.restaurantId||Ba(e,r);if(!c)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${a(v("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const u=xn(e,c),f=ae(u),b=ye(u)&&!f;b&&(i=We(s,{profile:u,routePayload:r,webDirectEntry:l,restaurantId:c}));const g=String(l?.canonicalRestaurantId||l?.restaurantId||"").trim(),h=new Set(i.targetIds),x=i.menu.status==="ready",w=i.focus.canRenderFocus,C=x&&b,$=i.focus.matches===!0&&i.focus.loading===!0,T=String(s?.profileView?.menuAccessSource||l?.menuAccessSource||r?.menuAccessSource||"").trim().toLowerCase()==="qr",k=l?.active===!0&&l?.webPriority===!0&&l?.menuFirst===!0&&String(s?.activeTab||"").trim().toLowerCase()==="profile"&&String(s?.profileTopTab||"").trim().toLowerCase()==="menu"&&(g===c||h.has(c)),S=k&&!T,_=["ready","empty","error"].includes(i.menu.status),F=k&&_,R=k&&(!C||i.menu.status!=="ready"),I=!C||i.focus.settled===!0||i.focus.confirmedEmpty===!0||i.menu.status!=="ready";n&&!F&&!_&&Ae(u),n&&!R&&!I&&!$&&x&&(!S||_)&&we(u);const B=i.menu.canRenderItems?ut(Un(i.menu.items,{filter:"all",query:""})).filter(se=>!Dt(se)):[],O=i.menu.error||"",y=ms(i.menu,B),{hasItems:E,hasError:D,isLoading:H,shouldRenderNoProducts:K}=y;Ra({profile:u,routePayload:r,surface:i,decision:y});const W={profile:u,routePayload:r,surface:i,decision:y,rawItems:i.menu.items,items:B,filteredItems:B,source:"public-menu"},te=Na(i,B),ne=B.filter(se=>qe(se)==="drink"),$e=B.filter(se=>qe(se)!=="drink"),Qt=0,ce=ne.length,ke=Ht(e),mt=ke||f,gt=new Set;E&&c&&(ka(B,c),Va(B,c));const bt=c&&w?(Array.isArray(i.focus.items)?i.focus.items:[]).map(se=>Vt({...se,objectPosition:je(se)})).filter(Boolean):[],ht=i.focus.status==="empty"||i.focus.status==="error",Ge=b&&!w&&!ht&&i.menu.status!=="empty"&&i.menu.status!=="error",Ye=bt.length?Wn(u,bt,{mode:t}):Ge?Hr({...W,reason:"focus-truth-pending"}):"",de=mt?Ye:na(u,{restaurantId:c,suppressLoading:!0,allowAutoEnsure:x&&(!S||_),requirePublicMenuTruth:!0})||(Ge?Or({...W,reason:"focus-truth-pending"}):"");return ke?`
      <div class="app-main-content-safe"${te}>
        ${H?`
          ${Ye}
          ${qn({...W,reason:"menu-loading"})}
        `:`
          ${E?Yr(u,B,{mode:t,publicMenuSurfaceState:i,focusFallbackHtml:Ye}):D?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(v("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:K?(nt({...W,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${re({source:"public-menu:no-products"})}>${a(v("menu.noProducts","Keine Produkte"))}</div>`):qn({...W,reason:"menu-not-confirmed-empty"})}
          ${O?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(O)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5"${te}>
      ${de}
      ${H?`
        ${Yn({isShop:f,debugContext:{...W,reason:"menu-loading"}})}
      `:`
        ${E?`
          ${f?`
            ${Ia(B,{profile:e})}
          `:`
            ${ne.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(v("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Xn(ne,{mode:t,useTestfirstCardUi:ke,seenCategories:gt,priorityOffset:Qt})}
                </div>
              </section>
            `:""}
            ${$e.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${a(v("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${Zn($e,{mode:t,useTestfirstCardUi:ke,seenCategories:gt,priorityOffset:ce})}
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
            ${nt({...W,functionName:"renderProfileMenuView",renderDecision:f?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${re({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${a(v("menu.noProducts","Keine Produkte"))}
              </div>
            </div>`}
          `:`
            ${Yn({isShop:f,debugContext:{...W,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${O?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${a(O)}</div>`:""}
      `}
    </div>
  `}function cs(){const e=s.userProfile,t=M(e),n=t?s.businessPosts:s.userPosts,r=String(s.user?.uid||e?.uid||"").trim(),l=String(e?.restaurantId||"").trim(),i=String(s.__userPostsLoadingUid||"").trim(),c=String(s.__businessPostsLoadingRestaurantId||"").trim(),u=String(s.__authBootstrapInFlightUid||"").trim(),f=!!r&&i===r,b=!!l&&c===l,g=!!r&&u===r,h=t?b||g&&!n.length:f||g&&!n.length,x=String(e.handle||Y(e.name||"user")).replace(/^@/,""),C=a(e.bio||"").replace(/\n/g,"<br>")||a(v("profile.noBio","Noch keine Bio.")),$=ot(e),P=$==="menu",T=$==="checkins",k=n,S=m(e.avatar,"avatar"),_=L(t),F=Rt(e);return`
    <div class="app-main-content-safe">
      ${F==="profile"||F==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?Dn(e,{mode:"self",avatarUrl:S,avatarFit:_,followersLabel:A(e.followers),bioHtml:C}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${a(S)}" data-fallback-src="${a(q)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${_} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${p("badge-check","w-4 h-4 fill-blue-500 text-white")}
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

      ${zt(e)}
      ${Nt(e)}

      ${P?(()=>{const I=He(e),z=!I&&t&&!rt(e)?Ln(e):"";return z&&_n(z,e),`
        <div${z?` ${Ve}="${a(z)}"`:""}>
          ${I?Et(e):ft(e)}
        </div>
      `})():T?`
        ${_t()}
      `:`
        ${h&&!k.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${a(v("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${s.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${Lt(k,s.profileViewMode)}
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
  `}return{renderProfilePostCardFancy:yn,renderProfilePostsFancy:Lt,renderProfileCheckins:_t,renderProfileTabs:zt,renderProfileViewControls:Nt,renderPublicProfileView:_r,renderMenuFilterRow:Vn,renderMenuLayoutSection:Ur,renderMenuItemCard:Bt,renderMenuItemCardStacked:Ot,renderMenuDrinkGrid:Xn,renderMenuFoodList:Zn,renderMenuList:ea,renderFocusAdminSection:qt,renderFocusCarousel:na,renderMenuQrCard:aa,renderMenuAdminView:ls,renderProfileMenuView:ft,renderProfileView:cs}}export{zi as createProfileMenuFocusRenderController};
