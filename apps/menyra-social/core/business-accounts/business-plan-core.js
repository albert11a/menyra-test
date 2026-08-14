// Die Plaene eines Business-Kontos - eine Stelle, die weiss, was ein Konto
// darf und was nicht.
//
// Es gibt genau zwei:
//   free      - Postime (Beitrag, Story, Profil) und Oferta.
//   standart  - dazu die Menyja und der QR-Code.
//
// Der Plan wird im CRM am Lead gesetzt und von dort in das Restaurant-Dokument
// geschrieben. Das eingeloggte Business liest ihn aus seinen eigenen
// Restaurant-Daten - derselbe Weg, den auch Name, Logo und Titelbild nehmen.
//
// Im Zweifel gilt "free": ein Konto ohne Eintrag ist kein zahlendes Konto.
// Das ist die sichere Richtung - ein falsches "free" kostet einen Anruf, ein
// falsches "standart" verschenkt die Leistung.

export const BUSINESS_PLAN_FREE = "free";
export const BUSINESS_PLAN_STANDARD = "standart";

export const BUSINESS_PLANS = Object.freeze([BUSINESS_PLAN_FREE, BUSINESS_PLAN_STANDARD]);

export const BUSINESS_PLAN_LABELS = Object.freeze({
  [BUSINESS_PLAN_FREE]: "Free",
  [BUSINESS_PLAN_STANDARD]: "Standart"
});

// Schreibweisen, die "standart" meinen. Die zweite Haelfte stand vor dem
// Plan-Feld schon in einzelnen Datensaetzen - sie zaehlt weiter, damit ein
// altes Konto durch die Umstellung nichts verliert.
const STANDARD_ALIASES = Object.freeze([
  "standart", "standard", "std",
  "pro", "premium", "plus", "business", "paid", "active"
]);

// Was welcher Plan darf. Jede Frage nach einer Berechtigung geht hier durch -
// kommt ein dritter Plan dazu, ist das die einzige Stelle, die ihn kennt.
export const BUSINESS_PLAN_FEATURES = Object.freeze({
  posts: Object.freeze([BUSINESS_PLAN_FREE, BUSINESS_PLAN_STANDARD]),
  offers: Object.freeze([BUSINESS_PLAN_FREE, BUSINESS_PLAN_STANDARD]),
  menu: Object.freeze([BUSINESS_PLAN_STANDARD]),
  qr: Object.freeze([BUSINESS_PLAN_STANDARD])
});

export function normalizeBusinessPlanCore(value = "") {
  if (value === true) return BUSINESS_PLAN_STANDARD;
  const key = String(value ?? "").trim().toLowerCase();
  if (!key) return BUSINESS_PLAN_FREE;
  return STANDARD_ALIASES.includes(key) ? BUSINESS_PLAN_STANDARD : BUSINESS_PLAN_FREE;
}

// Der Plan eines Kontos. Das Restaurant-Dokument entscheidet, das Profil ist
// nur der Rueckfall - so gilt immer das, was im CRM gesetzt wurde, auch wenn
// im Profil noch ein alter Wert steht.
export function resolveBusinessPlanCore({ profile = {}, restaurant = {} } = {}) {
  const sources = [restaurant || {}, profile || {}];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    // Ein ausdruecklich gesetztes Feld gewinnt, auch wenn es "free" sagt.
    const raw = source.plan
      ?? source.subscriptionPlan
      ?? source.planKey
      ?? source.subscriptionStatus;
    if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
      return normalizeBusinessPlanCore(raw);
    }
    if (source.subscriptionActive === true || source.isSubscriber === true || source.hasSubscription === true) {
      return BUSINESS_PLAN_STANDARD;
    }
  }
  return BUSINESS_PLAN_FREE;
}

export function planAllowsCore(plan = "", feature = "") {
  const allowed = BUSINESS_PLAN_FEATURES[String(feature || "").trim()];
  if (!allowed) return true; // Was kein Plan-Thema ist, sperrt auch keiner.
  return allowed.includes(normalizeBusinessPlanCore(plan));
}

// Kurzform fuer die Aufrufer, die nur "darf dieses Konto X?" fragen.
export function businessCanUseCore({ profile = {}, restaurant = {}, feature = "" } = {}) {
  return planAllowsCore(resolveBusinessPlanCore({ profile, restaurant }), feature);
}
