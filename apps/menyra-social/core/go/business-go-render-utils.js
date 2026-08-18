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
import {
  GO_WEEKDAY_KEYS,
  goWeekdayShortLabel
} from "../../../../shared/go/go-time-core.js";
import {
  GO_BENEFIT_BUNDLE,
  GO_BENEFIT_KINDS,
  GO_BENEFIT_DISCOUNT,
  GO_BENEFIT_FREE_ITEM,
  GO_BENEFIT_SPECIAL_PRICE,
  buildGoBenefitView,
  describeGoPartyRanges,
  describeGoSchedule,
  formatGoPrice,
  formatGoPriceInput,
  validateGoOffer
} from "../../../../shared/go/go-offer-core.js";
import { normalizeGoBookingStatus } from "../../../../shared/go/go-booking-core.js";
import {
  GO_CARD_VARIANT_COMPACT,
  GO_OFFER_CARD_CSS,
  renderGoOfferCardCore
} from "./go-offer-card-render-utils.js";
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
  // Der eine Satz unter der Ueberschrift (Punkt 2). Er sagt nicht, was zu tun
  // ist - das sagen die Fragen darunter - sondern WARUM ein Lokal dieses
  // Formular ausfuellt: Es schreibt sein Angebot einmal hin und wird danach
  // gefunden. Ohne ihn liest ein Wirt, der GO zum ersten Mal oeffnet, ein
  // Formular ohne Adressat.
  editorHint: "Krijoje ofertën një herë. Mnyra ua shfaq automatikisht klientëve që përputhen.",
  // Die Karten-Reihe: ein Handgriff, zwei Zahlen des Tages.
  scanOffer: "Skano ofertën",
  seenToday: "Ofertën e kanë parë sot",
  acceptedToday: "E kanë pranuar sot",
  editOffer: "Ndrysho ofertën",
  preview: "Kështu e sheh klienti",
  activate: "Aktivizo",
  save: "Ruaj ofertën",
  saving: "Po ruhet...",
  // Geschlossen wird oben rechts mit dem X - wie im Speisen-Modal. Ein
  // zweiter Knopf "Anulo" im Fuss sagte dasselbe noch einmal und stand dem
  // einen Knopf im Weg, der wirklich etwas tut.
  close: "Mbyll",
  edit: "Edit",
  offering: "po ju ofron",
  forGroup: "për grupin tuaj",
  accept: "Prano ofertën",
  finalizeTitle: "Finalizo ofertën",
  benefitQuestion: "Çka po ofron?",
  // Der Satz unter der Frage. Er sagt, was hier zu tun ist - und mehr nicht:
  // Das Lokal waehlt eine Art, danach stehen genau die Felder da, die diese
  // Art braucht.
  // Kurz und in der Sprache des Wirts: "Lloji i ofertës" ist ein Wort aus dem
  // Formular, "çka i ofron klientit" ist die Frage, die er sich ohnehin stellt.
  benefitHint: "Zgjidh çfarë dëshiron t'i ofrosh klientit.",
  // Vier Arten, vier Woerter. Keine Untertitel in den Knoepfen, keine langen
  // Namen (Punkt 20).
  benefitPercent: "Zbritje %",
  benefitBundle: "Paketë GO",
  benefitFree: "Falas",
  benefitSpecial: "Çmim special",
  // Ein Angebot aus einer frueheren Fassung, dessen Art es nicht mehr gibt.
  benefitLegacy: "Zgjidh llojin e ofertës.",
  // Zbritje %
  discountQuestion: "Sa zbritje po ofron?",
  discountOther: "Tjetër",
  discountPlaceholder: "Shkruaj zbritjen",
  scopeQuestion: "Ku vlen zbritja?",
  scopeAll: "Krejt fatura",
  scopeFood: "Ushqim",
  scopeDrinks: "Pije",
  // Paketë GO
  bundleQuestion: "Çka përfshin paketa?",
  bundlePlaceholder: "p.sh. 2 Burger + 2 Pije",
  // Falas
  freeQuestion: "Çka merr falas?",
  freePlaceholder: "p.sh. 1 Pije",
  // Nicht "Me çfarë kushti?": Ein Kushti ist ein Wort aus einem Vertrag. Die
  // Frage, die das Lokal beantwortet, ist eine ueber den Augenblick im Lokal -
  // wann bekommt der Gast das Gratisprodukt (Punkt 7).
  conditionQuestion: "Kur e merr falas?",
  conditionFood: "Me ushqim",
  conditionDrink: "Me pije",
  conditionAny: "Me çdo porosi",
  conditionCustom: "Tjetër",
  customConditionQuestion: "Shkruaj kushtin",
  customConditionPlaceholder: "p.sh. kur porosit 2 pizza",
  // Çmim special
  productQuestion: "Cili produkt?",
  productPlaceholder: "p.sh. Pizza Margherita",
  // Preise und die Zeile darunter. "Kursen" ist eine Auskunft, keine
  // Bewertung: Es gibt keinen Hinweis, dass ein Rabatt zu klein sei
  // (Punkt 30).
  priceRegular: "Çmimi normal",
  priceGo: "Çmimi GO",
  pricePlaceholder: "0,00",
  saving: "Kursen",
  // Das Foto des Angebots (Punkt 9 bis 13). Es steht direkt bei den Angaben
  // zum Angebot und nicht am Ende des Formulars: Es gehoert zum Angebot, nicht
  // zu den Einstellungen darum herum.
  photoQuestion: "Foto e ofertës",
  photoHint: "Shto një foto që klienti ta shohë ofertën menjëherë.",
  photoOptional: "Opsionale",
  photoAdd: "Shto një foto",
  photoSource: "Nga telefoni ose kamera",
  photoChange: "Ndrysho",
  photoRemove: "Hiq",
  photoUploading: "Po ngarkohet...",
  photoError: "Fotoja nuk u ngarkua. Provo prapë.",
  // "Për sa persona vlen?" - vier Woerter, und ein Wirt weiss, was er
  // antwortet. "Prej sa personave vlen kjo ofertë" war eine Frage, die man
  // zweimal liest (Punkt 47.1).
  partyQuestion: "Për sa persona vlen?",
  partyHint: "Zgjidh për çfarë madhësie të grupit vlen oferta.",
  // Ein Kreuz fuer alle vier Bereiche. Es ist keine fuenfte Gruppe, sondern
  // die Abkuerzung fuer "mir ist die Gruppengroesse gleich" (Punkt 15).
  partyAll: "Të gjithë",
  // Nicht "Kategoria". Der Wirt beantwortet hier nicht, worauf sein Rabatt
  // gilt ("auf Kuchen"), sondern FUER WEN das Angebot gedacht ist: fuer den
  // Gast, der isst, oder fuer den, der nur etwas trinkt. Genau danach fragt
  // die Seite den Gast ("Për çka jeni?"), und nur wenn beide Seiten dieselbe
  // Frage beantworten, landet ein gutes Essens-Angebot nicht in der falschen
  // Gruppe.
  // "Kur e lshon këtë ofertë" liest sich wie eine Frage nach dem
  // Veroeffentlichen. Gefragt wird aber etwas anderes: bei WELCHER SUCHE des
  // Gastes Mnyra dieses Angebot zeigen soll (Punkt 16).
  categoryQuestion: "Kur të shfaqet oferta?",
  categoryHint: "Zgjidh kur kjo ofertë i përshtatet kërkimit të klientit.",
  // Die beiden Antworten des Gastes, aus seiner Sicht formuliert. Die Zeilen
  // darunter sind dieselben, die er im Qyteti liest - sie stehen in
  // GO_INTENTS und werden von dort gelesen, damit hier nie etwas anderes
  // steht als dort.
  ifFood: "Nëse kërkohet ushqim",
  // "Pije" allein war zu wenig: Ein Cafe, das Kaffee anbietet, sucht das Wort
  // Kafe - und findet es in der Zeile darunter erst, wenn es schon geraten hat
  // (Punkt 47.4).
  ifDrinks: "Nëse kërkohet kafe / pije",
  scheduleQuestion: "Kur vlen oferta?",
  scheduleHint: "Zgjidh kur klientët mund ta përdorin ofertën.",
  // "Gjithmonë" statt "Nonstop", "Orar specifik" statt "Specifik": Beides sagt
  // dem Wirt ohne Nachdenken, was es bedeutet (Punkt 47.6, 47.7).
  always: "Gjithmonë",
  specificHours: "Orar specifik",
  daysQuestion: "Ditët",
  hoursQuestion: "Orari",
  hoursFrom: "Nga",
  hoursTo: "Deri",
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
  around: "Rreth",
  finalize: "Finalizo",
  needsActivation: "Klienti duhet ta aktivizojë ofertën.",
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
/* Drei Masse, die vorher an Klassen hingen, die es im statischen Tailwind-Blatt
   nicht gibt (md:text-2xl, mt-0.5, min-h-[44px]): die Ueberschrift auf einem
   breiten Bildschirm, der Abstand ihrer Unterzeile, und die Fingerhoehe der
   Pausenknoepfe. Eine Fingerhoehe, die von einer Klasse ohne Regel abhaengt,
   ist keine Fingerhoehe. */
.go-title-sub { margin-top: 2px; }
@media (min-width: 768px) {
  .go-title { font-size: 1.5rem; line-height: 2rem; }
}
.go-pause { min-height: 44px; }
/* Das Suchfeld faerbt seinen Rahmen, wenn der Kellner darin tippt. */
.go-code-box { transition: border-color 0.15s ease; }
.go-code-box:focus-within { border-color: #818cf8; }
/* Die Zeile mit Personen, Ankunft und Vorteil an einer Buchung. Sie hing an
   gap-x-3/gap-y-1 - zwei Klassen, die das statische Blatt nicht kennt, also
   klebten die Angaben aneinander. */
.go-booking-meta { gap: 4px 12px; }
/* Und die Buchung, die der Code gefunden hat: Sie ist hervorgehoben, weil an
   ihr der Knopf haengt, der Geld entstehen laesst. border-indigo-300 und
   ring-indigo-100 gab es im Blatt nicht - die gefundene Buchung sah aus wie
   jede andere. */
.go-booking--found { border-color: #a5b4fc; box-shadow: 0 0 0 2px #e0e7ff; }
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
 * Hier steht KEIN Kurzcode. Die Finalisierung ist der Augenblick, in dem Geld
 * entsteht - sie soll nur gelingen, wenn ein Gast davorsteht und seinen Code
 * zeigt. Stuende der Code auf der Zeile, koennte ihn jeder abschreiben.
 *
 * Deshalb traegt eine Zeile aus der Liste auch keinen FINALIZO-Knopf. Er
 * erscheint nur an der Buchung, die ueber das Suchfeld gefunden wurde
 * ("found") - und dorthin kommt man nur mit dem Code. Ausserdem nur, wenn der
 * Gast gewischt hat: Eine bloss angenommene Oferta ist noch kein Besuch.
 */
function renderBookingRow(booking = {}, deps = {}, { found = false } = {}) {
  const escapeHtml = deps.escapeHtml;
  // Der Vorteil steht in der eingefrorenen Kopie. Was das Lokal hier liest,
  // ist die Zusage von damals - nicht das heutige Angebot (Punkt 92).
  const benefitLabel = booking.benefitLabel || booking.snapshot?.benefitLabel || "";
  const unseen = !booking.businessSeenAt;
  const partySize = booking.partySizeVerified || booking.partySizeRequested || booking.partySize || 1;
  // Uebersetzt gelesen. Ein Server, der noch nicht neu veroeffentlicht wurde,
  // schickt "confirmed" - und dann erschiene weder der FINALIZO-Knopf noch der
  // Hinweis darunter, und der Kellner stuende vor einer Zeile ohne Ausweg.
  const status = normalizeGoBookingStatus(booking.status);
  // Die Zeile braucht eine Ueberschrift. Der Code faellt dafuer aus, und eine
  // Ankunft gibt es nicht mehr - also steht dort, wann der Gast zugegriffen
  // hat. Das ist das Einzige, wonach ein Lokal seine Liste ordnen kann.
  const accepted = clock(booking.acceptedAt);
  const heading = accepted ? `${TEXTS.around} ${accepted}` : TEXTS.guestName;

  return `
    <div class="p-4 rounded-[1.6rem] border ${found
      ? "go-booking--found bg-white"
      : (unseen ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50 border-slate-100")}"
      data-go-booking="${esc(escapeHtml, booking.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">${esc(escapeHtml, heading)}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${esc(escapeHtml, goBookingBusinessStatusLabel(booking))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${esc(escapeHtml, TEXTS.guestName)}</p>
      <div class="go-booking-meta mt-3 flex flex-wrap items-center text-xs font-bold text-slate-600">
        <span>👥 ${esc(escapeHtml, `${partySize} ${TEXTS.guests}`)}</span>
        ${benefitLabel ? `<span>🎁 ${esc(escapeHtml, benefitLabel)}</span>` : ""}
      </div>
      ${found && status === "activated" ? `
        <div class="mt-4">
          <!--
            Die Gruppengroesse gehoert dem Kellner, nicht dem Gast: Er steht
            vor der Gruppe und sieht, wieviele es wirklich sind. Was er hier
            stehen laesst oder aendert, ist die Zahl, die abgerechnet wird
            (Punkt 12).
          -->
          <label class="flex items-center justify-between gap-3 mb-3">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${esc(escapeHtml, TEXTS.partyAtTable)}</span>
            <input type="number" inputmode="numeric" min="1" max="10" data-go-confirm-party
              value="${esc(escapeHtml, partySize)}"
              class="w-16 text-center py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900" />
          </label>
          <button type="button" data-go-booking-finalize data-go-booking-id="${esc(escapeHtml, booking.id)}"
            class="w-full py-3.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white active:scale-[0.98] transition-transform">
            ${esc(escapeHtml, TEXTS.finalize)}
          </button>
        </div>
      ` : ""}
      ${found && status === "accepted" ? `
        <!--
          Der Gast steht daneben und hat noch nicht gewischt. Ein "nicht
          gefunden" schickte den Kellner auf Fehlersuche bei sich selbst.
        -->
        <p class="mt-4 text-[11px] font-black uppercase tracking-widest text-amber-600">
          ${esc(escapeHtml, TEXTS.needsActivation)}
        </p>
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
      <div class="go-code-box flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white">
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

/**
 * Eine Oferta in der Liste des Wirts.
 *
 * Sie wird mit DERSELBEN Karte gezeichnet, die der Gast sieht und die in der
 * Vorschau des Modals steht. Das ist keine Verzierung, sondern die Antwort auf
 * eine Frage, die sich sonst jeder Wirt stellt: Hier stand vorher eine
 * schmucklose Zeile mit dem Kurztext - kein Foto, kein durchgestrichener
 * Normalpreis, keine Ersparnis. Wer ein Bild hochgeladen, es in der Vorschau
 * gesehen und gespeichert hatte, fand es hier nicht wieder und musste
 * schliessen, dass es nicht gespeichert wurde.
 *
 * Gespeichert war es die ganze Zeit. Es wurde nur nie wieder gezeigt.
 *
 * Die Fassung ist "compact": In einer Liste von fuenf Angeboten waeren fuenf
 * 16:9-Bilder ein Bildschirm voll Scrollen, bevor der Wirt zwei davon
 * vergleicht - dieselbe Ueberlegung wie bei den Ergebnissen des Gastes.
 */
function renderOfferRow(offer = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const badge = offer.status === "paused" ? TEXTS.paused : (offer.status === "archived" ? TEXTS.archived : "");
  return `
    <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${esc(escapeHtml, offer.id)}">
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Der Knopf des Gastes ("Prano
        ofertën") gehoert nicht in die Liste des Wirts, und was darin steht,
        hoert auf nichts.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${renderGoOfferCardCore({
          businessName: "",
          imageUrl: offer.imageUrl || "",
          variant: GO_CARD_VARIANT_COMPACT,
          benefitLabel: offer.benefitLabel || "",
          // Dieselbe Aufteilung wie beim Gast und in der Vorschau: kleiner
          // Hinweis, grosse Zeile, Normalpreis durchgestrichen, Ersparnis.
          benefitView: buildGoBenefitView(offer.benefit || {}),
          meta: [
            { icon: "users", label: describeGoPartyRanges(offer) },
            { icon: "clock", label: describeGoSchedule(offer) }
          ]
        })}
      </div>
      <p class="text-[9px] font-black uppercase tracking-widest mt-3 ${offer.status === "active" ? "text-emerald-600" : "text-slate-400"}">
        ${esc(escapeHtml, badge || TEXTS.statActive)}
      </p>
      <div class="flex gap-2 mt-3">
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
 *
 * "Genau" heisst hier woertlich: Sie kommt aus derselben Datei wie die Karte
 * im Ergebnis der Suche (go-offer-card-render-utils.js), mit denselben
 * Klassen, denselben Groessen und demselben Knopf. Vorher war sie ein
 * Nachbau - eine weisse Kachel mit anderen Schriftgroessen und einem Knopf,
 * den es so nirgends gab. Ein Wirt, der danach seine Oferta im Qyteti sieht,
 * soll nichts Neues sehen.
 *
 * Was in den kleinen Zeilen steht, ist der Unterschied zwischen den beiden
 * Orten - und der ist gewollt: Der Gast liest dort SEINE Gruppe und SEINE
 * Ankunft, der Wirt liest, fuer wen und wann sein Angebot gilt.
 */
export function renderGoOfferPreviewCore({
  offer = {},
  businessName = "",
  // Das Bild, das noch nicht hochgeladen ist. Es kommt aus dem Speicher des
  // Telefons und gehoert deshalb nicht in den Entwurf: Was dort steht, wird
  // gespeichert, und eine blob:-Adresse ist morgen niemandes Foto.
  previewImageUrl = "",
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  return `
    <div data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${esc(escapeHtml, TEXTS.preview)}</p>
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Ein Knopf, der aussieht wie
        der des Gastes und auf nichts hoert, waere ein kaputter Knopf.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${renderGoOfferCardCore({
          businessName,
          // Das Foto steht in der Vorschau, sobald es gewaehlt ist - und noch
          // waehrend es hochlaedt, aus dem Speicher des Telefons. Die Vorschau
          // ist die Zusage, die das Lokal gleich gibt; eine Zusage, die das
          // Bild erst nach dem Speichern zeigt, kommt zu spaet.
          imageUrl: previewImageUrl || offer.imageUrl || "",
          benefitLabel: offer.benefitLabel || "",
          // Dieselbe Aufteilung, die auch beim Gast ankommt (buildGoResultCard).
          // Die Vorschau rechnet nichts eigenes - sonst waere sie wieder ein
          // Nachbau, nur einer ohne eigene Datei.
          benefitView: buildGoBenefitView(offer.benefit || {}),
          meta: [
            { icon: "users", label: describeGoPartyRanges(offer) },
            { icon: "clock", label: describeGoSchedule(offer) }
          ]
        })}
      </div>
    </div>
  `;
}

function fieldLabel(escapeHtml, text = "", forId = "") {
  return `<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${forId ? ` for="${esc(escapeHtml, forId)}"` : ""}>${esc(escapeHtml, text)}</label>`;
}

function chip(label, { active = false, attr = "", value = "", escapeHtml = null } = {}) {
  return `
    <button type="button" ${attr ? `${attr}="${esc(escapeHtml, value)}"` : ""} aria-pressed="${active ? "true" : "false"}"
      class="go-offer-chip px-4 rounded-2xl text-xs font-black transition-colors ${active
        ? "bg-slate-900 text-white"
        : "bg-slate-50 text-slate-600 border border-slate-100"}">
      ${esc(escapeHtml, label)}
    </button>
  `;
}

/* Die Section "ÇKA PO OFRON?" bringt ihre Masse selbst mit.

   Das ist keine Vorliebe fuer eigenes CSS, sondern eine Tatsache ueber diesen
   Build: Das Tailwind-Blatt der App wird statisch erzeugt und kennt keine
   Klassen mit eigenen Werten - `min-h-[56px]` steht in keiner Regel und wirkt
   deshalb nicht. Eine Fingerhoehe, die von einer Klasse abhaengt, die es nicht
   gibt, ist keine Fingerhoehe. Also stehen die Hoehen hier (Punkt 17: Felder
   56 px, Pillen 40 px, Knoepfe der Angebotsart 52 px).

   Dazu drei Dinge, die sich mit Tailwind ueberhaupt nicht sagen lassen:

   1. Das weiche Einblenden des Angebotsbereichs beim Wechsel der Art
      (Punkt 27). Es haengt an einer Klasse, die der Controller nur dann
      setzt, wenn wirklich die Art gewechselt hat - beim Tippen einer Pille
      innerhalb derselben Art blitzt nichts.
   2. Preisfelder ohne die kleinen Pfeile, die ein Zahlenfeld im Browser
      mitbringt: Sie sitzen genau dort, wo das € steht.
   3. Das €- und das %-Zeichen selbst, in der Mitte der Feldhoehe.

   Das Stylesheet steht im Modal und wird mit ihm ersetzt - also gibt es es
   immer genau einmal. */
const GO_OFFER_FORM_CSS = `
.go-offer-form--enter { animation: goOfferFormIn 180ms ease-out both; }
@keyframes goOfferFormIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
/* Der Abstand zur naechsten Section des Modals (Punkt 18: 28 bis 32 px, die
   restlichen 20 kommen aus dem space-y-5 des Modalkoerpers). */
.go-offer-section { padding-bottom: 8px; }
/* Ein Knopf der Angebotsart: gleiche Hoehe, gleiche Breite, gleiche Rundung -
   vier gleich grosse Flaechen fuer vier gleichrangige Antworten. */
.go-offer-kind { min-height: 52px; }
/* Die Antworten der anderen Fragen im Modal: die Gruppengroessen und der
   Zeitplan als Pille (44 px), Ushqim und Pije als ganze Zeile (56 px). */
.go-offer-chip { min-height: 44px; }
.go-offer-answer { min-height: 56px; }
/* Die Pillen darunter beantworten eine Nebenfrage und sind deshalb kleiner. */
.go-offer-pill { min-height: 40px; padding-left: 14px; padding-right: 14px; font-size: 12px; }
.go-offer-input { min-height: 56px; padding-top: 14px; padding-bottom: 14px; }
.go-offer-saving { font-size: 12px; }
.go-offer-price { position: relative; margin-top: 8px; }
.go-offer-price__unit {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  font-weight: 900;
  color: #94a3b8;
  pointer-events: none;
}
.go-offer-price input { padding-right: 40px; }
.go-offer-price input::-webkit-outer-spin-button,
.go-offer-price input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.go-offer-price input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
/* Die Flaeche fuer das Foto (Punkt 10). Sie traegt denselben hellen Grund und
   denselben dünnen Rahmen wie die Eingabefelder daneben - kein gestrichelter
   Rahmen: Der ist die Handschrift eines Web-Uploads von damals und sieht auf
   einem Telefon aus wie ein Fehler.

   Die Hoehe kommt aus dem Seitenverhaeltnis, in dem das Bild spaeter auf der
   Karte des Gastes steht. So ist die leere Flaeche schon der Platz, den das
   Foto einnehmen wird, und nach dem Antippen springt nichts. */
.go-offer-photo {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: #f8fafc;
  color: #64748b;
  font: inherit;
  text-align: center;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
.go-offer-photo:active { transform: scale(0.99); }
.go-offer-photo__plus {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #4f46e5;
}
.go-offer-photo__title { font-size: 13px; font-weight: 900; color: #0f172a; }
.go-offer-photo__sub { font-size: 11px; font-weight: 700; color: #94a3b8; }
/* Nach dem Hochladen nimmt das Bild denselben Platz ein - dieselbe Rundung,
   dasselbe Verhaeltnis, derselbe Zuschnitt wie auf der Karte des Gastes. */
.go-offer-photo__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: #f8fafc;
}
.go-offer-photo__img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
/* Waehrend das Bild zum Server geht, liegt es schon da - nur blasser, damit
   der Wirt sieht, dass noch etwas laeuft. */
.go-offer-photo__frame--busy .go-offer-photo__img { opacity: 0.55; }
/* Eine Pille in der Mitte unter dem Bild - keine Leiste ueber die ganze
   Breite: Die saehe aus wie ein Knopf, und dieser Hinweis ist keiner. */
.go-offer-photo__busy {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: 12px;
  background: rgb(15 23 42 / 0.72);
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
}
.go-offer-photo__actions { margin-top: 10px; display: flex; gap: 8px; }
.go-offer-photo__action {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
  color: #475569;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}
.go-offer-photo__action--remove { color: #e11d48; }
/* Der AKTIVIZO-Knopf, in seinen zwei Zustaenden (Punkt 42).

   Die Farben stehen HIER und nicht in Klassen - und das ist keine Vorliebe,
   sondern die Lehre aus einem unsichtbaren Knopf: Das Tailwind-Blatt der App
   wird statisch erzeugt und enthaelt nur die Klassen, die schon jemand benutzt
   hat. Die Klasse bg-indigo-300 war nicht darunter. Der Knopf stand da, mit
   weisser Schrift, auf weissem Grund - ein Knopf, den man nicht sieht, fehlt. */
.go-offer-save { background: #a5b4fc; box-shadow: none; }
.go-offer-save--ready {
  background: #4f46e5;
  box-shadow: 0 20px 25px -5px rgb(99 102 241 / 0.2), 0 8px 10px -6px rgb(99 102 241 / 0.2);
}
/* Die Zeile unter "Nëse kërkohet ushqim". Zwei Klassen mit eigenen Werten
   (mt-0.5, text-white/60) trugen sie vorher - beide stehen im statischen Blatt
   nicht, also stand die Zeile zu hoch und auf der gewaehlten Karte in Weiss
   auf Schwarz statt gedaempft. */
.go-offer-answer__hint { margin-top: 2px; color: #94a3b8; }
[aria-pressed="true"] > .go-offer-answer__hint { color: rgb(255 255 255 / 0.6); }
`;

/**
 * Ein Preisfeld: Zahl links, Zeichen rechts.
 *
 * Der Wirt schreibt das € nicht - es steht schon da (Punkt 5.2). Und die
 * Tastatur, die aufgeht, ist die mit den Zahlen: `inputmode="decimal"` fuer
 * Preise, `numeric` fuer Prozent (Punkt 28).
 */
function unitField({
  attr = "",
  unit = "€",
  value = "",
  placeholder = "",
  mode = "decimal",
  // Ohne den oberen Abstand: Den traegt hier die Huelle, damit das Zeichen in
  // der Mitte des FELDES sitzt und nicht in der Mitte von Feld plus Abstand.
  inputClass = "",
  escapeHtml = null
} = {}) {
  return `
    <div class="go-offer-price">
      <input type="text" ${attr} inputmode="${esc(escapeHtml, mode)}" autocomplete="off"
        placeholder="${esc(escapeHtml, placeholder)}" value="${esc(escapeHtml, value)}" class="${inputClass}" />
      <span class="go-offer-price__unit">${esc(escapeHtml, unit)}</span>
    </div>
  `;
}

// Die schnellen Auswahlknoepfe: Prozentwerte, Bereiche, Bedingungen. Kleiner
// als die Knoepfe der Angebotsart - sie beantworten eine Nebenfrage
// (Punkt 17: 36 bis 44 px).
function pill(label, { active = false, attr = "", value = "", escapeHtml = null } = {}) {
  return `
    <button type="button" ${attr ? `${attr}="${esc(escapeHtml, value)}"` : ""} aria-pressed="${active ? "true" : "false"}"
      class="go-offer-pill rounded-xl font-black transition-colors ${active
        ? "bg-slate-900 text-white"
        : "bg-slate-50 text-slate-600 border border-slate-100"}">
      ${esc(escapeHtml, label)}
    </button>
  `;
}

// Die vier Prozentwerte, die ein Lokal fast immer nimmt. Alles andere steht
// hinter "Tjetër" (Punkt 4.1).
const GO_DISCOUNT_PRESETS = Object.freeze([10, 15, 20, 25]);

/**
 * Der Bereich unter den vier Knoepfen - der einzige Teil der Section, der sich
 * beim Wechsel der Angebotsart aendert (Punkt 3, 9).
 *
 * Hier steht kein Freitextfeld. Das Lokal gibt Zahlen und Namen; den Satz, den
 * der Gast liest, baut Mnyra daraus (Punkt 8).
 */
function renderBenefitFields({
  benefit = {},
  percentCustom = false,
  errorFor = () => "",
  inputClass = "",
  inputBase = "",
  escapeHtml = null
} = {}) {
  const label = (text) => fieldLabel(escapeHtml, text);
  // Die Meldung steht an ihrem Feld und traegt seinen Namen: Nach einem
  // Antippen von AKTIVIZO faehrt der Editor zur ERSTEN davon (Punkt 43), und
  // dafuer muss sie sich finden lassen.
  const error = (field) => {
    const message = errorFor(field);
    return message
      ? `<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="${esc(escapeHtml, field)}">${esc(escapeHtml, message)}</p>`
      : "";
  };
  // Eine Art, die es im Formular nicht mehr gibt (ein Angebot von damals, als
  // es "Tavolinë" und einen eigenen Satz gab). Es steht weiter da, wie es ist -
  // gespeichert wird es erst wieder, wenn das Lokal eine der vier Arten
  // gewaehlt hat.
  if (!GO_BENEFIT_KINDS.includes(benefit.kind)) {
    return `
      <p class="go-offer-saving font-bold text-slate-400">${esc(escapeHtml, TEXTS.benefitLegacy)}</p>
      ${error("benefit")}
    `;
  }
  const percent = Number(benefit.percent) || 0;
  // "Tjetër" steht offen, sobald das Lokal es angetippt hat - oder sobald ein
  // Wert dasteht, den keine der Pillen zeigt (35 %, aus einem Angebot von
  // vorher).
  const showCustomPercent = percentCustom || (percent > 0 && !GO_DISCOUNT_PRESETS.includes(percent));
  const savingLine = () => {
    const saving = formatGoPrice(benefit.savingCents);
    if (!saving) return "";
    const percentOff = Math.round(Number(benefit.savingPercent) || 0);
    return `
      <p class="mt-3 go-offer-saving font-black text-emerald-600" data-go-benefit-saving>
        ${esc(escapeHtml, TEXTS.saving)} ${esc(escapeHtml, saving)}${percentOff > 0 ? ` &middot; -${percentOff}%` : ""}
      </p>
    `;
  };
  const priceFields = () => `
    <div class="mt-3">
      ${label(TEXTS.priceRegular)}
      ${unitField({
        attr: "data-go-benefit-regular",
        value: formatGoPriceInput(benefit.regularPriceCents),
        placeholder: TEXTS.pricePlaceholder,
        inputClass: inputBase,
        escapeHtml
      })}
      ${error("regularPrice")}
    </div>
    <div class="mt-3">
      ${label(TEXTS.priceGo)}
      ${unitField({
        attr: "data-go-benefit-go",
        value: formatGoPriceInput(benefit.goPriceCents),
        placeholder: TEXTS.pricePlaceholder,
        inputClass: inputBase,
        escapeHtml
      })}
      ${error("goPrice")}
    </div>
    ${savingLine()}
  `;

  if (benefit.kind === GO_BENEFIT_DISCOUNT) {
    return `
      ${label(TEXTS.discountQuestion)}
      <div class="mt-2 flex flex-wrap gap-2">
        ${GO_DISCOUNT_PRESETS.map((value) => pill(`${value}%`, {
          active: !showCustomPercent && percent === value,
          attr: "data-go-discount",
          value: String(value),
          escapeHtml
        })).join("")}
        ${pill(TEXTS.discountOther, {
          active: showCustomPercent,
          attr: "data-go-discount",
          value: "other",
          escapeHtml
        })}
      </div>
      ${showCustomPercent ? `
        <div class="mt-3">
          ${unitField({
            attr: "data-go-benefit-percent",
            unit: "%",
            mode: "numeric",
            value: percent > 0 ? String(percent) : "",
            placeholder: TEXTS.discountPlaceholder,
            inputClass: inputBase,
            escapeHtml
          })}
        </div>
      ` : ""}
      ${error("benefitPercent")}

      <div class="mt-4">
        ${label(TEXTS.scopeQuestion)}
        <div class="mt-2 flex flex-wrap gap-2">
          ${[
            ["all", TEXTS.scopeAll],
            ["food", TEXTS.scopeFood],
            ["drinks", TEXTS.scopeDrinks]
          ].map(([key, text]) => pill(text, {
            active: (benefit.scope || "all") === key,
            attr: "data-go-discount-scope",
            value: key,
            escapeHtml
          })).join("")}
        </div>
        ${error("benefitScope")}
      </div>
    `;
  }

  if (benefit.kind === GO_BENEFIT_BUNDLE) {
    return `
      ${label(TEXTS.bundleQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${esc(escapeHtml, TEXTS.bundlePlaceholder)}"
        value="${esc(escapeHtml, benefit.itemName || "")}" class="${inputClass}" />
      ${error("benefitItem")}
      ${priceFields()}
    `;
  }

  if (benefit.kind === GO_BENEFIT_FREE_ITEM) {
    const condition = String(benefit.conditionType || "");
    return `
      ${label(TEXTS.freeQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${esc(escapeHtml, TEXTS.freePlaceholder)}"
        value="${esc(escapeHtml, benefit.itemName || "")}" class="${inputClass}" />
      ${error("benefitItem")}

      <div class="mt-4">
        ${label(TEXTS.conditionQuestion)}
        <div class="mt-2 grid grid-cols-2 gap-2">
          ${[
            ["food", TEXTS.conditionFood],
            ["drink", TEXTS.conditionDrink],
            ["any_order", TEXTS.conditionAny],
            ["custom", TEXTS.conditionCustom]
          ].map(([key, text]) => pill(text, {
            active: condition === key,
            attr: "data-go-benefit-condition",
            value: key,
            escapeHtml
          })).join("")}
        </div>
        ${condition === "custom" ? `
          <div class="mt-3">
            ${label(TEXTS.customConditionQuestion)}
            <input type="text" data-go-benefit-condition-text autocomplete="off"
              placeholder="${esc(escapeHtml, TEXTS.customConditionPlaceholder)}"
              value="${esc(escapeHtml, benefit.customCondition || "")}" class="${inputClass}" />
          </div>
        ` : ""}
        ${error("benefitCondition")}
      </div>
    `;
  }

  if (benefit.kind === GO_BENEFIT_SPECIAL_PRICE) {
    return `
      ${label(TEXTS.productQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${esc(escapeHtml, TEXTS.productPlaceholder)}"
        value="${esc(escapeHtml, benefit.itemName || "")}" class="${inputClass}" />
      ${error("benefitItem")}
      ${priceFields()}
    `;
  }

  // Hierher kommt nichts: Die vier Arten oben sind GO_BENEFIT_KINDS, und alles
  // andere hat die Abfrage am Anfang schon abgefangen.
  return "";
}

/**
 * Die Foto-Section (Punkt 9 bis 13).
 *
 * Ein Bild, nicht fuenf. Eine GO-Karte hat eine Flaeche fuer ein Foto, und ein
 * Lokal, das drei hochlaedt, hat zwei davon umsonst gemacht.
 *
 * Und freiwillig: Steht kein Foto da, ist das Formular fertig. Die Karte des
 * Gastes hat dafuer ihre eigene Fassung (Punkt 27) - sie sieht dann nicht aus
 * wie eine Karte, in der ein Bild fehlt, sondern wie eine Karte ohne Bild.
 */
function renderPhotoField({ imageUrl = "", photo = {}, escapeHtml = null, icon = null } = {}) {
  const status = String(photo.status || "");
  const busy = status === "uploading";
  // Waehrend der Upload laeuft, steht das Bild schon da: Es ist die Datei, die
  // der Wirt gerade gewaehlt hat, aus dem Speicher des Telefons. Auf die
  // Antwort des Servers zu warten, bevor ueberhaupt etwas zu sehen ist, fuehlt
  // sich auf einer langsamen Leitung wie ein Fehler an.
  const preview = String(photo.previewUrl || imageUrl || "");
  const error = status === "error" ? String(photo.error || TEXTS.photoError) : "";

  const body = preview
    ? `
      <div class="go-offer-photo__frame${busy ? " go-offer-photo__frame--busy" : ""}">
        <img class="go-offer-photo__img" src="${esc(escapeHtml, preview)}" alt="" decoding="async" />
        ${busy ? `<span class="go-offer-photo__busy">${esc(escapeHtml, TEXTS.photoUploading)}</span>` : ""}
      </div>
      <div class="go-offer-photo__actions">
        <button type="button" class="go-offer-photo__action" data-go-offer-photo-pick>${esc(escapeHtml, TEXTS.photoChange)}</button>
        <button type="button" class="go-offer-photo__action go-offer-photo__action--remove" data-go-offer-photo-remove>${esc(escapeHtml, TEXTS.photoRemove)}</button>
      </div>
    `
    : `
      <button type="button" class="go-offer-photo" data-go-offer-photo-pick>
        <span class="go-offer-photo__plus">${safeIcon(icon, "plus", "w-5 h-5")}</span>
        <span class="go-offer-photo__title">${esc(escapeHtml, TEXTS.photoAdd)}</span>
        <span class="go-offer-photo__sub">${esc(escapeHtml, TEXTS.photoSource)}</span>
      </button>
    `;

  return `
    <div data-go-section="photo">
      ${fieldLabel(escapeHtml, TEXTS.photoQuestion)}
      <p class="mt-1 text-[11px] font-semibold text-slate-400">
        ${esc(escapeHtml, TEXTS.photoHint)}
        <span class="text-slate-300">&middot; ${esc(escapeHtml, TEXTS.photoOptional)}</span>
      </p>
      <!--
        Das Feld nimmt, was ein Telefon anbietet: aufnehmen, aus der Mediathek,
        aus den Dateien. Ohne "capture" - das erzwingt die Kamera und nimmt dem
        Wirt die drei Fotos, die er letzte Woche schon gemacht hat.
      -->
      <input type="file" accept="image/*" class="hidden" data-go-offer-photo-input />
      <div class="mt-3">${body}</div>
      ${error ? `<p class="mt-2 text-[11px] font-bold text-rose-500">${esc(escapeHtml, error)}</p>` : ""}
    </div>
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
  // Ohne eigene Wahl gelten alle sieben Tage - so steht es auch im Entwurf,
  // sobald "Orar specifik" gewaehlt wird.
  const scheduleDays = Array.isArray(draft.schedule?.days) && draft.schedule.days.length
    ? draft.schedule.days
    : GO_WEEKDAY_KEYS.slice();
  // Alle vier Bereiche gesetzt heisst "Të gjithë" - eine eigene Angabe dafuer
  // gibt es nicht, und sie waere eine zweite Wahrheit ueber dieselbe Sache.
  const allParty = GO_PARTY_RANGES.every((entry) => partyRanges.includes(entry.key));
  // Wer hier angekreuzt ist, steht im Editor und NICHT im Entwurf: Der Entwurf
  // kennt kein "noch nichts gewaehlt" - normalizeGoOffer macht aus einer leeren
  // Kategorie stillschweigend "all", und damit stand bei einer neuen Oferta
  // schon beides an, ohne dass jemand es angetippt hat. Ein Kreuz, das von
  // selbst dasteht, ist keine Antwort.
  const intents = Array.isArray(editor.intents)
    ? editor.intents
    : goIntentsFromCategory(draft.category);
  const benefit = draft.benefit || {};
  const isEdit = editor.mode === "edit";
  // Zwei Fassungen desselben Feldes: mit dem Abstand zur Beschriftung darueber
  // (Punkt 18: 8 bis 10 px) und ohne ihn - in einem Preisfeld traegt den
  // Abstand die Huelle, damit das € in der Mitte des Feldes sitzt.
  const inputBase = "w-full go-offer-input bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400";
  const inputClass = `mt-2 ${inputBase}`;
  const divider = `<div class="h-px bg-slate-100"></div>`;
  const hint = (text) => `<p class="mt-1 text-[11px] font-semibold text-slate-400">${esc(escapeHtml, text)}</p>`;
  // Solange etwas fehlt, sieht der Knopf unten aus, als koenne er noch nicht
  // (Punkt 29). Antippen kann man ihn trotzdem - dann steht dort, WAS fehlt.
  // Ein Knopf, der stumm nicht reagiert, laesst das Lokal suchen.
  const ready = validateGoOffer(draft).ok && intents.length > 0;

  // Dieselbe Huelle wie das Speisen-Modal (menu-modal-render-utils.js): dieselbe
  // Flaeche, derselbe abgedunkelte Hintergrund, derselbe modal-frame, dasselbe
  // Blatt mit 3rem-Radius und eigenem Scrollbereich. Ein Editor, der sich
  // anders anfuehlt als der daneben, ist fuer den Wirt ein zweites Programm.
  //
  // Und zwar Stueck fuer Stueck dieselbe: Kopf (px-6 pt-6 pb-4, Schliessknopf
  // 11x11 rechts), Koerper (px-6 py-5, modal-scroll), Fuss (px-6 pb-6 pt-4,
  // EIN Knopf, darunter die Statuszeile). Der zweite Knopf "Anulo" im Fuss ist
  // weg: Das X oben rechts sagt dasselbe, und im Speisen-Modal steht dort auch
  // nur der eine Knopf, der etwas tut.
  return `
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;"
      data-go-offer-editor role="dialog" aria-modal="true"
      aria-label="${esc(escapeHtml, isEdit ? TEXTS.editOffer : TEXTS.createOffer)}">
      <!--
        Die Karte der Vorschau bringt ihr Stylesheet mit: Sie ist dieselbe wie
        im Qyteti, und deren Regeln haengen am Kopf des Dokuments erst, wenn
        jemand die Gaeste-Seite geoeffnet hat.
      -->
      <style>${GO_OFFER_CARD_CSS}${GO_OFFER_FORM_CSS}</style>
      <div class="absolute inset-0 bg-black/60" data-go-offer-cancel></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
        <div class="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
          <div class="min-w-0">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${esc(escapeHtml, TEXTS.brand)}</span>
            <h3 class="text-xl font-black italic tracking-tighter truncate">${esc(escapeHtml, isEdit ? TEXTS.editOffer : TEXTS.createOffer)}</h3>
            <!--
              Der eine Satz, der einem Wirt erklaert, warum er hier steht
              (Punkt 2). Er steht im Kopf und nicht im Bildlauf: Er gilt fuer
              das ganze Formular, nicht fuer die erste Frage.
            -->
            <p class="mt-1 text-[11px] font-semibold text-slate-400">${esc(escapeHtml, TEXTS.editorHint)}</p>
          </div>
          <button type="button" data-go-offer-cancel aria-label="${esc(escapeHtml, TEXTS.close)}"
            class="shrink-0 w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
            ${safeIcon(icon, "x", "w-4 h-4")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-5" data-go-editor-scroll>
          <!--
            ÇKA PO OFRON? - der erste und wichtigste Schritt.

            Vier Arten in einem 2x2-Raster: In einer Reihe zu vier waeren die
            Woerter auf dem Telefon abgeschnitten, und "Çmim special" ist kein
            Wort, das man erraten soll. Darunter genau die Felder, die die
            gewaehlte Art braucht - und sonst keines.
          -->
          <div class="go-offer-section" data-go-section="benefit">
            ${fieldLabel(escapeHtml, TEXTS.benefitQuestion)}
            ${hint(TEXTS.benefitHint)}
            <div class="mt-4 grid grid-cols-2 gap-2">
              ${[
                [GO_BENEFIT_DISCOUNT, TEXTS.benefitPercent],
                [GO_BENEFIT_BUNDLE, TEXTS.benefitBundle],
                [GO_BENEFIT_FREE_ITEM, TEXTS.benefitFree],
                [GO_BENEFIT_SPECIAL_PRICE, TEXTS.benefitSpecial]
              ].map(([kind, label]) => `
                <button type="button" data-go-benefit-kind="${esc(escapeHtml, kind)}"
                  aria-pressed="${benefit.kind === kind ? "true" : "false"}"
                  class="go-offer-kind px-3 rounded-2xl text-xs font-black transition-colors ${benefit.kind === kind
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 border border-slate-100"}">
                  ${esc(escapeHtml, label)}
                </button>
              `).join("")}
            </div>
            <div class="mt-5" data-go-benefit-form>
              ${renderBenefitFields({
                benefit,
                percentCustom: editor.percentCustom === true,
                errorFor,
                inputClass,
                inputBase,
                escapeHtml
              })}
            </div>
          </div>

          ${divider}

          <!--
            Das Foto steht direkt hinter den Angaben zum Angebot und nicht am
            Ende des Formulars (Punkt 9): Es gehoert zum Angebot. Wer es unten
            sucht, hat vorher dreimal gelesen, dass es freiwillig ist.
          -->
          ${renderPhotoField({
            imageUrl: draft.imageUrl || "",
            photo: editor.photo || {},
            escapeHtml,
            icon
          })}

          ${divider}

          <div data-go-section="partyRanges">
            ${fieldLabel(escapeHtml, TEXTS.partyQuestion)}
            ${hint(TEXTS.partyHint)}
            <!--
              "Të gjithë" zuerst und allein in seiner Zeile: Es ist die Antwort
              der meisten Lokale, und es ist keine fuenfte Gruppengroesse,
              sondern die Abkuerzung fuer alle vier darunter (Punkt 15).
            -->
            <div class="mt-3">
              ${chip(TEXTS.partyAll, {
                active: allParty,
                attr: "data-go-offer-party",
                value: "all",
                escapeHtml
              })}
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              ${GO_PARTY_RANGES.map((entry) => chip(entry.label, {
                // Bei "Të gjithë" sind alle vier gesetzt - und sehen auch so
                // aus. Ein Kreuz oben, das die Kreuze darunter nur meint,
                // waere zweimal dieselbe Auskunft in zwei Zustaenden.
                active: partyRanges.includes(entry.key),
                attr: "data-go-offer-party",
                value: entry.key,
                escapeHtml
              })).join("")}
            </div>
            ${errorFor("partyRanges") ? `<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="partyRanges">${esc(escapeHtml, errorFor("partyRanges"))}</p>` : ""}
          </div>

          ${divider}

          <div data-go-section="category">
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
                    class="w-full text-left go-offer-answer px-4 py-3 rounded-2xl border transition-colors ${active
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-slate-50 border-slate-100 text-slate-600"}">
                    <span class="block text-xs font-black">${esc(escapeHtml, entry.label)}</span>
                    <span class="block text-[11px] font-semibold go-offer-answer__hint">${esc(escapeHtml, intentHint)}</span>
                  </button>
                `;
              }).join("")}
            </div>
            ${errorFor("category") ? `<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="category">${esc(escapeHtml, errorFor("category"))}</p>` : ""}
          </div>

          ${divider}

          <div data-go-section="schedule">
            ${fieldLabel(escapeHtml, TEXTS.scheduleQuestion)}
            ${hint(TEXTS.scheduleHint)}
            <div class="mt-3 flex flex-wrap gap-2">
              ${chip(TEXTS.always, { active: scheduleMode === "always", attr: "data-go-offer-schedule", value: "always", escapeHtml })}
              ${chip(TEXTS.specificHours, { active: scheduleMode === "windows", attr: "data-go-offer-schedule", value: "windows", escapeHtml })}
            </div>
            ${scheduleMode === "windows" ? `
              <!--
                Die Tage stehen jetzt im Formular (Punkt 23). Vorher galt ein
                Orar specifik stillschweigend fuer jeden Tag - ein Cafe, dessen
                Morgenangebot nur werktags gilt, hatte dafuer keinen Ort im
                Modal. Vorausgewaehlt sind trotzdem alle sieben: Wer nichts
                anfassen will, muss nichts anfassen.
              -->
              <div class="mt-4">
                ${fieldLabel(escapeHtml, TEXTS.daysQuestion)}
                <div class="mt-2 flex flex-wrap gap-2">
                  ${GO_WEEKDAY_KEYS.map((key) => pill(goWeekdayShortLabel(key), {
                    active: scheduleDays.includes(key),
                    attr: "data-go-offer-day",
                    value: key,
                    escapeHtml
                  })).join("")}
                </div>
              </div>
              <div class="mt-4">
                ${fieldLabel(escapeHtml, TEXTS.hoursQuestion)}
                <div class="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    ${fieldLabel(escapeHtml, TEXTS.hoursFrom, "goOfferFrom")}
                    <input id="goOfferFrom" type="time" data-go-offer-from value="${esc(escapeHtml, editor.windowFrom || "14:00")}" class="${inputClass}" />
                  </div>
                  <div>
                    ${fieldLabel(escapeHtml, TEXTS.hoursTo, "goOfferTo")}
                    <input id="goOfferTo" type="time" data-go-offer-to value="${esc(escapeHtml, editor.windowTo || "18:00")}" class="${inputClass}" />
                  </div>
                </div>
              </div>
            ` : ""}
            ${errorFor("schedule") ? `<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="schedule">${esc(escapeHtml, errorFor("schedule"))}</p>` : ""}
          </div>

          ${divider}

          ${renderGoOfferPreviewCore({
            offer: draft,
            businessName,
            previewImageUrl: editor.photo?.previewUrl || "",
            deps
          })}
        </div>

        <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
          <!--
            Fertig oder nicht (Punkt 42): Solange etwas fehlt, traegt der Knopf
            das blasse Lila und keinen Schatten - er sieht aus, als koenne er
            noch nicht. Antippen kann man ihn trotzdem, und dann steht dort,
            WAS fehlt: Ein Knopf, der stumm nicht reagiert, laesst das Lokal
            suchen (Punkt 43).
          -->
          <button type="button" data-go-offer-save ${editor.saving ? "disabled" : ""}
            aria-disabled="${ready ? "false" : "true"}"
            class="w-full py-4 rounded-[1.8rem] text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all go-offer-save${ready ? " go-offer-save--ready" : ""}">
            ${esc(escapeHtml, editor.saving ? TEXTS.saving : (isEdit ? TEXTS.save : TEXTS.activate))}
          </button>
          <div class="text-center text-[10px] font-bold ${editor.status ? "text-rose-500" : "text-slate-400"} mt-3">${esc(escapeHtml, editor.status)}</div>
        </div>
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
  const isOpen = (booking) => ["accepted", "activated"].includes(normalizeGoBookingStatus(booking.status));
  const openBookings = bookings.filter(isOpen);
  const pastBookings = bookings.filter((booking) => !isOpen(booking));
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
            ? `<button type="button" data-go-pause="0" class="go-pause px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${esc(escapeHtml, TEXTS.resume)}</button>`
            : [
              { value: "30", label: "30 min" },
              { value: "60", label: "1 orë" },
              { value: "tomorrow", label: "Deri nesër" },
              { value: "-1", label: "Pa afat" }
            ].map((entry) => `
              <button type="button" data-go-pause="${entry.value}"
                class="go-pause px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${esc(escapeHtml, entry.label)}</button>
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
      <!--
        Beide Stylesheets. GO_OFFER_CARD_CSS stand lange nur im Modal - und
        damit sah die Karte in der Vorschau richtig aus und in der Liste des
        Wirts nach gar nichts. Ein Stylesheet, das nur an einem von zwei Orten
        liegt, an denen dieselbe Karte gezeichnet wird, ist kein Stylesheet,
        sondern eine halbe Zusage.
      -->
      <style>${GO_OFFER_CARD_CSS}${GO_ADMIN_CSS}</style>
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
        <h1 class="go-title text-xl font-black tracking-tight text-slate-900">${esc(escapeHtml, TEXTS.brandMnyra)}<span class="text-indigo-600">${esc(escapeHtml, TEXTS.brandGo)}</span></h1>
        <p class="go-title-sub text-[11px] text-slate-400 font-semibold">${esc(escapeHtml, restaurantName ? `${TEXTS.editor} ${restaurantName}` : TEXTS.editor)}</p>
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
