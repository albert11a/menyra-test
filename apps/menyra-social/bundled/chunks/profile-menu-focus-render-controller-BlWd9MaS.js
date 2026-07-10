import{w as Nr}from"./domain-menu-eager-XmVAG_5J.js";import{a as Rt}from"./domain-media-eager-B90n_Ot7.js";import{am as Ee,an as Ur,t as Dr,ao as Br,k as Or,ap as ze}from"./domain-feed-social-eager-DlNiHfr_.js";import{K as Hr,L as Vr,M as Kr,N as qr,O as Gr,P as Wr,Q as Yr,J as Qr,R as Jr,A as Xr,g as Zr,B as es,S as ts,T as ns,b as as,d as rs}from"./vendor-firebase-D7Ks7H8l.js";import"./domain-auth-BL21ERPm.js";import"./domain-public-profile-BW4dw-Ab.js";const Vt=Object.freeze([Object.freeze({key:"city",label:"Qyteti",labelDe:"Stadt"}),Object.freeze({key:"beach",label:"Plazha",labelDe:"Straende"}),Object.freeze({key:"sights",label:"Vende per te pare",labelDe:"Sehenswuerdigkeiten"}),Object.freeze({key:"activities",label:"Aktivitete",labelDe:"Aktivitaeten"}),Object.freeze({key:"nature",label:"Natyre",labelDe:"Natur"}),Object.freeze({key:"food",label:"Restorante & Kafene",labelDe:"Restaurants & Cafes"}),Object.freeze({key:"nearby",label:"Vende te rendesishme",labelDe:"Wichtige Orte"})]),ss=Object.freeze(Vt.map(l=>l.key)),is=Object.freeze([Object.freeze({key:"all",labelDe:"Ganzjaehrig"}),Object.freeze({key:"summer",labelDe:"Saisonal Sommer"}),Object.freeze({key:"winter",labelDe:"Saisonal Winter"})]),os=Object.freeze(is.map(l=>l.key)),ls=12;function xe(l=""){return l==null?"":String(l).trim()}function Nt(l){const s=Number(l);return Number.isFinite(s)?s:null}function cs(l=""){const s=xe(l).toLowerCase();return ss.includes(s)?s:{qyteti:"city",stadt:"city",plazha:"beach",plazhi:"beach",strand:"beach",straende:"beach",sehenswuerdigkeiten:"sights",sehenswurdigkeiten:"sights",aktivitete:"activities",aktivitaeten:"activities",natyre:"nature",natur:"nature",restorante:"food",restaurants:"food",cafes:"food",kafene:"food",umgebung:"nearby",rrethina:"nearby"}[s]||"nearby"}function ds(l=""){const s=xe(l).toLowerCase();return os.includes(s)?s:"all"}function us(l=Date.now(),s=Math.random()){const p=Math.max(0,Number(l)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(s)||0))*36**6).toString(36).padStart(6,"0");return`place_${p}_${n}`}function ps(l){return Array.isArray(l)?l.map(s=>xe(s)).filter(Boolean).slice(0,ls):[]}function fs(l={},{index:s=0}={}){const p=l&&typeof l=="object"?l:{},n=Nt(p.lat??p.latitude??p.coords?.lat),v=Nt(p.lng??p.lon??p.longitude??p.coords?.lng),m=Nt(p.priority);return{id:xe(p.id)||us(Date.now()+s),name:xe(p.name),category:cs(p.category),description:xe(p.description??p.text).slice(0,600),lat:n,lng:v,coverImageUrl:xe(p.coverImageUrl??p.imageUrl??p.coverUrl),gallery:ps(p.gallery),priority:m==null?0:Math.max(0,Math.min(100,Math.round(m))),pinned:p.pinned===!0,season:ds(p.season??p.seasonal),active:p.active!==!1}}const ms=6371e3,gs=80,bs=600,hs=1600;function lt(l=0){return(Number(l)||0)*(Math.PI/180)}function Pe(l){return l==null||l===""?NaN:Number(l)}function Dt(l={}){return Number.isFinite(Pe(l?.lat))&&Number.isFinite(Pe(l?.lng))}function vs(l,s,p,n){const v=Pe(l),m=Pe(s),O=Pe(p),B=Pe(n);if(![v,m,O,B].every(Number.isFinite))return null;const Z=lt(O-v),M=lt(B-m),_=Math.sin(Z/2)**2+Math.cos(lt(v))*Math.cos(lt(O))*Math.sin(M/2)**2;return Math.round(2*ms*Math.asin(Math.min(1,Math.sqrt(_))))}function xs(l){const s=Number(l);return!Number.isFinite(s)||s<0?"":s<1e3?`${Math.max(10,Math.round(s/10)*10)} m`:s<1e4?`${(s/1e3).toFixed(1).replace(/\.0$/,"")} km`:`${Math.round(s/1e3)} km`}function ws(l){const s=Number(l);return!Number.isFinite(s)||s<0?null:s<=hs?{mode:"walk",minutes:Math.max(1,Math.round(s/gs))}:{mode:"drive",minutes:Math.max(1,Math.round(s/bs))}}function ys(l,s={}){const p=ws(l);if(!p)return"";const n=String(s.walk||"min in Gehweite"),v=String(s.drive||"min mit dem Auto");return`${p.minutes} ${p.mode==="walk"?n:v}`}const Hn=200;function me(l=""){return l==null?"":String(l).trim()}function zn(l){return Array.isArray(l)?Array.from(new Set(l.map(s=>me(s)).filter(Boolean))).slice(0,Hn):[]}function Vn(l={}){const s=l&&typeof l=="object"?l:{},p=s.placePatches&&typeof s.placePatches=="object"?s.placePatches:{},n={};return Object.entries(p).slice(0,Hn).forEach(([v,m])=>{const O=me(v);if(!O||!m||typeof m!="object")return;const B={};me(m.name)&&(B.name=me(m.name)),me(m.description)&&(B.description=me(m.description).slice(0,600)),me(m.coverImageUrl)&&(B.coverImageUrl=me(m.coverImageUrl)),Object.keys(B).length&&(n[O]=B)}),{hidden:zn(s.hidden),pinned:zn(s.pinned),placePatches:n}}function $s({places:l=[],overrides:s={},hotelCoords:p=null,includeHidden:n=!1}={}){const v=Vn(s),m=new Set(v.hidden),O=new Map(v.pinned.map((M,_)=>[M,_])),B=Dt(p)?p:null;return(Array.isArray(l)?l:[]).map((M,_)=>fs(M,{index:_})).filter(M=>M.name&&M.active).map(M=>{const _=v.placePatches[M.id]||{},ne=B&&Dt(M)?vs(B.lat,B.lng,M.lat,M.lng):null;return{...M,..._,hidden:m.has(M.id),pinned:O.has(M.id)||M.pinned,pinnedRank:O.has(M.id)?O.get(M.id):null,distanceMeters:ne}}).filter(M=>n||!M.hidden).sort((M,_)=>{const ne=M.pinnedRank!=null,ge=_.pinnedRank!=null;if(ne!==ge)return ne?-1:1;if(ne&&ge&&M.pinnedRank!==_.pinnedRank)return M.pinnedRank-_.pinnedRank;if(M.pinned!==_.pinned)return M.pinned?-1:1;if(M.priority!==_.priority)return _.priority-M.priority;const ye=Number.isFinite(M.distanceMeters)?M.distanceMeters:1/0,Ue=Number.isFinite(_.distanceMeters)?_.distanceMeters:1/0;return ye!==Ue?ye-Ue:String(M.name).localeCompare(String(_.name))})}function ks(l=[]){const s=Array.isArray(l)?l:[];return Vt.map(p=>({...p,places:s.filter(n=>n.category===p.key)})).filter(p=>p.places.length)}const Bt="mnyraHotelDestinationSections",Rn="mnyraHotelDetailStyles",Ss="/apps/menyra-social/styles/hotel-detail.css?v=2026-07-10-hotel-detail-v1",Is=Object.freeze({walk:"min në këmbë",drive:"min me makinë"}),Re=Object.freeze({rooms:"Qëndrimi yt",city:"Përreth teje",beach:"Deti afër",sights:"Vlen të shihet",activities:"Përjeto zonën",nature:"Natyrë e gjallë",food:"Shijo lokal",nearby:"Afër teje",amenities:"Pa pagesë shtesë",map:"Zbulo zonën",rating:"Nga vizitorët"}),Cs=Object.freeze({city:"Qyteti",beach:"Plazha",sights:"Vende për të parë",activities:"Aktivitete",nature:"Natyra",food:"Restorante & Kafene",nearby:"Vende të rëndësishme"}),Ot=Object.freeze({bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>',building:'<path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',waves:'<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>',compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',sparkles:'<path d="m12 3-1.2 3.1L8 7.5l2.8 1.4L12 12l1.2-3.1L16 7.5l-2.8-1.4zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8zM18 13l-1 2.7-3 1.3 3 1.3 1 2.7 1-2.7 3-1.3-3-1.3z"/>',tree:'<path d="m17 14 3 3h-5l3 3H6l3-3H4l3-3H3l5-5H5l7-7 7 7h-3l5 5zM12 20v2"/>',coffee:'<path d="M10 2v2M14 2v2M6 2v2M18 8h1a3 3 0 0 1 0 6h-1M4 8h14v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>',pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0"/><circle cx="12" cy="10" r="3"/>',nav:'<path d="m3 11 19-9-9 19-2-8z"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',expand:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/>',check:'<path d="m20 6-11 11-5-5"/>',wifi:'<path d="M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',car:'<path d="m5 17-2-1v-4l2-5h14l2 5v4l-2 1M5 17v2M19 17v2M3 13h18M7 13h.01M17 13h.01"/>',snow:'<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93M8 5l4 2 4-2M8 19l4-2 4 2"/>',shield:'<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',umbrella:'<path d="M2 12h20M12 12v8a2 2 0 0 0 4 0M2 12a10 10 0 0 1 20 0M12 2v1"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>'}),Ps=Object.freeze({city:"building",beach:"waves",sights:"compass",activities:"sparkles",nature:"tree",food:"coffee",nearby:"pin"}),As=Object.freeze([{keywords:["wifi","wi-fi","internet"],icon:"wifi"},{keywords:["parkim","parking","garazh"],icon:"car"},{keywords:["mengjes","mëngjes","breakfast","fruehstueck"],icon:"coffee"},{keywords:["klime","klimë","kondicioner","ac"],icon:"snow"},{keywords:["plazh","det","beach","pishine","pishinë","pool"],icon:"waves"},{keywords:["shezlong","ombrelle","umbrella"],icon:"umbrella"},{keywords:["recepsion","reception","siguri","security","24"],icon:"shield"},{keywords:["pastrim","cleaning","spa"],icon:"sparkles"},{keywords:["famil","person"],icon:"users"}]);function G(l=""){return l==null?"":String(l).trim()}function V(l=""){return G(l).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function we(l="pin",s=""){const p=Ot[l]||Ot.pin;return`<svg class="mhd-icon ${s}" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`}function js(l=typeof document>"u"?null:document){if(!l||l.getElementById(Rn))return;const s=l.createElement("link");s.id=Rn,s.rel="stylesheet",s.href=Ss,l.head.appendChild(s)}function Ne({iconName:l="pin",eyebrow:s="",title:p=""}={}){return`
    <div class="mhd-section-title">
      <span class="mhd-section-icon">${we(l)}</span>
      <div>
        ${s?`<small>${V(s)}</small>`:""}
        <h2>${V(p)}</h2>
      </div>
    </div>
  `}function Ts(l={}){const s=xs(l.distanceMeters);if(!s)return"";const p=ys(l.distanceMeters,Is);return`
    <div class="mhd-distance">
      <span>${we("nav","mhd-icon--sm")}${V(s)}</span>
      ${p?`<span>${we("clock","mhd-icon--sm")}${V(p)}</span>`:""}
    </div>
  `}function Ls(l={},{nearestPlaceId:s="",imageUrlFn:p=null}={}){const n=Vt.find(B=>B.key===l.category)?.label||"",v=l.id&&l.id===s?"Më afër hotelit":n,m=G(l.coverImageUrl),O=m&&typeof p=="function"&&G(p(m))||m;return`
    <article class="mhd-card">
      <div class="mhd-photo">${O?`<img src="${V(O)}" alt="${V(l.name)}" loading="lazy" decoding="async" />`:""}</div>
      <div class="mhd-card-body">
        ${v?`<span class="mhd-pill ${l.id===s?"mhd-pill--accent":""}">${V(v)}</span>`:""}
        <h3>${V(l.name)}</h3>
        ${Ts(l)}
        ${l.description?`<p class="mhd-copy">${V(l.description)}</p>`:""}
      </div>
    </article>
  `}function Nn({template:l=null,overrides:s={},hotelCoords:p=null,imageUrlFn:n=null}={}){if(!l||!Array.isArray(l.places)||!l.places.length)return"";const v=$s({places:l.places,overrides:s,hotelCoords:Dt(p)?p:null});if(!v.length)return"";const m=v.filter(B=>Number.isFinite(B.distanceMeters)).sort((B,Z)=>B.distanceMeters-Z.distanceMeters)[0]||null;return ks(v).map(B=>`
    <section class="mhd-section">
      ${Ne({iconName:Ps[B.key]||"pin",eyebrow:Re[B.key]||"",title:Cs[B.key]||B.label})}
      <div class="mhd-rail">
        ${B.places.map(Z=>Ls(Z,{nearestPlaceId:m?.id||"",imageUrlFn:n})).join("")}
      </div>
    </section>
  `).join("")}function Fs(){return`
    <section class="mhd-section">
      <div class="mhd-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>
  `}function _s(l={},s="€"){const p=G(l.priceLabel||l.priceText);if(p)return p;const n=Number(l.price??l.startingPrice??l.pricePerNight);if(!Number.isFinite(n)||n<=0)return"";const v=G(l.currency||l.currencyCode)||s;return v==="€"||v.toUpperCase()==="EUR"?`€${n}`:`${n} ${v}`}function Ms({offers:l=[],imageUrlFn:s=null}={}){const p=(Array.isArray(l)?l:[]).filter(n=>n&&n.active!==!1&&G(n.title));return p.length?`
    <section class="mhd-section">
      ${Ne({iconName:"bed",eyebrow:Re.rooms,title:"Dhoma"})}
      <div class="mhd-rail">
        ${p.map(n=>{const v=G(n.imageUrl),m=v&&typeof s=="function"&&G(s(v))||v,O=_s(n);return`
            <article class="mhd-card">
              <div class="mhd-photo">${m?`<img src="${V(m)}" alt="${V(n.title)}" loading="lazy" decoding="async" />`:""}</div>
              <div class="mhd-card-body">
                ${G(n.tag||n.badge)?`<span class="mhd-pill mhd-pill--accent">${V(n.tag||n.badge)}</span>`:""}
                <div class="mhd-heading-price">
                  <h3>${V(n.title)}</h3>
                  ${O?`<span class="mhd-price"><strong>${V(O)}</strong><small>/ natë</small></span>`:""}
                </div>
                ${G(n.text)?`<p class="mhd-copy">${V(n.text)}</p>`:""}
              </div>
            </article>
          `}).join("")}
      </div>
    </section>
  `:""}function Es(l=""){const s=G(l).toLowerCase();for(const p of As)if(p.keywords.some(n=>s.includes(n)))return p.icon;return"check"}function zs({amenities:l=[]}={}){const s=(Array.isArray(l)?l:[]).map(p=>G(p)).filter(Boolean);return s.length?`
    <section class="mhd-section">
      ${Ne({iconName:"check",eyebrow:Re.amenities,title:"Përfshihet"})}
      <div class="mhd-amenities">
        ${s.slice(0,12).map(p=>`
          <article class="mhd-amenity">
            <span class="mhd-amenity-icon">${we(Es(p))}</span>
            <h3>${V(p)}</h3>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}function Rs({address:l="",city:s="",destinationName:p="",mapsUrl:n=""}={}){const v=[G(l),G(s)].filter(Boolean).join(", ")||G(p);return!v&&!n?"":`
    <section class="mhd-section">
      ${Ne({iconName:"compass",eyebrow:Re.map,title:"Lokacioni"})}
      <div class="mhd-map-card">
        <div class="mhd-map-art">
          <div class="mhd-map-water"></div>
          <span class="mhd-map-pin">${we("bed")}</span>
        </div>
        <div class="mhd-map-info">
          <div class="mhd-address">
            <span>${we("pin")}</span>
            <div>
              <small>Lokacioni</small>
              <strong>${V(v||"Hotel")}</strong>
              ${G(p)?`<p>Plazhi, qyteti dhe vendet kryesore rreth ${V(p)}.</p>`:""}
            </div>
          </div>
          ${n?`<a class="mhd-primary" href="${V(n)}" target="_blank" rel="noopener noreferrer">${we("expand","mhd-icon--sm")}Hap hartën</a>`:""}
        </div>
      </div>
    </section>
  `}function Ns({rating:l="",reviewCount:s="",summary:p=""}={}){const n=Number(G(l).replace(",","."));if(!Number.isFinite(n)||n<=0)return"";const v=Math.max(1,Math.min(5,Math.round(n))),m=Array.from({length:v}).map(()=>`<svg class="mhd-icon mhd-star" viewBox="0 0 24 24" aria-hidden="true">${Ot.star}</svg>`).join(""),O=G(s);return`
    <section class="mhd-section">
      ${Ne({iconName:"star",eyebrow:Re.rating,title:"Vlerësimet"})}
      <div class="mhd-rating">
        <div class="mhd-score">
          <strong>${V(n.toFixed(1))}</strong>
          <div>
            <div class="mhd-stars">${m}</div>
            <p>${V([p,O?`${O} vlerësime`:""].filter(Boolean).join(" · ")||"Nga vizitorët")}</p>
          </div>
        </div>
      </div>
    </section>
  `}function Us({offers:l=[],amenities:s=[],address:p="",city:n="",destinationId:v="",destinationName:m="",destinationSectionsHtml:O="",mapsUrl:B="",rating:Z="",reviewCount:M="",ratingSummary:_="",imageUrlFn:ne=null}={}){const ge=!!G(v),ye=O||(ge?Fs():"");return`
    <div class="mhd">
      ${Ms({offers:l,imageUrlFn:ne})}
      <div id="${Bt}" data-destination-id="${V(v)}" style="display:contents">
        ${ye}
      </div>
      ${zs({amenities:s})}
      ${Rs({address:p,city:n,destinationName:m,mapsUrl:B})}
      ${Ns({rating:Z,reviewCount:M,summary:_})}
    </div>
  `}const Ds=Object.freeze({apiKey:"AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",authDomain:"menyra-c0e68.firebaseapp.com",projectId:"menyra-c0e68",storageBucket:"menyra-c0e68.firebasestorage.app",messagingSenderId:"528471049588",appId:"1:528471049588:web:c507d87c0832562a855821",measurementId:"G-YLFKC8726B"});function Bs(){try{const l=String(globalThis?.location?.hostname||"").trim().toLowerCase();if(!["localhost","127.0.0.1","::1"].includes(l))return null;const s=globalThis?.__MENYRA_FIREBASE_EMULATORS__,p=s&&typeof s=="object"?s:{},n=new URLSearchParams(globalThis?.location?.search||"").get("firebase-emulator")==="1";if(p.enabled!==!0&&!n)return null;const v=String(p.projectId||"mnyra-local").trim();return/^(mnyra-local|demo-|test-|local-)/.test(v)?Object.freeze({projectId:v,host:String(p.host||"127.0.0.1").trim()||"127.0.0.1",firestorePort:Math.max(1,Number(p.firestorePort||8080)||8080),authPort:Math.max(1,Number(p.authPort||9099)||9099),functionsPort:Math.max(1,Number(p.functionsPort||5001)||5001)}):null}catch{return null}}const le=Bs(),Ut=Object.freeze(le?{apiKey:"mnyra-local-api-key",authDomain:`${le.projectId}.firebaseapp.com`,projectId:le.projectId,storageBucket:`${le.projectId}.appspot.com`,messagingSenderId:"000000000000",appId:"1:000000000000:web:mnyra-local"}:Ds),Un=new WeakSet,Dn=new WeakSet;function Os({firestore:l=null,authInstance:s=null}={}){return le?(l&&!Un.has(l)&&(ts(l,le.host,le.firestorePort),Un.add(l)),s&&!Dn.has(s)&&(ns(s,`http://${le.host}:${le.authPort}`,{disableWarnings:!0}),Dn.add(s)),!0):!1}function Hs(){try{const l=Zr();if(l?.options?.projectId===Ut.projectId&&l?.options?.appId===Ut.appId)return l}catch{}return es(Ut)}const ut=Hs();function Vs(){try{return globalThis?.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__===!0}catch{return!1}}let pt;try{const l=Vs();pt=Hr(ut,{experimentalAutoDetectLongPolling:!0,localCache:l?Vr():Kr({tabManager:qr()})});try{globalThis.__MENYRA_FIRESTORE_LOCAL_CACHE_KIND__=l?"memory-public-website":"persistent-multitab"}catch{}}catch{pt=Gr(ut)}let Ht;try{Ht=Wr(ut,{persistence:[Yr,Qr,Jr]})}catch{Ht=Xr(ut)}Os({firestore:pt,authInstance:Ht});const Ks="destinationsPublic",Kn="menyra_social_destination_public_cache_v1::",qs=360*60*1e3,dt=new Map,ct=new Map;function Ae(l=""){return l==null?"":String(l).trim()}function qn(l="",s={}){const p=s&&typeof s=="object"?s:{},n=Array.isArray(p.places)?p.places:[];return n.length?{id:Ae(l),name:Ae(p.name),slug:Ae(p.slug),description:Ae(p.description),version:Math.max(0,Number(p.version)||0),places:n}:null}function Gs(l=""){try{const s=localStorage.getItem(`${Kn}${l}`);if(!s)return null;const p=JSON.parse(s);return!p||typeof p!="object"||Date.now()-Number(p.storedAt||0)>qs?null:qn(l,p.data)}catch{return null}}function Ws(l="",s=null){try{localStorage.setItem(`${Kn}${l}`,JSON.stringify({storedAt:Date.now(),data:s}))}catch{}}function Gn(l=""){const s=Ae(l);if(!s)return null;if(dt.has(s))return dt.get(s);const p=Gs(s);return p&&dt.set(s,p),p}async function Ys(l=""){const s=Ae(l);if(!s)return null;const p=Gn(s);if(p)return p;if(ct.has(s))return ct.get(s);const n=(async()=>{try{const v=await as(rs(pt,Ks,s)),m=v.exists()?qn(s,v.data()||{}):null;return dt.set(s,m),m&&Ws(s,v.data()||{}),m}catch{return null}finally{ct.delete(s)}})();return ct.set(s,n),n}const Bn="menyra_social_business_type_hint_v1";function je(l=""){return l==null?"":String(l).trim()}function On(l={}){const s=l&&typeof l=="object"?l:{},p=[],n=je(s.restaurantId||s.canonicalRestaurantId||s.landingRestaurantId),v=je(s.publicSlug||s.landingSlug).toLowerCase();return n&&p.push(`r:${n}`),v&&p.push(`s:${v}`),p}function Qs(l={},s=[]){const p=l&&typeof l=="object"?l:{};for(const n of Array.isArray(s)?s:[]){const v=je(p[n]).toLowerCase();if(v)return v}return""}function Js(l={},s=[],p=""){const n=l&&typeof l=="object"?{...l}:{},v=je(p).toLowerCase();if(!v||!Array.isArray(s)||!s.length)return{store:n,changed:!1};let m=!1;return s.forEach(O=>{n[O]!==v&&(n[O]=v,m=!0)}),{store:n,changed:m}}function Xs(l="",s=""){const p=je(l).toLowerCase();return p||je(s).toLowerCase()}function si(l={}){const s=l.state,p=l.resolvePostCountsFn,n=l.escapeHtmlFn,v=l.getOptimizedImageUrlFn,m=l.iconFn,O=l.isLocalBusinessProfileFn,B=typeof l.isCeoUserFn=="function"?l.isCeoUserFn:(()=>!1),Z=l.normalizeHandleFn,M=l.logoFitClassFn,_=l.formatCountFn,ne=l.renderProfileShopCartViewFn,ge=l.renderProfileShopFavoritesViewFn,ye=typeof l.ensurePostsDataForProfileFn=="function"?l.ensurePostsDataForProfileFn:(()=>{}),Ue=l.ensureMenuDataForProfileFn,Wn=typeof l.ensureEditorMenuDataForProfileFn=="function"?l.ensureEditorMenuDataForProfileFn:(()=>{}),De=l.ensureFocusDataForProfileFn,Yn=typeof l.ensureAdsDataForProfileFn=="function"?l.ensureAdsDataForProfileFn:(()=>{}),Kt=l.ensureTableQrStateForProfileFn,ee=l.isShopCatalogProfileFn,Qn=l.getBusinessCatalogLabelFn,$e=l.normalizeMenuTypeFn,Jn=l.primeMenuItemCountsFn,Xn=typeof l.hydrateMenuCardViewerLikesFn=="function"?l.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),Zn=l.renderShopProductListFn,ea=l.getMenuLayoutThemeFn,ta=l.menuLayoutColors,se=l.resolveMenuItemHeroFn,Y=l.isPlaceholderUrlFn,K=l.placeholderImage,na=l.getFirebaseStorageUrlFn,aa=l.isDirectImageUrlFn,qt=l.formatPriceFn,ra=typeof l.resolveCurrencyCodeForMenuItemFn=="function"?l.resolveCurrencyCodeForMenuItemFn:(()=>""),Gt=l.getMenuItemImagesFn,Q=l.getMenuItemObjectPositionFn,Be=l.getMenuItemSocialIdFn,Wt=l.menuItemMetaKeyFn,Yt=l.ensureMenuItemMetaFn,Qt=l.resolveMenuItemCountsFn,Oe=l.getFocusStateForRestaurantFn,sa=typeof l.getAdsStateForRestaurantFn=="function"?l.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),He=l.getTableQrStateForRestaurantFn,ke=l.getFocusItemObjectPositionFn,ft=l.getFocusCardClassFn,ia=l.getFocusIndexFn,be=l.isRestaurantCafeProfileFn,mt=typeof l.getBusinessProfileTypeFn=="function"?l.getBusinessProfileTypeFn:(()=>""),Te=l.getRestaurantMetaByIdFn,oa=l.buildUrlFn,la=l.normalizeSearchKeyFn,ca=l.normalizeFollowHandleFn,ce={key:"",inFlightKey:""},Jt=new Set,Ve=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},da=({profile:e=null,routePayload:t=null,surface:a=null,decision:r=null}={})=>{if(!Ve())return;const o=a&&typeof a=="object"?a:{},i=o.menu&&typeof o.menu=="object"?o.menu:{},c=e&&typeof e=="object"?e:{},d=t&&typeof t=="object"?t:{},u=d?.businessSnapshot?.identity||d?.identity||{},g=String(o.authoritativeRestaurantId||o.restaurantId||i.restaurantId||"").trim(),f=String(c.publicSlug||c.landingSlug||c.handle||u.publicSlug||u.landingSlug||u.handle||"").trim(),b=`${g||"pending"}::${f||"no-slug"}`;if(Jt.has(b))return;Jt.add(b);const h=Array.isArray(i.items)?i.items:[],w=new Set(h.map($=>String($?.category||"").trim()).filter(Boolean)).size,S=String(i.rawTruthState||i.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:g,slug:f,itemsLength:h.length,categoriesLength:w,menuStatus:String(i.status||"loading"),truthState:S,isLoading:r?.isLoading===!0,isHydrating:i.hydrating===!0||S.toLowerCase()==="hydrating",confirmedEmpty:i.confirmedEmpty===!0,canRenderItems:i.canRenderItems===!0,shouldRenderNoProducts:r?.shouldRenderNoProducts===!0,source:String(i.source||"")})},ua=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},gt=(e="")=>n(String(e||"")),Se=(e="")=>n(String(e??"")),ae=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:a=""}={})=>{if(!Ve())return"";const r=[e?`data-debug-renderer="${gt(e)}"`:"",t?`data-debug-skeleton="${gt(t)}"`:"",a?`data-debug-source="${gt(a)}"`:""].filter(Boolean);return r.length?` ${r.join(" ")}`:""},pa=(e={},t=[])=>{const a=Br(e,t);return` ${[`data-menu-state="${Se(a.menuState)}"`,`data-menu-item-count="${Se(a.menuItemCount)}"`,`data-focus-state="${Se(a.focusState)}"`,`data-focus-business-id="${Se(a.focusBusinessId)}"`,`data-focus-item-count="${Se(a.focusItemCount)}"`,`data-focus-source="${Se(a.focusSource)}"`,`data-focus-stale="${a.focusStale?"true":"false"}"`].join(" ")}`},Xt=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:a=null,routePayload:r=null,surface:o=null,decision:i=null,items:c=null,rawItems:d=null,filteredItems:u=null,renderDecision:g="",source:f=""}={})=>{const b=o&&typeof o=="object"?o:{},h=b.menu&&typeof b.menu=="object"?b.menu:{},w=b.focus&&typeof b.focus=="object"?b.focus:{},S=a&&typeof a=="object"?a:s?.profileView?.profile&&typeof s.profileView.profile=="object"?s.profileView.profile:{},$=r&&typeof r=="object"?r:s?.profileView?.routePayload&&typeof s.profileView.routePayload=="object"?s.profileView.routePayload:{},C=$?.businessSnapshot&&typeof $.businessSnapshot=="object"?$.businessSnapshot:{},j=C?.identity&&typeof C.identity=="object"?C.identity:$?.identity&&typeof $.identity=="object"?$.identity:{},k=s?.__webDirectEntry&&typeof s.__webDirectEntry=="object"?s.__webDirectEntry:{},P=String(S.publicSlug||S.landingSlug||S.handle||j.publicSlug||j.landingSlug||j.handle||k.publicSlug||"").trim(),T=String(S.restaurantId||$.restaurantId||k.restaurantId||"").trim(),L=String(S.canonicalRestaurantId||$.canonicalRestaurantId||b.authoritativeRestaurantId||k.canonicalRestaurantId||C.restaurantId||"").trim();let E="";S.canonicalRestaurantId?E="profile.canonicalRestaurantId":$.canonicalRestaurantId?E="routePayload.canonicalRestaurantId":b.authoritativeRestaurantId?E="surface.authoritativeRestaurantId":k.canonicalRestaurantId?E="webDirectEntry.canonicalRestaurantId":C.restaurantId?E="routeSnapshot.restaurantId":S.restaurantId?E="profile.restaurantId":$.restaurantId?E="routePayload.restaurantId":k.restaurantId&&(E="webDirectEntry.restaurantId");const I=String(L||b.restaurantId||h.restaurantId||T||"").trim(),R=Array.isArray(d)?d:Array.isArray(h.items)?h.items:[],N=Array.isArray(c)?c:R,U=Array.isArray(u)?u:N,y=new Set(U.map(he=>String(he?.category||"").trim()).filter(Boolean)).size,F=String(h.status||(i?.isLoading?"loading":"")||"").trim(),z=String(h.rawTruthState||h.truthState||"").trim(),D=h.confirmedEmpty===!0||i?.confirmedEmpty===!0,H=i?.hasError===!0||F==="error"||!!String(h.error||"").trim(),J=!(U.length>0||i?.hasItems===!0)&&!D&&!H,X=L||T||I||"";return{component:e,functionName:t,slug:P,businessId:I,requestedRestaurantId:T,canonicalRestaurantId:L,restaurantIdSource:E,menuReadPath:X?`restaurants/${X}/public/menu`:"",activeTab:String(s?.activeTab||"").trim(),profileTopTab:String(s?.profileTopTab||"").trim(),profileContentTab:String(s?.profileContentTab||"").trim(),itemsLength:N.length,rawItemsLength:R.length,filteredItemsLength:U.length,categoriesLength:y,focusItemsLength:Array.isArray(w.items)?w.items.length:0,loading:h.loading===!0||i?.isLoading===!0||F==="loading",pending:J,hydrating:h.hydrating===!0||z.toLowerCase()==="hydrating",status:F,truthState:z,confirmedEmpty:D,canRenderItems:h.canRenderItems===!0,renderDecision:g||(i?.shouldRenderNoProducts?"no-products":i?.isLoading?"loading":""),source:f||String(h.source||""),buildToken:ua()}},Ke=(e={})=>{Ve()&&console.warn("[mnyra:no-products-render]",{...Xt(e),stack:new Error().stack})},qe=(e="",t={})=>{Ve()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...Xt({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},x=(e,t=e,a={})=>Dr(e,{fallback:t,params:a}),fa=(e="")=>{const t=String(e||"").trim();if(!t)return x("nav.menu","Menue");const a=t.toLowerCase();return a==="menue"||a==="menu"||a==="menü"?x("nav.menu",t):a==="shop"?"Shop":t},Zt=(e="")=>{const t=String(e||"").trim();if(!t)return"";const a=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(a)?x("menu.products","Produkte"):t},ma=(e="food",t=!1)=>t?x("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?x("menu.drinks","Getraenke"):x("menu.food","Speisen"),en=(e={},t=!1)=>{const a=$e(e?.type||"food");return t?x("menu.product","Produkt"):a==="drink"?x("menu.drinkItem","Getraenk"):x("menu.foodItem","Speise")},bt=(e="",t="#111827")=>{const a=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(a)?a:t};function ga(e=null,t=null){return Ee(s,{profile:e,routePayload:t,webDirectEntry:s?.__webDirectEntry}).restaurantId}function tn(e=null,t=""){if(!e||typeof e!="object")return e;const a=String(t||"").trim();if(!a)return e;const r=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===a&&r?e:{...e,restaurantId:a,...r?{canonicalRestaurantId:r}:{}}}function ba(e=""){const t=String(e||"").trim();return t?Ee(s,{profile:s?.profileView?.profile||s?.userProfile,routePayload:s?.profileView?.routePayload,webDirectEntry:s?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function Le(e={}){const t=String(ra(e)||"").trim();return t?qt(e?.price,t):qt(e?.price)}function ha(e=[],t="",a=""){const r=String(t||"").trim(),o=String(a||"").trim();if(!r||!o)return"";const i=Array.isArray(e)?e:[];if(!i.length)return`${r}|${o}|empty`;const c=[];return i.forEach(d=>{const u=String(Be(d)||d?.id||"").trim();u&&c.push(u)}),c.length?(c.sort(),`${r}|${o}|${c.join(",")}`):`${r}|${o}|empty`}function va(e=[],t=""){const a=String(s.user?.uid||"").trim(),r=ha(e,t,a);r&&ce.inFlightKey!==r&&ce.key!==r&&(ce.key=r,ce.inFlightKey=r,Xn(e,t).catch(o=>{console.error(o),ce.key===r&&(ce.key="")}).finally(()=>{ce.inFlightKey===r&&(ce.inFlightKey="")}))}function xa(e={}){const t=String(e?.uid||"").trim();if(t&&s.followingTargetIds.includes(t))return!0;const a=String(e?.restaurantId||"").trim();if(a&&s.followingTargetIds.includes(a))return!0;const r=ca(e?.handle||"");return!!(r&&s.followingHandles.includes(r))}function nn(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const a=typeof Te=="function"&&Te(t)||null;return a?.specialEnabled===!0?!0:(a?.specialEnabled===!1,!1)}function wa(e={}){return fe(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function an(e,t,a=!0,{includeImageKey:r=!0}={}){const o=p(e),i=e.id?String(e.id):"",c=i?`data-open-post="${n(i)}"`:"",d=i?`data-post-like-count="${n(i)}"`:"",u=i?`data-post-comment-count="${n(i)}"`:"",g=r&&i?`data-img-key="profile-post:${n(i)}"`:"",f=e.type==="wide"||e.type==="hero",b=t&&f?"col-span-2":"",h=t&&f?"aspect-[1.8/1]":"aspect-[4/5]",w=f?800:400,S=f?400:500,$=String(e.posterUrl||e.thumbUrl||e.poster||"").trim(),C=e.isVideo===!0,j=C&&$?$:e.url,k=v(j,f?"large":"medium",{stableKey:i?`profile-post:${i}`:"",variantGroup:"post-detail"}),P=String(e.url||"").trim(),T=P&&!P.includes("#")?`${P}#t=0.001`:P,L=C&&!$&&P?`<video src="${n(T)}" preload="metadata" muted playsinline webkit-playsinline width="${w}" height="${S}" ${g} class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${n(k)}" loading="lazy" decoding="async" width="${w}" height="${S}" ${g} class="w-full h-full object-cover" />`;return`
    <div ${c} role="button" tabindex="0" class="${b} relative ${h} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        ${L}
        ${e.isVideo?`<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${m("play","w-3.5 h-3.5 fill-white block")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${m("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${d} class="text-[10px] font-bold tracking-wide">${n(o.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${m("message-circle","w-3 h-3 text-indigo-200")}
                <span ${u} class="text-[10px] font-bold tracking-wide">${n(o.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${i&&a?`
        <button type="button" data-profile-menu-button="${n(i)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${m("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${n(i)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${n(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${m(f?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${f?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${n(i)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${m("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function ht(e,t,a=!0,{includeImageKeys:r=!0}={}){const o=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${m("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(x("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const i=e.map(d=>an(d,o,a,{includeImageKey:r})),c=e.reduce((d,u)=>{const g=u?.type==="wide"||u?.type==="hero";return d+(g?2:1)},0);return o&&c%2===1&&i.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),i.join("")}function vt(){const e=s.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const a=v(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${n(a)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${n(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${m("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${n(t.city||"Stadt")}
            </div>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
            ${m("arrow-right","w-4 h-4")}
          </button>
        </div>
      `}).join("")}
    </div>
  `:`
      <div class="app-content-inline app-main-content-safe text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${m("map-pin","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(x("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function Ge(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}let de=null;function rn(){if(de)return de;if(typeof localStorage>"u")return de={},de;try{const e=localStorage.getItem(Bn),t=e?JSON.parse(e):{};de=t&&typeof t=="object"?t:{}}catch{de={}}return de}function ya(e={},t=""){const a=On(e);if(!a.length)return;const{store:r,changed:o}=Js(rn(),a,t);if(o&&(de=r,!(typeof localStorage>"u")))try{localStorage.setItem(Bn,JSON.stringify(r))}catch{}}function $a(e={}){const t=String(mt(e)||"").trim().toLowerCase();return t?(ya(e,t),t):Xs("",Qs(rn(),On(e)))}function We(e={}){const t=$a(e);return t==="hotel"||t==="motel"}function xt(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),a=t?Te(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{}}}function ka(e={},t=""){const a=e&&typeof e=="object"?e:{},r=String(a.id||a._id||a.offerId||a.menuItemId||t||"offer").trim();return{...a,id:r,menuItemId:String(a.menuItemId||a.targetMenuItemId||a.itemId||a.targetItemId||"").trim(),title:a.title||a.name||"Oferta",text:a.text||a.desc||a.description||"",imageUrl:a.imageUrl||a.image||a.photoUrl||"",active:a.active!==!1}}function sn(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.map((r,o)=>ka(r,`offer_${o}`)).filter(r=>{const o=String(r.id||`${r.title}|${r.text}|${r.imageUrl}`).trim();return!o||a.has(o)?!1:(a.add(o),!0)})}function Sa(e={}){const t=xt(e),a=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!a)return!1;const r=s.focus&&typeof s.focus=="object"?s.focus:{},o=String(r.restaurantId||"").trim()===a,i=String(r.truthSource||"").trim().toLowerCase();if(o&&i==="public-menu"||(o&&Array.isArray(r.items)?r.items:[]).length)return!1;const d=sn(t);return d.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(s.focus={...r,restaurantId:a,items:d,enabled:r.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:d.length?"seeded":"knownEmpty"},!0):!1}function Ia(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const a of t){if(!a||typeof a!="object")continue;const r=Number(a.lat??a.latitude),o=Number(a.lng??a.lon??a.longitude);if(Number.isFinite(r)&&Number.isFinite(o))return{lat:r,lng:o}}return null}function te(e={},t=[]){for(const a of t){const r=String(e?.[a]||"").trim();if(r)return r}return""}function Ye(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function Ca(e={}){const t=[...Ye(e.coverImages),...Ye(e.hotelCoverImages),...Ye(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(r=>String(r||"").trim()).filter(Boolean),a=[];return t.forEach(r=>{a.includes(r)||a.push(r)}),a.slice(0,8)}function Pa(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Aa(e=""){const t=String(e||"").trim(),a=s.hotelCardEditor&&typeof s.hotelCardEditor=="object"?s.hotelCardEditor:{},r=String(a.restaurantId||"").trim();return r?r===t?a:{}:Pa(a)?{}:a}function ja(e={}){const t=Array.isArray(e.features)?e.features.map(r=>String(r||"").trim()).filter(Boolean):[],a=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[te(e,["hotelFeatureOneText","gardenTerraceText"])||String(a.gardenTerrace||"").trim()||t[0]||"",te(e,["hotelFeatureTwoText","accessibilityText"])||String(a.accessibility||"").trim()||t[1]||"",te(e,["hotelFeatureThreeText","veganOptionsText"])||String(a.veganOptions||"").trim()||t[2]||""]}function Ta(e={}){const t=[],a=(r="")=>{const o=String(r||"").trim();o&&!t.includes(o)&&t.push(o)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(r=>{Array.isArray(r)&&r.forEach(o=>{typeof o=="string"?a(o):o&&typeof o=="object"&&a(o.label||o.name||o.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&a("Në plazh"),(e.restaurant||e.hasRestaurant)&&a("Restaurant"),(e.breakfast||e.breakfastIncluded)&&a("Mëngjes"),(e.pool||e.hasPool)&&a("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&a("WLAN"),(e.parking||e.freeParking||e.hasParking)&&a("Parking"),(e.spa||e.wellness)&&a("Wellness"),t.slice(0,8)}const La=[{value:"m",label:"m"},{value:"km",label:"km"}],Fa="Në qendër",_a="Në plazh",Ma=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],Ea=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],za=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function ue(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Ra(e="",{direct:t=!1}={}){const a=String(e||"").trim(),r=ue(a),o=t||r==="ne_qender"||r==="ne_plazh"||r==="direkt_ne_qender"||r==="direkt_ne_plazh"||r.includes("direkt")&&(r.includes("strand")||r.includes("zentrum")||r.includes("center"))||r.includes("am_strand")||r.includes("im_zentrum"),i=a.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),c=i?i[1].replace(",","."):"",u=(i?String(i[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:c,unit:u,isDirect:o}}function on({idPrefix:e="",iconName:t="navigation",label:a="",value:r="",directLabel:o="",direct:i=!1}={}){const c=Ra(r,{direct:i});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${m(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(a)}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(o)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${n(e)}Value" type="number" min="0" step="0.1" value="${n(c.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${n(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${La.map(d=>`<option value="${n(d.value)}" ${c.unit===d.value?"selected":""}>${n(d.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${n(o)}</span>
        <input id="${n(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${c.isDirect?"checked":""} />
      </label>
    </div>
  `}function Na(e=[],t=""){const a=String(t||"").trim(),r=new Set(e.map(ue));return`
    <option value="">Zgjidh</option>
    ${e.map(o=>`<option value="${n(o)}" ${ue(o)===ue(a)?"selected":""}>${n(o)}</option>`).join("")}
    ${a&&!r.has(ue(a))?`<option value="${n(a)}" selected>Aktuale: ${n(a)}</option>`:""}
  `}function wt({id:e="",iconName:t="badge-check",label:a="",value:r="",options:o=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${m(t,"w-4 h-4")}
        </div>
        <label for="${n(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(a)}</label>
      </div>
      <select id="${n(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${Na(o,r)}
      </select>
    </div>
  `}function Ua(e={},t=[]){const a=new Set(t.map(ue).filter(Boolean)),r=[],o=(i="")=>{const c=String(i||"").trim();if(!c)return;const d=ue(c);a.has(d)||r.some(u=>ue(u)===d)||r.push(c)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(i=>Ye(i).forEach(o)),r}function Da({existingImages:e=[],newPreviews:t=[],imageUrlDraft:a=""}={}){const r=[...t.map((c,d)=>({src:c,kind:"new",idx:d})),...e.map((c,d)=>({src:c,kind:"existing",idx:d}))].filter(c=>c.src),o=r[0]?.src||a||"",i=o?v(o,"large"):K;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${n(i||K)}" class="w-full h-52 object-cover bg-white" />
        <button type="button" id="hotelCardCoverImagesTrigger" aria-label="Ngarko foto" class="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          ${m("camera","w-5 h-5")}
          <span class="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center border border-white">
            ${m("plus","w-2.5 h-2.5")}
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
                ${c.kind==="existing"?`<span data-hotel-card-existing-image="${n(c.src)}" hidden></span>`:""}
                <img src="${n(v(c.src,"thumb"))}" class="w-full h-full object-cover" />
                <button type="button" data-hotel-card-image-remove="${c.idx}" data-hotel-card-image-source="${c.kind}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-slate-600 text-[10px] flex items-center justify-center shadow">
                  ${m("x","w-3 h-3")}
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
  `}function Ba({destinationId:e="",overrides:t={},hotelCoords:a=null}={}){const r=String(e||"").trim();if(!r||typeof document>"u")return;const o=d=>Nn({template:d,overrides:t,hotelCoords:a,imageUrlFn:u=>v(u,"medium")});let i=0;const c=()=>{const d=document.getElementById(Bt);if(!d){i++<20&&requestAnimationFrame(c);return}String(d.dataset.destinationId||"")===r&&d.dataset.destinationFilled!==r&&Ys(r).then(u=>{const g=document.getElementById(Bt);!g||String(g.dataset.destinationId||"")!==r||(g.dataset.destinationFilled=r,g.innerHTML=u?o(u):"")}).catch(()=>{})};typeof requestAnimationFrame=="function"?requestAnimationFrame(c):queueMicrotask(c)}function Oa(e={}){return sn(e).filter(t=>t.active!==!1&&String(t.title||"").trim())}function ln(e={}){const t=xt(e),a=Ia(t),r=te(t,["address","primaryAddress","location","formattedAddress","street"]),o=te(t,["city","locationCity","primaryCity","region","country"]),i=te(t,["rating","reviewRating","stars","hotelStars"]),c=te(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),d=te(t,["reviewSummary","ratingSummary","commentsSummary"]),u=Ta(t),g=Oa(t),f=String(t.destinationId||"").trim(),b=String(t.destinationName||"").trim(),h=Vn(t.destinationOverrides||{}),w=a?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.lat},${a.lng}`)}`:r||o?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r} ${o}`.trim())}`:"";js();const S=f?Gn(f):null,$=S?Nn({template:S,overrides:h,hotelCoords:a,imageUrlFn:C=>v(C,"medium")}):"";return f&&!S&&Ba({destinationId:f,overrides:h,hotelCoords:a}),`
    <div class="app-content-inline app-main-content-safe animate-in fade-in duration-300">
      ${Us({offers:g,amenities:u,address:r,city:o,destinationId:f,destinationName:b,destinationSectionsHtml:$,mapsUrl:w,rating:i,reviewCount:c,ratingSummary:d,imageUrlFn:C=>v(C,"medium")})}
    </div>
  `}function Ha(e={}){const t=xt(e),a=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),r=t?.name||t?.restaurantName||e?.name||"Hotel",o=Aa(a),i=String(o.status||"").trim(),c=o.saving===!0,d=Array.isArray(o.existingImages)?o.existingImages.map(R=>String(R||"").trim()).filter(Boolean):Ca(t),u=Array.isArray(o.imagePreviews)?o.imagePreviews.map(R=>String(R||"").trim()).filter(Boolean):[],g=String(o.imageUrlDraft||"").trim(),[f,b,h]=ja(t),w=Ua(t,[f,b,h]),S=te(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),$=te(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),C=te(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),j=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,k=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,P=o.detailsOpen===!0||c,T=u[0]||d[0]||"",L=T?v(T,"thumb"):K,E=[S,$,C?`${C} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",I=i.includes("fehl")||i.includes("Bitte")||i.includes("Nuk");return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel Card</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(r)}</p>
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
            <button type="button" data-hotel-card-details-open aria-expanded="${P?"true":"false"}" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
              ${m("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${P?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${n(L||K)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${n(r)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(E)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${P?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${m("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${i&&!P?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${I?"text-rose-500":"text-slate-500"}">${n(i)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${n(a)}" data-hotel-card-details-panel class="${P?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
                <h3 class="text-xl font-black italic tracking-tighter">Hotel Details</h3>
              </div>
              <button type="button" data-hotel-card-details-close class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
                ${m("x","w-4 h-4")}
              </button>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fotot</p>
              ${Da({existingImages:d,newPreviews:u,imageUrlDraft:g})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${on({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:S,directLabel:Fa,direct:j})}
              ${on({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:$,directLabel:_a,direct:k})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${n(C)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${wt({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:f,options:Ma})}
              ${wt({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:b,options:Ea})}
              ${wt({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:h,options:za})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Të tjera</label>
                <textarea id="hotelCardCustomFeaturesText" rows="4" placeholder="Pool&#10;Spa&#10;Recepsion 24/7" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${n(w.join(`
`))}</textarea>
              </div>
            </div>

            ${i?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${I?"text-rose-500":"text-slate-500"}">${n(i)}</div>`:""}

            <button id="hotelCardSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
              ${c?"Po ruhet...":"Ruaj Hotel Details"}
            </button>
        </div>
        ${Lt(a,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function Qe(e={}){const t=String(s.profileTopTab||"").trim().toLowerCase(),a=String(s.profileContentTab||"").trim().toLowerCase();return Ge(e)?t==="menu"?"menu":a==="menu"||a==="posts"?a:"posts":a==="media"||a==="checkins"?a:"posts"}function yt(e={}){const t=String(s.profileTopTab||"").trim().toLowerCase();return Ge(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(s.user?.uid||"").trim()?"favorites":"profile"}function cn(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Va(e=0,t=1){const a=Math.max(1,Number(t||0)||1),r=Math.round(Number(e||0));if(!Number.isFinite(r))return 0;const o=r%a;return o<0?o+a:o}function Ka(e=0){return cn(e)}function qa(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],a=cn(s.profileLandingStep),r=Va(s.profileLandingGreetingIndex,t.length),o=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},i=String(o.businessName||e.name||"casarita").trim()||"casarita",c=bt(o.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),d=c&&c.toLowerCase()!=="#111827"?c:"",u=bt(o.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||c||"","#111827"),g=bt(o.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||d||"","#4f46e5"),f=i.replace(/\.+$/g,"").trim()||i,b=f.split(/\s+/).filter(Boolean),h=b.length>1?b.slice(0,-1).join(" "):f,w=b.length>1?b[b.length-1]:"",S=w?h:`${h}.`,$=w?`${w}.`:"",C=v(o.logoUrl||e.avatar||"","avatar"),k=String(C||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",P=String(o.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),T=String(o.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),L=a>=2,E=a>=3,I=Array.isArray(s.profileView?.posts)?s.profileView.posts:Array.isArray(e?.posts)?e.posts:[],R=Ka(a),N=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${m("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(U=>{const y=R===U;return`
            <div data-landing-step-dot="${U}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${y?"1.22":"1"}); opacity: ${y?"1":"0.88"}; background: ${y?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${y?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${y?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${a===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${a===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((U,y)=>{const F=y===r,z=y===(r-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${y}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${F?"opacity: 1; transform: translateY(0) scale(1);":z?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!F&&!z?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${n(U)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${n(k)}" alt="${n(`${i} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${n(u)};">${n(S)}</span>${$?`<span style="color:${n(g)};">${n($)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${n(P)}<br />
            ${n(T)}
          </p>
        </div>
        ${N}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${a<1?"translate-y-full":a===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===1?"1":"0"}; pointer-events: ${a===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${Ze(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${N}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${a<2?"translate-y-full":a===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===2?"1":"0"}; pointer-events: ${a===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${L?Ze(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${N}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${a<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${a===3?"1":"0"}; pointer-events: ${a===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${E?Ze(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function $t(e=s.profileView?.profile||s.userProfile,{landingPreview:t=!1,selectedTabOverride:a="",compact:r=!1}={}){const o=Ge(e),i=String(a||Qe(e)).trim().toLowerCase()||"posts",c=We(e),d=ee(e),u=c?"Details":d?"Shop":x("nav.menu","Menue"),g=o?[{id:"posts",label:x("profile.posts","Beitraege")},{id:"menu",label:u,surface:c?"hotel-details":"menu"}]:[{id:"posts",label:x("profile.posts","Beitraege")},{id:"media",label:x("profile.media","Medien")},{id:"checkins",label:x("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${r?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${g.map(f=>`
          <button data-profile-tab="${f.id}" ${f.surface?`data-profile-tab-surface="${n(f.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${i===f.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${f.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function kt(e=s.profileView?.profile||s.userProfile,{disabled:t=!1}={}){const a=Qe(e);return a==="checkins"||a==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${n(x("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${s.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${m("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${s.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${m("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function q(e=""){return String(e||"").trim()}const dn="mnyra_business_title_image_cache_v1",un=80;function pn(){if(!s)return{};const e=s.businessTitleImageCache&&typeof s.businessTitleImageCache=="object"?s.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const r=(typeof window<"u"?window.localStorage:null)?.getItem?.(dn)||"",o=r?JSON.parse(r):{};o&&typeof o=="object"&&Object.entries(o).forEach(([i,c])=>{const d=q(i),u=q(c);d&&u&&!Y(u)&&(t[d]=u)})}catch{}return s.businessTitleImageCache={loaded:!0,items:t},t}function Ga(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(dn,JSON.stringify(e))}catch{}}function Wa(e={},t="business"){const a=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(r=>q(r)).filter(Boolean);return[...new Set(a)]}function Ya(e=[],t=""){const a=q(t);if(!a||Y(a))return;const r=pn();let o=!1;e.forEach(c=>{const d=q(c);!d||r[d]===a||(r[d]=a,o=!0)});const i=Object.entries(r);if(i.length>un){const c=i.slice(i.length-un);Object.keys(r).forEach(d=>delete r[d]),c.forEach(([d,u])=>{r[d]=u}),o=!0}o&&Ga(r)}function Qa(e=[]){const t=pn();for(const a of e){const r=q(a),o=r?q(t[r]):"";if(o&&!Y(o))return o}return""}function Ja(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function Xa(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function Za(e={}){const a=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(r=>String(r||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||a||"").trim()}function er(e={},t={}){const a=Za(e),r=Array.isArray(t.cacheKeys)?t.cacheKeys:[],o=q(t.stableKey||r[0]||"");if(!a){if(t.allowCacheFallback===!0){const c=Qa(r);if(c)return c;const d=o?v("","medium",{stableKey:o}):"";return d&&!Y(d)?d:""}return""}const i=v(a,"medium",o?{stableKey:o}:void 0);return i&&!Y(i)?(Ya(r,i),i):""}function fn(e="",t=""){const a=q(e);if(!a)return"";if(/^https?:\/\//i.test(a))return a;const r=a.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return r?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(r)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(r)}`:"":""}function tr(e=""){const t=q(e);if(!t)return"";const a=t.replace(/[^\d+]/g,"");return a?`tel:${a}`:""}function nr(e={}){const t=Number(e?.gpsLat??e?.lat),a=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(a))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${a}`)}`;const r=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(o=>q(o)).filter(Boolean).join(", ");return r?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r)}`:""}function Je({href:e="",label:t="",iconName:a="",body:r="",buttonAttrs:o=""}={}){const i=q(e),c=String(o||"").trim();if(!i&&!c)return"";const d=r||m(a,"w-4 h-4"),u="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return c?`
    <button type="button" ${c} title="${n(t)}" aria-label="${n(t)}" class="${u}">
      ${d}
    </button>
  `:`
    <a href="${n(i)}" target="_blank" rel="noreferrer" title="${n(t)}" class="${u}">
      ${d}
    </a>
  `}function Xe({href:e="",buttonAttrs:t="",iconName:a="",eyebrow:r="",value:o=""}={}){const i=q(o);if(!i)return"";const c=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${m(a,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${n(r)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n(i)}</span>
    </div>
  `;return e?`<a href="${n(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</button>`}function ar({profileName:e="",safeBio:t="",metaLine:a="",identityPending:r=!1,followersLabel:o=""}={}){return`
    <div aria-hidden="true" style="grid-area:1/1;visibility:hidden;pointer-events:none;min-width:0;max-width:100%;overflow:hidden;">
      <div class="h-40 w-full"></div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px]"></div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(String(o))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(x("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <div class="flex flex-col items-center min-w-0">
              <span class="h-7 flex items-center justify-center text-slate-900"></span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(x("profile.info","Info"))}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${t}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(a)}</p>
          ${r?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(x("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function mn(e={},t={}){const a=t.mode==="self"?"self":"public",r=t.disabledBlockClass||"",o=Ja(e,a),i=a==="self"?"avatar:self":`avatar:public:${o}`,c=t.avatarUrl||v(e.avatar||"","avatar",{stableKey:i}),d=t.avatarFit||M(!!e.restaurantId),u=String(s?.profileCardInfoOpen||"")===o,g=Number(s?.profileCardInfoHeights?.[o]||0),f=u&&Number.isFinite(g)&&g>0?`height:${Math.ceil(g)}px;`:"",b=t.avatarImgKeyAttr||(a==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${n(o)}"`),h=t.renderAvatarImage===!0?!!String(c||"").trim()&&!Y(c):t.renderAvatarImage!==!1&&!!String(c||"").trim()&&!Y(c)&&!!String(e?.avatar||"").trim(),w=!!t.identityPending,S=t.followersLabel??_(e.followers),$=q(e?.name)||"User",C=q(t.typeLabel||e?.customerType||e?.type||"Business"),j=q(e?.location||"-"),k=a==="public"?`${j} / ${C}`:j,P=t.bioHtml||n(e?.bio||"").replace(/\n/g,"<br>")||n(x("profile.noBio","Noch keine Bio.")),T=`business-cover:${o}`,L=Wa(e,o),E=er(e,{cacheKeys:L,stableKey:T,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),I=nr(e),R=Xa(e),N=Je(R?{buttonAttrs:`data-marketplace-open-map="${n(R)}"`,label:x("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:I,label:x("profile.openMap","Karte oeffnen"),iconName:"map"}),U=fn(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),y=fn(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),F=q(e?.phone||e?.telephone||e?.contactPhone||""),z=tr(F),D=q(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(J=>q(J)).filter(Boolean).join(", ")),H=[Xe({href:U,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),Xe({href:y,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),W=a==="self"?`
      <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${m("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${m("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle||"")}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?m("check","w-4 h-4"):""}
          ${n(t.followLabel||x("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${m("message-circle","w-5 h-5")}
      </button>
    `;if(u){const J=[Xe({href:z,iconName:"phone",eyebrow:x("profile.call","Anrufen"),value:F}),Xe({href:I,iconName:"map-pin",eyebrow:x("profile.address","Adresse"),value:D||j}),H].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${n(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${r}" style="${f}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${ar({profileName:$,safeBio:P,metaLine:k,identityPending:w,followersLabel:S})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${n(o)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${m("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(x("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(j)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${J||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(x("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${n(o)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${n(x("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${n(o)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${r}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${E?`<img src="${n(E)}" data-img-key="${n(T)}" alt="${n($)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${m("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${N}
          ${Je({href:y,label:"TikTok",iconName:"music-2"})}
          ${Je({href:U,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${a==="self"?'id="profileAvatarTrigger"':""} class="relative ${a==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${h?`<img src="${n(c)}" data-fallback-src="${n(K)}" decoding="async" width="100" height="100" ${b} class="w-full h-full rounded-[1.8rem] ${d} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${w?"animate-pulse":""}">${m("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${m("badge-check","w-4 h-4 fill-blue-500 text-white")}
              </div>
            `:""}
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div data-landing-tutorial-target="fans" class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl ${w?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(String(S))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(x("profile.fans","Fans"))}</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <button type="button" data-profile-card-info-open="${n(o)}" class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${m("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(x("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n($)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${P}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(k)}</p>
          ${w?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(x("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${W}
        </div>
      </div>
    </div>
  `}function Ze(e={},t=[],{topTabOverride:a="",tutorialMode:r=!1,contentTabOverride:o="",landingHideContent:i=!1,collapseIdentity:c=!1,contentReveal:d=!1,landingMode:u=!1}={}){const g=xa(e),f=!!e.privateAccount&&e.uid&&String(e.uid)!==String(s.user?.uid||"")&&!g,b=!!e.pendingFollowRequest&&!g,h=e.restaurantId?"Business":x("nav.user","User"),w=String(e.handle||Z(e.name||"user")).replace(/^@/,""),$=n(e.bio||"").replace(/\n/g,"<br>")||n(x("profile.noBio","Noch keine Bio.")),C=Ge(e),j=String(a||yt(e)).trim().toLowerCase()||"profile",k=String(o||Qe(e)).trim().toLowerCase()||"posts",P=k==="menu",T=k==="checkins",L=t,I={...s?.profileView&&typeof s.profileView=="object"?s.profileView:{},profile:e,posts:Array.isArray(L)?L:[]},R=Or(s,{profileView:I,profileTopTab:j,profileContentTab:k}),N=String(R?.header?.status||"").trim().toLowerCase()||"loading",U=String(R?.posts?.status||"").trim().toLowerCase()||"loading",y=e.uid||e.restaurantId||w||"public",F=`avatar:public:${y}`,z=String(e?.avatar||"").trim(),D=v(z,"avatar",{stableKey:F}),H=M(!!e.restaurantId),W=u?"":`data-img-key="avatar:public:${n(y)}"`,J=!z&&!!String(D||"").trim()&&!Y(D),X=!!z||J&&ze(N),he=zt=>{if(zt==null)return!1;const En=Number(zt);return Number.isFinite(En)&&En>=0},Et=X||he(e?.followers)||he(e?.following),ie=ze(N)&&!Et,ve=!!String(D||"").trim()&&!Y(D)&&X,at=ie?"...":_(e.followers),rt=ie?"...":_(e.following),st=C?"pt-2":"pt-10",it=g?x("profile.following","Following"):b?x("profile.requested","Requested"):f?x("profile.request","Request"):x("profile.follow","Follow"),_e=g?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":b?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",Me=r?"select-none":"app-main-content-safe",oe=r?"pointer-events-none":"",re=!c,_n=!i,ot=d?u?"transition-opacity duration-200":"animate-in fade-in duration-300":"",Mn=k==="posts"&&L.length>0,zr=k!=="posts"||Mn||U==="empty"||U==="error",Rr=k==="posts"&&!Mn&&U==="error";return!r&&(k==="posts"||k==="media")&&e?.restaurantId&&ze(U)&&ye(e),`
    <div class="${Me}" ${r?'data-landing-tutorial-surface="true"':""}>
      ${j==="profile"||j==="menu"?`
      ${re?`
        <div class="app-content-inline pb-2 ${st}">
          ${C?mn(e,{mode:"public",disabledBlockClass:oe,avatarUrl:D,avatarFit:H,avatarImgKeyAttr:W,renderAvatarImage:ve,identityPending:ie,followersLabel:at,followLabel:it,followTone:_e,isFollowing:g,hasPendingFollowRequest:b,isLocked:f,bioHtml:$,typeLabel:h,allowTitleImageCacheFallback:ze(N)||ze(U)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${oe}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${ve?`<img src="${n(D)}" data-fallback-src="${n(K)}" decoding="async" width="100" height="100" ${W} class="w-full h-full rounded-[1.8rem] ${H} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${ie?"animate-pulse":""}">${m(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${m("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ie?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(at)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(x("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${ie?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(rt)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(x("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
                ${C?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(w)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${$}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")} / ${h}</p>
                ${ie?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(x("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle)}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${b?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${_e} ${b?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${g?m("check","w-4 h-4"):""}
                    ${it}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${f?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${f?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${m("message-circle","w-5 h-5")}
                </button>
              </div>
            </div>
          </div>
          `}
        </div>
      `:""}

      ${f?`
        <div class="app-content-inline pt-4">
          <div class="bg-white rounded-[2.2rem] border border-slate-100 p-8 text-center">
            <div class="w-16 h-16 rounded-[1.6rem] bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-4">
              ${m("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${n(x("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${n(x("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${$t(e,{landingPreview:r,selectedTabOverride:k,compact:c})}
        ${_n?kt(e,{disabled:r}):""}

        ${_n?P?`
          <div class="${oe} ${ot}">
            ${We(e)?ln(e):nt(e,{mode:u?"landing":"profile",allowAutoEnsure:!u})}
          </div>
        `:T?`
          <div class="${oe} ${ot}">
            ${vt()}
          </div>
        `:`
          ${zr?`
            ${Rr?`
              <div class="app-content-inline ${oe}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${n(x("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${s.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${oe} ${ot}">
                ${ht(L,s.profileViewMode,!1,{includeImageKeys:!u})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${oe}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${ot}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(x("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${j==="cart"?ne(e):j==="favorites"?ge(e):""}
      `}
    </div>
  `}function rr(){const e=s.profileView;if(!e||!e.profile)return"";const t=e.profile,a=e.posts||t.posts||[],r=yt(t);return r==="landing"?qa(t):Ze(t,a,{topTabOverride:r,tutorialMode:!1})}function gn(e,{filter:t="all",query:a=""}={}){const r=Array.isArray(e)?e:[],o=la(a||"");return r.filter(i=>t==="all"||$e(i.type)===t?o?`${i.name||""} ${i.category||""} ${i.description||""}`.toLowerCase().includes(o):!0:!1)}function bn(e,t=0){const a=Number(e);return Number.isFinite(a)?Math.max(0,Math.floor(a)):Math.max(0,Number(t)||0)}function et(e=[]){return(Array.isArray(e)?e.slice():[]).map((a,r)=>({item:a,idx:r,order:bn(a?.orderIndex,r)})).sort((a,r)=>a.order-r.order||a.idx-r.idx).map((a,r)=>({...a.item,orderIndex:bn(a.item?.orderIndex,r)}))}function St(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function Fe(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":$e(e?.type||"food")==="drink"?"drink":"food"}function sr(e={}){return String(e?.category||x("menu.other","Sonstiges")).trim()||x("menu.other","Sonstiges")}function ir(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const or=4,lr={thumb:160,small:480,medium:768,large:1280};function hn({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<or&&a===0}function cr({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){const r=hn({mode:e,priorityIndex:t,slideIndex:a}),o=e==="profile"?' data-image-reveal="menu"':"";return r?`loading="eager" fetchpriority="high"${o}`:`loading="lazy" fetchpriority="low"${o}`}function dr({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function pe(e,{mode:t="profile",priorityIndex:a=-1,slideIndex:r=0,stableKey:o="",preferredSize:i="small",candidateSizes:c=["small","medium","large"],variant:d="grid"}={}){const u=String(e||"").trim(),g=t==="profile"&&o?{stableKey:o}:null,f=hn({mode:t,priorityIndex:a,slideIndex:r}),b=t==="profile"&&!f&&d!=="thumb",h=v(u,i,g),w=Y(h)?K:h,S=na(u),$=aa(u)&&u!==w?u:S,C=[],j=new Set;c.forEach(y=>{const F=lr[y]||0;if(!F)return;const z=v(u,y,g);if(!z||Y(z))return;const D=`${z}|${F}`;j.has(D)||(j.add(D),C.push(`${z} ${F}w`))});const k=C.length>1?C.join(", "):"",P=k?dr({variant:d}):"",T=b?"":k,L=b?"":P,E=T?` srcset="${n(T)}"`:"",I=L?` sizes="${n(L)}"`:"",R=cr({mode:t,priorityIndex:a,slideIndex:r}),N=`${R}${E}${I}`,U=b?[`data-menu-lazy-src="${n(w)}"`,`data-menu-lazy-fallback="${n($||K)}"`,k?`data-menu-lazy-srcset="${n(k)}"`:"",P?`data-menu-lazy-sizes="${n(P)}"`:""].filter(Boolean).join(" "):"";return{safeImg:b?K:w,fallbackImg:b?K:$,imageAttrs:N,lazyAttrs:U?` ${U}`:"",srcsetValue:k,sizesValue:P,loadingAttrs:R}}function Ie(e=[],t,a=null){const r=a instanceof Set?a:new Set;return e.map((o,i)=>{const c=sr(o),d=ir(c),u=!!d&&!r.has(d);return u&&r.add(d),`<div${u?` data-menu-category-anchor="${n(d)}"`:""} class="h-full">${t(o,i)}</div>`}).join("")}function It(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function ur(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function vn(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),a=ur(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),r=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&a?{type:"link",url:a,productId:""}:t==="product"&&r?{type:"product",url:"",productId:r}:{type:"self",url:"",productId:""}}function xn(){const e=ee(s.userProfile),t=String(s.menu.filter||"all").trim().toLowerCase()||"all",a=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:x("menu.all","Alle")},{id:"food",label:x("menu.products","Produkte")}]:[{id:"all",label:x("menu.all","Alle")},{id:"food",label:x("menu.food","Speisen")},{id:"drink",label:x("menu.drinks","Getraenke")}]).map(o=>`
        <button data-menu-filter="${o.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${a===o.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${o.label}
        </button>
      `).join("")}
    </div>
  `}function pr(){const e=ea().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${ta.map(t=>{const a=t.id===e,r=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${a?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${a?m("check",`w-4 h-4 ${r}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function tt(e,{poster:t="",objectPosition:a="50% 50%",badge:r=!0}={}){if(!Rt(e))return"";const o=String(e.videoUrl||"").trim();if(!o)return"";const i=t?` poster="${n(t)}"`:"";return`<video data-autoplay-video src="${n(o)}"${i} class="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]" style="object-position:${a};" muted loop playsinline autoplay preload="metadata"></video>`+(r?'<div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-10"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white block"><path d="M8 5v14l11-7z"></path></svg></div>':"")}function Ct(e,{mode:t="profile",priorityIndex:a=-1}={}){const r=se(e),o=t==="profile"?Ce(e,{index:0}):"",{safeImg:i,fallbackImg:c,imageAttrs:d,lazyAttrs:u}=pe(r,{mode:t,priorityIndex:a,stableKey:o,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),g=Le(e),f=s.activeTab==="menu"?s.userProfile:s.profileView?.profile||s.userProfile,b=ee(f),h=en(e,b),w=b?Zt(e.category):e.category||"",S=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${n(i)}" data-fallback-src="${n(c)}"${u} class="w-full h-full object-cover" style="object-position:${Q(e)};" ${d} decoding="async" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-black text-slate-900 truncate">${n(e.name||x("menu.product","Produkt"))}</p>
            <span class="text-[12px] font-black text-slate-900 whitespace-nowrap">${n(g)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
            ${w?`<span>${n(w)}</span>`:""}
            <span>${n(h)}</span>
          </div>
        </div>
        <details class="relative shrink-0">
          <summary class="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center cursor-pointer" style="list-style:none;">
            ${m("more-horizontal","w-4 h-4")}
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
        <img src="${n(i)}" data-fallback-src="${n(c)}"${u} class="w-full h-full object-cover" style="object-position:${Q(e)};" ${d} decoding="async" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-black text-slate-900 truncate">${n(e.name||x("menu.product","Produkt"))}</p>
          <span class="text-xs font-black text-slate-900">${n(g)}</span>
        </div>
        <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          ${w?`<span>${n(w)}</span>`:""}
          <span>${n(h)}</span>
        </div>
        ${S?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(S)}</p>`:""}
      </div>
    </div>
  `}function Pt(e,{mode:t="profile",variant:a="food",priorityIndex:r=-1}={}){const o=se(e),i=t==="profile"?Ce(e,{index:0}):"",c=a==="drink",{safeImg:d,fallbackImg:u,imageAttrs:g,lazyAttrs:f}=pe(o,{mode:t,priorityIndex:r,stableKey:i,preferredSize:c?"small":"medium",candidateSizes:c?["small","medium"]:["small","medium","large"],variant:c?"grid":"hero"}),b=Le(e),h=s.activeTab==="menu"?s.userProfile:s.profileView?.profile||s.userProfile,w=ee(h),S=en(e,w),$=w?Zt(e.category):e.category||"",C=e.description||"",j=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",k=s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"",P=Be(e),T=Wt(k,P),L=T?Yt(T):{likes:[],comments:[],counts:{likes:0,comments:0}},E=Qt(L),I=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${m("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${n(P)}">${n(_(E.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${m("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${n(P)}">${n(_(E.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${j} class="w-full ${c?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${c?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100 relative">
        <img src="${n(d)}" data-fallback-src="${n(u)}"${f} class="w-full h-full object-cover" style="object-position:${Q(e)};" ${g} decoding="async" />
        ${tt(e,{poster:d,objectPosition:Q(e)})}
      </div>
      ${c?`
        <div class="mt-3 flex flex-1 flex-col">
          <p class="text-sm font-black text-slate-900 leading-snug">${n(e.name||x("menu.product","Produkt"))}</p>
          <p class="text-xs font-black text-slate-700 mt-1">${n(b)}</p>
          ${I}
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            <p class="text-sm font-black text-slate-900">${n(e.name||x("menu.product","Produkt"))}</p>
            <span class="text-xs font-black text-slate-900">${n(b)}</span>
          </div>
          <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
            ${$?`<span>${n($)}</span>`:""}
            <span>${n(S)}</span>
          </div>
          ${C?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(C)}</p>`:""}
          ${I}
        </div>
      `}
    </div>
  `}function At(e={}){if(!e?.restaurantId||ee(e))return!1;const t=String(mt(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":be(e)}function wn(e){const t=e?.restaurantId||s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"",a=Be(e),r=Wt(t,a),o=r?Yt(r):{likes:[],comments:[],counts:{likes:0,comments:0}},i=String(s.user?.uid||"").trim(),c=String(s.user?.handle||"").trim().toLowerCase(),d=!!o.likes?.some(u=>{const g=String(u?.uid||"").trim();if(i&&g&&g===i)return!0;const f=String(u?.handle||"").trim().toLowerCase();return!!c&&!!f&&f===c});return{itemId:a,meta:o,counts:Qt(o),isLiked:d}}function Ce(e,{index:t=0}={}){const a=String(e?.restaurantId||s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"").trim(),r=String(e?.id||Be(e)||"").trim();if(!a||!r)return"";const o=Number(t),i=Number.isFinite(o)?Math.max(0,Math.floor(o)):0;return`menu-detail:${a}:${r}:${i}`}function fr(e){const t=typeof Gt=="function"?Gt(e):[],a=Array.isArray(t)?t.filter(Boolean):[];if(a.length)return a;const r=se(e);return r?[r]:[]}function fe(e){return Nr(e?.cardStyle||"",$e(e?.type||"food"))}function jt(e,{menuItemId:t=""}={}){if(!e)return null;const a=String(t||e.menuItemId||e.itemId||e.productId||"").trim(),r=Rt(e),o=String(e.videoUrl||"").trim(),i=String(e.posterUrl||"").trim(),c=se(e)||e.imageUrl||(r?i:"")||"";return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:c,objectPosition:e.objectPosition||Q(e),menuItemId:a,mediaType:r?"video":"image",videoUrl:r?o:"",posterUrl:r?i||c:""}}function A(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function mr(e={}){return qe("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${ft()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${ae({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex items-center justify-between mb-4">
          ${A("h-3 w-24 rounded-full")}
        <div class="flex items-center gap-2">
          ${A("w-9 h-9 rounded-full")}
          ${A("w-9 h-9 rounded-full")}
        </div>
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${A("w-full h-56")}
      </div>
      <div class="mt-4 space-y-2">
        ${A("h-5 w-2/3 rounded-full")}
        ${A("h-4 w-full rounded-full")}
        ${A("h-4 w-3/5 rounded-full")}
      </div>
    </div>
  `}function gr(e={}){return qe("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${ae({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
        <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
          <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
            ${A("w-full h-full")}
          </div>
          <div class="px-2 py-4 space-y-2">
            ${A("h-5 w-2/3 rounded-full")}
            ${A("h-4 w-full rounded-full")}
            ${A("h-4 w-1/2 rounded-full")}
          </div>
        </div>
      </div>
    </div>
  `}function br(){return`
    <div class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col relative" aria-hidden="true">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        ${A("w-full h-full")}
        ${A("absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90")}
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="mb-1 space-y-2">
          ${A("h-4 w-4/5 rounded-full")}
          ${A("h-3 w-3/5 rounded-full")}
        </div>
        ${A("h-3 w-full rounded-full mb-1")}
        ${A("h-3 w-2/3 rounded-full mb-3")}
        <div class="mt-auto pt-2 flex items-center justify-between">
          ${A("h-4 w-14 rounded-full")}
          ${A("w-8 h-8 rounded-full bg-slate-900/10")}
        </div>
      </div>
    </div>
  `}function hr(){return`
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;" aria-hidden="true">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${A("w-full h-full")}
        ${A("absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90")}
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div class="min-w-0 flex-1">
            ${A("h-5 w-4/5 rounded-full")}
          </div>
          ${A("h-5 w-14 rounded-full shrink-0")}
        </div>
        ${A("h-4 w-full rounded-full mb-2")}
        ${A("h-4 w-2/3 rounded-full mb-4")}
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div></div>
          <div class="h-11 w-32 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  `}function yn(e={}){return qe("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${ae({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>br()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>hr()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function $n(e="food"){const t=e==="drink";return`
    <div class="w-full ${t?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm" aria-hidden="true">
      <div class="w-full ${t?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100">
        ${A("w-full h-full")}
      </div>
      ${t?`
        <div class="mt-3 flex flex-1 flex-col space-y-2">
          ${A("h-4 w-4/5 rounded-full")}
          ${A("h-3 w-1/2 rounded-full")}
          <div class="mt-2 flex items-center gap-3">
            ${A("h-3 w-10 rounded-full")}
            ${A("h-3 w-10 rounded-full")}
          </div>
        </div>
      `:`
        <div class="mt-4">
          <div class="flex items-start justify-between gap-4">
            ${A("h-4 w-3/5 rounded-full")}
            ${A("h-4 w-14 rounded-full")}
          </div>
          ${A("h-3 w-2/5 rounded-full mt-2")}
          ${A("h-3 w-full rounded-full mt-3")}
          ${A("h-3 w-2/3 rounded-full mt-2")}
          <div class="mt-3 flex items-center gap-3">
            ${A("h-3 w-10 rounded-full")}
            ${A("h-3 w-10 rounded-full")}
          </div>
        </div>
      `}
    </div>
  `}function vr(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${ae({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
        <div class="rounded-[1.5rem] overflow-hidden bg-slate-100" style="aspect-ratio:4 / 5;">
        ${A("w-full h-full")}
      </div>
      <div class="pt-3 flex-1 flex flex-col min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1 space-y-2">
            ${A("h-4 w-full rounded-full")}
            ${A("h-4 w-3/5 rounded-full")}
          </div>
          ${A("h-3 w-10 rounded-full shrink-0")}
        </div>
        ${A("h-3 w-full rounded-full mt-3")}
        ${A("h-3 w-2/3 rounded-full mt-2")}
      </div>
    </article>
  `}function kn({isShop:e=!1,debugContext:t={}}={}){return qe(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${ae({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>vr()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${ae({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${A("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>$n("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${A("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>$n("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Sn(e,t=[],{mode:a="profile"}={}){const r=e?.restaurantId||"",o=At(e)||ee(e);return!r||!o||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((i,c)=>{const d=i.imageUrl||"",u=String(i.menuItemId||i.id||"").trim(),{safeImg:g,fallbackImg:f,imageAttrs:b,lazyAttrs:h}=pe(d,{mode:a,priorityIndex:c,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:u?`menu-focus:${r}:${u}`:""}),w=String(i.menuItemId||"").trim(),S=a==="profile"&&w?`data-menu-open="${n(w)}" role="button"`:"";return`
            <div ${S} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${S?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${n(g)}" data-fallback-src="${n(f)}"${h} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${i.objectPosition||"50% 50%"};" ${b} decoding="async" />
                ${tt(i,{poster:g,objectPosition:i.objectPosition||"50% 50%",badge:!1})}
                <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${m("sparkles","w-3 h-3 text-amber-500")}
                  <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
                </div>
              </div>
              <div class="px-2 py-4">
                <h3 class="text-[17px] font-black text-slate-900 leading-tight">${n(i.title||"")}</h3>
                <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${n(i.text||"")}</p>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>
  `}function In(e,{mode:t="profile",priorityIndex:a=-1}={}){const r=se(e),o=t==="profile"?Ce(e,{index:0}):"",{safeImg:i,fallbackImg:c,imageAttrs:d,lazyAttrs:u}=pe(r,{mode:t,priorityIndex:a,stableKey:o,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),g=Le(e),f=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",{itemId:b,counts:h,isLiked:w}=wn(e);return`
    <div ${f} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${n(i)}" data-fallback-src="${n(c)}"${u} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Q(e)};" ${d} decoding="async" />
        ${tt(e,{poster:i,objectPosition:Q(e)})}
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${m("heart","w-3.5 h-3.5 fill-current opacity-80")}
        </button>
      </div>
      <div class="px-1.5 pb-1 flex flex-col flex-1">
        <div class="flex items-start justify-between gap-2 mb-1">
          <h4 class="text-[14px] font-black text-slate-900 leading-tight">${n(e.name||"")}</h4>
        </div>
        <p class="text-[12px] text-slate-500 leading-relaxed mb-3">${n(e.description||"")}</p>
        <div class="mt-auto pt-2 flex items-center justify-between">
          <span class="text-[14px] font-black text-slate-900">${n(g)}</span>
          <button type="button" class="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-600 transition-colors active:scale-95">
            ${m("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${n(b)}">${n(_(h.likes))}</span>
          <span data-menu-comment-count="${n(b)}">${n(_(h.comments))}</span>
        </div>
      </div>
    </div>
  `}function xr(e,t="profile"){if(t!=="profile")return"";const a=vn(e);return a.type==="link"&&a.url?`data-menu-special-link="${n(a.url)}" role="button" tabindex="0"`:a.type==="product"&&a.productId?`data-menu-open="${n(a.productId)}" role="button"`:`data-menu-open="${n(e.id)}" role="button"`}function Tt(e,{mode:t="profile",size:a="default",priorityIndex:r=-1}={}){const o=se(e),i=t==="profile"?Ce(e,{index:0}):"",c=a==="food",{safeImg:d,fallbackImg:u,imageAttrs:g,lazyAttrs:f}=pe(o,{mode:t,priorityIndex:r,stableKey:i,preferredSize:c?"medium":"small",candidateSizes:c?["small","medium","large"]:["small","medium"],variant:c?"hero":"grid"}),b=xr(e,t),h=String(e.category||"Special").trim()||"Special",w=n(String(e.name||"Special")).replace(/\n/g,"<br>");return a==="food"?`
      <div ${b} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${n(d)}" data-fallback-src="${n(u)}"${f} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Q(e)};" ${g} decoding="async" />
        ${tt(e,{poster:d,objectPosition:Q(e)})}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${m("arrow-right","w-4 h-4")}
        </div>
        <div class="absolute bottom-3 left-3 right-3">
          <div>
            <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(h)}</span>
            <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
          </div>
        </div>
      </div>
    `:`
    <div ${b} class="bg-slate-900 p-1.5 rounded-[1.8rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col relative overflow-hidden h-full group ${t==="profile"?"cursor-pointer":""}">
      <img src="${n(d)}" data-fallback-src="${n(u)}"${f} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${Q(e)};" ${g} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${m("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(h)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function Cn(e,{mode:t="profile",priorityIndex:a=-1}={}){const r=Le(e),o=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",i=fr(e),d=(i.length?i:[se(e)||""]).filter(Boolean),u=d.length?d.slice(0,12):[""],g=u.length>1,{itemId:f,counts:b,isLiked:h}=wn(e),w=_(Math.max(0,Number(b.likes)||0)),S=_(Math.max(0,Number(b.comments)||0));return`
    <div ${o} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${g?`
          <div
            data-menu-card-gallery-track="${n(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${u.map(($,C)=>{const j=t==="profile"?Ce(e,{index:C}):"",k=pe($||"",{mode:t,priorityIndex:a,slideIndex:C,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),P=C>0,T=P?K:k.safeImg,L=P?K:k.fallbackImg,E=P?k.loadingAttrs:k.imageAttrs,I=P?"":k.lazyAttrs||"",R=P?` data-menu-card-deferred-src="${n(k.safeImg)}"
                    data-menu-card-deferred-fallback="${n(k.fallbackImg)}"
                    ${k.srcsetValue?`data-menu-card-deferred-srcset="${n(k.srcsetValue)}"`:""}
                    ${k.sizesValue?`data-menu-card-deferred-sizes="${n(k.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${C}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${n(T)}" data-fallback-src="${n(L)}"${I}${R} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${Q(e)};" ${E} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${u.map(($,C)=>{const j=t==="profile"?Ce(e,{index:C}):"",{safeImg:k,fallbackImg:P,imageAttrs:T,lazyAttrs:L}=pe($||"",{mode:t,priorityIndex:a,slideIndex:C,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${n(k)}" data-fallback-src="${n(P)}"${L} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${Q(e)};" ${T} decoding="async" />
              </div>
            `}).join("")}
        `}
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${h?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${h?"true":"false"}"
        >
          ${m("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${g?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${u.map(($,C)=>`
              <div
                data-menu-card-gallery-dot="${n(e.id)}"
                data-menu-card-gallery-index="${C}"
                class="${C===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
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
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${n(r)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${n(e.description||"")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2">
            <div class="hidden">
              <span data-menu-like-count="${n(f)}">${n(w)}</span>
              <span data-menu-comment-count="${n(f)}">${n(S)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${n(x("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${m("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function wr(e,t,{mode:a="profile",publicMenuSurfaceState:r=null,focusFallbackHtml:o=""}={}){const i=et(Array.isArray(t)?t:[]),c=String(e?.restaurantId||"").trim(),d=a==="admin"||ba(c),u=r?.focus?.canRenderFocus?{items:Array.isArray(r.focus.items)?r.focus.items:[],enabled:!0}:c&&d?Oe(c):{items:[],enabled:!1},g=u.enabled?(Array.isArray(u.items)?u.items:[]).map(y=>jt({...y,objectPosition:ke(y)})):[],f=i.filter(y=>fe(y)==="testfirst_focus"&&!St(y)).map(y=>jt(y,{menuItemId:y.id||""})).filter(Boolean),b=new Set,h=[...g,...f].filter(y=>{const F=String(y.menuItemId||y.id||`${y.title}|${y.text}|${y.imageUrl}`);return!F||b.has(F)?!1:(b.add(F),!0)}),w=i.filter(y=>!St(y)),S=w.filter(y=>fe(y)!=="testfirst_focus"),$=S.length?S:w,C=S.length?h:[],j=$.filter(y=>Fe(y)==="drink"),k=$.filter(y=>Fe(y)!=="drink"),P=(y=[])=>{const F=[],z=[];return y.forEach(D=>{const H=fe(D);H==="testfirst_food"||H==="testfirst_special"&&It(D)==="food"?z.push(D):F.push(D)}),{gridItems:F,foodItems:z}},T=(y,F=-1)=>fe(y)==="testfirst_special"?Tt(y,{mode:a,priorityIndex:F}):In(y,{mode:a,priorityIndex:F});let L=0;const E=()=>{const y=L;return L+=1,y},I=new Set,R=(y,F)=>!F.gridItems.length&&!F.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${n(y)}">
        ${F.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(y)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${Ie(F.gridItems,z=>T(z,E()),I)}
            </div>
          </div>
        `:""}
        ${F.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n(y)}">
            <div class="app-content-inline">
              ${Ie(F.foodItems,z=>{const D=fe(z),H=E();return D==="testfirst_special"?Tt(z,{mode:a,size:"food",priorityIndex:H}):Cn(z,{mode:a,priorityIndex:H})},I)}
            </div>
          </div>
        `:""}
      </section>
    `,N=P(j),U=P(k);return`
    <div>
      ${Sn(e,C,{mode:a})||o}
      <div id="menu-section" class="mt-5">
        ${R("drink",N)}
        ${R("food",U)}
      </div>
    </div>
  `}function Pn(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:r=null,priorityOffset:o=0}={}){return e.length?a?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${Ie(e,(i,c)=>In(i,{mode:t,priorityIndex:o+c}),r)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${Ie(e,(i,c)=>Pt(i,{mode:t,variant:"drink",priorityIndex:o+c}),r)}
    </div>
  `:""}function An(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:r=null,priorityOffset:o=0}={}){return e.length?a?`
      <div>
        ${Ie(e,(i,c)=>fe(i)==="testfirst_special"&&It(i)==="food"?Tt(i,{mode:t,size:"food",priorityIndex:o+c}):Cn(i,{mode:t,priorityIndex:o+c}),r)}
      </div>
    `:`
    <div class="space-y-4">
      ${Ie(e,(i,c)=>Pt(i,{mode:t,variant:"food",priorityIndex:o+c}),r)}
    </div>
  `:""}function jn(e,{mode:t="profile"}={}){if(t==="admin"){const a=String(s?.menu?.filter||"all").trim().toLowerCase(),r=ee(s.userProfile),o=x("menu.products","Produkte"),i=e.filter(f=>$e(f?.type)==="drink"),c=e.filter(f=>$e(f?.type)!=="drink"),d=(f,b,{addType:h=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${n(f)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${n(f)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(_(b.length))} Eintraege</p>
          </div>
          ${h?`
            <button type="button" data-menu-add-${n(h)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${m("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${b.length?`<div class="space-y-3">${b.map(w=>Ct(w,{mode:"admin"})).join("")}</div>`:(Ke({functionName:"renderMenuList.adminSection",items:b,rawItems:b,filteredItems:b,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${ae({source:"admin-menu:no-products"})}>${n(x("menu.noProducts","Keine Produkte"))}</div>`)}
      </div>
    `;if(r)return d(o,e,{addType:"food"});const u=[{title:x("menu.drinks","Getraenke"),list:i,addType:"drink"},{title:x("menu.food","Speisen"),list:c,addType:"food"}];if(a==="all")return`
        <div>
          ${u.map(f=>d(f.title,f.list,{addType:f.addType})).join("")}
        </div>
      `;const g=u.filter(f=>f.list.length>0);return g.length?`
      <div>
        ${g.map(f=>d(f.title,f.list,{addType:f.addType})).join("")}
      </div>
    `:a==="drink"?d(x("menu.drinks","Getraenke"),[],{addType:"drink"}):a==="food"?d(x("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((a,r)=>Ct(a,{mode:t,priorityIndex:r})).join("")}
    </div>
  `:(Ke({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${ae({source:`${t}:no-products`})}>
        ${n(x("menu.noProducts","Keine Produkte"))}
      </div>
    `)}function Lt(e,{variant:t="focus",suppressLoading:a=!1}={}){if(!e)return"";const{items:r,enabled:o,loading:i}=Oe(e,{includeInactive:!0}),c=_(r.length),d=String(t||"").trim().toLowerCase()==="travel-offers",u=d?"Ofertat":"Sot ne Fokus",g=d?"Oferta":"Highlights",f=d?"Im Travel und Profil sichtbar":"Im Profil sichtbar",b=d?"Ofertat werden geladen...":x("focus.loading","Fokus wird geladen..."),h=d?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${n(u)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${n(g)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(c)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${d?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(f)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${o?"checked":""} />
      </label>

      ${r.length?`
        <div class="space-y-3">
          ${r.map(w=>{const S=v(w.imageUrl||"","thumb"),$=Y(S)?K:S,C=w.active!==!1?"Aktiv":"Inaktiv",j=w.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n($)}" class="w-full h-full object-cover" style="object-position:${ke(w)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(w.title||"Sot ne Fokus")}</p>
                  ${w.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(w.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${j}">${C}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-focus-edit="${n(w.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-focus-delete="${n(w.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:i&&!a?`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(b)}</div>
      `:i?"":`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(h)}</div>
      `}
    </div>
  `}function Tn(e={}){if(!e?.restaurantId)return!1;const t=String(mt(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||ee(e)?!1:be(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function yr(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function $r(e,t){if(!t||!Tn(e))return"";const{items:a,loading:r}=sa(t,{includeInactive:!0}),o=_(a.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(o)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${a.length?`
        <div class="space-y-3">
          ${a.map(i=>{const c=v(i.imageUrl||"","thumb"),d=Y(c)?K:c,u=yr(i),g=i.category||"RESTAURANT",f=i.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(d)}" class="w-full h-full object-cover" style="object-position:${ke(i)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(i.title||"Ad")}</p>
                  ${i.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(i.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${n(g)} · ${n(f)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${u.className}">${n(u.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${n(i.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${n(i.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
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
  `}function Ft(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function kr(e={}){const t=String(e?.restaurantId||"").trim(),a=t?Te(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function _t(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function Sr(e={}){const t=_t(e);return[...Ft(t.productIds),...Ft(e.shoppingLandingCardProductIds),...Ft(e.shoppingLandingProductIds)].filter(Boolean)}function Mt(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[a,r])=>{const o=String(a||"").trim(),i=String(r||"").trim();return o&&i&&(t[o]=i),t},{})}function Ir(e={}){const t=_t(e);return{...Mt(e.shoppingLandingProductImageOverrides),...Mt(t.productImageOverrides)}}function Cr(e=""){const t=String(e||"").trim(),a=s.shoppingLandingCardEditor&&typeof s.shoppingLandingCardEditor=="object"?s.shoppingLandingCardEditor:{},r=String(a.restaurantId||"").trim();return r&&r!==t?{}:a}function Pr(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function Ar(e={}){const a=[se(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(Pr).filter(Boolean);return a.filter((r,o)=>a.indexOf(r)===o)}function jr(e={},t={},a={}){const r=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!r)return null;const o=Ar(e).map(f=>({rawUrl:f,imageUrl:v(f,"thumb")})).filter(f=>f.rawUrl&&!Y(f.imageUrl)),i=o[0]?.rawUrl||"",c=String(t?.[r]||"").trim(),d=String(a?.[r]||"").trim(),u=d||c||i,g=u?v(u,"thumb"):"";return{id:r,name:String(e.name||e.title||"Produkt").trim(),price:Le(e),imageUrl:g&&!Y(g)?g:"",defaultImageRaw:i,cardImageUrl:c,previewImageUrl:d,imageCandidates:o,objectPosition:Q(e)}}function Tr(e={},t="",a=[]){if(!t||!ee(e))return"";const r=kr(e),o=_t(r),i=Cr(t),c=i.saving===!0,d=String(i.status||"").trim(),u=/fehl|error|nicht|nuk|kein/i.test(d),g=String(o.imageUrl||r.shoppingLandingCardImageUrl||r.shoppingLandingImageUrl||"").trim(),f=String(r.logoUrl||r.logo||r.logoURL||r.avatar||e.avatar||"").trim(),b=String(i.imageUrlDraft??g).trim(),h=String(i.imagePreview||b||f||"").trim(),w=h?v(h,"large"):K,S=String(i.titleDraft??(o.title||r.shoppingLandingCardTitle||e.name||"")).trim(),$=i.active!==void 0?i.active!==!1:o.active!==!1&&r.shoppingLandingCardEnabled!==!1,C=Sr(r),j=Array.isArray(i.productIds)?i.productIds.map(I=>String(I||"").trim()).filter(Boolean):null,k=new Set(j||C),P={...Ir(r),...Mt(i.productImageOverrides)},T=i.productImagePreviews&&typeof i.productImagePreviews=="object"?i.productImagePreviews:{},L=(Array.isArray(a)?a:[]).filter(I=>I&&String(I.id||"").trim()&&I.hidden!==!0&&I.available!==!1).map(I=>jr(I,P,T)).filter(Boolean),E=k.size?`${_(k.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${n(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(E)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${m("plus","w-4 h-4")}
        </button>
      </div>

      <input id="shoppingLandingImageInput" type="file" accept="image/*" class="hidden" />
      <input id="shoppingLandingImageUrl" type="hidden" value="${n(b)}" />

      <div class="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 mb-4">
        <img src="${n(w||K)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div class="absolute inset-x-0 top-0 h-16 pointer-events-none" style="background:linear-gradient(to bottom, rgba(255,255,255,0.7), transparent);"></div>
        <div class="absolute left-4 bottom-4 right-4">
          <span class="inline-flex max-w-full truncate text-[10px] uppercase tracking-wider font-extrabold text-slate-800 bg-white backdrop-blur-sm py-1 px-2.5 rounded-full" style="background:rgba(255,255,255,0.8);">
            ${n(S||"Shop Picks")}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="shoppingLandingTitleInput" class="text-[10px] font-black text-slate-400 uppercase ml-2">Titel</label>
          <input id="shoppingLandingTitleInput" type="text" value="${n(S)}" placeholder="Summer Picks" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-amber-100" />
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
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${n(_(L.length))}</span>
          </div>
          ${L.length?`
            <div class="grid grid-cols-1 gap-2">
              ${L.map(I=>{const R=k.has(I.id),N=I.imageUrl||K,U=String(I.defaultImageRaw||I.imageCandidates[0]?.rawUrl||"").trim(),y=String(I.cardImageUrl||"").trim(),F=String(I.previewImageUrl||"").trim(),z=!!(F||y&&y!==U),D=F||(y&&!I.imageCandidates.some(H=>H.rawUrl===y)?y:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${n(I.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${R?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${n(N)}" class="w-full h-full object-cover" style="object-position:${n(I.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-slate-900 truncate">${n(I.name)}</span>
                        ${I.price?`<span class="block text-[10px] font-bold text-slate-400 mt-0.5">${n(I.price)}</span>`:""}
                      </span>
                    </label>
                    ${R?`
                      <div class="mt-3 pt-3 border-t border-slate-100">
                        <div class="flex items-center justify-between gap-2 mb-2">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Card-Bild</span>
                          <div class="flex items-center gap-2">
                            ${z?`
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
                          ${I.imageCandidates.map((H,W)=>{const J=W===0,X=F?!1:J?!z:y===H.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${n(I.id)}" data-shopping-landing-product-image-choice="${n(I.id)}" value="${J?"":n(H.rawUrl)}" class="hidden" ${X?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${X?"border-slate-900":"border-slate-100"} bg-slate-100">
                                  <img src="${n(H.imageUrl)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
                                </span>
                                <span class="block mt-1 text-[8px] font-black uppercase tracking-widest text-center text-slate-400">${W+1}</span>
                              </label>
                            `}).join("")}
                          ${D?`
                            <label class="shrink-0 w-16">
                              <input type="radio" name="shoppingLandingProductImage_${n(I.id)}" data-shopping-landing-product-image-choice="${n(I.id)}" value="${n(D)}" class="hidden" checked />
                              <span class="block h-16 rounded-2xl overflow-hidden border border-slate-900 bg-slate-100">
                                <img src="${n(v(D,"thumb"))}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
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

        ${d?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${u?"text-rose-500":"text-slate-500"}">${n(d)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
          ${c?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function Lr(e){if(!At(e)||!nn(e))return"";const a=et((s.menu.items||[]).filter(r=>fe(r)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(_(a.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${m("plus","w-4 h-4")}
        </button>
      </div>
      ${a.length?`
        <div class="space-y-3">
          ${a.map(r=>{const o=v(se(r),"thumb"),i=Y(o)?K:o,c=vn(r),d=c.type==="link"?"Link":c.type==="product"?"Produkt-Modal":"Diese Karte",u=It(r)==="food"?"Food-Size":"Normal",g=ma(Fe(r));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(i)}" class="w-full h-full object-cover" style="object-position:${Q(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(r.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${n(g)}</span>
                    <span>${n(u)}</span>
                    <span>${n(d)}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-menu-edit="${n(r.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-menu-delete="${n(r.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
                </div>
              </div>
            `}).join("")}
        </div>
      `:`
        <div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">Noch keine Special-Karten</div>
      `}
    </div>
  `}function Ln(e,{restaurantId:t="",suppressLoading:a=!1,allowAutoEnsure:r=!0,requirePublicMenuTruth:o=!0}={}){const i=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!i||!be(e))return"";const c=Ee(s,{profile:e,routePayload:s?.profileView?.routePayload,webDirectEntry:s?.__webDirectEntry,restaurantId:i});if(o&&c.menu.status!=="ready")return"";const d=!o||c.focus.canRenderFocus;if(r&&!s.focus.loading&&!d&&De(tn(e,i)),o&&!d)return"";const{items:u,loading:g}=d?{items:Array.isArray(c.focus.items)?c.focus.items:[],loading:c.focus.loading}:Oe(i);if(!(d?!0:Oe(i).enabled)||!u.length&&!g||a&&g&&!u.length)return"";if(g&&!u.length)return`
      <div class="${ft()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(x("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const b=ia(u),h=u[b]||u[0],{safeImg:w,fallbackImg:S,imageAttrs:$,lazyAttrs:C}=pe(h.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:h?.id?`focus-carousel:${i}:${String(h.id)}`:""}),j=h.text||"";return`
    <div id="focusCarousel" class="${ft()} rounded-[2.5rem] p-6 border shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Sot ne Fokus</span>
        ${u.length>1?`
          <div class="flex items-center gap-2">
            <button type="button" data-focus-nav="prev" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${m("chevron-left","w-4 h-4")}
            </button>
            <button type="button" data-focus-nav="next" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center">
              ${m("chevron-right","w-4 h-4")}
            </button>
          </div>
        `:""}
      </div>
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
        ${Rt(h)&&String(h.videoUrl||"").trim()?`
          <video data-focus-media="video" data-focus-video data-autoplay-video src="${n(String(h.videoUrl||"").trim())}" ${w?`poster="${n(w)}"`:""} class="w-full h-56 object-cover" style="object-position:${ke(h)};" muted loop playsinline autoplay preload="metadata"></video>
          <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
          </div>
        `:`
          <img data-focus-media="image" data-focus-image src="${n(w)}" data-fallback-src="${n(S)}"${C} class="w-full h-56 object-cover" style="object-position:${ke(h)};" ${$} decoding="async" />
        `}
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${n(h.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${j?"":"hidden"}">${n(j)}</p>
      </div>
      ${u.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${u.map((P,T)=>`
            <button type="button" data-focus-dot="${T}" class="w-2.5 h-2.5 rounded-full ${T===b?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function Fr(e,t=220){const a=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${a}`}function Fn({label:e,url:t,caption:a}){if(!t)return"";const r=Fr(t,240);return`
    <button type="button" data-copy-url="${n(t)}" data-copy-label="${n(e)}" class="p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-left active:scale-[0.98] transition-transform">
      <div class="w-full aspect-square rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
        <img src="${n(r)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div class="text-center">
        <p class="text-[11px] font-black uppercase tracking-widest text-slate-700">${n(e)}</p>
        ${a?`<p class="text-[10px] font-bold text-slate-400 mt-1">${n(a)}</p>`:""}
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-2">Tippen zum Kopieren</p>
      </div>
    </button>
  `}function _r({profile:e,restaurantId:t,catalogLabel:a}){if(!t||!be(e))return"";if(typeof Kt=="function"){const i=He?He(t):null;(!i||i.sameRestaurant!==!0||!i.loading&&!i.loaded&&!i.error)&&Kt(e)}const r=typeof He=="function"?He(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},o=(r.tables||[]).map(i=>{const c=oa("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:i});return Fn({label:`Tisch ${i}`,url:c,caption:`${a} fuer Tisch ${i}`})}).join("");return`
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
          <input id="tableQrCountInput" type="number" min="0" max="200" step="1" inputmode="numeric" value="${n(String(r.count||0))}" class="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        </div>
        <button type="button" data-table-qr-save="true" class="h-14 px-6 rounded-[1.6rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-xl shadow-slate-200/60 active:scale-95" ${r.saving?"disabled":""}>
          ${r.saving?"Speichern...":"Tische speichern"}
        </button>
      </div>
      ${r.loading?'<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tisch-QR wird geladen...</p>':""}
      ${r.status?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-emerald-500">${n(r.status)}</p>`:""}
      ${r.error?`<p class="mt-4 text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(r.error)}</p>`:""}
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
  `}function Mr(){const e=s.userProfile,t=e.restaurantId||"",a=String(s.user?.uid||"").trim(),r=String(s.__authBootstrapInFlightUid||"").trim(),o=!t&&!!a&&(!!s.__authProfileLoadPromise||r===a),i=We(e),c=be(e),d=s.profileView?.profile?.restaurantId?s.profileView.profile:null,u=B()&&!!d?.restaurantId&&be(d),g=ee(e),f=fa(Qn(e)),b=t?Te(t):null,h=b?.name||b?.restaurantName||e.name||"Business",w=t&&s.menu.restaurantId===t,S=String(s.menu.source||"").trim().toLowerCase(),$=!!w&&S==="collection",C=!!w&&S==="collection"&&s.menu.loading,j=!!t&&(C||!$),k=g?"all":s.menu.filter,P=$?gn(s.menu.items,{filter:k,query:s.menu.query}):[],L=nn(e)?P:P.filter(R=>!wa(R)),E=et(L),I=_(E.length);if(t&&i){Sa(e);const R=String(s.focus?.truthSource||"").trim().toLowerCase();return!s.focus.loading&&(s.focus.restaurantId!==t||R!=="public-menu")&&De(e),Ha(e)}return t&&c&&!$&&!C&&Wn(e),t&&c&&!s.focus.loading&&s.focus.restaurantId!==t&&De(e),t&&Tn(e)&&Yn(e),c?`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
      <div class="flex items-end justify-between mb-6">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${f}</span>
          <h2 class="text-2xl font-black italic uppercase tracking-tighter">Editor</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(h)}</p>
        </div>
      </div>

      ${t?`
        <div class="mb-5 p-4 rounded-[2rem] bg-white border border-slate-100">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Produkte</p>
            <p class="text-lg font-black text-slate-900">${n(I)}</p>
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

      ${t?Lt(t):""}
      ${t?$r(e,t):""}
      ${t?Tr(e,t,$?s.menu.items:[]):""}
      ${t&&$?Lr(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${m("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${n(s.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${xn()}

        ${j?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(x("menu.loading",`${f} wird geladen...`,{label:f}))}</div>`:jn(E,{mode:"admin"})}
        ${s.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${n(s.menu.error)}</div>`:""}
        ${_r({profile:e,restaurantId:t,catalogLabel:f})}
      `:""}

    </div>
  `:u?nt(d):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${m("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${f}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function nt(e,{mode:t="profile",allowAutoEnsure:a=!0}={}){const r=s?.profileView?.routePayload&&typeof s.profileView.routePayload=="object"?s.profileView.routePayload:null,o=s?.__webDirectEntry&&typeof s.__webDirectEntry=="object"&&s.__webDirectEntry.active===!0?s.__webDirectEntry:null;let i=Ee(s,{profile:e,routePayload:r,webDirectEntry:o});const c=i.restaurantId||ga(e,r);if(!c)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${n(x("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const d=tn(e,c),u=ee(d),g=be(d)&&!u;g&&(i=Ee(s,{profile:d,routePayload:r,webDirectEntry:o,restaurantId:c}));const f=String(o?.canonicalRestaurantId||o?.restaurantId||"").trim(),b=new Set(i.targetIds),h=i.menu.status==="ready",w=i.focus.canRenderFocus,S=h&&g,$=i.focus.matches===!0&&i.focus.loading===!0,j=String(s?.profileView?.menuAccessSource||o?.menuAccessSource||r?.menuAccessSource||"").trim().toLowerCase()==="qr",k=o?.active===!0&&o?.webPriority===!0&&o?.menuFirst===!0&&String(s?.activeTab||"").trim().toLowerCase()==="profile"&&String(s?.profileTopTab||"").trim().toLowerCase()==="menu"&&(f===c||b.has(c)),P=k&&!j,T=["ready","empty","error"].includes(i.menu.status),L=k&&T,E=k&&(!S||i.menu.status!=="ready"),I=!S||i.focus.settled===!0||i.focus.confirmedEmpty===!0||i.menu.status!=="ready";a&&!L&&!T&&Ue(d),a&&!E&&!I&&!$&&h&&(!P||T)&&De(d);const N=i.menu.canRenderItems?et(gn(i.menu.items,{filter:"all",query:""})).filter(re=>!St(re)):[],U=i.menu.error||"",y=Ur(i.menu,N),{hasItems:F,hasError:z,isLoading:D,shouldRenderNoProducts:H}=y;da({profile:d,routePayload:r,surface:i,decision:y});const W={profile:d,routePayload:r,surface:i,decision:y,rawItems:i.menu.items,items:N,filteredItems:N,source:"public-menu"},J=pa(i,N),X=N.filter(re=>Fe(re)==="drink"),he=N.filter(re=>Fe(re)!=="drink"),Et=0,ie=X.length,ve=At(e),at=ve||u,rt=new Set;F&&c&&(Jn(N,c),va(N,c));const st=c&&w?(Array.isArray(i.focus.items)?i.focus.items:[]).map(re=>jt({...re,objectPosition:ke(re)})).filter(Boolean):[],it=i.focus.status==="empty"||i.focus.status==="error",_e=g&&!w&&!it&&i.menu.status!=="empty"&&i.menu.status!=="error",Me=st.length?Sn(d,st,{mode:t}):_e?gr({...W,reason:"focus-truth-pending"}):"",oe=at?Me:Ln(d,{restaurantId:c,suppressLoading:!0,allowAutoEnsure:h&&(!P||T),requirePublicMenuTruth:!0})||(_e?mr({...W,reason:"focus-truth-pending"}):"");return ve?`
      <div class="app-main-content-safe"${J}>
        ${D?`
          ${Me}
          ${yn({...W,reason:"menu-loading"})}
        `:`
          ${F?wr(d,N,{mode:t,publicMenuSurfaceState:i,focusFallbackHtml:Me}):z?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(x("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:H?(Ke({...W,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${ae({source:"public-menu:no-products"})}>${n(x("menu.noProducts","Keine Produkte"))}</div>`):yn({...W,reason:"menu-not-confirmed-empty"})}
          ${U?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(U)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5"${J}>
      ${oe}
      ${D?`
        ${kn({isShop:u,debugContext:{...W,reason:"menu-loading"}})}
      `:`
        ${F?`
          ${u?`
            ${Zn(N,{profile:e})}
          `:`
            ${X.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(x("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${Pn(X,{mode:t,useTestfirstCardUi:ve,seenCategories:rt,priorityOffset:Et})}
                </div>
              </section>
            `:""}
            ${he.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(x("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${An(he,{mode:t,useTestfirstCardUi:ve,seenCategories:rt,priorityOffset:ie})}
                </div>
              </section>
            `:""}
          `}
        `:`
          ${z?`
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-16 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(x("menu.loadError","Menu konnte nicht geladen werden"))}
              </div>
            </div>
          `:H?`
            ${Ke({...W,functionName:"renderProfileMenuView",renderDecision:u?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${ae({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(x("menu.noProducts","Keine Produkte"))}
              </div>
            </div>`}
          `:`
            ${kn({isShop:u,debugContext:{...W,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${U?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(U)}</div>`:""}
      `}
    </div>
  `}function Er(){const e=s.userProfile,t=O(e),a=t?s.businessPosts:s.userPosts,r=String(s.user?.uid||e?.uid||"").trim(),o=String(e?.restaurantId||"").trim(),i=String(s.__userPostsLoadingUid||"").trim(),c=String(s.__businessPostsLoadingRestaurantId||"").trim(),d=String(s.__authBootstrapInFlightUid||"").trim(),u=!!r&&i===r,g=!!o&&c===o,f=!!r&&d===r,b=t?g||f&&!a.length:u||f&&!a.length,h=String(e.handle||Z(e.name||"user")).replace(/^@/,""),S=n(e.bio||"").replace(/\n/g,"<br>")||n(x("profile.noBio","Noch keine Bio.")),$=Qe(e),C=$==="menu",j=$==="checkins",k=a,P=v(e.avatar,"avatar"),T=M(t),L=yt(e);return`
    <div class="app-main-content-safe">
      ${L==="profile"||L==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?mn(e,{mode:"self",avatarUrl:P,avatarFit:T,followersLabel:_(e.followers),bioHtml:S}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${n(P)}" data-fallback-src="${n(K)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${T} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${m("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(_(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(x("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(_(e.following))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(x("profile.followingCount","Folgt"))}</span>
                 </div>
              </div>
            </div>

            <div class="mb-8">
              <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
              ${t?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(h)}</p>`}
              <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${S}</p>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")}</p>
            </div>

            <div class="flex gap-4">
              <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
                <span class="relative z-10 flex items-center gap-2">${m("plus","w-4 h-4")} Status</span>
                <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
              <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                ${m("settings","w-5 h-5")}
              </button>
            </div>
          </div>
        </div>
        `}
      </div>

      ${$t(e)}
      ${kt(e)}

      ${C?`
        ${We(e)?ln(e):nt(e)}
      `:j?`
        ${vt()}
      `:`
        ${b&&!k.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(x("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${s.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${ht(k,s.profileViewMode)}
          </div>
          ${$==="posts"?`
            <div class="app-content-inline mt-8 mb-4">
              <button data-nav="upload" class="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                <span class="relative z-10 flex items-center gap-2">
                  ${m("plus","w-4 h-4")} Neuen Beitrag
                </span>
                <div class="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          `:""}
        `}
      `}
      `:`
        ${L==="cart"?ne(e):L==="favorites"?ge(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:an,renderProfilePostsFancy:ht,renderProfileCheckins:vt,renderProfileTabs:$t,renderProfileViewControls:kt,renderPublicProfileView:rr,renderMenuFilterRow:xn,renderMenuLayoutSection:pr,renderMenuItemCard:Ct,renderMenuItemCardStacked:Pt,renderMenuDrinkGrid:Pn,renderMenuFoodList:An,renderMenuList:jn,renderFocusAdminSection:Lt,renderFocusCarousel:Ln,renderMenuQrCard:Fn,renderMenuAdminView:Mr,renderProfileMenuView:nt,renderProfileView:Er}}export{si as createProfileMenuFocusRenderController};
