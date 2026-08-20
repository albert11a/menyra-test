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
import { isGoBookingLive, normalizeGoBookingStatus } from "../../../../shared/go/go-booking-core.js";

// Die zwei Zustaende, in denen eine Buchung noch etwas werden kann. Steht eine
// davon in "Finalizuar", ist nicht ihr Status vorbei, sondern ihre Frist.
const GO_OPEN_STATUSES = Object.freeze(["accepted", "activated"]);
import {
  GO_CARD_VARIANT_COMPACT,
  GO_OFFER_CARD_CSS,
  renderGoOfferCardCore
} from "./go-offer-card-render-utils.js";
import { goBookingBusinessStatusLabel } from "../../../../shared/go/go-booking-core.js";
import { formatGoCommission } from "../../../../shared/go/go-commission-core.js";
// Die gemeinsame Geometrie der Arbeitsseiten - dieselbe, aus der auch das
// Paneli seine Flucht, seinen Rhythmus und seine Pillen nimmt.
import { WORK_SURFACE_CSS } from "../ui/work-surface-render-utils.js";

const TEXTS = Object.freeze({
  brand: "Mnyra GO",
  mark: "⚡",
  // Die Ueberschrift der GO-Seite des Lokals. Sie ist zweizeilig wie die des
  // Qyteti: oben der Name der Marke, darunter das Lokal selbst - mehr steht
  // dort nicht, deshalb gibt es hier kein Wort mehr, das davor kaeme.
  brandMnyra: "MNYRA",
  brandGo: "GO",
  // Der Handgriff oben rechts. Dort stand das Plus, das eine neue Oferte
  // anlegt; jetzt steht dort der Weg zu den Einstellungen. Angelegt wird eine
  // Oferte weiterhin im Reiter Ofertat, wo die Liste steht, zu der sie
  // gehoert - der Knopf dafuer ist derselbe geblieben.
  //
  // Ein Knopf ohne Beschriftung braucht einen Namen fuer die Sprachausgabe
  // und fuer den Zeiger, der darauf stehenbleibt.
  createOfferAction: "Krijo ofertë",
  // Die zwei Gruppen der Leiste. Sie stehen als Beschriftung an den zwei
  // Pfeilen, die zwischen ihnen wechseln.
  groupNext: "Menaxhimi",
  groupBack: "Puna e ditës",
  // Was in den zwei neuen Reitern steht, solange ihr Inhalt noch nicht gebaut
  // ist. Kein leerer Kasten und kein "Coming soon" in einer anderen Sprache -
  // ein Satz, der sagt, was dort einmal stehen wird.
  soonStats: "Këtu do të shohësh se si ecën GO për ty me kalimin e kohës.",
  soonPayments: "Këtu do të shohësh faturat dhe pagesat e tua për MNYRA GO.",
  soonHint: "Së shpejti",
  emptyTitle: "Merr klientë kur ata janë gati të dalin.",
  emptyAction: "Aktivizo ofertën e parë",
  cardIdle: "Krijo oferta për klientët që kërkojnë tani.",
  cardManage: "Menaxho GO",
  // Die Leiste liest sich jetzt als der Weg, den ein Gast nimmt: Er steht noch
  // aus (Ne pritje), er steht am Tisch und zeigt seinen Code (Aktivizo), er
  // war da (Finalizuar). "Ne pritje" haelt ihn dabei bis zum Schluss - ob der
  // Gast auf seinem Telefon schon gewischt hat, aendert fuer den Kellner
  // nichts. Frueher stand hier eine Mischung aus
  // einem Zustand ("Aktiv"), einer Sammlung ("Ofertat") und einer Ablage
  // ("Arkiv") - drei Dinge, die nichts miteinander zu tun haben.
  //
  // Die Verwaltung steht daneben und nicht dazwischen: Zahlen, Geld und die
  // eigenen Oferten sind nichts, was ein Wirt im Betrieb antippt.
  tabs: {
    pending: "Në pritje",
    active: "Aktivizo",
    finalized: "Finalizuar",
    stats: "Statistikat",
    payments: "Pagesat",
    offers: "Ofertat",
    options: "Opsionet"
  },
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
  // Die Karten-Reihe: der Trichter des Tages in vier Zahlen, und daneben die
  // Rechnung.
  //
  // Die vier gehoeren zusammen und stehen deshalb in dieser Reihenfolge: Wer
  // gesehen hat, kann waehlen; wer gewaehlt hat, kann kommen; wer kommt,
  // bringt Menschen mit. Jede Zahl ist eine andere Frage - keine ist eine
  // andere unter neuem Namen.
  today: "Sot",
  current: "Aktuale",
  kpiViewsTitle: "Shikime të ofertave",
  kpiViewsNote: "Sa persona i kanë parë ofertat e tua.",
  kpiChosenTitle: "Oferta të zgjedhura",
  kpiChosenNote: "Sa herë klientët kanë zgjedhur ofertën tënde.",
  kpiVisitsTitle: "Vizita të realizuara",
  kpiVisitsNote: "Oferta të përdorura dhe verifikuara në lokal.",
  kpiGuestsTitle: "Klientë të sjellë",
  kpiGuestsNote: "Sa persona kanë ardhur përmes MNYRA GO.",
  // Die fuenfte Karte ist keine Kennzahl, sondern eine Rechnung - deshalb
  // steht sie abgesetzt und in einer anderen Farbe.
  kpiDueTitle: "Për pagesë",
  kpiDueNote: "Shuma aktuale për MNYRA GO.",
  kpiDueClear: "Asgjë për pagesë.",
  // Was an der Stelle der Zahl steht, solange sie noch unterwegs ist. Zu sehen
  // ist dort ein Balken; dieser Satz ist fuer die Sprachausgabe, die einen
  // Balken nicht vorlesen kann.
  kpiPending: "Po ngarkohet",
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
  codePlaceholder: "Kodi i klientit",
  // Die drei Saetze, die unter dem Feld stehen koennen. Sie sind kurz, weil
  // der Kellner sie zwischen zwei Gaesten liest: was schiefging, und was er
  // jetzt tun kann.
  codeNotFound: "Kodi nuk u gjet.",
  codeRetry: "Provo përsëri.",
  // Die Arbeitskarte des Kellners. Sie steht allein unter der Leiste: Der
  // Kellner hat dort genau eine Aufgabe - den Code des Gastes hereinholen,
  // getippt oder gescannt.
  activateTitle: "Aktivizo ofertën",
  activateHint: "Shkruaj kodin ose skano QR-në.",
  // Der Knopf am Suchfeld heisst wie die Aufgabe und nicht wie der Schritt
  // dahinter: Der Kellner tippt den Code und will aktivieren. Was der Knopf
  // AUSLOEST, ist unveraendert das Nachschlagen - bestaetigt wird erst an der
  // gefundenen Buchung, und dort entsteht das Geld.
  scanQr: "Skano QR-në",
  cameraClose: "Mbyll kamerën",
  // Wenn der Browser die Kamera nicht hergibt. Der Satz sagt beides: was
  // passiert ist, und dass der getippte Code weiter da ist.
  // Zwei Saetze und nicht einer: Wer die Kamera verweigert hat, muss etwas
  // erlauben; wessen Kamera nicht startet, kann das nicht aendern und
  // braucht den Hinweis auf den Code.
  cameraDenied: "Lejo kamerën për të skanuar QR-në.",
  cameraFailed: "Kamera nuk mund të hapej. Përdor kodin.",
  // Wenn die Finalisierung nicht durchging. Die Karte bleibt stehen, die
  // Oferta bleibt stehen, die Personenzahl bleibt stehen - der Kellner
  // drueckt einfach noch einmal.
  finalizeFailed: "Finalizimi dështoi. Provo përsëri.",
  // Die Frage steht als Frage da: Der Kellner soll nachzaehlen, nicht eine
  // Beschriftung lesen. Und sie fragt nach der Gruppe, die die Oferta
  // BENUTZT - nicht nach der, die am Tisch sitzt: Am Tisch koennen fuenf
  // sitzen und drei die Oferta einloesen, und abgerechnet wird die zweite
  // Zahl.
  partyAtTable: "Sa persona?",
  // Die beiden Griffe am Zaehler. Zu sehen sind dort nur ein Minus und ein
  // Plus; was sie tun, steht im aria-label - ein Zeichen allein liest keine
  // Sprachausgabe vor.
  partyLess: "Një person më pak",
  partyMore: "Një person më shumë",
  // Der Kopf der Finalisierungsansicht: links die Oferta mit dem Code, den der
  // Kellner gerade eingetippt hat, rechts die Gruppe, fuer die sie gilt.
  dealCode: "Oferta",
  personOne: "person",
  personMany: "persona",
  commission: "Provizioni",
  keepsRunning: "Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",
  onlyBusiness: "Ky funksion eshte vetem per profile biznesi.",
  loadingBusiness: "Biznesi po ngarkohet..."
});

/**
 * Ein Handgriff, der arbeitet, waehrend man ihn ansieht.
 *
 * "Aktivizo" und "Finalizo" tun dasselbe: Sie schicken etwas zum Server und
 * warten. Der Kellner steht dabei vor dem Gast, und ein Knopf, der nach dem
 * Druecken einfach nur grau wird, sagt ihm nicht, ob etwas passiert.
 *
 * Deshalb tragen beide dieselben vier Zustaende, und der Zustand steht als
 * EIN Attribut am Knopf (data-go-phase):
 *
 *   idle  das Wort
 *   busy  ein kleiner kreisender Bogen
 *   done  ein Haken
 *   fail  ein Kreuz
 *
 * Das Wort bleibt dabei IM Knopf stehen - es wird nur unsichtbar. Genau
 * daran haengt, dass der Knopf seine Groesse behaelt: Was die Breite macht,
 * ist der Text, und der geht nie aus dem Fluss. Die Zeichen liegen darueber
 * und nehmen keinen Platz. Ein Knopf, der beim Druecken seine Groesse
 * aendert, schiebt die halbe Karte mit.
 *
 * Und es steht kein "Po ngarkohet..." darin. Ein Ladetext ist laenger als
 * das Wort, das er ersetzt - der Knopf waere waehrend der Arbeit breiter als
 * davor.
 */
function renderGoActionButton({
  className = "",
  label = "",
  attrs = "",
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  return `
    <button type="button" ${attrs} class="${className}" data-go-phase="idle">
      <span class="go-sign__label">${esc(escapeHtml, label)}</span>
      <span class="go-sign go-sign--ring" aria-hidden="true"><span class="go-sign__ring"></span></span>
      <span class="go-sign go-sign--check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7" /></svg>
      </span>
      <span class="go-sign go-sign--cross" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </span>
    </button>
  `;
}

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
/* Die Karten-Reihe unter der Kopfzeile: vier Zahlen des Tages und daneben die
   Rechnung.

   Ihre Machart - waagerecht bis an beide Bildschirmraender, die erste Karte in
   der Flucht der Seite - steht als .mnyra-work__cards in der gemeinsamen
   Geometrie der Arbeitsseiten; die Reihe traegt beide Klassen und ist damit
   dieselbe Reihe wie im Paneli. Fuenf Karten passen auf keinem Telefon
   nebeneinander, ohne dass jede zur Briefmarke wird; sie werden deshalb
   gewischt statt gequetscht. */
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+ das Seitenpolster), abzueglich der
   beiden Luecken zwischen den drei angeschnittenen Karten. Eine Karte, die
   halb angeschnitten am Rand steht, ist der einzige Hinweis, dass die Reihe
   weitergeht. */
.go-kpi__card {
  flex: 0 0 calc((100% + var(--work-inline) - 20px) / 2.5);
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* Feste Hoehe, damit alle Karten auf einer Linie stehen: Der Titel ist
     zweizeilig, die Beschreibung vierzeilig - eine Karte, die sich nach ihrem
     Text richtet, macht aus der Reihe eine Treppe.

     Und es ist dieselbe Hoehe wie im Paneli, weil an der Hoehe dieser Reihe
     der Anfang des Benkos haengt: Mit 210 hier und 228 dort fing das Benko in
     GO 18 Punkte hoeher an, obwohl der Abstand darueber auf beiden Seiten
     stimmte.

     Der Inhalt steht darin unveraendert von oben nach unten - Zeitraum und
     Symbol, die Zahl, der Titel, die Beschreibung. Die 18 Punkte mehr sind
     Luft am Fuss der Karte: Der laengste Satz auf dem schmalsten Telefon
     ("Oferta te perdorura dhe verifikuara ne lokal.") braucht auf 320px vier
     Zeilen und stoesst damit nicht mehr an die Kante. */
  height: var(--work-card-height);
  padding: 14px;
  border: 1px solid transparent;
  /* Dasselbe Mass wie an den Karten davor. */
  border-radius: 20px;
  background: #4f46e5;
  text-align: left;
  scroll-snap-align: start;
  overflow: hidden;
}
/* Oben: das Wort fuer den Zeitraum links, das Symbol rechts. Beide klein -
   die Karte gehoert der Zahl, nicht ihrem Rahmen. Das Symbol steht ohne
   Flaeche darunter: Ein Kreis oder Kasten um ein 16px-Symbol nimmt mehr Platz
   als das Symbol selbst und sagt nichts dazu. */
.go-kpi__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.go-kpi__period {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1;
  color: rgb(255 255 255 / 0.62);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.go-kpi__icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier -
   wie in der Tab-Leiste. */
.go-kpi__icon svg,
.go-kpi__icon i {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
}
/* Die Zahl. Sie steht mit Abstand nach oben und traegt die Karte. */
.go-kpi__value {
  margin: 14px 0 0;
  /* Eine Zeile hoch, ob darin eine Zahl steht oder der Balken, der auf sie
     wartet. Ohne dieses Mass ergaebe die Summe aus Balkenhoehe und Raendern
     nur FAST eine Zeile (27,98 statt 28,00 Punkte gemessen) - und die
     Karte darunter ruckte um diesen Bruchteil. */
  min-height: 1em;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Das Skelett steht GENAU dort, wo gleich die Zahl steht - und genau so hoch.
   Es ist ein Block im selben Absatz: Der Absatz misst damit seine
   Zeilenhoehe (1em) mit dem Balken genauso wie spaeter mit der Zahl, und
   beim Wechsel rueckt nichts. Eine Hoehe in Pixeln stuende hier falsch,
   sobald die Zahl auf einem breiten Bildschirm groesser wird.

   Nur die Zahl fehlt. "Sot", das Symbol, der Titel, die Beschreibung und die
   Farbe der Karte stehen von der ersten Zeichnung an da - ein Skelett der
   ganzen Karte verspraeche, dass gleich etwas ANDERES kommt, und es kommt
   nur eine Zahl. */
.go-kpi__skeleton {
  display: block;
  /* Etwas niedriger als die Zeile, mittig darin: Ein Balken auf voller
     Zeilenhoehe ist ein Kasten, ein Balken auf zwei Dritteln ist ein Strich,
     der auf eine Zahl wartet. Die fehlende Hoehe steht als Rand darum, damit
     der Absatz trotzdem genau so hoch bleibt wie mit der Zahl. */
  height: 0.62em;
  margin: 0.19em 0;
  /* Etwa so breit wie zwei Ziffern. Die Einheit ch ist die Breite der Null in
     genau dieser Schrift - der Balken waechst also mit der Zahl mit, statt
     neben ihr zu raten. */
  width: 2.4ch;
  /* Ganz rund, wie die Reiter darunter: Ein Rechteck mit weichen Ecken ist
     eine Flaeche, die etwas verdeckt; eine Kapsel ist ein Platzhalter. */
  border-radius: 999px;
  background: currentColor;
  opacity: 0.22;
  /* Langsam und mit kleinem Hub. Ein Puls, der auffaellt, laesst die Karte
     unfertig aussehen; einer, den man erst beim Hinsehen bemerkt, sagt nur:
     hier kommt gleich etwas. */
  animation: go-kpi-pulse 2s ease-in-out infinite;
}
/* Die Rechnung traegt keine Ziffernfolge, sondern einen Betrag: "4,50 €" ist
   gut doppelt so breit wie "42". */
.go-kpi__skeleton--wide { width: 5.2ch; }
@keyframes go-kpi-pulse {
  0%, 100% { opacity: 0.22; }
  50% { opacity: 0.1; }
}
/* Wer Bewegung abbestellt hat, bekommt den Balken ruhig - sichtbar bleibt er,
   sonst waere an der Stelle wieder nichts. */
@media (prefers-reduced-motion: reduce) {
  .go-kpi__skeleton { animation: none; }
}
.go-kpi__title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
  color: #ffffff;
  overflow: hidden;
}
/* Die Beschreibung sitzt unten an der Karte, egal wie kurz der Titel darueber
   ist: "margin-top: auto" schiebt sie an den Fuss, und damit stehen die
   Beschreibungen aller Karten auf derselben Hoehe. */
.go-kpi__note {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin: 8px 0 0;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.35;
  color: rgb(255 255 255 / 0.72);
  overflow: hidden;
}
/* Die fuenfte Karte ist keine Kennzahl, sondern eine Rechnung. Sie steht
   deshalb abgesetzt: helle Flaeche statt voller Farbe, ein Rand im Violett der
   Marke, und eine Luecke davor, die groesser ist als die zwischen den vier
   davor.

   Sie war einmal creme mit Bernstein. Das las sich wie eine Warnung aus einem
   anderen Programm - und ein offener Betrag ist keine Warnung: Er entsteht,
   weil GO funktioniert hat und Gaeste gekommen sind. Jetzt traegt sie
   dasselbe Violett wie die vier davor, nur andersherum: dort die Farbe als
   Flaeche und weisse Schrift, hier die Farbe als Rand und Akzent auf hellem
   Lavendel. Verwandt und trotzdem auf den ersten Blick eine andere Art von
   Karte. Rot bleibt draussen, Orange auch. */
.go-kpi__card--due {
  margin-left: 8px;
  background: #f5f3ff;
  border-color: #c7d2fe;
}
.go-kpi__card--due .go-kpi__period { color: #4f46e5; }
.go-kpi__card--due .go-kpi__icon { color: #4f46e5; }
/* Der Betrag im tiefsten Ton der Marke - dieselbe Farbe, die auf den vier
   Karten davor die Zahl traegt, nur hier auf hellem Grund. */
.go-kpi__card--due .go-kpi__value { color: #1e1b4b; }
.go-kpi__card--due .go-kpi__title { color: #312e81; }
.go-kpi__card--due .go-kpi__note { color: #64748b; }
/* Und ist nichts offen, ist das eine gute Nachricht und sieht auch so aus. */
.go-kpi__card--clear {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.go-kpi__card--clear .go-kpi__period { color: #15803d; }
.go-kpi__card--clear .go-kpi__icon { color: #16a34a; }
.go-kpi__card--clear .go-kpi__value { color: #14532d; }
.go-kpi__card--clear .go-kpi__title { color: #166534; }
.go-kpi__card--clear .go-kpi__note { color: rgb(20 83 45 / 0.72); }
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.go-kpi__tail { flex: 0 0 18px; }
/* Hier stand ein Raster fuer breite Bildschirme: ab 768px wurden aus der
   Wischreihe fuenf Spalten. Es ist weg, und zwar aus zwei Gruenden.

   Erstens misst die Regel die BREITE DES FENSTERS, nicht die des Inhalts: Die
   Huelle der App ist ueberall hoechstens 28rem breit (max-w-md), also
   quetschte das Raster auf einem Schreibtisch-Bildschirm fuenf Karten in
   dieselben 448 Punkte, in denen auf dem Telefon zweieinhalb stehen.

   Zweitens macht das Paneli es nicht: dort bleibt die Reihe auf jeder Breite
   eine Reihe. Genau solche Einzelfaelle liessen die beiden Seiten beim
   Wechsel auseinanderlaufen - und an der Schwelle sprang das Layout. Mobil
   und Desktop bekommen jetzt auf beiden Seiten dieselbe Reihe. */
/* Das Bento traegt alles unter der Karten-Reihe: die Pillen-Leiste und
   darunter die Liste, die sie gewaehlt hat. Es ist WOERTLICH dieselbe Flaeche
   wie im Paneli: Abstand nach oben, Seitenpolster, Rundung, Auslauf und Kante
   stehen als .mnyra-work__bento in der gemeinsamen Geometrie, das Bento traegt
   beide Klassen. Hier steht nur noch, wie die Stuecke DARIN zueinander
   stehen. */
/* Die Leiste braucht Luft nach unten, deutlich mehr als der Abstand zwischen
   zwei Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Es ist dieselbe Zahl, die auch im Paneli unter der Leiste steht
   (--work-bento-lead). */
.go-bento > .go-tabs { margin-top: 0; }
.go-bento > .go-tabs + * { margin-top: var(--work-bento-lead); }
/* Drei Reiter und ein Pfeil, sonst nichts - kein Grund, kein Rahmen, kein
   Polster um sie herum. Ein Kasten darum schoebe sie um seine Polsterbreite
   nach innen und damit aus der Flucht der Karten darueber.

   Die drei teilen sich den Platz gleichmaessig, der Pfeil nimmt nur seine
   eigene Breite: So bleibt jede Pille gleich gross, egal wie lang ihr Wort
   ist, und "Aktivizo" wird nicht breiter, nur weil es gerade offen ist. */
.go-tabs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: var(--work-pill-gap);
  /* Senkrecht scrollt der Browser wie ueberall sonst; waagerecht gehoert die
     Geste uns. Das ist die halbe Antwort auf "die Seite darf beim Wischen
     nicht mitgehen" - die andere Haelfte steht in bindSwipe: Sobald die Geste
     eindeutig waagerecht ist, wird das Scrollen abgesagt. */
  touch-action: pan-y;
}
/* Das Fenster, durch das immer genau eine Gruppe zu sehen ist.

   Oben und unten etwas Luft, damit der Schatten der offenen Pille nicht am
   Rand abgeschnitten wird - die negative Marge nimmt sie dem Layout wieder
   ab, sonst waere die Leiste acht Punkte hoeher als sie aussieht. */
.go-tabs__viewport {
  min-width: 0;
  overflow: hidden;
  padding: 4px 0;
  margin: -4px 0;
}
/* Das Band traegt beide Gruppen nebeneinander und wird verschoben. EINE
   Eigenschaft an EINEM Element - deshalb ruehrt ein Gruppenwechsel keinen
   anderen Knoten der Seite an.

   transform und nicht scrollLeft: Ein Band, das man scrollt, kann man auch
   halb scrollen und mit dem Finger anhalten. Verlangt war ein Wechsel wie
   zwischen zwei Reitern, kein Scrollen. */
.go-tabs__track {
  display: flex;
  transition: transform 210ms ease-out;
}
.go-tabs[data-go-tab-group="1"] .go-tabs__track { transform: translateX(-100%); }
/* Eine Gruppe ist genau die Pillen-Reihe des Panelis (.mnyra-work__pills) -
   drei gleich breite Pillen. Hier steht nur, dass sie das ganze Fenster
   fuellt. */
.go-tabs__pane { flex: 0 0 100%; }
/* Wer Bewegung abbestellt hat, bekommt den Wechsel ohne sie - die Gruppe
   steht dann sofort da. */
@media (prefers-reduced-motion: reduce) {
  .go-tabs__track { transition: none; }
}
/* Die Pille selbst steht nicht mehr hier: Hoehe, Rundung, Rand, Schrift,
   Symbolgroesse, Innenabstaende und der gewaehlte Zustand stehen EINMAL in der
   gemeinsamen Geometrie (.mnyra-work__pill). Das Paneli nimmt dieselbe Regel -
   zwei aehnliche Pillen zu pflegen war genau das Problem. */
/* Der Pfeil blaettert die Gruppe. Er ist kein Reiter, aber er gehoert in
   dieselbe Reihe - also traegt er dieselbe Form: dieselbe Fingerhoehe,
   derselbe Rand, dieselbe runde Kapsel wie eine Pille, die nicht offen ist.

   Er stand hier einmal als voller Lavendel-Kreis. Das machte ihn zum
   auffaelligsten Ding der Leiste - auffaelliger als der Reiter, der gerade
   offen ist, und der ist die Hauptsache. Jetzt ist er so ruhig wie eine
   geschlossene Pille, und nur das Zeichen darin traegt das Violett der
   Marke: sichtbar, aber nicht laut. */
/* Seine Form steht als .mnyra-work__pill-turn in der gemeinsamen Geometrie:
   dieselbe Fingerhoehe, derselbe Rand, dieselbe runde Kapsel wie eine Pille,
   die nicht offen ist. */
/* Beide Zeichen stehen im Knopf, sichtbar ist immer nur eines. So bleibt der
   Pfeil beim Wechsel derselbe Knoten - und der Wechsel bleibt ein Attribut. */
.go-tabs__turn-icon { display: none; }
.go-tabs[data-go-tab-group="0"] .go-tabs__turn-icon--next { display: block; }
.go-tabs[data-go-tab-group="1"] .go-tabs__turn-icon--back { display: block; }
/* Wie sich die Pillen auf schmalen Telefonen zusammenruecken (413px: engeres
   Polster, kleinere Schrift; 359px: nur noch das Symbol), steht in der
   gemeinsamen Geometrie - und gilt damit im Paneli genauso. */
/* Zwei Masse, die vorher an Klassen hingen, die es im statischen
   Tailwind-Blatt nicht gibt (mt-0.5, min-h-[44px]): der Abstand der Unterzeile
   und die Fingerhoehe der Pausenknoepfe. Eine Fingerhoehe, die von einer
   Klasse ohne Regel abhaengt, ist keine Fingerhoehe.
   Die Ueberschrift wird auf einem breiten Bildschirm NICHT mehr groesser: im
   Paneli tut sie das auch nicht, und die Huelle der App ist ohnehin ueberall
   gleich breit. */
.go-title-sub { margin-top: 2px; }
/* Die Kopfzeile der Seite: der Name mit dem Lokal darunter.

   Ihre Geometrie - Mindesthoehe und Abstand zur Karten-Reihe - steht als
   .mnyra-work__head in der gemeinsamen Geometrie; die Kopfzeile traegt beide
   Klassen und steht damit auf derselben Achse und in derselben Hoehe wie die
   Begruessung im Paneli.

   Rechts stand hier ein runder violetter Knopf, der die Einstellungen
   oeffnete. Er ist weg: die Einstellungen stehen jetzt in der globalen
   Kopfzeile, links neben der Sprache - auf dieser Seite genau wie im Paneli.
   Ein zweiter Einstellungs-Knopf mitten im Inhalt waere ein zweiter Weg zu
   derselben Stelle, und er stand nur hier. */
/* Der Block darf schrumpfen: ein langer Lokalname soll die Zeile nicht
   auseinanderziehen. min-width:0 ist das, was dem Textblock ueberhaupt
   erlaubt, schmaler als sein Inhalt zu werden - ohne das greift die Ellipse
   unten nicht. */
.go-head__brand { min-width: 0; }
/* Der Name des Lokals steht in EINER Zeile. Ein Umbruch hier verschoebe die
   ganze Kopfzeile in der Hoehe, sobald ein Lokal einen langen Namen hat. */
.go-head__brand .go-title,
.go-head__brand .go-title-sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Und genau die Zeilenhoehen der Begruessung im Paneli (1.1 fuer den Namen,
   1.2 fuer die Zeile darunter). Ohne sie brachte text-xl seine eigene
   Zeilenhoehe von 1.75rem mit, der Textblock wurde 46,5 statt 44 Punkte hoch -
   und damit stand auf dieser Seite alles darunter zweieinhalb Punkte tiefer
   als im Paneli. Gemessen, nicht geschaetzt. */
.go-head__brand .go-title { line-height: 1.1; }
.go-head__brand .go-title-sub { line-height: 1.2; }
.go-pause { min-height: 44px; }
/* Aktivizo - die Arbeitskarte des Kellners.

   Eine sehr helle Flaeche, kein dunkles Navy mehr. Das Navy machte die Karte
   zum lautesten Ding der Seite - unter einer weissen Pillen-Leiste, auf einem
   weissen Benko, neben weissen Listen stand ein schwarzer Block. Jetzt traegt
   die Karte ihr Gewicht ueber die Groesse und nicht ueber die Farbe: eine
   Flaeche einen Hauch violett-weiss (#f7f7ff) auf dem weissen Benko, dazu eine
   Haarlinie (#e4e4f4) und sonst nichts. Kein Schlagschatten - er machte auf
   einer so hellen Flaeche nur Schmutz.

   Die Haarlinie liegt als INNERER Schatten und nicht als Rand: Ein Rand
   umschlosse auch das Kamerabild, und dann laege ein Bild IN einem Rahmen
   statt dass die Karte das Bild waere. Ein innerer Schatten wird unter den
   Kindern gezeichnet - die Kamera deckt ihn zu, das Codefeld laesst ihn
   stehen. Und weil er nichts am Kastenmodell aendert, sind beide Zustaende
   weiter auf den Punkt gleich gross.

   EINE Hoehe fuer beide Zustaende, und das ist der ganze Trick an der
   Verwandlung: Codefeld und Kamera stehen im selben Rahmen, an derselben
   Stelle, mit derselben Rundung. Es wird nichts groesser und nichts kleiner -
   deshalb springt beim Wechsel auch nichts, weder in der Karte noch darunter.
   Vorher wanderte die Hoehe (139 auf 256 Punkte) und musste von Hand
   animiert werden; das ist mit dieser einen Zahl erledigt.

   "overflow: hidden" schneidet das Kamerabild auf genau diese Rundung - das
   Bild braucht deshalb keinen eigenen Rahmen und keinen eigenen Radius. */
/* ------------------------------------------------------------------------
   Die Form der GO-Arbeitskarten - EINMAL, fuer alle.

   Zwei Reiter zeigen Karten: Aktivizo die Arbeitskarte des Kellners,
   "Në pritje" die wartenden Ofertat. Beide standen mit eigenen Zahlen da -
   28 Punkte Rundung hier, 1.6rem dort; 20 Punkte Polster hier, 18 dort. Beim
   Wechsel zwischen den beiden Reitern sah man das: zwei Karten, die
   offensichtlich nicht aus derselben Werkstatt kamen.

   Jetzt steht die GEOMETRIE an EINER Stelle, und beide Karten lesen daraus.
   Wer die Formsprache von MNYRA GO aendert, aendert sie hier - und beide
   Reiter gehen mit, ohne dass jemand daran denken muss.

     --go-card-height   die Grundhoehe. Es ist die Hoehe der kompakten
                        Aktivizo-Karte (ihr "face"-Zustand): Aktivizo SETZT
                        sie, "Në pritje" nimmt sie als Mindestmass.
     --go-card-radius   die Rundung. Sie steht zwischen den Karten der Reihe
                        (20) und dem Benko darunter (40) und gehoert damit in
                        dieselbe Familie.
     --go-card-pad      das Polster. Auf dem schmalsten Telefon ruecken die
                        Seiten enger zusammen - die Marke geht den Weg mit,
                        also beide Karten.
     --go-card-gap      der Abstand ZWISCHEN zwei Karten. Er steht hier und
                        nicht an der Liste, damit "Në pritje" und "Finalizuar"
                        ihn nicht getrennt pflegen.

   Die FARBEN stehen hier bewusst NICHT.

   Aktivizo ist eine Arbeitskarte: eine, an der etwas passiert, und sie traegt
   deshalb den Hauch Violett der Marke (#f7f7ff). "Në pritje" ist eine Liste,
   die man liest - sie steht im kuehlen Off-White des uebrigen Interfaces
   (#f8fafc). Es ist derselbe Rahmen, aber nicht dieselbe Aufgabe, und genau
   das darf man sehen. Jede der beiden Karten haelt ihre zwei Farben deshalb
   selbst.

   Die Haarlinie liegt an BEIDEN als innerer Schatten und nicht als Rand - das
   ist wieder Geometrie und keine Farbe. In Aktivizo, weil ein Rand auch das
   Kamerabild umschloesse (siehe unten), und in "Në pritje", damit die Kante
   auf den Punkt dieselbe ist: Ein Rand nimmt dem Polster innen seinen Punkt,
   ein innerer Schatten nicht. Zwei Karten, deren Inhalt um einen Punkt
   verschoben steht, sehen nicht wie eine Familie aus.
   ------------------------------------------------------------------------ */
.mnyra-work {
  --go-card-height: 184px;
  --go-card-radius: 28px;
  --go-card-pad: 20px;
  /* Deutlich mehr als ein Rand und deutlich weniger als ein Absatz: Jede
     Oferta ist ein eigener Vorgang und soll auch als einer gelesen werden -
     eine Liste, deren Karten sich beruehren, liest sich als EINE geteilte
     Flaeche. */
  --go-card-gap: 16px;
}
/* Der Anlauf unter der Pillen-Leiste.

   Die gemeinsame Geometrie gibt 44 Punkte vor (--work-bento-lead), und das ist
   im Paneli richtig: Dort steht darunter eine Ueberschrift, kein Inhalt. In GO
   faengt sofort die Arbeit an - die Karte des Kellners oder die Liste der
   Vorgaenge -, und 44 Punkte rissen sie von der Leiste ab, die sie ausgewaehlt
   hat.

   Der Wert steht an EINER Stelle und gilt fuer ALLE Reiter: Wer zwischen
   "Në pritje", "Aktivizo" und "Finalizuar" wechselt, soll den Inhalt auf
   derselben Hoehe wiederfinden. Ein Reiter, der seinen Anfang selbst
   bestimmt, laesst die Seite bei jedem Wechsel springen. Das Paneli behaelt
   dabei seine 44 - ueberschrieben wird nur hier. */
.go-bento { --work-bento-lead: 20px; }
/* Auf dem schmalsten Telefon ist die Karte 272 Punkte breit, und jeder Punkt
   Seitenpolster fehlt drinnen dem Inhalt. Dieselbe Schwelle wie bei den
   Pillen, damit die Seite an EINER Stelle schmal wird und nicht an dreien. */
@media (max-width: 359px) {
  .mnyra-work { --go-card-pad: 18px 16px; }
}
.go-activate {
  /* DREI Hoehen, eine je Zustand - und die Karte faehrt zwischen ihnen.

     Vorher stand hier eine einzige Zahl fuer alle drei Schichten. Das machte
     den Wechsel sprungfrei, kostete aber genau das, was eine Karte mit einem
     Codefeld darin nicht braucht: 160 Punkte Leere unter dem Feld, damit
     spaeter vielleicht eine Buchung hineinpasst. Die Karte war immer so
     gross wie ihr groesster Zustand.

     Jetzt ist sie so gross wie ihr JETZIGER Zustand und faehrt die Aenderung
     mit. Das ist kein Sprung, sondern die Bewegung selbst: Es ist dieselbe
     Karte, die aufgeht und wieder zugeht.

       face  Ueberschrift, Satz, Codefeld - und nichts darunter.
       cam   das Kamerabild, so gross, dass ein QR bequem hineinpasst.
       done  Kopf, Angebot, Linie, Personenwahl, Knopf.

     Die Zahlen sind ausgerechnet und nicht gemessen: Jede ist die Summe der
     Stuecke ihrer Schicht plus dem Polster. Gemessen wuerde heissen, nach dem
     Zeichnen noch einmal ranzugehen - und das sieht man, weil die Karte dann
     zweimal aussieht. */
  /* Die kompakte Hoehe ist die gemeinsame Grundhoehe der GO-Karten - dieselbe
     Zahl, auf der auch eine wartende Oferta steht. Sie steht deshalb nicht
     mehr hier, sondern oben an --go-card-height. */
  --go-activate-h-face: var(--go-card-height);
  --go-activate-h-cam: 288px;
  --go-activate-h-done: 364px;
  --go-activate-height: var(--go-activate-h-face);
  /* Die Bewegung: ruhig heraus, nichts federt zurueck. */
  --go-activate-ease: cubic-bezier(.2, .8, .2, 1);
  /* Die Farben der Karte stehen an EINER Stelle - die Flaeche, die Linie, die
     Schrift, der ruhige Ton darunter und das Violett der Marke, in dem hier
     genau die Sachen stehen, die etwas tun. */
  --go-activate-surface: #f7f7ff;
  --go-activate-line: #e4e4f4;
  --go-activate-ink: #0f172a;
  --go-activate-ink-soft: #64748b;
  --go-activate-accent: #4f46e5;
  --go-activate-accent-soft: #eef2ff;
  position: relative;
  overflow: hidden;
  height: var(--go-activate-height);
  /* Die Hoehe faehrt eine Spur laenger als der Inhalt darin (280ms): So ist
     die Karte das Letzte, was zur Ruhe kommt - es sieht aus, als haette der
     Inhalt sie aufgeschoben, und nicht, als waere er in ein fertiges Loch
     gefallen.

     Zwischen zwei festen Zahlen und nicht nach "auto": "auto" hat keinen
     Wert, auf den ein Uebergang zielen koennte - Safari springt dann hart.
     Deshalb stehen die drei Zahlen oben. */
  transition: height 300ms var(--go-activate-ease);
  padding: 0;
  border-radius: var(--go-card-radius);
  background: var(--go-activate-surface);
  box-shadow: inset 0 0 0 1px var(--go-activate-line);
}
/* Welcher Zustand welche Hoehe nimmt. Die drei Regeln schliessen einander
   aus - eine offene Kamera bleibt eine offene Kamera, egal was der Zustand
   sonst noch weiss, und die Buchung zieht nur, wenn die Kamera zu ist.

   Genau daran haengt der Weg vom erkannten QR zur Buchung: Wer beide
   Attribute im selben Zug setzt (Kamera zu, Buchung da), faehrt von der
   Kamerahoehe direkt auf die der Buchung - ohne den Umweg ueber die kleine
   Karte dazwischen.

   Steht in der Eingabemaske eine Zeile unter dem Feld (ein Code, der nichts
   fand; eine Kamera, die nicht aufging), waechst die Karte um genau diese
   Zeile. Sie schiebt damit, was unter ihr steht - aber sie quetscht nichts,
   und sie haelt keine leere Zeile fuer den Fall bereit, dass mal etwas
   schiefgeht. */
.go-activate[data-go-camera="0"][data-go-found="0"][data-go-note="1"] {
  --go-activate-height: calc(var(--go-activate-h-face) + 26px);
}
.go-activate[data-go-camera="1"] { --go-activate-height: var(--go-activate-h-cam); }
.go-activate[data-go-camera="0"][data-go-found="1"] { --go-activate-height: var(--go-activate-h-done); }
/* Die zwei Schichten liegen deckungsgleich im selben Rahmen. Sichtbar ist
   immer genau eine; die andere ist weg - unsichtbar, unantastbar und auch fuer
   die Sprachausgabe nicht da (visibility, nicht nur opacity). */
.go-activate__face,
.go-activate__cam,
.go-activate__done {
  position: absolute;
  inset: 0;
}
/* Aufmachen: der Inhalt geht in 120ms und sinkt dabei eine Spur weg
   (scale 0.985), die Kamera kommt direkt danach und setzt sich aus einer
   Spur zu gross auf (1.015 -> 1). Zusammen 240ms.

   Die Zeiten stehen an den Zielzustaenden, nicht an den Schichten: Eine
   Regel gilt genau dann, wenn IHR Zustand erreicht wird - so laeuft das
   Schliessen von selbst rueckwaerts, mit seinen eigenen Zeiten. */
.go-activate[data-go-camera="1"] .go-activate__face {
  opacity: 0;
  transform: scale(0.985);
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 120ms var(--go-activate-ease) 0s,
    transform 120ms var(--go-activate-ease) 0s,
    visibility 0s linear 240ms;
}
.go-activate[data-go-camera="1"] .go-activate__cam {
  opacity: 1;
  transform: scale(1);
  visibility: visible;
  transition:
    opacity 160ms var(--go-activate-ease) 120ms,
    transform 160ms var(--go-activate-ease) 120ms,
    visibility 0s linear 0s;
}
/* Zumachen: dieselbe Bewegung rueckwaerts. Die Kamera geht in 120ms und
   waechst dabei die Spur zurueck, die sie beim Kommen verloren hat; der
   Inhalt kommt direkt danach. Zusammen 220ms.
   Genau diese Bewegung nimmt spaeter auch ein erkannter Code: Er setzt
   dasselbe Attribut, und der Rest steht hier. */
.go-activate[data-go-camera="0"] .go-activate__cam {
  opacity: 0;
  transform: scale(1.015);
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 120ms var(--go-activate-ease) 0s,
    transform 120ms var(--go-activate-ease) 0s,
    visibility 0s linear 220ms;
}
.go-activate[data-go-camera="0"] .go-activate__face {
  opacity: 1;
  transform: scale(1);
  visibility: visible;
  transition:
    opacity 160ms var(--go-activate-ease) 120ms,
    transform 160ms var(--go-activate-ease) 120ms,
    visibility 0s linear 0s;
}
/* Wer Bewegung abbestellt hat, bekommt den Wechsel ohne sie: die Kamera steht
   dann sofort da. */
@media (prefers-reduced-motion: reduce) {
  .go-activate,
  .go-activate__face,
  .go-activate__cam,
  .go-activate__done { transition: none !important; }
}
/* Ueberschrift und Satz stehen oben links, das Feld darunter in der Mitte -
   und was danach noch frei ist, bleibt frei.

   Die Karte liest damit von oben nach unten: erst wer sie ist, dann was zu
   tun ist. Vorher stand alles zusammen in der Mitte, mit gleich viel Luft
   darueber wie darunter - das war ruhig, aber es hatte keinen Anfang. Die
   Flaeche unter dem Feld ist Absicht und kein Rest: Sie gibt der Karte den
   Atem, den eine Flaeche braucht, auf der gleich ein Kamerabild steht, und
   sie ist genau der Platz, in dem die Zeile unter dem Feld erscheint, wenn
   ein Code nichts fand. */
.go-activate__face {
  display: flex;
  flex-direction: column;
  padding: var(--go-card-pad);
}
.go-activate__title {
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--go-activate-ink);
}
.go-activate__hint {
  margin: 5px 0 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--go-activate-ink-soft);
}
/* Das Codefeld - EIN Bedienteil und nicht drei nebeneinander.

   Es ist eine breite weisse Leiste, in der links der Code steht und rechts
   die beiden Knoepfe sitzen: 78 Punkte hoch, weich gerundet, mit Polster an
   beiden Enden. Vorher war es eine gut 50 Punkte hohe Kapsel, in der drei
   Sachen aneinanderklebten; die Hoehe ist der ganze Unterschied zwischen "da
   ist ein Eingabefeld" und "hier wird gearbeitet".

   Die Knoepfe stehen IM Feld und nicht daneben. Der Kellner sieht eine
   Handlung: Code herein - und zwei Wege, ihn hereinzubekommen. */
.go-activate__row {
  /* Der Abstand zur Ueberschrift steht hier und nicht als Luecke am Block:
     Eine Luecke traefe auch die zwei Zeilen darueber und risse Titel und Satz
     auseinander, die zusammengehoeren.

     Es ist wieder eine feste Zahl, und das ist der Punkt an der kompakten
     Karte: Unter dem Feld kommt nichts mehr, also endet die Schicht dort.
     Was die Karte frueher an Leere darunter trug, traegt sie jetzt gar
     nicht - sie waechst erst, wenn wirklich etwas hineinkommt. */
  margin-top: 20px;
  /* Die Leiste behaelt ihre Hoehe, egal was in der Karte sonst noch steht.
     Ohne das schruempfte sie als Flex-Kind, sobald die Zeile unter ihr zwei
     Zeilen lang wird - und genau dann waere sie gequetscht. */
  flex: 0 0 auto;
  height: 78px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--go-activate-line);
  /* Weich gerundet, nicht ganz rund: Eine Kapsel von 78 Punkten Hoehe waere
     an den Enden ein Halbkreis von 39 Punkten und liesse die Knoepfe darin
     schief sitzen. 24 traegt die Rundung der Karte (28) nach innen weiter. */
  border-radius: 24px;
  background: #ffffff;
}
/* Das Feld faerbt seinen Rand, wenn der Kellner darin tippt. */
.go-code-box:focus-within { border-color: #818cf8; }
.go-activate__input {
  flex: 1 1 auto;
  min-width: 0;
  height: 54px;
  /* Zusammen mit dem Polster der Leiste (10) stehen 24 Punkte zwischen der
     Kante der Leiste und der Schrift darin. */
  padding: 0 4px 0 14px;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 900;
  /* Ein Code liest sich in Bloecken - aber nur der Code. Die Laufweite gilt
     deshalb dem Getippten und nicht dem Platzhalter, der sonst breiter waere
     als das Feld auf einem 320er Telefon. */
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--go-activate-ink);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}
.go-activate__input::placeholder {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
  color: #94a3b8;
}
.go-activate__go,
.go-activate__qr {
  flex: 0 0 auto;
  /* Beide gleich hoch, beide fingergross: Sie stehen nebeneinander in einer
     Leiste, und zwei verschiedene Hoehen darin saehen aus wie ein Fehler.
     54 Punkte lassen oben und unten je 11 Punkte Luft in der Leiste - die
     Knoepfe sitzen darin und stossen nicht an. */
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  /* Weniger rund als die Leiste (24), und deutlich runder als eckig: Ein
     Knopf, der genauso rund waere wie sein Behaelter, sieht darin verkantet
     aus, und ein eckiger sieht hineingelegt aus. */
  border-radius: 17px;
  font: inherit;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, opacity 0.15s ease, transform 0.15s ease;
}
/* Der Handgriff der Karte im Navy der Marke. Er steht als Wort da und nicht
   in Grossbuchstaben: "Aktivizo" ist der Name der Handlung, kein Schild.

   Dasselbe Navy traegt der Abschluss unten in der dritten Schicht: Es sind
   die beiden Handgriffe des Kellners, und beide sollen sich gleich anfuehlen.
   Das Violett bleibt dem QR-Knopf und dem Zaehler - den Sachen, die
   danebenstehen. */
.go-activate__go {
  padding: 0 16px;
  background: var(--go-activate-ink);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}
/* Waehrend gesucht wird, aendert sich am Knopf KEINE Zahl. Frueher stand hier
   ein laengeres Wort, solange gesucht wurde, und ein engeres Polster, das
   Differenz auffing - der Knopf wurde beim Druecken schmaler und das Feld
   daneben breiter. Jetzt bleibt das Wort stehen und wird nur unsichtbar; was
   arbeitet, liegt darueber. Also bleibt auch das Polster. */
.go-activate__go[disabled] { cursor: default; }
/* Und der QR-Knopf daneben ruhig: hell, mit dem Violett nur im Zeichen. Zwei
   volle Farbflaechen nebeneinander haetten beide gleich laut gemacht. Er ist
   auch schmaler als der Handgriff - der zweite Weg soll als der zweite
   lesen. */
.go-activate__qr {
  /* Breiter als hoch waere zu viel, quadratisch war zu wenig: Bei 58 Punkten
     steht das Zeichen in einer Flaeche, die man als Knopf liest, und der
     Handgriff daneben bleibt trotzdem der breitere von beiden - der zweite
     Weg soll als der zweite lesen. */
  width: 58px;
  background: #eef2ff;
  color: #4f46e5;
}
.go-activate__go:active,
.go-activate__qr:active { transform: scale(0.96); }
.go-activate__qr svg,
.go-activate__qr i {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  display: block;
}
/* Die eine Zeile unter dem Feld - der Code, der nichts fand, oder die Kamera,
   die nicht aufging. Sie steht in der freien Flaeche unter dem Feld und
   schiebt nichts: Auf der hellen Karte traegt sie ein Rot, das lesbar ist
   (#e11d48); das Rosa von vorher war fuer das dunkle Navy gewaehlt und
   verschwaende hier fast. */
/* Die Zeile unter dem Feld. Sie steht immer im Aufbau und ist nur dann zu
   sehen, wenn die Karte sagt, dass es etwas zu sagen gibt - dieselbe Marke,
   an der auch die Hoehe der Karte haengt. So kostet eine Fehlermeldung kein
   Neuzeichnen: Der Satz kommt in den Knoten, das Attribut kommt an die Karte,
   und der getippte Code bleibt unangetastet im Feld stehen. */
.go-activate__status {
  margin: 0 4px;
  height: 0;
  overflow: hidden;
  opacity: 0;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.35;
  color: #e11d48;
  transition: opacity 140ms var(--go-activate-ease);
}
.go-activate[data-go-note="1"] .go-activate__status {
  margin-top: 12px;
  height: auto;
  opacity: 1;
}
/* Der Kamera-Zustand. Das Bild IST die Karte: es fuellt sie ganz aus, ohne
   Polster und ohne eigenen Rahmen - die Rundung schneidet die Karte selbst.
   Ein Navy-Rand darum haette ausgesehen, als laege ein Bild AUF der Karte
   statt dass die Karte das Bild waere. */
/* Das Bild ist unsichtbar, bis Masse da sind und play() durch ist. Die
   Flaeche darunter steht die ganze Zeit in ihrer Endgroesse - es wartet also
   nichts auf das Bild, es wird nur ausgefuellt. Ohne das saehe man erst ein
   leeres Feld und dann kurz ein hochkantes Video, das sich zurechtrueckt. */
.go-activate[data-go-cam-ready="1"] .go-activate__cam-view { opacity: 1; }
.go-activate__cam-view {
  opacity: 0;
  transition: opacity 140ms var(--go-activate-ease);
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: #000000;
  object-fit: cover;
}
.go-activate__cam-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgb(15 23 42 / 0.55);
  color: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, transform 0.15s ease;
}
.go-activate__cam-close:active { transform: scale(0.95); }
.go-activate__cam-close svg,
.go-activate__cam-close i {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
}
/* ==========================================================================
   Die gefundene Buchung - die dritte Schicht derselben Karte.

   Sie steht an derselben Stelle, in denselben Aussenmassen und mit derselben
   Rundung wie die Eingabemaske: Der Kellner tippt einen Code, und die Karte
   VERWANDELT sich, statt eine zweite Karte unter sich aufzumachen. Deshalb
   gibt es hier auch keinen eigenen Rahmen, keinen eigenen Grund und keinen
   eigenen Schatten - eine Karte in einer Karte waere genau das, was hier
   verschwinden sollte.
   ========================================================================== */
/* Ruhe heisst: weg. Diese Regel ist zugleich die Bewegung nach draussen -
   sie gilt in dem Augenblick, in dem data-go-found wieder auf "0" steht.
   Der Weg ist kurz (8 Punkte nach unten) und nur ein Hauch; es soll aussehen
   wie eine Seite, die weiterblaettert, nicht wie ein Fenster, das zufaellt. */
.go-activate__done {
  display: flex;
  flex-direction: column;
  /* Oben und unten mehr als an den Seiten - wie in der Eingabemaske. An den
     Seiten zaehlt jeder Punkt: Was das Polster nimmt, fehlt drinnen dem
     Knopf, der Frage und dem Zaehler, und auf einem 360er Telefon
     entscheidet das darueber, ob Frage und Zaehler nebeneinander passen. */
  padding: 24px 18px;
  opacity: 0;
  transform: translateY(8px);
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 110ms var(--go-activate-ease) 0s,
    transform 110ms var(--go-activate-ease) 0s,
    visibility 0s linear 220ms;
}
/* Und da: Die Buchung kommt herein, nachdem die Eingabemaske gegangen ist
   (90ms Verzug, 150ms) - zusammen 240ms. Dieselbe Kurve wie bei der Kamera,
   damit die Karte nur EINE Art hat, sich zu verwandeln.

   "data-go-camera=0" steht mit im Wahlspruch, damit diese Regel eine offene
   Kamera nicht ueberstimmt: Das Bild bleibt das Bild, egal was der Zustand
   sonst noch weiss. */
.go-activate[data-go-camera="0"][data-go-found="1"] .go-activate__done {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  pointer-events: auto;
  transition:
    opacity 160ms var(--go-activate-ease) 120ms,
    transform 160ms var(--go-activate-ease) 120ms,
    visibility 0s linear 0s;
}
/* Die Eingabemaske geht dafuer weg - nur weg, ohne sich zu bewegen. Die
   Bewegung gehoert der Schicht, die kommt; zwei Schichten, die gleichzeitig
   wandern, sehen aus wie ein Ruck. Zurueck kommt sie ueber die Regel, die
   schon fuer die Kamera dasteht (120ms mit 100ms Verzug). */
.go-activate[data-go-camera="0"][data-go-found="1"] .go-activate__face {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 110ms var(--go-activate-ease) 0s,
    visibility 0s linear 240ms;
}
/* Der Kopf: links die Beschriftung mit dem Code darunter, rechts die Gruppe.
   Er sitzt oben und haelt seine Hoehe fest - was darunter atmet, ist das
   Angebot. */
.go-activate__done-head {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
/* Die linke Haelfte: zwei Zeilen, die zusammengehoeren. "min-width: 0" ist
   der Grund, warum ein langer Code die Pille daneben nicht aus der Karte
   schiebt - ohne das waere die Spalte so breit wie ihr laengstes Wort. */
.go-activate__done-id {
  min-width: 0;
}
/* "OFERTA" - ein Schild und kein Wert: klein, in Grossbuchstaben, mit Luft
   zwischen den Buchstaben und im ruhigen Ton. */
.go-activate__done-label {
  margin: 0;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--go-activate-ink-soft);
  white-space: nowrap;
}
/* Der Code, wie ihn der Kellner gerade eingetippt hat. Er steht gross und
   ohne Kasten da: Ein Rahmen um einen Code sagt "Feld", und hier ist nichts
   mehr einzugeben. Die Laufweite ist die des Codefeldes darueber - derselbe
   Code soll sich in beiden Schichten gleich lesen. */
.go-activate__done-code {
  margin: 3px 0 0;
  /* Kleiner als das Angebot in der Mitte, und das mit Absicht: Der Code ist
     die Quittung dafuer, dass die richtige Buchung gefunden wurde - was der
     Gast bekommt, steht darunter. Waeren beide gleich gross, laesen sie sich
     als zwei gleich wichtige Sachen. */
  font-size: 19px;
  font-weight: 900;
  letter-spacing: 0.05em;
  line-height: 1.15;
  color: var(--go-activate-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Die Gruppe, mit der der Gast gekommen ist - eine kleine weisse Pille, die
   auf der hellen Karte liegt. Sie ist eine Auskunft und kein Knopf: keine
   Farbe, kein Schatten, nur eine Haarlinie. */
.go-activate__done-party {
  flex: 0 0 auto;
  margin: 0;
  padding: 8px 15px;
  border: 1px solid var(--go-activate-line);
  border-radius: 999px;
  background: #ffffff;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.2;
  white-space: nowrap;
  color: var(--go-activate-ink);
}
/* Das Angebot. Es ist der groesste Bereich der Karte: Es nimmt den ganzen
   Platz, den Kopf, Linie, Gruppe und Knopf uebrig lassen - rund 100 Punkte -
   und mindestens 72. Damit steht ein kurzes "-10%" und ein langes Paket
   gleich weit von der Kante des Kopfes und von der Linie entfernt, und die
   Zeilen darunter wandern nicht, wenn das naechste Angebot eine Zeile
   kuerzer ist.

   Der Abstand nach oben steht hier: Der Kopf ist eine Beschriftung, das
   Angebot ist der Inhalt - sie sollen nicht aneinanderkleben. Nach unten
   macht die Linie ihren eigenen Abstand.

   "margin: auto 0" am Text statt "justify-content: center" am Bereich: Beim
   Zentrieren ueber die Ausrichtung schneidet ein ueberlanger Text oben ab und
   ist dann nicht mehr erreichbar; automatische Aussenabstaende geben in dem
   Fall von selbst nach. Was dann noch laenger ist als der Platz, bleibt
   erreichbar - abgeschnitten wird nichts. */
.go-activate__deal {
  flex: 1 1 auto;
  min-height: 72px;
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
}
/* Der Mittelpunkt der Karte: mittig, gross, ohne Kasten und ohne Rahmen. Die
   Groesse kommt als Stufe von aussen (goDealTextSize) - "xl" ist die kurze
   Zusage, "sm" der lange Satz. Hier steht die groesste; die drei anderen
   nehmen sie zurueck. */
.go-activate__deal-text {
  margin: auto 0;
  text-align: center;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--go-activate-ink);
  /* Ein Produktname ohne Leerzeichen soll umbrechen und nicht seitwaerts aus
     der Karte laufen. */
  overflow-wrap: anywhere;
}
.go-activate__deal[data-go-deal="lg"] .go-activate__deal-text {
  font-size: 24px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.go-activate__deal[data-go-deal="md"] .go-activate__deal-text {
  font-size: 19px;
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.go-activate__deal[data-go-deal="sm"] .go-activate__deal-text {
  font-size: 16px;
  letter-spacing: -0.005em;
  line-height: 1.35;
}
/* Steht eine Meldung ueber dem Knopf, nimmt sie ihren Platz aus dem
   Angebotsbereich: Der bleibt dann eben kuerzer als seine Mindesthoehe, statt
   dass der Knopf unten aus der Karte geschoben wird. Der Text ist weiter
   ganz da - der Bereich rollt. */
.go-activate[data-go-note="1"] .go-activate__deal { min-height: 0; }
/* Die Trennlinie zwischen dem Angebot und dem, was damit zu tun ist. Eine
   Haarlinie im Ton der Karte, ueber fast die ganze Breite - dunkler waere sie
   ein Strich, und ein Strich teilte die Karte in zwei Karten. */
.go-activate__rule {
  flex: 0 0 auto;
  height: 1px;
  margin: 22px 2px;
  background: var(--go-activate-line);
}
/* Die Frage und der Zaehler. Sie stehen nebeneinander, solange sie
   nebeneinander passen - und sobald nicht, bricht die Zeile um und der
   Zaehler steht rechts darunter ("margin-left: auto" haelt ihn dort). Die
   Frage wird dabei weder kleiner noch abgeschnitten: Sie ist die Frage, die
   der Kellner beantwortet. */
.go-activate__party {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 12px;
}
.go-activate__party-label {
  /* 145 Punkte sind die Schwelle, an der die Zeile umbricht: Darunter passt
     der Zaehler (142) mit seiner Luecke (12) nicht mehr daneben, und dann
     gehoert er unter die Frage statt in eine zu enge Zeile. */
  flex: 1 1 145px;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--go-activate-ink-soft);
  overflow-wrap: anywhere;
}
/* Der Zaehler: eine weisse Kapsel mit einer Haarlinie, darin zwei Griffe und
   die Zahl. Vorher stand dort ein nacktes Zahlenfeld - der Kellner musste
   hineintippen, und auf einem Telefon heisst das: Tastatur auf, Zahl weg,
   Karte halb verdeckt. */
.go-activate__stepper {
  flex: 0 0 auto;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
  height: 52px;
  /* Polster an den Enden, damit Minus und Plus nicht an der Kante der Kapsel
     kleben - sonst trifft ein Daumen am Rand daneben. */
  padding: 0 6px;
  border: 1px solid var(--go-activate-line);
  border-radius: 999px;
  background: #ffffff;
}
/* Minus und Plus sind fingergross (40 Punkte, also ueber der Schwelle, ab
   der ein Ziel auf dem Telefon sicher zu treffen ist) und tragen das Violett
   der Marke - sie sind das Einzige an dieser Zeile, das etwas tut. */
.go-activate__step {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--go-activate-accent);
  font: inherit;
  font-size: 21px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, transform 0.15s ease;
}
.go-activate__step:active {
  background: var(--go-activate-accent-soft);
  transform: scale(0.92);
}
/* Die Zahl in der Mitte. Es ist unveraendert DASSELBE Feld wie vorher -
   dieselbe Marke, derselbe Typ, dieselben Grenzen; es hat nur seinen Rahmen
   an die Kapsel abgegeben. Die Pfeilchen, die ein Zahlenfeld von sich aus
   mitbringt, sind weg: Neben einem Minus und einem Plus waeren sie ein
   zweiter Zaehler im ersten. */
.go-activate__party-input {
  flex: 0 0 auto;
  width: 44px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 19px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  color: var(--go-activate-ink);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  -moz-appearance: textfield;
}
.go-activate__party-input::-webkit-outer-spin-button,
.go-activate__party-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Der Knopf, an dem Geld entsteht: ueber die ganze Breite und im Violett der
   Marke - dasselbe, das auch "Aktivizo" in der Schicht davor traegt. Beide
   sind Handgriffe, und Handgriffe haben hier eine Farbe.

   Er steht als Wort da und nicht in Grossbuchstaben. Ein Schild in Versalien
   las sich lauter als das Angebot darueber, und das Angebot ist das, worum es
   geht. */
.go-activate__finalize {
  flex: 0 0 auto;
  margin-top: 20px;
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  /* Eine Spur runder als vorher (18), damit die Rundung mit der Hoehe
     mitwaechst und der Knopf nicht kantiger wirkt, nur weil er groesser ist.
     Er bleibt damit zwischen dem Zaehler (rund) und der Karte (28). */
  border-radius: 20px;
  background: var(--go-activate-ink);
  color: #ffffff;
  font: inherit;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.01em;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.go-activate__finalize:active { transform: scale(0.98); }
.go-activate__finalize[disabled] { cursor: default; }
/* ==========================================================================
   Ein Handgriff, der arbeitet, waehrend man ihn ansieht.

   Vier Zustaende an EINEM Attribut (data-go-phase), und in allen vieren ist
   der Knopf auf den Punkt gleich gross: Das Wort bleibt im Fluss und wird nur
   unsichtbar, die Zeichen liegen darueber und nehmen keinen Platz.
   ========================================================================== */
.go-activate__go,
.go-activate__finalize { position: relative; }
/* Das Wort geht nach oben weg - 4 Punkte, mehr nicht. Es soll aussehen, als
   traete es zur Seite, nicht als floege es davon. */
.go-sign__label {
  display: block;
  transition:
    opacity 120ms var(--go-activate-ease),
    transform 120ms var(--go-activate-ease);
}
[data-go-phase="busy"] > .go-sign__label,
[data-go-phase="done"] > .go-sign__label,
[data-go-phase="fail"] > .go-sign__label {
  opacity: 0;
  transform: translateY(-4px);
}
/* Die drei Zeichen liegen deckungsgleich ueber dem Wort. */
.go-sign {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms var(--go-activate-ease);
}
.go-sign svg {
  width: 18px;
  height: 18px;
  display: block;
}
/* Der Bogen: ein Ring, dem ein Stueck fehlt, und er dreht sich gleichmaessig.
   Kein grosser Spinner - er sitzt in einem Knopf und nicht auf einer Seite. */
.go-sign__ring {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.32);
  border-top-color: #ffffff;
  animation: go-sign-spin 720ms linear infinite;
}
@keyframes go-sign-spin { to { transform: rotate(360deg); } }
/* Die Zeichen kommen erst, nachdem das Wort weg ist (120ms Verzug). */
[data-go-phase="busy"] > .go-sign--ring,
[data-go-phase="done"] > .go-sign--check,
[data-go-phase="fail"] > .go-sign--cross {
  opacity: 1;
  transition: opacity 120ms var(--go-activate-ease) 120ms;
}
/* Und der Knopf faerbt sich kurz, wenn es schiefging - nur er, nicht die
   Karte darum. Der Kellner soll den Fehler dort sehen, wo er gedrueckt hat. */
[data-go-phase="fail"] { background: #e11d48 !important; }
/* Wer Bewegung abbestellt hat, bekommt die Zustaende ohne Fahrt: Das Zeichen
   steht sofort da, und der Bogen dreht sich nicht. */
@media (prefers-reduced-motion: reduce) {
  .go-sign,
  .go-sign__label { transition: none !important; }
  .go-sign__ring { animation-duration: 2400ms; }
}
/* Wenn der Abschluss nicht durchging. Die Zeile steht ueber dem Knopf, an dem
   es passiert ist, und nimmt ihren Platz aus dem Angebotsbereich darueber -
   der Knopf bleibt, wo er ist. */
/* Dieselbe Zeile im Abschluss, mit derselben Regel dahinter. */
.go-activate__done-status {
  flex: 0 0 auto;
  margin: 0 2px;
  height: 0;
  overflow: hidden;
  opacity: 0;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.35;
  color: #e11d48;
  transition: opacity 140ms var(--go-activate-ease);
}
.go-activate[data-go-note="1"] .go-activate__done-status {
  margin-top: 14px;
  height: auto;
  opacity: 1;
}
/* Und der Gast, der noch nicht gewischt hat: kein Knopf, ein Satz. Er steht
   unter der Linie, wo sonst die Frage und der Knopf stehen. */
.go-activate__wait {
  flex: 0 0 auto;
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
  color: #b45309;
}
/* Auf den schmalsten Telefonen ruecken Karte, Leiste und Knoepfe enger
   zusammen. Bei 320 Punkten ist die Karte 272 breit, und was die Knoepfe an
   Breite nehmen, fehlt dem Platzhalter: "Kodi i klientit" stand dort sonst
   abgeschnitten da. Die Leiste bleibt dabei ueber 76 Punkte hoch - eng wird
   sie in der Breite, nicht in der Hoehe.
   Dieselbe Schwelle wie bei den Pillen, damit die Seite an EINER Stelle
   schmal wird und nicht an dreien. */
@media (max-width: 359px) {
  .go-activate__row { margin-top: 16px; height: 76px; gap: 5px; padding: 0 8px; border-radius: 22px; }
  .go-activate__input { height: 52px; padding-left: 12px; font-size: 13px; }
  .go-activate__input::placeholder { font-size: 11px; }
  .go-activate__go,
  .go-activate__qr { height: 52px; border-radius: 16px; }
  .go-activate__go { padding: 0 13px; font-size: 12px; }
  .go-activate__qr { width: 50px; }
  /* Und dieselbe Karte in ihrer dritten Schicht. Hier stehen Frage und
     Zaehler untereinander - 272 Punkte Kartenbreite reichen nicht fuer beide
     nebeneinander -, und diese zweite Zeile muss irgendwoher kommen: aus den
     Abstaenden, nicht aus der Hoehe. Die Karte ist hier genauso hoch wie
     ueberall, und das muss sie auch sein - es ist EINE Hoehe fuer alle drei
     Schichten, und daran haengt, dass beim Wechsel nichts springt.

     Enger wird sie an den Seiten und in den Abstaenden; das Angebot behaelt
     seine Groessen - es ist das, worum es geht. */
  .go-activate__done { padding: 20px 15px; }
  .go-activate__done-code { font-size: 18px; }
  .go-activate__done-party { padding: 7px 13px; font-size: 12px; }
  /* Hier stehen Frage und Zaehler untereinander, und diese zweite Zeile muss
     irgendwoher kommen: aus den Abstaenden, nicht aus der Hoehe. Die Karte
     ist hier genauso hoch wie ueberall, und das muss sie auch sein - es ist
     EINE Hoehe fuer alle drei Schichten. Das Angebot behaelt dabei seinen
     Platz; es ist das, worum es geht. */
  .go-activate__deal { margin-top: 14px; }
  .go-activate__rule { margin: 17px 2px; }
  .go-activate[data-go-note="1"] .go-activate__done-status { margin-top: 11px; }
  .go-activate__finalize { margin-top: 16px; height: 54px; }
}
/* ------------------------------------------------------------------------
   Die Buchungskarten: "Ne pritje" und "Finalizuar", direkt auf der Flaeche.

   In beiden Reitern stand eine Karte in einer Karte: aussen ein weisser
   Abschnitt mit Marke, Ueberschrift und Anzahl, darin die einzelnen
   Vorgaenge. Der Abschnitt sagte dreimal, wo man ist - die Pille darueber
   sagt es einmal. Also ist er weg, und unter den Pillen stehen die Vorgaenge
   selbst.

   Es ist EINE Karte fuer beide Reiter, und das ist keine Sparsamkeit: Es sind
   dieselben Buchungen, einmal bevor der Gast da war und einmal danach. Sie
   sollen deshalb auch gleich aussehen - gleiche Hoehe, gleiche Rundung,
   gleiches Polster, gleicher Aufbau. Was sie unterscheidet, ist zwei Farben,
   und die stehen unten als Abwandlung.

   Der Abstand nach oben kommt weiter von --work-bento-lead, dem Mass, mit dem
   im Paneli wie in GO alles unter der Leiste beginnt.
   ------------------------------------------------------------------------ */
/* Die Liste - EINE Regel fuer "Në pritje" und "Finalizuar".

   Sie stand hier schon, hat aber nie gewirkt: Direkt darueber im Blatt stand
   eine schliessende Klammer zu viel, und ein CSS-Parser verschluckt an so
   einer Stelle die naechste Regel ganz. Die Karten klebten deshalb
   aneinander - gemessen 0 Punkte Abstand -, obwohl hier ein Abstand stand.
   Vor dem Umbau traf es an derselben Stelle .go-booking-meta, deren Kommentar
   bis heute erklaert, warum die Angaben "aneinanderklebten". Es war immer
   dieselbe Klammer.

   Kein Trennstrich, keine negativen Margen, kein Ueberlappen: nur ein
   Abstand, der groesser ist als jeder Abstand INNERHALB einer Karte. */
.go-cards {
  display: grid;
  gap: var(--go-card-gap);
  min-width: 0;
}
/* EINE ruhige Flaeche je Vorgang - und derselbe Rahmen wie in Aktivizo.

   Grundhoehe, Rundung und Polster stehen als --go-card-* oben, dort, wo die
   Arbeitskarte des Kellners sie auch herholt. Hier steht keine einzige eigene
   Zahl dafuer: Wer zwischen den Reitern wechselt, soll dieselbe Karte sehen,
   und das geht nur, wenn es dieselben Zahlen sind.

   Die zwei Farben stehen als Marken an der Karte selbst, damit die Abwandlung
   darunter genau ZWEI Zeilen lang ist und nicht die halbe Karte noch einmal
   aufschreibt. Voreingestellt ist das Wartende - der haeufigere Fall.

   MINDESThoehe, keine feste: Eine normale Oferta steht genau so hoch wie die
   kompakte Aktivizo-Karte. Eine ungewoehnlich lange darf darueber
   hinauswachsen - lieber eine Karte, die aus der Reihe faellt, als ein
   Angebot, das der Kellner nicht zu Ende lesen kann. Deshalb steht hier
   min-height und nicht height. */
.go-bcard {
  /* "Në pritje": das kuehle Off-White des uebrigen Interfaces - nicht der
     violette Hauch der Arbeitskarte, und erst recht kein Violett. MNYRA GO
     traegt sein Violett in den Kennzahlen und in der gewaehlten Pille; eine
     Liste in derselben Farbe daruntergesetzt macht aus einem Akzent eine
     Wand. */
  --go-bcard-surface: #f8fafc;
  --go-bcard-line: #e7ebf4;
  display: flex;
  flex-direction: column;
  min-height: var(--go-card-height);
  padding: var(--go-card-pad);
  border-radius: var(--go-card-radius);
  background: var(--go-bcard-surface);
  /* Die Haarlinie liegt als innerer Schatten und nicht als Rand - genau wie
     an der Aktivizo-Karte. Ein Rand naehme dem Polster innen seinen Punkt und
     die zwei Karten stuenden um diesen Punkt verschoben. Kein Schlagschatten:
     Er machte auf einer so hellen Flaeche nur Schmutz. */
  box-shadow: inset 0 0 0 1px var(--go-bcard-line);
  min-width: 0;
}
/* "Finalizuar": derselbe Vorgang, nachdem der Gast da war.

   Die Karte ist bis auf die Farbe dieselbe - gleiche Hoehe, gleiche Rundung,
   gleiches Polster, gleiche Zeilen an denselben Stellen. Nur die Flaeche sagt,
   dass das hier vorbei ist: dasselbe Gruen, in dem GO schon "nichts offen"
   sagt (die Karte "Per pagese", wenn sie leer ist). Es ist also keine neue
   Farbe, sondern die, die in GO ohnehin fuer "erledigt" steht.

   Nur die Linie ist eine Spur heller als dort (#dcfce7 statt #bbf7d0, ein
   Schritt in derselben Familie): Auf EINER Karte ist die kraeftige Linie ein
   Akzent, unter einer ganzen Liste wird sie ein Muster. Der Abstand zwischen
   Flaeche und Linie ist damit derselbe wie an der wartenden Karte. */
.go-bcard--done {
  --go-bcard-surface: #f0fdf4;
  --go-bcard-line: #dcfce7;
}
/* Oben links die Zeit, oben rechts der Zustand. Beide auf einer Grundlinie -
   und der Zustand nach rechts, auch wenn links nichts steht. */
.go-bcard__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}
/* Die Zeit ordnet die Liste: Sie ist das Einzige, wonach ein Lokal sie lesen
   kann. Dunkel und klar, aber nicht so stark wie das Angebot darunter. */
.go-bcard__time {
  margin: 0;
  min-width: 0;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: #0f172a;
  overflow-wrap: anywhere;
}
/* Der Zustand steht klein, in Versalien und ruhigem Blaugrau am Rand. Ein
   farbiges Abzeichen waere das Auffaelligste der Karte - und es ist die
   Auskunft, die am wenigsten sagt: In dieser Liste steht ohnehin nur, wer
   angenommen hat. */
.go-bcard__status {
  margin-left: auto;
  flex: 0 0 auto;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.2;
  color: #64748b;
  white-space: nowrap;
}
/* Der Rumpf nimmt, was der Kopf uebriglaesst, und stellt seine zwei Zeilen
   mittig hinein.

   Damit steht der Inhalt nicht oben zusammengedrueckt mit einer leeren
   Flaeche darunter - die Hoehe der Karte wird benutzt, statt nur eingehalten
   zu werden. Waechst die Karte bei einer langen Oferta ueber ihre Grundhoehe
   hinaus, bleibt derselbe Aufbau: Der Rumpf ist dann so hoch wie sein Inhalt,
   und "mittig" ist schlicht "ganz". */
.go-bcard__body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  /* Ein Mindestabstand zum Kopf, damit die zwei Zeilen bei einer gewachsenen
     Karte nicht an ihm kleben. */
  padding-top: 14px;
  min-width: 0;
}
/* Symbol links, Text rechts - und der Text bricht um, so oft er will. */
.go-bcard__line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  min-width: 0;
}
/* Die Groessen sagen die Reihenfolge, in der gelesen werden soll: Das
   Angebot ist das Groesste und Staerkste - es ist das, was der Kellner an den
   Tisch bringt. Die Zeit ordnet die Liste und steht knapp darunter, die
   Personenzahl gehoert dazu, der Zustand steht klein am Rand. Alle vier
   gleich stark waeren vier Zeilen, die man einzeln lesen muss. */
.go-bcard__line--party { font-size: 13px; }
.go-bcard__line--deal { font-size: 15px; }
/* Das Symbol steht in der Hoehe der ERSTEN Zeile, nicht in der Mitte des
   ganzen Blocks: Bei einem Angebot ueber drei Zeilen rutschte es sonst nach
   unten und zeigte auf nichts. Sein Kasten ist genau eine Zeile hoch (die
   Zeilenhoehe daneben), das Zeichen sitzt darin mittig - damit wandert es
   mit der Schriftgroesse mit, ohne dass irgendwo eine Zahl nachgezogen
   werden muss.

   Nur das Zeichen traegt Violett. Keine Flaeche darunter, kein Kreis, keine
   eigene kleine Karte. */
.go-bcard__icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 1.45em;
  color: #4f46e5;
}
.go-bcard__icon svg,
.go-bcard__icon i {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
}
.go-bcard__text {
  min-width: 0;
  line-height: 1.45;
  /* Umbrechen statt kuerzen: Ein "..." mitten im Angebot nimmt dem Kellner
     genau die Auskunft, wegen der er hinsieht. "anywhere" faengt auch das
     eine lange Wort ohne Leerzeichen ab, das sonst die Karte breiter machen
     und die Seite waagerecht scrollen liesse. */
  overflow-wrap: anywhere;
  word-break: break-word;
}
.go-bcard__line--party .go-bcard__text {
  font-weight: 600;
  color: #475569;
}
.go-bcard__line--deal .go-bcard__text {
  font-weight: 800;
  color: #0f172a;
}
/* Die letzte, leiseste Zeile: was die Buchung das Lokal gekostet hat. Kein
   Trennstrich darueber - die Flaeche bleibt eine, getrennt wird ueber Groesse
   und Ton. Sie steht nach dem Rumpf und damit am Fuss der Karte, egal wie
   hoch die gerade ist. */
.go-bcard__fee {
  margin: 12px 0 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.2;
  color: #94a3b8;
  overflow-wrap: anywhere;
}
/* Ist die Liste leer, bleibt der Bereich still: ein Satz in der Farbe,
   in der auch die anderen leeren Listen sprechen - keine Karte, kein Kasten,
   kein Bild. Ein leerer Kasten, der "nichts da" sagt, ist mehr Flaeche als
   die Auskunft wert ist. */
.go-cards__note {
  margin: 0;
  padding: 4px 2px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #cbd5e1;
}
.go-cards__note--loading { color: #94a3b8; }
/* Die Zahl in der Ne-pritje-Pille. Sie steht GENAU dort, wo die anderen
   Pillen ihr Symbol tragen: dieselbe Breite, dieselbe Mitte, dieselbe
   Grundlinie - die Pille wird dadurch weder hoeher noch runder noch anders.

   Sie erbt die Farbe der Pille. Ist der Reiter gewaehlt, ist sie weiss wie
   das Wort daneben; sonst ist sie das Navy der Marke. Kein Abzeichen, keine
   Blase, keine zweite Farbe. */
.go-tabs__count {
  flex: 0 0 auto;
  min-width: var(--work-pill-icon);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: inherit;
}
/* Auf schmalen Telefonen ruecken die Pillen zusammen (siehe die gemeinsame
   Geometrie) - die Zahl geht denselben Weg wie das Symbol, an dessen Stelle
   sie steht. */
@media (max-width: 413px) {
  .go-tabs__count { font-size: 11px; }
}
@media (max-width: 359px) {
  .go-bcard__line { gap: 9px; }
}
`;

function renderGoKpiCard(card = {}, deps = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  // Kein Knopf: Diese Karten tun nichts. Die Vorgaengerinnen sahen aus wie
  // Knoepfe und waren keine - ein Lokal, das auf eine Zahl tippt und nichts
  // passiert, tippt zweimal und haelt danach die Seite fuer kaputt.
  return `
    <div class="go-kpi__card${card.modifier ? ` ${card.modifier}` : ""}" data-go-kpi="${esc(escapeHtml, card.key)}">
      <div class="go-kpi__top">
        <span class="go-kpi__period">${esc(escapeHtml, card.period)}</span>
        <span class="go-kpi__icon">${safeIcon(icon, card.icon, "w-4 h-4")}</span>
      </div>
      ${card.pending
        ? `<p class="go-kpi__value" role="status" aria-label="${esc(escapeHtml, `${card.title}: ${TEXTS.kpiPending}`)}"><span class="go-kpi__skeleton${card.wide ? " go-kpi__skeleton--wide" : ""}"></span></p>`
        : `<p class="go-kpi__value">${esc(escapeHtml, card.value)}</p>`}
      <p class="go-kpi__title">${esc(escapeHtml, card.title)}</p>
      <p class="go-kpi__note">${esc(escapeHtml, card.note)}</p>
    </div>
  `;
}

/**
 * Die fuenf Karten unter der Kopfzeile.
 *
 * Vier davon sind der Trichter eines Tages, und sie stehen in der Reihenfolge,
 * in der ein Gast ihn durchlaeuft:
 *
 *   gesehen -> gewaehlt -> Besuch verifiziert -> Menschen im Lokal
 *
 * Jede Stufe ist eine andere Frage. "Gesehen" zaehlt MENSCHEN, nicht
 * vorgezeigte Karten - wer dreimal sucht, ist dreimal eine Karte und einmal
 * ein Gast. "Vizita" zaehlt eingeloeste Vorgaenge, "Klientë" die Personen
 * daraus: Eine Buchung bringt einen Tisch, nicht einen Menschen, und deshalb
 * darf die letzte Zahl ueber der vorletzten stehen. Alle vier rechnet der
 * SERVER (siehe businessOverview) - im Browser entsteht hier keine Zahl.
 *
 * Die fuenfte ist keine Kennzahl, sondern die Rechnung. Sie steht abgesetzt,
 * weil sie eine andere Art von Auskunft ist: Die vier davor sagen, was
 * passiert ist; diese sagt, was zu tun ist.
 */
function renderGoKpiRow({ overview = {}, deps = {} } = {}) {
  // Bekannt ist eine Zahl - und `null` heisst "noch nicht bekannt". Jede der
  // fuenf wird einzeln gefragt: Kommt die eine Quelle und die andere nicht,
  // steht die eine Zahl da, waehrend die andere weiter wartet. Keine Zahl
  // haengt darauf, dass alle fuenf beisammen sind.
  const known = (value) => Number.isFinite(Number(value)) && value !== null && value !== "";
  const count = (value) => (known(value) ? String(Math.max(0, Math.trunc(Number(value)))) : "");
  const openCents = known(overview?.openCents) ? Math.max(0, Math.trunc(Number(overview.openCents))) : null;
  const settled = openCents === 0;

  const cards = [
    {
      key: "views",
      period: TEXTS.today,
      icon: "eye",
      value: count(overview?.uniqueViewers),
      pending: !known(overview?.uniqueViewers),
      title: TEXTS.kpiViewsTitle,
      note: TEXTS.kpiViewsNote
    },
    {
      key: "chosen",
      period: TEXTS.today,
      icon: "ticket",
      value: count(overview?.accepted),
      pending: !known(overview?.accepted),
      title: TEXTS.kpiChosenTitle,
      note: TEXTS.kpiChosenNote
    },
    {
      key: "visits",
      period: TEXTS.today,
      icon: "badge-check",
      value: count(overview?.visits),
      pending: !known(overview?.visits),
      title: TEXTS.kpiVisitsTitle,
      note: TEXTS.kpiVisitsNote
    },
    {
      key: "guests",
      period: TEXTS.today,
      icon: "users",
      value: count(overview?.visitors),
      pending: !known(overview?.visitors),
      title: TEXTS.kpiGuestsTitle,
      note: TEXTS.kpiGuestsNote
    },
    {
      key: "due",
      // Nicht "Sot": Offen ist offen, egal wie alt. Eine Gebuehr aus dem
      // Januar verschwindet nicht, weil heute Dienstag ist.
      period: TEXTS.current,
      icon: "wallet",
      value: openCents === null ? "" : formatGoCommission(openCents),
      pending: openCents === null,
      // Ein Betrag ist breiter als zwei Ziffern - der Balken auch.
      wide: true,
      title: TEXTS.kpiDueTitle,
      // Solange der Betrag nicht feststeht, steht dort der Satz, der IMMER
      // stimmt. "Asgje per pagese" waere eine Auskunft, die noch niemand
      // geben kann.
      note: settled ? TEXTS.kpiDueClear : TEXTS.kpiDueNote,
      modifier: settled ? "go-kpi__card--due go-kpi__card--clear" : "go-kpi__card--due"
    }
  ];

  return `
    <div class="mnyra-work__cards" data-go-kpis>
      ${cards.map((card) => renderGoKpiCard(card, deps)).join("")}
      <span class="go-kpi__tail" aria-hidden="true"></span>
    </div>
  `;
}

/**
 * Die zwei Gruppen der Leiste.
 *
 * Oben die Arbeit des Tages in der Reihenfolge, in der sie passiert, daneben
 * die Verwaltung. Sie wechseln GEMEINSAM: Ein Wirt im Betrieb denkt nicht in
 * sechs Reitern, sondern in "was gerade laeuft" und "alles andere".
 */
export const GO_TAB_GROUPS = Object.freeze([
  Object.freeze({
    key: "shift",
    tabs: Object.freeze(["pending", "active", "finalized"])
  }),
  Object.freeze({
    key: "manage",
    tabs: Object.freeze(["stats", "payments", "offers"])
  })
]);

// Ein Symbol je Reiter - ausser bei "Ne pritje": Dort stand eine Uhr, und an
// ihrer Stelle steht jetzt die Zahl der heute wartenden Ofertat (siehe
// renderGoTabs). Deshalb fehlt der Schluessel hier, statt auf ein Zeichen zu
// zeigen, das nie mehr gezeichnet wird.
const GO_TAB_ICONS = Object.freeze({
  active: "zap",
  finalized: "circle-check",
  stats: "bar-chart-3",
  payments: "wallet",
  offers: "tag",
  options: "settings"
});

/**
 * In welcher Gruppe ein Reiter steht - oder -1, wenn in keiner.
 *
 * Genau einer steht in keiner: die Einstellungen. Sie haengen am Knopf oben
 * beim Namen des Lokals und gehoeren nicht in die Leiste, die den Betrieb
 * ordnet. Wer sie oeffnet, soll die Leiste darunter nicht wandern sehen -
 * deshalb -1 und nicht 0.
 */
export function goTabGroupIndex(tab = "") {
  return GO_TAB_GROUPS.findIndex((group) => group.tabs.includes(String(tab || "")));
}

/**
 * Die Leiste: zwei Gruppen auf einem Band, ein Fenster darueber.
 *
 * BEIDE Gruppen stehen im DOM, nebeneinander auf einem Band, und das Band
 * wird verschoben. Das ist der Unterschied zu vorher, wo die Leiste bei jedem
 * Wechsel neu gezeichnet wurde:
 *
 *  - Neu zeichnen hiess, die ganze Seite neu zu schreiben - die Shell ersetzt
 *    appEl.innerHTML. Damit war auch die Karten-Reihe darueber neu, und ihre
 *    waagerechte Scrollposition sprang zurueck auf die erste Karte.
 *  - Ein Band, das sich verschiebt, laesst jeden anderen Knoten der Seite in
 *    Ruhe. Der Wechsel ist eine CSS-Eigenschaft an EINEM Element.
 *
 * Welche Gruppe zu sehen ist, steht als data-go-tab-group an der Leiste. Alles
 * andere haengt im Stylesheet daran: die Verschiebung des Bandes und welcher
 * der beiden Pfeile sichtbar ist. Umschalten heisst deshalb: ein Attribut
 * setzen - kein Knoten wird ersetzt, keine Pille neu gebaut.
 *
 * Die Gruppe, die nicht zu sehen ist, traegt inert und aria-hidden: Sie liegt
 * hinter dem Fensterrand, und weder der Finger noch die Tabulatortaste noch
 * eine Sprachausgabe sollen sie dort finden.
 */
function renderGoTabs({ tab = "active", group = 0, pendingCount = 0, deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const index = Math.min(Math.max(Math.trunc(Number(group) || 0), 0), GO_TAB_GROUPS.length - 1);
  const turnLabel = index < GO_TAB_GROUPS.length - 1 ? TEXTS.groupNext : TEXTS.groupBack;
  // Wie viele Ofertat heute noch warten. Die Zahl steht IN der Pille, an der
  // Stelle, an der die anderen ihr Symbol tragen - siehe unten.
  const waiting = Math.max(0, Math.trunc(Number(pendingCount) || 0));
  return `
    <div class="go-tabs" data-go-tabs data-go-tab-group="${index}">
      <div class="go-tabs__viewport">
        <div class="go-tabs__track">
          ${GO_TAB_GROUPS.map((entry, position) => `
            <div class="mnyra-work__pills go-tabs__pane" role="tablist" data-go-tab-pane="${position}"${position === index ? "" : ` aria-hidden="true" inert`}>
              ${entry.tabs.map((key) => {
                // Die Ne-pritje-Pille trug links eine Uhr. Eine Uhr sagt
                // "Zeit" - und das wusste, wer "Ne pritje" daneben liest,
                // schon. An ihrer Stelle steht jetzt die einzige Auskunft,
                // die dort noch fehlte: wie viele es gerade sind.
                //
                // Kein Abzeichen, kein Kreis, keine Blase. Die Zahl sitzt im
                // Platz des Symbols, erbt die Schrift und die Farbe der Pille
                // und wird mit ihr weiss, wenn sie gewaehlt ist - die Pille
                // bleibt dieselbe Pille, sie sagt nur ein Wort mehr.
                const showsCount = key === "pending";
                const lead = showsCount
                  ? `<span class="go-tabs__count" aria-hidden="true">${esc(escapeHtml, String(waiting))}</span>`
                  : safeIcon(icon, GO_TAB_ICONS[key], "w-4 h-4");
                // Was die Sprachausgabe liest. Sie liest die Zahl mit: Auf dem
                // schmalsten Telefon steht neben ihr kein Wort mehr.
                const spoken = showsCount ? `${waiting} ${TEXTS.tabs[key]}` : TEXTS.tabs[key];
                return `
                <button type="button" role="tab" aria-selected="${tab === key ? "true" : "false"}" data-go-business-tab="${esc(escapeHtml, key)}"
                  aria-label="${esc(escapeHtml, spoken)}" title="${esc(escapeHtml, spoken)}"
                  class="mnyra-work__pill">${lead}<span class="mnyra-work__pill-label">${esc(escapeHtml, TEXTS.tabs[key])}</span></button>
              `;
              }).join("")}
            </div>
          `).join("")}
        </div>
      </div>
      <!--
        Der Pfeil wechselt die GRUPPE und nicht den Reiter. Er traegt deshalb
        kein role="tab" und kein aria-selected: Er waehlt nichts aus, er
        blaettert. Was geoeffnet ist, bleibt geoeffnet, bis jemand einen
        Reiter antippt.

        Beide Zeichen stehen darin, sichtbar ist immer nur eines - welches,
        entscheidet das Stylesheet an der Gruppe. So bleibt auch der Pfeil
        beim Wechsel derselbe Knoten.
      -->
      <button type="button" class="mnyra-work__pill-turn" data-go-tab-group-turn
        aria-label="${esc(escapeHtml, turnLabel)}" title="${esc(escapeHtml, turnLabel)}">
        <span class="go-tabs__turn-icon go-tabs__turn-icon--next">${safeIcon(icon, "chevron-right", "w-4 h-4")}</span>
        <span class="go-tabs__turn-icon go-tabs__turn-icon--back">${safeIcon(icon, "chevron-left", "w-4 h-4")}</span>
      </button>
    </div>
  `;
}

/**
 * Die Gruppengroesse einer Buchung.
 *
 * Zwei Zahlen, und die nachgezaehlte gewinnt: Was der Gast von zuhause aus
 * genannt hat, ist eine Schaetzung; was der Kellner am Tisch bestaetigt hat,
 * ist die Wirklichkeit. Solange niemand nachgezaehlt hat, steht die
 * Schaetzung da.
 *
 * Sie steht als eigene Funktion, weil zwei Stellen dieselbe Zahl brauchen:
 * die Zeile in der Liste und der Kopf der Finalisierungsansicht.
 */
function goBookingPartySize(booking = {}) {
  return booking.partySizeVerified || booking.partySizeRequested || booking.partySize || 1;
}

/**
 * Wie gross das Angebot in der Finalisierungsansicht steht.
 *
 * "-10%" und "1 Croissant + 1 Kafe FALAS me porosi ushqimi" sollen denselben
 * Platz fuellen, und das koennen sie nur in verschiedenen Groessen: Die kurze
 * Zusage ist eine Zahl, die man ueber den Tisch hinweg liest; die lange ist
 * ein Satz, der in zwei, drei Zeilen umbrechen darf.
 *
 * Die Stufe wird an der Laenge abgelesen und nicht gemessen. Messen hiesse,
 * nach dem Zeichnen noch einmal ranzugehen und die Schrift zu schrumpfen -
 * und das sieht man, weil die Karte dann zweimal aussieht. Vier Stufen
 * reichen: Die Grenzen liegen dort, wo ein Text auf dem schmalsten Telefon
 * (320 Punkte) eine Zeile mehr braucht.
 *
 * Abgeschnitten wird nie etwas. Die Stufe waehlt nur, wie gross begonnen
 * wird; was danach immer noch laenger ist als der Platz, bricht um und bleibt
 * im Bereich erreichbar.
 */
function goDealTextSize(label = "") {
  const length = String(label || "").trim().length;
  if (length <= 8) return "xl";
  if (length <= 18) return "lg";
  if (length <= 36) return "md";
  return "sm";
}

/**
 * Eine Buchung als Karte - in "Ne pritje" und in "Finalizuar".
 *
 * EINE Karte fuer beide Reiter. Es sind dieselben Buchungen, einmal bevor der
 * Gast da war und einmal danach; zwei Karten dafuer zu pflegen hiesse, dass
 * sie irgendwann auseinanderlaufen. Was sie unterscheidet, ist die Farbe -
 * sie kommt als Abwandlung an der Klasse und nicht als zweiter Aufbau.
 *
 * Sie steht DIREKT auf der Flaeche des Bentos - es gibt keine Karte mehr um
 * die Liste und keine Karten mehr in der Karte. Vorher war es dreifach
 * verschachtelt: ein weisser Abschnitt mit Marke, Ueberschrift und Anzahl,
 * darin die Zeilen, darin die Angaben. Drei Rahmen fuer eine Auskunft, die
 * eine Zeile lang ist.
 *
 * Uebrig bleibt EINE ruhige Flaeche je Vorgang. Getrennt wird darin ueber
 * Schrift, Symbol, Abstand und Ausrichtung - nicht ueber weitere Rahmen.
 *
 * Und sie zeigt nur, was der Kellner braucht:
 *
 *   Rreth 17:25                      KA PRANUAR
 *   [Users] 2 Mysafire
 *   [Gift]  Hamburger + Pomfrita + Cola + 2 sosa - 3,70 EUR
 *
 * "Mnyra Guest" ist weg. Es war der Name, den jede Buchung traegt, an jeder
 * Buchung - eine Zeile, die an drei Karten untereinander dreimal dasselbe
 * sagte und nie etwas unterschied.
 *
 * Die Reihenfolge ist die der Wichtigkeit von unten nach oben: Das Angebot
 * traegt die Karte, die Zeit ordnet sie, die Personenzahl gehoert dazu, der
 * Zustand steht klein am Rand. Alle vier gleich stark waeren vier Zeilen, die
 * man einzeln lesen muss.
 *
 * Eine abgeschlossene Buchung hat eine Auskunft mehr, und die steht auch da:
 * was sie das Lokal gekostet hat. Eine Provision, die ein Wirt erst auf der
 * Rechnung sieht, waere eine Ueberraschung - und Ueberraschungen bei Geld
 * kosten Vertrauen. Sie steht als letzte, leiseste Zeile am Fuss der Karte,
 * ohne Trennstrich darueber: Die Flaeche bleibt eine.
 */
function renderGoBookingCard(booking = {}, { done = false, deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  // Der Vorteil steht in der eingefrorenen Kopie. Was das Lokal hier liest,
  // ist die Zusage von damals - nicht das heutige Angebot (Punkt 92).
  const benefitLabel = booking.benefitLabel || booking.snapshot?.benefitLabel || "";
  const partySize = goBookingPartySize(booking);
  const accepted = clock(booking.acceptedAt);
  const commission = done && booking.commission ? booking.commission : null;
  return `
    <article class="go-bcard${done ? " go-bcard--done" : ""}" data-go-booking="${esc(escapeHtml, booking.id)}">
      <div class="go-bcard__head">
        ${accepted ? `<p class="go-bcard__time">${esc(escapeHtml, `${TEXTS.around} ${accepted}`)}</p>` : ""}
        <span class="go-bcard__status">${esc(escapeHtml, goBookingBusinessStatusLabel(booking))}</span>
      </div>
      <!--
        Der Rumpf ist KEINE zweite Karte - er hat keine Flaeche, keinen Rand
        und kein eigenes Polster. Er ist nur der Griff, an dem die zwei Zeilen
        die Hoehe fuellen, die der Kopf uebriglaesst.
      -->
      <div class="go-bcard__body">
        <p class="go-bcard__line go-bcard__line--party">
          <span class="go-bcard__icon">${safeIcon(icon, "users", "w-4 h-4")}</span>
          <span class="go-bcard__text">${esc(escapeHtml, `${partySize} ${TEXTS.guests}`)}</span>
        </p>
        ${benefitLabel ? `
          <p class="go-bcard__line go-bcard__line--deal">
            <span class="go-bcard__icon">${safeIcon(icon, "gift", "w-4 h-4")}</span>
            <span class="go-bcard__text">${esc(escapeHtml, benefitLabel)}</span>
          </p>
        ` : ""}
      </div>
      ${commission ? `
        <p class="go-bcard__fee">${esc(escapeHtml, TEXTS.commission)} · ${esc(escapeHtml, formatGoCommission(commission.amountCents))}</p>
      ` : ""}
    </article>
  `;
}

/**
 * Das Suchfeld ueber der Aktiv-Liste.
 *
 * Es ist nicht bloss eine Bequemlichkeit, sondern der einzige Weg zur
 * Bestaetigung: Der Gast zeigt seinen Code, der Kellner tippt ihn, und erst
 * die gefundene Buchung traegt den Knopf. Ohne Code passiert nichts.
 */
/**
 * Aktivizo - die Arbeitskarte des Kellners.
 *
 * EINE Karte, und darin genau der eine Handgriff, den der Kellner am Tisch
 * hat: den Code des Gastes hereinholen. Getippt oder gescannt.
 *
 * Das Codefeld darin ist unveraendert dasselbe wie vorher - dieselben Marken
 * (data-go-code-input, data-go-code-submit), derselbe Zustand, derselbe
 * Handler, dieselbe Suche. Nur seine Huelle ist neu. Hier wurde nichts an der
 * Aktivierung gebaut: Es gibt weiter genau EINEN Weg, und der ist der alte.
 *
 * Die Karte hat drei Schichten, und immer nur eine ist zu sehen:
 *
 *   face   Ueberschrift, Satz, Codefeld mit den zwei Knoepfen
 *   cam    das Kamerabild und ein X, sonst nichts
 *   done   die Buchung, die der Code gefunden hat, und der Weg zum Abschluss
 *
 * Alle drei stehen IMMER im Aufbau; welche zu sehen ist, entscheiden
 * data-go-camera und data-go-found an der Karte. So ist jeder Wechsel ein
 * Attribut und kein Neuaufbau - der Kamerastrom haengt an einem Knoten, den
 * ein Neuaufbau wegwerfen wuerde, und eine Schicht, die neu gezeichnet wird,
 * bewegt sich nicht mehr, sie steht sofort da.
 *
 * "bookingEntering" ist der einzige Grund, warum die Karte ueberhaupt etwas
 * ueber das Zeichnen davor wissen muss: Kommt die Buchung gerade erst an,
 * wird die Karte noch in der Eingabemaske gezeichnet, und der Controller legt
 * das Attribut erst nach dem Zeichnen um. Erst dann liegt eine Aenderung an
 * einem lebenden Knoten vor, und erst die faehrt die Bewegung.
 */
function renderGoActivateCard({
  code = "",
  status = "",
  busy = false,
  cameraOpen = false,
  cameraError = "",
  booking = null,
  bookingEntering = false,
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  const found = booking && typeof booking === "object" ? booking : null;
  const foundOpen = !!found && !bookingEntering;
  // Zwei Meldungen, eine Zeile: Der Code sagt "nicht gefunden", die Kamera
  // sagt "nicht geoeffnet". Beide gehoeren unter dasselbe Feld, und beide
  // gleichzeitig gibt es nicht - wer sucht, scannt nicht.
  //
  // Steht eine Buchung da, gehoert die Meldung zu IHR - dann ist es der
  // Abschluss, der nicht durchging, und er steht in der Schicht, in der er
  // passiert ist. Die Eingabemaske ist in dem Augenblick nicht zu sehen.
  const note = String(status || "").trim() || String(cameraError || "").trim();
  return `
    <div class="go-activate" data-go-activate data-go-camera="${cameraOpen ? "1" : "0"}"
      data-go-found="${foundOpen ? "1" : "0"}" data-go-note="${note ? "1" : "0"}"
      data-go-cam-ready="0" data-go-code-search>
      <div class="go-activate__face" data-go-activate-face>
        <p class="go-activate__title">${esc(escapeHtml, TEXTS.activateTitle)}</p>
        <p class="go-activate__hint">${esc(escapeHtml, TEXTS.activateHint)}</p>
        <div class="go-activate__row go-code-box">
          <input type="text" data-go-code-input value="${esc(escapeHtml, code)}"
            placeholder="${esc(escapeHtml, TEXTS.codePlaceholder)}"
            autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
            class="go-activate__input" />
          ${renderGoActionButton({
            className: "go-activate__go",
            label: TEXTS.activate,
            attrs: `data-go-code-submit${busy ? " disabled" : ""}`,
            deps
          })}
          <button type="button" data-go-camera-open class="go-activate__qr"
            aria-label="${esc(escapeHtml, TEXTS.scanQr)}" title="${esc(escapeHtml, TEXTS.scanQr)}">
            ${safeIcon(icon, "scan-qr-code", "w-5 h-5")}
          </button>
        </div>
        <!--
          Die Zeile unter dem Feld steht IMMER im Aufbau, auch wenn nichts
          darin steht. Das ist der Grund, warum ein fehlgeschlagener Code die
          Karte nicht neu zeichnen muss: Der Controller schreibt den Satz in
          diesen Knoten und legt ein Attribut an der Karte um - der getippte
          Code bleibt dabei unangetastet im Feld, und der Knopf behaelt seine
          laufende Bewegung.

          Waere die Zeile nur dann da, wenn es etwas zu sagen gibt, muesste
          fuer jede Fehlermeldung die halbe Seite neu gebaut werden.
        -->
        <p class="go-activate__status" role="status" data-go-code-status>${esc(escapeHtml, found ? "" : note)}</p>
      </div>
      <!--
        Der Kamera-Zustand: das Bild und das X. Kein Titel, kein Satz, kein
        Feld, kein zweiter Knopf - wer die Kamera aufmacht, haelt sie schon auf
        etwas gerichtet.

        "playsinline" und "muted" sind auf dem iPhone keine Feinheiten: Ohne
        sie reisst Safari das Bild in den Vollbildspieler, und genau das soll
        hier nicht passieren - die Kamera bleibt in der Karte.
      -->
      <div class="go-activate__cam" data-go-activate-cam>
        <!--
          Das Bild ist unsichtbar, bis der Strom wirklich laeuft: Ein <video>
          ohne Masse ist erst gar nichts und dann kurz hochkant, und beides
          sieht man, wenn man es zeigt. Der Controller setzt data-go-cam-ready
          erst, wenn Masse da sind UND play() durch ist - dann blendet das
          Bild in 140ms auf.

          Die Flaeche darunter steht die ganze Zeit in ihrer Endgroesse. Es
          wartet also nichts auf das Bild; es wird nur ausgefuellt.
        -->
        <video class="go-activate__cam-view" data-go-camera-video
          playsinline webkit-playsinline muted autoplay disablepictureinpicture></video>
        <button type="button" data-go-camera-close class="go-activate__cam-close"
          aria-label="${esc(escapeHtml, TEXTS.cameraClose)}" title="${esc(escapeHtml, TEXTS.cameraClose)}">
          ${safeIcon(icon, "x", "w-4 h-4")}
        </button>
      </div>
      ${found ? renderGoFoundBooking({ booking: found, code, busy, note, deps }) : ""}
    </div>
  `;
}

/**
 * Die gefundene Buchung - IN der Karte, nicht darunter.
 *
 * Sie stand frueher als eigene Karte unter der Aktivizo-Karte, und damit
 * standen zwei Karten untereinander fuer einen einzigen Handgriff. Jetzt ist
 * es dieselbe Karte: Der Kellner tippt den Code hinein, und was
 * herauskommt, steht an derselben Stelle.
 *
 * Vier Zeilen von oben nach unten:
 *
 *   Kopf     links die Oferta mit ihrem Code, rechts die Gruppe
 *   Angebot  die Zusage, die der Gast auf seiner Karte gesehen hat
 *   Gruppe   die Frage und die Zahl, die abgerechnet wird
 *   Knopf    FINALIZO
 *
 * Der Code kommt aus dem Feld und nicht aus der Buchung: Er ist das, was der
 * Kellner gerade eingetippt hat, und genau derselbe Wert geht gleich an den
 * Server. Aus dem Dokument der Buchung wird er nirgends gelesen - dort steht
 * er auch nicht.
 *
 * "AKTIVIZUAR" steht hier nicht mehr. Der Zustand war schon die Bedingung
 * dafuer, dass dieser Bildschirm ueberhaupt so aussieht - ihn dann noch
 * einmal hinzuschreiben, sagt nichts.
 */
function renderGoFoundBooking({ booking = {}, code = "", busy = false, note = "", deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const partySize = goBookingPartySize(booking);
  // Der Vorteil steht in der eingefrorenen Kopie: die Zusage von damals, nicht
  // das heutige Angebot (Punkt 92). Es ist derselbe Text, den der Gast auf
  // seiner Karte gesehen hat - deshalb steht er hier ohne Zutat.
  const benefitLabel = booking.benefitLabel || booking.snapshot?.benefitLabel || "";
  // Uebersetzt gelesen. Ein Server, der noch nicht neu veroeffentlicht wurde,
  // schickt "confirmed" - und dann erschiene weder der Knopf noch der Hinweis,
  // und der Kellner stuende vor einer Karte ohne Ausweg.
  const status = normalizeGoBookingStatus(booking.status);
  const shortCode = String(code || "").trim().toUpperCase();
  return `
    <div class="go-activate__done" data-go-activate-done
      data-go-booking="${esc(escapeHtml, booking.id)}">
      <!--
        Der Kopf: links das Wort "Oferta" und darunter der Code, rechts die
        Gruppe, mit der der Gast gekommen ist.

        "Oferta" ist eine Beschriftung und steht deshalb klein und leise da;
        der Code ist das, was der Kellner mit dem Zettel in der Hand
        vergleicht, und steht gross darunter. Vorher standen beide in einer
        Zeile und in derselben Groesse, mit einem Doppelpunkt dazwischen -
        dann liest man das Schild genauso laut wie den Wert.
      -->
      <div class="go-activate__done-head">
        <div class="go-activate__done-id">
          <p class="go-activate__done-label">${esc(escapeHtml, TEXTS.dealCode)}</p>
          ${shortCode ? `<p class="go-activate__done-code">${esc(escapeHtml, shortCode)}</p>` : ""}
        </div>
        <p class="go-activate__done-party">${esc(escapeHtml, `${partySize} ${partySize === 1 ? TEXTS.personOne : TEXTS.personMany}`)}</p>
      </div>
      <!--
        Das Angebot als Text und nicht als Karte in der Karte. Der Bereich
        haelt eine Hoehe frei, damit ein kurzes "-10%" und ein langes
        "1 Croissant + 1 Kafe FALAS me porosi ushqimi" die Zeilen darunter an
        derselben Stelle stehen lassen. Was laenger ist als der Platz, bricht
        um und bleibt erreichbar - abgeschnitten wird nichts.

        Er ist der Mittelpunkt der Karte: gross, mittig und ohne alles
        drumherum. Wie gross, entscheidet die Laenge - "-10%" traegt eine
        andere Schriftgroesse als ein Paket aus zwei Zeilen, und die Stufe
        dafuer wird hier ausgerechnet und nicht im Blatt geraten.
      -->
      <div class="go-activate__deal" data-go-deal="${goDealTextSize(benefitLabel)}">
        <p class="go-activate__deal-text">${esc(escapeHtml, benefitLabel)}</p>
      </div>
      <!--
        Die Linie trennt, worum es geht, von dem, was zu tun ist. Sie ist eine
        Haarlinie im Ton der Karte und kein Strich: Was darueber steht, soll
        weiter das Lauteste auf der Karte sein.
      -->
      <div class="go-activate__rule" aria-hidden="true"></div>
      ${status === "activated" ? `
        <!--
          Die Gruppengroesse gehoert dem Kellner, nicht dem Gast: Er steht vor
          der Gruppe und sieht, wieviele es wirklich sind. Was er hier stehen
          laesst oder aendert, ist die Zahl, die abgerechnet wird (Punkt 12).

          Die Frage und der Zaehler stehen nebeneinander, solange sie
          nebeneinander passen, und untereinander, sobald nicht - deshalb ist
          es kein <label> mehr um beide, sondern eine Zeile, die umbrechen
          darf. Die Beschriftung des Feldes haengt jetzt am Feld selbst.

          Das Feld ist dasselbe wie vorher: dieselbe Marke, derselbe Typ,
          dieselben Grenzen (1 bis 10), derselbe Wert. Nur stehen links und
          rechts davon zwei Griffe, die es um eins bewegen - der Kellner muss
          keine Zahl mehr tippen.
        -->
        <div class="go-activate__party">
          <span class="go-activate__party-label">${esc(escapeHtml, TEXTS.partyAtTable)}</span>
          <div class="go-activate__stepper">
            <button type="button" class="go-activate__step" data-go-party-step="-1"
              aria-label="${esc(escapeHtml, TEXTS.partyLess)}" title="${esc(escapeHtml, TEXTS.partyLess)}">&minus;</button>
            <input type="number" inputmode="numeric" min="1" max="10" data-go-confirm-party
              aria-label="${esc(escapeHtml, TEXTS.partyAtTable)}"
              value="${esc(escapeHtml, partySize)}" class="go-activate__party-input" />
            <button type="button" class="go-activate__step" data-go-party-step="1"
              aria-label="${esc(escapeHtml, TEXTS.partyMore)}" title="${esc(escapeHtml, TEXTS.partyMore)}">+</button>
          </div>
        </div>
        <!--
          Auch hier steht die Zeile immer da. Ein Abschluss, der nicht
          durchging, darf die Karte nicht neu bauen: Die Oferta, der Code und
          die eingestellte Personenzahl stehen im Knoten und nirgends sonst -
          ein Neuaufbau verloere die Zahl, die der Kellner gerade eingestellt
          hat, und er muesste von vorne anfangen.
        -->
        <p class="go-activate__done-status" role="status" data-go-done-status>${esc(escapeHtml, note)}</p>
        ${renderGoActionButton({
          className: "go-activate__finalize",
          label: TEXTS.finalize,
          attrs: `data-go-booking-finalize data-go-booking-id="${esc(escapeHtml, booking.id)}"${busy ? " disabled" : ""}`,
          deps
        })}
      ` : `
        <!--
          Der Gast steht daneben und hat noch nicht gewischt. Ein "nicht
          gefunden" schickte den Kellner auf Fehlersuche bei sich selbst.
        -->
        <p class="go-activate__wait">${esc(escapeHtml, TEXTS.needsActivation)}</p>
      `}
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
 * Ein Reiter, dessen Inhalt noch nicht gebaut ist.
 *
 * Kein leerer Kasten und kein Wort in einer anderen Sprache: Die Karte steht
 * in derselben Form wie jede andere, mit dem Symbol des Reiters und einem
 * Satz, der sagt, was dort einmal stehen wird. Ein Wirt, der darauf tippt,
 * soll wissen, dass er richtig ist und nur zu frueh - nicht, dass etwas
 * kaputt ist.
 */
function renderGoSoonSection({ title = "", note = "", iconName = "", deps = {} } = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  return renderSection({
    eyebrow: TEXTS.brand,
    title,
    sub: TEXTS.soonHint,
    body: `
      <div class="text-center py-10">
        <div class="w-14 h-14 rounded-[1.6rem] bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          ${safeIcon(icon, iconName, "w-5 h-5")}
        </div>
        <p class="text-sm font-semibold text-slate-500">${esc(escapeHtml, note)}</p>
      </div>
    `,
    deps
  });
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
  // Welche der zwei Gruppen die Leiste gerade zeigt. Sie ist NICHT aus dem
  // Reiter abgeleitet: Wer weiterblaettert, soll sehen koennen, was daneben
  // steht, ohne dass sich unter ihm der Inhalt aendert (die Ansicht bleibt,
  // bis jemand einen Reiter antippt).
  group = 0,
  // Die fuenf Zahlen der Karten-Reihe, wie der SERVER sie gerechnet hat.
  //
  // Sie kommen nicht aus dem Tagesdokument, das der Zustand daneben in
  // Echtzeit mitliest: Der offene Betrag steht gar nicht darin, und die
  // Reichweite in Personen soll aus derselben Rechnung kommen wie der Rest -
  // sonst nennt das Panel eine andere Zahl als Heart (Punkt 54). Das
  // Tagesdokument bleibt der Ausloeser, nicht die Quelle.
  //
  // Solange `loaded` falsch ist, steht dort ein Strich statt einer Null: Eine
  // Null, die noch nicht geladen ist, sieht aus wie eine Null, die es
  // wirklich ist.
  overview = {},
  // Das Suchfeld und die Buchung, die es gefunden hat. Nur diese Buchung
  // traegt den Bestaetigen-Knopf.
  search = {},
  // Der Kamera-Zustand der Aktivizo-Karte. Er steht neben der Suche und nicht
  // darin: Die Kamera aendert nichts am Code, und der Code nichts an der
  // Kamera.
  camera = {},
  // Kommt die gefundene Buchung gerade erst an? Dann wird die Karte noch in
  // der Eingabemaske gezeichnet, und der Controller legt danach um - siehe
  // renderGoActivateCard. Ohne Controller (Test, statischer Aufbau) steht die
  // Buchung sofort da, und das ist die richtige Voreinstellung.
  bookingEntering = false,
  bookings = [],
  // Wann "jetzt" ist. Daran haengt, ob eine Frist herum ist - siehe unten. Er
  // kommt von aussen, damit ein Test die Uhr stellen kann.
  nowMs = Date.now(),
  // Der heutige Tag des LOKALS - derselbe Schluessel, den jede Buchung als
  // dayKey traegt und unter dem der Server zaehlt (buildGoDayKey in der
  // Zeitzone des Lokals). Er kommt von aussen und wird hier nicht gebildet:
  // Eine zweite Tagesrechnung neben der bestehenden gaebe irgendwann zwei
  // Tage, und ein Telefon mit falsch gestellter Zeitzone soll nicht seinen
  // eigenen Tag in die Liste des Wirts rechnen.
  //
  // Leer heisst "kein Tag gesetzt" - dann wird nicht nach dem Tag gefiltert.
  dayKey = "",
  offers = [],
  settings = {},
  paused = false,
  loading = false,
  error = "",
  deps = {}
} = {}) {
  const escapeHtml = deps.escapeHtml;
  const icon = deps.icon;
  // Die zwei Listen sind zwei Fragen an den WORKFLOW - nicht an ein Etikett.
  //
  // Der Vorgang geht durch drei Haende: Der Gast nimmt an, der Gast wischt,
  // der Kellner schliesst ab. Nur der letzte Schritt beendet ihn. Alles davor
  // ist derselbe offene Vorgang, und er gehoert dem Kellner, bis er ihn
  // loswird.
  //
  // Hier stand nacheinander fast jede falsche Antwort darauf:
  //
  //   Status "accepted" allein   Der Wisch des Gastes nahm dem Kellner die
  //                              Zeile weg, obwohl fuer ihn noch alles offen
  //                              war.
  //   nur der Kalendertag        Eine Oferta gilt 24 Stunden ab der Annahme,
  //                              nicht bis Mitternacht.
  //   "alles was nicht laeuft"   Damit landete auch Abgelaufenes und
  //     ist Finalizuar           Abgesagtes unter "Finalizuar" - und das Wort
  //                              heisst "vom Kellner abgeschlossen", nicht
  //                              "irgendwie vorbei".
  //
  // Jetzt sind es zwei getrennte, gleich benannte Fragen:
  const status = (booking) => normalizeGoBookingStatus(booking.status);
  // Der Tag des Lokals. Er kommt von aussen (siehe dayKey) - hier wird keine
  // zweite Tagesrechnung gebaut. Ist er nicht gesetzt, oder traegt eine
  // Buchung keinen Tag (eine von damals), wird nicht nach ihm gefiltert:
  // Verstecken, was man nicht pruefen kann, ist die schlechtere Antwort.
  const day = String(dayKey || "").trim();
  const fromToday = (booking) => !day || !booking.dayKey || booking.dayKey === day;
  //
  // "Në pritje": heute angenommen und noch nicht abgeschlossen.
  //
  // Ob der Gast schon gewischt hat, aendert daran nichts - "Aktivizuar" ist
  // ein Zwischenschritt und steht als Zustand an der Karte, nicht als Grund,
  // sie wegzunehmen. Die Frist wird trotzdem mitgefragt: Der Status im
  // Dokument sagt "accepted", bis das naechste Mal jemand die Buchung
  // anfasst - kein Cronjob schreibt ihn um.
  const isPending = (booking) => GO_OPEN_STATUSES.includes(status(booking))
    && isGoBookingLive(booking, nowMs)
    && fromToday(booking);
  // "Finalizuar": wirklich vom Kellner abgeschlossen. Ein Status, kein Rest.
  //
  // Angenommen, aktiviert, QR gescannt, Code gefunden, Step 3 offen - nichts
  // davon reicht. Erst der bestaetigte Abschluss schreibt "finalized", und
  // erst dann steht der Vorgang hier. Abgelaufenes und Abgesagtes steht damit
  // in KEINER der beiden Listen, und das ist richtig: Beides ist weder Arbeit
  // noch Umsatz.
  const isFinalized = (booking) => status(booking) === "finalized";
  //
  // Und beide Listen UND die Zahl an der Pille rechnen aus genau diesen zwei
  // Zeilen. Sie koennen deshalb nicht auseinanderlaufen: Was gezaehlt wird,
  // steht darunter, und was darunter steht, ist gezaehlt.
  const pendingBookings = bookings.filter(isPending);
  const pastBookings = bookings.filter(isFinalized);
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
  } else if (tab === "finalized") {
    // Was der Kellner abgeschlossen hat - und nur das.
    //
    // Hier stand einmal "alles, was nicht mehr laeuft", und darin landete auch
    // Abgelaufenes und Abgesagtes. Aber "Finalizuar" ist kein Sammelbecken fuer
    // alles Vergangene: Es ist die Liste der Vorgaenge, an denen wirklich etwas
    // passiert ist - der Gast war da, der Kellner hat abgeschlossen, es ist
    // Umsatz entstanden. Eine abgelaufene Buchung gehoert nicht dazu, und eine
    // abgesagte erst recht nicht.
    //
    // Und dieselbe Karte wie in "Në pritje", nur in der anderen Farbe: Es ist
    // derselbe Vorgang, einmal davor und einmal danach. Der Abschnitt darum
    // ist auch hier weg - die Pille sagt, wo man ist.
    section = pastBookings.length
      ? `<div class="go-cards">${pastBookings.map((booking) => renderGoBookingCard(booking, { done: true, deps })).join("")}</div>`
      : `<p class="go-cards__note">${esc(escapeHtml, TEXTS.noHistory)}</p>`;
  } else if (tab === "pending") {
    // Keine Karte um die Liste.
    //
    // Hier stand ein Abschnitt wie in den anderen Reitern: "MNYRA GO" als
    // Marke, "Ne pritje" als Ueberschrift, die Anzahl darunter - und darin
    // erst die Vorgaenge. Das war dreimal dieselbe Auskunft auf engstem Raum:
    // Wer auf die Ne-pritje-Pille getippt hat, weiss, wo er ist, und die
    // Pille traegt die Anzahl jetzt selbst.
    //
    // Uebrig bleibt, was der Kellner wirklich sucht: die Vorgaenge, direkt
    // unter den Pillen. Der Abstand dorthin kommt von --work-bento-lead und
    // ist damit derselbe wie unter jeder anderen Leiste der App.
    section = loading
      ? `<p class="go-cards__note go-cards__note--loading" role="status">${esc(escapeHtml, TEXTS.loading)}</p>`
      : (pendingBookings.length
        ? `<div class="go-cards">${pendingBookings.map((booking) => renderGoBookingCard(booking, { deps })).join("")}</div>`
        // Und bei null bleibt es still: ein Satz, keine leere Karte.
        : `<p class="go-cards__note">${esc(escapeHtml, TEXTS.noBookings)}</p>`);
  } else if (tab === "stats") {
    section = renderGoSoonSection({ title: TEXTS.tabs.stats, note: TEXTS.soonStats, iconName: "bar-chart-3", deps });
  } else if (tab === "payments") {
    section = renderGoSoonSection({ title: TEXTS.tabs.payments, note: TEXTS.soonPayments, iconName: "wallet", deps });
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
    // Aktivizo ist ein Arbeitsplatz, keine Uebersicht.
    //
    // Hier standen die laufenden Buchungen als Liste unter dem Suchfeld. Sie
    // sind weg - nicht geloescht, nur nicht mehr hier: Der Kellner am Tisch
    // hat genau eine Aufgabe, und eine Liste, durch die er scrollt, ist bei
    // dieser Aufgabe im Weg. Was laeuft, steht in "Në pritje" - bis zum
    // Abschluss und einschliesslich dessen, was der Gast schon gewischt hat;
    // was gelaufen ist, in "Finalizuar". Dieselben Daten, derselbe Server,
    // derselbe Zustand.
    //
    // Uebrig bleibt: DIE Karte. Die Buchung, die der Code gefunden hat, stand
    // frueher als zweite Karte darunter - damit waren es zwei Karten fuer
    // einen Handgriff, und die Seite sprang, sobald eine davon dazukam. Jetzt
    // ist es dieselbe Karte: Was der Kellner hineintippt, verwandelt sie.
    section = renderGoActivateCard({
      code: search.code,
      status: search.status,
      busy: search.busy,
      cameraOpen: camera.open === true,
      cameraError: camera.error,
      booking: search.booking,
      bookingEntering: bookingEntering === true,
      deps
    });
  }

  return `
    <div class="mnyra-work animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <!--
        Das Stylesheet steht in der Seite und nicht im Kopf des Dokuments: Die
        Reihe braucht Regeln, die sich mit Tailwind-Klassen nicht schreiben
        lassen (Zeilenbegrenzung, versteckte Bildlaufleiste, Rasterpunkte).
        Es wird mit der Seite ersetzt, also gibt es es immer genau einmal.
      -->
      <!--
        Drei Stylesheets. WORK_SURFACE_CSS zuerst: darin steht die Geometrie,
        die diese Seite mit dem Paneli teilt - Seitenpolster, Rhythmus, Benko
        und Pillen. Ohne sie stuenden die Marken hier leer, aus denen das Blatt
        darunter rechnet.

        GO_OFFER_CARD_CSS stand lange nur im Modal - und damit sah die Karte in
        der Vorschau richtig aus und in der Liste des Wirts nach gar nichts.
        Ein Stylesheet, das nur an einem von zwei Orten liegt, an denen
        dieselbe Karte gezeichnet wird, ist kein Stylesheet, sondern eine halbe
        Zusage.
      -->
      <style>${WORK_SURFACE_CSS}${GO_OFFER_CARD_CSS}${GO_ADMIN_CSS}</style>
      <!--
        Dieselbe Ueberschrift wie im Qyteti: oben der Name in einer Zeile,
        darunter ein Satz in klein und grau. Vorher standen hier drei Zeilen
        - eine Marke, eine Ueberschrift, ein Name - und das Lokal las von oben
        nach unten dreimal, wo es ist, bevor es einmal las, was es hier tun
        kann. Zwei Zeilen sagen dasselbe.

        Das GO steht im Blau der Marke und direkt am Wort: "MNYRAGO" ist ein
        Name, kein Wort mit einer Beschriftung daneben. Darunter steht nur noch
        das Lokal selbst.

        Rechts stand hier ein runder violetter Knopf zu den Einstellungen. Die
        Einstellungen stehen jetzt in der globalen Kopfzeile - auf dieser Seite
        genau wie im Paneli, links neben der Sprache. Die Zeile ist damit das
        Gegenstueck zur Begruessung im Paneli: gleiche Achse, gleiche Hoehe,
        gleicher Abstand zu den Karten darunter.

        Angelegt wird eine Oferte weiterhin im Reiter Ofertat - der Knopf
        dafuer steht ueber der Liste, zu der sie gehoert. Es gibt ihn also
        weiter genau einmal.
      -->
      <div class="mnyra-work__head">
        <div class="go-head__brand">
          <h1 class="go-title text-xl font-black tracking-tight text-slate-900">${esc(escapeHtml, TEXTS.brandMnyra)}<span class="text-indigo-600">${esc(escapeHtml, TEXTS.brandGo)}</span></h1>
          ${restaurantName
            ? `<p class="go-title-sub text-[11px] text-slate-400 font-semibold">${esc(escapeHtml, restaurantName)}</p>`
            : ""}
        </div>
      </div>

      ${renderGoKpiRow({ overview, deps })}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        woertlich dieselbe Flaeche wie im Paneli (.mnyra-work__bento). Die
        Reihe darueber bleibt frei: sie gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="mnyra-work__bento go-bento" data-go-bento>
        ${renderGoTabs({ tab, group, pendingCount: pendingBookings.length, deps })}
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
