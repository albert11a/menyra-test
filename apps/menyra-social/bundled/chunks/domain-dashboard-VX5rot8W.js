const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-DSnLaCwi.js","chunks/domain-feed-social-eager-CAMxL9w6.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-B3Bb4ghO.js","chunks/domain-menu-eager-Ca3mC5Kt.js"])))=>i.map(i=>d[i]);
import{_ as oe}from"./domain-auth-Aq-4Vdvh.js";import{f as $,r as ie,l as de,s as H}from"./domain-analytics-jv5B-kA2.js";const K="mnyraDashboardStyles",le=`
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
`;function ce(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(K)))try{const a=e.createElement("style");a.id=K,a.textContent=le,e.head?.appendChild(a)}catch{}}function c(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function w(e,a,s=""){if(typeof e!="function")return"";try{return e(a,s)||""}catch{return""}}const me=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function ue({businessType:e="",isShopCatalog:a=!1}={}){if(a)return"shop";const s=String(e||"").trim().toLowerCase();return me.includes(s)?"hotel":"restaurant"}function he({kind:e="restaurant",isOwner:a=!1,canAccessOrders:s=!1}={}){const n=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Posto foto ose video"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"E dukshme 24h"}];return e==="hotel"?n.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?n.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):n.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),n.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),e!=="hotel"&&s&&n.push({nav:"orders",iconName:"shopping-cart",label:"Porosite",sub:"Hyrje & Status"}),n.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Te gjitha statistikat"}),a&&n.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),n.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),n}function pe(e="restaurant"){const a=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?a.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?a.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):a.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function U(e=0,a=""){const s=$(e);return a?`${s} ${a}`:s}function fe(e=new Date().getHours()){const a=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return a>=5&&a<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:a>=11&&a<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:a>=18&&a<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function ye({name:e="",logoUrl:a="",hour:s=new Date().getHours(),iconFn:n}={}){const o=fe(s);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${a?`<img src="${c(a)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${w(n,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${c(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${c(o.text)}</p>
      </div>
    </div>
  `}const ge='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"></circle></svg>';function be({iconFn:e}={}){return`
    <div class="mnyra-dash__composer" data-dashboard-composer-card>
      <p class="mnyra-dash__composer-title">Posto n'<span class="mnyra-dash__composer-accent">Zbulo</span></p>
      <p class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</p>
      <div class="mnyra-dash__composer-actions">${[{mode:"post",label:"Postim",iconHtml:w(e,"plus","w-4 h-4"),primary:!0},{mode:"story",label:"Story",iconHtml:ge,primary:!1}].map(s=>`
    <button type="button" class="mnyra-dash__composer-btn${s.primary?" mnyra-dash__composer-btn--primary":""}" data-dashboard-composer="${c(s.mode)}">
      <span class="mnyra-dash__composer-btn-icon">${s.iconHtml}</span>
      <span class="mnyra-dash__composer-btn-label">${c(s.label)}</span>
    </button>
  `).join("")}</div>
    </div>
  `}function _e({iconFn:e}={}){return`<div class="mnyra-dash__composer-row">${[{accent:"Profil",sub:"Postim që shfaqet në profilin tënd.",action:'data-dashboard-composer="post"',iconName:"plus",label:"Posto",primary:!0},{accent:"Meny",sub:"Produktet dhe kategoritë e menysë.",action:'data-nav="menu"',iconName:"utensils",label:"Ndrysho",primary:!1}].map(s=>`
    <div class="mnyra-dash__composer mnyra-dash__composer--split">
      <p class="mnyra-dash__composer-title">Posto n'<span class="mnyra-dash__composer-accent">${c(s.accent)}</span></p>
      <p class="mnyra-dash__composer-sub">${c(s.sub)}</p>
      <div class="mnyra-dash__composer-actions">
        <button type="button" class="mnyra-dash__composer-btn${s.primary?" mnyra-dash__composer-btn--primary":""}" ${s.action}>
          <span class="mnyra-dash__composer-btn-icon">${w(e,s.iconName,"w-4 h-4")}</span>
          <span class="mnyra-dash__composer-btn-label">${c(s.label)}</span>
        </button>
      </div>
    </div>
  `).join("")}</div>`}function ve({actions:e=[],iconFn:a}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(n=>{const o=n.uploadIntent?` data-upload-intent="${c(n.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${c(n.nav)}"${o}>
        <span class="mnyra-dash__action-icon">${w(a,n.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${c(n.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${c(n.sub||"")}</span>
        </span>
      </button>
    `}).join("")}</div>
    </div>
  `}function xe({kpiDefs:e=[],week:a={},today:s={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(o=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${c(o.label)}</p>
      <p class="mnyra-dash__kpi-value">${c(U(a?.[o.key]||0,o.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${c(U(s?.[o.key]||0,o.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function ke({posts:e=[],iconFn:a}={}){const s=Array.isArray(e)?e:[];let n="";return s.length?(n=s.map(o=>{const l=[o.dateLabel,`${$(o.likesCount||0)} Likes`,`${$(o.commentsCount||0)} Kommentare`];return Number(o.impressions||0)>0&&l.push(`${$(o.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${o.thumbUrl?`<img src="${c(o.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:w(a,o.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${c(o.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${c(l.filter(Boolean).join(" · "))}</p>
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
  `}function M({kpiCount:e=6}={}){return`
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
  `}function we(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Pe({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${c(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Se(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const ze="menyra_social_dashboard_cache_v1::",De=6,Ce=3;function N(e){const a=Number(e);return Number.isFinite(a)?a:0}function Fe(e={}){const a=String(e.createdAtClient||"").trim();if(a){const n=new Date(a);if(!Number.isNaN(n.getTime()))return n}const s=e.createdAt;if(s&&typeof s.toDate=="function")try{const n=s.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function je(e="",a={}){const s=Array.isArray(a.media)&&a.media.length?a.media[0]:{},n=String(s.type||a.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",o=String(s.thumbUrl||(n==="image"?s.url:"")||a.thumbUrl||"").trim(),l=Fe(a);return{id:String(e||"").trim(),caption:String(a.caption||"").trim(),mediaType:n,thumbUrl:o,likesCount:N(a.likesCount),commentsCount:N(a.commentsCount),impressions:0,dateLabel:l?l.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:l?l.getTime():0}}function $e({days:e=[],todayKey:a="",rawPosts:s=[]}={}){const n=Array.isArray(e)?e:[],o=H(n),l=n.find(m=>String(m?.date||m?.id||"").trim()===String(a||"").trim()),g=H(l?[l]:[]),I=o.merged?.posts&&typeof o.merged.posts=="object"?o.merged.posts:{},b=(Array.isArray(s)?s:[]).map(m=>je(m?.id,m?.data||{})).filter(m=>m.id).sort((m,_)=>_.createdAtMs-m.createdAtMs).slice(0,Ce).map(m=>({...m,impressions:N(I[m.id]?.impressions)}));return{day:String(a||"").trim(),week:o.summary,today:g.summary,posts:b}}function Re({state:e,renderFn:a,documentObj:s,firestoreApi:n={},profileApi:o={},composerApi:l={},iconFn:g,storageObj:I}={}){const b=s||(typeof document>"u"?null:document),m=typeof a=="function"?a:()=>{},_=I||(typeof localStorage>"u"?null:localStorage),V=typeof o.getBusinessProfileTypeFn=="function"?o.getBusinessProfileTypeFn:(()=>""),A=typeof o.isShopCatalogProfileFn=="function"?o.isShopCatalogProfileFn:(()=>!1),q=typeof o.isBusinessOwnerProfileFn=="function"?o.isBusinessOwnerProfileFn:(()=>!1),J=typeof o.canAccessRestaurantOrdersFn=="function"?o.canAccessRestaurantOrdersFn:(()=>!1),R=typeof o.getRestaurantMetaByIdFn=="function"?o.getRestaurantMetaByIdFn:(()=>null),G=typeof o.resolveRestaurantLogoFn=="function"?o.resolveRestaurantLogoFn:(()=>""),Z=typeof o.resolveOwnAvatarUrlFn=="function"?o.resolveOwnAvatarUrlFn:(()=>"");let P=0,B=!1,v=null,S=null,z="",T=()=>null;const Q=300;async function Y(r=""){const{db:t,collectionFn:d,queryFn:i,limitFn:h,getDocsFn:u}=n,p=String(r||"").trim();if(!p||!t||typeof d!="function"||typeof u!="function")throw new Error("Produktet nuk u ngarkuan.");const f=d(t,"restaurants",p,"menuItems"),x=typeof i=="function"&&typeof h=="function"?i(f,h(Q)):f,y=await u(x),k=[];return y.forEach(F=>{const j=T(F?.id,F?.data?.()||{});j&&k.push(j)}),k.sort((F,j)=>F.name.localeCompare(j.name,"sq")),k}function W(){return v?Promise.resolve(v):(S||(S=oe(()=>import("./business-composer-controller-DSnLaCwi.js"),__vite__mapDeps([0,1,2,3,4,5])).then(r=>(T=typeof r?.normalizeComposerProductCore=="function"?r.normalizeComposerProductCore:(()=>null),v=r.createBusinessComposerController({documentObj:b,windowObj:b?.defaultView||null,api:{getRestaurantIdFn:()=>D(),getBusinessMetaFn:()=>{const t=D();if(!t)return{name:"",logoUrl:"",city:""};const d=O(t),i=R(t)||{};return{name:d.name,logoUrl:d.logoUrl,city:String(i.city||"").trim()}},loadProductsFn:t=>Y(t),uploadImageFn:l.uploadImageFn,uploadVideoFn:l.uploadVideoFn,captureVideoPosterFn:l.captureVideoPosterFn,createPostFn:l.createPostFn,createStoryFn:l.createStoryFn,formatPriceFn:l.formatPriceFn,getOptimizedImageUrlFn:l.getOptimizedImageUrlFn,escapeHtmlFn:l.escapeHtmlFn,iconFn:typeof g=="function"?g:void 0,afterPublishFn:async t=>{try{await C({force:!0})}catch{}typeof l.afterPublishFn=="function"&&await l.afterPublishFn(t)}}}),v)).catch(r=>{throw S=null,console.error("[mnyra][dashboard] composer load failed",r),r})),S)}function X(r="post"){const t=String(r||"").trim().toLowerCase()==="story"?"story":"post";if(typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}if(v){v.open(t);return}z=t,W().then(d=>{const i=z||t;z="",d?.open?.(i)}).catch(()=>{z=""})}function E(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function D(){const r=e?.userProfile||{};return String(r.restaurantId||r.staffRestaurantId||"").trim()}function ee(){const r=String(e?.user?.uid||"").trim();if(!r)return!1;const t=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||t===r}function L(r=""){return`${ze}${r}`}function ae(r="",t=""){if(!_||!r)return null;try{const d=_.getItem(L(r));if(!d)return null;const i=JSON.parse(d);return!i||typeof i!="object"||String(i.day||"").trim()!==String(t||"").trim()||!i.model||typeof i.model!="object"?null:i.model}catch{return null}}function te(r="",t=null){if(!(!_||!r||!t))try{_.setItem(L(r),JSON.stringify({day:t.day,model:t}))}catch{}}async function ne(r=""){const{db:t,collectionFn:d,queryFn:i,orderByFn:h,limitFn:u,getDocsFn:p}=n;if(!t||typeof d!="function"||typeof i!="function"||typeof h!="function"||typeof u!="function"||typeof p!="function")return[];const f=d(t,"restaurants",r,"socialPosts");return(await p(i(f,h("createdAt","desc"),u(De)))).docs.map(y=>({id:y.id,data:y.data()||{}})).filter(y=>{const k=String(y.data.status||"active").trim().toLowerCase();return k!=="deleted"&&k!=="hidden"})}async function C({force:r=!1}={}){const t=E(),d=D();if(!d)return;const i=ie({rangeKey:"7d"});if(!i)return;const h=`${d}::${i.toDay}`;if(!r&&t.loadedSignature===h&&t.status==="ready")return;if(!t.model){const f=ae(d,i.toDay);f&&(t.model=f,t.status="ready",m())}P+=1;const u=P;t.model||(t.status="loading",t.error="",m());try{const f={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:d},[x,y]=await Promise.allSettled([de({...f,fromDay:i.fromDay,toDay:i.toDay}),ne(d)]);if(u!==P)return;if(x.status==="rejected")throw x.reason;y.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",y.reason),t.model=$e({days:x.value,todayKey:i.toDay,rawPosts:y.status==="fulfilled"?y.value:[]}),t.status="ready",t.error="",t.loadedSignature=h,te(d,t.model)}catch(f){if(u!==P)return;console.error("[mnyra][dashboard] load failed",f),t.model||(t.status="error",t.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}m()}function re(){B||!b||(B=!0,b.addEventListener("click",r=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(r.target?.closest?.("[data-dashboard-retry]")){C({force:!0});return}const t=r.target?.closest?.("[data-dashboard-composer]");t&&(r.preventDefault(),X(t.getAttribute("data-dashboard-composer")))}catch{}}))}function O(r=""){const t=e?.userProfile||{},d=r?R(r)||{}:{},i=V(t),h=String(d.name||d.restaurantName||t.name||"").trim()||"Business";let u="";try{u=String(Z()||"").trim()}catch{}if(!u)try{u=String(G(d)||"").trim()}catch{}return{name:h,logoUrl:u,kind:ue({businessType:i,isShopCatalog:A(t)})}}function se(){ce(b),re();const r=E(),t=D();let d="";if(!t)d=ee()?`${we()}${M({kpiCount:6})}`:Se();else{const i=O(t),h=he({kind:i.kind,isOwner:q(e?.userProfile),canAccessOrders:J(e?.userProfile)}),u=pe(i.kind);r.status==="idle"&&(r.status="loading",queueMicrotask(()=>{C({force:!1})}));let p="";r.model?p=`
          ${xe({kpiDefs:u,week:r.model.week,today:r.model.today})}
          ${ke({posts:r.model.posts,iconFn:g})}
        `:r.status==="error"?p=Pe({message:r.error}):p=M({kpiCount:u.length}),d=`
        ${ye({name:i.name,logoUrl:i.logoUrl,iconFn:g})}
        ${be({iconFn:g})}
        ${_e({iconFn:g})}
        ${ve({actions:h,iconFn:g})}
        ${p}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${d}
      </section>
    `}return Object.freeze({renderDashboardView:se,loadDashboard:C})}export{Re as c};
