import{l as I,m as N,o as O,q as E,s as g,u as w,w as C,x as H,y as R}from"./domain-dashboard-COit2Md2.js";import"./domain-auth-B1kS5TG-.js";import"./domain-analytics-oyJYW1vv.js";import"./domain-business-accounts-D8NpUhi6.js";import"./domain-feed-social-eager-D4_FEqaI.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-DAUyCk2O.js";import"./domain-menu-eager-BHuuCUf1.js";const ke="mnyraGoPageStyles",xe=`
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
/* Die Ergebniskarte und ihr Knopf stehen in go-offer-card-render-utils.js:
   Dieselbe Karte zeigt der Editor des Lokals als Vorschau, und eine zweite
   Beschreibung derselben Karte laeuft irgendwann von dieser hier weg. */
${I}
/* Im Fuss der Karte traegt schon die Linie den Abstand - ein zweiter darueber
   waere Luft, die der Karte unten fehlt. */
.mnyra-go-page__ask-foot .mnyra-go-page__cta { margin-top: 0; }
.mnyra-go-page__cta--quiet { background: var(--go-plane); color: var(--go-ink-2); }
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
`,d=Object.freeze({brand:"Mnyra GO",partyQuestion:"Sa persona jeni?",partyOne:"person",partyMany:"persona",step:"Hapi",stepBack:"Kthehu një hap prapa",next:"Vazhdo",categoryQuestion:"Për çka jeni?",whenQuestion:"Kur?",whenLaterLabel:"Zgjidh ditën dhe orën",whenPickDate:"Zgjidh datën",whenPickTime:"Zgjidh orën",whenSaveTime:"Ruaj orën",whenHintPick:"Zgjidh orarin e dëshiruar",whenHintDate:"Kliko mbi një datë për të vazhduar tek orari",today:"Sot",tomorrow:"Nesër",placeQuestion:"Ku?",placeLabel:"Qyteti",placeEmpty:"Shto qytetin tënd",cityPlaceholder:"Shkruaj qytetin",cityQuestion:"Zgjidh qytetin",citySearch:"Kërko ose shkruaj qytetin...",cityUse:"Përdor",citySaveCity:"Ruaj qytetin",pickHint:"Zgjidh një opsion për të vazhduar",submit:"Merr ofertat",liveSending:"Kërkesa po dërgohet...",liveWait:"Koha e pritjes",liveSeconds:"sekonda",liveStillWaiting:"Po presim përgjigjet...",liveContacting:"Po kontaktojmë lokalet në",liveOne:"lokal dërgoi ofertë",liveMany:"lokale dërguan ofertë",liveOpen:"Shiko ofertat",readyTitle:"Gati!",readyOne:"ofertë u gjet",readyMany:"oferta u gjetën",searching:"Po kërkojmë...",resultsHeadline:"lokale kanë oferta për ju",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",confirming:"Po konfirmohet...",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",emptyTitle:"Nuk gjetëm ofertë GO që përputhet tani.",emptySubtitle:"Provo me një orë tjetër ose me një grup tjetër.",doneTitle:"U krye",reservationConfirmed:"Tavolina është konfirmuar",claimConfirmed:"Oferta është e juaja",menu:"Shiko menunë",directions:"Udhëzime",code:"Kodi",linkLabel:"Linku yt",linkCopy:"Kopjo linkun",linkCopied:"U kopjua",linkHint:"Ruaje kët link. Me tê e gjen ofertën në çdo telefon.",cancel:"Anulo",cancelConfirm:"Dëshiron ta anulosh?",cancelYes:"Po, anuloje",cancelNo:"Jo",saveToAccount:"Ruaje në llogarinë tënde",signIn:"Hyr",errorTitle:"Mnyra GO është përkohësisht i padisponueshëm.",errorRetry:"Provo prapë",alternatives:"alternativa për ju",peopleSuffix:"persona",now:"Tani",back:"Ndrysho kërkimin"}),B="/apps/menyra-social/assets/go/",K=Object.freeze([Object.freeze({file:"story-1-uritur.webp",alt:"Vajzë ulur në tavolinë, e uritur",side:"right",focus:"left",headline:Object.freeze(["A je ",Object.freeze({accent:"unt?"})]),text:Object.freeze(["Hape Mnyra GO edhe thuaj veç ",Object.freeze({accent:"sa veta jeni"})," edhe çka po ju hahet."])}),Object.freeze({file:"story-2-kerkim.webp",alt:"Vajzë që shikon telefonin, tuj kërku lokal",side:"left",focus:"right",headline:Object.freeze(["Ku me ",Object.freeze({accent:"shku?"})]),text:Object.freeze(["Po kërkon restorant a kafe, po s’po din ku? ",Object.freeze({accent:"Mos kërko"})," — lokalet t’gjejnë ty."])}),Object.freeze({file:"story-3-oferta.webp",alt:"Vajzë e gëzueme me telefon në dorë",side:"right",focus:"left",headline:Object.freeze(["Ofertat ",Object.freeze({accent:"t’vijn."})]),text:Object.freeze(["Lokalet përreth teje t’çojnë zbritje a diçka falas, ",Object.freeze({accent:"veç për grupin tënd"}),"."])}),Object.freeze({file:"story-4-tavolina.webp",alt:"Dy shoqe në tavolinë të lokalit",side:"right",focus:"center",headline:null,text:Object.freeze(["Zgjedh njënën, shko edhe ",Object.freeze({accent:"knaqu."})," Kaq âsht Mnyra GO."])})]);function $(a=[],e="mnyra-go-page__story-accent"){return(Array.isArray(a)?a:[a]).map(t=>{if(typeof t=="string")return n(t);const i=typeof t?.accent=="string"?t.accent:"";return i?`<span class="${e}">${n(i)}</span>`:""}).join("")}function Se(a=[]){return(Array.isArray(a)?a:[a]).map(e=>typeof e=="string"?e:String(e?.accent||"")).join("")}const W=Object.freeze({now:"zap",in30:"timer",in60:"clock",later:"calendar-clock"}),Z=Object.freeze({now:"Menjëherë",in30:"Për 30 minuta",in60:"Për 1 orë",later:"Zgjidh datën & orën"}),$e=44,q=Object.freeze(["store","utensils","cup-soda","map-pin","sparkles"]),F=Object.freeze(["Janar","Shkurt","Mars","Prill","Maj","Qershor","Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor"]),U=Object.freeze(["Hë","Ma","Më","En","Pr","Sh","Di"]),z=Object.freeze([Object.freeze({name:"Prishtinë",region:"Kosovë"}),Object.freeze({name:"Prizren",region:"Kosovë"}),Object.freeze({name:"Pejë",region:"Kosovë"}),Object.freeze({name:"Ferizaj",region:"Kosovë"}),Object.freeze({name:"Gjakovë",region:"Kosovë"}),Object.freeze({name:"Mitrovicë",region:"Kosovë"}),Object.freeze({name:"Gjilan",region:"Kosovë"}),Object.freeze({name:"Tiranë",region:"Shqipëri"}),Object.freeze({name:"Durrës",region:"Shqipëri"}),Object.freeze({name:"Shkup",region:"Maqedoni e Veriut"})]),y=Object.freeze(["party","category","when","place"]),Y=Object.freeze({party:"users",category:"utensils",when:"clock",place:"map-pin"});function n(a=""){return String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function k(a=""){const e=String(a||"").trim();return y.includes(e)?e:y[0]}function ze(a=""){const e=y.indexOf(k(a));return y[Math.min(y.length-1,e+1)]}function je(a=""){const e=y.indexOf(k(a));return y[Math.max(0,e-1)]}function b(a){const e=Math.trunc(Number(a));return Number.isFinite(e)?Math.min(O,Math.max(E,e)):N}function x(a,e=d){return b(a)===1?e.partyOne||d.partyOne:e.partyMany||d.partyMany}function A(a,e=d){return`${b(a)} ${x(a,e)}`}function G(a,{nowMs:e=Date.now()}={}){const t=Date.parse(String(a||""));if(!Number.isFinite(t))return"";if(Math.abs(t-e)<900*1e3)return d.now;const i=new Date(t);return`Rreth ${String(i.getHours()).padStart(2,"0")}:${String(i.getMinutes()).padStart(2,"0")}`}function u(a){return String(a).padStart(2,"0")}function j(a){const e=a instanceof Date?a:new Date(a);return Number.isFinite(e.getTime())?`${e.getFullYear()}-${u(e.getMonth()+1)}-${u(e.getDate())}`:""}function _(a){const e=new Date(a);return e.setHours(0,0,0,0),e}function Q(a="",e=d,{nowMs:t=Date.now()}={}){const i=String(a||"").split("-").map(s=>Number(s));if(i.length!==3||i.some(s=>!Number.isFinite(s)))return"";const r=new Date(i[0],i[1]-1,i[2]),o=Math.round((r.getTime()-_(t).getTime())/864e5);return o===0?e.today||d.today:o===1?e.tomorrow||d.tomorrow:`${r.getDate()} ${F[r.getMonth()].slice(0,3)}`}function De(a={}){const e=String(a.laterDate||"").trim();return e?`${e}T${T(a)}`:""}function T(a={}){return`${u(a.laterHour||"19")}:${u(a.laterMinute||"00")}`}function V(a={},e=d,{nowMs:t=Date.now()}={}){const i=Q(a.laterDate,e,{nowMs:t});return`${e.whenSaveTime} (${i}, ${T(a)})`}function X({value:a="",label:e="",sub:t="",selected:i=!1}={}){return`
    <button
      type="button"
      role="option"
      class="mnyra-go-page__wheel-item"
      data-go-wheel-pick="${n(a)}"
      aria-selected="${i?"true":"false"}"
    >${n(e)}${t?`<span>${n(t)}</span>`:""}</button>
  `}function v(a="",e="",t=[],{label:i="",variant:r="party"}={}){return`
    <div
      class="mnyra-go-page__wheel-list mnyra-go-page__wheel-list--${n(r)}"
      data-go-wheel="${n(a)}"
      data-go-wheel-value="${n(e)}"
      role="listbox"
      aria-label="${n(i)}"
    >
      <div class="mnyra-go-page__wheel-pad"></div>
      ${t.map(o=>X({...o,selected:String(o.value)===String(e)})).join("")}
      <div class="mnyra-go-page__wheel-pad"></div>
    </div>
  `}function M(a=""){return`
    <div class="mnyra-go-page__wheel">
      <div class="mnyra-go-page__wheel-band" aria-hidden="true"></div>
      <div class="mnyra-go-page__wheel-fade mnyra-go-page__wheel-fade--top" aria-hidden="true"></div>
      <div class="mnyra-go-page__wheel-fade mnyra-go-page__wheel-fade--bottom" aria-hidden="true"></div>
      ${a}
    </div>
  `}function J(a={},e=d){const t=b(a.partySize),i=[];for(let r=E;r<=O;r+=1)i.push({value:String(r),label:String(r),sub:x(r,e)});return M(v("party",String(t),i,{label:e.partyQuestion,variant:"party"}))}function ee(a={},e=d){const t=Array.from({length:24},(r,o)=>({value:u(o),label:u(o)})),i=[{value:"00",label:"00"},{value:"30",label:"30"}];return M(`
    ${v("hour",u(a.laterHour||"19"),t,{label:e.whenPickTime,variant:"time"})}
    <span class="mnyra-go-page__wheel-colon" aria-hidden="true">:</span>
    ${v("minute",u(a.laterMinute||"00"),i,{label:e.whenPickTime,variant:"time"})}
  `)}function D(a,e,{selected:t="",minKey:i="",maxKey:r=""}={}){const o=new Date(a,e+1,0).getDate(),s=(new Date(a,e,1).getDay()+6)%7,p=[];for(let l=0;l<s;l+=1)p.push("<span></span>");for(let l=1;l<=o;l+=1){const h=`${a}-${u(e+1)}-${u(l)}`,c=h<i||h>r;p.push(`
      <button
        type="button"
        class="mnyra-go-page__cal-day"
        data-go-date="${n(h)}"
        aria-pressed="${h===t?"true":"false"}"
        ${c?"disabled":""}
      >${l}</button>
    `)}return`
    <div class="mnyra-go-page__cal">
      <p class="mnyra-go-page__cal-month">${n(F[e])} ${a}</p>
      <div class="mnyra-go-page__cal-week" aria-hidden="true">${U.map(l=>`<span>${n(l)}</span>`).join("")}</div>
      <div class="mnyra-go-page__cal-grid">${p.join("")}</div>
    </div>
  `}function ae(a={},{nowMs:e=Date.now()}={}){const t=_(e),i=_(e+C*864e5),r=j(t),o=j(i),s=String(a.laterDate||"").trim(),p=[D(t.getFullYear(),t.getMonth(),{selected:s,minKey:r,maxKey:o})];return i.getMonth()!==t.getMonth()&&p.push(D(i.getFullYear(),i.getMonth(),{selected:s,minKey:r,maxKey:o})),p.join("")}function ne(a={},e=d){const t=String(a.intent||"unsure");return`
    <div class="mnyra-go-page__intents" role="group" aria-label="${n(e.categoryQuestion)}">
      ${w.map(i=>`
        <button
          type="button"
          class="mnyra-go-page__intent"
          data-go-intent="${n(i.key)}"
          aria-pressed="${t===i.key?"true":"false"}"
        >
          <span class="mnyra-go-page__intent-ic">${g(i.icon)}</span>
          <span class="mnyra-go-page__intent-body">
            <span class="mnyra-go-page__intent-label">${n(i.label)}</span>
            <span class="mnyra-go-page__intent-hint">${n(i.hint)}</span>
          </span>
        </button>
      `).join("")}
    </div>
  `}function te(a={},e=d){const t=String(a.when||"now");return`
    <div class="mnyra-go-page__chips" role="group" aria-label="${n(e.whenQuestion)}">
      ${H.map(i=>`
        <button
          type="button"
          class="mnyra-go-page__chip"
          data-go-when="${n(i.key)}"
          aria-pressed="${t===i.key?"true":"false"}"
        >
          ${g(W[i.key]||"clock")}
          <span>
            <b>${n(i.label)}</b>
            <i>${n(Z[i.key]||"")}</i>
          </span>
        </button>
      `).join("")}
    </div>
  `}function ie(a={},e=d){const t=String(a.city||"").trim();return`
    <div class="mnyra-go-page__place">
      <span class="mnyra-go-page__place-ic">${g("map-pin")}</span>
      <span class="mnyra-go-page__place-body">
        <span class="mnyra-go-page__place-label">${n(e.placeLabel)}</span>
        <p class="mnyra-go-page__place-city">${n(t||e.placeEmpty)}</p>
      </span>
      <button type="button" class="mnyra-go-page__place-change" data-go-change-city>
        ${g("pencil")}${n(e.locationChange)}
      </button>
    </div>
  `}function re(a={},e=d){const t=String(a.city||"").trim(),i=String(a.citySearch||"").trim(),r=i.toLowerCase(),o=z.some(s=>s.name.toLowerCase()===r);return`
    <div class="mnyra-go-page__city-search">
      ${g("search")}
      <input
        type="text"
        class="mnyra-go-page__field"
        data-go-city-input
        value="${n(i)}"
        placeholder="${n(e.citySearch)}"
        aria-label="${n(e.cityQuestion)}"
        autocomplete="address-level2"
        enterkeyhint="done"
      />
    </div>
    <div class="mnyra-go-page__city-list" role="listbox" aria-label="${n(e.cityQuestion)}">
      ${z.map(s=>`
        <button
          type="button"
          class="mnyra-go-page__city-option"
          data-go-city="${n(s.name)}"
          data-go-city-name="${n(s.name.toLowerCase())}"
          aria-pressed="${t===s.name?"true":"false"}"
          ${r&&!s.name.toLowerCase().includes(r)?"hidden":""}
        >${n(s.name)}<span>${n(s.region)}</span></button>
      `).join("")}
      <button
        type="button"
        class="mnyra-go-page__city-option mnyra-go-page__city-option--free"
        data-go-city-free
        ${i&&!o?"":"hidden"}
      ><span data-go-city-free-label>${n(e.cityUse)}: ${n(i)}</span>${g("check-check")}</button>
    </div>
  `}function oe(a={},e=d,{nowMs:t=Date.now()}={}){const i=k(a.step),r=y.indexOf(i),o=i==="when"&&String(a.when||"now")==="later"?String(a.whenSub||"date")==="time"?"time":"date":"quick",s=i==="place"&&a.citySelect?"select":"main",p=b(a.partySize),l=String(a.city||"").trim();let h=Y[i]||"users",c="",m="",f="";i==="party"?(c=e.partyQuestion,m=J(a,e),f=`<button type="button" class="mnyra-go-page__cta" data-go-step-next>${n(e.next)}${g("chevron-right")}</button>`):i==="category"?(c=e.categoryQuestion,m=ne(a,e),f=`<p class="mnyra-go-page__ask-hint">${n(e.pickHint)}</p>`):i==="when"&&o==="date"?(h="calendar-clock",c=e.whenPickDate,m=ae(a,{nowMs:t}),f=`<p class="mnyra-go-page__ask-hint">${n(e.whenHintDate)}</p>`):i==="when"&&o==="time"?(h="clock",c=e.whenPickTime,m=ee(a,e),f=`
      <button type="button" class="mnyra-go-page__cta" data-go-when-save>
        ${g("check-check")}<span data-go-when-save-label>${n(V(a,e,{nowMs:t}))}</span>
      </button>
    `):i==="when"?(c=e.whenQuestion,m=te(a,e),f=`<p class="mnyra-go-page__ask-hint">${n(e.whenHintPick)}</p>`):s==="select"?(h="map-pin",c=e.cityQuestion,m=re(a,e),f=`
      <button type="button" class="mnyra-go-page__cta" data-go-city-save>
        ${g("check-check")}<span data-go-city-save-label>${n(`${e.citySaveCity} (${l||e.placeEmpty})`)}</span>
      </button>
    `):(c=e.placeQuestion,m=ie(a,e),f=`<button type="button" class="mnyra-go-page__cta" data-go-submit>${g("search")}${n(e.submit)}</button>`);const L=r>0||o!=="quick"||s==="select"?`<button type="button" class="mnyra-go-page__ask-back" data-go-step-back aria-label="${n(e.stepBack)}" title="${n(e.stepBack)}">${g("arrow-left")}</button>`:`<p class="mnyra-go-page__ask-value" data-go-party-value><b>${n(String(p))}</b> ${n(x(p,e))}</p>`;return`
    <section
      class="mnyra-go-page__ask"
      data-go-step="${n(i)}"
      data-go-when-sub="${n(o)}"
      data-go-city-sub="${n(s)}"
    >
      <header class="mnyra-go-page__ask-head">
        <h2 class="mnyra-go-page__q">${g(h)}${n(c)}</h2>
        ${L}
      </header>
      <div class="mnyra-go-page__ask-body">${m}</div>
      <div class="mnyra-go-page__ask-foot">${f}</div>
      <span class="mnyra-go-page__ask-mark" aria-hidden="true">mnyra<b>GO</b></span>
    </section>
  `}function se(a={},e=d){const t=a.live||{},i=Math.max(0,Math.trunc(Number(t.count)||0)),r=Math.max(0,Math.trunc(Number(t.seconds)||0)),o=i>0?"arrive":"send",s=a.form||{},p=String(s.city||"").trim(),l=w.find(c=>c.key===String(s.intent||"unsure")),h=[A(s.partySize,e),l?l.label:"",p].filter(Boolean).join(" · ");return`
    <section
      class="mnyra-go-page__ask"
      data-go-live-card
      data-go-live="${o}"
      data-go-live-done="${t.done?"1":"0"}"
    >
      <header class="mnyra-go-page__ask-head">
        <span class="mnyra-go-page__q">
          <span class="mnyra-go-page__live-badge" data-go-live-icon="0">${q.map(c=>g(c)).join("")}</span>
          <span class="mnyra-go-page__brand">mnyra<b>GO</b></span>
        </span>
        <button type="button" class="mnyra-go-page__ask-back" data-go-live-cancel aria-label="${n(e.back)}" title="${n(e.back)}">
          ${g("rotate-ccw")}
        </button>
      </header>

      <div class="mnyra-go-page__ask-body mnyra-go-page__live">
        <div class="mnyra-go-page__live-send">
          <h3 class="mnyra-go-page__live-title">${n(e.liveSending)}</h3>
          <p class="mnyra-go-page__live-pill" data-go-live-seconds>${n(`${e.liveWait}: ${r} ${e.liveSeconds}`)}</p>
          <p class="mnyra-go-page__live-sub">${n(`${e.liveContacting} ${p}`.trim())}</p>
        </div>
        <div class="mnyra-go-page__live-arrive">
          <p class="mnyra-go-page__live-count" data-go-live-count>${i}</p>
          <p class="mnyra-go-page__live-word" data-go-live-word>${n(i===1?e.liveOne:e.liveMany)}</p>
          <p class="mnyra-go-page__live-name" data-go-live-name>${n(t.name||"")}</p>
        </div>
      </div>

      <div class="mnyra-go-page__ask-foot">
        <p class="mnyra-go-page__ask-hint" data-go-live-hint>${n(h)}</p>
        <button type="button" class="mnyra-go-page__cta" data-go-live-open>
          ${n(e.liveOpen)}${g("chevron-right")}
        </button>
      </div>
    </section>
  `}function ge(a={},e=d){const t=Array.isArray(a.results)?a.results:[],i=a.form||{},r=w.find(s=>s.key===String(i.intent||"unsure")),o=[A(i.partySize,e),r?r.label:"",String(i.city||"").trim()].filter(Boolean).join(" · ");return`
    <section class="mnyra-go-page__ask" data-go-ready-card>
      <header class="mnyra-go-page__ask-head">
        <span class="mnyra-go-page__q">
          <span class="mnyra-go-page__live-badge mnyra-go-page__live-badge--done">${g("check-check")}</span>
          <span class="mnyra-go-page__brand">mnyra<b>GO</b></span>
        </span>
      </header>

      <div class="mnyra-go-page__ask-body mnyra-go-page__live">
        <h3 class="mnyra-go-page__live-title">
          ${n(t.length?`${e.readyTitle} ${t.length} ${t.length===1?e.readyOne:e.readyMany}`:e.emptyTitle)}
        </h3>
        <p class="mnyra-go-page__live-sub">${n(t.length?o:e.emptySubtitle)}</p>
      </div>

      <div class="mnyra-go-page__ask-foot">
        <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-back>
          ${g("arrow-left")}${n(e.back)}
        </button>
      </div>
    </section>
  `}function P(a={},{texts:e=d,busyOfferId:t="",nowMs:i=Date.now()}={}){const r=t&&t===a.offerId,o=Number.isFinite(Number(a.distanceKm))&&a.distanceKm!==null?`${Number(a.distanceKm).toFixed(1)} km`:"",s=a.isNow?e.now:G(a.expectedArrivalAt,{nowMs:i});return R({businessName:a.businessName,logoUrl:a.logoUrl,benefitLabel:a.benefitLabel,benefitView:a.benefitView,sponsored:a.sponsored,meta:[{icon:"users",label:`${a.partySize} ${e.peopleSuffix}`},{icon:"clock",label:s},{icon:"map-pin",label:o},a.bookingType==="reservation"?{icon:"armchair",label:e.tableIncluded}:null],ctaLabel:r?e.confirming:e.accept,ctaIcon:r?"":"check-check",ctaDisabled:r,cardAttrs:`data-go-result="${n(a.offerId)}"`,ctaAttrs:`data-go-accept="${n(a.offerId)}" data-go-restaurant="${n(a.restaurantId)}"`,texts:e})}function de(a={},e=d){const t=Array.isArray(a.results)?a.results:[],i=Number(a.nowMs)||Date.now();return t.length?`
    <h2 class="mnyra-go-page__lead">${t.length} ${n(e.resultsHeadline)}</h2>
    ${a.notice?`<p class="mnyra-go-page__note">${n(a.notice)}</p>`:""}
    ${t.map(r=>P(r,{texts:e,busyOfferId:a.busyOfferId,nowMs:i})).join("")}
    <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-back>
      ${g("arrow-left")}${n(e.back)}
    </button>
  `:S(a)}function le(a={},e=d){const t=a.booking||{},i=t.type==="reservation",r=Number(a.nowMs)||Date.now(),o=G(t.expectedArrivalAt,{nowMs:r}),s=String(a.statusLabel||"").trim()||(i?e.reservationConfirmed:e.claimConfirmed);return a.confirmCancel?`
      <h2 class="mnyra-go-page__lead">${n(e.cancelConfirm)}</h2>
      <div class="mnyra-go-page__row">
        <button type="button" class="mnyra-go-page__cta" data-go-cancel-confirm>
          ${g("ban")}${n(e.cancelYes)}
        </button>
        <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-cancel-dismiss>${n(e.cancelNo)}</button>
      </div>
    `:`
    <p class="mnyra-go-page__done">${n(e.doneTitle)} ${g("party-popper")}</p>
    <p class="mnyra-go-page__done-name">${n(t.businessName||"")}</p>
    <p class="mnyra-go-page__card-for">${n(t.benefitLabel||"")}</p>

    <div class="mnyra-go-page__card-meta">
      <span>${g("users")}${n(`${t.partySize||1} ${e.peopleSuffix}`)}</span>
      ${o?`<span>${g("clock")}${n(o)}</span>`:""}
      ${t.city?`<span>${g("map-pin")}${n(t.city)}</span>`:""}
    </div>

    <p class="mnyra-go-page__ok">${g("circle-check-big")}${n(s)}</p>

    ${t.shortCode?`
      <div class="mnyra-go-page__code">
        <p class="mnyra-go-page__code-label">${g("hash")}${n(e.code)}</p>
        <p class="mnyra-go-page__code-value">${n(t.shortCode)}</p>
      </div>
    `:""}

    ${a.bookingLink?`
      <!--
        Der Link zur eigenen Oferta.
        Was der Browser sich merkt, ist im privaten Fenster nach dem
        Schliessen weg - dieser Link ist dann der einzige Weg zurueck. Er ist
        zugleich die Weitergabe: Solange das Lokal nicht bestaetigt hat, darf
        die Oferta wandern.
      -->
      <div class="mnyra-go-page__link" data-go-link-box>
        <p class="mnyra-go-page__code-label">${g("link")}${n(e.linkLabel)}</p>
        <p class="mnyra-go-page__link-value" data-go-link-value>${n(a.bookingLink)}</p>
        <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-link-copy
          data-go-link="${n(a.bookingLink)}">
          ${g(a.linkCopied?"check":"copy")}${n(a.linkCopied?e.linkCopied:e.linkCopy)}
        </button>
        <p class="mnyra-go-page__link-hint">${n(e.linkHint)}</p>
      </div>
    `:""}

    <div class="mnyra-go-page__row">
      <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-menu>
        ${g("book-open")}${n(e.menu)}
      </button>
      <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-directions>
        ${g("navigation")}${n(e.directions)}
      </button>
    </div>

    ${a.canSignIn?`
      <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-signin>
        ${g("log-in")}${n(e.saveToAccount)} · ${n(e.signIn)}
      </button>
    `:""}

    <button type="button" class="mnyra-go-page__ghost" data-go-cancel>${n(e.cancel)}</button>
  `}function ce(a={},e=d){const t=Array.isArray(a.alternatives)?a.alternatives:[];return t.length?`
    <h2 class="mnyra-go-page__lead">${t.length} ${n(e.alternatives)}</h2>
    ${t.map(i=>P(i,{texts:e,nowMs:a.nowMs})).join("")}
    <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-back>
      ${g("arrow-left")}${n(e.back)}
    </button>
  `:S(a)}function pe(a={},e=d){const t=String(a.error||"").trim()||e.errorTitle,i=Array.isArray(a.alternatives)?a.alternatives:[];return`
    <section class="mnyra-go-page__ask" data-go-trouble-card>
      <header class="mnyra-go-page__ask-head">
        <span class="mnyra-go-page__q">
          <span class="mnyra-go-page__live-badge mnyra-go-page__live-badge--warn">${g("triangle-alert")}</span>
          <span class="mnyra-go-page__brand">mnyra<b>GO</b></span>
        </span>
      </header>

      <div class="mnyra-go-page__ask-body mnyra-go-page__live">
        <h3 class="mnyra-go-page__live-title">${n(t)}</h3>
      </div>

      <div class="mnyra-go-page__ask-foot">
        ${i.length?`<button type="button" class="mnyra-go-page__cta" data-go-back>${g("arrow-left")}${n(e.back)}</button>`:`<button type="button" class="mnyra-go-page__cta" data-go-retry>${g("rotate-ccw")}${n(e.errorRetry)}</button>`}
      </div>
    </section>
  `}function he(a=[]){const e=Array.isArray(a)?a:[];let t=0;const i=()=>{const r=t++;return`data-go-reveal="${r}"${e.includes(r)?' data-go-reveal-in="1"':""}`};return`
    <div class="mnyra-go-page__story" data-go-story>
      ${K.map((r,o)=>{const s=o===0;return`
        <article class="mnyra-go-page__story-slide" data-go-story-slide="${o}">
          <figure
            class="mnyra-go-page__story-media"
            data-go-story-side="${n(r.side||"right")}"
            data-go-story-focus="${n(r.focus||"center")}"
            ${i()}
          >
            <img
              src="${n(B+r.file)}"
              alt="${n(r.alt||"")}"
              width="1600"
              height="900"
              loading="${s?"eager":"lazy"}"
              fetchpriority="${s?"high":"low"}"
              decoding="async"
              onerror="this.remove()"
            />
            ${r.headline?`<figcaption class="mnyra-go-page__story-headline">${$(r.headline,"mnyra-go-page__story-headline-accent")}</figcaption>`:""}
          </figure>
          <p class="mnyra-go-page__story-text" ${i()}>${$(r.text)}</p>
        </article>
      `}).join("")}
    </div>
  `}function S(a={}){return he(a.storyShown)}function Oe(a={}){const e={...d,...a.texts||{}},t=String(a.view||"search"),i=Number(a.nowMs)||Date.now();let r="";t==="search"?r=oe(a.form||{},e,{nowMs:i}):t==="matching"?r=se(a,e):t==="results"?r=ge(a,e):t==="error"&&(r=pe(a,e));let o="";return t==="loading"?o=`<div class="mnyra-go-page__empty">${n(e.searching)}</div>`:t==="results"?o=de(a,e):t==="booking"?o=le(a,e):t==="error"?o=ce(a,e):o=S(a),`
    <div class="mnyra-go-page" data-go-page data-go-view="${n(t)}">
      ${r?`<div class="mnyra-go-page__top">${r}</div>`:""}
      <div class="mnyra-go-page__bento" data-go-bento>${o}</div>
    </div>
  `}const Ee=d,Be=K,Ke=B;export{z as GO_CITIES,q as GO_LIVE_ICONS,xe as GO_PAGE_CSS,Ke as GO_PAGE_STORY_BASE,Be as GO_PAGE_STORY_SLIDES,ke as GO_PAGE_STYLE_ELEMENT_ID,Ee as GO_PAGE_TEXTS,y as GO_STEPS,$e as GO_WHEEL_ITEM_HEIGHT,b as clampGoPartySize,j as goDateKey,Q as goDateLabel,De as goLaterValue,A as goPartyLabel,x as goPartyWord,Se as goStoryPlainText,T as goTimeLabel,V as goWhenSaveLabel,ze as nextGoStep,je as previousGoStep,Oe as renderGoPageCore,k as resolveGoStep};
