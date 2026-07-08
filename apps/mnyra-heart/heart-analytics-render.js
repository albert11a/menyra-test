// Heart Analytics View: CEO waehlt ein Business und sieht dessen komplette
// Analytics. Nutzt die geteilten Dashboard-Renderer aus menyra-social.

import {
  escapeHtml
} from "./heart-ui-utils.js";
import {
  renderAnalyticsRangeFilter,
  renderAnalyticsDashboard,
  renderAnalyticsLoadingState,
  renderAnalyticsEmptyState,
  renderAnalyticsErrorState,
  ANALYTICS_DASHBOARD_CSS
} from "../menyra-social/core/analytics/analytics-dashboard-render-utils.js";

const STYLE_ELEMENT_ID = "mnyraAnalyticsStyles";

function ensureStyles() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ELEMENT_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = ANALYTICS_DASHBOARD_CSS;
  document.head?.appendChild(style);
}

function renderBusinessPicker(analytics = {}) {
  const businesses = Array.isArray(analytics.businesses) ? analytics.businesses : [];
  const query = String(analytics.businessQuery || "").trim().toLowerCase();
  const filtered = query
    ? businesses.filter((row) => `${row.name} ${row.city} ${row.id}`.toLowerCase().includes(query))
    : businesses;
  const options = filtered.slice(0, 200).map((row) => `
    <option value="${escapeHtml(row.id)}" ${row.id === analytics.selectedBusinessId ? "selected" : ""}>
      ${escapeHtml(row.name)}${row.city ? ` · ${escapeHtml(row.city)}` : ""}
    </option>
  `).join("");
  return `
    <div class="mnyra-an__card" style="margin-bottom:14px;">
      <p class="mnyra-an__kpi-label" style="margin-bottom:8px;">Business auswählen</p>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <input
          type="search"
          id="analyticsBusinessSearch"
          data-analytics-business-search
          value="${escapeHtml(analytics.businessQuery || "")}"
          placeholder="Suchen (Name, Stadt, ID)…"
          style="flex:1 1 180px; min-width:0; border:1px solid var(--an-border); background:var(--an-plane); color:var(--an-ink); border-radius:12px; padding:9px 12px; font-size:12px; font-weight:600;"
        />
        <select
          data-analytics-business-select
          style="flex:1 1 220px; min-width:0; border:1px solid var(--an-border); background:var(--an-plane); color:var(--an-ink); border-radius:12px; padding:9px 12px; font-size:12px; font-weight:700;"
        >
          <option value="">${businesses.length ? "Bitte wählen…" : "Keine Businesses gefunden"}</option>
          ${options}
        </select>
      </div>
      ${analytics.selectedBusinessName
        ? `<p class="mnyra-an__empty-note">Aktiv: ${escapeHtml(analytics.selectedBusinessName)} (${escapeHtml(analytics.selectedBusinessId)})</p>`
        : ""}
    </div>
  `;
}

export function renderHeartAnalyticsView(analytics = {}) {
  ensureStyles();
  let body = "";
  if (analytics.businessesStatus === "loading" && !(analytics.businesses || []).length) {
    body = renderAnalyticsLoadingState();
  } else if (analytics.businessesStatus === "error") {
    body = renderAnalyticsErrorState({ message: analytics.businessesError || "Businesses konnten nicht geladen werden." });
  } else if (!analytics.selectedBusinessId) {
    body = renderAnalyticsEmptyState({
      title: "Business auswählen",
      body: "Wähle oben ein Business aus, um dessen komplette Analytics zu sehen."
    });
  } else if (analytics.status === "loading" && !analytics.model) {
    body = renderAnalyticsLoadingState();
  } else if (analytics.status === "error") {
    body = renderAnalyticsErrorState({ message: analytics.error });
  } else {
    const dashboard = renderAnalyticsDashboard(analytics.model, { currency: "€" });
    body = analytics.status === "loading"
      ? `<div style="opacity:0.55; pointer-events:none;">${dashboard}</div>`
      : dashboard;
  }
  return `
    <section class="heart-section mnyra-an mnyra-an--dark" data-analytics-root>
      ${renderBusinessPicker(analytics)}
      ${analytics.selectedBusinessId
        ? renderAnalyticsRangeFilter({
          rangeKey: analytics.rangeKey || "7d",
          customFrom: analytics.customFrom || "",
          customTo: analytics.customTo || ""
        })
        : ""}
      ${body}
    </section>
  `;
}
