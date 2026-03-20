import {
  escapeHtml,
  formatDateTime,
  renderEmptyState,
  renderStatusBadge
} from "./heart-ui-utils.js";

export function renderSettingsView(items = []) {
  return `
    <div class="heart-view-stack">
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Connections</p>
            <h2>Adapters and providers</h2>
          </div>
        </div>
        ${items.length ? `
          <div class="heart-connection-grid">
            ${items.map((item) => `
              <article class="heart-connection-panel heart-connection-panel--${escapeHtml(item.status || "idle")}">
                <div class="heart-connection-panel__head">
                  <div>
                    <strong>${escapeHtml(item.name || "Connection")}</strong>
                    <p>${escapeHtml(item.kind || "internal")}</p>
                  </div>
                  ${renderStatusBadge(item.status || "idle")}
                </div>
                <p class="heart-connection-panel__note">${escapeHtml(item.note || "No note available.")}</p>
                <div class="heart-detail-grid">
                  <div><span>Mode</span><strong>${escapeHtml(item.mode || "-")}</strong></div>
                  <div><span>Checked</span><strong>${escapeHtml(item.lastCheckedAt ? formatDateTime(item.lastCheckedAt) : "-")}</strong></div>
                </div>
                <p class="heart-connection-panel__detail">${escapeHtml(item.detail || "No detail available.")}</p>
              </article>
            `).join("")}
          </div>
        ` : renderEmptyState({
          title: "No connection snapshot available.",
          message: "Heart will show secure runner, monitoring and storage providers here once the first adapter snapshot loads."
        })}
      </section>
      <section class="heart-section">
        <div class="heart-section__head">
          <div>
            <p class="heart-eyebrow">Architecture notes</p>
            <h2>Current integration model</h2>
          </div>
        </div>
        <div class="heart-note-grid">
          <article class="heart-note-card">
            <strong>Secure trigger path</strong>
            <p>UI -> Heart secure backend -> GitHub Actions workflow dispatch. No workflow token exists in browser code.</p>
          </article>
          <article class="heart-note-card">
            <strong>Monitoring path</strong>
            <p>Functions normalize Firestore incidents and secure workflow ingest events before the UI renders them.</p>
          </article>
          <article class="heart-note-card">
            <strong>Sentry placeholder</strong>
            <p>Sentry is intentionally isolated as an adapter slot. It is not coupled into current render code or auth flow.</p>
          </article>
        </div>
      </section>
    </div>
  `;
}
