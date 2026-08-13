const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-RjctPFNW.js","chunks/domain-feed-social-eager-BSI8B10T.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-The90jz8.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as ge}from"./domain-auth-Aq-4Vdvh.js";import{f as B,r as ye,l as be,s as V}from"./domain-analytics-jv5B-kA2.js";const _e=20,ve=8;function g(e=""){return e==null?"":String(e).trim()}function T(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function ke(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),i=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${i}`}function xe(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],g(t.imageUrl??t.image??t.photoUrl)],i=[];return a.forEach(o=>{const l=g(o);l&&!i.includes(l)&&i.push(l)}),i.slice(0,ve)}function we(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},i=T(a.persons??a.guests??a.capacity),o=T(a.size??a.sizeSqm??a.area),l=xe(a);return{id:g(a.id)||ke(Date.now()+t),title:g(a.title??a.name),description:g(a.description??a.text).slice(0,400),imageUrl:l[0]||"",images:l,price:T(a.price??a.pricePerNight),currency:g(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:i==null?null:Math.min(20,Math.round(i)),beds:g(a.beds??a.bedsLabel).slice(0,60),size:o==null?null:Math.min(500,Math.round(o)),tag:g(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function Se(e=[]){return(Array.isArray(e)?e:[]).slice(0,_e).map((t,a)=>we(t,{index:a}))}function Pe(e={}){return Se((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function Ye(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),g(e?.beds)&&t.push({icon:"bed",label:g(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Ze(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=g(e?.currency).toUpperCase()||"EUR",i=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${i}`:`${i} ${a}`}const q="mnyraDashboardStyles",Fe=`
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
  /* Die schwarze Posting-Karte. Eigene Marken statt roher Farbwerte, damit
     Flaeche und Schrift darauf an einer Stelle stimmen - auf Schwarz traegt
     weder das Panel-Indigo noch das Panel-Grau genug Kontrast. */
  --dash-black: #0f172a;
  --dash-black-ink: #ffffff;
  --dash-black-muted: #94a3b8;
  --dash-black-accent: #a5b4fc;
  --dash-black-hairline: rgba(255, 255, 255, 0.14);
  --dash-black-ring: rgba(255, 255, 255, 0.2);
  /* Das Bento unter der Karte: nur oben gerundet, weil es bis an die
     Panel-Raender und bis ans Seitenende laeuft. Dieselbe Rundung wie das
     Bento des Feed-Gates (--feed-location-gate-bento-radius: 2.5rem), damit
     beide Flaechen in der App gleich anfangen. Der Auslauf ist genau das
     untere Polster von .mnyra-dash: so endet die Flaeche mit der Seite.
     Die Faecher darin sind etwas kleiner gerundet als die Karte darueber,
     damit sie als Inhalt der Flaeche lesen und nicht als Karten darauf. */
  --dash-bento-radius: 40px;
  --dash-bento-tail: 112px;
  --dash-bento-cell-radius: 20px;
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
  background: var(--dash-black);
  /* Rand in der Flaechenfarbe - ausdruecklich gesetzt, weil die Karte ein
     <button> ist und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-black);
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
  color: var(--dash-black-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.mnyra-dash__composer--tap:active { transform: scale(0.99); }
/* Groesse und Gewicht der Ueberschrift bleiben unveraendert, nur die Farbe
   traegt jetzt die schwarze Flaeche. Als Kind eines <button> steht sie in
   einem <span> - der braucht die Blockform ausdruecklich. */
.mnyra-dash__composer-title {
  display: block;
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--dash-black-ink);
}
.mnyra-dash__composer-accent { color: var(--dash-black-accent); }
/* Untertitel: dasselbe Grau wie im Panel, auf Schwarz noch gut lesbar. */
.mnyra-dash__composer-sub {
  display: block;
  margin: 5px 0 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--dash-black-muted);
}
/* Die Aktionszeile der grossen Karte: eine Haarlinie trennt sie vom Text,
   darunter das Plus im Kreis, die Beschriftung und rechtsbuendig der Pfeil.
   Kein zweiter Knopf - die Karte selbst nimmt den Tipp an. */
.mnyra-dash__composer-cta {
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid var(--dash-black-hairline);
  display: flex;
  align-items: center;
  gap: 10px;
}
.mnyra-dash__composer-cta-icon {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--dash-black-ring);
  background: transparent;
  color: var(--dash-black-accent);
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
  color: var(--dash-black-accent);
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
  color: var(--dash-black-muted);
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
/* Das Bento: eine helle Flaeche unter der schwarzen Karte. Sie traegt alles,
   was unter der Karte kommt - Schnellzugriffe, Kennzahlen, letzte Beitraege -
   und laeuft dabei bis ans Ende der Seite.
   Die negative Marge ist genau das Seitenpolster von .mnyra-dash: so reicht
   die Flaeche bis an die Panel-Raender, waehrend ihr Inhalt in der Flucht der
   Karte darueber bleibt. Weil sie an den Raendern endet und unten weiterlaeuft,
   sind nur die oberen Ecken gerundet - in derselben Rundung wie das Bento des
   Feed-Gates. */
.mnyra-dash__bento {
  margin: 34px -28px calc(-1 * var(--dash-bento-tail));
  padding: 22px 28px var(--dash-bento-tail);
  background: var(--dash-surface);
  border-top: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-radius) var(--dash-bento-radius) 0 0;
}
/* Die Abschnitte im Bento haben untereinander etwas mehr Luft als zwei Karten
   auf dem Panel-Hintergrund - sonst kleben Kennzahlen und Beitraege an den
   Schnellzugriffen darueber. */
.mnyra-dash__bento > .mnyra-dash__section { margin-top: 22px; }
.mnyra-dash__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
@media (min-width: 720px) { .mnyra-dash__actions { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
/* Faecher des Bentos: ruhige Flaeche statt eigener Karte, damit sie als
   Inhalt der Bento-Flaeche lesen und nicht als Karten darauf. */
.mnyra-dash__action {
  background: var(--dash-plane);
  /* Rand ausdruecklich gesetzt, weil die Faecher <button> sind und der
     Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
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
  gap: 8px;
}
@media (min-width: 720px) { .mnyra-dash__kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
/* Faecher des Bentos - dieselbe ruhige Flaeche und Rundung wie die
   Schnellzugriffe. Weiss auf Weiss waere in der Bento-Flaeche nicht zu sehen. */
.mnyra-dash__kpi {
  background: var(--dash-plane);
  /* Rand ausdruecklich gesetzt, weil die Kacheln <button> sind und der
     Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
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
/* Auch die Beitragsliste ist ein Fach des Bentos. */
.mnyra-dash__posts {
  background: var(--dash-plane);
  /* Rand ausdruecklich gesetzt, weil die Kacheln <button> sind und der
     Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
  padding: 6px;
}
.mnyra-dash__post {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  min-height: 64px;
  /* Auf der ruhigen Flaeche des Fachs trennt die Haarlinie, nicht die
     Flaeche selbst - die haette dort keinen Kontrast mehr. */
  border-bottom: 1px solid var(--dash-hairline);
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
  border-radius: var(--dash-bento-cell-radius);
  background: var(--dash-plane);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  border: 1px solid transparent;
}
@keyframes mnyraDashPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
`;function ze(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(q)))try{const t=e.createElement("style");t.id=q,t.textContent=Fe,e.head?.appendChild(t)}catch{}}function p(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function P(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const Ce=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function De({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return Ce.includes(a)?"hotel":"restaurant"}function Re({kind:e="restaurant",isOwner:t=!1}={}){const a=[];return e==="hotel"?a.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?a.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):a.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),a.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),t&&a.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),a.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),a}function je(e="restaurant"){const t=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?t.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):t.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function G(e=0,t=""){const a=B(e);return t?`${a} ${t}`:a}function Be(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function $e({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:i}={}){const o=Be(a);return`
    <div class="mnyra-dash__greet">
      <div class="mnyra-dash__greet-logo">
        ${t?`<img src="${p(t)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback">${P(i,"store","w-6 h-6")}</span>`}
      </div>
      <div class="mnyra-dash__greet-text">
        <p class="mnyra-dash__greet-title"><span class="mnyra-dash__greet-hello">Përshëndetje,</span> ${p(e||"Business")}</p>
        <p class="mnyra-dash__greet-sub">${p(o.text)}</p>
      </div>
    </div>
  `}function Ie({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Ee({actions:e=[],iconFn:t}={}){return`<div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(i=>`
      <button type="button" class="mnyra-dash__action" data-nav="${p(i.nav)}">
        <span class="mnyra-dash__action-icon">${P(t,i.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${p(i.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${p(i.sub||"")}</span>
        </span>
      </button>
    `).join("")}</div>`}function Te(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function Ke({kpiDefs:e=[],week:t={},today:a={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(o=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${p(o.label)}</p>
      <p class="mnyra-dash__kpi-value">${p(G(t?.[o.key]||0,o.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${p(G(a?.[o.key]||0,o.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function Ne({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let i="";return a.length?(i=a.map(o=>{const l=[o.dateLabel,`${B(o.likesCount||0)} Likes`,`${B(o.commentsCount||0)} Kommentare`];return Number(o.impressions||0)>0&&l.push(`${B(o.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${o.thumbUrl?`<img src="${p(o.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:P(t,o.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${p(o.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${p(l.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `}).join(""),i=`<div class="mnyra-dash__posts">${i}</div>`):i=`
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
      ${i}
    </div>
  `}function J({kpiCount:e=6}={}){return`
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
  `}function Me(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Le({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${p(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Oe(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Ue="menyra_social_dashboard_cache_v1::",Q="menyra_social_composer_products_v1::",He=2500,Ae=1200,Ve=6,qe=3;function K(e){const t=Number(e);return Number.isFinite(t)?t:0}function Ge(e={}){const t=String(e.createdAtClient||"").trim();if(t){const i=new Date(t);if(!Number.isNaN(i.getTime()))return i}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const i=a.toDate();if(i instanceof Date&&!Number.isNaN(i.getTime()))return i}catch{}return null}function Je(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},i=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",o=String(a.thumbUrl||(i==="image"?a.url:"")||t.thumbUrl||"").trim(),l=Ge(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:i,thumbUrl:o,likesCount:K(t.likesCount),commentsCount:K(t.commentsCount),impressions:0,dateLabel:l?l.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:l?l.getTime():0}}function Qe({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const i=Array.isArray(e)?e:[],o=V(i),l=i.find(u=>String(u?.date||u?.id||"").trim()===String(t||"").trim()),b=V(l?[l]:[]),$=o.merged?.posts&&typeof o.merged.posts=="object"?o.merged.posts:{},_=(Array.isArray(a)?a:[]).map(u=>Je(u?.id,u?.data||{})).filter(u=>u.id).sort((u,S)=>S.createdAtMs-u.createdAtMs).slice(0,qe).map(u=>({...u,impressions:K($[u.id]?.impressions)}));return{day:String(t||"").trim(),week:o.summary,today:b.summary,posts:_}}function et({state:e,renderFn:t,documentObj:a,firestoreApi:i={},profileApi:o={},composerApi:l={},iconFn:b,storageObj:$}={}){const _=a||(typeof document>"u"?null:document),u=_?.defaultView||(typeof window>"u"?null:window),S=typeof t=="function"?t:()=>{},v=$||(typeof localStorage>"u"?null:localStorage),W=typeof o.getBusinessProfileTypeFn=="function"?o.getBusinessProfileTypeFn:(()=>""),X=typeof o.isShopCatalogProfileFn=="function"?o.isShopCatalogProfileFn:(()=>!1),Y=typeof o.isBusinessOwnerProfileFn=="function"?o.isBusinessOwnerProfileFn:(()=>!1),I=typeof o.getRestaurantMetaByIdFn=="function"?o.getRestaurantMetaByIdFn:(()=>null),Z=typeof o.resolveRestaurantLogoFn=="function"?o.resolveRestaurantLogoFn:(()=>""),ee=typeof o.resolveOwnAvatarUrlFn=="function"?o.resolveOwnAvatarUrlFn:(()=>"");let F=0,N=!1,k=null,z=null,C="",M=!1,L=()=>null;const te=300;function E(){const n=e?.userProfile||{};return De({businessType:W(n),isShopCatalog:X(n)})}function ae(n=""){const r=I(n)||{};return Pe(r).map(s=>({id:s.id,name:s.title,price:s.price??"",category:s.beds||s.tag||"",type:"room",imageUrl:s.imageUrl||""}))}function ne(n=""){if(!v)return null;try{const r=v.getItem(`${Q}${n}`);if(!r)return null;const s=JSON.parse(r),d=Array.isArray(s?.items)?s.items:null;return d&&d.length?d:null}catch{return null}}function re(n="",r=[]){if(v)try{v.setItem(`${Q}${n}`,JSON.stringify({savedAt:Date.now(),items:r}))}catch{}}async function se(n=""){const{db:r,collectionFn:s,queryFn:d,limitFn:c,getDocsFn:h}=i;if(!r||typeof s!="function"||typeof h!="function")throw new Error("Produktet nuk u ngarkuan.");const f=s(r,"restaurants",n,"menuItems"),y=typeof d=="function"&&typeof c=="function"?d(f,c(te)):f,w=await h(y),m=[];return w.forEach(x=>{const j=L(x?.id,x?.data?.()||{});j&&m.push(j)}),m.sort((x,j)=>x.name.localeCompare(j.name,"sq")),m}async function ie(n="",r){const s=String(n||"").trim();if(!s)throw new Error("Produktet nuk u ngarkuan.");if(E()==="hotel")return ae(s);const d=se(s).then(h=>(re(s,h),h)),c=ne(s);return c?(typeof r=="function"?d.then(h=>r(h)).catch(()=>{}):d.catch(()=>{}),c):d}function O(){return k?Promise.resolve(k):(z||(z=ge(()=>import("./business-composer-controller-RjctPFNW.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(n=>(L=typeof n?.normalizeComposerProductCore=="function"?n.normalizeComposerProductCore:(()=>null),k=n.createBusinessComposerController({documentObj:_,windowObj:_?.defaultView||null,api:{getRestaurantIdFn:()=>D(),getBusinessMetaFn:()=>{const r=D();if(!r)return{name:"",logoUrl:"",city:""};const s=A(r),d=I(r)||{};return{name:s.name,logoUrl:s.logoUrl,city:String(d.city||"").trim()}},loadProductsFn:(r,s)=>ie(r,s),getBusinessKindFn:()=>E(),uploadImageFn:l.uploadImageFn,uploadVideoFn:l.uploadVideoFn,captureVideoPosterFn:l.captureVideoPosterFn,createPostFn:l.createPostFn,createStoryFn:l.createStoryFn,formatPriceFn:l.formatPriceFn,getOptimizedImageUrlFn:l.getOptimizedImageUrlFn,escapeHtmlFn:l.escapeHtmlFn,iconFn:typeof b=="function"?b:void 0,afterPublishFn:async r=>{try{await R({force:!0})}catch{}typeof l.afterPublishFn=="function"&&await l.afterPublishFn(r)}}}),k)).catch(n=>{throw z=null,console.error("[mnyra][dashboard] composer load failed",n),n})),z)}function oe(){const n=u?.navigator?.connection;return!n||typeof n!="object"?!1:n.saveData===!0?!0:/(^|-)2g$/.test(String(n.effectiveType||"").trim().toLowerCase())}function de(){if(M||k||!u||oe())return;M=!0;const n=()=>{if(O().catch(()=>{}),typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}};if(typeof u.requestIdleCallback=="function"){u.requestIdleCallback(n,{timeout:He});return}u.setTimeout?.(n,Ae)}function le(n="post"){const r=String(n||"").trim().toLowerCase(),s=r==="story"||r==="profile"?r:"post";if(typeof l.prewarmFn=="function")try{l.prewarmFn()}catch{}if(k){k.open(s);return}C=s,O().then(d=>{const c=C||s;C="",d?.open?.(c)}).catch(()=>{C=""})}function U(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:""}),e.dashboardView}function D(){const n=e?.userProfile||{};return String(n.restaurantId||n.staffRestaurantId||"").trim()}function ce(){const n=String(e?.user?.uid||"").trim();if(!n)return!1;const r=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||r===n}function H(n=""){return`${Ue}${n}`}function ue(n="",r=""){if(!v||!n)return null;try{const s=v.getItem(H(n));if(!s)return null;const d=JSON.parse(s);return!d||typeof d!="object"||String(d.day||"").trim()!==String(r||"").trim()||!d.model||typeof d.model!="object"?null:d.model}catch{return null}}function he(n="",r=null){if(!(!v||!n||!r))try{v.setItem(H(n),JSON.stringify({day:r.day,model:r}))}catch{}}async function me(n=""){const{db:r,collectionFn:s,queryFn:d,orderByFn:c,limitFn:h,getDocsFn:f}=i;if(!r||typeof s!="function"||typeof d!="function"||typeof c!="function"||typeof h!="function"||typeof f!="function")return[];const y=s(r,"restaurants",n,"socialPosts");return(await f(d(y,c("createdAt","desc"),h(Ve)))).docs.map(m=>({id:m.id,data:m.data()||{}})).filter(m=>{const x=String(m.data.status||"active").trim().toLowerCase();return x!=="deleted"&&x!=="hidden"})}async function R({force:n=!1}={}){const r=U(),s=D();if(!s)return;const d=ye({rangeKey:"7d"});if(!d)return;const c=`${s}::${d.toDay}`;if(!n&&r.loadedSignature===c&&r.status==="ready")return;if(!r.model){const y=ue(s,d.toDay);y&&(r.model=y,r.status="ready",S())}F+=1;const h=F;r.model||(r.status="loading",r.error="",S());try{const y={db:i.db,collectionFn:i.collectionFn,queryFn:i.queryFn,whereFn:i.whereFn,documentIdFn:i.documentIdFn,getDocsFn:i.getDocsFn,restaurantId:s},[w,m]=await Promise.allSettled([be({...y,fromDay:d.fromDay,toDay:d.toDay}),me(s)]);if(h!==F)return;if(w.status==="rejected")throw w.reason;m.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",m.reason),r.model=Qe({days:w.value,todayKey:d.toDay,rawPosts:m.status==="fulfilled"?m.value:[]}),r.status="ready",r.error="",r.loadedSignature=c,he(s,r.model)}catch(y){if(h!==F)return;console.error("[mnyra][dashboard] load failed",y),r.model||(r.status="error",r.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}S()}function pe(){N||!_||(N=!0,_.addEventListener("click",n=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(n.target?.closest?.("[data-dashboard-retry]")){R({force:!0});return}const r=n.target?.closest?.("[data-dashboard-composer]");r&&(n.preventDefault(),le(r.getAttribute("data-dashboard-composer")))}catch{}}))}function A(n=""){const r=e?.userProfile||{},s=n?I(n)||{}:{},d=String(s.name||s.restaurantName||r.name||"").trim()||"Business";let c="";try{c=String(ee()||"").trim()}catch{}if(!c)try{c=String(Z(s)||"").trim()}catch{}return{name:d,logoUrl:c,kind:E()}}function fe(){ze(_),pe();const n=U(),r=D();let s="";if(!r)s=ce()?`${Me()}${J({kpiCount:6})}`:Oe();else{de();const d=A(r),c=Re({kind:d.kind,isOwner:Y(e?.userProfile)}),h=je(d.kind);n.status==="idle"&&(n.status="loading",queueMicrotask(()=>{R({force:!1})}));let f="";n.model?f=`
          ${Ke({kpiDefs:h,week:n.model.week,today:n.model.today})}
          ${Ne({posts:n.model.posts,iconFn:b})}
        `:n.status==="error"?f=Le({message:n.error}):f=J({kpiCount:h.length}),s=`
        ${$e({name:d.name,logoUrl:d.logoUrl,iconFn:b})}
        ${Ie({iconFn:b})}
        ${Te(`
          ${Ee({actions:c,iconFn:b})}
          ${f}
        `)}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${s}
      </section>
    `}return Object.freeze({renderDashboardView:fe,loadDashboard:R})}export{ve as M,et as a,Pe as b,ke as c,Ye as d,Ze as f,Se as n};
