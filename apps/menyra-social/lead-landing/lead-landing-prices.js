// Die Preise, die die Lead-Landing zeigt.
//
// Eine Verkaufsseite darf an genau einer Stelle nicht ungefaehr sein: beim
// Preis. Wer beim ersten Preis merkt, dass er nicht stimmt, glaubt der Seite
// auch das kostenlose Angebot nicht mehr - und genau das ist hier die ganze
// Geschichte: Mnyra ist gratis, der Dienst daneben kostet einmalig etwas.
//
// Deshalb stehen die Zahlen an einer Stelle und nicht in fuenfzehn Saetzen
// verteilt. Die GO-Tabelle ist Zeile fuer Zeile dieselbe wie in
// shared/go/go-commission-core.js - abgeschrieben, weil die Landing nichts
// aus /shared/ importiert (der Grund steht in lead-landing-config.js). Damit
// die Fassungen nicht auseinanderlaufen, haelt
// tests/lead-landing-prices.test.mjs sie gegeneinander.
//
// Beitraege sind ganze Cent - wer Geld in Kommazahlen rechnet, zeigt
// irgendwann 1.4999999999999998 EUR.

/* --------------------------------------------------- Der einmalige Dienst */

// Was das Vorbereiten der kompletten Menue kostet. Einmalig, nicht monatlich -
// deshalb steht neben der Zahl ueberall "Vetëm një herë".
export const LEAD_LANDING_SERVICE_EUR = 150;

// Fotos je Produkt und die Zugabe, die der Wirt frei waehlt.
export const LEAD_LANDING_PHOTOS_PER_PRODUCT = 6;
export const LEAD_LANDING_EXTRA_PHOTOS = 10;

// QR-Aufsteller: zehn liegen im Dienst, jeder weitere kostet.
// Diese zehn oeffnen die Menue - sie bestellen noch nichts. Das Bestellen am
// Tisch ist eine eigene, kostenpflichtige Funktion (siehe unten).
export const LEAD_LANDING_QR_INCLUDED = 10;
export const LEAD_LANDING_QR_EXTRA_EUR = 5;

/* ------------------------------------------- Die optionalen Zusatzdienste */

// Mnyra Order: je tatsaechlich bestelltem Produkt. Zwei Cent.
// Dieselbe Zahl wie in lead-landing-2 - Order rechnet noch nicht ab, der
// Preis kommt aus der Produktentscheidung.
export const LEAD_LANDING_ORDER_CENTS_PER_ITEM = 2;

// Mnyra GO: Was eine bestaetigte Oferta kostet, in ganzen Cent, nach
// Personenzahl. Der Platz in der Liste ist die Personenzahl minus eins.
export const LEAD_LANDING_GO_COMMISSION_VERSION = "2026-08";
export const LEAD_LANDING_GO_COMMISSION_CENTS = Object.freeze([10, 50, 100, 150, 200, 250, 300, 350, 400, 450]);

// Fuer die Werbung gibt es heute keinen Preis im Code. Eine erfundene Zahl
// waere schlimmer als keine: Sie stuende neben Zahlen, die stimmen, und
// zoege sie mit herunter. Wer eine hat, traegt sie im Lead ein
// (landingSales.adsPrice) - bis dahin steht hier, was wahr ist.
export const LEAD_LANDING_ADS_PRICE_FALLBACK = "Sipas kërkesës";

// Was kostenlos bleibt, auch wenn nichts davon dazugebucht wird. Dieselbe
// Liste steht auf dem 0-EUR-Bildschirm - einmal hier, damit sie nicht an zwei
// Stellen auseinanderlaeuft.
export const LEAD_LANDING_FREE_FEATURES = Object.freeze([
  "Profili",
  "Feed & Story",
  "Kërko",
  "Harta",
  "Menuja",
  "Delivery link"
]);

// Ganze Cent -> "0,02 €". Komma, weil die Seite albanisch ist.
//
// Kein Wert ist kein Preis: null und "" ergeben nichts, nicht "0,00 €". Eine
// Null steht sonst dort, wo in Wahrheit noch gar nichts entschieden ist.
export function formatCents(cents, currency = "EUR") {
  if (cents === null || cents === undefined || cents === "") return "";
  const parsed = Number(cents);
  if (!Number.isFinite(parsed)) return "";
  const symbol = String(currency).toUpperCase() === "EUR" ? "€" : String(currency);
  const whole = Math.trunc(Math.abs(parsed) / 100);
  const rest = String(Math.abs(parsed) % 100).padStart(2, "0");
  return `${parsed < 0 ? "-" : ""}${whole},${rest} ${symbol}`;
}

// Ganze Euro -> "150 €". Ohne Nachkommastellen: Der Dienst kostet einen
// runden Betrag, und ",00" liest sich wie ein Tarif.
export function formatEuro(amount) {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return "";
  return `${Math.round(parsed)} €`;
}

// Der guenstigste GO-Beitrag - die Zahl, mit der ein Wirt anfaengt zu rechnen.
export function goStartingPrice() {
  return formatCents(LEAD_LANDING_GO_COMMISSION_CENTS[0]);
}

export function goTopPrice() {
  return formatCents(LEAD_LANDING_GO_COMMISSION_CENTS[LEAD_LANDING_GO_COMMISSION_CENTS.length - 1]);
}

export function orderPrice() {
  return formatCents(LEAD_LANDING_ORDER_CENTS_PER_ITEM);
}
