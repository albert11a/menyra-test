const STATUS_LABELS = {
  idle: "Idle",
  queued: "Queued",
  running: "Running",
  success: "Success",
  warning: "Warning",
  skipped: "Skipped",
  not_configured: "Needs setup",
  guarded: "Guarded",
  failed: "Failed",
  critical: "Critical",
  cancelled: "Cancelled",
  unknown: "Unknown"
};

const STATUS_TONES = {
  idle: "neutral",
  queued: "info",
  running: "info",
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

const SEVERITY_TONES = {
  info: "info",
  warning: "warning",
  critical: "danger"
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
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absSeconds < 60) return rtf.format(Math.round(diffMs / 1000), "second");
  if (absSeconds < 3600) return rtf.format(Math.round(diffMs / 60000), "minute");
  if (absSeconds < 86400) return rtf.format(Math.round(diffMs / 3600000), "hour");
  return rtf.format(Math.round(diffMs / 86400000), "day");
}

export function formatDuration(durationMs = 0) {
  const total = Math.max(0, Number(durationMs) || 0);
  const seconds = Math.round(total / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainMinutes = minutes % 60;
    return `${hours}h ${remainMinutes}m`;
  }
  if (minutes > 0) return `${minutes}m ${remainSeconds}s`;
  return `${remainSeconds}s`;
}

export function getStatusLabel(status = "") {
  const key = String(status || "").trim().toLowerCase() || "unknown";
  return STATUS_LABELS[key] || STATUS_LABELS.unknown;
}

export function getStatusTone(status = "") {
  const key = String(status || "").trim().toLowerCase() || "unknown";
  return STATUS_TONES[key] || STATUS_TONES.unknown;
}

export function getSeverityTone(severity = "") {
  const key = String(severity || "").trim().toLowerCase() || "info";
  return SEVERITY_TONES[key] || "neutral";
}

export function renderBadge(label = "", tone = "neutral", extraClass = "") {
  return `<span class="heart-badge heart-badge--${escapeHtml(tone)} ${escapeHtml(extraClass)}">${escapeHtml(label)}</span>`;
}

export function renderStatusBadge(status = "", extraClass = "") {
  return renderBadge(getStatusLabel(status), getStatusTone(status), extraClass);
}

export function renderSeverityBadge(severity = "", extraClass = "") {
  const value = String(severity || "").trim() || "info";
  return renderBadge(value.toUpperCase(), getSeverityTone(value), extraClass);
}

export function renderEmptyState({
  title = "Nothing here yet.",
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

export function renderStatValue(value = "", detail = "") {
  return `
    <div class="heart-stat-value">
      <strong>${escapeHtml(value)}</strong>
      ${detail ? `<span>${escapeHtml(detail)}</span>` : ""}
    </div>
  `;
}

export function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

export function findGithubRunnerConnection(items = []) {
  return normalizeList(items).find((item) => String(item?.kind || "").trim().toLowerCase() === "github") || null;
}

export function isGithubRunnerConfigured(items = []) {
  const connection = findGithubRunnerConnection(items);
  return !!connection && String(connection.mode || "").trim().toLowerCase() === "real" && String(connection.status || "").trim().toLowerCase() === "success";
}

export function getGithubRunnerNote(items = []) {
  const connection = findGithubRunnerConnection(items);
  return String(connection?.note || "Configure HEART_GITHUB_* values to enable secure workflow dispatch.").trim();
}
