// Was auf der Startseite steht, ohne HTML und ohne Firestore: der Spruch oben
// und die Liste "Was gibt es Neues". Beides sind reine Rechnungen aus dem, was
// ohnehin schon geladen ist - deshalb stehen sie hier und nicht im Renderer,
// und deshalb lassen sie sich einzeln pruefen.

const HOUR_MS = 3600000;
const DAY_MS = 86400000;

// Kurz, und jeder Spruch kommt ohne Ausrufezeichen aus. Der Name steht als
// {name} darin, damit die Anrede nicht in jeder Zeile wiederholt werden muss.
const MOTIVATIONS = Object.freeze([
  "{name}, heute wird gebaut, nicht gewartet.",
  "Ein Schritt reicht, {name}. Dann der naechste.",
  "{name}, wer die Zahlen kennt, muss nicht raten.",
  "Ruhig bleiben und liefern, {name}.",
  "{name}, kleine Schritte, jeden Tag, das schlaegt jeden Sprint.",
  "Was heute fertig wird, fehlt morgen nicht, {name}.",
  "{name}, die Arbeit von heute ist der Vorsprung von naechster Woche.",
  "Erst zuhoeren, dann bauen, {name}.",
  "{name}, ein gutes Lokal mehr ist ein guter Tag.",
  "Nicht schneller, {name}, sondern klarer.",
  "{name}, der lange Weg ist der kurze Weg.",
  "Jeder Lead ist ein Mensch, {name}.",
  "{name}, heute etwas fertig machen, das gestern nur ein Plan war.",
  "Sauber gebaut haelt laenger, {name}.",
  "{name}, du musst nicht alles heute schaffen, nur etwas.",
  "Vertrauen kommt von Verlaesslichkeit, {name}.",
  "{name}, gute Arbeit spricht spaeter fuer dich.",
  "Zweifel sind kein Grund zu stehen, {name}.",
  "{name}, das Ziel bleibt, der Weg darf sich aendern.",
  "Weitermachen ist die ganze Kunst, {name}.",
  "{name}, heute ein Lokal besser als gestern.",
  "Erst richtig, {name}, dann schnell.",
  "{name}, das Beste an heute ist, dass es noch offen ist.",
  "Wer zaehlt, sieht mehr, {name}."
]);

export function toMillisCore(value) {
  if (!value) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : 0;
  }
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object") {
    // Firestore-Zeitstempel, egal ob roh oder schon halb umgewandelt.
    const seconds = Number(value.seconds ?? value._seconds);
    if (Number.isFinite(seconds)) return seconds * 1000;
    if (typeof value.toDate === "function") {
      try {
        return toMillisCore(value.toDate());
      } catch {
        return 0;
      }
    }
  }
  return 0;
}

// Der Vorname reicht fuer die Anrede. Steht kein Name da, wird der Teil vor
// dem @ genommen - besser als "CEO", und besser als gar nichts.
export function getHeartDisplayNameCore(profile = null, user = null) {
  const candidates = [
    profile?.name,
    profile?.displayName,
    profile?.fullName,
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" "),
    user?.displayName,
    profile?.handle
  ];
  const found = candidates.map((value) => String(value || "").trim()).find(Boolean);
  if (found) return found;
  const email = String(user?.email || profile?.email || "").trim();
  if (!email) return "";
  const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  if (!local) return "";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function getHeartFirstNameCore(profile = null, user = null) {
  const full = getHeartDisplayNameCore(profile, user);
  return full ? full.split(/\s+/)[0] : "";
}

// Jede Stunde ein anderer Spruch, und zwar fuer alle dieselbe Reihenfolge:
// Der Index kommt aus der Stunde seit der Epoche, nicht aus dem Zufall. Sonst
// wechselte der Text bei jedem Neuzeichnen, und die Seite waere nie ruhig.
export function pickHeartMotivationCore({ name = "", now = Date.now() } = {}) {
  const hourIndex = Math.floor(toMillisCore(now) / HOUR_MS);
  const template = MOTIVATIONS[((hourIndex % MOTIVATIONS.length) + MOTIVATIONS.length) % MOTIVATIONS.length];
  const safeName = String(name || "").trim();
  if (safeName) {
    return { hourIndex, text: template.replace(/\{name\}/g, safeName) };
  }
  // Ohne Namen faellt die Anrede weg. Der Satz muss danach trotzdem gross
  // anfangen und darf kein Komma in der Luft haengen lassen.
  const stripped = template
    .replace(/^\{name\}, */, "")
    .replace(/, *\{name\}/g, "")
    .replace(/\{name\}/g, "")
    .trim();
  return {
    hourIndex,
    text: stripped ? stripped.charAt(0).toUpperCase() + stripped.slice(1) : ""
  };
}

// Wie lange es noch dauert, bis die naechste Stunde beginnt. Danach wird der
// Spruch einmal ausgetauscht - kein Timer im Sekundentakt.
export function nextHourDelayMsCore(now = Date.now()) {
  const time = toMillisCore(now) || Date.now();
  return Math.max(1000, HOUR_MS - (time % HOUR_MS));
}

function dayKeyOf(millis) {
  return Math.floor(millis / DAY_MS);
}

// Sitzungen einer Landing werden je Lokal und Tag zusammengefasst. Einzeln
// waeren es hunderte Zeilen, die alle dasselbe sagen; zusammengefasst steht da,
// was man wissen will: welches Lokal, wie viele Aufrufe, wie viele Antworten.
function buildLandingEntries(sessions = [], skipRestaurantIds = new Set()) {
  const groups = new Map();
  sessions.forEach((session) => {
    const restaurantId = String(session?.restaurantId || "").trim();
    if (!restaurantId || skipRestaurantIds.has(restaurantId)) return;
    const at = Math.max(toMillisCore(session?.updatedAt), toMillisCore(session?.startedAt));
    if (!at) return;
    const key = `${restaurantId}::${dayKeyOf(at)}`;
    const group = groups.get(key) || {
      restaurantId,
      name: String(session?.name || "").trim() || restaurantId,
      city: String(session?.city || "").trim(),
      views: 0,
      answered: 0,
      yes: 0,
      at: 0
    };
    group.views += 1;
    if (String(session?.answers?.q1 || "").trim()) group.answered += 1;
    if (String(session?.outcome || "").trim() === "yes") group.yes += 1;
    if (at > group.at) group.at = at;
    groups.set(key, group);
  });

  return Array.from(groups.values()).map((group) => {
    const parts = [`${group.views} ${group.views === 1 ? "Aufruf" : "Aufrufe"}`];
    if (group.answered) parts.push(`${group.answered} ${group.answered === 1 ? "Antwort" : "Antworten"}`);
    if (group.yes) parts.push(`${group.yes} mal Ja`);
    return {
      id: `landing:${group.restaurantId}:${dayKeyOf(group.at)}`,
      kind: "landing",
      title: group.name,
      note: group.city,
      detail: parts.join(" · "),
      at: group.at,
      viewKey: "landing",
      landingId: group.restaurantId,
      highlight: group.yes > 0
    };
  });
}

function buildCrmEntries(rows = [], { kind, label, viewKey }) {
  return rows.map((row) => {
    const at = Math.max(toMillisCore(row?.createdAt), toMillisCore(row?.updatedAt));
    if (!at) return null;
    const title = String(row?.businessName || row?.restaurantName || row?.name || "").trim();
    if (!title) return null;
    return {
      id: `${kind}:${String(row?.id || title)}`,
      kind,
      title,
      note: String(row?.city || "").trim(),
      detail: label,
      at,
      viewKey,
      highlight: false
    };
  }).filter(Boolean);
}

// Alles, was seit einer Weile passiert ist, in einer Liste, das Neueste oben.
// Die Quellen sind schon geladen (Landing-Sitzungen, Leads, Kunden) - hier wird
// nichts nachgeholt, damit die Startseite nichts kostet.
export function buildHeartNewsFeedCore({
  landingSessions = [],
  archivedLandingIds = [],
  leads = [],
  customers = [],
  now = Date.now(),
  windowDays = 30,
  limit = 12
} = {}) {
  const nowMs = toMillisCore(now) || Date.now();
  const oldest = nowMs - Math.max(1, Number(windowDays) || 30) * DAY_MS;
  const skip = new Set((archivedLandingIds || []).map((id) => String(id || "").trim()).filter(Boolean));

  return [
    ...buildLandingEntries(landingSessions, skip),
    ...buildCrmEntries(leads, { kind: "lead", label: "Neuer Lead", viewKey: "crmLeads" }),
    ...buildCrmEntries(customers, { kind: "customer", label: "Neuer Kunde", viewKey: "crmCustomers" })
  ]
    .filter((entry) => entry.at >= oldest && entry.at <= nowMs + HOUR_MS)
    .sort((a, b) => b.at - a.at || String(a.title).localeCompare(String(b.title), "de"))
    .slice(0, Math.max(1, Number(limit) || 12));
}

// Kurze Zeitangabe fuer die Liste. Intl.RelativeTimeFormat sagt "vor 19
// Stunden", wo "heute" gemeint ist - in einer Liste von Ereignissen liest sich
// der Tag besser als die Stundenzahl.
export function formatHeartNewsTimeCore(at = 0, now = Date.now()) {
  const atMs = toMillisCore(at);
  const nowMs = toMillisCore(now) || Date.now();
  if (!atMs) return "";
  const diff = nowMs - atMs;
  if (diff < 60000) return "gerade";
  if (diff < HOUR_MS) {
    const minutes = Math.max(1, Math.round(diff / 60000));
    return `vor ${minutes} Min`;
  }
  const days = dayKeyOf(nowMs) - dayKeyOf(atMs);
  if (days <= 0) {
    const hours = Math.max(1, Math.round(diff / HOUR_MS));
    return `vor ${hours} Std`;
  }
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  return new Date(atMs).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" });
}
