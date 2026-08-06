const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-DSnLaCwi.js","chunks/domain-feed-social-eager-CAMxL9w6.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-B3Bb4ghO.js","chunks/domain-menu-eager-Ca3mC5Kt.js"])))=>i.map(i=>d[i]);
import{_ as de}from"./domain-auth-Aq-4Vdvh.js";import{f as I,r as le,l as ce,s as K}from"./domain-analytics-jv5B-kA2.js";const V="mnyraDashboardStyles",ue=`
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
/* Auf Wunsch schwarz wie der Name daneben, nicht mehr im Akzent. */
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
/* Zeile "Posto n'MNYRA" direkt unter der Begruessung, linksbuendig mit dem
   Logo darueber. "MNYRA" traegt die Schrift des Kopfzeilen-Logos: schwarz,
   kursiv, eng gesetzt. */
.mnyra-dash__brandline {
  margin: 22px 0 0;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.1;
  color: var(--dash-ink);
  white-space: nowrap;
}
.mnyra-dash__brandline-mark {
  font-style: italic;
  letter-spacing: -0.05em;
}
/* Drei Karten nebeneinander: Zbulo, Story, Profil. Jede traegt ihre eigene
   Farbe, ein eingebettetes Symbol und ein schlichtes Plus. Die Symbole stehen
   als SVG direkt im Markup - sie koennen damit nie fehlen, egal ob eine
   Icon-Bibliothek geladen ist oder nicht. */
.mnyra-dash__post-cards {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.mnyra-dash__post-card {
  --tone: var(--dash-accent);
  --tone-soft: var(--dash-accent-soft);
  background: var(--dash-surface);
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 14px 12px;
  min-height: 108px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  min-width: 0;
  color: var(--dash-ink);
  transition: transform 0.15s ease;
}
.mnyra-dash__post-card[data-tone="story"] { --tone: #db2777; --tone-soft: #fdf2f8; }
.mnyra-dash__post-card[data-tone="profil"] { --tone: #059669; --tone-soft: #ecfdf5; }
.mnyra-dash__post-card:active { transform: scale(0.97); }
.mnyra-dash__post-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.mnyra-dash__post-card-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: var(--tone-soft);
  color: var(--tone);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.mnyra-dash__post-card-icon svg { width: 18px; height: 18px; display: block; }
/* Das Plus bleibt eine reine Linie - kein Kreis, keine Flaeche. */
.mnyra-dash__post-card-plus {
  color: var(--tone);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  margin-top: 2px;
}
.mnyra-dash__post-card-plus svg { width: 15px; height: 15px; display: block; }
.mnyra-dash__post-card-label {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -0.01em;
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
`;function he(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(V)))try{const t=e.createElement("style");t.id=V,t.textContent=ue,e.head?.appendChild(t)}catch{}}function c(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function B(e,t,i=""){if(typeof e!="function")return"";try{return e(t,i)||""}catch{return""}}const me=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function pe({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const i=String(e||"").trim().toLowerCase();return me.includes(i)?"hotel":"restaurant"}function fe({kind:e="restaurant",isOwner:t=!1,canAccessOrders:i=!1}={}){const n=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Posto foto ose video"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"E dukshme 24h"}];return e==="hotel"?n.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?n.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):n.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),n.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),e!=="hotel"&&i&&n.push({nav:"orders",iconName:"shopping-cart",label:"Porosite",sub:"Hyrje & Status"}),n.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Te gjitha statistikat"}),t&&n.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),n.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),n}function ye(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function A(e=0,t=""){const i=I(e);return t?`${i} ${t}`:i}function ge(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function be({name:e="",logoUrl:t="",hour:i=new Date().getHours(),iconFn:n}={}){const s=ge(i);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${c(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${B(n,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${c(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${c(s.text)}</p>
      </div>
    </div>
  `}const j='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"',$=Object.freeze({zbulo:`<svg ${j}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>`,story:`<svg ${j}><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"></circle></svg>`,profil:`<svg ${j}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,plus:`<svg ${j}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`});function _e(){return`
    <p class="mnyra-dash__brandline">Posto n'<span class="mnyra-dash__brandline-mark">MNYRA</span></p>
  `}function ve(){return`<div class="mnyra-dash__post-cards" data-dashboard-composer-cards>${[{tone:"zbulo",label:"n'Zbulo",mode:"post",icon:$.zbulo},{tone:"story",label:"n'Story",mode:"story",icon:$.story},{tone:"profil",label:"n'Profil",mode:"post",icon:$.profil}].map(t=>`
    <button type="button" class="mnyra-dash__post-card" data-tone="${c(t.tone)}" data-dashboard-composer="${c(t.mode)}" aria-label="Posto ${c(t.label)}">
      <span class="mnyra-dash__post-card-top">
        <span class="mnyra-dash__post-card-icon">${t.icon}</span>
        <span class="mnyra-dash__post-card-plus">${$.plus}</span>
      </span>
      <span class="mnyra-dash__post-card-label">${c(t.label)}</span>
    </button>
  `).join("")}</div>`}function xe({actions:e=[],iconFn:t}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(n=>{const s=n.uploadIntent?` data-upload-intent="${c(n.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${c(n.nav)}"${s}>
        <span class="mnyra-dash__action-icon">${B(t,n.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${c(n.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${c(n.sub||"")}</span>
        </span>
      </button>
    `}).join("")}</div>
    </div>
  `}function ke({kpiDefs:e=[],week:t={},today:i={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(s=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${c(s.label)}</p>
      <p class="mnyra-dash__kpi-value">${c(A(t?.[s.key]||0,s.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${c(A(i?.[s.key]||0,s.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function we({posts:e=[],iconFn:t}={}){const i=Array.isArray(e)?e:[];let n="";return i.length?(n=i.map(s=>{const l=[s.dateLabel,`${I(s.likesCount||0)} Likes`,`${I(s.commentsCount||0)} Kommentare`];return Number(s.impressions||0)>0&&l.push(`${I(s.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${s.thumbUrl?`<img src="${c(s.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:B(t,s.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${c(s.caption||"Pa tekst")}</p>
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
  `}function U({kpiCount:e=6}={}){return`
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
  `}function Pe(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Se({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${c(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function De(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const ze="menyra_social_dashboard_cache_v1::",Fe=6,Ce=3;function N(e){const t=Number(e);return Number.isFinite(t)?t:0}function je(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const i=e.createdAt;if(i&&typeof i.toDate=="function")try{const n=i.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function $e(e="",t={}){const i=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(i.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",s=String(i.thumbUrl||(n==="image"?i.url:"")||t.thumbUrl||"").trim(),l=je(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:s,likesCount:N(t.likesCount),commentsCount:N(t.commentsCount),impressions:0,dateLabel:l?l.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:l?l.getTime():0}}function Ie({days:e=[],todayKey:t="",rawPosts:i=[]}={}){const n=Array.isArray(e)?e:[],s=K(n),l=n.find(u=>String(u?.date||u?.id||"").trim()===String(t||"").trim()),g=K(l?[l]:[]),R=s.merged?.posts&&typeof s.merged.posts=="object"?s.merged.posts:{},b=(Array.isArray(i)?i:[]).map(u=>$e(u?.id,u?.data||{})).filter(u=>u.id).sort((u,_)=>_.createdAtMs-u.createdAtMs).slice(0,Ce).map(u=>({...u,impressions:N(R[u.id]?.impressions)}));return{day:String(t||"").trim(),week:s.summary,today:g.summary,posts:b}}function Be({state:e,renderFn:t,documentObj:i,firestoreApi:n={},profileApi:s={},composerApi:l={},iconFn:g,storageObj:R}={}){const b=i||(typeof document>"u"?null:document),u=typeof t=="function"?t:()=>{},_=R||(typeof localStorage>"u"?null:localStorage),q=typeof s.getBusinessProfileTypeFn=="function"?s.getBusinessProfileTypeFn:(()=>""),J=typeof s.isShopCatalogProfileFn=="function"?s.isShopCatalogProfileFn:(()=>!1),G=typeof s.isBusinessOwnerProfileFn=="function"?s.isBusinessOwnerProfileFn:(()=>!1),Y=typeof s.canAccessRestaurantOrdersFn=="function"?s.canAccessRestaurantOrdersFn:(()=>!1),T=typeof s.getRestaurantMetaByIdFn=="function"?s.getRestaurantMetaByIdFn:(()=>null),Z=typeof s.resolveRestaurantLogoFn=="function"?s.resolveRestaurantLogoFn:(()=>""),Q=typeof s.resolveOwnAvatarUrlFn=="function"?s.resolveOwnAvatarUrlFn:(()=>"");let w=0,L=!1,v=null,P=null,S="",E=()=>null;const W=300;async function X(r=""){const{db:a,collectionFn:d,queryFn:o,limitFn:m,getDocsFn:h}=n,p=String(r||"").trim();if(!p||!a||typeof d!="function"||typeof h!="function")throw new Error("Produktet nuk u ngarkuan.");const f=d(a,"restaurants",p,"menuItems"),x=typeof o=="function"&&typeof m=="function"?o(f,m(W)):f,y=await h(x),k=[];return y.forEach(F=>{const C=E(F?.id,F?.data?.()||{});C&&k.push(C)}),k.sort((F,C)=>F.name.localeCompare(C.name,"sq")),k}function ee(){return v?Promise.resolve(v):(P||(P=de(()=>import("./business-composer-controller-DSnLaCwi.js"),__vite__mapDeps([0,1,2,3,4,5])).then(r=>(E=typeof r?.normalizeComposerProductCore=="function"?r.normalizeComposerProductCore:(()=>null),v=r.createBusinessComposerController({documentObj:b,windowObj:b?.defaultView||null,api:{getRestaurantIdFn:()=>D(),getBusinessMetaFn:()=>{const a=D();if(!a)return{name:"",logoUrl:"",city:""};const d=H(a),o=T(a)||{};return{name:d.name,logoUrl:d.logoUrl,city:String(o.city||"").trim()}},loadProductsFn:a=>X(a),uploadImageFn:l.uploadImageFn,uploadVideoFn:l.uploadVideoFn,captureVideoPosterFn:l.captureVideoPosterFn,createPostFn:l.createPostFn,createStoryFn:l.createStoryFn,formatPriceFn:l.formatPriceFn,getOptimizedImageUrlFn:l.getOptimizedImageUrlFn,escapeHtmlFn:l.escapeHtmlFn,iconFn:typeof g=="function"?g:void 0,afterPublishFn:async a=>{try{await z({force:!0})}catch{}typeof l.afterPublishFn=="function"&&await l.afterPublishFn(a)}}}),v)).catch(r=>{throw P=null,console.error("[mnyra][dashboard] composer load failed",r),r})),P)}function te(r="post"){const a=String(r||"").trim().toLowerCase()==="story"?"story":"post";if(typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}if(v){v.open(a);return}S=a,ee().then(d=>{const o=S||a;S="",d?.open?.(o)}).catch(()=>{S=""})}function M(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function D(){const r=e?.userProfile||{};return String(r.restaurantId||r.staffRestaurantId||"").trim()}function ae(){const r=String(e?.user?.uid||"").trim();if(!r)return!1;const a=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||a===r}function O(r=""){return`${ze}${r}`}function ne(r="",a=""){if(!_||!r)return null;try{const d=_.getItem(O(r));if(!d)return null;const o=JSON.parse(d);return!o||typeof o!="object"||String(o.day||"").trim()!==String(a||"").trim()||!o.model||typeof o.model!="object"?null:o.model}catch{return null}}function re(r="",a=null){if(!(!_||!r||!a))try{_.setItem(O(r),JSON.stringify({day:a.day,model:a}))}catch{}}async function se(r=""){const{db:a,collectionFn:d,queryFn:o,orderByFn:m,limitFn:h,getDocsFn:p}=n;if(!a||typeof d!="function"||typeof o!="function"||typeof m!="function"||typeof h!="function"||typeof p!="function")return[];const f=d(a,"restaurants",r,"socialPosts");return(await p(o(f,m("createdAt","desc"),h(Fe)))).docs.map(y=>({id:y.id,data:y.data()||{}})).filter(y=>{const k=String(y.data.status||"active").trim().toLowerCase();return k!=="deleted"&&k!=="hidden"})}async function z({force:r=!1}={}){const a=M(),d=D();if(!d)return;const o=le({rangeKey:"7d"});if(!o)return;const m=`${d}::${o.toDay}`;if(!r&&a.loadedSignature===m&&a.status==="ready")return;if(!a.model){const f=ne(d,o.toDay);f&&(a.model=f,a.status="ready",u())}w+=1;const h=w;a.model||(a.status="loading",a.error="",u());try{const f={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:d},[x,y]=await Promise.allSettled([ce({...f,fromDay:o.fromDay,toDay:o.toDay}),se(d)]);if(h!==w)return;if(x.status==="rejected")throw x.reason;y.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",y.reason),a.model=Ie({days:x.value,todayKey:o.toDay,rawPosts:y.status==="fulfilled"?y.value:[]}),a.status="ready",a.error="",a.loadedSignature=m,re(d,a.model)}catch(f){if(h!==w)return;console.error("[mnyra][dashboard] load failed",f),a.model||(a.status="error",a.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}u()}function oe(){L||!b||(L=!0,b.addEventListener("click",r=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(r.target?.closest?.("[data-dashboard-retry]")){z({force:!0});return}const a=r.target?.closest?.("[data-dashboard-composer]");a&&(r.preventDefault(),te(a.getAttribute("data-dashboard-composer")))}catch{}}))}function H(r=""){const a=e?.userProfile||{},d=r?T(r)||{}:{},o=q(a),m=String(d.name||d.restaurantName||a.name||"").trim()||"Business";let h="";try{h=String(Q()||"").trim()}catch{}if(!h)try{h=String(Z(d)||"").trim()}catch{}return{name:m,logoUrl:h,kind:pe({businessType:o,isShopCatalog:J(a)})}}function ie(){he(b),oe();const r=M(),a=D();let d="";if(!a)d=ae()?`${Pe()}${U({kpiCount:6})}`:De();else{const o=H(a),m=fe({kind:o.kind,isOwner:G(e?.userProfile),canAccessOrders:Y(e?.userProfile)}),h=ye(o.kind);r.status==="idle"&&(r.status="loading",queueMicrotask(()=>{z({force:!1})}));let p="";r.model?p=`
          ${ke({kpiDefs:h,week:r.model.week,today:r.model.today})}
          ${we({posts:r.model.posts,iconFn:g})}
        `:r.status==="error"?p=Se({message:r.error}):p=U({kpiCount:h.length}),d=`
        ${be({name:o.name,logoUrl:o.logoUrl,iconFn:g})}
        ${_e()}
        ${ve()}
        ${xe({actions:m,iconFn:g})}
        ${p}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${d}
      </section>
    `}return Object.freeze({renderDashboardView:ie,loadDashboard:z})}export{Be as c};
