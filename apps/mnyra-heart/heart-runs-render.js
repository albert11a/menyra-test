import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatRelative,
  getGithubRunnerNote,
  isGithubRunnerConfigured,
  renderEmptyState,
  renderSeverityBadge,
  renderStatusBadge
} from "./heart-ui-utils.js";

function renderRunSummaryList(items = [], selectedRunId = "") {
  if (!items.length) {
    return renderEmptyState({
      title: "No runs recorded.",
      message: "Start a smoke or full synthetic run to populate the execution history.",
      actionLabel: "Start smoke",
      action: "start-smoke"
    });
  }
  return `
    <div class="heart-run-list">
      ${items.map((item) => {
        const selected = String(item.id || "") === String(selectedRunId || "");
        return `
          <button class="heart-run-row ${selected ? "heart-run-row--active" : ""}" data-action="open-run" data-run-id="${escapeHtml(item.id)}">
            <div>
              <strong>${escapeHtml(item.mode === "synthetic" ? "Full synthetic" : "Smoke test")}</strong>
              <p>${escapeHtml(item.summary || "No summary available.")}</p>
            </div>
            <div class="heart-run-row__meta">
              ${renderStatusBadge(item.status || "idle")}
              <span>${escapeHtml(item.startedAt ? formatRelative(item.startedAt) : "-")}</span>
            </div>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderTimeline(detail = {}) {
  if (!detail.timeline?.length) {
    return renderEmptyState({
      title: "No timeline yet.",
      message: "Heartbeat and report updates will populate the execution timeline once a runner posts them."
    });
  }
  return `
    <div class="heart-timeline">
      ${detail.timeline.map((step) => `
        <article class="heart-timeline__item heart-timeline__item--${escapeHtml(step.status || "idle")}">
          <div class="heart-timeline__dot"></div>
          <div class="heart-timeline__body">
            <div class="heart-timeline__head">
              <strong>${escapeHtml(step.title || "Step")}</strong>
              ${renderStatusBadge(step.status || "idle")}
            </div>
            <p>${escapeHtml(step.note || "No detail.")}</p>
            <span>${escapeHtml(step.startedAt ? formatDateTime(step.startedAt) : "-")}${step.endedAt ? ` -> ${escapeHtml(formatDateTime(step.endedAt))}` : ""}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderDetailPanel(detail = null, detailStatus = "idle", detailError = "") {
  if (detailStatus === "loading") {
    return `<section class="heart-section"><div class="heart-loading-block">Loading run detail...</div></section>`;
  }
  if (detailStatus === "error") {
    return `<section class="heart-section"><div class="heart-error-block">${escapeHtml(detailError || "Run detail loading failed.")}</div></section>`;
  }
  if (!detail) {
    return renderEmptyState({
      title: "Select a run.",
      message: "Choose a run from the left side to inspect timeline, artifacts, created synthetic data and cleanup results."
    });
  }
  return `
    <div class="heart-view-stack">
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Run detail</p>
            <h2>${escapeHtml(detail.mode === "synthetic" ? "Full synthetic report" : "Smoke report")}</h2>
          </div>
          <div class="heart-header-actions">
            ${renderStatusBadge(detail.status || "idle")}
            ${detail.github?.htmlUrl ? `<a class="heart-button heart-button--secondary" href="${escapeHtml(detail.github.htmlUrl)}" target="_blank" rel="noreferrer">Open workflow</a>` : ""}
            ${["queued", "running"].includes(detail.status || "") ? `<button class="heart-button heart-button--secondary" data-action="cancel-run" data-run-id="${escapeHtml(detail.id)}">Cancel</button>` : ""}
          </div>
        </div>
        <div class="heart-detail-grid">
          <div><span>Status</span><strong>${escapeHtml(String(detail.status || "idle").toUpperCase())}</strong></div>
          <div><span>Started</span><strong>${escapeHtml(detail.startedAt ? formatDateTime(detail.startedAt) : "-")}</strong></div>
          <div><span>Ended</span><strong>${escapeHtml(detail.endedAt ? formatDateTime(detail.endedAt) : "-")}</strong></div>
          <div><span>Duration</span><strong>${escapeHtml(formatDuration(detail.durationMs || 0))}</strong></div>
          <div><span>Checks</span><strong>${escapeHtml(`${detail.passedChecks || 0} pass / ${detail.failedChecks || 0} fail`)}</strong></div>
          <div><span>Build</span><strong>${escapeHtml(detail.build || detail.branch || "-")}</strong></div>
        </div>
        <p class="heart-detail-summary">${escapeHtml(detail.summary || "No summary available.")}</p>
      </section>
      <section class="heart-section">
        <div class="heart-section__head"><div><p class="heart-eyebrow">Timeline</p><h2>Execution flow</h2></div></div>
        ${renderTimeline(detail)}
      </section>
      <div class="heart-two-column-grid">
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Created test data</p><h2>Synthetic entities</h2></div></div>
          ${detail.createdEntities?.length ? `
            <div class="heart-list-stack">
              ${detail.createdEntities.map((entity) => `
                <article class="heart-list-card">
                  <div class="heart-list-card__head">
                    <div>
                      <strong>${escapeHtml(entity.label || entity.id || "Entity")}</strong>
                      <p>${escapeHtml(entity.summary || entity.type || "Synthetic entity")}</p>
                    </div>
                    ${renderStatusBadge(entity.status || "success")}
                  </div>
                </article>
              `).join("")}
            </div>
          ` : renderEmptyState({ title: "No synthetic entities recorded.", message: "This run did not report created test data." })}
        </section>
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Cleanup</p><h2>Cleanup result</h2></div></div>
          <div class="heart-cleanup-box">
            <div class="heart-cleanup-box__head">
              ${renderStatusBadge(detail.cleanup?.status || "idle")}
              <strong>${escapeHtml(detail.cleanup?.summary || "No cleanup information.")}</strong>
            </div>
            ${detail.cleanup?.items?.length ? `<div class="heart-list-stack">${detail.cleanup.items.map((item) => `
              <article class="heart-list-card">
                <div class="heart-list-card__head"><div><strong>${escapeHtml(item.label || item.id || "Cleanup item")}</strong><p>${escapeHtml(item.note || "No detail")}</p></div>${renderStatusBadge(item.status || "idle")}</div>
              </article>`).join("")}</div>` : ""}
          </div>
        </section>
      </div>
      <div class="heart-two-column-grid">
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Artifacts</p><h2>Output assets</h2></div></div>
          ${detail.artifacts?.length ? `
            <div class="heart-artifact-list">
              ${detail.artifacts.map((artifact) => `<a class="heart-artifact-link" href="${escapeHtml(artifact.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(artifact.label || "Artifact")} ${artifact.sizeLabel ? `<span>${escapeHtml(artifact.sizeLabel)}</span>` : ""}</a>`).join("")}
            </div>
          ` : renderEmptyState({ title: "No artifacts recorded.", message: "Artifacts appear here when the runner uploads them or GitHub exposes them." })}
        </section>
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Failures</p><h2>Failure details</h2></div></div>
          ${detail.failureDetails?.length ? `
            <div class="heart-list-stack">
              ${detail.failureDetails.map((item) => `
                <article class="heart-list-card">
                  <div class="heart-list-card__head">
                    <div>
                      <strong>${escapeHtml(item.title || "Failure")}</strong>
                      <p>${escapeHtml(item.message || item.module || "No detail")}</p>
                    </div>
                    ${renderSeverityBadge(item.severity || "warning")}
                  </div>
                </article>
              `).join("")}
            </div>
          ` : renderEmptyState({ title: "No failure detail.", message: "Successful runs keep this area empty." })}
        </section>
      </div>
    </div>
  `;
}

export function renderRunsView(runsState = {}, connections = []) {
  const items = Array.isArray(runsState.items) ? runsState.items : [];
  const runnerConfigured = isGithubRunnerConfigured(connections);
  const disabledAttr = runsState.pendingAction || !runnerConfigured ? "disabled" : "";
  const runnerNote = runnerConfigured
    ? "Secure GitHub Actions runner is ready."
    : getGithubRunnerNote(connections);
  return `
    <div class="heart-view-stack">
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Execution control</p>
            <h2>Smoke and full synthetic runs</h2>
          </div>
          <div class="heart-header-actions">
            <button class="heart-button heart-button--primary" data-action="start-smoke" ${disabledAttr}>Start Smoke</button>
            <button class="heart-button heart-button--dark" data-action="start-synthetic" ${disabledAttr}>Start Full Synthetic</button>
            <button class="heart-button heart-button--secondary" data-action="refresh-heart">Refresh</button>
          </div>
        </div>
        <div class="heart-run-status-strip">
          <span>${escapeHtml(runsState.pendingAction ? `Pending action: ${runsState.pendingAction}` : "No run action pending.")}</span>
          <span>${escapeHtml(runsState.lastRefreshAt ? `Last refresh ${formatRelative(runsState.lastRefreshAt)}` : "No refresh yet.")}</span>
        </div>
        <p class="heart-section__note">${escapeHtml(runnerNote)}</p>
      </section>
      <div class="heart-runs-layout">
        <section class="heart-section">
          <div class="heart-section__head"><div><p class="heart-eyebrow">Run history</p><h2>Recent runs</h2></div></div>
          ${runsState.status === "loading"
            ? `<div class="heart-loading-block">Loading run history...</div>`
            : runsState.status === "error"
              ? `<div class="heart-error-block">${escapeHtml(runsState.error || "Run history loading failed.")}</div>`
              : renderRunSummaryList(items, runsState.selectedRunId)}
        </section>
        ${renderDetailPanel(runsState.detail, runsState.detailStatus, runsState.detailError)}
      </div>
    </div>
  `;
}
