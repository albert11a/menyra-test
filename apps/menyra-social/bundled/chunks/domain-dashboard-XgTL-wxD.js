const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-Cf-AFRjW.js","chunks/domain-feed-social-eager-CSzqAfRb.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-B3Bb4ghO.js","chunks/domain-menu-eager-BUdqOprI.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as le}from"./domain-auth-Aq-4Vdvh.js";import{f as R,r as ce,l as ue,s as O}from"./domain-analytics-jv5B-kA2.js";const me=20,pe=8;function g(e=""){return e==null?"":String(e).trim()}function T(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function he(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${n}`}function fe(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],g(t.imageUrl??t.image??t.photoUrl)],n=[];return a.forEach(s=>{const d=g(s);d&&!n.includes(d)&&n.push(d)}),n.slice(0,pe)}function ye(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},n=T(a.persons??a.guests??a.capacity),s=T(a.size??a.sizeSqm??a.area),d=fe(a);return{id:g(a.id)||he(Date.now()+t),title:g(a.title??a.name),description:g(a.description??a.text).slice(0,400),imageUrl:d[0]||"",images:d,price:T(a.price??a.pricePerNight),currency:g(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:g(a.beds??a.bedsLabel).slice(0,60),size:s==null?null:Math.min(500,Math.round(s)),tag:g(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function ge(e=[]){return(Array.isArray(e)?e:[]).slice(0,me).map((t,a)=>ye(t,{index:a}))}function be(e={}){return ge((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function Ke(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),g(e?.beds)&&t.push({icon:"bed",label:g(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Ae(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=g(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${n}`:`${n} ${a}`}const K="mnyraDashboardStyles",_e=`
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
`;function ve(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(K)))try{const t=e.createElement("style");t.id=K,t.textContent=_e,e.head?.appendChild(t)}catch{}}function c(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function S(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const xe=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function ke({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return xe.includes(a)?"hotel":"restaurant"}function we({kind:e="restaurant",isOwner:t=!1,canAccessOrders:a=!1}={}){const n=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Posto foto ose video"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"E dukshme 24h"}];return e==="hotel"?n.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?n.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):n.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),n.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),e!=="hotel"&&a&&n.push({nav:"orders",iconName:"shopping-cart",label:"Porosite",sub:"Hyrje & Status"}),n.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Te gjitha statistikat"}),t&&n.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),n.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),n}function Pe(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function A(e=0,t=""){const a=R(e);return t?`${a} ${t}`:a}function Se(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function ze({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:n}={}){const s=Se(a);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${c(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${S(n,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${c(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${c(s.text)}</p>
      </div>
    </div>
  `}function Ce({iconFn:e}={}){return`
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
  `}function De({iconFn:e}={}){return`<div class="mnyra-dash__composer-row">${[{accent:"Profil",sub:"Postim që shfaqet në profilin tënd.",action:'data-dashboard-composer="profile"',iconName:"plus",label:"Posto",primary:!0},{accent:"Meny",sub:"Produktet dhe kategoritë e menysë.",action:'data-nav="menu"',iconName:"utensils",label:"Ndrysho",primary:!1}].map(a=>`
    <div class="mnyra-dash__composer mnyra-dash__composer--split">
      <p class="mnyra-dash__composer-title">Posto n'<span class="mnyra-dash__composer-accent">${c(a.accent)}</span></p>
      <p class="mnyra-dash__composer-sub">${c(a.sub)}</p>
      <div class="mnyra-dash__composer-actions">
        <button type="button" class="mnyra-dash__composer-btn${a.primary?" mnyra-dash__composer-btn--primary":""}" ${a.action}>
          <span class="mnyra-dash__composer-btn-icon">${S(e,a.iconName,"w-4 h-4")}</span>
          <span class="mnyra-dash__composer-btn-label">${c(a.label)}</span>
        </button>
      </div>
    </div>
  `).join("")}</div>`}function Fe({actions:e=[],iconFn:t}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(n=>{const s=n.uploadIntent?` data-upload-intent="${c(n.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${c(n.nav)}"${s}>
        <span class="mnyra-dash__action-icon">${S(t,n.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${c(n.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${c(n.sub||"")}</span>
        </span>
      </button>
    `}).join("")}</div>
    </div>
  `}function je({kpiDefs:e=[],week:t={},today:a={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(s=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${c(s.label)}</p>
      <p class="mnyra-dash__kpi-value">${c(A(t?.[s.key]||0,s.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${c(A(a?.[s.key]||0,s.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function $e({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let n="";return a.length?(n=a.map(s=>{const d=[s.dateLabel,`${R(s.likesCount||0)} Likes`,`${R(s.commentsCount||0)} Kommentare`];return Number(s.impressions||0)>0&&d.push(`${R(s.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${s.thumbUrl?`<img src="${c(s.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:S(t,s.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${c(s.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${c(d.filter(Boolean).join(" · "))}</p>
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
  `}function V({kpiCount:e=6}={}){return`
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
  `}function Ne(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Re({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${c(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Ie(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Be="menyra_social_dashboard_cache_v1::",Te=6,Ee=3;function E(e){const t=Number(e);return Number.isFinite(t)?t:0}function Me(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const n=a.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function Le(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",s=String(a.thumbUrl||(n==="image"?a.url:"")||t.thumbUrl||"").trim(),d=Me(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:s,likesCount:E(t.likesCount),commentsCount:E(t.commentsCount),impressions:0,dateLabel:d?d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:d?d.getTime():0}}function Ue({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const n=Array.isArray(e)?e:[],s=O(n),d=n.find(u=>String(u?.date||u?.id||"").trim()===String(t||"").trim()),b=O(d?[d]:[]),I=s.merged?.posts&&typeof s.merged.posts=="object"?s.merged.posts:{},_=(Array.isArray(a)?a:[]).map(u=>Le(u?.id,u?.data||{})).filter(u=>u.id).sort((u,v)=>v.createdAtMs-u.createdAtMs).slice(0,Ee).map(u=>({...u,impressions:E(I[u.id]?.impressions)}));return{day:String(t||"").trim(),week:s.summary,today:b.summary,posts:_}}function Ve({state:e,renderFn:t,documentObj:a,firestoreApi:n={},profileApi:s={},composerApi:d={},iconFn:b,storageObj:I}={}){const _=a||(typeof document>"u"?null:document),u=typeof t=="function"?t:()=>{},v=I||(typeof localStorage>"u"?null:localStorage),q=typeof s.getBusinessProfileTypeFn=="function"?s.getBusinessProfileTypeFn:(()=>""),J=typeof s.isShopCatalogProfileFn=="function"?s.isShopCatalogProfileFn:(()=>!1),G=typeof s.isBusinessOwnerProfileFn=="function"?s.isBusinessOwnerProfileFn:(()=>!1),Z=typeof s.canAccessRestaurantOrdersFn=="function"?s.canAccessRestaurantOrdersFn:(()=>!1),B=typeof s.getRestaurantMetaByIdFn=="function"?s.getRestaurantMetaByIdFn:(()=>null),Q=typeof s.resolveRestaurantLogoFn=="function"?s.resolveRestaurantLogoFn:(()=>""),W=typeof s.resolveOwnAvatarUrlFn=="function"?s.resolveOwnAvatarUrlFn:(()=>"");let z=0,M=!1,x=null,C=null,D="",L=()=>null;const X=300;function Y(o=""){const r=B(o)||{};return be(r).map(i=>({id:i.id,name:i.title,price:i.price??"",category:i.beds||i.tag||"",type:"room",imageUrl:i.imageUrl||""}))}async function ee(o=""){const{db:r,collectionFn:i,queryFn:l,limitFn:p,getDocsFn:m}=n,h=String(o||"").trim();if(h&&j(h).kind==="hotel")return Y(h);if(!h||!r||typeof i!="function"||typeof m!="function")throw new Error("Produktet nuk u ngarkuan.");const f=i(r,"restaurants",h,"menuItems"),k=typeof l=="function"&&typeof p=="function"?l(f,p(X)):f,y=await m(k),w=[];return y.forEach($=>{const N=L($?.id,$?.data?.()||{});N&&w.push(N)}),w.sort(($,N)=>$.name.localeCompare(N.name,"sq")),w}function te(){return x?Promise.resolve(x):(C||(C=le(()=>import("./business-composer-controller-Cf-AFRjW.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(o=>(L=typeof o?.normalizeComposerProductCore=="function"?o.normalizeComposerProductCore:(()=>null),x=o.createBusinessComposerController({documentObj:_,windowObj:_?.defaultView||null,api:{getRestaurantIdFn:()=>P(),getBusinessMetaFn:()=>{const r=P();if(!r)return{name:"",logoUrl:"",city:""};const i=j(r),l=B(r)||{};return{name:i.name,logoUrl:i.logoUrl,city:String(l.city||"").trim()}},loadProductsFn:r=>ee(r),getBusinessKindFn:()=>j(P()).kind,uploadImageFn:d.uploadImageFn,uploadVideoFn:d.uploadVideoFn,captureVideoPosterFn:d.captureVideoPosterFn,createPostFn:d.createPostFn,createStoryFn:d.createStoryFn,formatPriceFn:d.formatPriceFn,getOptimizedImageUrlFn:d.getOptimizedImageUrlFn,escapeHtmlFn:d.escapeHtmlFn,iconFn:typeof b=="function"?b:void 0,afterPublishFn:async r=>{try{await F({force:!0})}catch{}typeof d.afterPublishFn=="function"&&await d.afterPublishFn(r)}}}),x)).catch(o=>{throw C=null,console.error("[mnyra][dashboard] composer load failed",o),o})),C)}function ae(o="post"){const r=String(o||"").trim().toLowerCase(),i=r==="story"||r==="profile"?r:"post";if(typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}if(x){x.open(i);return}D=i,te().then(l=>{const p=D||i;D="",l?.open?.(p)}).catch(()=>{D=""})}function U(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function P(){const o=e?.userProfile||{};return String(o.restaurantId||o.staffRestaurantId||"").trim()}function ne(){const o=String(e?.user?.uid||"").trim();if(!o)return!1;const r=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||r===o}function H(o=""){return`${Be}${o}`}function re(o="",r=""){if(!v||!o)return null;try{const i=v.getItem(H(o));if(!i)return null;const l=JSON.parse(i);return!l||typeof l!="object"||String(l.day||"").trim()!==String(r||"").trim()||!l.model||typeof l.model!="object"?null:l.model}catch{return null}}function se(o="",r=null){if(!(!v||!o||!r))try{v.setItem(H(o),JSON.stringify({day:r.day,model:r}))}catch{}}async function oe(o=""){const{db:r,collectionFn:i,queryFn:l,orderByFn:p,limitFn:m,getDocsFn:h}=n;if(!r||typeof i!="function"||typeof l!="function"||typeof p!="function"||typeof m!="function"||typeof h!="function")return[];const f=i(r,"restaurants",o,"socialPosts");return(await h(l(f,p("createdAt","desc"),m(Te)))).docs.map(y=>({id:y.id,data:y.data()||{}})).filter(y=>{const w=String(y.data.status||"active").trim().toLowerCase();return w!=="deleted"&&w!=="hidden"})}async function F({force:o=!1}={}){const r=U(),i=P();if(!i)return;const l=ce({rangeKey:"7d"});if(!l)return;const p=`${i}::${l.toDay}`;if(!o&&r.loadedSignature===p&&r.status==="ready")return;if(!r.model){const f=re(i,l.toDay);f&&(r.model=f,r.status="ready",u())}z+=1;const m=z;r.model||(r.status="loading",r.error="",u());try{const f={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:i},[k,y]=await Promise.allSettled([ue({...f,fromDay:l.fromDay,toDay:l.toDay}),oe(i)]);if(m!==z)return;if(k.status==="rejected")throw k.reason;y.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",y.reason),r.model=Ue({days:k.value,todayKey:l.toDay,rawPosts:y.status==="fulfilled"?y.value:[]}),r.status="ready",r.error="",r.loadedSignature=p,se(i,r.model)}catch(f){if(m!==z)return;console.error("[mnyra][dashboard] load failed",f),r.model||(r.status="error",r.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}u()}function ie(){M||!_||(M=!0,_.addEventListener("click",o=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(o.target?.closest?.("[data-dashboard-retry]")){F({force:!0});return}const r=o.target?.closest?.("[data-dashboard-composer]");r&&(o.preventDefault(),ae(r.getAttribute("data-dashboard-composer")))}catch{}}))}function j(o=""){const r=e?.userProfile||{},i=o?B(o)||{}:{},l=q(r),p=String(i.name||i.restaurantName||r.name||"").trim()||"Business";let m="";try{m=String(W()||"").trim()}catch{}if(!m)try{m=String(Q(i)||"").trim()}catch{}return{name:p,logoUrl:m,kind:ke({businessType:l,isShopCatalog:J(r)})}}function de(){ve(_),ie();const o=U(),r=P();let i="";if(!r)i=ne()?`${Ne()}${V({kpiCount:6})}`:Ie();else{const l=j(r),p=we({kind:l.kind,isOwner:G(e?.userProfile),canAccessOrders:Z(e?.userProfile)}),m=Pe(l.kind);o.status==="idle"&&(o.status="loading",queueMicrotask(()=>{F({force:!1})}));let h="";o.model?h=`
          ${je({kpiDefs:m,week:o.model.week,today:o.model.today})}
          ${$e({posts:o.model.posts,iconFn:b})}
        `:o.status==="error"?h=Re({message:o.error}):h=V({kpiCount:m.length}),i=`
        ${ze({name:l.name,logoUrl:l.logoUrl,iconFn:b})}
        ${Ce({iconFn:b})}
        ${De({iconFn:b})}
        ${Fe({actions:p,iconFn:b})}
        ${h}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${i}
      </section>
    `}return Object.freeze({renderDashboardView:de,loadDashboard:F})}export{pe as M,Ve as a,be as b,he as c,Ke as d,Ae as f,ge as n};
