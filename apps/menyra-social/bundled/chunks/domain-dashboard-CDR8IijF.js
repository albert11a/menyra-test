const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-1ZvDE4UD.js","chunks/domain-feed-social-eager-njpuzaTi.js","chunks/domain-auth-CdW0dNSS.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-BCyBYBIO.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as Fe}from"./domain-auth-CdW0dNSS.js";import{f as B,r as Be,l as Ce,s as X}from"./domain-analytics-YvFkDAlU.js";import{b as Re}from"./domain-business-accounts-D8NpUhi6.js";const $e=20,Ke=8;function x(e=""){return e==null?"":String(e).trim()}function L(e){if(e==null||e==="")return null;const a=Number(String(e).replace(",","."));return Number.isFinite(a)&&a>0?a:null}function je(e=Date.now(),a=Math.random()){const t=Math.max(0,Number(e)||0).toString(36),o=Math.floor(Math.max(0,Math.min(.999999,Number(a)||0))*36**6).toString(36).padStart(6,"0");return`room_${t}_${o}`}function Ee(e={}){const a=e&&typeof e=="object"?e:{},t=[...Array.isArray(a.images)?a.images:[],x(a.imageUrl??a.image??a.photoUrl)],o=[];return t.forEach(r=>{const d=x(r);d&&!o.includes(d)&&o.push(d)}),o.slice(0,Ke)}function Ae(e={},{index:a=0}={}){const t=e&&typeof e=="object"?e:{},o=L(t.persons??t.guests??t.capacity),r=L(t.size??t.sizeSqm??t.area),d=Ee(t);return{id:x(t.id)||je(Date.now()+a),title:x(t.title??t.name),description:x(t.description??t.text).slice(0,400),imageUrl:d[0]||"",images:d,price:L(t.price??t.pricePerNight),currency:x(t.currency??t.currencyCode).toUpperCase()||"EUR",persons:o==null?null:Math.min(20,Math.round(o)),beds:x(t.beds??t.bedsLabel).slice(0,60),size:r==null?null:Math.min(500,Math.round(r)),tag:x(t.tag??t.badge).slice(0,40),active:t.active!==!1}}function Te(e=[]){return(Array.isArray(e)?e:[]).slice(0,$e).map((a,t)=>Ae(a,{index:t}))}function Ue(e={}){return Te((e&&typeof e=="object"?e:{}).hotelRooms).filter(t=>t.title)}function va(e={}){const a=[];return Number.isFinite(e?.persons)&&e.persons>0&&a.push({icon:"users",label:`${e.persons} persona`}),x(e?.beds)&&a.push({icon:"bed",label:x(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&a.push({icon:"size",label:`${e.size} m²`}),a}function ka(e={}){const a=Number(e?.price);if(!Number.isFinite(a)||a<=0)return"";const t=x(e?.currency).toUpperCase()||"EUR",o=Number.isInteger(a)?String(a):a.toFixed(2);return t==="EUR"?`€${o}`:`${o} ${t}`}const Q="mnyraDashboardStyles",Ie=`
.mnyra-dash {
  /* Horizontale Flucht auf die SICHTBAREN Header-Icons (nicht die
     unsichtbaren Touch-Kreise): Menue-Striche beginnen bei 28px,
     Warenkorb-Symbol endet bei 30px vom rechten Rand - 28px beidseitig
     trifft beide optisch (rechts 2px Toleranz, im Browser vermessen). */
  padding: 16px 28px 112px;
  /* Die Seite reicht mindestens bis zum unteren Bildschirmrand, und das Bento
     waechst in den Rest hinein.
     ===================================================================
     Ohne das endete das weisse Bento dort, wo sein Inhalt endete. Darunter
     kam die Flaeche der App (--app-bg, #f8fafc) - und genau diese Kante sah
     man als Farbunterschied, sobald der Inhalt kuerzer war als der
     Bildschirm. Das Bento hoerte nicht zu frueh auf; es war nur nie laenger
     als noetig.
     Dasselbe Mittel benutzt das Feed-Gate schon (#feedLocationGate:
     min-height 100svh, im Standalone 100dvh). "svh" und nicht "dvh" oder
     --viewport-height: der kleine Viewport aendert sich NICHT, wenn auf iOS
     die Adressleiste ein- und ausfaehrt. Eine Hoehe, die das tut, laesst das
     Dokument unter dem Finger wachsen - dieser Fehler stand hier schon einmal
     (siehe app-main-scroll in index.html) und soll nicht zurueckkommen. */
  display: flex;
  flex-direction: column;
  min-height: 100svh;
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
  --dash-bento-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);
  /* Das Bildfenster der Kennzahl-Karten. Eine Zahl fuer alle vier, damit die
     Reihe eine Linie haelt - und die Zahl, auf die die beiden festen Fotos
     zugeschnitten sind. */
  --dash-hl-media: 140px;
  color: var(--dash-ink);
  font-family: inherit;
}
/* Als installierte App gibt es keine Adressleiste, die den Viewport kleiner
   machen koennte - dort ist der dynamische Viewport der ehrlichere Wert.
   Dieselbe Ausnahme macht das Feed-Gate. */
html.is-standalone .mnyra-dash { min-height: 100dvh; }
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
  margin: 28px -28px 0;
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
     unter dem Bild Luft, statt ihn an die Kante zu setzen. Der Textblock traegt
     zwei Zeilen Beschriftung (25px) und darunter die Zahl - deshalb 88px und
     nicht mehr 74px. */
  height: calc(var(--dash-hl-media) + 88px);
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
/* Ueber dem Bildfenster lag frueher ein weisser Verlauf, der seine Unterkante
   ausblendete. Er ist weg: das Bild steht jetzt ganz und scharf im Fenster und
   endet an dessen Kante. Beschriftung und Zahl standen ohnehin schon unter dem
   Fenster im Weissen - fuer sie aendert sich dadurch nichts. */
/* Beschriftung und Zahl stehen unter dem Bildfenster, mit Abstand dazu. Die
   14px sind dieser Abstand - er faengt dort an, wo das Fenster endet. */
.mnyra-dash__hl-body {
  position: absolute;
  left: 12px;
  right: 12px;
  top: calc(var(--dash-hl-media) + 14px);
  z-index: 2;
}
/* Zwei Zeilen, immer - auch wenn die Beschriftung nur eine braucht.
   "Skanime n'tavolina" passt auf dieser Kartenbreite nicht in eine Zeile;
   abgeschnitten waere sie unlesbar. Der Platz fuer die zweite Zeile ist
   deshalb auf JEDER Karte reserviert (min-height), nicht nur wo er gebraucht
   wird: so stehen die Zahlen aller vier Karten auf derselben Hoehe. Eine
   dritte Zeile gibt es nicht - danach endet die Beschriftung mit Punkten. */
.mnyra-dash__hl-label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  min-height: 25px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: var(--dash-muted);
  overflow: hidden;
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
  /* Der Abstand nach oben ist die Luft zwischen der Kennzahl-Reihe und der
     Flaeche. Er ist bewusst gross: die Reihe soll als eigenes Stueck lesen und
     nicht an der Flaeche kleben, die gleich darunter anfaengt. */
  margin: 72px -28px calc(-1 * var(--dash-bento-tail));
  padding: 22px 28px var(--dash-bento-tail);
  background: var(--dash-surface);
  border-top: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-radius) var(--dash-bento-radius) 0 0;
  /* Dieselbe weiche Kante wie unter dem Header, nur nach oben gedreht: die
     Flaeche beginnt sichtbar, statt an der Haarlinie einfach umzuschlagen.
     Es ist der Schatten, den auch das Bento der Lokale-Seite traegt. */
  box-shadow: var(--dash-bento-shadow);
  /* Das Bento nimmt den Rest der Seite ein. Nur so fuellt die Mindesthoehe von
     .mnyra-dash auch wirklich mit Weiss - ohne dies bliebe der gewonnene Platz
     durchsichtig, und die Kante waere nur nach unten gerutscht.
     "0 auto" und nicht "0 0": das Bento darf nie kleiner werden als sein
     Inhalt. */
  flex: 1 0 auto;
}
/* Alles im Bento haelt denselben Abstand zum Stueck darueber. Das erste
   Stueck - die Tab-Leiste - braucht keinen: dort ist das Polster des Bentos
   schon sein Abstand. */
.mnyra-dash__bento > .mnyra-dash__section,
.mnyra-dash__bento > .mnyra-dash__embed,
.mnyra-dash__bento > .mnyra-dash__composer { margin-top: 22px; }
.mnyra-dash__bento > .mnyra-dash__tabs { margin-top: 0; }
/* Die Leiste braucht Luft nach unten, mehr als der Abstand zwischen zwei
   Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Die 32px trennen die Wahl sichtbar vom Gewaehlten. */
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__composer,
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__embed,
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__section { margin-top: 32px; }
/* Die Tab-Leiste oben im Bento: Funksionet, Analitika, Opsionet.
   Drei Knoepfe, sonst nichts - kein Grund, kein Rahmen, kein Polster um sie
   herum. Frueher lagen sie in einem eigenen Kasten; der schob sie um seine
   Polsterbreite nach innen und brachte sie damit aus der Flucht der Karten
   darunter. Ohne ihn stehen sie genau dort, wo auch "Posto n'Mnyra" anfaengt
   und aufhoert - links wie rechts. */
.mnyra-dash__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
/* Symbol und Wort stehen in EINER Zeile und auf EINER Grundlinie: beide sind
   Flex-Kinder mit gleicher Ausrichtung, das Symbol in fester Groesse. Genau
   daran gehen solche Leisten sonst schief - ein Symbol, das seine Hoehe aus
   der Zeile zieht, sitzt auf jeder Zeile anders. */
.mnyra-dash__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  padding: 11px 8px;
  border: 1px solid var(--dash-hairline);
  /* Ganz rund, wie die Zeitraum-Knoepfe der Analitika. Beide sagen dasselbe -
     "waehle eines von mehreren" - und sollen deshalb gleich aussehen. */
  border-radius: 999px;
  background: var(--dash-plane);
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  color: var(--dash-ink-2);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier.
   "block" nimmt ihnen die Grundlinien-Luecke, die ein Inline-Element unter
   sich laesst - sonst saesse das Wort daneben minimal zu hoch. */
.mnyra-dash__tab svg,
.mnyra-dash__tab i {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  display: block;
}
.mnyra-dash__tab-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Der gewaehlte Knopf traegt dieselbe Flaeche wie die Posting-Karte darunter:
   dasselbe Schwarz, dieselbe weisse Schrift. Beides ist das Gewichtigste auf
   seiner Hoehe, und beides gehoert zusammen. */
.mnyra-dash__tab[aria-selected="true"] {
  background: var(--dash-black);
  border-color: var(--dash-black);
  color: var(--dash-black-ink);
}
.mnyra-dash__tab:active { transform: scale(0.98); }
/* Analitika und Opsionet bringen ihre eigene Ansicht mit - samt eigenem
   Seitenpolster. Das Bento hat seines schon; beide zusammen waeren doppelt.
   Der Rahmen nimmt deshalb das Polster des Bentos zurueck und laesst der
   Ansicht darin ihr eigenes. */
.mnyra-dash__embed {
  margin-left: -28px;
  margin-right: -28px;
  margin-bottom: calc(-1 * var(--dash-bento-tail));
}
/* Die Faecher der Kennzahlen-Reihe (.mnyra-dash__kpi*) standen hier. Mit der
   Reihe selbst sind auch sie weg - die Analitika bringt ihre eigene Form mit. */
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
`;function Me(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(Q)))try{const a=e.createElement("style");a.id=Q,a.textContent=Ie,e.head?.appendChild(a)}catch{}}function h(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function _(e,a,t=""){if(typeof e!="function")return"";try{return e(a,t)||""}catch{return""}}const Le=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Ne({businessType:e="",isShopCatalog:a=!1}={}){if(a)return"shop";const t=String(e||"").trim().toLowerCase();return Le.includes(t)?"hotel":"restaurant"}function Oe(e=new Date().getHours()){const a=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return a>=5&&a<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:a>=11&&a<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:a>=18&&a<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function He({name:e="",logoUrl:a="",hour:t=new Date().getHours(),iconFn:o}={}){const r=Oe(t),d=h(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${a?`<img src="${h(a)}" alt="${d}" title="${d}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${d}">${_(o,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${h(r.text)}</p>
    </div>
  `}function Ve({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${_(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${_(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Ze({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${_(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${_(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function qe({iconFn:e,showEditor:a=!0}={}){return a?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${_(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${_(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const ee=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function Ge(e="restaurant"){const a=String(e||"").trim().toLowerCase();return ee[a]||ee.restaurant}function We({iconFn:e,kind:a="restaurant",showEditor:t=!0}={}){if(!t)return"";const o=Ge(a);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${h(o.accent)}</span> ${h(o.rest)}</span>
      <span class="mnyra-dash__composer-sub">${h(o.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${_(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${h(o.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${_(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Je({cards:e=[],iconFn:a}={}){const t=(Array.isArray(e)?e:[]).filter(r=>r&&r.key);if(!t.length)return"";const o=t.map((r,d)=>{const m=h(r.label||"");if(r.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const p=d<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let k="";r.imageUrl?k=`<img class="mnyra-dash__hl-media" src="${h(r.imageUrl)}" alt="" ${p} decoding="async" onerror="this.style.display='none'" />`:r.videoUrl&&(k=`<video class="mnyra-dash__hl-media" src="${h(r.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const S=`
      <span class="mnyra-dash__hl-plate">${_(a,r.iconName||"image","w-6 h-6")}</span>
      ${k}
    `,u=r.withEye?`<span class="mnyra-dash__hl-eye">${_(a,"eye","w-4 h-4")}</span>`:"";let f;r.locked?f=`<span class="mnyra-dash__hl-lock">${_(a,"lock","w-3 h-3")}Me pagesë</span>`:r.loading?f='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':r.emptyText?f=`<span class="mnyra-dash__hl-empty">${h(r.emptyText)}</span>`:f=`<span class="mnyra-dash__hl-value">${u}${h(r.value||"0")}</span>`;let w;r.locked?w=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${h(r.key)}"`:r.composer?w=`class="mnyra-dash__hl-card" data-dashboard-composer="${h(r.composer)}"`:w=`class="mnyra-dash__hl-card"${r.panelTab?` data-dashboard-panel-tab="${h(r.panelTab)}"`:""}`;const T=r.locked?`${m} – me pagesë`:`${m} ${r.emptyText||r.value||""}`.trim();return`
      <button type="button" ${w} data-dashboard-metric="${h(r.key)}" aria-label="${h(T)}">
        ${S}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${m}</span>
          ${f}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-dash__hl" data-dashboard-metrics="${h(Ye(t))}">
      ${o}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function Ye(e=[]){return(Array.isArray(e)?e:[]).filter(a=>a&&a.key).map(a=>[a.key,a.label||"",a.value||"",a.emptyText||"",a.imageUrl||"",a.videoUrl||"",a.iconName||"",a.panelTab||"",a.composer||"",a.pending?"p":"",a.loading?"l":"",a.locked?"x":"",a.withEye?"e":""].join("~")).join("|")}const re=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function A(e=""){const a=String(e||"").trim().toLowerCase();return re.some(t=>t.id===a)?a:"funksionet"}function Xe({activeTab:e="funksionet",iconFn:a}={}){const t=A(e);return`<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${re.map(r=>{const d=r.id===t;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${h(r.id)}"
        aria-selected="${d?"true":"false"}"
        class="mnyra-dash__tab"
      >${_(a,r.iconName,"w-4 h-4")}<span class="mnyra-dash__tab-label">${h(r.label)}</span></button>
    `}).join("")}</div>`}function se(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function Qe({posts:e=[],iconFn:a}={}){const t=Array.isArray(e)?e:[];let o="";return t.length?(o=t.map(r=>{const d=[r.dateLabel,`${B(r.likesCount||0)} Likes`,`${B(r.commentsCount||0)} Kommentare`];return Number(r.impressions||0)>0&&d.push(`${B(r.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${r.thumbUrl?`<img src="${h(r.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:_(a,r.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${h(r.caption||"Pa tekst")}</p>
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
  `}function ea(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function aa({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${h(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function ta(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function na(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),a=Array.from({length:4},(t,o)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${o===0?32:22}px;"></div>`).join("");return`
    ${ta()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${se(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>').join("")}
      </div>
      ${a}
    `)}
  `}function ra({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${h(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function sa(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const ia="menyra_social_dashboard_cache_v1::",ae="menyra_social_composer_products_v1::",te=2500,ne=1200,oa=6,da=3,la=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),ca=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function v(e){const a=Number(e);return Number.isFinite(a)?a:0}function ha(e={}){const a=String(e.createdAtClient||"").trim();if(a){const o=new Date(a);if(!Number.isNaN(o.getTime()))return o}const t=e.createdAt;if(t&&typeof t.toDate=="function")try{const o=t.toDate();if(o instanceof Date&&!Number.isNaN(o.getTime()))return o}catch{}return null}function ua(e="",a={}){const t=Array.isArray(a.media)&&a.media.length?a.media[0]:{},o=String(t.type||a.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",r=String(t.thumbUrl||(o==="image"?t.url:"")||a.thumbUrl||"").trim(),d=o==="video"?String(t.url||a.mediaUrl||"").trim():"",m=ha(a);return{id:String(e||"").trim(),caption:String(a.caption||"").trim(),mediaType:o,thumbUrl:r,videoUrl:d,likesCount:v(a.likesCount),commentsCount:v(a.commentsCount),impressions:0,dateLabel:m?m.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:m?m.getTime():0}}function ma({days:e=[],todayKey:a="",rawPosts:t=[]}={}){const o=Array.isArray(e)?e:[],r=X(o),d=o.find(u=>String(u?.date||u?.id||"").trim()===String(a||"").trim()),m=X(d?[d]:[]),p=r.merged?.posts&&typeof r.merged.posts=="object"?r.merged.posts:{},k=(Array.isArray(t)?t:[]).map(u=>ua(u?.id,u?.data||{})).filter(u=>u.id).map(u=>({...u,impressions:v(p[u.id]?.impressions)})),S=k.slice().sort((u,f)=>f.createdAtMs-u.createdAtMs).slice(0,da);return{day:String(a||"").trim(),week:r.summary,today:m.summary,posts:S,latestPost:pa(k)}}function pa(e=[]){const a=(Array.isArray(e)?e:[]).filter(t=>t&&t.id);return a.length?a.slice().sort((t,o)=>v(o.createdAtMs)-v(t.createdAtMs)||v(o.impressions)-v(t.impressions)||v(o.likesCount)-v(t.likesCount))[0]:null}function ba({profile:e={},restaurant:a={}}={}){return Re({profile:e,restaurant:a,feature:"qr"})}function ga(e={}){const a=e&&typeof e=="object"?e:{};return String(a.titleImageUrl||a.coverImageUrl||a.coverUrl||a.heroUrl||a.bannerUrl||"").trim()}function fa({model:e=null,coverUrl:a="",subscribed:t=!1,assets:o={}}={}){const r=e?.today||{},d=!e,m=e?.latestPost||null,p=[];if(d)p.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!m)p.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const k=String(m.thumbUrl||"").trim();p.push({key:"latestPost",label:"Postimi fundit",value:B(v(m.impressions)),withEye:!0,imageUrl:k,videoUrl:k?"":String(m.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return p.push({key:"profileViews",label:"Vizitor n'profil",value:B(v(r.profileViews)),withEye:!0,loading:d,imageUrl:String(a||"").trim(),iconName:"user",panelTab:"analitika"}),p.push({key:"menuOpens",label:"Vizitor n'meny",value:B(v(r.menuOpens)),withEye:!0,loading:d&&t,locked:!t,imageUrl:String(o.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),p.push({key:"qrScans",label:"Skanime n'tavolina",value:B(v(r.qrScans)),withEye:!0,loading:d&&t,locked:!t,imageUrl:String(o.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),p}function xa({state:e,renderFn:a,documentObj:t,firestoreApi:o={},profileApi:r={},composerApi:d={},viewApi:m={},iconFn:p,storageObj:k}={}){const S=t||(typeof document>"u"?null:document),u=S?.defaultView||(typeof window>"u"?null:window),f=typeof a=="function"?a:()=>{},w=k||(typeof localStorage>"u"?null:localStorage),T=typeof r.getBusinessProfileTypeFn=="function"?r.getBusinessProfileTypeFn:(()=>""),ie=typeof r.isShopCatalogProfileFn=="function"?r.isShopCatalogProfileFn:(()=>!1),U=typeof r.getRestaurantMetaByIdFn=="function"?r.getRestaurantMetaByIdFn:(()=>null),oe=typeof r.resolveRestaurantLogoFn=="function"?r.resolveRestaurantLogoFn:(()=>""),de=typeof r.resolveOwnAvatarUrlFn=="function"?r.resolveOwnAvatarUrlFn:(()=>""),le=typeof m.renderAnalyticsViewFn=="function"?m.renderAnalyticsViewFn:(()=>""),ce=typeof m.renderSettingsViewFn=="function"?m.renderSettingsViewFn:(()=>""),he=typeof m.warmAnalyticsFn=="function"?m.warmAnalyticsFn:(()=>{});let N=!1,C=0,O=!1,P=null,R=null,$="",H=!1,V=()=>null;const ue=300;function I(){const n=e?.userProfile||{};return Ne({businessType:T(n),isShopCatalog:ie(n)})}function me(n=""){const s=U(n)||{};return Ue(s).map(i=>({id:i.id,name:i.title,price:i.price??"",category:i.beds||i.tag||"",type:"room",imageUrl:i.imageUrl||""}))}function pe(n=""){if(!w)return null;try{const s=w.getItem(`${ae}${n}`);if(!s)return null;const i=JSON.parse(s),l=Array.isArray(i?.items)?i.items:null;return l&&l.length?l:null}catch{return null}}function be(n="",s=[]){if(w)try{w.setItem(`${ae}${n}`,JSON.stringify({savedAt:Date.now(),items:s}))}catch{}}async function ge(n=""){const{db:s,collectionFn:i,queryFn:l,limitFn:c,getDocsFn:b}=o;if(!s||typeof i!="function"||typeof b!="function")throw new Error("Produktet nuk u ngarkuan.");const z=i(s,"restaurants",n,"menuItems"),y=typeof l=="function"&&typeof c=="function"?l(z,c(ue)):z,D=await b(y),g=[];return D.forEach(F=>{const E=V(F?.id,F?.data?.()||{});E&&g.push(E)}),g.sort((F,E)=>F.name.localeCompare(E.name,"sq")),g}async function fe(n="",s){const i=String(n||"").trim();if(!i)throw new Error("Produktet nuk u ngarkuan.");if(I()==="hotel")return me(i);const l=ge(i).then(b=>(be(i,b),b)),c=pe(i);return c?(typeof s=="function"?l.then(b=>s(b)).catch(()=>{}):l.catch(()=>{}),c):l}function Z(){return P?Promise.resolve(P):(R||(R=Fe(()=>import("./business-composer-controller-1ZvDE4UD.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(n=>(V=typeof n?.normalizeComposerProductCore=="function"?n.normalizeComposerProductCore:(()=>null),P=n.createBusinessComposerController({documentObj:S,windowObj:S?.defaultView||null,api:{getRestaurantIdFn:()=>K(),getBusinessMetaFn:()=>{const s=K();if(!s)return{name:"",logoUrl:"",city:""};const i=Y(s),l=U(s)||{};return{name:i.name,logoUrl:i.logoUrl,city:String(l.city||"").trim()}},loadProductsFn:(s,i)=>fe(s,i),getBusinessKindFn:()=>I(),uploadImageFn:d.uploadImageFn,uploadVideoFn:d.uploadVideoFn,captureVideoPosterFn:d.captureVideoPosterFn,createPostFn:d.createPostFn,createStoryFn:d.createStoryFn,formatPriceFn:d.formatPriceFn,getOptimizedImageUrlFn:d.getOptimizedImageUrlFn,escapeHtmlFn:d.escapeHtmlFn,iconFn:typeof p=="function"?p:void 0,afterPublishFn:async s=>{try{await j({force:!0})}catch{}typeof d.afterPublishFn=="function"&&await d.afterPublishFn(s)}}}),P)).catch(n=>{throw R=null,console.error("[mnyra][dashboard] composer load failed",n),n})),R)}function q(){const n=u?.navigator?.connection;return!n||typeof n!="object"?!1:n.saveData===!0?!0:/(^|-)2g$/.test(String(n.effectiveType||"").trim().toLowerCase())}function ye(){if(H||P||!u||q())return;H=!0;const n=()=>{if(Z().catch(()=>{}),typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}};if(typeof u.requestIdleCallback=="function"){u.requestIdleCallback(n,{timeout:te});return}u.setTimeout?.(n,ne)}function _e(){if(N||!u||q())return;N=!0;const n=()=>{try{he()}catch{}};if(typeof u.requestIdleCallback=="function"){u.requestIdleCallback(n,{timeout:te});return}u.setTimeout?.(n,ne)}function we(n="post"){const s=String(n||"").trim().toLowerCase(),i=s==="story"||s==="profile"?s:"post";if(typeof d.prewarmFn=="function")try{d.prewarmFn()}catch{}if(P){P.open(i);return}$=i,Z().then(l=>{const c=$||i;$="",l?.open?.(c)}).catch(()=>{$=""})}function M(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function G(n=""){const s=M(),i=String(n||"").trim();return String(s.restaurantId||"")===i||(s.restaurantId=i,s.model=null,s.status="idle",s.error="",s.loadedSignature="",s.paywall="",C+=1),s}function K(){const n=e?.userProfile||{};return String(n.restaurantId||n.staffRestaurantId||"").trim()}let W="";function ve(){const n=String(e?.user?.uid||"").trim();!n||W===n||typeof r.ensureBusinessProfileFn=="function"&&(W=n,Promise.resolve().then(()=>r.ensureBusinessProfileFn()).catch(s=>{console.warn("[mnyra][panel] business profile could not be resolved",s)}).finally(()=>{String(e?.user?.uid||"").trim()===n&&f()}))}function ke(){const n=String(e?.user?.uid||"").trim();if(!n)return!1;const s=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||s===n}function J(n=""){return`${ia}${n}`}function xe(n="",s=""){if(!w||!n)return null;try{const i=w.getItem(J(n));if(!i)return null;const l=JSON.parse(i);return!l||typeof l!="object"||String(l.day||"").trim()!==String(s||"").trim()||!l.model||typeof l.model!="object"?null:l.model}catch{return null}}function Se(n="",s=null){if(!(!w||!n||!s))try{w.setItem(J(n),JSON.stringify({day:s.day,model:s}))}catch{}}async function ze(n=""){const{db:s,collectionFn:i,queryFn:l,orderByFn:c,limitFn:b,getDocsFn:z}=o;if(!s||typeof i!="function"||typeof l!="function"||typeof c!="function"||typeof b!="function"||typeof z!="function")return[];const y=i(s,"restaurants",n,"socialPosts");return(await z(l(y,c("createdAt","desc"),b(oa)))).docs.map(g=>({id:g.id,data:g.data()||{}})).filter(g=>{const F=String(g.data.status||"active").trim().toLowerCase();return F!=="deleted"&&F!=="hidden"})}async function j({force:n=!1}={}){const s=K(),i=G(s);if(!s)return;const l=Be({rangeKey:"7d"});if(!l)return;const c=`${s}::${l.toDay}`;if(!n&&i.loadedSignature===c&&i.status==="ready")return;if(!i.model){const y=xe(s,l.toDay);y&&(i.model=y,i.status="ready",f())}C+=1;const b=C;i.model||(i.status="loading",i.error="",f());try{const y={db:o.db,collectionFn:o.collectionFn,queryFn:o.queryFn,whereFn:o.whereFn,documentIdFn:o.documentIdFn,getDocsFn:o.getDocsFn,restaurantId:s},[D,g]=await Promise.allSettled([Ce({...y,fromDay:l.fromDay,toDay:l.toDay}),ze(s)]);if(b!==C)return;if(D.status==="rejected")throw D.reason;g.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",g.reason),i.model=ma({days:D.value,todayKey:l.toDay,rawPosts:g.status==="fulfilled"?g.value:[]}),i.status="ready",i.error="",i.loadedSignature=c,Se(s,i.model)}catch(y){if(b!==C)return;console.error("[mnyra][dashboard] load failed",y),i.model||(i.status="error",i.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}f()}function De(){O||!S||(O=!0,S.addEventListener("click",n=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(n.target?.closest?.("[data-dashboard-retry]")){j({force:!0});return}if(n.target?.closest?.("[data-dashboard-paywall-close]")){n.preventDefault(),M().paywall="",f();return}const s=n.target?.closest?.("[data-dashboard-metric-locked]");if(s){n.preventDefault(),M().paywall=String(s.getAttribute("data-dashboard-metric-locked")||"").trim(),f();return}const i=n.target?.closest?.("[data-dashboard-composer]");if(i){n.preventDefault(),we(i.getAttribute("data-dashboard-composer"));return}const l=n.target?.closest?.("[data-dashboard-panel-tab]");if(l){n.preventDefault();const c=A(l.getAttribute("data-dashboard-panel-tab"));if(c===A(e?.dashboardPanelTab))return;e.dashboardPanelTab=c,f()}}catch{}}))}function Y(n=""){const s=e?.userProfile||{},i=n?U(n)||{}:{},l=String(i.name||i.restaurantName||s.name||"").trim()||"Business";let c="";try{c=String(de()||"").trim()}catch{}if(!c)try{c=String(oe(i)||"").trim()}catch{}return{name:l,logoUrl:c,kind:I(),coverUrl:ga(i),subscribed:ba({profile:s,restaurant:i})}}function Pe(){Me(S),De();const n=K(),s=G(n);let i="";if(!n)ve(),i=ke()?na():sa();else{ye(),_e();const l=Y(n),c=A(e?.dashboardPanelTab);s.status==="idle"&&(s.status="loading",queueMicrotask(()=>{j({force:!1})}));let b="";s.model?b=Qe({posts:s.model.posts,iconFn:p}):s.status==="error"?b=ra({message:s.error}):b=ea();const z=`
        ${Ve({iconFn:p})}
        ${Ze({iconFn:p,showEditor:!!n})}
        ${qe({iconFn:p,showEditor:!!n})}
        ${We({iconFn:p,kind:l.kind,showEditor:!!n})}
        ${b}
      `;let y;c==="analitika"?y=`<div class="mnyra-dash__embed">${le()}</div>`:c==="opsionet"?y=`<div class="mnyra-dash__embed">${ce()}</div>`:y=z;const D=fa({model:s.model,coverUrl:l.coverUrl,subscribed:l.subscribed,assets:la}),g=String(s.paywall||"").trim();i=`
        ${He({name:l.name,logoUrl:l.logoUrl,iconFn:p})}
        ${Je({cards:D,iconFn:p})}
        ${se(`
          ${Xe({activeTab:c,iconFn:p})}
          ${y}
        `)}
        ${g?aa({title:ca[g]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${i}
      </section>
    `}return Object.freeze({renderDashboardView:Pe,loadDashboard:j})}export{Ke as M,xa as a,Ue as b,je as c,va as d,ka as f,Te as n};
