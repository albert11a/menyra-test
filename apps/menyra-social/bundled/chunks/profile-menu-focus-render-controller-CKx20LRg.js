import{_ as Gr}from"./domain-auth-BL21ERPm.js";import{w as Wr}from"./domain-menu-eager-D1i-ZFUH.js";import{a as Ht}from"./domain-media-eager-B90n_Ot7.js";import{am as Be,an as Yr,t as Qr,ao as Jr,k as Xr,ap as He}from"./domain-feed-social-eager-CXeKjx9e.js";import{n as Kn,g as Zr,h as es,i as ts}from"./domain-app-events-0LOtnx5C.js";import{K as ns,L as as,M as rs,N as ss,O as is,P as os,Q as ls,J as cs,R as ds,A as us,g as ps,B as fs,S as ms,T as gs,b as bs,d as hs}from"./vendor-firebase-D7Ks7H8l.js";import"./domain-public-profile-BW4dw-Ab.js";const Xt=Object.freeze([Object.freeze({key:"city",label:"Qyteti",labelDe:"Stadt"}),Object.freeze({key:"beach",label:"Plazha",labelDe:"Straende"}),Object.freeze({key:"sights",label:"Vende per te pare",labelDe:"Sehenswuerdigkeiten"}),Object.freeze({key:"activities",label:"Aktivitete",labelDe:"Aktivitaeten"}),Object.freeze({key:"nature",label:"Natyre",labelDe:"Natur"}),Object.freeze({key:"food",label:"Restorante & Kafene",labelDe:"Restaurants & Cafes"}),Object.freeze({key:"nearby",label:"Vende te rendesishme",labelDe:"Wichtige Orte"})]),vs=Object.freeze(Xt.map(i=>i.key)),xs=Object.freeze([Object.freeze({key:"all",labelDe:"Ganzjaehrig"}),Object.freeze({key:"summer",labelDe:"Saisonal Sommer"}),Object.freeze({key:"winter",labelDe:"Saisonal Winter"})]),ws=Object.freeze(xs.map(i=>i.key)),ys=12;function be(i=""){return i==null?"":String(i).trim()}function Vt(i){const s=Number(i);return Number.isFinite(s)?s:null}function $s(i=""){const s=be(i).toLowerCase();return vs.includes(s)?s:{qyteti:"city",stadt:"city",plazha:"beach",plazhi:"beach",strand:"beach",straende:"beach",sehenswuerdigkeiten:"sights",sehenswurdigkeiten:"sights",aktivitete:"activities",aktivitaeten:"activities",natyre:"nature",natur:"nature",restorante:"food",restaurants:"food",cafes:"food",kafene:"food",umgebung:"nearby",rrethina:"nearby"}[s]||"nearby"}function ks(i=""){const s=be(i).toLowerCase();return ws.includes(s)?s:"all"}function Ss(i=Date.now(),s=Math.random()){const d=Math.max(0,Number(i)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(s)||0))*36**6).toString(36).padStart(6,"0");return`place_${d}_${n}`}function Is(i){return Array.isArray(i)?i.map(s=>be(s)).filter(Boolean).slice(0,ys):[]}function Cs(i={},{index:s=0}={}){const d=i&&typeof i=="object"?i:{},n=Vt(d.lat??d.latitude??d.coords?.lat),m=Vt(d.lng??d.lon??d.longitude??d.coords?.lng),f=Vt(d.priority);return{id:be(d.id)||Ss(Date.now()+s),name:be(d.name),category:$s(d.category),description:be(d.description??d.text).slice(0,600),address:be(d.address??d.plusCode).slice(0,240),lat:n,lng:m,coverImageUrl:be(d.coverImageUrl??d.imageUrl??d.coverUrl),gallery:Is(d.gallery),priority:f==null?0:Math.max(0,Math.min(100,Math.round(f))),pinned:d.pinned===!0,season:ks(d.season??d.seasonal),active:d.active!==!1}}const Ps=6371e3,As=80,js=600,Ts=1600;function pt(i=0){return(Number(i)||0)*(Math.PI/180)}function _e(i){return i==null||i===""?NaN:Number(i)}function gt(i={}){return Number.isFinite(_e(i?.lat))&&Number.isFinite(_e(i?.lng))}function Ls(i,s,d,n){const m=_e(i),f=_e(s),E=_e(d),R=_e(n);if(![m,f,E,R].every(Number.isFinite))return null;const W=pt(E-m),T=pt(R-f),M=Math.sin(W/2)**2+Math.cos(pt(m))*Math.cos(pt(E))*Math.sin(T/2)**2;return Math.round(2*Ps*Math.asin(Math.min(1,Math.sqrt(M))))}function _s(i){const s=Number(i);return!Number.isFinite(s)||s<0?"":s<1e3?`${Math.max(10,Math.round(s/10)*10)} m`:s<1e4?`${(s/1e3).toFixed(1).replace(/\.0$/,"")} km`:`${Math.round(s/1e3)} km`}function Fs(i){const s=Number(i);return!Number.isFinite(s)||s<0?null:s<=Ts?{mode:"walk",minutes:Math.max(1,Math.round(s/As))}:{mode:"drive",minutes:Math.max(1,Math.round(s/js))}}function Ms(i,s={}){const d=Fs(i);if(!d)return"";const n=String(s.walk||"min in Gehweite"),m=String(s.drive||"min mit dem Auto");return`${d.minutes} ${d.mode==="walk"?n:m}`}const Zn=200;function ge(i=""){return i==null?"":String(i).trim()}function qn(i){return Array.isArray(i)?Array.from(new Set(i.map(s=>ge(s)).filter(Boolean))).slice(0,Zn):[]}function ea(i={}){const s=i&&typeof i=="object"?i:{},d=s.placePatches&&typeof s.placePatches=="object"?s.placePatches:{},n={};return Object.entries(d).slice(0,Zn).forEach(([m,f])=>{const E=ge(m);if(!E||!f||typeof f!="object")return;const R={};ge(f.name)&&(R.name=ge(f.name)),ge(f.description)&&(R.description=ge(f.description).slice(0,600)),ge(f.coverImageUrl)&&(R.coverImageUrl=ge(f.coverImageUrl)),Object.keys(R).length&&(n[E]=R)}),{hidden:qn(s.hidden),pinned:qn(s.pinned),placePatches:n}}function qt({places:i=[],overrides:s={},hotelCoords:d=null,includeHidden:n=!1}={}){const m=ea(s),f=new Set(m.hidden),E=new Map(m.pinned.map((T,M)=>[T,M])),R=gt(d)?d:null;return(Array.isArray(i)?i:[]).map((T,M)=>Cs(T,{index:M})).filter(T=>T.name&&T.active).map(T=>{const M=m.placePatches[T.id]||{},ae=R&&gt(T)?Ls(R.lat,R.lng,T.lat,T.lng):null;return{...T,...M,hidden:f.has(T.id),pinned:E.has(T.id)||T.pinned,pinnedRank:E.has(T.id)?E.get(T.id):null,distanceMeters:ae}}).filter(T=>n||!T.hidden).sort((T,M)=>{const ae=T.pinnedRank!=null,ve=M.pinnedRank!=null;if(ae!==ve)return ae?-1:1;if(ae&&ve&&T.pinnedRank!==M.pinnedRank)return T.pinnedRank-M.pinnedRank;if(T.pinned!==M.pinned)return T.pinned?-1:1;if(T.priority!==M.priority)return M.priority-T.priority;const Se=Number.isFinite(T.distanceMeters)?T.distanceMeters:1/0,Ie=Number.isFinite(M.distanceMeters)?M.distanceMeters:1/0;return Se!==Ie?Se-Ie:String(T.name).localeCompare(String(M.name))})}function Rs(i=[]){const s=Array.isArray(i)?i:[];return Xt.map(d=>({...d,places:s.filter(n=>n.category===d.key)})).filter(d=>d.places.length)}const Gt="mnyraHotelDestinationSections",Gn="mnyraHotelDetailStyles",Es="/apps/menyra-social/styles/hotel-detail.css?v=2026-07-10-hotel-detail-v1",zs=Object.freeze({walk:"min në këmbë",drive:"min me makinë"}),Re=Object.freeze({rooms:"Qëndrimi yt",city:"Përreth teje",beach:"Deti afër",sights:"Vlen të shihet",activities:"Përjeto zonën",nature:"Natyrë e gjallë",food:"Shijo lokal",nearby:"Afër teje",amenities:"Pa pagesë shtesë",map:"Zbulo zonën",rating:"Nga vizitorët"}),Wt=Object.freeze({city:"Qyteti",beach:"Plazha",sights:"Vende për të parë",activities:"Aktivitete",nature:"Natyra",food:"Restorante & Kafene",nearby:"Vende të rëndësishme"}),Yt=Object.freeze({bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>',building:'<path d="M10 12h4M10 8h4M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',waves:'<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>',compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',sparkles:'<path d="m12 3-1.2 3.1L8 7.5l2.8 1.4L12 12l1.2-3.1L16 7.5l-2.8-1.4zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8zM18 13l-1 2.7-3 1.3 3 1.3 1 2.7 1-2.7 3-1.3-3-1.3z"/>',tree:'<path d="m17 14 3 3h-5l3 3H6l3-3H4l3-3H3l5-5H5l7-7 7 7h-3l5 5zM12 20v2"/>',coffee:'<path d="M10 2v2M14 2v2M6 2v2M18 8h1a3 3 0 0 1 0 6h-1M4 8h14v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>',pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0"/><circle cx="12" cy="10" r="3"/>',nav:'<path d="m3 11 19-9-9 19-2-8z"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',expand:'<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/>',check:'<path d="m20 6-11 11-5-5"/>',wifi:'<path d="M5 12.55a11 11 0 0 1 14 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',car:'<path d="m5 17-2-1v-4l2-5h14l2 5v4l-2 1M5 17v2M19 17v2M3 13h18M7 13h.01M17 13h.01"/>',snow:'<path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07 19.07 4.93M8 5l4 2 4-2M8 19l4-2 4 2"/>',shield:'<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',umbrella:'<path d="M2 12h20M12 12v8a2 2 0 0 0 4 0M2 12a10 10 0 0 1 20 0M12 2v1"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',size:'<path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6"/>'}),Ns=Object.freeze({city:"building",beach:"waves",sights:"compass",activities:"sparkles",nature:"tree",food:"coffee",nearby:"pin"}),Ds=Object.freeze([{keywords:["wifi","wi-fi","internet"],icon:"wifi"},{keywords:["parkim","parking","garazh"],icon:"car"},{keywords:["mengjes","mëngjes","breakfast","fruehstueck"],icon:"coffee"},{keywords:["klime","klimë","kondicioner","ac"],icon:"snow"},{keywords:["plazh","det","beach","pishine","pishinë","pool"],icon:"waves"},{keywords:["shezlong","ombrelle","umbrella"],icon:"umbrella"},{keywords:["recepsion","reception","siguri","security","24"],icon:"shield"},{keywords:["pastrim","cleaning","spa"],icon:"sparkles"},{keywords:["famil","person"],icon:"users"}]);function V(i=""){return i==null?"":String(i).trim()}function D(i=""){return V(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function he(i="pin",s=""){const d=Yt[i]||Yt.pin;return`<svg class="mhd-icon ${s}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`}function Us(i=typeof document>"u"?null:document){if(!i||i.getElementById(Gn))return;const s=i.createElement("link");s.id=Gn,s.rel="stylesheet",s.href=Es,i.head.appendChild(s)}function Ee({iconName:i="pin",eyebrow:s="",title:d=""}={}){return`
    <div class="mhd-section-title">
      <span class="mhd-section-icon">${he(i)}</span>
      <div>
        ${s?`<small>${D(s)}</small>`:""}
        <h2>${D(d)}</h2>
      </div>
    </div>
  `}function Os(i={}){const s=_s(i.distanceMeters);if(!s)return"";const d=Ms(i.distanceMeters,zs);return`
    <div class="mhd-distance">
      <span>${he("nav","mhd-icon--sm")}${D(s)}</span>
      ${d?`<span>${he("clock","mhd-icon--sm")}${D(d)}</span>`:""}
    </div>
  `}function Bs(i={},{nearestPlaceId:s="",imageUrlFn:d=null}={}){const n=Xt.find(R=>R.key===i.category)?.label||"",m=i.id&&i.id===s?"Më afër hotelit":n,f=V(i.coverImageUrl),E=f&&typeof d=="function"&&V(d(f))||f;return`
    <article class="mhd-card">
      <div class="mhd-photo">${E?`<img src="${D(E)}" alt="${D(i.name)}" loading="lazy" decoding="async" />`:""}</div>
      <div class="mhd-card-body">
        ${m?`<span class="mhd-pill ${i.id===s?"mhd-pill--accent":""}">${D(m)}</span>`:""}
        <h3>${D(i.name)}</h3>
        ${Os(i)}
        ${i.description?`<p class="mhd-copy">${D(i.description)}</p>`:""}
      </div>
    </article>
  `}function Wn({template:i=null,overrides:s={},hotelCoords:d=null,imageUrlFn:n=null}={}){if(!i||!Array.isArray(i.places)||!i.places.length)return"";const m=qt({places:i.places,overrides:s,hotelCoords:gt(d)?d:null});if(!m.length)return"";const f=m.filter(R=>Number.isFinite(R.distanceMeters)).sort((R,W)=>R.distanceMeters-W.distanceMeters)[0]||null;return Rs(m).map(R=>`
    <section class="mhd-section">
      ${Ee({iconName:Ns[R.key]||"pin",eyebrow:Re[R.key]||"",title:Wt[R.key]||R.label})}
      <div class="mhd-rail">
        ${R.places.map(W=>Bs(W,{nearestPlaceId:f?.id||"",imageUrlFn:n})).join("")}
      </div>
    </section>
  `).join("")}function Hs(){return`
    <section class="mhd-section">
      <div class="mhd-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>
    </section>
  `}function Vs(i={},s="€"){const d=V(i.priceLabel||i.priceText);if(d)return d;const n=Number(i.price??i.startingPrice??i.pricePerNight);if(!Number.isFinite(n)||n<=0)return"";const m=V(i.currency||i.currencyCode)||s;return m==="€"||m.toUpperCase()==="EUR"?`€${n}`:`${n} ${m}`}function Ks(i=[]){const s=(Array.isArray(i)?i:[]).filter(d=>V(d?.label));return s.length?`
    <div class="mhd-distance">
      ${s.map(d=>`<span>${he(d.icon||"check","mhd-icon--sm")}${D(d.label)}</span>`).join("")}
    </div>
  `:""}function qs({rooms:i=[],offers:s=[],imageUrlFn:d=null}={}){const n=(Array.isArray(i)&&i.length?i:Array.isArray(s)?s:[]).filter(m=>m&&m.active!==!1&&V(m.title));return n.length?`
    <section class="mhd-section">
      ${Ee({iconName:"bed",eyebrow:Re.rooms,title:"Dhoma"})}
      <div class="mhd-rail">
        ${n.map(m=>{const f=V(m.imageUrl),E=f&&typeof d=="function"&&V(d(f))||f,R=Vs(m);return`
            <article class="mhd-card">
              <div class="mhd-photo">${E?`<img src="${D(E)}" alt="${D(m.title)}" loading="lazy" decoding="async" />`:""}</div>
              <div class="mhd-card-body">
                ${V(m.tag||m.badge)?`<span class="mhd-pill mhd-pill--accent">${D(m.tag||m.badge)}</span>`:""}
                <div class="mhd-heading-price">
                  <h3>${D(m.title)}</h3>
                  ${R?`<span class="mhd-price"><strong>${D(R)}</strong><small>/ natë</small></span>`:""}
                </div>
                ${Ks(m.metaParts)}
                ${V(m.text||m.description)?`<p class="mhd-copy">${D(m.text||m.description)}</p>`:""}
              </div>
            </article>
          `}).join("")}
      </div>
    </section>
  `:""}function Gs({city:i="",address:s="",imageUrl:d="",imageUrlFn:n=null}={}){const m=V(i);if(!m)return"";const f=V(d),E=f&&typeof n=="function"&&V(n(f))||f;return`
    <section class="mhd-section">
      ${Ee({iconName:"building",eyebrow:Re.city,title:Wt.city})}
      <div class="mhd-rail">
        <article class="mhd-card">
          <div class="mhd-photo">${E?`<img src="${D(E)}" alt="${D(m)}" loading="lazy" decoding="async" />`:""}</div>
          <div class="mhd-card-body">
            <span class="mhd-pill">${D(Wt.city)}</span>
            <h3>${D(m)}</h3>
            ${V(s)?`<p class="mhd-copy">${D(s)}</p>`:""}
          </div>
        </article>
      </div>
    </section>
  `}function Ws(i=""){const s=V(i).toLowerCase();for(const d of Ds)if(d.keywords.some(n=>s.includes(n)))return d.icon;return"check"}function Ys({amenities:i=[]}={}){const s=(Array.isArray(i)?i:[]).map(d=>V(d)).filter(Boolean);return s.length?`
    <section class="mhd-section">
      ${Ee({iconName:"check",eyebrow:Re.amenities,title:"Përfshihet"})}
      <div class="mhd-amenities">
        ${s.slice(0,12).map(d=>`
          <article class="mhd-amenity">
            <span class="mhd-amenity-icon">${he(Ws(d))}</span>
            <h3>${D(d)}</h3>
          </article>
        `).join("")}
      </div>
    </section>
  `:""}const Qt="mnyraHotelDetailMap";function Qs({address:i="",city:s="",destinationName:d="",mapsUrl:n="",hotelCoords:m=null,hotelName:f=""}={}){const E=[V(i),V(s)].filter(Boolean).join(", ")||V(d);if(!E&&!n)return"";const R=gt(m),W=R?`id="${Qt}" data-map-lat="${D(String(m.lat))}" data-map-lng="${D(String(m.lng))}" data-map-name="${D(V(f))}"`:"";return`
    <section class="mhd-section">
      ${Ee({iconName:"compass",eyebrow:Re.map,title:"Harta e zbulimit"})}
      <div class="mhd-map-card">
        <div class="mhd-map-art ${R?"mhd-map-art--live":""}" ${W}>
          <div class="mhd-map-water"></div>
          <span class="mhd-map-pin">${he("bed")}</span>
        </div>
        <div class="mhd-map-info">
          <div class="mhd-address">
            <span>${he("pin")}</span>
            <div>
              <small>Lokacioni</small>
              <strong>${D(E||"Hotel")}</strong>
              ${V(d)?`<p>Plazhi, qyteti dhe vendet kryesore rreth ${D(d)}.</p>`:""}
            </div>
          </div>
          ${n?`<a class="mhd-primary" href="${D(n)}" target="_blank" rel="noopener noreferrer">${he("expand","mhd-icon--sm")}Hap hartën</a>`:""}
        </div>
      </div>
    </section>
  `}function Js({rating:i="",reviewCount:s="",summary:d=""}={}){const n=Number(V(i).replace(",","."));if(!Number.isFinite(n)||n<=0)return"";const m=Math.max(1,Math.min(5,Math.round(n))),f=Array.from({length:m}).map(()=>`<svg class="mhd-icon mhd-star" viewBox="0 0 24 24" aria-hidden="true">${Yt.star}</svg>`).join(""),E=V(s);return`
    <section class="mhd-section">
      ${Ee({iconName:"star",eyebrow:Re.rating,title:"Vlerësimet"})}
      <div class="mhd-rating">
        <div class="mhd-score">
          <strong>${D(n.toFixed(1))}</strong>
          <div>
            <div class="mhd-stars">${f}</div>
            <p>${D([d,E?`${E} vlerësime`:""].filter(Boolean).join(" · ")||"Nga vizitorët")}</p>
          </div>
        </div>
      </div>
    </section>
  `}function Xs({rooms:i=[],offers:s=[],amenities:d=[],address:n="",city:m="",cityImageUrl:f="",destinationId:E="",destinationName:R="",destinationSectionsHtml:W="",mapsUrl:T="",hotelCoords:M=null,hotelName:ae="",rating:ve="",reviewCount:Se="",ratingSummary:Ie="",imageUrlFn:Ve=null}={}){const xe=!!V(E),vt=W||(xe?Hs():"");return`
    <div class="mhd">
      ${qs({rooms:i,offers:s,imageUrlFn:Ve})}
      <div id="${Gt}" data-destination-id="${D(E)}" style="display:contents">
        ${vt}
      </div>
      ${xe?"":Gs({city:m,address:n,imageUrl:f,imageUrlFn:Ve})}
      ${Ys({amenities:d})}
      ${Qs({address:n,city:m,destinationName:R,mapsUrl:T,hotelCoords:M,hotelName:ae})}
      ${Js({rating:ve,reviewCount:Se,summary:Ie})}
    </div>
  `}function ke(i=""){return i==null?"":String(i).trim()}function X(i=""){return ke(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Le({id:i="",label:s="",value:d="",placeholder:n="",type:m="text",inputmode:f=""}={}){return`
    <label class="block">
      <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${X(s)}</span>
      <input id="${X(i)}" name="${X(i)}" type="${X(m)}" value="${X(d)}" placeholder="${X(n)}" ${f?`inputmode="${X(f)}"`:""} class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
    </label>
  `}function Zs(i={},{imagePreview:s=""}={}){const d=X(i.id),n=ke(s)||ke(i.imageUrl);return`
    <div data-hotel-room-row="${d}" class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">${X(i.title||"Dhomë e re")}</p>
        <button type="button" data-hotel-room-remove="${d}" class="w-9 h-9 rounded-xl bg-white text-slate-400 border border-slate-100 flex items-center justify-center text-xs font-black" aria-label="Fshi dhomën">✕</button>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-20 h-20 rounded-2xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
          ${n?`<img id="hotelRoomImagePreview_${d}" src="${X(n)}" alt="" loading="lazy" class="w-full h-full object-cover" />`:`<span id="hotelRoomImagePreview_${d}" class="text-[9px] font-black text-slate-300 uppercase">Foto</span>`}
        </div>
        <input type="file" id="hotelRoomImageInput_${d}" data-hotel-room-image-input="${d}" accept="image/*" hidden />
        <button type="button" data-hotel-room-image-trigger="${d}" class="px-4 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Ngarko foto</button>
        <input type="hidden" id="hotelRoomImageUrl_${d}" value="${X(i.imageUrl)}" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${Le({id:`hotelRoomTitle_${d}`,label:"Emri i dhomës",value:i.title,placeholder:"Dhomë Deluxe me pamje nga deti"})}
        ${Le({id:`hotelRoomPrice_${d}`,label:"Çmimi / natë (€)",value:i.price==null?"":String(i.price),placeholder:"118",inputmode:"decimal"})}
        ${Le({id:`hotelRoomPersons_${d}`,label:"Persona",value:i.persons==null?"":String(i.persons),placeholder:"2",inputmode:"numeric"})}
        ${Le({id:`hotelRoomBeds_${d}`,label:"Krevate",value:i.beds,placeholder:"1 king"})}
        ${Le({id:`hotelRoomSize_${d}`,label:"Madhësia (m²)",value:i.size==null?"":String(i.size),placeholder:"31",inputmode:"numeric"})}
        ${Le({id:`hotelRoomTag_${d}`,label:"Etiketa (opsionale)",value:i.tag,placeholder:"Më e zgjedhura"})}
      </div>
      <label class="block">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Përshkrimi (opsional)</span>
        <textarea id="hotelRoomDesc_${d}" name="hotelRoomDesc_${d}" rows="2" placeholder="Detaje të shkurtra për dhomën..." class="w-full mt-2 px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100 resize-none">${X(i.description)}</textarea>
      </label>
      <label class="flex items-center justify-between gap-3">
        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktive në profil</span>
        <input id="hotelRoomActive_${d}" type="checkbox" ${i.active!==!1?"checked":""} class="w-5 h-5 accent-slate-900" />
      </label>
    </div>
  `}function ei({restaurantId:i="",record:s={},editorState:d={}}={}){const n=ke(i);if(!n)return"";const m=ke(d.restaurantId)===n,f=m&&Array.isArray(d.rooms)?Kn(d.rooms):Kn(s?.hotelRooms),E=m&&d.imagePreviews&&typeof d.imagePreviews=="object"?d.imagePreviews:{},R=m&&d.saving===!0,W=m?ke(d.status):"";return`
    <div data-hotel-rooms-editor="${X(n)}" class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Hotel</span>
          <h3 class="text-xl font-black italic tracking-tighter">Dhomat</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dhomat shfaqen te detajet e hotelit</p>
        </div>
        <button type="button" id="hotelRoomAddBtn" class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95 text-lg font-black" aria-label="Shto dhomë">+</button>
      </div>
      ${f.length?`<div class="space-y-4">${f.map(T=>Zs(T,{imagePreview:ke(E[T.id])})).join("")}</div>`:'<p class="text-sm font-bold text-slate-400">Ende pa dhoma. Shto dhomën e parë me +.</p>'}
      ${W?`<p class="text-[10px] font-black uppercase tracking-widest ${W.includes("ruajt")?"text-emerald-600":"text-slate-500"}">${X(W)}</p>`:""}
      <button id="hotelRoomsSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${R?"disabled":""}>
        ${R?"Po ruhen...":"Ruaj Dhomat"}
      </button>
    </div>
  `}const ti=Object.freeze({apiKey:"AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU",authDomain:"menyra-c0e68.firebaseapp.com",projectId:"menyra-c0e68",storageBucket:"menyra-c0e68.firebasestorage.app",messagingSenderId:"528471049588",appId:"1:528471049588:web:c507d87c0832562a855821",measurementId:"G-YLFKC8726B"});function ni(){try{const i=String(globalThis?.location?.hostname||"").trim().toLowerCase();if(!["localhost","127.0.0.1","::1"].includes(i))return null;const s=globalThis?.__MENYRA_FIREBASE_EMULATORS__,d=s&&typeof s=="object"?s:{},n=new URLSearchParams(globalThis?.location?.search||"").get("firebase-emulator")==="1";if(d.enabled!==!0&&!n)return null;const m=String(d.projectId||"mnyra-local").trim();return/^(mnyra-local|demo-|test-|local-)/.test(m)?Object.freeze({projectId:m,host:String(d.host||"127.0.0.1").trim()||"127.0.0.1",firestorePort:Math.max(1,Number(d.firestorePort||8080)||8080),authPort:Math.max(1,Number(d.authPort||9099)||9099),functionsPort:Math.max(1,Number(d.functionsPort||5001)||5001)}):null}catch{return null}}const ce=ni(),Kt=Object.freeze(ce?{apiKey:"mnyra-local-api-key",authDomain:`${ce.projectId}.firebaseapp.com`,projectId:ce.projectId,storageBucket:`${ce.projectId}.appspot.com`,messagingSenderId:"000000000000",appId:"1:000000000000:web:mnyra-local"}:ti),Yn=new WeakSet,Qn=new WeakSet;function ai({firestore:i=null,authInstance:s=null}={}){return ce?(i&&!Yn.has(i)&&(ms(i,ce.host,ce.firestorePort),Yn.add(i)),s&&!Qn.has(s)&&(gs(s,`http://${ce.host}:${ce.authPort}`,{disableWarnings:!0}),Qn.add(s)),!0):!1}function ri(){try{const i=ps();if(i?.options?.projectId===Kt.projectId&&i?.options?.appId===Kt.appId)return i}catch{}return fs(Kt)}const bt=ri();function si(){try{return globalThis?.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__===!0}catch{return!1}}let ht;try{const i=si();ht=ns(bt,{experimentalAutoDetectLongPolling:!0,localCache:i?as():rs({tabManager:ss()})});try{globalThis.__MENYRA_FIRESTORE_LOCAL_CACHE_KIND__=i?"memory-public-website":"persistent-multitab"}catch{}}catch{ht=is(bt)}let Jt;try{Jt=os(bt,{persistence:[ls,cs,ds]})}catch{Jt=us(bt)}ai({firestore:ht,authInstance:Jt});const ii="destinationsPublic",ta="menyra_social_destination_public_cache_v1::",oi=360*60*1e3,mt=new Map,ft=new Map;function Fe(i=""){return i==null?"":String(i).trim()}function na(i="",s={}){const d=s&&typeof s=="object"?s:{},n=Array.isArray(d.places)?d.places:[];return n.length?{id:Fe(i),name:Fe(d.name),slug:Fe(d.slug),description:Fe(d.description),version:Math.max(0,Number(d.version)||0),places:n}:null}function li(i=""){try{const s=localStorage.getItem(`${ta}${i}`);if(!s)return null;const d=JSON.parse(s);return!d||typeof d!="object"||Date.now()-Number(d.storedAt||0)>oi?null:na(i,d.data)}catch{return null}}function ci(i="",s=null){try{localStorage.setItem(`${ta}${i}`,JSON.stringify({storedAt:Date.now(),data:s}))}catch{}}function aa(i=""){const s=Fe(i);if(!s)return null;if(mt.has(s))return mt.get(s);const d=li(s);return d&&mt.set(s,d),d}async function di(i=""){const s=Fe(i);if(!s)return null;const d=aa(s);if(d)return d;if(ft.has(s))return ft.get(s);const n=(async()=>{try{const m=await bs(hs(ht,ii,s)),f=m.exists()?na(s,m.data()||{}):null;return mt.set(s,f),f&&ci(s,m.data()||{}),f}catch{return null}finally{ft.delete(s)}})();return ft.set(s,n),n}const Jn="menyra_social_business_type_hint_v1";function Me(i=""){return i==null?"":String(i).trim()}function Xn(i={}){const s=i&&typeof i=="object"?i:{},d=[],n=Me(s.restaurantId||s.canonicalRestaurantId||s.landingRestaurantId),m=Me(s.publicSlug||s.landingSlug).toLowerCase();return n&&d.push(`r:${n}`),m&&d.push(`s:${m}`),d}function ui(i={},s=[]){const d=i&&typeof i=="object"?i:{};for(const n of Array.isArray(s)?s:[]){const m=Me(d[n]).toLowerCase();if(m)return m}return""}function pi(i={},s=[],d=""){const n=i&&typeof i=="object"?{...i}:{},m=Me(d).toLowerCase();if(!m||!Array.isArray(s)||!s.length)return{store:n,changed:!1};let f=!1;return s.forEach(E=>{n[E]!==m&&(n[E]=m,f=!0)}),{store:n,changed:f}}function fi(i="",s=""){const d=Me(i).toLowerCase();return d||Me(s).toLowerCase()}function yi(i={}){const s=i.state,d=i.resolvePostCountsFn,n=i.escapeHtmlFn,m=i.getOptimizedImageUrlFn,f=i.iconFn,E=i.isLocalBusinessProfileFn,R=typeof i.isCeoUserFn=="function"?i.isCeoUserFn:(()=>!1),W=i.normalizeHandleFn,T=i.logoFitClassFn,M=i.formatCountFn,ae=i.renderProfileShopCartViewFn,ve=i.renderProfileShopFavoritesViewFn,Se=typeof i.ensurePostsDataForProfileFn=="function"?i.ensurePostsDataForProfileFn:(()=>{}),Ie=i.ensureMenuDataForProfileFn,Ve=typeof i.ensureEditorMenuDataForProfileFn=="function"?i.ensureEditorMenuDataForProfileFn:(()=>{}),xe=i.ensureFocusDataForProfileFn,vt=typeof i.ensureAdsDataForProfileFn=="function"?i.ensureAdsDataForProfileFn:(()=>{}),Zt=i.ensureTableQrStateForProfileFn,ne=i.isShopCatalogProfileFn,ra=i.getBusinessCatalogLabelFn,Ce=i.normalizeMenuTypeFn,sa=i.primeMenuItemCountsFn,ia=typeof i.hydrateMenuCardViewerLikesFn=="function"?i.hydrateMenuCardViewerLikesFn:(()=>Promise.resolve()),oa=i.renderShopProductListFn,la=i.getMenuLayoutThemeFn,ca=i.menuLayoutColors,ie=i.resolveMenuItemHeroFn,Q=i.isPlaceholderUrlFn,q=i.placeholderImage,da=i.getFirebaseStorageUrlFn,ua=i.isDirectImageUrlFn,en=i.formatPriceFn,pa=typeof i.resolveCurrencyCodeForMenuItemFn=="function"?i.resolveCurrencyCodeForMenuItemFn:(()=>""),tn=i.getMenuItemImagesFn,J=i.getMenuItemObjectPositionFn,Ke=i.getMenuItemSocialIdFn,nn=i.menuItemMetaKeyFn,an=i.ensureMenuItemMetaFn,rn=i.resolveMenuItemCountsFn,qe=i.getFocusStateForRestaurantFn,fa=typeof i.getAdsStateForRestaurantFn=="function"?i.getAdsStateForRestaurantFn:(()=>({items:[],enabled:!0,loading:!1,same:!1})),Ge=i.getTableQrStateForRestaurantFn,Pe=i.getFocusItemObjectPositionFn,xt=i.getFocusCardClassFn,ma=i.getFocusIndexFn,we=i.isRestaurantCafeProfileFn,wt=typeof i.getBusinessProfileTypeFn=="function"?i.getBusinessProfileTypeFn:(()=>""),ze=i.getRestaurantMetaByIdFn,ga=i.buildUrlFn,ba=i.normalizeSearchKeyFn,ha=i.normalizeFollowHandleFn,de={key:"",inFlightKey:""},sn=new Set,We=()=>{try{if(globalThis?.__MENYRA_DEBUG_MENU_STATE__===!0||globalThis?.__MENYRA_DEBUG_PROFILE_RENDER__===!0)return!0;const e=new URLSearchParams(globalThis?.location?.search||"");return e.get("debug-menu-state")==="1"||e.get("debug-profile-render")==="1"}catch{return!1}},va=({profile:e=null,routePayload:t=null,surface:a=null,decision:r=null}={})=>{if(!We())return;const l=a&&typeof a=="object"?a:{},o=l.menu&&typeof l.menu=="object"?l.menu:{},c=e&&typeof e=="object"?e:{},u=t&&typeof t=="object"?t:{},p=u?.businessSnapshot?.identity||u?.identity||{},b=String(l.authoritativeRestaurantId||l.restaurantId||o.restaurantId||"").trim(),g=String(c.publicSlug||c.landingSlug||c.handle||p.publicSlug||p.landingSlug||p.handle||"").trim(),h=`${b||"pending"}::${g||"no-slug"}`;if(sn.has(h))return;sn.add(h);const x=Array.isArray(o.items)?o.items:[],w=new Set(x.map(k=>String(k?.category||"").trim()).filter(Boolean)).size,C=String(o.rawTruthState||o.truthState||"").trim();console.debug("[mnyra][public-menu.first-render]",{businessId:b,slug:g,itemsLength:x.length,categoriesLength:w,menuStatus:String(o.status||"loading"),truthState:C,isLoading:r?.isLoading===!0,isHydrating:o.hydrating===!0||C.toLowerCase()==="hydrating",confirmedEmpty:o.confirmedEmpty===!0,canRenderItems:o.canRenderItems===!0,shouldRenderNoProducts:r?.shouldRenderNoProducts===!0,source:String(o.source||"")})},xa=()=>{try{return String(globalThis?.__MNYRA_BUILD_TOKEN__||globalThis?.__MENYRA_SOCIAL_APP_VERSION__||"").trim()}catch{return""}},yt=(e="")=>n(String(e||"")),Ae=(e="")=>n(String(e??"")),re=({renderer:e="profile-menu-focus-render-controller",skeleton:t="",source:a=""}={})=>{if(!We())return"";const r=[e?`data-debug-renderer="${yt(e)}"`:"",t?`data-debug-skeleton="${yt(t)}"`:"",a?`data-debug-source="${yt(a)}"`:""].filter(Boolean);return r.length?` ${r.join(" ")}`:""},wa=(e={},t=[])=>{const a=Jr(e,t);return` ${[`data-menu-state="${Ae(a.menuState)}"`,`data-menu-item-count="${Ae(a.menuItemCount)}"`,`data-focus-state="${Ae(a.focusState)}"`,`data-focus-business-id="${Ae(a.focusBusinessId)}"`,`data-focus-item-count="${Ae(a.focusItemCount)}"`,`data-focus-source="${Ae(a.focusSource)}"`,`data-focus-stale="${a.focusStale?"true":"false"}"`].join(" ")}`},on=({component:e="profile-menu-focus-render-controller",functionName:t="",profile:a=null,routePayload:r=null,surface:l=null,decision:o=null,items:c=null,rawItems:u=null,filteredItems:p=null,renderDecision:b="",source:g=""}={})=>{const h=l&&typeof l=="object"?l:{},x=h.menu&&typeof h.menu=="object"?h.menu:{},w=h.focus&&typeof h.focus=="object"?h.focus:{},C=a&&typeof a=="object"?a:s?.profileView?.profile&&typeof s.profileView.profile=="object"?s.profileView.profile:{},k=r&&typeof r=="object"?r:s?.profileView?.routePayload&&typeof s.profileView.routePayload=="object"?s.profileView.routePayload:{},S=k?.businessSnapshot&&typeof k.businessSnapshot=="object"?k.businessSnapshot:{},j=S?.identity&&typeof S.identity=="object"?S.identity:k?.identity&&typeof k.identity=="object"?k.identity:{},y=s?.__webDirectEntry&&typeof s.__webDirectEntry=="object"?s.__webDirectEntry:{},P=String(C.publicSlug||C.landingSlug||C.handle||j.publicSlug||j.landingSlug||j.handle||y.publicSlug||"").trim(),L=String(C.restaurantId||k.restaurantId||y.restaurantId||"").trim(),_=String(C.canonicalRestaurantId||k.canonicalRestaurantId||h.authoritativeRestaurantId||y.canonicalRestaurantId||S.restaurantId||"").trim();let z="";C.canonicalRestaurantId?z="profile.canonicalRestaurantId":k.canonicalRestaurantId?z="routePayload.canonicalRestaurantId":h.authoritativeRestaurantId?z="surface.authoritativeRestaurantId":y.canonicalRestaurantId?z="webDirectEntry.canonicalRestaurantId":S.restaurantId?z="routeSnapshot.restaurantId":C.restaurantId?z="profile.restaurantId":k.restaurantId?z="routePayload.restaurantId":y.restaurantId&&(z="webDirectEntry.restaurantId");const I=String(_||h.restaurantId||x.restaurantId||L||"").trim(),U=Array.isArray(u)?u:Array.isArray(x.items)?x.items:[],O=Array.isArray(c)?c:U,B=Array.isArray(p)?p:O,$=new Set(B.map(ye=>String(ye?.category||"").trim()).filter(Boolean)).size,F=String(x.status||(o?.isLoading?"loading":"")||"").trim(),N=String(x.rawTruthState||x.truthState||"").trim(),H=x.confirmedEmpty===!0||o?.confirmedEmpty===!0,K=o?.hasError===!0||F==="error"||!!String(x.error||"").trim(),ee=!(B.length>0||o?.hasItems===!0)&&!H&&!K,te=_||L||I||"";return{component:e,functionName:t,slug:P,businessId:I,requestedRestaurantId:L,canonicalRestaurantId:_,restaurantIdSource:z,menuReadPath:te?`restaurants/${te}/public/menu`:"",activeTab:String(s?.activeTab||"").trim(),profileTopTab:String(s?.profileTopTab||"").trim(),profileContentTab:String(s?.profileContentTab||"").trim(),itemsLength:O.length,rawItemsLength:U.length,filteredItemsLength:B.length,categoriesLength:$,focusItemsLength:Array.isArray(w.items)?w.items.length:0,loading:x.loading===!0||o?.isLoading===!0||F==="loading",pending:ee,hydrating:x.hydrating===!0||N.toLowerCase()==="hydrating",status:F,truthState:N,confirmedEmpty:H,canRenderItems:x.canRenderItems===!0,renderDecision:b||(o?.shouldRenderNoProducts?"no-products":o?.isLoading?"loading":""),source:g||String(x.source||""),buildToken:xa()}},Ye=(e={})=>{We()&&console.warn("[mnyra:no-products-render]",{...on(e),stack:new Error().stack})},Qe=(e="",t={})=>{We()&&console.info("[mnyra:skeleton-render]",{skeletonName:e,...on({...t,renderDecision:t.renderDecision||"skeleton"}),reason:String(t.reason||"").trim()})},v=(e,t=e,a={})=>Qr(e,{fallback:t,params:a}),ya=(e="")=>{const t=String(e||"").trim();if(!t)return v("nav.menu","Menue");const a=t.toLowerCase();return a==="menue"||a==="menu"||a==="menü"?v("nav.menu",t):a==="shop"?"Shop":t},ln=(e="")=>{const t=String(e||"").trim();if(!t)return"";const a=t.toLowerCase();return["speisen","food","getraenke","getränke","drink","drinks","beverage","beverages"].includes(a)?v("menu.products","Produkte"):t},$a=(e="food",t=!1)=>t?v("menu.products","Produkte"):String(e||"").trim().toLowerCase()==="drink"?v("menu.drinks","Getraenke"):v("menu.food","Speisen"),cn=(e={},t=!1)=>{const a=Ce(e?.type||"food");return t?v("menu.product","Produkt"):a==="drink"?v("menu.drinkItem","Getraenk"):v("menu.foodItem","Speise")},$t=(e="",t="#111827")=>{const a=String(e||"").trim();return/^#[0-9a-fA-F]{6}$/.test(a)?a:t};function ka(e=null,t=null){return Be(s,{profile:e,routePayload:t,webDirectEntry:s?.__webDirectEntry}).restaurantId}function dn(e=null,t=""){if(!e||typeof e!="object")return e;const a=String(t||"").trim();if(!a)return e;const r=String(e.canonicalRestaurantId||"").trim();return String(e.restaurantId||"").trim()===a&&r?e:{...e,restaurantId:a,...r?{canonicalRestaurantId:r}:{}}}function Sa(e=""){const t=String(e||"").trim();return t?Be(s,{profile:s?.profileView?.profile||s?.userProfile,routePayload:s?.profileView?.routePayload,webDirectEntry:s?.__webDirectEntry,restaurantId:t}).focus.canRenderFocus:!1}function Ne(e={}){const t=String(pa(e)||"").trim();return t?en(e?.price,t):en(e?.price)}function Ia(e=[],t="",a=""){const r=String(t||"").trim(),l=String(a||"").trim();if(!r||!l)return"";const o=Array.isArray(e)?e:[];if(!o.length)return`${r}|${l}|empty`;const c=[];return o.forEach(u=>{const p=String(Ke(u)||u?.id||"").trim();p&&c.push(p)}),c.length?(c.sort(),`${r}|${l}|${c.join(",")}`):`${r}|${l}|empty`}function Ca(e=[],t=""){const a=String(s.user?.uid||"").trim(),r=Ia(e,t,a);r&&de.inFlightKey!==r&&de.key!==r&&(de.key=r,de.inFlightKey=r,ia(e,t).catch(l=>{console.error(l),de.key===r&&(de.key="")}).finally(()=>{de.inFlightKey===r&&(de.inFlightKey="")}))}function Pa(e={}){const t=String(e?.uid||"").trim();if(t&&s.followingTargetIds.includes(t))return!0;const a=String(e?.restaurantId||"").trim();if(a&&s.followingTargetIds.includes(a))return!0;const r=ha(e?.handle||"");return!!(r&&s.followingHandles.includes(r))}function un(e={}){if(e?.specialEnabled===!0)return!0;if(e?.specialEnabled===!1)return!1;const t=String(e?.restaurantId||"").trim();if(!t)return!1;const a=typeof ze=="function"&&ze(t)||null;return a?.specialEnabled===!0?!0:(a?.specialEnabled===!1,!1)}function Aa(e={}){return me(e)==="testfirst_special"?!0:String(e?.category||"").trim().toLowerCase()==="special"}function pn(e,t,a=!0,{includeImageKey:r=!0}={}){const l=d(e),o=e.id?String(e.id):"",c=o?`data-open-post="${n(o)}"`:"",u=o?`data-post-like-count="${n(o)}"`:"",p=o?`data-post-comment-count="${n(o)}"`:"",b=r&&o?`data-img-key="profile-post:${n(o)}"`:"",g=e.type==="wide"||e.type==="hero",h=t&&g?"col-span-2":"",x=t&&g?"aspect-[1.8/1]":"aspect-[4/5]",w=g?800:400,C=g?400:500,k=String(e.posterUrl||e.thumbUrl||e.poster||"").trim(),S=e.isVideo===!0,j=S&&k?k:e.url,y=m(j,g?"large":"medium",{stableKey:o?`profile-post:${o}`:"",variantGroup:"post-detail"}),P=String(e.url||"").trim(),L=P&&!P.includes("#")?`${P}#t=0.001`:P,_=S&&!k&&P?`<video src="${n(L)}" preload="metadata" muted playsinline webkit-playsinline width="${w}" height="${C}" ${b} class="w-full h-full object-cover pointer-events-none"></video>`:`<img src="${n(y)}" loading="lazy" decoding="async" width="${w}" height="${C}" ${b} class="w-full h-full object-cover" />`;return`
    <div ${c} role="button" tabindex="0" class="${h} relative ${x} rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        ${_}
        ${e.isVideo?`<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${f("play","w-3.5 h-3.5 fill-white block")}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${f("heart","w-3 h-3 fill-rose-500 text-rose-500")}
                <span ${u} class="text-[10px] font-bold tracking-wide">${n(l.likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${f("message-circle","w-3 h-3 text-indigo-200")}
                <span ${p} class="text-[10px] font-bold tracking-wide">${n(l.commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${o&&a?`
        <button type="button" data-profile-menu-button="${n(o)}" class="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-md rounded-full text-white/90 z-20 active:bg-black/40 hover:bg-black/30 transition-colors">
          ${f("more-horizontal","w-3.5 h-3.5")}
        </button>
        <div data-profile-menu="${n(o)}" class="absolute top-12 right-3 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border border-slate-100 p-1.5 z-30 hidden origin-top-right flex flex-col gap-1">
          <button type="button" data-profile-post-toggle="${n(o)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left w-full">
            ${f(g?"minimize-2":"maximize-2","w-3.5 h-3.5")}
            ${g?"Schmaler":"Breiter"}
          </button>
          <div class="h-px bg-slate-100 w-full my-0.5"></div>
          <button type="button" data-profile-post-delete="${n(o)}" class="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-left w-full">
            ${f("trash-2","w-3.5 h-3.5")}
            Loeschen
          </button>
        </div>
      `:""}
    </div>
  `}function kt(e,t,a=!0,{includeImageKeys:r=!0}={}){const l=t==="grid";if(!e.length)return`
      <div class="col-span-2 py-24 text-center">
        <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
          ${f("image","w-9 h-9")}
        </div>
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(v("profile.noContent","Keine Inhalte gefunden"))}</p>
      </div>
    `;const o=e.map(u=>pn(u,l,a,{includeImageKey:r})),c=e.reduce((u,p)=>{const b=p?.type==="wide"||p?.type==="hero";return u+(b?2:1)},0);return l&&c%2===1&&o.unshift(`
      <div data-profile-grid-placeholder="true" class="col-start-2 aspect-[4/5] rounded-[2rem] invisible pointer-events-none"></div>
    `),o.join("")}function St(){const e=s.profileCheckins||[];return e.length?`
    <div class="app-content-inline flex flex-col gap-4 app-main-content-safe animate-in fade-in duration-300">
      ${e.map(t=>{const a=m(t.image,"thumb");return`
        <div class="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-50 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all cursor-pointer group">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-inner group-hover:shadow-md transition-all">
            <img src="${n(a)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div class="flex-1">
            <h4 class="font-black text-slate-900 text-sm mb-1">${n(t.name||"Ort")}</h4>
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              ${f("map-pin","w-3 h-3 text-indigo-500 fill-indigo-500/20")} ${n(t.city||"Stadt")}
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
        <p class="text-slate-400 text-sm font-bold tracking-wide">${n(v("profile.noCheckins","Keine Check-ins gefunden"))}</p>
      </div>
    `}function Je(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||"").trim()?!0:String(e?.role||"").trim().toLowerCase()==="business"}let ue=null;function fn(){if(ue)return ue;if(typeof localStorage>"u")return ue={},ue;try{const e=localStorage.getItem(Jn),t=e?JSON.parse(e):{};ue=t&&typeof t=="object"?t:{}}catch{ue={}}return ue}function ja(e={},t=""){const a=Xn(e);if(!a.length)return;const{store:r,changed:l}=pi(fn(),a,t);if(l&&(ue=r,!(typeof localStorage>"u")))try{localStorage.setItem(Jn,JSON.stringify(r))}catch{}}function Ta(e={}){const t=String(wt(e)||"").trim().toLowerCase();return t?(ja(e,t),t):fi("",ui(fn(),Xn(e)))}function Xe(e={}){const t=Ta(e);return t==="hotel"||t==="motel"}function It(e={}){const t=String(e?.canonicalRestaurantId||e?.restaurantId||"").trim(),a=t?ze(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{}}}function La(e={},t=""){const a=e&&typeof e=="object"?e:{},r=String(a.id||a._id||a.offerId||a.menuItemId||t||"offer").trim();return{...a,id:r,menuItemId:String(a.menuItemId||a.targetMenuItemId||a.itemId||a.targetItemId||"").trim(),title:a.title||a.name||"Oferta",text:a.text||a.desc||a.description||"",imageUrl:a.imageUrl||a.image||a.photoUrl||"",active:a.active!==!1}}function mn(e={}){const t=[...Array.isArray(e.publicOffers)?e.publicOffers:[],...Array.isArray(e.travelOffers)?e.travelOffers:[],...Array.isArray(e.offerItems)?e.offerItems:[]],a=new Set;return t.map((r,l)=>La(r,`offer_${l}`)).filter(r=>{const l=String(r.id||`${r.title}|${r.text}|${r.imageUrl}`).trim();return!l||a.has(l)?!1:(a.add(l),!0)})}function _a(e={}){const t=It(e),a=String(e?.restaurantId||e?.canonicalRestaurantId||t.restaurantId||t.canonicalRestaurantId||t.id||"").trim();if(!a)return!1;const r=s.focus&&typeof s.focus=="object"?s.focus:{},l=String(r.restaurantId||"").trim()===a,o=String(r.truthSource||"").trim().toLowerCase();if(l&&o==="public-menu"||(l&&Array.isArray(r.items)?r.items:[]).length)return!1;const u=mn(t);return u.length>0||Array.isArray(t.publicOffers)||Array.isArray(t.travelOffers)||Array.isArray(t.offerItems)||Number.isFinite(Number(t.publicOffersCount))||Number.isFinite(Number(t.travelOffersCount))||typeof t.hasTravelOffers=="boolean"||String(t.offersTruthState||"").trim()?(s.focus={...r,restaurantId:a,items:u,enabled:r.enabled!==!1,loading:!1,error:"",index:0,truthSource:"restaurant-cache",truthState:u.length?"seeded":"knownEmpty"},!0):!1}function Fa(e={}){const t=[e?.verifiedMapLocation,e?.mapLocation,e?.geo,e?.coordinates,e?.coords,e?.locationCoords,e];for(const a of t){if(!a||typeof a!="object")continue;const r=Number(a.lat??a.latitude),l=Number(a.lng??a.lon??a.longitude);if(Number.isFinite(r)&&Number.isFinite(l))return{lat:r,lng:l}}return null}function Z(e={},t=[]){for(const a of t){const r=String(e?.[a]||"").trim();if(r)return r}return""}function Ze(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function Ma(e={}){const t=[...Ze(e.coverImages),...Ze(e.hotelCoverImages),...Ze(e.titleImages),e.titleImageUrl,e.coverImageUrl,e.coverUrl,e.heroUrl,e.imageUrl].map(r=>String(r||"").trim()).filter(Boolean),a=[];return t.forEach(r=>{a.includes(r)||a.push(r)}),a.slice(0,8)}function Ra(e={}){return!e||typeof e!="object"?!1:Array.isArray(e.existingImages)||Array.isArray(e.imagePreviews)||Array.isArray(e.imageFiles)||!!String(e.imageUrlDraft||"").trim()||e.saving===!0||e.detailsOpen===!0||!!String(e.status||"").trim()}function Ea(e=""){const t=String(e||"").trim(),a=s.hotelCardEditor&&typeof s.hotelCardEditor=="object"?s.hotelCardEditor:{},r=String(a.restaurantId||"").trim();return r?r===t?a:{}:Ra(a)?{}:a}function za(e={}){const t=Array.isArray(e.features)?e.features.map(r=>String(r||"").trim()).filter(Boolean):[],a=e.restaurantFeatures&&typeof e.restaurantFeatures=="object"?e.restaurantFeatures:{};return[Z(e,["hotelFeatureOneText","gardenTerraceText"])||String(a.gardenTerrace||"").trim()||t[0]||"",Z(e,["hotelFeatureTwoText","accessibilityText"])||String(a.accessibility||"").trim()||t[1]||"",Z(e,["hotelFeatureThreeText","veganOptionsText"])||String(a.veganOptions||"").trim()||t[2]||""]}function Na(e={}){const t=[],a=(r="")=>{const l=String(r||"").trim();l&&!t.includes(l)&&t.push(l)};return[e.amenities,e.features,e.included,e.facilities,e.hotelAmenities].forEach(r=>{Array.isArray(r)&&r.forEach(l=>{typeof l=="string"?a(l):l&&typeof l=="object"&&a(l.label||l.name||l.title)})}),(e.beachfront||e.onBeach||e.amStrand)&&a("Në plazh"),(e.restaurant||e.hasRestaurant)&&a("Restaurant"),(e.breakfast||e.breakfastIncluded)&&a("Mëngjes"),(e.pool||e.hasPool)&&a("Pool"),(e.wifi||e.freeWifi||e.hasWifi)&&a("WLAN"),(e.parking||e.freeParking||e.hasParking)&&a("Parking"),(e.spa||e.wellness)&&a("Wellness"),t.slice(0,8)}const Da=[{value:"m",label:"m"},{value:"km",label:"km"}],Ua="Në qendër",Oa="Në plazh",Ba=["Mëngjes","Gjysmë pension","Pension i plotë","All inclusive","Restorant","Pa ushqim"],Ha=["Shezlongë falas","Shezlongë me pagesë","Plazh privat","Pa shezlongë"],Va=["Parking falas","Parking privat","Parking me pagesë","Pa parking"];function pe(e=""){return String(e||"").trim().toLowerCase().replace(/[ëèéê]/g,"e").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Ka(e="",{direct:t=!1}={}){const a=String(e||"").trim(),r=pe(a),l=t||r==="ne_qender"||r==="ne_plazh"||r==="direkt_ne_qender"||r==="direkt_ne_plazh"||r.includes("direkt")&&(r.includes("strand")||r.includes("zentrum")||r.includes("center"))||r.includes("am_strand")||r.includes("im_zentrum"),o=a.match(/(\d+(?:[.,]\d+)?)\s*(km|kilometer|m|meter)?/i),c=o?o[1].replace(",","."):"",p=(o?String(o[2]||"").trim().toLowerCase():"").startsWith("k")?"km":"m";return{amount:c,unit:p,isDirect:l}}function gn({idPrefix:e="",iconName:t="navigation",label:a="",value:r="",directLabel:l="",direct:o=!1}={}){const c=Ka(r,{direct:o});return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${f(t,"w-4 h-4")}
        </div>
        <div class="min-w-0">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(a)}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(l)}</p>
        </div>
      </div>
      <div class="grid grid-cols-[1fr_92px] gap-2">
        <input id="${n(e)}Value" type="number" min="0" step="0.1" value="${n(c.amount)}" placeholder="150" inputmode="decimal" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100" />
        <select id="${n(e)}Unit" class="w-full px-3 py-3 bg-white rounded-2xl text-sm font-black border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
          ${Da.map(u=>`<option value="${n(u.value)}" ${c.unit===u.value?"selected":""}>${n(u.label)}</option>`).join("")}
        </select>
      </div>
      <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100">
        <span class="text-xs font-black text-slate-700">${n(l)}</span>
        <input id="${n(e)}Direct" type="checkbox" class="w-5 h-5 accent-indigo-600" ${c.isDirect?"checked":""} />
      </label>
    </div>
  `}function qa(e=[],t=""){const a=String(t||"").trim(),r=new Set(e.map(pe));return`
    <option value="">Zgjidh</option>
    ${e.map(l=>`<option value="${n(l)}" ${pe(l)===pe(a)?"selected":""}>${n(l)}</option>`).join("")}
    ${a&&!r.has(pe(a))?`<option value="${n(a)}" selected>Aktuale: ${n(a)}</option>`:""}
  `}function Ct({id:e="",iconName:t="badge-check",label:a="",value:r="",options:l=[]}={}){return`
    <div class="rounded-[1.7rem] border border-slate-100 bg-slate-50 p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-2xl bg-white text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
          ${f(t,"w-4 h-4")}
        </div>
        <label for="${n(e)}" class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${n(a)}</label>
      </div>
      <select id="${n(e)}" class="w-full px-4 py-3 bg-white rounded-2xl text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-100">
        ${qa(l,r)}
      </select>
    </div>
  `}function Ga(e={},t=[]){const a=new Set(t.map(pe).filter(Boolean)),r=[],l=(o="")=>{const c=String(o||"").trim();if(!c)return;const u=pe(c);a.has(u)||r.some(p=>pe(p)===u)||r.push(c)};return[e.features,e.hotelFeatures,e.amenities,e.facilities,e.hotelAmenities].forEach(o=>Ze(o).forEach(l)),r}function Wa({existingImages:e=[],newPreviews:t=[],imageUrlDraft:a=""}={}){const r=[...t.map((c,u)=>({src:c,kind:"new",idx:u})),...e.map((c,u)=>({src:c,kind:"existing",idx:u}))].filter(c=>c.src),l=r[0]?.src||a||"",o=l?m(l,"large"):q;return`
    <div class="space-y-4">
      <input id="hotelCardCoverImagesInput" type="file" accept="image/*" multiple class="hidden" />
      <div class="relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
        <img id="hotelCardCoverHeroPreview" src="${n(o||q)}" class="w-full h-52 object-cover bg-white" />
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
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${r.length}</span>
        </div>
        ${r.length?`
          <div class="grid grid-cols-3 gap-2">
            ${r.map(c=>`
              <div class="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-square">
                ${c.kind==="existing"?`<span data-hotel-card-existing-image="${n(c.src)}" hidden></span>`:""}
                <img src="${n(m(c.src,"thumb"))}" class="w-full h-full object-cover" />
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

      <input id="hotelCardCoverImageUrl" type="hidden" value="${n(a)}" />
    </div>
  `}function Ya({destinationId:e="",overrides:t={},hotelCoords:a=null}={}){const r=String(e||"").trim();if(!r||typeof document>"u")return;const l=u=>Wn({template:u,overrides:t,hotelCoords:a,imageUrlFn:p=>m(p,"medium")});let o=0;const c=()=>{const u=document.getElementById(Gt);if(!u){o++<20&&requestAnimationFrame(c);return}String(u.dataset.destinationId||"")===r&&u.dataset.destinationFilled!==r&&di(r).then(p=>{const b=document.getElementById(Gt);!b||String(b.dataset.destinationId||"")!==r||(b.dataset.destinationFilled=r,b.innerHTML=p?l(p):"",p&&bn(qt({places:p.places,overrides:t,hotelCoords:a})))}).catch(()=>{})};typeof requestAnimationFrame=="function"?requestAnimationFrame(c):queueMicrotask(c)}function bn(e=[]){if(typeof document>"u")return;const t=document.getElementById(Qt);t&&(typeof t.__mhdSetPlaces=="function"?t.__mhdSetPlaces(e):t.__mhdPlaces=Array.isArray(e)?e:[])}function Qa(e=[]){if(typeof document>"u")return;let t=0;const a=()=>{const r=document.getElementById(Qt);if(!r){t++<20&&requestAnimationFrame(a);return}if(Array.isArray(e)&&e.length&&bn(e),r.dataset.mhdMapObserved==="1")return;r.dataset.mhdMapObserved="1";const l=()=>{Gr(()=>import("./hotel-detail-map-runtime-DB741SQ-.js"),[]).then(o=>o.ensureHotelDetailMap({container:r})).catch(()=>{})};if(typeof IntersectionObserver=="function"){const o=new IntersectionObserver(c=>{c.some(u=>u.isIntersecting)&&(o.disconnect(),l())},{rootMargin:"240px"});o.observe(r)}else l()};typeof requestAnimationFrame=="function"?requestAnimationFrame(a):queueMicrotask(a)}function Ja(e={}){return mn(e).filter(t=>t.active!==!1&&String(t.title||"").trim())}function hn(e={}){const t=It(e),a=Fa(t),r=Z(t,["address","primaryAddress","location","formattedAddress","street"]),l=Z(t,["city","locationCity","primaryCity","region","country"]),o=Z(t,["rating","reviewRating","stars","hotelStars"]),c=Z(t,["reviewCount","reviewsCount","ratingsCount","commentsCount"]),u=Z(t,["reviewSummary","ratingSummary","commentsSummary"]),p=Na(t),b=Ja(t),g=Zr(t).map(y=>({...y,priceLabel:ts(y),metaParts:es(y)})),h=String(t.destinationId||"").trim(),x=String(t.destinationName||"").trim(),w=ea(t.destinationOverrides||{}),C=Z(t,["name","restaurantName","businessName"])||"Hotel",k=a?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.lat},${a.lng}`)}`:r||l?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r} ${l}`.trim())}`:"";Us();const S=h?aa(h):null,j=S?Wn({template:S,overrides:w,hotelCoords:a,imageUrlFn:y=>m(y,"medium")}):"";return h&&!S&&Ya({destinationId:h,overrides:w,hotelCoords:a}),a&&Qa(S?qt({places:S.places,overrides:w,hotelCoords:a}):[]),`
    <div class="app-content-inline app-main-content-safe animate-in fade-in duration-300">
      ${Xs({rooms:g,offers:b,amenities:p,address:r,city:l,cityImageUrl:Z(t,["titleImageUrl","coverImageUrl","heroUrl"]),destinationId:h,destinationName:x,destinationSectionsHtml:j,mapsUrl:k,hotelCoords:a,hotelName:C,rating:o,reviewCount:c,ratingSummary:u,imageUrlFn:y=>m(y,"medium")})}
    </div>
  `}function Xa(e={}){const t=It(e),a=String(e?.restaurantId||t.restaurantId||t.id||"").trim(),r=t?.name||t?.restaurantName||e?.name||"Hotel",l=Ea(a),o=String(l.status||"").trim(),c=l.saving===!0,u=Array.isArray(l.existingImages)?l.existingImages.map(U=>String(U||"").trim()).filter(Boolean):Ma(t),p=Array.isArray(l.imagePreviews)?l.imagePreviews.map(U=>String(U||"").trim()).filter(Boolean):[],b=String(l.imageUrlDraft||"").trim(),[g,h,x]=za(t),w=Ga(t,[g,h,x]),C=Z(t,["distanceCenter","distanceToCenter","centerDistance","cityCenterDistance","centerDistanceLabel","zentrumEntfernung","distanceCentre"]),k=Z(t,["distanceBeach","distanceToBeach","beachDistance","beachDistanceLabel","strandEntfernung","lakeDistance","distanceToLake"]),S=Z(t,["hotelStartingPrice","startingPrice","priceFrom","fromPrice","bestPrice","roomStartingPrice"]),j=t.directCenter===!0||t.inCenter===!0||t.cityCenterDirect===!0,y=t.beachfront===!0||t.onBeach===!0||t.amStrand===!0,P=l.detailsOpen===!0||c,L=p[0]||u[0]||"",_=L?m(L,"thumb"):q,z=[C,k,S?`${S} €`:""].filter(Boolean).join(" · ")||"Plotëso detajet",I=o.includes("fehl")||o.includes("Bitte")||o.includes("Nuk");return`
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
              ${f("plus","w-4 h-4")}
            </button>
          </div>

          <button type="button" data-hotel-card-details-open aria-expanded="${P?"true":"false"}" class="w-full flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 text-left active:scale-[0.99] transition-transform">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
              <img src="${n(_||q)}" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-black text-slate-900 truncate">${n(r)}</p>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(z)}</p>
              <p data-hotel-card-details-state class="text-[9px] font-black uppercase tracking-widest mt-2 text-indigo-600">${P?"Hapur":"Hap detajet"}</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
              ${f("chevron-right","w-4 h-4")}
            </div>
          </button>

          ${o&&!P?`<div class="text-center text-[10px] font-black uppercase tracking-widest mt-4 ${I?"text-rose-500":"text-slate-500"}">${n(o)}</div>`:""}
        </div>

        <div data-hotel-card-editor="${n(a)}" data-hotel-card-details-panel class="${P?"":"hidden "}bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 mb-6">
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
              ${Wa({existingImages:u,newPreviews:p,imageUrlDraft:b})}
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${gn({idPrefix:"hotelCardDistanceCenter",iconName:"navigation",label:"Qendra",value:C,directLabel:Ua,direct:j})}
              ${gn({idPrefix:"hotelCardDistanceBeach",iconName:"waves",label:"Plazhi",value:k,directLabel:Oa,direct:y})}
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Çmimi më i mirë</label>
                <input id="hotelCardStartingPrice" type="text" value="${n(S)}" placeholder="145" inputmode="decimal" class="w-full mt-2 px-5 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              ${Ct({id:"hotelCardFeatureOneText",iconName:"utensils",label:"Ushqimi",value:g,options:Ba})}
              ${Ct({id:"hotelCardFeatureTwoText",iconName:"waves",label:"Shezlongë",value:h,options:Ha})}
              ${Ct({id:"hotelCardFeatureThreeText",iconName:"square-parking",label:"Parking",value:x,options:Va})}
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
        ${ei({restaurantId:a,record:t,editorState:s.hotelRoomsEditor&&typeof s.hotelRoomsEditor=="object"?s.hotelRoomsEditor:{}})}
        ${zt(a,{variant:"travel-offers",suppressLoading:!0})}
      `:`
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">Bitte zuerst dein Hotel-Business im Account auswaehlen.</p>
        </div>
      `}
    </div>
  `}function et(e={}){const t=String(s.profileTopTab||"").trim().toLowerCase(),a=String(s.profileContentTab||"").trim().toLowerCase();return Je(e)?t==="menu"?"menu":a==="menu"||a==="posts"?a:"posts":a==="media"||a==="checkins"?a:"posts"}function Pt(e={}){const t=String(s.profileTopTab||"").trim().toLowerCase();return Je(e)?t==="menu"||t==="cart"||t==="favorites"||t==="landing"?t:"profile":t==="favorites"&&String(s.user?.uid||"").trim()?"favorites":"profile"}function vn(e=0){const t=Math.round(Number(e||0));return Number.isFinite(t)?Math.max(0,Math.min(3,t)):0}function Za(e=0,t=1){const a=Math.max(1,Number(t||0)||1),r=Math.round(Number(e||0));if(!Number.isFinite(r))return 0;const l=r%a;return l<0?l+a:l}function er(e=0){return vn(e)}function tr(e={}){const t=["Mirë se vini","Welcome","Willkommen","Bienvenido","Bienvenue","Benvenuto","Olá","Welkom","Välkommen","Hoş geldiniz","Yokoso","Huānyíng","Namaste"],a=vn(s.profileLandingStep),r=Za(s.profileLandingGreetingIndex,t.length),l=e?.landingScreenOne&&typeof e.landingScreenOne=="object"?e.landingScreenOne:{},o=String(l.businessName||e.name||"casarita").trim()||"casarita",c=$t(l.businessNameColor||e.businessNameColor||e.landingBusinessNameColor||"","#111827"),u=c&&c.toLowerCase()!=="#111827"?c:"",p=$t(l.businessNameColorPart1||e.businessNameColorPart1||e.landingBusinessNameColorPart1||c||"","#111827"),b=$t(l.businessNameColorPart2||e.businessNameColorPart2||e.landingBusinessNameColorPart2||u||"","#4f46e5"),g=o.replace(/\.+$/g,"").trim()||o,h=g.split(/\s+/).filter(Boolean),x=h.length>1?h.slice(0,-1).join(" "):g,w=h.length>1?h[h.length-1]:"",C=w?x:`${x}.`,k=w?`${w}.`:"",S=m(l.logoUrl||e.avatar||"","avatar"),y=String(S||"").trim()||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23f8fafc'/%3E%3Ccircle cx='48' cy='48' r='34' fill='%2394a3b8'/%3E%3Ctext x='48' y='54' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",P=String(l.messageLine1||"Lokali juaj është përgatitur tashmë në Mnyra.").trim(),L=String(l.messageLine2||"Prezenca juaj digjitale eshte gati për aktivizim.").trim(),_=a>=2,z=a>=3,I=Array.isArray(s.profileView?.posts)?s.profileView.posts:Array.isArray(e?.posts)?e.posts:[],U=er(a),O=`
    <div class="absolute w-full flex justify-center pointer-events-none" style="bottom: var(--landing-swipe-bottom);">
      <div class="flex flex-col items-center animate-bounce text-indigo-600/80">
        <span class="text-[9px] font-bold tracking-[0.25em] uppercase mb-2">Swipe</span>
        ${f("chevron-down","w-6 h-6 text-indigo-600")}
      </div>
    </div>
  `;return`
    <section data-landing-swipe-root="true" class="relative w-full overflow-hidden font-sans" style="height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); min-height: calc((var(--viewport-height, 1vh) * 100) - var(--smart-header-total-height, 4.5rem)); overscroll-behavior: none; -webkit-overflow-scrolling: auto; touch-action: none; user-select: none; background: #F8F9FA; --landing-panel-duration: 460ms; --landing-greeting-duration: 720ms; --landing-top-gap: 14px; --landing-swipe-bottom: 0.45rem;">
      <div class="absolute z-[70] flex flex-col items-center" style="right: 0.75rem; top: 33.333333%; transform: translateY(-50%); gap: 0.56rem; padding: 0.35rem 0.3rem; border-radius: 999px; background: rgba(248,250,252,0.66); box-shadow: 0 8px 28px -20px rgba(15,23,42,0.45); backdrop-filter: blur(4px);">
        ${[0,1,2,3].map(B=>{const $=U===B;return`
            <div data-landing-step-dot="${B}" class="rounded-full transition-all duration-300 ease-out" style="width: 9px; height: 9px; transform: scale(${$?"1.22":"1"}); opacity: ${$?"1":"0.88"}; background: ${$?"#4f46e5":"rgba(100,116,139,0.58)"}; border: 1px solid ${$?"rgba(79,70,229,0.96)":"rgba(255,255,255,0.95)"}; box-shadow: ${$?"0 6px 14px -8px rgba(79,70,229,0.95)":"0 2px 6px -5px rgba(15,23,42,0.55)"};"></div>
          `}).join("")}
      </div>

      <div data-landing-panel="0" class="absolute inset-0 z-50 flex flex-col items-start justify-center transition-transform ${a===0?"translate-y-0":"-translate-y-full pointer-events-none"}" style="background: #F8F9FA; color: #111827; padding-top: var(--landing-top-gap); opacity: ${a===0?"1":"0"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-glow="1" class="absolute rounded-full pointer-events-none" style="top: 33.333333%; left: 25%; width: 16rem; height: 16rem; background: radial-gradient(circle at center, rgb(224 231 255 / 0.7) 0%, rgb(224 231 255 / 0.45) 42%, rgb(224 231 255 / 0.06) 72%, rgb(224 231 255 / 0) 100%);"></div>
        <div class="flex flex-col items-start relative z-10 w-full" style="padding-left: 2.5rem; padding-right: 2.5rem;">
          <div class="relative w-full flex justify-start items-center mb-5" style="height: 40px;">
            ${t.map((B,$)=>{const F=$===r,N=$===(r-1+t.length)%t.length;return`
                <h1 data-landing-greeting-item="${$}" class="absolute left-0 font-medium text-indigo-600 origin-left" style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 1.875rem; line-height: 2.25rem; transition: all var(--landing-greeting-duration) cubic-bezier(0.23,1,0.32,1); ${F?"opacity: 1; transform: translateY(0) scale(1);":N?"opacity: 0; transform: translateY(-1.5rem) scale(0.95); pointer-events: none;":!F&&!N?"opacity: 0; transform: translateY(1.5rem) scale(0.95); pointer-events: none;":"opacity: 0;"}">
                  ${n(B)}
                </h1>
              `}).join("")}
          </div>
          <div class="flex items-center gap-3 mb-6">
            <div class="rounded-full shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden shrink-0" style="width:48px;height:48px;min-width:48px;min-height:48px;max-width:48px;max-height:48px;flex:0 0 48px;background:#f8fafc;">
              <img src="${n(y)}" alt="${n(`${o} Logo`)}" class="block rounded-full" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;object-position:center;max-width:none;max-height:none;" />
            </div>
            <h2 class="font-black text-left flex flex-wrap items-baseline" style="font-size:56px;line-height:48px;letter-spacing:-0.05em;column-gap:0.16em;row-gap:0;">
              <span style="color:${n(p)};">${n(C)}</span>${k?`<span style="color:${n(b)};">${n(k)}</span>`:""}
            </h2>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed font-medium text-left" style="max-width: 340px;">
            ${n(P)}<br />
            ${n(L)}
          </p>
        </div>
        ${O}
      </div>

      <div data-landing-panel="1" class="absolute inset-0 transition-transform ${a<1?"translate-y-full":a===1?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===1?"1":"0"}; pointer-events: ${a===1?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="1" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${at(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!0,collapseIdentity:!1,landingMode:!0})}
        </div>
        ${O}
      </div>

      <div data-landing-panel="2" class="absolute inset-0 transition-transform ${a<2?"translate-y-full":a===2?"translate-y-0":"-translate-y-full"}" style="background: #F8F9FA; opacity: ${a===2?"1":"0"}; pointer-events: ${a===2?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="2" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${_?at(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"posts",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
        ${O}
      </div>

      <div data-landing-panel="3" class="absolute inset-0 transition-transform ${a<3?"translate-y-full":"translate-y-0"}" style="background: #F8F9FA; opacity: ${a===3?"1":"0"}; pointer-events: ${a===3?"auto":"none"}; transition-property: transform, opacity; transition-duration: var(--landing-panel-duration); transition-timing-function: cubic-bezier(0.23,1,0.32,1); will-change: transform, opacity;">
        <div data-landing-panel-scroll="3" class="h-full overflow-y-auto overscroll-contain" style="-webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior-y: none; padding-top: var(--landing-top-gap); padding-bottom: 0;">
          ${z?at(e,I,{topTabOverride:"profile",tutorialMode:!0,contentTabOverride:"menu",landingHideContent:!1,collapseIdentity:!0,contentReveal:!0,landingMode:!0}):""}
        </div>
      </div>
    </section>
  `}function At(e=s.profileView?.profile||s.userProfile,{landingPreview:t=!1,selectedTabOverride:a="",compact:r=!1}={}){const l=Je(e),o=String(a||et(e)).trim().toLowerCase()||"posts",c=Xe(e),u=ne(e),p=c?"Details":u?"Shop":v("nav.menu","Menue"),b=l?[{id:"posts",label:v("profile.posts","Beitraege")},{id:"menu",label:p,surface:c?"hotel-details":"menu"}]:[{id:"posts",label:v("profile.posts","Beitraege")},{id:"media",label:v("profile.media","Medien")},{id:"checkins",label:v("profile.checkins","Check-ins")}];return`
    <div data-landing-tutorial-target="tabs" class="app-content-inline mb-6 ${r?"mt-2":"mt-4"} ${t?"pointer-events-auto":""}">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${b.map(g=>`
          <button data-profile-tab="${g.id}" ${g.surface?`data-profile-tab-surface="${n(g.surface)}"`:""} class="flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${o===g.id?"bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]":"text-slate-400 hover:text-slate-600"}">
            ${g.label}
          </button>
        `).join("")}
      </div>
    </div>
  `}function jt(e=s.profileView?.profile||s.userProfile,{disabled:t=!1}={}){const a=et(e);return a==="checkins"||a==="menu"?"":`
    <div class="flex items-center justify-between app-content-inline mb-6 ${t?"pointer-events-none opacity-70":""}">
      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">${n(v("profile.view","Ansicht"))}</span>
      <div class="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
        <button data-profile-view="grid" class="p-2.5 rounded-xl transition-all active:scale-95 ${s.profileViewMode==="grid"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${f("layout-grid","w-4 h-4")}
        </button>
        <button data-profile-view="feed" class="p-2.5 rounded-xl transition-all active:scale-95 ${s.profileViewMode==="feed"?"bg-slate-900 text-white shadow-md":"text-slate-300 active:text-slate-500"}">
          ${f("square","w-4 h-4")}
        </button>
      </div>
    </div>
  `}function G(e=""){return String(e||"").trim()}const xn="mnyra_business_title_image_cache_v1",wn=80;function yn(){if(!s)return{};const e=s.businessTitleImageCache&&typeof s.businessTitleImageCache=="object"?s.businessTitleImageCache:null;if(e?.loaded===!0&&e.items&&typeof e.items=="object")return e.items;let t={};try{const r=(typeof window<"u"?window.localStorage:null)?.getItem?.(xn)||"",l=r?JSON.parse(r):{};l&&typeof l=="object"&&Object.entries(l).forEach(([o,c])=>{const u=G(o),p=G(c);u&&p&&!Q(p)&&(t[u]=p)})}catch{}return s.businessTitleImageCache={loaded:!0,items:t},t}function nr(e={}){try{const t=typeof window<"u"?window.localStorage:null;if(!t)return;t.setItem(xn,JSON.stringify(e))}catch{}}function ar(e={},t="business"){const a=[e?.restaurantId,e?.canonicalRestaurantId,e?.uid,e?.handle,e?.publicSlug,e?.landingSlug,e?.name,t].map(r=>G(r)).filter(Boolean);return[...new Set(a)]}function rr(e=[],t=""){const a=G(t);if(!a||Q(a))return;const r=yn();let l=!1;e.forEach(c=>{const u=G(c);!u||r[u]===a||(r[u]=a,l=!0)});const o=Object.entries(r);if(o.length>wn){const c=o.slice(o.length-wn);Object.keys(r).forEach(u=>delete r[u]),c.forEach(([u,p])=>{r[u]=p}),l=!0}l&&nr(r)}function sr(e=[]){const t=yn();for(const a of e){const r=G(a),l=r?G(t[r]):"";if(l&&!Q(l))return l}return""}function ir(e={},t="business"){return String(e?.restaurantId||e?.canonicalRestaurantId||e?.uid||e?.handle||e?.name||t).trim()||t}function or(e={}){return String(e?.canonicalRestaurantId||e?.restaurantId||e?.id||e?.landingRestaurantId||e?.documentId||"").trim()}function lr(e={}){const a=(Array.isArray(e?.coverImages)?e.coverImages:Array.isArray(e?.titleImages)?e.titleImages:[]).map(r=>String(r||"").trim()).find(Boolean)||"";return String(e?.titleImageUrl||e?.coverImageUrl||e?.coverUrl||e?.heroUrl||a||"").trim()}function cr(e={},t={}){const a=lr(e),r=Array.isArray(t.cacheKeys)?t.cacheKeys:[],l=G(t.stableKey||r[0]||"");if(!a){if(t.allowCacheFallback===!0){const c=sr(r);if(c)return c;const u=l?m("","medium",{stableKey:l}):"";return u&&!Q(u)?u:""}return""}const o=m(a,"medium",l?{stableKey:l}:void 0);return o&&!Q(o)?(rr(r,o),o):""}function $n(e="",t=""){const a=G(e);if(!a)return"";if(/^https?:\/\//i.test(a))return a;const r=a.replace(/^@+/,"").replace(/^instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"").replace(/^tiktok\.com\/@?/i,"").replace(/^www\.tiktok\.com\/@?/i,"").replace(/^\/+/,"").trim();return r?t==="tiktok"?`https://www.tiktok.com/@${encodeURIComponent(r)}`:t==="instagram"?`https://www.instagram.com/${encodeURIComponent(r)}`:"":""}function dr(e=""){const t=G(e);if(!t)return"";const a=t.replace(/[^\d+]/g,"");return a?`tel:${a}`:""}function ur(e={}){const t=Number(e?.gpsLat??e?.lat),a=Number(e?.gpsLng??e?.lng);if(Number.isFinite(t)&&Number.isFinite(a))return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t},${a}`)}`;const r=[e?.address,e?.locationPlace||e?.place,e?.location,e?.city,e?.country].map(l=>G(l)).filter(Boolean).join(", ");return r?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r)}`:""}function tt({href:e="",label:t="",iconName:a="",body:r="",buttonAttrs:l=""}={}){const o=G(e),c=String(l||"").trim();if(!o&&!c)return"";const u=r||f(a,"w-4 h-4"),p="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform";return c?`
    <button type="button" ${c} title="${n(t)}" aria-label="${n(t)}" class="${p}">
      ${u}
    </button>
  `:`
    <a href="${n(o)}" target="_blank" rel="noreferrer" title="${n(t)}" class="${p}">
      ${u}
    </a>
  `}function nt({href:e="",buttonAttrs:t="",iconName:a="",eyebrow:r="",value:l=""}={}){const o=G(l);if(!o)return"";const c=`
    <div class="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 flex items-center justify-center shrink-0">
      ${f(a,"w-4 h-4")}
    </div>
    <div class="min-w-0 flex-1" style="min-width:0;max-width:100%;overflow:hidden;">
      <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">${n(r)}</span>
      <span class="block mt-1 text-sm font-black text-slate-900 truncate" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n(o)}</span>
    </div>
  `;return e?`<a href="${n(e)}" target="${e.startsWith("tel:")?"_self":"_blank"}" rel="noreferrer" class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</a>`:`<button type="button" ${t} class="flex items-center gap-4 text-left min-w-0 w-full max-w-full" style="min-width:0;width:100%;max-width:100%;overflow:hidden;box-sizing:border-box;">${c}</button>`}function pr({profileName:e="",safeBio:t="",metaLine:a="",identityPending:r=!1,followersLabel:l=""}={}){return`
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
          ${r?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1 h-[56px] rounded-[1.2rem]"></div>
          <div class="w-[56px] h-[56px] rounded-[1.2rem]"></div>
        </div>
      </div>
    </div>
  `}function kn(e={},t={}){const a=t.mode==="self"?"self":"public",r=t.disabledBlockClass||"",l=ir(e,a),o=a==="self"?"avatar:self":`avatar:public:${l}`,c=t.avatarUrl||m(e.avatar||"","avatar",{stableKey:o}),u=t.avatarFit||T(!!e.restaurantId),p=String(s?.profileCardInfoOpen||"")===l,b=Number(s?.profileCardInfoHeights?.[l]||0),g=p&&Number.isFinite(b)&&b>0?`height:${Math.ceil(b)}px;`:"",h=t.avatarImgKeyAttr||(a==="self"?'data-img-key="avatar:self"':`data-img-key="avatar:public:${n(l)}"`),x=t.renderAvatarImage===!0?!!String(c||"").trim()&&!Q(c):t.renderAvatarImage!==!1&&!!String(c||"").trim()&&!Q(c)&&!!String(e?.avatar||"").trim(),w=!!t.identityPending,C=t.followersLabel??M(e.followers),k=G(e?.name)||"User",S=G(t.typeLabel||e?.customerType||e?.type||"Business"),j=G(e?.location||"-"),y=a==="public"?`${j} / ${S}`:j,P=t.bioHtml||n(e?.bio||"").replace(/\n/g,"<br>")||n(v("profile.noBio","Noch keine Bio.")),L=`business-cover:${l}`,_=ar(e,l),z=cr(e,{cacheKeys:_,stableKey:L,allowCacheFallback:t.allowTitleImageCacheFallback===!0}),I=ur(e),U=or(e),O=tt(U?{buttonAttrs:`data-marketplace-open-map="${n(U)}"`,label:v("profile.openMap","Karte oeffnen"),iconName:"map"}:{href:I,label:v("profile.openMap","Karte oeffnen"),iconName:"map"}),B=$n(e?.instagramUrl||e?.instagram||e?.insta||"","instagram"),$=$n(e?.tiktokUrl||e?.tiktok||e?.tikTok||"","tiktok"),F=G(e?.phone||e?.telephone||e?.contactPhone||""),N=dr(F),H=G(e?.address||e?.locationLabel||[e?.place||e?.locationPlace,e?.location||e?.city].map(ee=>G(ee)).filter(Boolean).join(", ")),K=[nt({href:B,iconName:"instagram",eyebrow:"Instagram",value:e?.instagram||e?.instagramUrl||e?.insta||""}),nt({href:$,iconName:"music-2",eyebrow:"TikTok",value:e?.tiktok||e?.tiktokUrl||e?.tikTok||""})].filter(Boolean).join(""),Y=a==="self"?`
      <button data-nav="upload" data-upload-intent="chooser" class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent group">
        <span class="relative z-10 flex items-center gap-2">${f("plus","w-4 h-4")} Status</span>
        <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
      </button>
      <button data-nav="settings" class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${f("settings","w-5 h-5")}
      </button>
    `:`
      <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle||"")}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${t.hasPendingFollowRequest?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${t.followTone||"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent"} ${t.hasPendingFollowRequest?"opacity-90 cursor-default":""}">
        <span class="relative z-10 flex items-center gap-2">
          ${t.isFollowing?f("check","w-4 h-4"):""}
          ${n(t.followLabel||v("profile.follow","Follow"))}
        </span>
      </button>
      <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${t.isLocked?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${t.isLocked?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
        ${f("message-circle","w-5 h-5")}
      </button>
    `;if(p){const ee=[nt({href:N,iconName:"phone",eyebrow:v("profile.call","Anrufen"),value:F}),nt({href:I,iconName:"map-pin",eyebrow:v("profile.address","Adresse"),value:H||j}),K].filter(Boolean).join("");return`
      <div data-landing-tutorial-target="identity" data-business-profile-card="${n(l)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${r}" style="${g}min-height: var(--business-profile-card-min-height, 440px);display:grid;grid-template-columns:minmax(0,1fr);width:100%;max-width:100%;min-width:0;box-sizing:border-box;">
        ${pr({profileName:k,safeBio:P,metaLine:y,identityPending:w,followersLabel:C})}
        <div class="p-8 min-w-0 max-w-full overflow-hidden flex flex-col justify-between" style="grid-area:1/1;min-height:100%;width:100%;max-width:100%;box-sizing:border-box;">
          <button type="button" data-profile-card-info-close="${n(l)}" class="absolute top-6 right-6 w-9 h-9 rounded-full border border-slate-100 bg-white text-slate-400 flex items-center justify-center active:scale-95">
            ${f("x","w-4 h-4")}
          </button>
          <div class="pr-10 min-w-0 max-w-full overflow-hidden">
            <h2 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(v("profile.contactInfo","Kontakt & Infos"))}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(j)}</p>
          </div>
          <div class="mt-8 flex flex-col gap-4 min-w-0 max-w-full overflow-hidden">
            ${ee||`<div class="py-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">${n(v("profile.noContactInfo","Noch keine Kontaktdaten"))}</div>`}
          </div>
          <div class="mt-8 pt-6 border-t border-slate-100 min-w-0 max-w-full overflow-hidden">
            <button type="button" data-profile-card-info-close="${n(l)}" class="w-full h-[56px] rounded-[1.2rem] border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center" style="width:100%;max-width:100%;box-sizing:border-box;overflow:hidden;">
              ${n(v("profile.backToProfile","Zurueck zum Profil"))}
            </button>
          </div>
        </div>
      </div>
    `}return`
    <div data-landing-tutorial-target="identity" data-business-profile-card="${n(l)}" class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm ${r}" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${z?`<img src="${n(z)}" data-img-key="${n(L)}" alt="${n(k)}" class="w-full h-full object-cover" loading="eager" fetchpriority="high" decoding="async" onerror="this.style.display='none'" />`:`<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${f("store","w-7 h-7")}</div>`}
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${O}
          ${tt({href:$,label:"TikTok",iconName:"music-2"})}
          ${tt({href:B,label:"Instagram",iconName:"instagram"})}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div ${a==="self"?'id="profileAvatarTrigger"':""} class="relative ${a==="self"?"cursor-pointer group":""}">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${x?`<img src="${n(c)}" data-fallback-src="${n(q)}" decoding="async" width="100" height="100" ${h} class="w-full h-full rounded-[1.8rem] ${u} border-2 border-white bg-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${w?"animate-pulse":""}">${f("store","w-8 h-8 text-slate-300")}</div>`}
            </div>
            ${e.isPremium?`
              <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
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
              <span class="h-7 flex items-center justify-center text-slate-900">${f("info","w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.info","Info"))}</span>
            </button>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(k)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${P}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(y)}</p>
          ${w?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
        </div>
        <div class="flex items-center gap-4">
          ${Y}
        </div>
      </div>
    </div>
  `}function at(e={},t=[],{topTabOverride:a="",tutorialMode:r=!1,contentTabOverride:l="",landingHideContent:o=!1,collapseIdentity:c=!1,contentReveal:u=!1,landingMode:p=!1}={}){const b=Pa(e),g=!!e.privateAccount&&e.uid&&String(e.uid)!==String(s.user?.uid||"")&&!b,h=!!e.pendingFollowRequest&&!b,x=e.restaurantId?"Business":v("nav.user","User"),w=String(e.handle||W(e.name||"user")).replace(/^@/,""),k=n(e.bio||"").replace(/\n/g,"<br>")||n(v("profile.noBio","Noch keine Bio.")),S=Je(e),j=String(a||Pt(e)).trim().toLowerCase()||"profile",y=String(l||et(e)).trim().toLowerCase()||"posts",P=y==="menu",L=y==="checkins",_=t,I={...s?.profileView&&typeof s.profileView=="object"?s.profileView:{},profile:e,posts:Array.isArray(_)?_:[]},U=Xr(s,{profileView:I,profileTopTab:j,profileContentTab:y}),O=String(U?.header?.status||"").trim().toLowerCase()||"loading",B=String(U?.posts?.status||"").trim().toLowerCase()||"loading",$=e.uid||e.restaurantId||w||"public",F=`avatar:public:${$}`,N=String(e?.avatar||"").trim(),H=m(N,"avatar",{stableKey:F}),K=T(!!e.restaurantId),Y=p?"":`data-img-key="avatar:public:${n($)}"`,ee=!N&&!!String(H||"").trim()&&!Q(H),te=!!N||ee&&He(O),ye=Bt=>{if(Bt==null)return!1;const Vn=Number(Bt);return Number.isFinite(Vn)&&Vn>=0},Ot=te||ye(e?.followers)||ye(e?.following),oe=He(O)&&!Ot,$e=!!String(H||"").trim()&&!Q(H)&&te,ot=oe?"...":M(e.followers),lt=oe?"...":M(e.following),ct=S?"pt-2":"pt-10",dt=b?v("profile.following","Following"):h?v("profile.requested","Requested"):g?v("profile.request","Request"):v("profile.follow","Follow"),Ue=b?"bg-slate-100 text-slate-600 shadow-none border border-slate-200":h?"bg-amber-50 text-amber-700 shadow-none border border-amber-200":"bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent",Oe=r?"select-none":"app-main-content-safe",le=r?"pointer-events-none":"",se=!c,Bn=!o,ut=u?p?"transition-opacity duration-200":"animate-in fade-in duration-300":"",Hn=y==="posts"&&_.length>0,Kr=y!=="posts"||Hn||B==="empty"||B==="error",qr=y==="posts"&&!Hn&&B==="error";return!r&&(y==="posts"||y==="media")&&e?.restaurantId&&He(B)&&Se(e),`
    <div class="${Oe}" ${r?'data-landing-tutorial-surface="true"':""}>
      ${j==="profile"||j==="menu"?`
      ${se?`
        <div class="app-content-inline pb-2 ${ct}">
          ${S?kn(e,{mode:"public",disabledBlockClass:le,avatarUrl:H,avatarFit:K,avatarImgKeyAttr:Y,renderAvatarImage:$e,identityPending:oe,followersLabel:ot,followLabel:dt,followTone:Ue,isFollowing:b,hasPendingFollowRequest:h,isLocked:g,bioHtml:k,typeLabel:x,allowTitleImageCacheFallback:He(O)||He(B)}):`
          <div data-landing-tutorial-target="identity" class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100 ${le}">
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div class="relative">
                  <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                    ${$e?`<img src="${n(H)}" data-fallback-src="${n(q)}" decoding="async" width="100" height="100" ${Y} class="w-full h-full rounded-[1.8rem] ${K} border-2 border-white" />`:`<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center ${oe?"animate-pulse":""}">${f(e.restaurantId?"store":"user","w-8 h-8 text-slate-300")}</div>`}
                  </div>
                  ${e.isPremium?`
                    <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                      ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
                    </div>
                  `:""}
                </div>

                <div class="flex items-center gap-6 pt-3 pr-2">
                   <div data-landing-tutorial-target="fans" class="flex flex-col items-center">
                      <span class="font-black text-2xl ${oe?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(ot)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.fans","Fans"))}</span>
                   </div>
                   <div class="w-px h-8 bg-slate-100"></div>
                   <div class="flex flex-col items-center">
                      <span class="font-black text-2xl ${oe?"text-slate-300":"text-slate-900"} leading-none mb-1">${n(lt)}</span>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.followingCount","Folgt"))}</span>
                   </div>
                </div>
              </div>

              <div class="mb-8">
                <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${n(e.name||"User")}</h1>
                ${S?"":`<p class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">@${n(w)}</p>`}
                <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${k}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${n(e.location||"-")} / ${x}</p>
                ${oe?`<p class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">${n(v("profile.headLoading","Profilkopf wird geladen..."))}</p>`:""}
              </div>

              <div class="flex gap-4">
                <button data-landing-tutorial-target="follow" data-public-profile-follow="${n(e.handle)}" data-target-type="${n(e.restaurantId?"restaurant":e.uid?"user":"")}" data-target-id="${n(e.restaurantId||e.uid||"")}" data-target-name="${n(e.name||"")}" data-target-avatar="${n(e.avatar||"")}" ${h?"disabled":""} class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${Ue} ${h?"opacity-90 cursor-default":""}">
                  <span class="relative z-10 flex items-center gap-2">
                    ${b?f("check","w-4 h-4"):""}
                    ${dt}
                  </span>
                </button>
                <button data-landing-tutorial-target="chat" data-open-chat="profile" data-chat-uid="${n(e.uid||"")}" data-chat-handle="${n(e.handle||"")}" data-chat-name="${n(e.name||"")}" data-chat-avatar="${n(e.avatar||"")}" ${g?"disabled":""} class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 ${g?"bg-slate-100 text-slate-300 cursor-not-allowed":"bg-white text-slate-900 active:scale-[0.95]"} transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 group">
                  ${f("message-circle","w-5 h-5")}
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
              ${f("lock","w-7 h-7")}
            </div>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">${n(v("profile.private","Privates Profil"))}</h3>
            <p class="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">${n(v("profile.followAcceptedFirst","Folgen muss zuerst akzeptiert werden"))}</p>
          </div>
        </div>
      `:`
        ${At(e,{landingPreview:r,selectedTabOverride:y,compact:c})}
        ${Bn?jt(e,{disabled:r}):""}

        ${Bn?P?`
          <div class="${le} ${ut}">
            ${Xe(e)?hn(e):it(e,{mode:p?"landing":"profile",allowAutoEnsure:!p})}
          </div>
        `:L?`
          <div class="${le} ${ut}">
            ${St()}
          </div>
        `:`
          ${Kr?`
            ${qr?`
              <div class="app-content-inline ${le}">
                <div class="py-16 text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-rose-500">${n(v("profile.contentLoadError","Inhalte konnten nicht geladen werden"))}</p>
                </div>
              </div>
            `:`
              <div class="${s.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"} ${le} ${ut}">
                ${kt(_,s.profileViewMode,!1,{includeImageKeys:!p})}
              </div>
            `}
          `:`
            <div class="app-content-inline ${le}">
              <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm ${ut}">
                <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(v("profile.postsLoading","Beitraege werden geladen..."))}</div>
              </div>
            </div>
          `}
        `:""}
      `}
      `:`
        ${j==="cart"?ae(e):j==="favorites"?ve(e):""}
      `}
    </div>
  `}function fr(){const e=s.profileView;if(!e||!e.profile)return"";const t=e.profile,a=e.posts||t.posts||[],r=Pt(t);return r==="landing"?tr(t):at(t,a,{topTabOverride:r,tutorialMode:!1})}function Sn(e,{filter:t="all",query:a=""}={}){const r=Array.isArray(e)?e:[],l=ba(a||"");return r.filter(o=>t==="all"||Ce(o.type)===t?l?`${o.name||""} ${o.category||""} ${o.description||""}`.toLowerCase().includes(l):!0:!1)}function In(e,t=0){const a=Number(e);return Number.isFinite(a)?Math.max(0,Math.floor(a)):Math.max(0,Number(t)||0)}function rt(e=[]){return(Array.isArray(e)?e.slice():[]).map((a,r)=>({item:a,idx:r,order:In(a?.orderIndex,r)})).sort((a,r)=>a.order-r.order||a.idx-r.idx).map((a,r)=>({...a.item,orderIndex:In(a.item?.orderIndex,r)}))}function Tt(e={}){const t=String(e?.menuVisibility||"").trim().toLowerCase();return e?.menuHidden===!0||t==="hidden"}function De(e={}){const t=String(e?.menuSection||e?.displaySection||e?.menuPlacement||"").trim().toLowerCase();return t==="drink"?"drink":t==="food"?"food":Ce(e?.type||"food")==="drink"?"drink":"food"}function mr(e={}){return String(e?.category||v("menu.other","Sonstiges")).trim()||v("menu.other","Sonstiges")}function gr(e=""){const t=String(e||"").trim().toLowerCase();return t?(typeof t.normalize=="function"?t.normalize("NFD").replace(/[\u0300-\u036f]/g,""):t).replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""):""}const br=4,hr={thumb:160,small:480,medium:768,large:1280};function Cn({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){return(e==="profile"||e==="landing")&&Number.isFinite(t)&&t>=0&&t<br&&a===0}function vr({mode:e="profile",priorityIndex:t=-1,slideIndex:a=0}={}){const r=Cn({mode:e,priorityIndex:t,slideIndex:a}),l=e==="profile"?' data-image-reveal="menu"':"";return r?`loading="eager" fetchpriority="high"${l}`:`loading="lazy" fetchpriority="low"${l}`}function xr({variant:e="grid"}={}){return e==="thumb"?"(max-width: 640px) 64px, 64px":e==="hero"?"(max-width: 640px) 94vw, (max-width: 1200px) 74vw, 920px":"(max-width: 640px) 48vw, (max-width: 1200px) 28vw, 360px"}function fe(e,{mode:t="profile",priorityIndex:a=-1,slideIndex:r=0,stableKey:l="",preferredSize:o="small",candidateSizes:c=["small","medium","large"],variant:u="grid"}={}){const p=String(e||"").trim(),b=t==="profile"&&l?{stableKey:l}:null,g=Cn({mode:t,priorityIndex:a,slideIndex:r}),h=t==="profile"&&!g&&u!=="thumb",x=m(p,o,b),w=Q(x)?q:x,C=da(p),k=ua(p)&&p!==w?p:C,S=[],j=new Set;c.forEach($=>{const F=hr[$]||0;if(!F)return;const N=m(p,$,b);if(!N||Q(N))return;const H=`${N}|${F}`;j.has(H)||(j.add(H),S.push(`${N} ${F}w`))});const y=S.length>1?S.join(", "):"",P=y?xr({variant:u}):"",L=h?"":y,_=h?"":P,z=L?` srcset="${n(L)}"`:"",I=_?` sizes="${n(_)}"`:"",U=vr({mode:t,priorityIndex:a,slideIndex:r}),O=`${U}${z}${I}`,B=h?[`data-menu-lazy-src="${n(w)}"`,`data-menu-lazy-fallback="${n(k||q)}"`,y?`data-menu-lazy-srcset="${n(y)}"`:"",P?`data-menu-lazy-sizes="${n(P)}"`:""].filter(Boolean).join(" "):"";return{safeImg:h?q:w,fallbackImg:h?q:k,imageAttrs:O,lazyAttrs:B?` ${B}`:"",srcsetValue:y,sizesValue:P,loadingAttrs:U}}function je(e=[],t,a=null){const r=a instanceof Set?a:new Set;return e.map((l,o)=>{const c=mr(l),u=gr(c),p=!!u&&!r.has(u);return p&&r.add(u),`<div${p?` data-menu-category-anchor="${n(u)}"`:""} class="h-full">${t(l,o)}</div>`}).join("")}function Lt(e={}){return String(e?.specialSize||e?.specialCardSize||"").trim().toLowerCase()==="food"?"food":"default"}function wr(e=""){const t=String(e||"").trim();return t?/^(https?:\/\/|mailto:|tel:)/i.test(t)?t:`https://${t.replace(/^\/+/,"")}`:""}function Pn(e={}){const t=String(e?.specialActionType||e?.actionType||"").trim().toLowerCase(),a=wr(e?.specialActionUrl||e?.linkUrl||e?.actionUrl||""),r=String(e?.specialActionProductId||e?.targetProductId||"").trim();return t==="link"&&a?{type:"link",url:a,productId:""}:t==="product"&&r?{type:"product",url:"",productId:r}:{type:"self",url:"",productId:""}}function An(){const e=ne(s.userProfile),t=String(s.menu.filter||"all").trim().toLowerCase()||"all",a=e&&t==="drink"?"all":t;return`
    <div class="flex gap-2 mb-5">
      ${(e?[{id:"all",label:v("menu.all","Alle")},{id:"food",label:v("menu.products","Produkte")}]:[{id:"all",label:v("menu.all","Alle")},{id:"food",label:v("menu.food","Speisen")},{id:"drink",label:v("menu.drinks","Getraenke")}]).map(l=>`
        <button data-menu-filter="${l.id}" class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition ${a===l.id?"bg-slate-900 text-white shadow-md":"bg-white text-slate-400 border border-slate-100"}">
          ${l.label}
        </button>
      `).join("")}
    </div>
  `}function yr(){const e=la().id;return`
    <div class="mb-5 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Layouts</span>
          <h3 class="text-xl font-black italic tracking-tighter">Farben</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sot ne Fokus</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        ${ca.map(t=>{const a=t.id===e,r=t.id==="white"?"text-slate-700":"text-white";return`
            <button type="button" data-menu-layout-color="${t.id}" class="w-12 h-12 rounded-2xl ${t.swatch} ${a?"ring-2 ring-slate-900 ring-offset-2 ring-offset-white":"border border-white/60"} shadow flex items-center justify-center">
              ${a?f("check",`w-4 h-4 ${r}`):""}
            </button>
          `}).join("")}
      </div>
    </div>
  `}function st(e,{poster:t="",objectPosition:a="50% 50%",badge:r=!0}={}){if(!Ht(e))return"";const l=String(e.videoUrl||"").trim();if(!l)return"";const o=t?` poster="${n(t)}"`:"";return`<video data-autoplay-video src="${n(l)}"${o} class="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1]" style="object-position:${a};" muted loop playsinline autoplay preload="metadata"></video>`+(r?'<div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none z-10"><svg viewBox="0 0 24 24" class="w-3.5 h-3.5 fill-white block"><path d="M8 5v14l11-7z"></path></svg></div>':"")}function _t(e,{mode:t="profile",priorityIndex:a=-1}={}){const r=ie(e),l=t==="profile"?Te(e,{index:0}):"",{safeImg:o,fallbackImg:c,imageAttrs:u,lazyAttrs:p}=fe(r,{mode:t,priorityIndex:a,stableKey:l,preferredSize:"thumb",candidateSizes:["thumb","small"],variant:"thumb"}),b=Ne(e),g=s.activeTab==="menu"?s.userProfile:s.profileView?.profile||s.userProfile,h=ne(g),x=cn(e,h),w=h?ln(e.category):e.category||"",C=e.description||"";return t==="admin"?`
      <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
        <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
          <img src="${n(o)}" data-fallback-src="${n(c)}"${p} class="w-full h-full object-cover" style="object-position:${J(e)};" ${u} decoding="async" />
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
            ${f("more-horizontal","w-4 h-4")}
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
        <img src="${n(o)}" data-fallback-src="${n(c)}"${p} class="w-full h-full object-cover" style="object-position:${J(e)};" ${u} decoding="async" />
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
  `}function Ft(e,{mode:t="profile",variant:a="food",priorityIndex:r=-1}={}){const l=ie(e),o=t==="profile"?Te(e,{index:0}):"",c=a==="drink",{safeImg:u,fallbackImg:p,imageAttrs:b,lazyAttrs:g}=fe(l,{mode:t,priorityIndex:r,stableKey:o,preferredSize:c?"small":"medium",candidateSizes:c?["small","medium"]:["small","medium","large"],variant:c?"grid":"hero"}),h=Ne(e),x=s.activeTab==="menu"?s.userProfile:s.profileView?.profile||s.userProfile,w=ne(x),C=cn(e,w),k=w?ln(e.category):e.category||"",S=e.description||"",j=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",y=s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"",P=Ke(e),L=nn(y,P),_=L?an(L):{likes:[],comments:[],counts:{likes:0,comments:0}},z=rn(_),I=`
    <div class="mt-2 flex items-center gap-3 text-[10px] font-bold text-slate-400">
      <span class="inline-flex items-center gap-1">
        ${f("heart","w-3 h-3 text-rose-400")} <span data-menu-like-count="${n(P)}">${n(M(z.likes))}</span>
      </span>
      <span class="inline-flex items-center gap-1">
        ${f("message-circle","w-3 h-3 text-indigo-400")} <span data-menu-comment-count="${n(P)}">${n(M(z.comments))}</span>
      </span>
    </div>
  `;return`
    <div ${j} class="w-full ${c?"h-full p-3 rounded-[1.6rem] flex flex-col":"p-4 rounded-[2rem]"} bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full ${c?"h-28 rounded-[1.4rem]":"h-44 rounded-[1.8rem]"} overflow-hidden bg-slate-100 relative">
        <img src="${n(u)}" data-fallback-src="${n(p)}"${g} class="w-full h-full object-cover" style="object-position:${J(e)};" ${b} decoding="async" />
        ${st(e,{poster:u,objectPosition:J(e)})}
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
            ${k?`<span>${n(k)}</span>`:""}
            <span>${n(C)}</span>
          </div>
          ${S?`<p class="text-xs text-slate-500 mt-2 line-clamp-2">${n(S)}</p>`:""}
          ${I}
        </div>
      `}
    </div>
  `}function Mt(e={}){if(!e?.restaurantId||ne(e))return!1;const t=String(wt(e)||"").trim().toLowerCase();return t?t==="restaurant"||t==="cafe"||t==="fastfood":we(e)}function jn(e){const t=e?.restaurantId||s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"",a=Ke(e),r=nn(t,a),l=r?an(r):{likes:[],comments:[],counts:{likes:0,comments:0}},o=String(s.user?.uid||"").trim(),c=String(s.user?.handle||"").trim().toLowerCase(),u=!!l.likes?.some(p=>{const b=String(p?.uid||"").trim();if(o&&b&&b===o)return!0;const g=String(p?.handle||"").trim().toLowerCase();return!!c&&!!g&&g===c});return{itemId:a,meta:l,counts:rn(l),isLiked:u}}function Te(e,{index:t=0}={}){const a=String(e?.restaurantId||s.menu.restaurantId||s.profileView?.profile?.restaurantId||s.userProfile.restaurantId||"").trim(),r=String(e?.id||Ke(e)||"").trim();if(!a||!r)return"";const l=Number(t),o=Number.isFinite(l)?Math.max(0,Math.floor(l)):0;return`menu-detail:${a}:${r}:${o}`}function $r(e){const t=typeof tn=="function"?tn(e):[],a=Array.isArray(t)?t.filter(Boolean):[];if(a.length)return a;const r=ie(e);return r?[r]:[]}function me(e){return Wr(e?.cardStyle||"",Ce(e?.type||"food"))}function Rt(e,{menuItemId:t=""}={}){if(!e)return null;const a=String(t||e.menuItemId||e.itemId||e.productId||"").trim(),r=Ht(e),l=String(e.videoUrl||"").trim(),o=String(e.posterUrl||"").trim(),c=ie(e)||e.imageUrl||(r?o:"")||"";return{id:e.id||"",title:e.name||e.title||"Sot ne Fokus",text:e.description||e.text||"",imageUrl:c,objectPosition:e.objectPosition||J(e),menuItemId:a,mediaType:r?"video":"image",videoUrl:r?l:"",posterUrl:r?o||c:""}}function A(e=""){return`<div aria-hidden="true" class="${e} bg-slate-100 animate-pulse"></div>`}function kr(e={}){return Qe("focus-carousel-skeleton",{...e,functionName:"renderFocusCarouselSkeleton",source:e?.source||"public-focus"}),`
      <div class="${xt()} rounded-[2.5rem] p-6 border shadow-sm" data-focus-skeleton="true"${re({skeleton:"focus-carousel-skeleton",source:"public-focus"})} aria-hidden="true">
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
  `}function Sr(e={}){return Qe("testfirst-focus-skeleton",{...e,functionName:"renderTestfirstFocusSkeleton",source:e?.source||"public-focus"}),`
      <div class="pt-2 pb-4" data-focus-skeleton="true"${re({skeleton:"testfirst-focus-skeleton",source:"public-focus"})} aria-hidden="true">
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
  `}function Ir(){return`
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
  `}function Cr(){return`
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
  `}function Tn(e={}){return Qe("testfirst-menu-skeleton",{...e,functionName:"renderTestfirstMenuSkeleton",source:e?.source||"public-menu"}),`
      <div id="menu-section" class="mt-5" data-menu-skeleton="true"${re({skeleton:"testfirst-menu-skeleton",source:"public-menu"})}>
        <section class="menu-type-block relative" data-menu-type-block="drink">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
            ${Array.from({length:4},()=>Ir()).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block relative" data-menu-type-block="food">
        <div class="menu-category-section pb-6 pt-4" data-menu-type="food">
          <div class="app-content-inline">
            ${Array.from({length:2},()=>Cr()).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Ln(e="food"){const t=e==="drink";return`
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
  `}function Pr(){return`
      <article class="min-w-0 p-3 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col"${re({skeleton:"shop-product-card-skeleton",source:"public-menu"})} aria-hidden="true">
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
  `}function _n({isShop:e=!1,debugContext:t={}}={}){return Qe(e?"standard-shop-product-skeleton":"standard-menu-skeleton",{...t,functionName:"renderStandardMenuSkeleton",source:t?.source||"public-menu",reason:t?.reason||(e?"shop-products-loading":"menu-loading")}),e?`
        <div class="grid grid-cols-2 gap-4" data-menu-skeleton="true"${re({skeleton:"standard-shop-product-skeleton",source:"public-menu"})}>
          ${Array.from({length:4},()=>Pr()).join("")}
        </div>
      `:`
      <div data-menu-skeleton="true"${re({skeleton:"standard-menu-skeleton",source:"public-menu"})} class="space-y-5">
        <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
        <div class="flex items-center justify-between mb-4">
          ${A("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="drink">
          <div class="grid grid-cols-2 auto-rows-fr gap-4">
            ${Array.from({length:4},()=>Ln("drink")).join("")}
          </div>
        </div>
      </section>
      <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
        <div class="flex items-center justify-between mb-4">
          ${A("h-5 w-24 rounded-full")}
        </div>
        <div data-menu-type="food">
          <div class="space-y-4">
            ${Array.from({length:2},()=>Ln("food")).join("")}
          </div>
        </div>
      </section>
    </div>
  `}function Fn(e,t=[],{mode:a="profile"}={}){const r=e?.restaurantId||"",l=Mt(e)||ne(e);return!r||!l||!t.length?"":`
    <div class="pt-2 pb-4">
      <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
        ${t.map((o,c)=>{const u=o.imageUrl||"",p=String(o.menuItemId||o.id||"").trim(),{safeImg:b,fallbackImg:g,imageAttrs:h,lazyAttrs:x}=fe(u,{mode:a,priorityIndex:c,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:p?`menu-focus:${r}:${p}`:""}),w=String(o.menuItemId||"").trim(),C=a==="profile"&&w?`data-menu-open="${n(w)}" role="button"`:"";return`
            <div ${C} class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2 ${C?"cursor-pointer":""}" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
              <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
                <img src="${n(b)}" data-fallback-src="${n(g)}"${x} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${o.objectPosition||"50% 50%"};" ${h} decoding="async" />
                ${st(o,{poster:b,objectPosition:o.objectPosition||"50% 50%",badge:!1})}
                <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
                  ${f("sparkles","w-3 h-3 text-amber-500")}
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
  `}function Mn(e,{mode:t="profile",priorityIndex:a=-1}={}){const r=ie(e),l=t==="profile"?Te(e,{index:0}):"",{safeImg:o,fallbackImg:c,imageAttrs:u,lazyAttrs:p}=fe(r,{mode:t,priorityIndex:a,stableKey:l,preferredSize:"small",candidateSizes:["small","medium"],variant:"grid"}),b=Ne(e),g=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",{itemId:h,counts:x,isLiked:w}=jn(e);return`
    <div ${g} class="h-full bg-white p-2.5 rounded-[1.8rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col group relative ${t==="profile"?"cursor-pointer":""}">
      <div class="w-full aspect-square rounded-[1.4rem] overflow-hidden bg-slate-100 mb-3 relative">
        <img src="${n(o)}" data-fallback-src="${n(c)}"${p} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${J(e)};" ${u} decoding="async" />
        ${st(e,{poster:o,objectPosition:J(e)})}
        <button
          type="button"
          data-menu-card-like="${n(e.id)}"
          class="absolute top-2 right-2 w-7 h-7 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 ${w?"text-rose-500":"text-slate-300 hover:text-rose-500"}"
          aria-label="Like"
          aria-pressed="${w?"true":"false"}"
        >
          ${f("heart","w-3.5 h-3.5 fill-current opacity-80")}
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
            ${f("plus","w-4 h-4")}
          </button>
        </div>
        <div class="hidden">
          <span data-menu-like-count="${n(h)}">${n(M(x.likes))}</span>
          <span data-menu-comment-count="${n(h)}">${n(M(x.comments))}</span>
        </div>
      </div>
    </div>
  `}function Ar(e,t="profile"){if(t!=="profile")return"";const a=Pn(e);return a.type==="link"&&a.url?`data-menu-special-link="${n(a.url)}" role="button" tabindex="0"`:a.type==="product"&&a.productId?`data-menu-open="${n(a.productId)}" role="button"`:`data-menu-open="${n(e.id)}" role="button"`}function Et(e,{mode:t="profile",size:a="default",priorityIndex:r=-1}={}){const l=ie(e),o=t==="profile"?Te(e,{index:0}):"",c=a==="food",{safeImg:u,fallbackImg:p,imageAttrs:b,lazyAttrs:g}=fe(l,{mode:t,priorityIndex:r,stableKey:o,preferredSize:c?"medium":"small",candidateSizes:c?["small","medium","large"]:["small","medium"],variant:c?"hero":"grid"}),h=Ar(e,t),x=String(e.category||"Special").trim()||"Special",w=n(String(e.name||"Special")).replace(/\n/g,"<br>");return a==="food"?`
      <div ${h} class="rounded-[2.2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden mb-5 group aspect-[16/9] ${t==="profile"?"cursor-pointer":""}" style="border-radius:2.2rem;aspect-ratio:16 / 9;margin-bottom:20px;">
        <img src="${n(u)}" data-fallback-src="${n(p)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${J(e)};" ${b} decoding="async" />
        ${st(e,{poster:u,objectPosition:J(e)})}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
          ${f("arrow-right","w-4 h-4")}
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
      <img src="${n(u)}" data-fallback-src="${n(p)}"${g} class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none pointer-events-none" draggable="false" style="width:100%;height:100%;object-fit:cover;object-position:${J(e)};" ${b} decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
      <div class="absolute top-3 right-3 w-8 h-8 min-w-[2rem] min-h-[2rem] bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white pointer-events-none shrink-0" style="aspect-ratio:1 / 1;">
        ${f("arrow-right","w-4 h-4")}
      </div>
      <div class="absolute bottom-3 left-3 right-3">
        <div>
          <span class="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block shadow-sm">${n(x)}</span>
          <h4 class="text-white text-[14px] font-black leading-tight drop-shadow-md">${w}</h4>
        </div>
      </div>
    </div>
  `}function Rn(e,{mode:t="profile",priorityIndex:a=-1}={}){const r=Ne(e),l=t==="profile"?`data-menu-open="${n(e.id)}" role="button"`:"",o=$r(e),u=(o.length?o:[ie(e)||""]).filter(Boolean),p=u.length?u.slice(0,12):[""],b=p.length>1,{itemId:g,counts:h,isLiked:x}=jn(e),w=M(Math.max(0,Number(h.likes)||0)),C=M(Math.max(0,Number(h.comments)||0));return`
    <div ${l} class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative ${t==="profile"?"cursor-pointer":""}" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        ${b?`
          <div
            data-menu-card-gallery-track="${n(e.id)}"
            class="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
            style="scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;"
          >
            ${p.map((k,S)=>{const j=t==="profile"?Te(e,{index:S}):"",y=fe(k||"",{mode:t,priorityIndex:a,slideIndex:S,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"}),P=S>0,L=P?q:y.safeImg,_=P?q:y.fallbackImg,z=P?y.loadingAttrs:y.imageAttrs,I=P?"":y.lazyAttrs||"",U=P?` data-menu-card-deferred-src="${n(y.safeImg)}"
                    data-menu-card-deferred-fallback="${n(y.fallbackImg)}"
                    ${y.srcsetValue?`data-menu-card-deferred-srcset="${n(y.srcsetValue)}"`:""}
                    ${y.sizesValue?`data-menu-card-deferred-sizes="${n(y.sizesValue)}"`:""}`:"";return`
                <div class="min-w-full h-full snap-center relative" data-menu-card-gallery-slide="${S}" style="min-width:100%;width:100%;height:100%;scroll-snap-align:center;">
                  <img src="${n(L)}" data-fallback-src="${n(_)}"${I}${U} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${J(e)};" ${z} decoding="async" />
                </div>
              `}).join("")}
          </div>
        `:`
          ${p.map((k,S)=>{const j=t==="profile"?Te(e,{index:S}):"",{safeImg:y,fallbackImg:P,imageAttrs:L,lazyAttrs:_}=fe(k||"",{mode:t,priorityIndex:a,slideIndex:S,stableKey:j,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero"});return`
              <div class="w-full h-full">
                <img src="${n(y)}" data-fallback-src="${n(P)}"${_} class="w-full h-full object-cover select-none pointer-events-none" draggable="false" style="object-position:${J(e)};" ${L} decoding="async" />
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
          ${f("heart","w-4 h-4 fill-current opacity-80")}
        </button>
        ${b?`
          <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            ${p.map((k,S)=>`
              <div
                data-menu-card-gallery-dot="${n(e.id)}"
                data-menu-card-gallery-index="${S}"
                class="${S===0?"w-4 h-1.5 bg-white rounded-full shadow-sm":"w-1.5 h-1.5 bg-white/60 rounded-full shadow-sm"}"
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
              <span data-menu-like-count="${n(g)}">${n(w)}</span>
              <span data-menu-comment-count="${n(g)}">${n(C)}</span>
            </div>
          </div>
          <button type="button" class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>${n(v("menu.add","Hinzufuegen"))}</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${f("plus","w-4 h-4 text-white")}
            </div>
          </button>
        </div>
      </div>
    </div>
  `}function jr(e,t,{mode:a="profile",publicMenuSurfaceState:r=null,focusFallbackHtml:l=""}={}){const o=rt(Array.isArray(t)?t:[]),c=String(e?.restaurantId||"").trim(),u=a==="admin"||Sa(c),p=r?.focus?.canRenderFocus?{items:Array.isArray(r.focus.items)?r.focus.items:[],enabled:!0}:c&&u?qe(c):{items:[],enabled:!1},b=p.enabled?(Array.isArray(p.items)?p.items:[]).map($=>Rt({...$,objectPosition:Pe($)})):[],g=o.filter($=>me($)==="testfirst_focus"&&!Tt($)).map($=>Rt($,{menuItemId:$.id||""})).filter(Boolean),h=new Set,x=[...b,...g].filter($=>{const F=String($.menuItemId||$.id||`${$.title}|${$.text}|${$.imageUrl}`);return!F||h.has(F)?!1:(h.add(F),!0)}),w=o.filter($=>!Tt($)),C=w.filter($=>me($)!=="testfirst_focus"),k=C.length?C:w,S=C.length?x:[],j=k.filter($=>De($)==="drink"),y=k.filter($=>De($)!=="drink"),P=($=[])=>{const F=[],N=[];return $.forEach(H=>{const K=me(H);K==="testfirst_food"||K==="testfirst_special"&&Lt(H)==="food"?N.push(H):F.push(H)}),{gridItems:F,foodItems:N}},L=($,F=-1)=>me($)==="testfirst_special"?Et($,{mode:a,priorityIndex:F}):Mn($,{mode:a,priorityIndex:F});let _=0;const z=()=>{const $=_;return _+=1,$},I=new Set,U=($,F)=>!F.gridItems.length&&!F.foodItems.length?"":`
      <section class="menu-type-block relative" data-menu-type-block="${n($)}">
        ${F.gridItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n($)}">
            <div class="grid grid-cols-2 auto-rows-fr gap-3 app-content-inline">
              ${je(F.gridItems,N=>L(N,z()),I)}
            </div>
          </div>
        `:""}
        ${F.foodItems.length?`
          <div class="menu-category-section pb-6 pt-4" data-menu-type="${n($)}">
            <div class="app-content-inline">
              ${je(F.foodItems,N=>{const H=me(N),K=z();return H==="testfirst_special"?Et(N,{mode:a,size:"food",priorityIndex:K}):Rn(N,{mode:a,priorityIndex:K})},I)}
            </div>
          </div>
        `:""}
      </section>
    `,O=P(j),B=P(y);return`
    <div>
      ${Fn(e,S,{mode:a})||l}
      <div id="menu-section" class="mt-5">
        ${U("drink",O)}
        ${U("food",B)}
      </div>
    </div>
  `}function En(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:r=null,priorityOffset:l=0}={}){return e.length?a?`
      <div class="grid grid-cols-2 auto-rows-fr gap-3">
        ${je(e,(o,c)=>Mn(o,{mode:t,priorityIndex:l+c}),r)}
      </div>
    `:`
    <div class="grid grid-cols-2 auto-rows-fr gap-4">
      ${je(e,(o,c)=>Ft(o,{mode:t,variant:"drink",priorityIndex:l+c}),r)}
    </div>
  `:""}function zn(e,{mode:t="profile",useTestfirstCardUi:a=!1,seenCategories:r=null,priorityOffset:l=0}={}){return e.length?a?`
      <div>
        ${je(e,(o,c)=>me(o)==="testfirst_special"&&Lt(o)==="food"?Et(o,{mode:t,size:"food",priorityIndex:l+c}):Rn(o,{mode:t,priorityIndex:l+c}),r)}
      </div>
    `:`
    <div class="space-y-4">
      ${je(e,(o,c)=>Ft(o,{mode:t,variant:"food",priorityIndex:l+c}),r)}
    </div>
  `:""}function Nn(e,{mode:t="profile"}={}){if(t==="admin"){const a=String(s?.menu?.filter||"all").trim().toLowerCase(),r=ne(s.userProfile),l=v("menu.products","Produkte"),o=e.filter(g=>Ce(g?.type)==="drink"),c=e.filter(g=>Ce(g?.type)!=="drink"),u=(g,h,{addType:x=""}={})=>`
      <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${n(g)}</span>
            <h3 class="text-xl font-black italic tracking-tighter">${n(g)}</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(M(h.length))} Eintraege</p>
          </div>
          ${x?`
            <button type="button" data-menu-add-${n(x)} class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
              ${f("plus","w-4 h-4")}
            </button>
          `:""}
        </div>
        ${h.length?`<div class="space-y-3">${h.map(w=>_t(w,{mode:"admin"})).join("")}</div>`:(Ye({functionName:"renderMenuList.adminSection",items:h,rawItems:h,filteredItems:h,renderDecision:"admin-section-no-products",source:"admin-menu"}),`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300"${re({source:"admin-menu:no-products"})}>${n(v("menu.noProducts","Keine Produkte"))}</div>`)}
      </div>
    `;if(r)return u(l,e,{addType:"food"});const p=[{title:v("menu.drinks","Getraenke"),list:o,addType:"drink"},{title:v("menu.food","Speisen"),list:c,addType:"food"}];if(a==="all")return`
        <div>
          ${p.map(g=>u(g.title,g.list,{addType:g.addType})).join("")}
        </div>
      `;const b=p.filter(g=>g.list.length>0);return b.length?`
      <div>
        ${b.map(g=>u(g.title,g.list,{addType:g.addType})).join("")}
      </div>
    `:a==="drink"?u(v("menu.drinks","Getraenke"),[],{addType:"drink"}):a==="food"?u(v("menu.food","Speisen"),[],{addType:"food"}):""}return e.length?`
    <div class="space-y-4">
      ${e.map((a,r)=>_t(a,{mode:t,priorityIndex:r})).join("")}
    </div>
  `:(Ye({functionName:"renderMenuList",items:e,rawItems:e,filteredItems:e,renderDecision:"menu-list-no-products",source:t}),`
      <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]"${re({source:`${t}:no-products`})}>
        ${n(v("menu.noProducts","Keine Produkte"))}
      </div>
    `)}function zt(e,{variant:t="focus",suppressLoading:a=!1}={}){if(!e)return"";const{items:r,enabled:l,loading:o}=qe(e,{includeInactive:!0}),c=M(r.length),u=String(t||"").trim().toLowerCase()==="travel-offers",p=u?"Ofertat":"Sot ne Fokus",b=u?"Oferta":"Highlights",g=u?"Im Travel und Profil sichtbar":"Im Profil sichtbar",h=u?"Ofertat werden geladen...":v("focus.loading","Fokus wird geladen..."),x=u?"Noch keine Oferta-Eintraege":"Noch keine Fokus-Eintraege";return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">${n(p)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${n(b)}</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(c)} Eintraege</p>
        </div>
        <button type="button" data-focus-add class="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <label class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div>
          <p class="text-xs font-black text-slate-800">${u?"Oferta anzeigen":"Im Fokus anzeigen"}</p>
          <p class="text-[10px] font-bold text-slate-400">${n(g)}</p>
        </div>
        <input id="focusEnabledToggle" type="checkbox" class="w-5 h-5 accent-amber-500" ${l?"checked":""} />
      </label>

      ${r.length?`
        <div class="space-y-3">
          ${r.map(w=>{const C=m(w.imageUrl||"","thumb"),k=Q(C)?q:C,S=w.active!==!1?"Aktiv":"Inaktiv",j=w.active!==!1?"text-emerald-600":"text-slate-400";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(k)}" class="w-full h-full object-cover" style="object-position:${Pe(w)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(w.title||"Sot ne Fokus")}</p>
                  ${w.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(w.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 ${j}">${S}</p>
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
  `}function Dn(e={}){if(!e?.restaurantId)return!1;const t=String(wt(e)||"").trim().toLowerCase();return["hotel","hotels","motel","motels","travel","hostel","resort","accommodation"].includes(t)||t==="ecommerce"||ne(e)?!1:we(e)||["restaurant","cafe","coffee","fastfood","food"].includes(t)||!t}function Tr(e={}){if(e.active===!1)return{label:"Inaktiv",className:"text-slate-400"};const t=String(e.status||e.approvalStatus||"pending").trim().toLowerCase();return t==="approved"?{label:"Freigegeben",className:"text-emerald-600"}:t==="rejected"?{label:"Abgelehnt",className:"text-rose-600"}:{label:"Wartet auf Heart",className:"text-amber-600"}}function Lr(e,t){if(!t||!Dn(e))return"";const{items:a,loading:r}=fa(t,{includeInactive:!0}),l=M(a.length);return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Ads</span>
          <h3 class="text-xl font-black italic tracking-tighter">Restaurant Ads</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(l)} Eintraege</p>
        </div>
        <button type="button" data-ad-add class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>

      <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <p class="text-xs font-black text-slate-800">Swipe Ads</p>
        <p class="text-[10px] font-bold text-slate-400">Neue oder geaenderte Ads werden erst nach Heart-Freigabe im Restaurant-Tab angezeigt.</p>
      </div>

      ${a.length?`
        <div class="space-y-3">
          ${a.map(o=>{const c=m(o.imageUrl||"","thumb"),u=Q(c)?q:c,p=Tr(o),b=o.category||"RESTAURANT",g=o.priceSegment||"€€ - €€€";return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(u)}" class="w-full h-full object-cover" style="object-position:${Pe(o)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(o.title||"Ad")}</p>
                  ${o.text?`<p class="text-xs text-slate-500 mt-1 line-clamp-2">${n(o.text)}</p>`:""}
                  <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">${n(b)} · ${n(g)}</p>
                  <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${p.className}">${n(p.label)}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button data-ad-edit="${n(o.id)}" class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 border border-slate-200">Edit</button>
                  <button data-ad-delete="${n(o.id)}" class="px-3 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100">Loeschen</button>
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
  `}function Nt(e){if(Array.isArray(e))return e.map(a=>String(a||"").trim()).filter(Boolean);const t=String(e||"").trim();return t?t.split(/[\n,;|]/).map(a=>a.trim()).filter(Boolean):[]}function _r(e={}){const t=String(e?.restaurantId||"").trim(),a=t?ze(t):null;return{...a&&typeof a=="object"?a:{},...e&&typeof e=="object"?e:{},...t?{restaurantId:t}:{}}}function Dt(e={}){return e.shoppingLandingCard&&typeof e.shoppingLandingCard=="object"?e.shoppingLandingCard:{}}function Fr(e={}){const t=Dt(e);return[...Nt(t.productIds),...Nt(e.shoppingLandingCardProductIds),...Nt(e.shoppingLandingProductIds)].filter(Boolean)}function Ut(e={}){return!e||typeof e!="object"?{}:Object.entries(e).reduce((t,[a,r])=>{const l=String(a||"").trim(),o=String(r||"").trim();return l&&o&&(t[l]=o),t},{})}function Mr(e={}){const t=Dt(e);return{...Ut(e.shoppingLandingProductImageOverrides),...Ut(t.productImageOverrides)}}function Rr(e=""){const t=String(e||"").trim(),a=s.shoppingLandingCardEditor&&typeof s.shoppingLandingCardEditor=="object"?s.shoppingLandingCardEditor:{},r=String(a.restaurantId||"").trim();return r&&r!==t?{}:a}function Er(e){return e?typeof e=="string"?e.trim():typeof e!="object"?String(e||"").trim():String(e.url||e.src||e.cdnUrl||e.imageUrl||e.image||e.photoUrl||e.thumbnail||"").trim():""}function zr(e={}){const a=[ie(e),...Array.isArray(e.imageUrls)?e.imageUrls:[],...Array.isArray(e.images)?e.images:[],e.imageUrl,e.image,e.photoUrl,e.coverUrl,e.img,e.thumbnail].map(Er).filter(Boolean);return a.filter((r,l)=>a.indexOf(r)===l)}function Nr(e={},t={},a={}){const r=String(e?.id||e?.productId||e?.menuItemId||"").trim();if(!r)return null;const l=zr(e).map(g=>({rawUrl:g,imageUrl:m(g,"thumb")})).filter(g=>g.rawUrl&&!Q(g.imageUrl)),o=l[0]?.rawUrl||"",c=String(t?.[r]||"").trim(),u=String(a?.[r]||"").trim(),p=u||c||o,b=p?m(p,"thumb"):"";return{id:r,name:String(e.name||e.title||"Produkt").trim(),price:Ne(e),imageUrl:b&&!Q(b)?b:"",defaultImageRaw:o,cardImageUrl:c,previewImageUrl:u,imageCandidates:l,objectPosition:J(e)}}function Dr(e={},t="",a=[]){if(!t||!ne(e))return"";const r=_r(e),l=Dt(r),o=Rr(t),c=o.saving===!0,u=String(o.status||"").trim(),p=/fehl|error|nicht|nuk|kein/i.test(u),b=String(l.imageUrl||r.shoppingLandingCardImageUrl||r.shoppingLandingImageUrl||"").trim(),g=String(r.logoUrl||r.logo||r.logoURL||r.avatar||e.avatar||"").trim(),h=String(o.imageUrlDraft??b).trim(),x=String(o.imagePreview||h||g||"").trim(),w=x?m(x,"large"):q,C=String(o.titleDraft??(l.title||r.shoppingLandingCardTitle||e.name||"")).trim(),k=o.active!==void 0?o.active!==!1:l.active!==!1&&r.shoppingLandingCardEnabled!==!1,S=Fr(r),j=Array.isArray(o.productIds)?o.productIds.map(I=>String(I||"").trim()).filter(Boolean):null,y=new Set(j||S),P={...Mr(r),...Ut(o.productImageOverrides)},L=o.productImagePreviews&&typeof o.productImagePreviews=="object"?o.productImagePreviews:{},_=(Array.isArray(a)?a:[]).filter(I=>I&&String(I.id||"").trim()&&I.hidden!==!0&&I.available!==!1).map(I=>Nr(I,P,L)).filter(Boolean),z=y.size?`${M(y.size)} ausgewaehlt`:"Keine Auswahl = alle Produkte";return`
    <div data-shopping-landing-card-editor="${n(t)}" class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">Landing Card</span>
          <h3 class="text-xl font-black italic tracking-tighter">Shopping Card</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(z)}</p>
        </div>
        <button type="button" id="shoppingLandingImageTrigger" class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95" aria-label="Bild hochladen">
          ${f("plus","w-4 h-4")}
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
          <input id="shoppingLandingActiveToggle" type="checkbox" class="w-5 h-5 accent-amber-500" style="accent-color:#f97316;" ${k?"checked":""} />
        </label>

        <div class="rounded-[1.8rem] border border-slate-100 bg-slate-50 p-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produkte</p>
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">${n(M(_.length))}</span>
          </div>
          ${_.length?`
            <div class="grid grid-cols-1 gap-2">
              ${_.map(I=>{const U=y.has(I.id),O=I.imageUrl||q,B=String(I.defaultImageRaw||I.imageCandidates[0]?.rawUrl||"").trim(),$=String(I.cardImageUrl||"").trim(),F=String(I.previewImageUrl||"").trim(),N=!!(F||$&&$!==B),H=F||($&&!I.imageCandidates.some(K=>K.rawUrl===$)?$:"");return`
                  <div class="rounded-2xl bg-white border border-slate-100 p-3">
                    <label class="flex items-center gap-3">
                      <input type="checkbox" data-shopping-landing-product="${n(I.id)}" class="w-4 h-4 accent-amber-500" style="accent-color:#f97316;" ${U?"checked":""} />
                      <span class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src="${n(O)}" class="w-full h-full object-cover" style="object-position:${n(I.objectPosition||"50% 50%")};" loading="lazy" decoding="async" />
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
                          ${I.imageCandidates.map((K,Y)=>{const ee=Y===0,te=F?!1:ee?!N:$===K.rawUrl;return`
                              <label class="shrink-0 w-16">
                                <input type="radio" name="shoppingLandingProductImage_${n(I.id)}" data-shopping-landing-product-image-choice="${n(I.id)}" value="${ee?"":n(K.rawUrl)}" class="hidden" ${te?"checked":""} />
                                <span class="block h-16 rounded-2xl overflow-hidden border ${te?"border-slate-900":"border-slate-100"} bg-slate-100">
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

        ${u?`<div class="text-center text-[10px] font-black uppercase tracking-widest ${p?"text-rose-500":"text-slate-500"}">${n(u)}</div>`:""}

        <button id="shoppingLandingSaveBtn" type="button" class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/70 active:scale-95 transition-transform" ${c?"disabled":""}>
          ${c?"Speichern...":"Landing Card speichern"}
        </button>
      </div>
    </div>
  `}function Ur(e){if(!Mt(e)||!un(e))return"";const a=rt((s.menu.items||[]).filter(r=>me(r)==="testfirst_special"));return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Special Cards</span>
          <h3 class="text-xl font-black italic tracking-tighter">Special</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${n(M(a.length))} Karten</p>
        </div>
        <button type="button" data-menu-add-special class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow active:scale-95">
          ${f("plus","w-4 h-4")}
        </button>
      </div>
      ${a.length?`
        <div class="space-y-3">
          ${a.map(r=>{const l=m(ie(r),"thumb"),o=Q(l)?q:l,c=Pn(r),u=c.type==="link"?"Link":c.type==="product"?"Produkt-Modal":"Diese Karte",p=Lt(r)==="food"?"Food-Size":"Normal",b=$a(De(r));return`
              <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100">
                <div class="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src="${n(o)}" class="w-full h-full object-cover" style="object-position:${J(r)};" loading="lazy" decoding="async" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${n(r.name||"Special")}</p>
                  <div class="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>${n(b)}</span>
                    <span>${n(p)}</span>
                    <span>${n(u)}</span>
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
  `}function Un(e,{restaurantId:t="",suppressLoading:a=!1,allowAutoEnsure:r=!0,requirePublicMenuTruth:l=!0}={}){const o=String(t||e?.canonicalRestaurantId||e?.restaurantId||"").trim();if(!o||!we(e))return"";const c=Be(s,{profile:e,routePayload:s?.profileView?.routePayload,webDirectEntry:s?.__webDirectEntry,restaurantId:o});if(l&&c.menu.status!=="ready")return"";const u=!l||c.focus.canRenderFocus;if(r&&!s.focus.loading&&!u&&xe(dn(e,o)),l&&!u)return"";const{items:p,loading:b}=u?{items:Array.isArray(c.focus.items)?c.focus.items:[],loading:c.focus.loading}:qe(o);if(!(u?!0:qe(o).enabled)||!p.length&&!b||a&&b&&!p.length)return"";if(b&&!p.length)return`
      <div class="${xt()} rounded-[2.5rem] p-6 border shadow-sm">
        <div class="text-center py-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(v("focus.loading","Fokus wird geladen..."))}</div>
      </div>
    `;const h=ma(p),x=p[h]||p[0],{safeImg:w,fallbackImg:C,imageAttrs:k,lazyAttrs:S}=fe(x.imageUrl||"",{mode:"profile",priorityIndex:0,preferredSize:"medium",candidateSizes:["small","medium","large"],variant:"hero",stableKey:x?.id?`focus-carousel:${o}:${String(x.id)}`:""}),j=x.text||"";return`
    <div id="focusCarousel" class="${xt()} rounded-[2.5rem] p-6 border shadow-sm">
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
        ${Ht(x)&&String(x.videoUrl||"").trim()?`
          <video data-focus-media="video" data-focus-video data-autoplay-video src="${n(String(x.videoUrl||"").trim())}" ${w?`poster="${n(w)}"`:""} class="w-full h-56 object-cover" style="object-position:${Pe(x)};" muted loop playsinline autoplay preload="metadata"></video>
          <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 24 24" class="w-4 h-4 fill-white block"><path d="M8 5v14l11-7z"></path></svg>
          </div>
        `:`
          <img data-focus-media="image" data-focus-image src="${n(w)}" data-fallback-src="${n(C)}"${S} class="w-full h-56 object-cover" style="object-position:${Pe(x)};" ${k} decoding="async" />
        `}
      </div>
      <div class="mt-4">
        <p data-focus-title class="text-lg font-black text-slate-900">${n(x.title||"Sot ne Fokus")}</p>
        <p data-focus-text class="text-sm text-slate-500 mt-2 leading-relaxed ${j?"":"hidden"}">${n(j)}</p>
      </div>
      ${p.length>1?`
        <div class="flex items-center justify-center gap-2 mt-4">
          ${p.map((P,L)=>`
            <button type="button" data-focus-dot="${L}" class="w-2.5 h-2.5 rounded-full ${L===h?"bg-slate-900":"bg-slate-200"}"></button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function Or(e,t=220){const a=encodeURIComponent(e||"");return`https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${a}`}function On({label:e,url:t,caption:a}){if(!t)return"";const r=Or(t,240);return`
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
  `}function Br({profile:e,restaurantId:t,catalogLabel:a}){if(!t||!we(e))return"";if(typeof Zt=="function"){const o=Ge?Ge(t):null;(!o||o.sameRestaurant!==!0||!o.loading&&!o.loaded&&!o.error)&&Zt(e)}const r=typeof Ge=="function"?Ge(t):{enabled:!0,count:0,tables:[],loading:!1,saving:!1,error:""},l=(r.tables||[]).map(o=>{const c=ga("apps/menyra-social/index.html",{r:t,tab:"menu",source:"qr",table:o});return On({label:`Tisch ${o}`,url:c,caption:`${a} fuer Tisch ${o}`})}).join("");return`
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
  `}function Hr(){const e=s.userProfile,t=e.restaurantId||"",a=String(s.user?.uid||"").trim(),r=String(s.__authBootstrapInFlightUid||"").trim(),l=!t&&!!a&&(!!s.__authProfileLoadPromise||r===a),o=Xe(e),c=we(e),u=s.profileView?.profile?.restaurantId?s.profileView.profile:null,p=R()&&!!u?.restaurantId&&we(u),b=ne(e),g=ya(ra(e)),h=t?ze(t):null,x=h?.name||h?.restaurantName||e.name||"Business",w=t&&s.menu.restaurantId===t,C=String(s.menu.source||"").trim().toLowerCase(),k=!!w&&C==="collection",S=!!w&&C==="collection"&&s.menu.loading,j=!!t&&(S||!k),y=b?"all":s.menu.filter,P=k?Sn(s.menu.items,{filter:y,query:s.menu.query}):[],_=un(e)?P:P.filter(U=>!Aa(U)),z=rt(_),I=M(z.length);if(t&&o){_a(e);const U=String(s.focus?.truthSource||"").trim().toLowerCase();return!s.focus.loading&&(s.focus.restaurantId!==t||U!=="public-menu")&&xe(e),Xa(e)}return t&&c&&!k&&!S&&Ve(e),t&&c&&!s.focus.loading&&s.focus.restaurantId!==t&&xe(e),t&&Dn(e)&&vt(e),c?`
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

      ${t?zt(t):""}
      ${t?Lr(e,t):""}
      ${t?Dr(e,t,k?s.menu.items:[]):""}
      ${t&&k?Ur(e):""}

      ${t?`
        <div class="mb-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          ${f("search","w-4 h-4 text-slate-400")}
          <input id="menuSearchInput" type="text" value="${n(s.menu.query||"")}" placeholder="Produkt suchen..." class="w-full bg-transparent text-sm font-bold outline-none" />
        </div>

        ${An()}

        ${j?`<div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(v("menu.loading",`${g} wird geladen...`,{label:g}))}</div>`:Nn(z,{mode:"admin"})}
        ${s.menu.error?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500 mt-4">${n(s.menu.error)}</div>`:""}
        ${Br({profile:e,restaurantId:t,catalogLabel:g})}
      `:""}

    </div>
  `:p?it(u):`
      <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500">
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
          <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            ${f("lock","w-6 h-6")}
          </div>
          <h2 class="text-lg font-black italic text-slate-900 mb-2">${g}</h2>
          <p class="text-sm text-slate-500">Diese Funktion ist nur fuer Business-Profile.</p>
        </div>
      </div>
    `}function it(e,{mode:t="profile",allowAutoEnsure:a=!0}={}){const r=s?.profileView?.routePayload&&typeof s.profileView.routePayload=="object"?s.profileView.routePayload:null,l=s?.__webDirectEntry&&typeof s.__webDirectEntry=="object"&&s.__webDirectEntry.active===!0?s.__webDirectEntry:null;let o=Be(s,{profile:e,routePayload:r,webDirectEntry:l});const c=o.restaurantId||ka(e,r);if(!c)return`
      <div class="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
        ${n(v("menu.noRestaurantId","Keine Restaurant-ID gefunden"))}
      </div>
    `;const u=dn(e,c),p=ne(u),b=we(u)&&!p;b&&(o=Be(s,{profile:u,routePayload:r,webDirectEntry:l,restaurantId:c}));const g=String(l?.canonicalRestaurantId||l?.restaurantId||"").trim(),h=new Set(o.targetIds),x=o.menu.status==="ready",w=o.focus.canRenderFocus,C=x&&b,k=o.focus.matches===!0&&o.focus.loading===!0,j=String(s?.profileView?.menuAccessSource||l?.menuAccessSource||r?.menuAccessSource||"").trim().toLowerCase()==="qr",y=l?.active===!0&&l?.webPriority===!0&&l?.menuFirst===!0&&String(s?.activeTab||"").trim().toLowerCase()==="profile"&&String(s?.profileTopTab||"").trim().toLowerCase()==="menu"&&(g===c||h.has(c)),P=y&&!j,L=["ready","empty","error"].includes(o.menu.status),_=y&&L,z=y&&(!C||o.menu.status!=="ready"),I=!C||o.focus.settled===!0||o.focus.confirmedEmpty===!0||o.menu.status!=="ready";a&&!_&&!L&&Ie(u),a&&!z&&!I&&!k&&x&&(!P||L)&&xe(u);const O=o.menu.canRenderItems?rt(Sn(o.menu.items,{filter:"all",query:""})).filter(se=>!Tt(se)):[],B=o.menu.error||"",$=Yr(o.menu,O),{hasItems:F,hasError:N,isLoading:H,shouldRenderNoProducts:K}=$;va({profile:u,routePayload:r,surface:o,decision:$});const Y={profile:u,routePayload:r,surface:o,decision:$,rawItems:o.menu.items,items:O,filteredItems:O,source:"public-menu"},ee=wa(o,O),te=O.filter(se=>De(se)==="drink"),ye=O.filter(se=>De(se)!=="drink"),Ot=0,oe=te.length,$e=Mt(e),ot=$e||p,lt=new Set;F&&c&&(sa(O,c),Ca(O,c));const ct=c&&w?(Array.isArray(o.focus.items)?o.focus.items:[]).map(se=>Rt({...se,objectPosition:Pe(se)})).filter(Boolean):[],dt=o.focus.status==="empty"||o.focus.status==="error",Ue=b&&!w&&!dt&&o.menu.status!=="empty"&&o.menu.status!=="error",Oe=ct.length?Fn(u,ct,{mode:t}):Ue?Sr({...Y,reason:"focus-truth-pending"}):"",le=ot?Oe:Un(u,{restaurantId:c,suppressLoading:!0,allowAutoEnsure:x&&(!P||L),requirePublicMenuTruth:!0})||(Ue?kr({...Y,reason:"focus-truth-pending"}):"");return $e?`
      <div class="app-main-content-safe"${ee}>
        ${H?`
          ${Oe}
          ${Tn({...Y,reason:"menu-loading"})}
        `:`
          ${F?jr(u,O,{mode:t,publicMenuSurfaceState:o,focusFallbackHtml:Oe}):N?`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(v("menu.loadError","Menu konnte nicht geladen werden"))}</div>`:K?(Ye({...Y,functionName:"renderProfileMenuView",renderDecision:"testfirst-no-products"}),`<div class="app-content-inline pt-6 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"${re({source:"public-menu:no-products"})}>${n(v("menu.noProducts","Keine Produkte"))}</div>`):Tn({...Y,reason:"menu-not-confirmed-empty"})}
          ${B?`<div class="app-content-inline pt-4 text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(B)}</div>`:""}
        `}
      </div>
    `:`
    <div class="app-content-inline app-main-content-safe space-y-5"${ee}>
      ${le}
      ${H?`
        ${_n({isShop:p,debugContext:{...Y,reason:"menu-loading"}})}
      `:`
        ${F?`
          ${p?`
            ${oa(O,{profile:e})}
          `:`
            ${te.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="drink">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(v("menu.drinks","Getraenke"))}</h3>
                </div>
                <div data-menu-type="drink">
                  ${En(te,{mode:t,useTestfirstCardUi:$e,seenCategories:lt,priorityOffset:Ot})}
                </div>
              </section>
            `:""}
            ${ye.length?`
              <section class="menu-type-block bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm" data-menu-type-block="food">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-black italic tracking-tighter">${n(v("menu.food","Speisen"))}</h3>
                </div>
                <div data-menu-type="food">
                  ${zn(ye,{mode:t,useTestfirstCardUi:$e,seenCategories:lt,priorityOffset:oe})}
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
            ${Ye({...Y,functionName:"renderProfileMenuView",renderDecision:p?"shop-no-products":"standard-no-products"}),`<div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm"${re({source:"public-menu:no-products"})}>
              <div class="text-center py-16 text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">
                ${n(v("menu.noProducts","Keine Produkte"))}
              </div>
            </div>`}
          `:`
            ${_n({isShop:p,debugContext:{...Y,reason:"menu-not-confirmed-empty"}})}
          `}
        `}
        ${B?`<div class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${n(B)}</div>`:""}
      `}
    </div>
  `}function Vr(){const e=s.userProfile,t=E(e),a=t?s.businessPosts:s.userPosts,r=String(s.user?.uid||e?.uid||"").trim(),l=String(e?.restaurantId||"").trim(),o=String(s.__userPostsLoadingUid||"").trim(),c=String(s.__businessPostsLoadingRestaurantId||"").trim(),u=String(s.__authBootstrapInFlightUid||"").trim(),p=!!r&&o===r,b=!!l&&c===l,g=!!r&&u===r,h=t?b||g&&!a.length:p||g&&!a.length,x=String(e.handle||W(e.name||"user")).replace(/^@/,""),C=n(e.bio||"").replace(/\n/g,"<br>")||n(v("profile.noBio","Noch keine Bio.")),k=et(e),S=k==="menu",j=k==="checkins",y=a,P=m(e.avatar,"avatar"),L=T(t),_=Pt(e);return`
    <div class="app-main-content-safe">
      ${_==="profile"||_==="menu"?`
      <div class="app-content-inline pb-2 ${t?"pt-2":"pt-10"}">
        <input type="file" id="profileAvatarInput" class="hidden" accept="image/*" />
        ${t?kn(e,{mode:"self",avatarUrl:P,avatarFit:L,followersLabel:M(e.followers),bioHtml:C}):`
        <div class="bg-white rounded-[2.5rem] p-8 relative overflow-hidden z-10 border border-slate-100">
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-8">
              <div id="profileAvatarTrigger" class="relative cursor-pointer group">
                <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500">
                  <img src="${n(P)}" data-fallback-src="${n(q)}" decoding="async" width="100" height="100" data-img-key="avatar:self" class="w-full h-full rounded-[1.8rem] ${L} border-2 border-white" />
                </div>
                ${e.isPremium?`
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg text-blue-500 border-2 border-slate-50">
                    ${f("badge-check","w-4 h-4 fill-blue-500 text-white")}
                  </div>
                `:""}
              </div>

              <div class="flex items-center gap-6 pt-3 pr-2">
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(M(e.followers))}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">${n(v("profile.fans","Fans"))}</span>
                 </div>
                 <div class="w-px h-8 bg-slate-100"></div>
                 <div class="flex flex-col items-center">
                    <span class="font-black text-2xl text-slate-900 leading-none mb-1">${n(M(e.following))}</span>
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

      ${At(e)}
      ${jt(e)}

      ${S?`
        ${Xe(e)?hn(e):it(e)}
      `:j?`
        ${St()}
      `:`
        ${h&&!y.length?`
          <div class="app-content-inline">
            <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
              <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">${n(v("profile.postsLoading","Beitraege werden geladen..."))}</div>
            </div>
          </div>
        `:`
          <div class="${s.profileViewMode==="grid"?"grid grid-cols-2 gap-4 app-content-inline grid-flow-dense":"flex flex-col gap-8 app-content-inline"}">
            ${kt(y,s.profileViewMode)}
          </div>
          ${k==="posts"?`
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
        ${_==="cart"?ae(e):_==="favorites"?ve(e):""}
      `}
    </div>
  `}return{renderProfilePostCardFancy:pn,renderProfilePostsFancy:kt,renderProfileCheckins:St,renderProfileTabs:At,renderProfileViewControls:jt,renderPublicProfileView:fr,renderMenuFilterRow:An,renderMenuLayoutSection:yr,renderMenuItemCard:_t,renderMenuItemCardStacked:Ft,renderMenuDrinkGrid:En,renderMenuFoodList:zn,renderMenuList:Nn,renderFocusAdminSection:zt,renderFocusCarousel:Un,renderMenuQrCard:On,renderMenuAdminView:Hr,renderProfileMenuView:it,renderProfileView:Vr}}export{yi as createProfileMenuFocusRenderController};
