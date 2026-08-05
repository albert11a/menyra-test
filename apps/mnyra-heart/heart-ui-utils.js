const STATUS_LABELS = {
  idle: "Bereit",
  queued: "Wartet",
  running: "Laeuft",
  open: "Offen",
  resolved: "Geloest",
  success: "Erfolgreich",
  warning: "Hinweis",
  skipped: "Uebersprungen",
  not_configured: "Einrichtung fehlt",
  guarded: "Geschuetzt",
  failed: "Fehlgeschlagen",
  critical: "Kritisch",
  cancelled: "Abgebrochen",
  unknown: "Unbekannt"
};

const STATUS_TONES = {
  idle: "neutral",
  queued: "info",
  running: "info",
  open: "warning",
  resolved: "success",
  success: "success",
  warning: "warning",
  skipped: "neutral",
  not_configured: "neutral",
  guarded: "warning",
  failed: "danger",
  critical: "danger",
  cancelled: "neutral",
  unknown: "neutral"
};

export function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function formatRelative(value) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";
  const diffMs = date.getTime() - Date.now();
  const absSeconds = Math.round(Math.abs(diffMs) / 1000);
  const rtf = new Intl.RelativeTimeFormat("de-AT", { numeric: "auto" });
  if (absSeconds < 60) return rtf.format(Math.round(diffMs / 1000), "second");
  if (absSeconds < 3600) return rtf.format(Math.round(diffMs / 60000), "minute");
  if (absSeconds < 86400) return rtf.format(Math.round(diffMs / 3600000), "hour");
  return rtf.format(Math.round(diffMs / 86400000), "day");
}

export function renderBadge(label = "", tone = "neutral", extraClass = "") {
  return `<span class="heart-badge heart-badge--${escapeHtml(tone)} ${escapeHtml(extraClass)}">${escapeHtml(label)}</span>`;
}

export function renderStatusBadge(status = "", extraClass = "") {
  const key = String(status || "").trim().toLowerCase() || "unknown";
  return renderBadge(
    STATUS_LABELS[key] || STATUS_LABELS.unknown,
    STATUS_TONES[key] || STATUS_TONES.unknown,
    extraClass
  );
}

export function renderEmptyState({
  title = "Noch nichts vorhanden.",
  message = "",
  actionLabel = "",
  action = ""
} = {}) {
  return `
    <section class="heart-empty-state">
      <div class="heart-empty-state__icon">+</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      ${actionLabel && action ? `<button class="heart-button heart-button--secondary" data-action="${escapeHtml(action)}">${escapeHtml(actionLabel)}</button>` : ""}
    </section>
  `;
}
