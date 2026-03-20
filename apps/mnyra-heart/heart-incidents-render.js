import {
  escapeHtml,
  formatDateTime,
  renderEmptyState,
  renderSeverityBadge,
  renderStatusBadge
} from "./heart-ui-utils.js";

function buildSummary(items = []) {
  const active = items.filter((item) => item.status !== "resolved");
  const critical = active.filter((item) => item.severity === "critical");
  const warning = active.filter((item) => item.severity === "warning");
  return { active, critical, warning };
}

function filterIncidents(items = [], filters = {}) {
  return items.filter((item) => {
    if (filters.severity && filters.severity !== "all" && item.severity !== filters.severity) return false;
    if (filters.source && filters.source !== "all" && item.source !== filters.source && item.module !== filters.source) return false;
    if (filters.status && filters.status !== "all" && item.status !== filters.status) return false;
    return true;
  });
}

function buildFilterOptions(items = [], key) {
  return ["all", ...Array.from(new Set(items.map((item) => String(item?.[key] || "").trim()).filter(Boolean)))];
}

export function renderIncidentsView(items = [], filters = {}) {
  const filtered = filterIncidents(items, filters);
  const summary = buildSummary(items);
  const severityOptions = ["all", "info", "warning", "critical"];
  const sourceOptions = buildFilterOptions(items, "source");
  const statusOptions = ["all", ...Array.from(new Set(items.map((item) => item.status).filter(Boolean)))];

  return `
    <div class="heart-view-stack">
      <section class="heart-hero-grid heart-hero-grid--small">
        <article class="heart-kpi-card">
          <p class="heart-eyebrow">Open incidents</p>
          <h2>${escapeHtml(String(summary.active.length))}</h2>
          <p class="heart-kpi-card__summary">Incidents not resolved yet.</p>
        </article>
        <article class="heart-kpi-card heart-kpi-card--critical">
          <p class="heart-eyebrow">Critical</p>
          <h2>${escapeHtml(String(summary.critical.length))}</h2>
          <p class="heart-kpi-card__summary">Immediate attention required.</p>
        </article>
        <article class="heart-kpi-card heart-kpi-card--warning">
          <p class="heart-eyebrow">Warnings</p>
          <h2>${escapeHtml(String(summary.warning.length))}</h2>
          <p class="heart-kpi-card__summary">Degraded but not critical.</p>
        </article>
      </section>
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Filters</p>
            <h2>Incident stream</h2>
          </div>
        </div>
        <div class="heart-filter-row">
          <label class="heart-filter-field">
            <span>Severity</span>
            <select data-incident-filter="severity">
              ${severityOptions.map((value) => `<option value="${escapeHtml(value)}" ${filters.severity === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}
            </select>
          </label>
          <label class="heart-filter-field">
            <span>Source</span>
            <select data-incident-filter="source">
              ${sourceOptions.map((value) => `<option value="${escapeHtml(value)}" ${filters.source === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}
            </select>
          </label>
          <label class="heart-filter-field">
            <span>Status</span>
            <select data-incident-filter="status">
              ${statusOptions.map((value) => `<option value="${escapeHtml(value)}" ${filters.status === value ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}
            </select>
          </label>
        </div>
      </section>
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Recent issues</p>
            <h2>${escapeHtml(String(filtered.length))} incidents shown</h2>
          </div>
        </div>
        ${filtered.length ? `
          <div class="heart-list-stack">
            ${filtered.map((item) => `
              <details class="heart-incident-card">
                <summary>
                  <div>
                    <strong>${escapeHtml(item.title || "Incident")}</strong>
                    <p>${escapeHtml(item.message || "No detail provided.")}</p>
                  </div>
                  <div class="heart-list-card__badges">
                    ${renderSeverityBadge(item.severity || "info")}
                    ${renderStatusBadge(item.status || "open")}
                  </div>
                </summary>
                <div class="heart-incident-card__body">
                  <div class="heart-detail-grid">
                    <div><span>Source</span><strong>${escapeHtml(item.source || "runtime")}</strong></div>
                    <div><span>Module</span><strong>${escapeHtml(item.module || "unknown")}</strong></div>
                    <div><span>Created</span><strong>${escapeHtml(item.createdAt ? formatDateTime(item.createdAt) : "-")}</strong></div>
                    <div><span>Updated</span><strong>${escapeHtml(item.updatedAt ? formatDateTime(item.updatedAt) : "-")}</strong></div>
                    <div><span>Environment</span><strong>${escapeHtml(item.environment || "production")}</strong></div>
                    <div><span>Build</span><strong>${escapeHtml(item.build || "-")}</strong></div>
                  </div>
                  ${item.artifactLinks?.length ? `
                    <div class="heart-artifact-list">
                      ${item.artifactLinks.map((artifact) => `<a class="heart-artifact-link" href="${escapeHtml(artifact.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(artifact.label || "Artifact")}</a>`).join("")}
                    </div>
                  ` : ""}
                </div>
              </details>
            `).join("")}
          </div>
        ` : renderEmptyState({
          title: "No incidents match the current filters.",
          message: "Adjust severity, source or status to inspect a wider incident stream."
        })}
      </section>
    </div>
  `;
}
