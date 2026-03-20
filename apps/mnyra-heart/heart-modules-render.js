import {
  escapeHtml,
  formatDateTime,
  formatRelative,
  renderEmptyState,
  renderStatusBadge
} from "./heart-ui-utils.js";

export function renderModuleHealthGrid(modules = [], {
  title = "Module health",
  compact = false
} = {}) {
  if (!Array.isArray(modules) || !modules.length) {
    return renderEmptyState({
      title: "No module checks yet.",
      message: "Heart will show per-module health as soon as smoke, synthetic or monitoring data arrives."
    });
  }

  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Modules</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
      </div>
      <div class="heart-module-grid ${compact ? "heart-module-grid--compact" : ""}">
        ${modules.map((item) => `
          <article class="heart-module-card heart-module-card--${escapeHtml(item.status || "idle")}">
            <div class="heart-module-card__head">
              <strong>${escapeHtml(item.label || item.module || "Unknown")}</strong>
              ${renderStatusBadge(item.status || "idle")}
            </div>
            <p class="heart-module-card__note">${escapeHtml(item.note || "No note recorded.")}</p>
            <div class="heart-module-card__meta">
              <span>${escapeHtml(String(item.incidentCount || 0))} incidents</span>
              <span>${escapeHtml(item.lastCheckAt ? formatRelative(item.lastCheckAt) : "No check")}</span>
            </div>
            ${item.latestFailure ? `<p class="heart-module-card__failure">${escapeHtml(item.latestFailure)}</p>` : ""}
            ${!compact ? `<p class="heart-module-card__timestamp">Last check: ${escapeHtml(item.lastCheckAt ? formatDateTime(item.lastCheckAt) : "-")}</p>` : ""}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

export function renderModulesView(modules = []) {
  return `
    <div class="heart-view-stack">
      ${renderModuleHealthGrid(modules, { title: "Full module health" })}
    </div>
  `;
}
