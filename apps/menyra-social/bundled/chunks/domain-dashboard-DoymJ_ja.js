import{f as x,r as Q,l as Y,s as T}from"./domain-analytics-BoLyB_-z.js";const F="mnyraDashboardStyles",W=`
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
`;function X(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(F)))try{const t=e.createElement("style");t.id=F,t.textContent=W,e.head?.appendChild(t)}catch{}}function u(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function P(e,t,o=""){if(typeof e!="function")return"";try{return e(t,o)||""}catch{return""}}const Z=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function ee({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const o=String(e||"").trim().toLowerCase();return Z.includes(o)?"hotel":"restaurant"}function te({kind:e="restaurant",isOwner:t=!1,canAccessOrders:o=!1}={}){const a=[{nav:"upload",uploadIntent:"chooser",iconName:"plus",label:"Neuer Beitrag",sub:"Posto foto ose video"},{nav:"upload",uploadIntent:"story",iconName:"camera",label:"Story",sub:"E dukshme 24h"}];return e==="hotel"?a.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?a.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):a.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),a.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),e!=="hotel"&&o&&a.push({nav:"orders",iconName:"shopping-cart",label:"Porosite",sub:"Hyrje & Status"}),a.push({nav:"analytics",iconName:"bar-chart-3",label:"Analytics",sub:"Te gjitha statistikat"}),t&&a.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),a.push({nav:"settings",iconName:"settings",label:"Einstellungen",sub:"Profil & Kontakt"}),a}function ae(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function I(e=0,t=""){const o=x(e);return t?`${o} ${t}`:o}function ne(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function se({name:e="",logoUrl:t="",hour:o=new Date().getHours(),iconFn:a}={}){const n=ne(o);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${u(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${P(a,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${u(e||"Business")}</p>
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
      <p class="mnyra-dash__kpi-value">${u(I(t?.[n.key]||0,n.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${u(I(o?.[n.key]||0,n.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function ie({posts:e=[],iconFn:t}={}){const o=Array.isArray(e)?e:[];let a="";return o.length?(a=o.map(n=>{const c=[n.dateLabel,`${x(n.likesCount||0)} Likes`,`${x(n.commentsCount||0)} Kommentare`];return Number(n.impressions||0)>0&&c.push(`${x(n.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${n.thumbUrl?`<img src="${u(n.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:P(t,n.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${u(n.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${u(c.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `}).join(""),a=`<div class="mnyra-dash__posts">${a}</div>`):a=`
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
      ${a}
    </div>
  `}function R({kpiCount:e=6}={}){return`
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
  `}function de(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function le({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${u(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function ce(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const ue="menyra_social_dashboard_cache_v1::",me=6,he=3;function D(e){const t=Number(e);return Number.isFinite(t)?t:0}function pe(e={}){const t=String(e.createdAtClient||"").trim();if(t){const a=new Date(t);if(!Number.isNaN(a.getTime()))return a}const o=e.createdAt;if(o&&typeof o.toDate=="function")try{const a=o.toDate();if(a instanceof Date&&!Number.isNaN(a.getTime()))return a}catch{}return null}function fe(e="",t={}){const o=Array.isArray(t.media)&&t.media.length?t.media[0]:{},a=String(o.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",n=String(o.thumbUrl||(a==="image"?o.url:"")||t.thumbUrl||"").trim(),c=pe(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:a,thumbUrl:n,likesCount:D(t.likesCount),commentsCount:D(t.commentsCount),impressions:0,dateLabel:c?c.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:c?c.getTime():0}}function ye({days:e=[],todayKey:t="",rawPosts:o=[]}={}){const a=Array.isArray(e)?e:[],n=T(a),c=a.find(l=>String(l?.date||l?.id||"").trim()===String(t||"").trim()),k=T(c?[c]:[]),g=n.merged?.posts&&typeof n.merged.posts=="object"?n.merged.posts:{},b=(Array.isArray(o)?o:[]).map(l=>fe(l?.id,l?.data||{})).filter(l=>l.id).sort((l,w)=>w.createdAtMs-l.createdAtMs).slice(0,he).map(l=>({...l,impressions:D(g[l.id]?.impressions)}));return{day:String(t||"").trim(),week:n.summary,today:k.summary,posts:b}}function be({state:e,renderFn:t,documentObj:o,firestoreApi:a={},profileApi:n={},iconFn:c,storageObj:k}={}){const g=o||(typeof document>"u"?null:document),b=typeof t=="function"?t:()=>{},l=k||(typeof localStorage>"u"?null:localStorage),w=typeof n.getBusinessProfileTypeFn=="function"?n.getBusinessProfileTypeFn:(()=>""),B=typeof n.isShopCatalogProfileFn=="function"?n.isShopCatalogProfileFn:(()=>!1),A=typeof n.isBusinessOwnerProfileFn=="function"?n.isBusinessOwnerProfileFn:(()=>!1),E=typeof n.canAccessRestaurantOrdersFn=="function"?n.canAccessRestaurantOrdersFn:(()=>!1),L=typeof n.getRestaurantMetaByIdFn=="function"?n.getRestaurantMetaByIdFn:(()=>null),O=typeof n.resolveRestaurantLogoFn=="function"?n.resolveRestaurantLogoFn:(()=>""),H=typeof n.resolveOwnAvatarUrlFn=="function"?n.resolveOwnAvatarUrlFn:(()=>"");let _=0,j=!1;function $(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function C(){const r=e?.userProfile||{};return String(r.restaurantId||r.staffRestaurantId||"").trim()}function M(){const r=String(e?.user?.uid||"").trim();if(!r)return!1;const s=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||s===r}function z(r=""){return`${ue}${r}`}function U(r="",s=""){if(!l||!r)return null;try{const d=l.getItem(z(r));if(!d)return null;const i=JSON.parse(d);return!i||typeof i!="object"||String(i.day||"").trim()!==String(s||"").trim()||!i.model||typeof i.model!="object"?null:i.model}catch{return null}}function K(r="",s=null){if(!(!l||!r||!s))try{l.setItem(z(r),JSON.stringify({day:s.day,model:s}))}catch{}}async function q(r=""){const{db:s,collectionFn:d,queryFn:i,orderByFn:h,limitFn:m,getDocsFn:f}=a;if(!s||typeof d!="function"||typeof i!="function"||typeof h!="function"||typeof m!="function"||typeof f!="function")return[];const y=d(s,"restaurants",r,"socialPosts");return(await f(i(y,h("createdAt","desc"),m(me)))).docs.map(p=>({id:p.id,data:p.data()||{}})).filter(p=>{const N=String(p.data.status||"active").trim().toLowerCase();return N!=="deleted"&&N!=="hidden"})}async function S({force:r=!1}={}){const s=$(),d=C();if(!d)return;const i=Q({rangeKey:"7d"});if(!i)return;const h=`${d}::${i.toDay}`;if(!r&&s.loadedSignature===h&&s.status==="ready")return;if(!s.model){const y=U(d,i.toDay);y&&(s.model=y,s.status="ready",b())}_+=1;const m=_;s.model||(s.status="loading",s.error="",b());try{const y={db:a.db,collectionFn:a.collectionFn,queryFn:a.queryFn,whereFn:a.whereFn,documentIdFn:a.documentIdFn,getDocsFn:a.getDocsFn,restaurantId:d},[v,p]=await Promise.allSettled([Y({...y,fromDay:i.fromDay,toDay:i.toDay}),q(d)]);if(m!==_)return;if(v.status==="rejected")throw v.reason;p.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",p.reason),s.model=ye({days:v.value,todayKey:i.toDay,rawPosts:p.status==="fulfilled"?p.value:[]}),s.status="ready",s.error="",s.loadedSignature=h,K(d,s.model)}catch(y){if(m!==_)return;console.error("[mnyra][dashboard] load failed",y),s.model||(s.status="error",s.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}b()}function V(){j||!g||(j=!0,g.addEventListener("click",r=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;r.target?.closest?.("[data-dashboard-retry]")&&S({force:!0})}catch{}}))}function J(r=""){const s=e?.userProfile||{},d=r?L(r)||{}:{},i=w(s),h=String(d.name||d.restaurantName||s.name||"").trim()||"Business";let m="";try{m=String(H()||"").trim()}catch{}if(!m)try{m=String(O(d)||"").trim()}catch{}return{name:h,logoUrl:m,kind:ee({businessType:i,isShopCatalog:B(s)})}}function G(){X(g),V();const r=$(),s=C();let d="";if(!s)d=M()?`${de()}${R({kpiCount:6})}`:ce();else{const i=J(s),h=te({kind:i.kind,isOwner:A(e?.userProfile),canAccessOrders:E(e?.userProfile)}),m=ae(i.kind);r.status==="idle"&&(r.status="loading",queueMicrotask(()=>{S({force:!1})}));let f="";r.model?f=`
          ${oe({kpiDefs:m,week:r.model.week,today:r.model.today})}
          ${ie({posts:r.model.posts,iconFn:c})}
        `:r.status==="error"?f=le({message:r.error}):f=R({kpiCount:m.length}),d=`
        ${se({name:i.name,logoUrl:i.logoUrl,iconFn:c})}
        ${re({actions:h,iconFn:c})}
        ${f}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${d}
      </section>
    `}return Object.freeze({renderDashboardView:G,loadDashboard:S})}export{be as c};
