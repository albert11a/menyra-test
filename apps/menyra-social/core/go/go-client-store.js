// Mnyra GO - was der Browser sich merkt.
//
// Wenig, und nichts davon ist eine Entscheidung: der Gast-Token, damit der
// Server denselben Gast wiedererkennt, und ein kleiner Abzug der aktiven
// Buchungen, damit die Karte im Qyteti sofort etwas zeigen kann, ohne dafuer
// eine Anfrage zu stellen (Spezifikation Punkt 6, 43).
//
// Die Wahrheit bleibt der Server (Punkt 41). Was hier liegt, ist eine
// Erinnerung: Beim Oeffnen einer Buchung wird sie am Server nachgeschlagen -
// steht dort etwas anderes, gilt der Server.
//
// Dieses Modul ist absichtlich klein und ohne Abhaengigkeiten: Es wird beim
// normalen Laden von Qyteti mitgeladen, alles Schwere kommt erst beim Tippen.

const GUEST_TOKEN_KEY = "mnyra_go_guest_token_v1";
const ACTIVE_BOOKINGS_KEY = "mnyra_go_active_bookings_v1";
const MAX_REMEMBERED_BOOKINGS = 8;

function readStorage(storageObj) {
  if (storageObj) return storageObj;
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    // Safari im privaten Modus wirft beim blossen Zugriff. GO laeuft dann
    // ohne Gedaechtnis weiter - der Gast bekommt eine neue Kennung, und die
    // Buchung findet er ueber seinen Link.
    return null;
  }
}

function readJson(storage, key, fallback) {
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function writeJson(storage, key, value) {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readGoGuestToken(storageObj = null) {
  const storage = readStorage(storageObj);
  if (!storage) return "";
  try {
    return String(storage.getItem(GUEST_TOKEN_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function writeGoGuestToken(token = "", storageObj = null) {
  const storage = readStorage(storageObj);
  const value = String(token || "").trim();
  if (!storage || !value) return false;
  try {
    storage.setItem(GUEST_TOKEN_KEY, value);
    return true;
  } catch {
    return false;
  }
}

function normalizeEntry(entry = {}) {
  const source = entry && typeof entry === "object" ? entry : {};
  return {
    bookingId: String(source.bookingId || source.id || "").trim(),
    // Der geheime Link zur Buchung. Er ist der Grund, warum ein Gast ohne
    // Konto seine Buchung morgen wiederfindet.
    bookingToken: String(source.bookingToken || "").trim(),
    shortCode: String(source.shortCode || "").trim().toUpperCase(),
    restaurantId: String(source.restaurantId || "").trim(),
    businessName: String(source.businessName || "").trim(),
    benefitLabel: String(source.benefitLabel || "").trim(),
    type: source.type === "reservation" ? "reservation" : "claim",
    status: String(source.status || "confirmed").trim(),
    partySize: Math.max(1, Math.trunc(Number(source.partySize) || 1)),
    expectedArrivalAt: String(source.expectedArrivalAt || "").trim(),
    savedAt: Number(source.savedAt) || Date.now()
  };
}

export function readGoActiveBookings(storageObj = null) {
  const storage = readStorage(storageObj);
  const list = readJson(storage, ACTIVE_BOOKINGS_KEY, []);
  return (Array.isArray(list) ? list : [])
    .map(normalizeEntry)
    .filter((entry) => entry.bookingId && entry.bookingToken);
}

export function rememberGoBooking(entry = {}, storageObj = null) {
  const storage = readStorage(storageObj);
  const next = normalizeEntry(entry);
  if (!next.bookingId || !next.bookingToken) return readGoActiveBookings(storage);
  const current = readGoActiveBookings(storage).filter((item) => item.bookingId !== next.bookingId);
  const merged = [next, ...current].slice(0, MAX_REMEMBERED_BOOKINGS);
  writeJson(storage, ACTIVE_BOOKINGS_KEY, merged);
  return merged;
}

// Eine Buchung, die nicht mehr offen ist, verschwindet aus der Erinnerung -
// die Karte im Qyteti soll keine abgesagte Reservierung anzeigen.
export function forgetGoBooking(bookingId = "", storageObj = null) {
  const storage = readStorage(storageObj);
  const id = String(bookingId || "").trim();
  const next = readGoActiveBookings(storage).filter((entry) => entry.bookingId !== id);
  writeJson(storage, ACTIVE_BOOKINGS_KEY, next);
  return next;
}

const OPEN_STATUSES = ["confirmed", "checked_in"];

export function syncGoBookingStatus(booking = {}, storageObj = null) {
  const id = String(booking?.id || booking?.bookingId || "").trim();
  if (!id) return readGoActiveBookings(storageObj);
  const status = String(booking?.status || "").trim();
  if (!OPEN_STATUSES.includes(status)) return forgetGoBooking(id, storageObj);
  const current = readGoActiveBookings(storageObj).find((entry) => entry.bookingId === id);
  if (!current) return readGoActiveBookings(storageObj);
  return rememberGoBooking({ ...current, ...booking, bookingId: id, bookingToken: current.bookingToken }, storageObj);
}

/**
 * Der Schluessel gegen Doppelbuchungen (Punkt 99).
 *
 * Er entsteht einmal pro Absicht - nicht pro Tipp. Tippt der Gast im schwachen
 * Netz ein zweites Mal auf denselben Knopf, geht derselbe Schluessel hinaus,
 * und der Server gibt dieselbe Buchung zurueck statt einer zweiten.
 */
export function createGoIdempotencyKey(cryptoObj = null) {
  const source = cryptoObj || (typeof crypto === "undefined" ? null : crypto);
  const random = source?.randomUUID?.();
  if (random) return String(random).replace(/-/g, "").slice(0, 24);
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
