import {
  escapeHtml,
  formatDateTime,
  formatRelative,
  formatStatusCount,
  getModuleLabel,
  renderEmptyState,
  renderStatusBadge
} from "./heart-ui-utils.js";

export function renderModuleHealthGrid(modules = [], {
  title = "Bereiche",
  compact = false
} = {}) {
  if (!Array.isArray(modules) || !modules.length) {
    return renderEmptyState({
      title: "Noch keine Bereichspruefungen.",
      message: "Sobald Heart Tests oder Monitoringdaten hat, erscheinen hier die einzelnen Bereiche."
    });
  }

  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Bereiche</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
      </div>
      <div class="heart-module-grid ${compact ? "heart-module-grid--compact" : ""}">
        ${modules.map((item) => `
          <article class="heart-module-card heart-module-card--${escapeHtml(item.status || "idle")}">
            <div class="heart-module-card__head">
              <strong>${escapeHtml(getModuleLabel(item.module, item.label || item.module || "Bereich"))}</strong>
              ${renderStatusBadge(item.status || "idle")}
            </div>
            <p class="heart-module-card__note">${escapeHtml(item.note || "Keine Notiz vorhanden.")}</p>
            <div class="heart-module-card__meta">
              <span>${escapeHtml(String(item.incidentCount || 0))} Meldungen</span>
              <span>${escapeHtml(item.lastCheckAt ? formatRelative(item.lastCheckAt) : "Noch keine Pruefung")}</span>
            </div>
            ${item.counts && Object.keys(item.counts).length ? `<div class="heart-list-card__meta">
              ${Object.entries(item.counts)
                .filter(([, value]) => Number(value) > 0)
                .map(([status, value]) => escapeHtml(formatStatusCount(status, value)))
                .join(" | ")}
            </div>` : ""}
            ${item.latestFailure ? `<p class="heart-module-card__failure">${escapeHtml(item.latestFailure)}</p>` : ""}
            ${!compact ? `<p class="heart-module-card__timestamp">Letzte Pruefung: ${escapeHtml(item.lastCheckAt ? formatDateTime(item.lastCheckAt) : "-")}</p>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

export function renderModulesView(modules = []) {
  return `
    <div class="heart-view-stack">
      ${renderModuleHealthGrid(modules, { title: "Alle Bereiche im Detail" })}
    </div>
  `;
}
