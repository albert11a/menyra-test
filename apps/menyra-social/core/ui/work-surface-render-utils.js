// Die gemeinsame Geometrie der beiden Arbeitsseiten: Paneli und Mnyra GO.
//
// Beide Seiten sind derselbe Aufbau:
//
//   globale Kopfzeile   (von der Shell)
//   -> Titelzeile       Name links, Handgriffe rechts
//   -> Karten-Reihe     waagerecht, bis an beide Bildschirmraender
//   -> Benko            weisse Flaeche, oben gerundet: Pillen + Inhalt
//
// Und weil es derselbe Aufbau ist, soll es auch dieselbe Geometrie sein: eine
// Flucht, ein Rhythmus, eine Pille. Vorher stand beides zweimal in Pixeln da -
// 28px Seitenpolster im Paneli, 24px in GO; Pillen 38px hoch hier, 44px dort;
// schwarz gewaehlt hier, violett dort. Zwei Seiten derselben App, die beim
// Wechsel sichtbar auseinanderliefen.
//
// Deshalb steht die Geometrie jetzt EINMAL hier. Die beiden Seiten setzen
// `mnyra-work` an ihre Wurzel und nehmen die Marken daraus; ihre eigenen
// Blaetter tragen nur noch, was wirklich nur sie betrifft (Farben ihrer
// Karten, ihre Listen, ihre Zustaende).

export const WORK_SURFACE_STYLE_ELEMENT_ID = "mnyraWorkSurfaceStyles";

export const WORK_SURFACE_CSS = `
/* Die Wurzel beider Arbeitsseiten. Sie traegt die Marken und das
   Seitenpolster - alles andere rechnet daraus.

   Das Seitenpolster ist --app-content-inline (1.5rem), das Mass, mit dem in
   dieser App ueberall Inhalt vom Rand absteht. Es steht hier als eigene Marke
   und nicht direkt als var(--app-content-inline), damit die beiden Seiten an
   EINER Stelle verschoben werden koennen, ohne die halbe App mitzunehmen. */
.mnyra-work {
  --work-inline: 1.5rem;
  /* Der Rhythmus von oben nach unten. Er ist bewusst luftiger als vorher:
     die Seiten standen zu eng unter der Kopfzeile und die Karten klebten an
     der Ueberschrift.
       --work-head-top    globale Kopfzeile -> Titelzeile
       --work-head-gap    Titel/Unterzeile  -> Karten-Reihe
       --work-cards-gap   Ende der Karten   -> Anfang des Benkos
     Dazu kommt oben noch das Polster von <main> (--smart-header-content-gap,
     1.2rem), das beide Seiten gleichermassen bekommen. */
  --work-head-top: 32px;
  --work-head-gap: 36px;
  --work-head-min-height: 44px;
  --work-cards-gap: 80px;
  /* Die Hoehe EINER Karte in der Reihe - und damit die Hoehe der ganzen Reihe.
     Sie steht hier und nicht auf den Seiten, weil an ihr der Anfang des Benkos
     haengt: Sind die Karten verschieden hoch, faengt das Benko auf der einen
     Seite hoeher an als auf der anderen, egal wie gleich der Abstand darueber
     und darunter ist. Genau das war der Fall - 228 Punkte im Paneli, 210 in
     GO, also 18 Punkte Versatz im Benko.
     Das Mass ist das groessere der beiden: Im Paneli sitzt darin ein
     Bildfenster von 140 Punkten und darunter ein Textblock von 88; in GO
     bekommt die vierzeilige Beschreibung auf einem 320er Telefon damit mehr
     Luft, statt sie zu verlieren. */
  --work-card-height: 228px;
  /* Das Benko: oben gerundet, bis an beide Seitenraender, nach unten laeuft
     es mit der Seite weiter. Der Auslauf ist sein eigenes unteres Polster -
     den Abschluss der Seite macht der Fuss der App dahinter. */
  --work-bento-radius: 40px;
  --work-bento-pad-top: 22px;
  --work-bento-tail: 112px;
  /* Die Pillen-Leiste waehlt aus, was unter ihr steht - sie ist nicht selbst
     Teil davon. Deshalb haelt das erste Stueck darunter deutlich mehr Abstand
     als zwei Karten untereinander. */
  --work-bento-lead: 44px;
  /* Die Pille. Eine Fingerhoehe, ganz rund, weisse Flaeche mit ruhigem Rand -
     gewaehlt traegt sie das Violett der Marke. */
  --work-pill-gap: 8px;
  --work-pill-height: 44px;
  --work-pill-inline: 10px;
  --work-pill-icon-gap: 6px;
  --work-pill-icon: 14px;
  --work-pill-font: 11px;
  --work-pill-surface: #ffffff;
  --work-pill-border: #e2e8f0;
  --work-pill-ink: #0f172a;
  --work-pill-active: #4f46e5;
  --work-pill-active-ink: #ffffff;
  padding: var(--work-head-top) var(--work-inline) 0;
}
.mnyra-work * { box-sizing: border-box; }
/* Die Titelzeile. Links der Name, rechts - wenn die Seite einen hat - ihr
   Handgriff. Beide Seiten setzen dieselbe Mindesthoehe und denselben Abstand
   nach unten, damit die Karten darunter auf derselben Linie anfangen. */
.mnyra-work__head {
  min-height: var(--work-head-min-height);
  margin: 0 0 var(--work-head-gap);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* Eine Titelzeile MIT Handgriff rechts ist eine Reihe und kein Stapel: der
   Knopf nimmt seine Hoehe aus dem Textblock daneben (align-items: stretch),
   seine Breite folgt der Hoehe. */
.mnyra-work__head--row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: 12px;
}
/* Die Karten-Reihe. Sie laeuft bis an beide Bildschirmraender, faengt links
   aber genau dort an, wo auch alles andere auf der Seite anfaengt: die
   negative Marge ist das Seitenpolster, das Polster darin schiebt die erste
   Karte wieder in die Flucht. */
.mnyra-work__cards {
  margin: 0 calc(-1 * var(--work-inline)) 0;
  padding: 0 var(--work-inline);
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: var(--work-inline);
  overscroll-behavior-x: contain;
  /* Wie in der Spots-Reihe im Feed: der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen auf der Reihe
     verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mnyra-work__cards::-webkit-scrollbar { display: none; }
/* Das Benko unter der Reihe. */
.mnyra-work__bento {
  margin: var(--work-cards-gap) calc(-1 * var(--work-inline)) 0;
  padding: var(--work-bento-pad-top) var(--work-inline) var(--work-bento-tail);
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  border-radius: var(--work-bento-radius) var(--work-bento-radius) 0 0;
  /* Dieselbe weiche Kante wie unter dem Header, nur nach oben gedreht. */
  box-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);
}
/* Die Pillen-Reihe: drei gleich breite Pillen, sonst nichts - kein Grund,
   kein Rahmen, kein Polster um sie herum. Ein Kasten darum schoebe sie um
   seine Polsterbreite nach innen und damit aus der Flucht der Karten. */
.mnyra-work__pills {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--work-pill-gap);
  min-width: 0;
}
/* Symbol und Wort stehen in EINER Zeile und auf EINER Grundlinie: beide sind
   Flex-Kinder mit gleicher Ausrichtung, das Symbol in fester Groesse.
   Die Fingerhoehe steht als Mindestmass und nicht als Polsterung - damit sind
   alle Pillen gleich hoch, auch die, deren Wort kuerzer ist. */
.mnyra-work__pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--work-pill-icon-gap);
  min-width: 0;
  min-height: var(--work-pill-height);
  padding: 0 var(--work-pill-inline);
  border: 1px solid var(--work-pill-border);
  border-radius: 999px;
  background: var(--work-pill-surface);
  font: inherit;
  font-size: var(--work-pill-font);
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  color: var(--work-pill-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier.
   "block" nimmt ihnen die Grundlinien-Luecke, die ein Inline-Element unter
   sich laesst - sonst saesse das Wort daneben minimal zu hoch. */
.mnyra-work__pill svg,
.mnyra-work__pill i {
  width: var(--work-pill-icon);
  height: var(--work-pill-icon);
  flex: 0 0 auto;
  display: block;
}
.mnyra-work__pill-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Die gewaehlte Pille traegt das Violett der Marke. Nur die Farbe: sie wird
   nicht groesser und nicht fetter, sonst rueckten die zwei daneben bei jedem
   Antippen. */
.mnyra-work__pill[aria-selected="true"] {
  background: var(--work-pill-active);
  border-color: var(--work-pill-active);
  color: var(--work-pill-active-ink);
  box-shadow: 0 1px 2px 0 rgb(79 70 229 / 0.24);
}
.mnyra-work__pill:active { transform: scale(0.98); }
/* Ein Knopf, der in derselben Reihe steht, aber nichts auswaehlt (der Pfeil
   in GO): dieselbe Form, dieselbe Fingerhoehe, dieselbe Kapsel - nur das
   Zeichen darin traegt das Violett. */
.mnyra-work__pill-turn {
  aspect-ratio: 1 / 1;
  min-height: var(--work-pill-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--work-pill-border);
  border-radius: 999px;
  background: var(--work-pill-surface);
  color: var(--work-pill-active);
  padding: 0;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.mnyra-work__pill-turn:active { transform: scale(0.95); }
.mnyra-work__pill-turn svg,
.mnyra-work__pill-turn i {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
}
/* Auf einem schmaleren Telefon rueckt alles etwas enger zusammen, damit auch
   das laengste Wort ganz dasteht. Gemessen: "Statistikat" braucht 54 Punkte,
   und ab hier bekaeme es nur noch 49 - eine Pille weniger Polsterung und ein
   Punkt weniger Schrift geben genau die fehlenden. */
@media (max-width: 413px) {
  .mnyra-work {
    --work-pill-gap: 6px;
    --work-pill-inline: 6px;
    --work-pill-icon-gap: 4px;
    --work-pill-font: 10px;
  }
}
/* Und auf den schmalsten bleibt nur das Symbol.

   Bei 320 Punkten ist eine Pille 68 breit; nach Symbol, Polster und Rand
   blieben 38 fuer ein Wort, das 49 braucht. Ein gekuerztes "Statisti..." sagt
   weniger als das Zeichen daneben - und die Pille traegt ihren Namen ohnehin
   im aria-label und im title, also geht dem, der ihn braucht, nichts
   verloren. Umgebrochen wird nie, und alle drei bleiben gleich breit. */
@media (max-width: 359px) {
  .mnyra-work {
    --work-pill-inline: 0px;
    --work-pill-icon-gap: 0px;
  }
  .mnyra-work__pill-label { display: none; }
}
`;

export function ensureWorkSurfaceStylesInjected(documentObj = typeof document === "undefined" ? null : document) {
  if (!documentObj || documentObj.getElementById(WORK_SURFACE_STYLE_ELEMENT_ID)) return;
  try {
    const style = documentObj.createElement("style");
    style.id = WORK_SURFACE_STYLE_ELEMENT_ID;
    style.textContent = WORK_SURFACE_CSS;
    documentObj.head?.appendChild(style);
  } catch {}
}
