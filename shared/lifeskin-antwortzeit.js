// WANN DR. GASHI ANTWORTET - eingestellt in Heart (Uhr-Knopf im Kopf,
// 29.09., Wunsch Inhaber), gezeigt auf der Nummer-Seite (/lifeskin und
// /lifeskinshop) und auf der Warteseite. An beiden Stellen dieselbe Zeile:
// "Përgjigja brenda 20 minutave", "Përgjigja sot", ...
//
// WO ES STEHT: lifeskin/{tenant}/config/antwortzeit { wahl, gesetztAm }.
// config ist oeffentlich lesbar und nur vom CEO-Konto schreibbar
// (firestore.rules, match /config/{documentId}) - es braucht keine neue
// Regel.
//
// OHNE WAHL (nie gesetzt, "Auto" oder abgelaufen) gilt, was die Warteseite
// schon immer sagte: vor 18 Uhr "sot", danach "nesër në mëngjes".
//
// "Heute", "Heute Abend", "Morgen früh" und "Morgen" gelten nur an dem Tag,
// an dem sie gesetzt wurden (Uhrzeit Kosovo): Am naechsten Tag waere
// "nesër" eine falsche Zusage. Minuten und Stunde gelten, bis Heart sie
// aendert.
//
// Ohne Abhaengigkeit von einer App: Trichter, Warteseite und Heart benutzen
// dieselbe Liste.

export const ANTWORTZEIT_DOK = "antwortzeit";
export const ANTWORTZEIT_ZONE = "Europe/Belgrade";

// label: der Chip in Heart. sq/de: was nach "Përgjigja" / "Antwort" steht.
// tag: gilt nur am Tag, an dem es gesetzt wurde.
export const ANTWORTZEITEN = Object.freeze([
  { id: "auto", label: "Auto" },
  { id: "10min", label: "10 Min", sq: "brenda 10 minutave", de: "in 10 Minuten" },
  { id: "20min", label: "20 Min", sq: "brenda 20 minutave", de: "in 20 Minuten" },
  { id: "30min", label: "30 Min", sq: "brenda 30 minutave", de: "in 30 Minuten" },
  { id: "1h", label: "1 Std", sq: "brenda një ore", de: "in einer Stunde" },
  { id: "heute", label: "Heute", sq: "sot", de: "heute", tag: true },
  { id: "abend", label: "Heute Abend", sq: "sot në mbrëmje", de: "heute Abend", tag: true },
  { id: "morgenfrueh", label: "Morgen früh", sq: "nesër në mëngjes", de: "morgen früh", tag: true },
  { id: "morgen", label: "Morgen", sq: "nesër", de: "morgen", tag: true }
].map((z) => Object.freeze(z)));

const SATZ = Object.freeze({ sq: "Përgjigja", de: "Antwort" });

export function antwortzeitGueltig(id) {
  return ANTWORTZEITEN.some((z) => z.id === id);
}

// Der Kalendertag in Kosovo ("2026-09-29"), egal, wie das Geraet steht.
export function tagIn(zeit, zone = ANTWORTZEIT_ZONE) {
  const datum = zeit instanceof Date ? zeit : new Date(zeit);
  if (!Number.isFinite(datum.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(datum);
  } catch {
    return datum.toISOString().slice(0, 10);
  }
}

// Was gerade gilt: die Kennung einer Antwortzeit. Ohne (gueltige) Wahl
// die alte Regel - vor 18 Uhr "heute", danach "morgen frueh".
export function antwortzeitJetzt(einstellung, { jetzt = new Date() } = {}) {
  const wahl = String(einstellung?.wahl || "");
  const eintrag = ANTWORTZEITEN.find((z) => z.id === wahl);
  const abgelaufen = eintrag?.tag === true && tagIn(einstellung?.gesetztAm) !== tagIn(jetzt);
  if (eintrag && eintrag.id !== "auto" && !abgelaufen) return eintrag.id;
  return jetzt.getHours() < 18 ? "heute" : "morgenfrueh";
}

// Was Heart als gewaehlt zeigt: die gespeicherte Wahl, solange sie gilt -
// sonst "auto" (nie gesetzt oder ein Tag, der vorbei ist).
export function antwortzeitWahl(einstellung, { jetzt = new Date() } = {}) {
  const wahl = String(einstellung?.wahl || "");
  const eintrag = ANTWORTZEITEN.find((z) => z.id === wahl);
  if (!eintrag) return "auto";
  if (eintrag.tag === true && tagIn(einstellung?.gesetztAm) !== tagIn(jetzt)) return "auto";
  return eintrag.id;
}

// Die Zeile: "Përgjigja brenda 20 minutave".
export function antwortzeitSatz(einstellung, { jetzt = new Date(), sprache = "sq" } = {}) {
  const eintrag = ANTWORTZEITEN.find((z) => z.id === antwortzeitJetzt(einstellung, { jetzt }));
  const lang = sprache === "de" ? "de" : "sq";
  return `${SATZ[lang]} ${eintrag[lang]}`;
}

// Aus dem Firestore-Dokument (REST): { wahl, gesetztAm } oder null.
export function antwortzeitAusDokument(dok) {
  const f = dok?.fields;
  const wahl = f?.wahl?.stringValue;
  if (!antwortzeitGueltig(wahl)) return null;
  return { wahl, gesetztAm: String(f?.gesetztAm?.stringValue || f?.gesetztAm?.timestampValue || "") };
}

// Holt die Einstellung - hoechstens `frist` Millisekunden lang. Kommt
// nichts (kein Dokument, kein Netz, zu langsam), gilt die alte Regel.
export async function antwortzeitLaden({ basis, tenant = "lifeskin", fetchFn = globalThis.fetch?.bind(globalThis), frist = 4000 } = {}) {
  if (!basis || typeof fetchFn !== "function") return null;
  const adresse = `${basis}/lifeskin/${tenant}/config/${ANTWORTZEIT_DOK}`;
  let uhr = null;
  const zeitAus = new Promise((fertig) => { uhr = setTimeout(() => fertig(null), frist); });
  const holen = (async () => {
    try {
      const antwort = await fetchFn(adresse);
      if (!antwort?.ok) return null;
      return antwortzeitAusDokument(await antwort.json());
    } catch {
      return null;
    }
  })();
  try {
    return await Promise.race([holen, zeitAus]);
  } finally {
    clearTimeout(uhr);
  }
}
