import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatRelative,
  renderEmptyState,
  renderSeverityBadge,
  renderStatValue,
  renderStatusBadge
} from "./heart-ui-utils.js";
import {
  renderModuleHealthGrid
} from "./heart-modules-render.js";

function renderTopStatusCards(data = {}) {
  const smoke = data.smokeStatus;
  const synthetic = data.syntheticStatus;
  const monitoring = data.liveMonitoringSummary || {};
  return `
    <section class="heart-hero-grid">
      <article class="heart-kpi-card heart-kpi-card--${escapeHtml(data.overallStatus || "idle")}">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Overall status</p>
            <h2>${escapeHtml(String(data.overallStatus || "idle").toUpperCase())}</h2>
          </div>
          ${renderStatusBadge(data.overallStatus || "idle")}
        </div>
        <p class="heart-kpi-card__summary">${escapeHtml(data.overallNote || "No status note available.")}</p>
        <div class="heart-kpi-card__foot">Updated ${escapeHtml(formatRelative(data.updatedAt))}</div>
      </article>
      <article class="heart-kpi-card">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Smoke status</p>
            <h2>${escapeHtml(smoke?.status ? String(smoke.status).toUpperCase() : "IDLE")}</h2>
          </div>
          ${renderStatusBadge(smoke?.status || "idle")}
        </div>
        ${renderStatValue(`${smoke?.passedChecks || 0}/${(smoke?.passedChecks || 0) + (smoke?.failedChecks || 0)} checks`, smoke ? formatDuration(smoke.durationMs) : "No run")}
        <div class="heart-meta-row">
          <span>${escapeHtml(smoke?.summary || "No smoke run recorded.")}</span>
          <span>${escapeHtml(smoke?.startedAt ? formatDateTime(smoke.startedAt) : "-")}</span>
        </div>
      </article>
      <article class="heart-kpi-card">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Full synthetic</p>
            <h2>${escapeHtml(synthetic?.status ? String(synthetic.status).toUpperCase() : "IDLE")}</h2>
          </div>
          ${renderStatusBadge(synthetic?.status || "idle")}
        </div>
        ${renderStatValue(`${synthetic?.createdEntities?.length || 0} entities`, synthetic ? formatDuration(synthetic.durationMs) : "No run")}
        <div class="heart-meta-row">
          <span>${escapeHtml(synthetic?.summary || "No synthetic run recorded.")}</span>
          <span>${escapeHtml(synthetic?.startedAt ? formatDateTime(synthetic.startedAt) : "-")}</span>
        </div>
      </article>
      <article class="heart-kpi-card">
        <div class="heart-kpi-card__head">
          <div>
            <p class="heart-eyebrow">Monitoring</p>
            <h2>${escapeHtml(String(monitoring.activeIncidents || 0))} open</h2>
          </div>
          ${renderStatusBadge((monitoring.criticalIncidents || 0) > 0 ? "critical" : (monitoring.activeIncidents || 0) > 0 ? "warning" : "success")}
        </div>
        ${renderStatValue(`${monitoring.criticalIncidents || 0} critical`, monitoring.latestFailure || "No live failure recorded.")}
        <div class="heart-meta-row">
          <span>Latest monitoring snapshot</span>
          <span>${escapeHtml(formatRelative(data.updatedAt))}</span>
        </div>
      </article>
    </section>
  `;
}

function renderRunControls() {
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Run control</p>
          <h2>Command center</h2>
        </div>
      </div>
      <div class="heart-control-grid">
        <button class="heart-button heart-button--primary" data-action="start-smoke">Start Smoke Test</button>
        <button class="heart-button heart-button--dark" data-action="start-synthetic">Start Full Synthetic</button>
        <button class="heart-button heart-button--secondary" data-action="refresh-heart">Refresh Status</button>
      </div>
    </section>
  `;
}

function renderIncidentPreview(items = []) {
  if (!items.length) {
    return renderEmptyState({
      title: "No incidents.",
      message: "Runtime, runner and workflow incidents will appear here as soon as any event is ingested."
    });
  }
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Latest incidents</p>
          <h2>Active signal</h2>
        </div>
        <button class="heart-link-button" data-nav-key="incidents">Open incidents</button>
      </div>
      <div class="heart-list-stack">
        ${items.slice(0, 5).map((item) => `
          <article class="heart-list-card">
            <div class="heart-list-card__head">
              <div>
                <strong>${escapeHtml(item.title || "Incident")}</strong>
                <p>${escapeHtml(item.message || item.module || "No detail")}</p>
              </div>
              <div class="heart-list-card__badges">
                ${renderSeverityBadge(item.severity || "info")}
                ${renderStatusBadge(item.status || "open")}
              </div>
            </div>
            <div class="heart-list-card__meta">
              <span>${escapeHtml(item.source || "runtime")}</span>
              <span>${escapeHtml(item.module || "unknown")}</span>
              <span>${escapeHtml(item.createdAt ? formatDateTime(item.createdAt) : "-")}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRunHistoryPreview(items = []) {
  if (!items.length) {
    return renderEmptyState({
      title: "No runs yet.",
      message: "Start a smoke or synthetic run to populate run history and reports."
    });
  }
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Run history</p>
          <h2>Recent executions</h2>
        </div>
        <button class="heart-link-button" data-nav-key="runs">Open runs</button>
      </div>
      <div class="heart-list-stack">
        ${items.slice(0, 5).map((item) => `
          <button class="heart-run-preview" data-action="open-run" data-run-id="${escapeHtml(item.id)}">
            <div>
              <strong>${escapeHtml(item.mode === "synthetic" ? "Full synthetic" : "Smoke test")}</strong>
              <p>${escapeHtml(item.summary || "No summary")}</p>
            </div>
            <div class="heart-run-preview__meta">
              ${renderStatusBadge(item.status || "idle")}
              <span>${escapeHtml(item.startedAt ? formatRelative(item.startedAt) : "-")}</span>
            </div>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderConnectionsPreview(items = []) {
  if (!items.length) return "";
  return `
    <section class="heart-section">
      <div class="heart-section__head">
        <div>
          <p class="heart-eyebrow">Connections</p>
          <h2>Provider state</h2>
        </div>
        <button class="heart-link-button" data-nav-key="connections">Open connections</button>
      </div>
      <div class="heart-connection-list">
        ${items.map((item) => `
          <article class="heart-connection-card heart-connection-card--${escapeHtml(item.status || "idle")}">
            <div>
              <strong>${escapeHtml(item.name || "Connection")}</strong>
              <p>${escapeHtml(item.note || "No note")}</p>
            </div>
            <div class="heart-connection-card__meta">
              ${renderStatusBadge(item.status || "idle")}
              <span>${escapeHtml(item.mode || "-")}</span>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

export function renderDashboardView(data = null) {
  if (!data) {
    return renderEmptyState({
      title: "Heart is ready.",
      message: "No dashboard snapshot has been loaded yet. Refresh the control center to request the first monitoring payload.",
      actionLabel: "Refresh now",
      action: "refresh-heart"
    });
  }

  return `
    <div class="heart-view-stack">
      ${renderTopStatusCards(data)}
      <div class="heart-two-column-grid">
        <div class="heart-view-stack">
          ${renderRunControls()}
          ${renderIncidentPreview(data.latestIncidents || [])}
        </div>
        <div class="heart-view-stack">
          ${renderRunHistoryPreview(data.recentRuns || [])}
          ${renderConnectionsPreview(data.connectionsPreview || [])}
        </div>
      </div>
      ${renderModuleHealthGrid(data.moduleHealth || [], { title: "Module health snapshot", compact: true })}
    </div>
  `;
}
