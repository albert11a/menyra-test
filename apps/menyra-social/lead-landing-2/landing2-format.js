// Reine Formatierungs-Helfer fuer Landing 2.
//
// Abhaengigkeitsfrei. Landing 2 laeuft isoliert: kein Import aus core/, kein
// Import aus /shared/, kein Import aus der Lead-Landing, kein gemeinsamer
// State. Dadurch kann die Seite das echte Profil nicht beeinflussen.

export function esc(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function text(value = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function firstText(...values) {
  for (const value of values) {
    const next = text(value);
    if (next) return next;
  }
  return "";
}

export function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// Preis wie im echten Speisen-Modal: "2.90 EUR".
export function formatPrice(value, currency = "EUR") {
  const parsed = num(value);
  if (parsed === null) return "";
  const safeCurrency = text(currency).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "EUR";
  return `${parsed.toFixed(2)} ${safeCurrency}`;
}

export function formatCount(value) {
  const parsed = num(value);
  if (parsed === null || parsed < 0) return "0";
  if (parsed < 1000) return String(Math.round(parsed));
  if (parsed < 1000000) {
    const k = parsed / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  const m = parsed / 1000000;
  return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}M`;
}

// Ganze Cent -> lesbarer Betrag. Mnyra rechnet Geld ueberall in ganzen Cent
// (shared/go/go-commission-core.js), und diese Seite zeigt echte Preise -
// also wird hier genauso gerechnet und erst am Ende gerundet.
export function formatCents(cents, currency = "EUR") {
  // null und undefined sind kein Preis. Ohne diese Zeile waeren sie 0,00 € -
  // und "kostet nichts" ist etwas anderes als "wir wissen es nicht".
  if (cents === null || cents === undefined || cents === "") return "";
  const parsed = num(cents);
  if (parsed === null) return "";
  const symbol = String(currency).toUpperCase() === "EUR" ? "€" : String(currency);
  return `${(Math.round(parsed) / 100).toFixed(2).replace(".", ",")} ${symbol}`;
}

// Der erste Buchstabe eines Namens - fuer den Platzhalter, wenn ein Lokal
// (noch) kein Logo hat.
export function initial(value = "") {
  const name = text(value);
  return name ? name.slice(0, 1).toUpperCase() : "M";
}
