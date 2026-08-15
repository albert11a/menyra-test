// Mnyra Business-Dashboard Rendering (Tab "dashboard").
// Reines String-Rendering + eigenes scoped CSS, damit das Dashboard
// unabhaengig vom generierten Tailwind-Build stabil aussieht.
// Alle Kacheln haben feste Hoehen: Skeleton -> Inhalt erzeugt keinen
// Layout-Shift, Werte-Updates aendern die Geometrie nicht.

import { formatCompactNumber } from "../analytics/analytics-dashboard-core.js";

const STYLE_ELEMENT_ID = "mnyraDashboardStyles";

export const DASHBOARD_CSS = `
.mnyra-dash {
  /* Horizontale Flucht auf die SICHTBAREN Header-Icons (nicht die
     unsichtbaren Touch-Kreise): Menue-Striche beginnen bei 28px,
     Warenkorb-Symbol endet bei 30px vom rechten Rand - 28px beidseitig
     trifft beide optisch (rechts 2px Toleranz, im Browser vermessen). */
  padding: 16px 28px 0;
  /* Kein unteres Polster und keine Mindesthoehe mehr: den Abschluss der Seite
     macht jetzt der Fuss der App (core/ui/app-footer-render-utils.js), der im
     Fluss hinter dem Panel steht. Beides hier waere doppelt - die Mindesthoehe
     schoebe den Fuss ausserdem bei kurzem Inhalt unter den Bildschirmrand. */
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
  /* Mnyra Waiter hat seine eigenen Farben - schwarze Flaeche, weisses "MNYRA",
     rotes "WAITER". Genau das Rot, das die Waiter-App traegt (rose-500), damit
     die Karte hier und die App dahinter als dasselbe lesen. */
  --dash-waiter: #f43f5e;
  --dash-waiter-soft: rgba(244, 63, 94, 0.16);
  --dash-waiter-ring: rgba(244, 63, 94, 0.35);
  /* Und ihre Flaeche ist wirklich schwarz, nicht das dunkle Blau der
     Posting-Karte (--dash-black: #0f172a). Die beiden stehen uebereinander -
     mit derselben Farbe waeren es zwei Haelften einer Flaeche statt zwei
     Karten. */
  --dash-waiter-plane: #000000;
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
  /* Die Waiter-Karte ist ein <a>, weil sie aus der App hinausfuehrt - ohne das
     hier zoege der Browser eine Linie unter jedes Wort darin. */
  text-decoration: none;
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
/* Und dieselbe Karte in den Farben von Mnyra Waiter. Sie behaelt die schwarze
   Grundform - nur der Akzent wechselt von Indigo auf das Rot der Waiter-App.
   Der Schriftzug steht in Grossbuchstaben: er ist eine Marke, kein Satz.
   Als einzige Karte des Panels fuehrt sie aus der App hinaus; das Rot ist das,
   woran man Waiter drueben wiedererkennt. */
.mnyra-dash__composer--waiter {
  background: var(--dash-waiter-plane);
  border-color: var(--dash-waiter-plane);
}
.mnyra-dash__composer--waiter .mnyra-dash__composer-title {
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.mnyra-dash__composer--waiter .mnyra-dash__composer-accent { color: var(--dash-waiter); }
.mnyra-dash__composer--waiter .mnyra-dash__composer-cta-icon {
  border-color: var(--dash-waiter-ring);
  background: var(--dash-waiter-soft);
  color: var(--dash-waiter);
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
  /* Der Abstand nach oben ist die Luft zwischen der Kennzahl-Reihe und der
     Flaeche. Er ist bewusst gross: die Reihe soll als eigenes Stueck lesen und
     nicht an der Flaeche kleben, die gleich darunter anfaengt. */
  /* Nach unten polstert das Bento nur noch sich selbst. Frueher zog eine
     negative Marge denselben Betrag wieder ab, damit seine Flaeche bis ans
     Seitenende reichte - mit dem Fuss dahinter waere genau das ein Fehler: die
     Marge zoege ihn um diesen Betrag nach oben, mitten in die Flaeche hinein. */
  margin: 72px -28px 0;
  padding: 22px 28px var(--dash-bento-tail);
  background: var(--dash-surface);
  border-top: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-radius) var(--dash-bento-radius) 0 0;
  /* Dieselbe weiche Kante wie unter dem Header, nur nach oben gedreht: die
     Flaeche beginnt sichtbar, statt an der Haarlinie einfach umzuschlagen.
     Es ist der Schatten, den auch das Bento der Lokale-Seite traegt. */
  box-shadow: var(--dash-bento-shadow);
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
}
/* Bis an den unteren Rand des Bentos laeuft die eingesetzte Ansicht nur, wenn
   NICHTS mehr hinter ihr kommt. In der Analitika stehen darunter noch die
   letzten Beitraege - dort zoege der negative Rand sie unter die Ansicht. */
.mnyra-dash__embed:last-child { margin-bottom: calc(-1 * var(--dash-bento-tail)); }
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
`;

export function ensureDashboardStylesInjected(documentObj = typeof document === "undefined" ? null : document) {
  if (!documentObj || documentObj.getElementById(STYLE_ELEMENT_ID)) return;
  try {
    const style = documentObj.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    style.textContent = DASHBOARD_CSS;
    documentObj.head?.appendChild(style);
  } catch {}
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeIcon(iconFn, name, className = "") {
  if (typeof iconFn !== "function") return "";
  try {
    return iconFn(name, className) || "";
  } catch {
    return "";
  }
}

const BUSINESS_TYPE_LABELS = Object.freeze({
  restaurant: "Restaurant",
  cafe: "Café",
  fastfood: "Fast Food",
  hotel: "Hotel",
  motel: "Motel",
  hostel: "Hostel",
  resort: "Resort",
  ecommerce: "Online-Shop",
  tankstelle: "Tankstelle",
  lebensmittel: "Lebensmittel",
  apotheken: "Apotheke",
  services: "Service"
});

export function resolveBusinessTypeLabelCore(type = "") {
  const key = String(type || "").trim().toLowerCase();
  if (!key) return "Business";
  if (BUSINESS_TYPE_LABELS[key]) return BUSINESS_TYPE_LABELS[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
}

const HOTEL_TYPE_KEYS = Object.freeze(["hotel", "motel", "hostel", "resort", "accommodation", "travel"]);

// Ordnet ein Business einer Dashboard-Art zu; steuert Kacheln + KPIs.
export function resolveDashboardKindCore({ businessType = "", isShopCatalog = false } = {}) {
  if (isShopCatalog) return "shop";
  const type = String(businessType || "").trim().toLowerCase();
  if (HOTEL_TYPE_KEYS.includes(type)) return "hotel";
  return "restaurant";
}

// Die Kacheln des Schnellzugriffs standen hier (buildDashboardQuickActionsCore
// und renderDashboardQuickActions). Sie sind weg, und mit ihnen ihre vier
// Wege: Katalog-Editor, Offerten/Reklama, Team & Staff und Cilesimet. Jeder
// davon steht jetzt an genau einer Stelle - die ersten beiden als Karte im
// Bento, "Stafi" und die Einstellungen als Seite "Opsionet" darin. Zweimal
// derselbe Weg auf einem Bildschirm war das eigentliche Problem.

// Tageszeit-Gruss auf Albanisch (Stundenbereiche lokal zum Geraet):
// 05-10 mengjes, 11-17 dite, 18-21 mbremje, sonst nate.
export function resolveDashboardGreetingCore(hour = new Date().getHours()) {
  const safeHour = Number.isFinite(Number(hour)) ? ((Math.trunc(Number(hour)) % 24) + 24) % 24 : 12;
  if (safeHour >= 5 && safeHour <= 10) {
    return { dayPart: "mengjes", text: "Ju urojmë një mëngjes të mbarë!" };
  }
  if (safeHour >= 11 && safeHour <= 17) {
    return { dayPart: "dite", text: "Ju urojmë një ditë të mbarë!" };
  }
  if (safeHour >= 18 && safeHour <= 21) {
    return { dayPart: "mbremje", text: "Ju urojmë një mbrëmje të mbarë!" };
  }
  return { dayPart: "nate", text: "Ju urojmë një natë të mbarë!" };
}

// Begruessung ohne Card, aufgebaut wie die Stadt-Ueberschrift im Feed:
// "Përshëndetje," gross, das Logo klein daneben in derselben Zeilenhoehe,
// darunter dicht der Tageszeit-Gruss. Der Name des Lokals steht nicht mehr
// als Text daneben - dafuer traegt ihn das Logo (und sein Alt-Text).
export function renderDashboardGreeting({ name = "", logoUrl = "", hour = new Date().getHours(), iconFn } = {}) {
  const greeting = resolveDashboardGreetingCore(hour);
  const label = escapeHtml(name || "Business");
  return `
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${logoUrl
            ? `<img src="${escapeHtml(logoUrl)}" alt="${label}" title="${label}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`
            : `<span class="mnyra-dash__greet-logo-fallback" title="${label}">${safeIcon(iconFn, "store", "w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${escapeHtml(greeting.text)}</p>
    </div>
  `;
}

// Posting-Karte unter der Begruessung. Ein Knopf reicht: zwischen Postim und
// Story schaltet man im Modal selbst um, an der Leiste unten.
// Die ganze Karte ist der Knopf: egal wo man sie antippt, das Modal geht auf.
// Deshalb steht hier ein <button> und darin nur noch Textbausteine - ein
// zweiter Knopf in einem Knopf waere weder gueltig noch bedienbar.
// Der Titel ist umgedreht: "Posto" traegt die Farbe, "n'Mnyra" steht ruhig
// daneben.
export function renderDashboardComposerCard({ iconFn } = {}) {
  return `
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${safeIcon(iconFn, "plus", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${safeIcon(iconFn, "chevron-right", "w-4 h-4")}</span>
      </span>
    </button>
  `;
}

// Die Offerten-Karte, direkt unter der Posting-Karte und in derselben Form:
// dieselbe Ueberschrift mit farbigem ersten Wort, derselbe Untertitel,
// dieselbe Aktionszeile mit Plus und Pfeil.
//
// Nur die Farbe ist eine andere: sie steht auf der ruhigen Panel-Flaeche wie
// "Ndrysho menune" und "Oferta & Reklama" darunter, nicht auf Schwarz. Zwei
// schwarze Karten uebereinander waeren zu schwer gewesen - so bleibt die
// Posting-Karte die eine schwere Flaeche im Panel, und die Offerten-Karte
// gehoert sichtbar zu dem, was darunter kommt.
//
// Der Weg laeuft wie bei den Kacheln darunter ueber data-nav: der
// [data-nav]-Handler der Shell schaltet auf "ofertatbiznes", den
// Offerten-Editor. Hier entsteht keine eigene Routing-Logik. Die Karte traegt
// bewusst KEIN data-dashboard-composer - sonst finge der Klick-Handler des
// Dashboards sie ab und oeffnete den Composer.
//
// Anders als die Posting-Karte steht sie nur da, wenn es den Editor fuer
// dieses Konto ueberhaupt gibt (showEditor) - eine Karte, die ins Leere
// fuehrt, waere schlimmer als keine.
export function renderDashboardOfferCard({ iconFn, showEditor = true } = {}) {
  if (!showEditor) return "";
  return `
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${safeIcon(iconFn, "plus", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${safeIcon(iconFn, "chevron-right", "w-4 h-4")}</span>
      </span>
    </button>
  `;
}

// Die Werbe-Karte, unter der Offerten-Karte und in derselben Form. Sie fuehrt
// nach Mnyra Ads - einen eigenen Ort, nicht in den Menue-Editor. Der Weg laeuft
// wie bei den anderen ueber data-nav, hier auf den Tab "reklama".
export function renderDashboardAdsCard({ iconFn, showEditor = true } = {}) {
  if (!showEditor) return "";
  return `
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${safeIcon(iconFn, "plus", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${safeIcon(iconFn, "chevron-right", "w-4 h-4")}</span>
      </span>
    </button>
  `;
}

// Was im Katalog-Editor steht, heisst je nach Lokal anders: ein Restaurant
// pflegt seine Menue, ein Shop sein Sortiment, ein Hotel seine Dhoma. Der
// Editor dahinter ist derselbe (Tab "menu") - nur die Worte wechseln.
//
// Aufgebaut wie "Lësho ofertë": das erste Wort traegt die Farbe, der Rest
// steht ruhig daneben. Deshalb ist der Titel hier zweigeteilt und nicht ein
// Stueck Text.
const DASHBOARD_CATALOG_CARD_COPY = Object.freeze({
  restaurant: {
    accent: "Ndrysho",
    rest: "menunë",
    sub: "Shto produkte, kategori dhe çmime.",
    cta: "Menu"
  },
  shop: {
    accent: "Ndrysho",
    rest: "dyqanin",
    sub: "Shto produkte, kategori dhe stok.",
    cta: "Dyqani"
  },
  hotel: {
    accent: "Ndrysho",
    rest: "hotelin",
    sub: "Detajet, dhomat dhe çmimet e tua.",
    cta: "Hoteli"
  }
});

export function resolveDashboardCatalogCardCopyCore(kind = "restaurant") {
  const key = String(kind || "").trim().toLowerCase();
  return DASHBOARD_CATALOG_CARD_COPY[key] || DASHBOARD_CATALOG_CARD_COPY.restaurant;
}

// Die Katalog-Karte, unter der Offerten-Karte und in derselben Form. Der Weg
// laeuft wie dort ueber data-nav, hier auf den Tab "menu" - denselben Editor,
// den frueher der Drawer-Eintrag geoeffnet hat.
export function renderDashboardCatalogCard({ iconFn, kind = "restaurant", showEditor = true } = {}) {
  if (!showEditor) return "";
  const copy = resolveDashboardCatalogCardCopyCore(kind);
  return `
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${escapeHtml(copy.accent)}</span> ${escapeHtml(copy.rest)}</span>
      <span class="mnyra-dash__composer-sub">${escapeHtml(copy.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${safeIcon(iconFn, "plus", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${escapeHtml(copy.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${safeIcon(iconFn, "chevron-right", "w-4 h-4")}</span>
      </span>
    </button>
  `;
}

// Die Karte nach Mnyra Waiter - dort laufen die Bestellungen von den Tischen
// ein.
//
// Sie ist die einzige Karte des Panels, die aus der App HINAUSFUEHRT: Waiter
// ist eine eigene Anwendung unter /waiter, kein Tab hier. Deshalb steht hier
// ein <a> und kein <button> mit data-nav - der Weg gehoert dem Browser, nicht
// dem Router der Shell. Ein Knopf, der heimlich die Adresse wechselt, waere
// weder aufklappbar ("in neuem Tab oeffnen") noch als Verlassen der App
// erkennbar.
//
// Der Anhang ?from=panel sagt Waiter drueben, dass es die Uebergabe aus dem
// Panel ist: nur dann uebernimmt es die Anmeldung von hier, statt nach Email
// und Passwort zu fragen (siehe apps/waiter/waiter-app.js). Wer /waiter direkt
// aufruft - das Geraet im Lokal, auf dem ein Kellner angemeldet ist - merkt
// von alldem nichts.
const DASHBOARD_WAITER_APP_HREF = "/waiter?from=panel";

export function renderDashboardWaiterCard({ iconFn, showEditor = true } = {}) {
  if (!showEditor) return "";
  return `
    <a href="${DASHBOARD_WAITER_APP_HREF}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Ktu ju vijn porosit nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${safeIcon(iconFn, "external-link", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${safeIcon(iconFn, "chevron-right", "w-4 h-4")}</span>
      </span>
    </a>
  `;
}

// Die Kennzahl-Reihe unter der Begruessung.
//
// Jede Karte ist ein Bild mit dem Verlauf der Lokal-Karten und darauf unten
// Beschriftung und Zahl. Drei Zustaende, und jeder hat seine eigene Aufgabe:
//
//   pending -> die Karte wartet noch auf ihr Bild (nur der beste Beitrag).
//              Ein Platzhalter in der Groesse der Karte.
//   locked  -> das Bild steht unscharf dahinter, statt der Zahl das Schild
//              "Me pagesë". Der Tipp oeffnet den Hinweis, nichts sonst.
//   offen   -> Bild, Beschriftung, Zahl. Fehlt die Zahl noch, steht an ihrer
//              Stelle ein Balken in genau ihrer Hoehe - so springt beim
//              Eintreffen der Daten nichts.
export function renderDashboardMetricCards({ cards = [], iconFn } = {}) {
  const list = (Array.isArray(cards) ? cards : []).filter((card) => card && card.key);
  if (!list.length) return "";
  const items = list.map((card, index) => {
    const label = escapeHtml(card.label || "");
    if (card.pending) {
      return `<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>`;
    }
    // Die ersten beiden Bilder stehen sofort im Bild, der Rest kommt beim
    // Heranscrollen - die Reihe soll den ersten Aufbau nicht ausbremsen.
    const imgAttrs = index < 2
      ? `loading="eager" fetchpriority="high"`
      : `loading="lazy" fetchpriority="low"`;
    // Die ruhige Flaeche liegt IMMER darunter: faellt das Bild aus, steht dort
    // kein Loch.
    //
    // Ein Video ohne Standbild bekommt kein <img>, sondern ein <video>, das
    // nur seinen ersten Moment zeigt: preload="metadata" holt allein den
    // Anfang der Datei, "#t=0.1" sagt dem Browser, welchen Moment er
    // stehenlassen soll. Kein autoplay, kein Ton, keine Bedienelemente - es
    // ist ein Standbild, das zufaellig aus einem Video kommt.
    let media = "";
    if (card.imageUrl) {
      media = `<img class="mnyra-dash__hl-media" src="${escapeHtml(card.imageUrl)}" alt="" ${imgAttrs} decoding="async" onerror="this.style.display='none'" />`;
    } else if (card.videoUrl) {
      media = `<video class="mnyra-dash__hl-media" src="${escapeHtml(card.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`;
    }
    const visual = `
      <span class="mnyra-dash__hl-plate">${safeIcon(iconFn, card.iconName || "image", "w-6 h-6")}</span>
      ${media}
    `;
    const eye = card.withEye
      ? `<span class="mnyra-dash__hl-eye">${safeIcon(iconFn, "eye", "w-4 h-4")}</span>`
      : "";
    let foot;
    if (card.locked) {
      foot = `<span class="mnyra-dash__hl-lock">${safeIcon(iconFn, "lock", "w-3 h-3")}Me pagesë</span>`;
    } else if (card.loading) {
      foot = `<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>`;
    } else if (card.emptyText) {
      foot = `<span class="mnyra-dash__hl-empty">${escapeHtml(card.emptyText)}</span>`;
    } else {
      foot = `<span class="mnyra-dash__hl-value">${eye}${escapeHtml(card.value || "0")}</span>`;
    }
    // Die leere Beitrags-Karte fuehrt dorthin, wo man den ersten Beitrag
    // macht - eine Zahl, die es noch nicht gibt, in der Analyse zu suchen,
    // waere ein Weg ins Leere.
    //
    // Alle anderen fuehren in die Analitika - und die steht jetzt als Tab im
    // Bento derselben Seite. Die Karte schaltet deshalb den Tab um, statt die
    // Seite zu wechseln: der Weg endet dort, wo die Zahl herkommt, ohne dass
    // das Panel darunter verschwindet.
    let stateAttrs;
    if (card.locked) {
      stateAttrs = `class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${escapeHtml(card.key)}"`;
    } else if (card.composer) {
      stateAttrs = `class="mnyra-dash__hl-card" data-dashboard-composer="${escapeHtml(card.composer)}"`;
    } else {
      stateAttrs = `class="mnyra-dash__hl-card"${card.panelTab ? ` data-dashboard-panel-tab="${escapeHtml(card.panelTab)}"` : ""}`;
    }
    const ariaLabel = card.locked
      ? `${label} – me pagesë`
      : `${label} ${card.emptyText || card.value || ""}`.trim();
    return `
      <button type="button" ${stateAttrs} data-dashboard-metric="${escapeHtml(card.key)}" aria-label="${escapeHtml(ariaLabel)}">
        ${visual}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${label}</span>
          ${foot}
        </span>
      </button>
    `;
  }).join("");
  return `
    <div class="mnyra-dash__hl" data-dashboard-metrics="${escapeHtml(buildDashboardMetricRowSignatureCore(list))}">
      ${items}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `;
}

// Der Fingerabdruck der Reihe: gleicher Abdruck heisst gleiche Reihe.
//
// Wozu: ein Neuaufbau der App wirft den ganzen Hauptteil weg und setzt frische
// Knoten ein - auch frische <img>. Der Browser muss dann jedes Bild neu
// aufbauen, und genau das sah man beim Umschalten der Bento-Seiten als kurzes
// Flackern der Bilder, obwohl sich an der Reihe gar nichts geaendert hatte.
//
// Mit dem Abdruck kann der Rahmen (app-shell-runtime-controller) die alte
// Reihe stehen lassen, wenn die neue dasselbe sagt. Er steht bewusst NICHT auf
// dem gelieferten Markup: das traegt nach dem ersten Anzeigen schon
// Laufzeit-Spuren (ein Bild, das nicht lud, hat sich selbst verborgen). Der
// Abdruck nennt nur das, was die Reihe ausmacht - aendert sich eine Zahl, ein
// Bild oder ein Zustand, ist er ein anderer und die neue Reihe kommt zum Zug.
export function buildDashboardMetricRowSignatureCore(cards = []) {
  return (Array.isArray(cards) ? cards : [])
    .filter((card) => card && card.key)
    .map((card) => [
      card.key,
      card.label || "",
      card.value || "",
      card.emptyText || "",
      card.imageUrl || "",
      card.videoUrl || "",
      card.iconName || "",
      card.panelTab || "",
      card.composer || "",
      card.pending ? "p" : "",
      card.loading ? "l" : "",
      card.locked ? "x" : "",
      card.withEye ? "e" : ""
    ].join("~"))
    .join("|");
}

// Die drei Seiten des Bentos. "funksionet" ist die erste und die Rueckfalle:
// eine unbekannte oder fehlende Angabe landet immer dort, nie im Leeren.
export const DASHBOARD_PANEL_TABS = Object.freeze([
  Object.freeze({ id: "funksionet", label: "Funksionet", iconName: "layout-grid" }),
  Object.freeze({ id: "analitika", label: "Analitika", iconName: "bar-chart-3" }),
  Object.freeze({ id: "opsionet", label: "Opsionet", iconName: "settings" })
]);

export function resolveDashboardPanelTabCore(value = "") {
  const key = String(value || "").trim().toLowerCase();
  return DASHBOARD_PANEL_TABS.some((tab) => tab.id === key) ? key : "funksionet";
}

// Die Leiste oben im Bento. Sie schaltet nur die Flaeche darunter um - der
// Gruss und die Kennzahl-Reihe darueber bleiben stehen, weil sie zur Seite
// gehoeren und nicht zu einer ihrer drei Seiten.
export function renderDashboardPanelTabs({ activeTab = "funksionet", iconFn } = {}) {
  const active = resolveDashboardPanelTabCore(activeTab);
  const buttons = DASHBOARD_PANEL_TABS.map((tab) => {
    const selected = tab.id === active;
    return `
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${escapeHtml(tab.id)}"
        aria-selected="${selected ? "true" : "false"}"
        class="mnyra-dash__tab"
      >${safeIcon(iconFn, tab.iconName, "w-4 h-4")}<span class="mnyra-dash__tab-label">${escapeHtml(tab.label)}</span></button>
    `;
  }).join("");
  return `<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${buttons}</div>`;
}

// Das Bento traegt alles unter der Kennzahl-Reihe: die Tab-Leiste und darunter
// die Seite, die sie gewaehlt hat. Eine Flaeche, oben gerundet, die bis ans
// Seitenende laeuft.
export function renderDashboardBento(innerHtml = "") {
  return `
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${innerHtml}
    </div>
  `;
}

// Die Kennzahlen-Reihe "Letzte 7 Tage" stand hier. Sie ist weg, und mit ihr
// buildDashboardKpiDefsCore und der Link "Gjithe analitika": Zahlen gehoeren
// jetzt vollstaendig in die Analitika, die als eigene Seite im Bento steht.
// Dort stehen sie ausfuehrlicher, als diese sechs Faecher es konnten - eine
// zweite, kuerzere Fassung daneben waere nur eine zweite Wahrheit gewesen.

export function renderDashboardRecentPosts({ posts = [], iconFn } = {}) {
  const list = Array.isArray(posts) ? posts : [];
  let body = "";
  if (!list.length) {
    body = `
      <div class="mnyra-dash__state" style="border:none;">
        <p class="mnyra-dash__state-title">Ende nuk ka postime</p>
        <p class="mnyra-dash__state-body">Posto foton ose videon tende te pare qe vizitoret te te zbulojne ne feed.</p>
        <button type="button" class="mnyra-dash__retry" data-nav="upload" data-upload-intent="chooser">Neuer Beitrag</button>
      </div>
    `;
  } else {
    body = list.map((post) => {
      const metaParts = [
        post.dateLabel,
        `${formatCompactNumber(post.likesCount || 0)} Likes`,
        `${formatCompactNumber(post.commentsCount || 0)} Kommentare`
      ];
      if (Number(post.impressions || 0) > 0) {
        metaParts.push(`${formatCompactNumber(post.impressions)} shtrirje (7 dite)`);
      }
      return `
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${post.thumbUrl
              ? `<img src="${escapeHtml(post.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`
              : safeIcon(iconFn, post.mediaType === "video" ? "play" : "image", "w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${escapeHtml(post.caption || "Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${escapeHtml(metaParts.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `;
    }).join("");
    body = `<div class="mnyra-dash__posts">${body}</div>`;
  }
  return `
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="profile">Profil öffnen</button>
      </div>
      ${body}
    </div>
  `;
}

// Skeleton spiegelt exakt die Geometrie dessen, was gleich kommt - damit der
// Wechsel Skeleton -> Inhalt nichts verschiebt. Seit die Kennzahlen-Reihe in
// die Analitika gewandert ist, ist das nur noch die Beitrags-Liste: ein
// Kennzahlen-Umriss hier wuerde auf etwas warten, das nie kommt.
export function renderDashboardDataSkeleton() {
  return `
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `;
}

// Der Hinweis, den eine verschlossene Karte oeffnet. Absichtlich karg: die
// Gestaltung kommt spaeter, hier steht nur, dass es die Stelle gibt und wie
// man sie wieder zumacht.
export function renderDashboardPaywallModal({ title = "" } = {}) {
  return `
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${escapeHtml(title || "Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `;
}

export function renderDashboardGreetingSkeleton() {
  return `<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>`;
}

// Der Umriss der GANZEN Seite, solange noch nicht feststeht, zu welchem Lokal
// sie gehoert.
//
// Vorher stand hier nur ein Balken fuer den Gruss und darunter die Ueberschrift
// "Letzte Beiträge" - ohne Kennzahl-Reihe, ohne Bento, ohne Leiste. Das sah
// nicht nach "laedt gleich" aus, sondern nach kaputt: eine Ueberschrift, die
// im Nichts haengt. Und wenn die Daten kamen, sprang die halbe Seite.
//
// Jetzt steht die Form schon da: Gruss, die Reihe mit ihren vier Karten, das
// Bento mit seiner Leiste und den drei Karten darin. Alles in genau den
// Massen, die gleich der echte Inhalt einnimmt - es springt nichts mehr.
export function renderDashboardPanelSkeleton() {
  const metricCards = Array.from({ length: 4 }, () => (
    `<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>`
  )).join("");
  // Die erste Karte steht 32px unter der Leiste, alle weiteren 22px
  // auseinander - genau die Abstaende, die auch der echte Inhalt haelt.
  const composerCards = Array.from({ length: 4 }, (unused, index) => (
    `<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${index === 0 ? 32 : 22}px;"></div>`
  )).join("");
  return `
    ${renderDashboardGreetingSkeleton()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${metricCards}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${renderDashboardBento(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({ length: 3 }, () => `<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>`).join("")}
      </div>
      ${composerCards}
    `)}
  `;
}

export function renderDashboardErrorState({ message = "" } = {}) {
  return `
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${escapeHtml(message || "Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `;
}

export function renderDashboardNoBusinessState() {
  return `
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `;
}
