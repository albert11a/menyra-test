import{f as x,r as Q,l as W,s as j}from"./domain-analytics-CHAXqWnD.js";const T="mnyraDashboardStyles",Y=`
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
  align-items: stretch;
  gap: 14px;
  min-height: 56px;
  margin: 4px 0 16px;
}
.mnyra-dash__greet-logo {
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
.mnyra-dash__greet-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mnyra-dash__greet-text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
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
`;function Z(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(T)))try{const t=e.createElement("style");t.id=T,t.textContent=Y,e.head?.appendChild(t)}catch{}}function u(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function P(e,t,o=""){if(typeof e!="function")return"";try{return e(t,o)||""}catch{return""}}const X=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function ee({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const o=String(e||"").trim().toLowerCase();return X.includes(o)?"hotel":"restaurant"}function te({kind:e="restaurant",isOwner:t=!1,canAccessOrders:o=!1}={}){const a=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Foto oder Video posten"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"24h sichtbar"}];return e==="hotel"?a.push({nav:"menu",iconName:"bed-double",label:"Hotel & Zimmer",sub:"Details, Zimmer, Angebote"}):e==="shop"?a.push({nav:"menu",iconName:"shopping-bag",label:"Shop bearbeiten",sub:"Produkte & Lager"}):a.push({nav:"menu",iconName:"utensils",label:"Menü bearbeiten",sub:"Produkte & Kategorien"}),a.push({nav:"menu",iconName:"megaphone",label:"Angebote & Werbung",sub:"Im Editor verwalten"}),e!=="hotel"&&o&&a.push({nav:"orders",iconName:"shopping-cart",label:"Bestellungen",sub:"Eingang & Status"}),a.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Alle Statistiken"}),t&&a.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),a.push({nav:"settings",iconName:"settings",label:"Einstellungen",sub:"Profil & Kontakt"}),a}function ae(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Beitrags-Reichweite"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Bestellungen"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Besucher"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Feed-Reichweite"}]):t.concat([{key:"ordersCompleted",label:"Bestellungen"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function R(e=0,t=""){const o=x(e);return t?`${o} ${t}`:o}function ne(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function se({name:e="",logoUrl:t="",hour:o=new Date().getHours(),iconFn:a}={}){const n=ne(o);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${u(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:P(a,"store","w-6 h-6")}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title">Përshëndetje, ${u(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${u(n.text)}</p>
      </div>
    </div>
  `}function re({actions:e=[],iconFn:t}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Schnellzugriff</p>
      </div>
      <div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(a=>{const n=a.uploadIntent?` data-upload-intent="${u(a.uploadIntent)}"`:"";return`
      <button type="button" class="mnyra-dash__action" data-nav="${u(a.nav)}"${n}>
        <span class="mnyra-dash__action-icon">${P(t,a.iconName,"w-4 h-4")}</span>
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
  `}function ie({posts:e=[],iconFn:t}={}){const o=Array.isArray(e)?e:[];let a="";return o.length?(a=o.map(n=>{const c=[n.dateLabel,`${x(n.likesCount||0)} Likes`,`${x(n.commentsCount||0)} Kommentare`];return Number(n.impressions||0)>0&&c.push(`${x(n.impressions)} Reichweite (7 T.)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${n.thumbUrl?`<img src="${u(n.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:P(t,n.mediaType==="video"?"play":"image","w-5 h-5")}
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
  `}function de(){return'<div class="mnyra-dash__skeleton" style="min-height:56px; border-radius:18px; margin: 4px 0 16px;"></div>'}function le({message:e=""}={}){return`
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
  `}const ue="menyra_social_dashboard_cache_v1::",me=6,he=3;function D(e){const t=Number(e);return Number.isFinite(t)?t:0}function pe(e={}){const t=String(e.createdAtClient||"").trim();if(t){const a=new Date(t);if(!Number.isNaN(a.getTime()))return a}const o=e.createdAt;if(o&&typeof o.toDate=="function")try{const a=o.toDate();if(a instanceof Date&&!Number.isNaN(a.getTime()))return a}catch{}return null}function ye(e="",t={}){const o=Array.isArray(t.media)&&t.media.length?t.media[0]:{},a=String(o.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",n=String(o.thumbUrl||(a==="image"?o.url:"")||t.thumbUrl||"").trim(),c=pe(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:a,thumbUrl:n,likesCount:D(t.likesCount),commentsCount:D(t.commentsCount),impressions:0,dateLabel:c?c.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:c?c.getTime():0}}function fe({days:e=[],todayKey:t="",rawPosts:o=[]}={}){const a=Array.isArray(e)?e:[],n=j(a),c=a.find(l=>String(l?.date||l?.id||"").trim()===String(t||"").trim()),k=j(c?[c]:[]),g=n.merged?.posts&&typeof n.merged.posts=="object"?n.merged.posts:{},b=(Array.isArray(o)?o:[]).map(l=>ye(l?.id,l?.data||{})).filter(l=>l.id).sort((l,w)=>w.createdAtMs-l.createdAtMs).slice(0,he).map(l=>({...l,impressions:D(g[l.id]?.impressions)}));return{day:String(t||"").trim(),week:n.summary,today:k.summary,posts:b}}function be({state:e,renderFn:t,documentObj:o,firestoreApi:a={},profileApi:n={},iconFn:c,storageObj:k}={}){const g=o||(typeof document>"u"?null:document),b=typeof t=="function"?t:()=>{},l=k||(typeof localStorage>"u"?null:localStorage),w=typeof n.getBusinessProfileTypeFn=="function"?n.getBusinessProfileTypeFn:(()=>""),I=typeof n.isShopCatalogProfileFn=="function"?n.isShopCatalogProfileFn:(()=>!1),A=typeof n.isBusinessOwnerProfileFn=="function"?n.isBusinessOwnerProfileFn:(()=>!1),E=typeof n.canAccessRestaurantOrdersFn=="function"?n.canAccessRestaurantOrdersFn:(()=>!1),L=typeof n.getRestaurantMetaByIdFn=="function"?n.getRestaurantMetaByIdFn:(()=>null),O=typeof n.resolveRestaurantLogoFn=="function"?n.resolveRestaurantLogoFn:(()=>""),M=typeof n.resolveOwnAvatarUrlFn=="function"?n.resolveOwnAvatarUrlFn:(()=>"");let _=0,$=!1;function C(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function B(){const r=e?.userProfile||{};return String(r.restaurantId||r.staffRestaurantId||"").trim()}function H(){const r=String(e?.user?.uid||"").trim();if(!r)return!1;const s=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||s===r}function F(r=""){return`${ue}${r}`}function K(r="",s=""){if(!l||!r)return null;try{const d=l.getItem(F(r));if(!d)return null;const i=JSON.parse(d);return!i||typeof i!="object"||String(i.day||"").trim()!==String(s||"").trim()||!i.model||typeof i.model!="object"?null:i.model}catch{return null}}function U(r="",s=null){if(!(!l||!r||!s))try{l.setItem(F(r),JSON.stringify({day:s.day,model:s}))}catch{}}async function V(r=""){const{db:s,collectionFn:d,queryFn:i,orderByFn:h,limitFn:m,getDocsFn:y}=a;if(!s||typeof d!="function"||typeof i!="function"||typeof h!="function"||typeof m!="function"||typeof y!="function")return[];const f=d(s,"restaurants",r,"socialPosts");return(await y(i(f,h("createdAt","desc"),m(me)))).docs.map(p=>({id:p.id,data:p.data()||{}})).filter(p=>{const N=String(p.data.status||"active").trim().toLowerCase();return N!=="deleted"&&N!=="hidden"})}async function S({force:r=!1}={}){const s=C(),d=B();if(!d)return;const i=Q({rangeKey:"7d"});if(!i)return;const h=`${d}::${i.toDay}`;if(!r&&s.loadedSignature===h&&s.status==="ready")return;if(!s.model){const f=K(d,i.toDay);f&&(s.model=f,s.status="ready",b())}_+=1;const m=_;s.model||(s.status="loading",s.error="",b());try{const f={db:a.db,collectionFn:a.collectionFn,queryFn:a.queryFn,whereFn:a.whereFn,documentIdFn:a.documentIdFn,getDocsFn:a.getDocsFn,restaurantId:d},[v,p]=await Promise.allSettled([W({...f,fromDay:i.fromDay,toDay:i.toDay}),V(d)]);if(m!==_)return;if(v.status==="rejected")throw v.reason;p.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",p.reason),s.model=fe({days:v.value,todayKey:i.toDay,rawPosts:p.status==="fulfilled"?p.value:[]}),s.status="ready",s.error="",s.loadedSignature=h,U(d,s.model)}catch(f){if(m!==_)return;console.error("[mnyra][dashboard] load failed",f),s.model||(s.status="error",s.error="Bitte prüfe deine Verbindung und versuche es erneut.")}b()}function q(){$||!g||($=!0,g.addEventListener("click",r=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;r.target?.closest?.("[data-dashboard-retry]")&&S({force:!0})}catch{}}))}function J(r=""){const s=e?.userProfile||{},d=r?L(r)||{}:{},i=w(s),h=String(d.name||d.restaurantName||s.name||"").trim()||"Business";let m="";try{m=String(M()||"").trim()}catch{}if(!m)try{m=String(O(d)||"").trim()}catch{}return{name:h,logoUrl:m,kind:ee({businessType:i,isShopCatalog:I(s)})}}function G(){Z(g),q();const r=C(),s=B();let d="";if(!s)d=H()?`${de()}${z({kpiCount:6})}`:ce();else{const i=J(s),h=te({kind:i.kind,isOwner:A(e?.userProfile),canAccessOrders:E(e?.userProfile)}),m=ae(i.kind);r.status==="idle"&&(r.status="loading",queueMicrotask(()=>{S({force:!1})}));let y="";r.model?y=`
          ${oe({kpiDefs:m,week:r.model.week,today:r.model.today})}
          ${ie({posts:r.model.posts,iconFn:c})}
        `:r.status==="error"?y=le({message:r.error}):y=z({kpiCount:m.length}),d=`
        ${se({name:i.name,logoUrl:i.logoUrl,iconFn:c})}
        ${re({actions:h,iconFn:c})}
        ${y}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${d}
      </section>
    `}return Object.freeze({renderDashboardView:G,loadDashboard:S})}export{be as c};
