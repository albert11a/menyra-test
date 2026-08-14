const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-BAi2hY3z.js","chunks/domain-feed-social-eager-BMs99r7t.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-7N8GJu5d.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as fe}from"./domain-auth-Aq-4Vdvh.js";import{f as P,r as be,l as ye,s as V}from"./domain-analytics-jv5B-kA2.js";const _e=20,ve=8;function w(e=""){return e==null?"":String(e).trim()}function E(e){if(e==null||e==="")return null;const a=Number(String(e).replace(",","."));return Number.isFinite(a)&&a>0?a:null}function ke(e=Date.now(),a=Math.random()){const t=Math.max(0,Number(e)||0).toString(36),s=Math.floor(Math.max(0,Math.min(.999999,Number(a)||0))*36**6).toString(36).padStart(6,"0");return`room_${t}_${s}`}function we(e={}){const a=e&&typeof e=="object"?e:{},t=[...Array.isArray(a.images)?a.images:[],w(a.imageUrl??a.image??a.photoUrl)],s=[];return t.forEach(r=>{const d=w(r);d&&!s.includes(d)&&s.push(d)}),s.slice(0,ve)}function xe(e={},{index:a=0}={}){const t=e&&typeof e=="object"?e:{},s=E(t.persons??t.guests??t.capacity),r=E(t.size??t.sizeSqm??t.area),d=we(t);return{id:w(t.id)||ke(Date.now()+a),title:w(t.title??t.name),description:w(t.description??t.text).slice(0,400),imageUrl:d[0]||"",images:d,price:E(t.price??t.pricePerNight),currency:w(t.currency??t.currencyCode).toUpperCase()||"EUR",persons:s==null?null:Math.min(20,Math.round(s)),beds:w(t.beds??t.bedsLabel).slice(0,60),size:r==null?null:Math.min(500,Math.round(r)),tag:w(t.tag??t.badge).slice(0,40),active:t.active!==!1}}function Se(e=[]){return(Array.isArray(e)?e:[]).slice(0,_e).map((a,t)=>xe(a,{index:t}))}function Pe(e={}){return Se((e&&typeof e=="object"?e:{}).hotelRooms).filter(t=>t.title)}function oa(e={}){const a=[];return Number.isFinite(e?.persons)&&e.persons>0&&a.push({icon:"users",label:`${e.persons} persona`}),w(e?.beds)&&a.push({icon:"bed",label:w(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&a.push({icon:"size",label:`${e.size} m²`}),a}function da(e={}){const a=Number(e?.price);if(!Number.isFinite(a)||a<=0)return"";const t=w(e?.currency).toUpperCase()||"EUR",s=Number.isInteger(a)?String(a):a.toFixed(2);return t==="EUR"?`€${s}`:`${s} ${t}`}const q="mnyraDashboardStyles",ze=`
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
  /* Die obere Kante des Bentos traegt denselben weichen Schatten wie der
     Header - nach oben gedreht, weil die Flaeche hier von unten kommt. */
  --dash-bento-shadow: 0 -18px 34px -18px rgb(15 23 42 / 0.2);
  color: var(--dash-ink);
  font-family: inherit;
}
.mnyra-dash * { box-sizing: border-box; }
/* Die Begruessung steht wie die Stadt-Ueberschrift im Feed: eine fette Zeile,
   darunter dicht die graue Unterzeile. Deshalb ein Stapel, keine Zeile mit
   Bild links - das Logo sitzt jetzt IN der ersten Zeile. */
.mnyra-dash__greet {
  min-height: 44px;
  margin: 4px 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* Das Logo steht so gross wie das Wort daneben - flach in der Seite, nur mit
   abgerundeten Ecken. Kein Indigo-Lila-Ring mehr, kein Schatten: mit Rahmen
   stand das Bild vor der Seite statt darin. Die Haarlinie bleibt, damit ein
   weisses Logo nicht randlos in die weisse Seite laeuft. */
.mnyra-dash__greet-logo {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
}
.mnyra-dash__greet-logo img,
.mnyra-dash__greet-logo-fallback {
  width: 100%;
  height: 100%;
  border-radius: 7px;
  border: 1px solid var(--dash-hairline);
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
.mnyra-dash__greet-logo-fallback svg,
.mnyra-dash__greet-logo-fallback i {
  width: 13px;
  height: 13px;
  display: block;
}
/* Genau die Ueberschrift der Stadt im Feed: text-xl, font-black,
   tracking-tight, slate-900. */
.mnyra-dash__greet-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin: 0;
  color: var(--dash-ink);
}
/* Dieselbe Farbe wie die Ueberschrift, in der sie steht. */
.mnyra-dash__greet-hello { color: var(--dash-ink); }
/* Und die Unterzeile genau wie unter der Stadt: 11px, halbfett, slate-400,
   dicht an der Zeile darueber. */
.mnyra-dash__greet-sub {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  margin: 2px 0 0;
  color: var(--dash-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Die Kennzahl-Reihe unter der Begruessung - dieselbe Machart wie die
   Highlight-Karten der Lokale-Seite: eine waagerechte Reihe, die bis an beide
   Bildschirmraender laeuft, aber links dort anfaengt, wo auch alles andere im
   Panel anfaengt.
   Die negative Marge ist genau das Seitenpolster von .mnyra-dash, das Polster
   darin schiebt die erste Karte wieder in die Flucht. So laeuft die Reihe unter
   den Rand hinaus, ohne dass die erste Karte springt.
   Die 34px Abstand zur Begruessung sind dieselben, die vorher die schwarze
   Karte hier hatte (16px Aussenmarge der Begruessung + 18px). */
.mnyra-dash__hl {
  margin: 18px -28px 0;
  padding: 0 28px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 28px;
  overscroll-behavior-x: contain;
  /* Wie in der Spots-Reihe im Feed: der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen auf der Reihe verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mnyra-dash__hl::-webkit-scrollbar { display: none; }
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+28px Polster), abzueglich der beiden
   Luecken zwischen den drei angeschnittenen Karten. */
.mnyra-dash__hl-card {
  flex: 0 0 calc((100% + 28px - 20px) / 2.5);
  height: 208px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
  background: var(--dash-black);
  padding: 0;
  scroll-snap-align: start;
  cursor: pointer;
  text-align: left;
  font: inherit;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.mnyra-dash__hl-card:active { transform: scale(0.98); }
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.mnyra-dash__hl-tail { flex: 0 0 18px; }
.mnyra-dash__hl-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* Die Flaeche unter dem Bild: sie traegt die Karte, wenn ein Bild fehlt oder
   nicht laedt - dann steht hier statt eines Lochs ein ruhiger Verlauf. */
.mnyra-dash__hl-plate {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, #1f2937 0%, #0f172a 60%, #020617 100%);
  color: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-dash__hl-plate svg,
.mnyra-dash__hl-plate i { width: 26px; height: 26px; display: block; }
/* Genau der Verlauf der Lokal-Karten im Feed. */
.mnyra-dash__hl-fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0) 100%);
}
.mnyra-dash__hl-body {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 2;
}
.mnyra-dash__hl-label {
  display: block;
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: rgba(255, 255, 255, 0.82);
}
.mnyra-dash__hl-value {
  display: block;
  margin: 3px 0 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: #ffffff;
}
/* Der Platzhalter steht genau dort und genau so hoch wie die Zahl, die gleich
   kommt: zwischen Laden und Zahl springt nichts. */
.mnyra-dash__hl-value--pending {
  width: 54px;
  height: 23px;
  margin-top: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
}
/* Verschlossene Karte: das Bild steht unscharf dahinter, die Zahl bleibt weg.
   Der Massstab ueberdeckt die weichen Raender, die das Weichzeichnen sonst an
   den Kanten der Karte zeigt. */
.mnyra-dash__hl-card--locked .mnyra-dash__hl-media,
.mnyra-dash__hl-card--locked .mnyra-dash__hl-plate {
  filter: blur(9px);
  transform: scale(1.18);
}
.mnyra-dash__hl-lock {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 4px 0 0;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.32);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #ffffff;
}
.mnyra-dash__hl-lock svg,
.mnyra-dash__hl-lock i { width: 11px; height: 11px; display: block; }
/* Die Karte, die auf ihr Bild wartet (der beste Beitrag): dieselbe Flaeche und
   Rundung wie die fertige Karte, damit beim Eintreffen nichts springt. */
.mnyra-dash__hl-card--pending {
  background: var(--dash-plane);
  border-color: var(--dash-hairline);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  cursor: default;
}
/* "Posto n'Zbulo": erste Karte im Bento. Ueberschrift, Untertitel, darunter
   die Aktionszeile mit dem Plus. */
.mnyra-dash__composer {
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
  /* Plus und Beschriftung stehen weiss auf der schwarzen Karte - das Indigo
     der Ueberschrift traegt hier unten zu wenig. */
  color: var(--dash-black-ink);
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
  color: var(--dash-black-ink);
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
  margin: 56px -28px calc(-1 * var(--dash-bento-tail));
  padding: 22px 28px var(--dash-bento-tail);
  background: var(--dash-surface);
  border-top: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-radius) var(--dash-bento-radius) 0 0;
  /* Dieselbe weiche Kante wie unter dem Header, nur nach oben gedreht: die
     Flaeche beginnt sichtbar, statt an der Haarlinie einfach umzuschlagen.
     Es ist der Schatten, den auch das Bento der Lokale-Seite traegt. */
  box-shadow: var(--dash-bento-shadow);
}
/* Alles im Bento haelt denselben Abstand zum Stueck darueber: die
   Posting-Karte steht als erstes und braucht keinen (das Polster des Bentos
   ist ihr Abstand nach oben), alles danach rueckt gleich weit nach. */
.mnyra-dash__bento > .mnyra-dash__section,
.mnyra-dash__bento > .mnyra-dash__actions { margin-top: 22px; }
.mnyra-dash__bento > .mnyra-dash__composer { margin-top: 0; }
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
/* Der Hinweis hinter den verschlossenen Karten. Bewusst schlicht gehalten -
   die Gestaltung kommt spaeter; was hier steht, ist nur der Weg dorthin. */
.mnyra-dash__paywall {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.55);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
.mnyra-dash__paywall-card {
  width: 100%;
  max-width: 320px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 22px;
  text-align: center;
}
.mnyra-dash__paywall-title { font-size: 15px; font-weight: 900; color: var(--dash-ink); margin: 0 0 6px; }
.mnyra-dash__paywall-body { font-size: 12px; font-weight: 600; line-height: 1.6; color: var(--dash-ink-2); margin: 0 0 16px; }
/* Der Platzhalter beim Laden steht dort, wo gleich eine Karte steht - gleiche
   Rundung, damit beim Erscheinen nichts springt. */
.mnyra-dash__skeleton {
  border-radius: var(--dash-bento-cell-radius);
  background: var(--dash-plane);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  border: 1px solid transparent;
}
@keyframes mnyraDashPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
`;function De(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(q)))try{const a=e.createElement("style");a.id=q,a.textContent=ze,e.head?.appendChild(a)}catch{}}function c(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function F(e,a,t=""){if(typeof e!="function")return"";try{return e(a,t)||""}catch{return""}}const Fe=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Ce({businessType:e="",isShopCatalog:a=!1}={}){if(a)return"shop";const t=String(e||"").trim().toLowerCase();return Fe.includes(t)?"hotel":"restaurant"}function Re({kind:e="restaurant",isOwner:a=!1}={}){const t=[];return e==="hotel"?t.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?t.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):t.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),t.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),a&&t.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),t.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),t}function $e(e="restaurant"){const a=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?a.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?a.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):a.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function G(e=0,a=""){const t=P(e);return a?`${t} ${a}`:t}function Be(e=new Date().getHours()){const a=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return a>=5&&a<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:a>=11&&a<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:a>=18&&a<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function je({name:e="",logoUrl:a="",hour:t=new Date().getHours(),iconFn:s}={}){const r=Be(t),d=c(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${a?`<img src="${c(a)}" alt="${d}" title="${d}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${d}">${F(s,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${c(r.text)}</p>
    </div>
  `}function Ke({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${F(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${F(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Ie({actions:e=[],iconFn:a}={}){return`<div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(s=>`
      <button type="button" class="mnyra-dash__action" data-nav="${c(s.nav)}">
        <span class="mnyra-dash__action-icon">${F(a,s.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${c(s.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${c(s.sub||"")}</span>
        </span>
      </button>
    `).join("")}</div>`}function Ue({cards:e=[],iconFn:a}={}){const t=(Array.isArray(e)?e:[]).filter(r=>r&&r.key);return t.length?`
    <div class="mnyra-dash__hl" data-dashboard-metrics>
      ${t.map((r,d)=>{const m=c(r.label||"");if(r.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const _=d<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',v=`
      <span class="mnyra-dash__hl-plate">${F(a,r.iconName||"image","w-6 h-6")}</span>
      ${r.imageUrl?`<img class="mnyra-dash__hl-media" src="${c(r.imageUrl)}" alt="" ${_} decoding="async" onerror="this.style.display='none'" />`:""}
    `,x=r.locked?`<span class="mnyra-dash__hl-lock">${F(a,"lock","w-3 h-3")}Me pagesë</span>`:r.loading?'<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':`<span class="mnyra-dash__hl-value">${c(r.value||"0")}</span>`,h=r.locked?`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${c(r.key)}"`:`class="mnyra-dash__hl-card"${r.nav?` data-nav="${c(r.nav)}"`:""}`,b=r.locked?`${m} – me pagesë`:`${m} ${r.value||""}`.trim();return`
      <button type="button" ${h} data-dashboard-metric="${c(r.key)}" aria-label="${c(b)}">
        ${v}
        <span class="mnyra-dash__hl-fade"></span>
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${m}</span>
          ${x}
        </span>
      </button>
    `}).join("")}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `:""}function Me(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function Ee({kpiDefs:e=[],week:a={},today:t={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(r=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${c(r.label)}</p>
      <p class="mnyra-dash__kpi-value">${c(G(a?.[r.key]||0,r.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${c(G(t?.[r.key]||0,r.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function Ne({posts:e=[],iconFn:a}={}){const t=Array.isArray(e)?e:[];let s="";return t.length?(s=t.map(r=>{const d=[r.dateLabel,`${P(r.likesCount||0)} Likes`,`${P(r.commentsCount||0)} Kommentare`];return Number(r.impressions||0)>0&&d.push(`${P(r.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${r.thumbUrl?`<img src="${c(r.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:F(a,r.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${c(r.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${c(d.filter(Boolean).join(" · "))}</p>
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
  `}function Te({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${c(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function Le(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Ae({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${c(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function Oe(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const He="menyra_social_dashboard_cache_v1::",W="menyra_social_composer_products_v1::",Ve=2500,qe=1200,Ge=6,Je=3,We=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),Ze=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function f(e){const a=Number(e);return Number.isFinite(a)?a:0}function Qe(e={}){const a=String(e.createdAtClient||"").trim();if(a){const s=new Date(a);if(!Number.isNaN(s.getTime()))return s}const t=e.createdAt;if(t&&typeof t.toDate=="function")try{const s=t.toDate();if(s instanceof Date&&!Number.isNaN(s.getTime()))return s}catch{}return null}function Ye(e="",a={}){const t=Array.isArray(a.media)&&a.media.length?a.media[0]:{},s=String(t.type||a.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",r=String(t.thumbUrl||(s==="image"?t.url:"")||a.thumbUrl||"").trim(),d=Qe(a);return{id:String(e||"").trim(),caption:String(a.caption||"").trim(),mediaType:s,thumbUrl:r,likesCount:f(a.likesCount),commentsCount:f(a.commentsCount),impressions:0,dateLabel:d?d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:d?d.getTime():0}}function Xe({days:e=[],todayKey:a="",rawPosts:t=[]}={}){const s=Array.isArray(e)?e:[],r=V(s),d=s.find(h=>String(h?.date||h?.id||"").trim()===String(a||"").trim()),m=V(d?[d]:[]),_=r.merged?.posts&&typeof r.merged.posts=="object"?r.merged.posts:{},v=(Array.isArray(t)?t:[]).map(h=>Ye(h?.id,h?.data||{})).filter(h=>h.id).map(h=>({...h,impressions:f(_[h.id]?.impressions)})),x=v.slice().sort((h,b)=>b.createdAtMs-h.createdAtMs).slice(0,Je);return{day:String(a||"").trim(),week:r.summary,today:m.summary,posts:x,bestPost:ea(v)}}function ea(e=[]){const a=(Array.isArray(e)?e:[]).filter(t=>t&&t.id);return a.length?a.slice().sort((t,s)=>f(s.impressions)-f(t.impressions)||f(s.likesCount)-f(t.likesCount)||f(s.createdAtMs)-f(t.createdAtMs))[0]:null}const aa=Object.freeze(["pro","premium","plus","business","paid","active"]);function ta({profile:e={},restaurant:a={}}={}){const t=[a||{},e||{}];for(const s of t){if(s.subscriptionActive===!0||s.isSubscriber===!0||s.hasSubscription===!0)return!0;const r=String(s.subscriptionPlan||s.planKey||s.plan||s.subscriptionStatus||"").trim().toLowerCase();if(r&&aa.includes(r))return!0}return!1}function na(e={}){const a=e&&typeof e=="object"?e:{};return String(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||a.bannerUrl||"").trim()}function ra({model:e=null,coverUrl:a="",subscribed:t=!1,assets:s={}}={}){const r=e?.today||{},d=!e,m=e?.bestPost||null,_=[];return _.push(d?{key:"bestPost",label:"Reichweite",pending:!0}:{key:"bestPost",label:"Reichweite",value:P(f(m?.impressions)),imageUrl:String(m?.thumbUrl||"").trim(),iconName:"image",nav:"analytics"}),_.push({key:"profileViews",label:"Profilbesuche heute",value:P(f(r.profileViews)),loading:d,imageUrl:String(a||"").trim(),iconName:"user",nav:"analytics"}),_.push({key:"menuOpens",label:"Menü-Aufrufe heute",value:P(f(r.menuOpens)),loading:d&&t,locked:!t,imageUrl:String(s.menuImageUrl||"").trim(),iconName:"book-open",nav:"analytics"}),_.push({key:"qrScans",label:"QR-Scans heute",value:P(f(r.qrScans)),loading:d&&t,locked:!t,imageUrl:String(s.qrImageUrl||"").trim(),iconName:"qr-code",nav:"analytics"}),_}function la({state:e,renderFn:a,documentObj:t,firestoreApi:s={},profileApi:r={},composerApi:d={},iconFn:m,storageObj:_}={}){const v=t||(typeof document>"u"?null:document),x=v?.defaultView||(typeof window>"u"?null:window),h=typeof a=="function"?a:()=>{},b=_||(typeof localStorage>"u"?null:localStorage),Z=typeof r.getBusinessProfileTypeFn=="function"?r.getBusinessProfileTypeFn:(()=>""),Q=typeof r.isShopCatalogProfileFn=="function"?r.isShopCatalogProfileFn:(()=>!1),Y=typeof r.isBusinessOwnerProfileFn=="function"?r.isBusinessOwnerProfileFn:(()=>!1),U=typeof r.getRestaurantMetaByIdFn=="function"?r.getRestaurantMetaByIdFn:(()=>null),X=typeof r.resolveRestaurantLogoFn=="function"?r.resolveRestaurantLogoFn:(()=>""),ee=typeof r.resolveOwnAvatarUrlFn=="function"?r.resolveOwnAvatarUrlFn:(()=>"");let C=0,N=!1,z=null,R=null,$="",T=!1,L=()=>null;const ae=300;function M(){const n=e?.userProfile||{};return Ce({businessType:Z(n),isShopCatalog:Q(n)})}function te(n=""){const i=U(n)||{};return Pe(i).map(o=>({id:o.id,name:o.title,price:o.price??"",category:o.beds||o.tag||"",type:"room",imageUrl:o.imageUrl||""}))}function ne(n=""){if(!b)return null;try{const i=b.getItem(`${W}${n}`);if(!i)return null;const o=JSON.parse(i),l=Array.isArray(o?.items)?o.items:null;return l&&l.length?l:null}catch{return null}}function re(n="",i=[]){if(b)try{b.setItem(`${W}${n}`,JSON.stringify({savedAt:Date.now(),items:i}))}catch{}}async function se(n=""){const{db:i,collectionFn:o,queryFn:l,limitFn:u,getDocsFn:p}=s;if(!i||typeof o!="function"||typeof p!="function")throw new Error("Produktet nuk u ngarkuan.");const k=o(i,"restaurants",n,"menuItems"),y=typeof l=="function"&&typeof u=="function"?l(k,u(ae)):k,S=await p(y),g=[];return S.forEach(D=>{const I=L(D?.id,D?.data?.()||{});I&&g.push(I)}),g.sort((D,I)=>D.name.localeCompare(I.name,"sq")),g}async function ie(n="",i){const o=String(n||"").trim();if(!o)throw new Error("Produktet nuk u ngarkuan.");if(M()==="hotel")return te(o);const l=se(o).then(p=>(re(o,p),p)),u=ne(o);return u?(typeof i=="function"?l.then(p=>i(p)).catch(()=>{}):l.catch(()=>{}),u):l}function A(){return z?Promise.resolve(z):(R||(R=fe(()=>import("./business-composer-controller-BAi2hY3z.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(n=>(L=typeof n?.normalizeComposerProductCore=="function"?n.normalizeComposerProductCore:(()=>null),z=n.createBusinessComposerController({documentObj:v,windowObj:v?.defaultView||null,api:{getRestaurantIdFn:()=>j(),getBusinessMetaFn:()=>{const i=j();if(!i)return{name:"",logoUrl:"",city:""};const o=H(i),l=U(i)||{};return{name:o.name,logoUrl:o.logoUrl,city:String(l.city||"").trim()}},loadProductsFn:(i,o)=>ie(i,o),getBusinessKindFn:()=>M(),uploadImageFn:d.uploadImageFn,uploadVideoFn:d.uploadVideoFn,captureVideoPosterFn:d.captureVideoPosterFn,createPostFn:d.createPostFn,createStoryFn:d.createStoryFn,formatPriceFn:d.formatPriceFn,getOptimizedImageUrlFn:d.getOptimizedImageUrlFn,escapeHtmlFn:d.escapeHtmlFn,iconFn:typeof m=="function"?m:void 0,afterPublishFn:async i=>{try{await K({force:!0})}catch{}typeof d.afterPublishFn=="function"&&await d.afterPublishFn(i)}}}),z)).catch(n=>{throw R=null,console.error("[mnyra][dashboard] composer load failed",n),n})),R)}function oe(){const n=x?.navigator?.connection;return!n||typeof n!="object"?!1:n.saveData===!0?!0:/(^|-)2g$/.test(String(n.effectiveType||"").trim().toLowerCase())}function de(){if(T||z||!x||oe())return;T=!0;const n=()=>{if(A().catch(()=>{}),typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}};if(typeof x.requestIdleCallback=="function"){x.requestIdleCallback(n,{timeout:Ve});return}x.setTimeout?.(n,qe)}function le(n="post"){const i=String(n||"").trim().toLowerCase(),o=i==="story"||i==="profile"?i:"post";if(typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}if(z){z.open(o);return}$=o,A().then(l=>{const u=$||o;$="",l?.open?.(u)}).catch(()=>{$=""})}function B(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",paywall:""}),e.dashboardView}function j(){const n=e?.userProfile||{};return String(n.restaurantId||n.staffRestaurantId||"").trim()}function ce(){const n=String(e?.user?.uid||"").trim();if(!n)return!1;const i=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||i===n}function O(n=""){return`${He}${n}`}function he(n="",i=""){if(!b||!n)return null;try{const o=b.getItem(O(n));if(!o)return null;const l=JSON.parse(o);return!l||typeof l!="object"||String(l.day||"").trim()!==String(i||"").trim()||!l.model||typeof l.model!="object"?null:l.model}catch{return null}}function ue(n="",i=null){if(!(!b||!n||!i))try{b.setItem(O(n),JSON.stringify({day:i.day,model:i}))}catch{}}async function me(n=""){const{db:i,collectionFn:o,queryFn:l,orderByFn:u,limitFn:p,getDocsFn:k}=s;if(!i||typeof o!="function"||typeof l!="function"||typeof u!="function"||typeof p!="function"||typeof k!="function")return[];const y=o(i,"restaurants",n,"socialPosts");return(await k(l(y,u("createdAt","desc"),p(Ge)))).docs.map(g=>({id:g.id,data:g.data()||{}})).filter(g=>{const D=String(g.data.status||"active").trim().toLowerCase();return D!=="deleted"&&D!=="hidden"})}async function K({force:n=!1}={}){const i=B(),o=j();if(!o)return;const l=be({rangeKey:"7d"});if(!l)return;const u=`${o}::${l.toDay}`;if(!n&&i.loadedSignature===u&&i.status==="ready")return;if(!i.model){const y=he(o,l.toDay);y&&(i.model=y,i.status="ready",h())}C+=1;const p=C;i.model||(i.status="loading",i.error="",h());try{const y={db:s.db,collectionFn:s.collectionFn,queryFn:s.queryFn,whereFn:s.whereFn,documentIdFn:s.documentIdFn,getDocsFn:s.getDocsFn,restaurantId:o},[S,g]=await Promise.allSettled([ye({...y,fromDay:l.fromDay,toDay:l.toDay}),me(o)]);if(p!==C)return;if(S.status==="rejected")throw S.reason;g.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",g.reason),i.model=Xe({days:S.value,todayKey:l.toDay,rawPosts:g.status==="fulfilled"?g.value:[]}),i.status="ready",i.error="",i.loadedSignature=u,ue(o,i.model)}catch(y){if(p!==C)return;console.error("[mnyra][dashboard] load failed",y),i.model||(i.status="error",i.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}h()}function pe(){N||!v||(N=!0,v.addEventListener("click",n=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(n.target?.closest?.("[data-dashboard-retry]")){K({force:!0});return}if(n.target?.closest?.("[data-dashboard-paywall-close]")){n.preventDefault(),B().paywall="",h();return}const i=n.target?.closest?.("[data-dashboard-metric-locked]");if(i){n.preventDefault(),B().paywall=String(i.getAttribute("data-dashboard-metric-locked")||"").trim(),h();return}const o=n.target?.closest?.("[data-dashboard-composer]");o&&(n.preventDefault(),le(o.getAttribute("data-dashboard-composer")))}catch{}}))}function H(n=""){const i=e?.userProfile||{},o=n?U(n)||{}:{},l=String(o.name||o.restaurantName||i.name||"").trim()||"Business";let u="";try{u=String(ee()||"").trim()}catch{}if(!u)try{u=String(X(o)||"").trim()}catch{}return{name:l,logoUrl:u,kind:M(),coverUrl:na(o),subscribed:ta({profile:i,restaurant:o})}}function ge(){De(v),pe();const n=B(),i=j();let o="";if(!i)o=ce()?`${Le()}${J({kpiCount:6})}`:Oe();else{de();const l=H(i),u=Re({kind:l.kind,isOwner:Y(e?.userProfile)}),p=$e(l.kind);n.status==="idle"&&(n.status="loading",queueMicrotask(()=>{K({force:!1})}));let k="";n.model?k=`
          ${Ee({kpiDefs:p,week:n.model.week,today:n.model.today})}
          ${Ne({posts:n.model.posts,iconFn:m})}
        `:n.status==="error"?k=Ae({message:n.error}):k=J({kpiCount:p.length});const y=ra({model:n.model,coverUrl:l.coverUrl,subscribed:l.subscribed,assets:We}),S=String(n.paywall||"").trim();o=`
        ${je({name:l.name,logoUrl:l.logoUrl,iconFn:m})}
        ${Ue({cards:y,iconFn:m})}
        ${Me(`
          ${Ke({iconFn:m})}
          ${Ie({actions:u,iconFn:m})}
          ${k}
        `)}
        ${S?Te({title:Ze[S]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${o}
      </section>
    `}return Object.freeze({renderDashboardView:ge,loadDashboard:K})}export{ve as M,la as a,Pe as b,ke as c,oa as d,da as f,Se as n};
