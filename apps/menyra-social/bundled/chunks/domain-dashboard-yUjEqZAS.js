const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-B46-2Pi4.js","chunks/domain-feed-social-eager-wIo8IQL4.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-0R8UqAbK.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as ge}from"./domain-auth-Aq-4Vdvh.js";import{f as j,r as be,l as _e,s as q}from"./domain-analytics-jv5B-kA2.js";const ve=20,xe=8;function y(e=""){return e==null?"":String(e).trim()}function T(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function we(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),s=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${s}`}function ke(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],y(t.imageUrl??t.image??t.photoUrl)],s=[];return a.forEach(i=>{const l=y(i);l&&!s.includes(l)&&s.push(l)}),s.slice(0,xe)}function Pe(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},s=T(a.persons??a.guests??a.capacity),i=T(a.size??a.sizeSqm??a.area),l=ke(a);return{id:y(a.id)||we(Date.now()+t),title:y(a.title??a.name),description:y(a.description??a.text).slice(0,400),imageUrl:l[0]||"",images:l,price:T(a.price??a.pricePerNight),currency:y(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:s==null?null:Math.min(20,Math.round(s)),beds:y(a.beds??a.bedsLabel).slice(0,60),size:i==null?null:Math.min(500,Math.round(i)),tag:y(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function Se(e=[]){return(Array.isArray(e)?e:[]).slice(0,ve).map((t,a)=>Pe(t,{index:a}))}function Ce(e={}){return Se((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function We(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),y(e?.beds)&&t.push({icon:"bed",label:y(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function et(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=y(e?.currency).toUpperCase()||"EUR",s=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${s}`:`${s} ${a}`}const V="mnyraDashboardStyles",ze=`
.mnyra-dash {
  /* Horizontale Flucht auf die SICHTBAREN Header-Icons (nicht die
     unsichtbaren Touch-Kreise): Menue-Striche beginnen bei 28px,
     Warenkorb-Symbol endet bei 30px vom rechten Rand - 28px beidseitig
     trifft beide optisch (rechts 2px Toleranz, im Browser vermessen). */
  padding: 16px 28px 112px;
  --dash-surface: #ffffff;
  --dash-plane: #f8fafc;
  --dash-ink: #0f172a;
  --dash-ink-2: #475569;
  --dash-muted: #94a3b8;
  --dash-border: rgba(15, 23, 42, 0.08);
  /* Genau die Linie, die auch die Profil-Karten tragen (border-slate-100). */
  --dash-hairline: #f1f5f9;
  --dash-accent: #4f46e5;
  --dash-accent-soft: #eef2ff;
  /* Eine Rundung fuer alle Karten des Panels - gemessen an der Vorlage
     (25px). Kein Schatten, und als Rand dieselbe Haarlinie wie im Profil. */
  --dash-card-radius: 25px;
  color: var(--dash-ink);
  font-family: inherit;
}
.mnyra-dash * { box-sizing: border-box; }
.mnyra-dash__greet {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  margin: 4px 0 16px;
}
/* Gleicher Rahmen wie das Profil-Avatar (Indigo->Lila-Ring, weisser
   Innenrand, abgerundete Quadratform), auf 44px verkleinert, damit das
   Bild zur Hoehe des zweizeiligen Textblocks passt. Ohne Schatten: mit
   Schatten stand das Bild vor der Seite statt darin. */
.mnyra-dash__greet-logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  padding: 2px;
  background: linear-gradient(to bottom right, #6366f1, #a855f7);
  flex: 0 0 auto;
}
.mnyra-dash__greet-logo img,
.mnyra-dash__greet-logo-fallback {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 2px solid #ffffff;
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
.mnyra-dash__greet-text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.mnyra-dash__greet-title {
  font-size: 18px;
  font-weight: 900;
  line-height: 1.1;
  margin: 0;
  color: var(--dash-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Dieselbe Farbe wie der Name des Lokals daneben. */
.mnyra-dash__greet-hello { color: var(--dash-ink); }
.mnyra-dash__greet-sub {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  color: var(--dash-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* "Posto n'Zbulo": eigene Karte, mit deutlichem Abstand zur Begruessung
   darueber. Ueberschrift, Untertitel, darunter zwei Knoepfe nebeneinander -
   der linke ausgefuellt, der rechte ruhig. */
.mnyra-dash__composer {
  margin-top: 34px;
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 18px;
}
/* Schrift der Ueberschrift bleibt unveraendert. */
.mnyra-dash__composer-title {
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--dash-ink);
}
.mnyra-dash__composer-accent { color: var(--dash-accent); }
/* Schrift des Untertitels bleibt unveraendert. */
.mnyra-dash__composer-sub {
  margin: 5px 0 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--dash-muted);
}
.mnyra-dash__composer-actions {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
/* Ein Knopf ueber die ganze Breite: die Wahl zwischen Postim und Story
   trifft man im Modal an der Leiste unten. */
.mnyra-dash__composer-actions--single { grid-template-columns: minmax(0, 1fr); }
/* Zwei halbe Karten unter "Posto n'Zbulo": zusammen genau so breit wie die
   Karte darueber, gleiche Oberflaeche, nur je ein Knopf. */
.mnyra-dash__composer-row {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.mnyra-dash__composer--split {
  margin-top: 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
}
/* Auf halber Breite steht die Ueberschrift eine Spur kleiner - so bleibt
   "Posto n'Profil" auf einer Zeile. */
.mnyra-dash__composer--split .mnyra-dash__composer-title { font-size: 15px; }
.mnyra-dash__composer--split .mnyra-dash__composer-actions {
  margin-top: auto;
  padding-top: 14px;
  grid-template-columns: minmax(0, 1fr);
}
.mnyra-dash__composer-btn {
  min-height: 46px;
  border: 1px solid var(--dash-border);
  border-radius: 14px;
  background: var(--dash-plane);
  color: var(--dash-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  cursor: pointer;
  text-align: center;
  min-width: 0;
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}
.mnyra-dash__composer-btn--primary {
  background: var(--dash-accent);
  border-color: var(--dash-accent);
  color: #ffffff;
}
.mnyra-dash__composer-btn:active { transform: scale(0.97); }
.mnyra-dash__composer-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: var(--dash-accent);
}
.mnyra-dash__composer-btn--primary .mnyra-dash__composer-btn-icon { color: #ffffff; }
/* Die Karte kommt ohne den Tailwind-Build aus: Symbolgroesse steht hier. */
.mnyra-dash__composer-btn-icon svg,
.mnyra-dash__composer-btn-icon i {
  width: 16px;
  height: 16px;
  display: block;
}
.mnyra-dash__composer-btn-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.mnyra-dash__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 720px) { .mnyra-dash__actions { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mnyra-dash__action {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 12px;
  min-height: 92px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  text-align: left;
  min-width: 0;
}
.mnyra-dash__action:active { transform: scale(0.98); }
.mnyra-dash__action-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--dash-accent-soft);
  color: var(--dash-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.mnyra-dash__action-label {
  font-size: 12px;
  font-weight: 900;
  color: var(--dash-ink);
  margin: 0;
  line-height: 1.25;
}
.mnyra-dash__action-sub {
  font-size: 10px;
  font-weight: 700;
  color: var(--dash-muted);
  margin: 2px 0 0;
  line-height: 1.3;
}
.mnyra-dash__kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
@media (min-width: 720px) { .mnyra-dash__kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.mnyra-dash__kpi {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 12px 14px;
  min-height: 86px;
  min-width: 0;
}
.mnyra-dash__kpi-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dash-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__kpi-value {
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 2px;
  color: var(--dash-ink);
  font-variant-numeric: tabular-nums;
}
.mnyra-dash__kpi-today {
  font-size: 11px;
  font-weight: 700;
  color: var(--dash-ink-2);
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.mnyra-dash__posts {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 6px;
}
.mnyra-dash__post {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  min-height: 64px;
  border-bottom: 1px solid var(--dash-plane);
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
/* Der Platzhalter beim Laden steht dort, wo gleich eine Karte steht - gleiche
   Rundung, damit beim Erscheinen nichts springt. */
.mnyra-dash__skeleton {
  border-radius: var(--dash-card-radius);
  background: var(--dash-plane);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  border: 1px solid transparent;
}
@keyframes mnyraDashPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
`;function De(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(V)))try{const t=e.createElement("style");t.id=V,t.textContent=ze,e.head?.appendChild(t)}catch{}}function m(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function S(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const Fe=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function $e({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return Fe.includes(a)?"hotel":"restaurant"}function Re({kind:e="restaurant",isOwner:t=!1,canAccessOrders:a=!1}={}){const s=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Posto foto ose video"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"E dukshme 24h"}];return e==="hotel"?s.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?s.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):s.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),s.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),e!=="hotel"&&a&&s.push({nav:"orders",iconName:"shopping-cart",label:"Porosite",sub:"Hyrje & Status"}),s.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Te gjitha statistikat"}),t&&s.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),s.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),s}function je(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function J(e=0,t=""){const a=j(e);return t?`${a} ${t}`:a}function Ne(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function Ie({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:s}={}){const i=Ne(a);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${m(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${S(s,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${m(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${m(i.text)}</p>
      </div>
    </div>
  `}function Ee({iconFn:e}={}){return`
    <div class="mnyra-dash__composer" data-dashboard-composer-card>
      <p class="mnyra-dash__composer-title">Posto n'<span class="mnyra-dash__composer-accent">Zbulo</span></p>
      <p class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</p>
      <div class="mnyra-dash__composer-actions mnyra-dash__composer-actions--single">
        <button type="button" class="mnyra-dash__composer-btn mnyra-dash__composer-btn--primary" data-dashboard-composer="post">
          <span class="mnyra-dash__composer-btn-icon">${S(e,"plus","w-4 h-4")}</span>
          <span class="mnyra-dash__composer-btn-label">Posto</span>
        </button>
      </div>
    </div>
  `}function Te({iconFn:e}={}){return`<div class="mnyra-dash__composer-row">${[{accent:"Profil",sub:"Postim që shfaqet në profilin tënd.",action:'data-dashboard-composer="profile"',iconName:"plus",label:"Posto",primary:!0},{accent:"Meny",sub:"Produktet dhe kategoritë e menysë.",action:'data-nav="menu"',iconName:"utensils",label:"Ndrysho",primary:!1}].map(a=>`
    <div class="mnyra-dash__composer mnyra-dash__composer--split">
      <p class="mnyra-dash__composer-title">Posto n'<span class="mnyra-dash__composer-accent">${m(a.accent)}</span></p>
      <p class="mnyra-dash__composer-sub">${m(a.sub)}</p>
      <div class="mnyra-dash__composer-actions">
        <button type="button" class="mnyra-dash__composer-btn${a.primary?" mnyra-dash__composer-btn--primary":""}" ${a.action}>
          <span class="mnyra-dash__composer-btn-icon">${S(e,a.iconName,"w-4 h-4")}</span>
          <span class="mnyra-dash__composer-btn-label">${m(a.label)}</span>
        </button>
      </div>
    </div>
  `).join("")}</div>`}function Me({actions:e=[],iconFn:t}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(s=>{const i=s.uploadIntent?` data-upload-intent="${m(s.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${m(s.nav)}"${i}>
        <span class="mnyra-dash__action-icon">${S(t,s.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${m(s.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${m(s.sub||"")}</span>
        </span>
      </button>
    `}).join("")}</div>
    </div>
  `}function Oe({kpiDefs:e=[],week:t={},today:a={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(i=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${m(i.label)}</p>
      <p class="mnyra-dash__kpi-value">${m(J(t?.[i.key]||0,i.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${m(J(a?.[i.key]||0,i.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function Be({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let s="";return a.length?(s=a.map(i=>{const l=[i.dateLabel,`${j(i.likesCount||0)} Likes`,`${j(i.commentsCount||0)} Kommentare`];return Number(i.impressions||0)>0&&l.push(`${j(i.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${i.thumbUrl?`<img src="${m(i.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:S(t,i.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${m(i.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${m(l.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `}).join(""),s=`<div class="mnyra-dash__posts">${s}</div>`):s=`
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
      ${s}
    </div>
  `}function G({kpiCount:e=6}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
      </div>
      <div class="mnyra-dash__kpis">${Array.from({length:Math.max(1,e)}).map(()=>'<div class="mnyra-dash__skeleton" style="min-height:86px;"></div>').join("")}</div>
    </div>
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function Le(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function He({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${m(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Ue(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Ke="menyra_social_dashboard_cache_v1::",Z="menyra_social_composer_products_v1::",Ae=2500,qe=1200,Ve=6,Je=3;function M(e){const t=Number(e);return Number.isFinite(t)?t:0}function Ge(e={}){const t=String(e.createdAtClient||"").trim();if(t){const s=new Date(t);if(!Number.isNaN(s.getTime()))return s}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const s=a.toDate();if(s instanceof Date&&!Number.isNaN(s.getTime()))return s}catch{}return null}function Ze(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},s=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",i=String(a.thumbUrl||(s==="image"?a.url:"")||t.thumbUrl||"").trim(),l=Ge(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:s,thumbUrl:i,likesCount:M(t.likesCount),commentsCount:M(t.commentsCount),impressions:0,dateLabel:l?l.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:l?l.getTime():0}}function Qe({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const s=Array.isArray(e)?e:[],i=q(s),l=s.find(u=>String(u?.date||u?.id||"").trim()===String(t||"").trim()),b=q(l?[l]:[]),N=i.merged?.posts&&typeof i.merged.posts=="object"?i.merged.posts:{},_=(Array.isArray(a)?a:[]).map(u=>Ze(u?.id,u?.data||{})).filter(u=>u.id).sort((u,P)=>P.createdAtMs-u.createdAtMs).slice(0,Je).map(u=>({...u,impressions:M(N[u.id]?.impressions)}));return{day:String(t||"").trim(),week:i.summary,today:b.summary,posts:_}}function tt({state:e,renderFn:t,documentObj:a,firestoreApi:s={},profileApi:i={},composerApi:l={},iconFn:b,storageObj:N}={}){const _=a||(typeof document>"u"?null:document),u=_?.defaultView||(typeof window>"u"?null:window),P=typeof t=="function"?t:()=>{},v=N||(typeof localStorage>"u"?null:localStorage),Q=typeof i.getBusinessProfileTypeFn=="function"?i.getBusinessProfileTypeFn:(()=>""),X=typeof i.isShopCatalogProfileFn=="function"?i.isShopCatalogProfileFn:(()=>!1),Y=typeof i.isBusinessOwnerProfileFn=="function"?i.isBusinessOwnerProfileFn:(()=>!1),W=typeof i.canAccessRestaurantOrdersFn=="function"?i.canAccessRestaurantOrdersFn:(()=>!1),I=typeof i.getRestaurantMetaByIdFn=="function"?i.getRestaurantMetaByIdFn:(()=>null),ee=typeof i.resolveRestaurantLogoFn=="function"?i.resolveRestaurantLogoFn:(()=>""),te=typeof i.resolveOwnAvatarUrlFn=="function"?i.resolveOwnAvatarUrlFn:(()=>"");let C=0,O=!1,x=null,z=null,D="",B=!1,L=()=>null;const ae=300;function E(){const n=e?.userProfile||{};return $e({businessType:Q(n),isShopCatalog:X(n)})}function ne(n=""){const r=I(n)||{};return Ce(r).map(o=>({id:o.id,name:o.title,price:o.price??"",category:o.beds||o.tag||"",type:"room",imageUrl:o.imageUrl||""}))}function re(n=""){if(!v)return null;try{const r=v.getItem(`${Z}${n}`);if(!r)return null;const o=JSON.parse(r),d=Array.isArray(o?.items)?o.items:null;return d&&d.length?d:null}catch{return null}}function se(n="",r=[]){if(v)try{v.setItem(`${Z}${n}`,JSON.stringify({savedAt:Date.now(),items:r}))}catch{}}async function oe(n=""){const{db:r,collectionFn:o,queryFn:d,limitFn:c,getDocsFn:p}=s;if(!r||typeof o!="function"||typeof p!="function")throw new Error("Produktet nuk u ngarkuan.");const f=o(r,"restaurants",n,"menuItems"),g=typeof d=="function"&&typeof c=="function"?d(f,c(ae)):f,k=await p(g),h=[];return k.forEach(w=>{const R=L(w?.id,w?.data?.()||{});R&&h.push(R)}),h.sort((w,R)=>w.name.localeCompare(R.name,"sq")),h}async function ie(n="",r){const o=String(n||"").trim();if(!o)throw new Error("Produktet nuk u ngarkuan.");if(E()==="hotel")return ne(o);const d=oe(o).then(p=>(se(o,p),p)),c=re(o);return c?(typeof r=="function"?d.then(p=>r(p)).catch(()=>{}):d.catch(()=>{}),c):d}function H(){return x?Promise.resolve(x):(z||(z=ge(()=>import("./business-composer-controller-B46-2Pi4.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(n=>(L=typeof n?.normalizeComposerProductCore=="function"?n.normalizeComposerProductCore:(()=>null),x=n.createBusinessComposerController({documentObj:_,windowObj:_?.defaultView||null,api:{getRestaurantIdFn:()=>F(),getBusinessMetaFn:()=>{const r=F();if(!r)return{name:"",logoUrl:"",city:""};const o=A(r),d=I(r)||{};return{name:o.name,logoUrl:o.logoUrl,city:String(d.city||"").trim()}},loadProductsFn:(r,o)=>ie(r,o),getBusinessKindFn:()=>E(),uploadImageFn:l.uploadImageFn,uploadVideoFn:l.uploadVideoFn,captureVideoPosterFn:l.captureVideoPosterFn,createPostFn:l.createPostFn,createStoryFn:l.createStoryFn,formatPriceFn:l.formatPriceFn,getOptimizedImageUrlFn:l.getOptimizedImageUrlFn,escapeHtmlFn:l.escapeHtmlFn,iconFn:typeof b=="function"?b:void 0,afterPublishFn:async r=>{try{await $({force:!0})}catch{}typeof l.afterPublishFn=="function"&&await l.afterPublishFn(r)}}}),x)).catch(n=>{throw z=null,console.error("[mnyra][dashboard] composer load failed",n),n})),z)}function de(){const n=u?.navigator?.connection;return!n||typeof n!="object"?!1:n.saveData===!0?!0:/(^|-)2g$/.test(String(n.effectiveType||"").trim().toLowerCase())}function le(){if(B||x||!u||de())return;B=!0;const n=()=>{if(H().catch(()=>{}),typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}};if(typeof u.requestIdleCallback=="function"){u.requestIdleCallback(n,{timeout:Ae});return}u.setTimeout?.(n,qe)}function ce(n="post"){const r=String(n||"").trim().toLowerCase(),o=r==="story"||r==="profile"?r:"post";if(typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}if(x){x.open(o);return}D=o,H().then(d=>{const c=D||o;D="",d?.open?.(c)}).catch(()=>{D=""})}function U(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function F(){const n=e?.userProfile||{};return String(n.restaurantId||n.staffRestaurantId||"").trim()}function ue(){const n=String(e?.user?.uid||"").trim();if(!n)return!1;const r=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||r===n}function K(n=""){return`${Ke}${n}`}function me(n="",r=""){if(!v||!n)return null;try{const o=v.getItem(K(n));if(!o)return null;const d=JSON.parse(o);return!d||typeof d!="object"||String(d.day||"").trim()!==String(r||"").trim()||!d.model||typeof d.model!="object"?null:d.model}catch{return null}}function pe(n="",r=null){if(!(!v||!n||!r))try{v.setItem(K(n),JSON.stringify({day:r.day,model:r}))}catch{}}async function he(n=""){const{db:r,collectionFn:o,queryFn:d,orderByFn:c,limitFn:p,getDocsFn:f}=s;if(!r||typeof o!="function"||typeof d!="function"||typeof c!="function"||typeof p!="function"||typeof f!="function")return[];const g=o(r,"restaurants",n,"socialPosts");return(await f(d(g,c("createdAt","desc"),p(Ve)))).docs.map(h=>({id:h.id,data:h.data()||{}})).filter(h=>{const w=String(h.data.status||"active").trim().toLowerCase();return w!=="deleted"&&w!=="hidden"})}async function $({force:n=!1}={}){const r=U(),o=F();if(!o)return;const d=be({rangeKey:"7d"});if(!d)return;const c=`${o}::${d.toDay}`;if(!n&&r.loadedSignature===c&&r.status==="ready")return;if(!r.model){const g=me(o,d.toDay);g&&(r.model=g,r.status="ready",P())}C+=1;const p=C;r.model||(r.status="loading",r.error="",P());try{const g={db:s.db,collectionFn:s.collectionFn,queryFn:s.queryFn,whereFn:s.whereFn,documentIdFn:s.documentIdFn,getDocsFn:s.getDocsFn,restaurantId:o},[k,h]=await Promise.allSettled([_e({...g,fromDay:d.fromDay,toDay:d.toDay}),he(o)]);if(p!==C)return;if(k.status==="rejected")throw k.reason;h.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",h.reason),r.model=Qe({days:k.value,todayKey:d.toDay,rawPosts:h.status==="fulfilled"?h.value:[]}),r.status="ready",r.error="",r.loadedSignature=c,pe(o,r.model)}catch(g){if(p!==C)return;console.error("[mnyra][dashboard] load failed",g),r.model||(r.status="error",r.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}P()}function fe(){O||!_||(O=!0,_.addEventListener("click",n=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(n.target?.closest?.("[data-dashboard-retry]")){$({force:!0});return}const r=n.target?.closest?.("[data-dashboard-composer]");r&&(n.preventDefault(),ce(r.getAttribute("data-dashboard-composer")))}catch{}}))}function A(n=""){const r=e?.userProfile||{},o=n?I(n)||{}:{},d=String(o.name||o.restaurantName||r.name||"").trim()||"Business";let c="";try{c=String(te()||"").trim()}catch{}if(!c)try{c=String(ee(o)||"").trim()}catch{}return{name:d,logoUrl:c,kind:E()}}function ye(){De(_),fe();const n=U(),r=F();let o="";if(!r)o=ue()?`${Le()}${G({kpiCount:6})}`:Ue();else{le();const d=A(r),c=Re({kind:d.kind,isOwner:Y(e?.userProfile),canAccessOrders:W(e?.userProfile)}),p=je(d.kind);n.status==="idle"&&(n.status="loading",queueMicrotask(()=>{$({force:!1})}));let f="";n.model?f=`
          ${Oe({kpiDefs:p,week:n.model.week,today:n.model.today})}
          ${Be({posts:n.model.posts,iconFn:b})}
        `:n.status==="error"?f=He({message:n.error}):f=G({kpiCount:p.length}),o=`
        ${Ie({name:d.name,logoUrl:d.logoUrl,iconFn:b})}
        ${Ee({iconFn:b})}
        ${Te({iconFn:b})}
        ${Me({actions:c,iconFn:b})}
        ${f}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${o}
      </section>
    `}return Object.freeze({renderDashboardView:ye,loadDashboard:$})}export{xe as M,tt as a,Ce as b,we as c,We as d,et as f,Se as n};
