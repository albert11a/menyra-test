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
//   die Karte mit der Frage     eine Frage, nicht vier
//   das Bento                   dieselbe Flaeche wie im Feed-Gate:
//                               #f8fafc, oben 2.5rem gerundet
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

// Die Flaeche des Bentos und ihre Rundung kommen aus dem Feed-Gate
// (core/feed/feed-view-orchestration-controller.js): #f8fafc, oben 2.5rem.
// Sie stehen hier als Marken, damit beide Seiten dieselbe Flaeche haben und
// eine Aenderung nicht an zwei Stellen gesucht werden muss.
export const GO_PAGE_CSS = `
.mnyra-go-page {
  --go-ink: #0f172a;
  --go-ink-2: #475569;
  --go-muted: #94a3b8;
  --go-line: rgba(15, 23, 42, 0.08);
  --go-outline: #e2e8f0;
  --go-plane: #f8fafc;
  /* Das Mnyra-Blau. Genau das Indigo, in dem im Header "Social" steht. */
  --go-accent: #4f46e5;
  --go-accent-soft: #eef2ff;
  --go-bento-surface: #f8fafc;
  --go-bento-radius: 2.5rem;
  background: #ffffff;
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
/* Der weisse Streifen zwischen Kopfzeile und Bento. Er traegt nur die Karte
   mit der Frage. */
.mnyra-go-page__top {
  padding: 4px 16px 26px;
  background: #ffffff;
}
/* Die Karte mit der Frage. Sie ist der Grund, warum die Seite offen ist -
   deshalb liegt sie mit einem Schatten auf der Flaeche und ist nicht in sie
   hineingezeichnet. */
.mnyra-go-page__ask {
  padding: 18px 16px;
  border: 1px solid var(--go-line);
  border-radius: 26px;
  background: #ffffff;
  box-shadow:
    0 22px 44px -26px rgba(15, 23, 42, 0.42),
    0 3px 10px -5px rgba(15, 23, 42, 0.12);
}
.mnyra-go-page__ask-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
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
  margin-bottom: 6px;
  font-size: 30px;
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
/* Das Bento. Dieselbe Flaeche wie im Feed-Gate: #f8fafc, oben 2.5rem
   gerundet, und sie laeuft bis ans Ende der Seite. Deshalb sind auch nur die
   oberen Ecken gerundet. */
.mnyra-go-page__bento {
  flex: 1 1 auto;
  background: var(--go-bento-surface);
  border-top-left-radius: var(--go-bento-radius);
  border-top-right-radius: var(--go-bento-radius);
  padding: 2.35rem 1.25rem 2rem;
}
.mnyra-go-page__lead {
  margin: 0;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.15;
}
.mnyra-go-page__lead-sub {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--go-ink-2);
}
/* Die Reihe der Erklaerkarten: waagerecht, zweieinhalb im Bild - dieselbe
   Machart und dieselbe Rechnung wie die Kennzahl-Reihe im Panel. Die negative
   Marge ist genau das Seitenpolster des Bentos (1.25rem = 20px), das Polster
   darin schiebt die erste Karte wieder in die Flucht. */
.mnyra-go-page__how {
  margin: 20px -1.25rem 0;
  padding: 0 1.25rem;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 1.25rem;
  overscroll-behavior-x: contain;
  /* "manipulation" statt "pan-x": der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mnyra-go-page__how::-webkit-scrollbar { display: none; }
.mnyra-go-page__how-card {
  flex: 0 0 calc((100% + 1.25rem - 20px) / 2.5);
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
.mnyra-go-page__how-tail { flex: 0 0 6px; }
.mnyra-go-page__how-plate {
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
.mnyra-go-page__how-plate svg { width: 19px; height: 19px; }
.mnyra-go-page__how-step {
  margin: 12px 0 0;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--go-muted);
}
.mnyra-go-page__how-title {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--go-ink);
}
.mnyra-go-page__how-text {
  margin: 6px 0 0;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--go-ink-2);
}
.mnyra-go-page__info { margin-top: 30px; }
.mnyra-go-page__info-title {
  margin: 0 0 12px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--go-muted);
}
.mnyra-go-page__info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 0;
  border-top: 1px solid var(--go-line);
}
.mnyra-go-page__info-row:last-child { border-bottom: 1px solid var(--go-line); }
.mnyra-go-page__info-ic {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 11px;
  background: #ffffff;
  color: var(--go-ink-2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-go-page__info-ic svg { width: 16px; height: 16px; }
.mnyra-go-page__info-title-row {
  margin: 0;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--go-ink);
}
.mnyra-go-page__info-text {
  margin: 3px 0 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--go-ink-2);
}
/* Die Ergebniskarte. Sie darf nicht aussehen wie eine gewoehnliche Oferta:
   oben steht, WER anbietet, darunter, was DIESER Gruppe angeboten wird. */
.mnyra-go-page__card {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--go-outline);
  border-radius: 26px;
  background: #ffffff;
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
@media (min-width: 768px) {
  .mnyra-go-page__top { max-width: 560px; margin: 0 auto; width: 100%; }
  .mnyra-go-page__bento > * { max-width: 560px; margin-left: auto; margin-right: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .mnyra-go-page__chip, .mnyra-go-page__cta, .mnyra-go-page__ask-bar span { transition: none; }
}
`;

const TEXTS = Object.freeze({
  brand: "Mnyra GO",
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

function renderHowRow() {
  return `
    <div class="mnyra-go-page__how" data-go-how>
      ${HOW_CARDS.map((card) => `
        <article class="mnyra-go-page__how-card">
          <span class="mnyra-go-page__how-plate">${goIcon(card.icon)}</span>
          <p class="mnyra-go-page__how-step">${esc(card.step)}</p>
          <p class="mnyra-go-page__how-title">${esc(card.title)}</p>
          <p class="mnyra-go-page__how-text">${esc(card.text)}</p>
        </article>
      `).join("")}
      <span class="mnyra-go-page__how-tail" aria-hidden="true"></span>
    </div>
  `;
}

function renderExplainer(texts = TEXTS) {
  return `
    <h2 class="mnyra-go-page__lead">${esc(texts.leadTitle)}</h2>
    <p class="mnyra-go-page__lead-sub">${esc(texts.leadBody)}</p>
    ${renderHowRow()}
    <section class="mnyra-go-page__info">
      <h3 class="mnyra-go-page__info-title">${esc(texts.infoTitle)}</h3>
      ${INFO_ROWS.map((row) => `
        <div class="mnyra-go-page__info-row">
          <span class="mnyra-go-page__info-ic">${goIcon(row.icon)}</span>
          <div>
            <p class="mnyra-go-page__info-title-row">${esc(row.title)}</p>
            <p class="mnyra-go-page__info-text">${esc(row.text)}</p>
          </div>
        </div>
      `).join("")}
    </section>
  `;
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
  else bento = renderExplainer(texts);

  return `
    <div class="mnyra-go-page" data-go-page data-go-view="${esc(view)}">
      ${isSearch ? `<div class="mnyra-go-page__top">${renderAskCard(state.form || {}, texts)}</div>` : ""}
      <div class="mnyra-go-page__bento" data-go-bento>${bento}</div>
    </div>
  `;
}

export const GO_PAGE_TEXTS = TEXTS;
export const GO_PAGE_HOW_CARDS = HOW_CARDS;
export const GO_PAGE_INFO_ROWS = INFO_ROWS;
