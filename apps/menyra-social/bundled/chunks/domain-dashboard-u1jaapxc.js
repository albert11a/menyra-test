import{f as k,r as Q,l as J,s as T}from"./domain-analytics-DqLU0QRq.js";const A="mnyraDashboardStyles",W=`
.mnyra-dash {
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
.mnyra-dash__hero {
  background: var(--dash-surface);
  border: 1px solid var(--dash-border);
  border-radius: 24px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 96px;
}
.mnyra-dash__hero-logo {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--dash-plane);
  overflow: hidden;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
}
.mnyra-dash__hero-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mnyra-dash__hero-main { min-width: 0; flex: 1; }
.mnyra-dash__hero-name {
  font-size: 17px;
  font-weight: 900;
  margin: 0;
  color: var(--dash-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__hero-meta {
  font-size: 11px;
  font-weight: 700;
  color: var(--dash-muted);
  margin: 4px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__hero-cta {
  flex: 0 0 auto;
  border: 1px solid var(--dash-border);
  background: var(--dash-plane);
  color: var(--dash-ink);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.mnyra-dash__section { margin-top: 14px; }
.mnyra-dash__section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin: 0 2px 10px;
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
`;function G(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(A)))try{const t=e.createElement("style");t.id=A,t.textContent=W,e.head?.appendChild(t)}catch{}}function u(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function B(e,t,o=""){if(typeof e!="function")return"";try{return e(t,o)||""}catch{return""}}const L=Object.freeze({restaurant:"Restaurant",cafe:"Café",fastfood:"Fast Food",hotel:"Hotel",motel:"Motel",hostel:"Hostel",resort:"Resort",ecommerce:"Online-Shop",tankstelle:"Tankstelle",lebensmittel:"Lebensmittel",apotheken:"Apotheke",services:"Service"});function X(e=""){const t=String(e||"").trim().toLowerCase();return t?L[t]?L[t]:t.charAt(0).toUpperCase()+t.slice(1):"Business"}const ee=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function te({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const o=String(e||"").trim().toLowerCase();return ee.includes(o)?"hotel":"restaurant"}function ae({kind:e="restaurant",isOwner:t=!1,canAccessOrders:o=!1}={}){const a=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Foto oder Video posten"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"24h sichtbar"}];return e==="hotel"?a.push({nav:"menu",iconName:"bed-double",label:"Hotel & Zimmer",sub:"Details, Zimmer, Angebote"}):e==="shop"?a.push({nav:"menu",iconName:"shopping-bag",label:"Shop bearbeiten",sub:"Produkte & Lager"}):a.push({nav:"menu",iconName:"utensils",label:"Menü bearbeiten",sub:"Produkte & Kategorien"}),a.push({nav:"menu",iconName:"megaphone",label:"Angebote & Werbung",sub:"Im Editor verwalten"}),e!=="hotel"&&o&&a.push({nav:"orders",iconName:"shopping-cart",label:"Bestellungen",sub:"Eingang & Status"}),a.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Alle Statistiken"}),t&&a.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),a.push({nav:"settings",iconName:"settings",label:"Einstellungen",sub:"Profil & Kontakt"}),a}function ne(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Beitrags-Reichweite"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Bestellungen"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Besucher"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Feed-Reichweite"}]):t.concat([{key:"ordersCompleted",label:"Bestellungen"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function R(e=0,t=""){const o=k(e);return t?`${o} ${t}`:o}function se({name:e="",typeLabel:t="",location:o="",logoUrl:a="",iconFn:n}={}){const c=[t,o].map(g=>String(g||"").trim()).filter(Boolean);return`
    <div class="mnyra-dash__hero">
      <div class="mnyra-dash__hero-logo">
        ${a?`<img src="${u(a)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:B(n,"store","w-6 h-6")}
      </div>
      <div class="mnyra-dash__hero-main">
        <p class="mnyra-dash__hero-name">${u(e||"Business")}</p>
        <p class="mnyra-dash__hero-meta">${u(c.join(" · ")||"Business")}</p>
      </div>
      <button type="button" class="mnyra-dash__hero-cta" data-nav="profile">Profil ansehen</button>
    </div>
  `}function re({actions:e=[],iconFn:t}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(a=>{const n=a.uploadIntent?` data-upload-intent="${u(a.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${u(a.nav)}"${n}>
        <span class="mnyra-dash__action-icon">${B(t,a.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${u(a.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${u(a.sub||"")}</span>
        </span>
      </button>
    `}).join("")}</div>
    </div>
  `}function oe({kpiDefs:e=[],week:t={},today:o={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Alle Analytics</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(n=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${u(n.label)}</p>
      <p class="mnyra-dash__kpi-value">${u(R(t?.[n.key]||0,n.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${u(R(o?.[n.key]||0,n.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function ie({posts:e=[],iconFn:t}={}){const o=Array.isArray(e)?e:[];let a="";return o.length?(a=o.map(n=>{const c=[n.dateLabel,`${k(n.likesCount||0)} Likes`,`${k(n.commentsCount||0)} Kommentare`];return Number(n.impressions||0)>0&&c.push(`${k(n.impressions)} Reichweite (7 T.)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${n.thumbUrl?`<img src="${u(n.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:B(t,n.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${u(n.caption||"Ohne Text")}</p>
            <p class="mnyra-dash__post-meta">${u(c.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `}).join(""),a=`<div class="mnyra-dash__posts">${a}</div>`):a=`
      <div class="mnyra-dash__state" style="border:none;">
        <p class="mnyra-dash__state-title">Noch keine Beiträge</p>
        <p class="mnyra-dash__state-body">Poste dein erstes Foto oder Video, damit Gäste dich im Feed entdecken.</p>
        <button type="button" class="mnyra-dash__retry" data-nav="upload" data-upload-intent="chooser">Neuer Beitrag</button>
      </div>
    `,`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="profile">Profil öffnen</button>
      </div>
      ${a}
    </div>
  `}function z({kpiCount:e=6}={}){return`
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
  `}function de(){return'<div class="mnyra-dash__skeleton" style="min-height:96px; border-radius:24px;"></div>'}function le({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Daten konnten nicht geladen werden</p>
        <p class="mnyra-dash__state-body">${u(e||"Bitte prüfe deine Verbindung und versuche es erneut.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Erneut versuchen</button>
      </div>
    </div>
  `}function ce(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Kein Business-Profil verbunden</p>
      <p class="mnyra-dash__state-body">Das Dashboard ist nur für Business-Konten verfügbar. Sobald dein Konto mit einem Restaurant, Hotel oder Shop verbunden ist, findest du hier alle Funktionen an einer Stelle.</p>
    </div>
  `}const ue="menyra_social_dashboard_cache_v1::",me=6,he=3;function D(e){const t=Number(e);return Number.isFinite(t)?t:0}function pe(e={}){const t=String(e.createdAtClient||"").trim();if(t){const a=new Date(t);if(!Number.isNaN(a.getTime()))return a}const o=e.createdAt;if(o&&typeof o.toDate=="function")try{const a=o.toDate();if(a instanceof Date&&!Number.isNaN(a.getTime()))return a}catch{}return null}function fe(e="",t={}){const o=Array.isArray(t.media)&&t.media.length?t.media[0]:{},a=String(o.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",n=String(o.thumbUrl||(a==="image"?o.url:"")||t.thumbUrl||"").trim(),c=pe(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:a,thumbUrl:n,likesCount:D(t.likesCount),commentsCount:D(t.commentsCount),impressions:0,dateLabel:c?c.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:c?c.getTime():0}}function ye({days:e=[],todayKey:t="",rawPosts:o=[]}={}){const a=Array.isArray(e)?e:[],n=T(a),c=a.find(l=>String(l?.date||l?.id||"").trim()===String(t||"").trim()),g=T(c?[c]:[]),b=n.merged?.posts&&typeof n.merged.posts=="object"?n.merged.posts:{},_=(Array.isArray(o)?o:[]).map(l=>fe(l?.id,l?.data||{})).filter(l=>l.id).sort((l,w)=>w.createdAtMs-l.createdAtMs).slice(0,he).map(l=>({...l,impressions:D(b[l.id]?.impressions)}));return{day:String(t||"").trim(),week:n.summary,today:g.summary,posts:_}}function be({state:e,renderFn:t,documentObj:o,firestoreApi:a={},profileApi:n={},iconFn:c,storageObj:g}={}){const b=o||(typeof document>"u"?null:document),_=typeof t=="function"?t:()=>{},l=g||(typeof localStorage>"u"?null:localStorage),w=typeof n.getBusinessProfileTypeFn=="function"?n.getBusinessProfileTypeFn:(()=>""),I=typeof n.isShopCatalogProfileFn=="function"?n.isShopCatalogProfileFn:(()=>!1),E=typeof n.isBusinessOwnerProfileFn=="function"?n.isBusinessOwnerProfileFn:(()=>!1),j=typeof n.canAccessRestaurantOrdersFn=="function"?n.canAccessRestaurantOrdersFn:(()=>!1),O=typeof n.getRestaurantMetaByIdFn=="function"?n.getRestaurantMetaByIdFn:(()=>null),M=typeof n.resolveRestaurantLogoFn=="function"?n.resolveRestaurantLogoFn:(()=>"");let v=0,C=!1;function P(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function $(){const r=e?.userProfile||{};return String(r.restaurantId||r.staffRestaurantId||"").trim()}function H(){const r=String(e?.user?.uid||"").trim();if(!r)return!1;const s=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||s===r}function F(r=""){return`${ue}${r}`}function K(r="",s=""){if(!l||!r)return null;try{const d=l.getItem(F(r));if(!d)return null;const i=JSON.parse(d);return!i||typeof i!="object"||String(i.day||"").trim()!==String(s||"").trim()||!i.model||typeof i.model!="object"?null:i.model}catch{return null}}function V(r="",s=null){if(!(!l||!r||!s))try{l.setItem(F(r),JSON.stringify({day:s.day,model:s}))}catch{}}async function U(r=""){const{db:s,collectionFn:d,queryFn:i,orderByFn:p,limitFn:h,getDocsFn:m}=a;if(!s||typeof d!="function"||typeof i!="function"||typeof p!="function"||typeof h!="function"||typeof m!="function")return[];const y=d(s,"restaurants",r,"socialPosts");return(await m(i(y,p("createdAt","desc"),h(me)))).docs.map(f=>({id:f.id,data:f.data()||{}})).filter(f=>{const N=String(f.data.status||"active").trim().toLowerCase();return N!=="deleted"&&N!=="hidden"})}async function S({force:r=!1}={}){const s=P(),d=$();if(!d)return;const i=Q({rangeKey:"7d"});if(!i)return;const p=`${d}::${i.toDay}`;if(!r&&s.loadedSignature===p&&s.status==="ready")return;if(!s.model){const y=K(d,i.toDay);y&&(s.model=y,s.status="ready",_())}v+=1;const h=v;s.model||(s.status="loading",s.error="",_());try{const y={db:a.db,collectionFn:a.collectionFn,queryFn:a.queryFn,whereFn:a.whereFn,documentIdFn:a.documentIdFn,getDocsFn:a.getDocsFn,restaurantId:d},[x,f]=await Promise.allSettled([J({...y,fromDay:i.fromDay,toDay:i.toDay}),U(d)]);if(h!==v)return;if(x.status==="rejected")throw x.reason;f.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",f.reason),s.model=ye({days:x.value,todayKey:i.toDay,rawPosts:f.status==="fulfilled"?f.value:[]}),s.status="ready",s.error="",s.loadedSignature=p,V(d,s.model)}catch(y){if(h!==v)return;console.error("[mnyra][dashboard] load failed",y),s.model||(s.status="error",s.error="Bitte prüfe deine Verbindung und versuche es erneut.")}_()}function q(){C||!b||(C=!0,b.addEventListener("click",r=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;r.target?.closest?.("[data-dashboard-retry]")&&S({force:!0})}catch{}}))}function Y(r=""){const s=e?.userProfile||{},d=r?O(r)||{}:{},i=w(s),p=String(d.name||d.restaurantName||s.name||"").trim()||"Business",h=String(s.location||d.city||"").trim();let m="";try{m=String(M(d)||"").trim()}catch{}return m||(m=String(s.avatar||"").trim()),{name:p,location:h,logoUrl:m,typeLabel:X(i),kind:te({businessType:i,isShopCatalog:I(s)})}}function Z(){G(b),q();const r=P(),s=$();let d="";if(!s)d=H()?`${de()}${z({kpiCount:6})}`:ce();else{const i=Y(s),p=ae({kind:i.kind,isOwner:E(e?.userProfile),canAccessOrders:j(e?.userProfile)}),h=ne(i.kind);r.status==="idle"&&(r.status="loading",queueMicrotask(()=>{S({force:!1})}));let m="";r.model?m=`
          ${oe({kpiDefs:h,week:r.model.week,today:r.model.today})}
          ${ie({posts:r.model.posts,iconFn:c})}
        `:r.status==="error"?m=le({message:r.error}):m=z({kpiCount:h.length}),d=`
        ${se({...i,iconFn:c})}
        ${re({actions:p,iconFn:c})}
        ${m}
      `}return`
      <section class="p-4 pb-28 mnyra-dash" data-dashboard-root>
        <div class="mb-4">
          <h2 class="text-lg font-black tracking-tight text-slate-900" style="color:var(--dash-ink);">Dashboard</h2>
          <p class="text-xs" style="color:var(--dash-muted); margin-top:2px;">Dein Business auf einen Blick: Aktionen, Zahlen, Beiträge.</p>
        </div>
        ${d}
      </section>
    `}return Object.freeze({renderDashboardView:Z,loadDashboard:S})}export{be as c};
