const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-BMcwEr5_.js","chunks/domain-feed-social-eager-Dqhq-M6R.js","chunks/domain-auth-Aq-4Vdvh.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-kMUdz6F4.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as be}from"./domain-auth-Aq-4Vdvh.js";import{f as z,r as ye,l as _e,s as Z}from"./domain-analytics-BNpk5u6w.js";const ve=20,we=8;function k(e=""){return e==null?"":String(e).trim()}function T(e){if(e==null||e==="")return null;const a=Number(String(e).replace(",","."));return Number.isFinite(a)&&a>0?a:null}function ke(e=Date.now(),a=Math.random()){const t=Math.max(0,Number(e)||0).toString(36),o=Math.floor(Math.max(0,Math.min(.999999,Number(a)||0))*36**6).toString(36).padStart(6,"0");return`room_${t}_${o}`}function xe(e={}){const a=e&&typeof e=="object"?e:{},t=[...Array.isArray(a.images)?a.images:[],k(a.imageUrl??a.image??a.photoUrl)],o=[];return t.forEach(n=>{const d=k(n);d&&!o.includes(d)&&o.push(d)}),o.slice(0,we)}function Se(e={},{index:a=0}={}){const t=e&&typeof e=="object"?e:{},o=T(t.persons??t.guests??t.capacity),n=T(t.size??t.sizeSqm??t.area),d=xe(t);return{id:k(t.id)||ke(Date.now()+a),title:k(t.title??t.name),description:k(t.description??t.text).slice(0,400),imageUrl:d[0]||"",images:d,price:T(t.price??t.pricePerNight),currency:k(t.currency??t.currencyCode).toUpperCase()||"EUR",persons:o==null?null:Math.min(20,Math.round(o)),beds:k(t.beds??t.bedsLabel).slice(0,60),size:n==null?null:Math.min(500,Math.round(n)),tag:k(t.tag??t.badge).slice(0,40),active:t.active!==!1}}function ze(e=[]){return(Array.isArray(e)?e:[]).slice(0,ve).map((a,t)=>Se(a,{index:t}))}function Pe(e={}){return ze((e&&typeof e=="object"?e:{}).hotelRooms).filter(t=>t.title)}function da(e={}){const a=[];return Number.isFinite(e?.persons)&&e.persons>0&&a.push({icon:"users",label:`${e.persons} persona`}),k(e?.beds)&&a.push({icon:"bed",label:k(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&a.push({icon:"size",label:`${e.size} m²`}),a}function la(e={}){const a=Number(e?.price);if(!Number.isFinite(a)||a<=0)return"";const t=k(e?.currency).toUpperCase()||"EUR",o=Number.isInteger(a)?String(a):a.toFixed(2);return t==="EUR"?`€${o}`:`${o} ${t}`}const G="mnyraDashboardStyles",De=`
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
  height: 228px;
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
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 86%, transparent 100%);
  mask-image: linear-gradient(180deg, #000 0%, #000 86%, transparent 100%);
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
/* Das untere Drittel ist eine geschlossene weisse Flaeche, die nach oben ins
   Bild ausblendet. So hat die Zahl ihren eigenen Grund - abgesetzt, nicht
   ueber dem Motiv - und die Kante dazwischen ist trotzdem keine harte Linie.
   Weiss statt Dunkelblau: die Karte gehoert damit zur hellen Seite, nicht zur
   schwarzen Posting-Karte. */
.mnyra-dash__hl-fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(0deg, #ffffff 0%, #ffffff 30%, rgba(255, 255, 255, 0.78) 44%, rgba(255, 255, 255, 0.3) 58%, rgba(255, 255, 255, 0) 72%);
}
.mnyra-dash__hl-body {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
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
  margin: 3px 0 0;
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
.mnyra-dash__hl-empty {
  display: block;
  /* Zwei Zeilen zu 11px mit 1.15 sind 25px - genau so hoch wie die Zahl der
     Nachbarkarten samt ihrer Marge (3 + 23). Die Beschriftungen stehen damit
     ueber alle vier Karten auf einer Linie. */
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.15;
  color: var(--dash-ink-2);
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
`;function Fe(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(G)))try{const a=e.createElement("style");a.id=G,a.textContent=De,e.head?.appendChild(a)}catch{}}function h(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function P(e,a,t=""){if(typeof e!="function")return"";try{return e(a,t)||""}catch{return""}}const Ce=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Be({businessType:e="",isShopCatalog:a=!1}={}){if(a)return"shop";const t=String(e||"").trim().toLowerCase();return Ce.includes(t)?"hotel":"restaurant"}function Re({kind:e="restaurant",isOwner:a=!1}={}){const t=[];return e==="hotel"?t.push({nav:"menu",iconName:"bed-double",label:"Hotel & Dhoma",sub:"Detaje, dhoma, oferta"}):e==="shop"?t.push({nav:"menu",iconName:"shopping-bag",label:"Ndrysho dyqanin",sub:"Produkte & Stok"}):t.push({nav:"menu",iconName:"utensils",label:"Ndrysho menune",sub:"Produkte & Kategorien"}),t.push({nav:"menu",iconName:"megaphone",label:"Oferta & Reklama",sub:"Im Editor verwalten"}),a&&t.push({nav:"businessAccounts",iconName:"users-round",label:"Team & Staff",sub:"Zugänge verwalten"}),t.push({nav:"settings",iconName:"settings",label:"Cilesimet",sub:"Profili & Kontakti"}),t}function $e(e="restaurant"){const a=[{key:"profileViews",label:"Profilaufrufe"},{key:"postImpressions",label:"Shtrirja e postimeve"},{key:"contactClicks",label:"Kontakt-Klicks"}];return e==="shop"?a.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"productViews",label:"Produkt-Aufrufe"}]):e==="hotel"?a.concat([{key:"uniqueVisitors",label:"Vizitore"},{key:"postLikes",label:"Likes"},{key:"feedImpressions",label:"Shtrirja ne feed"}]):a.concat([{key:"ordersCompleted",label:"Porosite"},{key:"revenue",label:"Umsatz",unit:"€"},{key:"qrScans",label:"QR-Scans"}])}function W(e=0,a=""){const t=z(e);return a?`${t} ${a}`:t}function Ke(e=new Date().getHours()){const a=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return a>=5&&a<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:a>=11&&a<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:a>=18&&a<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function je({name:e="",logoUrl:a="",hour:t=new Date().getHours(),iconFn:o}={}){const n=Ke(t),d=h(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${a?`<img src="${h(a)}" alt="${d}" title="${d}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${d}">${P(o,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${h(n.text)}</p>
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
  `}function Ee({actions:e=[],iconFn:a}={}){return`<div class="mnyra-dash__actions">${(Array.isArray(e)?e:[]).map(o=>`
      <button type="button" class="mnyra-dash__action" data-nav="${h(o.nav)}">
        <span class="mnyra-dash__action-icon">${P(a,o.iconName,"w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${h(o.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${h(o.sub||"")}</span>
        </span>
      </button>
    `).join("")}</div>`}function Me({cards:e=[],iconFn:a}={}){const t=(Array.isArray(e)?e:[]).filter(n=>n&&n.key);return t.length?`
    <div class="mnyra-dash__hl" data-dashboard-metrics>
      ${t.map((n,d)=>{const m=h(n.label||"");if(n.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const f=d<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',v=`
      <span class="mnyra-dash__hl-plate">${P(a,n.iconName||"image","w-6 h-6")}</span>
      ${n.imageUrl?`<img class="mnyra-dash__hl-media" src="${h(n.imageUrl)}" alt="" ${f} decoding="async" onerror="this.style.display='none'" />`:""}
    `,x=n.withEye?`<span class="mnyra-dash__hl-eye">${P(a,"eye","w-4 h-4")}</span>`:"";let c;n.locked?c=`<span class="mnyra-dash__hl-lock">${P(a,"lock","w-3 h-3")}Me pagesë</span>`:n.loading?c='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':n.emptyText?c=`<span class="mnyra-dash__hl-empty">${h(n.emptyText)}</span>`:c=`<span class="mnyra-dash__hl-value">${x}${h(n.value||"0")}</span>`;let g;n.locked?g=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${h(n.key)}"`:n.composer?g=`class="mnyra-dash__hl-card" data-dashboard-composer="${h(n.composer)}"`:g=`class="mnyra-dash__hl-card"${n.nav?` data-nav="${h(n.nav)}"`:""}`;const I=n.locked?`${m} – me pagesë`:`${m} ${n.emptyText||n.value||""}`.trim();return`
      <button type="button" ${g} data-dashboard-metric="${h(n.key)}" aria-label="${h(I)}">
        ${v}
        <span class="mnyra-dash__hl-fade"></span>
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${m}</span>
          ${c}
        </span>
      </button>
    `}).join("")}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `:""}function Ue(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function Te({kpiDefs:e=[],week:a={},today:t={}}={}){return`
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${(Array.isArray(e)?e:[]).map(n=>`
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${h(n.label)}</p>
      <p class="mnyra-dash__kpi-value">${h(W(a?.[n.key]||0,n.unit||""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${h(W(t?.[n.key]||0,n.unit||""))}</p>
    </div>
  `).join("")}</div>
    </div>
  `}function Ne({posts:e=[],iconFn:a}={}){const t=Array.isArray(e)?e:[];let o="";return t.length?(o=t.map(n=>{const d=[n.dateLabel,`${z(n.likesCount||0)} Likes`,`${z(n.commentsCount||0)} Kommentare`];return Number(n.impressions||0)>0&&d.push(`${z(n.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${n.thumbUrl?`<img src="${h(n.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:P(a,n.mediaType==="video"?"play":"image","w-5 h-5")}
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
  `}function Le({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${h(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function Ae(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function Oe({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${h(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function He(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const Ve="menyra_social_dashboard_cache_v1::",Q="menyra_social_composer_products_v1::",qe=2500,Ze=1200,Ge=6,We=3,Je=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),Qe=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function y(e){const a=Number(e);return Number.isFinite(a)?a:0}function Ye(e={}){const a=String(e.createdAtClient||"").trim();if(a){const o=new Date(a);if(!Number.isNaN(o.getTime()))return o}const t=e.createdAt;if(t&&typeof t.toDate=="function")try{const o=t.toDate();if(o instanceof Date&&!Number.isNaN(o.getTime()))return o}catch{}return null}function Xe(e="",a={}){const t=Array.isArray(a.media)&&a.media.length?a.media[0]:{},o=String(t.type||a.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",n=String(t.thumbUrl||(o==="image"?t.url:"")||a.thumbUrl||"").trim(),d=Ye(a);return{id:String(e||"").trim(),caption:String(a.caption||"").trim(),mediaType:o,thumbUrl:n,likesCount:y(a.likesCount),commentsCount:y(a.commentsCount),impressions:0,dateLabel:d?d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:d?d.getTime():0}}function ea({days:e=[],todayKey:a="",rawPosts:t=[]}={}){const o=Array.isArray(e)?e:[],n=Z(o),d=o.find(c=>String(c?.date||c?.id||"").trim()===String(a||"").trim()),m=Z(d?[d]:[]),f=n.merged?.posts&&typeof n.merged.posts=="object"?n.merged.posts:{},v=(Array.isArray(t)?t:[]).map(c=>Xe(c?.id,c?.data||{})).filter(c=>c.id).map(c=>({...c,impressions:y(f[c.id]?.impressions)})),x=v.slice().sort((c,g)=>g.createdAtMs-c.createdAtMs).slice(0,We);return{day:String(a||"").trim(),week:n.summary,today:m.summary,posts:x,bestPost:aa(v)}}function aa(e=[]){const a=(Array.isArray(e)?e:[]).filter(t=>t&&t.id);return a.length?a.slice().sort((t,o)=>y(o.impressions)-y(t.impressions)||y(o.likesCount)-y(t.likesCount)||y(o.createdAtMs)-y(t.createdAtMs))[0]:null}const ta=Object.freeze(["pro","premium","plus","business","paid","active"]);function na({profile:e={},restaurant:a={}}={}){const t=[a||{},e||{}];for(const o of t){if(o.subscriptionActive===!0||o.isSubscriber===!0||o.hasSubscription===!0)return!0;const n=String(o.subscriptionPlan||o.planKey||o.plan||o.subscriptionStatus||"").trim().toLowerCase();if(n&&ta.includes(n))return!0}return!1}function ra(e={}){const a=e&&typeof e=="object"?e:{};return String(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||a.bannerUrl||"").trim()}function sa({model:e=null,coverUrl:a="",subscribed:t=!1,assets:o={}}={}){const n=e?.today||{},d=!e,m=e?.bestPost||null,f=[];return d?f.push({key:"bestPost",label:"Postimi",pending:!0}):m?f.push({key:"bestPost",label:"Postimi",value:z(y(m.impressions)),withEye:!0,imageUrl:String(m.thumbUrl||"").trim(),iconName:"image",nav:"analytics"}):f.push({key:"bestPost",label:"Postimi",emptyText:"Ende s'keni bërë postim",iconName:"image",composer:"post"}),f.push({key:"profileViews",label:"Profili sot",value:z(y(n.profileViews)),loading:d,imageUrl:String(a||"").trim(),iconName:"user",nav:"analytics"}),f.push({key:"menuOpens",label:"Menyja sot",value:z(y(n.menuOpens)),loading:d&&t,locked:!t,imageUrl:String(o.menuImageUrl||"").trim(),iconName:"book-open",nav:"analytics"}),f.push({key:"qrScans",label:"Skanime sot",value:z(y(n.qrScans)),loading:d&&t,locked:!t,imageUrl:String(o.qrImageUrl||"").trim(),iconName:"layout-grid",nav:"analytics"}),f}function ca({state:e,renderFn:a,documentObj:t,firestoreApi:o={},profileApi:n={},composerApi:d={},iconFn:m,storageObj:f}={}){const v=t||(typeof document>"u"?null:document),x=v?.defaultView||(typeof window>"u"?null:window),c=typeof a=="function"?a:()=>{},g=f||(typeof localStorage>"u"?null:localStorage),I=typeof n.getBusinessProfileTypeFn=="function"?n.getBusinessProfileTypeFn:(()=>""),Y=typeof n.isShopCatalogProfileFn=="function"?n.isShopCatalogProfileFn:(()=>!1),X=typeof n.isBusinessOwnerProfileFn=="function"?n.isBusinessOwnerProfileFn:(()=>!1),E=typeof n.getRestaurantMetaByIdFn=="function"?n.getRestaurantMetaByIdFn:(()=>null),ee=typeof n.resolveRestaurantLogoFn=="function"?n.resolveRestaurantLogoFn:(()=>""),ae=typeof n.resolveOwnAvatarUrlFn=="function"?n.resolveOwnAvatarUrlFn:(()=>"");let C=0,N=!1,D=null,B=null,R="",L=!1,A=()=>null;const te=300;function M(){const i=e?.userProfile||{};return Be({businessType:I(i),isShopCatalog:Y(i)})}function ne(i=""){const r=E(i)||{};return Pe(r).map(s=>({id:s.id,name:s.title,price:s.price??"",category:s.beds||s.tag||"",type:"room",imageUrl:s.imageUrl||""}))}function re(i=""){if(!g)return null;try{const r=g.getItem(`${Q}${i}`);if(!r)return null;const s=JSON.parse(r),l=Array.isArray(s?.items)?s.items:null;return l&&l.length?l:null}catch{return null}}function se(i="",r=[]){if(g)try{g.setItem(`${Q}${i}`,JSON.stringify({savedAt:Date.now(),items:r}))}catch{}}async function ie(i=""){const{db:r,collectionFn:s,queryFn:l,limitFn:u,getDocsFn:p}=o;if(!r||typeof s!="function"||typeof p!="function")throw new Error("Produktet nuk u ngarkuan.");const w=s(r,"restaurants",i,"menuItems"),_=typeof l=="function"&&typeof u=="function"?l(w,u(te)):w,S=await p(_),b=[];return S.forEach(F=>{const j=A(F?.id,F?.data?.()||{});j&&b.push(j)}),b.sort((F,j)=>F.name.localeCompare(j.name,"sq")),b}async function oe(i="",r){const s=String(i||"").trim();if(!s)throw new Error("Produktet nuk u ngarkuan.");if(M()==="hotel")return ne(s);const l=ie(s).then(p=>(se(s,p),p)),u=re(s);return u?(typeof r=="function"?l.then(p=>r(p)).catch(()=>{}):l.catch(()=>{}),u):l}function O(){return D?Promise.resolve(D):(B||(B=be(()=>import("./business-composer-controller-BMcwEr5_.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(i=>(A=typeof i?.normalizeComposerProductCore=="function"?i.normalizeComposerProductCore:(()=>null),D=i.createBusinessComposerController({documentObj:v,windowObj:v?.defaultView||null,api:{getRestaurantIdFn:()=>$(),getBusinessMetaFn:()=>{const r=$();if(!r)return{name:"",logoUrl:"",city:""};const s=q(r),l=E(r)||{};return{name:s.name,logoUrl:s.logoUrl,city:String(l.city||"").trim()}},loadProductsFn:(r,s)=>oe(r,s),getBusinessKindFn:()=>M(),uploadImageFn:d.uploadImageFn,uploadVideoFn:d.uploadVideoFn,captureVideoPosterFn:d.captureVideoPosterFn,createPostFn:d.createPostFn,createStoryFn:d.createStoryFn,formatPriceFn:d.formatPriceFn,getOptimizedImageUrlFn:d.getOptimizedImageUrlFn,escapeHtmlFn:d.escapeHtmlFn,iconFn:typeof m=="function"?m:void 0,afterPublishFn:async r=>{try{await K({force:!0})}catch{}typeof d.afterPublishFn=="function"&&await d.afterPublishFn(r)}}}),D)).catch(i=>{throw B=null,console.error("[mnyra][dashboard] composer load failed",i),i})),B)}function de(){const i=x?.navigator?.connection;return!i||typeof i!="object"?!1:i.saveData===!0?!0:/(^|-)2g$/.test(String(i.effectiveType||"").trim().toLowerCase())}function le(){if(L||D||!x||de())return;L=!0;const i=()=>{if(O().catch(()=>{}),typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}};if(typeof x.requestIdleCallback=="function"){x.requestIdleCallback(i,{timeout:qe});return}x.setTimeout?.(i,Ze)}function ce(i="post"){const r=String(i||"").trim().toLowerCase(),s=r==="story"||r==="profile"?r:"post";if(typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}if(D){D.open(s);return}R=s,O().then(l=>{const u=R||s;R="",l?.open?.(u)}).catch(()=>{R=""})}function U(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function H(i=""){const r=U(),s=String(i||"").trim();return String(r.restaurantId||"")===s||(r.restaurantId=s,r.model=null,r.status="idle",r.error="",r.loadedSignature="",r.paywall="",C+=1),r}function $(){const i=e?.userProfile||{};return String(i.restaurantId||i.staffRestaurantId||"").trim()}function he(){const i=String(e?.user?.uid||"").trim();if(!i)return!1;const r=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||r===i}function V(i=""){return`${Ve}${i}`}function ue(i="",r=""){if(!g||!i)return null;try{const s=g.getItem(V(i));if(!s)return null;const l=JSON.parse(s);return!l||typeof l!="object"||String(l.day||"").trim()!==String(r||"").trim()||!l.model||typeof l.model!="object"?null:l.model}catch{return null}}function me(i="",r=null){if(!(!g||!i||!r))try{g.setItem(V(i),JSON.stringify({day:r.day,model:r}))}catch{}}async function pe(i=""){const{db:r,collectionFn:s,queryFn:l,orderByFn:u,limitFn:p,getDocsFn:w}=o;if(!r||typeof s!="function"||typeof l!="function"||typeof u!="function"||typeof p!="function"||typeof w!="function")return[];const _=s(r,"restaurants",i,"socialPosts");return(await w(l(_,u("createdAt","desc"),p(Ge)))).docs.map(b=>({id:b.id,data:b.data()||{}})).filter(b=>{const F=String(b.data.status||"active").trim().toLowerCase();return F!=="deleted"&&F!=="hidden"})}async function K({force:i=!1}={}){const r=$(),s=H(r);if(!r)return;const l=ye({rangeKey:"7d"});if(!l)return;const u=`${r}::${l.toDay}`;if(!i&&s.loadedSignature===u&&s.status==="ready")return;if(!s.model){const _=ue(r,l.toDay);_&&(s.model=_,s.status="ready",c())}C+=1;const p=C;s.model||(s.status="loading",s.error="",c());try{const _={db:o.db,collectionFn:o.collectionFn,queryFn:o.queryFn,whereFn:o.whereFn,documentIdFn:o.documentIdFn,getDocsFn:o.getDocsFn,restaurantId:r},[S,b]=await Promise.allSettled([_e({..._,fromDay:l.fromDay,toDay:l.toDay}),pe(r)]);if(p!==C)return;if(S.status==="rejected")throw S.reason;b.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",b.reason),s.model=ea({days:S.value,todayKey:l.toDay,rawPosts:b.status==="fulfilled"?b.value:[]}),s.status="ready",s.error="",s.loadedSignature=u,me(r,s.model)}catch(_){if(p!==C)return;console.error("[mnyra][dashboard] load failed",_),s.model||(s.status="error",s.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}c()}function ge(){N||!v||(N=!0,v.addEventListener("click",i=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(i.target?.closest?.("[data-dashboard-retry]")){K({force:!0});return}if(i.target?.closest?.("[data-dashboard-paywall-close]")){i.preventDefault(),U().paywall="",c();return}const r=i.target?.closest?.("[data-dashboard-metric-locked]");if(r){i.preventDefault(),U().paywall=String(r.getAttribute("data-dashboard-metric-locked")||"").trim(),c();return}const s=i.target?.closest?.("[data-dashboard-composer]");s&&(i.preventDefault(),ce(s.getAttribute("data-dashboard-composer")))}catch{}}))}function q(i=""){const r=e?.userProfile||{},s=i?E(i)||{}:{},l=String(s.name||s.restaurantName||r.name||"").trim()||"Business";let u="";try{u=String(ae()||"").trim()}catch{}if(!u)try{u=String(ee(s)||"").trim()}catch{}return{name:l,logoUrl:u,kind:M(),coverUrl:ra(s),subscribed:na({profile:r,restaurant:s})}}function fe(){Fe(v),ge();const i=$(),r=H(i);let s="";if(!i)s=he()?`${Ae()}${J({kpiCount:6})}`:He();else{le();const l=q(i),u=Re({kind:l.kind,isOwner:X(e?.userProfile)}),p=$e(l.kind);r.status==="idle"&&(r.status="loading",queueMicrotask(()=>{K({force:!1})}));let w="";r.model?w=`
          ${Te({kpiDefs:p,week:r.model.week,today:r.model.today})}
          ${Ne({posts:r.model.posts,iconFn:m})}
        `:r.status==="error"?w=Oe({message:r.error}):w=J({kpiCount:p.length});const _=sa({model:r.model,coverUrl:l.coverUrl,subscribed:l.subscribed,assets:Je}),S=String(r.paywall||"").trim();s=`
        ${je({name:l.name,logoUrl:l.logoUrl,iconFn:m})}
        ${Me({cards:_,iconFn:m})}
        ${Ue(`
          ${Ie({iconFn:m})}
          ${Ee({actions:u,iconFn:m})}
          ${w}
        `)}
        ${S?Le({title:Qe[S]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${s}
      </section>
    `}return Object.freeze({renderDashboardView:fe,loadDashboard:K})}export{we as M,ca as a,Pe as b,ke as c,da as d,la as f,ze as n};
