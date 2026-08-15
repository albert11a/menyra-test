// Mnyra GO - das Modal. Reines String-Rendering.
//
// Es traegt dieselbe Form wie das Posto-Modal des Business-Composers
// (core/composer/business-composer-controller.js): eine weisse Flaeche ueber
// der ganzen Seite, oben eine Zeile, darunter der scrollende Inhalt. Auf dem
// Schreibtisch bleibt die Flaeche in der Mitte stehen.
//
// Die Kopfzeile traegt links den Schriftzug und rechts das Kreuz - sonst
// nichts. Sie ist kein Ort fuer Handlungen: Der eine Knopf, der zaehlt
// ("Shiko ofertat"), steht dort, wo die Fragen aufhoeren, und nirgends sonst.
// Zweimal derselbe Knopf an zwei Enden des Bildes ist keine Bequemlichkeit,
// sondern die Frage, ob es zwei verschiedene sind.
//
// Der Schriftzug ist der der App: "MNYRA" so wie im Header (fett, kursiv, eng)
// und "GO" dicht daneben im Mnyra-Blau - dasselbe Indigo, in dem im Header
// "Social" steht. GO ist damit sichtbar ein Teil von Mnyra und keine fremde
// App im selben Fenster.
//
// Das Suchbild liest sich von oben nach unten als eine Erklaerung:
//
//   1. zwei Zeilen, die sagen, worum es geht (Zbritje ose ofertë)
//   2. Karten, die es in vier Schritten zeigen - waagerecht, zweieinhalb im
//      Bild, wie die Kennzahl-Reihe im Panel
//   3. die Karte mit den Fragen: Sa veta / Çka / Kur / Ku
//   4. was sonst noch gut zu wissen ist
//
// Vier Bilder, mehr nicht:
//
//   search    Sa veta? Çka? Kur?          - zwei Tipps bis zum Ergebnis
//   results   "5 lokale kanë oferta për ju"
//   booking   "U krye"
//   error     "Mnyra GO është përkohësisht i padisponueshëm"
//
// Drei Dinge sind bewusst so und nicht anders:
//
//  1. Vorausgewaehlt ist alles, was vorausgewaehlt sein kann: "Krejt" und
//     "Tani" (Punkt 14).
//  2. Der Knopf heisst "Shiko ofertat", nicht "Anfrage senden" (Punkt 15).
//  3. Zwischen "wird gesendet" und "bestaetigt" wird nie geschummelt: solange
//     der Server nicht geantwortet hat, steht "Po konfirmohet..." da
//     (Punkt 100, 140).
//
// Nach dem Budget wird nicht mehr gefragt. Es war die einzige Frage, die der
// Gast nicht beantworten will, bevor er weiss, was es ueberhaupt gibt - und
// die einzige, deren Antwort ihm Angebote wegnimmt, statt welche zu bringen.

import {
  GO_CATEGORIES,
  GO_PARTY_SIZE_DEFAULT,
  GO_PARTY_SIZE_MAX,
  GO_PARTY_SIZE_MIN,
  GO_WHEN_OPTIONS
} from "../../../../shared/go/go-feature-config.js";
import { goIcon } from "./go-icon-render-utils.js";

export const GO_MODAL_STYLE_ELEMENT_ID = "mnyraGoModalStyles";
export const GO_MODAL_ROOT_ELEMENT_ID = "mnyraGoOverlayRoot";
export const GO_MODAL_SURFACE_COLOR = "#ffffff";

// Dieselbe Flaeche und dieselben Abstaende wie im Composer, dieselben Farben
// wie im Panel (core/dashboard/dashboard-render-utils.js) - GO erfindet keine
// zweite Gestaltung.
export const GO_MODAL_CSS = `
.mnyra-go {
  position: fixed;
  inset: 0;
  /* Wie hoch das Modal wirklich sein darf.
     iOS Safari legt "position: fixed" gegen das LAYOUT-Viewport aus, und das
     ist so hoch wie die Seite OHNE Browserleiste. Steht die Leiste unten im
     Bild - und beim Oeffnen tut sie das immer -, reicht "inset: 0" um genau
     ihre Hoehe unter den sichtbaren Rand. Der Boden des scrollenden Bereichs
     liegt dann hinter der Leiste: Das letzte Stueck Inhalt ist auch am Ende
     des Scrollwegs nicht zu sehen, und kein Scrollen der Welt holt es hervor,
     weil dort schon das Ende ist.
     100svh ist die Hoehe bei AUSGEFAHRENER Leiste - der kleinste Fall. Damit
     steht das Modal immer vollstaendig im Bild. Und weil der Wert sich beim
     Einfahren der Leiste NICHT aendert (anders als 100dvh), waechst der
     Scroll-Container nicht unter dem Finger - genau der Sprung, den die App
     sich an anderer Stelle schon eingefangen hat (siehe die Notiz zu
     --viewport-height in index.html).
     Faehrt die Leiste ein, bleibt unter dem Modal ein Streifen frei. Er faellt
     nicht auf: Der Grund des Dokuments traegt, solange ein Modal offen ist,
     dessen eigene Farbe (--active-modal-surface, gesetzt von
     syncModalOpenUiStateCore) - also weiss auf weiss.
     Die 100% davor sind der Rueckfall fuer alles, was svh nicht kennt; dort
     bleibt es bei der Hoehe des Layout-Viewports, also beim Stand von vorher. */
  height: 100%;
  height: 100svh;
  z-index: 90;
  --go-ink: #0f172a;
  --go-ink-2: #475569;
  --go-muted: #94a3b8;
  --go-line: rgba(15, 23, 42, 0.08);
  /* Die sichtbare Kante der hellen Karten - dieselbe, die im Panel die Karten
     im Bento traegt (slate-200). Die Haarlinie allein waere auf Weiss zu
     leise. */
  --go-outline: #e2e8f0;
  --go-plane: #f8fafc;
  /* Das Mnyra-Blau. Genau das Indigo, in dem im Header "Social" steht. */
  --go-accent: #4f46e5;
  --go-accent-soft: #eef2ff;
  --modal-surface: #ffffff;
  background: #ffffff;
  color: var(--go-ink);
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.mnyra-go * { box-sizing: border-box; }
.mnyra-go svg { display: block; }
.mnyra-go__sheet {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  padding-top: var(--safe-area-top, 0px);
  padding-left: var(--safe-area-left, 0px);
  padding-right: var(--safe-area-right, 0px);
  overflow: hidden;
}
.mnyra-go__head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--go-line);
  background: #ffffff;
}
/* Der Schriftzug: "MNYRA" wie im Header der App, "GO" dicht daneben im Blau.
   align-items: baseline haelt beide auf einer Grundlinie, auch wenn das "GO"
   eine Spur kleiner steht. */
.mnyra-go__brand {
  display: flex;
  align-items: baseline;
  gap: 3px;
  min-width: 0;
}
.mnyra-go__brand-word {
  font-size: 22px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.05em;
  line-height: 1;
  color: var(--go-ink);
}
.mnyra-go__brand-go {
  font-size: 20px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--go-accent);
}
.mnyra-go__x {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  border: none;
  border-radius: 14px;
  background: var(--go-plane);
  color: var(--go-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.mnyra-go__x svg { width: 19px; height: 19px; }
.mnyra-go__x:active { transform: scale(0.94); }
.mnyra-go__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 18px 16px calc(var(--safe-area-bottom, 0px) + 32px);
}
/* Im Suchbild uebernimmt das Bento den Abschluss nach unten: es laeuft bis an
   die Unterkante der Flaeche, und sein eigenes Polster traegt den sicheren
   Bereich. Ein zweites Polster hier waere ein weisser Streifen unter dem
   Bento - genau die Kante, die unten nicht sein soll. */
.mnyra-go__body--search { padding-bottom: 0; }
/* Die beiden Zeilen ganz oben. Sie sagen in einem Atemzug, was GO ist: nicht
   eine Suche nach Lokalen, sondern ein Angebot, das von den Lokalen kommt. */
.mnyra-go__lead {
  margin: 0;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.15;
}
.mnyra-go__lead em { font-style: normal; color: var(--go-accent); }
.mnyra-go__lead-sub {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--go-ink-2);
}
/* Die Reihe der Erklaerkarten. Machart wie die Kennzahl-Reihe im Panel: sie
   laeuft bis an beide Bildschirmraender, faengt aber links dort an, wo alles
   andere anfaengt. Die negative Marge ist genau das Seitenpolster des Koerpers
   (16px), das Polster darin schiebt die erste Karte wieder in die Flucht. */
.mnyra-go__how {
  margin: 18px -16px 0;
  padding: 0 16px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 16px;
  overscroll-behavior-x: contain;
  /* "manipulation" statt "pan-x": der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen hier verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mnyra-go__how::-webkit-scrollbar { display: none; }
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+16px Polster), abzueglich der beiden
   Luecken zwischen den drei angeschnittenen Karten. */
.mnyra-go__how-card {
  flex: 0 0 calc((100% + 16px - 20px) / 2.5);
  min-height: 168px;
  display: flex;
  flex-direction: column;
  padding: 14px;
  border: 1px solid var(--go-outline);
  border-radius: 20px;
  background: #ffffff;
  scroll-snap-align: start;
  text-align: left;
}
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.mnyra-go__how-tail { flex: 0 0 6px; }
.mnyra-go__how-plate {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 13px;
  background: var(--go-accent-soft);
  color: var(--go-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-go__how-plate svg { width: 19px; height: 19px; }
.mnyra-go__how-step {
  margin: 12px 0 0;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--go-muted);
}
.mnyra-go__how-title {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--go-ink);
}
.mnyra-go__how-text {
  margin: 6px 0 0;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--go-ink-2);
}
/* Die Karte mit den Fragen. Sie ist der Grund, warum das Modal offen ist -
   deshalb steht sie ganz oben, als einzige Flaeche, die sich vom Grund abhebt.
   Der Schatten macht diese Abhebung: die Karte liegt auf der Seite, sie ist
   nicht in sie hineingezeichnet. Zwei Schatten uebereinander - ein weiter,
   weicher fuer die Hoehe, ein enger, dunklerer direkt an der Kante, damit sie
   nicht ausfranst. */
.mnyra-go__ask {
  margin-top: 4px;
  padding: 18px 16px;
  border: 1px solid var(--go-line);
  border-radius: 26px;
  background: #ffffff;
  box-shadow:
    0 22px 44px -26px rgba(15, 23, 42, 0.42),
    0 3px 10px -5px rgba(15, 23, 42, 0.12);
}
/* Der Kopf der Karte: der Weg zurueck, die Nummer des Schrittes und der
   Balken darunter. Wer nur eine Frage sieht, muss sehen koennen, wie viele
   noch kommen - sonst ist jede Frage die letzte, die er beantwortet. */
.mnyra-go__ask-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.mnyra-go__ask-back {
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
.mnyra-go__ask-back svg { width: 16px; height: 16px; }
.mnyra-go__ask-back:active { transform: scale(0.94); }
.mnyra-go__ask-meta { flex: 1; min-width: 0; }
.mnyra-go__ask-count {
  margin: 0;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--go-muted);
}
.mnyra-go__ask-bar {
  margin-top: 7px;
  height: 4px;
  border-radius: 999px;
  background: var(--go-plane);
  overflow: hidden;
}
.mnyra-go__ask-bar span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--go-accent);
  transition: width 0.25s ease;
}
/* Was schon beantwortet ist, schrumpft auf ein Wort - und bleibt anfassbar.
   Eine Antwort, die man nicht mehr aendern kann, ohne von vorn anzufangen,
   ist eine Falle. */
.mnyra-go__ask-done {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}
.mnyra-go__ask-tag {
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
.mnyra-go__ask-tag svg { width: 13px; height: 13px; color: var(--go-muted); }
.mnyra-go__ask-tag:active { transform: scale(0.96); }
/* Das Bento unter der Karte. Machart des Panels: eine Flaeche, die an den
   Raendern der Seite anfaengt, nur oben gerundet ist und bis ans Ende
   weiterlaeuft - Kante, Rundung und ein nach oben gedrehter Schatten sagen,
   dass hier etwas Neues beginnt.
   Sie ist WEISS, nicht getoent. Eine getoente Flaeche, die bis unter den
   sicheren Bereich laeuft, gibt genau den eingefaerbten Streifen am unteren
   Rand, den es hier nicht geben darf: die Leiste des Browsers traegt die
   Farbe des Modals (#ffffff), die Flaeche darunter traege eine andere. */
.mnyra-go__bento {
  margin: 26px -16px 0;
  padding: 26px 16px calc(var(--safe-area-bottom, 0px) + 48px);
  background: #ffffff;
  border-top: 1px solid var(--go-outline);
  border-radius: 34px 34px 0 0;
  box-shadow: 0 -16px 32px -20px rgba(15, 23, 42, 0.16);
}
.mnyra-go__bento .mnyra-go__how { margin-top: 20px; }
.mnyra-go__bento .mnyra-go__info { margin-top: 30px; }
.mnyra-go__q {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: var(--go-ink);
}
.mnyra-go__q--sub { margin-top: 24px; }
.mnyra-go__q svg { width: 16px; height: 16px; color: var(--go-muted); flex: 0 0 auto; }
/* Der Regler fuer die Gruppengroesse. Die Zahl steht gross darueber, damit
   waehrend des Ziehens ablesbar bleibt, wo man ist - der Daumen liegt auf dem
   Griff und verdeckt ihn. */
.mnyra-go__party-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--go-ink);
  font-variant-numeric: tabular-nums;
}
.mnyra-go__party-value span {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  color: var(--go-muted);
}
.mnyra-go__range {
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
.mnyra-go__range:focus { outline: none; }
.mnyra-go__range::-webkit-slider-runnable-track {
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
.mnyra-go__range::-webkit-slider-thumb {
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
.mnyra-go__range::-moz-range-track { height: 10px; border-radius: 999px; background: var(--go-plane); }
.mnyra-go__range::-moz-range-progress { height: 10px; border-radius: 999px; background: var(--go-accent); }
.mnyra-go__range::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border: 3px solid var(--go-accent);
  border-radius: 999px;
  background: #ffffff;
}
.mnyra-go__range-scale {
  display: flex;
  justify-content: space-between;
  margin-top: -2px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: var(--go-muted);
}
/* Die Auswahlflaechen sind Pillen, keine Dropdowns - GO wird mit dem Daumen
   bedient, und 44px sind die kleinste Flaeche, die sicher zu treffen ist
   (Punkt 143). Zwei Spalten: so ist jede Flaeche breit genug fuer Symbol und
   Wort, und keine Zeile bricht ungleich um. */
.mnyra-go__chips {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.mnyra-go__chip {
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
.mnyra-go__chip svg { width: 17px; height: 17px; flex: 0 0 auto; color: var(--go-muted); }
.mnyra-go__chip[aria-pressed="true"] {
  background: var(--go-ink);
  border-color: var(--go-ink);
  color: #ffffff;
}
.mnyra-go__chip[aria-pressed="true"] svg { color: #ffffff; }
.mnyra-go__chip:active { transform: scale(0.97); }
.mnyra-go__chip--wide { grid-column: 1 / -1; }
.mnyra-go__field {
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
.mnyra-go__field-label {
  margin: 14px 0 0;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--go-muted);
}
/* Der Ort. Er ist keine Frage mit Auswahl, sondern eine Feststellung mit
   einem Weg daneben - deshalb eine Zeile und keine Pillen. */
.mnyra-go__place {
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  background: var(--go-plane);
}
.mnyra-go__place-ic {
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
.mnyra-go__place-ic svg { width: 17px; height: 17px; }
.mnyra-go__place-body { flex: 1; min-width: 0; }
.mnyra-go__place-label {
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
.mnyra-go__place-city {
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--go-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-go__place-change {
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
.mnyra-go__place-change svg { width: 13px; height: 13px; }
.mnyra-go__place-change--save { background: var(--go-ink); color: #ffffff; }
.mnyra-go__cta {
  width: 100%;
  min-height: 54px;
  margin-top: 22px;
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
.mnyra-go__cta svg { width: 17px; height: 17px; }
.mnyra-go__cta--quiet { background: var(--go-plane); color: var(--go-ink-2); }
.mnyra-go__cta:disabled { opacity: 0.6; cursor: not-allowed; }
.mnyra-go__cta:not(:disabled):active { transform: scale(0.99); }
.mnyra-go__hint { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__note {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #fffbeb;
  color: #b45309;
  font-size: 13px;
  font-weight: 700;
}
/* Was sonst noch gut zu wissen ist. Es steht unter den Fragen, nicht darueber:
   wer schon weiss, was er will, soll nicht erst daran vorbei. */
.mnyra-go__info { margin-top: 26px; }
.mnyra-go__info-title {
  margin: 0 0 12px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--go-muted);
}
.mnyra-go__info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 0;
  border-top: 1px solid var(--go-line);
}
.mnyra-go__info-row:last-child { border-bottom: 1px solid var(--go-line); }
.mnyra-go__info-ic {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 11px;
  background: var(--go-plane);
  color: var(--go-ink-2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-go__info-ic svg { width: 16px; height: 16px; }
.mnyra-go__info-title-row {
  margin: 0;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--go-ink);
}
.mnyra-go__info-text {
  margin: 3px 0 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--go-ink-2);
}
/* Die Ergebniskarte. Sie darf nicht aussehen wie eine gewoehnliche Oferta:
   oben steht, WER anbietet, darunter, was DIESER Gruppe angeboten wird
   (Punkt 19). */
.mnyra-go__card {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--go-outline);
  border-radius: 26px;
  background: #ffffff;
}
.mnyra-go__card-head { display: flex; align-items: center; gap: 10px; }
.mnyra-go__card-logo { width: 40px; height: 40px; border-radius: 14px; object-fit: cover; background: var(--go-plane); flex: 0 0 auto; }
.mnyra-go__card-logo--empty { color: var(--go-muted); display: flex; align-items: center; justify-content: center; }
.mnyra-go__card-logo--empty svg { width: 18px; height: 18px; }
.mnyra-go__card-names { min-width: 0; }
.mnyra-go__card-who { margin: 0; min-width: 0; font-size: 13px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-go__card-who span { color: var(--go-muted); font-weight: 700; }
.mnyra-go__card-sponsored { margin: 2px 0 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted); }
.mnyra-go__card-benefit { margin: 12px 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go__card-for { margin: 2px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__card-meta { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; font-weight: 700; color: var(--go-ink-2); }
.mnyra-go__card-meta span { display: inline-flex; align-items: center; gap: 5px; }
.mnyra-go__card-meta svg { width: 14px; height: 14px; color: var(--go-muted); }
/* "Vetëm me Mnyra GO" ist eine Nebenzeile, aber sie soll lesbar sein: das
   frühere #cbd5e1 stand auf Weiss praktisch nicht mehr da. */
.mnyra-go__card-only { margin: 12px 0 0; display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted); }
.mnyra-go__card-only svg { width: 12px; height: 12px; }
/* Eine Zeile, nicht zwei: ohne flex faellt das Symbol unter das Wort, weil
   jedes SVG in diesem Modal ein Block ist. */
.mnyra-go__done { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go__done svg { width: 24px; height: 24px; flex: 0 0 auto; color: var(--go-accent); }
.mnyra-go__done-name { margin: 16px 0 0; font-size: 19px; font-weight: 900; letter-spacing: -0.02em; }
.mnyra-go__ok {
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
.mnyra-go__ok svg { width: 17px; height: 17px; flex: 0 0 auto; }
.mnyra-go__code {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--go-plane);
}
.mnyra-go__code-label { margin: 0; display: flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted); }
.mnyra-go__code-label svg { width: 12px; height: 12px; }
.mnyra-go__code-value { margin: 4px 0 0; font-size: 26px; font-weight: 900; letter-spacing: 0.3em; }
.mnyra-go__row { margin-top: 16px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.mnyra-go__row .mnyra-go__cta { margin-top: 0; min-height: 48px; font-size: 13px; }
.mnyra-go__ghost {
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
.mnyra-go__ghost svg { width: 14px; height: 14px; }
.mnyra-go__empty { padding: 32px 0; text-align: center; font-size: 14px; font-weight: 900; color: var(--go-muted); }
@media (min-width: 768px) {
  .mnyra-go__sheet { max-width: 560px; margin: 0 auto; }
}
@media (prefers-reduced-motion: reduce) {
  .mnyra-go__chip, .mnyra-go__x, .mnyra-go__cta { transition: none; }
}
`;

const TEXTS = Object.freeze({
  brand: "Mnyra GO",
  brandWord: "MNYRA",
  brandGo: "GO",
  close: "Mbyll",
  // Die zwei Zeilen ganz oben. Sie sagen die Richtung: das Angebot kommt vom
  // Lokal zum Gast, nicht umgekehrt.
  leadTitle: "Zbritje ose ofertë nga lokalet përreth teje",
  leadBody: "Ti thua vetëm sa veta jeni, çka doni dhe kur. Lokalet të kthejnë ofertën e tyre.",
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
  // Kurz, weil die Zeile daneben noch den Namen und den Knopf traegt - dass es
  // um die Lokale rund um den Gast geht, steht schon in der Ueberschrift.
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
  back: "Ndrysho kërkimin",
  infoTitle: "Mirë të dihet"
});

// Die vier Schritte. Sie stehen als Daten da und nicht als vier Bloecke im
// Markup: so ist eine Aenderung am Text eine Zeile und kein Umbau.
const HOW_CARDS = Object.freeze([
  Object.freeze({
    icon: "users",
    step: "1",
    title: "Thuaj sa veta jeni",
    text: "Sa veta, çka doni dhe kur. Zgjat më pak se 10 sekonda."
  }),
  Object.freeze({
    icon: "badge-percent",
    step: "2",
    title: "Lokalet të bëjnë ofertë",
    text: "Lokalet përreth teje kthejnë zbritje ose diçka falas, vetëm për grupin tënd."
  }),
  Object.freeze({
    icon: "check-check",
    step: "3",
    title: "Zgjedh njërën",
    text: "E pranon ofertën me një prekje. Tavolina të mbetet e ruajtur."
  }),
  Object.freeze({
    icon: "party-popper",
    step: "4",
    title: "Shko dhe shijo",
    text: "Tregon kodin te lokali dhe oferta vlen aty për aty."
  })
]);

const INFO_ROWS = Object.freeze([
  Object.freeze({
    icon: "gift",
    title: "Falas për ty",
    text: "Mnyra GO nuk kushton asgjë. Paguan vetëm atë që konsumon te lokali."
  }),
  Object.freeze({
    icon: "shield-check",
    title: "Pa llogari",
    text: "Nuk të duhet regjistrim. Kërkon, pranon ofertën dhe shkon."
  }),
  Object.freeze({
    icon: "ticket-percent",
    title: "Vetëm me Mnyra GO",
    text: "Këto oferta nuk janë në menu e as në rrjete sociale."
  }),
  Object.freeze({
    icon: "store",
    title: "Lokalet vendosin vetë",
    text: "Çdo lokal zgjedh çka ofron, për sa veta dhe në cilat orë."
  })
]);

// Ein Symbol je Zeitpunkt - der Blitz fuer "jetzt", die Uhr fuer die Stunde
// danach, der Kalender fuer alles Weitere.
const WHEN_ICONS = Object.freeze({
  now: "zap",
  in30: "timer",
  in60: "clock",
  later: "calendar-clock"
});

/**
 * Die vier Schritte der Suche, in ihrer Reihenfolge.
 *
 * Sie stehen hier und nicht im Controller: Die Reihenfolge ist eine Frage der
 * Oberflaeche - was der Server braucht, ist am Ende dasselbe Buendel, egal in
 * welcher Reihenfolge es zusammengekommen ist.
 */
export const GO_STEPS = Object.freeze(["party", "category", "when", "place"]);

const STEP_ICONS = Object.freeze({
  party: "users",
  category: "utensils",
  when: "clock",
  place: "map-pin"
});

/**
 * Auf einen gueltigen Schritt bringen. Ein unbekannter Wert - aus einer alten
 * Sitzung, aus einem Tippfehler - faengt vorne an, statt ins Leere zu zeigen.
 */
export function resolveGoStep(value = "") {
  const step = String(value || "").trim();
  return GO_STEPS.includes(step) ? step : GO_STEPS[0];
}

/**
 * Der Schritt nach diesem - oder derselbe, wenn es der letzte ist.
 */
export function nextGoStep(value = "") {
  const index = GO_STEPS.indexOf(resolveGoStep(value));
  return GO_STEPS[Math.min(GO_STEPS.length - 1, index + 1)];
}

/**
 * Der Schritt davor - oder derselbe, wenn es der erste ist.
 */
export function previousGoStep(value = "") {
  const index = GO_STEPS.indexOf(resolveGoStep(value));
  return GO_STEPS[Math.max(0, index - 1)];
}

function esc(value = "") {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Die Gruppengroesse auf einen gueltigen Wert bringen.
 *
 * Der Regler kann nichts anderes liefern - aber der Zustand kommt auch aus
 * dem Browser-Speicher und aus einer alten Sitzung zurueck.
 */
export function clampGoPartySize(value) {
  const size = Math.trunc(Number(value));
  if (!Number.isFinite(size)) return GO_PARTY_SIZE_DEFAULT;
  return Math.min(GO_PARTY_SIZE_MAX, Math.max(GO_PARTY_SIZE_MIN, size));
}

/**
 * Das Wort hinter der Zahl: "person" fuer eine, "veta" fuer mehrere.
 */
export function goPartyWord(value, texts = TEXTS) {
  return clampGoPartySize(value) === 1
    ? (texts.partyOne || TEXTS.partyOne)
    : (texts.partyMany || TEXTS.partyMany);
}

/**
 * "1 person" oder "4 veta" - albanisch zaehlt hier anders als deutsch.
 */
export function goPartyLabel(value, texts = TEXTS) {
  return `${clampGoPartySize(value)} ${goPartyWord(value, texts)}`;
}

/**
 * Wie weit der Regler gefuellt ist. Der Wert faerbt die Schiene links vom
 * Griff - ein Regler ohne Fuellung sagt nicht, ob man am Anfang oder am Ende
 * steht.
 */
export function goPartyFillPercent(value) {
  const size = clampGoPartySize(value);
  const span = GO_PARTY_SIZE_MAX - GO_PARTY_SIZE_MIN;
  if (span <= 0) return 0;
  return Math.round(((size - GO_PARTY_SIZE_MIN) / span) * 100);
}

function chip(label, { active = false, attr = "", value = "", iconName = "", wide = false } = {}) {
  // aria-pressed traegt die Auswahl zusaetzlich zur Farbe - Farbe allein ist
  // fuer manche Menschen keine Information (Punkt 142).
  return `
    <button
      type="button"
      class="mnyra-go__chip${wide ? " mnyra-go__chip--wide" : ""}"
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

function renderHowRow() {
  return `
    <div class="mnyra-go__how" data-go-how>
      ${HOW_CARDS.map((card) => `
        <article class="mnyra-go__how-card">
          <span class="mnyra-go__how-plate">${goIcon(card.icon)}</span>
          <p class="mnyra-go__how-step">${esc(card.step)}</p>
          <p class="mnyra-go__how-title">${esc(card.title)}</p>
          <p class="mnyra-go__how-text">${esc(card.text)}</p>
        </article>
      `).join("")}
      <span class="mnyra-go__how-tail" aria-hidden="true"></span>
    </div>
  `;
}

function renderInfoRows(texts = TEXTS) {
  return `
    <section class="mnyra-go__info">
      <h3 class="mnyra-go__info-title">${esc(texts.infoTitle)}</h3>
      ${INFO_ROWS.map((row) => `
        <div class="mnyra-go__info-row">
          <span class="mnyra-go__info-ic">${goIcon(row.icon)}</span>
          <div>
            <p class="mnyra-go__info-title-row">${esc(row.title)}</p>
            <p class="mnyra-go__info-text">${esc(row.text)}</p>
          </div>
        </div>
      `).join("")}
    </section>
  `;
}

function renderPlaceRow(form = {}, texts = TEXTS) {
  const city = String(form.city || "").trim();
  if (form.editCity) {
    return `
      <div class="mnyra-go__place">
        <span class="mnyra-go__place-ic">${goIcon("map-pin")}</span>
        <span class="mnyra-go__place-body">
          <input
            type="text"
            class="mnyra-go__field"
            style="margin-top:0;"
            data-go-city-input
            value="${esc(city)}"
            placeholder="${esc(texts.cityPlaceholder)}"
            aria-label="${esc(texts.placeQuestion)}"
            autocomplete="address-level2"
            enterkeyhint="done"
          />
        </span>
        <button type="button" class="mnyra-go__place-change mnyra-go__place-change--save" data-go-city-save>
          ${esc(texts.locationSave)}
        </button>
      </div>
    `;
  }
  return `
    <div class="mnyra-go__place">
      <span class="mnyra-go__place-ic">${goIcon("map-pin")}</span>
      <span class="mnyra-go__place-body">
        <span class="mnyra-go__place-label">${esc(texts.placeLabel)}</span>
        <p class="mnyra-go__place-city">${esc(city || texts.placeEmpty)}</p>
      </span>
      <button type="button" class="mnyra-go__place-change" data-go-change-city>
        ${goIcon("pencil")}${esc(texts.locationChange)}
      </button>
    </div>
  `;
}

// Die Antwort eines erledigten Schrittes in einem Wort - das, was auf dem
// Merkzettel darueber steht.
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
    <div class="mnyra-go__ask-done">
      ${answered.map((key) => `
        <button type="button" class="mnyra-go__ask-tag" data-go-goto="${esc(key)}">
          ${goIcon(STEP_ICONS[key] || "check-check")}<span>${esc(stepAnswerLabel(key, form, texts))}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderPartyStep(form = {}, texts = TEXTS) {
  const partySize = clampGoPartySize(form.partySize);
  return `
    <output class="mnyra-go__party-value" data-go-party-value for="mnyraGoParty">
      ${esc(String(partySize))} <span>${esc(goPartyWord(partySize, texts))}</span>
    </output>
    <input
      id="mnyraGoParty"
      type="range"
      class="mnyra-go__range"
      data-go-party-range
      min="${GO_PARTY_SIZE_MIN}"
      max="${GO_PARTY_SIZE_MAX}"
      step="1"
      value="${partySize}"
      style="--go-range-fill:${goPartyFillPercent(partySize)}%;"
      aria-label="${esc(texts.partyQuestion)}"
      aria-valuetext="${esc(goPartyLabel(partySize, texts))}"
    />
    <div class="mnyra-go__range-scale" aria-hidden="true">
      <span>${GO_PARTY_SIZE_MIN}</span>
      <span>${GO_PARTY_SIZE_MAX}</span>
    </div>
  `;
}

function renderCategoryStep(form = {}, texts = TEXTS) {
  const category = String(form.category || "all");
  return `
    <div class="mnyra-go__chips" role="group" aria-label="${esc(texts.categoryQuestion)}">
      ${GO_CATEGORIES.map((entry, index) => chip(entry.label, {
        active: category === entry.key,
        attr: "data-go-category",
        value: entry.key,
        iconName: entry.icon,
        // "Krejt" ist die Voreinstellung und passt auf alles - es steht
        // deshalb allein in der ersten Zeile, nicht als eine von zweien.
        wide: index === 0
      })).join("")}
    </div>
  `;
}

function renderWhenStep(form = {}, texts = TEXTS) {
  const when = String(form.when || "now");
  return `
    <div class="mnyra-go__chips" role="group" aria-label="${esc(texts.whenQuestion)}">
      ${GO_WHEN_OPTIONS.map((entry) => chip(entry.label, {
        active: when === entry.key,
        attr: "data-go-when",
        value: entry.key,
        iconName: WHEN_ICONS[entry.key] || "clock"
      })).join("")}
    </div>
    ${when === "later" ? `
      <p class="mnyra-go__field-label">${esc(texts.whenLaterLabel)}</p>
      <input
        type="datetime-local"
        class="mnyra-go__field"
        data-go-when-input
        value="${esc(form.laterValue || "")}"
        aria-label="${esc(texts.whenLaterLabel)}"
      />
    ` : ""}
  `;
}

// Eine Frage im Bild, nicht vier.
//
// Vier Fragen untereinander sind ein Formular, und ein Formular beantwortet
// man nicht im Stehen vor einem Lokal. Jeder Schritt zeigt genau eine Frage,
// darueber den Balken mit der Nummer und die schon gegebenen Antworten als
// anfassbare Woerter - wer sich vertippt hat, ist mit einem Tipp zurueck.
//
// Weitergeschaltet wird dort, wo die Antwort eindeutig fertig ist: eine
// angetippte Pille IST die Antwort, also geht es sofort weiter. Ein Regler ist
// nie "fertig" - der Finger koennte noch einmal ziehen -, deshalb hat der
// erste Schritt einen Knopf. Und "Më vonë" braucht erst noch die Uhrzeit.
function renderAskCard(form = {}, texts = TEXTS) {
  const step = resolveGoStep(form.step);
  const index = GO_STEPS.indexOf(step);
  const total = GO_STEPS.length;
  const percent = Math.round(((index + 1) / total) * 100);

  let control = "";
  let question = "";
  let iconName = "users";
  let cta = "";

  if (step === "party") {
    question = texts.partyQuestion;
    iconName = "users";
    control = renderPartyStep(form, texts);
    cta = `<button type="button" class="mnyra-go__cta" data-go-step-next>${esc(texts.next)}${goIcon("chevron-right")}</button>`;
  } else if (step === "category") {
    question = texts.categoryQuestion;
    iconName = "utensils";
    control = renderCategoryStep(form, texts);
  } else if (step === "when") {
    question = texts.whenQuestion;
    iconName = "clock";
    control = renderWhenStep(form, texts);
    if (String(form.when || "now") === "later") {
      cta = `<button type="button" class="mnyra-go__cta" data-go-step-next>${esc(texts.next)}${goIcon("chevron-right")}</button>`;
    }
  } else {
    question = texts.placeQuestion;
    iconName = "map-pin";
    control = renderPlaceRow(form, texts);
    cta = `<button type="button" class="mnyra-go__cta" data-go-submit>${goIcon("search")}${esc(texts.submit)}</button>`;
  }

  return `
    <section class="mnyra-go__ask" data-go-step="${esc(step)}">
      <header class="mnyra-go__ask-head">
        ${index > 0
          ? `<button type="button" class="mnyra-go__ask-back" data-go-step-back aria-label="${esc(texts.stepBack)}" title="${esc(texts.stepBack)}">${goIcon("arrow-left")}</button>`
          : ""}
        <div class="mnyra-go__ask-meta">
          <p class="mnyra-go__ask-count">${esc(texts.step)} ${index + 1}/${total}</p>
          <div class="mnyra-go__ask-bar" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${index + 1}">
            <span style="width:${percent}%;"></span>
          </div>
        </div>
      </header>

      ${renderAnsweredTags(step, form, texts)}

      <h2 class="mnyra-go__q">${goIcon(iconName)}${esc(question)}</h2>
      ${control}
      ${cta}
    </section>
  `;
}

function renderSearchBody(form = {}, texts = TEXTS) {
  // Oben die Frage, unten die Erklaerung. Wer GO schon kennt, faengt sofort
  // an; wer es nicht kennt, scrollt einmal und weiss Bescheid. Andersherum
  // muesste JEDER erst an der Erklaerung vorbei.
  return `
    <div data-go-view="search">
      ${renderAskCard(form, texts)}

      <section class="mnyra-go__bento">
        <h2 class="mnyra-go__lead">${esc(texts.leadTitle)}</h2>
        <p class="mnyra-go__lead-sub">${esc(texts.leadBody)}</p>
        ${renderHowRow()}
        ${renderInfoRows(texts)}
      </section>
    </div>
  `;
}

function renderResultCard(result = {}, { texts = TEXTS, busyOfferId = "", nowMs = Date.now() } = {}) {
  const isBusy = busyOfferId && busyOfferId === result.offerId;
  const distance = Number.isFinite(Number(result.distanceKm)) && result.distanceKm !== null
    ? `${Number(result.distanceKm).toFixed(1)} km`
    : "";
  const arrival = result.isNow ? texts.now : arrivalLabel(result.expectedArrivalAt, { nowMs });

  return `
    <article class="mnyra-go__card" data-go-result="${esc(result.offerId)}">
      <div class="mnyra-go__card-head">
        ${result.logoUrl
          ? `<img class="mnyra-go__card-logo" src="${esc(result.logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`
          : `<div class="mnyra-go__card-logo mnyra-go__card-logo--empty">${goIcon("store")}</div>`}
        <div class="mnyra-go__card-names">
          <p class="mnyra-go__card-who">${esc(result.businessName)} <span>${esc(texts.offering)}</span></p>
          ${result.sponsored ? `<p class="mnyra-go__card-sponsored">${esc(texts.sponsored)}</p>` : ""}
        </div>
      </div>

      <p class="mnyra-go__card-benefit">${esc(result.benefitLabel)}</p>
      <p class="mnyra-go__card-for">${esc(texts.forGroup)}</p>

      <div class="mnyra-go__card-meta">
        <span>${goIcon("users")}${esc(`${result.partySize} ${texts.peopleSuffix}`)}</span>
        ${arrival ? `<span>${goIcon("clock")}${esc(arrival)}</span>` : ""}
        ${distance ? `<span>${goIcon("map-pin")}${esc(distance)}</span>` : ""}
        ${result.bookingType === "reservation" ? `<span>${goIcon("armchair")}${esc(texts.tableIncluded)}</span>` : ""}
      </div>

      <p class="mnyra-go__card-only">${goIcon("ticket-percent")}${esc(texts.onlyGo)}</p>

      <button
        type="button"
        class="mnyra-go__cta"
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
    // Keine Sackgasse: Wenn nichts passt, steht darunter, was zu tun ist
    // (Punkt 118).
    return `
      <div data-go-view="results">
        <h2 class="mnyra-go__lead">${esc(texts.emptyTitle)}</h2>
        <p class="mnyra-go__hint">${esc(texts.emptySubtitle)}</p>
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-back>
          ${goIcon("arrow-left")}${esc(texts.back)}
        </button>
      </div>
    `;
  }
  return `
    <div data-go-view="results">
      <h2 class="mnyra-go__lead">${results.length} ${esc(texts.resultsHeadline)}</h2>
      ${state.notice ? `<p class="mnyra-go__note">${esc(state.notice)}</p>` : ""}
      ${results.map((result) => renderResultCard(result, {
        texts,
        busyOfferId: state.busyOfferId,
        nowMs
      })).join("")}
      <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-back>
        ${goIcon("arrow-left")}${esc(texts.back)}
      </button>
    </div>
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
      <div data-go-view="booking">
        <h2 class="mnyra-go__lead">${esc(texts.cancelConfirm)}</h2>
        <div class="mnyra-go__row">
          <button type="button" class="mnyra-go__cta" data-go-cancel-confirm>
            ${goIcon("ban")}${esc(texts.cancelYes)}
          </button>
          <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-cancel-dismiss>${esc(texts.cancelNo)}</button>
        </div>
      </div>
    `;
  }

  return `
    <div data-go-view="booking">
      <p class="mnyra-go__done">${esc(texts.doneTitle)} ${goIcon("party-popper")}</p>
      <p class="mnyra-go__done-name">${esc(booking.businessName || "")}</p>
      <p class="mnyra-go__card-for">${esc(booking.benefitLabel || "")}</p>

      <div class="mnyra-go__card-meta">
        <span>${goIcon("users")}${esc(`${booking.partySize || 1} ${texts.peopleSuffix}`)}</span>
        ${arrival ? `<span>${goIcon("clock")}${esc(arrival)}</span>` : ""}
        ${booking.city ? `<span>${goIcon("map-pin")}${esc(booking.city)}</span>` : ""}
      </div>

      <p class="mnyra-go__ok">${goIcon("circle-check-big")}${esc(statusLine)}</p>

      ${booking.shortCode ? `
        <div class="mnyra-go__code">
          <p class="mnyra-go__code-label">${goIcon("hash")}${esc(texts.code)}</p>
          <p class="mnyra-go__code-value">${esc(booking.shortCode)}</p>
        </div>
      ` : ""}

      <div class="mnyra-go__row">
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-menu>
          ${goIcon("book-open")}${esc(texts.menu)}
        </button>
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-directions>
          ${goIcon("navigation")}${esc(texts.directions)}
        </button>
      </div>

      ${state.canSignIn ? `
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-signin>
          ${goIcon("log-in")}${esc(texts.saveToAccount)} · ${esc(texts.signIn)}
        </button>
      ` : ""}

      <button type="button" class="mnyra-go__ghost" data-go-cancel>${esc(texts.cancel)}</button>
    </div>
  `;
}

function renderErrorBody(state = {}, texts = TEXTS) {
  const message = String(state.error || "").trim() || texts.errorTitle;
  return `
    <div data-go-view="error">
      <h2 class="mnyra-go__lead">${esc(message)}</h2>
      ${Array.isArray(state.alternatives) && state.alternatives.length ? `
        <p class="mnyra-go__hint">${state.alternatives.length} ${esc(texts.alternatives)}</p>
        ${state.alternatives.map((result) => renderResultCard(result, { texts, nowMs: state.nowMs })).join("")}
      ` : `
        <button type="button" class="mnyra-go__cta" data-go-retry>
          ${goIcon("rotate-ccw")}${esc(texts.errorRetry)}
        </button>
      `}
    </div>
  `;
}

// Die Kopfzeile: links der Schriftzug, rechts das Kreuz, in der Mitte nichts.
// Kein Titel, der sich je Bild aendert, und keine Handlung - was zu tun ist,
// steht im Inhalt darunter.
function renderHead(texts = TEXTS) {
  return `
    <header class="mnyra-go__head">
      <div class="mnyra-go__brand">
        <span class="mnyra-go__brand-word">${esc(texts.brandWord)}</span><span class="mnyra-go__brand-go">${esc(texts.brandGo)}</span>
      </div>
      <button type="button" class="mnyra-go__x" data-go-close aria-label="${esc(texts.close)}" title="${esc(texts.close)}">${goIcon("x")}</button>
    </header>
  `;
}

/**
 * Der Inhalt des Modals - ohne die aeussere Flaeche.
 *
 * Die Flaeche selbst legt der Runtime-Controller einmal an und laesst sie
 * stehen; hier wird nur ihr Inhalt neu geschrieben. Genau so macht es der
 * Composer auch: Ein Modal, das sich bei jedem Tastendruck komplett neu
 * aufbaut, verliert den Fokus - und auf dem Telefon faellt dabei die Tastatur
 * zu.
 */
export function renderGoModalContentCore(state = {}) {
  const texts = { ...TEXTS, ...(state.texts || {}) };
  const view = String(state.view || "search");

  let body = "";
  let isSearch = false;
  if (view === "loading") body = `<div class="mnyra-go__empty">${esc(texts.searching)}</div>`;
  else if (view === "results") body = renderResultsBody(state, texts);
  else if (view === "booking") body = renderBookingBody(state, texts);
  else if (view === "error") body = renderErrorBody(state, texts);
  else {
    body = renderSearchBody(state.form || {}, texts);
    isSearch = true;
  }

  return `
    <div class="mnyra-go__sheet">
      ${renderHead(texts)}
      <div class="mnyra-go__body${isSearch ? " mnyra-go__body--search" : ""}" data-go-body>${body}</div>
    </div>
  `;
}

/**
 * Das ganze Modal inklusive Flaeche - fuer Tests und fuer Aufrufer, die es
 * als einen Block brauchen.
 *
 * @returns {string} HTML oder "" wenn geschlossen.
 */
export function renderGoModalCore(state = {}) {
  if (!state || !state.open) return "";
  const texts = { ...TEXTS, ...(state.texts || {}) };
  return `
    <div
      class="mnyra-go modal-overlay"
      id="${GO_MODAL_ROOT_ELEMENT_ID}"
      data-go-modal
      data-modal-surface="${GO_MODAL_SURFACE_COLOR}"
      style="--modal-surface:${GO_MODAL_SURFACE_COLOR};"
      role="dialog"
      aria-modal="true"
      aria-label="${esc(texts.brand)}"
    >${renderGoModalContentCore(state)}</div>
  `;
}

export const GO_MODAL_TEXTS = TEXTS;
export const GO_MODAL_HOW_CARDS = HOW_CARDS;
export const GO_MODAL_INFO_ROWS = INFO_ROWS;
