import{G as re,h as j,i as $,j as ie,k as se}from"./domain-dashboard-vRtitumb.js";import{aH as ce,aI as z,aJ as le,aK as pe,aL as de,aM as H}from"./domain-feed-social-eager-Ha5diSu3.js";import{createGoApiClient as ge}from"./go-api-client-D2yMdG4L.js";import"./domain-auth-t0x0ToSL.js";import"./domain-analytics-OTr4ugX-.js";import"./domain-business-accounts-D8NpUhi6.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-DAUyCk2O.js";import"./domain-menu-eager-CQmnxf-X.js";const Q=Object.freeze({x:[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]],users:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{cx:"9",cy:"7",r:"4"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75"}]],sparkles:[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"}],["path",{d:"M20 3v4"}],["path",{d:"M22 5h-4"}],["path",{d:"M4 17v2"}],["path",{d:"M5 18H3"}]],coffee:[["path",{d:"M10 2v2"}],["path",{d:"M14 2v2"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"}],["path",{d:"M6 2v2"}]],"cup-soda":[["path",{d:"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"}],["path",{d:"M5 8h14"}],["path",{d:"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"}],["path",{d:"m12 8 1-6h2"}]],utensils:[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"}],["path",{d:"M7 2v20"}],["path",{d:"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"}]],"cake-slice":[["circle",{cx:"9",cy:"7",r:"2"}],["path",{d:"M7.2 7.9 3 11v9c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-9c0-2-3-6-7-8l-3.6 2.6"}],["path",{d:"M16 13H3"}],["path",{d:"M16 17H3"}]],zap:[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"}]],timer:[["line",{x1:"10",x2:"14",y1:"2",y2:"2"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11"}],["circle",{cx:"12",cy:"14",r:"8"}]],clock:[["circle",{cx:"12",cy:"12",r:"10"}],["polyline",{points:"12 6 12 12 16 14"}]],"calendar-clock":[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{d:"M16 2v4"}],["path",{d:"M8 2v4"}],["path",{d:"M3 10h5"}],["path",{d:"M17.5 17.5 16 16.3V14"}],["circle",{cx:"16",cy:"16",r:"6"}]],"map-pin":[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{cx:"12",cy:"10",r:"3"}]],search:[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]],"badge-percent":[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"}],["path",{d:"m15 9-6 6"}],["path",{d:"M9 9h.01"}],["path",{d:"M15 15h.01"}]],"check-check":[["path",{d:"M18 6 7 17l-5-5"}],["path",{d:"m22 10-7.5 7.5L13 16"}]],"party-popper":[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]],gift:[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1"}],["path",{d:"M12 8v13"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"}]],"shield-check":[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]],"ticket-percent":[["path",{d:"M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"}],["path",{d:"M9 9h.01"}],["path",{d:"m15 9-6 6"}],["path",{d:"M15 15h.01"}]],store:[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"}],["path",{d:"M2 7h20"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"}]],pencil:[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{d:"m15 5 4 4"}]],armchair:[["path",{d:"M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"}],["path",{d:"M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"}],["path",{d:"M5 18v2"}],["path",{d:"M19 18v2"}]],"circle-check-big":[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335"}],["path",{d:"m9 11 3 3L22 4"}]],"book-open":[["path",{d:"M12 7v14"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],navigation:[["polygon",{points:"3 11 22 2 13 21 11 13 3 11"}]],"log-in":[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"}],["polyline",{points:"10 17 15 12 10 7"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12"}]],"rotate-ccw":[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]],"arrow-left":[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]],"triangle-alert":[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]],hash:[["line",{x1:"4",x2:"20",y1:"9",y2:"9"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21"}]],ban:[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m4.9 4.9 14.2 14.2"}]]}),me=Object.freeze({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"});function K(a={}){return Object.entries(a).map(([e,i])=>` ${e}="${i}"`).join("")}Object.freeze(Object.keys(Q));function c(a="",e=""){const i=Q[String(a||"").trim()];if(!i)return"";const l=i.map(([d,y])=>`<${d}${K(y)}></${d}>`).join(""),g=String(e||"").trim();return`<svg${K(me)}${g?` class="${g}"`:""}>${l}</svg>`}const V="mnyraGoModalStyles",he="mnyraGoOverlayRoot",Z="#ffffff",fe=`
.mnyra-go {
  position: fixed;
  inset: 0;
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
   deshalb steht sie als eigene Flaeche da und nicht als lose Reihe von
   Ueberschriften im Weissen. */
.mnyra-go__ask {
  margin-top: 20px;
  padding: 18px 16px;
  border: 1px solid var(--go-outline);
  border-radius: 26px;
  background: #ffffff;
}
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
`,h=Object.freeze({brand:"Mnyra GO",brandWord:"MNYRA",brandGo:"GO",close:"Mbyll",leadTitle:"Zbritje ose ofertë nga lokalet përreth teje",leadBody:"Ti thua vetëm sa veta jeni, çka doni dhe kur. Lokalet të kthejnë ofertën e tyre.",partyQuestion:"Sa veta jeni?",partyOne:"person",partyMany:"veta",categoryQuestion:"Çka dëshironi?",whenQuestion:"Kur?",whenLaterLabel:"Zgjidh ditën dhe orën",placeQuestion:"Ku?",placeLabel:"Qyteti",placeEmpty:"Shto qytetin tënd",cityPlaceholder:"Shkruaj qytetin",locationChange:"Ndrysho",locationSave:"Ruaj",submit:"Shiko ofertat",searching:"Po kërkojmë...",resultsHeadline:"lokale kanë oferta për ju",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",confirming:"Po konfirmohet...",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",emptyTitle:"Nuk gjetëm ofertë GO që përputhet tani.",emptySubtitle:"Provo me një orë tjetër ose me një grup tjetër.",doneTitle:"U krye",reservationConfirmed:"Tavolina është konfirmuar",claimConfirmed:"Oferta është e juaja",menu:"Shiko menunë",directions:"Udhëzime",code:"Kodi",cancel:"Anulo",cancelConfirm:"Dëshiron ta anulosh?",cancelYes:"Po, anuloje",cancelNo:"Jo",saveToAccount:"Ruaje në llogarinë tënde",signIn:"Hyr",errorTitle:"Mnyra GO është përkohësisht i padisponueshëm.",errorRetry:"Provo prapë",alternatives:"alternativa për ju",peopleSuffix:"persona",now:"Tani",back:"Ndrysho kërkimin",infoTitle:"Mirë të dihet"}),ue=Object.freeze([Object.freeze({icon:"users",step:"1",title:"Thuaj sa veta jeni",text:"Sa veta, çka doni dhe kur. Zgjat më pak se 10 sekonda."}),Object.freeze({icon:"badge-percent",step:"2",title:"Lokalet të bëjnë ofertë",text:"Lokalet përreth teje kthejnë zbritje ose diçka falas, vetëm për grupin tënd."}),Object.freeze({icon:"check-check",step:"3",title:"Zgjedh njërën",text:"E pranon ofertën me një prekje. Tavolina të mbetet e ruajtur."}),Object.freeze({icon:"party-popper",step:"4",title:"Shko dhe shijo",text:"Tregon kodin te lokali dhe oferta vlen aty për aty."})]),ye=Object.freeze([Object.freeze({icon:"gift",title:"Falas për ty",text:"Mnyra GO nuk kushton asgjë. Paguan vetëm atë që konsumon te lokali."}),Object.freeze({icon:"shield-check",title:"Pa llogari",text:"Nuk të duhet regjistrim. Kërkon, pranon ofertën dhe shkon."}),Object.freeze({icon:"ticket-percent",title:"Vetëm me Mnyra GO",text:"Këto oferta nuk janë në menu e as në rrjete sociale."}),Object.freeze({icon:"store",title:"Lokalet vendosin vetë",text:"Çdo lokal zgjedh çka ofron, për sa veta dhe në cilat orë."})]),_e=Object.freeze({now:"zap",in30:"timer",in60:"clock",later:"calendar-clock"});function n(a=""){return String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function v(a){const e=Math.trunc(Number(a));return Number.isFinite(e)?Math.min(j,Math.max($,e)):re}function L(a,e=h){return v(a)===1?e.partyOne||h.partyOne:e.partyMany||h.partyMany}function Y(a,e=h){return`${v(a)} ${L(a,e)}`}function U(a){const e=v(a),i=j-$;return Math.round((e-$)/i*100)}function F(a,{active:e=!1,attr:i="",value:l="",iconName:g="",wide:d=!1}={}){return`
    <button
      type="button"
      class="mnyra-go__chip${d?" mnyra-go__chip--wide":""}"
      ${i?`${i}="${n(l)}"`:""}
      aria-pressed="${e?"true":"false"}"
    >${g?c(g):""}<span>${n(a)}</span></button>
  `}function J(a,{nowMs:e=Date.now()}={}){const i=Date.parse(String(a||""));if(!Number.isFinite(i))return"";if(Math.abs(i-e)<900*1e3)return h.now;const l=new Date(i);return`Rreth ${String(l.getHours()).padStart(2,"0")}:${String(l.getMinutes()).padStart(2,"0")}`}function be(){return`
    <div class="mnyra-go__how" data-go-how>
      ${ue.map(a=>`
        <article class="mnyra-go__how-card">
          <span class="mnyra-go__how-plate">${c(a.icon)}</span>
          <p class="mnyra-go__how-step">${n(a.step)}</p>
          <p class="mnyra-go__how-title">${n(a.title)}</p>
          <p class="mnyra-go__how-text">${n(a.text)}</p>
        </article>
      `).join("")}
      <span class="mnyra-go__how-tail" aria-hidden="true"></span>
    </div>
  `}function ve(a=h){return`
    <section class="mnyra-go__info">
      <h3 class="mnyra-go__info-title">${n(a.infoTitle)}</h3>
      ${ye.map(e=>`
        <div class="mnyra-go__info-row">
          <span class="mnyra-go__info-ic">${c(e.icon)}</span>
          <div>
            <p class="mnyra-go__info-title-row">${n(e.title)}</p>
            <p class="mnyra-go__info-text">${n(e.text)}</p>
          </div>
        </div>
      `).join("")}
    </section>
  `}function xe(a={},e=h){const i=String(a.city||"").trim();return a.editCity?`
      <div class="mnyra-go__place">
        <span class="mnyra-go__place-ic">${c("map-pin")}</span>
        <span class="mnyra-go__place-body">
          <input
            type="text"
            class="mnyra-go__field"
            style="margin-top:0;"
            data-go-city-input
            value="${n(i)}"
            placeholder="${n(e.cityPlaceholder)}"
            aria-label="${n(e.placeQuestion)}"
            autocomplete="address-level2"
            enterkeyhint="done"
          />
        </span>
        <button type="button" class="mnyra-go__place-change mnyra-go__place-change--save" data-go-city-save>
          ${n(e.locationSave)}
        </button>
      </div>
    `:`
    <div class="mnyra-go__place">
      <span class="mnyra-go__place-ic">${c("map-pin")}</span>
      <span class="mnyra-go__place-body">
        <span class="mnyra-go__place-label">${n(e.placeLabel)}</span>
        <p class="mnyra-go__place-city">${n(i||e.placeEmpty)}</p>
      </span>
      <button type="button" class="mnyra-go__place-change" data-go-change-city>
        ${c("pencil")}${n(e.locationChange)}
      </button>
    </div>
  `}function we(a={},e=h){const i=v(a.partySize),l=String(a.category||"all"),g=String(a.when||"now");return`
    <div data-go-view="search">
      <h2 class="mnyra-go__lead">${n(e.leadTitle)}</h2>
      <p class="mnyra-go__lead-sub">${n(e.leadBody)}</p>

      ${be()}

      <section class="mnyra-go__ask">
        <h3 class="mnyra-go__q">${c("users")}${n(e.partyQuestion)}</h3>
        <output class="mnyra-go__party-value" data-go-party-value for="mnyraGoParty">
          ${n(String(i))} <span>${n(L(i,e))}</span>
        </output>
        <input
          id="mnyraGoParty"
          type="range"
          class="mnyra-go__range"
          data-go-party-range
          min="${$}"
          max="${j}"
          step="1"
          value="${i}"
          style="--go-range-fill:${U(i)}%;"
          aria-label="${n(e.partyQuestion)}"
          aria-valuetext="${n(Y(i,e))}"
        />
        <div class="mnyra-go__range-scale" aria-hidden="true">
          <span>${$}</span>
          <span>${j}</span>
        </div>

        <h3 class="mnyra-go__q mnyra-go__q--sub">${c("utensils")}${n(e.categoryQuestion)}</h3>
        <div class="mnyra-go__chips" role="group" aria-label="${n(e.categoryQuestion)}">
          ${ie.map((d,y)=>F(d.label,{active:l===d.key,attr:"data-go-category",value:d.key,iconName:d.icon,wide:y===0})).join("")}
        </div>

        <h3 class="mnyra-go__q mnyra-go__q--sub">${c("clock")}${n(e.whenQuestion)}</h3>
        <div class="mnyra-go__chips" role="group" aria-label="${n(e.whenQuestion)}">
          ${se.map(d=>F(d.label,{active:g===d.key,attr:"data-go-when",value:d.key,iconName:_e[d.key]||"clock"})).join("")}
        </div>
        ${g==="later"?`
          <p class="mnyra-go__field-label">${n(e.whenLaterLabel)}</p>
          <input
            type="datetime-local"
            class="mnyra-go__field"
            data-go-when-input
            value="${n(a.laterValue||"")}"
            aria-label="${n(e.whenLaterLabel)}"
          />
        `:""}

        ${xe(a,e)}

        <button type="button" class="mnyra-go__cta" data-go-submit>
          ${c("search")}${n(e.submit)}
        </button>
      </section>

      ${ve(e)}
    </div>
  `}function X(a={},{texts:e=h,busyOfferId:i="",nowMs:l=Date.now()}={}){const g=i&&i===a.offerId,d=Number.isFinite(Number(a.distanceKm))&&a.distanceKm!==null?`${Number(a.distanceKm).toFixed(1)} km`:"",y=a.isNow?e.now:J(a.expectedArrivalAt,{nowMs:l});return`
    <article class="mnyra-go__card" data-go-result="${n(a.offerId)}">
      <div class="mnyra-go__card-head">
        ${a.logoUrl?`<img class="mnyra-go__card-logo" src="${n(a.logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`:`<div class="mnyra-go__card-logo mnyra-go__card-logo--empty">${c("store")}</div>`}
        <div class="mnyra-go__card-names">
          <p class="mnyra-go__card-who">${n(a.businessName)} <span>${n(e.offering)}</span></p>
          ${a.sponsored?`<p class="mnyra-go__card-sponsored">${n(e.sponsored)}</p>`:""}
        </div>
      </div>

      <p class="mnyra-go__card-benefit">${n(a.benefitLabel)}</p>
      <p class="mnyra-go__card-for">${n(e.forGroup)}</p>

      <div class="mnyra-go__card-meta">
        <span>${c("users")}${n(`${a.partySize} ${e.peopleSuffix}`)}</span>
        ${y?`<span>${c("clock")}${n(y)}</span>`:""}
        ${d?`<span>${c("map-pin")}${n(d)}</span>`:""}
        ${a.bookingType==="reservation"?`<span>${c("armchair")}${n(e.tableIncluded)}</span>`:""}
      </div>

      <p class="mnyra-go__card-only">${c("ticket-percent")}${n(e.onlyGo)}</p>

      <button
        type="button"
        class="mnyra-go__cta"
        data-go-accept="${n(a.offerId)}"
        data-go-restaurant="${n(a.restaurantId)}"
        ${g?"disabled":""}
      >${g?"":c("check-check")}${n(g?e.confirming:e.accept)}</button>
    </article>
  `}function ke(a={},e=h){const i=Array.isArray(a.results)?a.results:[],l=Number(a.nowMs)||Date.now();return i.length?`
    <div data-go-view="results">
      <h2 class="mnyra-go__lead">${i.length} ${n(e.resultsHeadline)}</h2>
      ${a.notice?`<p class="mnyra-go__note">${n(a.notice)}</p>`:""}
      ${i.map(g=>X(g,{texts:e,busyOfferId:a.busyOfferId,nowMs:l})).join("")}
      <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-back>
        ${c("arrow-left")}${n(e.back)}
      </button>
    </div>
  `:`
      <div data-go-view="results">
        <h2 class="mnyra-go__lead">${n(e.emptyTitle)}</h2>
        <p class="mnyra-go__hint">${n(e.emptySubtitle)}</p>
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-back>
          ${c("arrow-left")}${n(e.back)}
        </button>
      </div>
    `}function $e(a={},e=h){const i=a.booking||{},l=i.type==="reservation",g=Number(a.nowMs)||Date.now(),d=J(i.expectedArrivalAt,{nowMs:g}),y=String(a.statusLabel||"").trim()||(l?e.reservationConfirmed:e.claimConfirmed);return a.confirmCancel?`
      <div data-go-view="booking">
        <h2 class="mnyra-go__lead">${n(e.cancelConfirm)}</h2>
        <div class="mnyra-go__row">
          <button type="button" class="mnyra-go__cta" data-go-cancel-confirm>
            ${c("ban")}${n(e.cancelYes)}
          </button>
          <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-cancel-dismiss>${n(e.cancelNo)}</button>
        </div>
      </div>
    `:`
    <div data-go-view="booking">
      <p class="mnyra-go__done">${n(e.doneTitle)} ${c("party-popper")}</p>
      <p class="mnyra-go__done-name">${n(i.businessName||"")}</p>
      <p class="mnyra-go__card-for">${n(i.benefitLabel||"")}</p>

      <div class="mnyra-go__card-meta">
        <span>${c("users")}${n(`${i.partySize||1} ${e.peopleSuffix}`)}</span>
        ${d?`<span>${c("clock")}${n(d)}</span>`:""}
        ${i.city?`<span>${c("map-pin")}${n(i.city)}</span>`:""}
      </div>

      <p class="mnyra-go__ok">${c("circle-check-big")}${n(y)}</p>

      ${i.shortCode?`
        <div class="mnyra-go__code">
          <p class="mnyra-go__code-label">${c("hash")}${n(e.code)}</p>
          <p class="mnyra-go__code-value">${n(i.shortCode)}</p>
        </div>
      `:""}

      <div class="mnyra-go__row">
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-menu>
          ${c("book-open")}${n(e.menu)}
        </button>
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-directions>
          ${c("navigation")}${n(e.directions)}
        </button>
      </div>

      ${a.canSignIn?`
        <button type="button" class="mnyra-go__cta mnyra-go__cta--quiet" data-go-signin>
          ${c("log-in")}${n(e.saveToAccount)} · ${n(e.signIn)}
        </button>
      `:""}

      <button type="button" class="mnyra-go__ghost" data-go-cancel>${n(e.cancel)}</button>
    </div>
  `}function Me(a={},e=h){const i=String(a.error||"").trim()||e.errorTitle;return`
    <div data-go-view="error">
      <h2 class="mnyra-go__lead">${n(i)}</h2>
      ${Array.isArray(a.alternatives)&&a.alternatives.length?`
        <p class="mnyra-go__hint">${a.alternatives.length} ${n(e.alternatives)}</p>
        ${a.alternatives.map(l=>X(l,{texts:e,nowMs:a.nowMs})).join("")}
      `:`
        <button type="button" class="mnyra-go__cta" data-go-retry>
          ${c("rotate-ccw")}${n(e.errorRetry)}
        </button>
      `}
    </div>
  `}function Se(a=h){return`
    <header class="mnyra-go__head">
      <div class="mnyra-go__brand">
        <span class="mnyra-go__brand-word">${n(a.brandWord)}</span><span class="mnyra-go__brand-go">${n(a.brandGo)}</span>
      </div>
      <button type="button" class="mnyra-go__x" data-go-close aria-label="${n(a.close)}" title="${n(a.close)}">${c("x")}</button>
    </header>
  `}function ze(a={}){const e={...h,...a.texts||{}},i=String(a.view||"search");let l="";return i==="loading"?l=`<div class="mnyra-go__empty">${n(e.searching)}</div>`:i==="results"?l=ke(a,e):i==="booking"?l=$e(a,e):i==="error"?l=Me(a,e):l=we(a.form||{},e),`
    <div class="mnyra-go__sheet">
      ${Se(e)}
      <div class="mnyra-go__body" data-go-body>${l}</div>
    </div>
  `}const W="mnyraGoSticky";function je(a,e){return typeof a=="function"?a:e}function Oe(a){if(!a?.body)return null;let e=a.getElementById("overlayRoot");return e||(e=a.createElement("div"),e.id="overlayRoot",e.style.position="relative",e.style.zIndex="200",e.style.isolation="isolate",a.body.appendChild(e)),e}function Ae(a){if(!(!a||a.getElementById(V)))try{const e=a.createElement("style");e.id=V,e.textContent=fe,a.head?.appendChild(e)}catch{}}function Be({documentObj:a=null,windowObj:e=null,api:i=null,getCityFn:l=()=>"",getCoordsFn:g=()=>null,isSignedInFn:d=()=>!1,onAnalyticsFn:y=()=>{},openMenuFn:E=null,openSignInFn:T=null,nowFn:O=()=>Date.now()}={}){const _=a||(typeof document>"u"?null:document),A=e||(typeof window>"u"?null:window),x=i||ge(),b=je(y,()=>{}),t={open:!1,view:"search",form:{partySize:2,category:"all",when:"now",laterValue:"",city:"",editCity:!1},results:[],alternatives:[],booking:null,bookingToken:"",busyOfferId:"",confirmCancel:!1,error:"",notice:"",canSignIn:!1,nowMs:O()},M=new Map,ee=new Set(["resource-exhausted","failed-precondition","not-found","invalid-argument","already-exists","permission-denied","unauthenticated"]);function I(o,s){const r=String(s?.code||"").trim();ee.has(r)&&M.delete(o)}let f=null;function D(){if(!_)return null;if(f)return f;Ae(_),f=_.createElement("div"),f.id=he,f.className="mnyra-go modal-overlay",f.setAttribute("data-go-modal",""),f.setAttribute("role","dialog"),f.setAttribute("aria-modal","true"),f.setAttribute("aria-label","Mnyra GO"),f.setAttribute("data-modal-surface",Z);try{f.style.setProperty("--modal-surface",Z)}catch{}return f}function m(){const o=D();if(!o)return;if(t.nowMs=O(),!t.open){try{o.remove()}catch{}G();return}const s=Oe(_);s&&o.parentNode!==s&&s.appendChild(o),o.innerHTML=ze(t),ae(),G()}function ae(){if(!(!t.open||!t.form.editCity))try{const o=f?.querySelector?.("[data-go-city-input]");if(!o||typeof o.focus!="function")return;o.focus({preventScroll:!0});const s=String(o.value||"").length;o.setSelectionRange?.(s,s)}catch{}}function G(){if(!_)return;let o=_.getElementById(W);const s=t.open?"":pe({activeBookings:z()});if(!s){o&&o.remove();return}o||(o=_.createElement("div"),o.id=W,_.body.appendChild(o)),o.innerHTML=s}function C(){t.open=!1,t.busyOfferId="",t.confirmCancel=!1,m()}function S(o){t.view="error",t.error=String(o?.message||"").trim(),t.alternatives=Array.isArray(o?.alternatives)?o.alternatives:[],t.busyOfferId="",m()}function N(){const o=t.form,s={now:0,in30:30,in60:60};let r=O();if(o.when==="later"&&o.laterValue){const u=Date.parse(o.laterValue);Number.isFinite(u)&&(r=u)}else r+=(s[o.when]||0)*60*1e3;const p=g();return{city:String(o.city||"").trim()||l(),partySize:v(o.partySize),category:o.category,requestedAt:r,lat:p?.lat,lng:p?.lng}}async function R(){t.open=!0,t.view="search",t.error="",t.notice="",t.form.city=t.form.city||l(),t.form.editCity=!1,t.canSignIn=!d(),m(),b("go_open",{}),x.ensureGuestSession().catch(()=>{})}async function B(){t.view="loading",t.error="",m();const o=N();b("go_search",{partySize:o.partySize,category:o.category});try{const s=await x.search(o);t.results=s.results,t.view="results",t.notice="",m(),b("go_results",{count:s.results.length})}catch(s){S(s)}}async function P(o="",s=""){if(!(!o||t.busyOfferId)){t.busyOfferId=o,t.error="",m(),M.has(o)||M.set(o,ce(A?.crypto)),b("go_offer_accept",{offerId:o});try{const r=await x.createBooking({offerId:o,restaurantId:s,request:N(),idempotencyKey:M.get(o)}),p=r?.booking||null;if(!p)throw new Error("go-booking-missing");const u=String(r.bookingToken||"").trim()||z().find(k=>k.bookingId===p.id)?.bookingToken||"";le({bookingId:p.id,bookingToken:u,shortCode:p.shortCode,restaurantId:p.restaurantId,businessName:p.businessName,benefitLabel:p.benefitLabel,type:p.type,status:p.status,partySize:p.partySize,expectedArrivalAt:p.expectedArrivalAt}),t.booking=p,t.bookingToken=u,t.view="booking",t.busyOfferId="",t.canSignIn=!d(),m(),b("go_booking_created",{offerId:o,type:p.type})}catch(r){if(r?.soldOut){t.view="error",t.error=r.message,t.alternatives=r.alternatives||[],t.busyOfferId="",I(o,r),m();return}I(o,r),S(r)}}}async function ne(o=""){const s=z().find(r=>r.bookingId===o)||z()[0]||null;if(!s)return R();t.open=!0,t.view="loading",t.confirmCancel=!1,m();try{const r=await x.getBooking(s.bookingToken);if(!r)throw new Error("go-booking-missing");de(r),t.booking={...s,...r},t.bookingToken=s.bookingToken,t.view="booking",t.canSignIn=!d(),m()}catch(r){if(r?.code==="not-found"){H(o),t.view="search",t.notice="",m();return}S(r)}}async function te(){const o=t.bookingToken;if(o){t.view="loading",m();try{const s=await x.cancelBooking(o);H(t.booking?.id||""),b("go_cancel",{bookingId:t.booking?.id||""}),t.booking=s,t.confirmCancel=!1,t.view="search",t.form.city=t.form.city||l(),m()}catch(s){S(s)}}}function w(o={}){Object.assign(t.form,o),m()}function oe(){const o=D();!o||o.dataset.goBound==="1"||(o.dataset.goBound="1",o.addEventListener("click",s=>{const r=s.target;if(!r||typeof r.closest!="function")return;if(r.closest("[data-go-close]"))return C();const p=r.closest("[data-go-category]");if(p)return w({category:p.getAttribute("data-go-category")||"all"});const u=r.closest("[data-go-when]");if(u)return w({when:u.getAttribute("data-go-when")||"now"});if(r.closest("[data-go-change-city]"))return w({editCity:!0});if(r.closest("[data-go-city-save]"))return w({editCity:!1});if(r.closest("[data-go-submit]")||r.closest("[data-go-retry]"))return B();if(r.closest("[data-go-back]"))return t.view="search",m();const k=r.closest("[data-go-accept]");if(k)return P(k.getAttribute("data-go-accept")||"",k.getAttribute("data-go-restaurant")||"");if(r.closest("[data-go-cancel-dismiss]"))return t.confirmCancel=!1,m();if(r.closest("[data-go-cancel-confirm]"))return te();if(r.closest("[data-go-cancel]"))return t.confirmCancel=!0,m();if(r.closest("[data-go-menu]")&&E)return E(t.booking?.restaurantId||"");if(r.closest("[data-go-signin]")&&T)return T();if(r.closest("[data-go-directions]")){const q=encodeURIComponent([t.booking?.businessName,t.booking?.city].filter(Boolean).join(" "));A&&q&&A.open(`https://www.google.com/maps/search/?api=1&query=${q}`,"_blank","noopener");return}}),o.addEventListener("input",s=>{const r=s.target;if(!(!r||typeof r.matches!="function")){if(r.matches("[data-go-party-range]")){const p=v(r.value);t.form.partySize=p;try{const u=o.querySelector?.("[data-go-party-value]");u&&(u.innerHTML=`${p} <span>${L(p)}</span>`),r.style?.setProperty?.("--go-range-fill",`${U(p)}%`),r.setAttribute?.("aria-valuetext",Y(p))}catch{}return}r.matches("[data-go-city-input]")&&(t.form.city=r.value||"")}}),o.addEventListener("change",s=>{const r=s.target;!r||typeof r.matches!="function"||(r.matches("[data-go-when-input]")&&(t.form.laterValue=r.value||""),r.matches("[data-go-city-input]")&&(t.form.city=r.value||""))}),o.addEventListener("keydown",s=>{const r=s.target;s.key==="Enter"&&(!r||typeof r.matches!="function"||!r.matches("[data-go-city-input]")||(s.preventDefault(),t.form.city=r.value||"",w({editCity:!1})))}),_&&_.addEventListener("keydown",s=>{t.open&&s.key==="Escape"&&C()}))}return{state:t,open:(o="search",s="")=>(oe(),o==="booking"?ne(s):R()),close:C,refreshSticky:G,__render:m,__submitSearch:B,__acceptOffer:P}}export{Be as createGoRuntimeController};
