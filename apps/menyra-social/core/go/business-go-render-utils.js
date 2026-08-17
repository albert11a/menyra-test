// Mnyra GO im Panel - Business-Ansicht. Reines String-Rendering.
//
// Aufbau wie der Ofertat- und der Menue-Editor: eine eigene Seite, keine
// Overlay-Flaeche. Weisse Karten mit 2.5rem-Radius, farbiger Eyebrow,
// kursive Ueberschrift, "+"-Knopf rechts oben, Liste mit Edit je Eintrag -
// und der Editor als eigener Bildschirm mit Zurueck-Pfeil.
//
// Der Editor ist ein Modal - und das ging erst, nachdem der Grund dagegen weg
// war.
//
// Hier stand: "Ein Editor in einem Modal verliert bei jedem Neuzeichnen der
// Shell die Eingaben." Das stimmte, aber die Ursache war nicht das Modal. Sie
// war, dass die getippten Werte nur im DOM standen und erst beim Speichern
// gelesen wurden - ein Neuaufbau warf sie damit weg, auf einer eigenen Seite
// genauso wie in einem Modal. Wer im Editor "1 Kafe + 1 kroasan" tippte und
// danach eine Pille antippte, sah sein Feld wieder leer.
//
// Jetzt liegt jeder Wert im Entwurf (editor.draft), bevor irgendetwas neu
// gezeichnet wird. Ein Neuaufbau setzt die Felder daraufhin aus dem Zustand
// zurueck statt sie zu leeren - und damit ist ein Modal so sicher wie eine
// eigene Seite.
//
// Der Gedanke der Spezifikation bleibt: Fuer den Wirt darf GO sich nicht wie
// zusaetzliche Arbeit anfuehlen. Er stellt einmal ein, wann er welchen Deal
// gibt - und sieht danach nur noch, dass Gaeste kommen. Deshalb gibt es hier
// keinen "Prano"-Knopf (Punkt 61).

import {
  GO_INTENTS,
  GO_PARTY_RANGES
} from "../../../../shared/go/go-feature-config.js";
import { describeGoPartyRanges, describeGoSchedule } from "../../../../shared/go/go-offer-core.js";
import { goBookingBusinessStatusLabel } from "../../../../shared/go/go-booking-core.js";
import { formatGoCommission } from "../../../../shared/go/go-commission-core.js";

const TEXTS = Object.freeze({
  brand: "Mnyra GO",
  mark: "⚡",
  // Die Ueberschrift der GO-Seite des Lokals. Sie ist zweizeilig wie die des
  // Qyteti: oben der Name, darunter ein Satz - deshalb steht hier nur noch
  // das Wort, das unter den Namen kommt.
  editor: "Editori",
  brandMnyra: "MNYRA",
  brandGo: "GO",
  emptyTitle: "Merr klientë kur ata janë gati të dalin.",
  emptyAction: "Aktivizo ofertën e parë",
  cardIdle: "Krijo oferta për klientët që kërkojnë tani.",
  cardManage: "Menaxho GO",
  // "Arkiv" statt "Historiku": Es ist dieselbe Liste - alles, was nicht mehr
  // laeuft - und ein zweiter Reiter daneben haette dasselbe gezeigt.
  tabs: { active: "Aktiv", offers: "Ofertat", archive: "Arkiv", options: "Opsionet" },
  statNew: "Të reja",
  statActive: "Aktive",
  statToday: "Sot",
  guests: "Mysafirë",
  goOn: "GO Aktiv",
  pause: "Pauzo GO",
  resume: "Aktivizo GO",
  pausedUntil: "Pauzuar deri",
  createOffer: "Ofertë e re GO",
  // Die Karten-Reihe: ein Handgriff, zwei Zahlen des Tages.
  scanOffer: "Skano ofertën",
  seenToday: "Ofertën e kanë parë sot",
  acceptedToday: "E kanë pranuar sot",
  editOffer: "Ndrysho ofertën",
  preview: "Kështu e sheh klienti",
  activate: "Aktivizo",
  save: "Ruaj ofertën",
  saving: "Po ruhet...",
  cancel: "Anulo",
  edit: "Edit",
  offering: "po ju ofron",
  forGroup: "për grupin tuaj",
  accept: "Prano ofertën",
  benefitQuestion: "Çka po ofron?",
  benefitCustom: "Teksti yt (opsionale)",
  // Zwei Arten statt fuenf. Ein Wirt gibt entweder Prozent oder eine
  // bestimmte Sache zu einem bestimmten Preis - alles andere waren
  // Schubladen, die niemand sicher getroffen hat.
  benefitPercent: "Zbritje %",
  benefitAction: "Aksion",
  percentPlaceholder: "Sa përqind zbritje",
  actionItemPlaceholder: "1 Kafe + 1 kroasan",
  actionPricePlaceholder: "Çmimi (p.sh. 2,50 €)",
  partyQuestion: "Prej sa personave vlen kjo ofertë",
  // Nicht "Kategoria". Der Wirt beantwortet hier nicht, worauf sein Rabatt
  // gilt ("auf Kuchen"), sondern FUER WEN das Angebot gedacht ist: fuer den
  // Gast, der isst, oder fuer den, der nur etwas trinkt. Genau danach fragt
  // die Seite den Gast ("Për çka jeni?"), und nur wenn beide Seiten dieselbe
  // Frage beantworten, landet ein gutes Essens-Angebot nicht in der falschen
  // Gruppe.
  categoryQuestion: "Kur e lshon këtë ofertë",
  categoryHint: "Gastet zgjedhin mes «Ushqim» edhe «Pije».",
  // Die beiden Antworten des Gastes, aus seiner Sicht formuliert. Die Zeilen
  // darunter sind dieselben, die er im Qyteti liest - sie stehen in
  // GO_INTENTS und werden von dort gelesen, damit hier nie etwas anderes
  // steht als dort.
  ifFood: "Nëse kërkohet ushqim",
  ifDrinks: "Nëse kërkohet pije",
  scheduleQuestion: "Nga çfarë orari vlen oferta",
  always: "Nonstop",
  specificHours: "Specifik",
  hoursFrom: "Prej orës",
  hoursTo: "Deri në orë",
  limitsTitle: "Kufijtë",
  slotGroups: "Grupe për 30 min",
  slotGuests: "Mysafirë për 30 min",
  dailyGroups: "Grupe në ditë",
  totalRedemptions: "Sa herë gjithsej",
  noLimit: "0 = pa kufi",
  paused: "Pauzuar",
  archived: "Arkivuar",
  archive: "Arkivo",
  noBookings: "Ende asnjë klient sot.",
  noHistory: "Ende asnjë histori.",
  loading: "Po ngarkohet...",
  guestName: "Mnyra Guest",
  table: "Tavolinë",
  markDone: "Përfundo",
  around: "Rreth",
  // Das Suchfeld ueber der Aktiv-Liste - der einzige Weg zur Bestaetigung.
  search: "Kërko",
  searching: "Po kërkoj...",
  codePlaceholder: "Kodi i klientit",
  codeNotFound: "Ky kod nuk u gjet.",
  partyAtTable: "Sa persona janë",
  commission: "Provizioni",
  keepsRunning: "Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",
  onlyBusiness: "Ky funksion eshte vetem per profile biznesi.",
  loadingBusiness: "Biznesi po ngarkohet..."
});

function esc(escapeHtml, value = "") {
  return typeof escapeHtml === "function" ? escapeHtml(value) : String(value ?? "");
}

function safeIcon(icon, name = "", className = "w-4 h-4") {
  return typeof icon === "function" ? icon(name, className) : "";
}

function clock(value = "") {
  const ms = Date.parse(String(value || ""));
  if (!Number.isFinite(ms)) return "";
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Die GO-Karte im Panel (Punkt 49, 50, 51, 85, 86).
 *
 * Sie sieht aus wie die anderen Karten in Funksionet und fuehrt ueber
 * data-nav auf den GO-Tab - denselben Weg nimmt "Lësho ofertë" zu den
 * Ofertat.
 *
 * Das Abzeichen zaehlt NUR das Ungesehene. "3" heisst: drei Vorgaenge, die
 * das Lokal noch nicht angeschaut hat - nicht drei aktive Buchungen.
 */
export function renderBusinessGoCardCore({
  enabled = false,
  unseenCount = 0,
  activeOffers = 0,
  todayBookings = 0,
  iconFn = null,
  texts = {}
} = {}) {
  if (!enabled) return "";
  const labels = { ...TEXTS, ...(texts || {}) };
  const unseen = Math.max(0, Math.trunc(Number(unseenCount) || 0));
  const hasActivity = activeOffers > 0 || todayBookings > 0;
  const summary = hasActivity
    ? `${activeOffers} oferta aktive · ${todayBookings} rezervime sot`
    : labels.cardIdle;

  return `
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${unseen > 0
          ? `<span class="mnyra-dash__composer-badge" aria-label="${unseen} ${labels.statNew}">${unseen}</span>`
          : ""}
      </span>
      <span class="mnyra-dash__composer-sub">${summary}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${safeIcon(iconFn, "zap", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${hasActivity ? labels.cardManage : labels.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${safeIcon(iconFn, "chevron-right", "w-4 h-4")}</span>
      </span>
    </button>
  `;
}

// Die Kennzahlreihe - dieselbe Form wie in den Ofertat.
/* Die Karten-Reihe unter der Ueberschrift - dieselbe Machart wie die
   Highlight-Reihe im Paneli: eine waagerechte Reihe, die bis an beide
   Bildschirmraender laeuft, aber links dort anfaengt, wo auch alles andere
   auf der Seite anfaengt.

   Die negative Marge ist genau das Seitenpolster der Seite (p-6 = 1.5rem),
   das Polster darin schiebt die erste Karte wieder in die Flucht. So laeuft
   die Reihe unter den Rand hinaus, ohne dass die erste Karte springt.

   Warum eine Reihe und kein Raster: Vorne stehen jetzt die zwei Handgriffe
   (Oferta anlegen, QR scannen), dahinter die vier Zahlen. In einem Raster
   haetten Handgriff und Zahl dasselbe Gewicht - in einer Reihe steht der
   Handgriff da, wo der Daumen zuerst hinkommt, und die Zahlen holt man sich
   dazu. */
const GO_ADMIN_CSS = `
.go-hl {
  margin: 0 -1.5rem 1.5rem;
  padding: 0 1.5rem;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 1.5rem;
  overscroll-behavior-x: contain;
  /* Wie in der Spots-Reihe im Feed: der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen auf der Reihe
     verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.go-hl::-webkit-scrollbar { display: none; }
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+24px Polster), abzueglich der beiden
   Luecken zwischen den drei angeschnittenen Karten. */
.go-hl__card {
  flex: 0 0 calc((100% + 24px - 20px) / 2.5);
  /* Bildfenster (140px) + Abstand + Textblock + Polster unten. */
  height: 228px;
  position: relative;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  background: #ffffff;
  padding: 0;
  scroll-snap-align: start;
  text-align: left;
  font: inherit;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.go-hl__card:active { transform: scale(0.98); }
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.go-hl__tail { flex: 0 0 18px; }
/* Alle Bilder stehen im selben Fenster oben in der Karte - gleiche Hoehe auf
   jeder Karte, egal welches Format das Bild mitbringt. */
.go-hl__media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 140px;
  object-fit: cover;
  object-position: center;
  display: block;
}
/* Die Flaeche unter dem Bild: sie traegt die Karte, solange kein Bild da ist
   - dann steht hier statt eines Lochs eine ruhige Flaeche mit Symbol. */
.go-hl__plate {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.go-hl__body {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 154px;
  z-index: 2;
}
/* Zwei Zeilen, immer - auch wenn die Beschriftung nur eine braucht. So stehen
   die Zahlen aller Karten auf derselben Hoehe. */
.go-hl__label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  min-height: 25px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: #94a3b8;
  overflow: hidden;
}
.go-hl__value {
  margin: 5px 0 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
/* Auf einer Handgriff-Karte steht kein Wert, sondern der Satz selbst. Er
   nimmt die Hoehe von Beschriftung und Zahl zusammen ein, damit die Reihe
   eine Linie behaelt. */
.go-hl__action {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: #0f172a;
  overflow: hidden;
}
/* Das Bento traegt alles unter der Karten-Reihe: die Tab-Leiste und darunter
   die Liste, die sie gewaehlt hat. Dieselbe Flaeche wie im Paneli - oben
   gerundet, bis an beide Seitenraender, und sie laeuft nach unten weiter.
   Deshalb sind nur die oberen Ecken gerundet.

   Die negative Marge ist genau das Seitenpolster der Seite (1.5rem): so
   reicht die Flaeche bis an die Raender, waehrend ihr Inhalt in der Flucht
   der Karten darueber bleibt. Der Abstand nach oben ist bewusst gross - die
   Reihe soll als eigenes Stueck lesen und nicht an der Flaeche kleben. */
.go-bento {
  margin: 72px -1.5rem 0;
  padding: 22px 1.5rem 112px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  border-radius: 40px 40px 0 0;
  box-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);
}
/* Die Leiste braucht Luft nach unten, deutlich mehr als der Abstand zwischen
   zwei Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Mit 44px liest sie als Kopf der Flaeche und nicht als erste Karte. */
.go-bento > .go-tabs { margin-top: 0; }
.go-bento > .go-tabs + * { margin-top: 44px; }
/* Vier Knoepfe, sonst nichts - kein Grund, kein Rahmen, kein Polster um sie
   herum. Ein Kasten darum schoebe sie um seine Polsterbreite nach innen und
   damit aus der Flucht der Karten darunter. */
.go-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
/* Symbol und Wort stehen in EINER Zeile und auf EINER Grundlinie: beide sind
   Flex-Kinder mit gleicher Ausrichtung, das Symbol in fester Groesse. */
.go-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  padding: 11px 8px;
  border: 1px solid #f1f5f9;
  /* Ganz rund, wie im Paneli: beide sagen dasselbe - "waehle eines von
     mehreren" - und sollen deshalb gleich aussehen. */
  border-radius: 999px;
  background: #f8fafc;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  color: #475569;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier.
   "block" nimmt ihnen die Grundlinien-Luecke, die ein Inline-Element unter
   sich laesst - sonst saesse das Wort daneben minimal zu hoch. */
.go-tab svg,
.go-tab i {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  display: block;
}
.go-tab-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Der gewaehlte Knopf traegt dasselbe Schwarz wie im Paneli. */
.go-tab[aria-selected="true"] {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}
.go-tab:active { transform: scale(0.98); }
`;

function renderGoHighlightCard(card = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  // Die ruhige Flaeche liegt IMMER darunter: faellt das Bild aus, steht dort
  // kein Loch.
  const media = card.imageUrl
    ? `<img class="go-hl__media" src="${esc(escapeHtml, card.imageUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`
    : "";
  const body = card.action
    ? `<span class="go-hl__action">${esc(escapeHtml, card.action)}</span>`
    : `
      <span class="go-hl__label">${esc(escapeHtml, card.label)}</span>
      <span class="go-hl__value">${esc(escapeHtml, card.value)}</span>
    `;
  const ariaLabel = card.action || `${card.label} ${card.value}`;
  return `
    <button type="button" class="go-hl__card" ${card.attr || ""} data-go-highlight="${esc(escapeHtml, card.key)}"
      aria-label="${esc(escapeHtml, ariaLabel)}">
      <span class="go-hl__plate ${esc(escapeHtml, card.tone || "text-slate-400")}">${safeIcon(icon, card.icon, "w-6 h-6")}</span>
      ${media}
      <span class="go-hl__body">${body}</span>
    </button>
  `;
}

function renderGoHighlightRow({ stats = {}, deps = {} } = {}) {
  const cards = [
    // Der Handgriff zuerst - er ist der Grund, warum das Lokal die Seite im
    // Betrieb offen hat. Das Bild kommt spaeter; bis dahin steht dort die
    // ruhige Flaeche mit der Kamera.
    {
      key: "scan",
      action: TEXTS.scanOffer,
      icon: "camera",
      tone: "text-indigo-600",
      attr: "data-go-scan"
    },
    // Und die zwei Zahlen, die zusammen einen Satz ergeben: so oft vorgezeigt,
    // so oft angenommen. Nebeneinander lesen sie sich als Verhaeltnis - eine
    // Zahl allein sagt darueber nichts.
    {
      key: "seen",
      label: TEXTS.seenToday,
      value: Number(stats.impressions) || 0,
      icon: "eye",
      tone: "text-indigo-600"
    },
    {
      key: "accepted",
      label: TEXTS.acceptedToday,
      value: Number(stats.accepted) || 0,
      icon: "check-check",
      tone: "text-emerald-600"
    }
  ];
  return `
    <div class="go-hl" data-go-highlights>
      ${cards.map((card) => renderGoHighlightCard(card, deps)).join("")}
      <span class="go-hl__tail" aria-hidden="true"></span>
    </div>
  `;
}

function renderGoTabs({ tab = "active", deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const entries = [
    ["active", TEXTS.tabs.active, "zap"],
    ["offers", TEXTS.tabs.offers, "tag"],
    ["archive", TEXTS.tabs.archive, "archive"],
    ["options", TEXTS.tabs.options, "settings"]
  ];
  return `
    <div class="go-tabs" role="tablist" data-go-tabs>
      ${entries.map(([key, label, iconName]) => `
        <button type="button" role="tab" aria-selected="${tab === key ? "true" : "false"}" data-go-business-tab="${key}"
          class="go-tab">${safeIcon(icon, iconName, "w-4 h-4")}<span class="go-tab-label">${esc(escapeHtml, label)}</span></button>
      `).join("")}
    </div>
  `;
}

/**
 * Eine Zeile in der Liste des Lokals.
 *
 * Hier steht KEIN Kurzcode. Die Bestaetigung ist der Augenblick, in dem Geld
 * entsteht - sie soll nur gelingen, wenn ein Gast davorsteht und seinen Code
 * zeigt. Stuende der Code auf der Zeile, koennte ihn jeder abschreiben.
 *
 * Deshalb traegt eine Zeile aus der Liste auch keinen Bestaetigen-Knopf. Er
 * erscheint nur an der Buchung, die ueber das Suchfeld gefunden wurde
 * ("found") - und dorthin kommt man nur mit dem Code.
 */
function renderBookingRow(booking = {}, deps = {}, { found = false } = {}) {
  const escapeHtml = deps.escapeHtml;
  const isTable = booking.type === "reservation";
  const arrival = clock(booking.expectedArrivalAt);
  // Der Vorteil steht in der eingefrorenen Kopie. Was das Lokal hier liest,
  // ist die Zusage von damals - nicht das heutige Angebot (Punkt 92).
  const benefitLabel = booking.benefitLabel || booking.snapshot?.benefitLabel || "";
  const unseen = !booking.businessSeenAt;
  // Die Zeile braucht eine Ueberschrift. Der Code faellt dafuer aus, also
  // steht dort die Ankunft - das, wonach das Lokal ohnehin sortiert denkt.
  const heading = arrival ? `${TEXTS.around} ${arrival}` : TEXTS.guestName;

  return `
    <div class="p-4 rounded-[1.6rem] border ${found
      ? "bg-white border-indigo-300 ring-2 ring-indigo-100"
      : (unseen ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50 border-slate-100")}"
      data-go-booking="${esc(escapeHtml, booking.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">${esc(escapeHtml, heading)}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${esc(escapeHtml, goBookingBusinessStatusLabel(booking))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${esc(escapeHtml, TEXTS.guestName)}</p>
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-600">
        <span>👥 ${esc(escapeHtml, `${booking.partySize || 1} ${TEXTS.guests}`)}</span>
        ${arrival ? `<span>🕐 ${esc(escapeHtml, TEXTS.around)} ${esc(escapeHtml, arrival)}</span>` : ""}
        ${benefitLabel ? `<span>🎁 ${esc(escapeHtml, benefitLabel)}</span>` : ""}
        ${isTable ? `<span>🪑 ${esc(escapeHtml, TEXTS.table)}</span>` : ""}
      </div>
      ${found && booking.status === "confirmed" ? `
        <div class="mt-4">
          <!--
            Die Gruppengroesse gehoert dem Kellner, nicht dem Gast: Er sitzt
            vor der Gruppe und sieht, wieviele es wirklich sind. Was er hier
            stehen laesst oder aendert, ist die Zahl, die abgerechnet wird.
          -->
          <label class="flex items-center justify-between gap-3 mb-3">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${esc(escapeHtml, TEXTS.partyAtTable)}</span>
            <input type="number" inputmode="numeric" min="1" max="10" data-go-confirm-party
              value="${esc(escapeHtml, booking.partySize || 1)}"
              class="w-16 text-center py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900" />
          </label>
          <button type="button" data-go-booking-confirm data-go-booking-id="${esc(escapeHtml, booking.id)}"
            class="w-full py-3.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white active:scale-[0.98] transition-transform">
            ${esc(escapeHtml, TEXTS.accept)}
          </button>
        </div>
      ` : ""}
      ${booking.commission ? `
        <!--
          Was diese Bestaetigung kostet, steht offen da. Eine Provision, die
          das Lokal erst auf der Rechnung sieht, waere eine Ueberraschung -
          und Ueberraschungen bei Geld kosten Vertrauen.
        -->
        <p class="mt-3 pt-3 border-t border-slate-200/70 text-[10px] font-black uppercase tracking-widest text-slate-400">
          ${esc(escapeHtml, TEXTS.commission)} · ${esc(escapeHtml, formatGoCommission(booking.commission.amountCents))}
        </p>
      ` : ""}
      ${booking.status === "checked_in" ? `
        <div class="mt-3">
          <button type="button" data-go-booking-action="complete" data-go-booking-id="${esc(escapeHtml, booking.id)}"
            class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">${esc(escapeHtml, TEXTS.markDone)}</button>
        </div>
      ` : ""}
    </div>
  `;
}

/**
 * Das Suchfeld ueber der Aktiv-Liste.
 *
 * Es ist nicht bloss eine Bequemlichkeit, sondern der einzige Weg zur
 * Bestaetigung: Der Gast zeigt seinen Code, der Kellner tippt ihn, und erst
 * die gefundene Buchung traegt den Knopf. Ohne Code passiert nichts.
 */
function renderGoCodeSearch({ code = "", status = "", busy = false, deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  return `
    <div class="mb-4" data-go-code-search>
      <div class="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-400 transition-colors">
        <span class="pl-2 text-slate-400">${safeIcon(icon, "search", "w-4 h-4")}</span>
        <input type="text" data-go-code-input value="${esc(escapeHtml, code)}"
          placeholder="${esc(escapeHtml, TEXTS.codePlaceholder)}"
          autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
          class="flex-1 min-w-0 bg-transparent py-2 text-sm font-black uppercase tracking-[0.2em] text-slate-900 outline-none" />
        <button type="button" data-go-code-submit ${busy ? "disabled" : ""}
          class="shrink-0 px-4 py-2 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white ${busy ? "opacity-60" : ""}">
          ${esc(escapeHtml, busy ? TEXTS.searching : TEXTS.search)}
        </button>
      </div>
      ${status ? `<p class="mt-2 text-[10px] font-bold text-rose-500">${esc(escapeHtml, status)}</p>` : ""}
    </div>
  `;
}

function renderSection({ eyebrow = "", title = "", sub = "", action = "", body = "", deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  return `
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${esc(escapeHtml, eyebrow)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${esc(escapeHtml, title)}</h3>
          ${sub ? `<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${esc(escapeHtml, sub)}</p>` : ""}
        </div>
        ${action}
      </div>
      ${body}
    </div>
  `;
}

function renderOfferRow(offer = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const badge = offer.status === "paused" ? TEXTS.paused : (offer.status === "archived" ? TEXTS.archived : "");
  return `
    <div class="flex items-start gap-4 p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${esc(escapeHtml, offer.id)}">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 truncate">${esc(escapeHtml, offer.benefitLabel || "")}</p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400">
          ${esc(escapeHtml, describeGoPartyRanges(offer))} &middot; ${esc(escapeHtml, describeGoSchedule(offer))}
        </p>
        <p class="text-[9px] font-black uppercase tracking-widest mt-1 ${offer.status === "active" ? "text-emerald-600" : "text-slate-400"}">
          ${esc(escapeHtml, badge || TEXTS.statActive)}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <button type="button" data-go-offer-edit="${esc(escapeHtml, offer.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${esc(escapeHtml, TEXTS.edit)}</button>
        <button type="button" data-go-offer-toggle="${esc(escapeHtml, offer.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${esc(escapeHtml, offer.status === "active" ? TEXTS.paused : TEXTS.activate)}</button>
        <button type="button" data-go-offer-archive="${esc(escapeHtml, offer.id)}"
          class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">${esc(escapeHtml, TEXTS.archive)}</button>
      </div>
    </div>
  `;
}

/**
 * Die Vorschau - genau die Karte, die der Gast spaeter sieht (Punkt 81).
 * Sie wird aus demselben Angebot gebaut wie das Ergebnis der Suche.
 */
export function renderGoOfferPreviewCore({ offer = {}, businessName = "", deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  return `
    <div class="rounded-[1.8rem] border border-slate-200 bg-white p-5" data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.preview)}</p>
      <p class="mt-3 text-[13px] font-black text-slate-900">
        ${esc(escapeHtml, businessName)} <span class="font-bold text-slate-400">${esc(escapeHtml, TEXTS.offering)}</span>
      </p>
      <p class="mt-2 text-2xl font-black tracking-tighter text-slate-900">${esc(escapeHtml, offer.benefitLabel || "")}</p>
      <p class="text-xs font-bold text-slate-500">${esc(escapeHtml, TEXTS.forGroup)}</p>
      <p class="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        ${esc(escapeHtml, describeGoPartyRanges(offer))} &middot; ${esc(escapeHtml, describeGoSchedule(offer))}
      </p>
      <span class="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white">
        ${esc(escapeHtml, TEXTS.accept)}
      </span>
    </div>
  `;
}

function fieldLabel(escapeHtml, text = "", forId = "") {
  return `<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${forId ? ` for="${esc(escapeHtml, forId)}"` : ""}>${esc(escapeHtml, text)}</label>`;
}

function chip(label, { active = false, attr = "", value = "", escapeHtml = null } = {}) {
  return `
    <button type="button" ${attr ? `${attr}="${esc(escapeHtml, value)}"` : ""} aria-pressed="${active ? "true" : "false"}"
      class="min-h-[44px] px-4 rounded-2xl text-xs font-black transition-colors ${active
        ? "bg-slate-900 text-white"
        : "bg-slate-50 text-slate-600 border border-slate-100"}">
      ${esc(escapeHtml, label)}
    </button>
  `;
}

/**
 * Welche der beiden Antworten des Gastes ein Angebot bedient.
 *
 * Der Wirt kreuzt an, WEM er das Angebot geben will - "Ushqim", "Pije" oder
 * beides. Gespeichert wird weiter eine einzelne Kategorie, weil die
 * Matching-Engine danach filtert:
 *
 *   nur Ushqim  -> "food"
 *   nur Pije    -> "drinks"   (deckt Kafe, Pije und Ëmbëlsira ab, siehe GO_INTENTS)
 *   beides      -> "all"      (passt zusaetzlich auf "Nuk e di")
 *
 * Die Rueckrichtung ist noetig, weil bestehende Angebote noch "coffee" oder
 * "dessert" tragen koennen: Beide gehoeren zur Antwort "Pije".
 */
export function goIntentsFromCategory(category = "") {
  const key = String(category || "all").trim().toLowerCase();
  if (key === "food") return ["food"];
  if (key === "coffee" || key === "drinks" || key === "dessert") return ["drinks"];
  return ["food", "drinks"];
}

export function goCategoryFromIntents(intents = []) {
  const list = Array.isArray(intents) ? intents : [];
  const food = list.includes("food");
  const drinks = list.includes("drinks");
  if (food && drinks) return "all";
  if (food) return "food";
  if (drinks) return "drinks";
  // Nichts angekreuzt ist keine Auswahl, sondern ein unfertiges Formular -
  // der Editor blockt das ab, bevor es hier ankommt.
  return "";
}

/**
 * Der Editor als Modal ueber der GO-Seite.
 *
 * Es liegt bewusst INNERHALB der GO-Seite und nicht in der geteilten
 * Overlay-Flaeche der App: Diese fuehrt fuer jedes Modal eigene Wurzeln durch
 * fuenf Dateien, und der Editor braucht davon nichts. Er braucht eine Flaeche
 * ueber der Liste - und die kostet hier zwei verschachtelte divs.
 */
export function renderGoOfferEditorCore({
  editor = null,
  businessName = "",
  deps = {}
} = {}) {
  if (!editor) return "";
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const draft = editor.draft || {};
  const errors = Array.isArray(editor.errors) ? editor.errors : [];
  const errorFor = (field) => errors.find((entry) => entry.field === field)?.message || "";
  const partyRanges = Array.isArray(draft.partyRanges) ? draft.partyRanges : [];
  const scheduleMode = draft.schedule?.mode === "windows" ? "windows" : "always";
  const intents = goIntentsFromCategory(draft.category);
  // "percent" oder alles andere. Ein Angebot, das frueher als freeItem oder
  // custom angelegt wurde, erscheint hier als Aksion - seine Werte bleiben
  // dabei stehen, weil der Entwurf sie weitertraegt.
  const isPercent = (draft.benefit?.kind || "percent") === "percent";
  const isEdit = editor.mode === "edit";
  const inputClass = "mt-2 w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400";
  const divider = `<div class="h-px bg-slate-100"></div>`;
  const hint = (text) => `<p class="mt-1 text-[11px] font-semibold text-slate-400">${esc(escapeHtml, text)}</p>`;

  return `
    <div class="fixed inset-0 z-50 flex items-end justify-center" data-go-offer-editor role="dialog" aria-modal="true"
      aria-label="${esc(escapeHtml, isEdit ? TEXTS.editOffer : TEXTS.createOffer)}">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" data-go-offer-cancel></div>

      <div class="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div class="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-slate-100">
          <div class="flex-1 min-w-0">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${esc(escapeHtml, TEXTS.brand)}</span>
            <h2 class="text-xl font-black italic uppercase tracking-tighter truncate">${esc(escapeHtml, isEdit ? TEXTS.editOffer : TEXTS.createOffer)}</h2>
          </div>
          <button type="button" data-go-offer-cancel aria-label="${esc(escapeHtml, TEXTS.cancel)}"
            class="flex-none p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500">
            ${safeIcon(icon, "x", "w-4 h-4")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            ${fieldLabel(escapeHtml, TEXTS.benefitQuestion)}
            <div class="mt-2 flex flex-wrap gap-2">
              ${chip(TEXTS.benefitPercent, { active: isPercent, attr: "data-go-benefit-kind", value: "percent", escapeHtml })}
              ${chip(TEXTS.benefitAction, { active: !isPercent, attr: "data-go-benefit-kind", value: "bundle", escapeHtml })}
            </div>
            ${isPercent ? `
              <input id="goBenefitPercent" type="number" inputmode="numeric" min="1" max="90" step="1" data-go-benefit-percent
                placeholder="${esc(escapeHtml, TEXTS.percentPlaceholder)}"
                value="${esc(escapeHtml, draft.benefit?.percent || "")}" class="${inputClass}" />
            ` : `
              <input id="goBenefitItem" type="text" data-go-benefit-item
                placeholder="${esc(escapeHtml, TEXTS.actionItemPlaceholder)}"
                value="${esc(escapeHtml, draft.benefit?.itemName || "")}" class="${inputClass}" />
              <input id="goBenefitPrice" type="text" inputmode="decimal" data-go-benefit-price
                placeholder="${esc(escapeHtml, TEXTS.actionPricePlaceholder)}"
                value="${esc(escapeHtml, draft.benefit?.priceText || "")}" class="${inputClass}" />
            `}
            ${errorFor("benefit") ? `<p class="mt-2 text-[11px] font-bold text-rose-500">${esc(escapeHtml, errorFor("benefit"))}</p>` : ""}
          </div>

          ${divider}

          <div>
            ${fieldLabel(escapeHtml, TEXTS.partyQuestion)}
            <div class="mt-2 flex flex-wrap gap-2">
              ${GO_PARTY_RANGES.map((entry) => chip(entry.label, {
                active: partyRanges.includes(entry.key),
                attr: "data-go-offer-party",
                value: entry.key,
                escapeHtml
              })).join("")}
            </div>
            ${errorFor("partyRanges") ? `<p class="mt-2 text-[11px] font-bold text-rose-500">${esc(escapeHtml, errorFor("partyRanges"))}</p>` : ""}
          </div>

          ${divider}

          <div>
            ${fieldLabel(escapeHtml, TEXTS.categoryQuestion)}
            ${hint(TEXTS.categoryHint)}
            <div class="mt-3 space-y-2">
              ${[
                { key: "food", label: TEXTS.ifFood },
                { key: "drinks", label: TEXTS.ifDrinks }
              ].map((entry) => {
                const active = intents.includes(entry.key);
                // Die Zeile darunter ist die des Gastes - aus GO_INTENTS, nicht
                // hier noch einmal getippt.
                const intentHint = GO_INTENTS.find((item) => item.key === entry.key)?.hint || "";
                return `
                  <button type="button" data-go-offer-intent="${esc(escapeHtml, entry.key)}" aria-pressed="${active ? "true" : "false"}"
                    class="w-full text-left min-h-[56px] px-4 py-3 rounded-2xl border transition-colors ${active
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-slate-50 border-slate-100 text-slate-600"}">
                    <span class="block text-xs font-black">${esc(escapeHtml, entry.label)}</span>
                    <span class="block mt-0.5 text-[11px] font-semibold ${active ? "text-white/60" : "text-slate-400"}">${esc(escapeHtml, intentHint)}</span>
                  </button>
                `;
              }).join("")}
            </div>
            ${errorFor("category") ? `<p class="mt-2 text-[11px] font-bold text-rose-500">${esc(escapeHtml, errorFor("category"))}</p>` : ""}
          </div>

          ${divider}

          <div>
            ${fieldLabel(escapeHtml, TEXTS.scheduleQuestion)}
            <div class="mt-2 flex flex-wrap gap-2">
              ${chip(TEXTS.always, { active: scheduleMode === "always", attr: "data-go-offer-schedule", value: "always", escapeHtml })}
              ${chip(TEXTS.specificHours, { active: scheduleMode === "windows", attr: "data-go-offer-schedule", value: "windows", escapeHtml })}
            </div>
            ${scheduleMode === "windows" ? `
              <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  ${fieldLabel(escapeHtml, TEXTS.hoursFrom, "goOfferFrom")}
                  <input id="goOfferFrom" type="time" data-go-offer-from value="${esc(escapeHtml, editor.windowFrom || "14:00")}" class="${inputClass}" />
                </div>
                <div>
                  ${fieldLabel(escapeHtml, TEXTS.hoursTo, "goOfferTo")}
                  <input id="goOfferTo" type="time" data-go-offer-to value="${esc(escapeHtml, editor.windowTo || "18:00")}" class="${inputClass}" />
                </div>
              </div>
            ` : ""}
            ${errorFor("schedule") ? `<p class="mt-2 text-[11px] font-bold text-rose-500">${esc(escapeHtml, errorFor("schedule"))}</p>` : ""}
          </div>

          ${divider}

          ${renderGoOfferPreviewCore({ offer: draft, businessName, deps })}

          ${editor.status ? `<p class="text-[11px] font-bold text-rose-500 text-center">${esc(escapeHtml, editor.status)}</p>` : ""}
        </div>

        <div class="px-6 pt-4 pb-6 border-t border-slate-100 grid grid-cols-1 gap-2.5 app-modal-safe-bottom">
          <button type="button" data-go-offer-save ${editor.saving ? "disabled" : ""}
            class="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform ${editor.saving ? "opacity-60" : ""}">
            ${esc(escapeHtml, editor.saving ? TEXTS.saving : (isEdit ? TEXTS.save : TEXTS.activate))}
          </button>
          <button type="button" data-go-offer-cancel
            class="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest active:scale-[0.98] transition-transform">
            ${esc(escapeHtml, TEXTS.cancel)}
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Die GO-Seite des Lokals: Kennzahlen, Tab-Leiste, darunter die gewaehlte
 * Liste. Eine Seite wie der Ofertat-Editor, kein Overlay.
 */
export function renderGoAdminBodyCore({
  restaurantName = "",
  tab = "active",
  // Die zwei Zahlen des Tages, wie der Server sie gezaehlt hat.
  stats = {},
  // Das Suchfeld und die Buchung, die es gefunden hat. Nur diese Buchung
  // traegt den Bestaetigen-Knopf.
  search = {},
  bookings = [],
  offers = [],
  settings = {},
  paused = false,
  loading = false,
  error = "",
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const openBookings = bookings.filter((booking) => ["confirmed", "checked_in"].includes(booking.status));
  const pastBookings = bookings.filter((booking) => !["confirmed", "checked_in"].includes(booking.status));
  const liveOffers = offers.filter((offer) => offer.status !== "archived");

  let section = "";
  if (tab === "offers") {
    section = renderSection({
      eyebrow: TEXTS.brand,
      title: TEXTS.tabs.offers,
      sub: `${liveOffers.length} ${liveOffers.length === 1 ? "oferte" : "oferta"}`,
      action: `
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${safeIcon(icon, "plus", "w-4 h-4")}
        </button>
      `,
      body: liveOffers.length
        ? `<div class="space-y-3">${liveOffers.map((offer) => renderOfferRow(offer, deps)).join("")}</div>`
        : `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.emptyTitle)}</div>`,
      deps
    });
  } else if (tab === "archive") {
    section = renderSection({
      eyebrow: TEXTS.brand,
      title: TEXTS.tabs.archive,
      sub: `${pastBookings.length}`,
      body: pastBookings.length
        ? `<div class="space-y-3">${pastBookings.map((booking) => renderBookingRow(booking, deps)).join("")}</div>`
        : `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.noHistory)}</div>`,
      deps
    });
  } else if (tab === "options") {
    const pausedUntil = clock(settings?.pausedUntil);
    section = renderSection({
      eyebrow: TEXTS.brand,
      title: TEXTS.tabs.options,
      body: `
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${esc(escapeHtml, TEXTS.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${esc(escapeHtml, paused ? `${TEXTS.pausedUntil} ${pausedUntil}` : "ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${paused ? "text-amber-600" : "text-emerald-600"}">
            ${esc(escapeHtml, paused ? TEXTS.paused : TEXTS.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${paused
            ? `<button type="button" data-go-pause="0" class="min-h-[44px] px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${esc(escapeHtml, TEXTS.resume)}</button>`
            : [
              { value: "30", label: "30 min" },
              { value: "60", label: "1 orë" },
              { value: "tomorrow", label: "Deri nesër" },
              { value: "-1", label: "Pa afat" }
            ].map((entry) => `
              <button type="button" data-go-pause="${entry.value}"
                class="min-h-[44px] px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${esc(escapeHtml, entry.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${esc(escapeHtml, TEXTS.keepsRunning)}</p>
      `,
      deps
    });
  } else {
    section = renderSection({
      eyebrow: TEXTS.brand,
      title: TEXTS.tabs.active,
      sub: `${openBookings.length}`,
      body: `
        ${renderGoCodeSearch({ code: search.code, status: search.status, busy: search.busy, deps })}
        ${search.booking ? `
          <div class="mb-4">${renderBookingRow(search.booking, deps, { found: true })}</div>
        ` : ""}
        ${loading
          ? `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${esc(escapeHtml, TEXTS.loading)}</div>`
          : (openBookings.length
            ? `<div class="space-y-3">${openBookings
              // Die gefundene Buchung steht schon oben - zweimal dieselbe waere
              // zweimal derselbe Gast.
              .filter((booking) => booking.id !== search.booking?.id)
              .map((booking) => renderBookingRow(booking, deps)).join("")}</div>`
            : `<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.noBookings)}</div>`)}
      `,
      deps
    });
  }

  return `
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <!--
        Das Stylesheet steht in der Seite und nicht im Kopf des Dokuments: Die
        Reihe braucht Regeln, die sich mit Tailwind-Klassen nicht schreiben
        lassen (Zeilenbegrenzung, versteckte Bildlaufleiste, Rasterpunkte).
        Es wird mit der Seite ersetzt, also gibt es es immer genau einmal.
      -->
      <style>${GO_ADMIN_CSS}</style>
      <!--
        Dieselbe Ueberschrift wie im Qyteti: oben der Name in einer Zeile,
        darunter ein Satz in klein und grau. Vorher standen hier drei Zeilen
        - eine Marke, eine Ueberschrift, ein Name - und das Lokal las von oben
        nach unten dreimal, wo es ist, bevor es einmal las, was es hier tun
        kann. Zwei Zeilen sagen dasselbe.

        Das GO steht im Blau der Marke und direkt am Wort: "MNYRAGO" ist ein
        Name, kein Wort mit einer Beschriftung daneben.
      -->
      <div class="mb-6">
        <h1 class="text-xl font-black tracking-tight text-slate-900 md:text-2xl">${esc(escapeHtml, TEXTS.brandMnyra)}<span class="text-indigo-600">${esc(escapeHtml, TEXTS.brandGo)}</span></h1>
        <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${esc(escapeHtml, restaurantName ? `${TEXTS.editor} ${restaurantName}` : TEXTS.editor)}</p>
      </div>

      ${renderGoHighlightRow({ stats, deps })}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        dieselbe Flaeche wie im Paneli. Die Reihe darueber bleibt frei: sie
        gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="go-bento" data-go-bento>
        ${renderGoTabs({ tab, deps })}
        <div>
          ${section}
          ${error ? `<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${esc(escapeHtml, error)}</p>` : ""}
        </div>
      </div>
    </div>
  `;
}

export function renderGoAdminNoBusinessStateCore({ deps = {}, resolving = false } = {}) {
  const icon = deps.icon;
  const escapeHtml = deps.escapeHtml;
  if (resolving) {
    return `
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${esc(escapeHtml, TEXTS.loadingBusiness)}</p>
        </div>
      </div>
    `;
  }
  return `
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${safeIcon(icon, "lock", "w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${esc(escapeHtml, TEXTS.brand)}</h2>
        <p class="text-sm text-slate-500">${esc(escapeHtml, TEXTS.onlyBusiness)}</p>
      </div>
    </div>
  `;
}

export const BUSINESS_GO_TEXTS = TEXTS;
