const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-DSnLaCwi.js","chunks/domain-feed-social-eager-CAMxL9w6.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-B3Bb4ghO.js","chunks/domain-menu-eager-Ca3mC5Kt.js"])))=>i.map(i=>d[i]);
import{_ as oe}from"./domain-auth-Aq-4Vdvh.js";import{f as z,r as ie,l as de,s as U}from"./domain-analytics-jv5B-kA2.js";const H="mnyraDashboardStyles",le=`
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
  --dash-accent: #4f46e5;
  --dash-accent-soft: #eef2ff;
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
   Bild zur Hoehe des zweizeiligen Textblocks passt. */
.mnyra-dash__greet-logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  padding: 2px;
  background: linear-gradient(to bottom right, #6366f1, #a855f7);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
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
.mnyra-dash__greet-hello { color: var(--dash-accent); }
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
   der linke ausgefuellt, der rechte ruhig. Beide Flaechen tragen nur einen
   leisen Schatten. */
.mnyra-dash__composer {
  margin-top: 34px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-border);
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 6px 16px -14px rgba(15, 23, 42, 0.3);
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
  border: 1px solid var(--dash-border);
  border-radius: 20px;
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
  border: 1px solid var(--dash-border);
  border-radius: 20px;
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
  border: 1px solid var(--dash-border);
  border-radius: 20px;
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
  border: 1px solid var(--dash-border);
  border-radius: 20px;
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
.mnyra-dash__skeleton {
  border-radius: 20px;
  background: var(--dash-plane);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  border: 1px solid transparent;
}
@keyframes mnyraDashPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
`;function ce(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(H)))try{const t=e.createElement("style");t.id=H,t.textContent=le,e.head?.appendChild(t)}catch{}}function m(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function $(e,t,o=""){if(typeof e!="function")return"";try{return e(t,o)||""}catch{return""}}const ue=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function me({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const o=String(e||"").trim().toLowerCase();return ue.includes(o)?"hotel":"restaurant"}function pe({kind:e="restaurant",isOwner:t=!1,canAccessOrders:o=!1}={}){const n=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Posto foto ose video"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"E dukshme 24h"}];return e==="hotel"?n.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?n.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):n.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),n.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),e!=="hotel"&&o&&n.push({nav:"orders",iconName:"shopping-cart",label:"Porosite",sub:"Hyrje & Status"}),n.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Te gjitha statistikat"}),t&&n.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),n.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),n}function he(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function M(e=0,t=""){const o=z(e);return t?`${o} ${t}`:o}function fe(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function ye({name:e="",logoUrl:t="",hour:o=new Date().getHours(),iconFn:n}={}){const s=fe(o);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${m(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${$(n,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${m(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${m(s.text)}</p>
      </div>
    </div>
  `}const ge='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"></circle></svg>';function be({iconFn:e}={}){return`
    <div class="mnyra-dash__composer" data-dashboard-composer-card>
      <p class="mnyra-dash__composer-title">Posto n'<span class="mnyra-dash__composer-accent">Zbulo</span></p>
      <p class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</p>
      <div class="mnyra-dash__composer-actions">${[{mode:"post",label:"Postim",iconHtml:$(e,"plus","w-4 h-4"),primary:!0},{mode:"story",label:"Story",iconHtml:ge,primary:!1}].map(o=>`
    <button type="button" class="mnyra-dash__composer-btn${o.primary?" mnyra-dash__composer-btn--primary":""}" data-dashboard-composer="${m(o.mode)}">
      <span class="mnyra-dash__composer-btn-icon">${o.iconHtml}</span>
      <span class="mnyra-dash__composer-btn-label">${m(o.label)}</span>
    </button>
  `).join("")}</div>
    </div>
  `}function _e({actions:e=[],iconFn:t}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(n=>{const s=n.uploadIntent?` data-upload-intent="${m(n.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${m(n.nav)}"${s}>
        <span class="mnyra-dash__action-icon">${$(t,n.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${m(n.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${m(n.sub||"")}</span>
        </span>
      </button>
    `}).join("")}</div>
    </div>
  `}function ve({kpiDefs:e=[],week:t={},today:o={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(s=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${m(s.label)}</p>
      <p class="mnyra-dash__kpi-value">${m(M(t?.[s.key]||0,s.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${m(M(o?.[s.key]||0,s.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function xe({posts:e=[],iconFn:t}={}){const o=Array.isArray(e)?e:[];let n="";return o.length?(n=o.map(s=>{const l=[s.dateLabel,`${z(s.likesCount||0)} Likes`,`${z(s.commentsCount||0)} Kommentare`];return Number(s.impressions||0)>0&&l.push(`${z(s.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${s.thumbUrl?`<img src="${m(s.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:$(t,s.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${m(s.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${m(l.filter(Boolean).join(" · "))}</p>
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
  `}function ke(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function we({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${m(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Se(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Pe="menyra_social_dashboard_cache_v1::",De=6,Fe=3;function N(e){const t=Number(e);return Number.isFinite(t)?t:0}function Ce(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const o=e.createdAt;if(o&&typeof o.toDate=="function")try{const n=o.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function je(e="",t={}){const o=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(o.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",s=String(o.thumbUrl||(n==="image"?o.url:"")||t.thumbUrl||"").trim(),l=Ce(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:s,likesCount:N(t.likesCount),commentsCount:N(t.commentsCount),impressions:0,dateLabel:l?l.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:l?l.getTime():0}}function ze({days:e=[],todayKey:t="",rawPosts:o=[]}={}){const n=Array.isArray(e)?e:[],s=U(n),l=n.find(c=>String(c?.date||c?.id||"").trim()===String(t||"").trim()),g=U(l?[l]:[]),I=s.merged?.posts&&typeof s.merged.posts=="object"?s.merged.posts:{},b=(Array.isArray(o)?o:[]).map(c=>je(c?.id,c?.data||{})).filter(c=>c.id).sort((c,_)=>_.createdAtMs-c.createdAtMs).slice(0,Fe).map(c=>({...c,impressions:N(I[c.id]?.impressions)}));return{day:String(t||"").trim(),week:s.summary,today:g.summary,posts:b}}function Ne({state:e,renderFn:t,documentObj:o,firestoreApi:n={},profileApi:s={},composerApi:l={},iconFn:g,storageObj:I}={}){const b=o||(typeof document>"u"?null:document),c=typeof t=="function"?t:()=>{},_=I||(typeof localStorage>"u"?null:localStorage),A=typeof s.getBusinessProfileTypeFn=="function"?s.getBusinessProfileTypeFn:(()=>""),K=typeof s.isShopCatalogProfileFn=="function"?s.isShopCatalogProfileFn:(()=>!1),q=typeof s.isBusinessOwnerProfileFn=="function"?s.isBusinessOwnerProfileFn:(()=>!1),J=typeof s.canAccessRestaurantOrdersFn=="function"?s.canAccessRestaurantOrdersFn:(()=>!1),T=typeof s.getRestaurantMetaByIdFn=="function"?s.getRestaurantMetaByIdFn:(()=>null),G=typeof s.resolveRestaurantLogoFn=="function"?s.resolveRestaurantLogoFn:(()=>""),Q=typeof s.resolveOwnAvatarUrlFn=="function"?s.resolveOwnAvatarUrlFn:(()=>"");let w=0,B=!1,v=null,S=null,P="",R=()=>null;const Y=300;async function Z(r=""){const{db:a,collectionFn:d,queryFn:i,limitFn:p,getDocsFn:u}=n,h=String(r||"").trim();if(!h||!a||typeof d!="function"||typeof u!="function")throw new Error("Produktet nuk u ngarkuan.");const f=d(a,"restaurants",h,"menuItems"),x=typeof i=="function"&&typeof p=="function"?i(f,p(Y)):f,y=await u(x),k=[];return y.forEach(C=>{const j=R(C?.id,C?.data?.()||{});j&&k.push(j)}),k.sort((C,j)=>C.name.localeCompare(j.name,"sq")),k}function W(){return v?Promise.resolve(v):(S||(S=oe(()=>import("./business-composer-controller-DSnLaCwi.js"),__vite__mapDeps([0,1,2,3,4,5])).then(r=>(R=typeof r?.normalizeComposerProductCore=="function"?r.normalizeComposerProductCore:(()=>null),v=r.createBusinessComposerController({documentObj:b,windowObj:b?.defaultView||null,api:{getRestaurantIdFn:()=>D(),getBusinessMetaFn:()=>{const a=D();if(!a)return{name:"",logoUrl:"",city:""};const d=O(a),i=T(a)||{};return{name:d.name,logoUrl:d.logoUrl,city:String(i.city||"").trim()}},loadProductsFn:a=>Z(a),uploadImageFn:l.uploadImageFn,uploadVideoFn:l.uploadVideoFn,captureVideoPosterFn:l.captureVideoPosterFn,createPostFn:l.createPostFn,createStoryFn:l.createStoryFn,formatPriceFn:l.formatPriceFn,getOptimizedImageUrlFn:l.getOptimizedImageUrlFn,escapeHtmlFn:l.escapeHtmlFn,iconFn:typeof g=="function"?g:void 0,afterPublishFn:async a=>{try{await F({force:!0})}catch{}typeof l.afterPublishFn=="function"&&await l.afterPublishFn(a)}}}),v)).catch(r=>{throw S=null,console.error("[mnyra][dashboard] composer load failed",r),r})),S)}function X(r="post"){const a=String(r||"").trim().toLowerCase()==="story"?"story":"post";if(typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}if(v){v.open(a);return}P=a,W().then(d=>{const i=P||a;P="",d?.open?.(i)}).catch(()=>{P=""})}function E(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function D(){const r=e?.userProfile||{};return String(r.restaurantId||r.staffRestaurantId||"").trim()}function ee(){const r=String(e?.user?.uid||"").trim();if(!r)return!1;const a=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||a===r}function L(r=""){return`${Pe}${r}`}function te(r="",a=""){if(!_||!r)return null;try{const d=_.getItem(L(r));if(!d)return null;const i=JSON.parse(d);return!i||typeof i!="object"||String(i.day||"").trim()!==String(a||"").trim()||!i.model||typeof i.model!="object"?null:i.model}catch{return null}}function ae(r="",a=null){if(!(!_||!r||!a))try{_.setItem(L(r),JSON.stringify({day:a.day,model:a}))}catch{}}async function ne(r=""){const{db:a,collectionFn:d,queryFn:i,orderByFn:p,limitFn:u,getDocsFn:h}=n;if(!a||typeof d!="function"||typeof i!="function"||typeof p!="function"||typeof u!="function"||typeof h!="function")return[];const f=d(a,"restaurants",r,"socialPosts");return(await h(i(f,p("createdAt","desc"),u(De)))).docs.map(y=>({id:y.id,data:y.data()||{}})).filter(y=>{const k=String(y.data.status||"active").trim().toLowerCase();return k!=="deleted"&&k!=="hidden"})}async function F({force:r=!1}={}){const a=E(),d=D();if(!d)return;const i=ie({rangeKey:"7d"});if(!i)return;const p=`${d}::${i.toDay}`;if(!r&&a.loadedSignature===p&&a.status==="ready")return;if(!a.model){const f=te(d,i.toDay);f&&(a.model=f,a.status="ready",c())}w+=1;const u=w;a.model||(a.status="loading",a.error="",c());try{const f={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:d},[x,y]=await Promise.allSettled([de({...f,fromDay:i.fromDay,toDay:i.toDay}),ne(d)]);if(u!==w)return;if(x.status==="rejected")throw x.reason;y.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",y.reason),a.model=ze({days:x.value,todayKey:i.toDay,rawPosts:y.status==="fulfilled"?y.value:[]}),a.status="ready",a.error="",a.loadedSignature=p,ae(d,a.model)}catch(f){if(u!==w)return;console.error("[mnyra][dashboard] load failed",f),a.model||(a.status="error",a.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}c()}function re(){B||!b||(B=!0,b.addEventListener("click",r=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(r.target?.closest?.("[data-dashboard-retry]")){F({force:!0});return}const a=r.target?.closest?.("[data-dashboard-composer]");a&&(r.preventDefault(),X(a.getAttribute("data-dashboard-composer")))}catch{}}))}function O(r=""){const a=e?.userProfile||{},d=r?T(r)||{}:{},i=A(a),p=String(d.name||d.restaurantName||a.name||"").trim()||"Business";let u="";try{u=String(Q()||"").trim()}catch{}if(!u)try{u=String(G(d)||"").trim()}catch{}return{name:p,logoUrl:u,kind:me({businessType:i,isShopCatalog:K(a)})}}function se(){ce(b),re();const r=E(),a=D();let d="";if(!a)d=ee()?`${ke()}${V({kpiCount:6})}`:Se();else{const i=O(a),p=pe({kind:i.kind,isOwner:q(e?.userProfile),canAccessOrders:J(e?.userProfile)}),u=he(i.kind);r.status==="idle"&&(r.status="loading",queueMicrotask(()=>{F({force:!1})}));let h="";r.model?h=`
          ${ve({kpiDefs:u,week:r.model.week,today:r.model.today})}
          ${xe({posts:r.model.posts,iconFn:g})}
        `:r.status==="error"?h=we({message:r.error}):h=V({kpiCount:u.length}),d=`
        ${ye({name:i.name,logoUrl:i.logoUrl,iconFn:g})}
        ${be({iconFn:g})}
        ${_e({actions:p,iconFn:g})}
        ${h}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${d}
      </section>
    `}return Object.freeze({renderDashboardView:se,loadDashboard:F})}export{Ne as c};
