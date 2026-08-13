const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-CNZAjHMd.js","chunks/domain-feed-social-eager-DjewvVNC.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-BtuxJYMK.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as ge}from"./domain-auth-Aq-4Vdvh.js";import{f as $,r as be,l as _e,s as V}from"./domain-analytics-jv5B-kA2.js";const ve=20,xe=8;function y(e=""){return e==null?"":String(e).trim()}function T(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function ke(e=Date.now(),t=Math.random()){const n=Math.max(0,Number(e)||0).toString(36),s=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${n}_${s}`}function we(e={}){const t=e&&typeof e=="object"?e:{},n=[...Array.isArray(t.images)?t.images:[],y(t.imageUrl??t.image??t.photoUrl)],s=[];return n.forEach(i=>{const l=y(i);l&&!s.includes(l)&&s.push(l)}),s.slice(0,xe)}function Pe(e={},{index:t=0}={}){const n=e&&typeof e=="object"?e:{},s=T(n.persons??n.guests??n.capacity),i=T(n.size??n.sizeSqm??n.area),l=we(n);return{id:y(n.id)||ke(Date.now()+t),title:y(n.title??n.name),description:y(n.description??n.text).slice(0,400),imageUrl:l[0]||"",images:l,price:T(n.price??n.pricePerNight),currency:y(n.currency??n.currencyCode).toUpperCase()||"EUR",persons:s==null?null:Math.min(20,Math.round(s)),beds:y(n.beds??n.bedsLabel).slice(0,60),size:i==null?null:Math.min(500,Math.round(i)),tag:y(n.tag??n.badge).slice(0,40),active:n.active!==!1}}function Se(e=[]){return(Array.isArray(e)?e:[]).slice(0,ve).map((t,n)=>Pe(t,{index:n}))}function Ce(e={}){return Se((e&&typeof e=="object"?e:{}).hotelRooms).filter(n=>n.title)}function We(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),y(e?.beds)&&t.push({icon:"bed",label:y(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Ze(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const n=y(e?.currency).toUpperCase()||"EUR",s=Number.isInteger(t)?String(t):t.toFixed(2);return n==="EUR"?`€${s}`:`${s} ${n}`}const q="mnyraDashboardStyles",ze=`
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
/* Die ganze Karte ist der Knopf. Sie sieht aus wie vorher - nur nimmt jetzt
   jede Stelle den Tipp an, nicht nur ein Streifen darin. */
.mnyra-dash__composer--tap {
  display: block;
  width: 100%;
  text-align: left;
  font: inherit;
  color: var(--dash-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.mnyra-dash__composer--tap:active { transform: scale(0.99); }
/* Schrift der Ueberschrift bleibt unveraendert. Als Kind eines <button> steht
   sie in einem <span> - der braucht die Blockform ausdruecklich. */
.mnyra-dash__composer-title {
  display: block;
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
  display: block;
  margin: 5px 0 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--dash-muted);
}
/* Die Aktionszeile der grossen Karte: eine Haarlinie trennt sie vom Text,
   darunter das Plus im Kreis, die Beschriftung und rechtsbuendig der Pfeil.
   Kein zweiter Knopf - die Karte selbst nimmt den Tipp an. */
.mnyra-dash__composer-cta {
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid var(--dash-hairline);
  display: flex;
  align-items: center;
  gap: 10px;
}
.mnyra-dash__composer-cta-icon {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--dash-border);
  background: var(--dash-surface);
  color: var(--dash-accent);
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
  color: var(--dash-accent);
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
  color: var(--dash-muted);
}
.mnyra-dash__composer-cta-chevron svg,
.mnyra-dash__composer-cta-chevron i {
  width: 16px;
  height: 16px;
  display: block;
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
`;function De(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(q)))try{const t=e.createElement("style");t.id=q,t.textContent=ze,e.head?.appendChild(t)}catch{}}function h(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function S(e,t,n=""){if(typeof e!="function")return"";try{return e(t,n)||""}catch{return""}}const Fe=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Re({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const n=String(e||"").trim().toLowerCase();return Fe.includes(n)?"hotel":"restaurant"}function je({kind:e="restaurant",isOwner:t=!1,canAccessOrders:n=!1}={}){const s=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Posto foto ose video"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"E dukshme 24h"}];return e==="hotel"?s.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?s.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):s.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),s.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),e!=="hotel"&&n&&s.push({nav:"orders",iconName:"shopping-cart",label:"Porosite",sub:"Hyrje & Status"}),s.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Te gjitha statistikat"}),t&&s.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),s.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),s}function $e(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function J(e=0,t=""){const n=$(e);return t?`${n} ${t}`:n}function Ie(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function Ne({name:e="",logoUrl:t="",hour:n=new Date().getHours(),iconFn:s}={}){const i=Ie(n);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${h(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${S(s,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${h(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${h(i.text)}</p>
      </div>
    </div>
  `}function Ee({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${S(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${S(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Te({actions:e=[],iconFn:t}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(s=>{const i=s.uploadIntent?` data-upload-intent="${h(s.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${h(s.nav)}"${i}>
        <span class="mnyra-dash__action-icon">${S(t,s.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${h(s.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${h(s.sub||"")}</span>
        </span>
      </button>
    `}).join("")}</div>
    </div>
  `}function Me({kpiDefs:e=[],week:t={},today:n={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(i=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${h(i.label)}</p>
      <p class="mnyra-dash__kpi-value">${h(J(t?.[i.key]||0,i.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${h(J(n?.[i.key]||0,i.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function Be({posts:e=[],iconFn:t}={}){const n=Array.isArray(e)?e:[];let s="";return n.length?(s=n.map(i=>{const l=[i.dateLabel,`${$(i.likesCount||0)} Likes`,`${$(i.commentsCount||0)} Kommentare`];return Number(i.impressions||0)>0&&l.push(`${$(i.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${i.thumbUrl?`<img src="${h(i.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:S(t,i.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${h(i.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${h(l.filter(Boolean).join(" · "))}</p>
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
  `}function Oe(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function He({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${h(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Le(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Ue="menyra_social_dashboard_cache_v1::",Q="menyra_social_composer_products_v1::",Ke=2500,Ae=1200,Ve=6,qe=3;function M(e){const t=Number(e);return Number.isFinite(t)?t:0}function Je(e={}){const t=String(e.createdAtClient||"").trim();if(t){const s=new Date(t);if(!Number.isNaN(s.getTime()))return s}const n=e.createdAt;if(n&&typeof n.toDate=="function")try{const s=n.toDate();if(s instanceof Date&&!Number.isNaN(s.getTime()))return s}catch{}return null}function Ge(e="",t={}){const n=Array.isArray(t.media)&&t.media.length?t.media[0]:{},s=String(n.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",i=String(n.thumbUrl||(s==="image"?n.url:"")||t.thumbUrl||"").trim(),l=Je(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:s,thumbUrl:i,likesCount:M(t.likesCount),commentsCount:M(t.commentsCount),impressions:0,dateLabel:l?l.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:l?l.getTime():0}}function Qe({days:e=[],todayKey:t="",rawPosts:n=[]}={}){const s=Array.isArray(e)?e:[],i=V(s),l=s.find(u=>String(u?.date||u?.id||"").trim()===String(t||"").trim()),b=V(l?[l]:[]),I=i.merged?.posts&&typeof i.merged.posts=="object"?i.merged.posts:{},_=(Array.isArray(n)?n:[]).map(u=>Ge(u?.id,u?.data||{})).filter(u=>u.id).sort((u,P)=>P.createdAtMs-u.createdAtMs).slice(0,qe).map(u=>({...u,impressions:M(I[u.id]?.impressions)}));return{day:String(t||"").trim(),week:i.summary,today:b.summary,posts:_}}function et({state:e,renderFn:t,documentObj:n,firestoreApi:s={},profileApi:i={},composerApi:l={},iconFn:b,storageObj:I}={}){const _=n||(typeof document>"u"?null:document),u=_?.defaultView||(typeof window>"u"?null:window),P=typeof t=="function"?t:()=>{},v=I||(typeof localStorage>"u"?null:localStorage),X=typeof i.getBusinessProfileTypeFn=="function"?i.getBusinessProfileTypeFn:(()=>""),Y=typeof i.isShopCatalogProfileFn=="function"?i.isShopCatalogProfileFn:(()=>!1),W=typeof i.isBusinessOwnerProfileFn=="function"?i.isBusinessOwnerProfileFn:(()=>!1),Z=typeof i.canAccessRestaurantOrdersFn=="function"?i.canAccessRestaurantOrdersFn:(()=>!1),N=typeof i.getRestaurantMetaByIdFn=="function"?i.getRestaurantMetaByIdFn:(()=>null),ee=typeof i.resolveRestaurantLogoFn=="function"?i.resolveRestaurantLogoFn:(()=>""),te=typeof i.resolveOwnAvatarUrlFn=="function"?i.resolveOwnAvatarUrlFn:(()=>"");let C=0,B=!1,x=null,z=null,D="",O=!1,H=()=>null;const ae=300;function E(){const a=e?.userProfile||{};return Re({businessType:X(a),isShopCatalog:Y(a)})}function ne(a=""){const r=N(a)||{};return Ce(r).map(o=>({id:o.id,name:o.title,price:o.price??"",category:o.beds||o.tag||"",type:"room",imageUrl:o.imageUrl||""}))}function re(a=""){if(!v)return null;try{const r=v.getItem(`${Q}${a}`);if(!r)return null;const o=JSON.parse(r),d=Array.isArray(o?.items)?o.items:null;return d&&d.length?d:null}catch{return null}}function se(a="",r=[]){if(v)try{v.setItem(`${Q}${a}`,JSON.stringify({savedAt:Date.now(),items:r}))}catch{}}async function oe(a=""){const{db:r,collectionFn:o,queryFn:d,limitFn:c,getDocsFn:m}=s;if(!r||typeof o!="function"||typeof m!="function")throw new Error("Produktet nuk u ngarkuan.");const f=o(r,"restaurants",a,"menuItems"),g=typeof d=="function"&&typeof c=="function"?d(f,c(ae)):f,w=await m(g),p=[];return w.forEach(k=>{const j=H(k?.id,k?.data?.()||{});j&&p.push(j)}),p.sort((k,j)=>k.name.localeCompare(j.name,"sq")),p}async function ie(a="",r){const o=String(a||"").trim();if(!o)throw new Error("Produktet nuk u ngarkuan.");if(E()==="hotel")return ne(o);const d=oe(o).then(m=>(se(o,m),m)),c=re(o);return c?(typeof r=="function"?d.then(m=>r(m)).catch(()=>{}):d.catch(()=>{}),c):d}function L(){return x?Promise.resolve(x):(z||(z=ge(()=>import("./business-composer-controller-CNZAjHMd.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(a=>(H=typeof a?.normalizeComposerProductCore=="function"?a.normalizeComposerProductCore:(()=>null),x=a.createBusinessComposerController({documentObj:_,windowObj:_?.defaultView||null,api:{getRestaurantIdFn:()=>F(),getBusinessMetaFn:()=>{const r=F();if(!r)return{name:"",logoUrl:"",city:""};const o=A(r),d=N(r)||{};return{name:o.name,logoUrl:o.logoUrl,city:String(d.city||"").trim()}},loadProductsFn:(r,o)=>ie(r,o),getBusinessKindFn:()=>E(),uploadImageFn:l.uploadImageFn,uploadVideoFn:l.uploadVideoFn,captureVideoPosterFn:l.captureVideoPosterFn,createPostFn:l.createPostFn,createStoryFn:l.createStoryFn,formatPriceFn:l.formatPriceFn,getOptimizedImageUrlFn:l.getOptimizedImageUrlFn,escapeHtmlFn:l.escapeHtmlFn,iconFn:typeof b=="function"?b:void 0,afterPublishFn:async r=>{try{await R({force:!0})}catch{}typeof l.afterPublishFn=="function"&&await l.afterPublishFn(r)}}}),x)).catch(a=>{throw z=null,console.error("[mnyra][dashboard] composer load failed",a),a})),z)}function de(){const a=u?.navigator?.connection;return!a||typeof a!="object"?!1:a.saveData===!0?!0:/(^|-)2g$/.test(String(a.effectiveType||"").trim().toLowerCase())}function le(){if(O||x||!u||de())return;O=!0;const a=()=>{if(L().catch(()=>{}),typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}};if(typeof u.requestIdleCallback=="function"){u.requestIdleCallback(a,{timeout:Ke});return}u.setTimeout?.(a,Ae)}function ce(a="post"){const r=String(a||"").trim().toLowerCase(),o=r==="story"||r==="profile"?r:"post";if(typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}if(x){x.open(o);return}D=o,L().then(d=>{const c=D||o;D="",d?.open?.(c)}).catch(()=>{D=""})}function U(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function F(){const a=e?.userProfile||{};return String(a.restaurantId||a.staffRestaurantId||"").trim()}function ue(){const a=String(e?.user?.uid||"").trim();if(!a)return!1;const r=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||r===a}function K(a=""){return`${Ue}${a}`}function me(a="",r=""){if(!v||!a)return null;try{const o=v.getItem(K(a));if(!o)return null;const d=JSON.parse(o);return!d||typeof d!="object"||String(d.day||"").trim()!==String(r||"").trim()||!d.model||typeof d.model!="object"?null:d.model}catch{return null}}function he(a="",r=null){if(!(!v||!a||!r))try{v.setItem(K(a),JSON.stringify({day:r.day,model:r}))}catch{}}async function pe(a=""){const{db:r,collectionFn:o,queryFn:d,orderByFn:c,limitFn:m,getDocsFn:f}=s;if(!r||typeof o!="function"||typeof d!="function"||typeof c!="function"||typeof m!="function"||typeof f!="function")return[];const g=o(r,"restaurants",a,"socialPosts");return(await f(d(g,c("createdAt","desc"),m(Ve)))).docs.map(p=>({id:p.id,data:p.data()||{}})).filter(p=>{const k=String(p.data.status||"active").trim().toLowerCase();return k!=="deleted"&&k!=="hidden"})}async function R({force:a=!1}={}){const r=U(),o=F();if(!o)return;const d=be({rangeKey:"7d"});if(!d)return;const c=`${o}::${d.toDay}`;if(!a&&r.loadedSignature===c&&r.status==="ready")return;if(!r.model){const g=me(o,d.toDay);g&&(r.model=g,r.status="ready",P())}C+=1;const m=C;r.model||(r.status="loading",r.error="",P());try{const g={db:s.db,collectionFn:s.collectionFn,queryFn:s.queryFn,whereFn:s.whereFn,documentIdFn:s.documentIdFn,getDocsFn:s.getDocsFn,restaurantId:o},[w,p]=await Promise.allSettled([_e({...g,fromDay:d.fromDay,toDay:d.toDay}),pe(o)]);if(m!==C)return;if(w.status==="rejected")throw w.reason;p.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",p.reason),r.model=Qe({days:w.value,todayKey:d.toDay,rawPosts:p.status==="fulfilled"?p.value:[]}),r.status="ready",r.error="",r.loadedSignature=c,he(o,r.model)}catch(g){if(m!==C)return;console.error("[mnyra][dashboard] load failed",g),r.model||(r.status="error",r.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}P()}function fe(){B||!_||(B=!0,_.addEventListener("click",a=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(a.target?.closest?.("[data-dashboard-retry]")){R({force:!0});return}const r=a.target?.closest?.("[data-dashboard-composer]");r&&(a.preventDefault(),ce(r.getAttribute("data-dashboard-composer")))}catch{}}))}function A(a=""){const r=e?.userProfile||{},o=a?N(a)||{}:{},d=String(o.name||o.restaurantName||r.name||"").trim()||"Business";let c="";try{c=String(te()||"").trim()}catch{}if(!c)try{c=String(ee(o)||"").trim()}catch{}return{name:d,logoUrl:c,kind:E()}}function ye(){De(_),fe();const a=U(),r=F();let o="";if(!r)o=ue()?`${Oe()}${G({kpiCount:6})}`:Le();else{le();const d=A(r),c=je({kind:d.kind,isOwner:W(e?.userProfile),canAccessOrders:Z(e?.userProfile)}),m=$e(d.kind);a.status==="idle"&&(a.status="loading",queueMicrotask(()=>{R({force:!1})}));let f="";a.model?f=`
          ${Me({kpiDefs:m,week:a.model.week,today:a.model.today})}
          ${Be({posts:a.model.posts,iconFn:b})}
        `:a.status==="error"?f=He({message:a.error}):f=G({kpiCount:m.length}),o=`
        ${Ne({name:d.name,logoUrl:d.logoUrl,iconFn:b})}
        ${Ee({iconFn:b})}
        ${Te({actions:c,iconFn:b})}
        ${f}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${o}
      </section>
    `}return Object.freeze({renderDashboardView:ye,loadDashboard:R})}export{xe as M,et as a,Ce as b,ke as c,We as d,Ze as f,Se as n};
