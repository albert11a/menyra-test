const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-Cs_PYHBX.js","chunks/domain-feed-social-eager-i3xl7Vsa.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-B3Bb4ghO.js","chunks/domain-menu-eager-BHM_SyPj.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as pe}from"./domain-auth-Aq-4Vdvh.js";import{f as j,r as he,l as fe,s as H}from"./domain-analytics-jv5B-kA2.js";const ye=20,ge=8;function y(e=""){return e==null?"":String(e).trim()}function E(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function be(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),r=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${r}`}function _e(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],y(t.imageUrl??t.image??t.photoUrl)],r=[];return a.forEach(i=>{const l=y(i);l&&!r.includes(l)&&r.push(l)}),r.slice(0,ge)}function ve(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},r=E(a.persons??a.guests??a.capacity),i=E(a.size??a.sizeSqm??a.area),l=_e(a);return{id:y(a.id)||be(Date.now()+t),title:y(a.title??a.name),description:y(a.description??a.text).slice(0,400),imageUrl:l[0]||"",images:l,price:E(a.price??a.pricePerNight),currency:y(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:r==null?null:Math.min(20,Math.round(r)),beds:y(a.beds??a.bedsLabel).slice(0,60),size:i==null?null:Math.min(500,Math.round(i)),tag:y(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function xe(e=[]){return(Array.isArray(e)?e:[]).slice(0,ye).map((t,a)=>ve(t,{index:a}))}function ke(e={}){return xe((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function Je(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),y(e?.beds)&&t.push({icon:"bed",label:y(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Ge(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=y(e?.currency).toUpperCase()||"EUR",r=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${r}`:`${r} ${a}`}const K="mnyraDashboardStyles",we=`
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
`;function Pe(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(K)))try{const t=e.createElement("style");t.id=K,t.textContent=we,e.head?.appendChild(t)}catch{}}function u(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function P(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const Se=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Ce({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return Se.includes(a)?"hotel":"restaurant"}function ze({kind:e="restaurant",isOwner:t=!1,canAccessOrders:a=!1}={}){const r=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Posto foto ose video"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"E dukshme 24h"}];return e==="hotel"?r.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?r.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):r.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),r.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),e!=="hotel"&&a&&r.push({nav:"orders",iconName:"shopping-cart",label:"Porosite",sub:"Hyrje & Status"}),r.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Te gjitha statistikat"}),t&&r.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),r.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),r}function De(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function A(e=0,t=""){const a=j(e);return t?`${a} ${t}`:a}function Fe(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function $e({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:r}={}){const i=Fe(a);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${u(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${P(r,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${u(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${u(i.text)}</p>
      </div>
    </div>
  `}function je({iconFn:e}={}){return`
    <div class="mnyra-dash__composer" data-dashboard-composer-card>
      <p class="mnyra-dash__composer-title">Posto n'<span class="mnyra-dash__composer-accent">Zbulo</span></p>
      <p class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</p>
      <div class="mnyra-dash__composer-actions mnyra-dash__composer-actions--single">
        <button type="button" class="mnyra-dash__composer-btn mnyra-dash__composer-btn--primary" data-dashboard-composer="post">
          <span class="mnyra-dash__composer-btn-icon">${P(e,"plus","w-4 h-4")}</span>
          <span class="mnyra-dash__composer-btn-label">Posto</span>
        </button>
      </div>
    </div>
  `}function Re({iconFn:e}={}){return`<div class="mnyra-dash__composer-row">${[{accent:"Profil",sub:"Postim që shfaqet në profilin tënd.",action:'data-dashboard-composer="profile"',iconName:"plus",label:"Posto",primary:!0},{accent:"Meny",sub:"Produktet dhe kategoritë e menysë.",action:'data-nav="menu"',iconName:"utensils",label:"Ndrysho",primary:!1}].map(a=>`
    <div class="mnyra-dash__composer mnyra-dash__composer--split">
      <p class="mnyra-dash__composer-title">Posto n'<span class="mnyra-dash__composer-accent">${u(a.accent)}</span></p>
      <p class="mnyra-dash__composer-sub">${u(a.sub)}</p>
      <div class="mnyra-dash__composer-actions">
        <button type="button" class="mnyra-dash__composer-btn${a.primary?" mnyra-dash__composer-btn--primary":""}" ${a.action}>
          <span class="mnyra-dash__composer-btn-icon">${P(e,a.iconName,"w-4 h-4")}</span>
          <span class="mnyra-dash__composer-btn-label">${u(a.label)}</span>
        </button>
      </div>
    </div>
  `).join("")}</div>`}function Ne({actions:e=[],iconFn:t}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(r=>{const i=r.uploadIntent?` data-upload-intent="${u(r.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${u(r.nav)}"${i}>
        <span class="mnyra-dash__action-icon">${P(t,r.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${u(r.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${u(r.sub||"")}</span>
        </span>
      </button>
    `}).join("")}</div>
    </div>
  `}function Ie({kpiDefs:e=[],week:t={},today:a={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(i=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${u(i.label)}</p>
      <p class="mnyra-dash__kpi-value">${u(A(t?.[i.key]||0,i.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${u(A(a?.[i.key]||0,i.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function Ee({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let r="";return a.length?(r=a.map(i=>{const l=[i.dateLabel,`${j(i.likesCount||0)} Likes`,`${j(i.commentsCount||0)} Kommentare`];return Number(i.impressions||0)>0&&l.push(`${j(i.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${i.thumbUrl?`<img src="${u(i.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:P(t,i.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${u(i.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${u(l.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `}).join(""),r=`<div class="mnyra-dash__posts">${r}</div>`):r=`
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
      ${r}
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
  `}function Be(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Te({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${u(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Me(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Oe="menyra_social_dashboard_cache_v1::",q="menyra_social_composer_products_v1::",Le=6,Ue=3;function B(e){const t=Number(e);return Number.isFinite(t)?t:0}function He(e={}){const t=String(e.createdAtClient||"").trim();if(t){const r=new Date(t);if(!Number.isNaN(r.getTime()))return r}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const r=a.toDate();if(r instanceof Date&&!Number.isNaN(r.getTime()))return r}catch{}return null}function Ke(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},r=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",i=String(a.thumbUrl||(r==="image"?a.url:"")||t.thumbUrl||"").trim(),l=He(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:r,thumbUrl:i,likesCount:B(t.likesCount),commentsCount:B(t.commentsCount),impressions:0,dateLabel:l?l.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:l?l.getTime():0}}function Ae({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const r=Array.isArray(e)?e:[],i=H(r),l=r.find(m=>String(m?.date||m?.id||"").trim()===String(t||"").trim()),_=H(l?[l]:[]),R=i.merged?.posts&&typeof i.merged.posts=="object"?i.merged.posts:{},v=(Array.isArray(a)?a:[]).map(m=>Ke(m?.id,m?.data||{})).filter(m=>m.id).sort((m,g)=>g.createdAtMs-m.createdAtMs).slice(0,Ue).map(m=>({...m,impressions:B(R[m.id]?.impressions)}));return{day:String(t||"").trim(),week:i.summary,today:_.summary,posts:v}}function Ze({state:e,renderFn:t,documentObj:a,firestoreApi:r={},profileApi:i={},composerApi:l={},iconFn:_,storageObj:R}={}){const v=a||(typeof document>"u"?null:document),m=typeof t=="function"?t:()=>{},g=R||(typeof localStorage>"u"?null:localStorage),J=typeof i.getBusinessProfileTypeFn=="function"?i.getBusinessProfileTypeFn:(()=>""),G=typeof i.isShopCatalogProfileFn=="function"?i.isShopCatalogProfileFn:(()=>!1),Z=typeof i.isBusinessOwnerProfileFn=="function"?i.isBusinessOwnerProfileFn:(()=>!1),Q=typeof i.canAccessRestaurantOrdersFn=="function"?i.canAccessRestaurantOrdersFn:(()=>!1),N=typeof i.getRestaurantMetaByIdFn=="function"?i.getRestaurantMetaByIdFn:(()=>null),X=typeof i.resolveRestaurantLogoFn=="function"?i.resolveRestaurantLogoFn:(()=>""),W=typeof i.resolveOwnAvatarUrlFn=="function"?i.resolveOwnAvatarUrlFn:(()=>"");let S=0,T=!1,k=null,C=null,z="",M=()=>null;const Y=300;function I(){const s=e?.userProfile||{};return Ce({businessType:J(s),isShopCatalog:G(s)})}function ee(s=""){const n=N(s)||{};return ke(n).map(o=>({id:o.id,name:o.title,price:o.price??"",category:o.beds||o.tag||"",type:"room",imageUrl:o.imageUrl||""}))}function te(s=""){if(!g)return null;try{const n=g.getItem(`${q}${s}`);if(!n)return null;const o=JSON.parse(n),d=Array.isArray(o?.items)?o.items:null;return d&&d.length?d:null}catch{return null}}function ae(s="",n=[]){if(g)try{g.setItem(`${q}${s}`,JSON.stringify({savedAt:Date.now(),items:n}))}catch{}}async function ne(s=""){const{db:n,collectionFn:o,queryFn:d,limitFn:c,getDocsFn:p}=r;if(!n||typeof o!="function"||typeof p!="function")throw new Error("Produktet nuk u ngarkuan.");const f=o(n,"restaurants",s,"menuItems"),b=typeof d=="function"&&typeof c=="function"?d(f,c(Y)):f,w=await p(b),h=[];return w.forEach(x=>{const $=M(x?.id,x?.data?.()||{});$&&h.push($)}),h.sort((x,$)=>x.name.localeCompare($.name,"sq")),h}async function re(s="",n){const o=String(s||"").trim();if(!o)throw new Error("Produktet nuk u ngarkuan.");if(I()==="hotel")return ee(o);const d=ne(o).then(p=>(ae(o,p),p)),c=te(o);return c?(typeof n=="function"?d.then(p=>n(p)).catch(()=>{}):d.catch(()=>{}),c):d}function se(){return k?Promise.resolve(k):(C||(C=pe(()=>import("./business-composer-controller-Cs_PYHBX.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(s=>(M=typeof s?.normalizeComposerProductCore=="function"?s.normalizeComposerProductCore:(()=>null),k=s.createBusinessComposerController({documentObj:v,windowObj:v?.defaultView||null,api:{getRestaurantIdFn:()=>D(),getBusinessMetaFn:()=>{const n=D();if(!n)return{name:"",logoUrl:"",city:""};const o=U(n),d=N(n)||{};return{name:o.name,logoUrl:o.logoUrl,city:String(d.city||"").trim()}},loadProductsFn:(n,o)=>re(n,o),getBusinessKindFn:()=>I(),uploadImageFn:l.uploadImageFn,uploadVideoFn:l.uploadVideoFn,captureVideoPosterFn:l.captureVideoPosterFn,createPostFn:l.createPostFn,createStoryFn:l.createStoryFn,formatPriceFn:l.formatPriceFn,getOptimizedImageUrlFn:l.getOptimizedImageUrlFn,escapeHtmlFn:l.escapeHtmlFn,iconFn:typeof _=="function"?_:void 0,afterPublishFn:async n=>{try{await F({force:!0})}catch{}typeof l.afterPublishFn=="function"&&await l.afterPublishFn(n)}}}),k)).catch(s=>{throw C=null,console.error("[mnyra][dashboard] composer load failed",s),s})),C)}function oe(s="post"){const n=String(s||"").trim().toLowerCase(),o=n==="story"||n==="profile"?n:"post";if(typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}if(k){k.open(o);return}z=o,se().then(d=>{const c=z||o;z="",d?.open?.(c)}).catch(()=>{z=""})}function O(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function D(){const s=e?.userProfile||{};return String(s.restaurantId||s.staffRestaurantId||"").trim()}function ie(){const s=String(e?.user?.uid||"").trim();if(!s)return!1;const n=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||n===s}function L(s=""){return`${Oe}${s}`}function de(s="",n=""){if(!g||!s)return null;try{const o=g.getItem(L(s));if(!o)return null;const d=JSON.parse(o);return!d||typeof d!="object"||String(d.day||"").trim()!==String(n||"").trim()||!d.model||typeof d.model!="object"?null:d.model}catch{return null}}function le(s="",n=null){if(!(!g||!s||!n))try{g.setItem(L(s),JSON.stringify({day:n.day,model:n}))}catch{}}async function ce(s=""){const{db:n,collectionFn:o,queryFn:d,orderByFn:c,limitFn:p,getDocsFn:f}=r;if(!n||typeof o!="function"||typeof d!="function"||typeof c!="function"||typeof p!="function"||typeof f!="function")return[];const b=o(n,"restaurants",s,"socialPosts");return(await f(d(b,c("createdAt","desc"),p(Le)))).docs.map(h=>({id:h.id,data:h.data()||{}})).filter(h=>{const x=String(h.data.status||"active").trim().toLowerCase();return x!=="deleted"&&x!=="hidden"})}async function F({force:s=!1}={}){const n=O(),o=D();if(!o)return;const d=he({rangeKey:"7d"});if(!d)return;const c=`${o}::${d.toDay}`;if(!s&&n.loadedSignature===c&&n.status==="ready")return;if(!n.model){const b=de(o,d.toDay);b&&(n.model=b,n.status="ready",m())}S+=1;const p=S;n.model||(n.status="loading",n.error="",m());try{const b={db:r.db,collectionFn:r.collectionFn,queryFn:r.queryFn,whereFn:r.whereFn,documentIdFn:r.documentIdFn,getDocsFn:r.getDocsFn,restaurantId:o},[w,h]=await Promise.allSettled([fe({...b,fromDay:d.fromDay,toDay:d.toDay}),ce(o)]);if(p!==S)return;if(w.status==="rejected")throw w.reason;h.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",h.reason),n.model=Ae({days:w.value,todayKey:d.toDay,rawPosts:h.status==="fulfilled"?h.value:[]}),n.status="ready",n.error="",n.loadedSignature=c,le(o,n.model)}catch(b){if(p!==S)return;console.error("[mnyra][dashboard] load failed",b),n.model||(n.status="error",n.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}m()}function ue(){T||!v||(T=!0,v.addEventListener("click",s=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(s.target?.closest?.("[data-dashboard-retry]")){F({force:!0});return}const n=s.target?.closest?.("[data-dashboard-composer]");n&&(s.preventDefault(),oe(n.getAttribute("data-dashboard-composer")))}catch{}}))}function U(s=""){const n=e?.userProfile||{},o=s?N(s)||{}:{},d=String(o.name||o.restaurantName||n.name||"").trim()||"Business";let c="";try{c=String(W()||"").trim()}catch{}if(!c)try{c=String(X(o)||"").trim()}catch{}return{name:d,logoUrl:c,kind:I()}}function me(){Pe(v),ue();const s=O(),n=D();let o="";if(!n)o=ie()?`${Be()}${V({kpiCount:6})}`:Me();else{const d=U(n),c=ze({kind:d.kind,isOwner:Z(e?.userProfile),canAccessOrders:Q(e?.userProfile)}),p=De(d.kind);s.status==="idle"&&(s.status="loading",queueMicrotask(()=>{F({force:!1})}));let f="";s.model?f=`
          ${Ie({kpiDefs:p,week:s.model.week,today:s.model.today})}
          ${Ee({posts:s.model.posts,iconFn:_})}
        `:s.status==="error"?f=Te({message:s.error}):f=V({kpiCount:p.length}),o=`
        ${$e({name:d.name,logoUrl:d.logoUrl,iconFn:_})}
        ${je({iconFn:_})}
        ${Re({iconFn:_})}
        ${Ne({actions:c,iconFn:_})}
        ${f}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${o}
      </section>
    `}return Object.freeze({renderDashboardView:me,loadDashboard:F})}export{ge as M,Ze as a,ke as b,be as c,Je as d,Ge as f,xe as n};
