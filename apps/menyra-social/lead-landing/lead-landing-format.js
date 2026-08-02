// Reine Formatierungs-Helfer fuer die Lead-Landing.
//
// Diese Datei ist bewusst abhaengigkeitsfrei. Die gesamte Lead-Landing laeuft
// isoliert von der Social-App: kein Import aus core/, kein gemeinsamer State.
// Dadurch kann die Landing das echte Profil nicht beeinflussen.

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

export function isHexColor(value = "") {
  return /^#[0-9a-fA-F]{6}$/.test(text(value));
}

export function color(value = "", fallback = "#111827") {
  return isHexColor(value) ? text(value) : fallback;
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

// Der Name wird zweifarbig gesetzt: letztes Wort in Akzentfarbe, mit Punkt.
export function splitBrandName(value = "Business") {
  const name = text(value) || "Business";
  const base = name.replace(/\.+$/g, "").trim() || name;
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { part1: `${base}.`, part2: "" };
  return {
    part1: parts.slice(0, -1).join(" "),
    part2: `${parts[parts.length - 1]}.`
  };
}

export function socialUrl(kind = "", value = "") {
  const raw = text(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/, "").trim();
  if (!handle) return "";
  if (kind === "instagram") return `https://instagram.com/${encodeURIComponent(handle)}`;
  if (kind === "tiktok") return `https://tiktok.com/@${encodeURIComponent(handle)}`;
  if (kind === "facebook") return `https://facebook.com/${encodeURIComponent(handle)}`;
  return "";
}

export function mapsUrl({ lat, lng, address = "" } = {}) {
  const safeLat = num(lat);
  const safeLng = num(lng);
  if (safeLat !== null && safeLng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${safeLat},${safeLng}`;
  }
  const safeAddress = text(address);
  if (!safeAddress) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeAddress)}`;
}

// Telefonnummer -> wa.me. Nur Ziffern, fuehrende Nullen/Plus entfernt.
export function whatsappUrl(phone = "", message = "") {
  const digits = text(phone).replace(/[^\d]/g, "").replace(/^0+/, "");
  if (digits.length < 6) return "";
  const suffix = text(message) ? `?text=${encodeURIComponent(text(message))}` : "";
  return `https://wa.me/${digits}${suffix}`;
}
