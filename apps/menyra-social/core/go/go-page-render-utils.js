// Mnyra GO - die Seite. Reines String-Rendering.
//
// GO war einmal ein Modal. Das ist vorbei, und zwar aus einem Grund, der sich
// nicht wegstylen liess: Ein Modal liegt als "position: fixed" ueber der
// Seite, und damit gehoert ihm der Rand des Bildschirms - der sichere Bereich
// oben, die Browserleiste unten, die Farbe dahinter. Jede dieser Kanten
// musste GO selbst richtig hinbekommen, und jede davon sieht auf dem Telefon
// anders aus als im Browser auf dem Schreibtisch.
//
// Als Seite stellt sich die Frage nicht mehr. Die Huelle der App traegt
// Kopfzeile, Rand und Fuss - fuer GO genau so wie fuer Qyteti, Ofertat und
// das Panel. GO rendert nur noch seinen Inhalt.
//
// Der Aufbau ist der der App:
//
//   Kopfzeile (von der Shell)   "MNYRA GO" statt "MNYRA Social"
//   der Streifen                das Blau von GO, er traegt allein die Karte
//                               mit der Frage
//   die Karte mit der Frage     eine Frage, nicht vier
//   das Bento                   weiss, oben 2.5rem gerundet, ueber dem
//                               Streifen und bis ans Seitenende
//
// Streifen und Bento sind der Aufbau des Feed-Gates, nur in der Farbe von GO:
// dort eine Cyan-Flaeche mit dem Bento darueber, hier dieselbe Flaeche in
// Indigo.
//
// Eine Frage im Bild, nicht vier: Vier Fragen untereinander sind ein
// Formular, und ein Formular beantwortet niemand im Stehen vor einem Lokal.
// Weitergeschaltet wird dort, wo die Antwort eindeutig fertig ist - eine
// angetippte Kachel IST die Antwort. Ein Rad und ein Kalender sind nie fertig,
// der Finger koennte noch einmal ziehen; deshalb haben sie einen Knopf.
//
// Die Karte ist dabei immer gleich hoch (430px) und immer gleich gebaut: Kopf,
// Koerper, Fuss. Nur ihr Inhalt haengt am Schritt - und im letzten Bild zeigt
// dieselbe Karte, wie die Lokale eintreffen.

import {
  GO_INTENTS,
  GO_MAX_LEAD_DAYS,
  GO_PARTY_SIZE_DEFAULT,
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_MIN,
  GO_WHEN_OPTIONS
} from "../../../../shared/go/go-feature-config.js";
import { goIcon } from "./go-icon-render-utils.js";

export const GO_PAGE_STYLE_ELEMENT_ID = "mnyraGoPageStyles";

// Rundung und Aufbau kommen aus dem Feed-Gate
// (core/feed/feed-view-orchestration-controller.js): eine gesaettigte Flaeche
// oben, das Bento mit 2.5rem darueber. Nur die Farben sind die von GO - das
// Gate ist Cyan auf einem hellen Bento, GO ist Indigo auf einem weissen.
// Beides steht als Marke da, damit eine Aenderung nicht an zwei Stellen
// gesucht werden muss.
export const GO_PAGE_CSS = `
.mnyra-go-page {
  --go-ink: #0f172a;
  --go-ink-2: #475569;
  --go-muted: #94a3b8;
  --go-line: rgba(15, 23, 42, 0.08);
  --go-outline: #e2e8f0;
  --go-plane: #f8fafc;
  /* Das Mnyra-Blau. Genau das Indigo, in dem im Header "Social" steht - und
     dasselbe, in dem in den Bildern "unt?", "dal?" und "knaqu." gesetzt sind
     (nachgemessen: der Schriftzug liegt um #4c44c8, die Kompression zieht ihn
     eine Spur dunkler). Es traegt hier die betonten Woerter und die kleinen
     Bedienteile. */
  --go-accent: #4f46e5;
  /* Die Farbe des Streifens - dasselbe wie --feed-gate-chrome-color im
     Feed-Gate, nur fuer GO. Sie ist bewusst eine eigene Marke und nicht
     --go-accent: Eine Flaeche und ein Schriftzug brauchen nicht dieselbe
     Zahl, und der Streifen darf leuchten, wo das Indigo der Woerter ruhig
     bleiben muss. Beide beruehren sich nie - der Streifen liegt ueber dem
     Bento, die Woerter darin.
     Der Ton ist der des Gates: gesaettigt und wach, nur im Blau von GO
     statt im Cyan von Qyteti. */
  --go-chrome: #635bff;
  /* Der Schatten AUF dem Streifen. Ein neutraler Schiefer-Schatten
     (rgba(15,23,42)) entsaettigt die Farbe unter sich und legt einen grauen
     Schleier auf das Blau - ein Schatten faerbt nicht um, er verdunkelt.
     Deshalb liegt hier ein tiefes Indigo derselben Familie. */
  --go-chrome-shadow: 34, 22, 122;
  /* Das Bento ist weiss und liegt mit runden Ecken auf dem Streifen - genau
     der Aufbau des Feed-Gates.
     Das Seitenpolster ist die Linie der Kopfzeile: Die gezeichneten Kanten
     des Menue-Icons links und des Warenkorb-Icons rechts stehen 2rem vom
     Rand - genau dort stehen jetzt auch die Frage-Karte und alles im Bento.
     Nicht --app-content-inline (1.5rem): Das ist die Kante der Button-
     KAESTEN, nicht die der Striche darin. Die Kaesten sind unsichtbar, die
     Striche sieht man - und das Auge richtet sich nach dem, was es sieht.
     Deshalb stand die Karte vorher acht Pixel weiter aussen als die Icons
     darueber. */
  --go-bento-surface: #ffffff;
  --go-bento-radius: 2.5rem;
  --go-inline: 2rem;
  background: var(--go-plane);
  color: var(--go-ink);
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  flex-direction: column;
  /* Die Seite fuellt das Fenster, damit das Bento auch bei kurzem Inhalt bis
     nach unten reicht. Ein Bento, das auf halber Hoehe endet, waere eine
     Kante mitten im Weissen - darunter kaeme der graue Grund der Seite zum
     Vorschein, und die Seite saehe aus, als sei sie abgeschnitten.
     "min-height: 100%" allein reicht dafuer nicht: Die Huelle ist eine
     Flex-Spalte (main.app-main-scroll), deren Hoehe selbst erst aus dem Layout
     entsteht - ein Prozentwert hat dort nichts, woran er sich messen koennte,
     und blieb wirkungslos. Das Wachsen im Flexraum hat es: "1 0 auto" nimmt,
     was uebrig ist, und gibt bei langem Inhalt nichts her.
     Beides steht hier, weil die Seite auch ausserhalb einer Flex-Huelle
     richtig stehen soll. */
  flex: 1 0 auto;
  min-height: 100%;
}
.mnyra-go-page * { box-sizing: border-box; }
.mnyra-go-page svg { display: block; }
/* Der Streifen zwischen Kopfzeile und Bento - die farbige Flaeche, auf der
   die Karte mit der Frage liegt. Genau die Rolle, die im Feed-Gate die
   Cyan-Flaeche ueber dem Bento hat.
   Und Luft an drei Seiten: oben, damit die Karte nicht an der Kopfzeile
   klebt, unten, damit ihr Schatten und die Kante des Bentos sich nicht
   beruehren. Zwei Schatten, die ineinanderlaufen, sehen aus wie Schmutz und
   nicht wie Tiefe. */
.mnyra-go-page__top {
  /* Oben 2.25rem statt der 20px von frueher: Der Abstand, den die Huelle
     unter der Kopfzeile hielt, gehoert jetzt hierher - sonst klebte die Karte
     an der Kopfzeile, seit das Blau bis dorthin reicht.
     Unten die Luft unter der Karte PLUS die Rundung des Bentos: Das Bento
     zieht sich um genau diese Rundung wieder herauf (siehe dort), damit seine
     runden Ecken in die Farbe schneiden und nicht in die Flaeche dahinter.
     Uebrig bleiben die 34px, die Kartenschatten und Bentokante auseinander
     halten. */
  padding: 2.25rem var(--go-inline) calc(34px + var(--go-bento-radius));
  background: var(--go-chrome);
}
/* Die Karte mit der Frage. Sie ist der Grund, warum die Seite offen ist -
   deshalb liegt sie mit einem Schatten auf der Flaeche und ist nicht in sie
   hineingezeichnet. Der Schatten ist weich und weit statt hart und nah: eine
   Karte, die schwebt, keine, die einen Rand wirft.

   Ihre Hoehe steht fest (430px) und wandert nicht mit dem Schritt. Eine Karte,
   die bei jeder Antwort waechst und schrumpft, schiebt das Bento unter ihr auf
   und ab - der Blick verliert bei jedem Tipp die Stelle, an der er war. Was
   nicht hineinpasst, scrollt in der Karte (Kalender, Staedteliste); der Kopf
   oben und der Knopf unten bleiben dabei stehen. */
.mnyra-go-page__ask {
  --go-card-height: 430px;
  --go-wheel-item: 44px;
  --go-wheel-height: 200px;
  --go-wheel-pad: 78px;
  position: relative;
  display: flex;
  flex-direction: column;
  height: var(--go-card-height);
  padding: 20px 20px 26px;
  border: 1px solid var(--go-line);
  border-radius: 32px;
  background: #ffffff;
  overflow: hidden;
  box-shadow:
    0 26px 50px -28px rgba(var(--go-chrome-shadow), 0.55),
    0 10px 22px -14px rgba(var(--go-chrome-shadow), 0.4),
    0 1px 2px rgba(var(--go-chrome-shadow), 0.12);
}
/* Kopf, Koerper, Fuss - und die beiden Linien dazwischen. Der Koerper ist das
   einzige Stueck, das sich dehnt: Er nimmt, was uebrig bleibt, und stellt
   seinen Inhalt in die Mitte. */
.mnyra-go-page__ask-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--go-line);
}
.mnyra-go-page__ask-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.mnyra-go-page__ask-body::-webkit-scrollbar { display: none; width: 0; height: 0; }
.mnyra-go-page__ask-foot {
  flex: 0 0 auto;
  padding-top: 10px;
  border-top: 1px solid var(--go-line);
}
/* Der Weg zurueck steht rechts oben, dort, wo im Schritt davor die Antwort
   stand. Ein Pfeil je Schritt reicht: Die Fragen stehen in einer Reihe, und
   wer zwei zurueck will, tippt zweimal. */
.mnyra-go-page__ask-back {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background: var(--go-plane);
  color: var(--go-ink);
  cursor: pointer;
}
.mnyra-go-page__ask-back svg { width: 16px; height: 16px; }
.mnyra-go-page__ask-back:active { transform: scale(0.94); }
/* Die Antwort des laufenden Schrittes, rechts neben der Frage - sie aendert
   sich unter dem Finger, waehrend das Rad laeuft. */
.mnyra-go-page__ask-value {
  flex: 0 0 auto;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--go-ink);
  font-variant-numeric: tabular-nums;
}
.mnyra-go-page__ask-value b { color: var(--go-accent); font-weight: 900; }
.mnyra-go-page__ask-hint {
  margin: 0;
  padding: 2px 0;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--go-muted);
}
/* Der Schriftzug in der Ecke. Er liegt unter dem Knopf und wird nie
   angetippt - er sagt nur, wessen Karte das ist. */
.mnyra-go-page__ask-mark {
  position: absolute;
  right: 18px;
  bottom: 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #cbd5e1;
  pointer-events: none;
  user-select: none;
}
.mnyra-go-page__ask-mark b { color: var(--go-accent); font-weight: 900; }
.mnyra-go-page__q {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  min-width: 0;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--go-ink);
}
.mnyra-go-page__q svg { width: 16px; height: 16px; color: var(--go-muted); flex: 0 0 auto; }
.mnyra-go-page__q small { font-size: 11px; font-weight: 700; color: var(--go-muted); }
/* Das Rad. Hier stand einmal ein Schieberegler, und er hatte einen Fehler,
   den kein Styling behebt: Sein Griff liegt genau unter dem Daumen, der ihn
   zieht - man verdeckt beim Einstellen die Einstellung. Ein Rad dreht sich
   dagegen UNTER der Hand weg, und die Zahl steht in der Mitte frei.
   Es ist ausserdem das Bedienteil, das ein Telefon fuer Zahl und Uhrzeit
   ohnehin kennt; niemand muss lernen, wie es geht.

   Die Geometrie haengt an drei Zahlen: eine Zeile ist 44px hoch, das Fenster
   200px, und darum ist das Polster oben und unten (200 - 44) / 2 = 78px. Nur
   damit liegt die erste Zeile bei scrollTop 0 mittig - der Controller rechnet
   mit denselben Zahlen (GO_WHEEL_ITEM_HEIGHT). */
.mnyra-go-page__wheel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  height: var(--go-wheel-height);
  overflow: hidden;
  user-select: none;
}
/* Das Band in der Mitte sagt, welche Zeile gilt. Es liegt hinter den Zahlen
   und faengt keinen Tipp ab. */
.mnyra-go-page__wheel-band {
  position: absolute;
  left: 4px;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  height: var(--go-wheel-item);
  border: 1px solid rgba(79, 70, 229, 0.18);
  border-radius: 16px;
  background: rgba(79, 70, 229, 0.07);
  pointer-events: none;
}
/* Oben und unten laeuft die Liste ins Weiss der Karte aus - so hoert sie auf,
   ohne eine Kante zu ziehen. */
.mnyra-go-page__wheel-fade {
  position: absolute;
  left: 0;
  right: 0;
  height: 56px;
  z-index: 2;
  pointer-events: none;
}
.mnyra-go-page__wheel-fade--top {
  top: 0;
  background: linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0));
}
.mnyra-go-page__wheel-fade--bottom {
  bottom: 0;
  background: linear-gradient(to top, #ffffff, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0));
}
.mnyra-go-page__wheel-list {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-y;
  text-align: center;
}
.mnyra-go-page__wheel-list::-webkit-scrollbar { display: none; width: 0; height: 0; }
.mnyra-go-page__wheel-list--party { width: 158px; }
.mnyra-go-page__wheel-list--time { width: 72px; }
.mnyra-go-page__wheel-pad { height: var(--go-wheel-pad); flex: 0 0 auto; pointer-events: none; }
.mnyra-go-page__wheel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: var(--go-wheel-item);
  padding: 0;
  border: none;
  background: transparent;
  color: #cbd5e1;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  scroll-snap-align: center;
  cursor: pointer;
  transition: color 0.15s ease;
}
.mnyra-go-page__wheel-item span { font-size: 11px; font-weight: 700; color: #cbd5e1; }
.mnyra-go-page__wheel-item[aria-selected="true"] {
  color: var(--go-ink);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.03em;
}
.mnyra-go-page__wheel-item[aria-selected="true"] span { color: var(--go-muted); }
.mnyra-go-page__wheel-colon {
  z-index: 1;
  font-size: 24px;
  font-weight: 900;
  color: var(--go-ink);
}
/* Die vier Zeiten. Kacheln, keine Dropdowns - GO wird mit dem Daumen bedient,
   und 44px sind die kleinste Flaeche, die sicher zu treffen ist; diese hier
   sind mehr als doppelt so hoch.
   Das Symbol steht oben, die Beschriftung unten: Dazwischen steht Luft, und
   die traegt die Zeile darunter ("Për 30 minuta"), ohne dass sie an das Wort
   darueber stoesst. */
.mnyra-go-page__chips {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.mnyra-go-page__chip {
  min-height: 44px;
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 13px 13px 12px;
  border: 1px solid var(--go-line);
  border-radius: 20px;
  background: var(--go-plane);
  color: var(--go-ink);
  font-size: 13.5px;
  font-weight: 900;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.mnyra-go-page__chip svg { width: 18px; height: 18px; flex: 0 0 auto; color: var(--go-muted); }
.mnyra-go-page__chip b { display: block; font-size: 13.5px; font-weight: 900; letter-spacing: -0.015em; }
.mnyra-go-page__chip i {
  display: block;
  margin-top: 2px;
  font-size: 10.5px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.25;
  color: var(--go-ink-2);
}
.mnyra-go-page__chip[aria-pressed="true"] {
  background: var(--go-ink);
  border-color: var(--go-ink);
  color: #ffffff;
}
.mnyra-go-page__chip[aria-pressed="true"] svg { color: #fbbf24; }
.mnyra-go-page__chip[aria-pressed="true"] i { color: rgba(255, 255, 255, 0.68); }
.mnyra-go-page__chip:active { transform: scale(0.97); }
.mnyra-go-page__chip--wide { grid-column: 1 / -1; }
/* Die drei Antworten auf "Për çka jeni?". Untereinander statt im Raster: So
   traegt jede die volle Breite, und die Zeile darunter hat Platz.
   Sie sind hoeher als die alten Pillen (rund 60px statt 44) - das ist der
   Preis fuer die Zeile, und sie ist es wert: "Pije" allein saehe aus, als
   waere Ëmbëlsira nicht dabei. */
.mnyra-go-page__intents {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mnyra-go-page__intent {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: 18px;
  background: var(--go-plane);
  color: var(--go-ink);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.mnyra-go-page__intent:active { transform: scale(0.985); }
.mnyra-go-page__intent-ic {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--go-muted);
}
.mnyra-go-page__intent-ic svg { width: 18px; height: 18px; }
.mnyra-go-page__intent-body { min-width: 0; }
.mnyra-go-page__intent-label {
  display: block;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.015em;
}
/* Die Zeile darunter sagt, was in der Antwort steckt. Sie ist leiser als das
   Wort darueber, aber nicht so leise, dass man sie ueberliest. */
.mnyra-go-page__intent-hint {
  display: block;
  margin-top: 2px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--go-ink-2);
}
.mnyra-go-page__intent[aria-pressed="true"] {
  background: var(--go-ink);
  border-color: var(--go-ink);
  color: #ffffff;
}
.mnyra-go-page__intent[aria-pressed="true"] .mnyra-go-page__intent-ic { color: #ffffff; }
.mnyra-go-page__intent[aria-pressed="true"] .mnyra-go-page__intent-hint { color: rgba(255, 255, 255, 0.72); }
.mnyra-go-page__field {
  width: 100%;
  min-height: 48px;
  margin-top: 10px;
  padding: 0 14px;
  border: 1px solid var(--go-outline);
  border-radius: 16px;
  background: var(--go-plane);
  color: var(--go-ink);
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
}
.mnyra-go-page__field-label {
  margin: 14px 0 0;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--go-muted);
}
.mnyra-go-page__place {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  background: var(--go-plane);
}
.mnyra-go-page__place-ic {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 12px;
  background: #ffffff;
  color: var(--go-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-go-page__place-ic svg { width: 17px; height: 17px; }
.mnyra-go-page__place-body { flex: 1; min-width: 0; }
.mnyra-go-page__place-label {
  display: block;
  margin: 0;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--go-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-go-page__place-city {
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--go-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-go-page__place-change {
  flex: 0 0 auto;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: var(--go-ink-2);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: inherit;
  cursor: pointer;
}
.mnyra-go-page__place-change svg { width: 13px; height: 13px; }
.mnyra-go-page__place-change--save { background: var(--go-ink); color: #ffffff; }
/* Der Kalender. Er zeigt den Monat, in dem man steht - und, wenn die Woche
   ueber seinen Rand hinausreicht, den Anfang des naechsten dazu. Weiter als
   GO_MAX_LEAD_DAYS plant GO nicht: GO ist fuer "wir gehen jetzt raus", nicht
   fuer den Geburtstag in drei Wochen. Was ausserhalb liegt, steht trotzdem da
   und ist nur abgeschaltet - ein Kalender, der nur acht Tage zeigt, sieht aus
   wie einer, dem etwas fehlt. */
.mnyra-go-page__cal + .mnyra-go-page__cal { margin-top: 14px; }
.mnyra-go-page__cal-month {
  margin: 0 0 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--go-ink);
}
.mnyra-go-page__cal-week,
.mnyra-go-page__cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
}
.mnyra-go-page__cal-week {
  margin-bottom: 4px;
  text-align: center;
  font-size: 10px;
  font-weight: 900;
  color: var(--go-muted);
}
.mnyra-go-page__cal-day {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: var(--go-ink);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.mnyra-go-page__cal-day[disabled] { color: #cbd5e1; opacity: 0.4; cursor: default; }
.mnyra-go-page__cal-day[aria-pressed="true"] { background: var(--go-accent); color: #ffffff; }
/* Die Staedte. Gesucht wird im Feld darueber, und was nicht passt, wird
   ausgeblendet statt neu gezeichnet - ein Neuaufbau bei jedem Buchstaben
   naehme dem Feld die Tastatur. */
.mnyra-go-page__city-search { position: relative; margin-bottom: 8px; }
.mnyra-go-page__city-search svg {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--go-muted);
  pointer-events: none;
}
.mnyra-go-page__city-search .mnyra-go-page__field { margin-top: 0; padding-left: 38px; }
.mnyra-go-page__city-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 168px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.mnyra-go-page__city-list::-webkit-scrollbar { display: none; width: 0; height: 0; }
.mnyra-go-page__city-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: 0 0 auto;
  padding: 9px 12px;
  border: 1px solid var(--go-line);
  border-radius: 14px;
  background: var(--go-plane);
  color: var(--go-ink);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}
.mnyra-go-page__city-option span { font-size: 10.5px; font-weight: 700; color: var(--go-muted); }
.mnyra-go-page__city-option[aria-pressed="true"] {
  background: var(--go-accent);
  border-color: var(--go-accent);
  color: #ffffff;
}
.mnyra-go-page__city-option[aria-pressed="true"] span { color: rgba(255, 255, 255, 0.75); }
.mnyra-go-page__city-option[hidden] { display: none; }
.mnyra-go-page__city-option--free { background: #eef2ff; border-color: rgba(79, 70, 229, 0.2); color: var(--go-accent); }
.mnyra-go-page__city-option--free svg { width: 14px; height: 14px; flex: 0 0 auto; }
/* -------------------------------------------------------------------------
   Die Karte, waehrend die Anfrage laeuft.
   -------------------------------------------------------------------------
   Sie steht an derselben Stelle wie die Fragen und hat dieselbe Hoehe - es
   ist dieselbe Karte, sie zeigt nur etwas anderes. Was sich waehrend der
   Suche aendert (Zahl, Name, Sekunden), wird am Knoten geaendert und nicht
   neu gezeichnet: Ein Neuaufbau der Seite alle 650ms setzt jede Animation
   zurueck und laedt vier Bilder im Bento erneut ein. */
.mnyra-go-page__live-badge {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--go-ink);
  color: #fbbf24;
}
.mnyra-go-page__live-badge svg { display: none; width: 16px; height: 16px; }
.mnyra-go-page__live-badge[data-go-live-icon="0"] svg:nth-of-type(1),
.mnyra-go-page__live-badge[data-go-live-icon="1"] svg:nth-of-type(2),
.mnyra-go-page__live-badge[data-go-live-icon="2"] svg:nth-of-type(3),
.mnyra-go-page__live-badge[data-go-live-icon="3"] svg:nth-of-type(4),
.mnyra-go-page__live-badge[data-go-live-icon="4"] svg:nth-of-type(5) { display: block; }
.mnyra-go-page__live-badge--done { background: #047857; color: #ffffff; }
.mnyra-go-page__live-badge--warn { background: #b45309; color: #ffffff; }
.mnyra-go-page__live-badge--done svg,
.mnyra-go-page__live-badge--warn svg { display: block; }
.mnyra-go-page__brand {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--go-ink);
}
.mnyra-go-page__brand b { color: var(--go-accent); font-weight: 900; }
.mnyra-go-page__live { text-align: center; }
.mnyra-go-page__live-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--go-ink);
}
.mnyra-go-page__live-pill {
  display: inline-block;
  margin: 10px 0 0;
  padding: 6px 13px;
  border: 1px solid rgba(79, 70, 229, 0.14);
  border-radius: 999px;
  background: #eef2ff;
  color: var(--go-accent);
  font-size: 11.5px;
  font-weight: 800;
}
.mnyra-go-page__live-sub { margin: 10px 0 0; font-size: 11px; font-weight: 600; color: var(--go-muted); }
.mnyra-go-page__live-count {
  font-size: 50px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--go-ink);
  font-variant-numeric: tabular-nums;
}
.mnyra-go-page__live-word { margin: 8px 0 0; font-size: 15px; font-weight: 800; color: var(--go-ink-2); }
.mnyra-go-page__live-name {
  margin: 12px 0 0;
  min-height: 16px;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--go-accent);
}
/* Zwei Bilder, eine Karte: Was gerade nicht gilt, ist weg - nicht blass. */
.mnyra-go-page [data-go-live="send"] .mnyra-go-page__live-arrive,
.mnyra-go-page [data-go-live="arrive"] .mnyra-go-page__live-send,
.mnyra-go-page [data-go-live-done="0"] [data-go-live-open],
.mnyra-go-page [data-go-live-done="1"] [data-go-live-hint] { display: none; }
@keyframes mnyraGoPop {
  from { opacity: 0; transform: translateY(9px) scale(0.86); }
  to { opacity: 1; transform: none; }
}
@keyframes mnyraGoRise {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
.mnyra-go-page__live-count[data-go-pop="1"] { animation: mnyraGoPop 0.42s cubic-bezier(0.22, 0.61, 0.36, 1); }
.mnyra-go-page__live-name[data-go-pop="1"] { animation: mnyraGoRise 0.42s cubic-bezier(0.22, 0.61, 0.36, 1); }
.mnyra-go-page__cta {
  width: 100%;
  min-height: 50px;
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: none;
  border-radius: 18px;
  background: var(--go-ink);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 900;
  letter-spacing: -0.01em;
  font-family: inherit;
  cursor: pointer;
}
.mnyra-go-page__cta svg { width: 17px; height: 17px; }
/* Im Fuss der Karte traegt schon die Linie den Abstand - ein zweiter darueber
   waere Luft, die der Karte unten fehlt. */
.mnyra-go-page__ask-foot .mnyra-go-page__cta { margin-top: 0; }
.mnyra-go-page__cta--quiet { background: var(--go-plane); color: var(--go-ink-2); }
.mnyra-go-page__cta:disabled { opacity: 0.6; cursor: not-allowed; }
.mnyra-go-page__cta:not(:disabled):active { transform: scale(0.99); }
.mnyra-go-page__hint { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go-page__note {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #fffbeb;
  color: #b45309;
  font-size: 13px;
  font-weight: 700;
}
/* Das Bento. Weiss, oben 2.5rem gerundet, und es laeuft bis ans Ende der
   Seite - deshalb sind auch nur die oberen Ecken gerundet. Der Schatten geht
   nach oben und ist knapp: er soll die Rundung zeigen, nicht unter der Karte
   liegen. */
.mnyra-go-page__bento {
  /* Das Bento liegt UEBER dem Streifen, nicht daneben - genau wie im
     Feed-Gate. Es zieht sich um seine eigene Rundung wieder herauf; dadurch
     schneiden seine runden Ecken in die Farbe, und man sieht, worauf es
     liegt. Ohne das Herauziehen endete die Farbe genau dort, wo das Bento
     anfaengt, und die Ecken gaeben den Grund der Seite frei: eine graue Kerbe
     links und rechts, die aussieht, als hoere die Farbe zu frueh auf.
     "position: relative" ist kein Beiwerk - ohne eigenen Stapelplatz laege
     das herausgezogene Stueck hinter dem Streifen. */
  position: relative;
  z-index: 1;
  margin-top: calc(var(--go-bento-radius) * -1);
  flex: 1 1 auto;
  background: var(--go-bento-surface);
  border-top-left-radius: var(--go-bento-radius);
  border-top-right-radius: var(--go-bento-radius);
  padding: 2.35rem var(--go-inline) 2rem;
  box-shadow: 0 -16px 34px -26px rgba(var(--go-chrome-shadow), 0.7);
}
.mnyra-go-page__lead {
  margin: 0;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.15;
}
/* Die Bildergeschichte. Untereinander und nicht nebeneinander: Die Bilder
   sind 16:9, und drei davon nebeneinander waeren auf einem Telefon drei
   Briefmarken. Untereinander gelesen ist die Reihenfolge ausserdem die der
   Sache selbst - erst der Hunger, dann die Frage wohin, dann der Preis, dann
   der Abend. */
.mnyra-go-page__story {
  /* Kein eigener Abstand nach oben: Die Geschichte ist das Erste im Bento,
     und das Polster des Bentos ist ihr Abstand. Ein zweiter daneben waere
     ein Streifen Weiss ueber dem ersten Bild und sonst nichts. */
  display: flex;
  flex-direction: column;
  /* Der Abstand macht NICHT den Fokus - das tut die gestaffelte Einblendung
     darunter. Er stand einmal bei 64svh, gerechnet so, dass immer nur ein
     Kapitel im Fenster steht. Das hielt zwar den Blick, hinterliess aber halbe
     leere Bildschirme; der Denkfehler dahinter ist, dass Leere Fokus mache.
     Sie macht nur Leere.
     Was den Blick wirklich haelt, ist, dass unten noch nichts STEHT: Das
     naechste Bild ist zwar schon im Fenster, aber noch nicht aufgedeckt, und
     diese Flaeche fuellt sich, waehrend man ankommt. Deshalb reicht hier ein
     Abstand, der ein Kapitel vom naechsten trennt - keiner, der einen ganzen
     Bildschirm dazwischenlegt.
     Er misst weiter an der Fensterhoehe und nicht in rem: Was "ein Stueck
     weiter" heisst, haengt am Geraet. "svh" und nicht "vh", weil die kleine
     Fensterhoehe sich beim Scrollen nicht aendert - sonst wuechse der Abstand
     unter dem Finger. */
  gap: clamp(3.5rem, 20svh, 11rem);
}
/* Aufgedeckt wird beim Scrollen - Stueck fuer Stueck, nicht kapitelweise:
   erst das Bild, dann, ein Stueck Scrollen spaeter, der Satz darunter, dann
   das naechste Bild. Genau der Takt, in dem der Daumen arbeitet.
   Vorher hingen Bild und Satz aneinander (der Satz kam 90ms nach dem Bild).
   Damit erschien ein ganzes Kapitel auf einen Schlag - und wer scrollte, sah
   entweder alles oder nichts.

   Der verborgene Zustand steht in der Regel ohne Zustandsmarke, der sichtbare
   mit: So ist die Seite noch beim ersten Aufbau richtig, ohne dass jemand
   etwas anschalten muesste. Sichtbar wird ein Stueck ausschliesslich durch
   data-go-reveal-in - und das setzt der Beobachter (oder, wo es ihn nicht
   gibt, der Controller sofort fuer alle). */
.mnyra-go-page [data-go-reveal] {
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}
/* Nur solange etwas bevorsteht. Ein will-change, das stehen bleibt, haelt fuer
   jedes Stueck eine eigene Ebene im Speicher - acht davon auf einer Seite,
   die ohnehin vier grosse Bilder traegt. */
.mnyra-go-page [data-go-reveal]:not([data-go-reveal-in="1"]) {
  will-change: opacity, transform;
}
.mnyra-go-page [data-go-reveal][data-go-reveal-in="1"] {
  opacity: 1;
  transform: none;
}
/* Das Bildfenster steht, bevor das Bild da ist: Es haelt sein
   Seitenverhaeltnis aus sich heraus, damit beim Nachladen nichts springt und
   der Satz darunter nicht wandert. Fehlt eine Datei, nimmt der Browser das
   Bild heraus (onerror) und es bleibt diese Flaeche stehen - kein zerbrochenes
   Symbol mitten in der Erklaerung. */
.mnyra-go-page__story-media {
  position: relative;
  margin: 0;
  overflow: hidden;
  border-radius: 22px;
  background: var(--go-plane);
  /* 4:3 und nicht 16:9 - das ist der Grund, warum die Seite ueberhaupt einen
     Blick halten kann.
     Nachgesehen bei Apple (apple.com/iphone, overview.built.css): Ihre Karte
     auf dem Telefon ist 260 breit und 480 hoch - hochkant, 57 % der
     Schirmhoehe. Ein solcher Block gehoert dem Blick von selbst. Unser
     16:9-Streifen fuellte 23 %, also passten immer zwei ins Fenster, und das
     liess sich mit Abstand nicht heilen: Apples Abstaende auf dem Telefon
     sind 56 bis 160px - dieselbe Groessenordnung wie unsere. Es lag nie am
     Abstand, es lag am Bild.
     4:3 ist bei DIESEM Material die Grenze - gegengeprueft an allen vier
     Fotos: bei 1:1 laeuft die Frage in Schulter und Telefon, bei 4:5 liegt sie
     mitten auf der Person. Fuer echte 4:5 braeuchte es hochkant gesetzte
     Zuschnitte, und das ist eine Aufgabe fuer die Kamera, nicht fuer CSS. */
  aspect-ratio: 4 / 3;
}
.mnyra-go-page__story-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Das Bild kommt eine Spur zu gross herein und setzt sich beim Aufdecken -
     langsamer als die Kachel selbst, sonst waere es ein Ruck statt einer
     Bewegung. */
  transform: scale(1.06);
  transition: transform 1.05s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.mnyra-go-page__story-media[data-go-reveal-in="1"] img {
  transform: none;
}
/* Die Frage liegt IM Bild - auf der Seite, wo das Foto leer ist. Sie steht
   mittig auf der Hoehe und nicht oben oder unten: Die Fotos sind in der
   Mitte am ruhigsten, oben ist Wand und unten Tisch.
   Ueber die halbe Breite geht sie nie ("max-width: 46%") - die andere Haelfte
   gehoert dem Foto, und eine Frage, die ins Gesicht laeuft, ist keine
   Bildsprache mehr, sondern ein Unfall. */
.mnyra-go-page__story-headline {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  max-width: 46%;
  margin: 0;
  font-size: clamp(17px, 5.6vw, 30px);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.08;
  color: var(--go-ink);
  text-wrap: balance;
  /* Der Text liegt auf dem Foto und wird nicht angetippt - der Klick gehoert
     dem, was darunter liegt. */
  pointer-events: none;
}
/* Rechts oder links, je nachdem, wo das Foto Platz hat. Der Abstand zur Kante
   waechst mit dem Bild mit (5% statt einer festen Zahl), sonst klebte die
   Frage auf einem kleinen Telefon am Rand und schwaemme auf einem grossen in
   der Mitte. */
/* Das Bild ist breiter als sein Fenster - beschnitten wird an den Seiten.
   WELCHE Seite stehen bleibt, sagt das Foto: dort, wo das Motiv sitzt. Ohne
   das schnitte der Zuschnitt mittig und naehme von beiden Seiten etwas weg -
   von der Person und von der Flaeche, auf der die Frage steht. */
.mnyra-go-page__story-media[data-go-story-focus="left"] img { object-position: left center; }
.mnyra-go-page__story-media[data-go-story-focus="right"] img { object-position: right center; }
.mnyra-go-page__story-media[data-go-story-focus="center"] img { object-position: center; }
.mnyra-go-page__story-media[data-go-story-side="right"] .mnyra-go-page__story-headline {
  right: 5%;
  text-align: right;
}
.mnyra-go-page__story-media[data-go-story-side="left"] .mnyra-go-page__story-headline {
  left: 5%;
  text-align: left;
}
.mnyra-go-page__story-headline-accent { color: var(--go-accent); }
/* Die Frage kommt eine Idee nach dem Bild - erst die Flaeche, dann das Wort
   darauf. Sie ruecken dabei aus der Richtung heran, aus der sie stehen. */
.mnyra-go-page__story-headline {
  opacity: 0;
  transition:
    opacity 0.65s cubic-bezier(0.22, 0.61, 0.36, 1) 0.18s,
    transform 0.65s cubic-bezier(0.22, 0.61, 0.36, 1) 0.18s;
}
.mnyra-go-page__story-media[data-go-story-side="right"] .mnyra-go-page__story-headline {
  transform: translate(14px, -50%);
}
.mnyra-go-page__story-media[data-go-story-side="left"] .mnyra-go-page__story-headline {
  transform: translate(-14px, -50%);
}
.mnyra-go-page__story-media[data-go-reveal-in="1"] .mnyra-go-page__story-headline {
  opacity: 1;
  transform: translate(0, -50%);
}
/* Der Satz traegt das Kapitel, also darf er auch so gross sein. 21px statt
   15px, enger gestellt und mit weiter Zeile - der Ton, in dem eine
   Produktseite spricht, nicht der einer Bildunterschrift.
   "clamp" statt einer festen Zahl: auf einem kleinen Telefon bliebe eine
   21px-Zeile sonst nach zwei Woertern haengen. */
.mnyra-go-page__story-text {
  /* Der Satz haengt nicht am Bild, er steht darunter - und er deckt sich
     selbst auf, wenn man bei ihm ankommt (data-go-reveal). Der Abstand ist
     deshalb nicht bloss Luft: Er IST der Weg, den der Daumen zwischen zwei
     Einblendungen zuruecklegt. Zu wenig davon, und Bild und Satz kommen im
     selben Wisch - dann war die ganze Staffelung umsonst.
     Frueher stand hier eine Verzoegerung von 90ms gegen das Bild. Das ist
     Zeit, und Zeit vergeht auch, wenn man gar nicht scrollt.
     Er misst an der Fensterhoehe wie der Abstand zwischen den Kapiteln, aber
     er bleibt deutlich kleiner (10svh gegen 20svh): Ein Kapitel muss als
     eines lesbar bleiben. Waeren beide gleich, stuenden dort acht einzelne
     Dinge statt vier Kapiteln. */
  margin: clamp(2.75rem, 10svh, 6rem) 0 0;
  max-width: 22ch;
  font-size: clamp(18px, 5.4vw, 21px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.32;
  color: var(--go-ink);
  text-wrap: balance;
}
/* Die betonte Stelle - je Satz genau eine, im Blau von Mnyra. Sie traegt
   keine andere Schriftstaerke: Die Farbe hebt schon genug hervor, und zwei
   Mittel fuer eine Betonung sind eines zu viel. */
.mnyra-go-page__story-accent { color: var(--go-accent); }
/* Wer Bewegung abbestellt hat, bekommt sie nicht - auch nicht als "dezente"
   Version. Die Seite steht dann einfach da, vollstaendig und sofort. */
@media (prefers-reduced-motion: reduce) {
  .mnyra-go-page [data-go-reveal],
  .mnyra-go-page__story-media img {
    opacity: 1;
    transform: none;
    transition: none;
  }
  /* Die Frage behaelt ihre halbe Hoehe - "transform: none" wuerde sie hier
     nicht beruhigen, sondern an den oberen Rand des Bildes werfen. */
  .mnyra-go-page__story-headline,
  .mnyra-go-page__story-media[data-go-story-side="right"] .mnyra-go-page__story-headline,
  .mnyra-go-page__story-media[data-go-story-side="left"] .mnyra-go-page__story-headline {
    opacity: 1;
    transform: translate(0, -50%);
    transition: none;
  }
}
/* Die Ergebniskarte. Sie darf nicht aussehen wie eine gewoehnliche Oferta:
   oben steht, WER anbietet, darunter, was DIESER Gruppe angeboten wird.
   Auf dem weissen Bento traegt sie die Flaeche der App, wie die
   Erklaerkarten - sonst waere sie ein Rahmen ohne Karte darin. */
.mnyra-go-page__card {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--go-outline);
  border-radius: 26px;
  background: var(--go-plane);
  /* Nach "Shiko ofertat" faehrt die Seite zum ersten Angebot. Ohne diesen
     Rand endete die Fahrt mit der Oberkante der Karte genau unter der
     Kopfzeile der App - halb verdeckt, und der Blick sucht wieder. */
  scroll-margin-top: 88px;
}
.mnyra-go-page__card-head { display: flex; align-items: center; gap: 10px; }
.mnyra-go-page__card-logo { width: 40px; height: 40px; border-radius: 14px; object-fit: cover; background: var(--go-plane); flex: 0 0 auto; }
.mnyra-go-page__card-logo--empty { color: var(--go-muted); display: flex; align-items: center; justify-content: center; }
.mnyra-go-page__card-logo--empty svg { width: 18px; height: 18px; }
.mnyra-go-page__card-names { min-width: 0; }
.mnyra-go-page__card-who { margin: 0; min-width: 0; font-size: 13px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-go-page__card-who span { color: var(--go-muted); font-weight: 700; }
.mnyra-go-page__card-sponsored { margin: 2px 0 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted); }
.mnyra-go-page__card-benefit { margin: 12px 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go-page__card-for { margin: 2px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go-page__card-meta { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go-page__card-meta span { display: inline-flex; align-items: center; gap: 5px; }
.mnyra-go-page__card-meta svg { width: 14px; height: 14px; color: var(--go-muted); }
.mnyra-go-page__card-only { margin: 12px 0 0; display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted); }
.mnyra-go-page__card-only svg { width: 12px; height: 12px; }
.mnyra-go-page__done { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go-page__done svg { width: 24px; height: 24px; flex: 0 0 auto; color: var(--go-accent); }
.mnyra-go-page__done-name { margin: 16px 0 0; font-size: 19px; font-weight: 900; letter-spacing: -0.02em; }
.mnyra-go-page__ok {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #ecfdf5;
  color: #047857;
  font-size: 13px;
  font-weight: 900;
}
.mnyra-go-page__ok svg { width: 17px; height: 17px; flex: 0 0 auto; }
.mnyra-go-page__code {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--go-plane);
}
.mnyra-go-page__code-label { margin: 0; display: flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted); }
.mnyra-go-page__code-label svg { width: 12px; height: 12px; }
.mnyra-go-page__code-value { margin: 4px 0 0; font-size: 26px; font-weight: 900; letter-spacing: 0.3em; }
/* Der Kasten mit dem Link. Er sieht aus wie der Kasten mit dem Code und
   steht direkt darunter - beides ist dasselbe: etwas, das der Gast mitnimmt.
   Die Adresse selbst bricht an jeder Stelle um; ein Token bricht sonst aus
   dem Kasten heraus, und der Gast sieht nur die Haelfte. */
.mnyra-go-page__link {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--go-plane);
}
.mnyra-go-page__link-value {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--go-ink);
  overflow-wrap: anywhere;
  word-break: break-all;
}
.mnyra-go-page__link .mnyra-go-page__cta { margin-top: 10px; min-height: 44px; font-size: 13px; }
.mnyra-go-page__link-hint {
  margin: 8px 0 0;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--go-muted);
}
.mnyra-go-page__row { margin-top: 16px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.mnyra-go-page__row .mnyra-go-page__cta { margin-top: 0; min-height: 48px; font-size: 13px; }
.mnyra-go-page__ghost {
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--go-muted);
  font-size: 12px;
  font-weight: 900;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
}
.mnyra-go-page__empty { padding: 32px 0; text-align: center; font-size: 14px; font-weight: 900; color: var(--go-muted); }
/* Auf breiten Schirmen steht der Inhalt in der Mitte - die Flaechen aber
   laufen weiter von Rand zu Rand. Ein 560px breiter Farbstreifen mitten im
   Bild waere ein Balken, keine Flaeche; deshalb bekommt hier die Karte die
   Begrenzung und nicht der Streifen, der sie traegt. */
@media (min-width: 768px) {
  .mnyra-go-page__ask { max-width: 560px; margin: 0 auto; }
  .mnyra-go-page__bento > * { max-width: 560px; margin-left: auto; margin-right: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .mnyra-go-page__chip, .mnyra-go-page__cta, .mnyra-go-page__cal-day { transition: none; }
  /* Die Zahl der eintreffenden Lokale wechselt weiter - sie ist die Auskunft
     selbst. Nur ihr Aufspringen faellt weg. */
  .mnyra-go-page__live-count[data-go-pop="1"],
  .mnyra-go-page__live-name[data-go-pop="1"] { animation: none; }
}
`;

const TEXTS = Object.freeze({
  brand: "Mnyra GO",
  partyQuestion: "Sa persona jeni?",
  partyOne: "person",
  partyMany: "persona",
  step: "Hapi",
  stepBack: "Kthehu një hap prapa",
  next: "Vazhdo",
  categoryQuestion: "Për çka jeni?",
  whenQuestion: "Kur?",
  whenLaterLabel: "Zgjidh ditën dhe orën",
  whenPickDate: "Zgjidh datën",
  whenPickTime: "Zgjidh orën",
  whenSaveTime: "Ruaj orën",
  whenHintPick: "Zgjidh orarin e dëshiruar",
  whenHintDate: "Kliko mbi një datë për të vazhduar tek orari",
  today: "Sot",
  tomorrow: "Nesër",
  placeQuestion: "Ku?",
  placeLabel: "Qyteti",
  placeEmpty: "Shto qytetin tënd",
  cityPlaceholder: "Shkruaj qytetin",
  cityQuestion: "Zgjidh qytetin",
  citySearch: "Kërko ose shkruaj qytetin...",
  cityUse: "Përdor",
  citySaveCity: "Ruaj qytetin",
  pickHint: "Zgjidh një opsion për të vazhduar",
  submit: "Merr ofertat",
  // Was waehrend der Suche auf der Karte steht.
  liveSending: "Kërkesa po dërgohet...",
  liveWait: "Koha e pritjes",
  liveSeconds: "sekonda",
  liveStillWaiting: "Po presim përgjigjet...",
  liveContacting: "Po kontaktojmë lokalet në",
  liveOne: "lokal dërgoi ofertë",
  liveMany: "lokale dërguan ofertë",
  liveOpen: "Shiko ofertat",
  readyTitle: "Gati!",
  readyOne: "ofertë u gjet",
  readyMany: "oferta u gjetën",
  searching: "Po kërkojmë...",
  resultsHeadline: "lokale kanë oferta për ju",
  offering: "po ju ofron",
  forGroup: "për grupin tuaj",
  accept: "Prano ofertën",
  confirming: "Po konfirmohet...",
  sponsored: "Sponsored",
  onlyGo: "Vetëm me Mnyra GO",
  tableIncluded: "Tavolinë",
  emptyTitle: "Nuk gjetëm ofertë GO që përputhet tani.",
  emptySubtitle: "Provo me një orë tjetër ose me një grup tjetër.",
  doneTitle: "U krye",
  reservationConfirmed: "Tavolina është konfirmuar",
  claimConfirmed: "Oferta është e juaja",
  menu: "Shiko menunë",
  directions: "Udhëzime",
  code: "Kodi",
  linkLabel: "Linku yt",
  linkCopy: "Kopjo linkun",
  linkCopied: "U kopjua",
  linkHint: "Ruaje kët link. Me tê e gjen ofertën në çdo telefon.",
  cancel: "Anulo",
  cancelConfirm: "Dëshiron ta anulosh?",
  cancelYes: "Po, anuloje",
  cancelNo: "Jo",
  saveToAccount: "Ruaje në llogarinë tënde",
  signIn: "Hyr",
  errorTitle: "Mnyra GO është përkohësisht i padisponueshëm.",
  errorRetry: "Provo prapë",
  alternatives: "alternativa për ju",
  peopleSuffix: "persona",
  now: "Tani",
  back: "Ndrysho kërkimin"
});

// Die Bildergeschichte im Bento. Vier Bilder, vier Schritte - was GO ist, in
// der Reihenfolge, in der es passiert.
//
// Die Fragen standen einmal IM Bild. Jetzt sind die Fotos leer und die Frage
// liegt als echter Text darauf. Das ist kein Schoenheitsentscheid:
//
//   - Sie laesst sich lesen, vergroessern, uebersetzen und vorlesen.
//   - Sie laesst sich aendern, ohne dass jemand vier Bilder neu setzt.
//   - Sie bleibt scharf, auf jedem Bildschirm und in jeder Groesse.
//
// "side" sagt, auf welcher Seite des Bildes sie steht: dort, wo das Foto
// leer ist. Das ist eine Eigenschaft DES FOTOS und keine Meinung - auf Bild 1
// und 3 sitzt die Frau links, auf Bild 2 rechts. Wer ein Foto tauscht, zieht
// diese Seite mit.
//
// Bild 4 traegt keine Frage. Es ist das Ende der Geschichte, nicht ihre
// naechste Frage - und der Tisch im Bild ist voll, dort waere kein Platz.
//
// Die Dateien liegen unter assets/go/ und heissen nach ihrer Reihenfolge -
// die Geschichte hat eine, und ein Bild an der falschen Stelle erzaehlt sie
// falsch herum.
const GO_STORY_BASE = "/apps/menyra-social/assets/go/";

// Der Satz steht als Stuecke da, nicht als eine Zeile mit Markierungen darin.
// Ein Stueck ist entweder Text oder betont ({ accent: "..." }) - und damit
// steht die Betonung neben dem Wort, das sie meint, statt in einer zweiten
// Liste, die man beim Umformulieren vergisst. Gesucht und ersetzt wird nichts:
// Ein "ty" faende sonst auch das "ty" in "tyre".
//
// Betont ist je Bild genau EINE Stelle - die, auf die es hinauslaeuft. Zwei
// Betonungen in einem Satz heben einander auf.
const GO_STORY_SLIDES = Object.freeze([
  Object.freeze({
    file: "story-1-uritur.webp",
    alt: "Vajzë ulur në tavolinë, e uritur",
    side: "right",
    focus: "left",
    headline: Object.freeze(["A je ", Object.freeze({ accent: "unt?" })]),
    text: Object.freeze([
      "Hape Mnyra GO edhe thuaj veç ",
      Object.freeze({ accent: "sa veta jeni" }),
      " edhe çka po ju hahet."
    ])
  }),
  Object.freeze({
    file: "story-2-kerkim.webp",
    alt: "Vajzë që shikon telefonin, tuj kërku lokal",
    side: "left",
    focus: "right",
    headline: Object.freeze(["Ku me ", Object.freeze({ accent: "shku?" })]),
    text: Object.freeze([
      "Po kërkon restorant a kafe, po s’po din ku? ",
      Object.freeze({ accent: "Mos kërko" }),
      " — lokalet t’gjejnë ty."
    ])
  }),
  Object.freeze({
    file: "story-3-oferta.webp",
    alt: "Vajzë e gëzueme me telefon në dorë",
    side: "right",
    focus: "left",
    headline: Object.freeze(["Ofertat ", Object.freeze({ accent: "t’vijn." })]),
    text: Object.freeze([
      "Lokalet përreth teje t’çojnë zbritje a diçka falas, ",
      Object.freeze({ accent: "veç për grupin tënd" }),
      "."
    ])
  }),
  Object.freeze({
    file: "story-4-tavolina.webp",
    alt: "Dy shoqe në tavolinë të lokalit",
    side: "right",
    // Der Tisch fuellt das Bild von links nach rechts - hier gibt es keine
    // Seite, die wichtiger waere.
    focus: "center",
    // Kein Titel im Bild - siehe oben.
    headline: null,
    text: Object.freeze([
      "Zgjedh njënën, shko edhe ",
      Object.freeze({ accent: "knaqu." }),
      " Kaq âsht Mnyra GO."
    ])
  })
]);

// Die Stuecke eines Satzes zu Markup - jedes einzeln escaped, betonte in
// einem <span>. Ein Stueck, das weder Text noch Betonung ist, faellt heraus
// statt "[object Object]" zu schreiben.
function storyText(parts = [], accentClass = "mnyra-go-page__story-accent") {
  return (Array.isArray(parts) ? parts : [parts])
    .map((part) => {
      if (typeof part === "string") return esc(part);
      const accent = typeof part?.accent === "string" ? part.accent : "";
      return accent ? `<span class="${accentClass}">${esc(accent)}</span>` : "";
    })
    .join("");
}

// Derselbe Satz ohne Markup - fuer alles, was Text und keine Auszeichnung
// braucht.
export function goStoryPlainText(parts = []) {
  return (Array.isArray(parts) ? parts : [parts])
    .map((part) => (typeof part === "string" ? part : String(part?.accent || "")))
    .join("");
}

const WHEN_ICONS = Object.freeze({
  now: "zap",
  in30: "timer",
  in60: "clock",
  later: "calendar-clock"
});

// Die Zeile unter der Zeit. Sie steht hier und nicht in shared/go: Der Server
// rechnet mit den Schluesseln, nicht mit den Saetzen daneben.
const WHEN_HINTS = Object.freeze({
  now: "Menjëherë",
  in30: "Për 30 minuta",
  in60: "Për 1 orë",
  later: "Zgjidh datën & orën"
});

// Die Geometrie des Rades - dieselben Zahlen wie im Stylesheet oben. Der
// Controller muss beim Aufbau auf die gewaehlte Zeile scrollen und beim
// Scrollen zurueckrechnen, welche Zeile in der Mitte steht; beides geht nur
// mit der Zeilenhoehe.
export const GO_WHEEL_ITEM_HEIGHT = 44;

// Die Symbole, die waehrend der Suche im Kopf der Karte wechseln. Sie stehen
// alle im Baum, und sichtbar ist immer genau eines (data-go-live-icon) - ein
// Austausch per innerHTML waere ein Neuaufbau im Sekundentakt.
export const GO_LIVE_ICONS = Object.freeze(["store", "utensils", "cup-soda", "map-pin", "sparkles"]);

// Die Monate und die Wochentage des Kalenders, albanisch. Die Woche faengt am
// Montag an - so haengt der Kalender an jeder Wand hier.
const MONTH_NAMES = Object.freeze([
  "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
  "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"
]);

const DAY_NAMES = Object.freeze(["Hë", "Ma", "Më", "En", "Pr", "Sh", "Di"]);

// Die Staedte, die GO kennt. Sie sind ein Vorschlag und keine Schranke: Wer
// seinen Ort nicht findet, schreibt ihn hin ("Përdor: ..."), und die Suche
// laeuft damit. Eine feste Liste waere eine Tuer, die man vor jedem zumacht,
// der nicht in einer der acht groessten Staedte wohnt.
export const GO_CITIES = Object.freeze([
  Object.freeze({ name: "Prishtinë", region: "Kosovë" }),
  Object.freeze({ name: "Prizren", region: "Kosovë" }),
  Object.freeze({ name: "Pejë", region: "Kosovë" }),
  Object.freeze({ name: "Ferizaj", region: "Kosovë" }),
  Object.freeze({ name: "Gjakovë", region: "Kosovë" }),
  Object.freeze({ name: "Mitrovicë", region: "Kosovë" }),
  Object.freeze({ name: "Gjilan", region: "Kosovë" }),
  Object.freeze({ name: "Tiranë", region: "Shqipëri" }),
  Object.freeze({ name: "Durrës", region: "Shqipëri" }),
  Object.freeze({ name: "Shkup", region: "Maqedoni e Veriut" })
]);

/**
 * Die vier Schritte der Suche, in ihrer Reihenfolge.
 */
export const GO_STEPS = Object.freeze(["party", "category", "when", "place"]);

const STEP_ICONS = Object.freeze({
  party: "users",
  category: "utensils",
  when: "clock",
  place: "map-pin"
});

function esc(value = "") {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Auf einen gueltigen Schritt bringen. Unbekanntes faengt vorne an. */
export function resolveGoStep(value = "") {
  const step = String(value || "").trim();
  return GO_STEPS.includes(step) ? step : GO_STEPS[0];
}

export function nextGoStep(value = "") {
  const index = GO_STEPS.indexOf(resolveGoStep(value));
  return GO_STEPS[Math.min(GO_STEPS.length - 1, index + 1)];
}

export function previousGoStep(value = "") {
  const index = GO_STEPS.indexOf(resolveGoStep(value));
  return GO_STEPS[Math.max(0, index - 1)];
}

/** Die Gruppengroesse auf einen gueltigen Wert bringen. */
export function clampGoPartySize(value) {
  const size = Math.trunc(Number(value));
  if (!Number.isFinite(size)) return GO_PARTY_SIZE_DEFAULT;
  return Math.min(GO_PARTY_SIZE_MAX, Math.max(GO_PARTY_SIZE_MIN, size));
}

/** "person" fuer eine, "veta" fuer mehrere. */
export function goPartyWord(value, texts = TEXTS) {
  return clampGoPartySize(value) === 1
    ? (texts.partyOne || TEXTS.partyOne)
    : (texts.partyMany || TEXTS.partyMany);
}

export function goPartyLabel(value, texts = TEXTS) {
  return `${clampGoPartySize(value)} ${goPartyWord(value, texts)}`;
}

function arrivalLabel(value, { nowMs = Date.now() } = {}) {
  const ms = Date.parse(String(value || ""));
  if (!Number.isFinite(ms)) return "";
  if (Math.abs(ms - nowMs) < 15 * 60 * 1000) return TEXTS.now;
  const date = new Date(ms);
  return `Rreth ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

/** Ein Tag als "JJJJ-MM-TT" - die Schreibweise, in der auch der Kalender denkt. */
export function goDateKey(date) {
  const day = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(day.getTime())) return "";
  return `${day.getFullYear()}-${pad2(day.getMonth() + 1)}-${pad2(day.getDate())}`;
}

function startOfDay(ms) {
  const day = new Date(ms);
  day.setHours(0, 0, 0, 0);
  return day;
}

/**
 * Wie ein Tag heisst, wenn man ihn dem Gast zeigt.
 *
 * "Sot" und "Nesër" stehen vor jedem Datum: Wer heute Abend ausgeht, liest
 * kein "16 Gus", er liest "heute".
 */
export function goDateLabel(key = "", texts = TEXTS, { nowMs = Date.now() } = {}) {
  const parts = String(key || "").split("-").map((piece) => Number(piece));
  if (parts.length !== 3 || parts.some((piece) => !Number.isFinite(piece))) return "";
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  const days = Math.round((target.getTime() - startOfDay(nowMs).getTime()) / 86400000);
  if (days === 0) return texts.today || TEXTS.today;
  if (days === 1) return texts.tomorrow || TEXTS.tomorrow;
  return `${target.getDate()} ${MONTH_NAMES[target.getMonth()].slice(0, 3)}`;
}

/** Datum und Uhrzeit in der Form, die das Feld und Date.parse beide lesen. */
export function goLaterValue(form = {}) {
  const date = String(form.laterDate || "").trim();
  if (!date) return "";
  return `${date}T${goTimeLabel(form)}`;
}

/** Die eingestellte Uhrzeit als "HH:MM". */
export function goTimeLabel(form = {}) {
  return `${pad2(form.laterHour || "19")}:${pad2(form.laterMinute || "00")}`;
}

/**
 * Die Aufschrift des Knopfes unter dem Uhrzeit-Rad.
 *
 * Sie steht hier und nicht zweimal, weil sie an zwei Stellen gebraucht wird:
 * beim Aufbau der Karte - und noch einmal, waehrend das Rad laeuft. Ein Knopf,
 * der "Ruaj orën (Sot, 00:00)" sagt, waehrend darueber 20:30 steht, ist keine
 * Kleinigkeit: Er sagt dem Gast, was er speichern wird, und muss deshalb
 * dasselbe sagen wie das Rad. Zwei Stellen, die denselben Satz bauen, laufen
 * frueher oder spaeter auseinander.
 */
export function goWhenSaveLabel(form = {}, texts = TEXTS, { nowMs = Date.now() } = {}) {
  const day = goDateLabel(form.laterDate, texts, { nowMs });
  return `${texts.whenSaveTime} (${day}, ${goTimeLabel(form)})`;
}

// Eine Zeile des Rades. Sie ist ein Knopf und nicht nur ein Eintrag: Wer die
// Zahl sieht, die er will, tippt sie an, statt sie in die Mitte zu schieben.
function wheelItem({ value = "", label = "", sub = "", selected = false } = {}) {
  return `
    <button
      type="button"
      role="option"
      class="mnyra-go-page__wheel-item"
      data-go-wheel-pick="${esc(value)}"
      aria-selected="${selected ? "true" : "false"}"
    >${esc(label)}${sub ? `<span>${esc(sub)}</span>` : ""}</button>
  `;
}

function wheelList(name = "", value = "", items = [], { label = "", variant = "party" } = {}) {
  return `
    <div
      class="mnyra-go-page__wheel-list mnyra-go-page__wheel-list--${esc(variant)}"
      data-go-wheel="${esc(name)}"
      data-go-wheel-value="${esc(value)}"
      role="listbox"
      aria-label="${esc(label)}"
    >
      <div class="mnyra-go-page__wheel-pad"></div>
      ${items.map((entry) => wheelItem({ ...entry, selected: String(entry.value) === String(value) })).join("")}
      <div class="mnyra-go-page__wheel-pad"></div>
    </div>
  `;
}

function wheelFrame(inner = "") {
  return `
    <div class="mnyra-go-page__wheel">
      <div class="mnyra-go-page__wheel-band" aria-hidden="true"></div>
      <div class="mnyra-go-page__wheel-fade mnyra-go-page__wheel-fade--top" aria-hidden="true"></div>
      <div class="mnyra-go-page__wheel-fade mnyra-go-page__wheel-fade--bottom" aria-hidden="true"></div>
      ${inner}
    </div>
  `;
}

function renderPartyStep(form = {}, texts = TEXTS) {
  const partySize = clampGoPartySize(form.partySize);
  const items = [];
  for (let size = GO_PARTY_SIZE_MIN; size <= GO_PARTY_SIZE_MAX; size += 1) {
    items.push({ value: String(size), label: String(size), sub: goPartyWord(size, texts) });
  }
  return wheelFrame(wheelList("party", String(partySize), items, {
    label: texts.partyQuestion,
    variant: "party"
  }));
}

function renderTimeStep(form = {}, texts = TEXTS) {
  const hours = Array.from({ length: 24 }, (_, index) => ({ value: pad2(index), label: pad2(index) }));
  // Halbe Stunden und keine Minuten: Ein Lokal fuehrt seine Kapazitaet in
  // halben Stunden (GO_CAPACITY_SLOT_MINUTES), und 19:07 waere eine Genauigkeit,
  // die hinter der Tuer niemand einloest.
  const minutes = [{ value: "00", label: "00" }, { value: "30", label: "30" }];
  return wheelFrame(`
    ${wheelList("hour", pad2(form.laterHour || "19"), hours, { label: texts.whenPickTime, variant: "time" })}
    <span class="mnyra-go-page__wheel-colon" aria-hidden="true">:</span>
    ${wheelList("minute", pad2(form.laterMinute || "00"), minutes, { label: texts.whenPickTime, variant: "time" })}
  `);
}

function renderCalendarMonth(year, month, { selected = "", minKey = "", maxKey = "" } = {}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Der Sonntag ist in JavaScript die 0 und in der Woche der letzte Tag.
  const firstIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [];
  for (let index = 0; index < firstIndex; index += 1) cells.push("<span></span>");
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${pad2(month + 1)}-${pad2(day)}`;
    const disabled = key < minKey || key > maxKey;
    cells.push(`
      <button
        type="button"
        class="mnyra-go-page__cal-day"
        data-go-date="${esc(key)}"
        aria-pressed="${key === selected ? "true" : "false"}"
        ${disabled ? "disabled" : ""}
      >${day}</button>
    `);
  }
  return `
    <div class="mnyra-go-page__cal">
      <p class="mnyra-go-page__cal-month">${esc(MONTH_NAMES[month])} ${year}</p>
      <div class="mnyra-go-page__cal-week" aria-hidden="true">${DAY_NAMES.map((day) => `<span>${esc(day)}</span>`).join("")}</div>
      <div class="mnyra-go-page__cal-grid">${cells.join("")}</div>
    </div>
  `;
}

/**
 * Der Kalender. Er zeigt den laufenden Monat - und den naechsten dazu, sobald
 * das Fenster von GO_MAX_LEAD_DAYS ueber dessen Rand hinausreicht. Sonst
 * stuende am 30. eines Monats ein Kalender da, in dem kein einziger Tag mehr
 * anzutippen ist.
 */
function renderDateStep(form = {}, { nowMs = Date.now() } = {}) {
  const first = startOfDay(nowMs);
  const last = startOfDay(nowMs + GO_MAX_LEAD_DAYS * 86400000);
  const minKey = goDateKey(first);
  const maxKey = goDateKey(last);
  const selected = String(form.laterDate || "").trim();
  const months = [renderCalendarMonth(first.getFullYear(), first.getMonth(), { selected, minKey, maxKey })];
  if (last.getMonth() !== first.getMonth()) {
    months.push(renderCalendarMonth(last.getFullYear(), last.getMonth(), { selected, minKey, maxKey }));
  }
  return months.join("");
}

/**
 * "Për çka jeni?" - drei Antworten, untereinander, jede mit einer Zeile
 * darunter.
 *
 * Untereinander und nicht als Raster: Jede Antwort bekommt damit die volle
 * Breite, und ein Daumen trifft sie immer. Die Zeile darunter ist kein
 * Beiwerk - "Pije" allein saehe aus, als waere Ëmbëlsira nicht dabei.
 */
function renderCategoryStep(form = {}, texts = TEXTS) {
  const intent = String(form.intent || "unsure");
  return `
    <div class="mnyra-go-page__intents" role="group" aria-label="${esc(texts.categoryQuestion)}">
      ${GO_INTENTS.map((entry) => `
        <button
          type="button"
          class="mnyra-go-page__intent"
          data-go-intent="${esc(entry.key)}"
          aria-pressed="${intent === entry.key ? "true" : "false"}"
        >
          <span class="mnyra-go-page__intent-ic">${goIcon(entry.icon)}</span>
          <span class="mnyra-go-page__intent-body">
            <span class="mnyra-go-page__intent-label">${esc(entry.label)}</span>
            <span class="mnyra-go-page__intent-hint">${esc(entry.hint)}</span>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderWhenStep(form = {}, texts = TEXTS) {
  const when = String(form.when || "now");
  return `
    <div class="mnyra-go-page__chips" role="group" aria-label="${esc(texts.whenQuestion)}">
      ${GO_WHEN_OPTIONS.map((entry) => `
        <button
          type="button"
          class="mnyra-go-page__chip"
          data-go-when="${esc(entry.key)}"
          aria-pressed="${when === entry.key ? "true" : "false"}"
        >
          ${goIcon(WHEN_ICONS[entry.key] || "clock")}
          <span>
            <b>${esc(entry.label)}</b>
            <i>${esc(WHEN_HINTS[entry.key] || "")}</i>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderPlaceStep(form = {}, texts = TEXTS) {
  const city = String(form.city || "").trim();
  return `
    <div class="mnyra-go-page__place">
      <span class="mnyra-go-page__place-ic">${goIcon("map-pin")}</span>
      <span class="mnyra-go-page__place-body">
        <span class="mnyra-go-page__place-label">${esc(texts.placeLabel)}</span>
        <p class="mnyra-go-page__place-city">${esc(city || texts.placeEmpty)}</p>
      </span>
      <button type="button" class="mnyra-go-page__place-change" data-go-change-city>
        ${goIcon("pencil")}${esc(texts.locationChange)}
      </button>
    </div>
  `;
}

/**
 * Die Staedteliste mit ihrem Suchfeld.
 *
 * Die Liste ist ein Vorschlag, kein Zaun: Was nicht darin steht, schreibt der
 * Gast hin, und die letzte Zeile nimmt es an ("Përdor: ..."). Sie steht immer
 * im Baum und wird nur ein- und ausgeblendet - sonst muesste bei jedem
 * Buchstaben neu gezeichnet werden, und das Feld verloere die Tastatur.
 */
function renderCitySelect(form = {}, texts = TEXTS) {
  const city = String(form.city || "").trim();
  const query = String(form.citySearch || "").trim();
  const lower = query.toLowerCase();
  const known = GO_CITIES.some((entry) => entry.name.toLowerCase() === lower);
  return `
    <div class="mnyra-go-page__city-search">
      ${goIcon("search")}
      <input
        type="text"
        class="mnyra-go-page__field"
        data-go-city-input
        value="${esc(query)}"
        placeholder="${esc(texts.citySearch)}"
        aria-label="${esc(texts.cityQuestion)}"
        autocomplete="address-level2"
        enterkeyhint="done"
      />
    </div>
    <div class="mnyra-go-page__city-list" role="listbox" aria-label="${esc(texts.cityQuestion)}">
      ${GO_CITIES.map((entry) => `
        <button
          type="button"
          class="mnyra-go-page__city-option"
          data-go-city="${esc(entry.name)}"
          data-go-city-name="${esc(entry.name.toLowerCase())}"
          aria-pressed="${city === entry.name ? "true" : "false"}"
          ${lower && !entry.name.toLowerCase().includes(lower) ? "hidden" : ""}
        >${esc(entry.name)}<span>${esc(entry.region)}</span></button>
      `).join("")}
      <button
        type="button"
        class="mnyra-go-page__city-option mnyra-go-page__city-option--free"
        data-go-city-free
        ${query && !known ? "" : "hidden"}
      ><span data-go-city-free-label>${esc(texts.cityUse)}: ${esc(query)}</span>${goIcon("check-check")}</button>
    </div>
  `;
}

/**
 * Die Karte mit der Frage - eine Frage, ein Bildschirm.
 *
 * Kopf, Koerper und Fuss stehen fest; nur ihr Inhalt haengt am Schritt. Der
 * Fuss traegt entweder einen Knopf oder einen Satz: Ein Rad und ein Kalender
 * sind nie "fertig" (der Finger koennte noch einmal ziehen), eine angetippte
 * Kachel dagegen IST die Antwort und braucht keine Bestaetigung.
 */
function renderAskCard(form = {}, texts = TEXTS, { nowMs = Date.now() } = {}) {
  const step = resolveGoStep(form.step);
  const index = GO_STEPS.indexOf(step);
  const whenSub = step === "when" && String(form.when || "now") === "later"
    ? (String(form.whenSub || "date") === "time" ? "time" : "date")
    : "quick";
  const citySub = step === "place" && form.citySelect ? "select" : "main";

  const partySize = clampGoPartySize(form.partySize);
  const city = String(form.city || "").trim();

  let icon = STEP_ICONS[step] || "users";
  let question = "";
  let body = "";
  let foot = "";

  if (step === "party") {
    question = texts.partyQuestion;
    body = renderPartyStep(form, texts);
    foot = `<button type="button" class="mnyra-go-page__cta" data-go-step-next>${esc(texts.next)}${goIcon("chevron-right")}</button>`;
  } else if (step === "category") {
    question = texts.categoryQuestion;
    body = renderCategoryStep(form, texts);
    foot = `<p class="mnyra-go-page__ask-hint">${esc(texts.pickHint)}</p>`;
  } else if (step === "when" && whenSub === "date") {
    icon = "calendar-clock";
    question = texts.whenPickDate;
    body = renderDateStep(form, { nowMs });
    foot = `<p class="mnyra-go-page__ask-hint">${esc(texts.whenHintDate)}</p>`;
  } else if (step === "when" && whenSub === "time") {
    icon = "clock";
    question = texts.whenPickTime;
    body = renderTimeStep(form, texts);
    foot = `
      <button type="button" class="mnyra-go-page__cta" data-go-when-save>
        ${goIcon("check-check")}<span data-go-when-save-label>${esc(goWhenSaveLabel(form, texts, { nowMs }))}</span>
      </button>
    `;
  } else if (step === "when") {
    question = texts.whenQuestion;
    body = renderWhenStep(form, texts);
    foot = `<p class="mnyra-go-page__ask-hint">${esc(texts.whenHintPick)}</p>`;
  } else if (citySub === "select") {
    icon = "map-pin";
    question = texts.cityQuestion;
    body = renderCitySelect(form, texts);
    foot = `
      <button type="button" class="mnyra-go-page__cta" data-go-city-save>
        ${goIcon("check-check")}<span data-go-city-save-label>${esc(`${texts.citySaveCity} (${city || texts.placeEmpty})`)}</span>
      </button>
    `;
  } else {
    question = texts.placeQuestion;
    body = renderPlaceStep(form, texts);
    foot = `<button type="button" class="mnyra-go-page__cta" data-go-submit>${goIcon("search")}${esc(texts.submit)}</button>`;
  }

  // Zurueck fuehrt der Pfeil, und zwar immer genau einen Schritt: aus der
  // Uhrzeit in den Kalender, aus dem Kalender in die Zeiten, aus den Zeiten in
  // die Frage davor. Auf dem ersten Schritt gibt es nichts dahinter - dort
  // steht stattdessen die Antwort, die gerade eingestellt wird.
  const aside = index > 0 || whenSub !== "quick" || citySub === "select"
    ? `<button type="button" class="mnyra-go-page__ask-back" data-go-step-back aria-label="${esc(texts.stepBack)}" title="${esc(texts.stepBack)}">${goIcon("arrow-left")}</button>`
    : `<p class="mnyra-go-page__ask-value" data-go-party-value><b>${esc(String(partySize))}</b> ${esc(goPartyWord(partySize, texts))}</p>`;

  return `
    <section
      class="mnyra-go-page__ask"
      data-go-step="${esc(step)}"
      data-go-when-sub="${esc(whenSub)}"
      data-go-city-sub="${esc(citySub)}"
    >
      <header class="mnyra-go-page__ask-head">
        <h2 class="mnyra-go-page__q">${goIcon(icon)}${esc(question)}</h2>
        ${aside}
      </header>
      <div class="mnyra-go-page__ask-body">${body}</div>
      <div class="mnyra-go-page__ask-foot">${foot}</div>
      <span class="mnyra-go-page__ask-mark" aria-hidden="true">mnyra<b>GO</b></span>
    </section>
  `;
}

/**
 * Die Karte, waehrend die Anfrage laeuft.
 *
 * Zwei Bilder in einer Karte: erst geht die Anfrage hinaus, dann treffen die
 * Lokale ein. Beide stehen im Baum, sichtbar ist eines - so kann der
 * Controller im Sekundentakt umschalten, ohne die Seite neu zu bauen.
 *
 * Die Zahl ist keine Zierde: Sie zaehlt genau so weit, wie es Angebote gibt,
 * und der Name darunter ist der des Lokals, dessen Angebot der Gast gleich
 * sieht. Ein Zaehler, der bis zehn laeuft und dann drei Angebote zeigt, waere
 * eine Luege mit Animation.
 */
function renderLiveCard(state = {}, texts = TEXTS) {
  const live = state.live || {};
  const count = Math.max(0, Math.trunc(Number(live.count) || 0));
  const seconds = Math.max(0, Math.trunc(Number(live.seconds) || 0));
  const phase = count > 0 ? "arrive" : "send";
  const form = state.form || {};
  const city = String(form.city || "").trim();
  const intent = GO_INTENTS.find((entry) => entry.key === String(form.intent || "unsure"));
  const summary = [
    goPartyLabel(form.partySize, texts),
    intent ? intent.label : "",
    city
  ].filter(Boolean).join(" · ");

  return `
    <section
      class="mnyra-go-page__ask"
      data-go-live-card
      data-go-live="${phase}"
      data-go-live-done="${live.done ? "1" : "0"}"
    >
      <header class="mnyra-go-page__ask-head">
        <span class="mnyra-go-page__q">
          <span class="mnyra-go-page__live-badge" data-go-live-icon="0">${GO_LIVE_ICONS.map((name) => goIcon(name)).join("")}</span>
          <span class="mnyra-go-page__brand">mnyra<b>GO</b></span>
        </span>
        <button type="button" class="mnyra-go-page__ask-back" data-go-live-cancel aria-label="${esc(texts.back)}" title="${esc(texts.back)}">
          ${goIcon("rotate-ccw")}
        </button>
      </header>

      <div class="mnyra-go-page__ask-body mnyra-go-page__live">
        <div class="mnyra-go-page__live-send">
          <h3 class="mnyra-go-page__live-title">${esc(texts.liveSending)}</h3>
          <p class="mnyra-go-page__live-pill" data-go-live-seconds>${esc(`${texts.liveWait}: ${seconds} ${texts.liveSeconds}`)}</p>
          <p class="mnyra-go-page__live-sub">${esc(`${texts.liveContacting} ${city}`.trim())}</p>
        </div>
        <div class="mnyra-go-page__live-arrive">
          <p class="mnyra-go-page__live-count" data-go-live-count>${count}</p>
          <p class="mnyra-go-page__live-word" data-go-live-word>${esc(count === 1 ? texts.liveOne : texts.liveMany)}</p>
          <p class="mnyra-go-page__live-name" data-go-live-name>${esc(live.name || "")}</p>
        </div>
      </div>

      <div class="mnyra-go-page__ask-foot">
        <p class="mnyra-go-page__ask-hint" data-go-live-hint>${esc(summary)}</p>
        <button type="button" class="mnyra-go-page__cta" data-go-live-open>
          ${esc(texts.liveOpen)}${goIcon("chevron-right")}
        </button>
      </div>
    </section>
  `;
}

/**
 * Die Karte ueber den Ergebnissen. Sie sagt, was die Suche ergeben hat, und
 * laesst den einen Weg offen, der von hier aus sinnvoll ist: dieselbe Frage
 * eine Kleinigkeit anders zu stellen.
 */
function renderReadyCard(state = {}, texts = TEXTS) {
  const results = Array.isArray(state.results) ? state.results : [];
  const form = state.form || {};
  const intent = GO_INTENTS.find((entry) => entry.key === String(form.intent || "unsure"));
  const summary = [
    goPartyLabel(form.partySize, texts),
    intent ? intent.label : "",
    String(form.city || "").trim()
  ].filter(Boolean).join(" · ");

  return `
    <section class="mnyra-go-page__ask" data-go-ready-card>
      <header class="mnyra-go-page__ask-head">
        <span class="mnyra-go-page__q">
          <span class="mnyra-go-page__live-badge mnyra-go-page__live-badge--done">${goIcon("check-check")}</span>
          <span class="mnyra-go-page__brand">mnyra<b>GO</b></span>
        </span>
      </header>

      <div class="mnyra-go-page__ask-body mnyra-go-page__live">
        <h3 class="mnyra-go-page__live-title">
          ${esc(results.length ? `${texts.readyTitle} ${results.length} ${results.length === 1 ? texts.readyOne : texts.readyMany}` : texts.emptyTitle)}
        </h3>
        <p class="mnyra-go-page__live-sub">${esc(results.length ? summary : texts.emptySubtitle)}</p>
      </div>

      <div class="mnyra-go-page__ask-foot">
        <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-back>
          ${goIcon("arrow-left")}${esc(texts.back)}
        </button>
      </div>
    </section>
  `;
}

function renderResultCard(result = {}, { texts = TEXTS, busyOfferId = "", nowMs = Date.now() } = {}) {
  const isBusy = busyOfferId && busyOfferId === result.offerId;
  const distance = Number.isFinite(Number(result.distanceKm)) && result.distanceKm !== null
    ? `${Number(result.distanceKm).toFixed(1)} km`
    : "";
  const arrival = result.isNow ? texts.now : arrivalLabel(result.expectedArrivalAt, { nowMs });

  return `
    <article class="mnyra-go-page__card" data-go-result="${esc(result.offerId)}">
      <div class="mnyra-go-page__card-head">
        ${result.logoUrl
          ? `<img class="mnyra-go-page__card-logo" src="${esc(result.logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`
          : `<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${goIcon("store")}</div>`}
        <div class="mnyra-go-page__card-names">
          <p class="mnyra-go-page__card-who">${esc(result.businessName)} <span>${esc(texts.offering)}</span></p>
          ${result.sponsored ? `<p class="mnyra-go-page__card-sponsored">${esc(texts.sponsored)}</p>` : ""}
        </div>
      </div>

      <p class="mnyra-go-page__card-benefit">${esc(result.benefitLabel)}</p>
      <p class="mnyra-go-page__card-for">${esc(texts.forGroup)}</p>

      <div class="mnyra-go-page__card-meta">
        <span>${goIcon("users")}${esc(`${result.partySize} ${texts.peopleSuffix}`)}</span>
        ${arrival ? `<span>${goIcon("clock")}${esc(arrival)}</span>` : ""}
        ${distance ? `<span>${goIcon("map-pin")}${esc(distance)}</span>` : ""}
        ${result.bookingType === "reservation" ? `<span>${goIcon("armchair")}${esc(texts.tableIncluded)}</span>` : ""}
      </div>

      <p class="mnyra-go-page__card-only">${goIcon("ticket-percent")}${esc(texts.onlyGo)}</p>

      <button
        type="button"
        class="mnyra-go-page__cta"
        data-go-accept="${esc(result.offerId)}"
        data-go-restaurant="${esc(result.restaurantId)}"
        ${isBusy ? "disabled" : ""}
      >${isBusy ? "" : goIcon("check-check")}${esc(isBusy ? texts.confirming : texts.accept)}</button>
    </article>
  `;
}

/**
 * Das Bento nach der Suche.
 *
 * Gibt es Angebote, stehen sie hier - und sonst nichts. Gibt es keine, steht
 * hier wieder die Bildergeschichte: Der Satz "Nuk gjetëm ofertë" steht schon
 * oben auf der Karte, und ihn hier ein zweites Mal hinzuschreiben, macht ihn
 * nicht wahrer. Ohne die Geschichte bliebe eine weisse Flaeche uebrig, auf der
 * gar nichts steht - und die Lage nach einer erfolglosen Suche ist genau die
 * von vorher: Es gibt noch nichts zu sehen.
 */
function renderResultsBody(state = {}, texts = TEXTS) {
  const results = Array.isArray(state.results) ? state.results : [];
  const nowMs = Number(state.nowMs) || Date.now();
  if (!results.length) return renderExplainer(state);
  return `
    <h2 class="mnyra-go-page__lead">${results.length} ${esc(texts.resultsHeadline)}</h2>
    ${state.notice ? `<p class="mnyra-go-page__note">${esc(state.notice)}</p>` : ""}
    ${results.map((result) => renderResultCard(result, {
      texts,
      busyOfferId: state.busyOfferId,
      nowMs
    })).join("")}
    <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-back>
      ${goIcon("arrow-left")}${esc(texts.back)}
    </button>
  `;
}

function renderBookingBody(state = {}, texts = TEXTS) {
  const booking = state.booking || {};
  const isReservation = booking.type === "reservation";
  const nowMs = Number(state.nowMs) || Date.now();
  const arrival = arrivalLabel(booking.expectedArrivalAt, { nowMs });
  const statusLine = String(state.statusLabel || "").trim()
    || (isReservation ? texts.reservationConfirmed : texts.claimConfirmed);

  if (state.confirmCancel) {
    return `
      <h2 class="mnyra-go-page__lead">${esc(texts.cancelConfirm)}</h2>
      <div class="mnyra-go-page__row">
        <button type="button" class="mnyra-go-page__cta" data-go-cancel-confirm>
          ${goIcon("ban")}${esc(texts.cancelYes)}
        </button>
        <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-cancel-dismiss>${esc(texts.cancelNo)}</button>
      </div>
    `;
  }

  return `
    <p class="mnyra-go-page__done">${esc(texts.doneTitle)} ${goIcon("party-popper")}</p>
    <p class="mnyra-go-page__done-name">${esc(booking.businessName || "")}</p>
    <p class="mnyra-go-page__card-for">${esc(booking.benefitLabel || "")}</p>

    <div class="mnyra-go-page__card-meta">
      <span>${goIcon("users")}${esc(`${booking.partySize || 1} ${texts.peopleSuffix}`)}</span>
      ${arrival ? `<span>${goIcon("clock")}${esc(arrival)}</span>` : ""}
      ${booking.city ? `<span>${goIcon("map-pin")}${esc(booking.city)}</span>` : ""}
    </div>

    <p class="mnyra-go-page__ok">${goIcon("circle-check-big")}${esc(statusLine)}</p>

    ${booking.shortCode ? `
      <div class="mnyra-go-page__code">
        <p class="mnyra-go-page__code-label">${goIcon("hash")}${esc(texts.code)}</p>
        <p class="mnyra-go-page__code-value">${esc(booking.shortCode)}</p>
      </div>
    ` : ""}

    ${state.bookingLink ? `
      <!--
        Der Link zur eigenen Oferta.
        Was der Browser sich merkt, ist im privaten Fenster nach dem
        Schliessen weg - dieser Link ist dann der einzige Weg zurueck. Er ist
        zugleich die Weitergabe: Solange das Lokal nicht bestaetigt hat, darf
        die Oferta wandern.
      -->
      <div class="mnyra-go-page__link" data-go-link-box>
        <p class="mnyra-go-page__code-label">${goIcon("link")}${esc(texts.linkLabel)}</p>
        <p class="mnyra-go-page__link-value" data-go-link-value>${esc(state.bookingLink)}</p>
        <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-link-copy
          data-go-link="${esc(state.bookingLink)}">
          ${goIcon(state.linkCopied ? "check" : "copy")}${esc(state.linkCopied ? texts.linkCopied : texts.linkCopy)}
        </button>
        <p class="mnyra-go-page__link-hint">${esc(texts.linkHint)}</p>
      </div>
    ` : ""}

    <div class="mnyra-go-page__row">
      <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-menu>
        ${goIcon("book-open")}${esc(texts.menu)}
      </button>
      <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-directions>
        ${goIcon("navigation")}${esc(texts.directions)}
      </button>
    </div>

    ${state.canSignIn ? `
      <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-signin>
        ${goIcon("log-in")}${esc(texts.saveToAccount)} · ${esc(texts.signIn)}
      </button>
    ` : ""}

    <button type="button" class="mnyra-go-page__ghost" data-go-cancel>${esc(texts.cancel)}</button>
  `;
}

/**
 * Das Bento, wenn etwas schiefging.
 *
 * Der Satz und der Knopf stehen oben auf der Karte - hier stehen nur die
 * Alternativen, wenn es welche gibt. Ein Lokal, das gerade voll geworden ist,
 * schickt welche mit (Punkt 28, 119); ein Server, der gar nicht antwortet,
 * nicht. Dann steht hier wieder die Geschichte, und die Seite bleibt eine
 * Seite statt eines weissen Streifens mit einer Fehlermeldung darin.
 */
function renderErrorBody(state = {}, texts = TEXTS) {
  const alternatives = Array.isArray(state.alternatives) ? state.alternatives : [];
  if (!alternatives.length) return renderExplainer(state);
  return `
    <h2 class="mnyra-go-page__lead">${alternatives.length} ${esc(texts.alternatives)}</h2>
    ${alternatives.map((result) => renderResultCard(result, { texts, nowMs: state.nowMs })).join("")}
    <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-back>
      ${goIcon("arrow-left")}${esc(texts.back)}
    </button>
  `;
}

/**
 * Die Karte, wenn etwas schiefging.
 *
 * Sie steht an derselben Stelle wie die Frage und die Angebote, und das ist
 * der Punkt: Ein Fehler ist ein Ergebnis der Suche und kein anderer Ort. Vorher
 * fiel im Fehlerfall der ganze Aufbau weg - kein Streifen, keine Karte -, und
 * uebrig blieb ein weisser Streifen mit einem Satz darin, der aussah, als sei
 * die Seite abgestuerzt.
 */
function renderTroubleCard(state = {}, texts = TEXTS) {
  const message = String(state.error || "").trim() || texts.errorTitle;
  const alternatives = Array.isArray(state.alternatives) ? state.alternatives : [];
  return `
    <section class="mnyra-go-page__ask" data-go-trouble-card>
      <header class="mnyra-go-page__ask-head">
        <span class="mnyra-go-page__q">
          <span class="mnyra-go-page__live-badge mnyra-go-page__live-badge--warn">${goIcon("triangle-alert")}</span>
          <span class="mnyra-go-page__brand">mnyra<b>GO</b></span>
        </span>
      </header>

      <div class="mnyra-go-page__ask-body mnyra-go-page__live">
        <h3 class="mnyra-go-page__live-title">${esc(message)}</h3>
      </div>

      <div class="mnyra-go-page__ask-foot">
        ${alternatives.length
          ? `<button type="button" class="mnyra-go-page__cta" data-go-back>${goIcon("arrow-left")}${esc(texts.back)}</button>`
          : `<button type="button" class="mnyra-go-page__cta" data-go-retry>${goIcon("rotate-ccw")}${esc(texts.errorRetry)}</button>`}
      </div>
    </section>
  `;
}

/**
 * Die Bildergeschichte.
 *
 * Welche Bilder schon aufgedeckt sind, steht im Zustand (state.storyShown)
 * und nicht im Modul. Der Grund ist zu sehen, sobald man ihn weglaesst: Jede
 * Antwort auf eine Frage zeichnet die Seite neu, und ein Aufdecken, das nur
 * im DOM stand, finge dann jedes Mal von vorne an - die halbe Seite blitzt
 * bei jedem Tipp auf.
 *
 * @param {number[]} params.storyShown  Indizes der schon aufgedeckten Bilder.
 */
function renderStory(storyShown = []) {
  const shown = Array.isArray(storyShown) ? storyShown : [];
  // Ein durchlaufender Zaehler ueber ALLE Teile, nicht je Kapitel einer: Bild
  // und Satz decken sich einzeln auf, und die Reihenfolge, in der man an
  // ihnen vorbeikommt, ist genau diese Zaehlung.
  let step = 0;
  const mark = () => {
    const index = step++;
    return `data-go-reveal="${index}"${shown.includes(index) ? ' data-go-reveal-in="1"' : ""}`;
  };
  return `
    <div class="mnyra-go-page__story" data-go-story>
      ${GO_STORY_SLIDES.map((slide, index) => {
        // Das erste Bild steht ganz oben im Bento und ist beim Oeffnen fast
        // immer im Blick - es wartet nicht auf den Scroll.
        const eager = index === 0;
        return `
        <article class="mnyra-go-page__story-slide" data-go-story-slide="${index}">
          <figure
            class="mnyra-go-page__story-media"
            data-go-story-side="${esc(slide.side || "right")}"
            data-go-story-focus="${esc(slide.focus || "center")}"
            ${mark()}
          >
            <img
              src="${esc(GO_STORY_BASE + slide.file)}"
              alt="${esc(slide.alt || "")}"
              width="1600"
              height="900"
              loading="${eager ? "eager" : "lazy"}"
              fetchpriority="${eager ? "high" : "low"}"
              decoding="async"
              onerror="this.remove()"
            />
            ${slide.headline
              ? `<figcaption class="mnyra-go-page__story-headline">${storyText(slide.headline, "mnyra-go-page__story-headline-accent")}</figcaption>`
              : ""}
          </figure>
          <p class="mnyra-go-page__story-text" ${mark()}>${storyText(slide.text)}</p>
        </article>
      `;
      }).join("")}
    </div>
  `;
}

// Im Bento steht die Geschichte und sonst nichts.
//
// Hier standen einmal eine Ueberschrift, ein Untertitel und vier Zeilen
// "Mirë të dihet". Alle drei sagten in Worten, was die Bilder zeigen - und
// eine Erklaerung, die daneben noch einmal erklaert wird, wirkt wie eine,
// der man nicht traut. Die Bilder tragen ihre Frage selbst, der Satz darunter
// die Antwort. Mehr braucht die Seite hier nicht.
function renderExplainer(state = {}) {
  return renderStory(state.storyShown);
}

/**
 * Die ganze Seite.
 *
 * Oben die Karte mit der Frage, darunter mit Abstand das Bento. Im Suchbild
 * steht im Bento die Erklaerung; sobald es ein Ergebnis gibt, steht dort das
 * Ergebnis - die Erklaerung hat dann ihren Dienst getan.
 *
 * @returns {string} HTML.
 */
export function renderGoPageCore(state = {}) {
  const texts = { ...TEXTS, ...(state.texts || {}) };
  const view = String(state.view || "search");
  const nowMs = Number(state.nowMs) || Date.now();

  // Oben steht immer dieselbe Karte - sie zeigt nur etwas anderes: erst die
  // Frage, dann die eintreffenden Lokale, dann das Ergebnis, und wenn etwas
  // schiefging, eben das. Ein Fehler ist ein Ergebnis der Suche und kein
  // anderer Ort: Faellt der Streifen mit der Karte dort weg, steht auf einmal
  // eine andere Seite da.
  // Nur die Buchung hat oben nichts zu sagen - sie ist kein Ergebnis der
  // Suche mehr, sondern das, was danach kam.
  let card = "";
  if (view === "search") card = renderAskCard(state.form || {}, texts, { nowMs });
  else if (view === "matching") card = renderLiveCard(state, texts);
  else if (view === "results") card = renderReadyCard(state, texts);
  else if (view === "error") card = renderTroubleCard(state, texts);

  // Waehrend die Anfrage laeuft, steht im Bento weiter die Geschichte: Die
  // Angebote sind zu diesem Zeitpunkt zwar schon da, aber sie gehoeren dem
  // Gast erst, wenn er "Shiko ofertat" tippt. Sie vorher unter der laufenden
  // Animation stehen zu lassen, machte die Animation zur Verzierung.
  let bento = "";
  if (view === "loading") bento = `<div class="mnyra-go-page__empty">${esc(texts.searching)}</div>`;
  else if (view === "results") bento = renderResultsBody(state, texts);
  else if (view === "booking") bento = renderBookingBody(state, texts);
  else if (view === "error") bento = renderErrorBody(state, texts);
  else bento = renderExplainer(state);

  return `
    <div class="mnyra-go-page" data-go-page data-go-view="${esc(view)}">
      ${card ? `<div class="mnyra-go-page__top">${card}</div>` : ""}
      <div class="mnyra-go-page__bento" data-go-bento>${bento}</div>
    </div>
  `;
}

export const GO_PAGE_TEXTS = TEXTS;
export const GO_PAGE_STORY_SLIDES = GO_STORY_SLIDES;
export const GO_PAGE_STORY_BASE = GO_STORY_BASE;
