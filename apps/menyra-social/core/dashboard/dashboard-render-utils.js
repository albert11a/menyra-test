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
  height: 228px;
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
/* Das Bild fuellt die Karte, laeuft aber nicht bis unten durch: das untere
   Drittel ist eine geschlossene Flaeche in der Farbe der Posting-Karte, und
   nach oben blendet sie weich ins Bild aus. So hat die Zahl ihren eigenen
   Grund - abgesetzt, nicht ueber dem Motiv - und die Kante dazwischen ist
   trotzdem keine harte Linie. */
.mnyra-dash__hl-fade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(0deg, var(--dash-black) 0%, var(--dash-black) 30%, rgba(15, 23, 42, 0.72) 44%, rgba(15, 23, 42, 0.28) 58%, rgba(15, 23, 42, 0) 72%);
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
/* Verschlossene Karte: das Bild bleibt scharf und ganz zu sehen - verschlossen
   ist die ZAHL, nicht das Motiv. An ihrer Stelle steht das Schild. */
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

// Schnellaktionen pro Dashboard-Art. Navigation laeuft komplett ueber die
// bestehenden data-nav-Handler der Shell - hier entsteht keine neue Routing-Logik.
// "Neuer Beitrag" und "Story" stehen nicht mehr hier: dafuer ist die
// Posting-Karte darueber da, die beide Wege oeffnet. "Porosite" und
// "Analytics" ebenso wenig - beide stehen im Drawer, Analytics ausserdem als
// "Gjithe analitika" ueber den Kennzahlen im Bento darunter. Uebrig bleibt,
// was man sonst nirgends direkt erreicht.
export function buildDashboardQuickActionsCore({ kind = "restaurant", isOwner = false } = {}) {
  const actions = [];
  if (kind === "hotel") {
    actions.push({ nav: "menu", iconName: "bed-double", label: "Hotel & Dhoma", sub: "Detaje, dhoma, oferta" });
  } else if (kind === "shop") {
    actions.push({ nav: "menu", iconName: "shopping-bag", label: "Ndrysho dyqanin", sub: "Produkte & Stok" });
  } else {
    actions.push({ nav: "menu", iconName: "utensils", label: "Ndrysho menune", sub: "Produkte & Kategorien" });
  }
  actions.push({ nav: "menu", iconName: "megaphone", label: "Oferta & Reklama", sub: "Im Editor verwalten" });
  if (isOwner) {
    actions.push({ nav: "businessAccounts", iconName: "users-round", label: "Team & Staff", sub: "Zugänge verwalten" });
  }
  actions.push({ nav: "settings", iconName: "settings", label: "Cilesimet", sub: "Profili & Kontakti" });
  return actions;
}

// KPI-Definitionen pro Dashboard-Art (Keys aus summarizeAnalyticsDays().summary).
export function buildDashboardKpiDefsCore(kind = "restaurant") {
  const common = [
    { key: "profileViews", label: "Profilaufrufe" },
    { key: "postImpressions", label: "Shtrirja e postimeve" },
    { key: "contactClicks", label: "Kontakt-Klicks" }
  ];
  if (kind === "shop") {
    return common.concat([
      { key: "ordersCompleted", label: "Porosite" },
      { key: "revenue", label: "Umsatz", unit: "€" },
      { key: "productViews", label: "Produkt-Aufrufe" }
    ]);
  }
  if (kind === "hotel") {
    return common.concat([
      { key: "uniqueVisitors", label: "Vizitore" },
      { key: "postLikes", label: "Likes" },
      { key: "feedImpressions", label: "Shtrirja ne feed" }
    ]);
  }
  return common.concat([
    { key: "ordersCompleted", label: "Porosite" },
    { key: "revenue", label: "Umsatz", unit: "€" },
    { key: "qrScans", label: "QR-Scans" }
  ]);
}

function formatKpiValue(value = 0, unit = "") {
  const label = formatCompactNumber(value);
  return unit ? `${label} ${unit}` : label;
}

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

// Die beiden halben Karten "Posto n'Profil" und "Posto n'Meny" standen frueher
// hier unter der Composer-Karte. Beide Wege gibt es weiter, nur ohne eigene
// Karte im Panel: das Profil ist die dritte Seite in der Leiste des Composers,
// die Menue-Pflege steht als "Ndrysho menune" im Schnellzugriff.

// Kein data-upload-intent mehr: seit "Neuer Beitrag" und "Story" hier raus
// sind, traegt keine Kachel eine Upload-Absicht. Den Weg ueber das Attribut
// gibt es weiter - er haengt an der CTA der leeren Beitragsliste, nicht hier.
export function renderDashboardQuickActions({ actions = [], iconFn } = {}) {
  const tiles = (Array.isArray(actions) ? actions : []).map((action) => `
      <button type="button" class="mnyra-dash__action" data-nav="${escapeHtml(action.nav)}">
        <span class="mnyra-dash__action-icon">${safeIcon(iconFn, action.iconName, "w-4 h-4")}</span>
        <span>
          <span class="mnyra-dash__action-label" style="display:block;">${escapeHtml(action.label)}</span>
          <span class="mnyra-dash__action-sub" style="display:block;">${escapeHtml(action.sub || "")}</span>
        </span>
      </button>
    `).join("");
  // Nur das Gitter: die Ueberschrift "Schnellzugriff" ist weg - die Kacheln
  // sagen selbst, was sie tun. Die Flaeche darum ist das Bento.
  return `<div class="mnyra-dash__actions">${tiles}</div>`;
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
    // Der Verlauf liegt IMMER darunter: faellt das Bild aus, steht dort eine
    // ruhige Flaeche statt eines Lochs.
    const visual = `
      <span class="mnyra-dash__hl-plate">${safeIcon(iconFn, card.iconName || "image", "w-6 h-6")}</span>
      ${card.imageUrl
        ? `<img class="mnyra-dash__hl-media" src="${escapeHtml(card.imageUrl)}" alt="" ${imgAttrs} decoding="async" onerror="this.style.display='none'" />`
        : ""}
    `;
    const foot = card.locked
      ? `<span class="mnyra-dash__hl-lock">${safeIcon(iconFn, "lock", "w-3 h-3")}Me pagesë</span>`
      : (card.loading
        ? `<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>`
        : `<span class="mnyra-dash__hl-value">${escapeHtml(card.value || "0")}</span>`);
    const stateAttrs = card.locked
      ? `class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${escapeHtml(card.key)}"`
      : `class="mnyra-dash__hl-card"${card.nav ? ` data-nav="${escapeHtml(card.nav)}"` : ""}`;
    const ariaLabel = card.locked ? `${label} – me pagesë` : `${label} ${card.value || ""}`.trim();
    return `
      <button type="button" ${stateAttrs} data-dashboard-metric="${escapeHtml(card.key)}" aria-label="${escapeHtml(ariaLabel)}">
        ${visual}
        <span class="mnyra-dash__hl-fade"></span>
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${label}</span>
          ${foot}
        </span>
      </button>
    `;
  }).join("");
  return `
    <div class="mnyra-dash__hl" data-dashboard-metrics>
      ${items}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `;
}

// Das Bento traegt alles unter der Kennzahl-Reihe: die Posting-Karte,
// Schnellzugriffe, Kennzahlen und die letzten Beitraege. Eine Flaeche, oben
// gerundet, die bis ans Seitenende laeuft.
export function renderDashboardBento(innerHtml = "") {
  return `
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${innerHtml}
    </div>
  `;
}

export function renderDashboardKpis({ kpiDefs = [], week = {}, today = {} } = {}) {
  const tiles = (Array.isArray(kpiDefs) ? kpiDefs : []).map((def) => `
    <div class="mnyra-dash__kpi">
      <p class="mnyra-dash__kpi-label">${escapeHtml(def.label)}</p>
      <p class="mnyra-dash__kpi-value">${escapeHtml(formatKpiValue(week?.[def.key] || 0, def.unit || ""))}</p>
      <p class="mnyra-dash__kpi-today">Heute: ${escapeHtml(formatKpiValue(today?.[def.key] || 0, def.unit || ""))}</p>
    </div>
  `).join("");
  return `
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="analytics">Gjithe analitika</button>
      </div>
      <div class="mnyra-dash__kpis">${tiles}</div>
    </div>
  `;
}

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

// Skeleton spiegelt exakt die Geometrie der Daten-Sektionen (KPIs + Posts),
// damit der Wechsel Skeleton -> Inhalt keinen Layout-Shift erzeugt.
export function renderDashboardDataSkeleton({ kpiCount = 6 } = {}) {
  const kpiTiles = Array.from({ length: Math.max(1, kpiCount) })
    .map(() => `<div class="mnyra-dash__skeleton" style="min-height:86px;"></div>`)
    .join("");
  return `
    <div class="mnyra-dash__section" data-dashboard-kpis>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte 7 Tage</p>
      </div>
      <div class="mnyra-dash__kpis">${kpiTiles}</div>
    </div>
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
