const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-BmSGCxSI.js","chunks/domain-feed-social-eager-Um2WCv4T.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-Bz_Ohlsq.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as be}from"./domain-auth-Aq-4Vdvh.js";import{f as P,r as ye,l as _e,s as W}from"./domain-analytics-BNpk5u6w.js";import{b as ve}from"./domain-business-accounts-D8NpUhi6.js";const we=20,ke=8;function k(e=""){return e==null?"":String(e).trim()}function N(e){if(e==null||e==="")return null;const a=Number(String(e).replace(",","."));return Number.isFinite(a)&&a>0?a:null}function xe(e=Date.now(),a=Math.random()){const t=Math.max(0,Number(e)||0).toString(36),o=Math.floor(Math.max(0,Math.min(.999999,Number(a)||0))*36**6).toString(36).padStart(6,"0");return`room_${t}_${o}`}function Se(e={}){const a=e&&typeof e=="object"?e:{},t=[...Array.isArray(a.images)?a.images:[],k(a.imageUrl??a.image??a.photoUrl)],o=[];return t.forEach(n=>{const d=k(n);d&&!o.includes(d)&&o.push(d)}),o.slice(0,ke)}function ze(e={},{index:a=0}={}){const t=e&&typeof e=="object"?e:{},o=N(t.persons??t.guests??t.capacity),n=N(t.size??t.sizeSqm??t.area),d=Se(t);return{id:k(t.id)||xe(Date.now()+a),title:k(t.title??t.name),description:k(t.description??t.text).slice(0,400),imageUrl:d[0]||"",images:d,price:N(t.price??t.pricePerNight),currency:k(t.currency??t.currencyCode).toUpperCase()||"EUR",persons:o==null?null:Math.min(20,Math.round(o)),beds:k(t.beds??t.bedsLabel).slice(0,60),size:n==null?null:Math.min(500,Math.round(n)),tag:k(t.tag??t.badge).slice(0,40),active:t.active!==!1}}function Pe(e=[]){return(Array.isArray(e)?e:[]).slice(0,we).map((a,t)=>ze(a,{index:t}))}function De(e={}){return Pe((e&&typeof e=="object"?e:{}).hotelRooms).filter(t=>t.title)}function ca(e={}){const a=[];return Number.isFinite(e?.persons)&&e.persons>0&&a.push({icon:"users",label:`${e.persons} persona`}),k(e?.beds)&&a.push({icon:"bed",label:k(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&a.push({icon:"size",label:`${e.size} m²`}),a}function ha(e={}){const a=Number(e?.price);if(!Number.isFinite(a)||a<=0)return"";const t=k(e?.currency).toUpperCase()||"EUR",o=Number.isInteger(a)?String(a):a.toFixed(2);return t==="EUR"?`€${o}`:`${o} ${t}`}const G="mnyraDashboardStyles",Fe=`
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
  /* Das Bildfenster der Kennzahl-Karten. Eine Zahl fuer alle vier, damit die
     Reihe eine Linie haelt - und die Zahl, auf die die beiden festen Fotos
     zugeschnitten sind. */
  --dash-hl-media: 140px;
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
  /* Bildfenster + Abstand + Textblock + Polster unten. Die Karte gibt dem Text
     unter dem Bild Luft, statt ihn an die Kante zu setzen. */
  height: calc(var(--dash-hl-media) + 74px);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
  background: var(--dash-surface);
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
/* Alle Bilder stehen im selben Fenster oben in der Karte - gleiche Hoehe auf
   jeder Karte, egal welches Format das Bild mitbringt. Vorher richtete sich
   die Hoehe nach dem Bild, und die Reihe sah dadurch ungleich aus.
   Das Fenster ist etwas breiter als hoch (--dash-hl-media). Ein hochformatiges
   Bild wird darin oben und unten beschnitten und behaelt seine volle Breite;
   nur ein Bild, das noch flacher liegt als das Fenster, verliert etwas an den
   Seiten. Die beiden festen Fotos sind auf genau dieses Verhaeltnis
   zugeschnitten und werden deshalb gar nicht beschnitten.
   Die Maske loest die Unterkante auf, damit das Bild nicht mit einer harten
   Linie endet, sondern in das Weiss darunter uebergeht. */
.mnyra-dash__hl-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--dash-hl-media);
  object-fit: cover;
  object-position: center;
  display: block;
}
/* Die Flaeche unter dem Bild: sie traegt die Karte, wenn ein Bild fehlt oder
   nicht laedt - dann steht hier statt eines Lochs eine ruhige Flaeche mit
   Symbol, dieselbe wie in den Faechern des Bentos. Das Symbol sitzt oben, wo
   sonst das Bild steht, nicht in der Mitte der ganzen Karte. */
.mnyra-dash__hl-plate {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--dash-hl-media);
  background: var(--dash-plane);
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-dash__hl-plate svg,
.mnyra-dash__hl-plate i { width: 26px; height: 26px; display: block; }
/* Der Verlauf liegt genau ueber dem Bildfenster und macht dessen Unterkante
   weiss: das Bild geht ins Weiss der Karte ueber, statt mit einer Linie zu
   enden. Er endet mit dem Fenster - darunter ist die Karte ohnehin weiss und
   traegt Beschriftung und Zahl. */
.mnyra-dash__hl-fade {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--dash-hl-media);
  pointer-events: none;
  background: linear-gradient(0deg, #ffffff 0%, rgba(255, 255, 255, 0.92) 12%, rgba(255, 255, 255, 0.55) 30%, rgba(255, 255, 255, 0.16) 52%, rgba(255, 255, 255, 0) 75%);
}
/* Beschriftung und Zahl stehen unter dem Bildfenster, mit Abstand dazu: sie
   sollen ganz im Weissen stehen, nicht mit einem Fuss im ausgeblendeten Teil
   des Bildes. Die 14px sind dieser Abstand - er faengt dort an, wo das
   Fenster endet. */
.mnyra-dash__hl-body {
  position: absolute;
  left: 12px;
  right: 12px;
  top: calc(var(--dash-hl-media) + 14px);
  z-index: 2;
}
/* Eine Zeile, immer. Die Beschriftungen sind kurz genug dafuer - und wenn eine
   Sprache doch einmal laenger wird, bricht sie nicht um, sondern endet mit
   Punkten. Zwei Zeilen wuerden die Zahl darunter nach unten druecken. */
.mnyra-dash__hl-label {
  display: block;
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: var(--dash-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__hl-value {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--dash-ink);
  font-variant-numeric: tabular-nums;
}
/* Steht noch kein Beitrag da, tritt dieser Satz an die Stelle der Zahl - und
   nimmt genau ihre Hoehe ein: zwei Zeilen zu 11px sind so hoch wie eine Zahl
   zu 22px. Die Karte bleibt dadurch so hoch wie ihre Nachbarn. */
/* Steht noch kein Beitrag da, tritt dieser Satz an die Stelle der Zahl. Er
   nimmt genau ihre Hoehe ein, damit die Karte so hoch bleibt wie ihre
   Nachbarn - und er ist kurz genug fuer eine Zeile. */
.mnyra-dash__hl-empty {
  display: flex;
  align-items: center;
  min-height: 23px;
  margin: 5px 0 0;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--dash-ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Das Auge vor der Zahl des Beitrags: es sagt "gesehen", ohne dass ein Wort
   dafuer in der Beschriftung stehen muss. */
.mnyra-dash__hl-eye {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: var(--dash-muted);
}
.mnyra-dash__hl-eye svg,
.mnyra-dash__hl-eye i { width: 16px; height: 16px; display: block; }
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
/* Verschlossene Karte: das Bild bleibt scharf und ganz zu sehen - verschlossen
   ist die ZAHL, nicht das Motiv. An ihrer Stelle steht das Schild. */
/* Das Schild auf der hellen Karte: dunkel gefuellt, damit es sich vom Weiss
   abhebt - auf Weiss waere ein weisses Schild nicht zu sehen. */
.mnyra-dash__hl-lock {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0 0;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--dash-black);
  border: 1px solid var(--dash-black);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--dash-black-ink);
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
/* Dieselbe Karte in hell: Form, Masse und Abstaende bleiben, nur die Farben
   kommen aus dem Panel statt von der schwarzen Flaeche. Damit steht die
   Offerten-Karte in derselben Farbwelt wie "Ndrysho menune" und
   "Oferta & Reklama" darunter - ruhige Flaeche, Haarlinie, das Indigo im
   Symbol. Zwei schwarze Karten uebereinander waeren zu schwer gewesen. */
.mnyra-dash__composer--plane {
  background: var(--dash-plane);
  border-color: var(--dash-hairline);
  color: var(--dash-ink);
}
.mnyra-dash__composer--plane .mnyra-dash__composer-title { color: var(--dash-ink); }
.mnyra-dash__composer--plane .mnyra-dash__composer-accent { color: var(--dash-accent); }
.mnyra-dash__composer--plane .mnyra-dash__composer-sub { color: var(--dash-muted); }
.mnyra-dash__composer--plane .mnyra-dash__composer-cta { border-top-color: var(--dash-hairline); }
/* Das Symbol traegt dieselbe weiche Indigo-Flaeche wie die Kacheln - auf hell
   ist der Ring der schwarzen Karte kaum zu sehen. */
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-icon {
  border-color: transparent;
  background: var(--dash-accent-soft);
  color: var(--dash-accent);
}
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-label { color: var(--dash-ink); }
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-chevron { color: var(--dash-muted); }
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
.mnyra-dash__bento > .mnyra-dash__actions,
.mnyra-dash__bento > .mnyra-dash__composer { margin-top: 22px; }
/* Nur die erste Karte im Bento braucht keinen Abstand nach oben - dort ist das
   Polster des Bentos schon ihr Abstand. Die Offerten-Karte darunter rueckt
   genauso weit nach wie alles andere. */
.mnyra-dash__bento > .mnyra-dash__composer:first-child { margin-top: 0; }
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
`;function Be(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(G)))try{const a=e.createElement("style");a.id=G,a.textContent=Fe,e.head?.appendChild(a)}catch{}}function h(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function x(e,a,t=""){if(typeof e!="function")return"";try{return e(a,t)||""}catch{return""}}const Ce=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function $e({businessType:e="",isShopCatalog:a=!1}={}){if(a)return"shop";const t=String(e||"").trim().toLowerCase();return Ce.includes(t)?"hotel":"restaurant"}function Re({kind:e="restaurant",isOwner:a=!1}={}){const t=[];return e==="hotel"?t.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?t.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):t.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),t.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),a&&t.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),t.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),t}function Ke(e="restaurant"){const a=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?a.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?a.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):a.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function J(e=0,a=""){const t=P(e);return a?`${t} ${a}`:t}function je(e=new Date().getHours()){const a=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return a>=5&&a<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:a>=11&&a<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:a>=18&&a<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function Ue({name:e="",logoUrl:a="",hour:t=new Date().getHours(),iconFn:o}={}){const n=je(t),d=h(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${a?`<img src="${h(a)}" alt="${d}" title="${d}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${d}">${x(o,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${h(n.text)}</p>
    </div>
  `}function Ie({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${x(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${x(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Ee({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${x(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${x(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function Me({actions:e=[],iconFn:a}={}){return`<div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(o=>`
      <button type="button" class="mnyra-dash__action" data-nav="${h(o.nav)}">
        <span class="mnyra-dash__action-icon">${x(a,o.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${h(o.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${h(o.sub||"")}</span>
        </span>
      </button>
    `).join("")}</div>`}function Te({cards:e=[],iconFn:a}={}){const t=(Array.isArray(e)?e:[]).filter(n=>n&&n.key);return t.length?`
    <div class="mnyra-dash__hl" data-dashboard-metrics>
      ${t.map((n,d)=>{const c=h(n.label||"");if(n.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const b=d<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let p="";n.imageUrl?p=`<img class="mnyra-dash__hl-media" src="${h(n.imageUrl)}" alt="" ${b} decoding="async" onerror="this.style.display='none'" />`:n.videoUrl&&(p=`<video class="mnyra-dash__hl-media" src="${h(n.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const S=`
      <span class="mnyra-dash__hl-plate">${x(a,n.iconName||"image","w-6 h-6")}</span>
      ${p}
    `,u=n.withEye?`<span class="mnyra-dash__hl-eye">${x(a,"eye","w-4 h-4")}</span>`:"";let g;n.locked?g=`<span class="mnyra-dash__hl-lock">${x(a,"lock","w-3 h-3")}Me pagesë</span>`:n.loading?g='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':n.emptyText?g=`<span class="mnyra-dash__hl-empty">${h(n.emptyText)}</span>`:g=`<span class="mnyra-dash__hl-value">${u}${h(n.value||"0")}</span>`;let B;n.locked?B=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${h(n.key)}"`:n.composer?B=`class="mnyra-dash__hl-card" data-dashboard-composer="${h(n.composer)}"`:B=`class="mnyra-dash__hl-card"${n.nav?` data-nav="${h(n.nav)}"`:""}`;const I=n.locked?`${c} – me pagesë`:`${c} ${n.emptyText||n.value||""}`.trim();return`
      <button type="button" ${B} data-dashboard-metric="${h(n.key)}" aria-label="${h(I)}">
        ${S}
        <span class="mnyra-dash__hl-fade"></span>
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${c}</span>
          ${g}
        </span>
      </button>
    `}).join("")}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `:""}function Ne(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function Ae({kpiDefs:e=[],week:a={},today:t={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(n=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${h(n.label)}</p>
      <p class="mnyra-dash__kpi-value">${h(J(a?.[n.key]||0,n.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${h(J(t?.[n.key]||0,n.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function Le({posts:e=[],iconFn:a}={}){const t=Array.isArray(e)?e:[];let o="";return t.length?(o=t.map(n=>{const d=[n.dateLabel,`${P(n.likesCount||0)} Likes`,`${P(n.commentsCount||0)} Kommentare`];return Number(n.impressions||0)>0&&d.push(`${P(n.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${n.thumbUrl?`<img src="${h(n.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:x(a,n.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${h(n.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${h(d.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `}).join(""),o=`<div class="mnyra-dash__posts">${o}</div>`):o=`
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
      ${o}
    </div>
  `}function Q({kpiCount:e=6}={}){return`
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
  `}function Oe({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${h(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function He(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Ve({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${h(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function qe(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Ze="menyra_social_dashboard_cache_v1::",Y="menyra_social_composer_products_v1::",We=2500,Ge=1200,Je=6,Qe=3,Ye=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),Xe=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function _(e){const a=Number(e);return Number.isFinite(a)?a:0}function ea(e={}){const a=String(e.createdAtClient||"").trim();if(a){const o=new Date(a);if(!Number.isNaN(o.getTime()))return o}const t=e.createdAt;if(t&&typeof t.toDate=="function")try{const o=t.toDate();if(o instanceof Date&&!Number.isNaN(o.getTime()))return o}catch{}return null}function aa(e="",a={}){const t=Array.isArray(a.media)&&a.media.length?a.media[0]:{},o=String(t.type||a.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",n=String(t.thumbUrl||(o==="image"?t.url:"")||a.thumbUrl||"").trim(),d=o==="video"?String(t.url||a.mediaUrl||"").trim():"",c=ea(a);return{id:String(e||"").trim(),caption:String(a.caption||"").trim(),mediaType:o,thumbUrl:n,videoUrl:d,likesCount:_(a.likesCount),commentsCount:_(a.commentsCount),impressions:0,dateLabel:c?c.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:c?c.getTime():0}}function ta({days:e=[],todayKey:a="",rawPosts:t=[]}={}){const o=Array.isArray(e)?e:[],n=W(o),d=o.find(u=>String(u?.date||u?.id||"").trim()===String(a||"").trim()),c=W(d?[d]:[]),b=n.merged?.posts&&typeof n.merged.posts=="object"?n.merged.posts:{},p=(Array.isArray(t)?t:[]).map(u=>aa(u?.id,u?.data||{})).filter(u=>u.id).map(u=>({...u,impressions:_(b[u.id]?.impressions)})),S=p.slice().sort((u,g)=>g.createdAtMs-u.createdAtMs).slice(0,Qe);return{day:String(a||"").trim(),week:n.summary,today:c.summary,posts:S,bestPost:na(p)}}function na(e=[]){const a=(Array.isArray(e)?e:[]).filter(t=>t&&t.id);return a.length?a.slice().sort((t,o)=>_(o.impressions)-_(t.impressions)||_(o.likesCount)-_(t.likesCount)||_(o.createdAtMs)-_(t.createdAtMs))[0]:null}function ra({profile:e={},restaurant:a={}}={}){return ve({profile:e,restaurant:a,feature:"qr"})}function sa(e={}){const a=e&&typeof e=="object"?e:{};return String(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||a.bannerUrl||"").trim()}function ia({model:e=null,coverUrl:a="",subscribed:t=!1,assets:o={}}={}){const n=e?.today||{},d=!e,c=e?.bestPost||null,b=[];if(d)b.push({key:"bestPost",label:"Postimi",pending:!0});else if(!c)b.push({key:"bestPost",label:"Postimi",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const p=String(c.thumbUrl||"").trim();b.push({key:"bestPost",label:"Postimi",value:P(_(c.impressions)),withEye:!0,imageUrl:p,videoUrl:p?"":String(c.videoUrl||"").trim(),iconName:"image",nav:"analytics"})}return b.push({key:"profileViews",label:"Profili sot",value:P(_(n.profileViews)),loading:d,imageUrl:String(a||"").trim(),iconName:"user",nav:"analytics"}),b.push({key:"menuOpens",label:"Menyja sot",value:P(_(n.menuOpens)),loading:d&&t,locked:!t,imageUrl:String(o.menuImageUrl||"").trim(),iconName:"book-open",nav:"analytics"}),b.push({key:"qrScans",label:"Skanime sot",value:P(_(n.qrScans)),loading:d&&t,locked:!t,imageUrl:String(o.qrImageUrl||"").trim(),iconName:"layout-grid",nav:"analytics"}),b}function ua({state:e,renderFn:a,documentObj:t,firestoreApi:o={},profileApi:n={},composerApi:d={},iconFn:c,storageObj:b}={}){const p=t||(typeof document>"u"?null:document),S=p?.defaultView||(typeof window>"u"?null:window),u=typeof a=="function"?a:()=>{},g=b||(typeof localStorage>"u"?null:localStorage),B=typeof n.getBusinessProfileTypeFn=="function"?n.getBusinessProfileTypeFn:(()=>""),I=typeof n.isShopCatalogProfileFn=="function"?n.isShopCatalogProfileFn:(()=>!1),X=typeof n.isBusinessOwnerProfileFn=="function"?n.isBusinessOwnerProfileFn:(()=>!1),E=typeof n.getRestaurantMetaByIdFn=="function"?n.getRestaurantMetaByIdFn:(()=>null),ee=typeof n.resolveRestaurantLogoFn=="function"?n.resolveRestaurantLogoFn:(()=>""),ae=typeof n.resolveOwnAvatarUrlFn=="function"?n.resolveOwnAvatarUrlFn:(()=>"");let C=0,A=!1,D=null,$=null,R="",L=!1,O=()=>null;const te=300;function M(){const i=e?.userProfile||{};return $e({businessType:B(i),isShopCatalog:I(i)})}function ne(i=""){const r=E(i)||{};return De(r).map(s=>({id:s.id,name:s.title,price:s.price??"",category:s.beds||s.tag||"",type:"room",imageUrl:s.imageUrl||""}))}function re(i=""){if(!g)return null;try{const r=g.getItem(`${Y}${i}`);if(!r)return null;const s=JSON.parse(r),l=Array.isArray(s?.items)?s.items:null;return l&&l.length?l:null}catch{return null}}function se(i="",r=[]){if(g)try{g.setItem(`${Y}${i}`,JSON.stringify({savedAt:Date.now(),items:r}))}catch{}}async function ie(i=""){const{db:r,collectionFn:s,queryFn:l,limitFn:m,getDocsFn:f}=o;if(!r||typeof s!="function"||typeof f!="function")throw new Error("Produktet nuk u ngarkuan.");const w=s(r,"restaurants",i,"menuItems"),v=typeof l=="function"&&typeof m=="function"?l(w,m(te)):w,z=await f(v),y=[];return z.forEach(F=>{const U=O(F?.id,F?.data?.()||{});U&&y.push(U)}),y.sort((F,U)=>F.name.localeCompare(U.name,"sq")),y}async function oe(i="",r){const s=String(i||"").trim();if(!s)throw new Error("Produktet nuk u ngarkuan.");if(M()==="hotel")return ne(s);const l=ie(s).then(f=>(se(s,f),f)),m=re(s);return m?(typeof r=="function"?l.then(f=>r(f)).catch(()=>{}):l.catch(()=>{}),m):l}function H(){return D?Promise.resolve(D):($||($=be(()=>import("./business-composer-controller-BmSGCxSI.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(i=>(O=typeof i?.normalizeComposerProductCore=="function"?i.normalizeComposerProductCore:(()=>null),D=i.createBusinessComposerController({documentObj:p,windowObj:p?.defaultView||null,api:{getRestaurantIdFn:()=>K(),getBusinessMetaFn:()=>{const r=K();if(!r)return{name:"",logoUrl:"",city:""};const s=Z(r),l=E(r)||{};return{name:s.name,logoUrl:s.logoUrl,city:String(l.city||"").trim()}},loadProductsFn:(r,s)=>oe(r,s),getBusinessKindFn:()=>M(),uploadImageFn:d.uploadImageFn,uploadVideoFn:d.uploadVideoFn,captureVideoPosterFn:d.captureVideoPosterFn,createPostFn:d.createPostFn,createStoryFn:d.createStoryFn,formatPriceFn:d.formatPriceFn,getOptimizedImageUrlFn:d.getOptimizedImageUrlFn,escapeHtmlFn:d.escapeHtmlFn,iconFn:typeof c=="function"?c:void 0,afterPublishFn:async r=>{try{await j({force:!0})}catch{}typeof d.afterPublishFn=="function"&&await d.afterPublishFn(r)}}}),D)).catch(i=>{throw $=null,console.error("[mnyra][dashboard] composer load failed",i),i})),$)}function de(){const i=S?.navigator?.connection;return!i||typeof i!="object"?!1:i.saveData===!0?!0:/(^|-)2g$/.test(String(i.effectiveType||"").trim().toLowerCase())}function le(){if(L||D||!S||de())return;L=!0;const i=()=>{if(H().catch(()=>{}),typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}};if(typeof S.requestIdleCallback=="function"){S.requestIdleCallback(i,{timeout:We});return}S.setTimeout?.(i,Ge)}function ce(i="post"){const r=String(i||"").trim().toLowerCase(),s=r==="story"||r==="profile"?r:"post";if(typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}if(D){D.open(s);return}R=s,H().then(l=>{const m=R||s;R="",l?.open?.(m)}).catch(()=>{R=""})}function T(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function V(i=""){const r=T(),s=String(i||"").trim();return String(r.restaurantId||"")===s||(r.restaurantId=s,r.model=null,r.status="idle",r.error="",r.loadedSignature="",r.paywall="",C+=1),r}function K(){const i=e?.userProfile||{};return String(i.restaurantId||i.staffRestaurantId||"").trim()}function he(){const i=String(e?.user?.uid||"").trim();if(!i)return!1;const r=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||r===i}function q(i=""){return`${Ze}${i}`}function ue(i="",r=""){if(!g||!i)return null;try{const s=g.getItem(q(i));if(!s)return null;const l=JSON.parse(s);return!l||typeof l!="object"||String(l.day||"").trim()!==String(r||"").trim()||!l.model||typeof l.model!="object"?null:l.model}catch{return null}}function me(i="",r=null){if(!(!g||!i||!r))try{g.setItem(q(i),JSON.stringify({day:r.day,model:r}))}catch{}}async function pe(i=""){const{db:r,collectionFn:s,queryFn:l,orderByFn:m,limitFn:f,getDocsFn:w}=o;if(!r||typeof s!="function"||typeof l!="function"||typeof m!="function"||typeof f!="function"||typeof w!="function")return[];const v=s(r,"restaurants",i,"socialPosts");return(await w(l(v,m("createdAt","desc"),f(Je)))).docs.map(y=>({id:y.id,data:y.data()||{}})).filter(y=>{const F=String(y.data.status||"active").trim().toLowerCase();return F!=="deleted"&&F!=="hidden"})}async function j({force:i=!1}={}){const r=K(),s=V(r);if(!r)return;const l=ye({rangeKey:"7d"});if(!l)return;const m=`${r}::${l.toDay}`;if(!i&&s.loadedSignature===m&&s.status==="ready")return;if(!s.model){const v=ue(r,l.toDay);v&&(s.model=v,s.status="ready",u())}C+=1;const f=C;s.model||(s.status="loading",s.error="",u());try{const v={db:o.db,collectionFn:o.collectionFn,queryFn:o.queryFn,whereFn:o.whereFn,documentIdFn:o.documentIdFn,getDocsFn:o.getDocsFn,restaurantId:r},[z,y]=await Promise.allSettled([_e({...v,fromDay:l.fromDay,toDay:l.toDay}),pe(r)]);if(f!==C)return;if(z.status==="rejected")throw z.reason;y.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",y.reason),s.model=ta({days:z.value,todayKey:l.toDay,rawPosts:y.status==="fulfilled"?y.value:[]}),s.status="ready",s.error="",s.loadedSignature=m,me(r,s.model)}catch(v){if(f!==C)return;console.error("[mnyra][dashboard] load failed",v),s.model||(s.status="error",s.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}u()}function ge(){A||!p||(A=!0,p.addEventListener("click",i=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(i.target?.closest?.("[data-dashboard-retry]")){j({force:!0});return}if(i.target?.closest?.("[data-dashboard-paywall-close]")){i.preventDefault(),T().paywall="",u();return}const r=i.target?.closest?.("[data-dashboard-metric-locked]");if(r){i.preventDefault(),T().paywall=String(r.getAttribute("data-dashboard-metric-locked")||"").trim(),u();return}const s=i.target?.closest?.("[data-dashboard-composer]");s&&(i.preventDefault(),ce(s.getAttribute("data-dashboard-composer")))}catch{}}))}function Z(i=""){const r=e?.userProfile||{},s=i?E(i)||{}:{},l=String(s.name||s.restaurantName||r.name||"").trim()||"Business";let m="";try{m=String(ae()||"").trim()}catch{}if(!m)try{m=String(ee(s)||"").trim()}catch{}return{name:l,logoUrl:m,kind:M(),coverUrl:sa(s),subscribed:ra({profile:r,restaurant:s})}}function fe(){Be(p),ge();const i=K(),r=V(i);let s="";if(!i)s=he()?`${He()}${Q({kpiCount:6})}`:qe();else{le();const l=Z(i),m=Re({kind:l.kind,isOwner:X(e?.userProfile)}),f=Ke(l.kind);r.status==="idle"&&(r.status="loading",queueMicrotask(()=>{j({force:!1})}));let w="";r.model?w=`
          ${Ae({kpiDefs:f,week:r.model.week,today:r.model.today})}
          ${Le({posts:r.model.posts,iconFn:c})}
        `:r.status==="error"?w=Ve({message:r.error}):w=Q({kpiCount:f.length});const v=ia({model:r.model,coverUrl:l.coverUrl,subscribed:l.subscribed,assets:Ye}),z=String(r.paywall||"").trim();s=`
        ${Ue({name:l.name,logoUrl:l.logoUrl,iconFn:c})}
        ${Te({cards:v,iconFn:c})}
        ${Ne(`
          ${Ie({iconFn:c})}
          ${Ee({iconFn:c,showEditor:!!i})}
          ${Me({actions:m,iconFn:c})}
          ${w}
        `)}
        ${z?Oe({title:Xe[z]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${s}
      </section>
    `}return Object.freeze({renderDashboardView:fe,loadDashboard:j})}export{ke as M,ua as a,De as b,xe as c,ca as d,ha as f,Pe as n};
