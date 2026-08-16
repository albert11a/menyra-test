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
// angetippte Pille IST die Antwort. Ein Regler ist nie fertig, der Finger
// koennte noch einmal ziehen; deshalb hat der erste Schritt einen Knopf.

import {
  GO_CATEGORIES,
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
     der Aufbau des Feed-Gates. Das Seitenpolster ist das der App
     (--app-content-inline, 1.5rem), damit GO an denselben Raendern steht wie
     Qyteti. */
  --go-bento-surface: #ffffff;
  --go-bento-radius: 2.5rem;
  --go-inline: var(--app-content-inline, 1.5rem);
  background: var(--go-plane);
  color: var(--go-ink);
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  flex-direction: column;
  /* Die Seite fuellt das Fenster, damit das Bento auch bei kurzem Inhalt bis
     nach unten reicht. Ein Bento, das auf halber Hoehe endet, waere eine
     Kante mitten im Weissen. */
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
   Karte, die schwebt, keine, die einen Rand wirft. */
.mnyra-go-page__ask {
  padding: 15px 16px;
  border: 1px solid var(--go-line);
  border-radius: 24px;
  background: #ffffff;
  box-shadow:
    0 26px 50px -28px rgba(var(--go-chrome-shadow), 0.55),
    0 10px 22px -14px rgba(var(--go-chrome-shadow), 0.4),
    0 1px 2px rgba(var(--go-chrome-shadow), 0.12);
}
.mnyra-go-page__ask-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 13px;
}
.mnyra-go-page__ask-back {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 12px;
  background: var(--go-plane);
  color: var(--go-ink);
  cursor: pointer;
}
.mnyra-go-page__ask-back svg { width: 16px; height: 16px; }
.mnyra-go-page__ask-back:active { transform: scale(0.94); }
.mnyra-go-page__ask-meta { flex: 1; min-width: 0; }
.mnyra-go-page__ask-count {
  margin: 0;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--go-muted);
}
.mnyra-go-page__ask-bar {
  margin-top: 7px;
  height: 4px;
  border-radius: 999px;
  background: var(--go-plane);
  overflow: hidden;
}
.mnyra-go-page__ask-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--go-accent);
  transition: width 0.25s ease;
}
/* Was schon beantwortet ist, schrumpft auf ein Wort - und bleibt anfassbar.
   Eine Antwort, die man nicht mehr aendern kann, ohne von vorn anzufangen,
   ist eine Falle. */
.mnyra-go-page__ask-done {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}
.mnyra-go-page__ask-tag {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 11px;
  border: 1px solid var(--go-line);
  border-radius: 999px;
  background: #ffffff;
  color: var(--go-ink);
  font-size: 12px;
  font-weight: 900;
  font-family: inherit;
  cursor: pointer;
}
.mnyra-go-page__ask-tag svg { width: 13px; height: 13px; color: var(--go-muted); }
.mnyra-go-page__ask-tag:active { transform: scale(0.96); }
.mnyra-go-page__q {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--go-ink);
}
.mnyra-go-page__q svg { width: 16px; height: 16px; color: var(--go-muted); flex: 0 0 auto; }
/* Der Regler. Die Zahl steht gross darueber, damit sie waehrend des Ziehens
   ablesbar bleibt - der Daumen liegt auf dem Griff und verdeckt ihn. */
.mnyra-go-page__party-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 25px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--go-ink);
  font-variant-numeric: tabular-nums;
}
.mnyra-go-page__party-value span {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--go-muted);
}
.mnyra-go-page__range {
  -webkit-appearance: none;
  appearance: none;
  display: block;
  width: 100%;
  height: 44px;
  margin: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}
.mnyra-go-page__range:focus { outline: none; }
.mnyra-go-page__range::-webkit-slider-runnable-track {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    var(--go-accent) 0%,
    var(--go-accent) var(--go-range-fill, 20%),
    var(--go-plane) var(--go-range-fill, 20%),
    var(--go-plane) 100%
  );
}
.mnyra-go-page__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  margin-top: -9px;
  border: 3px solid var(--go-accent);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
}
.mnyra-go-page__range::-moz-range-track { height: 10px; border-radius: 999px; background: var(--go-plane); }
.mnyra-go-page__range::-moz-range-progress { height: 10px; border-radius: 999px; background: var(--go-accent); }
.mnyra-go-page__range::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border: 3px solid var(--go-accent);
  border-radius: 999px;
  background: #ffffff;
}
.mnyra-go-page__range-scale {
  display: flex;
  justify-content: space-between;
  margin-top: -2px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: var(--go-muted);
}
/* Pillen, keine Dropdowns - GO wird mit dem Daumen bedient, und 44px sind die
   kleinste Flaeche, die sicher zu treffen ist. */
.mnyra-go-page__chips {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.mnyra-go-page__chip {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: var(--go-plane);
  color: var(--go-ink-2);
  font-size: 13.5px;
  font-weight: 900;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.mnyra-go-page__chip svg { width: 17px; height: 17px; flex: 0 0 auto; color: var(--go-muted); }
.mnyra-go-page__chip[aria-pressed="true"] {
  background: var(--go-ink);
  border-color: var(--go-ink);
  color: #ffffff;
}
.mnyra-go-page__chip[aria-pressed="true"] svg { color: #ffffff; }
.mnyra-go-page__chip:active { transform: scale(0.97); }
.mnyra-go-page__chip--wide { grid-column: 1 / -1; }
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
  /* Viel Luft zwischen den Kapiteln, wenig innerhalb. Das ist der ganze
     Trick: Ein Bild und sein Satz gehoeren zusammen (14px), das naechste
     Kapitel faengt neu an (5.5rem). Bei gleichem Abstand ueberall waere es
     eine Liste; so ist es eine Folge von Aussagen, jede fuer sich. */
  gap: 5.5rem;
}
/* Aufgedeckt wird beim Scrollen: das Bild steigt und blendet auf, der Satz
   darunter kommt eine Idee spaeter nach. "Eine Idee" ist hier eine Zahl -
   90ms; genug, dass das Auge zuerst beim Bild ist, zu wenig, um als Warten
   aufzufallen.

   Der verborgene Zustand steht in der Regel ohne Zustandsmarke, der sichtbare
   mit: So ist die Seite noch beim ersten Aufbau richtig, ohne dass jemand
   etwas anschalten muesste. Sichtbar wird sie ausschliesslich durch
   data-go-story-in - und das setzt der Beobachter (oder, wo es ihn nicht
   gibt, der Controller sofort fuer alle). */
.mnyra-go-page__story-slide {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}
/* Nur solange etwas bevorsteht. Ein will-change, das stehen bleibt, haelt fuer
   jede Kachel eine eigene Ebene im Speicher - vier davon auf einer Seite, die
   ohnehin vier grosse Bilder traegt. */
.mnyra-go-page__story-slide:not([data-go-story-in="1"]) {
  will-change: opacity, transform;
}
.mnyra-go-page__story-slide[data-go-story-in="1"] {
  opacity: 1;
  transform: none;
}
/* Das Bildfenster steht, bevor das Bild da ist: Es haelt sein
   Seitenverhaeltnis aus sich heraus, damit beim Nachladen nichts springt und
   der Satz darunter nicht wandert. Fehlt eine Datei, nimmt der Browser das
   Bild heraus (onerror) und es bleibt diese Flaeche stehen - kein zerbrochenes
   Symbol mitten in der Erklaerung. */
.mnyra-go-page__story-media {
  margin: 0;
  overflow: hidden;
  border-radius: 22px;
  background: var(--go-plane);
  aspect-ratio: 16 / 9;
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
.mnyra-go-page__story-slide[data-go-story-in="1"] .mnyra-go-page__story-media img {
  transform: none;
}
/* Der Satz traegt das Kapitel, also darf er auch so gross sein. 21px statt
   15px, enger gestellt und mit weiter Zeile - der Ton, in dem eine
   Produktseite spricht, nicht der einer Bildunterschrift.
   "clamp" statt einer festen Zahl: auf einem kleinen Telefon bliebe eine
   21px-Zeile sonst nach zwei Woertern haengen. */
.mnyra-go-page__story-text {
  /* Der Satz haengt nicht am Bild, er steht darunter. 36px sind weit genug,
     dass er als eigene Zeile anfaengt, und weit weniger als die 5.5rem zum
     naechsten Kapitel - beides zusammen sagt: gehoert dazu, ist aber nicht
     die Bildunterschrift. */
  margin: 36px 0 0;
  max-width: 22ch;
  font-size: clamp(18px, 5.4vw, 21px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.32;
  color: var(--go-ink);
  text-wrap: balance;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) 0.09s,
    transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) 0.09s;
}
/* Die betonte Stelle - je Satz genau eine, im Blau von Mnyra. Sie traegt
   keine andere Schriftstaerke: Die Farbe hebt schon genug hervor, und zwei
   Mittel fuer eine Betonung sind eines zu viel. */
.mnyra-go-page__story-accent { color: var(--go-accent); }
.mnyra-go-page__story-slide[data-go-story-in="1"] .mnyra-go-page__story-text {
  opacity: 1;
  transform: none;
}
/* Wer Bewegung abbestellt hat, bekommt sie nicht - auch nicht als "dezente"
   Version. Die Seite steht dann einfach da, vollstaendig und sofort. */
@media (prefers-reduced-motion: reduce) {
  .mnyra-go-page__story-slide,
  .mnyra-go-page__story-text,
  .mnyra-go-page__story-media img {
    opacity: 1;
    transform: none;
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
  .mnyra-go-page__chip, .mnyra-go-page__cta, .mnyra-go-page__ask-bar span { transition: none; }
}
`;

const TEXTS = Object.freeze({
  brand: "Mnyra GO",
  partyQuestion: "Sa veta jeni?",
  partyOne: "person",
  partyMany: "veta",
  step: "Hapi",
  stepBack: "Kthehu një hap prapa",
  next: "Vazhdo",
  categoryQuestion: "Çka dëshironi?",
  whenQuestion: "Kur?",
  whenLaterLabel: "Zgjidh ditën dhe orën",
  placeQuestion: "Ku?",
  placeLabel: "Qyteti",
  placeEmpty: "Shto qytetin tënd",
  cityPlaceholder: "Shkruaj qytetin",
  locationChange: "Ndrysho",
  locationSave: "Ruaj",
  submit: "Shiko ofertat",
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

// Die Bildergeschichte im Bento. Vier Bilder, vier Saetze - was GO ist, in
// der Reihenfolge, in der es passiert.
//
// Die Frage steht IM Bild ("A je unt?"), nicht daneben: Die Bilder sind so
// gesetzt worden. Deshalb traegt das alt-Attribut sie - fuer den, der die
// Bilder nicht sieht, waere sie sonst verloren. Der Satz darunter steht als
// Text da und nicht im Bild; er muss gelesen, uebersetzt und gefunden werden
// koennen.
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
    file: "story-1-unt.webp",
    // Was im Bild steht.
    headline: "A je unt?",
    text: Object.freeze([
      "Trego sa veta jeni edhe ",
      Object.freeze({ accent: "çka po ju hahet." })
    ])
  }),
  Object.freeze({
    file: "story-2-ku-me-dal.webp",
    headline: "S’po din ku me dal?",
    text: Object.freeze([
      "Mos lyp lokal — lokalet që t’përshtaten ",
      Object.freeze({ accent: "t’gjejnë ty." })
    ])
  }),
  Object.freeze({
    file: "story-3-shtrejt.webp",
    headline: "Edhe shumë shtrejt?",
    text: Object.freeze([
      "Lokalet t’çojnë oferta me ",
      Object.freeze({ accent: "zbritje direkt" }),
      " — ti veç zgjedh."
    ])
  }),
  Object.freeze({
    file: "story-4-knaqu.webp",
    headline: "Ofertat t’vijn. Ti veç shko, knaqu.",
    text: Object.freeze([
      "Zgjedhe ofertën që t’pëlqen, shko aty edhe ",
      Object.freeze({ accent: "knaqu." })
    ])
  })
]);

// Die Stuecke eines Satzes zu Markup - jedes einzeln escaped, betonte in
// einem <span>. Ein Stueck, das weder Text noch Betonung ist, faellt heraus
// statt "[object Object]" zu schreiben.
function storyText(parts = []) {
  return (Array.isArray(parts) ? parts : [parts])
    .map((part) => {
      if (typeof part === "string") return esc(part);
      const accent = typeof part?.accent === "string" ? part.accent : "";
      return accent ? `<span class="mnyra-go-page__story-accent">${esc(accent)}</span>` : "";
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

/** Wie weit der Regler gefuellt ist. */
export function goPartyFillPercent(value) {
  const size = clampGoPartySize(value);
  const span = GO_PARTY_SIZE_MAX - GO_PARTY_SIZE_MIN;
  if (span <= 0) return 0;
  return Math.round(((size - GO_PARTY_SIZE_MIN) / span) * 100);
}

function chip(label, { active = false, attr = "", value = "", iconName = "", wide = false } = {}) {
  // aria-pressed traegt die Auswahl zusaetzlich zur Farbe - Farbe allein ist
  // fuer manche Menschen keine Information.
  return `
    <button
      type="button"
      class="mnyra-go-page__chip${wide ? " mnyra-go-page__chip--wide" : ""}"
      ${attr ? `${attr}="${esc(value)}"` : ""}
      aria-pressed="${active ? "true" : "false"}"
    >${iconName ? goIcon(iconName) : ""}<span>${esc(label)}</span></button>
  `;
}

function arrivalLabel(value, { nowMs = Date.now() } = {}) {
  const ms = Date.parse(String(value || ""));
  if (!Number.isFinite(ms)) return "";
  if (Math.abs(ms - nowMs) < 15 * 60 * 1000) return TEXTS.now;
  const date = new Date(ms);
  return `Rreth ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function stepAnswerLabel(step = "", form = {}, texts = TEXTS) {
  if (step === "party") return goPartyLabel(form.partySize, texts);
  if (step === "category") {
    const found = GO_CATEGORIES.find((entry) => entry.key === String(form.category || "all"));
    return found ? found.label : "";
  }
  if (step === "when") {
    const found = GO_WHEN_OPTIONS.find((entry) => entry.key === String(form.when || "now"));
    return found ? found.label : "";
  }
  if (step === "place") return String(form.city || "").trim() || texts.placeEmpty;
  return "";
}

function renderAnsweredTags(step = "", form = {}, texts = TEXTS) {
  const index = GO_STEPS.indexOf(step);
  const answered = GO_STEPS.slice(0, Math.max(0, index));
  if (!answered.length) return "";
  return `
    <div class="mnyra-go-page__ask-done">
      ${answered.map((key) => `
        <button type="button" class="mnyra-go-page__ask-tag" data-go-goto="${esc(key)}">
          ${goIcon(STEP_ICONS[key] || "check-check")}<span>${esc(stepAnswerLabel(key, form, texts))}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderPartyStep(form = {}, texts = TEXTS) {
  const partySize = clampGoPartySize(form.partySize);
  return `
    <output class="mnyra-go-page__party-value" data-go-party-value for="mnyraGoParty">
      ${esc(String(partySize))} <span>${esc(goPartyWord(partySize, texts))}</span>
    </output>
    <input
      id="mnyraGoParty"
      type="range"
      class="mnyra-go-page__range"
      data-go-party-range
      min="${GO_PARTY_SIZE_MIN}"
      max="${GO_PARTY_SIZE_MAX}"
      step="1"
      value="${partySize}"
      style="--go-range-fill:${goPartyFillPercent(partySize)}%;"
      aria-label="${esc(texts.partyQuestion)}"
      aria-valuetext="${esc(goPartyLabel(partySize, texts))}"
    />
    <div class="mnyra-go-page__range-scale" aria-hidden="true">
      <span>${GO_PARTY_SIZE_MIN}</span>
      <span>${GO_PARTY_SIZE_MAX}</span>
    </div>
  `;
}

function renderCategoryStep(form = {}, texts = TEXTS) {
  const category = String(form.category || "all");
  return `
    <div class="mnyra-go-page__chips" role="group" aria-label="${esc(texts.categoryQuestion)}">
      ${GO_CATEGORIES.map((entry, index) => chip(entry.label, {
        active: category === entry.key,
        attr: "data-go-category",
        value: entry.key,
        iconName: entry.icon,
        wide: index === 0
      })).join("")}
    </div>
  `;
}

function renderWhenStep(form = {}, texts = TEXTS) {
  const when = String(form.when || "now");
  return `
    <div class="mnyra-go-page__chips" role="group" aria-label="${esc(texts.whenQuestion)}">
      ${GO_WHEN_OPTIONS.map((entry) => chip(entry.label, {
        active: when === entry.key,
        attr: "data-go-when",
        value: entry.key,
        iconName: WHEN_ICONS[entry.key] || "clock"
      })).join("")}
    </div>
    ${when === "later" ? `
      <p class="mnyra-go-page__field-label">${esc(texts.whenLaterLabel)}</p>
      <input
        type="datetime-local"
        class="mnyra-go-page__field"
        data-go-when-input
        value="${esc(form.laterValue || "")}"
        aria-label="${esc(texts.whenLaterLabel)}"
      />
    ` : ""}
  `;
}

function renderPlaceStep(form = {}, texts = TEXTS) {
  const city = String(form.city || "").trim();
  if (form.editCity) {
    return `
      <div class="mnyra-go-page__place">
        <span class="mnyra-go-page__place-ic">${goIcon("map-pin")}</span>
        <span class="mnyra-go-page__place-body">
          <input
            type="text"
            class="mnyra-go-page__field"
            style="margin-top:0;"
            data-go-city-input
            value="${esc(city)}"
            placeholder="${esc(texts.cityPlaceholder)}"
            aria-label="${esc(texts.placeQuestion)}"
            autocomplete="address-level2"
            enterkeyhint="done"
          />
        </span>
        <button type="button" class="mnyra-go-page__place-change mnyra-go-page__place-change--save" data-go-city-save>
          ${esc(texts.locationSave)}
        </button>
      </div>
    `;
  }
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

function renderAskCard(form = {}, texts = TEXTS) {
  const step = resolveGoStep(form.step);
  const index = GO_STEPS.indexOf(step);
  const total = GO_STEPS.length;
  const percent = Math.round(((index + 1) / total) * 100);

  let control = "";
  let question = "";
  let cta = "";

  if (step === "party") {
    question = texts.partyQuestion;
    control = renderPartyStep(form, texts);
    cta = `<button type="button" class="mnyra-go-page__cta" data-go-step-next>${esc(texts.next)}${goIcon("chevron-right")}</button>`;
  } else if (step === "category") {
    question = texts.categoryQuestion;
    control = renderCategoryStep(form, texts);
  } else if (step === "when") {
    question = texts.whenQuestion;
    control = renderWhenStep(form, texts);
    if (String(form.when || "now") === "later") {
      cta = `<button type="button" class="mnyra-go-page__cta" data-go-step-next>${esc(texts.next)}${goIcon("chevron-right")}</button>`;
    }
  } else {
    question = texts.placeQuestion;
    control = renderPlaceStep(form, texts);
    cta = `<button type="button" class="mnyra-go-page__cta" data-go-submit>${goIcon("search")}${esc(texts.submit)}</button>`;
  }

  return `
    <section class="mnyra-go-page__ask" data-go-step="${esc(step)}">
      <header class="mnyra-go-page__ask-head">
        ${index > 0
          ? `<button type="button" class="mnyra-go-page__ask-back" data-go-step-back aria-label="${esc(texts.stepBack)}" title="${esc(texts.stepBack)}">${goIcon("arrow-left")}</button>`
          : ""}
        <div class="mnyra-go-page__ask-meta">
          <p class="mnyra-go-page__ask-count">${esc(texts.step)} ${index + 1}/${total}</p>
          <div class="mnyra-go-page__ask-bar" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${index + 1}">
            <span style="width:${percent}%;"></span>
          </div>
        </div>
      </header>

      ${renderAnsweredTags(step, form, texts)}

      <h2 class="mnyra-go-page__q">${goIcon(STEP_ICONS[step] || "users")}${esc(question)}</h2>
      ${control}
      ${cta}
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

function renderResultsBody(state = {}, texts = TEXTS) {
  const results = Array.isArray(state.results) ? state.results : [];
  const nowMs = Number(state.nowMs) || Date.now();
  if (!results.length) {
    return `
      <h2 class="mnyra-go-page__lead">${esc(texts.emptyTitle)}</h2>
      <p class="mnyra-go-page__hint">${esc(texts.emptySubtitle)}</p>
      <button type="button" class="mnyra-go-page__cta mnyra-go-page__cta--quiet" data-go-back>
        ${goIcon("arrow-left")}${esc(texts.back)}
      </button>
    `;
  }
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

function renderErrorBody(state = {}, texts = TEXTS) {
  const message = String(state.error || "").trim() || texts.errorTitle;
  return `
    <h2 class="mnyra-go-page__lead">${esc(message)}</h2>
    ${Array.isArray(state.alternatives) && state.alternatives.length ? `
      <p class="mnyra-go-page__hint">${state.alternatives.length} ${esc(texts.alternatives)}</p>
      ${state.alternatives.map((result) => renderResultCard(result, { texts, nowMs: state.nowMs })).join("")}
    ` : `
      <button type="button" class="mnyra-go-page__cta" data-go-retry>
        ${goIcon("rotate-ccw")}${esc(texts.errorRetry)}
      </button>
    `}
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
  return `
    <div class="mnyra-go-page__story" data-go-story>
      ${GO_STORY_SLIDES.map((slide, index) => {
        // Das erste Bild steht ganz oben im Bento und ist beim Oeffnen fast
        // immer im Blick - es wartet nicht auf den Scroll.
        const eager = index === 0;
        return `
        <article
          class="mnyra-go-page__story-slide"
          data-go-story-slide="${index}"
          ${shown.includes(index) ? 'data-go-story-in="1"' : ""}
        >
          <figure class="mnyra-go-page__story-media">
            <img
              src="${esc(GO_STORY_BASE + slide.file)}"
              alt="${esc(slide.headline)}"
              width="1600"
              height="900"
              loading="${eager ? "eager" : "lazy"}"
              fetchpriority="${eager ? "high" : "low"}"
              decoding="async"
              onerror="this.remove()"
            />
          </figure>
          <p class="mnyra-go-page__story-text">${storyText(slide.text)}</p>
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
  const isSearch = view === "search";

  let bento = "";
  if (view === "loading") bento = `<div class="mnyra-go-page__empty">${esc(texts.searching)}</div>`;
  else if (view === "results") bento = renderResultsBody(state, texts);
  else if (view === "booking") bento = renderBookingBody(state, texts);
  else if (view === "error") bento = renderErrorBody(state, texts);
  else bento = renderExplainer(state);

  return `
    <div class="mnyra-go-page" data-go-page data-go-view="${esc(view)}">
      ${isSearch ? `<div class="mnyra-go-page__top">${renderAskCard(state.form || {}, texts)}</div>` : ""}
      <div class="mnyra-go-page__bento" data-go-bento>${bento}</div>
    </div>
  `;
}

export const GO_PAGE_TEXTS = TEXTS;
export const GO_PAGE_STORY_SLIDES = GO_STORY_SLIDES;
export const GO_PAGE_STORY_BASE = GO_STORY_BASE;
