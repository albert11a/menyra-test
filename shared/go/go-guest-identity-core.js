// Mnyra GO - wer der Gast ist. Pur.
//
// Kurz und wichtig: Die IP-Adresse ist hier keine Identitaet (Spezifikation
// Punkt 32, 37). In Kosovo teilen sich hinter einem Mobilfunk-NAT tausende
// Menschen dieselbe oeffentliche Adresse. Eine Regel wie "eine IP, eine
// Reservierung" wuerde ganze Familien, Buerohaeuser und halbe Cafes vom
// Reservieren aussperren - und dabei nicht einen einzigen Missbrauch
// verhindern, den ein Flugmodus-Neustart nicht umgeht.
//
// Stattdessen: Jeder Browser bekommt beim ersten GO-Vorgang eine zufaellige,
// serverseitig erzeugte Gastkennung mit einem langen Geheimnis dazu. Der
// Server kennt vom Geheimnis nur den Hash. Wer den Token hat, ist der Gast -
// wer ihn nicht hat, ist ein neuer Gast. Mehr Identitaet braucht GO nicht.
//
// Was hier ausdruecklich NICHT passiert (Punkt 38): kein Fingerabdruck aus
// Bildschirmgroesse, Schriften, Canvas, GPU oder Sensoren. Niemand wird
// heimlich wiedererkannt.

export const GO_GUEST_TOKEN_VERSION = "g1";
export const GO_GUEST_TOKEN_SEPARATOR = ".";

// Der Name unter dem der Browser den Token ablegt. Der Server bleibt die
// Wahrheit - der Browser merkt sich nur die Zuordnung (Punkt 41).
export const GO_GUEST_TOKEN_STORAGE_KEY = "mnyra_go_guest_token_v1";
export const GO_GUEST_COOKIE_NAME = "mnyra_go_guest";

// Ab wann ein Gast mehr zeigen muss als seinen Token. Bis dahin: keine
// zusaetzliche Huerde fuer niemanden (Punkt 36).
export const GO_TRUST_LEVEL_NORMAL = "normal";
export const GO_TRUST_LEVEL_WATCH = "watch";
export const GO_TRUST_LEVEL_VERIFY = "verify";

function cleanPart(value = "", maxLength = 200) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function isSafeTokenPart(value = "") {
  // base64url plus Bindestrich: alles, was ein zufaelliger Token braucht,
  // und nichts, was einen Pfad oder eine Abfrage stoeren koennte.
  return /^[A-Za-z0-9_-]{8,200}$/.test(String(value || ""));
}

/**
 * Der Token, den der Gast bekommt: Version, Kennung, Geheimnis.
 *
 * Die Kennung steht im Klartext darin, damit der Server das richtige Dokument
 * findet, ohne die ganze Sammlung zu durchsuchen. Das Geheimnis daneben ist
 * der eigentliche Beweis.
 */
export function buildGoGuestToken({ guestId = "", secret = "" } = {}) {
  const id = cleanPart(guestId, 64);
  const key = cleanPart(secret, 200);
  if (!isSafeTokenPart(id) || !isSafeTokenPart(key)) return "";
  return [GO_GUEST_TOKEN_VERSION, id, key].join(GO_GUEST_TOKEN_SEPARATOR);
}

export function parseGoGuestToken(token = "") {
  const parts = cleanPart(token, 400).split(GO_GUEST_TOKEN_SEPARATOR);
  if (parts.length !== 3) return { valid: false, guestId: "", secret: "" };
  const [version, guestId, secret] = parts;
  if (version !== GO_GUEST_TOKEN_VERSION) return { valid: false, guestId: "", secret: "" };
  if (!isSafeTokenPart(guestId) || !isSafeTokenPart(secret)) return { valid: false, guestId: "", secret: "" };
  return { valid: true, guestId, secret };
}

/**
 * Dasselbe Muster fuer den geheimen Buchungslink (Punkt 39).
 *
 * Die Adresse einer Buchung ist nicht /go/booking/1234, sondern traegt einen
 * langen, nicht erratbaren Token. Fortlaufende Nummern gibt es in GO nirgends
 * nach aussen.
 */
export function buildGoBookingToken({ bookingId = "", secret = "" } = {}) {
  const id = cleanPart(bookingId, 64);
  const key = cleanPart(secret, 200);
  if (!isSafeTokenPart(id) || !isSafeTokenPart(key)) return "";
  return ["b1", id, key].join(GO_GUEST_TOKEN_SEPARATOR);
}

export function parseGoBookingToken(token = "") {
  const parts = cleanPart(token, 400).split(GO_GUEST_TOKEN_SEPARATOR);
  if (parts.length !== 3 || parts[0] !== "b1") return { valid: false, bookingId: "", secret: "" };
  const [, bookingId, secret] = parts;
  if (!isSafeTokenPart(bookingId) || !isSafeTokenPart(secret)) return { valid: false, bookingId: "", secret: "" };
  return { valid: true, bookingId, secret };
}

/**
 * Wieviel Vertrauen dieser Gast noch geniesst.
 *
 * Nicht als Sperre gedacht, sondern als Treppe (Punkt 36): Wer sich normal
 * verhaelt, merkt nie, dass es diese Funktion gibt. Wer in einer Stunde
 * zwanzig Reservierungen anlegt und wieder absagt, wird gebeten, sich kurz
 * anzumelden.
 *
 * Die Zahlen kommen aus der Zaehlung am Gastdokument - nicht aus einer IP.
 */
export function resolveGoGuestTrustLevel(stats = {}, { nowMs = Date.now() } = {}) {
  const source = stats && typeof stats === "object" ? stats : {};
  const num = (value) => Math.max(0, Math.trunc(Number(value) || 0));
  const bookings = num(source.bookingsLastHour);
  const cancels = num(source.cancelsLastDay);
  const searches = num(source.searchesLastHour);
  const openReservations = num(source.openReservations);

  if (source.blocked === true) return { level: GO_TRUST_LEVEL_VERIFY, reason: "blocked" };
  if (bookings >= 12 || searches >= 240) return { level: GO_TRUST_LEVEL_VERIFY, reason: "burst" };
  if (cancels >= 8) return { level: GO_TRUST_LEVEL_VERIFY, reason: "cancel_loop" };
  if (bookings >= 6 || cancels >= 4 || openReservations >= 3 || searches >= 90) {
    return { level: GO_TRUST_LEVEL_WATCH, reason: "elevated" };
  }
  // nowMs ist Teil der Signatur, damit spaetere Zeitfenster hier andocken
  // koennen, ohne dass Aufrufer sich aendern.
  return { level: GO_TRUST_LEVEL_NORMAL, reason: "", checkedAt: nowMs };
}

// Was ein Gast auf welcher Stufe noch darf. "verify" heisst nicht "gesperrt",
// sondern "bitte kurz anmelden".
export function goGuestActionAllowed(level = GO_TRUST_LEVEL_NORMAL, { isSignedIn = false } = {}) {
  const value = String(level || "").trim().toLowerCase();
  if (value === GO_TRUST_LEVEL_VERIFY && !isSignedIn) {
    return { allowed: false, requiresSignIn: true, message: "Për të vazhduar, hyr në llogarinë tënde." };
  }
  return { allowed: true, requiresSignIn: false, message: "" };
}

/**
 * Der Zaehlstand nach einem Ereignis. Reine Rechnung, damit der Server nur
 * schreiben muss, was hier herauskommt.
 */
export function applyGoGuestActivity(stats = {}, { kind = "", nowMs = Date.now() } = {}) {
  const source = stats && typeof stats === "object" ? { ...stats } : {};
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;
  const num = (value) => Math.max(0, Math.trunc(Number(value) || 0));
  const hourStart = Number(source.hourStartedAt) || 0;
  const dayStart = Number(source.dayStartedAt) || 0;

  // Rollende Fenster ohne Hintergrundarbeit: Ist das Fenster abgelaufen,
  // faengt der Zaehler beim Schreiben von vorne an.
  const inHour = hourStart && nowMs - hourStart < hourMs;
  const inDay = dayStart && nowMs - dayStart < dayMs;
  const next = {
    hourStartedAt: inHour ? hourStart : nowMs,
    dayStartedAt: inDay ? dayStart : nowMs,
    bookingsLastHour: inHour ? num(source.bookingsLastHour) : 0,
    searchesLastHour: inHour ? num(source.searchesLastHour) : 0,
    cancelsLastDay: inDay ? num(source.cancelsLastDay) : 0,
    openReservations: num(source.openReservations),
    blocked: source.blocked === true
  };
  if (kind === "search") next.searchesLastHour += 1;
  if (kind === "booking") next.bookingsLastHour += 1;
  if (kind === "reservation") {
    next.bookingsLastHour += 1;
    next.openReservations += 1;
  }
  if (kind === "cancel") {
    next.cancelsLastDay += 1;
    next.openReservations = Math.max(0, next.openReservations - 1);
  }
  if (kind === "closed") next.openReservations = Math.max(0, next.openReservations - 1);
  return next;
}
